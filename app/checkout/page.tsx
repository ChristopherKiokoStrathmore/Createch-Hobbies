"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag, Smartphone, Loader2, AlertCircle,
  ChevronLeft, CreditCard, CheckCircle2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import {
  initCart,
  syncCartItems,
  checkoutWoo,
  normalisePhone,
  isValidMpesaPhone,
  type WooBillingAddress,
} from "@/lib/woo-store";

type PaymentMethod = "mpesa" | "card";
type Step = "form" | "pending" | "failed";

const METHOD_OPTIONS: { id: PaymentMethod; label: string; sub: string; icon: React.ReactNode }[] = [
  { id: "mpesa", label: "M-Pesa", sub: "Safaricom STK Push", icon: <Smartphone size={18} /> },
  { id: "card",  label: "Card",   sub: "Visa / Mastercard",  icon: <CreditCard  size={18} /> },
];

export default function CheckoutPage() {
  const router                  = useRouter();
  const { state, totalPrice, dispatch } = useCart();
  const [step, setStep]         = useState<Step>("form");
  const [error, setError]       = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name:           "",
    phone:          "",
    email:          "",
    address:        "",
    mpesa_phone:    "",
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

    if (form.payment_method === "mpesa") {
      const normalised = normalisePhone(form.mpesa_phone);
      if (!isValidMpesaPhone(normalised)) {
        setError("Enter your M-Pesa number in the format 0712 345 678 or 2547XXXXXXXX.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Step 1: Init WooCommerce cart session
      const { cartToken, nonce } = await initCart();

      // Step 2: Sync local cart items into WooCommerce cart
      const { cartToken: token2, nonce: nonce2 } = await syncCartItems(
        state.items.map((i) => ({ productId: parseInt(i.id, 10) || 0, quantity: i.quantity })),
        cartToken,
        nonce
      );

      // Step 3: Build billing address for WooCommerce
      const nameParts = form.name.trim().split(/\s+/);
      const firstName = nameParts[0] ?? form.name.trim();
      const lastName  = nameParts.slice(1).join(" ") || "-";

      const billing: WooBillingAddress = {
        first_name: firstName,
        last_name:  lastName,
        email:      form.email.trim() || "orders@createch-hobbies.co.ke",
        phone:      form.phone.trim(),
        address_1:  form.address.trim(),
        city:       "Nairobi",
        country:    "KE",
        state:      "KE47",
        postcode:   "00100",
      };

      // Step 4: Submit checkout to WooCommerce Store API
      const result = await checkoutWoo(
        {
          billing,
          paymentMethod: form.payment_method === "mpesa" ? "wc_mpesa_stk" : "woocommerce_dpo",
          paymentData:
            form.payment_method === "mpesa"
              ? [{ key: "mpesa_phone", value: normalisePhone(form.mpesa_phone) }]
              : [],
        },
        token2,
        nonce2
      );

      if (form.payment_method === "card") {
        if (!result.redirectUrl) {
          setError(
            "The card payment service could not be reached. Please try again shortly or pay via M-Pesa."
          );
          setStep("failed");
          return;
        }
        // Keep the cart intact through the DPO redirect — it is only cleared
        // once /payment/return confirms the payment server-side. This way a
        // cancelled or failed card payment doesn't wipe the customer's cart.
        window.location.href = result.redirectUrl;
        return;
      }

      dispatch({ type: "CLEAR_CART" });
      setPendingOrderId(result.orderId);
      setStep("pending");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ─── M-Pesa pending screen ─── */
  if (step === "pending") {
    return (
      <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-yellow/20 flex items-center justify-center">
            <Smartphone size={32} className="text-brand-yellow" />
          </div>
          <h2 className="font-playfair font-bold text-3xl text-white">Check Your Phone</h2>
          <p className="text-white/60 font-inter text-sm leading-relaxed">
            An M-Pesa prompt has been sent to{" "}
            <strong className="text-white">{normalisePhone(form.mpesa_phone)}</strong>.
            Enter your PIN to complete the payment.
          </p>
          {pendingOrderId && (
            <p className="text-white/30 font-inter text-xs">Order #{pendingOrderId}</p>
          )}
          <div className="flex items-center justify-center gap-2 text-white/40 font-inter text-xs">
            <CheckCircle2 size={14} className="text-green-400" />
            Your order is saved. We will confirm once payment is received.
          </div>
          <Link href="/shop" className="block text-brand-yellow font-inter text-sm underline underline-offset-4">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  /* ─── Failed screen ─── */
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

  /* ─── Checkout form ─── */
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
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="block text-white/50 text-xs font-inter mb-1.5">Contact Phone</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0712 345 678"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-yellow/60 transition-colors"
                  />
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

                {/* M-Pesa phone field — only shown when M-Pesa is selected */}
                {form.payment_method === "mpesa" && (
                  <div>
                    <label className="block text-white/50 text-xs font-inter mb-1.5">
                      M-Pesa Number <span className="text-brand-yellow">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      value={form.mpesa_phone}
                      onChange={(e) => setForm({ ...form, mpesa_phone: e.target.value })}
                      placeholder="e.g. 0712 345 678 or 2547XXXXXXXX"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-yellow/60 transition-colors"
                    />
                    <p className="text-white/25 text-xs font-inter mt-1.5">
                      You will receive an M-Pesa prompt on this number to enter your PIN.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {error && step === "form" && (
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
                  Processing…
                </>
              ) : (
                <>
                  {selected.icon}
                  Pay {formatPrice(totalPrice)} via {selected.label}
                </>
              )}
            </button>

            <p className="text-white/25 text-xs text-center font-inter">
              {form.payment_method === "mpesa"
                ? "You will receive an M-Pesa STK push on your phone to confirm."
                : "You will be redirected to DPO Pay's secure card payment page."}
            </p>

            <Link
              href="/shop"
              className="block text-center text-white/30 hover:text-white font-inter text-sm underline underline-offset-4 transition-colors"
            >
              Continue Shopping
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
                      {formatPrice(item.price)} x {item.quantity}
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
              Delivery across Nairobi, usually 1-2 days. Delivery fee TBD.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
