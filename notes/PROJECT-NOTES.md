# Project notes

The shared memory for Little Print Quests, readable from any Claude account. Moved here from Claude project memory on 2026-10-23. Keep entries short, dated, and organized by subject. Add to it in the same PR as the work it describes.

Paths like `project-files/...` are in this repo. Paths like `/mnt/project-files/...` are the Claude project files folder of the original account (large binaries; see [large-files.md](large-files.md)).

## Handoff: where things stand

Jason switches between two Claude accounts, sometimes when one runs low on usage. Keep this section current: before stopping, merge what's done, push anything half-finished to a branch, and list it here with what's left. Replace the list each time; history lives in the sections below and in git.

Last updated 2026-10-23 21:35 (after PR #120).

Work in flight is listed under **In progress** below.
- Today's site work, all live: the site split into a home page plus `make/`, `play-kits/` and `handprint-art/` (#110); swipeable theme rows with a dropdown (#111); theme tiles with one cute illustration each (#114, after the wow-prop tiles were tried and reverted, #112/#113); home leads with the four products, plus the phone checkout bar (#115); phone speed fixes (#116); theme dropdown without ages (#117); product pictures on the Stripe checkout (#118).
- Waiting on Jason: set the Stripe logo and colors in the Dashboard (see "Stripe checkout page" below), and check that Railway redeployed the order bot after #118 (a test checkout should show a picture beside the product).
- Ideas raised but not started: the Stage 0 growth items (analytics, email capture); a grill piece for Burger and an espresso machine for Coffee (play kitchen fit).

## In progress

Work that is about to merge or is mid-merge, so sessions on the other account can hold off. Pull main and read this before starting and before merging. Add your entry directly on main (not only in your PR). Don't merge if another entry touches the same files; wait or coordinate. Remove your entry after merging. One line each: what, branch, files touched, thread, UTC time.

- Photo booth disguises on a stick (2 Gemini props + 1 name speech bubble per kit), branch `claude/project-thread-qgt9ip`, touches new `src/kits/disguises.js`, `src/kits/engine.js` (page list), `src/kits/art/<kit>/disguise-*.webp`, `scripts/disguise-*.py`, `docs/js/data.js` PAGES, `project-files/pretend-play/disguises/`. Thread "Add wow and room-changing kit pieces", 2026-10-24 02:05 UTC.
- Seven new themes with a wow piece each (play kitchen, doctor, puppet theater, secret agent, dress-up, ice cream parlor, airport) plus manila file folders for doctor, vet and dentist, branch `claude/project-thread-oty5ss`, touches new `src/kits/defs/*.js`, `src/kits/engine.js` (KITS map), `src/kits/art/<new kits>/`, `src/generator/themes.js`, `src/generator/{puzzle,bonus}.js`, `src/party/flavor.js`, `src/host/scripts.js`, `src/kits/{signage,activities,extras}.js`, `docs/js/data.js`, `docs/ideas/`, `docs/img/`. Will rebase after the disguises PR lands. Thread "Add new pretend play themes", 2026-10-24 02:20 UTC.
- Fix stray words in Field Kit previews · branch `fix-empty-name-slots` · `src/generator/name-slots.js`, `docs/js/names.js`, `docs/img/n/*.json`, `test/smoke.js`, notes · thread session_011aUg5nhLU2T6k4vKZFPS6g · merging 2026-10-24 02:21 UTC
- Not started, parked by Jason (2026-10-23): new themes, each a full set with a wow piece: **doctor** (plus pretend manila file folders for doctor, vet and dentist), **puppet theater**, **secret agent / detective HQ**, **costume & dress-up**, **ice cream parlor**, **airport**. Needs Gemini for the kit art (not reachable from the second account until a network secret for `generativelanguage.googleapis.com` is added). Dropped: reworking the home banners around the play kit, and a themed handprint page in little kids activity packs.

## Business direction

- **Etsy is being faded out (Oct 2026).** Prioritize the direct webapp and order bot. Don't invest in new Etsy listing options. Etsy pack and party listings stay on the original 16 themes (`ETSY_THEMES` in `src/bot/listings.js`).
- **Growth plan to $100k/yr (2026-10-23).** Claude Doc: https://claude.ai/artifact/4Zs7QAnNVzZ3h82ZnQh2oL (owned by the original account). $100k is about $8.3k/mo, or 350 to 700 orders/mo depending on AOV ($24 vs $12). Pillars: parent site orders $55k, teachers/TpT and classroom licenses $20k, repeat (Family Pass / "Play Club" subscription) $15k, partners $10k. Channels ranked: Pinterest > TpT > SEO idea pages > birthday reminder email > creator gifting > ads (only once AOV is $25+). Stages: Stage 0 (to Dec 2026) analytics, email capture, default to bundle; Stage 1 (H1 2027) TpT launch, 10 pins/day; Stage 2 (H2 2027) Play Club, classroom licenses; Stage 3 (2028) scale. As of 2026-10-23 there were zero sales, so the first goal is the first 10 to 25 sales. Advice only so far, nothing built; if Jason picks an item, start with Stage 0.

## Jason's preferences

- Threads merge their own PRs once tests pass (said 2026-10-23), squash into main. Reason: PRs were piling up and landing out of order (the #88/#91/#93/#94 stack left a duplicate lede in `docs/index.html`, fixed in #95).
- Age versions are **Little kids 3 to 5** (pre-readers: picture clues, circling, thick cut lines) and **Big kids 6 to 8** (early readers); the site says ages 3 to 8 overall (Jason, 2026-10-23; it was 2 to 4 / 5 to 8). A typed age of 5 or under picks little. Orders saved before the change carry the old version labels; `products.versionOf` reads both. Already-posted pins and their pictures still say 2 to 8 / 2 to 4: re-run `scripts/pins.js` before making new pin images.
- The order page always opens on step 1 (who it's for, and the age version), even when a name is already saved; a theme, kit or items from the link stay picked (Jason, 2026-10-23).
- The grown-up's phone page is called the **Field Kit** (it was "Host Mode"; Jason, 2026-10-23), with the helper's link still called the Sidekick. Code keeps the old names (`src/host/`, `/h/<token>`, `hostToken`, `docs/img/host/`). The home page gives it its own band with three real screens. Screens are captured at 2x and saved 540x1080 as an everything-bundle order (`HOST_ONLY=1 node scripts/site-images.js` redoes just those); they were 240x480 and looked blurry.
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
- The one-page site was split. `docs/index.html` is the home page; as of PR #115 it runs: name hook with a general headline, rotating hero banner, "What you get" (four product cards plus a Host Mode line), how it works, themes, pricing with the Family Pass, links to the other pages, free sample, FAQ. `docs/make/` is the step-by-step order page: who, theme, what's inside (everything ticked, $19.99), hiding spots and/or party details (skipped if neither), checkout. `docs/play-kits/` and `docs/handprint-art/` hold the shop kits and handprint packs with their preview galleries and buy forms.
- Shared code: `docs/css/site.css`, `docs/js/data.js` (THEMES, KITS, SPACES, LAYERS, PRICES, PAGES, GALLERY, HOWTO, SHOP_KITS, CRAFTS, CHECKOUT_URL), `docs/js/site.js` (menu, `Gallery.open`, `setPages`, `goCheckout`), `docs/js/names.js`. Page code: `docs/js/home.js`, `docs/js/make.js`, inline scripts on the play-kits and handprint pages.
- Subfolder pages use `<base href="../">` so every path stays root-relative like the home page. On those pages don't use `href="#x"` or a hash in `pushState` (they'd resolve to the home page); use `./#x` for home sections.
- make/ takes `?theme=`, `?space=`, `?age=`, `?kit=` (just the play kit) and `?pick=hunt+kit`. Old links (`/?theme=dino#order`, already-posted Pinterest pins, the bot's `#order` email links and Stripe cancel URL) are forwarded to make/ by a script at the top of `docs/index.html`, so the bot wasn't changed. `#pass` still lands on the home page's Family Pass card.
- Tried the kits' wow prop cutouts as the theme tiles (PR #112, 2026-10-23); Jason said it looked bad and it was reverted. Ask before trying again.
- Theme tiles show one cute illustration from each theme's kit art (Jason approved, 2026-10-23): `scripts/theme-icons.py` makes `docs/img/icons/<theme>.webp` from the picks in its `ICONS` map (some borrow another kit's art: café = cocoa mug, pizza = pizza slice, dentist = smiling tooth, italian = spaghetti). Edit the map and re-run it to swap a pick. The older `docs/img/themes/` thumbnails are no longer shown.
- On the order page's theme step the chosen theme's banner sits at the top, above the dropdown and tiles, so picking a theme changes what you see right there (Jason, 2026-10-23).
- The order page's theme dropdown shows just the theme name, no ages (Jason, 2026-10-23): step 1 already picks little kids or big kids.
- Theme pickers are two rows of tiles that swipe sideways (`.themes.mini.rows`), not a tall grid: 27 tiles made the page too long on phones (Jason, 2026-10-23). The order page also has a theme dropdown kept in step with the tiles.
- Home page pitches all four products up top (Jason, 2026-10-23: the home page read as all hunt while most photos were play kits). Headline is general ("Printable play starring your kid"), then "What you get": four product cards (hunt, play kit, activity pages, party pack) whose galleries open with the styled photo then that product's real pages, plus a Host Mode line. The "At home" photo grid and "What's in the box" tabs were removed: a gallery that only shows the same photo bigger felt weird, so every preview should lead to real pages.
- Order page on phones: the Back / total / Continue bar is fixed to the bottom and becomes "Pay $x" on the last step (the in-page `#checkoutBtn` is hidden; `#wizNext` submits the form). Step pills become a progress bar under 640px. The order summary only shows on the What's inside and Checkout steps under 860px.
- Product cards, theme tiles and the play kit photos open the preview gallery (real pages, with a "Make my kit" button) instead of jumping to the order form.

### Name swap previews (2026-10-23)
- The homepage "type your kid's name" hook live-updates all previews. `renderHtml(..., { nameSlots: 'Maya' })` also writes `pngDir/blank/` pages with the name hidden plus `slots.json`. `gallery-images.js`, `site-images.js`, `craft-gallery.js` and `hero-scenes.js` write twins to `docs/img/n/<same path>` and per-set JSON `docs/img/n/<set>.json`. `docs/js/names.js` swaps each matching `<img>` and draws the typed name (scenes use layers plus SVG masks). Name saved in localStorage `lpq.kidName`.
- Previews of the play kit and activity pack have a Little kids / Big kids switch (`ages` option of `Gallery.open` in `docs/js/site.js`; Jason, 2026-10-23: lets parents compare, and shows there's more). Hunt and party pages are the same for both ages.
- Gotcha fixed 2026-10-23: when a page lost its name (the wow piece, "Trace the path"), the old twin and its index entry stayed, so previews showed a different page once a name was typed (63 of them). `blankJob` now deletes both, and `npm test` checks that every twin has an entry and the other way round.
- Regenerate in order: `gallery-images.js` -> `craft-gallery.js` -> `site-images.js` -> `hero-scenes.js`. If you only meant to refresh twins, `git checkout` the non-`n` images afterwards (they re-encode slightly differently). If a print layout changes, re-run the scripts or the overlay text sits in the old spot.

### Keeping the site smooth on phones (2026-10-23)
Jason found navigating choppy. What it was and the rules now:
- Swapping a preview's src made phones download the sample-name picture and then its nameless twin, plus that theme's ~50 KB name data (`img/n/<theme>.json`). Use `LPQName.setSrc(img, src, srcset)` after `LPQName.preload(theme)` resolves for pictures that change at runtime (banners, hook pages, order stack): it goes straight to the twin.
- The home banner rotates through 7 themes (`ROTATE` in `home.js`), every 6 s, only while on screen. The rotating occasion words no longer swap the pages beside the name box.
- No `backdrop-filter` blur on the sticky header or the phone checkout bar (costly repaints while scrolling).
- The name-overlay fonts load without blocking the first paint, `names.js` loads at the end of `<body>` before `data.js`, and `<img>` tags use `decoding="async"`.
- Home prefetches `make/`; pages cross-fade with `@view-transition`; order steps ease in.
- Measured with a 4x CPU slowdown at 390px: home 703 KB / 1.7 s → 345 KB / 1.0 s to load, worst scroll frame 433 ms → 83 ms.

### Page counts (PR #104, 2026-10-23)
- The "45 pages" bubbles come from a hardcoded `PAGES` line in `docs/js/data.js`. When pages are added to a kit, activity pack, party pack or craft, run `node scripts/page-counts.js` and paste the printed line over `PAGES`. Hunts follow 7 + ceil(spots/2) pages; the script throws if that changes.
- The order-stack hint says "Tap to see sample pages" (the gallery is only samples).

### Welcome poster trio (PR #121, 2026-10-24)
- The shop welcome poster and big sign show three pictures: `shop.hero` in the kit def, or by default the first two menu items plus the kit icon. That default doubled up the pizza and the burger, so Pizza and Burger set their own trio. Jason checked the other kits on 2026-10-24 and they're fine.

### Shop kit card photos (2026-10-23)
- The 11 shop kit card thumbnails (`docs/img/kit-<id>.webp`, 1354x994, used by `SHOP_KITS` in `docs/js/data.js`) are styled Gemini photos, each starring the kit's signature piece, prompts say "no cash register". Prompts and scripts: `project-files/scavenger-hunt/previews/shop-kit-cards/`. Gemini redraws kit art loosely; use the round 4 lifestyle tools to restore exact art.

## Stripe checkout page (2026-10-23)
- Each Checkout line item has a picture (`product_data.images`): the theme's illustration on cream, the handprint pack's card, or the logo for the Family Pass. Made by `python3 scripts/checkout-images.py` into `docs/img/checkout/*.jpg` (JPEG, no kid's name), linked from `SITE_URL` by `checkoutImages()` in `src/bot/payments.js`; left out unless `SITE_URL` is https and the file exists. Re-run the script after changing a theme pick in `scripts/theme-icons.py`.
- Logo, icon and colors on the Stripe page come from the Stripe Dashboard (Settings > Business > Branding), which Jason sets himself: brand color #EF9D31, background #FBF8F1.

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
- `scripts/share-image.js` loads Fredoka and Atkinson Hyperlegible from the repo's `fonts/` folder (Google Fonts can't be reached from the Claude sandbox, and the picture fell back to a serif font).
- Some tools in `project-files/` still hard-code `/mnt/project-files/...` paths; adjust them if that folder doesn't exist in your account.
