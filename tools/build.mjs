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
import { classNames, compiled } from './lib/ownership.mjs';

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

// THE ATTRIBUTION BANNER. Apache-2.0 section 4(c) asks a redistributor to retain the
// copyright and attribution notices from the source form, and section 4(b) to mark
// changed files. Carbon's Sass carries `// Copyright IBM Corp.` headers on every
// partial — and Sass STRIPS `//` comments, so before 2026-08-29 the built stylesheet
// carried none of them. css/rux.css is committed and served from a raw URL by design
// (roadmap section 8.1), which is distribution, so the notice has to be put back here.
//
// It goes AFTER `@charset`, which only takes effect as the very first thing in the
// file. `/*!` rather than `/*` so a minifier treats it as a loud comment and keeps it.
//
// IT MUST NOT CONTAIN THE THREE LETTERS verify() LOOKS FOR. "Carbon Design System"
// does not; a phrase naming the old prefix would fail the build, and that is correct
// behaviour rather than an obstacle.
const BANNER = `/*!
 * rux-ds — a framework-free design system derived from the Carbon Design System
 * by subtraction. Not endorsed by or affiliated with IBM.
 *
 * Copyright 2026 rux
 * Licensed under the Apache License, Version 2.0. See LICENSE.
 *
 * Contains rules compiled from @carbon/styles, with the class and custom-property
 * prefix changed at build time, the component set reduced, and two of four themes
 * kept:
 *   Carbon Design System, Copyright IBM Corp. 2015, 2026
 *   Licensed under the Apache License, Version 2.0
 *
 * Carbon's own Sass headers do not survive compilation. See NOTICE.
 */
`;

// After @charset, which must lead the file to have any effect.
function brand(css) {
  const m = css.match(/^@charset[^;]*;\n?/);
  return m ? m[0] + BANNER + css.slice(m[0].length) : BANNER + css;
}

function kb(n) { return `${(n / 1024).toFixed(0)} KB`; }

for (const [out, extra] of [[OUT, []], [MIN, ['--style=compressed']]]) {
  sass(out, extra);
  const css = brand(readFileSync(out, 'utf8').replace(GRID_TOKEN, '--rux-grid-'));
  writeFileSync(out, css);
  // Scans the banner too, deliberately: a notice that named the old prefix would be a
  // build failure rather than a comment nobody reads.
  verify(css, out);
}

const raw = readFileSync(OUT, 'utf8');
const min = readFileSync(MIN);
const tokens = new Set(raw.match(/--rux-[a-z0-9-]+/g) ?? []).size;
const classes = classNames(raw).size;
// Unique component names — data-table is four @use lines and one component.
const comps = compiled().size;

console.log(`
  components   ${comps}
  tokens       ${tokens} unique --rux-*
  classes      ${classes} unique .rux--*
  cds leakage  none
  attribution  banner + NOTICE

  unminified   ${kb(statSync(OUT).size)}
  minified     ${kb(min.length)}
  gzipped      ${(gzipSync(min, { level: 9 }).length / 1024).toFixed(1)} KB
`);
