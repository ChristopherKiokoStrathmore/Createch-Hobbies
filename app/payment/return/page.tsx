"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

type State = "loading" | "paid" | "notpaid";

interface StatusResult {
  paid: boolean;
  status: string;
  amount: string | null;
  currency: string | null;
}

// verifyToken is authoritative, so retries only absorb brief verify lag. A
// not-completed payment stays DPO-"pending" (the token remains payable), so a
// long window wouldn't flip it to paid — it just makes a non-payer wait. Keep
// it short: ~6s.
const MAX_ATTEMPTS = 3;
const POLL_INTERVAL = 2000;  // ms

function formatAmount(r: StatusResult): string | null {
  if (!r.amount) return null;
  return r.currency ? `${r.currency} ${r.amount}` : r.amount;
}

function ReturnInner() {
  const params = useSearchParams();
  // DPO appends TransactionToken (== TransID). This token is the ONLY payment
  // truth — the backend runs verifyToken against it. CCDapproval is ignored: it
  // is forgeable and never trusted. CompanyRef is used for display only.
  const token = params.get("TransactionToken") ?? params.get("TransID") ?? "";
  const companyRef = params.get("CompanyRef") ?? params.get("PnrID") ?? "";

  const { dispatch } = useCart();
  const [state, setState] = useState<State>("loading");
  const [result, setResult] = useState<StatusResult | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;

    if (!token) {
      setState("notpaid");
      return;
    }

    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const res = await fetch(
          `/api/payment/status?token=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );
        if (cancelled.current) return;

        // 400 = terminal bad/unknown token → stop, don't burn the retry window.
        if (res.status === 400) {
          setState("notpaid");
          return;
        }

        if (res.ok) {
          const data = (await res.json()) as StatusResult;
          if (data.paid || data.status === "paid") {
            // Payment confirmed via verifyToken — now it's safe to clear the cart.
            dispatch({ type: "CLEAR_CART" });
            setResult(data);
            setState("paid");
            return;
          }
          if (data.status === "failed") {
            // Terminal in DPO's model — explicit cancel or token expiry.
            setState("notpaid");
            return;
          }
          // status === "pending" (DPO 900, "not paid yet") → retry to absorb
          // verify lag. A failed *attempt* also reads pending because the token
          // stays payable, so this usually exhausts to "not completed" rather
          // than flipping — expected, not a bug.
        }
        // 502 (DPO unreachable, transient) also falls through to retry.
      } catch {
        // network hiccup — fall through to retry / give up
      }

      if (cancelled.current) return;
      if (attempts >= MAX_ATTEMPTS) {
        setState("notpaid");
        return;
      }
      setTimeout(poll, POLL_INTERVAL);
    }

    poll();
    return () => {
      cancelled.current = true;
    };
  }, [token, dispatch]);

  /* ── Loading ── */
  if (state === "loading") {
    return (
      <Shell>
        <div className="mx-auto w-16 h-16 rounded-full bg-brand-yellow/20 flex items-center justify-center">
          <Loader2 size={32} className="text-brand-yellow animate-spin" />
        </div>
        <h1 className="font-playfair font-bold text-3xl text-white">
          Confirming your payment…
        </h1>
        <p className="text-white/60 font-inter text-sm leading-relaxed">
          Hang tight while we verify your transaction with the payment provider.
          This usually takes a few seconds.
        </p>
      </Shell>
    );
  }

  /* ── Success ── */
  if (state === "paid" && result) {
    const amount = formatAmount(result);
    return (
      <Shell>
        <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        <h1 className="font-playfair font-bold text-3xl text-white">
          Payment confirmed
        </h1>
        <p className="text-white/60 font-inter text-sm leading-relaxed">
          Thank you! Your payment has been received and your order is being
          prepared. A confirmation will follow shortly.
        </p>

        {(companyRef || amount) && (
          <div className="section-card rounded-2xl p-5 border border-white/5 text-left space-y-2">
            {companyRef && (
              <div className="flex items-center justify-between">
                <span className="text-white/50 font-inter text-xs uppercase tracking-widest">Order</span>
                <span className="text-white font-inter font-semibold text-sm">#{companyRef}</span>
              </div>
            )}
            {amount && (
              <div className="flex items-center justify-between">
                <span className="text-white/50 font-inter text-xs uppercase tracking-widest">Amount</span>
                <span className="text-white font-inter font-semibold text-sm">{amount}</span>
              </div>
            )}
          </div>
        )}

        <Link
          href="/shop"
          className="btn-yellow inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-inter font-bold text-sm"
        >
          <ShoppingBag size={16} /> Continue Shopping
        </Link>
      </Shell>
    );
  }

  /* ── Not completed (failed or still-unconfirmed) ── */
  return (
    <Shell>
      <div className="mx-auto w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center">
        <AlertCircle size={32} className="text-red-400" />
      </div>
      <h1 className="font-playfair font-bold text-3xl text-white">
        Payment not completed
      </h1>
      <p className="text-white/60 font-inter text-sm leading-relaxed">
        We couldn&apos;t confirm your payment. If money was deducted, don&apos;t worry —
        it will be reconciled or refunded automatically. You can safely try again.
      </p>
      <Link
        href="/checkout"
        className="btn-yellow inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-inter font-bold text-sm"
      >
        Back to Checkout <ArrowRight size={16} />
      </Link>
      <Link
        href="/shop"
        className="block text-white/30 hover:text-white font-inter text-sm underline underline-offset-4 transition-colors"
      >
        Continue Shopping
      </Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-md w-full text-center space-y-6">{children}</div>
    </main>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-yellow/20 flex items-center justify-center">
            <Loader2 size={32} className="text-brand-yellow animate-spin" />
          </div>
          <h1 className="font-playfair font-bold text-3xl text-white">
            Confirming your payment…
          </h1>
        </Shell>
      }
    >
      <ReturnInner />
    </Suspense>
  );
}
