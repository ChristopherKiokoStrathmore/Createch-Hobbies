"use client";

import { useState } from "react";
import { X, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import ProductImage from "@/components/products/ProductImage";
import type { Product } from "@/data/products";

const categoryEmoji: Record<string, string> = {
  Vehicles: "🚗", Machines: "⚙️", Science: "🔬",
  Space: "🚀", Robots: "🤖", Architecture: "🏗️",
};

const PHONE = "254742152233";

interface Props {
  product: Product;
  onClose: () => void;
}

export default function CartModal({ product, onClose }: Props) {
  const [qty, setQty] = useState(1);
  const total = product.price * qty;

  const sendOrder = () => {
    const msg = encodeURIComponent(
      `🛒 *Order from Createch Hobbies*\n\n• ${product.name} × ${qty}    ${formatPrice(product.price * qty)}\n\n*Estimated Total: ${formatPrice(total)}*\n\nPlease confirm my order and delivery details. Thank you!`
    );
    window.open(`https://wa.me/${PHONE}?text=${msg}`, "_blank", "noopener,noreferrer");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Cart panel — styled after WhatsApp's native cart UI */}
      <div
        className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl z-10"
        style={{ background: "#111b21" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/8">
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
          <span className="font-semibold text-white text-base font-inter">Your cart</span>
        </div>

        {/* Count + Add more */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <span className="text-[#25D366] text-sm font-semibold font-inter">
            {qty} item{qty !== 1 ? "s" : ""}
          </span>
          <button
            onClick={onClose}
            className="border border-[#25D366] text-[#25D366] text-xs font-semibold px-4 py-1.5 rounded-full font-inter hover:bg-[#25D366]/10 transition-colors"
          >
            Add more
          </button>
        </div>

        {/* Product row */}
        <div
          className="mx-4 rounded-xl p-3.5 flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/10 shrink-0 relative">
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              fallbackEmoji={categoryEmoji[product.category]}
            />
          </div>

          {/* Name + qty controls */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm font-inter mb-2.5 leading-snug">
              {product.name}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-6 h-6 rounded-full border border-white/25 flex items-center justify-center text-white/60 hover:border-white/60 hover:text-white transition-colors"
              >
                <Minus size={11} />
              </button>
              <span className="text-white text-sm font-inter font-bold min-w-[1.25rem] text-center">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-6 h-6 rounded-full border border-white/25 flex items-center justify-center text-white/60 hover:border-white/60 hover:text-white transition-colors"
              >
                <Plus size={11} />
              </button>
            </div>
          </div>

          {/* Line price */}
          <span className="text-white font-semibold text-sm font-inter shrink-0">
            {formatPrice(product.price * qty)}
          </span>
        </div>

        {/* Divider */}
        <div className="mx-4 mt-4 mb-3 border-t border-white/8" />

        {/* Estimated total */}
        <div className="flex items-center justify-between px-5">
          <span className="text-white font-bold text-sm font-inter">Estimated total</span>
          <span className="text-white font-bold text-sm font-inter">{formatPrice(total)}</span>
        </div>

        {/* Legal disclaimer — matches WhatsApp's wording */}
        <p className="px-5 mt-3 text-white/35 text-[11px] font-inter leading-relaxed">
          By continuing, you agree to share your cart, profile name and phone number with
          the business so it can confirm your order and total price, including any delivery
          fees and discounts.
        </p>

        {/* Send to business */}
        <div className="px-4 pt-5 pb-8 sm:pb-5">
          <button
            onClick={sendOrder}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] text-white font-bold py-4 rounded-full text-base transition-all font-inter"
          >
            Send to business
          </button>
        </div>
      </div>
    </div>
  );
}
