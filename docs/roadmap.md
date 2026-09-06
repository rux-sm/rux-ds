# Rux DS — Roadmap

The end goal, the route to it, and the numbers that say whether we got there.

The terms **MUST**, **SHOULD**, and **MUST NOT** describe required, preferred, and
prohibited behavior.

This is a decision document. It moves no code. Execution runs against §4.

---

## 1. End goal

**REVISED 2026-09-01, after a review of what the project is for.** The paragraphs
below this block are the goal as first written and stand as the record; this block
is the goal now. The change in one line: **completeness over subtraction, and Carbon
kept as the upgrade path rather than removed.**

> A framework-free UI kit built from Carbon v11, kept as complete as Carbon's own
> markup allows, that any of rux's projects vendors as static CSS, HTML and JS with
> no build step. Page templates are the starting points; a customization layer on
> top carries themes and overrides and never touches Carbon. Carbon stays a
> build-time dependency so a new Carbon version is a bump, a re-capture and a diff.
>
> **Done means:** every Carbon component with a capture is compiled and verified;
> ten or more templates; a documented way to start a project from it; a
> customization layer with all four Carbon themes and at least one that is not
> IBM's; and a Carbon upgrade performed once end to end.

**What it is for**, stated so the phases can be judged against it: a personal tool,
shared with friends when it is ready, so that every web app rux builds shares one
style and one set of behaviours. Many consumers, all of them vendoring a pinned
copy. Its documentation is IBM's own; this repository documents only what IBM
cannot know — the prefix, what is compiled, what is captured.

**What this changed, section by section:** §1.1 gains six decisions dated
2026-09-01; §2.1's admission rule now asks "is it captured", not "does a page
shape need it"; §4.4 Devendor is cancelled and replaced by an upgrade path; §4.7
shrinks from a documentation rewrite to an index; §4.9–§4.11 are new; §7 loses two
lines; §8.2 tags now rather than at a freeze that no longer exists.

---

*The goal as first written, 2026-08-26:*

A framework-free CSS/HTML/JS design system, derived from Carbon v11 **by subtraction**,
whose primary consumer is Claude Code generating consistent pages.

Three properties define done:

- **No Carbon at runtime or in the tree.** No `@carbon/*` dependency, no `--cds-*`, no
  SCSS, no telemetry. Carbon is the quarry, not a dependency.

  > **The RUNTIME half is already met, measured 2026-08-31, and saying so changes what
  > Phase 4 is for.** `css/rux.css` contains zero `cds`, `@carbon/*` appears only in
  > `devDependencies` — there are no `dependencies` at all — and the built stylesheet is
  > committed, so a consumer fetches it from a raw URL and installs nothing. The TREE
  > half is also nearer than it reads: `node_modules/` is gitignored and **git tracks
  > zero Carbon files**; what names Carbon in the repository is three lines of
  > `package.json` and `src/app.scss`'s `@use` list.
  >
  > So Phase 4's remaining value is tidiness of this repository, not a property of the
  > thing it ships — and §4.4 already prices what it costs: no admitting a component, no
  > adding an icon, no theme change, no pricing a subset, no Carbon version bump. Worth
  > weighing against a devendor that KEEPS `src/app.scss` and `package-lock.json` as the
  > record of what was built from, and treats `css/rux.css` as generated-and-committed.
  > Not decided here; §4.4 is where it is decided — and later the same day it was:
  > declined while admissions are open, revisited only on an explicit freeze.
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
| 2026-09-01 | **Completeness: every captured component is admitted** (§4.9) | A keep-set gated by page shapes |
| 2026-09-01 | **Carbon stays a dev dependency; the SCSS build is the upgrade path** (§4.4) | Devendoring and freezing the set |
| 2026-09-01 | **IBM's documentation is the documentation** (§4.7) | Rewriting ~72 usage/style/accessibility pages |
| 2026-09-01 | **All four Carbon themes compiled, plus a custom one** (§4.10) | Two themes |
| 2026-09-01 | **Customization in a layer on top, never in Carbon** (§4.10) | Editing component files to restyle them |
| 2026-09-01 | **Tag milestones now** (§8.2) | Waiting for a freeze that no longer exists |
| 2026-09-02 | **Every theme in every app; the custom theme vendored** (§4.13) | A theme chosen per project, its file project-owned |
| 2026-09-02 | **A profile in every app, local first, cloud at the root** (§4.13) | Sign-in only where an app needs it |
| 2026-09-02 | **One Supabase project for every app, on Free** (§4.13) | A project per app; Pro from day one |

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

**These are 1.113.0 numbers and are left as recorded.** The project has since moved to
1.114.0, where Carbon ships **83 components rather than 75** — so "Full Carbon" below
names a smaller set than the same phrase does in §2.1. The current figures live there;
this table is the baseline the strip was decided against, not a live reading.

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

> **The admission rule was rewritten on 2026-09-01.** It asked whether a page shape
> needed the component; §1 now asks for completeness, so it asks one thing: **is
> there a capture to verify it against?** A component `@carbon/react` or
> `ibm-products` renders in a story is admitted; one nothing renders stays DEFER
> until a capture exists, because a fragment with nothing to diff against is a
> guess. Every CUT row in `docs/inventory.md` that fails only the old test becomes
> a §4.9 work item. The KB tripwire stands as the only size instrument.

**Admission.** A component enters `src/app.scss` when EITHER ground holds, and the
`docs/inventory.md` row records which one, the measured cost, and the answer to 2:

1. A named page shape in `templates/` requires it, **or**
2. The maintainer asks for it.

And in both cases the row must answer: **does anything already in the set serve this
shape?** That is a question to answer in the open, not a veto.

> **AMENDED 2026-08-31, and the amendment is an admission that the rule had stopped
> describing the project.** It read "only if BOTH hold", with (1) as a hard gate. On
> 2026-08-31 sixteen components were admitted and **exactly one cited it** —
> `date-picker`, via `templates/schedule-page.html`. `card`'s row had to say "ADMITTED
> AGAINST RULE 1 RATHER THAN UNDER IT". The other fourteen went in because they were
> asked for, or came with the fluid family. **A rule overridden fourteen times in a day
> is not gating anything; it is making honest admissions read like violations.**
>
> **Why it stopped fitting is a change of job, not a loss of nerve.** Rule 1 was written
> in Phase 3, when the work was MINIMISING a keep-set and `templates/` was the only
> demand signal there was. §4.6 is now met, ten templates exist, and the job has changed
> from "prove a small set can build pages" to "be a library Claude Code picks components
> from". Rule 1 describes the old job.
>
> **What is kept is what the rule actually bought**, and all three survived the change:
> a cost measured per component and written down; a stated reason; and a re-read of the
> evidence behind any existing disposition. Those found real things on 2026-08-31 —
> `card`'s "Carbon has no Card" and `user-avatar`'s "the shell already answers this" were
> both false by the time they were re-read, and neither would have been caught by a rule
> that only asked whether a template needed the component.
>
> **Rule 2 becomes a question rather than a veto for the same reason.** `user-avatar` is
> the case: "the shell already answers this" was a rule-2 pass, and it was wrong — it
> described the header's avatar ICON, not a component with initials, four sizes and
> twelve colour orders. A veto invites a one-line dismissal; a question invites the
> comparison that shows the dismissal is wrong.
>
> **What this does NOT relax.** Cost is still measured before admission, never after.
> Every row still carries a disposition. `check-inventory` still fails on a component
> with no row, and `check-coverage` still refuses a component that renders nowhere —
> which is the check that now does the work rule 1 was doing badly.

**Tripwire.** If the built stylesheet exceeds **96 KB gzipped**, it has outgrown the
current full-Carbon ceiling. That means duplication or an opt-in layer, not admission.
Re-measure full Carbon on the pinned dependency before changing the number.

> **RAISED FROM 85 TO 96 ON 2026-09-01 FOR THE COMPLETENESS DECISION.** The old
> invariant was that no legitimate admission reached 85. Batch 5 does: measured in
> memory from the same manifest and Sass compiler the build uses, without changing the
> tree:
>
>     72 components, 2 themes, current       84.681 KB gzipped
>     77 components, 2 themes, batch 5       91.719 KB gzipped
>     77 components, 4 themes, phase 10      92.423 KB gzipped
>     83 components, 2 themes, full set      93.231 KB gzipped
>     83 components, 4 themes, full Carbon   93.955 KB gzipped
>
> 96 is one clear integer step above the measured ceiling. 94 would sit only
> 0.045 KB above it and flap on the next dependency movement; 100 would add 4 KB
> of room with no measurement supporting it.
>
> **WHAT THIS MAKES WEAKER.** The tripwire no longer notices the full set being
> re-enabled. It notices the build outgrowing Carbon. Completeness makes all captured
> components legitimate options, so the old component-set alarm and the current goal
> cannot both survive. The 75-to-85 account below is retained as history; its claim
> that the full component set must trip is superseded by this decision.

> **RAISED FROM 75 TO 85 ON 2026-08-31, AND ENFORCED FOR THE FIRST TIME.** Both halves
> matter. The number read 75 and lived in PROSE ONLY — nothing computed it — so
> admitting the fluid family took the stylesheet from 66.4 to 70.5 KB with nothing
> standing between it and the limit. `tools/build.mjs` now measures it on every build
> and exits non-zero over it, beside the JS tripwire that was already enforced.
>
> **AND THE ORIGINAL RATIONALE WAS WRONG, which is why this is a correction and not
> just a raise.** This paragraph named "a theme added by accident" as one of the two
> things the tripwire catches. It does not, and 75 never did: measured 2026-08-31,
> adding BOTH remaining themes — g10 and g90 — moves the stylesheet from 70.5 to
> **73.4 KB**. Two entire themes cost **+2.9 KB**, because a theme is ~600
> custom-property VALUES and gzip dedupes them against the two already compiled. The
> claim had never been measured; §2's own baseline row, which reads 51 KB at one theme
> and 71 KB at two, was taken against the FOUNDATION before the strip and does not
> describe a keep-set of fifty components.
>
> **What the tripwire actually watches is the component set**, which is the term that
> dominates: 23.5 KB separates today's keep-set from all of Carbon at 94.0 KB. 85 trips
> on roughly two thirds of the remaining components coming back at once, and leaves
> room for the deliberate admissions 75 no longer had room for — the fluid family alone
> was +5.04 KB.
>
> **If it trips, re-open the set and not the number.** A tripwire amended each time it
> is tested was never a constraint, which is the argument §2.1 used to delete the KB
> target and §4.5 used to delete the JS budget. This raise is on record precisely so
> the next one has to answer it.

> **DECIDED 2026-09-01, by rux: THE DEFER SET IS ADMITTED AS CAPACITY ALLOWS, and the
> capacity was measured before deciding rather than after.** The ask is that components
> and icons be available as OPTIONS even when nothing currently uses them, which is the
> direct continuation of §2.1's amendment of 2026-08-31 — the job is to be a library
> components are picked from, and a library that makes you edit the manifest first is
> not offering an option, it is offering a chore.
>
> **The three measurements that decide it**, taken by compiling each set and reading
> `tools/build.mjs`:
>
>     50 components, today          70.4 KB gzipped     14.6 under the tripwire
>     61 components, + all 11 DEFER 77.4 KB gzipped      7.6 under
>     83 components, everything     93.2 KB gzipped      8.2 OVER — trips
>
> **So the whole DEFER set fits and the whole catalogue does not.** Eleven components —
> `multiselect`, `combo-box`, `file-uploader`, `slider`, `treeview`, `progress-bar`,
> `action-set`, `aspect-ratio`, `big-number`, `icon-indicator`, `shape-indicator` — cost
> **+7.0 KB gzipped between them** and land 7.6 KB below a limit this section says no
> legitimate sequence of admissions should reach. That is the answer to whether the
> tripwire and the amended job are in conflict: they are not, and nothing here needs
> raising. The 22 CUT components are the ones that do not fit, and they are also the
> ones already judged unwanted, which is a coincidence worth noticing rather than
> engineering around.
>
> **ADMITTED A FEW AT A TIME, NOT IN ONE SWEEP, and the reason is the discipline rather
> than the bytes.** Admitting a component here is a row in `docs/inventory.md` with a
> measured cost and a stated reason, a fragment carrying `PROVENANCE` diffed against the
> captures, a line in `sink/ORDER`, a coverage ratchet, and the gates re-run. `card`
> took a session on its own. Eleven at once produces eleven components no worked example
> can be pointed at, which is the state `check-coverage` exists to refuse.
>
> **Two consequences, stated so neither reads as a regression later.** Class coverage
> falls as a PERCENTAGE the moment a component compiles, because it brings classes
> nothing exercises yet — `check-coverage` ratchets per component so it will not fail,
> but 638/937 becomes 638 over a larger denominator and the headline drops. And **three
> of the eleven cannot have a fragment yet**: `big-number`, `icon-indicator` and
> `shape-indicator` have no captured markup, because `@carbon/react` renders none of
> them. They wait on the ibm-products capture; the other eight do not.
>
> **The icon question folds into this and mostly dissolves.** 23 of the sprite's 59
> symbols are referenced by nothing today, and twelve of those are the severity family
> belonging to `icon-indicator` and `shape-indicator`. Admitting those two makes most of
> the dead weight live. What remains is the sharper half — icons for components that
> SHIP whose states the sink never demos, `i-time` first, since `time-picker` was
> admitted on 2026-08-31 and its icon is on no page. That is a sink gap, not sprite
> bloat, and deleting the icon would have hidden it.
>
> **Icons are kept regardless, and the cost of keeping them was measured too**: the 23
> unreferenced symbols are 6,457 raw bytes but **1,717 gzipped per page, 2.5% of a
> page** — far too little to trade against an author reaching for `#i-time` and finding
> nothing. What they need is not deletion but a recorded reason each, so that "kept on
> purpose" stops being indistinguishable from "left behind"; `check-icons` has no such
> list today, which is why 23 accidental symbols would look exactly like these 23.
>
> **The rejected alternative**, stated so it is a choice: compile all 83 and raise the
> tripwire. Declined on this section's own terms — a tripwire amended each time it is
> tested was never a constraint — and unnecessary, since the set that was actually asked
> for fits under it.

> First use of the admission rule, 2026-08-28: `data-table/sort`, `/expandable`
> and `/action` were admitted at +2.9 KB gzipped, because the table page is a
> named Phase 6 shape and sorting and row selection are what it is for. The rule
> decided it; the tripwire was never consulted, which is the division of labour
> this section is arguing for.

**THE JS BUDGET IS DELETED, 2026-08-31, and replaced by a tripwire.** It read
"≤90 KB of behavior JS" from the start.

**It is deleted on §2.1's argument, not on a new one.** §2.1 removed the CSS KB target
after establishing that across three revisions it decided no component either way. The
same three tests apply here and the JS budget fails all three:

- **It never decided anything.** Not one module in `js/` was cut, deferred, shaped or
  declined because of it. All twelve exist because a Carbon component needed behaviour.
- **It was questioned every time it was measured.** Finding 14 below said so when the
  files were 83.5 KB, and proposed "gzipped or nothing"; the 2026-08-31 re-measure said
  so again at 119.2 KB. A number amended each time it is tested was never the constraint.
- **Something else was already doing the job.** `CLAUDE.md`'s scope rule — modules make
  Carbon's components work, they do not add interactions Carbon declines — is what
  actually bounds this layer. The accordion's note on arrow keys is that rule working.
  It is a judgement about what belongs, which is the shape the admission rule has too.

**One asymmetry is real and is why something replaces it rather than nothing.** CSS is
SELECTED from Carbon and therefore bounded upstream at 83 components. JS is WRITTEN, so
nothing outside the repository bounds it. That argues for a smoke alarm, exactly as
§2.1 concluded for CSS — not for a budget.

**Tripwire: if `js/` exceeds 60 KB GZIPPED, something structural has changed.** Most
likely a library vendored into `js/`, which is the one growth the scope rule would not
already have caught. Re-open the layer. Against today's 34.6 KB it is deliberately wide;
writing more modules does not reach it.

**Gzipped, and the unit is now settled rather than missing.** It is what a browser
receives and it is the unit §2.1's CSS tripwire already uses. Raw bytes would count
comment, and this layer is 61% comment on purpose — a rule whose only route to
compliance is deleting the reasoning is a rule working against itself.

**AND IT IS MEASURED, which the budget never was.** `tools/build.mjs` prints js modules,
raw and gzipped on every build beside the stylesheet's figures, and EXITS NON-ZERO over
the tripwire. The old budget lived only in this sentence, was re-derived by hand
whenever somebody wondered, and drifted 83.5 → 119.2 KB unnoticed. Note that §2.1's CSS
tripwire is still prose-only and consulted by eye; that inconsistency is left as the
author's call rather than fixed here, since §2.1 is a recorded decision.

> **The missing unit now decides the outcome, 2026-08-31.** Finding 14 below flagged
> that ≤90 KB names no unit, when all three readings agreed and the point was academic.
> They no longer agree: `js/` measures **119.2 KB raw — over — against 46.8 KB of code
> and 34.6 KB gzipped, both comfortably under.** The growth since is almost entirely
> comment: raw went 86.1 → 119.2 KB while code went 45.5 → 46.8, and the comment share
> went 47% → 61%. Whichever unit is chosen, choosing it now flips a verdict rather than
> tidying a sentence.
>
> **RESOLVED THE SAME DAY, and not by choosing a unit.** The question "which of three
> readings does the rule mean" turned out to be the wrong one: the rule had never bound
> anything under ANY reading, so the budget was deleted and a 60 KB gzipped tripwire put
> in its place. See the top of this section. The measurement above stands as the reading
> that prompted it.

Re-measured 2026-08-31 against `@carbon/styles@1.114.0`. Reproduce with
`tools/measure.mjs`, which reads the theme pair AND the emit-includes from
`src/app.scss`:

| Configuration | Minified | **Gzipped** | Classes |
|---|---|---|---|
| Full Carbon — 83 components / 87 modules, 4 themes | 939 KB | 94.0 KB | 1,862 |
| **Shipped — 36 components / 39 modules, 2 themes** | 586 KB | **59.4 KB** | 1,237 |
| Shipped set — 1 theme | 564 KB | 57.8 KB | 1,237 |
| Shipped set — 4 themes | 631 KB | 60.2 KB | 1,237 |

> **Amended 2026-08-31, and the previous reading of this table was wrong rather than
> merely old.** It said 31 components / 34 modules / 546 KB / 55.6 KB, and the sentence
> above it promised `tools/measure.mjs` "matches `css/rux.min.css` byte for byte". That
> promise stopped being true at `4beac65`.
>
> **The tool built its synthetic stylesheet from a HARDCODED include list** — `reset.reset`
> and `type.default-type` — while `src/app.scss` had admitted `type.type-classes`. So it
> priced a configuration this project does not ship, understating the shipped set by
> 24 KB minified and 73 classes, and every figure it fed into this section and
> `docs/inventory.md` inherited that. This is the SAME failure as the theme pair
> recorded below — a second copy of the manifest, drifting — and it now has the same
> fix: the emit-includes are read from `src/app.scss`. The shipped row matches the built
> artifact to the 599-byte attribution banner (59.4 KB here, 59.7 KB with it).
> Re-measured 2026-08-31 after `toggletip` and `time-picker` were admitted; the row
> moved with the set, which is the behaviour the fix was for.
>
> **A symptom was visible, though not in this table.** This one read 1,112 classes for
> the shipped set at one, two and four themes — self-consistent, and wrong only in being
> stale. `docs/inventory.md`'s copy read **1,128 at two themes and 1,112 at four**, and a
> theme cannot remove a class. That contradiction sat in a published table across three
> revisions of this section with nobody reading the column.
>
> **CARBON 1.114 SHIPS 83 COMPONENTS, NOT 75.** `big-number`, `coachmark`, `EditInPlace`,
> `FullPageError`, `InterstitialScreen`, `OptionsTile`, `scroll-gradient` and
> `user-avatar` — names this project first met in the `ibm-products` captures, now
> absorbed into `@carbon/styles` itself. The full baseline therefore moved 881 → 939 KB
> for two independent reasons at once, and separating them matters: eight new
> components, plus the type utilities the tool had been omitting.
>
> **§4.2's exit — "75 rows, every row decided" — is no longer met**, and this is a
> DECISION, not a measurement. A Carbon upgrade can now widen the component set behind
> the inventory's back, which nothing in this plan anticipated.
>
> **Rows were written 2026-08-31** under "The eight that arrived with Carbon 1.114" in
> `docs/inventory.md`, with each one's standalone size, its marginal cost against the
> shipped set, and the evidence against it. `big-number` is **DEFER** — it is the only
> one a template shape wants, the detail-page metric row, and it is blocked on having no
> markup reference rather than on cost.
>
> **The other seven were decided CUT the same day.** Five fail the admission rule's first
> test — no named page shape in `templates/` requires them — and `FullPageError` and
> `OptionsTile` fail the second, since `error-state.html` and `tile` already serve
> those shapes. **Not one was decided on bytes**, which is the pattern this section
> recorded when it removed the KB target. For these eight CUT and DEFER are
> operationally identical — neither compiles, and none can have a `sink/deferred/`
> fragment while nothing renders them — so the word chosen is the one this document
> already uses for "declined on evidence". `user-avatar` and `EditInPlace` are flagged
> in `docs/inventory.md` as the two likeliest to come back.
>
> **The manifest had listed 75 of the 83.** All eight now carry a commented `@use` line,
> which changed no CSS and closed a hole nothing could see: a component `src/app.scss`
> does not name can be neither kept nor cut. `check-inventory` now requires it.
>
> **The tripwire held throughout** and was never consulted: 59.4 KB gzipped against
> 75 KB. It correctly did not fire, since nothing structural went wrong — the growth is
> one admitted component and a deliberate type-utility emit.

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

**Revised 2026-09-01 and 2026-09-02 — Plex is served, self-hosted and opt-in.** The way
out above landed at `81e6cb3` without the flag: `assets/fonts/plex.css` carries
hand-written `@font-face` rules against the split Latin1 woff2 files copied from Carbon's
own `@ibm/plex-*` dependencies, nothing in `css/rux.css` references it, and a page opts in
by linking it. Two things were then found on a consumer page and fixed on 2026-09-02.
**`font-display: swap` redrew every page**: first paint in `system-ui`, then a re-wrap when
Plex arrived, because the file is only discovered after the stylesheet parses and the
faces differ in width and line height (21px against 19px at 16px). Now `optional`, so a
load shows one face and never swaps, and every page preloads the files it reaches so the
fetch starts with the HTML. **Plex Mono was reached and not shipped**: the reset sets every
`<code>` in it, and the sink and portal set one, so those rendered in the machine's
monospace. Mono 400, Latin1, now sits beside Sans. Rejected: a metric-matched fallback
face (`size-adjust`, `ascent-override`), because the ratio is string- and OS-dependent
and the `local()` list it would name is not the face the stack actually falls to.

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

Exit: `docs/inventory.md`, a row for every Carbon component, every row decided. **This
read "75 rows" and was met at 75; Carbon 1.114 ships 83.** The wording is now the
count-free one, because pinning an exit to a number a dependency controls is what let
this close while incomplete.

**Re-opened and re-closed on 2026-08-31.** The eight new components were rowed, then
decided — `big-number` DEFER, the other seven CUT, five on rule 1 and two on rule 2.
**The exit is no longer defended by prose.** `tools/check-inventory.mjs` is the
eighteenth gate and runs in `npm run verify`: it reads Carbon's own component directory,
`docs/inventory.md` and `src/app.scss`, and fails on a component with no row, a row with
no disposition, a row Carbon no longer ships, a component the manifest does not list, or
a disposition the manifest contradicts. The next Carbon bump that widens the set fails
the build that installs it, which is the only reading of this exit that a dependency
cannot quietly invalidate.

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

**CANCELLED 2026-09-01, and replaced.** §1 now wants a Carbon version to be a bump
rather than a re-merge, and deleting the SCSS is the one thing that would make that
impossible. The runtime property the phase existed for is already met: consumers
take `css/rux.css`, `js/` and the sprite and install nothing. What stays is the
record below of why it was planned and why it was deferred.

**Phase 4 is now the upgrade path.** Bump `@carbon/styles` in `package.json`,
`npm install`, re-run `tools/extract/` against the matching Storybook so the
captures move with the version, `npm run verify`, sweep the five browser gates,
and read what `check-tags`, `check-ancestry`, `check-slots` and `check-spacing`
report as moved. Exit: one upgrade performed end to end and written up, including
the components the new version added or removed, so the second is a procedure
rather than an expedition. `README.md`'s warning about a stale `node_modules`
rewriting the stylesheet is the first trap on that path.

*As first planned:*

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

> **DECIDED 2026-08-31, by rux: the devendor is DECLINED while admissions are open,
> and Phase 4 closes as met-by-measurement rather than met-by-deletion.** §1's note of
> the same date carries the measurement: the runtime half of the goal already holds —
> zero `cds` in `css/rux.css`, no `dependencies` at all, a consumer fetches the
> committed stylesheet and installs nothing — so the only thing steps 1–2 still buy is
> tidiness of this repository, and their price is everything this section lists: no
> admitting a component, no adding an icon, no theme change, no pricing a subset, no
> version bump.
>
> **What tipped it is §2.1's amendment of the same day.** The project's job changed
> from proving a small set can build pages to being a library components are picked
> from, which means MORE admissions, and the door's price is exactly the ability to
> admit. Buying repo tidiness by selling the project's new job is the trade declined.
>
> **The shape kept is the one the repository already has**: `src/app.scss` and
> `package-lock.json` stay as the record of what was built from, `css/rux.css` is
> generated-and-committed, `@carbon/*` stays in `devDependencies` only.
>
> **The rejected alternative**, stated so it is a choice: run steps 1–2 as written and
> freeze the set now. Nothing above argues it can never be right — only that it is
> wrong while the admission ground of §2.1 is live.
>
> **Trigger to revisit: the set freezes** — an explicit freeze decision, not mere
> quiet. If that day comes, steps 1–2 stand as written. One knock-on, corrected in
> place at §8.2: the versioning deferral's trigger read "when Phase 4 freezes the
> component set"; since Phase 4 may now never run, that trigger is the freeze itself,
> however it arrives.

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
> **14. The 90 KB JS budget needs a unit before it can bind. ANSWERED 2026-08-31 — the
> budget was deleted instead, and this entry's own "or say nothing" is what happened.**
> See §4.5 above: a 60 KB gzipped tripwire replaces it, `tools/build.mjs` measures it on
> every build, and the scope rule in `CLAUDE.md` is what actually bounds the layer.
> The original finding follows.
>
> **14. The 90 KB JS budget needs a unit before it can bind.** The files measure 83.5 KB
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

**TWO DEFECTS, BOTH NOW FIXED** — the second after this entry was first written.

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

**Toggle announced its name twice — fixed at `a5f95c8`.** Heard "On On, on, switch" and
"Off Off, off, switch". `aria-labelledby` on the switch points at the whole `<label>`,
which holds both `toggle__label-text` and the state span `toggle__text`, so the name
computes to both and a reader hears the word three times.

**On the day it was heard this could not be settled, and that is the part worth
keeping.** `aria-labelledby` was not among the four aria attributes
`tools/extract/react-dom.js` then recorded — the same allowlist this section already
cites for `aria-hidden` and `tabindex` — so zero occurrences across the captures meant
they were SILENT, not that Carbon omits it. The entry said so and said it needed a
running Carbon page.

**The re-capture answered it instead.** Widening that allowlist to thirteen and
re-capturing at Carbon 1.115.0 rendered
`span.cds--toggle__text{aria-hidden=true}` — Carbon hides the state span, which is why
its own `aria-labelledby` does not double. The label still holds both spans; only one is
readable. Ours had no `aria-hidden`, so both counted. Four spans in `sink/toggle.html`
carry it now and the fragment records why, so it is not stripped later as noise.

**It has NOT been re-heard.** The progress-step fix above was confirmed by ear; this one
is corroborated by the reference and by nothing else. Flipping a toggle with an AT
running belongs with the modal and popover pass that §4.5 still owes — see
`docs/screen-reader-pass.md`, which carries this finding in full.

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

**THE READING IS DECIDED, 2026-08-31: the REPO reading.** Source is `templates/` plus
`sink/*.html` plus the captures in `docs/` — which is what `CLAUDE.md` already routes a
page author to, and holding the exit to "templates alone" would fail the system for
using its own documented routing. Both halves are required: the classes must resolve
AND the page must be right. The first attempt satisfied "without inventing" and still
shipped tiles that were white on white, which is the half that costs something to check.

**The two rejected readings, with what each was worth.** *Templates alone* was the
literal text and failed twice on a missing metric-row idiom that attempts three and
four had to fetch from `docs/carbon-react-dom.json`; `templates/dashboard-page.html`
now carries that row, so the strict reading is newly winnable — it is rejected because
it contradicts the routing, not because it cannot be met. *Does the frame teach* is the
sharpest of the three and is a question about `app-shell.html`'s quality rather than
about whether the phase exits; it is not discarded, it is simply not this criterion.

**WHAT THIS DOES NOT DO IS CLOSE THE PHASE.** Seven attempts ran against nine
templates, but the last of them predates `wizard-page.html`, `dashboard-page.html` and
`settings-page.html`. One fresh-agent run under the decided reading is what closes
§4.6.

> **EIGHTH ATTEMPT, 2026-08-31 — MET, and §4.6's EXIT CRITERION IS SATISFIED.** The
> first run under the reading decided the same day. A search results page — filled
> search, a filter column of checkbox and radio groups, six results, count and sort,
> pagination — a shape none of the nine templates covers. **588 lines, 0 invented
> classes, `npm run verify` exit 0.** Run by a fresh agent in a clean worktree with no
> session context.
>
> Browser gates on its own page: `check-a11y` **0 findings, 0 notes, focus-ring check
> RAN** — it had a focused window, which this session's automated pane did not;
> `check-runtime-classes` 0 stripped; `check-spacing` 54 · 52 · 2, both divergences the
> already-recorded self-indent and a grid demo artifact.
>
> **It reached outside `templates/` seven times, and that list is the phase's real
> output.** `sink/search.html` for the FILLED search state, which no template ships;
> `sink/checkbox.html` and `sink/radio.html` because **no template carries a checkbox or
> radio group at all** — `settings-page.html` deliberately uses `rux--fieldset` for mixed
> groups; `sink/dropdown.html` for the sort control, no template having a dropdown, where
> `--inline` needs the modifier on THREE elements; `sink/tile.html` for the selectable
> tile; `css/rux.css` and the captures to settle which element `tile--is-selected` may sit
> on. **Every one of those is a sanctioned source under the repo reading, which is the
> reading being tested.** Under the rejected "templates alone" reading this attempt fails
> at the first filter checkbox — which is the clearest argument yet that the strict
> reading was testing the wrong thing.
>
> **The design decision it got wrong first is worth more than the page.** It planned the
> result list as radio tiles, on the captures' evidence, and abandoned that for two
> reasons it verified rather than guessed: `label`'s content model is phrasing-only so a
> title/description/metadata block cannot legally sit inside one, and `stack-vertical` is
> attested on `div` and nothing else. What put it right was reading `js/tile.js:173`,
> which syncs `tile--is-selected` from `aria-checked` AT ADOPTION. **This is the exact
> inverse of the settings-page defect** (§4.6, 2026-08-31), where a toggle shipped
> `aria-checked="true"` and rendered OFF because `js/form-controls.js:133` reads the
> attribute only on interaction. **The two modules differ and NOTHING in the repository
> says which adopt load-time state.** That is a real documentation gap, found by someone
> having to read both.
>
> **Not one of the twelve documented traps caught it out** — §3.1, §3.2, §3.3, §3.4,
> §3.5 and §3.10 all fired before the markup was written rather than after. The traps
> that bit were the undocumented ones, and they are now §3.13 and the corrections below.
>
> **The page is ARCHIVED and not committed**, on the same reasoning as the five before
> it: `~/Developer/_archive/rux-ds-exit-attempts/search-page-attempt-eight.html`.

**FOUR REPO FAULTS THE ATTEMPT FOUND, all four verified independently before acting:**

1. **`docs/composing-pages.md` §3.4 was FALSE.** It warned that `icons.mjs` reads
   `templates/` only and a consumer page drifts silently. `spritePages()` has since
   covered any root page carrying the markers; the attempt copied the sprite, ran
   `npm run icons`, and got `0 of 10` refreshed because it was already current. **A doc
   that warns about a fixed problem sends the reader to do unnecessary work by hand.**
2. **`docs/composing-pages.md` counts were stale** — "Six exist" for nine templates,
   "34 of 75" for 37 of 83, "642 stories" for 667. Exactly the drift the document
   predicts about itself in its own closing section.
3. **`gates.mjs pageTargets()` still carried the hardcoded page list** that
   `sources.mjs` exists to have ended — so a consumer page at the root, THE ARTEFACT
   THIS PHASE EXISTS TO MAKE POSSIBLE, could never become a sweep cell, and
   `npm run gates` would report a full green matrix without ever naming it. Four NODE
   gates had been fixed for this at `9186429`; the browser half was missed. Now
   discovered, and proved: a root page nobody has swept takes `check-gates` to exit 1.
4. **§3.9's `<legend>` type-class rule is documented and applied in NO template** —
   all nine use a bare `<legend class="rux--label">`, `settings-page.html` included,
   which is the page whose three legends are the rule's own worked example. NOT FIXED
   here; it changes four shipped templates and wants its own decision.

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

**RE-SCOPED 2026-09-01.** IBM's documentation is the documentation; rux builds
pages from it and customizes slowly. This phase is now **a component index**: one
page, one row per compiled component, linking to Carbon's usage, style and
accessibility pages, and carrying the three things IBM cannot know — that `cds`
reads `rux` here, which variants are captured and shipped, and which fragment in
`sink/` is the markup to copy. `portal.html` already carries the rows; the links
are what is missing. Exit: every compiled component has a row with a live link.

**THE LINKS LANDED 2026-09-02; the content exit is met with two named
exceptions, and the page's browser sweep is still owed.**
`docs/component-docs.json` carries one reference per compiled component and
`portal.html` renders it as a fourth column. 37 components have a page of their
own in IBM's nav, 23 are documented on another component's page, 15 have no page
and carry a captured specimen instead, and 2 — `action-set` and
`skeleton-styles` — have neither and say so. All 135 distinct URLs returned 200
on the day. **The column distinguishes the four kinds and must go on doing so**:
guidance for this component, guidance for the page it is documented on, a
specimen that is not guidance at all, and nothing. Collapsing them into one
"docs" link would assert what none of the last three say.

**What is still missing is a gate.** Nothing fails when a newly admitted
component has no entry — the column simply shows an em dash — and nothing
re-checks the URLs, so a page IBM retires becomes a confidently wrong reference
with every check green. That is the failure class §4.9 keeps finding by looking.
Proposed and not built, because a control must not be authored in the run it
would judge: `check-component-docs`, and the two new files added to
`CONTROL_FILES` once they feed `portal.html`.

*As first planned:*

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
| Token value snapshot | a value moving under a stable name — **declaration half landed 2026-09-02**, computed half open |
| Namespace check | `cds` leakage, invented `rux-*` names, interpolated class names |

The token snapshot is the one that matters most and the one most likely to be skipped:
every other gate is name-based, so a changed *value* passes all of them silently.

> **Sequencing, raised 2026-08-29 (`docs/audits.md` finding 4).** Execution order is
> 1 → 2 → 3 → 5 → 6 → 4 → 7 → 8, which puts the token snapshot AFTER Phase 7 has
> documented the values it would pin. A snapshot is a dump of computed values and a diff;
> it does not depend on the component set being frozen, so nothing forces it to wait for
> Phase 4. Moving it ahead of Phase 7 is cheap and would stop the docs describing
> unpinned numbers. Not decided.

**ANSWERED 2026-09-02, and the answer is narrower than the question.** What
landed is a DECLARATION snapshot, not the "dump of computed values" the note
above promises, and the two are not the same gate. `check-token-values` reads
what `css/rux.css` declares -- 2,756 declarations across 231 contexts, keyed by
the context that declares them, since `--rux-grid-columns` is legitimately 4, 8
and 16 under three breakpoints. It runs in `npm run verify`, needs no browser,
and names the exact declaration behind every value.

**What it therefore does not pin.** 211 of those values contain `var(...)` and
40 contain `calc()`, `min()`, `max()` or `clamp()`. A `var()` chain is covered
transitively -- the referenced token has its own declaration in the same file,
so a move there is caught -- but a function resolving against context is not,
and neither is a value that changes only through the CASCADE, one theme leaking
into another, or an override winning where it should not. None of that is
visible to a parser, and the gate's `blindTo` says so.

**The computed snapshot stays open.** It is a real and different gate, it needs
a browser, and it would join the owed sweeps rather than `npm run verify`. The
declaration half was taken first because it is cheap, runs everywhere, and
closes the case §4.8 actually names -- a value moving under a stable name, which
every other gate here is blind to by construction. Proven 2026-09-02: with
`--rux-layer-01` edited from `#f4f4f4` to `#ededed`, `check-tokens`,
`check-classes`, `check-co-classes` and `check-compound` all exit 0 and this
exits 1.

**The sequencing question above is moot rather than answered.** It waited on
Phase 7 documenting the values it would pin, and Phase 7 was re-scoped on
2026-09-01 to a component index that documents no values at all. The condition
cannot be met; it stopped existing.

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

**DECIDED 2026-08-31 — NO. A headless browser does not become a dependency**, and the
silence this paragraph complained about is now an answer. `check-rendered.js:2` refuses
one on principle, `package.json` carries three devDependencies, and the five browser
gates stay hand-run with `docs/gate-coverage.json` as their ledger.

**The deciding evidence was that ledger's own `_triage`, not the principle.** That entry
did not record numbers; it traced 13 missing spacing signatures through their `seen`
fields to stories that no longer exist, established that two files in `docs/` were being
read as one reference despite being captured at different times against different
Carbons with nothing recording it, and surfaced a real Carbon change —
`btn--danger--ghost` computing `inline-flex` at 1.115 where the 1.113-era reference had
`flex`. A pass/fail runner prints "34 divergences" and none of that. **The expensive part
of a browser gate is the adjudication, and the adjudication is the part worth having.**

`CLAUDE.md` already states the position the other way round: the gates cannot see
everything, and looking is not optional. Five defects have shipped past every gate here,
including four menu specimens that were `visibility: hidden`. Automating the browser
gates risks retiring the habit that catches those.

**What is conceded:** the staleness bookkeeping is a real cost and this decision does not
address it. Many cells go stale on a `css/rux.css` edit and every cell goes stale on a
`js/` edit, by design. Narrowing
that rule so a cell ages only when inputs that could affect ITS reading moved is
available and unbuilt — it was the runner-up option and remains open work, filed here
rather than as a separate question.

**DECIDED 2026-09-02 — the portal does not render the state of its own browser
cells.** `portal.html` is generated from the browser matrix and is also an input to
the three cells swept on that page. The cycle already happened: `2529e48` recorded
the sweep taken at `a3f25e1`, regenerated all 38 matrix rows, and changed
`portal.html`, so its three portal readings were stale in the commit that recorded
them. Seven later commits changed the portal legitimately and masked that first cause.

The page stays an input. Removing it from `staleness.mjs` would reopen the exact
under-ageing `d63771c` fixed. `tools/build-portal.mjs` instead derives the portal-cell
set from `cells()` and omits those cells' state, date and result from its output. It
renders one invariant explanation and directs the complete answer to `npm run gates`.
The totals say how many cells are shown and how many are CLI-only; they never present
the subset as the whole registry.

**The cost is an extra pass, stated rather than hidden.** A full sweep records and
commits the non-portal cells first, then sweeps the portal at that clean commit and
records its cells in a second commit. On that second pass the ledger must be the only
dirty file and `npm run verify` must leave `portal.html` byte-identical. If it rewrites
the page, the invariant failed and the result is not recorded. The portal gives up the
exact status of its own three cells; the CLI and ledger remain authoritative. No digest
baseline is introduced and `staleness.mjs` is unchanged.

**AN UNREGISTERED CHECK EXISTS** (`docs/audits.md` finding 10). `tools/build-portal.mjs`
asserts that every `#i-name` it emits resolves to a `<symbol>` in the committed sprite,
and exits non-zero when one does not. It caught `#i-katex` on its first run — a glyph
nothing defines, the silent-blank-icon failure `check-icons` exists for.

It is real, it runs in `npm run verify`, and it is not in the registry. That is the
`build-namespace` shape — a gate carried by a build tool with no `check-*` file — and
`build-namespace` IS registered.

**DECIDED 2026-08-31 — it becomes the NINETEENTH gate.** Registered in `gates.mjs` in
the `build-namespace` shape, with the count moved in `CLAUDE.md`, `README.md` and the
gates table. The deciding argument is the one this section made against itself: leaving
it out means the registry is knowingly incomplete, which is the condition the registry
was built to end. Consistency settled it rather than merit — the identical shape was
already registered, and no rule distinguished them.

This read *fifteenth* until 2026-08-29, when `check-behaviour`, `check-glyphs` and
`check-slots` took the registry from fourteen to seventeen, and *eighteenth* until
2026-08-31, when `check-inventory` took it to eighteen. The ordinal moves with
every gate admitted, and an undecided question that needs re-numbering each time is
one more argument for closing it. **It has now been re-numbered twice**, which is the
argument making itself.

#### The spacing harvest cannot see a story with one signature — 2026-08-31

**`check-spacing`'s reference lost 22 of 798 signatures in the re-capture, and the ones
it lost include components this project ships**: `btn--primary` at xs, md, xl and 2xl,
`btn--danger--ghost`, `btn--danger--tertiary`, `btn-set--stacked`, `stack-scale-5`,
`stack-scale-6`, `badge-indicator`, `inline-notification--warning`.

**The cause is the harvest, not Carbon.** `tools/extract/react-dom.js` settles a story on
`lines.length > 1`. For a DOM tree that means "has it painted". For spacing it means "has
it produced more than one record" — so a story with exactly ONE spacing-relevant
signature can never satisfy it, times out as `(empty)`, and takes its signatures with it.
The 2026-08-31 run reported 59 empties and recovered **0 of 59** on retry, which is the
tell: a slow-painting story recovers on a longer timeout, a genuinely sparse one never
can. The script's own header describes this failure for `icons` and adds a special case;
`spacing` has the same flaw and never got one.

**It cost real verification, and the arithmetic hid it.** Divergences fell from 36 to 31
across the eight pages — which reads like an improvement and is not one. Four of the five
that vanished were the same adjudicated `stack-vertical.stack-scale-5` marginBlockStart
on portal, table-page, empty-state and error-state; it vanished because the signature is
no longer in the reference. The fifth was `stack-horizontal.stack-scale-6` on the sink,
lost the same way. **Nothing was fixed. The ruler got shorter.**

**NOT fixed by merging the old file into the new**, which was the obvious temptation.
That would put 1.113-era and 1.115-era records in one reference and recreate exactly the
provenance fault `_meta` was added to end. A reference has to describe one Carbon.

**FIXED 2026-08-31 at `547f976`, and it recovered 8 of the 21 — not all of them.**
`spacing` now settles the way `icons` does, on the story having painted, plus one extra
condition `icons` does not need: the record count must be unchanged since the previous
poll. Icons take geometry off a sprite, which does not move; spacing reads COMPUTED BOX
PROPERTIES, and "the first Carbon element painted" is not "layout settled". Sampling on
the first signal would have traded missing signatures for values measured mid-layout,
which is worse — a missing signature is honest, a wrong number reads as a defect in our
own markup.

Back: `btn--danger--ghost`, `btn--danger--tertiary`, `stack-scale-6`, `snippet__icon`,
`skeleton__text--ai`, `snippet-btn--expand`, `tag--skeleton`, the tree-node label button.

**THE REMAINING 13 ARE NOT A HARVEST BUG AT ALL — diagnosed 2026-08-31, and the answer
indicts the old reference rather than the new one.**

**Twelve of them had exactly one source story between them, and that story no longer
exists.** Tracing each lost signature through its own `seen` field: `badge-indicator`,
`btn-set--stacked` and `btn--primary` at xs/xl/2xl all came from
`components-button--overview`; `inline-notification--warning` from
`components-modal--overview` and `components-composedmodal--overview`; two popover
variants from `components-popover--overview`; one from `components-copybutton--overview`;
both ai-label toggletips from `components-ailabel--overview`; and `stack-scale-5` from
`getting-started-welcome--welcome`.

**There are zero `--overview` stories in the 1.115 index.** Not a timeout, not a settle
failure — the harvest never attempted them, because Carbon removed the category.

**And here is the part that matters: there are zero `--overview` stories in the OLD DOM
capture either.** The old spacing file cites stories the old DOM file has never heard of.
Those two files, which sat side by side in `docs/` being read by different gates as one
coherent reference, were taken at different times against different Carbons. Nothing
recorded that, and nothing could have — which is the entire argument for the `_meta`
stamp, arriving a day late and proving itself on the first question asked of it.

**The thirteenth is a class-composition change, not a loss.** The old reference held
`layer-two.dialog-content.dialog-scroll-content.dialog-scroll-content--no-fade` as one
four-class signature. The new one holds two three-class signatures —
`…dialog-scroll-content` and `…dialog-scroll-content--no-fade` — so Carbon now renders
the base and the modifier as alternatives rather than together. The element is still
covered; the combined signature simply no longer occurs.

**Nothing here needs fixing in the tool.** The settle bug was real and is fixed; these 13
were never its doing.

**One correction to the entry above.** It said 22 lost of 798. Sorted — which is how
`check-spacing` compares, and how this should have been counted the first time — it is
**21 lost of 797**. `btn--md--primary` was never missing; it had simply been written in a
different class order, and comparing raw keys made it look gone.

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

**DECIDED AND IMPLEMENTED 2026-08-30: `_`-prefixed keys, not a sidecar.** A sidecar file
was the alternative and it was rejected for one reason — the fault being fixed IS drift
between a claim and the thing it describes, and a sidecar can drift from the file it
describes. `_`-prefixed metadata cannot: you cannot copy the captures without copying
their provenance.

It is not even a new convention here. `carbon-slots.json` already carries `_`, `_rule`,
`_declined` and `_states`; `carbon-co-classes.json` carries `_` and `_ignored`;
`carbon-glyphs.json` already records a `version`. The five files the extractor produces
were the only ones without it.

Landed: `tools/extract/react-dom.js` stamps `_meta` with the Carbon version, the capture
date, the source URL, the mode and the aria allowlist it used — and warns when the
version is still null, because Storybook does not expose it reliably and a version
guessed automatically is worse than one left blank honestly. The three readers of the
DOM captures (`check-tags`, `check-ancestry`, `diff-fragment`) and `check-spacing` skip
`_`-prefixed keys.

**The five existing files are stamped `carbonVersion: "unknown"`,** which is the true
value and is written rather than guessed. Each also records that only four aria
attributes were captured, so a future reader knows its silence about `aria-labelledby`
means nothing.

**Proved invisible rather than argued:** `check-tags` and `check-ancestry` produce
byte-identical output before and after — 641 stories, 1109 classes, 35 with no
reference, 5 known divergences, 0 findings; 492 corroborated ancestries, 30 declined, 0
missing — and `check-spacing` reads 293/272/21 on the sink, unchanged.

**RE-CAPTURED 2026-08-31.** `carbon-react-dom`, `-states` and `-spacing` now record
`carbonReact 1.115.0` and `carbonStyles 1.114.0`, taken after `@carbon/styles` was bumped
to match. `carbon-glyphs.json` already carried its own `version`.

**AND THE LAST TWO, LATER THE SAME DAY.** `carbon-ibm-products-dom` and `-states` were
the two files still saying `unknown`; both were re-captured on 2026-08-31 and no file in
`docs/carbon-*.json` is unattributed now. 21 stories and 116 recipes, 8 of them usable,
aria recording up from 4 attributes to 13.

**Carbon had not moved, and that is worth more than the stamp.** Strip the new aria
attributes and all 20 previously-captured stories are byte-identical to the old file, so
the entire diff is the richer recording plus one story ibm-products has added since,
`patterns-create-flows-createsidepanel--with-form-validation`. `check-tags` and
`check-ancestry` read 642 where they read 641 and every other figure is unchanged — 1109
classes, 35 with no reference, 5 known divergences, 0 findings; 500 corroborated
ancestries, 30 declined, 0 missing. Same proof shape as the first stamping pass above.

**`carbonVersion` is NOT written for that origin**, following what `carbon-react-*.json`
did when it replaced the field with named ones rather than leaving a null beside real
values. `@carbon/ibm-products` 2.97.0 comes from the Storybook welcome page;
`ibmProductsStyles ^2.93.0`, `carbonReact ^1.111.1` and `carbonStyles ^1.110.1` are read
from `/project.json` on the same origin, not assumed from the previous capture or from
this README. They are RANGES, which is the point — a `cds--` class captured here is
attributable to a range and never to one build. **`carbonStyles ^1.110.1` tops out below
the 1.114.0 this repo compiles**, so a `cds--` divergence between the two capture sets
can be Carbon moving rather than a fault here. That is exactly the attribution the
`unknown` could not support.

**A FOURTH THING ABOUT THAT ORIGIN, MEASURED RATHER THAN INFERRED.** Its stories paint
right at the extractor's settle ceiling: one iframe at a time and unhurried,
`components-sidepanel--slide-over` first paints a classed element at 4.4s and
`preview-pageheader--default` at 6.0s, against `SETTLE_MAX_MS` 6000 and `CONCURRENCY` 3.
So the first pass filed **21 of 21 `(empty)`** and it was the sequential retry at double
the budget that recovered 20; the last was re-harvested alone with FILTER narrowed to it,
and came back at the same 121 lines the old capture had. **An `(empty)` on the filtered
stories is therefore timing and not the `chromatic/isChromatic` fault below** — two
different failures that look identical from the console, and reading the first as the
second would send you to fix a Storybook bug that is not in your way. Both notes now live
in each file's `_meta`, so a reader gets them without this entry.

**One decision inside it.** The old `-states` file carried only its 8 usable recipes; the
new one carries all 116, 108 of them `(no-story)`. `carbon-react-states.json` already
keeps all 116 with its own 8 `(no-story)`, so the two files are symmetric now and the old
shape was the anomaly. It also matches this section's own rule that a verdict is recorded
rather than dropped.

**THREE BUGS SURFACED ONLY WHEN THE SCRIPT WAS POINTED AT A SECOND ORIGIN**, none of
which a react-only run could reach:

- `verdictOf` was called from inside its own temporal dead zone, so any run WITH retries
  threw and wrote nothing. Found by the operator of the run that hit 59 retries.
- The states branch returns before the `_meta` stamp, so every states capture shipped
  unattributed. The stamp is a shared function now.
- `capture()` read `doc.body` unguarded; it is null while an iframe document is still
  parsing, and one side-panel recipe was lost to `(unreadable)`, which is not retried.

**AND ONE THAT IS NOT OURS.** Many ibm-products stories fail with `Failed to resolve
module specifier "chromatic/isChromatic"` — their Storybook, not this script. They paint
nothing, file as `(empty)`, and go to the retry pass. **The retry pass cannot tell "slow
to paint" from "broken by a module error"**, so 134 permanently-dead stories were retried
one at a time at up to 12s each, and the download never fired. This header already argues
that `(missing)` should not be retried for exactly this reason; a story whose JS failed to
load is the same category and is not yet recognised. **Not fixed** — the FILTER avoids it
on that origin, and a real fix wants a way to see the failure, which from outside the
iframe is not obvious.

**Captures are non-deterministic in three ways**, recorded in each file's `_meta` after
two captures of the same Carbon differed in 66 stories: React `useId` values churn every
run and accounted for 46 of them, popover auto-align picks placement from position, and
date-dependent content moves — the datepicker's `aria-current=date` crossed midnight
mid-session. Normalise those before diffing two captures or the diff is unreadable.

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

**DECIDED 2026-08-31 — the registry GROWS the file-level shape, and both are admitted.**
`build-portal`'s icon assertion took the nineteenth ordinal above, so these are the
TWENTIETH and TWENTY-FIRST and the ordinals are no longer provisional.

**Heading presence is the twentieth and is built first**, because it is cheap and its
scoping question is the only thing to get right: it reads PAGES — `templates/*.html` and
the generated root pages — and never `sink/*.html`, whose fragments are not pages and
must not be forced to carry an `h1`.

**BOTH ARE BUILT, 2026-08-31, and both were green with nothing exempted.**
`check-headings.mjs` reads 11 pages, 0 findings. `check-aria-roles.mjs` reads 332
corroborated role sites, 0 uncovered, 0 invented, and one decline. The registry is 21
gates, 16 in `npm run verify`.

**Each found live defects on its first run, which is the argument for the shape.**
check-headings found the label/value heading defect a THIRD and FOURTH time — still in
`templates/wizard-page.html` and, worse, in `tools/build-portal.mjs`, which re-emitted
`<h3>37 / 83</h3>` on every build — plus a real `h2 → h4` skip in the portal's template
cards. **A fix applied to the two files where a defect was noticed is not a fixed
defect**, and nothing here could tell the difference until something read the outline.
check-aria-roles found `role="alert"` where Carbon renders `role="status"` on
`inline-notification` and `toast-notification`, including one site in
`templates/error-state.html`, and a `role="button"` on an `<a>` with no `href`.

**check-headings strips comments before reading, and that is a finding rather than
hygiene.** Its first version did not, and reported `detail-page` and `dashboard-page` as
`h1 → h3` skips — because both carry a COMMENT explaining the `h3` they no longer
contain. A gate that reads its own documentation as markup files findings against the
text that fixed the bug.

**The ARIA-role gate is the twenty-first and is the larger piece.** The captures can
answer it — they record attributes as `{name=value}` beside the element — but nothing has
ever read them for roles, so this is the first reader of that data and it generalises
past `role` to the other twelve recorded aria attributes. It will need a `KNOWN` list for
deliberate divergences; that is the `check-tags` precedent, seven entries each with a
reason, and NOT an open-ended allow-list. If the list cannot stay small and reasoned, the
rule is not ready and the finding gets recorded unenforced instead — §4.8's own standard.

**As built its KNOWN holds ONE entry, and that entry is a limit rather than an
exemption.** `loading` carries `role="status"` where Carbon renders no role, and
`role="status"` is an implicit live region — but `aria-live` is not among the thirteen
attributes the extractor records. The capture cannot separate "Carbon announces nothing
here" from "Carbon announces it by a means we never recorded", so the question is OUT OF
REACH rather than adjudicated. **Widening the extractor's aria list would settle it**,
and that is now the concrete next thing this gate wants.

**What the structural hesitation was worth, since it is now overruled.** It was correct
that these are a different shape, and the answer is that `check-provenance` already
proved the registry tolerates a per-file assertion. The defects decided it: both shipped
on pages that passed all seventeen gates, and both were found by a person walking tab
order, which is not a repeatable instrument.

---

### 4.9 Phase 9 — Completeness

**Added 2026-09-01. Runs before customization, decided the same day.** Admit every
component `docs/inventory.md` marks CUT or DEFER that has a capture, in batches,
through the same door every admission has used: uncomment the `@use`, a fragment
with provenance, a `sink/ORDER` line, the coverage ratchet, the Node gates, the
browser sweep, one commit per batch. The sixteen admissions of 2026-08-31 are the
shape and the pace. A component with no capture stays DEFER with the reason
"no story renders it", and the row says so. Exit: no CUT row whose only reason
was the old admission test; every DEFER row names the missing capture.

**The work list, sorted 2026-09-01 by capture and dependency.** Thirty-three rows
read CUT or DEFER that day; 27 have a capture and 6 do not or need a decision.
Each batch is one admission commit, one fix commit if the browser sweep finds
anything, and one ledger commit at the end.

| Batch | Components | State |
|---|---|---|
| 1 | combo-box, multiselect, file-uploader, slider, treeview, progress-bar, aspect-ratio | **Done** `32818b0` · `64feb26` · `e0fe651` |
| 2 | fluid-combo-box, fluid-multiselect (held by batch 1's bases) | **Done** `b748d93` · `7acd902` · `0935058` |
| 3 | contained-list, structured-list, content-switcher, code-snippet, pagination-nav, menu-button | **Done** `3d4b9a8` · `2583f4a` · `6979683` |
| 4 | icon-indicator, shape-indicator, big-number, OptionsTile, scroll-gradient, FullPageError, EditInPlace | **Done** `d143416` · `2ed4334` · `8d67a1f` · `02cd862` |
| 5 | dialog, side-panel, ai-label, chat-button, and action-set (captured inside every side-panel story after all) | **Done** `b17f27c` · `4cad285` · ledger follows. coachmark moved to DEFER: its captures render the `__next` generation of classes that `@carbon/styles` 1.114 does not style |
| stays DEFER | resizer, truncated-text, slug — no story renders them; `truncated-text` appears only inside page-header captures — and coachmark, on the class mismatch above | Rows reworded 2026-09-01 |
| decision | `page-header`: ten captures, all under `deprecated-` in ibm-products, so completeness of CURRENT Carbon argues for staying CUT as "deprecated upstream". `InterstitialScreen`: six captures but incomplete on arrival, styling a carousel `@carbon/styles` 1.114 does not ship; stay CUT until an upgrade brings it, or admit knowing part cannot render | rux's call |

What the first three batches taught, so the next two do not relearn it: a class
every capture renders and no rule styles is not written (§4.1.12), and the
declines say so; a state React produces by toggling a class — a focus ring on a
wrapper, a selected row — is reimplemented in the owning module and adjudicated
in `check-a11y` with a measurement; a story's grid or its single sampled variant
is a `check-spacing` KNOWN entry named against the Carbon rule, never a bare
count; and the committed `portal.html` must not depend on the working tree
(`3ec9c87`, `a22f318`).

### 4.10 Phase 10 — Customization layer

**Added 2026-09-01.** Everything rux changes lives above Carbon, never inside it.
Three things, in order: **all four Carbon themes** compiled and switchable by
`data-theme` (the two-theme decision of 2026-08-28 is reversed; its size argument
was ~2 KB gzipped); **one custom theme** as a token override block, proving the
mechanism; **one overrides file** that loads after `rux.css` for component-level
changes such as button shapes, with a rule in `AGENTS.md` saying which kind of
change goes where. Exit: a page renders in IBM's four themes and in one of rux's,
and `git diff` of any Carbon-derived file is empty.

**Done 2026-09-02.** `src/app.scss` compiles white, g10, g90 and g100: 91.7 KB
gzipped against the 96 KB tripwire, under the 92.4 KB projected when the
tripwire was raised. `css/rux-theme.css` is the custom theme, twenty
interactive-family tokens over white under `data-theme="rux"`, with IBM's
purple grades standing in until rux chooses an accent (the mark is Carbon
blue, so white needed nothing). `css/rux-overrides.css` ships empty with its
rule in the header. The sink and every template link both after `rux.css`;
the sink's switcher has five buttons. `AGENTS.md` "Where a change goes" is the
rule. `check-classes` and `check-tokens` read both files, each seen red on an
invented class and an invented token before being trusted green;
`check-rendered` sweeps five themes.

Measured on the sink at 1280×900: each theme resolves its own tokens
(background `#ffffff` · `#f4f4f4` · `#262626` · `#161616`, and `#ffffff` with
interactive `#8a3ffc` under rux); the shell's g100 zone stays g100 on a rux
page; `check-a11y` under rux reads the same 29 findings as white with no
contrast rule firing, so the grade-for-grade choice held; rendered is clean in
all five. `git diff css/rux.css` is empty when the theme file changes by
construction, since the file is not compiled.

NOT done, and said so: no rule is live in the overrides file, so that path is
wired and gated but has not yet moved a pixel; the custom hue is a placeholder,
not a decision; g10 and g90 have their tokens and their render sweep but no
page has been LOOKED at in either beyond the sink's button section.

### 4.11 Phase 11 — Starting a project

**Added 2026-09-01.** The vendoring recipe `rux-ln-notes/tools/sync-ds.sh`
already uses — copy `css/`, `js/`, `assets/`, write a `PIN` — generalized into one
documented step for any new project, plus the template to copy. Exit: a new
project reaches a styled, behaving first page in under ten minutes, from a tag.

**Done 2026-09-02.** `tools/new-project.sh <dir> [template] [page]` is the
step, `docs/starting-a-project.md` the page, `v0.1.0` the tag (§8.2). The
script generalizes `sync-ds.sh` with two differences worth naming: it copies
FROM this checkout rather than into a sibling, and it knows Phase 10's three
kinds of file — `vendor/` overwritten every run, the theme and overrides files
and the page written only when absent, so a re-run moves the pin around the
project's own work. The page is the template with its five relative paths
rewritten by `sed`; nothing else in a template is relative, checked by grep.
Measured: the script in under a second, a rendered first page in under a
minute, the runtime class check on it reading nothing stripped. NOT done: the
portal's `sync-ds.sh` still exists in its own repository and is not replaced by
this; the recipe for a project that is a GitHub Pages site is that script.

**Amended 2026-09-02 (§4.13):** `rux-theme.css` AND `rux-overrides.css` join
`vendor/` — copied and overwritten on every run, so the `rux` theme and the one
live rule are the same in every app — and the project's own pair stays, written
only when absent and written empty, for its deltas, linked after the vendored
pair. `templates/` is vendored too, for the drift report `tools/drift.mjs`
prints after every run. The page is unchanged: still copied once, still the
project's, which is exactly why the report exists. The first draft of this
amendment said the overrides file was unchanged; step 3 put a rule in it the
same day, and a rule that is canonical has to travel.

**`sync-ds.sh` retires with `v0.1.2`, 2026-09-02** (§4.13 step 2): Notes moves
its pin with this script from then on, and the recipe for a GitHub Pages site
is this script too. Lost with it, and said so: its report of a js module
rux-ds added or removed, which a project's static script list needs a person
to mirror. That belongs to the drift report of §4.13 step 3.

### 4.12 Phase 12 — The project creator and the Rux Portal

**Added 2026-09-02**, from a conversation the same day. Three creators, cheapest
first, and one home for every project built on rux-ds.

1. **The script asks.** `tools/new-project.sh` run bare asks six questions —
   folder, shape, theme, name, title, file — offering only what a text
   substitution on a template can honestly change. **Done 2026-09-02**
   (`db54691`); `docs/choices.md` is the catalogue of every choice with the
   layer that offers it.
2. **The skill composes.** `rux-ds-page` grows a multiple-choice flow: which
   shell parts, regular or fluid fields, which buttons, which of the fragments
   in `sink/ORDER` in the body; then it copies the page into this root and runs
   `npm run verify`, so an invented class fails before anyone sees it.
   **Done 2026-09-02**, the skill's §2: eight rows, each answer drawn from
   `docs/choices.md` and nowhere else, five things named as NOT choices, and
   the boundary with the script written down on both sides. Writing it found
   the skill's own §1 listing nine of the ten templates and its §2 claiming
   "34 of 75" with `date-picker`, `combo-box` and `toggletip` deferred — all
   three admitted days earlier. Both fixed; the count is gone rather than
   corrected, which is what the rulebook asks for.
3. **The configurator shows.** A page in the portal with the same choices, a
   live preview and the HTML to take away. Open; after the portal.

**Rux Apps** is a repository named `rux-sm.github.io`, publishing at the
root of the account, so every project site already sits under it by path. The
repository name is not the hub's name and cannot be: only `<account>.github.io`
serves at the root, and the root is what makes the absolute `/switcher.json`
and `/switcher.js` in every module's shell resolve. Named after the hub it
would serve at `/rux-apps/`, both fetches would 404, and `switcher.js` would
fall back silently to the entries each page shipped — the shared list gone with
nothing failing. Answered 2026-09-02, with the name (§4.12 second decision).
Each module is its own repository and folder, started by the script, pinned
to a tag, with its own gates and publish. Nothing is shared by path: the
design system by pin, and the list of apps by URL, one `switcher.json` at the
root that every module's shell fetches to fill Carbon's switcher panel. The
header and the switcher are therefore identical on every site by
construction; the side nav and the page are each app's own. No frames: a
module built on rux-ds renders its own shell, and wrapping it would show two.
Modules for now: the portal itself, which is the landing page and the demo,
and Notes. Older projects stay out until rebuilt on rux-ds; a scheduler joins
when it exists.

**First step, done 2026-09-02: the switcher exists.** The shell had the panel's
CSS and a static open specimen, and no behaviour and no place in a template.
`js/ui-shell.js` now opens and closes it as Carbon's story does — verified
live, see its label — and every template carries the button and a collapsed
panel with invented entries.

**The hub's name is Rux Apps, answered by rux 2026-09-02.** `portal.html` here
is the gate dashboard, so "Rux Portal" named two different things across two
repositories. The entries are "apps" throughout, the word `switcher.json`
already used for its array and the switcher panel for its label; the hub's own
entry is "Home", since an entry called "Apps" inside the Apps switcher reads as
a category rather than a destination. "Module" stays the architectural term for
a repository-and-folder unit. Rejected: "Rux Home", "Rux Suite", "Rux Index",
"Rux Atrium", and dropping the second word for a bare "Rux".

**The manifest contract, written down here 2026-09-02, answering the last
decision.** `switcher.json` at the account root is
`{ "apps": [ { "name", "path", "description" } ] }` in display order: `path` is
`/` or `/name/` where `name` is the module's repository, exactly one entry is
`/`, every field is a non-empty string, and the hub's `tools/check.mjs` refuses
anything else. A shell ships Carbon's switcher panel with its own REAL entries
— Home and itself, the app it is marked `aria-current="page"` — and links
`/switcher.js` after `ui-shell.js`. That script fetches `/switcher.json`
uncached, replaces the items of every `ul.rux--switcher` with the list, a
divider after the first entry, marks as current the entry whose path prefixes
`location.pathname`, leaves the links out of the tab order while the panel is
collapsed, and fills `#apps-grid` where a page has one. If the fetch fails the
shipped entries stay and nothing reports it, which is why they must be real.
Adding a module is one entry in the file and nothing anywhere else.

**Notes is module two in fact, 2026-09-02** (`48786ce` there): button, panel,
`/switcher.js`, verified live against the root with Notes marked current. Its
`check-links` learned that a root-absolute reference is the hub's to answer —
a tier 2 change, proposed in its commit with what it weakens.

**Stopped 2026-09-02 with the hub committed locally and unpushed**, waiting
on the repository being created by hand under the right name. Next in order: push and enable Pages;
the switcher on Notes; creator 3 (the configurator). Creator 2 is done.
README "Picking this up" carries the same list and is the one to update.

**Pushed and live 2026-09-02.** rux renamed the empty `rux-apps` to
`rux-sm.github.io`; the push followed, `/`, `/switcher.json` and `/switcher.js`
all answer 200, and `pages.yml`'s check and deploy jobs were green on the first
run. GitHub enabled Pages from the branch on its own, so the branch build also
deploys and ignores the check until rux sets the source to GitHub Actions.
Item 1 of the list above is done; the naming rule of §4.13 gave Notes its
"Rux Notes" header the same day.

**Creator 3 is a page builder, decided 2026-09-04, and it lives here, not in
the hub.** rux's brief: start from a template, add and remove blocks from the
inventory like legos, see it live, take the HTML away; the whole catalogue in
`docs/choices.md`, body blocks included. The first milestone is one journey —
choose a template, personalise its content, add and move a block, undo a
change, inspect narrow and wide, export — before the catalogue grows. The plan
went through four revisions in the open; the findings that shaped it are
recorded with the stages below rather than repeated.

**Stage 1, `4bfc2a9` — blocks are marked regions, and the gate proves them.**
A sink fragment is a demo catalogue: `ks-sec`, `ks-label`, `ks-row`, `ks-grid`
exist only in `sink/harness.css` and appear zero times in `css/rux.css`, so a
fragment dropped into a page carries wrappers that style nothing. So a block
is `<!-- BLOCK:BEGIN name=basic label="Data table" -->` … `<!-- BLOCK:END
basic -->` around one attested specimen, the END repeating the name because a
fragment holds five to nine specimens and a lazy match would pair the wrong
two. Nine blocks in eight fragments, by one rule — a region that can stand as
a direct child of a page's stack — and `tools/build-blocks.mjs` copies them
byte for byte into `builder/blocks.json`, which `tools/check-blocks.mjs`
compares back: pairing, ordering below PROVENANCE (check-provenance faults
BURIED on a comment above it), no `ks-` and no inline style inside a sink
block, every glyph in the sprite, every `aria-*`/`for`/`data-rux-open`
reference closed inside the block, the manifest exact. Three red runs before
green. Two corrections to the approved plan while marking: none of the eight
named blocks carries an id, so `accordion` cannot be the instance-identity
test — `structured-list/selection` (ids, a radio `name`) is marked for it —
and `href="#…"` is navigation, not a control relation, so it left the closure
rule.

**Stage 2, `19b328e` and this commit — slots, the round trip, the preview.**
The template is the skeleton, verbatim; `<!-- SLOT:BEGIN name=body -->` marks
the interior of a container it already has, holding blocks and blank lines and
nothing else, so the frame plus the blocks IS the file — `check-blocks`
reassembles every slot and faults REASSEMBLY otherwise. Every REPLACE region
in a `<main>` is a block with its prose inside it. Three things the templates
settled against the plan: a block cannot span a container's closing tag, so
`table-page`'s table and pagination are two blocks with `follows=table`
keeping them adjacent rather than one compound; `wizard-page`'s cancel dialog
is opened from one column and lives after the grid, so it stays frame; and
`detail-page`'s tabs are one block, panels included. 33 blocks in 18 files,
12 slots. `builder/rewrites.mjs` reproduces `tools/new-project.sh:189-200`
including the two project stylesheet links its awk step inserts — the omission
rev 1 of the plan was returned for — and **all ten templates round-trip byte
for byte against the script's real output**, run into a scratch directory,
before any builder page existed. `tools/build-builder.mjs` then writes
`builder.html`: the script's answers, a template picker, a Blob-URL preview
at 375, 672, 1056, 1280, 1440 or fit. Read in the pane at 1280×720, white
asserted: `check-runtime-classes` 0 stripped, 1 added (the `<option>`s the
page creates); `check-a11y` 0 findings with rings checked, and 10 when every
ring was stripped, on exactly this page's controls; `check-spacing` 29 of 30,
the one divergence the subgrid padding-block every page here records.

**Three claims stopped being probes.** A `srcdoc` preview's skip link
navigated the frame to `builder.html#main-content` — the builder rendering
inside its own preview — so the preview is a Blob URL, whose skip link stayed
at `blob:…#main-content`. With `g90` stored in the reader's profile and `g10`
chosen as the default, the frame showed `g10`, its body measured
`rgb(244,244,244)`, and it saw no stored profile: the preview-only storage
shim before `js/theme.js` does what it claims, and `js/profile.js` still runs
(it returns early without `window.Rux.theme`, which is why dropping
`theme.js` was rejected). And 375 renders at 375 inside the frame.

**Rejected, recorded so it is not re-proposed:** the hub as the home (the
gates live here); a page builder that assembles components freely
(composing-pages §3.10 — an unattested composition inherits no spacing and
no gate reads it; the unit is the whole attested specimen); rendering the
preview in-page (two shells, the very thing §4.12's "no frames" forbids —
the iframe honours it); `srcdoc` (measured above); baking the catalogue into
`builder.html` (it works with `<` escaped, but buys a 500 KB page and a
serialization contract for nothing a fetch does not give); `SPRITE:` markers
on the generated page (`spritePages()` would hand the region to `npm run
icons` as a second writer); a universal `<main>` wrapper (it cannot preserve
`table-page`'s pagination outside the stack or `wizard-page`'s three
columns); shipping id-suffixing before it is measured.

**Not done, and said so.** Editing, the catalogue, add/move, undo, export and
`check-parity` are the next stages. The two shell toggles the choices table
offers — header nav and global actions present or absent — are not in the
builder yet, and one of them is contradictory as written: removing "global
actions" removes the Account action, while the same table says the account
panel is not a choice. That goes to rux before it is built. The preview is
outside every gate: the sweep above measures the builder's chrome, and the
page says so. The tier-2 wiring — `check-blocks` and `build-builder-icons` in the
registry and `CONTROL_FILES`, `npm run blocks`, `npm run builder` and
`check-blocks` in `verify`, `builder.html` and `builder/blocks.json` in CI's
staleness diff — was drafted as a diff, proven by `verify` with it applied,
proposed with what it weakens (a longer chain stops earlier, so a
`check-blocks` failure hides what follows it), and **accepted by rux and
landed 2026-09-04** in the commit that carries this sentence. Left open on
purpose, for rux to decide rather than bury in that diff: the pre-existing
registry drift where six Node gates' literal `fileTargets` still name
`kitchen-sink.html` and `portal.html` by hand though the tools discover root
pages since 2026-08-31.
The three `builder.html` cells in `docs/gate-coverage.json` are stamped at
`19b328e`, the HEAD they were read against with the page uncommitted, and
are re-swept and restamped in the ledger commit that follows, as the
portal's cells were.

**Stage 3, `0475e3f` — select a block and edit its text.** A block picker
filled from the chosen template in slot order, every editable text in the
selected block as its own field, and the edit written back into the composed
page. `textFieldsOf` walks the block once with an open-element stack rather
than matching `<tag>TEXT</tag>`: comments and script, style and svg bodies
are opaque spans, because this repository's own comments carry literal tag
examples and a flat match would have offered them as fields and shifted the
real ones' offsets; the fourteen void elements are never pushed, since every
one in this corpus is a bare tag and pushing it would wait for a close that
never comes. A field is text between an element's own open and close tags
with nothing else between, non-empty, and not owned by a behaviour module —
judged against the whole ancestor stack, so data-table's bare span inside
`batch-summary__para` is excluded by its ancestor rather than a lookback
guess. `applyTextEdits` splices bytes at offsets read from the original
html, never from an edited derivative, and escapes only `&`, `<` and `>`.
Fields are textareas, because a text input strips the line breaks two
blocks' `<p>` carry in source. Proved on all 33 blocks: zero edits gives the
block back byte for byte, and one edit to `app-shell` changes one line of
the export; the status line's round trip is measured on the UNEDITED
composition, so an edit can never make it read identical for the wrong
reason. Read in the pane at `ca911fb`: `check-runtime-classes` on
`builder.html` moved from 46/47 with 1 added to 46/50 with 4 added — the
text-area the picker clones — 0 stripped either way; `check-a11y` 0
findings. The plan went through four revisions in the open (`b40e1a8`) and,
folded here, its file is deleted. `e34b206` the same evening: `aed80a8` had
swapped the logo in every template without regenerating
`builder/blocks.json`, so every slot offset was 40 bytes high and 10 of 10
templates failed to round-trip until the manifest was restamped — measured
on the tree, not reasoned.

**Stage 4, 2026-09-05, accepted by rux and landed in the commit that
carries this sentence — instance identity, measured first.** Adding a block twice duplicates every id inside
it, and a duplicate id does not error, it mis-binds: `<label for="stl-1">`
resolves to the first `#stl-1` in the document, so the second copy's label
drives the first copy's radio. Measured over all 33 blocks before anything
was written: 51 ids in 9 blocks; all 49 `for`, `aria-controls` and
`aria-labelledby` references name an id inside their own block; the one
`data-rux-open` (`wizard-cancel`) and all 62 `href="#…"` — 52 sprite `<use>`,
10 page anchors — point out of theirs; three blocks carry a radio `name`.
Two findings. The comment on `REF_ATTRS` in `tools/lib/blocks.mjs` said
`href` was in the rewrite list; suffixing it would have broken 52 icons and
10 skip links and fixed nothing. And an attribute list alone cannot be right
either: `data-rux-open` is in that list and its one use points at the
wizard's frame dialog, which stage 2 kept frame on purpose. So
`instanceOf(html, n)` in `builder/rewrites.mjs` rewrites a reference under
two conditions, both required: the attribute can carry an id reference (the
HTML and ARIA IDREF attributes, `href` only when it starts with `#`, and
`data-rux-open`), and the id it names is defined inside the same block. The
first keeps `value`, `class` and `name` untouched — spelling is not a
reference — and the second keeps every outward reference untouched by
resolution rather than by a list. One exception with its own reason: `name`
on a radio is a document-scoped grouping key, so it is suffixed too, and no
other `name` is. Instance 1 is the block byte for byte; the number is a
positive integer the page model allocates per occurrence and keeps across a
move, and anything else throws. Comments, script and style are opaque; svg
is walked, because a `<title id>` and its `aria-labelledby` must move
together. Proved by a scratch script, uncommitted, on all 33 blocks:
instance 1 identical on every block; `structured-list/selection` at 2 gives
`stl-1-2`, `stl-2-2`, `sl-2`, and the two instances concatenated have no
duplicate id and two radio groups; nothing outward moved; all 49 inward
references resolve; no attribute outside the carrying list coincides with an
id in this corpus and no block defines both `A` and `A-<n>`, both asserted
rather than assumed; text edits and instancing commute on every block with
fields. Red before trusted: with the radio rule removed from a copy, 4 of
the 24 assertions failed. Rejected, recorded so it is not re-proposed:
suffixing by attribute name alone (breaks the wizard's Cancel); suffixing
`href` unconditionally (breaks the sprite); an idempotence guard (a resolver
cannot tell `stl-1-2` from an id always spelled that way — the contract is
to derive from the manifest, as `applyTextEdits` already does). Tier 2, two
control files: an additive export in `builder/rewrites.mjs` and a corrected
comment in `tools/lib/blocks.mjs`, weakening nothing — no gate, fixture,
baseline or `CONTROL_FILES` entry moves — and reaching no page: the add/move
stage is what calls it. Not verified: its behaviour in a browser, which
nothing exercises yet. Not done: the page model and instance allocation,
the catalogue, insert/move/remove, undo, `check-parity`, export, and
`check-rewrites.mjs` as a gate, which is its own proposal. Found on the way
and left for rux, tier 2: `builder.html`'s three browser cells do not age on
`builder/`, though `builder.js` runs in that page and `0475e3f` moved its
runtime-classes reading; a `pageInputs` entry would say so.

**Stage 5, 2026-09-05, accepted by rux and landed in the commit that
carries this sentence — add and move a block, on a page model.** `builder/page.mjs`, a pure module beside
`rewrites.mjs`: one plain value per template — `{ slots: { body: [ { key,
id, n, follows } ] }, next }` — with `add`, `move` and `remove` returning a
new value, and `composePage` turning it into the page through `compose`,
`instanceOf` and `applyTextEdits`. Instance numbers come from `next` per
block id, rise, survive a move and are not reused, the contract stage 4
wrote; the template's own blocks are instance 1, so an untouched page is
the template byte for byte, asserted on all ten. Four facts shaped it. Every
slot records identical gaps, so one separator rule reproduces every
template; `compose` handed fewer gaps than blocks writes the string
`undefined` into the page (measured — the fuzz first tripped on Carbon's own
`i-undefined--filled` glyph before it found this), so the model builds the
slot record itself; sink blocks sit at 2 to 6 spaces and slots at 6 or 8,
so an inserted footprint is shifted to its slot's depth by leading
whitespace alone (no block carries `<pre>` or a textarea with content, and
one that did would not be shifted); and placement is informational by
`build-blocks.mjs`'s own words and this page's intro — the catalogue offers
all 33 blocks in every slot and says where each was attested. A foreign
block gets one `<!-- FROM: source · provenance -->` line above it, the
comment `rewrites.mjs` promised. A `follows` run is one unit, as the marker
rule asks: pagination is added, moved and removed with its table and still
edited on its own. `integrity(html)` in `rewrites.mjs`, additive, reads
duplicate ids and unresolved references on the composed page for the status
line, which is how the wizard's Cancel (`data-rux-open="wizard-cancel"`,
frame not block) and a breadcrumb's three `href="#breadcrumb"` are shown
rather than refused. Proved in node on all 33 blocks, uncommitted: the
pristine model identical on all ten templates; 2000 random add, move and
remove steps keeping every invariant; the stage-4 fixture placed twice on
`app-shell` reading zero duplicate ids and two radio groups, its second
footprint at depth 8. Proved in the pane on the served page: the same
fixture, clicking the second copy's `stl-2-2` checks it and leaves the first
copy's `stl-1` checked — the mis-binding this whole line of work exists to
prevent, seen in a browser for the first time; an edit on instance 2
survives its move and the removal of instance 1; the picker, the highlight
and the status line follow every step; Tab reaches slot, catalogue, Add,
picker, Move up and Remove in order, Move down skipped only while disabled
at the slot's end. NOT PROVED: activating a button by Enter or Space, which
the pane's synthetic keys do not deliver — the stage-2 width buttons fail
the same way, so it is the pane and not the page — and the three
`builder.html` browser cells, stale at this commit until re-swept and
restamped in the ledger commit that follows, as every stage before it.
The chrome is `sink/` markup, `rux--btn--danger--ghost` for Remove included,
and adds no `<use>`. `page.mjs` is tier 3 by the categories — builder state,
not a gate — and says so in its header for rux to overrule; the two control
files touched are additive. Not done: undo (the model is a plain value so a
history is all it needs), export, `check-parity`, cross-slot moves, any rule
on `deps`, refusing a placement. The plan, saved as
`docs/builder-add-and-move-plan.md` while it was reviewed, is folded here
and deleted in the same commit.

**The guided mode is planned, 2026-09-05, in `docs/builder-guided-plan.md`:
stages 0 and 6 to 13.** rux's brief: a friendly, finished way to build a
page and its content — start from nothing, pick the purpose, be walked
through one section at a time with defaults and reasons, edit the content on
the way, review, take it away. Revision 1 put it on a page of its own and
kept content editing in the builder; rux's review asked for one continuous
session, content in the walkthrough, suggestions that know the page, a
defined export, defined coverage, undo semantics settled first, and the
verification debt paid before it is relied on. Revision 2 is what the plan
file carries: a guided mode inside `builder.html` on the same draft, model
and editor, flow purpose → sections and content → add sections → review →
export. Each stage is its own proposal and lands with its own entry here;
the plan file is trimmed as they do and deleted with the last.

**Stage 0, 2026-09-05, accepted by rux and landed in the commit that
carries this sentence — the registry debt, so the stages after it are
verified by cells that can see them.** Two
corrections to `tools/lib/gates.mjs`, additive. First, `builder.html`'s
cells never aged on `builder/`: `builder.js`, `page.mjs` and `rewrites.mjs`
are not in `js/` by design and so were in no gate's inputs, which is why
0475e3f could move the page's runtime-classes reading from 46/47 to 46/50
and fce2258 could rebuild the left column without a cell going stale — both
sweeps happened only because the page itself changed in the same commit.
`BUILDER_SCRIPTS = { 'builder.html': ['builder'] }` is now a page input on
all five browser gates, check-runtime-classes included, because a script,
unlike harness.css, does put classes on elements. Proved red on the tree: an
uncommitted byte in `builder/page.mjs` turns the three builder cells DIRTY
and restoring it turns them back; the recorded readings are at fce2258 and
nothing under `builder/` has moved since, so all 41 stay current. Second,
the six Node gates whose rows still said `kitchen-sink.html` and
`portal.html` by hand — check-classes, check-tokens, check-co-classes,
check-coverage, check-headings, check-aria-roles — now derive `fileTargets`
(and the four `inputs` carrying the same literal) from `pageFiles()`, the
discovery `pageTargets()` has used since 2026-08-31, so `builder.html`,
which all six already read, is finally named by their rows. Neither field is
consumed by a tool; the rows describe, and they described wrongly. What it
weakens: nothing — cells age on more, and rows name more. `npm run verify`
exit 0, `check-controls` names `tools/lib/gates.mjs` alone.

**Stage 6, proposed 2026-09-05 and awaiting rux's review — undo, redo, and a
draft that survives a reload.** `builder/session.mjs`, pure and node-tested,
holds the history and the draft; `builder.js` decides what an action is.
ONE SESSION HISTORY over `{ pages, edits, answers }`, not one per template:
the answers are global, so a per-template history would duplicate them or
drop them. Navigation records nothing, so the acting template rides on the
ENTRY and both undo and redo reveal where the change happened — edit on
app-shell, switch to table-page, undo, and the builder returns to app-shell
with the edit reverted; redo returns there again. ONE ACTION IS ONE ENTRY:
Remove touches both the edits and the model and is one, because a block's
text must come back with the block; the low-level setters never touch
history, and an action that changes nothing records nothing. A typing run is
keyed by template, entry and field, and ends on a pause, a blur, navigation,
any other action, undo, redo, or an `input` whose `inputType` starts with
`history` — the field's own undo, which gets its own entry rather than
joining the typing it just reversed. The two stacks stay separate, said
rather than papered over.

A DRAFT IS OPENED ONLY WHEN IT STILL FITS. Two failures rux found in review
forced this, both reproduced here first: an orphaned follower makes
`unitOf` throw, and a field index silently retargets when a block's markup
changes, because edits are indices into `textFieldsOf` of the CURRENT
manifest. So the draft carries an FNV-1a hash of every block an edit was
made against, and validation covers version, shape, templates, slots, key
grammar, unknown ids, duplicate keys, follower relations, allocation
counters, edit shape and those hashes. Any failure leaves the draft
UNOPENED — never partly applied, never deleted, and never overwritten by
autosave while it sits there — with the reason named and Discard the only
thing originally described as clearing it. **Review correction, 2026-09-05:**
Start over also explicitly discards it, and now clears the unopened flag;
previously it erased the warning while silently leaving autosave disabled.
The validation claim above also exceeded the implementation: required slots,
answer types and allowed themes were unchecked, and followers could reach
across an unrelated block. These cases are now rejected, with followers
restricted to their current contiguous run. Scratch checks: 25 failing cases
before, all 42 cases passing after, including valid composition for all ten
templates. Browser re-verification was outstanding when this was written --
the server was stopped and the review session had no preview-launch tool --
and **it is done as of 2026-09-05**: all six cells run against the served page
and stamped, builder.html at `8d651f2` (`e482f6c`) and portal.html at
`e482f6c` (`a68f059`), `npm run gates` 41 of 41 current. Every figure is
unchanged from stage 5. The notice states were measured rather than left to
the fresh page: 47/63 with the notice cloned, reproducing the figure recorded
below exactly, and 47/64 with the alert as well, the one further class being
`rux--actionable-notification--error`; 0 stripped in all three. The stage-5
screenshot gap is closed too -- scrolling a hidden pane still captures blank,
but a 1280x2300 emulated viewport renders the whole page in one shot, and the
stage-6 chrome was read that way. `Cmd/Ctrl+Z` is still unproved by a real
key, and still owes one human keypress.
Saving is debounced 500ms and flushed on `pagehide`
and `visibilitychange`, so an edit and an immediate reload survives;
measured, not assumed. A save failure is shown in the notice region and not
the status line, which `render()` rewrites on every keystroke and would
erase. Start over lives permanently beside Undo and Redo rather than only on
a notice that can be closed, clears every template and answer, and is itself
undoable.

**One bug found by running it, not by reading it.** `snapshot()` first
returned live references, so `change()` compared an object with itself,
every action looked like a no-op, and the first browser run recorded an
empty history after add, edit and remove. Fixed at the source — the snapshot
copies — so the mistake is unavailable to every caller rather than patched
at one. The node suite had passed throughout; it tested the pure module,
and the defect was in the caller.

Proved in node, 39 assertions, uncommitted: the cap, the round trip, deep
copies, run keys, the draft round trip, **every row of the validation table
with a fixture each**, and that a restored draft composes byte for byte on
all ten templates. Red before trusted: disabling the follower check, the
hash check and the deep copy failed exactly the four matching assertions.
Proved in the pane: add, edit, remove then three undos restoring the block
with its edited text, then its original text, then removing it, with the
buttons naming each step; five keystrokes at 100ms real gaps are one entry
and a lapse is two; the worked example both ways; an edit and an immediate
reload survives; a hand-orphaned draft is left unopened with its reason and
is not overwritten, and Discard restores saving; Start over and its undo;
and `check-runtime-classes` 47/51 with 0 stripped on a fresh page, unchanged
from the recorded reading, going to 47/63 with the notice cloned in — all
twelve notification classes ADDED, the harmless direction, which is why the
notice ships in a `<template>` and is cloned. It also could not ship as
`hidden` markup: `.rux--actionable-notification` is display:flex and beats
`[hidden]`, the defect fixed for `.rux--btn[hidden]` on 2026-09-02.

**NOT VERIFIED, and it is the harness both times.** `Cmd/Ctrl+Z` was never
delivered to the page: a capture-phase probe on `document` recorded no
keydown at all for cmd+z, ctrl+z or Escape, fronted or not, though Tab is
delivered — the combination is almost certainly taken by the host
application, which is what Cmd+Z does everywhere. The handler is proved by
synthetic dispatch, undo and redo both, and by leaving a textarea's own undo
alone; one human keypress still owes. And a second harness limit worth
recording beside the Enter one: **an awaited step in the pane takes about a
second of wall clock**, so a loop with a 30ms sleep between keystrokes
crosses the 1000ms run window and reads as a coalescing failure. Sub-second
timing must be measured inside ONE execution with a busy-wait, which is how
the figures above were taken.

**Stage 7, 2026-09-05, accepted by rux and landed in the commit that carries
this sentence — export and parity.** `ce27ceb`, swept at `587dd70` and
restamped at `2ed1611`. TWO DELIVERY PATHS AND NO THIRD. For a project that
exists: download the composed page, or copy the whole `<main>` to replace one.
For a project that does not: copy the exact `new-project.sh` command built
from the answers. **The script stays the one project creator** — the builder
writes a page, never a project — which is why the command is offered rather
than a second creator being built. The FOLDER IS DELIBERATELY ABSENT from it:
supplying every other flag leaves the script asking exactly one question,
first, with its own default, and a placeholder path the reader might run
without reading is worse than a question. rux's two calls for this stage: the
gate extracts the script's lines rather than running the whole thing, and the
copy control is a plain button the builder owns rather than the attested
icon-only copy-button, which `js/copy-button.js` sanctions in its own header.

**`tools/check-parity.mjs` RUNS THE SCRIPT'S OWN BYTES.** The page-writing
region is extracted from `tools/new-project.sh` by anchor and executed under
`sh`; a second implementation would only prove the two copies here agree. It
does NOT run the whole script, which refuses a dirty tree and unpushed commits
by design — a gate that did would fail on every uncommitted change and be
routed around, which is the gate nobody keeps. It asserts the region's shape,
ten `-e` expressions and one `awk`, and **a region it cannot find faults
rather than passing**. Ten templates × three answer sets, 30 of 30
byte-identical.

**IT FOUND A REAL DEFECT ON ITS FIRST RUN, which is the whole argument for
it.** `content()` substituted the product name with a STRING replacement, so
JS expanded `$$`, `$&`, `` $` `` and `$'` — a name of `A$&B` inserted the whole
matched text, and `A$'B` inserted the rest of the line and duplicated a close
tag. The `aria-label` beside it has always used `split().join()`, which is
literal, **so one answer produced two different strings on one page and the
header's visible name disagreed with its accessible one**. The script escapes
with `esc()` into sed, where a replacement expands nothing. Every replacement
is a function now. The claim this gate now holds was written down at stage 2
and proved once, by hand, with DEFAULT ANSWERS — the one set that cannot see
this. Red before trusted, three ways: the unfixed `content()` faults on all
ten templates, one altered `sed -e` on all thirty, and a deleted end anchor
reports ANCHORS and compares nothing.

**BYTE PARITY IS NOT VALID HTML, and the gate says so in its own printed
words.** Neither side escapes the answers, and they land in element text and
in an `aria-label`, so a name carrying `"`, `<`, `>` or `&` makes markup both
sides agree on byte for byte and no browser reads as intended. The awkward
fixture keeps those characters deliberately: agreement is what is measured and
agreement is all it means. The builder WARNS rather than escaping
unilaterally, which would break the parity it just earned. **Open, and rux's:
escape in both, reject in both, or leave it.**

**Export feedback has a region of its own, and that was a review finding
before it was code.** `showNotice()` clears its container, so routing export
feedback through `#bld-notice` would have deleted the "saved draft was left
unopened" warning AND its Discard button while `unopened` still blocked every
save — leaving no way back to the one control that restores saving. Read in
the browser both ways: with that notice standing, all three exports left it
and its button alone, feedback appeared in `#bld-export-notice`, and Discard
still cleared the draft afterwards.

**One file-name definition serves the download and the `--page` flag**, because
the two would otherwise disagree unseen: the script writes
`> "$DIR/$PAGE.html"` and makes no parent directory, so a separator kills it
under `set -e`, while a browser's `download` attribute flattens one silently.
Both fall back to `index` together and the page says why. A trailing `.html` is
stripped once rather than refused.

Two things only LOOKING caught. The command block was `white-space: pre` in a
column five of sixteen wide, so the reader saw `./tools/new-project.sh
--template` and had to scroll a code block to read what they were about to
run; it wraps at the spaces between flags now. And the download's blob is
released on a timer rather than the next line — revoking in the same tick as
the click has been observed to abort the save, where the preview's URL is
revoked on the iframe's `load` because there the consumer says it has the
bytes. One measurement error is recorded too: a first pass at the file-name
cases read them 120ms after typing and reported three bugs that were not
there. `render()` is 250ms behind typing, by design.

Read in the pane: the download's 40,577 bytes fetched back and compared
IDENTICAL to `exportPage`; the clipboard string identical to `bodyOnly`,
opening `<main id="main-content"` and closing `</main>`; the command exact.
**NOT SHOWN BY THIS HARNESS, and said rather than implied:** a file actually
landing on disk, and clipboard read-back — `writeText` was stubbed to capture
its argument, so what is proved is the bytes handed to the clipboard, not the
system clipboard's contents.

Tier 2, five controls named by `check-controls`: the new gate, its registry
entry, `build-builder.mjs`, `rewrites.mjs` and the `verify` chain.
`tools/new-project.sh` joins `CONTROL_FILES`, because it became an expected
result the moment a gate compared against it. **What it weakens:** `verify`
grows by one `&&`, so a `check-parity` failure hides every gate after it — the
cost stage 2's wiring already named. **And the gate judges a fix authored in
the same run**, which `AGENTS.md` forbids being the last word: the red runs are
evidence, not that review, and the gate together with the `content()` fix wants
reading from a session that did not write them.

Not done: stages 8 to 13. No zip, by the no-libraries rule. Escaping the
answers, above. The two shell toggles are still open and still contradictory as
`docs/choices.md` writes them.

**Stage 8, 2026-09-05, accepted by rux and landed in the commit that carries
this sentence — content editing that reads as content.** `30e91fb`, swept at
`becea4d`, restamped at `33a244a`. The panel said **"Text 1 of 18"** over
**"In `<div>`"**; it now says "Helper text" under a group headed "Email", with
the original beside the field and a reset for that one field. The measured case
for the change: `div`, `p` and `span` hold **127 of the 241 fields**, and `<th>`
holds none at all, because a column header wraps its text in a
`div.rux--table-header-label` — so the tag could never have named them.

**`textFieldsOf` gains `context` and NOTHING ELSE MOVES.** It already built an
ancestor stack carrying each element's class and content offset and threw it
away; that is now reported. Proved before anything else: all 241 fields keep
their `start`, `end`, `raw` and `name` byte for byte. **That is the regression
that mattered** — edits are indices into this list, and a draft hashes the
block's MARKUP, so it cannot see the extraction algorithm changing underneath
it. Grouping is by an ancestor's content offset, unique inside a block, so two
fields share a group by construction rather than by matching text.

**Four rules came from reading the output, not from reasoning about it.**
A FIELDSET BEATS ANYTHING NESTED IN IT — form-page's two checkboxes each sit in
their own `form-item` inside the fieldset while its two radios do not, so
nearest-unit alone split "Notify me when" across three groups and it rendered
with no heading at all. A HEADER ROW IS NOT ROW 1 — the `<tr>`s carry no class,
so `<thead>` tells head from body, without which the first body row read
"Row 2". AN UNCLASSED WRAPPER TAKES ITS NAME FROM WHAT HOLDS IT — the activity
list is a bare `<div>` inside `li.rux--list__item` and read "Text 21 of 25".
And a fallback name is numbered only when two groups share a kind, after the
button set read **"Actions 7"**, the seventh `div` among its siblings.

A group's heading is its own label, legend or accordion title, and it follows
the edit LIVE: the panel is not rebuilt while typing, because rebuilding it
would take the caret. **An edit may be the empty string**, so a cleared label
falls back to "Form item 2" and the group's accessible name is never empty —
read in the browser, with focus staying in the field throughout.

**Link targets are the one editable attribute, and the ORDER IS THE CONTRACT.**
Edits first, instancing last, because they do not commute: repoint a link at
`#target` and instance 2, and the href must become `#target-2` to reach this
copy's own id. rux found that in review, where revision 1 of the plan had
claimed all three operations commute. **No shipped block has both an id and a
real link**, so a synthetic fixture asserts it — the corpus cannot exercise its
own contract. `linksOf` offers only non-`#` hrefs: one in the whole catalogue
against ten fragment ones. `applyLinkEdits` NORMALISES the quoting rather than
escaping for a delimiter it cannot know, since `attrsOf` accepts double, single
and unquoted and an apostrophe would terminate one where a space would split
another; an unedited link is never spliced, so its own quoting survives byte for
byte, asserted for all three forms because the catalogue's one link is
double-quoted and cannot prove preservation.

Both stores run the whole lifecycle, which rux's review added and revision 1
had left at persistence alone: compose, snapshot, restore, run keys (`$` for
links, so a link run never joins a text run), removal, Start over, reset and the
edit count. Removing a block drops both in ONE entry and undo restores both.
`DRAFT_VERSION` does not move — `links` is optional, so a draft written before
this stage still opens, tested both ways.

**TWO RED RUNS CAME BACK GREEN WITH THE MUTATION VERIFIED APPLIED**, which means
the suite was measuring nothing and is the finding worth keeping. The
hostile-value check read back through `href="([^"]*)"`, which truncates at a raw
quote, so removing the quote escaping passed; and the `composePage` assertions
used a non-`#` value, which instancing never touches either way, so reversing
the pipeline passed. Both are exact-match now and both go red. Two mistakes of
mine are recorded with them: a `git checkout` taken to revert a mutation
destroyed the real `composePage` change and it had to be reapplied, and a
`perl` substitution silently failed to match twice, so a "red run" ran against
unmutated code.

**Found in passing and fixed:** `session.mjs` carried a literal NUL byte as the
run-key separator, so git diffed the file as `Bin` and grep silently matched
nothing in it — at `HEAD`, since stage 6. It is `\0` now: same character, same
key, and the file is text again.

**Reported, not changed: `brand/` is not a declared input to any browser gate.**
rux's replacement logo, favicon and app icons were uncommitted in the tree
throughout this stage, and `npm run gates` still read 41 of 41 current — the
mark on every page's header changed and nothing aged. That is the registry gap
stage 0 closed for `builder/`, and it is tier 2, so it is rux's to accept. It
moved no reading here, measured rather than argued: every figure is identical to
the stage-7 reading taken with the old mark.

Tier 2, two controls: `rewrites.mjs` and `build-builder.mjs`. What it weakens:
`textFieldsOf` allocates a context per field on every compose, and `composePage`
grows a parameter. No gate, fixture, baseline or `CONTROL_FILES` entry moves.
The red runs are evidence, not acceptance. Not done: stages 9 to 13, and
attributes other than `href`.

### 4.13 Phase 13 — The platform: every theme, a profile everywhere, one backend

**Added 2026-09-02**, from a conversation the same day, and decided by rux the
same evening. Three creators and a hub (§4.12) gave every app the same header
and the same switcher. This phase gives every app the same themes, a profile,
and one place to keep what a profile saves. Two of the three are rux-ds
standards; the third is a repository of its own.

**Two standards, new to rux-ds.**

1. **Every app offers every theme.** The five themes — `white`, `g10`, `g90`,
   `g100`, `rux` — are a feature of the shell, not a per-project choice; the
   script's theme question becomes the *default* theme. The sink's five-button
   switcher in `sink/harness.js` becomes `js/theme.js`: it sets `data-theme`
   on `<html>` before first paint from the stored preference, and the control
   lives in the shell's right panel beside the account. The header stays
   `g100` by Carbon's rule whatever the page is. For `rux` to be the same
   theme everywhere, `css/rux-theme.css` is vendored under
   `vendor/rux-ds/css/` and overwritten on every pin move; the project's own
   `rux-theme.css` stays, for its deltas, linked after it. That reverses
   §4.11's "written only when absent" for one file, and §4.11 says so. The
   accent stays rux's open decision; the mechanism does not wait for it.
2. **Every app has a profile, always.** Two layers, and the first needs no
   network. *Local*, in rux-ds: display name, avatar initial and theme in
   `localStorage` under one key. Every module sits on the origin
   `rux-sm.github.io`, so a name set in Notes is already read by the hub.
   This is the layer that is not password-protected, the one the gates test
   with no network, and the one that keeps an app usable with the backend
   down. *Cloud*, at the root: Supabase anonymous sign-in on first visit
   gives every visitor an `auth.uid()` with no password, so row-level
   security applies from day one; GitHub sign-in links that identity and
   makes the profile portable across devices. Cloud wins when a session
   exists and rewrites local; local serves when it does not.

Read on Supabase's documentation 2026-09-02: anonymous sign-ins must be
enabled in the dashboard; policies tell them apart by the `is_anonymous` JWT
claim; a default rate limit of 30 sign-ins an hour per IP applies; Turnstile
or invisible CAPTCHA is recommended; converting to a permanent user is
`auth.linkIdentity({ provider })`, and manual linking must also be enabled.
The identity-linking page does not say in so many words that linking applies
to anonymous users; the anonymous sign-ins page does, and step 5 relies on
that page.

**One backend.** One Supabase project for every app, on the Free tier, named
`rux-backend` after the repository that holds its configuration, migrations,
row-level-security policies and database tests, with no secrets in it. Auth,
`public.profiles`, and later a schema per app that needs one. The publishable
key is the only key a page ever sees. Blast radius is the price of one
project: migrations only in `rux-backend`, per-app schemas, RLS tests
mandatory; an app is split out only for unrelated data or independent
operations. Free's cost is the pause after a week idle; Pro only when it
bites. The pricing figures the first draft cited were not re-verified.

**The architecture.**

```
rux-ds, one tag, vendored into every module, overwritten on pin move
  css/rux.css · css/rux-theme.css · js/ (theme.js, profile.js, ui-shell.js)
  assets/ · templates/ (for the drift report)

rux-sm.github.io, the root
  switcher.json   the static app list
  switcher.js     fills the switcher panel
  account.js      Supabase client, fills the account panel, syncs the profile
  index.html      app grid, one Foundations link to rux-ds

rux-backend, new repository
  supabase/       config, migrations, RLS policies, tests; no secrets

one Supabase project, Free tier
  auth · public.profiles · later a scheduler schema
```

Ownership follows the switcher's split, which already exists. rux-ds owns the
account panel's markup and open/close, the theme module and the local
profile. The root owns `account.js`, the client and the auth configuration.
Each app owns its nav and content, and no app CSS restyles the shell. rux-ds
never gains a dependency — zero is a Phase 4 measurement (§4.4). `supabase-js`
from a CDN is a runtime dependency of every app, and is named as one.

**Steps, in order.** README "Picking this up" carries the first two already
and is the list to update.

1. **README items 1 and 2 first.** Push the hub, enable Pages, open the root.
   Notes gets the switcher button and panel. The redirect URLs and
   `/account.js` need the root to exist.
2. **Pin discipline.** Answer the open decision: Notes' `sync-ds.sh` retires
   for `new-project.sh`, which also gives Notes the theme and overrides files
   it lacks. Notes moves to a tag; the hub's check already refuses a PIN
   without one. A hub CI check that every module is on the same tag is tier
   2: proposed as a diff, with what it makes weaker. Write the manifest
   contract in §4.12: the shape of `switcher.json` and what a shell fetches.
3. **The shell standard, one rux-ds tag.** Capture Carbon's
   `header-w-actions-and-right-panel` story — already in the DOM and spacing
   captures — and diff the account panel against it. Compose its contents
   from compiled components: a radio group for theme, a text input for the
   name, a sign-in button. Add `js/theme.js` and `js/profile.js` with
   `BEHAVIOUR:` labels; `check-behaviour` covers both, with no network in any
   gate. Vendor `css/rux-theme.css` and `templates/`; add a drift report that
   compares a page's header region to the vendored template and blocks
   nothing. Update `docs/choices.md`: the theme question is the default. Tag.
4. **`rux-backend` and the project.** One repository: Supabase config,
   migrations, policies, database tests, local development notes, no secrets.
   One cloud project on Free. Auth: anonymous sign-ins on, GitHub as the one
   provider, manual linking on, Turnstile on. `public.profiles` references
   `auth.users`: display name, avatar, theme, updated-at. RLS owner only,
   tested both ways — owner passes, a second user fails. One exact redirect
   URL per app path.
5. **`/account.js` at the root.** Loads the client, opens an anonymous
   session on first visit, reads and writes the profile row, fills the panel
   the shell already renders, offers GitHub sign-in and links the identity.
   When the fetch fails it does nothing and the local profile stands — the
   same contract as `switcher.js`.
6. **The landing page.** Header-only shell, the app grid from
   `switcher.json`, one quiet Foundations link to rux-ds. Not a dashboard
   until cross-app data exists.
7. **Roll out.** Both modules to the same tag. Verify shell, theme, switcher
   and profile in each, in the browser, and record it in `docs/log.md`.
8. **Scheduler**, when it starts: its own schema, events with owner,
   timestamps and time zone, user-scoped CRUD, RLS and tests. Reminders only
   after the model works.
9. **Creator 3** (§4.12 item 3) stays last and is untouched by any of this.

**Steps 1 and 2 done 2026-09-02**, the same evening: hub pushed and live, Notes
with the switcher; then `v0.1.2` cut, both modules moved to it with
`tools/new-project.sh`, Notes' `sync-ds.sh` retired and its theme and overrides
files linked, both sites verified live. The pin move itself changed no css or
js byte — only Plex, now `font-display: optional` behind preloads, which both
modules had to add by hand: the first drift the report of step 3 would have
caught. The hub's same-tag CI check is a drafted diff, tier 2, not applied.

**Step 3 done in rux-ds 2026-09-02, `v0.1.3`** — a patch by §8.2's scheme,
since `CHANGES.md` gains no line, and not the `v0.2.0` the plan above named.
What landed: the account panel in all ten templates and the sink, Carbon's
captured right panel opened by the Account action through `aria-controls`,
holding the sink's text input and a vertical radio group offering all five
themes; `js/theme.js` in `<head>` applying the stored theme before first
paint; `js/profile.js` keeping name and theme under one key every app on the
origin shares; the first live rule in `css/rux-overrides.css`; the theme,
overrides and templates vendored by `new-project.sh`, the project's pair
written empty; `tools/drift.mjs` after every pin move. `check-behaviour`
gains six cases, 47 of 47. Every gate green at `fd2a6e1` — and LOOKING found
two things no gate can: a text input whose field-01 equalled the panel's
layer-01 in g100 (Carbon's `layer-two` on the stack, measured #393939 after),
and the sign-in button drawn despite `hidden`, because Carbon's display rule
beats the browser's on origin (`.rux--btn[hidden]` in the overrides file,
`4a29024`). All 38 browser cells re-read and recorded at `8fc08a1`. The drift
report's first real run, on the pin move, named exactly what each module
lacked: `theme.js`, the ids, `aria-controls`, the panel. **Both have them as of
2026-09-03 and the standard is proved across modules**: a theme and a name set
on the hub are what Notes opens with, read live. Notes was blocked for a day by
another session's unfinished contract-3 work in the same file; rux called it
abandoned, and it was lifted out to the session scratchpad as two applicable
patches with a note, because its producer half is committed in atlas and it is
resumable rather than dead.

**The notifications glyph left the whole system, answered by rux 2026-09-03,
and `v0.1.4` is one shell everywhere.** Carbon's captured header carries a
bell; nothing in this ecosystem notifies, and an icon-only button with no
handler is an affordance that lies — the rule `js/` and Notes' own shell
already stated. Notes had omitted it from the start, so the two headers
disagreed under a standard whose whole point is that they agree. It went from
both modules first and then, the same day, from all ten templates, so the
script no longer hands a new project a button to delete. Two global actions
ship, in Carbon's prescribed right-to-left order: switcher, then account.
`sink/ui-shell.html` KEEPS all three, and that is the line — the fragment is
the capture, a template is what an app ships; `i-notification` stays
referenced and the icon figures do not move. Notes also gained the mark, the
one shell part it had never carried. Rejected: adding a decorative bell to
Notes so the headers matched, which would have made both lie.

**Removing it was invisible to every gate**, and that is worth keeping. A
whole button left ten pages and no figure moved: its classes are the two
remaining actions' classes, so `check-runtime-classes` counts the same
distinct set; its spacing signature is theirs, so `check-spacing` compares
the same rows; it had no focus defect, so `check-a11y` had nothing to say.
All 33 affected cells were re-swept at `33077bb` to record exactly that. A
gate that cannot see a button leave cannot see one arrive wrong — the third
time in two days that only looking would have caught something. NOT done, and said so: an
avatar, since Carbon compiles no avatar component; a visual pass in g100 and
`rux` beyond computed style, since the pane's screenshots returned stale
frames after a theme switch; and the drift report compares head resources by
file name, so the vendored-then-own order of the two theme links is invisible
to it.

**Outside Supabase, deliberately.** `switcher.json` stays static, so
navigation works with the backend down. Notes' guide content stays static
and publishable-gated; per-user favourites keyed by guide id are fine, guide
text is not. Every rux-ds gate runs on fixtures with no account and no
network.

**Rejected, from the first draft of the same day, recorded so it is not
re-proposed.** *Theme consistency as drift between project-owned theme files*
— Notes ships no theme file at all, and the shared look is compiled into the
vendored stylesheet; the real change is the standard above. *Notes data in
Supabase* — guide content is atlas's export tier, static and gate-held on
every commit. *A shell-region rewriter that patches a page's markup on pin
move* — the shell has changed once; a drift report that blocks nothing is
enough until it changes a third time. *The sign-in entry point in the hub and
the panel in rux-ds with no line between them* — the switcher's split is the
line. *A Foundations link to Atlas* — it is private. *Pro from day one* — a
decorative Account button does not need it. *Starting before the root
exists* — nothing here resolves without it.

**Record.** Notes' README says publishing "did not add a fourth project";
this adds one, and the hub is a fifth. Amend that line there rather than
leave it implicit.

**Step 4 started 2026-09-03, `rux-backend` private, not tagged.** The
project this step names did not need provisioning: `rux-ui`
(`udnmqhayzhrbltxzzhjw`), the bus/trip scheduler's own backend, already is
"one Supabase project" in the sense §4.13 means, so it was adopted rather
than a second one created. CLI migration history was bootstrapped against
its live schema (`db pull` needs Docker; installed this pass) and the pull
committed as a private snapshot — `rux-ui`'s own tables, `public.profiles`
among them, an unauthenticated driver roster unrelated to this phase's
profile and never touched. The cross-app profile lives in a new `platform`
schema instead: `platform.profiles`, keyed to `auth.users`, owner-only RLS,
4/4 pgTAP passing locally before anything reached the live project
(`25b4bdf`, `677bcf3` there). Anonymous sign-in (user-enabled in the
dashboard) and manual identity linking are live and confirmed there.

**`supabase config push` replaces a whole config section rather than
merging it, and that cost a live setting.** Two keys were wrong in the
first pass — `enable_manual_linking` nested under `[auth.anonymous]`
instead of top-level `[auth]`, and anonymous sign-in written as an invented
`[auth.anonymous]` table instead of the real `enable_anonymous_sign_ins` —
both silently defaulted to `false` and the push carried that default onto
`rux-ui`, which also reverted MFA TOTP, email confirmation, email OTP
settings and the API `extra_search_path` to CLI defaults as a side effect
of the same whole-section replace. None of it was in the diff anyone had
read closely enough to expect. Caught by asking rux to check the dashboard
toggle directly rather than trusting the CLI's own diff output, corrected,
and reverified across three pushes down to a clean single-field change
(`7793b9b` there). The lesson: `config push` needs every field that
differs from CLI defaults stated explicitly, or it will revert them —
matching this project's own refrain that a tool's own report is not enough
to trust without checking the thing itself.

**Step 4 done, 2026-09-03** (`rux-backend` `b95f839`). The GitHub OAuth App
(homepage `https://rux-sm.github.io/`, callback
`https://udnmqhayzhrbltxzzhjw.supabase.co/auth/v1/callback`) and the
Cloudflare Turnstile site (domain `rux-sm.github.io`) both exist; `platform`
is in the live dashboard's exposed schemas (Settings → Data API); and
`[auth.external.github]` / `[auth.captcha]` are `enabled = true` in
`config.toml`, pushed and confirmed live — the diff touched only those two
sections, nothing MFA/email/search-path adjacent.

**A second mechanism was tried and rejected before the real one worked:**
`supabase secrets set` looked like where `SUPABASE_AUTH_GITHUB_CLIENT_ID` /
`SUPABASE_AUTH_GITHUB_SECRET` / `SUPABASE_AUTH_CAPTCHA_SECRET` belonged —
rux-backend's own README said so — but the CLI rejects any secret name
starting with `SUPABASE_` outright, because `secrets set` manages Edge
Function runtime secrets, a store `config push`'s `env(...)` never reads
from. The right mechanism is a local (or CI) shell environment variable
present when `config push` runs. rux-backend's README was wrong and is
fixed in the same commit. **A second, separate mistake on the same pass:**
the first `config push` attempt was confirmed with the literal placeholder
text (`<github_client_id>`) still in the export command instead of the real
value substituted in, which briefly pushed that placeholder as the live
`client_id`; caught from the diff on the next push (real client id replacing
the placeholder) before anything downstream used it, and corrected the same
session. Steps 5 and 6 are not started.

**`v0.1.5`, 2026-09-03 — the tile-fill rule in every app.** The hub found
a ragged row of cards, fixed it with one compiled class in its own
`rux-overrides.css`, and rux promoted the rule into rux-ds's file
(`fd437ae`). That left it in no tag: both modules pinned `v0.1.4`, Notes
had no rule, and the hub looked right only because of its private copy —
the two-places state the pin exists to prevent, and invisible to every
gate on either side, since the hub's check asks whether classes resolve
and the drift report compares shells, not stylesheets. Tagged as a patch,
both pins moved with `tools/new-project.sh`, the hub's copy deleted; each
diff is `PIN` and the vendored overrides file, and each drift report
reads as it did at `v0.1.4`. Read live on both sites: `PIN` at `v0.1.5`,
the rule in `vendor/` and nowhere else, the hub's two cards 152 px flush
at 1280×900. The rule this adds to the procedure: a promotion into
`css/rux-overrides.css` is not finished until a tag carries it and every
pin has moved, and the module that donated the rule deletes its own copy
in the same commit as the move.

**Step 6 done 2026-09-03, hub `68ce1fa`.** The landing page is header-only.
The side nav that came with the app-shell template held Home and an anchor
to a grid already on screen, so it navigated nowhere the page did not show;
it left with the hamburger, the scrim and the `<style>` block that indented
the content past a nav inside the header, and Carbon's own
`.rux--header ~ .rux--content` rule places the content now. The shape is
the captured `header-w-actions-and-right-panel` story — actions, panel,
content, no menu trigger, no nav — which is why this is not the rail or
collapsed nav `docs/choices.md` says to ask before offering; it is the
absence of one. The Foundations link goes to the rux-ds repository, which
has no site of its own, and is inline because it sits in a sentence.

Gated as `rux-ds-page` §7 asks, with one mechanic worth keeping: neither
server sends CORS, and `check-spacing` reads `/docs/carbon-react-spacing.json`
from its own origin, so the tools ran from a scratch root of symlinks — the
hub's files beside rux-ds's `docs/` and `tools/` — served as one origin,
every file the one on disk. Read at 1280×900, white asserted, focus held
and blurred, transitions off, pointer parked: `check-runtime-classes`
47/47, nothing stripped or added; `check-a11y` 0 findings, 0 notes,
`focusRingChecked: true`; `check-spacing` 27 of 29 matched, the two others
the col-span-4 demo `min-block-size` this ledger adjudicates and the
subgrid padding-block divergence recorded on every page carrying the grid,
both older than the change. At 375px nothing overflows and the cards stack.
Read live the same day.

NOT done, and said so: `tools/drift.mjs` now names five shell parts missing
on this page on every pin move, by design, and the report has no way to
say so; and this is the first page in the ecosystem with no side nav while
`docs/choices.md` lists the nav as not a choice — whether "header-only"
becomes a row there, offered by the skill, is rux's to decide.

**Step 5 done, verified live, 2026-09-03** (`rux-sm.github.io` `bf26c6d`).
`account.js` at the hub root: `sb.auth.getSession()`, falling back to
`signInAnonymously({ options: { captchaToken } })` with a token from a
Turnstile widget rendered in `appearance: 'interaction-only'` mode; reads
`platform.profiles` by the session's `id` and merges into the local
profile field by field — a null column leaves the local value alone rather
than blanking it — then upserts a fresh row when none exists; local edits
push back up through `window.Rux.profile.onChange`, debounced 500ms;
`window.Rux.profile.onSignIn` wires the panel's button to
`sb.auth.linkIdentity({ provider: 'github' })`. supabase-js and Turnstile
load from CDN, pinned to the major version per each vendor's own guidance;
neither key embedded is a secret — the publishable key and the Turnstile
site key are both meant to sit in client code the browser can read.

Automated verification hit its ceiling here: Turnstile is bot detection,
and the browser pane driving this session is exactly what it exists to
catch. Every challenge came back `failure_retry` and no token issued —
correct behaviour, confirmed separately by calling `signInAnonymously()`
with no token and getting `captcha_failed` back, proving the gate was real
and not merely assumed. What automation could not finish, rux did, in a
real browser, the same day: the anonymous session opened, the Turnstile
gate passed, a name and a theme both survived a reload. **Two real bugs
turned up from that one read, neither reachable by reasoning about the
code:**

1. `linkIdentity` redirects to GitHub before Supabase knows whether the
   identity is free, so a conflict — this GitHub identity already
   belongs to a different, permanent account, from an earlier anonymous
   session created during the same testing — surfaces only as
   `error_code=identity_already_exists` in the URL on the return
   redirect, never through the `linkIdentity()` promise, which had
   already resolved and handed control to the browser navigation by the
   time the conflict was known server-side. No try/catch around that
   call could have caught it. Fixed by reading `location.hash` for the
   error on load and falling back to `sb.auth.signInWithOAuth()`, which
   authenticates the already-linked account instead.
2. The account panel has no avatar and no name/email swap — nothing in
   the markup shows a signed-in state — so after the redirect rux could
   not tell whether linking had actually worked. Fixed the only way the
   existing markup allows: `profile.onSignIn` is only registered while
   the session is still anonymous, so a permanently-linked session never
   reveals the Sign in button and its absence is the signal. Confirmed in
   the console after both fixes: `anonymous: false`,
   `providers: ['github']`.

NOT done: an interrupted anonymous sign-in is not retried until the next
page load; a real Turnstile interactive challenge (as opposed to the
automated failure above) was never observed, so its placement inside the
account panel is untested against one; and the panel still has no positive
"signed in as X" indicator — only the negative signal of the button's
absence, which answers "are you signed in" but not "as whom."

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
- ~~Not keeping SCSS past Phase 4 — a build step is a dependency.~~ Reversed
  2026-09-01: the SCSS build is the upgrade path (§4.4). The consumer still has
  no build step; the dependency is this repository's alone.
- Not running IBM Telemetry. `@carbon/web-components`, `@carbon/utilities` and
  `@carbon/icon-helpers` carry `postinstall` telemetry hooks; npm 11 blocks them by
  default and they stay blocked.
- ~~Not supporting 4 themes. Two.~~ Reversed 2026-09-01: all four, plus a custom
  one (§4.10).

---

## 8. Distribution — licence and versioning decided

Raised by the 2026-08-29 audit (`docs/audits.md`, findings 1 and 6). They are recorded
together because they are one domain: what it means to hand this to someone else.

**§8.1 is decided and done as of 2026-08-29. §8.2 was decided 2026-09-01 and
tagged 2026-09-02**; a consumer pins a tag.

### 8.1 Licence — DECIDED 2026-08-29, Apache-2.0

**The project ships under Apache-2.0**, and both halves below are now satisfied. What
follows is kept as the reasoning, not as an open question.

Four things landed together:

| | |
|---|---|
| `LICENSE` | The Apache-2.0 text, copied verbatim from `@carbon/styles`'s own copy so it is not transcribed from memory. Byte-identical to it apart from the appendix copyright line, which reads `Copyright 2026 rux` |
| `NOTICE` | Names every artefact carrying Carbon-derived material and what was changed in each, per §4(b) |
| Banner in `css/rux.css` and `css/rux.min.css` | Written by `tools/build.mjs`, so it survives every rebuild rather than being a one-time edit |
| Attribution in `assets/icons.svg` | Written by `tools/icons.mjs`, and `npm run icons` inlines it into all nine templates; `build-sink` and `build-portal` carry it into the two generated pages |

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

### 8.2 Versioning — consumers pin a tag

**Decided.** Tags from 2026-09-02 — `v0.1.0`, `v0.1.1` — and `CHANGES.md` as the
changelog, removals only; still no `version` field. What follows is the history of
the decision, most recent entry first after this paragraph.

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
staleness, and is real work.

**TAGGED 2026-09-02: `v0.1.0`**, cut with Phase 11 rather than with §4.9's first
batch as the line below promised; the four batches shipped untagged and this
corrects it. Scheme, rux's to change: `v0.MINOR.PATCH`, minor when `CHANGES.md`
gains a line (a class left), patch otherwise, `v1.0.0` when rux says so.

**DECIDED 2026-09-01: tag milestones now.** The trigger below was a freeze, and §1
no longer has one — the set grows toward completeness and Carbon upgrades keep
coming. A friend or a project pins a tag; `CHANGES.md` records a removal; the
first tag lands with §4.9's first batch. *The deferral as written:*

**DEFERRED 2026-08-31, WITH A TRIGGER — decided when the component set freezes.**
*Trigger corrected later the same day: it read "when Phase 4 freezes the component
set", and §4.4 then declined the devendor while admissions are open, so Phase 4 may
never run. The event is the freeze itself, however it arrives; nothing else here
changes.*
Consumers keep pinning to a SHA until then. The reason is sequencing rather than cost:
execution order is 1 → 2 → 3 → 5 → 6 → 4 → 7 → 8, so devendor is still ahead, and §4.4
says devendoring is what CLOSES the component set. A version stamped on the class
vocabulary today prices something Phase 4 is going to rewrite.

**This section's complaint is answered even though the question is not.** What it objected
to was the choice being implicit in the absence of a tag; it is now explicit, dated, and
carries the event that reopens it. The risk it names is unchanged and worth restating:
additions are safe because `docs/coverage.json` ratchets upward, and REMOVAL is the
hazard — a component leaves in three lines and a page written outside this repository
finds out by rendering wrong, with `check-classes` unable to see it.

---
