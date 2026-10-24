# Turns checked raw pictures into kit art: src/kits/art/<kit>/big/NN-<slot>.jpg (portrait, landscape
# ones turned a quarter turn) plus pages.json. Usage: RAW=dir python3 import.py kit ...
#   vet: python3 import.py --vet "<Printable Vet Clinic Package.pdf>"
import json, os, subprocess, sys, tempfile
from PIL import Image
from kits import K
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..'))
RAW = os.environ.get('RAW', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raw'))
ORDER = ['hero', 'cards', 'wear', 'signs', 'strips', 'forms', 'labels', 'screen', 'rooms', 'poster']
LONG = 1900  # pixels on the long side: about 180 dpi on a Letter page
# JPEG, not WebP: Chrome copies a JPEG into the PDF as is, but re-encodes WebP losslessly (2.4 MB a page).

def title(slot, v):
    return v.get('short') or {
        'hero': v.get('title', '').lower(), 'cards': 'picture cards', 'signs': 'signs and charts', 'forms': 'mini cards and forms',
        'labels': 'jar labels', 'screen': 'tablet screen', 'rooms': 'room door signs',
    }.get(slot) or v['title'].lower()

def save(im, out):
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA'); bg = Image.new('RGB', im.size, 'white'); bg.paste(im, mask=im.split()[-1]); im = bg
    im = im.convert('RGB')
    if im.width > im.height: im = im.transpose(Image.Transpose.ROTATE_270)
    s = LONG / max(im.size)
    if s < 1: im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    im.save(out, 'JPEG', quality=80, optimize=True, progressive=True)

def write(kit, pages):
    d = os.path.join(ROOT, 'src', 'kits', 'art', kit, 'big'); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    out = []
    for i, (im, slot, t) in enumerate(pages):
        f = f'{i + 1:02d}-{slot}.jpg'; save(im, os.path.join(d, f)); out.append({'file': f, 'title': t})
    json.dump(out, open(os.path.join(d, 'pages.json'), 'w'), indent=1)
    print(kit, len(out), 'pages')

VET = [('hero', 'a big bird X-ray'), ('cards', 'four pet X-ray cards'), ('wear', 'pretend cast'), ('signs', 'signs and check-up charts'),
       ('strips', 'pretend bandages'), ('forms', 'clinic cards and forms'), ('labels', 'medicine and food labels'), ('labels2', 'bird and turtle labels'),
       ('screen', 'appointment tablet'), ('rooms', 'room door signs'), ('poster-bird', 'bird X-ray poster'), ('poster-bunny', 'bunny X-ray poster'),
       ('poster-cat', 'cat X-ray poster'), ('poster-dog', 'dog X-ray poster'), ('poster-turtle', 'turtle X-ray poster')]

if sys.argv[1] == '--vet':
    with tempfile.TemporaryDirectory() as t:
        subprocess.run(['pdfimages', '-png', sys.argv[2], os.path.join(t, 'i')], check=True)
        fs = sorted(os.listdir(t)); ims = []
        # Pages 11 to 15 carry a soft mask (image then smask); join them so the background stays white.
        i = 0
        while i < len(fs):
            im = Image.open(os.path.join(t, fs[i]))
            nxt = Image.open(os.path.join(t, fs[i + 1])) if i + 1 < len(fs) else None
            if nxt is not None and nxt.mode == 'L' and nxt.size == im.size and im.mode != 'L':
                im = im.convert('RGB'); im.putalpha(nxt); i += 2
            else: i += 1
            ims.append(im)
        assert len(ims) == len(VET), len(ims)
        write('vet', [(im, s, t) for im, (s, t) in zip(ims, VET)])
else:
    for kit in sys.argv[1:]:
        pages = []
        for slot in ORDER:
            f = os.path.join(RAW, f'{kit}-{slot}.png')
            if os.path.exists(f): pages.append((Image.open(f), slot, title(slot, K[kit]['pages'][slot])))
            else: print('missing', f)
        write(kit, pages)
