# LittlePrintQuests

Personalized, print-ready birthday scavenger hunts for kids ages 3 to 8.

Each hunt is a PDF with a host guide (where to hide every card), a read-aloud mission briefing, 4x6 rhyming clue cards (two per page with cut lines), and a certificate. Five themes: Dino, Superhero, Pirate, Space and Royal Castle.

## Make a hunt

1. `npm install`
2. Copy `examples/example-custom.json` and fill in `theme`, `childName`, `age` and `spots` in hiding order. The last spot is where the prize goes.
   - Spot ids come from `src/generator/spots.js` (`couch`, `fridge`, `mailbox`, `dryer`, `pet_bed`, ...).
   - For a spot not in the library, use `{ "label": "...", "tip": "...", "riddle": ["line one,", "line two!"] }`.
3. `npm run hunt -- my-order.json output/my-order.pdf`

## Etsy standard packs

`npm run standard-packs` writes the five non-personalized packs to `output/standard/`. `python3 scripts/listing_images.py <png_dir> output/listing-photos` builds the listing photos from page screenshots (`node scripts/standard-packs.js <png_dir>`). Listing titles, descriptions and tags are in `etsy-listings.md`.

Fonts in `fonts/` are from Google Fonts under the SIL Open Font License, which allows commercial use.

## Etsy order bot

The bot checks your Etsy shop every few minutes. When a custom order comes in, it reads the buyer's personalization notes with Claude, writes riddles for any spots that aren't in the library, builds the PDF, and hosts it at a private download link. Your dashboard then shows a ready-to-send message for the buyer: copy it, paste it into the Etsy conversation, and click **Mark as sent**. Etsy's API doesn't let apps message buyers or attach files to an order, so that one step stays manual.

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

### Development

`npm test` runs a smoke test with a fake Etsy, Claude, Stripe and Resend, and renders real PDFs.
