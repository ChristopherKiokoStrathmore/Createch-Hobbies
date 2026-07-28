import { NextRequest, NextResponse } from "next/server";
import { wpAuthFetch } from "@/lib/customerAuth";

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: string };

  await wpAuthFetch("/auth/forgot", { method: "POST", body: { email: body.email ?? "" } });

  // Always the same answer. Reporting whether the address was found would turn
  // this into a way to test which emails have accounts.
  return NextResponse.json({ ok: true });
}
