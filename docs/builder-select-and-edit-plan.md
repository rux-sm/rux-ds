# Builder — select-and-edit (roadmap §4.12, creator 3)

**Status, 2026-09-04: approved plan, not yet implemented.** Written and
revised four times in review with rux before any code — the pattern
§4.12's own log already uses for this creator ("the plan went through four
revisions in the open"). Saved here so implementation can pick it up from a
different clone. Once built, fold what shipped into `README.md` "Picking
this up" and `docs/roadmap.md` §4.12 in their established style, and this
file can be deleted — it is a plan, not a decision record.

*Revision 4 — fixes three remaining defects from review of revision 3:
entity-decoding was dropped when the field control switched to a textarea,
the tokenizer had no void-element handling, and a new gate would have judged
code from the same pass that wrote it. Repository was clean; `npm run gates
-- --gaps` reported all 41 browser cells current as of the last revision.*

## Context

Creator 3 (`builder.html`) proceeds in ordered stages recorded in
`docs/roadmap.md` §4.12. Stage 1 marked blocks and gated them
(`check-blocks.mjs`); Stage 2 built slots, the round trip, and the live
preview. `README.md` "Picking this up" names the next step: **select-and-
edit** — picking a block in the current composition and personalising its
text content, per the milestone journey ("choose a template, **personalise
its content**, add and move a block, undo a change, ..."). Add/move, general
undo, `check-parity`, and export stay out of scope, already sequenced after
this by the roadmap.

## Design decisions

**Selection is a `<select>`, not a click-in-the-iframe.** Reuses the exact
pattern one field above it (`#bld-template`), keyboard- and screen-reader-
accessible by construction. Selecting a block updates the field panel and a
best-effort preview highlight directly and immediately — it does not reload
the iframe, since nothing about the composed HTML changed by choosing which
block to look at.

**Editing uses a small ancestor-aware tokenizer over the raw block HTML, not
`contenteditable` and not DOM reserialization.** A first draft used a flat
regex (`<tag>TEXT</tag>` with no `<`/`>` inside), which is byte-lossless on
write but has no idea what's a comment, a `<script>`/`<style>` body, or SVG
descendant text — a real risk in a repository whose own comments routinely
contain literal tag examples (`<!-- ... "a <div>...</div>" ... -->`). The
tokenizer walks the string once with an explicit open-element stack:

- One regex finds every **tag-like token** in order: `<!--...-->`,
  `<script...>...</script>`, `<style...>...</style>` and `<svg...>...</svg>`
  as **opaque atomic spans** (entered and skipped whole, stack untouched,
  nothing inside is ever visited), plus generic `<tag ...>` /
  `</tag>` / self-closing `<tag .../>` tokens otherwise.
- A fixed **void-element set** (`area base br col embed hr img input link
  meta param source track wbr`) is never pushed onto the stack, whether or
  not it is written with a trailing `/>` — bare `<input id="f-n1"
  class="rux--checkbox" type="checkbox">` (no slash — e.g.
  `templates/form-page.html:430`) is exactly as common in this corpus as a
  self-closed `<use/>`, and pushing one would wait forever for a closing
  tag that never comes, corrupting every ancestry and leaf check for the
  rest of the block. Checked by tag name lowercased, matching the standard
  HTML void-element list, independent of the self-closing-slash test.
- Between two consecutive tokens, the text belongs to whatever element is
  currently on top of the stack.
- An **editable field** is text found immediately between an element's own
  open tag and its own matching close tag, with *nothing else* — no other
  tag, no opaque span — in between (this is what "leaf, text-only" means,
  derived structurally rather than by a `[^<>]*` guess), non-empty after
  `.trim()`.
- At the moment a leaf closes, the **entire ancestor stack** (not just the
  immediate parent) is checked against the exclusion rules below — this
  replaces a fragile fixed-width lookback with a real ancestor test.

This is more code than a flat regex, but it is the correct fix for a defect
class (comments containing markup examples) this repository's own writing
style makes routine, not hypothetical.

**Substitution stays lossless string splicing.** `applyTextEdits` still
walks the *original* html's field list (never a previously-edited
derivative — an edit that blanks field 0 can never shift field 1's index),
and splices the escaped (`&`, `<`, `>` only) replacement text at the
recorded `[start, end)` offsets, leaving every other byte — including
`<use/>` self-closing syntax and bare boolean attributes elsewhere in the
block — untouched. Both functions are pure string logic with no DOM
dependency, so they live in `builder/rewrites.mjs` (Node-portable, matching
that module's existing "browser and Node run the same code" contract), not
in `builder/builder.js`.

**Fields are edited in a `<textarea>`, not `<input type="text">`.** A
single-line text input silently strips CR/LF from its value (the HTML
"value sanitization algorithm" for `type=text`), and two shipped blocks
contain a genuine multiline text node in source: `empty-state.html:415-416`
and `error-state.html:427-429` (both a `<p>` whose source wraps across
lines with leading indentation — real bytes, not just visual wrapping).
Loading either into a text input and editing one character would silently
collapse the line breaks on write-back. `templates/form-page.html:511-519`
already ships a plain Carbon textarea composition without the character
counter's live-counting behaviour (`rux--form-item` →
`rux--text-area__label-wrapper` + label → `rux--text-area__wrapper` →
`textarea.rux--text-area` → `rux--form__helper-text`) — the field template
clones this shape, dropping `maxlength`/`placeholder` (fields are uncapped)
and the source's `span.rux--text-area__counter-alert` (nothing here counts
characters; an empty `role="alert"` region would ship for no reason), at
`rows="2"`.

**Two static `<template>`s, not one, and neither is invented at runtime.**
`#bld-field-template` (the textarea row above) and a new
`#bld-no-fields-template` (a single `<p class="rux--form__helper-text">This
block has no text to edit.</p>`) both ship in generated `builder.html` and
are only *cloned* by `builder.js`, never constructed from class-name
strings — resolving the contradiction with that file's own header comment
by construction rather than by editing the claim.

**Exclusions are ancestor-based, not a lookback heuristic.** Traced by
grepping every `.textContent =` assignment across all of `js/`:
| Check | Why | Evidence |
|---|---|---|
| any ancestor (including the leaf itself) has `aria-hidden="true"` | decorative/duplicate text | general rule; covers `.rux--toggle__text` |
| any ancestor's class contains `rux--visually-hidden` or `rux--assistive-text` | screen-reader-only or step-state text | `css/rux.css:2476`; wizard step state; `sink/table.html` sort descriptions |
| leaf's own class contains `rux--toggle__text` | rewritten to "On"/"Off" | `js/form-controls.js:93` |
| leaf's own class contains `rux--list-box__label` | rewritten to the chosen option's text | `js/list-box.js:166` |
| leaf's own class contains `rux--tooltip-content` | rewritten by copy-button's feedback | `js/copy-button.js:96`; `sink/file-uploader.html:55` |
| any ancestor's class contains `rux--batch-summary__para` | the "N items selected" count, a bare `<span>` with no class of its own | `js/data-table.js:148-149` — this is exactly the case the tokenizer's real ancestor walk was built to handle instead of a lookback guess |

date-picker's calendar cells are not special-cased — empty at initial parse
(closed/detached), already excluded by the non-empty-text requirement.

**Mixed text+inline-element content is still not exposed as a field**
(`<p>Some <b>bold</b> text</p>` → only `<b>bold</b>` matches). No sampled
block has this shape today; stated as a known limitation.

**`state.edits` is namespaced per template**, `{ [templateName]: {
[blockName]: { [fieldIndex]: text } } }`, pruned aggressively — typing a
value back to the original deletes that index; an empty block/template map
is deleted entirely. Keeps "N field(s) edited" and Reset's disabled state
honest.

**Control-file diffs are called out explicitly.** `tools/build-builder.mjs`
and `builder/rewrites.mjs` are proposed as diffs stating what each weakens:
**nothing** — `build-builder.mjs` only adds static skeleton and does not
touch the icon assertion; `rewrites.mjs` only adds two new pure exports and
does not change `compose`/`exportPage`/`previewPage`. `docs/gate-coverage.json`
is **not edited in this pass** — see Follow-up.

**No new gate is registered in this pass.** A formal `check-rewrites.mjs`
would be exactly the thing `AGENTS.md`'s tier table warns against: "Never
let your own change be judged by a control you authored in the same run."
Verification below runs the equivalent assertions as one-off, uncommitted
Node scripts instead — real checks, but not a standing judge of this code
written in the same pass as the code. Registering it for real (in
`tools/lib/gates.mjs`, `CONTROL_FILES`, and `npm run verify`'s chain) is its
own separately-proposed follow-up — see Follow-up for why it is not free
even then.

## Implementation

### 1. `builder/rewrites.mjs` (control file — additive only)

- `textFieldsOf(html)` — the tokenizer above. Returns ordered
  `[{ start, end, raw }]`, `raw.trim() !== ''` enforced at the point a leaf
  is yielded (not left to the caller).
- `applyTextEdits(html, edits)` — `textFieldsOf(html)`, then splice: copy
  `html.slice(cursor, m.start)`, then `escape(edits[i])` if present else
  `html.slice(m.start, m.end)` unchanged, advance `cursor = m.end`; append
  the tail. `escape` replaces `&`→`&amp;`, `<`→`&lt;`, `>`→`&gt;` only.
- Documented limitation: assumes attribute values contain no literal `>` —
  the same class of simplifying assumption `tools/lib/blocks.mjs`'s own
  marker regex already makes about attested (not arbitrary) markup.

### 2. `tools/build-builder.mjs` (control file — additive only)

New static section in the left column, below `Choices`:
- `<h2>Edit content</h2>`, an `#bld-block` `<select>` (empty, JS-filled in
  template/slot order exactly as `#bld-template` is today, options showing
  `block.label`, never the internal name).
- `#bld-fields`, an empty `rux--stack-vertical rux--stack-scale-5`
  container.
- `#bld-reset`, a `rux--btn rux--btn--ghost rux--btn--sm rux--layout--size-sm`
  button reading "Reset content", `disabled` by default, present in the
  generated static markup.
- `<template id="bld-field-template">`: one `rux--form-item` /
  `rux--text-area__label-wrapper` + label / `rux--text-area__wrapper` +
  `textarea.rux--text-area` (`rows="2"`) / `rux--form__helper-text` row,
  modeled on `templates/form-page.html:511-519` minus `maxlength`,
  `placeholder`, **and** the `span.rux--text-area__counter-alert` — that
  span exists in the source composition to pair with a live character
  counter, and nothing here counts characters, so an empty `role="alert"`
  live region would ship for no reason. `id`/`for` left for JS to set per
  clone.
- `<template id="bld-no-fields-template">`: one
  `<p class="rux--form__helper-text">This block has no text to edit.</p>`.

Update the header comment: drop "editing" from "not yet"; state the icon
assertion is unchanged.

`builder.html` stays generated-only, regenerated by `npm run builder`.

### 3. `builder/builder.js` (not a control file — ordinary work)

- `state.edits` as specified above.
- `decodeText(raw)` — a small browser-only display helper, restored from
  revision 2 (dropped by mistake in revision 3, which wrongly reasoned that
  a `<textarea>` needs no decoding because it isn't re-parsed as markup —
  true for the *write* path, false for *display*: `field.raw` is a slice of
  the original HTML **source**, so an ampersand in real text is stored as
  the literal bytes `&amp;`, and showing that string verbatim in the
  textarea would display the escape sequence itself, and re-submitting it
  unchanged would `escape()` it a second time into `&amp;amp;`).
  ```js
  function decodeText(raw) {
    const probe = document.createElement('textarea');
    probe.innerHTML = raw;
    return probe.value;
  }
  ```
  This is a one-way, display-only convenience with no bearing on the write
  path, which only ever calls `applyTextEdits` with plain decoded text.
- `renderFieldPanel(blockName, effectiveHtml)` — the function that clones
  `#bld-field-template` per field (or `#bld-no-fields-template` when
  `textFieldsOf` returns none) into `#bld-fields`, given a block name and
  its effective (edited-or-original) HTML. Called from the `#bld-block`
  change handler and after a template switch, and **also exposed as
  `window.RuxBuilder.renderFieldPanel`** so the no-fields branch — which no
  current block triggers — has a reproducible way to exercise the actual
  clone-into-DOM path during verification, not just the pure
  `textFieldsOf` function in isolation (see Verification).
  For each field: `.value = Object.hasOwn(edits, i) ? edits[i] :
  decodeText(field.raw)`; `for`/label text `Text N of M`; sequential
  `id="bld-field-N"`.
- Each field's `input` handler compares the new value against
  `decodeText(field.raw)` (the **decoded** original, not the raw source
  bytes) to decide whether to prune or set
  `state.edits[template][block][i]`, updates `#bld-reset`'s `disabled`,
  calls the existing debounced `later()`.
- `#bld-reset` click: deletes `state.edits[template][block]`, re-renders
  the field panel from originals, disables itself, calls `later()`.
- `composed()`: build `byNameWithEdits` by, for each block with saved
  edits, `byNameWithEdits[name] = { ...byName[name], html:
  applyTextEdits(byName[name].html, edits) }` (per-entry clone — never
  mutates the object `manifest.blocks` holds). `roundTrip` keeps comparing
  the **unedited** `compose(src, t.slots, byName)` against `src` — stays
  "identical" after an edit.
- Status line: append `· N field(s) edited` only when non-empty; the
  round-trip phrase is untouched.
- Highlight (best-effort, browser-only): find `BLOCK:BEGIN
  name=<selected>` in `frame.contentDocument`, collect every element
  sibling up to the matching `BLOCK:END` (handles multi-root blocks —
  confirmed in `builder/blocks.json`, `app-shell`'s `page-title` is
  `<h1>`+`<p>`). Before applying, save each target's current inline
  `outline`/`outlineOffset`; on clear (block switch or deselect), restore
  those saved values rather than setting `''`, so the helper stays
  non-destructive even though no current block ships an inline outline of
  its own. Called directly from the `#bld-block` change handler, not only
  from the iframe's `load` event, so switching blocks updates the
  highlight without reloading the preview.
- Header comment: update "WHAT IT DOES" to include selecting a block and
  editing its text; drop "editing" from "NOT YET"; state that field rows
  are cloned from `#bld-field-template`/`#bld-no-fields-template`, not
  constructed.

## Follow-up, explicitly not done in this pass

- `docs/gate-coverage.json` re-stamping: per the established two-commit
  pattern, needs a real commit to age against
  (`tools/lib/staleness.mjs`). Sequence: rux commits → the three
  `builder.html` browser gates re-sweep via `sink-check` against that
  commit → a follow-up ledger-only commit records it.
- `README.md` "Picking this up": a dated paragraph, written once the
  re-sweep above has real numbers.
- No commit is made by the implementing agent on its own initiative
  (`AGENTS.md`/`docs/commits.md`: no AI attribution, which conflicts with
  some tools' default trailer — flag it explicitly before committing
  anything, and only commit if asked).
- **A formal `check-rewrites.mjs` gate is a separate, later proposal, not
  bundled here.** Registering it — in `tools/lib/gates.mjs`, `CONTROL_FILES`,
  and `npm run verify`'s chain — is real tier-2 work of its own, proposed
  and reviewed independently of the code it would judge, per `AGENTS.md`.
  It is also not free even when accepted: `portal.html` is generated from
  the gate registry (per its own build tool), so a new registry row changes
  `portal.html`'s generated output and dirties **its** three browser-gate
  cells the same way any content change would — the follow-up sweep would
  be six cells (builder's three plus portal's three), not three.

## Verification

1. `npm run verify` — exit 0, `builder.html` regenerates, icon assertion
   unaffected.
2. One-off, **uncommitted** Node assertions against `textFieldsOf`/
   `applyTextEdits` (a scratch script, not `tools/check-rewrites.mjs` — see
   above for why that stays out of this pass), covering:
   - zero edits → output byte-identical to input;
   - editing field 0 (including blanking it) does not shift field 1's
     recorded index on a second call;
   - `&`, `<`, `>` escaped on write, nothing else touched;
   - a fixture entity round trip: source containing `A &amp; B`,
     `decodeText` yields `A & B` for display, and if the field is not
     touched the output is byte-identical (no re-escaping happens at all,
     since an untouched field is never spliced);
   - a multiline fixture (mirroring `error-state.html`'s two-line `<p>`)
     round-trips with line breaks intact;
   - a fixture with `<!-- "<b>example</b>" -->` immediately before a real
     field: the comment's fake tag is not treated as a field and does not
     desynchronize the real one's offset;
   - `<script>`/`<style>`/`<svg>` bodies produce no fields;
   - a fixture with a bare (no trailing slash) `<input>` immediately before
     a real leaf field: the input is not pushed onto the stack, and the
     leaf right after it is still found correctly (this is the case that
     breaks without the void-element set — every void element in the
     corpus is a bare tag, never self-closed);
   - a fixture with a bare boolean attribute and a self-closing `<use/>`
     elsewhere in the block: both byte-identical after an edit to an
     unrelated field;
   - each behaviour-owned exclusion in the table above, on a fixture shaped
     like its real source.
3. `npm run serve`, open `builder.html`:
   - Switch templates; `#bld-block` repopulates in slot order with labels.
   - `wizard-page` → `flow-title` (single `<h1>`): edit, preview updates
     after debounce, status adds "1 field edited", round trip stays
     identical.
   - `app-shell` → `page-title` (two fields, `<h1>`+`<p>`, multi-root):
     both fields present, both highlight, editing one leaves the other
     alone.
   - `empty-state` → its no-data empty-state block, **or** `error-state` →
     its page-level error block: confirm the multiline `<p>` loads into
     the textarea with its line breaks intact, editing preserves them, and
     the exported HTML still has the original wrapped-line structure
     outside the edited span.
   - Change theme/prefix/name after editing a field; edit survives the
     re-render.
   - Type a value back to the original; override prunes automatically
     (no Reset click needed).
   - Click Reset with real edits present; fields and preview revert,
     button disables.
   - Edge inputs: empty string, `<>&"'`; confirm the export escapes only
     `&`/`<`/`>`.
   - No-fields UI branch: no current block triggers it live, so exercise it
     through the console hook rather than leaving it untested —
     `window.RuxBuilder.renderFieldPanel('scratch', '<div><svg
     aria-hidden="true"><use href="#i-close"/></svg></div>')` against a
     hand-built zero-text fragment, and confirm `#bld-fields` receives a
     clone of `#bld-no-fields-template` rather than an element built from a
     class-name string. This exercises the actual clone-into-DOM UI path,
     not just `textFieldsOf` in isolation.
   - Tab through `#bld-block`, the field textareas, and `#bld-reset` with
     keyboard only.
4. Diff `window.RuxBuilder.page()` against the unedited export for a
   template with one field changed; confirm only the intended text
   differs, byte for byte, everywhere else — including that a comment
   containing an example tag near the edited field was not mistaken for a
   field itself.
5. Gate re-sweep and `README.md`/`docs/gate-coverage.json` updates happen
   per Follow-up, after a commit exists to age them against.
