const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const base=process.env.QA_BASE||'http://127.0.0.1:4173',browser=await chromium.launch({channel:process.env.CI?undefined:'chrome',headless:true});const errors=[],metrics={};
 const page=await browser.newPage({reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,360,390,430,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const [lang,home,pro,contact]of [['en','at-home','professionals','contact'],['es','en-casa','profesionales','contacto'],['ca','a-casa','professionals','contacte']])for(const route of [home,pro,contact,'blog']){
   const response=await page.goto(`${base}/${lang}/${route}/`);assert.equal(response.status(),200);await page.evaluate(()=>document.fonts.ready);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${width}/${lang}/${route}`);
   assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.ss-mobile-order-bar').count(),0);
   if(width<640){await page.locator('.ss-menu-toggle').click();assert(await page.locator('#ss-mobile-nav').isVisible());await page.keyboard.press('Escape');assert(await page.locator('#ss-mobile-nav').isHidden());}
   if(route===home||route===pro){await page.locator(route===home?'.ss-orbit-mount':'.ss-pro-showcase-mount').scrollIntoViewIfNeeded();await page.waitForFunction(name=>typeof window[name]==='function',route===home?'SMOKERS_MOUNT_ORBIT':'SMOKERS_MOUNT_PRO');}
   const scripts=await page.locator('script[src]').evaluateAll(es=>es.map(e=>e.getAttribute('src')));assert.equal(scripts.some(s=>s.includes('orbit-menu.js')),route===home);assert.equal(scripts.some(s=>s.includes('pro-showcase.js')),route===pro);
  }
 }
 for(const [name,route]of [['home','/en/at-home/'],['pro','/en/professionals/'],['contact','/en/contact/']]){const p=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});await p.goto(base+route);await p.waitForTimeout(700);metrics[name]=await p.evaluate(()=>performance.getEntriesByType('resource').reduce((n,r)=>n+r.transferSize,0));assert(metrics[name]<2500000,name+' initial transfer');await p.close()}
 const motion=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'no-preference'});await motion.addInitScript(()=>localStorage.setItem('smokers-motion','off'));await motion.goto(base+'/en/at-home/');await motion.locator('#ss-carta').scrollIntoViewIfNeeded();await motion.locator('.dsh-arrow').last().click();await motion.waitForFunction(()=>document.querySelectorAll('.dsh-orbit')[1]?.getAttribute('aria-hidden')==='false');const state=await motion.locator('.dsh-orbit').evaluateAll(es=>es.slice(0,2).map(e=>({opacity:getComputedStyle(e).opacity,transform:getComputedStyle(e).transform})));assert.equal(state[0].opacity,'0');assert.equal(state[1].opacity,'1');assert(['none','matrix(1, 0, 0, 1, 0, 0)'].includes(state[1].transform));
 await motion.locator('[data-action=motion]').click();await motion.locator('.dsh-arrow').last().click();await motion.waitForTimeout(120);assert.notEqual(await motion.locator('.dsh-orbit').nth(1).evaluate(e=>getComputedStyle(e).transform),'matrix(1, 0, 0, 1, 0, 0)');await motion.waitForTimeout(1600);assert.equal(await motion.locator('.dsh-orbit').nth(2).getAttribute('aria-hidden'),'false');
 assert.deepEqual(errors,[]);fs.mkdirSync('output/phase1',{recursive:true});fs.writeFileSync('output/phase1/frontend-tests.json',JSON.stringify({passed:true,widths:[320,360,390,430,768,1440],languages:['en','es','ca'],metrics,motionToggle:true,browserErrors:errors},null,2));console.log('PASS production frontend: 72 page/viewport checks, scoped bundles, transfer budgets, motion preference.',metrics);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
