<?php
/**
 * Plugin Name: Createch Customer Auth
 * Plugin URI:  https://createch-hobbies.co.ke
 * Description: Token-authenticated customer accounts for the headless Next.js storefront — register, log in, read and edit the saved address book, and list order history. Exposes /wp-json/createch/v1/auth/* and /wp-json/createch/v1/account/*.
 * Version:     1.0.0
 * Author:      Createch Hobbies
 * License:     GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

/**
 * These endpoints are called server-to-server by the Next.js route handlers in
 * app/api/account/*, never by the browser — the JWT lives in an httpOnly cookie
 * that page JavaScript cannot read. That is deliberate: it keeps the token out
 * of reach of any XSS on the storefront, and it means this plugin needs no CORS
 * headers of its own (unlike createch-store-api-cors, which the browser does
 * talk to directly).
 */

const CRTCH_AUTH_NS         = 'createch/v1';
const CRTCH_AUTH_SECRET_OPT = 'crtch_auth_secret';
const CRTCH_AUTH_TTL        = 30 * DAY_IN_SECONDS;

// Login throttle: per email+IP, counted in a transient.
const CRTCH_AUTH_MAX_TRIES  = 8;
const CRTCH_AUTH_LOCKOUT    = 15 * MINUTE_IN_SECONDS;

/* ─────────────────────────── Signing key ─────────────────────────── */

/**
 * A dedicated secret, generated on first use, so tokens can be invalidated
 * wholesale by deleting the option — without rotating the WordPress salts and
 * logging every wp-admin user out at the same time.
 */
function crtch_auth_secret() {
	$secret = get_option( CRTCH_AUTH_SECRET_OPT );
	if ( ! $secret ) {
		$secret = wp_generate_password( 64, true, true );
		add_option( CRTCH_AUTH_SECRET_OPT, $secret, '', 'no' );
	}
	return $secret;
}

/* ─────────────────────────── JWT (HS256) ─────────────────────────── */

function crtch_b64url_encode( $data ) {
	return rtrim( strtr( base64_encode( $data ), '+/', '-_' ), '=' );
}

function crtch_b64url_decode( $data ) {
	return base64_decode( strtr( $data, '-_', '+/' ) );
}

/**
 * The password hash fingerprint is part of the payload so that a password
 * change (or a reset) silently invalidates every token issued before it.
 */
function crtch_user_fingerprint( $user ) {
	return substr( hash( 'sha256', $user->user_pass ), 0, 16 );
}

function crtch_issue_token( $user ) {
	$header  = array( 'typ' => 'JWT', 'alg' => 'HS256' );
	$now     = time();
	$payload = array(
		'iss' => home_url(),
		'iat' => $now,
		'exp' => $now + CRTCH_AUTH_TTL,
		'uid' => (int) $user->ID,
		'fpr' => crtch_user_fingerprint( $user ),
	);

	$segments = array(
		crtch_b64url_encode( wp_json_encode( $header ) ),
		crtch_b64url_encode( wp_json_encode( $payload ) ),
	);
	$signing_input = implode( '.', $segments );
	$signature     = hash_hmac( 'sha256', $signing_input, crtch_auth_secret(), true );
	$segments[]    = crtch_b64url_encode( $signature );

	return implode( '.', $segments );
}

/**
 * @return WP_User|WP_Error
 */
function crtch_verify_token( $token ) {
	$parts = explode( '.', (string) $token );
	if ( count( $parts ) !== 3 ) {
		return new WP_Error( 'crtch_bad_token', 'Malformed token.', array( 'status' => 401 ) );
	}

	list( $h64, $p64, $s64 ) = $parts;

	$expected = hash_hmac( 'sha256', "$h64.$p64", crtch_auth_secret(), true );
	if ( ! hash_equals( $expected, crtch_b64url_decode( $s64 ) ) ) {
		return new WP_Error( 'crtch_bad_signature', 'Invalid token.', array( 'status' => 401 ) );
	}

	$payload = json_decode( crtch_b64url_decode( $p64 ), true );
	if ( ! is_array( $payload ) || empty( $payload['uid'] ) ) {
		return new WP_Error( 'crtch_bad_token', 'Invalid token.', array( 'status' => 401 ) );
	}

	if ( empty( $payload['exp'] ) || time() >= (int) $payload['exp'] ) {
		return new WP_Error( 'crtch_token_expired', 'Your session has expired. Please sign in again.', array( 'status' => 401 ) );
	}

	$user = get_user_by( 'id', (int) $payload['uid'] );
	if ( ! $user ) {
		return new WP_Error( 'crtch_no_user', 'Account not found.', array( 'status' => 401 ) );
	}

	// Password changed since the token was issued → treat it as signed out.
	if ( empty( $payload['fpr'] ) || ! hash_equals( crtch_user_fingerprint( $user ), $payload['fpr'] ) ) {
		return new WP_Error( 'crtch_stale_token', 'Your session has expired. Please sign in again.', array( 'status' => 401 ) );
	}

	return $user;
}

/**
 * permission_callback for the authenticated routes. Stashes the resolved user
 * so the handler does not have to verify the token a second time.
 */
function crtch_require_customer( WP_REST_Request $request ) {
	$auth = $request->get_header( 'authorization' );
	if ( ! $auth || stripos( $auth, 'bearer ' ) !== 0 ) {
		return new WP_Error( 'crtch_no_auth', 'Not signed in.', array( 'status' => 401 ) );
	}

	$user = crtch_verify_token( trim( substr( $auth, 7 ) ) );
	if ( is_wp_error( $user ) ) {
		return $user;
	}

	wp_set_current_user( $user->ID );
	return true;
}

/* ─────────────────────────── Shaping ─────────────────────────── */

const CRTCH_ADDRESS_FIELDS = array(
	'first_name', 'last_name', 'company', 'address_1', 'address_2',
	'city', 'state', 'postcode', 'country',
);

function crtch_read_address( $customer, $type ) {
	$out = array();
	foreach ( CRTCH_ADDRESS_FIELDS as $field ) {
		$getter     = "get_{$type}_{$field}";
		$out[ $field ] = method_exists( $customer, $getter ) ? (string) $customer->$getter() : '';
	}
	if ( 'billing' === $type ) {
		$out['email'] = (string) $customer->get_billing_email();
		$out['phone'] = (string) $customer->get_billing_phone();
	}
	return $out;
}

function crtch_customer_payload( $user ) {
	$customer = new WC_Customer( $user->ID );

	return array(
		'id'         => (int) $user->ID,
		'email'      => (string) $user->user_email,
		'first_name' => (string) $customer->get_first_name(),
		'last_name'  => (string) $customer->get_last_name(),
		'billing'    => crtch_read_address( $customer, 'billing' ),
		'shipping'   => crtch_read_address( $customer, 'shipping' ),
	);
}

function crtch_order_payload( $order ) {
	$items = array();
	foreach ( $order->get_items() as $item ) {
		$product = $item->get_product();
		$image   = '';
		if ( $product ) {
			$id    = $product->get_image_id();
			$image = $id ? (string) wp_get_attachment_image_url( $id, 'woocommerce_thumbnail' ) : '';
		}
		$items[] = array(
			'name'     => (string) $item->get_name(),
			'quantity' => (int) $item->get_quantity(),
			'total'    => (float) $order->get_line_total( $item, true ),
			'image'    => $image,
			'slug'     => $product ? (string) $product->get_slug() : '',
		);
	}

	return array(
		'id'       => (int) $order->get_id(),
		'number'   => (string) $order->get_order_number(),
		'status'   => (string) $order->get_status(),
		'date'     => $order->get_date_created() ? $order->get_date_created()->date( DATE_ATOM ) : '',
		'total'    => (float) $order->get_total(),
		'subtotal' => (float) $order->get_subtotal(),
		'shipping' => (float) $order->get_shipping_total(),
		'discount' => (float) $order->get_discount_total(),
		'currency' => (string) $order->get_currency(),
		'payment'  => (string) $order->get_payment_method_title(),
		'note'     => (string) $order->get_customer_note(),
		'items'    => $items,
	);
}

/* ─────────────────────────── Throttle ─────────────────────────── */

function crtch_throttle_key( $email ) {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	return 'crtch_try_' . md5( strtolower( $email ) . '|' . $ip );
}

function crtch_is_throttled( $email ) {
	return (int) get_transient( crtch_throttle_key( $email ) ) >= CRTCH_AUTH_MAX_TRIES;
}

function crtch_record_failure( $email ) {
	$key = crtch_throttle_key( $email );
	set_transient( $key, (int) get_transient( $key ) + 1, CRTCH_AUTH_LOCKOUT );
}

/* ─────────────────────────── Routes ─────────────────────────── */

add_action( 'rest_api_init', function () {

	register_rest_route( CRTCH_AUTH_NS, '/auth/register', array(
		'methods'             => 'POST',
		'callback'            => 'crtch_route_register',
		'permission_callback' => '__return_true',
	) );

	register_rest_route( CRTCH_AUTH_NS, '/auth/login', array(
		'methods'             => 'POST',
		'callback'            => 'crtch_route_login',
		'permission_callback' => '__return_true',
	) );

	register_rest_route( CRTCH_AUTH_NS, '/auth/forgot', array(
		'methods'             => 'POST',
		'callback'            => 'crtch_route_forgot',
		'permission_callback' => '__return_true',
	) );

	register_rest_route( CRTCH_AUTH_NS, '/account', array(
		array(
			'methods'             => 'GET',
			'callback'            => 'crtch_route_get_account',
			'permission_callback' => 'crtch_require_customer',
		),
		array(
			'methods'             => 'PUT',
			'callback'            => 'crtch_route_update_account',
			'permission_callback' => 'crtch_require_customer',
		),
	) );

	register_rest_route( CRTCH_AUTH_NS, '/account/orders', array(
		'methods'             => 'GET',
		'callback'            => 'crtch_route_orders',
		'permission_callback' => 'crtch_require_customer',
	) );

	register_rest_route( CRTCH_AUTH_NS, '/account/claim-order', array(
		'methods'             => 'POST',
		'callback'            => 'crtch_route_claim_order',
		'permission_callback' => 'crtch_require_customer',
	) );
} );

function crtch_route_register( WP_REST_Request $request ) {
	if ( ! function_exists( 'wc_create_new_customer' ) ) {
		return new WP_Error( 'crtch_no_woo', 'WooCommerce is not active.', array( 'status' => 500 ) );
	}

	$email    = sanitize_email( (string) $request->get_param( 'email' ) );
	$password = (string) $request->get_param( 'password' );
	$first    = sanitize_text_field( (string) $request->get_param( 'first_name' ) );
	$last     = sanitize_text_field( (string) $request->get_param( 'last_name' ) );
	$phone    = sanitize_text_field( (string) $request->get_param( 'phone' ) );

	if ( ! is_email( $email ) ) {
		return new WP_Error( 'crtch_bad_email', 'Please enter a valid email address.', array( 'status' => 400 ) );
	}
	if ( strlen( $password ) < 8 ) {
		return new WP_Error( 'crtch_weak_password', 'Your password must be at least 8 characters.', array( 'status' => 400 ) );
	}
	if ( email_exists( $email ) ) {
		return new WP_Error( 'crtch_email_taken', 'An account with that email already exists. Try signing in instead.', array( 'status' => 409 ) );
	}

	$user_id = wc_create_new_customer( $email, '', $password, array(
		'first_name' => $first,
		'last_name'  => $last,
	) );
	if ( is_wp_error( $user_id ) ) {
		return new WP_Error( 'crtch_register_failed', $user_id->get_error_message(), array( 'status' => 400 ) );
	}

	// Seed the billing block so the first checkout is already pre-filled.
	$customer = new WC_Customer( $user_id );
	$customer->set_billing_email( $email );
	if ( $first ) { $customer->set_billing_first_name( $first ); }
	if ( $last )  { $customer->set_billing_last_name( $last ); }
	if ( $phone ) { $customer->set_billing_phone( $phone ); }
	$customer->save();

	$user = get_user_by( 'id', $user_id );
	return rest_ensure_response( array(
		'token'    => crtch_issue_token( $user ),
		'customer' => crtch_customer_payload( $user ),
	) );
}

function crtch_route_login( WP_REST_Request $request ) {
	$email    = sanitize_email( (string) $request->get_param( 'email' ) );
	$password = (string) $request->get_param( 'password' );

	if ( ! $email || ! $password ) {
		return new WP_Error( 'crtch_missing', 'Enter your email and password.', array( 'status' => 400 ) );
	}

	if ( crtch_is_throttled( $email ) ) {
		return new WP_Error(
			'crtch_throttled',
			'Too many failed attempts. Please wait 15 minutes and try again.',
			array( 'status' => 429 )
		);
	}

	$user = wp_authenticate( $email, $password );
	if ( is_wp_error( $user ) ) {
		crtch_record_failure( $email );
		// Deliberately vague: distinguishing "no such account" from "wrong
		// password" would let anyone test which emails are registered here.
		return new WP_Error( 'crtch_bad_login', 'That email and password do not match.', array( 'status' => 401 ) );
	}

	delete_transient( crtch_throttle_key( $email ) );

	return rest_ensure_response( array(
		'token'    => crtch_issue_token( $user ),
		'customer' => crtch_customer_payload( $user ),
	) );
}

function crtch_route_forgot( WP_REST_Request $request ) {
	$email = sanitize_email( (string) $request->get_param( 'email' ) );
	$user  = $email ? get_user_by( 'email', $email ) : false;

	if ( $user ) {
		// WordPress sends its own reset mail; the link lands on wp-login.php,
		// which is the only page that can actually set a new password.
		retrieve_password( $user->user_login );
	}

	// Always the same answer, whether or not the account exists.
	return rest_ensure_response( array( 'ok' => true ) );
}

function crtch_route_get_account() {
	return rest_ensure_response( array( 'customer' => crtch_customer_payload( wp_get_current_user() ) ) );
}

function crtch_route_update_account( WP_REST_Request $request ) {
	$user     = wp_get_current_user();
	$customer = new WC_Customer( $user->ID );

	$first = $request->get_param( 'first_name' );
	$last  = $request->get_param( 'last_name' );
	if ( null !== $first ) { $customer->set_first_name( sanitize_text_field( (string) $first ) ); }
	if ( null !== $last )  { $customer->set_last_name( sanitize_text_field( (string) $last ) ); }

	foreach ( array( 'billing', 'shipping' ) as $type ) {
		$address = $request->get_param( $type );
		if ( ! is_array( $address ) ) {
			continue;
		}
		foreach ( CRTCH_ADDRESS_FIELDS as $field ) {
			if ( ! array_key_exists( $field, $address ) ) {
				continue;
			}
			$setter = "set_{$type}_{$field}";
			if ( method_exists( $customer, $setter ) ) {
				$customer->$setter( sanitize_text_field( (string) $address[ $field ] ) );
			}
		}
		if ( 'billing' === $type ) {
			if ( array_key_exists( 'phone', $address ) ) {
				$customer->set_billing_phone( sanitize_text_field( (string) $address['phone'] ) );
			}
			// The account email is the login identity — changing it is a
			// separate, verified flow, so only the billing copy moves here.
			if ( array_key_exists( 'email', $address ) && is_email( (string) $address['email'] ) ) {
				$customer->set_billing_email( sanitize_email( (string) $address['email'] ) );
			}
		}
	}

	$customer->save();

	return rest_ensure_response( array( 'customer' => crtch_customer_payload( get_user_by( 'id', $user->ID ) ) ) );
}

/**
 * Attach a just-placed order to the signed-in account.
 *
 * The storefront checkout drives the WooCommerce Store API as a guest — the
 * cart session carries a Cart-Token, not a logged-in user — so every order is
 * created with customer_id 0 and would never show up in order history. The
 * frontend calls this immediately after checkout to adopt it.
 */
function crtch_route_claim_order( WP_REST_Request $request ) {
	if ( ! function_exists( 'wc_get_order' ) ) {
		return new WP_Error( 'crtch_no_woo', 'WooCommerce is not active.', array( 'status' => 500 ) );
	}

	$order_id  = (int) $request->get_param( 'order_id' );
	$order_key = (string) $request->get_param( 'order_key' );
	$order     = $order_id ? wc_get_order( $order_id ) : false;

	// Same answer for "no such order" and "wrong key", so this cannot be used
	// to probe which order numbers exist.
	if ( ! $order || ! hash_equals( (string) $order->get_order_key(), $order_key ) ) {
		return new WP_Error( 'crtch_no_order', 'Order not found.', array( 'status' => 404 ) );
	}

	$user_id  = (int) get_current_user_id();
	$existing = (int) $order->get_customer_id();

	if ( $existing && $existing !== $user_id ) {
		return new WP_Error( 'crtch_claimed', 'That order belongs to another account.', array( 'status' => 409 ) );
	}

	if ( ! $existing ) {
		$order->set_customer_id( $user_id );
		$order->save();
	}

	return rest_ensure_response( array( 'ok' => true, 'order_id' => $order_id ) );
}

function crtch_route_orders( WP_REST_Request $request ) {
	if ( ! function_exists( 'wc_get_orders' ) ) {
		return new WP_Error( 'crtch_no_woo', 'WooCommerce is not active.', array( 'status' => 500 ) );
	}

	$user     = wp_get_current_user();
	$per_page = min( 50, max( 1, (int) ( $request->get_param( 'per_page' ) ?: 20 ) ) );
	$page     = max( 1, (int) ( $request->get_param( 'page' ) ?: 1 ) );

	$orders = wc_get_orders( array(
		'customer_id' => $user->ID,
		'limit'       => $per_page,
		'paged'       => $page,
		'orderby'     => 'date',
		'order'       => 'DESC',
		// Anything the customer can meaningfully be shown. Drafts and trashed
		// orders are excluded.
		'status'      => array( 'pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed' ),
	) );

	return rest_ensure_response( array_map( 'crtch_order_payload', $orders ) );
}
