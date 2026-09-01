// make-marks.mjs -- the rux-ds mark, generated from one grid.
//
// PROVENANCE: the 11x10 module map below was traced from the Linearity export
// `Rux.png` (1024px, 64px modules at origin 160,192) on 2026-08-31 and verified
// module-for-module against the four hand-exported SVGs. It is the only place
// the drawing is described; every file in assets/brand/ is emitted from it, so
// the variants cannot drift apart.
//
// WHY A GENERATOR: the four exports differed only in two fill values, and each
// carried a separate copy of the geometry. That is four things to keep in sync
// by hand, and the export had already stretched the grid 1.10x vertically.
//
// Run: npm run marks  (node tools/make-marks.mjs, from the repo root --
//      the output paths are relative to cwd)

import { writeFileSync, mkdirSync } from 'node:fs';

// B = body, S = slab (the 11-module head-back mass), F = features (2 eyes +
// nose, 1 module each), . = empty.
//
// WHY THREE LAYERS AND NOT TWO: the hand exports painted the slab and the
// features one colour, which is right for the original artwork (both darker
// than a light body) and wrong the moment the mark inverts. Rendered, a
// two-layer light-mono turns the 11-module slab into a WHITE block -- it stops
// reading as an ear and starts reading as a hole. The slab is silhouette mass;
// the features are punctuation. They do not take the same colour rule.
const GRID = [
  '.SBBBB...B.',
  'SSBFBF....B',
  'SSBBBBBF..B',
  'SSBBBBBB..B',
  'SSBB......B',
  'SSBBBBBBBB.',
  '.BBBBBBBBB.',
  '.BBBBBBBBB.',
  '..BBBBBBBB.',
  '..B.B..B.B.',
];
const COLS = GRID[0].length;   // 11
const ROWS = GRID.length;      // 10

// Carbon tokens, read from @carbon/themes.
const BLUE   = '#0f62fe';  // blue-60,  linkPrimary (white theme)
const BLUE_D = '#78a9ff';  // blue-40,  linkPrimary (g100 theme)
const INK    = '#161616';  // gray-100, background  (g100 theme)
const PAPER  = '#f4f4f4';  // gray-10,  textPrimary (g100 theme)
const MID    = '#8d8d8d';  // gray-50  -- features on a DARK body (light-mono)
const DIM    = '#0f62fe';  // blue-60  -- features on a LIGHT body over #161616;
                           // gray-60 also passes (3.60) but carries no brand colour
const SOFT   = '#393939';  // gray-80,  backgroundInverse (white theme)

// Three contrasts matter, and only the first two are always satisfiable:
//   body/bg      the silhouette against the surface
//   accent/body  the slab and features INSIDE the silhouette
//   accent/bg    only for the 2 modules that touch outside air -- the right
//                eye (1,5) and the nose (2,7), which a flood fill shows are
//                not enclosed. Sealing those (see NOTE at the foot of this
//                file) would retire this column entirely.
const VARIANTS = {
  //             bg         body     slab     features
  'light-blue': { body: BLUE,   slab: INK,  feat: INK  },  // 5.00 / 3.62 / 18.10
  'dark-blue':  { body: BLUE_D, slab: SOFT, feat: SOFT },  // 7.68 / 4.90 /  1.57*
  'light-mono': { body: INK,    slab: INK,  feat: MID  },  // 18.10 / 5.45 / 3.32
  'dark-mono':  { body: PAPER,  slab: INK,  feat: DIM  },  // 16.45 / 4.57 / 3.60
};
// * dark-blue is the one cell that cannot be fixed by colour: no value clears
//   3:1 against BOTH #161616 and a blue-40 body. gray-80 keeps the 11-module
//   slab legible against the body and lets the 2 leaked modules go soft. The
//   alternative is the geometry seal.
//
// THE SINGLE #161616 OPTION is body gray-10 / features gray-60. Searched every
// core Carbon token pair (246 tokens, neutrals + blue, detail darker than body,
// all three ratios >= 3:1): gray-10 over gray-60 is the best weakest-link at
// 3.60. A SATURATED BLUE BODY CANNOT WORK HERE -- blue-40 clears nothing, and
// the only blues that do are blue-10/blue-20, near-white tints that read as
// white and throw the brand colour away. So the dark-surface mark is neutral.
//
// light-mono deliberately merges slab into body: on white there is nothing
//   darker than gray-100 for the slab to be, so the mark reduces to one solid
//   silhouette with mid-grey features. That is what a mono lockup should do.

// Horizontal run-length encoding: one <rect> per run of like modules, not one
// per module. 110 modules collapse to ~30 rects, and adjacent modules in a run
// share no interior edge -- which is half of why the seams go away. The other
// half is that every coordinate below is an integer.
function rects(layer, { scale = 1, ox = 0, oy = 0, cls = null, fill = null } = {}) {
  const out = [];
  for (let r = 0; r < ROWS; r++) {
    let c = 0;
    while (c < COLS) {
      if (GRID[r][c] !== layer) { c++; continue; }
      let n = 0;
      while (c + n < COLS && GRID[r][c + n] === layer) n++;
      const attr = cls ? ` class="${cls}"` : fill ? ` fill="${fill}"` : '';
      out.push(
        `<rect x="${ox + c * scale}" y="${oy + r * scale}" ` +
        `width="${n * scale}" height="${scale}"${attr}/>`
      );
      c += n;
    }
  }
  return out;
}

const LAYERS = ['B','S','F'];
const A11Y = 'role="img" aria-label="rux-ds"';
mkdirSync('assets/brand', { recursive: true });
const emit = (name, svg) => {
  writeFileSync(`assets/brand/${name}`, svg.replace(/\n{2,}/g, '\n').trim() + '\n');
  console.log(`  assets/brand/${name}`);
};

// ---------------------------------------------------------------- 1. master
// Tight: no padding, one unit per module. Consumers add their own space.
// Body takes `currentColor` so it inherits from CSS. Slab and features take
// custom properties, because currentColor can only carry one value -- the slab
// defaults BACK to currentColor, so the untouched master is the mono form and
// setting --rux-mark-slab is what makes it a two-tone lockup.
emit('mark.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COLS} ${ROWS}" ${A11Y}>
<title>rux-ds</title>
<g fill="currentColor">
${rects('B').join('\n')}
</g>
<g fill="var(--rux-mark-slab, currentColor)">
${rects('S').join('\n')}
</g>
<g fill="var(--rux-mark-feature, ${DIM})">
${rects('F').join('\n')}
</g>
</svg>`);

// ------------------------------------------------------------- 2. app icons
// 1024 canvas. Module 80 -> the mark is 880x800, centred at 72,112. That fits
// inside the 896 safe area of .brand/rux-logo-template.svg with 8px to spare,
// and -- unlike fitting 896 exactly -- keeps every coordinate an integer.
// The scale is UNIFORM: an 11:10 mark cannot fill a square without distortion,
// so the height is 800, not 896.
const M = 80, OX = 72, OY = 112;
for (const [name, { body, slab, feat }] of Object.entries(VARIANTS)) {
  emit(`icon-${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" ${A11Y}>
<title>rux-ds</title>
${rects('B', { scale: M, ox: OX, oy: OY, fill: body }).join('\n')}
${rects('S', { scale: M, ox: OX, oy: OY, fill: slab }).join('\n')}
${rects('F', { scale: M, ox: OX, oy: OY, fill: feat }).join('\n')}
</svg>`);
}

// ---------------------------------------------------------------- 3. favicon
// Tight like the master, but self-theming: a favicon gets no CSS from the page,
// so the light/dark swap has to live inside the file. Browsers that ignore the
// media query keep the light values.
emit('favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COLS} ${ROWS}" ${A11Y}>
<title>rux-ds</title>
<style>
.b{fill:${BLUE}}.s{fill:${INK}}.f{fill:${INK}}
@media (prefers-color-scheme:dark){.b{fill:${BLUE_D}}.s{fill:${SOFT}}.f{fill:${SOFT}}}
</style>
${rects('B', { cls: 'b' }).join('\n')}
${rects('S', { cls: 's' }).join('\n')}
${rects('F', { cls: 'f' }).join('\n')}
</svg>`);

const count = (ch) => GRID.join('').split('').filter((c) => c === ch).length;
console.log(`\n  grid ${COLS}x${ROWS} - ${count('B')} body, ${count('S')} slab, ` +
  `${count('F')} feature, ${count('.')} empty`);

// NOTE -- the geometry seal, not applied. A flood fill from the border shows
// the left eye (1,3) is enclosed on all four sides, but the right eye (1,5)
// opens right and the nose (2,7) opens up and right. Filling (1,6), (1,7) and
// (2,8) would enclose all three, retire the accent/bg column above, and let
// every variant use a true transparent knockout. It squares off the head's
// right edge and thickens the top of the snout, so it is a drawing decision,
// not a build one. Left for rux.
