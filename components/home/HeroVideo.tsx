"use client";

import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroVideo() {
  return (
    <section
      className="sticky top-0 h-screen flex flex-col overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {/* Cinematic dark vignette — strong enough to read over any video frame */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,15,0.55) 0%, rgba(10,10,15,0.30) 50%, rgba(10,10,15,0.80) 100%)",
        }}
      />
      {/* Purple warmth pooling at the bottom */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 45% at 50% 120%, rgba(117,67,152,0.25) 0%, transparent 70%)",
        }}
      />

      {/* Scroll prompt — only call to action on the pure video screen */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1.5"
        >
          <span className="text-white/50 font-inter text-[10px] tracking-[0.25em] uppercase">
            Scroll
          </span>
          <ChevronDown className="text-white/60" size={22} />
        </motion.div>
      </motion.div>
    </section>
  );
}
