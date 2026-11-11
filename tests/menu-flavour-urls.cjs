const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const data={window:{}};vm.runInNewContext(fs.readFileSync('site/orbit-menu-markup.js','utf8'),data);const pages=data.window.SMOKERS_MENU_PAGES;
(async()=>{const b=await chromium.launch({channel:'chrome'}),p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
const selected=()=>p.locator('.dsh-hd[aria-hidden=false] h2').evaluate(e=>[...e.children].map(x=>x.textContent).join(' '));
try{
 for(const lang of ['en','es','ca'])for(let i=0;i<8;i++){
  const dish=pages[lang][i],res=await p.goto('http://127.0.0.1:4173'+dish.href);assert.equal(res.status(),200);
  await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>document.querySelector('#ss-carta').getBoundingClientRect().top<80);
  assert.equal((await selected()).replace(/\s+/g,' '),dish.label);
  assert.equal(await p.title(),dish.label+' | Smokers · Badalona');
  assert.equal(await p.locator('link[rel=canonical]').getAttribute('href'),'https://smokers.cat'+dish.href);
  for(const target of ['en','es','ca'])assert.equal(await p.locator('.ss-languages a[hreflang='+target+']').first().getAttribute('href'),pages[target][i].href);
  assert.equal(await p.locator('.dsh-th a').count(),8);
 }
 console.log('PASS all 24 localized deep links, initial selection, metadata and language links');
 await p.goto('http://127.0.0.1:4173/en/at-home/');await p.locator('#ss-carta').scrollIntoViewIfNeeded();
 await p.locator('.dsh-strip [aria-label="Next dish"]').click();await p.waitForURL('**/menu/spiced-chicken/');
 await p.locator('.dsh-strip [aria-label="Next dish"]').click();await p.waitForURL('**/menu/herb-chicken/');
 await p.goBack();assert.equal((await selected()).replace(/\s+/g,' '),'Spiced Chicken');assert((await p.title()).startsWith('Spiced Chicken'));
 await p.goBack();assert.equal(new URL(p.url()).pathname,'/en/at-home/');assert.equal((await selected()).replace(/\s+/g,' '),'Pork Cheek');assert(!(await p.title()).startsWith('Spiced Chicken'));
 await p.goForward();await p.reload();assert.equal((await selected()).replace(/\s+/g,' '),'Spiced Chicken');
 await p.locator('.dsh-dot').nth(5).click();await p.waitForURL('**/menu/truffle-potatoes/');await p.reload();assert.equal((await selected()).replace(/\s+/g,' '),'Truffle Potatoes');
 await p.goto('http://127.0.0.1:4173'+pages.es[5].href);assert.equal((await selected()).replace(/\s+/g,' '),pages.es[5].label);
 await p.screenshot({path:'output/qa/menu-url-desktop.png'});
 await p.setViewportSize({width:390,height:844});await p.goto('http://127.0.0.1:4173'+pages.ca[5].href);await p.evaluate(()=>document.fonts.ready);await p.waitForFunction(()=>document.querySelector('#ss-carta').getBoundingClientRect().top<80);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.screenshot({path:'output/qa/menu-url-mobile.png'});
 const response=await p.request.get('http://127.0.0.1:4173/en/at-home/menu/not-a-flavour/');assert.equal(response.status(),404);
 await p.setViewportSize({width:1808,height:870});await p.goto('http://127.0.0.1:4173/en/at-home/');const cta=p.locator('.ss-kitchen-hero .ss-glovo-button'),idle=await cta.boundingBox();await cta.hover();const hover=await cta.boundingBox();assert(Math.abs(idle.width-(1808*.186-15))<1);assert.equal(idle.width,hover.width);
 assert.deepEqual(errors,[]);console.log('PASS history, refresh, direct choice, localized mobile, missing route 404 and 15px CTA reduction');
}finally{await b.close()}
})().catch(e=>{console.error(e);process.exit(1)});
