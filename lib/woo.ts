import type { Product, Category, Difficulty } from "@/data/products";

const WOO_URL    = process.env.WOO_URL    ?? "";
const WOO_KEY    = process.env.WOO_KEY    ?? "";
const WOO_SECRET = process.env.WOO_SECRET ?? "";

export const wooConfigured = Boolean(WOO_URL && WOO_KEY && WOO_SECRET);

// ─── WooCommerce REST types ────────────────────────────────────────────────

interface WooImage      { src: string; alt: string }
interface WooAttribute  { name: string; options: string[] }
interface WooCategory   { id: number; name: string; slug: string }
interface WooProduct {
  id:                number;
  name:              string;
  slug:              string;
  description:       string;
  short_description: string;
  price:             string;
  regular_price:     string;
  on_sale:           boolean;
  images:            WooImage[];
  attributes:        WooAttribute[];
  categories:        WooCategory[];
  stock_status:      "instock" | "outofstock" | "onbackorder";
  featured:          boolean;
}

// ─── Mapping helpers ───────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function getAttr(attrs: WooAttribute[], name: string): string[] {
  return attrs.find((a) => a.name.toLowerCase() === name.toLowerCase())?.options ?? [];
}

const CATEGORY_MAP: Record<string, Category> = {
  vehicles:     "Vehicles",
  machines:     "Machines",
  science:      "Science",
  space:        "Space",
  robots:       "Robots",
  architecture: "Architecture",
};

const NAME_CATEGORY_KEYWORDS: Array<{ pattern: RegExp; category: Category }> = [
  { pattern: /robot/i,                                          category: "Robots" },
  { pattern: /lunar|space|moon|rocket|satellite|asteroid/i,    category: "Space" },
  { pattern: /house|building|bridge|tower|architectural/i,     category: "Architecture" },
  { pattern: /solar|optical|illusion|marble|science|lab/i,     category: "Science" },
  { pattern: /windmill|ferris|elevator|pulley|crank|gear/i,    category: "Machines" },
  { pattern: /car|train|tank|rover|glider|digger|cable car|bus|truck|boat|plane/i, category: "Vehicles" },
  { pattern: /fan/i,                                            category: "Machines" },
];

// Real WooCommerce category names flow through as-is, so categories created in
// the backend appear on the site without a code change. The known six are
// normalised to canonical capitalisation; keyword inference only kicks in for
// uncategorised products.
function mapCategory(cats: WooCategory[], name?: string): Category {
  for (const c of cats) {
    const canonical = CATEGORY_MAP[c.name.toLowerCase()] ?? CATEGORY_MAP[c.slug];
    if (canonical) return canonical;
  }
  for (const c of cats) {
    if (c.slug !== "uncategorized") return c.name;
  }
  if (name) {
    for (const { pattern, category } of NAME_CATEGORY_KEYWORDS) {
      if (pattern.test(name)) return category;
    }
  }
  return "Other";
}

function mapDifficulty(attrs: WooAttribute[]): Difficulty {
  return getAttr(attrs, "Difficulty")[0] ?? "Beginner";
}

function mapAgeRange(attrs: WooAttribute[]): string {
  return getAttr(attrs, "Age Range")[0] ?? "6–12";
}

function mapWhatYouLearn(attrs: WooAttribute[]): string[] {
  const learn = getAttr(attrs, "What You Learn");
  return learn.length ? learn : getAttr(attrs, "Skills");
}

function mapPricing(p: WooProduct): { price: number; regularPrice: number; onSale: boolean } {
  const price   = parseFloat(p.price) || 0;
  const regular = parseFloat(p.regular_price) || price;
  return { price, regularPrice: regular, onSale: Boolean(p.on_sale) && regular > price };
}

export function mapWooProduct(p: WooProduct): Product {
  return {
    id:           String(p.id),
    name:         p.name,
    slug:         p.slug,
    category:     mapCategory(p.categories, p.name),
    ageRange:     mapAgeRange(p.attributes),
    difficulty:   mapDifficulty(p.attributes),
    ...mapPricing(p),
    description:  stripHtml(p.short_description || p.description),
    whatYouLearn: mapWhatYouLearn(p.attributes),
    images:       p.images.map((img) => img.src),
    inStock:      p.stock_status === "instock",
    featured:     p.featured,
  };
}

// ─── Raw mapping (nullable editorial fields — used by the smart merge) ────────
//
// The regular mapWooProduct fills defaults ("Science", "Beginner", "6–12") when
// attributes are missing. That makes it impossible for the merge to tell whether
// WooCommerce actually provided a value. This variant returns null for any
// editorial field the client has not yet filled in, so the merge can fall back
// to data/products.ts only for those fields.

export interface WooProductRaw extends Omit<Product, 'category' | 'ageRange' | 'difficulty'> {
  category:   Category   | null;
  ageRange:   string     | null;
  difficulty: Difficulty | null;
}

export function mapWooProductRaw(p: WooProduct): WooProductRaw {
  let category: Category | null = null;
  for (const c of p.categories) {
    const canonical = CATEGORY_MAP[c.name.toLowerCase()] ?? CATEGORY_MAP[c.slug];
    if (canonical) { category = canonical; break; }
  }
  if (!category) {
    const real = p.categories.find((c) => c.slug !== "uncategorized");
    if (real) category = real.name;
  }
  if (!category) {
    for (const { pattern, category: cat } of NAME_CATEGORY_KEYWORDS) {
      if (pattern.test(p.name)) { category = cat; break; }
    }
  }

  const ageRaw  = getAttr(p.attributes, "Age Range")[0];
  const diffRaw = getAttr(p.attributes, "Difficulty")[0];

  return {
    id:           String(p.id),
    name:         p.name,
    slug:         p.slug,
    category,
    ageRange:     ageRaw  ?? null,
    difficulty:   (diffRaw as Difficulty) ?? null,
    ...mapPricing(p),
    description:  stripHtml(p.short_description || p.description),
    whatYouLearn: mapWhatYouLearn(p.attributes),
    images:       p.images.map((img) => img.src),
    inStock:      p.stock_status === "instock",
    featured:     p.featured,
  };
}

export async function getRawWooProducts(params?: Record<string, string>): Promise<WooProductRaw[]> {
  const raw = await wooFetchAllProducts(params);
  return raw.map(mapWooProductRaw);
}

// ─── Fetch ─────────────────────────────────────────────────────────────────

async function wooFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${WOO_URL}/wp-json/wc/v3${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const auth = Buffer.from(`${WOO_KEY}:${WOO_SECRET}`).toString("base64");
  const res  = await fetch(url.toString(), {
    headers: { Authorization: `Basic ${auth}` },
    // Tagged so POST /api/revalidate (hit by WooCommerce webhooks) can purge
    // every product read at once; the 60s TTL is the fallback when no webhook
    // fires.
    next:    { revalidate: 60, tags: ["woo-products"] },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`WooCommerce ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// wc/v3 caps per_page at 100, so a growing catalog must be walked page by
// page — otherwise product #101 silently never reaches the site.
async function wooFetchAllProducts(params?: Record<string, string>): Promise<WooProduct[]> {
  const all: WooProduct[] = [];
  for (let page = 1; ; page++) {
    const batch = await wooFetch<WooProduct[]>("/products", {
      per_page: "100",
      status:   "publish",
      page:     String(page),
      ...params,
    });
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function getProducts(params?: Record<string, string>): Promise<Product[]> {
  const raw = await wooFetchAllProducts(params);
  return raw.map(mapWooProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const raw = await wooFetch<WooProduct[]>("/products", { slug });
  return raw.length ? mapWooProduct(raw[0]) : null;
}

// ─── Payment gateways ──────────────────────────────────────────────────────
//
// Which payment methods the checkout offers is decided in WooCommerce
// (Settings → Payments), not in code: the checkout renders whichever enabled
// gateways it knows how to drive (M-Pesa STK, DPO card, Cash on Delivery).

export interface PaymentGateway {
  id:          string;
  title:       string;
  description: string;
}

interface WooGatewayRaw {
  id:          string;
  title:       string;
  description: string;
  enabled:     boolean;
}

export async function getEnabledGateways(): Promise<PaymentGateway[]> {
  const raw = await wooFetch<WooGatewayRaw[]>("/payment_gateways");
  return raw
    .filter((g) => g.enabled)
    .map((g) => ({ id: g.id, title: stripHtml(g.title), description: stripHtml(g.description) }));
}
