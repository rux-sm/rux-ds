# Choices a project makes

The user-facing list of what can be picked when a page is started, where
each option comes from, and which layer offers it. **Every option here is
attested**: a template or a sink fragment renders it, diffed against a Carbon
capture. Nothing is offered that the gates would refuse. Counts come from
`templates/` and `sink/` on 2026-09-02; when they move, this page is wrong
before the code is.

Three layers offer them, cheapest first:

| Layer | Offers | Status |
|---|---|---|
| **Script** `tools/new-project.sh` | what a text substitution on a template can do: shape, theme, name, title, file | Done |
| **Skill** `rux-ds-page` | composition: which shell parts, which fields, which buttons, which blocks; then the gates | Done 2026-09-02, its §2 |
| **Builder** `builder.html`, here | a page builder: a template, its answers, marked blocks from `sink/` and `templates/`, a live preview, the HTML to take away | Partial 2026-09-05 — the template, the answers, the preview, every marked block added, moved or removed, and the selected block's text edited in place; undo and export follow (roadmap §4.12 item 3) |

## Page shape — ten, pick one

Each is a complete page with the shell. Start from the one nearest the job;
the second column is the suggestion.

| Template | Use it when |
|---|---|
| `app-shell` | nav and header, nothing else yet |
| `dashboard-page` | a few numbers and a table, read more than edited |
| `table-page` | a list of records: sort, select, page |
| `form-page` | create or edit one record |
| `detail-page` | read one record, with actions |
| `settings-page` | grouped controls that save |
| `wizard-page` | one step of a multi-step flow |
| `schedule-page` | dates and times |
| `empty-state` | nothing to show yet |
| `error-state` | something failed |

## UI shell — one, with parts

Carbon ships one shell and rux-ds carries one attested build of it: a dark
header with the product name, header nav links, global actions, two
right-hand header panels — **the switcher** and, since 2026-09-02, **the
account panel** — and a left side nav, expanded, fixed. Two things are
choices and four are not:

- **Header nav links**: present or absent.
- **Global actions and the switcher panel**: present or absent. Two actions
  ship, in Carbon's prescribed order: the switcher, where an ecosystem lists
  its apps, and the account. Notifications and help are NOT among them
  (2026-09-03) — an icon-only button with no handler is an affordance that
  lies. Add one in a product when it does something.
- Side nav: only the expanded, fixed variant is captured. No rail, no
  collapsed-by-default; ask before offering one.
- The account panel: every app has one (roadmap §4.13). It holds the profile
  — a display name and the theme — saved in the browser under one key every
  app on the origin shares, so a choice made in one app is the choice in all.
  `js/theme.js` applies it before first paint, `js/profile.js` keeps it.
- The shell's theme: the header is `g100` by Carbon's own guidance and stays
  so whatever the page is.
- The mark: it is the brand, not a choice.

## Theme — five, all offered, one the default

`white`, `g10`, `g90`, `g100` from Carbon, and `rux`, the block in
`css/rux-theme.css`, vendored so it is the same theme in every app. Every
page offers all five in its account panel and a visitor's choice wins; what
a project chooses is the DEFAULT, on `<html>`. Suggestion: `white` or `g10`
for a page read at length, `g10` when cards should stand off the page, `g90`
or `g100` for a dark tool.

## Fields — regular or fluid

Six controls exist in both styles: text input, text area, select, number
input, search, date picker. Fluid packs the label inside the field's box so
a dense form aligns; regular keeps the label above and is what every other
control matches. Suggestion: regular unless the whole form is fluid, since
Carbon does not mix them in one group. Checkbox, radio, toggle and the
list-box family have no fluid form.

## Buttons — kinds, sizes, states

- **Kinds**, seven: primary, secondary, tertiary, ghost, danger, danger
  tertiary, danger ghost. Suggestion: one primary per view, secondary beside
  it, ghost for the quiet action, danger only for the destructive one.
- **Sizes**, five: `xs` `sm` `md` `lg` `xl`, and `lg` is the default with no
  size class. Suggestion: `lg` in forms and dialogs, `sm` inside tables and
  toolbars, `xl` only for a hero action; `expressive` is a type-scale
  variant, not a size.
- **States**: disabled, loading, selected. They are states the page sets,
  not choices made at creation.

## Data tables — five row densities

- **Densities**, five: `xs` `sm` `md` `lg` `xl`, written as
  `rux--data-table--<size>` on the `<table>` itself, never on a wrapper. All
  five are attested in Carbon's captures and demoed in `sink/table.html`.
  `lg` is the default twice over — it is what every table in this repository
  uses, and `.rux--data-table tr` is already 3rem without any density class.
  Suggestion: `lg` for a table people read a row at a time, `sm` or `xs` when
  the point is to see many rows at once; `xl` only where a row holds two lines.
- **A row will not shrink below what it holds**, measured 2026-09-05: on a
  table with a selection column the checkbox floors every row at 41px, so `xs`
  and `sm` look identical there. Without one, the rendered heights follow the
  token — 29, 38, 40, 48 and 64px for the five. Pick density for a table you
  have looked at, not from the ladder alone.
- **The toolbar does not shrink with the table.** Carbon pairs a small table
  with `cds--table-toolbar--sm`, and that class is not compiled here, so a
  toolbar stays its own size whatever the rows do.

## Content blocks — 68 fragments by name, 33 marked as blocks

Anything in `sink/` can be dropped into a page body; the kitchen sink is the
catalogue and `sink/ORDER` the index. The skill offers all 68 by name; the
script does not. The builder offers only what carries a `BLOCK:BEGIN` marker
— one attested specimen per marked fragment, plus every REPLACE region of a
template's `<main>` — because a fragment dropped in whole brings `ks-`
wrappers that `css/rux.css` does not style and specimens a page does not
want. `builder/blocks.json` is the list, and `tools/check-blocks.mjs` keeps it
a verbatim copy of its sources.
