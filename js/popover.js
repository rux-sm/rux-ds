/* ==========================================================================
   rux-ds — POPOVER and TOOLTIP                         Phase 5, roadmap §4.5
   --------------------------------------------------------------------------
   Requires js/overlay.js, loaded first. Load this BEFORE menu and
   overflow-menu: both are popovers with a keyboard pattern on top.

   ONE MECHANISM, TWO TRIGGERS. Carbon shows all of these the same way —
   `popover--open` on the CONTAINER is what displays `popover-content` — and
   the only real difference is what opens them:

     .rux--popover-container            click, and it stays until dismissed
     .rux--tooltip.rux--popover-container   pointer or focus, and it leaves
                                            when they do

   So the mode is read off the markup and there is no attribute to write. A
   popover needs no `data-rux-*` at all, which is the ideal this contract aims
   at: `data-rux-open` exists on modal because a modal's trigger and surface
   are far apart in the document, and nothing here has that problem.

   NO PLACEMENT MATH. `popover--bottom`, `--top`, `--left-end` and their
   siblings are static CSS; the class on the container already says where the
   surface goes. Only `popover--auto-align` would need measuring, and no
   fragment or template uses it yet — the kernel's optional reposition() is
   where that goes when one does.

   A HOVER TOOLTIP REGISTERS PASSIVELY (`dismissOthers: false`). It appears
   because a pointer crossed it rather than because anyone chose it, so it must
   not dismiss a menu the user is working in. It still joins the stack, so
   Escape reaches it first and an outside press still clears it.

   DELAYS ARE CARBON'S: 100ms entering, 300ms leaving. The leave delay is what
   lets the pointer travel from the trigger to the content without the surface
   vanishing underneath it, which is why hiding is scheduled rather than
   immediate. Focus and blur are not delayed — a keyboard user has made a
   choice, and waiting on it reads as lag.
   ========================================================================== */

/* BEHAVIOUR: derived · the tooltip and popover modes are read off the markup, which is why neither needs an
   attribute. POSITIONING IS DELIBERATELY ABSENT: Carbon places these with floating-ui,
   which this project has not written, and the sink pins its specimens instead.
   ========================================================================== */
(() => {
  'use strict';
  const overlay = window.Rux?.overlay;
  if (!overlay) return; // js/overlay.js must load first

  const OPEN = 'rux--popover--open';
  const CONTAINER = '.rux--popover-container';
  const ENTER_MS = 100, LEAVE_MS = 300;

  const isTooltip = c => c.classList.contains('rux--tooltip');
  const surfaceOf = c => c.querySelector(':scope > .rux--popover');
  const triggerOf = c => c.querySelector(':scope > button, :scope > [tabindex]');

  const live = new Map();   // container -> { registration, timer }

  function close(container, options = {}) {
    const state = live.get(container);
    if (!state) return;
    clearTimeout(state.timer);
    live.delete(container);
    container.classList.remove(OPEN);
    state.registration?.release();
    const trigger = triggerOf(container);
    if (trigger && !isTooltip(container)) {
      trigger.setAttribute('aria-expanded', 'false');
      if (options.restoreFocus) trigger.focus();
    }
    container.dispatchEvent(new CustomEvent('rux:popover-closed', { bubbles: true }));
  }

  function open(container) {
    if (live.has(container)) return;
    const surface = surfaceOf(container);
    const trigger = triggerOf(container);
    if (!surface) return;

    if (isTooltip(container)) {
      // A tooltip DESCRIBES its trigger; it is not a control the trigger owns,
      // so aria-describedby rather than aria-expanded/aria-controls.
      surface.setAttribute('role', 'tooltip');
      const content = surface.querySelector('.rux--popover-content') || surface;
      trigger?.setAttribute('aria-describedby', overlay.autoId(content, 'rux-tooltip'));
    } else if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
      trigger.setAttribute('aria-controls', overlay.autoId(surface, 'rux-popover'));
    }

    const registration = overlay.register({
      element: container,
      anchor: trigger,
      dismissOthers: !isTooltip(container),
      close: opts => close(container, opts),
    });

    container.classList.add(OPEN);
    live.set(container, { registration, timer: 0 });
    container.dispatchEvent(new CustomEvent('rux:popover-opened', { bubbles: true }));
  }

  const schedule = (container, ms, fn) => {
    const state = live.get(container);
    if (state) clearTimeout(state.timer);
    const timer = setTimeout(fn, ms);
    if (state) state.timer = timer;
    return timer;
  };

  /* ── click popovers ───────────────────────────────────────────────────── */
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const container = event.target.closest(CONTAINER);
    if (!container || isTooltip(container)) return;
    const trigger = triggerOf(container);
    // Only the trigger toggles. A click on the surface belongs to whatever the
    // surface holds — a link, a form control — and closing under it would make
    // the popover unusable for anything interactive.
    if (!trigger || !trigger.contains(event.target)) return;
    event.preventDefault();
    live.has(container) ? close(container, { restoreFocus: true }) : open(container);
  });

  /* ── hover and focus tooltips ─────────────────────────────────────────── */
  let pending = null;

  function tooltipUnder(target) {
    const c = target instanceof Element ? target.closest(CONTAINER) : null;
    return c && isTooltip(c) ? c : null;
  }

  document.addEventListener('pointerover', event => {
    const container = tooltipUnder(event.target);
    if (!container || live.has(container)) return;
    clearTimeout(pending);
    pending = setTimeout(() => open(container), ENTER_MS);
  });

  document.addEventListener('pointerout', event => {
    const container = tooltipUnder(event.target);
    if (!container) return;
    // Moving between the trigger and the content is a pointerout the surface
    // must survive; relatedTarget still inside the container means we never left.
    if (container.contains(event.relatedTarget)) return;
    clearTimeout(pending);
    schedule(container, LEAVE_MS, () => close(container));
  });

  // Keyboard: no delay in either direction.
  document.addEventListener('focusin', event => {
    const container = tooltipUnder(event.target);
    if (container) open(container);
  });
  document.addEventListener('focusout', event => {
    const container = tooltipUnder(event.target);
    if (container && !container.contains(event.relatedTarget)) close(container);
  });

  window.Rux.popover = {
    open, close,
    toggle: container => live.has(container) ? close(container) : open(container),
    isOpen: container => live.has(container),
  };
})();
