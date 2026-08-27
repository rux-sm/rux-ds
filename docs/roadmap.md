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

### 2.1 Target

**≤40 KB gzipped for ~24 components and 2 themes**, plus ≤90 KB of behavior JS.

Measured under the keep-core rule, 2026-08-26:

| Configuration | Minified | **Gzipped** |
|---|---|---|
| Full Carbon — 75 components, 4 themes | 837 KB | 85 KB |
| Keep-core — 24 components, 2 themes | 359 KB | **36 KB** |
| Keep-core — 12 components, 2 themes | 218 KB | 23 KB |

> **Amended 2026-08-26. This section previously targeted ≤150 KB minified, and that was
> wrong twice over.** It was unreachable under §1.1's keep-core rule, because the 55% it
> depended on was to come from cutting Carbon's internals. More usefully: **it measured
> the wrong thing.** Carbon's verbosity is highly repetitive — the same
> `clamp(var(--x, var(--y)))` shapes over and over — so it compresses roughly 10:1, and
> what reaches a browser is 36 KB. The old target would have traded away function to
> optimize a number nobody downloads.
>
> **Keeping Carbon's core intact is close to free in the metric that matters**, which is
> the finding that settles §1.1 rather than merely accommodating it.

For scale: rux-ui is 351 KB **unminified** for 23 components plus a 143 KB token file.
This system will be heavier uncompressed and lighter on the wire, and it keeps Carbon's
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

**The one-way door.** Scripted, executed once, in a single commit.

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

### 4.5 Phase 5 — Behaviors

Write vanilla modules against the DOM and ARIA contracts read out of the Lit templates.

rux-ui's shape is proven and SHOULD be followed: an **overlay kernel loaded first**,
owning outside-press, Escape, and focus trapping, with menu, popover, drawer and shell
all delegating to it. 12 modules, 86 KB. This is the one phase where rux-ui is worth
reading directly, even though this project is not extracted from it.

Exit: keyboard and screen-reader passes on every interactive component in the sink.

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
- **The target may be wrong.** §2.1 is a hypothesis. Record the floor you actually hit.

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
