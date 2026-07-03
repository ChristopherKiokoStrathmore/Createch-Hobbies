import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminAuthorized } from "@/lib/adminAuth";

export async function POST(req: Request) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  revalidateTag("site-config");
  return NextResponse.json({ revalidated: true });
}
