import type { SiteConfig, AgeBracket } from "@/types/site-config";
import { DEFAULT_CONFIG } from "./siteConfigDefaults";

// Server-side hardening for the site-config editor. The PUT handler is admin-
// gated, but the stored config is later interpolated straight into inline
// styles (font names, colours) and into <Link href> (banner / CTA / nav), so a
// compromised or careless admin key must not be able to inject CSS-breakouts,
// javascript: URLs, or prototype pollution. We sanitise every field that ends
// up in a dangerous sink and drop back to the default when a value is invalid.

const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const RGBA = /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/;

export function safeColor(v: unknown, fallback: string): string {
  if (typeof v === "string") {
    const s = v.trim();
    if (HEX.test(s) || RGBA.test(s)) return s;
  }
  return fallback;
}

// Font names land inside `--font-heading: '<value>', ...`. Restrict to the
// characters real font families use so the value can never close the quote or
// the CSS declaration.
export function safeFont(v: unknown, fallback: string): string {
  if (typeof v === "string") {
    const s = v.replace(/[^A-Za-z0-9 \-]/g, "").trim();
    if (s) return s;
  }
  return fallback;
}

// Allow only root-relative paths and http(s) URLs. Blocks javascript:, data:,
// vbscript:, protocol-relative //evil, etc. Empty is preserved (optional links).
export function safeUrl(v: unknown, fallback: string): string {
  if (typeof v !== "string") return fallback;
  const s = v.trim();
  if (s === "") return "";
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  try {
    const u = new URL(s);
    if (u.protocol === "http:" || u.protocol === "https:") return s;
  } catch {
    /* not a parseable absolute URL */
  }
  return fallback;
}

// Deep merge with a prototype-pollution guard. Used both when reading config
// off disk and when merging an incoming PUT body over the defaults.
export function safeDeepMerge(
  base: Record<string, unknown>,
  over: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };
  for (const key of Object.keys(over)) {
    if (DANGEROUS_KEYS.has(key)) continue;
    const b = base[key];
    const o = over[key];
    if (
      o && typeof o === "object" && !Array.isArray(o) &&
      b && typeof b === "object" && !Array.isArray(b)
    ) {
      result[key] = safeDeepMerge(
        b as Record<string, unknown>,
        o as Record<string, unknown>,
      );
    } else {
      result[key] = o;
    }
  }
  return result;
}

// Age brackets drive filtering, so a malformed one silently hides products
// rather than just reading oddly. Coerce to whole years, drop any bracket whose
// min exceeds its max or that has no label, and fall back to the defaults if
// that leaves nothing usable — an empty bracket list would render a filter with
// no options at all.
export function safeAgeBrackets(v: unknown, fallback: AgeBracket[]): AgeBracket[] {
  if (!Array.isArray(v)) return fallback;

  const cleaned = v.flatMap((raw): AgeBracket[] => {
    if (!raw || typeof raw !== "object") return [];
    const b = raw as Partial<AgeBracket>;
    const label = typeof b.label === "string" ? b.label.trim() : "";
    const min = Math.round(Number(b.min));
    const max = Math.round(Number(b.max));
    if (!label) return [];
    if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
    if (min < 0 || max < 0 || min > max) return [];
    return [{
      id: typeof b.id === "string" && b.id.trim() ? b.id.trim() : label.toLowerCase().replace(/\s+/g, "-"),
      label,
      min,
      max,
    }];
  });

  return cleaned.length > 0 ? cleaned : fallback;
}

/**
 * Report brackets that overlap so heavily they cannot discriminate — the state
 * the shop was in, where every bracket matched every product. Advisory only:
 * the config still saves, because a deliberate overlap is legitimate.
 */
export function ageBracketWarnings(brackets: AgeBracket[]): string[] {
  const warnings: string[] = [];

  const sorted = [...brackets].sort((a, b) => a.min - b.min);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur  = sorted[i];
    if (cur.min > prev.max + 1) {
      warnings.push(`Ages ${prev.max + 1}–${cur.min - 1} fall between "${prev.label}" and "${cur.label}", so kits for those ages appear in neither.`);
    }
  }

  const spanAll = brackets.filter((b) => b.max - b.min >= 11);
  if (spanAll.length > 1) {
    warnings.push(`"${spanAll.map((b) => b.label).join('", "')}" each cover 12 years or more, so most kits will match all of them and the filter will not narrow anything.`);
  }

  return warnings;
}

// Scrub every field that reaches a CSS or href sink. Assumes `c` has already
// been merged over DEFAULT_CONFIG so every branch exists.
export function sanitizeSiteConfig(c: SiteConfig): SiteConfig {
  const D = DEFAULT_CONFIG;
  return {
    ...c,
    tokens: {
      yellow: safeColor(c.tokens?.yellow, D.tokens.yellow),
      purple: safeColor(c.tokens?.purple, D.tokens.purple),
      dark: safeColor(c.tokens?.dark, D.tokens.dark),
    },
    typography: {
      headingFont: safeFont(c.typography?.headingFont, D.typography.headingFont),
      bodyFont: safeFont(c.typography?.bodyFont, D.typography.bodyFont),
    },
    banner: {
      ...c.banner,
      bgColor: safeColor(c.banner?.bgColor, D.banner.bgColor),
      textColor: safeColor(c.banner?.textColor, D.banner.textColor),
      link: safeUrl(c.banner?.link, ""),
    },
    nav: {
      links: (c.nav?.links ?? []).map((l) => ({
        ...l,
        href: safeUrl(l?.href, "/"),
      })),
    },
    hero: {
      ...c.hero,
      ctaPrimaryHref: safeUrl(c.hero?.ctaPrimaryHref, D.hero.ctaPrimaryHref),
      ctaSecondaryHref: safeUrl(c.hero?.ctaSecondaryHref, D.hero.ctaSecondaryHref),
    },
    seo: {
      ...c.seo,
      ogImage: safeUrl(c.seo?.ogImage, ""),
    },
    cardStyle: {
      ...c.cardStyle,
      bgColor: safeColor(c.cardStyle?.bgColor, D.cardStyle.bgColor),
      borderColor: safeColor(c.cardStyle?.borderColor, D.cardStyle.borderColor),
    },
    shop: {
      ...c.shop,
      ageBrackets: safeAgeBrackets(c.shop?.ageBrackets, D.shop.ageBrackets),
    },
  };
}
