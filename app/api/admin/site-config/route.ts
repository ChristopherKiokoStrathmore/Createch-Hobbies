import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { DEFAULT_CONFIG } from "@/lib/siteConfigDefaults";
import { isAdminAuthorized } from "@/lib/adminAuth";
import { safeDeepMerge, sanitizeSiteConfig } from "@/lib/siteConfigValidation";
import {
  readSiteConfig,
  writeSiteConfig,
  siteConfigStoreConfigured,
  SITE_CONFIG_TAG,
} from "@/lib/siteConfigStore";
import type { SiteConfig } from "@/types/site-config";

// Config lives in WordPress (createch-site-config plugin), not on disk. Reads go
// through a 60s cache tagged SITE_CONFIG_TAG; a successful write purges that tag
// so the change is live immediately rather than up to a minute later.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await readSiteConfig());
}

export async function PUT(req: Request) {
  if (!isAdminAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Refuse rather than accept a save we cannot persist. Reporting success on a
  // write that goes nowhere is precisely the bug this route replaced.
  if (!siteConfigStoreConfigured) {
    return NextResponse.json(
      {
        error:
          "Configuration storage is not set up, so this change cannot be saved. Set SITE_CONFIG_SECRET in the environment and redeploy.",
      },
      { status: 503 },
    );
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
    // href sink before it is stored.
    const merged = safeDeepMerge(
      DEFAULT_CONFIG as unknown as Record<string, unknown>,
      body as Record<string, unknown>,
    ) as unknown as SiteConfig;

    await writeSiteConfig(sanitizeSiteConfig(merged));
    revalidateTag(SITE_CONFIG_TAG);

    return NextResponse.json({ ok: true });
  } catch (e) {
    // Do not leak internal error detail to the client.
    console.error("[site-config] write failed:", e);
    return NextResponse.json(
      { error: "Could not save the configuration. Please try again." },
      { status: 502 },
    );
  }
}
