# Builder — the guided mode, stages 0 and 6 to 13 (roadmap §4.12, creator 3)

**Status, 2026-09-05: approved plan, revision 2; stages 0, 6 and 7 have
landed, 8 to 13 have not.**
Saved as the select-and-edit and add-and-move plans were, so a different clone
can pick it up. Each stage below is its own proposal in the open and lands in
its own commit; when a stage lands, its roadmap entry in §4.12 is the record
and the matching section here is trimmed to a pointer. Delete this file when
the last stage is folded — it is a plan, not a decision record.

## Context

rux wants a friendly, finished way to build a page and its content on rux-ds,
with clear access to the supported options: start from nothing, pick the
page's purpose, be walked through it one section at a time with defaults and
reasons, edit the content as you go, review, and take the result away. Stages
1 to 5 give the machinery: markers, slots, the byte-exact round trip,
select-and-edit, instance identity, the page model. Revision 1 put the guide
on a page of its own and left content editing in the builder; rux's review
asked for one continuous session, content in the walkthrough, suggestions
that know the page, a defined export, defined coverage, undo semantics
settled first, and the verification debt paid before it is relied on.

**Product flow:** choose purpose → configure sections and content → add
relevant sections → review appearance and behaviour → export. One page,
`builder.html`, with a guided mode and a free mode sharing one draft, one
model and one content editor. A visible preview throughout, a navigable
section outline, "keep recommended settings" per step, explanations that
expand when wanted, provenance and gate vocabulary in secondary details.

## What the repository settles (measured 2026-09-05)

- **Purpose picks the template.** The ten shapes carry a "use it when" line;
  `app-shell` is the blank one. A template's slot containers were attested
  for its job — table-page's body has no stack so pagination sits flush — so
  the purpose has to choose the frame, not only the suggestions.
- **A `follows` run is one unit in the model** and stays so: removing
  pagination removes its table. The guide walks "Data table with pagination"
  as one section with two configurable parts, and does not suggest pagination
  where the template already supplies it.
- **Content shapes**, from `textFieldsOf`: the form block has 18 text leaves
  (4 labels, 2 legends, 3 options, 2 buttons, helper texts); the table block
  15 (h1, h2, p, 6 cells, a label, 3 spans). The form has 7 form items and one
  button set; the table block 4 buttons, one icon-only, and 4 body rows; one
  block carries a real link target. "Text 1 of 18" is not a content control.
- **Swappable variants with attested spellings**: button size (`rux--btn--xs
  rux--layout--size-xs`, sm, md; `rux--layout--size-lg`; `--size-xl`; every
  template button is bare, also lg) and table density (`rux--data-table--xs`
  to `xl`). Icon-only buttons and `<a class="rux--btn">` are excluded.
  `docs/choices.md` has button sizes with guidance and no data-table
  section; stage 9 writes one.
- **Field style is not a swap**: fluid controls have different markup and no
  fluid form is captured. Deferred.
- **Export today is a page, not a project.** `exportPage` writes paths into
  `vendor/rux-ds/`, `brand/`, `rux-theme.css` and `rux-overrides.css`, which
  `tools/new-project.sh` creates. `bodyOnly` returns the whole `<main>`, so
  it replaces a page's main region. A zip is out: no third-party libraries.
- **Attested chrome exists** for the guided mode: a progress indicator
  (three specimens), a contained list with clickable items, an accordion,
  and the controls the builder already clones.
- **`check-blocks` cannot judge whether a marked region is the right one**,
  by its own words. Catalogue growth needs a visual pass per block.
- **The builder's three cells do not age on `builder/`.** Stage 0.

## Sequence

| stage | what | tier-2 files | needs |
|---|---|---|---|
| 0 | Registry: `pageInputs` so `builder/` ages the three `builder.html` cells; the six literal `fileTargets`. | `gates.mjs` | — |
| 6 | Undo, redo, and a versioned draft that survives reload. | `build-builder.mjs` | 0 |
| 7 | **DONE 2026-09-05.** Export and parity: download, copy `<main>`, the two delivery paths, `check-parity`. | `build-builder.mjs`, `check-parity.mjs`, `gates.mjs` | 6 |
| 8 | Content editing that reads as content: labels from context, grouping, link targets, per-field reset. | `rewrites.mjs` | 6 |
| 9 | Variant edits: button size per group, table density, "as attested" default; the data-table section in `choices.md`. | `rewrites.mjs`, `build-builder.mjs` | 6, 8 |
| 10 | Manifest depth (`frameDeps`), catalogue growth with a visual pass each, the generated coverage table. | `build-blocks.mjs`, `check-blocks.mjs`, CI | 0 |
| 11 | The guide map `builder/guide.json` with conditions and review records, validated by `check-blocks`. | `check-blocks.mjs` | 9, 10 |
| 12 | Guided mode in `builder.html`: stepper, outline, five steps, acceptance criteria. | `build-builder.mjs` | 7, 8, 9, 11 |
| 13 | Repeated items: duplicate, remove, reorder a repeated sibling, ids re-suffixed. v2. | `rewrites.mjs` | 12 |

## Stage notes

**0, registry.** `pageInputs: { 'builder.html': ['builder'] }` on the three
browser gates, so a change to `builder.js`, `page.mjs` or `rewrites.mjs`
stales the builder cells as it should have since stage 3 (0475e3f moved a
reading and nothing aged). The `fileTargets` drift stage 2 left open. Both
proposed with what they weaken: nothing, they only age more.

**6, undo. Landed 2026-09-05; this note is corrected rather than deleted,
because what it said was wrong in two ways and the roadmap entry now carries
the record.** It said a history PER TEMPLATE: that was rejected in review,
because `answers` — theme, prefix, name, title, file — are global, so a
per-template history would duplicate them or drop them, and undoing a theme
change would depend on which template happened to be selected. One
session-wide history shipped instead, over `{ pages, edits, answers }`, with
the acting template on the ENTRY so undo and redo both reveal where the
change happened. And it said a draft naming a missing block "drops that
entry and says so": that was also rejected. A draft is validated whole
against the manifest — templates, slots, keys, instance numbers, allocation
counters, follower relations, and a hash of every block an edit was made
against — and is left UNOPENED when any of it fails, never partly applied
and never deleted. Two failures found in review forced that: an orphaned
follower makes `unitOf` throw, and a field index silently retargets when a
block's markup changes.

**7, export and parity. Landed 2026-09-05 (`ce27ceb`); roadmap §4.12 is the
record.** Two corrections to what this note said. It said `check-parity` "runs
the script" into a scratch directory: the whole script refuses a dirty tree and
unpushed commits, so a gate that ran it would fail on every uncommitted change;
it EXTRACTS the page-writing region and runs those bytes instead, and rux chose
that over the two alternatives. And the note assumed byte parity was the whole
contract — it is not, because neither side escapes the answers, so the gate
names that limit and the builder warns. The gate found a real divergence on its
first run; §4.12 has it.

**8, content.** `textFieldsOf` gains `context` per field, additive: the tag,
the nearest enclosing form item, table row, list item or button set, the
role class, and the nearest heading or label text above. The panel renders
"Heading", "Label: Email", "Helper text under Email", "Column header 2",
"Row 3, cell 1", "Button: Save", grouped, each with "original" beside it.
Link targets (`href` not starting with `#`) are an editable attribute field.

**9, variants.** `variantsOf(html)` returns groups — each `rux--btn-set`,
each toolbar, each lone qualifying button, named by context — and `table`.
`applyVariants` rewrites size classes within a group. "As attested" first,
then the values with the recommendation for that context. Order: text,
variants, instance; all three commute.

**10, manifest and catalogue.** `frameDeps` per block. Growth by the block
rule, then each new block opened in the preview and looked at, the pass
recorded in its commit. `docs/builder-coverage.md` generated by
`build-blocks.mjs`: per component its fragment, specimens, marked blocks,
variant families, editable text count, behaviour module, and a hand-kept
"deferred, and why" column; two columns, available in rux-ds and available
in the builder.

**11, the map.** `builder/guide.json`: per template the purpose line and
ordered suggestions with `block`, `reason`, `slot`, `unless`,
`requiresFrame`, `reviewed`; per variant family values, default, reason.
Validated by `check-blocks`. The wider catalogue stays offered under
"not reviewed here: inspect the preview". Prose in `docs/choices.md`,
drafted, then edited by rux.

**12, guided mode.** A mode switch; the left column becomes a stepper over
five steps, preview on the right: purpose; sections and content (the
outline walks each unit: keep or remove, fields, variants, "keep recommended
settings", details in a closed accordion); add sections (reviewed
suggestions, then the catalogue under the inspect label); review (width row,
integrity in plain words, open in a new tab); take it away. Acceptance:
keyboard reach and sensible focus between steps; back and forth without
loss; 375 and 1280; reload restores the draft; the chrome cells swept; and
representative composed outputs checked — one guided composition per
template composed in node into a scratch root, run through the Node gates
that read markup, and at least three opened in the pane for the browser
gates, readings recorded in the roadmap entry.

**13, repeated items.** A sibling sharing tag and class with a neighbour can
be duplicated, removed down to one, or reordered, its ids and in-block
references re-suffixed with the stage-4 walker. Columns, tabs and fields of
another type are deferred with reasons in the coverage table.

## Not in v1, and rux's decisions

Fluid fields, notification kind, button kind per button, columns, tabs,
field types: deferred with reasons. Shell toggles: the choices-table
contradiction from stage 2 goes to rux first. Charts: none, by rule. The
map's prose and every "reviewed" record are rux's. Whether stage 13 is
wanted, or repeated content is better served by more captured compositions.
