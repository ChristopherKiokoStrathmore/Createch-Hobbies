import { NextResponse } from "next/server";
import { DEFAULT_CONFIG } from "@/lib/siteConfigDefaults";
import type { SiteConfig } from "@/types/site-config";

const TMP_PATH = "/tmp/site-config.json";

function getStaticPath(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const path = require("path") as typeof import("path");
  return path.join(process.cwd(), "data", "site-config.json");
}

function readCurrent(): SiteConfig {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs") as typeof import("fs");
    if (fs.existsSync(TMP_PATH)) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(TMP_PATH, "utf8")) };
    }
    const sp = getStaticPath();
    if (fs.existsSync(sp)) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(fs.readFileSync(sp, "utf8")) };
    }
  } catch { /* fall through */ }
  return DEFAULT_CONFIG;
}

function writeConfig(config: SiteConfig): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("fs") as typeof import("fs");
  const json = JSON.stringify(config, null, 2);
  try { fs.writeFileSync(TMP_PATH, json); } catch { /* /tmp not available */ }
  try { fs.writeFileSync(getStaticPath(), json); } catch { /* read-only in prod */ }
}

function authOk(req: Request): boolean {
  return req.headers.get("x-admin-key") === process.env.ADMIN_SECRET_KEY;
}

export async function GET() {
  return NextResponse.json(readCurrent());
}

export async function PUT(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await req.json()) as SiteConfig;
    const merged: SiteConfig = { ...DEFAULT_CONFIG, ...body };
    writeConfig(merged);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
