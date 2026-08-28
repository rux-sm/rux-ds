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
import { readFileSync } from 'node:fs';
import { markupFiles } from './lib/sources.mjs';


const KINDS = {
  'rendered-dom': 'class tree read out of the live React page',
  'source': 'read from an implementation — .tsx, a render(), or shadow DOM',
  'inferred': 'read off CSS selectors, never diffed against a reference',
};
const NEEDS_REFERENCE = new Set(['rendered-dom', 'source']);
const NEEDS_DATE = new Set(['rendered-dom']);

// TEMPLATES DECLARE TWICE. A fragment is a still: PROVENANCE says where its
// markup was read from and that is the whole of what it claims. A template
// RUNS — it carries the behaviour layer and a reader copies it expecting the
// thing to work — so it also declares BEHAVIOUR: what was compared against a
// live Carbon reference, and when.
//
// The vocabulary separates evidence from inference on purpose. `verified-live`
// means a running Carbon page was opened and specific properties were read off
// it. `carbon-css` means the claim was derived from the stylesheet, which is
// how four wrong answers about the UI shell were produced in one sitting: the
// cascade tells you the mechanism and says nothing about the intent. It is
// allowed, like `inferred`, because a weak claim honestly labelled beats a
// strong one nobody can check — but it is not the same thing and does not read
// as though it were.
const BEHAVIOUR_KINDS = {
  'verified-live': 'a running Carbon page was opened and its behaviour read',
  'carbon-css': 'derived from the compiled stylesheet, NOT from a running page',
  'none': 'the template has no behaviour of its own to verify',
};
const B_NEEDS_REFERENCE = new Set(['verified-live']);
const B_NEEDS_DATE = new Set(['verified-live']);

const files = markupFiles();

const rows = [];
const faults = [];
for (const f of files) {
  const path = f.path;
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

  // A template must also say what its behaviour was checked against.
  if (f.root !== 'sink') {
    const bearing = comments.filter(c => /BEHAVIOUR:/.test(c));
    if (!bearing.length) {
      faults.push(['NO BEHAVIOUR', path,
        `a template runs — add a BEHAVIOUR comment: ${Object.keys(BEHAVIOUR_KINDS).join(' | ')}`]);
      continue;
    }
    // TWO CLAIMS IS THE DANGEROUS CASE, not zero. Templates are built by
    // copying the shell, so a second file inherits the first's label along
    // with its markup — dated, specific, and about a page nobody opened for
    // THIS file. Reading only the first would let the inherited one answer
    // for the new one, which is the archaeology this gate exists to stop.
    if (bearing.length > 1) {
      faults.push(['DUPLICATE', path,
        `${bearing.length} BEHAVIOUR comments; there can be one. A copied template` +
        ` inherits the original's claim — delete it and make your own`]);
      continue;
    }
    const bm = bearing[0].match(/^\s*BEHAVIOUR:\s*([a-z-]+)([\s\S]*)$/);
    if (!bm) {
      faults.push(['MALFORMED', path, `expected "BEHAVIOUR: <kind> · <reference> · <date>"`]);
      continue;
    }
    const [, bkind, brest] = bm;
    if (!(bkind in BEHAVIOUR_KINDS)) {
      faults.push(['UNKNOWN', path,
        `behaviour kind "${bkind}" — known: ${Object.keys(BEHAVIOUR_KINDS).join(' ')}`]);
      continue;
    }
    if (B_NEEDS_REFERENCE.has(bkind) && !/https?:\/\//.test(brest)) {
      faults.push(['UNBACKED', path,
        `"${bkind}" must name the page it was read from, as a URL`]);
      continue;
    }
    if (B_NEEDS_DATE.has(bkind) && !/\d{4}-\d{2}-\d{2}/.test(brest)) {
      faults.push(['UNDATED', path, `"${bkind}" must carry a YYYY-MM-DD — the page it cites moves`]);
      continue;
    }
    rows.push({ file: f.name, kind, behaviour: bkind });
    continue;
  }

  rows.push({ file: f.name, kind });
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
  console.log(`  ${tag.padEnd(14)}${path}`);
  console.log(`  ${''.padEnd(14)}${why}`);
}

const tally = Object.keys(KINDS).map(k => `${of(k).length} ${k}`).join(' · ');
const tpl = rows.filter(r => r.behaviour);
const btally = Object.keys(BEHAVIOUR_KINDS)
  .map(k => `${tpl.filter(r => r.behaviour === k).length} ${k}`).join(' · ');
console.log(`\n  files ${files.length} · labelled ${rows.length} · ${tally}`);
console.log(`  templates ${tpl.length} · behaviour ${btally}`);
if (faults.length) console.log(`  unlabelled or malformed ${faults.length}`);
console.log();
process.exit(faults.length ? 1 : 0);
