import { NextRequest, NextResponse } from "next/server";
import { wpAuthFetch, readAuthToken } from "@/lib/customerAuth";

// Called by the checkout right after an order is created, so a signed-in
// customer's guest-session order still lands in their order history. The order
// key is the per-order secret WooCommerce hands back only to the browser that
// placed it — WordPress checks it before adopting the order.
export async function POST(req: NextRequest) {
  const token = await readAuthToken();
  if (!token) return NextResponse.json({ ok: false }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { orderId?: number; orderKey?: string };
  if (!body.orderId || !body.orderKey) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const result = await wpAuthFetch<{ ok: boolean }>("/account/claim-order", {
    method: "POST",
    body:   { order_id: body.orderId, order_key: body.orderKey },
    token,
  });

  return NextResponse.json({ ok: result.ok }, { status: result.ok ? 200 : result.status });
}
