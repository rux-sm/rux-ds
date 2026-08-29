/* ==========================================================================
   rux-ds — TILE                                        Phase 5, roadmap §4.5
   --------------------------------------------------------------------------
   Requires js/overlay.js only for `autoId`. A tile is part of the page, not a
   surface over it, so it never joins the dismiss stack.

   THIS MODULE WRITES AN INLINE max-height, AND THAT IS THE ONE PLACE IT
   SHOULD. ui-shell's note says a behaviour layer for a CSS design system
   should never be writing widths — and it should not, when a class already
   expresses the state, as `side-nav--hidden` did. Here no class can:
   `tile-content__below-the-fold` is `visibility: hidden`, which still
   OCCUPIES LAYOUT, so a collapsed tile stands as tall as an expanded one and
   reserves space for content nobody can see. Measured in the sink before the
   fix: 140px tall, 48px of it hidden. The collapsed height depends on the
   content, so it cannot be a class, and Carbon's React sets the same inline
   value for the same reason.

   IT IS MEASURED ONCE, AT LOAD, and again on resize. Reading it at toggle
   time would measure a tile mid-transition and latch the wrong number.

   THREE SELECTION SHAPES, and only two of them are ours:
     role=checkbox      a <div> pretending to be a control, so click, Space
                        and Enter all have to be written
     tile-input + label a real radio input; the browser owns the toggle and
                        the label's `for`, and all this module does is mirror
                        the result onto `--is-selected` across the group
     clickable          an <a>. Nothing to do.
   Handling the radio input's click as well as its change would fire twice and
   cancel itself out — the defect §4.1.9 records for toggle.
   ========================================================================== */

/* BEHAVIOUR: derived · expandable and selectable tiles are driven from the captured markup. The collapsed
   height is measured from THIS page at load, not from Carbon -- see the note below on
   why it cannot be a class.
   ========================================================================== */
(() => {
  'use strict';
  const overlay = window.Rux?.overlay;
  if (!overlay) return; // js/overlay.js must load first

  const EXPANDED = 'rux--tile--is-expanded';
  const SELECTED = 'rux--tile--is-selected';
  const collapsedHeights = new WeakMap();

  const belowOf = tile => tile.querySelector('.rux--tile-content__below-the-fold');
  const isDisabled = el => el.getAttribute('aria-disabled') === 'true' || el.disabled === true;

  /* ── expandable ────────────────────────────────────────────────────────── */
  function measure(tile) {
    const below = belowOf(tile);
    if (!below) return;
    const was = tile.style.maxHeight;
    tile.style.maxHeight = '';                       // measure unconstrained
    const full = tile.getBoundingClientRect().height;
    const hidden = below.getBoundingClientRect().height;
    collapsedHeights.set(tile, Math.round(full - hidden));
    tile.style.maxHeight = was;
  }

  function setExpanded(tile, open) {
    if (isDisabled(tile)) return;
    tile.classList.toggle(EXPANDED, open);
    const collapsed = collapsedHeights.get(tile);
    tile.style.maxHeight = open || collapsed == null ? '' : `${collapsed}px`;

    // The control is the tile itself, unless the fold holds its own controls —
    // then it is the chevron, because a button cannot nest inside a button.
    const control = tile.querySelector(':scope > div > .rux--tile__chevron--interactive')
      ?? (tile.tagName === 'BUTTON' ? tile : null);
    control?.setAttribute('aria-expanded', String(open));
    const below = belowOf(tile);
    if (below && control) control.setAttribute('aria-controls', overlay.autoId(below, 'rux-tile-fold'));
    tile.dispatchEvent(new CustomEvent(open ? 'rux:tile-expanded' : 'rux:tile-collapsed',
      { bubbles: true }));
  }

  /* ── selectable ────────────────────────────────────────────────────────── */
  function setChecked(tile, on) {
    if (isDisabled(tile)) return;
    tile.setAttribute('aria-checked', String(on));
    tile.classList.toggle(SELECTED, on);
    tile.dispatchEvent(new CustomEvent('rux:tile-selected', { bubbles: true, detail: { on } }));
  }

  // A radio tile's truth is its input; every label in the group is re-mirrored
  // because selecting one necessarily DEselects another.
  function syncRadios(input) {
    const scope = input.closest('.rux--tile-group') ?? document;
    for (const other of scope.querySelectorAll(`input.rux--tile-input[name="${input.name}"]`)) {
      const label = other.id ? scope.querySelector(`label[for="${other.id}"]`) : null;
      label?.classList.toggle(SELECTED, other.checked);
    }
  }

  /* ── wiring ────────────────────────────────────────────────────────────── */
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;

    const chevron = event.target.closest('.rux--tile__chevron--interactive');
    if (chevron) {
      const tile = chevron.closest('.rux--tile--expandable');
      if (tile) { event.preventDefault(); setExpanded(tile, !tile.classList.contains(EXPANDED)); }
      return;
    }
    // A tile whose fold has its own controls is NOT expanded by clicking the
    // body: the controls are what the body is for.
    const expandable = event.target.closest('.rux--tile--expandable:not(.rux--tile--expandable--interactive)');
    if (expandable) { setExpanded(expandable, !expandable.classList.contains(EXPANDED)); return; }

    const checkable = event.target.closest('.rux--tile--selectable[role="checkbox"]');
    if (checkable) setChecked(checkable, checkable.getAttribute('aria-checked') !== 'true');
  });

  document.addEventListener('keydown', event => {
    if (!(event.target instanceof Element)) return;
    if (event.key !== ' ' && event.key !== 'Enter') return;
    // Only the div-pretending-to-be-a-control needs this; a <button> tile and a
    // real radio input already do it.
    const checkable = event.target.closest('.rux--tile--selectable[role="checkbox"]');
    if (!checkable) return;
    event.preventDefault();
    setChecked(checkable, checkable.getAttribute('aria-checked') !== 'true');
  });

  document.addEventListener('change', event => {
    const input = event.target;
    if (input instanceof Element && input.matches('input.rux--tile-input')) syncRadios(input);
  });

  window.addEventListener('resize', () => {
    for (const tile of document.querySelectorAll('.rux--tile--expandable')) {
      if (tile.classList.contains(EXPANDED)) continue;
      measure(tile);
      setExpanded(tile, false);
    }
  });

  /* Adopt the markup: measure every fold, apply the collapsed cap to the ones
     that ship closed, and mirror each radio group onto its labels. */
  for (const tile of document.querySelectorAll('.rux--tile--expandable')) {
    measure(tile);
    setExpanded(tile, tile.classList.contains(EXPANDED));
  }
  for (const tile of document.querySelectorAll('.rux--tile--selectable[role="checkbox"]'))
    tile.classList.toggle(SELECTED, tile.getAttribute('aria-checked') === 'true');
  for (const input of document.querySelectorAll('input.rux--tile-input:checked')) syncRadios(input);

  window.Rux.tile = {
    expand: (tile, open) => setExpanded(tile, open ?? !tile.classList.contains(EXPANDED)),
    select: (tile, on) => setChecked(tile, on ?? tile.getAttribute('aria-checked') !== 'true'),
  };
})();
