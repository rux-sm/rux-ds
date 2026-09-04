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
//   <!-- SLOT:BEGIN name=body -->  …blocks…  <!-- SLOT:END body -->
//
// THE CLOSING MARKER REPEATS THE NAME. SPRITE:END gets away without one because
// a file carries one sprite; a fragment carries five to nine specimens, and a
// lazy [\s\S]*? would pair BEGIN table with END toolbar and call the result
// well-formed. A mismatched END is a fault here, not a silent wider region.
//
// A BLOCK is a region that can stand as a direct child of a page's stack — a
// whole component from sink/, or a whole composition from a template's <main>.
// A SLOT is a container a template already has, where blocks may be placed.
// Blocks sit in slots; nothing sits inside a block. Roadmap §4.12, creator 3.
//
// BYTE RANGES ARE EXACT. A block's `start` is the index after the newline that
// ends its BEGIN line; its `end` is the index where its END line begins. So
// `html` is whole lines, each newline-terminated, and
//   file === file.slice(0, start) + html + file.slice(end)
// holds by construction. That is what lets check-blocks assert the manifest is
// a verbatim copy rather than a near one.

const MARK = /<!--\s*(BLOCK|SLOT):(BEGIN|END)\s+([^>]*?)\s*-->/g;
const BEGIN_ARGS = /^name=([a-z][a-z0-9-]*)(?:\s+label="([^"]*)")?$/;
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
      index: m.index, after: m.index + text.length,
      line: lineAt(html, m.index),
      malformed: !parsed,
    });
  }
  return out;
}

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
        (m.edge === 'BEGIN' ? 'name=<a-z0-9-> label="…"' : '<name>')]);
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
      const open = { ...m, start: nl === -1 ? html.length : nl + 1 };
      if (m.kind === 'BLOCK') openBlock = { ...open, slot: openSlot?.name ?? null };
      else openSlot = open;
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
    const entry = { name: open.name, label: open.label, line: open.line, start: open.start, end: lineStart, html: html.slice(open.start, lineStart) };
    if (m.kind === 'BLOCK') { blocks.push({ ...entry, slot: open.slot }); openBlock = null; }
    else { slots.push({ ...entry, blocks: blocks.filter(b => b.slot === open.name).map(b => b.name) }); openSlot = null; }
  }
  if (openBlock) faults.push(['UNCLOSED', `${path}:${openBlock.line}`, `BLOCK ${openBlock.name} has no BLOCK:END ${openBlock.name}`]);
  if (openSlot) faults.push(['UNCLOSED', `${path}:${openSlot.line}`, `SLOT ${openSlot.name} has no SLOT:END ${openSlot.name}`]);
  return { blocks, slots, faults };
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

// Ids and references inside one block. `href="#…"` is deliberately NOT a
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
