/* Match server-rendered content before hydration; preserve the original animation DOM. */
(()=>{
 const config=window.SMOKERS_WP;if(!config)return;
 const text=value=>{const original=value.trim();return Object.hasOwn(config.text,original)?value.replace(original,config.text[original]):value};
 const url=value=>{
  if(config.links[value])return config.links[value];
  if(value.startsWith('/assets/'))return config.media[value.slice(8)]||config.assets+value.slice(8);
  if(value.startsWith('/')&&!value.startsWith('//'))return config.home+value;
  return value;
 };
 const html=value=>{
  const template=document.createElement('template');template.innerHTML=value;
  const walk=document.createTreeWalker(template.content,NodeFilter.SHOW_TEXT);let node;
  while(node=walk.nextNode())if(!node.parentElement?.closest('script,style'))node.textContent=text(node.textContent);
  for(const el of template.content.querySelectorAll('*')){
   for(const attr of ['alt','title','placeholder','aria-label','data-text'])if(el.hasAttribute(attr))el.setAttribute(attr,text(el.getAttribute(attr)));
   for(const attr of ['src','poster','href','data-intro-src'])if(el.hasAttribute(attr))el.setAttribute(attr,url(el.getAttribute(attr)));
  if(el.tagName==='IMG'){const data=config.imageAttributes?.[el.getAttribute('src')];if(data){el.setAttribute('width',data.width);el.setAttribute('height',data.height);if(data.srcSet){el.setAttribute('srcset',data.srcSet);if(!el.hasAttribute('sizes'))el.setAttribute('sizes',data.sizes)}else el.removeAttribute('srcset')}}
  }return template.innerHTML;
 };
 window.SMOKERS_CMS={text,url,html,image:value=>config.imageAttributes?.[url(value)]};window.SMOKERS_ASSETS=config.media;
 const map=value=>typeof value==='string'?(value.includes('<')?html(value):text(value)):Array.isArray(value)?value.map(map):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,map(v)])):value;
 for(const key of ['SMOKERS_COPY','SMOKERS_EXTRA_COPY','SMOKERS_PAGE_COPY','SMOKERS_HUB_COPY','SMOKERS_PRODUCTS'])if(window[key])window[key]=map(window[key]);
 for(const routes of Object.values(window.SMOKERS_ROUTES))for(const key of Object.keys(routes))routes[key]=url(routes[key]);
 for(const provider of window.SMOKERS_CONFIG?.delivery||[])provider.url=url(provider.url);
 const labels=config.labels;
 window.SMOKERS_COPY[config.language].prepare=text(labels.send);
 window.SMOKERS_COPY[config.language].emailHint=text(labels.hint);
 window.SMOKERS_SEND=async({form,name,email,message,consent})=>{
  let status=form.querySelector('.ss-wp-mail-status');if(!status){status=document.createElement('p');status.className='ss-wp-mail-status';status.setAttribute('role','status');form.appendChild(status)}
  const submit=form.querySelector('[type=submit]');if(submit.disabled)return false;submit.disabled=true;status.textContent=text(labels.sending);
  const body=new URLSearchParams({action:'smokers_contact',nonce:config.nonce,name,email,message,consent:consent?'1':'',website:form.querySelector('[name=website]')?.value||''});
  try{const fresh=await fetch(config.ajax+'?action=smokers_contact_nonce',{credentials:'same-origin',cache:'no-store'});const token=await fresh.json();if(!fresh.ok||!token.success)throw Error('nonce');body.set('nonce',token.data.nonce);const result=await fetch(config.ajax,{method:'POST',credentials:'same-origin',body});const response=await result.json();if(!result.ok||!response.success)throw Error('send');status.textContent=text(labels.sent);return true}catch{status.textContent=text(labels.error);return false}finally{submit.disabled=false}
 };
 document.addEventListener('DOMContentLoaded',()=>{
  const form=document.querySelector('#ss-enquiry-form');if(form){const submit=form.querySelector('[type=submit]');if(submit.firstChild)submit.firstChild.nodeValue=text(labels.send);form.querySelector('.ss-draft-hint').textContent=text(labels.hint)}
  document.querySelectorAll('#ss-enquiry-form,#ss-catalogue-form').forEach(form=>{const trap=document.createElement('div');trap.className='ss-form-trap';trap.innerHTML='<label>Leave empty<input name="website" tabindex="-1" autocomplete="off"></label>';trap.setAttribute('aria-hidden','true');form.appendChild(trap)})
 });
})();
