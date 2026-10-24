# Turns a generated wow prop picture (see def.wow and pretend-play/wow/tools/prompts.py in the
# project files) into src/kits/art/<kit>/wow.webp: the white background made clear, a grey cut
# line drawn around each piece, trimmed and sized for a 300 dpi print up to 7.6 x 9.4 inches.
# Usage: python3 scripts/wow-cutout.py <kit> <image>
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ART = os.path.join(ROOT, 'src', 'kits', 'art')
MAX = (2280, 2820)  # 7.6 x 9.4 inches at 300 dpi
LINE = (154, 165, 184)  # the same grey as the dashed cut lines on the other pages

def cutout(path):
    img = Image.open(path).convert('RGB')
    img.thumbnail(MAX, Image.LANCZOS)
    a = np.asarray(img).astype(np.int16)
    # Background: smooth, greyish-light pixels connected to the edge. That takes the studio
    # backdrop and its soft shadows but stops at a piece's outline, so white labels inside stay.
    grey = a.max(axis=2) - a.min(axis=2) < 22
    lum = a.mean(axis=2)
    gy, gx = np.gradient(ndimage.gaussian_filter(lum, 1.5))
    smooth = ndimage.maximum_filter(np.hypot(gx, gy), 5) < 5
    light = grey & (lum > 170) & smooth | (a.min(axis=2) > 246)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = (g > r + 40) & (g > b + 40)
    keyed = green[[0, 0, -1, -1], [0, -1, 0, -1]].all()
    if keyed:
        # Pale pieces are made on chroma green: key it out everywhere and pull the green
        # spill off the edges.
        piece = ~ndimage.binary_dilation(green, iterations=1)
        a = a.copy()
        a[..., 1] = np.minimum(g, np.maximum(r, b) + 12)
    else:
        lab, _ = ndimage.label(light)
        edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
        piece = ~np.isin(lab, list(edge))
    # Close specks and pinholes, drop crumbs smaller than a fingernail.
    piece = ndimage.binary_opening(ndimage.binary_closing(piece, iterations=3), iterations=2)
    piece = ndimage.binary_fill_holes(piece)
    lab, n = ndimage.label(piece)
    sizes = ndimage.sum(piece, lab, range(1, n + 1))
    piece = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 2500])
    # Cut line: a ring a few pixels outside each piece, with a little white margin between.
    w = max(4, round(max(img.size) / 600))
    inner = ndimage.binary_dilation(piece, iterations=w * 2)
    outer = ndimage.binary_dilation(inner, iterations=w)
    rgba = np.zeros((*piece.shape, 4), np.uint8)
    rgba[outer & ~inner] = (*LINE, 255)
    rgba[inner & ~piece] = (255, 255, 255, 255)
    rgba[piece, :3] = a[piece]
    rgba[piece, 3] = 255
    if keyed:
        # Green holes inside a piece (the mouth gap in a beard) print white, not near-black.
        rgba[piece & green, :3] = 255
    ys, xs = np.nonzero(outer)
    return Image.fromarray(rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1], 'RGBA')

if __name__ == '__main__':
    kit, src = sys.argv[1:3]
    out = os.path.join(ART, kit, 'wow.webp')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    cutout(src).save(out, 'WEBP', quality=86, method=6)
    print('Wrote', out)
