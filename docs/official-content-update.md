# Official photo and copy update — 29 October 2026

The user's requested scope takes precedence over the PDF's proposed redesign: retain the existing theme, page composition, positioning and interactions; change images and copy, and include clearly identified new dishes. No stylesheet was changed. Every previous asset is retained byte-for-byte.

## Sources and mapping

- Copy: `C:/Users/saket/Downloads/Smokers B2C website pages, layout and content (ES EN).pdf` (29 October 2026).
- Photos: https://drive.google.com/drive/folders/1FD9XH18OWz_WkTEsck9Digm5GjSpDYw2
- Original downloaded photographs and Drive IDs: `docs/official-images/manifest.json`.

| Supplied image | Website use |
| --- | --- |
| Galta_.jpg | Pork cheek, including product pages, menu wheel, gallery and dialogs |
| Pollo a'last a las especias_.jpg | Spiced chicken |
| Pollo a'last a las hierbas.jpg | Herb chicken |
| Berenjena rellena de verduras.jpg | Vegetable-stuffed aubergine |
| Ensalada cesar_.jpg | Added Caesar salad |
| Ensalada de patatas con trufas.jpg | Added truffle potato salad |
| Ensalada_.jpg | Added salad; no unconfirmed recipe name assigned |
| Racion de patatas a la trufa.jpg | Added truffle potatoes |
| Racion de patatas smokers.jpg | Added Smokers potatoes |

Cannelloni, meat-stuffed aubergine and both Olot potato photographs remain unchanged. `D25A6846.jpg` is an ambiguously named aubergine photograph; it is retained without assuming a meat filling. `r.jpg` is an alternate salad photograph, not a separate named dish. `D25A6858.jpg` is a group shot, retained and encoded as `official-table.webp` for future use rather than substituting it for an unrelated scene.

The menu has 14 entries. Existing nine dish URLs are unchanged; five additional localized dish pages use the same template. Wheel spacing, wrapping, counts, catalogue selection and generated URLs use the catalog length. No prices, nutritional tables, ratings, merchant URLs or uncertain opening hours were invented. New salads/sides direct visitors to their product listing for preparation and allergen information; they do not inherit the smoked range's marination or storage claims.

## Copy

Applied the Spanish and English reference to the existing homepage description, individual dish descriptions and serving ideas, workshop method, order message, reheating copy, eight FAQs, footer tagline and homepage metadata. Catalan equivalents are included. Glovo and Uber Eats remain the visible B2C delivery providers. The existing hero retains its single Glovo action; the two-provider order section is unchanged in layout.

The PDF's new sitemap, blog, checkout-like product panels, new bars and proposed section order were not implemented because this request explicitly preserves the existing layout. Placeholder prices, ratings, reviews, hours, wood species, maker identity, allergen matrices and exact dish-specific heating settings remain unpublished. Dish descriptions are reference copy, not a verified ingredient declaration; the existing label/technical-sheet guidance remains.

## Homepage compositions

Built-in image-generation tool, edit mode, followed only by proportional resizing and WebP encoding. The food is an AI-assisted composition based on the supplied chicken and aubergine photographs; catalog photos use the supplied photography directly.

- Desktop asset: `site/assets/home-reference-official.webp` (1672 × 941).
- Mobile asset: `site/assets/home-reference-mobile-official.webp` (1254 × 1254).
- Generated PNG masters: `docs/official-images/homepage-desktop.png` and `homepage-mobile.png`.
- Previous desktop/mobile wallpaper assets are retained.

Desktop prompt:

> Use case: compositing. Edit image 1, the existing landscape 16:9 Smokers homepage photographic wallpaper. Preserve its exact composition and vibe: warm cream stone tabletop, warm natural lighting, fabric lower-left, scattered herbs, dark oval platter occupying x31%-75%, y18%-89%, and ample empty cream surface at left 0%-30%, right 77%-100%, top 0%-16% for live website text. CHANGE ONLY THE FOOD ON THE PLATTER: use a balanced combination of the real foods in images 2 and 3: two vegetable-stuffed aubergine halves with golden melted cheese, visible diced vegetable filling and dark aubergine skin from image 2, and two or three rustic herb-roasted bone-in chicken leg quarters with dark herb crust and natural juices from image 3. Aubergines prominent on front-left of platter, chicken on back-right. Faithfully preserve the visual identity of the reference dishes, no sliced chicken breast, no exaggerated shiny glaze. Remove old sliced chicken food. Transfer foods only, not their white plates or gray background. Keep dark platter same size, position, camera perspective and surrounding cream environment unchanged. Photorealistic premium food photography, natural appetizing textures. Image only, NO text, labels, logos, badges, panels or UI. Output landscape 16:9 at 1672x941 or higher equivalent.

Mobile prompt:

> Use case: compositing. Edit target image 1 the square mobile Smokers wallpaper. Replace only the food on its dark oval platter to match the chicken and stuffed aubergine combination in image 2 exactly. Two cheese-gratinated vegetable-stuffed aubergine halves with dark skin, diced vegetable filling at front-left and front-center, and rustic herb-roasted bone-in chicken leg quarters with dark herb crust at back-right. Preserve image 1 square framing, entire platter centered occupying about 82% image width, cream stone tabletop, herb sprigs, linen lower left, warm natural light, soft uncluttered cream edges. No sliced chicken breast. Match the visual food identity and natural texture of image 2. No text or logos or UI or overlays. Output square 1254x1254 or higher.

## Build and verification

- Staging and production builds: 61 documents each; production has 57 indexable URLs.
- Homepage: 51 localized responsive layouts and original composition coordinates, intro, navigation, reduced motion and parallax.
- Content: 14 menu images and selections in each language; forward/backward wrap; 42 dish pages, localized descriptions, modal and mobile checks.
- Asset preservation: zero removed or modified previous image assets; zero modified stylesheets.
- SEO verification: internal links, images, metadata, schema, reciprocal language links and sitemap coverage.

Outputs: `output/full-site`, `output/production-site`, `output/smokers-full.html`, `output/smokers-full-widget.html`, `output/smokers-production.zip`, `output/smokers-source.zip`. No public hosting or DNS was changed.
