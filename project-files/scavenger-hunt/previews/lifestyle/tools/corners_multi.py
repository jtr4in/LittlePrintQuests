# corners_multi.py scene.png "label1,label2,..." -> JSON [{"label","corners":[[x,y]x4 TL,TR,BR,BL]}] in pixels
import sys,json,base64,urllib.request,time
from PIL import Image
p=sys.argv[1]; W,H=Image.open(p).size; labels=sys.argv[2]
prompt=("This photo contains several separate blank white pieces of paper and cards (sheets, cards, small rectangles). "
 "Find EVERY blank white paper item. For each, give a label from this list: "+labels+" (pick the closest match by where it is and its size/shape), "
 "and the exact positions of its four corners as [y,x] normalized to 0-1000, in the order top-left, top-right, bottom-right, bottom-left as they appear in the image. "
 "Be pixel-precise: corners must sit exactly on the paper's corners. If a corner is hidden, extend the straight edges to where it would be. "
 "Return JSON {\"items\":[{\"label\":...,\"corners\":[[y,x],[y,x],[y,x],[y,x]]}]}.")
body={"contents":[{"parts":[{"inlineData":{"mimeType":"image/png","data":base64.b64encode(open(p,'rb').read()).decode()}},{"text":prompt}]}],
      "generationConfig":{"responseMimeType":"application/json","responseSchema":{"type":"OBJECT","properties":{"items":{"type":"ARRAY","items":{"type":"OBJECT","properties":{"label":{"type":"STRING","enum":[l.split("(")[0].strip() for l in labels.split(",")]},"corners":{"type":"ARRAY","items":{"type":"ARRAY","items":{"type":"NUMBER"}}}},"required":["label","corners"]}}},"required":["items"]}}}
for attempt in range(5):
    try:
        req=urllib.request.Request("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent",data=json.dumps(body).encode(),headers={"Content-Type":"application/json"})
        r=json.load(urllib.request.urlopen(req,timeout=400)); break
    except Exception as e:
        print(e, file=sys.stderr); time.sleep(10*(attempt+1))
t=r["candidates"][0]["content"]["parts"][-1]["text"]
items=json.loads(t)["items"]
print(json.dumps([{"label":i["label"],"corners":[[round(x*W/1000),round(y*H/1000)] for y,x in i["corners"]]} for i in items]))
