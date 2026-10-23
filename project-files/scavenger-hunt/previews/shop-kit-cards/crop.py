# crop.py kit page part out  part: full|top|bot  -> trims header/footer and whitespace
import sys
from PIL import Image, ImageChops
k,p,part,out=sys.argv[1],int(sys.argv[2]),sys.argv[3],sys.argv[4]
im=Image.open(f'pages/{k}/page-{p}.png').convert('RGB');W,H=im.size
box={'full':(0,.09,1,.95),'top':(0,0,1,.5),'bot':(0,.5,1,1),'raw':(0,0,1,1)}[part]
im=im.crop((int(box[0]*W),int(box[1]*H),int(box[2]*W),int(box[3]*H)))
g=im.convert('L').point(lambda v:255 if v<235 else 0)
b=g.getbbox();im=im.crop(b);im.save(out);print(out,im.size)
