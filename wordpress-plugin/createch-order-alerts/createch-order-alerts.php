<?php
/**
 * Plugin Name: Createch Order Alerts
 * Plugin URI:  https://createch-hobbies.co.ke
 * Description: Sends the store owner an instant alert when an order is PAID (status → processing; on-hold and completed are covered as safety nets). Two channels: a deliberately plain-text email — the host's outbound filter rejects WooCommerce's HTML order template, but accepts simple mail — and an optional WhatsApp message via CallMeBot. Each order alerts exactly once (guarded by order meta). Configure recipients and the optional CallMeBot number/key under Settings → Order Alerts.
 * Version:     1.0.0
 * Author:      Createch Hobbies
 * License:     GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

const CREATECH_ALERTS_OPTION = 'createch_order_alerts';
const CREATECH_ALERTS_META   = '_createch_alert_sent';

function createch_alerts_settings() {
	$defaults = array(
		'emails'          => 'createch.hobbies@gmail.com, thechrisnguu@gmail.com',
		'whatsapp_phone'  => '',
		'callmebot_key'   => '',
	);
	return wp_parse_args( get_option( CREATECH_ALERTS_OPTION, array() ), $defaults );
}

/* ── Alert dispatch ────────────────────────────────────────────────────── */

// processing = money received (M-Pesa STK callback or DPO redirect plugin both
// land here). on-hold = DPO amount-mismatch review. completed = safety net in
// case an order skips processing.
add_action( 'woocommerce_order_status_processing', 'createch_alerts_dispatch', 20 );
add_action( 'woocommerce_order_status_on-hold',   'createch_alerts_dispatch', 20 );
add_action( 'woocommerce_order_status_completed', 'createch_alerts_dispatch', 20 );

function createch_alerts_dispatch( $order_id ) {
	$order = wc_get_order( $order_id );
	if ( ! $order || $order->get_meta( CREATECH_ALERTS_META ) ) {
		return;
	}
	$order->update_meta_data( CREATECH_ALERTS_META, current_time( 'mysql' ) );
	$order->save();

	$settings = createch_alerts_settings();
	$status   = $order->get_status();
	$total    = html_entity_decode( wp_strip_all_tags( $order->get_formatted_order_total() ) );
	$method   = $order->get_payment_method_title();
	$receipt  = $order->get_meta( '_mpesa_receipt_number' );
	$name     = trim( $order->get_formatted_billing_full_name() );
	$phone    = $order->get_billing_phone();

	$items = array();
	foreach ( $order->get_items() as $item ) {
		$items[] = $item->get_quantity() . 'x ' . $item->get_name();
	}
	$items_line = implode( ', ', $items );

	$label = ( 'on-hold' === $status ) ? 'ON HOLD (review needed)' : 'PAID';

	/* Plain-text email. Keep it simple on purpose: the host's outbound
	 * filter rejects the Woo HTML order template but accepts plain mail. */
	$emails = array_filter( array_map( 'sanitize_email', array_map( 'trim', explode( ',', $settings['emails'] ) ) ) );
	if ( $emails ) {
		$subject = sprintf( '%s order #%s — %s (%s)', $label, $order->get_order_number(), $total, $method );
		$lines   = array(
			sprintf( 'Order #%s is %s.', $order->get_order_number(), $label ),
			'',
			'Total:    ' . $total,
			'Payment:  ' . $method . ( $receipt ? ' (receipt ' . $receipt . ')' : '' ),
			'Customer: ' . $name,
			'Phone:    ' . $phone,
			'Items:    ' . $items_line,
			'',
			'Manage: ' . admin_url( 'admin.php?page=wc-orders&action=edit&id=' . $order->get_id() ),
		);
		wp_mail( $emails, $subject, implode( "\n", $lines ) );
	}

	/* Optional WhatsApp ping via CallMeBot (unofficial, best-effort; email
	 * above is the reliable channel). Dormant until phone + key are set. */
	if ( $settings['whatsapp_phone'] && $settings['callmebot_key'] ) {
		$text = sprintf(
			'Createch: %s order #%s %s via %s%s — %s %s',
			$label, $order->get_order_number(), $total, $method,
			$receipt ? ' (' . $receipt . ')' : '',
			$name, $phone
		);
		$url = 'https://api.callmebot.com/whatsapp.php?' . http_build_query(
			array(
				'phone'  => $settings['whatsapp_phone'],
				'text'   => $text,
				'apikey' => $settings['callmebot_key'],
			)
		);
		$response = wp_remote_get( $url, array( 'timeout' => 10 ) );
		if ( is_wp_error( $response ) ) {
			$order->add_order_note( 'WhatsApp alert failed: ' . $response->get_error_message() );
		}
	}

	$order->add_order_note( 'Owner alert sent (' . implode( ' + ', array_filter( array(
		$emails ? 'email' : '',
		( $settings['whatsapp_phone'] && $settings['callmebot_key'] ) ? 'WhatsApp' : '',
	) ) ) . ').' );
}

/* ── Settings page (Settings → Order Alerts) ───────────────────────────── */

add_action( 'admin_menu', function () {
	add_options_page( 'Order Alerts', 'Order Alerts', 'manage_woocommerce', 'createch-order-alerts', 'createch_alerts_page' );
} );

add_action( 'admin_init', function () {
	register_setting( 'createch_order_alerts', CREATECH_ALERTS_OPTION, array(
		'type'              => 'array',
		'sanitize_callback' => function ( $value ) {
			return array(
				'emails'         => sanitize_text_field( $value['emails'] ?? '' ),
				'whatsapp_phone' => preg_replace( '/[^0-9+]/', '', $value['whatsapp_phone'] ?? '' ),
				'callmebot_key'  => sanitize_text_field( $value['callmebot_key'] ?? '' ),
			);
		},
	) );
} );

function createch_alerts_page() {
	$s = createch_alerts_settings();
	?>
	<div class="wrap">
		<h1>Createch Order Alerts</h1>
		<p>Fires once per order when it becomes paid (processing), needs review (on-hold), or completed. Email is always sent when recipients are set; WhatsApp needs the CallMeBot fields (send "I allow callmebot to send me messages" to CallMeBot's bot number from your WhatsApp to get an API key).</p>
		<form method="post" action="options.php">
			<?php settings_fields( 'createch_order_alerts' ); ?>
			<table class="form-table">
				<tr>
					<th scope="row"><label for="ca-emails">Alert email(s)</label></th>
					<td>
						<input type="text" class="regular-text" id="ca-emails" name="<?php echo esc_attr( CREATECH_ALERTS_OPTION ); ?>[emails]" value="<?php echo esc_attr( $s['emails'] ); ?>">
						<p class="description">Comma-separated.</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="ca-phone">WhatsApp number</label></th>
					<td>
						<input type="text" class="regular-text" id="ca-phone" name="<?php echo esc_attr( CREATECH_ALERTS_OPTION ); ?>[whatsapp_phone]" value="<?php echo esc_attr( $s['whatsapp_phone'] ); ?>" placeholder="+2547XXXXXXXX">
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="ca-key">CallMeBot API key</label></th>
					<td>
						<input type="text" class="regular-text" id="ca-key" name="<?php echo esc_attr( CREATECH_ALERTS_OPTION ); ?>[callmebot_key]" value="<?php echo esc_attr( $s['callmebot_key'] ); ?>">
					</td>
				</tr>
			</table>
			<?php submit_button( 'Save Alert Settings' ); ?>
		</form>
	</div>
	<?php
}
