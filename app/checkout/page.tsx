"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag, Smartphone, Loader2, AlertCircle,
  ChevronLeft, CreditCard, Radio,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { api } from "@/lib/api";
import type { PaymentMethod } from "@/lib/api";

type Step = "form" | "waiting" | "failed";

const METHOD_OPTIONS: { id: PaymentMethod; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: "mpesa",  label: "M-Pesa",       sub: "Safaricom STK push",  icon: <Smartphone size={18} /> },
  { id: "airtel", label: "Airtel Money", sub: "Airtel STK push",     icon: <Radio size={18} /> },
  { id: "card",   label: "Card",         sub: "Visa / Mastercard",   icon: <CreditCard size={18} /> },
];

export default function CheckoutPage() {
  const router              = useRouter();
  const { state, dispatch, totalPrice } = useCart();
  const [step, setStep]     = useState<Step>("form");
  const [error, setError]   = useState("");
  const [orderId, setOrderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedMethod, setSubmittedMethod] = useState<PaymentMethod>("mpesa");
  const pollRef             = useRef<ReturnType<typeof setInterval> | null>(null);

  const [form, setForm] = useState({
    name:           "",
    phone:          "",
    address:        "",
    payment_method: "mpesa" as PaymentMethod,
  });

  const isMobile = form.payment_method === "mpesa" || form.payment_method === "airtel";

  /* ── Redirect to shop if cart is empty ── */
  useEffect(() => {
    if (state.items.length === 0 && step === "form") {
      router.replace("/shop");
    }
  }, [state.items.length, step, router]);

  /* ── Poll for payment status (mobile methods only) ── */
  useEffect(() => {
    if (step !== "waiting" || !orderId) return;

    let attempts = 0;
    const MAX    = 20; // 20 × 4s = 80s

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const result = await api.getMpesaStatus(orderId);

        if (result.status === "paid") {
          clearInterval(pollRef.current!);
          dispatch({ type: "CLEAR_CART" });
          router.push(`/checkout/confirmation/${orderId}`);
        } else if (result.status === "failed" || result.status === "cancelled") {
          clearInterval(pollRef.current!);
          setError(result.failure_reason || "Payment was declined or cancelled.");
          setStep("failed");
        } else if (attempts >= MAX) {
          clearInterval(pollRef.current!);
          const provider = submittedMethod === "airtel" ? "Airtel Money" : "M-Pesa";
          setError(`Payment timed out. The ${provider} prompt may have expired. Please try again.`);
          setStep("failed");
        }
      } catch {
        if (attempts >= MAX) {
          clearInterval(pollRef.current!);
          setError("Could not confirm payment. Please check your mobile money messages.");
          setStep("failed");
        }
      }
    }, 4000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [step, orderId, router, dispatch, submittedMethod]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    try {
      const result = await api.createOrder({
        customer_name:    form.name.trim(),
        customer_phone:   form.phone.trim(),
        delivery_address: form.address.trim(),
        payment_method:   form.payment_method,
        items: state.items.map((i) => ({
          product_id:   i.id,
          product_name: i.name,
          product_slug: i.slug,
          quantity:     i.quantity,
          unit_price:   i.price,
        })),
      });

      setSubmittedMethod(form.payment_method);

      if (form.payment_method === "card" && result.checkout_url) {
        window.location.href = result.checkout_url;
        return;
      }

      setOrderId(result.order_id);
      setStep("waiting");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  }

  /* ─────────────────── WAITING SCREEN ─────────────────── */
  if (step === "waiting") {
    const provider = submittedMethod === "airtel" ? "Airtel Money" : "M-Pesa";
    return (
      <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-brand-purple/30 animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Smartphone size={36} className="text-brand-purple" />
            </div>
          </div>
          <h2 className="font-playfair font-bold text-3xl text-white">
            Check Your Phone
          </h2>
          <p className="text-white/60 font-inter text-sm leading-relaxed max-w-xs mx-auto">
            A {provider} payment prompt has been sent to{" "}
            <strong className="text-white">{form.phone}</strong>.
            Enter your PIN to complete the purchase.
          </p>
          <div className="flex items-center justify-center gap-2 text-white/40 font-inter text-xs">
            <Loader2 size={14} className="animate-spin" />
            Waiting for confirmation…
          </div>
          <p className="text-white/25 font-inter text-xs">
            The prompt expires in ~60 seconds.
          </p>
        </div>
      </main>
    );
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
            onClick={() => { setStep("form"); setError(""); setOrderId(""); }}
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

        {/* Back link */}
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
                {/* Name */}
                <div>
                  <label className="block text-white/50 text-xs font-inter mb-1.5">Full Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. John Kamau"
                    className="w-full bg-brand-dark/[0.07] border border-brand-dark/20 rounded-xl px-4 py-3 text-brand-dark font-inter text-sm placeholder:text-brand-dark/40 focus:outline-none focus:border-brand-purple/60 transition-colors"
                  />
                </div>

                {/* Phone — only for mobile payment methods */}
                {isMobile && (
                  <div>
                    <label className="block text-white/50 text-xs font-inter mb-1.5">
                      {form.payment_method === "airtel" ? "Airtel Money" : "M-Pesa"} Phone Number
                    </label>
                    <input
                      required={isMobile}
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="0712 345 678"
                      className="w-full bg-brand-dark/[0.07] border border-brand-dark/20 rounded-xl px-4 py-3 text-brand-dark font-inter text-sm placeholder:text-brand-dark/40 focus:outline-none focus:border-brand-purple/60 transition-colors"
                    />
                    <p className="text-white/25 text-xs font-inter mt-1.5">
                      The payment prompt will be sent to this number.
                    </p>
                  </div>
                )}

                {/* Address */}
                <div>
                  <label className="block text-white/50 text-xs font-inter mb-1.5">
                    Delivery Address
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Estate / street, Nairobi. Any landmark or notes for our rider"
                    className="w-full bg-brand-dark/[0.07] border border-brand-dark/20 rounded-xl px-4 py-3 text-brand-dark font-inter text-sm placeholder:text-brand-dark/40 focus:outline-none focus:border-brand-purple/60 transition-colors resize-none"
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
                  {form.payment_method === "card" ? "Redirecting…" : "Sending prompt…"}
                </>
              ) : (
                <>
                  {selected.icon}
                  Pay {formatPrice(totalPrice)} via {selected.label}
                </>
              )}
            </button>

            <p className="text-white/25 text-xs text-center font-inter">
              {form.payment_method === "card"
                ? "You will be redirected to a secure card payment page."
                : `You will receive a ${selected.label} prompt. Enter your PIN to confirm.`}
            </p>

            <Link
              href="/shop"
              className="block text-center text-brand-dark/50 hover:text-brand-dark font-inter text-sm underline underline-offset-4 transition-colors"
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
