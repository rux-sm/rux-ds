//
// WHAT WE COMPUTE vs WHAT CARBON COMPUTES — paste into a rendered page's console.
//
// The fourth browser tool, and the only one that compares this system against
// Carbon rather than against itself. check-classes asks whether a class resolves,
// check-tags whether it sits on the right element, check-ancestry whether its
// wrappers are there. None of them can see a gap that is missing, because the
// markup captures record structure and drop everything else on purpose.
//
// It reads `docs/carbon-react-spacing.json` — 800 class signatures harvested from
// react.carbondesignsystem.com — and for every classed element on this page asks
// whether our computed box properties match what Carbon computed for the same
// class set.
//
// THE TWO SIDES MUST BE MEASURED THE SAME WAY or the diff is noise. The property
// list and the defaults below are the same ones tools/extract/react-dom.js uses
// in its `spacing` mode; changing one without the other makes every signature
// diverge. gridTemplateColumns is absent from both because it returns the
// container's rendered width, and `min-block-size: 0px` is treated as a default
// because it is Carbon's reset rather than a fact about a component.
//
// THREE VERDICTS, and only the first is a defect.
//
//   DIVERGES      the signature is in the reference and our values match NONE of
//                 its recorded variants. The per-property difference is printed,
//                 because "row-gap 0px where Carbon has 32px" is actionable and
//                 "spacing differs" is not.
//
//   NO REFERENCE  we render a class set Carbon never renders. Not a fault: the
//                 table is keyed on exact class sets, so a combination no story
//                 produces simply is not in it. Worth reading — a set Carbon
//                 never emits may be one we invented — but it is not a failure.
//
//   MATCHES       our values equal one of the recorded variants. Counted only.
//
// A SIGNATURE WITH SEVERAL VARIANTS PASSES ON ANY ONE OF THEM. 136 of the 800
// compute more than one way, because a stack's display depends on what wraps it;
// requiring one blessed value would report Carbon disagreeing with itself.
//
// A DIVERGENCE IS A QUESTION, NOT A VERDICT, and there is no ignore list here on
// purpose — a gate with one measures the list. The first run on the kitchen sink
// reported 13, and the three that were chased down were all CONTEXT rather than
// defect:
//
//   css-grid margin 24px      the sink fragment's own inline margin-block-end.
//                             Demo layout, not the component.
//   header__name 8px vs 16px  Carbon's own rule —
//                             `.header__menu-toggle:not(.__hidden) ~ .header__name`
//                             sets 0.5rem. The sink shows the hamburger; the
//                             capture was taken where it is hidden.
//   modal-header__heading     a percentage resolving against three different
//                             modal widths. Carbon's 91.9141px is itself resolved.
//
// The lesson for the next reader: check what state each side was in before
// calling anything a defect. The tool's value is that the list is short and
// investigable, not that every row is wrong.
//
// WHAT IT CANNOT SEE. Whether the value is RIGHT — only whether it matches
// Carbon. A component we and Carbon both space wrongly passes. It also says
// nothing about a class set absent from both sides, and nothing about anything
// behind an interaction: this reads the page as it settled.
//
(() => {
  const REFERENCE = '/docs/carbon-react-spacing.json';
  const request = new XMLHttpRequest();
  request.open('GET', REFERENCE + '?v=' + Date.now(), false);
  request.send();
  if (request.status !== 200) {
    console.error(`  check-spacing — cannot read ${REFERENCE} (${request.status}).`
      + ' Run this from a page served by `npm run serve`.');
    return { error: request.status };
  }
  const reference = JSON.parse(request.responseText);

  // Identical to the extractor's, deliberately. See the header.
  const PROPS = ['display', 'gridAutoFlow', 'gridAutoColumns', 'rowGap', 'columnGap',
    'marginBlockStart', 'marginBlockEnd', 'marginInlineStart', 'marginInlineEnd',
    'paddingBlockStart', 'paddingBlockEnd', 'paddingInlineStart', 'paddingInlineEnd',
    'minBlockSize'];
  const DEFAULTS = { display: 'block', gridAutoFlow: 'row', gridAutoColumns: 'auto',
    rowGap: 'normal', columnGap: 'normal', marginBlockStart: '0px', marginBlockEnd: '0px',
    marginInlineStart: '0px', marginInlineEnd: '0px', paddingBlockStart: '0px',
    paddingBlockEnd: '0px', paddingInlineStart: '0px', paddingInlineEnd: '0px',
    minBlockSize: 'auto' };
  const ALSO_DEFAULT = { minBlockSize: '0px' };

  const valuesOf = el => {
    const c = getComputedStyle(el), out = {};
    for (const p of PROPS)
      if (c[p] && c[p] !== DEFAULTS[p] && c[p] !== ALSO_DEFAULT[p]) out[p] = c[p];
    return out;
  };
  // `rux--` is `cds--` renamed by $prefix and nothing else, which is the one rule
  // this whole project rests on. That is what makes the join legal.
  const toCarbon = sig => sig.replace(/\brux--/g, 'cds--');

  // THREE KINDS OF DIFFERENCE THAT ARE NOT DISAGREEMENTS, and the first run
  // reported all three as findings before this existed.
  //
  //   hidden      a box with `display: none` has no meaningful padding or gap.
  //               Carbon's capture caught several components in that state and
  //               ours renders them open, or the reverse. Comparing the two says
  //               nothing about spacing.
  //   percentage  getComputedStyle returns `25%` unresolved for a hidden element
  //               and `201px` for the same rule when it is laid out. Carbon's
  //               accordion content is recorded as 25%; ours resolves. The rule
  //               may be identical and the strings cannot match.
  //   sub-pixel   27.0469px against 27.0312px is font rounding, not a spec.
  //
  // They are counted and named, never silently dropped — a check that hides what
  // it could not answer reads as agreement it did not earn.
  const isPercent = v => typeof v === 'string' && v.endsWith('%');
  const px = v => (typeof v === 'string' && v.endsWith('px')) ? parseFloat(v) : null;
  const sameValue = (a, b) => {
    if (a === b) return true;
    const [x, y] = [px(a), px(b)];
    return x !== null && y !== null && Math.abs(x - y) < 1;
  };
  const diffOf = (ours, theirs) => {
    const keys = [...new Set([...Object.keys(ours), ...Object.keys(theirs)])].sort();
    return keys.filter(k => !sameValue(ours[k], theirs[k]))
      .filter(k => !isPercent(ours[k]) && !isPercent(theirs[k]))
      .map(k => `${k}: ours ${ours[k] ?? '—'} · Carbon ${theirs[k] ?? '—'}`);
  };

  const diverges = [], notComparable = [], noReference = new Map();
  let matched = 0, checked = 0;
  const seen = new Set();
  for (const el of document.querySelectorAll('[class*="rux--"]')) {
    const sig = [...el.classList].filter(c => c.startsWith('rux--')).join('.');
    if (!sig) continue;
    const ours = valuesOf(el);
    if (!Object.keys(ours).length) continue;
    const key = sig + '|' + JSON.stringify(ours);
    if (seen.has(key)) continue;            // one report per distinct rendering
    seen.add(key);
    const variants = reference[toCarbon(sig)];
    if (!variants) {
      noReference.set(sig, (noReference.get(sig) ?? 0) + 1);
      continue;
    }
    // Hidden on either side: skip, and say so.
    const hiddenHere = ours.display === 'none';
    if (hiddenHere || variants.every(v => v.values.display === 'none')) {
      notComparable.push({ class: sig, why: hiddenHere ? 'display:none here' : 'display:none in Carbon' });
      continue;
    }
    checked++;
    if (variants.some(v => diffOf(ours, v.values).length === 0)) { matched++; continue; }
    // Report against the CLOSEST variant — the one differing in fewest properties.
    const closest = variants
      .map(v => ({ v, diff: diffOf(ours, v.values) }))
      .sort((a, b) => a.diff.length - b.diff.length)[0];
    diverges.push({
      class: sig,
      where: el.closest('.ks-sec')?.id ?? '(page)',
      differs: closest.diff.join(' · '),
      variants: variants.length,
      seen: closest.v.seen[0] ?? '?',
    });
  }

  console.log(`\n  check-spacing — ${checked} signatures with a reference, `
    + `${matched} matching, ${diverges.length} diverging`);
  console.log(`  ${noReference.size} class sets Carbon does not render, `
    + `${notComparable.length} not comparable — neither is a fault, see the header\n`);
  if (diverges.length) console.table(diverges);
  console.log('\n  NOT CHECKED: whether the value is RIGHT, only whether it matches Carbon.'
    + '\n  Anything behind an interaction is out of reach — this reads the settled page.\n');
  return { checked, matched, diverges, notComparable, noReference: [...noReference.keys()].sort() };
})();
