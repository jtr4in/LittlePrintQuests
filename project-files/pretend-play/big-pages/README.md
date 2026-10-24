# Big picture pages

Full-page illustrated sheets in every play kit, modelled on the Vet Clinic package Jason's wife made
(`/mnt/project-files/Printable Vet Clinic Package.pdf`, 15 pages, each one big picture). Asked for on
2026-10-24: "each kit to have a lot more of these big images ... the other kits to match this quality".

## The page types (taken from the vet PDF)

| slot | aspect | what it is | vet PDF page it copies |
|---|---|---|---|
| hero | 4:3 | one huge showpiece prop: a map, menu board, chart or invitation | big Bird X-ray |
| cards | 4:3 | four big picture cards with a caption each | Dog / Cat / Rabbit / Turtle X-rays |
| wear | 3:4 | one wrap-around piece with glue tabs (hat band, cuff, cast, crown) plus kids wearing it | Pretend Cast |
| signs | 3:4 | six tall signs and charts (shop sign, checklist, list, room sign) | Vet Clinic, Check-up chart, Services... |
| strips | 3:4 | ten patterned strips (box seals, sashes, bandages, tape) | Pretend Bandages |
| forms | 3:4 | twelve mini cards: order slip, open/closed, price list, punch card, coupon, award | the clinic forms page |
| labels | 4:3 | two groups of twelve jar or bin labels | Medicine bottle and food jar labels |
| screen | 4:3 | a tablet or screen showing a kids' app for the kit | Make an Appointment tablet |
| rooms | 4:3 | twelve room / station door signs | Waiting Room, X-Ray Room... |
| poster | 4:3 | a labelled learning poster with a kid character and a "Did you know?" | Cat / Dog X-ray posters |

The vet kit uses all 15 of her pages as they are. Every other kit gets the ten above.

## Tools (`tools/`)

- `layouts.py`: one prompt template per slot. The art notes (style, no faces on objects, spell exactly) go last, marked "never written on the sheet": put plainly, Gemini printed them on the page.
- `kits.py`: the words and pictures for each kit's ten pages. Every word that should appear is in quotes; anything without quoted words is left blank, or Gemini fills it with nonsense words.
- `gen.py`: `OUT=<dir> python3 gen.py kit[:slot,slot] ...` makes missing pictures with `gemini-3.1-flash-image` at 2K.
- `check.py`: asks `gemini-3.5-flash` to look for faces on objects, misspelled or nonsense words, leaked prompt text, wrong counts, repeated items and skulls. Writes `<png>.check.json`.
- `run.py`: `OUT=<dir> python3 run.py kit ...` generates, checks and retries (3 rounds; rejects go to `<dir>/rejected/`). About 40% fail the first check, so budget about 1.6 pictures per page.
- `import.py`: `RAW=<dir> python3 import.py kit ...` turns them into `src/kits/art/<kit>/big/NN-<slot>.jpg` plus `pages.json` (portrait, landscape ones turned, 1900 px, JPEG). `python3 import.py --vet <pdf>` pulls the vet pages out of her PDF.

Always look at a contact sheet of each kit before importing: the checker misses some things (a skull on a hat, a picture that only fills half the sheet) and flags harmless ones.
