#!/usr/bin/env node
//
// THE SHARED APP CHECK. One implementation of what every consumer of rux-ds
// used to carry a copy of, vendored into each app under vendor/rux-ds/tools/
// by tools/new-project.sh and run from there by the app's tools/check.mjs.
// Standard library only; no npm install, no sibling checkout.
//
//   node tools/app-check.mjs [app-dir]     from anywhere; app-dir defaults to
//                                          the app this copy is vendored in,
//                                          else the working directory
//   node tools/app-check.mjs --self-test   drive every rule red in a scratch
//                                          app, then remove it
//   node tools/app-check.mjs --hash <dir>  print the tree checksum of <dir>
//                                          and nothing else; how
//                                          new-project.sh records one in a PIN
//
// WHY IT EXISTS. Until 2026-09-05 the hub carried an eight-line class check
// and Notes a ninety-nine-line one, and neither checked a token; the recipe
// for an app that wanted check-tokens was to copy its page into rux-ds's
// root, run `npm run verify`, and delete the copy. A consumer page in rux-ds
// is the one thing AGENTS.md says never enters it, even for a minute.
//
// WHAT IT CHECKS, and it is only what is genuinely the same in every app:
//   classes   every rux--* class a page or local script uses is compiled in
//             the pinned vendor/rux-ds/css/rux.css
//   tokens    every var(--rux-*) a page, local stylesheet or script reads is
//             declared in the pinned css or the app's own two delta files
//   files     every relative href/src on a page names a file that exists
//   ids       ids are unique per page, and every aria-controls, aria-labelledby,
//             aria-describedby, aria-owns, for= and #fragment resolves to one
//   pin       vendor/rux-ds/PIN exists, names a tag, and -- when it carries a
//             sha256 line -- the bytes under vendor/rux-ds/ still hash to it
//
// WHAT IT CANNOT SEE, said plainly because a green run is easy to over-read:
//   * whether a class is the RIGHT one -- btn--secondary where btn--danger was
//     meant resolves fine; rux-ds diffs markup against Carbon captures, and
//     those are not vendored (Notes' check-ancestry says why).
//   * a root-absolute reference such as /switcher.js: it names a file on the
//     account's ROOT site, which this app is not. Counted and reported as not
//     checked, never as resolved.
//   * an id built at runtime, a class an app-specific check knows better,
//     spacing, contrast, behaviour, or how the page LOOKS. It prints which
//     pages to open and names the five themes; the looking is the owner's.
//   * WHETHER THE PIN IS HONEST. The checksum is an INTEGRITY check, not
//     provenance: it catches an accidental or partial edit under vendor/, and
//     anyone who edits the tree and its PIN together can forge agreement. The
//     trusted tie to a tag is that new-project.sh exported that tag and wrote
//     the PIN in the same run. The checksum covers vendored paths and file
//     BYTES -- not permissions and not empty directories, so a vendored
//     githooks/commit-msg that lost its executable bit would hash identically
//     while no longer running. Hashing mode is umask- and platform-fragile,
//     so the limit is recorded here rather than chased.
//
// The hub keeps its registry rules and Notes its privacy, data, order,
// ancestry and generator gates beside this; nothing app-specific lives here.
//
// ON IMPORT IT RUNS, exits 1 on a failure, and RETURNS on a pass so the app's
// wrapper can run its own gates after it. --self-test is the red-run proof,
// kept with the implementation rather than in a fixture tree: it builds a
// scratch app in the system temp directory, breaks one rule at a time, asserts
// that exactly that rule fails, and removes the directory.
//
import { readFileSync, readdirSync, existsSync, statSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const SKIP = new Set(['vendor', 'node_modules', 'build', '.git', '.claude', '.github']);
const THEMES = 'white g10 g90 g100 rux';

// ── where the app is ────────────────────────────────────────────────────────
const self = fileURLToPath(import.meta.url);
function defaultRoot() {
  // Vendored copy: <app>/vendor/rux-ds/tools/app-check.mjs → <app>.
  const up3 = resolve(dirname(self), '..', '..', '..');
  if (basename(dirname(dirname(self))) === 'rux-ds' && basename(dirname(dirname(dirname(self)))) === 'vendor') return up3;
  return process.cwd();
}

// ── the vendored tree's checksum ────────────────────────────────────────────
// THE SAME SHAPE rux-ln-notes/tools/check-data.mjs USES for data/guides/, so
// there is one format in the family rather than two: sha256 of each file's
// BYTES, a listing of `<hash>  <relative path>` sorted by path, then sha256 of
// that listing. Bytes, never decoded text -- the fonts and icons.svg are
// binary. Sorted with an explicit comparator so it does not depend on a
// locale. The root PIN is the one exclusion, because it carries the answer.
//
// It is deliberately NOT a hash of the tag's tree: new-project.sh rewrites the
// templates' brand paths on the way in, so the vendored bytes are their own
// thing and this hashes what is actually there.
export function treeHash(dir) {
  const files = [];
  const collect = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      const p = join(d, e.name);
      if (e.isDirectory()) collect(p);
      else if (!(d === dir && e.name === 'PIN')) files.push(p);
    }
  };
  collect(dir);
  const sha = (buf) => createHash('sha256').update(buf).digest('hex');
  const lines = files
    .map((p) => [relative(dir, p), sha(readFileSync(p))])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([path, h]) => `${h}  ${path}\n`);
  return sha(lines.join(''));
}
const shortHash = h => (h ? h.slice(0, 12) : h);

// ── reading ─────────────────────────────────────────────────────────────────
function walk(dir, ext, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(join(dir, e.name), ext, out); continue; }
    if (ext.some(x => e.name.endsWith(x))) out.push(join(dir, e.name));
  }
  return out.sort();
}
const stripHtmlComments = s => s.replace(/<!--[\s\S]*?-->/g, '');
const stripJsComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/[^\n]*/g, '$1');
// THREE EXTRACTORS, because a class is written three ways. In a class="…"
// attribute it is a whitespace-separated token and may carry a colon --
// `rux--lg:col-span-8` -- so the attribute is split, never scanned. In a
// script it is a string, scanned with the colon allowed. In a stylesheet it is
// a selector, where an unescaped colon starts a pseudo-class and the escaped
// one (`.rux--lg\:col-span-8`) is part of the name. Scanning the attribute
// with the selector pattern reported every responsive class as `rux--lg`,
// measured on the hub and Notes 2026-09-05 before this was split.
const inAttrs = html => new Set([...html.matchAll(/\bclass="([^"]*)"/g)].flatMap(m => m[1].split(/\s+/)).filter(c => c.startsWith('rux--')));
const inScript = js => new Set([...js.matchAll(/\brux--[A-Za-z0-9_:-]+/g)].map(m => m[0].replace(/:+$/, '')));
const inSheet = css => new Set([...css.matchAll(/\.(rux--(?:\\.|[A-Za-z0-9_-])+)/g)].map(m => m[1].replace(/\\/g, '')));
const skipRef = v => /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\/)/i.test(v) || v === '';

// ── the rules ───────────────────────────────────────────────────────────────
// Returns { failures: [{rule, where, what}], notes: [...], pages: [...] }.
export function check(root) {
  const failures = [], notes = [];
  const fail = (rule, where, what) => failures.push({ rule, where, what });
  const rel = p => relative(root, p) || '.';

  // pin
  const pinPath = join(root, 'vendor/rux-ds/PIN');
  let pinTag = null, pinRecorded = null, pinComputed = null;
  if (!existsSync(pinPath)) fail('pin', 'vendor/rux-ds/PIN', 'missing -- this is not a project on rux-ds, or vendor/ was not committed');
  else {
    const pinText = readFileSync(pinPath, 'utf8');
    pinTag = pinText.match(/^tag\s+(v\d\S*)/m)?.[1] ?? null;
    if (!pinTag) fail('pin', 'vendor/rux-ds/PIN', 'names no tag; a pin between tags is not a release a consumer can be on');
    // THE BYTES, not only the label. Only reached with a PIN present, so the
    // missing-PIN message above stays the controlled diagnostic rather than
    // becoming an uncaught error from hashing a directory that is not there.
    pinRecorded = pinText.match(/^sha256\s+([0-9a-f]{64})\b/m)?.[1] ?? null;
    if (pinRecorded) {
      try {
        pinComputed = treeHash(join(root, 'vendor/rux-ds'));
      } catch (e) {
        fail('pin', 'vendor/rux-ds', `its checksum could not be computed: ${e.message}`);
      }
      if (pinComputed && pinComputed !== pinRecorded) {
        fail('pin', 'vendor/rux-ds',
          `the vendored tree does not match its PIN -- recorded ${shortHash(pinRecorded)}, found ${shortHash(pinComputed)}. ` +
          'Something under vendor/ was edited or partially copied; re-run rux-ds tools/new-project.sh against this app to put the release back.');
      }
    } else {
      notes.push('vendor/rux-ds/PIN carries no sha256 line, so its bytes cannot be verified -- a pin written before checksums. The next pin move records one.');
    }
  }

  // what the pinned release defines
  const vendorCss = ['rux.css', 'rux-theme.css', 'rux-overrides.css'].map(f => join(root, 'vendor/rux-ds/css', f));
  const cssText = f => existsSync(f) ? readFileSync(f, 'utf8') : '';
  const ruxCss = cssText(vendorCss[0]);
  if (!ruxCss) fail('classes', 'vendor/rux-ds/css/rux.css', 'missing; nothing to resolve a class against');
  const defined = new Set([...ruxCss.matchAll(/\.(rux--(?:\\.|[A-Za-z0-9_-])+)/g)].map(m => m[1].replace(/\\/g, '')));

  const pages = walk(root, ['.html']);
  const scripts = walk(root, ['.js', '.mjs']);
  const sheets = walk(root, ['.css']);
  const declared = new Set();
  for (const t of [...vendorCss.map(cssText), ...sheets.map(f => readFileSync(f, 'utf8')), ...pages.map(f => readFileSync(f, 'utf8'))])
    for (const m of t.matchAll(/(--rux-[A-Za-z0-9_-]+)\s*:/g)) declared.add(m[1]);

  // classes and tokens, over every page and local script
  let classUses = 0, tokenUses = 0, absolute = 0;
  const tokensIn = (text) => new Set([...text.matchAll(/var\(\s*(--rux-[A-Za-z0-9_-]+)/g)].map(m => m[1]));
  const sources = [
    ...pages.map(f => [f, stripHtmlComments(readFileSync(f, 'utf8')), 'html']),
    ...scripts.map(f => [f, stripJsComments(readFileSync(f, 'utf8')), 'js']),
    ...sheets.map(f => [f, stripJsComments(readFileSync(f, 'utf8')), 'css']),
  ];
  for (const [f, text, kind] of sources) {
    // A page's classes are its class attributes plus its inline scripts; the
    // prose between tags is never scanned, so a comment naming a class is not
    // a use.
    const used = kind === 'html'
      ? new Set([...inAttrs(text), ...[...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].flatMap(m => [...inScript(stripJsComments(m[1]))])])
      : kind === 'js' ? inScript(text) : inSheet(text);
    classUses += used.size;
    for (const c of used) if (!defined.has(c)) fail('classes', rel(f), `${c} is not compiled in the pinned rux.css`);
    const toks = tokensIn(text);
    tokenUses += toks.size;
    for (const t of toks) if (!declared.has(t)) fail('tokens', rel(f), `var(${t}) is declared nowhere -- not in the pinned css, not in this app's own two files`);
  }

  // files and ids, per page
  const IDREF = /\b(aria-controls|aria-labelledby|aria-describedby|aria-owns|for)="([^"]*)"/g;
  for (const f of pages) {
    const html = stripHtmlComments(readFileSync(f, 'utf8'));
    const dir = dirname(f);
    for (const m of html.matchAll(/\b(?:href|src)="([^"]*)"/g)) {
      const raw = m[1];
      if (raw.startsWith('/') && !raw.startsWith('//')) { absolute++; continue; }
      if (skipRef(raw)) continue;
      const path = raw.split(/[?#]/)[0];
      if (!path) continue;
      const target = resolve(dir, decodeURIComponent(path));
      const ok = existsSync(target) && (statSync(target).isFile() || existsSync(join(target, 'index.html')));
      if (!ok) fail('files', rel(f), `${raw} names nothing on disk`);
    }
    const ids = new Map();
    for (const m of html.matchAll(/\bid="([^"]*)"/g)) ids.set(m[1], (ids.get(m[1]) ?? 0) + 1);
    for (const [id, n] of ids) if (n > 1) fail('ids', rel(f), `id="${id}" appears ${n} times; aria-controls and for= can only reach one`);
    const refs = new Set();
    for (const m of html.matchAll(IDREF)) for (const id of m[2].split(/\s+/).filter(Boolean)) refs.add([m[1], id]);
    for (const m of html.matchAll(/\bhref="#([^"]+)"/g)) refs.add(['href', m[1]]);
    for (const [attr, id] of refs) if (!ids.has(id)) fail('ids', rel(f), `${attr} points at #${id}, and no element on the page has that id`);
  }
  if (absolute) notes.push(`${absolute} root-absolute reference${absolute === 1 ? '' : 's'} (/…) not checked: they name files on the account's root site, not in this app`);

  return { failures, notes, pages: pages.map(rel), classUses, tokenUses, defined: defined.size, pinTag, pinRecorded, pinComputed };
}

// ── printing ────────────────────────────────────────────────────────────────
function report(root, r) {
  const rules = ['pin', 'classes', 'tokens', 'files', 'ids'];
  for (const rule of rules) {
    const fs = r.failures.filter(f => f.rule === rule);
    console.log(`  ${fs.length ? 'FAIL' : ' ok '}  ${rule.padEnd(8)}${fs.length ? '' : ({
      pin: `vendor/rux-ds at ${r.pinTag}${r.pinRecorded ? `, bytes verified ${shortHash(r.pinRecorded)}` : ''}`,
      classes: `${r.classUses} uses resolve against ${r.defined} compiled`,
      tokens: `${r.tokenUses} var(--rux-*) reads resolve`,
      files: `every relative href and src on ${r.pages.length} page${r.pages.length === 1 ? '' : 's'} exists`,
      ids: 'unique, and every reference to one resolves',
    })[rule]}`);
    for (const f of fs) console.log(`          ${f.where}: ${f.what}`);
  }
  for (const n of r.notes) console.log(`  note  ${n}`);
  console.log(`\n  ${r.failures.length ? `${r.failures.length} failure${r.failures.length === 1 ? '' : 's'}` : 'passes'} in ${root}`);
  console.log(`  This says the page CAN render from the pin. Whether it looks right is yours: open`);
  for (const p of r.pages) console.log(`    ${p}`);
  console.log(`  in each theme -- ${THEMES} -- from the account panel.\n`);
}

// ── the red-run proof ───────────────────────────────────────────────────────
function selfTest() {
  const work = mkdtempSync(join(tmpdir(), 'rux-app-check-'));
  const w = (p, s) => { mkdirSync(dirname(join(work, p)), { recursive: true }); writeFileSync(join(work, p), s); };
  // THE PIN IS WRITTEN LAST, and its checksum is computed from the fixture that
  // was just built -- exactly the order new-project.sh uses. Writing it first
  // with a hand-typed hash would make every case fail on a mismatch nobody
  // meant to test.
  const good = () => {
    rmSync(work, { recursive: true, force: true });
    w('vendor/rux-ds/css/rux.css', '.rux--btn{--rux-x:1}.rux--btn--primary{color:var(--rux-x)}.rux--lg\\:col-span-8{}');
    w('vendor/rux-ds/css/rux-theme.css', '[data-theme=white]{--rux-y:2}');
    w('vendor/rux-ds/css/rux-overrides.css', '');
    w('rux-theme.css', '/* empty */');
    w('rux-overrides.css', '.rux--btn{color:var(--rux-y)}');
    w('app.js', '// rux--not-a-class in a comment is prose\ndocument.body.classList.add("rux--btn");');
    w('brand/logo.svg', '<svg/>');
    w('index.html', [
      '<!doctype html><html lang="en" data-theme="white"><head>',
      '<link rel="stylesheet" href="vendor/rux-ds/css/rux.css">',
      '<link rel="stylesheet" href="rux-overrides.css">',
      '<style>.x{color:var(--rux-x)}</style></head><body>',
      '<!-- rux--in-a-comment is prose, not a use -->',
      '<img src="brand/logo.svg" alt="">',
      '<button class="rux--btn rux--btn--primary rux--lg:col-span-8" aria-controls="panel" id="open">Open</button>',
      '<div id="panel"><label for="name">Name</label><input id="name"></div>',
      '<a href="#panel">Panel</a><a href="https://example.com/">Out</a><a href="/switcher.js">Root</a>',
      '<script src="app.js"></script><script>document.body.classList.add("rux--btn")</script>',
      '</body></html>',
    ].join('\n'));
    w('vendor/rux-ds/PIN', `tag     v0.0.0\ncommit  0000000\nsha256  ${treeHash(join(work, 'vendor/rux-ds'))}\n`);
  };
  const pinNoSha = 'tag     v0.0.0\ncommit  0000000\n';
  const cases = [
    ['a valid app passes', null, () => {}],
    ['classes', 'classes', () => w('page.html', '<html><body class="rux--invented"></body></html>')],
    ['classes in a local script', 'classes', () => w('more.js', 'el.className = "rux--nope";')],
    ['tokens', 'tokens', () => w('rux-theme.css', '[data-theme=white]{color:var(--rux-unknown)}')],
    ['files', 'files', () => w('page.html', '<html><body><img src="missing.svg"></body></html>')],
    ['ids: dangling aria-controls', 'ids', () => w('page.html', '<html><body><button aria-controls="nowhere">x</button></body></html>')],
    ['ids: duplicate', 'ids', () => w('page.html', '<html><body><i id="a"></i><i id="a"></i></body></html>')],
    ['ids: dangling #fragment', 'ids', () => w('page.html', '<html><body><a href="#gone">x</a></body></html>')],
    ['pin without a tag', 'pin', () => w('vendor/rux-ds/PIN', 'tag     (none: a commit between tags)\ncommit  0000000\n')],
    ['pin missing', 'pin', () => rmSync(join(work, 'vendor/rux-ds/PIN'))],
    // The checksum rule. Drift is one appended byte under vendor/, which is
    // what a hand edit or a half-finished copy looks like from here.
    ['pin: tree drifted', 'pin', () => w('vendor/rux-ds/css/rux.css',
      readFileSync(join(work, 'vendor/rux-ds/css/rux.css'), 'utf8') + '\n')],
    // A pin written before checksums existed. It must NOT fail, and the note
    // is asserted rather than assumed: the harness compares rule sets, so
    // without this a silently missing note would read as a pass.
    ['pin: legacy, no sha256', null, () => w('vendor/rux-ds/PIN', pinNoSha), /cannot be verified/],
  ];
  let bad = 0;
  try {
    for (const [label, rule, mutate, wantNote] of cases) {
      good(); mutate();
      const r = check(work);
      const rules = [...new Set(r.failures.map(f => f.rule))];
      const rulesOk = rule === null ? rules.length === 0 : rules.length === 1 && rules[0] === rule;
      const noteOk = !wantNote || r.notes.some(n => wantNote.test(n));
      const ok = rulesOk && noteOk;
      if (!ok) bad++;
      const want = rule === null ? 'no failure' : `only ${rule}`;
      const got = rules.length ? rules.join(', ') : 'none';
      console.log(`  ${ok ? ' ok ' : 'FAIL'}  ${label.padEnd(30)} expected ${want}${wantNote ? ' and the note' : ''}, got ${got}${wantNote ? (noteOk ? ' and the note' : ' and NO note') : ''}`);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
  console.log(`\n  ${cases.length} cases, ${bad} wrong. The scratch app is removed.`);
  console.log(`  This proves each rule CAN go red; it is the author's own proof. A session that`);
  console.log(`  did not write this file re-runs it and reads which line went red.\n`);
  process.exit(bad ? 1 : 0);
}

// ── main ────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
if (args.includes('--self-test')) selfTest();
// ONE CHECKSUM ON STDOUT AND NOTHING ELSE, so tools/new-project.sh can capture
// it with a command substitution and record it in the PIN it is about to
// write. Exits non-zero rather than printing something a shell would happily
// store: a release whose checksum could not be computed must stop the run, not
// become a pin nobody can verify.
else if (args.includes('--hash')) {
  const dir = args[args.indexOf('--hash') + 1];
  if (!dir || dir.startsWith('--')) {
    console.error('--hash needs a directory: node tools/app-check.mjs --hash <vendor-dir>');
    process.exit(2);
  }
  try {
    process.stdout.write(treeHash(resolve(dir)) + '\n');
  } catch (e) {
    console.error(`--hash ${dir}: ${e.message}`);
    process.exit(2);
  }
}
else {
  const root = resolve(args.find(a => !a.startsWith('--')) ?? defaultRoot());
  const r = check(root);
  report(root, r);
  if (r.failures.length) process.exit(1);
}
