# Smokers WordPress: staging and deployment plan

## 1. Protect and inspect the existing site

- Rotate the previously shared WordPress password and enable two-factor authentication where available. Use a separate administrator account for deployment.
- Inventory current pages, posts, media, URLs, plugins, translations, forms, analytics, DNS and email services. Record which content must be retained and map old URLs to the new equivalents.
- Take a fresh backup of both the WordPress database and all files, including uploads. Confirm the backup can be restored. Agree a launch window and rollback owner.

## 2. Set up staging

- In Hostinger hPanel, use Websites → Manage site → WordPress → Staging if the hosting plan supports it. Otherwise create an isolated subdomain, database and copy of the site. Protect staging from public access and search indexing.
- Record the WordPress and PHP versions, available resources, upload limits and existing caching and SEO plugins. The project requires WordPress 6.6+ and PHP 8.1+; check compatibility with the existing plugins.
- Hostinger's staging publish replaces the live files and database. Coordinate a content freeze or a tested migration of changes made after the staging copy, including posts and form data.

## 3. Prepare the release

- Review the current working tree and rebuild the WordPress theme and content plugin from the approved source (`npm run build:wordpress`, then `npm run package`). Packages prepared on 21 November 2026 are for staging evaluation; rebuild them if the source changes before staging or launch.
- Upload the content plugin and theme to staging. Activate the plugin first and the theme second. In Smokers → Email & setup, configure the recipient and create missing pages. Resolve existing slug conflicts without overwriting unrelated content.
- Choose the approved home page and permalink structure. Preserve existing posts and media; verify native blog language assignments. Configure authenticated email delivery and confirm messages arrive in the real inbox.

## 4. Performance acceptance on staging

- Measure B2C home and dish pages, B2B, contact and blog in all languages. Use logged-out mobile and desktop sessions, with cold and warm cache. Record TTFB, LCP, blocking time, page weight and largest requests, and compare before and after each change.
- Diagnose server response time separately from image downloads and browser rendering. Prioritize the hero image, resize replacement media, load below-the-fold images lazily, reduce unused CSS and defer noncritical animation work where measurements justify it.
- Configure a single compatible page-cache plugin, compression and browser caching. Evaluate Hostinger CDN and object caching only if supported and useful for the measured workload. Confirm cache invalidation after text and media edits, and test all languages independently.
- The Smokers plugin also caches rendered templates and runtime data for one hour using a content/build/media revision. Exercise both a text edit and an edit to an existing Media Library attachment after warming the page, checking the HTML, hydrated content and any affected background images. Verify the host's page cache is purged independently; the plugin's internal revision does not purge an external cache. Check that `wp-content/uploads/smokers` is writable for generated CSS and that old generated CSS files are managed safely.
- Test contact and catalogue submissions after a page has been cached and left idle. Verify nonce refresh, error handling, spam controls and email receipt. Avoid caching private or personalized responses.
- Use Core Web Vitals field goals of LCP ≤ 2.5 seconds, INP ≤ 200 ms and CLS ≤ 0.1 at the 75th percentile as targets; staging lab results are diagnostic and do not guarantee field performance.

## 5. Functional and SEO checks

- Check mobile and desktop layouts, navigation, motion controls, menu, ordering links, form flows and blog in Spanish, Catalan and English. Save and reload representative text, images and dishes through WordPress admin.
- Check HTTPS, canonical URLs, hreflang, titles, descriptions, social tags, schema, sitemap and robots. Resolve the previously observed Spanish homepage canonical/alternate mismatch and verify nonexistent URLs return HTTP 404 on this host.
- Test existing SEO, security and multilingual plugins with the custom theme. When Yoast or Rank Math is active, ensure it supplies the metadata suppressed by the Smokers plugin. Confirm redirects preserve important existing URLs.
- Confirm legal text, contact details, allergens, business information and content with the site owner. Test keyboard use, readable contrast and responsive layouts.

## 6. Launch and rollback

- Obtain approval for the tested staging version, take a final live backup, freeze content, and deploy using the agreed method. Publishing staging can overwrite newer live data; reconcile it first. Do not change DNS or mail records unless the migration requires it and they have been documented.
- Purge all active cache layers, remove staging-only search restrictions from the live site, and check public pages, forms, email, redirects, sitemap, HTTPS and admin editing. Monitor errors, delivery and speed after launch.
- If a serious issue occurs, restore the matching files and database backup using the documented Hostinger procedure, then verify the restored website and any data created after the backup.

References: [Hostinger staging](https://www.hostinger.com/support/5720286-how-to-create-a-wordpress-staging-environment-in-hostinger/), [Hostinger backups](https://www.hostinger.com/tutorials/backup-wordpress/), [Hostinger cache](https://www.hostinger.com/support/6215624-how-to-use-cache-manager-at-hostinger/), [Core Web Vitals](https://web.dev/articles/vitals).
