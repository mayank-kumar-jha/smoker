const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const manifest=JSON.parse(fs.readFileSync('output/production-site/build-info.json')),pages=manifest.pages.filter(p=>p.mode==='flavour');assert.equal(pages.length,24);
 const browser=await chromium.launch({channel:process.env.CI?undefined:'chrome',headless:true}),page=await browser.newPage({reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});for(const item of pages){
  const response=await page.goto('http://127.0.0.1:4173'+item.path);assert.equal(response.status(),200);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.dsh-orbit').count(),1);assert.equal(await page.locator('.ss-flat-hero').count(),0);assert.equal(await page.locator('.ss-flavour-related a').count(),7);
  assert((await page.locator('.ss-flavour-story').innerText()).length>600);assert.equal(new URL(await page.locator('link[rel=canonical]').getAttribute('href')).pathname,item.path);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const locales=await page.locator('link[rel=alternate][hreflang]').evaluateAll(es=>es.map(e=>e.href));assert.equal(locales.length,4);
 }}
 await page.goto('http://127.0.0.1:4173/en/at-home/');await page.locator('#ss-carta').scrollIntoViewIfNeeded();await page.locator('.dsh-arrow').last().click();assert(page.url().endsWith('/en/at-home/'));await page.locator('.dsh-body[aria-hidden=false] .dsh-dish-link').click();assert(page.url().endsWith('/spiced-chicken/'));assert.equal(await page.locator('h1').innerText(),'Spiced Chicken');
 assert.deepEqual(errors,[]);await browser.close();fs.writeFileSync('output/phase1/flavour-tests.json',JSON.stringify({passed:true,pages:24,widths:[390,1440],dedicatedContent:true,menuNavigation:true},null,2));console.log('PASS 24 dedicated flavour pages in three languages: metadata, related links, responsive layouts and real navigation.');
})().catch(e=>{console.error(e);process.exit(1)});
