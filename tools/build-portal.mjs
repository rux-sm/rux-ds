#!/usr/bin/env node
//
// Assembles portal.html — the design system's own status page, built out of
// the design system.
//
// WHY IT IS GENERATED. Every figure on this page already exists in a file the
// gates read: docs/inventory.json, docs/coverage.json, docs/gate-coverage.json
// and tools/lib/gates.mjs. A hand-written status page would be a SECOND copy of
// all of them, and README records what happened the last time a count lived in
// two places — its own Status block drifted, and f726cf1 exists to have fixed
// the same class of defect across four documents. So nothing here is typed by
// hand that can be read from the repository, and the page is regenerated on
// every `npm run verify` with CI failing if the committed copy is stale.
//
// WHAT GATES IT. portal.html is added to the four ASSEMBLED gates' roots —
// check-classes, check-co-classes, check-coverage, check-tokens — exactly as
// kitchen-sink.html is. That means it cannot use a class with no CSS behind it,
// a class whose component was stripped, a modifier without its base, or an
// unresolved token.
//
// WHAT DOES NOT GATE IT, AND WHY. The per-file gates (check-icons, check-tags,
// check-ancestry, check-compound) read tools/lib/sources.mjs, whose roots are
// `sink` and `templates` — DIRECTORIES OF EDITABLE FILES. sources.mjs states
// the reason it excludes kitchen-sink.html: a finding must name a file you can
// edit, and a generated file is overwritten by the next build. portal.html is
// generated for the same reason and is excluded on the same grounds.
//
// That leaves a real hole, because kitchen-sink.html's own cover for it does
// not apply here: the sink is assembled from sink/*.html fragments, and those
// fragments ARE per-file gated. This page has no fragments. Its markup is in
// this file, and no gate reads this file's output for structure.
//
// So this build carries its own icon assertion, the way tools/build.mjs
// carries the namespace check with no check-* file of its own. Every `#i-name`
// emitted below must be a <symbol> the committed sprite defines, or the build
// throws. CLAUDE.md is unambiguous about why that one is worth catching here:
// a <use> pointing at a symbol that does not exist paints NOTHING, silently,
// and the page still looks built.
//
// IT IS NOT REGISTERED AS A GATE. The registry says fourteen and three
// documents agree with it; adding a fifteenth is a decision, not a side effect
// of adding a page. Recorded in docs/audits.md as an unregistered build
// invariant so it is not merely undocumented.
//
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { GATES, browserGates } from './lib/gates.mjs';
import { markupFiles } from './lib/sources.mjs';
import { cellStates } from './lib/staleness.mjs';
import { compiled } from './lib/ownership.mjs';

const read = p => readFileSync(p, 'utf8');
const json = p => JSON.parse(read(p));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const kb = n => `${(n / 1024).toFixed(1)} KB`;

// ── the facts, all read ─────────────────────────────────────────────────────
const inventory = json('docs/inventory.json');
const coverage = json('docs/coverage.json');
const ledger = json('docs/gate-coverage.json');
const css = read('css/rux.css');

const COMPILED = compiled();
const allComponents = Object.values(inventory.components).map(c => c.component).sort();
const tokenCount = new Set(css.match(/--rux-[a-z0-9-]+(?=\s*:)/g) ?? []).size;
const classCount = new Set(css.match(/\.rux--[A-Za-z0-9_\\:-]+/g) ?? []).size;
const cssSize = statSync('css/rux.css').size;
const minSize = existsSync('css/rux.min.css') ? statSync('css/rux.min.css').size : 0;
// LEVEL 9, NOT THE DEFAULT. README records 55.8 KB gzipped and node's zlib
// defaults to level 6, which returns 56.5 — a figure that would disagree with
// README on this page's first render, which is the exact drift this generator
// exists to avoid. `gzip -9` is what the recorded measurement used.
const gzipSize = gzipSync(read('css/rux.min.css') ?? css, { level: 9 }).length;

const jsFiles = markupFiles(['js']); // none — js is .js; counted directly below
const jsBytes = ['overlay', 'popover', 'menu', 'list-box', 'tabs', 'accordion', 'data-table',
  'form-controls', 'ui-shell', 'dismiss', 'tile', 'modal']
  .filter(n => existsSync(`js/${n}.js`))
  .reduce((a, n) => a + statSync(`js/${n}.js`).size, 0);

const templates = markupFiles(['templates']).map(f => {
  const src = read(f.path);
  const m = src.match(/BEHAVIOUR:\s*([a-z-]+)[\s\S]*?(\d{4}-\d{2}-\d{2})/);
  return { name: f.name.replace('templates/', ''), path: f.path, label: m?.[1] ?? '—', date: m?.[2] ?? '—' };
});

const covHit = Object.values(coverage.components).reduce((a, c) => a + c.hit, 0);
const covOwn = Object.values(coverage.components).reduce((a, c) => a + c.own, 0);
const covPct = Math.round((covHit / covOwn) * 100);

// Browser-gate matrix: every cell the registry says a sweep has to fill.
//
// STATE COMES FROM tools/lib/staleness.mjs, NOT FROM "is there a row in the
// ledger". The first version of this page asked the weaker question and
// answered "25 / 25 · 0 never run" while `npm run gates` reported 22 stale in
// the same tree — a status page contradicting the tool it reports on. A reading
// whose inputs have moved since is not coverage; `js/` changing invalidates
// every browser cell, which is how 22 of them went stale in one commit.
//
// `workingTree: false` BECAUSE THIS PAGE IS COMMITTED. The state check-gates
// calls DIRTY — an input modified but not yet committed — is true of one
// person's tree and of no clone, and 4beac65 baked 26 of them into this file:
// every checkout regenerating the page then produced a 52-line diff turning
// `dirty` into `stale`, and CI's committed-output step failed on a tree nobody
// had touched. Worse, it could not be fixed by regenerating, because `verify`
// always builds this page from the tree where the commit's own changes are
// still uncommitted — DIRTY in, STALE out, every time. So the portal asks for
// the state that survives the commit; tools/lib/staleness.mjs holds the rule
// and the reasoning. DIRTY is unreachable here, which is why it appears in
// neither STATE_TAG nor the count below.
const matrix = cellStates({ workingTree: false }).map(r => {
  const rec = ledger[r.id]?.[r.page];
  return { gate: r.id, page: r.page, state: r.state, why: r.why,
           current: r.state === 'ok', date: rec?.date ?? null, result: rec?.result ?? null };
});
const currentCells = matrix.filter(c => c.current).length;
const staleCells = matrix.filter(c => c.state === 'STALE').length;
const neverRun = matrix.filter(c => c.state === 'NEVER RUN').length;

// ── icons, asserted ─────────────────────────────────────────────────────────
const sprite = read('assets/icons.svg').trim();
const spriteSymbols = new Set([...sprite.matchAll(/<symbol[^>]*\bid="([^"]+)"/g)].map(m => m[1]));
const icon = (name, size = 16, box = 32) => {
  if (!spriteSymbols.has(`i-${name}`)) {
    console.error(`build-portal: no <symbol id="i-${name}"> in assets/icons.svg`);
    process.exit(1);
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${box} ${box}" fill="currentColor" aria-hidden="true"><use href="#i-${name}"/></svg>`;
};

// ── page pieces ─────────────────────────────────────────────────────────────
const tile = (label, value, note) =>
`          <div class="rux--css-grid-column rux--sm:col-span-4 rux--md:col-span-4 rux--lg:col-span-4">
            <div class="rux--tile">
              <p>${esc(label)}</p>
              <h3>${esc(value)}</h3>
              <p>${esc(note)}</p>
            </div>
          </div>`;

const tag = (text, colour) => `<span class="rux--tag rux--tag--${colour} rux--tag--sm"><span class="rux--tag__label">${esc(text)}</span></span>`;

const componentRows = allComponents.map(name => {
  const on = COMPILED.has(name);
  const cov = coverage.components[name];
  return `                <tr>
                  <td>${esc(name)}</td>
                  <td>${on ? tag('compiled', 'green') : tag('not compiled', 'cool-gray')}</td>
                  <td>${cov ? `${cov.hit} / ${cov.own}` : '—'}</td>
                </tr>`;
}).join('\n');

const gateRows = GATES.map(g =>
`                <tr>
                  <td>${esc(g.id)}</td>
                  <td>${g.kind === 'node' ? tag('node', 'blue') : tag('browser', 'purple')}</td>
                  <td>${g.inVerify ? tag('in verify', 'green') : tag('by hand', 'warm-gray')}</td>
                  <td>${esc(g.catches)}</td>
                  <td>${esc(g.blindTo ?? '—')}</td>
                </tr>`).join('\n');

const STATE_TAG = { 'ok': ['current', 'green'], 'STALE': ['stale', 'red'],
  'NEVER RUN': ['never run', 'red'], 'NO COMMIT': ['no commit', 'warm-gray'] };
const matrixRows = matrix.map(c => {
  const [label, colour] = STATE_TAG[c.state] ?? [c.state, 'cool-gray'];
  return `                <tr>
                  <td>${esc(c.gate)}</td>
                  <td>${esc(c.page)}</td>
                  <td>${tag(label, colour)}</td>
                  <td>${esc(c.date ?? '—')}</td>
                  <td>${esc(c.why || c.result || 'no result recorded')}</td>
                </tr>`;
}).join('\n');

const templateCards = templates.map(t =>
`          <div class="rux--css-grid-column rux--sm:col-span-4 rux--md:col-span-4 rux--lg:col-span-4">
            <a class="rux--tile rux--tile--clickable" href="${esc(t.path)}">
              <h4>${esc(t.name)}</h4>
              <p>BEHAVIOUR ${esc(t.label)} · ${esc(t.date)}</p>
            </a>
          </div>`).join('\n');

// NO `--side-nav__item--icon` HERE, even though every item carries an icon.
// That modifier does not mean "this item has an icon"; it means "this item's
// SUBMENU sits under an icon", and its whole effect is to indent the nested
// links to 4.5rem so they clear the parent's glyph. Put it on an item whose
// direct child is a link and the 4.5rem lands on that link instead, pushing
// its own icon to 72px and its text to 112px. Carbon's top-level icon links
// are a bare `side-nav__item`; measured on the running fixed-side-nav-w-icons
// story, 2026-08-29 — padding 16px, icon at 16px, text at 56px.
const navItem = (id, label, ic, current) =>
`      <li class="rux--side-nav__item${current ? ' rux--side-nav__item--active' : ''}">
        <a class="rux--side-nav__link" href="#${id}"${current ? ' aria-current="page"' : ''}>
          <div class="rux--side-nav__icon">${icon(ic, 20)}</div>
          <span class="rux--side-nav__link-text">${esc(label)}</span>
        </a>
      </li>`;

// ── the page ────────────────────────────────────────────────────────────────
const page = `<!doctype html>
<html lang="en" data-theme="white">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>rux-ds — portal</title>
<link rel="stylesheet" href="css/rux.css">
<style>
/* Copied from templates/app-shell.html, which records why this is a fixed
   padding and not a grid offset: .rux--content is only ever indented by a
   SIBLING side nav, and this shell's nav lives inside the header. */
@media (min-width: 66rem) {
  .rux--content { padding-inline-start: 18rem; }
}
</style>
</head>
<body>
<!-- GENERATED by tools/build-portal.mjs — do not edit. Every figure is read
     from docs/inventory.json, docs/coverage.json, docs/gate-coverage.json,
     tools/lib/gates.mjs and the files on disk. Edit the generator. -->

${sprite}

<header class="rux--header" data-theme="g100" aria-label="rux-ds">
  <a class="rux--skip-to-content" href="#main-content">Skip to main content</a>
  <button type="button" class="rux--header__action rux--header__menu-trigger rux--header__menu-toggle rux--header__menu-toggle__hidden" aria-label="Toggle navigation" aria-expanded="false">${icon('menu', 20, 16)}</button>
  <a class="rux--header__name" href="portal.html"><span class="rux--header__name--prefix">rux</span>&nbsp;ds</a>
  <nav class="rux--header__nav" aria-label="rux-ds">
    <ul class="rux--header__menu-bar">
      <li><a class="rux--header__menu-item rux--header__menu-item--current" href="portal.html" aria-current="page"><span class="rux--text-truncate-end">Portal</span></a></li>
      <li><a class="rux--header__menu-item" href="kitchen-sink.html"><span class="rux--text-truncate-end">Kitchen sink</span></a></li>
    </ul>
  </nav>
  <div class="rux--header__global">
    <a class="rux--header__action rux--btn rux--layout--size-lg rux--btn--ghost rux--btn--icon-only" href="kitchen-sink.html" aria-label="Kitchen sink">${icon('grid', 20, 32)}</a>
  </div>
  <div class="rux--side-nav__overlay"></div>
  <nav class="rux--side-nav__navigation rux--side-nav rux--side-nav--ux" aria-label="Side navigation">
    <ul class="rux--side-nav__items">
${navItem('status', 'Status', 'grid', true)}
${navItem('components', 'Components', 'list', false)}
${navItem('templates', 'Templates', 'document', false)}
${navItem('gates', 'Gates', 'checkmark--outline', false)}
    </ul>
  </nav>
</header>

<main id="main-content" class="rux--content">
  <div class="rux--css-grid">
    <div class="rux--css-grid-column rux--col-span-100">

      <!-- STACK IS THE PAGE'S ONLY VERTICAL RHYTHM, and it is not optional.
           templates/detail-page.html states the rule this page was built
           without: Carbon components carry no margin, because the spacing
           overview has them "delegate the responsibility of positioning and
           layout to parent components". Without a stack every child of this
           column measures margin 0 and gapToNext 0 -- which is exactly what
           this page shipped at 14db75d, and no gate saw it. check-spacing
           compares CLASSED elements against Carbon's computed signatures; the
           gap between an h2 and the section under it belongs to neither.

           NESTED, as templates/empty-state.html nests four. The outer stack
           separates sections at scale 8 (2.5rem); each section groups its
           heading, its intro and its content at scale 5 (1rem), so a heading
           sits nearer the thing it names than the section above it. -->
      <div class="rux--stack-vertical rux--stack-scale-8">

        <div class="rux--stack-vertical rux--stack-scale-5">
          <h1 id="status">rux-ds</h1>
          <p>A framework-free CSS/HTML/JS design system, derived from Carbon v11 by subtraction. Every figure below is read from this repository at build time.</p>
          <!-- with-row-gap: the tiles wrap at md and below, and without it the
               rows butt together into one unbroken slab of layer colour. -->
          <div class="rux--subgrid rux--subgrid--wide rux--subgrid--with-row-gap">
${tile('Components compiled', `${COMPILED.size} / ${allComponents.length}`, `${allComponents.length - COMPILED.size} cut or deferred`)}
${tile('Class coverage', `${covPct}%`, `${covHit} of ${covOwn} classes exercised`)}
${tile('Stylesheet', kb(gzipSize), `${kb(cssSize)} raw · ${kb(minSize)} minified`)}
${tile('Browser gates current', `${currentCells} / ${matrix.length}`, `${staleCells} stale · ${neverRun} never run`)}
          </div>
        </div>

        <div class="rux--stack-vertical rux--stack-scale-5">
          <h2 id="components">Components</h2>
          <p>${COMPILED.size} of ${allComponents.length} compile into <code>css/rux.css</code>. Coverage is what the kitchen sink and templates actually exercise, ratcheted in <code>docs/coverage.json</code>.</p>
          <section class="rux--data-table-container">
            <div class="rux--data-table-header">
              <div>
                <div class="rux--data-table-header__title">All ${allComponents.length} components</div>
                <p class="rux--data-table-header__description">Disposition for every Carbon component, decided in docs/inventory.md.</p>
              </div>
            </div>
            <div class="rux--data-table-content">
              <table class="rux--data-table rux--data-table--lg">
                <thead>
                  <tr>
                    <th scope="col"><div class="rux--table-header-label">Component</div></th>
                    <th scope="col"><div class="rux--table-header-label">State</div></th>
                    <th scope="col"><div class="rux--table-header-label">Classes exercised</div></th>
                  </tr>
                </thead>
                <tbody>
${componentRows}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div class="rux--stack-vertical rux--stack-scale-5">
          <h2 id="templates">Templates</h2>
          <p>${templates.length} complete pages. Each carries the shell and declares what its behaviour was verified against.</p>
          <div class="rux--subgrid rux--subgrid--wide rux--subgrid--with-row-gap">
${templateCards}
          </div>
        </div>

        <div class="rux--stack-vertical rux--stack-scale-5">
          <h2 id="gates">Gates</h2>
          <p>${GATES.length} gates. ${GATES.filter(g => g.inVerify).length} run in <code>npm run verify</code>; ${browserGates().length} need a browser and are recorded by hand in <code>docs/gate-coverage.json</code>.</p>
          <section class="rux--data-table-container">
            <div class="rux--data-table-header">
              <div>
                <div class="rux--data-table-header__title">The registry</div>
                <p class="rux--data-table-header__description">What each gate catches, and what it is blind to. Read from tools/lib/gates.mjs.</p>
              </div>
            </div>
            <div class="rux--data-table-content">
              <table class="rux--data-table rux--data-table--lg">
                <thead>
                  <tr>
                    <th scope="col"><div class="rux--table-header-label">Gate</div></th>
                    <th scope="col"><div class="rux--table-header-label">Kind</div></th>
                    <th scope="col"><div class="rux--table-header-label">Runs</div></th>
                    <th scope="col"><div class="rux--table-header-label">Catches</div></th>
                    <th scope="col"><div class="rux--table-header-label">Blind to</div></th>
                  </tr>
                </thead>
                <tbody>
${gateRows}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div class="rux--stack-vertical rux--stack-scale-5">
          <h3>Browser gate coverage</h3>
          <p>A gate never run against a target is indistinguishable from one that passed, and a reading whose inputs have moved since is not coverage either. ${currentCells} of ${matrix.length} cells are current; ${staleCells} stale, ${neverRun} never run. Same rule as <code>npm run gates</code>, from <code>tools/lib/staleness.mjs</code>.</p>
          <section class="rux--data-table-container">
            <div class="rux--data-table-content">
              <table class="rux--data-table rux--data-table--lg">
                <thead>
                  <tr>
                    <th scope="col"><div class="rux--table-header-label">Gate</div></th>
                    <th scope="col"><div class="rux--table-header-label">Page</div></th>
                    <th scope="col"><div class="rux--table-header-label">State</div></th>
                    <th scope="col"><div class="rux--table-header-label">Last run</div></th>
                    <th scope="col"><div class="rux--table-header-label">Result or reason</div></th>
                  </tr>
                </thead>
                <tbody>
${matrixRows}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div class="rux--stack-vertical rux--stack-scale-5">
          <h2>Behaviour</h2>
          <p>12 modules, ${kb(jsBytes)} raw. The markup is the API — a page built from a template needs no script of its own.</p>
          <ul class="rux--list--unordered">
            <li class="rux--list__item"><a class="rux--link" href="kitchen-sink.html">Kitchen sink</a> — ${COMPILED.size} compiled components as live specimens</li>
            <li class="rux--list__item"><a class="rux--link" href="templates/app-shell.html">App shell</a> — the frame every template is built on</li>
            <li class="rux--list__item">${tokenCount} <code>--rux-*</code> tokens · ${classCount} <code>.rux--*</code> classes</li>
          </ul>
        </div>

      </div>
    </div>
  </div>
</main>

<script src="js/overlay.js"></script>
<script src="js/popover.js"></script>
<script src="js/menu.js"></script>
<script src="js/list-box.js"></script>
<script src="js/tabs.js"></script>
<script src="js/accordion.js"></script>
<script src="js/data-table.js"></script>
<script src="js/form-controls.js"></script>
<script src="js/ui-shell.js"></script>
<script src="js/dismiss.js"></script>
<script src="js/tile.js"></script>
<script src="js/modal.js"></script>
</body>
</html>
`;

writeFileSync('portal.html', page);
console.log(`  portal.html — ${COMPILED.size}/${allComponents.length} components · ${GATES.length} gates · ${currentCells}/${matrix.length} browser cells current, ${staleCells} stale, ${neverRun} never run`);
