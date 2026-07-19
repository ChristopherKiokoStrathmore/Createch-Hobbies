"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const difficultyStyles: Record<string, string> = {
  Beginner:
    "bg-green-100 text-green-800 border-green-300",
  Intermediate:
    "bg-amber-100 text-amber-800 border-amber-300",
  Advanced:
    "bg-brand-purple/15 text-brand-purple border-brand-purple/30",
};
const defaultDifficultyStyle = "bg-gray-100 text-gray-800 border-gray-300";

const categoryEmoji: Record<string, string> = {
  Vehicles: "🚗",
  Machines: "⚙️",
  Science: "🔬",
  Space: "🚀",
  Robots: "🤖",
  Architecture: "🏗️",
};
const defaultCategoryEmoji = "🧩";

interface Props {
  product:  Product;
  priority?: boolean;
  compact?:  boolean; // true = 2-col grid with overlay, false = full card with text below
}

export default function ProductCard({ product, priority = false, compact = true }: Props) {
  const { dispatch } = useCart();
  const soldOut = !product.inStock;

  function addToCart() {
    if (soldOut) return;
    dispatch({
      type: "ADD_ITEM",
      item: {
        id:       product.id,
        slug:     product.slug,
        name:     product.name,
        price:    product.price,
        quantity: 1,
        image:    product.images[0],
      },
    });
  }

  return (
    <div className="group section-card rounded-xl sm:rounded-2xl overflow-hidden border border-white/5 hover:border-brand-yellow/20 transition-all duration-300 sm:hover:-translate-y-1 card-glow flex flex-col">
      {/* Image */}
      <Link
        href={`/shop/${product.slug}`}
        className={`block relative overflow-hidden bg-[#120e1e] ${compact ? "aspect-square sm:aspect-[4/3]" : "aspect-[4/3]"}`}
      >
        {/* Fallback emoji */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl sm:text-7xl select-none opacity-30">
            {categoryEmoji[product.category] ?? defaultCategoryEmoji}
          </span>
        </div>

        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}

        {/* Compact overlay: gradient + name + price (grid mode only) */}
        {compact && (
          <div className="sm:hidden absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pt-6 pb-2 px-2">
            <p className="font-playfair font-bold text-white text-[11px] leading-tight line-clamp-1">
              {product.name}
            </p>
            <div className="flex items-center justify-between mt-0.5">
              <span className="font-bold text-brand-yellow text-[10px] font-inter">
                {formatPrice(product.price)}
              </span>
              {soldOut ? (
                <span className="bg-white/20 text-white/70 px-2 py-0.5 rounded-full text-[9px] font-bold font-inter">
                  Sold out
                </span>
              ) : (
                <button
                  onClick={(e) => { e.preventDefault(); addToCart(); }}
                  className="flex items-center gap-0.5 bg-brand-yellow/90 active:bg-brand-yellow text-brand-dark px-2 py-0.5 rounded-full text-[9px] font-bold font-inter active:scale-95 transition-transform"
                >
                  <ShoppingCart size={8} />
                  Add
                </button>
              )}
            </div>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-1.5 left-1.5 sm:top-3 sm:left-3 flex flex-col items-start gap-1">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[8px] sm:text-xs font-medium px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-white/10 font-inter">
            {product.ageRange} yrs
          </span>
          {soldOut && (
            <span className="bg-red-600/80 backdrop-blur-sm text-white text-[8px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full border border-white/10 font-inter">
              Out of stock
            </span>
          )}
        </div>
        {product.featured && (
          <div className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3">
            <span
              className="text-[8px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-inter"
              style={{ background: "linear-gradient(135deg, #f5be4d, #d4a030)", color: "#0a0a0f" }}
            >
              Popular
            </span>
          </div>
        )}
      </Link>

      {/* Full card content: always shown in list mode, desktop-only in grid mode */}
      <div className={`flex flex-col flex-1 p-3 sm:p-5 ${compact ? "hidden sm:flex" : "flex"}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            href={`/shop/${product.slug}`}
            className="font-playfair font-bold text-white text-base sm:text-lg leading-tight hover:text-brand-purple transition-colors"
          >
            {product.name}
          </Link>
          <span className={`shrink-0 text-[10px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border font-inter ${difficultyStyles[product.difficulty] ?? defaultDifficultyStyle}`}>
            {product.difficulty}
          </span>
        </div>

        <p className="hidden sm:block text-white/40 text-sm leading-relaxed mb-4 flex-1 font-inter">
          {product.description.slice(0, 85)}...
        </p>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <span className="font-playfair font-bold text-lg sm:text-2xl text-white">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={addToCart}
            disabled={soldOut}
            className={`flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-inter ${
              soldOut
                ? "bg-white/10 text-white/40 cursor-not-allowed"
                : "btn-yellow active:scale-95"
            }`}
          >
            <ShoppingCart size={11} className="sm:hidden" />
            <ShoppingCart size={13} className="hidden sm:block" />
            <span className="hidden sm:inline">{soldOut ? "Sold Out" : "Add to Cart"}</span>
            <span className="sm:hidden">{soldOut ? "Sold Out" : "Add"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
