# Writes the illustration shopping list for the play kits: every picture each kit prints,
# grouped into 3x3 sheets with a ready-to-paste prompt for an image generator.
# Make each sheet, then run scripts/art-import.py on it to cut it into src/kits/art/<kit>/.
# Usage: python3 scripts/art-list.py [kit ...] > kit-art-prompts.md   (also writes art-sheets.json)
import json, os, subprocess, sys, unicodedata

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
PER_SHEET = 9
STYLE = ('Children\'s storybook illustration in soft watercolor and colored pencil, warm and friendly, '
         'gentle dark outlines, bright cheerful colors, cute rounded shapes, high quality, consistent style. '
         'A 3 by 3 grid of nine separate objects on a plain pure white background: each object is centered '
         'in its own cell with plenty of white space around it, and nothing touches or overlaps. '
         'No text, no letters, no numbers, no borders, no grid lines, no frames, no shadows on the background.')

JS = r'''
const {KITS,buildKitHtml}=require('./src/kits/engine');const art=require('./src/kits/art');
const only=JSON.parse(process.argv[1]);const out=[];
for(const k of Object.values(KITS)){ if(only.length&&!only.includes(k.id))continue;
  buildKitHtml({kit:k.id,childName:'Maya',age:6,subjects:[],lenient:true});
  const info=new Map(art.kitPictures(k).map(p=>[p.e,p]));
  out.push({id:k.id,name:k.name,tagline:k.tagline,pictures:art.usedPictures().map(e=>({e,name:info.get(e)?.name||'',slug:info.get(e)?.slug||art.slug([...e].map(c=>c.codePointAt(0).toString(16).toUpperCase()).filter(c=>c!=='FE0F').join('-'))}))});
}
console.log(JSON.stringify(out));
'''

def describe(e):
    names = [unicodedata.name(c, '').lower() for c in e if unicodedata.name(c, '') and c not in '️‍']
    return ' '.join(n for n in names if 'selector' not in n and 'modifier' not in n)

def main():
    kits = json.loads(subprocess.check_output(['node', '-e', JS, json.dumps(sys.argv[1:])], cwd=ROOT))
    sheets = {}
    print('# Play kit illustrations\n')
    print('Each sheet below is one image. Paste the prompt into your image tool, keep the result square, '
          'and upload it here saying which kit and sheet it is. The nine pictures are read left to right, top to bottom.\n')
    for k in kits:
        pics = k['pictures']
        count = -(-len(pics) // PER_SHEET)
        cuts = [round(i * len(pics) / count) for i in range(count + 1)]
        groups = [pics[a:b] for a, b in zip(cuts, cuts[1:])]
        print(f"## {k['name']} ({k['id']}): {len(pics)} pictures, {len(groups)} sheets\n")
        for n, group in enumerate(groups, 1):
            items = []
            for p in group:
                d = describe(p['e'])
                label = p['name']
                what = f"{d} (for “{label}”)" if label and label.lower() not in d else d
                items.append(what)
            sheets[f"{k['id']}-{n}"] = [p['slug'] for p in group]
            n_items = len(group)
            words = {4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine'}
            style = STYLE if n_items == 9 else STYLE.replace('A 3 by 3 grid of nine', f'A grid of {words.get(n_items, n_items)}, in rows of three, of')
            listing = ' '.join(f'{i}. {w}.' for i, w in enumerate(items, 1))
            print(f"### Sheet {k['id']}-{n}\n")
            print(f"```\n{style} Theme: a kids' pretend {k['name'].lower()} ({k['tagline'].lower()}). "
                  f"The objects, left to right, top to bottom: {listing}\n```\n")
    with open(os.path.join(ROOT, 'src', 'kits', 'art', 'sheets.json'), 'w') as f:
        json.dump(sheets, f, indent=1, ensure_ascii=False)
        f.write('\n')

main()
