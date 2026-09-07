// theme-creator.html's behaviour. Phase 14, roadmap §4.14.
//
// Lives outside js/ for the reason builder/ does: tools/new-project.sh
// vendors everything under js/ into every consumer project, and this tool
// belongs only here.
//
// STATE is { name, tokens }, tokens keyed by the twenty short names
// tools/build-theme-creator.mjs wrote rows for (e.g. "button-primary", not
// "--rux-button-primary"). SHADE_MAP below must name the same twenty tokens
// the generator's own TOKENS table does — a mismatch would apply the wrong
// shade silently, since nothing currently gates the two lists against each
// other (deferred per roadmap §4.14, alongside the family-freshness gate).
import { runKey, sameRun, RUN_MS, copy, CAP } from '../builder/session.mjs';
import { contrastRatio, meetsThreshold } from './contrast.mjs';

const NAME_RE = /^[a-z][a-z0-9-]*$/;
const RESERVED = new Set(['white', 'g10', 'g90', 'g100']);

// token → the Carbon shade key it takes when a family is applied. Roadmap
// §4.14's Step 2 table: seven shades cover all twenty tokens.
const SHADE_MAP = {
  'interactive': '60', 'icon-interactive': '60', 'border-interactive': '60',
  'background-brand': '60', 'focus': '60', 'highlight': '20',
  'link-primary': '60', 'link-primary-hover': '70', 'link-secondary': '70',
  'link-inverse': '40', 'link-inverse-hover': '30',
  'button-primary': '60', 'button-primary-hover': '70Hover', 'button-primary-active': '80',
  'button-tertiary': '60', 'button-tertiary-hover': '70Hover', 'button-tertiary-active': '80',
  'chat-button': '60', 'chat-button-text-hover': '70', 'chat-avatar-user': '60',
};

// Carbon's own white-theme values for the fixed surfaces scenarios.json
// names alongside an editable token — this tool overrides the interactive
// family over `white`, never these.
const FIXED_SURFACES = {
  'background': '#ffffff',
  'layer': '#ffffff',
  'background-inverse': '#393939',
  'text-on-color': '#ffffff',
  'text-inverse': '#ffffff',
  'text-primary': '#161616',
};

const DRAFT_KEY = 'rux.theme-draft';
const DRAFT_VERSION = 1;
const $ = id => document.getElementById(id);

const defaults = JSON.parse($('thc-defaults').textContent);
const tokenNames = Object.keys(defaults);

let scenarios = [];
let families = {};

let state = { name: 'rux', tokens: copy(defaults) };
let history = { past: [], future: [] };
let openRun = null; // { key, at } — see builder/session.mjs's own comment on runs.

function pushSnapshot() {
  history.past.push(copy(state));
  if (history.past.length > CAP) history.past.shift();
  history.future = [];
  openRun = null;
  renderHistoryButtons();
}

function renderHistoryButtons() {
  $('thc-undo').disabled = history.past.length === 0;
  $('thc-redo').disabled = history.future.length === 0;
}

function undo() {
  if (!history.past.length) return;
  history.future.push(copy(state));
  state = history.past.pop();
  openRun = null;
  renderAll();
}
function redo() {
  if (!history.future.length) return;
  history.past.push(copy(state));
  state = history.future.pop();
  openRun = null;
  renderAll();
}

function editToken(token, hex, { coalesce } = { coalesce: true }) {
  const key = runKey('theme-creator', token);
  const now = Date.now();
  if (!(coalesce && sameRun(openRun, key, now))) pushSnapshot();
  openRun = { key, at: now };
  state.tokens[token] = hex;
}

function applyFamily(familyName) {
  const family = families[familyName];
  if (!family) return;
  pushSnapshot();
  for (const [token, shade] of Object.entries(SHADE_MAP)) state.tokens[token] = family[shade];
}

// ── name validation ─────────────────────────────────────────────────────
function nameProblem(name) {
  if (!NAME_RE.test(name)) return 'must start with a letter and hold only lowercase letters, digits and hyphens';
  if (RESERVED.has(name)) return `"${name}" is a compiled Carbon theme, not a surface this tool layers over`;
  return null;
}

// ── contrast readout ────────────────────────────────────────────────────
function resolveColor(name) {
  if (name.startsWith('fixed:')) return FIXED_SURFACES[name.slice(6)] ?? null;
  return state.tokens[name] ?? null;
}

function renderBadges(token) {
  const own = scenarios.filter(s => s.token === token);
  own.forEach((s, i) => {
    const el = document.querySelector(`.thc-badge[data-token="${token}"][data-scenario="${i}"]`);
    if (!el) return;
    const fg = resolveColor(s.foreground), bg = resolveColor(s.background);
    const ratio = contrastRatio(fg, bg);
    if (ratio === null) { el.textContent = `${s.state} — unreadable colour`; el.className = 'thc-badge'; return; }
    const pass = meetsThreshold(ratio, s.threshold);
    el.textContent = `${s.state} — ${ratio.toFixed(1)}:1 (needs ${s.threshold}:1)`;
    el.className = `thc-badge ${pass ? 'thc-badge--pass' : 'thc-badge--warn'}`;
  });
}

function renderRow(token) {
  const input = $(`thc-tok-${token}`);
  const value = state.tokens[token];
  if (document.activeElement !== input) input.value = value;
  const swatch = $(`thc-swatch-${token}`);
  if (swatch) swatch.style.background = /^#[0-9a-f]{3,8}$/i.test(value) ? value : 'transparent';
  renderBadges(token);
}

function renderAll() {
  for (const t of tokenNames) renderRow(t);
  renderHistoryButtons();
  renderExport();
  schedulePreview();
  scheduleSave();
}

// ── export ──────────────────────────────────────────────────────────────
function cssBlock() {
  const lines = tokenNames.map(t => `  --rux-${t}: ${state.tokens[t]};`);
  return `[data-theme="${state.name || 'your-theme'}"] {\n${lines.join('\n')}\n}\n`;
}
function renderExport() {
  $('thc-export').textContent = cssBlock();
  const problem = nameProblem(state.name);
  $('thc-name-helper').textContent = problem
    ? `Not usable as a theme name yet: ${problem}.`
    : 'Lowercase letters, digits and hyphens; not white, g10, g90 or g100 — those are compiled Carbon themes, not a surface to layer over.';
}

// ── draft ───────────────────────────────────────────────────────────────
function scheduleSave() {
  clearTimeout(scheduleSave._t);
  scheduleSave._t = setTimeout(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: DRAFT_VERSION, name: state.name, tokens: state.tokens, savedAt: Date.now() }));
    } catch { /* storage may be unavailable; the draft is a convenience, not a promise */ }
  }, 500);
}
function loadDraft() {
  let raw;
  try { raw = localStorage.getItem(DRAFT_KEY); } catch { return null; }
  if (!raw) return null;
  let d;
  try { d = JSON.parse(raw); } catch { return null; }
  if (!d || d.v !== DRAFT_VERSION || typeof d.name !== 'string' || typeof d.tokens !== 'object' || !d.tokens) return null;
  for (const t of tokenNames) if (typeof d.tokens[t] !== 'string') return null;
  return { name: d.name, tokens: d.tokens };
}

// ── preview ─────────────────────────────────────────────────────────────
// The storage sandbox, copied from builder/rewrites.mjs's SHIM rather than
// imported: it is a small, self-contained snippet, and this module's own
// path-rebasing is deliberately not that file's (see below), so nothing is
// gained by sharing the import.
const PROFILE_SHIM = `<script>/* preview only — not in the export */(()=>{const K='rux.profile',m=new Map(),P=Storage.prototype,g=P.getItem,s=P.setItem,r=P.removeItem;P.getItem=function(k){return k===K?(m.has(K)?m.get(K):null):g.call(this,k)};P.setItem=function(k,v){k===K?m.set(K,String(v)):s.call(this,k,v)};P.removeItem=function(k){k===K?m.delete(K):r.call(this,k)}})();</script>`;

// This page's own directory, absolute — a blob: document has no location of
// its own to resolve a relative path against, so a root-relative "css/rux.css"
// 404s silently inside the preview even though it reads correctly from the
// top document. builder/rewrites.mjs's previewPage() carries the same
// absolute `root` prefix for the identical reason.
const ROOT = new URL('.', location.href).href;

// Root pages (kitchen-sink.html) already use root-relative paths
// ("css/rux.css"); templates/ pages sit one directory down and use
// "../css/rux.css". Stripping a single leading "../" normalizes both to
// root-relative, then ROOT makes the result absolute — builder/rewrites.mjs's
// firstPerLine/everywhere helpers target the literal "../" prefix alone and
// do not apply to a page that has none, which is why this is its own
// function rather than a shared import.
function rebase(html) {
  return html.replace(/((?:href|src)=")(\.\.\/)?([^"#][^"]*)"/g, (_, attr, dots, path) => {
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) return `${attr}${dots || ''}${path}"`; // absolute or scheme-relative — leave alone
    return `${attr}${ROOT}${path}"`;
  });
}

let previewObjectUrl = null;
async function buildPreview() {
  const target = $('thc-target').value;
  const status = $('thc-preview-status');
  const problem = nameProblem(state.name);
  if (problem) { status.textContent = `Preview paused: ${problem}.`; return; }
  let html;
  try {
    html = await fetch(target, { cache: 'no-store' }).then(r => r.text());
  } catch {
    status.textContent = `Could not load ${target} for the preview.`;
    return;
  }
  html = rebase(html);
  html = html.replace(/<html\b([^>]*)\sdata-theme="[^"]*"/, `<html$1 data-theme="${state.name}"`);
  html = html.replace(/(<script[^>]*\ssrc="js\/theme\.js")/, `${PROFILE_SHIM}\n$1`);
  html = html.replace('</head>', `<style>${cssBlock()}</style>\n</head>`);

  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const frame = $('thc-frame');
  const prior = previewObjectUrl;
  previewObjectUrl = url;
  frame.addEventListener('load', () => { if (prior) URL.revokeObjectURL(prior); }, { once: true });
  frame.src = url;
  status.textContent = `Previewing ${target}.`;
}
function schedulePreview() {
  clearTimeout(schedulePreview._t);
  schedulePreview._t = setTimeout(buildPreview, 250);
}

// ── width ───────────────────────────────────────────────────────────────
function setWidth(px) {
  const wrap = $('thc-frame-wrap'), frame = $('thc-frame'), pane = frame.closest('.thc-preview');
  document.querySelectorAll('[data-width]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.width === px)));
  if (px === 'fit') { frame.style.inlineSize = '100%'; wrap.style.transform = 'none'; return; }
  const target = Number(px);
  frame.style.inlineSize = `${target}px`;
  const available = pane.clientWidth;
  const scale = available < target ? available / target : 1;
  wrap.style.transform = scale < 1 ? `scale(${scale})` : 'none';
}

// ── wiring ──────────────────────────────────────────────────────────────
function init() {
  for (const t of tokenNames) {
    $(`thc-tok-${t}`).addEventListener('input', e => { editToken(t, e.target.value); renderRow(t); renderExport(); schedulePreview(); scheduleSave(); });
    $(`thc-tok-${t}`).addEventListener('blur', () => { openRun = null; });
  }
  $('thc-family').addEventListener('change', e => {
    if (!e.target.value) return;
    applyFamily(e.target.value);
    renderAll();
  });
  $('thc-name').addEventListener('input', e => { state.name = e.target.value; renderExport(); schedulePreview(); scheduleSave(); });
  $('thc-undo').addEventListener('click', undo);
  $('thc-redo').addEventListener('click', redo);
  $('thc-start-over').addEventListener('click', () => {
    pushSnapshot();
    state = { name: 'rux', tokens: copy(defaults) };
    renderAll();
  });
  $('thc-target').addEventListener('change', schedulePreview);
  document.querySelectorAll('[data-width]').forEach(b => b.addEventListener('click', () => setWidth(b.dataset.width)));

  $('thc-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(cssBlock()); $('thc-preview-status').textContent = 'Copied.'; }
    catch { $('thc-preview-status').textContent = 'Could not copy — select the text and copy it by hand.'; }
  });
  $('thc-download').addEventListener('click', () => {
    const blob = new Blob([cssBlock()], { type: 'text/css' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rux-theme.css';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  const draft = loadDraft();
  if (draft) state = { name: draft.name, tokens: draft.tokens };

  renderAll();
  setWidth('fit');
}

Promise.all([
  fetch('theme-creator/families.json', { cache: 'no-store' }).then(r => r.json()),
  fetch('theme-creator/scenarios.json', { cache: 'no-store' }).then(r => r.json()),
]).then(([familiesDoc, scenariosDoc]) => {
  families = familiesDoc.families;
  scenarios = scenariosDoc.scenarios;
  init();
}).catch(() => {
  $('thc-preview-status').textContent = 'Could not load theme-creator/families.json or scenarios.json.';
});
