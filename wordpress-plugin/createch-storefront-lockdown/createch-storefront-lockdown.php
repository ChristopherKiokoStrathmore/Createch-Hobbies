<?php
/**
 * Plugin Name: Createch Storefront Lockdown
 * Plugin URI:  https://createch-hobbies.co.ke
 * Description: This WordPress install is a headless catalog/checkout engine behind the Next.js storefront at createch-hobbies.co.ke; nobody should browse or buy on it directly. This plugin 302-redirects all front-end storefront page views to the Next.js site. It EXEMPTS the paths the headless flow depends on: REST routes including the Store API and wc/v3 (/wp-json/*), gateway callbacks (?wc-api=...), the WooCommerce order-received endpoint (the DPO card-return hop handled by createch-dpo-return-redirect), and logged-in shop managers (so admins can still preview). wp-admin and wp-login are untouched.
 * Version:     1.0.0
 * Author:      Createch Hobbies
 * License:     GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

/**
 * Where direct storefront visitors get sent. Kept as a constant so there is a
 * single place to change it.
 */
if ( ! defined( 'CREATECH_STOREFRONT_URL' ) ) {
	define( 'CREATECH_STOREFRONT_URL', 'https://www.createch-hobbies.co.ke/' );
}

add_action( 'template_redirect', function () {
	// wp-admin is never a front-end view, but guard anyway.
	if ( is_admin() ) {
		return;
	}

	// REST requests (Store API cart/checkout + wc/v3 catalog) do not normally
	// reach template_redirect, but exempt them explicitly as insurance.
	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		return;
	}

	// Payment gateway server-to-server callbacks, e.g. ?wc-api=WC_Gateway_Dpo.
	if ( isset( $_GET['wc-api'] ) ) {
		return;
	}

	// The card-return hop. DPO sends the customer here with a TransactionToken;
	// createch-dpo-return-redirect confirms payment and forwards them onward.
	// Never intercept it, or that flow breaks.
	if ( function_exists( 'is_wc_endpoint_url' ) && is_wc_endpoint_url( 'order-received' ) ) {
		return;
	}

	// Let logged-in shop managers browse the WP storefront (debugging/preview).
	if ( current_user_can( 'manage_woocommerce' ) ) {
		return;
	}

	// Everyone else is a direct visitor to a storefront that should not be
	// shopped. Send them to the real (Next.js) site.
	wp_redirect( CREATECH_STOREFRONT_URL, 302 );
	exit;
}, 1 );
