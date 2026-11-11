const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{
 const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1366,height:768}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4173/es/',{waitUntil:'domcontentloaded'});
 assert.equal(await p.locator('html').getAttribute('data-ss-loading'),'true','Intro visible on fresh navigation');
 await p.screenshot({path:'output/qa/loader.png'});
 await p.waitForFunction(()=>!document.documentElement.dataset.ssLoading);
 await p.waitForTimeout(250);assert.equal(await p.locator('.ss-loader').evaluate(e=>getComputedStyle(e).visibility),'hidden');
 await p.locator('.ss-gate-pro').hover({position:{x:150,y:400}});await p.waitForTimeout(900);
 const left=await p.locator('.ss-gate-visuals').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).m41);assert(left>50);
 await p.locator('.ss-gate-home').hover({position:{x:350,y:400}});await p.waitForTimeout(900);
 const right=await p.locator('.ss-gate-visuals').evaluate(e=>new DOMMatrix(getComputedStyle(e).transform).m41);assert(right< -50);
 const center=await p.locator('.ss-emblem-mark').evaluate(e=>{const a=e.getBoundingClientRect(),b=e.querySelector('svg').getBoundingClientRect();return Math.abs(a.x+a.width/2-b.x-b.width/2)+Math.abs(a.y+a.height/2-b.y-b.height/2)});assert(center<1);
 await p.screenshot({path:'output/qa/gate-hover.png'});
 await p.goto('http://127.0.0.1:4173/es/profesionales/');await p.waitForTimeout(900);
 await p.locator('[data-action=process]').first().click();await p.waitForTimeout(1000);await p.screenshot({path:'output/qa/process-proportions.png'});
 await p.locator('#ss-carta').scrollIntoViewIfNeeded();await p.mouse.move(5,5);await p.waitForTimeout(300);
 const rows=await p.locator('.ss-food-row').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().height));assert(rows[0]>rows[1]*1.5);assert(rows[0]<rows[1]*1.7);
 const tracks=p.locator('.ss-food-track');const before=await tracks.evaluateAll(es=>es.map(e=>getComputedStyle(e).transform));await p.waitForTimeout(500);const after=await tracks.evaluateAll(es=>es.map(e=>getComputedStyle(e).transform));before.forEach((v,i)=>assert.notEqual(v,after[i]));
 assert.equal(await tracks.nth(1).evaluate(e=>getComputedStyle(e).animationDirection),'reverse');
 await p.screenshot({path:'output/qa/menu-loop.png'});
 const rowBox=await p.locator('.ss-food-row').first().boundingBox();await p.mouse.move(200,rowBox.y+rowBox.height/2);assert.equal(await tracks.first().evaluate(e=>getComputedStyle(e).animationPlayState),'paused');
 await p.locator('.ss-food-card').first().focus();assert.equal(await tracks.first().evaluate(e=>getComputedStyle(e).animationName),'none');
 await p.locator('[data-action=motion]').click();assert.equal(await tracks.first().evaluate(e=>getComputedStyle(e).animationName),'none');
 await p.goto('http://127.0.0.1:4173/es/');assert.equal(await p.locator('html').getAttribute('data-ss-loading'),null);
 const reduced=await b.newPage({reducedMotion:'reduce'});await reduced.goto('http://127.0.0.1:4173/en/professionals/');assert.equal(await reduced.locator('html').getAttribute('data-ss-loading'),null);assert.equal(await reduced.locator('.ss-food-track').first().evaluate(e=>getComputedStyle(e).animationName),'none');
 const nojs=await b.newPage({javaScriptEnabled:false});await nojs.goto('http://127.0.0.1:4173/es/');assert.equal(await nojs.locator('.ss-loader').evaluate(e=>getComputedStyle(e).visibility),'hidden');assert.equal(await nojs.locator('.ss-gate-image').count(),2);
 await nojs.goto('http://127.0.0.1:4173/es/profesionales/');assert.equal(await nojs.locator('.ss-food-group:not([aria-hidden]) .ss-food-card').count(),10);
 for(const [width,height] of [[390,844],[320,668],[820,600],[1366,768]]){await p.setViewportSize({width,height});await p.goto('http://127.0.0.1:4173/en/professionals/');assert(await p.locator('.ss-pro-menu').evaluate(e=>e.getBoundingClientRect().height<=innerHeight+1));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 assert.deepEqual(errors,[]);fs.writeFileSync('output/qa/reference-results.json',JSON.stringify({passed:true,loader:true,splitHover:{left,right},logoCenterError:center,menuRowHeights:rows,menuBothRowsMoving:true,reducedMotion:true,noJavaScript:true,errors},null,2));console.log('Reference interactions passed');await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

