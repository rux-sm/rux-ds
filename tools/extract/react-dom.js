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
(async () => {
  const FILTER = /^components-/;         // narrow this to re-harvest one component
  const CONCURRENCY = 3;                 // iframes at a time; 3 is polite and quick
  const SETTLE_MS = 500;                 // let React paint after load

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

  const grab = story => new Promise(resolve => {
    const f = document.createElement('iframe');
    f.style.cssText = 'position:fixed;left:-10000px;top:0;width:1280px;height:900px;border:0';
    f.src = `/iframe.html?id=${encodeURIComponent(story.id)}&viewMode=story`;
    let done = false;
    const finish = value => {
      if (done) return;
      done = true;
      f.remove();
      resolve([story.id, value]);
    };
    f.onload = () => setTimeout(() => {
      try {
        const doc = f.contentDocument;
        const root = doc.querySelector('#storybook-root, #root');
        const lines = tree(root);
        // Stories that render nothing useful are recorded as such rather than
        // dropped — a silent gap reads as "checked and fine".
        finish(lines.length > 1 ? lines : ['(empty)']);
      } catch (e) { finish([`(unreadable: ${e.message})`]); }
    }, SETTLE_MS);
    setTimeout(() => finish(['(timeout)']), 15000);
    document.body.appendChild(f);
  });

  const out = {};
  for (let i = 0; i < stories.length; i += CONCURRENCY) {
    const batch = stories.slice(i, i + CONCURRENCY);
    for (const [id, lines] of await Promise.all(batch.map(grab))) out[id] = lines;
    console.log(`  ${Math.min(i + CONCURRENCY, stories.length)}/${stories.length}`);
  }

  const empty = Object.entries(out).filter(([, v]) => v[0]?.startsWith('('));
  console.log(`done — ${Object.keys(out).length} stories, ${empty.length} unusable`);
  if (empty.length) console.log('unusable:', empty.map(([k]) => k).join(' '));

  const blob = new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'carbon-react-dom.json';
  a.click();
  return out;
})();
