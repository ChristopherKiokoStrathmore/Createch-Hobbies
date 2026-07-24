// Regenerates data/delivery-zones.ts from the SAME pricing model the WooCommerce
// plugin (wordpress-plugin/createch-delivery-fees) uses. The coordinates and the
// four pricing knobs below MUST stay identical to the plugin's constants — the
// plugin is the source of truth at checkout, this file is only the storefront
// fallback, and they must agree to the shilling.
//
//   fee = clamp( BASE_FARE + PER_KM × (haversine_km × ROAD_FACTOR) ), rounded.
//
// Run:  node scripts/gen-delivery-zones.mjs   (rewrites data/delivery-zones.ts)

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// ── Pricing knobs — keep in lock-step with createch-delivery-fees.php ──
const ORIGIN_LAT  = -1.2585;   // Westlands, Sarit Centre (reference/pickup)
const ORIGIN_LNG  = 36.8030;
const BASE_FARE   = 50;        // KES — flat handling/pickup component (boda)
const PER_KM      = 15;        // KES per road-km (boda)
const ROAD_FACTOR = 1.4;       // straight-line → approx driving distance
const MIN_FEE     = 80;        // KES — nothing cheaper than this
const ROUND_TO    = 10;        // round the fee to the nearest N KES

// ── Coordinates — mirror crtch_delivery_zones() in the plugin exactly ──
const NAIROBI = [
  ["CBD & Central", [
    ["CBD (Town)", -1.2841, 36.8233],
    ["Upper Hill", -1.2966, 36.8117],
    ["Community", -1.2999, 36.8146],
    ["Ngara", -1.2746, 36.8289],
    ["Pangani", -1.2679, 36.8347],
    ["Ziwani", -1.2723, 36.8380],
    ["Kariokor", -1.2745, 36.8330],
    ["Starehe", -1.2720, 36.8290],
  ]],
  ["Westlands & Parklands", [
    ["Westlands", -1.2649, 36.8109],
    ["Parklands", -1.2620, 36.8180],
    ["Highridge", -1.2588, 36.8170],
    ["Spring Valley", -1.2450, 36.7960],
    ["Loresho", -1.2430, 36.7770],
    ["Kitisuru", -1.2320, 36.7900],
    ["Mountain View", -1.2560, 36.7650],
    ["Kangemi", -1.2660, 36.7480],
    ["Riverside", -1.2720, 36.8020],
    ["Muthaiga", -1.2540, 36.8330],
  ]],
  ["Kilimani, Kileleshwa & Lavington", [
    ["Kilimani", -1.2900, 36.7870],
    ["Kileleshwa", -1.2800, 36.7830],
    ["Lavington", -1.2770, 36.7690],
    ["Hurlingham", -1.2930, 36.7930],
    ["Woodley", -1.3010, 36.7830],
    ["Adams Arcade", -1.3050, 36.7810],
    ["Ngong Road", -1.3000, 36.7700],
    ["Dennis Pritt", -1.2900, 36.7960],
  ]],
  ["South B, South C & Nairobi West", [
    ["South B", -1.3110, 36.8380],
    ["South C", -1.3230, 36.8330],
    ["Nairobi West", -1.3160, 36.8230],
    ["Madaraka", -1.3080, 36.8280],
    ["Mugoya", -1.3200, 36.8340],
    ["Nyayo Highrise", -1.3120, 36.8180],
    ["Wilson Airport", -1.3220, 36.8150],
    ["Mombasa Road", -1.3300, 36.8600],
  ]],
  ["Langata & Karen", [
    ["Langata", -1.3520, 36.7560],
    ["Karen", -1.3190, 36.7080],
    ["Hardy", -1.3540, 36.7250],
    ["Otiende", -1.3400, 36.7600],
    ["Ngei", -1.3420, 36.7650],
    ["Bomas", -1.3480, 36.7480],
    ["Southlands", -1.3450, 36.7700],
    ["Uhuru Gardens", -1.3350, 36.7830],
  ]],
  ["Eastlands", [
    ["Eastleigh", -1.2730, 36.8480],
    ["Pumwani", -1.2810, 36.8410],
    ["Shauri Moyo", -1.2870, 36.8420],
    ["Makadara", -1.2950, 36.8580],
    ["Buruburu", -1.2870, 36.8790],
    ["Jericho", -1.2900, 36.8560],
    ["Jerusalem", -1.2920, 36.8620],
    ["Maringo", -1.2930, 36.8580],
    ["Umoja", -1.2820, 36.8940],
    ["Donholm", -1.2960, 36.8930],
    ["Greenfields", -1.3000, 36.8950],
    ["Savannah", -1.3050, 36.9010],
    ["Tena", -1.2980, 36.8890],
    ["Kariobangi", -1.2580, 36.8760],
    ["Dandora", -1.2560, 36.8930],
    ["Komarock", -1.2760, 36.9130],
    ["Kayole", -1.2740, 36.9160],
  ]],
  ["Ruaraka, Mathare & Northern Estates", [
    ["Ruaraka", -1.2470, 36.8720],
    ["Baba Dogo", -1.2410, 36.8760],
    ["Lucky Summer", -1.2380, 36.8830],
    ["Mathare", -1.2600, 36.8580],
    ["Huruma", -1.2550, 36.8660],
    ["Mlango Kubwa", -1.2620, 36.8500],
    ["Thome", -1.2270, 36.8760],
    ["Garden Estate", -1.2320, 36.8660],
    ["Ridgeways", -1.2260, 36.8420],
    ["Marurui", -1.2280, 36.8500],
    ["Kasarani Mwiki Road", -1.2200, 36.8950],
  ]],
  ["Kasarani & Roysambu", [
    ["Kasarani", -1.2210, 36.8980],
    ["Roysambu", -1.2190, 36.8880],
    ["Zimmerman", -1.2130, 36.8930],
    ["Githurai", -1.2010, 36.9200],
    ["Mwiki", -1.2160, 36.9260],
    ["Kahawa West", -1.1920, 36.9210],
    ["Kahawa Sukari", -1.1830, 36.9330],
    ["Kahawa Wendani", -1.1870, 36.9270],
    ["Clay City", -1.2050, 36.9020],
    ["Sunton", -1.2100, 36.9100],
    ["Hunters", -1.2050, 36.9150],
    ["Lumumba Drive", -1.2250, 36.8850],
  ]],
  ["Embakasi & Airport", [
    ["Embakasi", -1.3220, 36.8940],
    ["Pipeline", -1.3120, 36.8990],
    ["Tassia", -1.3080, 36.9080],
    ["Fedha", -1.3170, 36.9060],
    ["Nyayo Estate", -1.3200, 36.8880],
    ["Imara Daima", -1.3300, 36.8850],
    ["Mihango", -1.2960, 36.9420],
    ["Utawala", -1.2830, 36.9620],
    ["Njiru", -1.2600, 36.9550],
    ["Ruai", -1.2760, 37.0000],
    ["Saika", -1.2830, 36.9280],
    ["Kware", -1.3230, 36.9050],
    ["Kwa Njenga", -1.3300, 36.9000],
  ]],
];

// Great-circle distance in km (haversine) — matches crtch_haversine_km().
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.min(1.0, Math.sqrt(a)));
}

// Uber/boda-style fare — matches crtch_fee_from_coords(). PHP round() and JS
// Math.round() agree for the positive values here (both round half up).
function feeFromCoords(lat, lng) {
  const km = haversineKm(ORIGIN_LAT, ORIGIN_LNG, lat, lng) * ROAD_FACTOR;
  const fee = Math.max(MIN_FEE, BASE_FARE + PER_KM * km);
  return Math.round(fee / ROUND_TO) * ROUND_TO;
}

const regionsOut = NAIROBI.map(([region, areas]) => {
  const lines = areas.map(([name, lat, lng]) => `      [${JSON.stringify(name)}, ${feeFromCoords(lat, lng)}],`).join("\n");
  return `  {\n    region: ${JSON.stringify(region)},\n    areas: [\n${lines}\n    ],\n  },`;
}).join("\n");

const file = `// Delivery zones for the checkout neighbourhood dropdown.
//
// SOURCE OF TRUTH: the WooCommerce plugin \`createch-delivery-fees\`
// (wordpress-plugin/createch-delivery-fees). It prices the order at checkout AND
// serves this list (with fees) at /wp-json/createch/v1/delivery-zones — the
// storefront fetches it through /api/delivery-zones.
//
// The list below is a FALLBACK used if that fetch fails. The fees here are
// generated from the SAME distance formula the plugin uses — boda rates:
// fee = max(${MIN_FEE}, ${BASE_FARE} + ${PER_KM} × (haversine_km_from_Sarit × ${ROAD_FACTOR})), rounded to ${ROUND_TO}.
// Regenerate with \`node scripts/gen-delivery-zones.mjs\` whenever you re-tune the
// plugin's pricing knobs. WooCommerce still re-prices the order server-side at
// checkout, so a stale fallback can never let a customer underpay.

export interface DeliveryZone {
  county:        string;
  region:        string; // grouping label — becomes an <optgroup>
  neighbourhood: string;
  fee:           number; // KES — distance-based, matches the plugin
}

const NAIROBI: { region: string; areas: [string, number][] }[] = [
${regionsOut}
];

export const DELIVERY_ZONES: DeliveryZone[] = NAIROBI.flatMap((r) =>
  r.areas.map(([neighbourhood, fee]) => ({
    county: "Nairobi",
    region: r.region,
    neighbourhood,
    fee,
  }))
);

/** Unique counties, in first-seen order. */
export function zoneCounties(zones: DeliveryZone[]): string[] {
  return [...new Set(zones.map((z) => z.county))];
}

/** Zones for one county, grouped into { region, items } for <optgroup> rendering. */
export function zonesByRegion(
  zones: DeliveryZone[],
  county: string
): { region: string; items: DeliveryZone[] }[] {
  const groups: { region: string; items: DeliveryZone[] }[] = [];
  for (const z of zones) {
    if (z.county !== county) continue;
    const g = groups.find((x) => x.region === z.region);
    if (g) g.items.push(z);
    else groups.push({ region: z.region, items: [z] });
  }
  return groups;
}

/** The delivery fee for a chosen neighbourhood, or 0 if none/unknown. */
export function zoneFee(zones: DeliveryZone[], county: string, neighbourhood: string): number {
  if (!neighbourhood) return 0;
  return zones.find((z) => z.county === county && z.neighbourhood === neighbourhood)?.fee ?? 0;
}
`;

const outPath = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "delivery-zones.ts");
writeFileSync(outPath, file);

// Print a quick before/after sanity table to stdout.
console.log("Wrote", outPath);
for (const [region, areas] of NAIROBI) {
  for (const [name, lat, lng] of areas) {
    console.log(String(feeFromCoords(lat, lng)).padStart(4), name);
  }
}
