#!/usr/bin/env node
//
// Which components does the kitchen sink actually exercise?
//
// Ownership is by NAME, not by which compile emitted a class. Two earlier metrics
// were wrong and are recorded so they are not retried:
//   1. "any class used" — compiling `modal` drags in `.rux--btn`, so one button on
//      the page marked modal covered. Overcounted 61/75.
//   2. "classes unique to one component" — `dropdown` is a dependency of combo-box,
//      multiselect and the fluid-* family, so `.rux--dropdown` has five owners and
//      dropdown ended up with ZERO signature classes and a false pass.
// Carbon namespaces by component name, so `.rux--dropdown*` belongs to dropdown
// no matter which compile emitted it. That is the metric below.
//
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { stems, compiled } from './lib/ownership.mjs';

const inv = JSON.parse(readFileSync('docs/inventory.json', 'utf8'));
const ROOTS = ['kitchen-sink.html', 'templates'];

// The stem table moved to tools/lib/ownership.mjs when check-classes needed it too.

// The fluid-* components define no stem of their own — each is a `--fluid`
// modifier on a base component. Ownership for them is an exact class, not a prefix.
// The four list-box-based ones share one wrapper class, so this metric cannot
// tell them apart; each still gets its own markup below.
const MARKER = {
  'fluid-text-input': 'rux--text-input--fluid',
  'fluid-text-area': 'rux--text-area--fluid',
  'fluid-select': 'rux--select--fluid',
  'fluid-search': 'rux--search--fluid',
  'fluid-number-input': 'rux--number-input--fluid',
  'fluid-date-picker': 'rux--date-picker--fluid',
  'fluid-time-picker': 'rux--time-picker--fluid',
  'fluid-dropdown': 'rux--list-box__wrapper--fluid',
  'fluid-combo-box': 'rux--list-box__wrapper--fluid',
  'fluid-multiselect': 'rux--list-box__wrapper--fluid',
  'fluid-list-box': 'rux--list-box__wrapper--fluid',
};

function walk(p, out = []) {
  if (!statSync(p, { throwIfNoEntry: false })) return out;
  if (statSync(p).isDirectory()) { for (const f of readdirSync(p)) walk(join(p, f), out); return out; }
  if (extname(p) === '.html') out.push(p);
  return out;
}

const used = new Set();
for (const f of ROOTS.flatMap(r => walk(r))) {
  for (const m of readFileSync(f, 'utf8').matchAll(/class="([^"]*)"/g))
    for (const c of m[1].split(/\s+/)) if (c.startsWith('rux--')) used.add(c);
}

// COMPILED, NOT ALL 75. Since Phase 3 the manifest is the strip, so the set this
// gate must account for is whatever src/app.scss still @uses — a commented-out
// component has no CSS and cannot be exercised, and demanding coverage for it
// would make the gate permanently red with no action available. The manifest is
// read directly rather than mirrored in a list here, because a second copy of
// the keep-set is a second thing to forget.
const COMPILED = compiled();

const allClasses = new Set(inv.components.flatMap(c => c.classes ?? []));
const covered = [], missing = [], unowned = [];
for (const c of inv.components) {
  if (c.error) continue;
  if (!COMPILED.has(c.component)) continue;   // stripped; see above
  const own = MARKER[c.component]
    ? [...allClasses].filter(cl => cl === MARKER[c.component])
    : [...allClasses].filter(cl => stems(c.component).some(s =>
        cl === `rux--${s}` || cl.startsWith(`rux--${s}-`) || cl.startsWith(`rux--${s}__`)));
  const hit = own.filter(x => used.has(x));
  const row = { component: c.component, ownCount: own.length, hit: hit.length, own };
  if (!own.length) unowned.push(row);
  else (hit.length ? covered : missing).push(row);
}

const [flag, arg] = process.argv.slice(2);
if (flag === '--missing') { console.log([...missing, ...unowned].map(m => m.component).join(' ')); process.exit(0); }
if (flag === '--own' && arg) {
  const c = [...covered, ...missing, ...unowned].find(x => x.component === arg);
  console.log(c ? c.own.join('\n') : 'no such component'); process.exit(0);
}

const total = covered.length + missing.length + unowned.length;
console.log(`\n  COVERED  ${covered.length}/${total}`);
console.log(`  ${covered.map(c => c.component).join(' ')}`);
console.log(`\n  MISSING  ${missing.length}`);
console.log(`  ${missing.map(c => c.component).join(' ')}`);
if (unowned.length) {
  console.log(`\n  NO OWNED CLASSES (needs an ALIAS entry)  ${unowned.length}`);
  console.log(`  ${unowned.map(c => c.component).join(' ')}`);
}
console.log();
process.exit(missing.length + unowned.length ? 1 : 0);
