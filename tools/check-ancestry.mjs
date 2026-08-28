#!/usr/bin/env node
//
// Is a wrapper the reference ALWAYS renders simply missing from our markup?
//
// THE DEFECT THIS EXISTS FOR. modal's close button rendered in the flow under
// the heading, left-aligned, with a 3rem gutter empty beside it, because the
// fragment had no `modal-close-button` — the element carrying
// `position: absolute; inset-block-start: 0; inset-inline-end: 0`, which is the
// whole of how Carbon pins that X to the corner. Nothing caught it:
//   * check-tags asks which ELEMENT TYPE a class sits on. The button was a
//     <button>, which is correct.
//   * check-compound asks which classes Carbon writes together ON ONE ELEMENT.
//     A wrapper is a different element, so it is a different question.
//   * diff-fragment says in its own header that it reports nesting that
//     DISAGREES, not nesting that is ABSENT, because an unclassed parent on our
//     side cannot be told apart from a missing one.
// A wrapper that is simply not there was invisible to all three, and the README
// has now been right three times that only looking finds this class of defect.
//
// THE RULE, and it is deliberately the strongest one available. For class X,
// take every occurrence of X across all 641 captures and intersect their sets
// of classed ancestors. What survives is the set of classes Carbon puts above X
// WITHOUT EXCEPTION — not usually, not in the story we happened to copy. If one
// of those is absent from X's ancestors here, that is the finding.
//
// Intersection rather than union is what keeps this quiet. A wrapper that only
// some variants use — an AI decorator, a tooltip on one story's button — drops
// out on the first occurrence that lacks it, so the gate never demands a
// composition Carbon treats as optional.
//
// A CLASS MUST BE CORROBORATED BEFORE ITS ANCESTRY IS A RULE. Intersecting one
// occurrence yields that occurrence's whole chain, which is a description of one
// story rather than a requirement: `tooltip__trigger` appears once, inside a
// fluid form's password input, and the first draft of this gate duly demanded
// `password-input-wrapper` above every tooltip trigger in the sink. Ancestors are
// only trusted for a class seen in at least MIN_STORIES distinct captures, where
// coincidental wrappers have had a chance to drop out.
//
// A MODIFIER ON AN ANCESTOR WE ALREADY HAVE IS NOT A MISSING WRAPPER, and
// conflating the two was most of this gate's first run. Carbon renders menu items
// only while the menu is open, so every capture of `menu-item` sits inside
// `menu--open menu--shown` and the intersection duly required both — of a sink
// whose menu starts closed on purpose. Same for `list-box--expanded` over dropdown
// options, `number--helpertext`, `tabs--dismissable`, and
// `data-table--visible-overflow-menu` over every expansion row. In each the BLOCK
// is already an ancestor and only the modifier is absent, which is a question about
// state or variant rather than structure — check-tags and check-co-classes own
// that ground. This gate asks one thing: is an ELEMENT missing.
//
// TWO EXCLUSIONS, both of them structural rather than tuning:
//   * Storybook chrome (`layout`, `layout-constraint--*`, `sb-*`) wraps every
//     capture and would be required above everything.
//   * An ancestor owned by a component the manifest does not compile can never
//     be satisfied — `decorator` and `ai-label` are cut, and the keep-core rule
//     forbids removing their hooks from the components that ship. Demanding
//     them would leave the gate permanently red with no action available, which
//     is the same reasoning check-coverage gives for skipping stripped rows.
//
// Everything else that is deliberate goes in KNOWN, with its reason, on
// check-tags' precedent — it was promoted from diagnostic to gate only after
// every finding of its first full run had been adjudicated.
//
//   node tools/check-ancestry.mjs            gate: fail on anything not in KNOWN
//   node tools/check-ancestry.mjs --all      show KNOWN entries too
//
import { readFileSync } from 'node:fs';
import { markupFiles } from './lib/sources.mjs';
import { owner, compiled } from './lib/ownership.mjs';

const REF_PATHS = [
  'docs/carbon-react-dom.json',
  'docs/carbon-ibm-products-dom.json',
  'docs/carbon-react-states.json',
  'docs/carbon-ibm-products-states.json',
];
const PREFIX = /^(?:cds|c4p)--/;
const CHROME = /^(layout|layout-constraint--.*|sb-.*)$/;
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
  'use', 'path', 'circle', 'rect', 'polygon', 'stop', 'ellipse', 'line']);

// Adjudicated divergences. `fragment:class` -> [ancestors we decline, reason].
// A reason is required: an entry without one is a defect with a lid on it.
// The icon-tooltip the sink declines EVERYWHERE. Carbon gives most icon-only
// buttons a hover hint built from a popover, and that popover is positioned by
// floating-ui — Phase 5 behaviour the sink has not written. Declining it is a
// standing decision with its own note in overflow-menu.html, combo-button and
// the table's overflow trigger; this is the same call, listed once.
const TOOLTIP_CHROME = ['popover-container', 'popover--caret', 'popover--high-contrast',
  'popover--top', 'popover--bottom', 'popover--left', 'tooltip', 'icon-tooltip',
  'tooltip-trigger__wrapper'];

// Adjudicated divergences. `fragment:class` -> [ancestors declined, reason].
// A REASON IS REQUIRED: an entry without one is a defect with a lid on it, and
// two of this gate's first-run findings — modal's close button and pagination's
// control buttons — were exactly that, sitting behind notes that named the
// optional wrapper and never mentioned the load-bearing one.
const KNOWN = {
  'buttons:btn--expressive': [['content', 'btn-set'],
    'the sink demos a standalone expressive button. `btn-set` contributes only '
    + '`max-inline-size: 20rem` to buttons inside a group, and `content` is the shell '
    + 'page region every capture is mounted in.'],
  'buttons:inline-loading__animation': [['inline-loading'],
    'already recorded in the fragment: NO story renders `btn--loading` at all, so '
    + 'there is no sampled composition to match. The pairing follows the CSS, which '
    + 'scopes btn--loading to `.rux--btn-set .rux--btn.rux--btn--loading`.'],
  'dropdown:list-box__invalid-icon': [['dropdown__wrapper'],
    '@carbon/styles defines `dropdown__wrapper` only in its --inline form, so outside '
    + 'that variant it styles nothing; `list-box__wrapper` is the styled wrapper and is '
    + 'present. Recorded in the fragment (roadmap §4.1.12).'],
  'list-box:list-box__invalid-icon': [['dropdown__wrapper', 'dropdown'],
    'same as dropdown: the wrapper class is unstyled outside --inline, and this '
    + 'fragment demos the list-box on its own rather than as a dropdown.'],
  'links:link--disabled': [['data-table-container', 'data-table-content', 'data-table'],
    'a sampling artifact rather than a rule. Every capture that disables a link '
    + 'happens to be a table cell, so the intersection keeps the table above it — but '
    + 'nothing in the CSS scopes `link--disabled` to a table.'],
  'modal:modal-close': [TOOLTIP_CHROME,
    'the icon-tooltip the sink declines throughout. The POSITIONING wrapper, '
    + 'modal-close-button, is present — dropping that one was the defect this gate '
    + 'was written for.'],
  'modal:modal-close__icon': [[...TOOLTIP_CHROME, 'btn', 'btn--primary', 'btn--icon-only'],
    'the tooltip chrome as everywhere else, plus the btn classes on the close button. '
    + 'Those are declined on measurement: `modal-close` sets its own 3rem box, '
    + 'transparent background and padding, and is emitted after `button` in the '
    + 'manifest, so they add nothing but a chance for the cascade to move on a bump. '
    + 'The POSITIONING wrapper, modal-close-button, is present — dropping that one was '
    + 'the defect this gate was written for.'],
  'overflow-menu:overflow-menu': [TOOLTIP_CHROME, 'the icon-tooltip the sink declines throughout'],
  'pagination:pagination__button': [TOOLTIP_CHROME,
    'the icon-tooltip the sink declines throughout. `pagination__control-buttons`, the '
    + 'STYLED wrapper the same note used to omit, is present as of 2026-08-28.'],
  'table:toolbar-action': [['popover-container'], 'the icon-tooltip the sink declines throughout'],
  'table:overflow-menu': [TOOLTIP_CHROME, 'the icon-tooltip the sink declines throughout'],
  'table:btn--icon-only': [TOOLTIP_CHROME, 'the icon-tooltip the sink declines throughout'],
  'table:overflow-menu__icon': [TOOLTIP_CHROME, 'the icon-tooltip the sink declines throughout'],
  'ui-shell:btn--icon-only': [TOOLTIP_CHROME, 'the icon-tooltip the sink declines throughout'],
  // Same call as ui-shell's, made once more where it is load-bearing: these
  // are the header actions of a page TEMPLATE, not a specimen. The name is
  // carried by aria-label, so a screen reader is served; what the decline
  // costs is the hover label a sighted pointer user would get from Carbon.
  'templates/app-shell:btn--icon-only': [TOOLTIP_CHROME, 'the icon-tooltip the sink declines throughout; aria-label carries the name'],
  // THE SAME DECLINE, SIXFOLD, because KNOWN is keyed per file and the table
  // page is the first file to hold all of these at once. Every entry below is
  // the icon-tooltip chrome, already declined for the sink under pagination:,
  // table: and overflow-menu:. `--no-index` additionally wants
  // `icon-tooltip--disabled`, which is the same wrapper in its disabled form.
  'templates/form-page:btn--icon-only': [TOOLTIP_CHROME, 'the icon-tooltip the sink declines throughout'],
  'templates/table-page:btn--icon-only': [TOOLTIP_CHROME, 'the icon-tooltip the sink declines throughout'],
  'templates/table-page:toolbar-action': [['popover-container'], 'the icon-tooltip the sink declines throughout'],
  'templates/table-page:overflow-menu': [TOOLTIP_CHROME, 'the icon-tooltip the sink declines throughout'],
  'templates/table-page:overflow-menu__icon': [TOOLTIP_CHROME, 'the icon-tooltip the sink declines throughout'],
  'templates/table-page:pagination__button': [[...TOOLTIP_CHROME, 'popover--top'],
    'the icon-tooltip the sink declines throughout'],
  'templates/table-page:pagination__button--no-index': [[...TOOLTIP_CHROME, 'popover--top', 'icon-tooltip--disabled'],
    'the icon-tooltip the sink declines throughout, in its disabled form'],
  'tooltip:tooltip__trigger': [['form-item', 'text-input-wrapper', 'password-input-wrapper',
    'text-input__field-outer-wrapper', 'text-input__field-wrapper', 'popover--high-contrast',
    'popover--bottom-end', 'toggle-password-tooltip', 'icon-tooltip', 'tooltip-trigger__wrapper'],
    'the only captures of a bare `tooltip__trigger` are the password-visibility toggle '
    + 'inside a fluid text input, so the intersection returns that one composition '
    + 'whole. It is a description of where Carbon happens to demo the class, not a '
    + 'requirement on it; this fragment demos the trigger on its own.'],
};

const COMPILED = compiled();

// --- reference: class -> intersection of its classed-ancestor sets -----------
const MIN_STORIES = 3;

const required = new Map();   // class -> Set | null  (null once intersected empty)
const storyOf = new Map();    // class -> a story id that shows it
const seenIn = new Map();     // class -> Set(story id)
let stories = 0;

for (const path of REF_PATHS) {
  for (const [id, lines] of Object.entries(JSON.parse(readFileSync(path, 'utf8')))) {
    if (lines[0]?.startsWith('(')) continue;
    stories++;
    const openAt = [];   // depth -> classes on the element open at that depth
    for (const line of Object.values(lines)) {
      const depth = (line.match(/^ */)[0].length) / 2;
      const body = line.trim().replace(/\[role=[^\]]*\]/, '').replace(/\{[^}]*\}/, '');
      const classes = body.split('.').slice(1).filter(Boolean)
        .map(c => c.replace(PREFIX, '')).filter(c => !CHROME.test(c));

      // Full chain: every class on every shallower open element.
      const chain = new Set();
      for (let d = 0; d < depth; d++) for (const c of openAt[d] ?? []) chain.add(c);

      for (const c of classes) {
        if (!storyOf.has(c)) storyOf.set(c, id);
        if (!seenIn.has(c)) seenIn.set(c, new Set());
        seenIn.get(c).add(id);
        if (!required.has(c)) { required.set(c, new Set(chain)); continue; }
        const have = required.get(c);
        if (!have) continue;
        for (const a of [...have]) if (!chain.has(a)) have.delete(a);
        if (!have.size) required.set(c, null);
      }
      openAt[depth] = classes;
      openAt.length = depth + 1;
    }
  }
}

// --- ours: every occurrence of a class, with its full classed ancestry -------
function occurrences(html) {
  const src = html.replace(/<!--[\s\S]*?-->/g, '');
  const out = [];
  const stack = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;
  let m;
  while ((m = re.exec(src))) {
    const [, closing, rawTag, attrs, selfClose] = m;
    const tag = rawTag.toLowerCase();
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) if (stack[i].tag === tag) { stack.length = i; break; }
      continue;
    }
    const classes = (attrs.match(/\sclass="([^"]*)"/) ?? [, ''])[1]
      .split(/\s+/).filter(c => c.startsWith('rux--')).map(c => c.slice(5));
    const chain = new Set();
    for (const entry of stack) for (const c of entry.classes) chain.add(c);
    for (const c of classes) out.push({ cls: c, chain });
    if (!(selfClose || VOID.has(tag))) stack.push({ tag, classes });
  }
  return out;
}

const showAll = process.argv.includes('--all');
const findings = [], accepted = [];

for (const file of markupFiles()) {       // sink/*.html + templates/*.html
  const name = file.name;
  const seen = new Map();   // class -> Set(missing ancestors)
  for (const { cls, chain } of occurrences(readFileSync(file.path, 'utf8'))) {
    const need = required.get(cls);
    if (!need?.size) continue;
    if ((seenIn.get(cls)?.size ?? 0) < MIN_STORIES) continue;   // uncorroborated
    for (const a of need) {
      if (chain.has(a)) continue;
      // A modifier on an element we already have: state or variant, not structure.
      const block = a.split('--')[0];
      if (block !== a && chain.has(block)) continue;
      // Unsatisfiable: the ancestor belongs to a component we do not compile.
      const own = owner(`rux--${a}`);
      if (own && !COMPILED.has(own)) continue;
      if (!seen.has(cls)) seen.set(cls, new Set());
      seen.get(cls).add(a);
    }
  }
  for (const [cls, missing] of seen) {
    const known = KNOWN[`${name}:${cls}`];
    const declined = new Set(known?.[0] ?? []);
    const real = [...missing].filter(a => !declined.has(a));
    const row = { name, cls, missing: [...missing], real, reason: known?.[1],
                  story: storyOf.get(cls), seen: seenIn.get(cls)?.size ?? 0 };
    if (real.length) findings.push(row); else if (known) accepted.push(row);
  }
}

for (const f of findings) {
  console.log(`\n  ${f.name}.html`);
  console.log(`      rux--${f.cls}`);
  console.log(`         missing ancestor${f.real.length > 1 ? 's' : ''}  ${f.real.map(a => `.rux--${a}`).join(' ')}`);
  console.log(`         Carbon nests it inside these in EVERY capture that renders it`);
  console.log(`         seen in ${f.seen} captures · e.g. ${f.story}`);
}
if (showAll) for (const a of accepted) {
  console.log(`\n  ${a.name}.html  rux--${a.cls}  DECLINED  ${a.missing.map(x => `.rux--${x}`).join(' ')}`);
  console.log(`         ${a.reason}`);
}

const trusted = [...required].filter(([c, r]) => r?.size && (seenIn.get(c)?.size ?? 0) >= MIN_STORIES).length;
console.log(`\n  ${stories} stories · ${trusted} classes with a corroborated required ancestry`
  + ` · ${accepted.length} declined · ${findings.length} missing`);
if (findings.length) console.log(
  '  a wrapper Carbon never omits is absent here — add it, or record it in KNOWN with a reason\n');
else console.log();
process.exit(findings.length ? 1 : 0);
