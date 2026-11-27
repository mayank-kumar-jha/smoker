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
function smokers_pro_dishes($lang){
    $posts=get_posts(['post_type'=>'smokers_pro_dish','post_status'=>'publish','posts_per_page'=>30,'orderby'=>'menu_order date','order'=>'ASC','meta_query'=>$lang==='es'?['relation'=>'OR',['key'=>'_smokers_language','value'=>'es'],['key'=>'_smokers_language','compare'=>'NOT EXISTS']]:[['key'=>'_smokers_language','value'=>$lang]]]);
    $out=[];
    foreach($posts as $p){
        $kicker=get_post_meta($p->ID,'_smokers_pro_kicker',true)?:($lang==='es'?'Sabor de autor':($lang==='ca'?'Sabor d’autor':'Signature flavour'));
        $t1=get_post_meta($p->ID,'_smokers_pro_title_1',true)?:$p->post_title;
        $t2=get_post_meta($p->ID,'_smokers_pro_title_2',true)?:'';
        $desc=get_post_meta($p->ID,'_smokers_pro_desc',true)?:'';
        $f1=get_post_meta($p->ID,'_smokers_pro_fact_1',true)?:($lang==='es'?'Sabor ahumado':($lang==='ca'?'Sabor fumat':'Bold & smoky'));
        $f2=get_post_meta($p->ID,'_smokers_pro_fact_2',true)?:($lang==='es'?'Ahumado lento':($lang==='ca'?'Fumat lent':'Slow smoked'));
        $f3=get_post_meta($p->ID,'_smokers_pro_fact_3',true)?:($lang==='es'?'Sin gluten':($lang==='ca'?'Sense gluten':'Gluten-free'));
        $out[]=[$kicker,$t1,$t2,$desc,$f1,$f2,$f3];
    }
    return $out;
}
function smokers_runtime($page){
    $cache_key='smokers_runtime_'.substr(hash('sha256',smokers_revision().$page['lang']),0,32);
    $cached=get_transient($cache_key);
    if(is_array($cached))return $cached+['nonce'=>wp_create_nonce('smokers_contact')];
    $manifest=smokers_manifest();$settings=smokers_settings();$text=[];$links=[];$media=[];
    foreach($manifest['text'][$page['lang']]as $key=>$field){$value=smokers_text($key,$page['lang']);if($value!==$field['value'])$text[$field['value']]=$value;}
    foreach($manifest['links']as $key=>$field)$links[$field['value']]=$settings['links'][$key]??$field['value'];
    foreach($manifest['images']as $name=>$field)$media[$name]=smokers_media($name);
    foreach($manifest['mediaAliases']??[]as $name=>$field)$media[$name]=smokers_media($name);
    $cached=['imageAttributes'=>smokers_media_attributes(),'labels'=>$manifest['formCopy'][$page['lang']],'text'=>$text,'links'=>$links,'media'=>$media,'proDishes'=>smokers_pro_dishes($page['lang']),'home'=>untrailingslashit(home_url('/')),'assets'=>get_template_directory_uri().'/dist/assets/','ajax'=>admin_url('admin-ajax.php'),'language'=>$page['lang']];
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
    wp_add_inline_style('smokers-site','.ss-wp-blog{max-width:1160px;margin:0 auto;padding:0 6% 84px}.ss-wp-blog-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:28px}.ss-wp-blog-card{display:flex;flex-direction:column;background:#fff9f0;border:1px solid #e4d2bf;border-radius:18px;overflow:hidden;transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease}.ss-wp-blog-card:hover{transform:translateY(-4px);box-shadow:0 18px 36px rgba(42,22,11,.08);border-color:#ff5b00}.ss-wp-blog-media{display:block;aspect-ratio:16/10;overflow:hidden;background:linear-gradient(135deg,#2a160b,#4a2815)}.ss-wp-blog-media img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease}.ss-wp-blog-card:hover .ss-wp-blog-media img{transform:scale(1.03)}.ss-wp-blog-body{display:flex;flex-direction:column;flex:1;padding:24px 24px 26px;gap:12px}.ss-wp-blog-meta{font:700 12px/1.2 SSCondensed,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#c24400}.ss-wp-blog-card h2{font:400 clamp(22px,2vw,28px)/1.2 SSDisplay,Georgia,serif;margin:0;color:#2a160b}.ss-wp-blog-card h2 a{color:inherit;text-decoration:none}.ss-wp-blog-card h2 a:hover{color:#ff5b00}.ss-wp-blog-card p{font:400 15px/1.6 Archivo,sans-serif;color:#5c4333;margin:0;flex:1}.ss-wp-blog-more{display:inline-flex;align-items:center;gap:8px;font:700 13px/1.2 SSCondensed,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#ff5b00;text-decoration:none;margin-top:6px}.ss-wp-blog-pagination{display:flex;gap:10px;justify-content:center;margin-top:44px;flex-wrap:wrap}.ss-wp-blog-pagination :is(a,span){display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:42px;padding:0 14px;border-radius:10px;border:1px solid #d9c4af;font:700 14px Archivo,sans-serif;text-decoration:none;color:#2a160b;background:#fff9f0}.ss-wp-blog-pagination .current{background:#2a160b;color:#fff9f0;border-color:#2a160b}.ss-wp-article{max-width:860px;margin:0 auto;padding:56px 6% 88px}.ss-wp-article-back{display:inline-flex;align-items:center;gap:8px;font:700 13px/1.2 SSCondensed,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#ff5b00;text-decoration:none;margin-bottom:24px}.ss-wp-article-meta{font:700 12px/1.4 SSCondensed,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#7a5943;margin-bottom:14px}.ss-wp-article h1{font:400 clamp(32px,4.5vw,56px)/1.1 SSDisplay,Georgia,serif;color:#2a160b;margin:0 0 28px}.ss-wp-article-thumb{margin:0 0 36px;border-radius:18px;overflow:hidden;border:1px solid #e4d2bf}.ss-wp-article-thumb img{display:block;width:100%;height:auto}.ss-wp-article-body{font:400 17px/1.75 Archivo,sans-serif;color:#3a2417}.ss-wp-article-body :is(h2,h3){font-family:SSDisplay,Georgia,serif;color:#2a160b;margin:36px 0 14px;line-height:1.25}.ss-wp-article-body p,.ss-wp-article-body ul,.ss-wp-article-body ol{margin:0 0 20px}.ss-wp-article-body blockquote{margin:28px 0;padding:16px 24px;border-left:3px solid #ff5b00;background:#fff9f0;border-radius:0 12px 12px 0;font-family:SSDisplay,Georgia,serif;font-size:20px;color:#2a160b}.ss-wp-article-body img{max-width:100%;height:auto;border-radius:12px}.ss-wp-article-body a{color:#c24400;text-decoration:underline}.ss-wp-article-footer{display:flex;gap:14px;flex-wrap:wrap;margin-top:48px;padding-top:32px;border-top:1px solid #e4d2bf}@media(max-width:639px){.ss-wp-blog{padding:0 20px 56px}.ss-wp-article{padding:36px 20px 64px}}.ss-form-trap{position:absolute!important;left:-10000px!important;width:1px;height:1px;overflow:hidden}');
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
    $query=new WP_Query(['post_type'=>'post','post_status'=>'publish','ignore_sticky_posts'=>true,'posts_per_page'=>9,'paged'=>max(1,absint(get_query_var('paged'))),'meta_query'=>$language_query]);
    if(!$query->have_posts())return '';
    $readMore=['es'=>'Leer artículo →','ca'=>'Llegir l’article →','en'=>'Read article →'][$lang]??'Read article →';
    ob_start();echo '<section class="ss-wp-blog" aria-label="Blog"><div class="ss-wp-blog-grid">';
    while($query->have_posts()){
        $query->the_post();
        $link=esc_url(get_permalink());
        $title=esc_html(get_the_title());
        echo '<article class="ss-wp-blog-card">';
        if(has_post_thumbnail()){echo '<a class="ss-wp-blog-media" href="'.$link.'" aria-hidden="true" tabindex="-1">';the_post_thumbnail('large',['loading'=>'lazy']);echo '</a>';}
        echo '<div class="ss-wp-blog-body"><span class="ss-wp-blog-meta">'.esc_html(get_the_date()).'</span>';
        echo '<h2><a href="'.$link.'">'.$title.'</a></h2>';
        echo '<p>'.esc_html(wp_strip_all_tags(get_the_excerpt())).'</p>';
        echo '<a class="ss-wp-blog-more" href="'.$link.'" aria-hidden="true" tabindex="-1">'.esc_html($readMore).'</a></div></article>';
    }
    echo '</div>';
    $links=paginate_links(['total'=>$query->max_num_pages,'type'=>'plain']);
    if($links)echo '<nav class="ss-wp-blog-pagination" aria-label="Blog">'.wp_kses_post($links).'</nav>';
    echo '</section>';wp_reset_postdata();return ob_get_clean();
}
function smokers_render_page(){
    $page=smokers_page_data();$key='smokers_html_'.substr(hash('sha256',smokers_revision().$page['path'].$page['lang']),0,32);
    $html=get_transient($key);if(false===$html){$template=smokers_page_template($page);$html=smokers_responsive_html(smokers_tokens($template['html'],$page['lang']));set_transient($key,$html,HOUR_IN_SECONDS);}
    if(is_singular('post')||(!get_post_meta(get_queried_object_id(),'_smokers_managed',true)&&!is_404())){
        $lang=$page['lang'];
        $blogUrl=esc_url(smokers_route_url('/'.$lang.'/blog/'));
        $backLabel=['es'=>'← Volver al blog','ca'=>'← Torna al blog','en'=>'← Back to blog'][$lang]??'← Back to blog';
        $menuUrl=esc_url(smokers_route_url(['es'=>'/es/en-casa/','ca'=>'/ca/a-casa/','en'=>'/en/at-home/'][$lang]).'#ss-carta');
        $menuLabel=['es'=>'Explorar la carta →','ca'=>'Explorar la carta →','en'=>'Explore the menu →'][$lang]??'Explore the menu →';
        ob_start();echo '<main id="ss-main" class="ss-wp-article">';
        while(have_posts()){
            the_post();
            echo '<a class="ss-wp-article-back" href="'.$blogUrl.'">'.esc_html($backLabel).'</a>';
            echo '<article><div class="ss-wp-article-meta">SMOKERS · '.esc_html(get_the_date()).'</div>';
            echo '<h1>'.esc_html(get_the_title()).'</h1>';
            if(has_post_thumbnail()){echo '<figure class="ss-wp-article-thumb">';the_post_thumbnail('large');echo '</figure>';}
            echo '<div class="ss-wp-article-body">';the_content();echo '</div>';
            echo '<div class="ss-wp-article-footer"><a class="ss-button ss-outline" href="'.$blogUrl.'">'.esc_html($backLabel).'</a><a class="ss-button ss-primary" href="'.$menuUrl.'">'.esc_html($menuLabel).'</a></div>';
            echo '</article>';
        }
        echo '</main>';$main=ob_get_clean();$html=preg_replace('/<main\b[^>]*>[\s\S]*?<\/main>/',$main,$html,1);
    }elseif($page['mode']==='blog'){$blog=smokers_blog($page['lang']);if($blog)$html=preg_replace('/<section class="ss-blog-empty">[\s\S]*?<\/section>/',$blog,$html,1);}
    ?><!doctype html><html lang="<?php echo esc_attr($page['lang']); ?>"><head><meta charset="<?php bloginfo('charset'); ?>"><meta name="viewport" content="width=device-width,initial-scale=1"><?php wp_head(); ?></head><body <?php body_class(); ?>><?php wp_body_open(); ?><div id="smokers-site" lang="<?php echo esc_attr($page['lang']); ?>" data-mode="<?php echo esc_attr($page['mode']); ?>"><?php echo $html; /* Trusted compiled templates; all editable substitutions are escaped above. */ ?></div><?php wp_footer(); ?></body></html><?php
}
