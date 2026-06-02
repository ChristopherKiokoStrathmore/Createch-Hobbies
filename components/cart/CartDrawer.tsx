"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
  const { state, dispatch, totalItems, totalPrice } = useCart();

  /* Lock body scroll while drawer is open */
  useEffect(() => {
    if (state.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [state.isOpen]);

  if (!state.isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm"
        onClick={() => dispatch({ type: "CLOSE_CART" })}
      />

      {/* Drawer panel */}
      <div className="fixed inset-y-0 right-0 z-[160] w-full max-w-sm flex flex-col bg-brand-charcoal border-l border-white/10 shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-brand-yellow" />
            <span className="font-playfair font-bold text-white text-lg">Your Cart</span>
            {totalItems > 0 && (
              <span className="bg-brand-yellow text-brand-dark text-xs font-bold px-2 py-0.5 rounded-full font-inter">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={() => dispatch({ type: "CLOSE_CART" })}
            aria-label="Close cart"
            className="text-white/50 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {state.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
              <ShoppingBag size={40} className="text-white/15" />
              <p className="text-white/40 font-inter text-sm">Your cart is empty.</p>
              <button
                onClick={() => dispatch({ type: "CLOSE_CART" })}
                className="text-brand-yellow text-sm font-semibold font-inter hover:underline"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            state.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/10 shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm font-inter leading-snug line-clamp-2">
                    {item.name}
                  </p>
                  <p className="text-brand-yellow text-sm font-bold font-inter mt-1">
                    {formatPrice(item.price)}
                  </p>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => dispatch({ type: "SET_QUANTITY", id: item.id, quantity: item.quantity - 1 })}
                      className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-white/50 hover:text-white transition-colors"
                    >
                      <Minus size={10} />
                    </button>
                    <span className="text-white text-sm font-bold font-inter w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => dispatch({ type: "SET_QUANTITY", id: item.id, quantity: item.quantity + 1 })}
                      className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-white/50 hover:text-white transition-colors"
                    >
                      <Plus size={10} />
                    </button>
                  </div>
                </div>

                {/* Line total + remove */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-white font-bold text-sm font-inter">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <button
                    onClick={() => dispatch({ type: "REMOVE_ITEM", id: item.id })}
                    aria-label="Remove item"
                    className="text-white/25 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="px-4 pb-6 pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/60 font-inter text-sm">Subtotal</span>
              <span className="text-white font-bold font-playfair text-xl">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <p className="text-white/30 text-xs font-inter">
              Delivery fee calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={() => dispatch({ type: "CLOSE_CART" })}
              className="btn-yellow w-full flex items-center justify-center py-4 rounded-full text-sm font-bold font-inter active:scale-[0.98] transition-transform"
            >
              Checkout — {formatPrice(totalPrice)}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
