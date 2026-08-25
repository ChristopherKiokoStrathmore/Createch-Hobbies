import type { Product, Category, Difficulty } from "@/data/products";

const WOO_URL    = process.env.WOO_URL    ?? "";
const WOO_KEY    = process.env.WOO_KEY    ?? "";
const WOO_SECRET = process.env.WOO_SECRET ?? "";

export const wooConfigured = Boolean(WOO_URL && WOO_KEY && WOO_SECRET);

// ─── WooCommerce REST types ────────────────────────────────────────────────

interface WooImage      { src: string; alt: string }
interface WooAttribute  { name: string; options: string[] }
interface WooCategory   { id: number; name: string; slug: string }
interface WooCategoryTerm extends WooCategory { parent: number; count: number }
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

// ─── Facet containers vs browse categories ─────────────────────────────────
//
// This store models its facets as category trees: "Level" → Beginner/…,
// "Age Group" → 4-6/…, "Size" → Small/Mid/Large. Those describe a kit; they are
// not aisles to browse. The rule is structural, not a hardcoded name list: a
// top-level category that HAS CHILDREN is a facet container, so neither it nor
// its children are browse categories. Everything else in the Woo tree is one —
// so a new category created in the admin shows up on the site with no deploy.
function facetSlugs(tree: WooCategoryTerm[]): Set<string> {
  const parents = new Set(tree.map((c) => c.parent).filter((id) => id !== 0));
  const facets  = new Set<string>();
  for (const c of tree) {
    if (c.parent === 0 && parents.has(c.id)) {
      facets.add(c.slug);
      for (const child of tree) if (child.parent === c.id) facets.add(child.slug);
    }
  }
  return facets;
}

/** True when a Woo term is a facet value / descriptor rather than a browse aisle. */
function isFacetTerm(c: WooCategory, facets: Set<string>): boolean {
  return facets.has(c.slug) || isDescriptiveTerm(c.name) || c.slug === "uncategorized";
}

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

const EMPTY_FACETS: Set<string> = new Set();

// WooCommerce category names flow through exactly as typed in the admin. There
// is no list of expected categories anywhere in the frontend and no guessing
// from the product name: a kit with no browse category simply has none, rather
// than being filed under an aisle that does not exist in the store.

/** Every browse category a product belongs to, in WooCommerce order. */
function mapCategories(cats: WooCategory[], facets: Set<string>): Category[] {
  const out: Category[] = [];
  for (const c of cats) {
    if (isFacetTerm(c, facets)) continue;
    if (!out.includes(c.name)) out.push(c.name);
  }
  return out;
}

/**
 * The primary category — the badge on a product card and the label on the
 * product page. WooCommerce has no notion of a primary category, so this is
 * simply the first one it returns; "" when the kit has no browse category.
 */
function mapCategory(cats: WooCategory[], facets = EMPTY_FACETS): Category {
  return mapCategories(cats, facets)[0] ?? "";
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

export function mapWooProduct(p: WooProduct, facets = EMPTY_FACETS): Product {
  return {
    id:           String(p.id),
    name:         p.name,
    slug:         p.slug,
    category:     mapCategory(p.categories, facets),
    categories:   mapCategories(p.categories, facets),
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
// The regular mapWooProduct fills defaults ("Beginner", "6–12") when the
// attributes are missing. That makes it impossible for the merge to tell whether
// WooCommerce actually provided a value. This variant returns null for any
// editorial field the client has not yet filled in, so the merge can fall back
// to data/products.ts only for those fields.

export interface WooProductRaw extends Omit<Product, 'category' | 'ageRange' | 'difficulty'> {
  category:   Category   | null;
  ageRange:   string     | null;
  difficulty: Difficulty | null;
}

export function mapWooProductRaw(p: WooProduct, facets = EMPTY_FACETS): WooProductRaw {
  const browsable = mapCategories(p.categories, facets);

  return {
    category:     browsable[0] ?? null,
    id:           String(p.id),
    name:         p.name,
    slug:         p.slug,
    categories:   browsable,
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
  const [raw, facets] = await Promise.all([wooFetchAllProducts(params), getFacetSlugs()]);
  return raw.map((p) => mapWooProductRaw(p, facets));
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

// The category tree is a handful of terms, so one un-paginated read is enough
// for any realistic store; `hide_empty` stays off so a freshly created (still
// empty) category is still recognised as part of a facet tree.
async function wooFetchCategoryTree(): Promise<WooCategoryTerm[]> {
  const all: WooCategoryTerm[] = [];
  for (let page = 1; ; page++) {
    const batch = await wooFetch<WooCategoryTerm[]>("/products/categories", {
      per_page: "100",
      page:     String(page),
    });
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

/**
 * Slugs that must never be treated as browse categories. Falls back to an empty
 * set if Woo is unreachable — mapping then degrades to the name-based heuristics
 * rather than failing the whole product read.
 */
async function getFacetSlugs(): Promise<Set<string>> {
  try {
    return facetSlugs(await wooFetchCategoryTree());
  } catch (err) {
    console.error("[woo] category tree unavailable", err);
    return EMPTY_FACETS;
  }
}

// ─── Public API ────────────────────────────────────────────────────────────

export interface BrowseCategory {
  name:  string;
  slug:  string;
  count: number;
}

/**
 * The categories the storefront browses by: every non-empty WooCommerce
 * category that is not a facet container or facet value. Straight from Woo —
 * nothing here is hardcoded, so creating a category in the admin adds a tile.
 */
export async function getBrowseCategories(): Promise<BrowseCategory[]> {
  const tree   = await wooFetchCategoryTree();
  const facets = facetSlugs(tree);
  return tree
    .filter((c) => !isFacetTerm(c, facets) && c.count > 0)
    .map((c) => ({ name: c.name, slug: c.slug, count: c.count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function getProducts(params?: Record<string, string>): Promise<Product[]> {
  const [raw, facets] = await Promise.all([wooFetchAllProducts(params), getFacetSlugs()]);
  return raw.map((p) => mapWooProduct(p, facets));
}

export async function getProduct(slug: string): Promise<Product | null> {
  const [raw, facets] = await Promise.all([
    wooFetch<WooProduct[]>("/products", { slug }),
    getFacetSlugs(),
  ]);
  return raw.length ? mapWooProduct(raw[0], facets) : null;
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
