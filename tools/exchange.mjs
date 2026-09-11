#!/usr/bin/env node
//
// WHAT IS EVERY REPOSITORY WAITING ON? One line per open ask, across every
// checkout in the workspace.
//
//   node tools/exchange.mjs              the folder holding this checkout
//   node tools/exchange.mjs --all        replies and answered asks too
//   node tools/exchange.mjs <dir>        a workspace somewhere else
//
// WHY THIS IS HERE RATHER THAN IN A REPOSITORY THAT SENDS MEMOS. It reads
// across checkouts, and `serve.mjs --workspace` already established that a
// workspace-level tool lives in this one -- it is the checkout every other
// repository already clones beside itself and imports tooling from. It knows
// no project by name: it reads whatever directories it is given, and every
// fact it prints comes out of a memo's own frontmatter.
//
// IT PARSES FRONTMATTER AND NEVER PROSE. A memo says who it is for and
// whether it is answered in one `exchange:` line; the body is for a person.
// The state of a conversation was kept in three hand-maintained lists before
// this (a table in one repository's handover, a "waiting on someone else"
// section in another's TODO, an open-items list in a README), and on
// 2026-09-11 all three disagreed with the files -- one listed an ask as
// unanswered that had been answered the day before. A list nobody types
// cannot do that.
//
// WHAT IT DOES NOT DO: it does not check that `answered_by` names a file that
// exists, and it does not read a memo's body at all. An ask marked answered is
// answered because a person said so in its frontmatter.
//
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const ALL = args.includes('--all');
const WS = args.find(a => !a.startsWith('--')) ?? dirname(HERE);

if (!existsSync(WS)) { console.error(`  no workspace at ${WS}`); process.exit(1); }

// The `exchange:` inline map, in the shape rux-ln-atlas's tools/_fm.py already
// parses -- one line, braces, comma-separated `key: value`. Nothing else in a
// memo's frontmatter is read, so a repository's own schema is untouched.
function exchangeOf(file) {
  let text;
  try { text = readFileSync(file, 'utf8'); } catch { return null; }
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---\n', 4);
  if (end === -1) return null;
  const line = text.slice(4, end).split('\n').find(l => l.startsWith('exchange:'));
  if (!line) return null;
  const body = line.slice(line.indexOf('{') + 1, line.lastIndexOf('}'));
  const out = {};
  for (const part of body.split(',')) {
    const i = part.indexOf(':');
    if (i === -1) continue;
    out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

// Root .md files and an exchange/ folder: the two places these have ever
// lived. Not a recursive sweep -- a memo is a top-level document by design,
// and recursing would read a repository's whole corpus to find four files.
function memosIn(repo) {
  const found = [];
  for (const dir of [repo, join(repo, 'exchange'), join(repo, 'docs')]) {
    if (!existsSync(dir)) continue;
    for (const n of readdirSync(dir)) {
      if (!n.endsWith('.md')) continue;
      const f = join(dir, n);
      if (!statSync(f).isFile()) continue;
      const x = exchangeOf(f);
      if (!x) continue;
      // A REQUESTS DOC IS MANY ASKS IN ONE FILE, and rux-scheduler keeps its
      // backlog that way: `## Open -- <what>, <date>` sections above a
      // `## Settled`. Counting the file as one ask would have reported 2 open
      // asks in a workspace that had 17. The headings are structure, so they
      // are read; nothing below a heading is.
      if (x.kind === 'requests') {
        for (const line of readFileSync(f, 'utf8').split('\n')) {
          const m = /^## Open\s+[-\u2014]\s+(.*)$/.exec(line);
          if (!m) continue;
          const d = /(\d{4}-\d{2}-\d{2})\s*$/.exec(m[1]);
          found.push({ file: f, ...x, kind: 'ask', state: 'open',
                       sent: d ? d[1] : 'undated', title: m[1].replace(/,?\s*\d{4}-\d{2}-\d{2}\s*$/, '') });
        }
        continue;
      }
      found.push({ file: f, ...x });
    }
  }
  return found;
}

const repos = readdirSync(WS)
  .map(n => join(WS, n))
  .filter(p => { try { return statSync(p).isDirectory() && existsSync(join(p, '.git')); } catch { return false; } });

const memos = repos.flatMap(memosIn);
const asks = memos.filter(m => m.kind === 'ask');
const open = asks.filter(m => m.state === 'open');

const w = s => String(s ?? '?');
const show = m => `  ${w(m.sent).padEnd(11)} ${w(m.from).padEnd(14)} → ${w(m.to).padEnd(14)} ${m.title ? m.title.trim() : relative(WS, m.file)}`;

if (open.length) {
  console.log(`\nOPEN — ${open.length} ask${open.length === 1 ? '' : 's'} waiting on someone\n`);
  for (const m of open.sort((a, b) => w(a.sent).localeCompare(w(b.sent)))) console.log(show(m));
} else {
  console.log('\nOPEN — nothing. Every ask in the workspace is marked answered.');
}

if (ALL) {
  const rest = memos.filter(m => !open.includes(m));
  console.log(`\nANSWERED AND REPLIES — ${rest.length}\n`);
  for (const m of rest.sort((a, b) => w(a.sent).localeCompare(w(b.sent)))) {
    console.log(`${show(m)}  [${w(m.kind)}${m.answers ? ` → ${m.answers}` : ''}${m.answered_by ? ` ← ${m.answered_by}` : ''}]`);
  }
}

console.log(`\n  ${memos.length} memos across ${repos.length} checkouts in ${WS}`);
console.log(`  ${asks.length} asks, ${open.length} open, ${asks.length - open.length} answered` + (ALL ? '' : '  (--all to see them)'));
