<?php
defined('ABSPATH') || exit;
function smokers_contact(){
    if(!check_ajax_referer('smokers_contact','nonce',false))wp_send_json_error(['message'=>'Your session expired. Refresh the page and try again.'],403);
    if(!empty($_POST['website']))wp_send_json_error(['message'=>'Unable to send this request.'],400);
    $email=sanitize_email(wp_unslash($_POST['email']??''));$name=sanitize_text_field(wp_unslash($_POST['name']??''));$message=sanitize_textarea_field(wp_unslash($_POST['message']??''));
    if(!is_email($email)||!$name||strlen($name)>150||strlen($message)<5||strlen($message)>12000||empty($_POST['consent']))wp_send_json_error(['message'=>'Check your name, email, message and privacy consent.'],400);
    $key='smokers_mail_'.hash_hmac('sha256',$_SERVER['REMOTE_ADDR']??'unknown',wp_salt());$count=(int)get_transient($key);if($count>=5)wp_send_json_error(['message'=>'Please wait a few minutes before trying again.'],429);
    set_transient($key,$count+1,10*MINUTE_IN_SECONDS);
    $recipient=smokers_settings()['recipient']??get_option('admin_email');
    $sent=wp_mail($recipient,'Smokers website enquiry',"Name: $name\nEmail: $email\n\n$message",['Reply-To: '.$email]);
    if(!$sent)wp_send_json_error(['message'=>'We could not send your message. Please try again or use the contact email.'],503);
    wp_send_json_success(['message'=>'Your message has been submitted.']);
}
add_action('wp_ajax_smokers_contact','smokers_contact');add_action('wp_ajax_nopriv_smokers_contact','smokers_contact');
