import type { SiteConfig } from "@/types/site-config";
import { DEFAULT_CONFIG } from "./siteConfigDefaults";
import { safeDeepMerge } from "./siteConfigValidation";

// Durable storage for the site configuration, backed by the createch-site-config
// WordPress plugin.
//
// This replaces the previous /tmp/site-config.json + bundled-file scheme, which
// could not work on a serverless host: /tmp belongs to a single instance and both
// locations are wiped on every deploy, so a saved edit showed for whoever saved it
// and was invisible to everyone else. WordPress is already the store's system of
// record and is already backed up, so the config lives there.

const WP_BASE =
  process.env.WP_SITE_CONFIG_URL ??
  process.env.WOO_URL ??
  "";

const SECRET = process.env.SITE_CONFIG_SECRET ?? "";

export const siteConfigStoreConfigured = Boolean(WP_BASE && SECRET);

const ENDPOINT = `${WP_BASE}/wp-json/createch/v1/site-config`;

/** Cache tag purged on write so a save is visible immediately, not in 60s. */
export const SITE_CONFIG_TAG = "site-config";

interface RemotePayload {
  config: Partial<SiteConfig> | Record<string, never>;
  updatedAt: string | null;
}

/**
 * Read the stored config and merge it over the defaults.
 *
 * Never throws. If WordPress is unreachable or misconfigured we fall back to
 * DEFAULT_CONFIG, because a storefront that renders the wrong headline is far
 * better than one that renders an error page. Next's data cache also keeps
 * serving the last good response while it revalidates, so a brief WordPress
 * outage is invisible.
 */
export async function readSiteConfig(): Promise<SiteConfig> {
  if (!siteConfigStoreConfigured) return DEFAULT_CONFIG;

  try {
    const res = await fetch(ENDPOINT, {
      headers: { "X-Createch-Key": SECRET },
      next: { revalidate: 60, tags: [SITE_CONFIG_TAG] },
    });
    if (!res.ok) return DEFAULT_CONFIG;

    const payload = (await res.json()) as RemotePayload;
    const stored = payload?.config;
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) {
      return DEFAULT_CONFIG;
    }

    // Merge over the defaults so a config saved before a new field existed still
    // renders — the missing branch simply keeps its default.
    return safeDeepMerge(
      DEFAULT_CONFIG as unknown as Record<string, unknown>,
      stored as Record<string, unknown>,
    ) as unknown as SiteConfig;
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Persist the config. Throws on failure so the PUT handler can report a real
 * error to the editor — a save that silently does nothing is the exact failure
 * mode this module exists to eliminate.
 */
export async function writeSiteConfig(config: SiteConfig): Promise<void> {
  if (!siteConfigStoreConfigured) {
    throw new Error(
      "Site config storage is not configured. Set SITE_CONFIG_SECRET (and WOO_URL or WP_SITE_CONFIG_URL) in the environment.",
    );
  }

  const res = await fetch(ENDPOINT, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Createch-Key": SECRET,
    },
    body: JSON.stringify({ config }),
    cache: "no-store",
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Site config store responded ${res.status}: ${detail.slice(0, 200)}`);
  }
}
