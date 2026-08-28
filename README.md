# rux-ds

A framework-free CSS/HTML/JS design system, derived from Carbon v11 by subtraction.
Its primary consumer is Claude Code generating consistent pages.

**Start with [`docs/roadmap.md`](docs/roadmap.md)** — the end goal, the decisions on
record, and the phase this project is in. This README is the index: current state, what
is open, and where each rule lives. It does not repeat the roadmap, because a rule
stated twice drifts — which is exactly what happened to the Status block below before
2026-08-28.

`CLAUDE.md` is the routing file an agent loads automatically; it points at the rules
below rather than repeating them. **The guide to BUILDING a page is Phase 6 and has
started** — `templates/app-shell.html` is the frame and `table-page.html` the first page
built on it. Until the rest land the kitchen sink is still the worked example and
`sink/*.html` the markup to copy.

## Status

**Phase 3 complete — stripped.** Carbon compiles under the `rux` namespace, every
shipped fragment has been diffed against Carbon's own rendered DOM, and the build is
now the keep-set rather than all of Carbon.

**Phase 5 (behaviors) — every module written, exit criterion still open.** Twelve
modules in `js/`: an overlay kernel plus popover, menu, list-box, tabs, accordion,
data-table, form-controls, ui-shell, dismiss, tile and modal. **The markup is the API** —
a page built from a template needs no script of its own. An attribute appears only when
trigger and surface are too far apart for the markup to relate them (`data-rux-open` on
modal and menu); a popover, tooltip or overflow menu needs none. Focus trapping, Escape,
outside press and the stack deciding which surface a press belongs to all come from the
kernel.

What is left of the phase is not code: **a screen-reader pass**. `tools/check-a11y.js`
reports 0 findings, but it reads attributes rather than running an AT. Its focus-ring
check does now run in an automated browser, once the page has focus. See "Picking this
up".

**Phase 4 (devendor) now runs last.** Execution order
is 1 → 2 → 3 → 5 → 6 → 4 → 7 → 8; the phase numbers are names, not positions. Devendoring
closes the component set, and `data-table` shipped unable to sort or expand until the
sink tried to demo it — so the set is frozen after the templates have finished teaching
us what it needs, not before. Roadmap §4.4.

### Picking this up

Everything below is in the repo, so a fresh clone is the whole handover — nothing lives
in an editor session or a machine-local note.

**Next:** Phase 6, templates. Roadmap §4.6 calls it the actual goal; everything before it
is preparation. Two of six exist — `app-shell.html` and `table-page.html`; form,
detail, empty state and error state are open. Every gate that reads markup per file
reads `templates/` too.

**Blocking §4.5's exit** — one human task, which cannot be automated here:

- Run VoiceOver or NVDA over `kitchen-sink.html`. This is the ANNOUNCEMENT pass and
  nothing here substitutes for it. Do it in a focused window: `check-a11y.js` still
  refuses its focus-ring check when `document.hasFocus()` is false.

  Two reasons this entry used to give are gone, 2026-08-28. Real key events ARE
  delivered in an automated pane — a focused button receives a trusted `keydown` — and
  tabs, menus and the combobox have since been driven by hand that way. Tab ORDER has
  still only been walked in places, never swept end to end.

**Decisions waiting on you**, each recorded where it applies:

| What | Where |
|---|---|
| The 90 KB JS budget needs a unit — 83.5 KB raw is 46% comment, 45 KB code, 22.7 KB gzipped | roadmap §4.5 |
| No gate checks which glyph a `<use>` points at — `check-icons` only proves it resolves | roadmap §4.5 |
| `date-picker` / `time-picker`, `combo-box` / `multiselect`, `toggletip` — all DEFER, none decided | `docs/inventory.md`, "What needs your call" |

**Nothing else is pending.** The working tree, `main` and `origin/main` were level at the
last push, and `npm run verify` runs all eleven gates.

| | |
|---|---|
| Components | **31 / 75 compiled** in 34 modules — `docs/inventory.md` decides all 75 |
| Themes | 2 — white, g100 |
| Tokens · classes | 610 `--rux-*` · 1,112 `.rux--*` |
| Kitchen sink | 31 sections · 443 classes · 0 unresolved |
| Class coverage | **431 / 720 (60%)** — ratcheted in `docs/coverage.json` |
| Markup provenance | **28 `rendered-dom` · 3 `source` · 0 `inferred`** |
| Icons | 58, a 15.8 KB sprite |
| Size | 606 KB raw · 546 KB min · **55.6 KB gzipped** |
| Behaviour JS | 12 modules · 83.5 KB raw, **46% of it comment** · 45 KB of code · **22.7 KB gzipped** |

Before the strip: 75 components, 4 themes, 881 KB min, **87.6 KB gzipped**.

The 44 components not compiled are CUT or DEFER rows in
[`docs/inventory.md`](docs/inventory.md); their fragments live in `sink/deferred/`,
still carrying the provenance the Phase 1 sweep gave them. Restoring one is three
lines: uncomment its `@use` in `src/app.scss`, move the fragment back, add it to
`sink/ORDER`.

## Commands

```bash
npm run verify           # build + assemble sink + class resolution + coverage + provenance
npm run coverage --all   # per-component class coverage, thinnest first
npm run coverage:update  # re-record docs/coverage.json after adding sink markup
npm run ancestry         # wrappers Carbon never omits, with the recorded declines
npm run tags             # class-on-the-wrong-element check, with its KNOWN list
```

| | |
|---|---|
| `npm run build` | `src/app.scss` → `css/rux.css` + `.min.css`, verifies zero `cds` |
| `npm run sink` | assembles `sink/*.html` → `kitchen-sink.html` |
| `npm run icons` | quarries `assets/icons.svg` from `@carbon/icons` |
| `npm run inventory` | per-component classes and size → `docs/inventory.json` |
| `tools/extract/` | quarries Carbon's rendered markup → `docs/carbon-co-classes.json`, `docs/carbon-*-dom.json`, and — via the state recipes in `react-dom.js` — `docs/carbon-react-states.json` (roadmap §4.1.7, §4.1.14) |
| `tools/check-icons.mjs --unused` | the sprite's symbols nothing in the shipped sink references; `--deferred` is the ones `sink/deferred/` would need back |
| `tools/check-provenance.mjs --inferred` | the fragments whose markup was never diffed against a reference (roadmap §4.1.13) |
| `tools/diff-fragment.mjs <name> --omissions` | where a fragment's nesting disagrees with Carbon, and what Carbon renders that it omits |
| `npm run serve` | kitchen sink at `http://localhost:8642` |
| `npm run watch` | rebuild CSS on change |

## Layout

| Path | What |
|---|---|
| `src/app.scss` | **The build manifest — this file is the strip.** Roadmap §4.3 |
| `css/` | Build output; becomes the source at Phase 4 |
| `js/` | **The behaviour layer.** `overlay.js` is the kernel and loads first; the other eleven delegate to it. Roadmap §4.5 |
| `templates/` | **Runnable page skeletons — Phase 6's deliverable.** Each is a COMPLETE page carrying the shell, not a fragment. Roadmap §4.6 |
| `sink/` | One fragment per component, plus `ORDER`, `harness.css`, `harness.js` |
| `kitchen-sink.html` | Generated — do not edit; edit `sink/` and run `npm run sink` |
| `assets/icons.svg` | Generated sprite, committed |
| `tools/` | `build` · `build-sink` · `icons` · `inventory` · `measure` · `check-classes` · `check-tokens` · `check-icons` · `check-compound` · `check-tags` · `check-ancestry` · `check-coverage` · `check-co-classes` · `check-provenance` · `diff-fragment` · `serve` · and two browser-only: `check-a11y.js`, `check-rendered.js` |
| `tools/lib/ownership.mjs` | Which component owns a class, which are compiled, what counts as a class name — shared by the gates so there is one definition |
| `tools/lib/sources.mjs` | Which files a gate reads PER FILE — `sink/*.html` + `templates/*.html`, `sink/deferred/` excluded — so a finding names a file you can edit |
| `docs/roadmap.md` | Canonical plan and decision log |
| `carbon-website/` | Gitignored quarry — Carbon's docs, read from, never shipped |

## The one rule

**No Carbon file is ever edited.** Customization is `$prefix`, Carbon's own config
flags, and which components and themes get compiled — nothing else. That keeps
components working as designed, keeps Carbon's documentation accurate, and makes a
Carbon upgrade a version bump rather than a re-merge. Roadmap §1.1.

One documented exception, enforced on every build: `tools/build.mjs` renames
`--cds-grid-*`, which Carbon hardcodes past `$prefix`. Roadmap §4.1.2.

## Gates

Eleven, because none is sufficient alone — see roadmap §4.1.2 for the bug that proved it.

| Gate | Catches | Blind to |
|---|---|---|
| `build.mjs` namespace check | `cds` leakage into output | anything visual |
| `check-classes.mjs` | a class used in HTML **or `js/`** with no CSS behind it · a class whose component was stripped | a class that resolves but renders wrong |
| `check-tokens.mjs` | a `var(--rux-*)` that resolves to nothing | a token whose *value* moved (roadmap §4.8) |
| `check-icons.mjs` | a `<use>` pointing at a symbol the sprite does not carry · a fragment referencing the sprite externally or a template referencing it bare · a sprite out of step with `icons.mjs` | **which** glyph a `<use>` points at |
| `check-compound.mjs` | two classes Carbon compounds, split across elements | wrong nesting order · missing wrapper |
| `check-tags.mjs` | a class on a different element type than Carbon renders it on | classes no story emits (9 today) |
| `check-ancestry.mjs` | a wrapper Carbon renders in **every** capture, absent here | a wrapper Carbon only sometimes renders |
| `check-coverage.mjs` | a component exercising fewer classes than `docs/coverage.json` records | standing still — it ratchets, it does not set a floor |
| `check-co-classes.mjs` | a modifier used without the base class that styles it | a base class Carbon never pairs |
| `check-provenance.mjs` | a fragment that does not say where its markup came from | whether the label is true |
| `check-rendered.js` | default browser chrome · collapsed · escaped elements | anything it has no rule for |
| `check-a11y.js` | dangling idrefs · composites with many tab stops · unnamed controls · roles missing required state | what a screen reader announces · focus-ring contrast · whether the tab order makes sense |

**`check-ancestry` was written after a defect three gates could not see.** The modal's
close button rendered in the flow under the heading, left-aligned, because the fragment
had no `modal-close-button` — the element carrying the `position: absolute` that pins it
to the corner. `check-tags` asks which *element type* a class sits on; `check-compound`
asks which classes share *one element*; `diff-fragment` says in its own header that it
reports nesting that **disagrees**, not nesting that is **absent**. A wrapper simply not
there was invisible to all three. The new gate intersects the classed ancestors of every
occurrence of a class across all 641 captures and requires what survives — what Carbon
puts above it *without exception*. Its first full run found a second instance of the same
defect, `pagination__control-buttons`, hiding behind a note that named the optional
wrapper and never mentioned the styled one. **15 declines are recorded with reasons; 0
findings remain.**

**Coverage is a ratchet, not a threshold.** `check-coverage` used to report a component
COVERED on a single class hit — `ui-shell` owns 55 classes and one `rux--header` passed
it — so the gate read 31/31 green while 45% of the shipped CSS had never been rendered.
It now measures per-component class coverage against `docs/coverage.json`, which records
what the sink actually achieves (**431/720, 60%**, on 2026-08-28) and fails only when a
component exercises fewer classes than before. A threshold high enough to mean something
would be red today with no action available; a ratchet can only be moved up, and moving
it is deliberate.

The first nine run in `npm run verify`. `check-tags` was promoted from a
diagnostic on 2026-08-27, after all fifty findings of its first full run were
adjudicated; its `KNOWN` list carries the seven recorded divergences, each with
its reason, following `check-tokens`' precedent. **`check-a11y.js` and `check-rendered.js` need a browser** — paste either into the
kitchen sink's devtools console. `check-a11y` is Phase 5's keyboard pass and reports
**0 findings, 5 notes**; the notes are CSS specimens with no trigger, which are not
meant to be operable. It refuses to run its focus-ring check when `document.hasFocus()`
is false, because `:focus` cannot match in an unfocused document and the check would
otherwise report every control on the page. When it does run it suppresses transitions
first: Carbon fades `outline` over 70ms, an automated pane's animation clock never
advances, and reading mid-fade called 49 rings missing that a key press shows are
there. **It is not a screen-reader pass** — that needs a human with an AT, and §4.5
stays open until one is done.

**`check-rendered.js` needs a browser** — paste
it into the kitchen sink's devtools console. It is deliberately not a Node tool, because
automating it means adding a headless-browser dependency and this project has none.

**None of them catches a component that compiles, resolves, and still renders wrong.**
Only looking does. That is why the kitchen sink exists, and why every phase ends by
looking at it — twice now it has been the only thing that found the bug (roadmap §4.1.2,
§4.1.5).

### The sink is interactive — the system is not, yet

`sink/harness.js` is **down to two demo conveniences that were never component
behaviour**: cancelling in-page anchor jumps so a clickable tile does not throw the
reader up the page, and the theme switcher. Everything else has gone. Modal, popover,
tooltip, menu, overflow menu, list box, tabs, accordion, data table, the form controls
and the UI shell all moved to `js/` with real focus management, keyboard support and
ARIA; the blocks driving CUT or DEFERRED components — copy button, content switcher,
tree view, slider, toggletip, combo box, multiselect — were deleted rather than moved,
because driving markup that is not on the page is code nobody can test and nobody will
delete. **390 lines have become 67.** The phase is done when the file is empty. Roadmap §4.1.8.

### Known gap — closed by the strip

`.rux--truncated-text__expand-toggle` had no button reset in Carbon's light-DOM CSS and
rendered with browser default chrome; it was shown unfixed and labelled, because fixing
it meant editing a Carbon file (roadmap §4.1.5). `truncated-text` is CUT in Phase 3, so
`check-rendered` now reports no default chrome anywhere. The gap returns with the
component if it is ever restored, and its fragment still says so.
