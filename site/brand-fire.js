/* Reuse the five flames from the supplied intro, keyed over the page background. */
window.SMOKERS_BRAND_FIRE=(root,enabled)=>{
 const canvas=root.querySelector('.ss-brand-fire canvas');
 if(!canvas||!enabled)return()=>{};
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 if(!ctx)return()=>{};
 const video=document.createElement('video'),brand=canvas.closest('.ss-flat-brand'),next=root.querySelector('.ss-wheel-section');
 video.muted=true;video.playsInline=true;video.preload='auto';
 let disposed=false,started=false,inView=false,frame=0,ready=false;
 const clearFrame=()=>{if(!frame)return;if(video.cancelVideoFrameCallback)video.cancelVideoFrameCallback(frame);else cancelAnimationFrame(frame);frame=0};
 const draw=()=>{
  frame=0;if(disposed||!inView)return;
  if(video.readyState>=2&&video.currentTime>=2){
   if(video.currentTime>=8.05)video.currentTime=2.05;
   else{
    ctx.clearRect(0,0,200,64);ctx.drawImage(video,500,416,200,64,0,0,200,64);
    const pixels=ctx.getImageData(0,0,200,64),d=pixels.data;
    for(let i=0;i<d.length;i+=4){const intensity=Math.min(1,Math.max(0,(d[i]-145)/80));const warmth=Math.min(1,Math.max(0,(d[i]-d[i+2]-95)/70));d[i+3]=Math.round(255*intensity*warmth)}
    ctx.putImageData(pixels,0,0);
    if(!ready){ready=true;canvas.parentElement.dataset.ready='true'}
   }
  }
  frame=video.requestVideoFrameCallback?video.requestVideoFrameCallback(draw):requestAnimationFrame(draw);
 };
 const sync=()=>{
  if(disposed||!started)return;
  const r=brand.getBoundingClientRect();
  const visible=!document.hidden&&r.bottom>0&&r.top<innerHeight&&(!next||next.getBoundingClientRect().top>r.bottom);
  if(visible===inView)return;inView=visible;
  if(visible){video.play().then(()=>{if(!disposed&&inView&&!frame)draw()}).catch(()=>{})}
  else{video.pause();clearFrame()}
 };
 const start=()=>{
  if(disposed||started)return;started=true;video.src=canvas.dataset.fireSrc;
  video.addEventListener('loadedmetadata',()=>{if(!disposed)video.currentTime=2.05},{once:true});
  sync();
 };
 const failed=()=>{video.pause();clearFrame();delete canvas.parentElement.dataset.ready};
 video.addEventListener('error',failed);
 addEventListener('scroll',sync,{passive:true});addEventListener('resize',sync);document.addEventListener('visibilitychange',sync);
 if(document.documentElement.dataset.ssLoading)document.addEventListener('ss:intro-finished',start,{once:true});else start();
 return()=>{disposed=true;clearFrame();video.pause();video.removeAttribute('src');video.load();removeEventListener('scroll',sync);removeEventListener('resize',sync);document.removeEventListener('visibilitychange',sync);document.removeEventListener('ss:intro-finished',start);delete canvas.parentElement.dataset.ready};
};
