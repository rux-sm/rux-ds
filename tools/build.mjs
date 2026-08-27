#!/usr/bin/env node
//
// rux-ds build. Compiles src/app.scss, then applies the one transform Carbon's
// own configuration cannot: see NOTE below.
//
// Written in Node rather than sed deliberately. `sed -i` needs `-i ''` on BSD and
// `-i` with the suffix attached on GNU, and neither parses the other's form.
//
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const SRC = 'src/app.scss';
const OUT = 'css/rux.css';
const MIN = 'css/rux.min.css';

// NOTE — the one unavoidable post-transform.
// @carbon/grid hardcodes its custom properties as literal `--cds-grid-*` strings
// (node_modules/@carbon/grid/scss/_css-grid.scss:43 and following). $prefix governs
// grid's class names but never these, so configuration alone cannot fix it.
//
// Safe because the tokens are self-contained: declared and consumed only within
// grid's own rules, referenced by no component in @carbon/styles. Verified
// 2026-08-26 — 8 names, 125 declarations, 20 var() references, zero component hits.
// verify() below re-proves the containment on every build rather than trusting this.
const GRID_TOKEN = /--cds-grid-/g;

function sass(out, extra = []) {
  execFileSync('npx', ['sass', '--load-path=node_modules', '--no-source-map', ...extra, SRC, out],
    { stdio: ['ignore', 'inherit', 'inherit'] });
}

function verify(css, label) {
  const leaks = css.match(/cds/g);
  if (leaks) {
    console.error(`\n  FAIL (${label}): ${leaks.length} 'cds' occurrences survived.`);
    const names = [...new Set(css.match(/[-.a-z0-9]*cds[-a-z0-9]*/g) ?? [])];
    console.error(`  names: ${names.slice(0, 10).join(', ')}`);
    process.exit(1);
  }
}

function kb(n) { return `${(n / 1024).toFixed(0)} KB`; }

for (const [out, extra] of [[OUT, []], [MIN, ['--style=compressed']]]) {
  sass(out, extra);
  const css = readFileSync(out, 'utf8').replace(GRID_TOKEN, '--rux-grid-');
  writeFileSync(out, css);
  verify(css, out);
}

const raw = readFileSync(OUT, 'utf8');
const min = readFileSync(MIN);
const tokens = new Set(raw.match(/--rux-[a-z0-9-]+/g) ?? []).size;
const classes = new Set(raw.match(/\.rux--[a-z0-9-]+/g) ?? []).size;
const comps = (readFileSync(SRC, 'utf8').match(/^@use "@carbon\/styles\/scss\/components\//gm) ?? []).length;

console.log(`
  components   ${comps}
  tokens       ${tokens} unique --rux-*
  classes      ${classes} unique .rux--*
  cds leakage  none

  unminified   ${kb(statSync(OUT).size)}
  minified     ${kb(min.length)}
  gzipped      ${kb(gzipSync(min, { level: 9 }).length)}
`);
