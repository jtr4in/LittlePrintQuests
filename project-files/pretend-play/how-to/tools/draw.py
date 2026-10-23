# Flat-vector "how to build it from a cardboard box" guides for the play kits.
# Usage: python3 draw.py <scratch>  -> writes howto/<kit>.html (render with shot.js)
import base64, sys, math, os
from PIL import Image

S = os.environ.get('HS', '/tmp/claude-0/-home-user-LittlePrintQuests/4e18a987-6006-5630-bd1c-c84877147627/scratchpad')
PIECES = f'{S}/howto/pieces'

def uri(name):
    return 'data:image/png;base64,' + base64.b64encode(open(f'{PIECES}/{name}.png', 'rb').read()).decode()

def size(name):
    return Image.open(f'{PIECES}/{name}.png').size

# cardboard palette (matches the flat box reference)
CB = dict(front='#CF9466', side='#BC8659', top='#DFAA78', hl='#E2B184', tape='#F3DFB6', tape2='#E6CFA3',
          inside='#6E4B2F', inside2='#8A6040', ink='#3A3550')
CUT = '#E8513A'
FOLD = '#2F7FD0'

def pts(*p):
    return ' '.join(f'{x:.1f},{y:.1f}' for x, y in p)

def depth(d):
    return 0.6 * d, -0.45 * d

def box(x, y, w, h, d, c=None, tape=True, hl=True, flaps=False):
    c = {**CB, **(c or {})}
    dx, dy = depth(d)
    s = []
    s.append(f'<ellipse cx="{x + w/2 + dx/2:.0f}" cy="{y + h + 8:.0f}" rx="{w/2 + dx/2 + 30:.0f}" ry="16" fill="#000" opacity=".07"/>')
    s.append(f'<polygon points="{pts((x, y), (x+w, y), (x+w+dx, y+dy), (x+dx, y+dy))}" fill="{c["top"]}"/>')
    s.append(f'<polygon points="{pts((x+w, y), (x+w+dx, y+dy), (x+w+dx, y+h+dy), (x+w, y+h))}" fill="{c["side"]}"/>')
    s.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{c["front"]}"/>')
    # thin rim line where the top meets the front
    s.append(f'<polygon points="{pts((x, y), (x+w, y), (x+w+4, y-3), (x+4, y-3))}" fill="{c["top"]}" opacity=".6"/>')
    if hl:
        s.append(f'<rect x="{x + 12}" y="{y + h*0.12:.0f}" width="{max(10, w*0.07):.0f}" height="{h*0.45:.0f}" rx="{max(5, w*0.035):.0f}" fill="#fff" opacity=".18"/>')
        s.append(f'<circle cx="{x + 12 + max(10, w*0.07)/2:.0f}" cy="{y + h*0.64:.0f}" r="{max(5, w*0.035):.0f}" fill="#fff" opacity=".18"/>')
    if tape:
        tw = w * 0.22; tx = x + w * 0.39
        s.append(f'<polygon points="{pts((tx, y), (tx+tw, y), (tx+tw+dx, y+dy), (tx+dx, y+dy))}" fill="{c["tape"]}" opacity=".85"/>')
        zz = [(tx, y)] + [(tx + tw * i / 6, y + h*0.16 + (8 if i % 2 else 0)) for i in range(7)] + [(tx+tw, y)]
        s.append(f'<polygon points="{pts(*zz)}" fill="{c["tape2"]}" opacity=".85"/>')
    return '\n'.join(s)

def side_image(x, y, w, h, d, img, u0, v0, uw, inset=0):
    """Place an image flat on the right side face; u0/uw are fractions of depth, v0 fraction of height."""
    dx, dy = depth(d)
    iw, ih = size(img)
    ax, ay = dx * uw / iw, dy * uw / iw        # image x-axis along the depth
    sc = math.hypot(dx * uw, dy * uw) / iw
    cx, cy = 0, sc                               # image y-axis straight down
    ox = x + w + dx * u0; oy = y + dy * u0 + h * v0
    return f'<image href="{uri(img)}" width="{iw}" height="{ih}" transform="matrix({ax:.5f},{ay:.5f},{cx:.5f},{cy:.5f},{ox:.1f},{oy:.1f})"/>'

def img(name, x, y, w, extra=''):
    iw, ih = size(name)
    h = w * ih / iw
    return f'<image href="{uri(name)}" x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" {extra}/>', h

def label(x, y, text, color=CUT, rot=0, fs=19):
    w = len(text) * fs * 0.62 + 26
    return (f'<g transform="translate({x},{y}) rotate({rot})"><rect x="{-w/2:.0f}" y="-17" width="{w:.0f}" height="34" rx="17" fill="{color}"/>'
            f'<text x="0" y="7" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="{fs}" fill="#fff" letter-spacing="1">{text}</text></g>')

def scissors(x, y, sc=1, rot=0, col=CUT):
    return f'''<g transform="translate({x},{y}) rotate({rot}) scale({sc})">
  <path d="M-4,-3 L52,-14 Q56,-12 52,-9 L2,4 Z" fill="#C9CED8"/>
  <path d="M-4,3 L52,14 Q56,12 52,9 L2,-4 Z" fill="#AEB5C2"/>
  <circle cx="0" cy="0" r="4" fill="#6B7280"/>
  <ellipse cx="-24" cy="-13" rx="14" ry="11" fill="none" stroke="{col}" stroke-width="7"/>
  <ellipse cx="-24" cy="13" rx="14" ry="11" fill="none" stroke="{col}" stroke-width="7"/>
</g>'''

def knife(x, y, sc=1, rot=0):
    return f'''<g transform="translate({x},{y}) rotate({rot}) scale({sc})">
  <rect x="-60" y="-9" width="62" height="18" rx="7" fill="#F4B63F"/>
  <rect x="-52" y="-9" width="8" height="18" fill="#E09A1E"/>
  <path d="M2,-7 L30,-7 L40,7 L2,7 Z" fill="#C9CED8"/>
</g>'''

def glue(x, y, sc=1, rot=0):
    return f'''<g transform="translate({x},{y}) rotate({rot}) scale({sc})">
  <rect x="-15" y="-10" width="30" height="62" rx="6" fill="#7C5CC4"/>
  <rect x="-15" y="8" width="30" height="16" fill="#fff" opacity=".85"/>
  <text x="0" y="21" text-anchor="middle" font-family="Fredoka" font-weight="700" font-size="11" fill="#7C5CC4">GLUE</text>
  <rect x="-12" y="-26" width="24" height="18" rx="4" fill="#F4F1EA"/>
</g>'''

def brush(x, y, sc=1, rot=0, paint='#2F5FB3'):
    return f'''<g transform="translate({x},{y}) rotate({rot}) scale({sc})">
  <rect x="-6" y="-80" width="12" height="62" rx="6" fill="#E9A23B"/>
  <rect x="-9" y="-22" width="18" height="16" fill="#C9CED8"/>
  <path d="M-10,-6 L10,-6 L8,18 Q0,26 -8,18 Z" fill="{paint}"/>
</g>'''

def paintpot(x, y, col='#2F5FB3'):
    return f'''<g transform="translate({x},{y})">
  <ellipse cx="0" cy="40" rx="34" ry="8" fill="#000" opacity=".07"/>
  <path d="M-30,0 L30,0 L27,40 Q0,46 -27,40 Z" fill="#E4E7ED"/>
  <ellipse cx="0" cy="0" rx="30" ry="8" fill="{col}"/>
  <rect x="-30" y="12" width="60" height="12" fill="{col}" opacity=".9"/>
</g>'''

def taperoll(x, y, sc=1):
    return f'''<g transform="translate({x},{y}) scale({sc})">
  <circle r="24" fill="{CB['tape']}"/><circle r="24" fill="none" stroke="{CB['tape2']}" stroke-width="3"/>
  <circle r="12" fill="#fff"/><circle r="12" fill="none" stroke="#D9C7A0" stroke-width="3"/>
  <path d="M20,12 L44,26 L40,32 L16,18 Z" fill="{CB['tape']}"/>
</g>'''

def arrow(x1, y1, x2, y2, bend=-40, col=CB['ink']):
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    nx, ny = -(y2 - y1), (x2 - x1)
    L = math.hypot(nx, ny) or 1
    cx, cy = mx + nx / L * bend, my + ny / L * bend
    ang = math.atan2(y2 - cy, x2 - cx)
    a1 = (x2 - 16 * math.cos(ang - .45), y2 - 16 * math.sin(ang - .45))
    a2 = (x2 - 16 * math.cos(ang + .45), y2 - 16 * math.sin(ang + .45))
    return (f'<path d="M{x1},{y1} Q{cx:.0f},{cy:.0f} {x2},{y2}" fill="none" stroke="{col}" stroke-width="5" stroke-linecap="round" stroke-dasharray="1 11"/>'
            f'<path d="M{a1[0]:.1f},{a1[1]:.1f} L{x2},{y2} L{a2[0]:.1f},{a2[1]:.1f}" fill="none" stroke="{col}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>')

def sparkle(x, y, r=12, col='#F4B63F'):
    return f'<path transform="translate({x},{y})" d="M0,{-r} Q{r*.15},{-r*.15} {r},0 Q{r*.15},{r*.15} 0,{r} Q{-r*.15},{r*.15} {-r},0 Q{-r*.15},{-r*.15} 0,{-r} Z" fill="{col}"/>'

def dashed_rect(x, y, w, h, r=10, col=CUT, sw=4):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{r}" fill="none" stroke="{col}" stroke-width="{sw}" stroke-dasharray="12 8" stroke-linecap="round"/>'

def paper(x, y, w, h, rot=0, inner=''):
    return (f'<g transform="rotate({rot} {x + w/2} {y + h/2})"><rect x="{x+6}" y="{y+8}" width="{w}" height="{h}" rx="6" fill="#000" opacity=".08"/>'
            f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#fff"/>{inner}</g>')

def bubble(x, y, text, col):
    w = len(text) * 15 + 40
    if x - w/2 < 110 and y < 120:  # keep clear of the step number badge
        x = 110 + w/2
    return (f'<g transform="translate({x},{y})"><rect x="{-w/2}" y="-26" width="{w}" height="52" rx="26" fill="#fff" stroke="{col}" stroke-width="4"/>'
            f'<path d="M-12,24 L-22,44 L4,25" fill="#fff" stroke="{col}" stroke-width="4" stroke-linejoin="round"/><rect x="-14" y="18" width="20" height="8" fill="#fff"/>'
            f'<text x="0" y="9" text-anchor="middle" font-family="Fredoka" font-weight="600" font-size="26" fill="{col}">{text}</text></g>')

def envelope(x, y, w, rot=0):
    h = w * 0.62
    return f'''<g transform="translate({x},{y}) rotate({rot})">
  <rect x="{-w/2}" y="{-h/2}" width="{w}" height="{h}" rx="5" fill="#FFFDF8" stroke="#E2D8C6" stroke-width="2"/>
  <path d="M{-w/2},{-h/2} L0,{h*0.08} L{w/2},{-h/2}" fill="none" stroke="#E2D8C6" stroke-width="3"/>
  <rect x="{w/2 - w*0.24}" y="{-h/2 + 6}" width="{w*0.18}" height="{w*0.2}" fill="#E8513A" stroke="#fff" stroke-width="3" stroke-dasharray="3 3"/>
  <circle cx="{w/2 - w*0.15}" cy="{-h/2 + 6 + w*0.1}" r="{w*0.045}" fill="#fff" opacity=".8"/>
  <rect x="{-w*0.3}" y="{h*0.14}" width="{w*0.34}" height="5" rx="2.5" fill="#C9CED8"/>
  <rect x="{-w*0.3}" y="{h*0.27}" width="{w*0.26}" height="5" rx="2.5" fill="#C9CED8"/>
</g>'''

def svg(inner, w=700, h=430):
    return f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg">{inner}</svg>'


def page(kit, title, sub, needs, steps, tip):
    k = kit
    cards = []
    for i, (head, cap, art) in enumerate(steps, 1):
        cards.append(f'''<div class="step"><div class="num">{i}</div><div class="art">{art}</div>
<div class="txt"><h3>{head}</h3><p>{cap}</p></div></div>''')
    need = ''.join(f'<div class="need">{svg(ic, 120, 100)}<span>{t}</span></div>' for t, ic in needs)
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:Fredoka;src:url(file:///home/user/LittlePrintQuests/fonts/Fredoka.ttf)}}
@font-face{{font-family:Nunito;src:url(file:///home/user/LittlePrintQuests/fonts/Nunito.ttf)}}
*{{box-sizing:border-box;margin:0}}
body{{width:1600px;height:2400px;background:#FFF8EE;font-family:Nunito;color:{CB['ink']};padding:70px 70px 0;position:relative;overflow:hidden}}
.dots{{position:absolute;inset:0;background-image:radial-gradient({k['soft']} 2.5px,transparent 3px);background-size:44px 44px;opacity:.55}}
.wrap{{position:relative}}
.tag{{display:inline-block;background:{k['main']};color:#fff;font-family:Fredoka;font-weight:600;font-size:26px;letter-spacing:2px;padding:10px 26px;border-radius:30px}}
h1{{font-family:Fredoka;font-weight:700;font-size:104px;line-height:1;margin:22px 0 10px;color:{k['dark']}}}
.sub{{font-size:34px;font-weight:600;opacity:.85}}
.needs{{display:flex;gap:16px;margin:34px 0 34px;align-items:center}}
.needs b{{font-family:Fredoka;font-size:30px;font-weight:600;margin-right:8px;color:{k['dark']}}}
.need{{background:#fff;border-radius:22px;padding:8px 10px 12px;width:174px;text-align:center;box-shadow:0 4px 0 {k['soft']}}}
.need svg{{width:110px;height:92px}}
.need span{{display:block;font-weight:700;font-size:21px;line-height:1.15}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:34px}}
.step{{background:#fff;border-radius:34px;position:relative;box-shadow:0 6px 0 {k['soft']};height:560px;overflow:hidden}}
.num{{position:absolute;left:24px;top:22px;width:62px;height:62px;border-radius:50%;background:{k['main']};color:#fff;font-family:Fredoka;font-weight:700;font-size:38px;display:flex;align-items:center;justify-content:center;z-index:2}}
.art{{height:385px;background:{k['light']};}}
.art svg{{width:100%;height:100%}}
.txt{{padding:20px 34px}}
.txt h3{{font-family:Fredoka;font-weight:600;font-size:38px;color:{k['dark']};margin-bottom:6px}}
.txt p{{font-size:25px;line-height:1.35;font-weight:600}}
.foot{{display:flex;justify-content:space-between;align-items:center;margin-top:30px;font-size:24px;font-weight:700}}
.foot .tip{{background:#fff;border-radius:20px;padding:14px 22px;box-shadow:0 4px 0 {k['soft']}}}
.foot .brand{{font-family:Fredoka;font-weight:600;font-size:30px;color:{k['dark']}}}
</style></head><body><div class="dots"></div><div class="wrap">
<span class="tag">{kit['tagline']}</span>
<h1>{title}</h1><div class="sub">{sub}</div>
<div class="needs"><b>You’ll need</b>{need}</div>
<div class="grid">{''.join(cards)}</div>
<div class="foot"><div class="tip">✂ {tip}</div><div class="brand">Little Print Quests</div></div>
</div></body></html>'''


# ---------- shared "you'll need" icons (120x100 viewBox) ----------
def ic_box(): return box(22, 34, 56, 48, 34, tape=True, hl=False).split('\n', 1)[1]
def ic_scissors(): return scissors(66, 52, 1.0, -30)
def ic_glue(): return glue(60, 40, 0.95, 20)
def ic_tape(): return taperoll(52, 50, 1.1)
def ic_pages(name, col):
    i, h = img(name, 34, 20 + (60 - 52 * size(name)[1] / size(name)[0]) / 2, 52)
    return f'<rect x="26" y="10" width="68" height="84" rx="4" fill="#fff" stroke="{col}" stroke-width="3"/>' + i


# ================= POST OFFICE: MAILBOX =================
def mailbox():
    k = dict(main='#2F5FB3', dark='#1D3F7D', soft='#CFE0FF', light='#EEF4FF', tagline='POST OFFICE PLAY KIT · CARDBOARD BUILD')
    BLUE = dict(front='#3566BD', side='#284F99', top='#4D7DD2', tape='#3566BD', tape2='#3566BD')
    X, Y, W, H, D = 255, 75, 170, 310, 110

    def slot(x=X, y=Y, w=W, cut=True):
        sx, sy, sw, sh = x + 26, y + 138, w - 52, 26
        if cut:
            return (f'<rect x="{sx}" y="{sy}" width="{sw}" height="{sh}" rx="8" fill="{CB["inside"]}"/>'
                    f'<rect x="{sx}" y="{sy}" width="{sw}" height="9" rx="4" fill="#3E2A1A"/>')
        return dashed_rect(sx, sy, sw, sh, 8)

    def signs(x=X, y=Y, w=W):
        a, ha = img('post-mail', x + 10, y + 26, w - 20)
        b, hb = img('post-mailboxes', x + 10, y + 178, w - 20)
        return a + b

    s1 = box(X, Y, W, H, D) + taperoll(530, 330, 1.3) + arrow(505, 300, 452, 135, 40) + \
        label(140, 120, 'TALL BOX', '#7C5CC4', -6)
    s2 = box(X, Y, W, H, D, tape=False) + slot(cut=False) + knife(436, 204, 1.0, 150) + \
        label(175, 255, 'CUT HERE', CUT, -6) + arrow(160, 230, 270, 160, -30, CUT)
    # side door: cut 3 sides, fold the 4th
    dx, dy = depth(D)
    u0, u1, v0, v1 = .2, .8, .52, .9
    P = lambda u, v: (X + W + dx*u, Y + dy*u + H*v)
    door = (f'<polygon points="{pts(P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1))}" fill="#B07D52"/>'
            f'<polyline points="{pts(P(u0,v1),P(u0,v0),P(u1,v0),P(u1,v1))}" fill="none" stroke="{CUT}" stroke-width="4" stroke-dasharray="10 7"/>'
            f'<line x1="{P(u0,v1)[0]}" y1="{P(u0,v1)[1]}" x2="{P(u1,v1)[0]}" y2="{P(u1,v1)[1]}" stroke="{FOLD}" stroke-width="4" stroke-dasharray="2 7" stroke-linecap="round"/>')
    s3 = box(X, Y, W, H, D, tape=False) + slot() + door + \
        label(560, 220, 'CUT 3 SIDES', CUT, 4) + label(560, 395, 'FOLD', FOLD, 0) + \
        arrow(545, 245, P(.6, .55)[0] + 8, P(.6, .55)[1], 30, CUT) + arrow(515, 385, P(.6, .9)[0] + 8, P(.6, .9)[1], -20, FOLD)
    s4 = box(X, Y, W, H, D, c=BLUE, tape=False) + slot() + \
        brush(470, 160, 1.15, 35) + paintpot(560, 330) + sparkle(205, 90, 13) + sparkle(470, 70, 9, '#7FB2F0') + \
        label(140, 300, 'PAINT IT BLUE', '#2F5FB3', -6)
    # cut out + glue on
    pw, ph = 230, 300
    a, ha = img('post-mail', 40, 72, pw - 40)
    b, hb = img('post-mailboxes', 40, 82 + ha + 30, pw - 40)
    inner = a + dashed_rect(32, 64, pw - 24, ha + 16, 18) + b + dashed_rect(32, 82 + ha + 22, pw - 24, hb + 16, 18)
    s5 = paper(70, 70, pw, ph, -4, inner.replace('x="40"','x="90"').replace('x="32"','x="82"').replace('y="72"','y="92"').replace('y="64"','y="84"')) + scissors(255, 270, .9, 160) + \
        arrow(305, 190, 375, 150, -30) + \
        box(395, 75, W, H, D, c=BLUE, tape=False) + slot(395) + signs(395) + glue(640, 330, .95, 25) + label(340, 395, 'GLUE ON', '#7C5CC4', -4)
    s6 = box(X, Y, W, H, D, c=BLUE, tape=False) + slot() + signs() + \
        f'<clipPath id="slotclip"><rect x="0" y="0" width="700" height="{Y+147}"/></clipPath>' + \
        f'<g clip-path="url(#slotclip)">' + envelope(X + W/2 + 4, Y + 120, 96, -6) + '</g>' + \
        bubble(545, 110, 'You’ve got mail!', '#2F5FB3') + sparkle(470, 220, 14) + sparkle(200, 60, 11, '#E8513A') + sparkle(520, 300, 9, '#7FB2F0')
    # the rect above hides the envelope's lower half so it looks like it is going into the slot;
    # redraw the slot's lower edge and the bottom sign on top of it.
    steps = [
        ('Find a tall box', 'A diaper or delivery box is perfect. Tape the top flaps shut so it stands up tall.', svg(s1)),
        ('Cut the letter slot', 'Draw a wide slot near the top of the front. A grown-up cuts it out with a craft knife.', svg(s2)),
        ('Add a mail door', 'On the side, cut a little door on 3 sides and fold the 4th. Now the mail carrier can empty it!', svg(s3)),
        ('Paint it', 'Paint it mailbox blue (or wrap it in brown paper). Let it dry.', svg(s4)),
        ('Cut out and glue on the signs', 'Cut out the Mail sign and the Mailboxes sign from your kit. Glue one above the slot and one below.', svg(s5)),
        ('Post a letter!', 'Write a letter, stick on a kit stamp and pop it in. Pick-up is at 3:00!', svg(s6)),
    ]
    needs = [('A tall box', ic_box()), ('Scissors', ic_scissors()), ('Glue stick', ic_glue()), ('Tape', ic_tape()),
             ('Blue paint', brush(60, 90, .9, 30) + paintpot(70, 50, '#2F5FB3').replace('translate(70,50)', 'translate(48,42) scale(.8)')),
             ('Mail signs', ic_pages('post-mail', '#2F5FB3'))]
    return page(k, 'Make a Mailbox', 'One cardboard box + the signs from your Post Office kit. About 20 minutes.',
                needs, steps, 'Grown-ups do all the box cutting. Kids can paint, glue and post!')


# ================= PIZZERIA: PIZZA OVEN =================
OVEN_OUTLINE = ('M561,0 H868 V58 H832 V252 C1100,275 1376,450 1376,800 V1345 H1428 V1462 H1367 V1863 H61 V1462 H0 V1345 H52 '
                'V800 C52,450 330,275 596,252 V58 H561 Z')
ARCH = 'M318,1339 V960 C318,700 520,631 714,631 C908,631 1111,700 1111,960 V1339'
ARCH_Y = 1339

def pizza_oven():
    k = dict(main='#D9412E', dark='#9E2A1C', soft='#FBD9C9', light='#FFF3EA', tagline='PIZZA SHOP PLAY KIT · CARDBOARD BUILD')
    OW, OH = size('pizza-oven')
    X, Y, W, D = 205, 92, 205, 140
    sc = W / OW
    H = OH * sc

    def oven(x=X, y=Y, w=W):
        return img('pizza-oven', x, y, w)[0]

    def arch_cut(x=X, y=Y, w=W):
        s = w / OW
        return f'<path transform="translate({x},{y}) scale({s})" d="{ARCH}" fill="none" stroke="{CUT}" stroke-width="{4/s:.1f}" stroke-dasharray="{11/s:.1f} {7/s:.1f}"/>' + \
            f'<line transform="translate({x},{y}) scale({s})" x1="318" y1="{ARCH_Y}" x2="1111" y2="{ARCH_Y}" stroke="{FOLD}" stroke-width="{4/s:.1f}" stroke-dasharray="{2/s:.1f} {8/s:.1f}" stroke-linecap="round"/>'

    def open_door(x=X, y=Y, w=W):
        s = w / OW
        hole = f'<path transform="translate({x},{y}) scale({s})" d="{ARCH} Z" fill="#2A1C14"/>'
        glow = f'<ellipse cx="{x + 714*s:.1f}" cy="{y + 1280*s:.1f}" rx="{300*s:.1f}" ry="{60*s:.1f}" fill="#F08A3C" opacity=".35"/>'
        yb = y + ARCH_Y * s
        k_ = .7  # flap folds down toward the viewer, lying flat like a real oven door
        m = f'matrix(1,0,{0.6*k_:.3f},{-0.45*k_:.3f},{-0.6*k_*yb:.2f},{yb*(1+0.45*k_):.2f})'
        flap = f'<path transform="{m} translate({x},{y}) scale({s})" d="{ARCH} Z" fill="{CB["hl"]}" stroke="{CB["side"]}" stroke-width="{3/s:.1f}"/>'
        return hole + glow + flap

    def kitchen_sign():
        return side_image(X0, Y, W, H, D, 'pizza-kitchen', .1, .3, .8)

    # step 2 paper with the oven page
    pw = 250; ph = 323
    ow2 = 200
    o2, oh2 = img('pizza-oven', 45, 50 + (ph - ow2 * OH / OW) / 2, ow2)
    s2 = paper(20, 40, pw, ph, -3, o2 + f'<path transform="translate(45,{50 + (ph - ow2*OH/OW)/2:.1f}) scale({ow2/OW})" d="{OVEN_OUTLINE}" fill="none" stroke="{CUT}" stroke-width="{4*OW/ow2:.1f}" stroke-dasharray="{11*OW/ow2:.1f} {7*OW/ow2:.1f}" stroke-linejoin="round"/>') + \
        scissors(250, 95, 1.0, 150) + arrow(300, 200, 400, 160, -30) + \
        img('pizza-oven', 430, 70, 190, 'transform="rotate(4 525 190)"')[0] + label(525, 395, 'CUT AROUND IT', CUT, -3)
    s1 = box(X, Y, W, H, D) + taperoll(540, 340, 1.3) + arrow(515, 310, 460, 150, 40) + label(120, 120, 'BIG BOX', '#7C5CC4', -6)
    s3 = box(X, Y, W, H, D, tape=False) + oven() + glue(530, 300, 1.05, 25) + sparkle(180, 70, 12) + sparkle(470, 90, 9, CUT) + \
        label(110, 360, 'GLUE ON FRONT', '#7C5CC4', -6)
    s4 = box(X, Y, W, H, D, tape=False) + oven() + arch_cut() + knife(470, 175, 1.1, 200) + \
        label(560, 110, 'CUT', CUT, 4) + label(560, 330, 'FOLD', FOLD, 0) + arrow(520, 320, X + 175, Y + ARCH_Y*sc + 2, -25, FOLD)
    # step 5: peel and pizza glued on cardboard, cut out
    pe, peh = img('pizza-peel', 70, 70, 190)
    pz, pzh = img('pizza-pizza', 400, 95, 210)
    s5 = (f'<g transform="rotate(-8 165 180)"><rect x="40" y="55" width="250" height="{peh + 30:.0f}" rx="6" fill="{CB["top"]}"/>'
          f'<path transform="translate(70,70) scale({190/size("pizza-peel")[0]:.4f})" d="M0,0" />' + pe + '</g>') + \
        f'<circle cx="505" cy="200" r="122" fill="{CB["front"]}"/><circle cx="505" cy="200" r="114" fill="{CB["side"]}"/>' + pz + \
        scissors(330, 330, 1.0, -150) + label(350, 395, 'GLUE ON CARDBOARD, THEN CUT', '#7C5CC4', 0, 17)
    X0 = 265
    s6 = box(X0, Y, W, H, D, tape=False) + oven(X0) + open_door(X0)
    # peel + pizza sliding in on the open door
    s6 += f'''<g transform="translate(178,343) rotate(-14)">
  <rect x="0" y="-9" width="110" height="18" rx="9" fill="#C99A5B"/>
  <ellipse cx="170" cy="0" rx="78" ry="34" fill="#E3C28B"/>
  <image href="{uri('pizza-pizza')}" x="110" y="-30" width="122" height="60" preserveAspectRatio="none"/>
</g>''' + bubble(150, 112, 'Count to 10!', '#D9412E') + sparkle(560, 60, 13) + sparkle(600, 200, 9, '#F08A3C')
    steps = [
        ('Find a big box', 'Any sturdy box works. Tape it shut and stand it up with a wide side facing you.', svg(s1)),
        ('Cut out the brick oven', 'Cut around the outline of the brick oven page from your kit, chimney and all.', svg(s2)),
        ('Glue it on the front', 'Glue the oven onto the front of the box and smooth out the bubbles.', svg(s3)),
        ('Cut the oven door', 'A grown-up cuts around the arch, leaving the bottom edge. Fold it down to open the door.', svg(s4)),
        ('Make it sturdy', 'Glue the pizza peel and pizzas onto cardboard (a cereal box works) and cut them out.', svg(s5)),
        ('Bake!', 'Open the door, slide the pizza in on the peel and count to 10. Hot pizza, coming right up!', svg(s6)),
    ]
    needs = [('A big box', ic_box()), ('Scissors', ic_scissors()), ('Glue stick', ic_glue()), ('Tape', ic_tape()),
             ('Cereal box', f'<rect x="34" y="12" width="52" height="78" rx="3" fill="{CB["top"]}"/><rect x="40" y="22" width="40" height="22" rx="3" fill="#F4B63F"/><circle cx="60" cy="64" r="12" fill="#fff" opacity=".6"/>'),
             ('Oven page', ic_pages('pizza-oven', '#D9412E'))]
    return page(k, 'Make a Pizza Oven', 'One cardboard box + the oven page from your Pizza Shop kit. About 20 minutes.',
                needs, steps, 'Grown-ups do the box cutting. Kids can glue, decorate and bake!')


if __name__ == '__main__':
    open(f'{S}/howto/post.html', 'w').write(mailbox())
    open(f'{S}/howto/pizza.html', 'w').write(pizza_oven())
    print('ok')
