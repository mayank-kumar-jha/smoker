# Smokers: phase 1 handover

Phase 1 converts and tests the code locally. It does not change the client's domain, hosting account, existing pages, email service or live homepage.

## Deliverables

- `output/smokers-theme.zip`: installable custom WordPress theme.
- `output/smokers-content.zip`: installable content, media, dish and contact plugin.
- `output/smokers-source.zip`: editable source, build scripts, tests, theme and plugin.
- `output/smokers-production.zip`: separate static export; **do not use this as the WordPress theme**.
- `output/phase1/`: current test results and visual checks.

The theme preserves the existing layout and GSAP/React animations. No Elementor or paid field plugin is required. WordPress renders the initial content on the server; JavaScript enhances it afterward.

## Editing content

Open **Smokers** in the WordPress dashboard:

1. **Text & translations**: select Spanish, Catalan or English, then filter by section or search for the existing phrase. Edit and save. Repeated phrases are shared within a language. Fields are plain text, not arbitrary HTML.
2. **Images & video**: choose an item from the Media Library or upload a replacement. One field controls all responsive sizes of the same image. Restore original removes the override. Plate artwork should keep a transparent background and a similar crop; large replacements should be optimized before upload.
3. **Links**: edit delivery destinations and other external/contact links. Glovo intentionally remains linked to its homepage, as requested. Uber Eats points to the Smokers Badalona store.
4. **Email & setup**: administrators set the recipient and create missing Smokers pages. This never overwrites unrelated existing pages or changes Settings → Reading.
5. **Smokers dishes**: edit the eight existing menu positions in each language: title lines, description, thumbnail label, ingredient note, alternative text, search description and featured image. Dish positions are fixed to protect the animation layout; changing the number of dishes is a developer task.
6. **Posts**: write normal WordPress blog articles, upload featured images and select the article language. The three blog pages show published posts in the selected language.

The website contains 24 dedicated flavour pages: eight dishes × three languages. Each has one dish, branded explanatory content, related-flavour links, a canonical URL, language alternates and MenuItem structured data. Menu swipes do not change the homepage URL; the dish link opens its separate page.

Text baked into a raster image is part of that image: replace the artwork to change it. Decorative icons and layout geometry remain theme code. Longer headings and differently cropped photos should be previewed at mobile and desktop sizes after editing.

## Phase 2: install on staging

1. Back up the current WordPress database and files. Create a staging copy using the client's host.
2. Confirm PHP 8.1+ and WordPress 6.6+; local validation uses PHP 8.3. Check the host's upload-size limits against the ZIP files.
3. Under Plugins → Add New → Upload, install and activate `smokers-content.zip`.
4. Under Appearance → Themes → Add New → Upload, install `smokers-theme.zip`. Activate it on staging.
5. Open Smokers → Email & setup. Set the recipient, select **Create missing Smokers pages**, and save. Existing non-Smokers slug conflicts are reported instead of overwritten; resolve them deliberately on staging.
6. Under Settings → Permalinks, use the site's approved readable permalink structure and save to refresh rewrite rules. Under Settings → Reading, choose the Smokers homepage when ready. Keep staging excluded from search engines.
7. Test saving text and replacing images in all three languages. Confirm changes remain after reloading and swiping. Add a sample blog post and verify its language listing.
8. Configure authenticated mail delivery with the client's host/provider. Test actual inbox receipt, sender authentication and failure handling. Local automated tests intercept mail; they do not prove delivery through the client's service.
9. Test caching, security, SEO and multilingual plugins already installed by the client. The theme avoids adding its own description/social/structured metadata when Yoast or Rank Math is active; configure those plugins and confirm their output. Existing third-party multilingual integration still needs staging verification.
10. Confirm old URLs and redirects against the client's live sitemap, business contact details, allergens/ingredients, portion information and content approval. No prices, reviews or availability promises have been fabricated.
11. Review the staging site on real phones and desktop browsers. Back up the accepted staging state before phase 3.

The plugin stores content in WordPress options/post metadata and media references as attachment IDs. Uninstalling/deactivating it does not delete client content. Back up the database and uploads together. Defaults use stable, generated content identifiers; future source-copy changes should include a content-key migration rather than silently replacing saved values.

## Build and verification

```text
npm ci
npm run typecheck
npm run build:wordpress
npm run build:site
npm run dev
```

With the static preview running, use:

```text
npm run test:seo
npm run test:site
npm run test:flavours
npm run test:animations
npm run test:wordpress
npm run package
```

`test:wordpress` starts a local WordPress Playground, tests admin text/media changes, native blog output and contact submission, and leaves the local server available after success. It intercepts mail inside this test installation. It does not access the client's website. For a preview without mail interception, run `npm run dev:wordpress`.

The test installation is temporary. To reuse an existing local WordPress directory, set `SMOKERS_WP_ROOT` before starting it. Do not use the local auto-login/test setup as a public hosting server.

`npm run build:portable` is an optional large standalone demo. It is separate from release builds. Older visual experiments remain in Git history; their tests are not release gates. Current release gates are the scripts above and `.github/workflows/check.yml`.

## Improvements made

- Added a versioned baseline and a dedicated implementation branch.
- Removed the retired fan menu renderer/handlers, unused React helpers and unimported stylesheets; removed 395 obsolete CSS selectors.
- Converted the existing plate artwork to optimized transparent WebP and generated small thumbnail assets; originals remain in source.
- Loaded the menu and professional React bundles only on relevant pages.
- Connected the motion switch to the menu and animated hero text.
- Corrected six obsolete redirect destinations and made blog metadata language-specific.
- Added editable WordPress content/media, safe setup, native posts and server-side contact delivery with validation, nonce checks, a honeypot and rate limiting.
- Corrected source packaging to include React/TypeScript and WordPress files. Portable demo payloads are excluded.
- Made the preview server tolerate transient missing files during rebuilds.

Hosting configuration, real email receipt, existing-site migration, production caching and the final domain switch remain phase 2/3 work.
