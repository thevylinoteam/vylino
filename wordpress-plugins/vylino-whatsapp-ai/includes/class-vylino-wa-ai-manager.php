<?php

defined( 'ABSPATH' ) || exit;
class Vylino_WA_AI_Manager {
    private $repository;
    public function __construct(Vylino_WA_Repository $repository){$this->repository=$repository;}
    public function generate($conversation_id,$customer_message){$settings=get_option('vylino_wa_settings',array());if(empty($settings['ai_enabled'])){return new WP_Error('vylino_wa_ai_disabled',__('AI replies are disabled.','vylino-whatsapp-ai'));}$conversation=$this->repository->get_conversation($conversation_id);if(!$conversation||'human'===$conversation['state']||empty($conversation['ai_enabled'])){return new WP_Error('vylino_wa_human_active',__('This conversation is currently controlled by a human.','vylino-whatsapp-ai'));}$context=array('brand'=>'Vylino','customer_message'=>$customer_message,'conversation'=>$conversation,'messages'=>$this->repository->get_messages($conversation_id,30),'knowledge'=>$this->repository->get_active_knowledge(25));$provider_id=sanitize_key($settings['ai_provider']??'none');if('gemini'===$provider_id){$provider=new Vylino_WA_Gemini_Provider($settings['gemini_api_key']??'',$settings['gemini_model']??'gemini-3.6-flash');$reply=$provider->generate_reply($context);}else{$reply=new WP_Error('vylino_wa_no_provider',__('No AI provider adapter is active.','vylino-whatsapp-ai'));}return apply_filters('vylino_wa_generated_reply',$reply,$context,$provider_id);}
}
