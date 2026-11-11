const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const b=await chromium.launch({channel:'chrome'}),base='http://127.0.0.1:4173',errors=[];
 try{
 const p=await b.newPage({reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
 for(const [width,height] of [[1920,1080],[1900,900],[1672,941],[1440,900],[1366,650],[1280,720],[1200,600],[1101,800],[1100,800],[1024,600],[820,1180],[768,1024],[701,900],[700,900],[600,900],[390,844],[320,740]]){
  await p.setViewportSize({width,height});
  for(const route of ['/es/en-casa/','/ca/a-casa/','/en/at-home/']){
   await p.goto(base+route);await p.evaluate(()=>document.fonts.ready);
   const issues=await p.evaluate(()=>{
    const issues=[];
    if(document.documentElement.scrollWidth>innerWidth+1)issues.push('page overflow');
    const hero=document.querySelector('.ss-flat-hero'),scene=document.querySelector('.ss-flat-scene').getBoundingClientRect();
    if(innerWidth>1100&&Math.abs(hero.getBoundingClientRect().height-Math.max(620,innerHeight))>1)issues.push('hero must fit the first viewport');
    if(innerWidth<=1100&&Math.abs(scene.width/scene.height-1)>.002)issues.push('mobile scene proportions');
    for(const el of document.querySelectorAll('.ss-flat-copy,.ss-flat-description,.ss-flat-guide,.ss-flat-guide li,.ss-flat-guide li strong,.ss-flat-guide h2,.ss-flat-brand,.ss-flat-actions,.ss-flat-header-tools')){const r=el.getBoundingClientRect();if(!r.width)continue;if(r.left<-.5||r.right>innerWidth+.5||el.scrollWidth>el.clientWidth+2)issues.push('clipped '+el.className)}
    if(document.querySelector('.ss-flat-process,.ss-flat-watch,.ss-flat-marquee,.ss-flat-location'))issues.push('retired hero content remains');
    if(document.querySelectorAll('.ss-reheat-instructions li').length!==3)issues.push('three reheating steps required');
    if(document.querySelectorAll('.ss-flat-actions a').length!==1)issues.push('one primary action required');
    const guide=document.querySelector('.ss-flat-guide').getBoundingClientRect();
    for(const el of document.querySelectorAll('.ss-flat-guide li,.ss-guide-heading')){const r=el.getBoundingClientRect();if(r.bottom>guide.bottom+1||r.right>guide.right+1)issues.push('guide content exceeds panel')}
    const photo=document.querySelector('.ss-flat-wallpaper');
    if(innerWidth<=1100&&!photo.currentSrc.includes('home-reference-mobile'))issues.push('mobile art direction missing');
    if(document.querySelector('.ss-craft-card,.ss-craft-platter'))issues.push('old card or cutout remains');
    if(document.querySelector('.ss-intro-video').hasAttribute('src'))issues.push('reduced-motion downloaded video');
    const h1=document.querySelector('h1'),r=document.createRange();r.selectNodeContents(h1);const ink=r.getBoundingClientRect();if(ink.left<0||ink.right>innerWidth)issues.push('heading clipped');
    return issues;
   });issues.forEach(e=>errors.push(`${width} ${route}: ${e}`));
   if(width===1672&&route.startsWith('/es/')){
    const coordinates=await p.evaluate(()=>{const r=s=>document.querySelector(s).getBoundingClientRect().toJSON();return{guide:r('.ss-flat-guide'),heading:r('h1'),photo:r('.ss-flat-wallpaper'),hero:r('.ss-flat-hero')}});
    assert(Math.abs(coordinates.guide.x-1295)<3&&Math.abs(coordinates.guide.y-138)<3&&Math.abs(coordinates.guide.width-322)<3&&Math.abs(coordinates.guide.height-725)<3,'guide must match the new reference');
    assert(Math.abs(coordinates.heading.x-104.5)<2,'heading must align to the reference');
    assert(Math.abs(coordinates.hero.height-941)<1,'desktop hero must fill one viewport');
    await p.locator('.ss-flat-wallpaper').evaluate(i=>i.decode());assert.match(await p.locator('.ss-flat-wallpaper').evaluate(i=>i.currentSrc),/1672/);
    await p.screenshot({path:'output/qa/flat-final-desktop.png'});
   }
   if(width===390&&route.startsWith('/es/')){await p.locator('.ss-flat-wallpaper').evaluate(i=>i.decode());await p.screenshot({path:'output/qa/flat-final-mobile.png',fullPage:true});}
  }
 }
 assert.deepEqual(errors,[]);console.log('Passed: 51 localized layouts and reference coordinates.');
 await p.setViewportSize({width:390,height:844});await p.goto(base+'/es/en-casa/');
 await p.locator('.ss-flat-dish').click();assert(await p.locator('dialog').evaluate(e=>e.open));await p.keyboard.press('Escape');
 await p.locator('[data-action=mobile-menu]').click();await p.locator('#ss-mobile-nav a[href="/es/en-casa/#ss-carta"]').click();assert.equal(await p.locator('#ss-mobile-nav').isVisible(),false);assert.equal(new URL(p.url()).hash,'#ss-carta');
 await p.locator('[data-action=mobile-menu]').click();await p.locator('#ss-mobile-nav a[hreflang=en]').click();await p.waitForURL('**/en/at-home/');
 const m=await b.newPage({viewport:{width:1672,height:941}});m.on('pageerror',e=>errors.push(e.message));
 await m.goto(base+'/',{waitUntil:'domcontentloaded'});
 await m.evaluate(()=>{window.introArt=document.querySelector('.ss-header .ss-logo-art');window.introSmoke=introArt.getAnimations({subtree:true}).find(a=>a.animationName==='ss-natural-smoke')});
 await m.waitForFunction(()=>document.documentElement.dataset.ssLoading==='docking',null,{timeout:13000});
 const flight=await m.evaluate(()=>{const art=document.querySelector('.ss-loader .ss-logo-art');const pieces=[...art.querySelectorAll('.ss-logo-piece')].map(piece=>{const a=piece.getAnimations().find(a=>!a.animationName);a.pause();a.currentTime=0;const from=piece.getBoundingClientRect().toJSON();a.currentTime=575;const to=piece.getBoundingClientRect().toJSON();a.play();return{from,to}});return{pieces,time:document.querySelector('video').currentTime,same:art===introArt&&art.getAnimations({subtree:true}).includes(introSmoke)}});
 assert(flight.time>=7.5&&flight.same);for(const {from,to} of flight.pieces)assert(to.y<from.y&&to.width<from.width);
 await m.waitForFunction(()=>!document.documentElement.dataset.ssLoading);
 assert(await m.evaluate(()=>document.querySelector('.ss-header .ss-logo-art')===introArt&&introArt.getAnimations({subtree:true}).includes(introSmoke)));
 assert(await m.locator('.ss-header .ss-logo-art').evaluate(el=>{const a=el.getBoundingClientRect(),b=el.parentElement.getBoundingClientRect();return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)+Math.abs(a.width-b.width)<1}));
 const before=await m.evaluate(()=>introSmoke.currentTime);await m.locator('.ss-header .ss-logo').hover();await m.waitForTimeout(200);assert(await m.evaluate(()=>introSmoke.currentTime)>before,'smoke must keep running on hover');
 assert.equal(await m.locator('.ss-header .ss-logo-smoke i').count(),6);assert(await m.locator('.ss-header .ss-logo-smoke:not(.ss-logo-name-smoke)').evaluate(e=>e.getBoundingClientRect().bottom<=e.parentElement.getBoundingClientRect().top+6.1));assert(await m.locator('.ss-header .ss-logo-name-smoke').evaluate(e=>{const logo=e.parentElement.getBoundingClientRect();return e.getBoundingClientRect().bottom<=logo.top+logo.height*.17+.1}));assert.equal(await m.locator('.ss-flat-tagline').count(),0);await m.locator('.ss-brand-fire[data-ready=true]').waitFor({timeout:8000});
 await m.screenshot({path:'output/qa/flat-final-smoke.png'});

 await m.evaluate(()=>scrollTo({top:400,behavior:'instant'}));await m.waitForTimeout(400);assert(await m.locator('.ss-flat-hero').evaluate(e=>Math.abs(e.getBoundingClientRect().top)<1&&parseFloat(e.style.getPropertyValue('--hero-scale'))<1));assert(await m.locator('.ss-flat-scene,.ss-flat-copy,.ss-flat-guide').evaluateAll(elements=>elements.every(e=>getComputedStyle(e).transform==='none')));
 await m.screenshot({path:'output/qa/flat-final-parallax.png'});
 await m.locator('[data-action=motion]').click();await m.reload();assert.equal(await m.locator('html').getAttribute('data-ss-loading'),null);assert.equal(await m.locator('video').getAttribute('src'),null);
 await m.evaluate(()=>{localStorage.removeItem('smokers-motion');scrollTo({top:0,behavior:'instant'})});await m.reload({waitUntil:'domcontentloaded'});await m.keyboard.press('Tab');assert.equal(await m.locator('html').getAttribute('data-ss-loading'),null);
 const fallback=await b.newPage();await fallback.route('**/assets/smokers-intro.mp4',route=>route.abort());await fallback.goto(base+'/es/en-casa/');await fallback.waitForFunction(()=>!document.documentElement.dataset.ssLoading,null,{timeout:6000});assert(await fallback.locator('.ss-header .ss-logo-art').isVisible());
 assert.deepEqual(errors,[]);fs.writeFileSync('output/qa/home-flatlay-results.json',JSON.stringify({passed:true,layouts:51,checks:['reference geometry','full-resolution background','natural image proportions','localized responsive content','dish dialog','menu and languages','video reveal','logo relocation','continuous natural smoke','parallax','reduced motion','saved preference','keyboard skip','video failure']},null,2));console.log('Passed: video-to-logo handoff, natural continuous smoke, parallax, navigation and recovery.');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
