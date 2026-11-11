/* Records the real preview in an isolated browser session; does not change site files. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path');
(async()=>{
 fs.mkdirSync('output/video/raw',{recursive:true});
 const browser=await chromium.launch({channel:'chrome'});
 const context=await browser.newContext({viewport:{width:1600,height:900},recordVideo:{dir:'output/video/raw',size:{width:1600,height:900}}});
 await context.addInitScript(()=>{
  document.addEventListener('DOMContentLoaded',()=>{
   const note=document.createElement('div');note.id='walkthrough-preview-note';note.textContent='PREVIEW RECORDING  ·  The real website has smoother motion and transitions.';
   Object.assign(note.style,{position:'fixed',bottom:'0',left:'0',right:'0',height:'28px',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(14,11,8,.88)',color:'#eee0cf',font:'11px Arial,sans-serif',letterSpacing:'.5px',zIndex:'2147483647',pointerEvents:'none'});document.body.appendChild(note);
  });
 });
 const page=await context.newPage(),video=page.video(),start=Date.now(),chapters=[];
 const mark=name=>{const seconds=(Date.now()-start)/1000;chapters.push({seconds,name});console.log(seconds.toFixed(1),name)};
 const hold=ms=>page.waitForTimeout(ms);
 async function ready(){await page.evaluate(async()=>{await document.fonts.ready;for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})))})}
 async function go(route,showIntro=false){await page.goto('http://127.0.0.1:4173'+route,{waitUntil:'domcontentloaded'});if(!showIntro)await page.keyboard.press('Escape');await ready();await page.waitForFunction(()=>!document.documentElement.dataset.ssLoading,null,{timeout:14000})}
 async function scrollTo(selector,holdTime=3500){
  const destination=await page.locator(selector).first().evaluate(e=>Math.min(e.getBoundingClientRect().top+scrollY,document.documentElement.scrollHeight-innerHeight));
  await page.evaluate(async y=>{const from=scrollY,distance=y-from;await new Promise(resolve=>{let start;const frame=t=>{start??=t;const x=Math.min(1,(t-start)/1800),ease=x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;scrollTo({top:from+distance*ease,behavior:'instant'});if(x<1)requestAnimationFrame(frame);else resolve()};requestAnimationFrame(frame)})},destination);
  await hold(holdTime);
 }
 try{
  mark('B2C: preloader and home hero');await go('/en/at-home/',true);await hold(5200);
  mark('B2C: interactive menu wheel');await scrollTo('#ss-carta',2800);
  for(let i=0;i<3;i++){await page.locator('[data-spin="1"]').click();await hold(2200)}
  await page.locator('.ss-wheel-info [data-product]').click();await hold(4500);await page.keyboard.press('Escape');await hold(1200);
  mark('B2C: complete dish range');await scrollTo('.ss-dish-directory',1000);await page.locator('.ss-dish-directory summary').first().click();await hold(3000);
  mark('B2C: Glovo and Uber Eats');await scrollTo('#ss-pedir',5000);
  mark('B2C: reheating guide');await scrollTo('#ss-regenerar',5000);
  mark('B2C: FAQs and footer');await scrollTo('.ss-faq',2000);await page.locator('.ss-faq summary').first().click();await hold(3000);await page.locator('.ss-faq summary').nth(1).click();await hold(3000);await scrollTo('.ss-footer',2500);
  mark('B2B: preloader and professional hero');await go('/en/professionals/',true);await hold(5000);
  mark('B2B: how we work');await page.locator('.ss-pro-front [data-action=process]').click();await hold(7000);await page.locator('.ss-pro-back [data-action=process]').click();await hold(2200);
  mark('B2B: professional product gallery');await scrollTo('.ss-pro-menu',6000);
  mark('B2B: catalogue request');await scrollTo('#ss-catalogo',3000);await page.locator('.ss-business-options input').first().check();await hold(1000);await page.locator('#ss-catalogue-form [type="submit"]').click();await hold(3000);
  await page.locator('.ss-dish-options input').nth(0).check();await page.locator('.ss-dish-options input').nth(2).check();await hold(1500);await page.locator('#ss-catalogue-form [type="submit"]').click();await hold(5000);
  mark('B2B: FAQs and footer');await scrollTo('.ss-faq',2300);await page.locator('.ss-faq summary').first().click();await hold(3000);await scrollTo('.ss-footer',2500);
  mark('Meet Smokers: brand story');await go('/en/contact/');await hold(3800);await scrollTo('#ss-workshop',5000);await scrollTo('.ss-hub-process',3000);
  mark('Meet Smokers: delivery, stockists and contact');await scrollTo('#ss-find',4500);await scrollTo('#ss-enquiry',4500);await scrollTo('.ss-footer',2000);
  mark('Professional client enquiries');await go('/en/clients/');await hold(3500);await scrollTo('#ss-enquiry-form',5000);
  mark('Individual dish page');await go('/en/dishes/herb-chicken/');await hold(4500);await scrollTo('.ss-product-notes',3500);await scrollTo('.ss-product-related',3000);
  mark('Privacy information');await go('/en/privacy/');await hold(3500);
  mark('Closing home view');await go('/en/at-home/');await hold(5000);
 }finally{
  fs.writeFileSync('output/video/walkthrough-chapters.json',JSON.stringify({durationSeconds:(Date.now()-start)/1000,chapters},null,2));
  await context.close();const file=await video.path();fs.writeFileSync('output/video/raw-video-path.txt',path.resolve(file));await browser.close();console.log('Recording saved:',file);
 }
})().catch(e=>{console.error(e);process.exitCode=1});
