# Builder coverage — what the catalogue holds, and what it does not

The page builder offers a catalogue of **blocks**: regions marked in `sink/` and
`templates/` that can stand as a direct child of a page's stack. This page says
which of the sink's fragments are in it and which are not, so growing the
catalogue is a choice made from numbers rather than from memory.

**Only the table is generated.** `tools/build-blocks.mjs` rewrites what sits
between `COVERAGE:BEGIN` and `COVERAGE:END` on every `npm run blocks`, and
touches nothing else on this page — the arrangement `tools/build-readme.mjs`
already uses on README, and for the same reason: the table is current state, and
the eligibility notes beside it are decisions. `tools/check-blocks.mjs` fails if
the table has drifted or if a note below names a fragment that does not exist.

**A candidate region** is an element carrying a `rux--` class none of whose
ancestors carries one. It is an upper bound on what could be marked, not a
forecast of blocks: the rule that governs marking is roadmap §4.12's, "a region
that can stand as a direct child of a page's stack", and most candidates will
not meet it.

**`text` and `variants` are counted per marked block**, so an unmarked fragment
shows `—` rather than a number computed over a whole demo catalogue, which would
mean nothing.

## Eligibility — decided, and why

One line per fragment that will NOT be marked, with the reason. Every other
unmarked fragment is an open candidate: nobody has ruled on it yet. These are
decisions and are kept by hand; the three below quote the fragments' own source
rather than adding a judgement.

- `spacing` — a foundation, not a component. Its own comment: "A FOUNDATION, NOT
  A COMPONENT." It carries zero `rux--` elements.
- `badge-indicator` — its own comment: "A badge is not a free-standing box." It
  renders as the last child of an icon-only button, which is what gives the
  absolutely-positioned badge its containing block.
- `list-box` — its own comment: it is "the primitive under dropdown, combo box
  and multiselect" and "has no story of its own: every reference for it is one
  of those three."

<!-- COVERAGE:BEGIN -->
_68 shipped fragments · 8 marked, holding 9 of the catalogue's 33 blocks · 334 candidate regions in the 60 unmarked._

| fragment | components | blocks | candidates | text | variants | behaviour | in the builder |
|---|---|---|---|---|---|---|---|
| `accordion` | accordion | 1 | 1 | 6 | 0 | accordion | yes |
| `action-set` | action-set, button | — | 7 | — | — | — | no |
| `ai-label` | ai-label, button, link, popover, toggletip | — | 7 | — | — | copy-button, popover | no |
| `aspect-ratio` | aspect-ratio | — | 5 | — | — | — | no |
| `badge-indicator` | badge-indicator, button | — | 2 | — | — | — | no |
| `big-number` | big-number | — | 1 | — | — | — | no |
| `breadcrumb` | breadcrumb, link | 1 | 3 | 3 | 0 | — | yes |
| `buttons` | button, inline-loading, loading | — | 18 | — | — | — | no |
| `card` | button, card | — | 11 | — | — | — | no |
| `chat-button` | button, chat-button | — | 4 | — | — | — | no |
| `checkbox` | checkbox, form | — | 5 | — | — | — | no |
| `code-snippet` | button, code-snippet, copy-button | — | 4 | — | — | copy-button | no |
| `combo-box` | combo-box, list-box, text-input | — | 2 | — | — | form-controls, list-box | no |
| `combo-button` | button, combo-button, menu | — | 4 | — | — | menu | no |
| `contained-list` | button, contained-list | 1 | 2 | 5 | 1 | — | yes |
| `content-switcher` | button, content-switcher | — | 3 | — | — | — | no |
| `copy-button` | button, copy-button, popover, tooltip | — | 2 | — | — | copy-button, popover | no |
| `date-picker` | date-picker, form | — | 8 | — | — | date-picker | no |
| `dialog` | button, dialog | — | 2 | — | — | — | no |
| `dropdown` | dropdown, form, list-box | — | 8 | — | — | form-controls, list-box | no |
| `edit-in-place` | EditInPlace, button, popover, text-input, tooltip | — | 3 | — | — | copy-button, form-controls, list-box, popover | no |
| `file-uploader` | file-uploader, form, popover, tooltip | — | 2 | — | — | copy-button, popover | no |
| `fluid` | checkbox, combo-box, date-picker, dropdown, form, list-box, multiselect, number-input, search, select, text-area, text-input, time-picker | — | 18 | — | — | date-picker, form-controls, list-box | no |
| `full-page-error` | FullPageError, link | 1 | 1 | 3 | 0 | — | yes |
| `grid` | — | — | 4 | — | — | — | no |
| `icon-indicator` | icon-indicator | — | 16 | — | — | — | no |
| `inline-loading` | inline-loading, loading | — | 3 | — | — | — | no |
| `links` | link | — | 7 | — | — | — | no |
| `list` | list | — | 3 | — | — | — | no |
| `list-box` | list-box | — | 2 | — | — | form-controls, list-box | no |
| `loading` | loading | — | 2 | — | — | — | no |
| `menu` | button, menu | — | 6 | — | — | menu | no |
| `menu-button` | button, menu-button | — | 2 | — | — | — | no |
| `modal` | button, data-table, modal | — | 12 | — | — | data-table, menu, modal, overlay | no |
| `multiselect` | checkbox, combo-box, form, list-box, multiselect, tag, text-input | — | 3 | — | — | dismiss, form-controls, list-box | no |
| `notification` | button, notification | 1 | 15 | 2 | 0 | dismiss | yes |
| `number` | form, number-input | — | 4 | — | — | form-controls | no |
| `options-tile` | OptionsTile, toggle | — | 2 | — | — | form-controls | no |
| `overflow-menu` | overflow-menu | — | 2 | — | — | menu | no |
| `pagination` | form, pagination, select | — | 2 | — | — | form-controls | no |
| `pagination-nav` | button, pagination-nav | — | 2 | — | — | — | no |
| `popover` | button, popover | — | 7 | — | — | copy-button, popover | no |
| `progress-bar` | progress-bar | — | 4 | — | — | — | no |
| `progress-indicator` | progress-indicator | — | 3 | — | — | — | no |
| `radio` | form, radio-button | — | 5 | — | — | — | no |
| `scroll-gradient` | scroll-gradient | — | 1 | — | — | — | no |
| `search` | search | — | 3 | — | — | form-controls | no |
| `select` | form, select | — | 5 | — | — | form-controls | no |
| `shape-indicator` | shape-indicator | — | 13 | — | — | — | no |
| `side-panel` | action-set, ai-label, button, popover, side-panel, toggletip, tooltip | — | 1 | — | — | copy-button, popover | no |
| `skeleton` | breadcrumb, button, link, skeleton-styles | — | 13 | — | — | — | no |
| `slider` | form, slider, text-input | — | 5 | — | — | list-box | no |
| `spacing` | — | — | 0 | — | — | — | no |
| `stack` | button, stack, tile | — | 3 | — | — | tile | no |
| `structured-list` | structured-list | 2 | 2 | 12 | 0 | form-controls | yes |
| `table` | button, checkbox, data-table, overflow-menu, radio-button, search, tag | 1 | 6 | 9 | 1 | data-table, dismiss, form-controls, menu, overlay | yes |
| `tabs` | popover, tabs, tooltip | — | 11 | — | — | copy-button, popover, tabs | no |
| `tags` | tag | — | 20 | — | — | dismiss | no |
| `text-input` | button, form, popover, text-input, toggle, tooltip | — | 10 | — | — | copy-button, form-controls, list-box, popover | no |
| `textarea` | form, text-area | — | 5 | — | — | — | no |
| `tile` | button, link, stack, tile | 1 | 9 | 1 | 0 | tile | yes |
| `time-picker` | checkbox, form, select, text-input, time-picker | — | 4 | — | — | form-controls, list-box | no |
| `toggle` | toggle | — | 7 | — | — | form-controls | no |
| `toggletip` | dropdown, link, list-box, popover, toggletip | — | 2 | — | — | copy-button, form-controls, list-box, popover | no |
| `tooltip` | button, popover, tooltip | — | 3 | — | — | copy-button, popover | no |
| `treeview` | treeview | — | 2 | — | — | — | no |
| `ui-shell` | button, form, radio-button, stack, text-input, ui-shell | — | 3 | — | — | list-box, ui-shell | no |
| `user-avatar` | user-avatar | — | 16 | — | — | — | no |
<!-- COVERAGE:END -->
