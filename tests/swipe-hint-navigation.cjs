const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const cdp=await page.context().newCDPSession(page);
 const selected=()=>page.locator('.dsh-pager [aria-selected=true]').getAttribute('aria-label');
 const swipe=async(dx,dy)=>{await page.locator('.dsh-card').scrollIntoViewIfNeeded();const box=await page.locator('.dsh-body[aria-hidden=false] .dsh-desc').boundingBox();const x=box.x+box.width/2,y=box.y+box.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/6,y:y+dy*i/6}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(150)};
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:844});
  for(const [lang,home,pro] of [['en','at-home','professionals'],['es','en-casa','profesionales'],['ca','a-casa','professionals']]){
   await page.goto(`http://127.0.0.1:4173/${lang}/${home}/`);
   await page.locator('.ss-menu-toggle').click();
   const colours=await page.locator('.ss-mobile-locales .ss-languages a').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);return [s.color,s.backgroundColor,e.getBoundingClientRect().height]}));
   assert(colours.every(([a,b,h])=>a!==b&&h>=44));
   if(lang==='en'&&width===390)await page.screenshot({path:'output/qa/mobile-locales-visible.png'});
   await page.locator('.ss-menu-toggle').click();
   await page.locator('.dsh-plates').scrollIntoViewIfNeeded();
   await page.locator('.dsh-swipe-hint').waitFor({state:'visible'});
   if(lang==='en'&&width===390)await page.screenshot({path:'output/qa/mobile-swipe-hint.png'});
   await page.waitForTimeout(1100);assert.equal(await page.locator('.dsh-swipe-hint').count(),0);
   const first=await selected();await swipe(-90,0);assert.notEqual(await selected(),first,'Description swipe advances');await swipe(90,0);assert.equal(await selected(),first,'Description swipe reverses');
   const before=await page.evaluate(()=>scrollY);await swipe(0,-100);assert.equal(await selected(),first);assert.notEqual(await page.evaluate(()=>scrollY),before,'Vertical gestures still scroll');
   await page.locator('.dsh-card').scrollIntoViewIfNeeded();await page.locator('.dsh-tab').last().tap();assert.equal(await page.locator('.dsh-tab').last().getAttribute('aria-selected'),'true');
   await page.locator('.dsh-plates').scrollIntoViewIfNeeded();assert.equal(await page.locator('.dsh-swipe-hint').count(),0,'Hint does not repeat');
   assert.equal(await page.locator('.ss-order-copy>.ss-eyebrow').count(),0);
   for(const arrow of await page.locator('.ss-provider-arrow').all())assert(await arrow.evaluate(e=>{const a=e.getBoundingClientRect(),s=e.querySelector('svg').getBoundingClientRect();return Math.abs(a.x+a.width/2-s.x-s.width/2)<1&&Math.abs(a.y+a.height/2-s.y-s.height/2)<1}),'Arrow centered');
   assert(!await page.locator('.ss-footer').innerText().then(t=>/Meet Smokers|Coneix Smokers|Conoce Smokers/.test(t)));
   if(lang==='en'&&width===390)await page.locator('#ss-pedir').screenshot({path:'output/qa/order-arrows-centered.png'});
   await page.goto(`http://127.0.0.1:4173/${lang}/${pro}/`);await page.locator('.ss-menu-toggle').click();
   assert.equal(await page.locator(`#ss-mobile-nav>a[href="/${lang}/${pro}/"]`).count(),0,'No redundant Home option');
   assert.equal(await page.locator(`#ss-mobile-nav>a[href="/${lang}/blog/"]`).count(),1);
  }
  console.log('PASS one-second hint, card swipes, taps, vertical scroll, arrows, locales and menu',width,'all locales');
 }
 assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
