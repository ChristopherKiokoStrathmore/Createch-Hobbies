import { NextResponse } from "next/server";
import { getEnabledGateways, wooConfigured, type PaymentGateway } from "@/lib/woo";

// Enabled WooCommerce payment gateways, so toggling a method on/off in
// wp-admin (Settings → Payments) shows/hides it at checkout without a deploy.
export async function GET() {
  if (!wooConfigured) {
    return NextResponse.json([] as PaymentGateway[]);
  }

  try {
    return NextResponse.json(await getEnabledGateways());
  } catch (err) {
    console.error("[/api/payment-methods]", err);
    return NextResponse.json([] as PaymentGateway[]);
  }
}
