import { NextResponse } from "next/server";
import { getProducts, wooConfigured } from "@/lib/woo";
import { products as staticProducts } from "@/data/products";
import type { Product } from "@/data/products";

export const revalidate = 60;

// Merge WooCommerce live data (price, stock, images) with our editorial metadata (category, difficulty, etc.)
function mergeWithStatic(wooList: Product[]): Product[] {
  // Keep only kit products — exclude WooCommerce sample data (non-KES pricing in wrong categories)
  const kits = wooList.filter((p) => p.price > 200);

  return kits.map((woo) => {
    const wooName = woo.name.toLowerCase().replace(/\s+kit$/i, "").replace(/\s+/g, " ").trim();
    const stat = staticProducts.find((s) => {
      const statName = s.name.toLowerCase().replace(/\s+kit$/i, "").replace(/\s+/g, " ").trim();
      return (
        s.slug === woo.slug ||
        statName === wooName ||
        statName.includes(wooName) ||
        wooName.includes(statName)
      );
    });
    if (!stat) return woo; // Newly-added product, fall through with WooCommerce data

    // WooCommerce is source of truth for: price, stock, images, featured
    // Static file is source of truth for: category, ageRange, difficulty, description, whatYouLearn
    return {
      ...stat,
      id:       woo.id,
      price:    woo.price,
      inStock:  woo.inStock,
      images:   woo.images.length > 0 ? woo.images : stat.images,
      featured: woo.featured,
    };
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get("featured") === "true";

  if (!wooConfigured) {
    const data = featured ? staticProducts.filter((p) => p.featured) : staticProducts;
    return NextResponse.json(data);
  }

  try {
    const params: Record<string, string> = {};
    if (featured) params.featured = "true";
    const woo = await getProducts(params);
    const merged = mergeWithStatic(woo);
    return NextResponse.json(featured ? merged.filter((p) => p.featured) : merged);
  } catch (err) {
    console.error("[/api/products]", err);
    const data = featured ? staticProducts.filter((p) => p.featured) : staticProducts;
    return NextResponse.json(data);
  }
}
