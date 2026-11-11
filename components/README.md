# Menu orbit component

The menu is a React island within the existing static site. Its source lives in
`components/ui/dish-orbit-carousel.tsx`; the supplied layout is retained, with the
current peach/brown/orange menu palette in `site/orbit-menu.css`.

`components/ui/menu-dishes.ts` contains eight supplied dish PNGs matched to the
existing Smokers catalogue descriptions. The badge shows a dish number instead
of a fabricated rating; the details panel uses Smokers branding. Ingredient
information links visitors to the delivery menus rather than guessing a recipe.

Images and the supplied Outfit font are local `site/assets/orbit-*` assets.
Outfit attribution supplied with the component: (c) 2021 The Outfit Project
Authors, SIL Open Font License 1.1, variable weights 100–900, Basic Latin subset.

Navigation uses visible previous/next controls and keyboard arrows. There is no
autoplay, scroll snapping, scroll looping or scroll-linked dish selection.
At the fixed scroll point (section top at 72% of the viewport), the plate fades in from 28px left, text from 18px below, and the details card from 28px right. This runs once; scrolling does not scrub or replay the entrance. Reduced-motion
preferences disable the entrance and dish-swap animation.

The Order now buttons scroll to the existing delivery section.

Build: `npm run build:site` (includes React client bundling and static rendering).
Type check: `npx tsc --noEmit`.
Interaction and responsive QA: `node tests/orbit-menu.cjs` with the local server running.
