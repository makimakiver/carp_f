"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Wallet, CircleDot, Lock, Zap } from "lucide-react";
import { getDWalletState, type DWalletState } from "@/lib/dwallet";

interface DWalletStateModalProps {
  open: boolean;
  onClose: () => void;
  dWalletAddr: string;
  label: string;
  onActivate?: (password: string) => Promise<void>;
}

const STATE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  DKGInProgress: { color: "text-yellow-400", bg: "bg-yellow-500/10", label: "DKG In Progress" },
  AwaitingKeyHolderSignature: { color: "text-amber-400", bg: "bg-amber-500/10", label: "Awaiting Key Holder" },
  Active: { color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Active" },
  Frozen: { color: "text-blue-400", bg: "bg-blue-500/10", label: "Frozen" },
  unknown: { color: "text-zinc-400", bg: "bg-zinc-500/10", label: "Unknown" },
};

function getStateConfig(state: string) {
  return STATE_CONFIG[state] ?? { color: "text-zinc-400", bg: "bg-zinc-500/10", label: state };
}

export default function DWalletStateModal({
  open,
  onClose,
  dWalletAddr,
  label,
  onActivate,
}: DWalletStateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dwalletState, setDwalletState] = useState<DWalletState | null>(null);

  const [password, setPassword] = useState("");
  const [activating, setActivating] = useState(false);
  const [activateStatus, setActivateStatus] = useState("");
  const [activateError, setActivateError] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      setActivating(false);
      setActivateStatus("");
      setActivateError("");
    }
  }, [open]);

  useEffect(() => {
    if (!open || !dWalletAddr) return;

    let cancelled = false;
    setLoading(true);
    setError("");
    setDwalletState(null);

    getDWalletState(dWalletAddr)
      .then((result) => {
        if (!cancelled) setDwalletState(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to fetch dWallet state");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, dWalletAddr]);

  const stateConfig = dwalletState ? getStateConfig(dwalletState.state) : null;
  const isAwaitingActivation = dwalletState?.state === "AwaitingKeyHolderSignature";

  async function handleActivate() {
    if (!password || !onActivate) return;
    setActivating(true);
    setActivateError("");
    setActivateStatus("Starting activation...");

    try {
      await onActivate(password);
      setActivateStatus("Activated!");
      try {
        const updated = await getDWalletState(dWalletAddr);
        setDwalletState(updated);
      } catch {
        // Non-critical
      }
    } catch (err: any) {
      setActivateError(err?.message || "Activation failed");
    } finally {
      setActivating(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={activating ? undefined : onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-sm mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
                  <Wallet size={16} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">{label}</h2>
                  <p className="text-[10px] font-mono text-zinc-600">
                    {dWalletAddr.length > 16
                      ? `${dWalletAddr.slice(0, 8)}...${dWalletAddr.slice(-6)}`
                      : dWalletAddr}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={activating}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 pb-6">
              {loading && (
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 size={20} className="animate-spin text-indigo-400" />
                  <span className="text-sm text-zinc-400">Fetching dWallet state...</span>
                </div>
              )}

              {error && !loading && (
                <div className="py-6">
                  <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-[12px] text-red-400">{error}</p>
                  </div>
                </div>
              )}

              {dwalletState && stateConfig && !loading && (
                <div className="space-y-4">
                  <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border border-zinc-800 ${stateConfig.bg}`}>
                    <CircleDot size={18} className={stateConfig.color} />
                    <div>
                      <div className="text-[11px] text-zinc-500 uppercase tracking-wide">Current State</div>
                      <div className={`text-base font-semibold ${stateConfig.color}`}>{stateConfig.label}</div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-zinc-800/50 rounded-xl">
                    <div className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Object ID</div>
                    <div className="text-[12px] font-mono text-zinc-300 break-all">{dwalletState.objectId}</div>
                  </div>

                  {isAwaitingActivation && onActivate && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-amber-400" />
                        <span className="text-sm text-zinc-300">This dWallet needs activation</span>
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-500 uppercase tracking-wide mb-1.5">
                          <Lock size={10} className="inline mr-1" />
                          dWallet Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => { setPassword(e.target.value); setActivateError(""); }}
                          disabled={activating}
                          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors disabled:opacity-50"
                          placeholder="Enter password used during creation"
                        />
                      </div>

                      {activateStatus && activating && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg">
                          <Loader2 size={14} className="animate-spin text-amber-400" />
                          <span className="text-[12px] text-zinc-400">{activateStatus}</span>
                        </div>
                      )}

                      {activateError && (
                        <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <p className="text-[12px] text-red-400">{activateError}</p>
                        </div>
                      )}

                      <button
                        onClick={handleActivate}
                        disabled={!password || activating}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {activating ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Activating...
                          </>
                        ) : (
                          <>
                            <Zap size={16} />
                            Activate dWallet
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
