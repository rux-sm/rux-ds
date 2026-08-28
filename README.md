# rux-ds

A framework-free CSS/HTML/JS design system, derived from Carbon v11 by subtraction.
Its primary consumer is Claude Code generating consistent pages.

**Start with [`docs/roadmap.md`](docs/roadmap.md)** — the end goal, the decisions on
record, and the phase this project is in.

## Status

**Phase 1 complete — standing baseline.** 100% of Carbon compiles and renders under the
`rux` namespace. All 75 components are exercised by the kitchen sink and each of its 64
sections has been visually reviewed in light and dark. Nothing has been stripped yet;
that is Phase 3.

| | |
|---|---|
| Components | **75 / 75 rendered and verified** |
| Themes | 4 — white, g10, g90, g100 |
| Tokens · classes | 635 `--rux-*` · 826 `.rux--*` |
| Kitchen sink | 64 sections · 567 classes · 0 unresolved |
| Markup provenance | **2 `rendered-dom` · 7 `source` · 55 `inferred`** — see roadmap §4.1.13 |
| Icons | 52, a 14.1 KB sprite |
| Size | 942 KB raw · 849 KB min · **84 KB gzipped** |

## Commands

```bash
npm run verify    # build + assemble sink + class resolution + coverage + provenance
```

| | |
|---|---|
| `npm run build` | `src/app.scss` → `css/rux.css` + `.min.css`, verifies zero `cds` |
| `npm run sink` | assembles `sink/*.html` → `kitchen-sink.html` |
| `npm run icons` | quarries `assets/icons.svg` from `@carbon/icons` |
| `npm run inventory` | per-component classes and size → `docs/inventory.json` |
| `tools/extract/` | quarries Carbon's rendered markup → `docs/carbon-co-classes.json`, `docs/carbon-*-dom.json`, and — via the state recipes in `react-dom.js` — `docs/carbon-react-states.json` (roadmap §4.1.7, §4.1.14) |
| `tools/check-provenance.mjs --inferred` | the fragments whose markup was never diffed against a reference (roadmap §4.1.13) |
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
| `tools/` | `build` · `build-sink` · `icons` · `inventory` · `check-classes` · `check-tokens` · `check-compound` · `check-coverage` · `check-provenance` · `serve` |
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

Eight, because none is sufficient alone — see roadmap §4.1.2 for the bug that proved it.

| Gate | Catches | Blind to |
|---|---|---|
| `build.mjs` namespace check | `cds` leakage into output | anything visual |
| `check-classes.mjs` | a class used in HTML with no CSS behind it | a class that resolves but renders wrong |
| `check-tokens.mjs` | a `var(--rux-*)` that resolves to nothing | a token whose *value* moved (roadmap §4.8) |
| `check-compound.mjs` | two classes Carbon compounds, split across elements | wrong nesting order · missing wrapper · wrong element |
| `check-coverage.mjs` | a component no markup exercises | whether that markup is correct |
| `check-co-classes.mjs` | a modifier used without the base class that styles it | a base class Carbon never pairs |
| `check-provenance.mjs` | a fragment that does not say where its markup came from | whether the label is true |
| `check-rendered.js` | default browser chrome · collapsed · escaped elements | anything it has no rule for |

The first seven run in `npm run verify`. **`check-rendered.js` needs a browser** — paste
it into the kitchen sink's devtools console. It is deliberately not a Node tool, because
automating it means adding a headless-browser dependency and this project has none.

**None of them catches a component that compiles, resolves, and still renders wrong.**
Only looking does. That is why the kitchen sink exists, and why every phase ends by
looking at it — twice now it has been the only thing that found the bug (roadmap §4.1.2,
§4.1.5).

### The sink is interactive — the system is not, yet

`sink/harness.js` drives the demos (accordion, list boxes, popovers, menus, tabs, tree,
copy animation, Escape, outside-press) by toggling the state classes Carbon's CSS already
reacts to. **It is not the design system's behaviour layer** — no focus management, no
keyboard support past Escape, no ARIA lifecycle. Phase 5 writes that. Roadmap §4.1.8.

### Known gap

`.rux--truncated-text__expand-toggle` has no button reset in Carbon's light-DOM CSS, so
it renders with browser default chrome. It is shown unfixed and labelled in the kitchen
sink rather than patched, because fixing it means editing a Carbon file. Roadmap §4.1.5.
