"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Car, Cog, FlaskConical, Rocket, Bot, Building2 } from "lucide-react";
import { products } from "@/data/products";

const ICON_CLASS = "w-10 h-10 sm:w-12 sm:h-12 text-white";
const SW = 1.5;

const categoryMeta = [
  {
    name:      "Vehicles",
    icon:      <Car      className={ICON_CLASS} strokeWidth={SW} />,
    gradient:  "from-[#ef4444] to-[#991b1b]",
    glowBase:  "rgba(239,68,68,0.22)",
    glowHover: "rgba(239,68,68,0.60)",
    from: { x:  700, y: -210, rotate:  46 },
  },
  {
    name:      "Machines",
    icon:      <Cog      className={ICON_CLASS} strokeWidth={SW} />,
    gradient:  "from-[#3b82f6] to-[#1d4ed8]",
    glowBase:  "rgba(59,130,246,0.22)",
    glowHover: "rgba(59,130,246,0.60)",
    from: { x: -660, y: -250, rotate: -42 },
  },
  {
    name:      "Science",
    icon:      <FlaskConical className={ICON_CLASS} strokeWidth={SW} />,
    gradient:  "from-[#a855f7] to-[#6d28d9]",
    glowBase:  "rgba(168,85,247,0.22)",
    glowHover: "rgba(168,85,247,0.60)",
    from: { x:  580, y:  330, rotate:  38 },
  },
  {
    name:      "Space",
    icon:      <Rocket   className={ICON_CLASS} strokeWidth={SW} />,
    gradient:  "from-[#4f46e5] to-[#1e1b4b]",
    glowBase:  "rgba(79,70,229,0.22)",
    glowHover: "rgba(79,70,229,0.60)",
    from: { x: -720, y: -175, rotate: -50 },
  },
  {
    name:      "Robots",
    icon:      <Bot      className={ICON_CLASS} strokeWidth={SW} />,
    gradient:  "from-[#14b8a6] to-[#0f766e]",
    glowBase:  "rgba(20,184,166,0.22)",
    glowHover: "rgba(20,184,166,0.60)",
    from: { x:  640, y: -290, rotate:  44 },
  },
  {
    name:      "Architecture",
    icon:      <Building2 className={ICON_CLASS} strokeWidth={SW} />,
    gradient:  "from-[#f97316] to-[#c2410c]",
    glowBase:  "rgba(249,115,22,0.22)",
    glowHover: "rgba(249,115,22,0.60)",
    from: { x: -700, y:  295, rotate: -38 },
  },
] as const;

const categories = categoryMeta.map((meta) => ({
  ...meta,
  count: products.filter((p) => p.category === meta.name).length,
}));

function makeAnimate(from: { x: number; y: number; rotate: number }) {
  return {
    opacity: [0,         1,                1,                 1,                1],
    x:       [from.x,    from.x * 0.18,   -from.x * 0.14,    from.x * 0.05,   0],
    y:       [from.y,    from.y * 0.25,   -from.y * 0.12,    from.y * 0.04,   0],
    rotate:  [from.rotate, from.rotate * 0.35, -from.rotate * 0.12, from.rotate * 0.05, 0],
    scale:   [0.40,      0.82,             1.22,              0.95,             1],
  };
}

const STAGGER        = 0.08;
const CARD_DURATION  = 1.3;
const CARD_TIMES     = [0, 0.35, 0.62, 0.80, 1] as const;
const CARD_EASE      = ["easeOut", "easeOut", "easeInOut", "easeInOut"] as const;

export default function CategoryShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 });

  return (
    <section
      ref={sectionRef}
      className="py-14 sm:py-28 px-4 sm:px-6 overflow-hidden"
      style={{ backgroundColor: "rgba(240,185,62,0.85)" }}
    >
      <div className="max-w-7xl mx-auto">

        <motion.div
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={isInView ? { duration: 0.55 } : { duration: 0 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-brand-purple font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            Browse by Type
          </span>
          <h2 className="font-playfair font-bold text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-4">
            Something for{" "}
            <em className="text-brand-purple not-italic">Every Kid</em>
          </h2>
          <p className="text-brand-dark/55 mt-4 max-w-xl mx-auto text-sm font-inter leading-relaxed">
            From future engineers to space explorers, we have a kit for every curious mind.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{
                opacity: 0,
                x: cat.from.x,
                y: cat.from.y,
                rotate: cat.from.rotate,
                scale: 0.40,
              }}
              animate={
                isInView
                  ? makeAnimate(cat.from)
                  : {
                      opacity: 0,
                      x: cat.from.x,
                      y: cat.from.y,
                      rotate: cat.from.rotate,
                      scale: 0.40,
                    }
              }
              transition={
                isInView
                  ? {
                      duration: CARD_DURATION,
                      delay: i * STAGGER,
                      times: CARD_TIMES,
                      ease: CARD_EASE,
                    }
                  : { duration: 0 }
              }
            >
              <Link
                href={`/shop?category=${cat.name}`}
                className={`group block bg-gradient-to-br ${cat.gradient} rounded-2xl p-5 sm:p-6 text-center min-h-[160px] sm:min-h-[180px] flex flex-col items-center justify-center`}
                style={{
                  boxShadow: `0 6px 28px ${cat.glowBase}, inset 0 1px 0 rgba(255,255,255,0.12)`,
                  transition: "box-shadow 0.3s ease, transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 18px 52px ${cat.glowHover}, inset 0 1px 0 rgba(255,255,255,0.18)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 6px 28px ${cat.glowBase}, inset 0 1px 0 rgba(255,255,255,0.12)`;
                }}
              >
                <div className="mb-3" aria-label={cat.name}>
                  {cat.icon}
                </div>
                <div className="font-playfair font-bold text-white text-sm sm:text-base leading-tight">
                  {cat.name}
                </div>
                <div className="mt-1 text-xs font-inter" style={{ color: "rgba(255,255,255,0.60)" }}>
                  {cat.count} {cat.count === 1 ? "kit" : "kits"}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
