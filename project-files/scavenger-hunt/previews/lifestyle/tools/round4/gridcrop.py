# gridcrop.py img x0,y0,x1,y1 out.png [step]  crop with labeled grid lines in original pixel coords
import sys,cv2
im=cv2.imread(sys.argv[1]); x0,y0,x1,y1=map(int,sys.argv[2].split(',')); st=int(sys.argv[4]) if len(sys.argv)>4 else 50
c=im[y0:y1,x0:x1].copy()
for x in range((x0//st+1)*st,x1,st):
    cv2.line(c,(x-x0,0),(x-x0,y1-y0),(255,0,255) if x%(st*2)==0 else (255,200,0),1); cv2.putText(c,str(x),(x-x0+2,12),0,0.4,(255,0,255),1)
for y in range((y0//st+1)*st,y1,st):
    cv2.line(c,(0,y-y0),(x1-x0,y-y0),(255,0,255) if y%(st*2)==0 else (255,200,0),1); cv2.putText(c,str(y),(2,y-y0-2),0,0.4,(255,0,255),1)
cv2.imwrite(sys.argv[3],c)
