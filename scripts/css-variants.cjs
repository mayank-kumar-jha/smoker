const postcss=require('postcss');
module.exports=function variants(css){
 const filters={
  casa:/\.(?:ss-b2b[\w-]*|ss-chicken(?!-steam\b)[\w-]*|ss-pro-showcase[\w-]*|ss-pro-preloader[\w-]*)\b/,
  profesional:/\.(?:dsh-[\w-]*|ss-flat-scene|ss-flat-copy|ss-flat-wallpaper|ss-hero-facts|ss-flavour-[\w-]*)\b/,
  support:/\.(?:dsh-[\w-]*|ss-b2b[\w-]*|ss-chicken[\w-]*|ss-pro-showcase[\w-]*|ss-pro-preloader[\w-]*|ss-flat-scene|ss-flat-copy|ss-flat-wallpaper|ss-hero-facts|ss-flavour-[\w-]*)\b/
 };
 return Object.fromEntries(Object.entries(filters).map(([mode,exclude])=>{
  const root=postcss.parse(css);root.walkRules(rule=>{if(rule.parent.type==='atrule'&&/keyframes/.test(rule.parent.name))return;const selectors=rule.selectors.filter(s=>!exclude.test(s));if(selectors.length)rule.selectors=selectors;else rule.remove()});
  root.walkAtRules(rule=>{if(rule.nodes&&!rule.nodes.length)rule.remove()});return [mode,root.toString()];
 }));
};
