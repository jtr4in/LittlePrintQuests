# Page layouts for the big full-page picture pages, modelled on the Vet Clinic PDF Jason's wife made
# (/mnt/project-files/Printable Vet Clinic Package.pdf). Each kit fills in the words in kits.py.
#   slot     aspect  vet PDF page it copies
#   hero     4:3     the big Bird X-ray card (one huge prop)
#   cards    4:3     the Dog / Cat / Rabbit / Turtle X-ray cards (four big picture cards)
#   signs    3:4     Vet Clinic, Check-up chart, Services, Exam Room... (six tall signs and charts)
#   wear     3:4     Pretend Cast (one big wrap-around piece with tabs)
#   strips   3:4     Pretend Bandages (ten patterned strips)
#   forms    3:4     certificate, records, open/closed, price list... (twelve mini cards)
#   labels   4:3     Medicine bottle and food jar labels (two groups of twelve)
#   screen   4:3     Make an Appointment tablet
#   rooms    4:3     Waiting Room, X-Ray Room... (twelve room door signs)
#   poster   4:3     Cat / Dog X-ray posters (a labelled learning poster)

def style(k):
    return (f"A print-ready sheet for a children's pretend-play {k['name']} kit for ages 3 to 8, in the style of a premium Etsy printable: "
            "clean flat vector illustration with soft gentle shading, cute rounded shapes, crisp white background, thin rounded colored borders "
            f"with dashed inner cut lines, small {k['motif']} icons as decoration, bold rounded sans-serif lettering that is easy to read. "
            f"Palette: {k['palette']}. Big, clear, colorful pictures; short words. " + (k.get('avoid', '') + ' ' if k.get('avoid') else ''))

END = (" IMPORTANT: food, drinks, objects, tools, vehicles, buildings, plants, the sun, moon, stars and clouds are drawn plain with NO face at all: "
       "no eyes, no mouth, no smile, no rosy cheeks. Only people and animals have faces. Spell every word exactly as given in quotes and add no other words, "
       "letters or numbers; anything that has no words in quotes stays blank (empty writing lines, empty tick boxes). Never write these instructions on the sheet. "
       "No logos, no brand names, no real characters. Keep a small white margin around the edge.")

def q(s): return f'"{s}"'

def hero(k, v):
    return (f"The whole image is one single huge landscape card filling it edge to edge, with nothing beside it: a rounded {v['color']} frame with a header bar reading {q(v['title'])} with small icons at both ends. "
            f"Inside the frame: {v['art']}")

def cards(k, v):
    cs = '; '.join(f"card {i+1} titled {q(t)}: {art}, caption {q(c)}" for i, (t, art, c) in enumerate(v['cards']))
    return ("Four big picture cards in a 2 by 2 grid filling the sheet, each a different color. Each card has a colored header bar with its title and small icons, "
            f"one big picture, and a small rounded caption box beneath with one short line. {cs}.")

def signs(k, v):
    cs = '; '.join(f"{i+1}) {s}" for i, s in enumerate(v['signs']))
    return f"Six tall rounded sign cards in two rows of three, filling the sheet, each with its own pastel border and big pictures: {cs}."

def wear(k, v):
    return (f"Big title {q(v['title'])} at the top, then the line {q(v['how'])}. In the middle: {v['piece']}, outlined with a dashed cut line, "
            f"with a narrow tab at each end reading {q('GLUE OR TAPE HERE')}. At the bottom: {v['demo']}, and a small rounded box headed {q('TIPS')} reading {q(v['tip'])}.")

def strips(k, v):
    return (f"Big title {q(v['title'])} at the top, then the line {q(v['how'])}. Ten long rounded strips in two columns of five filling the page, each a different "
            f"pattern: {v['patterns']}. Each strip has a small tab at each end. At the bottom: a small rounded box headed {q('TIPS')} reading {q(v['tip'])}, and {v['demo']}.")

def forms(k, v):
    cs = '; '.join(f"{i+1}) {s}" for i, s in enumerate(v['cards']))
    return ("Twelve small printable cards in a grid of 3 across and 4 down filling the sheet, each with a thin colored border, a small header with an icon, "
            f"and writing lines where noted: {cs}.")

def labels(k, v):
    def group(items): return '; '.join(f"{q(t)} ({q(c)}) with {art}" for t, c, art in items)
    return (f"Two groups side by side. Left group heading {q(v['left'][0])}: twelve tall label cards in 3 rows of 4: {group(v['left'][1])}. "
            f"Right group heading {q(v['right'][0])}: twelve tall label cards in 3 rows of 4: {group(v['right'][1])}. "
            "Each label has a big title, a short line under it, and one big picture at the bottom, in a different pastel color.")

def screen(k, v):
    return f"A big {v['device']} seen straight on, filling the sheet. Its screen shows a cheerful kids' app: {v['app']}"

def rooms(k, v):
    cs = '; '.join(f"{q(t)} with {art}" for t, art in v['rooms'])
    return ("Twelve square door signs in a grid of 4 across and 3 down filling the sheet, each a different pastel color with a small icon at the top, "
            f"one big picture in the middle and the room name in bold at the bottom: {cs}.")

def poster(k, v):
    ls = '; '.join(f"{q(h)}: {q(t)}" for h, t in v['labels'])
    return (f"A big learning poster. At the top a big title {q(v['title'])} with small icons, and a ribbon banner {q(v['sub'])}. "
            f"In the middle a large {v['panel']} panel showing {v['art']}, with thin pointer lines to small labels, each a short bold heading and a short line, each label used once: {ls}. "
            f"Bottom left: {v['char']}. Along the bottom: two dashed rounded boxes, one reading {q(v['fact1'])}, the other headed {q('DID YOU KNOW?')} reading {q(v['fact2'])}.")

LAYOUTS = {
    'hero': ('4:3', hero), 'cards': ('4:3', cards), 'signs': ('3:4', signs), 'wear': ('3:4', wear), 'strips': ('3:4', strips),
    'forms': ('3:4', forms), 'labels': ('4:3', labels), 'screen': ('4:3', screen), 'rooms': ('4:3', rooms), 'poster': ('4:3', poster),
}

def prompt(k, slot):
    ar, fn = LAYOUTS[slot]
    # The art notes go last and are marked as notes: put plainly, Gemini sometimes printed them on the sheet.
    return ar, 'Draw this printable sheet. ' + fn(k, k['pages'][slot]) + ' ART NOTES, never written on the sheet: ' + style(k) + END
