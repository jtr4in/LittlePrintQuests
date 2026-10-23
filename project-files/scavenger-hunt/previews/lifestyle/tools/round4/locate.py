# locate.py scene.png pieces.json -> prints JSON {pieces:[{label,corners}], occluders:[{label,polygon}]} in pixels
# pieces.json: {"pieces": {"label": "description", ...}, "occluders": {"label": "description", ...}}
import sys,json,base64,urllib.request,time
from PIL import Image
p=sys.argv[1]; W,H=Image.open(p).size; spec=json.load(open(sys.argv[2]))
pl="\n".join(f"- {k}: {v}" for k,v in spec["pieces"].items())
ol="\n".join(f"- {k}: {v}" for k,v in spec.get("occluders",{}).items())
prompt=("This photo shows printed paper pieces in a styled play setup. For each printed piece listed below, give the four corners of the printed piece "
 "(the outer edge of the paper, including its white border) as [y,x] normalized to 0-1000, in order top-left, top-right, bottom-right, bottom-left as seen in the image. "
 "For a piece that is not a rectangle (arch, rounded), give the corners of the tightest four-sided shape around it that follows its perspective. "
 "Be pixel-precise. If a corner is hidden, extend the edges to where it would be.\nPieces:\n"+pl+
 "\n\nAlso, for each object listed below that sits IN FRONT of a printed piece, give a tight outline polygon (12-30 points, [y,x] normalized 0-1000) tracing its exact outline:\n"+ol+
 "\nReturn JSON.")
pt={"type":"ARRAY","items":{"type":"ARRAY","items":{"type":"NUMBER"}}}
body={"contents":[{"parts":[{"inlineData":{"mimeType":"image/png","data":base64.b64encode(open(p,'rb').read()).decode()}},{"text":prompt}]}],
 "generationConfig":{"responseMimeType":"application/json","responseSchema":{"type":"OBJECT","properties":{
   "pieces":{"type":"ARRAY","items":{"type":"OBJECT","properties":{"label":{"type":"STRING","enum":list(spec["pieces"])},"corners":pt},"required":["label","corners"]}},
   "occluders":{"type":"ARRAY","items":{"type":"OBJECT","properties":{"label":{"type":"STRING","enum":list(spec.get("occluders",{})) or ["none"]},"polygon":pt},"required":["label","polygon"]}}},
   "required":["pieces","occluders"]}}}
for attempt in range(6):
    try:
        req=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent",data=json.dumps(body).encode(),headers={"Content-Type":"application/json"})
        r=json.load(urllib.request.urlopen(req,timeout=600)); break
    except Exception as e:
        print(e, file=sys.stderr); time.sleep(10*(attempt+1))
d=json.loads(r["candidates"][0]["content"]["parts"][-1]["text"])
cv=lambda pts:[[round(x*W/1000),round(y*H/1000)] for y,x in pts]
print(json.dumps({"pieces":[{"label":i["label"],"corners":cv(i["corners"])} for i in d["pieces"]],
                  "occluders":[{"label":i["label"],"polygon":cv(i["polygon"])} for i in d["occluders"]]}))
