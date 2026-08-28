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

  // ---- modal: GONE FROM HERE, and that is the point ----------------------
  // Phase 5 landed js/overlay.js and js/modal.js, so the sink loads the real
  // behaviour layer for modals rather than a state-class toggle. The side-panel
  // half of this block went with it: side-panel is CUT, and its fragment moved
  // to sink/deferred/ in Phase 3, so the code had nothing left to drive.
  //
  // Every module Phase 5 lands deletes its section here. When this file is
  // empty the phase is done.

  // ---- accordion ---------------------------------------------------------
  on('.rux--accordion__heading', 'click', h => {
    const item = h.closest('.rux--accordion__item');
    const open = item.classList.toggle('rux--accordion__item--active');
    h.setAttribute('aria-expanded', String(open));
    // No `hidden` toggle: once __content sits inside __wrapper, Carbon's own
    // CSS opens and closes the panel from __item--active alone, and setting
    // hidden as well fights the max-block-size transition.
  });

  // ---- list boxes: GONE FROM HERE ----------------------------------------
  // js/list-box.js owns the dropdown, as a real select-only COMBOBOX: focus
  // stays on the field and `aria-activedescendant` moves over the options,
  // which is what Carbon does and what a screen reader needs. It also stops
  // conflating the two highlight classes this block put on whatever was
  // clicked — `--highlighted` is the arrow cursor, `--active` is the selection.
  //
  // The combo-box and multiselect halves went with their components: combo-box
  // is CUT and multiselect DEFER, and both fragments live in sink/deferred/.
  // `select` never needed anything — Carbon's Select is a native <select>.

  // ---- popover / tooltip: GONE FROM HERE ---------------------------------
  // js/popover.js owns both now, with Carbon's enter and leave delays, the
  // aria each one actually wants (aria-expanded for a popover the trigger
  // controls, aria-describedby for a tooltip that merely describes it), and
  // dismissal through the kernel. The toggletip third of this block left with
  // the component: it is CUT, and its fragment moved to sink/deferred/.

  // ---- menu + overflow menu: GONE FROM HERE ------------------------------
  // js/menu.js owns both, with the roving arrow-key pattern, Home and End,
  // Tab-closes, Enter forwarded as a click on <li> items, and dismissal
  // through the kernel. `optionsFor` went with them.

  // ---- copy button -------------------------------------------------------
  // .rux--copy-btn__feedback has no hidden state in CSS; Carbon's web component
  // only puts it in the DOM while animating, so the harness does the same.
  on('.rux--copy-btn', 'click', btn => {
    if (btn.querySelector('.rux--copy-btn__feedback')) return;
    const fb = document.createElement('span');
    fb.className = 'rux--copy-btn__feedback';
    fb.textContent = 'Copied!';
    btn.appendChild(fb);
    btn.classList.add('rux--copy-btn--animating', 'rux--copy-btn--fade-in');
    setTimeout(() => {
      btn.classList.remove('rux--copy-btn--fade-in');
      btn.classList.add('rux--copy-btn--fade-out');
      setTimeout(() => {
        btn.classList.remove('rux--copy-btn--animating', 'rux--copy-btn--fade-out');
        fb.remove();
      }, 240);
    }, 1400);
  });

  // ---- tabs + content switcher -------------------------------------------
  on('.rux--tabs__nav-link', 'click', link => {
    const nav = link.closest('.rux--tabs__nav');
    $$('.rux--tabs__nav-item', nav).forEach(i => i.classList.remove('rux--tabs__nav-item--selected'));
    $$('.rux--tabs__nav-link', nav).forEach(l => l.setAttribute('aria-selected', 'false'));
    link.closest('.rux--tabs__nav-item').classList.add('rux--tabs__nav-item--selected');
    link.setAttribute('aria-selected', 'true');
  });
  on('.rux--content-switcher-btn', 'click', btn => {
    const grp = btn.closest('.rux--content-switcher');
    $$('.rux--content-switcher-btn', grp).forEach(b => {
      b.classList.remove('rux--content-switcher--selected');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('rux--content-switcher--selected');
    btn.setAttribute('aria-selected', 'true');
  });

  // ---- tree view ---------------------------------------------------------
  on('.rux--tree-parent-node__toggle', 'click', tog => {
    const node = tog.closest('.rux--tree-node');
    const open = node.getAttribute('aria-expanded') !== 'true';
    node.setAttribute('aria-expanded', String(open));
    tog.querySelector('.rux--tree-parent-node__toggle-icon')
      ?.classList.toggle('rux--tree-parent-node__toggle-icon--expanded', open);
    const kids = node.querySelector('.rux--tree-node__children');
    if (kids) kids.hidden = !open;
  });
  on('.rux--tree-node__label', 'click', lbl => {
    if (lbl.closest('.rux--tree-parent-node__toggle')) return;
    const node = lbl.closest('.rux--tree-node');
    if (node.classList.contains('rux--tree-node--disabled')) return;
    const tree = node.closest('.rux--tree');
    $$('.rux--tree-node', tree).forEach(n =>
      n.classList.remove('rux--tree-node--selected', 'rux--tree-node--active'));
    node.classList.add('rux--tree-node--selected', 'rux--tree-node--active');
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

  // ---- slider ------------------------------------------------------------
  // .rux--slider__input is display:none — Carbon hides the native range and drives
  // the thumb itself, so dragging has to be implemented rather than delegated.
  const sliderPct = (slider, clientX) => {
    const track = slider.querySelector('.rux--slider__track').getBoundingClientRect();
    return Math.min(1, Math.max(0, (clientX - track.left) / track.width));
  };
  const paintSlider = slider => {
    const wraps = $$('.rux--slider__thumb-wrapper', slider);
    const pcts = wraps.map(w => parseFloat(w.style.insetInlineStart) || 0);
    const fill = slider.querySelector('.rux--slider__filled-track');
    if (!fill) return;
    if (wraps.length > 1) {
      const [lo, hi] = [Math.min(...pcts), Math.max(...pcts)];
      fill.style.transformOrigin = 'left center';
      fill.style.transform = `translate(${lo}%, -50%) scaleX(${(hi - lo) / 100})`;
      fill.style.inlineSize = '100%';
    } else {
      fill.style.transformOrigin = 'left center';
      fill.style.transform = `translate(0, -50%) scaleX(${pcts[0] / 100})`;
    }
  };
  on('.rux--slider__thumb-wrapper', 'pointerdown', (wrap, e) => {
    const slider = wrap.closest('.rux--slider');
    if (slider.classList.contains('rux--slider--disabled')) return;
    e.preventDefault();
    const move = ev => {
      const pct = sliderPct(slider, ev.clientX) * 100;
      wrap.style.insetInlineStart = pct.toFixed(1) + '%';
      paintSlider(slider);
      const input = slider.querySelector('.rux--slider__input');
      if (input) input.value = String(Math.round(pct));
    };
    const up = () => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  });
  // keyboard: the thumb is the focusable control
  on('.rux--slider__thumb-wrapper', 'keydown', (wrap, e) => {
    const slider = wrap.closest('.rux--slider');
    if (slider.classList.contains('rux--slider--disabled')) return;
    const d = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const cur = parseFloat(wrap.style.insetInlineStart) || 0;
    wrap.style.insetInlineStart = Math.min(100, Math.max(0, cur + d)).toFixed(1) + '%';
    paintSlider(slider);
  });
  $$('.rux--slider').forEach(paintSlider);

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

  // ---- escape closes everything the HARNESS still owns --------------------
  // Modals are no longer among them: js/overlay.js owns Escape for anything
  // registered with it, and dismisses only the topmost surface rather than
  // everything at once. What is left here is the state-class demos Phase 5
  // has not reached yet, and each one leaves as its module lands.
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
  });

  // ---- outside press closes what the HARNESS still owns -------------------
  // Popovers left this handler with their module: js/overlay.js dismisses them,
  // and it does so on pointerdown in the capture phase rather than click, so a
  // surface settles before the pressed control takes focus. List boxes are next.
  // Everything that used this handler now dismisses through js/overlay.js,
  // which presses on pointerdown in the capture phase rather than on click.
})();
