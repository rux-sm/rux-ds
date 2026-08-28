/* ==========================================================================
   rux-ds — ACCORDION                                   Phase 5, roadmap §4.5
   --------------------------------------------------------------------------
   Requires js/overlay.js only for `autoId`. An accordion is not a dismissible
   surface: it does not overlay anything, Escape does not close it, and a
   click elsewhere leaves it open. It never joins the stack.

   THIS MODULE IS SMALL ON PURPOSE, and the reasons are worth writing down
   because "it barely does anything" is otherwise a smell.

   The heading is a real <button>, so Enter and Space already work and a
   disabled item is already unreachable — the browser owns both. The panel is
   `display: none` until `__item--active` is on its parent, so a collapsed
   section is already out of the accessibility tree; there is no `hidden` to
   manage, and adding one would fight the max-block-size transition.

   ARROW KEYS ARE DELIBERATELY ABSENT. The ARIA APG lists Up/Down and Home/End
   for accordions as OPTIONAL, and Carbon React does not implement them — its
   headings are plain buttons. Adding them would take Up and Down away from
   page scrolling inside a component where nothing else does that, and would be
   this system inventing behaviour rather than making Carbon's work. If a
   template ever needs it, it is a decision to record, not a gap to fill.

   WHAT IS ADDED: `aria-controls`. Carbon emits `aria-expanded` and stops, so a
   screen reader is told the button expands something but never told what. The
   wrapper gets an id and the heading points at it. `role="region"` is NOT
   added with it — the APG warns off landmarks once there are more than a
   handful of panels, and a sink section with three accordions would make six.

   And the markup's own state is adopted at load, so an item shipped
   `--active` has `aria-expanded="true"` whether or not the author remembered.
   ========================================================================== */
(() => {
  'use strict';
  const overlay = window.Rux?.overlay;
  if (!overlay) return; // js/overlay.js must load first

  const ITEM = '.rux--accordion__item';
  const ACTIVE = 'rux--accordion__item--active';

  const wrapperOf = item => item.querySelector(':scope > .rux--accordion__wrapper');
  const headingOf = item => item.querySelector(':scope > .rux--accordion__heading');
  const isDisabled = item => item.classList.contains('rux--accordion__item--disabled')
    || headingOf(item)?.disabled === true;

  function set(item, open) {
    if (!item || isDisabled(item)) return;
    item.classList.toggle(ACTIVE, open);
    headingOf(item)?.setAttribute('aria-expanded', String(open));
    item.dispatchEvent(new CustomEvent(open ? 'rux:accordion-opened' : 'rux:accordion-closed',
      { bubbles: true }));
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const heading = event.target.closest('.rux--accordion__heading');
    const item = heading?.closest(ITEM);
    if (!item) return;
    event.preventDefault();
    set(item, !item.classList.contains(ACTIVE));
  });

  /* Wire aria-controls, and make aria-expanded agree with the class the markup
     shipped. Both are things a template author should not have to remember. */
  for (const item of document.querySelectorAll(ITEM)) {
    const heading = headingOf(item), wrapper = wrapperOf(item);
    if (!heading) continue;
    if (wrapper) heading.setAttribute('aria-controls', overlay.autoId(wrapper, 'rux-accordion'));
    heading.setAttribute('aria-expanded', String(item.classList.contains(ACTIVE)));
  }

  window.Rux.accordion = {
    open: item => set(item, true),
    close: item => set(item, false),
    toggle: item => set(item, !item.classList.contains(ACTIVE)),
    isOpen: item => item.classList.contains(ACTIVE),
  };
})();
