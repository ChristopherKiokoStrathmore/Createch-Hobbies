// Regenerates the favicon set from public/images/logo.png.
//
// The full logo is a ~1.9:1 wordmark that turns to mush at 16px, so only the
// gear + sunrise + bulb badge is used. It sits on a white rounded square: the
// gear ring is brand navy, and on a dark browser tab bar a transparent
// background would make it disappear.
//
// Outputs the three files Next's app-directory icon conventions pick up
// automatically — do NOT add an `icons` key to generateMetadata(), it would
// override them.
//
//   app/favicon.ico     16 + 32, served at /favicon.ico for crawlers
//   app/icon.png        512, becomes <link rel="icon">
//   app/apple-icon.png  180, becomes <link rel="apple-touch-icon">
//
// Run:  node scripts/gen-favicons.mjs   (rewrites the three files above)

import { writeFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC  = join(ROOT, "public/images/logo.png");
const APP  = join(ROOT, "app");

// Badge bounds inside the 2083×2083 source. The bottom edge stops just above
// the "CREATECH" wordmark, which overlaps the lower half of the gear.
const BADGE = { left: 432, top: 350, width: 1185, height: 610 };

// The badge is ~1.94:1, so a square icon always carries vertical slack. Running
// the width close to the edge is what keeps it legible once scaled to 16px.
const INSET      = 0.94;
const RADIUS_PCT = 0.18;

function whiteRoundedSquare(size, radiusPct) {
  const r = Math.round(size * radiusPct);
  return Buffer.from(
    `<svg width="${size}" height="${size}">` +
      `<rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="#ffffff"/>` +
    `</svg>`
  );
}

async function badgeOn(size, radiusPct) {
  const inner  = Math.round(size * INSET);
  const scaled = await sharp(SRC).extract(BADGE).resize({ width: inner }).toBuffer();
  const { height } = await sharp(scaled).metadata();

  return sharp(whiteRoundedSquare(size, radiusPct))
    .composite([{
      input: scaled,
      left:  Math.round((size - inner) / 2),
      // Nudged below centre: a dome centred exactly reads top-heavy, because
      // all of its visual weight sits in the upper half.
      top:   Math.round((size - height) / 2 + size * 0.04),
    }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

// An .ico is a small directory header followed by embedded PNGs.
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);             // reserved
  header.writeUInt16LE(1, 2);             // type: icon
  header.writeUInt16LE(images.length, 4);

  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0); // width — 0 means 256
    e.writeUInt8(size >= 256 ? 0 : size, 1); // height
    e.writeUInt8(0, 2);                      // palette colours (0 = truecolour)
    e.writeUInt8(0, 3);                      // reserved
    e.writeUInt16LE(1, 4);                   // colour planes
    e.writeUInt16LE(32, 6);                  // bits per pixel
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

const icon   = await badgeOn(512, RADIUS_PCT);
// iOS applies its own rounded mask, so the apple icon ships with square corners.
const apple  = await badgeOn(180, 0);
const ico32  = await badgeOn(32, RADIUS_PCT);
const ico16  = await badgeOn(16, RADIUS_PCT);

writeFileSync(join(APP, "icon.png"), icon);
writeFileSync(join(APP, "apple-icon.png"), apple);
writeFileSync(join(APP, "favicon.ico"), buildIco([
  { size: 16, data: ico16 },
  { size: 32, data: ico32 },
]));

for (const f of ["favicon.ico", "icon.png", "apple-icon.png"]) {
  console.log(f.padEnd(16), (statSync(join(APP, f)).size / 1024).toFixed(1) + "KB");
}
