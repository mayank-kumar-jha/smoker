/* Static HTML delivery: search engines and no-JS browsers receive the complete content. */
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
execFileSync(process.execPath,['scripts/build-orbit.cjs'],{stdio:'inherit'});
const settings=JSON.parse(fs.readFileSync('seo/settings.json','utf8'));
const production=process.argv.includes('--production');
const dir=process.env.SMOKERS_OUTPUT||(production?'output/production-site':'output/full-site');
const origin=settings.origin.replace(/\/$/,'');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const json=s=>JSON.stringify(s).replace(/</g,'\\u003c');
const media=JSON.parse(fs.readFileSync('site/media.json','utf8'));
fs.mkdirSync(dir+'/assets',{recursive:true});
// Remove obsolete generated HTML so retired routes cannot remain served.
const outputRoot=path.resolve(dir);
function cleanHTML(folder){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){const file=path.resolve(folder,entry.name);if(!file.startsWith(outputRoot+path.sep))throw Error('Output path escaped');if(entry.isDirectory())cleanHTML(file);else if(entry.name.endsWith('.html'))fs.unlinkSync(file)}}
cleanHTML(outputRoot);
const files=new Set(['display.woff2','condensed-0.woff2','archivo-400.woff2','archivo-600.woff2','archivo-700.woff2','Archivo-OFL.txt','smokers-logo-orange.png','smokers-loader-logo.png','smokers-intro.mp4','logo-smoke.webp','Bevan-OFL.txt','barlowcondensed-OFL.txt','favicon.svg','apple-touch-icon.png','og-smokers.jpg','hero-texture.webp',...Object.keys(media),...Object.values(media).flat().map(v=>v.file)]);
files.add('menu-tabletop.webp');
files.add('b2c-reference-clean-v8.png');
files.add('b2c-hero-refined-v9.webp');
files.add('b2c-hero-wide-v10.webp');
for(const f of ['great-vibes.ttf','anek-latin.ttf','GreatVibes-OFL.txt','AnekLatin-OFL.txt'])files.add(f);
files.add('b2c-kitchen-reference-nov9.png');
files.add('b2c-kitchen-clean-v3.png');
files.add('b2c-kitchen-warm-v5.png');
files.add('b2c-kitchen-warm-v6.png');
files.add('b2c-kitchen-layer-v7.png');
files.add('b2c-table-layer-v7.png');
files.add('b2c-kitchen-panoramic-v4.png');
for(const f of ['pro-chicken-background.png','pro-chicken-spiced.png','pro-chicken-herb.png'])files.add(f);
for(const f of fs.readdirSync('site/assets').filter(f=>f.startsWith('orbit-')))files.add(f);
files.add('menu-peach-reference.png');
files.add('menu-seven-photos.png');
files.add('menu-corners-transparent.png');
files.add('menu-corner-food.png');
for(const file of files)if(fs.existsSync('site/assets/'+file))fs.copyFileSync('site/assets/'+file,dir+'/assets/'+file);
fs.copyFileSync('site/orbit-menu.js',dir+'/orbit-menu.js');
fs.copyFileSync('site/pro-showcase.js',dir+'/pro-showcase.js');
for(const file of ['pro-loader.js','loader.js','data.js','routes.js','hub.js','pages.js','home-hero.js','brand-fire.js','b2c-scroll.js','orbit-menu-markup.js','pro-showcase-markup.js','app.js'])fs.copyFileSync('site/'+file,dir+'/'+file);
execFileSync(process.execPath,['node_modules/@tailwindcss/cli/dist/index.mjs','-i','site/styles.css','-o',dir+'/styles.css','--minify'],{stdio:'inherit'});
let css=fs.readFileSync(dir+'/styles.css','utf8').replace(/url\((['"]?)assets\//g,'url($1/assets/');
for(const [name,variants] of Object.entries(media))css=css.replaceAll('/assets/'+name,'/assets/'+variants.at(-1).file);
fs.writeFileSync(dir+'/styles.css',css+'\nbody.smokers-page{margin:0;background:#120d0a}');
const root={innerHTML:'',dataset:{}};
const sandbox={window:{SMOKERS_BUILD:true},document:{getElementById:()=>root,documentElement:{}},localStorage:{getItem:()=>null}};
vm.createContext(sandbox);
for(const file of ['data.js','routes.js','hub.js','pages.js','home-hero.js','brand-fire.js','b2c-scroll.js','orbit-menu-markup.js','pro-showcase-markup.js','app.js'])vm.runInContext(fs.readFileSync('site/'+file,'utf8'),sandbox);
const w=sandbox.window,langs=['es','ca','en'];
const route=(p,l=p.lang)=>p.flavour!==undefined?w.SMOKERS_MENU_PAGES[l][p.flavour].href:p.mode==='product'?w.SMOKERS_ROUTES[l].products+w.SMOKERS_PRODUCT_SLUGS[l][p.product]+'/':w.SMOKERS_ROUTES[l][p.mode]||w.SMOKERS_ROUTES[l].inicio;
const pages=[];
for(const lang of langs)for(const mode of ['casa','profesional','contact','blog','privacy'])pages.push({lang,mode,path:route({lang,mode})});
for(const lang of langs)for(let flavour=0;flavour<w.SMOKERS_MENU_PAGES[lang].length;flavour++)pages.push({lang,mode:'casa',flavour,path:route({lang,flavour})});
pages.push({lang:'es',mode:'404',path:'/404.html',noindex:true});
function responsiveImages(html){return html.replace(/<img\b[^>]*>/g,tag=>{
 const name=tag.match(/src="\/assets\/([^"]+)"/)?.[1],variants=media[name];if(!variants)return tag;
 const small=/alt=""/.test(tag),best=variants.at(-1);
 tag=tag.replace(/\s(?:width|height)="[^"]*"/g,'').replace(`src="/assets/${name}"`,`src="/assets/${best.file}"`);
 const sizes=/ss-flat-wallpaper/.test(tag)?'100vw':/ss-home-scene|ss-gate-image|ss-pro-wallpaper/.test(tag)?'100vw':/ss-orbit-image/.test(tag)?'(max-width: 800px) 12vw, 7vw':/ss-center-image/.test(tag)?'(max-width: 800px) 40vw, 22vw':small?'(max-width: 800px) 40vw, 20vw':'(max-width: 800px) 88vw, 45vw';
 return tag.replace(/>$/,` width="${best.width}" height="${best.height}" srcset="${variants.map(v=>`/assets/${v.file} ${v.width}w`).join(', ')}" sizes="${sizes}" decoding="async">`)
 })}
function metadata(p){
 const localized=settings.metadata[p.lang];
 if(p.flavour!==undefined){const d=w.SMOKERS_MENU_PAGES[p.lang][p.flavour];return {title:d.label+" | Smokers · Badalona",description:d.seoDescription}}
 if(p.mode==='contact')return w.SMOKERS_PAGE_COPY[p.lang].contact.meta;
 if(p.mode==='product'){const product=w.SMOKERS_PRODUCTS[p.product],name=product.names[langs.indexOf(p.lang)],custom=settings.productOverrides[product.id]?.[p.lang]||{};return{title:custom.title||name+' | Smokers Badalona',description:custom.description||name+'. '+localized.productSuffix}}
 if(p.noindex)return{title:(p.mode==='404'?'404 · ':w.SMOKERS_EXTRA_COPY[p.lang].thanks+' | ')+'Smokers',description:w.SMOKERS_EXTRA_COPY[p.lang][p.mode==='404'?'notFoundBody':'thanksBody']};
 return localized[p.mode]||w.SMOKERS_PAGE_COPY[p.lang][p.mode].meta;
}
function graph(p,meta){
 const b=settings.business,id=origin+p.path,brand=origin+'/#business';
 const g=[{'@type':'LocalBusiness','@id':brand,name:b.name,legalName:b.legalName,url:origin+'/',email:b.email,telephone:b.telephone,image:origin+'/assets/og-smokers.jpg',address:{'@type':'PostalAddress',streetAddress:b.streetAddress,addressLocality:b.addressLocality,addressRegion:b.addressRegion,postalCode:b.postalCode,addressCountry:b.addressCountry}}, {'@type':'WebSite','@id':origin+'/#website',url:origin+'/',name:'Smokers',publisher:{'@id':brand},inLanguage:langs}, {'@type':p.mode==='contact'?'ContactPage':p.mode==='about'?'AboutPage':'WebPage','@id':id+'#page',url:id,name:meta.title,description:meta.description,inLanguage:p.lang,isPartOf:{'@id':origin+'/#website'},about:{'@id':brand}}];
 if(p.flavour!==undefined){
  const d=w.SMOKERS_MENU_PAGES[p.lang][p.flavour];
  g.push({'@type':'MenuItem','@id':id+'#dish',name:d.label,description:d.description,url:id,image:origin+d.image});
  g.push({'@type':'BreadcrumbList',itemListElement:[['Smokers',origin+w.SMOKERS_ROUTES[p.lang].casa],[w.SMOKERS_COPY[p.lang].menu,origin+w.SMOKERS_ROUTES[p.lang].casa+'#ss-carta'],[d.label,id]].map(([name,item],i)=>({'@type':'ListItem',position:i+1,name,item}))});
 }
 if(p.mode==='product'){
  const product=w.SMOKERS_PRODUCTS[p.product],name=product.names[langs.indexOf(p.lang)],variant=media[product.image].at(-1);
  g.push({'@type':'BreadcrumbList',itemListElement:[['Smokers',origin+route({...p,mode:'inicio'})],[w.SMOKERS_COPY[p.lang].home,origin+route({...p,mode:'casa'})],[name,id]].map(([name,item],i)=>({'@type':'ListItem',position:i+1,name,item}))});
  // No fabricated price, availability, review or rating. This is not a rich-result eligibility claim.
  g.push({'@type':'Product','@id':id+'#product',name,description:meta.description,image:origin+'/assets/'+variant.file,url:id,brand:{'@type':'Brand',name:'Smokers'},manufacturer:{'@id':brand}});
 }
 if(['casa','profesional'].includes(p.mode))g.push({'@type':'FAQPage','@id':id+'#faq',mainEntity:w.SMOKERS_COPY[p.lang][p.mode==='casa'?'faqHome':'faqPro'].map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))});
 return{'@context':'https://schema.org','@graph':g};
}
for(const p of pages){
 const meta=metadata(p),canonical=origin+p.path,locale={es:'es_ES',ca:'ca_ES',en:'en_GB'}[p.lang];
 let content=responsiveImages(w.SMOKERS_RENDER_PAGE(p));
 // Approved product-specific ingredients/allergens can be supplied without touching templates.
 if(p.mode==='product'){const custom=settings.productOverrides[w.SMOKERS_PRODUCTS[p.product].id]?.[p.lang];if(custom?.ingredients&&custom?.allergens)content=content.replace(w.SMOKERS_EXTRA_COPY[p.lang].ingredientsNote,esc(custom.ingredients)+'<br>'+esc(custom.allergens))}
 const alternates=p.noindex?'':langs.map(l=>`<link rel="alternate" hreflang="${l}" href="${origin+route(p,l)}">`).join('\n')+`\n<link rel="alternate" hreflang="x-default" href="${p.mode==='inicio'?origin+'/':origin+route(p,'es')}">`;
 const html=`<!doctype html>
<html lang="${p.lang}"><head>
<meta charset="utf-8"><script src="/pro-loader.js"></script><script src="/loader.js"></script><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#120d0a">
<title>${esc(meta.title)}</title><meta name="description" content="${esc(meta.description)}">
<meta name="robots" content="${production&&!p.noindex?'index,follow,max-image-preview:large':'noindex,follow'}">
<link rel="canonical" href="${canonical}">${alternates}
<meta property="og:type" content="website"><meta property="og:site_name" content="Smokers"><meta property="og:locale" content="${locale}"><meta property="og:title" content="${esc(meta.title)}"><meta property="og:description" content="${esc(meta.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${origin}/assets/og-smokers.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Smokers · Badalona">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(meta.title)}"><meta name="twitter:description" content="${esc(meta.description)}"><meta name="twitter:image" content="${origin}/assets/og-smokers.jpg">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"><link rel="preload" href="/assets/display.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/assets/condensed-0.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/styles.css">
${p.mode==='profesional'?'<link rel="preload" as="image" href="/assets/pro-arc-background-1904.webp" fetchpriority="high">':''}<script type="application/ld+json">${json(graph(p,meta))}</script>
</head><body class="smokers-page"><div id="smokers-site" lang="${p.lang}" data-mode="${p.mode}">${content}</div>
<script type="application/json" id="ss-page-state">${json(p)}</script><script src="/data.js" defer></script><script src="/routes.js" defer></script><script src="/hub.js" defer></script><script src="/pages.js" defer></script><script src="/home-hero.js" defer></script><script src="/brand-fire.js" defer></script><script src="/b2c-scroll.js" defer></script><script src="/orbit-menu.js" defer></script><script src="/pro-showcase.js" defer></script><script src="/app.js" defer></script>
</body></html>`;
 const filename=dir+(p.path.endsWith('/')?p.path+'index.html':p.path);fs.mkdirSync(path.dirname(filename),{recursive:true});fs.writeFileSync(filename,html);
}
// Static-host fallback for the retired audience chooser. Server hosts use 301s.
for(const [legacy,target] of [['/','/es/en-casa/'],...langs.map(lang=>['/'+lang+'/',w.SMOKERS_ROUTES[lang].casa])]){
 const lang=legacy==='/'?'es':legacy.split('/')[1],filename=dir+legacy+'index.html';fs.mkdirSync(path.dirname(filename),{recursive:true});
 fs.writeFileSync(filename,`<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=${target}"><link rel="canonical" href="${origin+target}"><title>Smokers</title></head><body><a href="${target}">${esc(w.SMOKERS_COPY[lang].home)} →</a></body></html>`);
}
const indexable=pages.filter(p=>!p.noindex);
const sitemap=production?indexable:[];
fs.writeFileSync(dir+'/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+sitemap.map(p=>`<url><loc>${esc(origin+p.path)}</loc></url>`).join('')+'</urlset>');
fs.writeFileSync(dir+'/robots.txt',`User-agent: *\nAllow: /\nDisallow: /wp-admin/\nDisallow: /wp-login.php\nDisallow: /?s=\nSitemap: ${origin}/sitemap.xml\n`);
fs.writeFileSync(dir+'/build-info.json',JSON.stringify({environment:production?'production':'staging',origin,indexableCount:production?indexable.length:0,pages:pages.map(p=>({path:p.path,mode:p.mode,lang:p.lang,noindex:!production||!!p.noindex}))},null,2));
const redirects=Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync('seo/redirects.json','utf8'))).filter(([,to])=>pages.some(p=>p.path===to.split('#')[0])));
fs.writeFileSync(dir+'/redirects.json',JSON.stringify(redirects,null,2));
fs.writeFileSync(dir+'/_redirects',Object.entries(redirects).map(([from,to])=>`${from} ${to} 301`).join('\n')+'\n');
const csp="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'self'; form-action 'self' mailto:";
fs.writeFileSync(dir+'/_headers',`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Content-Security-Policy: ${csp}\n${production?'':'  X-Robots-Tag: noindex, follow\n'}\n`);
// Portable preview and Elementor demo. SEO production delivery uses the real URL files above.
const types={'.ttf':'font/ttf','.mp4':'video/mp4','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2','.svg':'image/svg+xml'},assets={};
for(const name of files){const type=types[path.extname(name)];if(type&&fs.existsSync('site/assets/'+name))assets[name]=`data:${type};base64,${fs.readFileSync('site/assets/'+name).toString('base64')}`}
const embedCSS=css.replace(/url\((?:["'])?\/assets\/([^)'"\s]+)(?:["'])?\)/g,(_,name)=>`url("${assets[name]}")`);
const imageAssets=Object.fromEntries(Object.entries(assets).filter(([name])=>Object.hasOwn(media,name)||name.startsWith('orbit-')||name==='b2c-hero-wide-v10.webp'||name==='b2c-hero-refined-v9.webp'||name==='b2c-reference-clean-v8.png'||name==='b2c-kitchen-reference-nov9.png'||name==='b2c-kitchen-clean-v3.png'||name==='b2c-kitchen-warm-v5.png'||name==='b2c-kitchen-warm-v6.png'||name==='b2c-kitchen-layer-v7.png'||name==='b2c-table-layer-v7.png'||name==='b2c-kitchen-panoramic-v4.png'||['favicon.svg','logo-smoke.webp','smokers-logo-orange.png','smokers-loader-logo.png','smokers-intro.mp4','home-reference-mobile-official-640.webp','menu-seven-photos.png'].includes(name)));
const scripts=`${fs.readFileSync('site/pro-loader.js','utf8')}\n${fs.readFileSync('site/loader.js','utf8')}\nwindow.SMOKERS_STANDALONE=true;window.SMOKERS_ASSETS=${json(imageAssets)};\n${['data.js','routes.js','hub.js','pages.js','home-hero.js','brand-fire.js','b2c-scroll.js','orbit-menu-markup.js','pro-showcase-markup.js','app.js'].map(f=>fs.readFileSync('site/'+f,'utf8')).join('\n')}\n${fs.readFileSync('site/orbit-menu.js','utf8')}\n${fs.readFileSync('site/pro-showcase.js','utf8')}\nwindow.SMOKERS_MOUNT_PRO?.(document.getElementById('smokers-site'),document.getElementById('smokers-site').dataset.motion!=='off');\nwindow.SMOKERS_MOUNT_ORBIT?.(document.getElementById('smokers-site'));`;
const licenses=['Bevan-OFL.txt','barlowcondensed-OFL.txt','Archivo-OFL.txt'].map(f=>'/*! '+fs.readFileSync('site/assets/'+f,'utf8')+' */').join('\n');
const widget=`<!-- Interactive demo only. For indexed WordPress pages use server-rendered templates and real language URLs. -->\n<style>${licenses}\n${embedCSS}</style><div id="smokers-site"></div><script>${scripts.replace(/<\/script/gi,'<\\/script')}</script>`;
fs.writeFileSync('output/smokers-full-widget.html',widget);
fs.writeFileSync('output/smokers-full.html',`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>Smokers · Interactive preview</title><style>body{margin:0;background:#120d0a}</style></head><body>${widget}</body></html>`);
console.log(`Built ${pages.length} HTML pages (${production?'production':'staging, noindex'}); responsive assets, schema, hreflang, sitemap and portable preview.`);
