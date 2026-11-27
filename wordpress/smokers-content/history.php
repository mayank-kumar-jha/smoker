<?php
defined('ABSPATH') || exit;
function smokers_settings_signature(){return hash('sha256',wp_json_encode(smokers_settings()));}
function smokers_check_edit_version(){
    $version=sanitize_text_field(wp_unslash($_POST['smokers_version']??''));
    if(!$version||!hash_equals(smokers_settings_signature(),$version))wp_die('Content changed after you opened this form. Reload the editor before saving to avoid overwriting another edit.','Update conflict',['response'=>409,'back_link'=>true]);
}
add_action('update_option_smokers_content',function($old,$new){
    if($old===$new)return;$history=get_option('smokers_history',[]);
    array_unshift($history,['time'=>time(),'user'=>get_current_user_id(),'settings'=>$old]);
    update_option('smokers_history',array_slice($history,0,20),false);
},10,2);
add_action('admin_menu',function(){add_submenu_page('smokers-content','Content history','Content history','manage_options','smokers-history',function(){
    if(!current_user_can('manage_options'))return;
    echo '<div class="wrap"><h1>Content history</h1><p>The last 20 saved content states. Restoring creates a new history entry, so it can be undone. This restores text, media selections and links; uploaded files are retained.</p>';
    foreach(get_option('smokers_history',[])as $i=>$entry){echo '<form method="post" action="'.esc_url(admin_url('admin-post.php')).'">';wp_nonce_field('smokers_restore');echo '<input type="hidden" name="action" value="smokers_restore"><input type="hidden" name="entry" value="'.absint($i).'"><input type="hidden" name="smokers_version" value="'.esc_attr(smokers_settings_signature()).'"><p>'.esc_html(wp_date('Y-m-d H:i:s',$entry['time'])).' — user '.absint($entry['user']).' <button class="button">Restore this version</button></p></form>';}
    echo '</div>';
});});
add_action('admin_post_smokers_restore',function(){
    if(!current_user_can('manage_options'))wp_die('Forbidden','',['response'=>403]);check_admin_referer('smokers_restore');smokers_check_edit_version();
    $entry=get_option('smokers_history',[])[absint($_POST['entry']??-1)]??null;
    if(!$entry)wp_die('This version is no longer available.');
    update_option('smokers_content',$entry['settings'],false);wp_safe_redirect(admin_url('admin.php?page=smokers-history'));exit;
});
