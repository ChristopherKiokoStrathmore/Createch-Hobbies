// Category and Difficulty are open strings: whatever taxonomy WooCommerce
// sends flows straight through to the UI without a frontend change. There is
// no list of expected categories here — WooCommerce is the only source of
// which categories exist.
export type Difficulty = string;
export type Category = string;

// Levels have a real order (easiest → hardest) that alphabetical sorting would
// destroy, so the three standard rungs are ranked. This is an ordering hint
// only: a level WooCommerce sends that is not listed still renders.
export const DIFFICULTY_ORDER = ["Beginner", "Intermediate", "Advanced"] as const;

/** De-duplicated, alphabetical — the order the filter lists categories in. */
export function orderCategories(present: Iterable<Category>): Category[] {
  return [...new Set(present)].filter(Boolean).sort((a, b) => a.localeCompare(b));
}

/**
 * Every browse category a kit is filed under. Tolerates a product payload that
 * predates the `categories` list (a cached /api/products response, say) by
 * falling back to the single primary category.
 */
export function productCategories(p: Pick<Product, "category" | "categories">): Category[] {
  const list = p.categories?.length ? p.categories : [p.category];
  return list.filter(Boolean);
}

/** Known difficulties first (easiest → hardest), then any new ones alphabetically. */
export function orderDifficulties(present: Iterable<Difficulty>): Difficulty[] {
  const set = new Set(present);
  const known = DIFFICULTY_ORDER.filter((d) => set.has(d));
  const extra = [...set]
    .filter((d) => !(DIFFICULTY_ORDER as readonly string[]).includes(d))
    .sort();
  return [...known, ...extra];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;    // primary aisle — used for badges and "related kits"
  categories: Category[]; // every browse category the kit belongs to
  ageRange: string;
  difficulty: Difficulty;
  price: number;         // active price — the sale price while a sale runs
  regularPrice: number;  // pre-sale price; equals price when not on sale
  onSale: boolean;
  description: string;
  whatYouLearn: string[];
  images: string[];
  inStock: boolean;
  featured: boolean;
}
