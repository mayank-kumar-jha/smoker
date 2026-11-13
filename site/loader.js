/* Play the supplied reveal, then animate the logo in its permanent header slot. */
(() => {
 // Set the text's initial state in the head, before the heading can paint.
 // The fallback remains visible without JS, with reduced motion, or on failure.
 let textMotion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 try{textMotion &&=localStorage.getItem('smokers-motion')!=='off'}catch{}
 if(textMotion&&/^\/(?:en\/at-home|es\/en-casa|ca\/a-casa)(?:\/|$)/.test(location.pathname)){
  document.documentElement.dataset.ssTextPending='true';
  const release=()=>{delete document.documentElement.dataset.ssTextPending;clearTimeout(textDeadline)};
  const textDeadline=setTimeout(()=>{document.documentElement.dataset.ssTextFallback='true';release()},12000);
  document.addEventListener('ss:text-ready',release,{once:true});
 }
 let skipIntro=false;try{skipIntro=sessionStorage.getItem('smokers-skip-intro')===location.pathname;if(skipIntro)sessionStorage.removeItem('smokers-skip-intro')}catch{}
 try{skipIntro ||= sessionStorage.getItem('smokers-session-intro')==='seen'||(!!document.referrer&&new URL(document.referrer).origin===location.origin)}catch{}

 if(skipIntro||!/^\/(?:en\/at-home|es\/en-casa|ca\/a-casa)\/?$/.test(location.pathname))return;
 if(/\/(?:en\/at-home\/menu|es\/en-casa\/carta|ca\/a-casa\/carta)\/[^/]+\/$/.test(location.pathname))return;
 if(/\/(professionals|profesionales)\/?$/.test(location.pathname)||location.hash.startsWith('#profesional'))return;
 const html=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let disabled=reduced.matches;
 try{disabled ||= localStorage.getItem('smokers-motion')==='off'}catch{}
 if(disabled)return;
 try{localStorage.setItem('smokers-intro-seen','true')}catch{}
 try{sessionStorage.setItem('smokers-session-intro','seen')}catch{}
 html.dataset.ssLoading='true';
 let phase='waiting',video,art,slot,videoFrame,deadline,flights=[];
 const finish=()=>{
  if(phase==='done')return;phase='done';clearTimeout(deadline);
  // Retire the overlay before clearing docking styles. Otherwise its canvas and
  // background transition back to opacity 1 during the outer visibility fade.
  const overlay=document.querySelector('.ss-loader');
  if(overlay){overlay.hidden=true;overlay.setAttribute('aria-hidden','true')}
  if(video){video.pause();if(videoFrame&&video.cancelVideoFrameCallback)video.cancelVideoFrameCallback(videoFrame)}
  flights.forEach(a=>a.cancel());
  delete html.dataset.ssLoading;
  document.dispatchEvent(new Event('ss:intro-finished'));
  removeEventListener('pointerdown',finish);removeEventListener('keydown',finish);removeEventListener('resize',finish);reduced.removeEventListener('change',finish);
 };
 const dock=async()=>{
  if(phase!=='waiting')return;
  const loader=document.querySelector('.ss-loader');slot=document.querySelector('.ss-header .ss-logo');art=slot?.querySelector('.ss-logo-art');
  if(!loader||!art||!art.animate){finish();return}
  phase='preparing';
  // Measure only after the final header fonts and logo image are ready.
  await Promise.race([Promise.all([document.fonts.ready,...[...art.querySelectorAll('img')].map(img=>img.decode().catch(()=>{
}))]),new Promise(resolve=>setTimeout(resolve,1500))]);
  if(phase==='done')return;
  const destination=slot.getBoundingClientRect();if(!destination.width){finish();return}
  const hasFrame=video?.readyState>=2&&video.currentTime>5,frame=video?.getBoundingClientRect();
  video?.pause();phase='docking';
  // Keep the logo in its final header slot throughout the flight. Reparenting
  // changed inherited styles and caused a visible snap at the end of docking.
  const pieces=[...art.querySelectorAll('.ss-logo-piece')];
  flights=pieces.map((piece,i)=>{
   const to=piece.getBoundingClientRect();
   const width=hasFrame?frame.width*(i===0?.148:.348):Math.min(520,innerWidth*.8)*(i===0?.23:.77);
   const scale=width/to.width,height=to.height*scale;
   const x=hasFrame?frame.left+frame.width*.5-width/2:innerWidth/2+(i===0?-Math.min(520,innerWidth*.8)/2:-Math.min(520,innerWidth*.8)*.27);
   const y=hasFrame?frame.top+frame.height*(i===0?.379:.55)-height/2:innerHeight/2-height/2;
   return piece.animate([{transform:`translate(${x-to.left}px,${y-to.top}px) scale(${scale})`,opacity:hasFrame?0:1},{opacity:1,offset:.12},{transform:'translate(0,0) scale(1)',opacity:1}],{duration:1150,easing:'cubic-bezier(.22,.75,.16,1)',fill:'both'});
  });
  html.dataset.ssLoading='docking';
  document.dispatchEvent(new Event('ss:intro-revealing'));
  Promise.all(flights.map(a=>a.finished)).then(finish).catch(()=>{});
 };
 deadline=setTimeout(finish,12000);
 addEventListener('pointerdown',finish,{once:true,passive:true});addEventListener('keydown',finish,{once:true});addEventListener('resize',finish,{once:true});reduced.addEventListener('change',finish);
 const ready=()=>{
  if(phase!=='waiting')return;
  video=document.querySelector('.ss-intro-video');if(!video){dock();return}
  const fallback=()=>{if(phase==='waiting')dock()};
  const canvas=document.querySelector('.ss-intro-clean'),ctx=canvas?.getContext('2d',{willReadFrequently:true});
  if(!ctx){fallback();return}
  let lastPaint=0;
  const paint=()=>{
   if(video.readyState<2)return;
   // Keep the original moving orange brand and flames, and the short lower caption.
   // The orbit's white lettering and dots are outside this retained area.
   ctx.clearRect(350,130,500,430);ctx.drawImage(video,350,130,500,430,350,130,500,430);
   const pixels=ctx.getImageData(350,130,500,430),d=pixels.data;
   for(let i=0;i<d.length;i+=4){
    const x=(i/4)%500+350,y=Math.floor(i/4/500)+130,dx=x-600,dy=y-338;
    if(dx*dx+dy*dy>235*235){d[i+3]=0;continue}
    const lowerCaption=x>430&&x<770&&y>485&&y<512;
    const alpha=lowerCaption?Math.min(1,Math.max(0,(Math.min(d[i],d[i+1],d[i+2])-100)/110)):Math.min(1,Math.max(0,(d[i]-115)/110))*Math.min(1,Math.max(0,(d[i]-d[i+2]-75)/90));
    d[i+3]=Math.round(alpha*255);
    // Dark caption on the ivory professional intro, light on the B2C intro.
    if(lowerCaption&&document.getElementById('smokers-site')?.dataset.mode==='profesional'){d[i]=64;d[i+1]=48;d[i+2]=36}
   }
   ctx.putImageData(pixels,350,130);
  };
  video.muted=true;video.playbackRate=1.75;video.src=video.dataset.introSrc;
  video.addEventListener('error',fallback,{once:true});video.addEventListener('ended',dock,{once:true});
  video.addEventListener('timeupdate',()=>{if(!video.requestVideoFrameCallback)paint();if(video.currentTime>=7.55)dock()});
  const watch=now=>{if(phase!=='waiting')return;if(now-lastPaint>=32){paint();lastPaint=now}if(video.currentTime>=7.55)dock();else videoFrame=video.requestVideoFrameCallback(watch)};
  if(video.requestVideoFrameCallback)videoFrame=video.requestVideoFrameCallback(watch);
  video.play().catch(fallback);
  // A stalled or unavailable video must never keep the page covered.
  setTimeout(()=>{if(video.readyState<2||video.currentTime<.1)fallback()},4000);
  let previous=0,stalled=0;
  const checkProgress=()=>{if(phase!=='waiting')return;stalled=video.currentTime===previous?stalled+1:0;previous=video.currentTime;if(stalled>=3)fallback();else setTimeout(checkProgress,1000)};
  setTimeout(checkProgress,1000);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
