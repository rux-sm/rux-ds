/* ==========================================================================
   rux-ds — DISMISSIBLE: NOTIFICATIONS AND FILTER TAGS
                                                        Phase 5, roadmap §4.5
   --------------------------------------------------------------------------
   Requires js/overlay.js only to share the `window.Rux` namespace. Neither of
   these overlays anything, so neither joins the dismiss stack — the kernel
   answers "which surface owns this press", and these two are answering a
   different question: "this thing is gone now".

   ONE MODULE, because they are the same behaviour under two class names: a
   control inside a box removes the box. Notifications and tags have nothing
   else in common and do not need to — this file is grouped by what it DOES,
   the way form-controls is.

   REMOVED, NOT HIDDEN. Carbon's React unmounts a dismissed notification, and
   a hidden-but-present tag would keep answering `querySelectorAll` for code
   that counts active filters. `hidden` would also leave it in the DOM for a
   screen reader to skip past forever.

   FOCUS IS THE PART THAT IS EASY TO GET WRONG. Removing the element that has
   focus drops focus to <body>, which sends a keyboard user back to the top of
   the document — and dismissing three filter tags in a row is exactly when
   that hurts. Focus moves to the NEXT dismissible in the same group, or to the
   previous one when the last is removed, or to the group itself when nothing
   is left. That last case needs the group to be focusable, so it is given
   `tabindex="-1"`: programmatically focusable, never a tab stop.
   ========================================================================== */

/* BEHAVIOUR: derived · NOTE ONE UNSOURCED CLAIM: this file states that Carbon's React unmounts a dismissed
   notification rather than hiding it, and nothing cites where that was observed. The
   remove-don't-hide behaviour follows from it. Worth confirming against a running
   story before it is relied on.
   ========================================================================== */
(() => {
  'use strict';
  if (!window.Rux?.overlay) return; // js/overlay.js must load first

  // A close control and the box it dismisses. Notifications name their close
  // button per variant — inline, toast and actionable each have their own —
  // because Carbon does; the tag has one class for all colours.
  const KINDS = [
    { close: '.rux--inline-notification__close-button', box: '.rux--inline-notification' },
    { close: '.rux--toast-notification__close-button', box: '.rux--toast-notification' },
    { close: '.rux--actionable-notification__close-button', box: '.rux--actionable-notification' },
    { close: '.rux--tag__close-icon', box: '.rux--tag' },
  ];

  const CLOSERS = KINDS.map(k => k.close).join(', ');

  function nextFocus(box, closeSelector) {
    // Siblings that are still dismissible, in document order.
    const group = box.parentElement;
    if (!group) return null;
    const peers = [...group.children].filter(el => el !== box && el.querySelector(closeSelector));
    const after = peers.filter(el => box.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
    const target = after[0] ?? peers[peers.length - 1] ?? null;
    if (target) return target.querySelector(closeSelector);
    // Nothing left to land on: the group takes focus so the reader stays put.
    if (!group.hasAttribute('tabindex')) group.setAttribute('tabindex', '-1');
    return group;
  }

  function dismiss(box, kind) {
    if (!box) return;
    const landing = nextFocus(box, kind.close);
    box.dispatchEvent(new CustomEvent('rux:dismissed', { bubbles: true, detail: { kind: kind.box } }));
    box.remove();
    landing?.focus?.({ preventScroll: true });
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const closer = event.target.closest(CLOSERS);
    if (!closer) return;
    const kind = KINDS.find(k => closer.matches(k.close));
    const box = closer.closest(kind.box);
    if (!box) return;
    event.preventDefault();
    dismiss(box, kind);
  });

  window.Rux.dismiss = box => {
    const kind = KINDS.find(k => box?.matches?.(k.box));
    if (kind) dismiss(box, kind);
  };
})();
