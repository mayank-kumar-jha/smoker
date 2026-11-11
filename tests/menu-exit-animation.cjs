const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome'}),p=await b.newPage({viewport:{width:1440,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
try{
 for(const width of [1440,390]){
 await p.setViewportSize({width,height:900});await p.goto('http://127.0.0.1:4173/en/at-home/menu/truffle-potatoes/');await p.evaluate(()=>document.fonts.ready);await p.locator('#ss-carta').scrollIntoViewIfNeeded();await p.waitForTimeout(1200);
 for(const direction of ['Next dish','Previous dish']){
 const samples=await p.evaluate(async label=>{
  const outgoing=document.querySelector('.dsh-orbit[aria-hidden=false]');const frames=[];const start=outgoing.getBoundingClientRect();
  document.querySelector(`.dsh-strip [aria-label="${label}"]`).click();const began=performance.now();
  while(performance.now()-began<800){await new Promise(requestAnimationFrame);const s=getComputedStyle(outgoing);frames.push({time:performance.now()-began,visibility:s.visibility,opacity:+s.opacity,transform:s.transform,x:outgoing.getBoundingClientRect().x})}
  return {frames,x:start.x};
 },direction);
 const early=samples.frames.filter(f=>f.time>40&&f.time<450);assert(early.length>2);assert(early.every(f=>f.visibility==='visible'&&f.opacity>.99),'outgoing plate stays visible during exit');assert(new Set(early.map(f=>f.transform)).size>2,'outgoing plate moves through multiple frames');assert(samples.frames.at(-1).visibility==='hidden','hide only after exit');await p.waitForTimeout(800);
 }
 assert(p.url().endsWith('/truffle-potatoes/'));await p.reload();assert.equal(await p.locator('.dsh-body[aria-hidden=false] .dsh-num').textContent(),'06');console.log('PASS visible animated exit, next/previous, URL and reload',width);
 }
 await p.emulateMedia({reducedMotion:'reduce'});await p.locator('.dsh-strip [aria-label="Next dish"]').click();await p.waitForTimeout(100);assert.equal(await p.locator('.dsh-orbit[aria-hidden=true]').evaluateAll(es=>es.every(e=>getComputedStyle(e).visibility==='hidden')),true);assert.deepEqual(errors,[]);console.log('PASS reduced motion and no runtime errors');
}finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
