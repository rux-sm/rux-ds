# The five verbs

Everything done in this family of repositories is one of five tasks. Each
has one command, one check, and one place to look afterwards. This card is
the instruction set; `README.md` "Picking this up", `docs/roadmap.md` and
`docs/log.md` are the record, and nothing you need to *do* lives only there.

Where a verb takes more than one command today, the card says so and names
what it should be. A command listed here exists; a target marked **not yet**
does not, and is the next thing to build for that verb.

Drafted 2026-09-05 from the three public repositories at `v0.1.6`.

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
| Serve | rux-ds: `npm run serve` → `http://localhost:8642`. Hub and Notes: `node tools/serve.mjs` → `http://localhost:8643`. |
| Check | rux-ds: `npm run verify`. Hub or an app: `node tools/check.mjs`. Browser gates: skill `sink-check`; `npm run gates` says which page was last swept and fails on one never swept. |
| Look | The page, in the browser, both themes. The template's `BEHAVIOUR:` comment says what was verified and what was not. |

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
| Check | rux-ds: `npm run verify` — `check-tokens` refuses a token the theme file invents, `check-classes` a class either file selects that `rux.css` does not compile. An app has no gate for this; copy the page into rux-ds's root, run `verify`, delete the copy. |
| Look | The component, in the sink or on the page, in both themes. A rule that should not have changed anything: measure before and after. |

One edit today. A rule promoted from an app's pair into rux-ds's is not
finished until a tag carries it, every pin has moved, and the app deletes its
own copy in the same commit as its pin move (`docs/roadmap.md` §4.13).

## 3 · Add an app

*A new module on rux-ds, joining the switcher on every site.*

Today, nine steps, seven by hand. **Target: two by hand** — create the repo,
add one line to `switcher.json`.

```sh
# from rux-ds, clean and at a tag
sh tools/new-project.sh ~/Developer/<name> --name <Name> --title "Rux <Name>"
```

Then, by hand until the script does it (**not yet**):

1. Create the repository and enable Pages — rux does this; `gh repo create` is refused to an agent.
2. Copy from the hub: `.github/workflows/pages.yml`, `.githooks/commit-msg`, `tools/serve.mjs`, `tools/check.mjs`, `.claude/launch.json`, `.gitignore`. Arm the hook: `git config core.hooksPath .githooks`.
3. In the new page, replace the template's switcher entries ("Rux DS / Deployments / Billing") with Home and this app, and add `<script src="/switcher.js"></script>` before `</body>`. The drift report cannot see either.
4. In the hub, add one entry to `switcher.json`: `{ "name", "path": "/<name>/", "description" }`. That is the whole registry; the panel and the launcher read it at runtime.
5. Delete the hub README's Apps table or update it — it is a second copy of the list. (**Target:** deleted.)
6. `node tools/check.mjs` in the hub, then in the app. Commit and push both.

| | |
|---|---|
| Look | `https://rux-sm.github.io/` — the new card; the switcher panel on Notes — the new entry, marked current on its own site. |

## 4 · Update the design system everywhere

*Move every app to a rux-ds tag.*

Do this when `CHANGES.md` gained a line, the drift report names a shell
change, or an app needs a component that arrived — not on every tag. `PIN`
records which tag each app is on either way.

Today, per app (**target: `sh tools/roll-out.sh vX.Y.Z`, one command for
every app, the rux-ds clone never leaves `main` — not yet**):

```sh
git -C ~/Developer/rux-ds fetch --tags && git -C ~/Developer/rux-ds checkout vX.Y.Z
sh ~/Developer/rux-ds/tools/new-project.sh ~/Developer/<app>      # asks nothing, moves the pin, prints drift
git -C ~/Developer/rux-ds checkout main                          # easy to forget
git -C ~/Developer/<app> diff --stat vendor/
```

Read the drift report. Apply by hand only what it names — it compares the
page's `<head>` resources and header skeleton to the vendored `app-shell` and
blocks nothing. Read `CHANGES.md` between the two tags: a class that left is
the one hazard. Then `node tools/check.mjs`, commit
`chore(vendor): Move the pin to rux-ds vX.Y.Z`, push. Repeat for the next app.

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

An app is `index.html`, `vendor/rux-ds/`, two delta CSS files and one check.
Notes carries more for one reason, privacy; that reason does not travel to
the next app.
