import sys,json,base64,urllib.request,urllib.error,os
model,out,prompt=sys.argv[1],sys.argv[2],sys.argv[3]
body={"contents":[{"parts":[{"text":prompt}]}],"generationConfig":{"responseModalities":["IMAGE"],"imageConfig":{"aspectRatio":sys.argv[4] if len(sys.argv)>4 else "4:3","imageSize":"2K"}}}
req=urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",data=json.dumps(body).encode(),headers={"Content-Type":"application/json"})
import time
for attempt in range(8):
    try: r=json.load(urllib.request.urlopen(req,timeout=400)); break
    except urllib.error.HTTPError as e:
        if e.code not in (429,500,503): raise
        time.sleep(20*(attempt+1))
for p in r["candidates"][0]["content"]["parts"]:
    if "inlineData" in p:
        open(out,"wb").write(base64.b64decode(p["inlineData"]["data"]));print("ok",out);break
else: print(json.dumps(r)[:800])
