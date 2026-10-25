# Field Kit clip (home page)

Re-record after the Field Kit changes look:

```sh
node scripts/fieldkit-clip/server.js 8790 dino &      # stand-in Field Kit with a sample order
node scripts/fieldkit-clip/record.js /tmp              # frames + /tmp/fk-frames/frames.txt and marks.json
cd /tmp/fk-frames
ffmpeg -y -f concat -safe 0 -i frames.txt -vf "fps=30,scale=480:960:flags=lanczos,format=yuv420p" -c:v libx264 -preset slow -crf 26 -movflags +faststart -an fk-demo.mp4
ffmpeg -y -i fk-demo.mp4 -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -an fk-demo.webm
ffmpeg -y -ss 0.3 -i fk-demo.mp4 -frames:v 1 -q:v 3 fk-demo.jpg
```

Copy the three files to `docs/img/host/`, then check the step times in `docs/index.html` (`data-t` on the steps beside the clip) against where each part starts in the new video.
