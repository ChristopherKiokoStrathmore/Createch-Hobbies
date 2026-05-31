"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { featuredProducts } from "@/data/products";
import ProductCard from "@/components/products/ProductCard";

export default function FeaturedProducts() {
  return (
    <section className="section-base py-14 sm:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 sm:mb-14 gap-3 sm:gap-4"
        >
          <div>
            <span className="text-brand-purple-light font-inter font-semibold text-xs uppercase tracking-[0.2em]">
              Top Picks
            </span>
            <h2 className="font-playfair font-bold text-3xl sm:text-4xl md:text-5xl text-white mt-4">
              Most Popular{" "}
              <em className="text-gradient not-italic">Kits</em>
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-brand-yellow hover:text-brand-yellow/80 font-semibold transition-colors text-sm shrink-0 group"
          >
            View All 17 Kits{" "}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
