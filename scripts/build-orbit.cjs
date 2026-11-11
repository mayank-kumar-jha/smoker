const esbuild=require('esbuild'),fs=require('node:fs'),path=require('node:path');
fs.mkdirSync('output',{recursive:true});
const common={bundle:true,jsx:'automatic',logLevel:'warning'};
esbuild.buildSync({...common,entryPoints:['components/menu-entry.tsx'],outfile:'site/orbit-menu.js',platform:'browser',format:'iife',minify:true,define:{'process.env.NODE_ENV':'"production"'}});
esbuild.buildSync({...common,entryPoints:['components/menu-server.tsx'],outfile:'output/.orbit-render.cjs',platform:'node',format:'cjs'});
const {markup,markups,menuPages}=require(path.resolve('output/.orbit-render.cjs'));
fs.writeFileSync('site/orbit-menu-markup.js','window.SMOKERS_ORBIT_HTML='+JSON.stringify(markup)+';window.SMOKERS_ORBIT_MARKUPS='+JSON.stringify(markups)+';window.SMOKERS_MENU_PAGES='+JSON.stringify(menuPages)+';');

esbuild.buildSync({...common,entryPoints:['components/pro-entry.tsx'],outfile:'site/pro-showcase.js',platform:'browser',format:'iife',minify:true,define:{'process.env.NODE_ENV':'"production"'}});
esbuild.buildSync({...common,entryPoints:['components/pro-server.tsx'],outfile:'output/.pro-render.cjs',platform:'node',format:'cjs'});
const pro=require(path.resolve('output/.pro-render.cjs'));
fs.writeFileSync('site/pro-showcase-markup.js','window.SMOKERS_PRO_HTML='+JSON.stringify(pro.markup)+';');
