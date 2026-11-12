/* Build installable WordPress packages from the same tested HTML/React source. */
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const {JSDOM}=require('jsdom');
const release='output/production-site',theme='wordpress/smokers-theme',plugin='wordpress/smokers-content';
const info=JSON.parse(fs.readFileSync(release+'/build-info.json'));
if(info.environment!=='production')throw Error('Build production first');
fs.mkdirSync(theme+'/dist',{recursive:true});fs.mkdirSync(plugin+'/data',{recursive:true});
const key=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,20);
const manifest={formCopy:JSON.parse(fs.readFileSync('site/form-copy.json')),dishes:require(path.resolve('output/.orbit-render.cjs')).menuPages,version:1,origin:info.origin,pages:{},text:{es:{},ca:{},en:{}},links:{},images:{},redirects:JSON.parse(fs.readFileSync('seo/redirects.json'))};
function text(value,lang,group){const trimmed=value.trim();if(!trimmed)return value;const id=key(trimmed);const field=manifest.text[lang][id]??={value:trimmed,groups:[]};if(!field.groups.includes(group))field.groups.push(group);return value.replace(trimmed,'{{text:'+id+'}}')}
function url(value,group){
 if(value.startsWith('/assets/')){const name=value.slice(8);if(!/\.(png|webp|jpg|jpeg|svg|mp4)$/i.test(name))return '{{asset:'+name+'}}';manifest.images[name]??={groups:[]};if(!manifest.images[name].groups.includes(group))manifest.images[name].groups.push(group);return '{{media:'+name+'}}'}
 if(/^(?:https?:|mailto:|tel:)/.test(value)){const id=key(value);manifest.links[id]??={value,groups:[]};if(!manifest.links[id].groups.includes(group))manifest.links[id].groups.push(group);return '{{link:'+id+'}}'}
 if(value.startsWith('/')&&!value.startsWith('//'))return '{{home}}'+value;
 return value;
}
for(const page of info.pages){
 const html=fs.readFileSync(release+page.path+(page.path.endsWith('/')?'index.html':''),'utf8');
 const doc=new JSDOM(html).window.document,root=doc.querySelector('#smokers-site');
 const group=page.mode==='casa'?'Home & dishes':page.mode==='profesional'?'Professionals':page.mode[0].toUpperCase()+page.mode.slice(1);
 const walker=doc.createTreeWalker(root,4);let node;while(node=walker.nextNode()){if(!node.parentElement.closest('script,style'))node.textContent=text(node.textContent,page.lang,group)}
 for(const el of root.querySelectorAll('*')){
  for(const attr of ['alt','title','aria-label','placeholder','data-text'])if(el.hasAttribute(attr))el.setAttribute(attr,text(el.getAttribute(attr),page.lang,group));
  for(const attr of ['src','poster','href'])if(el.hasAttribute(attr))el.setAttribute(attr,url(el.getAttribute(attr),group));
  if(el.hasAttribute('srcset'))el.setAttribute('srcset',el.getAttribute('srcset').replace(/\/assets\/([^,\s]+)/g,(_,name)=>url('/assets/'+name,group)));
  if(el.hasAttribute('style'))el.setAttribute('style',el.getAttribute('style').replace(/\/assets\/([^)'"\s]+)/g,(_,name)=>url('/assets/'+name,group)));
 }
 const state=JSON.parse(doc.querySelector('#ss-page-state').textContent);
 manifest.pages[page.path]={...state,title:text(doc.title,page.lang,group),description:text(doc.querySelector('meta[name=description]').content,page.lang,group),schema:JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent),html:root.innerHTML};
}
// Include validation messages and later form steps that are not present in the initial HTML.
const sandbox={window:{}};for(const file of ['data.js','pages.js','hub.js'])vm.runInNewContext(fs.readFileSync('site/'+file,'utf8'),sandbox);
manifest.defaultOverrides={};
for(const lang of ['es','ca','en']){
 const labels=sandbox.window.SMOKERS_PAGE_COPY[lang].labels,privacy=sandbox.window.SMOKERS_PAGE_COPY[lang].privacy,copy=sandbox.window.SMOKERS_COPY[lang],form=manifest.formCopy[lang];
 manifest.defaultOverrides[lang]=Object.fromEntries([[labels.prepare,form.send],[labels.hint,form.hint],[copy.prepare,form.send],[copy.emailHint,form.hint],[privacy.sections[1][1],form.privacyForm],[privacy.meta.description,form.privacyDescription]].map(([original,value])=>[key(original.trim()),value]));
}
function collect(value,lang){if(typeof value==='string'&&value.trim()&&!/^(?:\/|#|https?:|mailto:)/.test(value)){
 const doc=new JSDOM('<body>'+value+'</body>').window.document,walk=doc.createTreeWalker(doc.body,4);let n;while(n=walk.nextNode())text(n.textContent,lang,'Shared labels & forms');
}else if(Array.isArray(value))value.forEach(v=>collect(v,lang));else if(value&&typeof value==='object')Object.values(value).forEach(v=>collect(v,lang))}
for(const lang of ['es','ca','en']){collect(manifest.formCopy[lang],lang);for(const dish of manifest.dishes[lang])for(const field of ['title','subtitle','label','description','ingredientsNote','alt','seoDescription'])if(dish[field])text(dish[field],lang,'Home & dishes');}
for(const page of Object.values(manifest.pages)){const visit=value=>{if(!value||typeof value!=='object')return;for(const [key,value2]of Object.entries(value)){if(['name','legalName','description','email','telephone','streetAddress','addressLocality','addressRegion','postalCode','addressCountry','text'].includes(key)&&typeof value2==='string')text(value2,page.lang,'SEO & business');else visit(value2)}};visit(page.schema)}
for(const data of Object.values(sandbox.window))for(const lang of ['es','ca','en'])if(data?.[lang])collect(data[lang],lang);
for(const product of sandbox.window.SMOKERS_PRODUCTS||[])for(const [index,lang]of ['es','ca','en'].entries())for(const field of ['names','descriptions','servingIdeas'])if(product[field]?.[index])collect(product[field][index],lang);
const css=fs.readFileSync(release+'/styles.css','utf8');
const cssTemplate=css.replace(/\/assets\/([^)'"\s]+)/g,(_,name)=>url('/assets/'+name,'Backgrounds & decoration'));
fs.writeFileSync(theme+'/dist/styles.template.css',cssTemplate);
// Retain only files referenced by the site or needed by its runtime.
for(const entry of fs.readdirSync(release,{withFileTypes:true}))if(entry.isFile()&&/\.(?:js|css)$/.test(entry.name)&&!entry.name.endsWith('-markup.js'))fs.copyFileSync(release+'/'+entry.name,theme+'/dist/'+entry.name);
fs.cpSync(release+'/assets',theme+'/dist/assets',{recursive:true});
for(const name of fs.readdirSync(theme+'/dist/assets'))if(!fs.existsSync(release+'/assets/'+name))fs.unlinkSync(theme+'/dist/assets/'+name);
for(const name of ['orbit-menu-markup.js','pro-showcase-markup.js'])if(fs.existsSync(theme+'/dist/'+name))fs.unlinkSync(theme+'/dist/'+name);
for(const name of fs.readdirSync(release+'/assets'))if(/\.(png|webp|jpg|jpeg|svg|mp4)$/.test(name))manifest.images[name]??={groups:['Other artwork']};
// One Media Library field controls every responsive rendition of an image.
manifest.mediaAliases={};
for(const [original,variants]of Object.entries(JSON.parse(fs.readFileSync('site/media.json')))){
 const present=variants.filter(v=>manifest.images[v.file]);if(!present.length)continue;
 const groups=[...new Set(present.flatMap(v=>manifest.images[v.file].groups))];
 for(const v of present){manifest.mediaAliases[v.file]=original;delete manifest.images[v.file]}
 manifest.images[original]={groups,defaultFile:present.at(-1).file};
}
for(const name of Object.keys(manifest.images))if(name.startsWith('orbit-v2-')&&name.endsWith('-thumb.webp')){manifest.mediaAliases[name]=name.replace('-thumb.webp','.webp');delete manifest.images[name]}
fs.writeFileSync(plugin+'/data/manifest.json',JSON.stringify(manifest));
console.log('WordPress:',Object.keys(manifest.pages).length,'templates;',Object.fromEntries(Object.entries(manifest.text).map(([l,v])=>[l,Object.keys(v).length])),'text fields;',Object.keys(manifest.images).length,'media fields.');
