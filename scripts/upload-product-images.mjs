// Bulk-uploads local product images to WooCommerce.
// Images are served from the live site; WooCommerce fetches and imports them.
// Run with: node scripts/upload-product-images.mjs

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Credentials come from the environment — NEVER hardcode them here. This file is
// tracked in a public repo, so a literal key is published the moment it is
// committed. Load them from .env.local (which is gitignored):
//   WOO_URL=... WOO_KEY=... WOO_SECRET=... node scripts/upload-product-images.mjs
const WOO_URL    = process.env.WOO_URL    ?? "https://wp.createch-hobbies.co.ke";
const WOO_KEY    = process.env.WOO_KEY    ?? "";
const WOO_SECRET = process.env.WOO_SECRET ?? "";
const SITE_URL   = process.env.SITE_URL   ?? "https://createch-hobbies.co.ke";

if (!WOO_KEY || !WOO_SECRET) {
  console.error("Missing WOO_KEY / WOO_SECRET. Set them in the environment before running.");
  process.exit(1);
}

const IMAGES_DIR = path.join(__dirname, "..", "public", "images", "products");

// Maps WooCommerce product name → image filename prefix in public/images/products/
const PRODUCT_IMAGE_MAP = {
  "Cable Car":            "cable-car",
  "Elevator":             "elevator",
  "Ferris Wheel":         "ferris-wheel",
  "Glider":               "glider-plane",
  "House":                "house",
  "Digger":               "hydraulic-digger",
  "Lunar Rover":          "lunar-rover",
  "Marble Run":           "marble-run",
  "Optical Illusion Fan": "optical-illusion-fan",
  "Race Car":             "race-car",
  "Solar Fan":            "solar-fan",
  "Table Fan":            "table-fan",
  // These already have images uploaded in WooCommerce — uncomment to re-upload:
  // "Tank":              "tank",
  // "Train":             "train",
  // "Walking Robot":     "walking-robot",
  // "Windmill":          "windmill",
};

async function wooFetch(endpoint, options = {}) {
  const auth = Buffer.from(`${WOO_KEY}:${WOO_SECRET}`).toString("base64");
  const res  = await fetch(`${WOO_URL}/wp-json/wc/v3${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WooCommerce ${res.status}: ${body.slice(0, 300)}`);
  }
  return res.json();
}

function getImageUrls(prefix) {
  const files = fs.readdirSync(IMAGES_DIR);
  return files
    .filter((f) => f.startsWith(prefix + "-") && /\.(jpe?g|png|webp)$/i.test(f))
    .sort()
    .map((f) => ({ src: `${SITE_URL}/images/products/${f}`, alt: "" }));
}

async function main() {
  console.log("Fetching products from WooCommerce…\n");
  const all  = await wooFetch("/products?per_page=100&status=publish");
  const kits = all.filter((p) => parseFloat(p.price) > 200);

  let updated = 0;
  let skipped = 0;
  let failed  = 0;

  for (const product of kits) {
    const prefix = PRODUCT_IMAGE_MAP[product.name];

    if (!prefix) {
      console.log(`  — ${product.name}: no image mapping (skipping)`);
      skipped++;
      continue;
    }

    if (product.images?.length > 0) {
      console.log(`  — ${product.name}: already has ${product.images.length} image(s) (skipping)`);
      skipped++;
      continue;
    }

    const images = getImageUrls(prefix);
    if (images.length === 0) {
      console.log(`  — ${product.name}: no local files found for prefix "${prefix}" (skipping)`);
      skipped++;
      continue;
    }

    process.stdout.write(`  ↑ ${product.name}: uploading ${images.length} image(s)… `);
    try {
      await wooFetch(`/products/${product.id}`, {
        method: "PUT",
        body: JSON.stringify({ images }),
      });
      console.log("✓");
      updated++;
    } catch (err) {
      console.log(`✗  ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. Updated: ${updated}  Skipped: ${skipped}  Failed: ${failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
