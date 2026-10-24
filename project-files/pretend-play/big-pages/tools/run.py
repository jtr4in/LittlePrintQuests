# Generate, check and retry: up to ROUNDS passes per picture. Failed pictures move to $OUT/rejected/.
# Usage: OUT=dir python3 run.py kit ...
import json, os, subprocess, sys
from layouts import LAYOUTS
OUT = os.environ['OUT']; ROUNDS = int(os.environ.get('ROUNDS', '3'))
kits = sys.argv[1:]
os.makedirs(os.path.join(OUT, 'rejected'), exist_ok=True)
for rnd in range(ROUNDS):
    subprocess.run([sys.executable, 'gen.py', *kits], check=False)
    todo = [f'{k}:{",".join(s for s in LAYOUTS if os.path.exists(os.path.join(OUT, f"{k}-{s}.png")) and not os.path.exists(os.path.join(OUT, f"{k}-{s}.png.check.json")))}' for k in kits]
    todo = [t for t in todo if not t.endswith(':')]
    if todo: subprocess.run([sys.executable, 'check.py', *todo], check=False)
    bad = 0
    for k in kits:
        for s in LAYOUTS:
            png = os.path.join(OUT, f'{k}-{s}.png'); cj = png + '.check.json'
            if not os.path.exists(cj): continue
            res = json.load(open(cj))
            if any(res.values()) and rnd < ROUNDS - 1:
                n = len([f for f in os.listdir(os.path.join(OUT, 'rejected')) if f.startswith(f'{k}-{s}-')])
                os.rename(png, os.path.join(OUT, 'rejected', f'{k}-{s}-{n}.png')); os.rename(cj, os.path.join(OUT, 'rejected', f'{k}-{s}-{n}.png.check.json')); bad += 1
    print('round', rnd, 'rejected', bad, flush=True)
    if not bad: break
