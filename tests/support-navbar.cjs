const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:900});
  for(const [lang,pro,contact] of [['en','professionals','contact'],['es','profesionales','contacto'],['ca','professionals','contacte']]){
   let reference;
   for(const path of [pro,contact,'blog']){
    assert.equal((await page.goto(`http://127.0.0.1:4173/${lang}/${path}/`)).status(),200);
    const style=await page.locator('.ss-pro-flat-header').evaluate(e=>{const s=getComputedStyle(e),logo=e.querySelector('.ss-logo').getBoundingClientRect();return {height:e.getBoundingClientRect().height,background:s.backgroundColor,padding:s.padding,logoWidth:logo.width,logoX:logo.x}});
    if(path===pro){reference=style;assert(style.logoWidth<=48,'Professional header shows the compact emblem');}else {assert.equal(style.height,reference.height);assert.equal(style.background,reference.background);assert.equal(style.padding,reference.padding);}
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    if(width<=768){
     await page.locator('.ss-menu-toggle').click();assert(await page.locator('#ss-mobile-nav').isVisible());
     for(const href of [`/${lang}/${contact}/`,`/${lang}/blog/`])assert.equal(await page.locator(`#ss-mobile-nav>a[href="${href}"]`).count(),1);
     assert.equal(await page.locator('#ss-mobile-nav .ss-languages [aria-current=page]').getAttribute('lang'),lang);
     assert(await page.locator('#ss-mobile-nav').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}));
     if(lang==='en'&&width===390&&path!==pro)await page.screenshot({path:`output/qa/${path}-navbar-phone.png`});
     await page.keyboard.press('Escape');assert(await page.locator('#ss-mobile-nav').isHidden());
    }else{
     assert(await page.locator('.ss-flat-nav').isVisible());assert(await page.locator('.ss-menu-toggle').isHidden());
     if(path!==pro)assert.equal(await page.locator('.ss-flat-nav [aria-current=page]').getAttribute('href'),`/${lang}/${path}/`);
     if(lang==='en'&&path!==pro)await page.screenshot({path:`output/qa/${path}-navbar-desktop.png`});
    }
   }
  }
  console.log('PASS shared navbar, mobile controls and active links',width,'all locales');
 }
 assert.deepEqual(errors,[]);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
