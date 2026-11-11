const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({channel:'chrome'}),p=await b.newPage(),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 const read=()=>p.evaluate(()=>{
  const rect=s=>{const r=document.querySelector(s).getBoundingClientRect();return {y:r.y,w:r.width,h:r.height}};
  return {fg:rect('.ss-hero-table'),bg:rect('.ss-flat-wallpaper'),button:rect('.ss-glovo-button'),scroll:scrollY,
   kitchen:parseFloat(document.querySelector('.ss-flat-scene').style.getPropertyValue('--kitchen-shift')),
   table:parseFloat(document.querySelector('.ss-flat-scene').style.getPropertyValue('--table-shift'))};
 });
 try{
  for(const [w,h] of [[1900,915],[1440,900],[390,844]]){
   await p.setViewportSize({width:w,height:h});await p.goto('http://127.0.0.1:4173/en/at-home/');
   await p.locator('.ss-skip-intro').click();await p.waitForTimeout(2800);
   await p.locator('.ss-hero-table').evaluate(e=>e.decode());const start=await read();
   assert(start.button.h>=44&&start.button.h<=68);assert(start.button.w<=340);
   await p.evaluate(()=>scrollTo({top:250,behavior:'instant'}));await p.waitForTimeout(700);const end=await read();
   assert(Math.abs(end.fg.w-start.fg.w)<.1,'table must never expand');
   assert(Math.abs(end.fg.h-start.fg.h)<.1,'table height stays fixed');
   const near=start.fg.y-end.fg.y,far=start.bg.y-end.bg.y;
   assert(near>far+30&&near<far+90,'subtle depth: foreground moves faster than kitchen');
   assert(near>250&&near<285&&far>190&&far<250,'natural layer speeds');
   await p.screenshot({path:`output/qa/layered-v7-${w}-scroll.png`});
   await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(700);
   const back=await read();assert(Math.abs(back.fg.y-start.fg.y)<.1);assert.equal(back.table,0);assert.equal(back.kitchen,0);
   await p.screenshot({path:`output/qa/layered-v7-${w}-start.png`});
   console.log('PASS fixed size, depth and reverse',w);
  }
  // Abrupt native-scroll changes must not leave either plane catching up.
  for(const [w,h] of [[1440,900],[390,844]]){
   await p.setViewportSize({width:w,height:h});
   for(const top of [250,100,300,0]){
    await p.evaluate(async y=>{scrollTo({top:y,behavior:'instant'});await new Promise(requestAnimationFrame);await new Promise(requestAnimationFrame)},top);
    const immediate=await read();await p.waitForTimeout(180);const stopped=await read();
    assert.deepEqual(stopped,immediate,'no drift after scrolling stops');
    assert(Math.abs(immediate.kitchen-top*.18)<.1);assert(Math.abs(immediate.table+top*.08)<.1);
   }
  }
  // Check rendered transforms every wheel frame, including reversal.
  await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(100);
  await p.evaluate(()=>{
   window.motionFrames=[];window.sampleMotion=true;
   function sample(){
    const hero=document.querySelector('.ss-kitchen-hero'),travel=Math.max(0,Math.min(hero.offsetHeight,-hero.getBoundingClientRect().top));
    const matrix=s=>new DOMMatrixReadOnly(getComputedStyle(document.querySelector(s)).transform);
    const near=matrix('.ss-hero-foreground'),far=matrix('.ss-flat-wallpaper');
    motionFrames.push({scroll:scrollY,travel,near:near.m42,far:far.m42,scale:near.m11});
    if(sampleMotion)requestAnimationFrame(sample);
   }
   requestAnimationFrame(sample);
  });
  await p.mouse.move(720,400);await p.mouse.wheel(0,320);await p.waitForTimeout(170);
  await p.mouse.wheel(0,-120);await p.waitForTimeout(900);
  const frames=await p.evaluate(()=>{sampleMotion=false;return motionFrames});
  assert(frames.some((f,i)=>i&&f.scroll>frames[i-1].scroll),'forward scroll sampled');
  assert(frames.some((f,i)=>i&&f.scroll<frames[i-1].scroll),'reverse scroll sampled');
  for(const f of frames){
   assert(Math.abs(f.near+f.travel*.08)<.15,'table stays locked to page scroll');
   assert(Math.abs(f.far-f.travel*.18)<.15,'kitchen stays locked to page scroll');
   assert.equal(f.scale,1,'no table zoom during motion');
  }
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForTimeout(200);
  const reduced=await read();assert.equal(reduced.kitchen,0);assert.equal(reduced.table,0);
  await p.evaluate(()=>scrollTo({top:400,behavior:'instant'}));await p.waitForTimeout(200);
  assert.equal((await read()).kitchen,0);assert.equal((await read()).table,0);
  assert.deepEqual(errors,[]);console.log('PASS synchronized wheel frames, reversal, no drift and reduced motion');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
