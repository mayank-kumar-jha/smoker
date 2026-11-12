# Smokers — full website and SEO build

## Current design — 4 November 2026

B2B now uses the ivory fork hero and dark catalogue from the professional reference. B2C uses the supplied curved-card video menu and the paper-bag/chicken background with a rectangular smoking cabinet. Mobile ordering, first-visit intro, product preparation and workshop content follow the supplied guide where confirmed data is available. Run `node tests/november-reference.cjs` for current design checks. See [reference implementation and guide audit](docs/november-reference-audit.md) for intentional design precedence, missing business data and generated-asset prompts. Older layout descriptions below are historical.

## B2C reference redesign — 2 November 2026

The consumer page now follows the dark kitchen PDF reference, with the existing localized hero description and 14 dishes. Desktop chapters fit the viewport, photographs fade into a continuous dark background, and the tilted benefits ribbon loops with hover/focus pause. SVG icons have individual hover animations and reduced-motion support. The intro uses a warm brown/amber gradient. Run `node tests/b2c-reference.cjs` for the current layout and interaction checks; older home-reference tests assert the superseded cream layout. See [design and asset notes](docs/b2c-reference-redesign.md).

## Official content update — 29 October 2026

Updated the existing design with four official replacement dish photos, five new salads/sides and a chicken-and-aubergine homepage composition for desktop and mobile. Spanish and English copy follows the supplied B2C reference, with Catalan translations. Every previous image and all stylesheets are preserved. The current build contains 14 dishes, 42 localized dish pages and 57 indexable URLs (61 generated documents). Historical counts below describe earlier versions. See [the update record](docs/official-content-update.md) for photo mappings, scope, prompts and verification.


## Latest refinements and phone preview — 27 October 2026

The home logo again uses the original five animated flames from the supplied intro, replacing the tagline. The menu wheel uses restrained bronze borders without stars or yellow glow, eased rotation and decoded photo crossfades. The professional reverse panel uses the supplied background with a left headline and numbered detail rows, preserving every original process detail and all four timing/temperature facts. `npm run test:refinements` checks 54 localized wheel/process layouts, rapid selection, flame playback, original content, dialog focus and reduced motion. `npm run test:home` also passes all 51 localized home layouts.

For a phone on the same Wi-Fi, run `npm run dev:lan`. This starts a separate staging preview on port 4174 bound to the computer's private network address. The command prints the address to open on the phone. Keep the computer awake and the server running. `localhost` and `127.0.0.1` on a phone point to that phone, not the computer. The ordinary desktop preview remains on port 4173. The LAN mode keeps staging noindex and does not change public hosting or DNS.

## Current B2C hero — 27 October 2026

The home hero now matches the new large-platter reference with one order button, shorter copy and a three-step reheating panel. The location line, extra action, process thumbnails, fourth step, bottom ticker and header flames have been removed from this hero. The localized brand tagline is restored. Desktop uses the new full-background image; phones and tablets receive a separate square photograph. Tablet and phone layouts reflow the content while preserving readable controls. The existing intro and logo handoff remain. Both builds and portable previews include the update. See `docs/home-reference-v2.md` for the current assets, prompts and responsive behavior; this supersedes the earlier hero descriptions below.

The full experience follows the supplied video: Spanish home landing page, professional hero with a genuine 3D reverse panel, food gallery, three-step catalogue request, photographic home hero, rotating dish wheel, delivery providers, reheating guide, FAQs and footer. Spanish, Catalan and English are included. Desktop heroes use the available viewport height. The B2C header, hero and bottom strip fit the reference composition at standard desktop sizes; very short windows allow scrolling to preserve readability. The gallery, wheel, catalogue and delivery panels also fit one viewport. Type, photos and spacing adapt to screen height as well as width. Phones use compact layouts with readable content; very short desktop windows retain access through local scrolling rather than clipping controls.

## Preview

```sh
npm ci
npm run build:site
npm run dev
```

Open http://127.0.0.1:4173. The root and `/es/` redirect to Spanish `/es/en-casa/`. `/en/` and `/ca/` redirect to their localized At home pages. The professional experience remains at `/es/profesionales/`. The preview server listens only on the local machine by default. It returns real 404 and 301 statuses and compression/security headers.

`output/smokers-full.html` is a self-contained interactive preview that can be opened directly from disk. `output/smokers-full-widget.html` is the corresponding full-width Elementor/WordPress demo. Paste it once into an HTML widget, with no container padding. The original small hero remains available as `output/smokers-hero.html` and `output/smokers-hero-widget.html`.

**Use the generated multi-page site for SEO.** The portable single-file demo uses hash navigation and is not the SEO deployment. Its standalone document is marked noindex. A WordPress HTML widget cannot by itself provide server-rendered multilingual routes, HTTP status codes, or an SEO plugin integration.

## Production output

```sh
npm run build:production
```

This creates `output/production-site/`, separately from the noindex staging build in `output/full-site/`. There are 42 indexable URLs: five main/supporting pages and nine dish pages per language. Three request-prepared pages and the 404 document remain noindex. The production sitemap contains only the 42 indexable URLs; the staging sitemap is empty. **Do not upload the staging folder as the live site.**

Serve directory `index.html` files directly, keep assets at `/assets/`, and configure unknown paths to return `/404.html` with status 404. The included Node server supports this behavior. Set `SMOKERS_OUTPUT` to the production directory to serve that build. For public Node hosting, set `SMOKERS_PUBLIC=1` behind a trusted HTTPS reverse proxy. `ENFORCE_CANONICAL_HOST=1` combines HTTPS/non-www/path normalization in one redirect; only enable this behind a proxy that supplies a trusted `X-Forwarded-Proto` header. Configure TLS and HSTS at that proxy. The `_headers` file is provided for hosts that support that format; other hosts need equivalent configuration. `seo/redirects.json` contains the verified legacy mappings.

Public staging requires `STAGING_USER` and `STAGING_PASSWORD` environment variables. The staging server refuses public binding without them. Staging has both HTML and HTTP noindex directives, with crawling allowed so those directives can be seen. Never commit credentials. DNS, TLS, hosting, Search Console and the Odoo subdomain have not been changed.

## Edit content and SEO

| File | Purpose |
| --- | --- |
| `site/data.js` | Translations, nine dishes, contact and delivery configuration |
| `site/routes.js` | Language-specific paths and product slugs |
| `site/app.js` | Shared build-time HTML renderer and browser interactions |
| `site/styles.css` | Scoped responsive CSS and compiled Tailwind |
| `site/pages.js` / `site/pages.css` | Contact, workshop, stockists, client requests and privacy: translated content, metadata and layouts |
| `site/brand.css` | Company palette, official logo styling, Bevan/Barlow Condensed/Archivo |
| `seo/settings.json` | Canonical origin, business identity, page metadata, approved product overrides |
| `seo/redirects.json` | Explicit old URL → new URL migration map |
| `build-site.cjs` | Static HTML, metadata, schema, hreflang, robots, sitemaps and portable previews |
| `serve.cjs` | Local/public static server, authentication, redirects and real error statuses |

Product-specific metadata and approved ingredient/allergen copy can be entered in `productOverrides`, keyed by product ID and language:

```json
{
  "pork": {
    "es": {
      "title": "Approved page title",
      "description": "Approved search description",
      "ingredients": "Exact approved ingredient list",
      "allergens": "Exact approved allergen statement"
    }
  }
}
```

Do not put sample text into production. Without these fields, dish pages show a truthful instruction to consult the label or request the technical sheet. No ingredient lists, prices, stock, reviews or star ratings have been invented. The Product schema describes the dishes; it does not claim Google product rich-result eligibility.

The initial HTML contains the content, headings, images, FAQs and product links. JavaScript enhances the page without replacing its initial document. Locale switches are real links to the equivalent page, without automatic language redirects. Each page has an absolute self-canonical, translated metadata, reciprocal language alternates and an x-default. Dish pages have visible breadcrumbs and matching schema. JSON-LD also describes the verified business, website, pages and visible FAQs. Social sharing uses a local 1200 × 630 image and an Apple touch icon.

Responsive WebP variants have intrinsic dimensions, srcset and sizes. Hero images are prioritized, lower gallery images are lazy loaded, and the three font families are local WOFF2 with font-display: swap. To regenerate media after changing originals, install Pillow, fonttools and brotli, then run `python scripts/prepare-media.py`. Run `npm run media:social` to regenerate the HTML-rendered share card and touch icon. No font CDN, browser Tailwind compiler or animation library is required.

## Motion and accessibility

The professional card rotates in a perspective container; both faces exist throughout the transition. The inactive face is inert and hidden from assistive technology. Wheel positions animate with transforms, including continuous forward/backward rotation. The two vertical text banners use seamless duplicated tracks moving in opposite directions. Banners, rings, ticker, flames, gallery reveals and form transitions respond to the visible Animaciones/Animations switch and the operating system's reduced-motion preference. Preferences persist locally. Reduced motion keeps all content and controls available.

Native dialogs support Escape/focus return; the mobile menu closes with Escape; the dish wheel supports arrow keys. The page has a skip link, visible focus styles, semantic headings, form labels and validation. Locale controls and the mobile menu meet a 44px touch target minimum.

## Remaining launch configuration

- Replace the three provider homepage URLs in `site/data.js` with verified Smokers merchant URLs. Current links explain that users must check availability in the app. The references and live buttons did not provide verified storefront links.
- The catalogue form prepares an email draft for review and sending. It does **not** send to a backend or imply successful delivery. Connect an approved form/email service before replacing that workflow with a lead confirmation. The prepared page is deliberately noindex.
- Add approved dish ingredient/allergen sheets and any additional content from the larger page-count proposal. This build includes the video experience, nine dish detail pages and five supporting pages per language; unprovided business records, prices and stockists are not fabricated.
- Import a complete legacy URL inventory before migration. The six verified redirects provided here are not a substitute for that inventory.
- `/privacy-policy-2/` and `/hola/` now redirect locally to the Catalan privacy and contact pages. All Contact, Privacy, Client Area and stockist navigation stays inside this project. The new privacy notice describes the email-draft implementation; have the business review it against the final hosting and operations before public launch.
- Add consent-managed analytics using the real property IDs. After marketing/analytics consent, set `window.SMOKERS_ANALYTICS_CONSENT=true`; outbound delivery links then push `delivery_app_click` with provider and language into `dataLayer`. No analytics scripts or cookies are loaded by default, and an email draft is never recorded as a successfully submitted lead.
- The public Client Area now provides catalogue, technical-sheet and order enquiry tools within this site. It does not impersonate a signed-in account or expose invoices/order history. No Odoo links remain; the separate Odoo system has not been changed.

## WordPress integration

For the live WordPress version, use these renderer outputs as the basis of PHP templates and register the same real language/page URLs through Polylang or the site's chosen multilingual plugin. Enqueue the compiled stylesheet and scripts, keep page content in the server response, and call `wp_head()` / `wp_footer()` from the theme. Let the chosen SEO plugin own metadata, canonical, hreflang and schema; do not paste this standalone `<head>` alongside plugin output or duplicate schema. Expose the metadata/content in the editor. The existing Elementor demo is useful for visual review; it does not replace this theme/plugin work. No live WordPress installation or plugin settings have been modified.

## Verification

```sh
npm run test:site
npm run test:viewport
```

Run the preview server first. Tests use installed Chrome, with Playwright, at 320, 390, 768, 1024, 1440 and 1728px. They check true flip interpolation, inactive-face focus behavior, wheel animation, form validation/state retention, an intercepted email draft, locale navigation, motion preferences, screenshots, HTML with JavaScript disabled, metadata, schema, canonical URLs, hreflang, redirects and 404 status. Test results and screenshots are in `output/qa/`. Lighthouse reports there are local lab checks, not live PageSpeed or field Core Web Vitals measurements.

The supplied video and PDFs were used as design/business/technical references. Font licenses are included with the assets; food photography was reused from Smokers' public website. The implementation follows [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [localized-version guidance](https://developers.google.com/search/docs/specialty/international/localized-versions) and [Lighthouse audit documentation](https://developer.chrome.com/docs/lighthouse/overview).


## Supporting pages

The new pages share the official logo, self-hosted brand fonts, charcoal/cream palette and existing real product photography:

| Page | English | Spanish | Catalan |
| --- | --- | --- | --- |
| Meet Smokers: workshop, delivery, stockists and contact | `/en/contact/` | `/es/contacto/` | `/ca/contacte/` |
| Client enquiries | `/en/clients/` | `/es/clientes/` | `/ca/clients/` |
| Privacy | `/en/privacy/` | `/es/privacidad/` | `/ca/privacitat/` |

The user explicitly selected email drafts for this release. Forms validate name, email, message and privacy acknowledgement; stockist enquiries also require town/postcode, and professional enquiries require a business name. A prepared draft can be opened in an email app, downloaded as a UTF-8 text file or edited. No message is sent automatically and personal fields are not persisted in browser storage. Without JavaScript, direct email/phone links remain available and form submission is disabled to prevent query-string disclosure.

The client page supports optional dish selection and technical-sheet/order enquiry topics. It is public support, not an authenticated customer dashboard. Stockists are handled by enquiry until the company supplies verified locations. Delivery-app, telephone, email, WhatsApp, maps and AEPD links remain external for their intended functions.

Business contact details were checked against https://smokers.cat/hola/; controller identity against https://smokers.cat/privacy-policy-2/. The website's technical privacy description is written for this implementation, rather than copying references to WordPress comments, login credentials or integrations that it does not have.

Validation: `npm run test:support` checks 36 page/language/viewport combinations, form validation, localized draft/download content, mobile navigation and no-JS behavior. `npm run test:experience` checks 54 responsive views, legacy section redirects, stockist validation, continuous arc motion and portable navigation. `npm run test:seo` validates both builds (46 pages each, 42 production sitemap URLs). These tests do not send email.


## Unified Meet Smokers page (25 October 2026)

Contact, Our Workshop and Find Smokers now share one translated destination: `/en/contact/`, `/es/contacto/`, `/ca/contacte/`. Its workshop story, process, delivery choices, stockist enquiry and contact details have direct section links. The former workshop and stockist URLs redirect to the relevant section; they are excluded from the sitemap. `_redirects` and static HTML redirect fallbacks are generated alongside the Node server’s 301 redirects.

`site/hub.js` owns this page’s layout and translations. `site/experience.css` contains the photographic treatments for the hub, catalogue, reheating guide and FAQs. `site/smoke-details.css` owns the open professional process arc, dark reverse panel, dish pages and dialogs. The arc highlight continues on hover/focus and respects reduced motion and the animation switch. Stockist enquiries require a town/postcode; the shared form still prepares a local email draft for review.

## Latest reference refinements

The audience chooser has been retired. The root now redirects to Spanish En casa, and localized entry URLs redirect to their home pages. Static-host fallback documents, internal links, sitemap and hreflang follow the same structure. Portable previews also start in Spanish at home.

The B2C hero follows the latest full-background reference. One undistorted 1672 × 941 photographic scene sits behind real HTML navigation, the left headline and actions, process labels, and the right reheating guide. The previous large card and separate platter PNG are removed. `site/home-hero.js` owns the localized markup; `site/home-flatlay.css` matches the reference's desktop coordinates and adapts the same background to mobile. The bottom banner loops continuously. The desktop hero occupies exactly one viewport. A proportional inner composition preserves the photography and label alignment. Scrolling uniformly scales the entire first screen from 1 to 0.92 while the menu overlaps it; no inner elements move independently.

`site/loader.js` plays the supplied video from `site/assets/smokers-intro.mp4` at 1.75× speed. At media time 7.55 seconds, the symbol and wordmark glide separately into the upper logo slot over 1.15 seconds. Transparent photographic smoke drifts above both the badge and wordmark without covering the lettering. The intro uses a warm white background for B2C and the original dark background for professional pages. Its caption adapts for contrast. The circular text is removed from the intro, and the same five source-video flames loop beneath the header logo in place of the former tagline. The same nodes and animation timelines survive relocation. Pointer/keyboard interaction, scrolling and resize can skip the intro; reduced motion and saved preferences skip the video download. Failed or stalled video recovers to the page, with a 12-second hard deadline.

`npm run test:home` checks 27 localized layouts, reference geometry, image proportions and resolution, navigation, video-to-logo relocation, smoke and marquee continuity, parallax and failure recovery. The image was edited with the built-in image tool. Final background paths and prompt are in `docs/home-flatlay-reference.md`; the natural smoke asset, prompt, video processing and motion behavior are documented in `docs/brand-smoke-and-fire.md`.

`npm run test:details` covers 99 dish/process layouts, entry redirects, dialog focus return, loader completion, failed images, keyboard skip, no-JS and motion preferences. Background generation details and the final prompt are in `docs/hero-arc-asset.md`.
