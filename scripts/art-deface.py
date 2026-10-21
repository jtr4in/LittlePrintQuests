# Paints the cute faces off food illustrations (src/kits/art), so food looks like food.
# Each entry is the picture and the box around its face, as fractions of the image (x0, y0, x1, y1).
# Inside the box, the eyes, mouth and blush are found by color and filled in from the colors around them.
# Usage: python3 scripts/art-deface.py [kit/name ...]
import os, sys
import numpy as np
import cv2
from PIL import Image
from scipy import ndimage

ART = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'src', 'kits', 'art')
FACES = {
    'christmas/cupcake': [(.28, .70, .72, .87)], 'christmas/donut': [(.28, .57, .73, .74)],
    'christmas/hot-cocoa': [(.13, .65, .63, .82)], 'christmas/milk': [(.13, .53, .73, .71)],
    'christmas/peppermint': [(.30, .45, .70, .60)], 'christmas/reindeer-carrot': [(.27, .43, .58, .73)],
    'construction/apple': [(.23, .50, .78, .72)], 'construction/cookie': [(.20, .40, .80, .63)],
    'construction/donut': [(.25, .12, .77, .32)], 'construction/milk': [(.20, .50, .80, .74)],
    'easter/chocolate-egg': [(.17, .50, .57, .73)], 'fire/1f372': [(.17, .60, .82, .86)],
    'fire/apple': [(.20, .50, .78, .72)], 'fire/chiefs-chili': [(.38, .47, .75, .63)],
    'fire/cookie': [(.18, .42, .83, .60)], 'fire/dog-treat': [(.27, .43, .72, .57)],
    'fire/hot-dog': [(.42, .50, .85, .78)], 'fire/juice-box': [(.18, .52, .58, .70)],
    'fire/milk': [(.23, .53, .72, .73)], 'halloween/candy-drop': [(.32, .40, .72, .62)],
    'halloween/lollipop': [(.27, .27, .68, .46)], 'hero/power-juice': [(.37, .57, .78, .75)],
    'ice/cocoa-sipping': [(.22, .67, .62, .82)], 'ice/frosty-cupcake': [(.28, .71, .70, .87)],
    'ice/ice-cream': [(.30, .36, .68, .51)], 'ice/peppermint': [(.32, .43, .70, .57)],
    'ice/snow-cookie': [(.30, .45, .68, .59)], 'ice/warm-soup': [(.25, .68, .72, .85)],
    'mermaid/kelp-bubble-tea': [(.32, .28, .68, .43), (.30, .74, .68, .90)], 'mermaid/watermelon': [(.28, .34, .75, .50)],
    'pirate/banana': [(.53, .41, .83, .56)], 'royal/crown-cookie': [(.20, .44, .85, .70)],
    'royal/cupcake': [(.28, .37, .72, .53)], 'royal/strawberries': [(.18, .44, .70, .65)],
    'space/comet-cookie': [(.05, .52, .46, .73)], 'space/milky-way-bar': [(.25, .53, .58, .78)],
    'space/moon-juice': [(.27, .56, .63, .71)], 'space/space-apple': [(.20, .53, .82, .74)],
    'unicorn/apple': [(.20, .53, .80, .74)], 'unicorn/candy-hills': [(.32, .28, .68, .45)],
    'unicorn/rainbow-oats': [(.28, .37, .52, .50)], 'valentine/candy-heart': [(.22, .41, .70, .58)],
    'valentine/chocolate': [(.20, .53, .60, .79)], 'valentine/cupcake': [(.40, .17, .57, .25), (.28, .78, .72, .88)],
    'valentine/shared-a-snack': [(.23, .36, .77, .58)],
}

def deface(name, boxes):
    path = os.path.join(ART, name + '.webp')
    im = np.asarray(Image.open(path).convert('RGBA')).copy()
    H, W = im.shape[:2]
    rgb = im[..., :3].astype(np.int16)
    inner = ndimage.binary_erosion(im[..., 3] > 128, iterations=max(4, W // 80))
    hole = np.zeros((H, W), bool)
    for x0, y0, x1, y1 in boxes:
        box = np.zeros((H, W), bool)
        box[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)] = True
        box &= inner
        if not box.any():
            continue
        mx = rgb.max(axis=2)
        dark = mx < 125
        med = np.median(rgb[box & ~dark], axis=0)
        diff = np.abs(rgb - med).sum(axis=2)
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        # blush: pinker than the surface around it
        pinker = (r - g) - (med[0] - med[1])
        blush = (r > 150) & (pinker > 18) & (diff > 30)
        features = box & (dark | ((mx < 160) & (diff > 110)))
        # the white sparkle inside each eye
        features = ndimage.binary_fill_holes(ndimage.binary_dilation(features, iterations=2))
        hole |= features | (box & blush)
    hole = ndimage.binary_dilation(hole, iterations=max(2, W // 160)) & inner
    bgr = cv2.cvtColor(im[..., :3].astype(np.uint8), cv2.COLOR_RGB2BGR)
    fixed = cv2.inpaint(bgr, hole.astype(np.uint8) * 255, max(5, W // 60), cv2.INPAINT_TELEA)
    im[..., :3] = cv2.cvtColor(fixed, cv2.COLOR_BGR2RGB)
    Image.fromarray(im).save(path, 'WEBP', quality=90)

if __name__ == '__main__':
    for name in sys.argv[1:] or FACES:
        deface(name, FACES[name])
        print('Cleaned', name)
