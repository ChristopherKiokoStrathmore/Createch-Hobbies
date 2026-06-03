"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const difficultyStyles = {
  Beginner:
    "bg-green-100 text-green-800 border-green-300",
  Intermediate:
    "bg-amber-100 text-amber-800 border-amber-300",
  Advanced:
    "bg-brand-purple/15 text-brand-purple border-brand-purple/30",
};

const categoryEmoji: Record<string, string> = {
  Vehicles: "🚗",
  Machines: "⚙️",
  Science: "🔬",
  Space: "🚀",
  Robots: "🤖",
  Architecture: "🏗️",
};

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { dispatch } = useCart();

  function addToCart() {
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
    <div className="group section-card rounded-2xl overflow-hidden border border-white/5 hover:border-brand-yellow/20 transition-all duration-300 hover:-translate-y-1 card-glow flex flex-col">
      {/* Image */}
      <Link
        href={`/shop/${product.slug}`}
        className="block relative aspect-[4/3] overflow-hidden bg-[#120e1e]"
      >
        {/* Fallback emoji shown behind image */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl select-none opacity-30">
            {categoryEmoji[product.category]}
          </span>
        </div>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3">
          <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/10 font-inter">
            {product.ageRange} yrs
          </span>
        </div>
        {product.featured && (
          <div className="absolute top-3 right-3">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full font-inter"
              style={{
                background: "linear-gradient(135deg, #f5be4d, #d4a030)",
                color: "#0a0a0f",
              }}
            >
              Popular
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link
            href={`/shop/${product.slug}`}
            className="font-playfair font-bold text-white text-lg leading-tight hover:text-brand-purple transition-colors"
          >
            {product.name}
          </Link>
          <span
            className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border font-inter ${difficultyStyles[product.difficulty]}`}
          >
            {product.difficulty}
          </span>
        </div>

        <p className="text-white/40 text-sm leading-relaxed mb-4 flex-1 font-inter">
          {product.description.slice(0, 85)}...
        </p>

        <div className="flex items-center justify-between gap-3">
          <span className="font-playfair font-bold text-2xl text-white">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={addToCart}
            className="flex items-center gap-1.5 btn-yellow px-4 py-2 rounded-full text-sm active:scale-95 font-inter"
          >
            <ShoppingCart size={13} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
