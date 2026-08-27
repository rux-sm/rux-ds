#!/usr/bin/env node
//
// Every rux-- class used in HTML must resolve to a rule in the built CSS.
// A renamed or mistyped class is not a build error, not a type error, and not a
// test failure — it silently loses its styling. This is the only thing that catches it.
//
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const CSS = 'css/rux.css';
const ROOTS = ['kitchen-sink.html', 'templates'];

function walk(p, out = []) {
  if (!statSync(p, { throwIfNoEntry: false })) return out;
  if (statSync(p).isDirectory()) { for (const f of readdirSync(p)) walk(join(p, f), out); return out; }
  if (['.html'].includes(extname(p))) out.push(p);
  return out;
}

const css = readFileSync(CSS, 'utf8');
const defined = new Set(css.match(/\.rux--[a-zA-Z0-9_-]+/g)?.map(s => s.slice(1)) ?? []);
const files = ROOTS.flatMap(r => walk(r));

let bad = 0, used = new Set();
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
      }
    }
  }
}
console.log(`\n  files ${files.length} · classes used ${used.size} · defined in CSS ${defined.size} · undefined ${bad}`);
process.exit(bad ? 1 : 0);
