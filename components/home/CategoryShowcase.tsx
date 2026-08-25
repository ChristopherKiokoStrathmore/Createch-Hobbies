"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { categoryVisual, type CategoryPalette } from "@/lib/category-visuals";

const ICON_SIZE = "w-10 h-10 sm:w-12 sm:h-12";
const SW = 1.5;

type Tile = CategoryPalette & {
  name:  string;
  slug:  string;
  count: number;
  Icon:  ReturnType<typeof categoryVisual>["Icon"];
  from:  { x: number; y: number; rotate: number };
};

// Fly-in vectors, reused round-robin so any number of tiles stays lively.
const FLY_IN = [
  { x:  700, y: -210, rotate:  46 },
  { x: -660, y: -250, rotate: -42 },
  { x:  580, y:  330, rotate:  38 },
  { x: -720, y: -175, rotate: -50 },
  { x:  640, y: -290, rotate:  44 },
  { x: -700, y:  295, rotate: -38 },
];

function makeTiles(cats: Array<{ name: string; slug: string; count: number }>): Tile[] {
  return cats.map((c, i) => {
    const { Icon, palette } = categoryVisual(c.name, i);
    return { ...c, ...palette, Icon, from: FLY_IN[i % FLY_IN.length] };
  });
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

const SKELETON_KEYS  = ["s1", "s2", "s3", "s4"];

const STAGGER        = 0.08;
const CARD_DURATION  = 1.3;
const CARD_TIMES     = [0, 0.35, 0.62, 0.80, 1] as const;
const CARD_EASE      = ["easeOut", "easeOut", "easeInOut", "easeInOut"] as const;

export default function CategoryShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.15 });

  // The tiles ARE the WooCommerce category list: names, order and kit counts all
  // come from /api/categories, which reads the live product-category tree. No
  // category name is written down here, so nothing can go stale — until the
  // answer arrives the tiles are blank skeletons, and if the store has no
  // categories (or is unreachable) the section hides itself rather than
  // inventing aisles that lead to an empty shop.
  const [categories, setCategories] = useState<Tile[] | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: Array<{ name: string; slug: string; count: number }>) => {
        setCategories(makeTiles(Array.isArray(data) ? data : []));
      })
      .catch(() => setCategories([]));
  }, []);

  if (categories?.length === 0) return null;

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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {categories === null &&
            SKELETON_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-2xl min-h-[160px] sm:min-h-[180px] animate-pulse"
                style={{ backgroundColor: "rgba(10,10,15,0.06)" }}
              />
            ))}

          {categories?.map((cat, i) => (
            <motion.div
              key={cat.slug}
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
                href={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group block rounded-2xl p-5 sm:p-6 text-center min-h-[160px] sm:min-h-[180px] flex flex-col items-center justify-center"
                style={{
                  backgroundImage: cat.gradient,
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
                  <cat.Icon className={`${ICON_SIZE} text-white`} strokeWidth={SW} />
                </div>
                <div className="font-playfair font-bold text-sm sm:text-base leading-tight text-white">
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
