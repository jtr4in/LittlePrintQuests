# Pictures for the vet kit review (2026-11-07): face-free redraws of kit art and new pictures.
# Each job is (name, aspect, prompt, reference art or None). A reference picture is sent along so
# the redraw keeps the kit's look. Usage: OUT=<raw dir> python3 gen.py [name ...]
import base64, json, os, sys, time, urllib.error, urllib.request
from prompts import JOBS, STYLE, END, FILL_END
MODEL = os.environ.get('MODEL', 'gemini-3.1-flash-image')
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
OUT = os.environ.get('OUT', os.path.join(HERE, '..', 'raw'))
os.makedirs(OUT, exist_ok=True)

def ref_part(rel):
    from PIL import Image
    import io
    im = Image.open(os.path.join(ROOT, rel)).convert('RGBA')
    bg = Image.new('RGB', im.size, 'white'); bg.paste(im, mask=im.split()[3])
    buf = io.BytesIO(); bg.save(buf, 'PNG')
    return {'inlineData': {'mimeType': 'image/png', 'data': base64.b64encode(buf.getvalue()).decode()}}

want = set(sys.argv[1:])
for name, ar, text, ref in JOBS:
    if want and name not in want: continue
    out = os.path.join(OUT, f'{name}.png')
    if os.path.exists(out) and os.path.getsize(out): continue
    parts = ([ref_part(ref)] if ref else []) + [{'text': STYLE + text + (FILL_END if name.startswith('fill-') else END)}]
    body = {'contents': [{'parts': parts}], 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': ar, 'imageSize': os.environ.get('SIZE', '1K')}}}
    req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent', data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
    r = None
    for attempt in range(6):
        try: r = json.load(urllib.request.urlopen(req, timeout=300)); break
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 503): print('FAIL', name, e.code, e.read()[:300]); break
            time.sleep(15 * (attempt + 1))
    p = (r or {}).get('candidates', [{}])[0].get('content', {}).get('parts', [])
    img = next((x['inlineData']['data'] for x in p if 'inlineData' in x), None)
    if img: open(out, 'wb').write(base64.b64decode(img)); print('ok', name, flush=True)
    else: print('FAIL', name, json.dumps(r)[:300], flush=True)
