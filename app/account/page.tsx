"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Package, MapPin, LogOut, Loader2, ShoppingBag } from "lucide-react";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { formatPrice } from "@/lib/utils";
import type { CustomerOrder } from "@/lib/customerAuth";
import {
  INPUT_CLASS, TEXTAREA_CLASS, SELECT_CLASS, CARD_CLASS,
  Field, FormError, FormNotice, SubmitButton,
} from "@/components/account/ui";
import { DELIVERY_ZONES, zoneCounties, zonesByRegion } from "@/data/delivery-zones";

type Tab = "orders" | "address";

// Customer-facing wording for WooCommerce's internal status slugs. "Processing"
// means paid-and-being-packed to Woo, which reads as limbo to a customer.
const STATUS_LABEL: Record<string, string> = {
  pending:    "Awaiting payment",
  processing: "Being packed",
  "on-hold":  "On hold",
  completed:  "Delivered",
  cancelled:  "Cancelled",
  refunded:   "Refunded",
  failed:     "Payment failed",
};

const STATUS_STYLE: Record<string, string> = {
  pending:    "bg-amber-500/15 text-amber-300 border-amber-500/30",
  processing: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  "on-hold":  "bg-amber-500/15 text-amber-300 border-amber-500/30",
  completed:  "bg-green-500/15 text-green-300 border-green-500/30",
  cancelled:  "bg-white/10 text-white/40 border-white/15",
  refunded:   "bg-white/10 text-white/40 border-white/15",
  failed:     "bg-red-500/15 text-red-300 border-red-500/30",
};

function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

/* ─────────────────────────────── Orders ─────────────────────────────── */

function OrdersPanel() {
  const [orders, setOrders]   = useState<CustomerOrder[] | null>(null);
  const [error, setError]     = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res  = await fetch("/api/account/orders", { cache: "no-store" });
        const data = (await res.json().catch(() => ({}))) as { orders?: CustomerOrder[]; error?: string };
        if (cancelled) return;
        if (!res.ok) { setError(data.error || "Could not load your orders."); setOrders([]); return; }
        setOrders(data.orders ?? []);
      } catch {
        if (!cancelled) { setError("Could not load your orders."); setOrders([]); }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (orders === null) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-white/40 font-inter text-sm">
        <Loader2 size={16} className="animate-spin" />
        Loading your orders…
      </div>
    );
  }

  if (error) return <FormError message={error} />;

  if (orders.length === 0) {
    return (
      <div className={`${CARD_CLASS} text-center py-14`}>
        <ShoppingBag size={36} className="text-white/15 mx-auto mb-4" />
        <p className="text-white/40 font-inter text-sm mb-5">You have not placed any orders yet.</p>
        <Link
          href="/shop"
          className="btn-yellow inline-flex items-center justify-center px-7 py-3 rounded-full font-inter font-bold text-sm"
        >
          Browse the Kits
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className={CARD_CLASS}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-white/5">
            <div>
              <div className="font-inter font-semibold text-white text-sm">Order #{order.number}</div>
              <div className="text-white/35 font-inter text-xs mt-0.5">{formatDate(order.date)}</div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-[11px] font-semibold px-3 py-1 rounded-full border font-inter ${
                  STATUS_STYLE[order.status] ?? "bg-white/10 text-white/50 border-white/15"
                }`}
              >
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
              <span className="font-playfair font-bold text-white text-lg">
                {formatPrice(order.total)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={`${order.id}-${i}`} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 shrink-0">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {item.slug ? (
                    <Link
                      href={`/shop/${item.slug}`}
                      className="font-inter text-sm text-white hover:text-brand-yellow transition-colors block truncate"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span className="font-inter text-sm text-white block truncate">{item.name}</span>
                  )}
                  <span className="font-inter text-xs text-white/35">Qty {item.quantity}</span>
                </div>
                <span className="font-inter text-sm text-white/70 shrink-0">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>

          {order.payment && (
            <div className="mt-4 pt-3 border-t border-white/5 text-white/30 font-inter text-xs">
              Paid by {order.payment}
              {order.shipping > 0 && <> · Delivery {formatPrice(order.shipping)}</>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────── Addresses ────────────────────────────── */

function AddressPanel() {
  const { customer, save } = useCustomerAuth();

  const counties = zoneCounties(DELIVERY_ZONES);

  // Mirrors how the checkout writes an address: street in address_1, the
  // delivery area in address_2, the county in city. Keeping the shape identical
  // is what lets the checkout pre-fill straight from this record.
  const [form, setForm] = useState({
    first_name: "", last_name: "", phone: "",
    county:     counties[0] ?? "Nairobi",
    area:       "",
    street:     "",
  });
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!customer) return;
    const b = customer.billing;
    setForm({
      first_name: b.first_name || customer.first_name || "",
      last_name:  b.last_name  || customer.last_name  || "",
      phone:      b.phone      || "",
      county:     b.city       || counties[0] || "Nairobi",
      area:       b.address_2  || "",
      street:     b.address_1  || "",
    });
    // counties is derived from a module-level constant, so it is stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  const regionGroups = zonesByRegion(DELIVERY_ZONES, form.county);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await save({
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        billing: {
          first_name: form.first_name.trim(),
          last_name:  form.last_name.trim(),
          company:    "",
          phone:      form.phone.trim(),
          address_1:  form.street.trim(),
          address_2:  form.area,
          city:       form.county,
          state:      "KE47",
          postcode:   "00100",
          country:    "KE",
        },
      });
      setNotice("Your delivery details are saved. Checkout will fill them in for you next time.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your details could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={CARD_CLASS}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormNotice message={notice} />
        <FormError message={error} />

        <div className="grid grid-cols-2 gap-3">
          <Field label="First Name">
            <input
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              placeholder="John"
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Last Name">
            <input
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              placeholder="Kamau"
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Field label="Contact Phone">
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="e.g. 0712 345 678"
            className={INPUT_CLASS}
          />
        </Field>

        {counties.length > 1 && (
          <Field label="City / County">
            <select
              value={form.county}
              onChange={(e) => setForm({ ...form, county: e.target.value, area: "" })}
              className={SELECT_CLASS}
            >
              {counties.map((c) => (
                <option key={c} value={c} className="bg-brand-dark text-white">{c}</option>
              ))}
            </select>
          </Field>
        )}

        <Field
          label="Delivery Area (Neighbourhood)"
          hint="Delivery is priced by distance from our Westlands hub."
        >
          <select
            value={form.area}
            onChange={(e) => setForm({ ...form, area: e.target.value })}
            className={SELECT_CLASS}
          >
            <option value="" className="bg-brand-dark text-white/50">Select a neighbourhood…</option>
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
        </Field>

        <Field label="Street / House / Landmark">
          <textarea
            rows={3}
            value={form.street}
            onChange={(e) => setForm({ ...form, street: e.target.value })}
            placeholder="e.g. Kindaruma Rd, Apt 4B — opposite the Shell station"
            className={TEXTAREA_CLASS}
          />
        </Field>

        <SubmitButton busy={busy} busyLabel="Saving…">Save Delivery Details</SubmitButton>
      </form>
    </div>
  );
}

/* ─────────────────────────────── Page ─────────────────────────────── */

export default function AccountPage() {
  const router = useRouter();
  const { customer, loading, signOut } = useCustomerAuth();
  const [tab, setTab] = useState<Tab>("orders");

  useEffect(() => {
    if (!loading && !customer) router.replace("/account/login?next=/account");
  }, [loading, customer, router]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.replace("/");
  }, [signOut, router]);

  if (loading || !customer) {
    return (
      <main className="min-h-screen bg-brand-dark flex items-center justify-center">
        <Loader2 size={22} className="animate-spin text-white/30" />
      </main>
    );
  }

  const displayName = customer.first_name || customer.email.split("@")[0];

  return (
    <main className="min-h-screen bg-brand-dark px-4 sm:px-6 pt-28 pb-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-playfair font-bold text-3xl md:text-4xl text-white">
              Hi, {displayName}
            </h1>
            <p className="text-white/35 font-inter text-sm mt-1">{customer.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-white/40 hover:text-white font-inter text-sm transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {([
            { id: "orders",  label: "My Orders",     icon: <Package size={15} /> },
            { id: "address", label: "Delivery Details", icon: <MapPin size={15} /> },
          ] as const).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-inter text-sm font-semibold transition-colors ${
                tab === t.id
                  ? "bg-brand-yellow text-brand-dark"
                  : "bg-white/5 text-white/50 hover:text-white hover:bg-white/10"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "orders" ? <OrdersPanel /> : <AddressPanel />}
      </div>
    </main>
  );
}
