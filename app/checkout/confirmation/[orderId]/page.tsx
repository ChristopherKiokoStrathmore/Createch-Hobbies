import { CheckCircle2, ShoppingBag, MapPin, Phone, Receipt, Clock } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import ClearCart from "./ClearCart";
import PendingPoller from "./PendingPoller";

interface Props {
  params:      Promise<{ orderId: string }>;
  searchParams: Promise<Record<string, string>>;
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { orderId } = await params;
  const sp = await searchParams;

  let order;
  try {
    order = await api.getOrder(orderId);
  } catch {
    // iPay has redirected here but Django may not have updated yet
    order = null;
  }

  /* ── PENDING: iPay confirmed but Django hasn't updated yet ── */
  if (!order || order.status === "pending" || order.status === "processing") {
    // sp.ivm or sp.qwh are params iPay appends on redirect
    const hasIPayRedirect = !!(sp.ivm || sp.qwh || sp.afd);
    return (
      <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-brand-yellow/20 animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Clock size={36} className="text-brand-yellow" />
            </div>
          </div>
          <h1 className="font-playfair font-bold text-3xl text-white">
            {hasIPayRedirect ? "Payment Received" : "Order Pending"}
          </h1>
          <p className="text-white/60 font-inter text-sm leading-relaxed max-w-xs mx-auto">
            {hasIPayRedirect
              ? "Your payment has been received. We are confirming your order — this usually takes a few seconds."
              : "Your order is being processed. Please wait while we confirm payment."}
          </p>
          <PendingPoller orderId={orderId} />
          <Link
            href="/shop"
            className="inline-block text-white/30 hover:text-white font-inter text-sm underline underline-offset-4 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  /* ── FAILED ── */
  if (order.status === "failed" || order.status === "cancelled") {
    return (
      <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-200 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-red-700" />
          </div>
          <h1 className="font-playfair font-bold text-3xl text-white">Payment Failed</h1>
          <p className="text-white/60 font-inter text-sm">
            The payment for order #{orderId} was not completed. Please try again.
          </p>
          <Link
            href="/checkout"
            className="inline-block btn-yellow px-8 py-3 rounded-full font-inter font-bold text-sm"
          >
            Try Again
          </Link>
        </div>
      </main>
    );
  }

  /* ── SUCCESS ── */
  const total = parseFloat(order.total_amount);

  return (
    <main className="min-h-screen bg-brand-dark pt-24 pb-16 px-4 sm:px-6">
      <ClearCart />
      <div className="max-w-lg mx-auto">

        <div className="text-center mb-8">
          <div className="relative mx-auto w-20 h-20 mb-5">
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 size={48} className="text-green-400" />
            </div>
          </div>
          <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-white mb-2">
            Payment Confirmed!
          </h1>
          <p className="text-white/50 font-inter text-sm">
            Thank you, <strong className="text-white">{order.customer_name}</strong>.
            Your order is being prepared.
          </p>
        </div>

        <div className="section-card rounded-2xl p-6 border border-white/5 space-y-5">

          {order.mpesa_receipt_number && (
            <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <Receipt size={16} className="text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-green-400 text-xs font-inter font-semibold uppercase tracking-wider mb-0.5">
                  Payment Receipt
                </p>
                <p className="text-white font-bold font-inter">
                  {order.mpesa_receipt_number}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Phone size={15} className="text-white/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-white/40 text-xs font-inter">Phone</p>
                <p className="text-white text-sm font-inter">{order.customer_phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={15} className="text-white/30 mt-0.5 shrink-0" />
              <div>
                <p className="text-white/40 text-xs font-inter">Delivery Address</p>
                <p className="text-white text-sm font-inter">{order.delivery_address}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag size={14} className="text-brand-yellow" />
              <p className="text-white/40 text-xs font-inter uppercase tracking-wider">Items</p>
            </div>
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <p className="text-white/70 text-sm font-inter">
                  {item.product_name}
                  <span className="text-white/30"> × {item.quantity}</span>
                </p>
                <span className="text-white text-sm font-bold font-inter shrink-0">
                  {formatPrice(item.quantity * Number(item.unit_price))}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 flex items-center justify-between">
            <span className="text-white/50 font-inter text-sm">Total Paid</span>
            <span className="font-playfair font-bold text-2xl text-white">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        <div className="mt-5 bg-brand-purple/10 border border-brand-purple/20 rounded-xl px-4 py-3 text-center">
          <p className="text-brand-purple font-inter text-sm font-medium">
            Delivery usually within 1–2 days. We will call you to confirm.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-block btn-yellow px-8 py-3 rounded-full font-inter font-bold text-sm"
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </main>
  );
}
