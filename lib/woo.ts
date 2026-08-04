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

// Accepts aliases: the first name that actually carries options wins. Renaming
// an attribute in the Woo admin (e.g. "Difficulty" → "Level") then never blanks
// the storefront, and old and new products can coexist mid-migration.
function getAttr(attrs: WooAttribute[], ...names: string[]): string[] {
  for (const name of names) {
    const options = attrs.find((a) => a.name.toLowerCase() === name.toLowerCase())?.options;
    if (options?.length) return options;
  }
  return [];
}

// ─── Editorial taxonomy: Level and Age Group ───────────────────────────────
//
// Both are editable from the WooCommerce admin with no deploy. WooCommerce
// offers two places to model them, so we read both: ATTRIBUTES first (the
// correct home — that is what filtering and variations expect), then CATEGORY
// terms as a fallback for a store that modelled them as categories instead.

const LEVEL_ATTR_NAMES = ["Level", "Difficulty", "Skill Level"];
const AGE_ATTR_NAMES   = ["Age Group", "Age Range", "Age"];

// Category terms that DESCRIBE a product rather than group it. These must never
// win mapCategory(), or a race car also filed under "Beginner" would show up in
// the shop under the category "Beginner" instead of "Vehicles".
const LEVEL_TERMS = new Set(["beginner", "intermediate", "advanced", "expert"]);
const AGE_TERM    = /^\s*(?:ages?\s*)?\d{1,2}\s*(?:[–—-]|\+|to)\s*\d{0,2}\s*(?:yrs?|years?)?\s*$/i;

const isLevelTerm       = (name: string) => LEVEL_TERMS.has(name.trim().toLowerCase());
const isAgeTerm         = (name: string) => AGE_TERM.test(name);
const isDescriptiveTerm = (name: string) => isLevelTerm(name) || isAgeTerm(name);

/** Level from attributes, else from a descriptive category term, else null. */
function rawDifficulty(p: WooProduct): Difficulty | null {
  const fromAttr = getAttr(p.attributes, ...LEVEL_ATTR_NAMES)[0];
  if (fromAttr) return fromAttr;
  return p.categories.find((c) => isLevelTerm(c.name))?.name ?? null;
}

/** Age group from attributes, else from a descriptive category term, else null. */
function rawAgeRange(p: WooProduct): string | null {
  const fromAttr = getAttr(p.attributes, ...AGE_ATTR_NAMES)[0];
  if (fromAttr) return fromAttr;
  return p.categories.find((c) => isAgeTerm(c.name))?.name ?? null;
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
  // Level/age terms are read as editorial fields, never as the browse category.
  const browsable = cats.filter((c) => !isDescriptiveTerm(c.name));
  for (const c of browsable) {
    const canonical = CATEGORY_MAP[c.name.toLowerCase()] ?? CATEGORY_MAP[c.slug];
    if (canonical) return canonical;
  }
  for (const c of browsable) {
    if (c.slug !== "uncategorized") return c.name;
  }
  if (name) {
    for (const { pattern, category } of NAME_CATEGORY_KEYWORDS) {
      if (pattern.test(name)) return category;
    }
  }
  return "Other";
}

function mapDifficulty(p: WooProduct): Difficulty {
  return rawDifficulty(p) ?? "Beginner";
}

function mapAgeRange(p: WooProduct): string {
  return rawAgeRange(p) ?? "6–12";
}

function mapWhatYouLearn(attrs: WooAttribute[]): string[] {
  return getAttr(attrs, "What You Learn", "Skills");
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
    ageRange:     mapAgeRange(p),
    difficulty:   mapDifficulty(p),
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
  const browsable = p.categories.filter((c) => !isDescriptiveTerm(c.name));
  for (const c of browsable) {
    const canonical = CATEGORY_MAP[c.name.toLowerCase()] ?? CATEGORY_MAP[c.slug];
    if (canonical) { category = canonical; break; }
  }
  if (!category) {
    const real = browsable.find((c) => c.slug !== "uncategorized");
    if (real) category = real.name;
  }
  if (!category) {
    for (const { pattern, category: cat } of NAME_CATEGORY_KEYWORDS) {
      if (pattern.test(p.name)) { category = cat; break; }
    }
  }

  return {
    id:           String(p.id),
    name:         p.name,
    slug:         p.slug,
    category,
    ageRange:     rawAgeRange(p),
    difficulty:   rawDifficulty(p),
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
