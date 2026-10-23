# multi.py spec.json out.jpg [--debug]
# spec: {"scene": "...png", "labels": "...", "items": [{"label": "poster", "page": "pages/x/page-2.png", "crop": [x0,y0,x1,y1]?}, ...]}
import sys, json, os, subprocess, cv2, numpy as np
spec = json.load(open(sys.argv[1])); out_p = sys.argv[2]
img = cv2.imread(spec['scene']); H, W = img.shape[:2]
cj = spec['scene'].replace('.png', '.items.json')
if not os.path.exists(cj):
    txt = subprocess.check_output([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'corners_multi.py'), spec['scene'], spec['labels']]).decode()
    open(cj, 'w').write(txt)
found = json.load(open(cj))
gray = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (5,5), 0)
edg = cv2.Canny(gray, 30, 90); ys, xs = np.nonzero(edg); P = np.stack([xs, ys], 1).astype(np.float32)
def inter(l1, l2):
    (vx1,vy1,x1,y1),(vx2,vy2,x2,y2) = l1, l2
    t = np.linalg.solve(np.array([[vx1,-vx2],[vy1,-vy2]]), [x2-x1, y2-y1])
    return np.array([x1+vx1*t[0], y1+vy1*t[0]], np.float32)
def refine(q):
    q0 = q.copy(); s = np.sqrt(cv2.contourArea(q0))
    for band in (max(6, min(14, s*0.06)), 4):
        lines = []
        for i in range(4):
            a_, b_ = q[i], q[(i+1)%4]; d = b_-a_; ln = np.linalg.norm(d); u = d/ln; nrm = np.array([-u[1], u[0]])
            rel = P - a_; t = rel@u; dist = np.abs(rel@nrm)
            sel = P[(dist < band) & (t > 0.05*ln) & (t < 0.95*ln)]
            if len(sel) < 15: lines.append((u[0],u[1],a_[0],a_[1])); continue
            rng = np.random.default_rng(i); bestn, bestin = 0, None
            for _ in range(400):
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
        except np.linalg.LinAlgError: return q
        if np.abs(qn-q0).max() > 0.08*s: return q
        q = qn
    return q
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
def place(it, q, res, dbg):
    page = cv2.imread(it['page'])
    if it.get('crop'): x0,y0,x1,y1 = it['crop']; page = page[y0:y1, x0:x1]
    ph, pw = page.shape[:2]
    if it.get('rot90'): page = np.ascontiguousarray(np.rot90(page, it['rot90'])); ph, pw = page.shape[:2]
    # turn the piece a quarter if its shape fits the paper better that way (a card lying sideways)
    top = (np.linalg.norm(q[1]-q[0]) + np.linalg.norm(q[2]-q[3]))/2; side = (np.linalg.norm(q[3]-q[0]) + np.linalg.norm(q[2]-q[1]))/2
    if it.get('rot') is not None: r = it['rot']
    else: r = 0 if (top > side) == (pw > ph) or abs(np.log(top/side)) < 0.12 else 1
    dst = np.roll(q, -r, axis=0)
    # pad the piece with white paper so it fills the paper without stretching
    ta = (top/side) if r == 0 else (side/top)
    if it.get('fit', 'pad') == 'pad' and abs(np.log(ta/(pw/ph))) > 0.08:
        if ta > pw/ph: padw = int(ph*ta) - pw; page = cv2.copyMakeBorder(page, 0, 0, padw//2, padw-padw//2, cv2.BORDER_CONSTANT, value=(255,255,255))
        else: padh = int(pw/ta) - ph; page = cv2.copyMakeBorder(page, padh//2, padh-padh//2, 0, 0, cv2.BORDER_CONSTANT, value=(255,255,255))
        ph, pw = page.shape[:2]
    src = np.array([[0,0],[pw,0],[pw,ph],[0,ph]], np.float32)
    M = cv2.getPerspectiveTransform(src, dst)
    quad = np.zeros((H*4, W*4), np.uint8); cv2.fillConvexPoly(quad, (q*4).astype(np.int32), 255)
    quad = cv2.resize(quad, (W,H), interpolation=cv2.INTER_AREA).astype(np.float32)/255
    pg = cv2.warpPerspective(page, M, (W,H), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_REPLICATE).astype(np.float32)
    pg = cv2.GaussianBlur(pg, (0,0), 0.5)
    inner = cv2.erode((quad>0.5).astype(np.uint8), np.ones((5,5),np.uint8))
    paperpix = ((hsv[...,1] < 50) & (hsv[...,2] > 120) & (inner>0)).astype(np.uint8)
    hole = ((inner>0) & (paperpix==0)).astype(np.uint8)*255
    # lighting map from the blank paper, worked out only around this piece (inpainting the whole frame is slow)
    bx, by, bw, bh = cv2.boundingRect(q.astype(np.int32)); m = 30
    x0, y0, x1, y1 = max(bx-m, 0), max(by-m, 0), min(bx+bw+m, W), min(by+bh+m, H)
    hm = cv2.dilate(hole, np.ones((7,7),np.uint8)) | ((inner==0).astype(np.uint8)*255)
    light = img.astype(np.float32).copy()
    sub = cv2.inpaint(img[y0:y1, x0:x1], hm[y0:y1, x0:x1], 9, cv2.INPAINT_TELEA)
    light[y0:y1, x0:x1] = cv2.GaussianBlur(sub.astype(np.float32), (0,0), 6)
    out_paper = pg/255.0 * light
    lv = cv2.cvtColor(light.clip(0,255).astype(np.uint8), cv2.COLOR_BGR2HSV)[...,2].astype(np.float32)
    diff = np.abs(img.astype(np.float32) - light).max(2)
    occ = ((hsv[...,1] > 50) | (hsv[...,2] < lv*0.7)) & (diff > 30)
    occ = cv2.morphologyEx(occ.astype(np.uint8), cv2.MORPH_OPEN, np.ones((3,3),np.uint8))
    occ = cv2.GaussianBlur(cv2.dilate(occ, np.ones((3,3),np.uint8)).astype(np.float32), (0,0), 1.2)
    a = (quad * (1-occ))[...,None]
    res = res*(1-a) + out_paper*a + np.random.normal(0, 2.0, res.shape).astype(np.float32)*a
    cv2.polylines(dbg, [q.astype(np.int32)], True, (0,0,255), 2); cv2.putText(dbg, it['label'], tuple(q[0].astype(int)), 0, 0.8, (0,0,255), 2)
    return res, dbg

res = img.astype(np.float32)
dbg = img.copy()
used = set()
for it in spec['items']:
    cands = [i for i, f in enumerate(found) if f['label'] == it['label'] and i not in used]
    if not cands: print('MISSING', it['label'], it['page']); continue
    cands.sort(key=lambda i: np.mean([c[0] for c in found[i]['corners']]))
    k = cands[0]; used.add(k)
    q = np.array(found[k]['corners'], np.float32)
    # put the corners in clockwise image order starting top-left, whatever order they came in
    c = q.mean(0); q = q[np.argsort(np.arctan2(q[:,1]-c[1], q[:,0]-c[0]))]
    q = np.roll(q, -int(np.argmin(q.sum(1))), axis=0)
    q = refine(q)
    res, dbg = place(it, q, res, dbg)
# paper the generator added beyond the plan gets a spare page, so no blank sheet is left in the photo
spares = list(spec.get('spares', []))
for i, f in enumerate(found):
    if i in used or not spares: continue
    used.add(i); sp = spares.pop(0)
    spec_extra = dict(sp, label=f['label']); found_i = i
    q = np.array(f['corners'], np.float32); c = q.mean(0); q = q[np.argsort(np.arctan2(q[:,1]-c[1], q[:,0]-c[0]))]
    q = refine(np.roll(q, -int(np.argmin(q.sum(1))), axis=0))
    res, dbg = place(spec_extra, q, res, dbg)
left = [f['label'] for i, f in enumerate(found) if i not in used]
if left: print('UNFILLED', left)
cv2.imwrite(out_p, res.clip(0,255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])
if '--debug' in sys.argv: cv2.imwrite(out_p.replace('.jpg', '-dbg.jpg'), dbg)
print('done', out_p)
