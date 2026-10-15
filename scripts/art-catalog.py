# Lists every illustration in src/kits/art/ in src/kits/art/catalog.json: its file, the kit it was
# made for, the emoji it stands in for, its label in that kit and what it shows. Kits use the catalog
# to borrow a picture they don't have their own of (see src/kits/art.js), so a new theme only needs
# sheets for pictures nobody has drawn yet. Run it after scripts/art-import.py.
# Usage: python3 scripts/art-catalog.py
import json, os, re, subprocess, unicodedata

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
ART = os.path.join(ROOT, 'src', 'kits', 'art')
JS = r'''
const {KITS}=require('./src/kits/engine');const art=require('./src/kits/art');
const code=(e)=>[...e].map(c=>c.codePointAt(0).toString(16).toUpperCase()).filter(c=>c!=='FE0F').join('-');
const out={};for(const k of Object.values(KITS)){const m={};for(const p of art.kitPictures(k))m[p.slug]={e:p.e,name:p.name};
  for(const p of art.kitPictures(k))m[art.slug(code(p.e))] ||= {e:p.e,name:''};out[k.id]=m;}
console.log(JSON.stringify(out));
'''

def describe(e):
    return ' '.join(unicodedata.name(c, '').lower() for c in e if unicodedata.name(c, '') and c not in '️‍')

def main():
    kits = json.loads(subprocess.check_output(['node', '-e', JS], cwd=ROOT))
    out = []
    for kit in sorted(os.listdir(ART)):
        if not os.path.isdir(os.path.join(ART, kit)):
            continue
        for f in sorted(os.listdir(os.path.join(ART, kit))):
            slug = f.rsplit('.', 1)[0]
            p = kits.get(kit, {}).get(slug)
            if not p and re.fullmatch(r'[0-9a-f]{4,5}(-[0-9a-f]{4,5})*', slug):
                p = {'e': ''.join(chr(int(c, 16)) for c in slug.split('-')), 'name': ''}
            if not p:
                print('No picture in the', kit, 'kit is called', slug)
                continue
            out.append({'file': f'{kit}/{f}', 'kit': kit, 'emoji': p['e'], 'label': p['name'], 'shows': describe(p['e'])})
    with open(os.path.join(ART, 'catalog.json'), 'w') as fh:
        json.dump(out, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    print(len(out), 'pictures,', len({x['emoji'] for x in out}), 'different things')

main()
