const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({channel:'chrome'}),p=await b.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
for(const [width,height] of [[1920,820],[1440,900],[1280,600],[1280,480],[844,390],[390,844],[390,600],[320,568]]){
await p.setViewportSize({width,height});await p.goto('http://127.0.0.1:4173/en/at-home/');await p.locator('.ss-skip-intro').click();await p.waitForFunction(()=>document.querySelector('.ss-eat-animation')?.hasAttribute('data-drawing'));await p.waitForFunction(()=>document.querySelector('.ss-eat-animation')?.dataset.drawState==='complete');await p.waitForTimeout(200);
const metrics=await p.evaluate(()=>{const r=e=>{const b=document.querySelector(e).getBoundingClientRect();return {top:b.top,bottom:b.bottom,left:b.left,right:b.right}};return {hero:r('.ss-kitchen-hero'),copy:r('.ss-flat-copy'),facts:r('.ss-hero-facts'),overflow:document.documentElement.scrollWidth>innerWidth}});
assert(!metrics.overflow,JSON.stringify({width,height,metrics}));assert(metrics.copy.bottom<metrics.facts.top,JSON.stringify({width,height,metrics}));assert(metrics.facts.bottom<=height+1);assert(metrics.hero.bottom<=height+1);await p.screenshot({path:`output/qa/nov9-hero-${width}-${height}.png`});console.log('hero',width,height,'PASS');
}
await p.emulateMedia({reducedMotion:'reduce'});await p.goto('http://127.0.0.1:4173/en/at-home/');assert.equal(await p.locator('.ss-eat-fallback').evaluate(e=>getComputedStyle(e).visibility),'visible');
await p.setViewportSize({width:1440,height:900});await p.goto('http://127.0.0.1:4173/en/professionals/');await p.locator('a[href$="#ss-como"]').first().click();await p.waitForTimeout(2200);
const distance=await p.locator('.ss-method-arc').evaluate(svg=>{const path=svg.querySelector('path'),length=path.getTotalLength();return [...svg.querySelectorAll('circle')].map(c=>{let nearest=Infinity;for(let i=0;i<=4000;i++){let p=path.getPointAtLength(length*i/4000);nearest=Math.min(nearest,Math.hypot(p.x-c.cx.baseVal.value,p.y-c.cy.baseVal.value))}return nearest})});assert(distance.every(d=>d<.15),JSON.stringify(distance));await p.screenshot({path:'output/qa/nov9-process.png'});assert.deepEqual(errors,[]);console.log('Reduced motion, process dots, runtime PASS');await b.close();})().catch(e=>{console.error(e);process.exit(1)});


