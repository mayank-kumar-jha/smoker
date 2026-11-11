const {chromium}=require('playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'}),context=await browser.newContext({reducedMotion:'reduce',acceptDownloads:true}),page=await context.newPage();
 const results=[],errors=[];page.on('pageerror',e=>errors.push(e.message));
 const routes={en:['contact','clients','privacy'],es:['contacto','clientes','privacidad'],ca:['contacte','clients','privacitat']};
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:width>800?900:844});
  for(const [lang,slugs] of Object.entries(routes))for(const slug of slugs){
   const path=`/${lang}/${slug}/`;
   assert.equal((await page.goto('http://127.0.0.1:4173'+path)).status(),200,path);
   await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.images)img.loading='eager';await Promise.all([...document.images].map(img=>img.decode().catch(()=>{})));await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))});
   const issues=await page.evaluate(()=>{
    const issues=[];if(document.documentElement.scrollWidth>innerWidth+1)issues.push('page overflow');
    for(const a of document.querySelectorAll('a[href]'))if(/^https?:\/\/(?:www\.)?(?:odoo\.)?smokers\.cat(?:\/|$)/.test(a.href))issues.push('legacy destination '+a.href);
    for(const el of document.querySelectorAll('main h1, main h2, main h3, main form, main article, main input, main textarea, .ss-page-photo')){const r=el.getBoundingClientRect();if(r.left<-.5||r.right>innerWidth+.5)issues.push('element overflow '+el.className+' '+el.tagName)}
    for(const el of document.querySelectorAll('.ss-header a,.ss-header button')){const r=el.getBoundingClientRect();if(r.width&&r.height&&(r.left<-.5||r.right>innerWidth+.5))issues.push('header overflow '+el.textContent)}
    if(document.querySelectorAll('h1').length!==1)issues.push('H1 count');
    if([...document.images].some(img=>!img.complete||!img.naturalWidth))issues.push('image missing');
    return issues;
   });
   results.push({width,path,issues});
   if(lang==='en'&&[1440,390].includes(width))await page.screenshot({path:`output/qa/support-${slug}-${width}.png`,fullPage:true});
  }
 }
 fs.writeFileSync('output/qa/support-page-results.json',JSON.stringify({results,errors},null,2));
 assert.deepEqual(results.filter(r=>r.issues.length),[],'layout / legacy link issues');
 await page.setViewportSize({width:1440,height:900});
 for(const path of ['/en/contact/','/es/puntos-de-venta/','/ca/clients/']){
  await page.goto('http://127.0.0.1:4173'+path);const form=page.locator('#ss-enquiry-form');
  await form.locator('button[type=submit]').click();assert.equal(await form.locator('.ss-draft-result').isVisible(),false,'invalid form accepted');
  await form.locator('[name=name]').fill('Test Person');await form.locator('[name=email]').fill('test@example.com');
  if(await form.locator('[name=company]').count())await form.locator('[name=company]').fill('Test Kitchen');
  if(await form.locator('[name=postcode]').count())await form.locator('[name=postcode]').fill('Badalona 08917');
  if(await form.locator('[name=dishes]').count())await form.locator('[name=dishes]').first().check();
  await form.locator('[name=message]').fill('QA enquiry — not sent.\nTwo lines, with accents: à é ñ.');await form.locator('[name=privacy]').check();
  await form.locator('button[type=submit]').click();assert.equal(await form.locator('.ss-draft-result').isVisible(),true);
  const href=await form.locator('[data-draft-open]').getAttribute('href');assert.ok(href.startsWith('mailto:info@smokers.cat?'));assert.ok(decodeURIComponent(href).includes('QA enquiry — not sent.\nTwo lines'));
  const download=page.waitForEvent('download');await form.locator('[data-action=enquiry-download]').click();const downloaded=await download;const body=fs.readFileSync(await downloaded.path(),'utf8');assert.ok(body.includes('test@example.com'));assert.ok(body.includes('à é ñ'));
  await form.locator('[data-action=enquiry-edit]').click();assert.equal(await form.locator('.ss-draft-result').isVisible(),false);assert.ok((await form.locator('[name=message]').inputValue()).startsWith('QA enquiry'));
 }
 await page.goto('http://127.0.0.1:4173/en/clients/');await page.locator('[data-enquiry-topic="4"]').click();assert.equal(await page.locator('[name=topic]').inputValue(),'4');
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:4173/en/contact/');await page.locator('[data-action=mobile-menu]').click();assert.equal(await page.locator('.ss-mobile-extra a[href="/en/professionals/"]').isVisible(),true);await page.locator('.ss-mobile-locales a[lang=es]').click();assert.ok(page.url().endsWith('/es/contacto/'));
 const nojs=await browser.newContext({javaScriptEnabled:false});const nojsPage=await nojs.newPage();await nojsPage.goto('http://127.0.0.1:4173/en/contact/');assert.equal(await nojsPage.locator('h1').isVisible(),true);assert.equal(await nojsPage.locator('[data-enquiry-submit]').isDisabled(),true);await nojs.close();
 assert.deepEqual(errors,[]);console.log(`PASS: ${results.length} translated responsive page checks; invalid forms blocked; three localized drafts and downloads; technical-sheet topic; mobile routes; no-JS content. No email sent.`);
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
