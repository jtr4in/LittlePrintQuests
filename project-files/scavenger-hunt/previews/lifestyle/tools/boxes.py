# boxes.py page.png -> list big rectangular elements [x0,y0,x1,y1]
import sys,cv2,numpy as np
im=cv2.imread(sys.argv[1]); g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
e=cv2.Canny(g,30,100); e=cv2.dilate(e,np.ones((3,3),np.uint8))
cnts,_=cv2.findContours(e,cv2.RETR_LIST,cv2.CHAIN_APPROX_SIMPLE)
H,W=g.shape; out=[]
for c in cnts:
    x,y,w,h=cv2.boundingRect(c)
    if w*h<W*H*0.02 or w>W*0.97: continue
    if cv2.contourArea(c)/(w*h)<0.85: continue
    if any(abs(x-a)<15 and abs(y-b)<15 and abs(x+w-c_)<15 for a,b,c_,d in out): continue
    out.append((x,y,x+w,y+h))
for b in sorted(out,key=lambda b:(b[1]//50,b[0])): print(list(b), round((b[2]-b[0])/(b[3]-b[1]),2))
