const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({channel:'chrome'}),errors=[],layouts=[];
 try{
 const p=await b.newPage({reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
 for(const [width,height]of [[1920,1080],[1795,956],[1440,900],[1366,650],[1024,600],[820,1180],[768,1024],[390,844],[320,740]]){
  await p.setViewportSize({width,height});
  for(const [lang,home,pro]of [['en','at-home','professionals'],['es','en-casa','profesionales'],['ca','a-casa','professionals']]){
   await p.goto(`http://127.0.0.1:4173/${lang}/${home}/`);await p.evaluate(()=>document.fonts.ready);
   assert.equal(await p.locator('.ss-flat-tagline').count(),0);assert.equal(await p.locator('.ss-brand-fire canvas').count(),1);assert.equal(await p.locator('.ss-orbit i').count(),0);
   for(const dish of [0,8,4,1,7]){
    await p.locator(`[data-dish="${dish}"]`).click();await p.waitForFunction(i=>document.querySelector('.ss-wheel-center img').alt===window.SMOKERS_PRODUCTS[i].names[['es','ca','en'].indexOf(document.documentElement.lang)],dish);
    assert.equal(await p.locator('.ss-wheel-center').getAttribute('data-product'),String(dish));
   }
   const wheelIssues=await p.locator('#ss-carta').evaluate(el=>{let issues=[];for(const e of el.querySelectorAll('.ss-wheel-copy,.ss-wheel-info,.ss-wheel-info h3,.ss-wheel-info .ss-actions,.ss-satellite')){let r=e.getBoundingClientRect();if(r.left<-.5||r.right>innerWidth+.5||e.scrollWidth>e.clientWidth+2)issues.push(e.className)}return issues});
   layouts.push({width,height,lang,panel:'wheel',issues:wheelIssues});
   await p.goto(`http://127.0.0.1:4173/${lang}/${pro}/`);await p.evaluate(()=>document.fonts.ready);await p.locator('.ss-pro-front [data-action=process]').click();
   const methodIssues=await p.locator('.ss-pro-back').evaluate(el=>{const issues=[],f=el.getBoundingClientRect();for(const e of el.querySelectorAll('.ss-process-copy,.ss-process-copy h2,.ss-process-detail,.ss-process-rows li,.ss-process-row-copy,.ss-stats,.ss-actions')){const r=e.getBoundingClientRect();if(r.left<0||r.right>innerWidth+.5||e.scrollWidth>e.clientWidth+2)issues.push('overflow '+e.className);if(r.bottom>f.bottom+1)issues.push('clipped '+e.className)}return issues});
   layouts.push({width,height,lang,panel:'method',issues:methodIssues});
   assert(await p.locator('.ss-pro-back').evaluate(el=>window.SMOKERS_COPY[document.documentElement.lang].processRows.every(row=>row.every(text=>el.textContent.includes(text)))),'original professional details must remain');
   assert(await p.locator('.ss-pro-back').evaluate(el=>getComputedStyle(el).backgroundImage.includes('process-reference')));
   await p.locator('.ss-pro-back [data-action=process]').click();assert(await p.locator('.ss-pro-back').evaluate(e=>e.inert));
  }
 }
 // Inspect real animation interpolation and rapid changes with motion enabled.
 await p.setViewportSize({width:1440,height:900});await p.emulateMedia({reducedMotion:'no-preference'});await p.goto('http://127.0.0.1:4173/en/at-home/');await p.keyboard.press('Tab');
 await p.locator('.ss-brand-fire[data-ready=true]').waitFor({timeout:10000});
 await p.locator('#ss-carta').scrollIntoViewIfNeeded();
 const transforms=await p.locator('[data-dish="1"]').evaluate(e=>{document.querySelector('[data-spin="1"]').click();getComputedStyle(e).transform;const a=e.getAnimations().find(a=>a.transitionProperty==='transform');if(!a)return null;a.pause();a.currentTime=0;const start=getComputedStyle(e).transform;a.currentTime=400;const middle=getComputedStyle(e).transform;a.finish();return{start,middle}});
 assert(transforms&&transforms.start!==transforms.middle,'wheel needs real interpolated movement');
 await p.evaluate(()=>{for(let i=0;i<13;i++)document.querySelector('[data-spin="1"]').click()});
 await p.waitForFunction(()=>{const center=document.querySelector('.ss-wheel-center');return center.querySelector('.ss-center-image')?.alt===window.SMOKERS_PRODUCTS[+center.dataset.product].names[2]});
 await p.waitForTimeout(750);assert.equal(await p.locator('.ss-wheel-center img').count(),1,'outgoing photos cleaned up');
 await p.locator('.ss-wheel-center').click();assert(await p.locator('dialog').evaluate(e=>e.open));await p.keyboard.press('Escape');assert(await p.locator('.ss-wheel-center').evaluate(e=>e===document.activeElement));
 await p.locator('[data-action=motion]').click();assert.equal(await p.locator('.ss-satellite').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 fs.writeFileSync('output/qa/experience-refinements-results.json',JSON.stringify({layouts,errors},null,2));
 assert.deepEqual(layouts.filter(x=>x.issues.length),[]);assert.deepEqual(errors,[]);
 console.log(`PASS: ${layouts.length} localized wheel/process layouts; original details preserved; flame playback; wheel animation, rapid selection, dialog focus and reduced motion.`);
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
