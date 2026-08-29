//
// DOES THE BEHAVIOUR LAYER STILL DO WHAT IT CLAIMS? — paste into a rendered
// page's console, or fetch it from the server the way the other browser tools
// are run.
//
// WHY THIS EXISTS. Markup and CSS have fourteen gates, a coverage ratchet, a
// provenance requirement and a CI job. `js/` had none of it: 1,942 lines across
// twelve modules whose only verification was a person clicking and forming an
// opinion. Both real bugs found on 2026-08-28/29 were behaviour, not markup —
// a batch bar keeping focusable buttons inside an `aria-hidden` subtree, and an
// overflow menu covering the last 8px of its own trigger in nine places. Neither
// is visible to a gate that reads a file, and `check-runtime-classes` declares
// itself blind to "anything behind an interaction."
//
// THE THIRD ANSWER. Roadmap §4.8 frames this as a choice between adding a
// headless browser — "a real change to what the project is" — and accepting that
// behaviour regressions are caught by people. There is a third option, and it is
// the one this file takes: write the assertions as a BROWSER TOOL, like the four
// that already exist. No dependency, no runner, no framework. A person still
// triggers it, but what they get back is a pass/fail list instead of an
// impression.
//
// WHAT THAT DOES NOT BUY. It does not run in CI, and it is not a substitute for
// the headless-browser decision — it makes that decision less urgent, not moot.
// Every case here is SYNCHRONOUS: a module that lands focus in a microtask has
// its class and attribute contract checked and its focus destination left alone,
// because a tool that returns a value cannot wait. Those are named in the case
// list rather than quietly skipped.
//
// EVERY CASE RESTORES WHAT IT TOUCHED, so the tool is idempotent and can run
// beside the other browser gates without poisoning them. That matters here more
// than elsewhere: `check-runtime-classes` must see an untouched page, and this
// one deliberately touches everything.
//
// IT ASSERTS THE CONTRACT EACH MODULE STATES ABOUT ITSELF, not an idea of how
// the component ought to work. Where a module's header names a rule — "only
// `--expanded` is toggled", "the surface is a sibling, never a child" — that
// sentence is the assertion.
//
(() => {
  const cases = [];
  const record = (module, name, ok, detail) =>
    cases.push({ module, name, ok, detail: ok ? '' : detail });

  const q = sel => document.querySelector(sel);
  const has = (el, c) => !!el && el.classList.contains(c);

  // A real click. The modules bind at document level, so a synthetic
  // `dispatchEvent` on a detached path would miss the delegation entirely.
  const click = el => el.click();
  // Dispatched on the element, bubbling, because every module listens on
  // document. Not a trusted event — it cannot test what the browser does with a
  // key, only what our own handlers do with one, which is what is being checked.
  const key = (el, k) => el.dispatchEvent(
    new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));

  // ── data-table: the batch bar ─────────────────────────────────────────────
  // The bug this file exists for. Closed must be aria-hidden with every button
  // out of the tab order; open must be neither. js/data-table.js moves the two
  // together because both derive from the same count.
  // THE FIRST DRAFT OF THIS CASE FAILED, AND THE TEST WAS WRONG. It clicked one
  // row twice and expected the bar to close, but sink/table.html ships its
  // SECOND row checked on purpose — `--active` is the state that table is
  // genuinely in at load, so check-coverage can see the class. One row still
  // selected keeps the bar open, correctly. A behaviour test has to drive the
  // page to a known state rather than assume one, or it measures the fixture.
  (() => {
    const rows = [...document.querySelectorAll(
      '#table tbody td.rux--table-column-checkbox input[type="checkbox"]')];
    const bar = q('#table .rux--batch-actions');
    if (!rows.length || !bar) return record('data-table', 'batch bar', false, 'no selectable table on this page');
    const was = rows.map(r => r.checked);
    const btns = () => [...bar.querySelectorAll('button')];
    const state = () => `aria-hidden=${bar.getAttribute('aria-hidden')} tabindex=[${btns().map(b => b.tabIndex)}]`;

    for (const r of rows) if (r.checked) click(r);          // known state: none selected
    record('data-table', 'with nothing selected the bar is hidden and out of the tab order',
      bar.getAttribute('aria-hidden') === 'true' && btns().every(b => b.tabIndex === -1)
      && !has(bar, 'rux--batch-actions--active'), state());

    click(rows[0]);
    record('data-table', 'selecting a row opens it and returns its buttons to the tab order',
      bar.getAttribute('aria-hidden') === 'false' && btns().every(b => b.tabIndex === 0)
      && has(bar, 'rux--batch-actions--active'), state());

    click(rows[0]);
    record('data-table', 'deselecting the last row closes it and takes them back out',
      bar.getAttribute('aria-hidden') === 'true' && btns().every(b => b.tabIndex === -1)
      && !has(bar, 'rux--batch-actions--active'), state());

    rows.forEach((r, i) => { if (r.checked !== was[i]) click(r); });
  })();

  // ── menu: the overflow list sits below its trigger ────────────────────────
  // The second bug. Carbon's CSS pre-positions at 32px for an `sm` trigger while
  // the trigger defaults to `md` at 40px, so without the module writing an
  // offset the list covers 8px of the button that opens it.
  (() => {
    const wrap = q('#overflow-menu .ks-row > div');
    const trigger = wrap?.querySelector('button.rux--overflow-menu');
    const list = wrap?.querySelector('.rux--overflow-menu-options');
    if (!trigger || !list) return record('menu', 'overflow offset', false, 'no overflow menu on this page');

    click(trigger);
    const tr = trigger.getBoundingClientRect(), lr = list.getBoundingClientRect();
    const overlap = Math.round(tr.bottom - lr.top);
    record('menu', 'an open overflow list is flush below its trigger, not over it',
      overlap === 0, `overlaps by ${overlap}px`);
    record('menu', 'the trigger reports itself expanded',
      trigger.getAttribute('aria-expanded') === 'true',
      `aria-expanded=${trigger.getAttribute('aria-expanded')}`);

    click(trigger);
    record('menu', 'closing clears the offset it wrote',
      list.style.insetBlockStart === '', `left "${list.style.insetBlockStart}"`);
  })();

  // ── tabs: roving tabindex, and the panel follows ──────────────────────────
  (() => {
    const list = q('#tabs [role="tablist"]');
    const tabs = list ? [...list.querySelectorAll('[role="tab"]')] : [];
    if (tabs.length < 2) return record('tabs', 'roving tabindex', false, 'fewer than two tabs here');
    const first = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    const other = tabs.find(t => t !== first);

    click(other);
    const sel = other.getAttribute('aria-selected') === 'true'
      && first.getAttribute('aria-selected') === 'false';
    record('tabs', 'selecting a tab deselects the previous one', sel,
      `selected=[${tabs.map(t => t.getAttribute('aria-selected'))}]`);
    record('tabs', 'exactly one tab is in the tab order',
      tabs.filter(t => t.tabIndex === 0).length === 1,
      `tabindex=[${tabs.map(t => t.tabIndex)}]`);

    // A VERTICAL TABLIST ANSWERS UP AND DOWN, and until 2026-08-29 it answered
    // Left and Right instead — vertical was read off aria-orientation, which
    // neither Carbon nor this markup sets, so the axis never swapped.
    const vlist = q('.rux--tabs--vertical [role="tablist"]');
    if (!vlist) {
      record('tabs', 'a vertical tablist answers the vertical arrows', false,
        'no vertical tablist on this page');
    } else {
      const vt = [...vlist.querySelectorAll('[role="tab"]')];
      const at = () => vt.indexOf(document.activeElement);
      vt[0].focus();
      key(document.activeElement, 'ArrowDown');
      const down = at();
      vt[0].focus();
      key(document.activeElement, 'ArrowRight');
      const right = at();
      vt[0].focus();
      record('tabs', 'a vertical tablist answers the vertical arrows',
        down === 1 && right === 0,
        `ArrowDown -> ${down} (want 1), ArrowRight -> ${right} (want 0, it is the wrong axis)`);
    }
    const panel = document.getElementById(other.getAttribute('aria-controls'));
    record('tabs', 'its panel is shown and the others are hidden',
      panel && !panel.hidden, panel ? `hidden=${panel.hidden}` : 'no panel for aria-controls');

    click(first);
  })();

  // ── accordion: the attribute and the class move together ──────────────────
  (() => {
    const head = q('#accordion .rux--accordion__heading');
    if (!head) return record('accordion', 'toggle', false, 'no accordion on this page');
    const item = head.closest('.rux--accordion__item');
    const before = head.getAttribute('aria-expanded');

    click(head);
    const flipped = head.getAttribute('aria-expanded') !== before
      && has(item, 'rux--accordion__item--active') === (head.getAttribute('aria-expanded') === 'true');
    record('accordion', 'a heading toggles aria-expanded and the item class together',
      flipped, `aria-expanded ${before} -> ${head.getAttribute('aria-expanded')}, ` +
      `--active=${has(item, 'rux--accordion__item--active')}`);

    click(head);
    record('accordion', 'and toggles back', head.getAttribute('aria-expanded') === before,
      `ended at ${head.getAttribute('aria-expanded')}`);
  })();

  // ── modal + the overlay kernel ────────────────────────────────────────────
  // Focus lands in a microtask, so this checks the class and attribute contract
  // and leaves where focus went to check-a11y.
  (() => {
    const trigger = q('#modal [data-rux-open]');
    const modal = trigger ? document.getElementById(trigger.getAttribute('data-rux-open')) : null;
    if (!modal) return record('modal', 'open and dismiss', false, 'no modal trigger on this page');

    click(trigger);
    record('modal', 'a trigger opens the surface it names',
      has(modal, 'is-visible'), `class="${modal.className}"`);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    record('modal', 'Escape dismisses it through the kernel',
      !has(modal, 'is-visible'), `still visible: ${has(modal, 'is-visible')}`);

    // WHERE THE DIALOG ROLE LIVES. Carbon puts role=presentation on the scrim
    // and the dialog on the container; ours had it the other way until
    // 2026-08-29, which made the full-viewport backdrop the dialog.
    const container = modal.querySelector('.rux--modal-container');
    record('modal', 'the container is the dialog, not the scrim',
      modal.getAttribute('role') === 'presentation'
      && container?.getAttribute('role') === 'dialog'
      && container?.getAttribute('aria-modal') === 'true',
      `root role=${modal.getAttribute('role')}, `
      + `container role=${container?.getAttribute('role')} aria-modal=${container?.getAttribute('aria-modal')}`);

    // aria-expanded described a region that expands in place. A dialog is not
    // one, and Carbon sets nothing on the trigger at all.
    click(trigger);
    const expandedWhileOpen = trigger.getAttribute('aria-expanded');
    key(document, 'Escape');
    record('modal', 'the trigger is never given aria-expanded',
      expandedWhileOpen === null && trigger.getAttribute('aria-expanded') === null,
      `while open: ${expandedWhileOpen}, after close: ${trigger.getAttribute('aria-expanded')}`);
  })();

  // ── dismiss: removed, not hidden ──────────────────────────────────────────
  // js/dismiss.js states Carbon's React unmounts rather than hides, and that a
  // hidden-but-present element would keep answering querySelectorAll.
  (() => {
    const close = q('#notification .rux--inline-notification__close-button');
    if (!close) return record('dismiss', 'removal', false, 'no dismissible notification here');
    const box = close.closest('.rux--inline-notification');
    const parent = box.parentNode, next = box.nextSibling;

    click(close);
    record('dismiss', 'dismissing removes the box from the DOM rather than hiding it',
      !box.isConnected, box.isConnected ? 'still connected' : '');

    if (!box.isConnected) parent.insertBefore(box, next);
  })();

  // ── form-controls: the toggle ─────────────────────────────────────────────
  (() => {
    const toggle = q('#toggle .rux--toggle__button');
    if (!toggle) return record('form-controls', 'toggle', false, 'no toggle on this page');
    const before = toggle.getAttribute('aria-checked');

    click(toggle);
    record('form-controls', 'the toggle flips aria-checked',
      toggle.getAttribute('aria-checked') !== before,
      `stayed ${toggle.getAttribute('aria-checked')}`);

    click(toggle);
  })();

  // ── list-box: the dropdown its consumers are built from ───────────────────
  (() => {
    const trigger = q('#dropdown button[role="combobox"]');
    if (!trigger) return record('list-box', 'open', false, 'no dropdown trigger on this page');
    const menu = trigger.closest('.rux--list-box')?.querySelector('.rux--list-box__menu');

    click(trigger);
    const open = trigger.getAttribute('aria-expanded') === 'true'
      && menu && menu.getBoundingClientRect().height > 0;
    record('list-box', 'the trigger opens a menu with height',
      open, `aria-expanded=${trigger.getAttribute('aria-expanded')}, ` +
      `height=${menu ? Math.round(menu.getBoundingClientRect().height) : 'n/a'}`);

    click(trigger);
    record('list-box', 'and closes it',
      trigger.getAttribute('aria-expanded') === 'false',
      `aria-expanded=${trigger.getAttribute('aria-expanded')}`);

    // BOTH OF THESE WERE WRONG UNTIL 2026-08-29, and both were found by driving
    // Carbon rather than by reading ours. They are here so the next edit to
    // list-box.js cannot quietly restore either.
    const cursor = () => {
      const id = trigger.getAttribute('aria-activedescendant');
      const opts = [...trigger.closest('.rux--list-box')
        .querySelectorAll('.rux--list-box__menu-item[role="option"]')];
      return opts.findIndex(o => o.id === id);
    };
    const opts = [...trigger.closest('.rux--list-box')
      .querySelectorAll('.rux--list-box__menu-item[role="option"]')];

    // SPACE IS INERT. Carbon leaves a closed dropdown closed; ours used to open
    // it, because ' ' is a length-1 key and fell through into typeahead.
    trigger.focus();
    key(trigger, ' ');
    record('list-box', 'space does not open a closed dropdown',
      trigger.getAttribute('aria-expanded') === 'false',
      `aria-expanded=${trigger.getAttribute('aria-expanded')} after Space`);

    // THE ARROWS CLAMP. Carbon stops at each end; ours used to wrap.
    key(trigger, 'ArrowDown');            // opens, cursor on the first option
    key(trigger, 'End');                  // jump to the last
    const atEnd = cursor();
    key(trigger, 'ArrowDown');            // must not wrap to the first
    record('list-box', 'ArrowDown clamps at the last option',
      cursor() === atEnd && atEnd === opts.length - 1,
      `was ${atEnd}, now ${cursor()}, of ${opts.length}`);

    key(trigger, 'Home');
    const atTop = cursor();
    key(trigger, 'ArrowUp');              // must not wrap to the last
    record('list-box', 'ArrowUp clamps at the first option',
      cursor() === atTop && atTop === 0,
      `was ${atTop}, now ${cursor()}`);
    key(trigger, 'Escape');
  })();

  // ── the kernel's stack: one open surface at a time ────────────────────────
  // js/overlay.js exists because two surfaces otherwise disagree about who owns
  // a press. Opening a second dismissible surface must close the first.
  (() => {
    const a = q('#dropdown button[role="combobox"]');
    const b = q('#modal [data-rux-open]');
    const modal = b ? document.getElementById(b.getAttribute('data-rux-open')) : null;
    if (!a || !modal) return record('overlay', 'stack', false, 'need a dropdown and a modal on this page');

    click(a);
    click(b);
    record('overlay', 'opening a modal dismisses the dropdown already on the stack',
      a.getAttribute('aria-expanded') === 'false',
      `dropdown still aria-expanded=${a.getAttribute('aria-expanded')}`);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    if (a.getAttribute('aria-expanded') === 'true') click(a);
  })();

  const failed = cases.filter(c => !c.ok);
  console.log(`\n  check-behaviour — ${cases.length - failed.length}/${cases.length} passed`);
  for (const f of failed) console.log(`  FAIL  ${f.module}: ${f.name}\n        ${f.detail}`);
  console.log(`\n  NOT CHECKED: anything that lands in a microtask — focus destination,`);
  console.log(`  focus restoration, and the order two surfaces close in. A synchronous`);
  console.log(`  tool cannot wait for them. check-a11y owns where focus ends up.\n`);

  return { passed: cases.length - failed.length, total: cases.length, failed, cases };
})();
