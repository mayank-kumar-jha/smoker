# B2C tabletop hero and animated intro

Implemented 25 October 2026 from the user's flat-lay card reference:
`C:/Users/saket/AppData/Local/Temp/codex-clipboard-f2e11a1f-ef8c-44f6-a542-10cee455018d.jpg`.

The built-in image generation tool produced three separate bitmap layers. Typography, navigation, the rounded card, process path and controls are real HTML/CSS/SVG. No text or interface is baked into the generated photography. The lower duplicate wordmark from the reference is replaced by a continuously looping localized banner.

## Final assets

- `C:/Users/saket/OneDrive/Documents/ChatGPT/Smoker/site/assets/craft-table.webp`: warm ivory tabletop wallpaper (1585 × 992).
- `C:/Users/saket/OneDrive/Documents/ChatGPT/Smoker/site/assets/craft-platter.webp`: transparent platter and condiment bowls (1254 × 1254).
- `C:/Users/saket/OneDrive/Documents/ChatGPT/Smoker/site/assets/craft-steps.webp`: four process photos, rendered as circular crops with CSS (1254 × 1254).
- Responsive variants are registered in `site/media.json`; generated PNG masters remain in the Codex generated-images directory.

## Final generation prompts

### table

Transparent background: false.

Image 1 is a photographic composition reference. Generate ONLY the empty tabletop backdrop for this website, landscape 1.6:1. Match the warm ivory slightly textured limestone surface, orange-striped linen draped in the upper-left, small black spice bowl cropped on the far left, wooden chopping board and smoking wood chips cropped upper-right, wooden brush and glossy red barbecue sauce bowl on a rustic board cropped lower-left, rosemary sprigs and sparse red pepper flakes near the edges. Keep the whole central 75% very clean pale cream with subtle stone texture, no plate, no chicken, no bowls in the central area. Match the provided photograph's exact lighting, angle (flat lay directly overhead), realism and warm premium food styling. Absolutely no text, logos, lettering, icons, cards, boxes, borders, circles, lines, or UI. Output a seamless photographic wallpaper only.

### platter

Transparent background: true.

Image 1 is a reference for the central food arrangement. Recreate the central overhead black rustic oval platter heaped with glossy orange-brown hardwood-smoked chicken: sliced juicy chicken breast, golden glazed chicken legs, charred lemon halves and delicate rosemary. Include the four small black condiment bowls around it as in the reference: herb oil upper-left, red barbecue sauce middle-left, coarse salt upper-right, mixed peppercorns middle-right, plus just a few scattered spices and herbs. Isolate this entire plate-and-four-bowls arrangement as a single photorealistic cutout on a genuinely transparent background, with soft natural contact shadows. The platter should dominate and remain vertically oriented; preserve the reference's food styling, overhead angle, appetizing detail and positions. Frame square with generous transparent margins so every bowl and the whole platter are fully visible. OMIT the reference's card, tabletop, logos, typography, process circles, orange path, icons, headers, bottom wordmark and all UI. Output only the isolated photographic food arrangement.

### steps

Transparent background: false.

Create a square 2-by-2 contact sheet of exactly four photorealistic food process photographs for a premium smoked-food website matching Image 1's food styling. No gutters, no borders, no letters, no labels, no logos. Four equal square cells, each with a centered subject suitable for a circular crop. TOP LEFT: raw chicken pieces marinating with herbs, garlic and spices in a bowl, pale pink chicken. TOP RIGHT: a small heap of real oak wood chips with delicate pale smoke on a dark rustic surface. BOTTOM LEFT: golden orange-brown slow-cooked chicken with glossy sauce, herbs and charred edges. BOTTOM RIGHT: beautifully sliced ready-to-serve smoked chicken breast showing juicy pale interior with golden caramelized crust. Direct overhead or slightly angled close-ups, natural warm light, highly realistic, sharp detail. Each cell must be independent with no objects crossing between cells. No graphic process arrows, icons or UI.

## Video and logo handoff

The user's `C:/Users/saket/Downloads/smokers_animated_dark_horizontal_1200x675.mp4` is copied unchanged to `site/assets/smokers-intro.mp4`. The browser plays this actual video, muted, at 1.75× speed. At media time 7.55 seconds, after the circular brand reveal is complete, the real logo symbol and wordmark crossfade out of the video and animate separately into their measured positions in the card's upper brand block over 1.15 seconds.

The official transparent logo is split into two clipped CSS layers, without raster modifications. The same DOM nodes and smoke animation timelines survive relocation using `Element.moveBefore`, with a timeline-preserving fallback. The logo then continues smoking in the header. Video errors, stalls, pointer/keyboard interaction, scrolling and resize recover to the usable page. A 12-second hard deadline prevents indefinite loading; reduced motion and the stored animation preference skip the video download and decorative motion.

The tabletop and platter have independent pointer/scroll offsets. On desktop the hero stays behind the second panel as that panel rises over it. Mobile and reduced-motion layouts use ordinary document flow. Four process buttons and their photographic counterparts update the same accessible process explanation. Menu, ordering, workshop, professional and language navigation remain functional.

## Validation

`npm run test:home` checks 27 locale/viewport combinations, process controls, product dialog, language navigation, the actual video reaching its reveal, separate symbol/name movement, precise landing, continued smoke on hover, marquee continuity, parallax, reduced motion, saved preferences, keyboard skip, resize recovery and unavailable-video recovery. Additional site and SEO suites verify existing routes and server-rendered content.

