"use client";

import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

// Shared form primitives for /account/*. The field classes come from
// lib/form-classes so the checkout and the account pages stay identical.

export { INPUT_CLASS, TEXTAREA_CLASS, SELECT_CLASS, CARD_CLASS } from "@/lib/form-classes";

export function Field({
  label, children, hint, required,
}: {
  label:     string;
  children:  ReactNode;
  hint?:     string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-white/50 text-xs font-inter mb-1.5">
        {label}
        {required && <span className="text-brand-yellow"> *</span>}
      </label>
      {children}
      {hint && <p className="text-white/25 text-xs font-inter mt-1.5">{hint}</p>}
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="flex items-start gap-2 bg-red-100 border border-red-300 rounded-xl px-4 py-3">
      <AlertCircle size={15} className="text-red-700 mt-0.5 shrink-0" />
      <p className="text-red-700 text-sm font-inter">{message}</p>
    </div>
  );
}

export function FormNotice({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-green-500/15 border border-green-500/30 rounded-xl px-4 py-3">
      <p className="text-green-300 text-sm font-inter">{message}</p>
    </div>
  );
}

export function SubmitButton({
  busy, children, busyLabel = "Please wait…",
}: {
  busy:       boolean;
  children:   ReactNode;
  busyLabel?: string;
}) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full btn-yellow py-4 rounded-full font-inter font-bold text-base active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {busy ? busyLabel : children}
    </button>
  );
}
