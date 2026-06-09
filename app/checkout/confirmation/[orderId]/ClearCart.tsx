"use client";

import { useEffect } from "react";
import { useCart } from "@/context/CartContext";

export default function ClearCart() {
  const { dispatch } = useCart();
  useEffect(() => { dispatch({ type: "CLEAR_CART" }); }, [dispatch]);
  return null;
}
