const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.QA_BASE||'http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({channel:process.env.CI?undefined:'chrome'});
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>sessionStorage.setItem('smokers-skip-intro',location.pathname));
  let release;const gate=new Promise(resolve=>release=resolve);
  await page.route('**/hero-text.js',async route=>{await gate;await route.continue()});
  await page.goto(base+'/en/at-home/',{waitUntil:'commit'});
  await page.waitForSelector('.ss-eat-fallback');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.ss-eat-fallback')).opacity==='0');
  assert.equal(await page.locator('.ss-eat-animation').getAttribute('data-drawing'),null);
  release();
  await page.waitForSelector('.ss-eat-animation[data-drawing]');
  assert.equal(await page.locator('.ss-eat-fallback').evaluate(el=>getComputedStyle(el).opacity),'0');
  await page.waitForSelector('.ss-eat-animation[data-draw-state="complete"]');
  assert.equal(await page.locator('.ss-eat-effect').evaluate(el=>getComputedStyle(el).visibility),'visible');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.ss-eat-fallback').evaluate(el=>getComputedStyle(el).opacity),'1');
  assert.deepEqual(errors,[]);await page.close();
 }
 const intro=await browser.newPage({viewport:{width:390,height:900}});
 await intro.goto(base+'/en/at-home/');
 await intro.waitForFunction(()=>document.documentElement.dataset.ssLoading==='docking',null,{timeout:20000});
 assert.equal(await intro.locator('.ss-eat-fallback').evaluate(el=>getComputedStyle(el).opacity),'0');
 await intro.waitForSelector('.ss-eat-animation[data-drawing]',{timeout:12000});await intro.close();
 const failure=await browser.newPage();await failure.addInitScript(()=>sessionStorage.setItem('smokers-skip-intro',location.pathname));
 await failure.route('**/hero-text.js',route=>route.abort());await failure.goto(base+'/en/at-home/');
 await failure.waitForFunction(()=>getComputedStyle(document.querySelector('.ss-eat-fallback')).opacity==='1',null,{timeout:7000});
 assert.equal(await failure.locator('.ss-eat-animation').getAttribute('data-drawing'),null);await failure.close();
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(base+'/en/at-home/');
 assert.equal(await nojs.locator('.ss-eat-fallback').evaluate(el=>getComputedStyle(el).opacity),'1');await nojs.close();
 await browser.close();console.log('PASS: no initial text flash, intro handoff, reduced motion, script failure and no-JS fallback');
})().catch(error=>{console.error(error);process.exit(1)});
