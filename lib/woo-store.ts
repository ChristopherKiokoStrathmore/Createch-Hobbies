// WooCommerce Store API client for headless checkout.
// Cart sessions are identified by a Cart-Token stored in localStorage.
// A fresh Nonce is obtained from each response header and sent with POST requests.

const STORE_API      = process.env.NEXT_PUBLIC_WOO_STORE_URL as string;
const CART_TOKEN_KEY = 'wc_cart_token';

function getStoredToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(CART_TOKEN_KEY) ?? '';
}

function persistToken(token: string): void {
  if (typeof window === 'undefined' || !token) return;
  localStorage.setItem(CART_TOKEN_KEY, token);
}

async function storeApiFetch(
  path: string,
  options: {
    method?:    'GET' | 'POST' | 'PUT' | 'DELETE';
    body?:      unknown;
    cartToken?: string;
    nonce?:     string;
  } = {}
): Promise<{ data: unknown; cartToken: string; nonce: string }> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (options.cartToken) headers['Cart-Token'] = options.cartToken;
  if (options.nonce)     headers['Nonce']       = options.nonce;

  const res = await fetch(`${STORE_API}${path}`, {
    method:  options.method ?? 'GET',
    headers,
    body:    options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const cartToken = res.headers.get('Cart-Token')           ?? options.cartToken ?? '';
  const nonce     = res.headers.get('Nonce')
                 ?? res.headers.get('X-WC-Store-API-Nonce')
                 ?? options.nonce ?? '';

  persistToken(cartToken);

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as {
      message?: string;
      data?:    { params?: Record<string, string> };
    };
    const params = err.data?.params ? ' — ' + JSON.stringify(err.data.params) : '';
    // Store API messages arrive HTML-encoded (e.g. Coupon &quot;x&quot;…) —
    // decode the common entities so they read cleanly in the UI.
    const message = ((err.message ?? `Store API error ${res.status}`) + params)
      .replace(/&quot;|&#0?34;/g, '"')
      .replace(/&apos;|&#0?39;/g, "'")
      .replace(/&amp;/g, '&');
    throw new Error(message);
  }

  return { data: await res.json(), cartToken, nonce };
}

// ── Session init ──────────────────────────────────────────────────────────────

export async function initCart(): Promise<{ cartToken: string; nonce: string }> {
  const { cartToken, nonce } = await storeApiFetch('/cart', {
    cartToken: getStoredToken(),
  });
  return { cartToken, nonce };
}

// ── Sync local cart items into WooCommerce cart ───────────────────────────────

export async function syncCartItems(
  items:     { productId: number; quantity: number }[],
  cartToken: string,
  nonce:     string
): Promise<{ cartToken: string; nonce: string }> {
  // Filter out items whose ID didn't parse to a valid WooCommerce product ID.
  // This happens when the cart contains items from the static fallback data.
  const validItems = items.filter((i) => Number.isInteger(i.productId) && i.productId > 0);

  if (validItems.length === 0) {
    throw new Error(
      'Your cart items could not be matched to WooCommerce products. ' +
      'Please remove them and add products directly from the Shop page.'
    );
  }

  let token = cartToken;
  let nce   = nonce;

  // Clear any items left in the WooCommerce cart from a previous attempt
  const cleared = await storeApiFetch('/cart/items', {
    method:    'DELETE',
    cartToken: token,
    nonce:     nce,
  });
  token = cleared.cartToken;
  nce   = cleared.nonce;

  for (const item of validItems) {
    const result = await storeApiFetch('/cart/add-item', {
      method:    'POST',
      body:      { id: item.productId, quantity: item.quantity },
      cartToken: token,
      nonce:     nce,
    });
    token = result.cartToken;
    nce   = result.nonce;
  }

  return { cartToken: token, nonce: nce };
}

// ── Cart snapshot: server-side totals, coupons and delivery rates ─────────────
//
// The Store API cart is the single source of truth for money: sale prices,
// coupon discounts and the delivery fees the client configures in WooCommerce
// (Settings → Shipping) all land in these totals. The checkout page renders
// this instead of doing its own arithmetic over locally-stored prices.

export interface WooShippingRate {
  rateId:   string;
  name:     string;
  price:    number;
  selected: boolean;
}

export interface WooCartSnapshot {
  itemsTotal: number;
  discount:   number;
  shipping:   number;
  fees:       { name: string; total: number }[];
  total:      number;
  coupons:    string[];
  shippingPackages: { packageId: number | string; rates: WooShippingRate[] }[];
}

function toMajorUnits(value: string | undefined, minorUnit: number): number {
  return (parseInt(value ?? '0', 10) || 0) / Math.pow(10, minorUnit);
}

export function parseCartSnapshot(data: unknown): WooCartSnapshot {
  const cart = data as {
    totals?: {
      currency_minor_unit?: number;
      total_items?:         string;
      total_price?:         string;
      total_shipping?:      string;
      total_discount?:      string;
    };
    coupons?:        { code: string }[];
    fees?: {
      name:    string;
      totals?: { total?: string; currency_minor_unit?: number };
    }[];
    shipping_rates?: {
      package_id:      number | string;
      shipping_rates?: {
        rate_id:              string;
        name:                 string;
        price:                string;
        selected?:            boolean;
        currency_minor_unit?: number;
      }[];
    }[];
  };

  const totals = cart.totals ?? {};
  const minor  = totals.currency_minor_unit ?? 2;

  return {
    itemsTotal: toMajorUnits(totals.total_items, minor),
    discount:   toMajorUnits(totals.total_discount, minor),
    shipping:   toMajorUnits(totals.total_shipping, minor),
    fees: (cart.fees ?? []).map((f) => ({
      name:  f.name,
      total: toMajorUnits(f.totals?.total, f.totals?.currency_minor_unit ?? minor),
    })),
    total:      toMajorUnits(totals.total_price, minor),
    coupons:    (cart.coupons ?? []).map((c) => c.code),
    shippingPackages: (cart.shipping_rates ?? []).map((pkg) => ({
      packageId: pkg.package_id,
      rates: (pkg.shipping_rates ?? []).map((r) => ({
        rateId:   r.rate_id,
        name:     r.name,
        price:    toMajorUnits(r.price, r.currency_minor_unit ?? minor),
        selected: Boolean(r.selected),
      })),
    })),
  };
}

interface CartResponse {
  cart:      WooCartSnapshot;
  cartToken: string;
  nonce:     string;
}

async function cartMutation(
  path:      string,
  body:      unknown,
  cartToken: string,
  nonce:     string
): Promise<CartResponse> {
  const r = await storeApiFetch(path, { method: 'POST', body, cartToken, nonce });
  return { cart: parseCartSnapshot(r.data), cartToken: r.cartToken, nonce: r.nonce };
}

// Setting the customer address is what makes WooCommerce resolve the shipping
// zone and return delivery rates — all orders deliver within Nairobi, so a
// placeholder address is enough for the fee; the real address goes on the
// checkout request itself.
export function updateCartCustomer(
  billing: WooBillingAddress, cartToken: string, nonce: string
): Promise<CartResponse> {
  const { email: _email, ...shippingAddress } = billing;
  return cartMutation(
    '/cart/update-customer',
    { billing_address: billing, shipping_address: shippingAddress },
    cartToken,
    nonce
  );
}

export function applyCoupon(code: string, cartToken: string, nonce: string): Promise<CartResponse> {
  return cartMutation('/cart/apply-coupon', { code }, cartToken, nonce);
}

export function removeCoupon(code: string, cartToken: string, nonce: string): Promise<CartResponse> {
  return cartMutation('/cart/remove-coupon', { code }, cartToken, nonce);
}

export function selectShippingRate(
  packageId: number | string, rateId: string, cartToken: string, nonce: string
): Promise<CartResponse> {
  return cartMutation('/cart/select-shipping-rate', { package_id: packageId, rate_id: rateId }, cartToken, nonce);
}

// ── Checkout ──────────────────────────────────────────────────────────────────

export interface WooBillingAddress {
  first_name: string;
  last_name:  string;
  email:      string;
  phone:      string;
  address_1:  string;
  address_2?: string;
  city:       string;
  country:    string;
  state:      string;
  postcode:   string;
}

export interface WooCheckoutPayload {
  billing:       WooBillingAddress;
  paymentMethod: string;
  paymentData?:  { key: string; value: string }[];
}

export interface WooCheckoutResult {
  orderId:     number;
  orderKey:    string;
  redirectUrl: string | null;
  status:      string;
}

export async function checkoutWoo(
  payload:   WooCheckoutPayload,
  cartToken: string,
  nonce:     string
): Promise<WooCheckoutResult> {
  // shipping_address schema excludes email — strip it before sending
  const { email: _email, ...shippingAddress } = payload.billing;

  const { data } = await storeApiFetch('/checkout', {
    method: 'POST',
    body: {
      billing_address:  payload.billing,
      shipping_address: shippingAddress,
      payment_method:   payload.paymentMethod,
      payment_data:     payload.paymentData ?? [],
    },
    cartToken,
    nonce,
  });

  const r = data as {
    order_id:        number;
    order_key:       string;
    payment_result?: { redirect_url?: string };
    status:          string;
  };

  return {
    orderId:     r.order_id,
    orderKey:    r.order_key,
    redirectUrl: r.payment_result?.redirect_url ?? null,
    status:      r.status,
  };
}

// ── Phone number helpers ──────────────────────────────────────────────────────

export function normalisePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254') && digits.length === 12) return digits;
  if (digits.startsWith('0')   && digits.length === 10) return '254' + digits.slice(1);
  if (digits.startsWith('7')   && digits.length ===  9) return '254' + digits;
  if (digits.startsWith('1')   && digits.length ===  9) return '254' + digits;
  return digits;
}

export function isValidMpesaPhone(phone: string): boolean {
  return /^254[71]\d{8}$/.test(phone);
}
