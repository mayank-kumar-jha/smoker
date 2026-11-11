# B2C menu image refinement

The eight menu assets use versioned `site/assets/orbit-v2-*.png` files derived
from their existing dish references. Originals are preserved. The shared imagegen
brief keeps the existing food/portion arrangement and strict overhead view,
improves natural food detail and ceramic-rim depth, and uses restrained upper-left
light and gentle contact shading. No extra ingredients, steam, dramatic grading,
plastic gloss or luxury styling were requested. Eggplant additionally uses the
new pork-cheek plate as a framing/ceramic reference to remove its old gold rim
and outer halo. These are AI-refined representations, not new product photographs.

The menu retains a modest contact shadow. Main image decoding is asynchronous.

The horizontal entrance formerly used GSAP `x` plus `clearProps: transform` on
elements that already had CSS individual `translate` for the 15px layout offset.
GSAP absorbed that offset and restored it when clearing, producing a snap.
Entrance displacement now uses `--dsh-enter-x/y` independently; the fixed layout
translate and arrow-controlled orbit remain separate. No transform-clearing step
changes the final plate position.

Validation: `node tests/menu-entrance.cjs`, `node tests/orbit-menu.cjs`,
`npx tsc --noEmit`, and visual review of the menu on desktop and mobile.
