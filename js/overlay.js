/* ==========================================================================
   rux-ds — OVERLAY KERNEL                              Phase 5, roadmap §4.5
   --------------------------------------------------------------------------
   One dismiss manager for every dismissible surface: modal, menu, overflow
   menu, popover, tooltip, the list-box surfaces behind dropdown and select,
   and the shell's nav panels. Load this FIRST; the others delegate to it.

   Why a kernel rather than a listener per component. Each surface otherwise
   binds its own document-level outside-press and Escape handlers, and then
   two of them disagree about who owns a click: a menu opened from a button
   inside a popover closes the popover, or Escape dismisses the wrong one, or
   both dismiss and the page jumps. Registering instead makes the order a
   property of one stack rather than of listener-attachment order, which is
   not something the markup can control.

   THE STACK IS BOTTOM → TOP. Opening a surface dismisses everything above the
   topmost surface that already contains the newcomer's anchor. Nesting then
   works without either module knowing the other exists: a menu whose trigger
   lives inside a popover pushes onto the stack above that popover and leaves
   it standing, while a menu opened from the page dismisses both.

   API
   ---
   Rux.overlay.register(record) → { release }
     record.element        the surface itself (required)
     record.anchor         the trigger, if any — used for nesting and for
                           deciding whether a press landed "inside"
     record.close(opts)    called to dismiss; receives { restoreFocus }
     record.reposition()   optional; called on resize while registered
     record.dismissOn      optional { outside = true, escape = true }
     record.dismissOthers  optional; false means "opening me closes nothing".
                           A hover tooltip needs this: it appears because a
                           pointer crossed it, not because anyone chose it, and
                           it must not tear down a menu the user is working in.
                           It still sits on the stack, so Escape reaches it
                           first and an outside press still dismisses it.
   release()               leave the stack WITHOUT being closed. Call it from
                           your own close(), or the kernel would call close()
                           again on a surface already closing.

   Rux.overlay.autoId(el, prefix)   → id, assigning one if absent
   Rux.overlay.focusables(root)     → the tabbable elements inside root
   Rux.overlay.trapFocus(el, opts)  → release(opts); Tab cycling, initial
                                      focus, and focus restore on release.
                                      opts.restoreTo names the element to
                                      restore to — pass it whenever you know
                                      the trigger; see below.

   NO POSITIONING ENGINE, and that is a finding rather than an omission.
   rux-ui needed one because it placed surfaces itself; Carbon places them
   with classes — `popover--bottom`, `popover--left-end` and their siblings
   are static CSS, and the auto-align variant is the only one that needs
   measurement. Until a template asks for `popover--auto-align`, the record's
   optional reposition() is the whole of the contract.

   NO PORTALING. rux-ui promoted portaled surfaces above their owning modal
   with a data attribute. Carbon's light-DOM markup keeps every surface inline
   next to its trigger, so the stacking context is the document's and there is
   nothing to promote.
   ========================================================================== */
(() => {
  'use strict';

  const FOCUSABLE = [
    'a[href]',
    'button:not(:disabled)',
    'input:not(:disabled):not([type="hidden"])',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  /* Bottom → top. */
  const stack = [];

  const contains = (record, target) =>
    Boolean(target && (record.element.contains(target) || record.anchor?.contains?.(target)));

  /* The topmost record containing `target`, or null. */
  function topmostContaining(target) {
    for (let i = stack.length - 1; i >= 0; i--) if (contains(stack[i], target)) return stack[i];
    return null;
  }

  function drop(record) {
    const i = stack.indexOf(record);
    if (i !== -1) stack.splice(i, 1);
  }

  /* Dismiss everything above `boundary` (null = all), top first. `guard` may
     veto a record, in which case it and everything below it survive.

     The boundary is a RECORD, not an index, and the loop is bounded: a close()
     handler is free to dismiss surfaces of its own, which shifts the stack
     under us mid-iteration. */
  function dismissAbove(boundary, options, guard) {
    let safety = stack.length;
    while (safety-- > 0) {
      const top = stack[stack.length - 1];
      if (!top || top === boundary) return;
      if (guard && !guard(top)) return;
      drop(top);
      top.close?.(options);
    }
  }

  function register(record) {
    if (!record?.element) return null;
    // Re-opening a surface REPLACES its record rather than nesting inside
    // itself; a stale record leaves the stack out of step with the page.
    const existing = stack.find(entry => entry.element === record.element);
    if (existing) drop(existing);
    if (record.dismissOthers !== false)
      dismissAbove(topmostContaining(record.anchor), { restoreFocus: false });
    stack.push(record);
    return { release: () => drop(record) };
  }

  function autoId(element, prefix) {
    if (!element.id) element.id = `${prefix}-${(counter++).toString(36)}`;
    return element.id;
  }
  // A counter, not Math.random(): ids land in the DOM, and a deterministic one
  // means two loads of the same page produce the same document.
  let counter = 1;

  const focusables = root =>
    [...root.querySelectorAll(FOCUSABLE)].filter(
      el => !el.hidden && el.getAttribute('aria-hidden') !== 'true' && el.offsetParent !== null);

  /* Keeps Tab and Shift+Tab inside `element`, so a keyboard user cannot reach
     the page behind a modal surface. Returns release(), which also restores
     focus.

     RESTORE TO `options.restoreTo` WHEN YOU HAVE IT. Falling back to whatever
     held focus when the trap was installed is a guess, and it is wrong in a
     case that matters: clicking a <button> does not focus it in Firefox or
     Safari on macOS, so activeElement is <body> and Escape drops the user at
     the top of the document instead of returning them to the control they
     opened the surface from. A caller that knows its trigger must say so. */
  function trapFocus(element, options = {}) {
    const previous = options.restoreTo ?? document.activeElement;
    (element.querySelector('[autofocus]') || focusables(element)[0])?.focus?.();

    function onKeydown(event) {
      if (event.key !== 'Tab' || element.hidden) return;
      const nodes = focusables(element);
      if (!nodes.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }

    document.addEventListener('keydown', onKeydown);
    return function release(releaseOptions = {}) {
      document.removeEventListener('keydown', onKeydown);
      const restore = releaseOptions.restoreFocus ?? options.restoreFocus ?? true;
      if (restore) previous?.focus?.({ preventScroll: true });
    };
  }

  /* ── The one set of document-level dismiss listeners ───────────────────── */

  // CAPTURE PHASE, and pointerdown rather than click, so this settles before
  // the pressed control takes focus and before the previously focused input
  // fires blur. A surface that closes on blur would otherwise race this.
  document.addEventListener('pointerdown', event => {
    if (!stack.length) return;
    dismissAbove(
      topmostContaining(event.target),
      { restoreFocus: false },
      record => record.dismissOn?.outside !== false);
  }, true);

  // One Escape policy for everything: dismiss the topmost surface, consume the
  // key, go no further. Without the stack this is where components fight.
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || !stack.length) return;
    const top = stack[stack.length - 1];
    if (top.dismissOn?.escape === false) return;
    event.preventDefault();
    drop(top);
    top.close?.({ restoreFocus: true });
  });

  window.addEventListener('resize', () => stack.forEach(record => record.reposition?.()));

  window.Rux = window.Rux || {};
  window.Rux.overlay = { register, autoId, focusables, trapFocus };
})();
