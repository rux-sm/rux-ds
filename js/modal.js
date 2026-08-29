/* ==========================================================================
   rux-ds — MODAL                                       Phase 5, roadmap §4.5
   --------------------------------------------------------------------------
   Requires js/overlay.js, loaded first.

   THE MARKUP IS THE API. There is no `new Modal(el)` and nothing to call: a
   trigger carrying `data-rux-open="<id>"` opens the modal with that id, and
   anything carrying `data-rux-close` inside a modal closes it. This is the
   one place rux-ds departs from rux-ui's shape deliberately — rux-ui exposes
   an imperative `RuxModal.open(el)` because an application calls it, while
   this system's consumer generates MARKUP and never writes the call. A page
   built from a template must work with no script of its own.

   `data-rux-*` is our own contract, and it has to be: Carbon's is React
   props, which have no HTML equivalent to copy. The attribute names are the
   only invention in this file; every class it touches is Carbon's.

   WHAT THE CSS ALREADY DOES, so this module does not.
   `.rux--modal:not(.--enable-presence)` is `visibility: hidden; opacity: 0`
   and `.is-visible` reverses both — so `is-visible` is the entire show hook,
   and a closed modal is already out of the accessibility tree. No `hidden`
   toggle, no `aria-hidden` bookkeeping, no display juggling.

   WHAT THE KERNEL DOES, so this module does not: Escape, outside-press, and
   the stack that decides which surface a press belongs to.

   The record's `element` is the CONTAINER, not the modal root. The root is
   the scrim — it fills the viewport, so registering it would make a press on
   the backdrop "inside" the surface and the backdrop would never dismiss.
   ========================================================================== */

/* BEHAVIOUR: derived · focus trapping, the initial focus target and Escape are the ARIA dialog pattern applied
   to Carbon's captured markup. No running Carbon modal was opened, so the ORDER of focus
   restoration and what Carbon focuses first are inferred rather than observed.
   ========================================================================== */
(() => {
  'use strict';
  const overlay = window.Rux?.overlay;
  if (!overlay) return; // js/overlay.js must load first

  const OPEN = 'is-visible';
  const open = new Map(); // modal root -> { releaseTrap, registration, trigger }

  const containerOf = modal => modal.querySelector('.rux--modal-container') || modal;

  function close(modal, options = {}) {
    const state = open.get(modal);
    if (!state) return;
    open.delete(modal);
    modal.classList.remove(OPEN);
    state.registration?.release();
    state.trigger?.setAttribute('aria-expanded', 'false');
    // The trap owns focus restoration and was told where to send it (see
    // show()), so this only passes the flag. One owner, not two racing.
    state.releaseTrap?.({ restoreFocus: options.restoreFocus !== false });
    modal.dispatchEvent(new CustomEvent('rux:modal-closed', { bubbles: true }));
  }

  function show(modal, trigger) {
    if (open.has(modal)) return;
    const container = containerOf(modal);

    if (trigger) {
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-controls', overlay.autoId(modal, 'rux-modal'));
      trigger.setAttribute('aria-expanded', 'true');
    }

    const registration = overlay.register({
      element: container,
      anchor: trigger,
      close: opts => close(modal, opts),
    });

    modal.classList.add(OPEN);
    // Trap AFTER the class lands: focusables() skips anything with no
    // offsetParent, and the container has none while the root is still
    // `visibility: hidden`.
    //
    // restoreTo is the TRIGGER, not whatever held focus. Clicking a button does
    // not focus it in Firefox or Safari on macOS, so the fallback would send
    // Escape's focus to <body> and strand a keyboard user at the top of the
    // page. Verified in the sink before the fix, which is how it was found.
    const releaseTrap = overlay.trapFocus(container, { restoreTo: trigger || undefined });
    open.set(modal, { registration, releaseTrap, trigger });
    modal.dispatchEvent(new CustomEvent('rux:modal-opened', { bubbles: true }));
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;

    const trigger = event.target.closest('[data-rux-open]');
    if (trigger) {
      const modal = document.getElementById(trigger.getAttribute('data-rux-open'));
      if (modal?.classList.contains('rux--modal')) { event.preventDefault(); show(modal, trigger); }
      return;
    }

    const closer = event.target.closest('[data-rux-close]');
    if (closer) {
      const modal = closer.closest('.rux--modal');
      if (modal) { event.preventDefault(); close(modal, { restoreFocus: true }); }
    }
  });

  window.Rux.modal = {
    open: (modalOrId, trigger) => {
      const modal = typeof modalOrId === 'string' ? document.getElementById(modalOrId) : modalOrId;
      if (modal) show(modal, trigger || null);
    },
    close: modalOrId => {
      const modal = typeof modalOrId === 'string' ? document.getElementById(modalOrId) : modalOrId;
      if (modal) close(modal, { restoreFocus: true });
    },
  };
})();
