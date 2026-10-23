#!/bin/bash
# Generates every missing raw picture, one at a time.
cd "$(dirname "$0")"
for id in $(python3 -c "from prompts import P; print(' '.join(P))"); do
  out=../raw/$id.png; [ -s $out ] && continue
  read ar prompt < <(python3 -c "from prompts import P,END,GREEN,GREEN_END; a,p=P['$id']; print(a, p+(GREEN_END if '$id' in GREEN else END))")
  python3 /mnt/project-files/scavenger-hunt/previews/lifestyle/tools/gen.py gemini-3-pro-image $out "$prompt" $ar || echo FAIL $id
done
