# Createch Site Config

Durable storage for the Next.js storefront's site configuration — every piece of
copy, colour and section setting you change in `/admin/editor`.

## Why this exists

The storefront used to write its configuration to `/tmp/site-config.json` and to a
file inside the deployed bundle. On a serverless host neither survives:

- `/tmp` belongs to **one server instance**. Save a headline and the instance that
  handled the write knows about it; the next visitor, routed elsewhere, sees the old
  copy.
- Both are wiped on **every deploy**.

The symptom was silent and confusing: an edit appeared to save, showed correctly for
the person who made it, and was invisible to customers or gone the next day. Live
config was still byte-identical to the built-in defaults.

WordPress is already this store's system of record and is already backed up, so the
configuration now lives here with everything else. No new service, no new bill.

## Install

1. Zip the `createch-site-config` folder (or upload it to `wp-content/plugins/`).
2. **Plugins → Add New → Upload**, then **Activate**.
3. Go to **Settings → Site Config** and copy the **shared key**.
4. Put it in the storefront environment as `SITE_CONFIG_SECRET`, then redeploy.

Nothing else to configure. The key is generated on first use, so the route is never
open with a blank secret.

## Endpoint

`/wp-json/createch/v1/site-config`

| Method     | Purpose                          |
| ---------- | -------------------------------- |
| GET        | Read the stored configuration    |
| PUT / POST | Replace the stored configuration |

Both require an `X-Createch-Key` header matching the shared key, compared in constant
time. There is no cookie or capability path: only the storefront server talks to this.

`POST` is accepted alongside `PUT` because some hosts and WAFs quietly drop `PUT` on
`/wp-json`.

### Shapes

```
GET  → { "config": { ... }, "updatedAt": "2026-07-30T13:04:11+00:00" }
PUT  ← { "config": { ... } }
PUT  → { "ok": true, "bytes": 4821, "updatedAt": "..." }
```

A never-saved install returns `{ "config": {}, "updatedAt": null }` rather than a 404,
so a fresh deploy falls back to the storefront's own defaults instead of rendering
nothing.

## Deliberate behaviours

- **The browser never calls this.** The storefront's route handlers call it
  server-to-server and hold the key in a server-only environment variable, so the key
  is never shipped to a client. That is also why this plugin sends no CORS headers.
- **The option is stored with `autoload = false`.** It is only ever read by this REST
  route, so there is no reason to load a multi-kilobyte blob into memory on every
  WordPress page request.
- **A non-object body is rejected with 400.** Storing anything else would break every
  read that followed, and the failure would surface as a broken storefront rather than
  a bad request.
- **Rotating the key is a separate explicit action**, not a side effect of saving.
  Rotation breaks saving from `/admin/editor` until the storefront environment is
  updated and redeployed, so it should only be done if the key has leaked.

## Sanitisation lives on the storefront, not here

This plugin stores what it is given. The storefront sanitises **before** writing —
colours, font names and every `href` are validated in `lib/siteConfigValidation.ts`, and
the incoming body is deep-merged over the defaults with a prototype-pollution guard.

That split is intentional: the storefront knows the config's shape and which fields
reach a CSS or `href` sink. Duplicating those rules here would mean two implementations
drifting apart. The trade-off is that **anyone holding the key can store arbitrary
JSON**, so treat the key as a credential.
