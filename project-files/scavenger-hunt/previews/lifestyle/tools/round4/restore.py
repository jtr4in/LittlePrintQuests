# restore.py scene.png loc.json items.json out.jpg [--debug]
# items.json: [{"label","piece":"cut.png","fit":"cover"|"contain"|"stretch","rot":0..3, "quad":[[x,y]..]? (manual override)}]
# loc.json from locate.py/zoomcorners.py; occluders in loc are kept on top (pixels from the scene)
import sys, json, cv2, numpy as np
scene_p, loc_p, items_p, out_p = sys.argv[1:5]
img = cv2.imread(scene_p); H, W = img.shape[:2]
loc = json.load(open(loc_p)); items = json.load(open(items_p))
gray = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), (3,3), 0)
edg = cv2.Canny(gray, 40, 110); ys, xs = np.nonzero(edg); P = np.stack([xs, ys], 1).astype(np.float32)
def inter(l1, l2):
    (vx1,vy1,x1,y1),(vx2,vy2,x2,y2) = l1, l2
    t = np.linalg.solve(np.array([[vx1,-vx2],[vy1,-vy2]]), [x2-x1, y2-y1])
    return np.array([x1+vx1*t[0], y1+vy1*t[0]], np.float32)
def refine(q, band0):
    q0 = q.copy(); s = np.sqrt(cv2.contourArea(q0))
    for band in (band0, 6, 3):
        lines = []
        for i in range(4):
            a_, b_ = q[i], q[(i+1)%4]; d = b_-a_; ln = np.linalg.norm(d); u = d/ln; nrm = np.array([-u[1], u[0]])
            rel = P - a_; t = rel@u; dist = np.abs(rel@nrm)
            sel = P[(dist < band) & (t > 0.1*ln) & (t < 0.9*ln)]
            if len(sel) < 15: lines.append((u[0],u[1],a_[0],a_[1])); continue
            rng = np.random.default_rng(i); bestn, bestin = 0, None
            for _ in range(600):
                p1, p2 = sel[rng.choice(len(sel), 2, replace=False)]
                dd = p2-p1; nn = np.linalg.norm(dd)
                if nn < 0.25*ln: continue
                m = np.array([-dd[1], dd[0]])/nn
                if abs(m@nrm) < 0.985: continue
                # prefer the outermost strong line: score inliers, tie-break by distance outward
                inl = np.abs((sel-p1)@m) < 1.5
                if inl.sum() > bestn: bestn, bestin = inl.sum(), inl
            if bestin is None or bestn < 0.35*ln: lines.append((u[0],u[1],a_[0],a_[1])); continue
            lines.append(tuple(cv2.fitLine(sel[bestin], cv2.DIST_L2, 0, 0.01, 0.01).ravel()))
        try: qn = np.array([inter(lines[(i-1)%4], lines[i]) for i in range(4)], np.float32)
        except np.linalg.LinAlgError: return q
        if np.abs(qn-q0).max() > 0.1*s: return q
        q = qn
    return q
def canon(q):
    q = np.array(q, np.float32); c = q.mean(0); q = q[np.argsort(np.arctan2(q[:,1]-c[1], q[:,0]-c[0]))]
    return np.roll(q, -int(np.argmin(q.sum(1))), axis=0)
byl = {p['label']: p for p in loc['pieces']}
res = img.astype(np.float32); dbg = img.copy()
occ = np.zeros((H,W), np.uint8)
for o in loc.get('occluders', []):
    if o['label'] in ('arm','twine'): continue
    cv2.fillPoly(occ, [np.array(o['polygon'], np.int32)], 255)
# tighten each occluder polygon with GrabCut so only the object itself stays on top
if occ.any():
    gc = np.where(cv2.dilate(occ, np.ones((25,25),np.uint8))>0, cv2.GC_PR_BGD, cv2.GC_BGD).astype(np.uint8)
    gc[occ>0] = cv2.GC_PR_FGD; gc[cv2.erode(occ, np.ones((21,21),np.uint8))>0] = cv2.GC_FGD
    bg, fg = np.zeros((1,65)), np.zeros((1,65))
    cv2.grabCut(img, gc, None, bg, fg, 5, cv2.GC_INIT_WITH_MASK)
    occ = cv2.erode(np.isin(gc, (cv2.GC_FGD, cv2.GC_PR_FGD)).astype(np.uint8)*255, np.ones((5,5),np.uint8))
for o in loc.get('hard_occluders', []): cv2.fillPoly(occ, [np.array(o, np.int32)], 255)
occf = cv2.GaussianBlur(occ.astype(np.float32)/255, (0,0), 1.0)
for it in items:
    q = canon(it['quad']) if it.get('quad') else canon(byl[it['label']].get('fine', byl[it['label']]['corners']))
    if it.get('refine', True): q = refine(q, it.get('band', 14))
    pc = cv2.imread(it['piece'], cv2.IMREAD_UNCHANGED)
    if pc.shape[2] == 3: pc = np.dstack([pc, np.full(pc.shape[:2], 255, np.uint8)])
    if it.get('rot'): pc = np.ascontiguousarray(np.rot90(pc, it['rot']))
    ph, pw = pc.shape[:2]
    # the old (generated) piece in rectified space
    top = (np.linalg.norm(q[1]-q[0]) + np.linalg.norm(q[2]-q[3]))/2; side = (np.linalg.norm(q[3]-q[0]) + np.linalg.norm(q[2]-q[1]))/2
    rw, rh = float(it.get('aspect', top/side)), 1.0  # true aspect of the generated paper, can be overridden for foreshortening
    Hq = cv2.getPerspectiveTransform(np.array([[0,0],[rw,0],[rw,rh],[0,rh]], np.float32), q)
    pa = pw/ph; fit = it.get('fit', 'cover')
    if fit == 'stretch': bw, bh = rw, rh
    elif (fit == 'cover') == (pa > rw/rh): bw, bh = rh*pa, rh
    else: bw, bh = rw, rw/pa
    ox, oy = (rw-bw)/2 + it.get('dx',0)*rw, (rh-bh)/2 + it.get('dy',0)*rh
    if it.get('anchor') == 'top': oy = 0.0
    g_ = it.get('grow', 1.0); ox -= bw*(g_-1)/2; oy -= bh*(g_-1)/2 if it.get('anchor') != 'top' else 0; bw *= g_; bh *= g_
    S = np.array([[bw/pw,0,ox],[0,bh/ph,oy],[0,0,1]])
    M = Hq @ S
    warp = cv2.warpPerspective(pc, M, (W,H), flags=cv2.INTER_AREA, borderMode=cv2.BORDER_CONSTANT, borderValue=(0,0,0,0)).astype(np.float32)
    a = warp[...,3]/255.0; col = warp[...,:3]
    # remove what is left of the generated piece outside the new one
    oldm = np.zeros((H,W), np.uint8); cv2.fillConvexPoly(oldm, q.astype(np.int32), 255); oldm = cv2.dilate(oldm, np.ones((7,7),np.uint8))
    if it.get('clear'): oldm = np.zeros((H,W), np.uint8); cv2.fillPoly(oldm, [np.array(it['clear'], np.int32)], 255)
    # only pixels that look unlike the surface around the old piece are left-over print; the rest is untouched surface
    ring0 = (cv2.dilate(oldm, np.ones((41,41),np.uint8))>0) & (oldm==0) & (occ==0)
    med = np.median(img[ring0], 0)
    far = (np.abs(img.astype(np.float32) - med).max(2) > it.get('tol', 28)).astype(np.uint8)
    far = cv2.dilate(cv2.morphologyEx(far, cv2.MORPH_OPEN, np.ones((3,3),np.uint8)), np.ones((it.get("fdil",5),)*2,np.uint8))
    left = ((oldm>0) & (a<0.5) & (occ==0) & (far>0)).astype(np.uint8)*255
    if left.any():
        bx, by, bw_, bh_ = cv2.boundingRect(oldm); m = 40
        x0, y0, x1, y1 = max(bx-m,0), max(by-m,0), min(bx+bw_+m,W), min(by+bh_+m,H)
        mode = it.get('fill', 'plane')
        if mode == 'plane':
            # flat surfaces (cardboard, wood): fit a smooth colour plane to the ring just outside the old piece
            ring = (cv2.dilate(oldm, np.ones((21,21),np.uint8))>0) & (oldm==0) & (occ==0)
            ry, rx = np.nonzero(ring[y0:y1,x0:x1]); cols = res[y0:y1,x0:x1][ry, rx]
            A_ = np.stack([np.ones_like(rx), rx, ry], 1).astype(np.float64)
            coef = np.linalg.lstsq(A_, cols, rcond=None)[0]
            gy, gx = np.mgrid[0:y1-y0, 0:x1-x0]
            G = np.stack([np.ones_like(gx), gx, gy], -1).astype(np.float64) @ coef
            fill = G.astype(np.float32) + np.random.normal(0, 2.5, G.shape).astype(np.float32)
        else:
            cur = res.clip(0,255).astype(np.uint8)
            allm = ((oldm>0) & (occ==0) & (far>0)).astype(np.uint8)*255
            fill = cv2.inpaint(cur[y0:y1,x0:x1], allm[y0:y1,x0:x1], 7, cv2.INPAINT_TELEA).astype(np.float32)
        lm = cv2.GaussianBlur(left[y0:y1,x0:x1].astype(np.float32)/255, (0,0), 1.5)[...,None]
        res[y0:y1,x0:x1] = res[y0:y1,x0:x1]*(1-lm) + fill*lm
    # light: the brightest paper in each tile of the old piece gives scene lighting + white balance
    R = cv2.warpPerspective(img, np.linalg.inv(Hq @ np.diag([1/240*rw*0+rw/240, 1/240, 1]) @ np.eye(3)) if False else np.linalg.inv(Hq @ np.array([[rw/240,0,0],[0,1/240,0],[0,0,1]])), (240,240)).astype(np.float32)
    g = np.zeros((3,3,3), np.float32)
    for i in range(3):
        for j in range(3):
            t = R[i*80:(i+1)*80, j*80:(j+1)*80].reshape(-1,3); lum = t.sum(1)
            g[i,j] = t[lum >= np.percentile(lum, 93)].mean(0)
    g = g * (it.get('bright', 1.0)/255.0)
    gl = cv2.resize(g, (240,240), interpolation=cv2.INTER_LINEAR)
    gl = cv2.GaussianBlur(gl, (0,0), 25)
    Lw = cv2.warpPerspective(gl, Hq @ np.array([[rw/240,0,0],[0,1/240,0],[0,0,1]]), (W,H), borderMode=cv2.BORDER_REPLICATE)
    out = (col*0.93 + 255*0.04) * Lw  # printed paper never hits pure black/white in a photo
    out = cv2.GaussianBlur(out, (0,0), 0.6) + np.random.normal(0, 1.8, out.shape).astype(np.float32)
    # thin shadow under the cut paper edge so it sits on its surface
    sh = cv2.GaussianBlur(a, (0,0), 3) * (1-a) * it.get('shadow', 0.25)
    res = res * (1 - sh[...,None])
    A = (a * (1 - occf))[...,None]
    res = res*(1-A) + out*A
    cv2.polylines(dbg, [q.astype(np.int32)], True, (0,0,255), 2); cv2.putText(dbg, it['label'], tuple(q[0].astype(int)), 0, 0.8, (0,0,255), 2)
cv2.imwrite(out_p, res.clip(0,255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])
if '--debug' in sys.argv:
    dbg[occ>0] = (dbg[occ>0]*0.5 + np.array([0,255,0])*0.5).astype(np.uint8); cv2.imwrite(out_p.replace('.jpg','-dbg.jpg'), dbg)
print('done', out_p)
