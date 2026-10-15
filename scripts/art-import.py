# Cuts an illustration sheet (made from a prompt in scripts/art-list.py) into one clean PNG per
# picture in src/kits/art/<kit>/<slug>.png: white background made transparent, trimmed and resized.
# Usage: python3 scripts/art-import.py <sheet id, e.g. halloween-1> <image>
#        python3 scripts/art-import.py <kit> <slug> <image>          (one picture on its own)
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ART = os.path.join(ROOT, 'src', 'kits', 'art')
MAX = 600  # px on the longest side: 300 dpi at the biggest printed size (about 2 inches)

def load(path):
    img = Image.open(path).convert('RGBA')
    a = np.asarray(img).astype(np.int16)
    # Background: near-white (or already transparent) pixels connected to the edge of the image.
    light = (a[..., :3].min(axis=2) > 232) | (a[..., 3] < 20)
    lab, _ = ndimage.label(light)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    alpha = np.where(bg, 0, a[..., 3]).astype(np.uint8)
    # Soften the cut edge by one pixel so it doesn't look jagged.
    soft = ndimage.uniform_filter(alpha.astype(np.float32), 3)
    alpha = np.where(bg, 0, np.maximum(alpha, soft)).astype(np.uint8)
    out = np.asarray(img).copy()
    out[..., 3] = alpha
    return out

def save(rgba, kit, slug):
    ys, xs = np.nonzero(rgba[..., 3] > 8)
    pad = 6
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, rgba.shape[0])
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, rgba.shape[1])
    img = Image.fromarray(rgba[y0:y1, x0:x1], 'RGBA')
    img.thumbnail((MAX, MAX), Image.LANCZOS)
    # Square canvas so the picture sits centered wherever it's placed.
    side = max(img.size)
    sq = Image.new('RGBA', (side, side), (255, 255, 255, 0))
    sq.paste(img, ((side - img.width) // 2, (side - img.height) // 2))
    os.makedirs(os.path.join(ART, kit), exist_ok=True)
    f = os.path.join(ART, kit, f'{slug}.png')
    sq.save(f, optimize=True)
    return f

def pieces(rgba, want):
    """The separate pictures on a sheet, in reading order (left to right, top to bottom)."""
    solid = rgba[..., 3] > 8
    h, w = solid.shape
    # Join the bits of one picture (sparkles, loose strokes) before counting pictures.
    for grow in (max(h, w) // 60, max(h, w) // 40, max(h, w) // 28):
        lab, n = ndimage.label(ndimage.binary_dilation(solid, iterations=grow))
        boxes = [b for b in ndimage.find_objects(lab)]
        sizes = ndimage.sum(solid, lab, range(1, n + 1))
        keep = [(b, i + 1) for i, b in enumerate(boxes) if sizes[i] > solid.sum() * 0.004]
        if len(keep) <= want:
            break
    if len(keep) != want:
        sys.exit(f'Found {len(keep)} pictures on the sheet but expected {want}; crop it or import them one at a time.')
    # Group into rows by vertical center, then sort each row left to right.
    keep.sort(key=lambda k: (k[0][0].start + k[0][0].stop) / 2)
    rows, row = [], []
    for k in keep:
        cy = (k[0][0].start + k[0][0].stop) / 2
        if row and cy - (row[0][0][0].start + row[0][0][0].stop) / 2 > h / 8:
            rows.append(row); row = []
        row.append(k)
    rows.append(row)
    ordered = [k for r in rows for k in sorted(r, key=lambda k: k[0][1].start)]
    out = []
    for b, label in ordered:
        piece = rgba[b].copy()
        piece[..., 3] = np.where(lab[b] == label, piece[..., 3], 0)
        out.append(piece)
    return out

def main():
    args = sys.argv[1:]
    if len(args) == 3:
        kit, slug, image = args
        print('Wrote', save(load(image), kit, slug))
        return
    if len(args) != 2:
        sys.exit(__doc__ if __doc__ else 'Usage: art-import.py <sheet id> <image>  |  art-import.py <kit> <slug> <image>')
    sheet, image = args
    sheets = json.load(open(os.path.join(ART, 'sheets.json')))
    if sheet not in sheets:
        sys.exit(f'Unknown sheet "{sheet}"; see src/kits/art/sheets.json')
    kit = sheet.rsplit('-', 1)[0]
    slugs = sheets[sheet]
    for piece, slug in zip(pieces(load(image), len(slugs)), slugs):
        print('Wrote', save(piece, kit, slug))

main()
