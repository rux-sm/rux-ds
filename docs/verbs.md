# The five verbs

Everything done in this family of repositories is one of five tasks. Each
has one command, one check, and one place to look afterwards. This card is
the instruction set; `README.md` "Picking this up", `docs/roadmap.md` and
`docs/log.md` are the record, and nothing you need to *do* lives only there.

Where a verb takes more than one command today, the card says so and names
what it should be. A command listed here exists; a target marked **not yet**
does not, and is the next thing to build for that verb.

Drafted 2026-09-05 from the three public repositories at `v0.1.6`. Revised
the same day, after the eight-phase workspace plan was withdrawn for four
changes: verbs 3 and 4 have their commands, and an app's check is rux-ds's,
vendored with the pin (`tools/app-check.mjs`, `tools/app-skeleton/`,
`tools/roll-out.sh`, `new-project.sh --tag`). The hub and Notes pick those up
at their next pin move to a tag that carries them; until then the rows below
say which of today's steps still apply to them.

---

## Before any verb

```sh
cd ~/Developer/rux-ds && git pull --ff-only && npm install --ignore-scripts
```

Check the **exit code** of every check below, never its output. The gates
cannot see everything; five shipped defects passed all of them. Every verb
ends by opening the page.

Four things are never done, in any repository: editing a file under
`node_modules/@carbon` or `vendor/rux-ds/`; writing a `rux--*` class Carbon
does not compile; `!important`; a commit not in `type(scope): Subject` form
authored by rux alone. `AGENTS.md` is the policy; this card is the routine.

---

## 1 · Change a page

*A page in rux-ds, the hub, or an app: new or edited.*

| | |
|---|---|
| How | Skill `rux-ds-page`. Copy the nearest `templates/*.html`; never start from scratch or from a guess. Markup is diffed against `docs/carbon-*.json` (`node tools/diff-fragment.mjs <name>`). |
| Serve | rux-ds: `npm run serve` → `http://localhost:8642`. An app: `node tools/serve.mjs` → `http://localhost:8643`. |
| Check | rux-ds: `npm run verify`. An app: `node tools/check.mjs` — rux-ds's shared check from `vendor/rux-ds/tools/app-check.mjs` (classes, tokens, local references, ids, the pin), then the app's own gates. Browser gates: skill `sink-check`; `npm run gates` says which page was last swept and fails on one never swept. |
| Look | The page, in the browser, in every theme — white, g10, g90, g100, rux — from the account panel. The template's `BEHAVIOUR:` comment says what was verified and what was not. |

One command today. Notes is the exception: its pages are generated, so the
edit goes in `tools/build.mjs`, then `node tools/build.mjs`, then the check.

## 2 · Change how something looks

*A colour, a spacing, a component's appearance — in one app or in all of them.*

| The change is | It goes in | Reaches |
|---|---|---|
| A colour, or any value a token names | `rux-theme.css`, inside a `[data-theme]` block | |
| How a component looks beyond its tokens | `rux-overrides.css`, at Carbon's own specificity | |
| — in one app only | that app's own pair, at its root | that app |
| — in every app | `css/` pair in rux-ds | every app, after verb 5 then verb 4 |

| | |
|---|---|
| Check | rux-ds: `npm run verify` — `check-tokens` refuses a token the theme file invents, `check-classes` a class either file selects that `rux.css` does not compile. An app: `node tools/check.mjs` — the vendored check refuses a class the pinned `rux.css` does not compile and a `var(--rux-*)` nothing declares, in the page, the two delta files and local scripts. Nothing is ever copied into rux-ds to check it. Hub and Notes: their own class check until the next pin move, and nothing checks a token there yet. |
| Look | The component, in the sink or on the page, in every theme. A rule that should not have changed anything: measure before and after. |

One edit today. A rule promoted from an app's pair into rux-ds's is not
finished until a tag carries it, every pin has moved, and the app deletes its
own copy in the same commit as its pin move (`docs/roadmap.md` §4.13).

## 3 · Add an app

*A new module on rux-ds, joining the switcher on every site.*

One command, then two things by hand — create the repository, add one line
to `switcher.json`. (Until 2026-09-05: nine steps, seven by hand.)

```sh
# from rux-ds on main, naming a tag that carries tools/app-check.mjs
sh tools/new-project.sh ~/Developer/<name> --tag vX.Y.Z \
   --name <Name> --title "Rux <Name>" --path /<name>/
```

It asks the template, theme and file name it was not given, vendors the
release, writes the page with its switcher set to Home and this app and
`/switcher.js` linked, copies `tools/app-skeleton/` — the check and serve
launchers, the hook, the Pages workflow, `AGENTS.md`, `launch.json`,
`.gitignore` — runs the new app's `node tools/check.mjs`, and prints what is
left. From a tag older than the check it says the launchers point at nothing
yet, and does not fail.

Then, by hand:

1. `git init && git config core.hooksPath .githooks`. Create the repository: an agent may run `gh repo create` once rux has named the app in the conversation (rule changed 2026-09-06; it was rux's alone before). The REST form, `gh api -X POST /user/repos`, is still refused to an agent and is not a fallback. Enabling Pages stays rux's click; the Pages API is refused.
2. In the hub, add one entry to `switcher.json`: `{ "name", "path": "/<name>/", "description" }`. That is the whole registry; the panel and the launcher read it at runtime, and the hub README no longer carries a copy. `node tools/check.mjs` there.
3. Open the page in every theme. Commit and push both.

| | |
|---|---|
| Look | `https://rux-sm.github.io/` — the new card; the switcher panel on Notes — the new entry, marked current on its own site. |

## 4 · Update the design system everywhere

*Move every app to a rux-ds tag.*

Do this when `CHANGES.md` gained a line, the drift report names a shell
change, or an app needs a component that arrived — not on every tag. `PIN`
records which tag each app is on either way.

One command for every app, from rux-ds on `main`, which it never leaves:

```sh
git -C ~/Developer/rux-ds fetch --tags
sh ~/Developer/rux-ds/tools/roll-out.sh vX.Y.Z          # --app <name> for one; --dry-run to see
```

It finds every sibling folder with a `vendor/rux-ds/PIN`, refuses the lot if
any is dirty, lacks an upstream or has no `tools/check.mjs`, then per app
exports the tag (`new-project.sh <app> --tag vX.Y.Z`, usable alone), runs
that app's own check, and stops at the first failure with the restore
command printed. Only `vendor/` changes. It commits nothing.

Read each drift report. Apply by hand only what it names — it compares the
page's `<head>` resources and header skeleton to the vendored `app-shell` and
blocks nothing. Read `CHANGES.md` between the two tags: a class that left is
the one hazard a green check does not show. Then per app, commit
`chore(vendor): Move the pin to rux-ds vX.Y.Z`, push.

| | |
|---|---|
| Look | Each site, live: header, switcher, account panel, theme. Record the pass in `docs/log.md`. |

## 5 · Release the design system

*Cut a tag consumers can pin.*

```sh
npm run verify            # every Node gate, exit code
npm run gates             # every browser cell swept against the current page
```

If a class or component left, one line in `CHANGES.md`, newest first, with
the commit; the tag is then a **minor**. Otherwise a **patch**. `v1.0.0` when
rux says so. Nothing else is recorded — additions are safe.

```sh
git tag vX.Y.Z
git push origin vX.Y.Z    # two commands; one carrying both is refused
```

| | |
|---|---|
| Look | `git describe --tags` says the tag; `CHANGES.md` says what left. A consumer does not move until verb 4 has a reason. |

---

## What each repository is, in one line

| Repository | Is | Its check |
|---|---|---|
| `rux-ds` | the design system; the only place a class or a rule is born | `npm run verify`, then `sink-check` |
| `rux-sm.github.io` | the front door and the app list (`switcher.json`) | `node tools/check.mjs` |
| `rux-ln-notes` | one app; pages generated from private data | `node tools/build.mjs && node tools/check.mjs` |
| `rux-backend` | the one Supabase project's configuration; no secrets | — |
| `rux-ln-atlas` | private; nothing from it appears anywhere public | — |

An app is `index.html`, `vendor/rux-ds/`, two delta CSS files, and the
launchers `tools/app-skeleton/` writes — a check, a server and a hook that
each run rux-ds's vendored copy, so the rules move with the pin. Notes
carries more for one reason, privacy; that reason does not travel to the
next app.
