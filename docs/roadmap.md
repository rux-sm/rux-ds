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

| Package | Role | Fate |
|---|---|---|
| `@carbon/styles` | **The CSS source.** Light-DOM `.cds--*` classes, 75 components | Quarried, then deleted |
| `@carbon/elements` | **The token source.** 476 exports as plain JS objects, 4 themes | Quarried, then deleted |
| `carbon-website` | **The doc source.** 317 MDX, 43 component pages × 4 tabs | Quarried, then deleted |
| `@carbon/web-components` | **Markup + behavior reference only** | Never installed as a dependency |
| `@carbon/react` | — | Not used |
| `@carbon/icons` | 123 MB of JS-wrapped SVG | Not used; take SVGs individually |

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

### 4.5 Phase 5 — Behaviors

Write vanilla modules against the DOM and ARIA contracts read out of the Lit templates.

rux-ui's shape is proven and SHOULD be followed: an **overlay kernel loaded first**,
owning outside-press, Escape, and focus trapping, with menu, popover, drawer and shell
all delegating to it. 12 modules, 86 KB. This is the one phase where rux-ui is worth
reading directly, even though this project is not extracted from it.

Exit: keyboard and screen-reader passes on every interactive component in the sink.

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
