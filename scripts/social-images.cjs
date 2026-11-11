/* Render the brand's share card and touch icon from local images/type; no remote runtime assets. */
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
let playwright;try{playwright=require('playwright')}catch{playwright=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/saket/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')}
(async()=>{
 const browser=await playwright.chromium.launch({channel:'chrome',headless:true});
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
 const base=pathToFileURL(path.resolve('site/assets')).href+'/';
 const html=`<!doctype html><html><head><style>@font-face{font-family:Bevan;src:url('${base}display.woff2')}*{box-sizing:border-box}body{margin:0;background:#120d0a;color:#f5efe6;font-family:Arial;width:1200px;height:630px;overflow:hidden}.card{display:flex;align-items:center;height:100%;padding:65px;gap:45px;background:radial-gradient(ellipse at 85% 90%,#7a2a0b,transparent 60%)}.copy{width:650px;z-index:1}h1{font:68px/.99 Bevan;margin:26px 0;letter-spacing:-2px}em{font-style:normal;color:#ff6b00}.brand{font:24px Bevan;color:#ff6b00}.label{font-size:16px;letter-spacing:4px}p{font-size:21px;line-height:1.6}img{width:450px;height:450px;object-fit:cover;border:12px solid #f5efe6;border-radius:50%;margin-right:-110px}.tag{display:inline-block;border:1px solid #ff6b00;padding:12px 20px;border-radius:40px;color:#ffb62b}</style></head><body><main class="card"><div class="copy"><div class="brand">SMOKERS</div><h1>COCINAMOS NOSOTROS.<br><em>TÚ COMES.</em></h1><p class="label">COCINA AHUMADA ARTESANAL · BADALONA</p><span class="tag">SIN GLUTEN · LISTO EN 15 MIN</span></div><img src="${base}olot-potatoes.jpg" alt=""></main></body></html>`;
 fs.mkdirSync('tmp',{recursive:true});fs.writeFileSync('tmp/social-card.html',html);
 await page.goto(pathToFileURL(path.resolve('tmp/social-card.html')).href);await page.evaluate(()=>document.fonts.ready);await page.locator('img').evaluate(img=>img.decode());
 await page.screenshot({path:'site/assets/og-smokers.jpg',type:'jpeg',quality:88});
 await page.setViewportSize({width:180,height:180});await page.setContent(`<html><body style="margin:0;background:#120d0a"><img src="${base}favicon.svg" style="width:180px;height:180px"></body></html>`);await page.locator('img').evaluate(img=>img.decode());await page.screenshot({path:'site/assets/apple-touch-icon.png'});
 await browser.close();console.log('OG 1200×630 and touch icon 180×180 rendered.');
})().catch(e=>{console.error(e);process.exitCode=1});
