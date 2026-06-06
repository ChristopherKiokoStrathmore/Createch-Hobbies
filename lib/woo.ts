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
  images:            WooImage[];
  attributes:        WooAttribute[];
  categories:        WooCategory[];
  stock_status:      "instock" | "outofstock";
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

const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];

function mapCategory(cats: WooCategory[]): Category {
  for (const c of cats) {
    const byName = CATEGORY_MAP[c.name.toLowerCase()];
    if (byName) return byName;
    const bySlug = CATEGORY_MAP[c.slug];
    if (bySlug) return bySlug;
  }
  return "Science";
}

function mapDifficulty(attrs: WooAttribute[]): Difficulty {
  const val = getAttr(attrs, "Difficulty").find((v) => DIFFICULTIES.includes(v as Difficulty));
  return (val as Difficulty) ?? "Beginner";
}

function mapAgeRange(attrs: WooAttribute[]): string {
  return getAttr(attrs, "Age Range")[0] ?? "6–12";
}

function mapWhatYouLearn(attrs: WooAttribute[]): string[] {
  const learn = getAttr(attrs, "What You Learn");
  return learn.length ? learn : getAttr(attrs, "Skills");
}

export function mapWooProduct(p: WooProduct): Product {
  return {
    id:           String(p.id),
    name:         p.name,
    slug:         p.slug,
    category:     mapCategory(p.categories),
    ageRange:     mapAgeRange(p.attributes),
    difficulty:   mapDifficulty(p.attributes),
    price:        parseFloat(p.price) || 0,
    description:  stripHtml(p.short_description || p.description),
    whatYouLearn: mapWhatYouLearn(p.attributes),
    images:       p.images.length ? p.images.map((img) => img.src) : ["/images/placeholder.png"],
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
    const byName = CATEGORY_MAP[c.name.toLowerCase()];
    if (byName) { category = byName; break; }
    const bySlug = CATEGORY_MAP[c.slug];
    if (bySlug) { category = bySlug; break; }
  }

  const ageRaw  = getAttr(p.attributes, "Age Range")[0];
  const diffRaw = getAttr(p.attributes, "Difficulty").find(
    (v) => DIFFICULTIES.includes(v as Difficulty),
  );

  return {
    id:           String(p.id),
    name:         p.name,
    slug:         p.slug,
    category,
    ageRange:     ageRaw  ?? null,
    difficulty:   (diffRaw as Difficulty) ?? null,
    price:        parseFloat(p.price) || 0,
    description:  stripHtml(p.short_description || p.description),
    whatYouLearn: mapWhatYouLearn(p.attributes),
    images:       p.images.length ? p.images.map((img) => img.src) : ["/images/placeholder.png"],
    inStock:      p.stock_status === "instock",
    featured:     p.featured,
  };
}

export async function getRawWooProducts(params?: Record<string, string>): Promise<WooProductRaw[]> {
  const raw = await wooFetch<WooProduct[]>("/products", {
    per_page: "100",
    status:   "publish",
    ...params,
  });
  return raw.map(mapWooProductRaw);
}

// ─── Fetch ─────────────────────────────────────────────────────────────────

async function wooFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${WOO_URL}/wp-json/wc/v3${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const auth = Buffer.from(`${WOO_KEY}:${WOO_SECRET}`).toString("base64");
  const res  = await fetch(url.toString(), {
    headers: { Authorization: `Basic ${auth}` },
    next:    { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`WooCommerce ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

// ─── Public API ────────────────────────────────────────────────────────────

export async function getProducts(params?: Record<string, string>): Promise<Product[]> {
  const raw = await wooFetch<WooProduct[]>("/products", {
    per_page: "100",
    status:   "publish",
    ...params,
  });
  return raw.map(mapWooProduct);
}

export async function getProduct(slug: string): Promise<Product | null> {
  const raw = await wooFetch<WooProduct[]>("/products", { slug });
  return raw.length ? mapWooProduct(raw[0]) : null;
}
