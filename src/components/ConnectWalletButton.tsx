"use client";

import { useState, useRef, useEffect } from "react";
import {
  ConnectModal,
  useCurrentAccount,
  useDAppKit,
} from "@mysten/dapp-kit-react";
import { ChevronDown, LogOut, Copy, Check } from "lucide-react";

export default function ConnectWalletButton() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  if (account) {
    const addr = account.address;
    const display = `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    const handleCopy = async () => {
      await navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };

    const handleDisconnect = async () => {
      await dAppKit.disconnectWallet();
      setDropdownOpen(false);
    };

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 bg-transparent hover:bg-white/10 border border-white/80 px-4 h-10 rounded-full text-sm font-medium transition-all cursor-pointer"
        >
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-mono text-white tracking-wide">
            {display}
          </span>
          <ChevronDown
            size={14}
            className={`text-white/60 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg overflow-hidden z-50">
            <button
              onClick={handleCopy}
              className="w-full flex items-center gap-3 px-4 py-3 text-[12px] text-zinc-300 hover:bg-zinc-800/60 transition-colors"
            >
              {copied ? (
                <Check size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} className="text-zinc-500" />
              )}
              {copied ? "Copied!" : "Copy Address"}
            </button>
            <div className="border-t border-zinc-800" />
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center gap-3 px-4 py-3 text-[12px] text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <LogOut size={14} />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="bg-transparent hover:bg-white/10 border border-white/80 px-6 h-10 rounded-full text-white font-medium tracking-wide text-sm transition-all cursor-pointer"
      >
        Connect Wallet
      </button>
      {open && <ConnectModal open={open} />}
    </>
  );
}
