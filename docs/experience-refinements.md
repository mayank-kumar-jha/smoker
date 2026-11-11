# Experience refinements — 27 October 2026

- Restored the original five flames from `smokers-intro.mp4` under the home logo, replacing the tagline. Static fallback and reduced-motion behavior remain available.
- Replaced the menu wheel's stars and yellow glow with thin bronze rings, neutral shadows and a quieter dark background. Rotation uses an eased transition. Selected photos decode before crossfading; a version guard prevents stale images after fast selections.
- Rebuilt the professional reverse panel with the supplied background `site/assets/process-reference.webp`. This is the user's image, proportionally encoded to WebP, not a newly generated image. The headline and introductory copy sit beside three numbered rows and four existing cooking/timing facts. Original Spanish, Catalan and English process details are unchanged. Existing product photographs illustrate the rows.
- The phone preview runs separately on the computer's private Wi-Fi address, port 4174, with `npm run dev:lan`. The server accepts private-network clients and retains staging noindex. No firewall settings, public hosting or DNS were changed.

Validation: 54 wheel/process language and viewport combinations, original detail preservation, animation interpolation, rapid selections, dish dialog focus and reduced motion. The 51 home viewport checks and original intro/logo handoff checks also passed.

The preview walkthrough is recorded from the functioning local website, with no external order or enquiry submitted. Its persistent caption says: “PREVIEW RECORDING · The real website has smoother motion and transitions.” Source recording and export utilities are in `scripts/record-walkthrough.cjs` and `scripts/export-walkthrough.py`.
