# Makes the pictures shown beside the product on the Stripe checkout page (docs/img/checkout/), as
# JPEGs since Stripe may not show WebP: one per theme from the same illustration as the theme picker
# tiles (ICONS in scripts/theme-icons.py), one per handprint pack from its card, and one for the Family
# Pass from the logo. No kid's name on any of them, since the order isn't made yet.
# src/bot/payments.js links them from SITE_URL. Run again after changing a pick:
# python3 scripts/checkout-images.py
import importlib.util, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ART = os.path.join(ROOT, 'src', 'kits', 'art')
DOCS = os.path.join(ROOT, 'docs', 'img')
OUT = os.path.join(DOCS, 'checkout')
CREAM = (251, 248, 241)  # the site's paper color
SIZE = 600

spec = importlib.util.spec_from_file_location('theme_icons', os.path.join(ROOT, 'scripts', 'theme-icons.py'))
icons = importlib.util.module_from_spec(spec)
spec.loader.exec_module(icons)


def on_cream(im, box, size=(SIZE, SIZE)):
    """The picture fitted inside box x box, centered on a cream square."""
    im = im.convert('RGBA')
    if im.getbbox():
        im = im.crop(im.getbbox())
    # fit the box, growing small art too (thumbnail() only shrinks)
    k = box / max(im.width, im.height)
    im = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    out = Image.new('RGBA', size, CREAM + (255,))
    out.alpha_composite(im, ((size[0] - im.width) // 2, (size[1] - im.height) // 2))
    return out.convert('RGB')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    save = lambda im, name: im.save(os.path.join(OUT, name), 'JPEG', quality=86, optimize=True, progressive=True)
    for theme, art in icons.ICONS.items():
        save(on_cream(Image.open(os.path.join(ART, art + '.webp')), 460), f'{theme}.jpg')
    for f in sorted(os.listdir(DOCS)):
        if f.startswith('craft-') and f.endswith('.webp'):
            # the whole card on cream, so its title isn't cropped off
            save(on_cream(Image.open(os.path.join(DOCS, f)), 570), f.replace('.webp', '.jpg'))
    save(on_cream(Image.open(os.path.join(DOCS, 'mark.png')), 420), 'pass.jpg')
    print('Wrote', len(os.listdir(OUT)), 'checkout pictures to docs/img/checkout/')
