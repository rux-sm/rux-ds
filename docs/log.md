# Log — passes, measurements and answered decisions

Moved out of `README.md` "Picking this up" on 2026-09-02, verbatim and in the
order they stood there, so that README could be the current state and this the
record. **Every figure here is what a gate printed on the date named and is not
the current state** — `npm run verify`, `npm run gates` and `portal.html` are.
Nothing here is regenerated; `tools/build-readme.mjs` says why a record must
not be. A new pass or an answered decision goes at the top of the block below.

---

**2026-09-05 — Rux logo 2 confirmed as the official brand everywhere.**
User chose the newest cleaned Rux logo 2 for all branding and favicons.
Copied the design-system master and generated favicon into Rux Apps and
Rux Notes; both consumer repositories were clean before this change.
All three projects' logo and favicon files compare byte for byte. Checked
78 brand/favicon references across 38 standalone HTML pages: all resolve
to matching files, including nested pages. The first scratch path scan
incorrectly treated sink fragments as standalone pages; rerun on complete
HTML documents, including the assembled kitchen sink, passed. The fragments
are consumed relative to the assembled page, not their source directory.
Both consumer checks passed. Opened both local consumer home pages and
inspected their headers; the new logo loaded at 24x24 CSS pixels on each,
and each favicon link resolves to its own updated brand directory.
No template or pinned vendor files changed. New projects inherit the master
through the existing seeding script. No commits, pushes or deployments were
made; this records the local rollout, not live publication.

**2026-09-05 — Rux logo 2 supersedes Untitled 2 in the working assets.**
User asked to adjust and check the newer export. It already restores
gray-10 and adds the ear bridge; its wider neck is retained. Squared the
ear's 0.09972-unit corner rounding so every edge follows the pixel grid.
Removed redundant and zero-area paths after that adjustment, reducing 22
paths to 13 without changing the resulting 91 occupied cells. Bounds remain
x=1..15, y=2..14. Regenerated favicon and light/dark app icons; all parse as
XML and carry exactly the master's paths and viewBox. Opened app-shell and
inspected the header: image loaded, 24x24 CSS pixels, devicePixelRatio 2.
`npm run verify` exit 0. Native tab-strip and 1x-display rendering were not
measured. Consumer copies and deployment remain unchanged; no commit made.

**2026-09-05 — Untitled 2 adopted as the shared drawing in rux-ds.**
User approved the reviewed 16x16 design for the logo, favicon and app icons.
Cleaned the Linearity export without redrawing: removed the zero-area path,
two fully covered paths, per-path export attributes and point dimensions.
Compared the occupied grid cells before and after: identical, 92 cells.
`npm run marks` regenerated the favicon and both neutral app icons; XML
parsing and exact comparison confirmed all three carry the master's 13
path strings and viewBox. `npm run verify` exit 0. Opened app-shell in the
browser: logo loaded at 24x24 CSS pixels, devicePixelRatio 2, header ground
rgb(22,22,22); inspected the rendered header. Opened the favicon SVG:
no parser error, 13 paths, dark preference resolved fill rgb(244,244,244).
This did not measure a native browser tab-strip icon or emulate a 1x
display; the 1x sizing guidance is grid arithmetic, not a screenshot result.
No shell layout or generator changed. Consumer repositories, deployment and
platform-specific launcher packaging were not updated; this pass changes
the design-system master and generated assets only. Brand docs corrected
where they still prescribed blue icons or an 8x8 grid.

Everything below is in the repo, so a fresh clone is the whole handover — nothing lives
in an editor session or a machine-local note.

**2026-09-05 — Brand.svg is the mark, everywhere, and the gate charged for it.**
rux-ds `b11622c`, swept at `5237fcc` and `f2d739f`; Rux Apps `390e272`,
Rux Notes `4dddf21`. Supersedes Rux logo 2 the same day. The source is
`~/Developer/Brand.svg`, already drawn on a 16x16 grid with integer
coordinates; `brand/logo.svg` is the cleaned master, 23 paths down to 14.

**The cleanup was verified by rasterising, not by reading.** All 256 grid cells
compared between export and master: 86 filled, identical, bounds x=1..15 and
y=3..14 — one cell of padding left and right, three above, two below, which is
what rux's own README edit already claimed and it is right. No path carries a
fractional coordinate. `npm run marks` regenerated the favicon and both app
icons, and regenerating again produced byte-identical files. None carries a
`--` inside an XML comment.

**Opened and looked at**, which is the only thing that catches a bad mark: the
drawing renders as intended at 360px; app-shell loads it at 24x24 CSS px with
naturalWidth 150 and complete true; the favicon serves 200 with its own
`<style>` and flips ink by scheme, measured `rgb(22,22,22)` under light and
gray-10 under dark; icon-light carries dark ink and icon-dark light ink on a
transparent ground.

**The gate accepted at `754219b` did exactly what it was accepted to do**: the
mark changed and 28 cells went stale, so the sweep was owed rather than
optional. Thirteen pages re-read, every figure identical to the reading it
replaced. That is the second sweep brand/ has forced and the first that was
routine.

Both consumers carry byte-identical logo and favicon copies. NOT DONE: neither
consumer page was rendered — the preview pane cannot load files outside the
project folder — so their commits say so rather than implying a look that did
not happen. Every `brand/` reference in both repositories resolves to a file
that exists.

**2026-09-05 — brand/ becomes a browser-gate input, and the first sweep it
forced.** `754219b` (the gate), `d8fd169` (Rux logo 2), `63742f5` and `9270fb4`
(the ledger). Proposed after stage 8 found the hole: the logo, favicon and both
app icons were replaced on every page's header while `npm run gates` went on
reading 41 of 41 current. Accepted by rux with the cost stated — **28 cells now
age on a mark change**, so swapping the logo stops being the free operation the
README advertises.

**It buys no new detection, and that was measured before it was proposed rather
than discovered after.** A zero-sized SVG — the failure that has shipped here
twice, from `--` inside an XML comment — renders **300px wide** on app-shell and
blows the header out by 276px, and check-a11y, check-spacing and
check-runtime-classes all return figure-for-figure identical results. No gate
reads the mark: an `<img src>` whose file changes alters no class, no attribute
and no box property of any classed element. check-runtime-classes is therefore
excluded, on the same ground as the stylesheets it already excludes, proved the
same way. What the change buys is a ledger that stops claiming currency it has
not earned, and the human pass that follows — the only thing that has ever
caught a broken mark here, both times by someone opening the page.

The sweep: thirteen pages, 29 cells, every figure identical to the reading it
replaced — the sink's 29 findings and 6 notes with the standing date-picker
calendar, wizard-page's four adjudicated progress-step-button false positives,
47 of 47 behaviour cases, 68 rendered sections with 0 collapsed and 0 escaped in
all five themes. Each a11y reading proved red in the same execution and
restored. The mark was measured on every page rather than assumed: 24x24 CSS px
in each header.

**Two things found while sweeping for a logo.** `check-rendered`'s `emptySvgs`
rule is the one rule in the set that could catch a zero-sized drawing, and it
cannot see this one, because the logo is an `<img src>` and not an inline
`<svg>` — a 0x0 mark still passes every gate. And the registry's `baseline`
field for check-a11y still reads "kitchen-sink 0 findings · 6 notes" where the
honest standing figure has been 29 findings and 6 notes since 2026-09-04;
`baseline` is documented as a record rather than an assertion, so it is left for
rux rather than edited inside a sweep commit.

**DONE 2026-09-05 — content editing that reads as content (§4.12 stage 8).**
`30e91fb`, swept at `becea4d`, restamped at `33a244a`, 41 of 41 current. The
panel said "Text 1 of 18" over "In `<div>`"; it now names every field by what it
is, groups them, shows the original beside each and resets one at a time. The
case for it is measured: `div`, `p` and `span` hold 127 of the 241 fields and
`<th>` holds none.

`textFieldsOf` gains `context` and nothing else moves — all 241 fields keep
their offsets and text byte for byte, asserted before anything else, because
edits are indices into that list and a draft hashes the block's markup rather
than the algorithm. Link targets are the one editable attribute, and the ORDER
is the contract: edits first, instancing last, since a link repointed at
`#target` must become `#target-2` on instance 2. No shipped block has both an id
and a real link, so a fixture asserts it.

**Four naming rules came from LOOKING at the output**: a fieldset beats anything
nested in it (or "Notify me when" loses its heading), a header row is not Row 1,
an unclassed wrapper takes its name from what holds it, and a fallback is
numbered only when two groups share a kind — which is what "Actions 7" was.

**Two red runs came back GREEN with the mutation verified applied**, so the
suite was measuring nothing: a read-back regex truncated at a raw quote, and a
composePage assertion used a value instancing never touches. Both are
exact-match now and both go red. My own two errors on the way are recorded in
the roadmap rather than tidied away: a `git checkout` destroyed the real change
I was mutating, and a `perl` substitution silently failed to match twice.

Found in passing: `session.mjs` carried a literal NUL byte as its run-key
separator since stage 6, which made git diff it as `Bin` and grep match nothing
in it. Now `\0` — same key, and the file is text.

**Reported, not changed:** `brand/` is not a declared input to any browser gate.
rux's replacement mark was uncommitted throughout, every page's header changed,
and `npm run gates` still read 41 of 41 current. Tier 2, so rux's to accept.

**DONE 2026-09-05 — export and parity (§4.12 stage 7).** `ce27ceb`, swept at
`587dd70`, restamped at `2ed1611`, `npm run gates` 41 of 41 current. Two
delivery paths and no third: download the page or copy its `<main>` for a
project that exists; copy the exact `new-project.sh` command for one that does
not. The script stays the one project creator, and the FOLDER is deliberately
left for it to ask.

`tools/check-parity.mjs` is new, tier 2, and it RUNS THE SCRIPT'S OWN BYTES —
the page-writing region extracted by anchor and executed under `sh`, because
the whole script refuses a dirty tree and a gate that ran it would fail on
every uncommitted change. A region it cannot find faults rather than passing.
30 of 30 byte-identical, 10 templates × 3 answer sets.

**IT FOUND A REAL DEFECT ON ITS FIRST RUN.** `content()` used a STRING
replacement, so JS expanded `$$`, `$&`, `` $` `` and `$'`; the `aria-label`
beside it used `split().join()`, which is literal. One answer therefore produced
two different strings on one page and the header's visible name disagreed with
its accessible one. Fixed with the function form. The claim was written down at
stage 2 and proved once by hand with DEFAULT ANSWERS — the one set that cannot
see it. Red three ways before trusted: the unfixed `content()` (10 faults), one
altered `sed -e` (30), a deleted end anchor (ANCHORS, nothing compared).

**Byte parity is not valid HTML** — neither side escapes the answers, the gate
says so in its printed words, and the builder warns rather than escaping
unilaterally and breaking the parity it just earned. Open for rux: escape in
both, reject in both, or leave it.

A review finding became code: `showNotice()` clears its container, so export
feedback in `#bld-notice` would have deleted the unopened-draft warning and its
Discard while saving stayed blocked. Export has its own region; read both ways
in the browser. One file-name rule serves the download and `--page`, because
the script dies on a separator and a browser flattens one.

Two things only looking caught — the command block scrolled sideways in a
five-of-sixteen column and now wraps, and the download's blob is released on a
timer rather than the same tick as the click. One measurement error of mine is
recorded rather than buried: a first read of the file-name cases came 120ms
after typing, against a 250ms render debounce, and reported three bugs that
were not there. Not shown by the harness, and said so: a file landing on disk,
and clipboard read-back.

Five controls touched. `verify` grows by one `&&`, so a `check-parity` failure
hides what follows it. The gate judges a fix authored in the same run, which
`AGENTS.md` will not have as the last word: the red runs are evidence, and the
gate with its `content()` fix still wants reading from a session that did not
write them.

**SWEPT 2026-09-05 — the six stage-6 cells, and the record above corrected.**
The entry below says "the six dirty browser readings remain unverified and
unstamped"; that was true when it was written and is not true now. All six were
run against the served page and recorded: builder.html at `8d651f2` (`e482f6c`),
portal.html at `e482f6c` (`a68f059`), `npm run gates` 41 of 41 current.

Every figure is unchanged from stage 5. builder.html: check-runtime-classes
47/51 with 0 stripped and the same 4 added — the file count did NOT move,
because Start over reuses the Remove button's danger-ghost class and Undo and
Redo reuse the ghost-sm set, so stage 6 added no class to the authored page;
check-a11y 0 findings and 0 notes with `focusRingChecked: true`, proved red at
28 and restored to 0; check-spacing 33 checked, 32 matched, the same subgrid
unknown. portal.html: 64/64, 0 findings, 25 checked and 23 matched.

**THE NOTICE STATES WERE MEASURED, not left to the fresh page.** They are what
stage 6 added and a fresh load never shows them: cloning the notice alone reads
47/63 — reproducing the roadmap's recorded figure exactly — and cloning the
alert as well reads 47/64, the one further class being
`rux--actionable-notification--error`. 0 stripped in all three states, and the
thirteen classes the pair brings are all ADDED, which is why they ship inside
`<template>`.

**A SCREENSHOT OF THE WHOLE PAGE, for the first time on these cells.** The
stage-5 sweep recorded that a screenshot after scrolling came back blank twice
because the pane is hidden, and verified that section structurally instead.
Scrolling a hidden pane still returns a blank capture — reproduced here — but
emulating a 1280x2300 viewport renders the entire page in one shot. Read that
way: the Undo / Redo / Start over row with both history buttons disabled on a
fresh page, Blocks with its move and remove controls, Edit content with Text 1
of 2 and Text 2 of 2, and the preview status line. The gate readings were taken
at 1280x900; the tall viewport was for the visual pass alone.

The red-tag oscillation was measured in BOTH directions rather than inferred:
the stale portal read 65/65 with 3 red tags and 131 green, the regenerated page
64/64 with 0 red and 134 green, and `rux--tag--red--sm` leaves the unreferenced
spacing list with them. Still not verified, and still the harness: `Cmd/Ctrl+Z`
is not delivered to the page, so the shortcut still owes one human keypress.

**FIXED IN REVIEW 2026-09-05 — three stage-6 recovery defects.**
The validation claim in the proposal below was too broad: missing required slots,
non-string answers, unknown themes and a follower separated from its leader all
passed. Required slots and answer values are now checked; followers must name a
member of their current contiguous run, matching `unitOf`. Start over now clears
the unopened-draft flag as well as storage, so subsequent edits save again.
Scratch regression checks ran against the actual modules and the caller's action
functions in a mocked DOM/storage environment: 17 passed and 25 failed before,
42 passed after, including byte-exact restored composition for all ten templates.
`npm run verify` exit 0. No controls or baselines were changed for these fixes.
Browser verification was attempted but the server at port 8642 was stopped
(connection refused), and this session has no preview-launch tool required by
`sink-check`. The six dirty browser readings remain unverified and unstamped.
**Superseded 2026-09-05 by the entry above: all six were run and recorded, and
every figure is unchanged.**

**PROPOSED 2026-09-05 — undo, redo and a draft that survives a reload (§4.12 stage 6).**
`builder/session.mjs` new (pure, node-tested); `builder.js` on one session history;
the chrome and two notice templates in `tools/build-builder.mjs`. 39 node assertions
green, 4 red when the follower check, the hash check and the deep copy were disabled.
Browser: three undos restoring edited text, then original text, then removing the block;
five keystrokes at 100ms real gaps = 1 entry; edit-then-immediate-reload survives via the
pagehide flush; an orphaned draft left unopened, not overwritten, Discard restores saving;
check-runtime-classes 47/51 fresh (unchanged) and 47/63 with the notice, 0 stripped either
way. ONE BUG FOUND BY RUNNING IT: snapshot() returned live references, so change() compared
an object with itself and recorded nothing — fixed at the source. TWO HARNESS LIMITS
RECORDED: cmd+z is never delivered to the page (a capture probe saw no keydown at all,
fronted or not, though Tab arrives), so the shortcut is proved only by synthetic dispatch
and owes one human keypress; and an awaited step in the pane costs ~1s of wall clock, so
sub-second timing must be measured inside one execution with a busy-wait. `npm run verify`
exit 0. The three builder.html cells are stale — the first time stage 0's rule has fired.
Awaiting rux's review.

**DONE 2026-09-05 — add and move a block: the page model (§4.12 stage 5).**
`builder/page.mjs` new, tier 3; `integrity()` added to `builder/rewrites.mjs`; the
chrome in `tools/build-builder.mjs`; `builder/builder.js` on the model. Node, all 33
blocks, uncommitted scratch: pristine model identical on 10 of 10 templates; 2000
random add/move/remove steps, every invariant held; the fixture twice on app-shell,
0 duplicate ids, 2 radio groups, second footprint at depth 8 with its FROM line;
wizard actions on app-shell 1 unresolved (`data-rux-open="wizard-cancel"`), breadcrumb
3 (`href="#breadcrumb"`), every pristine template 0 and 0. Found on the way: `compose`
writes the string `undefined` on a grown slot, and every template's sprite carries
Carbon's `i-undefined--filled`, so the assertion counts rather than greps. Served page in
the pane: `stl-2-2` checked and `stl-1` still checked after clicking the second copy;
edit on instance 2 survives move and removal of instance 1; pagination moves and goes
with its table; Tab order slot → catalogue → Add → picker → Move up → Remove, Move down
disabled at the end. Not delivered by the pane: Enter/Space activation, the shipped
width buttons failing the same way. `npm run verify` exit 0; `check-controls` names
`build-builder.mjs` and `rewrites.mjs`; the three `builder.html` cells stale at this
commit until re-swept. Accepted by rux and landed the same day.

**DONE 2026-09-05 — instance identity for the page builder, measured before written
(§4.12 stage 4).** Over all 33 blocks in `builder/blocks.json`: 51 ids in 9
blocks; 49 `for`/`aria-controls`/`aria-labelledby` references, every one inside its own
block; 1 `data-rux-open`, 52 sprite `<use href="#i-…">` and 10 page anchors, every one
outside; 3 radio `name`s; no id defined in two blocks, no block defining both `A` and
`A-<n>`, no attribute outside the IDREF set coinciding with an id. `instanceOf(html, n)`
added to `builder/rewrites.mjs`; the `REF_ATTRS` comment in `tools/lib/blocks.mjs`
corrected — it said `href` was in the rewrite list, which would have broken 62
references and fixed none. 24 scratch assertions, uncommitted: green on the first run,
and 4 red when the radio-`name` rule was removed from a copy. `npm run verify` exit 0;
`npm run gates` 41 of 41 current; `check-controls` names the two files. Accepted by rux
and landed the same day; roadmap §4.12 stage 4 has the account.

**DONE 2026-09-02 — Plex at `font-display: optional`, preloaded, and Plex Mono shipped
(§4.1.1).** Found on a consumer page: every load painted in `system-ui` and then redrew in
Plex, because the file was only discovered after `plex.css` had parsed — on this server the
stylesheet finished at 19ms and both files were requested at 37ms — and the faces do not
share metrics: measured here, Plex is 1.65% narrower than `system-ui` on one 80-character
string and 0.8% on another, and its normal line box at 16px is 21px against 19px, so the
swap re-wrapped lines and pushed paragraphs down. Fixed in `assets/fonts/plex.css`
(`optional`: one face per load, never a mid-flight swap, cached for the next) and by a
`<link rel="preload" as="font" crossorigin>` per face ahead of the stylesheets in the ten
templates, `tools/build-sink.mjs` and `tools/build-portal.mjs`. Rejected a metric-matched
fallback face: its `size-adjust` came from one string on one OS, and its `local()` list did
not name the face the stack actually falls to on a Mac. Also found that Plex Mono was
reached and not shipped — the reset sets `<code>` in it, the sink's code-snippet and
copy-button and the portal set one, and Carbon's date and time inputs are `code-02` — so
`IBMPlexMono-Regular-Latin1.woff2` is copied from `@ibm/plex-mono@2.5.0` with that
package's own unicode-range, which is not the list `@ibm/plex@6.4.1` gives the Sans files.
Measured after the change on all twelve pages in the pane: every woff2 requested by its
preload at 7–14ms, before `plex.css` finished at 11–23ms; one fetch per file; no
unused-preload warning; every template renders both Sans faces, and Mono is rendered by
the sink, the portal and `templates/schedule-page.html` alone, so those three preload it.
The `sink-check` loop now reloads when Plex is not serving, since under `optional` a
cold-cache load never swaps. Ages all 38 browser cells. **Re-swept the same day at
`96b6c4a`, all twelve pages, and every reading is identical to its predecessor** — counts,
the named unknown sets, the adjudicated findings and the eight stripped calendar classes on
the schedule template all unchanged; pane hidden throughout, and the sink alone gave no
readable screenshot, which its cells say. Recorded in two passes per the portal rule.

**DRAFTED 2026-09-02 — terminate the portal browser-ledger fixed point (§4.8).**
The cycle is observed, not hypothetical: `2529e48` recorded readings taken at
`a3f25e1` and regenerated `portal.html` from all 38 changed matrix rows, so the three
portal cells were stale in the commit that recorded them. Seven legitimate portal
changes followed and now appear as the immediate cause.

The proposed Tier 2 diff leaves `staleness.mjs` alone and keeps `portal.html` as the
input that ages its own cells. The generator derives those cells from `cells()`, omits
their changing state, date and result, and renders one invariant row directing the
reader to `npm run gates`. It reports the displayed subset and the CLI-only count
separately, so it does not present the displayed subset as the whole registry. A full sweep remains two
passes: commit the non-portal readings, sweep the resulting clean portal, then record
the portal alone. On that second pass `npm run verify` must leave the portal
byte-identical or the record is refused.

**What this gives up:** the portal no longer shows the exact state of its own three
cells. The CLI and ledger still do. What it does not give up is page staleness: any
real portal change, including another rendered ledger row changing, still ages those
three cells. No digest baseline or future commit is invented. This draft is not
approved by its own passing checks.

The fixed-point experiment changed only the portal reading for
`check-runtime-classes`, rebuilt, and left `portal.html` byte-identical at
`07109675380952f49a9f14e25e92e75ab00d2680b849e2de8e31b364a52ed2d4`.
Changing one displayed non-portal reading changed the hash to
`81e0f6f571e73ed675961fb74a2de2e4d9bb42c786262524d2157c21a5344e9c` and left
exactly the three portal cells stale. Both temporary ledger edits were restored and
the original hash returned. `npm run verify` then exited 0 and `check-classes` found
no uncompiled class; that is diagnostic evidence, not approval of this Tier 2 diff.

**IMPLEMENTED 2026-09-02 — the per-gate dependency model, and finding 14 with
it.** Each browser gate now declares what it actually reads, and an optional
`pageInputs` map carries a dependency that belongs to one page.
`check-runtime-classes` takes `js/` and its own page and NO stylesheet: it
compares the live DOM's class sets against the static markup, the difference is
made by modules running, and nothing in a stylesheet puts a class on an element.
The other four take all three shipped CSS layers, Plex and `js/`, because they
measure what is rendered — `check-behaviour` included, since it reads element
rectangles and menu height and CSS can move both. `sink/harness.css` is declared
for those four against `kitchen-sink.html` alone, which closes finding 14: it
positions the sink's specimens, is loaded by no other page, and had never been
named by any browser gate.

**Measured one file at a time, from a clean clone.** A change to `css/rux.css`,
`css/rux-theme.css`, `css/rux-overrides.css` or Plex ages 27 cells and none of
`check-runtime-classes`'; a change to `js/` ages all 38; `sink/harness.css` ages
4, every one of them `kitchen-sink.html` and no template; the Carbon spacing
capture ages `check-spacing` alone. Before this, the first four aged everything
or nothing and the harness aged nothing at all.

**A THIRD PARSER FAULT IN THE TOKEN SNAPSHOT, found in review.** Whitespace was
collapsed across the whole value, so `"a  b"` was recorded as `"a b"` — a value
the stylesheet does not declare, and a real change from one to the other would
have compared equal. The gate whose entire job is noticing a moved value was
blind to that one. Collapsing now stops at a quote and resumes after it, escapes
included; outside quotes it still happens, which is what makes a reformatted
build produce no diff. The committed baseline was unaffected: 0 moved.

`check-tokens`'s `blindTo` is narrowed to match what is actually covered —
values DECLARED in `css/rux.css` and only those, not the cascade, not
`css/rux-theme.css` or `css/rux-overrides.css`, not what a browser computes.

**DONE 2026-09-02 — Phase 8's token snapshot, the declaration half (§4.8).**
`check-token-values` is the only gate here that is not name-based. It records
every `--rux-*` value `css/rux.css` declares — 2,756 declarations across 231
contexts — keyed by the context, because `--rux-grid-columns` is legitimately
4, 8 and 16 under three breakpoints and keying by name alone would collapse
them. **Proven on the day**: with `--rux-layer-01` edited from `#f4f4f4` to
`#ededed`, `check-tokens`, `check-classes`, `check-co-classes` and
`check-compound` all exit 0 and this exits 1. That is §4.8's claim made
concrete — a Carbon bump changes no name, so every other gate passes in silence.

**THREE FAULTS CAME OUT OF REVIEW, AND THE PARSER'S WAS THE ONE THAT MATTERED.**
A repeat was reported only when the value DIFFERED, and the snapshot held one
value per context and name — so a declaration ADDED as a duplicate of an
existing one left the file byte-identical and the gate that claims to catch
added declarations would have passed it. Every value is now kept, a repeat as an
array, and the injected case is caught. The same pass found an unquoted data URL
truncated to `url(data:image/svg+xml` because a `;` inside `url()` was read as a
terminator; parenthesis depth is tracked now. And the diff was capped at 40
lines while the failure message asked the reader to confirm every line: a list
that looks complete and is not, so the cap is gone.

**A REPEAT IS RECORDED, NOT FAILED, and the reason is the one rule.** Failing on
one was the review's instruction. `css/rux.css` declares 15 tokens twice, all in
`:root` with identical values, because Carbon emits two separate `:root` blocks
— line 1914 for the contextual layer tokens, line 31372 for the white theme.
Removing one means editing a Carbon file, which never happens here, so that gate
could never pass and would be switched off instead.

**IT IS THE DECLARATION HALF ONLY.** §4.8 promised a dump of *computed* values;
211 of these carry `var(...)` and 40 carry `calc()`, `min()`, `max()` or
`clamp()`. A `var()` chain is caught transitively, a context-resolving function
is not, and neither is anything that moves only through the cascade. The
computed snapshot stays open in §4.8 rather than being quietly retired. All four
artifacts are in `CONTROL_FILES`: the baseline is an expected result, the
builder defines what "unchanged" means, and the parser is read by both.

**SUPERSEDED THE SAME DAY. Finding 11 is NOT closed** — the first version of
this entry said it was, which was the drafting run marking its own homework. The
entry below split one `inputs` list by asking whether an entry contained a page
the gate sweeps. It measured well — one line in the kitchen sink aged all 38
cells before, 8 after — but it inferred the semantics from directory
containment, so a future gate whose shared directory input happened to hold a
swept page would have lost that input for every other cell, silently: the same
under-ageing finding 11 is about, moved somewhere new. A check for it was
proposed and does not work, because it cannot see a misclassification while any
other shared input survives and would reject a legitimately page-only gate.

**What replaced it is declared, not inferred.** A browser gate carries
`sharedInputs`, the shared half only, and `cellStates()` adds the cell's own
page: `[...gate.sharedInputs, page]`. Node gates keep `inputs` unchanged, which
cost nothing — `staleness.mjs` is the only reader of that field in the
repository. A browser gate with no `sharedInputs` throws rather than defaulting
to `[]`, because an empty list is a real answer meaning nothing is shared, and
substituting it would age a cell by its page alone and never by `css/rux.css`.

Measured from a clean clone, one change at a time: `portal.html` ages 3 cells;
`kitchen-sink.html` ages its own 5 and no template; one template ages only its
own 3; `css/rux.css` and `js/` each age all 38; the spacing capture ages
`check-spacing` alone. `npm run verify` exits 0 and today's reading is
unchanged at 35 current, 3 stale.

**What review is still for.** `sharedInputs` is a claim a person makes and no
check tests. Drop the spacing capture from `check-spacing` and twelve readings
quietly stop ageing against the file they compare with; the throw catches a
missing list, not an incomplete one.

**AND REVIEW IMMEDIATELY FOUND TWO, which is the argument for the rule.** The
guard against a missing `sharedInputs` was placed after the `NEVER RUN` return.
A newly registered gate has no ledger entry, so it is NEVER RUN, so the one case
the guard exists for would have returned before reaching it — a check that could
only fire where it was not needed. It is now validated before the ledger is read.
And the declared list was incomplete: every swept page links
`assets/fonts/plex.css`, a font moves spacing, focus-ring geometry and the size
half of a contrast reading, and it was in no browser gate's inputs. Added.

**Two more stylesheets belong in that list and could not be added.**
`css/rux-theme.css` and `css/rux-overrides.css` are linked by eleven of the
twelve swept pages; `portal.html` links neither, against AGENTS.md's rule that
every page links both after `css/rux.css`. Declaring them shared would claim of
all cells what is false of one, so finding 11 stays open on finding 13. Finding
14 records a third: `sink/harness.css` is the sink's alone, no browser gate has
ever named it, and `sharedInputs` plus a page has no room to express it.

**FIX DRAFTED 2026-09-02 — browser-cell staleness now includes the page.** The
three `portal.html` readings remained current after four commits changed their
page because the registry's shared gate inputs named the sink and templates but
not the portal. Adding the portal to those shared inputs would also age ten
unrelated template readings. `cellStates()` instead adds a cell's page only when
no existing file or directory input covers it, and uses that same effective set
for committed movement and dirty files. The dry run reads 35 current and three
stale, exactly the portal cells. This is a Tier 2 control change: its result does
not approve the Phase 7 work it exposed, and the portal sweep remains owed for
an independent run.

**IMPLEMENTED 2026-09-02; BROWSER SWEEP OWED — Phase 7's component index
(§4.7).** `portal.html` gained a
Reference column from `docs/component-docs.json`: 37 components with a page of
their own in IBM's nav, 23 documented on another component's page, 15 with no
page and a captured specimen instead, 2 with neither. 77 accounted for; **all
135 distinct URLs returned 200** that day. The slugs come from
`carbon-website/src/data/nav-items.yaml` and the output is committed, because
the quarry is gitignored and no gate reads it — a generator that needed it would
fail on most clones, which is why `docs/carbon-*.json` are committed too.

**The nav is the authority, not the directory listing.** `overflow-menu` still
has a page directory IBM stopped linking, so a link there goes into whatever
redirect replaced it; it gets a specimen and the entry records why. Two faults
were caught by reading the first output rather than trusting it: a state
capture's key is `<story>@<state>`, this repository's own recipe suffix and not
a Storybook id, so the first overflow-menu link would have 404ed; and the
nav-dropped case was indistinguishable from a component with no page at all.

**Aliases are authored, not inferred.** Each carries how often the humanised
name occurs in each page's own mdx, which is evidence and not proof: "card"
occurs 34 times on the menu-buttons page and means the noun.

`tools/build-portal.mjs` is a control file, so the rendering half was drafted as
a diff and proposed before it was applied, with what it weakens stated: the
generator gains an input nothing validates, and the links are attested once and
then rot silently. **The gate that would close both is proposed and not built** —
a control must not be authored in the run it would judge.

**DONE 2026-09-02 — creator 2, the skill's composition flow (§4.12 item 2).**
`rux-ds-page` §2 is a decision table of eight rows — shape, theme, header nav,
global actions and switcher, field style, button kinds, button size, body
blocks — each answer drawn from `docs/choices.md` and nowhere else, on the rule
that an option it does not list is a request to that file before it is a harder
version of the job. Five things are named as NOT choices, because offering them
is the error: the side nav variant, the header's `g100`, the mark, button states,
and fluid for the controls that have no fluid form. The boundary with
`tools/new-project.sh` is now written on both sides — the script had always said
composition was the skill's, and the skill had never said what composition was.

**Writing it found two stale claims in the skill itself**, both of the kind a
reader would have believed. §1 said ten templates and listed nine, omitting
`schedule-page`. §2 said "**34 of 75**" and named `date-picker`, `combo-box` and
`toggletip` as deferred — all three admitted on 2026-08-31 and 2026-09-01, so the
skill was steering work away from components that had been compiled for days. The
count is deleted rather than corrected: the rulebook puts counts in `npm run
gates` and `portal.html`, and this is what a count in prose does. `npm run verify`
exits 0; 38 sweep cells current.

**ANSWERED 2026-09-02 — the hub is named Rux Apps.** It was one of two decisions
left open when the hub was committed. `portal.html` here is the gate dashboard, so
"Rux Portal" named two different things across two repositories. The entries are
"apps" throughout, the word `switcher.json` already used for its array and the
switcher panel for its label; the hub's own entry is "Home". Rejected: "Rux Home",
"Rux Suite", "Rux Index", "Rux Atrium", and a bare "Rux" with no second word.
Applied in `rux-sm.github.io` at `a9995bb`, `tools/check.mjs` passing — classes
resolve, apps 2, pin v0.1.1 — and the switcher panel opened in a browser showing
Home and Notes from `switcher.json`.

**AND THE REPOSITORY NAME IS NOT THE HUB'S NAME.** `rux-sm/rux-apps` was created
on 2026-09-02 and is wrong: only `<account>.github.io` serves at the account root,
and every module's shell fetches `/switcher.json` and links `/switcher.js` by
absolute path. Under `/rux-apps/` both 404 and `switcher.js` catches, so each page
keeps the entries it shipped and the shared list is gone with nothing failing.
Nothing was pushed to it.

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

---

## Gates — the record

Moved out of `README.md` "Gates" on 2026-09-02, verbatim, for the same reason as
the block above: the table of what each gate catches stays in README, and what each
was written after, what its first run found and what was adjudicated is the record.
Every count here is what a gate printed on the date named.

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

### Known gap — closed by the strip

`.rux--truncated-text__expand-toggle` had no button reset in Carbon's light-DOM CSS and
rendered with browser default chrome; it was shown unfixed and labelled, because fixing
it meant editing a Carbon file (roadmap §4.1.5). `truncated-text` is CUT in Phase 3, so
`check-rendered` now reports no default chrome anywhere. The gap returns with the
component if it is ever restored, and its fragment still says so.
