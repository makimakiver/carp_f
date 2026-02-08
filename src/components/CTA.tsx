"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-24 md:py-32 px-6 relative overflow-hidden section-container">
      {/* Spotlight effect */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.15), transparent 60%)",
        }}
      />
      <div className="absolute inset-0 noise-bg" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white mb-8 leading-none">
            Start Trading on
            <br />
            <span className="text-[#00F0FF] neon-glow">CARP Today</span>
          </h2>

          <p className="text-lg md:text-xl text-neutral-400 mb-12 max-w-2xl mx-auto tracking-wide leading-relaxed">
            Join thousands of traders experiencing the future of decentralized
            finance
          </p>

          <Link href="/trade">
            <motion.span
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 40px rgba(0, 240, 255, 0.5)",
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="inline-block bg-[#00F0FF] text-black px-12 py-5 text-lg md:text-xl font-bold tracking-wide hover:bg-[#00D9FF] transition-colors rounded-sm"
            >
              Launch App
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
