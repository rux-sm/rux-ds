#!/usr/bin/env node
//
// What does a candidate component set actually cost?
//
// Roadmap §2 cites this file and Phase 2 is where it was owed. It exists because
// the inventory's per-component sizes CANNOT be added up: §2 measured the sum at
// 3,534 KB against a real 837 KB bundle, a 4.2x overcount, because every
// component drags its transitive `@use` graph and the graphs overlap heavily.
// The only honest way to price a subset is to compile that subset.
//
// It also settles the one number §2.1 admits is a hypothesis — "≤40 KB gzipped
// for ~24 components and 2 themes" — and §5 asks to "record the floor you
// actually hit" rather than defend the estimate.
//
//   node tools/measure.mjs                       full vs the proposed keep-set
//   node tools/measure.mjs button tag link       an ad-hoc set
//   node tools/measure.mjs --themes 1 <names…>   with a different theme count
//
// Dependencies are NOT resolved for you. A set that names `dropdown` without
// `list-box` compiles anyway, because Sass pulls the dependency in whether or
// not the manifest lists it — so the measured size is honest while the NAMED
// set is short. Read the reported "pulled in unnamed" line: it is the list of
// components a strip would keep by accident.
//
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const COMP_DIR = 'node_modules/@carbon/styles/scss/components';
const ALL = readdirSync(COMP_DIR).filter(d => !d.startsWith('_')).sort();
const inv = JSON.parse(readFileSync('docs/inventory.json', 'utf8'));
const DEPS = Object.fromEntries(inv.components.filter(c => !c.error).map(c => [c.component, c.depsAll ?? []]));

// Kept in sync with docs/inventory.md — that file argues for this list, and
// changing one means changing both, so the number the document quotes is
// reproducible from the document's own decisions.
const PROPOSED = [
  'accordion', 'breadcrumb', 'button', 'checkbox', 'data-table', 'dropdown',
  'form', 'inline-loading', 'link', 'list', 'list-box', 'loading', 'menu',
  'modal', 'notification', 'number-input', 'overflow-menu', 'pagination',
  'popover', 'radio-button', 'search', 'select', 'skeleton-styles', 'tabs',
  'tag', 'text-area', 'text-input', 'tile', 'toggle', 'tooltip', 'ui-shell',
];

const THEME_NAMES = ['white', 'g10', 'g90', 'g100'];
const work = mkdtempSync(join(tmpdir(), 'ruxds-measure-'));

function build(comps, themeCount) {
  const themes = THEME_NAMES.slice(0, themeCount);
  const src = [
    '@use "@carbon/styles/scss/config" with ($prefix: "rux");',
    '@use "@carbon/styles/scss/theme";',
    '@use "@carbon/styles/scss/themes";',
    '@use "@carbon/styles/scss/reset";',
    '@use "@carbon/styles/scss/type";',
    '@use "@carbon/styles/scss/grid";',
    '@use "@carbon/styles/scss/layout";',
    ...comps.map(c => `@use "@carbon/styles/scss/components/${c}";`),
    '@include reset.reset;',
    '@include type.default-type;',
    `:root { @include theme.theme(themes.$${themes[0]}); }`,
    ...themes.slice(1).map(t => `[data-theme="${t}"] { @include theme.theme(themes.$${t}); }`),
  ].join('\n');
  const f = join(work, 'in.scss'), out = join(work, 'out.css');
  writeFileSync(f, src);
  execFileSync('npx', ['sass', '--load-path=node_modules', '--no-source-map',
    '--style=compressed', f, out], { stdio: ['ignore', 'pipe', 'pipe'] });
  const css = readFileSync(out, 'utf8');
  return { min: css.length, gzip: gzipSync(Buffer.from(css), { level: 9 }).length,
           classes: new Set(css.match(/\.rux--[a-zA-Z0-9_\\:-]+/g) ?? []).size };
}

const argv = process.argv.slice(2);
let themeCount = 2;
const ti = argv.indexOf('--themes');
if (ti !== -1) { themeCount = Number(argv[ti + 1]); argv.splice(ti, 2); }
const adhoc = argv.filter(a => !a.startsWith('-'));

const jobs = adhoc.length
  ? [[`ad-hoc — ${adhoc.length} components, ${themeCount} theme(s)`, adhoc, themeCount]]
  : [['full — 75 components, 4 themes', ALL, 4],
     [`proposed keep — ${PROPOSED.length} components, 2 themes`, PROPOSED, 2],
     [`proposed keep — ${PROPOSED.length} components, 1 theme`, PROPOSED, 1]];

console.log();
for (const [label, comps, themes] of jobs) {
  process.stdout.write(`  ${label.padEnd(46)}`);
  const r = build(comps, themes);
  console.log(`${String(Math.round(r.min / 1024)).padStart(5)} KB min  `
    + `${String(Math.round(r.gzip / 1024)).padStart(4)} KB gzip  ${String(r.classes).padStart(5)} classes`);
  // What Sass pulled in that the set did not name — the accidental keeps.
  const named = new Set(comps);
  const pulled = [...new Set(comps.flatMap(c => DEPS[c] ?? []))].filter(d => !named.has(d)).sort();
  if (pulled.length) console.log(`  ${''.padEnd(46)}pulled in unnamed: ${pulled.join(' ')}`);
}
rmSync(work, { recursive: true, force: true });
console.log();
