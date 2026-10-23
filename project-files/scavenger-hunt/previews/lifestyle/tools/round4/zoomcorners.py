# zoomcorners.py scene.png loc.json spec.json -> writes loc.json with "fine" corners per piece (asks Gemini again on a zoomed crop)
import sys,json,base64,urllib.request,time,io
import numpy as np
from PIL import Image
im=Image.open(sys.argv[1]).convert('RGB'); W,H=im.size
loc=json.load(open(sys.argv[2])); spec=json.load(open(sys.argv[3]))
def ask(crop,desc):
    buf=io.BytesIO(); crop.save(buf,'PNG')
    prompt=(f"Find the {desc} in this image. Give its four corners (outer paper edge including any white border) as [y,x] normalized 0-1000 "
            "in order top-left, top-right, bottom-right, bottom-left as seen in the image. Be pixel-precise. For a non-rectangular piece give the tightest four-sided shape around it following its perspective. "
            "If a corner is hidden, extend the edges to where it would be. Return JSON {\"corners\":[[y,x],[y,x],[y,x],[y,x]]}.")
    body={"contents":[{"parts":[{"inlineData":{"mimeType":"image/png","data":base64.b64encode(buf.getvalue()).decode()}},{"text":prompt}]}],
          "generationConfig":{"responseMimeType":"application/json","responseSchema":{"type":"OBJECT","properties":{"corners":{"type":"ARRAY","items":{"type":"ARRAY","items":{"type":"NUMBER"}}}},"required":["corners"]}}}
    for attempt in range(6):
        try:
            req=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent",data=json.dumps(body).encode(),headers={"Content-Type":"application/json"})
            r=json.load(urllib.request.urlopen(req,timeout=600)); return json.loads(r["candidates"][0]["content"]["parts"][-1]["text"])["corners"]
        except Exception as e:
            print(e, file=sys.stderr); time.sleep(10*(attempt+1))
only=sys.argv[4].split(",") if len(sys.argv)>4 else None
for p in loc["pieces"]:
    if only and p["label"] not in only: continue
    q=np.array(p["corners"],float); x0,y0=q.min(0); x1,y1=q.max(0)
    m=max(60,0.3*max(x1-x0,y1-y0)); x0,y0=max(0,int(x0-m)),max(0,int(y0-m)); x1,y1=min(W,int(x1+m)),min(H,int(y1+m))
    crop=im.crop((x0,y0,x1,y1)); cw,ch=crop.size
    c=ask(crop,spec["pieces"][p["label"]])
    p["fine"]=[[round(x0+x*cw/1000),round(y0+y*ch/1000)] for y,x in c]
    print(p["label"],p["fine"],file=sys.stderr)
json.dump(loc,open(sys.argv[2],"w"))
