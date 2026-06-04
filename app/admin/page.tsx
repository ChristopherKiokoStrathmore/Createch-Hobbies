"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Lock, TrendingUp, Package, CheckCircle,
  Clock, AlertCircle, ShoppingBag,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { formatPrice } from "@/lib/utils";
import {
  AdminOrder, OrdersResponse, STATUS_STYLES,
  formatDate, apiFetchOrders,
} from "./_types";

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold font-inter capitalize ${
        STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

/* ─────────────────────────────── Lock Screen ─────────────────────────────── */
function LockScreen() {
  const { login }    = useAdminAuth();
  const [key, setKey]      = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]  = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const clean = key.trim().replace(/[^\x20-\x7E]/g, "");
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "X-Admin-Key": clean },
      });
      if (res.status === 401) {
        setError("Invalid key. Try again.");
        return;
      }
      login(clean);
    } catch {
      setError("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Lock size={18} className="text-brand-yellow" />
          <h1 className="font-playfair font-bold text-2xl text-white">
            Admin Dashboard
          </h1>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-brand-charcoal rounded-2xl p-6 border border-white/5 space-y-4"
        >
          <div>
            <label className="block text-white/50 text-xs font-inter mb-1.5">
              Admin Key
            </label>
            <input
              type="password"
              required
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="Enter admin key"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-yellow/60 transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-xs font-inter">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-yellow text-brand-dark py-3 rounded-full font-inter font-bold text-sm hover:bg-brand-yellow-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Checking…" : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Dashboard ───────────────────────────────── */
function Dashboard() {
  const { pin, signOut }     = useAdminAuth();
  const [orders, setOrders]  = useState<AdminOrder[]>([]);
  const [total, setTotal]    = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data: OrdersResponse = await apiFetchOrders(pin, { page_size: "100" });
      setOrders(data.results ?? []);
      setTotal(data.count ?? 0);
    } catch {
      signOut();
    } finally {
      setLoading(false);
    }
  }, [pin, signOut]);

  useEffect(() => { load(); }, [load]);

  const paid      = orders.filter(o => o.status === "paid");
  const pending   = orders.filter(o => o.status === "pending");
  const failed    = orders.filter(o => o.status === "failed" || o.status === "cancelled");
  const revenue   = paid.reduce((s, o) => s + parseFloat(o.total_amount), 0);
  const todayStr  = new Date().toDateString();
  const todayCount = orders.filter(o => new Date(o.created_at).toDateString() === todayStr).length;

  const kpis = [
    { label: "Total Revenue", value: formatPrice(revenue),        icon: TrendingUp,  color: "text-green-400"      },
    { label: "Orders Today",  value: String(todayCount),          icon: Package,     color: "text-blue-400"       },
    { label: "Paid",          value: String(paid.length),         icon: CheckCircle, color: "text-brand-yellow"   },
    { label: "Pending",       value: String(pending.length),      icon: Clock,
      color: pending.length > 0 ? "text-orange-400" : "text-white/30" },
  ];

  const recent = [...orders]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  return (
    <div className="p-6 sm:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-playfair font-bold text-3xl text-white">Dashboard</h1>
        <p className="text-white/40 font-inter text-sm mt-1">
          {new Date().toLocaleDateString("en-KE", {
            weekday: "long", day: "numeric", month: "long", year: "numeric",
          })}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-brand-charcoal rounded-2xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/40 font-inter text-xs uppercase tracking-widest">{label}</p>
              <Icon size={16} className={color} strokeWidth={1.5} />
            </div>
            <p className="font-playfair font-bold text-3xl text-white">
              {loading ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Failed alert */}
      {!loading && failed.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 mb-6" style={{ background: "#1a0505", border: "1px solid rgba(239,68,68,0.5)" }}>
          <AlertCircle size={15} style={{ color: "#f87171", flexShrink: 0 }} />
          <p className="font-inter text-sm font-semibold" style={{ color: "#f87171" }}>
            {failed.length} failed / cancelled {failed.length === 1 ? "order" : "orders"}.{" "}
            <Link href="/admin/orders" className="underline" style={{ color: "#fca5a5" }}>
              Review →
            </Link>
          </p>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-brand-charcoal rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShoppingBag size={14} className="text-brand-yellow" />
            <h2 className="font-inter font-semibold text-white text-sm">Recent Orders</h2>
          </div>
          <Link
            href="/admin/orders"
            className="text-brand-yellow hover:text-brand-yellow-dark font-inter text-xs transition-colors"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-white/30 font-inter text-sm">Loading…</div>
        ) : recent.length === 0 ? (
          <div className="py-16 text-center text-white/30 font-inter text-sm">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-inter text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Date", "Customer", "Items", "Total", "Status"].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-white/30 text-xs font-medium uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((o, i) => (
                  <tr
                    key={o.id}
                    className={`border-b border-white/5 last:border-0 ${
                      i % 2 !== 0 ? "bg-white/[0.015]" : ""
                    }`}
                  >
                    <td className="px-5 py-3.5 text-white/40 text-xs whitespace-nowrap">
                      {formatDate(o.created_at)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-white font-medium">{o.customer_name}</p>
                      <p className="text-white/40 text-xs">{o.customer_phone}</p>
                    </td>
                    <td className="px-5 py-3.5 text-white/60 text-xs">
                      {o.items.map((it, j) => (
                        <div key={j}>{it.product_name} ×{it.quantity}</div>
                      ))}
                    </td>
                    <td className="px-5 py-3.5 text-white font-bold whitespace-nowrap">
                      {formatPrice(parseFloat(o.total_amount))}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-white/20 font-inter text-xs text-center mt-5">
        {total} order{total !== 1 ? "s" : ""} on record
      </p>
    </div>
  );
}

/* ─────────────────────────────── Page ───────────────────────────────────── */
export default function AdminPage() {
  const { pin, loaded } = useAdminAuth();
  if (!loaded) return null;
  if (!pin)    return <LockScreen />;
  return <Dashboard />;
}
