<?php

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;
$settings=get_option('vylino_wa_settings',array());if(empty($settings['delete_data_on_uninstall'])){return;}global $wpdb;foreach(array('contacts','conversations','messages','knowledge','deals','followups','events') as $table){$wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}vylino_wa_{$table}");}delete_option('vylino_wa_settings');delete_option('vylino_wa_db_version');
