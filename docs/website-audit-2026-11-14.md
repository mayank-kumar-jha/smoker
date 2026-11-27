# Smokers website audit — 14 November 2026

Production target: WordPress. Required outcome: a fast website whose content and images can be maintained through WordPress.

## Decision

**Ready for continued staging work; not ready for production approval.** The design and static SEO foundation are substantial, and the WordPress content system exists. However, mobile performance is below target, accessibility defects are reproducible, replacement images bypass responsive sizing, and full editor/hosting acceptance is incomplete.

A fresh WordPress installation initially failed with HTTP 500. This audit corrected the missing WordPress file-utility dependency in `wordpress/smokers-content/frontend.php`; the inspected homepage, privacy page and dish page subsequently returned HTTP 200. This is the only application fix included in this audit. Other findings below remain recommendations unless explicitly marked verified or fixed.

Local WordPress: http://127.0.0.1:9400/en/at-home/

WordPress editing: http://127.0.0.1:9400/wp-admin/admin.php?page=smokers-content

Static comparison preview: http://127.0.0.1:4173/en/at-home/

These are local development previews, not public hosting. The WordPress Playground installation is temporary. Production hosting, real mail receipt and the client's existing plugin stack were not accessed.

## Coverage and evidence

- Built the production export, WordPress generated templates and staging export from current source.
- Executed `npm run check`: TypeScript, static SEO and the 72-check frontend smoke suite passed.
- Executed dedicated flavour-page and animation/navigation suites: passed.
- Ran a new **480-case matrix: 40 generated pages × 12 viewports**. It recorded HTTP status, document overflow, H1 count, font sizes, clipped text candidates and browser exceptions.
- Viewports, in CSS pixels: **320×568, 360×640, 390×844, 430×932, 568×320, 768×1024, 820×600, 1024×768, 1280×720, 1440×900, 1920×1080, 2560×1440**.
- Ran axe accessibility checks on six English page types at 390 and 1440 pixels wide. Reviewed representative screenshots, including pages after scrolling to trigger lazy images.
- Ran mobile Lighthouse twice on the static homepage and once on local WordPress.
- Inspected PHP rendering, content substitution, media handling, forms, schema, setup and editorial storage.
- Crawled all 39 designed public routes on WordPress after the startup fix: each returned HTTP 200 with one H1 and a description. Also inspected the `/404.html` path separately; it does not behave like the static 404 template in this local WordPress setup.
- `npm audit` reported zero known vulnerabilities in the resolved dependency tree at audit time. This is not a penetration test or a guarantee of security.

The accessibility scan flagged violations in **9 of 12 page/viewport checks**, with 18 affected element instances across those checks. Repeated components account for multiple instances; this is not 18 unique design defects. The GitHub Actions workflow currently runs frontend/SEO checks and dependency auditing but **does not run the WordPress integration suite**. Add a WordPress release gate so a frontend-only pass cannot conceal another PHP startup failure.

Machine-readable evidence and screenshots are in `output/audit-2026-11-14/`. Core test results refreshed by this audit are in `output/phase1/frontend-tests.json` and `output/phase1/flavour-tests.json`. Older `wordpress-tests.json` and `editability-coverage.json` files are historical evidence, not current passing runs.

**Limits:** this is not proof of every possible height and width. The 480-case matrix uses Chrome and reduced motion. Motion-on interactions have separate targeted coverage. Safari/iOS, Firefox, physical phones, browser text enlargement, assistive-technology walkthroughs, long replacement text, arbitrary image crops, real-host load tests and field Core Web Vitals remain acceptance tasks. No finite viewport matrix establishes universal visual correctness.

## Page count and information architecture

| Page type | Per language | Total |
|---|---:|---:|
| Consumer homepage | 1 | 3 |
| Professionals | 1 | 3 |
| Contact | 1 | 3 |
| Blog landing | 1 | 3 |
| Privacy | 1 | 3 |
| Dedicated dishes | 8 | 24 |
| **Public content URLs** | **13** | **39** |
| Shared 404 template | — | 1 |
| **Generated HTML total** | — | **40** |

Languages: Spanish, Catalan and English. There are 13 equivalent content destinations translated into three languages, not 39 distinct editorial topics. Published native WordPress posts can add further URLs. WordPress also creates structural parent pages; the plugin redirects managed parent placeholders. Those are not additional designed content pages.

The eight current English dishes are Pork Cheek, Spiced Chicken, Herb Chicken, Meat Cannelloni, Smokers Salad, Truffle Potatoes, Smokers Potatoes and Cheese stuffed Eggplant. Older route/product data includes more names; it must not be used to calculate the current published page count.

The number of pages is reasonable for the current offer. More pages should come from useful content, not arbitrary expansion. The blog currently shows an empty-state message. It provides no substantive article library yet. Publish useful approved posts or temporarily avoid promoting it as a major destination. Workshop, stockist and client names in route configuration do not imply independent published pages.

## Prioritized findings

| Priority | Finding | Evidence / impact | Required action |
|---|---|---|---|
| P0, fixed locally | Fresh WordPress frontend crashes | `wp_tempnam()` was undefined during stylesheet creation; three inspected routes returned 500 | Added conditional loading of `wp-admin/includes/file.php`. Test a clean install and package the corrected plugin. |
| P1 | Mobile speed is below acceptance level | Static Lighthouse 41 then 47; local WordPress 53. Slow LCP in all three samples | Optimize above-the-fold delivery, CSS and JS; retest logged-out staging on real hosting. |
| P1 | Media replacement does not preserve responsive optimization | `smokers_media()` uses `wp_get_attachment_url()` for replacements; multiple responsive aliases resolve to the same original upload | Generate/use appropriate WordPress image sizes, `srcset`/`sizes`, dimensions and modern formats for replacements. |
| P1 | Text contrast failures | CTA contrast roughly 2.97–3.54:1; contact/blog breadcrumbs 1.63:1 | Darken button backgrounds or use dark foreground text; use stronger breadcrumb colors. Recheck all states/locales. |
| P1 | Keyboard access to a scrollable section | axe reports `#ss-method` as a scroll region without focusable content at mobile width | Prefer content-driven section height; if internal scrolling remains, ensure keyboard access and a clear focus treatment. |
| P1 | WordPress homepage canonical and alternate URLs differ | Local Spanish homepage canonical is `/`, while its Spanish hreflang points to `/es/en-casa/` | Choose the intended public homepage URL and align canonicals, language alternates, internal links and redirects. |
| P1 | Missing WordPress URLs redirect home | `/404.html` and `/audit-missing-page-20261114/` both return 301 to `/`, which then returns 200 | Diagnose local WordPress rewrite/template behavior and require real HTTP 404 responses for unknown URLs on staging. |
| P1, acceptance gap | Full WordPress production workflow not signed off | Original integration suite timed out on its initial admin navigation; historical pass files predate this audit | Finish a repeatable clean-install gate covering all locales, media, dishes, posts, no-JS rendering and intercepted mail, then host-level acceptance. |
| P2 | Mobile content is too small in places | Workshop eyebrow 8px; order/receive/reheat step copy 11px at 390px width | Raise important body copy toward 16px and secondary copy toward 14px; allow sections to grow. These are design targets, not WCAG minimum font-size rules. |
| P2 | Floating animation switch covers footer content | Settled 390px homepage screenshot shows overlap with the back-to-top area | Place the switch within navigation or reserve space around the fixed control and footer actions. |
| P2 | Content management is functional but fragile at scale | Hundreds of hash-keyed text fields, identical phrases shared, fixed eight dish slots | Move toward semantic per-section/per-dish fields, clear previews, revisions, validation and migrations. |
| P2 | Old viewport test is broken | `npm run test:viewport` throws on `getBoundingClientRect()` of a missing element | Update obsolete selectors and assertions; keep the new page matrix as supporting evidence. |
| P2 | Empty blog and inconsistent editorial styling | Empty blog landing; home/support headings use slab display type while professionals relies heavily on Georgia | Populate the blog and document intentional audience styling; standardize shared controls, spacing and body typography. |
| P2 | Generic delivery destination adds friction | Glovo link points to its general Spanish service entry; handover records that this was intentional | Retain if required, but use an approved store destination when available and verify availability messaging. |

## Readability and language

The primary consumer message is concise and clear: the food is already cooked and the customer reheats it. The professional page communicates catalogue, technical sheets and tailored supply. Most paragraphs are short and task-oriented. The contact page has a clear form hierarchy.

Readability problems are mostly visual rather than sentence complexity: small secondary labels, widely spaced all-caps text, low-contrast navigation details, and some long sections relative to the information provided. At mobile size, the homepage is a long scroll; the workshop instructions should not require deciphering 11px text or operating an internal scroll area.

Editorial improvements:

| Current wording / treatment | Suggested direction |
|---|---|
| “Smoked with fine woods” | “Smoked over hardwood” in English, if factually accurate |
| “Cheese stuffed Eggplant” alongside British “flavour” | Choose one English style; e.g. “Cheese-stuffed aubergine” for consistent British English |
| “Hours and hours. And more hours.” | Keep as brand copy, but pair it with the precise process explanation already present |
| “Technical sheets” in consumer contexts | “Product information” or “Ingredients and allergens”; retain trade terminology for professionals |
| “Link to this dish” | “View this dish” or “Dish details” where the action opens a dedicated page |
| “Professional” in navigation | “For professionals” may describe the audience more naturally |

Spanish and Catalan are present across the published routes and metadata, and their translations generally convey the same intent. This audit does not replace native editorial approval. Validate spelling, accents, sentence rhythm and food naming with the business's Spanish/Catalan reviewers.

The page makes specific claims such as “100% gluten-free,” “No additives,” “21 days in the refrigerator,” and “Ready in 15 min.” Obtain product-level business approval and keep claims synchronized with actual labels and dish information. The audit did not independently establish those claims. Blanket claims should not accidentally extend to a new dish with different characteristics.

The WordPress privacy page correctly uses the server-submission explanation supplied in `site/form-copy.json`; the static preview instead describes opening an email draft. This difference is intentional and **is not a WordPress privacy-copy defect**. Legal sufficiency was not assessed.

## WordPress editing: what works and what is missing

This is a custom theme plus the Smokers Content plugin, not an Elementor page-builder site. No Elementor license is needed. The initial HTML is rendered by PHP; React and other scripts enhance the menu and animation afterward.

The generated content inventory exposes **625 Spanish, 624 Catalan and 629 English text fields, plus 49 media fields**. Fields include page copy, many UI labels, image alternative text, search descriptions and business information. The interface provides language, section and search filters; fields are paginated in batches of 40. Uploaded images use the WordPress Media Library. Shared image renditions are grouped under one replacement control.

**Verified during this audit:** saved a homepage description through WordPress in English, Spanish and Catalan; checked each persisted on the frontend; uploaded/replaced the pork-cheek artwork through the Media Library and checked it survived React hydration and carousel navigation. Original copy and media selections were restored afterward. The test upload remains in this disposable local Media Library. Evidence: `output/audit-2026-11-14/wordpress-editing.json`. A fresh manifest integrity check found **5,875 compiled text references with zero missing registered fields**. This establishes coverage of those references, not every possible dynamically generated state.

| Editing need | Current implementation | Assessment |
|---|---|---|
| Existing headings, paragraphs and labels | Smokers → Text & translations | Broad coverage; search-based editing is less intuitive than labeled page sections |
| Photos and background artwork | Smokers → Images & video | Replaceable, but replacement size/crop needs controls and optimization |
| Eight existing dishes per language | Smokers dishes fields | Existing content editable; adding/reordering slots remains developer work |
| Dish description, alt text and SEO description | Custom dish fields | Supported; shared original strings may affect multiple locations |
| Native blog posts | Standard WordPress Posts plus language selector | Scalable editorial route; translation relationships need further integration |
| Delivery/contact links | Smokers → Links | Supported independently from displayed text; editors must keep both aligned |
| Email recipient | Administrator-only setup screen | Supported |
| Section order, new layouts, menu geometry | Theme/React/CSS code | Not editor-controlled |
| Text embedded in artwork | Replace the artwork | Cannot edit its letters using a WordPress text field |
| Icons drawn as inline SVG paths | Theme code | Not ordinary Media Library images |
| Field revisions and concurrent editing | Shared options storage | No per-field native revision workflow; concurrent saves can overwrite shared settings |

**Your requirement is not fully signed off yet.** Existing content has broad editing support, but “all text and images editable” should become an explicit content inventory with acceptance tests for each class of content, including menus, dialogs, form steps, error/success states, header/footer, schema, background images and React-rendered text. A large field count alone is not proof that every state is editable.

Specific maintainability concerns from source review:

- Text IDs are hashes of original wording. Changing source wording can produce a new ID and leave an existing saved override disconnected. Semantic keys and migration handling are needed for reliable upgrades.
- Repeated phrases are intentionally linked within a language. Editors cannot always change one occurrence without changing the others.
- Dish creation is explicitly disabled, and the eight positions are fixed. That is acceptable for the current menu but limits catalogue growth.
- The renderer loads a generated manifest of approximately 1.36 MB. It also tokenizes/hashes the stylesheet on frontend requests and builds broad runtime maps. Cache derived output and scope it to each page where practical; benchmark on normal PHP hosting before attributing a precise speed cost.
- General pages not in the managed manifest fall back to blog page metadata before their body is rendered. Inspect metadata, language alternates and schema for newly created native pages, archives and search results; those routes need explicit template behavior.
- PHP form messages contain fixed English strings, although the browser generally displays localized generic messages. Exposing all editorial messages consistently would better meet the requirement.

## Performance and visual stability

| Mobile lab run | Performance | LCP | Total blocking time | CLS |
|---|---:|---:|---:|---:|
| Static homepage, first | 41/100 | 8.4 s | 1,750 ms | 0 |
| Static homepage, repeat | 47/100 | 8.3 s | 990 ms | 0 |
| Local WordPress homepage | 53/100 | 10.4 s | 180 ms | 0.004 |

These are local lab samples, not production field measurements. Some tests ran alongside other tasks. WordPress Playground adds WebAssembly/runtime and auto-login overhead; Lighthouse warned that the machine CPU was slower than expected. The WordPress result is not a fair estimate of a tuned production host, and the scores should not be compared as evidence that one architecture is faster.

Nevertheless, the repeated static runs and bundle inspection justify a performance workstream. The current frontend smoke suite measured initial transfers of approximately **1.56 MB home, 1.43 MB professionals and 0.46 MB contact**. They pass its 2.5 MB budget, but passing that budget does not demonstrate fast rendering.

The shared stylesheet is about **398 KB uncompressed**, with **111 `!important` declarations**. The menu bundle is about **375 KB** and the professional bundle about **351 KB** uncompressed. Relevant feature bundles are already scoped by page, which is good. Split the large shared CSS further, reduce unnecessary runtime work, prioritize the actual hero image, and defer below-the-fold interactions without hiding meaningful server-rendered content behind a loader.

For WordPress, add responsive Media Library derivatives, page caching with correct invalidation, compressed delivery and sensible versioned asset caching. Avoid caching contact nonces beyond validity; verify a cached page can still submit a form after a long idle period. Benchmark logged-out pages with production hosting and its actual plugins.

The observed CLS values are low, and the static matrix found no document-wide horizontal overflow, unexpected HTTP status or browser exceptions. This is positive evidence for the tested states. It does not prove every animation, font-loading state or edited text length is stable. The matrix's 1px clipped-text candidates were screen-reader live-status elements, not visible copy defects.

Initial full-page captures contained unloaded offscreen lazy images. Scrolled, settled captures confirmed representative images loaded; hidden thumbnail elements with no decoded image are not automatically broken assets. Use the `settled-*.png` files for visual review.

Aim for field LCP ≤2.5 seconds, INP ≤200 ms and CLS ≤0.1 at the 75th percentile. These are the Core Web Vitals goals described by [web.dev](https://web.dev/articles/vitals). Field INP was not measured here; Lighthouse total blocking time is not INP.

## Visual consistency and responsiveness

The orange, cream and dark brown palette, food photography and logo create a coherent brand across pages. The professional page intentionally presents a lighter editorial hero, while consumer pages use heavier display type and a dark photographic hero. Those differences can work if treated as documented variants.

The inconsistency is in details: professional body passages often use Georgia while consumer content mixes Archivo, Arial and display fonts; CTA sizing varies; support-page breadcrumbs are much paler than comparable navigation; and mobile workshop copy is markedly smaller than nearby sections. The shared navigation tests pass, but consistent functionality does not mean identical visual hierarchy.

Normalize body-text sizes, secondary-text contrast, button height/weight, focus appearance and spacing rules. Prefer content-driven height for informational panels. Keep viewport-based sizing for decorative scenes only where long translations and short landscape screens remain usable. Check the WordPress admin toolbar separately from the logged-out customer view.

Use [WCAG 2.2](https://www.w3.org/TR/WCAG22/) and its [reflow guidance](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) as acceptance references. The 320px matrix covers narrow viewport behavior; it does not replace text-resize, keyboard and screen-reader testing. The independent axe failures take precedence over a Lighthouse accessibility score of 100 obtained in a different initial page state.

## SEO

The static generated output has a strong baseline: one H1 per page, unique titles and descriptions for indexable pages, canonical URLs, reciprocal hreflang, parseable JSON-LD, image alt attributes/dimensions and checked internal links. Production exports include 39 sitemap URLs; staging exports intentionally include zero and use noindex. This distinction passed automated checks.

The inspected WordPress pages output canonical URLs on the local WordPress host and language alternates. WordPress has its own sitemap and SEO-plugin behavior; passing the static sitemap test does not certify that integration. The plugin suppresses its own description/social/schema output when Yoast or Rank Math is active, so those plugins must be configured to supply equivalent data.

The complete WordPress route crawl confirmed 39 public routes with HTTP 200, one H1 and a description. It also identified a concrete configuration mismatch: WordPress sets the Spanish page as the front page, making its canonical `/`, but the generated Spanish alternate still uses `/es/en-casa/`. Resolve that canonical/alternate relationship on the intended public-domain setup. Follow-up checks with redirects disabled found both `/404.html` and an arbitrary nonexistent `/audit-missing-page-20261114/` return **301 to the homepage**, rather than 404. This is reproducible in the local WordPress setup; its exact cause and behavior on normal hosting remain to be isolated. Evidence: `wordpress-404.json`. Require real missing-page HTTP 404 responses before launch.

The Lighthouse SEO scores of 69 static and 61 WordPress are affected by deliberate local noindex configuration; the WordPress run also reported a robots.txt issue. Inspect the final public domain's robots response, sitemap, canonical host, redirects and plugin metadata on staging before launch. Do not “fix” local staging by making it indexable.

Content opportunities are useful articles, clear dish information and accurate local business details. Validate legacy redirects against the client's existing URLs and preserve valuable inbound links. Check native posts, new pages and archive metadata separately. No rankings, Search Console indexing or live rich-result eligibility were verified.

## Scalability and production acceptance

Traffic scalability and editorial scalability are separate. Public WordPress pages can benefit from full-page caching/CDN delivery, but this audit has not load-tested hosting. The current content model can handle the current site and native posts; fixed slots, shared options and source-derived keys make a large changing product catalogue harder to maintain.

Recommended sequence:

1. Preserve the fresh-install crash fix and make clean WordPress installation a release gate.
2. Finish the content/media acceptance inventory; add semantic fields, responsive uploaded images, revision/rollback support and useful editor previews.
3. Resolve contrast, nested-scroll keyboard access, tiny copy and the footer-control overlap.
4. Reduce rendering cost and validate mobile speed on logged-out staging with realistic caching and production plugins.
5. Test actual email receipt, failure handling, nonce expiry, backups/restoration, HTTPS, sitemap/robots, redirects and the client's plugin compatibility.
6. Obtain Spanish/Catalan/English editorial approval and product-claim approval; perform real-phone, Safari/Firefox and accessibility checks.

Production approval should require reproducible passing results and a rollback procedure, not only attractive screenshots or a single Lighthouse number. The website is now runnable in local WordPress, but the complete “fast and fully editable” requirement still needs the work above.

## Deliverables

- Audit report: `docs/website-audit-2026-11-14.md`.
- Reusable audit scripts: `scripts/full-audit.cjs`, `scripts/audit-accessibility.cjs`, `scripts/audit-visual.cjs`, `scripts/audit-wordpress.cjs`, `scripts/audit-wordpress-editing.cjs`, `scripts/audit-wordpress-pages.cjs`.
- Evidence: `output/audit-2026-11-14/`, including before/after WordPress inspection, editing results, Lighthouse JSON and responsive screenshots.
- Refreshed installable packages: `output/smokers-theme.zip` and `output/smokers-content.zip`. The content plugin includes the startup fix. Their existence does not constitute launch approval.

Representative visual evidence: `settled-390-at-home.png`, `settled-1440-professionals.png`, `settled-1440-contact.png`, and the other settled page captures in the evidence directory. The complete 480-case records are in `responsive.json`.
