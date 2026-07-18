<?php
/**
 * Plugin Name: WC M-Pesa STK Push (Daraja API 2.0)
 * Plugin URI:  https://createch-hobbies.co.ke
 * Description: WooCommerce payment gateway for Safaricom M-Pesa Express (STK Push) via Daraja API 2.0.
 * Version:     1.3.0
 * Author:      Createch Hobbies
 * License:     GPL-2.0+
 * Text Domain: wc-mpesa-stk
 */

defined( 'ABSPATH' ) || exit;

// ------------------------------------------------------------------
// 1. Boot: register the gateway only after WooCommerce is loaded.
// ------------------------------------------------------------------
add_action( 'plugins_loaded', 'wc_mpesa_stk_init', 11 );

// ------------------------------------------------------------------
// Store API hook: capture mpesa_phone from payment_data before
// process_payment() is called, so headless Next.js checkout works.
// ------------------------------------------------------------------
add_action( 'woocommerce_store_api_checkout_update_order_from_request', function ( $order, $request ) {
    $payment_data = $request->get_param( 'payment_data' );

    if ( ! is_array( $payment_data ) ) {
        return;
    }

    foreach ( $payment_data as $item ) {
        if ( isset( $item['key'], $item['value'] ) && 'mpesa_phone' === $item['key'] ) {
            $phone = sanitize_text_field( $item['value'] );

            if ( preg_match( '/^254[71]\d{8}$/', $phone ) ) {
                $order->update_meta_data( '_mpesa_pending_phone', $phone );
                $order->save();
            }
            break;
        }
    }
}, 10, 2 );

function wc_mpesa_stk_init() {
    if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
        add_action( 'admin_notices', function () {
            echo '<div class="error"><p><strong>WC M-Pesa STK Push</strong> requires WooCommerce to be active.</p></div>';
        } );
        return;
    }

    // Register gateway class.
    add_filter( 'woocommerce_payment_gateways', 'wc_mpesa_stk_add_gateway' );
    function wc_mpesa_stk_add_gateway( $gateways ) {
        $gateways[] = 'WC_Gateway_Mpesa_STK';
        return $gateways;
    }

    // ---------------------------------------------------------------
    // 2. Main gateway class.
    // ---------------------------------------------------------------
    class WC_Gateway_Mpesa_STK extends WC_Payment_Gateway {

        /** @var WC_Logger */
        private WC_Logger $log;

        public function __construct() {
            $this->id                 = 'wc_mpesa_stk';
            $this->method_title       = 'M-Pesa STK Push';
            $this->method_description = 'Accept payments via Safaricom M-Pesa Express (STK Push) using Daraja API 2.0.';
            $this->has_fields         = true;
            $this->supports           = [ 'products' ];

            $this->init_form_fields();
            $this->init_settings();

            $this->title       = $this->get_option( 'title' );
            $this->description = $this->get_option( 'description' );

            $this->log = new WC_Logger();

            add_action( 'woocommerce_update_options_payment_gateways_' . $this->id, [ $this, 'process_admin_options' ] );

            // Callback URL format: https://wp.createch-hobbies.co.ke/wp/wc-api/wc_gateway_mpesa_stk/
            add_action( 'woocommerce_api_wc_gateway_mpesa_stk', [ $this, 'handle_callback' ] );

            // Customer-pollable payment status, authenticated by the order key:
            // GET /?wc-api=wc_mpesa_status&order_id=<id>&key=<order_key>
            // The headless frontend polls this (via its own proxy) so the
            // "Check Your Phone" screen can flip to a success/failure state.
            add_action( 'woocommerce_api_wc_mpesa_status', [ $this, 'handle_status_check' ] );
        }

        // -----------------------------------------------------------
        // 3. Admin Settings Form Fields.
        // -----------------------------------------------------------
        public function init_form_fields(): void {
            $this->form_fields = [
                'enabled' => [
                    'title'   => 'Enable/Disable',
                    'type'    => 'checkbox',
                    'label'   => 'Enable M-Pesa STK Push',
                    'default' => 'no',
                ],
                'title' => [
                    'title'       => 'Title',
                    'type'        => 'text',
                    'description' => 'Payment title shown to the customer at checkout.',
                    'default'     => 'M-Pesa',
                    'desc_tip'    => true,
                ],
                'description' => [
                    'title'       => 'Description',
                    'type'        => 'textarea',
                    'description' => 'Payment description shown to the customer at checkout.',
                    'default'     => 'Pay securely via M-Pesa. You will receive a push notification on your phone to confirm.',
                ],
                'environment' => [
                    'title'       => 'Environment',
                    'type'        => 'select',
                    'description' => 'Use Sandbox for testing, Production for live payments.',
                    'desc_tip'    => true,
                    'default'     => 'sandbox',
                    'options'     => [
                        'sandbox'    => 'Sandbox (Testing)',
                        'production' => 'Production (Live)',
                    ],
                ],
                'shortcode' => [
                    'title'       => 'Store Number (BusinessShortCode)',
                    'type'        => 'text',
                    'description' => 'The BusinessShortCode used to build the STK password (pairs with the Passkey). For a Buy Goods / Till setup this is the store / head-office number (e.g. 4574069) — NOT the till the customer pays into.',
                    'desc_tip'    => true,
                    'default'     => '',
                ],
                'till_number' => [
                    'title'       => 'Till Number (Buy Goods, PartyB)',
                    'type'        => 'text',
                    'description' => 'The Buy Goods Till the money is collected on (sent as PartyB with TransactionType CustomerBuyGoodsOnline), e.g. 3434039.',
                    'desc_tip'    => true,
                    'default'     => '3434039',
                ],
                'consumer_key' => [
                    'title'       => 'Consumer Key',
                    'type'        => 'text',
                    'description' => 'Daraja API Consumer Key from the Safaricom Developer Portal.',
                    'desc_tip'    => true,
                    'default'     => '',
                ],
                'consumer_secret' => [
                    'title'       => 'Consumer Secret',
                    'type'        => 'password',
                    'description' => 'Daraja API Consumer Secret from the Safaricom Developer Portal.',
                    'desc_tip'    => true,
                    'default'     => '',
                ],
                'passkey' => [
                    'title'       => 'Passkey',
                    'type'        => 'password',
                    'description' => 'STK Push Passkey from the Safaricom Developer Portal (Lipa na M-Pesa Online Passkey).',
                    'desc_tip'    => true,
                    'default'     => '',
                ],
            ];
        }

        // -----------------------------------------------------------
        // 4. Checkout: render the phone number input field.
        // (Only shown in native WooCommerce checkout, not Store API.)
        // -----------------------------------------------------------
        public function payment_fields(): void {
            if ( $this->description ) {
                echo '<p>' . wp_kses_post( $this->description ) . '</p>';
            }

            echo '<fieldset id="wc-mpesa-stk-fields">';
            echo '<div class="form-row form-row-wide">';
            echo '<label for="mpesa_phone">' . esc_html__( 'M-Pesa Phone Number', 'wc-mpesa-stk' ) . ' <span class="required">*</span></label>';
            echo '<input type="tel" id="mpesa_phone" name="mpesa_phone" placeholder="e.g. 2547XXXXXXXX" maxlength="12" autocomplete="tel" />';
            echo '<small>' . esc_html__( 'Enter your number in the format: 2547XXXXXXXX or 2541XXXXXXXX', 'wc-mpesa-stk' ) . '</small>';
            echo '</div>';
            echo '</fieldset>';
        }

        // -----------------------------------------------------------
        // 5. Validate phone for native WooCommerce checkout only.
        // Store API validates on the Next.js side before submission.
        // -----------------------------------------------------------
        public function validate_fields(): bool {
            $phone = isset( $_POST['mpesa_phone'] ) ? sanitize_text_field( wp_unslash( $_POST['mpesa_phone'] ) ) : '';

            if ( empty( $phone ) ) {
                wc_add_notice( 'Please enter your M-Pesa phone number.', 'error' );
                return false;
            }

            if ( ! preg_match( '/^254[71]\d{8}$/', $phone ) ) {
                wc_add_notice( 'Invalid M-Pesa number. Use the format: 2547XXXXXXXX or 2541XXXXXXXX.', 'error' );
                return false;
            }

            return true;
        }

        // -----------------------------------------------------------
        // 6. process_payment
        // Phone source priority:
        //   1. Order meta set by Store API hook (headless Next.js checkout)
        //   2. $_POST (native WooCommerce checkout)
        // -----------------------------------------------------------
        public function process_payment( $order_id ): array {
            $order = wc_get_order( $order_id );

            // Prefer phone saved from Store API payment_data, fall back to $_POST.
            $phone = $order->get_meta( '_mpesa_pending_phone' )
                ?: sanitize_text_field( wp_unslash( $_POST['mpesa_phone'] ?? '' ) );

            if ( empty( $phone ) ) {
                $this->log->error( '[M-Pesa STK] No phone number found for Order #' . $order_id, [ 'source' => 'mpesa-stk' ] );
                wc_add_notice( 'M-Pesa phone number is missing. Please try again.', 'error' );
                return [ 'result' => 'failure' ];
            }

            // Step 1: Get OAuth access token.
            $token = $this->get_access_token();
            if ( is_wp_error( $token ) ) {
                $this->log->error( '[M-Pesa STK] Token error: ' . $token->get_error_message(), [ 'source' => 'mpesa-stk' ] );
                wc_add_notice( 'M-Pesa service is temporarily unavailable. Please try again.', 'error' );
                return [ 'result' => 'failure' ];
            }

            // Step 2: Build STK Push password.
            // The password is derived from the BusinessShortCode (store number)
            // + Passkey + timestamp — this exact pairing is what authenticates
            // the STK request, and must NOT be switched to the till number.
            $shortcode = $this->get_option( 'shortcode' );
            $till      = $this->get_option( 'till_number' ) ?: $shortcode;
            $passkey   = $this->get_option( 'passkey' );
            $timestamp = gmdate( 'YmdHis' );
            $password  = base64_encode( $shortcode . $passkey . $timestamp );

            $amount       = (int) ceil( $order->get_total() );
            $callback_url = add_query_arg( 'wc-api', 'wc_gateway_mpesa_stk', trailingslashit( get_home_url() ) );

            // This is a Buy Goods / Till setup: money is collected on the Till
            // (PartyB = till number) with TransactionType CustomerBuyGoodsOnline,
            // while BusinessShortCode stays the store number (it only pairs with
            // the passkey for the password). Sending CustomerPayBillOnline with
            // PartyB = the shortcode is the combination Safaricom rejected with
            // ResultCode 2029 ("unresolved reason type").
            $payload = [
                'BusinessShortCode' => $shortcode,
                'Password'          => $password,
                'Timestamp'         => $timestamp,
                'TransactionType'   => 'CustomerBuyGoodsOnline',
                'Amount'            => $amount,
                'PartyA'            => $phone,
                'PartyB'            => $till,
                'PhoneNumber'       => $phone,
                'CallBackURL'       => $callback_url,
                'AccountReference'  => 'Order #' . $order_id,
                'TransactionDesc'   => 'Payment for Order #' . $order_id . ' at Createch Hobbies',
            ];

            $this->log->info(
                '[M-Pesa STK] STK Push request for Order #' . $order_id . ': ' . wp_json_encode( array_merge( $payload, [ 'Password' => '***' ] ) ),
                [ 'source' => 'mpesa-stk' ]
            );

            // Step 3: Send STK Push request.
            $response = wp_remote_post(
                $this->get_endpoint( 'stkpush' ),
                [
                    'headers' => [
                        'Authorization' => 'Bearer ' . $token,
                        'Content-Type'  => 'application/json',
                    ],
                    'body'    => wp_json_encode( $payload ),
                    'timeout' => 30,
                ]
            );

            if ( is_wp_error( $response ) ) {
                $this->log->error( '[M-Pesa STK] STK Push request failed: ' . $response->get_error_message(), [ 'source' => 'mpesa-stk' ] );
                wc_add_notice( 'Could not reach M-Pesa. Check your connection and try again.', 'error' );
                return [ 'result' => 'failure' ];
            }

            $body = json_decode( wp_remote_retrieve_body( $response ), true );
            $this->log->info( '[M-Pesa STK] STK Push response: ' . wp_json_encode( $body ), [ 'source' => 'mpesa-stk' ] );

            // Step 4: Handle API response.
            if ( isset( $body['ResponseCode'] ) && '0' === (string) $body['ResponseCode'] ) {
                $order->update_meta_data( '_mpesa_checkout_request_id', sanitize_text_field( $body['CheckoutRequestID'] ) );
                $order->update_meta_data( '_mpesa_merchant_request_id', sanitize_text_field( $body['MerchantRequestID'] ) );
                $order->delete_meta_data( '_mpesa_pending_phone' ); // Clean up temp field.
                $order->save();

                $order->update_status(
                    'pending',
                    sprintf(
                        'M-Pesa STK Push sent. MerchantRequestID: %s | CheckoutRequestID: %s. Awaiting customer confirmation.',
                        sanitize_text_field( $body['MerchantRequestID'] ),
                        sanitize_text_field( $body['CheckoutRequestID'] )
                    )
                );

                WC()->cart->empty_cart();

                return [
                    'result'   => 'success',
                    'redirect' => $this->get_return_url( $order ),
                ];
            }

            $error_msg = $body['errorMessage'] ?? $body['ResponseDescription'] ?? 'Unknown error from M-Pesa API.';
            $this->log->error( '[M-Pesa STK] STK Push failed: ' . $error_msg, [ 'source' => 'mpesa-stk' ] );
            wc_add_notice( 'M-Pesa payment failed: ' . esc_html( $error_msg ), 'error' );
            return [ 'result' => 'failure' ];
        }

        // -----------------------------------------------------------
        // 7. Callback Handler — Safaricom POSTs results here.
        // -----------------------------------------------------------
        public function handle_callback(): void {
            $raw_body = file_get_contents( 'php://input' );
            $this->log->info( '[M-Pesa STK] Callback received: ' . $raw_body, [ 'source' => 'mpesa-stk' ] );

            $data = json_decode( $raw_body );

            if ( ! $data || ! isset( $data->Body->stkCallback ) ) {
                $this->log->error( '[M-Pesa STK] Invalid callback payload.', [ 'source' => 'mpesa-stk' ] );
                status_header( 400 );
                wp_send_json( [ 'ResultCode' => 1, 'ResultDesc' => 'Invalid payload' ] );
                exit;
            }

            $callback        = $data->Body->stkCallback;
            $result_code     = (int) $callback->ResultCode;
            $checkout_req_id = sanitize_text_field( $callback->CheckoutRequestID ?? '' );

            $orders = wc_get_orders( [
                'meta_key'   => '_mpesa_checkout_request_id',
                'meta_value' => $checkout_req_id,
                'limit'      => 1,
            ] );

            if ( empty( $orders ) ) {
                $this->log->error( '[M-Pesa STK] No order found for CheckoutRequestID: ' . $checkout_req_id, [ 'source' => 'mpesa-stk' ] );
                wp_send_json( [ 'ResultCode' => 0, 'ResultDesc' => 'Accepted' ] );
                exit;
            }

            $order = $orders[0];

            // Idempotency: Safaricom can (and does) retry callbacks. If this
            // order is already paid, acknowledge and stop so we never process a
            // completed payment twice.
            if ( $order->is_paid() ) {
                $this->log->info(
                    '[M-Pesa STK] Duplicate callback for already-paid Order #' . $order->get_id() . '. Ignored.',
                    [ 'source' => 'mpesa-stk' ]
                );
                status_header( 200 );
                wp_send_json( [ 'ResultCode' => 0, 'ResultDesc' => 'Accepted' ] );
                exit;
            }

            if ( 0 === $result_code ) {
                $receipt_number = '';
                $amount_paid    = '';
                $phone_used     = '';

                if ( isset( $callback->CallbackMetadata->Item ) ) {
                    foreach ( $callback->CallbackMetadata->Item as $item ) {
                        switch ( $item->Name ) {
                            case 'MpesaReceiptNumber':
                                $receipt_number = sanitize_text_field( $item->Value ?? '' );
                                break;
                            case 'Amount':
                                $amount_paid = sanitize_text_field( $item->Value ?? '' );
                                break;
                            case 'PhoneNumber':
                                $phone_used = sanitize_text_field( $item->Value ?? '' );
                                break;
                        }
                    }
                }

                // SECURITY: never complete an order without confirming the amount
                // actually paid covers the order total. Without this, a partial
                // payment (or a forged/replayed callback with a smaller amount)
                // would mark the order fully paid. Compare in whole shillings,
                // matching how the STK amount was sent ( (int) ceil( total ) ).
                $order_total = (int) ceil( (float) $order->get_total() );
                $paid_amount = (int) round( (float) $amount_paid );

                if ( $paid_amount < $order_total ) {
                    $order->update_status(
                        'on-hold',
                        sprintf(
                            'M-Pesa amount mismatch: paid KES %s but order total is KES %s. Receipt: %s. Holding for manual review.',
                            $amount_paid,
                            $order_total,
                            $receipt_number
                        )
                    );
                    $order->update_meta_data( '_mpesa_receipt_number', $receipt_number );
                    $order->save();

                    $this->log->error(
                        '[M-Pesa STK] Amount mismatch for Order #' . $order->get_id() .
                        ': paid ' . $paid_amount . ' < total ' . $order_total . '. NOT completing.',
                        [ 'source' => 'mpesa-stk' ]
                    );

                    status_header( 200 );
                    wp_send_json( [ 'ResultCode' => 0, 'ResultDesc' => 'Accepted' ] );
                    exit;
                }

                $order->update_meta_data( '_mpesa_receipt_number', $receipt_number );
                $order->payment_complete( $receipt_number );
                $order->add_order_note(
                    sprintf(
                        'M-Pesa payment confirmed. Receipt: %s | Amount: KES %s | Phone: %s',
                        $receipt_number,
                        $amount_paid,
                        $phone_used
                    )
                );
                $order->save();

                $this->log->info(
                    '[M-Pesa STK] Payment success for Order #' . $order->get_id() . '. Receipt: ' . $receipt_number,
                    [ 'source' => 'mpesa-stk' ]
                );

            } else {
                $result_desc = sanitize_text_field( $callback->ResultDesc ?? 'Payment cancelled or failed.' );
                $order->update_status(
                    'failed',
                    'M-Pesa payment failed/cancelled. Reason: ' . $result_desc . ' | CheckoutRequestID: ' . $checkout_req_id
                );

                $this->log->warning(
                    '[M-Pesa STK] Payment failed for Order #' . $order->get_id() . '. ResultCode: ' . $result_code . ' | ' . $result_desc,
                    [ 'source' => 'mpesa-stk' ]
                );
            }

            status_header( 200 );
            wp_send_json( [ 'ResultCode' => 0, 'ResultDesc' => 'Accepted' ] );
            exit;
        }

        // -----------------------------------------------------------
        // 8. Status check — polled by the headless frontend.
        // Read-only and key-authenticated: it can never change order
        // state, and without the exact order key it reveals nothing.
        // -----------------------------------------------------------
        public function handle_status_check(): void {
            nocache_headers();

            $order_id = isset( $_GET['order_id'] ) ? absint( wp_unslash( $_GET['order_id'] ) ) : 0;
            $key      = isset( $_GET['key'] ) ? sanitize_text_field( wp_unslash( $_GET['key'] ) ) : '';

            if ( ! $order_id || '' === $key ) {
                status_header( 400 );
                wp_send_json( [ 'error' => 'Missing order_id or key.' ] );
            }

            $order = wc_get_order( $order_id );

            if ( ! $order || ! hash_equals( (string) $order->get_order_key(), $key ) ) {
                status_header( 404 );
                wp_send_json( [ 'error' => 'Order not found.' ] );
            }

            if ( $order->is_paid() ) {
                $status = 'paid';
            } elseif ( in_array( $order->get_status(), [ 'failed', 'cancelled' ], true ) ) {
                $status = 'failed';
            } else {
                // pending, on-hold (amount-mismatch review), draft… — still open.
                $status = 'pending';
            }

            wp_send_json( [
                'status'  => $status,
                'receipt' => (string) $order->get_meta( '_mpesa_receipt_number' ),
            ] );
        }

        // -----------------------------------------------------------
        // 9. Internal helpers.
        // -----------------------------------------------------------

        private function get_access_token(): string|WP_Error {
            $consumer_key    = $this->get_option( 'consumer_key' );
            $consumer_secret = $this->get_option( 'consumer_secret' );

            $response = wp_remote_get(
                $this->get_endpoint( 'oauth' ),
                [
                    'headers' => [
                        'Authorization' => 'Basic ' . base64_encode( $consumer_key . ':' . $consumer_secret ),
                    ],
                    'timeout' => 20,
                ]
            );

            if ( is_wp_error( $response ) ) {
                return $response;
            }

            $body = json_decode( wp_remote_retrieve_body( $response ), true );

            if ( empty( $body['access_token'] ) ) {
                return new WP_Error(
                    'mpesa_token_error',
                    'Could not retrieve access token. Response: ' . wp_json_encode( $body )
                );
            }

            return $body['access_token'];
        }

        /**
         * SANDBOX base:    https://sandbox.safaricom.co.ke
         * PRODUCTION base: https://api.safaricom.co.ke
         * Switch by changing Environment in WooCommerce settings.
         */
        private function get_endpoint( string $type ): string {
            $env  = $this->get_option( 'environment', 'sandbox' );
            $base = 'production' === $env
                ? 'https://api.safaricom.co.ke'      // PRODUCTION: live payments
                : 'https://sandbox.safaricom.co.ke'; // SANDBOX: safe for testing

            return match ( $type ) {
                'oauth'   => $base . '/oauth/v1/generate?grant_type=client_credentials',
                'stkpush' => $base . '/mpesa/stkpush/v1/processrequest',
                default   => $base,
            };
        }
    }
}
