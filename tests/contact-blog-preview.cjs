const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'}),base='http://127.0.0.1:4173';
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,1440]){
  await page.setViewportSize({width,height:900});
  for(const [lang,home,pro,contact] of [['en','at-home','professionals','contact'],['es','en-casa','profesionales','contacto'],['ca','a-casa','professionals','contacte']]){
   for(const route of [home,pro]){
    assert.equal((await page.goto(`${base}/${lang}/${route}/`)).status(),200);
    await page.evaluate(()=>window.SMOKERS_PRO_INTRO_CANCEL?.());
    assert.equal(await page.locator('.ss-mobile-order-bar').count(),0);
    const nav=page.locator('#ss-mobile-nav');
    assert.equal(await nav.locator(`a[href="/${lang}/${contact}/"]`).count(),1);
    assert.equal(await nav.locator(`a[href="/${lang}/blog/"]`).count(),1);
    if(route===pro)assert((await page.locator('.ss-b2b-fork').evaluate(e=>getComputedStyle(e).maskImage)).includes('linear-gradient'));
    if(width<640){
     await page.locator('.ss-menu-toggle').click();
     await nav.locator(`a[href="/${lang}/${contact}/"]`).click();
     await page.waitForURL(`**/${lang}/${contact}/`);
    }else await page.goto(`${base}/${lang}/${contact}/`);
    await page.locator('[name=name]').fill('Preview Test');await page.locator('[name=email]').fill('preview@example.com');
    await page.locator('[name=message]').fill('Hello Smokers, a preview enquiry.');await page.locator('[name=privacy]').check();
    await page.locator('[data-enquiry-submit]').click();
    const draft=await page.locator('[data-draft-open]').getAttribute('href');
    assert(draft.startsWith('mailto:info@smokers.cat?'));assert(decodeURIComponent(draft).includes('Hello Smokers'));
    assert.equal((await page.request.get(`${base}/${lang}/${lang==='en'?'privacy':lang==='es'?'privacidad':'privacitat'}/`)).status(),200);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Contact overflow');
    if(lang==='en'&&route===home)await page.screenshot({path:`output/qa/contact-${width}.png`,fullPage:true});
    if(width<640){await page.locator('.ss-menu-toggle').click();await page.locator(`#ss-mobile-nav a[href="/${lang}/blog/"]`).click();await page.waitForURL(`**/${lang}/blog/`)}else await page.goto(`${base}/${lang}/blog/`);
    assert(await page.locator('.ss-blog-empty').isVisible());
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Blog overflow');
    if(lang==='en'&&route===home)await page.screenshot({path:`output/qa/blog-${width}.png`,fullPage:true});
   }
  }
  console.log('PASS contact email draft, blog, navigation, fork fade',width,'all locales');
 }
 // Slow hydration reproduces the first-paint flash. Sample before React starts.
 const motion=await browser.newPage({viewport:{width:390,height:844}});
 await motion.addInitScript(()=>sessionStorage.setItem('smokers-skip-intro',location.pathname));
 let release;const gate=new Promise(r=>release=r);
 await motion.route('**/orbit-menu.js',async route=>{await gate;await route.continue()});
 await motion.goto(base+'/en/at-home/',{waitUntil:'commit'});
 await motion.waitForSelector('.ss-eat-fallback');
 assert.equal(await motion.locator('.ss-eat-fallback').evaluate(e=>getComputedStyle(e).opacity),'0','No text flash before hydration');
 release();await motion.waitForSelector('.ss-eat-animation[data-drawing]');
 await motion.waitForSelector('.ss-eat-animation[data-draw-state=complete]');
 assert.equal(await motion.locator('.ss-eat-effect').evaluate(e=>getComputedStyle(e).visibility),'visible');
 assert.equal(await motion.locator('html[data-ss-text-pending]').count(),0);
 await motion.screenshot({path:'output/qa/hero-text-complete.png'});
 await motion.emulateMedia({reducedMotion:'reduce'});assert.equal(await motion.locator('.ss-eat-fallback').evaluate(e=>getComputedStyle(e).opacity),'1');
 const nojs=await browser.newPage({javaScriptEnabled:false});await nojs.goto(base+'/en/at-home/');assert.equal(await nojs.locator('.ss-eat-fallback').evaluate(e=>getComputedStyle(e).opacity),'1');
 assert.deepEqual(errors,[]);console.log('PASS delayed hydration, text animation completion, reduced motion, no-JS fallback');await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
