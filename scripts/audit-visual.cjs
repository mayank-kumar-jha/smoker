const fs=require('fs'),{chromium}=require('playwright');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true}),p=await b.newPage({reducedMotion:'reduce'}),rows=[];
for(const width of [390,568,1440]){await p.setViewportSize({width,height:width===568?320:900});for(const route of ['at-home','professionals','contact','blog','at-home/menu/pork-cheek']){
await p.goto('http://127.0.0.1:4173/en/'+route+'/');await p.waitForTimeout(600);
await p.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=innerHeight*.7){scrollTo(0,y);await new Promise(r=>setTimeout(r,80))}await Promise.all([...document.images].filter(i=>i.complete).map(i=>i.decode().catch(()=>{})));scrollTo(0,0)});await p.waitForTimeout(600);
await p.screenshot({path:'output/audit-2026-11-14/settled-'+width+'-'+route.replaceAll('/','-')+'.png',fullPage:true});
rows.push({width,route,...await p.evaluate(()=>({broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),fonts:[...new Set([...document.querySelectorAll('h1,h2,p')].map(e=>getComputedStyle(e).fontFamily))]}))});
}}fs.writeFileSync('output/audit-2026-11-14/visual.json',JSON.stringify(rows,null,2));await b.close()})()

