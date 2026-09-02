# Log — passes, measurements and answered decisions

Moved out of `README.md` "Picking this up" on 2026-09-02, verbatim and in the
order they stood there, so that README could be the current state and this the
record. **Every figure here is what a gate printed on the date named and is not
the current state** — `npm run verify`, `npm run gates` and `portal.html` are.
Nothing here is regenerated; `tools/build-readme.mjs` says why a record must
not be. A new pass or an answered decision goes at the top of the block below.

---

Everything below is in the repo, so a fresh clone is the whole handover — nothing lives
in an editor session or a machine-local note.

**WHERE THIS STOPPED, 2026-09-02, and the next steps in order.** Phases 9, 10 and
11 are done; the plan being executed is roadmap §4.12 (three creators and the Rux
Portal). Landed: the script questionnaire, `docs/choices.md`, the switcher panel in
every template with its behaviour (`v0.1.1`), and the portal itself, committed in
`~/Developer/rux-sm.github.io` and NOT yet pushed — the GitHub repository
`rux-sm/rux-sm.github.io` must be created by hand first. Then, in order:

1. Push the portal, enable Pages from its workflow, open https://rux-sm.github.io/.
2. Notes gets the switcher button, panel and `/switcher.js` (in `rux-ln-notes`,
   its own task) and becomes module two in fact.
3. Creator 2, the `rux-ds-page` skill's multiple-choice flow, offering only what
   `docs/choices.md` lists and gating the result through this root.
4. Creator 3, the configurator page, as a portal page. Last.

Open decisions, rux's: the hub's name (`portal.html` here is the gate dashboard), and
the custom theme's accent (`css/rux-theme.css` carries a purple placeholder).

**DONE 2026-08-31 — the two `ibm-products` captures carry provenance.** They were the
last unattributed input to a gate; nothing in `docs/carbon-*.json` says `unknown` any
more. Re-captured against `https://ibm-products.carbondesignsystem.com`, 21 stories and
116 state recipes, and the aria allowlist went from 4 attributes to 13 with the rest.

**Carbon had not moved.** All 20 previously-captured stories were byte-identical to the
old file once the new aria attributes were stripped, so the whole diff was the richer
recording plus one story ibm-products has added since —
`patterns-create-flows-createsidepanel--with-form-validation`. `check-tags` and
`check-ancestry` read 642 where they had read 641, and every other number they printed
was unchanged: 1109 classes, 35 with no reference, 5 known divergences, 0 findings; 500
corroborated ancestries, 30 declined, 0 missing. That was the same "proved invisible"
standard §4.8 set for the first stamping pass.

**Both paragraphs above are the record of that pass and NOT the current state. The
capture was widened the same day** — `3448844`, because the eight components Carbon
1.114 added had rows in `docs/inventory.md` and no markup to diff a fragment against,
and a filter limited to side-panel and page-header had never looked for them. **46
stories now, a superset of the 21**, and the reference goes 642 to 667. Still 0 findings
on both gates after it, so widening produced no new fault.

**That number has moved again, and so has everything the gates count.** `date-picker`'s
admission added two state recipes, so the reference is 669; the sixteen admissions of
2026-08-31 roughly doubled what there is to check. **Re-measured 2026-09-02, after
admission batches 1 to 5, this is what the gates print today:**

    check-tags      669 stories · 2208 classes · 81 with no reference · 10 known · 0 on a different element
    check-ancestry  669 stories · 550 corroborated ancestries · 84 declined · 0 missing

Still 0 findings on both. Every figure quoted above this line is the record of a pass and
not the current state — which is the whole reason this README re-measures rather than
carrying numbers forward.

**The widening's own finding is the one worth keeping: the old capture was silently
INCOMPLETE, and nothing reported it.** 14 of the 21 previous stories are byte-identical
here; **seven `preview-pageheader` stories gained DOM.** The cause is measured, not
guessed — `c4p--truncated-text` measures its own overflow and only THEN renders a
tooltip trigger, so at 6s the capture recorded a bare
`span.c4p--truncated-text__text-content`, and at 15s it records that span inside its
tooltip-trigger button with the full popover and tooltip chrome. **A capture that reports
zero failures can still be an early frame**, which is a thing no exit code says.

**`_meta` records named versions and NOT `carbonVersion`**, which is what
`carbon-react-*.json` already does. `@carbon/ibm-products` 2.97.0 is the release the
Storybook welcome page names; `ibmProductsStyles ^2.93.0`, `carbonReact ^1.111.1` and
`carbonStyles ^1.110.1` are read from `/project.json` on that origin rather than
assumed. They are RANGES because that is what ibm-products declares, so a `cds--` class
here is attributable to a range and never to one build. **`carbonStyles ^1.110.1` tops
out BELOW the 1.114.0 this repo compiles** — a `cds--` divergence between these captures
and `carbon-react-*.json` can be Carbon moving rather than a fault here.

**If you ever re-run it, two things about that origin.** The FILTER is still not
optional — the default `/./` harvests all 426 stories, many of which fail on
ibm-products' own `Failed to resolve module specifier "chromatic/isChromatic"`, file as
`(empty)`, and feed a sequential retry the run never finishes. Two attempts died there.
**The committed filter is the widened one, and `_meta.filter` is its source** — the
three-prefix version this README used to print here is superseded and would re-narrow
the capture to 21. `deprecated-coachmark-*` is excluded deliberately: capturing
deprecated markup is worse than capturing none.

And **an `(empty)` on the filtered stories is timing, not that fault.** Measured
2026-08-31, one iframe at a time: `components-sidepanel--slide-over` first paints a
classed element at 4.4s and `preview-pageheader--default` at 6.0s — both right at the
old `SETTLE_MAX_MS` ceiling of 6000, which is why that ceiling produced whole-run
`(empty)` results AND the partial trees above. **The committed capture ran at
`SETTLE_MAX_MS` 15000 with `CONCURRENCY` 2 and filed 0 of 46**, against 21 of 21
`(empty)` on the earlier run's first pass. Both notes are in each file's `_meta`, so the
next reader gets them without this README.

**One question this leaves open, recorded in `_meta` rather than answered:**
`docs/carbon-react-dom.json`'s 505 stories were captured at `SETTLE_MAX_MS` 6000 too.
`react.carbondesignsystem.com` is a much faster origin — 84s for the full 505 — so the
partial-tree risk is far lower there, but it has not been tested.

**What it was worth, stated honestly, and re-measured 2026-08-31 after the widening:**
still **one class**. Four `cds--` classes appear in the ibm-products captures and in no
react story, and exactly one of them is in our compiled CSS —
`cds--btn--expressive`, emitted by the create-side-panel recipe. The widening bought
markup for the eight new components, which is what let `docs/inventory.md` decide them
on evidence; it did not buy a second class. One class, and the end of the last `unknown`
in the reference set.

**DO THIS FIRST — roadmap §4.9, completeness.** Its table is the work list and owns
the progress of each admission batch. `portal.html` is the generated view of the
current component set, and `npm run gates` reports the current browser sweep; do not
copy either figure into prose here.

**Phase 6, templates, is complete.** All ten exist — `app-shell.html`, `table-page.html`,
`form-page.html`, `detail-page.html`, `empty-state.html`, `error-state.html`,
`wizard-page.html`, `dashboard-page.html`, `settings-page.html` and
`schedule-page.html`.
That is the FILE list, not the exit: §4.6 closes when a page shape NOT in
`templates/` can be built without inventing a class.

**THE READING WAS DECIDED 2026-08-31 — the REPO reading**: `templates/` plus
`sink/*.html` plus the captures in `docs/`, which is what `CLAUDE.md` already routes a
page author to. Holding the exit to "templates alone" would fail the system for using
its own documented routing.

**AND THE CRITERION IS NOW MET.** §4.6's **eighth** attempt, the same day, by a fresh
agent in a clean worktree with no session context: a search results page — filled
search, a filter column, six results, count and sort, pagination — **588 lines, 0
invented classes, `verify` exit 0**, `check-a11y` 0 findings with its focus-ring check
run. It reached outside `templates/` seven times and every reach was a sanctioned
source; under the rejected strict reading it would have failed at the first filter
checkbox, which is the clearest argument that the strict reading tested the wrong
thing.

**It found four repo faults, all verified before acting** — a `composing-pages.md`
section that warned about a problem already fixed, three stale counts in the same file,
`pageTargets()` still hardcoded so a consumer page could never become a sweep cell, and
a documented `<legend>` rule applied in none of the nine templates. The first three are
fixed. Roadmap §4.6 carries the entry.

**§4.5's exit criterion has been run, 2026-08-30.** Four VoiceOver recordings, 724
announcements over 13 minutes, transcribed from the caption panel rather than from
memory. Two defects, **both now fixed**: progress steps announced as disabled, fixed at
`17a61c2` and re-heard after; and the toggle announcing its name twice, fixed at
`a5f95c8`. The toggle was recorded here as OPEN and unsettleable until 2026-08-31,
because `aria-labelledby` was not among the four aria attributes the extractor then
recorded — widening that list to thirteen and re-capturing showed Carbon renders
`span.cds--toggle__text{aria-hidden=true}`, which is what stops its own `aria-labelledby`
doubling the name. **The toggle fix has not been re-heard**, only corroborated by the
reference; the progress-step one was confirmed by ear. Three lesser findings recorded.
One prediction withdrawn as an error of mine. Roadmap §4.5 carries the full entry and,
more usefully, what the pass did NOT cover — Safari only, white only, and modal and
popover never opened.

**The remaining human tasks**, kept because the boundary above names it:

- Flip a toggle with an AT running, to close the `a5f95c8` fix by ear. It is
  corroborated by the reference and by nothing else, and this project has one
  red-to-green on record precisely because that one WAS re-heard. Cheap, and it rides
  along with the pass below.

- Open a modal and a popover with an AT running. The 2026-08-30 pass never opened
  either, so a dialog's name on open, focus landing inside it, and whether the page
  behind goes silent are all still unheard. The last is a common defect. Do it in a focused window: `check-a11y.js` still
  refuses its focus-ring check when `document.hasFocus()` is false.
  **`docs/screen-reader-pass.md` is the procedure** — setup, the commands, what is
  already done and must not be re-found, the six specimens and one false positive that
  are not bugs, a section-by-section list of what each one declares, and four specific
  predictions to check first.

  One reason this entry used to give is gone, 2026-08-28: real key events ARE
  delivered in an automated pane — a focused button receives a trusted `keydown` — and
  tabs, menus and the combobox have since been driven by hand that way. Tab order is
  no longer a gap either: swept end to end on 2026-08-30, forward AND in reverse, on
  all seven pages, with 0 divergence from DOM order and 0 mismatches on the reverse.

  **What an automated pane still cannot do is ACTIVATE, and the sentence above used
  to imply otherwise.** Enter and Space on a focused button deliver `keydown` and
  `keyup` with `isTrusted: true` and produce NO `click`: the browser's default action
  never runs. So every surface a button opens must be opened with `.click()` there,
  and only handlers bound to `keydown` itself are reachable by real keys — arrows,
  Home/End, Escape. Measured 2026-08-30 against the menu trigger, with listeners
  attached to see which events arrived. It is the pane and not the page:
  `js/overlay.js:224` preventDefaults on Escape alone, and nothing in `js/` touches
  Enter or Space. This is why `check-behaviour` drives clicks rather than keys.

**Decisions waiting on you**, each recorded where it applies:

| What | Where |
|---|---|
| Answered 2026-08-31: **the 90 KB JS budget is deleted**, not given a unit. It had never cut, deferred or shaped a single module under any reading, which is the test §2.1 used to remove the CSS target. A **60 KB gzipped tripwire** replaces it, `tools/build.mjs` measures it on every build and exits non-zero over it, and `CLAUDE.md`'s scope rule is what actually bounds the layer | roadmap §4.5 |
| Answered 2026-08-29 by `check-glyphs` (the symbol draws its name) and `check-slots` (the right glyph is in the slot). What remains: 24 of 64 icon slots have no Carbon capture, and the `__invalid-icon` family is now covered by ICON_STATES and the sibling rule; 11 slots still have no capture that can answer, two of them the progress-step sites that arrived with the component | roadmap §4.5 |
| Answered 2026-08-31, one at a time with the cost measured for each: **`toggletip` and `time-picker` ADMITTED** and compiled; **`date-picker` ADMITTED** and no longer staged — `sink/date-picker.html`, `js/date-picker.js` and `templates/schedule-page.html` all shipped the same day; **`combo-box` / `multiselect` re-affirmed DEFER** because no page shape needs them | `docs/inventory.md`, "What needs your call" |
| Answered 2026-09-02: **`v0.1.0` is the first tag**, cut with Phase 11; a consumer pins a tag and `sh tools/new-project.sh <dir>` starts a project on it, or moves one to a newer tag (`docs/starting-a-project.md`). `CHANGES.md` is the changelog, removals only. Still no `version` field | roadmap §8.2 |
| Answered 2026-08-29 by `check-behaviour`, 18 cases over 9 modules — the 15th gate when it landed, of 18 now. There is no `tests/` directory at all | roadmap §4.8 |
| Answered 2026-08-31: **it becomes the NINETEENTH gate**, registered as `build-portal-icons` in the `build-namespace` shape — a gate carried by a build tool with no `check-*` file. Consistency decided it, not merit: the identical shape was already registered and no rule distinguished them. The question had been re-numbered twice while pending | roadmap §4.8 |
| The token snapshot runs after Phase 7 documents the values it would pin | roadmap §4.8 |
| Answered 2026-08-29: `dashboard.html` is archived outside the repository and deleted from it. §4.6's entry is the record and stands alone; `portal.html` holds the living-evidence role, committed and swept by four gates. The fifth, sixth and seventh attempts' pages went the same way the same day | roadmap §4.6 |
| Answered 2026-08-31: **`templates/wizard-page.html` exists**, authored to the discipline the other six carry — `BEHAVIOUR:` verified against a running Carbon, `npm run icons`, three ledger cells, three ancestry declines recorded. It settled both questions the plan left open and found one new defect. See below | roadmap §4.6 |

### The metric row was putting bare numbers in the heading outline

**Found 2026-08-31 by the ibm-products capture, on the day it was taken.** The metric
value in `detail-page.html` and `dashboard-page.html` was an `<h3>`, so the outlines read
`h1` then four `h3` — and on the dashboard then went BACKWARDS to `h2`. A listener
navigating by heading heard bare numbers, "6 / 6" and "12.4k", with the label left behind
in the `<p>` above.

**`check-a11y` read 0 findings on both pages before the fix and 0 after.** It does not
inspect heading structure. What found it was capturing `big-number`'s real markup —
`figure` > `figcaption` for the label, `span[role=math]` > `span` for the value, and **no
heading anywhere** — and diffing the hand-composed row against it.

**The fix is `<p class="rux--type-heading-04">` and it is invisible.** Carbon styles the
`h3` ELEMENT from the heading-04 tokens, so the utility emits the identical four
declarations; measured on the running page, identical on all nine computed properties and
the same 133×36 box.

**`figure`/`figcaption` were NOT copied, deliberately.** They appear once in all 667
stories, inside `big-number` itself, so composing them without its classes is unattested
and inherits no spacing — and `rux--tile` on a `<figure>` is a `check-tags` fault, since
Carbon renders that class on `div`, `a`, `button` and `label` only. Two new problems to
fix one. `role="math"` was not copied either: its effect on a real screen reader is
unheard, and this project has twice been wrong reasoning about ARIA from markup alone.

**`big-number` stays DEFER, and the deferral is now honest.** It rested on "tile + type
build that row", which was true visually and false semantically. It is true both ways
now. What admitting the component would still buy is the one thing this fix does not:
`figcaption` naming its `figure`, so label and value are programmatically paired instead
of read as three sequential paragraphs. Its row records the two conditions that reopen it.

### `card` admitted 2026-08-31 — and the reason it replaced had expired

**`card` is compiled**, `sink/card.html` is the 38th fragment at 74% coverage, and the
cost was **measured at +1.2 KB gzipped and 34 classes** (59.7 → 60.9).

**It was admitted AGAINST the admission rule, not under it, and the row says so.** No
page shape in `templates/` requires a card, and `tile` serves the container shape — both
tests point the other way. It is an author's call, recorded as one.

**What made it worth reopening is that its CUT reason had become false.** The row read
"Carbon has no Card — it is an ibm-products preview". That was true when §4.1.14 wrote
it. Since then Carbon promoted the component: `@carbon/styles` 1.114 ships a 474-line
`components/card`, `src/app.scss` had carried a commented `@use` for it all along, and
`docs/carbon-react-dom.json` renders **17 `preview-preview-card--*` stories emitting
`cds--card` 475 times**. Being `preview-*` is not disqualifying here either —
`icon-indicator` and `shape-indicator` are both `preview-*` and both DEFER.

**The general finding is worth more than the row.** An evidence reason ages exactly like
a figure, and nothing in this repository re-reads one. A disposition whose ground has
expired looks identical to one whose ground still holds — `check-inventory` insists a
decision was made, never that it is still true. This one surfaced only because a README
audit happened to grep the captures for it.

**It also corrected a paragraph that cited card as precedent.** The 2026-08-31 decision
on the eight new components justified CUT-over-DEFER with "it is the ground `card`,
`page-header` and `side-panel` were cut on". That holds for the other two, which really
are `c4p--`; it never held for card, which has 17 stories to diff against.

**Fourteen ancestry declines were recorded, one cause.** All 17 card stories mount the
card in a `css-grid` column, so the intersection handed every card class the grid as a
required ancestor. Measured: no rule in `css/rux.css` scopes any card class to the grid.
It is the `links:link--disabled` shape — a sampling artifact of how the component is
demoed upstream. The fifteenth is `btn--icon-only` wanting the icon-tooltip chrome the
sink declines throughout.

**Six classes are unexercised and each has a reason in the fragment.** The media family
— `card__media`, `card__media--horizontal`, `card__title-media`, and with them
`card--horizontal` and `card__content` — needs an `<img>`, and the sink has never carried
a raster image in its life: 59 sprite symbols and nothing else. `card__header-media` IS
exercised, because that one renders an `svg`. The two `--truncate-multi` siblings appear
in no story at all.

### The settings template — BUILT 2026-08-31, and it found a shipped defect

`templates/settings-page.html`. Grouped preferences with a persistent action pair, and
the page that records **`rux--fieldset` against `rux--checkbox-group`**. That choice
matters because `checkbox-group` is CHECKBOX's class and carries
`.rux--checkbox-group .rux--checkbox-wrapper > .rux--form__helper-text { display: none }`
— point a mixed-control group at it and the helper text under every checkbox silently
disappears. §4.6's second attempt got this wrong in both directions and the sixth
overturned the adjudication; it is now written down in a template.

**Verified live:** a fieldset holds a `<legend>` and then a
`stack-vertical stack-scale-7`, and computes margin 0 and border 0 itself. So a group
without that inner stack is flush, and consecutive groups need the OUTER stack because
the fieldset contributes no block margin.

**THE DEFECT: `templates/form-page.html` and `templates/detail-page.html` were both
missing `aria-hidden="true"` on `span.rux--toggle__text`.** That is the fix made at
`a5f95c8` after it was HEARD on 2026-08-30 — the toggle announcing its name twice — and
it went into `sink/toggle.html` and nowhere else. Two shipped templates carried the bug
for a day. It was found by building a third page with a toggle and reading the sink
fragment to copy it properly.

**No gate reads that attribute, and the re-sweep proves it rather than asserting it:**
both pages reproduce their previous numbers exactly after the fix, and `check-a11y` was
0 findings before and after. Both are now fixed, and `form-page.html` carries a note
saying why the attribute is load-bearing.

The settings page itself also shipped, briefly, a toggle with `aria-checked="true"` and
no `toggle__switch--checked` — the module sets that class on interaction and never reads
`aria-checked` at load, so it rendered OFF while saying On. Every gate passed. The
screenshot did not.

`check-a11y` 0 findings, and `check-spacing` 44 · 43 · **1 divergence**, the
self-indent alone — the cleanest reading of any page here.

### The dashboard template — BUILT 2026-08-31

`templates/dashboard-page.html`. The overview shape: a four-tile metric row over a
toolbar-less table beside an activity column. **This is the shape §4.6's FIRST exit
attempt got wrong**, and the reason it is a template now — that attempt shipped tiles
that were invisible, white on white, by copying `layer-two > tile` out of
`detail-page.html` where the idiom is correct only inside something already painting
`layer`. The tiles here are bare and the source comment states the condition.

**Verified live:** 14 of the 25 datatable captures render a `data-table-container` with
a header and NO toolbar, so the compact table is Carbon's own shape rather than
`table-page.html` with parts removed. Its header computes 24px of block-end padding and
the table's top edge sits at exactly the header's bottom — a 0px gap — so nothing should
be added between them. `data-table-header__content` is deliberately absent: Carbon
renders that div in 23 captures and defines no rule for it, so `check-classes` rejects
it, the same call already recorded for `cds--form`.

**No new defect, and that was established rather than assumed.** The page reports four
spacing divergences; `table-page.html` was re-run in the same session, reproduced its
recorded 61 · 58 · 3 exactly, and two of its three are byte-identical to two of these.
The third is `detail-page.html`'s subgrid divergence and the fourth is the self-indent
every template carries. `check-a11y` reads **0 findings, 0 notes**.

Two gate rejections, both useful: there is no bare `rux--list` class — Carbon defines
`list--unordered`, `list--ordered` and `list--nested` and nothing named just `list` —
and `check-tags` caught tag colours written on a `<span>` where Carbon renders them on
a `<div>`.

### The wizard template — BUILT 2026-08-31

`templates/wizard-page.html`, 568 lines. The plan below is kept because the decision
reads better with the reasoning that produced it; what follows first is what actually
happened against it.

**Both open questions are answered, and both from a running Carbon rather than from
`css/rux.css`.**

- **A vertical progress indicator stays vertical below `lg`.** The whole Carbon
  stylesheet was walked for media rules touching `progress`: the only three are
  `forced-colors`, `any-hover` and `prefers-reduced-motion`. No width query touches it
  at any breakpoint, so there is no collapse-to-horizontal to copy, and inventing one
  is behaviour Carbon declines. Confirmed on the built page — `flex-direction: column`
  at 1440 and at 800.
- **A modal goes wherever the control that opens it is.** Carbon does not portal one:
  its parent in `components-modal--default` is a plain static wrapper, and it computes
  `position: fixed; inset: 0; z-index: 9000`, so DOM position cannot affect layout.
  It sits at the end of `<main>` here. The one thing that would break that — an
  ancestor with `transform`, `filter` or `will-change` becoming the containing block —
  is recorded in the template.

**A THIRD TRAP WAS FOUND, and no gate could see it.** The action row first put the
`btn-set` and Cancel in a `stack-horizontal`. That class computes `display: GRID` with
equal tracks, so the set was handed a 299px track while its two children are 196px each
at `flex: 0 0 auto` with `nowrap`. They do not shrink: they overflowed by 93px and
Continue's box ran **85px through Cancel's**. Thirteen Node gates were green, the page
never gained a horizontal scrollbar, and a ghost button has no fill to make the
collision visible. It was found by measuring the page, which is the sixth defect on
this project's list of things every gate passed. Cancel now has its own line.

This extends the finding the archived attempt paid for rather than repeating it: three
buttons in one set overflow, AND a set beside a separate button overflows once the panel
narrows — 196 + 196 + 8 + 77 is 477px against this panel's 432 at md. It fits at lg and
breaks below, which is the worst shape a bug can have.

**What it cost:** the four Node-gate rejections were all useful — `check-tags` caught a
`radio-button-group` written on a `<div>` where Carbon renders it on `<fieldset>`, and
`check-ancestry` caught a missing `form-item` wrapper and wanted three declines
recorded, two of them new to `templates/` because this is the first template with a
modal in it.

**What is NOT covered**, from the template's own label: the read-only summary tile
reuses `detail-page.html`'s verified tile idiom and was not re-read live, and no running
wizard NAVIGATION was compared — this is one step of a flow, not the flow.

---

The plan as it stood before the work. Kept for its reasoning.

1. **Copy `form-page.html`**, which is what the attempt did and what §1 of
   `docs/composing-pages.md` says. Not the archived page.
2. **The shape it proved out**, all of it measured rather than guessed: a
   `lg:col-span-4` step column beside a `lg:col-span-8` panel, `css-grid--with-row-gap`
   so the two do not sit flush once they stack, a vertical `progress-indicator`, a
   read-only summary of the previous step, one field in its invalid state, and Back /
   Continue as a `btn-set` with Cancel OUTSIDE it — three buttons in one set overflow a
   512px panel by 76px, invisibly, because empty grid to the right means no scrollbar.
3. **Verify against a RUNNING Carbon page**, per `docs/verifying-templates.md`. Not from
   `css/rux.css`; four wrong shell answers in one sitting came from reading it.
4. **Write the `BEHAVIOUR:` label** naming the page as a URL, the date, and what was NOT
   covered. `check-provenance` fails without it.
5. **`npm run icons`**, then sweep the three browser gates and record the new cells —
   `npm run gates` will show them as never-run, which fails the build until they exist.
6. **Two open questions it should settle** — where a modal belongs in a page, and
   whether a step column should collapse to horizontal or stay vertical below `lg`.
   *Both were settled by the template and are recorded above: the modal sits at the end
   of `<main>`, and the column stays vertical. "No template carries one" was true when
   this plan was written and stopped being true at `58be97a`; corrected 2026-09-01 after
   `CLAUDE.md` and this line disagreed.*

**Cost is the honest part: this is a day's work, not an afternoon.** The attempt took 580
lines and three corrections, and a template carries more discipline than a sample page.

**Nothing else is pending.** The working tree, `main` and `origin/main` were level at the
last push, and `npm run verify` runs sixteen of the twenty-one gates — `npm run gates`
reports the other five and which pages each has been run against.
`docs/gate-coverage.json` carries each reading with the commit it was taken at.

**38 browser cells — 38 CURRENT, 0 never run, re-swept 2026-09-01 at `0f8c883`.** All
36 that had gone out of date reproduced their previous reading exactly — same figures,
same UNKNOWN sets, same twelve adjudicated sink findings — at 1280×900, white, IBM Plex
serving, focus taken with `Tab` then blurred. The sweep was owed because the line here
read "38 CURRENT, 0 stale" from earlier that day when the truth was 2 and 36, and it
was wrong twice over.
Twenty-four cells — every `check-a11y` and `check-runtime-classes` reading — went stale
at `ecf5ab6`, which put the mark in every template header after they were recorded at
`81e6cb3`. The other twelve, all of `check-spacing`, record commit `32e7eb1`, which is
in no clone of this repository: it was rewritten before the ledger was pushed. Until
2026-09-01 `tools/lib/staleness.mjs` swallowed the git error that produced and read the
empty result as "nothing has moved", so all twelve printed `ok` — a silent pass on the
one gate whose whole job is refusing one. It now reports `UNKNOWN COMMIT`, which prints
and does not block, like `NO COMMIT`. The re-sweep above is what cleared both; the
ledger keeps each superseded reading under the new one, for its adjudication.

The sweep those figures replaced was the second of 2026-09-01: once after the fluid
and date-picker specimens landed, and again after IBM Plex was served. Every template reproduced its previous reading
exactly, at a DIFFERENT width than it was recorded at, which is the first evidence those
readings are not viewport-sensitive. The sink is the only page whose numbers moved, and
both moves are decomposed in `docs/gate-coverage.json`.

**`check-spacing` stopped reporting a COUNT on 2026-09-01, and that was the fix.** The
same tree read 345 · 312 · 33 on one machine and 346 · 311 · 35 on another with nothing
changed, because a few rows carry values derived from text metrics — so the integer moved
while the SET of disagreements did not, and a ledger entry reading "35 diverge" was
unfalsifiable by the next reader. It now carries a **`KNOWN` list on `check-tags`'
precedent**, keyed `signature|property` with a reason for each, and the number to watch is
**unknown**. A known row stays known whether it computes 45.87px or 32.27px.

**Six of the twelve pages now read 0 unknown.** The sink reads 22 known · 13 unknown, and
those thirteen are the honest residue of one pass — `check-tags` took fifty findings to
triage, and this is not finished. Four causes are adjudicated: specimens **blockified** by
the sink's own `.ks-row` (declared `inline-flex`, computing `flex` because the wrapper is
a flex container — the stylesheets agree); **demo styling on both sides** of the grid
comparison, where Carbon's story adds `min-block-size: 80px` that `@carbon/styles`' own
`_css-grid.scss` never sets and the sink adds inline padding; a **classic-vs-`--next`
reference** for the date-picker calendar, which are two components sharing a class name;
and values **derived from the text beside them**, which can only agree if a specimen
carries Carbon's story copy verbatim. Plus the `content` self-indent every template sets
in its own `<head>`, which was the single most common row in the set.

**The sweep earned its keep, which is the argument for keeping the ledger at all.** It
found a real defect and two real accessibility gaps that nothing else had.

**The defect.** `check-runtime-classes` reported `dropdown--open`,
`list-box__menu-item--highlighted` and `side-nav--expanded` **STRIPPED at load** — all
three still in the file, `check-coverage` still counting them, and the page showing a
closed dropdown. `js/date-picker.js` adopted a markup-declared-open calendar and
registered it **without `dismissOthers: false`**, so it tore down every surface already
adopted. `js/list-box.js` documents that exact trap in a comment written 2026-08-28, and
a module authored after it walked straight in.

**The gaps.** Three fluid selects reported "no visible focus change" and were **right**:
Carbon gates a fluid control's ring on a class React adds on focus — `select--fluid--focus`
and its siblings — and nothing here applied it, so a fluid select took focus and painted
nothing at all. `js/form-controls.js` now applies all three, on the three different hosts
the selectors name.

**One new false positive, adjudicated rather than suppressed.** The fluid list box draws
its ring on the WRAPPER and Carbon sets `outline: none` on the field itself, so
`check-a11y` — which reads the control and its label — cannot see it. Measured on focus:
the wrapper goes from `outline: none` to `rgb(15,98,254) solid 2px`. Same family as
`progress-step-button`, and left reported for the same reason.

**`check-a11y` reads 12 findings and 6 notes on the sink** — 8 progress-step-button, 3
fluid list box, **1 date-picker calendar** — **4 on `wizard-page.html`**, the only
template carrying a progress indicator, and **0 on the other ten pages**. The fluid figure
went 1 to 3 because two fluid dropdown state specimens landed: the same false positive at
more sites, not a new one.

**The twelfth was settled against a RUNNING Carbon, and it is a false positive.**
`date-picker__calendar` is `role="grid"` with `tabindex="0"`, computes `outline-style:
none` in both states, and does NOT hand focus to a day when it receives it. Every one of
those is **exactly what Carbon does** — measured 2026-09-01 on
`preview-preview-datepicker--single-with-calendar` at `react.carbondesignsystem.com`:
same role, same tabindex, same `aria-label`, same computed `outline-style: none`, 42 days
at `tabindex="-1"`, and focusing the grid leaves the active element on the grid there too.

**So `js/date-picker.js` matches Carbon and must NOT be changed.** Adding focus
delegation would be inventing behaviour Carbon declines, which this project puts out of
scope. **One point where we are AHEAD of Carbon:** our day buttons paint a
`solid 2px #0f62fe` ring on focus where Carbon's paint nothing in either state. Whether
Carbon moves focus on an arrow key is still unverified — that probe used a synthetic
`KeyboardEvent`, which is not evidence.

This is the procedure `docs/verifying-templates.md` prescribes, and it is the only thing
that could have answered the question: the captures carry markup, not behaviour.

**Why no earlier sweep saw it: the focus CLICK was deleting the calendar.** A press on
empty page is an outside press, and the kernel removes a markup-declared-open surface on
one — measured, present before the click and absent after. So the 9 recorded on
2026-08-31 and an 11 read earlier the same day are both understated. The sweep now takes
focus with `Tab` and then blurs, which is written up in the `sink-check` skill along with
the phantom `skip-to-content` finding a bare `Tab` produces.

**`npm run gates` prints this and does not fail the build**, by design — a gate red on
every commit is one nobody keeps.

**Move it, do not copy it — CLOSED 2026-09-01, and now GATED.** The sixteen
admissions of 2026-08-31 copied instead of moving, leaving `card`, `combo-button`,
`copy-button`, `date-picker`, `fluid` and `stack` with a live fragment in `sink/` and a
dead stub in `sink/deferred/`. That is the defect `2930323` already paid for once —
`sink/deferred/progress-indicator.html` sat for two days after the component was
admitted, a 51-line stub shadowing the 140-line fragment that ships — standing six
times over. Cleared at `1f3da4d`: four deleted because everything they demo is demoed
already, and `date-picker` and `fluid` REBUILT rather than moved, because the stubs were
pre-admission markup. The captures paid for themselves on the way: the `date-picker`
stub had INVENTED `date-picker-container--invalid` and `--short`, which none of the 669
stories render, and both were dropped. Coverage ratcheted 619 to 638 of 937.

**`check-inventory` reads the directory now** — `4727b08`, a rule on an existing gate
rather than a twenty-second one. **It keys on FILENAME COLLISION and not on
disposition**, deliberately: `fluid` and `stack` are fragment names rather than Carbon
component names, so resolving through the inventory would have missed the two hardest to
reason about. Two files with one name is the defect, whatever either is called. Driven
red 2026-09-01 by copying `sink/card.html` back into `sink/deferred/` — one fault,
exit 1, and the message names both paths. Every per-file gate stays blind there by
construction, because `tools/lib/sources.mjs` excludes `sink/deferred/` so that a
finding names a file you can edit.

**The other eight arrived with Carbon 1.114 and were decided 2026-08-31** — `big-number`
DEFER, the other seven CUT — under "The eight that arrived with Carbon 1.114" in
`docs/inventory.md`. Five fail the admission rule's first test and two its second; not
one was decided on bytes. None has a fragment and none can have one until its markup is
captured, because `@carbon/react` renders none of the eight — the same evidence ground
`card`, `page-header` and `side-panel` were cut on. All eight now carry a commented
`@use` line, which they had lacked: **the manifest listed 75 of the 83**, so eight
components sat outside the strip where no gate could see them. `check-inventory` is what
closes that, and §4.2's exit is met again at 83.

