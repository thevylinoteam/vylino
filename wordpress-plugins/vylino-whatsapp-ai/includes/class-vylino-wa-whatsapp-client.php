<?php

defined( 'ABSPATH' ) || exit;

class Vylino_WA_WhatsApp_Client {
    private $settings;
    public function __construct() { $this->settings = get_option( 'vylino_wa_settings', array() ); }
    public function is_configured() { return ! empty( $this->settings['phone_number_id'] ) && ! empty( $this->settings['access_token'] ); }
    public function send_text( $to, $text ) {
        if ( ! $this->is_configured() ) { return new WP_Error( 'vylino_wa_not_configured', __( 'WhatsApp Cloud API is not configured.', 'vylino-whatsapp-ai' ) ); }
        $graph_version = sanitize_text_field( $this->settings['graph_version'] ?? 'v23.0' );
        $phone_number_id = rawurlencode( $this->settings['phone_number_id'] );
        $url = "https://graph.facebook.com/{$graph_version}/{$phone_number_id}/messages";
        $response = wp_remote_post( $url, array(
            'timeout' => 20,
            'headers' => array( 'Authorization' => 'Bearer ' . $this->settings['access_token'], 'Content-Type' => 'application/json' ),
            'body' => wp_json_encode( array( 'messaging_product' => 'whatsapp', 'recipient_type' => 'individual', 'to' => Vylino_WA_Security::clean_phone( $to ), 'type' => 'text', 'text' => array( 'preview_url' => false, 'body' => wp_strip_all_tags( $text ) ) ) ),
        ) );
        if ( is_wp_error( $response ) ) { return $response; }
        $code = wp_remote_retrieve_response_code( $response );
        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        if ( $code < 200 || $code >= 300 ) { return new WP_Error( 'vylino_wa_send_failed', __( 'WhatsApp message send failed.', 'vylino-whatsapp-ai' ), $body ); }
        return $body;
    }
}
