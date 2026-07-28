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
  const body = (await req.json().catch(() => ({}))) as {
    email?: string; password?: string; first_name?: string; last_name?: string; phone?: string;
  };

  const result = await wpAuthFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: {
      email:      body.email ?? "",
      password:   body.password ?? "",
      first_name: body.first_name ?? "",
      last_name:  body.last_name ?? "",
      phone:      body.phone ?? "",
    },
  });

  if (!result.ok || !result.data) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  // Registering signs you straight in — a second trip through the login form
  // right after creating the account is pure friction.
  const res = NextResponse.json({ customer: result.data.customer });
  res.cookies.set(AUTH_COOKIE, result.data.token, { ...authCookieOptions, maxAge: AUTH_MAX_AGE });
  return res;
}
