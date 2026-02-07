"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Settings,
<<<<<<< HEAD
  Plus,
=======
>>>>>>> 2dd58ea (dWallet creation is done)
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Globe,
  Copy,
  Check,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const ConnectWalletButton = dynamic(
  () => import("@/components/ConnectWalletButton"),
  { ssr: false },
);

const OnChainPortfolio = dynamic(
  () => import("@/components/OnChainPortfolio"),
  { ssr: false },
);

const ConnectedWallets = dynamic(
  () => import("@/components/OnChainPortfolio").then((mod) => mod.ConnectedWallets),
  { ssr: false },
);

/* ================================================================
   DATA
   ================================================================ */

const ASSETS = [
  {
    symbol: "SOL",
    name: "Solana",
    chain: { id: "solana", name: "Solana", color: "#9945FF" },
    balance: 48.25,
    value: 7234.5,
    price: 149.94,
    change24h: 5.12,
    allocation: 56.34,
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    chain: { id: "arbitrum", name: "Arbitrum", color: "#28A0F0" },
    balance: 3200.0,
    value: 3200.0,
    price: 1.0,
    change24h: 0.01,
    allocation: 24.92,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    chain: { id: "ethereum", name: "Ethereum", color: "#627EEA" },
    balance: 0.92,
    value: 2406.0,
    price: 2615.22,
    change24h: -1.23,
    allocation: 18.74,
  },
];

const PERFORMANCE_DATA = [
  { date: "Jan 31", value: 12200 },
  { date: "Feb 1", value: 12350 },
  { date: "Feb 2", value: 12180 },
  { date: "Feb 3", value: 12420 },
  { date: "Feb 4", value: 12580 },
  { date: "Feb 5", value: 12710 },
  { date: "Feb 6", value: 12840 },
];

const ACTIVITIES = [
  {
    id: "1",
    type: "swap" as const,
    description: "Swapped USDC → SOL",
    fromChain: "Arbitrum",
    toChain: "Solana",
    value: 500.0,
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "bridge" as const,
    description: "Bridged ETH to Arbitrum",
    fromChain: "Ethereum",
    toChain: "Arbitrum",
    value: 1200.0,
    timestamp: "5 hours ago",
  },
  {
    id: "3",
    type: "swap" as const,
    description: "Swapped SOL → USDC",
    fromChain: "Solana",
    toChain: "Solana",
    value: 320.0,
    timestamp: "1 day ago",
  },
  {
    id: "4",
    type: "bridge" as const,
    description: "Bridged USDC to Solana",
    fromChain: "Arbitrum",
    toChain: "Solana",
    value: 800.0,
    timestamp: "2 days ago",
  },
  {
    id: "5",
    type: "swap" as const,
    description: "Swapped ETH → USDC",
    fromChain: "Ethereum",
    toChain: "Ethereum",
    value: 2100.0,
    timestamp: "3 days ago",
  },
];

const WALLETS = [
  { address: "7xKXm9...9mPq", fullAddress: "7xKXm9abc123def456ghij789mPq", chain: "solana" as const, label: "Solana", balance: 7234.5 },
  { address: "0x3Fa8...2D4e", fullAddress: "0x3Fa8bc91def234567890abcde2D4e", chain: "evm" as const, label: "EVM", balance: 5606.0 },
];

const NET_WORTH = 12840.5;
const CHANGE_24H = 245.32;
const CHANGE_24H_PERCENT = 1.95;

const ALLOCATION_COLORS: Record<string, string> = {
  SOL: "#9945FF",
  USDC: "#28A0F0",
  ETH: "#627EEA",
};

/* ================================================================
   CHAIN ICON
   ================================================================ */

function ChainIcon({ chainId, className = "h-4 w-4" }: { chainId: string; className?: string }) {
  switch (chainId) {
    case "solana":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="12" fill="#9945FF" fillOpacity="0.15" />
          <path d="M7 15.5L9.5 13H17L14.5 15.5H7Z" fill="#9945FF" />
          <path d="M7 8.5L9.5 11H17L14.5 8.5H7Z" fill="#9945FF" />
          <path d="M7 12L9.5 9.5H17L14.5 12H7Z" fill="#14F195" />
        </svg>
      );
    case "ethereum":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="12" fill="#627EEA" fillOpacity="0.15" />
          <path d="M12 4L12 9.5L16.5 12L12 4Z" fill="#627EEA" fillOpacity="0.6" />
          <path d="M12 4L7.5 12L12 9.5V4Z" fill="#627EEA" />
          <path d="M12 16.5L12 20L16.5 13L12 16.5Z" fill="#627EEA" fillOpacity="0.6" />
          <path d="M12 20V16.5L7.5 13L12 20Z" fill="#627EEA" />
        </svg>
      );
    case "arbitrum":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="12" fill="#28A0F0" fillOpacity="0.15" />
          <path d="M12 5L7 14L12 12L17 14L12 5Z" fill="#28A0F0" />
          <path d="M12 13L7 15L12 19L17 15L12 13Z" fill="#28A0F0" fillOpacity="0.6" />
        </svg>
      );
    default:
      return <div className={`rounded-full bg-zinc-700 ${className}`} />;
  }
}

/* ================================================================
   SMART WALLET BADGE
   ================================================================ */

function WalletBadge({ wallet }: { wallet: typeof WALLETS[number] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.fullAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-full">
      <ChainIcon
        chainId={wallet.chain === "solana" ? "solana" : "ethereum"}
        className="h-4 w-4"
      />
      <span className="text-sm font-mono text-zinc-300">{wallet.address}</span>
      <span className="text-sm font-mono text-zinc-500">
        ${wallet.balance.toLocaleString("en-US", { maximumFractionDigits: 0 })}
      </span>
      <button
        onClick={handleCopy}
        className="text-zinc-600 hover:text-zinc-300 transition-colors"
        aria-label="Copy address"
      >
        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
      </button>
    </div>
  );
}

/* ================================================================
   PERFORMANCE CHART (with segmented control)
   ================================================================ */

function PerformanceChart() {
  const [timeframe, setTimeframe] = useState("7D");
  const [chartMode, setChartMode] = useState<"value" | "pnl">("value");
  const timeframes = ["24H", "7D", "1M", "3M", "ALL"];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50">
        {/* Segmented Control: Portfolio Value / Daily PnL */}
        <div className="flex items-center gap-0.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-1">
          <button
            onClick={() => setChartMode("value")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              chartMode === "value"
                ? "bg-zinc-700 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Portfolio Value
          </button>
          <button
            onClick={() => setChartMode("pnl")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              chartMode === "pnl"
                ? "bg-zinc-700 text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Daily PnL
          </button>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded text-sm font-mono transition-colors ${
                timeframe === tf
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-[280px] px-2 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={PERFORMANCE_DATA}>
            <defs>
              <linearGradient id="perfGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#27272a"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
            />
            <YAxis
              domain={["dataMin - 100", "dataMax + 100"]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#71717a", fontSize: 12 }}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
              width={55}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "12px",
                color: "#e4e4e7",
                fontSize: "13px",
                fontFamily: "var(--font-geist-mono), monospace",
              }}
              formatter={(value: number | undefined) => [
                value != null ? `$${value.toLocaleString()}` : "$0",
                chartMode === "value" ? "Portfolio Value" : "Daily PnL",
              ]}
              labelStyle={{ color: "#71717a" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#perfGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ================================================================
   ACTIVITY HISTORY
   ================================================================ */

const activityIcons: Record<string, typeof ArrowRightLeft> = {
  swap: ArrowRightLeft,
  bridge: ArrowUpRight,
  send: ArrowUpRight,
  receive: ArrowDownLeft,
};

const activityColors: Record<string, string> = {
  swap: "text-indigo-400 bg-indigo-500/[0.08]",
  bridge: "text-blue-400 bg-blue-500/[0.08]",
  send: "text-rose-400 bg-rose-500/[0.08]",
  receive: "text-emerald-400 bg-emerald-500/[0.08]",
};

function ActivityPanel() {
  const [tab, setTab] = useState<"all" | "swaps" | "bridges">("all");

  const filtered = useMemo(() => {
    if (tab === "all") return ACTIVITIES;
    if (tab === "swaps") return ACTIVITIES.filter((a) => a.type === "swap");
    return ACTIVITIES.filter((a) => a.type === "bridge");
  }, [tab]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-zinc-800/50 px-2">
        {[
          { key: "all" as const, label: `All (${ACTIVITIES.length})` },
          { key: "swaps" as const, label: "Swaps" },
          { key: "bridges" as const, label: "Bridges" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm tracking-wide border-b-2 transition-colors ${
              tab === t.key
                ? "border-indigo-500 text-zinc-100 font-medium"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 divide-y divide-zinc-800/30 overflow-y-auto">
        {filtered.map((activity) => {
          const Icon = activityIcons[activity.type] ?? ArrowRightLeft;
          const colorClass = activityColors[activity.type] ?? "text-zinc-400 bg-zinc-800";
          return (
            <div
              key={activity.id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-800/20 transition-colors cursor-pointer"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-zinc-200 truncate">{activity.description}</p>
                <p className="text-sm text-zinc-600">
                  {activity.fromChain} → {activity.toChain}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-mono text-zinc-300">
                  ${activity.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-zinc-600">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================
   ASSET TABLE (with Actions column)
   ================================================================ */

function AssetTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="text-zinc-500 text-left">
            <th className="pl-6 py-3 font-medium">Asset</th>
            <th className="py-3 font-medium">Chain</th>
            <th className="py-3 font-medium text-right">Balance</th>
            <th className="py-3 font-medium text-right">Value</th>
            <th className="py-3 font-medium text-right">24h</th>
            <th className="py-3 font-medium text-right pr-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ASSETS.map((asset) => (
            <tr
              key={`${asset.symbol}-${asset.chain.id}`}
              className="border-t border-zinc-800/30 hover:bg-zinc-800/20 transition-colors"
            >
              <td className="pl-6 py-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold"
                    style={{
                      backgroundColor: asset.chain.color + "18",
                      color: asset.chain.color,
                    }}
                  >
                    {asset.symbol[0]}
                  </div>
                  <div>
                    <span className="text-zinc-100 font-semibold">{asset.symbol}</span>
                    <span className="text-zinc-500 ml-2">{asset.name}</span>
                  </div>
                </div>
              </td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <ChainIcon chainId={asset.chain.id} className="h-4 w-4" />
                  <span className="text-zinc-400">{asset.chain.name}</span>
                </div>
              </td>
              <td className="py-4 text-right text-zinc-300">
                <div>{asset.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>
                <div className="text-zinc-600">${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
              </td>
              <td className="py-4 text-right text-zinc-100 font-semibold">
                ${asset.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
              <td className={`py-4 text-right font-semibold ${asset.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
              </td>
              <td className="py-4 text-right pr-6">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    aria-label={`Swap ${asset.symbol}`}
                  >
                    <RefreshCw size={14} />
                    <span className="text-sm">Swap</span>
                  </button>
                  <button
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    aria-label={`Bridge ${asset.symbol}`}
                  >
                    <Globe size={14} />
                    <span className="text-sm">Bridge</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================
   ALLOCATION BAR
   ================================================================ */

function AllocationPanel() {
  return (
    <div className="space-y-5">
      {/* Stacked Bar */}
      <div className="flex h-2.5 overflow-hidden rounded-full bg-zinc-800">
        {ASSETS.map((asset) => (
          <div
            key={`${asset.symbol}-${asset.chain.id}`}
            className="transition-all duration-500"
            style={{
              width: `${asset.allocation}%`,
              backgroundColor: ALLOCATION_COLORS[asset.symbol] ?? "#71717a",
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {ASSETS.map((asset) => (
          <div
            key={`${asset.symbol}-${asset.chain.id}`}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: ALLOCATION_COLORS[asset.symbol] ?? "#71717a" }}
              />
              <span className="text-sm text-zinc-300">{asset.symbol}</span>
              <span className="text-sm text-zinc-600">{asset.chain.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-mono text-zinc-400">{asset.allocation.toFixed(1)}%</span>
              <span className="text-sm font-mono text-zinc-300">
                ${asset.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================
   PAGE
   ================================================================ */

export default function PortfolioPage() {
  const [hideBalances, setHideBalances] = useState(false);

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
            <Link
              href="/trade"
              className="px-3 py-1.5 text-sm font-medium tracking-wide rounded-md text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Trade
            </Link>
            <div className="px-3 py-1.5 text-sm font-medium tracking-wide rounded-md bg-zinc-700 text-zinc-100 shadow-sm">
              Portfolio
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-6 ml-3">
            <span className="text-lg font-mono font-bold text-zinc-100">
              {hideBalances ? "••••••" : `$${NET_WORTH.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            </span>
            {[
              { label: "24h P&L", value: `+$${CHANGE_24H.toFixed(2)}`, color: "text-emerald-400" },
              { label: "24h Change", value: `+${CHANGE_24H_PERCENT.toFixed(2)}%`, color: "text-emerald-400" },
              { label: "Assets", value: `${ASSETS.length}`, color: "text-zinc-300" },
              { label: "Wallets", value: `${WALLETS.length}`, color: "text-zinc-300" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-sm text-zinc-500 tracking-wide mb-0.5">{s.label}</div>
                <div className={`text-sm font-mono font-medium ${s.color}`}>
                  {hideBalances ? "••••" : s.value}
                </div>
              </div>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <ConnectWalletButton />
            <button
              onClick={() => setHideBalances(!hideBalances)}
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
            >
              {hideBalances ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <Settings size={16} className="text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-[1600px] mx-auto px-6 sm:px-8 py-6 space-y-5">
        {/* Top row: Net Worth Hero + Allocation */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Net Worth Card */}
          <div className="flex-1 lg:w-[65%] bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              {/* Big number */}
              <div>
                <div className="text-sm text-zinc-500 uppercase tracking-wide mb-1">Net Worth</div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-zinc-100">
                  {hideBalances ? "••••••••" : `$${NET_WORTH.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className="text-sm font-mono text-emerald-400">
                    +${CHANGE_24H.toFixed(2)}
                  </span>
                  <span className="text-sm font-mono bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded">
                    +{CHANGE_24H_PERCENT.toFixed(2)}%
                  </span>
                  <span className="text-sm text-zinc-600">24h</span>
                </div>
              </div>

              {/* Connected Wallets — only shown when dWallet count > 0 */}
              <ConnectedWallets />
            </div>
          </div>

          {/* Allocation Card */}
          <div className="lg:w-[35%] min-w-[300px]">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg h-full">
              <div className="text-sm text-zinc-400 font-medium uppercase tracking-wide mb-4">
                Allocation
              </div>
              <AllocationPanel />
            </div>
          </div>
        </div>

        {/* Middle row: Assets */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-6 py-3.5 border-b border-zinc-800/50">
            <span className="text-sm text-zinc-400 font-medium uppercase tracking-wide">Assets</span>
          </div>
          <AssetTable />
        </div>

        {/* dWallets + NFTs (rendered as separate component to defer hook calls) */}
        <OnChainPortfolio />

        {/* Bottom row: Chart + Activity */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Performance Chart */}
          <div className="flex-1 lg:w-[60%]">
            <PerformanceChart />
          </div>

          {/* Activity */}
          <div className="lg:w-[40%]">
            <ActivityPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
