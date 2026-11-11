/* Behaviour and responsive checks for the unified hub and continuous arc animation. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 const page=await browser.newPage({reducedMotion:'reduce'}),errors=[],layouts=[];
 page.on('pageerror',error=>errors.push(error.message));
 const routes={en:['professionals','at-home','contact'],es:['profesionales','en-casa','contacto'],ca:['professionals','a-casa','contacte']};
 for(const [width,height] of [[1806,871],[1366,768],[1024,600],[820,1180],[390,844],[320,740]]){
  await page.setViewportSize({width,height});
  for(const [lang,slugs] of Object.entries(routes))for(const slug of slugs){
   const route=`/${lang}/${slug}/`;
   await page.goto('http://127.0.0.1:4173'+route);await page.evaluate(()=>document.fonts.ready);
   const issues=await page.evaluate(()=>{
    const issues=[];
    if(document.documentElement.scrollWidth>innerWidth+1)issues.push('page overflow');
    for(const el of document.querySelectorAll('.ss-hub h1,.ss-hub h2,.ss-hub h3,.ss-hub form,.ss-reheat-heading h2,.ss-reheat-cards article,.ss-faq-answers,.ss-pro-front .ss-pro-copy,.ss-header a,.ss-header button')){
     const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;
     if(r.left<-.5||r.right>innerWidth+.5)issues.push('element overflow '+el.className+' '+el.tagName);
     if(/^H[123]$/.test(el.tagName)&&el.scrollWidth>el.clientWidth+2)issues.push('heading text overflow '+el.textContent);
    }
    return issues;
   });
   layouts.push({width,height,route,issues});
   if(width===390&&lang==='en'&&slug==='contact'){
    await page.evaluate(async()=>{for(const img of document.images)img.loading='eager';await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})))});
    await page.locator('.ss-hub-hero').screenshot({path:'output/qa/experience-hub-mobile.png'});
    await page.locator('.ss-hub-find').screenshot({path:'output/qa/experience-find-mobile.png'});
   }
  }
 }
 fs.writeFileSync('output/qa/experience-results.json',JSON.stringify({layouts,errors},null,2));
 assert.deepEqual(layouts.filter(result=>result.issues.length),[],'responsive layout');
 for(const [lang,contact,workshop,stockists] of [['en','contact','our-workshop','stockists'],['es','contacto','obrador','puntos-de-venta'],['ca','contacte','obrador','punts-de-venda']]){
  for(const [old,section] of [[workshop,'workshop'],[stockists,'find']]){
   const response=await page.request.get(`http://127.0.0.1:4173/${lang}/${old}/`,{maxRedirects:0});
   assert.equal(response.status(),301);assert.equal(response.headers().location,`/${lang}/${contact}/#ss-${section}`);
  }
 }
 await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:4173/en/contact/');
 await page.locator('[data-enquiry-topic="2"]').click();
 const form=page.locator('#ss-enquiry-form');
 assert.equal(await form.locator('[name=topic]').inputValue(),'2');
 assert.equal(await form.locator('[name=postcode]').evaluate(el=>el.required),true);
 await form.locator('[name=name]').fill('Website QA');await form.locator('[name=email]').fill('qa@example.com');
 await form.locator('[name=message]').fill('A local stockist enquiry. Test only.');await form.locator('[name=privacy]').check();
 await form.locator('[type=submit]').click();assert.equal(await form.locator('.ss-draft-result').isVisible(),false);
 await form.locator('[name=postcode]').fill('08917');await form.locator('[type=submit]').click();
 assert.equal(await form.locator('.ss-draft-result').isVisible(),true);
 assert.match(decodeURIComponent(await form.locator('[data-draft-open]').getAttribute('href')),/Stockists[\s\S]*08917/);
 await form.locator('[name=topic]').selectOption('0');assert.equal(await form.locator('[name=postcode]').evaluate(el=>el.required),false);
 assert.equal(await form.locator('.ss-draft-result').isVisible(),false);
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('http://127.0.0.1:4173/en/professionals/');
 await page.waitForFunction(()=>!document.documentElement.dataset.ssLoading);
 const sample=()=>page.locator('.ss-arc-trail').evaluate(el=>({offset:getComputedStyle(el).strokeDashoffset,name:getComputedStyle(el).animationName,state:getComputedStyle(el).animationPlayState}));
 const before=await sample();await page.locator('.ss-pro-front').hover();await page.waitForTimeout(300);const hovered=await sample();
 assert.notEqual(hovered.offset,before.offset,'arc stopped on hover');assert.equal(hovered.state,'running');
 await page.locator('.ss-pro-front .ss-button').first().focus();await page.waitForTimeout(200);assert.notEqual((await sample()).offset,hovered.offset,'arc stopped on focus');
 await page.locator('[data-action=motion]').click();assert.equal((await sample()).name,'none');
 await page.locator('[data-action=motion]').click();await page.emulateMedia({reducedMotion:'reduce'});assert.equal((await sample()).name,'none');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('http://127.0.0.1:4173/en/at-home/');await page.locator('.ss-reference-wheel').hover();
 assert.equal(await page.locator('.ss-reference-wheel .ss-ring').evaluate(el=>getComputedStyle(el).animationPlayState),'running');
 const portable=await browser.newPage({reducedMotion:'reduce'});
 await portable.goto('file:///'+path.resolve('output/smokers-full.html').replaceAll('\\','/')+'#about');
 await portable.locator('#ss-workshop').waitFor();assert.equal(await portable.locator('.ss-hub').count(),1);
 await portable.locator('.ss-hub-chapters a').nth(1).click();await portable.waitForURL('**#contact/find');
 assert.equal(await portable.locator('#ss-find').isVisible(),true);
 await portable.close();assert.deepEqual(errors,[]);
 console.log(`PASS: ${layouts.length} responsive views; six section redirects; stockist validation; continuous hover/focus loop; motion controls; portable navigation. No message sent.`);
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
