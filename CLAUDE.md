# CLAUDE.md — context routing

Roadmap §4.6 asks this file to be routing, not prose: where things live and what MUST
NOT be invented. It loads into every session, so every line here costs context. Nothing
below is repeated from `README.md` or `docs/roadmap.md` — follow the pointer instead.

**Read first:** `README.md` → its "Picking this up" section is the current state, what is
open, and who decides. `docs/roadmap.md` is the canonical plan and decision log.

## The one rule

**No Carbon file is ever edited.** Customization is `$prefix`, Carbon's config flags, and
which components and themes `src/app.scss` compiles. One documented exception, enforced
on every build. Roadmap §1.1.

## Where things live

| | |
|---|---|
| `src/app.scss` | the build manifest — commenting a `@use` line is the whole of cutting a component |
| `sink/*.html` | one fragment per component; **`kitchen-sink.html` is generated, never edit it** |
| `js/` | the behaviour layer — `js/overlay.js` is the kernel and loads first |
| `docs/carbon-*.json` | the markup reference — 641 captured Carbon stories across four files: `carbon-react-dom` (505), `carbon-ibm-products-dom` (20) and the two `-states` recipes (116) |
| `docs/composing-pages.md` | **how to build a PAGE**, as against what a component is — which template to copy, the eleven traps, and where IBM's own pattern guidance fits |

## What MUST NOT be invented

- **Classes.** Every `rux--*` comes from Carbon. `npm run verify` fails on one that does
  not resolve, or whose component is not compiled.
- **Markup structure.** Diff against the captures in `docs/`, not against a guess and not
  against the live Storybook — the captures match the compiled Carbon version and need no
  network. `node tools/diff-fragment.mjs <name>` does it mechanically.
- **Decisions.** Roadmap §1.1, §2.1, §4.4 and §4.6 record choices *with their rejected
  alternatives*. Ask before reopening one; do not re-derive it.
- **Behaviour Carbon does not have.** Modules make Carbon's components work; they do not
  add interactions Carbon declines (see accordion's note on arrow keys).

## Verifying

**Seventeen gates. Twelve run in `npm run verify`; five need a browser.** `npm run gates`
says which has been run against which page, and which have never been run at all —
`tools/lib/gates.mjs` is the registry and the single source for those counts.
That coverage check runs in `verify` too and **fails on a page nobody has ever
swept**, which is the state that let one bug ship nine times. A reading that has
merely aged prints and does not block: editing `css/rux.css` or `js/` invalidates
every browser cell by design, and a gate red on every commit is one nobody keeps.
**Check verify's exit code — do not grep its output**; a pipe returns the exit code of
the last command, which has reported a pass over a failure here.

**The gates cannot see everything, and looking is not optional.** Five defects this
project has shipped passed every gate: two chevrons rotated from the wrong base glyph
(no gate reads which icon a `<use>` points at), a missing positioning wrapper, a missing
styled wrapper, and four menu specimens that were `visibility: hidden`. Open the page.

`tools/check-a11y.js`, `tools/check-rendered.js`, `tools/check-runtime-classes.js`,
`tools/check-spacing.js` and `tools/check-behaviour.js` are browser-only — run them from the served page, not by
pasting, so the file on disk is what runs. **`check-a11y`, `check-runtime-classes` and
`check-spacing` run on a TEMPLATE as well as the sink**, and a bug shipped nine times in
`table-page.html` because nobody did. Two cannot: `check-rendered`, whose unit is the
`.ks-sec` section that no template has, and `check-behaviour`, which drives every module
and needs one of every component to drive. `check-runtime-classes` answers
what `check-coverage` cannot: whether a class in the markup still exists once the
modules have run.

## The sink contains specimens as well as components

Some fragments demo a CSS state with no trigger and no tab stop — `sink/list-box.html`'s
`<div>` field, `sink/menu.html`'s densities. They are deliberately not operable. A module
claims a component by its interactive element, never by the root class.

## Commits

`docs/commits.md`, enforced by a hook: subject ≤50 chars, body wrapped at 72 **bytes**
(an em-dash costs 3), no AI attribution of any kind.

## Templates — started

`templates/app-shell.html` is the page frame: header with product nav and global
actions, a `--side-nav--ux` nested inside it, a working hamburger, and the `main` the
other five templates drop into. **Copy it, not `sink/ui-shell.html`** — the sink is the
same shell in a 22rem sandbox, so its header and nav are positioned for a specimen.

**`--side-nav--ux` is 16rem, not a rail.** The rail is `--side-nav--rail`; bare
`.rux--side-nav` is 3rem. Nothing offsets `.rux--content` for a nav inside the header —
only a SIBLING nav does that — so the page indents itself with the breakpoint-scoped
fixed padding in the template's `<head>`. A grid offset (`lg:col-start-4`) was tried
and is wrong, as is a margin; the template says why.

`templates/table-page.html` is the second: the same shell with a sortable, selectable
table, a toolbar, batch actions and pagination. **Each template is a COMPLETE page**,
shell included — §4.6 asks for runnable skeletons, so they duplicate rather than nest.

All six templates exist — form, detail, empty state and error state included. Copy the
nearest shape; `sink/*.html` remains the markup reference for a component no template
carries.

**A template's behaviour is verified against a RUNNING Carbon page, never
derived from `css/rux.css`.** The stylesheet gives the mechanism and says
nothing about the intent; four wrong shell answers in one sitting came from
reading it and guessing. `docs/verifying-templates.md` is the procedure, and
`check-provenance` requires every template to carry a `BEHAVIOUR:` comment
naming the page, the date, and what was NOT covered.

**Every page carries the sprite; every `<use>` is `#i-name`.** `build-sink` inlines it
into `kitchen-sink.html`, `npm run icons` inlines it into each template between
`SPRITE:BEGIN`/`SPRITE:END`. Referencing `../assets/icons.svg#i-name` instead is a
`check-icons` fault: WebKit follows no cross-document `<use>` and `file://` blocks it in
every engine, and both fail SILENTLY — a fully styled page with no icons on it.
