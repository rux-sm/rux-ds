# rux-ds

A framework-free UI kit built from Carbon v11, kept as complete as Carbon's markup
allows, that any of rux's projects vendors as static CSS, HTML and JS. Goal revised
2026-09-01; `docs/roadmap.md` §1 has the decision and the phases it re-scoped.

**Start with [`docs/roadmap.md`](docs/roadmap.md)** — the end goal, the decisions on
record, and the phase this project is in. This README is the index: current state, what
is open, and where each rule lives. It does not repeat the roadmap, because a rule
stated twice drifts — which is exactly what happened to the Status block below before
2026-08-28.

`CLAUDE.md` is the routing file an agent loads automatically; it points at the rules
below rather than repeating them. **Phase 6's guide to BUILDING a page is complete** —
`templates/app-shell.html` is the frame, with `table-page.html`,
`form-page.html`, `detail-page.html`, `empty-state.html`, `error-state.html`,
`wizard-page.html`, `dashboard-page.html`, `settings-page.html` and `schedule-page.html`
built on it. The kitchen sink remains the worked
example and `sink/*.html` the markup to copy for a component no template carries.

## Status

**Phase 3 complete — stripped.** Carbon compiles under the `rux` namespace, every
shipped fragment has been diffed against Carbon's own rendered DOM, and the build is
now the keep-set rather than all of Carbon.

**Phase 5 (behaviors) — every module written, exit criterion still open.** Fourteen
modules in `js/`: an overlay kernel plus popover, menu, list-box, tabs, accordion,
data-table, form-controls, ui-shell, dismiss, tile, modal, copy-button and
date-picker. **The markup is the API** —
a page built from a template needs no script of its own. An attribute appears only when
trigger and surface are too far apart for the markup to relate them (`data-rux-open` on
modal and menu); a popover, tooltip or overflow menu needs none. Focus trapping, Escape,
outside press and the stack deciding which surface a press belongs to all come from the
kernel.

What is left of the phase is not code: **a screen-reader pass**. `tools/check-a11y.js`
reports twelve findings and six notes on the sink and four on
`templates/wizard-page.html` — three adjudicated false positives across sixteen sites —
and nothing on the other ten pages. It read nine here until 2026-09-01: the sweep took
focus with a CLICK, which is an outside press, and the kernel removed the calendar the
tool then could not find. The cause is the method, not the markup. But it reads
attributes rather than running an AT. Its focus-ring check does now run in an
automated browser, once the page has focus. See "Picking this up".

**Phase 4 (devendor) is DECLINED while admissions are open, decided 2026-08-31.** It
closes as met-by-measurement rather than met-by-deletion: `css/rux.css` carries zero
`cds`, there are no `dependencies` at all, and a consumer fetches the committed
stylesheet and installs nothing — so the runtime half of the goal already holds. What
steps 1–2 would still buy is tidiness of this repository, at the price §4.4 lists: no
admitting a component, no new icon, no theme change, no version bump. §2.1's amendment
of the same day made admissions the project's job, and the door's price is exactly the
ability to admit.

**Revisit on an explicit freeze**, not on quiet. The
execution order it used to end — 1 → 2 → 3 → 5 → 6 → 4 → 7 → 8 — stands for the rest;
the phase numbers are names, not positions. Roadmap §4.4.

### Picking this up

A fresh clone is the whole handover — nothing lives in an editor session or a
machine-local note. This section is the current state and the next steps only.
Every dated pass, measurement and answered decision that used to sit here is in
`docs/log.md`, and stays there as the record.

**Where this stopped, 2026-09-02.** Phases 9, 10 and 11 are done. The plan being
executed is roadmap §4.12: three creators and the Rux Portal. Landed: the script
questionnaire, `docs/choices.md`, the switcher panel in every template with its
behaviour (`v0.1.1`), and the portal itself, committed in
`~/Developer/rux-sm.github.io` on the machine that built it and NOT yet pushed —
the GitHub repository `rux-sm/rux-sm.github.io` must be created by hand first.

**Next, in order:**

1. Push the portal, enable Pages from its workflow, open https://rux-sm.github.io/.
2. Notes re-vendors rux-ds — its pin is from 2026-09-01, before the switcher —
   then gets the switcher button and panel and becomes module two in fact.
3. Creator 2, the `rux-ds-page` skill's multiple-choice flow, offering only what
   `docs/choices.md` lists and gating the result through this root.
4. Creator 3, the configurator page, as a portal page. Last.

**Open decisions, rux's:**

| What | Where |
|---|---|
| The hub's name — `portal.html` here is the gate dashboard | roadmap §4.12 |
| Where the switcher manifest contract is written down — the shape of `switcher.json` and what a shell fetches. `js/ui-shell.js` only opens and closes the panel today; every template carries invented entries | roadmap §4.12 |
| The custom theme's accent — a purple placeholder today | `css/rux-theme.css` |
| Whether Notes' `sync-ds.sh` is retired for `tools/new-project.sh`, which already moves a pin around a project's own files and records the tag | roadmap §4.11 |
| The token snapshot runs after Phase 7 documents the values it would pin | roadmap §4.8 |

**Two human tasks remain, both with an assistive technology running.**
`docs/screen-reader-pass.md` is the procedure and lists what is already done:

- Flip a toggle, to close the `a5f95c8` fix by ear; it is corroborated by the
  reference and by nothing else.
- Open a modal and a popover: the dialog's name on open, focus landing inside,
  and whether the page behind goes silent. In a focused window — `check-a11y.js`
  refuses its focus-ring check when `document.hasFocus()` is false.

**Current figures are generated, not typed.** The table below is rewritten on
every `npm run verify`; `portal.html` is the component set and `npm run gates`
the browser sweep. The two capture-backed gates print this, re-measured
2026-09-02, still 0 findings on both:

    check-tags      669 stories · 2208 classes · 81 with no reference · 10 known · 0 on a different element
    check-ancestry  669 stories · 550 corroborated ancestries · 84 declined · 0 missing

<!-- STATS:BEGIN -->
| | |
|---|---|
| Components | **77 / 83 compiled** in 80 `@use` lines — `data-table` is four of them — and `docs/inventory.md` decides all 83, which `check-inventory` fails if it stops |
| Themes | 4 — white, g10, g90, g100 — plus `rux`, a token override block in `css/rux-theme.css`, not a compile |
| Tokens · classes | **626** `--rux-*` defined, 10 more read through a fallback · **1,798** `.rux--*` |
| Kitchen sink | **68** sections · **974** classes with `templates/` and `js/` |
| Class coverage | **948 / 1,356 (70%)** — ratcheted in `docs/coverage.json` |
| Spacing scale | 13 `--rux-spacing-*` tokens, demoed in the `spacing` section |
| Markup provenance | **72 `rendered-dom` · 6 `source` · 0 `inferred`** across 78 files |
| Icons | 59 symbols in a 16.1 KB sprite — 51 referenced, 8 nothing points at |
| Size | 1023.9 KB raw · 920.9 KB min · **91 KB gzipped** |
| Behaviour JS | **14** modules · **46 KB gzipped** · 158.2 KB raw, 60% of it comment · 62.8 KB of code |

**Every figure above is generated** by `tools/build-readme.mjs` from
`tools/lib/stats.mjs`, rewritten on every `npm run verify`, and CI fails if the
committed copy is stale — the same contract `css/`, `kitchen-sink.html` and
`portal.html` are already under. Do not edit the table by hand; the next build
overwrites it. The gzipped figures are whole KB on purpose: they are read at
level 9 and the last hundred bytes still depend on the zlib the running Node
bundles, so an exact figure makes the build fail on whichever machine did not
generate it. The tripwires those
sizes run against — 96 KB for `css/`, 60 KB for `js/` — are decisions rather
than measurements and live with their reasoning in `tools/build.mjs`.
<!-- STATS:END -->

Before the strip: **83 components** — Carbon 1.114 added eight to the 75 this project
first stripped, and `docs/inventory.md` has since decided all 83 — 4 themes, 939 KB min,
**94.0 KB gzipped**.

The current component count and disposition summary are generated in `portal.html`.
Roadmap §4.9 owns the admission batches and their state; `docs/inventory.md` owns each
component's decision; `npm run gates` and `docs/gate-coverage.json` own the sweep state.
They are intentionally not repeated here.

## Commands

```bash
npm run verify           # build + assemble sink + class resolution + coverage + provenance
npm run coverage --all   # per-component class coverage, thinnest first
npm run coverage:update  # re-record docs/coverage.json after adding sink markup
npm run ancestry         # wrappers Carbon never omits, with the recorded declines
npm run tags             # class-on-the-wrong-element check, with its KNOWN list
```

**`npm install` BEFORE `npm run verify`, after any pull that touches `package.json`.**
`verify` BUILDS `css/rux.css` and `.min.css` from the `@carbon/styles` that is in
`node_modules`, and never compares that against what `package.json` pins. So a stale
install does not fail — it rewrites the committed stylesheet from the OLD Carbon and
exits 0.

Measured 2026-08-31, not hypothetical: `package.json` pinned `^1.114.0`, `node_modules`
still held 1.113.0, and one `verify` reverted 736 lines of `css/rux.css` — dropping the
`any-hover` media queries around the overflow-menu hover rules and a `background-color`
on `.rux--btn--icon-only.rux--btn--ghost:focus`. Exit code 0 throughout, which is the
part worth remembering: **the exit code cannot see this**, and this README's own advice
to trust it over grepping output does not help here.

There is a second cost. All five browser gates declare `css/rux.css` and `js` as inputs,
so a spurious rebuild marks all 35 browser cells DIRTY. That prints and does not fail
the build, but it destroys a `26 current · 0 stale` state that takes a browser and a
person to re-earn. `npm install` then `npm run verify` restores `css/` byte-identically
and the cells with it.

| | |
|---|---|
| `npm run build` | `src/app.scss` → `css/rux.css` + `.min.css`, verifies zero `cds` |
| `npm run sink` | assembles `sink/*.html` → `kitchen-sink.html` |
| `npm run icons` | quarries `assets/icons.svg` from `@carbon/icons` |
| `npm run inventory` | per-component classes and size → `docs/inventory.json` |
| `tools/extract/` | quarries Carbon's rendered markup → `docs/carbon-co-classes.json`, `docs/carbon-*-dom.json`, and — via the state recipes in `react-dom.js` — `docs/carbon-react-states.json` (roadmap §4.1.7, §4.1.14). Its `spacing` mode captures COMPUTED box properties instead, folded into a signature table — the one question the markup captures cannot answer |
| `tools/check-icons.mjs --unused` | the sprite's symbols nothing in the shipped sink references; `--deferred` is the ones `sink/deferred/` would need back |
| `tools/check-provenance.mjs --inferred` | the fragments whose markup was never diffed against a reference (roadmap §4.1.13) |
| `tools/diff-fragment.mjs <name> --omissions` | where a fragment's nesting disagrees with Carbon, and what Carbon renders that it omits |
| `npm run serve` | kitchen sink at `http://localhost:8642` |
| `npm run watch` | rebuild CSS on change |

## Layout

| Path | What |
|---|---|
| `src/app.scss` | **The build manifest — this file is the strip.** Roadmap §4.3 |
| `css/` | Build output, generated-and-committed. It was to BECOME the source at Phase 4; that devendor is declined while admissions are open — roadmap §4.4 |
| `js/` | **The behaviour layer.** `overlay.js` is the kernel and loads first; the other eleven delegate to it. Roadmap §4.5 |
| `templates/` | **Runnable page skeletons — Phase 6's deliverable.** Ten of them. Each is a COMPLETE page carrying the shell, not a fragment. Roadmap §4.6 |
| `sink/` | One fragment per component, plus `ORDER`, `harness.css`, `harness.js` |
| `kitchen-sink.html` | Generated — do not edit; edit `sink/` and run `npm run sink` |
| `assets/icons.svg` | Generated sprite, committed |
| `assets/fonts/` | **IBM Plex Sans, self-hosted and OPT-IN.** Two woff2 files (Latin1, weights 400 and 600, ~42 KB) plus `plex.css`, which nothing in `css/rux.css` references — a consumer who does not link it gets Carbon's fallback stack exactly as before. The sink, `portal.html` and all ten templates link it. Roadmap §4.1.1 left Carbon's `$css--font-face` off because it emits 90 rules at a bundler path that 404s, and named this as the way out; no Carbon file is edited and no flag is flipped. OFL-1.1, licence beside the files |
| `assets/brand/` | **Generated by `npm run marks`, never hand-edited.** `tools/make-marks.mjs` holds the ONLY copy of the drawing — an 11x10 module grid traced from the Linearity export on 2026-08-31 and verified module-for-module against the four hand exports — and every file here is emitted from it, so the variants cannot drift apart. `mark.svg` is the master at `viewBox="0 0 11 10"`, tight with no padding: the body takes `currentColor` and the slab defaults BACK to it, so the untouched file is the mono form and setting `--rux-mark-slab` is what makes it a two-tone lockup. Four 1024px app icons (`light`/`dark` x `blue`/`mono`) scale the same grid by 80 at origin 72,112 — uniform, because an 11:10 mark cannot fill a square without distortion, so the height is 800 and not 896. `favicon.svg` carries its own `<style>` because a favicon gets no CSS from the page. **Nothing here is LINKED by any page**: the ten templates INLINE the geometry and name `mark.svg` only as provenance, and no page carries a `rel="icon"` yet. `dark-blue` is the one variant whose features clear 3:1 against the body and not against the surface — no Carbon token clears both against a blue-40 body, and the generator records the geometry seal as the alternative |
| `tools/` | `new-project.sh` — the one consumer-facing tool, `docs/starting-a-project.md` · `build` · `build-sink` · `build-portal` · `icons` · `make-marks` · `glyphs` · `inventory` · `measure` · `states` · `check-classes` · `check-tokens` · `check-icons` · `check-glyphs` · `check-slots` · `check-compound` · `check-tags` · `check-ancestry` · `check-coverage` · `check-co-classes` · `check-inventory` · `check-headings` · `check-aria-roles` · `check-provenance` · `check-gates` · `check-controls` · `diff-fragment` · `serve` · and five browser-only: `check-a11y.js`, `check-rendered.js`, `check-runtime-classes.js`, `check-spacing.js`, `check-behaviour.js` |
| `tools/lib/ownership.mjs` | Which component owns a class, which are compiled, what counts as a class name — shared by the gates so there is one definition |
| `tools/lib/sources.mjs` | Which files a gate reads PER FILE — `sink/*.html` + `templates/*.html`, `sink/deferred/` excluded — so a finding names a file you can edit |
| `docs/carbon-react-spacing.json` | **What Carbon COMPUTES, harvested 2026-08-28** — 798 class signatures → box properties → the nearest classed ancestor → the stories each was seen in. The markup captures record structure and say nothing about space; this is the other half. 133 signatures compute more than one way and all variants are kept |
| `AGENTS.md` | **The policy, and it binds every agent.** It classifies every artifact into three tiers before you create or modify it, and lists what to stop on. `CLAUDE.md` routes; this decides. `tools/check-controls.mjs` reports which control files a diff touched, and is deliberately NOT a gate — it asserts nothing about the repository |
| `LICENSE` · `NOTICE` | **Apache-2.0**, decided 2026-08-29. `LICENSE` is upstream's own copy of the text; `NOTICE` names each artefact carrying Carbon-derived material. The attribution in `css/` and `assets/` is written by the BUILD tools, so it survives a rebuild — roadmap §8.1 |
| `docs/roadmap.md` | Canonical plan and decision log |
| `docs/log.md` | **The record** — every dated pass, measurement and answered decision, moved out of "Picking this up" so README could stay current |
| `docs/choices.md` | **What a project can choose** — shapes, shell parts, themes, field style, buttons — each attested, and which layer offers it |
| `docs/operating-card.html` | **The printable two-page card for rux** — the per-session loop across rux-ds, atlas and notes, and the once-per-Mac setup. Not a rux-ds page; no gate reads it |
| `docs/starting-a-project.md` | **How a project starts on a tag** — one command, three kinds of file, how the pin moves |
| `docs/verifying-templates.md` | **How a template's behaviour is checked against a running Carbon page** — and the four wrong answers that came from reading the stylesheet instead |
| `docs/audits.md` | **Which whole-project sweeps have been run, and what each did NOT look at** — the ledger only; every finding is filed where its decision lives |
| `carbon-website/` | Gitignored quarry — Carbon's docs, read from, never shipped |

## The one rule

**No Carbon file is ever edited.** Customization is `$prefix`, Carbon's own config
flags, and which components and themes get compiled — nothing else. That keeps
components working as designed, keeps Carbon's documentation accurate, and makes a
Carbon upgrade a version bump rather than a re-merge. Roadmap §1.1.

One documented exception, enforced on every build: `tools/build.mjs` renames
`--cds-grid-*`, which Carbon hardcodes past `$prefix`. Roadmap §4.1.2.

## Gates

Twenty-one, because none is sufficient alone — see roadmap §4.1.2 for the bug that proved it.

| Gate | Catches | Blind to |
|---|---|---|
| `build.mjs` namespace check | `cds` leakage into output | anything visual |
| `build-portal.mjs` icon assertion | a `#i-name` emitted into `portal.html` that the sprite has no `<symbol>` for — it caught `#i-katex` on its first run | every page it does not generate; its unit is `portal.html` alone |
| `check-classes.mjs` | a class used in HTML **or `js/`** with no CSS behind it · a class whose component was stripped | a class that resolves but renders wrong |
| `check-tokens.mjs` | a `var(--rux-*)` that resolves to nothing | a token whose *value* moved (roadmap §4.8) |
| `check-icons.mjs` | a `<use>` pointing at a symbol the sprite does not carry · a fragment referencing the sprite externally or a template referencing it bare · a sprite out of step with `icons.mjs` | whether the symbol DRAWS what its name says — that is `check-glyphs` |
| `check-glyphs.mjs` | a sprite symbol whose geometry is not the glyph its name claims, compared against `@carbon/icons` via the `docs/carbon-glyphs.json` snapshot · a symbol name Carbon has no file for | **which slot** a glyph belongs in — that is `check-slots` |
| `check-slots.mjs` | the WRONG GLYPH in a slot, against `docs/carbon-slots.json` — 33 slots, each backed by 3+ stories or 3+ sibling slots agreeing | 11 slots have no Carbon capture that can answer (reported UNCOVERED, never passed) · 25 more are captured but under the corroboration bar |
| `check-compound.mjs` | two classes Carbon compounds, split across elements | wrong nesting order · missing wrapper |
| `check-tags.mjs` | a class on a different element type than Carbon renders it on | classes no story emits (81 today) |
| `check-ancestry.mjs` | a wrapper Carbon renders in **every** capture, absent here | a wrapper Carbon only sometimes renders |
| `check-coverage.mjs` | a component exercising fewer classes than `docs/coverage.json` records | standing still — it ratchets, it does not set a floor |
| `check-co-classes.mjs` | a modifier used without the base class that styles it | a base class Carbon never pairs |
| `check-inventory.mjs` | a component Carbon ships that `docs/inventory.md` has no row for · a row carrying no disposition · a component `src/app.scss` does not list at all · a disposition the manifest contradicts · **a stub in `sink/deferred/` shadowing a fragment that ships** | whether a disposition is RIGHT — it insists one was made, not that it was wise · whether a stub still deferred is still ACCURATE, which no gate reads |
| `check-headings.mjs` | a page with no heading at all · more than one `h1` · an outline that skips a level. Pages only — `sink/*.html` fragments are specimens, not documents | whether a heading says anything useful · a heading that looks like one and is marked up as a `div` |
| `check-aria-roles.mjs` | a `role` on a `rux--` class Carbon never renders that role on — the first gate to read the captures' attribute data | a role on an unclassed element · a MISSING role · whether required child roles exist · anything turning on `aria-live`, which the extractor does not record |
| `check-provenance.mjs` | a fragment that does not say where its markup came from · a template that does not say what its BEHAVIOUR was verified against, with a URL and a date | whether either label is true |
| `check-rendered.js` | default browser chrome · collapsed · escaped elements | anything it has no rule for · a section it has nothing to measure in |
| `check-runtime-classes.js` | a class in the markup that no longer exists once the modules have run — what `check-coverage` counts and nobody sees | anything behind an interaction; it is load-time only |
| `check-spacing.js` | a box property that disagrees with what Carbon computes for the same class set, read from `docs/carbon-react-spacing.json`, reported as **known vs unknown** against an adjudicated list | whether the value is RIGHT — only whether it matches Carbon; a class set neither side renders; and it cannot express POSITION, so a `:last-of-type` element measured against a recorded non-last one is a sampling artifact, not a disagreement |
| `check-behaviour.js` | a behaviour module that stops doing what its own header claims — the state a click produces | anything landing in a microtask: focus destination, focus restoration, the order two surfaces close in |
| `check-a11y.js` | dangling idrefs · composites with many tab stops · unnamed controls · roles missing required state | what a screen reader announces · focus-ring contrast · whether the tab order makes sense · **an ARIA role Carbon never renders** · **a page carrying no heading at all** |

**`check-ancestry` was written after a defect three gates could not see.** The modal's
close button rendered in the flow under the heading, left-aligned, because the fragment
had no `modal-close-button` — the element carrying the `position: absolute` that pins it
to the corner. `check-tags` asks which *element type* a class sits on; `check-compound`
asks which classes share *one element*; `diff-fragment` says in its own header that it
reports nesting that **disagrees**, not nesting that is **absent**. A wrapper simply not
there was invisible to all three. The new gate intersects the classed ancestors of every
occurrence of a class across all 667 captures and requires what survives — what Carbon
puts above it *without exception*. Its first full run found a second instance of the same
defect, `pagination__control-buttons`, hiding behind a note that named the optional
wrapper and never mentioned the styled one. **50 declines are recorded with reasons; 0
findings remain.**

**Two blind spots were found on 2026-08-30, by a tab-order sweep rather than by a gate.
Both shipped a page that passed all seventeen. BOTH ARE NOW GATED, 2026-08-31.**

**An ARIA role Carbon never renders — now `check-aria-roles.mjs`, the twenty-first.**
`sink/ui-shell.html` carried `role="menu"` on the side nav's `ul`; the capture it cites
renders that element bare. `role="menu"` requires `menuitem` children and these are
`li > a`, so an AT was told it had entered a menu and then found nothing in it. Every
class gate was blind by construction — a bare attribute is not a class — and `check-a11y`
was blind by its own rule, which counts `[role^="menuitem"]` descendants and skips a
composite with none, so zero items yielded neither a finding nor a note.

**It is the first thing here that reads the captures' ATTRIBUTE data**, which has been
recorded as `[role=x]{aria-y=z}` beside every element since the first harvest and which
nothing had ever looked at. It reads **332 corroborated role sites, 0 uncovered, 0
invented**, and its red run reproduces the original defect exactly: put `role="menu"`
back on `side-nav__items` and it reports one invented role against 12 captures that
render the class bare.

**Its first run found four divergences, and three were real.** `inline-notification` and
`toast-notification` carried `role="alert"` where Carbon renders `role="status"` — six
sites in the sink and, more to the point, one in `templates/error-state.html`, a shipped
template. `alert` is assertive and `status` is polite, so the markup was interrupting a
listener where Carbon chose not to; both now match Carbon, and an author who wants the
assertive form can still say so. A disabled ghost link carried `role="button"` on an `<a>`
with no `href`, which Carbon never does; removed.

**The fourth is DECLINED, and the reason bounds the whole gate.** `loading` carries
`role="status"` where Carbon renders no role — but `role="status"` is an implicit LIVE
REGION, and `aria-live` is **not** among the thirteen attributes the extractor records.
The capture cannot tell "Carbon announces nothing here" from "Carbon announces it by a
means we never recorded", so removing the role on this evidence would be deciding the
question the wrong way round. Widening the extractor would settle it. That is one KNOWN
entry with a stated limit, not an allow-list.

**A page carrying no heading at all — NOW GATED, 2026-08-31.**
`templates/table-page.html` rendered its only title as `div.data-table-header__title` and
had no `h1`–`h6` anywhere. Heading navigation is a primary way an AT user moves through a
page, and a template IS a page, so the page offered none. Not a provenance fault — Carbon
renders that class as both `h2` and `div`, so neither was invented — which is exactly why
no markup gate could have caught it: it is a composition question, and the gates check
parts.

`check-headings.mjs` is the twentieth gate and closes this one. Every page carries exactly
one `h1` and skips no level; `sink/*.html` is excluded by design, because a fragment is a
specimen and fifty `h1`s in the assembled sink is the opposite of the point.

**ITS FIRST RUN FOUND THE SAME DEFECT TWO MORE TIMES.** The label/value shape fixed on
`detail-page.html` and `dashboard-page.html` at `241feaa` — a bare value promoted into
the outline with its label left behind in the `<p>` above — was still live in
`templates/wizard-page.html` ("Bilbao → Toulouse" as an `h3` under `h1`) and in
`tools/build-portal.mjs`, whose stat tile emitted `<h3>37 / 83</h3>` on every build. A
fourth occurrence was `portal.html`'s template cards at `h4` under `<h2>Templates</h2>`, a
real level skip. **A fix applied to the two files where a defect was noticed is not a
fixed defect**, and nothing here could tell the difference until something read the
outline.

All three are fixed the way `241feaa` fixed the first two, and the swap is invisible by
construction rather than by measurement: `h3` and `.rux--type-heading-04` emit the same
four declarations from the same tokens, and `h3` and `p` share one reset rule, so margins
match too. The portal's template card keeps `h4`'s appearance with
`h3.rux--type-heading-03`.

**Coverage is a ratchet, not a threshold.** `check-coverage` used to report a component
COVERED on a single class hit — `ui-shell` owns 55 classes and one `rux--header` passed
it — so the gate read 31/31 green while 45% of the shipped CSS had never been rendered.
It now measures per-component class coverage against `docs/coverage.json`, which records
what the sink and templates actually achieve (**551/803, 69%**) and fails only when a
component exercises fewer classes than before. A threshold high enough to mean something
would be red today with no action available; a ratchet can only be moved up, and moving
it is deliberate.

**That sentence was prose until 2026-08-31, and prose is not a ratchet.** `--update`
wrote the current measurement unconditionally, so lowering the baseline — the cheapest
possible route from a red gate to a green one — took one command and left a diff nothing
flagged. `tools/check-coverage.mjs` now REFUSES to record a lower number and names the
components; a real loss, a component stripped or a class gone upstream, needs
`node tools/check-coverage.mjs --update --force`, which has no npm script in front of it
and prints what it lowered. Found by the adoption audit and confirmed by probing a copy
of the tree; `adoption-audit.md` carries the transcript.

**It counts the FILE, and the file is not what the reader sees.** `check-coverage` is a
Node tool, so it parses `kitchen-sink.html`; modules then run. `check-runtime-classes.js`
compares the two and the directions are not symmetric. A class STRIPPED at load is
counted while nobody can see it — a green number over a state that does not render, and
it found dropdown.html's two expanded specimens rendering closed for as long as the sink
had shipped an open side nav (§4.5, fixed 2026-08-28). A class ADDED at load is the
harmless direction: the ratchet understates. Three today —
`data-table--selected`, `table-sort--active` and `side-nav__overlay-active` — so on the
sink the real figure is 504, not the 501 the file carries. They are NOT worth hardcoding
into the markup to collect: that duplicates state a module derives from the checkbox, the
sort button and the nav, and the copy goes stale the moment the real state moves.
**0 stripped on all eleven pages, 3 added on the sink and 1 each on `table-page.html`
and `dashboard-page.html` — `table-sort--active` both times, the same module marking the
same thing. Swept 2026-08-31; `docs/gate-coverage.json` carries every cell.**

Sixteen run in `npm run verify`; the other five need a browser. `check-tags` was promoted from a
diagnostic on 2026-08-27, after all fifty findings of its first full run were
adjudicated; its `KNOWN` list carries the seven recorded divergences, each with
its reason, following `check-tokens`' precedent. **`check-a11y.js`, `check-rendered.js`, `check-runtime-classes.js`, `check-spacing.js` and `check-behaviour.js` need a browser** — paste any into the
kitchen sink's devtools console. `check-a11y` is Phase 5's keyboard pass and reports
**12 findings, 6 notes** on the sink, **4 findings** on `templates/wizard-page.html` and
**0 findings, 0 notes** on the other ten pages. The wizard's four are the same
adjudicated `progress-step-button` false positive as eight of the sink's twelve — it is
the only template carrying a progress indicator. Three more are the fluid list box, and
the twelfth is the date-picker calendar; all three causes are adjudicated, each against
different evidence and each left reported rather than suppressed. The sink's notes are CSS specimens
with no trigger, which are not meant to be operable — four menu densities, the overflow menu's options and the
list box's. The figure read 5 here until 2026-08-28, when a measurement taken before an
unrelated change found it had been 6 for some time; a count in prose drifts unless
something re-reads it.

**Twelve of the sixteen are `progress-step-button`, one cause, and it is a false
positive** — adjudicated 2026-08-29 when it was a single finding; admitting
`progress-indicator` as a compiled component multiplied the sites, not the causes, and
`wizard-page.html` then multiplied them again by being the one template that carries the
component. All twelve report the same rule, "no visible focus change". Re-swept 2026-08-31. Carbon draws that ring on
`:focus-visible` on the LABEL and sets `outline: none` on plain `:focus`, which the tool
documents as out of its reach; a real Tab press shows the ring. It is left reported
rather than suppressed, because an exception list is not a passing check.

**The sink is the wrong page to run this gate on alone.** Its bar ships ACTIVE, so the
one state that carries the defect — a closed batch bar whose buttons are still tab stops
— cannot occur there, and the sink read 0 findings for as long as the defect existed.
It surfaced in `templates/table-page.html`, which ships the bar closed, and only because
a page built from that template was checked. **Run it on the templates too, not only on
the sink.** It refuses to run its focus-ring check when `document.hasFocus()`
is false, because `:focus` cannot match in an unfocused document and the check would
otherwise report every control on the page. When it does run it suppresses transitions
first: Carbon fades `outline` over 70ms, an automated pane's animation clock never
advances, and reading mid-fade called 49 rings missing that a key press shows are
there. It reads the ring where Carbon DRAWS it — the label beside a hidden input,
not the 1x1 input focus lands on — and discards outlines that paint nothing, so no
control can pass on the browser's own ring. Until 2026-08-28 it passed 24 checkboxes,
radios and tiles on Chromium's `outline: auto`, and called those same 24 ringless
whenever `:focus-visible` stopped matching. Swept afterwards, all 164 focusable
controls change something that actually paints: 161 move an outline or a shadow, and
three — `skip-to-content`, `header__name` and the menu trigger — carry Carbon's
header treatment instead, a border resting at `transparent` and coloured on focus.
That is the inverse of the tile's transparent OUTLINE and must not be suppressed with
it: the border has width and style, so colouring it paints. No control passes on a
border whose style is `none` or whose width is 0, so that rule is not written — an
unexercised rule measures nothing. **It is not a screen-reader pass** — that needs a human with an AT, and §4.5
stays open until one is done.


**Focus-ring CONTRAST was swept by hand on 2026-08-28, and no gate does it.** All 164
focusable controls in both themes: 126 outline rings, 35 box-shadow rings, 3 that colour
a border. Nothing is below 3:1 on both of its edges. One number is worth knowing — the
data-table toolbar's overflow button reads **2.76:1 on the ring's INNER edge**, where
Carbon's `background-active` sits under an inset ring, and 4.55:1 on the outer edge that
meets the toolbar. Not ours to fix and not a defect: `--rux-focus` compiles to `#0f62fe`
and `#ffffff`, byte-identical to Carbon's generated `$focus`, and the rules are Carbon's
own. The captures in `docs/` cannot check this — they carry markup, no colour.

Two things the sweep does NOT cover. **Forced colors**, where `--rux-focus` becomes the
system `Highlight` keyword and every number above stops applying. And legibility: this is
arithmetic over computed colours, not a judgement that a ring reads at a glance. Carbon's
button ring is two-tone — blue outer, white inner — so scoring one layer against the
surface beneath it says nothing; a first pass did exactly that and called 27 controls
1:1 before the edges were measured separately.

**All three of `check-rendered`'s rules were driven RED and restored on 2026-09-01**, so
its zero is demonstrated rather than assumed: an inset border takes `uaStyled` 0 to 1,
`display: none` on every classed element of a section takes `collapsed` to that section
in BOTH themes, and `position: absolute; left: -600px` takes `escaped` to it. Worth
knowing for the next attempt: **shrinking elements does not work** — `height` and
`min-height` at `!important` still measured 29.97px on a `rux--btn`, because Carbon's own
layout holds the box. `display: none` is the shape that fires it.

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
