#!/usr/bin/env node
//
// How much of each shipped component does the kitchen sink actually exercise?
//
// Ownership is by NAME, not by which compile emitted a class. Two earlier metrics
// were wrong and are recorded so they are not retried:
//   1. "any class used" — compiling `modal` drags in `.rux--btn`, so one button on
//      the page marked modal covered. Overcounted 61/75.
//   2. "classes unique to one component" — `dropdown` is a dependency of combo-box,
//      multiselect and the fluid-* family, so `.rux--dropdown` has five owners and
//      dropdown ended up with ZERO signature classes and a false pass.
// Carbon namespaces by component name, so `.rux--dropdown*` belongs to dropdown
// no matter which compile emitted it. That is the metric below, and the stem table
// it needs now lives in tools/lib/ownership.mjs, shared with check-classes.
//
// A THIRD METRIC WAS WRONG AND IS THE REASON THIS FILE WAS REWRITTEN. It reported
// COVERED when a component had one class hit out of any number. `ui-shell` owns 55
// classes; a single `rux--header` marked it covered. The gate read 31/31 green while
// 45% of the shipped CSS had never been rendered once — and Phase 6 composes its
// templates from this sink, so an unexercised state is an unverified state.
//
// WHY THIS RATCHETS RATHER THAN SETTING A THRESHOLD. A percentage floor high enough
// to mean anything would be red today with no action available, which is the failure
// this file already warns about for stripped components. So the baseline is the
// coverage actually achieved, recorded in docs/coverage.json, and the gate fails when
// a component exercises FEWER classes than it did — never for standing still. Raising
// a number is then a deliberate act (`--update`), and it can only go up.
//
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { stems, compiled, classNames } from './lib/ownership.mjs';

const inv = JSON.parse(readFileSync('docs/inventory.json', 'utf8'));
const ROOTS = ['kitchen-sink.html', 'templates'];
const BASELINE = 'docs/coverage.json';

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
// would make the gate permanently red with no action available.
const COMPILED = compiled();

// Intersected with the BUILT CSS, not just the inventory's class lists. A class
// like `rux--text-input--fluid` has stem `text-input` and so counts as owned by a
// component that ships — but it only exists when fluid-text-input is compiled, and
// it is not. Leaving it in the denominator makes a target that can never be reached.
const DEFINED = classNames(readFileSync('css/rux.css', 'utf8'));
const allClasses = new Set(inv.components.flatMap(c => c.classes ?? []));

const rows = [], unowned = [];
for (const c of inv.components) {
  if (c.error || !COMPILED.has(c.component)) continue;
  const own = MARKER[c.component]
    ? [...allClasses].filter(cl => cl === MARKER[c.component] && DEFINED.has(cl))
    : [...allClasses].filter(cl => DEFINED.has(cl) && stems(c.component).some(s =>
        cl === `rux--${s}` || cl.startsWith(`rux--${s}-`) || cl.startsWith(`rux--${s}__`)));
  const hit = own.filter(x => used.has(x));
  const row = { component: c.component, own: own.length, hit: hit.length,
                pct: own.length ? Math.round(100 * hit.length / own.length) : 0,
                missing: own.filter(x => !used.has(x)).sort() };
  if (!own.length) unowned.push(row); else rows.push(row);
}
rows.sort((a, b) => a.pct - b.pct || a.component.localeCompare(b.component));

const [flag, arg] = process.argv.slice(2);
if (flag === '--missing') {                       // components exercising nothing at all
  console.log([...rows.filter(r => !r.hit), ...unowned].map(r => r.component).join(' ')); process.exit(0);
}
if (flag === '--own' && arg) {
  const c = [...rows, ...unowned].find(x => x.component === arg);
  console.log(c ? c.missing.join('\n') : 'no such component'); process.exit(0);
}

const base = statSync(BASELINE, { throwIfNoEntry: false })
  ? JSON.parse(readFileSync(BASELINE, 'utf8')).components ?? {} : {};

if (flag === '--update') {
  const components = Object.fromEntries(rows.map(r => [r.component, { hit: r.hit, own: r.own }]));
  writeFileSync(BASELINE, JSON.stringify({
    note: 'Per-component class coverage of the kitchen sink, as achieved. check-coverage '
        + 'fails when a component exercises fewer classes than recorded here, so this '
        + 'file only ever moves up. Regenerate deliberately with `npm run coverage:update` '
        + 'after adding sink markup — never to make a red gate green.',
    components,
  }, null, 2) + '\n');
  console.log(`\n  BASELINE written — ${rows.length} components, `
    + `${rows.reduce((n, r) => n + r.hit, 0)} classes exercised\n`);
  process.exit(0);
}

const regressed = rows.filter(r => base[r.component] && r.hit < base[r.component].hit);
const fresh = rows.filter(r => !base[r.component]);
const dead = Object.keys(base).filter(c => !rows.some(r => r.component === c));
const none = rows.filter(r => !r.hit);

const totHit = rows.reduce((n, r) => n + r.hit, 0);
const totOwn = rows.reduce((n, r) => n + r.own, 0);
const SHOW = flag === '--all' ? rows.length : 10;

console.log(`\n  COVERAGE  ${totHit}/${totOwn} classes (${Math.round(100 * totHit / totOwn)}%) `
  + `across ${rows.length} components`);
for (const r of rows.slice(0, SHOW))
  console.log(`  ${String(r.pct).padStart(5)}%  ${r.component.padEnd(18)}`
    + `${String(r.hit).padStart(4)}/${r.own}`);
if (rows.length > SHOW)
  console.log(`  ${String(rows.length - SHOW).padStart(5)} more not listed — \`--all\` for every row, `
    + `\`--own <component>\` for its unexercised classes`);

// A regression is the finding; everything else is a bookkeeping note, so only
// regressions get a line each.
const note = (label, names, tail) => {
  if (names.length) console.log(`\n  ${label}  ${names.length} — ${names.join(' ')}\n  ${' '.repeat(label.length)}  ${tail}`);
};
note('EXERCISES NOTHING', none.map(r => `${r.component}(${r.own})`), 'add markup, or strip the component');
note('NO OWNED CLASSES ', unowned.map(r => r.component), 'needs an ALIAS entry in tools/lib/ownership.mjs');
note('STALE BASELINE   ', dead, 'no longer compiled — run `npm run coverage:update`');
note('NOT IN BASELINE  ', fresh.map(r => `${r.component}(${r.pct}%)`), 'run `npm run coverage:update` to record');
for (const r of regressed)
  console.log(`\n  REGRESSED  ${r.component}  ${base[r.component].hit} -> ${r.hit} of ${r.own} classes`
    + `\n             \`node tools/check-coverage.mjs --own ${r.component}\` lists what is unexercised`);

const bad = regressed.length + none.length + unowned.length + fresh.length + dead.length;
if (!bad) console.log(`\n  BASELINE  ${BASELINE} — no regressions\n`);
else console.log();
process.exit(bad ? 1 : 0);
