"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag, Smartphone, Loader2, AlertCircle,
  ChevronLeft, CreditCard, Radio,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

type PaymentMethod = "mpesa" | "airtel" | "card";
type Step = "form" | "failed";

const METHOD_OPTIONS: { id: PaymentMethod; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: "mpesa",  label: "M-Pesa",       sub: "Safaricom M-Pesa",   icon: <Smartphone size={18} /> },
  { id: "airtel", label: "Airtel Money", sub: "Airtel Money Kenya",  icon: <Radio size={18} /> },
  { id: "card",   label: "Card",         sub: "Visa / Mastercard",  icon: <CreditCard size={18} /> },
];

export default function CheckoutPage() {
  const router              = useRouter();
  const { state, totalPrice } = useCart();
  const [step, setStep]     = useState<Step>("form");
  const [error, setError]   = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name:           "",
    phone:          "",
    email:          "",
    address:        "",
    payment_method: "mpesa" as PaymentMethod,
  });

  useEffect(() => {
    if (state.items.length === 0 && step === "form") {
      router.replace("/shop");
    }
  }, [state.items.length, step, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/ipay/initiate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name:    form.name.trim(),
          customer_phone:   form.phone.trim(),
          customer_email:   form.email.trim(),
          delivery_address: form.address.trim(),
          payment_method:   form.payment_method,
          total:            totalPrice,
          items: state.items.map((i) => ({
            product_id:   i.id,
            product_name: i.name,
            product_slug: i.slug,
            quantity:     i.quantity,
            unit_price:   i.price,
          })),
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error ?? "Failed to initiate payment");

      const { fields, ipayUrl } = result;

      const formEl = document.createElement("form");
      formEl.method = "POST";
      formEl.action = ipayUrl;
      Object.entries(fields as Record<string, string>).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type  = "hidden";
        input.name  = key;
        input.value = value;
        formEl.appendChild(input);
      });
      document.body.appendChild(formEl);
      formEl.submit();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  /* ─────────────────── FAILED SCREEN ─────────────────── */
  if (step === "failed") {
    return (
      <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-200 flex items-center justify-center">
            <AlertCircle size={32} className="text-red-700" />
          </div>
          <h2 className="font-playfair font-bold text-3xl text-white">Payment Failed</h2>
          <p className="text-white/60 font-inter text-sm">{error}</p>
          <button
            onClick={() => { setStep("form"); setError(""); }}
            className="btn-yellow px-8 py-3 rounded-full font-inter font-bold text-sm"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  /* ─────────────────── CHECKOUT FORM ─────────────────── */
  const selected = METHOD_OPTIONS.find((m) => m.id === form.payment_method)!;

  return (
    <main className="min-h-screen bg-brand-dark pt-24 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white font-inter text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={16} /> Back to Shop
        </Link>

        <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-white mb-8">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Payment Method */}
            <div className="section-card rounded-2xl p-6 border border-white/5">
              <h2 className="font-inter font-semibold text-white mb-4 text-sm uppercase tracking-widest">
                Payment Method
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {METHOD_OPTIONS.map((opt) => {
                  const active = form.payment_method === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setForm({ ...form, payment_method: opt.id })}
                      className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-4 border transition-colors text-center ${
                        active
                          ? "border-brand-yellow bg-brand-yellow/10 text-brand-yellow"
                          : "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
                      }`}
                    >
                      {opt.icon}
                      <span className="font-inter font-semibold text-xs">{opt.label}</span>
                      <span className="font-inter text-[10px] opacity-60 leading-tight">{opt.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Details */}
            <div className="section-card rounded-2xl p-6 border border-white/5">
              <h2 className="font-inter font-semibold text-white mb-5 text-sm uppercase tracking-widest">
                Delivery Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/50 text-xs font-inter mb-1.5">Full Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. John Kamau"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-yellow/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-inter mb-1.5">Phone Number</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0712 345 678"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-yellow/60 transition-colors"
                  />
                  {(form.payment_method === "mpesa" || form.payment_method === "airtel") && (
                    <p className="text-white/25 text-xs font-inter mt-1.5">
                      iPay will send a {form.payment_method === "airtel" ? "Airtel Money" : "M-Pesa"} prompt to this number.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-inter mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. john@gmail.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-yellow/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-inter mb-1.5">Delivery Address</label>
                  <textarea
                    required
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Estate / street, Nairobi. Any landmark or notes for our rider"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-yellow/60 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-100 border border-red-300 rounded-xl px-4 py-3">
                <AlertCircle size={15} className="text-red-700 mt-0.5 shrink-0" />
                <p className="text-red-700 text-sm font-inter">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-yellow py-4 rounded-full font-inter font-bold text-base active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Redirecting to iPay…
                </>
              ) : (
                <>
                  {selected.icon}
                  Pay {formatPrice(totalPrice)} via {selected.label}
                </>
              )}
            </button>

            <p className="text-white/25 text-xs text-center font-inter">
              You will be redirected to iPay&apos;s secure payment page to complete your purchase.
            </p>

            <Link
              href="/shop"
              className="block text-center text-white/30 hover:text-white font-inter text-sm underline underline-offset-4 transition-colors"
            >
              ← Continue Shopping
            </Link>
          </form>

          {/* ── Order summary ── */}
          <div className="section-card rounded-2xl p-6 border border-white/5 lg:sticky lg:top-28">
            <div className="flex items-center gap-2 mb-5">
              <ShoppingBag size={16} className="text-brand-purple" />
              <h2 className="font-inter font-semibold text-white text-sm uppercase tracking-widest">
                Order Summary
              </h2>
            </div>

            <div className="space-y-3 mb-5">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-white font-inter text-sm font-medium line-clamp-1">
                      {item.name}
                    </p>
                    <p className="text-white/40 font-inter text-xs">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-white font-bold font-inter text-sm shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
              <span className="text-white/60 font-inter text-sm">Total</span>
              <span className="font-playfair font-bold text-2xl text-white">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <p className="mt-3 text-white/25 text-xs font-inter">
              Delivery across Nairobi, usually 1–2 days. Delivery fee TBD.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
