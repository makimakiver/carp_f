"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Zap,
  Layers,
  GitMerge,
  UserCheck,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

/* ================================================================
   ANIMATION VARIANTS
   ================================================================ */

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ================================================================
   NAVBAR
   ================================================================ */

function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06]"
    >
      <div className="relative mx-auto max-w-[1400px] px-6 h-16 flex items-center justify-between backdrop-blur-xl bg-[#020408]/70">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="CARP" width={150} height={150} className="rounded-lg" />
          <span className="text-[15px] font-semibold tracking-tight text-white">
            CARP
          </span>
        </Link>

        {/* Center Links — absolute so they sit at true center */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {["Terminal", "Portfolio", "Docs"].map((item) => (
            <Link
              key={item}
              href={item === "Terminal" ? "/trade" : item === "Portfolio" ? "/portfolio" : "#"}
              className="text-[13px] text-zinc-400 hover:text-white transition-colors tracking-[-0.01em]"
            >
              {item}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <Link
          href="/trade"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] border border-white/[0.1] text-[13px] text-white hover:bg-white/[0.12] hover:border-white/[0.18] transition-all"
        >
          Launch Terminal
          <ArrowRight size={13} />
        </Link>
      </div>
    </motion.nav>
  );
}

/* ================================================================
   HERO
   ================================================================ */

function Hero() {
  return (
    <section className="relative pt-40 pb-28 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-indigo-500/[0.07] via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative mx-auto max-w-[900px] text-center"
      >
        {/* Badge */}
        <motion.div variants={fadeUp} custom={0} className="mb-8 inline-flex">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[12px] text-zinc-400 tracking-wide">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            BUILT ON SUI
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          custom={1}
          className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.05] text-white mb-6"
        >
          Trade Everywhere.{" "}
          <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
            Sign Once.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={fadeUp}
          custom={2}
          className="text-lg sm:text-xl text-zinc-200 max-w-[600px] mx-auto mb-10 leading-relaxed tracking-[-0.01em]"
        >
          The first unified trading terminal for{" "}
          <span className="text-white font-medium">multiple high-performance markets</span>.
          Access deep liquidity across chains without bridging.
        </motion.p>

        {/* CTA */}
        <motion.div
          variants={fadeUp}
          custom={3}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/trade"
            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[15px] font-medium text-white transition-all"
          >
            {/* Glow border */}
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 opacity-80 blur-[1px]" />
            <span className="absolute inset-[1px] rounded-full bg-[#0a0f1e] group-hover:bg-[#0e1424] transition-colors" />
            <span className="relative flex items-center gap-2.5">
              Launch Terminal
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[15px] text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.15] transition-all"
          >
            How It Works
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ================================================================
   BENTO GRID
   ================================================================ */

const CARD_BASE =
  "relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.03] hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300 group";

function BentoGrid() {
  return (
    <section id="how-it-works" className="px-6 pb-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={stagger}
        className="mx-auto max-w-[1200px]"
      >
        {/* Section label */}
        <motion.div variants={fadeUp} custom={0} className="mb-10 text-center">
          <p className="text-[12px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white">
            One terminal. Every market. Zero friction.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Card 1 — Smart Split Trading (Large) */}
          <motion.div
            variants={fadeUp}
            custom={1}
            whileHover={{ y: -4 }}
            className={`${CARD_BASE} col-span-12 md:col-span-7 p-8 min-h-[340px] flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <GitMerge size={16} className="text-indigo-400" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.15em] text-zinc-500 font-medium">
                  Core Feature
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-white mb-3 max-w-md">
                Smart Split Trading
              </h3>
              <p className="text-sm text-zinc-200 max-w-lg leading-relaxed">
                One order, multiple markets. CARP automatically splits your
                trade across venues to minimize slippage and maximize execution quality.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <Link
                href="/trade"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Try it now <ChevronRight size={14} />
              </Link>
            </div>
            {/* Decorative split lines */}
            <div className="absolute bottom-0 right-0 w-[60%] h-[50%] opacity-[0.04] pointer-events-none">
              <svg viewBox="0 0 400 200" fill="none" className="w-full h-full">
                <path d="M0,100 C100,100 150,100 200,100 C250,100 280,40 400,20" stroke="white" strokeWidth="1.5" />
                <path d="M0,100 C100,100 150,100 200,100 C250,100 280,160 400,180" stroke="white" strokeWidth="1.5" />
                <circle cx="200" cy="100" r="4" fill="white" />
              </svg>
            </div>
          </motion.div>

          {/* Card 2 — Powered by Sui */}
          <motion.div
            variants={fadeUp}
            custom={2}
            whileHover={{ y: -4 }}
            className={`${CARD_BASE} col-span-12 md:col-span-5 p-8 flex flex-col justify-between min-h-[340px]`}
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Zap size={16} className="text-cyan-400" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.15em] text-zinc-500 font-medium">
                  The Engine
                </span>
              </div>
              <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white mb-3">
                Powered by Sui
              </h3>
              <p className="text-sm text-zinc-200 leading-relaxed">
                Leveraging Sui&apos;s speed to orchestrate complex
                cross-chain transactions in milliseconds.
              </p>
            </div>
            {/* Dots decoration */}
            <div className="absolute top-6 right-6 grid grid-cols-4 gap-2 opacity-[0.06] pointer-events-none">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
              ))}
            </div>
          </motion.div>

          {/* Card 3 — Zero Bridging */}
          <motion.div
            variants={fadeUp}
            custom={3}
            whileHover={{ y: -4 }}
            className={`${CARD_BASE} col-span-12 md:col-span-6 p-7`}
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
              <Layers size={18} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-white mb-2">
              Zero Bridging
            </h3>
            <p className="text-sm text-zinc-200 leading-relaxed">
              Forget about wrapping assets. Your capital is unified
              and ready to deploy instantly.
            </p>
          </motion.div>

          {/* Card 4 — Unified Account */}
          <motion.div
            variants={fadeUp}
            custom={4}
            whileHover={{ y: -4 }}
            className={`${CARD_BASE} col-span-12 md:col-span-6 p-7`}
          >
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
              <UserCheck size={18} className="text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-white mb-2">
              Unified Account
            </h3>
            <p className="text-sm text-zinc-200 leading-relaxed">
              Manage all your cross-chain positions from a single,
              simple interface.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ================================================================
   METRICS
   ================================================================ */

const METRICS = [
  { value: "2", label: "Markets" },
  { value: "1", label: "Unified Wallet" },
  { value: "0", label: "Bridge Wait Times" },
];

function PerformanceMetrics() {
  return (
    <section className="px-6 pb-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={stagger}
        className="mx-auto max-w-[1200px]"
      >
        <motion.div variants={fadeUp} custom={0} className="mb-12 text-center">
          <p className="text-[12px] uppercase tracking-[0.2em] text-zinc-500 mb-3">
            By The Numbers
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white">
            Simplicity is the ultimate sophistication
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.03]">
          {METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              variants={fadeUp}
              custom={i + 1}
              className="flex flex-col items-center justify-center py-14 sm:py-20 border-white/[0.04] [&:not(:last-child)]:border-r"
            >
              <span className="text-5xl sm:text-7xl font-semibold tracking-[-0.03em] text-white mb-3">
                {metric.value}
              </span>
              <span className="text-[13px] uppercase tracking-[0.15em] text-zinc-500">
                {metric.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ================================================================
   BUILT WITH STRIP
   ================================================================ */

const TECH = ["Sui", "Ika", "& More"];

function TechStrip() {
  return (
    <section className="px-6 pb-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="mx-auto max-w-[1200px] text-center"
      >
        <motion.p
          variants={fadeUp}
          custom={0}
          className="text-[12px] uppercase tracking-[0.2em] text-zinc-600 mb-8"
        >
          Built With
        </motion.p>
        <motion.div
          variants={fadeUp}
          custom={1}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {TECH.map((name) => (
            <span
              key={name}
              className="text-sm font-medium text-zinc-600 hover:text-zinc-400 transition-colors tracking-[-0.01em]"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ================================================================
   CTA
   ================================================================ */

function CTASection() {
  return (
    <section className="px-6 pb-32">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="relative mx-auto max-w-[800px] text-center"
      >
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-radial from-indigo-500/[0.06] via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

        <motion.h2
          variants={fadeUp}
          custom={0}
          className="relative text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-white mb-5"
        >
          Ready to trade smarter?
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={1}
          className="relative text-base sm:text-lg text-zinc-200 mb-8 max-w-md mx-auto"
        >
          Connect your wallet. Pick a pair. Let CARP handle the rest.
        </motion.p>
        <motion.div variants={fadeUp} custom={2} className="relative">
          <Link
            href="/trade"
            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[15px] font-medium text-white transition-all"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 opacity-80 blur-[1px]" />
            <span className="absolute inset-[1px] rounded-full bg-[#0a0f1e] group-hover:bg-[#0e1424] transition-colors" />
            <span className="relative flex items-center gap-2.5">
              Launch Terminal
              <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ================================================================
   FOOTER
   ================================================================ */

function Footer() {
  const columns = [
    { title: "Product", links: ["Terminal", "Portfolio", "Smart Split"] },
    { title: "Developers", links: ["Documentation", "GitHub", "API"] },
    { title: "Community", links: ["Twitter", "Discord"] },
  ];

  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1200px] px-6 py-14 flex flex-col md:flex-row justify-between gap-12">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <Image src="/logo.png" alt="CARP" width={24} height={24} className="rounded-md" />
            <span className="text-[14px] font-semibold tracking-tight text-zinc-400">
              CARP
            </span>
          </div>
          <p className="text-[13px] text-zinc-600 max-w-[240px] leading-relaxed">
            The unified trading terminal. Built on Sui.
          </p>
        </div>

        {/* Columns */}
        <div className="flex gap-16 flex-wrap">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[12px] uppercase tracking-[0.15em] text-zinc-500 font-medium mb-4">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-[1200px] px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-zinc-600">
            © 2026 CARP. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Twitter", "Discord", "GitHub"].map((s) => (
              <a
                key={s}
                href="#"
                className="text-[12px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ================================================================
   PAGE
   ================================================================ */

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020408] via-[#0f172a] to-[#020408] text-white selection:bg-indigo-500/30">
      <Navbar />
      <Hero />
      <BentoGrid />
      <PerformanceMetrics />
      <TechStrip />
      <CTASection />
      <Footer />
    </div>
  );
}
