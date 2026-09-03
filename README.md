# rux-ds

A framework-free UI kit built from Carbon v11, kept as complete as Carbon's markup
allows, that any of rux's projects vendors as static CSS, HTML and JS. Goal revised
2026-09-01; `docs/roadmap.md` §1 has the decision and the phases it re-scoped.

**An agent starts at `AGENTS.md`, then “Picking this up” below.** [`docs/roadmap.md`](docs/roadmap.md)
is the end goal and the decision log, read when a decision is being reopened. This README is the index: current state, what
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

What is left of the phase is not code: **a screen-reader pass**. `tools/check-a11y.js`'s
current reading on every page is in `docs/gate-coverage.json`, each finding adjudicated
there with its evidence, and `npm run gates` says whether that reading is still current;
a count copied here read nine, then twelve, then twenty-nine within two days. One reading
was wrong by method rather than markup: the sweep took
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

**Where this stopped, 2026-09-02.** Phases 9, 10 and 11 are done. Phase 7's
component index is implemented but awaits its browser sweep: `portal.html`
carries a Reference column from `docs/component-docs.json`, every compiled
component accounted for and all 135 URLs live, with `action-set` and
`skeleton-styles` honestly marked as having nothing to link. **Its content has
no gate**, which roadmap §4.7 states and proposes. The plan being
executed is roadmap §4.12, three creators and the hub, now named **Rux Apps**,
and after it §4.13: every theme in every app, a profile everywhere, one
backend. Its first step is the next-steps list below.
Landed: the script questionnaire, `docs/choices.md`, the switcher panel in every
template with its behaviour (`v0.1.1`), and the hub itself, committed in
`~/Developer/rux-sm.github.io` on the machine that built it and NOT yet pushed.

**The hub's repository must be named `rux-sm.github.io`, not after the hub.**
Only `<account>.github.io` publishes at the account root, and the root is the
whole arrangement: every module's shell fetches `/switcher.json` and links
`/switcher.js` by absolute path, and `tools/check.mjs` there requires each
`path` to be `/` or `/name/`. A project repository serves at
`https://rux-sm.github.io/<repo>/` instead, where those two fetches 404 —
silently, because `switcher.js` catches and falls back to the entries the page
shipped. `rux-sm/rux-apps` was created on 2026-09-02 and is the wrong name for
this reason; rename it rather than pushing to it.

**Next, in order:**

1. Push the hub, enable Pages from its workflow, open https://rux-sm.github.io/.
2. Notes gets the switcher button and panel and becomes module two in fact.
   **Its pin is current** — moved to `6a64dbd` on 2026-09-02, `e883eef` there,
   seven gates passing. The panel itself waits on item 1: `js/ui-shell.js` only
   opens and closes it, the entries in every template are invented, and the
   shared list is `/switcher.json` at a root that does not exist yet.
3. Creator 3, the configurator page, as a page in the hub. Last.

**Creator 2 is done, 2026-09-02** — the `rux-ds-page` skill's §2, a decision
table of eight rows offering only what `docs/choices.md` lists, naming five
things that are not choices, and gating the result through this root.

**Open decisions, rux's:**

| What | Where |
|---|---|
| Where the switcher manifest contract is written down — the shape of `switcher.json` and what a shell fetches. `js/ui-shell.js` only opens and closes the panel today; every template carries invented entries | roadmap §4.12 |
| The custom theme's accent — a purple placeholder today | `css/rux-theme.css` |
| Whether Notes' `sync-ds.sh` is retired for `tools/new-project.sh`, which already moves a pin around a project's own files and records the tag | roadmap §4.11 |

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

**`npm install --ignore-scripts` BEFORE `npm run verify`, after any pull that touches `package.json`** — `npm ci --ignore-scripts` on a fresh clone. The flag skips the `ibmtelemetry` postinstall every `@carbon/*` package carries, as CI does.
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
so a spurious rebuild marks every browser cell DIRTY. That prints and does not fail
the build, but it destroys a `26 current · 0 stale` state that takes a browser and a
person to re-earn. `npm install --ignore-scripts` then `npm run verify` restores `css/` byte-identically
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
| `js/` | **The behaviour layer.** `overlay.js` is the kernel and loads first; the others delegate to it. Roadmap §4.5 |
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

None is sufficient alone — roadmap §4.1.2 has the bug that proved it — and `npm run gates` prints how many there are and which page each has been run against.

| Gate | Catches | Blind to |
|---|---|---|
| `build.mjs` namespace check | `cds` leakage into output | anything visual |
| `build-portal.mjs` icon assertion | a `#i-name` emitted into `portal.html` that the sprite has no `<symbol>` for — it caught `#i-katex` on its first run | every page it does not generate; its unit is `portal.html` alone |
| `check-classes.mjs` | a class used in HTML **or `js/`** with no CSS behind it · a class whose component was stripped | a class that resolves but renders wrong |
| `check-tokens.mjs` | a `var(--rux-*)` that resolves to nothing | a token whose *value* moved — `check-token-values` covers the values **declared in `css/rux.css`** and only those |
| `check-token-values.mjs` | a `--rux-*` value that moved, was added or was dropped under a stable name, keyed by the context declaring it | a value that changes only through the CASCADE — it reads what `css/rux.css` declares, not what a browser computes |
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

`npm run gates` prints how many gates run in `npm run verify` and how many need a
browser, and which page each browser gate has been run against; the `sink-check`
skill runs the browser ones. Every gate's history — what it was written after, what
its first run found, what was adjudicated and why — is in `docs/log.md`, "Gates".
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
