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

`templates/app-shell.html` is the page frame: header, fixed side nav, and the `main`
the other five templates drop into. **Copy it; do not copy `sink/ui-shell.html`** — the
sink demos Carbon's OTHER shell, the rail nested inside the header, which does not
offset the content region. The template's own comment records why they are not mixed.

Form, table, detail, empty state and error state are not written yet; until they are,
`sink/*.html` is still the markup to copy for a page body.

**A template references the sprite, a fragment inlines it.** `../assets/icons.svg#i-name`
in `templates/`, `#i-name` in `sink/`. `check-icons` enforces each against its own root,
and a template must be SERVED — a cross-document `<use>` over `file://` paints nothing.
