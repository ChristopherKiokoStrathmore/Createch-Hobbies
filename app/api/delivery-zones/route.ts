import { NextResponse } from "next/server";
import { DELIVERY_ZONES, type DeliveryZone } from "@/data/delivery-zones";

// Delivery-zone list for the checkout dropdown. The `createch-delivery-fees`
// WooCommerce plugin is the source of truth; we proxy its REST route server-side
// (so no CORS handling is needed) and fall back to the bundled list if wp is
// unreachable — checkout must never be blocked by a reference-data lookup.
const WOO_URL = process.env.WOO_URL ?? "";

export const revalidate = 3600; // zones change rarely — cache for an hour

export async function GET() {
  if (WOO_URL) {
    try {
      const res = await fetch(`${WOO_URL}/wp-json/createch/v1/delivery-zones`, {
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const zones = (await res.json()) as DeliveryZone[];
        if (Array.isArray(zones) && zones.length > 0) {
          return NextResponse.json(zones);
        }
      }
    } catch {
      // fall through to the bundled fallback
    }
  }
  return NextResponse.json(DELIVERY_ZONES);
}
