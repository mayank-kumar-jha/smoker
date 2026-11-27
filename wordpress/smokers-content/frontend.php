<?php
defined('ABSPATH') || exit;
function smokers_active_theme() { return get_template() === 'smokers-theme'; }
function smokers_page_data() {
    static $page;if($page)return $page;
    $manifest=smokers_manifest();$route=get_post_meta(get_queried_object_id(),'_smokers_route',true);
    if(is_404())return $page=$manifest['pages']['/404.html'];
    if(isset($manifest['pages'][$route]))return $page=$manifest['pages'][$route];
    $lang=smokers_lang();$page=$manifest['pages']['/'.$lang.'/blog/'];
    $page['mode']='native';$page['title']=is_singular()?get_the_title().' | Smokers':wp_strip_all_tags(get_the_archive_title()).' | Smokers';
    $page['description']=is_singular()?wp_strip_all_tags(get_the_excerpt()):get_bloginfo('description');$page['schema']=[];
    return $page;
}
function smokers_route_url($route){
    $front=(int)get_option('page_on_front');
    return get_option('show_on_front')==='page'&&get_post_meta($front,'_smokers_route',true)===$route?home_url('/'):home_url($route);
}
add_action('template_redirect',function(){
    if(!smokers_active_theme())return;
    $path='/'.trim(substr(wp_parse_url($_SERVER['REQUEST_URI'],PHP_URL_PATH),strlen(untrailingslashit(wp_parse_url(home_url('/'),PHP_URL_PATH)?:''))),'/').'/';
    if(is_404()&&isset(smokers_manifest()['redirects'][$path])){wp_safe_redirect(home_url(smokers_manifest()['redirects'][$path]),301);exit;}
    if(!is_404()&&is_page()&&get_post_meta(get_queried_object_id(),'_smokers_managed',true)&&!get_post_meta(get_queried_object_id(),'_smokers_route',true)){
        $home=['es'=>'/es/en-casa/','ca'=>'/ca/a-casa/','en'=>'/en/at-home/'][smokers_lang()];wp_safe_redirect(home_url($home),301);exit;
    }
});
// Unknown paths must stay 404s; WordPress's best-guess redirects can hide bad URLs.
add_filter('redirect_canonical',function($redirect){return smokers_active_theme()&&is_404()?false:$redirect;});
add_filter('pre_get_document_title',function($title){if(!smokers_active_theme()||is_admin())return $title;if(is_singular('post'))return get_the_title().' | Smokers';return html_entity_decode(smokers_tokens(smokers_page_data()['title'],smokers_page_data()['lang']),ENT_QUOTES,'UTF-8');});
function smokers_runtime($page){
    $cache_key='smokers_runtime_'.substr(hash('sha256',smokers_revision().$page['lang']),0,32);
    $cached=get_transient($cache_key);
    if(is_array($cached))return $cached+['nonce'=>wp_create_nonce('smokers_contact')];
    $manifest=smokers_manifest();$settings=smokers_settings();$text=[];$links=[];$media=[];
    foreach($manifest['text'][$page['lang']]as $key=>$field){$value=smokers_text($key,$page['lang']);if($value!==$field['value'])$text[$field['value']]=$value;}
    foreach($manifest['links']as $key=>$field)$links[$field['value']]=$settings['links'][$key]??$field['value'];
    foreach($manifest['images']as $name=>$field)$media[$name]=smokers_media($name);
    foreach($manifest['mediaAliases']??[]as $name=>$field)$media[$name]=smokers_media($name);
    $cached=['imageAttributes'=>smokers_media_attributes(),'labels'=>$manifest['formCopy'][$page['lang']],'text'=>$text,'links'=>$links,'media'=>$media,'home'=>untrailingslashit(home_url('/')),'assets'=>get_template_directory_uri().'/dist/assets/','ajax'=>admin_url('admin-ajax.php'),'language'=>$page['lang']];
    set_transient($cache_key,$cached,HOUR_IN_SECONDS);
    return $cached+['nonce'=>wp_create_nonce('smokers_contact')];
}
add_action('wp_enqueue_scripts',function(){
    if(!smokers_active_theme())return;
    $page=smokers_page_data();$base=get_template_directory_uri().'/dist/';$version=(string)max(filemtime(__DIR__.'/runtime.js'),filemtime(get_template_directory().'/dist/app.js'),filemtime(get_template_directory().'/dist/orbit-menu.js'),filemtime(get_template_directory().'/dist/pro-showcase.js'));
    $uploads=wp_upload_dir();$folder=$uploads['basedir'].'/smokers';
    $styleMode=in_array($page['mode'],['casa','flavour'],true)?'casa':(in_array($page['mode'],['profesional','method'],true)?'profesional':'support');
    $name='styles-'.substr(hash('sha256',wp_json_encode([smokers_settings()['media']??[],get_option('smokers_media_revision','0'),smokers_manifest()['build']??$version,smokers_asset_base(),$styleMode])),0,16).'.css';
    if(!file_exists($folder.'/'.$name)){
        wp_mkdir_p($folder);$css=smokers_tokens(file_get_contents(get_template_directory().'/dist/styles-'.$styleMode.'.template.css'),$page['lang']);
        if(!function_exists('wp_tempnam'))require_once ABSPATH.'wp-admin/includes/file.php';
        $temp=wp_tempnam($name,$folder);if($temp){file_put_contents($temp,$css);rename($temp,$folder.'/'.$name);}
    }
    wp_enqueue_style('smokers-site',$uploads['baseurl'].'/smokers/'.$name,[],$version);
    wp_add_inline_style('smokers-site','.ss-wp-blog{max-width:1100px;margin:auto;padding:140px 24px 80px}.ss-wp-blog img{height:auto;max-width:100%}.ss-wp-blog article{margin-bottom:48px}.ss-wp-blog h1,.ss-wp-blog h2{margin-bottom:24px!important}.ss-wp-blog p{margin-bottom:20px!important}.ss-wp-blog a{text-decoration:underline!important}.ss-form-trap{position:absolute!important;left:-10000px!important;width:1px;height:1px;overflow:hidden}');
    foreach(['loader','pro-loader']as $file)wp_enqueue_script('smokers-'.$file,$base.$file.'.js',[],$version,false);
    wp_add_inline_script('smokers-loader','window.SMOKERS_BOOT_MODE='.wp_json_encode($page['mode']).';','before');
    $data=['data','routes','hub','pages','home-hero','flavour-pages','method-page','brand-fire','b2c-scroll'];
    foreach($data as $file)wp_enqueue_script('smokers-'.$file,$base.$file.'.js',[],$version,['in_footer'=>true,'strategy'=>'defer']);
    wp_enqueue_script('smokers-content-runtime',plugins_url('runtime.js',__FILE__),array_map(fn($v)=>'smokers-'.$v,$data),$version,['in_footer'=>true,'strategy'=>'defer']);
    wp_add_inline_script('smokers-content-runtime','window.SMOKERS_WP='.wp_json_encode(smokers_runtime($page),JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT).';window.SMOKERS_PAGE='.wp_json_encode(array_diff_key($page,['html'=>true,'title'=>true,'description'=>true,'schema'=>true])).';','before');
    wp_enqueue_script('smokers-app',$base.'app.js',['smokers-content-runtime'],$version,['in_footer'=>true,'strategy'=>'defer']);
    if($page['mode']==='casa')wp_enqueue_script('smokers-hero-text',$base.'hero-text.js',['smokers-app'],$version,['in_footer'=>true,'strategy'=>'defer']);
});
add_action('wp_head',function(){
    if(!smokers_active_theme())return;$page=smokers_page_data();$manifest=smokers_manifest();
    if(!defined('WPSEO_VERSION')&&!defined('RANK_MATH_VERSION')){
        $description=is_singular('post')?wp_strip_all_tags(get_the_excerpt()):html_entity_decode(smokers_tokens($page['description'],$page['lang']),ENT_QUOTES,'UTF-8');
        echo '<meta name="description" content="'.esc_attr($description).'"><meta property="og:title" content="'.esc_attr(wp_get_document_title()).'"><meta property="og:description" content="'.esc_attr($description).'"><meta property="og:image" content="'.esc_url(smokers_media('og-smokers.jpg')).'"><meta property="og:type" content="'.(is_singular('post')?'article':'website').'"><meta property="og:url" content="'.esc_url(get_permalink()).'"><meta name="twitter:card" content="summary_large_image">';
    }
    if($page['mode']!=='native'&&!is_404())foreach($manifest['pages']as $route=>$other)if($other['mode']===$page['mode']&&($other['flavour']??null)===($page['flavour']??null))echo '<link rel="alternate" hreflang="'.esc_attr($other['lang']).'" href="'.esc_url(smokers_route_url($route)).'">';
    if(!defined('WPSEO_VERSION')&&!defined('RANK_MATH_VERSION')&&$page['mode']!=='native'&&!is_404()){
        $translate=function($value)use(&$translate,$page,$manifest){
            if(is_array($value))return array_map($translate,$value);
            if(!is_string($value))return $value;
            if(str_starts_with($value,$manifest['origin'].'/assets/'))return smokers_media(substr($value,strlen($manifest['origin'].'/assets/')));
            $key=substr(hash('sha256',trim($value)),0,20);
            if(isset($manifest['text'][$page['lang']][$key]))return smokers_text($key,$page['lang']);
            return str_replace($manifest['origin'],untrailingslashit(home_url('/')),$value);
        };
        echo '<script type="application/ld+json">'.wp_json_encode($translate($page['schema']),JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT).'</script>';
    }
    echo '<link rel="icon" href="'.esc_url(smokers_media('favicon.svg')).'"><meta name="theme-color" content="#120d0a">';
},5);
function smokers_blog($lang){
    $language_query=$lang==='es'?['relation'=>'OR',['key'=>'_smokers_language','value'=>'es'],['key'=>'_smokers_language','compare'=>'NOT EXISTS']]:[['key'=>'_smokers_language','value'=>$lang]];
    $query=new WP_Query(['post_type'=>'post','posts_per_page'=>10,'paged'=>max(1,absint(get_query_var('paged'))),'meta_query'=>$language_query]);
    if(!$query->have_posts())return '';
    ob_start();echo '<section class="ss-wp-blog" aria-label="Blog">';
    while($query->have_posts()){$query->the_post();echo '<article><a href="'.esc_url(get_permalink()).'">';the_post_thumbnail('large',['loading'=>'lazy']);echo '<h2>'.esc_html(get_the_title()).'</h2></a><p>'.esc_html(get_the_excerpt()).'</p></article>';}
    echo wp_kses_post(paginate_links(['total'=>$query->max_num_pages]));echo '</section>';wp_reset_postdata();return ob_get_clean();
}
function smokers_render_page(){
    $page=smokers_page_data();$key='smokers_html_'.substr(hash('sha256',smokers_revision().$page['path'].$page['lang']),0,32);
    $html=get_transient($key);if(false===$html){$template=smokers_page_template($page);$html=smokers_responsive_html(smokers_tokens($template['html'],$page['lang']));set_transient($key,$html,HOUR_IN_SECONDS);}
    if(is_singular('post')||(!get_post_meta(get_queried_object_id(),'_smokers_managed',true)&&!is_404())){
        ob_start();echo '<main id="ss-main" class="ss-wp-blog">';while(have_posts()){the_post();echo '<article><h1>'.esc_html(get_the_title()).'</h1>';the_post_thumbnail('large');the_content();echo '</article>';}echo '</main>';$main=ob_get_clean();$html=preg_replace('/<main\b[^>]*>[\s\S]*?<\/main>/',$main,$html,1);
    }elseif($page['mode']==='blog'){$blog=smokers_blog($page['lang']);if($blog)$html=preg_replace('/<section class="ss-blog-empty">[\s\S]*?<\/section>/',$blog,$html,1);}
    ?><!doctype html><html lang="<?php echo esc_attr($page['lang']); ?>"><head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1"><?php wp_head(); ?></head><body <?php body_class(); ?>><?php wp_body_open(); ?><div id="smokers-site" lang="<?php echo esc_attr($page['lang']); ?>" data-mode="<?php echo esc_attr($page['mode']); ?>"><?php echo $html; /* Trusted compiled templates; all editable substitutions are escaped above. */ ?></div><?php wp_footer(); ?></body></html><?php
}
