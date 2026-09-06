# app-skeleton — what every app on rux-ds starts with

`tools/new-project.sh` copies this directory into a project on its FIRST run
(no `vendor/rux-ds/PIN` yet), each file only if absent, and never on a pin
move. Nothing here holds a rule: every file is a launcher into the vendored
release, so the rules move with the pin. `@NAME@`, `@TITLE@`, `@PATH@` and
`@DIR@` are substituted; nothing else is.

| File | Is | Into |
|---|---|---|
| `AGENTS.md` | the app's policy: what is its own, what is rux-ds's, the one check | `vendor/rux-ds` for the rules |
| `CLAUDE.md` | imports `AGENTS.md` | |
| `tools/check.mjs` | runs `vendor/rux-ds/tools/app-check.mjs`; app gates go after it | |
| `tools/serve.mjs` | runs `vendor/rux-ds/tools/serve.mjs` on 8643 | |
| `.githooks/commit-msg` | runs `vendor/rux-ds/githooks/commit-msg` | armed by `git config core.hooksPath .githooks` |
| `.github/workflows/pages.yml` | check, then deploy; carries no rule of its own | |
| `.claude/launch.json` | the server, for the Browser pane | |
| `.gitignore` | `.DS_Store`, `node_modules/` | |

Until 2026-09-05 these six were copied from the hub by hand (`docs/verbs.md`
verb 3, step 2). The hub and Notes keep their own copies until their next pin
move to a tag that carries `tools/app-check.mjs`.
