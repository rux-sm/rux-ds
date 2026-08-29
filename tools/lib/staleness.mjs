//
// WHEN A RECORDED BROWSER READING STOPS BEING TRUE, in one definition.
//
// tools/check-gates.mjs owns the rule and states the reasoning: a ledger entry
// records the HEAD commit it was taken at, and a cell is STALE when any declared
// input has a commit in `<recorded>..HEAD`. Uncommitted changes to an input make
// it DIRTY instead — a result read against a modified file is not something a
// later reader can reconstruct.
//
// THIS FILE EXISTS BECAUSE A SECOND READER APPEARED. portal.html renders the
// same matrix, and its first version counted RECORDED cells rather than CURRENT
// ones: it displayed "25 / 25 · 0 never run" while `npm run gates` was reporting
// 22 stale in the same working tree. A status page contradicting the tool it
// reports on is the drift this repository keeps one definition to avoid — and
// the portal exists to be true, so it is the reader that had to change.
//
// The rule is check-gates'. This is a move, not a rewrite: the states, their
// precedence (STALE before DIRTY) and their wording are unchanged, and
// /tmp comparison of `npm run gates` before and after the extraction was
// byte-identical.
//
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { GATES, cells } from './gates.mjs';

const LEDGER = 'docs/gate-coverage.json';

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

// [{ id, page, state, why }] for every cell the registry says a sweep must fill.
// state is one of: 'ok' | 'STALE' | 'DIRTY' | 'NEVER RUN' | 'NO COMMIT'.
export function cellStates() {
  const ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, 'utf8')) : {};

  const dirty = new Set(
    git(['status', '--porcelain'])
      .split('\n').filter(Boolean).map(l => l.slice(3).trim()));
  const isDirty = input => [...dirty].some(p => p === input || p.startsWith(input + '/'));

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
  return rows;
}
