const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const base=process.env.QA_BASE||'http://127.0.0.1:4173';
(async()=>{
 const context={window:{}};for(const file of ['site/data.js','site/routes.js'])vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
 assert(!context.window.SMOKERS_PRODUCTS.some(p=>['truffle-potatoes','smokers-potatoes'].includes(p.id)));
 assert(context.window.SMOKERS_PRODUCTS.some(p=>p.id==='truffle-potato-salad'));
 const browser=await chromium.launch({channel:process.env.CI?undefined:'chrome'});
 for(const [lang,home,oldSlugs,eggplant] of [
  ['en','at-home',['truffle-potatoes','smokers-potatoes'],'cheese-stuffed-eggplant'],
  ['es','en-casa',['patatas-a-la-trufa','patatas-smokers'],'berenjena-rellena-de-queso'],
  ['ca','a-casa',['patates-amb-tofona','patates-smokers'],'alberginia-farcida-de-formatge']
 ]){
  const page=await browser.newPage({reducedMotion:'reduce'}),menu=lang==='en'?'menu':'carta';
  await page.goto(`${base}/${lang}/${home}/`);await page.locator('#ss-carta').scrollIntoViewIfNeeded();
  assert.equal(await page.locator('.dsh-orbit').count(),6);
  const links=await page.locator('.dsh-th a').evaluateAll(es=>es.map(e=>e.getAttribute('href')));
  assert(links.some(href=>href.includes(eggplant)));for(const slug of oldSlugs)assert(links.every(href=>!href.includes(slug)));
  for(const slug of oldSlugs){const result=await page.request.get(`${base}/${lang}/${home}/${menu}/${slug}/`,{maxRedirects:0});assert.equal(result.status(),301);assert.match(result.headers().location,/#ss-carta$/)}
  await page.goto(`${base}/${lang}/${home}/${menu}/${eggplant}/`);assert.equal(await page.locator('.ss-flavour-story article').count(),3);assert.match(await page.locator('.ss-flavour-story article').first().innerText(),/eggplant|berenjena|albergínia/i);
  const pro=lang==='es'?'profesionales':'professionals';await page.goto(`${base}/${lang}/${pro}/`);
  await page.locator('#ss-catalogue-form label').first().click();await page.locator('#ss-catalogue-form button[type="submit"]').click();
  assert.equal(await page.locator('#ss-catalogue-form input[name="dish"]').count(),12);
  const choices=await page.locator('#ss-catalogue-form input[name="dish"]').evaluateAll(es=>es.map(e=>e.getAttribute('aria-label')));
  for(const name of ['Truffle potatoes','Smokers potatoes','Patatas a la trufa','Patatas Smokers','Patates amb tòfona','Patates Smokers'])assert(!choices.includes(name));
  await page.close();console.log('PASS removed dishes and remaining story',lang);
 }
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1)});
