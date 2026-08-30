#!/usr/bin/env node
//
// Every rux-- class used in HTML must resolve to a rule in the built CSS, AND
// must belong to a component the manifest still compiles.
// A renamed or mistyped class is not a build error, not a type error, and not a
// test failure — it silently loses its styling. This is the only thing that catches it.
//
// THE SECOND CHECK EXISTS BECAUSE THE FIRST ONE HAS A HOLE, and Phase 3 opened it.
// `defined` is every `.rux--*` occurrence anywhere in the file, INCLUDING
// descendant position. Kept components carry rules for the AI affordances —
// `.rux--text-input__field-wrapper--slug ... .rux--ai-label` — so after the strip
// cut ai-label, slug, toggletip and combo-box, their root classes still appeared
// in the CSS and still passed. No standalone rule exists for any of them: writing
// that markup gets fragmentary styling and a green gate, which is precisely the
// failure this file was written to catch. Ownership is by stem, so the check is
// "is this class's component compiled" — see tools/lib/ownership.mjs.
//
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { owner, compiled, classNames } from './lib/ownership.mjs';
import { pageFiles } from './lib/sources.mjs';

const CSS = 'css/rux.css';
const ROOTS = pageFiles();
// Phase 5 put class names in JAVASCRIPT, where the same failure is available:
// js/modal.js selects `.rux--modal-container`, and a renamed class breaks it
// silently — no build error, no test failure, just a modal that stops trapping
// focus. Same gate, same reasoning, one more root.
const JS_ROOTS = ['js'];

function walk(p, out = [], exts = ['.html']) {
  if (!statSync(p, { throwIfNoEntry: false })) return out;
  if (statSync(p).isDirectory()) { for (const f of readdirSync(p)) walk(join(p, f), out, exts); return out; }
  if (exts.includes(extname(p))) out.push(p);
  return out;
}

const css = readFileSync(CSS, 'utf8');
const defined = classNames(css);
const files = ROOTS.flatMap(r => walk(r));
const COMPILED = compiled();

let bad = 0, stripped = 0, used = new Set();
for (const f of files) {
  const html = readFileSync(f, 'utf8');
  for (const m of html.matchAll(/class="([^"]*)"/g)) {
    for (const cls of m[1].split(/\s+/).filter(c => c.startsWith('rux--'))) {
      used.add(cls);
      // strip the responsive-grid escape form (rux--md:col-span-4 -> rux--md\:col-span-4)
      const esc = cls.replace(/:/g, '\\:');
      if (!defined.has(cls) && !defined.has(esc)) {
        console.log(`  UNDEFINED  ${cls.padEnd(42)} ${f}`);
        bad++;
        continue;
      }
      // Owned by nothing = a foundation class from reset, type, grid or layout,
      // which is always compiled. Owned by a commented-out component = stripped.
      const own = owner(cls);
      if (own && !COMPILED.has(own)) {
        console.log(`  STRIPPED   ${cls.padEnd(42)} ${f}  (${own} is not compiled)`);
        stripped++;
      }
    }
  }
}
// Class names in JS live in string literals, so the match is the bare name
// rather than a `class="..."` attribute. Only rux-- names are checked; a state
// hook like `is-visible` is Carbon's own and carries no prefix to find.
const jsFiles = JS_ROOTS.flatMap(r => walk(r, [], ['.js']));
for (const f of jsFiles) {
  for (const m of readFileSync(f, 'utf8').matchAll(/['"`.]((?:rux--)[a-zA-Z0-9_-]+)/g)) {
    const cls = m[1];
    used.add(cls);
    if (!defined.has(cls)) { console.log(`  UNDEFINED  ${cls.padEnd(42)} ${f}`); bad++; continue; }
    const own = owner(cls);
    if (own && !COMPILED.has(own)) {
      console.log(`  STRIPPED   ${cls.padEnd(42)} ${f}  (${own} is not compiled)`);
      stripped++;
    }
  }
}

console.log(`\n  files ${files.length} + ${jsFiles.length} js · classes used ${used.size} · defined in CSS ${defined.size} · undefined ${bad} · stripped ${stripped}`);
process.exit(bad + stripped ? 1 : 0);
