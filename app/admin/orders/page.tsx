"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search, RefreshCw, Download, X, Copy, CheckCheck,
  ChevronLeft, ChevronRight, Phone, MapPin, Receipt,
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { formatPrice } from "@/lib/utils";
import {
  AdminOrder, OrdersResponse, STATUS_STYLES,
  formatDate, apiFetchOrders,
} from "../_types";

const PAGE_SIZE = 20;

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

/* ─────────────────────────────── Order Drawer ───────────────────────────── */
function OrderDrawer({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const [copied, setCopied] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={onClose}
      />
      <div
        className="w-full max-w-[420px] bg-[#0f0c1a] border-l border-white/10 h-full overflow-y-auto flex flex-col transition-transform duration-300 ease-out"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#0f0c1a] z-10">
          <div>
            <p className="text-white font-inter font-semibold">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-white/40 font-inter text-xs mt-0.5">{formatDate(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <StatusBadge status={order.status} />
            <button
              onClick={onClose}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6 flex-1">
          {/* Customer */}
          <section>
            <p className="text-white/30 text-xs font-inter uppercase tracking-widest mb-3">Customer</p>
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              <p className="text-white font-inter font-semibold">{order.customer_name}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white/60 font-inter text-sm">
                  <Phone size={13} className="shrink-0" />
                  {order.customer_phone}
                </div>
                <button
                  onClick={() => copy(order.customer_phone, "phone")}
                  className="text-white/30 hover:text-brand-yellow transition-colors"
                >
                  {copied === "phone"
                    ? <CheckCheck size={13} className="text-green-400" />
                    : <Copy size={13} />}
                </button>
              </div>
              <div className="flex items-start gap-2 text-white/60 font-inter text-sm">
                <MapPin size={13} className="shrink-0 mt-0.5" />
                {order.delivery_address}
              </div>
            </div>
          </section>

          {/* Items */}
          <section>
            <p className="text-white/30 text-xs font-inter uppercase tracking-widest mb-3">Items</p>
            <div className="bg-white/5 rounded-xl overflow-hidden">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 ${
                    i < order.items.length - 1 ? "border-b border-white/5" : ""
                  }`}
                >
                  <div>
                    <p className="text-white font-inter text-sm">{item.product_name}</p>
                    <p className="text-white/40 font-inter text-xs">
                      {formatPrice(parseFloat(item.unit_price))} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-white font-inter font-semibold text-sm">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.03]">
                <p className="text-white/60 font-inter text-sm">Total</p>
                <p className="text-white font-playfair font-bold text-xl">
                  {formatPrice(parseFloat(order.total_amount))}
                </p>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <p className="text-white/30 text-xs font-inter uppercase tracking-widest mb-3">Payment</p>
            <div className="bg-white/5 rounded-xl p-4 space-y-3">
              {order.mpesa_receipt_number ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt size={13} className="text-brand-yellow" />
                    <p className="text-brand-yellow font-mono font-bold text-sm">
                      {order.mpesa_receipt_number}
                    </p>
                  </div>
                  <button
                    onClick={() => copy(order.mpesa_receipt_number, "receipt")}
                    className="text-white/30 hover:text-brand-yellow transition-colors"
                  >
                    {copied === "receipt"
                      ? <CheckCheck size={13} className="text-green-400" />
                      : <Copy size={13} />}
                  </button>
                </div>
              ) : (
                <p className="text-white/30 font-inter text-sm italic">No receipt yet</p>
              )}
              {order.mpesa_failure_reason && (
                <p className="text-red-400 font-inter text-xs bg-red-500/10 rounded-lg px-3 py-2">
                  {order.mpesa_failure_reason}
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Orders Page ────────────────────────────── */
export default function OrdersPage() {
  const router              = useRouter();
  const { pin, loaded, signOut } = useAdminAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const searchRef           = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (p = 1, s = "", q = "") => {
    if (!pin) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (p > 1) params.page   = String(p);
      if (s)     params.status = s;
      if (q)     params.search = q;
      const data: OrdersResponse = await apiFetchOrders(pin, params);
      setOrders(data.results ?? []);
      setTotal(data.count ?? 0);
    } catch {
      signOut();
    } finally {
      setLoading(false);
    }
  }, [pin, signOut]);

  useEffect(() => {
    if (!loaded) return;
    if (!pin) { router.push("/admin"); return; }
    load(page, status, search);
  }, [loaded, pin, router, load, page, status, search]);

  function handleSearch(q: string) {
    setSearch(q);
    setPage(1);
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => load(1, status, q), 400);
  }

  function handleStatus(s: string) {
    setStatus(s);
    setPage(1);
    load(1, s, search);
  }

  function handlePage(p: number) {
    setPage(p);
    load(p, status, search);
  }

  function exportCSV() {
    const headers = ["Date", "Name", "Phone", "Address", "Items", "Total", "Receipt", "Status", "Notes"];
    const rows = orders.map(o => [
      formatDate(o.created_at),
      o.customer_name,
      o.customer_phone,
      o.delivery_address,
      o.items.map(i => `${i.product_name} x${i.quantity}`).join(" | "),
      o.total_amount,
      o.mpesa_receipt_number,
      o.status,
      o.mpesa_failure_reason,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  if (!loaded) return null;

  return (
    <>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-playfair font-bold text-3xl text-white">Orders</h1>
            <p className="text-white/40 font-inter text-sm mt-1">{total} total</p>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white font-inter text-sm transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Receipt, phone, name…"
              className="pl-8 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-yellow/40 w-60 transition-colors"
            />
          </div>
          <select
            value={status}
            onChange={e => handleStatus(e.target.value)}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-inter text-sm focus:outline-none focus:border-brand-yellow/40 transition-colors [color-scheme:dark]"
          >
            <option value="">All statuses</option>
            {["paid","pending","failed","cancelled","processing","shipped","delivered"].map(s => (
              <option key={s} value={s} className="bg-[#0f0c1a] capitalize">{s}</option>
            ))}
          </select>
          <button
            onClick={() => load(page, status, search)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white/60 hover:text-white font-inter text-sm transition-colors"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-brand-charcoal rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center text-white/30 font-inter text-sm">Loading…</div>
            ) : orders.length === 0 ? (
              <div className="py-20 text-center text-white/30 font-inter text-sm">No orders found.</div>
            ) : (
              <table className="w-full font-inter text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Date", "Customer", "Items", "Total", "M-Pesa Receipt", "Status", "Notes"].map(h => (
                      <th
                        key={h}
                        className="text-left px-5 py-4 text-white/30 text-xs font-medium uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr
                      key={o.id}
                      onClick={() => setSelected(o)}
                      className={`border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/[0.04] transition-colors ${
                        i % 2 !== 0 ? "bg-white/[0.02]" : ""
                      }`}
                    >
                      <td className="px-5 py-4 text-white/40 text-xs whitespace-nowrap">
                        {formatDate(o.created_at)}
                      </td>
                      <td className="px-5 py-4 min-w-[140px]">
                        <p className="text-white font-medium">{o.customer_name}</p>
                        <p className="text-white/40 text-xs">{o.customer_phone}</p>
                        <p className="text-white/25 text-xs">{o.delivery_address}</p>
                      </td>
                      <td className="px-5 py-4 text-white/60 text-xs min-w-[160px]">
                        {o.items.map((it, j) => (
                          <div key={j}>{it.product_name} ×{it.quantity}</div>
                        ))}
                      </td>
                      <td className="px-5 py-4 text-white font-bold whitespace-nowrap">
                        {formatPrice(parseFloat(o.total_amount))}
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-brand-yellow whitespace-nowrap">
                        {o.mpesa_receipt_number || "—"}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-5 py-4 text-white/40 text-xs max-w-[160px] truncate">
                        {o.mpesa_failure_reason || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5">
            <span className="text-white/30 font-inter text-xs">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => handlePage(page - 1)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white font-inter text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={13} /> Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => handlePage(page + 1)}
                className="flex items-center gap-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white/60 hover:text-white font-inter text-xs disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Drawer */}
      {selected && (
        <OrderDrawer order={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
