"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Star,
  Settings,
  ArrowUpDown,
  Info,
  ArrowLeft,
  AlertTriangle,
  Percent,
} from "lucide-react";
import dynamic from "next/dynamic";
import { TradingViewWidget } from "@/components/tradingview-widget";

const ConnectWalletButton = dynamic(
  () => import("@/components/ConnectWalletButton"),
  { ssr: false },
);

/* ================================================================
   DATA
   ================================================================ */

function generateOrderBook(
  basePrice: number,
  rows: number,
  side: "bid" | "ask"
) {
  const orders = [];
  for (let i = 0; i < rows; i++) {
    const offset = (i + 1) * (Math.random() * 2 + 0.5);
    const price = side === "bid" ? basePrice - offset : basePrice + offset;
    const size = parseFloat((Math.random() * 2.5 + 0.01).toFixed(4));
    const total = parseFloat((size * (i + 1) * 0.6 + size).toFixed(4));
    const depthPercent = Math.min(Math.random() * 80 + 10, 95);
    orders.push({
      price: price.toFixed(2),
      size: size.toFixed(4),
      total: total.toFixed(4),
      depthPercent,
    });
  }
  return side === "ask" ? orders.reverse() : orders;
}

const BASE_PRICE = 43271.5;

const MARKETS = [
  { symbol: "BTC-PERP", tv: "BINANCE:BTCUSDT", price: "43,271.50", change: "+2.34%", positive: true },
  { symbol: "ETH-PERP", tv: "BINANCE:ETHUSDT", price: "2,284.67", change: "+1.87%", positive: true },
  { symbol: "SOL-PERP", tv: "BINANCE:SOLUSDT", price: "98.42", change: "+5.12%", positive: true },
  { symbol: "ARB-PERP", tv: "BINANCE:ARBUSDT", price: "1.24", change: "-0.83%", positive: false },
];

const POSITIONS = [
  {
    symbol: "BTC-PERP", side: "Long", size: "0.5200", leverage: "10x",
    entry: "42,180.00", mark: "43,271.50", liq: "38,420.00",
    pnl: "+568.38", pnlPercent: "+2.59%", profitable: true,
  },
  {
    symbol: "ETH-PERP", side: "Short", size: "4.2000", leverage: "5x",
    entry: "2,310.50", mark: "2,284.67", liq: "2,580.00",
    pnl: "+108.49", pnlPercent: "+1.12%", profitable: true,
  },
  {
    symbol: "SOL-PERP", side: "Long", size: "120.00", leverage: "20x",
    entry: "100.20", mark: "98.42", liq: "95.30",
    pnl: "-213.60", pnlPercent: "-1.78%", profitable: false,
  },
];

const OPEN_ORDERS = [
  { symbol: "BTC-PERP", type: "Limit", side: "Buy", price: "42,500.00", size: "0.2500", filled: "0%", time: "12:34:21" },
  { symbol: "ETH-PERP", type: "Limit", side: "Sell", price: "2,400.00", size: "2.0000", filled: "0%", time: "11:02:45" },
];

/* ================================================================
   ORDER BOOK
   ================================================================ */

function OrderBook() {
  const asks = useMemo(() => generateOrderBook(BASE_PRICE, 8, "ask"), []);
  const bids = useMemo(() => generateOrderBook(BASE_PRICE, 8, "bid"), []);

  return (
    <div className="text-[11px] font-mono">
      {/* Header */}
      <div className="grid grid-cols-3 px-4 py-2 text-zinc-500 text-[10px] border-b border-zinc-800/50">
        <span>Price (USD)</span>
        <span className="text-right">Size (BTC)</span>
        <span className="text-right">Total</span>
      </div>

      {/* Asks */}
      <div className="space-y-0">
        {asks.map((o, i) => (
          <div key={`a-${i}`} className="relative grid grid-cols-3 px-4 py-[5px] items-center hover:bg-zinc-800/30 cursor-pointer">
            <div className="absolute right-0 top-0 bottom-0 bg-rose-500/[0.06] rounded-l-sm" style={{ width: `${o.depthPercent}%` }} />
            <span className="relative text-rose-400">{o.price}</span>
            <span className="relative text-zinc-300 text-right">{o.size}</span>
            <span className="relative text-zinc-500 text-right">{o.total}</span>
          </div>
        ))}
      </div>

      {/* Spread */}
      <div className="flex items-center justify-center py-2.5 border-y border-zinc-800/50 my-0.5">
        <span className="text-base font-semibold text-zinc-100 font-mono">43,271.50</span>
        <span className="text-[10px] text-emerald-400 ml-2">+2.34%</span>
      </div>

      {/* Bids */}
      <div className="space-y-0">
        {bids.map((o, i) => (
          <div key={`b-${i}`} className="relative grid grid-cols-3 px-4 py-[5px] items-center hover:bg-zinc-800/30 cursor-pointer">
            <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/[0.06] rounded-l-sm" style={{ width: `${o.depthPercent}%` }} />
            <span className="relative text-emerald-400">{o.price}</span>
            <span className="relative text-zinc-300 text-right">{o.size}</span>
            <span className="relative text-zinc-500 text-right">{o.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   ORDER ENTRY
   ================================================================ */

function OrderEntry() {
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [leverage, setLeverage] = useState(10);
  const [price, setPrice] = useState("43,271.50");
  const [size, setSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState<"BTC" | "USD">("BTC");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  const leverageMarks = [1, 2, 5, 10, 20];

  return (
    <div className="space-y-4">
      {/* Order Type */}
      <div className="flex bg-zinc-800/50 rounded-lg p-1">
        {(["limit", "market"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setOrderType(type)}
            className={`flex-1 py-2 text-[12px] font-medium tracking-wide uppercase rounded-md transition-all ${
              orderType === type
                ? "bg-zinc-700 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Leverage */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-zinc-400 text-[12px]">Leverage</span>
          <span className="font-mono text-zinc-100 text-[12px] font-semibold bg-zinc-800 px-2.5 py-1 rounded-md">
            {leverage}x
          </span>
        </div>
        <div className="relative h-7 flex items-center">
          <div className="absolute left-0 right-0 h-1.5 bg-zinc-800 rounded-full" />
          <div
            className="absolute left-0 h-1.5 bg-indigo-600 rounded-full transition-all"
            style={{ width: `${((leverage - 1) / 19) * 100}%` }}
          />
          <input
            type="range" min="1" max="20" value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="absolute w-full h-7 opacity-0 cursor-pointer"
            aria-label="Leverage"
          />
          <div
            className="absolute w-4 h-4 rounded-full bg-indigo-500 border-2 border-zinc-900 pointer-events-none transition-all"
            style={{ left: `calc(${((leverage - 1) / 19) * 100}% - 8px)` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          {leverageMarks.map((m) => (
            <button
              key={m}
              onClick={() => setLeverage(m)}
              className={`text-[10px] font-mono transition-colors ${
                leverage === m ? "text-indigo-400" : "text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {m}x
            </button>
          ))}
        </div>
      </div>

      {/* Price Input (Limit) */}
      {orderType === "limit" && (
        <div>
          <label className="text-zinc-400 text-[12px] mb-1.5 block">Price</label>
          <div className="flex items-center bg-zinc-800/60 border border-zinc-700/50 rounded-lg h-10 overflow-hidden">
            <button className="px-3 text-zinc-500 hover:text-zinc-300 transition-colors h-full text-lg" aria-label="Decrease price">-</button>
            <input
              type="text" value={price} onChange={(e) => setPrice(e.target.value)}
              className="flex-1 bg-transparent text-center text-zinc-100 font-mono text-[13px] outline-none"
              aria-label="Order price"
            />
            <button className="px-3 text-zinc-500 hover:text-zinc-300 transition-colors h-full text-lg" aria-label="Increase price">+</button>
            <span className="text-zinc-500 text-[10px] pr-3 font-mono">USD</span>
          </div>
        </div>
      )}

      {/* Size Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-zinc-400 text-[12px]">Size</label>
          <button
            onClick={() => setSizeUnit(sizeUnit === "BTC" ? "USD" : "BTC")}
            className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-indigo-400 transition-colors"
          >
            <ArrowUpDown size={10} />
            {sizeUnit}
          </button>
        </div>
        <div className="flex items-center bg-zinc-800/60 border border-zinc-700/50 rounded-lg h-10">
          <input
            type="text" value={size} onChange={(e) => setSize(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent px-3 text-zinc-100 font-mono text-[13px] outline-none placeholder-zinc-700"
            aria-label="Order size"
          />
          <button className="text-[10px] text-indigo-400 hover:text-indigo-300 px-2 font-medium transition-colors">MAX</button>
          <span className="text-zinc-500 text-[10px] pr-3 font-mono">{sizeUnit}</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 mt-2">
          {["10%", "25%", "50%", "100%"].map((pct) => (
            <button key={pct} className="py-1.5 text-[10px] font-mono text-zinc-500 bg-zinc-800/40 border border-zinc-700/30 rounded-md hover:text-zinc-300 hover:border-zinc-600 transition-colors">
              {pct}
            </button>
          ))}
        </div>
      </div>

      {/* Trigger Price */}
      <div>
        <label className="flex items-center gap-1.5 text-zinc-400 text-[12px] mb-1.5">
          <AlertTriangle size={11} className="text-zinc-500" />
          Trigger Price
        </label>
        <div className="flex items-center bg-zinc-800/60 border border-zinc-700/50 rounded-lg h-9">
          <input
            type="text" value={triggerPrice} onChange={(e) => setTriggerPrice(e.target.value)}
            placeholder="Stop / Conditional"
            className="flex-1 bg-transparent px-3 text-zinc-100 font-mono text-[12px] outline-none placeholder-zinc-700"
            aria-label="Trigger price"
          />
          <span className="text-zinc-500 text-[10px] pr-3 font-mono">USD</span>
        </div>
      </div>

      {/* Slippage */}
      <div>
        <label className="flex items-center gap-1.5 text-zinc-400 text-[12px] mb-1.5">
          <Percent size={11} className="text-zinc-500" />
          Slippage Tolerance
        </label>
        <div className="flex items-center gap-1.5">
          {["0.1", "0.5", "1.0"].map((val) => (
            <button
              key={val}
              onClick={() => setSlippage(val)}
              className={`flex-1 py-1.5 text-[11px] font-mono rounded-md border transition-colors ${
                slippage === val
                  ? "border-indigo-500/40 bg-indigo-500/10 text-indigo-400"
                  : "border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
              }`}
            >
              {val}%
            </button>
          ))}
          <div className="flex-1 flex items-center bg-zinc-800/60 border border-zinc-700/50 rounded-md h-[34px]">
            <input
              type="text" value={slippage} onChange={(e) => setSlippage(e.target.value)}
              className="w-full bg-transparent px-2 text-zinc-100 font-mono text-[11px] outline-none text-center"
              aria-label="Custom slippage"
            />
            <span className="text-zinc-500 text-[10px] pr-2">%</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-800" />

      {/* Summary */}
      <div className="space-y-2 text-[11px]">
        {[
          { label: "Available Balance", value: "12,840.00 USDC" },
          { label: "Order Value", value: size ? `${(parseFloat(size.replace(/,/g, "") || "0") * 43271.5).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD` : "-- USD" },
          { label: "Est. Liq. Price", value: "--" },
          { label: "Fee (Maker / Taker)", value: "0.02% / 0.05%" },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-zinc-500 flex items-center gap-1">
              {row.label}
              <Info size={10} className="text-zinc-600" />
            </span>
            <span className="font-mono text-zinc-300">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Buy / Sell */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button className="h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[13px] tracking-wide transition-colors">
          Buy / Long
        </button>
        <button className="h-11 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[13px] tracking-wide transition-colors">
          Sell / Short
        </button>
      </div>

      <div className="text-[10px] text-zinc-600 flex items-center justify-between">
        <span>Margin Mode: <span className="text-zinc-400">Cross</span></span>
        <button className="text-indigo-400 hover:text-indigo-300 transition-colors">Switch</button>
      </div>
    </div>
  );
}

/* ================================================================
   POSITIONS TABLE
   ================================================================ */

function PositionsPanel() {
  const [tab, setTab] = useState<"positions" | "orders" | "history">("positions");

  return (
    <>
      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-zinc-800/50 px-2">
        {[
          { key: "positions" as const, label: `Positions (${POSITIONS.length})` },
          { key: "orders" as const, label: `Open Orders (${OPEN_ORDERS.length})` },
          { key: "history" as const, label: "History" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-[12px] tracking-wide border-b-2 transition-colors ${
              tab === t.key
                ? "border-indigo-500 text-zinc-100 font-medium"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {tab === "positions" && (
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-zinc-500 text-left">
                <th className="pl-4 py-2.5 font-medium">Symbol</th>
                <th className="py-2.5 font-medium">Side</th>
                <th className="py-2.5 font-medium">Size</th>
                <th className="py-2.5 font-medium">Leverage</th>
                <th className="py-2.5 font-medium">Entry</th>
                <th className="py-2.5 font-medium">Mark</th>
                <th className="py-2.5 font-medium">Liq. Price</th>
                <th className="py-2.5 font-medium text-right pr-4">PnL (ROE%)</th>
              </tr>
            </thead>
            <tbody>
              {POSITIONS.map((pos) => (
                <tr key={pos.symbol + pos.side} className="border-t border-zinc-800/30 hover:bg-zinc-800/20">
                  <td className="pl-4 py-3 text-zinc-100 font-semibold">{pos.symbol}</td>
                  <td className={pos.side === "Long" ? "text-emerald-400" : "text-rose-400"}>{pos.side}</td>
                  <td className="text-zinc-300">{pos.size}</td>
                  <td className="text-zinc-400">{pos.leverage}</td>
                  <td className="text-zinc-300">{pos.entry}</td>
                  <td className="text-zinc-300">{pos.mark}</td>
                  <td className="text-zinc-500">{pos.liq}</td>
                  <td className={`text-right pr-4 font-semibold ${pos.profitable ? "text-emerald-400" : "text-rose-400"}`}>
                    {pos.pnl} <span className="text-zinc-500">({pos.pnlPercent})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "orders" && (
          <table className="w-full text-[11px] font-mono">
            <thead>
              <tr className="text-zinc-500 text-left">
                <th className="pl-4 py-2.5 font-medium">Symbol</th>
                <th className="py-2.5 font-medium">Type</th>
                <th className="py-2.5 font-medium">Side</th>
                <th className="py-2.5 font-medium">Price</th>
                <th className="py-2.5 font-medium">Size</th>
                <th className="py-2.5 font-medium">Filled</th>
                <th className="py-2.5 font-medium text-right pr-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {OPEN_ORDERS.map((order, i) => (
                <tr key={i} className="border-t border-zinc-800/30 hover:bg-zinc-800/20">
                  <td className="pl-4 py-3 text-zinc-100 font-semibold">{order.symbol}</td>
                  <td className="text-zinc-400">{order.type}</td>
                  <td className={order.side === "Buy" ? "text-emerald-400" : "text-rose-400"}>{order.side}</td>
                  <td className="text-zinc-300">{order.price}</td>
                  <td className="text-zinc-300">{order.size}</td>
                  <td className="text-zinc-500">{order.filled}</td>
                  <td className="text-zinc-500 text-right pr-4">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "history" && (
          <div className="flex items-center justify-center py-12 text-zinc-600 text-[12px]">
            No recent trade history
          </div>
        )}
      </div>
    </>
  );
}

/* ================================================================
   PAGE
   ================================================================ */

export default function TradePage() {
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]);
  const [marketDropdown, setMarketDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 font-[family-name:var(--font-geist-sans)]">
      {/* ── TOP NAV ── */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-8 h-14 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors mr-1">
            <ArrowLeft size={16} />
          </Link>
          <Link href="/" className="text-base font-bold tracking-wider text-zinc-100 mr-2">
            NEXUS
          </Link>

          {/* ── Trade / Portfolio Tab ── */}
          <div className="flex items-center gap-0.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-1 mr-2">
            <div className="px-3 py-1.5 text-[12px] font-medium tracking-wide rounded-md bg-zinc-700 text-zinc-100 shadow-sm">
              Trade
            </div>
            <Link
              href="/portfolio"
              className="px-3 py-1.5 text-[12px] font-medium tracking-wide rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Portfolio
            </Link>
          </div>

          {/* Market Selector */}
          <div className="relative">
            <button
              onClick={() => setMarketDropdown(!marketDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg hover:border-zinc-600 transition-colors"
            >
              <Star size={12} className="text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-100 font-mono">{selectedMarket.symbol}</span>
              <ChevronDown size={12} className={`text-zinc-500 transition-transform ${marketDropdown ? "rotate-180" : ""}`} />
            </button>

            {marketDropdown && (
              <div className="absolute z-50 top-full left-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg overflow-hidden">
                {MARKETS.map((m) => (
                  <button
                    key={m.symbol}
                    onClick={() => { setSelectedMarket(m); setMarketDropdown(false); }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-800/50 transition-colors text-[12px] font-mono ${
                      m.symbol === selectedMarket.symbol ? "bg-indigo-500/[0.06]" : ""
                    }`}
                  >
                    <span className="text-zinc-100 font-semibold">{m.symbol}</span>
                    <div className="text-right">
                      <div className="text-zinc-300">{m.price}</div>
                      <div className={m.positive ? "text-emerald-400 text-[10px]" : "text-rose-400 text-[10px]"}>{m.change}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6 ml-3">
            <span className="text-lg font-mono font-bold text-zinc-100">{selectedMarket.price}</span>
            {[
              { label: "24h Change", value: selectedMarket.change, color: selectedMarket.positive ? "text-emerald-400" : "text-rose-400" },
              { label: "24h High", value: "43,890.00", color: "text-zinc-300" },
              { label: "24h Low", value: "42,150.00", color: "text-zinc-300" },
              { label: "Volume", value: "1.24B", color: "text-zinc-300" },
              { label: "Funding", value: "0.010%", color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[10px] text-zinc-500 tracking-wide mb-0.5">{s.label}</div>
                <div className={`text-[12px] font-mono font-medium ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <ConnectWalletButton />
            <Settings size={16} className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-[1600px] mx-auto px-6 sm:px-8 py-6 space-y-6">
        {/* Top row: Chart + Order Entry */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chart Card */}
          <div className="flex-1 lg:w-[75%] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            {/* Chart container */}
            <div className="h-[480px] lg:h-[540px]">
              <TradingViewWidget symbol={selectedMarket.tv} />
            </div>

            {/* Order Book (inside chart card) */}
            <div className="border-t border-zinc-800/50">
              <div className="px-4 py-2.5">
                <span className="text-[12px] text-zinc-400 font-medium">Order Book</span>
              </div>
              <OrderBook />
            </div>
          </div>

          {/* Order Entry Card */}
          <div className="lg:w-[25%] min-w-[300px]">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg sticky top-20">
              <h2 className="text-[14px] font-semibold text-zinc-200 mb-4">Place Order</h2>
              <OrderEntry />
            </div>
          </div>
        </div>

        {/* Bottom: Positions / Orders */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
          <PositionsPanel />
        </div>
      </main>
    </div>
  );
}
