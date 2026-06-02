"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/data/products";

export default function OrderButton({ product }: { product: Product }) {
  const { dispatch }  = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
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
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center justify-center gap-3 font-bold text-lg px-8 py-4 rounded-full transition-all active:scale-95 font-inter ${
        added
          ? "bg-green-500 text-white"
          : "btn-yellow"
      }`}
    >
      {added ? (
        <>
          <Check size={20} />
          Added to Cart
        </>
      ) : (
        <>
          <ShoppingCart size={20} />
          Add to Cart
        </>
      )}
    </button>
  );
}
