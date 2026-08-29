#!/usr/bin/env node
//
// Is the right glyph in this SLOT? — the half of the icon question check-glyphs
// says is not its job, and the half every icon defect this project shipped was.
//
// FOUR HAVE SHIPPED, all past all sixteen other gates: two chevrons rotated from
// the wrong base glyph; a table sort arrow built from arrow--down where Carbon
// draws ArrowUp, so both sort states pointed the wrong way; and seven form
// `__invalid-icon`s drawing error--filled — a circle with a cross — where Carbon
// draws warning--filled, a circle with an exclamation. The last of those was
// found by this file's own reference on the day it was written.
//
// Every one was a CORRECT symbol referenced from the WRONG slot. check-icons
// asks whether a `<use>` resolves; check-glyphs asks whether the symbol draws
// what its name says. Both answer yes for all four.
//
// THE REFERENCE, and why it is two hops. Carbon's React inlines its icons, so
// the DOM has a path and no name — there is nothing to compare a `<use href>`
// against directly. docs/carbon-slots.json closes that: the icons mode of
// tools/extract/react-dom.js records slot → drawing across all 505 stories, and
// the drawing is resolved to a NAME against @carbon/icons, whose 2,828 files
// hash to 2,823 distinct size+geometry keys. All 69 drawings in our slots
// resolved; the five collisions in the package are aliases.
//
// THE CORROBORATION BAR IS THE WHOLE DIFFERENCE BETWEEN A RULE AND A STORY.
// A slot is enforced only where Carbon drew ONE glyph there in 3 OR MORE
// distinct stories — check-ancestry's MIN_STORIES, for check-ancestry's reason:
// intersecting one occurrence describes that occurrence. Of 40 slots our markup
// shares with Carbon, 25 clear the bar and 19 are enforced after six are
// declined in the reference WITH REASONS, because their glyph is the consumer's
// and not the component's: a side nav icon, a tag's `custom-icon`, a toast whose
// four variants Carbon's stories only rendered one of.
//
// WHAT IT CANNOT SEE, stated because a green run is otherwise easy to over-read:
//   * 24 of our 64 icon slots have no Carbon capture at all — almost all of them
//     invalid and warning states no default story renders. They are reported as
//     UNCOVERED, never as passing. Closing that needs `states` recipes, not a
//     rule change.
//   * a slot Carbon fills from a prop, where there is no right answer to know.
//   * whether the icon is the right SIZE, or positioned correctly, or visible.
//
//   node tools/check-slots.mjs           gate
//   node tools/check-slots.mjs --all     show uncovered and unenforced slots too
//
import { readFileSync } from 'node:fs';
import { markupFiles } from './lib/sources.mjs';

const REF = JSON.parse(readFileSync('docs/carbon-slots.json', 'utf8'));
const { slots, _declined: DECLINED } = REF;
const showAll = process.argv.includes('--all');

const ENFORCED = new Set(Object.entries(slots)
  .filter(([k, v]) => v.rule === 'one glyph in 3+ stories' && !DECLINED[k])
  .map(([k]) => k));

// Slot = the svg's own rux-- classes, or the nearest classed ancestor's. Same
// definition the capture used, or the two sides would not meet.
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr', 'use', 'path', 'circle',
  'rect', 'polygon', 'stop', 'ellipse', 'line']);

function iconSites(html) {
  const src = html.replace(/<!--[\s\S]*?-->/g, '');
  const out = [];
  const stack = [];
  let inSvg = null;
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|[^>"])*?)(\/?)>/g;
  let m;
  while ((m = re.exec(src))) {
    const [, closing, rawTag, attrs, self] = m;
    const tag = rawTag.toLowerCase();
    if (closing) {
      if (tag === 'svg' && inSvg) {
        if (inSvg.use) {
          const slot = inSvg.cls || [...stack].reverse().map(e => e.cls).find(Boolean) || '';
          if (slot) out.push({ slot, use: inSvg.use });
        }
        inSvg = null;
      }
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === tag) { stack.length = i; break; }
      continue;
    }
    const cls = (attrs.match(/\sclass="([^"]*)"/) ?? [, ''])[1]
      .split(/\s+/).filter(c => c.startsWith('rux--')).map(c => c.slice(5)).join('.');
    if (tag === 'use' && inSvg) {
      const h = (attrs.match(/href="#i-([^"]*)"/) ?? [])[1];
      if (h) inSvg.use = h;
    }
    if (tag === 'svg' && !inSvg) inSvg = { cls, use: null };
    if (!(self || VOID.has(tag))) stack.push({ tag, cls });
  }
  return out;
}

const wrong = [], uncovered = new Map(), unenforced = new Map();
let checked = 0;

for (const file of markupFiles()) {
  for (const { slot, use } of iconSites(readFileSync(file.path, 'utf8'))) {
    const ref = slots[slot];
    if (!ref) { push(uncovered, slot, `${use} · ${file.name}`); continue; }
    if (!ENFORCED.has(slot)) { push(unenforced, slot, `${use} · ${file.name}`); continue; }
    checked++;
    if (ref.glyphs.includes(use)) continue;
    wrong.push({ file: file.name, slot, ours: use, carbon: ref.glyphs.join(' / '), ref });
  }
}
function push(map, k, v) { (map.get(k) ?? map.set(k, []).get(k)).push(v); }

for (const w of wrong) {
  console.log(`\n  ${w.file}  ·  ${w.slot}`);
  console.log(`     ours    #i-${w.ours}`);
  console.log(`     Carbon  ${w.carbon}   (one glyph across ${w.ref.corroboration[0]}+ stories)`);
}

if (showAll) {
  console.log(`\n  UNCOVERED — no Carbon capture for this slot, so nothing is claimed either way`);
  for (const [slot, uses] of [...uncovered].sort())
    console.log(`     ${slot}  ${[...new Set(uses.map(u => u.split(' · ')[0]))].join(' ')}`);
  console.log(`\n  RECORDED BUT NOT ENFORCED — Carbon draws more than one glyph here, or too few stories back it`);
  for (const [slot, uses] of [...unenforced].sort())
    console.log(`     ${slot}  ${[...new Set(uses.map(u => u.split(' · ')[0]))].join(' ')}  ·  ${slots[slot].rule}`);
}

console.log(`\n  ${ENFORCED.size} enforced slots · ${checked} icon sites checked · ${wrong.length} wrong glyph`);
console.log(`  ${uncovered.size} of our slots have no Carbon capture and are NOT claimed to pass`
  + ` · ${unenforced.size} captured but under the bar${showAll ? '' : ' — `--all` lists both'}`);
console.log();
process.exit(wrong.length ? 1 : 0);
