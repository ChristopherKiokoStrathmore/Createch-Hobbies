<?php
/**
 * Plugin Name: Createch Store API CORS
 * Plugin URI:  https://createch-hobbies.co.ke
 * Description: Sends Access-Control-Allow-Origin on WooCommerce Store API responses so the headless Next.js frontend can drive cart and checkout. WordPress core emits it on OPTIONS preflights but it is missing from the actual GET/POST responses on this install.
 * Version:     1.0.0
 * Author:      Createch Hobbies
 * License:     GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

add_filter( 'rest_pre_serve_request', function ( $served, $result, $request ) {
    if ( strpos( $request->get_route(), '/wc/store/' ) !== 0 ) {
        return $served;
    }

    $allowed = array(
        'https://createch-hobbies.co.ke',
        'https://www.createch-hobbies.co.ke',
        'http://localhost:3000',
    );

    $origin = get_http_origin();
    if ( $origin && in_array( $origin, $allowed, true ) ) {
        header( 'Access-Control-Allow-Origin: ' . $origin, true );
        header( 'Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type, Cart-Token, Nonce', true );
        header( 'Access-Control-Expose-Headers: X-WP-Total, X-WP-TotalPages, Link, Cart-Token, Nonce, X-WC-Store-API-Nonce', true );
        header( 'Vary: Origin', false );
    }

    return $served;
}, 99, 3 );
