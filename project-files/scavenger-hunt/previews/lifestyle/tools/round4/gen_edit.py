# gen_edit.py out.png prompt_file scene.png ref1.png ...  (edit scene keeping its framing; aspect 4:3)
import sys, json, base64, urllib.request, urllib.error, time, io
from PIL import Image
out, pf, scene, refs = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
def part(p, bgc=(235,235,235)):
    im = Image.open(p).convert('RGBA'); bg = Image.new('RGBA', im.size, bgc+(255,)); bg.alpha_composite(im)
    bg = bg.convert('RGB'); bg.thumbnail((2048, 2048)); b = io.BytesIO(); bg.save(b, 'PNG')
    return {"inlineData": {"mimeType": "image/png", "data": base64.b64encode(b.getvalue()).decode()}}
parts = [{"text": "Image 1:"}, part(scene)]
for i, r in enumerate(refs): parts += [{"text": f"Image {i+2}:"}, part(r)]
parts.append({"text": open(pf).read()})
body = {"contents": [{"parts": parts}], "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "4:3", "imageSize": "2K"}}}
req = urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image:generateContent", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
for a in range(8):
    try: r = json.load(urllib.request.urlopen(req, timeout=500)); break
    except urllib.error.HTTPError as e:
        print('http', e.code, e.read()[:300], file=sys.stderr)
        if e.code not in (429, 500, 503): raise
        time.sleep(20*(a+1))
for p in r["candidates"][0]["content"]["parts"]:
    if "inlineData" in p: open(out, "wb").write(base64.b64decode(p["inlineData"]["data"])); print("ok", out); break
else: print(json.dumps(r)[:800])
