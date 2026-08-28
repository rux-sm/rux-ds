#!/usr/bin/env node
//
// A class must sit on the ELEMENT TYPE Carbon renders it on.
//
// roadmap §4.1.11 lists what check-compound cannot see: "pairs Carbon never
// writes as a compound selector, wrong nesting *order*, a missing wrapper, or
// the wrong element type." This is the last of those four. Every name-based
// gate passes a `<div>` wearing a class Carbon renders on a `<ul>` — the class
// resolves, the co-classes are satisfied, the compound is intact — and the
// semantics, the ARIA tree and often the layout are all wrong.
//
// Two defects already in the record are of exactly this shape. Multiselect's
// menu was a `div` of `div`s where React renders a `ul` of `li`s, and tabs put
// `--tabs__nav-link` on an `<a>` where React uses a `<button>`. Reconstructing
// either markup, this checker flags it; the corrected fragments come back clean.
//
// DIAGNOSTIC, NOT A GATE — it exits 0 even with findings, and is deliberately
// not in `npm run verify` yet. Some findings are considered divergence rather
// than defect: this project renders `--snippet` on a `<code>` and
// `--contained-list__label` on an `<h3>` where React uses `<div>`, and those are
// arguably better. Until every finding has been answered one way or the other,
// enforcing this would mean shipping it with an ignore list, and a check that
// needs a list to pass is measuring the list. Promote it when the residue is
// small and each remaining entry has a reason.
//
// WHY THERE IS NO FRAGMENT-TO-STORY MAP. The first design mapped each fragment
// to the stories covering it, which needed 26 hand-written entries and stalled
// on `dialog`, `resizer` and `side-panel`, none of which has an @carbon/react
// story (side-panel has since been given one from @carbon/ibm-products; the
// other two still have none). The map turned out to be unnecessary: THE CLASS IS THE JOIN KEY. Pool
// every story into one class -> tags index and a fragment's classes look
// themselves up. Fragments with no reference contribute classes the index does
// not know, and those are skipped and counted rather than guessed at.
//
// WHAT IT DELIBERATELY DOES NOT CHECK. Ancestry was tried and abandoned. The
// Storybook wraps every component in its own chrome — `div.cds--layout`,
// `tooltip-trigger__wrapper`, `grid`/`row`/`col-lg-13` — which our fragments
// have no reason to reproduce, and reference parents carry classes we drop on
// purpose because @carbon/styles has no rule for them and check-classes would
// reject them. Both produced false positives on fragments already verified by
// hand. Class PRESENCE fails the same way in both directions: the reference is
// full of story decoration we should not copy, and our fragments demo states no
// story happens to show — multiselect's menu is closed in every one of them, so
// all ten of its menu-item classes look invented. Tag placement is the part
// that survived contact with the two hand-verified fragments.
//
// The references are snapshots, harvested by tools/extract/react-dom.js against
// each Storybook origin. A Carbon bump can move a tag legitimately, and the
// answer then is to re-harvest, not to soften this.
//
import { readFileSync, readdirSync } from 'node:fs';

// Two references, because two packages ship the components this system compiles.
// @carbon/styles pulls in side-panel, and @carbon/react has no side-panel at all —
// it lives in @carbon/ibm-products, whose Storybook is a separate origin with its
// own `c4p--` prefix. The class NAMES are identical: all 19 that story emits are
// defined in our CSS, so normalising the prefix away makes it a valid reference
// for exactly the same check.
const REF_PATHS = [
  'docs/carbon-react-dom.json',        // @carbon/react, 505 stories
  'docs/carbon-ibm-products-dom.json', // @carbon/ibm-products, side-panel only
  'docs/carbon-react-states.json',     // configured states, from the RECIPES harvest
];
const PREFIX = /^(?:cds|c4p)--/;

// Void and self-closing elements never open a scope. The SVG members matter:
// fragments are full of <use/> and <path/>, and treating them as containers
// would corrupt every depth below them.
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
  'use', 'path', 'circle', 'rect', 'polygon', 'stop', 'ellipse', 'line']);

// Structural parse of an authored fragment. A regex is enough here and a real
// parser would be a dependency: the sink HTML is hand-written and well-formed —
// every attribute quoted, every non-void element closed. Comments go first so
// the commented-out markup the fragments carry for explanation is not read as
// markup. Only the tag and its rux-- classes are kept; depth is tracked but not
// used, because ancestry is not part of this check (see above).
function elements(html) {
  const src = html.replace(/<!--[\s\S]*?-->/g, '');
  const out = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;
  while ((m = re.exec(src))) {
    const [, closing, tag, attrs, selfClose] = m;
    if (closing) continue;
    const t = tag.toLowerCase();
    const classes = (attrs.match(/\sclass="([^"]*)"/) ?? [, ''])[1]
      .split(/\s+/).filter(c => c.startsWith('rux--')).map(c => c.slice(5));
    if (classes.length) out.push({ tag: t, classes });
    if (!selfClose && !VOID.has(t)) { /* depth unused; see header */ }
  }
  return out;
}

// A reference line is '  '*depth + tag + '.' + cls.cls + [role=…] + {aria=…}
function refElements(lines) {
  return lines.map(l => {
    const body = l.trim().replace(/\[role=[^\]]*\]/, '').replace(/\{[^}]*\}/, '');
    const [tag, ...cls] = body.split('.');
    return { tag, classes: cls.filter(Boolean).map(c => c.replace(PREFIX, '')) };
  });
}

// class -> every tag Carbon renders it on, pooled across every story.
// Pooling is what makes the map unnecessary, and it is also the main dilution:
// a class React puts on both a <button> and a <div> accepts either from us,
// even where only one is right for the variant being demoed. Narrower stories
// per class would sharpen this; they would also bring the map back.
const TAGS = new Map();
let stories = 0;
const refs = REF_PATHS.flatMap(p => Object.values(JSON.parse(readFileSync(p, 'utf8'))));
for (const lines of refs) {
  if (lines[0]?.startsWith('(')) continue;      // (missing)/(empty) markers carry no DOM
  stories++;
  for (const { tag, classes } of refElements(lines))
    for (const c of classes) (TAGS.get(c) ?? TAGS.set(c, new Set()).get(c)).add(tag);
}

const files = readdirSync('sink').filter(f => f.endsWith('.html')).sort();
let findings = 0, checked = 0, unknown = 0;

for (const file of files) {
  const rows = [];
  const seen = new Map();                       // class -> tags this fragment uses
  for (const { tag, classes } of elements(readFileSync(`sink/${file}`, 'utf8')))
    for (const c of classes) (seen.get(c) ?? seen.set(c, new Set()).get(c)).add(tag);

  for (const [c, tags] of seen) {
    if (!TAGS.has(c)) { unknown++; continue; }   // no story emits it; nothing to compare
    checked++;
    for (const t of tags)
      if (!TAGS.get(c).has(t)) rows.push([c, t, [...TAGS.get(c)].sort().join('|')]);
  }
  if (!rows.length) continue;
  console.log(`  ${file}`);
  for (const [c, mine, theirs] of rows.sort())
    console.log(`      rux--${c}  <${mine}>  Carbon renders it on <${theirs}>`);
  findings += rows.length;
}

console.log(`\n  ${stories} stories · ${checked} classes checked · ${unknown} with no reference`
  + ` · ${findings} on a different element`);
console.log('  diagnostic only — see the header before promoting this to a gate');
