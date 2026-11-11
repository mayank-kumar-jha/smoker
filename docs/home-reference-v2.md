# B2C hero reference update — 27 October 2026

The current hero follows the reference supplied on 27 October. This supersedes the layout and asset coordinates in `home-flatlay-reference.md`.

Later on 27 October, the user requested restoration of the original five video flames beneath the logo. Those flames now replace the localized tagline. The food composition, action and reheating guide remain unchanged. `site/experience-refinements.css` also contains the menu-wheel and professional-method refinements.

## Content and layout

- Large photographic platter, concise translated headline and description, and one Glovo action.
- Reheating panel has three numbered steps and the three supporting facts shown in the reference.
- Removed the location line, secondary action, process thumbnails, fourth reheating step, bottom ticker and header flames. Restored the localized brand tagline from this reference.
- Kept the existing logo reveal, reduced-motion support, menu, equivalent language navigation, product dialog and whole-hero scroll transition.
- Desktop uses one full viewport (minimum 620px in unusually short windows to preserve readable controls). Tablet places the mobile photograph beside the guide. Phones stack copy, photograph and guide without horizontal scrolling.
- Text stays in HTML. Photographs contain no baked-in text or UI.

## Assets

Created with the built-in image-generation tool in edit mode. Only proportional resizing and WebP encoding followed generation.

- Desktop: `site/assets/home-reference.webp`, with 960px and 1672px variants.
- Mobile: `site/assets/home-reference-mobile.webp`, with 640px and 1254px variants.
- Reference: `C:/Users/saket/AppData/Local/Temp/codex-clipboard-e352931f-5e5a-4553-83c1-f918e3fe85a9.png`

### Desktop prompt

Use case: precise-object-edit. Edit target: attached Smokers website reference. Create a clean photographic background plate for this exact website hero. Preserve the same 16:9 composition, camera angle, cream stone surface, herbs and fabric edges, and especially the large dark platter of glossy smoked sliced chicken with lemon, tomato and rosemary in the center-right, occupying approximately x=31% to 76%, y=18% to 90%. REMOVE ALL text, logos, navigation, buttons, icons, and the entire translucent right-hand panel, reconstructing the natural cream stone beneath them. Leave generous clear cream stone negative space on the left 6%-30% and right 78%-97% for live HTML content, plus the top 0%-15% for navigation. The image must contain only photography, absolutely no writing, symbols, circles, UI or graphical overlays. Match the supplied photograph's warm natural light, rich burnt-orange chicken and tactile cream stone. Landscape 1672x941 or higher equivalent 16:9. Preserve food proportions, don't add process thumbnails or dishes.

### Mobile prompt

Use case: precise-object-edit. Supporting image is the finished desktop photography for Smokers. Create a mobile art-direction variant: square 1024x1024 photographic composition, same exact large dark platter with glossy sliced smoked chicken, roasted lemons, tomatoes and rosemary. Center the entire platter within the square with breathing room, plate about 82% image width, no cut-off food or rim. Warm pale cream stone surrounds it, small scattered herbs and spice, subtle fabric in lower left only. Keep warm lighting and appetizing colors identical. Top and bottom edges should be softly lit cream stone with little visual clutter so it sits naturally between cream website sections. Only photography, no words, logos, symbols, panels, buttons, process circles or other UI.

## Verification

`npm run test:home` covers 51 localized viewport combinations from 320px to 1920px, including both sides of layout breakpoints. It checks content bounds, guide containment, image selection, navigation, dialog behavior, intro handoff, motion preferences and failure recovery. Portable mobile media and content without JavaScript are also reviewed.

Current visual references are saved as `output/qa/reference-v2-*.png`. Both staging and production folders and the portable previews are rebuilt from the same source.
