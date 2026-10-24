# Generates every missing raw disguise picture into ../raw/<kit>-<slot>.png (or the folder in
# $OUT), one at a time. Usage: python3 gen.py [kit ...]
import base64, json, os, sys, time, urllib.error, urllib.request
from prompts import P, STYLE, END, GREEN_END, GREEN
MODEL = os.environ.get('MODEL', 'gemini-3.1-flash-image')
OUT = os.environ.get('OUT', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raw'))
os.makedirs(OUT, exist_ok=True)
for kit in sys.argv[1:] or P:
    for slot, ar, text in P[kit]:
        out = os.path.join(OUT, f'{kit}-{slot}.png')
        if os.path.exists(out) and os.path.getsize(out): continue
        prompt = STYLE + text + (GREEN_END if (kit, slot) in GREEN else END)
        body = {'contents': [{'parts': [{'text': prompt}]}], 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': ar, 'imageSize': os.environ.get('SIZE', '2K')}}}
        req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent', data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
        r = None
        for attempt in range(6):
            try: r = json.load(urllib.request.urlopen(req, timeout=300)); break
            except urllib.error.HTTPError as e:
                if e.code not in (429, 500, 503): print('FAIL', kit, slot, e.code, e.read()[:300]); break
                time.sleep(15 * (attempt + 1))
        parts = (r or {}).get('candidates', [{}])[0].get('content', {}).get('parts', [])
        img = next((p['inlineData']['data'] for p in parts if 'inlineData' in p), None)
        if img: open(out, 'wb').write(base64.b64decode(img)); print('ok', out, r.get('usageMetadata', {}).get('candidatesTokenCount'))
        else: print('FAIL', kit, slot, json.dumps(r)[:300])
