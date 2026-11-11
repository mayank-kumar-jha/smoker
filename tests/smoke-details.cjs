/* Entry redirects, intro failure recovery, and the redesigned dish/process layouts. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'}),base='http://127.0.0.1:4173';
 const page=await browser.newPage({reducedMotion:'reduce'}),errors=[],layouts=[];
 page.on('pageerror',error=>errors.push(error.message));
 const info=JSON.parse(fs.readFileSync('output/full-site/build-info.json'));
 for(const [from,to] of [['/','/es/en-casa/'],['/es/','/es/en-casa/'],['/en/','/en/at-home/'],['/ca/','/ca/a-casa/']]){
  const response=await page.request.get(base+from,{maxRedirects:0});assert.equal(response.status(),301);assert.equal(response.headers().location,to);
 }
 await page.goto(base+'/');assert.equal(new URL(page.url()).pathname,'/es/en-casa/');assert.equal(await page.locator('html').getAttribute('lang'),'es');assert.equal(await page.locator('.ss-gate').count(),0);
 const layout=async label=>{
  const issues=await page.evaluate(()=>{
   const errors=[];if(document.documentElement.scrollWidth>innerWidth+1)errors.push('page width overflow');
   for(const el of document.querySelectorAll('.ss-product-copy h1,.ss-product-notes article,.ss-related-dish,.ss-dish-facts,.ss-pro-back .ss-process-copy,.ss-pro-back .ss-process-detail')){
    const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;
    if(r.left<-.5||r.right>innerWidth+.5||el.scrollWidth>el.clientWidth+2)errors.push('overflow '+el.className);
    const face=el.closest('.ss-pro-back');if(face&&!face.inert){const f=face.getBoundingClientRect();if(r.top<f.top-1||r.bottom>f.bottom+1)errors.push('process content clipped');}
   }return errors;
  });layouts.push({label,issues});
 };
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  for(const p of info.pages.filter(p=>p.mode==='product')){
   await page.goto(base+p.path);await page.evaluate(()=>document.fonts.ready);await layout(width+' '+p.path);
  }
 }
 for(const [width,height] of [[1820,864],[1366,768],[1024,600],[820,1180],[390,844],[320,740]]){
  await page.setViewportSize({width,height});
  for(const path of ['/en/professionals/','/es/profesionales/','/ca/professionals/']){
   await page.goto(base+path);await page.evaluate(()=>document.fonts.ready);
   await page.locator('.ss-pro-front [data-action=process]').click();await layout(`${width}x${height} ${path} reverse`);
   assert.equal(await page.locator('.ss-pro-front').evaluate(el=>el.inert),true);
   await page.locator('.ss-pro-back [data-action=process]').click();assert.equal(await page.locator('.ss-pro-back').evaluate(el=>el.inert),true);
  }
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/en/at-home/');
 const trigger=page.locator('.ss-wheel-info [data-product]');await trigger.click();assert.equal(await page.locator('dialog').evaluate(el=>el.open),true);
 assert.equal(await page.locator('.ss-detail-copy').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);await page.keyboard.press('Escape');assert.equal(await trigger.evaluate(el=>el===document.activeElement),true);
 const intro=await browser.newPage({viewport:{width:1440,height:900}});
 await intro.goto(base+'/',{waitUntil:'domcontentloaded'});assert.equal(await intro.locator('html').getAttribute('data-ss-loading'),'true');
 await intro.locator('.ss-header .ss-logo .ss-logo-base').evaluate(img=>img.decode());await intro.screenshot({path:'output/qa/new-preloader.png'});
 await intro.waitForFunction(()=>!document.documentElement.dataset.ssLoading,{},{timeout:13000});
 await intro.reload({waitUntil:'domcontentloaded'});await intro.keyboard.press('Tab');assert.equal(await intro.locator('html').getAttribute('data-ss-loading'),null);
 await intro.route('**/assets/home-reference*',route=>route.abort());await intro.reload({waitUntil:'domcontentloaded'});await intro.waitForFunction(()=>!document.documentElement.dataset.ssLoading,{},{timeout:13000});
 await intro.emulateMedia({reducedMotion:'reduce'});await intro.reload();assert.equal(await intro.locator('.ss-loader').isVisible(),false);
 await intro.emulateMedia({reducedMotion:'no-preference'});await intro.evaluate(()=>localStorage.setItem('smokers-motion','off'));await intro.reload();assert.equal(await intro.locator('.ss-loader').isVisible(),false);
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(base+'/');assert.equal(await nojs.locator('.ss-loader').isVisible(),false);assert.equal(await nojs.locator('h1').isVisible(),true);
 await page.setViewportSize({width:1820,height:864});await page.goto(base+'/en/professionals/');await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].filter(i=>i.loading!=='lazy').map(i=>i.decode().catch(()=>{})))});await page.screenshot({path:'output/qa/final-pro.png'});
 await page.locator('.ss-pro-front [data-action=process]').click();await page.locator('.ss-process-thumbnail img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));await page.screenshot({path:'output/qa/final-process.png'});
 fs.writeFileSync('output/qa/smoke-details-results.json',JSON.stringify({layouts,errors},null,2));
 assert.deepEqual(layouts.filter(result=>result.issues.length),[]);assert.deepEqual(errors,[]);
 console.log(`PASS: ${layouts.length} dish/process layouts; home redirects; modal focus; intro completion, keyboard skip, failed image, motion settings and no-JS.`);
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
