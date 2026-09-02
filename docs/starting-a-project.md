# Starting a project

One step, from a clone of rux-ds at a tag:

```sh
git clone --depth 1 --branch v0.1.0 https://github.com/rux-sm/rux-ds.git
sh rux-ds/tools/new-project.sh ~/Developer/my-app
```

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
├── index.html            yours — the template, paths pointed at vendor/
├── rux-theme.css         yours — token values, one [data-theme] block
├── rux-overrides.css     yours — component rules, ships empty
└── vendor/rux-ds/        rux-ds's — never edited, overwritten by every run
    ├── PIN                 which tag and commit this is
    ├── css/rux.css         the stylesheet; rux.min.css beside it
    ├── js/                 the behaviour modules the page links
    └── assets/             icons.svg and fonts/ with its licence
```

Three kinds of file. The script writes `vendor/` every time and the other
three only when they are missing, so re-running it moves the pin without
touching your work.

## Which file a change goes in

The same rule as inside rux-ds (`AGENTS.md`, "Where a change goes"):

| The change is | It goes in |
|---|---|
| A colour, or any value a token names | `rux-theme.css`, inside a `[data-theme]` block |
| How a component looks beyond its tokens | `rux-overrides.css`, at Carbon's own specificity, no `!important` |
| A page | copy a template again; the script will not overwrite the one you have |
| Anything under `vendor/` | rux-ds itself: a request with invented content, never a local edit |

Themes: `data-theme` on `<html>` is `white`, `g10`, `g90`, `g100`, or `rux`
for the block in your theme file. The app shell's header carries its own
`g100` and keeps it whatever the page is set to.

A class the stylesheet does not compile has no gate here to catch it. rux-ds
reads every `*.html` at its own root, so a page copied there and put through
`npm run verify` gets `check-classes` and `check-tokens` for free; delete the
copy afterwards.

## Moving the pin

```sh
git -C rux-ds fetch --tags && git -C rux-ds checkout v0.2.0
sh rux-ds/tools/new-project.sh ~/Developer/my-app
git -C ~/Developer/my-app diff --stat vendor/
```

Additions are safe. A class that LEFT is the one hazard, and `CHANGES.md` in
rux-ds is the list, newest first, with the commit; read it between the two
tags before trusting the diff. Vendoring from a commit between tags works and
the PIN says so.

## Measured

2026-09-02, from this checkout at `v0.1.0`: the script ran in well under a
second; clone, script and a rendered first page took under a minute, against
the ten minutes §4.11 asked for. The page was opened in the browser with every
stylesheet resolving, IBM Plex serving, the modules running, and the runtime
class check reading nothing stripped.
