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
// DIRTY IS A FACT ABOUT ONE WORKING TREE, and the second reader cannot use it.
// check-gates is run by a person against the tree in front of them, where
// "you have modified an input since this reading" is the whole point. portal.html
// is COMMITTED, and a committed file may not record a state no clone can
// reproduce. It did, and here is the shape of it: css/rux.css was still
// uncommitted when 4beac65 built its portal.html, so 26 cells were written as
// `dirty · uncommitted: css/rux.css`; the same commit then landed that file, and
// every clone regenerating the page got `stale · css/rux.css changed since`.
// A 52-line diff on a clean checkout, and CI's "committed build output is up to
// date" step red on a tree nobody had touched.
//
// Regenerating alone would not have fixed it. The flip is STRUCTURAL: any commit
// that touches a gate input is, at the moment `verify` builds the page, a tree
// where that input is uncommitted — so DIRTY is baked, and landing the commit
// turns it STALE. The artefact could never agree with itself.
//
// So `cellStates({ workingTree: false })` folds an uncommitted modification into
// the same bucket as a committed one: both mean the recorded reading is no
// longer current, and the caller that cannot see a working tree is told the
// thing that will still be true after the commit lands. The wording is STALE's,
// unchanged, and the filter runs over `gate.inputs` in registry order in both
// modes, so the string is byte-identical either side of the commit boundary —
// which is the property that makes the page idempotent.
//
// It reports one state fewer, not a different rule. Nothing calls this with
// `workingTree: false` except the generator of a committed file.
//
import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { GATES, cells } from './gates.mjs';

const LEDGER = 'docs/gate-coverage.json';

const git = args => {
  try { return execFileSync('git', args, { encoding: 'utf8' }); }
  catch { return ''; }
};

// Commits touching `path` since `since`. Empty means the input has not moved,
// which is the only thing that makes a recorded result still current.
function movedSince(since, path) {
  if (!existsSync(path)) return false;
  return git(['log', '--oneline', `${since}..HEAD`, '--', path]).trim().length > 0;
}

// [{ id, page, state, why }] for every cell the registry says a sweep must fill.
// state is one of: 'ok' | 'STALE' | 'DIRTY' | 'NEVER RUN' | 'NO COMMIT'.
//
// `workingTree: false` drops DIRTY from that set — see the note above. Pass it
// when the result is going into a file that gets committed.
export function cellStates({ workingTree = true } = {}) {
  const ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, 'utf8')) : {};

  // THE STATUS LETTERS ARE TWO COLUMNS AND THE FIRST MAY BE A SPACE, so this
  // must not be trimmed as one blob. It was, and the leading space of the FIRST
  // line went with it: `slice(3)` then cut a character off the path, and " M
  // css/rux.css" was read as "ss/rux.css" — matching no declared input. The
  // first porcelain line is the alphabetically first path, which for this
  // repository is `css/rux.css`, the one input that invalidates every browser
  // cell. So DIRTY was silently under-reported exactly where it mattered most.
  // Trim per line, not across.
  const dirty = new Set(
    git(['status', '--porcelain'])
      .split('\n').filter(Boolean)
      // "XY path" and, for a rename, "XY old -> new"; the new name is the one
      // on disk and the one a declared input would be matched against.
      .map(l => l.slice(3).trim().split(' -> ').pop()));
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

    // One filter over gate.inputs, so the joined list is in registry order in
    // both modes and an input that is dirty today reads exactly as it will once
    // committed.
    if (!workingTree) {
      const invalid = gate.inputs.filter(i => moved.includes(i) || isDirty(i));
      if (invalid.length) rows.push({ id, page, state: 'STALE', why: `${invalid.join(', ')} changed since` });
      else rows.push({ id, page, state: 'ok', why: recorded.date });
      continue;
    }

    const modified = gate.inputs.filter(isDirty);

    if (moved.length) rows.push({ id, page, state: 'STALE', why: `${moved.join(', ')} changed since` });
    else if (modified.length) rows.push({ id, page, state: 'DIRTY', why: `uncommitted: ${modified.join(', ')}` });
    else rows.push({ id, page, state: 'ok', why: recorded.date });
  }
  return rows;
}
