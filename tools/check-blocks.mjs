#!/usr/bin/env node
//
// The page builder's gate: every BLOCK and SLOT marker in sink/ and templates/
// is well-formed, every marked region is something a page can actually carry,
// and builder/blocks.json is a verbatim copy of what the markers enclose.
//   node tools/check-blocks.mjs
//
// WHAT IT CHECKS, and what each rule is paid for by:
//
//   paired      BEGIN/END with the same name, no nesting, no orphans, names
//               unique per file, qualified ids unique repo-wide. The END must
//               repeat the name — see tools/lib/blocks.mjs for why.
//   ordered     no marker above the PROVENANCE comment. check-provenance
//               requires PROVENANCE to be the FIRST comment (it faults BURIED),
//               so a marker placed above it fails verify — this names which.
//   hygienic    no `ks-` inside a block: ks-sec, ks-label, ks-row, ks-grid are
//               defined only in sink/harness.css and appear zero times in
//               css/rux.css, so a block carrying one is unstyled on a real
//               page. No inline style= in a SINK block: there it is a demo
//               affordance. Templates are exempt — empty-state's
//               margin-block-start:4rem is attested page markup.
//   resolved    every <use href="#i-…"> names a <symbol> in assets/icons.svg,
//               because a <use> at a missing symbol paints nothing, silently.
//   closed      every aria-controls, aria-labelledby, aria-describedby, for and
//               data-rux-open inside a block points at an id inside the same
//               block. A tabs block includes its panels; a modal block its
//               trigger. href="#…" is NOT checked: a breadcrumb's links point
//               out of the block by design. This is what makes "a block is a
//               whole thing" checkable rather than asserted.
//   current     builder/blocks.json exists, names exactly the blocks the
//               markers enclose, and every `html` equals its source slice byte
//               for byte. Edit a marked region without `npm run blocks` and
//               this is the rule that fails.
//   slotted     in templates/: every BLOCK inside a SLOT, every SLOT inside
//               <main>. Enforced only on files that carry markers; "every
//               template has a slot" arrives with the templates (stage 2).
//
// WHAT IT CANNOT CHECK. Whether the marked region is the RIGHT part of the
// fragment. That is a reading, and the catalogue is grown one reading at a
// time for that reason.
//
// RED RUN: swap two BLOCK:END names; move a marker above PROVENANCE; change one
// byte inside a marked region without rebuilding. Each must fail.
import { readFileSync, existsSync } from 'node:fs';
import { markupFiles } from './lib/sources.mjs';
import { scan, idOf, provenanceIndex, idsIn, refsIn, glyphsIn, markers } from './lib/blocks.mjs';

const MANIFEST = 'builder/blocks.json';
const faults = [];
const symbols = new Set([...readFileSync('assets/icons.svg', 'utf8').matchAll(/<symbol\s+id="([^"]+)"/g)].map(m => m[1]));

const found = new Map();   // id → { block, path }
let files = 0, slotCount = 0;

for (const f of markupFiles(['sink', 'templates'])) {
  const html = readFileSync(f.path, 'utf8');
  const r = scan(html, f.path);
  faults.push(...r.faults);
  if (!r.blocks.length && !r.slots.length && !markers(html).length) continue;
  files++;
  slotCount += r.slots.length;

  const prov = provenanceIndex(html);
  if (prov !== -1) {
    for (const m of markers(html)) if (m.index < prov) {
      faults.push(['ABOVE', `${f.path}:${m.line}`, `${m.kind}:${m.edge} ${m.name ?? ''} sits above the PROVENANCE comment — check-provenance will fault BURIED; move it below`]);
    }
  }

  const mainOpen = html.indexOf('<main');
  const mainClose = html.indexOf('</main>');
  for (const s of r.slots) {
    if (f.root !== 'templates') faults.push(['MISPLACED', `${f.path}:${s.line}`, `SLOT ${s.name} in a sink fragment — slots belong to templates`]);
    else if (mainOpen === -1 || s.start < mainOpen || s.end > mainClose) faults.push(['MISPLACED', `${f.path}:${s.line}`, `SLOT ${s.name} is outside <main> — a slot is a container the page body already has`]);
  }

  for (const b of r.blocks) {
    const id = idOf(f.path, b.name);
    const where = `${f.path}:${b.line}`;
    if (found.has(id)) faults.push(['DUPLICATE', where, `${id} already defined at ${found.get(id).path}`]);
    found.set(id, { block: b, path: f.path });

    if (f.root === 'templates' && !b.slot) faults.push(['UNSLOTTED', where, `BLOCK ${b.name} is not inside a SLOT — a template block must say where it may move`]);

    const ks = b.html.match(/\bks-[a-z]+/);
    if (ks) faults.push(['HARNESS', where, `block ${b.name} carries "${ks[0]}" — defined only in sink/harness.css, unstyled on a real page`]);
    if (f.root === 'sink' && /\sstyle="/.test(b.html)) faults.push(['INLINE STYLE', where, `block ${b.name} carries a style= attribute — a demo affordance, not page markup`]);

    for (const g of glyphsIn(b.html)) if (!symbols.has(g)) faults.push(['UNRESOLVED', where, `block ${b.name} uses #${g} — no <symbol id="${g}"> in assets/icons.svg`]);

    const ids = idsIn(b.html);
    for (const ref of refsIn(b.html)) if (!ids.has(ref.id)) {
      faults.push(['OPEN', `${f.path}:${b.line + ref.line - 1}`, `block ${b.name}: ${ref.attr}="${ref.id}" points outside the block — include the target or the block is not a whole thing`]);
    }
  }
}

if (!existsSync(MANIFEST)) {
  faults.push(['NO MANIFEST', MANIFEST, `not found — run \`npm run blocks\``]);
} else {
  let manifest;
  try { manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')); }
  catch (e) { faults.push(['UNREADABLE', MANIFEST, e.message]); }
  if (manifest) {
    const listed = new Map(manifest.blocks.map(b => [b.id, b]));
    for (const [id, { block, path }] of found) {
      const m = listed.get(id);
      if (!m) faults.push(['STALE', MANIFEST, `${id} is marked in ${path} but not in the manifest — run \`npm run blocks\``]);
      else if (m.html !== block.html) faults.push(['STALE', MANIFEST, `${id} differs from its source region in ${path}:${block.line} — run \`npm run blocks\``]);
    }
    for (const id of listed.keys()) if (!found.has(id)) faults.push(['STALE', MANIFEST, `${id} is in the manifest but no longer marked — run \`npm run blocks\``]);
  }
}

for (const [tag, where, why] of faults) {
  console.log(`  ${tag.padEnd(13)}${where}`);
  console.log(`  ${''.padEnd(13)}${why}`);
}
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
console.log(`  check-blocks: ${plural(found.size, 'block')} in ${plural(files, 'file')} · ${plural(slotCount, 'slot')} · ${plural(faults.length, 'fault')}`);
console.log('  This says every marked region is well-formed, closed and copied exactly. It does not say it is the right region.');
process.exit(faults.length ? 1 : 0);
