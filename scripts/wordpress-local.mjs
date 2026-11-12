import {runCLI} from '@wp-playground/cli';
import fs from 'node:fs';
const reuse=process.env.SMOKERS_WP_ROOT;
const result=await runCLI({...(reuse?{wordpressInstallMode:'do-not-attempt-installing','mount-before-install':[{hostPath:reuse,vfsPath:'/wordpress'}]}:{}),command:'server',workers:6,port:9400,php:'8.3',wp:'latest',login:true,
 mount:[{hostPath:'./wordpress/smokers-theme',vfsPath:'/wordpress/wp-content/themes/smokers-theme'},{hostPath:'./wordpress/smokers-content',vfsPath:'/wordpress/wp-content/plugins/smokers-content'}],
 blueprint:{steps:[{step:'activatePlugin',pluginPath:'/wordpress/wp-content/plugins/smokers-content/smokers-content.php'},{step:'activateTheme',themeFolderName:'smokers-theme'},{step:'runPHP',code:"<?php require '/wordpress/wp-load.php'; smokers_create_pages(); update_option('permalink_structure','/%postname%/'); update_option('blog_public',0); $page=get_page_by_path('es/en-casa');update_option('show_on_front','page');update_option('page_on_front',$page->ID);flush_rewrite_rules();"}]}
});
fs.mkdirSync('output/phase1',{recursive:true});fs.writeFileSync('output/phase1/wordpress-local.json',JSON.stringify({url:result.serverUrl}));
console.log('Local WordPress:',result.serverUrl);


if(process.argv.includes('--test')){try{await (await import('../tests/wordpress-integration.mjs')).testWordPress(result)}catch(error){console.error(error);await result[Symbol.asyncDispose]();process.exitCode=1}}
