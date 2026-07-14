import { NextRequest, NextResponse } from "next/server";

// Server-side proxy to the backend DPO token verification.
//
// The browser is redirected back from DPO with ?TransactionToken=<token>. That
// token — NOT the order record, and never CCDapproval — is the authoritative
// payment signal: the backend runs DPO verifyToken and reports whether the
// transaction is actually paid. Verifying the token (rather than reading an
// order status a webhook may not have updated yet) avoids the redirect-beats-
// webhook race where a genuinely-paid customer would be shown "payment failed".
//
// This route forwards the token to the backend server-side and returns only a
// sanitised result. The DPO token is never echoed back to the client.

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim() ?? "";

  if (!token) {
    return NextResponse.json({ error: "Missing payment token." }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(
      `${API_BASE}/api/payment/status/?token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not reach the payment service." },
      { status: 502 },
    );
  }

  // Backend 4xx (e.g. bad/unknown token) is terminal — surface it as 400 so the
  // client stops retrying. 5xx / unreachable is transient — surface as 502 so the
  // client keeps polling. (verifyToken lag looks like 5xx or a 200/pending, never 4xx.)
  if (res.status >= 400 && res.status < 500) {
    return NextResponse.json(
      { error: "Invalid or unknown payment token." },
      { status: 400 },
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: "Could not verify payment." },
      { status: 502 },
    );
  }

  const data = (await res.json()) as {
    paid?: boolean;
    status?: string;
    amount?: string;
    currency?: string;
  };

  // Sanitised passthrough — no token, no gateway meta, no approval codes.
  return NextResponse.json({
    paid: data.paid === true,
    status: data.status ?? (data.paid ? "paid" : "pending"),
    amount: data.amount ?? null,
    currency: data.currency ?? null,
  });
}
