"""Create deployable static files and a separate editable source bundle."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
output = root / 'output'
with ZipFile(output / 'smokers-production.zip', 'w', ZIP_DEFLATED) as archive:
    for file in sorted((output / 'production-site').rglob('*')):
        if file.is_file():
            archive.write(file, file.relative_to(output / 'production-site'))
with ZipFile(output / 'smokers-source.zip', 'w', ZIP_DEFLATED) as archive:
    for directory in ['site', 'seo', 'scripts', 'tests', 'src', 'docs', 'components', 'wordpress', '.github']:
        for file in sorted((root / directory).rglob('*')):
            if file.is_file():
                archive.write(file, file.relative_to(root))
    for name in ['README.md', '.gitignore', 'package.json', 'package-lock.json', 'tsconfig.json', 'build-site.cjs', 'build.cjs', 'serve.cjs']:
        file = root / name
        if file.exists():
            archive.write(file, name)
for name in ['smokers-theme', 'smokers-content']:
    folder = root / 'wordpress' / name
    with ZipFile(output / (name + '.zip'), 'w', ZIP_DEFLATED) as archive:
        for file in sorted(folder.rglob('*')):
            if file.is_file():
                archive.write(file, file.relative_to(root / 'wordpress'))
print('Created static, source, WordPress theme and content-plugin packages')
