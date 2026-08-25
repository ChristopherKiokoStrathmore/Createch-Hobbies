import { NextResponse } from "next/server";
import { getBrowseCategories, wooConfigured, type BrowseCategory } from "@/lib/woo";

export const revalidate = 60;

export async function GET() {
  if (!wooConfigured) {
    return NextResponse.json([] as BrowseCategory[]);
  }

  try {
    return NextResponse.json(await getBrowseCategories());
  } catch (err) {
    console.error("[/api/categories]", err);
    return NextResponse.json([] as BrowseCategory[]);
  }
}
