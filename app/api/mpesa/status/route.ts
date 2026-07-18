import { NextRequest, NextResponse } from "next/server";

// Server-side proxy to the WordPress M-Pesa payment-status endpoint.
//
// M-Pesa is a direct WooCommerce gateway (wc-mpesa-stk-push) — it does NOT go
// through DPO or the Django backend. Safaricom's callback marks the order paid
// inside WooCommerce, so WooCommerce is the source of truth. The plugin exposes
// a read-only, order-key-authenticated status route; this proxy forwards to it
// so the browser never talks cross-origin to WordPress.

const STORE_URL =
  process.env.NEXT_PUBLIC_WOO_STORE_URL ??
  "https://wp.createch-hobbies.co.ke/wp-json/wc/store/v1";
const WP_ORIGIN = new URL(STORE_URL).origin;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const order = req.nextUrl.searchParams.get("order")?.trim() ?? "";
  const key = req.nextUrl.searchParams.get("key")?.trim() ?? "";

  if (!order || !key) {
    return NextResponse.json(
      { error: "Missing order or key." },
      { status: 400 },
    );
  }

  let res: Response;
  try {
    res = await fetch(
      `${WP_ORIGIN}/?wc-api=wc_mpesa_status&order_id=${encodeURIComponent(order)}&key=${encodeURIComponent(key)}`,
      { cache: "no-store" },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not reach the payment service." },
      { status: 502 },
    );
  }

  // 4xx (bad/unknown order or key) is terminal — return 400 so the client
  // stops polling. Anything else non-OK is transient — 502, keep polling.
  if (res.status >= 400 && res.status < 500) {
    return NextResponse.json(
      { error: "Invalid or unknown order." },
      { status: 400 },
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: "Could not check payment status." },
      { status: 502 },
    );
  }

  const data = (await res.json()) as { status?: string; receipt?: string };

  return NextResponse.json({
    status: data.status ?? "pending",
    receipt: data.receipt ?? "",
  });
}
