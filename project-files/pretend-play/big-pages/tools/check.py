# Checks generated big pages with a Gemini vision model: faces on objects, wrong or extra words.
# Usage: OUT=dir python3 check.py kit[:slot,..] ...  -> prints one JSON line per picture, writes <png>.check.json
import base64, json, os, re, sys, urllib.request, time
from concurrent.futures import ThreadPoolExecutor
from layouts import prompt, LAYOUTS
from kits import K
OUT = os.environ.get('OUT', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'raw'))
MODEL = os.environ.get('CHECK_MODEL', 'gemini-3.5-flash')
ASK = '''You are checking a printable page for a children's pretend-play kit before it is sold. Look very carefully at the whole image, including small icons.
Report problems as JSON only: {"faces": [...], "text": [...], "other": [...]}
- "faces": every NON-living thing drawn with a face (eyes, mouth, smile or blush cheeks): food, drinks, objects, tools, vehicles, buildings, plants, sun, moon, stars, clouds, teeth, eggs. People and animals with faces are fine. A drawn face on a mask, a puppet, a costume or a printed mood icon is fine.
- "text": every word that is misspelled, garbled, nonsense, cut off, duplicated by mistake, or reads like an instruction to an artist (e.g. "print-ready sheet", "IMPORTANT", "no faces"). The intended words are listed below; small extra words that make sense (like a number on a dial) are fine.
- "other": anything clearly broken: the number of cards, labels or signs differs from the brief, an item repeated that should appear once, a block of small print or a bullet list that is not part of the design (it is the artist's notes leaking in), a skull, the design only filling part of the image with a big empty area, a mangled hand or body, pieces cut off at the edge.
Read the small print too. Use empty lists when fine.
THE BRIEF: '''

def check(kit, slot):
    png = os.path.join(OUT, f'{kit}-{slot}.png')
    if not os.path.exists(png): return
    _, text = prompt(K[kit], slot)
    brief = text.split(' ART NOTES')[0]
    words = sorted(set(re.findall(r'"([^"]+)"', text)) - {'GLUE OR TAPE HERE', 'DID YOU KNOW?'} | {'GLUE OR TAPE HERE', 'DID YOU KNOW?'})
    body = {'contents': [{'parts': [{'text': ASK + brief + '\nINTENDED WORDS: ' + json.dumps(words)}, {'inlineData': {'mimeType': 'image/png', 'data': base64.b64encode(open(png, 'rb').read()).decode()}}]}],
            'generationConfig': {'responseMimeType': 'application/json'}}
    req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent', data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
    for a in range(5):
        try: r = json.load(urllib.request.urlopen(req, timeout=300)); break
        except Exception as e: time.sleep(10 * (a + 1))
    else: print(json.dumps({'kit': kit, 'slot': slot, 'error': True})); return
    try: res = json.loads(r['candidates'][0]['content']['parts'][-1]['text'])
    except Exception: res = {'other': ['unreadable check']}
    res = {k: res.get(k, []) for k in ('faces', 'text', 'other')}
    json.dump(res, open(png + '.check.json', 'w'))
    print(json.dumps({'kit': kit, 'slot': slot, 'ok': not any(res.values()), **res}), flush=True)

jobs = []
for arg in sys.argv[1:] or K:
    kit, _, slots = arg.partition(':')
    jobs += [(kit, s) for s in (slots.split(',') if slots else LAYOUTS)]
with ThreadPoolExecutor(int(os.environ.get('JOBS', '6'))) as ex: list(ex.map(lambda j: check(*j), jobs))
