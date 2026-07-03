import { NextResponse } from "next/server";
import { buildIPayFields, IPAY_URL } from "@/lib/ipay";

// Expects Django to accept payment_method="ipay" and return { order_id, ... }
// without triggering any IntaSend/mobile-money initiation.
const DJANGO = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customer_name,
      customer_phone,
      customer_email,
      delivery_address,
      payment_method,
      total,
      items,
    } = body;

    if (!customer_name || !customer_phone || !delivery_address || !total || !items?.length) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const orderRes = await fetch(`${DJANGO}/api/orders/`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name,
        customer_phone,
        customer_email: customer_email || "",
        delivery_address,
        payment_method: "ipay",
        items,
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.json().catch(() => ({}));
      return NextResponse.json({ error: (err as Record<string,string>).error ?? "Order creation failed" }, { status: 400 });
    }

    const order = await orderRes.json();
    const orderId: string = order.order_id ?? String(order.id);

    // Never charge the client-supplied `total`. Django recomputes the order
    // total server-side from the line items, so use that authoritative value
    // for the amount we hash and send to iPay. Fall back to the client value
    // only if the backend did not return one.
    const authoritative = Number(order.total_amount ?? order.total);
    const amount = Number.isFinite(authoritative) && authoritative > 0
      ? authoritative
      : Number(total);

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const fields = buildIPayFields({
      orderId,
      amount,
      phone:         customer_phone,
      email:         customer_email || "",
      paymentMethod: payment_method,
      cbk:           `${origin}/checkout/confirmation/${orderId}`,
      lbk:           `${origin}/api/ipay/callback`,
    });

    return NextResponse.json({ fields, ipayUrl: IPAY_URL, orderId });
  } catch (err) {
    console.error("[ipay/initiate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
