const fs=require('node:fs');
const {chromium}=require('playwright');
const out='output/audit-2026-11-14';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const info=JSON.parse(fs.readFileSync('output/full-site/build-info.json'));
 const sizes=[[320,568],[360,640],[390,844],[430,932],[568,320],[768,1024],[820,600],[1024,768],[1280,720],[1440,900],[1920,1080],[2560,1440]];
 const results=[],errors=[];
 const page=await browser.newPage({reducedMotion:'reduce'});
 page.on('pageerror',e=>errors.push({url:page.url(),message:e.message}));
 for(const [width,height] of sizes){
  await page.setViewportSize({width,height});
  for(const item of info.pages){
   const response=await page.goto('http://127.0.0.1:4173'+item.path);
   await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(100);
   const metrics=await page.evaluate(()=>{
    const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[aria-hidden="true"]')};
    const small=[...document.querySelectorAll('p,label,button,a')].filter(visible).filter(e=>parseFloat(getComputedStyle(e).fontSize)<12).map(e=>({text:e.innerText.slice(0,90),size:getComputedStyle(e).fontSize}));
    const clipped=[...document.querySelectorAll('h1,h2,h3,p,label')].filter(visible).filter(e=>{const s=getComputedStyle(e);return ['hidden','clip'].includes(s.overflowY)&&e.scrollHeight>e.clientHeight+3}).map(e=>({text:e.innerText.slice(0,100),height:e.clientHeight,scrollHeight:e.scrollHeight}));
    return {horizontal:document.documentElement.scrollWidth>innerWidth+1,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,small,clipped,brokenImages:[...document.images].filter(e=>e.complete&&!e.naturalWidth).map(e=>e.src),bodyText:document.querySelector('main')?.innerText||'',headerHeight:document.querySelector('header')?.getBoundingClientRect().height};
   });
   if(width!==390)delete metrics.bodyText;
   results.push({path:item.path,width,height,status:response.status(),...metrics});
   if([390,1440,568].includes(width)&&item.lang==='en'&&(!item.path.includes('/flavours/')||item.path.includes('pork'))){await page.screenshot({path:out+'/'+width+'-'+item.path.replaceAll('/','_')+'.png',fullPage:true});}
  }
  fs.writeFileSync(out+'/responsive.json',JSON.stringify({sizes,results,errors},null,2));console.log('Audited',width,height,results.length);
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
