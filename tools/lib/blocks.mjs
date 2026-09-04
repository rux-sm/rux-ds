// Marker grammar for page blocks and template slots. Read by
// tools/build-blocks.mjs (writes builder/blocks.json), tools/check-blocks.mjs
// (the gate) and, through the manifest, builder.html. One parser, so the writer
// and the checker cannot disagree about where a block starts — which is why
// this file is in CONTROL_FILES beside lib/token-values.mjs.
//
//   <!-- BLOCK:BEGIN name=basic label="Data table" -->
//   …one complete attested specimen…
//   <!-- BLOCK:END basic -->
//
//   <!-- BLOCK:BEGIN name=pagination label="Pagination" follows=table -->
//   `follows` pins a block to the one before it: the builder keeps them
//   adjacent and removes them together. table-page's pagination is that case —
//   it sits OUTSIDE the heading stack by design, so the two cannot be one
//   region, and adjacency is what keeps a pager under its table.
//
//   <!-- SLOT:BEGIN name=body -->  …blocks and blank lines…  <!-- SLOT:END body -->
//
// THE CLOSING MARKER REPEATS THE NAME. SPRITE:END gets away without one because
// a file carries one sprite; a fragment carries five to nine specimens, and a
// lazy [\s\S]*? would pair BEGIN table with END toolbar and call the result
// well-formed. A mismatched END is a fault here, not a silent wider region.
//
// A BLOCK is a region that can stand as a direct child of a page container — a
// whole component from sink/, or a whole composition from a template's <main>.
// In a template the REPLACE prose a region carries goes INSIDE its block, so
// the explanation travels with the markup and a removed block takes its
// commentary with it. A SLOT is the interior of a container the template
// already has — a stack, a grid column — and holds blocks and blank lines and
// NOTHING ELSE: that is what lets "the frame plus the blocks" reproduce the
// file byte for byte, which check-blocks asserts. Nothing sits inside a block.
// Roadmap §4.12, creator 3.
//
// BYTE RANGES ARE EXACT. A block's `start` is the index after the newline that
// ends its BEGIN line; its `end` is the index where its END line begins. So
// `html` is whole lines, each newline-terminated, and
//   file === file.slice(0, start) + html + file.slice(end)
// holds by construction. The marker lines themselves are `open` and `close`
// (outerStart…start and end…outerEnd), so a block's whole footprint is
// open + html + close. A slot records the whitespace before, between and
// after those footprints (`pre`, `gaps`, `post`), and assemble() puts them
// back — which is the byte-exact round trip check-blocks asserts.

const MARK = /<!--\s*(BLOCK|SLOT):(BEGIN|END)\s+([^>]*?)\s*-->/g;
const BEGIN_ARGS = /^name=([a-z][a-z0-9-]*)(?:\s+label="([^"]*)")?(?:\s+follows=([a-z][a-z0-9-]*))?$/;
const END_ARGS = /^([a-z][a-z0-9-]*)$/;

const lineAt = (html, index) => html.slice(0, index).split('\n').length;

// Every marker in document order, with its parsed arguments or a fault.
export function markers(html) {
  const out = [];
  for (const m of html.matchAll(MARK)) {
    const [text, kind, edge, args] = m;
    const parsed = edge === 'BEGIN' ? args.match(BEGIN_ARGS) : args.match(END_ARGS);
    out.push({
      kind, edge, text,
      name: parsed ? parsed[1] : null,
      label: parsed && edge === 'BEGIN' ? (parsed[2] ?? null) : null,
      follows: parsed && edge === 'BEGIN' ? (parsed[3] ?? null) : null,
      index: m.index, after: m.index + text.length,
      line: lineAt(html, m.index),
      malformed: !parsed,
    });
  }
  return out;
}

// The containers a slot sits in, read from the template source above it: the
// nearest enclosing grid column's classes and, inside that, the nearest stack.
// Informational — it is what lets the builder say "this block was attested in
// a col-span-100 column" — and derived from markup this repository writes, so
// it is a lookup, not a parse.
function containerOf(html, index) {
  const before = html.slice(0, index);
  const col = [...before.matchAll(/<div class="([^"]*\brux--css-grid-column\b[^"]*)"/g)].pop();
  const stackAfterCol = col
    ? [...before.slice(col.index).matchAll(/<div class="([^"]*\brux--stack-vertical\b[^"]*)"/g)].pop()
    : null;
  return { column: col ? col[1] : null, stack: stackAfterCol ? stackAfterCol[1] : null };
}

const blank = s => /^\s*$/.test(s);

// Structure and faults for one file. Faults are [TAG, where, why] triples in
// the shape every gate here prints.
export function scan(html, path) {
  const faults = [];
  const blocks = [], slots = [];
  let openBlock = null, openSlot = null;
  const seen = { BLOCK: new Set(), SLOT: new Set() };
  const where = m => `${path}:${m.line}`;

  for (const m of markers(html)) {
    if (m.malformed) {
      faults.push(['MALFORMED', where(m), `${m.text} — expected ${m.kind}:${m.edge} ` +
        (m.edge === 'BEGIN' ? 'name=<a-z0-9-> label="…" [follows=<name>]' : '<name>')]);
      continue;
    }
    if (m.edge === 'BEGIN') {
      if (m.kind === 'BLOCK' && m.label === null) {
        faults.push(['UNLABELLED', where(m), `BLOCK ${m.name} has no label="…" — the builder shows the label, not the name`]);
      }
      if (openBlock) {
        faults.push(['NESTED', where(m), `${m.kind}:BEGIN ${m.name} inside BLOCK ${openBlock.name} — nothing nests in a block`]);
        continue;
      }
      if (m.kind === 'SLOT' && openSlot) {
        faults.push(['NESTED', where(m), `SLOT ${m.name} inside SLOT ${openSlot.name} — slots do not nest`]);
        continue;
      }
      if (seen[m.kind].has(m.name)) {
        faults.push(['DUPLICATE', where(m), `${m.kind} ${m.name} is marked twice in this file — names are unique per file`]);
      }
      seen[m.kind].add(m.name);
      const nl = html.indexOf('\n', m.after);
      const open = { ...m, start: nl === -1 ? html.length : nl + 1, outerStart: html.lastIndexOf('\n', m.index - 1) + 1 };
      if (m.kind === 'BLOCK') openBlock = { ...open, slot: openSlot?.name ?? null };
      else openSlot = { ...open, container: containerOf(html, m.index) };
      continue;
    }
    // END
    const open = m.kind === 'BLOCK' ? openBlock : openSlot;
    if (!open) {
      faults.push(['ORPHAN', where(m), `${m.kind}:END ${m.name} with no open ${m.kind}`]);
      continue;
    }
    if (open.name !== m.name) {
      faults.push(['MISMATCH', where(m), `${m.kind}:END ${m.name} closes ${m.kind}:BEGIN ${open.name} (line ${open.line}) — the END must repeat the name`]);
      continue;
    }
    if (m.kind === 'SLOT' && openBlock) {
      faults.push(['UNCLOSED', where(m), `SLOT ${m.name} ends while BLOCK ${openBlock.name} (line ${openBlock.line}) is open`]);
      continue;
    }
    const lineStart = html.lastIndexOf('\n', m.index - 1) + 1;
    if (m.kind === 'BLOCK') {
      const nlEnd = html.indexOf('\n', m.after);
      const outerEnd = nlEnd === -1 ? html.length : nlEnd + 1;
      blocks.push({ name: open.name, label: open.label, follows: open.follows, line: open.line,
        start: open.start, end: lineStart, outerStart: open.outerStart, outerEnd,
        open: html.slice(open.outerStart, open.start), close: html.slice(lineStart, outerEnd),
        html: html.slice(open.start, lineStart), slot: open.slot });
      openBlock = null;
      continue;
    }
    // A slot closes: its interior is its blocks' whole footprints — marker
    // lines included — and the whitespace around them. The SLOT marker lines
    // themselves are the container's, so `start` is the line after SLOT:BEGIN
    // and `end` the line of SLOT:END.
    const inner = blocks.filter(b => b.slot === open.name);
    const pre = html.slice(open.start, inner[0]?.outerStart ?? lineStart);
    const gaps = inner.slice(1).map((b, i) => html.slice(inner[i].outerEnd, b.outerStart));
    const post = html.slice(inner.at(-1)?.outerEnd ?? open.start, lineStart);
    for (const [what, text] of [['before its first block', pre], ...gaps.map((g, i) => [`between ${inner[i].name} and ${inner[i + 1].name}`, g]), ['after its last block', post]]) {
      if (!blank(text)) {
        const first = text.split('\n').find(l => !blank(l)).trim().slice(0, 60);
        faults.push(['FRAME IN SLOT', where(m), `SLOT ${m.name} carries markup ${what} that is in no block — "${first}…". A slot holds blocks and blank lines only; put the prose inside the block it describes, or move it outside the slot`]);
        break;
      }
    }
    slots.push({ name: open.name, line: open.line, start: open.start, end: lineStart, container: open.container,
      blocks: inner.map(b => b.name), pre, gaps, post });
    openSlot = null;
  }
  if (openBlock) faults.push(['UNCLOSED', `${path}:${openBlock.line}`, `BLOCK ${openBlock.name} has no BLOCK:END ${openBlock.name}`]);
  if (openSlot) faults.push(['UNCLOSED', `${path}:${openSlot.line}`, `SLOT ${openSlot.name} has no SLOT:END ${openSlot.name}`]);

  // `follows` names the block immediately before it in the same slot.
  for (const b of blocks) if (b.follows) {
    const prev = blocks.filter(x => x.slot === b.slot && x.end <= b.start).at(-1);
    if (!prev || prev.name !== b.follows) {
      faults.push(['FOLLOWS', `${path}:${b.line}`, `BLOCK ${b.name} follows=${b.follows}, but the block before it in SLOT ${b.slot ?? '(none)'} is ${prev?.name ?? 'nothing'}`]);
    }
  }
  return { blocks, slots, faults };
}

// Put a slot back together from its record and its blocks — each an object
// with `open`, `html` and `close` — in order. check-blocks compares this
// against the file; the builder uses it verbatim for an unedited page, which
// is what makes the round trip byte-exact.
export function assemble(slot, byName) {
  return slot.pre
    + slot.blocks.map((n, i) => (i ? slot.gaps[i - 1] : '') + byName[n].open + byName[n].html + byName[n].close).join('')
    + slot.post;
}

// The qualified id: sink/table/basic, templates/table-page/table.
export const idOf = (path, name) => `${path.replace(/\.html$/, '')}/${name}`;

// The first PROVENANCE comment's body on one line, for the manifest and for
// the provenance comment the builder writes above every emitted block.
export function provenanceOf(html) {
  const m = html.match(/<!--\s*(PROVENANCE:[\s\S]*?)-->/);
  return m ? m[1].replace(/\s+/g, ' ').trim() : null;
}

// Index of the PROVENANCE comment, so a marker placed above it can be named.
// check-provenance faults BURIED when PROVENANCE is not the first comment;
// this lets check-blocks say which marker did it rather than leave the reader
// to find out from a different gate.
export const provenanceIndex = html => {
  const m = html.match(/<!--\s*PROVENANCE:/);
  return m ? m.index : -1;
};

// Ids and references inside one region. `href="#…"` is deliberately NOT a
// reference here: a breadcrumb's or an error page's link points OUT of the
// block by design, so it is navigation, not a control relation. It IS in the
// rewrite list an inserted instance gets, so an in-block anchor follows its
// target when ids are suffixed.
export const REF_ATTRS = ['aria-controls', 'aria-labelledby', 'aria-describedby', 'for', 'data-rux-open'];

export function idsIn(html) {
  return new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
}

export function refsIn(html) {
  const out = [];
  for (const attr of REF_ATTRS) {
    for (const m of html.matchAll(new RegExp(`\\s${attr}="([^"]+)"`, 'g'))) {
      for (const id of m[1].trim().split(/\s+/)) out.push({ attr, id, line: lineAt(html, m.index) });
    }
  }
  return out;
}

export const glyphsIn = html => [...html.matchAll(/<use\s+href="#(i-[^"]+)"/g)].map(m => m[1]);
