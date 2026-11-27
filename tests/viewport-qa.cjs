const {chromium}=require('playwright'),fs=require('fs'),assert=require('assert/strict');
(async()=>{const browser=await chromium.launch({channel:process.env.CI?undefined:'chrome',headless:true});const page=await browser.newPage({reducedMotion:'reduce'}),results=[];try{
for(const [width,height]of [[320,568],[390,844],[568,320],[768,1024],[820,600],[1024,768],[1280,720],[1440,900],[1920,1080],[2560,1440]]){
 await page.setViewportSize({width,height});
 for(const route of ['/en/at-home/','/es/en-casa/','/ca/a-casa/','/en/professionals/','/es/profesionales/','/ca/professionals/']){
 await page.goto((process.env.QA_BASE||'http://127.0.0.1:4173')+route);await page.evaluate(()=>document.fonts.ready);
 const result=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,workshop:[...document.querySelectorAll('.ss-home-method')].map(e=>({height:e.clientHeight,content:e.scrollHeight})),hidden:!!document.documentElement.dataset.ssLoading||!!document.documentElement.dataset.ssProLoading}));
 assert(!result.overflow,`${width}x${height} ${route} horizontal overflow`);assert(!result.hidden,'Navigation must not be blocked by an intro');
 for(const m of result.workshop)assert(m.content<=m.height+2,`${route} workshop must grow with its content`);
 results.push({width,height,route,...result});
 }}fs.mkdirSync('output/qa',{recursive:true});fs.writeFileSync('output/qa/viewport-results.json',JSON.stringify({passed:true,results},null,2));console.log('PASS',results.length,'current viewport checks');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
