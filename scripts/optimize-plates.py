"""Offline asset preparation. Requires Pillow; originals remain untouched."""
from pathlib import Path
from PIL import Image
import json

assets = Path(__file__).resolve().parents[1] / 'site' / 'assets'
mapping = {}
sources = list(assets.glob('orbit-v2-*.png')) + [assets / name for name in ['pro-chicken-herb.png', 'pro-chicken-spiced.png', 'pro-chicken-background.png']]
for source in sources:
    with Image.open(source) as original:
        image = original.copy()
        image.thumbnail((1100, 1100), Image.Resampling.LANCZOS)
        target = source.with_suffix('.webp')
        image.save(target, 'WEBP', quality=88, method=6)
        mapping[source.name] = target.name
        if source.name.startswith('orbit-v2-'):
            thumb = original.copy()
            thumb.thumbnail((180, 180), Image.Resampling.LANCZOS)
            thumb.save(assets / (source.stem + '-thumb.webp'), 'WEBP', quality=84, method=6)
(assets.parent / 'optimized-media.json').write_text(json.dumps(mapping, indent=2), encoding='utf-8')
print('Prepared', len(mapping), 'optimized images and eight menu thumbnails.')
