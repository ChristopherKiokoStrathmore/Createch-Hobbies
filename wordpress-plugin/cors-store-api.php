<?php
/**
 * Must-Use Plugin: CORS for WooCommerce Store API
 * Allows the Next.js frontend to call the Store API from both production and local dev.
 */
defined( 'ABSPATH' ) || exit;

add_action( 'init', function () {
    $allowed_origins = [
        'https://createch-hobbies.co.ke', // production (Vercel)
        'http://localhost:3000',           // local dev
        'http://localhost:3001',           // local dev alternate port
    ];

    $request_origin = sanitize_text_field( wp_unslash( $_SERVER['HTTP_ORIGIN'] ?? '' ) );

    if ( ! in_array( $request_origin, $allowed_origins, true ) ) {
        return;
    }

    header( "Access-Control-Allow-Origin: $request_origin" );
    header( 'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS' );
    header( 'Access-Control-Allow-Headers: Content-Type, Authorization, X-WC-Store-API-Nonce, Nonce, Cart-Token, X-Requested-With' );
    header( 'Access-Control-Allow-Credentials: true' );
    header( 'Access-Control-Expose-Headers: X-WC-Store-API-Nonce, Cart-Token, Nonce' );

    if ( 'OPTIONS' === $_SERVER['REQUEST_METHOD'] ) {
        status_header( 200 );
        exit;
    }
}, 1 );
