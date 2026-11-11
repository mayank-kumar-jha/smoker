"""Generate local responsive images and WOFF2 fonts from the supplied brand assets."""
from pathlib import Path
from PIL import Image
from fontTools.ttLib import TTFont
import json

assets = Path(__file__).resolve().parents[1] / 'site' / 'assets'
images = ['pork.webp', 'spiced-chicken.webp', 'herb-chicken.webp', 'meat-cannelloni.jpg', 'spinach-cannelloni.jpg', 'meat-aubergine.jpg', 'vegetable-aubergine.webp', 'olot-potatoes.jpg', 'spinach-potatoes.jpg', 'glovo.png', 'just-eat.png', 'uber-eats.png']
manifest = {}
for filename in images:
    with Image.open(assets / filename) as original:
        original = original.convert('RGBA' if original.mode == 'RGBA' else 'RGB')
        variants = []
        for width in sorted(set([min(160, original.width), min(320, original.width), min(640, original.width), min(1000, original.width)])):
            height = round(original.height * width / original.width)
            name = f'{Path(filename).stem}-{width}.webp'
            original.resize((width, height), Image.Resampling.LANCZOS).save(assets / name, 'WEBP', quality=76, method=6, exif=b'')
            variants.append({'file': name, 'width': width, 'height': height})
        manifest[filename] = variants
for filename in ['display.ttf', 'condensed-0.ttf']:
    font = TTFont(assets / filename)
    font.flavor = 'woff2'
    font.save(assets / (Path(filename).stem + '.woff2'))
with Image.open(assets / 'herb-chicken.webp') as background:
    background = background.convert('RGB')
    background.thumbnail((512, 700), Image.Resampling.LANCZOS)
    background.save(assets / 'hero-texture.webp', 'WEBP', quality=55, method=6)
(assets.parent / 'media.json').write_text(json.dumps(manifest, indent=2), encoding='utf8')
print('Prepared responsive WebP images and two WOFF2 font families.')
