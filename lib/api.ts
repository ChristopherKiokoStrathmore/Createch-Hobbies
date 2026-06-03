const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

export interface OrderItemPayload {
  product_id:   string;
  product_name: string;
  product_slug: string;
  quantity:     number;
  unit_price:   number;
}

export interface CreateOrderPayload {
  customer_name:    string;
  customer_phone:   string;
  delivery_address: string;
  items:            OrderItemPayload[];
}

export interface CreateOrderResponse {
  order_id:            string;
  checkout_request_id: string;
  message:             string;
}

export interface OrderStatus {
  id:                   string;
  status:               'pending' | 'paid' | 'failed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customer_name:        string;
  customer_phone:       string;
  delivery_address:     string;
  total_amount:         string;
  mpesa_receipt_number: string;
  mpesa_failure_reason: string;
  items: {
    product_name: string;
    quantity:     number;
    unit_price:   string;
    subtotal:     number;
  }[];
  created_at: string;
}

export interface MpesaStatusResponse {
  order_id:       string;
  status:         'pending' | 'paid' | 'failed' | 'cancelled';
  receipt:        string;
  failure_reason: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    ...init,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? JSON.stringify(json));
  return json as T;
}

export const api = {
  createOrder: (payload: CreateOrderPayload) =>
    request<CreateOrderResponse>('/api/orders/', {
      method: 'POST',
      body:   JSON.stringify(payload),
    }),

  getOrder: (orderId: string) =>
    request<OrderStatus>(`/api/orders/${orderId}/`),

  getMpesaStatus: (orderId: string) =>
    request<MpesaStatusResponse>(`/api/mpesa/status/${orderId}/`),
};
