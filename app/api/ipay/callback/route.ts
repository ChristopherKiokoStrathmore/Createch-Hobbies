import { NextResponse } from "next/server";
import { IPAY_STATUS } from "@/lib/ipay";

// iPay sends IPN as an application/x-www-form-urlencoded POST.
// Django needs: POST /api/orders/{id}/mark-paid/  { receipt, payment_channel }
//               POST /api/orders/{id}/mark-failed/ { reason }

const DJANGO = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function POST(req: Request) {
  try {
    const text   = await req.text();
    const params = Object.fromEntries(new URLSearchParams(text));

    const { status, id: orderId, qwh: receipt, mc: paymentChannel } = params;

    if (!orderId) {
      return new Response("missing order id", { status: 400 });
    }

    if (status === IPAY_STATUS.SUCCESS) {
      await fetch(`${DJANGO}/api/orders/${orderId}/mark-paid/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ receipt: receipt ?? "", payment_channel: paymentChannel ?? "" }),
      }).catch((e) => console.error("[ipay/callback] mark-paid failed:", e));
    } else if (status === IPAY_STATUS.FAILED || status === IPAY_STATUS.LESS) {
      await fetch(`${DJANGO}/api/orders/${orderId}/mark-failed/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ reason: `iPay status: ${status}` }),
      }).catch((e) => console.error("[ipay/callback] mark-failed failed:", e));
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("[ipay/callback]", err);
    return new Response("error", { status: 500 });
  }
}
