# Screen-reader pass — the last thing blocking §4.5

`tools/check-a11y.js` reads attributes. This reads what a person hears. They are not
the same check and nothing automated substitutes: §4.5's exit is "keyboard and
screen-reader passes on every interactive component", the keyboard half ran on
2026-08-28, and this is the other half.

**The keyboard half has since grown, so four things are settled and finding one again
is not a finding.** Tab ORDER was swept end to end on 2026-08-30 — forward and reverse,
all seven pages, 0 divergence from DOM order. Arrow keys inside composites were swept
the same day: tablist arrows rove, select and skip the disabled tab, a vertical list
declines the horizontal arrows, radio arrows move and check, menu arrows rove and
Escape restores focus to the trigger. Focus rings were measured on 164 controls in both
themes on 2026-08-28. `check-a11y` reports 0 findings on seven of the eight pages.

Budget 45-60 minutes. Rushing produces a green tick that means nothing, which is the
failure this repository keeps a gate ledger to avoid.

**Fill in the "heard" column as you go.** A blank row is not a pass. Record what was
actually said, not whether it seemed fine — the wording is the finding.

## Setup

1. `npm run serve`, open <http://localhost:8642> in **Safari**. VoiceOver and Safari
   are the pairing Apple tests; Chrome differs enough to produce findings that are
   Chrome's, not ours.
2. Start VoiceOver with **⌘F5**. Turn it off the same way.
3. The window must have real focus — the same condition `check-a11y.js` refuses to run
   without. Click the page once before starting.

Keys, which is all you need:

|                      |                                                                |
|----------------------|----------------------------------------------------------------|
| `VO`                 | Control + Option, held together                                |
| `VO` + A             | read continuously from here                                    |
| `VO` + → / ←         | move through everything, including text                        |
| Tab / Shift-Tab      | move between focusable controls only                           |
| `VO` + Space         | activate the thing VoiceOver is on                             |
| `VO` + U             | rotor — lists headings, links, form controls; Escape closes it |
| `VO` + Shift + ↓ / ↑ | step into / out of a group (tables, toolbars)                  |
| Control              | stop it talking, without turning it off                        |

## What a pass sounds like

Three things per control, and a missing one is a finding: **role**, **name**, and
**state**. "Submit, button" is a pass. "Button" alone is not — no name. "Overview,
selected, tab, 1 of 4" is a pass; "Overview" alone means the tab role never reached
the AT.

State must be announced when it CHANGES, not only on first landing. An accordion that
says "collapsed" on arrival and stays silent when you open it has failed the row even
though the attribute is correct — that is exactly the gap `check-a11y` cannot see.

## Two things that are NOT bugs

**Six deliberate specimens**, already reported as notes rather than findings by
`check-a11y`: four `menu` density demos (3, 2, 2, 2 items), `overflow-menu`'s open
options list (2), and `list-box`'s expanded menu (3). They have no trigger and no tab
stop because what they demonstrate is the CSS.

**One known false positive.** `progress-indicator`'s step button reports "no visible
focus change" because Carbon draws that ring on `:focus-visible` on the LABEL and sets
`outline: none` on plain `:focus`. Adjudicated 2026-08-29, re-confirmed 2026-08-30.

## Start here — four things to check first

These came out of preparing for the pass on 2026-08-30 by reading what the page
declares. Each is specific, and **none can be reached with Tab**, which is why no sweep
so far has caught them. Do these before the table; if one is real it is worth knowing
early.

**1. Four buttons in `tabs` with no accessible name.** `#tabs` holds four `<button>`
elements with no text, no `aria-label`, and only an SVG child — the close buttons on
non-dismissible tabs, 1x1 inside `.rux--tabs__nav-item--close--hidden`. They carry
`tabindex="-1"`, so Tab never reaches them and the tab sweep never saw them. **That
removes an element from the tab order, not from the accessibility tree**, so `VO`+→
should walk straight into them. Listen for a button announced with no name. If it is
there, it is a real defect, and `check-a11y` is blind to it by construction — its
unnamed-control rule only inspects tabbable elements.

**2. Eleven live regions in `notification`,** 6 `role="alert"` and 5 `role="status"`,
all present at load. See the known-awkward note below before filing anything.

**3. Eight hidden strings reading "Beginning of notification" / "End of notification".**
Four pairs, for readers only. Confirm they are announced AND that they land either side
of the content rather than mid-sentence.

**4. `pagination` carries the hidden string "Page of 9 pages"** — the current number is
meant to come from the `<select>` between those words. If you hear "Page, of 9 pages"
with nothing in the gap, the label is broken for readers and invisible to everyone else.

## The pass

Twelve modules own the interactive set. Sections not listed here are static specimens.

| #  | Section       | Do this                   | Should hear                                                                                             | Heard                                    |
|----|---------------|---------------------------|---------------------------------------------------------------------------------------------------------|------------------------------------------|
| 1  | buttons       | Tab across                | name + "button"; disabled says "dimmed"                                                                 |                                          |
| 2  | links         | Tab across                | name + "link"                                                                                           |                                          |
| 3  | text-input    | Tab in, type              | label, then "edit text"; invalid reads its error                                                        |                                          |
| 4  | textarea      | Tab in                    | label + "edit text, multiline"                                                                          |                                          |
| 5  | select        | Tab in, ↓                 | label + "pop up button", each option as it changes                                                      |                                          |
| 6  | checkbox      | Tab, Space                | name + "checkbox" + "checked"/"unchecked" ON TOGGLE; **5 carry `aria-disabled`** — each must say so     |                                          |
| 7  | radio         | Tab, ↓                    | "radio button, N of M" + group name                                                                     |                                          |
| 8  | toggle        | Tab, Space                | **`role="switch"` on all 6** — "switch", not "checkbox" — plus state, and the state again when it flips |                                          |
| 9  | search        | Type, then clear          | field name; clear button has its own name                                                               |                                          |
| 10 | number        | Tab, ↑↓                   | "spin button" + value on each step                                                                      |                                          |
| 11 | tile          | Tab, Space                | clickable reads as link/button; selectable reads checked                                                |                                          |
| 12 | notification  | —                         | is it announced without moving focus? (live region)                                                     |                                          |
| 13 | tabs          | Tab in, ←→, then `VO`+→   | "tab, selected, N of M"; panel announced on change; **and prediction 1**                                |                                          |
| 14 | table         | `VO`+Shift+↓, arrow cells | column AND row header per cell; sort state on headers                                                   |                                          |
| 15 | dropdown      | Tab, Enter, ↓             | "combo box", "expanded", option + position                                                              |                                          |
| 16 | list-box      | same                      | same                                                                                                    |                                          |
| 17 | modal         | Open it                   | dialog + its title on open; focus lands inside; page behind is silent                                   |                                          |
| 18 | popover       | Open it                   | content read on open, not before                                                                        |                                          |
| 19 | tooltip       | Focus trigger             | description reaches you without leaving the control                                                     |                                          |
| 20 | menu          | Open, arrow               | "menu", item + position, submenu state                                                                  |                                          |
| 21 | overflow-menu | same                      | trigger has a name that is not just "button"                                                            |                                          |
| 22 | accordion     | Tab, Enter                | "expanded"/"collapsed" ON TOGGLE, not only on arrival                                                   |                                          |
| 23 | pagination    | Tab across                | page field + prev/next names, and the range; **and prediction 4**                                       |                                          |
| 24 | ui-shell      | Tab from the top          | skip link FIRST; hamburger state; nav items as a list                                                   |                                          |

## Two rows that are known-awkward before you start

**12 · notification.** A notification that is in the DOM at load is not announced —
live regions only fire on change. If nothing is heard, that is expected here and not a
finding; the real question is whether one added later would announce, which this sink
cannot demonstrate. Record what you hear and leave it.

**17 · modal.** The page behind must go silent. If you can `VO`+→ out of the dialog
into the sink's sections, `aria-hidden`/`inert` is not doing its job — that is a
genuine finding and a common one.

## Recording

Findings go in this file, under the table, one per line: section, what was said, what
should have been. Then §4.5 can close with the same evidence trail the keyboard half
has — a date, a tool, a number.

**Pass run:** _(date)_ · **VoiceOver** _(macOS version)_ · **Safari** _(version)_

### Findings

_(none recorded yet)_
