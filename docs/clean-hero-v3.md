# Clean B2C hero revision

Generated using the built-in image_gen tool. Selected project asset: `site/assets/b2c-kitchen-clean-v3.png` (1672 × 941).

Prompt: Recreate the reference as a clean professional photorealistic food website background photograph in a landscape 16:9 composition. Maintain the warm charcoal-brown artisan kitchen, realistically roasted whole chicken on a wooden board, understated orange lighting, herbs and grilled lemon. Keep the upper 52% calm dark wall for HTML text. Keep the whole chicken in the lower center, the complete board visible, and the lowest 8% simple counter. Restrain peripheral props: smoker, kraft takeaway bag, foliage and cloth. The bag's circled S and SMOKERS wordmark must share its natural background defocus, with no pasted-on sharp text. Natural food texture, no plastic gloss, HDR halos, navigation, headings or buttons.

Refinement prompt: Preserve the complete composition and dimensions. Only defocus the entire kraft bag, including its printed circled S and SMOKERS branding, with the same optical blur as the smoker beside it. Keep the dark branding visibly present, but remove crisp letter and circle edges; approximately 4 pixels of lens blur at the image's native size. Do not sharpen the bag.

The SVG lettering persists after completion, with font-size/baseline coordinates measured from the original heading. The accessible HTML fallback stays in the document; reduced motion displays it directly. ResizeObserver updates only the SVG coordinate system when the heading changes size.

Validation: TypeScript and static build; tests/clean-hero.cjs checks identical SVG geometry across completion, visible final lettering, reduced motion, and responsive hero bounds at seven viewport sizes. Screenshots in output/qa/clean-hero-*.

## Panoramic v4 follow-up

Built-in image_gen outpaint selected asset: `site/assets/b2c-kitchen-panoramic-v4.png`.

Prompt: Outpaint the exact kitchen photograph horizontally into a 2.5:1 panorama. Preserve its full height and central chicken/board composition; extend left and right with continuous warm dark kitchen wall and stone countertop. No side bars, solid padding, simulated gradients or frames. Keep the defocused smoker and SMOKERS bag, subtle foliage/window light at left, matching light, grain and perspective. No added text or UI.

Wide screens select the panorama via picture/source; all images use cover, with no side mask or contain rule. Letter masks now span the whole word horizontally so italic glyph overhangs cannot be clipped. Masks remain in place at completion. `tests/hero-fill-panorama.cjs` compares completed masked/unmasked letter screenshots pixel-for-pixel and verifies responsive image selection.

## Warm kitchen v5

Built-in image_gen asset: `site/assets/b2c-kitchen-warm-v5.png`.
Prompt: Recreate the supplied warm kitchen reference as a background-only photograph, removing navigation, heading, central logo, button and bottom benefit graphics. Reconstruct the wall/counter behind them. Preserve wood slats, shelves and amber lights, plants, sun rays, kitchen props, smoker and naturally defocused branded kraft bag, roast chicken, board, lemon, herbs and cloth. Keep the central upper area dark for HTML. Landscape 16:9.

Image size now depends on viewport width only. Desktop hero minimum height is 50vw to prevent foreground/copy overlap in short windows. Mobile image width is 180% of its container, also independent of height. Height changes crop/reveal the fixed-scale scene. `tests/hero-background-scale.cjs` verifies unchanged image dimensions at three heights for desktop and mobile.

Loader correction: clearing data-ss-loading previously reversed the internal stage/background fade while the parent overlay was still fading out. The terminal state now hides the overlay immediately and keeps its children transparent. The intro-handoff test samples both opacity layers every animation frame and rejects any rebound after docking begins.

## Chicken placement and steam v6

Built-in image_gen asset: `site/assets/b2c-kitchen-warm-v6.png`.
Prompt: Make a minimal edit of warm-v5, preserving the kitchen, shelves, plants, light, counter props, smoker, defocused bag, cloth and camera. Resize only the foreground chicken, board, lemon, herbs and spice bowl to 85%, keep horizontally centered and move down 25 pixels. Reconstruct exposed tabletop. Keep full board inside frame and remove baked-in steam immediately above chicken for live steam overlays. Same realistic materials, no redesign.

Restored the two live steam layers with source-image shoulder coordinates (.43,.73) and (.56,.69). Reduced-motion and animation-off preferences still hide steam. Desktop minimum hero height adjusted from 50vw to 46vw so the benefits row fits at 1900x915. tests/hero-steam-v6.cjs verifies moving, visible steam, benefits bounds and no horizontal overflow at five desktop/mobile dimensions, plus reduced motion.

## Two-plane parallax v7

Built-in image_gen assets: `site/assets/b2c-kitchen-layer-v7.png` and transparent `site/assets/b2c-table-layer-v7.png`.
Foreground prompt: Extract the entire front tabletop, chicken, board, lemon, herbs, bowl and cloth with contact shadows on true transparency. Preserve source canvas framing and positions; remove the rear kitchen and background, with no halos or steam.
Background prompt: Preserve the source kitchen wall, shelves, plants, lighting, rear counter props, smoker and defocused bag. Remove foreground table, chicken and cloth, reconstructing the concealed lower background as dark wooden cabinetry.

The existing animation-frame scroll loop moves the kitchen +0.20px and foreground -0.34px per scrolled pixel, with at most 10% perspective enlargement. Steam shares the foreground transform and maps to its local image coordinates. A shaded underside continues beneath the moving foreground. The CTA is reduced to approximately 42–44px high with tighter padding. Reduced motion disables parallax. tests/hero-layers-v7.cjs verifies relative travel, reverse-to-origin, CTA dimensions, and reduced motion on desktop/mobile.
