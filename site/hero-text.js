/* Draw the existing hero lettering without loading the carousel bundle. */
(()=>{
 const root=document.getElementById('smokers-site'),host=root?.querySelector('.ss-eat-animation');
 if(!host)return;
 const slot=host.querySelector('.ss-eat-effect'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let started=false,animations=[],resize,generation=0;
 const clear=()=>{generation++;animations.forEach(a=>a.cancel());animations=[];resize?.disconnect();resize=null;host.removeAttribute('data-drawing');host.removeAttribute('data-draw-state');slot.replaceChildren();delete document.documentElement.dataset.ssTextPending;started=false};
 const start=async()=>{
  if(started||document.documentElement.hasAttribute('data-ss-text-skip'))return;
  if(reduced.matches||root.dataset.motion==='off'){clear();return}
  if(document.documentElement.hasAttribute('data-ss-loading'))return;
  started=true;const run=++generation;
  try{
   await document.fonts.ready;
   if(run!==generation||document.documentElement.hasAttribute('data-ss-text-skip'))return;
   if(reduced.matches||root.dataset.motion==='off'){clear();return}
   const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),measure=document.createElementNS(ns,'text');
   if(!svg.animate||!window.ResizeObserver){clear();return}
   svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
   measure.setAttribute('x','0');measure.setAttribute('y','0');measure.setAttribute('visibility','hidden');measure.textContent=host.dataset.text||host.textContent;svg.append(measure);slot.replaceChildren(svg);
   const box=measure.getBBox(),text=measure.textContent;
   const align=()=>{const marker=document.createElement('span');marker.style.cssText='display:inline-block;width:0;height:0;padding:0;margin:0';host.append(marker);const r=host.getBoundingClientRect(),baseline=marker.getBoundingClientRect().top-r.top,scale=parseFloat(getComputedStyle(host).fontSize)/100;marker.remove();if(scale>0)svg.setAttribute('viewBox',`0 ${-baseline/scale} ${r.width/scale} ${r.height/scale}`)};
   align();resize=new ResizeObserver(align);resize.observe(host);
   // Keep the whole phrase in one text element so the script's connected
   // letters and ligatures shape exactly as they do in the fallback text.
   const clip=document.createElementNS(ns,'clipPath'),rect=document.createElementNS(ns,'rect');
   clip.id='ss-hero-fill';rect.setAttribute('x',String(box.x-100));rect.setAttribute('y',String(box.y-30));rect.setAttribute('width',String(box.width+200));rect.setAttribute('height',String(box.height+60));clip.append(rect);svg.append(clip);
   const line=()=>{const e=document.createElementNS(ns,'text');e.setAttribute('x','0');e.setAttribute('y','0');e.textContent=text;return e};
   const fill=line();fill.setAttribute('fill','currentColor');fill.setAttribute('clip-path',`url(#${clip.id})`);svg.append(fill);
   const stroke=line();stroke.setAttribute('fill','none');stroke.setAttribute('stroke','currentColor');stroke.setAttribute('stroke-width','.65');svg.append(stroke);
   animations.push(stroke.animate([{strokeDasharray:'650',strokeDashoffset:'650'},{strokeDasharray:'650',strokeDashoffset:'0'}],{duration:1800,easing:'ease-in-out',fill:'both'}));
   animations.push(rect.animate([{transform:`translateX(-${box.width+200}px)`},{transform:'translateX(0px)'}],{duration:1800,delay:450,easing:'ease-in-out',fill:'both'}));
   host.dataset.drawing='true';host.dataset.drawState='drawing';delete document.documentElement.dataset.ssTextPending;
   Promise.all(animations.map(a=>a.finished.catch(()=>{}))).then(()=>{if(run===generation)host.dataset.drawState='complete'});
  }catch{if(run===generation)clear()}
 };
 document.addEventListener('ss:intro-finished',start);reduced.addEventListener('change',()=>{if(reduced.matches)clear();else start()});
 root.addEventListener('smokers:motion',()=>{if(root.dataset.motion==='off')clear();else start()});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
