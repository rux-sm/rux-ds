#!/usr/bin/env node
//
// Per-component inventory: compiles each component alone against the same
// foundations as src/app.scss, and records the classes and size it contributes
// over that baseline.
//
// Serves Phase 1 (markup needs the real class vocabulary) and Phase 2 (the
// KEEP/CUT/DEFER inventory). Writes docs/inventory.json.
//
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const COMP_DIR = 'node_modules/@carbon/styles/scss/components';
const comps = readdirSync(COMP_DIR).filter(d => !d.startsWith('_') && !d.startsWith('__')).sort();
const work = mkdtempSync(join(tmpdir(), 'ruxds-inv-'));

const FOUNDATION = [
  '@use "@carbon/styles/scss/config" with ($prefix: "rux");',
  '@use "@carbon/styles/scss/theme";',
  '@use "@carbon/styles/scss/themes";',
  '@use "@carbon/styles/scss/type";',
  '@use "@carbon/styles/scss/layout";',
].join('\n');
const EMIT = ':root { @include theme.theme(themes.$white); }';

function compile(name, extra) {
  const f = join(work, `${name}.scss`);
  writeFileSync(f, `${FOUNDATION}\n${extra}\n${EMIT}\n`);
  const out = join(work, `${name}.css`);
  execFileSync('npx', ['sass', '--load-path=node_modules', '--no-source-map',
    '--style=compressed', f, out], { stdio: ['ignore', 'pipe', 'pipe'] });
  return readFileSync(out, 'utf8');
}

const classesOf = css => new Set(css.match(/\.rux--[a-zA-Z0-9_\\:-]+/g)?.map(s => s.slice(1)) ?? []);

process.stdout.write('  baseline… ');
const base = compile('__base', '');
const baseClasses = classesOf(base);
console.log(`${baseClasses.size} classes, ${(base.length / 1024).toFixed(0)} KB`);

const rows = [];
for (const c of comps) {
  process.stdout.write(`  ${c.padEnd(22)}`);
  try {
    const css = compile(c, `@use "@carbon/styles/scss/components/${c}";`);
    const own = [...classesOf(css)].filter(x => !baseClasses.has(x)).sort();
    rows.push({ component: c, classes: own, classCount: own.length,
                minBytes: css.length - base.length,
                gzipBytes: gzipSync(Buffer.from(css), { level: 9 }).length - gzipSync(Buffer.from(base), { level: 9 }).length });
    console.log(`${String(own.length).padStart(4)} classes  ${String(Math.round((css.length - base.length) / 1024)).padStart(4)} KB`);
  } catch (e) {
    rows.push({ component: c, error: String(e.message).split('\n')[0] });
    console.log('  FAILED');
  }
}
rmSync(work, { recursive: true, force: true });
writeFileSync('docs/inventory.json', JSON.stringify({ generated: new Date().toISOString().slice(0, 10), baselineClasses: [...baseClasses].sort(), components: rows }, null, 1));
console.log(`\n  ${rows.filter(r => !r.error).length}/${comps.length} components -> docs/inventory.json`);
