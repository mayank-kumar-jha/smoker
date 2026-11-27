const fs=require('node:fs'),{chromium}=require('playwright');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true}),p=await b.newPage({reducedMotion:'reduce',bypassCSP:true}),results=[];
const info=JSON.parse(fs.readFileSync('output/full-site/build-info.json'));
for(const width of [390,1440]){await p.setViewportSize({width,height:900});for(const item of info.pages.filter(x=>x.lang==='en'&&(x.mode!=='flavour'||x.flavour===0))){await p.goto('http://127.0.0.1:4173'+item.path);await p.waitForTimeout(500);await p.addScriptTag({path:require.resolve('axe-core')});const r=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));results.push({width,path:item.path,violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,helpUrl:v.helpUrl,nodes:v.nodes.map(n=>({html:n.html,target:n.target,summary:n.failureSummary}))})),incomplete:r.incomplete.map(x=>x.id)});console.log(width,item.path,r.violations.map(v=>v.id).join(','));}}
fs.writeFileSync('output/audit-2026-11-14/accessibility.json',JSON.stringify(results,null,2));await b.close()})().catch(e=>{console.error(e);process.exit(1)});

