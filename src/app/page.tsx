"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Zap,
  Globe,
  Shield,
  Layers,
  LineChart,
  Search,
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
      <div className="mx-auto max-w-[1400px] px-6 h-16 flex items-center justify-between backdrop-blur-xl bg-[#020408]/70">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            NEXUS
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Exchange", "Portfolio", "Ecosystem", "Developers"].map((item) => (
            <Link
              key={item}
              href={item === "Exchange" ? "/trade" : item === "Portfolio" ? "/portfolio" : "#"}
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
          Launch App
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
    <section className="relative pt-40 pb-24 px-6 overflow-hidden">
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
            MAINNET LIVE — V2 DEPLOYED
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={fadeUp}
          custom={1}
          className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.05] text-white mb-6"
        >
          A Financial Network{" "}
          <br className="hidden sm:block" />
          With{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400">
            Parallelized
          </span>{" "}
          <br className="hidden sm:block" />
          Performance
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={fadeUp}
          custom={2}
          className="text-lg sm:text-xl text-zinc-400 max-w-[580px] mx-auto mb-10 leading-relaxed tracking-[-0.01em]"
        >
          Building the most powerful decentralized financial ecosystem.
          Institutional-grade execution for every trader.
        </motion.p>

        {/* CTAs */}
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
              Trade Now
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
          <Link
            href="#ecosystem"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[15px] text-zinc-400 hover:text-white border border-white/[0.08] hover:border-white/[0.15] transition-all"
          >
            Explore Ecosystem
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
    <section id="ecosystem" className="px-6 pb-28">
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
            Ecosystem
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white">
            One network, infinite possibilities
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Card A — Perpetual Exchange (Large) */}
          <motion.div
            variants={fadeUp}
            custom={1}
            whileHover={{ y: -4 }}
            className={`${CARD_BASE} col-span-12 md:col-span-7 p-8 min-h-[340px] flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <BarChart3 size={16} className="text-indigo-400" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.15em] text-zinc-500 font-medium">
                  Perpetual Exchange
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-white mb-3 max-w-md">
                Trade perpetuals with zero gas and deep liquidity
              </h3>
              <p className="text-sm text-zinc-400 max-w-lg leading-relaxed">
                Up to 100x leverage on BTC, ETH, SOL and 30+ markets. On-chain orderbook with
                CEX-grade matching engine and sub-second finality.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <Link
                href="/trade"
                className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Open Exchange <ChevronRight size={14} />
              </Link>
            </div>
            {/* Decorative chart lines */}
            <div className="absolute bottom-0 right-0 w-[60%] h-[50%] opacity-[0.04] pointer-events-none">
              <svg viewBox="0 0 400 200" fill="none" className="w-full h-full">
                <path d="M0,180 C80,160 120,120 200,100 C280,80 320,40 400,10" stroke="white" strokeWidth="1.5" />
                <path d="M0,190 C100,170 180,150 260,110 C340,70 380,50 400,30" stroke="white" strokeWidth="0.8" />
              </svg>
            </div>
          </motion.div>

          {/* Card B — Spot Trading */}
          <motion.div
            variants={fadeUp}
            custom={2}
            whileHover={{ y: -4 }}
            className={`${CARD_BASE} col-span-12 md:col-span-5 p-8 flex flex-col justify-between min-h-[340px]`}
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <LineChart size={16} className="text-cyan-400" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.15em] text-zinc-500 font-medium">
                  Spot Trading
                </span>
              </div>
              <h3 className="text-2xl font-semibold tracking-[-0.02em] text-white mb-3">
                Cross-chain spot markets on a unified orderbook
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Trade spot assets across Solana, Arbitrum, and Base without bridging.
                Intent-based settlement ensures best execution every time.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-sm text-cyan-400">
                Coming Soon
              </span>
            </div>
            {/* Dots decoration */}
            <div className="absolute top-6 right-6 grid grid-cols-4 gap-2 opacity-[0.06] pointer-events-none">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full bg-white" />
              ))}
            </div>
          </motion.div>

          {/* Card C — Infrastructure */}
          <motion.div
            variants={fadeUp}
            custom={3}
            whileHover={{ y: -4 }}
            className={`${CARD_BASE} col-span-12 md:col-span-4 p-7`}
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
              <Layers size={18} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-white mb-2">
              Parallelized Infrastructure
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Custom L1 execution layer with parallel transaction processing.
              297K peak TPS with deterministic finality.
            </p>
          </motion.div>

          {/* Card D — Research */}
          <motion.div
            variants={fadeUp}
            custom={4}
            whileHover={{ y: -4 }}
            className={`${CARD_BASE} col-span-12 md:col-span-4 p-7`}
          >
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
              <Search size={18} className="text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-white mb-2">
              Research & Analytics
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              On-chain data feeds, advanced charting, and institutional-grade analytics.
              Full transparency into orderflow and liquidity.
            </p>
          </motion.div>

          {/* Card E — Aggregator */}
          <motion.div
            variants={fadeUp}
            custom={5}
            whileHover={{ y: -4 }}
            className={`${CARD_BASE} col-span-12 md:col-span-4 p-7`}
          >
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
              <Globe size={18} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold tracking-[-0.02em] text-white mb-2">
              Cross-Chain Aggregator
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Intent-based routing across 8+ chains. Single-click swaps with
              automatic bridging handled by solver network.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ================================================================
   PERFORMANCE METRICS
   ================================================================ */

const METRICS = [
  { value: "<390ms", label: "Avg Latency" },
  { value: "297,000", label: "Peak TPS" },
  { value: "0", label: "Gas Fees" },
  { value: "99.99%", label: "Uptime SLA" },
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
            Performance
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-white">
            Numbers that speak
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-3xl overflow-hidden border border-white/[0.06] bg-white/[0.03]">
          {METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              variants={fadeUp}
              custom={i + 1}
              className="flex flex-col items-center justify-center py-12 sm:py-16 border-white/[0.04] [&:not(:last-child)]:border-r"
            >
              <span className="text-4xl sm:text-5xl font-mono font-light tracking-[-0.02em] text-white mb-2">
                {metric.value}
              </span>
              <span className="text-[12px] uppercase tracking-[0.15em] text-zinc-500">
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
   SECURITY / BACKERS STRIP
   ================================================================ */

const BACKERS = [
  "Polychain Capital",
  "Brevan Howard",
  "Jump Crypto",
  "Wintermute",
  "GSR Markets",
  "Amber Group",
];

function BackersStrip() {
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
          Backed By
        </motion.p>
        <motion.div
          variants={fadeUp}
          custom={1}
          className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
        >
          {BACKERS.map((name) => (
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
          Start trading the future
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={1}
          className="relative text-base sm:text-lg text-zinc-400 mb-8 max-w-md mx-auto"
        >
          No account needed. Connect your wallet and trade in seconds.
        </motion.p>
        <motion.div variants={fadeUp} custom={2} className="relative">
          <Link
            href="/trade"
            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-[15px] font-medium text-white transition-all"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 opacity-80 blur-[1px]" />
            <span className="absolute inset-[1px] rounded-full bg-[#0a0f1e] group-hover:bg-[#0e1424] transition-colors" />
            <span className="relative flex items-center gap-2.5">
              Launch Exchange
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
    { title: "Products", links: ["Perpetuals", "Spot", "Earn", "Bridge"] },
    { title: "Developers", links: ["Documentation", "API", "GitHub", "Bug Bounty"] },
    { title: "Company", links: ["About", "Careers", "Blog", "Press"] },
  ];

  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto max-w-[1200px] px-6 py-14 flex flex-col md:flex-row justify-between gap-12">
        {/* Logo */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Zap size={11} className="text-white" />
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-zinc-400">
              NEXUS
            </span>
          </div>
          <p className="text-[13px] text-zinc-600 max-w-[240px] leading-relaxed">
            The decentralized financial network built for performance.
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
            © 2025 Nexus Protocol. All rights reserved.
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
      <BackersStrip />
      <CTASection />
      <Footer />
    </div>
  );
}
