# Smokers performance and compatibility audit — 20 November 2026

## Follow-up — 21 November 2026

- An isolated native PHP 8.3/SQLite WordPress preview was set up on `localhost:9405`. Its initial requests timed out at PHP's 30-second execution limit, and a cron request queued behind the single-threaded development server. Those requests used the default WordPress theme and are not Smokers timings. The Smokers theme and plugin were subsequently activated and pages created in the separate native database; local WP-Cron was disabled for this diagnostic. Another request timed out in WordPress core after the preview had been idle and rebuilt, so the warm timings below do not describe its cold-start reliability. The existing Playground data was not modified.
- Five interleaved requests per mode to each English page, after initialization, produced these median document times to first byte. The uncached mode explicitly deleted the two Smokers transients before each request and therefore includes deletion overhead; warm mode reused them. This is a small local lab sample, not a Hostinger or full-page-cache benchmark.

  | Native preview | Smokers transients cleared | Smokers transients warm |
  | --- | ---: | ---: |
  | At Home | 653 ms | 537 ms |
  | Professionals | 595 ms | 581 ms |

- The earlier 7.02-second Playground document response and native results use different runtimes and conditions; they cannot establish the effect of the code changes or predict Hostinger performance. Browser LCP and field INP have not been newly measured in this comparison.
- With the native page caches warm, changing a Smokers text option appeared in the next server response and runtime data. Replacing the hero image and then updating the same attachment's file and dimensions updated the response; changing the attachment also changed the generated CSS filename. The test used WordPress APIs in the isolated native database, then restored its settings. Hostinger's separate page-cache layer still needs its own edit, media and purge checks.
- Generated CSS now includes the attachment revision in its filename; the build fingerprint includes the PHP and JavaScript that produce cached data. Old generated files may accumulate in uploads after edits and need a future safe cleanup policy.
- The shorter professional preloader's logo, caption and exit animations were retimed to fit the shortened display. The logo and caption remain visible from the first animation frame, even if the browser is busy. A focused Chromium check on the native preview observed the B2C intro release, completed hero lettering and active steam, the B2B intro and hero entrance, and the reduced-motion fallbacks. The professional preloader was also visually inspected with its dismissal temporarily delayed for the screenshot. This is not a visual sign-off across all devices.
- A fresh disposable Playground integration run passed its editing, gallery, media replacement/reset, blog, 404, intercepted-mail, nonce, failure-handling, repeat-setup, responsive and browser-error checks. The three-part professional scroll, swipe and navbar suite also passed against the rebuilt static output before the final preloader visibility adjustment. After that adjustment the production frontend smoke suite passed 72 page/viewport checks, scoped bundle, transfer and motion checks. Real email delivery remains untested.

## Changes made

- The B2C homepage has a four-image gallery immediately after the ordering panel. It uses existing dish photography, responsive image variants, lazy loading, translated headings and captions, and a reduced-motion-aware hover effect. The existing WordPress text and media fields remain the source of the images and copy.
- The menu and professional showcase JavaScript bundles load when their sections enter the viewport. A first tap on a control before loading completes is replayed after initialization. Bundles use the app's WordPress version query to prevent stale cached scripts.
- WordPress no longer reads the full page template on a rendered-HTML cache hit. The existing transient and content invalidation mechanism remain in place.
- On narrow screens the ordering and workshop panels grow to fit their content instead of forcing viewport-based minimum heights. In one 390 × 844 check the ordering panel decreased from 844 to 746 CSS pixels.
- The new gallery label was darkened after an automated contrast check. The existing white-on-orange CTA colors were preserved as requested.
- Earlier speed work reduced the shared logo from 180,519 to 61,659 bytes and added lazy loading to menu imagery. The original logo is retained in `site/assets/smokers-loader-logo-original.png`.

## Performance measurements

Mobile Lighthouse lab samples on this laptop, with the local static preview and simulated mobile throttling:

| Measurement | Before | After |
| --- | ---: | ---: |
| Performance score | 47 | 51 |
| LCP | 7.60 s | 5.04 s |
| FCP | 2.38 s | 2.30 s |
| Total blocking time | 996 ms | 1,591 ms |
| CLS | 0 | 0 |

These are individual lab runs and do not establish a reliable speed improvement: machine load varied, total blocking time worsened, and the final accessibility color and click-handling adjustments were made afterward. Reports: `tmp/perf-before.json` and `tmp/perf-after-final.json`.

The local WordPress final sample returned score 55, LCP 6.70 s, total blocking time 259 ms, CLS 0.0035, and a 4.45 s document response. Report: `tmp/perf-wordpress-final.json`. This sample preceded the final click-handling and gallery-label adjustments. A historical WordPress Lighthouse run measured LCP 10.42 s, but was recorded on a different day and is not a controlled comparison. WordPress Playground uses WebAssembly and its timing cannot predict Hostinger performance. INP requires real user interaction data and has not been measured.

After the user reported a 13-second At Home → Professionals navigation, a local desktop reproduction took 8.33 seconds; the document response began after 7.02 seconds. A separate temporary diagnostic measured 4.44 seconds within WordPress startup before template rendering on a 5.25-second time-to-first-byte request. An authenticated browser prefetch experiment did not help: WordPress sent `no-store` and the subsequent navigation still took 7.74 seconds. These are single local measurements, not production benchmarks. The temporary diagnostic was removed. The local loading-speed goal is not met.

The Lighthouse WordPress audit identified roughly 256 KiB of unused CSS and slow local document response. The CSS and frontend rendering costs remain work items. In a focused WordPress browser check, the menu bundle was absent before scrolling and requested after the menu became visible. Actual field performance and server/database/plugin costs on Hostinger remain unmeasured.

## Checks and results

- Chrome mobile and desktop gallery screenshots were visually reviewed. The four images loaded and the gallery appeared directly after the order section.
- Chrome and Edge checks at 390 × 844 covered the English B2C home, B2B, contact, blog and one dish page: each returned HTTP 200 without document-wide horizontal overflow or recorded page errors. Both browsers use Chromium; this is not independent Safari or Firefox coverage.
- Chrome responsive suite: 60 route/viewport checks across 320 × 568 through 2560 × 1440, covering the three B2C and three B2B language routes. No horizontal overflow or clipped workshop content was found in those checks.
- Static SEO checks passed for 40 generated pages, including internal links, assets, metadata, schema and reciprocal language links. A local WordPress crawl found 39 public routes with HTTP 200 and one H1, and a gallery on the three B2C homepages. Evidence: `tmp/wordpress-routes-audit.json`.
- The fresh-install WordPress integration suite passed text editing and escaping, no-JavaScript rendered text, edited dish content after hydration/swiping, Media Library replacement/reset, gallery position in three languages, native blog navigation, HTTP 404 behavior, form submission with intercepted mail, invalid nonce rejection, mail failure handling, repeat setup, responsive layouts and browser-error checks. The first run failed on blog navigation because local startup updated the permalink option without updating the in-memory rewrite configuration; startup now uses the WordPress rewrite API. A temporary published post was also checked after refreshing permalinks and then deleted. Evidence: `output/phase1/wordpress-tests.json`.
- The professional scroll animation passed focused phone and desktop checks after its test was updated for deferred initialization. A full animation run then failed once on a mobile tab selection; the swipe/tap test passed on a subsequent separate run at 320, 390 and 430 pixels across all three locales. Shared navbar checks also passed at 320, 390, 768 and 1440 pixels across the three locales. The intermittent tab failure needs investigation rather than being treated as a clean full-suite pass.
- Automated axe checks on English home, B2B, contact and blog at 390 and 1440 pixels reported no violations on B2B, contact or blog. The homepage retains two color-contrast failures for the white text on orange CTAs. The initial scan also flagged the gallery label; that label was corrected and the focused mobile contrast check then reported only the two CTA failures. Automated checks are not a substitute for keyboard, screen-reader or full contrast review.
- TypeScript check and the final frontend smoke run passed: 72 page/viewport checks plus menu navigation and motion preference checks. The final measured initial resource transfers were about 1.31 MB for B2C, 1.18 MB for B2B and 0.33 MB for contact in that test.

## Remaining release blockers and limitations

1. Verify the corrected permalink setup on Hostinger staging, including native posts and HTTP 404 responses. The first local integration run failed before the local startup correction; the fresh-install rerun passed.
2. Fix the two white-on-orange CTA contrast failures while preserving the requested white text and agreeing an accessible brand color. Verify hover and focus states as well.
3. Improve the slow document response and large shared CSS; profile a production-like PHP/MySQL installation and the real plugin stack. Configure and verify Hostinger page caching, invalidation and form nonce refresh on staging. Do not interpret the Playground result as a Hostinger benchmark.
4. Test real form email delivery, plugin compatibility, native posts, 404 behavior, redirects, robots, sitemaps and backups on staging. Local form tests intercepted mail and do not establish external delivery.
5. Firefox, Safari, macOS, Android and iOS were not available for native testing on this Windows laptop. Test actual devices and browsers, zoom, keyboard navigation and screen readers. The sampled automated checks do not cover every interaction or viewport.
6. The 21 November theme and plugin ZIPs are prepared for staging evaluation, not launch approval. Rebuild and verify them again if the source changes before staging or launch.

The deployment sequence and rollback procedure are in `docs/hostinger-launch-plan.md`. Do not deploy until the blockers and hosting acceptance checks are resolved.
