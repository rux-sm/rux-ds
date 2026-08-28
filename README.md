# rux-ds

A framework-free CSS/HTML/JS design system, derived from Carbon v11 by subtraction.
Its primary consumer is Claude Code generating consistent pages.

**Start with [`docs/roadmap.md`](docs/roadmap.md)** — the end goal, the decisions on
record, and the phase this project is in.

## Status

**Phase 3 complete — stripped.** Carbon compiles under the `rux` namespace, every
shipped fragment has been diffed against Carbon's own rendered DOM, and the build is
now the keep-set rather than all of Carbon.

**Phase 5 (behaviors) started** — `js/overlay.js` is the dismiss kernel, with
`js/popover.js` and `js/modal.js` on top of it (20 KB of a 90 KB budget). The markup is
the API: a `.rux--popover-container` is click-driven and the same container with
`.rux--tooltip` is hover-and-focus driven, so neither needs an attribute at all; a modal
takes `data-rux-open="<id>"` and `data-rux-close` only because its trigger and surface sit
far apart in the document — as does a menu, which reuses the same attribute. An overflow
menu needs none: its surface is the sibling of its trigger. Focus trapping, Escape, outside press and the stack that
decides which surface a press belongs to all come from the kernel, so a page needs no
script of its own. `sink/harness.js` still drives what Phase 5
has not reached, and shrinks with every module that lands.

**Phase 4 (devendor) now runs last.** Execution order
is 1 → 2 → 3 → 5 → 6 → 4 → 7 → 8; the phase numbers are names, not positions. Devendoring
closes the component set, and `data-table` shipped unable to sort or expand until the
sink tried to demo it — so the set is frozen after the templates have finished teaching
us what it needs, not before. Roadmap §4.4.

| | |
|---|---|
| Components | **31 / 75 compiled** in 34 modules — `docs/inventory.md` decides all 75 |
| Themes | 2 — white, g100 |
| Tokens · classes | 610 `--rux-*` · 1,112 `.rux--*` |
| Kitchen sink | 31 sections · 424 classes · 0 unresolved |
| Class coverage | **421 / 711 (59%)** — ratcheted in `docs/coverage.json` |
| Markup provenance | **28 `rendered-dom` · 3 `source` · 0 `inferred`** |
| Icons | 58, a 15.8 KB sprite |
| Size | 606 KB raw · 546 KB min · **55.6 KB gzipped** |
| Behaviour JS | 30 KB of a 90 KB budget — `js/overlay.js` · `js/popover.js` · `js/menu.js` · `js/modal.js` |

Before the strip: 75 components, 4 themes, 849 KB min, **84 KB gzipped**.

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
```

| | |
|---|---|
| `npm run build` | `src/app.scss` → `css/rux.css` + `.min.css`, verifies zero `cds` |
| `npm run sink` | assembles `sink/*.html` → `kitchen-sink.html` |
| `npm run icons` | quarries `assets/icons.svg` from `@carbon/icons` |
| `npm run inventory` | per-component classes and size → `docs/inventory.json` |
| `tools/extract/` | quarries Carbon's rendered markup → `docs/carbon-co-classes.json`, `docs/carbon-*-dom.json`, and — via the state recipes in `react-dom.js` — `docs/carbon-react-states.json` (roadmap §4.1.7, §4.1.14) |
| `tools/check-provenance.mjs --inferred` | the fragments whose markup was never diffed against a reference (roadmap §4.1.13) |
| `tools/diff-fragment.mjs <name> --omissions` | where a fragment's nesting disagrees with Carbon, and what Carbon renders that it omits |
| `npm run serve` | kitchen sink at `http://localhost:8642` |
| `npm run watch` | rebuild CSS on change |

## Layout

| Path | What |
|---|---|
| `src/app.scss` | **The build manifest — this file is the strip.** Roadmap §4.3 |
| `css/` | Build output; becomes the source at Phase 4 |
| `sink/` | One fragment per component, plus `ORDER`, `harness.css`, `harness.js` |
| `kitchen-sink.html` | Generated — do not edit; edit `sink/` and run `npm run sink` |
| `assets/icons.svg` | Generated sprite, committed |
| `tools/` | `build` · `build-sink` · `icons` · `inventory` · `check-classes` · `check-tokens` · `check-compound` · `check-tags` · `check-coverage` · `check-co-classes` · `check-provenance` · `diff-fragment` · `serve` |
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

Ten, because none is sufficient alone — see roadmap §4.1.2 for the bug that proved it.

| Gate | Catches | Blind to |
|---|---|---|
| `build.mjs` namespace check | `cds` leakage into output | anything visual |
| `check-classes.mjs` | a class used in HTML **or `js/`** with no CSS behind it · a class whose component was stripped | a class that resolves but renders wrong |
| `check-tokens.mjs` | a `var(--rux-*)` that resolves to nothing | a token whose *value* moved (roadmap §4.8) |
| `check-compound.mjs` | two classes Carbon compounds, split across elements | wrong nesting order · missing wrapper |
| `check-tags.mjs` | a class on a different element type than Carbon renders it on | classes no story emits (9 today) |
| `check-ancestry.mjs` | a wrapper Carbon renders in **every** capture, absent here | a wrapper Carbon only sometimes renders |
| `check-coverage.mjs` | a component exercising fewer classes than `docs/coverage.json` records | standing still — it ratchets, it does not set a floor |
| `check-co-classes.mjs` | a modifier used without the base class that styles it | a base class Carbon never pairs |
| `check-provenance.mjs` | a fragment that does not say where its markup came from | whether the label is true |
| `check-rendered.js` | default browser chrome · collapsed · escaped elements | anything it has no rule for |

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
what the sink actually achieves (**370/669, 55%**, on 2026-08-28) and fails only when a
component exercises fewer classes than before. A threshold high enough to mean something
would be red today with no action available; a ratchet can only be moved up, and moving
it is deliberate.

The first eight run in `npm run verify`. `check-tags` was promoted from a
diagnostic on 2026-08-27, after all fifty findings of its first full run were
adjudicated; its `KNOWN` list carries the seven recorded divergences, each with
its reason, following `check-tokens`' precedent. **`check-rendered.js` needs a browser** — paste
it into the kitchen sink's devtools console. It is deliberately not a Node tool, because
automating it means adding a headless-browser dependency and this project has none.

**None of them catches a component that compiles, resolves, and still renders wrong.**
Only looking does. That is why the kitchen sink exists, and why every phase ends by
looking at it — twice now it has been the only thing that found the bug (roadmap §4.1.2,
§4.1.5).

### The sink is interactive — the system is not, yet

`sink/harness.js` drives what Phase 5 has not reached yet — list boxes, tabs, tree, copy
animation, search clear — by toggling the state classes Carbon's CSS already reacts to.
**It is not the design system's behaviour layer**, and it is shrinking: modal, popover,
tooltip, menu and overflow menu have moved to `js/`, taking their sections with them, and
390 lines have become 336. The phase is done when the file is empty. Roadmap §4.1.8.

### Known gap — closed by the strip

`.rux--truncated-text__expand-toggle` had no button reset in Carbon's light-DOM CSS and
rendered with browser default chrome; it was shown unfixed and labelled, because fixing
it meant editing a Carbon file (roadmap §4.1.5). `truncated-text` is CUT in Phase 3, so
`check-rendered` now reports no default chrome anywhere. The gap returns with the
component if it is ever restored, and its fragment still says so.
