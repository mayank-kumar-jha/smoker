# B2B second screen

The signature chicken section follows the professional hero and precedes the
existing catalogue. It is server-rendered in Spanish, Catalan and English, then
hydrated as a React island. Desktop uses one viewport; phones stack the two dishes.

`pro-chicken-showcase.tsx` coordinates the motion on one scrubbed ScrollTrigger.
Text uses a subtle opacity fade and a 12px upward drift, staggered between the
kicker, heading and description. No block overlays or text splitting are used. On desktop, a 240svh track holds the panel
sticky while scroll progress rolls plates in from opposite sides (155 degrees),
gently fades text into place, and moves the background at a different rate.
Scrolling back reverses the sequence. On small/short screens, the same timeline
runs in the normal document flow without sticking a tall panel. Reduced motion
and the animation toggle restore static content. Resize rebuilds the animation
rather than permanently disabling it.


The existing project already provides React, TypeScript, Tailwind and
`components/ui`; no shadcn project migration is needed. `@gsap/react` is added.
No `cn` helper is needed because the component has no conditional class merging.

Three imagegen assets are stored in `site/assets/pro-chicken-*.png`. The attached
two-chicken composition was the source reference. Background prompt: remove all
plates, text and icons; retain espresso tabletop, rosemary corners, peppercorns,
brown linen and smoke. Each plate prompt: isolate the respective reference plate
on transparency, preserving the arrangement, ceramic rim, seasoning, oil and warm
light. These are AI-derived reference assets, not guaranteed pixel-exact crops.
Original existing food assets remain preserved.

Build: `npm run build:site`. Type check: `npx tsc --noEmit`.
QA: `node tests/pro-showcase.cjs` (local server on 4173). Checks three locales,
five widths, loaded images, bounds, motion toggle, resize, static HTML and errors.
Screenshots: `output/qa/pro-showcase-*.png`.


The waiting state shows the original Smokers logo and a localized tagline. The
same scroll timeline fades this branding out before the plate composition settles;
static/reduced-motion layouts omit the overlay. Intro handoffs reserve the
scrollbar gutter, wait for fonts/hero assets, and keep the B2C logo in its header
slot throughout docking. `node tests/intro-handoff.cjs` samples natural desktop
and mobile handoffs to check stable header width and final logo coordinates.


## Professional method and later chapters

The head-loaded preloader sets an early visibility gate before the first body
paint; it releases only after the actual overlay is appended (with a recovery
timeout). The process view uses the existing fork as a stationary sibling of the
front/back content. Text slides away, while process copy, four rows, drawn SVG
arc/icons enter. The header is untouched. Mobile uses an internally scrolling
process layout. The eyebrow and bottom timing row are removed. Get the catalogue
links to the catalogue form; Let’s talk links to the localized contact page.
Typography follows the brand guide: Bevan headings, Archivo body and step titles,
and Barlow Condensed actions.

The waiting brand has a subtle breathing/underline animation. The catalogue and
FAQ use separate fixed-point entrances at top 78% of the viewport, with staggered
layers. Motion preferences and focused form controls remain supported.
Validation: `node tests/pro-method.cjs` (first paint, stationary geometry, content,
controls, chapter entrances, localized responsive layouts).
