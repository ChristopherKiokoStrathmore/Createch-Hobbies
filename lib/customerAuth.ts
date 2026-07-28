// Server-side client for the createch-customer-auth WordPress plugin
// (wordpress-plugin/createch-customer-auth).
//
// Every call runs from a Next route handler, never the browser. The JWT lives
// in an httpOnly cookie, so storefront JavaScript — and any XSS that reaches
// it — cannot read the token, and WordPress needs no CORS grant for these
// routes because the browser never talks to it directly.

import { cookies } from "next/headers";

const WP_URL = process.env.WOO_URL ?? "";

export const customerAuthConfigured = Boolean(WP_URL);

export const AUTH_COOKIE = "ch_customer";

// Matches CRTCH_AUTH_TTL in the plugin. If they drift, the cookie expiring
// first is the harmless direction — the customer simply signs in again.
export const AUTH_MAX_AGE = 30 * 24 * 60 * 60;

// ── Shapes (mirror crtch_customer_payload / crtch_order_payload) ──────────────

export interface CustomerAddress {
  first_name: string;
  last_name:  string;
  company:    string;
  address_1:  string;
  address_2:  string;
  city:       string;
  state:      string;
  postcode:   string;
  country:    string;
  email?:     string;
  phone?:     string;
}

export interface Customer {
  id:         number;
  email:      string;
  first_name: string;
  last_name:  string;
  billing:    CustomerAddress;
  shipping:   CustomerAddress;
}

export interface CustomerOrderItem {
  name:     string;
  quantity: number;
  total:    number;
  image:    string;
  slug:     string;
}

export interface CustomerOrder {
  id:       number;
  number:   string;
  status:   string;
  date:     string;
  total:    number;
  subtotal: number;
  shipping: number;
  discount: number;
  currency: string;
  payment:  string;
  note:     string;
  items:    CustomerOrderItem[];
}

// ── Transport ────────────────────────────────────────────────────────────────

export interface WpResult<T> {
  ok:      boolean;
  status:  number;
  data:    T | null;
  /** Customer-facing message, already unwrapped from the WP_Error envelope. */
  message: string;
}

export async function wpAuthFetch<T>(
  path: string,
  options: { method?: "GET" | "POST" | "PUT"; body?: unknown; token?: string } = {}
): Promise<WpResult<T>> {
  if (!customerAuthConfigured) {
    return { ok: false, status: 500, data: null, message: "Accounts are not configured." };
  }

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let res: Response;
  try {
    res = await fetch(`${WP_URL}/wp-json/createch/v1${path}`, {
      method:  options.method ?? "GET",
      headers,
      body:    options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache:   "no-store",
    });
  } catch {
    return { ok: false, status: 502, data: null, message: "Could not reach the store. Please try again." };
  }

  const payload = (await res.json().catch(() => null)) as
    | (T & { code?: string; message?: string })
    | null;

  if (!res.ok) {
    // A 404 on our own namespace means createch-customer-auth is not active on
    // the WordPress install. That is a deployment fault, not something the
    // customer did, so it must not surface as WordPress's "no route" wording.
    const routeMissing = res.status === 404 && payload?.code === "rest_no_route";

    return {
      ok:      false,
      status:  routeMissing ? 503 : res.status,
      data:    null,
      // WP_Error messages are written for customers in the plugin, so they are
      // safe to show as-is; the generic line is the fallback for core errors.
      message: routeMissing
        ? "Accounts are unavailable right now. Please try again later."
        : payload?.message ?? "Something went wrong. Please try again.",
    };
  }

  return { ok: true, status: res.status, data: payload as T, message: "" };
}

// ── Cookie helpers ───────────────────────────────────────────────────────────

export async function readAuthToken(): Promise<string> {
  const jar = await cookies();
  return jar.get(AUTH_COOKIE)?.value ?? "";
}

export const authCookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path:     "/",
};
