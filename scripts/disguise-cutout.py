# Turns the raw photo booth disguise pictures (see src/kits/disguises.js and
# project-files/pretend-play/disguises/tools/) into src/kits/art/<kit>/disguise-<n>.webp with the
# same cut-out and grey cut line as the wow props.
# Usage: python3 scripts/disguise-cutout.py <raw folder> [kit ...]
import importlib.util, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('wow_cutout', os.path.join(HERE, 'wow-cutout.py'))
wow = importlib.util.module_from_spec(spec); spec.loader.exec_module(wow)

if __name__ == '__main__':
    raw, kits = sys.argv[1], sys.argv[2:]
    for f in sorted(os.listdir(raw)):
        kit, _, n = f[:-4].rpartition('-')
        if not f.endswith('.png') or (kits and kit not in kits): continue
        out = os.path.join(wow.ART, kit, f'disguise-{n}.webp')
        img = wow.cutout(os.path.join(raw, f))
        img.thumbnail((2200, 1200))  # about 7.3 x 4 inches at 300 dpi, the most a slot shows
        img.save(out, 'WEBP', quality=86, method=6)
        print('Wrote', out, img.size)
