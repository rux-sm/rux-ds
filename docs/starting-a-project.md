# Starting a project

One step, from a clone of rux-ds with the tags fetched:

```sh
git clone https://github.com/rux-sm/rux-ds.git
sh rux-ds/tools/new-project.sh ~/Developer/my-app --tag v0.1.7 --path /my-app/
```

`--tag` takes the files from that tag without checking it out; without it the
script vendors the working tree and refuses a dirty or unpushed one. `--path`
is where the app will live under the account root, used once, for the
switcher entries it writes.

Open `~/Developer/my-app/index.html` in a browser. It is the app-shell
template: header, side nav, a page of content, every module running, IBM Plex
loading from the folder. No build, no install, no server needed — the page is
plain HTML linking plain CSS and JS by relative path.

Run with no arguments it asks instead: folder, template, theme, product
name, tab title, file name, each with a numbered list or a default that
Enter accepts. Flags answer the same questions for a script:

```sh
sh rux-ds/tools/new-project.sh ~/Developer/my-app --template table-page \
   --theme g10 --name Orders --title "Orders" --page orders
```

What can be chosen, and what each choice is for, is `docs/choices.md`. A
second positional argument picks another template, a third names the page:

```sh
sh rux-ds/tools/new-project.sh ~/Developer/my-app table-page orders
```

writes `orders.html` from `templates/table-page.html`. The templates are
listed by running the script with a name it does not have.

## What you get

```
my-app/
├── index.html            yours — the template, paths pointed at vendor/,
│                         switcher set to Home and this app, /switcher.js linked
├── rux-theme.css         yours — token deltas only, ships empty
├── rux-overrides.css     yours — component-rule deltas only, ships empty
├── brand/                yours — logo.svg and favicon.svg, seeded once
├── AGENTS.md, CLAUDE.md  yours — the app's policy, short; imports nothing else
├── tools/check.mjs       runs vendor/rux-ds/tools/app-check.mjs; your gates after it
├── tools/serve.mjs       runs vendor/rux-ds/tools/serve.mjs on 8643
├── .githooks/commit-msg  runs vendor/rux-ds/githooks/commit-msg
├── .github/workflows/pages.yml   check, then deploy; no rule of its own
├── .claude/launch.json, .gitignore
└── vendor/rux-ds/        rux-ds's — never edited, replaced whole by every run
    ├── PIN                 which tag and commit this is
    ├── css/rux.css         the stylesheet; rux.min.css beside it
    ├── css/rux-theme.css   the canonical theme, the same in every app
    ├── css/rux-overrides.css  the canonical rules, the same in every app
    ├── js/                 the behaviour modules the page links
    ├── assets/             icons.svg and fonts/ with its licence
    ├── templates/          what the drift report compares your shell to
    ├── tools/              app-check.mjs and serve.mjs, from a tag that has them
    └── githooks/           commit-msg
```

The launchers and `AGENTS.md` come from `tools/app-skeleton/` on the first
run only, each file only if absent; a pin move never touches them. From a tag
older than `tools/app-check.mjs` the launchers point at files `vendor/` does
not have, and the script says so rather than failing.

Three kinds of file. The script writes `vendor/` every time and the other
three only when they are missing, so re-running it moves the pin without
touching your work. Your page links the vendored theme and overrides first
and your own two after them, so rux-ds's decisions arrive with every pin
move and yours stay on top. Since 2026-09-02 (roadmap §4.13); before that
the two files were copies of rux-ds's and never moved again.

**After every run the drift report prints**: what each page's `<head>`
resources and header skeleton carry that the pinned template does not, and
the reverse. It blocks nothing. A page is yours, and the report is what tells
you a shell change upstream — a preload, a panel, a module — has not reached
it; apply what you want by hand.

## Which file a change goes in

The same rule as inside rux-ds (`AGENTS.md`, "Where a change goes"):

| The change is | It goes in |
|---|---|
| A colour, or any value a token names | your `rux-theme.css`, inside a `[data-theme]` block, on top of the vendored one |
| How a component looks beyond its tokens | your `rux-overrides.css`, at Carbon's own specificity, no `!important` |
| A page | copy a template again; the script will not overwrite the one you have |
| Anything under `vendor/` | rux-ds itself: a request with invented content, never a local edit |

Themes: `data-theme` on `<html>` is `white`, `g10`, `g90`, `g100`, or `rux`
for the block in your theme file. The app shell's header carries its own
`g100` and keeps it whatever the page is set to.

`node tools/check.mjs` is the gate: rux-ds's shared check, from the vendored
copy, refuses a class the pinned `rux.css` does not compile, a `var(--rux-*)`
nothing declares, a relative `href` or `src` that names nothing, a duplicate
or dangling id, and a `PIN` that names no tag. Nothing is copied into rux-ds
to check it — a consumer page never enters that repository, even for a
minute. What the check cannot see is how the page looks; it prints which
pages to open and names the five themes.

## Moving the pin

```sh
git -C rux-ds fetch --tags
sh rux-ds/tools/new-project.sh ~/Developer/my-app --tag v0.2.0
git -C ~/Developer/my-app diff --stat vendor/
```

With a `PIN` already under `vendor/rux-ds/` and nothing else named, the script
asks nothing and writes no page — it moves the pin and stops. Name a template
or a page to add one. `--tag` exports the tag's tree; your rux-ds clone stays
on `main`, and a tag that is not on origin is refused. Every app at once is
`sh rux-ds/tools/roll-out.sh v0.2.0` (`docs/verbs.md`, verb 4). Until
2026-09-05 this was checkout, run, checkout `main` — and the third line was
the one forgotten.

Additions are safe. A class that LEFT is the one hazard, and `CHANGES.md` in
rux-ds is the list, newest first, with the commit; read it between the two
tags before trusting the diff. Vendoring from a commit between tags works and
the PIN says so.

Inside rux-ds a tag reaches every module, the root first because it serves
`/switcher.js`, and a rule promoted from a module's own delta file into
`css/rux-overrides.css` or `css/rux-theme.css` is not finished until a tag
carries it, every pin has moved, and the donating module deletes its own copy
in the same commit as the move (roadmap §4.13, 2026-09-03). Tag first, record
after; `git tag` and `git push` as two commands, since one command carrying
both is refused here. This paragraph is the one recipe — the hub's and Notes'
READMEs point at it rather than carry their own.

## Measured

2026-09-02, from this checkout at `v0.1.0`: the script ran in well under a
second; clone, script and a rendered first page took under a minute, against
the ten minutes §4.11 asked for. The page was opened in the browser with every
stylesheet resolving, IBM Plex serving, the modules running, and the runtime
class check reading nothing stripped.
