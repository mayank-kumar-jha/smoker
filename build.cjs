const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const postcss = require('postcss');

fs.mkdirSync('output', {recursive:true});
execFileSync(process.execPath, ['node_modules/@tailwindcss/cli/dist/index.mjs','-i','src/styles.css','-o','output/compiled.css','--minify'], {stdio:'inherit'});
const tree = postcss.parse(fs.readFileSync('output/compiled.css','utf8'));
// Prefix Tailwind utility selectors as well as class names; no global theme/reset.
tree.walkRules(rule => {
  if (rule.selector.includes('.sm\\:')) rule.selector = rule.selector.split(',').map(s => '#smokers-home '+s.trim()).join(',');
});
const fontLicense = '/*! Embedded display font: Alfa Slab One\n'+fs.readFileSync('src/OFL.txt','utf8')+'\n*/\n';
const css = fontLicense + tree.toString().replace('FONT_DATA_URI','data:font/ttf;base64,'+fs.readFileSync('src/display.ttf').toString('base64'));
const component = fs.readFileSync('src/hero.html','utf8')
  .replace('/* INLINE_STYLES */',css)
  .replace('PRODUCT_DATA_URI','data:image/jpeg;base64,'+fs.readFileSync('src/product.jpg').toString('base64'));
fs.writeFileSync('output/smokers-hero-widget.html',component);
fs.writeFileSync('output/smokers-hero.html',`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Artisan smoked food from Badalona. We do the cooking. You eat."><title>Smokers — We do the cooking. You eat.</title><style>body{margin:0;background:#120D0A}</style></head><body>${component}</body></html>`);
fs.unlinkSync('output/compiled.css');
console.log('Built standalone preview + WordPress widget. Assets embedded; no browser JavaScript.');
