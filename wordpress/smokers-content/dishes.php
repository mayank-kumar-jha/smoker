<?php
defined('ABSPATH') || exit;
add_action('init',function(){register_post_type('smokers_dish',['label'=>'Smokers dishes','public'=>false,'show_ui'=>true,'show_in_menu'=>'smokers-content','supports'=>['title','thumbnail'],'capability_type'=>'page','map_meta_cap'=>true,'capabilities'=>['create_posts'=>'do_not_allow']]);});
function smokers_seed_dishes(){
    foreach(smokers_manifest()['dishes'] as $lang=>$dishes)foreach($dishes as $index=>$dish){
        $key=$lang.'-'.$index;
        if(get_posts(['post_type'=>'smokers_dish','post_status'=>'any','meta_key'=>'_smokers_dish_slot','meta_value'=>$key,'fields'=>'ids','numberposts'=>1]))continue;
        $id=wp_insert_post(['post_type'=>'smokers_dish','post_status'=>'publish','post_title'=>$dish['label']]);
        if($id&&!is_wp_error($id)){update_post_meta($id,'_smokers_dish_slot',$key);update_post_meta($id,'_smokers_language',$lang);}
    }
}
function smokers_dish_source($id){$slot=get_post_meta($id,'_smokers_dish_slot',true);if(!preg_match('/^(en|es|ca)-(\d+)$/',$slot,$matches))return null;return [smokers_manifest()['dishes'][$matches[1]][(int)$matches[2]],$matches[1]];}
add_action('add_meta_boxes',function(){add_meta_box('smokers-dish-fields','Dish content',function($post){
    $source=smokers_dish_source($post->ID);if(!$source)return;[$dish,$lang]=$source;wp_nonce_field('smokers_dish','smokers_dish_nonce');echo '<input type="hidden" name="smokers_version" value="'.esc_attr(smokers_settings_signature()).'">';
    echo '<p>Language: '.esc_html(strtoupper($lang)).'. These fields update the animated menu and its server-rendered pages. The featured image replaces this dish across the site. The eight dish positions remain fixed to preserve the approved layout.</p>';
    foreach(['title'=>'First title line','subtitle'=>'Second title line','label'=>'Thumbnail label','description'=>'Description','ingredientsNote'=>'Ingredients / allergens','alt'=>'Image alternative text','seoDescription'=>'Search description']as $key=>$label){$value=$dish[$key]??'';$id=substr(hash('sha256',trim($value)),0,20);$settings=smokers_settings();$value=$settings['text'][$lang][$id]??$value;echo '<p><label>'.esc_html($label).'<textarea style="display:block;width:100%" rows="3" name="smokers_dish['.esc_attr($key).']">'.esc_textarea($value).'</textarea></label></p>';}
},'smokers_dish','normal','high');});
add_action('save_post_smokers_dish',function($id){
    if(wp_is_post_revision($id)||!current_user_can('edit_post',$id)||!wp_verify_nonce($_POST['smokers_dish_nonce']??'','smokers_dish'))return;
    smokers_check_edit_version();$source=smokers_dish_source($id);if(!$source)return;[$dish,$lang]=$source;$settings=smokers_settings();
    foreach(['title','subtitle','label','description','ingredientsNote','alt','seoDescription']as $field)if(isset($_POST['smokers_dish'][$field],$dish[$field])){$key=substr(hash('sha256',trim($dish[$field])),0,20);$settings['text'][$lang][$key]=sanitize_textarea_field(wp_unslash($_POST['smokers_dish'][$field]));}
    $image=max(0,(int)($_POST['_thumbnail_id']??get_post_thumbnail_id($id)));$name=basename($dish['image']);if($image&&wp_attachment_is_image($image))$settings['media'][$name]=$image;elseif(isset($_POST['_thumbnail_id'])&&!$image)unset($settings['media'][$name]);
    update_option('smokers_content',$settings,false);
});
