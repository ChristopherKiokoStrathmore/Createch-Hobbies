import { NextRequest, NextResponse } from "next/server";
import {
  wpAuthFetch,
  readAuthToken,
  AUTH_COOKIE,
  authCookieOptions,
  type Customer,
} from "@/lib/customerAuth";

interface AccountResponse { customer: Customer }

// A 401 from WordPress means the token is expired, or was signed before a
// password change. Either way the cookie is dead weight, so clear it — that is
// what stops the client retrying with it on every page load.
function unauthorized(message: string) {
  const res = NextResponse.json({ error: message }, { status: 401 });
  res.cookies.set(AUTH_COOKIE, "", { ...authCookieOptions, maxAge: 0 });
  return res;
}

export async function GET() {
  const token = await readAuthToken();
  if (!token) return NextResponse.json({ customer: null });

  const result = await wpAuthFetch<AccountResponse>("/account", { token });

  if (result.status === 401) return unauthorized(result.message);
  if (!result.ok || !result.data) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({ customer: result.data.customer });
}

export async function PUT(req: NextRequest) {
  const token = await readAuthToken();
  if (!token) return unauthorized("Not signed in.");

  const body = await req.json().catch(() => ({}));

  const result = await wpAuthFetch<AccountResponse>("/account", {
    method: "PUT",
    body,
    token,
  });

  if (result.status === 401) return unauthorized(result.message);
  if (!result.ok || !result.data) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({ customer: result.data.customer });
}
