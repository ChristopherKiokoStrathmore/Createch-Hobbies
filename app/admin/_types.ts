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

export const STATUS_STYLES: Record<string, string> = {
  paid:       "bg-green-100  text-green-800",
  pending:    "bg-yellow-100 text-yellow-800",
  failed:     "bg-red-100    text-red-800",
  cancelled:  "bg-red-100    text-red-800",
  processing: "bg-blue-100   text-blue-800",
  shipped:    "bg-purple-100 text-purple-800",
  delivered:  "bg-teal-100   text-teal-800",
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
