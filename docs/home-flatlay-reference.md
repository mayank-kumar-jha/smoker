# Full-background B2C reference — 26 October 2026

The latest reference supersedes the earlier rounded-card hero. The page uses one full photographic background; there is no separate platter cutout or large enclosing card.

- Reference: `C:/Users/saket/AppData/Local/Temp/codex-clipboard-441e03d2-c289-4e9a-a6f5-0ce9d1d46bc3.png`
- Final asset: `C:/Users/saket/OneDrive/Documents/ChatGPT/Smoker/site/assets/home-flatlay.webp`
- Responsive assets: `home-flatlay-960.webp` and `home-flatlay-1672.webp` in the same directory.
- Generated master: `C:/Users/saket/.codex/generated_images/01a16e15-4822-7dd1-a3f9-e2a6a6e0fcd7/exec-21eaad41-0cd3-45c9-89f2-ee7692afedf4.png`
- Image work used the built-in image generation tool in edit mode, followed only by WebP encoding and proportional resizing.

## Final image prompt

undefined

## Implementation

`site/home-hero.js` supplies the translated real HTML interface. `site/home-flatlay.css` maps the desktop composition to the reference's 1672 × 941 coordinate system. The photographic scene retains its natural aspect ratio. Desktop selects the full-resolution image; mobile crops the same scene proportionally, with readable content above and below it.

The right guide's reference bounds are x=1335, y=122, width=288, height=707. The headline begins at x=116, y=269. The old card and transparent platter are absent. The bottom banner continues looping on hover.

The supplied MP4 reveal and separate symbol/wordmark relocation remain intact. Photographic smoke drifts above both the header badge and wordmark; see `docs/brand-smoke-and-fire.md`. The same logo nodes and smoke animations survive the handoff. Reduced motion disables decorative animation and video loading. The desktop hero now fits one viewport exactly. A proportional, centered food scene preserves the image shape. In wider browser windows, the wallpaper extends to the screen edges while the copy, navigation and guide use the available viewport width, avoiding inset background edges and oversized side gutters. The whole first screen scales down as one surface while the second panel overlaps it, with no independent movement of internal elements.

## Verification

`npm run test:home` checks 27 layouts across Spanish, Catalan and English, reference coordinates, natural image ratio, full-resolution source selection, navigation, product dialog, video completion, precise logo landing, continued smoke and marquee on hover, parallax, preferences, keyboard skip and failed-video recovery.

Visual review artifacts: `output/qa/flat-final-desktop.png`, `flat-final-mobile.png`, `flat-final-smoke.png` and `flat-final-parallax.png`.

