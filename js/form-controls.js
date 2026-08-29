/* ==========================================================================
   rux-ds — TOGGLE, NUMBER STEPPERS, SEARCH CLEAR, INDETERMINATE
                                                        Phase 5, roadmap §4.5
   --------------------------------------------------------------------------
   Requires js/overlay.js only to share the `window.Rux` namespace. None of
   these overlays anything, so none of them joins the dismiss stack.

   FOUR SMALL CONTROLS IN ONE FILE, because each is a handful of lines and a
   file per control would be four script tags for 30 lines of behaviour. They
   are grouped by what they are — form controls that only ever mutate
   themselves — rather than by component name.

   THE STEPPERS ARE TOLD APART BY ORDER, NOT BY LABEL. Carbon gives both
   buttons the identical class `number__control-btn` and distinguishes them by
   nothing else; the sink harness read `aria-label` for "increment", which is a
   TRANSLATED STRING and would leave the control dead on any page not in
   English. The reference renders decrement first and increment second, so
   position is the signal — locale-independent, and the only one Carbon
   actually provides.

   `data-rux-indeterminate` HAS TO BE AN ATTRIBUTE, because `indeterminate` is
   a DOM PROPERTY with no HTML counterpart: a checkbox cannot express the
   state in markup at all. This is the one place the contract adds an
   attribute for something other than relating a trigger to a surface, and
   the reason is that HTML gives no alternative.
   ========================================================================== */

/* BEHAVIOUR: derived · the toggle, steppers, search clear and indeterminate checkbox are driven from the
   captured markup and the attributes it declares. No running Carbon control was opened;
   templates/form-page.html records the same gap from its side.
   ========================================================================== */
(() => {
  'use strict';
  if (!window.Rux?.overlay) return; // js/overlay.js must load first

  /* ── toggle: a <button role="switch">, so Enter and Space are the browser's ─ */
  function setToggle(root, on) {
    if (root.classList.contains('rux--toggle--disabled')) return;
    const button = root.querySelector('.rux--toggle__button');
    const sw = root.querySelector('.rux--toggle__switch');
    if (button?.disabled) return;
    sw?.classList.toggle('rux--toggle__switch--checked', on);
    button?.setAttribute('aria-checked', String(on));
    const text = root.querySelector('.rux--toggle__text');
    if (text) text.textContent = on ? 'On' : 'Off';
    root.dispatchEvent(new CustomEvent('rux:toggle', { bubbles: true, detail: { on } }));
  }

  /* ── number steppers ───────────────────────────────────────────────────── */
  function step(button) {
    const root = button.closest('.rux--number');
    if (!root || root.classList.contains('rux--number--readonly')) return;
    const input = root.querySelector('input[type="number"]');
    if (!input || input.disabled || input.readOnly) return;

    const buttons = [...root.querySelectorAll('.rux--number__control-btn')];
    const up = buttons.indexOf(button) > 0;   // decrement first, increment second
    const by = Number(input.step) || 1;
    const min = input.min === '' ? -Infinity : Number(input.min);
    const max = input.max === '' ? Infinity : Number(input.max);
    const next = (Number(input.value) || 0) + (up ? by : -by);

    input.value = String(Math.min(max, Math.max(min, next)));
    // BOTH events. A user turning the spinner on a native number input fires
    // `input` while typing and `change` when committing; a listener bound to
    // either one must hear this the same way it hears the keyboard.
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /* ── search clear ──────────────────────────────────────────────────────── */
  const syncSearch = search => {
    const input = search.querySelector('.rux--search-input');
    const close = search.querySelector('.rux--search-close');
    close?.classList.toggle('rux--search-close--hidden', !input?.value);
  };

  /* ── wiring ────────────────────────────────────────────────────────────── */
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;

    // The BUTTON only. A <label for> pointing at a button forwards the click to
    // it, so handling the label as well fires twice and the toggle reads dead.
    const toggle = event.target.closest('.rux--toggle__button');
    if (toggle) {
      const root = toggle.closest('.rux--toggle');
      if (root) setToggle(root, toggle.getAttribute('aria-checked') !== 'true');
      return;
    }
    const stepper = event.target.closest('.rux--number__control-btn');
    if (stepper) { step(stepper); return; }

    const clear = event.target.closest('.rux--search-close');
    if (clear) {
      const search = clear.closest('.rux--search');
      const input = search?.querySelector('.rux--search-input');
      if (input) { input.value = ''; input.dispatchEvent(new Event('input', { bubbles: true })); input.focus(); }
      if (search) syncSearch(search);
    }
  });

  document.addEventListener('input', event => {
    if (!(event.target instanceof Element)) return;
    const search = event.target.closest('.rux--search');
    if (search && event.target.matches('.rux--search-input')) syncSearch(search);
  });

  /* Adopt what the markup shipped: a search that starts with a value shows its
     clear button, and `indeterminate` is set from the attribute that is the
     only way to express it in HTML. */
  for (const search of document.querySelectorAll('.rux--search')) syncSearch(search);
  for (const box of document.querySelectorAll('input[type="checkbox"][data-rux-indeterminate]'))
    box.indeterminate = true;

  window.Rux.formControls = {
    toggle: (root, on) => setToggle(root, on ?? root.querySelector('.rux--toggle__button')?.getAttribute('aria-checked') !== 'true'),
    step,
    syncSearch,
  };
})();
