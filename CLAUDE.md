# Little Print Quests

Personalized printable scavenger hunts, pretend play kits, party packs and activity packs for kids ages 3 to 8. Sold on the direct site (`docs/`, GitHub Pages) with an order bot (`src/bot/`), plus a fading Etsy shop.

## Read this first

This repo is the shared home for the project. Jason works on it from more than one Claude account, and project memory and project files do not sync between accounts. So:

- **Read [`notes/PROJECT-NOTES.md`](notes/PROJECT-NOTES.md) at the start of every session.** It holds the decisions, preferences, pipelines and gotchas that would otherwise live in project memory.
- **Keep it updated.** When you learn something a future session would have to ask Jason again (a preference, a decision, a pipeline, a gotcha), add it to the notes in the same PR as your work. Use absolute dates.
- Small text assets that used to live only in Claude project files (prompts, image tools, configs, the Pinterest CSV) are in [`project-files/`](project-files/), at the same paths they had under `/mnt/project-files/`. Large binaries are not in git; see [`notes/large-files.md`](notes/large-files.md).
- Setting up another account: [`notes/second-account-setup.md`](notes/second-account-setup.md).

## Working rules

- Merging: once a PR passes `npm test`, CI and its own checks, the thread merges it into main itself (squash). If it depends on another open PR, merge in dependency order or rebase onto main first. Don't wait for Jason. Tell him when it's merged and live.
- Before merging, check the PR merges cleanly into main; after merging, grep the storefront pages (`docs/index.html`, `docs/make/index.html`, `docs/play-kits/`, `docs/handprint-art/`) for duplicated blocks or ids (`npm test` checks ids too).
- Never commit secrets. The Gemini key is injected by the Claude environment proxy, so no env var is needed.
- Ask before committing large binaries (photos, PDFs, raw Gemini output).

## Commands

- `npm test` runs `test/smoke.js`.
- `npm run hunt`, `npm run kit`, `npm run party`, `npm run standard-packs` render products.
