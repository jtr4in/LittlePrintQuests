# Copies the Noto emoji pictures the play kit toys use out of the @svgmoji/noto sprite
# (Noto Emoji artwork, Apache License 2.0) into src/kits/emoji/<CODEPOINTS>.svg, so big toy
# pictures print sharp instead of as stretched font bitmaps.
# Usage: python3 scripts/vendor-emoji.py path/to/sprites/all.svg 🦖 🥚 ...   (or: --from-toys)
import os, re, sys, subprocess, json

sprite, wanted = sys.argv[1], sys.argv[2:]
if wanted == ['--from-toys']:
    out = subprocess.check_output(['node', '-e', "const {toyEmoji}=require('./src/kits/toys');console.log(JSON.stringify(toyEmoji()))"])
    wanted = json.loads(out)
doc = open(sprite, encoding='utf-8').read()
dest = os.path.join(os.path.dirname(__file__), '..', 'src', 'kits', 'emoji')
os.makedirs(dest, exist_ok=True)
missing = []
for e in wanted:
    code = '-'.join(f'{ord(c):X}' for c in e)
    for key in (code, code.replace('-FE0F', '')):
        m = re.search(r'<svg[^>]*?id="%s"[^>]*>(.*?)</svg>' % re.escape(key), doc, re.S)
        if m:
            break
    if not m:
        missing.append(e)
        continue
    with open(os.path.join(dest, code.replace('-FE0F', '') + '.svg'), 'w', encoding='utf-8') as f:
        box = re.search(r'viewBox="([^"]+)"', m.group(0)).group(1)
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{box}">{m.group(1)}</svg>\n')
print('vendored', len(wanted) - len(missing), 'missing', ' '.join(missing))
