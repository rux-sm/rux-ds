#!/usr/bin/env node
//
// Every <use> in a shipped fragment must point at a symbol the sprite carries.
//
// @carbon/styles ships no icons (roadmap §4.1.3), so a component whose visual
// identity IS an icon draws it out of assets/icons.svg through a
// <use href="#i-name">. A <use> whose target does not exist is VALID SVG that
// paints nothing — no parse error, no console warning, no failed request,
// just an empty box the size of the icon that should be there.
//
// THIS IS THE HOLE df5273f FELL INTO. sink/table.html pointed both data-table
// row expanders at #i-chevron--left, a name that had never been in icons.mjs's
// list, so the sprite carried no such symbol. Expandable rows shipped with a
// blank expander cell for as long as the fragment had existed, and all ten
// gates passed the whole time: check-classes reads class attributes, and an
// href target is not a class.
//
// WHAT IT CHECKS
//
//   unresolved  a <use> in sink/*.html whose #target no <symbol> defines
//   external    a <use> pointing outside this document, which the committed
//               sprite exists specifically to avoid needing
//   malformed   a <use> carrying no href at all
//   stale       assets/icons.svg disagreeing with icons.mjs's ICONS list — a
//               name added or removed without re-running the quarry, which
//               leaves the committed sprite lying about what it holds
//
// WHAT IT IS BLIND TO: WHICH GLYPH IS RIGHT. This can prove #i-chevron--left
// resolves. It cannot know the row expander wanted #i-chevron--right, which is
// the second defect that shipped in the same cell — the rotation turned a left
// chevron the right way round for the wrong reason, and the bottom-border rule
// hanging off the same attribute gave it away instead. Two defects, one cell,
// and this gate closes exactly one of them. The other still needs a person
// opening the page, or a diff against the captures in docs/. Roadmap §4.5
// keeps that decision open, and this tool does not close it.
//
// COMMENTS ARE STRIPPED BEFORE SCANNING. sink/deferred/icon-indicator.html
// explains the shadow-tree problem in prose that contains a literal
// `<use href="#symbol">`, and a scanner reading it reports a missing symbol
// called "symbol" that nobody ever wrote. check-provenance reads comments on
// purpose; this one must not.
//
// UNUSED SYMBOLS ARE A NOTE, NOT A FAULT. Thirty-two of the fifty-eight belong
// to components that are CUT or DEFERRED, or to states the sink does not demo.
// A gate failing on those would be red today with no action available, and a
// red gate nobody can turn green gets bypassed — the same reasoning
// check-provenance records for `inferred`.
//
// DEFERRED FRAGMENTS ARE COUNTED, NOT ENFORCED. sink/deferred/*.html is not
// shipped and its icons are deliberately not quarried. README calls restoring
// one a three-line operation; when one of its icons is missing from the sprite
// this names the fourth line, before the restored component renders blank.
//
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SINK = 'sink';
const DEFERRED = join(SINK, 'deferred');
const SPRITE = 'assets/icons.svg';
const QUARRY = 'tools/icons.mjs';

const strip = html => html.replace(/<!--[\s\S]*?-->/g, '');

// Every <use> in a file, with the line it sits on, comments removed first.
function usesIn(path) {
  const text = strip(readFileSync(path, 'utf8'));
  const found = [];
  for (const m of text.matchAll(/<use\b[^>]*>/g)) {
    const line = text.slice(0, m.index).split('\n').length;
    const href = m[0].match(/\b(?:xlink:)?href\s*=\s*"([^"]*)"/);
    found.push({ path, line, tag: m[0], href: href?.[1] ?? null });
  }
  return found;
}

const htmlIn = dir => existsSync(dir)
  ? readdirSync(dir).filter(f => f.endsWith('.html')).sort().map(f => join(dir, f))
  : [];

// ── the sprite, and the list it is supposed to have been built from ────────
if (!existsSync(SPRITE)) {
  console.log(`\n  NO SPRITE   ${SPRITE} is missing — run \`npm run icons\`\n`);
  process.exit(1);
}
const sprite = readFileSync(SPRITE, 'utf8');
const symbols = [...sprite.matchAll(/<symbol\s+id="([^"]+)"/g)].map(m => m[1]);
const defined = new Set(symbols);

// icons.mjs is a script that writes the sprite on import, so its list is read
// as text rather than imported. It is also the only readable source of truth on
// a fresh clone: @carbon/icons is a gitignored quarry that may not be present.
const quarry = readFileSync(QUARRY, 'utf8');
const listBody = quarry.match(/const ICONS = \[([\s\S]*?)\n\];/)?.[1] ?? '';
const listed = [...listBody.replace(/\/\/[^\n]*/g, '').matchAll(/'([^']+)'/g)]
  .map(m => `i-${m[1]}`);

const faults = [];

for (const name of listed) if (!defined.has(name)) {
  faults.push(['STALE', QUARRY, `${name} is listed but not in the sprite — run \`npm run icons\`` +
    ` (if it reports NOT FOUND, the name is not one @carbon/icons has)`]);
}
for (const name of symbols) if (!listed.includes(name)) {
  faults.push(['STALE', SPRITE, `${name} is in the sprite but not listed in ${QUARRY} — run \`npm run icons\``]);
}

// ── every <use> the shipped sink makes ─────────────────────────────────────
const shipped = htmlIn(SINK).flatMap(usesIn);
const used = new Set();

for (const u of shipped) {
  if (u.href === null) {
    faults.push(['MALFORMED', `${u.path}:${u.line}`, `<use> with no href — it can only paint nothing`]);
    continue;
  }
  if (!u.href.startsWith('#')) {
    faults.push(['EXTERNAL', `${u.path}:${u.line}`, `href="${u.href}" leaves the document;` +
      ` the sprite is committed so the sink never fetches an icon`]);
    continue;
  }
  const id = u.href.slice(1);
  used.add(id);
  if (!defined.has(id)) {
    faults.push(['UNRESOLVED', `${u.path}:${u.line}`, `#${id} — no <symbol id="${id}"> in ${SPRITE}.` +
      ` Valid SVG, paints nothing. Add "${id.replace(/^i-/, '')}" to ${QUARRY} and run \`npm run icons\``]);
  }
}

// ── notes: neither of these fails the gate ─────────────────────────────────
const unused = symbols.filter(s => !used.has(s));
const deferredMissing = [...new Set(
  htmlIn(DEFERRED).flatMap(usesIn)
    .filter(u => u.href?.startsWith('#') && !defined.has(u.href.slice(1)))
    .map(u => u.href.slice(1)),
)].sort();

const flags = new Set(process.argv.slice(2));
if (flags.has('--unused')) { console.log(unused.join('\n')); process.exit(0); }
if (flags.has('--deferred')) { console.log(deferredMissing.join('\n')); process.exit(0); }

for (const [tag, where, why] of faults) {
  console.log(`  ${tag.padEnd(12)}${where}`);
  console.log(`  ${''.padEnd(12)}${why}`);
}

const files = htmlIn(SINK).length;
console.log(`\n  ${shipped.length} <use> in ${files} fragments · ${symbols.length} symbols` +
  ` · ${used.size} used · ${faults.length} ${faults.length === 1 ? 'fault' : 'faults'}`);
if (unused.length) {
  console.log(`  ${unused.length} symbols with no shipped user — CUT, DEFERRED or undemoed; \`--unused\` lists them`);
}
if (deferredMissing.length) {
  console.log(`  sink/deferred references ${deferredMissing.length} symbols the sprite does not carry` +
    ` — \`--deferred\` lists them, and restoring one means adding them first`);
}
console.log();
process.exit(faults.length ? 1 : 0);
