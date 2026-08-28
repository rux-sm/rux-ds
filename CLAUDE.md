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

## What MUST NOT be invented

- **Classes.** Every `rux--*` comes from Carbon. `npm run verify` fails on one that does
  not resolve, or whose component is not compiled.
- **Markup structure.** Diff against the captures in `docs/`, not against a guess and not
  against the live Storybook — the captures match the compiled Carbon version and need no
  network. `node tools/diff-fragment.mjs <name>` does it mechanically.
- **Decisions.** Roadmap §1.1, §2.1 and §4.4 record choices *with their rejected
  alternatives*. Ask before reopening one; do not re-derive it.
- **Behaviour Carbon does not have.** Modules make Carbon's components work; they do not
  add interactions Carbon declines (see accordion's note on arrow keys).

## Verifying

`npm run verify` runs eleven gates. **Check its exit code — do not grep its output**; a pipe
returns the exit code of the last command, which has reported a pass over a failure here.

**The gates cannot see everything, and looking is not optional.** Five defects this
project has shipped passed every gate: two chevrons rotated from the wrong base glyph
(no gate reads which icon a `<use>` points at), a missing positioning wrapper, a missing
styled wrapper, and four menu specimens that were `visibility: hidden`. Open the page.

`tools/check-a11y.js` and `tools/check-rendered.js` are browser-only — paste into the
kitchen sink's devtools console.

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
only a SIBLING nav does that — so the page indents itself, breakpoint-scoped, with
`rux--lg:col-start-4`. Do not reach for a margin; the template says why.

Form, table, detail, empty state and error state are not written yet; until they are,
`sink/*.html` is still the markup to copy for a page body.

**Every page carries the sprite; every `<use>` is `#i-name`.** `build-sink` inlines it
into `kitchen-sink.html`, `npm run icons` inlines it into each template between
`SPRITE:BEGIN`/`SPRITE:END`. Referencing `../assets/icons.svg#i-name` instead is a
`check-icons` fault: WebKit follows no cross-document `<use>` and `file://` blocks it in
every engine, and both fail SILENTLY — a fully styled page with no icons on it.
