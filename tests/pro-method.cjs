const{chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({channel:'chrome'}),p=await b.newPage({viewport:{width:1744,height:902}}),errors=[];
 p.on('pageerror',e=>errors.push(e.message));
 // Slow the deferred app so first-paint protection is tested before DOMContentLoaded.
 await p.route('**/app.js',async route=>{await new Promise(r=>setTimeout(r,500));await route.continue()});
 await p.goto('http://127.0.0.1:4173/en/professionals/',{waitUntil:'commit'});
 await p.waitForSelector('#smokers-site',{state:'attached'});
 const gated=await p.evaluate(()=>document.documentElement.dataset.ssProBoot==='true'?getComputedStyle(document.getElementById('smokers-site')).visibility==='hidden':!!document.querySelector('.ss-pro-preloader'));
 assert.ok(gated,'Hero must be gated or covered on first paint');
 await p.waitForFunction(()=>!document.documentElement.dataset.ssProLoading&&!document.documentElement.dataset.ssProBoot);
 await p.waitForTimeout(1800);
 const rects=()=>p.evaluate(()=>['.ss-b2b-fork','.ss-header'].map(s=>{const r=document.querySelector(s).getBoundingClientRect();return [r.x,r.y,r.width,r.height]}));
 const before=await rects();
 await p.locator('.ss-flat-nav a[href$="#ss-como"]').click();
 for(const delay of [100,400,1100]){await p.waitForTimeout(delay);assert.deepEqual(await rects(),before,'Fork and navbar must stay fixed during process transition')}
 assert.equal(await p.locator('.ss-method-steps li').count(),4);
 assert.equal(await p.locator('.ss-method-facts,.ss-method-eyebrow').count(),0);
 assert.match(await p.locator('.ss-method-actions a').first().getAttribute('href'),/#ss-catalogo$/);
 assert.match(await p.locator('.ss-method-actions a').last().getAttribute('href'),/contact/);
 assert.match(await p.locator('.ss-method-copy h2').evaluate(e=>getComputedStyle(e).fontFamily),/SSDisplay/);
 await p.waitForFunction(()=>parseFloat(getComputedStyle(document.querySelector('.ss-method-arc path')).strokeDashoffset)<.001);
 await p.screenshot({path:'output/qa/pro-method-desktop.png'});
 await p.locator('.ss-method-back').click();await p.waitForTimeout(1000);
 assert.equal(await p.locator('.ss-pro-back').getAttribute('aria-hidden'),'true');
 // Catalogue and FAQ enter at a fixed trigger, then settle without further scrolling.
 for(const [section,target] of [['#ss-catalogo','.ss-catalogue-form'],['.ss-faq','.ss-faq-answers']]){
  await p.locator(section).evaluate(e=>scrollTo({top:e.getBoundingClientRect().top+scrollY-innerHeight*.7,behavior:'instant'}));
  await p.waitForTimeout(2600);
  assert.equal(await p.locator(target).evaluate(e=>getComputedStyle(e).opacity),'1');
 }
 await p.emulateMedia({reducedMotion:'reduce'});
 for(const [lang,path] of [['en','professionals'],['es','profesionales'],['ca','professionals']])for(const width of [1440,1024,390,320]){
  await p.setViewportSize({width,height:900});await p.goto(`http://127.0.0.1:4173/${lang}/${path}/`);
  await p.waitForFunction(()=>!document.documentElement.dataset.ssProLoading&&!document.documentElement.dataset.ssProBoot);
  await p.locator('.ss-b2b-process-link').click();
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.locator('.ss-method-steps li').last().scrollIntoViewIfNeeded();
  assert.ok(await p.locator('.ss-method-steps li').last().isVisible());
  if(lang==='en'&&width===390)await p.screenshot({path:'output/qa/pro-method-mobile.png'});
 }
 assert.deepEqual(errors,[]);await b.close();console.log('PASS: gated first paint, stationary fork/navbar, method steps/line, catalogue/contact/back controls, brand fonts, catalogue/FAQ entrances, 3 locales at 4 widths.');
})().catch(e=>{console.error(e);process.exit(1)});