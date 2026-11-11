/* Regression checks for the five reference panels and company brand integration. */
const {chromium}=require('playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 const page=await browser.newPage({reducedMotion:'reduce'});
 const failures=[],results=[];
 page.on('pageerror',error=>failures.push(error.message));
 const routes={en:['/en/','/en/professionals/','/en/at-home/'],es:['/es/','/es/profesionales/','/es/en-casa/'],ca:['/ca/','/ca/professionals/','/ca/a-casa/']};
 for(const [width,height] of [[1806,871],[1440,900],[1366,768],[900,720],[820,1180],[768,1024],[390,844],[320,740]]){
  await page.setViewportSize({width,height});
  for(const [lang,paths] of Object.entries(routes))for(const [mode,path] of paths.entries()){
   if(lang!=='en'&&![1366,900,390,320].includes(width))continue;
   await page.goto('http://127.0.0.1:4173'+path);
   await page.evaluate(()=>document.fonts.ready);
   const result=await page.evaluate(({mode,width})=>{
    const issues=[],root=document.getElementById('smokers-site');
    const bounds=s=>document.querySelector(s)?.getBoundingClientRect();
    if(document.documentElement.scrollWidth>innerWidth+1)issues.push('horizontal page overflow');
    if(!getComputedStyle(root).fontFamily.includes('Archivo'))issues.push('Archivo missing');
    const logo=document.querySelector('.ss-logo img');if(!logo?.complete||!logo.naturalWidth)issues.push('official logo missing');
    if(document.querySelector('.ss-header nav a[href$="#ss-como"]'))issues.push('process navbar link remains');
    if(mode===1){
     const actions=bounds('.ss-pro-copy .ss-actions'),facts=bounds('.ss-panel-facts-pro'),front=bounds('.ss-pro-front'),copy=bounds('.ss-pro-copy');
     if(facts.top<actions.bottom+15)issues.push('features collide with CTAs');
     if(copy.top<front.top-1||copy.bottom>front.bottom+1)issues.push('professional copy clipped');
     if(facts.right>front.right)issues.push('features overflow');
     if(document.querySelectorAll('.ss-panel-facts-pro li').length!==5)issues.push('missing feature');
    }
    if(mode===2){
     const hero=bounds('.ss-flat-hero'),card=bounds('.ss-flat-guide');
     if(card.bottom>hero.bottom+1||card.right>innerWidth)issues.push('home guide clipped');
     if(document.querySelectorAll('.ss-flat-process li').length!==4)issues.push('missing process step');
     for(const s of ['.ss-reference-wheel','.ss-reference-order']){
      const box=bounds(s);for(const el of document.querySelector(s).querySelectorAll('h2,h3,.ss-actions,.ss-panel-facts,.ss-delivery-list')){
       const r=el.getBoundingClientRect();if(r.left<box.left-1||r.right>box.right+1||r.top<box.top-1||r.bottom>box.bottom+1)issues.push(s+' content overflow: '+el.className);
      }
     }
    }
    if(mode===0){for(const el of document.querySelectorAll('.ss-gate-copy')){const r=el.getBoundingClientRect();if(r.right>innerWidth+1||r.left<0)issues.push('gate copy overflow')}}
    return issues;
   },{mode,width});
   results.push({width,height,path,issues:result});
   for(const issue of result)failures.push(`${width}x${height} ${path}: ${issue}`);
   if(lang==='en'&&[1806,390,900].includes(width))await page.screenshot({path:`output/qa/brand-${mode}-${width}.png`});
  }
 }
 fs.writeFileSync('output/qa/brand-panel-results.json',JSON.stringify({results,failures},null,2));
 console.log('Viewport checks:',results.length,JSON.stringify(failures));
 await page.setViewportSize({width:1366,height:768});
 await page.goto('http://127.0.0.1:4173/en/at-home/');
 for(let i=0;i<9;i++){
  await page.locator(`[data-dish="${i}"]`).click();
  if(await page.locator(`[data-dish="${i}"]`).getAttribute('aria-pressed')!=='true')failures.push('dish selection '+i);
  await page.locator('.ss-wheel-info [data-product]').click();
  if(!await page.locator('dialog').evaluate(e=>e.open))failures.push('dish dialog '+i);
  await page.locator('[data-action="close-dialog"]').click();
 }
 await page.goto('http://127.0.0.1:4173/en/professionals/');
 await page.locator('.ss-pro-front [data-action="process"]').click();
 if(await page.locator('.ss-pro-back').getAttribute('aria-hidden')!=='false')failures.push('process flip failed');
 await page.locator('.ss-pro-back [data-action="process"]').click();
 if(await page.locator('.ss-pro-front').getAttribute('aria-hidden')!=='false')failures.push('return flip failed');
 await page.setViewportSize({width:390,height:844});
 await page.locator('[data-action="mobile-menu"]').click();
 if(!await page.locator('.ss-mobile-locales').isVisible())failures.push('mobile language links hidden');
 await browser.close();
 fs.writeFileSync('output/qa/brand-panel-results.json',JSON.stringify({results,failures},null,2));
 console.log(JSON.stringify({viewports:results.length,failures},null,2));
 if(failures.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exit(1)});
