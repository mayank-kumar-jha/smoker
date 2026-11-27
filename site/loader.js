/* A short, lightweight brand reveal for the at-home pages. */
(() => {
 const html=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let textMotion=!reduced.matches;try{textMotion &&=localStorage.getItem('smokers-motion')!=='off'}catch{}
 const home=window.SMOKERS_BOOT_MODE?window.SMOKERS_BOOT_MODE==='casa':/(?:^|\/)(?:en\/at-home|es\/en-casa|ca\/a-casa)\/?$/.test(location.pathname);
 if(home&&textMotion){
  html.dataset.ssTextPending='true';
  let textTimeout;
  const release=()=>{if(html.hasAttribute('data-ss-text-pending')){delete html.dataset.ssTextPending;html.dataset.ssTextSkip='true'}};
  const arm=()=>{clearTimeout(textTimeout);textTimeout=setTimeout(release,4000)};
  document.addEventListener('ss:intro-finished',arm,{once:true});
  setTimeout(()=>{if(!html.hasAttribute('data-ss-loading'))arm()},0);
 }
 let skipIntro=false;try{skipIntro=sessionStorage.getItem('smokers-skip-intro')===location.pathname;if(skipIntro)sessionStorage.removeItem('smokers-skip-intro')}catch{}


 if(skipIntro||(window.SMOKERS_BOOT_MODE ? window.SMOKERS_BOOT_MODE!=='casa' : !/(?:^|\/)(?:en\/at-home|es\/en-casa|ca\/a-casa)\/?$/.test(location.pathname)))return;
 if(/\/(?:en\/at-home\/menu|es\/en-casa\/carta|ca\/a-casa\/carta)\/[^/]+\/$/.test(location.pathname))return;
 if(/\/(professionals|profesionales)\/?$/.test(location.pathname)||location.hash.startsWith('#profesional'))return;
 let disabled=reduced.matches;
 try{disabled ||= localStorage.getItem('smokers-motion')==='off'}catch{}
 if(disabled)return;
 try{localStorage.setItem('smokers-intro-seen','true')}catch{}
 try{sessionStorage.setItem('smokers-session-intro','seen')}catch{}
 html.dataset.ssLoading='true';
 let phase='waiting',revealTimer,finishTimer,flights=[];
 const finish=()=>{
  if(phase==='done')return;
  phase='done';clearTimeout(revealTimer);clearTimeout(finishTimer);flights.forEach(animation=>animation.cancel());
  const overlay=document.querySelector('.ss-loader');
  if(overlay){overlay.hidden=true;overlay.setAttribute('aria-hidden','true')}
  delete html.dataset.ssLoading;
  document.dispatchEvent(new Event('ss:intro-finished'));
  removeEventListener('pointerdown',finish);removeEventListener('keydown',finish);removeEventListener('resize',finish);reduced.removeEventListener('change',finish);
 };
 const reveal=()=>{
  if(phase!=='waiting')return;
  phase='revealing';
  const sources=[document.querySelector('.ss-intro-symbol'),document.querySelector('.ss-intro-word')];
  const destinations=[document.querySelector('.ss-header .ss-logo-symbol'),document.querySelector('.ss-header .ss-logo-word')];
  if(sources.every(Boolean)&&destinations.every(Boolean)&&sources.every(el=>typeof el.animate==='function')){
   flights=sources.map((source,i)=>{
    const from=source.getBoundingClientRect(),to=destinations[i].getBoundingClientRect();
    if(!from.width||!from.height||!to.width||!to.height)return null;
    // The source uses translateX for centering; animate from that same transform.
    return source.animate([
     {transform:'translateX(-50%) scale(1,1)',opacity:1},
     {opacity:1,offset:.65},
     {transform:`translate(calc(-50% + ${to.left-from.left}px), ${to.top-from.top}px) scale(${to.width/from.width},${to.height/from.height})`,opacity:0}
    ],{duration:700,easing:'cubic-bezier(.22,.75,.2,1)',fill:'forwards'});
   }).filter(Boolean);
  }
  html.dataset.ssLoading='docking';
  document.dispatchEvent(new Event('ss:intro-revealing'));
  finishTimer=setTimeout(finish,700);
 };
 addEventListener('pointerdown',finish,{once:true,passive:true});addEventListener('keydown',finish,{once:true});addEventListener('resize',finish,{once:true});reduced.addEventListener('change',finish);
 const ready=()=>{if(phase==='waiting')revealTimer=setTimeout(reveal,3100)};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
