"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Users, Search, Phone, MapPin, ShoppingBag } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { formatPrice } from "@/lib/utils";
import { AdminOrder, STATUS_STYLES, formatDate, apiFetchOrders } from "../_types";

interface Customer {
  phone:       string;
  name:        string;
  orders:      AdminOrder[];
  totalSpent:  number;
  lastOrder:   string;
}

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

function buildCustomers(orders: AdminOrder[]): Customer[] {
  const map = new Map<string, Customer>();
  for (const o of orders) {
    const key = o.customer_phone;
    if (!map.has(key)) {
      map.set(key, { phone: key, name: o.customer_name, orders: [], totalSpent: 0, lastOrder: o.created_at });
    }
    const c = map.get(key)!;
    c.orders.push(o);
    if (o.status === "paid") c.totalSpent += parseFloat(o.total_amount);
    if (new Date(o.created_at) > new Date(c.lastOrder)) c.lastOrder = o.created_at;
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime(),
  );
}

/* ─────────────────────────────── Customer Detail ────────────────────────── */
function CustomerDetail({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-[440px] bg-[#0f0c1a] border-l border-white/10 h-full overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="px-5 py-5 border-b border-white/10 sticky top-0 bg-[#0f0c1a] z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white font-inter font-semibold text-base">{customer.name}</p>
              <div className="flex items-center gap-1.5 text-white/40 font-inter text-xs mt-1">
                <Phone size={11} />{customer.phone}
              </div>
            </div>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors mt-1">
              ✕
            </button>
          </div>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/5 rounded-xl px-4 py-3 flex-1 text-center">
              <p className="text-white/40 text-xs font-inter mb-1">Orders</p>
              <p className="text-white font-playfair font-bold text-xl">{customer.orders.length}</p>
            </div>
            <div className="bg-white/5 rounded-xl px-4 py-3 flex-1 text-center">
              <p className="text-white/40 text-xs font-inter mb-1">Total Spent</p>
              <p className="text-white font-playfair font-bold text-xl">{formatPrice(customer.totalSpent)}</p>
            </div>
          </div>
        </div>

        {/* Order list */}
        <div className="p-5 space-y-3">
          <p className="text-white/30 text-xs font-inter uppercase tracking-widest mb-4">Order History</p>
          {customer.orders
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map(o => (
              <div key={o.id} className="bg-white/5 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-white/50 font-inter text-xs">{formatDate(o.created_at)}</p>
                  <StatusBadge status={o.status} />
                </div>
                <div className="text-white/60 font-inter text-xs space-y-0.5">
                  {o.items.map((it, j) => (
                    <div key={j}>{it.product_name} ×{it.quantity}</div>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  {o.mpesa_receipt_number && (
                    <p className="text-brand-yellow font-mono text-xs">{o.mpesa_receipt_number}</p>
                  )}
                  <p className="text-white font-bold font-inter text-sm ml-auto">
                    {formatPrice(parseFloat(o.total_amount))}
                  </p>
                </div>
                {o.delivery_address && (
                  <div className="flex items-start gap-1.5 text-white/30 font-inter text-xs">
                    <MapPin size={11} className="shrink-0 mt-0.5" />{o.delivery_address}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Page ───────────────────────────────────── */
export default function CustomersPage() {
  const router              = useRouter();
  const { pin, loaded, signOut } = useAdminAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filtered,  setFiltered]  = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Customer | null>(null);

  const load = useCallback(async () => {
    if (!pin) return;
    setLoading(true);
    try {
      const data = await apiFetchOrders(pin, { page_size: "200" });
      const built = buildCustomers(data.results ?? []);
      setCustomers(built);
      setFiltered(built);
    } catch {
      signOut();
    } finally {
      setLoading(false);
    }
  }, [pin, signOut]);

  useEffect(() => {
    if (!loaded) return;
    if (!pin) { router.push("/admin"); return; }
    load();
  }, [loaded, pin, router, load]);

  function handleSearch(q: string) {
    setSearch(q);
    const lq = q.toLowerCase();
    setFiltered(
      q
        ? customers.filter(
            c => c.name.toLowerCase().includes(lq) || c.phone.includes(lq),
          )
        : customers,
    );
  }

  if (!loaded) return null;

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <>
      <div className="p-6 sm:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-playfair font-bold text-3xl text-white">Customers</h1>
          <p className="text-white/40 font-inter text-sm mt-1">
            {customers.length} unique customer{customers.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Customers",  value: String(customers.length)       },
            { label: "Total Revenue",    value: formatPrice(totalRevenue)       },
            { label: "Avg. Order Value", value: customers.length
                ? formatPrice(Math.round(totalRevenue / customers.reduce((s, c) => s + c.orders.filter(o => o.status === "paid").length, 0) || 0))
                : "KES 0" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-brand-charcoal rounded-2xl p-5 border border-white/5">
              <p className="text-white/40 font-inter text-xs uppercase tracking-widest mb-3">{label}</p>
              <p className="font-playfair font-bold text-2xl text-white">
                {loading ? "—" : value}
              </p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Name or phone…"
            className="w-full pl-8 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white font-inter text-sm placeholder:text-white/20 focus:outline-none focus:border-brand-yellow/40 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-brand-charcoal rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center text-white/30 font-inter text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center text-white/30 font-inter text-sm">No customers found.</div>
            ) : (
              <table className="w-full font-inter text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Customer", "Phone", "Orders", "Total Spent", "Last Order"].map(h => (
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
                  {filtered.map((c, i) => (
                    <tr
                      key={c.phone}
                      onClick={() => setSelected(c)}
                      className={`border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/[0.04] transition-colors ${
                        i % 2 !== 0 ? "bg-white/[0.02]" : ""
                      }`}
                    >
                      <td className="px-5 py-4">
                        <p className="text-white font-medium">{c.name}</p>
                      </td>
                      <td className="px-5 py-4 text-white/50 text-sm">{c.phone}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-white/60">
                          <ShoppingBag size={12} />
                          <span>{c.orders.length}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-white font-bold whitespace-nowrap">
                        {formatPrice(c.totalSpent)}
                      </td>
                      <td className="px-5 py-4 text-white/40 text-xs whitespace-nowrap">
                        {formatDate(c.lastOrder)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <CustomerDetail customer={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
