// Turns a buyer's free-text order notes into a hunt config using Claude.
// Known spots map to the riddle library; anything else gets a new couplet.

const Anthropic = require('@anthropic-ai/sdk');
const { z } = require('zod');
const { zodOutputFormat } = require('@anthropic-ai/sdk/helpers/zod');
const SPOTS = require('../generator/spots');
const THEMES = require('../generator/themes');
const { kitForHunt, KITS } = require('../kits/engine');

const MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';
const client = new Anthropic();

const PartySchema = z
  .object({
    date: z.string().nullable(),
    time: z.string().nullable(),
    place: z.string().nullable(),
    rsvp: z.string().nullable().describe('who to RSVP to and how, e.g. "Text Sam 555-0102"'),
  })
  .nullable()
  .describe('party details for the invitations, only if the buyer gave any; else null');

const OrderSchema = z.object({
  ok: z.boolean().describe('false if the order is missing information or cannot be fulfilled as written'),
  problem: z.string().nullable().describe('When ok is false: a short note to the shop owner saying what is missing or unclear'),
  childName: z.string().nullable(),
  age: z.number().int().nullable(),
  theme: z.enum(Object.keys(THEMES)).nullable(),
  pets: z
    .array(z.object({ name: z.string(), kind: z.string().describe('one of the kinds listed for the theme') }))
    .describe('pets or toys the buyer named for the play kit, up to 6; empty if none'),
  party: PartySchema,
  spots: z.array(
    z.object({
      libraryId: z.string().nullable().describe('id from the spot library when the spot matches one, else null'),
      label: z.string().describe('short display name, e.g. "Grandma’s Piano"'),
      tip: z.string().describe('where exactly the host should tuck the card'),
      riddle: z.array(z.string()).describe('only for spots not in the library: exactly two rhyming lines, else an empty array'),
      pic: z.string().nullable().describe('only for spots not in the library: one emoji that pictures the place for kids who cannot read yet, else null'),
    })
  ),
});

const SYSTEM = `You set up personalized birthday scavenger hunts for children aged 3 to 8.
You receive a buyer's order notes from an Etsy shop and return the hunt details.

Themes (use the id): ${Object.values(THEMES).map((t) => `${t.id} = ${t.name}`).join('; ')}.

Spot library (id: label):
${Object.entries(SPOTS).map(([id, s]) => `${id}: ${s.label}`).join('\n')}

Rules:
- Keep the spots in the buyer's order. The last spot is where the prize goes.
- Use a library id whenever the buyer's spot clearly means the same place (e.g. "washer" = washing_machine, "dog bed" = pet_bed, "sofa" = couch). Then leave riddle empty.
- For any other spot, write a two-line rhyming riddle (AABB couplet, about 9 to 12 syllables per line, ending in "!" or "?") that describes the place so a young child can guess it, without naming it outright. Match the playful style of: "Where do you splash with your bubbles and boats? / Look in the place where your rubber duck floats!"
- Never send children toward anything dangerous (stoves, ovens, knives, pools, roads, medicine). If the buyer lists one, set ok to false and explain in problem.
- The theme may come from a separate "Theme" option; use it when present.
- Buyers of a party bundle may list up to 6 pets or toys for the play kit, like "Rover (dog), Teddy (bear)". Put them in pets, with kind set to the closest of these for the theme (empty list if none):
${Object.keys(THEMES).map((t) => `  ${t}: ${Object.keys(kitForHunt(t).kinds).join(', ')}`).join('\n')}
  Pets are never hiding spots, and missing pets are never a problem.
- Buyers may add party details (date, time, place, RSVP) for the invitations. Copy them into party as written; they are never hiding spots.
- Set ok to false if the child's name, the theme, or at least 3 spots are missing, or if there are more than 12 spots.`;

async function parseOrder({ personalization, options = {} }) {
  const optionText = Object.entries(options)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    output_config: { effort: 'medium', format: zodOutputFormat(OrderSchema) },
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `Order options:\n${optionText || '(none)'}\n\nBuyer's personalization text:\n"""\n${personalization}\n"""`,
      },
    ],
  });
  if (response.stop_reason === 'refusal' || !response.parsed_output) {
    return { ok: false, problem: `Claude could not read this order (stop reason: ${response.stop_reason}).` };
  }
  return toHuntConfig(response.parsed_output);
}

// Validates Claude's answer and converts it to the generator's config shape.
function toHuntConfig(p) {
  if (!p.ok) return { ok: false, problem: p.problem || 'Order needs a look.', draft: p };
  const problems = [];
  if (!p.childName) problems.push('missing child’s name');
  if (!p.theme || !THEMES[p.theme]) problems.push('missing theme');
  if (!p.spots || p.spots.length < 3 || p.spots.length > 12) problems.push('needs 3 to 12 spots');
  const spots = (p.spots || []).map((s) => {
    if (s.libraryId && SPOTS[s.libraryId]) return s.libraryId;
    if (!Array.isArray(s.riddle) || s.riddle.length !== 2) problems.push(`no riddle for “${s.label}”`);
    return { label: s.label, tip: s.tip, riddle: s.riddle, ...(s.pic ? { pic: s.pic } : {}) };
  });
  if (problems.length) return { ok: false, problem: problems.join('; '), draft: p };
  return {
    ok: true,
    config: { theme: p.theme, childName: p.childName, ...(p.age ? { age: p.age } : {}), spots },
    pets: (p.pets || []).slice(0, 6),
    party: cleanParty(p.party),
  };
}

function cleanParty(party) {
  if (!party) return null;
  const out = Object.fromEntries(['date', 'time', 'place', 'rsvp'].filter((k) => party[k]?.trim()).map((k) => [k, party[k].trim().slice(0, 60)]));
  return Object.keys(out).length ? out : null;
}

// ---------- play kit only orders ----------

const KitSchema = z.object({
  ok: z.boolean().describe('false if the child’s first name is missing'),
  problem: z.string().nullable().describe('When ok is false: a short note to the shop owner saying what is missing'),
  childName: z.string().nullable(),
  age: z.number().int().nullable().describe('the child’s age, if given'),
  pets: z.array(z.object({ name: z.string(), kind: z.string() })).describe('up to 6 pets or toys; empty if none'),
});

// Reads a play kit order: the child's name plus any pets or toys, mapped to the kit's kinds.
async function parseKitOrder({ personalization, kit }) {
  const def = KITS[kit];
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 1000,
    output_config: { effort: 'low', format: zodOutputFormat(KitSchema) },
    system: `You set up personalized ${def.name} pretend play kits for children aged 3 to 8 from a buyer's Etsy order notes.
Return the child's first name, their age if given, and up to 6 pets or toys. For each, keep the name the buyer gave and set kind to the closest of: ${Object.keys(def.kinds).join(', ')}.
Missing pets are fine. Set ok to false only if there's no child's name.`,
    messages: [{ role: 'user', content: `Buyer's personalization text:\n"""\n${personalization}\n"""` }],
  });
  const p = response.parsed_output;
  if (!p) return { ok: false, problem: `Claude could not read this order (stop reason: ${response.stop_reason}).` };
  if (!p.ok || !p.childName) return { ok: false, problem: p.problem || 'missing child’s name', draft: p };
  return { ok: true, config: { kit, childName: p.childName.trim(), ...(p.age ? { age: p.age } : {}), subjects: p.pets.slice(0, 6), lenient: true } };
}

// ---------- party pack only orders ----------

const PartyOrderSchema = z.object({
  ok: z.boolean().describe('false if the child’s first name or the theme is missing'),
  problem: z.string().nullable().describe('When ok is false: a short note to the shop owner saying what is missing'),
  childName: z.string().nullable(),
  age: z.number().int().nullable().describe('the age the child is turning, if given'),
  theme: z.enum(Object.keys(THEMES)).nullable(),
  party: PartySchema,
});

// Reads a party pack order: the child's name and age, the theme, and optional party details.
async function parsePartyOrder({ personalization, options = {} }) {
  const optionText = Object.entries(options).map(([k, v]) => `${k}: ${v}`).join('\n');
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 1000,
    output_config: { effort: 'low', format: zodOutputFormat(PartyOrderSchema) },
    system: `You set up personalized birthday party printables (invitations, cupcake toppers, banner) for children from a buyer's Etsy order notes.
Themes (use the id): ${Object.values(THEMES).map((t) => `${t.id} = ${t.label}`).join('; ')}. The theme usually comes from a "Theme" option.
Return the child's first name, the age they're turning, the theme, and any party details for the invitations exactly as written.
Set ok to false only if the child's name or the theme is missing.`,
    messages: [{ role: 'user', content: `Order options:\n${optionText || '(none)'}\n\nBuyer's personalization text:\n"""\n${personalization}\n"""` }],
  });
  const p = response.parsed_output;
  if (!p) return { ok: false, problem: `Claude could not read this order (stop reason: ${response.stop_reason}).` };
  if (!p.ok || !p.childName || !THEMES[p.theme]) return { ok: false, problem: p.problem || 'missing child’s name or theme', draft: p };
  const party = cleanParty(p.party);
  return { ok: true, config: { theme: p.theme, childName: p.childName.trim(), ...(p.age ? { age: p.age } : {}), ...(party ? { party } : {}) } };
}

// ---------- handprint art orders ----------

const CraftSchema = z.object({
  ok: z.boolean().describe('false if the child’s first name is missing'),
  problem: z.string().nullable().describe('When ok is false: a short note to the shop owner saying what is missing'),
  childName: z.string().nullable(),
  age: z.number().int().nullable().describe('the child’s age, if given'),
});

// Reads a handprint art order: just the child's name and age for the keepsake lines.
async function parseCraftOrder({ personalization, holiday }) {
  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 500,
    output_config: { effort: 'low', format: zodOutputFormat(CraftSchema) },
    system: `You set up personalized handprint art keepsake pages for young children from a buyer's Etsy order notes.
Return the child's first name and their age if given. Set ok to false only if there's no child's name.`,
    messages: [{ role: 'user', content: `Buyer's personalization text:\n"""\n${personalization}\n"""` }],
  });
  const p = response.parsed_output;
  if (!p) return { ok: false, problem: `Claude could not read this order (stop reason: ${response.stop_reason}).` };
  if (!p.ok || !p.childName) return { ok: false, problem: p.problem || 'missing child’s name', draft: p };
  return { ok: true, config: { holiday, childName: p.childName.trim(), ...(p.age ? { age: p.age } : {}) } };
}

module.exports = { parseOrder, parseKitOrder, parsePartyOrder, parseCraftOrder, toHuntConfig, OrderSchema };
