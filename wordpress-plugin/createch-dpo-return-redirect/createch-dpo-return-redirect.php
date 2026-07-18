<?php
/**
 * Plugin Name: Createch DPO Return Redirect
 * Plugin URI:  https://createch-hobbies.co.ke
 * Description: After a DPO Pay card payment, WooCommerce returns the customer to the unstyled order-received page (which also tries to load a broken http://0.0.0.35 image). This plugin (a) verifies the DPO TransactionToken server-side and marks the WooCommerce order paid itself, then (b) 302-redirects the customer to the headless Next.js confirmation page at https://www.createch-hobbies.co.ke/payment/return. Because it redirects before the DPO gateway's own order-received handler runs, it must complete the order itself — otherwise paid orders would stay stuck at "pending". It fires only when TransactionToken is present, so non-DPO thank-you pages render normally.
 * Version:     1.1.0
 * Author:      Createch Hobbies
 * License:     GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

// Where the headless frontend expects DPO returns.
const CREATECH_DPO_RETURN_URL = 'https://www.createch-hobbies.co.ke/payment/return';

// DPO verifyToken API endpoint.
const CREATECH_DPO_API_URL = 'https://secure.3gdirectpay.com/API/v6/';

// WooCommerce gateway id for DPO Pay.
const CREATECH_DPO_GATEWAY_ID = 'woocommerce_dpo';

// Redirect on template_redirect so we bail out BEFORE any WooCommerce template
// renders. This is deliberately early: the default order-received page for a DPO
// order pulls in a broken http://0.0.0.35 image, so we must never let it paint.
//
// The catch: redirecting this early ALSO pre-empts the DPO gateway's own
// order-received handler, which is what normally flips the order from "pending"
// to "processing". So before we redirect we verify the token ourselves and, if
// paid, call payment_complete() — otherwise paid orders would sit at "pending"
// forever and the money would look uncollected in the dashboard.
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

    $token = sanitize_text_field( wp_unslash( $_GET['TransactionToken'] ) );

    // Best-effort: mark the WooCommerce order paid before we hand the customer
    // off. Fully defensive — any failure here is swallowed so the redirect still
    // happens. We NEVER block the customer on this; the frontend verifies the
    // payment independently regardless of what WooCommerce's own status says.
    createch_dpo_maybe_complete_order( $token );

    // Forward only the two params the frontend reads. TransactionToken is the
    // authoritative payment signal (the backend runs DPO verifyToken against it);
    // CompanyRef is the order reference, shown for display only.
    $query = array(
        'TransactionToken' => $token,
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

/**
 * Verify a DPO TransactionToken and, if paid, mark the corresponding WooCommerce
 * order complete. Entirely defensive: on any missing precondition or failure it
 * returns quietly without changing order state. It must never throw — the caller
 * relies on falling through to the redirect no matter what.
 *
 * @param string $token The DPO TransactionToken from the return URL.
 */
function createch_dpo_maybe_complete_order( $token ) {
    try {
        if ( '' === $token || ! function_exists( 'wc_get_order' ) ) {
            return;
        }

        // The order-received URL is /order-received/{id}/?key={order_key}. Take
        // the id from the endpoint query var and require the matching order key
        // so we can only ever complete the order this URL legitimately points at.
        $order_id  = absint( get_query_var( 'order-received' ) );
        if ( ! $order_id && isset( $_GET['order-received'] ) ) {
            $order_id = absint( wp_unslash( $_GET['order-received'] ) );
        }
        $order_key = isset( $_GET['key'] ) ? sanitize_text_field( wp_unslash( $_GET['key'] ) ) : '';

        if ( ! $order_id || '' === $order_key ) {
            return;
        }

        $order = wc_get_order( $order_id );
        if ( ! $order ) {
            return;
        }

        // Key must match — never complete an order the URL doesn't authenticate.
        if ( ! hash_equals( (string) $order->get_order_key(), $order_key ) ) {
            return;
        }

        // Idempotency guard: if the order is already paid (processing/completed)
        // — e.g. DPO's own handler or a prior visit already ran — do nothing. This
        // is what makes the fix safe under the "DPO lag" hypothesis too: whichever
        // path marks it paid first wins; the other becomes a no-op.
        if ( $order->is_paid() ) {
            return;
        }

        // Only touch DPO orders. Belt-and-suspenders alongside the TransactionToken
        // gate; if the order was paid by another gateway, leave it entirely alone.
        if ( CREATECH_DPO_GATEWAY_ID !== $order->get_payment_method() ) {
            return;
        }

        $company_token = createch_dpo_company_token();
        if ( '' === $company_token ) {
            return;
        }

        if ( ! createch_dpo_token_is_paid( $company_token, $token ) ) {
            return;
        }

        // Confirmed paid by DPO verifyToken. Complete the order — this fires the
        // WooCommerce paid transition, which emits the order.updated webhook that
        // the Django backend consumes so the dashboard reflects the payment.
        $order->payment_complete( $token );
        $order->add_order_note(
            'Payment confirmed via DPO verifyToken (Createch return-redirect plugin) and order marked complete.'
        );
    } catch ( \Throwable $e ) {
        // Swallow everything — the customer must still be redirected.
        return;
    }
}

/**
 * Resolve the DPO company token from the gateway settings, falling back to the
 * live gateway instance. Returns '' if unavailable.
 *
 * @return string
 */
function createch_dpo_company_token() {
    $settings = get_option( 'woocommerce_' . CREATECH_DPO_GATEWAY_ID . '_settings' );
    if ( is_array( $settings ) && ! empty( $settings['company_token'] ) ) {
        return trim( (string) $settings['company_token'] );
    }

    // Fallback: read it off the instantiated gateway object.
    if ( function_exists( 'WC' ) && WC()->payment_gateways() ) {
        $gateways = WC()->payment_gateways()->payment_gateways();
        if ( isset( $gateways[ CREATECH_DPO_GATEWAY_ID ] ) ) {
            $value = $gateways[ CREATECH_DPO_GATEWAY_ID ]->get_option( 'company_token' );
            if ( ! empty( $value ) ) {
                return trim( (string) $value );
            }
        }
    }

    return '';
}

/**
 * Call DPO verifyToken for a transaction and report whether it is paid.
 * Result code "000" means the transaction is paid. Any error, non-200, or
 * non-"000" result returns false (never mark paid on doubt).
 *
 * @param string $company_token DPO company token.
 * @param string $transaction_token DPO TransactionToken from the return.
 * @return bool True only when DPO confirms the transaction is paid.
 */
function createch_dpo_token_is_paid( $company_token, $transaction_token ) {
    $request_xml = '<?xml version="1.0" encoding="utf-8"?>'
        . '<API3G>'
        . '<CompanyToken>' . htmlspecialchars( $company_token, ENT_XML1 ) . '</CompanyToken>'
        . '<Request>verifyToken</Request>'
        . '<TransactionToken>' . htmlspecialchars( $transaction_token, ENT_XML1 ) . '</TransactionToken>'
        . '</API3G>';

    $response = wp_remote_post(
        CREATECH_DPO_API_URL,
        array(
            'timeout' => 20,
            'headers' => array( 'Content-Type' => 'application/xml' ),
            'body'    => $request_xml,
        )
    );

    if ( is_wp_error( $response ) ) {
        return false;
    }
    if ( 200 !== (int) wp_remote_retrieve_response_code( $response ) ) {
        return false;
    }

    $body = wp_remote_retrieve_body( $response );
    if ( '' === $body ) {
        return false;
    }

    // Parse defensively — malformed XML must not raise, just fail closed.
    $previous = libxml_use_internal_errors( true );
    $xml      = simplexml_load_string( $body );
    libxml_clear_errors();
    libxml_use_internal_errors( $previous );

    if ( false === $xml || ! isset( $xml->Result ) ) {
        return false;
    }

    return '000' === trim( (string) $xml->Result );
}
