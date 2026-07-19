import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createHmac, timingSafeEqual } from "crypto";
import { isAdminAuthorized } from "@/lib/adminAuth";

// Purges every WooCommerce product read (the "woo-products" cache tag) so a
// change saved in wp-admin shows on the site within seconds instead of waiting
// out the 60s TTL. Point WooCommerce webhooks (product created/updated/
// deleted/restored) at this route with WC_WEBHOOK_SECRET as the webhook
// secret; the x-admin-key header also works for manual/curl use.

// WooCommerce signs each delivery: base64(HMAC-SHA256(raw body, secret)).
function isValidWooSignature(body: string, signature: string | null): boolean {
  const secret = process.env.WC_WEBHOOK_SECRET ?? "";
  if (!secret || !signature) return false;
  const expected = Buffer.from(
    createHmac("sha256", secret).update(body, "utf8").digest("base64"),
  );
  const provided = Buffer.from(signature);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-wc-webhook-signature");

  if (isValidWooSignature(body, signature) || isAdminAuthorized(req)) {
    revalidateTag("woo-products");
    return NextResponse.json({ revalidated: true });
  }

  // WooCommerce sends an unsigned "webhook_id=N" ping when a webhook is first
  // saved. Acknowledge it (a non-2xx would make WP disable the webhook) but
  // purge nothing, so the unauthenticated path stays side-effect free.
  if (body.startsWith("webhook_id=")) {
    return NextResponse.json({ ping: true });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
