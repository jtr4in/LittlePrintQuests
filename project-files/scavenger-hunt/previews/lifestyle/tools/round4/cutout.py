# cutout.py page.png x0,y0,x1,y1 out.png [margin]  -> RGBA piece cut to shape with a thin white border, like cut with scissors
import sys, cv2, numpy as np
page = cv2.imread(sys.argv[1]); x0,y0,x1,y1 = map(int, sys.argv[2].split(','))
m = int(sys.argv[4]) if len(sys.argv) > 4 else 10
im = page[y0:y1, x0:x1]
g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY); hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
ink = ((g < 225) | (hsv[...,1] > 40)).astype(np.uint8)
ink = cv2.morphologyEx(ink, cv2.MORPH_CLOSE, np.ones((25,25),np.uint8))
# keep the big shapes, drop specks of confetti and tiny text far from the piece
n, lab, st, _ = cv2.connectedComponentsWithStats(ink)
keep = np.zeros_like(ink)
big = st[1:, cv2.CC_STAT_AREA].max()
for i in range(1, n):
    if st[i, cv2.CC_STAT_AREA] > big * 0.02: keep[lab == i] = 1
cnts,_ = cv2.findContours(keep, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
mask = np.zeros_like(keep); cv2.drawContours(mask, cnts, -1, 1, -1)
mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2*m+1, 2*m+1)))
# smooth scissor line
mask = (cv2.GaussianBlur(mask.astype(np.float32), (0,0), 3) > 0.5).astype(np.uint8)
ys, xs = np.nonzero(mask); bx0, by0, bx1, by1 = xs.min(), ys.min(), xs.max()+1, ys.max()+1
rgba = np.dstack([im, mask*255])[by0:by1, bx0:bx1]
cv2.imwrite(sys.argv[3], rgba); print(sys.argv[3], rgba.shape[1], rgba.shape[0])
