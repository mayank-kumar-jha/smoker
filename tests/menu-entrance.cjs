const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({channel:'chrome'});
 for(const width of [1440,390]){
  const p=await b.newPage({viewport:{width,height:900}});
  await p.addInitScript(()=>localStorage.setItem('smokers-motion','off'));
  await p.goto('http://127.0.0.1:4173/en/at-home/');
  await p.locator('.dsh-orbit img').evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  await p.evaluate(()=>{
   window.samples=[];const end=performance.now()+2000;
   const frame=()=>{const e=document.querySelector('.dsh-plates'),s=getComputedStyle(e);samples.push({x:e.getBoundingClientRect().x,offset:s.translate,enter:parseFloat(s.getPropertyValue('--dsh-enter-x'))||0});if(performance.now()<end)requestAnimationFrame(frame)};
   requestAnimationFrame(frame);document.querySelector('#ss-carta').scrollIntoView({behavior:'instant'});
  });
  await p.waitForTimeout(2200);
  const frames=await p.evaluate(()=>samples);
  const offset=frames.at(-1).offset;
  assert.notEqual(offset,'none');
  assert.ok(frames.every(f=>f.offset===offset),'Layout offset must never be swallowed by GSAP');
  const settled=frames.filter(f=>Math.abs(f.enter)<.1);
  assert.ok(settled.length>2);
  assert.ok(Math.max(...settled.map(f=>f.x))-Math.min(...settled.map(f=>f.x))<.25,'No horizontal jump as the entrance ends');
  const x=settled.at(-1).x;
  await p.evaluate(()=>scrollBy({top:100,behavior:'instant'}));await p.waitForTimeout(300);
  assert.ok(Math.abs((await p.locator('.dsh-plates').boundingBox()).x-x)<.25,'Scrolling after entrance must not move the plate sideways');
  await p.close();
 }
 await b.close();console.log('PASS: persistent layout offset, smooth entrance endpoint and stable post-scroll plate position at desktop/mobile widths');
})().catch(e=>{console.error(e);process.exit(1)});
