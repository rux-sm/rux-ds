# Screen-reader pass — the last thing blocking §4.5

`tools/check-a11y.js` reads attributes. This reads what a person hears. They are not
the same check and nothing automated substitutes: §4.5's exit is "keyboard and
screen-reader passes on every interactive component", the keyboard half ran on
2026-08-28, and this is the other half.

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

| | |
|---|---|
| `VO` | Control + Option, held together |
| `VO` + A | read continuously from here |
| `VO` + → / ← | move through everything, including text |
| Tab / Shift-Tab | move between focusable controls only |
| `VO` + Space | activate the thing VoiceOver is on |
| `VO` + U | rotor — lists headings, links, form controls; Escape closes it |
| `VO` + Shift + ↓ / ↑ | step into / out of a group (tables, toolbars) |
| Control | stop it talking, without turning it off |

## What a pass sounds like

Three things per control, and a missing one is a finding: **role**, **name**, and
**state**. "Submit, button" is a pass. "Button" alone is not — no name. "Overview,
selected, tab, 1 of 4" is a pass; "Overview" alone means the tab role never reached
the AT.

State must be announced when it CHANGES, not only on first landing. An accordion that
says "collapsed" on arrival and stays silent when you open it has failed the row even
though the attribute is correct — that is exactly the gap `check-a11y` cannot see.

## The pass

Twelve modules own the interactive set. Sections not listed here are static specimens.

| # | Section | Do this | Should hear | Heard |
|---|---|---|---|---|
| 1 | buttons | Tab across | name + "button"; disabled says "dimmed" | |
| 2 | links | Tab across | name + "link" | |
| 3 | text-input | Tab in, type | label, then "edit text"; invalid reads its error | |
| 4 | textarea | Tab in | label + "edit text, multiline" | |
| 5 | select | Tab in, ↓ | label + "pop up button", each option as it changes | |
| 6 | checkbox | Tab, Space | name + "checkbox" + "checked"/"unchecked" ON TOGGLE | |
| 7 | radio | Tab, ↓ | "radio button, N of M" + group name | |
| 8 | toggle | Tab, Space | name + state, and the state again when it flips | |
| 9 | search | Type, then clear | field name; clear button has its own name | |
| 10 | number | Tab, ↑↓ | "spin button" + value on each step | |
| 11 | tile | Tab, Space | clickable reads as link/button; selectable reads checked | |
| 12 | notification | — | is it announced without moving focus? (live region) | |
| 13 | tabs | Tab in, ←→ | "tab, selected, N of M"; panel announced on change | |
| 14 | table | `VO`+Shift+↓, arrow cells | column AND row header per cell; sort state on headers | |
| 15 | dropdown | Tab, Enter, ↓ | "combo box", "expanded", option + position | |
| 16 | list-box | same | same | |
| 17 | modal | Open it | dialog + its title on open; focus lands inside; page behind is silent | |
| 18 | popover | Open it | content read on open, not before | |
| 19 | tooltip | Focus trigger | description reaches you without leaving the control | |
| 20 | menu | Open, arrow | "menu", item + position, submenu state | |
| 21 | overflow-menu | same | trigger has a name that is not just "button" | |
| 22 | accordion | Tab, Enter | "expanded"/"collapsed" ON TOGGLE, not only on arrival | |
| 23 | pagination | Tab across | page field + prev/next names, and the range | |
| 24 | ui-shell | Tab from the top | skip link FIRST; hamburger state; nav items as a list | |

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
