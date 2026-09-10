# app-skeleton — what every app on rux-ds starts with

`tools/new-project.sh` copies this directory into a project on its FIRST run
(no `tools/check.mjs` yet), each file only if absent. Nothing here holds a
rule: every file is a launcher that reads rux-ds from the checkout beside
this repository (or `DS=<dir>`), so the rules stay rux-ds's own. `@NAME@`,
`@TITLE@`, `@PATH@` and `@DIR@` are substituted; nothing else is.

| File | Is | Reads |
|---|---|---|
| `AGENTS.md` | the app's policy: what is its own, what is rux-ds's, the one check | |
| `CLAUDE.md` | imports `AGENTS.md` | |
| `tools/check.mjs` | runs rux-ds's `tools/app-check.mjs`; app gates go after it | `../rux-ds`, or `DS=<dir>` |
| `tools/serve.mjs` | runs rux-ds's workspace server on :8640, this app at its own path | `../rux-ds`, or `DS=<dir>` |
| `.githooks/commit-msg` | runs rux-ds's hook | armed by `git config core.hooksPath .githooks` |
| `.github/workflows/pages.yml` | checks rux-ds out at its newest tag, checks, then deploys; carries no rule of its own | |
| `.claude/launch.json` | the server, for the Browser pane | |
| `.gitignore` | `.DS_Store`, `node_modules/` | |

Until 2026-09-10 (roadmap §8.4 diff C) these files ran a copy vendored under
`vendor/rux-ds/` and a pin moved it forward; now each reads a sibling
checkout, and there is nothing to move. The hub and Notes moved to this same
shape the same day (§8.4 step 5); no app in the family vendors a copy.
