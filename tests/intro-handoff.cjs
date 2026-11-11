const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 for(const width of [1440,390])for(const mode of ['professionals','at-home']){
  const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{
   window.handoffFrames=[];
   const sample=()=>{
    const header=document.querySelector('.ss-header'),logo=header?.querySelector('.ss-logo'),piece=document.querySelector('.ss-header .ss-logo-word');
    const overlay=document.querySelector('.ss-loader'),stage=overlay?.querySelector('.ss-intro-stage');
    const overlayVisible=overlay&&getComputedStyle(overlay).display!=='none'&&getComputedStyle(overlay).visibility==='visible';
    const backgroundAlpha=overlayVisible?Number(getComputedStyle(overlay,'::before').opacity)*Number(getComputedStyle(overlay).opacity):0;
    const stageAlpha=overlayVisible&&stage?Number(getComputedStyle(stage).opacity)*Number(getComputedStyle(overlay).opacity):0;
    if(header&&logo){const h=header.getBoundingClientRect(),l=logo.getBoundingClientRect(),p=piece?.getBoundingClientRect();window.handoffFrames.push({time:performance.now(),backgroundAlpha,stageAlpha,phase:document.documentElement.dataset.ssLoading||document.documentElement.dataset.ssProLoading||'done',width:h.width,lx:l.x,ly:l.y,lw:l.width,px:p?.x,py:p?.y,pw:p?.width,artInHeader:!!document.querySelector('.ss-header .ss-logo-art')})}
    requestAnimationFrame(sample);
   };requestAnimationFrame(sample);
  });
  await page.goto(`http://127.0.0.1:4173/en/${mode}/`);
  if(mode==='at-home'){
   await page.waitForFunction(()=>document.documentElement.dataset.ssLoading==='docking',{},{timeout:16000});
   await page.waitForTimeout(750);
   if(width===1440)await page.screenshot({path:'output/qa/b2c-docking.png'});
  }else await page.waitForSelector('.ss-pro-preloader');
  await page.waitForFunction(()=>!document.documentElement.dataset.ssLoading&&!document.documentElement.dataset.ssProLoading);
  await page.waitForTimeout(800);
  const frames=await page.evaluate(()=>window.handoffFrames);
  const stable=frames.filter(f=>f.time>500);
  assert.ok(Math.max(...stable.map(f=>f.width))-Math.min(...stable.map(f=>f.width))<1,`${mode} header width shifted`);
  if(mode==='at-home'){
   assert.ok(frames.every(f=>f.artInHeader),'Logo must remain in the header throughout');
   const end=frames.findIndex((f,i)=>i&&f.phase==='done'&&frames[i-1].phase==='docking');
   assert.ok(end>0,'Natural docking must complete');
   const reveal=frames.filter(f=>f.phase==='docking'||f.time>=frames[end].time);
   for(let i=1;i<reveal.length;i++)for(const key of ['backgroundAlpha','stageAlpha'])assert(reveal[i][key]<=reveal[i-1][key]+.001,`Preloader reappeared: ${key}`);
   assert(frames.slice(end).every(f=>f.backgroundAlpha===0&&f.stageAlpha===0),'Overlay must stay retired after completion');
   const before=frames[end-1],after=frames[end];
   for(const key of ['px','py','pw'])assert.ok(Math.abs(before[key]-after[key])<2,`Logo snapped at handoff: ${key}`);
  }
  assert.deepEqual(errors,[]);
  await page.screenshot({path:`output/qa/${mode}-handoff-${width}.png`});
  await page.close();
 }
 await browser.close();console.log('PASS: natural B2B/B2C loader handoffs at desktop/mobile widths; stable header geometry, logo stays in its slot, no final docking jump or runtime errors.');
})().catch(e=>{console.error(e);process.exit(1)});
