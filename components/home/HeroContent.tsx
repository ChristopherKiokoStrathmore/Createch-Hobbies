"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const stats = [
  { value: "17+",  label: "Kit Designs"    },
  { value: "500+", label: "Happy Builders" },
  { value: "1–2",  label: "Day Delivery"   },
  { value: "4–12", label: "Years Age Range"},
];

const fadeUp = (delay = 0) => ({
  initial:     { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: "-60px" },
  transition:  { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

export default function HeroContent() {
  return (
    <section className="relative overflow-hidden py-28 sm:py-36 px-4 sm:px-6 lg:px-8">
      {/* Dark cinematic scrim — lets video show through while keeping text readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,15,0.30) 0%, rgba(10,10,15,0.50) 50%, rgba(10,10,15,0.72) 100%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto text-center">

        {/* Badge */}
        <motion.div {...fadeUp(0)}>
          <span className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white/75 text-xs font-semibold tracking-widest uppercase font-inter backdrop-blur-sm">
            🇰🇪 Make your dent in the universe
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="font-playfair font-bold text-white leading-[1.08] tracking-tight"
          style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)" }}
          {...fadeUp(0.08)}
        >
          Build Something{" "}
          <span className="text-brand-yellow italic">Amazing</span>
          <br />
          Today
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mt-6 text-white/65 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-inter"
          {...fadeUp(0.16)}
        >
          DIY kits that spark creativity, teach STEM skills, and turn every child
          into a builder.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          {...fadeUp(0.24)}
        >
          <Link
            href="/shop"
            className="btn-yellow px-8 py-3.5 rounded-full text-base font-semibold active:scale-95"
          >
            Shop All Kits
          </Link>
          <Link
            href="/gift-guide"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-white/30 text-white font-semibold text-base hover:border-white/60 hover:bg-white/5 transition-all active:scale-95"
          >
            Gift Guide
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8"
          {...fadeUp(0.32)}
        >
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <span className="font-playfair font-bold text-brand-yellow text-3xl sm:text-4xl leading-none">
                {s.value}
              </span>
              <span className="mt-1.5 text-white/50 text-xs tracking-wide font-inter uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
