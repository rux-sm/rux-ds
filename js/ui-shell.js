/* ==========================================================================
   rux-ds — UI SHELL                                    Phase 5, roadmap §4.5
   --------------------------------------------------------------------------
   Requires js/overlay.js. The side nav registers with the kernel; the
   submenus do not — they are inline disclosure, like accordion.

   THE HAMBURGER TOGGLES CLASSES CARBON ALREADY HAS. `.rux--side-nav` is
   `inline-size: 3rem` (the rail), `--expanded` is 16rem and `--hidden` is 0.
   The sink harness set `style.inlineSize = '0'` by hand, which reimplemented
   `--hidden` as an inline style and left the class unexercised. A behaviour
   layer for a CSS design system should never be writing widths.

   ESCAPE CLOSES THE SIDE NAV; AN OUTSIDE PRESS DOES NOT. This is the second
   place the kernel's default is wrong for a component, and for the opposite
   reason to the tooltip's: a nav panel is part of the page rather than a
   surface floating over it, so dismissing it because someone clicked the
   content they navigated to would fight the user. `dismissOn: { outside:
   false }` says so. What DOES dismiss it by pointer is its own scrim —
   `side-nav__overlay`, which only covers the viewport under the mobile media
   query, so handling it explicitly beats guessing at a breakpoint in JS.

   THE SUBMENU CHEVRON IS NOT OURS TO TURN. `.rux--side-nav__submenu[aria-
   expanded=true] .rux--side-nav__submenu-chevron > svg` rotates it in CSS, off
   the same attribute the button already needs for screen readers. Setting
   aria-expanded is the whole of the behaviour; the arrow follows.
   ========================================================================== */
(() => {
  'use strict';
  const overlay = window.Rux?.overlay;
  if (!overlay) return; // js/overlay.js must load first

  const EXPANDED = 'rux--side-nav--expanded';
  const HIDDEN = 'rux--side-nav--hidden';
  const live = new Map();   // nav -> { registration, trigger }

  const scrimFor = nav => nav.closest('.rux--header, body')
    ?.querySelector('.rux--side-nav__overlay') ?? null;

  function setNav(nav, open, trigger) {
    if (!nav) return;
    nav.classList.toggle(EXPANDED, open);
    nav.classList.toggle(HIDDEN, !open);
    trigger?.setAttribute('aria-expanded', String(open));
    scrimFor(nav)?.classList.toggle('rux--side-nav__overlay-active', open);

    // A NAV WITH NO TRIGGER IS NOT DISMISSIBLE, because nothing could reopen it.
    // Carbon ships two shells: the rail inside the header has a hamburger, and
    // Escape closing it is a kindness. A `--expanded` nav standing beside the
    // header has no hamburger in any capture, so registering it meant one
    // Escape emptied the navigation for good — 16rem to `--hidden`, the content
    // sliding under it, and no control on the page able to undo it. Dismissal
    // is only offered where a way back exists.
    const state = live.get(nav);
    if (open && !state && trigger) {
      live.set(nav, {
        registration: overlay.register({
          element: nav,
          anchor: trigger,
          dismissOn: { outside: false },   // see the header
          close: opts => setNav(nav, false, opts?.trigger ?? trigger),
        }),
        trigger,
      });
    } else if (!open && state) {
      state.registration?.release();
      live.delete(nav);
    }
    nav.dispatchEvent(new CustomEvent(open ? 'rux:side-nav-opened' : 'rux:side-nav-closed',
      { bubbles: true }));
  }

  function setSubmenu(button, open) {
    const item = button.closest('.rux--side-nav__item');
    const menu = item?.querySelector(':scope > .rux--side-nav__menu');
    button.setAttribute('aria-expanded', String(open));
    if (menu) {
      menu.hidden = !open;
      button.setAttribute('aria-controls', overlay.autoId(menu, 'rux-side-nav-menu'));
    }
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;

    const burger = event.target.closest('.rux--header__menu-toggle');
    if (burger) {
      const nav = burger.closest('.rux--header')?.querySelector('.rux--side-nav');
      if (nav) {
        event.preventDefault();
        setNav(nav, !nav.classList.contains(EXPANDED), burger);
      }
      return;
    }

    // The scrim: the pointer half of dismissal, and only ever visible on the
    // viewports where the nav actually overlays the page.
    const scrim = event.target.closest('.rux--side-nav__overlay');
    if (scrim) {
      const nav = scrim.parentElement?.querySelector('.rux--side-nav');
      if (nav) setNav(nav, false, live.get(nav)?.trigger);
      return;
    }

    const submenu = event.target.closest('.rux--side-nav__submenu');
    if (submenu) {
      event.preventDefault();
      setSubmenu(submenu, submenu.getAttribute('aria-expanded') !== 'true');
    }
  });

  /* Adopt the markup: a nav shipped `--expanded` is open, and each submenu's
     panel is hidden or shown to match the attribute the button already carries. */
  for (const nav of document.querySelectorAll('.rux--side-nav')) {
    const burger = nav.closest('.rux--header')?.querySelector('.rux--header__menu-toggle');
    if (nav.classList.contains(EXPANDED)) setNav(nav, true, burger);
  }
  for (const button of document.querySelectorAll('.rux--side-nav__submenu'))
    setSubmenu(button, button.getAttribute('aria-expanded') === 'true');

  window.Rux.uiShell = {
    openNav: (nav, trigger) => setNav(nav, true, trigger),
    closeNav: nav => setNav(nav, false, live.get(nav)?.trigger),
    toggleSubmenu: button => setSubmenu(button, button.getAttribute('aria-expanded') !== 'true'),
  };
})();
