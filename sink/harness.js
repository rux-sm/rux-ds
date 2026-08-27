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
  const on = (sel, ev, fn) => document.addEventListener(ev, e => {
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

  // ---- fixed-position overlays: modal + side panel -----------------------
  // The modal hides itself in CSS (.is-visible is the hook). The side panel does
  // NOT — its base is transform:translateX(0) and --open only runs the entrance
  // animation, because Carbon's web component mounts and unmounts the element.
  const SHOW = { 'rux--modal': 'is-visible', 'rux--side-panel': 'rux--side-panel--open' };
  const hookFor = el => Object.entries(SHOW).find(([b]) => el.classList.contains(b))?.[1];
  const isPanel = el => el.classList.contains('rux--side-panel');
  const closeOverlays = () => $$('[data-ks-open]').forEach(b => {
    const t = document.getElementById(b.dataset.ksOpen);
    if (!t) return;
    t.classList.remove(hookFor(t));
    if (isPanel(t)) t.hidden = true;
  });
  on('[data-ks-open]', 'click', b => {
    const t = document.getElementById(b.dataset.ksOpen);
    closeOverlays();
    if (isPanel(t)) t.hidden = false;
    t.classList.add(hookFor(t));
  });
  on('[data-ks-close]', 'click', closeOverlays);

  // ---- accordion ---------------------------------------------------------
  on('.rux--accordion__heading', 'click', h => {
    const item = h.closest('.rux--accordion__item');
    const open = item.classList.toggle('rux--accordion__item--active');
    h.setAttribute('aria-expanded', String(open));
    const content = item.querySelector('.rux--accordion__content');
    if (content) content.hidden = !open;          // Carbon's collapse is JS-driven
  });

  // ---- list boxes: dropdown, combo box, multiselect ----------------------
  const closeListBoxes = except => $$('.rux--list-box').forEach(lb => {
    if (lb === except) return;
    lb.classList.remove('rux--list-box--expanded', 'rux--dropdown--open');
    lb.querySelector('.rux--list-box__menu-icon')?.classList.remove('rux--list-box__menu-icon--open');
    const m = lb.querySelector('.rux--list-box__menu');
    if (m && m.children.length) m.hidden = true;
    lb.querySelector('.rux--list-box__field')?.setAttribute('aria-expanded', 'false');
  });
  on('.rux--list-box__field', 'click', field => {
    const lb = field.closest('.rux--list-box');
    if (lb.classList.contains('rux--list-box--disabled')) return;
    const open = !lb.classList.contains('rux--list-box--expanded');
    closeListBoxes(lb);
    lb.classList.toggle('rux--list-box--expanded', open);
    lb.classList.toggle('rux--dropdown--open', open);
    field.setAttribute('aria-expanded', String(open));
    lb.querySelector('.rux--list-box__menu-icon')?.classList.toggle('rux--list-box__menu-icon--open', open);
    const menu = lb.querySelector('.rux--list-box__menu');
    if (menu && menu.children.length) menu.hidden = !open;
  });
  // Multiselect rows are checkboxes, so the input is the source of truth and the
  // menu stays open. The label's `for` toggles the box natively — re-toggling it
  // here as well would cancel itself out, which is the double-fire that made the
  // toggle look dead in §4.1.9. So: read state on `change`, and only force a
  // toggle for a click that missed the label.
  const syncMulti = lb => {
    const n = $$('.rux--checkbox', lb).filter(b => b.checked).length;
    $$('.rux--list-box__menu-item', lb).forEach(i =>
      i.setAttribute('aria-selected', String(!!i.querySelector('.rux--checkbox')?.checked)));
    // The count is a Tag, not a __selection badge — Carbon renders
    // .rux--tag.rux--tag--filter with the number in __label (verified against the
    // rendered React DOM). The whole tag is hidden at zero, which is what Carbon
    // does: no selection, no tag.
    const tag = lb.querySelector('.rux--tag');
    const count = tag?.querySelector('.rux--tag__label');
    if (count) count.textContent = String(n);
    tag?.toggleAttribute('hidden', n === 0);
    lb.classList.toggle('rux--multi-select--selected', n > 0);
  };
  on('.rux--multi-select .rux--checkbox', 'change', box => syncMulti(box.closest('.rux--list-box')));
  on('.rux--multi-select .rux--list-box__menu-item', 'click', (item, e) => {
    if (e.target.closest('.rux--checkbox-wrapper')) return;   // native label/input path
    const box = item.querySelector('.rux--checkbox');
    if (!box) return;
    box.checked = !box.checked;
    syncMulti(item.closest('.rux--list-box'));
  });
  // Clearing resets every row. The tag is a SIBLING of the field button inside
  // __field--wrapper, not a child of it, so this cannot also toggle the menu —
  // which is why the old guard on the field handler is gone.
  on('.rux--tag__close-icon', 'click', icon => {
    const lb = icon.closest('.rux--multi-select');
    if (!lb) return;
    $$('.rux--checkbox', lb).forEach(b => b.checked = false);
    syncMulti(lb);
  });

  on('.rux--list-box__menu-item', 'click', item => {
    const lb = item.closest('.rux--list-box');
    if (lb.classList.contains('rux--multi-select')) return;   // handled above
    $$('.rux--list-box__menu-item', lb).forEach(i => {
      i.classList.remove('rux--list-box__menu-item--highlighted', 'rux--list-box__menu-item--active');
      i.setAttribute('aria-selected', 'false');
    });
    item.classList.add('rux--list-box__menu-item--highlighted', 'rux--list-box__menu-item--active');
    item.setAttribute('aria-selected', 'true');
    const label = lb.querySelector('.rux--list-box__label');
    if (label) label.textContent = item.textContent.trim();
    closeListBoxes(null);
  });

  // ---- popover / tooltip / toggletip -------------------------------------
  // All three share the popover mechanism: .rux--popover--open on the CONTAINER is
  // what sets display:block on .rux--popover-content.
  const POP = '.rux--popover-container, .rux--toggletip, .rux--tooltip';
  on(POP + ' > button, ' + POP + ' > .rux--toggletip-button', 'click', trigger => {
    const c = trigger.closest('.rux--popover-container, .rux--toggletip, .rux--tooltip');
    const open = c.classList.toggle('rux--popover--open');
    c.classList.toggle('rux--toggletip--open', open && c.classList.contains('rux--toggletip'));
    trigger.setAttribute('aria-expanded', String(open));
  });

  // ---- menu + overflow menu ----------------------------------------------
  on('[data-ks-menu]', 'click', trigger => {
    const menu = document.getElementById(trigger.dataset.ksMenu);
    const open = menu.classList.toggle('rux--menu--open');
    menu.classList.toggle('rux--menu--shown', open);
    trigger.setAttribute('aria-expanded', String(open));
  });
  on('.rux--overflow-menu', 'click', el => {
    const open = el.classList.toggle('rux--overflow-menu--open');
    el.querySelector('.rux--overflow-menu-options')
      ?.classList.toggle('rux--overflow-menu-options--open', open);
    el.setAttribute('aria-expanded', String(open));
  });

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

  // ---- escape closes everything -----------------------------------------
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    closeOverlays();
    closeListBoxes(null);
    $$('.rux--popover--open').forEach(c => c.classList.remove('rux--popover--open', 'rux--toggletip--open'));
    $$('.rux--menu--open').forEach(m => m.classList.remove('rux--menu--open', 'rux--menu--shown'));
    $$('.rux--overflow-menu--open').forEach(m => {
      m.classList.remove('rux--overflow-menu--open');
      m.querySelector('.rux--overflow-menu-options')?.classList.remove('rux--overflow-menu-options--open');
    });
  });

  // ---- outside press closes list boxes and popovers ----------------------
  document.addEventListener('click', e => {
    if (!e.target.closest('.rux--list-box')) closeListBoxes(null);
    if (!e.target.closest('.rux--popover-container, .rux--toggletip, .rux--tooltip'))
      $$('.rux--popover--open').forEach(c => c.classList.remove('rux--popover--open', 'rux--toggletip--open'));
  }, true);
})();
