# Cut real kit pieces out of rendered pages into transparent PNGs.
import sys, numpy as np
from PIL import Image, ImageDraw
S = sys.argv[1]
P = f'{S}/pages'; O = f'{S}/howto/pieces'
import os; os.makedirs(O, exist_ok=True)

def outside_transparent(im, thr=238):
    a = np.asarray(im.convert('RGB')).astype(int)
    white = (a.min(axis=2) >= thr)
    m = Image.fromarray((white * 255).astype('uint8'), 'L').copy()
    W, H = m.size
    for pt in [(0, 0), (W-1, 0), (0, H-1), (W-1, H-1)]:
        if m.getpixel(pt) == 255: ImageDraw.floodfill(m, pt, 128)
    alpha = np.where(np.asarray(m) == 128, 0, 255).astype('uint8')
    out = im.convert('RGBA'); out.putalpha(Image.fromarray(alpha))
    bb = out.getchannel("A").getbbox(); return out.crop(bb)

def card(kit, page, half, name):
    im = Image.open(f'{P}/{kit}/page-{page}.png').convert('RGB'); W, H = im.size
    c = im.crop((0, 0, W, H//2) if half == 'top' else (0, H//2, W, H))
    a = np.asarray(c).astype(int); mx = a.max(axis=2); mn = a.min(axis=2)
    sat = ((mx - mn) > 60) | (mn < 150)
    ys, xs = np.where(sat)
    # border = outermost saturated pixels on rows/cols with many hits
    rows = np.where(sat.sum(axis=1) > W*0.5)[0]; cols = np.where(sat.sum(axis=0) > 300)[0]
    box = (cols.min(), rows.min(), cols.max()+1, rows.max()+1)
    outside_transparent(c.crop(box)).save(f'{O}/{name}.png'); print(name, box)

def shape(kit, page, y0, y1, name, x0=0, x1=None):
    im = Image.open(f'{P}/{kit}/page-{page}.png').convert('RGB')
    c = im.crop((x0, y0, x1 or im.width, y1))
    outside_transparent(c).save(f'{O}/{name}.png'); print(name)

card('post', 6, 'bot', 'post-mail')
card('post', 9, 'bot', 'post-mailboxes')
card('pizza', 8, 'top', 'pizza-kitchen')
shape('pizza', 9, 60, 1980, 'pizza-oven')
shape('pizza', 25, 330, 2000, 'pizza-peel')
shape('pizza', 17, 295, 1650, 'pizza-pizza')
shape('post', 18, 245, 555, 'post-stamp', 0, 420)

# ---- all kits ----
CARDS = [
    ('auto', 7, 'top', 'auto-carwash'), ('auto', 6, 'bot', 'auto-drivein'),
    ('burger', 7, 'bot', 'burger-drivethru'), ('burger', 10, 'top', 'burger-orderhere'),
    ('christmas', 6, 'bot', 'christmas-sleigh'), ('coffee', 9, 'top', 'coffee-barista'),
    ('construction', 7, 'bot', 'construction-brickyard'), ('dentist', 8, 'bot', 'dentist-prizebox'),
    ('dino', 7, 'top', 'dino-boneyard'), ('easter', 5, 'top', 'easter-dryingrack'),
    ('fire', 3, 'top', 'fire-station'), ('halloween', 4, 'bot', 'halloween-counter'),
    ('hero', 7, 'bot', 'hero-capecloset'), ('ice', 6, 'bot', 'ice-igloo'),
    ('italian', 8, 'top', 'italian-kitchen'), ('library', 10, 'bot', 'library-bookdrop'),
    ('mermaid', 5, 'bot', 'mermaid-pearlvault'), ('petshop', 10, 'bot', 'petshop-puppy'),
    ('pirate', 3, 'top', 'pirate-ship'), ('police', 3, 'top', 'police-station'),
    ('racecar', 3, 'top', 'racecar-garage'), ('royal', 3, 'top', 'royal-castle'),
    ('space', 4, 'bot', 'space-launchpad'), ('unicorn', 3, 'top', 'unicorn-stable'),
    ('valentine', 4, 'bot', 'valentine-mailbox'), ('vet', 5, 'bot', 'vet-xrayroom'),
    ('grocery', 10, 'bot', 'grocery-pantry'),
]
for c in CARDS: card(*c)

def region(kit, page, box, name):
    im = Image.open(f'{P}/{kit}/page-{page}.png').convert('RGB')
    outside_transparent(im.crop(box)).save(f'{O}/{name}.png'); print(name)

region('fire', 18, (64, 420, 565, 925), 'fire-sticker')
region('racecar', 17, (64, 420, 565, 925), 'racecar-sticker')
region('space', 17, (64, 420, 565, 925), 'space-patch')
region('vet', 15, (86, 232, 800, 812), 'vet-xray')
region('police', 14, (142, 308, 1492, 1658), 'police-wheel')
region('racecar', 12, (142, 308, 1492, 1658), 'racecar-wheel')
region('racecar', 13, (135, 373, 1246, 984), 'racecar-dash')
region('pirate', 12, (106, 282, 1526, 1030), 'pirate-spyglass')
region('italian', 11, (118, 230, 1513, 1938), 'italian-stove')
region('dino', 12, (116, 322, 1516, 1724), 'dino-puzzle')
for i, (x0, x1) in enumerate([(86, 554), (582, 1050), (1078, 1546)]):
    region('grocery', 13, (x0, 260, x1, 582), f'grocery-label{i}')
