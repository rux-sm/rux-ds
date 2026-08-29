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
// it. There are 13 `check-*` FILES and 14 GATES: `build.mjs` carries the
// namespace check, which has a row in README's table and no file of its own.
// Ten run in `npm run verify`; four need a browser.
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
import { ROOTS, markupFiles } from './sources.mjs';

// The pages a BROWSER gate runs against. Not the same set as the FILES a Node
// gate reads: `sources.mjs` enumerates `sink/*.html` fragments, and no browser
// ever loads a fragment — it loads the assembled sink, or one template. Keeping
// these apart stops the registry claiming a shared target that does not exist.
export function pageTargets() {
  return ['kitchen-sink.html', 'portal.html',
    ...markupFiles(['templates']).map(f => f.path)];
}

// Every browser result depends on more than the page it was read from: the
// stylesheet decides what renders and the modules decide what the markup
// becomes. A change to either invalidates a reading taken before it — which is
// the case that motivated the staleness rule, since editing js/menu.js on
// 2026-08-29 silently invalidated every template's a11y result.
const RENDERED_INPUTS = ['css/rux.css', 'js'];

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
    id: 'check-classes',
    tool: 'tools/check-classes.mjs',
    kind: 'node',
    inVerify: true,
    catches: 'a class used in HTML or `js/` with no CSS behind it · a class whose component was stripped',
    blindTo: 'a class that resolves but renders wrong',
    reads: 'assembled',
    fileTargets: ['kitchen-sink.html', 'portal.html', 'templates', 'js'],
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
    fileTargets: ['css/rux.css', 'sink/harness.css', 'kitchen-sink.html', 'portal.html', 'templates'],
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
    blindTo: 'classes no story emits (16 today)',
    reads: 'per-file',
    fileTargets: ROOTS,
    pageTargets: [],
    canRun: { sink: true, templates: true },
    inputs: [...ROOTS, 'docs/carbon-react-dom.json', 'docs/carbon-ibm-products-dom.json',
      'docs/carbon-react-states.json', 'docs/carbon-ibm-products-states.json'],
    redRun: 'move a class onto an element type no story renders it on',
    sideEffects: null,
    baseline: '5 known divergences · 34 classes with no reference · 0 on a different element',
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
    baseline: '26 declines, each with a reason · 0 missing · 492 classes corroborated',
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
    baseline: '39 files labelled · 33 rendered-dom · 6 source · 0 inferred · 6 templates verified-live · 12 modules, 10 derived · 2 verified-live',
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
    inputs: ['kitchen-sink.html', ...RENDERED_INPUTS],
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
    inputs: ['kitchen-sink.html', 'templates', ...RENDERED_INPUTS],
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
    inputs: ['kitchen-sink.html', 'templates', 'docs/carbon-react-spacing.json', ...RENDERED_INPUTS],
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
    // that set, and five of the twelve modules bind to nothing in any template.
    fileTargets: [],
    pageTargets: ['kitchen-sink.html'],
    canRun: { sink: true, templates: false },
    cannotRunReason: 'it drives every module, and no template carries the components to drive — five modules bind to nothing there at all',
    inputs: ['kitchen-sink.html', ...RENDERED_INPUTS],
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
    inputs: ['kitchen-sink.html', 'templates', ...RENDERED_INPUTS],
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
