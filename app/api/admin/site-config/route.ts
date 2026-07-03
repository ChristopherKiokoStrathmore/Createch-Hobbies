import { NextResponse } from "next/server";
import { DEFAULT_CONFIG } from "@/lib/siteConfigDefaults";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { safeDeepMerge, sanitizeSiteConfig } from "@/lib/siteConfigValidation";
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

export async function GET() {
  return NextResponse.json(readCurrent());
}

export async function PUT(req: Request) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Config must be an object" }, { status: 400 });
  }
  try {
    // Deep-merge over defaults (a shallow spread wiped sibling nested keys) with
    // a prototype-pollution guard, then scrub every field that reaches a CSS or
    // href sink before it ever touches disk.
    const merged = safeDeepMerge(
      DEFAULT_CONFIG as unknown as Record<string, unknown>,
      body as Record<string, unknown>,
    ) as unknown as SiteConfig;
    writeConfig(sanitizeSiteConfig(merged));
    return NextResponse.json({ ok: true });
  } catch (e) {
    // Do not leak internal error detail to the client.
    console.error("[site-config] write failed:", e);
    return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 });
  }
}
