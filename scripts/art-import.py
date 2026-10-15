# Cuts an illustration sheet (made from a prompt in scripts/art-list.py) into one clean PNG per
# picture in src/kits/art/<kit>/<slug>.webp: white background made transparent, trimmed and resized.
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
    f = os.path.join(ART, kit, f'{slug}.webp')
    sq.save(f, 'WEBP', quality=88, method=6)
    return f

def pieces(rgba, want):
    """The separate pictures on a sheet, in reading order (left to right, top to bottom)."""
    solid = rgba[..., 3] > 8
    h, w = solid.shape
    big = max(h, w)
    # Join the bits of one picture (sparkles, loose strokes) a little at a time until the sheet
    # splits into exactly the expected number of pictures.
    counts = []
    for grow in range(1, big // 20, max(1, big // 400)):
        lab, n = ndimage.label(ndimage.binary_dilation(solid, iterations=grow) if grow > 1 else solid)
        sizes = ndimage.sum(solid, lab, range(1, n + 1))
        major = [i + 1 for i in range(n) if sizes[i] > 0.12 * solid.sum() / want]
        counts.append(len(major))
        if len(major) == want:
            break
    else:
        sys.exit(f'Could not split the sheet into {want} pictures (found {sorted(set(counts))}); crop it or import them one at a time.')
    boxes = ndimage.find_objects(lab)
    box = lambda i: (boxes[i - 1][0].start, boxes[i - 1][1].start, boxes[i - 1][0].stop, boxes[i - 1][1].stop)
    # Little leftovers (a sparkle, a star) belong to the nearest picture.
    owner = {i: i for i in major}
    for i in range(1, n + 1):
        if i in owner or not boxes[i - 1]:
            continue
        y0, x0, y1, x1 = box(i)
        def gap(j):
            b0, a0, b1, a1 = box(j)
            return max(b0 - y1, y0 - b1, 0) ** 2 + max(a0 - x1, x0 - a1, 0) ** 2
        j = min(major, key=gap)
        if gap(j) < (big * 0.06) ** 2:
            owner[i] = j
    # Group into rows by vertical center, then sort each row left to right.
    cy = lambda i: (box(i)[0] + box(i)[2]) / 2
    order = sorted(major, key=cy)
    rows, row = [], []
    for i in order:
        if row and cy(i) - sum(cy(j) for j in row) / len(row) > h / 7:
            rows.append(row); row = []
        row.append(i)
    rows.append(row)
    ordered = [i for r in rows for i in sorted(r, key=lambda i: box(i)[1])]
    out = []
    for i in ordered:
        mine = np.isin(lab, [k for k, v in owner.items() if v == i]) & solid
        ys, xs = np.nonzero(mine)
        piece = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1].copy()
        piece[..., 3] = np.where(mine[ys.min():ys.max() + 1, xs.min():xs.max() + 1], piece[..., 3], 0)
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

if __name__ == "__main__":
    main()
