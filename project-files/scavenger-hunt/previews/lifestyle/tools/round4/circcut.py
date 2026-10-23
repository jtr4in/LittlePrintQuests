# circcut.py page.png cx,cy,r out.png  -> round RGBA sticker
import sys,numpy as np
from PIL import Image,ImageDraw
p=Image.open(sys.argv[1]).convert('RGB'); cx,cy,r=map(int,sys.argv[2].split(','))
c=p.crop((cx-r,cy-r,cx+r,cy+r)).convert('RGBA'); m=Image.new('L',(8*r,8*r),0); ImageDraw.Draw(m).ellipse((0,0,8*r-1,8*r-1),fill=255)
c.putalpha(m.resize((2*r,2*r),Image.LANCZOS)); c.save(sys.argv[3])
