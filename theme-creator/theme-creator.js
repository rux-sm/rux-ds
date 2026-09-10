// theme-creator.html's behaviour. Phase 14, roadmap §4.14; the Surfaces
// section, Phase 15, roadmap §4.15.
//
// Lives outside js/ for the reason builder/ does: tools/new-project.sh
// vendors everything under js/ into every consumer project, and this tool
// belongs only here.
//
// STATE is { name, tokens, surface }. `name`/`tokens` are the accent
// section from Phase 14: tokens keyed by the twenty short names
// tools/build-theme-creator.mjs wrote rows for (e.g. "button-primary", not
// "--rux-button-primary"). SHADE_MAP below must name the same twenty tokens
// the generator's own TOKENS table does — a mismatch would apply the wrong
// shade silently, since nothing currently gates the two lists against each
// other (deferred per roadmap §4.14, alongside the family-freshness gate).
//
// `surface` is Phase 15: { base, name, tokens }, tokens keyed by exactly
// four names — background, layer-01, layer-02, layer-03 — matching
// tools/build-theme-creator.mjs's SURFACE_TOKENS. Deliberately not a fifth
// compiled Carbon theme: a first attempt at that (map.merge over
// themes.$g100) was found broken by review before any file was written —
// Carbon's component tokens are matched against a theme map's COMPLETE
// contents (_theme.scss's `matches()`), so changing one key breaks every
// component-token lookup for that theme, silently. Surfaces instead
// overrides its four tokens in the CSS cascade, on a compound
// [data-theme][data-rux-surface] selector, exactly the mechanism the
// shipped `rux` accent theme already uses on `:root` — Carbon's Sass never
// sees it.
//
// ONE SHARED HISTORY, ONE SHARED PREVIEW. Both sections push onto the same
// undo/redo stack (`copy(state)` already snapshots both halves together),
// and `activeSection` says which one the live preview and status line
// currently reflect — whichever was edited most recently, the same
// "navigation records nothing, editing does" rule builder/session.mjs
// documents for its own history.
//
// PHASE 16 (roadmap §4.16): Save on either section writes through
// window.Rux.customThemes (js/custom-themes.js), the platform-wide store
// js/theme.js resolves at apply() time — a saved theme needs no CSS shipped
// anywhere, and appears as a real radio in every rux-ds app's account panel
// on this origin (js/profile.js clones it in). `previewingSaved` is a third,
// read-only preview source alongside the two sections' own live edits: any
// edit to either section clears it, so live editing always wins the shared
// preview back.
import { runKey, sameRun, RUN_MS, copy, CAP } from '../builder/session.mjs';
import { contrastRatio, meetsThreshold, normaliseHex } from './contrast.mjs';

const NAME_RE = /^[a-z][a-z0-9-]*$/;
const RESERVED = new Set(['white', 'g10', 'g90', 'g100', 'geist', 'linear']);

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

// The four compiled bases a surface overlay may sit on, their fixed
// text-primary and text-on-color, and the twenty-nine tokens the section
// offers with what each one's contrast badge is measured against. Never
// `geist` (or any other CSS-override theme) — "base" means exactly one of
// Carbon's own compiled themes.
//
// READ FROM THE PAGE, NOT MIRRORED. This was a hand-kept copy of
// tools/build-theme-creator.mjs's BASES until 2026-09-08, and the comment
// here named the risk it carried: "a mismatch between the two would seed
// the wrong defaults silently". Four tokens made that a comment; twenty-nine
// across four bases would have made it a hundred and sixteen values kept in
// step by discipline. The generator now reads them out of css/rux.css and
// emits them as JSON, and this parses that. A missing or malformed block is
// fatal on purpose — seeding an empty base would look like a theme whose
// every surface is blank rather than like a build fault.
const surfaceData = JSON.parse(document.getElementById('thc-surface-data').textContent);
const BASES = surfaceData.bases;
const SURFACE_TOKENS = surfaceData.tokens.map(([name]) => name);
const SURFACE_CHECK = Object.fromEntries(surfaceData.tokens);
const defaultSurface = () => ({ base: 'white', name: '', tokens: { ...BASES.white.tokens } });

const DRAFT_KEY = 'rux.theme-draft';
const DRAFT_VERSION = 1;
const $ = id => document.getElementById(id);

const defaults = JSON.parse($('thc-defaults').textContent);
const tokenNames = Object.keys(defaults);

let scenarios = [];
let families = {};

let state = { name: '', tokens: copy(defaults), surface: defaultSurface() };
let history = { past: [], future: [] };
let openRun = null; // { key, at } — see builder/session.mjs's own comment on runs.
let activeSection = 'accent'; // 'accent' | 'surface' — which one the preview/status line reflects.

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
  renderEverything();
}
function redo() {
  if (!history.future.length) return;
  history.past.push(copy(state));
  state = history.future.pop();
  openRun = null;
  renderEverything();
}

function editToken(token, hex, { coalesce } = { coalesce: true }) {
  const key = runKey('theme-creator', token);
  const now = Date.now();
  if (!(coalesce && sameRun(openRun, key, now))) pushSnapshot();
  openRun = { key, at: now };
  state.tokens[token] = normaliseHex(hex) ?? hex;
}

function applyFamily(familyName) {
  const family = families[familyName];
  if (!family) return;
  pushSnapshot();
  for (const [token, shade] of Object.entries(SHADE_MAP)) state.tokens[token] = family[shade];
}

// ── surfaces (Phase 15) ─────────────────────────────────────────────────
// normaliseHex, not the raw field text: a bare "000000" reads as a colour to
// the contrast badge and to nothing else, so storing it raw drew a green
// ratio next to a transparent swatch over a preview that never moved. The
// raw value is still kept when it does not parse at all, so a half-typed
// hex behaves as it always has — no verdict yet rather than a warning.
function editSurfaceToken(token, hex) {
  const key = runKey('theme-creator-surface', token);
  const now = Date.now();
  if (!sameRun(openRun, key, now)) pushSnapshot();
  openRun = { key, at: now };
  state.surface.tokens[token] = normaliseHex(hex) ?? hex;
}

function applyBase(baseName) {
  const base = BASES[baseName];
  if (!base) return;
  pushSnapshot();
  state.surface.base = baseName;
  state.surface.tokens = { ...base.tokens };
}

function surfaceNameProblem(name) {
  if (!name) return 'name the surface first';
  if (!NAME_RE.test(name)) return 'must start with a letter and hold only lowercase letters, digits and hyphens';
  return null;
}

// ── name validation ─────────────────────────────────────────────────────
function nameProblem(name) {
  if (!NAME_RE.test(name)) return 'must start with a letter and hold only lowercase letters, digits and hyphens';
  if (RESERVED.has(name)) return `"${name}" is a compiled Carbon theme, not a surface this tool layers over`;
  return null;
}

// THE NAME A PREVIEW AND ITS EXPORT BLOCK BOTH USE. Until 2026-09-08 an
// unusable name PAUSED the preview outright, which read as a dead tool:
// someone editing colours saw nothing move, and the reason printed in a
// status line at the top of the page, far above the fields being typed in.
// The colours are what a person is judging; the name is what they fill in
// last. So an unusable name — empty, malformed, or one of Carbon's compiled
// themes — previews under a placeholder instead.
//
// BOTH CALLERS MUST RESOLVE IT THE SAME WAY. The preview writes this into
// <html data-theme>, and the CSS block writes it into the selector; if they
// disagree the selector matches nothing and the preview shows the base with
// NO override, silently and looking plausible. The `|| 'your-theme'` these
// replaced covered only the empty case, so a reserved name like "g10" would
// have done exactly that.
const previewThemeName = () => (nameProblem(state.name) ? 'your-theme' : state.name);
const previewSurfaceName = () => (surfaceNameProblem(state.surface.name) ? 'your-surface' : state.surface.name);

// ── saving (Phase 16) ───────────────────────────────────────────────────
// Stricter than nameProblem/surfaceNameProblem, and only for the Save
// button: persisting a saved theme under a reserved name (caught above,
// in generalProblem), or under a name already saved as the OTHER kind, is
// what gets refused. `forKind` is the kind this section would save as, so
// a theme already saved under the SAME kind is not a collision — that is
// an overwrite, decided inside Rux.customThemes.save() itself. Nothing
// named "rux" is special here any more: the shipped purple accent this
// tool used to seed by default was retired as a file default (roadmap
// §4.10's amendment) — this section now starts from Carbon's own white
// values (the defaults embedded below) and "rux" is free for anyone to
// save their own theme under, the same as any other name.
function saveNameProblem(name, forKind, generalProblem) {
  if (generalProblem) return generalProblem;
  const existing = window.Rux?.customThemes?.get(name);
  if (existing && existing.kind !== forKind) return `"${name}" is already saved as a${existing.kind === 'accent' ? 'n' : ''} ${existing.kind} theme`;
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

function renderSurfaceRow(token) {
  const input = $(`thc-surf-${token}`);
  const value = state.surface.tokens[token];
  if (document.activeElement !== input) input.value = value;
  const swatch = $(`thc-surf-swatch-${token}`);
  if (swatch) swatch.style.background = /^#[0-9a-f]{3,8}$/i.test(value) ? value : 'transparent';
}

// ONE THRESHOLD DOES NOT FIT TWENTY-NINE TOKENS. Until 2026-09-08 every
// surface was scored against text-primary at 4.5:1, which was right while
// the section offered four backgrounds and nothing else. A hairline is not
// a background: scoring border-subtle-01 against body text would report
// every border Carbon ships in its OWN themes as a failure, and a warning
// that is always on is a warning nobody reads. So each token carries what
// it is measured against:
//
//   text      the base's text-primary on this surface, 4.5:1
//   on-color  the secondary button's fixed white label, 4.5:1
//   edge      an outline drawn ON the base's background, 3:1 — WCAG's
//             non-text threshold, which border-strong meets in all four of
//             Carbon's themes (3.02 in g10 up to 8.86 in g90)
//   hairline  REPORTED, NOT JUDGED. border-subtle is below 3:1 against its
//             own background in eleven of sixteen Carbon cases (white 1.32
//             and 1.71, g10 1.20 and 1.55, g100 1.57 and 2.32) because it
//             is a faint divider by design. Giving it a threshold would
//             have shown red on an unedited theme, so it gets a neutral
//             badge with the number and no verdict.
//
// The comparison colour for an edge or a hairline is the base's own
// background, not the edited one: a border is judged against the ground
// Carbon puts it on.
function renderSurfaceContrast() {
  const base = BASES[state.surface.base];
  const AGAINST = { 'on-color': base.onColor, edge: base.tokens.background, hairline: base.tokens.background, text: base.text };
  const LABEL = { 'on-color': 'text-on-color', edge: 'on the page background', hairline: 'on the page background', text: 'text-primary' };
  for (const token of SURFACE_TOKENS) {
    const el = document.querySelector(`#thc-surface-rows .thc-badge[data-token="${token}"]`);
    if (!el) continue;
    const kind = SURFACE_CHECK[token] ?? 'text';
    const ratio = contrastRatio(AGAINST[kind], state.surface.tokens[token]);
    if (ratio === null) { el.textContent = 'unreadable colour'; el.className = 'thc-badge'; continue; }
    if (kind === 'hairline') {
      el.textContent = `${LABEL[kind]} — ${ratio.toFixed(1)}:1 (no threshold)`;
      el.className = 'thc-badge';
      continue;
    }
    const threshold = kind === 'edge' ? 3 : 4.5;
    const pass = meetsThreshold(ratio, threshold);
    el.textContent = `${LABEL[kind]} — ${ratio.toFixed(1)}:1 (needs ${threshold}:1)`;
    el.className = `thc-badge ${pass ? 'thc-badge--pass' : 'thc-badge--warn'}`;
  }
}

function renderSurfaceAll() {
  for (const t of SURFACE_TOKENS) renderSurfaceRow(t);
  renderSurfaceContrast();
  renderHistoryButtons();
  renderSurfaceExport();
  schedulePreview();
  scheduleSave();
}

function renderEverything() {
  renderAll();
  renderSurfaceAll();
}

// ── export ──────────────────────────────────────────────────────────────
function cssBlock() {
  const lines = tokenNames.map(t => `  --rux-${t}: ${state.tokens[t]};`);
  return `[data-theme="${previewThemeName()}"] {\n${lines.join('\n')}\n}\n`;
}
function renderExport() {
  $('thc-export').textContent = cssBlock();
  const problem = nameProblem(state.name);
  $('thc-name-helper').textContent = problem
    ? `Not usable as a theme name yet: ${problem}.`
    : 'Lowercase letters, digits and hyphens; not white, g10, g90 or g100 — those are compiled Carbon themes, not a surface to layer over.';
}

// The compound selector — background/layer-01/02/03 only, on top of the
// chosen base, never a fifth compiled theme. See the header comment for why.
function surfaceCssBlock() {
  const name = previewSurfaceName();
  const lines = SURFACE_TOKENS.map(t => `  --rux-${t}: ${state.surface.tokens[t]};`);
  return `[data-theme="${state.surface.base}"][data-rux-surface="${name}"] {\n${lines.join('\n')}\n}\n`;
}
function renderSurfaceExport() {
  const name = previewSurfaceName();
  const usage = `<!-- on <html>: data-theme="${state.surface.base}" data-rux-surface="${name}" -->\n`;
  $('thc-surface-export').textContent = usage + surfaceCssBlock();
  const problem = surfaceNameProblem(state.surface.name);
  $('thc-surf-name-helper').textContent = problem
    ? `Not usable as a surface name yet: ${problem}.`
    : 'Lowercase letters, digits and hyphens. Becomes the data-rux-surface value.';
}

// ── draft ───────────────────────────────────────────────────────────────
function scheduleSave() {
  clearTimeout(scheduleSave._t);
  scheduleSave._t = setTimeout(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ v: DRAFT_VERSION, name: state.name, tokens: state.tokens, surface: state.surface, savedAt: Date.now() }));
    } catch { /* storage may be unavailable; the draft is a convenience, not a promise */ }
  }, 500);
}
// `surface` is read tolerantly, not version-gated: it's an additive field a
// Phase-14-era draft never had, so a missing or malformed one falls back to
// defaultSurface() rather than invalidating a draft that is otherwise fine.
function loadDraft() {
  let raw;
  try { raw = localStorage.getItem(DRAFT_KEY); } catch { return null; }
  if (!raw) return null;
  let d;
  try { d = JSON.parse(raw); } catch { return null; }
  if (!d || d.v !== DRAFT_VERSION || typeof d.name !== 'string' || typeof d.tokens !== 'object' || !d.tokens) return null;
  for (const t of tokenNames) if (typeof d.tokens[t] !== 'string') return null;
  let surface = defaultSurface();
  const s = d.surface;
  if (s && typeof s === 'object' && BASES[s.base] && typeof s.name === 'string' && s.tokens
    && SURFACE_TOKENS.every(t => typeof s.tokens[t] === 'string')) {
    surface = { base: s.base, name: s.name, tokens: { ...s.tokens } };
  }
  return { name: d.name, tokens: d.tokens, surface };
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

// Set to a saved record while its own Preview button is the last thing
// clicked; cleared the moment any accent/surface field is edited again, so
// live editing always wins back the shared preview.
let previewingSaved = null;

function savedCssBlock(t) {
  const lines = Object.entries(t.tokens).map(([k, v]) => `  --rux-${k}: ${v};`);
  const selector = t.kind === 'surface' ? `[data-theme="${t.base}"][data-rux-surface="${t.id}"]` : `[data-theme="${t.id}"]`;
  return `${selector} {\n${lines.join('\n')}\n}\n`;
}

let previewObjectUrl = null;

// WHAT THE FRAME CURRENTLY HOLDS, and the fetched page keyed by target.
// Both exist to keep a keystroke from reloading the frame — see the
// in-place path in buildPreview.
let frameHolds = null;
const fetchedPages = new Map();
const INJECTED_ID = 'thc-injected-theme';

async function buildPreview() {
  const target = $('thc-target').value;
  const status = $('thc-preview-status');
  const onSurface = activeSection === 'surface';
  let dataTheme, dataSurface, styleBlock, label;
  if (previewingSaved) {
    const t = previewingSaved;
    dataTheme = t.kind === 'surface' ? t.base : 'white';
    dataSurface = t.kind === 'surface' ? t.id : null;
    styleBlock = savedCssBlock(t);
    label = `saved theme "${t.id}"`;
  } else {
    // Never pauses. An unusable name stands in as a placeholder and the
    // status line says so, rather than withholding the preview someone is
    // editing colours to see.
    const problem = onSurface ? surfaceNameProblem(state.surface.name) : nameProblem(state.name);
    const name = onSurface ? previewSurfaceName() : previewThemeName();
    dataTheme = onSurface ? state.surface.base : name;
    dataSurface = onSurface ? name : null;
    styleBlock = onSurface ? surfaceCssBlock() : cssBlock();
    label = onSurface ? `surface "${name}" on ${state.surface.base}` : `theme "${name}"`;
    if (problem) label += ` — placeholder name, ${problem}`;
  }
  const setStatus = () => { status.textContent = label ? `Previewing ${target} — ${label}.` : `Previewing ${target}.`; };

  // A KEYSTROKE MUST NOT RELOAD THE FRAME. Every edit used to refetch the
  // target (kitchen-sink.html is ~490 KB, and cache: 'no-store' meant the
  // network every time) and assign a fresh Blob to frame.src — a full
  // reload, so the page reparsed, all seventeen behaviour modules re-ran,
  // and its scroll position went back to the top. Typing a word did that
  // several times. It was always so; pinning the preview beside the fields
  // is what made it impossible to ignore.
  //
  // Nothing about a token edit needs a reload: the theme is carried by one
  // injected <style> and two attributes on <html>. When the frame already
  // holds this target, rewrite those three in place. The preview then keeps
  // its scroll and whatever the visitor had open, which is the behaviour
  // someone comparing two colours actually wants.
  //
  // js/theme.js does not re-run on this path, so nothing strips
  // data-rux-surface and the re-assert below is only needed on a real load.
  if (frameHolds === target) {
    const doc = $('thc-frame').contentDocument;
    const injected = doc && doc.getElementById(INJECTED_ID);
    if (injected) {
      injected.textContent = styleBlock;
      doc.documentElement.dataset.theme = dataTheme;
      if (dataSurface) doc.documentElement.setAttribute('data-rux-surface', dataSurface);
      else doc.documentElement.removeAttribute('data-rux-surface');
      setStatus();
      return;
    }
  }

  // Full load: a different target, or the first build. The fetched page is
  // kept so switching targets back and forth is not another 490 KB.
  let html = fetchedPages.get(target);
  if (html === undefined) {
    try {
      html = await fetch(target, { cache: 'no-store' }).then(r => r.text());
    } catch {
      status.textContent = `Could not load ${target} for the preview.`;
      return;
    }
    fetchedPages.set(target, html);
  }
  html = rebase(html);
  html = html.replace(/<html\b([^>]*)\sdata-theme="[^"]*"/, `<html$1 data-theme="${dataTheme}"${dataSurface ? ` data-rux-surface="${dataSurface}"` : ''}`);
  html = html.replace(/(<script[^>]*\ssrc="js\/theme\.js")/, `${PROFILE_SHIM}\n$1`);
  // js/theme.js's clearOverrides() removes data-rux-surface the moment it
  // runs — right on a real page, where it is switching away from a custom
  // theme, and fatal here, because it strips the attribute written on the
  // line above and the surface block's compound selector then matches
  // nothing. The preview showed the untouched base and looked plausible.
  // THE SURFACES PREVIEW HAD NEVER APPLIED; found 2026-09-08 by reading the
  // frame, not the code, since every gate and both files were individually
  // correct. Re-asserted here rather than before </head> by accident: this
  // runs after theme.js because theme.js is earlier in the same <head>. The
  // accent section was never affected — clearOverrides leaves data-theme
  // alone, and apply() returns before setting one when the shimmed profile
  // reads null.
  const reassert = dataSurface
    ? `<script>/* preview only — not in the export */document.documentElement.setAttribute('data-rux-surface',${JSON.stringify(dataSurface)});</script>`
    : '';
  html = html.replace('</head>', `<style id="${INJECTED_ID}">${styleBlock}</style>${reassert}\n</head>`);

  const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  const frame = $('thc-frame');
  const prior = previewObjectUrl;
  previewObjectUrl = url;
  frameHolds = target;
  frame.addEventListener('load', () => { if (prior) URL.revokeObjectURL(prior); }, { once: true });
  frame.src = url;
  setStatus();
}
function schedulePreview() {
  clearTimeout(schedulePreview._t);
  schedulePreview._t = setTimeout(buildPreview, 250);
}

// ── saved themes (Phase 16) ──────────────────────────────────────────────
function renderSavedThemes() {
  const list = $('thc-saved-list');
  const empty = $('thc-saved-empty');
  const template = $('thc-saved-theme-template');
  if (!list || !template) return;
  const saved = window.Rux?.customThemes?.list() ?? [];
  empty.hidden = saved.length > 0;
  list.textContent = '';
  for (const t of saved) {
    const row = template.content.cloneNode(true);
    const label = row.querySelector('[data-role="label"]');
    label.textContent = t.kind === 'surface' ? `${t.id} — surface on ${t.base}` : `${t.id} — accent`;
    row.querySelector('[data-act="preview"]').addEventListener('click', () => {
      previewingSaved = t;
      buildPreview();
    });
    row.querySelector('[data-act="delete"]').addEventListener('click', () => {
      if (!confirm(`Delete the saved theme "${t.id}"? This removes it from every rux-ds app's account panel on this browser.`)) return;
      window.Rux.customThemes.remove(t.id);
      if (previewingSaved?.id === t.id) previewingSaved = null;
      renderSavedThemes();
      schedulePreview();
    });
    list.appendChild(row);
  }
}

function saveAccentTheme() {
  const status = $('thc-save-status');
  const problem = saveNameProblem(state.name, 'accent', nameProblem(state.name));
  if (problem) { status.textContent = `Not saved: ${problem}.`; return; }
  const result = window.Rux.customThemes.save({ id: state.name, kind: 'accent', tokens: { ...state.tokens } });
  status.textContent = result.ok ? `Saved as "${state.name}".` : `Not saved: ${result.reason}.`;
  if (result.ok) renderSavedThemes();
}

function saveSurfaceTheme() {
  const status = $('thc-surface-save-status');
  const problem = saveNameProblem(state.surface.name, 'surface', surfaceNameProblem(state.surface.name));
  if (problem) { status.textContent = `Not saved: ${problem}.`; return; }
  const result = window.Rux.customThemes.save({ id: state.surface.name, kind: 'surface', base: state.surface.base, tokens: { ...state.surface.tokens } });
  status.textContent = result.ok ? `Saved as "${state.surface.name}".` : `Not saved: ${result.reason}.`;
  if (result.ok) renderSavedThemes();
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
    $(`thc-tok-${t}`).addEventListener('input', e => { activeSection = 'accent'; previewingSaved = null; editToken(t, e.target.value); renderRow(t); renderExport(); schedulePreview(); scheduleSave(); });
    $(`thc-tok-${t}`).addEventListener('blur', () => { openRun = null; });
  }
  $('thc-family').addEventListener('change', e => {
    if (!e.target.value) return;
    activeSection = 'accent';
    previewingSaved = null;
    applyFamily(e.target.value);
    renderAll();
  });
  $('thc-name').addEventListener('input', e => { activeSection = 'accent'; previewingSaved = null; state.name = e.target.value; renderExport(); schedulePreview(); scheduleSave(); });
  $('thc-save').addEventListener('click', saveAccentTheme);
  $('thc-undo').addEventListener('click', undo);
  $('thc-redo').addEventListener('click', redo);
  $('thc-start-over').addEventListener('click', () => {
    pushSnapshot();
    state = { name: '', tokens: copy(defaults), surface: defaultSurface() };
    renderEverything();
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

  // ── surfaces ──────────────────────────────────────────────────────────
  for (const t of SURFACE_TOKENS) {
    $(`thc-surf-${t}`).addEventListener('input', e => {
      activeSection = 'surface';
      previewingSaved = null;
      editSurfaceToken(t, e.target.value);
      renderSurfaceRow(t); renderSurfaceContrast(); renderSurfaceExport();
      schedulePreview(); scheduleSave();
    });
    $(`thc-surf-${t}`).addEventListener('blur', () => { openRun = null; });
  }
  document.querySelectorAll('input[name="thc-surf-base"]').forEach(r => r.addEventListener('change', e => {
    activeSection = 'surface';
    previewingSaved = null;
    applyBase(e.target.value);
    renderSurfaceAll();
  }));
  $('thc-surf-name').addEventListener('input', e => {
    activeSection = 'surface';
    previewingSaved = null;
    state.surface.name = e.target.value;
    renderSurfaceExport(); schedulePreview(); scheduleSave();
  });
  $('thc-surface-save').addEventListener('click', saveSurfaceTheme);
  $('thc-surface-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(surfaceCssBlock()); $('thc-preview-status').textContent = 'Copied.'; }
    catch { $('thc-preview-status').textContent = 'Could not copy — select the text and copy it by hand.'; }
  });
  $('thc-surface-download').addEventListener('click', () => {
    const blob = new Blob([surfaceCssBlock()], { type: 'text/css' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rux-theme.css';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  window.addEventListener('rux:customthemeschange', renderSavedThemes);
  window.addEventListener('storage', e => { if (e.key === window.Rux?.customThemes?.KEY) renderSavedThemes(); });

  const draft = loadDraft();
  if (draft) state = { name: draft.name, tokens: draft.tokens, surface: draft.surface };

  renderEverything();
  renderSavedThemes();
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
