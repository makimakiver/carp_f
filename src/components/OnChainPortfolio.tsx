"use client";

import { useState, useEffect, useCallback } from "react";
import { useCurrentAccount, useCurrentClient, useDAppKit } from "@mysten/dapp-kit-react";
import { Wallet, Plus } from "lucide-react";
import CreateDWalletModal from "./CreateDWalletModal";
import DWalletStateModal from "./DWalletStateModal";
import ToastContainer, { type ToastItem } from "./Toast";
import { createDWallet, activateDWallet } from "@/lib/dwallet";

const DWALLET_TYPE =
  "0xf02f5960c94fce1899a3795b5d11fd076bc70a8d0e20a2b19923d990ed490730::coordinator_inner::DWalletCap";

/* ── Types ─────────────────────────────────────────────────────────── */

export interface RegistryWalletEntry {
  dwallet_addr: string;
  session_id: number[];
  user_public_output: number[];
  label: string;
  chain: string;
}

/* ── Hook: fetch wallet entries from the on-chain WalletRegistry table ─ */

export function useRegistryWallets(address: string | undefined) {
  const [wallets, setWallets] = useState<RegistryWalletEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchWallets = useCallback(async () => {
    if (!address) {
      setWallets([]);
      return;
    }
    setLoading(true);
    try {
      const rpcUrl = process.env.NEXT_PUBLIC_SHINAMI_RPC_URL!;
      const registryAddr = process.env.NEXT_PUBLIC_NEXUS_REGISTRY_ADDRESS!;

      // 1. Fetch the WalletRegistry object to discover the inner Table ID
      const registryRes = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "sui_getObject",
          params: [registryAddr, { showContent: true }],
        }),
      });
      const registryData = await registryRes.json();
      const tableId =
        registryData.result?.data?.content?.fields?.wallets?.fields?.id?.id;
      if (!tableId) {
        setWallets([]);
        return;
      }

      // 2. Fetch user's wallet entries from the Table using their address as key
      const fieldRes = await fetch(rpcUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "suix_getDynamicFieldObject",
          params: [tableId, { type: "address", value: address }],
        }),
      });
      const fieldData = await fieldRes.json();
      const entries = fieldData.result?.data?.content?.fields?.value;

      if (Array.isArray(entries)) {
        setWallets(
          entries.map((e: any) => ({
            dwallet_addr: e.fields.dwallet_addr,
            session_id: e.fields.session_id ?? [],
            user_public_output: e.fields.user_public_output ?? [],
            label: e.fields.label,
            chain: e.fields.chain,
          })),
        );
      } else {
        setWallets([]);
      }
    } catch (err) {
      console.error("Failed to fetch registry wallets:", err);
      setWallets([]);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  return { wallets, loading, refetch: fetchWallets };
}

/* ── Hook: dWallet object count (owned DWalletCap objects) ───────── */

function useDWalletCount(address: string | undefined) {
  const client = useCurrentClient();
  const [dWalletCount, setDWalletCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!address || !client) return;
    setLoading(true);
    try {
      const res = await client.listOwnedObjects({
        owner: address,
        type: DWALLET_TYPE,
        limit: 1000,
      });
      setDWalletCount(res.objects.length);
    } catch (err) {
      console.error("Failed to fetch dWallets:", err);
    } finally {
      setLoading(false);
    }
  }, [address, client]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { dWalletCount, loading };
}

export default function OnChainPortfolio() {
  const account = useCurrentAccount();
  const { dWalletCount, loading } = useDWalletCount(account?.address);

  if (!account) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
      <div className="text-[12px] text-zinc-400 font-medium uppercase tracking-wide mb-4">
        dWallets
      </div>
      {loading ? (
        <div className="text-[12px] text-zinc-500">Loading...</div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <Wallet size={24} className="text-indigo-400" />
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-zinc-100">
              {dWalletCount}
            </div>
            <div className="text-[11px] text-zinc-500">dWallet objects held</div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Truncate a hex address for display: "0x13fc...8e0f" */
function truncateAddress(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

let toastCounter = 0;

export function ConnectedWallets() {
  const account = useCurrentAccount();
  const client = useCurrentClient();
  const dAppKit = useDAppKit();
  const { wallets: registryWallets, loading: registryLoading, refetch: refetchRegistry } =
    useRegistryWallets(account?.address);
  const [modalOpen, setModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [stateModalWallet, setStateModalWallet] = useState<{
    addr: string;
    label: string;
    chain: string;
    user_public_output: number[];
  } | null>(null);

  function addToast(message: string, type: ToastItem["type"]) {
    const id = `toast-${++toastCounter}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }

  function updateToast(id: string, message: string, type: ToastItem["type"]) {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, message, type } : t)),
    );
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (!account || registryLoading) return null;

  async function handleCreateDWallet(data: {
    password: string;
    chain: "evm" | "solana";
  }) {
    if (!account || !client) return;
    setCreating(true);
    setCreateError("");

    const statusToastId = addToast("Starting dWallet creation...", "loading");

    try {
      const result = await createDWallet({
        password: data.password,
        chain: data.chain,
        suiClient: client,
        senderAddress: account.address,
        signAndExecuteTransaction: (args) =>
          dAppKit.signAndExecuteTransaction({ transaction: args.transaction }),
        onStatus: (message) => updateToast(statusToastId, message, "loading"),
      });
      updateToast(
        statusToastId,
        `dWallet created! Tx: ${result.transactionDigest.slice(0, 10)}...`,
        "success",
      );
      setModalOpen(false);
      // Refresh registry wallets after creation
      refetchRegistry();
    } catch (err: any) {
      console.error("Failed to create dWallet:", err);
      const msg = err?.message || "Failed to create dWallet";
      updateToast(statusToastId, msg, "error");
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  }

  // Filter EVM wallets from the registry
  const evmWallets = registryWallets.filter(
    (w) => w.chain.toLowerCase() === "evm",
  );

  return (
    <div className="flex items-center gap-2">
      {evmWallets.map((w) => (
        <button
          key={w.dwallet_addr}
          onClick={() => setStateModalWallet({ addr: w.dwallet_addr, label: w.label, chain: w.chain, user_public_output: w.user_public_output })}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800/60 border border-zinc-700/50 rounded-lg hover:bg-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
        >
          <Wallet size={12} className="text-zinc-500" />
          <div className="text-left">
            <div className="text-[11px] text-zinc-300 font-medium">{w.label}</div>
            <div className="text-[10px] font-mono text-zinc-600">
              {truncateAddress(w.dwallet_addr)}
            </div>
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 ml-1" />
        </button>
      ))}
      <button
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/60 transition-all"
      >
        <Plus size={14} />
        <span className="text-[11px] font-medium tracking-wide">Add dWallet</span>
      </button>

      <CreateDWalletModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setCreateError("");
        }}
        onConfirm={handleCreateDWallet}
        loading={creating}
        externalError={createError}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <DWalletStateModal
        open={!!stateModalWallet}
        onClose={() => setStateModalWallet(null)}
        dWalletAddr={stateModalWallet?.addr ?? ""}
        label={stateModalWallet?.label ?? ""}
        onActivate={async (password: string) => {
          if (!account || !stateModalWallet) return;

          const userPublicOutput = new Uint8Array(stateModalWallet.user_public_output);
          const chain = stateModalWallet.chain.toLowerCase() === "evm" ? "evm" as const : "solana" as const;

          await activateDWallet({
            password,
            chain,
            dWalletObjectId: stateModalWallet.addr,
            userPublicOutput,
            senderAddress: account.address,
            signAndExecuteTransaction: (args) =>
              dAppKit.signAndExecuteTransaction({ transaction: args.transaction }),
          });
        }}
      />
    </div>
  );
}
