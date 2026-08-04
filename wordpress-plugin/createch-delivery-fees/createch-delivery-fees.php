<?php
/**
 * Plugin Name:       Createch Delivery Fees
 * Description:        Uber/Bolt-style distance-based Nairobi delivery fees. The
 *                     fee is computed from the straight-line distance between the
 *                     Westlands Sarit Centre reference point and the customer's
 *                     chosen neighbourhood (× a road-winding factor), as
 *                     base_fare + per_km × distance. This is the SINGLE source of
 *                     truth: it prices the order server-side at checkout AND feeds
 *                     the storefront dropdown (with the computed fee) via REST, so
 *                     the price shown and the price charged can never drift. The
 *                     chosen neighbourhood arrives on the order's shipping address
 *                     line 2.
 * Version:           2.1.0
 * Author:            Createch Hobbies
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * WC requires at least: 7.0
 *
 * Security note: delivery pricing MUST live here, not in the browser. A headless
 * client could otherwise submit its own (zeroed) delivery fee. WooCommerce is
 * authoritative for the order total, so the fee is computed here from the chosen
 * neighbourhood — whatever the client sends is only ever a *label*, never a price.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/* ─────────────────────────────────────────────────────────────────────────
 * PRICING KNOBS — tune these; they are the whole fare model.
 * fee = clamp( base_fare + per_km × (straight_line_km × road_factor) ), rounded.
 * ───────────────────────────────────────────────────────────────────────── */
define( 'CRTCH_ORIGIN_LAT',  -1.2585 );  // Westlands, Sarit Centre (reference/pickup)
define( 'CRTCH_ORIGIN_LNG',  36.8030 );
define( 'CRTCH_BASE_FARE',   50 );        // KES — flat handling/pickup component (boda)
define( 'CRTCH_PER_KM',      15 );        // KES per road-km (boda)
define( 'CRTCH_ROAD_FACTOR', 1.4 );       // straight-line → approx driving distance
define( 'CRTCH_MIN_FEE',     150 );       // KES — nothing cheaper than this
define( 'CRTCH_ROUND_TO',    10 );        // round the fee to the nearest N KES

/**
 * Delivery zones with coordinates. THIS is the source of truth for where each
 * neighbourhood is; the fee is derived from distance, not stored per area.
 *
 * Shape: county => [ region label => [ neighbourhood => [ lat, lng ] ] ]
 *
 * Coordinates are approximate (good to ~1 km). A 1 km error moves the fee by
 * only ~CRTCH_PER_KM × road_factor ≈ 21 KES, and every value is tunable — nudge
 * a coordinate if a specific area's fee looks off.
 */
function crtch_delivery_zones() {
	return array(
		'Nairobi' => array(
			'CBD & Central' => array(
				'CBD (Town)'  => array( -1.2841, 36.8233 ),
				'Upper Hill'  => array( -1.2966, 36.8117 ),
				'Community'   => array( -1.2999, 36.8146 ),
				'Ngara'       => array( -1.2746, 36.8289 ),
				'Pangani'     => array( -1.2679, 36.8347 ),
				'Ziwani'      => array( -1.2723, 36.8380 ),
				'Kariokor'    => array( -1.2745, 36.8330 ),
				'Starehe'     => array( -1.2720, 36.8290 ),
			),
			'Westlands & Parklands' => array(
				'Westlands'      => array( -1.2649, 36.8109 ),
				'Parklands'      => array( -1.2620, 36.8180 ),
				'Highridge'      => array( -1.2588, 36.8170 ),
				'Spring Valley'  => array( -1.2450, 36.7960 ),
				'Loresho'        => array( -1.2430, 36.7770 ),
				'Kitisuru'       => array( -1.2320, 36.7900 ),
				'Mountain View'  => array( -1.2560, 36.7650 ),
				'Kangemi'        => array( -1.2660, 36.7480 ),
				'Riverside'      => array( -1.2720, 36.8020 ),
				'Muthaiga'       => array( -1.2540, 36.8330 ),
			),
			'Kilimani, Kileleshwa & Lavington' => array(
				'Kilimani'      => array( -1.2900, 36.7870 ),
				'Kileleshwa'    => array( -1.2800, 36.7830 ),
				'Lavington'     => array( -1.2770, 36.7690 ),
				'Hurlingham'    => array( -1.2930, 36.7930 ),
				'Woodley'       => array( -1.3010, 36.7830 ),
				'Adams Arcade'  => array( -1.3050, 36.7810 ),
				'Ngong Road'    => array( -1.3000, 36.7700 ),
				'Dennis Pritt'  => array( -1.2900, 36.7960 ),
			),
			'South B, South C & Nairobi West' => array(
				'South B'         => array( -1.3110, 36.8380 ),
				'South C'         => array( -1.3230, 36.8330 ),
				'Nairobi West'    => array( -1.3160, 36.8230 ),
				'Madaraka'        => array( -1.3080, 36.8280 ),
				'Mugoya'          => array( -1.3200, 36.8340 ),
				'Nyayo Highrise'  => array( -1.3120, 36.8180 ),
				'Wilson Airport'  => array( -1.3220, 36.8150 ),
				'Mombasa Road'    => array( -1.3300, 36.8600 ),
			),
			'Langata & Karen' => array(
				'Langata'        => array( -1.3520, 36.7560 ),
				'Karen'          => array( -1.3190, 36.7080 ),
				'Hardy'          => array( -1.3540, 36.7250 ),
				'Otiende'        => array( -1.3400, 36.7600 ),
				'Ngei'           => array( -1.3420, 36.7650 ),
				'Bomas'          => array( -1.3480, 36.7480 ),
				'Southlands'     => array( -1.3450, 36.7700 ),
				'Uhuru Gardens'  => array( -1.3350, 36.7830 ),
			),
			'Eastlands' => array(
				'Eastleigh'    => array( -1.2730, 36.8480 ),
				'Pumwani'      => array( -1.2810, 36.8410 ),
				'Shauri Moyo'  => array( -1.2870, 36.8420 ),
				'Makadara'     => array( -1.2950, 36.8580 ),
				'Buruburu'     => array( -1.2870, 36.8790 ),
				'Jericho'      => array( -1.2900, 36.8560 ),
				'Jerusalem'    => array( -1.2920, 36.8620 ),
				'Maringo'      => array( -1.2930, 36.8580 ),
				'Umoja'        => array( -1.2820, 36.8940 ),
				'Donholm'      => array( -1.2960, 36.8930 ),
				'Greenfields'  => array( -1.3000, 36.8950 ),
				'Savannah'     => array( -1.3050, 36.9010 ),
				'Tena'         => array( -1.2980, 36.8890 ),
				'Kariobangi'   => array( -1.2580, 36.8760 ),
				'Dandora'      => array( -1.2560, 36.8930 ),
				'Komarock'     => array( -1.2760, 36.9130 ),
				'Kayole'       => array( -1.2740, 36.9160 ),
			),
			'Ruaraka, Mathare & Northern Estates' => array(
				'Ruaraka'              => array( -1.2470, 36.8720 ),
				'Baba Dogo'            => array( -1.2410, 36.8760 ),
				'Lucky Summer'         => array( -1.2380, 36.8830 ),
				'Mathare'              => array( -1.2600, 36.8580 ),
				'Huruma'               => array( -1.2550, 36.8660 ),
				'Mlango Kubwa'         => array( -1.2620, 36.8500 ),
				'Thome'                => array( -1.2270, 36.8760 ),
				'Garden Estate'        => array( -1.2320, 36.8660 ),
				'Ridgeways'            => array( -1.2260, 36.8420 ),
				'Marurui'              => array( -1.2280, 36.8500 ),
				'Kasarani Mwiki Road'  => array( -1.2200, 36.8950 ),
			),
			'Kasarani & Roysambu' => array(
				'Kasarani'        => array( -1.2210, 36.8980 ),
				'Roysambu'        => array( -1.2190, 36.8880 ),
				'Zimmerman'       => array( -1.2130, 36.8930 ),
				'Githurai'        => array( -1.2010, 36.9200 ),
				'Mwiki'           => array( -1.2160, 36.9260 ),
				'Kahawa West'     => array( -1.1920, 36.9210 ),
				'Kahawa Sukari'   => array( -1.1830, 36.9330 ),
				'Kahawa Wendani'  => array( -1.1870, 36.9270 ),
				'Clay City'       => array( -1.2050, 36.9020 ),
				'Sunton'          => array( -1.2100, 36.9100 ),
				'Hunters'         => array( -1.2050, 36.9150 ),
				'Lumumba Drive'   => array( -1.2250, 36.8850 ),
			),
			'Embakasi & Airport' => array(
				'Embakasi'      => array( -1.3220, 36.8940 ),
				'Pipeline'      => array( -1.3120, 36.8990 ),
				'Tassia'        => array( -1.3080, 36.9080 ),
				'Fedha'         => array( -1.3170, 36.9060 ),
				'Nyayo Estate'  => array( -1.3200, 36.8880 ),
				'Imara Daima'   => array( -1.3300, 36.8850 ),
				'Mihango'       => array( -1.2960, 36.9420 ),
				'Utawala'       => array( -1.2830, 36.9620 ),
				'Njiru'         => array( -1.2600, 36.9550 ),
				'Ruai'          => array( -1.2760, 37.0000 ),
				'Saika'         => array( -1.2830, 36.9280 ),
				'Kware'         => array( -1.3230, 36.9050 ),
				'Kwa Njenga'    => array( -1.3300, 36.9000 ),
			),
		),
	);
}

/** Great-circle distance in km between two lat/lng points (haversine). */
function crtch_haversine_km( $lat1, $lng1, $lat2, $lng2 ) {
	$radius = 6371.0;
	$d_lat  = deg2rad( $lat2 - $lat1 );
	$d_lng  = deg2rad( $lng2 - $lng1 );
	$a      = sin( $d_lat / 2 ) ** 2
		+ cos( deg2rad( $lat1 ) ) * cos( deg2rad( $lat2 ) ) * sin( $d_lng / 2 ) ** 2;
	return $radius * 2 * asin( min( 1.0, sqrt( $a ) ) );
}

/** Uber-style fare for a point: base + per_km × (straight-line × road factor). */
function crtch_fee_from_coords( $lat, $lng ) {
	$km  = crtch_haversine_km( CRTCH_ORIGIN_LAT, CRTCH_ORIGIN_LNG, $lat, $lng ) * CRTCH_ROAD_FACTOR;
	$fee = CRTCH_BASE_FARE + CRTCH_PER_KM * $km;
	$fee = max( CRTCH_MIN_FEE, $fee );
	return (int) ( round( $fee / CRTCH_ROUND_TO ) * CRTCH_ROUND_TO );
}

/** Flat neighbourhood => [lat, lng] lookup, built once per request. */
function crtch_coords_for_neighbourhood( $name ) {
	static $map = null;

	if ( null === $map ) {
		$map = array();
		foreach ( crtch_delivery_zones() as $regions ) {
			foreach ( $regions as $areas ) {
				foreach ( $areas as $area => $coords ) {
					$map[ $area ] = $coords;
				}
			}
		}
	}

	$name = trim( (string) $name );

	return isset( $map[ $name ] ) ? $map[ $name ] : null;
}

/** Distance-based fee for a neighbourhood name, or null if unknown. */
function crtch_fee_for_neighbourhood( $name ) {
	$coords = crtch_coords_for_neighbourhood( $name );
	if ( null === $coords ) {
		return null;
	}
	return crtch_fee_from_coords( $coords[0], $coords[1] );
}

/**
 * Price the delivery from the chosen neighbourhood. Runs on every cart/checkout
 * recalculation the Store API triggers, so the storefront summary and the final
 * order both reflect the same fee. The neighbourhood rides in on address line 2.
 */
add_action(
	'woocommerce_cart_calculate_fees',
	function ( $cart ) {
		if ( is_admin() && ! defined( 'DOING_AJAX' ) ) {
			return;
		}
		if ( ! function_exists( 'WC' ) || ! WC()->customer ) {
			return;
		}

		$zone = WC()->customer->get_shipping_address_2();
		if ( ! $zone ) {
			$zone = WC()->customer->get_billing_address_2();
		}

		$fee = crtch_fee_for_neighbourhood( $zone );

		// Unknown/empty neighbourhood → charge nothing here; the storefront blocks
		// submission until a valid area is picked, and staff confirm on the phone.
		if ( null !== $fee && $fee > 0 ) {
			$cart->add_fee( __( 'Delivery', 'createch' ), $fee, false );
		}
	}
);

/**
 * Expose the zone list — WITH the computed distance fee — to the headless
 * storefront. The fee shown in the dropdown/summary therefore comes from the
 * exact same maths that bills the order. Read-only, public reference data; the
 * Next.js app proxies this server-side, so no CORS handling is needed here.
 */
add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'createch/v1',
			'/delivery-zones',
			array(
				'methods'             => 'GET',
				'permission_callback' => '__return_true',
				'callback'            => function () {
					$out = array();
					foreach ( crtch_delivery_zones() as $county => $regions ) {
						foreach ( $regions as $region => $areas ) {
							foreach ( $areas as $area => $coords ) {
								$km = crtch_haversine_km(
									CRTCH_ORIGIN_LAT,
									CRTCH_ORIGIN_LNG,
									$coords[0],
									$coords[1]
								) * CRTCH_ROAD_FACTOR;
								$out[] = array(
									'county'        => $county,
									'region'        => $region,
									'neighbourhood' => $area,
									'fee'           => crtch_fee_from_coords( $coords[0], $coords[1] ),
									'distance_km'   => round( $km, 1 ),
								);
							}
						}
					}
					return rest_ensure_response( $out );
				},
			)
		);
	}
);
