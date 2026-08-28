# Phase 2 — Inventory

Every one of Carbon's 75 components, with what it costs, what it drags in, and a
disposition. Roadmap §4.2 asks for exactly this and calls the exit "75 rows, every row
decided."

**This is a decision document, not a generated one.** It was seeded from
`docs/inventory.json` and `tools/measure.mjs` on 2026-08-28, and is maintained by
hand from here. Regenerating it would overwrite the decisions, which are the point.

---

## What a component actually costs

Per-component sizes cannot be added up. Roadmap §2 measured the sum at 3,534 KB against a
real 837 KB bundle — a 4.2× overcount — because every component drags its transitive
`@use` graph and those graphs overlap. `tools/measure.mjs` exists to price a real subset
by compiling it. Measured 2026-08-28:

| Configuration | Minified | **Gzipped** | Classes |
|---|---|---|---|
| Foundation only (reset, type, grid, layout, tokens) — 1 theme | 51 KB | **6.6 KB** | — |
| Foundation only — 2 themes | 71 KB | **7.9 KB** | — |
| Lean — 22 components, 2 themes | 375 KB | **~39 KB** | see note |
| **Shipped — 31 components / 34 modules, 2 themes** | 546 KB | **55.6 KB** | 1,112 |
| Shipped set — 4 themes | 590 KB | **56.4 KB** | 1,112 |
| Full Carbon — 75 components / 79 modules, 4 themes | 881 KB | **87.6 KB** | 1,644 |

> **A COMPONENT CAN BE SEVERAL MODULES, and this table now counts both.** Carbon
> splits `data-table` into a base plus `sort`, `expandable` and `action`, and
> `@use`s them separately in its own `components/_index.scss`. The manifest took
> the base alone, so the shipped table could not sort, expand or batch-select —
> `table-sort` and `table-expand__button` had no rules at all, and `table-sort`
> passed check-classes only because it survives inside AI-qualified selectors.
> The sink found it by trying to demo sorting. All three were admitted on
> 2026-08-28 under roadmap §2.1's admission rule at **+26 KB minified / +2.9 KB
> gzipped**; `data-table/skeleton` was not, because skeleton-styles already
> ships the loading treatment. The full-Carbon baseline moved for the same
> reason — `tools/measure.mjs` was reading a directory listing, which cannot see
> a sub-module, and now reads Carbon's own `_index.scss`.
>
> **The gzipped column was re-measured 2026-08-28, after the Classes recount below.**
> `tools/measure.mjs` took the first N of `['white','g10','g90','g100']`, so every
> 2-theme figure priced **white + g10** — while `src/app.scss` has shipped **white +
> g100** since Phase 3 pass 3 chose "the furthest point from" white. g10 is a
> near-neighbour of white and compresses against it far better, so these rows ran
> ~1.3 KB optimistic for the configuration that actually ships. The tool now reads the
> pair from the manifest and its output matches `css/rux.min.css` byte for byte.
> **The shipped floor is 52.7 KB gzipped, not 51.** Figures now carry one decimal:
> integer KB straddling a boundary made a 1.3 KB difference read as 2 KB.
>
> The Lean-22 row is `~39 KB` and `see note` because that row's component list was
> never recorded and cannot be recompiled; its gzip figure is the old measurement plus
> the correction, not a re-run.

> **The Classes column was recounted 2026-08-28.** It had been produced by a pattern
> that admitted a bare `:`, so `.rux--btn--xs:hover` counted as a class distinct from
> `.rux--btn--xs` and every pseudo-class inflated the total — 1,609 for a set that has
> 1,079, and 2,475 for one that has 1,611. Two other tools counted differently again
> (534 and 824, each wrong in its own way). The pattern now lives once, in
> `tools/lib/ownership.mjs`, and all three agree. **Sizes are unaffected** — only the
> count was wrong. The Lean-22 row reads `see note` because that row's component list
> was never recorded and cannot be recompiled.

Two findings fall out, and both change decisions.

**A theme is free on the wire.** The foundation costs 51 KB minified with one theme and
71 KB with two — and **7 KB gzipped either way**. Across the whole proposed set, going
from four themes to two saves 44 KB minified and 2 KB gzipped. A theme is the same ~600
token names with different values, so it compresses almost entirely against the first one.
**The 4 → 2 theme cut should be justified on scope and testing surface, not on size**, and
§4.3 currently lists it as a strip pass alongside components as though the two were
comparable. They are not.

**§2.1's ≤40 KB target was not reachable by a set that covers the target page shapes.**
22 components hit ~39 KB — and that set has no `ui-shell` and no `data-table`, so it
cannot build the app shell or the table page that Phase 6 exists to produce. Adding those
two plus `tabs` and `pagination` reaches ~48 KB; the shipped set is 52.7 KB. This finding
is what first put the target in question; §2.1 has since removed it entirely, for the
stronger reason recorded below.

> **Superseded 2026-08-28. This section recommended amending §2.1's target to ≤55 KB
> gzipped; §2.1 now has no KB target at all, and the reason is in this table.** The
> recommendation was sound against 40 and arbitrary in itself — 55 was the measured
> floor rounded up to the next multiple of five, and that floor was 1.3 KB understated.
> More decisively, **not one of the 44 CUT and DEFER rows below was decided on CSS
> bytes.** They were decided on overlap with something already shipping, on whether a
> named page shape needs the component, and on Phase 1 provenance. The nine rows that
> mention size mostly use it to argue something is *cheap enough to add back*; the one
> genuine cost cut, `toggletip`, was wrong by two orders of magnitude. A number that
> decided nothing, and had to be amended each time it was tested, was never the
> constraint. §2.1 now states the admission rule that was actually operating, and keeps
> the byte count as a reported measurement with a wide tripwire.

---

## The dependency core

Twelve components are depended on by others, so they are kept by structure rather than by
choice. `button` pulls `tooltip`, which pulls `popover`, which is why those three top the
list — anything interactive drags all three.

| Component | Needed by | Note |
|---|---|---|
| `popover` | 37 | kept |
| `tooltip` | 36 | kept |
| `button` | 35 | kept |
| `form` | 28 | kept |
| `text-input` | 13 | kept |
| `tag` | 7 | kept |
| `list-box` | 6 | kept |
| `select` | 4 | kept |
| `checkbox` | 3 | kept |
| `dropdown` | 3 | kept |
| `fluid-list-box` | 3 | cut — check its dependents go too |

A cut only reclaims weight when **everything** above a component goes with it. The
`fluid-*` family is the clean case: 11 components that nothing outside the family needs,
so cutting them as one decision reclaims all of it.

---

## The 75

Sorted KEEP, then DEFER, then CUT, each by size. "Needed by" counts other components that
`@use` it transitively.

| Component | Disposition | KB | Classes | Needed by | Reason |
|---|---|---|---|---|---|
| `ui-shell` | **KEEP** | 113 | 253 | 0 | the app shell shape; no substitute in the set |
| `notification` | **KEEP** | 108 | 240 | 0 | error and empty states |
| `pagination` | **KEEP** | 99 | 275 | 0 | table page |
| `dropdown` | **KEEP** | 93 | 281 | 3 | form page and table filters |
| `breadcrumb` | **KEEP** | 87 | 238 | 0 | detail page |
| `modal` | **KEEP** | 82 | 236 | 0 | the one overlay shape kept; dialog and side-panel defer to it |
| `list-box` | **KEEP** | 81 | 241 | 6 | forced by dropdown |
| `overflow-menu` | **KEEP** | 78 | 203 | 2 | row actions in the table page |
| `tabs` | **KEEP** | 76 | 186 | 0 | detail page |
| `button` | **KEEP** | 69 | 164 | 35 | every interactive shape needs it; 35 components depend on it |
| `data-table` | **KEEP** | 59 | 210 | 0 | the table page shape · **four modules, all four admitted 2026-08-28** |
| `tooltip` | **KEEP** | 50 | 89 | 36 | forced — 36 dependents, and button pulls it |
| `popover` | **KEEP** | 48 | 81 | 37 | forced — 37 dependents; the positioning primitive under tooltip and menu |
| `search` | **KEEP** | 43 | 155 | 1 | table page |
| `text-input` | **KEEP** | 34 | 120 | 13 | form page; 13 dependents |
| `number-input` | **KEEP** | 31 | 97 | 1 | form page |
| `checkbox` | **KEEP** | 25 | 97 | 3 | form page; data-table selection depends on it |
| `select` | **KEEP** | 24 | 92 | 4 | form page; 4 dependents |
| `radio-button` | **KEEP** | 22 | 88 | 1 | form page; data-table selection depends on it |
| `tile` | **KEEP** | 21 | 64 | 0 | detail page and dashboards |
| `text-area` | **KEEP** | 20 | 81 | 1 | form page |
| `tag` | **KEEP** | 19 | 61 | 7 | status column in the table page; 7 dependents |
| `form` | **KEEP** | 14 | 52 | 28 | forced — 28 dependents; the form page is a target shape |
| `accordion` | **KEEP** | 12 | 39 | 0 | detail page |
| `inline-loading` | **KEEP** | 8 | 21 | 0 | in-place pending state for form submits |
| `menu` | **KEEP** | 8 | 31 | 2 | row and overflow actions |
| `toggle` | **KEEP** | 7 | 27 | 0 | form page |
| `loading` | **KEEP** | 6 | 12 | 2 | loading states; inline-loading depends on it |
| `skeleton-styles` | **KEEP** | 4 | 22 | 0 | loading states, 4 KB |
| `link` | **KEEP** | 4 | 17 | 1 | unavoidable, 4 KB |
| `list` | **KEEP** | 2 | 9 | 0 | unavoidable, 2 KB |
| `multiselect` | **DEFER** | 97 | 291 | 1 | add with combo-box or not at all |
| `file-uploader` | **DEFER** | 91 | 258 | 0 | add when a form template needs uploads |
| `combo-box` | **DEFER** | 83 | 249 | 0 | filterable dropdown; add if a template needs type-ahead |
| `progress-indicator` | **DEFER** | 76 | 196 | 0 | multi-step wizard; no target shape has one |
| `toggletip` | **DEFER** | 71 | 173 | 2 | tooltip covers the common case; **+0.3 KB gzipped marginal**, not 71 |
| `time-picker` | **DEFER** | 47 | 167 | 0 | pairs with date-picker; same decision |
| `slider` | **DEFER** | 45 | 176 | 0 | no target shape needs it yet |
| `date-picker` | **DEFER** | 43 | 120 | 1 | needs flatpickr reproduced in Phase 5 — real cost, decide then |
| `treeview` | **DEFER** | 20 | 86 | 0 | no target shape needs it yet |
| `progress-bar` | **DEFER** | 8 | 21 | 0 | 8 KB; cheap to add back when something reports progress |
| `icon-indicator` | **DEFER** | 3 | 18 | 1 | status vocabulary; tag covers most of it |
| `action-set` | **DEFER** | 2 | 19 | 0 | 2 KB; modal footers may want it in Phase 6 |
| `shape-indicator` | **DEFER** | 2 | 17 | 0 | status vocabulary; tag covers most of it |
| `aspect-ratio` | **DEFER** | 1 | 12 | 0 | 1 KB layout primitive; Phase 6 may want it |
| `stack` | **DEFER** | 1 | 15 | 0 | 1 KB layout primitive; Phase 6 may want it |
| `badge-indicator` | **DEFER** | 1 | 2 | 0 | 1 KB; pairs with a notification affordance in the shell |
| `fluid-multiselect` | **CUT** | 124 | 362 | 0 | fluid-* family; 124 KB alone, the largest single component |
| `fluid-combo-box` | **CUT** | 107 | 307 | 1 | fluid-* family: a duplicate input treatment (§4.2) |
| `fluid-dropdown` | **CUT** | 107 | 307 | 0 | fluid-* family |
| `ai-label` | **CUT** | 99 | 242 | 0 | AI affordance — one decision with slug and chat-button (§4.2) |
| `slug` | **CUT** | 99 | 242 | 1 | superseded by ai-label; nothing in 641 captures emits it |
| `content-switcher` | **CUT** | 93 | 220 | 0 | overlaps tabs |
| `code-snippet` | **CUT** | 86 | 211 | 0 | documentation component, not an application one |
| `contained-list` | **CUT** | 86 | 232 | 0 | overlaps list and data-table |
| `dialog` | **CUT** | 76 | 185 | 0 | overlaps modal; both are the same shape |
| `pagination-nav` | **CUT** | 74 | 188 | 0 | a second pagination form; one is enough |
| `combo-button` | **CUT** | 74 | 201 | 0 | button + menu composition |
| `menu-button` | **CUT** | 73 | 195 | 0 | button + menu composition |
| `copy-button` | **CUT** | 72 | 177 | 1 | only exists to serve code-snippet |
| `chat-button` | **CUT** | 70 | 174 | 0 | AI affordance |
| `fluid-time-picker` | **CUT** | 60 | 182 | 0 | fluid-* family |
| `fluid-date-picker` | **CUT** | 54 | 139 | 0 | fluid-* family |
| `fluid-search` | **CUT** | 45 | 163 | 0 | fluid-* family |
| `fluid-number-input` | **CUT** | 43 | 113 | 0 | fluid-* family |
| `fluid-text-input` | **CUT** | 40 | 126 | 1 | fluid-* family |
| `fluid-select` | **CUT** | 29 | 101 | 1 | fluid-* family |
| `fluid-text-area` | **CUT** | 26 | 94 | 0 | fluid-* family |
| `side-panel` | **CUT** | 19 | 86 | 0 | ibm-products; modal covers the overlay need |
| `fluid-list-box` | **CUT** | 14 | 62 | 3 | fluid-* family |
| `structured-list` | **CUT** | 11 | 31 | 0 | overlaps data-table |
| `card` | **CUT** | 9 | 56 | 0 | Carbon has no Card — it is an ibm-products preview (§4.1.14) |
| `page-header` | **CUT** | 4 | 32 | 0 | deprecated upstream; an ibm-products component, not @carbon/react |
| `resizer` | **CUT** | 1 | 11 | 0 | no reference on either Storybook origin; 1 KB, niche |
| `truncated-text` | **CUT** | 1 | 5 | 0 | no reference, and its expand toggle has an unfixable button-reset gap (§4.1.5) |

**31 KEEP · 16 DEFER · 28 CUT** — 75 rows, every row decided.

---

## What needs your call

These are judgement, not evidence, and I have proposed rather than decided. **They are
also no longer urgent:** Phase 4 moved to the end of the sequence on 2026-08-28, so a
DEFER row that says "decide in Phase 5" or "decide in Phase 6" can now actually be
decided there, with a template in front of you, instead of being frozen by a devendor
that used to run first. Roadmap §4.4.
A fourth — the ≤40 KB target — is **settled**: §2.1 removed the KB target on 2026-08-28
rather than amending it to ≤55 KB as this document originally recommended. The measured
floor for a set that builds all six page shapes is 52.7 KB, and the reason the number
went rather than moved is recorded in §2.1 and above.

1. **`date-picker` / `time-picker` — DEFER.** Both need a calendar reproduced in vanilla
   JS in Phase 5, which is the single largest behaviour cost in the catalogue. Keeping
   them is defensible; it should be a conscious purchase.
2. **`combo-box` / `multiselect` — DEFER.** Type-ahead and multi-select are common in
   real forms. They are out because no target shape names them, not because they are bad
   — and the KB column overstates them the same way: **together they add 7 KB minified /
   0.8 KB gzipped**, since both are built from `list-box`, `text-input`, `checkbox` and
   `tag`, all of which already ship. For scale, the seven sub-8 KB DEFER rows together
   add 14 KB minified / 1.9 KB gzipped.
3. **`toggletip` — DEFER, but NOT on cost.** This entry read "out on cost at 71 KB",
   which is this document's own warning ignored two sections above where it is written:
   71 KB is the standalone-with-dependencies figure, and toggletip shares popover,
   button and tooltip with the keep-set. **Measured marginal cost is 3 KB minified /
   0.3 KB gzipped.** Defer it because nothing needs it yet — the price is not the
   reason. Corrected 2026-08-28, re-measured against the shipped themes.

Rows marked CUT with an evidence reason — `slug`, `resizer`, `truncated-text`, `card`,
`page-header`, `side-panel` — came out of the Phase 1 markup sweep and are not judgement
calls: nothing in the 641 captured stories emits them, or they belong to
`@carbon/ibm-products` rather than Carbon proper.

---

## Reproducing the numbers

```bash
npm run inventory                 # per-component size, classes, @use graph, tokens
node tools/measure.mjs            # full vs proposed set, gzipped
node tools/measure.mjs --themes 1 button form popover tooltip   # any ad-hoc set
```
