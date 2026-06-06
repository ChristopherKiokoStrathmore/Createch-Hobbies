import { NextResponse } from "next/server";
import { getRawWooProducts, wooConfigured } from "@/lib/woo";
import type { WooProductRaw } from "@/lib/woo";
import { products as staticProducts } from "@/data/products";
import type { Product } from "@/data/products";

export const revalidate = 60;

// Merge WooCommerce live data with static editorial metadata.
//
// Priority rules:
//   WooCommerce wins for:  price, stock, images, featured
//   WooCommerce wins for:  category / ageRange / difficulty / description / whatYouLearn
//                          ONLY when the client has filled those fields in WooCommerce.
//   Static file wins for:  any editorial field the client has left blank in WooCommerce.
//
// This means the client can gradually fill in WooCommerce and each field migrates
// over automatically. data/products.ts becomes purely a fallback.
function mergeWithStatic(wooList: WooProductRaw[]): Product[] {
  // Exclude WooCommerce sample/demo products (USD-priced, price < 200 KES)
  const kits = wooList.filter((p) => p.price > 200);

  return kits.map((woo): Product => {
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

    // No static match — newly-added product, apply defaults and return as-is
    if (!stat) {
      return {
        ...woo,
        category:   woo.category   ?? "Science",
        ageRange:   woo.ageRange   ?? "6–12",
        difficulty: woo.difficulty ?? "Beginner",
      };
    }

    return {
      // Static file provides the editorial baseline
      ...stat,
      // WooCommerce always wins for live commerce fields
      id:       woo.id,
      price:    woo.price,
      inStock:  woo.inStock,
      images:   woo.images.length > 0 ? woo.images : stat.images,
      featured: woo.featured,
      // WooCommerce wins for editorial fields only when the client has filled them in
      category:     woo.category              ?? stat.category,
      ageRange:     woo.ageRange              ?? stat.ageRange,
      difficulty:   woo.difficulty            ?? stat.difficulty,
      description:  woo.description           || stat.description,
      whatYouLearn: woo.whatYouLearn.length > 0 ? woo.whatYouLearn : stat.whatYouLearn,
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
    const woo = await getRawWooProducts(params);
    const merged = mergeWithStatic(woo);
    return NextResponse.json(featured ? merged.filter((p) => p.featured) : merged);
  } catch (err) {
    console.error("[/api/products]", err);
    const data = featured ? staticProducts.filter((p) => p.featured) : staticProducts;
    return NextResponse.json(data);
  }
}
