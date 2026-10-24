# Project notes

The shared memory for Little Print Quests, readable from any Claude account. Moved here from Claude project memory on 2026-10-23. Keep entries short, dated, and organized by subject. Add to it in the same PR as the work it describes.

Paths like `project-files/...` are in this repo. Paths like `/mnt/project-files/...` are the Claude project files folder of the original account (large binaries; see [large-files.md](large-files.md)).

## Handoff: where things stand

Jason switches between two Claude accounts, sometimes when one runs low on usage. Keep this section current: before stopping, merge what's done, push anything half-finished to a branch, and list it here with what's left. Replace the list each time; history lives in the sections below and in git.

Last updated 2026-10-24 (after the big picture previews PR: every Play kit preview shows up to 4 big pictures; earlier, PR #131 Field Kit extras needed a Railway redeploy of the order bot).

Work in flight is listed under **In progress** below.
- Today's site work, all live: the site split into a home page plus `make/`, `play-kits/` and `handprint-art/` (#110); swipeable theme rows with a dropdown (#111); theme tiles with one cute illustration each (#114, after the wow-prop tiles were tried and reverted, #112/#113); home leads with the four products, plus the phone checkout bar (#115); phone speed fixes (#116); theme dropdown without ages (#117); product pictures on the Stripe checkout (#118).
- Waiting on Jason: set the Stripe logo and colors in the Dashboard (see "Stripe checkout page" below), and check that Railway redeployed the order bot after #118 (a test checkout should show a picture beside the product).
- Ideas raised but not started: the Stage 0 growth items (analytics, email capture); a grill piece for Burger and an espresso machine for Coffee (play kitchen fit).

## In progress

Work that is about to merge or is mid-merge, so sessions on the other account can hold off. Pull main and read this before starting and before merging. Add your entry directly on main (not only in your PR). Don't merge if another entry touches the same files; wait or coordinate. Remove your entry after merging. One line each: what, branch, files touched, thread, UTC time.

## Business direction

- **Etsy is being faded out (Oct 2026).** Prioritize the direct webapp and order bot. Don't invest in new Etsy listing options. Etsy pack and party listings stay on the original 16 themes (`ETSY_THEMES` in `src/bot/listings.js`).
- **Growth plan to $100k/yr (2026-10-23).** Claude Doc: https://claude.ai/artifact/4Zs7QAnNVzZ3h82ZnQh2oL (owned by the original account). $100k is about $8.3k/mo, or 350 to 700 orders/mo depending on AOV ($24 vs $12). Pillars: parent site orders $55k, teachers/TpT and classroom licenses $20k, repeat (Family Pass / "Play Club" subscription) $15k, partners $10k. Channels ranked: Pinterest > TpT > SEO idea pages > birthday reminder email > creator gifting > ads (only once AOV is $25+). Stages: Stage 0 (to Dec 2026) analytics, email capture, default to bundle; Stage 1 (H1 2027) TpT launch, 10 pins/day; Stage 2 (H2 2027) Play Club, classroom licenses; Stage 3 (2028) scale. As of 2026-10-23 there were zero sales, so the first goal is the first 10 to 25 sales. Advice only so far, nothing built; if Jason picks an item, start with Stage 0.

## Jason's preferences

- Threads merge their own PRs once tests pass (said 2026-10-23), squash into main. Reason: PRs were piling up and landing out of order (the #88/#91/#93/#94 stack left a duplicate lede in `docs/index.html`, fixed in #95).
- Age versions are **Little kids 3 to 5** (pre-readers: picture clues, circling, thick cut lines) and **Big kids 6 to 8** (early readers); the site says ages 3 to 8 overall (Jason, 2026-10-23; it was 2 to 4 / 5 to 8). A typed age of 5 or under picks little. Orders saved before the change carry the old version labels; `products.versionOf` reads both. Already-posted pins and their pictures still say 2 to 8 / 2 to 4: re-run `scripts/pins.js` before making new pin images.
- The order page always opens on step 1 (who it's for, and the age version), even when a name is already saved; a theme, kit or items from the link stay picked (Jason, 2026-10-23).
- The grown-up's phone page is called the **Field Kit** (it was "Host Mode"; Jason, 2026-10-23), with the helper's link still called the Sidekick. Code keeps the old names (`src/host/`, `/h/<token>`, `hostToken`, `docs/img/host/`). The home page gives it its own band with four real screens (2026-10-24: Hide the clues, Run the hunt, Shop day, Snap & print; they swipe sideways on a phone), and "See the Field Kit" adds the printed photo page (`img/host/<theme>-print.webp`) and the Sidekick. The photos screen and printed page use four kids-at-play photos Jason made in the Gemini app (`project-files/fieldkit-photos/`, 1000px WebP; the first try with crops of the printed set looked weird). Gotchas: the name-swap spots are measured from the top of the page, so captures must not scroll (hide what's above instead) and must hide text behind overlays; and each phone frame clips its name layer (`.fk-phones .phone { overflow: hidden }`), otherwise a phone's page widens when a popup opens. Screens are captured at 2x and saved 540x1080 as an everything-bundle order (`HOST_ONLY=1 node scripts/site-images.js` redoes just those); they were 240x480 and looked blurry.
- Site copy says "kid", not "child" (keep "child" only for formal spots like policies).
- Don't pigeonhole the site as birthday-only; rotate occasions (rainy day, sleepover, snow day, Halloween, playdate, Christmas, Valentine's, Easter, weekend).
- Keep the site calm (2026-10-23, from Jason's wife: the old one-page site felt like "a lot coming at her"). One idea per section, short copy, ordering on its own page. Never drop a feature to get there (name previews, hero banners, order stack, galleries): move it instead.
- Photos: pieces must be cut to shape and used as the real thing, staged "like an Instagram mom, just perfect". DIY cardboard builds sell best. Never glue cut-and-assemble activity pages (lift-flap vet bag, cauldron) flat onto boxes; use signs, labels and cards on boxes instead.
- Generated images: no faces on objects (no smiley stars, food, starfish...). Every Gemini prompt should say so (Jason, 2026-10-24). Face props that are meant to be worn as a mouth or nose (the disguises' grins, lips, kitty nose) are fine.
- Jason runs paste-into-Gemini-app prompts himself for some image work (no API).
- Jason raises the Gemini spend cap himself at ai.studio/spend when it hits the monthly cap (HTTP 429 "exceeded its monthly spending cap").

## Products and how they're built

### Themes and kits
- All 34 play kits are hunt themes with party packs, so every theme has an everything bundle (PR #87, 2026-10-23). The 11 shop kits (pizza, burger, grocery, post, library, police, dentist, petshop, coffee, italian, auto) have `hunt: '<id>'` and `bigSign: true` in their kit defs; the defs' `shop` key is a different thing (the shop config). Shop kits are website-only. Sample PDFs: `/mnt/project-files/scavenger-hunt/shop-kit-hunts/`.

### Seven room kits and manila folders (2026-10-24)
- New kits, each a full set (kit, hunt, party pack, activity pack) with a wow piece and disguises: **kitchen** (Chef’s Kitchen, Glowing Oven Window), **doctor** (Doctor’s Clinic, Patient Monitor), **puppet** (Puppet Theater, Velvet Stage Curtains), **agent** (Secret Agent HQ, Handprint Scanner), **dressup** (Costume Shop, Dressing Room Mirror Lights), **icecream** (Ice Cream Parlor, Soft Serve Machine), **airport** (Airport, Airplane Window). Jason's list also had grocery, coffee, post office, mechanic (auto) and vet, which already existed. All are `bigSign` shop-style kits listed in `SHOP_KITS`.
- `src/kits/rooms.js` holds the new shared pieces: room appliances (`burners`, `sink`, `backsplash`, `stage`, joined to `extras.js` APPLIANCES), the manila folder pages (`folders` key in a def: two folder covers, an intake form page, tab labels, dividers, optional patient wristbands; intake figure `person`, `teeth`, `pet` or `scene`), and props `puppets`, `fingerprints`, `hangtags`, `scoops`, `stampsheet`. Doctor, vet and dentist have folders (Jason asked for them on all three).
- `toys.js` VESSELS gained `fridge` and `wardrobe` for lift-the-flap toys. The guide page shrinks its type (`dense`, `denser`) when the inside list is long.
- Kit art was made with `gemini-3.1-flash-image`: it sometimes draws captions, extra objects or smiley faces, so look at each sheet. One-off pictures import with `python3 scripts/art-import.py <kit> <slug> <image>`. Puzzle art (`src/generator/puzzle.js`) can now borrow another kit's art as `'other-kit/slug'`, like bonus pictures.
- 45 older shared pictures that the new kits borrow (bandage, pill, thermometer, syringe, sun, moons, stars, coin, heart, cloud, lock, trophy...) were redrawn without faces in place (same files), so every kit that uses them lost the faces too. Gallery previews of the older themes were not re-rendered and may still show the old faces until `gallery-images.js` runs for them.
- The new kits' shop cards (`docs/img/kit-<id>.webp`) are page fans from `site-images.js`, not styled Gemini photos like the first 11. No box-build how-to guides yet.

### Big picture pages (2026-10-24)
- Jason asked for "a lot more of these big images" in every kit, to match the Vet Clinic PDF his wife made (`/mnt/project-files/Printable Vet Clinic Package.pdf`, 15 full-page pictures). The vet kit now prints all 15 of her pages; every other kit gets 10 full-page Gemini pictures of the same kinds (showpiece, picture cards, wrap-around piece, signs, strips, mini cards, jar labels, tablet screen, room signs, learning poster). Done so far (first PR): vet plus pizza, dino, hero, pirate (no poster: Gemini keeps putting a skull on the kid's hat), space, royal, unicorn, mermaid and construction. The other 24 kits got the pictures that passed (second PR, see below). Gemini credits ran out twice on 2026-10-24; expect about 1.6 drawings per page because the checker rejects ~40%. About 10 cents a 2K Flash picture, half that in batch mode.
- Page order: each picture sits next to the kit's own pages of the same kind (Jason, 2026-10-24: "make sure it fits with the current kits and don't seem out of place"). The kind is the file name (`03-wear.jpg`), and `buildKitHtml` calls `bigPages(k, [kinds])` at several spots: showpiece and poster after the wow page, signs and room signs after the station signs, labels and strips after the jar labels, screen after the gadget, wear and cards after the chef hat, forms after the records.
- Code: `src/kits/bigpages.js` reads `src/kits/art/<kit>/big/pages.json`. A kit without the folder just skips them. Pictures are stored portrait (landscape ones turned) as JPEG, because Chrome copies a JPEG into the PDF as is but re-encodes WebP losslessly (2.4 MB a page instead of about 300 KB).
- Prompts, checker and tools: `project-files/pretend-play/big-pages/` (README there). Raw PNGs aren't in git.
- The grown-up guide's "What's inside" list got one line longer, so `src/kits/fit.js` now steps the guide through `dense`, `denser` and a new `densest` type size until it clears the footer.
- `scripts/gallery-images.js` skips every big page when picking toy pages (see "More of them in the previews" below for how they're shown).
- **More of them in the previews** (Jason, 2026-10-24: "add more pages to the previews"). Every theme's Play kit preview now runs: welcome poster, sign, wow piece, then up to 4 big pictures, then a hands-on page and the box build. Picks are one per kind, best first: hero, poster, wear, screen, then strips, signs, cards, rooms, forms, labels (`bigPicks` in `src/kits/bigpages.js`). Captions are each page's `pages.json` title, capitalized.
  - `node scripts/big-previews.js [theme...]` cuts them straight from the kit JPEGs to `docs/img/gallery/<theme>/big-<n>.webp` (same for both ages, no name twins), turns the landscape kinds (hero, cards, labels, screen, rooms, poster, stored turned clockwise by `import.py`) back upright, and writes `BIGPICS` in `docs/js/data.js` plus the asset stamps. `gallery-images.js` calls it too.
  - **After importing big pictures, run `node scripts/big-previews.js <theme>` in the same PR**: `npm test` fails if `BIGPICS` doesn't match the kits' `pages.json` or a `big-<n>.webp` is missing. The previews workflow only commits `docs/img`, so it can't fix `data.js` for you.
  - `kitPages()` in `docs/js/site.js` builds the kit list for `setPages` and the Play Kits page. `kit-4.webp` (the first big page, still used by `hero-scenes.js` and `pins.js`) isn't shown on the site any more, except for a kit with no big pictures.
- The 24 later kits have 3 to 10 pages each so far (2026-10-24): Gemini credits ran out, so Jason is drawing the rest in his Gemini app from the prompts page https://claude.ai/artifact/MehiCM5zzdjpKydg284JQE (60 numbered prompts; he posts each picture in the thread with its number). Add one with `RAW=<dir with kit-slot.png> python3 import.py <kit>`: import keeps the kit's current pages for slots with no raw picture.
- Hand-reviewed rejects (2026-10-24): duplicate items on a sheet, a small poster floating in a big page, leaked notes, and the pirate poster (Gemini keeps drawing a skull on the kid's hat). The kitchen room sign had a smiley icon painted out by hand.

### Site previews rebuild themselves (2026-10-24)
- Jason asked for previews to update whenever a kit changes. `.github/workflows/previews.yml` runs on pushes to main that touch `src/kits`, `src/generator`, `src/party`, `src/crafts`, `src/host` or the preview scripts. `scripts/preview-targets.js` maps changed files to themes (a kit's own defs or art: just that kit and its hunt theme; shared code: all), it runs gallery-images, craft-gallery (only for all), site-images and hero-scenes in the required order, `scripts/keep-changed-images.py` puts back images that only re-encoded, and it commits "Site previews: ..." and asks Pages to rebuild. It diffs from its own last commit, so nothing is missed when pushes overlap. Run it by hand from the Actions tab (Site previews, input `all` or theme names).
- So threads no longer need to run the preview scripts themselves after a kit change, but a full run takes over an hour; check the Actions tab if previews look stale.

### Library book pockets and date due cards (2026-10-24)
- Jason's wife's idea: library sign-out cards. `src/kits/bookcards.js`, on for kits with `bookCards: true` (only library). Two pages after the library cards: 4 book pockets to glue inside a back cover, and 4 Date Due cards that slide in. Little kids version: 9 boxes to stamp. Big kids: rows for date due and reader.

### Hunt bonus games (PR #91, 2026-10-23)
- Every hunt PDF ends with replay bonus games, lists in `src/generator/bonus.js`: a Picture Hunt (12 cut-out picture cards plus a page with 2 checklists) and a Look-around hunt (12 themed finds to spot outside).
- Page order: guide, briefing, cards, puzzle, cert, then the 3 bonus pages. `scripts/site-images.js` picks pages by negative index (puzzle -5, cert -4, bonus -2), so update it if the page count changes.
- Picture lists use kit art `'slug|Label'` or `'theme/slug|Label'`, emoji, or `'svg:name'`. `bonus: false` in a config turns them off.

### Wow props (PR #103, 2026-10-23)
- One realistic prop per kit (like vet X-rays), most fit a play kitchen spot. `def.wow` text is shown by `wowPage` in `src/kits/extras.js`, with `src/kits/art/<kit>/wow.webp` made by `scripts/wow-cutout.py`.
- Prompts: `project-files/pretend-play/wow/` (run `tools/genall.sh` with `bash`). Raw images and `all-wow-pages.jpg` are large files.
- Gotcha: Gemini "white" studio backgrounds come back grey and shadowed, so pale pieces (snow globe, unicorn, cake) are made on chroma green, listed in `GREEN` in `prompts.py`.
- The wow page is the third Play kit sample in the order preview gallery for every theme, big and little (PR #106, captioned "Wow piece"); `wowPage()` in `scripts/gallery-images.js` finds its page number. The order stack cards still show the first toy page.

### Photo booth disguises (2026-10-24)
- Jason asked for printable cut-out disguises on a stick, like photo booth props, 2 to 3 per theme. Every kit now has two pages after the badges/chef hat: a head prop (hat, ears, tiara) plus a face prop (mustache, glasses, nose), and a speech bubble with the kit's catchphrase and `k.lead` ("Arrr, matey! – Captain Maya") plus a blank write-your-own bubble. The guide page lists them.
- Code: `src/kits/disguises.js` (`DISGUISES` map: head label, face label, catchphrase). Art: `src/kits/art/<kit>/disguise-1.webp` (head) and `disguise-2.webp` (face), made by `python3 scripts/disguise-cutout.py <raw folder> [kit...]` (reuses `wow-cutout.py`; needs scipy). A kit missing either picture skips the pages, so new themes need entries plus art.
- Prompts and generator: `project-files/pretend-play/disguises/tools/` (`prompts.py`, `gen.py`, run with `OUT=<raw folder> python3 gen.py [kit...]`; it skips pictures that already exist). Raw PNGs (large) are in `/mnt/project-files/pretend-play/disguises/raw/`, rejects in `rejected/`.
- Gotcha: saying "prop on a stick" made Gemini draw sticks; the prompt now says "cut-out photo booth prop ... no stick or handle". Pale props (white hats, beards, bunny ears) are made on chroma green; `wow-cutout.py` now turns green holes inside a piece (the mouth gap in a beard) white instead of near-black.
- Not in the order preview gallery yet.

### Gemini image cost (2026-10-24)
- Jason asked why image generation costs so much. Older scripts use `gemini-3-pro-image` at 2K (roughly 13 to 15 cents a picture plus billed thinking), and the lifestyle photos add several Pro calls per photo (corner finding, placing pieces, retries). `gemini-3.1-flash-image` is about a third of that or less and was good enough for the flat disguise props (54 pictures). Default to Flash for simple cut-out art; use Pro only when Flash botches it.

### Activity packs (PR #107, 2026-10-23)
- Jason asked for more pages ("do them all"). Pages live in `src/kits/activities.js`; the `PAGES` list there sets the order and which age version gets each page, and the cover checklist and `activityCount` come from it. Big kids: 15 pages plus cover. Little kids: 16 pages plus cover. Plus the 3 move game pages for both (see Move game below).
- Both ages: clean-up, trace the words, match it up, how many, I spy, spot the difference, which one is different, find the way (maze), color by number (color by dot for little kids), draw yourself as the kit's boss, my adventure story (little kids circle pictures instead of writing), invent something new.
- Little kids only: trace the path, dot the letter (first letter of the kid's name), shapes and colors, stick it on (cut and glue on shadows). Dot the letter and stick it on are marked "Print & Play" (paper); everything else is "Wipe & Play".
- Big kids only: word search, secret code (a themed "YOU ..." message per kit in `SECRETS`, in picture code; the answer is printed upside down at the bottom), roll a silly creature.
- Color-by-number pictures: one emoji per kit in `MOSAIC_PICS`, turned into crayon-color grids in `src/kits/mosaics.json` by `node scripts/color-mosaics.js [kit]` (18 squares on the long side for big kids, 11 for little). Pick pictures with 3+ clear colors; single-color emoji (dino, shield, tooth) make dull pages. Re-run the script after changing `MOSAIC_PICS`.
- Previews: the order gallery shows big = cover, I spy, secret code, color by number, roll a creature; little = cover, trace the path, stick it on, color by dot, I spy. Don't preview dot the letter: its big letter is drawn from the name, so the name-swap overlay can't change it.
- To refresh only the activity previews: run `gallery-images.js`, `git checkout` every changed file without "activity" in its path, and in `docs/img/n/<set>.json` keep main's entries and swap in only the `activity` keys.
- Sample PDFs (Maya, both ages, dino, pirate, unicorn, space, pizza): `/mnt/project-files/activity-packs/`.

### Move game (activity packs, 2026-10-23)
- Jason asked for cut-out action/movement cards ("roar like a dinosaur", "hop on one foot") that work as a real game, not just words on cards. Every activity pack, both ages, now ends with 3 Print & Play pages from `src/kits/movegame.js`: two sheets of 9 cards and a board.
- Cards: 12 moves (7 themed per kit in `MOVES`, with a game name like "Dino Stomp", plus everyday moves from `EVERYDAY`, skipping any whose picture the themed ones already use) and 6 specials (Freeze!, "<kid>'s Move", Super Slow, Super Fast, Dance Party, Copy Cat). Each card has a stick-figure picture of the move (`POSES`, 60x64 SVG line art, so pre-readers can follow), the kit picture, a count bubble (little kids also get dots to count along) and 1 to 3 stars.
- Game: flip a card, everyone does the move, the flipper moves their piece one space per star; picture spaces mean everyone cheers; first to the kit's place wins. Board is 24 spaces; 4 fold-and-stand pieces use the order's own subjects first, then the kit's default kinds. A tip says you can skip the board.
- Activity pack page counts are now big 19, little 20 (`PAGES` in `docs/js/data.js`, and the count in `test/smoke.js`). The order preview gallery doesn't show the move game yet.
- All 34 kits have a `MOVES` entry (the 7 kits from #132 got theirs 2026-10-24). A new theme needs one too, or it falls back to "Move & Play" with only everyday moves. Keep the themed moves' pictures varied: `deck()` fills with everyday moves whose picture isn't used yet, and no kit repeats a picture as of 2026-10-24.

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
- Theme pickers are rows of tiles that swipe sideways (`.themes.mini.rows`), not a tall grid: 27 tiles made the page too long on phones (Jason, 2026-10-23). Three rows on phones up to 640px wide, so more themes show before swiping (Jason, 2026-10-24); two rows on the wider home page. The order page also has a theme dropdown kept in step with the tiles.
- Home page pitches all four products up top (Jason, 2026-10-23: the home page read as all hunt while most photos were play kits). Headline is general ("Printable play starring your kid"), then "What you get": four product cards (hunt, play kit, activity pages, party pack) whose galleries open with the styled photo then that product's real pages, plus a Host Mode line. The "At home" photo grid and "What's in the box" tabs were removed: a gallery that only shows the same photo bigger felt weird, so every preview should lead to real pages.
- Order page on phones: the Back / total / Continue bar is fixed to the bottom and becomes "Pay $x" on the last step (the in-page `#checkoutBtn` is hidden; `#wizNext` submits the form). Step pills become a progress bar under 640px. The order summary only shows on the What's inside and Checkout steps under 860px.
- Product cards, theme tiles and the play kit photos open the preview gallery (real pages, with a "Make my kit" button) instead of jumping to the order form.

### Name swap previews (2026-10-23)
- The homepage "type your kid's name" hook live-updates all previews. `renderHtml(..., { nameSlots: 'Maya' })` also writes `pngDir/blank/` pages with the name hidden plus `slots.json`. `gallery-images.js`, `site-images.js`, `craft-gallery.js` and `hero-scenes.js` write twins to `docs/img/n/<same path>` and per-set JSON `docs/img/n/<set>.json`. `docs/js/names.js` swaps each matching `<img>` and draws the typed name (scenes use layers plus SVG masks). Name saved in localStorage `lpq.kidName`.
- Previews of the play kit and activity pack have a Little kids / Big kids switch (`ages` option of `Gallery.open` in `docs/js/site.js`; Jason, 2026-10-23: lets parents compare, and shows there's more). Hunt and party pages are the same for both ages.
- Gotcha fixed 2026-10-23: when a page lost its name (the wow piece, "Trace the path"), the old twin and its index entry stayed, so previews showed a different page once a name was typed (63 of them). `blankJob` now deletes both, and `npm test` checks that every twin has an entry and the other way round.
- Gotcha fixed 2026-10-23: text hidden when a picture was taken (the Field Kit's inactive tabs) got zero-size name spots, and the site drew them as a squashed column of words at the top left of the preview. `nameSlots` now skips them, `names.js` ignores any that remain, the 516 saved ones were removed, and `npm test` checks for them.
- Regenerate in order: `gallery-images.js` -> `craft-gallery.js` -> `site-images.js` -> `hero-scenes.js`. If you only meant to refresh twins, `git checkout` the non-`n` images afterwards (they re-encode slightly differently). If a print layout changes, re-run the scripts or the overlay text sits in the old spot.

### Preview popup top (2026-10-24)

Jason found the preview popup's top crowded on phones (tabs wrapped onto two lines, plus a big age switch). Now: one swiping line of short tabs (Hunt, Play kit, Activities, Party; the `SHORT` map in `Gallery.open`, `docs/js/site.js`) with the close button beside it, a small "Ages 3–5 / Ages 6–8" pill under, and a caption without the product name ("Host guide… · 1 of 21"). Styles are at the end of `docs/css/site.css`.

### Theme groups (2026-10-24)

With 34 themes, the theme tiles on the home page and the order page have one line of filter chips above them: All, Adventure, Make-believe, Helpers, Food & shops, Holidays (Jason asked to organize them without adding clutter). The order page's dropdown uses the same groups as `<optgroup>`s, with the in-season holiday first, and picking a theme from it switches the chips to that theme's group. The Play Kits page uses chips too: Helpers, Food & shops, and Make-believe (the few adventure and magic kits together).
- Groups live in `THEME_GROUPS` in `docs/js/data.js`; the chips come from `themeFilter()` in `docs/js/site.js`. A group needs at least 2 tiles on a page to get a chip.
- **New theme: add its id to one group.** `npm test` fails if a theme has no group, is in two, or a group lists an unknown id.
- Gotcha (2026-10-24): right after #134 deployed, a phone loaded the new `make.js` with an old cached `data.js`, hit an error and showed an empty theme dropdown and banner. Fix: the storefront pages load `js/*.js` and `css/site.css` with a content stamp (`?v=…`). **After changing anything in `docs/js` or `docs/css`, run `node scripts/stamp-assets.js`**; `npm test` fails if a stamp is stale. Page code that uses something new from another file also checks it exists first.

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

### Two kids on one order (2026-10-24)
- Jason asked that parents can put two names without the name line looking crowded. `src/generator/kid-names.js` turns "Jaxon and Jonah" (or `,` `+` `/` `&`) into "Jaxon & Jonah"; the order bot (`orders.js`, `parse.js`), the kit engine and `docs/js/names.js` all use the same rule. Name fields allow 40 characters (was 24) and the order page has a "Two kids sharing?" hint.
- Kits: each kid gets their own lead badge ("Chef Jaxon", "Chef Jonah") and certificate; everything else says "Jaxon & Jonah’s ...". Hunts, party packs and handprint art just use the joined name.
- Kit pages fit long names in the browser before printing (`src/kits/fit.js`): `data-lines="N"` on HTML blocks, `data-fit-w` on SVG text. `placeHtml()` only lets a place name wrap between the names and the place ("Jaxon & Jonah’s / Mission Control"). Use them on any new spot that shows the name.
- Site previews: `nameSlots` records `mw`, the room a centered name has on its line, and `names.js` widens the box that far before shrinking the words. Gotcha: `names.js` reads back `innerHTML` after changing a style, which the browser writes as `font-size: 12px` (with a space), so the size regex must allow a space.

### Welcome poster trio (PR #121, 2026-10-24)
- The shop welcome poster and big sign show three pictures: `shop.hero` in the kit def, or by default the first two menu items plus the kit icon. That default doubled up the pizza and the burger, so Pizza and Burger set their own trio. Jason checked the other kits on 2026-10-24 and they're fine.

### Shop kit card photos (2026-10-23)
- The 11 shop kit card thumbnails (`docs/img/kit-<id>.webp`, 1354x994, used by `SHOP_KITS` in `docs/js/data.js`) are styled Gemini photos, each starring the kit's signature piece, prompts say "no cash register". Prompts and scripts: `project-files/scavenger-hunt/previews/shop-kit-cards/`. Gemini redraws kit art loosely; use the round 4 lifestyle tools to restore exact art.

### Field Kit page picker (2026-10-24)

Jason: "there are a lot of pages now". The Get ready tab has **Choose pages to print**: a sheet listing every page of the order's PDFs (hunt, play kit, activity pack, party pack) as **tiles or a list** (his ask; the choice is remembered), with Select all per PDF and a Print button that opens one PDF of just the picked pages. Picks are remembered on the phone.
- Thumbnails and titles: `renderHtml(..., { thumbs: dir })` in `src/generator/render.js` saves `page-N.jpg` (30% size) and `index.json` next to each order PDF (`<token><suffix>-pages/`). A page's title is its `data-title` (set for clue cards, the certificate and party sheets), else a name for its class (host guide, briefing, puzzle, picture cards), else its heading or first line. Give new page kinds a `data-title` for a good name.
- `documents(order)` in `src/bot/orders.js` lists an order's PDFs (used by `generate` and the picker). Thumbnails are made the first time the picker opens (`pageList`), not while the order is made: rendering them during or alongside order PDFs made Chromium fail with "Printing failed" and slowed delivery (PR #143 did that and was fixed the same day).
- Routes (by download token): `/d/<token>/pages.json`, `/d/<token>/thumb/<main|kit|activities|party>/<n>.jpg`, `/d/<token>/pick.pdf?main=1,3&kit=2-5` (joined with `pdf-lib`, a new dependency).

### Field Kit extras (2026-10-24)

Added on top of the Field Kit (`src/host/host.js`), all driven by one browser script, `src/host/client/fieldkit.js`, which the bot inlines into the host, Sidekick and Mission pages with a `window.FKCFG` config (theme, name, colors, art, keepsake text...).
- **Get ready tab** (opens first until the hunt starts): party countdown from `config.party.date`, print tips per item, to-do checklist, "On the day" buttons, sound test, and "Keep it handy" (add to home screen, works offline).
- **Sounds** (reworked 2026-10-24, Jason found the first ones too "digital"): `src/host/client/sfx.js`, inlined before fieldkit.js. Each sound is rendered once on the phone into a buffer from models of the real thing (formant voices for bark/meow/roar/ghost/crowd, inharmonic partials for bells and chimes, plucked strings for the harp, noise bursts for claps/splashes/creaks) plus a small room reverb, and loudness-matched. 47 sounds, 3 per theme in `BOARD` plus Cheer; themes missing from `BOARD` get `DEFAULT`. The smoke test renders every sound and checks each board button. No sound files: free real recordings (e.g. OpenGameArt) can't be downloaded from the Claude workspace and would need license tracking.
- **No kids' screen** (2026-10-24): a Mission screen at `/m/<token>` was built, then removed the same day. Jason: kids shouldn't be looking at a phone; the Field Kit is for parents only. Don't bring it back.
- **Step numbers**: the Sidekick page builds the plan with `followPlan(order)` so its steps match the host's (it was one step behind before; fixed).
- **Shop day** (Play Kit tab): the phone runs the counter for six customers using the kit's menu, prices and play lines (`shopData`), then offers a "Star of the day" keepsake. Hidden for kits with fewer than two priced items.
- **Shop day talk** (2026-10-24, Jason: everyone said "I would like to order"): each customer says hello their own way (Woof, Rawr, Honk...), sometimes why they came (`SHOP_TALK` per kit in host.js), then orders the actual items in a sentence (`phraseOf`: "a cheese pizza", "some fries", `PHRASE` fixes awkward ones). Doctor, dentist and vet run as a **Clinic day**: patients say what's wrong, the list is "Treatment", buttons say "All better!". New kits get `SHOP_DEFAULT` lines; add a `SHOP_TALK` entry for better ones.
- **Photos**: a 📸 button on every page. Photos are stored only on the phone (IndexedDB `lpq-fieldkit`, shrunk to 1600px), never uploaded; the privacy page says so. The photo sheet makes a themed Letter PDF on the phone: collage (up to 6 per page) or one per page, optionally led by a "Mission complete" keepsake page. The PDF writer is hand-written in fieldkit.js (JPEG pages), so no library. Border, colors and stickers come from the theme: `stickers(order)` picks the theme icon plus kit art.
- **Offline / home screen**: served only under `/h/<token>`: `sw.js` (with `Service-Worker-Allowed`), `manifest.webmanifest`, `icon-192.png` / `icon-512.png` (from `docs/img/`), `art/<n>.webp` (the stickers).
- Field Kit pages still must not contain shop links, `$` prices or `{placeholders}`; the smoke test checks the host and Mission pages, including the inlined script.
- After merging, Railway has to redeploy the order bot for any of this to show up.

## Stripe checkout page (2026-10-23)

- Promotion codes (2026-10-24): every checkout shows the promo code box, the Family Pass included (it was left out before; Jason couldn't use his coupon). Codes are made in the Stripe dashboard; a coupon can be limited to certain products there if it shouldn't apply to the pass.
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

- 2026-10-24: `npm test` used to leave its data folder (~415 MB of orders and PDFs) in /tmp on every run, and `renderHtml` left a temp HTML folder per render; after a long session the Claude workspace disk filled up and tests failed oddly ("Printing failed", orders stuck processing). Both now clean up. If tests fail strangely, check `df -h /` first.

- The repo pins playwright 1.56.1, which doesn't match the container's browser. Easiest fix: a preload that wraps `chromium.launch` to pass `executablePath: '/opt/pw-browsers/chromium'`, run as `node -r pre.js scripts/<script>.js`.
- To click through the site locally: `python3 -m http.server` in `docs/`, then Playwright with the preload above. `npm test` also needs the preload (`node -r pre.js test/smoke.js`).
- `scripts/share-image.js` loads Fredoka and Atkinson Hyperlegible from the repo's `fonts/` folder (Google Fonts can't be reached from the Claude sandbox, and the picture fell back to a serif font).
- Some tools in `project-files/` still hard-code `/mnt/project-files/...` paths; adjust them if that folder doesn't exist in your account.
