# Phase 2 — Inventory

Every one of Carbon's components, with what it costs, what it drags in, and a
disposition. Roadmap §4.2 asks for exactly this and calls the exit "75 rows, every row
decided." **There were 75 when that was written; Carbon 1.114 ships 83.** The eight new
ones have rows as of 2026-08-31 but seven are still undecided, so the exit is not met —
see "The eight that arrived with Carbon 1.114".

**This is a decision document, not a generated one.** It was seeded from
`docs/inventory.json` and `tools/measure.mjs` on 2026-08-28, and is maintained by
hand from here. Regenerating it would overwrite the decisions, which are the point.

---

## What a component actually costs

Per-component sizes cannot be added up. Roadmap §2 measured the sum at 3,534 KB against a
real 837 KB bundle — a 4.2× overcount — because every component drags its transitive
`@use` graph and those graphs overlap. `tools/measure.mjs` exists to price a real subset
by compiling it. **Shipped and Full Carbon re-measured 2026-08-31**; the Foundation and
Lean rows still read 2026-08-28 and are understated — see the third note below.

| Configuration | Minified | **Gzipped** | Classes |
|---|---|---|---|
| Foundation only (reset, type, grid, layout, tokens) — 1 theme | 51 KB | **6.6 KB** | — |
| Foundation only — 2 themes | 71 KB | **7.9 KB** | — |
| Lean — 22 components, 2 themes | 375 KB | **~39 KB** | see note |
| **Shipped — 36 components / 39 modules, 2 themes** | 586 KB | **59.4 KB** | 1,237 |
| Shipped set — 4 themes | 631 KB | **60.2 KB** | 1,237 |
| Full Carbon — 83 components / 87 modules, 4 themes | 939 KB | **94.0 KB** | 1,862 |

> **THE SHIPPED ROW WAS UNDERSTATED, and the tool was the reason.** It read 548 KB /
> 56.3 KB / 1,128 classes against a real 582 KB / 1,225. `measure.mjs` built its
> synthetic stylesheet from a HARDCODED include list — `reset.reset` and
> `type.default-type` — and `src/app.scss` admitted `type.type-classes` at `4beac65`.
> The tool went on pricing a configuration this project does not ship, and the note
> below claiming its output "matches `css/rux.min.css` byte for byte" was false from
> that commit until 2026-08-31. A hardcoded include list is the same second copy the
> theme pair was, and failed the same way; it is now read from the manifest, and the
> shipped row matches the built artifact to the 599-byte attribution banner
> (59.4 KB here, 59.7 KB with the banner `build.mjs` prepends; the figures in this
> table were re-measured 2026-08-31 after `toggletip` and `time-picker` were admitted,
> and the relationship still holds).
>
> One symptom is worth naming because it was visible in this table all along: the
> 4-theme row read **1,112 classes against the 2-theme row's 1,128**. Themes cannot
> remove classes. Both read 1,225 once that was fixed, and 1,237 since `toggletip`
> and `time-picker` were admitted — the point is that they AGREE, not the figure.
>
> **CARBON 1.114 SHIPS 83 COMPONENTS, NOT 75, and eight of them have no row here.**
> `big-number`, `coachmark`, `EditInPlace`, `FullPageError`, `InterstitialScreen`,
> `OptionsTile`, `scroll-gradient` and `user-avatar` — names this project first met in
> the `ibm-products` captures, now absorbed into `@carbon/styles` itself. So the full
> baseline moved for TWO reasons at once, 881 → 939 KB: eight new components, and the
> type utilities the tool had been omitting. **This document's own exit criterion — "75
> rows, every row decided" — is no longer met at 83.** Those eight are undecided, and
> deciding them is not a measurement; nobody has made that call. Roadmap §4.2.
>
> **The Foundation and Lean rows were NOT re-measured.** Foundation has no mode in
> `measure.mjs` — the tool prices full, shipped, or an ad-hoc component list, and a
> zero-component set is none of those — so re-running it would have meant hand-rolling
> a second copy of the build path to measure the cost of a copy-drift bug, which is the
> joke telling itself. Both Foundation rows predate `type.type-classes` and are
> understated by roughly its cost. The Lean-22 row cannot be recompiled at all, for the
> reason already recorded below.

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
> pair from the manifest. Its output matched `css/rux.min.css` byte for byte when this
> was written and stopped doing so at `4beac65` — see the correction above the table.
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
| `multiselect` | **DEFER** | 97 | 291 | 1 | add with combo-box or not at all — **measured +0.6 KB gzipped** |
| `file-uploader` | **DEFER** | 91 | 258 | 0 | add when a form template needs uploads — **measured +1.1 KB gzipped** |
| `combo-box` | **DEFER** | 83 | 249 | 0 | filterable dropdown; add if a template needs type-ahead — **measured +0.2 KB gzipped** |
| `progress-indicator` | **KEEP** | 76 | 196 | 0 | **ADMITTED 2026-08-29, reversing its own DEFER.** The deferral read "multi-step wizard; no target shape has one"; §4.6's seventh exit attempt built that shape, so the stated condition was met. **Measured +0.9 KB gzipped** (58.0 → 58.9), against the 1.1 KB the deferral estimated. All five status icons were already in the sprite and three capture stories carry the markup, so the rest of the price was paid. IBM's guidance is explicit that the hand-composed substitute was the wrong component — `composing-pages.md` §3.10 and §3.11 are both consequences of it |
| `toggletip` | **KEEP** | 71 | 173 | 2 | **ADMITTED 2026-08-31, with the picker work.** +0.2 KB gzipped and 3 classes measured against the shipped set: a toggletip is a `popover-container` plus `toggletip`, `toggletip-button` and `toggletip-content`. **No behaviour to write** — `js/popover.js` already claims `.rux--popover-container` on click and keeps `aria-expanded` in step, which is what a toggletip is. 46 stories reference it. Admitted WITH the pickers rather than on its own cheapness, which §2.1 is explicit has never decided anything here |
| `time-picker` | **KEEP** | 47 | 167 | 0 | **ADMITTED 2026-08-31. It does NOT pair with date-picker, and this row said it did.** Measured separately: +0.4 KB gzipped and 9 classes, against date-picker's +3.4 KB and 41. Its whole markup is `time-picker__input-field` over `text-input` plus two NATIVE `<select>`s, both already compiled, so there is **no calendar, no popover, no keyboard model and no module to write**. Bundling the two hid that for three revisions |
| `slider` | **DEFER** | 45 | 176 | 0 | no target shape needs it yet — **measured +1.4 KB gzipped** |
| `date-picker` | **KEEP** | 43 | 120 | 1 | **ADMITTED 2026-08-31, under rule 1** — `templates/schedule-page.html` is the named page shape, and it shipped with a plain text input standing in for this. **Measured +3.4 KB gzipped and 41 classes.** **THE ADMISSION TURNED ON WHICH OF CARBON'S TWO DATE PICKERS THIS IS.** The CLASSIC one (`components-datepicker--*`) renders its calendar through FLATPICKR: measured 2026-08-31, the open calendar matches 4 rules via `flatpickr-*` selectors and ZERO via `cds--`, so `cds--date-picker__calendar` is a marker that styles nothing and rebuilding it would mean shipping flatpickr, which §1 declines. The **`--next`** variant (`preview-preview-datepicker--*`) renders ZERO flatpickr elements, days as real `<button type=button>`, calendar as `role=grid`, and all 64 calendar rules key on Carbon's own classes. That is what ships. **The committed capture could not have told you this** — `react-dom.js` filters classes to the `cds--` prefix, so the classic capture records clean Carbon markup with its dependency invisible. Two recipes were added and the `--next` stories captured with the calendar OPEN (`preview-preview-datepicker--*-with-calendar@open`), which also fixed two real `check-tags` faults waiting to happen: `__day` was attested only on `span` and `__weekday` only on `span`, where `--next` renders `button` and `div`. `js/date-picker.js` is the 13th module; `sink/date-picker.html` demos simple, single and range at 47%. **The day STATE classes are unprefixed** — `selected`, `today`, `inRange`, `prevMonthDay`, `nextMonthDay`, `disabled`, `focused` — so no capture records them and no gate can check them; they were read off `css/rux.css` and confirmed live |
| `treeview` | **DEFER** | 20 | 86 | 0 | no target shape needs it yet — **measured +0.7 KB gzipped** |
| `progress-bar` | **DEFER** | 8 | 21 | 0 | 8 KB; cheap to add back when something reports progress — **measured +0.6 KB gzipped** |
| `icon-indicator` | **DEFER** | 3 | 18 | 1 | status vocabulary; tag covers most of it — **measured +0.4 KB gzipped** |
| `action-set` | **DEFER** | 2 | 19 | 0 | 2 KB; modal footers may want it in Phase 6 — **measured +0.3 KB gzipped** |
| `shape-indicator` | **DEFER** | 2 | 17 | 0 | status vocabulary; tag covers most of it — **measured +0.3 KB gzipped** |
| `aspect-ratio` | **DEFER** | 1 | 12 | 0 | 1 KB layout primitive; Phase 6 may want it — **measured +0.1 KB gzipped** |
| `stack` | **KEEP** | 1 | 15 | 1 | restored 2026-08-28 — two templates had no vertical rhythm without it. Item 4 |
| `badge-indicator` | **KEEP** | 1 | 2 | 0 | restored 2026-08-29 — the shell ships a Notifications button and the system could not express an unread count at all. **Measured +0.1 KB gzipped / 2 classes**, both exercised. Carbon renders it only as the last child of an icon-only button, which supplies its containing block |
| `fluid-multiselect` | **CUT** | 124 | 362 | 0 | **HELD BY ITS BASE, not by cost, 2026-08-31.** The other nine fluid partials were admitted; this one needs `multiselect`, which is DEFER. Shipping it would put rules in the stylesheet whose markup cannot legally be written — `check-classes` reports STRIPPED on any class whose component is not compiled. The `fluid-list-box` row already said to check the dependents; this is that check. **Admit `multiselect` and this row goes with it** |
| `fluid-combo-box` | **CUT** | 107 | 307 | 1 | **HELD BY ITS BASE, not by cost, 2026-08-31.** The other nine fluid partials were admitted; this one needs `combo-box`, which is DEFER. Shipping it would put rules in the stylesheet whose markup cannot legally be written — `check-classes` reports STRIPPED on any class whose component is not compiled. The `fluid-list-box` row already said to check the dependents; this is that check. **Admit `combo-box` and this row goes with it** |
| `fluid-dropdown` | **KEEP** | 107 | 307 | 0 | **ADMITTED 2026-08-31 with the fluid family.** Fluid is a STYLE, not a component — the label moves inside the field and an `<hr>` divider goes under it; IBM's guidance pairs it with the default style rather than replacing it. One height, 64px, so there are no size variants to demo. Nine of the eleven partials were taken at a **measured +5.04 KB gzipped for the nine**; **compiled and NOT demoed, on purpose**: its fluid form is the whole default markup plus the fluid wrapper, so a specimen would be a second copy of a section this sink already carries. Coverage reads 0%% and the ratchet can only move up |
| `ai-label` | **CUT** | 99 | 242 | 0 | AI affordance — one decision with slug and chat-button (§4.2) |
| `slug` | **CUT** | 99 | 242 | 1 | superseded by ai-label; nothing in 667 captures emits it |
| `content-switcher` | **CUT** | 93 | 220 | 0 | overlaps tabs — **CONFIRMED BY SUBSTITUTION**: the §4.6 exit attempts reached for it twice and contained tabs served both times, correctly. Measured +1.7 KB gzipped, not 93; cost was never the reason and is not now |
| `code-snippet` | **CUT** | 86 | 211 | 0 | documentation component, not an application one |
| `contained-list` | **CUT** | 86 | 232 | 0 | overlaps list and data-table |
| `dialog` | **CUT** | 76 | 185 | 0 | overlaps modal; both are the same shape |
| `pagination-nav` | **CUT** | 74 | 188 | 0 | a second pagination form; one is enough |
| `combo-button` | **KEEP** | 74 | 201 | 0 | **ADMITTED 2026-08-31.** A primary action and a menu trigger in one container. **Measured +0.12 KB gzipped, the cheapest admission this document records** — the menu, the button and the popover chrome it composes are all already compiled, so the partial adds only the container, the seam and the trigger. **No module written**: the menu is PORTALED in Carbon's capture, so trigger and surface are too far apart for the markup to relate them, which is exactly the `data-rux-open` case, and `js/menu.js` already claims any such trigger. Two lines went into `menu.js` so the container gets `--open` and the chevron rotates, the same shape as the `overflow-menu--open` it already sets. **Two attested classes are NOT written**, both §4.1.12: `btn--lg` has no rule at all — Carbon's button sizes stop at `--md` and large comes from `layout--size-lg` — and `combo-button__bottom` appears nowhere in the SCSS. `sink/combo-button.html` at 60%; the four unexercised classes are `__top`, `__top-start`, `__top-end` and the sm/md container sizes' open state |
| `menu-button` | **CUT** | 73 | 195 | 0 | button + menu composition |
| `copy-button` | **KEEP** | 72 | 177 | 1 | **ADMITTED 2026-08-31.** The old reason — "only exists to serve code-snippet" — reads the v10 component; the current one is a standalone icon button and `code-snippet` stays CUT. **Measured +0.44 KB gzipped**, 14th js module. **THE FEEDBACK IS THE TOOLTIP, NOT `copy-btn__feedback`.** That class has rules in @carbon/styles and appears in **ZERO captures** — it is the v10 bubble left in the stylesheet. Carbon's `@copied` state adds exactly `copy-btn--animating` and `copy-btn--fade-in` to the button and changes nothing else; the word appears because React swaps the TOOLTIP's text. **So this is the one fragment that KEEPS the icon-tooltip chrome the sink declines everywhere else** — the standing call is that a tooltip is the story's hover HINT, and here it is the component's only output. `snippet__icon` is dropped (belongs to the cut `code-snippet`, would report STRIPPED) and `popover--auto-align` with it (js/overlay.js ships no positioning engine). `sink/copy-button.html` at **33%**, and the four unexercised classes are honest: three are the animation states the module sets on INTERACTION, which no load-time gate can see, and the fourth is the unattested `__feedback` |
| `chat-button` | **CUT** | 70 | 174 | 0 | AI affordance |
| `fluid-time-picker` | **KEEP** | 60 | 182 | 0 | **ADMITTED 2026-08-31 with the fluid family.** Fluid is a STYLE, not a component — the label moves inside the field and an `<hr>` divider goes under it; IBM's guidance pairs it with the default style rather than replacing it. One height, 64px, so there are no size variants to demo. Nine of the eleven partials were taken at a **measured +5.04 KB gzipped for the nine**; **compiled and NOT demoed, on purpose**: its fluid form is the whole default markup plus the fluid wrapper, so a specimen would be a second copy of a section this sink already carries. Coverage reads 0%% and the ratchet can only move up |
| `fluid-date-picker` | **KEEP** | 54 | 139 | 0 | **ADMITTED 2026-08-31 with the fluid family.** Fluid is a STYLE, not a component — the label moves inside the field and an `<hr>` divider goes under it; IBM's guidance pairs it with the default style rather than replacing it. One height, 64px, so there are no size variants to demo. Nine of the eleven partials were taken at a **measured +5.04 KB gzipped for the nine**; **compiled and NOT demoed, on purpose**: its fluid form is the whole default markup plus the fluid wrapper, so a specimen would be a second copy of a section this sink already carries. Coverage reads 0%% and the ratchet can only move up |
| `fluid-search` | **KEEP** | 45 | 163 | 0 | **ADMITTED 2026-08-31 with the fluid family.** Fluid is a STYLE, not a component — the label moves inside the field and an `<hr>` divider goes under it; IBM's guidance pairs it with the default style rather than replacing it. One height, 64px, so there are no size variants to demo. Nine of the eleven partials were taken at a **measured +5.04 KB gzipped for the nine**; demoed in `sink/fluid.html` at 100% |
| `fluid-number-input` | **KEEP** | 43 | 113 | 0 | **ADMITTED 2026-08-31 with the fluid family.** Fluid is a STYLE, not a component — the label moves inside the field and an `<hr>` divider goes under it; IBM's guidance pairs it with the default style rather than replacing it. One height, 64px, so there are no size variants to demo. Nine of the eleven partials were taken at a **measured +5.04 KB gzipped for the nine**; demoed in `sink/fluid.html` at 100% |
| `fluid-text-input` | **KEEP** | 40 | 126 | 1 | **ADMITTED 2026-08-31 with the fluid family.** Fluid is a STYLE, not a component — the label moves inside the field and an `<hr>` divider goes under it; IBM's guidance pairs it with the default style rather than replacing it. One height, 64px, so there are no size variants to demo. Nine of the eleven partials were taken at a **measured +5.04 KB gzipped for the nine**; demoed in `sink/fluid.html` at 100% |
| `fluid-select` | **KEEP** | 29 | 101 | 1 | **ADMITTED 2026-08-31 with the fluid family.** Fluid is a STYLE, not a component — the label moves inside the field and an `<hr>` divider goes under it; IBM's guidance pairs it with the default style rather than replacing it. One height, 64px, so there are no size variants to demo. Nine of the eleven partials were taken at a **measured +5.04 KB gzipped for the nine**; demoed in `sink/fluid.html` at 100% |
| `fluid-text-area` | **KEEP** | 26 | 94 | 0 | **ADMITTED 2026-08-31 with the fluid family.** Fluid is a STYLE, not a component — the label moves inside the field and an `<hr>` divider goes under it; IBM's guidance pairs it with the default style rather than replacing it. One height, 64px, so there are no size variants to demo. Nine of the eleven partials were taken at a **measured +5.04 KB gzipped for the nine**; demoed in `sink/fluid.html` at 100% |
| `side-panel` | **CUT** | 19 | 86 | 0 | ibm-products; modal covers the overlay need |
| `fluid-list-box` | **KEEP** | 14 | 62 | 3 | **ADMITTED 2026-08-31 with the fluid family.** Fluid is a STYLE, not a component — the label moves inside the field and an `<hr>` divider goes under it; IBM's guidance pairs it with the default style rather than replacing it. One height, 64px, so there are no size variants to demo. Nine of the eleven partials were taken at a **measured +5.04 KB gzipped for the nine**; **compiled and NOT demoed, on purpose**: its fluid form is the whole default markup plus the fluid wrapper, so a specimen would be a second copy of a section this sink already carries. Coverage reads 0%% and the ratchet can only move up |
| `structured-list` | **CUT** | 11 | 31 | 0 | overlaps data-table — **CONFIRMED BY SUBSTITUTION** 2026-08-29: the full-width modal wanted the shape Carbon fills with a structured-list, and a `rux--data-table` filled it, bleeding edge to edge as the variant intends. Measured +0.8 KB gzipped, not 11 |
| `card` | **KEEP** | 9 | 56 | 0 | **ADMITTED 2026-08-31, AGAINST RULE 1 RATHER THAN UNDER IT, and recorded that way on purpose.** No page shape in `templates/` requires a card and `tile` serves the container shape, so both admission tests point the other way; it was taken as the author's call at a **measured +1.2 KB gzipped and 34 classes** (59.7 → 60.9). **The row it replaced said "Carbon has no Card — it is an ibm-products preview (§4.1.14)", and that had become false.** True when §4.1.14 wrote it, when card's markup was to be sourced from `components-tile--*`; since then Carbon promoted the component — `@carbon/styles` 1.114 ships a 474-line `components/card`, `src/app.scss` has carried a commented `@use` for it all along, and `docs/carbon-react-dom.json` renders **17 `preview-preview-card--*` stories emitting `cds--card` 475 times**. Being `preview-*` is not itself disqualifying here: `icon-indicator` and `shape-indicator` are both `preview-*` and both DEFER. Nothing re-reads a CUT row's evidence, which is why a false ground survived. `sink/card.html` is the 38th fragment at 74%; the six unexercised classes are the media family, which needs an `<img>` the sink has never carried, plus the two `--truncate-multi` siblings no story emits and the ai-label pair Phase 3 cut |
| `page-header` | **CUT** | 4 | 32 | 0 | deprecated upstream; an ibm-products component, not @carbon/react — **CONFIRMED BY SUBSTITUTION**: the §4.6 dashboard used the title-stack idiom instead. Measured +0.5 KB gzipped, but deprecation is the reason and price does not move it |
| `resizer` | **CUT** | 1 | 11 | 0 | no reference on either Storybook origin; 1 KB, niche |
| `truncated-text` | **CUT** | 1 | 5 | 0 | no reference, and its expand toggle has an unfixable button-reset gap (§4.1.5) |

**36 KEEP · 11 DEFER · 28 CUT** — 75 rows, every row decided. It read 33/14/28 until
2026-08-31, when `progress-indicator`'s own DEFER reversal was finally tallied and
`toggletip`, `time-picker` and `date-picker` were admitted. A row changed without the
tally under it is how this drifted before; both move together now.

**That tally covers the original 75 only.** Carbon 1.114 ships 83. The eight new ones
have rows in the section directly below, and all eight are now decided — one DEFER and
seven CUT, 2026-08-31 — so the full count is **36 KEEP · 12 DEFER · 35 CUT**, 83 rows,
every row decided. `npm run verify` holds it there: `check-inventory` fails on a Carbon
component with no row, and on a row that carries no disposition.

## The eight that arrived with Carbon 1.114

Rows exist now; **seven of the eight are still yours to decide.** Sized 2026-08-31 from a
regenerated `docs/inventory.json`; the marginal column is each one compiled ON TOP of the
shipped set, which is the only figure that answers "what does adding this cost."

**One fact applies to all eight and is not a judgement call.** `docs/carbon-react-dom.json`
was captured 2026-08-31 against `@carbon/react` 1.115.0 / `@carbon/styles` 1.114.0 — the
version this repo compiles — with **no filter and 505 stories**. None of the eight appears
in it as a story, a class, a co-class, a spacing signature or a slot, and none appears in
the ibm-products captures either. Carbon ships their CSS and renders none of them. **Any
fragment built for one of these would be invented markup**, which §1.1 and `CLAUDE.md`
forbid, unless a targeted ibm-products capture is taken first. That is the same evidence
ground `card`, `page-header` and `side-panel` were cut on.

`EditInPlace`, `FullPageError`, `InterstitialScreen` and `OptionsTile` are also the **only
PascalCase directories among all 83** — ibm-products' own naming convention, surviving
the move into `@carbon/styles`.

**Decided 2026-08-31: seven CUT, `big-number` DEFER.** The admission rule settles all
seven without needing a byte of the size column — five fail rule 1 (no named page shape
in `templates/` requires them) and two fail rule 2 (`error-state.html` and `tile`
already serve the shape). Cost decided nothing here, which is the pattern §2.1 recorded
when it removed the KB target: not one of the CUT rows in this document was decided on
bytes, and the whole of this table is under 1 KB gzipped a component.

**CUT rather than DEFER, and for these eight the two are operationally identical.** DEFER
normally means a fragment parked in `sink/deferred/` that three lines restore. None of
these can have a fragment — nothing renders them, so there is nothing to diff against and
anything written would be invented markup. Neither disposition compiles anything, neither
creates a file, and the choice is therefore bookkeeping rather than a purchase. CUT is the
word this document already uses for that state: it is the ground `page-header` and
`side-panel` were cut on. **The sentence here named `card` as a third example until
2026-08-31 and no longer can** — card has 17 stories to diff against, was admitted that
day, and was never in the state this paragraph describes. `page-header` and `side-panel`
are unaffected: both really are `c4p--` and neither is rendered by `@carbon/react`. **Re-opening one costs a sentence**, and the two worth
watching are named below.

**Two are likelier than the rest to come back.** `user-avatar` is the one a real
application asks for soonest, and it fails rule 1 only because no template has an account
or profile shape yet — write one and the row is live again. `EditInPlace` is held by a
dependency rather than by its own merits: cutting it also declines `toggletip`, which is
an open DEFER under "What needs your call", so a decision to take `toggletip` should
re-read this row rather than assume it settled.

| Component | Disposition | KB | Classes | Marginal | Reason / evidence |
|---|---|---|---|---|---|
| `big-number` | **DEFER** | 4 | 19 | +0.3 KB | **The only one with a real page shape.** `templates/detail-page.html`'s metric row (`241feaa`) is exactly what it styles — `__label` label-01 secondary, `__value` heading-04, `__total` body-compact-01 — against the row's hand-composed `<p>`/`<h3>`/`<p>`. Deferred, not admitted, on two counts: rule 2 currently holds (tile + type build that row, verified against a running Carbon page 2026-08-31 with measurements recorded), and there is no capture to build a fragment from. **THE CAPTURE WAS TAKEN 2026-08-31 and the deferral survives it, on better grounds than before.** Carbon's markup is `figure.c4p--big-number` > `span.__row` > `figcaption.__label`, then `span.__row[role=math]` > `span.__value` — no heading anywhere. Diffing the hand-composed row against it found a real defect: the value was an `<h3>`, so the page's heading outline carried bare numbers with the label left behind, and skipped a level. Fixed 2026-08-31 to `<p class="rux--type-heading-04">`, which emits the identical declarations Carbon gives the h3 element — measured, no visual change. **Rule 2 now holds honestly**: it was true visually and false semantically before, and is true both ways now. `figure`/`figcaption` were NOT copied — they appear once in all 667 stories, inside this component, so composing them without its classes is unattested and `rux--tile` on a `<figure>` is a check-tags fault. `role=math` was not copied either; its effect on a real screen reader is unheard, and this project has been bitten twice reasoning about ARIA from markup. **TWO CONDITIONS REOPEN THIS, and they are the whole of what admitting it would buy:** IBM promoting it out of `preview-candidate` (it is the least stable tier in ibm-products' own taxonomy, so its markup may move), or an AT pass showing that three unpaired paragraphs — label, value, note, with no programmatic pairing — actually confuses a listener. `figcaption` naming its `figure` is the pairing we decline |
| `coachmark` | **CUT** | 6 | 31 | +0.9 KB | No template shape needs an onboarding beacon. Would need a behaviour module this project has not written; pulls `button`. Dearest of the eight, and the only one over +0.5 KB. **Rule 1 fails** |
| `EditInPlace` | **CUT** | 3 | 27 | +0.5 KB | No template shape. Depends on `toggletip-button`, and `toggletip` is itself an undecided DEFER — admitting this decides that one by implication. **Rule 1 fails** |
| `FullPageError` | **CUT** | 2 | 10 | +0.2 KB | **`templates/error-state.html` already builds this shape** from `inline-notification--error` + `css-grid` + buttons. Rule 2 as written fails |
| `InterstitialScreen` | **CUT** | 4 | 21 | +0.4 KB | No template shape. **Incomplete on arrival**: it styles `cds--carousel`, and `@carbon/styles` 1.114.0 has no `carousel` component directory at all, so part of it can never resolve. **Rule 1 fails** |
| `OptionsTile` | **CUT** | 5 | 37 | +0.6 KB | `tile` is compiled and serves the shape. Rule 2 as written fails |
| `scroll-gradient` | **CUT** | 2 | 9 | +0.2 KB | No template shape. A scroll affordance, not a component a page is composed from; cheapest of the eight, which decides nothing. **Rule 1 fails** |
| `user-avatar` | **KEEP** | 5 | 28 | +0.5 KB | **ADMITTED 2026-08-31, and its CUT reason did not survive contact with the component.** That reason was rule 2 — "the shell already answers this", because `app-shell.html` puts the `user--avatar` ICON in a `header__action`. An icon is not this: this is initials or a photo, four sizes, and twelve `--order-N-*` colours meant to be hashed from a name so a person keeps the same colour everywhere. The shell's icon answers "where do I click for my account"; it does not answer "who is this". **Measured +0.68 KB gzipped, 24 classes.** **No module** — an avatar displays and has no state. **THE ONLY FRAGMENT WHOSE REFERENCE IS `c4p--`**: the component was absorbed out of ibm-products into `@carbon/styles` at 1.114, so it compiles under `rux--` here while the only captured stories still render `c4p--`. Checked rather than assumed — 5 of the 6 captured classes resolve after a prefix swap; the sixth, `user-avatar__tooltip`, is ibm-products' own hover chrome and is declined. `sink/user-avatar.html` at 71%: the five unexercised classes are the `__photo` family, which needs an `<img>` this sink has never carried — the same constraint `card` records |

**None of these has a fragment or a `sink/deferred/` entry, and none can until its markup
is captured.** Deciding one KEEP means capturing it first — there is nothing to diff a
fragment against.

**All eight now carry a commented `@use` line in `src/app.scss`**, added 2026-08-31.
They had none, which meant the build manifest did not list them at all: a component absent
from that file can be neither kept nor cut, because commenting the line is the whole of
cutting one. A commented line emits nothing, so this changed no CSS — it is what makes the
manifest a complete census of the 83 rather than of the 75 it was written against.
`check-inventory` now requires it.

---

## Every row priced, 2026-08-29 — and cost decides nothing

The whole DEFER set and the three contested CUT rows were measured by compiling
each one on top of the shipped keep-set with `tools/measure.mjs`, which is the
only honest way to price a subset. Baseline: **32 components, 520 KB minified,
52.9 KB gzipped, 1,094 classes.**

**Not one candidate costs more than 3.3 KB gzipped.** The dearest is
`date-picker` at +3.3; the cheapest, `aspect-ratio` and `badge-indicator`, are
+0.1. The KB column in the table above is standalone-with-dependencies and
overstates every shared-dependency row by ten to a hundred times —
`content-switcher` reads 93 KB there and costs **+1.7 KB gzipped**; `toggletip`
reads 71 KB and costs **+0.3**.

**So no row is deferred on price any more, and none should be argued on price
again.** Every DEFER row now carries its measured marginal cost, and the reason
each is still out is NEED: no page shape in `templates/` asks for it. That is the
line roadmap §5 draws — a component is admitted to serve a page shape, never a
page shape invented to justify a component.

**The one genuine cost is not in this table.** `date-picker` and `time-picker`
need a calendar reproduced in vanilla JS in Phase 5. +3.3 KB of CSS is not the
price; the behaviour is, and no measurement here speaks to it.

**Do this before Phase 4.** `tools/measure.mjs` compiles against
`node_modules/@carbon`, so it stops working the moment devendor runs. These
figures cannot be taken again afterwards, and neither can any decision that
depends on them.

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

1. **`date-picker` / `time-picker` — ANSWERED 2026-08-31: BOTH ADMITTED, and the
   pairing in this entry was wrong.** Measured separately they are not one decision:
   time-picker is +0.4 KB with no module to write, date-picker is +3.4 KB plus the
   calendar. The calendar was bought as a conscious purchase, which is what this entry
   asked for. See both rows above.
2. **`combo-box` / `multiselect` — RE-AFFIRMED DEFER, 2026-08-31.** Put to the author
   with the measured cost and the capture count; deferred again because no page shape
   needs them, which is the only ground that would admit them. Type-ahead and
   multi-select are common in
   real forms. They are out because no target shape names them, not because they are bad
   — and the KB column overstates them the same way: **together they add 7 KB minified /
   0.8 KB gzipped**, since both are built from `list-box`, `text-input`, `checkbox` and
   `tag`, all of which already ship. For scale, the seven sub-8 KB DEFER rows together
   add 14 KB minified / 1.9 KB gzipped.
3. **`toggletip` — ANSWERED 2026-08-31: ADMITTED with the picker work**, not on its own
   cheapness. The entry below already had the cost right; what it lacked was a reason to
   buy, and the pickers supply one. Original entry follows.

   **`toggletip` — DEFER, but NOT on cost.** This entry read "out on cost at 71 KB",
   which is this document's own warning ignored two sections above where it is written:
   71 KB is the standalone-with-dependencies figure, and toggletip shares popover,
   button and tooltip with the keep-set. **Measured marginal cost is 3 KB minified /
   0.3 KB gzipped.** Defer it because nothing needs it yet — the price is not the
   reason. Corrected 2026-08-28, re-measured against the shipped themes.

4. **`stack` — RESTORED 2026-08-28, on the terms this row was written with.** It is
   now KEEP in the table above. What follows is the case as it stood, kept because the
   decision reads better with the evidence that produced it than without.

   **`stack` — DEFER, and its condition has been met.** This row said "Phase 6 may
   want it". Phase 6 wants it. `templates/form-page.html` is the first page in the
   repository with a form on it, and a form built from the compiled set has **no
   vertical rhythm at all**: Carbon spaces one with `stack-vertical stack-scale-7`,
   and `.rux--form-item` carries no vertical margin of its own.

   **This is evidence, not judgement, which is why it is here rather than above.**
   Read off a running `components-form--default` on 2026-08-28: the stack computes to
   `display: grid` with `row-gap: 32px`, and every child reports
   `margin-block-start: 0`. Carbon zeroes its controls' margins deliberately and
   spaces from the container. A margin-based stand-in therefore cannot work — the
   first attempt lost to `.rux--checkbox-group`'s own `margin: 0`, specificity (0,1,0)
   against (0,0,2), and the gap measured zero.

   **The template carries a `<style>` block standing in for it today**, using the same
   grid mechanism. That is the wrong home for it: it must be repeated in every
   template that holds a form, and a design system whose spacing lives in its
   templates is not the source of its own spacing. Roadmap §4.4 carries the plan.

   **Price: 1 KB, 15 classes, 0 tokens** — the cheapest row in this table, and the
   §2.1 KB target that would have argued against it no longer exists.

Rows marked CUT with an evidence reason — `slug`, `resizer`, `truncated-text`,
`page-header`, `side-panel` — came out of the Phase 1 markup sweep and are not judgement
calls: nothing in the 667 captured stories emits them, or they belong to
`@carbon/ibm-products` rather than Carbon proper.

**`card` was in that list until 2026-08-31 and was the one entry it got wrong.** The
sweep's reading was right when taken; Carbon has since promoted Card out of
`ibm-products`, and 17 react stories emit `cds--card` 475 times. **An evidence reason
ages like any other figure, and nothing in this repository re-reads one** — a disposition
whose ground has expired looks identical to one whose ground still holds. That is the
general finding; the row is only where it surfaced.

---

## Reproducing the numbers

```bash
npm run inventory                 # per-component size, classes, @use graph, tokens
node tools/measure.mjs            # full vs proposed set, gzipped
node tools/measure.mjs --themes 1 button form popover tooltip   # any ad-hoc set
```
