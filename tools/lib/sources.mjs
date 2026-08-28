//
// The markup files a gate reads PER FILE, in one definition.
//
// Two notions of "source" exist here and they are not the same thing:
//
//   assembled   check-classes, check-co-classes and check-coverage read
//               kitchen-sink.html plus templates/, because they ask what the
//               finished page contains and a fragment on its own is not a page.
//   per file    check-tags, check-ancestry and check-icons read the fragments
//               and templates themselves, because their findings name a file to
//               EDIT — and kitchen-sink.html is generated, so naming it would
//               send the reader to a file the next `npm run sink` overwrites.
//
// This is the second one. `name` is what a finding prints and what an ignore
// list keys on, so a template is `templates/app-shell` and not `app-shell`:
// nothing stops a template and a fragment sharing a basename later, and a
// KNOWN entry that silently covered both would be worse than a duplicate.
//
// sink/deferred/ is EXCLUDED. Those fragments are not compiled, not shipped and
// deliberately carry markup for components the keep-set dropped; gating them
// would be red on purpose. README calls restoring one a three-line operation,
// and re-gating it is the fourth.
//
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const ROOTS = ['sink', 'templates'];

// [{ name, path, root }] — sorted, sink first, so output order is stable.
export function markupFiles(roots = ROOTS) {
  const out = [];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    for (const f of readdirSync(root).filter(f => f.endsWith('.html')).sort()) {
      const stem = f.replace(/\.html$/, '');
      out.push({ name: root === 'sink' ? stem : `${root}/${stem}`, path: join(root, f), root });
    }
  }
  return out;
}
