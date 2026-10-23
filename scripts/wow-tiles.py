# Makes the theme picker tiles on the website (docs/img/wow/<theme>.webp, 240 x 240) from each kit's
# realistic wow prop (src/kits/art/<kit>/wow.webp, made by scripts/wow-cutout.py): the prop trimmed,
# fitted with a little margin and given a soft shadow, on a clear background so it sits on the tile.
# Run it again after a wow prop changes: python3 scripts/wow-tiles.py [theme...]
import glob, os, sys
from PIL import Image, ImageFilter

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ART = os.path.join(ROOT, 'src', 'kits', 'art')
OUT = os.path.join(ROOT, 'docs', 'img', 'wow')
SIZE, PAD = 240, 14


def tile(src):
    im = Image.open(src).convert('RGBA')
    im = im.crop(im.getbbox())
    im.thumbnail((SIZE - 2 * PAD, SIZE - 2 * PAD), Image.LANCZOS)
    x, y = (SIZE - im.width) // 2, (SIZE - im.height) // 2
    # a soft navy shadow a little below the prop
    shade = Image.new('RGBA', im.size, (40, 45, 80, 255))
    shade.putalpha(im.split()[3].point(lambda v: int(v * 0.28)))
    out = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    out.paste(shade, (x + 3, y + 6), shade)
    out = out.filter(ImageFilter.GaussianBlur(6))
    out.alpha_composite(im, (x, y))
    return out


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    ids = sys.argv[1:] or sorted(os.path.basename(os.path.dirname(f)) for f in glob.glob(os.path.join(ART, '*', 'wow.webp')))
    for i in ids:
        tile(os.path.join(ART, i, 'wow.webp')).save(os.path.join(OUT, f'{i}.webp'), 'WEBP', quality=86, method=6)
    print(f'Wrote {len(ids)} tiles to docs/img/wow/')
