# Generates every missing big page into $OUT/<kit>-<slot>.png. Usage: OUT=dir python3 gen.py [kit[:slot,slot]] ...
import base64, json, os, sys, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor
from layouts import prompt, LAYOUTS
from kits import K
MODEL = os.environ.get('MODEL', 'gemini-3.1-flash-image')
OUT = os.environ.get('OUT', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raw'))
os.makedirs(OUT, exist_ok=True)

def gen(kit, slot, out):
    ar, text = prompt(K[kit], slot)
    body = {'contents': [{'parts': [{'text': text}]}], 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': ar, 'imageSize': '2K'}}}
    req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent', data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
    r = None
    for attempt in range(6):
        try: r = json.load(urllib.request.urlopen(req, timeout=300)); break
        except Exception as e:
            code = getattr(e, 'code', 0)
            if code and code not in (429, 500, 503): print('FAIL', kit, slot, code, e.read()[:300]); return
            time.sleep(15 * (attempt + 1))
    parts = (r or {}).get('candidates', [{}])[0].get('content', {}).get('parts', [])
    img = next((p['inlineData']['data'] for p in parts if 'inlineData' in p), None)
    if img: open(out, 'wb').write(base64.b64decode(img)); print('ok', out, flush=True)
    else: print('FAIL', kit, slot, json.dumps(r)[:300], flush=True)

jobs = []
for arg in sys.argv[1:] or K:
    kit, _, slots = arg.partition(':')
    for slot in (slots.split(',') if slots else LAYOUTS):
        out = os.path.join(OUT, f'{kit}-{slot}.png')
        if not (os.path.exists(out) and os.path.getsize(out)): jobs.append((kit, slot, out))
with ThreadPoolExecutor(int(os.environ.get('JOBS', '4'))) as ex: list(ex.map(lambda j: gen(*j), jobs))
