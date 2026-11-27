<?php
defined('ABSPATH') || exit;
// A replacement can change dimensions or URLs without changing its attachment ID.
function smokers_invalidate_media_cache(){update_option('smokers_media_revision',wp_generate_uuid4(),false);}
add_action('edit_attachment','smokers_invalidate_media_cache');
add_action('delete_attachment','smokers_invalidate_media_cache');
add_filter('wp_update_attachment_metadata',function($metadata){smokers_invalidate_media_cache();return $metadata;});
function smokers_media_attributes(){
    static $attributes;if(isset($attributes))return $attributes;$attributes=[];
    $manifest=smokers_manifest();$settings=smokers_settings();
    foreach(array_keys(($manifest['images']??[])+($manifest['mediaAliases']??[]))as $name){
        $field=$manifest['mediaAliases'][$name]??$name;$id=absint($settings['media'][$field]??0);
        if(!$id||!wp_attachment_is_image($id))continue;
        $size=$manifest['mediaWidths'][$name]??(str_contains($name,'-thumb.')?160:1200);
        $image=wp_get_attachment_image_src($id,[$size,$size]);if(!$image)continue;
        $attributes[smokers_media($name)]=['width'=>$image[1],'height'=>$image[2],'srcSet'=>wp_get_attachment_image_srcset($id,'full')?:'','sizes'=>'(max-width: 700px) 100vw, 50vw'];
    }
    return $attributes;
}
function smokers_responsive_html($html){
    $attributes=smokers_media_attributes();if(!$attributes)return $html;
    $tags=new WP_HTML_Tag_Processor($html);
    while($tags->next_tag('IMG')){
        $data=$attributes[$tags->get_attribute('src')]??null;if(!$data)continue;
        foreach(['width','height']as $key)$tags->set_attribute($key,$data[$key]);
        if($data['srcSet']){$tags->set_attribute('srcset',$data['srcSet']);if(!$tags->get_attribute('sizes'))$tags->set_attribute('sizes',$data['sizes']);}
        else $tags->remove_attribute('srcset');
    }
    return $tags->get_updated_html();
}
// Keep all replacement images bounded; WordPress retains the original in Media Library.
add_filter('big_image_size_threshold',fn()=>2048);
