// Setup check for the dashboard: which settings look right (never their values),
// and the last few things that failed, so problems show up without reading logs.

const recent = [];

function recordError(area, message) {
  recent.unshift({ at: new Date().toISOString(), area, message: String(message).slice(0, 300) });
  recent.length = Math.min(recent.length, 10);
}

const env = (k) => (process.env[k] || '').trim();

// [label, ok, hint when not ok]
function checks() {
  const from = env('EMAIL_FROM');
  return [
    ['PUBLIC_URL is the order bot’s address', /^https:\/\/[^/]+$/.test(env('PUBLIC_URL')), 'Set it to https://orders.littleprintquests.com (or your Railway address) with https:// and no slash at the end.'],
    ['ANTHROPIC_API_KEY', env('ANTHROPIC_API_KEY').startsWith('sk-ant-'), 'It should start with sk-ant-.'],
    ['RESEND_API_KEY', env('RESEND_API_KEY').startsWith('re_'), 'From resend.com > API Keys. It starts with re_.'],
    ['EMAIL_FROM', /@[^\s>]+\.[a-z]{2,}>?$/i.test(from), 'An address on the domain you verified in Resend, like LittlePrintQuests <hunts@yourdomain.com>.'],
    ['STRIPE_SECRET_KEY', /^(sk|rk)_(test|live)_/.test(env('STRIPE_SECRET_KEY')), 'Use the Secret key (sk_test_… or sk_live_…), not the Publishable key (pk_…).'],
    ['STRIPE_WEBHOOK_SECRET', env('STRIPE_WEBHOOK_SECRET').startsWith('whsec_'), `Add a webhook in Stripe for ${env('PUBLIC_URL') || 'PUBLIC_URL'}/webhooks/stripe, then copy its Signing secret (whsec_…).`],
    ['SITE_URL', /^https?:\/\//.test(env('SITE_URL')), 'Your website, like https://littleprintquests.com/'],
    // Railway sets RAILWAY_VOLUME_MOUNT_PATH only when a volume is attached. Without one, every deploy
    // starts from an empty disk: orders, the Etsy login and the list of drafts are gone.
    ['Saved data survives deploys (volume at /data)', !env('RAILWAY_PROJECT_ID') || env('RAILWAY_VOLUME_MOUNT_PATH') === (env('DATA_DIR') || '/data'),
      'In Railway, add a volume to this service with mount path /data. Without it, orders and your Etsy connection are erased on every deploy.'],
    ['ETSY_KEYSTRING and ETSY_SHARED_SECRET', Boolean(env('ETSY_KEYSTRING') && env('ETSY_SHARED_SECRET')), 'From etsy.com/developers > Your Apps.'],
  ];
}

module.exports = { recordError, checks, recent };
