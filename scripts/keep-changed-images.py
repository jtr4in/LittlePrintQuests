# After the preview scripts run, puts back every image in docs/img that only re-encoded slightly
# differently, so a commit carries just the pictures that really changed (the repo doesn't grow by
# a full set of previews on every kit edit). Used by .github/workflows/previews.yml.
# Usage: python3 scripts/keep-changed-images.py
import io, subprocess
from PIL import Image, ImageChops

changed = subprocess.run(['git', 'diff', '--name-only', '--', 'docs/img'], capture_output=True, text=True, check=True).stdout.split()
kept = reverted = 0
for f in changed:
    if not f.endswith(('.webp', '.png', '.jpg')):
        continue
    try:
        old = Image.open(io.BytesIO(subprocess.run(['git', 'show', f'HEAD:{f}'], capture_output=True, check=True).stdout)).convert('RGBA')
        new = Image.open(f).convert('RGBA')
    except Exception:
        kept += 1
        continue
    same = False
    if old.size == new.size:
        # Re-encoding and font hinting move edges by a pixel; a real change (new text, a new page) moves
        # whole areas. So compare at a quarter size and call it changed when over 3% of it differs
        # (a text page re-rendered on another machine moves about 1%, a new picture 30% or more).
        small = (max(1, old.width // 4), max(1, old.height // 4))
        diff = ImageChops.difference(old.resize(small, Image.BOX), new.resize(small, Image.BOX)).convert('L')
        moved = diff.point(lambda v: 255 if v > 32 else 0).histogram()[255]
        same = moved <= 0.03 * small[0] * small[1]
    if same:
        subprocess.run(['git', 'checkout', '--', f], check=True)
        reverted += 1
    else:
        kept += 1
print(f'{kept} images changed, {reverted} only re-encoded (put back)')
