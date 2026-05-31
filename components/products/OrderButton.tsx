"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import CartModal from "@/components/cart/CartModal";
import type { Product } from "@/data/products";

export default function OrderButton({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-lg px-8 py-4 rounded-full transition-all hover:shadow-xl hover:shadow-green-500/20 active:scale-95 font-inter"
      >
        <MessageCircle size={20} />
        Order via WhatsApp
      </button>

      {open && <CartModal product={product} onClose={() => setOpen(false)} />}
    </>
  );
}
