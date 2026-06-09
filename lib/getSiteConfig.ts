import type { SiteConfig } from "@/types/site-config";
import { DEFAULT_CONFIG } from "./siteConfigDefaults";

// Helpers — only imported on the server; no "use client" here
function tryRead(path: string): string | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs") as typeof import("fs");
    if (fs.existsSync(path)) return fs.readFileSync(path, "utf8");
  } catch {
    // ignore
  }
  return null;
}

function deepMerge(
  base: Record<string, unknown>,
  over: Record<string, unknown>
): Record<string, unknown> {
  const result = { ...base };
  for (const key of Object.keys(over)) {
    const b = base[key];
    const o = over[key];
    if (
      o && typeof o === "object" && !Array.isArray(o) &&
      b && typeof b === "object" && !Array.isArray(b)
    ) {
      result[key] = deepMerge(
        b as Record<string, unknown>,
        o as Record<string, unknown>
      );
    } else {
      result[key] = o;
    }
  }
  return result;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require("path") as typeof import("path");
    const tmpPath    = "/tmp/site-config.json";
    const staticPath = path.join(process.cwd(), "data", "site-config.json");

    const raw = tryRead(tmpPath) ?? tryRead(staticPath);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SiteConfig>;
      return deepMerge(
        DEFAULT_CONFIG as unknown as Record<string, unknown>,
        parsed as unknown as Record<string, unknown>
      ) as unknown as SiteConfig;
    }
  } catch {
    // fall through to default
  }
  return DEFAULT_CONFIG;
}

export function hexToRgbSpace(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return "245 190 77";
  return `${r} ${g} ${b}`;
}
