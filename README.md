# LittlePrintQuests

Personalized, print-ready birthday scavenger hunts for kids ages 3 to 8.

Each hunt is a PDF with a host guide (where to hide every card), a read-aloud mission briefing, 4x6 rhyming clue cards (two per page with cut lines), a puzzle finale, and a certificate. The puzzle is a themed picture cut into one numbered jigsaw piece per clue card: piece k is tucked behind card k, and at the last clue the kids put it together to see where the prize is. Each theme's title, line and illustrations are in `src/generator/puzzle.js`; add `"puzzle": false` to a config to leave it out. After the certificate come two bonus games for another day: a Picture Hunt (twelve picture cards to cut out and hide, plus two matching checklists to tick off) and a look-around hunt (twelve themed things to spot outside, like decorations for the holidays). Their pictures and lists are in `src/generator/bonus.js`; add `"bonus": false` to leave them out. Twenty-seven themes, each with a matching play kit and party pack: Dino, Superhero, Pirate, Space, Royal Castle, Unicorn, Mermaid, Construction, Pet Vet, Race Car, Fire & Rescue and Ice Kingdom; the shop kits Pizza Shop, Burger Shop, Grocery Store, Post Office, Library, Police Station, Dentist Office, Pet Shop, Coffee Shop, Italian Restaurant and Auto Repair Shop; plus Halloween, Christmas, Easter and Valentine’s. The shop kits’ hunts and party packs are sold on the website only, not on Etsy. `scripts/site-images.js` builds a theme’s website pictures.

## Make a hunt

1. `npm install`
2. Copy `examples/example-custom.json` and fill in `theme`, `childName`, `age` and `spots` in hiding order. The last spot is where the prize goes.
   - Spot ids come from `src/generator/spots.js` (`couch`, `fridge`, `mailbox`, `dryer`, `pet_bed`, ...).
   - For a spot not in the library, use `{ "label": "...", "tip": "...", "riddle": ["line one,", "line two!"] }`.
3. `npm run hunt -- my-order.json output/my-order.pdf`

## Etsy standard packs

`npm run standard-packs` writes the five non-personalized packs to `output/standard/`. `python3 scripts/listing_images.py <png_dir> output/listing-photos` builds the listing photos from page screenshots (`node scripts/standard-packs.js <png_dir>`). Listing titles, descriptions and tags are in `etsy-listings.md`.

Fonts in `fonts/` are from Google Fonts under the SIL Open Font License, which allows commercial use.

## Pretend play kits

`src/kits/` builds personalized pretend play kits: signs, ID badges, a schedule, check-up forms, ticket cards, passports, a price list with play money, and a certificate. Each kit is one definition file in `src/kits/defs/` listing its words, roles and pictures, so a new kit is mostly writing that list. Pictures are Noto Color Emoji (SIL Open Font License), which is fine to use in products for sale.

```
npm run kit -- examples/kit-vet.json out/vet.pdf
npm run kit -- examples/kit-space.json out/space.pdf --png out/space-pages
```

Kits: `vet` (Vet Clinic, stand-alone) plus one add-on per hunt theme: `dino` (Dino Dig Lab), `hero` (Hero HQ), `pirate` (Pirate Ship), `space` (Mission Control) and `royal` (Royal Castle). Each kit also has a pretend gadget shaped for its theme, with three screens: a fold-up clinic laptop or mission control console, a handheld dino scanner or hero communicator, a sea chart with a spinning ship’s wheel, or a standing magic mirror. Each kit also has flat props to cut out (`props` in its def: scan cards, a map, wanted posters, item cards, round stickers, and one cardstock wearable where it fits, like hero masks, eye patches or a two-piece crown). When a kit is sold with its hunt (`withHunt: true`), the guide adds an “After the hunt” note that carries the hunt’s story into the kit.

**Party Bundles.** A bundle order gets the hunt plus its theme's play kit as a second PDF (`/d/<token>-kit.pdf`), in the same email or Etsy message. Website orders send `product: "bundle"`; Etsy orders count as bundles when an option such as **Package** says "Bundle" or "play kit". Pets or toys the buyer lists ("Rover (dog)") become the kit's patients and crew.

## Etsy order bot

The bot checks your Etsy shop every few minutes. When a custom order comes in, it reads the buyer's personalization notes with Claude, writes riddles for any spots that aren't in the library, builds the PDF, and hosts it at a private download link. Your dashboard then shows a ready-to-send message for the buyer: copy it, paste it into the Etsy conversation, and click **Mark as sent**. Etsy's API doesn't let apps message buyers or attach files to an order, so that one step stays manual.

**Creating your listings.** Once your shop is connected, click **Create drafts on Etsy** on the dashboard. The bot creates all 51 listings as drafts: the sixteen theme packs, the custom Party Bundle (with its four Package prices), the Party Pack (one option per theme) and the Pretend Play Kit (one option per kit), plus a separate play kit and party pack listing for every theme, so each one shows up in its own Etsy searches. If the bot ever loses its records, the same button finds the drafts it made by title instead of making them twice. Each one gets its photos from `listing-assets/`, its PDF, and the title, description and tags from `etsy-listings.md`. Review each draft in Shop Manager and publish it. Play kit orders are filled like custom hunts: the bot reads the child's name and pets, builds the kit and writes the message. `scripts/listing-photos.js` rebuilds the bundle and kit photos, `scripts/pack-photos.js` the extra pack photos, and `scripts/theme-photos.js` the extra per-theme kit and party photos.

Orders the bot can't read confidently (missing name, unclear spots, an unsafe hiding place) show up as **Needs a look**, with a box to fix the details and rebuild.

Standard pack orders are ignored, since Etsy delivers those itself.

### Set up (Railway, about 15 minutes)

1. **Deploy.** On [railway.com](https://railway.com), create a project from this GitHub repo. Railway builds the `Dockerfile` automatically.
2. **Add a volume** to the service, mounted at `/data`. Orders and PDFs live there, so they survive restarts.
3. **Get a public address** under Settings > Networking > Generate Domain.
4. **Set the variables** listed in `.env.example` (the Etsy and Stripe sections are each optional) under the service's Variables tab. Never commit real keys.
5. **Register the callback in Etsy.** In etsy.com/developers > Your Apps, add `<PUBLIC_URL>/auth/etsy/callback` as a callback URL.
6. **Connect your shop.** Open `<PUBLIC_URL>/admin`, sign in with any username and your `ADMIN_PASSWORD`, and click **Connect Etsy shop**.
7. **Optional phone alerts.** Install the ntfy app, subscribe to the topic you set in `NTFY_TOPIC`, and you'll get a notification for each new order.

### Tips for the Custom listing

- Turn on personalization and make the theme a variation (a dropdown) named "Theme". The bot reads both.
- Put the listing's id in `CUSTOM_LISTING_IDS` so only that listing triggers the bot.
- You can test the whole flow without Etsy: the dashboard's **Make a hunt by hand** box takes pasted order notes.

## Website orders (Stripe)

The website's hunt builder sends its form to the bot, which opens a Stripe Checkout page. When Stripe confirms the payment, the bot builds the PDF, emails the download link to the buyer, and shows them an order page that updates by itself. Nothing for you to do unless an order lands in **Needs a look**; once you fix it, click **Email it to …** on the dashboard. Etsy isn't involved, so this is allowed under Etsy's rules.

1. **Stripe.** Create an account at [stripe.com](https://stripe.com). Under Developers > API keys, copy the secret key into `STRIPE_SECRET_KEY` (start with the `sk_test_` key).
2. **Webhook.** Under Developers > Webhooks, add the endpoint `<PUBLIC_URL>/webhooks/stripe` with the event `checkout.session.completed`, then copy its signing secret into `STRIPE_WEBHOOK_SECRET`.
3. **Email.** Create a [Resend](https://resend.com) account, verify a domain you own, create an API key, and set `RESEND_API_KEY` and `EMAIL_FROM` (an address on that domain).
4. **Website.** In `docs/index.html`, set `CHECKOUT_URL` to `<PUBLIC_URL>/api/checkout`. Set `SITE_URL` (and optionally `SITE_ORIGIN`) on the bot.
5. **Test.** With test keys, order on your site using card `4242 4242 4242 4242`, any future date and any CVC. You should get the email within a minute. Then swap in the live keys and a live webhook.

**Promo codes.** The checkout pages for orders and add-ons show an **Add promotion code** link. Make codes in the Stripe dashboard under Product catalog > Coupons: create a coupon (for example 100% off, once), then add a customer-facing promotion code to it such as `100OFF`, with a max number of redemptions or an end date if you like. A 100%-off order costs $0, Stripe skips the card, and the bot builds and emails it like any other order. Test-mode and live-mode codes are separate. The Family Pass checkout doesn't take codes.

**Add-ons after checkout.** Once a website order is ready, its order page and email offer the rest of the everything bundle (play kit, activity pack and party pack) for the bundle price minus what the buyer already paid, already made with the child's name. The button opens a Stripe page for the difference; when it's paid, the order is rebuilt with the same download links and emailed again. Shop kits only offer the activity pack, and handprint art and Family Pass orders get no offer.

## Host Mode

Every hunt order (Etsy or website) gets a private Host Mode link at `/h/<token>`: a phone page that walks the grown-up through hiding each card (and its puzzle piece) in order, then running the hunt with lines to say in character, quick challenges between clues, and step-by-step hints. A second link at `/s/<token>` gives a helper their own cues (radio calls, sound effects, checking the next card is still hidden), following along as the host taps Next. The link goes in the Etsy message, the website email and the order page. Because Etsy buyers see it, these pages have no shop links, prices or offers. Lines for each theme live in `src/host/scripts.js`.

### Development

`npm test` runs a smoke test with a fake Etsy, Claude, Stripe and Resend, and renders real PDFs.
`npm test` runs a smoke test with a fake Etsy and a fake Claude, and renders real PDFs.

## Website

`docs/index.html` is the LittlePrintQuests storefront: themes, what's inside, pricing, FAQ, and a hunt builder that collects the child's name, age, theme and spots. To publish it free on GitHub Pages: repo Settings > Pages > Deploy from a branch > `main` / `docs`.

The Contact, Refunds, Privacy and Terms pages (`docs/contact/` and so on) come from `scripts/help-pages.js`: change the words there, including the contact email, and run `node scripts/help-pages.js`.

One setting sits at the top of its script: `CHECKOUT_URL` (the order bot's checkout endpoint). If it is empty, the builder says checkout opens soon.
