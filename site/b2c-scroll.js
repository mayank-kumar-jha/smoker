/* Fixed scroll triggers. CSS completes each entrance independently of wheel movement. */
window.SMOKERS_B2C_MOTION=(root,motionEnabled)=>{
 const hero=root.querySelector('.ss-kitchen-hero');if(!hero)return ()=>{};
 const sections=[...root.querySelectorAll('main section,.ss-footer')];
 const stage=root.querySelector('.ss-fan-stage'),menu=root.querySelector('.ss-fan-menu');
 const scene=hero.querySelector('.ss-flat-scene'),photo=hero.querySelector('.ss-flat-wallpaper');
 const foreground=hero.querySelector('.ss-hero-foreground'),table=hero.querySelector('.ss-hero-table');
 const steam=hero.querySelector('.ss-chicken-steam'),copy=hero.querySelector('.ss-flat-copy');
 const icons=[...root.querySelectorAll('svg.ss-panel-icon')],pending=new Set();
 const enabled=motionEnabled(),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 let positions=[],stageTop=0,frame=0,disposed=false,deckOpen=null;
 let introReady=!document.documentElement.hasAttribute('data-ss-loading');
 let wheelFrame=0,wheelGoal=scrollY,wheelPosition=scrollY,wheelLast=0,wheelDirection=0;
 root.dataset.scrollMotion=String(enabled);
 function mapSteam(){
  if(!steam||!photo.naturalWidth)return;
  const target=table||photo,parent=foreground||scene;
  const reference=hero.classList.contains('ss-reference-v8');
  const r=target.getBoundingClientRect(),s=parent.getBoundingClientRect();
  const factor=s.width/parent.clientWidth||1;
  const width=r.width/factor,height=r.height/factor,left=(r.left-s.left)/factor,top=(r.top-s.top)/factor;
  // Source-image coordinates keep the two steam beds attached to the shoulders
  // at every cover crop. The broad fade protects copy without a hard clip edge.
  const safeTop=reference?0:Math.max(0,(copy.querySelector('.ss-flat-description').getBoundingClientRect().bottom-s.top)/factor+6);
  steam.style.maskImage=`linear-gradient(to bottom,transparent ${safeTop}px,#000 ${safeTop+Math.min(48,s.height*.065)}px)`;
  (reference?[[.48,.56,.25,.27],[.60,.55,.23,.25]]:[[.44,.75,.13,.30],[.57,.72,.11,.27]]).forEach(([x,y,w,h],i)=>{
   const anchorX=left+width*x,anchorY=top+height*y;
   const plumeWidth=width*w;
   // The opaque CTA sits above the steam; keep wisps tall instead of cutting them at its edge.
   const limit=safeTop+12;
   const plumeHeight=Math.max(0,Math.min(height*h,anchorY-limit));
   Object.assign(steam.children[i].style,{left:anchorX+'px',top:(anchorY-plumeHeight)+'px',width:(reference?plumeWidth:Math.min(plumeWidth,plumeHeight*.8))+'px',height:plumeHeight+'px',visibility:plumeHeight>16?'visible':'hidden'});
  });
 }
 function measure(){
  positions=sections.map(el=>{const r=el.getBoundingClientRect();return {el,top:r.top+scrollY,height:r.height}});
  stageTop=stage?stage.getBoundingClientRect().top+scrollY:0;request();
 }
 function paint(){
  frame=0;if(disposed)return;
  const travel=enabled&&introReady&&!hero.classList.contains('ss-reference-v8')?clamp(-hero.getBoundingClientRect().top,0,hero.offsetHeight):0;
  // Both planes use the actual scroll position in the same frame. Smoothing
  // belongs to the page scroll only: easing these offsets again causes recoil.
  scene.style.setProperty('--kitchen-shift',`${travel*.18}px`);
  scene.style.setProperty('--table-shift',`${-travel*.08}px`);
  root.dataset.heroVisible=String(hero.getBoundingClientRect().bottom>80);
  for(const {el,top,height} of positions){
   const y=top-scrollY,bottom=y+height;
   let entered=el.dataset.chapterEntered==='true';
   if(!enabled)entered=true;
   else if(el===hero&&!introReady)entered=false;
   else if(y<=innerHeight*.78&&bottom>=innerHeight*.12)entered=true;
   else if(y>innerHeight*1.08||bottom<-innerHeight*.25)entered=false;
   if(el.dataset.chapterEntered!==String(entered))el.dataset.chapterEntered=String(entered);
  }
  if(menu){
   const stageY=stageTop-scrollY;
   if(!enabled){menu.dataset.menuPhase='ready';menu.dataset.deckOpen='true'}
   else if(!menu.dataset.menuPhase){menu.dataset.menuPhase='waiting'}
   if(enabled&&menu.dataset.menuPhase==='waiting'&&stageY<=innerHeight*.7&&menu.getBoundingClientRect().bottom>0){
    menu.dataset.menuPhase='flipping';menu.dataset.deckOpen='true';
    const spread=setTimeout(()=>{pending.delete(spread);if(disposed)return;menu.dataset.menuPhase='spreading';
     const ready=setTimeout(()=>{pending.delete(ready);if(!disposed){menu.dataset.menuPhase='ready';menu.dispatchEvent(new Event('ss:menu-ready',{bubbles:true}))}},1000);pending.add(ready);
    },1050);pending.add(spread);
   }
  }
  if(!document.documentElement.hasAttribute('data-ss-loading'))introReady=true;
  if(steam){steam.dataset.visible=String(enabled&&introReady&&!document.hidden&&hero.getBoundingClientRect().bottom>0);mapSteam()}
 }
 function request(){if(!frame&&!disposed)frame=requestAnimationFrame(paint)}
 // Smooth discrete mouse-wheel steps; precision trackpads, touch, nested scroll
 // areas, dialogs, browser zoom and keyboard navigation retain native handling.
 function cancelWheel(){cancelAnimationFrame(wheelFrame);wheelFrame=0;wheelLast=0;wheelGoal=wheelPosition=scrollY;wheelDirection=0}
 function scrollFrame(top){
  scrollTo({top,behavior:'instant'});
  // Wheel scrolling runs in rAF; update both planes before this frame is drawn.
  cancelAnimationFrame(frame);paint();
 }
 function glide(now){
  const dt=wheelLast?Math.min(50,now-wheelLast):16;wheelLast=now;
  wheelGoal=clamp(wheelGoal,0,Math.max(0,document.documentElement.scrollHeight-innerHeight));
  const next=wheelPosition+(wheelGoal-wheelPosition)*(1-Math.exp(-dt/115));
  if(Math.abs(next-wheelGoal)<1){scrollFrame(wheelGoal);wheelFrame=0;wheelLast=0;return}
  wheelPosition=next;scrollFrame(next);wheelFrame=requestAnimationFrame(glide);
 }
 function wheel(event){
  if(!enabled||event.defaultPrevented||!event.cancelable||event.ctrlKey||event.metaKey||event.shiftKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||root.querySelector('dialog[open]')||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  const coarse=event.deltaMode!==0||(Number.isInteger(event.deltaY)&&Math.abs(event.deltaY)>=60);
  if(!coarse){cancelWheel();return}
  const delta=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?innerHeight:1),direction=Math.sign(delta);
  if(!direction)return;
  for(const el of event.composedPath()){
   if(!(el instanceof Element)||el===root||el===document.body)continue;
   if(el.scrollHeight>el.clientHeight+2&&/(auto|scroll)/.test(getComputedStyle(el).overflowY)&&((direction>0&&el.scrollTop+el.clientHeight<el.scrollHeight-1)||(direction<0&&el.scrollTop>0))){cancelWheel();return}
  }
  if(!wheelFrame||direction!==wheelDirection){wheelGoal=wheelPosition=scrollY;wheelLast=0}
  wheelDirection=direction;
  wheelGoal=clamp(wheelGoal+delta,0,Math.max(0,document.documentElement.scrollHeight-innerHeight));
  if(!wheelFrame&&Math.abs(wheelGoal-scrollY)<1)return;
  event.preventDefault();if(!wheelFrame)wheelFrame=requestAnimationFrame(glide);
 }
 function cycle(){
  if(!enabled||document.hidden)return;
  const visible=icons.filter(icon=>{const r=icon.getBoundingClientRect();return r.width&&r.bottom>0&&r.top<innerHeight});
  visible.forEach((icon,i)=>{const timer=setTimeout(()=>{pending.delete(timer);if(!icon.isConnected||!motionEnabled())return;icon.classList.remove('ss-icon-cycle');void icon.getBoundingClientRect();icon.classList.add('ss-icon-cycle')},i*Math.min(220,3500/Math.max(1,visible.length)));pending.add(timer)});
 }
 const visibility=()=>{if(document.hidden){cancelWheel();pending.forEach(clearTimeout);pending.clear()}else cycle();request()};
 const introFinished=()=>{introReady=true;request()};
 // A focused control must never remain visually hidden behind an entrance state.
 const focus=event=>{const section=event.target.closest('section,.ss-footer');if(section&&sections.includes(section))section.dataset.chapterEntered='true'};
 const observer=new ResizeObserver(measure);sections.forEach(el=>observer.observe(el));observer.observe(copy);
 addEventListener('scroll',request,{passive:true});addEventListener('resize',measure);
 if(enabled)addEventListener('wheel',wheel,{passive:false});
 addEventListener('pointerdown',cancelWheel,{passive:true});addEventListener('keydown',cancelWheel);addEventListener('touchstart',cancelWheel,{passive:true});
 document.addEventListener('visibilitychange',visibility);document.addEventListener('ss:intro-finished',introFinished);document.addEventListener('ss:intro-revealing',introFinished);photo.addEventListener('load',measure);table?.addEventListener('load',measure);root.addEventListener('focusin',focus);
 document.fonts.ready.then(()=>{if(!disposed)measure()});measure();cycle();const interval=setInterval(cycle,5000);
 return ()=>{
  disposed=true;['--kitchen-shift','--table-shift'].forEach(v=>scene.style.removeProperty(v));cancelAnimationFrame(frame);cancelWheel();clearInterval(interval);pending.forEach(clearTimeout);observer.disconnect();
  removeEventListener('scroll',request);removeEventListener('resize',measure);removeEventListener('wheel',wheel);removeEventListener('pointerdown',cancelWheel);removeEventListener('keydown',cancelWheel);removeEventListener('touchstart',cancelWheel);
  document.removeEventListener('visibilitychange',visibility);document.removeEventListener('ss:intro-finished',introFinished);document.removeEventListener('ss:intro-revealing',introFinished);photo.removeEventListener('load',measure);table?.removeEventListener('load',measure);root.removeEventListener('focusin',focus);
  if(menu){delete menu.dataset.menuPhase;delete menu.dataset.deckOpen}delete root.dataset.scrollMotion;sections.forEach(el=>delete el.dataset.chapterEntered);menu?.style.removeProperty('--deck-spread');icons.forEach(icon=>icon.classList.remove('ss-icon-cycle'));if(steam)steam.dataset.visible='false';
 };
};
