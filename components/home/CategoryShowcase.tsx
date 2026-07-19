"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Car, Cog, FlaskConical, Rocket, Bot, Building2, Puzzle, type LucideIcon } from "lucide-react";
import { orderCategories, type Product } from "@/data/products";

const ICON_SIZE = "w-10 h-10 sm:w-12 sm:h-12";
const SW = 1.5;

type CategoryMeta = {
  name:       string;
  Icon:       LucideIcon;
  gradient:   string;
  glowBase:   string;
  glowHover:  string;
  iconColor:  string;
  labelColor: string;
  countColor: string;
  from:       { x: number; y: number; rotate: number };
};

const categoryMeta: CategoryMeta[] = [
  {
    name:       "Vehicles",
    Icon:       Car,
    gradient:   "from-[#f56a77] to-[#b83347]",
    glowBase:   "rgba(245,106,119,0.22)",
    glowHover:  "rgba(245,106,119,0.60)",
    iconColor:  "text-white",
    labelColor: "text-white",
    countColor: "rgba(255,255,255,0.60)",
    from: { x:  700, y: -210, rotate:  46 },
  },
  {
    name:       "Machines",
    Icon:       Cog,
    gradient:   "from-[#418cdb] to-[#1a5ca8]",
    glowBase:   "rgba(65,140,219,0.22)",
    glowHover:  "rgba(65,140,219,0.60)",
    iconColor:  "text-white",
    labelColor: "text-white",
    countColor: "rgba(255,255,255,0.60)",
    from: { x: -660, y: -250, rotate: -42 },
  },
  {
    name:       "Science",
    Icon:       FlaskConical,
    gradient:   "from-[#82bec6] to-[#3d8c99]",
    glowBase:   "rgba(130,190,198,0.22)",
    glowHover:  "rgba(130,190,198,0.60)",
    iconColor:  "text-white",
    labelColor: "text-white",
    countColor: "rgba(255,255,255,0.65)",
    from: { x:  580, y:  330, rotate:  38 },
  },
  {
    name:       "Space",
    Icon:       Rocket,
    gradient:   "from-[#644536] to-[#3a2518]",
    glowBase:   "rgba(100,69,54,0.22)",
    glowHover:  "rgba(100,69,54,0.55)",
    iconColor:  "text-white",
    labelColor: "text-white",
    countColor: "rgba(255,255,255,0.55)",
    from: { x: -720, y: -175, rotate: -50 },
  },
  {
    name:       "Robots",
    Icon:       Bot,
    gradient:   "from-[#e88062] to-[#b54a28]",
    glowBase:   "rgba(232,128,98,0.22)",
    glowHover:  "rgba(232,128,98,0.60)",
    iconColor:  "text-white",
    labelColor: "text-white",
    countColor: "rgba(255,255,255,0.60)",
    from: { x:  640, y: -290, rotate:  44 },
  },
  {
    name:       "Architecture",
    Icon:       Building2,
    gradient:   "from-[#ffffff] to-[#d0d0d0]",
    glowBase:   "rgba(180,180,180,0.22)",
    glowHover:  "rgba(180,180,180,0.50)",
    iconColor:  "text-gray-600",
    labelColor: "text-gray-800",
    countColor: "rgba(30,30,30,0.55)",
    from: { x: -700, y:  295, rotate: -38 },
  },
];

// Categories created in WooCommerce that have no bespoke card above still get
// a home-page tile: a rotating generic palette with a puzzle icon.
const genericPalettes = [
  { gradient: "from-[#7a5fd0] to-[#452e91]", glowBase: "rgba(122,95,208,0.22)", glowHover: "rgba(122,95,208,0.60)" },
  { gradient: "from-[#f0b93e] to-[#b3831a]", glowBase: "rgba(240,185,62,0.22)", glowHover: "rgba(240,185,62,0.60)" },
  { gradient: "from-[#5cc48f] to-[#2b8f5c]", glowBase: "rgba(92,196,143,0.22)", glowHover: "rgba(92,196,143,0.60)" },
];

function genericMeta(name: string, i: number): CategoryMeta {
  const palette = genericPalettes[i % genericPalettes.length];
  const from    = categoryMeta[i % categoryMeta.length].from;
  return {
    name,
    Icon:       Puzzle,
    ...palette,
    iconColor:  "text-white",
    labelColor: "text-white",
    countColor: "rgba(255,255,255,0.60)",
    from,
  };
}

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

  const [categories, setCategories] = useState(() =>
    categoryMeta.map((meta) => ({ ...meta, count: 0 }))
  );

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (data.length === 0) return; // keep the placeholder cards
        const counts = new Map<string, number>();
        for (const p of data) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
        let extra = 0;
        setCategories(
          orderCategories(counts.keys()).map((name) => {
            const known = categoryMeta.find((m) => m.name === name);
            const meta  = known ?? genericMeta(name, extra++);
            return { ...meta, count: counts.get(name) ?? 0 };
          })
        );
      })
      .catch(() => {});
  }, []);

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
                  <cat.Icon className={`${ICON_SIZE} ${cat.iconColor}`} strokeWidth={SW} />
                </div>
                <div className={`font-playfair font-bold text-sm sm:text-base leading-tight ${cat.labelColor}`}>
                  {cat.name}
                </div>
                <div className="mt-1 text-xs font-inter" style={{ color: cat.countColor }}>
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
