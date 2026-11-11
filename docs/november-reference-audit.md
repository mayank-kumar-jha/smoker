# November reference implementation and B2C guide audit

Updated 4 November 2026 in the existing local project. This supersedes the earlier circular B2C wheel and the incomplete professional hero work.

## User-directed changes

- B2B follows `C:/Users/saket/Downloads/Smokers_slides (1).pdf`: ivory hero, centre fork photograph, live SMOKERS typography, compact navigation, orange ribbon, dark catalogue, FAQ and footer. Fixed collapsed hero containers on mobile and constrained the reverse process panel. Existing 14-dish professional menu and process details remain available.
- B2C menu follows `C:/Users/saket/Downloads/WhatsApp Video 2026-11-03 at 23.41.29.mp4`: raised active card, curved/rotated adjacent cards, dots, arrows, drag/swipe, keyboard navigation and synchronized dish actions. Actual catalog photography and all 14 current dishes are retained. Unconfirmed example prices in the video are not published.
- B2C hero follows the supplied paper-bag/chicken image, with a conventional rectangular smoking cabinet, flat top, handle and dial on the back counter. Existing Order now navigation, hero copy and half-visible thin ribbon remain.
- Individual SVG hover effects, reduced motion and the animation switch are retained. Business-option icons now also respond to their label hover/focus.

## Guide audit

Reference: `C:/Users/saket/Downloads/Smokers B2C website pages, layout and content (ES EN) (1).pdf`, 22 pages.

### Already aligned, retained

- ES/EN hero description; CA translation; smoke/marination claims; 14 current dish descriptions and serving ideas (the guide predates the five added salads/sides).
- External-only ordering through Glovo and Uber Eats; no cart, payment or checkout.
- Eight consumer FAQs, existing contact details, workshop information, vacuum storage and label-based preparation guidance.
- SEO metadata, translated product pages, schema, language alternates and existing stable routes.
- Optional blog remains absent because no approved posts were provided. No fabricated reviews or review ratings.

### Corrected or added

- Intro appears once per browser rather than replaying on later pages; explicit translated Skip intro control; reduced-motion bypass remains.
- Fixed mobile ordering bar with both delivery providers.
- Order / receive / reheat steps, workshop method and workshop link, plus a professional enquiry band.
- Product pages expose both delivery-app links and dedicated reheating and allergen guidance sections.
- Footer distinguishes delivery hours (check the apps) from existing workshop visit hours.
- Catalogue dish-selection scrolling prevents options from covering the Next button.

### Deliberate precedence of newer user references

The guide's older two-column hero, circular ring, page ordering and nine-dish grid do not replace the newer user-requested centred photographic hero and video carousel. Current 14-dish inventory and established localized URLs remain. The hero's Order now action continues to scroll to Hungry now, as explicitly requested earlier. Navigation and layouts follow the newer visual references.

### Still requires confirmed business data

The website is not claimed to fully implement every launch requirement in the guide. Merchant-specific links, daily delivery hours and exact delivery areas, ratings, review counts, weights, portions, prices, dish-specific heating settings, full ingredient lists, 14-allergen matrices, traces, nutrition, freezing/open-pack durations, wood species, maker identity, RGSEAA/CIF/company legal details and approved blog posts are not supplied. Existing general app destinations and explicit label/technical-sheet guidance remain. No false live open/closed status, legal declarations, recipe claims or placeholder values are published. No new analytics/cookies are installed, so a pretend cookie-consent banner is not added. The complete proposed blog/legal sitemap and separate filterable dishes index are not created from placeholder material.

## Image generation

Built-in ImageGen edit mode. PNG masters retained in the Codex generated-images directory; final WebP assets are stored in the project. Encoding preserves proportions and alpha. These are illustrative generated hero scenes, not documentary workshop/product photographs.

B2B asset: `C:/Users/saket/OneDrive/Documents/ChatGPT/Smoker/site/assets/b2b-fork.webp`

Prompt:
> Edit reference to create ONLY a photographic cutout of the upright silver carving fork and its three smoked roast meat slices, rosemary garnish, a few peppercorns and faint wisps of steam. Remove ALL lettering, brand logos, UI, orange ribbon and ivory background. Transparent background. Match the reference composition: vertical two-tine carving fork, realistic thin stainless steel handle extending down, three irregular slices of cooked smoked beef arranged on the fork at middle, real juicy pink-brown interior and dark caramelized crust, small green rosemary sprig upper right. Anatomically/plausibly coherent real food, natural editorial photography, no plastic glaze. Fork tip visible above meat, full handle to image bottom. Portrait composition, centered subject with space around it, soft warm studio lighting. No text whatsoever. This cutout will be layered above giant live SMOKERS typography on an ivory webpage.

B2C asset: `C:/Users/saket/OneDrive/Documents/ChatGPT/Smoker/site/assets/b2c-kitchen-cabinet.webp`

Prompt:
> Edit this website reference into a pure photographic background, landscape 16:9. Preserve warm dark rustic kitchen, copper pans left, branded brown Smokers paper delivery bag left foreground, naturally roasted whole chicken centered lower on a thick wooden board, bowl of spices bottom left, soft realistic steam. Remove ALL webpage navigation, heading text, description, buttons, fact icons and orange banner. Preserve only physical printed branding on paper bag. IMPORTANT change the smoking machine at rear right: a realistic squat rectangular commercial food smoking cabinet, matte dark metal, flat top, a normal hinged rectangular door with horizontal handle, a small round temperature dial, short stable feet, clearly wider than it is deep. No pointed or rounded rocket nose, no taper, no fins, no spaceship shape, no exaggerated chimney. Put it on back worktop far behind the chicken, softly out of focus, partly in shadow, subtle amber edge light so it remains visible but not dominant. Upper middle 0-48% must remain dark open negative space for live hero typography; food and bag in bottom half, chicken board at x25-84%, y60-90%, bag left x10-32% y45-85%. Keep natural realistic chicken anatomy and irregular browned skin with restrained sheen, no repeated spike pattern. Exact composition and moody amber palette of supplied image, no extra objects or UI.

## Verification

`node tests/november-reference.cjs`: 48 layouts across three languages and both B2C/B2B, 320–1920px. Checks horizontal overflow, B2B image dimensions, carousel navigation/wrap/keyboard/dialog, desktop/mobile process flip, catalogue selections/back navigation, mobile ordering/menu and first-visit intro/skip. Screenshots and JSON results: `output/qa/nov4-*`.

`npm run test:seo`: both 61-page builds, 57 production indexable URLs, internal links/assets, metadata/schema and reciprocal language links.

Older home-reference and B2C wheel tests describe superseded layouts; use the November suite for the current design. No public deployment or DNS changes.
