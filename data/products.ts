// Category and Difficulty are open strings: whatever taxonomy WooCommerce
// sends flows straight through to the UI without a frontend change. The
// known lists below only control ordering and bespoke styling — a value
// outside them still renders, with generated/neutral styling.
export type Difficulty = string;
export type Category = string;

export const KNOWN_CATEGORIES = [
  "Vehicles",
  "Machines",
  "Science",
  "Space",
  "Robots",
  "Architecture",
] as const;

export const DIFFICULTY_ORDER = ["Beginner", "Intermediate", "Advanced"] as const;

/** Known categories first (in canonical order), then any new ones alphabetically. */
export function orderCategories(present: Iterable<Category>): Category[] {
  const set = new Set(present);
  const known = KNOWN_CATEGORIES.filter((c) => set.has(c));
  const extra = [...set]
    .filter((c) => !(KNOWN_CATEGORIES as readonly string[]).includes(c))
    .sort();
  return [...known, ...extra];
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
  category: Category;
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
