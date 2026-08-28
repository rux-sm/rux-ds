#!/usr/bin/env node
//
// Assembles kitchen-sink.html from sink/*.html fragments.
//
// One fragment per component keeps 75 sections editable in isolation and keeps the
// nav in sync automatically — a hand-maintained nav for 75 entries drifts the first
// time a section is renamed.
//
// Order comes from sink/ORDER; anything not listed there is appended alphabetically
// and reported, so a new fragment can never be silently invisible.
//
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const frags = readdirSync('sink').filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, ''));
const order = existsSync('sink/ORDER')
  ? readFileSync('sink/ORDER', 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'))
  : [];
const known = order.filter(o => frags.includes(o));
const extra = frags.filter(f => !order.includes(f)).sort();
if (extra.length) console.log(`  not in sink/ORDER, appended: ${extra.join(' ')}`);
const missing = order.filter(o => !frags.includes(o));
if (missing.length) console.log(`  in ORDER but no fragment yet: ${missing.length} (${missing.slice(0,8).join(' ')}${missing.length>8?' …':''})`);
const seq = [...known, ...extra];

const titleOf = html => (html.match(/<h2>([^<]+)<\/h2>/) ?? [, '?'])[1];
const idOf = html => (html.match(/id="([^"]+)"/) ?? [, '?'])[1];

const sections = seq.map(n => readFileSync(`sink/${n}.html`, 'utf8').trim());
const sprite = existsSync('assets/icons.svg')
  ? readFileSync('assets/icons.svg', 'utf8').trim()
  : '<!-- no assets/icons.svg; run tools/icons.mjs -->';
const nav = sections.map(s => `    <a href="#${idOf(s)}">${titleOf(s)}</a>`).join('\n');

const page = `<!doctype html>
<html lang="en" data-theme="white">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>rux-ds — kitchen sink</title>
<link rel="stylesheet" href="css/rux.css">
<link rel="stylesheet" href="sink/harness.css">
</head>
<body>

${sprite}

<nav class="ks-nav">
  <h1>rux-ds</h1>
  <div class="ks-count">${sections.length} sections</div>
  <div class="ks-navlinks">
${nav}
  </div>
</nav>

<main class="ks-main">
  <div class="ks-themes">
    <button class="rux--btn rux--btn--tertiary rux--btn--sm rux--layout--size-sm" data-set-theme="white">white</button>
    <button class="rux--btn rux--btn--tertiary rux--btn--sm rux--layout--size-sm" data-set-theme="g100">g100</button>
  </div>

${sections.join('\n\n')}
</main>

<!-- Phase 5 behaviour layer. The kernel loads FIRST; modules delegate to it.
     These are the system's, not the sink's — a page from templates/ loads the
     same two files. sink/harness.js is scaffolding for whatever Phase 5 has
     not reached yet, and shrinks with every module that lands. -->
<script src="js/overlay.js"></script>
<script src="js/popover.js"></script>
<script src="js/menu.js"></script>
<script src="js/list-box.js"></script>
<script src="js/tabs.js"></script>
<script src="js/accordion.js"></script>
<script src="js/data-table.js"></script>
<script src="js/form-controls.js"></script>
<script src="js/ui-shell.js"></script>
<script src="js/modal.js"></script>
<script src="sink/harness.js"></script>
</body>
</html>
`;
writeFileSync('kitchen-sink.html', page);
console.log(`  kitchen-sink.html — ${sections.length} sections, ${(page.length/1024).toFixed(0)} KB`);
