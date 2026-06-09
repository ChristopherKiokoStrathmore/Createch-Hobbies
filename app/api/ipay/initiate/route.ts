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

    const origin = new URL(req.url).origin;
    const fields = buildIPayFields({
      orderId,
      amount:        total,
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
