# Using this project from a second Claude account

Claude project memory and project files belong to one account and don't sync. The GitHub repo does, so it's the shared home: [`CLAUDE.md`](../CLAUDE.md) tells every session to read and update [`PROJECT-NOTES.md`](PROJECT-NOTES.md).

## One-time setup on the second account

1. **Connect GitHub.** Sign in to claude.ai with the second account and go to https://claude.ai/connect-github. Either sign in as the same GitHub user (`jtr4in`), or use a different GitHub user and first add it as a collaborator with write access (GitHub repo -> Settings -> Collaborators).
2. **Install the Claude GitHub App on the repo** if GitHub asks: https://github.com/apps/claude/installations/select_target, choose `jtr4in/LittlePrintQuests`.
3. **Create a project** (any name, for example "Little Print Quests") and add the repository `jtr4in/LittlePrintQuests` in Project settings -> Resources.
4. **Paste the project instructions** into Project settings:

   > Merging: once a thread's PR passes tests/CI and its own checks, the thread merges it into main itself (squash). If it depends on another open PR, merge in dependency order or rebase onto main first. Don't wait for Jason to merge. Tell him when it's merged and live.
   >
   > Shared notes: this project is used from two Claude accounts. Read notes/PROJECT-NOTES.md in the repo before starting, and add anything a future session would need to it in the same PR.

   Paste the same "Shared notes" paragraph into the first account's project instructions too.
5. **Optional, for large files:** approve the shared folder on your computer (see below) so threads can read the photos, samples and raw art.
6. **Optional, environment network access:** image tools call `generativelanguage.googleapis.com` (Gemini). If the second account's environment doesn't allow and authenticate that host, add a Gemini API key to the environment's secrets instead of to the repo.

## Hopping back and forth

- Start each piece of work from the latest `main`. Merge finished work before switching accounts so the other side sees it.
- Anything worth remembering goes in `notes/PROJECT-NOTES.md`, not only in an account's project memory.
- Small text assets (prompts, scripts, configs) go in `project-files/` in the repo. Large binaries go in the shared folder.

## Large files

Photos, sample PDFs and raw Gemini output (about 370 MB) are too big for git. See [large-files.md](large-files.md) for the inventory and where they live.
