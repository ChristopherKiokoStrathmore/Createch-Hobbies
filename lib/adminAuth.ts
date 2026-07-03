import { timingSafeEqual } from "crypto";

// Consolidated authorization for every /api/admin/* route.
//
// A single strong secret gates the admin surface. Set ADMIN_SECRET_KEY in the
// environment. ADMIN_PIN is accepted as a legacy fallback so existing logins
// keep working, but you should converge on ONE value: previously the orders
// route checked ADMIN_PIN while site-config/revalidate checked ADMIN_SECRET_KEY,
// which silently broke the editor whenever the two differed.
const SECRETS = [process.env.ADMIN_SECRET_KEY, process.env.ADMIN_PIN].filter(
  (s): s is string => Boolean(s && s.length > 0),
);

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // timingSafeEqual throws on length mismatch, so guard first. The length check
  // itself is not secret (secrets are fixed-length per deploy).
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// Small in-memory failure throttle. NOTE: on serverless this is per-instance and
// resets on cold start, so it is a speed bump, not a real rate limiter. Put a
// shared limiter (e.g. Upstash/Cloudflare) in front of /api/admin/* for a
// production-grade control. Only failed attempts are counted, so a legitimate
// admin polling the dashboard is never throttled.
const failures = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 5 * 60_000;
const MAX_FAILURES = 15;

function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  return fwd.split(",")[0].trim() || "local";
}

function isBlocked(key: string): boolean {
  const rec = failures.get(key);
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) {
    failures.delete(key);
    return false;
  }
  return rec.count >= MAX_FAILURES;
}

function recordFailure(key: string): void {
  const now = Date.now();
  const rec = failures.get(key);
  if (!rec || now - rec.first > WINDOW_MS) {
    failures.set(key, { count: 1, first: now });
  } else {
    rec.count += 1;
  }
}

export function isAdminAuthorized(req: Request): boolean {
  // Fail closed if no secret is configured.
  if (SECRETS.length === 0) return false;

  const key = clientKey(req);
  if (isBlocked(key)) return false;

  const provided = req.headers.get("x-admin-key") ?? "";
  const ok = provided.length > 0 && SECRETS.some((s) => safeEqual(provided, s));
  if (!ok) recordFailure(key);
  return ok;
}
