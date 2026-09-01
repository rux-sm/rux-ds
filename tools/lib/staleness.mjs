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

// A GIT FAILURE IS NOT "HAS NOT MOVED". The first version of this helper
// caught every error and returned '', and movedSince read '' as "no commits
// since" — so any recorded commit git could not resolve aged to `ok`. Found
// 2026-09-01: all twelve check-spacing cells recorded `32e7eb1`, a commit that
// exists in no clone of this repository (it was rewritten before the ledger
// was pushed), and every one of them printed `ok` while `templates/` had moved
// twice underneath them. That is the exact reading this module exists to
// refuse. The commit is now resolved FIRST and reported as its own state, and
// a git failure after that is thrown, because there is no honest value to
// substitute for it.
const git = args => execFileSync('git', args, { encoding: 'utf8' }).trim();

// Whether `sha` names a commit this clone can see. Nothing can be aged against
// a commit that is not here, whatever the ledger says.
const commitKnown = sha => {
  try { execFileSync('git', ['cat-file', '-e', `${sha}^{commit}`], { stdio: 'ignore' }); return true; }
  catch { return false; }
};

// PORCELAIN IS COLUMN-ORIENTED AND `git()` TRIMS, WHICH IS A ONE-CHARACTER BUG
// WITH A SILENT FAILURE. `--porcelain` writes a two-column status field then a
// space then the path, so an UNSTAGED modification is " M path" with a leading
// space. `git()` trims the whole output, which strips that space from the FIRST
// line only; `slice(3)` then eats a character of the path and yields
// "emplates/detail-page.html". isDirty() compares that against the declared
// input and never matches.
//
// So exactly one file — whichever git happens to list first, and only when its
// change is unstaged — was exempt from the DIRTY state, and there is always a
// first line. Found 2026-08-31 by editing templates/detail-page.html, the only
// dirty file in the tree, and watching all three of its browser cells go on
// reporting `ok`. That is the precise thing this module exists to prevent: a
// recorded reading presented as current against a file that has since moved.
// Staged changes never showed it, because "M  path" has no leading space to
// lose.
//
// Not trimmed, therefore. Split first, drop the trailing empty line, and take
// the path from column 3 of each line as porcelain actually writes it.
const gitStatusPaths = () => {
  let raw;
  try { raw = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }); }
  catch { return []; }
  return raw.split('\n').filter(Boolean).map(l => l.slice(3).trim()).filter(Boolean);
};

// Commits touching `path` since `since`. Empty means the input has not moved,
// which is the only thing that makes a recorded result still current.
function movedSince(since, path) {
  if (!existsSync(path)) return false;
  return git(['log', '--oneline', `${since}..HEAD`, '--', path]).length > 0;
}

// [{ id, page, state, why }] for every cell the registry says a sweep must fill.
// state is one of: 'ok' | 'STALE' | 'DIRTY' | 'NEVER RUN' | 'NO COMMIT' | 'UNKNOWN COMMIT'.
export function cellStates() {
  const ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, 'utf8')) : {};

  const dirty = new Set(gitStatusPaths());
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
    if (!commitKnown(recorded.commit)) {
      rows.push({ id, page, state: 'UNKNOWN COMMIT', why: `recorded commit ${recorded.commit} is not in this repository` });
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
