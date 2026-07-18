<?php
/**
 * Plugin Name: Createch DPO Return Redirect
 * Plugin URI:  https://createch-hobbies.co.ke
 * Description: After a DPO Pay card payment, WooCommerce returns the customer to the unstyled order-received page (which also tries to load a broken http://0.0.0.35 image). This plugin intercepts that return and 302-redirects the customer to the headless Next.js confirmation page at https://www.createch-hobbies.co.ke/payment/return, forwarding TransactionToken and CompanyRef so the frontend can verify the payment server-side. It fires only when TransactionToken is present, so non-DPO thank-you pages render normally.
 * Version:     1.0.0
 * Author:      Createch Hobbies
 * License:     GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

// Where the headless frontend expects DPO returns.
const CREATECH_DPO_RETURN_URL = 'https://www.createch-hobbies.co.ke/payment/return';

// Redirect on template_redirect so we bail out BEFORE any WooCommerce template
// renders. This is deliberately early: the default order-received page for a DPO
// order pulls in a broken http://0.0.0.35 image, so we must never let it paint.
add_action( 'template_redirect', function () {

    // Only act on the WooCommerce "order received" (thank-you) endpoint.
    if ( ! function_exists( 'is_wc_endpoint_url' ) || ! is_wc_endpoint_url( 'order-received' ) ) {
        return;
    }

    // Hard gate: a DPO return always carries TransactionToken. Its absence means
    // this is some other gateway's thank-you page (M-Pesa, etc.) — leave it alone.
    if ( empty( $_GET['TransactionToken'] ) ) {
        return;
    }

    // Forward only the two params the frontend reads. TransactionToken is the
    // authoritative payment signal (the backend runs DPO verifyToken against it);
    // CompanyRef is the order reference, shown for display only.
    $query = array(
        'TransactionToken' => sanitize_text_field( wp_unslash( $_GET['TransactionToken'] ) ),
    );

    if ( ! empty( $_GET['CompanyRef'] ) ) {
        $query['CompanyRef'] = sanitize_text_field( wp_unslash( $_GET['CompanyRef'] ) );
    }

    $destination = add_query_arg( $query, CREATECH_DPO_RETURN_URL );

    // 302 (temporary): this is a transient hand-off, not a permanent move of the
    // order-received URL. wp_redirect() defaults to 302. Use the raw redirect so
    // WordPress does not append its own query junk, then exit before render.
    wp_redirect( $destination, 302 );
    exit;
}, 5 );
