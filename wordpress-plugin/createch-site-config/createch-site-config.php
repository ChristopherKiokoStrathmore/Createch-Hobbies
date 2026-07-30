<?php
/**
 * Plugin Name: Createch Site Config
 * Plugin URI:  https://createch-hobbies.co.ke
 * Description: Durable storage for the Next.js storefront's site configuration (all editable copy, colours and section settings from /admin/editor). Stores one JSON blob in a WordPress option and serves it over a secret-gated REST route. This exists because the storefront previously wrote its config to /tmp on a serverless host, where it was per-instance and wiped on every deploy — saved edits silently vanished. WordPress is already the store's system of record and is already backed up, so the config lives here with everything else. Configure the shared key under Settings → Site Config.
 * Version:     1.0.0
 * Author:      Createch Hobbies
 * License:     GPL-2.0+
 */

defined( 'ABSPATH' ) || exit;

const CRTCH_CFG_OPTION     = 'createch_site_config';
const CRTCH_CFG_SECRET_OPT = 'createch_site_config_secret';
const CRTCH_CFG_UPDATED    = 'createch_site_config_updated';

/**
 * The shared key the Next.js server presents. Generated on first use so there is
 * never an install with an empty/blank secret that would leave the route open.
 */
function crtch_cfg_secret() {
	$secret = get_option( CRTCH_CFG_SECRET_OPT, '' );
	if ( ! is_string( $secret ) || strlen( $secret ) < 32 ) {
		$secret = wp_generate_password( 48, false, false );
		update_option( CRTCH_CFG_SECRET_OPT, $secret, false );
	}
	return $secret;
}

/**
 * Constant-time comparison of the presented key against the stored one.
 * Fails closed: a missing header is never treated as a match.
 */
function crtch_cfg_authorised( WP_REST_Request $req ) {
	$provided = (string) $req->get_header( 'x-createch-key' );
	if ( '' === $provided ) {
		return false;
	}
	return hash_equals( crtch_cfg_secret(), $provided );
}

function crtch_cfg_permission( WP_REST_Request $req ) {
	if ( crtch_cfg_authorised( $req ) ) {
		return true;
	}
	return new WP_Error(
		'crtch_cfg_forbidden',
		'Invalid or missing key.',
		array( 'status' => 401 )
	);
}

/* ── REST routes ──────────────────────────────────────────────────────────── */

add_action( 'rest_api_init', function () {
	register_rest_route( 'createch/v1', '/site-config', array(
		array(
			'methods'             => 'GET',
			'callback'            => 'crtch_cfg_get',
			'permission_callback' => 'crtch_cfg_permission',
		),
		array(
			// PUT is the semantically correct verb; POST is accepted too because
			// some hosts and WAFs quietly drop PUT on /wp-json.
			'methods'             => array( 'PUT', 'POST' ),
			'callback'            => 'crtch_cfg_put',
			'permission_callback' => 'crtch_cfg_permission',
		),
	) );
} );

function crtch_cfg_get() {
	$raw = get_option( CRTCH_CFG_OPTION, '' );

	// An unset option means "never saved" — answer with an empty config rather
	// than an error, so a fresh install falls back to the storefront's own
	// defaults instead of rendering nothing.
	$config = ( is_string( $raw ) && '' !== $raw ) ? json_decode( $raw, true ) : null;
	if ( ! is_array( $config ) ) {
		$config = new stdClass();
	}

	return new WP_REST_Response( array(
		'config'    => $config,
		'updatedAt' => get_option( CRTCH_CFG_UPDATED, null ),
	), 200 );
}

function crtch_cfg_put( WP_REST_Request $req ) {
	$body = $req->get_json_params();

	// The storefront sends { config: {...} }. Reject anything else outright:
	// storing a non-object would break every read that follows.
	if ( ! is_array( $body ) || ! isset( $body['config'] ) || ! is_array( $body['config'] ) ) {
		return new WP_Error(
			'crtch_cfg_bad_body',
			'Expected a JSON body of the form { "config": { ... } }.',
			array( 'status' => 400 )
		);
	}

	$json = wp_json_encode( $body['config'] );
	if ( false === $json ) {
		return new WP_Error(
			'crtch_cfg_unencodable',
			'Configuration could not be encoded as JSON.',
			array( 'status' => 400 )
		);
	}

	// autoload = false: this blob is only read by the REST route, so there is no
	// reason to load it into memory on every single WordPress page request.
	update_option( CRTCH_CFG_OPTION, $json, false );
	update_option( CRTCH_CFG_UPDATED, gmdate( 'c' ), false );

	return new WP_REST_Response( array(
		'ok'        => true,
		'bytes'     => strlen( $json ),
		'updatedAt' => get_option( CRTCH_CFG_UPDATED ),
	), 200 );
}

/* ── Settings screen ──────────────────────────────────────────────────────── */

add_action( 'admin_menu', function () {
	add_options_page(
		'Site Config',
		'Site Config',
		'manage_options',
		'createch-site-config',
		'crtch_cfg_settings_page'
	);
} );

function crtch_cfg_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	// Rotating the key immediately invalidates the storefront's stored copy, so
	// it is deliberately a separate, explicit action rather than a side effect.
	if ( isset( $_POST['crtch_cfg_rotate'] ) && check_admin_referer( 'crtch_cfg_rotate' ) ) {
		delete_option( CRTCH_CFG_SECRET_OPT );
		crtch_cfg_secret();
		echo '<div class="notice notice-warning"><p><strong>Key rotated.</strong> Update SITE_CONFIG_SECRET in the storefront environment and redeploy, or saving from /admin/editor will stop working.</p></div>';
	}

	$secret  = crtch_cfg_secret();
	$updated = get_option( CRTCH_CFG_UPDATED, '' );
	$raw     = get_option( CRTCH_CFG_OPTION, '' );
	$bytes   = is_string( $raw ) ? strlen( $raw ) : 0;
	?>
	<div class="wrap">
		<h1>Site Config</h1>
		<p>The Next.js storefront stores all its editable copy here. You do not need to edit anything on this page day to day — use <strong>/admin/editor</strong> on the storefront.</p>

		<table class="form-table" role="presentation">
			<tr>
				<th scope="row">Shared key</th>
				<td>
					<input type="text" readonly class="regular-text code" style="width:32em"
						value="<?php echo esc_attr( $secret ); ?>"
						onfocus="this.select()" />
					<p class="description">
						Copy this into the storefront environment as <code>SITE_CONFIG_SECRET</code>.
						Anyone holding it can read and overwrite your site copy — treat it like a password.
					</p>
				</td>
			</tr>
			<tr>
				<th scope="row">REST endpoint</th>
				<td><code><?php echo esc_html( rest_url( 'createch/v1/site-config' ) ); ?></code></td>
			</tr>
			<tr>
				<th scope="row">Stored configuration</th>
				<td>
					<?php if ( $bytes > 0 ) : ?>
						<?php echo esc_html( number_format_i18n( $bytes ) ); ?> bytes,
						last saved <?php echo $updated ? esc_html( $updated ) : 'unknown'; ?>
					<?php else : ?>
						<em>Nothing saved yet — the storefront is using its built-in defaults.</em>
					<?php endif; ?>
				</td>
			</tr>
		</table>

		<h2>Rotate the key</h2>
		<p>Only if the key has leaked. Saving from the storefront breaks until you update its environment variable and redeploy.</p>
		<form method="post">
			<?php wp_nonce_field( 'crtch_cfg_rotate' ); ?>
			<button type="submit" name="crtch_cfg_rotate" value="1" class="button"
				onclick="return confirm('Rotate the key? Saving from /admin/editor will fail until the storefront environment is updated and redeployed.');">
				Rotate key
			</button>
		</form>
	</div>
	<?php
}
