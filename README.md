# Smokers

Custom multilingual frontend and WordPress theme/content plugin. The existing design and GSAP animations are shared by both builds.

## WordPress handover

Read [the phase 1 handover and installation guide](docs/wordpress-phase1.md).

- Theme source: `wordpress/smokers-theme/`
- Content plugin: `wordpress/smokers-content/`
- Built ZIPs: `output/smokers-theme.zip` and `output/smokers-content.zip`
- Static preview: `npm run dev` → http://127.0.0.1:4173/en/at-home/
- Local WordPress: `npm run dev:wordpress` → http://127.0.0.1:9400/

There are 39 indexable pages: five core pages plus eight dedicated dish pages in each of Spanish, Catalan and English. A separate 404 template brings the generated total to 40.

## Build

```sh
npm ci
npm run typecheck
npm run build:wordpress
npm run build:site
npm run package
```

## Verify

Start the static preview with `npm run dev`, then:

```sh
npm run check
npm run test:flavours
npm run test:animations
npm run test:wordpress
```

The WordPress test installation intercepts mail; no external messages are sent. Real email delivery and the client's existing plugins must be verified on hosting in phase 2. Tests and screenshots are recorded in `output/phase1/`.

Plate assets are prebuilt and checked into source. To regenerate them, install Pillow and run `python scripts/optimize-plates.py` before building. Original artwork remains available for future revisions. The optional `build:portable` command produces a large standalone demo; it is not a WordPress deployment package.

Git baseline: `e7ffd41`. Earlier frontend reference notes are in `docs/frontend-reference.md`; current build, editing and deployment instructions are in the phase 1 guide.
