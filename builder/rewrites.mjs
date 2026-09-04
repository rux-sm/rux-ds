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
// previewPage() is the same page pointed at this repository's own css/, js/
// and assets/ (builder.html sits at the root, so `../` would climb out), with
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
