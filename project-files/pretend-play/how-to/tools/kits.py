# One cardboard build guide per play kit, drawn with the primitives in draw.py.
# Usage: python3 kits.py [kit ...]  -> writes howto/<kit>.html
import json, sys, math
from draw import *
from draw import S

KITS = json.load(open(f'{S}/howto/kits.json'))


def mix(c, t, f):
    a = [int(c[i:i+2], 16) for i in (1, 3, 5)]; b = [int(t[i:i+2], 16) for i in (1, 3, 5)]
    return '#%02x%02x%02x' % tuple(round(x + (y - x) * f) for x, y in zip(a, b))

def dark(c, f=.18): return mix(c, '#000000', f)
def light(c, f=.18): return mix(c, '#ffffff', f)

def paint(c):
    return dict(front=c, side=dark(c, .16), top=light(c, .14), tape=c, tape2=c)

INSIDE = '#5B3D25'


def open_box(x, y, w, h, d, c=None, hl=True):
    """A box with its top flaps cut off, so you can see inside."""
    c = {**CB, **(c or {})}
    dx, dy = depth(d)
    s = box(x, y, w, h, d, c, tape=False, hl=hl)
    inner = dark(c['front'], .45)
    s += f'<polygon points="{pts((x, y), (x+w, y), (x+w+dx, y+dy), (x+dx, y+dy))}" fill="{inner}"/>'
    s += f'<polygon points="{pts((x+w, y), (x+w+dx, y+dy), (x+dx, y+dy), (x+dx, y+dy+min(h, -dy)*.9), (x+w, y+min(h, -dy)*.9))}" fill="{dark(c["front"], .3)}" opacity=".0"/>'
    # inner back wall catches light; inner left wall in shadow
    s += f'<polygon points="{pts((x+dx, y+dy), (x+w+dx, y+dy), (x+w+dx*.55, y+dy*.55), (x+dx*.55, y+dy*.55))}" fill="{dark(c["front"], .22)}"/>'
    s += f'<polygon points="{pts((x, y), (x+dx, y+dy), (x+dx*.55, y+dy*.55))}" fill="{dark(c["front"], .55)}"/>'
    s += f'<polyline points="{pts((x, y), (x+w, y), (x+w+dx, y+dy), (x+dx, y+dy), (x, y))}" fill="none" stroke="{c["top"]}" stroke-width="5" stroke-linejoin="round"/>'
    return s


def open_front_box(x, y, w, h, d, c=None):
    """A box lying on its side with the front flaps cut off: a cubby you can see into."""
    c = {**CB, **(c or {})}
    dx, dy = depth(d)
    s = box(x, y, w, h, d, c, tape=False, hl=False)
    t = 7
    s += f'<rect x="{x+t}" y="{y+t}" width="{w-2*t}" height="{h-2*t}" fill="{dark(c["front"], .38)}"/>'
    # back wall, floor and left wall seen through the opening
    bx, by = x + t + dx*.45, y + t + dy*.45
    s += f'<rect x="{bx}" y="{by}" width="{w-2*t}" height="{h-2*t}" fill="{dark(c["front"], .2)}"/>'
    s += f'<polygon points="{pts((x+t, y+h-t), (x+w-t, y+h-t), (bx+w-2*t, by+h-2*t), (bx, by+h-2*t))}" fill="{dark(c["front"], .1)}"/>'
    s += f'<polygon points="{pts((x+t, y+t), (bx, by), (bx, by+h-2*t), (x+t, y+h-t))}" fill="{dark(c["front"], .45)}"/>'
    return s, (x + t, y + t, w - 2*t, h - 2*t)


def hole(d, col=INSIDE):
    return f'<path d="{d}" fill="{col}"/>'

def dashed(d, col=CUT, sw=4):
    return f'<path d="{d}" fill="none" stroke="{col}" stroke-width="{sw}" stroke-dasharray="11 7" stroke-linecap="round" stroke-linejoin="round"/>'

def folded(x1, y1, x2, y2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{FOLD}" stroke-width="4" stroke-dasharray="2 8" stroke-linecap="round"/>'

def arch_d(x, y, w, h):
    r = w / 2
    return f'M{x},{y+h} V{y+r} A{r},{r} 0 0 1 {x+w},{y+r} V{y+h} Z'

def arch_open_d(x, y, w, h):
    r = w / 2
    return f'M{x},{y+h} V{y+r} A{r},{r} 0 0 1 {x+w},{y+r} V{y+h}'

def rect_d(x, y, w, h, r=8):
    return f'M{x+r},{y} H{x+w-r} Q{x+w},{y} {x+w},{y+r} V{y+h-r} Q{x+w},{y+h} {x+w-r},{y+h} H{x+r} Q{x},{y+h} {x},{y+h-r} V{y+r} Q{x},{y} {x+r},{y} Z'

def three_sides_d(x, y, w, h, hinge):
    """Cut path for a door: every side but the hinge."""
    return {'left': f'M{x},{y} H{x+w} V{y+h} H{x}', 'right': f'M{x+w},{y} H{x} V{y+h} H{x+w}',
            'bottom': f'M{x},{y+h} V{y} H{x+w} V{y+h}', 'top': f'M{x},{y} V{y+h} H{x+w} V{y}'}[hinge]

def heart_d(cx, cy, s):
    return (f'M{cx},{cy+s*.9} C{cx-s*1.3},{cy+s*.1} {cx-s*.9},{cy-s*.9} {cx},{cy-s*.35} '
            f'C{cx+s*.9},{cy-s*.9} {cx+s*1.3},{cy+s*.1} {cx},{cy+s*.9} Z')

def door_open_left(x, y, w, h, col, k=.8):
    """A door hinged on its left edge, swung open toward you."""
    dx, dy = depth(w * k)
    return f'<polygon points="{pts((x, y), (x - dx, y - dy), (x - dx, y + h - dy), (x, y + h))}" fill="{col}"/>'

def flap_down(x, y, w, h, col, k=.75):
    """A flap hinged on its bottom edge, folded down toward you (oven door, drawbridge)."""
    dx, dy = depth(h * k)
    return f'<polygon points="{pts((x, y+h), (x+w, y+h), (x+w-dx, y+h-dy), (x-dx, y+h-dy))}" fill="{col}"/>'

def flap_up(x, y, w, h, col, k=.7):
    """A flap hinged on its top edge, propped up like an awning."""
    dx, dy = depth(h * k)
    return f'<polygon points="{pts((x, y), (x+w, y), (x+w-dx, y-dy), (x-dx, y-dy))}" fill="{col}"/>'

def wheel(cx, cy, r, tire='#2E2E36', hub='#F4F4F0'):
    return (f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{tire}"/><circle cx="{cx}" cy="{cy}" r="{r*.62}" fill="{hub}"/>'
            f'<circle cx="{cx}" cy="{cy}" r="{r*.62}" fill="none" stroke="#D9D9D2" stroke-width="3" stroke-dasharray="4 4"/><circle cx="{cx}" cy="{cy}" r="{r*.15}" fill="#C9CED8"/>')

def plate(cx, cy, r):
    return wheel(cx, cy, r, '#EDEDE6', '#FFFFFF')

def caps(x, y, n, gap=24, cols=('#E8513A', '#F4B63F', '#2F9A6B', '#2F7FD0')):
    return ''.join(f'<circle cx="{x + i*gap}" cy="{y}" r="8" fill="{cols[i % len(cols)]}"/><circle cx="{x + i*gap - 2}" cy="{y-2}" r="3" fill="#fff" opacity=".5"/>' for i in range(n))

def tube(x, y, w, h, col='#C9A27A'):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{col}"/><ellipse cx="{x+w/2}" cy="{y}" rx="{w/2}" ry="{w/5}" fill="{dark(col, .25)}"/>'
            f'<ellipse cx="{x+w/2}" cy="{y+h}" rx="{w/2}" ry="{w/5}" fill="{col}"/>')

def stars(pts_, col='#F4B63F', r=9):
    return ''.join(sparkle(x, y, r, col) for x, y in pts_)

def bear(cx, cy, s=1, col='#C98B55', ears='round'):
    e = (f'<circle cx="{-22}" cy="{-30}" r="11" fill="{col}"/><circle cx="22" cy="-30" r="11" fill="{col}"/>' if ears == 'round' else
         f'<ellipse cx="-27" cy="-14" rx="9" ry="19" fill="{dark(col, .2)}" transform="rotate(20 -27 -14)"/><ellipse cx="27" cy="-14" rx="9" ry="19" fill="{dark(col, .2)}" transform="rotate(-20 27 -14)"/>' if ears == 'floppy' else
         f'<circle cx="-14" cy="-36" r="9" fill="{col}"/><circle cx="14" cy="-36" r="9" fill="{col}"/>')
    return f'''<g transform="translate({cx},{cy}) scale({s})">
  <ellipse cx="0" cy="34" rx="30" ry="26" fill="{col}"/>{e}
  <circle cx="0" cy="-10" r="30" fill="{col}"/><ellipse cx="0" cy="0" rx="13" ry="10" fill="{light(col, .5)}"/>
  <circle cx="-10" cy="-14" r="3.5" fill="#3A3550"/><circle cx="10" cy="-14" r="3.5" fill="#3A3550"/><ellipse cx="0" cy="-3" rx="4" ry="3" fill="#3A3550"/>
  <circle cx="-19" cy="-3" r="5" fill="#F29C9C" opacity=".6"/><circle cx="19" cy="-3" r="5" fill="#F29C9C" opacity=".6"/></g>'''

def gift(x, y, w, h, col, rib='#fff'):
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{col}"/><rect x="{x + w/2 - 4}" y="{y}" width="8" height="{h}" fill="{rib}"/>'
            f'<rect x="{x}" y="{y + h*.35}" width="{w}" height="7" fill="{rib}" opacity=".8"/><path d="M{x+w/2},{y} q-14,-14 -16,-2 q2,8 16,2 q14,-14 16,-2 q-2,8 -16,2" fill="none" stroke="{rib}" stroke-width="4"/>')

def book(x, y, w, h, col, rot=0):
    return f'<g transform="rotate({rot} {x+w/2} {y+h/2})"><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="3" fill="{col}"/><rect x="{x+4}" y="{y}" width="5" height="{h}" fill="{dark(col, .2)}"/><rect x="{x+w*.35}" y="{y+h*.25}" width="{w*.45}" height="6" rx="3" fill="#fff" opacity=".7"/></g>'

def cutout(piece, label='CUT IT OUT', pw=None, round_=False, rot=-4):
    """Left: the kit page with a dashed cut line around the piece. Right: the piece cut out."""
    iw, ih = size(piece)
    ar = ih / iw
    pw = pw or (190 if ar < .9 else 150)
    ph = pw * ar
    sheet_w, sheet_h = 250, 320
    px, py = 55 + (sheet_w - pw) / 2 - 15, 50 + (sheet_h - ph) / 2
    a, _ = img(piece, px, py, pw)
    if round_:
        line = f'<ellipse cx="{px + pw/2}" cy="{py + ph/2}" rx="{pw/2 + 8}" ry="{ph/2 + 8}" fill="none" stroke="{CUT}" stroke-width="4" stroke-dasharray="11 7"/>'
    else:
        line = dashed_rect(px - 8, py - 8, pw + 16, ph + 16, 14)
    s = paper(40, 50, sheet_w, sheet_h, rot, a + line) + scissors(px + pw + 5, py + ph + 4, .9, 150)
    rw = min(240, 240 if ar < .9 else 190)
    b, rh = img(piece, 430, 205 - rw * ar / 2, rw, f'transform="rotate(3 {430 + rw/2} 205)"')
    return s + arrow(320, 200, 410, 175, -30) + f'<ellipse cx="{430 + rw/2}" cy="{205 + rw*ar/2 + 22}" rx="{rw/2}" ry="10" fill="#000" opacity=".06"/>' + b + label_(550, 395, label, CUT)

def label_(x, y, text, col, rot=-3, fs=19):
    return label(x, y, text, col, rot, fs)

def place(piece, x, y, w, extra=''):
    return img(piece, x, y, w, extra)[0]

def piece_h(piece, w):
    iw, ih = size(piece); return w * ih / iw

def side_piece(x, y, w, h, d, piece, u0, v0, uw):
    return side_image(x, y, w, h, d, piece, u0, v0, uw)

def needs_icons(*items):
    out = []
    lib = {
        'box': ('A box', ic_box()), 'bigbox': ('A big box', ic_box()), 'tallbox': ('A tall box', ic_box()),
        'longbox': ('A long box', ic_box()), 'shoebox': ('A shoebox', ic_box()), 'smallboxes': ('Small boxes', ic_box()),
        'scissors': ('Scissors', ic_scissors()), 'glue': ('Glue stick', ic_glue()), 'tape': ('Tape', ic_tape()),
        'plates': ('Paper plates', plate(60, 50, 34)), 'tubes': ('Paper towel tube', tube(48, 22, 24, 60)),
        'caps': ('Bottle caps', caps(36, 50, 3)), 'fastener': ('Paper fastener', '<circle cx="60" cy="40" r="12" fill="#D9B44A"/><rect x="56" y="48" width="3" height="34" fill="#C9A23A"/><rect x="61" y="48" width="3" height="30" fill="#C9A23A"/>'),
        'ribbon': ('String', '<path d="M20,70 C40,20 70,90 100,35" fill="none" stroke="#E8513A" stroke-width="5" stroke-linecap="round"/>'),
        'carton': ('Egg carton', '<rect x="18" y="40" width="84" height="34" rx="6" fill="#D8CBB6"/>' + ''.join(f'<ellipse cx="{30 + i*20}" cy="44" rx="8" ry="5" fill="#BFAF97"/>' for i in range(4))),
        'tissue': ('Tissue paper', '<path d="M24,80 L40,22 L58,80 Z" fill="#7FB2F0"/><path d="M50,80 L68,26 L86,80 Z" fill="#F4B63F"/><path d="M70,80 L86,32 L100,80 Z" fill="#E8513A"/>'),
        'paper': ('Shredded paper', ''.join(f'<path d="M{20 + i*9},{80 - (i % 3)*6} q6,-26 2,-46" fill="none" stroke="#E2C76B" stroke-width="4" stroke-linecap="round"/>' for i in range(10))),
        'cardboard': ('Spare cardboard', f'<rect x="22" y="22" width="76" height="60" rx="3" fill="{CB["top"]}"/><rect x="22" y="22" width="76" height="60" rx="3" fill="none" stroke="{CB["side"]}" stroke-width="3" stroke-dasharray="2 5"/>'),
        'marker': ('Marker', '<g transform="rotate(35 60 50)"><rect x="52" y="10" width="16" height="64" rx="5" fill="#3A3550"/><path d="M52,74 L68,74 L62,90 L58,90 Z" fill="#3A3550"/><rect x="52" y="10" width="16" height="20" rx="5" fill="#E8513A"/></g>'),
    }
    for it in items:
        if isinstance(it, tuple): out.append(it)
        else: out.append(lib[it])
    return out

def paint_need(col, label='Paint'):
    return (label, brush(60, 90, .9, 30, col) + paintpot(70, 50, col).replace('translate(70,50)', 'translate(48,42) scale(.8)'))

def page_need(piece, col, text):
    return (text, ic_pages(piece, col))

def kitdef(id_, tag=None):
    k = KITS[id_]; c = k['colors']
    return dict(main=c['main'], dark=c['dark'], soft=light(c['main'], .72), light=light(c['main'], .9),
                tagline=f"{(tag or k['name']).upper()} PLAY KIT · CARDBOARD BUILD")

GROWN = 'Grown-ups do all the box cutting with a craft knife. Kids paint, glue and play!'


# ---------------------------------------------------------------- AUTO: CAR WASH
def auto():
    k = kitdef('auto'); C = paint('#7FB2F0')
    X, Y, W, H, D = 240, 140, 210, 200, 300
    ax, ay, aw, ah = X + 30, Y + 40, W - 60, H - 40
    fringe = ''.join(f'<rect x="{ax + 8 + i*14}" y="{ay + 30 - abs(4.5 - i)*6}" width="10" height="{70 + (i % 3)*12}" rx="5" fill="{["#F4B63F", "#E8513A", "#2F9A6B", "#2F7FD0"][i % 4]}"/>' for i in range(10))
    s1 = box(X, Y, W, H, D) + label(150, 110, 'LONG BOX', '#7C5CC4', -6) + taperoll(560, 360, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + dashed(arch_open_d(ax, ay, aw, ah)) + knife(ax + aw + 40, ay + 40, 1, 160) + label(130, 300, 'CUT BOTH ENDS', CUT, -5)
    s3 = box(X, Y, W, H, D, C, tape=False) + hole(arch_d(ax, ay, aw, ah), '#2B3A55') + brush(560, 200, 1.1, 30, '#7FB2F0') + paintpot(600, 330, '#7FB2F0') + label(140, 120, 'PAINT IT', '#2F7FD0', -6)
    s4 = box(X, Y, W, H, D, C, tape=False) + hole(arch_d(ax, ay, aw, ah), '#2B3A55') + fringe + taperoll(590, 330, 1) + label(560, 120, 'PAPER STRIPS', '#2F9A6B', 4) + arrow(555, 145, ax + aw - 10, ay + 60, 25)
    sh = piece_h('auto-carwash', W - 30)
    backing = f'<rect x="{X + 8}" y="{Y - sh + 12}" width="{W - 16}" height="{sh + 8}" rx="4" fill="{CB["side"]}"/>'
    s6 = (box(X, Y, W, H, D, C, tape=False) + hole(arch_d(ax, ay, aw, ah), '#2B3A55') + fringe +
          backing + place('auto-carwash', X + 15, Y - sh + 20, W - 30) +
          f'<g transform="translate(150,300)"><rect x="-60" y="-26" width="120" height="44" rx="18" fill="#E8513A"/><rect x="-40" y="-46" width="74" height="28" rx="12" fill="#E8513A"/><rect x="-34" y="-42" width="30" height="20" rx="5" fill="#BFE3FF"/><rect x="4" y="-42" width="26" height="20" rx="5" fill="#BFE3FF"/>{wheel(-34, 20, 15)}{wheel(34, 20, 15)}</g>' +
          ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff" stroke="#9CC7F0" stroke-width="2"/>' for x, y, r in [(225, 210, 12), (205, 175, 8), (240, 160, 6), (520, 150, 10), (545, 120, 7)]))
    s5 = (box(X, Y, W, H, D, C, tape=False) + hole(arch_d(ax, ay, aw, ah), '#2B3A55') + fringe +
          backing + place('auto-carwash', X + 15, Y - sh + 20, W - 30) + glue(560, 300, 1, 25) + label(130, 130, 'SIGN ON TOP', '#7C5CC4', -6))
    steps = [
        ('Find a long box', 'A long box works best. Tape it shut and lay it on its side so a car can drive through.', svg(s1)),
        ('Cut an arch at both ends', 'A grown-up cuts a big arch in each end so toy cars can roll in one side and out the other.', svg(s2)),
        ('Paint it', 'Paint it bubbly blue and let it dry.', svg(s3)),
        ('Add the scrubbers', 'Tape colorful paper or tissue strips inside the top of each arch. They brush the cars clean!', svg(s4)),
        ('Glue on the Car Wash sign', 'Cut out the Car Wash sign, glue it to a piece of cardboard and tape it upright above the entrance.', svg(s5)),
        ('Wash a car!', 'Drive a toy car through the brushes. Scrub, rinse and shine!', svg(s6)),
    ]
    return page(k, 'Make a Car Wash', 'A long box, some paper strips and the Car Wash sign from your Auto Repair Shop kit.',
                needs_icons('longbox', 'scissors', 'glue', 'tape', 'tissue', page_need('auto-carwash', k['main'], 'Car Wash sign')), steps, GROWN)


# ---------------------------------------------------------------- BURGER: DRIVE-THRU
def burger():
    k = kitdef('burger'); C = paint('#E2782A')
    X, Y, W, H, D = 230, 70, 230, 320, 110
    wx, wy, ww, wh = X + 40, Y + 85, W - 80, 95
    def win():
        return (hole(rect_d(wx, wy, ww, wh, 4), '#4A2E1C') + flap_up(wx, wy, ww, wh, light(C['front'], .25), .55) +
                f'<rect x="{wx-6}" y="{wy+wh-2}" width="{ww+12}" height="12" rx="3" fill="{dark(C["front"], .25)}"/>')
    s1 = box(X, Y, W, H, D) + label(140, 110, 'TALL BOX', '#7C5CC4', -6) + taperoll(560, 350, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + dashed(three_sides_d(wx, wy, ww, wh, 'top')) + folded(wx, wy, wx + ww, wy) + knife(wx + ww + 60, wy + 70, 1, 160) + label(140, 270, 'CUT 3 SIDES', CUT, -5) + label(560, 120, 'FOLD UP', FOLD, 4)
    s3 = box(X, Y, W, H, D, C, tape=False) + win() + brush(560, 230, 1.1, 30, '#E2782A') + paintpot(600, 340, '#E2782A') + label(140, 120, 'PAINT IT', '#E2782A', -6)
    s4 = cutout('burger-drivethru', 'CUT OUT BOTH SIGNS')
    dh = piece_h('burger-drivethru', W - 30)
    oh = piece_h('burger-orderhere', W - 60)
    def signs():
        return place('burger-drivethru', X + 15, Y + 12, W - 30) + place('burger-orderhere', X + 30, wy + wh + 30, W - 60)
    s5 = box(X, Y, W, H, D, C, tape=False) + win() + signs() + glue(560, 300, 1, 25) + label(130, 300, 'GLUE ON', '#7C5CC4', -6)
    burger_ = f'''<g transform="translate({wx + ww/2 + 30},{wy + wh - 8})">
  <ellipse cx="0" cy="-6" rx="30" ry="15" fill="#E9A23B"/><rect x="-32" y="-2" width="64" height="7" rx="3" fill="#6BBF59"/>
  <rect x="-30" y="5" width="60" height="9" rx="4" fill="#7A4A2A"/><rect x="-30" y="14" width="60" height="7" rx="3" fill="#E9A23B"/></g>'''
    s6 = box(X, Y, W, H, D, C, tape=False) + win() + signs() + burger_ + bubble(560, 90, 'Order up!', '#E2782A') + stars([(170, 120), (600, 300)])
    steps = [
        ('Find a tall box', 'A big moving or diaper box works. Tape it shut and stand it up.', svg(s1)),
        ('Cut the window', 'A grown-up cuts a window on 3 sides and folds the top edge up, like a shutter.', svg(s2)),
        ('Paint it', 'Paint the box burger-shop orange and let it dry.', svg(s3)),
        ('Cut out the signs', 'Cut out the Drive-Thru sign and the Order Here sign from your kit.', svg(s4)),
        ('Glue them on', 'Glue Drive-Thru above the window and Order Here underneath.', svg(s5)),
        ('Open for orders!', 'Customers drive up, order, pay and get their burger through the window.', svg(s6)),
    ]
    return page(k, 'Make a Drive-Thru', 'One tall box + the Drive-Thru and Order Here signs from your Burger Shop kit.',
                needs_icons('tallbox', 'scissors', 'glue', 'tape', paint_need('#E2782A'), page_need('burger-drivethru', k['main'], 'Drive-Thru sign')), steps, GROWN)


# ---------------------------------------------------------------- CHRISTMAS: SLEIGH
def christmas():
    k = kitdef('christmas'); C = paint('#C62F38')
    X, Y, W, H, D = 150, 190, 330, 140, 150
    def curl(c=None):
        col = (c or CB)['front']
        return f'<path d="M{X+W-6},{Y+H} V{Y-30} q0,-60 50,-60 q36,0 36,32 q0,26 -26,26 q-18,0 -18,-16" fill="none" stroke="{col}" stroke-width="26" stroke-linecap="round"/>'
    def runners():
        return (f'<path d="M{X-10},{Y+H+30} H{X+W+40} q34,0 34,-34" fill="none" stroke="#F3C94F" stroke-width="10" stroke-linecap="round"/>'
                f'<rect x="{X+40}" y="{Y+H}" width="10" height="30" fill="#F3C94F"/><rect x="{X+W-60}" y="{Y+H}" width="10" height="30" fill="#F3C94F"/>')
    s1 = box(X, Y, W, H, D) + label(150, 120, 'LONG BOX', '#7C5CC4', -6) + dashed(f'M{X},{Y} H{X+W}', CUT) + label(560, 120, 'CUT OFF THE FLAPS', CUT, 4)
    s2 = open_box(X, Y, W, H, D) + f'<rect x="{X+W+20}" y="{Y-110}" width="90" height="190" rx="6" fill="{CB["top"]}" opacity=".9"/>' + dashed(f'M{X+W+30},{Y+70} V{Y-40} q0,-55 30,-55 q30,0 30,28 q0,20 -18,20', CUT) + scissors(X + W + 120, Y + 60, .9, 200) + label(150, 120, 'CUT A CURL', CUT, -6)
    s3 = open_box(X, Y, W, H, D) + curl() + runners() + label(150, 120, 'TAPE ON RUNNERS', '#B8901F', -6) + taperoll(600, 360, 1)
    s4 = open_box(X, Y, W, H, D, C) + curl(C) + runners() + brush(300, 120, 1.1, 30, '#C62F38') + paintpot(120, 330, '#C62F38')
    sw = 200; sh = piece_h('christmas-sleigh', sw)
    def sign(): return place('christmas-sleigh', X + (W - sw) / 2, Y + (H - sh) / 2, sw)
    s5 = open_box(X, Y, W, H, D, C) + curl(C) + runners() + sign() + glue(130, 230, 1, -20) + label(560, 400, 'GLUE ON THE SIDE', '#7C5CC4', -3)
    gifts = gift(X + 60, Y - 60, 70, 66, '#2F9A6B') + gift(X + 150, Y - 84, 80, 90, '#F3C94F', '#C62F38') + gift(X + 240, Y - 52, 60, 58, '#7FB2F0')
    s6 = open_box(X, Y, W, H, D, C) + gifts + f'<rect x="{X}" y="{Y}" width="{W}" height="{H}" fill="{C["front"]}"/>' + curl(C) + runners() + sign() + bubble(560, 70, 'Ho ho ho!', '#C62F38') + stars([(120, 100), (620, 220)])
    steps = [
        ('Find a long box', 'Pick a box a child can sit in. A grown-up cuts off the top flaps.', svg(s1)),
        ('Cut a sleigh curl', 'Cut a tall curly piece from a spare flap. It becomes the front of the sleigh.', svg(s2)),
        ('Tape on the curl and runners', 'Tape the curl to the front end. Add two long strips of cardboard underneath as runners.', svg(s3)),
        ('Paint it red', 'Paint the sleigh Christmas red and the runners gold.', svg(s4)),
        ('Glue on the Sleigh Launch sign', 'Cut out the Sleigh Launch sign from your kit and glue it on the side.', svg(s5)),
        ('Load the presents!', 'Pile in the wrapped toys, climb aboard and deliver them all. Mind the reindeer!', svg(s6)),
    ]
    return page(k, 'Make a Sleigh', 'A long box, spare cardboard and the Sleigh Launch sign from your Santa’s Workshop kit.',
                needs_icons('longbox', 'scissors', 'glue', 'tape', paint_need('#C62F38', 'Red paint'), page_need('christmas-sleigh', k['main'], 'Sleigh sign')), steps, GROWN)


# ---------------------------------------------------------------- COFFEE: COFFEE MACHINE
def coffee():
    k = kitdef('coffee'); C = paint('#5B5F6B')
    X, Y, W, H, D = 245, 80, 200, 290, 130
    nx, ny, nw, nh = X + 45, Y + 150, W - 90, 110
    def nook():
        return hole(rect_d(nx, ny, nw, nh, 6), '#2A2C33') + f'<rect x="{nx+nw/2-12}" y="{ny}" width="24" height="22" fill="#C9CED8"/><rect x="{nx+nw/2-6}" y="{ny+22}" width="12" height="10" fill="#9AA1AE"/><rect x="{nx+10}" y="{ny+nh-12}" width="{nw-20}" height="8" rx="3" fill="#9AA1AE"/>'
    s1 = box(X, Y, W, H, D) + label(140, 110, 'MEDIUM BOX', '#7C5CC4', -6) + taperoll(560, 350, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + dashed(rect_d(nx, ny, nw, nh, 6)) + knife(nx + nw + 60, ny + 30, 1, 160) + label(140, 330, 'CUT A NOOK', CUT, -5)
    s3 = box(X, Y, W, H, D, C, tape=False) + nook() + brush(560, 210, 1.1, 30, '#5B5F6B') + paintpot(600, 340, '#5B5F6B') + label(140, 120, 'PAINT IT', '#5B5F6B', -6)
    s4 = cutout('coffee-barista')
    sh = piece_h('coffee-barista', W - 30)
    def sign(): return place('coffee-barista', X + 15, Y + 14, W - 30)
    s5 = box(X, Y, W, H, D, C, tape=False) + nook() + sign() + caps(X + 50, Y + 28 + sh, 4, 32) + glue(560, 300, 1, 25) + label(130, 300, 'GLUE ON', '#7C5CC4', -6) + label(560, 120, 'BOTTLE-CAP BUTTONS', '#E8513A', 4) + arrow(550, 145, X + 150, Y + 30 + sh, 25)
    cup = f'<path d="M{nx+nw/2-24},{ny+nh-48} h48 l-6,44 h-36 z" fill="#fff"/><path d="M{nx+nw/2+24},{ny+nh-38} q16,4 0,22" fill="none" stroke="#fff" stroke-width="5"/><rect x="{nx+nw/2-3}" y="{ny+32}" width="6" height="22" fill="#7A4A2A"/>'
    steam = ''.join(f'<path d="M{nx+nw/2 + o},{ny-6} q-10,-16 0,-30 q10,-14 0,-28" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".0"/>' for o in (-12, 12))
    s6 = box(X, Y, W, H, D, C, tape=False) + nook() + cup + sign() + caps(X + 50, Y + 28 + sh, 4, 32) + bubble(570, 80, 'Brrrr-ew!', '#9A6340') + stars([(170, 120), (600, 290)]) + steam
    steps = [
        ('Find a box', 'A medium box, like a shoe-delivery box, works great. Tape it shut and stand it up.', svg(s1)),
        ('Cut a cup nook', 'A grown-up cuts a square hole near the bottom of the front, big enough for a cup.', svg(s2)),
        ('Paint it', 'Paint it silver-grey like a shiny coffee machine and let it dry.', svg(s3)),
        ('Cut out the sign', 'Cut out the Barista Bar sign from your kit.', svg(s4)),
        ('Glue on the sign and buttons', 'Glue the sign on top and add bottle caps as buttons underneath.', svg(s5)),
        ('Make a drink!', 'Pop a cup in the nook, press a button and serve a warm cocoa with a smile.', svg(s6)),
    ]
    return page(k, 'Make a Coffee Machine', 'One box, a few bottle caps and the Barista Bar sign from your Coffee Shop kit.',
                needs_icons('box', 'scissors', 'glue', 'caps', paint_need('#5B5F6B', 'Grey paint'), page_need('coffee-barista', k['main'], 'Barista sign')), steps, GROWN)


# ---------------------------------------------------------------- CONSTRUCTION: BRICKS
def construction():
    k = kitdef('construction')
    R = paint('#C8553D')
    def brick_lines(x, y, w, h):
        return f'<line x1="{x}" y1="{y+h/2}" x2="{x+w}" y2="{y+h/2}" stroke="#fff" stroke-width="3" opacity=".8"/><line x1="{x+w/2}" y1="{y}" x2="{x+w/2}" y2="{y+h/2}" stroke="#fff" stroke-width="3" opacity=".8"/><line x1="{x+w/4}" y1="{y+h/2}" x2="{x+w/4}" y2="{y+h}" stroke="#fff" stroke-width="3" opacity=".8"/><line x1="{x+3*w/4}" y1="{y+h/2}" x2="{x+3*w/4}" y2="{y+h}" stroke="#fff" stroke-width="3" opacity=".8"/>'
    def brick(x, y, w=110, h=56, d=50, painted=True, lines=True, shadow=True):
        s = box(x, y, w, h, d, R if painted else None, tape=not painted, hl=False)
        if not shadow: s = s.split('\n', 1)[1]
        return s + (brick_lines(x, y, w, h) if lines else '')
    s1 = brick(110, 250, 120, 70, 60, False, False) + brick(280, 210, 150, 110, 70, False, False) + brick(480, 270, 110, 60, 50, False, False) + label(350, 100, 'TISSUE, CEREAL & SNACK BOXES', '#7C5CC4', -3, 17)
    s2 = brick(150, 220, 150, 110, 70, False, False) + brick(380, 230, 150, 100, 70, True, False) + brush(560, 170, 1.1, 30, '#C8553D') + paintpot(600, 330, '#C8553D') + label(140, 120, 'PAINT THEM BRICK RED', '#C8553D', -6, 17)
    s3 = brick(230, 200, 220, 130, 90, True, False) + f'<path d="M230,265 H450 M340,200 V265 M285,265 V330 M395,265 V330" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="6 6"/>' + f'<g transform="translate(500,170) rotate(35)"><rect x="-8" y="-60" width="16" height="64" rx="5" fill="#fff" stroke="#C9CED8" stroke-width="2"/><path d="M-8,4 L8,4 L2,20 L-2,20 Z" fill="#fff" stroke="#C9CED8" stroke-width="2"/></g>' + label(140, 120, 'WHITE MARKER LINES', '#33373D', -6, 17)
    s4 = cutout('construction-brickyard')
    CR = paint('#F2A900')
    X, Y, W, H, D = 200, 200, 260, 150, 120
    sw = 220; sh = piece_h('construction-brickyard', sw)
    crate = open_box(X, Y, W, H, D, CR) + place('construction-brickyard', X + (W - sw) / 2, Y + (H - sh) / 2, sw)
    s5 = crate + glue(560, 300, 1, 25) + label(130, 140, 'GLUE ON THE CRATE', '#7C5CC4', -6, 17)
    wall = ''.join(brick(150 + c * 112 + (56 if r % 2 else 0), 300 - r * 58, 110, 56, 40, shadow=(r == 0)) for r in range(4) for c in range(3) if not (r % 2 and c == 2))
    s6 = wall + bubble(560, 80, 'Build it strong!', '#33373D') + stars([(120, 110), (620, 260)], '#F2A900')
    steps = [
        ('Collect small boxes', 'Save tissue boxes, snack boxes and cereal boxes. Tape them shut.', svg(s1)),
        ('Paint them', 'Paint every box brick red (or wrap them in red paper). Let them dry.', svg(s2)),
        ('Draw the bricks', 'Draw brick lines with a white marker or chalk pen.', svg(s3)),
        ('Cut out the sign', 'Cut out the Brick Yard sign from your kit.', svg(s4)),
        ('Make a brick crate', 'Cut the flaps off a bigger box and glue the Brick Yard sign on the front. The bricks live here.', svg(s5)),
        ('Build a wall!', 'Hard hats on! Stack the bricks into walls, towers and houses.', svg(s6)),
    ]
    return page(k, 'Make Cardboard Bricks', 'Small boxes from the recycling + the Brick Yard sign from your Construction Site kit.',
                needs_icons('smallboxes', 'scissors', 'glue', 'tape', paint_need('#C8553D', 'Red paint'), page_need('construction-brickyard', '#F2A900', 'Brick Yard sign')), steps, GROWN)


# ---------------------------------------------------------------- DENTIST: PRIZE BOX
def dentist():
    k = kitdef('dentist'); C = paint('#2A9FB4')
    X, Y, W, H, D = 210, 170, 270, 170, 180
    dx, dy = depth(D)
    cx, cy = X + W/2 + dx/2, Y + dy/2
    hole_top = f'<ellipse cx="{cx}" cy="{cy}" rx="52" ry="26" fill="#173F48"/>'
    dash_top = f'<ellipse cx="{cx}" cy="{cy}" rx="52" ry="26" fill="none" stroke="{CUT}" stroke-width="4" stroke-dasharray="11 7"/>'
    s1 = box(X, Y, W, H, D) + label(140, 110, 'SHOEBOX', '#7C5CC4', -6) + taperoll(570, 350, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + dash_top + knife(cx + 90, cy - 40, 1, 160) + label(140, 320, 'CUT A HAND HOLE', CUT, -5)
    s3 = box(X, Y, W, H, D, C, tape=False) + hole_top + brush(570, 200, 1.1, 30, '#2A9FB4') + paintpot(610, 340, '#2A9FB4') + label(140, 120, 'PAINT IT', '#2A9FB4', -6)
    s4 = cutout('dentist-prizebox')
    sw = 220; sh = piece_h('dentist-prizebox', sw)
    def sign(): return place('dentist-prizebox', X + (W - sw) / 2, Y + (H - sh) / 2, sw)
    s5 = box(X, Y, W, H, D, C, tape=False) + hole_top + sign() + glue(570, 300, 1, 25) + stars([(150, 200), (180, 260)], '#F48AA8') + label(130, 120, 'GLUE ON', '#7C5CC4', -6)
    hand = f'<g transform="translate({cx},{cy - 10})"><rect x="-14" y="-90" width="28" height="80" rx="12" fill="#F2C7A5"/><circle cx="0" cy="-96" r="22" fill="#F2C7A5"/></g>'
    prize = f'<g transform="translate({cx + 6},{cy - 120}) rotate(-12)">' + gift(-22, -22, 44, 40, '#F48AA8') + '</g>'
    s6 = box(X, Y, W, H, D, C, tape=False) + hole_top + hand + prize + sign() + bubble(570, 80, 'I was brave!', '#2A9FB4') + stars([(140, 140), (620, 260)])
    steps = [
        ('Find a shoebox', 'Tape the lid onto the box so it stays shut.', svg(s1)),
        ('Cut a hand hole', 'A grown-up cuts a round hole in the top, just big enough for a little hand.', svg(s2)),
        ('Paint it', 'Paint it sparkly-tooth blue and let it dry.', svg(s3)),
        ('Cut out the sign', 'Cut out the Prize Box sign from your kit.', svg(s4)),
        ('Glue it on', 'Glue the sign on the front and decorate with stars or stickers.', svg(s5)),
        ('Pick a prize!', 'Fill it with stickers and tiny toys. Every brave patient reaches in for a surprise.', svg(s6)),
    ]
    return page(k, 'Make a Prize Box', 'A shoebox + the Prize Box sign from your Dentist Office kit.',
                needs_icons('shoebox', 'scissors', 'glue', 'tape', paint_need('#2A9FB4'), page_need('dentist-prizebox', k['main'], 'Prize Box sign')), steps, GROWN)


# ---------------------------------------------------------------- DINO: DIG PIT
def dino():
    k = kitdef('dino')
    X, Y, W, H, D = 170, 210, 330, 120, 190
    def shreds():
        return ''.join(f'<path d="M{X + 30 + (i*29) % 290 + depth(D)[0]*((i*7) % 10)/14},{Y + depth(D)[1]*((i*7) % 10)/12 - 4} q8,-14 18,-4" fill="none" stroke="{["#E2C76B", "#D4A64A", "#F0DA94"][i % 3]}" stroke-width="6" stroke-linecap="round"/>' for i in range(40))
    def fill_top():
        dx, dy = depth(D)
        return f'<polygon points="{pts((X+6, Y-4), (X+W-6, Y-4), (X+W+dx-10, Y+dy+4), (X+dx+8, Y+dy+4))}" fill="#E8C97A"/>'
    s1 = box(X, Y - 40, W, H + 40, D) + dashed(f'M{X},{Y + 20} H{X+W} l{depth(D)[0]},{depth(D)[1]}', CUT) + knife(X + W + 70, Y + 10, 1, 160) + label(150, 110, 'CUT THE BOX DOWN LOW', CUT, -6, 17)
    s2 = open_box(X, Y, W, H, D) + label(150, 110, 'A SHALLOW DIG PIT', '#7C5CC4', -6, 17)
    s3 = open_box(X, Y, W, H, D) + fill_top() + shreds() + label(150, 110, 'FILL WITH SHREDDED PAPER', '#C98A2B', -6, 17)
    s4 = cutout('dino-puzzle', 'CUT THE PUZZLE PIECES', 170)
    sw = 200; sh = piece_h('dino-boneyard', sw)
    def sign(): return place('dino-boneyard', X + (W - sw) / 2, Y + (H - sh) / 2 + 4, sw)
    # puzzle pieces peeking out of the paper
    iw, ih = size('dino-puzzle')
    def pieces():
        out = ''
        for i, (px, py, r) in enumerate([(X + 60, Y - 30, -15), (X + 170, Y - 50, 10), (X + 260, Y - 26, 25)]):
            out += (f'<clipPath id="pc{i}"><rect x="{i*iw/3}" y="{(i % 2)*ih/2}" width="{iw/3}" height="{ih/2}"/></clipPath>'
                    f'<g transform="translate({px},{py}) rotate({r}) scale(.075) translate({-i*iw/3},{-(i % 2)*ih/2})"><image href="{uri("dino-puzzle")}" width="{iw}" height="{ih}" clip-path="url(#pc{i})"/></g>')
        return out
    s5 = open_box(X, Y, W, H, D) + fill_top() + pieces() + shreds() + sign() + glue(570, 300, 1, 25) + label(150, 110, 'BURY THE PIECES', '#4F6B3A', -6, 17)
    s6 = open_box(X, Y, W, H, D) + fill_top() + pieces() + shreds() + sign() + brush(X + 230, Y - 40, 1, -35, '#C98A2B') + bubble(560, 70, 'I found a bone!', '#4F6B3A') + stars([(130, 150), (620, 280)])
    steps = [
        ('Cut a box down low', 'A grown-up cuts a big box down to about a hand’s height all the way around.', svg(s1)),
        ('Now it’s a dig pit', 'You have a wide, shallow tray. Paint it if you like.', svg(s2)),
        ('Fill it up', 'Fill it with shredded paper, crinkle paper or dry beans.', svg(s3)),
        ('Cut out the T-Rex puzzle', 'Cut out the Rebuild the T-Rex puzzle from your kit along its puzzle lines.', svg(s4)),
        ('Bury the pieces', 'Hide the puzzle pieces in the pit and glue the Bone Yard sign on the front.', svg(s5)),
        ('Dig!', 'Brush away the paper to find every piece, then rebuild the T-Rex.', svg(s6)),
    ]
    return page(k, 'Make a Dino Dig Pit', 'One big box, shredded paper and the T-Rex puzzle from your Dino Dig Lab kit.',
                needs_icons('bigbox', 'scissors', 'glue', 'paper', ('Paintbrush', brush(60, 92, 1, 25, '#C98A2B')), page_need('dino-puzzle', k['main'], 'T-Rex puzzle')), steps, GROWN)


# ---------------------------------------------------------------- EASTER: DRYING RACK
def easter():
    k = kitdef('easter')
    X, Y, W, H, D = 150, 250, 380, 50, 220
    dx, dy = depth(D)
    def carton(x, y, cols=6, rows=2, w=56, scale=1):
        out = f'<polygon points="{pts((x, y), (x+cols*w, y), (x+cols*w+dx*.75, y+dy*.75), (x+dx*.75, y+dy*.75))}" fill="#D8CBB6"/>'
        for r in range(rows):
            for c in range(cols):
                cx = x + c*w + w/2 + dx*.75*(r + .5)/rows; cy = y + dy*.75*(r + .5)/rows
                out += f'<ellipse cx="{cx}" cy="{cy}" rx="{w*.38}" ry="{w*.2}" fill="#BFAF97"/>'
        return out
    def eggs():
        cols = ['#F48AA8', '#7FB2F0', '#F4B63F', '#6BBF59', '#B79BE0', '#F28C5B']
        out = ''
        for i, (r, c) in enumerate([(0, 0), (0, 2), (1, 1), (1, 3), (0, 4), (1, 5)]):
            cx = X + 30 + c*52 + 26 + dx*.75*(r + .5)/2; cy = Y + 8 + dy*.75*(r + .5)/2
            out += f'<ellipse cx="{cx}" cy="{cy - 16}" rx="17" ry="22" fill="{cols[i]}"/><path d="M{cx-15},{cy-16} q8,-6 15,0 q8,6 15,0" fill="none" stroke="#fff" stroke-width="3"/>'
        return out
    s1 = box(X, Y, W, H, D, tape=False) + carton(X + 380 - 330, 140, 6, 1, 50).replace('fill="#D8CBB6"', 'fill="#D8CBB6" transform="translate(-60,-60)"', 1) + label(150, 100, 'SHOEBOX LID + EGG CARTON', '#7C5CC4', -4, 16)
    s1 = box(X, Y, W, H, D, tape=False) + f'<g transform="translate(-20,-120)">{carton(X + 60, Y, 6, 2, 46)}</g>' + label(160, 90, 'LID + EGG CARTON', '#7C5CC4', -4, 17)
    CT = dict(front='#D8CBB6', side='#C7B89F', top='#E6DCCB')
    s2 = box(X + 40, Y - 60, 312, 70, 150, CT, tape=False, hl=False) + dashed(f'M{X + 40},{Y - 30} H{X + 352} l{depth(150)[0]},{depth(150)[1]}', CUT) + scissors(X + 400, Y - 50, 1, 160) + label(160, 360, 'CUT OFF THE CARTON LID', CUT, -4, 17)
    s3 = box(X, Y, W, H, D, tape=False) + carton(X + 30, Y + 8, 6, 2, 52) + glue(590, 300, 1, 25) + label(150, 110, 'GLUE IT IN THE LID', '#7C5CC4', -5)
    s4 = cutout('easter-dryingrack')
    sw = 200; sh = piece_h('easter-dryingrack', sw)
    stand = f'<polygon points="{pts((X + dx + 90, Y + dy - sh - 10), (X + dx + 110 + sw, Y + dy - sh - 10), (X + dx + 110 + sw + 20, Y + dy + 10), (X + dx + 80, Y + dy + 10))}" fill="{CB["front"]}"/>'
    def sign(): return stand + place('easter-dryingrack', X + dx + 100, Y + dy - sh - 4, sw)
    s5 = sign() + box(X, Y, W, H, D, tape=False) + carton(X + 30, Y + 8, 6, 2, 52) + label(140, 110, 'STAND IT UP BEHIND', '#7C5CC4', -5, 17)
    s6 = sign() + box(X, Y, W, H, D, tape=False) + carton(X + 30, Y + 8, 6, 2, 52) + eggs() + bubble(140, 90, 'Wet paint!', '#6F58A8') + stars([(610, 330), (120, 330)])
    steps = [
        ('Grab a lid and a carton', 'You need a shoebox lid and an empty egg carton.', svg(s1)),
        ('Cut off the carton lid', 'Cut the egg carton’s lid off so only the egg cups are left.', svg(s2)),
        ('Glue it in the tray', 'Glue the egg cups into the shoebox lid.', svg(s3)),
        ('Cut out the sign', 'Cut out the Drying Rack sign from your kit.', svg(s4)),
        ('Stand the sign up', 'Glue the sign to a strip of cardboard and stand it up behind the rack.', svg(s5)),
        ('Dry the eggs!', 'Pop each freshly painted egg in a cup to dry. Wet paint, please don’t touch!', svg(s6)),
    ]
    return page(k, 'Make an Egg Drying Rack', 'A shoebox lid, an egg carton and the Drying Rack sign from your Bunny Egg Factory kit.',
                needs_icons('shoebox', 'carton', 'scissors', 'glue', 'cardboard', page_need('easter-dryingrack', k['main'], 'Drying Rack sign')), steps, 'Plastic eggs work great and never crack!')


# ---------------------------------------------------------------- RIDE-IN VEHICLES (fire, police, racecar)
def vehicle(x, y, w, h, d, C, wheels='plates'):
    s = open_box(x, y, w, h, d, C)
    for wx in (x + 60, x + w - 60):
        s += plate(wx, y + h - 6, 34) if wheels == 'plates' else wheel(wx, y + h - 6, 34)
    return s

def straps(x, y, w, d, col='#F4B63F'):
    dx, dy = depth(d)
    out = ''
    for sx in (x + 90, x + w - 150):
        out += f'<path d="M{sx},{y} Q{sx + dx/2 - 6},{y + dy/2 - 90} {sx + dx},{y + dy}" fill="none" stroke="{col}" stroke-width="8" stroke-linecap="round"/>'
    return out

def fire():
    k = kitdef('fire'); C = paint('#C62828')
    X, Y, W, H, D = 140, 200, 360, 130, 150
    def ladder():
        return f'<g transform="translate({X + 50},{Y - 34})"><rect x="0" y="0" width="250" height="8" rx="3" fill="#E4E7ED"/><rect x="0" y="26" width="250" height="8" rx="3" fill="#E4E7ED"/>' + ''.join(f'<rect x="{10 + i*30}" y="0" width="7" height="34" fill="#E4E7ED"/>' for i in range(9)) + '</g>'
    def siren():
        return f'<g transform="translate({X + W - 30},{Y - 20})"><path d="M-16,0 L-12,-24 Q0,-34 12,-24 L16,0 Z" fill="#7FB2F0"/><rect x="-20" y="-2" width="40" height="8" rx="3" fill="#3A3550"/></g>'
    s1 = box(X, Y, W, H, D) + dashed(f'M{X},{Y} H{X+W}', CUT) + label(150, 110, 'CUT OFF TOP + BOTTOM FLAPS', CUT, -5, 16)
    s2 = open_box(X, Y, W, H, D, C) + brush(580, 160, 1.1, 30, '#C62828') + paintpot(610, 340, '#C62828') + label(150, 110, 'PAINT IT RED', '#C62828', -6)
    s3 = vehicle(X, Y, W, H, D, C) + label(560, 120, 'PAPER PLATE WHEELS', '#7C5CC4', 4, 17) + glue(610, 330, 1, 25)
    s4 = vehicle(X, Y, W, H, D, C) + ladder() + siren() + label(150, 110, 'CARDBOARD LADDER', '#B8901F', -5, 17) + label(570, 360, 'CUP SIREN', '#2F7FD0', 3)
    s5 = cutout('fire-sticker', 'CUT OUT THE BADGE', 160, True)
    sw = 100
    def badge(): return place('fire-sticker', X + W/2 - sw/2, Y + 6, sw)
    s6 = vehicle(X, Y, W, H, D, C) + ladder() + siren() + badge() + straps(X, Y, W, D) + bubble(570, 70, 'Nee-naw!', '#C62828') + stars([(110, 140), (630, 280)])
    steps = [
        ('Find a long box', 'Pick a box a child can stand in. A grown-up cuts off the top and bottom flaps.', svg(s1)),
        ('Paint it red', 'Paint the whole truck fire-engine red. Let it dry.', svg(s2)),
        ('Add wheels', 'Glue on paper plates as wheels, two on each side.', svg(s3)),
        ('Add a ladder and siren', 'Glue cardboard strips into a ladder on top, and a paper cup at the front as the siren.', svg(s4)),
        ('Cut out a rescue badge', 'Cut out a Rescue sticker from your kit.', svg(s5)),
        ('Roll out!', 'Glue the badge on the side, add ribbon shoulder straps, step in and race to the rescue.', svg(s6)),
    ]
    return page(k, 'Make a Fire Truck', 'A long box, paper plates and a rescue badge from your Fire Station kit.',
                needs_icons('longbox', 'scissors', 'glue', 'plates', paint_need('#C62828', 'Red paint'), ('Ribbon', '<path d="M20,70 C40,20 70,90 100,35" fill="none" stroke="#E8513A" stroke-width="7" stroke-linecap="round"/>')), steps, GROWN)


def steering(piece, x, y, w):
    return place(piece, x, y, w)

def police():
    k = kitdef('police'); C = paint('#2C4F9E')
    X, Y, W, H, D = 140, 210, 360, 120, 150
    def stripe(): return f'<rect x="{X}" y="{Y + 40}" width="{W}" height="34" fill="#fff"/>'
    def lights(): return f'<g transform="translate({X + 120},{Y - 2})"><path d="M-30,0 v-22 q15,-10 30,0 v22 Z" fill="#E8513A"/><path d="M0,0 v-22 q15,-10 30,0 v22 Z" fill="#2F7FD0"/><rect x="-34" y="-2" width="68" height="8" rx="3" fill="#3A3550"/></g>'
    def word(): return f'<text x="{X + W/2}" y="{Y + 66}" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="30" fill="#2C4F9E" letter-spacing="3">POLICE</text>'
    s1 = box(X, Y, W, H, D) + dashed(f'M{X},{Y} H{X+W}', CUT) + label(150, 110, 'CUT OFF TOP + BOTTOM FLAPS', CUT, -5, 16)
    s2 = open_box(X, Y, W, H, D, C) + stripe() + word() + brush(580, 160, 1.1, 30, '#2C4F9E') + paintpot(610, 340, '#2C4F9E') + label(150, 110, 'PAINT IT + WRITE POLICE', '#2C4F9E', -6, 16)
    s3 = cutout('police-wheel', 'CUT OUT THE WHEEL', 170, True)
    wx, wy, ww = 420, 120, 200
    s4 = (f'<circle cx="{wx + ww/2 + 8}" cy="{wy + ww/2 + 8}" r="{ww/2 + 6}" fill="{CB["front"]}"/>' + place('police-wheel', wx, wy, ww) +
          f'<circle cx="{wx + ww/2}" cy="{wy + ww/2}" r="9" fill="#D9B44A"/>' + plate(200, 210, 90) + arrow(300, 210, 400, 210, -20) +
          label(220, 360, 'GLUE ON A PLATE', '#7C5CC4', -3) + label(560, 360, 'PAPER FASTENER', '#B8901F', 3))
    def wheel_in(): return f'<g transform="translate({X + W - 150},{Y - 70})">' + place('police-wheel', 0, 0, 90) + '</g>'
    s5 = vehicle(X, Y, W, H, D, C) + stripe() + word() + wheel_in() + lights() + label(150, 110, 'WHEEL INSIDE THE FRONT', '#7C5CC4', -5, 17)
    s6 = vehicle(X, Y, W, H, D, C) + stripe() + word() + wheel_in() + lights() + straps(X, Y, W, D) + bubble(560, 70, 'Wee-woo!', '#2C4F9E') + stars([(110, 150), (630, 290)])
    steps = [
        ('Find a long box', 'Pick a box a child can stand in. A grown-up cuts off the top and bottom flaps.', svg(s1)),
        ('Paint it', 'Paint it police blue with a white stripe, then write POLICE on the side.', svg(s2)),
        ('Cut out the steering wheel', 'Cut out the Patrol Car Wheel from your kit.', svg(s3)),
        ('Make it spin', 'Glue it on a paper plate and push a paper fastener through the middle.', svg(s4)),
        ('Add the wheel and lights', 'Fasten the wheel inside the front, glue on plate wheels and red and blue cup lights.', svg(s5)),
        ('On patrol!', 'Add ribbon shoulder straps, step in and drive around town keeping everyone safe.', svg(s6)),
    ]
    return page(k, 'Make a Police Car', 'A long box, paper plates and the steering wheel from your Police Station kit.',
                needs_icons('longbox', 'scissors', 'glue', 'plates', 'fastener', page_need('police-wheel', k['main'], 'Steering wheel')), steps, GROWN)


def racecar():
    k = kitdef('racecar'); C = paint('#D7261E')
    X, Y, W, H, D = 140, 210, 360, 120, 150
    def stripe(): return f'<rect x="{X}" y="{Y + 52}" width="{W}" height="16" fill="#fff"/><rect x="{X}" y="{Y + 74}" width="{W}" height="8" fill="#fff"/>'
    def num(): return place('racecar-sticker', X + W/2 - 46, Y + 14, 92)
    def wheel_in(): return f'<g transform="translate({X + W - 150},{Y - 70})">' + place('racecar-wheel', 0, 0, 90) + '</g>'
    s1 = box(X, Y, W, H, D) + dashed(f'M{X},{Y} H{X+W}', CUT) + label(150, 110, 'CUT OFF TOP + BOTTOM FLAPS', CUT, -5, 16)
    s2 = open_box(X, Y, W, H, D, C) + stripe() + brush(580, 160, 1.1, 30, '#D7261E') + paintpot(610, 340, '#D7261E') + label(150, 110, 'PAINT IT + ADD STRIPES', '#D7261E', -6, 16)
    s3 = vehicle(X, Y, W, H, D, C, 'tires') + stripe() + label(560, 120, 'BLACK PLATE WHEELS', '#1B1B1F', 4, 17) + glue(610, 330, 1, 25)
    s4 = cutout('racecar-wheel', 'CUT OUT THE WHEEL', 170, True)
    dw = 170
    s5 = (vehicle(X, Y, W, H, D, C, 'tires') + stripe() + f'<g transform="translate({X + W - 150},{Y - 52})">' + place('racecar-dash', 0, 0, 120) + '</g>' + num() +
          glue(600, 330, 1, 25) + label(150, 110, 'DASHBOARD INSIDE', '#7C5CC4', -5) + label(560, 400, 'STICKER = RACE NUMBER', '#D7261E', 0, 16))
    s6 = vehicle(X, Y, W, H, D, C, 'tires') + stripe() + num() + wheel_in() + straps(X, Y, W, D) + f'<g transform="translate(580,150)"><rect x="-3" y="0" width="6" height="120" fill="#3A3550"/>' + ''.join(f'<rect x="{3 + c*14}" y="{r*14}" width="14" height="14" fill="{"#1B1B1F" if (r + c) % 2 else "#fff"}"/>' for r in range(4) for c in range(5)) + '</g>' + bubble(200, 90, 'Vroom!', '#D7261E')
    steps = [
        ('Find a long box', 'Pick a box a child can stand in. A grown-up cuts off the top and bottom flaps.', svg(s1)),
        ('Paint it', 'Paint it race-car red with white racing stripes.', svg(s2)),
        ('Add wheels', 'Paint four paper plates black and glue them on as tires.', svg(s3)),
        ('Cut out the steering wheel', 'Cut out the Racing Steering Wheel, glue it on a plate and fasten it inside the front.', svg(s4)),
        ('Dashboard and race number', 'Glue the speedometer inside the front so it peeks over the edge. A Racing sticker on the side is the race number.', svg(s5)),
        ('Ready, set, go!', 'Add ribbon shoulder straps, step in and race to the finish flag.', svg(s6)),
    ]
    return page(k, 'Make a Race Car', 'A long box, paper plates and the wheel, dashboard and stickers from your Pit Stop Garage kit.',
                needs_icons('longbox', 'scissors', 'glue', 'plates', 'fastener', page_need('racecar-wheel', k['main'], 'Steering wheel')), steps, GROWN)


# ---------------------------------------------------------------- HALLOWEEN (POTION SHOP): POTION COUNTER
def halloween():
    k = kitdef('halloween'); C = paint('#5E2F91')
    X, Y, W, H, D = 160, 170, 360, 180, 140
    def bottles():
        out = ''
        for i, (bx, col, h) in enumerate([(X + 60, '#6BBF59', 56), (X + 140, '#F28C5B', 70), (X + 230, '#7FB2F0', 50), (X + 300, '#F48AA8', 64)]):
            dx, dy = depth(D * .5)
            x = bx + dx; y = Y + dy
            out += f'<rect x="{x - 14}" y="{y - h}" width="28" height="{h}" rx="10" fill="{col}"/><rect x="{x - 6}" y="{y - h - 14}" width="12" height="16" fill="{col}"/><rect x="{x - 8}" y="{y - h - 20}" width="16" height="8" rx="3" fill="#8A6040"/><circle cx="{x - 5}" cy="{y - h + 14}" r="4" fill="#fff" opacity=".6"/>'
        return out
    def cauldron():
        dx, dy = depth(D * .5)
        return f'<g transform="translate({X + W/2 + dx},{Y + dy - 10})"><ellipse cx="0" cy="-30" rx="44" ry="12" fill="#2B2B33"/><path d="M-44,-30 Q-50,20 0,24 Q50,20 44,-30 Z" fill="#2B2B33"/><ellipse cx="0" cy="-30" rx="38" ry="8" fill="#9BE36B"/></g>'
    s1 = box(X, Y, W, H, D) + label(150, 110, 'WIDE BOX = COUNTER', '#7C5CC4', -6, 17) + taperoll(600, 360, 1.1)
    s2 = box(X, Y, W, H, D, C, tape=False) + brush(590, 170, 1.1, 30, '#5E2F91') + paintpot(615, 340, '#5E2F91') + label(150, 110, 'PAINT IT PURPLE', '#5E2F91', -6)
    s3 = cutout('halloween-counter')
    sw = 250; sh = piece_h('halloween-counter', sw)
    def sign(): return place('halloween-counter', X + (W - sw) / 2, Y + (H - sh) / 2, sw)
    s4 = box(X, Y, W, H, D, C, tape=False) + sign() + glue(600, 320, 1, 25) + label(150, 110, 'GLUE ON THE FRONT', '#7C5CC4', -6, 17)
    s5 = box(X, Y, W, H, D, C, tape=False) + sign() + stars([(X + 25, Y + 25), (X + W - 25, Y + 30), (X + 30, Y + H - 25), (X + W - 30, Y + H - 28)], '#F4B63F', 12) + label(150, 110, 'ADD STARS + MOONS', '#F4B63F', -6, 17)
    s6 = cauldron() + bottles() + box(X, Y, W, H, D, C, tape=False).split('\n', 1)[1] + sign() + stars([(X + 25, Y + 25), (X + W - 25, Y + 30)], '#F4B63F', 12) + bubble(140, 80, 'Bubble bubble!', '#5E2F91')
    s6 = box(X, Y, W, H, D, C, tape=False) + cauldron() + bottles() + sign() + stars([(X + 25, Y + 25), (X + W - 25, Y + 30), (X + 30, Y + H - 25), (X + W - 30, Y + H - 28)], '#F4B63F', 12) + bubble(150, 70, 'Bubble bubble!', '#5E2F91')
    steps = [
        ('Find a wide box', 'A wide, sturdy box makes the shop counter. Tape it shut.', svg(s1)),
        ('Paint it purple', 'Paint it a spooky purple and let it dry.', svg(s2)),
        ('Cut out the sign', 'Cut out the Potion Counter sign from your kit.', svg(s3)),
        ('Glue it on', 'Glue the sign on the front of the counter.', svg(s4)),
        ('Decorate', 'Add paper stars and moons around the sign.', svg(s5)),
        ('Brew a potion!', 'Set out a pot as the cauldron and some bottles. Take orders and stir, stir, stir!', svg(s6)),
    ]
    return page(k, 'Make a Potion Counter', 'One wide box + the Potion Counter sign from your Potion Shop kit.',
                needs_icons('box', 'scissors', 'glue', 'tape', paint_need('#5E2F91', 'Purple paint'), page_need('halloween-counter', k['main'], 'Counter sign')), steps, GROWN)


# ---------------------------------------------------------------- HERO: CAPE CLOSET
def hero():
    k = kitdef('hero'); C = paint('#1D3F91')
    X, Y, W, H, D = 250, 60, 190, 340, 120
    dx_, dy_, dw, dh = X + 30, Y + 110, W - 60, H - 120
    def doorway():
        return hole(rect_d(dx_, dy_, dw, dh, 4), '#14204A') + door_open_left(dx_, dy_, dw, dh, light(C['front'], .15)) + \
            f'<path d="M{dx_ + dw/2 - 20},{dy_ + 20} q20,-8 40,0 l14,110 q-34,14 -68,0 z" fill="#D62828"/><rect x="{dx_ + dw/2 - 3}" y="{dy_ + 6}" width="6" height="14" fill="#C9CED8"/>'
    s1 = box(X, Y, W, H, D) + label(140, 110, 'TALL BOX', '#7C5CC4', -6) + taperoll(560, 350, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + dashed(three_sides_d(dx_, dy_, dw, dh, 'left')) + folded(dx_, dy_, dx_, dy_ + dh) + knife(dx_ + dw + 60, dy_ + 60, 1, 160) + label(140, 300, 'CUT 3 SIDES', CUT, -5) + label(dx_ - 45, dy_ + dh/2, 'FOLD', FOLD, -90)
    s3 = box(X, Y, W, H, D, C, tape=False) + hole(rect_d(dx_, dy_, dw, dh, 4), '#14204A') + door_open_left(dx_, dy_, dw, dh, light(C['front'], .15)) + brush(570, 200, 1.1, 30, '#1D3F91') + paintpot(600, 340, '#1D3F91') + stars([(X + 40, Y + 40), (X + 150, Y + 70)], '#FFD60A', 12) + label(560, 90, 'PAINT + STARS', '#1D3F91', 4)
    s4 = cutout('hero-capecloset')
    sw = W - 30
    def sign(): return place('hero-capecloset', X + 15, Y + 12, sw)
    s5 = box(X, Y, W, H, D, C, tape=False) + doorway() + sign() + glue(570, 300, 1, 25) + label(560, 90, 'HANG A CAPE INSIDE', '#D62828', 4, 17)
    s6 = box(X, Y, W, H, D, C, tape=False) + doorway() + sign() + bubble(140, 90, 'Hero time!', '#1D3F91') + stars([(560, 160), (600, 300), (130, 300)], '#FFD60A', 14) + f'<path d="M530,240 l40,-30 M540,280 l50,-6 M530,320 l40,24" stroke="#FFD60A" stroke-width="6" stroke-linecap="round"/>'
    steps = [
        ('Find a tall box', 'A big appliance or diaper box works. Tape it shut and stand it up.', svg(s1)),
        ('Cut a door', 'A grown-up cuts a door on 3 sides. Fold the 4th side so it swings open.', svg(s2)),
        ('Paint it', 'Paint it hero blue and add yellow stars.', svg(s3)),
        ('Cut out the sign', 'Cut out the Cape Closet sign from your kit.', svg(s4)),
        ('Glue it over the door', 'Glue the sign above the door. Tape a hook or clothes peg inside for the cape.', svg(s5)),
        ('Quick change!', 'Step in, put on the cape and burst out as a superhero!', svg(s6)),
    ]
    return page(k, 'Make a Cape Closet', 'One tall box + the Cape Closet sign from your Hero HQ kit.',
                needs_icons('tallbox', 'scissors', 'glue', 'tape', paint_need('#1D3F91', 'Blue paint'), page_need('hero-capecloset', k['main'], 'Cape Closet sign')), steps, GROWN)


# ---------------------------------------------------------------- ICE: IGLOO DEN
def ice():
    k = kitdef('ice'); C = paint('#F4F8FC')
    C['side'] = '#D7E3F0'; C['top'] = '#FFFFFF'
    X, Y, W, H, D = 220, 120, 260, 230, 170
    ax, ay, aw, ah = X + 65, Y + 100, W - 130, H - 100
    def blocks():
        out = ''
        for r in range(4):
            yy = Y + r * 57
            out += f'<line x1="{X}" y1="{yy}" x2="{X + W}" y2="{yy}" stroke="#9CC7F0" stroke-width="3"/>'
            for c in range(5):
                xx = X + c * 60 + (30 if r % 2 else 0)
                if X < xx < X + W: out += f'<line x1="{xx}" y1="{yy}" x2="{xx}" y2="{yy + 57}" stroke="#9CC7F0" stroke-width="3"/>'
        return out
    s1 = box(X, Y, W, H, D) + label(140, 110, 'BIG BOX', '#7C5CC4', -6) + taperoll(580, 350, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + dashed(arch_open_d(ax, ay, aw, ah)) + knife(ax + aw + 60, ay + 40, 1, 160) + label(140, 320, 'CUT AN ARCH DOOR', CUT, -5)
    s3 = box(X, Y, W, H, D, C, tape=False) + hole(arch_d(ax, ay, aw, ah), '#2B3A55') + brush(580, 200, 1.1, 30, '#FFFFFF') + paintpot(610, 340, '#FFFFFF') + label(140, 120, 'PAINT IT WHITE', '#3F6FB5', -6)
    s4 = box(X, Y, W, H, D, C, tape=False) + blocks() + hole(arch_d(ax, ay, aw, ah), '#2B3A55') + f'<g transform="translate(590,190) rotate(35)"><rect x="-8" y="-60" width="16" height="64" rx="5" fill="#3F6FB5"/><path d="M-8,4 L8,4 L2,20 L-2,20 Z" fill="#3F6FB5"/></g>' + label(140, 120, 'DRAW ICE BLOCKS', '#3F6FB5', -6)
    s5 = cutout('ice-igloo')
    sw = 170
    def sign(): return place('ice-igloo', X + (W - sw) / 2, Y + 8, sw)
    s6 = box(X, Y, W, H, D, C, tape=False) + blocks() + hole(arch_d(ax, ay, aw, ah), '#2B3A55') + sign() + bear(ax + aw/2, ay + ah - 50, .85, '#FFFFFF', 'small') + bubble(580, 80, 'Brrr, cozy!', '#3F6FB5') + stars([(140, 120), (620, 300)], '#9CC7F0', 12)
    steps = [
        ('Find a big box', 'Tape it shut and stand it up.', svg(s1)),
        ('Cut an arch door', 'A grown-up cuts an arched doorway at the bottom of the front.', svg(s2)),
        ('Paint it white', 'Paint the whole box snowy white and let it dry.', svg(s3)),
        ('Draw the ice blocks', 'Draw ice-block lines all over with a blue marker.', svg(s4)),
        ('Cut out the sign', 'Cut out the Igloo Den sign from your kit and glue it above the door.', svg(s5)),
        ('Move in!', 'Polar bears, penguins and little ones crawl in for a cozy rest.', svg(s6)),
    ]
    return page(k, 'Make an Igloo Den', 'One big box + the Igloo Den sign from your Ice Palace kit.',
                needs_icons('bigbox', 'scissors', 'glue', 'marker', paint_need('#FFFFFF', 'White paint'), page_need('ice-igloo', k['main'], 'Igloo Den sign')), steps, GROWN)


# ---------------------------------------------------------------- ITALIAN: STOVE
def italian():
    k = kitdef('italian')
    C = paint('#E9E4DC'); C['side'] = '#CFC8BC'; C['top'] = '#F4F0EA'
    X, Y, W, H, D = 230, 130, 230, 240, 200
    dx, dy = depth(D)
    ox, oy, ow, oh = X + 30, Y + 70, W - 60, H - 100
    iw, ih = size('italian-stove')
    def top():
        # stovetop page glued flat on the top face
        a = W / iw; b = 0; c_ = dx / ih; d = dy / ih
        return f'<image href="{uri("italian-stove")}" width="{iw}" height="{ih}" transform="matrix({a:.5f},{b},{c_:.5f},{d:.5f},{X + 0:.1f},{Y + 0:.1f})" opacity="1"/>'
    def topflip():
        a = W / iw; c_ = -dx / ih; d = -dy / ih
        return f'<image href="{uri("italian-stove")}" width="{iw}" height="{ih}" transform="matrix({a:.5f},0,{c_:.5f},{d:.5f},{X + dx:.1f},{Y + dy:.1f})"/>'
    def oven(open_=False):
        if open_:
            return hole(rect_d(ox, oy, ow, oh, 4), '#2A2C33') + flap_down(ox, oy, ow, oh, '#D8D2C8', .55) + f'<rect x="{ox + 20}" y="{oy + oh - 30}" width="{ow - 40}" height="6" fill="#9AA1AE"/>'
        return f'<rect x="{ox}" y="{oy}" width="{ow}" height="{oh}" rx="6" fill="{dark(C["front"], .12)}"/><rect x="{ox + 20}" y="{oy + 20}" width="{ow - 40}" height="{oh - 50}" rx="6" fill="#3A3550" opacity=".85"/><rect x="{ox + 30}" y="{oy + oh - 20}" width="{ow - 60}" height="8" rx="4" fill="#9AA1AE"/>'
    s1 = box(X, Y, W, H, D) + label(140, 110, 'SQUARE-ISH BOX', '#7C5CC4', -6) + taperoll(580, 350, 1.2)
    s2 = cutout('italian-stove', 'CUT OUT THE STOVETOP', 150)
    s3 = box(X, Y, W, H, D, C, tape=False) + topflip() + glue(590, 290, 1, 25) + label(140, 120, 'GLUE ON TOP', '#7C5CC4', -6)
    s4 = box(X, Y, W, H, D, C, tape=False) + topflip() + oven() + dashed(three_sides_d(ox, oy, ow, oh, 'bottom')) + folded(ox, oy + oh, ox + ow, oy + oh) + knife(ox + ow + 70, oy + 40, 1, 160) + label(140, 330, 'CUT 3 SIDES', CUT, -5) + label(580, 400, 'FOLD DOWN', FOLD, 0)
    s5 = box(X, Y, W, H, D, C, tape=False) + topflip() + oven() + caps(X + 45, Y + 34, 4, 46) + label(560, 110, 'BOTTLE-CAP KNOBS', '#E8513A', 4, 17) + arrow(550, 135, X + 170, Y + 30, 25) + glue(600, 320, 1, 25)
    pot = f'<g transform="translate({X + W*.35 + dx*.5},{Y + dy*.5 - 8})"><path d="M-36,-30 h72 v26 q0,14 -14,14 h-44 q-14,0 -14,-14 z" fill="#9AA1AE"/><ellipse cx="0" cy="-30" rx="36" ry="8" fill="#C9CED8"/><rect x="-50" y="-26" width="14" height="6" rx="3" fill="#3A3550"/><rect x="36" y="-26" width="14" height="6" rx="3" fill="#3A3550"/>' + ''.join(f'<path d="M{o},-40 q-8,-14 0,-26 q8,-12 0,-24" fill="none" stroke="#C9CED8" stroke-width="5" stroke-linecap="round"/>' for o in (-14, 14)) + '</g>'
    s6 = box(X, Y, W, H, D, C, tape=False) + topflip() + pot + oven(True) + caps(X + 45, Y + 34, 4, 46) + bubble(150, 90, 'Buon appetito!', '#C8372D') + stars([(600, 300), (620, 140)])
    steps = [
        ('Find a box', 'A sturdy, square-ish box about knee-high. Tape it shut and stand it up.', svg(s1)),
        ('Cut out the stovetop', 'Cut out the stovetop page from your kit.', svg(s2)),
        ('Glue it on top', 'Glue the stovetop flat on the top of the box.', svg(s3)),
        ('Cut an oven door', 'A grown-up cuts a door in the front on 3 sides. Fold the bottom edge so it opens down.', svg(s4)),
        ('Add the knobs', 'Glue bottle caps along the front as the cooker knobs.', svg(s5)),
        ('Start cooking!', 'Put a pot on the stove and cook up some spaghetti. Bake the bread in the oven!', svg(s6)),
    ]
    return page(k, 'Make a Play Stove', 'One box, bottle caps and the stovetop from your Italian Restaurant kit.',
                needs_icons('box', 'scissors', 'glue', 'tape', 'caps', page_need('italian-stove', k['main'], 'Stovetop page')), steps, GROWN)


# ---------------------------------------------------------------- LIBRARY: BOOK DROP
def library():
    k = kitdef('library'); C = paint('#6A4FB3')
    X, Y, W, H, D = 210, 110, 270, 260, 140
    sx, sy, sw_, sh_ = X + 40, Y + 40, W - 80, 30
    dx, dy = depth(D)
    def slot(cut=True):
        return (hole(rect_d(sx, sy, sw_, sh_, 8), '#2A1C40') + f'<rect x="{sx}" y="{sy}" width="{sw_}" height="10" rx="5" fill="#140C22"/>') if cut else dashed(rect_d(sx, sy, sw_, sh_, 8))
    s1 = box(X, Y, W, H, D) + label(140, 110, 'BIG BOX', '#7C5CC4', -6) + taperoll(580, 350, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + slot(False) + knife(sx + sw_ + 60, sy + 20, 1, 160) + label(140, 250, 'BOOK-SIZED SLOT', CUT, -5)
    u0, u1, v0, v1 = .2, .8, .45, .9
    P = lambda u, v: (X + W + dx*u, Y + dy*u + H*v)
    door = (f'<polygon points="{pts(P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1))}" fill="{dark(CB["side"], .08)}"/>'
            f'<polyline points="{pts(P(u0,v1),P(u0,v0),P(u1,v0),P(u1,v1))}" fill="none" stroke="{CUT}" stroke-width="4" stroke-dasharray="10 7"/>'
            f'<line x1="{P(u0,v1)[0]}" y1="{P(u0,v1)[1]}" x2="{P(u1,v1)[0]}" y2="{P(u1,v1)[1]}" stroke="{FOLD}" stroke-width="4" stroke-dasharray="2 7" stroke-linecap="round"/>')
    s3 = box(X, Y, W, H, D, tape=False) + slot() + door + label(590, 200, 'CUT 3 SIDES', CUT, 4) + label(590, 395, 'FOLD', FOLD, 0)
    s4 = box(X, Y, W, H, D, C, tape=False) + slot() + brush(590, 200, 1.1, 30, '#6A4FB3') + paintpot(620, 340, '#6A4FB3') + label(140, 120, 'PAINT IT', '#6A4FB3', -6)
    pw = W - 50
    def sign(): return place('library-bookdrop', X + 25, sy + sh_ + 30, pw)
    s5 = cutout('library-bookdrop')
    clip = f'<clipPath id="bslot"><rect x="0" y="0" width="700" height="{sy + 12}"/></clipPath>'
    s6 = box(X, Y, W, H, D, C, tape=False) + slot() + clip + f'<g clip-path="url(#bslot)">' + book(sx + 60, sy - 70, 70, 90, '#F2A93B', -8) + '</g>' + sign() + bubble(580, 80, 'Thank you!', '#6A4FB3') + stars([(140, 130), (620, 290)])
    steps = [
        ('Find a big box', 'Tape it shut and stand it up.', svg(s1)),
        ('Cut a book slot', 'A grown-up cuts a wide slot near the top, big enough for a picture book.', svg(s2)),
        ('Add a door', 'On the side, cut a door on 3 sides and fold the 4th, so the librarian can take the books out.', svg(s3)),
        ('Paint it', 'Paint it library purple and let it dry.', svg(s4)),
        ('Cut out the sign', 'Cut out the Book Drop sign from your kit and glue it under the slot.', svg(s5)),
        ('Return a book!', 'Readers pop their books in the slot when they’re done. The librarian checks them back in.', svg(s6)),
    ]
    return page(k, 'Make a Book Drop', 'One big box + the Book Drop sign from your Library kit.',
                needs_icons('bigbox', 'scissors', 'glue', 'tape', paint_need('#6A4FB3', 'Purple paint'), page_need('library-bookdrop', '#F2A93B', 'Book Drop sign')), steps, GROWN)


# ---------------------------------------------------------------- MERMAID: TREASURE CHEST
def mermaid():
    k = kitdef('mermaid'); C = paint('#11798A'); G = '#F6D38A'
    X, Y, W, H, D = 200, 200, 290, 150, 160
    dx, dy = depth(D)
    def lid_open(col):
        # lid hinged at the back edge, swung open and leaning back
        return (f'<polygon points="{pts((X + dx, Y + dy), (X + W + dx, Y + dy), (X + W + dx + 10, Y + dy - 120), (X + dx + 10, Y + dy - 120))}" fill="{dark(col, .1)}"/>'
                f'<polygon points="{pts((X + dx + 10, Y + dy - 120), (X + W + dx + 10, Y + dy - 120), (X + W + dx + 30, Y + dy - 130), (X + dx + 30, Y + dy - 130))}" fill="{light(col, .1)}"/>')
    def trims(): return f'<rect x="{X}" y="{Y}" width="16" height="{H}" fill="{G}"/><rect x="{X + W - 16}" y="{Y}" width="16" height="{H}" fill="{G}"/><rect x="{X}" y="{Y}" width="{W}" height="12" fill="{G}"/>'
    def treasure():
        out = f'<polygon points="{pts((X + 8, Y), (X + W - 8, Y), (X + W + dx - 8, Y + dy + 6), (X + dx + 8, Y + dy + 6))}" fill="#E8D7B0"/>'
        for i, (px, py, col) in enumerate([(X + 70, Y - 18, '#fff'), (X + 120, Y - 30, '#F6D38A'), (X + 190, Y - 22, '#fff'), (X + 240, Y - 34, '#E8685B'), (X + 150, Y - 10, '#fff'), (X + 280, Y - 20, '#BFE9E4')]):
            out += f'<circle cx="{px}" cy="{py}" r="12" fill="{col}" stroke="#E2D8C6" stroke-width="2"/>'
        out += f'<path d="M{X + 200},{Y - 40} q-20,-30 0,-40 q20,10 0,40" fill="#F48AA8"/>'
        return out
    s1 = box(X, Y, W, H, D) + label(140, 110, 'SHOEBOX + LID', '#7C5CC4', -6) + taperoll(590, 360, 1.2)
    s2 = lid_open(CB['top']) + open_box(X, Y, W, H, D) + label(560, 90, 'TAPE THE LID AT THE BACK', '#7C5CC4', 3, 16) + taperoll(140, 330, 1)
    s3 = lid_open(C['top']) + open_box(X, Y, W, H, D, C) + trims() + brush(140, 200, 1.1, -30, G) + paintpot(110, 330, G) + label(560, 90, 'TEAL + GOLD TRIM', '#11798A', 3)
    s4 = cutout('mermaid-pearlvault')
    sw = 220; sh = piece_h('mermaid-pearlvault', sw)
    def sign(): return place('mermaid-pearlvault', X + (W - sw) / 2, Y + 28, sw)
    s5 = lid_open(C['top']) + open_box(X, Y, W, H, D, C) + trims() + sign() + glue(620, 320, 1, 25) + label(140, 110, 'GLUE ON THE FRONT', '#7C5CC4', -6, 17)
    s6 = lid_open(C['top']) + open_box(X, Y, W, H, D, C) + treasure() + trims() + sign() + bubble(140, 90, 'Pearls!', '#11798A') + stars([(620, 300), (600, 160)], G, 13)
    steps = [
        ('Find a shoebox', 'Any shoebox with a lid works.', svg(s1)),
        ('Make a hinge', 'Tape the lid to the box along the back edge so it opens like a chest.', svg(s2)),
        ('Paint it', 'Paint it sea teal with gold edges.', svg(s3)),
        ('Cut out the sign', 'Cut out the Pearl Vault sign from your kit.', svg(s4)),
        ('Glue it on', 'Glue the sign on the front of the chest.', svg(s5)),
        ('Fill with treasure!', 'Fill it with shells, beads and sea glass. Queen Coralie’s pearls are safe now!', svg(s6)),
    ]
    return page(k, 'Make a Treasure Chest', 'A shoebox + the Pearl Vault sign from your Mermaid Lagoon kit.',
                needs_icons('shoebox', 'scissors', 'glue', 'tape', paint_need('#11798A', 'Teal paint'), page_need('mermaid-pearlvault', k['main'], 'Pearl Vault sign')), steps, GROWN)


# ---------------------------------------------------------------- PETSHOP: PUPPY HOUSE
def petshop():
    k = kitdef('petshop'); C = paint('#F5B335'); RF = '#8A56C2'
    X, Y, W, H, D = 220, 170, 250, 190, 170
    dx, dy = depth(D)
    ax, ay, aw, ah = X + 60, Y + 60, W - 120, H - 60
    def roof():
        rh = 90; o = 18
        return (f'<polygon points="{pts((X + W/2, Y - rh), (X + W + o, Y + 8), (X + W + o + dx, Y + 8 + dy), (X + W/2 + dx, Y - rh + dy))}" fill="{RF}"/>'
                f'<polygon points="{pts((X - o, Y + 8), (X + W/2, Y - rh), (X + W/2 + dx, Y - rh + dy), (X - o + dx, Y + 8 + dy))}" fill="{light(RF, .2)}"/>'
                f'<polygon points="{pts((X - o, Y + 8), (X + W/2, Y - rh), (X + W + o, Y + 8))}" fill="{light(RF, .32)}"/>'
                f'<polygon points="{pts((X + 6, Y + 2), (X + W/2, Y - rh + 14), (X + W - 6, Y + 2))}" fill="{dark(C["front"], .1) if False else "#4A2E5E"}"/>')
    s1 = box(X, Y, W, H, D) + label(140, 110, 'BIG BOX', '#7C5CC4', -6) + taperoll(600, 360, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + dashed(arch_open_d(ax, ay, aw, ah)) + knife(ax + aw + 70, ay + 40, 1, 160) + label(140, 320, 'CUT AN ARCH DOOR', CUT, -5)
    s3 = box(X, Y, W, H, D, tape=False) + hole(arch_d(ax, ay, aw, ah)) + roof() + label(140, 110, 'FOLD A ROOF', FOLD, -6) + taperoll(610, 340, 1)
    s4 = box(X, Y, W, H, D, C, tape=False) + hole(arch_d(ax, ay, aw, ah)) + roof() + brush(600, 220, 1.1, 30, '#F5B335') + paintpot(630, 345, '#F5B335') + label(140, 110, 'PAINT IT', '#F5B335', -6)
    sw = 150
    def sign(): return place('petshop-puppy', X + (W - sw) / 2, Y + 12, sw * .0 + sw)
    s5 = cutout('petshop-puppy')
    bowl = f'<path d="M{X + W - 70},{Y + H - 6} h50 l-6,18 h-38 z" fill="#E8513A"/><ellipse cx="{X + W - 45}" cy="{Y + H - 6}" rx="25" ry="5" fill="#7A4A2A"/>'
    s6 = box(X, Y, W, H, D, C, tape=False) + hole(arch_d(ax, ay, aw, ah)) + roof() + bear(ax + aw/2, ay + ah - 46, .85, '#E9C08D', 'floppy') + bowl + place('petshop-puppy', X + W/2 - 60, Y - 78, 120) + bubble(590, 80, 'Woof!', '#8A56C2') + stars([(140, 140), (620, 300)])
    steps = [
        ('Find a big box', 'Big enough for a stuffed puppy. Tape it shut.', svg(s1)),
        ('Cut a doorway', 'A grown-up cuts an arched doorway in the front.', svg(s2)),
        ('Add a roof', 'Fold a big piece of cardboard in half and tape it on top as a pointy roof.', svg(s3)),
        ('Paint it', 'Paint the walls sunny yellow and the roof purple.', svg(s4)),
        ('Cut out the sign', 'Cut out the Puppy Corner sign from your kit.', svg(s5)),
        ('Welcome home, puppy!', 'Glue the sign on the roof, add a bowl and a blanket, and tuck a puppy in.', svg(s6)),
    ]
    return page(k, 'Make a Puppy House', 'A big box, spare cardboard and the Puppy Corner sign from your Pet Shop kit.',
                needs_icons('bigbox', 'scissors', 'glue', 'cardboard', paint_need('#F5B335', 'Paint'), page_need('petshop-puppy', '#F5B335', 'Puppy Corner sign')), steps, GROWN)


# ---------------------------------------------------------------- PIRATE: SHIP
def pirate():
    k = kitdef('pirate'); C = paint('#8A5A36')
    X, Y, W, H, D = 130, 230, 360, 120, 140
    def bow(c):
        dx, dy = depth(D)
        tip = (X + W + dx/2 + 120, Y + dy/2 - 30)
        return (f'<polygon points="{pts((X + W, Y), tip, (X + W + dx/2 + 30, Y + H + dy/2), (X + W, Y + H))}" fill="{light(c["side"], .12)}"/>'
                f'<polygon points="{pts((X + W, Y), (X + W + dx, Y + dy), tip)}" fill="{c["top"]}"/>')
    def planks(): return ''.join(f'<line x1="{X}" y1="{Y + 30*i}" x2="{X + W}" y2="{Y + 30*i}" stroke="{dark(C["front"], .2)}" stroke-width="3"/>' for i in range(1, 4))
    def mast():
        mx = X + W/2 + depth(D)[0]/2
        return (f'<rect x="{mx - 7}" y="{Y - 190}" width="14" height="{190 + depth(D)[1]/2 + 6}" fill="#C9A27A"/>'
                f'<path d="M{mx + 7},{Y - 175} q80,50 0,130 z" fill="#fff"/><path d="M{mx + 7},{Y - 175} q80,50 0,130" fill="none" stroke="#E2D8C6" stroke-width="3"/>'
                f'<path d="M{mx + 7},{Y - 190} l40,10 l-40,10 z" fill="#1F2F4D"/>')
    s1 = box(X, Y, W, H, D) + dashed(f'M{X},{Y} H{X+W}', CUT) + label(150, 110, 'CUT OFF THE TOP FLAPS', CUT, -5, 17)
    s2 = open_box(X, Y, W, H, D) + bow(CB) + label(150, 110, 'TAPE ON A POINTY BOW', '#7C5CC4', -5, 17) + taperoll(610, 360, 1)
    s3 = open_box(X, Y, W, H, D, C) + bow(C) + planks() + brush(600, 170, 1.1, 30, '#8A5A36') + paintpot(630, 350, '#8A5A36') + label(150, 110, 'PAINT ON PLANKS', '#8A5A36', -5)
    s4 = open_box(X, Y, W, H, D, C) + bow(C) + planks() + mast() + label(150, 110, 'TUBE MAST + PAPER SAIL', '#1F2F4D', -5, 17)
    sw = 230; sh = piece_h('pirate-ship', sw)
    def sign(): return place('pirate-ship', X + (W - sw) / 2, Y + (H - sh) / 2, sw)
    s5 = open_box(X, Y, W, H, D, C) + bow(C) + planks() + mast() + sign() + glue(620, 330, 1, 25) + label(150, 110, 'GLUE ON THE SIGN', '#7C5CC4', -5)
    iw, ih = size('pirate-spyglass')
    spy = (tube(80, 140, 90, 200, '#C9A27A').replace('<rect', '<rect', 1) + arrow(200, 240, 290, 220, -20) +
           f'<g transform="translate(340,150)">' + tube(0, 0, 90, 200, '#1F2F4D') + f'<image href="{uri("pirate-spyglass")}" x="0" y="20" width="90" height="{90 * ih / iw:.0f}" preserveAspectRatio="none"/></g>' +
           f'<g transform="translate(470,100)"><rect x="0" y="0" width="190" height="{190 * ih / iw:.0f}" fill="#fff"/>' + place('pirate-spyglass', 0, 0, 190) + '</g>' + label(200, 395, 'WRAP IT AROUND A TUBE', '#B8901F', -2, 17))
    s6 = open_box(X, Y, W, H, D, C) + bow(C) + planks() + mast() + sign() + bubble(560, 70, 'Land ho!', '#1F2F4D') + stars([(110, 150), (630, 300)], '#F1D48F', 12)
    steps = [
        ('Find a long box', 'Pick a box a child can sit in. A grown-up cuts off the top flaps.', svg(s1)),
        ('Add a pointy bow', 'Tape a triangle of spare cardboard to the front end.', svg(s2)),
        ('Paint it', 'Paint the ship brown and add dark plank lines.', svg(s3)),
        ('Add a mast and sail', 'Tape a paper towel tube inside as the mast. Add a paper sail and a flag.', svg(s4)),
        ('Glue on the sign', 'Cut out the Pirate Ship sign from your kit and glue it on the side.', svg(s5)),
        ('Set sail!', 'Wrap the Captain’s Spyglass page around a tube, climb aboard and look for land.', svg(s6)),
    ]
    return page(k, 'Make a Pirate Ship', 'A long box, a paper towel tube and the ship sign and spyglass from your Pirate Ship kit.',
                needs_icons('longbox', 'scissors', 'glue', 'tubes', paint_need('#8A5A36', 'Brown paint'), page_need('pirate-ship', k['main'], 'Ship sign')), steps, GROWN)


# ---------------------------------------------------------------- ROYAL: CASTLE
def royal():
    k = kitdef('royal'); C = paint('#BBA9D6')
    X, Y, W, H, D = 220, 140, 260, 220, 150
    dx, dy = depth(D)
    gx, gy, gw, gh = X + 75, Y + 120, W - 150, H - 120
    def battlements(c):
        out = ''
        for i in range(5):
            bx = X + i * 58
            out += box(bx, Y - 34, 30, 34, 0, c, tape=False, hl=False).split('\n', 1)[1]
        for i in range(1, 3):
            out += box(X + W + dx * i / 3 - 10, Y + dy * i / 3 - 34, 22, 34, 0, {**c, 'front': c['side']}, tape=False, hl=False).split('\n', 1)[1]
        return out
    def gate(open_):
        if not open_:
            return hole(arch_d(gx, gy, gw, gh), dark(C['front'], .25))
        return hole(arch_d(gx, gy, gw, gh), '#2A1C40') + flap_down(gx, gy + gw/2, gw, gh - gw/2, '#A0784C', .9) + f'<line x1="{gx}" y1="{gy + gw/2}" x2="{gx - 50}" y2="{gy + gh + 40}" stroke="#7A5A3A" stroke-width="3"/><line x1="{gx + gw}" y1="{gy + gw/2}" x2="{gx + gw - 50}" y2="{gy + gh + 40}" stroke="#7A5A3A" stroke-width="3"/>'
    def stones(): return ''.join(f'<rect x="{X + 20 + (i*53) % 220}" y="{Y + 20 + (i*37) % 180}" width="26" height="12" rx="4" fill="{dark(C["front"], .1)}"/>' for i in range(9))
    s1 = box(X, Y, W, H, D) + label(140, 110, 'BIG BOX', '#7C5CC4', -6) + taperoll(600, 360, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + dashed(arch_open_d(gx, gy, gw, gh).replace(f'M{gx},{gy+gh}', f'M{gx},{gy+gh}')) + folded(gx, gy + gh, gx + gw, gy + gh) + knife(gx + gw + 80, gy + 30, 1, 160) + label(140, 330, 'CUT THE ARCH', CUT, -5) + label(600, 400, 'FOLD', FOLD, 0)
    s3 = box(X, Y, W, H, D, tape=False) + battlements(CB) + gate(False) + label(140, 110, 'GLUE ON BATTLEMENTS', '#7C5CC4', -6, 17) + glue(610, 320, 1, 25)
    s4 = box(X, Y, W, H, D, C, tape=False) + battlements(C) + stones() + gate(False) + brush(610, 210, 1.1, 30, '#BBA9D6') + paintpot(630, 345, '#BBA9D6') + label(140, 110, 'PAINT THE STONES', '#7D5BA6', -6)
    s5 = cutout('royal-castle')
    sw = 160
    def sign(): return place('royal-castle', X + (W - sw) / 2, Y + 10, sw)
    flag = f'<rect x="{X + W/2 - 3}" y="{Y - 110}" width="6" height="80" fill="#7A5A3A"/><path d="M{X + W/2 + 3},{Y - 110} l50,14 l-50,14 z" fill="#F1D48F"/>'
    s6 = flag + box(X, Y, W, H, D, C, tape=False) + battlements(C) + stones() + gate(True) + sign() + bubble(150, 80, 'Lower the bridge!', '#7D5BA6') + stars([(610, 250), (600, 120)], '#F1D48F', 13)
    steps = [
        ('Find a big box', 'Tape it shut and stand it up.', svg(s1)),
        ('Cut a drawbridge', 'A grown-up cuts a tall arch on 3 sides and folds the bottom edge, so the bridge drops down.', svg(s2)),
        ('Add battlements', 'Glue a row of cardboard squares along the top edge.', svg(s3)),
        ('Paint it', 'Paint the castle lilac and add darker stones.', svg(s4)),
        ('Cut out the sign', 'Cut out the Royal Castle sign from your kit and glue it above the gate.', svg(s5)),
        ('Lower the drawbridge!', 'Tie string from the bridge to the castle wall. Pull to raise it, let go to welcome guests.', svg(s6)),
    ]
    return page(k, 'Make a Castle', 'One big box, spare cardboard and the sign from your Royal Castle kit.',
                needs_icons('bigbox', 'scissors', 'glue', 'cardboard', 'ribbon', page_need('royal-castle', k['main'], 'Castle sign')), steps, GROWN)


# ---------------------------------------------------------------- SPACE: ROCKET
def space():
    k = kitdef('space'); C = paint('#E9EEF6'); C['side'] = '#C9D3E3'; C['top'] = '#F5F7FB'
    X, Y, W, H, D = 270, 125, 170, 265, 110
    dx, dy = depth(D)
    px, py, pr = X + W/2, Y + 62, 38
    def cone():
        return (f'<polygon points="{pts((X - 6, Y + 2), (X + W/2 + dx/2, Y - 110), (X + W + dx + 6, Y + dy + 2), (X + W + 6, Y + 2))}" fill="#E8513A"/>'
                f'<polygon points="{pts((X - 6, Y + 2), (X + W/2 + dx/2, Y - 110), (X + W + 6, Y + 2))}" fill="#F26B1D"/>')
    def fins():
        return f'<polygon points="{pts((X, Y + H - 90), (X - 50, Y + H + 10), (X, Y + H))}" fill="#F26B1D"/><polygon points="{pts((X + W + dx*.5, Y + H + dy*.5 - 90), (X + W + dx*.5 + 50, Y + H + dy*.5 + 10), (X + W + dx*.5, Y + H + dy*.5))}" fill="#E8513A"/>'
    def window(cut=True):
        return (f'<circle cx="{px}" cy="{py}" r="{pr + 8}" fill="#9AA1AE"/><circle cx="{px}" cy="{py}" r="{pr}" fill="#14245A"/><circle cx="{px - 12}" cy="{py - 12}" r="9" fill="#fff" opacity=".35"/>') if cut else \
            f'<circle cx="{px}" cy="{py}" r="{pr}" fill="none" stroke="{CUT}" stroke-width="4" stroke-dasharray="11 7"/>'
    s1 = box(X, Y, W, H, D) + label(140, 110, 'TALL BOX', '#7C5CC4', -6) + taperoll(580, 360, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + window(False) + knife(px + 120, py + 10, 1, 160) + label(140, 250, 'CUT A ROUND WINDOW', CUT, -5, 17)
    s3 = box(X, Y, W, H, D, C, tape=False) + window() + brush(590, 200, 1.1, 30, '#E9EEF6') + paintpot(620, 340, '#C9D3E3') + label(140, 110, 'PAINT IT SILVER', '#2B4C9B', -6)
    s4 = cone() + box(X, Y, W, H, D, C, tape=False) + window() + fins() + label(130, 110, 'PAPER CONE', '#F26B1D', -6) + label(130, 360, 'CARDBOARD FINS', '#F26B1D', -4) + taperoll(600, 340, 1)
    sw = W - 24
    def signs(): return place('space-launchpad', X + 12, Y + H - piece_h('space-launchpad', sw) - 12, sw) + place('space-patch', X + W/2 - 24, py + pr + 12, 48)
    s5 = cutout('space-launchpad', 'CUT OUT THE SIGN + A PATCH')
    flames = f'<path d="M{X + 30},{Y + H + 2} q30,50 55,6 q30,56 55,0 q20,40 30,0" fill="#F4B63F"/><path d="M{X + 50},{Y + H + 2} q20,30 35,4 q22,34 35,0" fill="#F26B1D"/>'
    s6 = flames + cone() + box(X, Y, W, H, D, C, tape=False) + window() + fins() + signs() + bubble(140, 90, '3, 2, 1... Blast off!', '#2B4C9B') + stars([(600, 120), (620, 280), (560, 200)], '#FFD166', 12)
    steps = [
        ('Find a tall box', 'Tape it shut and stand it up.', svg(s1)),
        ('Cut a round window', 'A grown-up cuts a round porthole near the top. Trace a bowl to get a neat circle.', svg(s2)),
        ('Paint it silver', 'Paint the rocket silver or white and let it dry.', svg(s3)),
        ('Add a nose cone and fins', 'Roll poster paper into a cone and tape it on top. Tape two cardboard triangles on as fins.', svg(s4)),
        ('Cut out the sign and a patch', 'Cut out the Launch Pad sign and a Mission Patch from your kit. Glue them on the front.', svg(s5)),
        ('Blast off!', 'Tape orange tissue flames under the rocket, climb in and count down from 10!', svg(s6)),
    ]
    return page(k, 'Make a Rocket', 'One tall box, poster paper and the Launch Pad sign and patches from your Mission Control kit.',
                needs_icons('tallbox', 'scissors', 'glue', 'tissue', paint_need('#C9D3E3', 'Silver paint'), page_need('space-launchpad', k['main'], 'Launch Pad sign')), steps, GROWN)


# ---------------------------------------------------------------- UNICORN: STABLE
def unicorn():
    k = kitdef('unicorn'); C = paint('#F6D5E6'); C['side'] = '#E8B7D0'
    X, Y, W, H, D = 200, 110, 280, 255, 150
    dx_, dy_, dw, dh = X + 70, Y + 180, W - 140, H - 180
    def door(open_):
        if not open_:
            return f'<rect x="{dx_}" y="{dy_}" width="{dw}" height="{dh}" fill="{dark(C["front"], .08)}"/><path d="M{dx_},{dy_} L{dx_ + dw},{dy_ + dh} M{dx_ + dw},{dy_} L{dx_},{dy_ + dh}" stroke="{light(C["front"], .4)}" stroke-width="10"/>'
        return hole(rect_d(dx_, dy_ - 66, dw, dh + 66, 2), '#4A2E5E') + door_open_left(dx_, dy_, dw, dh, dark(C['front'], .08)) + f'<rect x="{dx_ + 6}" y="{dy_ + dh - 34}" width="{dw - 12}" height="34" fill="#F0DA94"/>' + ''.join(f'<path d="M{dx_ + 10 + i*12},{dy_ + dh - 28} q4,-14 10,-6" fill="none" stroke="#D4A64A" stroke-width="4" stroke-linecap="round"/>' for i in range(10))
    s1 = box(X, Y, W, H, D) + label(140, 110, 'BIG BOX', '#7C5CC4', -6) + taperoll(600, 360, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + dashed(f'M{dx_},{dy_ + dh} V{dy_ - 66} H{dx_ + dw} V{dy_ + dh}') + knife(dx_ + dw + 70, dy_, 1, 160) + label(140, 330, 'CUT THE DOORWAY', CUT, -5)
    s3 = box(X, Y, W, H, D, tape=False) + hole(rect_d(dx_, dy_ - 66, dw, dh + 66, 2), '#4A2E5E') + door_open_left(dx_, dy_, dw, dh, CB['front']) + label(140, 110, 'A HALF DOOR', FOLD, -6) + label(560, 400, 'HINGE WITH TAPE', '#7C5CC4', 0, 17)
    s4 = box(X, Y, W, H, D, C, tape=False) + door(False) + hole(rect_d(dx_, dy_ - 66, dw, 68, 2), '#4A2E5E') + brush(610, 200, 1.1, 30, '#F6D5E6') + paintpot(630, 345, '#E8B7D0') + label(140, 110, 'PAINT IT PINK', '#E8558F', -6)
    sw = 160
    def sign(): return place('unicorn-stable', X + (W - sw) / 2, Y + 8, sw)
    s5 = cutout('unicorn-stable')
    uni = bear(dx_ + dw/2, dy_ - 20, .75, '#FFFFFF', 'small') + f'<path d="M{dx_ + dw/2 - 5},{dy_ - 62} l5,-30 l5,30 z" fill="#F4B63F"/><path d="M{dx_ + dw/2 + 18},{dy_ - 48} q20,10 14,40" fill="none" stroke="#B79BE0" stroke-width="10" stroke-linecap="round"/>'
    s6 = box(X, Y, W, H, D, C, tape=False) + hole(rect_d(dx_, dy_ - 66, dw, 68, 2), '#4A2E5E') + uni + door(False) + sign() + bubble(590, 80, 'Neigh-ce!', '#8E5CC4') + stars([(140, 150), (620, 290)], '#F48AA8', 13)
    steps = [
        ('Find a big box', 'Tape it shut and stand it up.', svg(s1)),
        ('Cut the stall doorway', 'A grown-up cuts a tall doorway in the front.', svg(s2)),
        ('Make a half door', 'Tape a piece of cardboard over the bottom half, hinged on one side, so it swings like a stable door.', svg(s3)),
        ('Paint it', 'Paint the stable pink and draw a cross on the door.', svg(s4)),
        ('Cut out the sign', 'Cut out the Unicorn Stable sign from your kit and glue it above the stall.', svg(s5)),
        ('Unicorn, come home!', 'Add shredded yellow paper as hay and tuck in a unicorn for the night.', svg(s6)),
    ]
    return page(k, 'Make a Unicorn Stable', 'One big box, spare cardboard and the sign from your Unicorn Stable kit.',
                needs_icons('bigbox', 'scissors', 'glue', 'tape', 'paper', page_need('unicorn-stable', k['main'], 'Stable sign')), steps, GROWN)


# ---------------------------------------------------------------- VALENTINE: HEART MAILBOX
def valentine():
    k = kitdef('valentine'); C = paint('#F48AA8')
    X, Y, W, H, D = 210, 200, 280, 150, 170
    dx, dy = depth(D)
    hx, hy = X + W/2 + dx/2, Y + dy/2
    def heart(cut):
        d = f'M{hx},{hy + 14} C{hx - 50},{hy - 4} {hx - 36},{hy - 24} {hx},{hy - 10} C{hx + 36},{hy - 24} {hx + 50},{hy - 4} {hx},{hy + 14} Z'
        return (f'<path d="{d}" fill="#5A1530"/>' if cut else dashed(d))
    s1 = box(X, Y, W, H, D) + label(140, 110, 'SHOEBOX', '#7C5CC4', -6) + taperoll(600, 360, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + heart(False) + knife(hx + 90, hy - 40, 1, 160) + label(140, 330, 'CUT A HEART SLOT', CUT, -5)
    s3 = box(X, Y, W, H, D, C, tape=False) + heart(True) + brush(610, 210, 1.1, 30, '#F48AA8') + paintpot(630, 345, '#F48AA8') + label(140, 110, 'PAINT IT PINK', '#C2255C', -6)
    s4 = cutout('valentine-mailbox')
    sw = 210
    def sign(): return place('valentine-mailbox', X + (W - sw) / 2, Y + 10, sw)
    hearts = ''.join(f'<path d="{heart_d(x, y, 12)}" fill="#C2255C"/>' for x, y in [(X + 22, Y + 120), (X + W - 22, Y + 120)])
    s5 = box(X, Y, W, H, D, C, tape=False) + heart(True) + sign() + hearts + glue(620, 320, 1, 25) + label(140, 110, 'GLUE ON THE FRONT', '#7C5CC4', -6, 17)
    clip = f'<clipPath id="hslot"><rect x="0" y="0" width="700" height="{hy}"/></clipPath>'
    s6 = box(X, Y, W, H, D, C, tape=False) + heart(True) + clip + f'<g clip-path="url(#hslot)">' + envelope(hx, hy - 34, 80, 8).replace('#E8513A', '#C2255C') + '</g>' + sign() + hearts + bubble(140, 90, 'For you!', '#C2255C') + stars([(620, 300), (610, 140)], '#F48AA8', 13)
    steps = [
        ('Find a shoebox', 'Tape the lid on so it stays shut.', svg(s1)),
        ('Cut a heart slot', 'Draw a heart on the lid and a grown-up cuts it out. Make it wide enough for a card.', svg(s2)),
        ('Paint it', 'Paint the box valentine pink.', svg(s3)),
        ('Cut out the sign', 'Cut out the Mailbox sign from your kit.', svg(s4)),
        ('Glue it on', 'Glue the sign on the front and add paper hearts.', svg(s5)),
        ('Post a valentine!', 'Write a kind card, pop it in the heart and deliver them all at the end of the day.', svg(s6)),
    ]
    return page(k, 'Make a Valentine Mailbox', 'A shoebox + the Mailbox sign from your Valentine Post Office kit.',
                needs_icons('shoebox', 'scissors', 'glue', 'tape', paint_need('#F48AA8', 'Pink paint'), page_need('valentine-mailbox', k['main'], 'Mailbox sign')), steps, GROWN)


# ---------------------------------------------------------------- VET: X-RAY MACHINE
def vet():
    k = kitdef('vet'); C = paint('#E9F2EF'); C['side'] = '#C5D8D1'; C['top'] = '#F4F9F7'
    X, Y, W, H, D = 210, 130, 280, 230, 140
    dx, dy = depth(D)
    wx, wy, ww, wh = X + 40, Y + 80, W - 80, H - 110
    def screen(): return hole(rect_d(wx, wy, ww, wh, 6), '#14202A')
    def slot(cut=True):
        s = f'<polygon points="{pts((X + 40 + dx*.2, Y + dy*.2), (X + W - 40 + dx*.2, Y + dy*.2), (X + W - 40 + dx*.28, Y + dy*.28), (X + 40 + dx*.28, Y + dy*.28))}"'
        return s + (' fill="#14202A"/>' if cut else f' fill="none" stroke="{CUT}" stroke-width="4" stroke-dasharray="10 6"/>')
    s1 = box(X, Y, W, H, D) + label(140, 110, 'BIG BOX', '#7C5CC4', -6) + taperoll(600, 360, 1.2)
    s2 = box(X, Y, W, H, D, tape=False) + dashed(rect_d(wx, wy, ww, wh, 6)) + slot(False) + knife(wx + ww + 80, wy + 40, 1, 160) + label(140, 330, 'CUT A BIG WINDOW', CUT, -5) + label(590, 70, 'SLOT ON TOP, BEHIND IT', CUT, 3, 16)
    s3 = box(X, Y, W, H, D, C, tape=False) + screen() + slot() + brush(610, 210, 1.1, 30, '#E9F2EF') + paintpot(630, 345, '#C5D8D1') + label(140, 110, 'PAINT IT WHITE', '#2A9D8F', -6)
    s4 = cutout('vet-xray', 'CUT OUT THE X-RAYS', 190)
    sw = 170
    def sign(): return place('vet-xrayroom', X + (W - sw) / 2, Y + 6, sw)
    s5 = box(X, Y, W, H, D, C, tape=False) + screen() + slot() + sign() + caps(X + W - 60, Y + H - 16, 2, 26) + glue(620, 320, 1, 25) + label(140, 110, 'GLUE ON THE SIGN', '#7C5CC4', -6, 17)
    xr, xh = img('vet-xray', wx + 8, wy + 6, ww - 16)
    clipr = f'<clipPath id="scr"><rect x="{wx}" y="{wy}" width="{ww}" height="{wh}" rx="6"/></clipPath>'
    card_up = f'<g transform="translate({X + W/2 + dx*.24 - 50},{Y + dy*.24 - 60}) rotate(-4)"><rect width="100" height="70" rx="4" fill="#1B2A3A"/></g>'
    s6 = box(X, Y, W, H, D, C, tape=False) + screen() + clipr + f'<g clip-path="url(#scr)">{xr}</g>' + slot() + sign() + caps(X + W - 60, Y + H - 16, 2, 26) + bear(110, 300, .9) + bubble(580, 80, 'All healthy!', '#2A9D8F') + stars([(620, 280)])
    steps = [
        ('Find a big box', 'Tape it shut and stand it up.', svg(s1)),
        ('Cut a window and a slot', 'A grown-up cuts a big window in the front, then a thin slot in the top just behind it.', svg(s2)),
        ('Paint it', 'Paint the machine clinic white and let it dry.', svg(s3)),
        ('Cut out the X-rays', 'Cut out the Pet X-Ray cards from your kit.', svg(s4)),
        ('Glue on the sign', 'Glue the X-Ray Room sign on top and add bottle-cap buttons.', svg(s5)),
        ('Take an X-ray!', 'Patient holds still... drop an X-ray card in the slot and it shows in the window!', svg(s6)),
    ]
    return page(k, 'Make an X-Ray Machine', 'One big box + the X-Ray Room sign and X-ray cards from your Vet Clinic kit.',
                needs_icons('bigbox', 'scissors', 'glue', 'caps', paint_need('#E9F2EF', 'White paint'), page_need('vet-xray', '#1B2A3A', 'X-ray cards')), steps, GROWN)


# ---------------------------------------------------------------- GROCERY: STORE SHELF
def grocery():
    k = kitdef('grocery')
    X, Y, W, H, D = 200, 110, 300, 260, 140
    def shelf_in(c=None):
        s, (ix, iy, iw, ih) = open_front_box(X, Y, W, H, D, c)
        dx, dy = depth(D * .45)
        sy = iy + ih / 2
        s += f'<polygon points="{pts((ix, sy), (ix + iw, sy), (ix + iw + dx, sy + dy), (ix + dx, sy + dy))}" fill="{CB["top"]}"/><rect x="{ix}" y="{sy}" width="{iw}" height="12" fill="{CB["front"]}"/>'
        return s, (ix, iy, iw, ih, sy)
    s1 = box(X, Y, W, H, D) + dashed(f'M{X},{Y} H{X+W} V{Y+H} H{X} Z', CUT) + label(140, 100, 'CUT OFF THE FRONT FLAPS', CUT, -5, 17)
    b2, _ = open_front_box(X, Y, W, H, D)
    s2 = b2 + label(150, 100, 'A BIG CUBBY', '#7C5CC4', -6) + f'<rect x="560" y="300" width="120" height="40" fill="{CB["top"]}"/>' + label(600, 380, 'SPARE CARDBOARD', '#7C5CC4', 0, 17)
    b3, (ix, iy, iw, ih, sy) = shelf_in()
    s3 = b3 + label(140, 100, 'TAPE IN A SHELF', '#7C5CC4', -6) + taperoll(620, 340, 1)
    s4 = cutout('grocery-label0', 'CUT OUT SHELF LABELS', 150)
    def labels():
        out = ''
        for i, n in enumerate(['grocery-label0', 'grocery-label1', 'grocery-label2']):
            out += place(n, ix + 14 + i * (iw - 28) / 3, sy + 14, (iw - 28) / 3 - 10)
        return out
    def food():
        out = ''
        for i in range(4):
            x = ix + 22 + i * 62
            out += f'<rect x="{x}" y="{sy - 54}" width="40" height="52" rx="5" fill="{["#E8513A", "#F4B63F", "#2F9A6B", "#7FB2F0"][i]}"/><rect x="{x}" y="{sy - 40}" width="40" height="18" fill="#fff" opacity=".7"/>'
        for i in range(3):
            x = ix + 30 + i * 80
            out += f'<rect x="{x}" y="{iy + ih - 70}" width="52" height="68" rx="4" fill="{["#F28C5B", "#B79BE0", "#6BBF59"][i]}"/><circle cx="{x + 26}" cy="{iy + ih - 40}" r="12" fill="#fff" opacity=".7"/>'
        return out
    s5 = b3 + labels() + glue(620, 320, 1, 25) + label(140, 100, 'GLUE ON THE LABELS', '#7C5CC4', -6, 17)
    sw = 200
    s6 = b3 + food() + labels() + place('grocery-pantry', X + (W - sw)/2 + 40, Y - 80, sw) + bubble(140, 80, 'Fresh today!', '#3A9D4F') + stars([(620, 300)])
    steps = [
        ('Find a big box', 'Tape it shut, then a grown-up cuts the flaps off one side.', svg(s1)),
        ('Turn it into a cubby', 'Lay it on its side with the open part facing you.', svg(s2)),
        ('Add a shelf', 'Cut a piece of cardboard to fit and tape it across the middle.', svg(s3)),
        ('Cut out the labels', 'Cut out the Shelf and Bin Labels from your kit.', svg(s4)),
        ('Label the shelves', 'Glue the labels along the shelf edges.', svg(s5)),
        ('Stock the shelves!', 'Fill it with pantry boxes and cans, then glue the Pantry sign on top. The store is open!', svg(s6)),
    ]
    return page(k, 'Make a Store Shelf', 'One big box, spare cardboard and the labels from your Grocery Store kit.',
                needs_icons('bigbox', 'scissors', 'glue', 'tape', 'cardboard', page_need('grocery-pantry', '#F2A03D', 'Shelf labels')), steps, GROWN)


BUILDS = dict(auto=auto, burger=burger, christmas=christmas, coffee=coffee, construction=construction, dentist=dentist,
              dino=dino, easter=easter, fire=fire, police=police, racecar=racecar, halloween=halloween, hero=hero, ice=ice,
              italian=italian, library=library, mermaid=mermaid, petshop=petshop, pirate=pirate, royal=royal, space=space,
              unicorn=unicorn, valentine=valentine, vet=vet, grocery=grocery)

if __name__ == '__main__':
    for kid in (sys.argv[1:] or BUILDS):
        open(f'{S}/howto/{kid}.html', 'w').write(BUILDS[kid]())
        print(kid)
