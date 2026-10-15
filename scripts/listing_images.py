"""Builds Etsy listing photos (2400x1800) from 2x page screenshots.

Usage: python3 src/listing_images.py <png_root> <out_dir>
<png_root>/<theme>/page-N.png come from `node src/standard.js <png_root>`.
"""
import os
import sys
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, '..', 'fonts', 'Fredoka.ttf')

THEMES = {
    'dino': ('Dinosaur Scavenger Hunt', 'Ages 3–6', '#e9e2cc', '#4f6b3a'),
    'hero': ('Superhero Scavenger Hunt', 'Ages 4–8', '#fdeaa0', '#d62828'),
    'pirate': ('Pirate Treasure Hunt', 'Ages 3–7', '#ecdcb6', '#1f2f4d'),
    'space': ('Outer Space Scavenger Hunt', 'Ages 4–8', '#d7e6f3', '#14245a'),
    'royal': ('Princess & Knight Castle Quest', 'Ages 3–7', '#f3dde4', '#7d5ba6'),
    'unicorn': ('Unicorn Rainbow Scavenger Hunt', 'Ages 3–7', '#efe3f8', '#8e5cc4'),
    'mermaid': ('Mermaid Treasure Hunt', 'Ages 3–7', '#d9f1ee', '#11798a'),
    'construction': ('Construction Scavenger Hunt', 'Ages 3–7', '#fde9a8', '#33373d'),
    'vet': ('Pet Vet Scavenger Hunt', 'Ages 3–7', '#d8f1e6', '#1f6f66'),
}
W, H = 2400, 1800


def font(size, weight=600):
    f = ImageFont.truetype(FONT, size)
    try:
        f.set_variation_by_axes([weight, 100])
    except Exception:
        pass
    return f


def placed(canvas, img, h, center, angle):
    img = img.resize((int(img.width * h / img.height), h), Image.LANCZOS).convert('RGBA')
    img = img.rotate(angle, expand=True, resample=Image.BICUBIC)
    shadow = Image.new('RGBA', img.size, (0, 0, 0, 0))
    shadow.paste((0, 0, 0, 90), mask=img.split()[3])
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    x, y = center[0] - img.width // 2, center[1] - img.height // 2
    canvas.alpha_composite(shadow, (x + 14, y + 22))
    canvas.alpha_composite(img, (x, y))


def build(png_root, out_dir):
    os.makedirs(out_dir, exist_ok=True)
    for theme, (title, ages, bg, ink) in THEMES.items():
        pages = lambda n: Image.open(os.path.join(png_root, theme, f'page-{n}.png'))
        n_pages = len([f for f in os.listdir(os.path.join(png_root, theme)) if f.startswith('page-')])
        c = Image.new('RGBA', (W, H), bg)
        d = ImageDraw.Draw(c)
        d.text((W // 2, 120), title, font=font(118, 700), fill=ink, anchor='mm')
        d.text((W // 2, 230), f'Printable Birthday Party Game · {ages} · 8 Picture Clues', font=font(56, 500), fill=ink, anchor='mm')
        placed(c, pages(2), 1180, (560, 1060), 5)
        placed(c, pages(n_pages), 1180, (1840, 1060), -5)
        placed(c, pages(3), 1300, (1200, 1080), 0)
        d.rounded_rectangle((520, 1640, W - 520, 1750), radius=55, fill=ink)
        d.text((W // 2, 1695), 'INSTANT DOWNLOAD  ·  PRINT AT HOME  ·  READY IN MINUTES', font=font(44, 600), fill='white', anchor='mm')
        out = os.path.join(out_dir, f'{theme}-listing-main.png')
        c.convert('RGB').save(out, quality=92)
        print('Wrote', out)


if __name__ == '__main__':
    build(sys.argv[1], sys.argv[2])
