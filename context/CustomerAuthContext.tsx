"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { Customer } from "@/lib/customerAuth";

// The session token is an httpOnly cookie this code cannot read, so "am I
// signed in?" is answered by asking /api/account once on mount. `loading`
// exists to stop the navbar flashing "Sign In" at a customer who is already
// signed in.

interface CustomerAuthCtx {
  customer: Customer | null;
  loading:  boolean;
  signIn:   (email: string, password: string) => Promise<void>;
  register: (fields: RegisterFields) => Promise<void>;
  signOut:  () => Promise<void>;
  save:     (patch: AccountPatch) => Promise<void>;
  refresh:  () => Promise<void>;
}

export interface RegisterFields {
  email:      string;
  password:   string;
  first_name: string;
  last_name:  string;
  phone:      string;
}

export type AccountPatch = Partial<Pick<Customer, "first_name" | "last_name" | "billing" | "shipping">>;

const CustomerAuthContext = createContext<CustomerAuthCtx | null>(null);

async function post(path: string, body?: unknown): Promise<{ customer?: Customer }> {
  const res = await fetch(path, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { customer?: Customer; error?: string };
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading]   = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res  = await fetch("/api/account", { cache: "no-store" });
      const data = (await res.json().catch(() => ({}))) as { customer?: Customer | null };
      setCustomer(res.ok ? data.customer ?? null : null);
    } catch {
      // Offline or the store is unreachable — treat as signed out rather than
      // blocking the page; nothing on the storefront requires an account.
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { customer: c } = await post("/api/account/login", { email, password });
    setCustomer(c ?? null);
  }, []);

  const register = useCallback(async (fields: RegisterFields) => {
    const { customer: c } = await post("/api/account/register", fields);
    setCustomer(c ?? null);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await post("/api/account/logout");
    } finally {
      // Clear locally even if the request failed — the cookie may already be
      // gone, and leaving the UI "signed in" would be the more confusing bug.
      setCustomer(null);
    }
  }, []);

  const save = useCallback(async (patch: AccountPatch) => {
    const res  = await fetch("/api/account", {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(patch),
    });
    const data = (await res.json().catch(() => ({}))) as { customer?: Customer; error?: string };
    if (!res.ok) throw new Error(data.error || "Your details could not be saved.");
    setCustomer(data.customer ?? null);
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, signIn, register, signOut, save, refresh }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be used inside <CustomerAuthProvider>");
  return ctx;
}
