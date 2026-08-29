---
name: sink-check
description: Run the kitchen sink's browser-only gates (check-a11y.js, check-rendered.js) and any focus or contrast measurement against the running page. Use when asked to run the browser checks, verify the sink in a browser, measure focus rings or contrast, or look at the sink after a change. Encodes four conditions that each silently produce a wrong answer if skipped.
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

## Four conditions, each of which has produced a wrong answer here

**1. The document must have focus.** `check-a11y` reports `focusRingChecked: false` and
skips its focus-ring check entirely when `document.hasFocus()` is false — and a bare
`javascript_tool` call often leaves it false. Click the page first, then run in the SAME
batch. Verify `focusRingChecked: true` in the result before believing a 0.

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

**4. A green run proves nothing until you have seen it go red.** Delete the thing you are
checking and confirm the check fails, then restore. For focus rings:

    .rux--checkbox:focus + .rux--checkbox-label::before { outline: none !important; }

should produce 12 findings; radio 10, tile 2, text input 3, and stripping every outline
and box-shadow on the page 122. If deleting a ring changes nothing, the check is
measuring the wrong element — which is exactly the defect fixed on 2026-08-28.

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

Its red run: remove any class from the live DOM by hand and it reports that class as
stripped, with the section and element it came from.

## What this can never tell you

Announcement. Both tools read attributes and computed styles; neither runs an AT. Roadmap
§4.5 stays open until a human drives VoiceOver or NVDA over the sink in a focused window.
Contrast arithmetic is not legibility either, and forced-colors mode is unmeasured — there
`--rux-focus` becomes the system `Highlight` keyword and every measured number stops
applying.
