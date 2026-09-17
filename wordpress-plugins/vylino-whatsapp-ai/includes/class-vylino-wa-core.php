<?php

defined( 'ABSPATH' ) || exit;
class Vylino_WA_Core {
    public function boot(){$repository=new Vylino_WA_Repository();$client=new Vylino_WA_WhatsApp_Client();$ai=new Vylino_WA_AI_Manager($repository);$router=new Vylino_WA_Router($repository,$client,$ai);$rest=new Vylino_WA_REST($router,$repository,$client);$admin=new Vylino_WA_Admin($repository,$client);add_action('rest_api_init',array($rest,'register_routes'));$admin->register();add_action('vylino_wa_handoff_requested',array($this,'notify_handoff'),10,3);}
    public function notify_handoff($conversation_id,$contact_id,$reason){$admin_email=get_option('admin_email');if(!is_email($admin_email)){return;}$subject=sprintf('[Vylino WhatsApp] Human handoff needed #%d',absint($conversation_id));$body="A WhatsApp conversation needs a human agent.\n\nConversation: #".absint($conversation_id)."\nReason: ".sanitize_text_field($reason)."\n\nOpen: ".admin_url('admin.php?page=vylino-wa-inbox&conversation='.absint($conversation_id));wp_mail($admin_email,$subject,$body);}
}
