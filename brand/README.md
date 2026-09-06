# brand/

**`logo.svg` is the logo. Swap the file; nothing else changes.**

Every page in this repository embeds it the same way, with no class and no
build step between the file and the page:

```html
<img src="brand/logo.svg" alt="" style="height:1.5rem;width:auto;margin-right:.5rem;flex:none">
```

Replace `logo.svg` and every shell in that project picks it up on reload.
Other repositories hold their own copy; changing this one does not update them.

The official mark is rux's **Rux logo 2**, confirmed 2026-09-05 for every
Rux brand and favicon use. `rux-ds/brand/logo.svg` is the cleaned master;
Rux Apps and Rux Notes carry byte-identical logo and favicon copies. Its 16x16
viewBox contains 91 filled grid cells, with one cell of padding left/right
and two top/bottom. The ear corners were squared from the export’s 0.09972-unit rounding.
Redundant and zero-area paths were then removed; the occupied grid cells
before and after that cleanup were compared and are identical. The ear
bridge and wider neck are the user’s Rux logo 2 geometry.

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

`favicon.svg` is generated FROM `logo.svg` by `npm run marks`, and it is here
rather than in `assets/` for the same reason: a project owns it and may replace
it. Every page links it as `<link rel="icon" href="brand/favicon.svg">`.

It exists separately because a favicon gets no CSS from the page, so the
light/dark swap has to live inside the file: gray-100 `#161616` on a light
scheme, gray-10 `#f4f4f4` on a dark one. The earlier blue guidance here was
stale; the adopted brand rule is neutral throughout.

**Swapping `logo.svg` does NOT update `favicon.svg`.** Re-run `npm run marks`
in rux-ds, and copy the result to any consumer. That is the one thing the swap
does not do for you.

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
