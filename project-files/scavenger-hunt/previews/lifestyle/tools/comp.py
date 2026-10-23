# Usage: comp.py scene.png page.png out.jpg [--rot N] [--debug]
import sys, cv2, numpy as np
scene_p, page_p, out_p = sys.argv[1:4]
rot = int(sys.argv[sys.argv.index('--rot')+1]) if '--rot' in sys.argv else 0
img = cv2.imread(scene_p); H, W = img.shape[:2]
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
import json, os, subprocess
cj = scene_p.replace('.png', '.corners.json')
if '--quad' in sys.argv: q = np.array(json.loads(sys.argv[sys.argv.index('--quad')+1]), np.float32)
else:
    if not os.path.exists(cj):
        open(cj, 'w').write(subprocess.check_output([sys.executable, os.path.join(os.path.dirname(__file__), 'corners.py'), scene_p]).decode())
    q = np.array(json.load(open(cj)), np.float32)
# refine: fit each side to the strongest straight edge near the rough corners (RANSAC, so hands don't pull it)
gray = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (5,5), 0)
edg = cv2.Canny(gray, 30, 90); ys, xs = np.nonzero(edg); P = np.stack([xs, ys], 1).astype(np.float32)
def inter(l1, l2):
    (vx1,vy1,x1,y1),(vx2,vy2,x2,y2) = l1, l2
    t = np.linalg.solve(np.array([[vx1,-vx2],[vy1,-vy2]]), [x2-x1, y2-y1])
    return np.array([x1+vx1*t[0], y1+vy1*t[0]], np.float32)
q0 = q.copy()
if '--norefine' not in sys.argv:
  for it, band in enumerate((14, 4)):
    lines = []
    for i in range(4):
        a_, b_ = q[i], q[(i+1)%4]; d = b_-a_; ln = np.linalg.norm(d); u = d/ln; nrm = np.array([-u[1], u[0]])
        rel = P - a_; t = rel@u; dist = np.abs(rel@nrm)
        sel = P[(dist < band) & (t > 0.03*ln) & (t < 0.97*ln)]
        if len(sel) < 30: lines.append((u[0],u[1],a_[0],a_[1])); continue
        rng = np.random.default_rng(i); bestn, bestin = 0, None
        for _ in range(500):
            p1, p2 = sel[rng.choice(len(sel), 2, replace=False)]
            dd = p2-p1; nn = np.linalg.norm(dd)
            if nn < 0.25*ln: continue
            m = np.array([-dd[1], dd[0]])/nn
            if abs(m@nrm) < 0.97: continue
            inl = np.abs((sel-p1)@m) < 1.5
            if inl.sum() > bestn: bestn, bestin = inl.sum(), inl
        if bestin is None or bestn < 0.3*ln: lines.append((u[0],u[1],a_[0],a_[1])); continue
        lines.append(tuple(cv2.fitLine(sel[bestin], cv2.DIST_L2, 0, 0.01, 0.01).ravel()))
    try: qn = np.array([inter(lines[(i-1)%4], lines[i]) for i in range(4)], np.float32)
    except np.linalg.LinAlgError: qn = q
    if np.abs(qn-q0).max() > 0.08*np.sqrt(cv2.contourArea(q0)): break
    q = qn
TL, TR, BR, BL = q
dst = np.array([TL,TR,BR,BL], np.float32)
dst = np.roll(dst, rot, axis=0)
page = cv2.imread(page_p); ph, pw = page.shape[:2]
src = np.array([[0,0],[pw,0],[pw,ph],[0,ph]], np.float32)
M = cv2.getPerspectiveTransform(src, dst)
# supersample the quad mask for a clean edge
quad = np.zeros((H*4, W*4), np.uint8); cv2.fillConvexPoly(quad, (dst*4).astype(np.int32), 255)
quad = cv2.resize(quad, (W,H), interpolation=cv2.INTER_AREA).astype(np.float32)/255
pg = cv2.warpPerspective(page, M, (W,H), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
pg = cv2.GaussianBlur(pg, (0,0), 0.5)
# paper lighting map: paper pixels inside quad, holes filled, smoothed
inner = cv2.erode((quad>0.5).astype(np.uint8), np.ones((5,5),np.uint8))
paperpix = ((hsv[...,1] < 50) & (hsv[...,2] > 120) & (inner>0)).astype(np.uint8)
hole = ((inner>0) & (paperpix==0)).astype(np.uint8)*255
fill = cv2.inpaint(img, cv2.dilate(hole, np.ones((7,7),np.uint8)) | ((inner==0).astype(np.uint8)*255), 9, cv2.INPAINT_TELEA)
light = cv2.GaussianBlur(fill.astype(np.float32), (0,0), 6)
out_paper = pg/255.0 * light
# occluders (hands, objects) inside the quad stay on top
lv = cv2.cvtColor(light.clip(0,255).astype(np.uint8), cv2.COLOR_BGR2HSV)[...,2].astype(np.float32)
diff = np.abs(img.astype(np.float32) - light).max(2)
occ = ((hsv[...,1] > 50) | (hsv[...,2] < lv*0.7)) & (diff > 30)
occ = cv2.morphologyEx(occ.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3,3),np.uint8))
occ = cv2.GaussianBlur(cv2.dilate(occ, np.ones((3,3),np.uint8)).astype(np.float32), (0,0), 1.2)
a = (quad * (1-occ))[...,None]
res = img.astype(np.float32)*(1-a) + out_paper*a
noise = np.random.normal(0, 2.0, res.shape).astype(np.float32)
res = (res + noise*a).clip(0,255).astype(np.uint8)
cv2.imwrite(out_p, res, [cv2.IMWRITE_JPEG_QUALITY, 92])
if '--debug' in sys.argv:
    cv2.polylines(img, [q0.astype(np.int32)], True, (255,0,0), 1)
    d = img.copy(); cv2.polylines(d, [dst.astype(np.int32)], True, (0,0,255), 2); cv2.circle(d, tuple(dst[0].astype(int)), 8, (0,255,0), -1)
    cv2.imwrite(out_p.replace('.jpg','-dbg.jpg'), d)
print('done', out_p, dst.astype(int).tolist())
