# After the preview scripts run, puts back every image in docs/img that only re-encoded slightly
# differently, so a commit carries just the pictures that really changed (the repo doesn't grow by
# a full set of previews on every kit edit). Used by .github/workflows/previews.yml.
# Usage: python3 scripts/keep-changed-images.py
import io, subprocess
from PIL import Image, ImageChops, ImageStat

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
        diff = ImageChops.difference(old, new)
        # Re-encoding moves pixels by a few levels; a real change (new text, a new page) moves them a lot.
        same = max(ImageStat.Stat(diff).mean) < 1 and diff.convert('L').point(lambda v: 255 if v > 40 else 0).getbbox() is None
    if same:
        subprocess.run(['git', 'checkout', '--', f], check=True)
        reverted += 1
    else:
        kept += 1
print(f'{kept} images changed, {reverted} only re-encoded (put back)')
