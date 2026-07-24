// Delivery zones for the checkout neighbourhood dropdown.
//
// SOURCE OF TRUTH: the WooCommerce plugin `createch-delivery-fees`
// (wordpress-plugin/createch-delivery-fees). It prices the order at checkout AND
// serves this list (with fees) at /wp-json/createch/v1/delivery-zones — the
// storefront fetches it through /api/delivery-zones.
//
// The list below is a FALLBACK used if that fetch fails. The fees here are
// generated from the SAME distance formula the plugin uses — boda rates:
// fee = max(80, 50 + 15 × (haversine_km_from_Sarit × 1.4)), rounded to 10.
// Regenerate with `node scripts/gen-delivery-zones.mjs` whenever you re-tune the
// plugin's pricing knobs. WooCommerce still re-prices the order server-side at
// checkout, so a stale fallback can never let a customer underpay.

export interface DeliveryZone {
  county:        string;
  region:        string; // grouping label — becomes an <optgroup>
  neighbourhood: string;
  fee:           number; // KES — distance-based, matches the plugin
}

const NAIROBI: { region: string; areas: [string, number][] }[] = [
  {
    region: "CBD & Central",
    areas: [
      ["CBD (Town)", 130],
      ["Upper Hill", 140],
      ["Community", 150],
      ["Ngara", 120],
      ["Pangani", 130],
      ["Ziwani", 140],
      ["Kariokor", 130],
      ["Starehe", 120],
    ],
  },
  {
    region: "Westlands & Parklands",
    areas: [
      ["Westlands", 80],
      ["Parklands", 90],
      ["Highridge", 80],
      ["Spring Valley", 90],
      ["Loresho", 120],
      ["Kitisuru", 120],
      ["Mountain View", 140],
      ["Kangemi", 180],
      ["Riverside", 80],
      ["Muthaiga", 120],
    ],
  },
  {
    region: "Kilimani, Kileleshwa & Lavington",
    areas: [
      ["Kilimani", 130],
      ["Kileleshwa", 120],
      ["Lavington", 140],
      ["Hurlingham", 130],
      ["Woodley", 160],
      ["Adams Arcade", 170],
      ["Ngong Road", 170],
      ["Dennis Pritt", 130],
    ],
  },
  {
    region: "South B, South C & Nairobi West",
    areas: [
      ["South B", 200],
      ["South C", 220],
      ["Nairobi West", 190],
      ["Madaraka", 180],
      ["Mugoya", 210],
      ["Nyayo Highrise", 180],
      ["Wilson Airport", 200],
      ["Mombasa Road", 260],
    ],
  },
  {
    region: "Langata & Karen",
    areas: [
      ["Langata", 290],
      ["Karen", 310],
      ["Hardy", 340],
      ["Otiende", 270],
      ["Ngei", 260],
      ["Bomas", 300],
      ["Southlands", 270],
      ["Uhuru Gardens", 230],
    ],
  },
  {
    region: "Eastlands",
    areas: [
      ["Eastleigh", 160],
      ["Pumwani", 150],
      ["Shauri Moyo", 160],
      ["Makadara", 200],
      ["Buruburu", 240],
      ["Jericho", 190],
      ["Jerusalem", 210],
      ["Maringo", 200],
      ["Umoja", 270],
      ["Donholm", 280],
      ["Greenfields", 290],
      ["Savannah", 300],
      ["Tena", 270],
      ["Kariobangi", 220],
      ["Dandora", 260],
      ["Komarock", 310],
      ["Kayole", 320],
    ],
  },
  {
    region: "Ruaraka, Mathare & Northern Estates",
    areas: [
      ["Ruaraka", 210],
      ["Baba Dogo", 230],
      ["Lucky Summer", 240],
      ["Mathare", 180],
      ["Huruma", 200],
      ["Mlango Kubwa", 160],
      ["Thome", 240],
      ["Garden Estate", 210],
      ["Ridgeways", 170],
      ["Marurui", 180],
      ["Kasarani Mwiki Road", 280],
    ],
  },
  {
    region: "Kasarani & Roysambu",
    areas: [
      ["Kasarani", 290],
      ["Roysambu", 270],
      ["Zimmerman", 290],
      ["Githurai", 350],
      ["Mwiki", 350],
      ["Kahawa West", 370],
      ["Kahawa Sukari", 400],
      ["Kahawa Wendani", 380],
      ["Clay City", 310],
      ["Sunton", 320],
      ["Hunters", 340],
      ["Lumumba Drive", 260],
    ],
  },
  {
    region: "Embakasi & Airport",
    areas: [
      ["Embakasi", 310],
      ["Pipeline", 310],
      ["Tassia", 320],
      ["Fedha", 330],
      ["Nyayo Estate", 290],
      ["Imara Daima", 300],
      ["Mihango", 390],
      ["Utawala", 430],
      ["Njiru", 400],
      ["Ruai", 510],
      ["Saika", 350],
      ["Kware", 330],
      ["Kwa Njenga", 330],
    ],
  },
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
