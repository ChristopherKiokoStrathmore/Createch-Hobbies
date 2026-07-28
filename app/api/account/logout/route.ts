import { NextResponse } from "next/server";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/customerAuth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // maxAge 0 expires it immediately. There is no server-side session to tear
  // down: the JWT is stateless, and it is only reachable through this cookie.
  res.cookies.set(AUTH_COOKIE, "", { ...authCookieOptions, maxAge: 0 });
  return res;
}
