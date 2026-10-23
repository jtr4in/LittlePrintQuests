# corners.py scene.png -> prints [[x,y]x4] in pixels: TL,TR,BR,BL of the blank paper as seen in the photo
import sys,json,base64,urllib.request
from PIL import Image
p=sys.argv[1]; W,H=Image.open(p).size
prompt=("This photo contains one blank white sheet of paper. Return the exact pixel-precise positions of its four corners "
 "as JSON {\"corners\": [[y,x],[y,x],[y,x],[y,x]]} normalized to 0-1000, in this order: top-left, top-right, bottom-right, bottom-left "
 "as they appear in the image. If a corner is hidden behind a hand or object, estimate where it would be by extending the paper's straight edges.")
body={"contents":[{"parts":[{"inlineData":{"mimeType":"image/png","data":base64.b64encode(open(p,'rb').read()).decode()}},{"text":prompt}]}],
      "generationConfig":{"responseMimeType":"application/json"}}
req=urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{sys.argv[2] if len(sys.argv)>2 else 'gemini-3.1-pro-preview'}:generateContent",data=json.dumps(body).encode(),headers={"Content-Type":"application/json"})
r=json.load(urllib.request.urlopen(req,timeout=300))
t=r["candidates"][0]["content"]["parts"][-1]["text"]
c=json.loads(t)["corners"]
print(json.dumps([[round(x*W/1000),round(y*H/1000)] for y,x in c]))
