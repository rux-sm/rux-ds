// The page builder's transformations — the ONE place a template becomes a
// page. Pure ES module, no imports, so the browser (builder/builder.js) and
// node (tools/check-parity.mjs) run the same code. Roadmap §4.12, creator 3.
//
// exportPage() MUST REPRODUCE tools/new-project.sh:189-200 BYTE FOR BYTE,
// including sed's semantics: an expression without /g replaces the FIRST
// match on each line, one with /g replaces every match, and `^` anchors a
// line. The awk step prints the two project stylesheet links after EVERY line
// matching the vendored overrides link — templates carry one, so one pair is
// inserted; the loop mirrors awk rather than assuming. check-parity runs the
// script and diffs; when the two disagree, someone decides which is right, and
// that is the point of having the check rather than a promise.
//
// previewPage() is the same page pointed at this repository's own css/, js/,
// assets/ and brand/ (builder.html sits at the root, so `../` would climb
// out; and the preview is a blob: document with no path of its own, so a
// relative reference does not merely climb out — it fails to resolve), with
// one preview-only script placed BEFORE js/theme.js: it sandboxes the
// rux.profile key so the preview shows the theme being configured rather than
// whatever the reader last chose in the sink — js/theme.js writes the stored
// theme over data-theme before first paint, and a same-origin iframe shares
// that storage. The export never carries the shim.

// Every marker line an inserted block gets, and the provenance comment above
// it, are composed by the builder; nothing here invents markup.

const firstPerLine = (lines, from, to) => lines.map(l => l.replace(from, to));
const everywhere = (lines, from, to) => lines.map(l => l.split(from).join(to));

// The four content substitutions the script makes, steps 6–9.
function content(lines, a) {
  const P = a.prefix ?? 'Rux', N = a.name ?? 'DS', T = a.title ?? `${P} ${N}`, theme = a.theme ?? 'white';
  return lines.map(l => {
    if (l.startsWith('<html lang="en" data-theme="white">')) l = l.replace('<html lang="en" data-theme="white">', `<html lang="en" data-theme="${theme}">`);
    l = l.replace(/<title>[^<]*<\/title>/, `<title>${T}</title>`);
    l = l.replace('name--prefix">Rux</span>&nbsp;DS', `name--prefix">${P}</span>&nbsp;${N}`);
    l = l.split('aria-label="Rux DS"').join(`aria-label="${P} ${N}"`);
    return l;
  });
}

// What tools/new-project.sh writes for a template and these answers.
export function exportPage(templateHtml, answers = {}) {
  let lines = templateHtml.split('\n');
  lines = firstPerLine(lines, '"../css/rux.css"', '"vendor/rux-ds/css/rux.css"');
  lines = firstPerLine(lines, '"../css/rux-theme.css"', '"vendor/rux-ds/css/rux-theme.css"');
  lines = firstPerLine(lines, '"../css/rux-overrides.css"', '"vendor/rux-ds/css/rux-overrides.css"');
  // brand/ is the PROJECT'S, not the pin's: the script seeds logo.svg beside
  // the page and never overwrites it, so the path must not point into
  // vendor/, which every pin move replaces. Placed here because that is where
  // the script's own -e sits, and this function reproduces it line for line.
  lines = everywhere(lines, '"../brand/', '"brand/');
  lines = everywhere(lines, '"../assets/', '"vendor/rux-ds/assets/');
  lines = everywhere(lines, '"../js/', '"vendor/rux-ds/js/');
  lines = content(lines, answers);
  const out = [];
  for (const l of lines) {
    out.push(l);
    if (l.includes('href="vendor/rux-ds/css/rux-overrides.css"')) {
      out.push('<link rel="stylesheet" href="rux-theme.css">', '<link rel="stylesheet" href="rux-overrides.css">');
    }
  }
  return out.join('\n');
}

// The storage sandbox, inline, before js/theme.js. Only the profile key is
// intercepted; everything else the page might store behaves as it would.
const SHIM = `<script>/* preview only — not in the export */(()=>{const K='rux.profile',m=new Map(),P=Storage.prototype,g=P.getItem,s=P.setItem,r=P.removeItem;P.getItem=function(k){return k===K?(m.has(K)?m.get(K):null):g.call(this,k)};P.setItem=function(k,v){k===K?m.set(K,String(v)):s.call(this,k,v)};P.removeItem=function(k){k===K?m.delete(K):r.call(this,k)}})();</script>`;

// The same page, served from this repository, for the preview iframe.
// `root` is '' for a srcdoc preview (relative to builder.html's own URL) or an
// absolute URL prefix for a Blob-URL one.
export function previewPage(templateHtml, answers = {}, root = '') {
  let lines = templateHtml.split('\n');
  lines = firstPerLine(lines, '"../css/rux.css"', `"${root}css/rux.css"`);
  lines = firstPerLine(lines, '"../css/rux-theme.css"', `"${root}css/rux-theme.css"`);
  lines = firstPerLine(lines, '"../css/rux-overrides.css"', `"${root}css/rux-overrides.css"`);
  lines = everywhere(lines, '"../brand/', `"${root}brand/`);
  lines = everywhere(lines, '"../assets/', `"${root}assets/`);
  lines = everywhere(lines, '"../js/', `"${root}js/`);
  lines = content(lines, answers);
  const out = [];
  for (const l of lines) {
    if (l.includes(`src="${root}js/theme.js"`)) out.push(SHIM);
    out.push(l);
  }
  return out.join('\n');
}

// Just the composed body, for pasting into a page that already has a shell.
export function bodyOnly(pageHtml) {
  const m = pageHtml.match(/<main\b[\s\S]*?<\/main>/);
  return m ? m[0] : '';
}

// A template with each slot's interior rebuilt from its record and the blocks
// named in it — unedited, this is the template itself, which is what the
// round trip proves. `byName` maps block name → { open, html, close }.
export function compose(templateHtml, slots, byName) {
  let html = templateHtml;
  // Replace from the last slot backwards so earlier offsets stay valid.
  for (const s of [...slots].sort((a, b) => b.start - a.start)) {
    const built = s.pre + s.blocks.map((n, i) => (i ? s.gaps[i - 1] : '') + byName[n].open + byName[n].html + byName[n].close).join('') + s.post;
    html = html.slice(0, s.start) + built + html.slice(s.end);
  }
  return html;
}

// ──────────────────────────────────────────────────────────────────────────
// TEXT FIELDS — which text in a block a person may edit, and how an edit is
// written back. Pure string logic with no DOM dependency, so the browser and
// node run it identically, like everything else here.
//
// WHY A TOKENIZER AND NOT A REGEX. A flat `<tag>TEXT</tag>` match is lossless
// on write but has no idea what a comment, a <script>/<style> body or SVG
// descendant text is — and this repository's own comments routinely contain
// literal tag examples. Those would be offered as editable fields, and worse,
// would shift the recorded offsets of the real ones. So the string is walked
// once with an explicit open-element stack, and the ancestor test below is a
// real ancestor walk rather than a fixed-width lookback.
//
// LIMITATION, stated rather than guarded: an attribute value is assumed to
// carry no literal `>`. tools/lib/blocks.mjs's own marker regex already makes
// the same simplifying assumption about this corpus's attested markup.

// Comments and the three opaque bodies are entered and skipped WHOLE: the
// stack is never touched and nothing inside is ever visited. Anything else
// that looks like a tag is a generic open, close or self-closing token.
const TOKEN = /<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script\s*>|<style\b[\s\S]*?<\/style\s*>|<svg\b[\s\S]*?<\/svg\s*>|<\/?[a-zA-Z][^>]*>/g;

// Never pushed, whether or not written with a trailing slash. Every void
// element in this corpus is a BARE tag — `<input id="f-n1" type="checkbox">`
// (templates/form-page.html) is exactly as common as a self-closed `<use/>` —
// and pushing one would wait forever for a close that never comes, corrupting
// every ancestry and leaf test for the rest of the block.
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr']);

// Text a behaviour module owns. Editing it here would either be overwritten at
// runtime or would edit something no reader can see. Traced by grepping every
// `.textContent =` assignment across js/.
const HIDDEN = /rux--visually-hidden|rux--assistive-text/;   // any ancestor
const OWNED_ANCESTOR = /rux--batch-summary__para/;           // js/data-table.js:148
const OWNED_LEAF = /rux--toggle__text|rux--list-box__label|rux--tooltip-content/;

const attrOf = (tag, name) => {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`, 'i'));
  return m ? m[1].replace(/^["']|["']$/g, '') : '';
};

const tagName = (tok, from) => tok.slice(from).replace(/[\s/>][\s\S]*$/, '').toLowerCase();

function excluded(ancestors, leaf) {
  if (OWNED_LEAF.test(leaf.cls)) return true;
  for (const el of [...ancestors, leaf]) {
    if (el.ariaHidden || HIDDEN.test(el.cls) || OWNED_ANCESTOR.test(el.cls)) return true;
  }
  return false;
}

// Every editable text field in `html`, in document order, as [start, end)
// offsets into that exact string, each carrying the lowercased tag name of the
// element holding it so a caller can say WHERE the text sits without parsing
// again. A field is text sitting immediately between
// an element's own open tag and its own matching close tag with NOTHING else
// in between — no nested tag, no comment, no opaque span — and non-empty once
// trimmed. That is "leaf, text-only" derived structurally rather than guessed
// at with a `[^<>]*` pattern, so mixed content (`<p>a <b>b</b> c</p>`) yields
// only the inner `<b>`, which is the known limitation, not a bug.
export function textFieldsOf(html) {
  const fields = [], stack = [];
  TOKEN.lastIndex = 0;
  for (let m; (m = TOKEN.exec(html));) {
    const tok = m[0], top = stack[stack.length - 1];

    // A comment or an opaque body is content, not structure — but it does
    // interrupt whatever holds it, so that element is no longer text-only.
    if (tok.startsWith('<!--') || /^<(script|style|svg)\b/i.test(tok)) {
      if (top) top.interrupted = true;
      continue;
    }

    if (tok.startsWith('</')) {
      const name = tagName(tok, 2);
      let at = -1;
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].name === name) { at = i; break; }
      if (at < 0) { if (top) top.interrupted = true; continue; }   // stray close
      const el = stack[at], wasTop = at === stack.length - 1;
      stack.length = at;                                           // discard anything left open
      if (wasTop && !el.interrupted) {
        const raw = html.slice(el.contentStart, m.index);
        if (raw.trim() !== '' && !excluded(stack, el)) fields.push({ start: el.contentStart, end: m.index, raw, name: el.name });
      }
      continue;
    }

    // An open tag. Whatever holds it now has a child, so it is not text-only.
    if (top) top.interrupted = true;
    const name = tagName(tok, 1);
    if (VOID.has(name) || /\/\s*>$/.test(tok)) continue;
    stack.push({
      name,
      cls: attrOf(tok, 'class'),
      ariaHidden: attrOf(tok, 'aria-hidden') === 'true',
      contentStart: m.index + tok.length,
      interrupted: false,
    });
  }
  return fields;
}

// Only `&`, `<` and `>`. Quotes are left alone: a field is text between tags,
// never inside an attribute, so escaping them would show the entity itself.
const escapeText = s => s.split('&').join('&amp;').split('<').join('&lt;').split('>').join('&gt;');

// `html` with the fields named in `edits` ({ index: text }) replaced, and every
// other byte — self-closing syntax, bare boolean attributes, the indentation
// inside an untouched multiline field — left exactly as it was. The field list
// is always read from the ORIGINAL html, so blanking field 0 can never shift
// field 1's index, and an untouched field is never spliced and so never
// re-escaped.
export function applyTextEdits(html, edits) {
  let out = '', cursor = 0;
  textFieldsOf(html).forEach((f, i) => {
    if (!Object.hasOwn(edits, i)) return;
    out += html.slice(cursor, f.start) + escapeText(String(edits[i]));
    cursor = f.end;
  });
  return out + html.slice(cursor);
}
