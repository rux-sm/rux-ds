//
// THE GATE REGISTRY — what each gate checks, where it can run, and what a
// result depends on.
//
// WHY THIS FILE EXISTS. On 2026-08-29 the repo could not answer "has this gate
// ever been run against this target". It cost nine instances of one bug:
// `check-a11y.js` already carried the rule that catches a focusable control
// inside an `aria-hidden` subtree, and it fired the first time anyone ran it on
// a page in that state — but it had only ever been run on the sink and on one
// consumer page, never on `templates/`. The instrument worked. Nothing recorded
// that it had not been pointed anywhere.
//
// So the defect this registry addresses is not a missing check. It is that
// A GATE NEVER RUN AGAINST A TARGET IS INDISTINGUISHABLE FROM ONE THAT PASSED.
//
// AND ALMOST NOTHING WAS BLOCKING THE SWEEP. Twelve of the thirteen tools run
// against a template today, unchanged: all nine Node gates already read
// `templates/`, `check-runtime-classes` reads `location.pathname`,
// `check-spacing` uses a root-absolute reference, and `check-a11y` survives on
// its `|| document.body` fallback. Only `check-rendered` cannot, and the entry
// below says why patching it would be worse than leaving it.
//
// GATE IS NOT THE SAME WORD AS TOOL, and four documents disagreed because of
// it: `build.mjs` and `build-portal.mjs` each carry a gate with a row in
// README's table and no check-* file of its own. THIS HEADER STATES NO
// COUNTS. It read 14 gates, 10 in verify, 4 in a browser against a registry
// below of 21, 16 and 5 — docs/agent-tooling.md cites that very drift as its
// opening example. `npm run gates` prints the numbers from the registry.
//
// TWO KINDS OF FIGURE, and only one of them may ever be auto-verified.
// Counts derivable from the repo — gate membership, KNOWN entries, the coverage
// ratio — can be re-read on any run. Measurements taken in a browser at a point
// in time — "0 findings, 6 notes", "2.76:1" — cannot be derived from source at
// all. Those live in the ledger with a date and go stale like anything else.
// `baseline` below is the second kind: a record, never an assertion.
//
// INVENT NOTHING HERE. Every field is copied from a source: `catches` and
// `blindTo` from README's gate table, `blindSpots` and `sideEffects` from each
// tool's own header, `redRun` from .claude/skills/sink-check/SKILL.md. Where a
// tool states nothing, the value is `null` — which is a finding about the tool,
// not a blank to fill in with a guess.
//
import { ROOTS, markupFiles, pageFiles } from './sources.mjs';

// The pages a BROWSER gate runs against. Not the same set as the FILES a Node
// gate reads: `sources.mjs` enumerates `sink/*.html` fragments, and no browser
// ever loads a fragment — it loads the assembled sink, or one template. Keeping
// these apart stops the registry claiming a shared target that does not exist.
//
// EVERY ROOT PAGE IS A TARGET, DISCOVERED RATHER THAN LISTED. This function
// carried the literal ['kitchen-sink.html', 'portal.html', ...templates] until
// 2026-08-31, which is precisely the defect `sources.mjs` was written to end --
// its own comment says a check never run against a target is indistinguishable
// from a check that passed, and four NODE gates had already been fixed for it.
// The browser half was missed, so a consumer page at the root -- the artefact
// Phase 6 exists to make possible -- could never become a sweep cell, and
// `npm run gates` would report a full green matrix without ever having named it.
// Found by §4.6's eighth exit attempt, which ran all five browser gates on its
// own page BY HAND and observed that nothing would have complained if it had not.
export function pageTargets() {
  return [...pageFiles().filter(p => p.endsWith('.html')),
    ...markupFiles(['templates']).map(f => f.path)];
}

// Every browser result depends on more than the page it was read from: the
// stylesheet decides what renders and the modules decide what the markup
// becomes. A change to either invalidates a reading taken before it — which is
// the case that motivated the staleness rule, since editing js/menu.js on
// 2026-08-29 silently invalidated every template's a11y result.
// SHARED INPUTS ARE DECLARED, NOT INFERRED. A browser gate's cells each sweep
// one page, so what can invalidate a reading is that page plus whatever every
// cell of the gate shares. Only the shared half is listed here: `sharedInputs`
// is exactly that, and tools/lib/staleness.mjs adds the cell's own page.
//
// AUDIT FINDING 11, both directions, is what this replaces. The list used to be
// `inputs` and mixed the two: it named kitchen-sink.html and templates/, which
// between them ARE eleven of check-a11y's twelve cells. Read as one list a page
// input ages cells it cannot reach -- one line in the kitchen sink aged all 38
// cells, ten template sweeps owed for a change no template can see -- while
// portal.html, named by no gate, could not age its own readings at all.
//
// Splitting them by asking whether an entry happens to contain a swept page was
// drafted and rejected: it infers the semantics from directory containment, so
// a future gate whose shared directory input happened to hold a swept page
// would lose that input for every other cell, silently, which is the same
// under-ageing again. Declaring the shared half is the whole fix. Node gates
// keep `inputs`, unchanged: they read their whole target set on every run and
// have no cells.
// WHAT EVERY SWEPT PAGE ACTUALLY LOADS, which is not the same as what the build
// produces. Each of the twelve pages links assets/fonts/plex.css, and a font
// changes metrics: it moves spacing readings, focus-ring geometry and the size
// half of a contrast reading. It was missing from this list until 2026-09-02.
//
// css/rux-theme.css AND css/rux-overrides.css ARE NOT HERE, AND NOT BECAUSE OF
// THE PAGES ANY MORE. All twelve link them as of 2026-09-02, finding 13 having
// fixed portal.html, which linked neither. They are absent now because THIS
// LIST IS SHARED BY GATES THAT DO NOT READ THE SAME THING. A stylesheet moves
// what is rendered -- spacing, focus-ring geometry, the size half of a contrast
// reading -- but check-runtime-classes reads the DOM's CLASS SETS, and no
// change to a stylesheet puts a class on an element. Declaring them here would
// age twelve readings that cannot move, which is finding 11's first half
// arriving by a new route. They go in per-gate lists, and that refinement is
// what finding 11 closes on.
//
// sink/harness.css is loaded by kitchen-sink.html ALONE, so it is not shared
// and this list cannot express it. `sharedInputs` plus the cell's page has no
// room for a per-page extra, and the sink's four readings do not age against
// the stylesheet that positions their specimens. Pre-existing: no browser gate
// ever named it. Audit finding 14.
const RENDERED_INPUTS = ['css/rux.css', 'js', 'assets/fonts/plex.css'];

export const GATES = [
  {
    id: 'build-namespace',
    tool: 'tools/build.mjs',
    kind: 'node',
    inVerify: true,
    catches: '`cds` leakage into output',
    blindTo: 'anything visual',
    reads: 'the built stylesheet',
    fileTargets: ['src/app.scss'],
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: ['src/app.scss'],
    redRun: null,
    sideEffects: 'writes css/rux.css and css/rux.min.css',
    baseline: 'cds leakage: none',
  },
  {
    // REGISTERED 2026-08-31 (roadmap 4.8). It was real, ran in npm run verify, and
    // sat outside the registry for three re-numberings of its own open question --
    // fifteenth, then eighteenth, then nineteenth. Same shape as build-namespace
    // above: a gate carried by a build tool with no check-* file of its own.
    // It caught #i-katex on its first run, a glyph nothing defines, which is the
    // silent-blank-icon failure check-icons exists for.
    id: 'build-portal-icons',
    tool: 'tools/build-portal.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a `#i-name` emitted into portal.html that the committed sprite has no `<symbol>` for',
    blindTo: 'every page it does not generate — its unit is portal.html alone',
    reads: 'the emitted portal markup against assets/icons.svg',
    fileTargets: ['tools/build-portal.mjs'],
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: ['assets/icons.svg', 'docs/inventory.json', 'docs/coverage.json'],
    redRun: '#i-katex on its first run — a symbol name nothing defines',
    sideEffects: 'writes portal.html',
    baseline: '0 unresolved sprite references',
  },
  {
    id: 'check-classes',
    tool: 'tools/check-classes.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a class used in HTML or `js/` with no CSS behind it · a class whose component was stripped',
    blindTo: 'a class that resolves but renders wrong',
    reads: 'assembled',
    fileTargets: ['kitchen-sink.html', 'portal.html', 'templates', 'js', 'css/rux-theme.css', 'css/rux-overrides.css'],
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: ['css/rux.css', 'kitchen-sink.html', 'portal.html', 'templates', 'js'],
    redRun: 'add a `rux--nonesuch` class to any fragment',
    sideEffects: null,
    baseline: 'undefined 0 · stripped 0',
  },
  {
    id: 'check-tokens',
    tool: 'tools/check-tokens.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a `var(--rux-*)` that resolves to nothing',
    blindTo: 'a token whose *value* moved (roadmap §4.8)',
    reads: 'assembled',
    fileTargets: ['css/rux.css', 'sink/harness.css', 'css/rux-theme.css', 'css/rux-overrides.css', 'kitchen-sink.html', 'portal.html', 'templates'],
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: ['css/rux.css', 'sink/harness.css', 'kitchen-sink.html', 'portal.html', 'templates'],
    // Proven on 2026-08-29: a placeholder token name written inside a CSS
    // COMMENT in harness.css failed the build as unresolved. The gate parses
    // the file; it does not know what a comment is.
    redRun: 'name a token that does not exist anywhere in sink/harness.css',
    sideEffects: null,
    baseline: 'unresolved 0 · 4 known-unset, each with a reason',
  },
  {
    id: 'check-icons',
    tool: 'tools/check-icons.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a `<use>` pointing at a symbol the sprite does not carry · a fragment referencing the sprite externally or a template referencing it bare · a sprite out of step with `icons.mjs`',
    blindTo: 'which glyph a `<use>` points at — half of that is now check-glyphs, '
      + 'the other half (is this the right glyph for this SLOT) is still nobody\'s',
    reads: 'per-file',
    fileTargets: ROOTS,
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: [...ROOTS, 'assets/icons.svg', 'tools/icons.mjs'],
    redRun: 'point a `<use>` at `#i-nonesuch`',
    sideEffects: null,
    baseline: '0 faults · 59 symbols · 30 used · 29 referenced by nothing — CUT, DEFERRED or undemoed',
  },
  {
    id: 'check-glyphs',
    tool: 'tools/check-glyphs.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a sprite symbol that does not DRAW the glyph its name claims — a '
      + 'hand-edited path, a rename without the drawing following, a glyph pasted '
      + 'from the wrong size, an optimiser that moved a coordinate · a symbol name '
      + '@carbon/icons has no file for',
    // STATED PLAINLY BECAUSE A GREEN RUN HERE IS EASY TO OVER-READ. This gate
    // would have caught NONE of the three icon defects this project shipped: two
    // chevrons rotated from the wrong base glyph and the 2026-08-29 sort arrow
    // were all correct symbols referenced from the wrong SLOT. It guards the
    // other half of the same family, and it is the half that makes the first
    // half checkable — asking "does Carbon put arrow--up in this slot" only
    // means something once `#i-arrow--up` is known to draw arrow--up.
    blindTo: 'WHICH slot a glyph belongs in, which is the half that has actually '
      + 'shipped defects · anything about a glyph nothing in the sprite claims',
    reads: 'per-file',
    fileTargets: ['assets/icons.svg'],
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: ['assets/icons.svg', 'docs/carbon-glyphs.json'],
    redRun: 'move one coordinate in any symbol\'s path, or swap two symbols\' '
      + 'drawings, or add a symbol under an invented name — all three verified '
      + '2026-08-29, exit 1 each',
    sideEffects: null,
    baseline: '59 symbols checked · 0 drawing a different glyph · 0 outside the snapshot',
  },
  {
    id: 'check-slots',
    tool: 'tools/check-slots.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'the WRONG GLYPH in a slot — the half of the icon question every one '
      + 'of this project\'s four shipped icon defects was, and which check-icons and '
      + 'check-glyphs both pass',
    // THE BAR IS WHY THIS IS HONEST AND ALSO WHY IT IS NARROW. A slot is only
    // enforced where Carbon drew one glyph in 3+ distinct stories. That excludes
    // the `__invalid-icon` family, which Carbon renders once or twice in the
    // default stories — so the seven-site invalid-icon defect fixed on
    // 2026-08-29 was found by READING docs/carbon-slots.json, not by this gate,
    // and reverting it does NOT turn this red. `states` recipes for the invalid
    // and warning states would raise those slots over the bar; until then the
    // reference is worth more than the check.
    blindTo: '4 slots have no Carbon capture that can answer and are reported '
      + 'UNCOVERED rather than passed · 25 more are captured and recorded but under '
      + 'the corroboration bar, each resting on a single story · a slot Carbon fills '
      + 'from a prop, where there is no right answer · size, position and visibility',
    reads: 'per-file',
    fileTargets: ROOTS,
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: [...ROOTS, 'docs/carbon-slots.json'],
    redRun: 'point `table-sort__icon` at `#i-arrow--down` (4 findings), '
      + '`accordion__arrow` at `#i-chevron--down` (3), or revert the invalid-icon '
      + 'fix to `#i-error--filled` (7) — all verified 2026-08-29. That last one did '
      + 'NOT fire before ICON_STATES and the sibling rule, which is why both exist.',
    sideEffects: null,
    baseline: '33 enforced slots · 104 icon sites checked · 0 wrong glyph · 4 uncovered · 25 under the bar',
  },
  {
    id: 'check-co-classes',
    tool: 'tools/check-co-classes.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a modifier used without the base class that styles it',
    blindTo: 'a base class Carbon never pairs',
    reads: 'assembled',
    fileTargets: ['kitchen-sink.html', 'portal.html', 'templates'],
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: ['kitchen-sink.html', 'portal.html', 'templates', 'docs/carbon-co-classes.json'],
    redRun: 'use a modifier without its base class in any fragment',
    // Recorded as a gap, not a style note: a finding on a template cannot be
    // located, because the violation block prints the class attribute and no path.
    sideEffects: null,
    baseline: '10 required rules · 28 ignored as sample artifacts · 0 violations',
    knownGap: 'prints no file path with a violation (check-co-classes.mjs:39-41)',
  },
  {
    id: 'check-compound',
    tool: 'tools/check-compound.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'two classes Carbon compounds, split across elements',
    blindTo: 'wrong nesting order · missing wrapper',
    reads: 'per-file',
    fileTargets: ROOTS,
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: [...ROOTS, 'css/rux.css'],
    redRun: 'split a compounded pair across a parent and child',
    sideEffects: null,
    baseline: '0 findings',
  },
  {
    id: 'check-tags',
    tool: 'tools/check-tags.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a class on a different element type than Carbon renders it on',
    blindTo: 'classes no story emits (81 today)',
    reads: 'per-file',
    fileTargets: ROOTS,
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: [...ROOTS, 'docs/carbon-react-dom.json', 'docs/carbon-ibm-products-dom.json',
      'docs/carbon-react-states.json', 'docs/carbon-ibm-products-states.json'],
    redRun: 'move a class onto an element type no story renders it on',
    sideEffects: null,
    baseline: '10 known divergences · 81 classes with no reference · 0 on a different element',
  },
  {
    id: 'check-ancestry',
    tool: 'tools/check-ancestry.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a wrapper Carbon renders in **every** capture, absent here',
    blindTo: 'a wrapper Carbon only sometimes renders',
    reads: 'per-file',
    fileTargets: ROOTS,
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: [...ROOTS, 'docs/carbon-react-dom.json', 'docs/carbon-ibm-products-dom.json',
      'docs/carbon-react-states.json', 'docs/carbon-ibm-products-states.json'],
    redRun: 'delete a required wrapper — modal-close-button is the one it was written for',
    sideEffects: null,
    // KNOWN is keyed `fragment:class`, so a template entry is separate from the
    // sink's. That is why byte-identical markup copied into a new file can fail:
    // the adjudication does not travel with it.
    baseline: '84 declines, each with a reason · 0 missing · 550 classes corroborated',
  },
  {
    id: 'check-coverage',
    tool: 'tools/check-coverage.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a component exercising fewer classes than `docs/coverage.json` records',
    blindTo: 'standing still — it ratchets, it does not set a floor',
    reads: 'assembled',
    fileTargets: ['kitchen-sink.html', 'portal.html', 'templates'],
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: ['kitchen-sink.html', 'portal.html', 'templates', 'css/rux.css',
      'docs/inventory.json', 'docs/coverage.json'],
    redRun: 'remove a class from a fragment so its component drops below the recorded figure',
    sideEffects: null,
    baseline: '501 / 735 (68%) across 32 components',
    // It pools every file into one `used` set and scores per COMPONENT, so it
    // cannot answer "how much does templates/table-page.html exercise". That is
    // a data-model limit, not a missing flag.
    knownGap: 'no per-file axis; reads templates but cannot report on one',
  },
  {
    id: 'check-inventory',
    tool: 'tools/check-inventory.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a component Carbon ships that docs/inventory.md has no row for · a row carrying no disposition · a row Carbon no longer ships · a component src/app.scss does not list at all · a disposition the manifest contradicts · a docs/inventory.json compiled from a Carbon that is not the one installed',
    blindTo: 'whether a disposition is RIGHT — it insists one was made, not that it was wise',
    reads: 'the manifest, the inventory and Carbon\'s own component directory',
    fileTargets: ['src/app.scss', 'docs/inventory.md'],
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: ['src/app.scss', 'docs/inventory.md', 'docs/inventory.json', 'node_modules/@carbon/styles'],
    redRun: 'change any row\'s disposition to UNDECIDED, or comment out a KEEP component\'s @use, or set the `carbon` field in docs/inventory.json to another version — the stale fault, verified 2026-09-02 on the unstamped file',
    sideEffects: null,
    baseline: '83 carbon · 83 rows · 77 KEEP · 2 DEFER · 4 CUT · 83 listed · 77 compiling',
    // A RENAME arrives as one phantom and one unrowed with nothing tying them
    // together. Both are findings, so nothing is missed; the gate just cannot
    // say they are the same component under a new name.
    knownGap: 'cannot recognise a rename as a rename',
  },
  {
    // THE TWENTIETH, admitted 2026-08-31 (roadmap 4.8) -- the first gate whose
    // unit is the FILE rather than an occurrence. table-page.html shipped with
    // no h1-h6 at all and passed all seventeen gates that existed; a person
    // walking the tab order found it. Its first run found the label/value
    // heading defect a THIRD and FOURTH time, in wizard-page.html and in the
    // portal generator.
    id: 'check-headings',
    tool: 'tools/check-headings.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a page with no heading at all · more than one `h1` · an outline that skips a level',
    blindTo: 'whether a heading says anything useful · heading ORDER against visual order · a heading that is visually a heading and marked up as a div',
    reads: 'every page — templates/ and the generated root pages, comments stripped',
    fileTargets: ['templates', 'kitchen-sink.html', 'portal.html'],
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: ['templates', 'sink'],
    redRun: 'wizard-page h1->h3 and portal h1->h3 / h2->h4, on its first run',
    sideEffects: null,
    baseline: '11 pages · 0 findings',
  },
  {
    // THE TWENTY-FIRST, admitted 2026-08-31 (roadmap 4.8), and the first thing
    // here that reads the captures' ATTRIBUTE data -- recorded as [role=x]{aria-y}
    // since the first harvest and never looked at. Written for the role="menu"
    // on the side nav's ul (643a20e), which every class gate was blind to by
    // construction and check-a11y was blind to by its own rule.
    // Its bound is real and named in the file: aria-live is not one of the
    // thirteen attributes the extractor records, so anything turning on a live
    // region is out of reach -- which is the whole of the `loading` decline.
    id: 'check-aria-roles',
    tool: 'tools/check-aria-roles.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a `role` on a `rux--` class that Carbon never renders that role on',
    blindTo: 'a role on an unclassed element · a MISSING role · whether required child roles are present · anything turning on `aria-live`, which the extractor does not record',
    reads: 'sink/, templates/ and the root pages against every capture',
    fileTargets: ['sink', 'templates', 'kitchen-sink.html', 'portal.html'],
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: ['sink', 'templates', 'docs/carbon-react-dom.json'],
    redRun: 'role="menu" on side-nav__items reproduces as 1 invented; 332 corroborated when clean',
    sideEffects: null,
    baseline: '332 corroborated · 4 declined · 0 uncovered · 0 invented',
  },
  {
    id: 'check-provenance',
    tool: 'tools/check-provenance.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a fragment that does not say where its markup came from · a template that does not say what its BEHAVIOUR was verified against, with a URL and a date',
    blindTo: 'whether either label is true',
    reads: 'per-file',
    fileTargets: ROOTS,
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: ROOTS,
    redRun: 'strip a PROVENANCE comment from any fragment',
    sideEffects: null,
    baseline: '39 files labelled · 33 rendered-dom · 6 source · 0 inferred · 10 templates verified-live · 14 modules · 14 verified-live',
  },

  // ── browser-only ────────────────────────────────────────────────────────
  // None of these can be run by a Node runner. package.json has three
  // devDependencies and no headless browser, and check-rendered.js:2 refuses
  // one on principle. The runner reports which apply and records what an
  // operator brings back; it cannot execute them.

  {
    id: 'check-rendered',
    tool: 'tools/check-rendered.js',
    kind: 'browser',
    inVerify: false,
    catches: 'default browser chrome · collapsed · escaped elements',
    blindTo: 'anything it has no rule for · a section it has nothing to measure in',
    reads: 'page',
    fileTargets: [],
    pageTargets: ['kitchen-sink.html'],
    // THE ONLY GATE THAT CANNOT SEE A TEMPLATE, and the reason is its unit of
    // measurement rather than its selector. Every rule is per `.ks-sec`:
    // `collapsed` is "this section's tallest rux-- element is under 8px",
    // `escaped` reports a section id, `nothingToMeasure` is a section with no
    // classed elements. A template is one page, not a gallery of labelled
    // specimens. A `|| document.body` fallback would make it report
    // `sections: 0` and three empty arrays — A PASS IT DID NOT EARN, which is
    // the exact failure this registry exists to end. Today it throws instead
    // (line 40 dereferences querySelector(MAIN) unguarded), and throwing is the
    // better of the two behaviours. Re-deriving the unit per landmark region is
    // a redesign and a separate decision.
    canRun: { sink: true, templates: false },
    cannotRunReason: 'its unit is the .ks-sec section; a template has none, and a fallback would report a pass it did not earn',
    sharedInputs: [...RENDERED_INPUTS],
    redRun: 'flatten a section: #tags [class*="rux--"] { height:1px; min-height:0; padding:0 }',
    // Both bite an operator. The theme reset is not a restore: it writes
    // 'white' whatever the page was on before.
    sideEffects: 'writes documentElement.dataset.theme twice and resets to "white" regardless of the prior value',
    baseline: 'uaStyled 0 · collapsed none · escaped none · nothingToMeasure ["spacing"]',
  },
  {
    id: 'check-runtime-classes',
    tool: 'tools/check-runtime-classes.js',
    kind: 'browser',
    inVerify: false,
    catches: 'a class in the markup that no longer exists once the modules have run — what `check-coverage` counts and nobody sees',
    blindTo: 'anything behind an interaction (it is load-time only), and — found by '
      + 'its own red run on 2026-08-29 — PARTIAL stripping. It compares SETS of class '
      + 'names, so removing one of six elements carrying a class changes nothing it '
      + 'reports; only a class that leaves the page entirely is caught. The red run '
      + 'has to use a class that occurs exactly once, or it comes back green.',
    reads: 'page',
    fileTargets: [],
    pageTargets: pageTargets(),
    canRun: { sink: true, templates: true },
    sharedInputs: [...RENDERED_INPUTS],
    redRun: 'remove a class from the live DOM by hand; it reports that class stripped',
    // Condition 5 of the sink-check skill, and it conflicts with condition 1:
    // the click check-a11y needs for document.hasFocus() is the kind of press
    // the overlay kernel acts on. Run this FIRST, on an untouched page.
    sideEffects: null,
    baseline: 'kitchen-sink 0 stripped / 3 added · app-shell 0/0 · table-page 0/1 · form-page 0/0',
  },
  {
    id: 'check-spacing',
    tool: 'tools/check-spacing.js',
    kind: 'browser',
    inVerify: false,
    catches: 'a box property that disagrees with what Carbon computes for the same class set, read from `docs/carbon-react-spacing.json`',
    blindTo: 'whether the value is RIGHT — only whether it matches Carbon; a class set neither side renders',
    reads: 'page',
    fileTargets: [],
    pageTargets: pageTargets(),
    canRun: { sink: true, templates: true },
    sharedInputs: ['docs/carbon-react-spacing.json', ...RENDERED_INPUTS],
    redRun: 'change a padding on any compiled class and re-run',
    sideEffects: null,
    // READ THE noReference LIST. Pagination's real defect sat in that bucket
    // reading as "unmeasured" — the tool's own header says a set Carbon never
    // emits may be one we invented.
    baseline: 'kitchen-sink at 1440: checked 276 · matched 259 · diverges 17 · noReference 142',
    status: 'self-declassified to a diagnostic a person reads, not a verify gate (check-spacing.js:88)',
  },
  {
    id: 'check-behaviour',
    tool: 'tools/check-behaviour.js',
    kind: 'browser',
    inVerify: false,
    catches: 'a behaviour module that stops doing what its own header claims — the state a click produces, which every other gate is blind to',
    blindTo: 'anything landing in a microtask: focus destination, focus restoration, and the order two surfaces close in',
    reads: 'page',
    // The sink only. It drives real components, so it needs one of everything —
    // a selectable table, an overflow menu, tabs, an accordion, a modal, a
    // dismissible notification, a toggle and a dropdown. No template carries
    // that set, and five of the modules bind to nothing in any template.
    fileTargets: [],
    pageTargets: ['kitchen-sink.html'],
    canRun: { sink: true, templates: false },
    cannotRunReason: 'it drives every module, and no template carries the components to drive — five modules bind to nothing there at all',
    sharedInputs: [...RENDERED_INPUTS],
    redRun: 'revert the offset write in js/menu.js and the tabindex pairing in js/data-table.js — expect 3 failures naming an 8px overlap and tabindex [0,0,0] on a hidden bar',
    // Every case restores what it touched, so it is safe to run twice and safe
    // beside the other browser gates. It still runs AFTER check-runtime-classes,
    // which needs a page nobody has touched.
    sideEffects: 'clicks through every component and restores each; leaves the page as it found it',
    baseline: '18 of 18 cases passing on the sink',
  },
  {
    id: 'check-a11y',
    tool: 'tools/check-a11y.js',
    kind: 'browser',
    inVerify: false,
    catches: 'dangling idrefs · composites with many tab stops · unnamed controls · roles missing required state · focusable inside aria-hidden',
    blindTo: 'what a screen reader announces · focus-ring contrast · whether the tab order makes sense',
    reads: 'page',
    fileTargets: [],
    pageTargets: pageTargets(),
    canRun: { sink: true, templates: true },
    sharedInputs: [...RENDERED_INPUTS],
    redRun: '.rux--checkbox:focus + .rux--checkbox-label::before { outline: none !important } — expect 12 findings',
    sideEffects: 'moves focus and restores it; injects and removes a transition:none style',
    baseline: 'kitchen-sink 0 findings · 6 notes · focusRingChecked true',
    // Refuses its focus-ring check when document.hasFocus() is false, and says
    // so in the result. A 0 with focusRingChecked:false is not a pass.
    precondition: 'document.hasFocus() must be true or the focus-ring half does not run',
  },
];

export const byId = id => GATES.find(g => g.id === id) ?? null;
export const inVerify = () => GATES.filter(g => g.inVerify);
export const browserGates = () => GATES.filter(g => g.kind === 'browser');

// THE CONTROLS — the files that decide whether anything else passes.
//
// WHY A LIST AND NOT A GATE. Nothing here can be enforced by this repository
// against itself: CI runs the gates from the same commit that changed them, so
// a weakened gate certifies itself and the run is green. The reference
// architecture's answer is a digest-verified baseline held outside the
// workspace, which is shared platform work and is deliberately NOT built here
// (`adoption-audit.md`, "what not to adopt"). With one maintainer there is also
// no independent reviewer to route an approval to.
//
// So this list buys VISIBILITY, not approval. `tools/check-controls.mjs` reads
// it, and CI prints a warning naming any control a push touched. That is the
// whole of the mechanism, it blocks nothing, and it is worth having only
// because a control changed by accident and a control changed on purpose look
// identical in a diff summary.
//
// THE CATEGORIES GOVERN, NOT THE LIST. A file is not ordinary work merely
// because this array forgot to name it. If something judges a change — a gate,
// the registry it sits in, a baseline it compares against, the CI that runs it,
// the hook that guards a commit, or the instruction file that establishes
// policy — then it is a control and an omission here is a bug to report.
export const CONTROL_FILES = [
  // The gates themselves, and the two build tools that carry one.
  'tools/check-a11y.js', 'tools/check-ancestry.mjs', 'tools/check-aria-roles.mjs',
  'tools/check-behaviour.js', 'tools/check-classes.mjs', 'tools/check-co-classes.mjs',
  'tools/check-compound.mjs', 'tools/check-coverage.mjs', 'tools/check-gates.mjs',
  'tools/check-glyphs.mjs', 'tools/check-headings.mjs', 'tools/check-icons.mjs',
  'tools/check-inventory.mjs', 'tools/check-provenance.mjs', 'tools/check-rendered.js',
  'tools/check-runtime-classes.js', 'tools/check-slots.mjs', 'tools/check-spacing.js',
  'tools/check-tags.mjs', 'tools/check-tokens.mjs',
  'tools/build.mjs', 'tools/build-portal.mjs',

  // The registry and the libraries every gate reads through.
  'tools/lib/gates.mjs', 'tools/lib/ownership.mjs', 'tools/lib/sources.mjs',
  'tools/lib/staleness.mjs', 'tools/check-controls.mjs',

  // The figure generators. tools/lib/stats.mjs answers for every number README
  // and portal.html publish, and build-readme.mjs writes one of the files CI
  // diffs for staleness -- so a change to either changes what that check is
  // comparing against, exactly as build-portal.mjs does.
  'tools/lib/stats.mjs', 'tools/build-readme.mjs',

  // The expected results. A gate is only as honest as the file it compares
  // against, and check-coverage's baseline is the one that had to be taught to
  // refuse a downgrade.
  'docs/coverage.json', 'docs/inventory.json', 'docs/gate-coverage.json',

  // THE CAPTURES ARE EXPECTED RESULTS TOO, and the sentence above always
  // covered them -- they were simply not listed. Seven gates decide pass or
  // fail by comparing this repository's markup against these files:
  // check-tags, check-ancestry and check-aria-roles read the four DOM and
  // state captures; check-spacing reads the spacing table; check-slots and
  // check-glyphs read the icon snapshots; check-co-classes and check-tokens
  // read the co-class table. Edit one and the gate that consults it agrees
  // with whatever it now says.
  //
  // ADDED 2026-08-31 AFTER A REAL EDIT WENT UNFLAGGED. Admitting date-picker
  // needed two `preview-preview-datepicker--*@open` entries in
  // carbon-react-states.json, because check-tags faulted `__day` on a <button>
  // against a reference that only had it on a <span>. The entries were taken
  // from the running story and match it line for line -- and that is exactly
  // the point: nothing about the edit looked different from an edit that
  // simply made a gate stop complaining, which is the move check-coverage's
  // baseline was just taught to refuse.
  //
  // These are NOT hand-maintained files. `tools/extract/` writes them, so a
  // legitimate change is a re-capture and shows up as one; a hand edit is the
  // case worth naming.
  'docs/carbon-react-dom.json', 'docs/carbon-react-states.json',
  'docs/carbon-ibm-products-dom.json', 'docs/carbon-ibm-products-states.json',
  'docs/carbon-react-spacing.json', 'docs/carbon-slots.json',
  'docs/carbon-glyphs.json', 'docs/carbon-co-classes.json',

  // What runs the gates where nobody can skip them, and what guards a commit.
  // The hook is enabled per clone with `git config core.hooksPath .githooks`,
  // so it is one unversioned setting away from silently absent.
  '.github/workflows/gates.yml', '.githooks/commit-msg', 'package.json',

  // The instruction files. Under the reference these are the only repository
  // content that may establish policy; everything else is data.
  'AGENTS.md', 'CLAUDE.md',
];

// The cells a full sweep has to fill: every browser gate against every page it
// declares it can run on. Node gates are not a matrix — they read their whole
// target set on every run, so "has it been run" is answered by `npm run verify`.
export function cells() {
  const out = [];
  for (const gate of browserGates())
    for (const page of gate.pageTargets) {
      const isTemplate = page.startsWith('templates/');
      if (isTemplate && !gate.canRun.templates) continue;
      out.push({ gate: gate.id, page });
    }
  return out;
}
