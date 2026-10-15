"""Builds the Party Pack listing photos (2400x1800 JPGs in listing-assets/).

Usage: python3 scripts/party_photos.py <png_root>
<png_root>/<theme>/page-N.png come from `npm run party -- <cfg.json> <out.pdf> --png <png_root>/<theme>`
(page 2 = invitations, 4 = cupcake toppers, 6 = first banner page).
"""
import os
import sys
from PIL import Image, ImageDraw

from listing_images import W, H, font, placed

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'listing-assets')

THEMES = {
    'dino': ('Dinosaur', '#e9e2cc', '#4f6b3a'),
    'hero': ('Superhero', '#fdeaa0', '#d62828'),
    'pirate': ('Pirate', '#ecdcb6', '#1f2f4d'),
    'space': ('Outer Space', '#d7e6f3', '#14245a'),
    'royal': ('Princess & Knight', '#f3dde4', '#7d5ba6'),
    'unicorn': ('Unicorn', '#efe3f8', '#8e5cc4'),
    'mermaid': ('Mermaid', '#d9f1ee', '#11798a'),
    'construction': ('Construction', '#fde9a8', '#33373d'),
    'vet': ('Pet Vet', '#d8f1e6', '#1f6f66'),
    'easter': ('Easter', '#ece5f7', '#6f58a8'),
    'halloween': ('Halloween', '#ffe2c4', '#4a2475'),
    'christmas': ('Christmas', '#f6e3c3', '#b3202a'),
    'valentine': ('Valentine’s', '#fde0e8', '#a61e4d'),
    'fire': ('Firefighter', '#ffe1d6', '#8e1b1b'),
    'ice': ('Ice Kingdom', '#dbe8f7', '#24467e'),
    'racecar': ('Race Car', '#ffe8a3', '#b81d17'),
}


def footer(d, ink, text):
    d.rounded_rectangle((420, 1640, W - 420, 1750), radius=55, fill=ink)
    d.text((W // 2, 1695), text, font=font(44, 600), fill='white', anchor='mm')


def theme_photo(root, theme, label, bg, ink):
    page = lambda n: Image.open(os.path.join(root, theme, f'page-{n}.png'))
    c = Image.new('RGBA', (W, H), bg)
    d = ImageDraw.Draw(c)
    d.text((W // 2, 120), f'{label} Party Printables', font=font(118, 700), fill=ink, anchor='mm')
    d.text((W // 2, 230), 'Invitations · Cupcake Toppers · Name Banner · Favor Tags · Thank-You Cards', font=font(52, 500), fill=ink, anchor='mm')
    placed(c, page(4), 1180, (560, 1060), 5)
    placed(c, page(6), 1180, (1840, 1060), -5)
    placed(c, page(2), 1300, (1200, 1080), 0)
    footer(d, ink, 'PERSONALIZED WITH YOUR CHILD’S NAME  ·  PRINT AT HOME')
    return c


def main_photo(root):
    c = Image.new('RGBA', (W, H), '#fbf8f1')
    d = ImageDraw.Draw(c)
    d.text((W // 2, 120), 'Personalized Party Printables', font=font(118, 700), fill='#3f4a73', anchor='mm')
    d.text((W // 2, 230), '8 themes · Invitations, toppers, banner, favor tags, thank-yous and more', font=font(52, 500), fill='#3f4a73', anchor='mm')
    themes = list(THEMES)
    for i, theme in enumerate(themes):
        col, row = i % 4, i // 4
        cx, cy = 360 + col * 560, 720 + row * 620
        angle = (-4, 3, -2, 4)[(i + row) % 4]
        placed(c, Image.open(os.path.join(root, theme, 'page-2.png')), 560, (cx, cy), angle)
    footer(d, '#3f4a73', 'MATCHES EVERY SCAVENGER HUNT  ·  PRINT AT HOME')
    return c


if __name__ == '__main__':
    root = sys.argv[1]
    for theme, (label, bg, ink) in THEMES.items():
        theme_photo(root, theme, label, bg, ink).convert('RGB').save(os.path.join(OUT, f'party-{theme}.jpg'), quality=88)
    main_photo(root).convert('RGB').save(os.path.join(OUT, 'party-main.jpg'), quality=88)
    print('Wrote party photos to', OUT)
