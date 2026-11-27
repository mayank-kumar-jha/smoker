const {chromium}=require('playwright'),assert=require('node:assert/strict');
const base=process.env.QA_BASE||'http://127.0.0.1:4173';
(async()=>{
 const browser=await chromium.launch({channel:process.env.CI?undefined:'chrome'});
 for(const [width,height] of [[320,568],[390,844],[768,900],[1024,768]]){
  const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>sessionStorage.setItem('smokers-skip-intro',location.pathname));
  await page.goto(base+'/en/professionals/');
  const hero=page.locator('.ss-b2b-hero'),before=await hero.boundingBox();
  await page.evaluate(()=>{window.processOpacities=[];const observer=new MutationObserver(()=>{const started=performance.now();const sample=()=>{window.processOpacities.push(Number(getComputedStyle(document.querySelector('.ss-method-copy h2')).opacity));if(performance.now()-started<1500)requestAnimationFrame(sample)};requestAnimationFrame(sample)});observer.observe(document.querySelector('.ss-pro-hero'),{attributes:true,attributeFilter:['class']})});
  await page.locator('.ss-b2b-process-link').click();
  const after=await hero.boundingBox();assert(Math.abs(before.height-after.height)<1,`${width}: panel changed hero height`);
  const panel=page.locator('.ss-pro-back');assert.equal(await panel.getAttribute('aria-hidden'),'false');
  const transition=await page.locator('.ss-method-copy h2').evaluate(el=>getComputedStyle(el).transitionDuration);assert.notEqual(transition,'0s');
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.ss-method-steps li:last-child')).opacity==='1',null,{timeout:5000});
  assert(await page.evaluate(()=>window.processOpacities.some(value=>value>0&&value<.99)),'Process heading should animate in');
  await page.locator('.ss-method-steps li').last().scrollIntoViewIfNeeded();assert(await page.locator('.ss-method-steps li').last().isVisible());
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('.ss-method-back').click();assert.equal(await panel.getAttribute('aria-hidden'),'true');
  assert.deepEqual(errors,[]);await page.close();console.log('PASS process panel',width,height);
 }
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
