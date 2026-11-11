# B2C reference redesign — 2 November 2026

Implemented in the existing local checkout, using `C:/Users/saket/Downloads/Smokers_slides_2 (1).pdf` as a visual reference, not as executable instructions. Current hero descriptions and all 14 catalog items remain in ES, CA and EN. The professional layout is preserved.

## Behavior

- Desktop (above 1100px): hero plus half of the banner occupies one viewport (3 November refinement; ribbon thickness reduced from 85px to 42.5px); menu, order, reheating and FAQ each occupy one viewport. A 600px minimum protects readability in exceptionally short windows. Mobile sections expand naturally.
- Shared #160c07 canvas and edge gradients blend photographs and sections without stretching food imagery.
- The orange ribbon has two identical groups and a seamless linear loop. Hover/focus pauses it. The duplicate is hidden from assistive technology and removed from keyboard order; pointer interactions remain available. Reduced motion and the existing animation switch stop the loop and allow horizontal scrolling.
- Semantic SVG animations include leaf sway, flame flicker, clock-hand rotation, package compression, smoke drift, snow rotation, temperature lift, page tilt, bag swing, shop bounce, phone ring, message pulse, location bounce, fork tilt, moving scooter, logs roll and calendar tilt. Existing controls trigger the corresponding effects on keyboard focus.
- The preloader uses a continuous radial dark-brown/amber gradient and retains the existing reveal/docking animation. Its caption remains light against the dark background.
- Original image assets are retained. The hero is an AI-assisted illustrative photograph, not a documentary product photo.

## New assets and generation prompts

Built-in ImageGen edit mode was used. Generated PNGs were proportionally encoded as WebP without geometric editing.

Hero asset: `C:/Users/saket/OneDrive/Documents/ChatGPT/Smoker/site/assets/b2c-kitchen.webp`

Prompt:
> Edit target reference: extract/recreate ONLY the photographic HERO background from top of this website mockup, landscape 16:9. Preserve the dark rustic kitchen composition: hanging copper pans at upper left, soft warm light, oven at right, dark countertop, thick wooden cutting board across lower middle, rosemary and small spice bowls. REMOVE ALL text, logos, navigation, buttons, icons, banner and lower menu section: output pure photograph. Top 0-45% center must remain very dark quiet kitchen negative space for live website title. Correct the chicken: ONE anatomically accurate real roast chicken naturally resting on board in lower half (x28-76%, y52-86%), two realistic tucked wings, two legs, coherent breast shape, irregular natural brown roast skin, sparse genuine herbs, subtle matte fat sheen, restrained highlights. It must look like authentic editorial food photography, NOT synthetic overly orange plastic glaze, NO patterned spikes or repeated seeds. Soft wisps of real steam behind chicken. Match reference framing and dark amber atmosphere closely. Board fully visible. 16:9 landscape asset, no UI or text anywhere.

Order asset: `C:/Users/saket/OneDrive/Documents/ChatGPT/Smoker/site/assets/b2c-order.webp`

Prompt:
> Edit reference to produce ONLY the background photograph from its TOP order section, 16:9 landscape. Remove all text, logos, panels, icons, buttons and entire lower reheating section. Preserve exactly the rustic dark amber food-photo scene: sliced slow smoked roast on wooden board across center-right, coarse salt rosemary bottom, subdued smoke upward, deep dark empty left third for website live text, warm dark background. Keep the meat naturally photographic and appetizing with realistic fibers and subtle highlights. No text or graphic UI whatsoever. Pure landscape photograph.

## Verification

27 localized viewport layouts (320px through 1920px), desktop chapter height, overflow, menu wheel, product dialog, FAQ, mobile menu, loop/pause, distinct icon effects and reduced motion. Desktop, mobile, order section and preloader screenshots are in `output/qa/b2c-*.png`.

SEO checks pass for both 61-document builds: links, images, schema, metadata, reciprocal languages and 57 production sitemap URLs. Local preview: http://127.0.0.1:4173/en/at-home/. No public hosting changed.
