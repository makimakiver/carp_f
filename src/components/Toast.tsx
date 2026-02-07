"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Info } from "lucide-react";

export interface ToastItem {
  id: string;
  message: string;
  type: "loading" | "success" | "error" | "info";
}

const icons = {
  loading: <Loader2 size={16} className="animate-spin text-indigo-400" />,
  success: <CheckCircle2 size={16} className="text-emerald-400" />,
  error: <XCircle size={16} className="text-red-400" />,
  info: <Info size={16} className="text-zinc-400" />,
};

const borderColors = {
  loading: "border-indigo-500/30",
  success: "border-emerald-500/30",
  error: "border-red-500/30",
  info: "border-zinc-700",
};

export default function ToastContainer({ toasts, onDismiss }: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastEntry key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastEntry({ toast, onDismiss }: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    if (toast.type === "success" || toast.type === "info") {
      const timer = setTimeout(() => onDismiss(toast.id), 4000);
      return () => clearTimeout(timer);
    }
    if (toast.type === "error") {
      const timer = setTimeout(() => onDismiss(toast.id), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.type, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 bg-zinc-900/95 backdrop-blur-sm border ${borderColors[toast.type]} rounded-xl shadow-lg max-w-sm`}
    >
      {icons[toast.type]}
      <span className="text-[12px] text-zinc-200">{toast.message}</span>
    </motion.div>
  );
}
