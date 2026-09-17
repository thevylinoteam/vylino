<?php

defined( 'ABSPATH' ) || exit;

class Vylino_WA_Repository {
    private $wpdb; private $prefix;
    public function __construct(){ global $wpdb; $this->wpdb=$wpdb; $this->prefix=$wpdb->prefix.'vylino_wa_'; }
    public function upsert_contact($wa_id,$profile_name='',$phone=''){
        $wa_id=sanitize_text_field($wa_id); if(''===$wa_id){return 0;} $now=current_time('mysql',true);
        $id=(int)$this->wpdb->get_var($this->wpdb->prepare("SELECT id FROM {$this->prefix}contacts WHERE wa_id = %s LIMIT 1",$wa_id));
        $data=array('phone'=>Vylino_WA_Security::clean_phone($phone?:$wa_id),'profile_name'=>sanitize_text_field($profile_name),'updated_at'=>$now);
        if($id){$this->wpdb->update($this->prefix.'contacts',$data,array('id'=>$id));return $id;}
        $data['wa_id']=$wa_id;$data['created_at']=$now;$this->wpdb->insert($this->prefix.'contacts',$data);return (int)$this->wpdb->insert_id;
    }
    public function get_or_create_open_conversation($contact_id){
        $id=(int)$this->wpdb->get_var($this->wpdb->prepare("SELECT id FROM {$this->prefix}conversations WHERE contact_id = %d AND status = 'open' ORDER BY id DESC LIMIT 1",$contact_id)); if($id){return $id;}
        $now=current_time('mysql',true);$this->wpdb->insert($this->prefix.'conversations',array('contact_id'=>$contact_id,'state'=>'ai','status'=>'open','priority'=>'normal','ai_enabled'=>1,'created_at'=>$now,'updated_at'=>$now,'last_message_at'=>$now));return (int)$this->wpdb->insert_id;
    }
    public function get_conversation($conversation_id){return $this->wpdb->get_row($this->wpdb->prepare("SELECT * FROM {$this->prefix}conversations WHERE id = %d",$conversation_id),ARRAY_A);}
    public function save_message(array $data){
        $wa_message_id=sanitize_text_field($data['wa_message_id']??'');
        if($wa_message_id){$exists=(int)$this->wpdb->get_var($this->wpdb->prepare("SELECT id FROM {$this->prefix}messages WHERE wa_message_id = %s LIMIT 1",$wa_message_id));if($exists){return $exists;}}
        $row=array('conversation_id'=>absint($data['conversation_id']??0),'contact_id'=>absint($data['contact_id']??0),'wa_message_id'=>$wa_message_id,'direction'=>in_array($data['direction']??'',array('in','out'),true)?$data['direction']:'in','sender_type'=>sanitize_key($data['sender_type']??'customer'),'message_type'=>sanitize_key($data['message_type']??'text'),'body'=>isset($data['body'])?wp_kses_post($data['body']):'','payload_json'=>isset($data['payload'])?wp_json_encode($data['payload']):null,'status'=>sanitize_key($data['status']??''),'created_at'=>current_time('mysql',true));
        $this->wpdb->insert($this->prefix.'messages',$row);$id=(int)$this->wpdb->insert_id;
        if($row['conversation_id']){$this->wpdb->update($this->prefix.'conversations',array('last_message_at'=>$row['created_at'],'updated_at'=>$row['created_at']),array('id'=>$row['conversation_id']));}return $id;
    }
    public function set_human_handoff($conversation_id,$reason,$user_id=0){$now=current_time('mysql',true);$this->wpdb->update($this->prefix.'conversations',array('state'=>'human','ai_enabled'=>0,'handoff_reason'=>sanitize_text_field($reason),'assigned_user_id'=>absint($user_id),'updated_at'=>$now),array('id'=>absint($conversation_id)));$this->log_event($conversation_id,'human_handoff',array('reason'=>$reason),$user_id);}
    public function release_to_ai($conversation_id,$user_id=0){$now=current_time('mysql',true);$this->wpdb->update($this->prefix.'conversations',array('state'=>'ai','ai_enabled'=>1,'handoff_reason'=>'','assigned_user_id'=>0,'updated_at'=>$now),array('id'=>absint($conversation_id)));$this->log_event($conversation_id,'released_to_ai',array(),$user_id);}
    public function log_event($conversation_id,$type,array $meta=array(),$actor_user_id=0,$contact_id=0){$this->wpdb->insert($this->prefix.'events',array('contact_id'=>absint($contact_id),'conversation_id'=>absint($conversation_id),'event_type'=>sanitize_key($type),'actor_user_id'=>absint($actor_user_id),'meta_json'=>wp_json_encode($meta),'created_at'=>current_time('mysql',true)));}
    public function recent_conversations($limit=50){$limit=max(1,min(200,absint($limit)));return $this->wpdb->get_results($this->wpdb->prepare("SELECT c.*,ct.profile_name,ct.phone,ct.wa_id FROM {$this->prefix}conversations c INNER JOIN {$this->prefix}contacts ct ON ct.id=c.contact_id ORDER BY COALESCE(c.last_message_at,c.created_at) DESC LIMIT %d",$limit),ARRAY_A);}
    public function get_messages($conversation_id,$limit=100){$limit=max(1,min(500,absint($limit)));return $this->wpdb->get_results($this->wpdb->prepare("SELECT * FROM {$this->prefix}messages WHERE conversation_id = %d ORDER BY id ASC LIMIT %d",absint($conversation_id),$limit),ARRAY_A);}
    public function get_active_knowledge($limit=25){$limit=max(1,min(100,absint($limit)));return $this->wpdb->get_results($this->wpdb->prepare("SELECT title,category,content,service_url FROM {$this->prefix}knowledge WHERE active = 1 ORDER BY id DESC LIMIT %d",$limit),ARRAY_A);}
}
