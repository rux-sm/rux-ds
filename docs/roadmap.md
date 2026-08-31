# Rux DS — Roadmap

The end goal, the route to it, and the numbers that say whether we got there.

The terms **MUST**, **SHOULD**, and **MUST NOT** describe required, preferred, and
prohibited behavior.

This is a decision document. It moves no code. Execution runs against §4.

---

## 1. End goal

A framework-free CSS/HTML/JS design system, derived from Carbon v11 **by subtraction**,
whose primary consumer is Claude Code generating consistent pages.

Three properties define done:

- **No Carbon at runtime or in the tree.** No `@carbon/*` dependency, no `--cds-*`, no
  SCSS, no telemetry. Carbon is the quarry, not a dependency.
- **A page is composed, not authored.** A new page starts from a template in
  `templates/`, not from a blank file. Consistency comes from there being one obvious
  way to build each page shape.
- **An agent stays on-system without being told twice.** `CLAUDE.md` plus one skill
  routes to tokens and templates; the system is small enough to hold in context.

### 1.1 Decisions on record

| Decided | Choice | Rejected |
|---|---|---|
| 2026-08-26 | Fresh start from Carbon | Extracting Tiers 0–2 out of rux-ui |
| 2026-08-26 | rux-ui frozen, not a consumer | rux-ui vendors rux-ds |
| 2026-08-26 | 100% Carbon in, then strip | Carbon as reference-only |
| 2026-08-26 | Docs last, rewritten to match code | Docs ported alongside each component |
| 2026-08-26 | **Carbon's core and BEM kept intact** | Rewriting conventions or gutting internals |
| 2026-08-28 | Size reported, not budgeted (§2.1) | A third revision of the KB target |
| 2026-08-28 | **Devendor last, after templates** | Devendoring before behaviours and templates |

**The keep-core rule.** Customization is limited to what Carbon exposes as configuration
— `$prefix` and its sibling flags — plus choosing which components and themes to compile.
**A Carbon component file MUST NOT be edited.** Everything inside it stays as shipped, so
components function as designed and Carbon's own documentation still describes them
accurately. This subsumes the earlier "never edit in place" rule and makes it the
project's central constraint rather than a note on one phase.

**Why subtraction rather than addition.** At every step there is a working system in
front of you, and each deletion is a decision made with the whole thing visible.
Building additively means choosing what to include without seeing what is missing.

**The alternative that was declined, recorded so it is not re-proposed.** rux-ui holds
836 KB of foundation documents across 11 files, with amendment logs and contract
versions — the same category of thing this project wants from Carbon. Extracting it was
proposed and declined on 2026-08-26. What would reopen it: finding, during Phase 7, that
Carbon's guidance is too general to generate consistent pages from, at which point
rux-ui's `docs/foundations/` is the obvious quarry for the rewrite.

---

## 2. Measured baseline

All figures minified, Sass-compiled from `@carbon/styles@1.113.0` on 2026-08-26.
Reproduce with `tools/measure.mjs` (Phase 2).

| Configuration | Size |
|---|---|
| Full Carbon — 75 components, 4 themes | **837 KB** |
| Core subset — 24 components, 1 theme | 337 KB |
| Lean subset — 12 components, 1 theme | 196 KB |
| Theme tokens only — 4 themes | 79 KB |
| Theme tokens only — 1 theme | 19 KB |

For scale: rux-ui is 351 KB **unminified** for 23 components plus a 143 KB token file,
with 12 JS behavior modules at 86 KB.

**Read the per-component sizes as dependency weight, not standalone weight.** Compiling
each component alone and summing gives 3,534 KB against a real bundle of 837 KB — a 4.2×
overcount, because every component drags its transitive `@use` graph. `fluid-multiselect`
measures 124 KB because it pulls list-box, text-input, checkbox and tooltip with it, not
because it has 124 KB of its own rules. The small end is the honest end: `badge-indicator`
0.6 KB, `stack` 0.7 KB, `aspect-ratio` 0.7 KB — these are nearly dependency-free.

### 2.1 Size

**There is no KB target.** Size is measured on every build and reported. It gates
nothing. What gates the component set is the admission rule.

**Admission.** A component enters `src/app.scss` only if both hold, and both are
recorded in `docs/inventory.md`:

1. A named page shape in `templates/` requires it.
2. Nothing already in the set serves that shape.

**Tripwire.** If the built stylesheet exceeds **75 KB gzipped**, something has gone
wrong structurally — a theme added by accident, a component family re-enabled, an
opt-in layer switched on. Re-open the set. This is a smoke alarm, not a thermostat:
it sits where no legitimate sequence of admissions reaches it.

> First use of the admission rule, 2026-08-28: `data-table/sort`, `/expandable`
> and `/action` were admitted at +2.9 KB gzipped, because the table page is a
> named Phase 6 shape and sorting and row selection are what it is for. The rule
> decided it; the tripwire was never consulted, which is the division of labour
> this section is arguing for.

**The JS budget stands: ≤90 KB of behavior JS**, and it is a real constraint — Phase 5
writes that code rather than selecting it, so every module is a cost someone pays for
in maintenance as well as bytes.

Measured 2026-08-28. Reproduce with `tools/measure.mjs`, which reads the theme pair
from `src/app.scss` and whose output matches `css/rux.min.css` byte for byte:

| Configuration | Minified | **Gzipped** | Classes |
|---|---|---|---|
| Full Carbon — 75 components / 79 modules, 4 themes | 881 KB | 87.6 KB | 1,644 |
| **Shipped — 31 components / 34 modules, 2 themes** | 546 KB | **55.6 KB** | 1,112 |
| Shipped set — 1 theme | 523 KB | 54.0 KB | 1,112 |
| Shipped set — 4 themes | 590 KB | 56.4 KB | 1,112 |

**A component can be several modules.** Carbon splits `data-table` into four —
the base plus `sort`, `expandable` and `action` — and `@use`s them separately in
its own `components/_index.scss`. The manifest took the base alone until
2026-08-28, which shipped a table that could not sort, expand or batch-select.
Counting modules as well as components is what makes that visible; the
full-Carbon baseline was understating itself by the same four.

> **Amended 2026-08-28. This section carried a KB target through three revisions and
> now has none.** ≤150 KB minified became ≤40 KB gzipped became a recommended ≤55 KB.
> Every amendment was correct on the evidence available, and that is the tell: a number
> revised each time it was tested was never the thing constraining the design.
>
> **The decisive evidence is that the target never decided anything.** All 44 CUT and
> DEFER rows in `docs/inventory.md` were settled on three grounds — overlap with
> something already shipping (`dialog` overlaps modal, `content-switcher` overlaps tabs,
> `structured-list` overlaps data-table), no named page shape needing the component, or
> Phase 1 provenance (`card`, `page-header` and `side-panel` are `@carbon/ibm-products`,
> not Carbon). Nine rows mention size; most use it to argue something is *cheap enough
> to add back*. The one component genuinely cut on cost, `toggletip` at "71 KB", costs
> **0.3 KB gzipped** against the shipped set. Not one component was cut because of CSS
> bytes.
>
> **It also measured the wrong scarce resource.** §1 defines done partly as "small
> enough to hold in context", and the primary consumer is Claude Code, not a browser on
> a slow link. What binds that consumer is the routing surface — 601 tokens, 1,079
> classes, 31 components, and the templates — not the weight of a stylesheet fetched
> once and cached. 52.7 KB costs it nothing; two plausible ways to build a dialog costs
> it a great deal.
>
> **And it could not discriminate where decisions are made.** Marginal cost against the
> shipped set is 0.3 KB for `toggletip`, 0.8 KB for `combo-box` plus `multiselect`,
> 1.9 KB for the seven sub-8 KB DEFER rows together. A byte budget therefore passes on
> every individual addition and fails only in aggregate, after a dozen or more
> individually-approved decisions. The admission rule fails correctly at the first one.
>
> **Put a number back when one of these becomes true:** the system serves a public site,
> its users are on slow or metered connections, there is a performance SLO it must meet,
> or CSS becomes a meaningful share of page weight. Restore it with that reason attached
> — §5's instruction to record the floor you actually hit applies to the reason as much
> as the figure.
>
> A measurement correction landed with this amendment. `tools/measure.mjs` took the
> first N of `['white','g10','g90','g100']`, so every 2-theme figure it ever produced
> priced **white + g10**, while `src/app.scss` has shipped **white + g100** since Phase 3
> pass 3 chose "the furthest point from" white. g10 compresses against white far better,
> so the numbers this section quoted ran ~1.3 KB optimistic. The floor is 52.7 KB, not
> the 51 KB that the ≤55 KB proposal was rounded up from.

> **Amended 2026-08-26. This section previously targeted ≤150 KB minified, and that was
> wrong twice over.** It was unreachable under §1.1's keep-core rule, because the 55% it
> depended on was to come from cutting Carbon's internals. More usefully: **it measured
> the wrong thing.** Carbon's verbosity is highly repetitive — the same
> `clamp(var(--x, var(--y)))` shapes over and over — so it compresses roughly 10:1, and
> what reaches a browser is a fraction of the minified figure. The old target would have
> traded away function to optimize a number nobody downloads.
>
> **Keeping Carbon's core intact is close to free in the metric that matters**, which is
> the finding that settles §1.1 rather than merely accommodating it.

For scale: rux-ui is 351 KB **unminified** for 23 components plus a 143 KB token file.
This system is heavier uncompressed and lighter on the wire, and it keeps Carbon's
accessibility and interaction behavior — which is the trade §1.1 is buying.

---

## 3. What comes from where

| Package | Role | Fate | Licence |
|---|---|---|---|
| `@carbon/styles` | **The CSS source.** Light-DOM `.cds--*` classes, 75 components | Quarried, then deleted | Apache-2.0 |
| `@carbon/elements` | **The token source.** 476 exports as plain JS objects, 4 themes | Quarried, then deleted | Apache-2.0 |
| `carbon-website` | **The doc source.** 317 MDX, 43 component pages × 4 tabs | Quarried, then deleted | Apache-2.0 |
| `@carbon/web-components` | **Markup + behavior reference only** | Never installed as a dependency | Apache-2.0 |
| `@carbon/react` | — | Not used | Apache-2.0 |
| `@carbon/icons` | 123 MB of JS-wrapped SVG | Not used; take SVGs individually | Apache-2.0 |

**THE LICENCE COLUMN IS NOT DECORATION, and "quarried, then deleted" does not end the
obligation.** Two of these packages leave material in the tree after Phase 4 deletes the
dependency: `css/rux.css` is compiled `@carbon/styles`, and `assets/icons.svg` is
`@carbon/icons` SVG re-quarried by `tools/icons.mjs`. Both are committed, and CI commits
them precisely so the system is consumable from a raw URL with no build step — which is
distribution. Apache-2.0 §4 attaches to that.

Deriving by subtraction changes what the output looks like; it does not change where it
came from. **§8 carries the decision this fact implies, and nothing here duplicates it.**

**`@carbon/web-components` is a reference you read, not code you port.** It is Lit-based
and renders into shadow DOM — its SCSS is compiled into JS and injected into shadow roots,
written with `:host` selectors and no namespacing because encapsulation does the work.
None of that CSS survives a move to light DOM. Its value is that it is the only place
Carbon's **markup structure, ARIA wiring, and keyboard contracts** exist outside React.
Read the Lit templates; write your own.

**`@carbon/styles` ships CSS but no HTML.** This is why a reference for markup is needed
at all, and it makes Phase 1 harder than it looks.

---

## 4. Phases

Each phase MUST end with the kitchen sink (§4.1) rendering correctly. A phase that cannot
demonstrate that is not finished.

**Execution order is 1 → 2 → 3 → 5 → 6 → 4 → 7 → 8.** Phase 4 moved to the end on
2026-08-28; §4.4 records why. **The phase numbers are names, not positions** — they are
written into commit messages, code comments and every fragment's provenance, so they
stay put and the order is stated here instead.

### 4.1 Phase 1 — Standing baseline

Get 100% Carbon rendering in a plain HTML page. **You cannot subtract from something you
cannot see**, and this page is the measuring instrument for every later phase.

1. **Set the namespace first**, before anything is written:

   ```scss
   @use "@carbon/styles/scss/config" with ($prefix: "rux");
   ```

   Carbon threads `$prefix` through every selector and every custom property, and it is
   declared `!default`, so this one line makes Carbon emit `--rux-*` and `.rux--*`
   itself. Verified 2026-08-26: 544 tokens and 70 classes on a button build, **zero
   `cds` leakage**. See §4.4 for what this removes from the project.

2. One `src/app.scss` that `@use`s every component and all four themes, **plus the reset
   and default type layer**:

   ```scss
   @use "@carbon/styles/scss/reset";
   @use "@carbon/styles/scss/type";
   @include reset.reset;
   @include type.default-type;
   ```

   These do not arrive with the components and MUST be pulled explicitly (§4.1.1).
   Measured cost: **+6 KB minified, +2 KB gzipped.** The `grid` and `layout` modules
   are required too — §4.1.2 records why `layout` is not optional.

3. Compile to `css/rux.css` via `sass`. No bundler, no framework.
4. Build `kitchen-sink.html` covering every component and every variant, in light and
   dark. Markup comes from reading `@carbon/web-components` Lit templates — this is the
   slow part, and it is unavoidable.
5. Serve it. Screenshot it. **This is the "before" record.**

Exit: 837 KB rendering correctly; a screenshot set committed as the visual baseline;
`grep -r cds css/ kitchen-sink.html` returns nothing.

#### 4.1.1 Reset, type, and fonts

Carbon's config flags are read by `@carbon/styles/index.scss`, **not by the component
partials**. Because this project `@use`s components directly, `$css--reset`,
`$css--font-face`, `$css--body` and `$css--default-type` have no effect — verified
2026-08-26: toggling all four changed the build by 0 bytes. Anything wanted from those
layers MUST be included by hand.

**Take the reset and the default type layer.** Carbon's components are authored assuming
the reset has run — margins cleared on headings, `font-family` inherited by `button`,
`select` and `input`. Without it browser defaults leak through and components are subtly
wrong in ways that read as bugs. At 2 KB gzipped this is the cheapest thing in the
project and it sits squarely inside §1.1's "functions as designed."

**Leave `$css--font-face` off, and ship no IBM Plex.** Two reasons, one hard and one
soft:

- **It is broken for a no-build project as shipped.** `$font-path` defaults to
  `'~@ibm/plex'`, and the `~` is a bundler convention. Enabling font-face emits 39 KB
  across **90 `@font-face` rules**, every one pointing at
  `url("~@ibm/plex/…woff2")` — a literal path that 404s in a browser. Using it at all
  requires overriding `$font-path` to something actually served.
- **Plex is IBM's brand typeface**, and it is the loudest single "this is Carbon" signal
  in the system. Skipping it is a config-level choice, so it costs nothing under §1.1
  and stays reversible.

Carbon's stack degrades on its own — `'IBM Plex Sans', system-ui, -apple-system,
BlinkMacSystemFont, sans-serif` — so type renders correctly with nothing shipped.

**The honest cost, stated because it is easy to miss:** Carbon's type scale is
metric-tuned for Plex. `body-01` carries `letter-spacing: 0.16px`, an optical correction
for that face specifically. On `system-ui` those values are slightly off — not broken,
not as drawn. If the type ever looks subtly loose, this is why, and the fix is to adopt
Plex properly: a self-hosted woff2 subset, `$font-path` pointed at it, and
`$css--font-face: true`.

#### 4.1.2 What Phase 1 discovered

Two things the plan did not anticipate, both found by building rather than reading.

**`@carbon/grid` hardcodes its custom properties, and `$prefix` cannot reach them.**
`_css-grid.scss:43` and following emit literal `--cds-grid-gutter`, `--cds-grid-columns`
and six siblings — the *values* are interpolated, the *property names* are not.
`$prefix` governs grid's class names only. Configuring `@carbon/grid/scss/config`
directly does not work either: `@carbon/styles/scss/config` already `@forward`s it, so
Sass rejects the second configuration as *"module was already loaded"*.

The fix is a build post-step renaming `--cds-grid-` to `--rux-grid-` (`tools/build.mjs`).
It is safe and stays safe: those eight tokens are declared and consumed **only inside
grid's own rules** — 125 declarations, 20 `var()` references, and no component in
`@carbon/styles` refers to them. The build's `verify()` re-proves zero `cds` on every
run rather than trusting that claim. This is the **only** transform applied to Carbon's
output, and it edits no Carbon file, so §1.1 holds.

**Components depend on `@carbon/styles/scss/layout`, and no component pulls it in.**
Omitting it fails silently in the worst way: the CSS builds clean, every class resolves,
and the page renders *wrong* — buttons collapsed to text height because
`--rux-layout-size-height-lg` was referenced 27 times and declared 3. Adding the module
fixed it.

**No gate would have caught that** — not the compile, not the class checker. Only
looking at the page did. It is the concrete argument for §4.1's kitchen sink, and it
arrived within an hour of writing the rule.

**Verified baseline, 2026-08-26** — 75 components · 635 `--rux-*` tokens · 826 `.rux--*`
classes · zero `cds` · 942 KB raw, 849 KB minified, **84 KB gzipped**. Button computes
to 48px tall on `rgb(15, 98, 254)`; text input 40px; all four themes resolve to Carbon's
exact values.

#### 4.1.3 Icons — the gap `@carbon/styles` leaves

**Carbon's CSS ships no icons, and for many components the icon *is* the component.**
Discovered by rendering, 2026-08-26: dropdown chevrons, list-box selected ticks,
progress-indicator step states, two-handle slider thumbs, modal and dialog close
buttons, search magnifiers, number steppers, and the UI-shell global actions all
render as empty boxes. Seven blank `<svg>` elements on the page, and the two-handle
slider thumb sits correctly at 16×24 with `background: rgba(0,0,0,0)` — the fill is
supposed to be an icon.

Not everything needs one. **Checkbox and radio ticks are drawn in CSS** (41
`::before`/`::after` rules) and were correct from the start. The rule is: if Carbon
gives a class an empty container, an SVG belongs in it.

`@carbon/icons` is 123 MB across 2,828 files and stays out of the dependency list
(§3). `tools/icons.mjs` quarries the 39 icons this system actually uses into
`assets/icons.svg` — a **10.2 KB** sprite, committed, inlined into the page at build
time so `fill: currentColor` inherits. Add an icon by naming it in that file and
re-running.

**The sprite is inlined rather than referenced.** External `<use href="file.svg#id">`
does not reliably inherit `currentColor` across the `<use>` shadow boundary, which
matters here because every icon is themed.

**Carbon's icon set is uneven and the extractor absorbs it:** only 68 icons exist at
16px and 18 unsized; the complete set is at 32px. `tools/icons.mjs` falls back
16 → 20 → 32 → root per icon and lets the `viewBox` normalise the result. Of the 39
taken, 16 came from 16px, 2 from 20px, and 21 from 32px.

#### 4.1.4 What the full visual review corrected

Every one of the 64 sections was rendered and inspected. The class checker and the
coverage gate had both been green throughout — **none of the defects below tripped
either one**, which is §4.1.2's lesson arriving a second time.

The recurring cause was markup that resolved but did not match Carbon's structural
contract. Six patterns, each now documented in the fragment that hit it:

**1 · Error text is a sibling, not a child.** `.rux--form-requirement` is
`display: none` and is revealed only by `[data-invalid] ~ .rux--form-requirement`
(css/rux.css:6434-6452). Nesting it inside the field wrapper — which is what reads
naturally — means no error message ever appears. The `[data-invalid]` marker also
belongs on a specific element per component, and it differs: the field wrapper for
text input, the wrapper for text area, `.rux--select-input__wrapper` for select,
and the `.rux--number` root for number input.

**2 · Double-owned margins.** `.rux--card__title` and `.rux--card__body` both carry
`margin-inline: 1rem`, so nesting the title inside the body indents it twice. They
are siblings.

**3 · Variant classes that colour a backdrop, not a box.** `.rux--dialog--danger` is
`background-color: var(--rux-ai-overlay)` — it belongs on the overlay. On the
container it tints the card itself.

**4 · Classes that do nothing.** `.rux--tooltip--visible` has no rule at all;
visibility comes from `.rux--popover--open > .rux--popover > .rux--popover-content`.
Likewise `.rux--select--inline` requires `.rux--select-input--inline__wrapper` — with
the ordinary wrapper the control renders as unstyled text.

**5 · Nesting that supplies a positioning context.** The fluid date picker needs
`.rux--date-picker` (which is `position: relative`) between the `--fluid` root and the
input, because the label is absolutely positioned and the input reserves
`padding: 2rem 1rem 0.8125rem` for it. Without it the label sits on top of the value.
The fluid time picker has no label rule of its own — each child of its wrapper is
itself a fluid sub-component.

**6 · Elements that exist only while animating.** `.rux--copy-btn__feedback` has no
hidden state in CSS; Carbon's web component adds it to the DOM only during the copy
animation. Rendering it unconditionally leaves "Copied!" permanently on screen.

**Two things that looked wrong and were correct.** The default inline notification is
high contrast — `#393939` on the white theme — and `--low-contrast` is the light
variant using `--rux-notification-background-*`; both now render side by side. And
`.rux--snippet--inline` computes to `background: #f4f4f4; padding: 0`, which is
genuinely almost invisible, exactly as Carbon ships it.

**Icons grew from 39 to 52.** The shape indicator maps each status to a distinct
*shape* so colour is never the only signal — `critical`, `critical-severity`,
`caution`, `diamond-fill`, `low-severity`, `circle-fill`, `circle-stroke`
(web-components/shape-indicator.js:55-65) — and the icon indicator carries its own
twelve-status set (icon-indicator.js:50-97). Both were rendering as bare text labels.

**Final state, verified in light and dark:** 64 sections · 546 classes · 0 unresolved
· 0 collapsed · 0 escaped · 0 empty SVGs.

#### 4.1.5 A modifier without its base class

The defect the first review missed, found only by looking at the rendered header:
**a Carbon modifier applied without the base class that carries the appearance.**
The element then wears the browser's default form-control chrome.

Two instances, both invisible to every gate:

- **UI-shell menu toggle.** `.rux--header__menu-toggle` sets `display: flex` and
  centring — nothing else. Carbon's own template applies **three** classes:
  `__action` (which supplies the button reset and the 48×48 box), `__menu-trigger`,
  and `__menu-toggle`, with a **16px** icon, not 20
  (web-components/header-menu-button.js). With `__menu-toggle` alone the hamburger
  rendered as a 36×26 grey button with a `2px outset` border.
- **Time-picker field.** `.rux--time-picker__input-field` sets type and layout but no
  field appearance; the base is `.rux--text-input`, which the web component composes
  it with. Alone, it rendered as a white box with a `2px inset` border.

**The generalisation is what matters.** A Carbon class ending in `__part` is often a
*modifier* over a base component, not a standalone. `tools/check-rendered.js` now
sweeps every form control for default chrome; across 181 controls it found exactly
these two plus the gap below.

**One genuine upstream gap, shown unfixed.** `.rux--truncated-text__expand-toggle`
sets only `color` and `cursor` — no reset — while
`.rux--truncated-text__tooltip-trigger`, directly below it in Carbon's own CSS, has
one. The web component gets its reset from the shadow root, so this only bites
light-DOM consumers. `.rux--link` does not fix it (no `background: none`), and
Carbon's button reset is a Sass mixin with no emitted class. Fixing it means editing
a Carbon file, which §1.1 forbids, so **the kitchen sink renders it broken and labels
it** — the sink's job is to show the system as it is. Phase 5 is where our own layer
can close it.

**Two false positives worth keeping in the detector's notes.** `.rux--toggle__button`
is a 1×1 visually-hidden focus proxy whose UA background never paints, and
`.rux--header__action` matched the menu toggle in a naive selector because the toggle
carries that class too.

#### 4.1.6 Where the defects actually come from

After three review rounds the tally is unambiguous, and it matters for how Phase 1
should have been done.

| Source | Count | Examples |
|---|---|---|
| **Hand-written markup that misread the contract** | ~20 | every item in §4.1.4 and §4.1.5 |
| Carbon CSS genuinely incomplete for light DOM | 1 | truncated-text expand toggle |
| Looked wrong, was correct | 4 | high-contrast notification, inline snippet padding, header nav hidden under 66rem, `--active` header action |

**The method was the defect.** Markup was written by reading class *names* out of the
compiled CSS. A class list says what exists; it does not say:

- how classes nest — `__title` inside or beside `__body` (§4.1.4 item 2)
- which are modifiers needing a base — `__menu-toggle` needs `__action` (§4.1.5)
- which apply to one variant only — `__check` renders only when `size === "sm"`
- which parts a component borrows from another — the actionable notification emits
  `cds--${type}-notification__details`, so its internals are *inline* notification
  classes and `__actionable-notification__*` carries no layout at all
- which structural element supplies rhythm — the card's spacing is `margin-block` on
  each child, so `__title` outside `__header` leaves the text flush to the top edge

Every one of those was recovered by reading `@carbon/web-components` **after** the
markup was already wrong.

**The correct source was available the whole time.** Those Lit templates render the
authoritative DOM. Rather than reading them by hand, the components can be mounted in
a browser and their `shadowRoot.innerHTML` dumped — turning markup from something
inferred into something extracted. See §4.1.7.

#### 4.1.7 Extracting the markup instead of inferring it

§4.1.6 concluded the method was the defect. The fix: mount Carbon's Lit components
in a browser and read their rendered shadow DOM, so markup is **extracted rather than
guessed**.

`tools/extract/` does it with no bundler — an import map resolves `lit`,
`@floating-ui` and the `@carbon/*` bare specifiers straight out of `node_modules`,
served by `tools/serve.mjs`. `@carbon/web-components` goes in as a temporary quarry
and comes back out afterwards; §3 still holds, and the header of that file records the
re-run recipe. **219 of 228 registered tags** rendered successfully.

**What it produced.** For each element Carbon renders, the set of classes it carries.
Intersecting across every element that uses a class gives the classes Carbon *always*
emits alongside it — exactly the "modifier without its base" defect, now derivable
rather than stumbled upon. The result is `docs/carbon-co-classes.json`, and
`tools/check-co-classes.mjs` enforces it **in plain Node**: the browser was needed to
produce the map, not to use it, so no headless-browser dependency was added.

**Corrections it found that three review passes had missed:**

- `.rux--text-input` root is `form-item text-input-wrapper` on **one** element; I had
  them on two, parent and child
- `.rux--dropdown` is `dropdown list-box <size>` and its `__field` is a **`div`** with
  `role="combobox"`, not a `<button>`; `__menu` is a **`div`**, not a `<ul>`
- `.rux--combo-box` carries `--dropdown` as well, and its input is
  `text-input text-input--empty`
- `.rux--multi-select` carries `--list-box` but, unlike dropdown, **no**
  `--layout--size-*`
- the date-picker input sits in a bare `<span>` inside `__wrapper` and carries a size
- `.rux--slug__button` is also a `toggletip-button`
- `--popover--drop-shadow` belongs on the **container**, not the content

**The trap this also exposed: the web components emit classes `@carbon/styles` does
not define.** `cds--list-box--md`, `cds--layout--size-md` on a dropdown, and
`cds--date-picker__input--md` have **no rule in the compiled CSS**; the styled sizes
are `--dropdown--lg` / `--dropdown--sm` and `__input--lg` / `--sm`. Following the
extraction blindly would have added dead classes and lost the sizing.

> **The rule that falls out: the web components are authoritative for STRUCTURE, the
> compiled CSS is authoritative for WHICH CLASSES ARE STYLED.** Neither alone is
> enough, and `tools/check-classes.mjs` is what keeps the second half honest.

**26 of the 38 derived rules were sample artifacts** — a class that appeared on only
one rendered element looks "always" paired with whatever else was on it. Each is
listed in `_ignored` with its reason rather than deleted, so the curation is
reviewable and regenerating the map does not silently resurrect them.

#### 4.1.8 The sink had no behaviour, and that read as broken

Review feedback: *popover not working · menu always open · accordion not working ·
copy button not animating*. All four were the same thing, and calling it "Phase 5" was
the wrong answer three times running.

**A static sink misrepresents the system.** Components frozen in their open state look
broken, and components with no trigger look permanently stuck. The sink's job is to
show what the CSS does; it cannot do that if nothing can be driven.

`sink/harness.js` (214 lines) now drives them: accordion, list boxes, popover,
tooltip, toggletip, menu, overflow menu, copy animation, tabs, content switcher, tree
expand and select, toggle, search clear, plus Escape and outside-press. It toggles
**only the state classes Carbon's CSS already reacts to** — every class in it was read
out of the compiled CSS.

> **It is emphatically not the system's behaviour layer.** No focus management, no
> keyboard support past Escape, no ARIA lifecycle beyond the one attribute each toggle
> owns. §4.5 still writes the real one: an overlay kernel owning outside-press,
> Escape and focus trapping, with menu, popover, drawer and shell delegating to it.
> The harness is scaffolding for the sink and ships with nothing.

**What still had to change in the markup**, because interaction exposed it:

- Components that were rendered permanently open — menu, popover, tooltip, toggletip,
  overflow menu — now start closed and carry a real trigger.
- The multiselect selection badge is `justify-content: space-between` with
  `padding-inline-end: 0.125rem`: Carbon puts **two** children in it, the count *and*
  a clear icon. With only the count the space-between had nothing to distribute and
  the digit sat left of centre — the misalignment reported in the fluid multiselect.
- Tree nodes use `__label__text` for the label, and the caret has a
  `__toggle-icon--expanded` state that nothing was setting.

#### 4.1.9 Interaction round — what driving the components exposed

Making the sink interactive (§4.1.8) immediately surfaced defects that no static
review could have found, because they only appear when something is *clicked*.

**Clicking a checkbox scrolled the page to the top.** `.rux--checkbox` is
`position: absolute` at a 1×1 size, and the pair that gives it a containing block is
`.rux--form-item.rux--checkbox-wrapper` — **both classes on one element**
(css/rux.css:6569). With `form-item` alone the input resolved against the initial
containing block and rendered at document coordinates (10, 19). Clicking the label
focused it, and the browser dutifully scrolled 2,300px to reach it. Another
modifier-without-base, and the most user-visible one yet.

**The toggle looked dead because it fired twice.** `<label for>` pointing at a
`<button>` forwards the click to it, so a handler bound to both the label *and* the
button toggled on the way in and back on the way out. Bind to the button only.

**Number steppers and the slider were never wired.** `.rux--slider__input` is
`display: none` — Carbon hides the native range entirely and drives the thumb itself,
so dragging has to be implemented, not delegated. The harness now does pointer drag
and arrow keys.

**Three demos were wrong, not the components:**

- **Aspect ratio** takes its height from `::before { padding-block-start: <pct> }`.
  Two things destroy that, and my demo did both: a parent that stretches its children
  (any grid or flex default) overrides the height, and any padding or in-flow content
  *adds* to it. Every box was rendering square. Fixed with `align-items: start` and an
  absolutely-positioned label — all five ratios now measure exact.
- **The grid was correct all along** (16 columns, spans at 196/196/424px) but read as
  wrong because nothing showed the columns. It now renders all 16 single spans.
- **Page header** put the title inside `__content__body`, which is the *description
  text*, not a wrapper. The title belongs in
  `__content__title-wrapper > __content__title-container > __content__title`.

**Action set was missing `.rux--btn-set`.** `.rux--action-set` sets `align-items` and
`justify-content` but **not `display`** — `.rux--btn-set` is what supplies
`display: flex` (css/rux.css:2353). Without it the buttons were block-level and
overlapped.

**Two classes in `@carbon/styles` do nothing at all.** `--action-set--stacking`
appears only inside a `:not()` negation — no rule implements it, because Carbon's
React ActionSet computes the stacked layout in JS. And
`--pageheader-title-grid-width` defaults to `0` and is set from JS. Both are recorded
in the fragments rather than faked; the stacking variant is simply not shown.

**Four custom properties are referenced with no declarant and no fallback.** Found
2026-08-26 by `tools/check-tokens.mjs` (§4.1.10), not by looking — they are latent,
not visible on the sink today:

| Token | Consumed as | If unset |
|---|---|---|
| `--rux--card--label-line-clamp` | `-webkit-line-clamp` | declaration invalid, dropped, no clamping |
| `--rux--card--title-line-clamp` | `-webkit-line-clamp` | same |
| `--rux--card--description-line-clamp` | `-webkit-line-clamp` | same |
| `--rux--side-panel--scroll-animation-distance` | `inset-block-start: calc(-1px * …)` | whole `calc()` invalid |

Same species as the two above: a property Carbon's React/Lit layer sets at runtime
that light-DOM CSS never declares. The card three are reachable only through
`__label--truncate` / `__title--truncate` / `__description--truncate`, which no
fragment uses — so nothing renders wrong now, and a template reaching for card
truncation would fail silently, since the *classes* resolve fine.

**They are recorded, not declared.** Supplying a value would author a Carbon default
Carbon does not ship, which §1.1 forbids — the same reasoning that leaves
`.rux--truncated-text__expand-toggle` visibly unfixed (§4.1.5). A consumer that wants
card truncation sets the property inline, which is Carbon's own contract. The six
*other* unresolved references in the build all carry fallbacks and are fine; that is
Carbon's override-hook idiom, not a defect.

#### 4.1.10 The gates were all name-based on classes, and none watched tokens

`check-classes.mjs` proves a class has a rule behind it. Nothing proved the same for a
token, and the token failure is quieter: an unresolved `var()` with no fallback
invalidates the whole declaration, the browser drops it, and the element renders with
whatever it inherited. No error, no 404, no failing class.

**§4.1.2 is the precedent and the proof this was a real hole.** Omitting
`@carbon/styles/scss/layout` left `--rux-layout-size-height-lg` referenced 27 times and
declared 3. The build was clean, every class resolved, every gate passed, and buttons
were collapsed to text height. It took a visual review to find. `tools/check-tokens.mjs`
catches that shape statically.

Two rules make it usable rather than noisy:

- **A reference with a fallback is not a finding.** 14 in the current build have one.
  Flagging them would make the gate an exception list, which measures the list rather
  than the rule.
- **Genuinely unset properties go in `KNOWN` with a reason**, following
  `docs/carbon-co-classes.json`'s `_ignored` precedent — reviewable, and regenerating
  does not silently resurrect them.

It is deliberately narrower than §4.8's planned token snapshot: that catches a *value*
moving under a stable name, this catches a *name* resolving to nothing. Both are wanted.

> Verified by removing a `KNOWN` entry and by injecting a fabricated token — both
> failed the gate; the same token with a fallback passed. A gate that has only ever
> exited 0 has not been tested.

> **The pattern across §4.1.5, §4.1.7 and this section is one defect wearing three
> costumes: a Carbon class that needs a partner class to mean anything.**
> `docs/carbon-co-classes.json` catches the cases the web components demonstrate.
> It did NOT catch `checkbox-wrapper` or `btn-set`, because those pairs never appeared
> together in a rendered sample — the components render one variant, not every
> composition. The map narrows the gap; it does not close it.

**Namespace shape.** `$prefix: "rux"` yields Carbon's own BEM variant —
`.rux--btn--danger`, prefix and block joined by `--`. This differs from rux-ui's
`.rux-card`, and it SHOULD be accepted rather than post-processed: rewriting to a single
dash is exactly the find/replace this step exists to avoid, and it would put the
convention back out of Carbon's reach for the rest of the strip. rux-ui is frozen and
never loaded alongside this system, so the shared `--rux-*` namespace cannot collide in
practice. If the two must ever coexist, `$prefix` is the single place that changes.

#### 4.1.11 Inferred markup, and the wrong reference for it

Review feedback: *the tabs are painting an extra border on hover and select.*
Correct, and it was ours. `@carbon/react` puts **both** `--tabs__nav-item` and
`--tabs__nav-link` on one button:

```js
cx(`${prefix}--tabs__nav-item`, `${prefix}--tabs__nav-link`,
   { [`${prefix}--tabs__nav-item--selected`]: selectedIndex === index, … })
```

The fragment nested them instead. `--nav-link` sets `border-block-end: 2px solid
border-subtle` (css/rux.css:23901); `--nav-item--selected` (:23976) and the hover
rule (:23964) set their own 2px and both come **later**. On one element they
override it — one line that changes colour. On two nested boxes they cannot
override anything, so the outer border painted below the inner one and every
hovered or selected tab drew 4px of doubled edge.

> **§3 is wrong for structure, and this is the correction.** It names
> `@carbon/web-components` as "the only place Carbon's markup structure exists
> outside React". For **light-DOM class placement it is the wrong reference**:
> `cds-tab` renders an `<a>` in shadow DOM and never emits `--nav-item` at all.
> `@carbon/styles` is the CSS `@carbon/react` consumes, so **React is
> authoritative for structure**; web components remain the better reference for
> ARIA wiring and keyboard contracts, which React buries in hooks. Read the
> rendered DOM rather than the JSX — the conditionals are where the guessing
> creeps back in.

**Only 5 of 64 fragments were ever quarried** — multiselect, text-input,
combo-box, date-picker, dropdown. The rest were inferred from CSS selectors, and
inferring nesting from a descendant selector is the mistake §4.1.7 exists to
prevent. Tabs is what that costs.

**`tools/check-compound.mjs` (new) narrows the search.** Carbon writes `.a.b`
when both classes belong on one element; if a fragment splits such a pair across
two, that is this defect. 173 structural pairs, and reconstructing the old tabs
markup it flags the bug. Two more real defects came out of its first run:

- **inline-loading had its status classes on wrappers, not on the icon.**
  `--checkmark-container` sets `fill` (:18614) and `--error` sets `block-size`,
  `inline-size` and `fill` (:18639) — all icon properties, inert on a `<div>`.
  React puts both on the SVG itself. Worse, the fragment carried
  `__checkmark` (:18626), stroke-animation styling for an inline path Carbon no
  longer renders: its `fill: none` erased the tick outright. Neither `__checkmark`
  nor `__svg` is emitted by React here; both were dropped.
- **dialog split `-content` from `-scroll-content`.** Carbon defines the compound
  and **no** descendant form (:13719). `-content` owns `overflow-y: auto`,
  `-scroll-content` owns the fade mask — so nested, the mask sat on an element
  that does not scroll and never tracked the scroll position.

The third finding, `tree-leaf-node` + `--with-icon`, was not a bug: Carbon styles
a leaf that has an icon and nothing demoed one. **That is the pattern to keep** —
a finding is answered by merging the split or by demoing the combination, never
by an ignore list. The checker carries no entries, and if a case ever needs one it
should be demoted to a diagnostic instead.

What it still cannot see: pairs Carbon never writes as a compound selector, wrong
nesting *order*, a missing wrapper, or the wrong element type. It narrows the
field for a reference diff against React; it does not verify structure.

**Multiselect was the first fragment done by reference diff, and it justified the
method.** Reading the class tree out of the rendered React story found six faults
no gate could see — several of which I had already "fixed" twice by inference:

| Was | Actually |
|---|---|
| no wrapper | `__wrapper` + `list-box__wrapper`, label inside |
| no `__field--wrapper` | one, holding the tag and the field as **siblings** |
| `__selection--multi` badge | `.rux--tag.rux--tag--filter.rux--tag--high-contrast` |
| `div` field | `<button role="combobox">` |
| `div` menu and items | `<ul>` of `<li>` |
| one bare `checkbox-wrapper` | bare wrapper **around** `form-item checkbox-wrapper` |

Both badge forms are fully styled in our CSS, so no amount of reading selectors
could have chosen between them — `.rux--multi-select .rux--tag` (:15588) is the
only tell, and it is one line. **That is the argument for the DOM diff over
reading CSS or JSX.** It also retired `--dropdown--lg`, which Carbon never emits
here: size is `--layout--size-md`, and `--list-box--md` is dropped because
@carbon/styles defines no rule for it and check-classes would fail on a class
that does nothing.

> **The checker gained one rule from this.** Our own new markup tripped it on
> `--tag` + `--layout--size-md`, a false positive: Carbon writes
> `.a.b, .a :where(.b)` — one rule meaning "b carries the token itself OR
> inherits it from ancestor a". Both are correct markup, so pairs written that
> way are excluded (165 pairs, down from 173). A *plain* descendant alternative
> does not exonerate — tabs has one and its nesting was still wrong.

Still unverified and marked as such in the fragment: the filterable variant,
which is a separate story. `sink/fluid.html` still carries the old
`__selection--multi` badge and has the same defect pending its own diff.

#### 4.1.12 The reference emits classes its own stylesheet does not define

`ui-shell` was quarried in the same round as §4.1.11 and carried three classes
straight out of the rendered DOM that `@carbon/styles` defines **nowhere**:

| Copied | What actually styles it |
|---|---|
| `--btn--lg` ×2 | nothing — `lg` is the unclassed default; the size here is `--layout--size-lg` |
| `--side-nav__icon--small` ×2 | nothing — the chevron is the compound `.--side-nav__icon.--side-nav__submenu-chevron` (css/rux.css:26099) |
| `--text-truncate--end` ×2 | nothing at that spelling — the stylesheet writes `--text-truncate-end`, one dash, and only as `.--side-nav a.--header__menu-item .--text-truncate-end` (:26218) |

All three are dropped or corrected, on the §4.1.11 precedent that retired
`--dropdown--lg` and `--list-box--md`. The two removals are provably inert:
computed box, padding, colour, `flex` and `transform` on both header actions and
both chevrons are byte-identical before and after. `--text-truncate--end` is
respelled rather than deleted, since the class is real in the collapsed-header
case; it still styles nothing while the menu bar sits in the header, and the
fragment says so.

**The extraction method is not weakened by this — it is bounded by it.** Reading
the rendered DOM is still the only way to get *structure* right (§4.1.11), but
not every class in that DOM is live. Carbon ships dead ones: its own co-class
extraction already files `cds--btn--lg` under *"size pairing is advisory"*
(`docs/carbon-co-classes.json`). So the DOM gives the shape and `check-classes`
filters it — quarry first, then let the gate delete what the stylesheet does not
back. Neither step substitutes for the other.

**`f9f5414` shipped with `npm run verify` failing.** The six occurrences were in
the committed `kitchen-sink.html`; the gate was red at HEAD and stayed red until
this entry. The only hook installed is `commit-msg`, which checks the message and
nothing else — no hook runs `verify`. Recorded rather than fixed: a `pre-commit`
gate is a Phase 8 decision (§4.8), not a fix to slip in here.

#### 4.1.13 Every fragment now says where its markup came from

§4.1.11 asked which fragments had been quarried and the answer had to be
reconstructed from commit messages, because the fragments did not say. Each of
the 64 now carries a one-line `<!-- PROVENANCE: … -->` as its first comment,
under the `<h2>`. Three values, ordered by how much the structure can be trusted:

| Value | Means | Count |
|---|---|---|
| `rendered-dom` | class tree read out of the live React page — authoritative (§4.1.11) | 2 |
| `source` | read from an implementation: `@carbon/react` `.tsx`, a web-component `render()`, or shadow DOM | 7 |
| `inferred` | structure read off CSS selectors, never diffed against any reference | 55 |

`rendered-dom` is **multiselect** and **ui-shell**, and that is the whole of it.
`source` is date-picker, dropdown, combo-box, text-input (shadow DOM — the
reference §4.1.11 demoted for light-DOM class placement), plus tabs and
inline-loading (React `.tsx`) and notification (a web-component `render()`).

**The commit record overstated this.** `f9f5414` says nine fragments "now match
the rendered React DOM"; only two of them record a rendered reference. dialog,
grid and treeview are labelled `inferred` and say so on the line — dialog and
treeview were corrected by `check-compound` reading the CSS, and grid's notes are
about tokens, not structure. Where the commit and the fragment disagree, the
fragment is labelled down, since over-marking costs a redundant diff and
under-marking silently blesses markup nobody checked.

**The remaining 55 are the Phase 1 tail, and this is the list:**

```
accordion action-set ai-label aspect-ratio badge-indicator breadcrumb
buttons card chat-button checkbox code-snippet combo-button contained-list
content-switcher copy-button dialog file-uploader fluid grid icon-indicator
links list list-box loading menu menu-button modal number overflow-menu
page-header pagination popover progress-bar progress-indicator radio resizer
search select shape-indicator side-panel skeleton slider slug stack
structured-list table tags textarea tile time-picker toggle toggletip
tooltip treeview truncated-text
```

Two carry a known defect on the line rather than in a commit message: `fluid`
still has the old `--selection--multi` badge (§4.1.11), and `truncated-text` has
the unfixable button reset (§4.1.5).

The sweep is comment-only — 77 lines added, none removed, no markup touched, and
`verify` is unchanged at 64 sections · 567 classes · 0 undefined.

**`tools/check-provenance.mjs` (new, seventh in `verify`) keeps the labels
honest.** A label nobody enforces drifts the first time a fragment is added, so
the gate checks five things, all of them universal rules needing no entries:
every fragment carries a PROVENANCE comment; its kind is one of the three; the
comment is the **first** one in the fragment rather than buried in a wall of
notes; `rendered-dom` and `source` **name what they were read from**, because a
verification claim with nothing after it is an assertion; and `rendered-dom`
carries a date, because the live page it cites moves and the claim expires with
it. All seven failure modes were exercised against fixtures before wiring it in.

**It does not fail on `inferred`, and that is deliberate.** A gate that went red
while any fragment was unverified would be red for the whole of Phase 1 with no
action available most days, and a red gate nobody can turn green gets bypassed —
`f9f5414` already shipped through a red `check-classes`. So it measures
declaration, not verification. It is blind to whether a label is *true*: a
fragment can claim `rendered-dom` against a story nobody opened and the gate
exits 0. Same bargain as `check-coverage`, which proves a component is exercised
and not that its markup is right.

`--rendered-dom`, `--source` and `--inferred` print the fragment names, so the
extraction checklist is a command rather than a list in this file that goes
stale:

```bash
node tools/check-provenance.mjs --inferred
```

#### 4.1.14 Where the markup for the remaining 55 actually comes from

§4.1.13 produced the checklist; this is the source for working it. Two sources,
answering different questions, and the docs site joins them: the "Live demo" on
a component's Code tab is a `<StorybookDemo>` iframe pointed at
react.carbondesignsystem.com, with a hand-curated variant list wrapped around
it. Its variant selector is a story picker.

**What to demo** — `carbon-website/src/pages/components/*/code.mdx`. 43 pages,
187 `<StorybookDemo variants={[…]}/>` entries, **182 unique story ids**, all
`components-` prefixed. This is IBM's own answer to which states are worth
showing, offline and already in the quarry. **40 of the 55 `inferred` fragments
sit behind one of these pages**; 15 do not.

**What markup to write** — the Storybook itself: `/index.json` for the
catalogue, `/iframe.html?id=<story>` for the DOM. Fetched 2026-08-27: **505
stories**. `tools/extract/react-dom.js` already automates the whole harvest and
has never been run — `docs/markup/` and `docs/components/` are empty.

**Its filter would silently skip the 15.** `FILTER = /^components-/` takes 418
of 505 stories. Prefixes are components 418 · preview 42 · elements 33 ·
deprecated 6 · layout 2 · hooks 2 · helpers 1 · utilities 1, and the 87 it drops
are exactly where the orphans live:

| Fragment | Where its story actually is |
|---|---|
| `grid` | `elements-flexgrid--*` |
| `stack` | `layout-stack--*` |
| `chat-button` `icon-indicator` `shape-indicator` `truncated-text` | `preview-*` |
| `page-header` | `deprecated-preview-pageheader--default` — deprecated upstream |
| `action-set` | `components-button-set-of-buttons--*` |
| `card` | `components-tile--*`; Carbon has no Card |
| `skeleton` | not a component — a `--skeleton` story on each of 39 others |
| `badge-indicator` | only `components-iconbutton--with-badge-indicator` |
| `resizer` | **nothing.** No story matches it by id or title |

`resizer` and `page-header` need a decision before either is diffed, not after.

**Harvest the 182, not the 505.** The iframe-per-story pattern retains about
1.1 MB per story — linear over the first 99, measured against
`performance.memory` — so 505 lands somewhere between 550 MB and 1.2 GB against
a 4096 MB renderer cap. It would not crash, but the curated 182 costs roughly
200 MB in one tab and needs no chunking at all.

Two measurements worth keeping, because both contradict the obvious fix:

- **A reload does not reset the heap; a fresh tab does.** Same-origin
  navigation reuses the renderer — 293 MB before a reload, 309 MB after, 34 MB
  in a new tab. Any chunking has to be per tab.
- **Blanking each frame before detaching showed no benefit.** The theory was
  that pending timers pin the realm. It measured worse, but on a different and
  heavier story slice from a higher starting heap, so the honest reading is *no
  demonstrated benefit*, not *harmful*. Not adopted: a fix whose mechanism will
  not reproduce is not a fix.

Run it in a visible tab. Hidden, background throttling stretched a 60-story
batch past 30 seconds.

> **Amended 2026-08-27 — the extractor has now been run, and two of the
> paragraphs above are superseded by measurement rather than estimate.**
>
> **"Harvest the 182, not the 505" is withdrawn.** All 505 were harvested in one
> visible tab: 84 seconds, **2.4 GB peak heap** against the 4096 MB cap, zero
> failures. The 1.1 MB/story figure extrapolated from the first 99 was low by
> roughly half — the real cost is nearer 4.8 MB/story — but the conclusion it
> supported ("it would not crash") held, and the curated subset is no longer
> worth the loss of coverage. Chunking is still the answer if a future Carbon
> outgrows the cap, and it still has to be per fresh tab.
>
> **The `FILTER` repair is not a wider prefix list.** Every one of the eight
> prefixes yields `cds--` markup — `hooks`, `helpers` and `utilities` included,
> which is what an allow-list drafted from this section's table would have
> excluded. 505 of 505 rendered Carbon classes, so no exclusion is defensible
> and the default now excludes nothing. `FILTER` remains only as a narrowing
> knob, and a narrowed run now says on the console what it skipped.
>
> Two further facts the run established. **Six of the 182 curated ids no longer
> exist** in the live index — `search--disabled`, `button--set-of-buttons`,
> `datatable--skeleton`, `ailabel--explainability-popover`,
> `fluidtextinput--default-with-tooltip`, `progressbar--example` — so this
> section's 182 is really 176 reachable. And **`skeleton` is a story on 32
> others, not 39.**

### 4.2 Phase 2 — Inventory

Per component, record: compiled size, its `@use` graph, the tokens it consumes, and a
disposition of **KEEP / CUT / DEFER**. All 75 get a row and a one-line reason.

Whole families that are likely single decisions rather than 10 decisions:

- `fluid-*` — 10 components; a duplicate input treatment
- `ai-label`, `slug`, `chat-button` — AI affordances
- `*-skeleton` states, `expressive` variants, `compat/`, `feature-flags`

Exit: `docs/inventory.md`, 75 rows, every row decided.

### 4.3 Phase 3 — The strip

Under §1.1's keep-core rule the strip is **selection, not surgery**. Every cut is a line
in `src/app.scss` or a config value; nothing reaches inside a Carbon component. Three
passes, each verified against the kitchen sink and committed separately so a regression
bisects cleanly.

1. **Whole components.** 75 → ~24. The `fluid-*` family (10) and the AI affordances
   (`ai-label`, `slug`, `chat-button`) are single decisions, not thirteen.
2. **Optional layers never opted into.** `compat/` (the v10 shim), `feature-flags`, and
   the flexbox grid — all off by default, all confirmed absent by grepping the build.
   Declining an opt-in is not surgery.
3. **Themes.** 4 → 2 (light, dark).

> **Amended 2026-08-26.** This phase had a fourth pass — cutting the layout-context
> `clamp(max(var(…)))` indirection — and it is **deleted**, because §1.1 forbids it and
> §2.1 shows it was never needed: that machinery is what gzip eliminates almost entirely.
>
> A second drafting error is worth recording. The original pass 2 listed expressive
> variants, skeleton states, and high-contrast blocks as cuttable. **They live inside
> component files**, so removing them was already forbidden by this phase's own
> "MUST NOT edit in place" rule — the pass contradicted the paragraph directly beneath
> it. What survives above is the part that was actually just configuration.

**The reproducibility property this preserves:** because no Carbon file is edited, the
entire system rebuilds from a clean `npm install` plus `src/app.scss`, and a Carbon
version bump is a version bump rather than a re-merge.

### 4.4 Phase 4 — Devendor

**The one-way door. RUNS LAST, after Phase 6** — see the amendment below.

Scripted, executed once, in a single commit.

1. Compile SCSS → plain CSS. The CSS becomes the source; the SCSS is deleted.
2. Remove every `@carbon/*` dependency.

Exit: `npm ls` shows no `@carbon` packages; the kitchen sink is pixel-identical to the
Phase 3 screenshots.

> **Amended 2026-08-26. This phase was drafted with a third step — a scripted
> `--cds-*` → `--rux-*` rename — and it is deleted, not moved.** Carbon's `$prefix` is
> configurable (§4.1 step 1), so the namespace is correct from the first build and there
> is no rename to perform, here or anywhere. A build with `$prefix: "rux"` was diffed
> against the same build with `$prefix: "cds"`: **byte-identical after a prefix swap**,
> 98,396 bytes either way.
>
> Two consequences worth stating. **The riskiest irreversible step in the roadmap simply
> does not exist** — what remained was mechanical, and Phase 4 is now a build change
> rather than a rewrite. And because `cds` and `rux` are both three characters, **every
> figure in §2 holds unchanged**; none of the baseline needed re-measuring.

> **Amended 2026-08-28. This phase moves to the END of the sequence, after Phase 6.**
> It was drafted to run before Behaviors and Templates. It is a build change, not a
> rewrite (see above), so its position costs nothing — and running it early costs a
> great deal, because **what this door closes is the component set.**
>
> **Most of what this phase is for is already banked.** §1's goal is "no Carbon at
> runtime or in the tree", and the runtime half holds today: the built CSS contains
> zero occurrences of `cds`, `@carbon` appears only in `devDependencies` — there are no
> `dependencies` at all — and `css/rux.css` is committed, so a consumer fetches it from
> a raw URL and installs nothing. What remains is the tree, which is a property of this
> repository rather than of the thing it ships.
>
> **What the door closes, concretely.** Six tools read `node_modules/@carbon`. After
> this phase there is no adding or restoring a component (`data-table/sort` was one
> uncommented line), no adding an icon to the sprite, no theme change, no pricing a
> subset with `tools/measure.mjs`, no capturing a reference story that Phase 1 did not
> already capture, and no Carbon version bump — which spends the reproducibility
> property §4.3 bought by never editing a Carbon file.
>
> **The evidence that decided it.** `data-table` shipped unable to sort, expand or
> batch-select, because Carbon splits it into four modules and the manifest took one.
> Nothing found that until the sink tried to demo sorting on 2026-08-28. Phase 6 builds
> five more page shapes, and each can find the same class of gap. Six DEFER rows in
> `docs/inventory.md` also defer their decision to Phase 5 or Phase 6 explicitly — under
> the old order those phases ran after the door, so the plan could not honour its own
> decisions.
>
> **What would move it earlier:** needing a change Carbon does not expose as
> configuration. §1.1's keep-core rule forbids editing a component file, so the day a
> real requirement cannot be met by `$prefix`, a flag, or module selection, this phase
> becomes the prerequisite rather than the epilogue.

> **The first gap Phase 6 found, 2026-08-28: `stack`.** The amendment above said "Phase
> 6 builds five more page shapes, and each can find the same class of gap." The third
> page shape found one, and it is the cheapest row in `docs/inventory.md`.
>
> **What is missing.** `templates/form-page.html` is the first page in the repository
> with a form on it. Carbon spaces a form with `stack-vertical stack-scale-7`;
> `src/app.scss:108` has `@use "@carbon/styles/scss/components/stack"` commented out,
> and `.rux--form-item` carries no vertical margin of its own. A form built from the
> compiled set has **no vertical rhythm at all**.
>
> **The evidence, read live rather than reasoned.** `components-form--default` on
> react.carbondesignsystem.com, 2026-08-28: the stack computes to `display: grid` with
> `row-gap: 32px`, and every child reports `margin-block-start: 0`. Carbon zeroes its
> controls' margins on purpose and spaces from the container — which is why a
> margin-based stand-in cannot work. The first attempt lost to `.rux--checkbox-group`'s
> own `margin: 0`, (0,1,0) against (0,0,2), and the gap measured zero. The template's
> `<style>` block now uses the grid mechanism instead, and is a stand-in, not an answer.
>
> **Why the stand-in is the wrong home.** It has to be repeated in every template that
> holds a form, it is one specificity accident away from silently collapsing again, and
> a design system whose spacing lives in its templates is not the source of its own
> spacing. `templates/app-shell.html` already carries one such rule for the content
> inset, where Carbon genuinely ships nothing — this one is different, because Carbon
> ships the answer and the manifest declined it.
>
> **The plan, when it is approved.** It is the three-line restore README describes, plus
> the consequences:
>
> 1. Uncomment the `@use` at `src/app.scss:108`.
> 2. `npm run build` — expect +1 KB and +15 classes; 0 new tokens.
> 3. In `templates/form-page.html`, wrap the form's items in
>    `<div class="rux--stack-vertical rux--stack-scale-7">`, which is what
>    `components-form--default` renders, and **delete the `<style>` rule** and the note
>    that explains it.
> 4. `npm run verify`. `check-classes` resolves the two new classes; `check-coverage`'s
>    denominator grows by 15, so the ratchet needs `npm run coverage:update` and the
>    figure in README moves.
> 5. Update the component count, class count and size figures in README, and flip the
>    `stack` row in `docs/inventory.md` from DEFER to KEEP.
>
> **The alternative, stated so it is a choice.** Keep the stand-in and spend the 1 KB
> nowhere. That is defensible only while forms are rare; the moment a second template
> holds one, the rule is duplicated and the system is no longer the source of its own
> spacing. **Not decided here — this is rux's call**, and `docs/inventory.md` item 4
> carries the same entry from the catalogue's side.

### 4.5 Phase 5 — Behaviors

Write vanilla modules against the DOM and ARIA contracts read out of the Lit templates.

rux-ui's shape is proven and SHOULD be followed: an **overlay kernel loaded first**,
owning outside-press, Escape, and focus trapping, with menu, popover, drawer and shell
all delegating to it. 12 modules, 86 KB. This is the one phase where rux-ui is worth
reading directly, even though this project is not extracted from it.

Exit: keyboard and screen-reader passes on every interactive component in the sink.

> **Keyboard pass run 2026-08-28. `tools/check-a11y.js` — 0 findings, 5 notes.**
> Every idref resolves, every composite (menu, tablist, listbox) exposes exactly one
> tab stop, every visible control has an accessible name, and every role that promises
> state carries it. The five notes are specimens: menu.html demos four densities and
> list-box.html the expanded primitive, none with a trigger, because what they
> demonstrate is the CSS.
>
> **IT FOUND A DEFECT NOTHING ELSE HAD.** Four of those specimens were
> `visibility: hidden; opacity: 0` — `.rux--menu` at rest — so they rendered as blank
> space, 177px of it for the icons demo, for as long as the fragment had existed. The
> fragment's own comment claimed they were "visible at rest". Asking why a `role="menu"`
> had no reachable items turned up a menu nobody could see either.
>
> **THE SCREEN-READER HALF IS NOT DONE AND CANNOT BE DONE HERE.** This tool reads the
> attributes an assistive technology would use; it does not run one. Two further checks
> are also out of reach in an automated browser, and the tool now says so rather than
> guessing: the focus-ring check needs `document.hasFocus()`, which is false in a
> headless pane — its first run reported 167 controls as having no focus style,
> including plain buttons Carbon quite clearly styles — and real key delivery does not
> work there either, so Tab order was computed rather than walked. **§4.5 stays open
> until a human runs VoiceOver or NVDA over the sink and tabs through it by hand.**

> **Started 2026-08-28. Four decisions, recorded before the modules multiply.**
>
> **1. The markup is the API.** rux-ui exposes `RuxMenu.open(trigger, menu)` because an
> application calls it. This system's consumer generates MARKUP and never writes the
> call, so a module must attach itself: a trigger carrying `data-rux-open="<id>"` opens
> the surface with that id, and `data-rux-close` inside it closes. A page built from a
> Phase 6 template MUST work with no script of its own. The imperative entry points stay
> (`Rux.modal.open`), but as the second door, not the first.
>
> **2. `data-rux-*` is ours, and it has to be.** Carbon's behaviour contract is React
> props, which have no HTML equivalent to copy — this is the one part of the system with
> no reference to diff against. The attribute names are the only invention; every CLASS
> the modules touch is still Carbon's, and `check-classes` now reads `js/` so a renamed
> class fails the same gate it always did.
>
> **3. No positioning engine, which is a finding rather than an omission.** rux-ui needed
> one because it placed surfaces itself. Carbon places them with classes — `popover--bottom`
> and its fifteen siblings are static CSS. Only `popover--auto-align` needs measurement,
> and no template asks for it yet. The overlay record carries an optional `reposition()`
> for the day one does.
>
> **4. No portaling.** rux-ui promoted portaled surfaces above their owning modal with a
> data attribute. Carbon's light-DOM markup keeps every surface inline beside its trigger,
> so there is no second stacking context and nothing to promote.
>
> **The harness shrinks as the modules land.** `sink/harness.js` drives what Phase 5 has
> not reached; every module deletes its section there, and the phase is done when that
> file is empty. Modal went first and took the dead side-panel code with it.
>
> **5. A tooltip registers passively.** `dismissOthers: false` was added to the kernel
> for it: a hover tooltip appears because a pointer crossed it, not because anyone chose
> it, so it must not tear down a menu the user is working in. It still joins the stack,
> so Escape reaches it first and an outside press still clears it. This is the one place
> where "opening dismisses what is above" is the wrong default.
>
> **6. `data-rux-open` is ONE contract, claimed by whoever recognises the surface.**
> modal and menu both listen for it and each acts only on the surfaces it knows —
> `.rux--modal`, `.rux--menu`. A component whose trigger and surface sit together in the
> markup (popover, overflow menu) needs no attribute at all, and does not get one.
>
> **7. Not every element carrying a component's class is a control.** `list-box.html`
> demos the PRIMITIVE — a specimen of the expanded state whose `__field` is a plain
> `<div>`, because Carbon's ListBox alone is not interactive — while `dropdown.html`
> gives it a `button[role=combobox]`. A module must claim by the interactive element,
> not by the root class, or it fights markup that is deliberately rendered open. And
> where markup DOES declare a live component open, the module adopts that state at load
> rather than contradicting it, so the first click does what the page looks like it
> offers.
>
> **8. A module may need markup the fragment never had.** Tabs had no `tabpanel`, so
> `aria-controls` promised nothing; the panels went in with the module, from the same
> story, as siblings of `.rux--tabs`. Phase 5 is allowed to complete a fragment when the
> behaviour is what makes the missing part meaningful — recorded in the fragment, like
> any other change.
>
> **9. A module is allowed to be small, and to say why.** Accordion adds `aria-controls`
> and adopts the markup's state, and that is all: the heading is a real `<button>` so
> Enter, Space and disabled are the browser's, and the panel is `display: none` until
> `__item--active`, so a collapsed section is already out of the accessibility tree.
> Arrow keys are OPTIONAL in the APG and absent from Carbon React, so they are absent
> here — adding them would be this system inventing behaviour rather than making
> Carbon's work. "It barely does anything" is a smell only when nobody has checked.
>
> **10. A derived state still belongs in the markup when it is the initial one.**
> `batch-actions--active` was removed on the theory that the module derives it, and
> check-coverage's ratchet caught the cost immediately: a class applied only at runtime
> is invisible to a gate that reads static HTML. The markup declares the state the page
> loads in and the module maintains it from there — the arrangement accordion, list-box
> and data-table all now use.
>
> Landed: `js/overlay.js` (the kernel), `js/popover.js`, `js/menu.js`, `js/list-box.js`,
> **11. Glyphs are a blind spot no gate covers.** The DOM captures record classes,
> elements and attributes, and never which icon a `<use>` points at — so a fragment can
> pass every gate with an arrow pointing the wrong way, which accordion and the table's
> expand chevron both did. Where CSS rotates an icon, the base glyph is arithmetic:
> read the rotations and solve for the direction that makes both states correct.
>
> **12. The kernel's default is wrong twice, in opposite directions.** A hover tooltip
> must not dismiss what is below it (`dismissOthers: false`); a side nav must not be
> dismissed by a press outside it (`dismissOn: { outside: false }`), because a nav panel
> is part of the page rather than a surface floating over it. Both are one-line opt-outs
> on a default that is right for everything else, which is the shape a good default has.
>
> Landed: the kernel, `popover`, `menu`, `list-box`, `tabs`, `accordion`, `data-table`,
> `form-controls` (toggle, number steppers, search clear, checkbox indeterminate),
> `ui-shell`, `dismiss`, `tile` and `modal`. **EVERY MODULE THIS PHASE NEEDS IS
> WRITTEN.** What is left of §4.5 is its exit criterion, which is not code: a keyboard
> and screen-reader pass over every interactive component in the sink.
>
> **14. The 90 KB JS budget needs a unit before it can bind.** The files measure 83.5 KB
> raw — close enough to look alarming — but **46% of that is comment**, the code alone
> is 45 KB, and gzipped the whole set is 22.7 KB. §2.1 removed the CSS target after
> establishing that a number nobody downloads is the wrong thing to measure; the same
> argument applies here, and the budget should say gzipped or say nothing. Flagged
> rather than amended: it is the author's call, exactly as the KB target was.
>
> **15. An inline style is right when no class can express the state.** ui-shell's note
> says a behaviour layer should never write widths — and it should not, when a class
> already says it, as `side-nav--hidden` did. Tile is the exception that proves it:
> `tile-content__below-the-fold` is `visibility: hidden`, which still OCCUPIES LAYOUT,
> so a collapsed tile stood as tall as an expanded one and reserved 48px for content
> nobody could see. The collapsed height depends on the content, so it cannot be a
> class, and Carbon's React sets the same inline value for the same reason.
>
> **13. Removing an element is a focus decision.** Dismissing the box that holds focus
> drops the user at `<body>` — the top of the document — and clearing three filter tags
> in a row is exactly when that hurts. Focus moves to the next dismissible in the group,
> or the previous one when the last goes, or the group itself when nothing is left; that
> last case needs `tabindex="-1"` on the group, programmatically focusable and never a
> tab stop. Popover carries tooltip and menu carries
> overflow-menu — in both cases one mechanism with two triggers, and the mode read off
> the markup. `select` needs nothing: Carbon's Select is a native `<select>`.
> Remaining, roughly in dependency order:
> list-box (dropdown, select) · accordion · tabs · data-table (sort, expand, select-all) ·
> notification and tag dismiss · number-input · search clear · tile · ui-shell.
>
> **16. A hidden thing has to be hidden from every sense at once, 2026-08-28.** The
> closed batch bar was `clip-path`-ed off the screen and `aria-hidden` to the
> accessibility tree, and its three buttons were still tab stops: focus went somewhere
> invisible that announced nothing. Read from running Carbon
> (`components-datatable-batch-actions--default`): closed is `aria-hidden=true` with
> every button at `tabindex="-1"`, open is `aria-hidden=false` with every button at
> `0`. js/data-table.js now moves the tabindex with the aria-hidden, since both derive
> from the same count.
>
> **The captures could not have answered this, and neither could the sink.**
> `tools/extract/react-dom.js` records `role` and four aria attributes; `aria-hidden`
> and `tabindex` are not among them, so the capture's silence meant nothing — checking
> the extractor's allowlist before reading the capture as evidence is the step that
> stopped a wrong conclusion here. And the sink ships the bar OPEN, because a specimen
> has to show the state statically for check-coverage; the defect only exists CLOSED,
> so `check-a11y` read 0 findings on the sink for as long as the bug lived.
>
> **It took a consumer page to surface it** — the §4.6 third exit attempt, whose
> dashboard shipped the bar closed. That page was never edited, and it now reports 0
> findings instead of 3 purely because the module repairs the attribute at load. A gate
> pointed only at the reference page measures the states the reference happens to hold.

#### The screen-reader pass — run 2026-08-30

**The exit criterion's second half, and the only §4.5 task no tool here performs.** Four
recordings, VoiceOver on Safari, white theme, caption panel on, transcribed from the
frames rather than from memory: 724 announcements in 13 minutes. The recordings are in
`.brand/` (gitignored); `docs/screen-reader-pass.md` holds the filled sheet.

| Pass | Length | Covered |
|---|---|---|
| `VO`+→ walk | 4m48s, 244 announcements | rows 1-8, buttons to toggle |
| Tab | 3m25s, 244 | the whole tab cycle, rows 1-24 bar modal and popover |
| Arrow keys in tablists | 2m20s, 103 | every tablist, and table cell navigation |
| Tabs again + progress re-check | 2m23s, 133 | the fix, verified by ear |

**TWO DEFECTS, ONE FIXED.**

**Progress steps announced as disabled — fixed at `17a61c2`.** Heard "First step
Complete, dimmed, button" and "Signing Current, dimmed, button": every unclickable step
claimed to be unavailable. Carbon puts `aria-disabled` on exactly one of the five
unclickable buttons in `components-progressindicator--default` — the step that also
carries `--progress-step--disabled` — and ours put it on all of them. **The fragment's
own note asserted the wrong rule**, which is why the markup shipped, and it is corrected
in place. Re-heard after the fix: "First step Complete, button", no "dimmed", while
"Disabled step Disabled, dimmed, button" still says it. The first red-to-green this
project has on a defect found by listening.

It was doing a second harm nobody could see. `check-a11y.js:45` skips any element
carrying `aria-disabled`, so those seven buttons were never examined by the focus-ring
check at all; the sink's reading moved 1 → 8 when the attribute went, and the red run
moved 141/1 → 148/8. **A wrong attribute can hide controls from the gate that would
have caught it.**

**Toggle announces its name twice — OPEN.** Heard "On On, on, switch" and "Off Off, off,
switch". `aria-labelledby` on the switch points at the whole `<label>`, which holds both
`toggle__label-text` and the state span `toggle__text`, so the name computes to both and
a reader hears the word three times. **Not adjudicated, and the captures cannot settle
it**: `aria-labelledby` is not among the four aria attributes
`tools/extract/react-dom.js:388` records — the same allowlist this section already cites
for `aria-hidden` and `tabindex`. It needs a running Carbon page, per
`docs/verifying-templates.md`.

**Three lesser findings, recorded not fixed.** Sortable column headers announce no sort
state, because `aria-sort` sits on the `<th>` and Tab lands on the button inside it.
Eleven notification close buttons are all just "Close", with nothing naming what each
dismisses. The textarea's character count announces its label with no number.

**A PREDICTION WAS WITHDRAWN, AND THE FAILURE IS WORTH MORE THAN THE FINDING WOULD HAVE
BEEN.** Four buttons in `#tabs` were predicted to have no accessible name. All four carry
`aria-label="Close tab"`. The claim came from a browser query that read the PARENT's
`aria-label` and the button's `textContent` and never read the button's own — a check
that could not have found what it was looking for. Three recordings were made hunting
it, each missing it for a different true reason: Tab cannot reach a `tabindex="-1"`
element, and arrow keys inside a tablist visit `[role="tab"]` only. Every reason was
correct and none of them mattered. A prediction drawn from a query is worth no more than
the query.

**Cleared by ear, each heard rather than assumed:** disabled buttons say "dimmed";
checkboxes announce mixed and invalid; radios announce position and dimmed; toggles are
switches; live regions announce with their role; the hidden "Beginning of notification"
strings land either side of the content; pagination reads "1 , Page of 9 pages"; tabs
give position, selected state, group name and panel; the table gives "4 columns, 3 rows"
and per-row select labels; dropdowns announce as combo boxes with expanded and invalid
states. **And the side-nav fix from `643a20e` was confirmed by listening** — "Documents,
expanded, button, list 4 items", where before it was a menu containing no menu items.

**WHAT THIS PASS DID NOT COVER**, which is the half that matters:

- **VoiceOver on Safari only.** No NVDA, no JAWS, no Windows. A finding here is macOS's
  as much as ours.
- **White theme only.** Colour cannot change an announcement, but that is reasoning, not
  a reading.
- **Modal and popover were never opened**, so nothing was heard about a dialog's name on
  open, focus landing inside it, or whether the page behind goes silent. That last is a
  common defect and remains untested.
- **Forced colors is unmeasured**, as it was for the focus-ring sweep.
- **The automated pane cannot activate a button by key** — Enter and Space deliver
  `keydown` and `keyup` with no `click` — so anything that must be opened before it can
  be heard was out of reach of the tooling, and only reachable by hand.

**The criterion reads as met**: keyboard and screen-reader passes have both been run
over every interactive component in the sink, the findings are filed, and the boundary
above is on record. It does not require zero findings, and a clean first pass over 35
sections would have been the result most worth doubting. **Declaring the phase closed is
the author's call**, and the open toggle finding is the one thing that might reasonably
delay it.

### 4.6 Phase 6 — Templates and skeleton

**This is the actual goal.** Everything before it is preparation.

- `templates/` — complete, runnable page skeletons: app shell, form page, table page,
  detail page, empty state, error state.
- `CLAUDE.md` — context routing, not prose. Where tokens live, where templates live,
  what MUST NOT be invented.
- One skill that triggers on UI work and points at both.

The lesson to carry from rux-ui: what keeps generation on-system is a **pointer
structure with one canonical home per rule**, not more documentation. A rule stated
twice drifts.

Exit: a page shape not in `templates/` can be built by Claude Code from the templates
alone, without inventing a class.

> **First exit attempt, 2026-08-28 — NOT MET, and usefully so.** All six templates
> existed, so the criterion was run rather than assumed: build a dashboard, a shape none
> of the six covers, using `templates/` as the only source.
>
> **The class half passed.** 54 `rux--` classes used, every one of them already present
> in the six; nothing was invented and nothing was fetched from `sink/` or `docs/`. The
> 188 classes the templates carry between them were enough for a metric grid, a tile, a
> list and a link.
>
> **The page was still wrong.** The tiles rendered invisible — white on white. The
> dashboard copied `layer-two > tile` out of `detail-page.html`, faithfully, and that
> idiom is correct only where it sits: inside a tab panel already painting `layer`. On a
> plain page `layer-two` resolves to the page's own white and the tile disappears.
> Measured: tile `rgb(255,255,255)` against body `rgb(255,255,255)`, no border. Removing
> the wrapper gives `rgb(244,244,244)` and a visible tile.
>
> **So the criterion needs its second half read as strictly as its first.** "Without
> inventing a class" was satisfied; "can be built" was not. A template that encodes an
> idiom without its CONDITION teaches the idiom, and the reader gets a correct-looking
> copy of the wrong thing. `detail-page.html`'s comment now states the rule — a tile
> needs a background differing from what it sits on — instead of the snippet.
>
> Nothing else in the attempt reached outside the templates, and the built page passed
> check-a11y at 0 findings and check-runtime-classes at 0 stripped. **Re-run the test
> before calling the phase done**; one shape is one sample, and the fix has not been
> tested by a second attempt.
>
> **Second attempt, 2026-08-28 — MET, on a different shape.** A settings page: grouped
> sections, a persistent action pair, and — deliberately — a tile on a plain page, the
> exact idiom that failed the first time. 68 classes, all present in the six.
>
> **The tile came out right.** `rgb(244,244,244)` on a white page, visible, because the
> rewritten comment in `detail-page.html` states the condition rather than the snippet.
> That is the first attempt's fix tested by something other than itself. The button pair
> measured 196x48 each with no wrap, `check-a11y` 0 findings and 0 notes with the ring
> check running, `check-runtime-classes` 0 stripped and 0 added, `check-spacing` 39 of
> 41 with both divergences explained — one context the reference does not hold, one
> `:last-of-type` rule whose value is Carbon's own.
>
> **One reach outside, and it was avoidable.** `rux--fieldset` went in from memory before
> the audit caught it; `form-page.html` already shows the grouping idiom as
> `<fieldset class="rux--checkbox-group">` with a `<legend class="rux--label">`. The
> templates held the answer and were not consulted. Worth knowing that the failure mode
> is not only a missing template — it is also a present one going unread.
>
> **THAT ADJUDICATION IS WRONG, and the sixth exit attempt overturned it on
> 2026-08-29.** `rux--fieldset` was the CORRECT class and calling it an avoidable reach
> mislabelled a right answer as a mistake. Verified three ways: it is Carbon's own
> FormGroup class from `components/form/_form.scss`, compiled here with 4 rules; it
> appears in **9 capture stories** across `carbon-react-dom` and `carbon-react-spacing`;
> and `checkbox-group` is *checkbox's* class, carrying
> `.checkbox-group .checkbox-wrapper > .form__helper-text { display: none }` — so
> pointing a mixed-control group at it silently deletes the helper text under every
> field.
>
> **The reach was right; only the route to it was wrong.** Reaching from memory rather
> than from the captures is still the fault worth recording — but the entry above
> punished the destination instead of the route, and a decision log that marks a correct
> class as a mistake will make the next reader avoid it. That is the more expensive
> error of the two.
>
> **Two samples, both by the same author who knew the traps.** That is the standing
> weakness of this test and no amount of re-running by me fixes it.
>
> **Third attempt, 2026-08-28 — MET, and for the first time not by the author.** A fresh
> Claude Code agent in a clean worktree — no conversation context, no trap list, only
> what the repo records — was asked for an analytics dashboard: shell, four metric
> tiles, an Overview/Details switcher, a table of recent events. 131 classes, none
> invented, none unresolved; `check-classes` read the page alongside the templates and
> counted 0 undefined, 0 stripped. Driven in a browser: tabs swap panels, the row
> checkbox activates the batch bar, `check-runtime-classes` 0 stripped and 1 added
> (`table-sort--active`, derived exactly as table-page's comment says).
>
> **The tile rule held against a reader who was never told it.** Bare `rux--tile` on the
> white page, `rgb(244,244,244)`, visible — chosen because `detail-page.html` states the
> condition, and the page's source comment cites it. That is what the first two samples
> could not show: the templates teaching someone with no memory of the failures.
>
> **"From the templates alone" was NOT met literally, and the miss is the finding.** The
> four-across responsive tile row came from `docs/carbon-react-dom.json`
> (`elements-grid--subgrid`) — the sanctioned markup reference, but no template or
> fragment demos a responsive column row. Nothing was invented; the templates simply do
> not hold a metric-row idiom. Substitutions where the component is not compiled were
> reasonable and recorded in the page: contained tabs for the content switcher, the
> title stack for page-header. Before closing the phase, decide which reading the exit
> criterion means: the templates alone (then a grid-row idiom is missing), or the repo
> without inventing (then this attempt met it).
>
> **What the attempt surfaced beyond its page.** `check-a11y`'s 3 findings were
> inherited byte-for-byte from `table-page.html`: the inactive batch bar shipped
> `aria-hidden="true"` over three focusable buttons, a state the sink never shows
> because its bar is active. **Adjudicated and fixed the same day — a real defect, not
> a divergence; see §4.5's entry 16.** Carbon pairs the two attributes, and the
> dashboard now reads 0 findings without being edited. The
> per-file gates cannot be pointed at a consumer page: `sources.mjs` reads `sink/` and
> `templates/` only, and `check-ancestry`'s KNOWN is keyed by file, so a byte-compatible
> copy of already-adjudicated markup fails in a new file. `npm run icons` rewrites only
> `templates/*.html`, so a consumer page splices the sprite by hand and will drift
> silently. And `CLAUDE.md` carried two stale rules the agent hit — fixed the same day.
>
> **Still one author of the test's design.** The prompt and the audit came from inside
> the project; only the sample did not. Independent in execution, not yet in conception.

> **The third attempt's page was UNTRACKED** (`docs/audits.md` finding 8). `dashboard.html`
> sat in the working tree and in no commit. Everything above was a claim about a file a
> fresh clone does not contain, which contradicts README's "a fresh clone is the whole
> handover". Either commit it as the evidence it is, or delete it and let this entry
> stand alone as the record — but it should not keep being an argument resting on a file
> that is not there.
>
> **DECIDED 2026-08-29: archived out of the repository and deleted from it.** This entry
> is now the record, and it stands alone. The page itself is at
> `~/Developer/_archive/rux-ds-exit-attempts/dashboard-2026-08-28.html`, with a note
> saying what it was; it is outside every clone by intent, and nothing in this repository
> depends on it.
>
> **Why not commit it, given it is the only sample not written by the author.** Because
> committing it means adopting it. Honest evidence would need it added to four gate
> roots, covered by `npm run icons`, and given a `check-ancestry` KNOWN keyed to a new
> file — ongoing maintenance for a test that has already returned its answer. Ungated, it
> would rot: its icon sprite is spliced by hand and `npm run icons` rewrites
> `templates/*.html` only, so the glyphs were already frozen at the day it was written.
> A repository that sweeps every page does not keep one page nobody sweeps.
>
> **What the page was actually worth has already been banked.** The `aria-hidden`
> defect it surfaced is fixed (§4.5 entry 16), `CLAUDE.md`'s two stale rules are fixed,
> and the literal-versus-repo reading of the criterion is recorded above as still open.
> `portal.html` now holds the role of living consumer evidence, committed and swept by
> four gates — which is what this page never was.
>
> **What was given up, stated rather than glossed:** the markup a context-free reader
> actually chose is no longer in the repository, so a future question of the form "what
> did someone with no memory of the traps write?" is answerable only from the archive,
> and only for as long as that archive survives. That is a real loss and it was accepted
> deliberately.

> **Fourth attempt, 2026-08-29 — MET on the repo reading, and it found a defect the
> first three did not.** `portal.html`: the design system's own status page, generated by
> `tools/build-portal.mjs` from `docs/inventory.json`, `docs/coverage.json`,
> `docs/gate-coverage.json` and the gate registry. Shell, metric tiles, three tables, six
> template cards. It is gated as `kitchen-sink.html` is — added to the roots of
> `check-classes`, `check-co-classes`, `check-coverage` and `check-tokens` — and passes
> all four, so no class is invented and no token unresolved.
>
> **THE MISS IS THE FINDING, AGAIN, AND IT WAS SPACING.** The page shipped with no
> `stack-vertical` anywhere: every child of its content column measured `margin 0` and
> `gapToNext 0`, headings flush against the sections above them, six template tiles
> merged into two unbroken slabs of `layer`. It passed every gate. No gate could catch
> it — `check-spacing` compares CLASSED elements against Carbon's computed signatures,
> and the gap between an `h2` and the section under it belongs to neither element.
>
> **The templates DID teach this and the frame did not carry it.** `detail-page`,
> `empty-state` and `error-state` each open their column with
> `stack-vertical stack-scale-6`, and detail-page states the rule outright. But
> `app-shell.html` — the file §4.6 says to copy, the frame the other five are built on —
> had no stack at all. A page built from the frame inherited the fault across six
> sections. Fixed in both, 2026-08-29.
>
> **This sharpens the exit criterion's open question rather than answering it.** Attempt
> three left it: templates alone, or the repo without inventing? This attempt met the
> repo reading and needed the same subgrid tile-row idiom from
> `docs/carbon-react-dom.json` that attempt three needed, because no template still holds
> a metric-row. **A third reading is now on the table: whether the frame TEACHES what the
> templates teach.** By that reading all four attempts failed until 2026-08-29, and the
> criterion is about `app-shell.html` rather than about any sample page.

> **Fifth attempt, 2026-08-29 — MET, and its finding was an ABSENCE.** A settings page:
> three `fieldset` groups, toggles, a read-only value, a danger modal. 82 classes, 0
> undefined. The modal markup matched `sink/modal.html` exactly, including the
> `role="presentation"` / `role="dialog"` split corrected the same day.
>
> **It could not give a group a heading, and was right that it could not.** All three
> `<legend>` names measured `12px / 400 / rgb(82,82,82)` — byte-identical to the field
> label beside them, so a group name read as a label for the one field under it. Cause:
> Carbon forwards a `type-classes` mixin the manifest never called, so `.rux--type-*` did
> not exist at all. The agent refused both escapes available — inventing a class, or
> swapping the legend for an `<h2>` and losing the fieldset's accessible grouping — and
> said so. **No gate could have caught this**: there is no gate for a class that was
> never written.
>
> Fixed the same day at `4beac65`: `@include type.type-classes`, 73 classes, **+0.9 KB
> gzipped measured**.

> **Sixth attempt, 2026-08-29 — MET, and it is the A/B for the fix above.** The same
> prompt, a different fresh agent, one variable changed. It found
> `rux--type-heading-compact-01` on its own through `docs/composing-pages.md` §3.9 and
> applied it: legends `14px / 600` against the label's `12px / 400`. **The fix landed in
> practice, not only in the stylesheet** — which is the only thing an A/B can tell you
> and reasoning cannot.
>
> **It also overturned a recorded adjudication**, and that correction is above at the
> second attempt's entry: `rux--fieldset` is Carbon's own FormGroup class in 9 captures,
> and the `checkbox-group` that entry recommended instead carries a rule that hides
> helper text. The reach was right; only the route to it was wrong.
>
> **Both attempts independently reported the same structural gap** — that no Node gate
> read a page at the repository root, so `npm run verify` exited 0 having read nothing.
> The sixth re-implemented four gates in scratch to get any answer at all. Fixed at
> `9186429` and `b6c55c7`.

> **Seventh attempt, 2026-08-29 — MET, and the highest-yield of the three.** A four-step
> wizard, a shape no template covers. 83 classes, 0 undefined; `check-a11y` 0 findings
> with its red run done; the sprite spliced and drift-free.
>
> **It hit a DEFER whose stated reason had expired.** `progress-indicator` was deferred
> as "multi-step wizard; no target shape has one", and this was that shape. The agent
> correctly did not restore it — CLAUDE.md says ask — and hand-composed a substitute from
> an ordered list and `rux--tag` instead. **Both traps at `composing-pages.md` §3.10 and
> §3.11 are consequences of that substitute**, and IBM's own guidance says it was the
> wrong component: tags are for "categorizing, labeling, or read-only situations", while
> progress-indicator's anatomy names a status indicator for exactly completed / current /
> not started. Admitted at `2930323`, +0.9 KB gzipped, with `sink/progress-indicator.html`
> as the 35th fragment at 100% coverage.
>
> **Three of its findings were fixed and one of its claims was wrong.** Fixed: the gate
> roots, `npm run icons` skipping root pages, and the grid-row gap. Wrong: its source
> comment recorded that no compiled class adds a row gap to `.rux--css-grid`.
> `.rux--css-grid--with-row-gap` exists, sets `row-gap: var(--rux-grid-gutter)`, and
> Carbon attests it in `elements-grid--with-row-gap`. The absence was not real.

> **All three pages are ARCHIVED and deleted, 2026-08-29, on the same reasoning as
> `dashboard.html`.** `~/Developer/_archive/rux-ds-exit-attempts/` holds them with a note
> each; the two settings pages are kept as a pair because they are the A/B. Their findings
> are extracted and fixed, these entries are the record, and a repository that sweeps
> every page does not keep pages nobody sweeps.
>
> **The seventh's page was edited by the author before archiving** — the step list in it
> is the real `progress-indicator`, put in by hand — so it is a hybrid and no longer a
> clean sample of what a fresh reader produces. Stated because the archive is otherwise
> easy to mistake for untouched evidence.
>
> **A WIZARD TEMPLATE DOES NOT EXIST AND THAT PAGE IS NOT ONE.** It carries no
> `BEHAVIOUR:` label, was never verified against a running Carbon page, and
> `check-provenance` never saw it. Authoring a seventh template is open work, in README's
> decision table — written with the discipline the six have, reusing the shape rather than
> promoting the file.

**DECIDED 2026-08-28 — the kitchen sink does not use the UI shell as its own page
chrome.** Asked directly, and recorded because the opposite is the intuitive answer:
a design system whose own reference page is not built from it looks like a system
nobody trusts.

The reason is mechanical rather than aesthetic. `check-coverage` reads the whole
assembled `kitchen-sink.html` (`tools/check-coverage.mjs` ROOTS), so anything in the
page chrome counts as exercised markup. `ui-shell` owns 56 classes and stands at
32/56. Building the harness from `rux--header` and `rux--side-nav` raises that number
from the harness, with no fragment demonstrating anything — which is exactly the
defect §4.1 rewrote this gate to fix, when one `rux--header` in the sink marked all 55
of ui-shell's classes covered. The ratchet only moves up, so an inflated figure would
lock in and permanently hide the gap it was measuring. **The instrument may not be
built out of the thing it measures.**

The prefix boundary already says so in code: the chrome outside `<main>` carries zero
`rux--` classes, only `ks-nav`, `ks-count`, `ks-navlinks`. One exception exists and is
not a precedent for more — the theme switcher is a `rux--btn`, because it has to sit
outside every section.

**The rejected alternative is dogfooding**, and it is a real argument: §1 says the
primary consumer is Claude Code generating pages, so the system has to be proven as
page chrome and not only as parts. It is proven — by `templates/app-shell.html`, the
artifact designed for that question and the file a page author copies. The sink
answers "what is this component's markup"; a template answers "what does a page look
like". Merging them costs the first question its answer and gains the second nothing.

Evidence arrived the same day the question was asked. A `position: fixed`, z-index
6000 side-nav scrim escaped the ui-shell fragment's 22rem sandbox and covered the
entire page — invisible above the breakpoint while still consuming every press. It
took several wrong readings to find, and it was diagnosable only because the harness
around it was independent. A shell defect that also owns the page chrome takes down
the page you would use to find it.

### 4.7 Phase 7 — Documentation

Only now, and only for what survived.

Carbon's 43 component pages each carry `usage.mdx`, `style.mdx`, `accessibility.mdx`,
and `code.mdx`. Keep the first three, drop `code.mdx` — it is React. For ~24 surviving
components that is ~72 files to convert and then rewrite.

> **Amended 2026-08-26 — §1.1 makes this phase substantially cheaper.** The original
> text warned that Carbon's docs "describe props that were removed and components that
> were deleted." Under the keep-core rule **nothing inside a component is removed**, so
> for the ~24 survivors Carbon's `usage`, `style`, and `accessibility` pages are simply
> **accurate**, modulo `cds` → `rux` in code samples. This stops being a rewrite and
> becomes a conversion plus a prefix pass.
>
> This is the clearest payoff of §1.1, and it lands on the thing that started the
> project: keeping Carbon's documentation was the original goal, and keeping Carbon's
> internals is what keeps that documentation true.

What still MUST be authored rather than converted: an index of what was cut and why
(from `docs/inventory.md`), and the `templates/` guidance from Phase 6, which has no
Carbon equivalent.

**A document MUST NOT ship before its component has passed Phase 4.** A doc describing a
component that is not in the build is worse than no doc.

### 4.8 Phase 8 — Gates

Carry forward what rux-ui learned by being bitten:

| Gate | Catches |
|---|---|
| Class resolution | a class used in a template with no CSS behind it |
| Token value snapshot | a value moving under a stable name |
| Namespace check | `cds` leakage, invented `rux-*` names, interpolated class names |

The token snapshot is the one that matters most and the one most likely to be skipped:
every other gate is name-based, so a changed *value* passes all of them silently.

> **Sequencing, raised 2026-08-29 (`docs/audits.md` finding 4).** Execution order is
> 1 → 2 → 3 → 5 → 6 → 4 → 7 → 8, which puts the token snapshot AFTER Phase 7 has
> documented the values it would pin. A snapshot is a dump of computed values and a diff;
> it does not depend on the component set being frozen, so nothing forces it to wait for
> Phase 4. Moving it ahead of Phase 7 is cheap and would stop the docs describing
> unpinned numbers. Not decided.

#### Two gate-shaped findings from the 2026-08-29 audit

**`js/` HAS NO AUTOMATED REGRESSION NET AT ALL** (`docs/audits.md` finding 2). `tests/`
exists and is empty; `package.json` has no test script and no runner. That is 1,942 lines
across twelve modules whose only verification is a person driving a browser and writing
the result into `docs/gate-coverage.json` by hand.

The asymmetry is the point. Markup and CSS have sixteen gates, a ratchet, a provenance
requirement and a CI job. Focus trapping, the overlay stack, Escape and outside-press —
the kernel every other module delegates to — have none of that. `tools/lib/gates.mjs`
already documents the failure mode in its own header: editing `js/menu.js` on 2026-08-29
silently invalidated every template's a11y reading. The gate registry can now SAY a
reading went stale; nothing can say whether the behaviour still works without a human
re-running it. Every browser gate is load-time only — `check-runtime-classes` declares
itself blind to anything behind an interaction.

**Undecided:** whether a headless browser becomes a dependency. `check-rendered.js:2`
refuses one on principle and `package.json` has three devDependencies, so this is a real
change to what the project is, not a missing npm install. The alternative — keep the
hand-run ledger and accept that behaviour regressions are caught by people — is a
defensible answer, but it should be a recorded answer rather than the current silence.

**AN UNREGISTERED CHECK EXISTS** (`docs/audits.md` finding 10). `tools/build-portal.mjs`
asserts that every `#i-name` it emits resolves to a `<symbol>` in the committed sprite,
and exits non-zero when one does not. It caught `#i-katex` on its first run — a glyph
nothing defines, the silent-blank-icon failure `check-icons` exists for.

It is real, it runs in `npm run verify`, and it is not in the registry. That is the
`build-namespace` shape — a gate carried by a build tool with no `check-*` file — and
`build-namespace` IS registered. **Decide whether this becomes the eighteenth gate.**
Registering it means the count moves in `CLAUDE.md` and `README.md` as well as
`gates.mjs`; leaving it out means the registry is knowingly incomplete, which is the
condition that registry was built to end.

This read *fifteenth* until 2026-08-29, when `check-behaviour`, `check-glyphs` and
`check-slots` took the registry from fourteen to seventeen. The ordinal moves with
every gate admitted, and an undecided question that needs re-numbering each time is
one more argument for closing it.

#### THE CAPTURES CARRY NO VERSION — found 2026-08-30

**Seven gates read a Carbon-derived reference file, and not one of those files records
which Carbon it came from.** 505 stories in `carbon-react-dom.json`, zero metadata keys.

| Reads | Gates |
|---|---|
| the four DOM/states captures | `check-tags`, `check-ancestry` (and `diff-fragment`, a diagnostic) |
| `carbon-react-spacing.json` | `check-spacing` |
| `carbon-co-classes.json` | `check-co-classes`, `check-tokens` |
| `carbon-glyphs.json` | `check-glyphs` |
| `carbon-slots.json` | `check-slots` |

An earlier version of this entry said six and named `check-compound`, which reads
`css/rux.css` and the HTML and no capture at all. Corrected 2026-08-30.

Three facts make that worse than untidy:

1. **`@carbon/styles` is pinned on a caret**, `^1.113.0`, so what `npm install` compiles
   can move without the captures moving.
2. **The extractor runs against the live Storybook** — `tools/extract/react-dom.js:2`
   says paste it into the console at `react.carbondesignsystem.com` — which serves
   whatever Carbon released most recently, not what this project compiles.
3. **Nothing reconciles the two.** A divergence found by `check-tags` cannot be
   attributed: it might be ours, or it might be Carbon having moved since the capture.

**This blocks a re-capture, which is why it is filed rather than fixed.** The ARIA
allowlist in that extractor was widened on 2026-08-30 from four attributes to thirteen,
because the old list had blocked adjudication three times — `aria-hidden` and `tabindex`
in the batch-actions finding above, and `aria-labelledby` for the toggle defect the
screen-reader pass found. **That change does nothing until someone re-captures**, and
re-capturing today would silently swap the reference for seven gates with an unknown
Carbon and leave no record that it happened.

**The obvious fix is not free, and the shape is the decision.** Stamping a `_meta` key
into the payload is one line in the extractor and a break in every consumer:
`check-ancestry.mjs:210` does `Object.entries(...)` over the file and would read `_meta`
as a story. So it is either a sidecar file that nothing has to skip, or a `_`-prefix
convention added to every reader at once. Both are small; choosing between them is not
mine to do silently.

**Not decided, and worth deciding before the next capture rather than after.** A
reference set whose version nobody recorded is the same category of gap as a gate never
pointed at a target — `docs/audits.md` exists for exactly that shape.

#### Two blind spots from the 2026-08-30 tab-order sweep

Both shipped defects on pages that passed all seventeen gates, and both were found by
walking the tab order by hand rather than by any gate. Neither is written as a rule yet,
and the reason to hesitate differs in each case.

**AN ARIA ROLE CARBON NEVER RENDERS.** `sink/ui-shell.html` carried `role="menu"` on the
side nav's `ul`. The capture it cites renders that element bare, and all six templates
already did; only the fragment diverged, while its own STRUCTURE comment listed the
element without the role. `role="menu"` requires `menuitem` children and these are
`li > a` with no role, so an AT was told it had entered a menu and then found nothing in
it. Fixed at `643a20e`.

Every class gate was blind by construction — a bare attribute is not a class, so
`check-classes`, `check-tags`, `check-compound`, `check-ancestry` and `check-co-classes`
cannot see one. `check-a11y` was blind by its own rule: it counts `[role^="menuitem"]`
descendants and skips a composite that has none, so zero items yielded neither a finding
nor a note.

**The data for this rule already exists**, which is what makes it worth writing down. The
captures record attributes as `{name=value}` beside the element — `check-tags` already
reads the element half of the same line. A rule could intersect the roles our markup puts
on a class set against the roles Carbon's captures render for it, exactly as
`check-tags` does for element type.

**The hesitation is `check-slots`' problem, not a new one.** The captures do not cover
every state, so a role we legitimately need may have no capture that can answer, and the
honest handling is `check-slots`' — report UNCOVERED rather than pass. That is a real
design, not a blocker; it is simply not free.

**A PAGE CARRYING NO HEADING AT ALL.** `templates/table-page.html` rendered its only
title as `div.data-table-header__title` and had no `h1`–`h6` anywhere. Heading navigation
is a primary way an AT user moves through a page, and §4.6 says a template IS a complete
page, so the page offered none. Fixed at `e62850f` and `8f3d932`.

**This one is not a provenance fault, and that is the point.** Carbon renders that class
as both `h2` and `div` — `check-tags` accepts either, and running it with `h1` on that
class fails with "Carbon renders it on `<div|h2>`", which is how the fix was chosen. No
markup gate could have caught it, because nothing was invented. It is a composition
question, and the gates check parts.

**The hesitation here is structural.** Every gate in the registry reads a class, an
element, or a computed property PER OCCURRENCE. "This document contains at least one
`h1`" is an assertion about a FILE as a whole, and the only precedent is
`check-provenance`, which asserts a file carries a label. Whether the registry grows that
shape is the decision, not whether the heading matters.

**Both, if admitted, land after the `build-portal` question above** — which is itself
undecided, so the ordinals are provisional. That is the third time this section has had
to re-number an open question, and the argument for closing them is the same each time.

---

## 5. Risks and one-way doors

- **Carbon's docs will not match your CSS from Phase 1 onward.** Setting `$prefix` early
  is the right trade, but it has a cost worth naming: every lookup against
  carbon-website, a Lit template, or a GitHub issue reads `--cds-layer-01` while your
  build says `--rux-layer-01`. The translation is a mechanical three-character swap with
  the token name unchanged, which is why it loses to the alternative — writing `cds`
  into the kitchen sink and every template, then rewriting them all later.
- **Shadow-DOM CSS does not port.** Any plan that starts "copy the web-component's
  styles" is wrong; §3 says why.
- **Phase 1 is the sleeper.** Building a complete kitchen sink by reading Lit templates
  is the largest single unglamorous cost in this roadmap. It is also what makes every
  later phase verifiable, so it MUST NOT be shortened.
- **Carbon docs describe the un-stripped system.** Phase 7's rule exists for this.
- **Phase 4 is still a one-way door; it is just a later one.** Moving it after Phase 6
  buys evidence, not safety. The set is frozen the moment it runs, so the question to
  ask before running it is not "are the templates done" but "has a template stopped
  teaching us anything about the set". `data-table` needed three more modules and only
  building the page revealed it.
- **Nothing now stops the set growing except the admission rule.** §2.1 dropped its KB
  target on 2026-08-28, because across three revisions it decided no component either
  way. The admission rule replaces it, and it is a judgement rather than a measurement —
  if it stops being applied honestly, the 75 KB tripwire is all that remains and it is
  deliberately loose. The failure mode to watch for is a page shape invented to justify
  a component rather than a component admitted to serve a page shape.

## 6. File structure

```
rux-ds/
├── CLAUDE.md              Phase 6 — context routing for agents
├── README.md
├── package.json
├── kitchen-sink.html      Phase 1 — the measuring instrument
│
├── src/                   BUILD INPUTS (Sass). Deleted at Phase 4.
│   ├── app.scss             the @use manifest — this file IS the strip
│   └── themes.scss
│
├── css/                   BUILD OUTPUT → becomes the source at Phase 4
│   ├── rux.css              entry; @imports the rest
│   ├── tokens.css
│   └── base/                one file per component
│
├── js/                    Phase 5 — vanilla behaviors
│   └── overlay.js           kernel; loaded first, the others delegate to it
│
├── templates/             Phase 6 — the deliverable
│
├── docs/
│   ├── roadmap.md
│   ├── inventory.md         Phase 2
│   └── components/          Phase 7 — converted from carbon-website MDX
│
├── tools/                 measure.mjs · extract-tokens.mjs · devendor.mjs
├── tests/                 Phase 8
│
├── carbon-website/        ─┐ gitignored quarry: read from, never shipped
└── node_modules/          ─┘
```

Three properties of this layout carry real weight:

**`src/app.scss` is the strip.** Phase 3's first pass — 75 components down to ~24 — is
commenting out `@use` lines in one file. The largest cut in the project lands as a
reviewable diff on a single manifest, and it stays reproducible from a clean
`npm install` because no Carbon file is edited in place (§4.3).

**`css/` is committed from the first build, even though it is generated.** This looks
wrong and is deliberate: it makes every strip commit show its own CSS delta, so "what
did cutting `fluid-*` actually remove?" is answered by `git diff` rather than by
re-running a measurement. Generated output is normally excluded; here the diff *is* the
record.

**The `src/` → `css/` relationship inverts at Phase 4, and that is the one-way door made
structural.** Until then `css/` is output and `src/` is truth. At devendor, `src/` is
deleted and `css/` simply stops being regenerated — the same files, now the source. No
migration, no reshuffle, no moment where the system is half-moved. `css/base/` holding
one file per component is rux-ui's proven shape (23 files) and survives the inversion
unchanged.

## 7. Explicitly not doing

- Not modifying rux-ui. It is frozen and stays working.
- Not porting `@carbon/react`, and not shipping `@carbon/icons`.
- Not keeping SCSS past Phase 4 — a build step is a dependency.
- Not running IBM Telemetry. `@carbon/web-components`, `@carbon/utilities` and
  `@carbon/icon-helpers` carry `postinstall` telemetry hooks; npm 11 blocks them by
  default and they stay blocked.
- Not supporting 4 themes. Two.

---

## 8. Distribution — licence decided, versioning open

Raised by the 2026-08-29 audit (`docs/audits.md`, findings 1 and 6). They are recorded
together because they are one domain: what it means to hand this to someone else.

**§8.1 is decided and done as of 2026-08-29. §8.2 is still open**, and until it is
answered a consumer pins to a commit SHA or to nothing.

### 8.1 Licence — DECIDED 2026-08-29, Apache-2.0

**The project ships under Apache-2.0**, and both halves below are now satisfied. What
follows is kept as the reasoning, not as an open question.

Four things landed together:

| | |
|---|---|
| `LICENSE` | The Apache-2.0 text, copied verbatim from `@carbon/styles`'s own copy so it is not transcribed from memory. Byte-identical to it apart from the appendix copyright line, which reads `Copyright 2026 rux` |
| `NOTICE` | Names every artefact carrying Carbon-derived material and what was changed in each, per §4(b) |
| Banner in `css/rux.css` and `css/rux.min.css` | Written by `tools/build.mjs`, so it survives every rebuild rather than being a one-time edit |
| Attribution in `assets/icons.svg` | Written by `tools/icons.mjs`, and `npm run icons` inlines it into all six templates; `build-sink` and `build-portal` carry it into the two generated pages |

**Apache-2.0 was chosen because it matches upstream.** MIT is compatible but would leave
Carbon's Apache-2.0 material needing separate attribution anyway, so it buys nothing and
costs a second licensing story. Staying `private: true` and never publishing was the
third option and is contradicted by §1's "consumable from a raw URL", which is built and
CI-enforced. `private: true` stays set — it blocks an accidental `npm publish` and says
nothing about the licence.

**THE §4(c) HOLE WAS REAL AND IS THE REASON THE BANNER IS IN THE BUILD TOOL.** Carbon's
Sass carries `// Copyright IBM Corp.` on every partial. Sass strips `//` comments. So
`css/rux.css` — committed, and served from a raw URL by design — carried **zero**
attribution, and `assets/icons.svg` named `@carbon/icons` as a source without a copyright
line. A hand-added header would have been deleted by the next `npm run build`. Putting it
in `build.mjs` makes it a property of the build.

`build.mjs`'s namespace check scans the banner along with the CSS, so a notice that named
the old prefix would fail the build. That is deliberate.

#### The reasoning, kept

There was no `LICENSE` file, no `license` field in `package.json`, and — before this
section — no mention of licensing anywhere in 89 KB of roadmap.

**The obligation half is not a matter of taste.** §3 records that `css/rux.css` is
compiled `@carbon/styles` and `assets/icons.svg` is quarried `@carbon/icons`, both
Apache-2.0, both committed, both served from a raw URL by design. Apache-2.0 §4 asks a
redistributor to carry the licence text and retain attribution notices. Today the
repository does neither.

**The decision half is yours.** Apache-2.0 for the whole thing is the low-friction
answer — it matches upstream, so the NOTICE question collapses into one file. MIT is
compatible but leaves Carbon's Apache-2.0 material needing its own attribution anyway.
Staying `private: true` and never publishing is a legitimate third answer, and would
make this section moot — but it contradicts §1's "consumable from a raw URL", which is
already built and CI-enforced.

**What must not happen is the state this section was written in**: shipping the material,
with the delivery mechanism deliberately engineered, and no licence file either way. That
state lasted from Phase 1 until 2026-08-29 and is now closed.

### 8.2 Versioning — consumers pin to a SHA or to nothing

No `version` field, no git tags (`git tag` returns empty), no changelog.

This matters more here than in a normal library, because §1 names the primary consumer as
**Claude Code generating pages**. A generated page is a snapshot of the class vocabulary
at the moment it was written. `docs/coverage.json` ratchets upward, but a component can
still leave the build — README calls restoring one a three-line operation, so the reverse
is three lines too — and a page written last month has no way to discover that a class it
uses no longer resolves.

`check-classes` catches this inside the repository and cannot see a page outside it.

**The open question is what a consumer pins to**, and the answers differ in cost: a git
tag per release is nearly free and gives nothing to check against; a `version` field plus
a "classes removed in" record is what would let a generated page detect its own
staleness, and is real work. Neither has been chosen, and this section exists so the
choice is visible rather than implicit in the absence of a tag.

---
