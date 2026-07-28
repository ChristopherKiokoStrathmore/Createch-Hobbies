import { NextRequest, NextResponse } from "next/server";
import {
  wpAuthFetch,
  readAuthToken,
  AUTH_COOKIE,
  authCookieOptions,
  type CustomerOrder,
} from "@/lib/customerAuth";

export async function GET(req: NextRequest) {
  const token = await readAuthToken();
  if (!token) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page     = searchParams.get("page") ?? "1";
  const perPage  = searchParams.get("per_page") ?? "20";

  const result = await wpAuthFetch<CustomerOrder[]>(
    `/account/orders?page=${encodeURIComponent(page)}&per_page=${encodeURIComponent(perPage)}`,
    { token }
  );

  if (result.status === 401) {
    const res = NextResponse.json({ error: result.message }, { status: 401 });
    res.cookies.set(AUTH_COOKIE, "", { ...authCookieOptions, maxAge: 0 });
    return res;
  }
  if (!result.ok || !result.data) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  return NextResponse.json({ orders: result.data });
}
