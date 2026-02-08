"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Lock, Globe, Loader2 } from "lucide-react";

interface CreateDWalletModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { password: string; chain: "evm" | "solana" }) => Promise<void>;
  loading?: boolean;
  externalError?: string;
}

export default function CreateDWalletModal({
  open,
  onClose,
  onConfirm,
  loading = false,
  externalError,
}: CreateDWalletModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [chain, setChain] = useState<"evm" | "solana" | null>(null);
  const [error, setError] = useState("");

  function reset() {
    setStep(1);
    setPassword("");
    setConfirmPassword("");
    setChain(null);
    setError("");
  }

  function handleClose() {
    if (loading) return;
    reset();
    onClose();
  }

  function handleNext() {
    if (!password) {
      setError("Password is required");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setStep(2);
  }

  async function handleCreate() {
    if (!chain) return;
    await onConfirm({ password, chain });
  }

  const displayError = externalError || error;

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
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            className="relative z-10 w-full max-w-md mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <h2 className="text-lg font-semibold text-zinc-100">
                Create dWallet
              </h2>
              <button
                onClick={handleClose}
                disabled={loading}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex gap-2 px-6 pb-4">
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step >= 1 ? "bg-indigo-500" : "bg-zinc-800"
                }`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step >= 2 ? "bg-indigo-500" : "bg-zinc-800"
                }`}
              />
            </div>

            <div className="px-6 pb-6">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Lock size={16} className="text-indigo-400" />
                      <span className="text-sm text-zinc-400">
                        Set a password for your dWallet
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] text-zinc-500 uppercase tracking-wide mb-1.5">
                          Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError("");
                          }}
                          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
                          placeholder="Enter password"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-500 uppercase tracking-wide mb-1.5">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setError("");
                          }}
                          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
                          placeholder="Confirm password"
                        />
                      </div>

                      {displayError && (
                        <p className="text-[12px] text-red-400">{displayError}</p>
                      )}
                    </div>

                    <button
                      onClick={handleNext}
                      className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Globe size={16} className="text-indigo-400" />
                      <span className="text-sm text-zinc-400">
                        Select a chain for your dWallet
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setChain("evm")}
                        disabled={loading}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          chain === "evm"
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-zinc-800 bg-zinc-800/50 hover:border-zinc-700"
                        }`}
                      >
                        <div className="text-sm font-semibold text-zinc-100">
                          EVM
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1">
                          Ethereum & compatible
                        </div>
                      </button>

                      <button
                        onClick={() => setChain("solana")}
                        disabled={loading}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          chain === "solana"
                            ? "border-indigo-500 bg-indigo-500/10"
                            : "border-zinc-800 bg-zinc-800/50 hover:border-zinc-700"
                        }`}
                      >
                        <div className="text-sm font-semibold text-zinc-100">
                          Solana VM
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1">
                          Solana network
                        </div>
                      </button>
                    </div>

                    {displayError && (
                      <p className="text-[12px] text-red-400 mt-3">{displayError}</p>
                    )}

                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={() => setStep(1)}
                        disabled={loading}
                        className="flex items-center justify-center gap-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-40"
                      >
                        <ChevronLeft size={16} />
                        Back
                      </button>
                      <button
                        onClick={handleCreate}
                        disabled={!chain || loading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create dWallet"
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
