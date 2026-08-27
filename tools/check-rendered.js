//
// RENDER CHECK — paste into the kitchen sink's devtools console, or run via a
// headless browser later. Deliberately NOT a Node tool: automating it needs a
// browser dependency, and this project has none (roadmap §1).
//
// It catches what the other three gates cannot. `npm run verify` proves classes
// resolve and components are exercised; none of that proves anything RENDERS.
// Three failure modes, all seen for real in Phase 1:
//
//   uaStyled   a Carbon modifier applied without its base class, so the browser's
//              default form-control chrome shows through. Found the UI-shell menu
//              toggle and the time-picker field this way (roadmap §4.1.5).
//   collapsed  a section whose tallest element is under 8px — the layout-module
//              bug (§4.1.2), which compiled clean and passed every name check.
//   escaped    an element rendering far left of the content column, i.e. an
//              absolutely-positioned child with no positioned ancestor.
//
// Known and accepted: truncated-text's expand toggle is a genuine upstream gap.
//
(() => {
  const SEC = '.ks-sec', MAIN = '.ks-main';
  const uaBg = ['rgb(239, 239, 239)', 'rgb(107, 107, 107)', 'buttonface'];

  const uaStyled = [];
  for (const el of document.querySelectorAll(`${MAIN} button, ${MAIN} input, ${MAIN} select, ${MAIN} textarea`)) {
    if (el.closest('[hidden]')) continue;
    const b = el.getBoundingClientRect();
    if (b.width <= 2 && b.height <= 2) continue;        // visually-hidden focus proxies
    const cs = getComputedStyle(el);
    if (/inset|outset/.test(cs.borderTopStyle + cs.borderBottomStyle) || uaBg.includes(cs.backgroundColor)) {
      const s = el.closest(SEC);
      uaStyled.push(`${s ? s.id : '?'} :: ${(el.className || '(none)').slice(0, 46)}`);
    }
  }

  const sweep = theme => {
    document.documentElement.dataset.theme = theme;
    const main = document.querySelector(MAIN).getBoundingClientRect();
    const collapsed = [], escaped = [];
    for (const sec of document.querySelectorAll(SEC)) {
      let max = 0, n = 0;
      for (const el of sec.querySelectorAll('[class*="rux--"]')) {
        if (el.closest('[hidden]')) continue;
        n++;
        const r = el.getBoundingClientRect();
        if (r.height > max) max = r.height;
        let p = el, fixed = false;
        while (p && p !== document.body) { if (getComputedStyle(p).position === 'fixed') { fixed = true; break; } p = p.parentElement; }
        if (!fixed && r.width && r.height && r.left < main.left - 80
            && !el.classList.contains('rux--checkbox') && !el.classList.contains('rux--radio-button'))
          escaped.push(sec.id);
      }
      if (!n || max < 8) collapsed.push(sec.id);
    }
    return { collapsed, escaped: [...new Set(escaped)] };
  };

  const out = {
    viewport: `${innerWidth}x${innerHeight}`,
    sections: document.querySelectorAll(SEC).length,
    emptySvgs: [...document.querySelectorAll(`${MAIN} svg`)].filter(s => !s.children.length).length,
    uaStyled,
    white: sweep('white'),
    g100: sweep('g100'),
  };
  document.documentElement.dataset.theme = 'white';
  console.log(out);
  return out;
})();
