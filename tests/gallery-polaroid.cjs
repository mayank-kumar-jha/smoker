const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({channel:process.env.CI?undefined:'chrome'}),base=process.env.QA_BASE||'http://127.0.0.1:4173';
 fs.mkdirSync('output/qa',{recursive:true});
 for(const width of [390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/en/at-home/');
  await page.locator('#ss-gallery').scrollIntoViewIfNeeded();
  await page.locator('.pl-root').waitFor();
  await page.locator('.pl-shot img').first().evaluate(img=>img.decode());
  assert.equal(await page.locator('.pl-card').count(),8);
  assert.equal(await page.locator('.pl-card[data-on="1"]').getAttribute('data-i'),'0');
  await page.getByRole('button',{name:'Previous photo'}).click();
  await page.waitForFunction(()=>document.querySelector('.pl-card[data-on="1"]')?.getAttribute('data-i')==='7');
  await page.getByRole('button',{name:'Next photo'}).click();
  await page.waitForFunction(()=>document.querySelector('.pl-card[data-on="1"]')?.getAttribute('data-i')==='0');
  await page.getByRole('button',{name:'Next photo'}).click();
  await page.waitForFunction(()=>document.querySelector('.pl-card[data-on="1"]')?.getAttribute('data-i')==='1');
  await page.getByRole('button',{name:'Previous photo'}).click();
  await page.waitForFunction(()=>document.querySelector('.pl-card[data-on="1"]')?.getAttribute('data-i')==='0');
  await page.locator('.pl-root').focus();await page.keyboard.press('ArrowRight');
  await page.waitForFunction(()=>document.querySelector('.pl-card[data-on="1"]')?.getAttribute('data-i')==='1');
  const bounds=await page.locator('.pl-root').boundingBox();
  await page.mouse.move(bounds.x+bounds.width*.65,bounds.y+bounds.height*.5);await page.mouse.down();await page.mouse.move(bounds.x+bounds.width*.25,bounds.y+bounds.height*.5,{steps:8});await page.mouse.up();
  await page.waitForFunction(()=>Number(document.querySelector('.pl-card[data-on="1"]')?.getAttribute('data-i'))>1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.locator('#ss-gallery').screenshot({path:`output/qa/polaroid-gallery-${width}.png`});
  assert.deepEqual(errors,[]);
  if(width<1100){
   const read=async route=>{await page.goto(base+route);await page.locator('.ss-menu-toggle').click();return page.locator('.ss-mobile-locales .ss-languages a').evaluateAll(es=>es.map(e=>{const s=getComputedStyle(e);return [s.width,s.height,s.borderRadius,s.backgroundColor,s.color,s.fontSize]}))};
   assert.deepEqual(await read('/en/at-home/'),await read('/en/professionals/'));
  }
  await page.close();console.log('PASS gallery and navigation',width);
 }
 const noJS=await browser.newPage({javaScriptEnabled:false});await noJS.goto(base+'/en/at-home/');assert.equal(await noJS.locator('.ss-gallery-grid figure').count(),8);await noJS.close();
 await browser.close();console.log('PASS gallery fallback without JavaScript');
})().catch(error=>{console.error(error);process.exit(1)});
