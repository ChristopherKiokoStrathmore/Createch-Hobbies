import { NextResponse } from "next/server";
import { getProducts, wooConfigured } from "@/lib/woo";
import type { Product } from "@/data/products";

export const revalidate = 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const featured = searchParams.get("featured") === "true";

  if (!wooConfigured) {
    return NextResponse.json([] as Product[]);
  }

  try {
    const params: Record<string, string> = {};
    if (featured) params.featured = "true";
    const all = await getProducts(params);
    return NextResponse.json(featured ? all.filter((p) => p.featured) : all);
  } catch (err) {
    console.error("[/api/products]", err);
    return NextResponse.json([] as Product[]);
  }
}
