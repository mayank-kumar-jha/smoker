/* Professional-only three-second brand reveal; never blocks content on failure. */
(()=>{
 let skipIntro=false;try{skipIntro=sessionStorage.getItem('smokers-skip-intro')===location.pathname;if(skipIntro&&/\/(professionals|profesionales)\/?$/.test(location.pathname))sessionStorage.removeItem('smokers-skip-intro')}catch{}
 try{skipIntro ||= sessionStorage.getItem('smokers-session-intro')==='seen'||(!!document.referrer&&new URL(document.referrer).origin===location.origin)}catch{}

 // This file runs in the head, before the first body paint.
 const boot=!skipIntro&&/\/(professionals|profesionales)\/?$/.test(location.pathname)||location.hash.startsWith('#profesional');
 if(boot){document.documentElement.dataset.ssProBoot='true';try{sessionStorage.setItem('smokers-session-intro','seen')}catch{}}
 const bootDeadline=setTimeout(()=>{delete document.documentElement.dataset.ssProBoot},12000);
 let overlay=null,timer=0,release=0,locked=[],heroFlights=[];
 let heroRoot=null;
 const revealHero=()=>{
  if(!heroRoot)return;const root=heroRoot;heroRoot=null;root.removeAttribute("data-pro-entrance");
  if(matchMedia("(prefers-reduced-motion: reduce)").matches||root.dataset.motion==="off")return;
  const fly=(selector,from,duration,delay)=>root.querySelectorAll(selector).forEach(el=>{heroFlights.push(el.animate([{translate:from,opacity:0},{translate:"0 0",opacity:1}],{duration,delay,easing:"cubic-bezier(.16,.78,.18,1)",fill:"backwards"}))});
  fly(".ss-b2b-fork","0 115%",1700,0);
  fly(".ss-b2b-wordmark>span:first-child","-110% 0",1450,140);
  fly(".ss-b2b-wordmark>span:last-child","110% 0",1450,140);
  fly(".ss-b2b-taglines>p:first-child","-70px 0",1250,450);
  fly(".ss-b2b-taglines>p:last-child","70px 0",1250,450);
  fly(".ss-b2b-process-link","0 16px",850,850);
 };
 const html=document.documentElement;
 const cancel=()=>{clearTimeout(timer);clearTimeout(release);overlay?.remove();overlay=null;delete html.dataset.ssProLoading;locked.forEach(el=>el.inert=false);locked=[];revealHero()};
 window.SMOKERS_PRO_INTRO_CANCEL=cancel;
 window.SMOKERS_PRO_INTRO=()=>{
  cancel();if(skipIntro){skipIntro=false;delete html.dataset.ssProBoot;return}const root=document.getElementById('smokers-site');if(root?.dataset.mode!=='profesional')return;
  heroFlights.forEach(a=>a.cancel());heroFlights=[];heroRoot=root;root.dataset.proEntrance='waiting';
  delete html.dataset.ssLoading;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const label={es:'PARA PROFESIONALES',ca:'PER A PROFESSIONALS',en:'FOR PROFESSIONALS'}[root.lang||document.documentElement.lang]||'FOR PROFESSIONALS';
  overlay=document.createElement('div');overlay.className='ss-pro-preloader';overlay.setAttribute('role','status');overlay.setAttribute('aria-label',label);
  const image=document.createElement('img');image.src=window.SMOKERS_ASSETS?.['smokers-loader-logo.png']||'/assets/smokers-loader-logo.png';image.alt='Smokers';image.width=1680;image.height=386;
  const inner=document.createElement('div');inner.className='ss-pro-preloader-inner';
  const mark=document.createElement('div');mark.className='ss-pro-cinema-logo';mark.setAttribute('aria-label','Smokers');
  for(const part of ['symbol','word']){const crop=document.createElement('span');crop.className='ss-pro-cinema-'+part;const copy=image.cloneNode();copy.alt='';crop.append(copy);mark.append(crop)}inner.append(mark);
  const caption=document.createElement('p');caption.textContent=label;inner.append(caption);
  const line=document.createElement('span');line.className='ss-pro-load-line';line.setAttribute('aria-hidden','true');inner.append(line);overlay.append(inner);
  const skip=document.createElement('button');skip.type='button';skip.className='ss-pro-load-skip';skip.textContent={es:'Saltar intro',ca:'Salta la intro',en:'Skip intro'}[root.lang]||'Skip intro';skip.onclick=cancel;overlay.append(skip);
  document.body.append(overlay);html.dataset.ssProLoading='true';
  delete html.dataset.ssProBoot;clearTimeout(bootDeadline);
  locked=[...document.body.children].filter(el=>el!==overlay&&!el.inert&& !['SCRIPT','STYLE','LINK'].includes(el.tagName));locked.forEach(el=>el.inert=true);
  if(reduced){overlay.classList.add('ss-pro-load-reduced')}
  const currentOverlay=overlay;
  const assetsReady=Promise.all([document.fonts.ready,...[...root.querySelectorAll('.ss-b2b-fork,.ss-header img')].map(img=>img.decode().catch(()=>{}))]);
  timer=setTimeout(async()=>{
   await Promise.race([assetsReady,new Promise(resolve=>setTimeout(resolve,1500))]);
   if(overlay!==currentOverlay)return;
   revealHero();overlay.classList.add('ss-pro-load-leave');release=setTimeout(cancel,reduced?0:700);
  },reduced?300:2300);
 };
 const ready=()=>{if(document.getElementById('smokers-site')?.dataset.mode==='profesional')window.SMOKERS_PRO_INTRO()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
 addEventListener('pagehide',cancel);addEventListener('keydown',e=>{if(e.key==='Escape')cancel()});
})();
