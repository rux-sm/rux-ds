---
name: sink-check
description: Run rux-ds browser-only gates against the kitchen sink, portal, and templates, including check-a11y.js, check-rendered.js, check-runtime-classes.js, check-spacing.js, and check-behaviour.js. Use when asked to run browser checks, sweep pages after a batch, verify the sink or templates in a browser, measure focus rings or contrast, or update gate-coverage readings. Encodes seven conditions and the repeatable per-page loop that prevent confident wrong answers.
---

# Running the browser-only gates

`tools/check-a11y.js`, `tools/check-rendered.js` and `tools/check-runtime-classes.js`
are not Node tools and never will be (README, "Gates"). They need a layout, an
accessibility tree, and a page that has actually run. This is how to run them without
getting a confident wrong number.

## Start the page

Use the Browser pane, never Bash — `npm run serve` under Bash is not the supported path.

    preview_start { name: "rux-ds" }        # .claude/launch.json, port 8642

Load each tool from the server instead of pasting it, so the file on disk is what runs:

    (function(){ const r = new XMLHttpRequest();
      r.open('GET', '/tools/check-a11y.js?v=' + performance.now(), false); r.send();
      return JSON.stringify(eval(r.responseText)); })()

The cache-buster matters after you edit a tool. Both tools RETURN their result object, so
read the return value rather than the console. `check-a11y` returns
`{findings, notes, byRule, focusRingChecked}`; `check-rendered` returns its own summary.

## Seven conditions, each of which has produced a wrong answer here

**1. The document must have focus — GET IT WITH Tab, THEN BLUR. Not with a click.**
`check-a11y` reports `focusRingChecked: false` and skips its focus-ring check entirely
when `document.hasFocus()` is false, and a bare `javascript_tool` call often leaves it
false. Verify `focusRingChecked: true` in the result before believing a 0.

    computer { action: "key", text: "Tab" }        // gives the document focus
    document.activeElement && document.activeElement.blur()

**BOTH HALVES ARE PAID FOR, 2026-09-01, and each hid a different answer.** This
instruction used to say "click the page first", which is where the first half comes from.

*A CLICK DISMISSES WHAT YOU CAME TO MEASURE.* The kernel treats a press on the page as an
OUTSIDE PRESS. Measured on the sink: `.rux--date-picker__calendar.open` is present before
a click on an empty spot and **gone from the DOM after it**. Every sweep that clicked to
get focus therefore checked a page with no calendar on it — `check-a11y` read 9 on
2026-08-31 and 11 earlier on 2026-09-01 where the honest figure is 12. Condition 5 below
already says a click perturbs `check-runtime-classes`; it perturbs THIS gate too, by
deleting surfaces before they can be checked, and that was written down nowhere.

*A BARE Tab LEAVES THE FIRST CONTROL FOCUSED,* and the check then compares a focused
control against itself and reports "no visible focus change" on it. That is where four
templates each grew a phantom finding on `rux--skip-to-content`, the first tab stop on
every page carrying the shell. Blurring afterwards keeps `document.hasFocus()` true with
nothing focused, and all four go back to 0.

Neither failure looks like a measurement error in the output. One reads as a clean page;
the other reads as a real accessibility defect.

**2. Park the pointer off content.** The pane's pointer keeps whatever it is resting on in
`:hover`, and a hover background silently becomes the background you measure a ring
against. `computer { action: "hover", coordinate: [60, 500] }` puts it on the sidebar.

**3. Assert the theme, never assume it.** Read it back from a RESOLVED token, not from
`dataset.theme`, which can be set while the value you care about is still the other
theme's:

    document.documentElement.dataset.theme = 'white';
    // probe: --rux-field-hover is rgb(232,232,232) in white, rgb(51,51,51) in g100

A contrast finding was once recorded against g100's tokens while the page was labelled
white.

**4. SUPPRESS TRANSITIONS BEFORE READING ANY STATE YOU JUST CHANGED**, not only for focus
rings. Carbon transitions width and opacity over 300ms and this pane's animation clock does
not advance on its own, so a value read straight after a click is mid-flight and usually a
lie. On 2026-08-28 it produced two false alarms in one sitting: a side nav measured 256px
wide while `--expanded` was absent (it was 0 once settled), and a scrim measured full-size
at `opacity: 0`, which reads exactly like an invisible overlay eating every press. Both
dissolved under

    document.head.appendChild(Object.assign(document.createElement('style'),
      {textContent:'*{transition:none!important;animation:none!important}'}))

Do this before the interaction, then read. The nav round trip then reads correctly at every
step: closed 0, open 256 with a 900px scrim at opacity 1, closed 0 again.

**5. `check-runtime-classes` wants a page nobody has touched.** It compares the file against
the live DOM, so any state a module changed under your pointer is counted as a difference
the markup caused. That puts it in direct tension with condition 1 — the click check-a11y
needs for `document.hasFocus()` is exactly the kind of press the overlay kernel acts on.
Run `check-runtime-classes` FIRST on a freshly loaded page, or reload before it. A
`stripped` count read after a session of clicking is not the page's, and one such reading
(`side-nav--expanded`, 2026-08-28) survived long enough to be written up as a defect before
a clean re-run showed 0 at every width.

**6. A green run proves nothing until you have seen it go red.** Delete the thing you are
checking and confirm the check fails, then restore. For focus rings:

    .rux--checkbox:focus + .rux--checkbox-label::before { outline: none !important; }

should produce 12 findings; radio 10, tile 2, text input 3, and stripping every outline
and box-shadow on the page 122. If deleting a ring changes nothing, the check is
measuring the wrong element — which is exactly the defect fixed on 2026-08-28.

**7. THE PANE DELIVERS KEYS BUT DOES NOT ACTIVATE.** Enter and Space on a focused
`<button>` arrive as `keydown` and `keyup` with `isTrusted: true` and produce NO
`click` — the browser's default action never runs. So a menu, modal or anything else
a button opens CANNOT be opened from the keyboard here. Open it with `.click()` and
press keys after that.

Only handlers bound to `keydown` itself are reachable by real keys: arrows, Home/End,
Escape. Those all work, and were swept on 2026-08-30 — tablist arrows rove and select
and skip the disabled tab, a vertical list declines the horizontal arrows, radio
arrows move and check, menu arrows rove and Escape restores focus to the trigger.

**Prove which of the two you are looking at before filing anything**, because "the
button does nothing" reads identically to a real defect. Attach listeners and press
the key:

    const ev=[]; b.addEventListener('keydown',e=>ev.push('keydown:'+e.key+' trusted='+e.isTrusted));
    b.addEventListener('click',e=>ev.push('click')); b.focus();
    // press Enter, then read ev: keydown arrives, click does not

Then call `b.click()` and watch the surface open. On 2026-08-30 that pair was the
whole difference between a harness limit and a bug — and it was checked against the
source too: `js/overlay.js:224` preventDefaults on Escape alone, and nothing in `js/`
touches Enter or Space. This is why `check-behaviour` drives clicks rather than keys.

## Sweep every page after a batch

Let `npm run gates` name the required cells. Sweep the assembled sink, `portal.html`,
and every template it lists; do not maintain a second target list here.

For `portal.html` and each template, use this loop in order:

1. Navigate to the page afresh. Run `check-runtime-classes` before focusing, clicking,
   hovering, or changing state.
2. Give the document focus with Tab, blur the focused control, suppress transitions and
   animations, set the white theme, and read back `document.hasFocus()`, a resolved
   theme token, the viewport width, and IBM Plex availability. Stop if any condition is
   not the one being recorded. Plex is `font-display: optional` since 2026-09-02, so a
   cold-cache load can stay in the fallback and never swap: if
   `document.fonts.check('16px "IBM Plex Sans"')` reads false, reload and start the
   loop again from step 1 rather than recording.
3. Park the pointer off content and look at the rendered page. A missing or failed
   screenshot is not a visual pass; retry the page.
4. Run `check-a11y` and require `focusRingChecked: true`, then run `check-spacing`.
   Record the actual findings, notes, known set, and unknown set rather than only a
   count.

Use the same order on `kitchen-sink.html`, then also run `check-rendered` and
`check-behaviour`. The sink is their unit; templates are not. Keep the calendar present
through the a11y reading and compare every new finding or spacing unknown with the
adjudicated evidence before changing code.

### Use two tabs, not one long serial pass

After proving the loop on the sink, portal, and first template, open one second tab and
sweep the remaining templates two at a time. Keep one page per tab and pass explicit tab
ids to every action. Parallelise across tabs only: within each tab,
`check-runtime-classes` must still run before the focus/setup/check sequence above.
Reload a tab before retrying a page whose screenshot or setup failed; do not reuse its
perturbed DOM.

Do not write `docs/gate-coverage.json` piecemeal. First finish every page and reconcile
the results. Then record every cell at the code or fix commit actually measured,
preserve the prior reading beneath it, run `npm run verify`, and require `npm run gates`
to report every cell current before committing the ledger.

## Measuring rings yourself

Carbon draws the ring on the label BESIDE a hidden input, not on the input. Read the
control, its label, that label's descendants, and `::before`/`::after` on each.

Three outlines paint nothing and must not count as a change: `outline-style: auto` (the
browser's own ring — this stylesheet writes `solid` for all its outlines and `auto` for
none), `outline-style: none` at any width, and a transparent outline. A transparent
BORDER is the opposite case and must keep counting: the UI shell rests a real border at
`transparent` and colours it on focus.

Carbon's button focus is one two-tone ring — blue outer 1px, white inner 1px, then the
fill — so score each EDGE against its own neighbour. Scoring a layer against the surface
beneath it reports a blue ring on a blue button as 1:1; that mistake once produced 27
findings, all of them nothing.

## check-runtime-classes

Run it on any page, including a template — it fetches whatever `location.pathname` is
and parses that with DOMParser, which runs no scripts, so you get the document as
authored beside the one the modules finished with.

STRIPPED is the direction that matters: a class in the file and not in the page is one
`check-coverage` counts while nobody can see it. ADDED is harmless — the page shows a
class the file never had, so the ratchet understates.

Expected today, measured 2026-08-28 — **nothing is stripped anywhere**, which is the
reading that matters for `templates/`, since a worked example that ships a class the
modules delete teaches the wrong markup:

| page | stripped | added |
|---|---|---|
| `kitchen-sink.html` | 0 | 3 — `data-table--selected`, `table-sort--active`, `side-nav__overlay-active` |
| `templates/app-shell.html` | 0 | 0 |
| `templates/table-page.html` | 0 | 1 — `table-sort--active`, the same module marking the active sort button |
| `templates/form-page.html` | 0 | 0 |

Those are three distinct classes, not four: `check-coverage` reads `templates/` as well as
the sink, so `table-sort--active` goes uncounted in both places for one reason.

**Re-measured on a freshly loaded page at 800px AND 1440px on 2026-08-28: unchanged.** The
figures are not viewport-dependent, which was worth establishing because a `stripped: 1`
reading of `side-nav--expanded` at 1440px sent someone looking for a breakpoint bug that
does not exist. It was interaction state — see condition 5 — and it did not survive a clean
run. The shell itself was checked in both directions across 65.98rem while that was chased:
nav 0 ↔ 256, hamburger hidden above and shown below, and the burger closes what it opens.
Crossing UP with the nav open does leave `--expanded` and `side-nav__overlay-active` set,
and both are inert there — Carbon sizes the scrim only inside `@media (max-width: 65.98rem)`,
so it measures 0×0 with presses passing through. Stale to read, harmless to the page.

Its red run: remove any class from the live DOM by hand and it reports that class as
stripped, with the section and element it came from.

## What this can never tell you

Announcement. Both tools read attributes and computed styles; neither runs an AT. Roadmap
§4.5 stays open until a human drives VoiceOver or NVDA over the sink in a focused window.
Contrast arithmetic is not legibility either, and forced-colors mode is unmeasured — there
`--rux-focus` becomes the system `Highlight` keyword and every measured number stops
applying.
