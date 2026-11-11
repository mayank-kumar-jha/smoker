# Smokers brand integration

Source: `Smokers_Brand_Guidelines_v1_ES-EN.pdf`, company guidelines v1, October 2026. The original PDF is stored alongside this note and is not copied to the public website.

## Implemented

- Shared palette, font, spacing, radius and easing tokens in `site/brand.css`. Brand orange #FD4009, charcoal #1B1411, cream #F7F1E8, ember gold #D6A048; Deep Ember for small orange text on cream.
- Official orange logo extracted directly from the artwork embedded on PDF page 4. `site/assets/smokers-logo-orange.png` preserves its aspect ratio, transparency and original colours. Header, footer, loader and entrance badge use this asset instead of a typed wordmark.
- Bevan display and Barlow Condensed labels retained; Archivo 400/600/700 added as self-hosted WOFF2 with its OFL licence. Buttons use condensed uppercase labels and a minimum 44 px height.
- Green gluten-free seal. The home hero's primary action is a yellow “Order on Glovo” button; the header's delivery action still opens the section containing all three apps. Provider destinations remain the existing configured URLs.
- The home hero's decorative circular text and large outline are removed. The small gluten-free badge remains.
- Professional facts form a five-item grid in normal document flow below the CTA row, with a divider and explicit spacing. On phones the grid uses two columns. No absolute positioning between buttons and facts.
- “How it works” removed from desktop and mobile professional navigation. The hero's “How we work” control still opens the interactive process panel.
- Language equivalents, real text, focus indicators, motion toggle and reduced-motion support retained. Decorative rings pause during interaction with their panels.

## Reference panel mapping

1. Split business/home entrance → `/en/`.
2. Smoky professional hero with arch → `/en/professionals/`.
3. Nine-dish menu wheel → `/en/at-home/#ss-carta`.
4. Cream delivery cards → `/en/at-home/#ss-pedir`.
5. Cream home hero → `/en/at-home/`.

Matching translations are rendered for Spanish and Catalan. Screenshot defects were corrected: garbled ring lettering, unsupported delivery-superlative claims and decorative layers intercepting dish buttons. The latest company guide and explicit user changes take precedence over conflicting reference colours, typed logos and the home hero ring.

## Image provenance and launch follow-up

The user explicitly requested generated backgrounds where needed to recreate the reference compositions. These remain **preview artwork**, not documentary photographs of the company's dishes. PDF pages 9 and 12 call for real Smokers photography and confirmation of final photos before launch. Replace the generated scenes with company-approved photography for a fully compliant launch; no approval or publication was requested in this task.

Built-in imagegen was used in reference-edit mode for these assets. Prompt briefs:

| Project asset | Reference / generation brief |
| --- | --- |
| `site/assets/reference-gate.webp` | Remove all text, logos, buttons and ornamental UI from reference 1; recreate the 50/50 smoky brisket and fork-cut stuffed-potato photographs. |
| `site/assets/reference-pro.webp` | Remove all interface elements and the arch from reference 2; recreate a wide smoky meat-board scene with black negative space on the left. Also used behind the wheel. |
| `site/assets/reference-home.webp` | Remove UI from reference 5; recreate warm cream negative space on the left and a fork lifting a cheesy stuffed potato on the right. |
| `site/assets/reference-order.webp` | Remove UI, logos, cards and bags from reference 4; recreate cream parchment, brisket board, herbs and pepper with open areas for live content. |
| `site/assets/reference-bags.webp` | Create three equal stacked scenes: yellow Glovo, orange Just Eat and green Uber Eats delivery bags on the right, fading into cream on the left. |

Optimized responsive WebP versions are listed in `site/media.json`. The five full-size reference background assets are under 200 KB each. These photographic recreations are not exact pixel copies. Text, controls, layout, borders, highlights and rings remain live HTML/CSS/SVG.

Existing SEO metadata, real language URLs, structured data, sitemap policy and prerendered content are retained. This does not complete the separate WordPress deployment, merchant URLs, catalogue delivery backend, or company photo approval.

## Validation

Run `node tests/brand-panels.cjs` for responsive layout and interaction checks. It writes `output/qa/brand-panel-results.json`. Run `npm run test:seo` after both staging and production builds for crawler-facing checks. The local preview is served at port 4173; no public deployment is performed.
