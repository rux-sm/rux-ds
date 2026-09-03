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
| **Configurator** page in Rux Apps | the same choices with a live preview and the HTML to take away | Planned, after the hub |

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

## Content blocks — 68 fragments

Anything in `sink/` can be dropped into a page body; the kitchen sink is the
catalogue and `sink/ORDER` the index. The skill offers them by name; the
script does not.
