# B2C scroll and steam choreography — November 2026

The consumer page keeps the company typography and the reversible off-white experiment. No new image generation was needed: three low-opacity, softly blurred instances of the existing transparent smoke asset provide animated steam over the chicken. Each source is mapped through the hero image's actual object-fit crop and image transform, including the mobile crop. A measured exclusion region ends 22px below the live hero copy and CTA; plume heights shrink when space is limited. Smoke pauses offscreen or in a hidden tab and is removed when motion is disabled.

`site/b2c-scroll.js` runs one eased requestAnimationFrame clock only while scroll position is settling. Passive scroll listeners never intercept scrolling. Section positions update on resize, font readiness, image loading and content resizing. Listeners, observers, icon timers and pending frames are disposed on route or motion-preference changes.

- Hero: shallow image depth and mapped animated steam.
- Menu: seven visible cards begin as a central deck, then spread into their existing fan positions. A fixed trigger opens the fan when the stage crosses 65% of viewport height. The 850ms CSS transition runs independently of further scrolling. It stacks again only when the stage moves back below 90% of the viewport, providing a dead band that prevents jitter and repeated triggers. Keyboard and carousel selection still work. Reduced motion and no-JavaScript rendering show the complete fan.
- Workshop: floating food photo with staggered process steps; retains half-screen height.
- Ordering: staggered lateral card entry and different vertical drift rates.
- Reheating: photo depth and a gentle cascade across the instructions.
- FAQ: photo depth and a small lateral response on the answers.
- Footer: a quiet upward settle.

Headlines retain Bevan, labels Barlow Condensed and body/card titles Archivo. Shared heading leading, eyebrow rhythm and paragraph spacing are scoped to B2C. Delivery titles and numbered badges now use the brand fonts as well. Existing colours, content, preload sequence, icons' five-second cycles and the saved brown theme remain available.

Fixed-trigger regression: `node tests/menu-scroll-trigger.cjs` checks expansion, repeated scroll crossings without retriggering, upward reset and reduced motion. Validation: `node tests/b2c-choreography.cjs` passed 21 viewport/language combinations (English, Spanish and Catalan), hero text exclusion, horizontal overflow, deck expansion and reversal, carousel controls, keyboard operation, reduced motion and browser error checks. A separate panel check verified reversible computed transforms in workshop, delivery, reheating, FAQ and footer, plus animation-toggle reset. Desktop/mobile screenshots and JSON results are in `output/qa/`. Staging and portable outputs rebuilt; smoke is embedded in portable assets as well.

## Fixed entrance update and final hero refinements

All main B2C panels now use binary entrance states: enter when the top crosses 78% of the viewport and the panel intersects the active viewing area; reset only outside the larger 108% / -25% boundary. CSS completes each transition independently of scroll position. The menu keeps its own 65% / 90% trigger. Glovo and Uber Eats cards slide up to 420px from the right with staggered timing; the workshop, reheating, FAQ and footer have distinct entrances. The hero copy remains stationary at the user's request.

Mouse-wheel steps are eased over a short decay. Precision trackpads, touch, nested scroll containers, zoom gestures, dialogs and keyboard controls keep native handling. Wheel frames cancel on direct input, visibility change or cleanup. Reduced motion disables entrances, smoothing and animated smoke.

The hero CTA now uses the reference's solid orange pill. The old photographic steam is removed from a non-destructive sibling asset: `site/assets/b2c-kitchen-clean-steam.webp`. Built-in imagegen prompt: "Precise minimal edit of the provided restaurant hero photograph. REMOVE the visible stationary smoke / steam plume above and to the left of the roasted chicken. Reconstruct the underlying softly out of focus dark kitchen in this small smoky region, so there is effectively no visible smoke in the photograph. All else MUST remain identical: exact chicken shape, its position and size, food details and herbs, board, physical Smokers branded paper bag, small spice bowl, tall rocket-shaped smoker on the right, copper pots, light, colors, image composition and aspect ratio. Do not redesign, reframe, zoom, add or remove any other object. No UI or text overlays. This will be used underneath real animated steam, so no baked-in vapor is needed."

Moving steam has stronger opacity, portrait proportions and a 60px fade below the copy's safe boundary. Individual plume containers no longer clip their contents. A faint stationary smoke bed (13% opacity) anchors the motion near the food; it uses the same feathered masks and does not animate. Original hero backgrounds remain available.

The reheating chapter is 20% shorter on desktop: 80svh with proportional photo/gap reductions, preserving all instructions. Verified actual heights 864, 720, 576 and 480px on 1080, 900, 720 and 600px viewports, without content overflow. Mobile retains its content-based layout.

`tests/b2c-fixed-entrances.cjs` passes fixed triggers on all panels, no repeated triggering near the boundary, stationary hero copy, CTA styling, smooth mouse wheel, native nested scrolling and reduced motion. The 21-language/viewport choreography suite also passes. Final steam masks and static-film styles were inspected alongside desktop and mobile screenshots.
