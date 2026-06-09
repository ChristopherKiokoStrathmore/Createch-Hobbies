"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSiteConfig } from "@/context/SiteConfigContext";

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

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function animateStat(raw: string, setter: (v: string) => void) {
  const DURATION = 1800;
  const start    = performance.now();

  if (raw.includes("–")) {
    // Range like "1–2" or "4–12" — animate the upper bound
    const [minStr, maxStr] = raw.split("–");
    const min = parseInt(minStr, 10);
    const max = parseInt(maxStr, 10);
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      const current  = Math.round(min + (max - min) * easeOutCubic(progress));
      setter(`${min}–${current}`);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } else if (raw.endsWith("+")) {
    const num = parseInt(raw, 10);
    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION, 1);
      const current  = Math.round(num * easeOutCubic(progress));
      setter(`${current}+`);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  } else {
    setter(raw);
  }
}

function CountUpStat({ value, label }: { value: string; label: string }) {
  const [display, setDisplay] = useState(() => {
    if (value.includes("–")) return value.replace(/\d+$/, "0");
    if (value.endsWith("+"))  return "0+";
    return value;
  });
  const ref          = useRef<HTMLDivElement>(null);
  const hasAnimated  = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animateStat(value, setDisplay);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <span className="font-playfair font-bold text-brand-yellow text-3xl sm:text-4xl leading-none tabular-nums">
        {display}
      </span>
      <span className="mt-1.5 text-white/50 text-xs tracking-wide font-inter uppercase">
        {label}
      </span>
    </div>
  );
}

export default function HeroContent() {
  const { hero } = useSiteConfig();

  return (
    <section className="relative overflow-hidden py-28 sm:py-36 px-4 sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(10,10,15,0.42) 0%, rgba(10,10,15,0.60) 55%, rgba(10,10,15,0.75) 100%)",
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
          data-editor-key="hero.headline"
        >
          {hero.headline}
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mt-6 text-white/65 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto font-inter"
          {...fadeUp(0.16)}
          data-editor-key="hero.subheadline"
          suppressHydrationWarning
        >
          {hero.subheadline}
        </motion.p>

        {/* Stats — count up on scroll into view */}
        <motion.div
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8"
          {...fadeUp(0.32)}
        >
          {stats.map((s) => (
            <CountUpStat key={s.label} value={s.value} label={s.label} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
