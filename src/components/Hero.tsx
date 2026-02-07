"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28">
      {/* Background layers */}
      <div className="absolute inset-0 noise-bg" />
      <div className="absolute inset-0 grid-bg" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 20%, rgba(0, 240, 255, 0.1), transparent 50%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Badge */}
          <div className="mb-6">
            <span className="inline-block px-4 py-2 border border-[#00F0FF]/30 bg-[#00F0FF]/5 text-[#00F0FF] text-xs uppercase tracking-[0.2em] font-semibold rounded-full">
              Decentralized Trading
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-white mb-6 leading-none">
            Trade at the
            <br />
            <span className="neon-glow text-[#00F0FF]">Speed of Light</span>
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg sm:text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto mb-12 leading-relaxed tracking-wide"
          >
            Experience institutional-grade perpetual futures on a fully
            decentralized exchange with zero gas fees and lightning-fast
            execution.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/trade">
              <motion.span
                whileHover={{
                  scale: 1.02,
                  boxShadow: "0 0 30px rgba(0, 240, 255, 0.4)",
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="inline-block bg-[#00F0FF] text-black px-8 py-4 text-lg font-bold tracking-wide hover:bg-[#00D9FF] transition-colors"
              >
                Start Trading
              </motion.span>
            </Link>
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow:
                  "0 0 25px rgba(0, 240, 255, 0.5), inset 0 0 20px rgba(0, 240, 255, 0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="border-2 border-[#00F0FF] bg-transparent text-[#00F0FF] px-8 py-4 text-lg font-semibold tracking-wide hover-glow"
            >
              View Markets
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
