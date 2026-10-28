#!/usr/bin/env python3
"""Imports the origami pictures Jason makes in the Gemini app (prompts in
project-files/activity-packs/origami/prompts.md) into src/kits/art/<kit>/.

  python3 scripts/origami-import.py <folder> [theme...]

The folder holds <theme>-paper.<ext> and <theme>-pieces.<ext> (jpg, jpeg, png or webp). The paper is
cropped to its centered square and saved 1600px (about 210 dpi on the 7.5 in square); the pieces get a pure white background (a grey table, paper edge or shadow is removed) and trimmed of their white margin. Both
are saved as JPEG (Chrome copies a JPEG into the PDF as is). Then ORIGAMI in docs/js/data.js is
rewritten to list every kit that has both pictures.

After importing, in the same PR: node scripts/page-counts.js (paste its PAGES line into data.js),
node scripts/stamp-assets.js, and the previews (gallery-images.js <theme...>, or let the Site
previews workflow do it after merging).
"""
import json
import os
import re
import subprocess
import sys

from PIL import Image, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.path.join(ROOT, 'src', 'kits', 'art')


def find(folder, theme, kind):
    for ext in ('jpg', 'jpeg', 'png', 'webp'):
        p = os.path.join(folder, f'{theme}-{kind}.{ext}')
        if os.path.exists(p):
            return p
    return None


def paper(src, out):
    im = Image.open(src).convert('RGB')
    s = min(im.size)
    left, top = (im.width - s) // 2, (im.height - s) // 2
    im.crop((left, top, left + s, top + s)).resize((1600, 1600), Image.LANCZOS).save(out, quality=86)


def whiten(im):
    """Makes everything around the pieces pure white. Gemini sometimes draws the sheet as a photo
    of paper lying on a grey table, or on a light grey background: every pale, colorless pixel
    joined to the image's edge (table, paper, shadows, the white sticker borders) turns white.
    White inside a piece's outline (teeth, windows) isn't joined to the edge, so it stays."""
    import numpy as np
    from scipy import ndimage
    a = np.asarray(im).astype(np.int16)
    pale = (a.min(axis=2) > 150) & (a.max(axis=2) - a.min(axis=2) < 28)
    pale = ndimage.binary_opening(pale, iterations=1)
    labels, _ = ndimage.label(pale)
    edge = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    bg = np.isin(labels, edge[edge > 0])
    # a soft halo just outside each piece (the shadow's edge) goes too
    bg = ndimage.binary_dilation(bg, iterations=2) & (a.min(axis=2) > 120) & (a.max(axis=2) - a.min(axis=2) < 40) | bg
    # thin lines (the paper's edge) and specks left on the white: keep only marks that have some
    # body (they survive a 4-pixel erosion), so the sheet trims tight around the real pieces
    ink = ~bg & ((a.min(axis=2) < 235) | (a.max(axis=2) - a.min(axis=2) > 20))
    core = ndimage.binary_erosion(ink, iterations=4)
    marks, _ = ndimage.label(ndimage.binary_dilation(ink, iterations=3))
    keep = np.isin(marks, np.unique(marks[core]))
    out = np.asarray(im).copy()
    out[bg | ~keep] = 255
    return Image.fromarray(out)


def pieces(src, out):
    im = whiten(Image.open(src).convert('RGB'))
    diff = ImageChops.difference(im, Image.new('RGB', im.size, (255, 255, 255))).convert('L').point(lambda v: 255 if v > 24 else 0)
    box = diff.getbbox()
    if box:
        pad = int(0.03 * max(im.size))
        im = im.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad)))
    if im.width > 2000:
        im = im.resize((2000, round(im.height * 2000 / im.width)), Image.LANCZOS)
    im.save(out, quality=86)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    folder, only = sys.argv[1], set(sys.argv[2:])
    themes = json.loads(subprocess.check_output(['node', '-e', "process.stdout.write(JSON.stringify(Object.keys(require('./src/kits/origami').THEMES)))"], cwd=ROOT))
    done = []
    for theme in themes:
        if only and theme not in only:
            continue
        p, q = find(folder, theme, 'paper'), find(folder, theme, 'pieces')
        if not (p or q):
            continue
        os.makedirs(os.path.join(ART, theme), exist_ok=True)
        if p:
            paper(p, os.path.join(ART, theme, 'origami-paper.jpg'))
        if q:
            pieces(q, os.path.join(ART, theme, 'origami-pieces.jpg'))
        done.append(theme + ('' if p and q else ' (only the ' + ('paper' if p else 'pieces') + ')'))
    # ORIGAMI in data.js: the kits with both pictures, and the model's name.
    want = subprocess.check_output(['node', '-e', """
const og = require('./src/kits/origami'); const want = {};
for (const id of Object.keys(og.THEMES)) if (og.hasOrigami({ def: { id } })) want[id] = og.MODELS[og.THEMES[id][0]].name.toLowerCase();
process.stdout.write(JSON.stringify(want));"""], cwd=ROOT).decode()
    data = os.path.join(ROOT, 'docs', 'js', 'data.js')
    src = open(data, encoding='utf-8').read()
    src = re.sub(r'^const ORIGAMI = \{.*\};$', f'const ORIGAMI = {want};', src, flags=re.M)
    open(data, 'w', encoding='utf-8').write(src)
    print('Imported:', ', '.join(done) or 'nothing')
    print('ORIGAMI:', want)


if __name__ == '__main__':
    main()
