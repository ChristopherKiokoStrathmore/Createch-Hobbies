import type { SiteConfig } from "@/types/site-config";
import { readSiteConfig } from "./siteConfigStore";

// Server-side config read. The storage itself lives in lib/siteConfigStore.ts
// (a WordPress option behind the createch-site-config plugin); this module is
// only the entry point the layout and pages call.
//
// This previously read /tmp/site-config.json with a bundled-file fallback. On a
// serverless host neither survives: /tmp belongs to one instance and both are
// wiped on deploy, so every saved edit was eventually lost. See siteConfigStore.

export async function getSiteConfig(): Promise<SiteConfig> {
  return readSiteConfig();
}

export function hexToRgbSpace(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "245 190 77";
  return `${r} ${g} ${b}`;
}
