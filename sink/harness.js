//
// KITCHEN-SINK HARNESS ONLY. This is not the design system's behaviour layer.
//
// Phase 5 writes the real one: an overlay kernel owning outside-press, Escape and
// focus trapping, with full keyboard and ARIA lifecycle (roadmap §4.5). This file
// exists so the sink can DEMONSTRATE components rather than freeze them open — it
// toggles the same state classes Carbon's CSS already reacts to, and does nothing
// else. No focus management, no keyboard support beyond Escape, no aria wiring
// past the attribute each toggle owns.
//
// Every class named here was read out of the compiled CSS, not invented.
//
//
// WHAT HAS LEFT THIS FILE, and what is still here.
//
// Moved to js/, with real focus management, keyboard support and ARIA:
//   modal · popover · tooltip · menu · overflow menu · list box · tabs
//
// Deleted outright, because the component no longer ships (Phase 3):
//   copy button (CUT) · content switcher (CUT) · toggletip (CUT) ·
//   combo box (CUT) · multiselect (DEFER) · tree view (DEFER) · slider (DEFER)
// Their fragments live in sink/deferred/. Driving markup that is not on the
// page is not harmless — it is code nobody can test and nobody will delete.
//
// Still here, awaiting their modules: accordion · toggle · number input ·
// search clear · checkbox indeterminate · UI shell.
//
(() => {
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  // The Element guard is not defensive noise. A real click lands on an
  // Element, but an event DISPATCHED at document — which is how the Phase 5
  // modules are exercised, and how any test drives Escape — makes the target
  // `document`, which has no .closest. rux-ui carries the same guard on its
  // own document handlers for the same reason.
  const on = (sel, ev, fn) => document.addEventListener(ev, e => {
    if (!(e.target instanceof Element)) return;
    const t = e.target.closest(sel); if (t) fn(t, e);
  });

  // ---- demo links must not navigate --------------------------------------
  // The fragments use real anchors on purpose: a clickable tile IS an <a> in
  // Carbon, and so is every breadcrumb and link item. Faking them as <div>s to
  // stop the jump would break the markup this project exists to preserve.
  //
  // But the sink is ONE page, so `href="#tile"` resolves to the tile section
  // and the browser scrolls there — which reads as "clicking the tile threw me
  // up the page". Cancel navigation inside .ks-main only; the left nav's links
  // are the one place a hash jump is the intended behaviour.
  document.addEventListener('click', e => {
    if (e.target.closest('.ks-main a[href^="#"]')) e.preventDefault();
  });

  // ---- theme -------------------------------------------------------------
  $$('[data-set-theme]').forEach(b =>
    b.addEventListener('click', () => document.documentElement.dataset.theme = b.dataset.setTheme));

  // ---- accordion ---------------------------------------------------------
  on('.rux--accordion__heading', 'click', h => {
    const item = h.closest('.rux--accordion__item');
    const open = item.classList.toggle('rux--accordion__item--active');
    h.setAttribute('aria-expanded', String(open));
    // No `hidden` toggle: once __content sits inside __wrapper, Carbon's own
    // CSS opens and closes the panel from __item--active alone, and setting
    // hidden as well fights the max-block-size transition.
  });

  // ---- toggle ------------------------------------------------------------
  // Listen on the BUTTON only. <label for> pointing at a button forwards the click
  // to it, so handling the label too fires twice and the toggle appears dead.
  on('.rux--toggle__button', 'click', btn => {
    const root = btn.closest('.rux--toggle');
    if (root.classList.contains('rux--toggle--disabled')) return;
    const sw = root.querySelector('.rux--toggle__switch');
    const isOn = sw.classList.toggle('rux--toggle__switch--checked');
    btn.setAttribute('aria-checked', String(isOn));
    const txt = root.querySelector('.rux--toggle__text');
    if (txt) txt.textContent = isOn ? 'On' : 'Off';
  });

  // ---- number input steppers ---------------------------------------------
  on('.rux--number__control-btn', 'click', btn => {
    const root = btn.closest('.rux--number');
    if (root.classList.contains('rux--number--readonly')) return;
    const input = root.querySelector('input[type=number]');
    if (!input || input.disabled) return;
    const step = Number(input.step) || 1;
    const up = /increment/i.test(btn.getAttribute('aria-label') || '');
    const next = (Number(input.value) || 0) + (up ? step : -step);
    const min = input.min === '' ? -Infinity : Number(input.min);
    const max = input.max === '' ? Infinity : Number(input.max);
    input.value = String(Math.min(max, Math.max(min, next)));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  // ---- search clear ------------------------------------------------------
  on('.rux--search-input', 'input', input => {
    const close = input.closest('.rux--search')?.querySelector('.rux--search-close');
    close?.classList.toggle('rux--search-close--hidden', !input.value);
  });
  on('.rux--search-close', 'click', btn => {
    const input = btn.closest('.rux--search')?.querySelector('.rux--search-input');
    if (input) { input.value = ''; input.focus(); }
    btn.classList.add('rux--search-close--hidden');
  });

  // ---- indeterminate is a property, not an attribute ---------------------
  $$('[data-ks-indeterminate]').forEach(el => el.indeterminate = true);

  // ---- UI shell: hamburger toggle + side nav submenus --------------------
  on('.rux--header__menu-toggle', 'click', btn => {
    const header = btn.closest('.rux--header');
    const nav = header?.querySelector('.rux--side-nav');
    if (!nav) return;
    const opening = btn.getAttribute('aria-expanded') !== 'true';
    nav.style.inlineSize = opening ? '' : '0';
    nav.classList.toggle('rux--side-nav--expanded', opening);
    btn.setAttribute('aria-expanded', String(opening));
  });
  on('.rux--side-nav__submenu', 'click', btn => {
    const item = btn.closest('.rux--side-nav__item');
    const menu = item?.querySelector('.rux--side-nav__menu');
    if (!menu) return;
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  });

  // ---- dismissal is not this file's job any more --------------------------
  // Escape and outside-press both lived here and both are gone. js/overlay.js
  // owns them for every registered surface, dismisses only the TOPMOST rather
  // than everything at once, and presses on pointerdown in the capture phase so
  // a surface settles before the pressed control takes focus. Nothing the
  // harness still drives is dismissible, so there is nothing left to hand over.
})();
