<?php

defined( 'ABSPATH' ) || exit;

class Vylino_WA_Security {
    public static function verify_meta_signature( $raw_body, $signature_header, $app_secret ) {
        if ( empty( $app_secret ) || empty( $signature_header ) || 0 !== strpos( $signature_header, 'sha256=' ) ) { return false; }
        $provided = substr( $signature_header, 7 );
        $expected = hash_hmac( 'sha256', $raw_body, $app_secret );
        return hash_equals( $expected, $provided );
    }
    public static function clean_phone( $value ) { return preg_replace( '/[^0-9]/', '', (string) $value ); }
}
