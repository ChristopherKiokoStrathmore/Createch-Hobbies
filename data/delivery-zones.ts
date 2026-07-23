// Delivery zones for the checkout neighbourhood dropdown.
//
// SOURCE OF TRUTH: the WooCommerce plugin `createch-delivery-fees`
// (wordpress-plugin/createch-delivery-fees). It both prices the order at
// checkout and serves this list at /wp-json/createch/v1/delivery-zones — the
// storefront fetches it through /api/delivery-zones.
//
// The list below is only a FALLBACK: it keeps checkout usable if that fetch
// fails. Fees here are display-only (WooCommerce is authoritative for money),
// so a mismatch never lets a customer underpay — the plugin re-prices the order
// server-side regardless of what the fallback shows. Keep the two roughly in
// sync when you add areas, but the plugin's numbers are the ones that bill.

export interface DeliveryZone {
  county:        string;
  region:        string; // grouping label — becomes an <optgroup>
  neighbourhood: string;
  fee:           number; // KES (display-only fallback)
}

const NAIROBI: { region: string; fee: number; areas: string[] }[] = [
  {
    region: "CBD & Central",
    fee: 200,
    areas: [
      "CBD (Town)", "Upper Hill", "Community", "Ngara", "Pangani",
      "Ziwani", "Kariokor", "Starehe",
    ],
  },
  {
    region: "Westlands & Parklands",
    fee: 250,
    areas: [
      "Westlands", "Parklands", "Highridge", "Spring Valley", "Loresho",
      "Kitisuru", "Mountain View", "Kangemi", "Riverside", "Muthaiga",
    ],
  },
  {
    region: "Kilimani, Kileleshwa & Lavington",
    fee: 250,
    areas: [
      "Kilimani", "Kileleshwa", "Lavington", "Hurlingham", "Woodley",
      "Adams Arcade", "Ngong Road", "Dennis Pritt",
    ],
  },
  {
    region: "South B, South C & Nairobi West",
    fee: 250,
    areas: [
      "South B", "South C", "Nairobi West", "Madaraka", "Mugoya",
      "Nyayo Highrise", "Wilson Airport", "Mombasa Road",
    ],
  },
  {
    region: "Eastlands",
    fee: 300,
    areas: [
      "Eastleigh", "Pumwani", "Shauri Moyo", "Makadara", "Buruburu",
      "Jericho", "Jerusalem", "Maringo", "Umoja", "Donholm", "Greenfields",
      "Savannah", "Tena", "Kariobangi", "Dandora", "Komarock", "Kayole",
    ],
  },
  {
    region: "Ruaraka, Mathare & Northern Estates",
    fee: 300,
    areas: [
      "Ruaraka", "Baba Dogo", "Lucky Summer", "Mathare", "Huruma",
      "Mlango Kubwa", "Thome", "Garden Estate", "Ridgeways", "Marurui",
      "Kasarani Mwiki Road",
    ],
  },
  {
    region: "Kasarani & Roysambu",
    fee: 350,
    areas: [
      "Kasarani", "Roysambu", "Zimmerman", "Githurai", "Mwiki",
      "Kahawa West", "Kahawa Sukari", "Kahawa Wendani", "Clay City",
      "Sunton", "Hunters", "Lumumba Drive",
    ],
  },
  {
    region: "Langata & Karen",
    fee: 350,
    areas: [
      "Langata", "Karen", "Hardy", "Otiende", "Ngei", "Bomas",
      "Southlands", "Uhuru Gardens",
    ],
  },
  {
    region: "Embakasi & Airport",
    fee: 400,
    areas: [
      "Embakasi", "Pipeline", "Tassia", "Fedha", "Nyayo Estate",
      "Imara Daima", "Mihango", "Utawala", "Njiru", "Ruai", "Saika",
      "Kware", "Kwa Njenga",
    ],
  },
];

export const DELIVERY_ZONES: DeliveryZone[] = NAIROBI.flatMap((r) =>
  r.areas.map((neighbourhood) => ({
    county: "Nairobi",
    region: r.region,
    neighbourhood,
    fee:    r.fee,
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
