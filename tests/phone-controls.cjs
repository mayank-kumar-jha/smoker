const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base='http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce',hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>sessionStorage.setItem('smokers-skip-intro',location.pathname));
 const open=async path=>{await page.goto(base+path);await page.evaluate(()=>{window.SMOKERS_PRO_INTRO_CANCEL?.();document.documentElement.style.scrollBehavior='auto'});await page.waitForTimeout(450);await page.evaluate(()=>document.fonts.ready)};
 const desktop={};
 for(const width of [768,1440]){
  await page.setViewportSize({width,height:900});
  for(const path of ['/en/at-home/','/en/professionals/']){
   await open(path);
   desktop[width+path]=await page.locator('.ss-header,.ss-b2b-hero,.dsh-plates,.dsh-strip,.ss-order-copy>.ss-lead,.ss-shop-link,.ss-chicken-dish').evaluateAll(els=>els.map(e=>{const s=getComputedStyle(e);return [e.className,...['display','width','height','padding','margin','order','backgroundColor','backdropFilter'].map(p=>s[p])]}));
  }
 }
 const baseline='output/qa/phone-desktop-baseline.json';
 if(process.argv.includes('--baseline')){fs.writeFileSync(baseline,JSON.stringify(desktop,null,2));await browser.close();return}
 assert.deepEqual(desktop,JSON.parse(fs.readFileSync(baseline)),'Tablet and laptop styles unchanged');
 for(const [width,height] of [[320,568],[360,800],[375,667],[390,844],[412,915],[430,932]]){
  await page.setViewportSize({width,height});
  for(const [lang,home,pro] of [['en','at-home','professionals'],['es','en-casa','profesionales'],['ca','a-casa','professionals']]){
   for(const path of [`/${lang}/${home}/`,`/${lang}/${pro}/`]){
    await open(path);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`Overflow ${width} ${path}`);
    const bars=await page.locator('.ss-menu-toggle').evaluate(e=>{const a=[...e.children].map(c=>c.getBoundingClientRect());return {gap:a[1].top-a[0].bottom,third:getComputedStyle(e,'::after').height}});
    assert(bars.gap>=5&&bars.third==='2px',`Hamburger ${width} ${path}`);
    await page.locator('.ss-menu-toggle').click();assert(await page.locator('#ss-mobile-nav').isVisible());
    await page.locator('.ss-menu-toggle').click();assert(await page.locator('#ss-mobile-nav').isHidden());
    if(path.includes(home)){
     assert(await page.locator('.ss-shop-link').isHidden());
     assert.equal(await page.locator('.ss-order-copy>.ss-lead').evaluate(e=>getComputedStyle(e).backdropFilter),'none');
     const order=await page.locator('.dsh-canvas').evaluate(e=>{const r=s=>e.querySelector(s).getBoundingClientRect();return r('.dsh-strip').top>=r('.dsh-plates').bottom&&r('.dsh-strip').bottom<=r('.dsh-acts').top});assert(order,'Arrows directly below plate');
    }else{
     const h=await page.locator('.ss-b2b-hero').evaluate(e=>e.getBoundingClientRect().height);assert(h>=height-76,'Viewport hero');
    }
   }
  }
  console.log('PASS phone geometry and controls',width,height,'all locales');
 }
 await page.setViewportSize({width:390,height:844});await open('/en/at-home/');
 await page.locator('.dsh-plates').scrollIntoViewIfNeeded();
 const selected=()=>page.locator('.dsh-pager [aria-selected=true]').getAttribute('aria-label');
 const first=await selected();
 const cdp=await page.context().newCDPSession(page);
 const swipe=async(dx,dy)=>{const b=await page.locator('.dsh-plates').boundingBox();const x=b.x+b.width/2,y=b.y+b.height/2;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/6,y:y+dy*i/6}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(200)};
 await swipe(-100,0);assert.notEqual(await selected(),first,'Touch swipe changes dish');
 await swipe(100,0);assert.equal(await selected(),first,'Reverse swipe returns');
 await swipe(0,-100);assert.equal(await selected(),first,'Vertical touch preserves dish');
 await page.locator('.dsh-strip .dsh-arrow').last().click();assert.notEqual(await selected(),first,'Arrow still works');
 await page.locator('.ss-orbit-menu').screenshot({path:'output/qa/phone-menu-updated.png'});
 assert(await page.locator('.dsh-plates,.dsh-head,.dsh-card,.dsh-strip').evaluateAll(es=>es.every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth})),'Touch scrolling must not shift or clip the menu');
 await page.locator('#ss-pedir').screenshot({path:'output/qa/phone-order-updated.png'});
 await page.emulateMedia({reducedMotion:'no-preference'});await open('/en/professionals/');
 await page.waitForFunction(()=>document.querySelector('#ss-signatures')?.dataset.scrollMotion==='phone');
 const at=async(i,f)=>{await page.locator('.ss-chicken-dish').nth(i).evaluate((e,f)=>scrollTo({top:e.getBoundingClientRect().top+scrollY-innerHeight*f,behavior:'instant'}),f);await page.waitForTimeout(1200)};
 for(let i=0;i<2;i++){
  await at(i,.9);assert.equal(await page.locator('.ss-chicken-plate').nth(i).evaluate(e=>getComputedStyle(e).opacity),'0','Dish waits for fixed trigger');
  await at(i,.76);assert.equal(await page.locator('.ss-chicken-plate').nth(i).evaluate(e=>getComputedStyle(e).opacity),'1','Dish enters after trigger');
 }
 await page.locator('#ss-signatures').screenshot({path:'output/qa/phone-pro-dishes-updated.png'});
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'output/qa/phone-pro-hero-updated.png'});
 assert.deepEqual(errors,[]);console.log('PASS touch swipes, arrows, fixed scroll entrances, reduced motion, desktop preservation');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
