#!/usr/bin/env node
//
// HAS THIS GATE EVER BEEN RUN AGAINST THIS TARGET?
//
// The repo could not answer that question until 2026-08-29, and it cost nine
// instances of one bug. `check-a11y.js` already carried the rule that catches a
// focusable control inside an `aria-hidden` subtree; it had simply never been
// pointed at `templates/`, where the closed batch bar lived. The gate was green
// everywhere it had been run, and silent everywhere it had not, and nothing
// distinguished the two.
//
// So this gate checks COVERAGE, not correctness. Four states per cell:
//
//   NEVER RUN   no recorded result for this gate against this page
//   STALE       a declared input has a commit since the one the run recorded
//   DIRTY       an input has uncommitted changes, so the result is not
//               reconstructable by anyone else
//   NO COMMIT   a ledger entry with nothing to age against — its own finding
//
// WHY THIS ONE MAY BE PROMOTED WHEN TWO OTHERS COULD NOT. Two candidate rules
// were tested on 2026-08-29 and both failed this project's standard: a
// subset/superset rule gave nine findings of which one was real, and a
// provenance-vs-closest-story rule fired on almost nothing. Both asked for
// judgement, so both needed an allow-list, and a rule that needs one measures
// the list. This asks a question of FACT — was it run since its inputs changed —
// so there is nothing to exempt and nothing to argue with.
//
// STALENESS IS MEASURED IN COMMITS, NOT DATES, and the first draft got this
// wrong in a way worth recording. It stored a day ("2026-08-29") and compared it
// against `git log -1 --format=%cI`, a full ISO timestamp. String comparison put
// every same-day commit after the recorded day, so all 22 cells read STALE the
// moment the ledger was written. Coarsening to a day would have been worse: the
// case that motivated this gate — js/menu.js edited AFTER an a11y run, the same
// afternoon — is exactly the one day-granularity cannot see.
//
// So a ledger entry records the HEAD commit it was taken at, and a cell is stale
// when any declared input has a commit in `<recorded>..HEAD`. That is exact,
// needs no clock, and is reproducible in any clone.
//
// It cannot see an UNCOMMITTED edit, so the working tree is checked separately
// and reported as DIRTY — a result taken against a modified file is not
// something a later reader can reconstruct.
//
// THE INPUTS ARE WIDER THAN THE PAGE. A browser reading depends on the
// stylesheet that decides what renders and the modules that rewrite the markup,
// so `css/rux.css` and `js/` invalidate every browser cell. That is not
// theoretical: editing js/menu.js on 2026-08-29 invalidated every template's
// a11y result and nothing said so.
//
// WHAT IT CANNOT DO. Verify that a recorded result is honest. A browser result
// is typed back by whoever ran it, and this gate takes it on trust — the same
// limit `check-provenance` accepts by name, which "cannot tell whether the page
// was ever opened, exactly as it cannot tell whether a `rendered-dom` label is
// true." It can only tell you nobody has claimed to run it.
//
// REPORTING ONLY FOR NOW. It exits 0 whatever it finds, and joins `npm run
// verify` once the matrix is filled — the `check-tags` precedent, promoted from
// diagnostic after every finding of its first full run was adjudicated.
//
//   node tools/check-gates.mjs           the matrix
//   node tools/check-gates.mjs --gaps    only the cells that need a run
//
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { GATES, browserGates, cells, inVerify } from './lib/gates.mjs';

const LEDGER = 'docs/gate-coverage.json';

const ledger = existsSync(LEDGER)
  ? JSON.parse(readFileSync(LEDGER, 'utf8'))
  : {};

const git = args => {
  try { return execFileSync('git', args, { encoding: 'utf8' }).trim(); }
  catch { return ''; }
};

// Commits touching `path` since `since`. Empty means the input has not moved,
// which is the only thing that makes a recorded result still current.
function movedSince(since, path) {
  if (!existsSync(path)) return false;
  return git(['log', '--oneline', `${since}..HEAD`, '--', path]).length > 0;
}

// Paths with uncommitted changes. A result read against a modified file cannot
// be reconstructed later, so it is reported even though nothing has "moved".
const dirty = new Set(
  git(['status', '--porcelain'])
    .split('\n').filter(Boolean).map(l => l.slice(3).trim()));

const isDirty = input => [...dirty].some(p => p === input || p.startsWith(input + '/'));

const gapsOnly = process.argv.includes('--gaps');

const rows = [];
for (const { gate: id, page } of cells()) {
  const gate = GATES.find(g => g.id === id);
  const recorded = ledger[id]?.[page] ?? null;

  if (!recorded) { rows.push({ id, page, state: 'NEVER RUN', why: '' }); continue; }

  // Without a commit there is nothing to measure against. Say so rather than
  // guessing from the date — a ledger entry that cannot be aged is its own
  // finding.
  if (!recorded.commit) {
    rows.push({ id, page, state: 'NO COMMIT', why: 'ledger entry records no commit to age against' });
    continue;
  }

  const moved = gate.inputs.filter(i => movedSince(recorded.commit, i));
  const modified = gate.inputs.filter(isDirty);

  if (moved.length) rows.push({ id, page, state: 'STALE', why: `${moved.join(', ')} changed since` });
  else if (modified.length) rows.push({ id, page, state: 'DIRTY', why: `uncommitted: ${modified.join(', ')}` });
  else rows.push({ id, page, state: 'ok', why: recorded.date });
}

const gaps = rows.filter(r => r.state !== 'ok');
const width = Math.max(...rows.map(r => r.id.length));

console.log();
for (const r of (gapsOnly ? gaps : rows)) {
  const tag = r.state === "ok" ? "  ok       " : `  ${r.state.padEnd(9)}`;
  console.log(`${tag} ${r.id.padEnd(width)}  ${r.page}${r.why ? '  ·  ' + r.why : ''}`);
}

// The gates that cannot reach a target at all are part of the coverage picture
// and are easy to mistake for cells nobody has got to yet.
const blocked = browserGates().filter(g => !g.canRun.templates);
if (blocked.length && !gapsOnly) {
  console.log();
  for (const g of blocked)
    console.log(`  N/A       ${g.id.padEnd(width)}  templates/*  ·  ${g.cannotRunReason}`);
}

console.log();
console.log(`  ${GATES.length} gates — ${inVerify().length} in npm run verify, `
  + `${browserGates().length} need a browser`);
console.log(`  ${rows.length} sweep cells · ${rows.length - gaps.length} current · `
  + `${gaps.filter(r => r.state === 'STALE').length} stale · `
  + `${gaps.filter(r => r.state === 'NEVER RUN').length} never run`);
if (gaps.length) console.log(`  reporting only — this gate does not fail yet`);
console.log();

process.exit(0);
