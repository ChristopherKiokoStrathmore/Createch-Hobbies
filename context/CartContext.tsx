"use client";

import { createContext, useContext, useReducer, useEffect, ReactNode } from "react";

export interface CartItem {
  id:       string;
  slug:     string;
  name:     string;
  price:    number;
  quantity: number;
  image:    string;
}

interface CartState {
  items:  CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "ADD_ITEM";        item: CartItem }
  | { type: "REMOVE_ITEM";     id: string }
  | { type: "SET_QUANTITY";    id: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "HYDRATE";         items: CartItem[] };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.id === action.item.id);
      return {
        ...state,
        isOpen: true,
        items: existing
          ? state.items.map((i) =>
              i.id === action.item.id
                ? { ...i, quantity: i.quantity + action.item.quantity }
                : i
            )
          : [...state.items, action.item],
      };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "SET_QUANTITY":
      if (action.quantity <= 0)
        return { ...state, items: state.items.filter((i) => i.id !== action.id) };
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "HYDRATE":
      return { ...state, items: action.items };
    default:
      return state;
  }
}

const CartContext = createContext<{
  state:       CartState;
  dispatch:    React.Dispatch<CartAction>;
  totalItems:  number;
  totalPrice:  number;
} | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], isOpen: false });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ch_cart");
      if (saved) dispatch({ type: "HYDRATE", items: JSON.parse(saved) });
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("ch_cart", JSON.stringify(state.items));
  }, [state.items]);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = state.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ state, dispatch, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
