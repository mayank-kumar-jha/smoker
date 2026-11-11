/* Content integration: existing assets survive and every added dish remains reachable. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const context={window:{}};vm.createContext(context);
for(const file of ['data.js','routes.js'])vm.runInContext(fs.readFileSync('site/'+file,'utf8'),context);
const {SMOKERS_PRODUCTS:products,SMOKERS_PRODUCT_SLUGS:slugs,SMOKERS_ROUTES:routes}=context.window;
(async()=>{
 const browser=await chromium.launch({channel:'chrome'}),errors=[];
 try{
 const p=await browser.newPage({reducedMotion:'reduce',viewport:{width:1440,height:900}});
 p.on('pageerror',e=>errors.push(e.message));
 for(const lang of ['es','ca','en']){
  await p.goto('http://127.0.0.1:4173'+routes[lang].casa);
  assert.equal(await p.locator('.ss-satellite').count(),products.length);
  assert.equal(await p.locator('.ss-faq-answers details').count(),8);
  assert.equal(await p.locator('[data-delivery="Just Eat"]').count(),0);
  await p.locator('#ss-carta').scrollIntoViewIfNeeded();
  for(let i=0;i<products.length;i++){
   await p.locator(`[data-dish="${i}"]`).click();
   await p.waitForFunction(index=>document.querySelector('.ss-wheel-center').dataset.product===String(index),i);
   assert.match(await p.locator('.ss-wheel-info>.ss-eyebrow').innerText(),new RegExp(`${i+1} / ${products.length}`));
   await p.waitForFunction(file=>document.querySelector('.ss-center-image')?.src.endsWith(file),products[i].image);
   await p.locator('.ss-center-image').evaluate(img=>img.decode());
  }
  await p.locator('[data-spin="1"]').click();assert.equal(await p.locator('.ss-wheel-center').getAttribute('data-product'),'0');
  await p.locator('[data-spin="-1"]').click();assert.equal(await p.locator('.ss-wheel-center').getAttribute('data-product'),String(products.length-1));
  await p.locator('.ss-wheel-info [data-product]').click();assert(await p.locator('dialog').evaluate(d=>d.open));
  assert.match(await p.locator('#ss-dialog-content').innerText(),/Glovo/);await p.keyboard.press('Escape');
  for(let i=0;i<products.length;i++){
   const response=await p.goto('http://127.0.0.1:4173'+routes[lang].products+slugs[lang][i]+'/');
   assert.equal(response.status(),200);
   const img=p.locator('.ss-product-image>img');await img.evaluate(i=>i.decode());
   assert.ok((await img.getAttribute('src')).includes(products[i].image.replace('.webp','').replace('.jpg','')));
   assert.equal(await p.locator('.ss-product-copy>.ss-lead').innerText(),products[i].descriptions[['es','ca','en'].indexOf(lang)]);
   assert.equal(await p.locator('h1').count(),1);
  }
 }
 await p.setViewportSize({width:390,height:844});await p.goto('http://127.0.0.1:4173/en/at-home/');
 await p.locator('[data-dish="13"]').click();assert.equal(await p.locator('.ss-wheel-center').getAttribute('data-product'),'13');
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 assert.deepEqual(errors,[]);
 const report={passed:true,languages:3,dishes:products.length,dishPages:products.length*3,checks:['Every menu image decodes','Every dish can be selected','Forward and backward wraparound','New dish dialog','Localized product descriptions','8 FAQs','Two approved delivery providers','Mobile overflow']};
 fs.writeFileSync('output/qa/official-content-results.json',JSON.stringify(report,null,2));console.log(report);
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exit(1)});
