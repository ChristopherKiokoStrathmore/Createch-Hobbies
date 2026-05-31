"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { products } from "@/data/products";

const categoryMeta = [
  {
    name: "Vehicles",
    emoji: "🚗",
    gradient: "from-[#1a1020] to-[#2a1540]",
    accent: "rgba(117,67,152,0.3)",
  },
  {
    name: "Machines",
    emoji: "⚙️",
    gradient: "from-[#1a1505] to-[#2a2008]",
    accent: "rgba(245,190,77,0.25)",
  },
  {
    name: "Science",
    emoji: "🔬",
    gradient: "from-[#0e1020] to-[#1a1535]",
    accent: "rgba(117,67,152,0.25)",
  },
  {
    name: "Space",
    emoji: "🚀",
    gradient: "from-[#080820] to-[#121530]",
    accent: "rgba(245,190,77,0.2)",
  },
  {
    name: "Robots",
    emoji: "🤖",
    gradient: "from-[#0a1518] to-[#152025]",
    accent: "rgba(117,67,152,0.2)",
  },
  {
    name: "Architecture",
    emoji: "🏗️",
    gradient: "from-[#1a1008] to-[#251808]",
    accent: "rgba(245,190,77,0.22)",
  },
] as const;

/* Counts derived from real product data — always in sync */
const categories = categoryMeta.map((meta) => ({
  ...meta,
  count: products.filter((p) => p.category === meta.name).length,
}));

export default function CategoryShowcase() {
  return (
    <section className="section-alt py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]">
            Browse by Type
          </span>
          <h2 className="font-playfair font-bold text-4xl md:text-5xl text-white mt-4">
            Something for{" "}
            <em className="text-gradient not-italic">Every Kid</em>
          </h2>
          <p className="text-white/40 mt-4 max-w-xl mx-auto text-sm font-inter leading-relaxed">
            From future engineers to space explorers — we have a kit for every curious mind.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link
                href={`/shop?category=${cat.name}`}
                className={`group block bg-gradient-to-br ${cat.gradient} rounded-2xl p-5 border border-white/6 hover:border-brand-yellow/25 hover:-translate-y-1 transition-all duration-300 text-center`}
                style={{
                  boxShadow: `inset 0 1px 0 ${cat.accent}`,
                }}
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {cat.emoji}
                </div>
                <div className="font-playfair font-bold text-white text-sm mb-1">
                  {cat.name}
                </div>
                <div className="text-white/35 text-xs font-inter">
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
