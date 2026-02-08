/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState, useMemo, useCallback, useEffect } from "react";
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
  Wallet,
  Lock,
  Loader2,
  X,
  Zap,
  ExternalLink,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import dynamic from "next/dynamic";
import { TradingViewWidget } from "@/components/tradingview-widget";
import {
  useRegistryWallets,
  type RegistryWalletEntry,
} from "@/components/OnChainPortfolio";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { signBytesWithDWallet } from "@/lib/dwallet";
import {
  buildUnsignedApprove,
  buildUnsignedDeposit,
  buildUnsignedPlaceOrder,
  broadcastSignedTx,
  checkUsdcAllowance,
  checkUsdcBalance,
  deriveEvmAddress,
  getEvmBalances,
  getHypercoreBalance,
  getSpotBalance,
  createHyperEvmProvider,
  ASSET_INDEX,
  USDC_ADDRESS,
  fetchAllMids,
} from "@/lib/hyperliquid";
import { ethers } from "ethers";

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
  side: "bid" | "ask",
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

function stripCommas(s: string): string {
  return s.replace(/,/g, "");
}

/* ================================================================
   ORDER BOOK
   ================================================================ */

function OrderBook() {
  const asks = useMemo(() => generateOrderBook(BASE_PRICE, 8, "ask"), []);
  const bids = useMemo(() => generateOrderBook(BASE_PRICE, 8, "bid"), []);

  return (
    <div className="text-[11px] font-mono">
      <div className="grid grid-cols-3 px-4 py-2 text-zinc-500 text-[10px] border-b border-zinc-800/50">
        <span>Price (USD)</span>
        <span className="text-right">Size (BTC)</span>
        <span className="text-right">Total</span>
      </div>
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
      <div className="flex items-center justify-center py-2.5 border-y border-zinc-800/50 my-0.5">
        <span className="text-base font-semibold text-zinc-100 font-mono">43,271.50</span>
        <span className="text-[10px] text-emerald-400 ml-2">+2.34%</span>
      </div>
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
   ORDER ENTRY (with dWallet integration)
   ================================================================ */

interface OrderEntryProps {
  selectedMarket: typeof MARKETS[0];
  livePrice: string | null;
}

function OrderEntry({ selectedMarket, livePrice }: OrderEntryProps) {
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();

  // Order form state
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [leverage, setLeverage] = useState(10);
  const [price, setPrice] = useState("43,271.50");
  const [size, setSize] = useState("");
  const [sizeUnit, setSizeUnit] = useState<"BTC" | "USD">("BTC");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [slippage, setSlippage] = useState("0.5");

  // dWallet connection state
  const { wallets: registryWallets } = useRegistryWallets(account?.address);
  const evmWallets = registryWallets.filter(
    (w) => w.chain.toLowerCase() === "evm",
  );
  const [selectedWallet, setSelectedWallet] = useState<RegistryWalletEntry | null>(null);
  const [walletDropdown, setWalletDropdown] = useState(false);
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState("");
  const [evmAddress, setEvmAddress] = useState("");
  const [evmBalances, setEvmBalances] = useState<{ hype: string; usdc: string } | null>(null);
  const [hypercoreBalance, setHypercoreBalance] = useState<{ accountValue: string; withdrawable: string; marginUsed: string } | null>(null);
  const [spotBalance, setSpotBalance] = useState<{ totalUsdValue: string } | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);

  function copyEvmAddress() {
    if (!evmAddress) return;
    navigator.clipboard.writeText(evmAddress).then(() => {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    });
  }

  // Order submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderStatus, setOrderStatus] = useState("");
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState("");

  // Deposit modal state
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState("10");
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositStatus, setDepositStatus] = useState("");
  const [depositError, setDepositError] = useState("");
  const [depositSuccess, setDepositSuccess] = useState("");

  // MetaMask deposit state
  const [mmAddress, setMmAddress] = useState("");
  const [mmUsdcBalance, setMmUsdcBalance] = useState("");
  const [isConnectingMM, setIsConnectingMM] = useState(false);
  const [mmDepositAmount, setMmDepositAmount] = useState("10");
  const [isMmDepositing, setIsMmDepositing] = useState(false);
  const [mmDepositError, setMmDepositError] = useState("");
  const [mmDepositSuccess, setMmDepositSuccess] = useState("");

  // Track used presigns locally
  const [usedPresigns, setUsedPresigns] = useState<Set<string>>(new Set());

  const availablePresigns = selectedWallet
    ? selectedWallet.presign_ids.filter((id) => !usedPresigns.has(id))
    : [];

  const leverageMarks = [1, 2, 5, 10, 20];

  // Auto-select first wallet
  useEffect(() => {
    if (!selectedWallet && evmWallets.length > 0) {
      setSelectedWallet(evmWallets[0]!);
    }
  }, [evmWallets, selectedWallet]);

  const hlRpcUrl = process.env.NEXT_PUBLIC_HYPERLIQUID_RPC_URL;

  // Derive EVM address & fetch balances when a wallet is selected
  const [derivingAddr, setDerivingAddr] = useState(false);

  useEffect(() => {
    if (!selectedWallet) {
      setEvmAddress("");
      setEvmBalances(null);
      setHypercoreBalance(null);
      return;
    }

    let cancelled = false;
    setDerivingAddr(true);
    setEvmAddress("");
    setEvmBalances(null);
    setHypercoreBalance(null);
    setSpotBalance(null);

    (async () => {
      try {
        const addr = await deriveEvmAddress(selectedWallet.dwallet_addr);
        if (cancelled) return;
        setEvmAddress(addr);

        // Fetch EVM wallet, perps, and spot balances in parallel
        const promises: Promise<void>[] = [];

        if (hlRpcUrl) {
          promises.push(
            getEvmBalances(hlRpcUrl, addr)
              .then((bals) => { if (!cancelled) setEvmBalances(bals); })
              .catch(() => { /* non-critical */ })
          );
        }

        promises.push(
          getHypercoreBalance(addr)
            .then((bal) => {
              console.log("[PerpBalance] EVM addr:", addr, "→ balance:", bal);
              if (!cancelled) setHypercoreBalance(bal);
            })
            .catch((err) => {
              console.error("[PerpBalance] Failed to fetch:", err);
            })
        );

        promises.push(
          getSpotBalance(addr)
            .then((bal) => {
              console.log("[SpotBalance] EVM addr:", addr, "→ balance:", bal);
              if (!cancelled) setSpotBalance(bal);
            })
            .catch((err) => {
              console.error("[SpotBalance] Failed to fetch:", err);
            })
        );

        await Promise.all(promises);
      } catch {
        // deriveEvmAddress may fail if dWallet is not Active yet — that's ok
      } finally {
        if (!cancelled) setDerivingAddr(false);
      }
    })();

    return () => { cancelled = true; };
  }, [selectedWallet, hlRpcUrl]);

  // Auto-refresh balances every 30s when an EVM address is known
  useEffect(() => {
    if (!evmAddress) return;
    const interval = setInterval(async () => {
      try {
        if (hlRpcUrl) {
          const bals = await getEvmBalances(hlRpcUrl, evmAddress);
          setEvmBalances(bals);
        }
      } catch { /* non-critical */ }
      try {
        const hcBal = await getHypercoreBalance(evmAddress);
        setHypercoreBalance(hcBal);
      } catch { /* non-critical */ }
      try {
        const sBal = await getSpotBalance(evmAddress);
        setSpotBalance(sBal);
      } catch { /* non-critical */ }
    }, 30_000);
    return () => clearInterval(interval);
  }, [evmAddress, hlRpcUrl]);

  // Unlock dWallet (password still needed for signing operations)
  const handleUnlock = useCallback(async () => {
    if (!selectedWallet || !password) return;
    setUnlocking(true);
    setUnlockError("");

    try {
      // Address may already be derived, but re-derive to be safe
      if (!evmAddress) {
        const addr = await deriveEvmAddress(selectedWallet.dwallet_addr);
        setEvmAddress(addr);

        if (hlRpcUrl) {
          try {
            const bals = await getEvmBalances(hlRpcUrl, addr);
            setEvmBalances(bals);
          } catch {
            // Balance fetch is non-critical
          }
        }
      }

      setIsUnlocked(true);
    } catch (err: any) {
      setUnlockError(err?.message || "Failed to unlock dWallet");
    } finally {
      setUnlocking(false);
    }
  }, [selectedWallet, password, hlRpcUrl, evmAddress]);

  const signAndExecute = account
    ? (args: { transaction: any }) => dAppKit.signAndExecuteTransaction({ transaction: args.transaction })
    : null;

  // Place order handler
  async function handlePlaceOrder(isBuy: boolean) {
    if (!selectedWallet || !account || !signAndExecute || !hlRpcUrl || !isUnlocked) return;

    const isMarket = orderType === "market";
    if (isMarket) {
      if (!size || !livePrice) return;
    } else {
      if (!size || !price) return;
    }

    setIsSubmitting(true);
    setOrderStatus("");
    setOrderError("");
    setOrderSuccess("");

    try {
      if (availablePresigns.length === 0) {
        throw new Error("No presign caps available. Create one from the Portfolio page.");
      }
      const provider = createHyperEvmProvider(hlRpcUrl);
      const assetIndex = ASSET_INDEX[selectedMarket.symbol] ?? 0;
      const cleanSize = stripCommas(size);

      // Market orders: use live mid price ± slippage, TIF=IOC
      // Limit orders: use user-entered price, TIF=GTC
      let orderPrice: string;
      let orderTif: number;

      if (isMarket) {
        const slippagePct = parseFloat(slippage) / 100;
        const mid = parseFloat(livePrice!);
        const adjusted = isBuy
          ? mid * (1 + slippagePct)
          : mid * (1 - slippagePct);
        orderPrice = adjusted.toString();
        orderTif = 3; // IOC
      } else {
        orderPrice = stripCommas(price);
        orderTif = 2; // GTC
      }

      setOrderStatus("Building order transaction...");
      const { populated, unsignedBytes } = await buildUnsignedPlaceOrder(
        provider,
        evmAddress,
        assetIndex,
        isBuy,
        orderPrice,
        cleanSize,
        false, // reduceOnly
        orderTif,
      );

      const rawSig = await signBytesWithDWallet({
        password,
        dWalletObjectId: selectedWallet.dwallet_addr,
        userPublicOutput: new Uint8Array(selectedWallet.user_public_output),
        presignIds: availablePresigns,
        unsignedBytes,
        senderAddress: account.address,
        signAndExecuteTransaction: signAndExecute,
        onStatus: setOrderStatus,
      });

      setOrderStatus("Broadcasting to Hyperliquid...");
      const txHash = await broadcastSignedTx(
        provider, populated, unsignedBytes, rawSig, evmAddress,
      );

      setOrderStatus("Waiting for confirmation...");
      const receipt = await provider.waitForTransaction(txHash);
      const success = receipt?.status === 1;

      setUsedPresigns((prev) => new Set(prev).add(rawSig.usedPresignId));

      if (success) {
        setOrderSuccess(`Order placed! Tx: ${txHash.slice(0, 10)}...`);
      } else {
        setOrderError("Transaction failed on-chain");
      }
    } catch (err: any) {
      console.error("Order placement failed:", err);
      setOrderError(err?.message || "Order placement failed");
    } finally {
      setIsSubmitting(false);
      setOrderStatus("");
    }
  }

  // Deposit handler: separate approve + deposit transactions
  async function handleDeposit() {
    if (!selectedWallet || !account || !signAndExecute || !hlRpcUrl || !isUnlocked) return;
    if (!depositAmount) return;

    setIsDepositing(true);
    setDepositStatus("");
    setDepositError("");
    setDepositSuccess("");

    try {
      const provider = createHyperEvmProvider(hlRpcUrl);
      const amountUsdc = BigInt(Math.round(parseFloat(depositAmount) * 1_000_000));

      // ── Pre-flight: verify on-chain USDC balance is sufficient ──
      setDepositStatus("Checking USDC balance...");
      const onChainBalance = await checkUsdcBalance(provider, evmAddress);
      if (onChainBalance < amountUsdc) {
        const have = Number(onChainBalance) / 1e6;
        const need = Number(amountUsdc) / 1e6;
        throw new Error(
          `Insufficient USDC on HyperEVM. Have ${have} USDC, need ${need} USDC. ` +
          `Bridge more USDC to your dWallet address on HyperEVM first.`
        );
      }

      // ── Step 1: Check allowance & approve if needed ──
      setDepositStatus("Checking USDC allowance...");
      const currentAllowance = await checkUsdcAllowance(provider, evmAddress);
      const needsApproval = currentAllowance < amountUsdc;
      let usedApprovePresign: string | null = null;
      let approveNonce: number | null = null;

      if (needsApproval) {
        if (availablePresigns.length < 2) {
          throw new Error("Deposit requires at least 2 presign caps (1 for approve, 1 for deposit).");
        }

        setDepositStatus("Building approve transaction...");
        const approve = await buildUnsignedApprove(provider, evmAddress, amountUsdc);

        setDepositStatus("Signing approve via dWallet...");
        const approveSig = await signBytesWithDWallet({
          password,
          dWalletObjectId: selectedWallet.dwallet_addr,
          userPublicOutput: new Uint8Array(selectedWallet.user_public_output),
          presignIds: availablePresigns,
          unsignedBytes: approve.unsignedBytes,
          senderAddress: account.address,
          signAndExecuteTransaction: signAndExecute,
          onStatus: setDepositStatus,
        });

        setDepositStatus("Broadcasting approve...");
        const approveTxHash = await broadcastSignedTx(
          provider, approve.populated, approve.unsignedBytes, approveSig, evmAddress,
        );

        setDepositStatus("Waiting for approve confirmation...");
        const approveReceipt = await provider.waitForTransaction(approveTxHash);
        if (approveReceipt?.status !== 1) {
          throw new Error("Approve transaction failed on-chain");
        }
        usedApprovePresign = approveSig.usedPresignId;
        approveNonce = approve.nonce;
        setUsedPresigns((prev) => new Set(prev).add(usedApprovePresign!));
      } else {
        setDepositStatus("Allowance sufficient, skipping approve.");
      }

      // ── Step 2: Deposit USDC ──
      const remainingPresigns = usedApprovePresign
        ? availablePresigns.filter((id) => id !== usedApprovePresign)
        : availablePresigns;
      if (remainingPresigns.length === 0) {
        throw new Error("No presign caps remaining for deposit. Create more presigns.");
      }

      setDepositStatus("Building deposit transaction...");
      // If approve was sent, use its nonce + 1 to avoid stale-nonce from load-balanced RPCs.
      const depositNonce = approveNonce != null ? approveNonce + 1 : undefined;
      const deposit = await buildUnsignedDeposit(provider, evmAddress, amountUsdc, 0, depositNonce);

      setDepositStatus("Signing deposit via dWallet...");
      const depositSig = await signBytesWithDWallet({
        password,
        dWalletObjectId: selectedWallet.dwallet_addr,
        userPublicOutput: new Uint8Array(selectedWallet.user_public_output),
        presignIds: remainingPresigns,
        unsignedBytes: deposit.unsignedBytes,
        senderAddress: account.address,
        signAndExecuteTransaction: signAndExecute,
        onStatus: setDepositStatus,
      });

      setDepositStatus("Broadcasting deposit...");
      const depositTxHash = await broadcastSignedTx(
        provider, deposit.populated, deposit.unsignedBytes, depositSig, evmAddress,
      );

      setDepositStatus("Waiting for deposit confirmation...");
      const depositReceipt = await provider.waitForTransaction(depositTxHash);
      setUsedPresigns((prev) => new Set(prev).add(depositSig.usedPresignId));

      if (depositReceipt?.status === 1) {
        setDepositSuccess(`Deposited ${depositAmount} USDC! Tx: ${depositTxHash.slice(0, 10)}...`);
        if (evmAddress) {
          // Refresh EVM balance immediately (deducted right away)
          try {
            const bals = await getEvmBalances(hlRpcUrl, evmAddress);
            setEvmBalances(bals);
          } catch { /* non-critical */ }

          // HyperCore bridge takes ~60-120s to settle.
          // Poll every 10s for up to 2 minutes until the balance increases.
          setDepositStatus("Waiting for HyperCore bridge settlement...");
          const prevAccountValue = parseFloat(hypercoreBalance?.accountValue ?? "0");
          let settled = false;
          for (let attempt = 0; attempt < 12; attempt++) {
            await new Promise((r) => setTimeout(r, 10_000));
            try {
              const hcBal = await getHypercoreBalance(evmAddress);
              setHypercoreBalance(hcBal);
              const newAccountValue = parseFloat(hcBal.accountValue);
              if (newAccountValue > prevAccountValue) {
                settled = true;
                break;
              }
            } catch { /* retry */ }
            setDepositStatus(`Waiting for HyperCore bridge settlement... (${(attempt + 1) * 10}s)`);
          }
          // Also refresh spot balance
          try {
            const sBal = await getSpotBalance(evmAddress);
            setSpotBalance(sBal);
          } catch { /* non-critical */ }

          if (!settled) {
            setDepositSuccess(
              `Deposit tx confirmed! Bridge settlement may take a few more minutes. Tx: ${depositTxHash.slice(0, 10)}...`
            );
          }
        }
      } else {
        setDepositError("Deposit transaction failed on-chain");
      }
    } catch (err: any) {
      console.error("Deposit failed:", err);
      setDepositError(err?.message || "Deposit failed");
    } finally {
      setIsDepositing(false);
      setDepositStatus("");
    }
  }

  // ── MetaMask helpers ──

  const HYPER_EVM_MAINNET = {
    chainId: "0x3E7", // 999 in hex — HyperEVM mainnet
    chainName: "Hyperliquid",
    rpcUrls: ["https://rpc.hyperliquid.xyz/evm"],
    nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
    blockExplorerUrls: ["https://purrsec.com"],
  };

  async function connectMetaMask() {
    if (typeof window === "undefined" || !window.ethereum) {
      setMmDepositError("MetaMask not detected. Please install MetaMask.");
      return;
    }
    setIsConnectingMM(true);
    setMmDepositError("");
    try {
      // Request accounts
      const accounts: string[] = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts[0]) throw new Error("No accounts returned");
      const addr = ethers.getAddress(accounts[0]);
      setMmAddress(addr);

      // Switch to HyperEVM testnet
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: HYPER_EVM_MAINNET.chainId }],
        });
      } catch (switchErr: any) {
        // 4902 = chain not added
        if (switchErr.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [HYPER_EVM_MAINNET],
          });
        } else {
          throw switchErr;
        }
      }

      // Fetch USDC balance
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        ["function balanceOf(address) view returns (uint256)"],
        browserProvider,
      );
      const bal: bigint = await usdcContract.balanceOf(addr);
      setMmUsdcBalance(ethers.formatUnits(bal, 6));
    } catch (err: any) {
      console.error("MetaMask connect error:", err);
      setMmDepositError(err?.message || "Failed to connect MetaMask");
    } finally {
      setIsConnectingMM(false);
    }
  }

  async function handleMetaMaskDeposit() {
    if (!mmAddress || !evmAddress || !mmDepositAmount) return;
    setIsMmDepositing(true);
    setMmDepositError("");
    setMmDepositSuccess("");

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      const usdcContract = new ethers.Contract(
        USDC_ADDRESS,
        ["function transfer(address to, uint256 amount) returns (bool)"],
        signer,
      );
      const amountRaw = BigInt(Math.round(parseFloat(mmDepositAmount) * 1_000_000));
      const tx = await usdcContract.transfer(evmAddress, amountRaw);
      const receipt = await tx.wait();

      if (receipt?.status === 1) {
        setMmDepositSuccess(`Sent ${mmDepositAmount} USDC to dWallet! Tx: ${(tx.hash as string).slice(0, 10)}...`);

        // Refresh MetaMask USDC balance
        const readContract = new ethers.Contract(
          USDC_ADDRESS,
          ["function balanceOf(address) view returns (uint256)"],
          browserProvider,
        );
        const newBal: bigint = await readContract.balanceOf(mmAddress);
        setMmUsdcBalance(ethers.formatUnits(newBal, 6));

        // Refresh dWallet EVM balances
        if (hlRpcUrl && evmAddress) {
          try {
            const bals = await getEvmBalances(hlRpcUrl, evmAddress);
            setEvmBalances(bals);
          } catch { /* non-critical */ }
        }
      } else {
        setMmDepositError("Transfer transaction failed on-chain");
      }
    } catch (err: any) {
      console.error("MetaMask deposit error:", err);
      setMmDepositError(err?.message || "MetaMask deposit failed");
    } finally {
      setIsMmDepositing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* ── dWallet Connection ── */}
      <div className="space-y-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Wallet size={14} className="text-indigo-400" />
          <span className="text-[12px] font-medium text-zinc-300">dWallet</span>
          {isUnlocked && (
            <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Connected
            </span>
          )}
        </div>

        {/* Wallet Selector */}
        {evmWallets.length > 0 ? (
          <div className="relative">
            <button
              onClick={() => setWalletDropdown(!walletDropdown)}
              className="w-full flex items-center justify-between px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded-lg hover:border-zinc-600 transition-colors text-[12px]"
            >
              <span className="text-zinc-300 font-mono">
                {selectedWallet
                  ? `${selectedWallet.label} (${selectedWallet.dwallet_addr.slice(0, 6)}...${selectedWallet.dwallet_addr.slice(-4)})`
                  : "Select dWallet"}
              </span>
              <ChevronDown size={12} className={`text-zinc-500 transition-transform ${walletDropdown ? "rotate-180" : ""}`} />
            </button>
            {walletDropdown && (
              <div className="absolute z-50 top-full left-0 mt-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg overflow-hidden">
                {evmWallets.map((w) => (
                  <button
                    key={w.dwallet_addr}
                    onClick={() => {
                      setSelectedWallet(w);
                      setWalletDropdown(false);
                      setIsUnlocked(false);
                      setEvmAddress("");
                      setEvmBalances(null);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-zinc-800/50 text-[11px] ${
                      selectedWallet?.dwallet_addr === w.dwallet_addr ? "bg-indigo-500/[0.06]" : ""
                    }`}
                  >
                    <div className="text-zinc-300 font-medium">{w.label}</div>
                    <div className="text-zinc-600 font-mono text-[10px]">
                      {w.dwallet_addr.slice(0, 8)}...{w.dwallet_addr.slice(-6)}
                    </div>
                    <div className="text-zinc-500 text-[10px]">
                      {w.presign_ids.length} presign{w.presign_ids.length !== 1 ? "s" : ""}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 py-2 bg-zinc-800/40 rounded-lg">
            <p className="text-[11px] text-zinc-500">
              No EVM dWallets found.{" "}
              <Link href="/portfolio" className="text-indigo-400 hover:text-indigo-300">
                Create one
              </Link>
            </p>
          </div>
        )}

        {/* EVM address & balance (shown as soon as wallet is selected) */}
        {selectedWallet && (
          <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/40 rounded-lg">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide">EVM Address</div>
              {derivingAddr ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={10} className="animate-spin text-zinc-500" />
                  <span className="text-[11px] text-zinc-500">Deriving...</span>
                </div>
              ) : evmAddress ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono text-zinc-300">
                    {evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}
                  </span>
                  <button
                    onClick={copyEvmAddress}
                    className="p-0.5 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
                    title="Copy EVM address"
                  >
                    {copiedAddr ? (
                      <Check size={11} className="text-emerald-400" />
                    ) : (
                      <Copy size={11} />
                    )}
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-zinc-600">Not active yet</span>
              )}
            </div>
            <div className="text-right">
              <div className="text-[10px] text-zinc-500">Wallet USDC</div>
              <div className="text-[11px] font-mono text-zinc-200">
                {evmBalances
                  ? parseFloat(evmBalances.usdc).toLocaleString(undefined, { maximumFractionDigits: 2 })
                  : derivingAddr ? "..." : "--"}
              </div>
            </div>
          </div>
        )}

        {/* Password + Unlock */}
        {selectedWallet && !isUnlocked && (
          <>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-zinc-800/60 border border-zinc-700/50 rounded-lg h-9">
                <Lock size={12} className="text-zinc-600 ml-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setUnlockError(""); }}
                  placeholder="dWallet password"
                  className="flex-1 bg-transparent px-2 text-zinc-100 text-[12px] outline-none placeholder-zinc-700"
                  onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                />
              </div>
              <button
                onClick={handleUnlock}
                disabled={!password || unlocking}
                className="px-3 h-9 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                {unlocking ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                Unlock
              </button>
            </div>
            {unlockError && (
              <p className="text-[11px] text-red-400">{unlockError}</p>
            )}
          </>
        )}

        {/* Deposit & fund buttons (only after unlock) */}
        {isUnlocked && evmAddress && (
          <div className="space-y-2">

            {/* Deposit: HyperEVM → HyperCore */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wide">HyperEVM → HyperCore</div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  disabled={isDepositing}
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-[11px] text-zinc-100 font-mono placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
                  placeholder="USDC amount"
                />
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || isDepositing || availablePresigns.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[11px] font-medium rounded-lg transition-colors whitespace-nowrap"
                >
                  {isDepositing ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <ExternalLink size={12} />
                  )}
                  {isDepositing ? "Depositing..." : "Deposit"}
                </button>
              </div>

              {depositStatus && isDepositing && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800/50 rounded-lg">
                  <Loader2 size={10} className="animate-spin text-indigo-400" />
                  <span className="text-[10px] text-zinc-400">{depositStatus}</span>
                </div>
              )}

              {depositError && (
                <div className="px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-[10px] text-red-400">{depositError}</p>
                </div>
              )}

              {depositSuccess && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <CheckCircle2 size={10} className="text-emerald-400" />
                  <p className="text-[10px] text-emerald-400">{depositSuccess}</p>
                </div>
              )}
            </div>

            {/* Fund from MetaMask */}
            <button
              onClick={() => { setShowDeposit(true); setMmDepositError(""); setMmDepositSuccess(""); }}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-zinc-800/60 border border-zinc-700/50 rounded-lg hover:bg-zinc-800 hover:border-zinc-600 transition-colors text-[11px] text-zinc-400 hover:text-zinc-300"
            >
              <Wallet size={12} />
              Fund from MetaMask
            </button>

            <div className="text-[10px] text-zinc-600 text-center">
              {availablePresigns.length} presign{availablePresigns.length !== 1 ? "s" : ""} available
            </div>
          </div>
        )}
      </div>

      {/* ── MetaMask Fund Modal ── */}
      {showDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => !isMmDepositing && setShowDeposit(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-100">Fund from MetaMask</h3>
              <button onClick={() => !isMmDepositing && setShowDeposit(false)} className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {!mmAddress ? (
                <>
                  <p className="text-[11px] text-zinc-500">
                    Connect MetaMask to transfer USDC to your dWallet&apos;s EVM address on HyperEVM.
                  </p>
                  <button
                    onClick={connectMetaMask}
                    disabled={isConnectingMM}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {isConnectingMM ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Wallet size={16} />
                        Connect MetaMask
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 bg-zinc-800 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500">MetaMask</span>
                      <span className="text-[11px] text-zinc-300 font-mono">{mmAddress.slice(0, 6)}...{mmAddress.slice(-4)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500">USDC Balance</span>
                      <span className="text-[11px] text-zinc-300 font-mono">{mmUsdcBalance || "—"}</span>
                    </div>
                  </div>

                  {evmAddress && (
                    <div className="px-3 py-2 bg-zinc-800/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-zinc-500">Sending to (dWallet)</span>
                        <span className="text-[11px] text-zinc-300 font-mono">{evmAddress.slice(0, 6)}...{evmAddress.slice(-4)}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1.5 block">Amount (USDC)</label>
                    <input
                      type="text"
                      value={mmDepositAmount}
                      onChange={(e) => setMmDepositAmount(e.target.value)}
                      disabled={isMmDepositing}
                      className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 font-mono placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
                      placeholder="10.00"
                    />
                  </div>

                  {!evmAddress && (
                    <div className="px-3 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <p className="text-[11px] text-yellow-400">Unlock your dWallet first to get the destination EVM address.</p>
                    </div>
                  )}

                  {mmDepositError && (
                    <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-[11px] text-red-400">{mmDepositError}</p>
                    </div>
                  )}

                  {mmDepositSuccess && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <p className="text-[11px] text-emerald-400">{mmDepositSuccess}</p>
                    </div>
                  )}

                  <button
                    onClick={handleMetaMaskDeposit}
                    disabled={!mmDepositAmount || isMmDepositing || !evmAddress}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {isMmDepositing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <ExternalLink size={16} />
                        Send {mmDepositAmount} USDC to dWallet
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Order Type ── */}
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

      {/* ── Perps & Spot Balances ── */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="flex flex-col px-3 py-2 bg-zinc-800/30 rounded-lg">
          <span className="text-[10px] text-zinc-500">Perps</span>
          <span className="text-[12px] font-mono text-emerald-300 font-medium">
            {hypercoreBalance
              ? `${parseFloat(hypercoreBalance.accountValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : "--"}
          </span>
        </div>
        <div className="flex flex-col px-3 py-2 bg-zinc-800/30 rounded-lg">
          <span className="text-[10px] text-zinc-500">Spot</span>
          <span className="text-[12px] font-mono text-indigo-300 font-medium">
            {spotBalance
              ? `${parseFloat(spotBalance.totalUsdValue).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : "--"}
          </span>
        </div>
      </div>

      {/* ── Leverage ── */}
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

      {/* ── Price Input (Limit) / Market Price Display ── */}
      {orderType === "limit" ? (
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
      ) : (
        <div>
          <label className="text-zinc-400 text-[12px] mb-1.5 block">Market Price</label>
          <div className="flex items-center justify-between bg-zinc-800/60 border border-zinc-700/50 rounded-lg h-10 px-3">
            <span className="text-zinc-100 font-mono text-[13px]">
              {livePrice
                ? parseFloat(livePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : "Loading..."}
            </span>
            <span className="text-zinc-500 text-[10px] font-mono">USD (live)</span>
          </div>
          <div className="text-[10px] text-zinc-600 mt-1">
            Executes at market price ± {slippage}% slippage
          </div>
        </div>
      )}

      {/* ── Size Input ── */}
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

      {/* ── Trigger Price ── */}
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

      {/* ── Slippage ── */}
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

      <div className="border-t border-zinc-800" />

      {/* ── Summary ── */}
      <div className="space-y-2 text-[11px]">
        {[
          { label: "Perps Balance", value: hypercoreBalance ? `${parseFloat(hypercoreBalance.accountValue).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC` : "-- USDC" },
          { label: "Spot Balance", value: spotBalance ? `${parseFloat(spotBalance.totalUsdValue).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC` : "-- USDC" },
          { label: "Order Value", value: size ? `${(parseFloat(stripCommas(size) || "0") * parseFloat(orderType === "market" ? (livePrice || "0") : stripCommas(price) || "0")).toLocaleString(undefined, { maximumFractionDigits: 2 })} USD` : "-- USD" },
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

      {/* ── Order Status ── */}
      {orderStatus && isSubmitting && (
        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg">
          <Loader2 size={14} className="animate-spin text-indigo-400" />
          <span className="text-[11px] text-zinc-400">{orderStatus}</span>
        </div>
      )}

      {orderError && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-[11px] text-red-400">{orderError}</p>
        </div>
      )}

      {orderSuccess && (
        <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <p className="text-[11px] text-emerald-400">{orderSuccess}</p>
        </div>
      )}

      {/* ── Buy / Sell ── */}
      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <button
          onClick={() => handlePlaceOrder(true)}
          disabled={!isUnlocked || isSubmitting || !size || (orderType === "limit" ? !price : !livePrice) || availablePresigns.length === 0}
          className="h-11 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[13px] tracking-wide transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
          Buy / Long
        </button>
        <button
          onClick={() => handlePlaceOrder(false)}
          disabled={!isUnlocked || isSubmitting || !size || (orderType === "limit" ? !price : !livePrice) || availablePresigns.length === 0}
          className="h-11 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-[13px] tracking-wide transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
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
   MAIN TRADE PAGE CONTENT
   ================================================================ */

export default function TradePageContent() {
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0]!);
  const [marketDropdown, setMarketDropdown] = useState(false);
  const [livePrices, setLivePrices] = useState<Record<string, string>>({});

  // Poll live mid-market prices every 3 seconds
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const mids = await fetchAllMids();
        if (!cancelled) setLivePrices(mids);
      } catch { /* non-critical */ }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const coin = selectedMarket.symbol.replace("-PERP", "");
  const currentPrice = livePrices[coin] || null;

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
            <span className="text-lg font-mono font-bold text-zinc-100">
              {currentPrice
                ? parseFloat(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : selectedMarket.price}
            </span>
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
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 lg:w-[75%] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="h-[480px] lg:h-[540px]">
              <TradingViewWidget symbol={selectedMarket.tv} />
            </div>
            <div className="border-t border-zinc-800/50">
              <div className="px-4 py-2.5">
                <span className="text-[12px] text-zinc-400 font-medium">Order Book</span>
              </div>
              <OrderBook />
            </div>
          </div>

          <div className="lg:w-[25%] min-w-[300px]">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-lg sticky top-20">
              <h2 className="text-[14px] font-semibold text-zinc-200 mb-4">Place Order</h2>
              <OrderEntry selectedMarket={selectedMarket} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
          <PositionsPanel />
        </div>
      </main>
    </div>
  );
}
