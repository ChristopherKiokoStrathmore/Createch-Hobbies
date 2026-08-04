"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag, Smartphone, Loader2, AlertCircle,
  ChevronLeft, CreditCard, CheckCircle2, Banknote, Tag, X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { formatPrice } from "@/lib/utils";
import { SELECT_CLASS } from "@/lib/form-classes";
import {
  DELIVERY_ZONES,
  zoneCounties,
  zonesByRegion,
  zoneFee,
  type DeliveryZone,
} from "@/data/delivery-zones";
import {
  initCart,
  syncCartItems,
  checkoutWoo,
  updateCartCustomer,
  applyCoupon,
  removeCoupon,
  selectShippingRate,
  normalisePhone,
  isValidMpesaPhone,
  type WooBillingAddress,
  type WooCartSnapshot,
} from "@/lib/woo-store";

type Step = "form" | "pending" | "paid" | "failed" | "cod-placed";

// M-Pesa confirmation polling. The STK prompt itself lives ~60s on the phone;
// poll a little past that so a slow PIN entry still resolves on-screen.
const MPESA_POLL_INTERVAL = 3000; // ms
const MPESA_POLL_MAX_ATTEMPTS = 40; // ~2 minutes

// Which payment methods appear is decided in WooCommerce (Settings →
// Payments): the checkout offers every enabled gateway it knows how to
// drive. The gateway's own title (set in wp-admin) is used as the label.
type MethodKind = "mpesa" | "card" | "cod";

interface MethodOption {
  id:    string;
  kind:  MethodKind;
  label: string;
}

const KIND_BY_GATEWAY: Record<string, MethodKind> = {
  wc_mpesa_stk:    "mpesa",
  woocommerce_dpo: "card",
  cod:             "cod",
};

// Cards always read M-Pesa → Card → Pay on Delivery, whatever order
// WooCommerce lists the gateways in.
const KIND_ORDER: Record<MethodKind, number> = { mpesa: 0, card: 1, cod: 2 };

const KIND_META: Record<MethodKind, { icon: ReactNode; sub: string }> = {
  mpesa: { icon: <Smartphone size={18} />, sub: "Safaricom STK Push" },
  card:  { icon: <CreditCard size={18} />, sub: "Visa / Mastercard" },
  cod:   { icon: <Banknote size={18} />,   sub: "Cash or M-Pesa at the door" },
};

// Shown until /api/payment-methods answers (and if it can't). Whether the
// Pay-on-Delivery card actually appears is decided by WooCommerce: it only
// shows once the "Cash on delivery" gateway is enabled in wp-admin
// (Settings → Payments) — otherwise the lookup just returns M-Pesa + Card.
const FALLBACK_METHODS: MethodOption[] = [
  { id: "wc_mpesa_stk",    kind: "mpesa", label: "M-Pesa" },
  { id: "woocommerce_dpo", kind: "card",  label: "Card" },
  { id: "cod",             kind: "cod",   label: "Pay on Delivery" },
];

// All deliveries are within Nairobi, so a placeholder address is enough for
// WooCommerce to resolve the shipping zone and price the delivery. The real
// address the customer types goes on the checkout request itself.
const PLACEHOLDER_BILLING: WooBillingAddress = {
  first_name: "Guest",
  last_name:  "-",
  email:      "orders@createch-hobbies.co.ke",
  phone:      "0700000000",
  address_1:  "Nairobi",
  city:       "Nairobi",
  country:    "KE",
  state:      "KE47",
  postcode:   "00100",
};

// A selectable payment tile (used for the top cards and the M-Pesa sub-options).
const payTileClass = (active: boolean) =>
  `flex flex-col items-center gap-1.5 rounded-xl px-3 py-4 border-2 transition-colors text-center ${
    active
      ? "border-black bg-black text-brand-yellow shadow-md"
      : "border-black/15 bg-white/60 text-black/70 hover:bg-white/80 hover:border-black/40 hover:text-black"
  }`;


export default function CheckoutPage() {
  const router                  = useRouter();
  const { state, totalPrice, dispatch } = useCart();
  const { customer } = useCustomerAuth();
  const [step, setStep]         = useState<Step>("form");
  const [error, setError]       = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<number | null>(null);
  const [pendingOrderKey, setPendingOrderKey] = useState<string | null>(null);
  const [paidReceipt, setPaidReceipt] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);

  const [methods, setMethods] = useState<MethodOption[]>(FALLBACK_METHODS);
  const [methodsLoaded, setMethodsLoaded] = useState(false);
  const [zones, setZones]     = useState<DeliveryZone[]>(DELIVERY_ZONES);
  const [wooCart, setWooCart] = useState<WooCartSnapshot | null>(null);
  const [cartBusy, setCartBusy] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const sessionRef = useRef<{ cartToken: string; nonce: string } | null>(null);

  // Payment selection is a two-level choice: the top card (M-Pesa or Card),
  // and — under M-Pesa — whether to Pay Now (STK push) or Pay on Delivery (no
  // charge now). These resolve to an actual WooCommerce gateway id below.
  const [payGroup, setPayGroup]   = useState<"mpesa" | "card">("mpesa");
  const [mpesaMode, setMpesaMode] = useState<"now" | "delivery">("now");

  const [form, setForm] = useState({
    name:          "",
    phone:         "",
    email:         "",
    county:        "Nairobi",
    neighbourhood: "",
    address:       "",
    mpesa_phone:   "",
  });

  useEffect(() => {
    if (state.items.length === 0 && step === "form") {
      router.replace("/shop");
    }
  }, [state.items.length, step, router]);

  // Pre-fill from the signed-in customer's saved address. This runs once, when
  // the session first resolves: filling on every change would fight the
  // customer for the keyboard if they edit a field for this order only.
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (!customer || prefilledRef.current) return;
    prefilledRef.current = true;

    const b        = customer.billing;
    const fullName = [b.first_name || customer.first_name, b.last_name || customer.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    setForm((f) => ({
      ...f,
      name:          f.name          || fullName,
      phone:         f.phone         || b.phone      || "",
      email:         f.email         || customer.email,
      county:        b.city          || f.county,
      neighbourhood: f.neighbourhood || b.address_2  || "",
      address:       f.address       || b.address_1  || "",
      mpesa_phone:   f.mpesa_phone   || b.phone      || "",
    }));
  }, [customer]);

  // Offer whatever gateways are enabled in WooCommerce (of the kinds this
  // checkout can drive). Only the gateways actually enabled in wp-admin are
  // shown; the fallback is used only if the lookup fails. We hold the cards
  // behind `methodsLoaded` so a fallback method never flashes on screen and
  // then vanishes when the real (shorter) list arrives.
  useEffect(() => {
    fetch("/api/payment-methods")
      .then((r) => r.json())
      .then((gateways: { id: string; title: string }[]) => {
        const options = gateways
          .filter((g) => KIND_BY_GATEWAY[g.id])
          .map((g) => ({
            id:    g.id,
            kind:  KIND_BY_GATEWAY[g.id],
            label: g.title || FALLBACK_METHODS.find((m) => m.id === g.id)?.label || g.id,
          }))
          .sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);
        if (options.length > 0) {
          setMethods(options);
          // Default to the M-Pesa card when either of its modes is available,
          // otherwise Card. Within M-Pesa default to Pay Now when STK is on.
          const hasStk = options.some((o) => o.kind === "mpesa");
          const hasCod = options.some((o) => o.kind === "cod");
          setPayGroup(hasStk || hasCod ? "mpesa" : "card");
          setMpesaMode(hasStk ? "now" : "delivery");
        }
      })
      .catch(() => {})
      .finally(() => setMethodsLoaded(true));
  }, []);

  // Delivery zones (county → neighbourhood) come from the createch-delivery-fees
  // plugin via /api/delivery-zones — the same table that prices the order. The
  // bundled list is the initial value and the fallback if that fetch fails.
  useEffect(() => {
    fetch("/api/delivery-zones")
      .then((r) => r.json())
      .then((z: DeliveryZone[]) => {
        if (Array.isArray(z) && z.length > 0) {
          setZones(z);
          const countyList = zoneCounties(z);
          setForm((f) => (countyList.includes(f.county) ? f : { ...f, county: countyList[0] ?? f.county }));
        }
      })
      .catch(() => {});
  }, []);

  // Keep the latest chosen neighbourhood reachable from the item-sync effect
  // without making it a dependency (which would re-sync the whole cart on every
  // area change). The area only needs to ride along so it survives a re-sync.
  const neighbourhoodRef = useRef("");
  neighbourhoodRef.current = form.neighbourhood;

  // Load server-side totals: sync the local cart into a WooCommerce cart
  // session and read back the real money — sale prices, coupon discounts and
  // the per-neighbourhood delivery fee from the createch-delivery-fees plugin.
  // If this fails, the page falls back to locally-computed totals and checkout
  // still works.
  const itemsKey = JSON.stringify(state.items.map((i) => [i.id, i.quantity]));
  useEffect(() => {
    if (state.items.length === 0) return;
    let cancelled = false;

    (async () => {
      setCartBusy(true);
      try {
        const { cartToken, nonce } = await initCart();
        const synced = await syncCartItems(
          state.items.map((i) => ({ productId: parseInt(i.id, 10) || 0, quantity: i.quantity })),
          cartToken,
          nonce
        );
        const res = await updateCartCustomer(
          { ...PLACEHOLDER_BILLING, address_2: neighbourhoodRef.current },
          synced.cartToken,
          synced.nonce
        );
        if (cancelled) return;
        sessionRef.current = { cartToken: res.cartToken, nonce: res.nonce };
        setWooCart(res.cart);
      } catch {
        if (!cancelled) setWooCart(null);
      } finally {
        if (!cancelled) setCartBusy(false);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsKey]);

  // The delivery fee is deterministic per neighbourhood (same distance formula
  // the plugin uses), so it's read straight from the already-loaded zone list —
  // no per-selection WooCommerce round-trip. The chosen area is sent on the
  // checkout request, where the plugin re-prices and charges it server-side.

  // While the STK prompt is open, poll WooCommerce (via /api/mpesa/status) for
  // the outcome. Safaricom's callback marks the order paid server-side whether
  // or not the customer is still on this page — polling only decides what the
  // screen shows: paid → clear cart + receipt; failed → retry with cart intact;
  // timeout → keep the honest "we will confirm" copy and stop.
  useEffect(() => {
    if (step !== "pending" || !pendingOrderId || !pendingOrderKey) return;

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const res = await fetch(
          `/api/mpesa/status?order=${pendingOrderId}&key=${encodeURIComponent(pendingOrderKey ?? "")}`,
          { cache: "no-store" },
        );
        if (cancelled) return;

        if (res.status === 400) return; // terminal: bad order/key — stop polling

        if (res.ok) {
          const data = (await res.json()) as { status: string; receipt: string };
          if (data.status === "paid") {
            dispatch({ type: "CLEAR_CART" });
            setPaidReceipt(data.receipt);
            setStep("paid");
            return;
          }
          if (data.status === "failed") {
            setError(
              "The M-Pesa payment was not completed — the prompt may have timed out or been cancelled. No money moved; you can safely try again."
            );
            setStep("failed");
            return;
          }
        }
        // pending or transient error — fall through to retry
      } catch {
        // network hiccup — fall through to retry
      }

      if (cancelled) return;
      if (attempts >= MPESA_POLL_MAX_ATTEMPTS) return;
      setTimeout(poll, MPESA_POLL_INTERVAL);
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [step, pendingOrderId, pendingOrderKey, dispatch]);

  const hasStk         = methods.some((m) => m.kind === "mpesa");
  const hasCard        = methods.some((m) => m.kind === "card");
  const hasCod         = methods.some((m) => m.kind === "cod");
  const mpesaAvailable = hasStk || hasCod;

  // Resolve the top-level choice to the WooCommerce gateway that will record
  // the order.
  const resolved =
    payGroup === "card"
      ? methods.find((m) => m.kind === "card")
      : mpesaMode === "now"
      ? methods.find((m) => m.kind === "mpesa")
      : methods.find((m) => m.kind === "cod");

  const shippingRates = wooCart?.shippingPackages[0]?.rates ?? [];
  const counties      = zoneCounties(zones);
  const regionGroups  = zonesByRegion(zones, form.county);

  // Fee is read locally from the loaded zone list — instant, no round-trip. The
  // order re-prices this server-side at checkout, so the charge matches.
  const deliveryFee   = zoneFee(zones, form.county, form.neighbourhood);
  const itemsSubtotal = wooCart?.itemsTotal ?? totalPrice;
  const discount      = wooCart?.discount ?? 0;
  const displayTotal  = Math.max(0, itemsSubtotal - discount + deliveryFee);

  async function refreshCart(fn: (token: string, nonce: string) => Promise<{ cart: WooCartSnapshot; cartToken: string; nonce: string }>) {
    if (!sessionRef.current) return;
    const res = await fn(sessionRef.current.cartToken, sessionRef.current.nonce);
    sessionRef.current = { cartToken: res.cartToken, nonce: res.nonce };
    setWooCart(res.cart);
  }

  async function handleApplyCoupon() {
    const code = couponInput.trim();
    if (!code || couponBusy) return;
    setCouponBusy(true);
    setCouponError("");
    try {
      await refreshCart((t, n) => applyCoupon(code, t, n));
      setCouponInput("");
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "That code could not be applied.");
    } finally {
      setCouponBusy(false);
    }
  }

  async function handleRemoveCoupon(code: string) {
    if (couponBusy) return;
    setCouponBusy(true);
    setCouponError("");
    try {
      await refreshCart((t, n) => removeCoupon(code, t, n));
    } catch {
      // leave the coupon visible; totals are still correct server-side
    } finally {
      setCouponBusy(false);
    }
  }

  async function handleSelectRate(packageId: number | string, rateId: string) {
    try {
      await refreshCart((t, n) => selectShippingRate(packageId, rateId, t, n));
    } catch {
      // keep previous selection on failure
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");

    if (!resolved) {
      setError("Please choose a payment option.");
      return;
    }

    if (resolved.kind === "mpesa") {
      const normalised = normalisePhone(form.mpesa_phone);
      if (!isValidMpesaPhone(normalised)) {
        setError("Enter your M-Pesa number in the format 0712 345 678 or 2547XXXXXXXX.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Step 1: Init WooCommerce cart session (the stored Cart-Token keeps the
      // same server cart, so an applied coupon or chosen delivery rate sticks).
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
        address_2:  form.neighbourhood,
        city:       "Nairobi",
        country:    "KE",
        state:      "KE47",
        postcode:   "00100",
      };

      // Step 4: Submit checkout to WooCommerce Store API
      const result = await checkoutWoo(
        {
          billing,
          paymentMethod: resolved.id,
          paymentData:
            resolved.kind === "mpesa"
              ? [{ key: "mpesa_phone", value: normalisePhone(form.mpesa_phone) }]
              : [],
        },
        token2,
        nonce2
      );

      // The Store API cart runs as a guest, so the order is created with no
      // customer attached. Adopt it now so it shows up under My Orders. Failure
      // here must never block the payment flow — the order exists either way.
      if (customer) {
        void fetch("/api/account/claim-order", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ orderId: result.orderId, orderKey: result.orderKey }),
        }).catch(() => {});
      }

      if (resolved.kind === "card") {
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

      if (resolved.kind === "cod") {
        // Order placed; payment happens at the door (cash, or an M-Pesa
        // prompt our rider triggers). Safe to clear the cart now.
        dispatch({ type: "CLEAR_CART" });
        setPaidAmount(displayTotal);
        setPendingOrderId(result.orderId);
        setStep("cod-placed");
        return;
      }

      // Keep the cart intact while the STK prompt is open — it is only cleared
      // once polling confirms the payment, so a cancelled/failed/timed-out
      // prompt doesn't wipe the customer's cart (same rule as the card flow).
      setPaidAmount(displayTotal);
      setPendingOrderId(result.orderId);
      setPendingOrderKey(result.orderKey);
      setStep("pending");

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setStep("failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ─── M-Pesa success screen ─── */
  if (step === "paid") {
    return (
      <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="font-playfair font-bold text-3xl text-white">Payment Confirmed!</h2>
          <p className="text-white/60 font-inter text-sm leading-relaxed">
            Thank you! Your M-Pesa payment has been received and your order is
            being prepared. Delivery is usually within 1–2 days — we will call
            you to confirm.
          </p>

          <div className="section-card rounded-2xl p-5 border border-white/5 text-left space-y-2">
            {pendingOrderId && (
              <div className="flex items-center justify-between">
                <span className="text-white/50 font-inter text-xs uppercase tracking-widest">Order</span>
                <span className="text-white font-inter font-semibold text-sm">#{pendingOrderId}</span>
              </div>
            )}
            {paidReceipt && (
              <div className="flex items-center justify-between">
                <span className="text-white/50 font-inter text-xs uppercase tracking-widest">M-Pesa Receipt</span>
                <span className="text-white font-inter font-semibold text-sm">{paidReceipt}</span>
              </div>
            )}
            {paidAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-white/50 font-inter text-xs uppercase tracking-widest">Amount</span>
                <span className="text-white font-inter font-semibold text-sm">{formatPrice(paidAmount)}</span>
              </div>
            )}
          </div>

          <Link
            href="/shop"
            className="btn-yellow inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-inter font-bold text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  /* ─── Pay-on-delivery success screen ─── */
  if (step === "cod-placed") {
    return (
      <main className="min-h-screen bg-brand-dark flex items-center justify-center px-4 pt-24 pb-16">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="font-playfair font-bold text-3xl text-white">Order Placed!</h2>
          <p className="text-white/60 font-inter text-sm leading-relaxed">
            Your order is confirmed and will be delivered within 1–2 days — we
            will call you first. Pay on delivery with cash, or our rider will
            send an M-Pesa prompt to your phone at the door.
          </p>

          <div className="section-card rounded-2xl p-5 border border-white/5 text-left space-y-2">
            {pendingOrderId && (
              <div className="flex items-center justify-between">
                <span className="text-white/50 font-inter text-xs uppercase tracking-widest">Order</span>
                <span className="text-white font-inter font-semibold text-sm">#{pendingOrderId}</span>
              </div>
            )}
            {paidAmount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-white/50 font-inter text-xs uppercase tracking-widest">Due on delivery</span>
                <span className="text-white font-inter font-semibold text-sm">{formatPrice(paidAmount)}</span>
              </div>
            )}
          </div>

          <Link
            href="/shop"
            className="btn-yellow inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full font-inter font-bold text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
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
            <Loader2 size={14} className="animate-spin" />
            Waiting for confirmation — this page will update automatically.
          </div>
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

            {/* Guests only — signing in fills the delivery details below and
                files the order under My Orders. Checkout still works without it. */}
            {!customer && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-yellow/30 bg-brand-dark/80 backdrop-blur-sm px-5 py-4">
                {/* Solid dark panel rather than bg-white/5: this sits over the
                    background video, and a translucent panel left the text
                    unreadable whenever a light frame was showing. */}
                <p className="text-white font-playfair font-semibold text-base">
                  Have an account? Sign in to use your saved details.
                </p>
                <Link
                  href="/account/login?next=/checkout"
                  className="font-inter text-sm font-bold bg-brand-yellow text-brand-dark px-5 py-2 rounded-full hover:brightness-110 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  Sign in
                </Link>
              </div>
            )}

            {/* Payment Method */}
            <div className="section-card rounded-2xl p-6 border border-white/5">
              <h2 className="font-inter font-semibold text-white mb-4 text-sm uppercase tracking-widest">
                Payment Method
              </h2>
              {!methodsLoaded ? (
                // Hold the row until the real gateway list arrives, so a fallback
                // card never shows and then disappears.
                <div className="grid gap-3 grid-cols-2">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-[86px] rounded-xl border-2 border-black/10 bg-white/40 animate-pulse" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Top choice: M-Pesa (first) or Card (second) */}
                  <div className="grid gap-3 grid-cols-2">
                    {mpesaAvailable && (
                      <button
                        type="button"
                        onClick={() => setPayGroup("mpesa")}
                        className={payTileClass(payGroup === "mpesa")}
                      >
                        <Smartphone size={18} />
                        <span className="font-inter font-semibold text-xs">M-Pesa</span>
                        <span className="font-inter text-[10px] opacity-60 leading-tight">Pay now or on delivery</span>
                      </button>
                    )}
                    {hasCard && (
                      <button
                        type="button"
                        onClick={() => setPayGroup("card")}
                        className={payTileClass(payGroup === "card")}
                      >
                        <CreditCard size={18} />
                        <span className="font-inter font-semibold text-xs">Card</span>
                        <span className="font-inter text-[10px] opacity-60 leading-tight">Visa / Mastercard</span>
                      </button>
                    )}
                  </div>

                  {/* Selecting M-Pesa opens two options */}
                  {payGroup === "mpesa" && (
                    <div className="mt-4">
                      <p className="text-white/50 font-inter text-[11px] uppercase tracking-widest mb-2">
                        How would you like to pay?
                      </p>
                      <div className="grid gap-3 grid-cols-2">
                        {hasStk && (
                          <button
                            type="button"
                            onClick={() => setMpesaMode("now")}
                            className={payTileClass(mpesaMode === "now")}
                          >
                            <Smartphone size={16} />
                            <span className="font-inter font-semibold text-xs">Pay Now</span>
                            <span className="font-inter text-[10px] opacity-60 leading-tight">M-Pesa STK push</span>
                          </button>
                        )}
                        {hasCod && (
                          <button
                            type="button"
                            onClick={() => setMpesaMode("delivery")}
                            className={payTileClass(mpesaMode === "delivery")}
                          >
                            <Banknote size={16} />
                            <span className="font-inter font-semibold text-xs">Pay on Delivery</span>
                            <span className="font-inter text-[10px] opacity-60 leading-tight">Cash / M-Pesa at the door</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </>
              )}
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

                {/* City / County — shown only when we deliver to more than one */}
                {counties.length > 1 && (
                  <div>
                    <label className="block text-white/50 text-xs font-inter mb-1.5">
                      City / County <span className="text-brand-yellow">*</span>
                    </label>
                    <select
                      required
                      value={form.county}
                      onChange={(e) => setForm({ ...form, county: e.target.value, neighbourhood: "" })}
                      className={SELECT_CLASS}
                    >
                      {counties.map((c) => (
                        <option key={c} value={c} className="bg-brand-dark text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-white/50 text-xs font-inter mb-1.5">
                    Delivery Area (Neighbourhood) <span className="text-brand-yellow">*</span>
                  </label>
                  <select
                    required
                    value={form.neighbourhood}
                    onChange={(e) => setForm({ ...form, neighbourhood: e.target.value })}
                    className={SELECT_CLASS}
                  >
                    <option value="" disabled className="bg-brand-dark text-white/50">
                      Select a neighbourhood…
                    </option>
                    {regionGroups.map((group) => (
                      <optgroup key={group.region} label={group.region} className="bg-brand-dark text-white">
                        {group.items.map((z) => (
                          <option key={z.neighbourhood} value={z.neighbourhood} className="bg-brand-dark text-white">
                            {z.neighbourhood}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <p className="text-white/25 text-xs font-inter mt-1.5">
                    Delivery is priced by distance from our Westlands hub and shown in the order summary.
                  </p>
                </div>

                <div>
                  <label className="block text-white/50 text-xs font-inter mb-1.5">
                    Street / House / Landmark
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="e.g. Kindaruma Rd, Apt 4B — opposite the Shell station"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-yellow/60 transition-colors resize-none"
                  />
                </div>

                {/* M-Pesa phone field — only for Pay Now (STK push) */}
                {resolved?.kind === "mpesa" && (
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
              ) : resolved?.kind === "cod" ? (
                <>
                  {KIND_META.cod.icon}
                  Place Order — {formatPrice(displayTotal)} on Delivery
                </>
              ) : resolved?.kind === "card" ? (
                <>
                  {KIND_META.card.icon}
                  Pay {formatPrice(displayTotal)} by Card
                </>
              ) : (
                <>
                  {KIND_META.mpesa.icon}
                  Pay {formatPrice(displayTotal)} via M-Pesa
                </>
              )}
            </button>

            <p className="text-white/25 text-xs text-center font-inter">
              {resolved?.kind === "mpesa"
                ? "You will receive an M-Pesa STK push on your phone to confirm."
                : resolved?.kind === "card"
                ? "You will be redirected to DPO Pay's secure card payment page."
                : "No payment now — pay cash or M-Pesa when your order arrives."}
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

            {/* Coupon */}
            <div className="border-t border-white/10 pt-4 mb-4">
              {wooCart && wooCart.coupons.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {wooCart.coupons.map((code) => (
                    <span
                      key={code}
                      className="inline-flex items-center gap-1.5 bg-brand-yellow/15 border border-brand-yellow/30 text-brand-yellow text-xs font-semibold px-3 py-1 rounded-full font-inter uppercase"
                    >
                      <Tag size={11} />
                      {code}
                      <button
                        type="button"
                        onClick={() => handleRemoveCoupon(code)}
                        aria-label={`Remove coupon ${code}`}
                        className="hover:text-white transition-colors"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {wooCart && (
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { e.preventDefault(); handleApplyCoupon(); }
                    }}
                    placeholder="Discount code"
                    className="flex-1 min-w-0 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-inter text-xs placeholder:text-white/20 focus:outline-none focus:border-brand-yellow/60 transition-colors uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponBusy || !couponInput.trim()}
                    className="shrink-0 border border-brand-yellow/50 text-brand-yellow text-xs font-semibold px-4 py-2 rounded-xl font-inter hover:bg-brand-yellow/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {couponBusy ? "…" : "Apply"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-red-400 text-xs font-inter mt-2">{couponError}</p>
              )}
            </div>

            {/* Delivery rate choice — only when WooCommerce offers more than one */}
            {shippingRates.length > 1 && (
              <div className="mb-4 space-y-2">
                <p className="text-white/50 font-inter text-xs uppercase tracking-widest">Delivery Option</p>
                {shippingRates.map((rate) => (
                  <label
                    key={rate.rateId}
                    className="flex items-center justify-between gap-2 cursor-pointer text-sm font-inter"
                  >
                    <span className="flex items-center gap-2 text-white/70">
                      <input
                        type="radio"
                        name="shipping-rate"
                        checked={rate.selected}
                        onChange={() => handleSelectRate(wooCart!.shippingPackages[0].packageId, rate.rateId)}
                        className="accent-[#f5be4d]"
                      />
                      {rate.name}
                    </span>
                    <span className="text-white/70">{rate.price > 0 ? formatPrice(rate.price) : "Free"}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Totals */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex items-center justify-between text-sm font-inter">
                <span className="text-white/50">Subtotal</span>
                <span className="text-white">{formatPrice(wooCart?.itemsTotal ?? totalPrice)}</span>
              </div>
              {wooCart && wooCart.discount > 0 && (
                <div className="flex items-center justify-between text-sm font-inter">
                  <span className="text-brand-yellow">Discount</span>
                  <span className="text-brand-yellow">−{formatPrice(wooCart.discount)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-inter">
                <span className="text-white/50">Delivery</span>
                <span className="text-white">
                  {!form.neighbourhood
                    ? "Select your area"
                    : deliveryFee > 0
                    ? formatPrice(deliveryFee)
                    : "Free"}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-white/60 font-inter text-sm">Total</span>
                <span className="font-playfair font-bold text-2xl text-white inline-flex items-center gap-2">
                  {cartBusy && <Loader2 size={14} className="animate-spin text-white/30" />}
                  {formatPrice(displayTotal)}
                </span>
              </div>
            </div>

            <p className="mt-3 text-white/25 text-xs font-inter">
              Delivery across Nairobi, usually 1–2 days.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
