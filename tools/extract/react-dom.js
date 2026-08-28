//
// REACT DOM QUARRY — paste into the console at https://react.carbondesignsystem.com
//
// Companion to tools/extract/index.html, which quarries the WEB COMPONENTS. This
// one quarries @carbon/react, and roadmap §4.1.11 is why both exist: for light-DOM
// class placement React is authoritative, because @carbon/styles is the CSS React
// consumes. The web components render into shadow DOM with different structure —
// cds-tab emits an <a> and never emits --nav-item at all.
//
// Why a browser tool and not Node: the same reason as check-rendered.js. Reading
// the rendered DOM is the whole point — JSX has conditionals, and reasoning
// through them is exactly how the tabs and multiselect fragments went wrong. This
// reads what Carbon actually produced.
//
// Storybook serves every story from its own origin, so an iframe per story is
// same-origin and readable. No CORS, no headless browser, no dependency.
//
// TWO MODES, because a story capture only shows the component's DEFAULT
// configuration. 'stories' harvests every story as it renders and downloads
// carbon-react-dom.json — move it to docs/ and it becomes the reference every
// fragment is diffed against. 'states' runs the RECIPES table instead: each
// recipe re-loads one story with Storybook's `args=` URL override (prop states
// no story demos — invalid, warn, readOnly, sizes) and/or dispatches
// interaction steps into the same-origin iframe (open menus, active header
// actions, copy feedback), then captures the CONFIGURED tree into
// carbon-react-states.json. Both files are check-tags references.
//
// Every recipe capture is compared against a bare capture of the same story
// made in the same run. A recipe that changed nothing records '(unchanged)'
// rather than the tree — a wrong arg name or a click that bound to nothing
// would otherwise store a copy of the default DOM and read as "state
// verified". A step whose selector matches nothing records '(step-miss)' for
// the same reason. Both are failures to fix, never data.
//
// Captures include body-level floats: classic overflow-menu portals its
// options to document.body, flatpickr appends its calendar there, and a
// root-only tree misses exactly the state a recipe exists to show. Any body
// child carrying or containing a cds-- class is appended to the tree.
// ('stories' mode captures the same way since this was added; the committed
// carbon-react-dom.json predates it and is root-only.)
//
// Anything that did not yield a tree is recorded, never dropped, under one of
// four verdicts. They are not interchangeable — only the first two are worth a
// second attempt, and the run retries exactly those:
//
//   (empty)       loaded, root stayed childless until SETTLE_MAX_MS
//   (timeout)     the iframe never fired load
//   (missing)     Storybook says the id is not in the catalogue. Permanent;
//                 six of carbon-website's own curated ids are in this state
//   (unreadable)  contentDocument threw. Not a timing problem
//
// 'states' adds three of its own, none retried:
//
//   (no-story)    the recipe's id is not in this origin's catalogue. Expected
//                 when one recipe list is run against both Storybook origins
//   (step-miss)   a step's selector matched nothing after the story painted
//   (unchanged)   the capture is byte-identical to the bare story
//
(async () => {
  const MODE = 'stories';                // 'stories' → carbon-react-dom.json
                                         // 'states'  → carbon-react-states.json
  // FILTER is a convenience for re-harvesting one component, NOT a correctness
  // filter, and it used to be both. As /^components-/ it dropped 87 of 505
  // stories, and the 15 fragments with no `components-` story of their own —
  // grid under elements-, stack under layout-, the four preview-* indicators,
  // page-header under deprecated- — were exactly the ones that then had nothing
  // to diff against.
  //
  // The obvious repair was a wider prefix list. That would have been an
  // allow-list needing an entry every time Carbon adds a prefix, so it was
  // tested instead: all 505 harvested, counting which stories yield any cds--
  // class. Every prefix scored 100%, hooks, helpers and utilities included —
  // 505/505, no bare renders, no failures. No exclusion survives contact with
  // the data, so the default excludes nothing.
  //
  // Cost of the full run, measured, not estimated: 84s, 2.4GB peak heap against
  // a 4096MB renderer cap, in one visible tab. Comfortable, but not by so much
  // that a future Carbon could not outgrow it — if it does, harvest in slices
  // and merge, in a FRESH TAB each time. A reload does not reset the heap.
  const FILTER = /./;                    // narrow this to re-harvest one component
  const CONCURRENCY = 3;                 // iframes at a time; 3 is polite and quick

  // The RECIPES table drives 'states' mode. Each row is one configured capture:
  //   story   the story id to load (skipped as (no-story) if not in this origin)
  //   name    unique per story; the output key is `story@name`
  //   args    Storybook URL serialization: `key:value;key2:value2`, booleans !true
  //   steps   dispatched in order after paint: {click|hover|focus: 'selector'}
  //   waitFor wait for this selector before capturing, AFTER any steps — for
  //           subjects that mount long after the story chrome (ibm-products'
  //           side panel takes ~6s) or only exist once a step ran. The bare
  //           comparison waits too, but only for args-only recipes: a subject
  //           steps create legitimately does not exist in the bare story
  //
  // Rows were drafted against the sink classes check-tags reports with no
  //   reference — each targets specific orphans, not completeness for its own
  //   sake. RECIPE_FILTER narrows a re-run the way FILTER narrows 'stories'
  //   mode; it matches the `story@name` key.
  const RECIPE_FILTER = /./;
  const RECIPES = [
    // ---- open list boxes: expanded, menu-icon--open, menu-item, --active, __option, __selected-icon
    { story: 'components-dropdown--default',    name: 'open',          steps: [{ click: '[role="combobox"]' }] },
    { story: 'components-combobox--default',    name: 'open',          steps: [{ click: '.cds--list-box__menu-icon' }] },
    { story: 'components-multiselect--default', name: 'open',          steps: [{ click: '[role="combobox"]' }] },
    { story: 'components-multiselect--default', name: 'open-selected', steps: [{ click: '[role="combobox"]' }, { click: '.cds--list-box__menu-item' }] },
    { story: 'components-fluid-components-fluidmultiselect--default', name: 'open-selected',
      steps: [{ click: '[role="combobox"]' }, { click: '.cds--list-box__menu-item' }] },
    // ---- dropdown prop states: --disabled, --readonly, sizes (and whatever size actually emits)
    { story: 'components-dropdown--default',    name: 'disabled',      args: 'disabled:!true' },
    { story: 'components-dropdown--default',    name: 'readonly',      args: 'readOnly:!true' },
    { story: 'components-dropdown--default',    name: 'sm',            args: 'size:sm' },
    { story: 'components-dropdown--default',    name: 'lg',            args: 'size:lg' },
    { story: 'components-dropdown--default',    name: 'warn',          args: 'warn:!true' },
    { story: 'components-combobox--default',    name: 'readonly',      args: 'readOnly:!true' },
    { story: 'components-multiselect--default', name: 'readonly',      args: 'readOnly:!true' },
    // ---- menus: menu-button__trigger--open, menu--md/--lg, overflow-menu option states
    { story: 'components-menubutton--default',  name: 'open',          steps: [{ click: 'button' }] },
    { story: 'components-menubutton--default',  name: 'open-lg',       args: 'size:lg', steps: [{ click: 'button' }] },
    { story: 'components-combobutton--default', name: 'sm',            args: 'size:sm' },
    { story: 'components-combobutton--default', name: 'md',            args: 'size:md' },
    // The trigger needs its own class: both combo-button buttons are the only
    // button among their siblings, so `button:last-of-type` matches the
    // PRIMARY action first and the menu never opens.
    { story: 'components-combobutton--default', name: 'open',          steps: [{ click: '.cds--combo-button__trigger' }] },
    { story: 'components-overflowmenu--default', name: 'open',         steps: [{ click: 'button' }] },
    // ---- feedback states an arg reaches: invalid, warn, readOnly per input family
    { story: 'components-select--default',      name: 'invalid',       args: 'invalid:!true' },
    { story: 'components-select--default',      name: 'warn',          args: 'warn:!true' },
    { story: 'components-select--default',      name: 'disabled',      args: 'disabled:!true' },
    { story: 'components-select--default',      name: 'readonly',      args: 'readOnly:!true' },
    { story: 'components-checkbox--default',    name: 'invalid',       args: 'invalid:!true' },
    { story: 'components-checkbox--default',    name: 'warn',          args: 'warn:!true' },
    { story: 'components-checkbox--default',    name: 'readonly',      args: 'readOnly:!true' },
    { story: 'components-radiobutton--default', name: 'invalid',       args: 'invalid:!true' },
    { story: 'components-radiobutton--default', name: 'warn',          args: 'warn:!true' },
    { story: 'components-radiobutton--default', name: 'readonly',      args: 'readOnly:!true' },
    { story: 'components-textarea--default',    name: 'invalid',       args: 'invalid:!true' },
    { story: 'components-textarea--default',    name: 'warn',          args: 'warn:!true' },
    { story: 'components-textarea--default',    name: 'readonly',      args: 'readOnly:!true' },
    { story: 'components-textinput--default',   name: 'warn',          args: 'warn:!true' },
    { story: 'components-textinput--default',   name: 'disabled',      args: 'disabled:!true' },
    { story: 'components-textinput--inline',    name: 'invalid',       args: 'invalid:!true' },
    { story: 'components-numberinput--default', name: 'invalid',       args: 'invalid:!true' },
    { story: 'components-numberinput--default', name: 'warn',          args: 'warn:!true' },
    { story: 'components-numberinput--default', name: 'readonly',      args: 'readOnly:!true' },
    { story: 'components-numberinput--default', name: 'sm',            args: 'size:sm' },
    { story: 'components-numberinput--default', name: 'lg',            args: 'size:lg' },
    { story: 'components-slider--default',      name: 'disabled',      args: 'disabled:!true' },
    { story: 'components-slider--default',      name: 'readonly',      args: 'readOnly:!true' },
    { story: 'components-slider--default',      name: 'invalid',       args: 'invalid:!true' },
    { story: 'components-slider--default',      name: 'warn',          args: 'warn:!true' },
    { story: 'components-toggle--default',      name: 'disabled',      args: 'disabled:!true' },
    { story: 'components-toggle--default',      name: 'readonly',      args: 'readOnly:!true' },
    { story: 'components-search--default',      name: 'disabled',      args: 'disabled:!true' },
    { story: 'components-timepicker--default',  name: 'invalid',       args: 'invalid:!true' },
    { story: 'components-timepicker--default',  name: 'readonly',      args: 'readOnly:!true' },
    { story: 'components-timepicker--default',  name: 'sm',            args: 'size:sm' },
    { story: 'components-timepicker--default',  name: 'lg',            args: 'size:lg' },
    { story: 'components-datepicker--simple',   name: 'invalid',       args: 'invalid:!true' },
    { story: 'components-datepicker--simple',   name: 'warn',          args: 'warn:!true' },
    { story: 'components-datepicker--simple',   name: 'sm',            args: 'size:sm' },
    { story: 'components-datepicker--simple',   name: 'lg',            args: 'size:lg' },
    { story: 'components-datepicker--simple',   name: 'short',         args: 'short:!true' },
    // ---- fluid feedback states
    { story: 'components-fluid-components-fluiddatepicker--simple',    name: 'invalid', args: 'invalid:!true' },
    { story: 'components-fluid-components-fluiddatepicker--simple',    name: 'warn',    args: 'warn:!true' },
    { story: 'components-fluid-components-fluidnumberinput--default',  name: 'invalid', args: 'invalid:!true' },
    { story: 'components-fluid-components-fluidnumberinput--default',  name: 'disabled', args: 'disabled:!true' },
    { story: 'components-fluid-components-fluidtimepicker--default',   name: 'invalid', args: 'invalid:!true' },
    { story: 'components-fluid-components-fluidtimepicker--default',   name: 'disabled', args: 'disabled:!true' },
    { story: 'components-fluid-components-fluidtimepicker--default',   name: 'warning', args: 'warn:!true' },
    { story: 'components-fluid-components-fluiddropdown--default',     name: 'invalid', args: 'invalid:!true' },
    // ---- notification kinds and contrast
    { story: 'components-notifications-inline--default', name: 'info',         args: 'kind:info' },
    { story: 'components-notifications-inline--default', name: 'success',      args: 'kind:success' },
    { story: 'components-notifications-inline--default', name: 'warning',      args: 'kind:warning' },
    { story: 'components-notifications-inline--default', name: 'low-contrast', args: 'lowContrast:!true' },
    { story: 'components-notifications-toast--default',  name: 'success',      args: 'kind:success' },
    { story: 'components-notifications-toast--default',  name: 'warning',      args: 'kind:warning' },
    { story: 'components-notifications-actionable--default', name: 'success',  args: 'kind:success' },
    { story: 'components-notifications-actionable--default', name: 'warning',  args: 'kind:warning' },
    // ---- progress
    { story: 'components-progressbar--default', name: 'small',    args: 'size:small' },
    { story: 'components-progressbar--default', name: 'finished', args: 'status:finished' },
    { story: 'components-progressbar--default', name: 'error',    args: 'status:error' },
    { story: 'components-progressindicator--default', name: 'vertical',    args: 'vertical:!true' },
    { story: 'components-progressindicator--default', name: 'space-equal', args: 'spaceEqually:!true' },
    { story: 'components-inlineloading--default', name: 'finished', args: 'status:finished' },
    { story: 'components-inlineloading--default', name: 'error',    args: 'status:error' },
    // ---- small prop states across the tail
    { story: 'components-link--default',        name: 'sm',        args: 'size:sm' },
    { story: 'components-link--default',        name: 'lg',        args: 'size:lg' },
    { story: 'components-link--default',        name: 'visited',   args: 'visited:!true' },
    { story: 'components-tag--read-only',       name: 'disabled',  args: 'disabled:!true' },
    { story: 'components-tag--read-only',       name: 'lg',        args: 'size:lg' },
    { story: 'components-structuredlist--default', name: 'condensed', args: 'isCondensed:!true' },
    { story: 'components-containedlist--default',  name: 'inset',     args: 'isInset:!true' },
    { story: 'components-contentswitcher--default', name: 'sm',    args: 'size:sm' },
    { story: 'components-contentswitcher--default', name: 'lg',    args: 'size:lg' },
    { story: 'components-modal--default',       name: 'xs',        args: 'size:xs' },
    { story: 'components-modal--default',       name: 'sm',        args: 'size:sm' },
    { story: 'components-modal--default',       name: 'lg',        args: 'size:lg' },
    { story: 'components-treeview--default',    name: 'xs',        args: 'size:xs' },
    // `cds--btn--selected` renders only on GHOST icon buttons, so isSelected
    // alone changes nothing — the kind must come with it.
    { story: 'components-iconbutton--default',  name: 'selected',  args: 'kind:ghost;isSelected:!true' },
    { story: 'components-accordion--default',   name: 'disabled',  args: 'disabled:!true' },
    { story: 'components-aspectratio--default', name: '2x1',       args: 'ratio:2x1' },
    { story: 'components-aspectratio--default', name: '4x3',       args: 'ratio:4x3' },
    { story: 'components-aspectratio--default', name: '9x16',      args: 'ratio:9x16' },
    // Tried and unreachable, recorded so they are not re-proposed (2026-08-27):
    // button--default `size:xs` and layout-stack--default `gap:3`/`gap:5` all
    // left the tree byte-identical — Storybook applies a URL arg only when the
    // story declares a matching control, and Button's size control has no xs
    // while the Stack story declares no gap control at all. `btn--xs` and the
    // `stack-scale-*` classes stay reference-less until Carbon's own stories
    // expose them.
    { story: 'components-datatable-basic--default', name: 'xs',    args: 'size:xs' },
    { story: 'components-datatable-basic--default', name: 'md',    args: 'size:md' },
    // ---- code snippet and copy feedback (transient; captured inside its 2s window)
    { story: 'components-copybutton--default',      name: 'copied',   steps: [{ click: '.cds--copy-btn' }] },
    { story: 'components-codesnippet--singleline',  name: 'copied',   steps: [{ click: 'button' }] },
    { story: 'components-codesnippet--singleline',  name: 'disabled', args: 'disabled:!true' },
    { story: 'components-codesnippet--multiline',   name: 'disabled', args: 'disabled:!true' },
    // ---- file uploader item states
    { story: 'components-fileuploader--file-uploader-item', name: 'invalid',  args: 'invalid:!true' },
    { story: 'components-fileuploader--file-uploader-item', name: 'complete', args: 'status:complete' },
    { story: 'components-fileuploader--file-uploader-item', name: 'sm',       args: 'size:sm' },
    { story: 'components-fileuploader--default',            name: 'disabled', args: 'disabled:!true' },
    // ---- definition tooltip opens on focus; header action goes active on press
    // Definition tooltip opens on hover/focus, not click; and each header
    // action is wrapped in a popover-container span, so the panel-wired second
    // action is reached through :nth-child on the wrapper, not the button.
    { story: 'components-definitiontooltip--default', name: 'open', steps: [{ hover: '.cds--definition-term' }] },
    { story: 'components-ui-shell-header--header-w-actions-and-right-panel', name: 'action-active',
      steps: [{ click: '.cds--header__global > span:nth-child(2) button' }] },
    // ---- @carbon/ibm-products origin (ibm-products.carbondesignsystem.com).
    // (no-story) when run against the react origin. The panel mounts ~6s after
    // the story chrome, hence waitFor. Panel size also sizes the action-set,
    // which is how action-set--sm/lg/xl/2xl get their references. The story's
    // `actions` control is a numeric mapping (options 0-9) and a URL arg never
    // applies it — probed 2026-08-27, every value left one button — so
    // action-set--row-double, --row-triple and __action-button--ghost stay
    // reference-less unless a story renders them.
    { story: 'components-sidepanel--slide-over', name: 'xs',        args: 'size:xs',        waitFor: '.c4p--side-panel' },
    { story: 'components-sidepanel--slide-over', name: 'sm',        args: 'size:sm',        waitFor: '.c4p--side-panel' },
    { story: 'components-sidepanel--slide-over', name: 'lg',        args: 'size:lg',        waitFor: '.c4p--side-panel' },
    { story: 'components-sidepanel--slide-over', name: 'xl',        args: 'size:xl',        waitFor: '.c4p--side-panel' },
    { story: 'components-sidepanel--slide-over', name: '2xl',       args: 'size:2xl',       waitFor: '.c4p--side-panel' },
    { story: 'components-sidepanel--slide-over', name: 'left',      args: 'placement:left', waitFor: '.c4p--side-panel' },
    { story: 'components-sidepanel--slide-over', name: 'condensed', args: 'condensedActions:!true', waitFor: '.c4p--side-panel' },
    // The create pattern opens on its launch button and its two-button
    // action-set stacks — the only place --row-double has been seen emitted.
    { story: 'patterns-create-flows-createsidepanel--create-side-panel', name: 'open',
      steps: [{ click: 'button' }], waitFor: '.c4p--side-panel' },
  ];

  // SETTLE was a flat 500ms wait after load, and 500ms is genuinely enough —
  // measured, three concurrent iframes on a quiet page all paint inside it.
  // What it is not enough for is a page 150 stories deep with an 800MB heap,
  // where load fires well before React commits: 25 of 200 came back empty on a
  // real run, and 19 of those rendered fine on a second, unhurried attempt.
  //
  // A bigger constant would have fixed those 19 and slowed the other 175 for
  // nothing. Polling costs the fast stories one extra frame and waits on the
  // slow ones only as long as they actually need.
  const POLL_MS = 100;                   // how often to look for a painted root
  const SETTLE_MIN_MS = 300;             // never sample before this; React commits in pieces
  const SETTLE_MAX_MS = 6000;            // stop believing it will ever paint
                                         // (SETTLE_MIN_MS floors this: a maxMs
                                         // below it cannot give up any sooner)
  const LOAD_TIMEOUT_MS = 20000;         // iframe never fired load at all
  const STEP_SETTLE_MS = 400;            // after each recipe step; menus animate ~110ms

  // Storybook 7/8 serve index.json; 6 served stories.json. Try both.
  const index = await (async () => {
    for (const p of ['/index.json', '/stories.json']) {
      try {
        const r = await fetch(p);
        if (r.ok) return await r.json();
      } catch {}
    }
    throw new Error('no index.json or stories.json — is this a Storybook origin?');
  })();

  const every = Object.values(index.entries ?? index.stories ?? {})
    .filter(e => (e.type ?? 'story') === 'story');
  const stories = every.filter(e => FILTER.test(e.id));
  if (MODE !== 'states') {
    console.log(`harvesting ${stories.length} stories…`);
    // Say what FILTER left out. A narrowed run is a deliberate act, but a run that
    // quietly covered two thirds of the catalogue reads exactly like a full one.
    if (stories.length < every.length) {
      const skipped = every.length - stories.length;
      const prefixes = [...new Set(every.filter(e => !FILTER.test(e.id)).map(e => e.id.split('-')[0]))];
      console.warn(`FILTER skipped ${skipped} of ${every.length} — prefixes: ${prefixes.join(' ')}`);
    }
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const storyUrl = (id, args) =>
    `/iframe.html?id=${encodeURIComponent(id)}&viewMode=story` + (args ? `&args=${args}` : '');

  // Both Carbon prefixes. The ibm-products origin emits c4p--; the first
  // side-panel quarry (32c7fb6) said "the extractor needed no change", but its
  // output carries c4p-- classes a cds-- filter would have dropped — the run
  // must have adjusted this un-recorded. Now it is the tool's behaviour.
  const PREFIX = /^(?:cds|c4p)--/;
  const PREFIX_ANY = '[class*="cds--"], [class*="c4p--"]';

  // Compact, diffable line per element: tag.class.class[role=…]. Text is dropped
  // on purpose — structure and class placement are what we are checking, and text
  // would make every diff noisy.
  const tree = (el, depth = 0, out = []) => {
    if (!el || el.nodeType !== 1) return out;
    const cls = [...el.classList].filter(c => PREFIX.test(c)).join('.');
    const role = el.getAttribute('role');
    const aria = ['aria-expanded', 'aria-selected', 'aria-invalid', 'aria-disabled']
      .filter(a => el.hasAttribute(a)).map(a => `${a}=${el.getAttribute(a)}`).join(',');
    out.push('  '.repeat(depth) + el.tagName.toLowerCase()
      + (cls ? '.' + cls : '') + (role ? `[role=${role}]` : '') + (aria ? `{${aria}}` : ''));
    for (const k of el.children) tree(k, depth + 1, out);
    return out;
  };

  // Root tree plus body-level floats — see the header for why floats matter.
  const capture = doc => {
    const root = doc.querySelector('#storybook-root, #root');
    const lines = tree(root);
    for (const el of doc.body.children) {
      if (el === root || el.contains(root)) continue;
      if (![...el.classList].some(c => PREFIX.test(c))
          && !el.querySelector(PREFIX_ANY)) continue;
      tree(el, 0, lines);
    }
    return lines;
  };

  // Storybook renders its own "Couldn't find story matching '<id>'" page when an
  // id is gone. That is a permanent fact about the catalogue, not a slow paint,
  // and the two used to be indistinguishable — both landed as (empty), so a
  // retry pass would chase dead ids forever and a reader could not tell a stale
  // reference from a harvest that gave up too early. Six of carbon-website's own
  // curated ids are in this state.
  const missing = doc => {
    try { return /Couldn.t find story matching/i.test(doc.body.innerText); }
    catch { return false; }
  };

  const grab = (story, { maxMs = SETTLE_MAX_MS } = {}) => new Promise(resolve => {
    const id = typeof story === 'string' ? story : story.id;
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;left:-10000px;top:0;width:1280px;height:900px;border:0';
    f.src = `/iframe.html?id=${encodeURIComponent(id)}&viewMode=story`;
    let done = false, poll = 0, loadTimer = 0;
    const finish = value => {
      if (done) return;
      done = true;
      clearInterval(poll); clearTimeout(loadTimer);
      f.remove();
      resolve([id, value]);
    };
    f.onload = () => {
      const t0 = performance.now();
      poll = setInterval(() => {
        try {
          const doc = f.contentDocument;
          if (missing(doc)) return finish(['(missing)']);
          const elapsed = performance.now() - t0;
          if (elapsed < SETTLE_MIN_MS) return;
          const lines = capture(doc);
          if (lines.length > 1) return finish(lines);
          // Nothing yet. Keep looking until maxMs, then record the gap rather
          // than dropping it — a silent gap reads as "checked and fine".
          if (elapsed >= maxMs) finish(['(empty)']);
        } catch (e) { finish([`(unreadable: ${e.message})`]); }
      }, POLL_MS);
    };
    loadTimer = setTimeout(() => finish(['(timeout)']), LOAD_TIMEOUT_MS);
    document.body.appendChild(f);
  });

  if (MODE === 'states') {
    const catalogue = new Set(every.map(e => e.id));
    const recipes = RECIPES.filter(r => RECIPE_FILTER.test(`${r.story}@${r.name}`));
    console.log(`running ${recipes.length} state recipes…`);
    if (recipes.length < RECIPES.length)
      console.warn(`RECIPE_FILTER skipped ${RECIPES.length - recipes.length} of ${RECIPES.length}`);

    const openFrame = url => new Promise(resolve => {
      const f = document.createElement('iframe');
      f.style.cssText = 'position:fixed;left:-10000px;top:0;width:1280px;height:900px;border:0';
      const t = setTimeout(() => resolve({ f, verdict: '(timeout)' }), LOAD_TIMEOUT_MS);
      f.onload = () => { clearTimeout(t); resolve({ f }); };
      f.src = url;
      document.body.appendChild(f);
    });
    // Poll until the root paints; returns tree lines, or a verdict string.
    const settle = async f => {
      const t0 = performance.now();
      while (true) {
        await sleep(POLL_MS);
        try {
          const doc = f.contentDocument;
          if (missing(doc)) return '(missing)';
          const elapsed = performance.now() - t0;
          if (elapsed < SETTLE_MIN_MS) continue;
          const lines = capture(doc);
          if (lines.length > 1) return lines;
          if (elapsed >= SETTLE_MAX_MS) return '(empty)';
        } catch (e) { return `(unreadable: ${e.message})`; }
      }
    };
    // waitFor: settle() returns on the FIRST painted tree, and some stories
    // paint their chrome long before the element under test — ibm-products'
    // side panel takes ~6s to mount after its launch chrome appears. A recipe
    // may name the selector it is actually about; capture waits for it, and
    // the bare comparison capture waits the same way so the diff is honest.
    const awaitFor = async (doc, sel) => {
      const t0 = performance.now();
      while (!doc.querySelector(sel)) {
        if (performance.now() - t0 >= SETTLE_MAX_MS * 2) return false;
        await sleep(POLL_MS);
      }
      return true;
    };
    const grabBare = async (id, waitFor) => {
      const { f, verdict } = await openFrame(storyUrl(id));
      let lines = verdict ?? await settle(f);
      if (Array.isArray(lines) && waitFor) {
        try {
          lines = (await awaitFor(f.contentDocument, waitFor))
            ? capture(f.contentDocument) : `(step-miss: waitFor ${waitFor})`;
        } catch (e) { lines = `(unreadable: ${e.message})`; }
      }
      f.remove();
      return lines;
    };
    const classesOf = lines => new Set(
      (Array.isArray(lines) ? lines : []).flatMap(l => l.match(/(?:cds|c4p)--[\w-]+/g) ?? []));

    // Sequential on purpose: bare captures are cached per story, and three
    // recipes of one story racing would each make their own.
    const bare = {};
    const out = {};
    for (const r of recipes) {
      const key = `${r.story}@${r.name}`;
      if (!catalogue.has(r.story)) {
        out[key] = ['(no-story)'];
        console.warn(`  !!  ${key}  (no-story)`);
        continue;
      }
      bare[r.story] ??= await grabBare(r.story, r.steps?.length ? null : r.waitFor);
      const { f, verdict } = await openFrame(storyUrl(r.story, r.args));
      let lines = verdict ?? await settle(f);
      if (Array.isArray(lines)) {
        try {
          const doc = f.contentDocument;
          // Steps resolve inside the story root: the document also holds
          // Storybook's own chrome (.sb-wrapper divs with buttons), and a loose
          // selector like 'button' matches that chrome first. Portals still
          // reach the capture — they only matter for reading, not clicking.
          const scope = doc.querySelector('#storybook-root, #root') ?? doc;
          for (const step of Array.isArray(lines) ? r.steps ?? [] : []) {
            const [kind, sel] = Object.entries(step)[0];
            const el = scope.querySelector(sel);
            if (!el) { lines = `(step-miss: ${sel})`; break; }
            if (kind === 'click')
              el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            else if (kind === 'hover')
              for (const t of ['pointerover', 'mouseover', 'mouseenter'])
                el.dispatchEvent(new MouseEvent(t, { bubbles: t !== 'mouseenter' }));
            else if (kind === 'focus') el.focus();
            await sleep(r.settle ?? STEP_SETTLE_MS);
          }
          if (Array.isArray(lines) && r.waitFor && !(await awaitFor(doc, r.waitFor)))
            lines = `(step-miss: waitFor ${r.waitFor})`;
          if (Array.isArray(lines) && (r.steps?.length || r.waitFor)) lines = capture(doc);
        } catch (e) { lines = `(unreadable: ${e.message})`; }
      }
      f.remove();
      if (Array.isArray(lines) && Array.isArray(bare[r.story])
          && lines.join('\n') === bare[r.story].join('\n')) lines = '(unchanged)';
      out[key] = Array.isArray(lines) ? lines : [lines];
      if (Array.isArray(lines)) {
        const base = classesOf(bare[r.story]);
        const added = [...classesOf(lines)].filter(c => !base.has(c));
        console.log(`  ok  ${key}  +${added.length}${added.length ? ': ' + added.join(' ') : ''}`);
      } else console.warn(`  !!  ${key}  ${lines}`);
    }

    const failed = Object.entries(out).filter(([, v]) => v[0].startsWith('('));
    console.log(`done — ${Object.keys(out).length} recipes, ${Object.keys(out).length - failed.length} usable`);
    for (const [k, v] of failed) console.log(`  ${k}  ${v[0]}`);
    const blob = new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'carbon-react-states.json';
    a.click();
    return out;
  }

  const out = {};
  for (let i = 0; i < stories.length; i += CONCURRENCY) {
    const batch = stories.slice(i, i + CONCURRENCY);
    for (const [id, lines] of await Promise.all(batch.map(s => grab(s)))) out[id] = lines;
    console.log(`  ${Math.min(i + CONCURRENCY, stories.length)}/${stories.length}`);
  }

  // Retry pass. Only (empty) and (timeout) are worth repeating — (missing) is a
  // dead id and (unreadable) is a cross-origin problem that a second look will
  // not solve. Sequential and patient on purpose: contention is what caused
  // these, so retrying them three-up would just reproduce it.
  const retryable = Object.entries(out)
    .filter(([, v]) => v[0] === '(empty)' || v[0] === '(timeout)')
    .map(([id]) => id);
  if (retryable.length) {
    console.log(`retrying ${retryable.length} one at a time…`);
    let recovered = 0;
    for (const id of retryable) {
      const [, lines] = await grab(id, { maxMs: SETTLE_MAX_MS * 2 });
      if (!lines[0].startsWith('(')) { out[id] = lines; recovered++; }
      else out[id] = lines;   // keep the retry's verdict; it may have resolved to (missing)
    }
    console.log(`  recovered ${recovered}/${retryable.length}`);
  }

  const bad = Object.entries(out).filter(([, v]) => v[0]?.startsWith('('));
  const by = k => bad.filter(([, v]) => v[0] === k).map(([id]) => id);
  console.log(`done — ${Object.keys(out).length} stories, ${Object.keys(out).length - bad.length} usable`);
  for (const kind of ['(missing)', '(empty)', '(timeout)']) {
    const ids = by(kind);
    if (ids.length) console.log(`${kind} ${ids.length}: ${ids.join(' ')}`);
  }
  const odd = bad.filter(([, v]) => v[0].startsWith('(unreadable'));
  if (odd.length) console.log(`(unreadable) ${odd.length}: ${odd.map(([id]) => id).join(' ')}`);

  const blob = new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'carbon-react-dom.json';
  a.click();
  return out;
})();
