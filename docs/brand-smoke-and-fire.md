# Natural logo smoke and shared flame animation

Updated 26 October 2026.

## Final smoke asset

- Workspace file: `C:/Users/saket/OneDrive/Documents/ChatGPT/Smoker/site/assets/logo-smoke.webp` (384 × 576, variable alpha).
- Master: `C:/Users/saket/.codex/generated_images/01a16e15-4822-7dd1-a3f9-e2a6a6e0fcd7/exec-da129678-191e-4def-9aca-f05da3ded138.png`.
- Created with the built-in image generation tool, then proportionally resized and encoded as WebP. The original has real alpha, ranging from 0 to 248.

Final prompt:

Create a photorealistic VFX texture of a single very delicate wisp of real hardwood smoke, on a genuinely transparent background. Portrait 2:3 composition. A narrow barely visible origin at bottom center opens into irregular, turbulent, airy curls drifting gently up and to the left. Real fluid smoke with fine wispy tendrils and diffuse soft translucent volumes, like a macro photograph of incense or warm wood smoke. Very sparse and elegant, at least 80% transparent negative space, no dense plume, no thick opaque cloud, no symmetrical loops, no drawn lines, no cartoon or vector appearance. Neutral warm charcoal-gray smoke intended to remain visible very subtly against an ivory webpage; use true varying alpha throughout the smoke rather than a flat cutout. Keep the whole plume within the frame with transparent edges. No fire, object, background, surface, text, logo, border or shadow. Output only the realistic smoke with alpha transparency.

## Behavior

The old SVG smoke lines are removed. Two groups of three softly drifting instances of the photographic texture sit above the badge and the SMOKERS wordmark. Their lower edges stop before the orange artwork, and the wordmark smoke position scales with the logo. The same elements and animation timelines survive the intro-to-header relocation.

The preloader still uses the supplied MP4's actual moving symbol, wordmark and flames. A canvas retains these elements and the short bottom caption, removes the circular lettering and orbit dots, and places them over a smooth amber glow. This avoids a visibly cropped circle. B2C uses a warm white intro with a dark caption; professional pages retain the original charcoal intro and light caption.

`site/brand-fire.js` takes the five flames directly from the same MP4 (source crop x=500, y=416, width=200, height=64). It removes the dark background and loops the source interval from 2.05 to 8.05 seconds beneath the header logo in place of “ARTISAN SMOKED FOOD”. Playback starts after the intro and pauses when the brand is covered by the menu panel, scrolled out of view, or the tab is hidden. A static five-flame fallback is shown with reduced motion, JavaScript disabled, or failed video playback.

The desktop hero fills exactly 100svh. Its inner composition uses a width constrained by the viewport height, with container-relative spacing and proportional photography. The entire hero surface, including navigation, image, copy, guide and banner, scales uniformly from 1 to 0.92 using frame-rate-independent easing. The second panel overlaps it with normal document scrolling. There are no independent transforms on the image, copy or guide. Mobile and reduced-motion views keep normal document scrolling.

## Checks

- `npm run test:home`: 27 localized responsive layouts, exact reference geometry, source-video reveal, logo landing and retained natural-smoke timeline, flame readiness, hover continuity, parallax, navigation, motion preferences and video failure recovery.
- `output/qa/check-brand-motion.cjs`: transparent flame pixels change across frames with no opaque rectangular background; no tagline remains; smoke stops above the logo ink; parallax also works at 1920 × 900; mobile flames fit the masthead.
- Visual captures: `output/qa/intro-no-ring.png`, `brand-real-smoke-fire.png`, `parallax-refined.png`, and `brand-fire-mobile.png`.

