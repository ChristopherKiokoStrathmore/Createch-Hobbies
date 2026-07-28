import { NextRequest, NextResponse } from "next/server";
import {
  wpAuthFetch,
  AUTH_COOKIE,
  AUTH_MAX_AGE,
  authCookieOptions,
  type Customer,
} from "@/lib/customerAuth";

interface AuthResponse { token: string; customer: Customer }

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };

  const result = await wpAuthFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body:   { email: body.email ?? "", password: body.password ?? "" },
  });

  if (!result.ok || !result.data) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  // The token is set here and never returned in the body — the client only
  // learns who is signed in, not how to prove it.
  const res = NextResponse.json({ customer: result.data.customer });
  res.cookies.set(AUTH_COOKIE, result.data.token, { ...authCookieOptions, maxAge: AUTH_MAX_AGE });
  return res;
}
