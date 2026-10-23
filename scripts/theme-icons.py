# Makes the theme picker tiles on the website (docs/img/icons/<theme>.webp, 240 x 240) from one cute
# illustration of each theme's kit art (src/kits/art/), picked in ICONS below. The art is trimmed and
# centered with a little margin on a clear background. Run it again after changing a pick:
# python3 scripts/theme-icons.py [theme...]
import os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ART = os.path.join(ROOT, 'src', 'kits', 'art')
OUT = os.path.join(ROOT, 'docs', 'img', 'icons')
SIZE, PAD = 240, 16

# theme -> kit art file (any kit's art can stand for a theme)
ICONS = {
    'auto': 'auto/1f9f0', 'burger': 'burger/burger', 'christmas': 'christmas/santa',
    'coffee': 'christmas/hot-cocoa', 'construction': 'construction/digger', 'dentist': 'vet/teeth',
    'dino': 'dino/t-rex', 'easter': 'easter/bunny', 'fire': 'fire/fire-truck',
    'grocery': 'grocery/cart-champ', 'halloween': 'halloween/pumpkin', 'hero': 'hero/superhero',
    'ice': 'ice/penguin', 'italian': 'pizza/pasta', 'library': 'library/owl',
    'mermaid': 'mermaid/mermaid', 'petshop': 'petshop/hamster', 'pirate': 'pirate/parrot',
    'pizza': 'space/freeze-dried-pizza', 'police': 'police/police-station', 'post': 'post/pop-it-in-the-mail-box',
    'racecar': 'racecar/race-car', 'royal': 'royal/crown', 'space': 'space/3-2-1',
    'unicorn': 'unicorn/unicorn', 'valentine': 'valentine/hearts', 'vet': 'vet/dog',
}


def tile(src):
    im = Image.open(src).convert('RGBA')
    im = im.crop(im.getbbox())
    im.thumbnail((SIZE - 2 * PAD, SIZE - 2 * PAD), Image.LANCZOS)
    out = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    out.alpha_composite(im, ((SIZE - im.width) // 2, (SIZE - im.height) // 2))
    return out


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    ids = sys.argv[1:] or sorted(ICONS)
    for i in ids:
        tile(os.path.join(ART, ICONS[i] + '.webp')).save(os.path.join(OUT, f'{i}.webp'), 'WEBP', quality=88, method=6)
    print(f'Wrote {len(ids)} tiles to docs/img/icons/')
