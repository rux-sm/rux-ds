// make-marks.mjs -- the favicon and app icons, derived from brand/logo.svg.
//
// THE DRAWING LIVES IN ONE PLACE AND IT IS NOT HERE. brand/logo.svg is the
// mark; rux swaps that file and every shell picks it up on reload with no
// build step. This tool reads it and emits the things a shell CANNOT get from
// an <img>: a favicon, which gets no CSS from the page and so has to carry its
// own light/dark swap, and four 1024px app icons in the colourways a launcher
// or a store listing needs. Swap logo.svg, run `npm run marks`, and these
// follow. Nothing here holds a second copy of the geometry.
//
// WHY THIS REPLACED A MODULE MAP. Until 2026-09-05 this file WAS the drawing:
// an 11x10 ASCII grid traced from a Linearity export, with three layers and
// per-variant colour rules. That made it the single source, which was right
// while nothing else held the mark -- and wrong the moment brand/logo.svg
// became the file a person edits. Two sources drift; the older one wins by
// accident. So the grid is gone and the reader is the whole tool.
//
// Run: npm run marks  (node tools/make-marks.mjs, from the repo root --
//      the output paths are relative to cwd)

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SRC = 'brand/logo.svg';
const src = readFileSync(SRC, 'utf8');

// The mark is axis-aligned rectangles written as <path d="...Z"/>. Take the d=
// strings VERBATIM: this tool never reparses or re-emits coordinates, so it
// cannot round, reorder or otherwise quietly redraw what rux drew.
const paths = [...src.matchAll(/<path d="([^"]+)"\s*\/>/g)].map((m) => m[1]);
const viewBox = src.match(/viewBox="([^"]+)"/)?.[1];
if (!paths.length || !viewBox) {
  console.error(`${SRC}: no <path d="..."/> or no viewBox. If the mark was`);
  console.error('redrawn with <rect>, <polygon> or a transform, this tool must');
  console.error('be taught that shape rather than guessing at it.');
  process.exit(1);
}

// Carbon tokens, read from @carbon/themes. TWO VALUES, AND THAT IS THE BRAND
// RULE: the mark is neutral, never coloured. rux decided this on 2026-09-05
// after seeing the blue favicon live -- black and white or neutral greys, the
// same off-white the header already uses, and nothing else to keep in step.
const INK   = '#161616';  // gray-100 -- the mark on a LIGHT surface (18.10 on #ffffff)
const PAPER = '#f4f4f4';  // gray-10  -- the mark on a DARK surface  (16.45 on #161616)

// TWO ICONS, not four. The old set crossed (surface) x (mono | brand); with
// the brand rule above there is no blue arm left, so light-blue and dark-blue
// would have been byte-identical to their mono twins. Two files that differ is
// better than four where two are duplicates nobody can tell apart.
//
// Contrast is against the surface each name is FOR, not against white in both.
const VARIANTS = {
  light: { fill: INK,   on: '#ffffff', ratio: '18.10' },
  dark:  { fill: PAPER, on: INK,       ratio: '16.45' },
};

// GUARD, not a parser. A "--" inside an XML comment is illegal, and the SVG
// it produces serves 200 OK and renders 0x0 -- invisible in a network tab and
// invisible in the markup. That has now shipped twice: from brand/logo.svg on
// 2026-09-04 and from this file's own icon comment on 2026-09-05. Reasoning
// about it caught neither; only opening the page did. So it is checked here.
//
// It checks THAT ONE FAULT and says so. Node ships no DOMParser and this
// repository vendors no library to get one, so this is not well-formedness in
// general -- an unclosed tag would still get past it.
function assertNoDoubleHyphen(name, svg) {
  for (const m of svg.matchAll(/<!--([\s\S]*?)-->/g)) {
    if (m[1].includes('--') || m[1].endsWith('-')) {
      console.error(`${name}: "--" inside an XML comment, or a comment ending in "-".`);
      console.error('Illegal XML. The file will serve 200 OK and render 0x0.');
      console.error(`  ${m[0].slice(0, 120).replace(/\n/g, ' ')}`);
      process.exit(1);
    }
  }
}

const A11Y = 'role="img" aria-label="Rux"';
const body = paths.map((d) => `<path d="${d}"/>`).join('\n');

mkdirSync('assets/brand', { recursive: true });
const emit = (name, svg) => {
  const out = svg.replace(/\n{2,}/g, '\n').trim() + '\n';
  assertNoDoubleHyphen(`assets/brand/${name}`, out);
  writeFileSync(`assets/brand/${name}`, out);
  console.log(`  assets/brand/${name}`);
};

// ------------------------------------------------------------- 1. app icons
// The canvas is the drawing's own, untouched. rux centred the mark inside it
// with a module of air left and right and two top and bottom, which is already
// inside the 28-of-32 safe area an icon wants -- so there is nothing to scale
// and no origin to compute, and no chance of the 1.10x stretch the old hand
// exports had. Transparent ground: a launcher supplies its own.
for (const [name, { fill, on, ratio }] of Object.entries(VARIANTS)) {
  emit(`icon-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="${fill}" ${A11Y}>
<title>Rux</title>
<!-- ${fill} on ${on}, ${ratio}:1. Generated from ${SRC} by tools/make-marks.mjs.
     Edit that file, not this one. -->
${body}
</svg>`);
}

// --------------------------------------------------------------- 2. favicon
// Self-theming, because a favicon gets no CSS from the page: the light/dark
// swap has to live inside the file, and a browser that ignores the media query
// keeps the light values. NEUTRAL, not brand colour: gray-100 on a light tab
// strip, gray-10 on a dark one -- the same off-white the shell header uses, so
// the tab icon and the header mark are the same drawing in the same value.
// It goes in brand/, NOT assets/brand/, and that is the ownership rule this
// repository already uses for logo.svg: brand/ is what a project owns and may
// replace, assets/brand/ is rux-ds's own generated set. A consumer that swaps
// its logo swaps its favicon in the same folder.
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${A11Y}>
<title>Rux</title>
<style>
svg{fill:${INK}}
@media (prefers-color-scheme:dark){svg{fill:${PAPER}}}
</style>
${body}
</svg>
`.replace(/\n{2,}/g, '\n').trim() + '\n';
assertNoDoubleHyphen('brand/favicon.svg', favicon);
writeFileSync('brand/favicon.svg', favicon);
console.log('  brand/favicon.svg');

console.log(`\n  ${paths.length} shapes read from ${SRC}, viewBox ${viewBox}`);
console.log('  Geometry copied verbatim. Swap brand/logo.svg and re-run to follow it.');
