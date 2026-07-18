export interface AdminOrderItem {
  product_name: string;
  quantity:     number;
  unit_price:   string;
  subtotal:     number;
}

export type OrderStatus =
  | "pending" | "paid" | "failed" | "cancelled"
  | "processing" | "shipped" | "delivered";

export interface AdminOrder {
  id:                   string;
  status:               OrderStatus;
  customer_name:        string;
  customer_phone:       string;
  delivery_address:     string;
  total_amount:         string;
  mpesa_receipt_number: string;
  mpesa_failure_reason: string;
  items:                AdminOrderItem[];
  created_at:           string;
}

export interface OrdersResponse {
  count:   number;
  results: AdminOrder[];
}

// The dashboard shows exactly three states. The backend/WooCommerce emits many
// raw statuses (a paid card order arrives as WooCommerce "processing", an
// M-Pesa order as "paid"), so we collapse them: any post-payment status counts
// as "paid", any dead order as "failed", everything else as "pending".
export type DisplayStatus = "paid" | "pending" | "failed";

const PAID_RAW   = new Set(["paid", "processing", "completed", "shipped", "delivered"]);
const FAILED_RAW = new Set(["failed", "cancelled", "canceled", "refunded"]);

export function displayStatus(raw: string): DisplayStatus {
  const s = (raw ?? "").toLowerCase().trim();
  if (PAID_RAW.has(s))   return "paid";
  if (FAILED_RAW.has(s)) return "failed";
  return "pending";
}

// Keyed by DisplayStatus — index with displayStatus(raw), never the raw value.
export const STATUS_STYLES: Record<DisplayStatus, string> = {
  paid:    "bg-green-100  text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed:  "bg-red-100    text-red-800",
};

export function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-KE", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export async function apiFetchOrders(
  pin: string,
  params: Record<string, string> = {},
): Promise<OrdersResponse> {
  const qp  = new URLSearchParams(params);
  const res = await fetch(`/api/admin/orders?${qp.toString()}`, {
    headers: { "X-Admin-Key": pin },
  });
  if (!res.ok) throw new Error("unauthorized");
  return res.json();
}
