# gen_ref.py out.png prompt_file ref1.png ref2.png ...  (refs are sent in order as Image 1, Image 2, ...)
import sys, json, base64, urllib.request, urllib.error, time, io
from PIL import Image
out, pf, refs = sys.argv[1], sys.argv[2], sys.argv[3:]
parts = []
for i, r in enumerate(refs):
    im = Image.open(r).convert('RGBA'); bg = Image.new('RGBA', im.size, (235, 235, 235, 255)); bg.alpha_composite(im)
    bg = bg.convert('RGB'); bg.thumbnail((1024, 1024)); b = io.BytesIO(); bg.save(b, 'PNG')
    parts.append({"text": f"Image {i+1}:"}); parts.append({"inlineData": {"mimeType": "image/png", "data": base64.b64encode(b.getvalue()).decode()}})
parts.append({"text": open(pf).read()})
body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "4:3", "imageSize": "2K"}}}
req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
for a in range(8):
    try: r = json.load(urllib.request.urlopen(req, timeout=500)); break
    except urllib.error.HTTPError as e:
        print('http', e.code, e.read()[:300], file=sys.stderr)
        if e.code not in (429, 500, 502, 503): raise
        time.sleep(20*(a+1))
for p in r["candidates"][0]["content"]["parts"]:
    if "inlineData" in p: open(out, "wb").write(base64.b64decode(p["inlineData"]["data"])); print("ok", out); break
else: print(json.dumps(r)[:800])
