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
// Output: downloads carbon-react-dom.json. Move it to docs/ and it becomes the
// reference every fragment is diffed against.
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
(async () => {
  const FILTER = /^components-/;         // narrow this to re-harvest one component
  const CONCURRENCY = 3;                 // iframes at a time; 3 is polite and quick

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

  const stories = Object.values(index.entries ?? index.stories ?? {})
    .filter(e => (e.type ?? 'story') === 'story' && FILTER.test(e.id));
  console.log(`harvesting ${stories.length} stories…`);

  // Compact, diffable line per element: tag.class.class[role=…]. Text is dropped
  // on purpose — structure and class placement are what we are checking, and text
  // would make every diff noisy.
  const tree = (el, depth = 0, out = []) => {
    if (!el || el.nodeType !== 1) return out;
    const cls = [...el.classList].filter(c => c.startsWith('cds--')).join('.');
    const role = el.getAttribute('role');
    const aria = ['aria-expanded', 'aria-selected', 'aria-invalid', 'aria-disabled']
      .filter(a => el.hasAttribute(a)).map(a => `${a}=${el.getAttribute(a)}`).join(',');
    out.push('  '.repeat(depth) + el.tagName.toLowerCase()
      + (cls ? '.' + cls : '') + (role ? `[role=${role}]` : '') + (aria ? `{${aria}}` : ''));
    for (const k of el.children) tree(k, depth + 1, out);
    return out;
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
          const lines = tree(doc.querySelector('#storybook-root, #root'));
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
