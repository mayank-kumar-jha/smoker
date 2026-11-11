"""Encode supplied photography without retouching; retain every previous asset."""
from pathlib import Path
import json
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
assets = root / 'site/assets'
source = root / 'docs/official-images'
manifest_path = root / 'site/media.json'
manifest = json.loads(manifest_path.read_text(encoding='utf8'))
mapping = {
    'Berenjena rellena de verduras.jpg': 'official-vegetable-aubergine',
    'Galta_.jpg': 'official-pork',
    "Pollo a'last a las especias_.jpg": 'official-spiced-chicken',
    "Pollo a'last a las hierbas.jpg": 'official-herb-chicken',
    'Ensalada cesar_.jpg': 'official-caesar-salad',
    'Ensalada de patatas con trufas.jpg': 'official-truffle-potato-salad',
    'Ensalada_.jpg': 'official-salad',
    'Racion de patatas a la trufa.jpg': 'official-truffle-potatoes',
    'Racion de patatas smokers.jpg': 'official-smokers-potatoes',
    'D25A6858.jpg': 'official-table',
}

def encode(path, stem, widths):
    with Image.open(path) as raw:
        image = ImageOps.exif_transpose(raw).convert('RGB')
        variants = []
        for width in widths:
            size = (width, round(image.height * width / image.width))
            filename = f'{stem}-{width}.webp'
            image.resize(size, Image.Resampling.LANCZOS).save(assets / filename, 'WEBP', quality=86, method=6)
            variants.append(dict(file=filename, width=size[0], height=size[1]))
        (assets / f'{stem}.webp').write_bytes((assets / variants[-1]['file']).read_bytes())
        manifest[f'{stem}.webp'] = variants

for filename, stem in mapping.items():
    encode(source / filename, stem, [160, 320, 640, 1200])
encode(source / 'homepage-desktop.png', 'home-reference-official', [960, 1672])
encode(source / 'homepage-mobile.png', 'home-reference-mobile-official', [640, 1254])
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf8')
print('Prepared 10 official photographs and two homepage compositions; previous assets retained.')
