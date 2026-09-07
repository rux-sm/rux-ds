# brand/

**`logo.svg` is the logo. Swap the file; nothing else changes.**

Every page in this repository embeds it the same way, with no class and no
build step between the file and the page:

```html
<img src="brand/logo.svg" alt="" style="height:1.5rem;width:auto;margin-right:.5rem;flex:none">
```

Replace `logo.svg` and every shell in that project picks it up on reload.
Other repositories hold their own copy; changing this one does not update them.

The official mark is the **dachshund**, drawn by rux on 2026-09-07 and
superseding rux-logo-16x16.svg of 2026-09-06, which had superseded Brand.svg.
`rux-ds/brand/logo.svg` is the master; Rux Apps, Rux Notes and Rux Scheduler
still carry the 2026-09-06 drawing until it is copied to them. Its 16x16
viewBox contains 139 filled grid cells, bounds x=0..16 and y=1..15. The tail
rises four rows above the back and stops level with the top of the muzzle,
both at row 4, so the head owns the highest point.

**It bleeds left and right.** Every drawing before it sat inside x=1..14 with
one cell of air on every side; this one fills all 16 columns, so the header
logo touches its own box and the generated app icons carry no margin of their
own. rux chose this on 2026-09-07 for one mark in every place, having seen
the header at 24px both ways, and will adapt the drawing to a padded brand
size later. Until then, treat the icon safe area as a known gap rather than a
property this file still has.

The file is one `<path>` of three closed loops: the boundary of the filled
region rather than abutting rectangles, because abutting rectangles
anti-alias their shared edges at fractional scales. Measured in Chrome, 84
partly transparent pixels at 24px against 135 for the rectangle form, and
none at 16, 32, 48 or 64. It uses the default nonzero fill rule; the outer
loops wind clockwise and the two counters anticlockwise.

## What the file has to be

- **Sized by height.** The `<img>` sets `height:1.5rem` and lets the width
  follow, so the file's own aspect ratio governs. A square logo lands 24x24.
- **Its own colours, baked in.** `currentColor` does not reach into an `<img>`.
  That costs nothing here: the shell header is `#161616` with `#f4f4f4` text in
  all four themes, measured, so one colourway serves every theme.
- **Keep the 16x16 grid.** At 16, 32, 48, 64, 128, 256, 512 and 1024 pixels,
  each cell occupies whole pixels. At 24 CSS pixels each cell is 1.5 device
  pixels on a 1x display (some antialiasing) and 3 on a 2x display (aligned).
  Browser zoom and fractional positioning can also affect alignment.
  Earlier guidance here prescribed an 8x8 grid; that would require redrawing
  this mark and is not the adopted design.
- **A scalable master.** Keep the square viewBox and omit point dimensions.
  Size the SVG at its use site; export raster versions at the final required
  resolution. Do not enlarge a small PNG for a larger logo.

## favicon.svg, beside it

`favicon.svg` is the favicon's OWN drawing, and the same rule applies: swap
the file and every page picks it up on reload, since every page links it as
`<link rel="icon" href="brand/favicon.svg">`. It is here rather than in
`assets/` for the same reason as the logo: a project owns it and may replace
it.

Since 2026-09-07 it is no longer generated from `logo.svg`. It is still a
separate file a person edits, and `tools/make-marks.mjs` holds neither
drawing — but as of that afternoon the two files carry the SAME geometry,
byte for byte, because rux chose one mark for every place. They can diverge
again the moment either is swapped; nothing enforces the match, and no gate
compares them.

An earlier version of this section described a 159-cell edge-to-edge drawing
adopted that morning. That drawing was replaced the same day by the
dachshund above, which is shorter: 139 cells against 159, and rows 0 and 15
left empty where the morning drawing filled them.

It exists separately because a favicon gets no CSS from the page, so the
light/dark swap has to live inside the file: gray-100 `#161616` on a light
scheme, gray-10 `#f4f4f4` on a dark one. `npm run marks` no longer writes
the file, but it still reads it and fails on the two faults a hand-edited
SVG here can carry: `--` inside an XML comment, which has shipped, and a
missing swap rule.

Until 2026-09-07 this section said a logo swap did not update the favicon,
because the favicon was derived from the logo by `npm run marks`. That
caveat went with the derivation: the two files share no geometry now, and
each is swapped on its own. A consumer copies whichever it takes.

## What is NOT here

`assets/brand/` holds two scalable app icons: `icon-light.svg` is dark ink for
light surfaces, and `icon-dark.svg` is light ink for dark surfaces. Both copy
the master's geometry verbatim. Same caveat: they follow a swap only when you
re-run. Platform-specific launcher masks or opaque backgrounds may need
separate packaging; these transparent SVGs are not universal store uploads.

`.brand/` is gitignored working material -- the drawing template, a drop folder
and a preview harness. Nothing there ships.

## Consumers

`tools/new-project.sh` seeds `brand/logo.svg` into a new project only if it is
absent, the same rule `rux-theme.css` and `rux-overrides.css` follow. A pin move
never overwrites a logo you have replaced.
