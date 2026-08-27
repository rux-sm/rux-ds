#!/usr/bin/env node
//
// Every sink fragment must say where its markup came from.
//
// The other gates ask whether the markup resolves. None of them can ask the
// question that actually matters for structure: was this shape ever compared
// against something Carbon renders, or was it guessed from a selector? Guessing
// is what produced the tabs defect (roadmap §4.1.11) — a fragment that passed
// every gate and still drew a doubled underline, because the classes were real
// and merely in the wrong places.
//
// §4.1.11 had to reconstruct which fragments were quarried by reading commit
// messages, and the reconstruction was wrong: f9f5414 claims nine fragments
// match the rendered React DOM, and only two of them record a reference. That
// is the failure this gate prevents — not bad markup, but markup whose
// trustworthiness is unknowable without archaeology. Roadmap §4.1.13.
//
// WHAT IT CHECKS. Presence, vocabulary, position, and that a claim of
// verification names what it was verified against:
//
//   labelled    every sink/*.html carries a PROVENANCE comment
//   vocabulary  its value is one of the three known kinds
//   first       it is the FIRST comment in the fragment, not buried in a wall
//               of notes where the next reader will miss it
//   backed      `rendered-dom` and `source` name a reference; a verification
//               claim with nothing after it is an assertion, not a record
//   dated       `rendered-dom` carries a date, because the live page it was read
//               from moves and the claim expires with it
//
// `inferred` needs no reference and no date — there is nothing to cite. It is
// the honest default and it is always allowed to pass.
//
// WHAT IT IS BLIND TO: whether any label is TRUE. A fragment can claim
// `rendered-dom` against a story nobody opened and this exits 0. It enforces
// that the claim is made, specific, and findable — a human diff is still the
// only thing that establishes it. That is the same bargain as check-coverage,
// which proves a component is exercised and not that the markup is right.
//
// WHY THERE IS NO IGNORE LIST, and why it does not fail on `inferred`. A gate
// that failed while any fragment was unverified would be red for the whole of
// Phase 1 with no action available on most days, and a red gate nobody can turn
// green gets bypassed — f9f5414 already shipped through a red check-classes.
// So this gate measures declaration, not verification, and every rule above is
// universal: no fragment needs an entry anywhere to satisfy it.
//
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'sink';
const KINDS = {
  'rendered-dom': 'class tree read out of the live React page',
  'source': 'read from an implementation — .tsx, a render(), or shadow DOM',
  'inferred': 'read off CSS selectors, never diffed against a reference',
};
const NEEDS_REFERENCE = new Set(['rendered-dom', 'source']);
const NEEDS_DATE = new Set(['rendered-dom']);

const files = readdirSync(DIR).filter(f => f.endsWith('.html')).sort();

const rows = [];
const faults = [];
for (const f of files) {
  const path = join(DIR, f);
  const html = readFileSync(path, 'utf8');
  const comments = [...html.matchAll(/<!--([\s\S]*?)-->/g)].map(m => m[1]);
  const carrying = comments.filter(c => /PROVENANCE:/.test(c));

  if (!carrying.length) {
    faults.push([`UNLABELLED`, path, `no PROVENANCE comment — add one under the <h2>`]);
    continue;
  }
  if (carrying.length > 1) {
    faults.push([`DUPLICATE`, path, `${carrying.length} PROVENANCE comments; there can be one`]);
    continue;
  }
  if (!/PROVENANCE:/.test(comments[0])) {
    faults.push([`BURIED`, path, `PROVENANCE is not the first comment — move it under the <h2>`]);
    continue;
  }

  const m = carrying[0].match(/^\s*PROVENANCE:\s*([a-z-]+)([\s\S]*)$/);
  if (!m) {
    faults.push([`MALFORMED`, path, `expected "PROVENANCE: <kind> · <reference>"`]);
    continue;
  }
  const [, kind, rest] = m;
  if (!(kind in KINDS)) {
    faults.push([`UNKNOWN`, path, `kind "${kind}" — known kinds: ${Object.keys(KINDS).join(' ')}`]);
    continue;
  }

  const reference = (rest.split('·')[1] ?? '').trim();
  if (NEEDS_REFERENCE.has(kind) && reference.length < 8) {
    faults.push([`UNBACKED`, path, `"${kind}" must name what it was read from, after a ·`]);
    continue;
  }
  if (NEEDS_DATE.has(kind) && !/\d{4}-\d{2}-\d{2}/.test(rest)) {
    faults.push([`UNDATED`, path, `"${kind}" must carry a YYYY-MM-DD — the page it cites moves`]);
    continue;
  }

  rows.push({ file: f.replace(/\.html$/, ''), kind });
}

const of = kind => rows.filter(r => r.kind === kind).map(r => r.file);

const [flag] = process.argv.slice(2);
if (flag && flag.startsWith('--')) {
  const want = flag.slice(2);
  if (want in KINDS) { console.log(of(want).join(' ')); process.exit(0); }
  console.log(`usage: check-provenance.mjs [${Object.keys(KINDS).map(k => `--${k}`).join(' | ')}]`);
  process.exit(2);
}

for (const [tag, path, why] of faults) {
  console.log(`  ${tag.padEnd(11)}${path}`);
  console.log(`  ${''.padEnd(11)}${why}`);
}

const tally = Object.keys(KINDS).map(k => `${of(k).length} ${k}`).join(' · ');
console.log(`\n  fragments ${files.length} · labelled ${rows.length} · ${tally}`);
if (faults.length) console.log(`  unlabelled or malformed ${faults.length}`);
console.log();
process.exit(faults.length ? 1 : 0);
