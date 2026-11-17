# Round 3 (Jason's wife, 2026-11-16): sharp redraws of her Adoption Agency sign, Adopted Pet bone
# tags and X-ray screen (her files were small screenshots), plus a fishbowl and cut-out fish.
# Usage: REFS=<dir with ref pngs> OUT=<raw dir> python3 gen_round3.py [name ...]
import base64, json, os, sys, time, urllib.error, urllib.request
MODEL = os.environ.get('MODEL', 'gemini-3-pro-image')
REFS = os.environ['REFS']; OUT = os.environ['OUT']
os.makedirs(OUT, exist_ok=True)
SAME = ("Recreate the design in the reference picture as a crisp, sharp, high-resolution print file. Keep everything the same: "
        "the layout, shapes, colors, bold navy outlines, flat cartoon style and the exact words. Pure white background, no shadow. ")
STYLE = ("Flat cartoon vector style for a children's printable, like the reference picture: bold rounded navy outlines, bright flat colors, "
         "soft highlights. Pure white background, no shadow, no text. No faces, eyes or smiles on any object (animals and fish may have normal faces). ")
JOBS = [
 ('adoption-sign', '3:2', SAME + "The words read exactly: Adoption Agency.", 'adoption.png'),
 ('adopted-tags', '3:2', SAME + "Six bone-shaped name tags in two columns and three rows, each reading exactly: Adopted Pet, with an empty white box to write a name. Leave clear white space between the tags so each can be cut out.", 'tags.png'),
 ('xray-screen', '3:2', SAME + "The heading reads exactly: X-RAY. The small screen text reads exactly: SCANNING...", 'xray.png'),
 ('fishbowl', '3:4', STYLE + "One big round glass fishbowl filling most of the picture, seen from the front: a wide open rim at the top, clear light blue water, a layer of colorful pebbles on the bottom, two green water plants and a small sandcastle. No fish at all: the water is empty so paper fish can be placed on it. The glass has a soft white shine on one side.", 'adoption.png'),
 ('fish', '1:1', STYLE + "A sheet of nine different cute cartoon fish for children to cut out, in a neat 3 by 3 grid with wide white space between them so none touch: an orange goldfish, an orange and white striped clownfish, a yellow angelfish, a round spiky puffer fish, a blue tang, a purple betta with flowing fins, a green striped fish, a pink fish with spots and a little red fish. Each fish faces sideways, is about the same size and has a thick navy outline.", 'adoption.png'),
]
# Round 3b (Jason, 2026-11-17): medicine jar labels. Fill patterns for the label ends, in the same
# watercolor style as the food fills (reference: src/kits/art/vet/fill/bones.jpg). MODEL=gemini-3.1-flash-image is enough.
FILL = ("Make a new seamless pattern in exactly the same style as the reference picture: soft watercolor with thin brown ink outlines, "
        "a tightly packed pile filling the whole frame edge to edge, seen from above, no background showing, no text, no faces on anything. The pile is ")
JOBS += [
 ('pills', '16:9', FILL + "round pet medicine tablets, white and light blue, some with a score line across the middle.", 'bones.png'),
 ('vitamins', '16:9', FILL + "chewy heart-shaped pet vitamins in soft pink, orange and yellow.", 'bones.png'),
 ('capsules', '16:9', FILL + "two-tone medicine capsules, half white and half red, green or purple.", 'bones.png'),
 ('drops', '16:9', FILL + "small brown glass dropper bottles with white rubber tops, lying in a jumble.", 'bones.png'),
]
def part(name):
    return {'inlineData': {'mimeType': 'image/jpeg' if name.endswith('jpg') else 'image/png', 'data': base64.b64encode(open(os.path.join(REFS, name), 'rb').read()).decode()}}
want = set(sys.argv[1:])
for name, ar, text, ref in JOBS:
    if want and name not in want: continue
    out = os.path.join(OUT, f'{name}.png')
    if os.path.exists(out) and os.path.getsize(out): continue
    body = {'contents': [{'parts': [part(ref), {'text': text}]}], 'generationConfig': {'responseModalities': ['IMAGE'], 'imageConfig': {'aspectRatio': ar, 'imageSize': '2K'}}}
    req = urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent', data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
    r = None
    for attempt in range(5):
        try: r = json.load(urllib.request.urlopen(req, timeout=400)); break
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 503): print('FAIL', name, e.code, e.read()[:300]); break
            time.sleep(20 * (attempt + 1))
    p = (r or {}).get('candidates', [{}])[0].get('content', {}).get('parts', [])
    img = next((x['inlineData']['data'] for x in p if 'inlineData' in x), None)
    if img: open(out, 'wb').write(base64.b64decode(img)); print('ok', name, flush=True)
    else: print('FAIL', name, json.dumps(r)[:300], flush=True)
