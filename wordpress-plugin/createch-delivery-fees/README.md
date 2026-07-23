# Createch Delivery Fees

Uber/Bolt-style **distance-based** Nairobi delivery fees for the headless Createch
Hobbies store.

**This plugin is the single source of truth for the delivery charge.** From one
coordinate table (`crtch_delivery_zones()`) it:

1. **Prices the order server-side** at checkout via `woocommerce_cart_calculate_fees`,
   reading the customer's chosen neighbourhood from **shipping address line 2**.
2. **Serves the dropdown list — with the computed fee** — at
   `GET /wp-json/createch/v1/delivery-zones`.

Because the price shown and the price charged come from the same maths, they can
never drift. The browser only ever sends a *label* (the neighbourhood name) —
never a price — so a headless client can't zero out delivery.

## The fare model

Like a ride-hailing app, the fee is distance-based from a fixed reference point:

```
distance_km = haversine(Sarit Centre → neighbourhood) × ROAD_FACTOR
fee         = clamp_min( BASE_FARE + PER_KM × distance_km )   // rounded to ROUND_TO
```

Reference point (pickup): **Westlands, Sarit Centre**. All knobs are `define()`s
at the top of `createch-delivery-fees.php`:

| Knob | Default | Meaning |
|------|---------|---------|
| `CRTCH_ORIGIN_LAT/LNG` | -1.2585, 36.8030 | Sarit Centre pickup point |
| `CRTCH_BASE_FARE` | 100 | Flat handling/pickup component (KES) |
| `CRTCH_PER_KM` | 28 | KES per road-km |
| `CRTCH_ROAD_FACTOR` | 1.4 | Straight-line → approx driving distance |
| `CRTCH_MIN_FEE` | 150 | Floor price (KES) |
| `CRTCH_ROUND_TO` | 10 | Round fee to nearest N KES |

Rough resulting fees: Westlands ~150, CBD/Kilimani ~240–250, South B ~300,
Eastlands ~350–450, Karen/Embakasi ~580–600, Ruai ~950. **Tune the knobs** to hit
your real economics — raise `PER_KM` to punish distance harder, raise `BASE_FARE`
to lift the whole curve.

Neighbourhood coordinates are approximate (~1 km). A 1 km error only moves a fee by
~`PER_KM × ROAD_FACTOR` ≈ 40 KES, and every coordinate is editable — nudge one if a
specific area looks mispriced.

> **Want real driving distance/time (exact Uber emulation)?** Swap
> `crtch_haversine_km()` for a one-time Google Distance Matrix / Mapbox lookup per
> zone, cached in an option. Haversine × road-factor is within ~10–15% for Nairobi
> and needs no API key — recommended unless you specifically need turn-by-turn
> accuracy.

## Install

1. Zip the `createch-delivery-fees` folder (or upload it to `wp-content/plugins/`).
2. **Plugins → Add New → Upload**, then **Activate**.
3. Verify the REST route (each row shows `fee` and `distance_km`):
   `https://wp.createch-hobbies.co.ke/wp-json/createch/v1/delivery-zones`

## Important: don't double-charge

Delivery is charged **here as a cart fee**. Do **not** also configure a paid
WooCommerce **shipping** rate for Nairobi, or the two will stack. Keep the Nairobi
shipping zone at **Free shipping** (or no rate). The storefront shows the distance
fee on the order summary the moment a neighbourhood is picked.
