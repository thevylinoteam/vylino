<?php
/**
 * Plugin Name:       Vylino WhatsApp AI CRM
 * Plugin URI:        https://www.vylino.com/
 * Description:       WordPress-native WhatsApp Cloud API inbox, CRM, AI routing, lead qualification and human handoff for Vylino.
 * Version:           0.1.0
 * Requires at least: 6.8
 * Requires PHP:      8.1
 * Author:            Archana / Vylino
 * Author URI:        https://www.vylino.com/
 * License:           GPL-3.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain:       vylino-whatsapp-ai
 */

defined( 'ABSPATH' ) || exit;

define( 'VYLINO_WA_VERSION', '0.1.0' );
define( 'VYLINO_WA_FILE', __FILE__ );
define( 'VYLINO_WA_DIR', plugin_dir_path( __FILE__ ) );
define( 'VYLINO_WA_URL', plugin_dir_url( __FILE__ ) );

require_once VYLINO_WA_DIR . 'includes/class-vylino-wa-installer.php';
require_once VYLINO_WA_DIR . 'includes/class-vylino-wa-security.php';
require_once VYLINO_WA_DIR . 'includes/class-vylino-wa-repository.php';
require_once VYLINO_WA_DIR . 'includes/class-vylino-wa-whatsapp-client.php';
require_once VYLINO_WA_DIR . 'includes/class-vylino-wa-ai-provider.php';
require_once VYLINO_WA_DIR . 'includes/class-vylino-wa-ai-manager.php';
require_once VYLINO_WA_DIR . 'includes/class-vylino-wa-router.php';
require_once VYLINO_WA_DIR . 'includes/class-vylino-wa-rest.php';
require_once VYLINO_WA_DIR . 'admin/class-vylino-wa-admin.php';
require_once VYLINO_WA_DIR . 'includes/class-vylino-wa-core.php';

register_activation_hook( __FILE__, array( 'Vylino_WA_Installer', 'activate' ) );

function vylino_wa_bootstrap() {
    static $core = null;

    if ( null === $core ) {
        $core = new Vylino_WA_Core();
        $core->boot();
    }

    return $core;
}

add_action( 'plugins_loaded', 'vylino_wa_bootstrap' );
