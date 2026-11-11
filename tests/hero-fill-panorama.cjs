const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome'}),p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const [w,h] of [[1888,910],[2560,1080],[1440,900],[390,600]]){
await p.setViewportSize({width:w,height:h});await p.goto('http://127.0.0.1:4173/en/at-home/');await p.locator('.ss-skip-intro').click();await p.waitForFunction(()=>document.querySelector('.ss-eat-animation')?.dataset.drawState==='complete');
const title=p.locator('.ss-eat-effect');const count=await title.locator('text[clip-path]').count();assert(count>0,'Masks must persist after the animation');
const masked=await title.screenshot();await title.locator('text[clip-path]').evaluateAll(es=>es.forEach(e=>e.removeAttribute('clip-path')));const unmasked=await title.screenshot();assert(masked.equals(unmasked),'Completed masks must cover every visible pixel, including italic overhangs');
const image=await p.locator('.ss-flat-wallpaper').evaluate(e=>({src:e.currentSrc,fit:getComputedStyle(e).objectFit,mask:getComputedStyle(e).maskImage}));assert.equal(image.fit,'cover');assert.equal(image.mask,'none');if(w/h>=2)assert(image.src.includes('panoramic-v4'));
await p.screenshot({path:`output/qa/panoramic-v4-${w}.png`});console.log('PASS',w,h,'complete fill pixel comparison and edge-to-edge photo');}
assert.deepEqual(errors,[]);await b.close();})().catch(e=>{console.error(e);process.exit(1)});
