import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Payment cancelled",
};

export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-brand-yellow/20 flex items-center justify-center">
          <ShoppingCart size={32} className="text-brand-yellow" />
        </div>
        <h1 className="font-playfair font-bold text-3xl text-white">
          Payment cancelled
        </h1>
        <p className="text-white/60 font-inter text-sm leading-relaxed">
          No charge was made. Your cart is saved, so you can pick up right where
          you left off whenever you&apos;re ready.
        </p>
        <Link
          href="/checkout"
          className="btn-yellow inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-inter font-bold text-sm"
        >
          Return to Checkout <ArrowRight size={16} />
        </Link>
        <Link
          href="/shop"
          className="block text-white/30 hover:text-white font-inter text-sm underline underline-offset-4 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
