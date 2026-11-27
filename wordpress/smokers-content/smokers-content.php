<?php
/**
 * Plugin Name: Smokers Content
 * Description: Editable multilingual Smokers content, media, native blog and contact delivery.
 * Version: 1.0.0
 * Requires at least: 6.6
 * Requires PHP: 8.1
 */
defined('ABSPATH') || exit;
define('SMOKERS_CONTENT_DIR', __DIR__);
function smokers_manifest() {
    static $manifest;
    if (!$manifest) $manifest = json_decode(file_get_contents(__DIR__ . '/data/'.(file_exists(__DIR__.'/data/index.json')?'index.json':'manifest.json')), true);
    return $manifest;
}
function smokers_settings() { return get_option('smokers_content', []); }
function smokers_lang() {
    $lang = get_post_meta(get_queried_object_id(), '_smokers_language', true);
    return in_array($lang, ['es','ca','en'], true) ? $lang : 'es';
}
function smokers_text($key, $lang) {
    $settings = smokers_settings();
    if(!isset($settings['text'][$lang][$key]))foreach(smokers_manifest()['legacyKeys'][$key]??[]as $old)if(isset($settings['text'][$lang][$old]))return $settings['text'][$lang][$old];
    return $settings['text'][$lang][$key] ?? smokers_manifest()['defaultOverrides'][$lang][$key] ?? smokers_manifest()['text'][$lang][$key]['value'] ?? '';
}
function smokers_media($name) {
    static $resolved=[];
    $settings = smokers_settings();
    $manifest=smokers_manifest();$field=$manifest['mediaAliases'][$name]??$name;
    $attachment = absint($settings['media'][$field] ?? 0);
    $cache=$name.':'.$attachment;if(isset($resolved[$cache]))return $resolved[$cache];
    $default=$manifest['images'][$name]['defaultFile']??$name;
    $size=$manifest['mediaWidths'][$name]??(str_contains($name,'-thumb.')?160:1200);
    $url=$attachment&&wp_attachment_is_image($attachment)?wp_get_attachment_image_url($attachment,[$size,$size]):($attachment?wp_get_attachment_url($attachment):false);
    return $resolved[$cache]=$url ?: smokers_asset_base().rawurlencode($default);
}
function smokers_asset_base(){static $base;return $base??=get_template_directory_uri().'/dist/assets/';}
function smokers_revision(){static $revision;return $revision??=hash('sha256',wp_json_encode([smokers_settings(),smokers_manifest()['build']??'1',get_option('smokers_media_revision','0'),home_url('/'),get_template_directory_uri()]));}
function smokers_page_template($page){
    if(isset($page['htmlFile']))$page['html']=file_get_contents(__DIR__.'/data/'.$page['htmlFile']);
    return $page;
}
function smokers_tokens($source, $lang) {
    $settings = smokers_settings();
    return preg_replace_callback('/\{\{(text|media|asset|link|home)(?::([^}]+))?\}\}/', function ($m) use ($lang, $settings) {
        if ($m[1] === 'text') return esc_html(smokers_text($m[2], $lang));
        if ($m[1] === 'media') return esc_url(smokers_media($m[2]));
        if ($m[1] === 'asset') return esc_url(smokers_asset_base().rawurlencode($m[2]));
        if ($m[1] === 'home') return esc_url(untrailingslashit(home_url('/')));
        return esc_url($settings['links'][$m[2]] ?? smokers_manifest()['links'][$m[2]]['value']);
    }, $source);
}
function smokers_create_pages() {
    $created = 0; $conflicts = [];
    foreach (smokers_manifest()['pages'] as $route => $page) {
        if ($page['mode'] === '404') continue;
        $parts = explode('/', trim($route, '/')); $parent = 0; $prefix = '';
        foreach ($parts as $i => $slug) {
            $prefix .= ($prefix ? '/' : '') . $slug;
            $existing = get_page_by_path($prefix);
            $final = $i === count($parts) - 1;
            if ($existing && !get_post_meta($existing->ID, '_smokers_managed', true)) { $conflicts[] = $prefix; break; }
            $id = $existing ? $existing->ID : wp_insert_post(['post_type'=>'page','post_status'=>'publish','post_parent'=>$parent,'post_name'=>$slug,'post_title'=>$final ? html_entity_decode(smokers_tokens($page['title'],$page['lang']), ENT_QUOTES, 'UTF-8') : strtoupper($slug)], true);
            if (is_wp_error($id)) { $conflicts[] = $prefix; break; }
            if (!$existing) $created++;
            update_post_meta($id, '_smokers_managed', 1);
            update_post_meta($id, '_smokers_language', $page['lang']);
            if ($final) update_post_meta($id, '_smokers_route', $route);
            $parent = $id;
        }
    }
    smokers_seed_dishes();
    flush_rewrite_rules(false);
    return ['created'=>$created,'conflicts'=>array_unique($conflicts)];
}
// Nothing is overwritten or published on plugin activation. Setup is an explicit admin action.
add_action('admin_menu', function () { add_menu_page('Smokers Content','Smokers','edit_pages','smokers-content','smokers_admin','dashicons-food',25); });
add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'toplevel_page_smokers-content') return;
    wp_enqueue_media();
    wp_enqueue_script('smokers-admin', plugins_url('admin.js',__FILE__), ['jquery'], '1.0.0', true);
    wp_enqueue_style('smokers-admin', plugins_url('admin.css',__FILE__), [], '1.0.0');
});
function smokers_admin() {
    if (!current_user_can('edit_pages')) return;
    $manifest = smokers_manifest(); $settings = smokers_settings();
    $tab = sanitize_key($_GET['tab'] ?? 'text');if(!in_array($tab,['text','media','links','delivery'],true))$tab='text';
    $lang = sanitize_key($_GET['lang'] ?? 'es'); if (!in_array($lang,['es','ca','en'],true)) $lang='es';
    $group = sanitize_text_field(wp_unslash($_GET['group'] ?? ''));
    echo '<div class="wrap smokers-admin"><h1>Smokers content</h1><p>Edit content without changing the animated layout. Repeated phrases are shared within each language. Empty text fields are allowed. Use matching crops and transparent backgrounds for plate replacements.</p>';
    if (isset($_GET['saved'])) echo '<div class="notice notice-success"><p>Changes saved.</p></div>';
    if ($result=get_transient('smokers_setup_result_'.get_current_user_id())) { echo '<div class="notice notice-info"><p>'.esc_html(wp_json_encode($result)).'</p></div>';delete_transient('smokers_setup_result_'.get_current_user_id()); }
    echo '<nav class="nav-tab-wrapper">';foreach(['text'=>'Text & translations','media'=>'Images & video','links'=>'Links','delivery'=>'Email & setup'] as $id=>$label)echo '<a class="nav-tab '.($tab===$id?'nav-tab-active':'').'" href="'.esc_url(add_query_arg(['page'=>'smokers-content','tab'=>$id],admin_url('admin.php'))).'">'.esc_html($label).'</a>';echo '</nav>';
    echo '<form method="get"><input type="hidden" name="page" value="smokers-content"><input type="hidden" name="tab" value="'.esc_attr($tab).'">';
    if($tab==='text'){echo '<label>Language <select name="lang">';foreach(['es'=>'Spanish','ca'=>'Catalan','en'=>'English']as $id=>$label)echo '<option value="'.$id.'" '.selected($id,$lang,false).'>'.$label.'</option>';echo '</select></label>';}
    if($tab!=='delivery'){echo ' <label>Search <input name="q" value="'.esc_attr(wp_unslash($_GET['q']??'')).'"></label> <label>Section <select name="group"><option value="">All sections</option>'; $groups=[];foreach($manifest[$tab==='text'?'text':($tab==='media'?'images':'links')][$tab==='text'?$lang:'']??[]as $field) $groups=array_merge($groups,$field['groups']);if($tab!=='text')foreach($manifest[$tab==='media'?'images':'links']as $field)$groups=array_merge($groups,$field['groups']);foreach(array_unique($groups)as $g)echo '<option '.selected($group,$g,false).'>'.esc_html($g).'</option>';echo '</select></label> <button class="button">Filter</button>';}
    echo '</form><form method="post" action="'.esc_url(admin_url('admin-post.php')).'">';wp_nonce_field('smokers_save');echo '<input type="hidden" name="smokers_version" value="'.esc_attr(smokers_settings_signature()).'">';echo '<input type="hidden" name="action" value="smokers_save"><input type="hidden" name="tab" value="'.esc_attr($tab).'"><input type="hidden" name="lang" value="'.esc_attr($lang).'">';
    if ($tab === 'delivery') {
        if (!current_user_can('manage_options')) { echo '<p>Administrator access is required for email and setup.</p></form></div>';return; }
        echo '<p><label>Contact recipient <input type="email" name="recipient" required value="'.esc_attr($settings['recipient']??get_option('admin_email')).'"></label></p><p>Forms use WordPress mail. Configure authenticated email delivery on your host and test receipt before launch. Failed submissions remain visible and can be retried.</p><p><label><input type="checkbox" name="setup" value="1"> Create missing Smokers pages. Existing non-Smokers pages are never overwritten.</label></p><p>The current homepage and domain are not changed. Choose the Smokers homepage under Settings → Reading when ready. Blog articles use Posts; select the article language in its sidebar.</p>';
    } else {
        $fields=$tab==='text'?$manifest['text'][$lang]:($tab==='media'?$manifest['images']:$manifest['links']);
        $query=strtolower(sanitize_text_field(wp_unslash($_GET['q']??'')));
        $fields=array_filter($fields,function($field,$key)use($group,$query){return (!$group||in_array($group,$field['groups'],true))&&(!$query||str_contains(strtolower(($field['value']??$key).' '.implode(' ',$field['groups'])),$query));},ARRAY_FILTER_USE_BOTH);
        $total=count($fields);$number=max(1,absint($_GET['batch']??1));$fields=array_slice($fields,($number-1)*40,40,true);
        echo '<p>'.esc_html($total).' fields. Page '.esc_html($number).'. Save before changing filters or pages.</p><div class="smokers-fields">';
        foreach($fields as $key=>$field){echo '<div class="smokers-field"><small>'.esc_html(implode(' · ',$field['groups'])).'</small>';
            if($tab==='media'){echo '<strong>'.esc_html($key).'</strong><img class="smokers-media-preview" src="'.esc_url(smokers_media($key)).'" alt=""><input class="smokers-media-id" type="hidden" name="values['.esc_attr($key).']" value="'.absint($settings['media'][$key]??0).'"><button type="button" class="button smokers-media-pick">Choose media</button> <button type="button" class="button smokers-media-reset">Restore original</button>';}
            else {$value=$tab==='text'?smokers_text($key,$lang):($settings['links'][$key]??$field['value']);echo '<label><span>'.esc_html($field['value']).'</span><textarea rows="3" name="values['.esc_attr($key).']">'.esc_textarea($value).'</textarea></label>';}
            echo '</div>';
        }echo '</div>';
        echo '<p>';for($i=1;$i<=ceil($total/40);$i++)echo '<a class="button" href="'.esc_url(add_query_arg('batch',$i)).'">'.$i.'</a> ';echo '</p>';
    }
    submit_button('Save changes');echo '</form></div>';
}
add_action('admin_post_smokers_save',function(){
    if(!current_user_can('edit_pages'))wp_die('Forbidden','',['response'=>403]);check_admin_referer('smokers_save');smokers_check_edit_version();
    $tab=sanitize_key($_POST['tab']??'');$lang=sanitize_key($_POST['lang']??'es');$manifest=smokers_manifest();$settings=smokers_settings();
    if($tab==='delivery'){
        if(!current_user_can('manage_options'))wp_die('Forbidden','',['response'=>403]);
        $email=sanitize_email(wp_unslash($_POST['recipient']??''));if(!is_email($email))wp_die('Enter a valid recipient.');$settings['recipient']=$email;
        if(!empty($_POST['setup']))set_transient('smokers_setup_result_'.get_current_user_id(),smokers_create_pages(),60);
    } else foreach((array)($_POST['values']??[])as $key=>$value){
        if($tab==='text'&&isset($manifest['text'][$lang][$key]))$settings['text'][$lang][$key]=sanitize_textarea_field(wp_unslash($value));
        if($tab==='links'&&isset($manifest['links'][$key])){$value=esc_url_raw(wp_unslash($value),['http','https','mailto','tel']);if($value)$settings['links'][$key]=$value;}
        if($tab==='media'&&isset($manifest['images'][$key])){$id=absint($value);if(!$id||preg_match('#^(image|video)/#',(string)get_post_mime_type($id)))$settings['media'][$key]=$id;}
    }
    update_option('smokers_content',$settings,false);
    wp_safe_redirect(add_query_arg('saved',1,wp_get_referer()?:admin_url('admin.php?page=smokers-content')));exit;
});
add_action('add_meta_boxes',function(){
    add_meta_box('smokers-post-language','Smokers language',function($post){wp_nonce_field('smokers_language','smokers_language_nonce');$lang=get_post_meta($post->ID,'_smokers_language',true)?:'es';echo '<select name="smokers_language">';foreach(['es'=>'Spanish','ca'=>'Catalan','en'=>'English']as $id=>$label)echo '<option value="'.$id.'" '.selected($lang,$id,false).'>'.$label.'</option>';echo '</select>';},'post','side');
    add_meta_box('smokers-page-content','Smokers content',function($post){if(get_post_meta($post->ID,'_smokers_managed',true))echo '<p>This page uses the animated Smokers template. <a href="'.esc_url(admin_url('admin.php?page=smokers-content&lang='.get_post_meta($post->ID,'_smokers_language',true))).'">Edit its text and artwork</a>.</p>';else echo '<p>This page is not managed by Smokers.</p>';},'page','side');
});
add_action('save_post_post',function($id){if(wp_is_post_revision($id)||!current_user_can('edit_post',$id)||!wp_verify_nonce($_POST['smokers_language_nonce']??'','smokers_language'))return;$lang=sanitize_key($_POST['smokers_language']??'es');if(in_array($lang,['es','ca','en'],true))update_post_meta($id,'_smokers_language',$lang);});
require_once __DIR__.'/history.php';
require_once __DIR__.'/dishes.php';
require_once __DIR__.'/media.php';
require_once __DIR__.'/frontend.php';
require_once __DIR__.'/mail.php';
