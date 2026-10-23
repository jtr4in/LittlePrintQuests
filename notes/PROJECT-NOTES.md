# Project notes

The shared memory for Little Print Quests, readable from any Claude account. Moved here from Claude project memory on 2026-10-23. Keep entries short, dated, and organized by subject. Add to it in the same PR as the work it describes.

Paths like `project-files/...` are in this repo. Paths like `/mnt/project-files/...` are the Claude project files folder of the original account (large binaries; see [large-files.md](large-files.md)).

## Business direction

- **Etsy is being faded out (Oct 2026).** Prioritize the direct webapp and order bot. Don't invest in new Etsy listing options. Etsy pack and party listings stay on the original 16 themes (`ETSY_THEMES` in `src/bot/listings.js`).
- **Growth plan to $100k/yr (2026-10-23).** Claude Doc: https://claude.ai/artifact/4Zs7QAnNVzZ3h82ZnQh2oL (owned by the original account). $100k is about $8.3k/mo, or 350 to 700 orders/mo depending on AOV ($24 vs $12). Pillars: parent site orders $55k, teachers/TpT and classroom licenses $20k, repeat (Family Pass / "Play Club" subscription) $15k, partners $10k. Channels ranked: Pinterest > TpT > SEO idea pages > birthday reminder email > creator gifting > ads (only once AOV is $25+). Stages: Stage 0 (to Dec 2026) analytics, email capture, default to bundle; Stage 1 (H1 2027) TpT launch, 10 pins/day; Stage 2 (H2 2027) Play Club, classroom licenses; Stage 3 (2028) scale. As of 2026-10-23 there were zero sales, so the first goal is the first 10 to 25 sales. Advice only so far, nothing built; if Jason picks an item, start with Stage 0.

## Jason's preferences

- Threads merge their own PRs once tests pass (said 2026-10-23), squash into main. Reason: PRs were piling up and landing out of order (the #88/#91/#93/#94 stack left a duplicate lede in `docs/index.html`, fixed in #95).
- Site copy says "kid", not "child" (keep "child" only for formal spots like policies).
- Don't pigeonhole the site as birthday-only; rotate occasions (rainy day, sleepover, snow day, Halloween, playdate, Christmas, Valentine's, Easter, weekend).
- Keep the site calm (2026-10-23, from Jason's wife: the old one-page site felt like "a lot coming at her"). One idea per section, short copy, ordering on its own page. Never drop a feature to get there (name previews, hero banners, order stack, galleries): move it instead.
- Photos: pieces must be cut to shape and used as the real thing, staged "like an Instagram mom, just perfect". DIY cardboard builds sell best. Never glue cut-and-assemble activity pages (lift-flap vet bag, cauldron) flat onto boxes; use signs, labels and cards on boxes instead.
- Jason runs paste-into-Gemini-app prompts himself for some image work (no API).
- Jason raises the Gemini spend cap himself at ai.studio/spend when it hits the monthly cap (HTTP 429 "exceeded its monthly spending cap").

## Products and how they're built

### Themes and kits
- All 27 play kits are hunt themes with party packs, so every theme has an everything bundle (PR #87, 2026-10-23). The 11 shop kits (pizza, burger, grocery, post, library, police, dentist, petshop, coffee, italian, auto) have `hunt: '<id>'` and `bigSign: true` in their kit defs; the defs' `shop` key is a different thing (the shop config). Shop kits are website-only. Sample PDFs: `/mnt/project-files/scavenger-hunt/shop-kit-hunts/`.

### Hunt bonus games (PR #91, 2026-10-23)
- Every hunt PDF ends with replay bonus games, lists in `src/generator/bonus.js`: a Picture Hunt (12 cut-out picture cards plus a page with 2 checklists) and a Look-around hunt (12 themed finds to spot outside).
- Page order: guide, briefing, cards, puzzle, cert, then the 3 bonus pages. `scripts/site-images.js` picks pages by negative index (puzzle -5, cert -4, bonus -2), so update it if the page count changes.
- Picture lists use kit art `'slug|Label'` or `'theme/slug|Label'`, emoji, or `'svg:name'`. `bonus: false` in a config turns them off.

### Wow props (PR #103, 2026-10-23)
- One realistic prop per kit (like vet X-rays), most fit a play kitchen spot. `def.wow` text is shown by `wowPage` in `src/kits/extras.js`, with `src/kits/art/<kit>/wow.webp` made by `scripts/wow-cutout.py`.
- Prompts: `project-files/pretend-play/wow/` (run `tools/genall.sh` with `bash`). Raw images and `all-wow-pages.jpg` are large files.
- Gotcha: Gemini "white" studio backgrounds come back grey and shadowed, so pale pieces (snow globe, unicorn, cake) are made on chroma green, listed in `GREEN` in `prompts.py`.
- The wow page is the third Play kit sample in the order preview gallery for every theme, big and little (PR #106, captioned "Wow piece"); `wowPage()` in `scripts/gallery-images.js` finds its page number. The order stack cards still show the first toy page.

### Activity packs (PR #107, 2026-10-23)
- Jason asked for more pages ("do them all"). Pages live in `src/kits/activities.js`; the `PAGES` list there sets the order and which age version gets each page, and the cover checklist and `activityCount` come from it. Big kids (5 to 8): 15 pages plus cover. Little kids (2 to 4): 16 pages plus cover.
- Both ages: clean-up, trace the words, match it up, how many, I spy, spot the difference, which one is different, find the way (maze), color by number (color by dot for little kids), draw yourself as the kit's boss, my adventure story (little kids circle pictures instead of writing), invent something new.
- Little kids only: trace the path, dot the letter (first letter of the kid's name), shapes and colors, stick it on (cut and glue on shadows). Dot the letter and stick it on are marked "Print & Play" (paper); everything else is "Wipe & Play".
- Big kids only: word search, secret code (a themed "YOU ..." message per kit in `SECRETS`, in picture code; the answer is printed upside down at the bottom), roll a silly creature.
- Color-by-number pictures: one emoji per kit in `MOSAIC_PICS`, turned into crayon-color grids in `src/kits/mosaics.json` by `node scripts/color-mosaics.js [kit]` (18 squares on the long side for big kids, 11 for little). Pick pictures with 3+ clear colors; single-color emoji (dino, shield, tooth) make dull pages. Re-run the script after changing `MOSAIC_PICS`.
- Previews: the order gallery shows big = cover, I spy, secret code, color by number, roll a creature; little = cover, trace the path, stick it on, color by dot, I spy. Don't preview dot the letter: its big letter is drawn from the name, so the name-swap overlay can't change it.
- To refresh only the activity previews: run `gallery-images.js`, `git checkout` every changed file without "activity" in its path, and in `docs/img/n/<set>.json` keep main's entries and swap in only the `activity` keys.
- Sample PDFs (Maya, both ages, dino, pirate, unicorn, space, pizza): `/mnt/project-files/activity-packs/`.

### Play kitchen fit (PR #98, 2026-10-23)
- Kits should work with IKEA Duktig and KidKraft (Vintage, Ultimate Corner) play kitchens. Measurements come from retail listings: Duktig oven glass about 8x8 in, back opening about 26.75x12.5 in; KidKraft Vintage oven shelf 10.4x8.1 in. Only the pizza oven didn't fit; it's now a 7.6 in square plus a separate woodpile strip.
- Trademarks: "fits IKEA Duktig" wording is OK, no logos, no implied endorsement.
- Report and Gemini-app prompts: `project-files/pretend-play/kitchen-lifestyle/play-kitchen-fit-and-gemini-prompts.md`.
- Open idea: a grill piece for Burger and an espresso machine piece for Coffee.

### Cardboard how-to guides (PR #82, 2026-10-23)
- Flat-vector "Build it from a box" step guides for all 27 kits, 6 steps each, 1600x2400. Rules: builds must make sense, pieces are cut to shape, activity pages never glued flat on boxes.
- Tools: `project-files/pretend-play/how-to/tools/` (`cut.py` cuts real pieces from rendered pages, `draw.py` SVG primitives plus post and pizza builds, `kits.py` the `BUILDS` dict for the other 25, run `python3 kits.py [kit...]`, `shot.js` screenshots; scratch path set by env var `HS` in `draw.py`).
- Site: `docs/img/howto/<kitid>.webp` plus `-sm.webp`; HOWTO map in `scripts/idea-pages.js` and `docs/js/data.js`. Shown on kit idea pages, as the last Play kit page in the order preview gallery, and as a card on the What's in the box Play kit tab.

## Site mechanics

### Site pages (PR for the calmer home page, 2026-10-23)
- The one-page site was split. `docs/index.html` is the home page (name hook, rotating hero banner, how it works, photos, themes, what's in the box, pricing, Family Pass, links to the other pages, free sample, FAQ). `docs/make/` is the step-by-step order page: who, theme, what's inside (everything ticked, $19.99), hiding spots and/or party details (skipped if neither), checkout. `docs/play-kits/` and `docs/handprint-art/` hold the shop kits and handprint packs with their preview galleries and buy forms.
- Shared code: `docs/css/site.css`, `docs/js/data.js` (THEMES, KITS, SPACES, LAYERS, PRICES, PAGES, GALLERY, HOWTO, SHOP_KITS, CRAFTS, CHECKOUT_URL), `docs/js/site.js` (menu, `Gallery.open`, `setPages`, `goCheckout`), `docs/js/names.js`. Page code: `docs/js/home.js`, `docs/js/make.js`, inline scripts on the play-kits and handprint pages.
- Subfolder pages use `<base href="../">` so every path stays root-relative like the home page. On those pages don't use `href="#x"` or a hash in `pushState` (they'd resolve to the home page); use `./#x` for home sections.
- make/ takes `?theme=`, `?space=`, `?age=`, `?kit=` (just the play kit) and `?pick=hunt+kit`. Old links (`/?theme=dino#order`, already-posted Pinterest pins, the bot's `#order` email links and Stripe cancel URL) are forwarded to make/ by a script at the top of `docs/index.html`, so the bot wasn't changed. `#pass` still lands on the home page's Family Pass card.
- Tried the kits' wow prop cutouts as the theme tiles (PR #112, 2026-10-23); Jason said it looked bad and it was reverted. Ask before trying again.
- Theme tiles show one cute illustration from each theme's kit art (Jason approved, 2026-10-23): `scripts/theme-icons.py` makes `docs/img/icons/<theme>.webp` from the picks in its `ICONS` map (some borrow another kit's art: café = cocoa mug, pizza = pizza slice, dentist = smiling tooth, italian = spaghetti). Edit the map and re-run it to swap a pick. The older `docs/img/themes/` thumbnails are no longer shown.
- Theme pickers are two rows of tiles that swipe sideways (`.themes.mini.rows`), not a tall grid: 27 tiles made the page too long on phones (Jason, 2026-10-23). The order page also has a theme dropdown kept in step with the tiles.
- Photos and theme tiles open the preview gallery with a "Make this" button instead of jumping to the order form.

### Name swap previews (2026-10-23)
- The homepage "type your kid's name" hook live-updates all previews. `renderHtml(..., { nameSlots: 'Maya' })` also writes `pngDir/blank/` pages with the name hidden plus `slots.json`. `gallery-images.js`, `site-images.js`, `craft-gallery.js` and `hero-scenes.js` write twins to `docs/img/n/<same path>` and per-set JSON `docs/img/n/<set>.json`. `docs/js/names.js` swaps each matching `<img>` and draws the typed name (scenes use layers plus SVG masks). Name saved in localStorage `lpq.kidName`.
- Regenerate in order: `gallery-images.js` -> `craft-gallery.js` -> `site-images.js` -> `hero-scenes.js`. If you only meant to refresh twins, `git checkout` the non-`n` images afterwards (they re-encode slightly differently). If a print layout changes, re-run the scripts or the overlay text sits in the old spot.

### Page counts (PR #104, 2026-10-23)
- The "45 pages" bubbles come from a hardcoded `PAGES` line in `docs/js/data.js`. When pages are added to a kit, activity pack, party pack or craft, run `node scripts/page-counts.js` and paste the printed line over `PAGES`. Hunts follow 7 + ceil(spots/2) pages; the script throws if that changes.
- The order-stack hint says "Tap to see sample pages" (the gallery is only samples).

### Shop kit card photos (2026-10-23)
- The 11 shop kit card thumbnails (`docs/img/kit-<id>.webp`, 1354x994, used by `SHOP_KITS` in `docs/js/data.js`) are styled Gemini photos, each starring the kit's signature piece, prompts say "no cash register". Prompts and scripts: `project-files/scavenger-hunt/previews/shop-kit-cards/`. Gemini redraws kit art loosely; use the round 4 lifestyle tools to restore exact art.

## Lifestyle photo pipeline (2026-10-22)

Tools: `project-files/scavenger-hunt/previews/lifestyle/tools/`. Outputs are large files under `/mnt/project-files/scavenger-hunt/previews/lifestyle/`.

- Round 1: `render.js` renders kit pages (via `src/kits/render-kit.js`, sample kid Maya); `gen.py` asks `gemini-3-pro-image` for a scene with one blank portrait sheet, all corners visible, no faces (hands only); `corners.py` asks `gemini-3.1-pro-preview` for paper corners (cached as `<scene>.corners.json`); `comp.py` refines edges with RANSAC and warps the real page in. Run corners calls one at a time (rate limits). Prompts must say "short edge faces the camera".
- Round 2 (feedback from Jason's wife): show many printouts together, like a full play-stand setup. `multi.py` + `corners_multi.py`. Stand prompts ask for a 3:2 header sign (only shop kits have the 2-page big sign).
- Round 3: DIY cardboard builds with pages on them (`gen_r3.py`). This style sells.
- Round 4: pieces cut to shape and staged (`tools/round4/`): `cutout.py`, `circcut.py` -> `gen_ref.py` sends cutouts as "Image N" refs ("3:2 sheet NOT a long strip", "never redraw/crop/cut holes") -> `locate.py` + `zoomcorners.py` find quads -> `restore.py` warps the real piece in (fit stretch/cover/contain, anchor, grow, clear, occluder polygons + GrabCut). `gen_edit.py` fixes one bad piece. Gemini sometimes paints reference numbers into the scene (inpaint them), and real dollar bills get drawn (replace with kit money). Pizza and dino approved.
- Products round: styled photos for party pack, scavenger hunt, activity pack (`tools/products/`). Bunting pennant quads are a parallelogram from top corners plus apex with fit contain; Gemini can re-render a small printed tag via `gen_edit`; for a half-drawn maze, solve it on a cell grid and draw the path before warping.

## Environment gotchas

- The repo pins playwright 1.56.1, which doesn't match the container's browser. Easiest fix: a preload that wraps `chromium.launch` to pass `executablePath: '/opt/pw-browsers/chromium'`, run as `node -r pre.js scripts/<script>.js`.
- To click through the site locally: `python3 -m http.server` in `docs/`, then Playwright with the preload above. `npm test` also needs the preload (`node -r pre.js test/smoke.js`).
- Some tools in `project-files/` still hard-code `/mnt/project-files/...` paths; adjust them if that folder doesn't exist in your account.
