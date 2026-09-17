<?php

defined( 'ABSPATH' ) || exit;

interface Vylino_WA_AI_Provider {
    public function id();
    public function is_configured();
    public function generate_reply( array $context );
}

class Vylino_WA_AI_None_Provider implements Vylino_WA_AI_Provider {
    public function id() { return 'none'; }
    public function is_configured() { return false; }
    public function generate_reply( array $context ) { return new WP_Error( 'vylino_wa_ai_disabled', __( 'No AI provider is configured.', 'vylino-whatsapp-ai' ) ); }
}
