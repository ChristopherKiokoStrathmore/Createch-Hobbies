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

    // SECURITY: this route is NOT the trust boundary. A raw `status` field is
    // trivially forgeable by anyone who POSTs here, so the paid/failed decision
    // MUST be re-verified server-side. We forward the full, unmodified iPay
    // payload to Django (via `ipay_params`) so the backend can recompute the
    // iPay hash / call iPay's transaction-status query API and confirm the
    // amount before it actually flips the order to paid. Do not mark an order
    // paid off this signal alone.
    const forward = async (path: string, extra: Record<string, unknown>) => {
      const res = await fetch(`${DJANGO}${path}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...extra, ipay_params: params }),
      });
      if (!res.ok) {
        throw new Error(`${path} responded ${res.status}`);
      }
    };

    if (status === IPAY_STATUS.SUCCESS) {
      await forward(`/api/orders/${orderId}/mark-paid/`, {
        receipt: receipt ?? "",
        payment_channel: paymentChannel ?? "",
      });
    } else if (status === IPAY_STATUS.FAILED || status === IPAY_STATUS.LESS) {
      await forward(`/api/orders/${orderId}/mark-failed/`, {
        reason: `iPay status: ${status}`,
      });
    }

    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("[ipay/callback]", err);
    return new Response("error", { status: 500 });
  }
}
