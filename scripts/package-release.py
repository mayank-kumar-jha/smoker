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
    for directory in ['site', 'seo', 'scripts', 'tests', 'src', 'docs']:
        for file in sorted((root / directory).rglob('*')):
            if file.is_file():
                archive.write(file, file.relative_to(root))
    for name in ['README.md', '.gitignore', 'package.json', 'package-lock.json', 'build-site.cjs', 'build.cjs', 'serve.cjs', 'output/smokers-full.html', 'output/smokers-full-widget.html', 'output/qa/test-results.json', 'output/qa/validation.md', 'output/qa/completion-validation.md', 'output/qa/support-page-results.json', 'output/qa/brand-panel-results.json']:
        file = root / name
        if file.exists():
            archive.write(file, name)
print('Created output/smokers-production.zip and output/smokers-source.zip')
