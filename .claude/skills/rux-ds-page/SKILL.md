---
name: rux-ds-page
description: Build a page out of rux-ds — a new template, a consumer page, or a page shape none of the eight templates covers. Use when asked to create, compose or lay out a page with these components, or when a page built from them looks wrong. Encodes which template to copy, the four failures that produce a finished-looking wrong page, and where IBM's own pattern guidance applies. Knowing the components is not knowing how to assemble them.
---

# Building a page

`sink/*.html` says what a component **is**. This is how to put them together.

**`docs/composing-pages.md` is the full procedure** — twelve traps, each citing
where the failure is recorded. This skill is the ordered version for doing the
work; go to the document for why any line here is true.

## 1. Copy a template — never start from scratch

Eight exist, each a **complete page**, shell included.

| page | start from |
| :--- | :--- |
| nav and header, nothing else | `templates/app-shell.html` |
| list of records, sortable, selectable | `templates/table-page.html` |
| create or edit one record | `templates/form-page.html` |
| view one record | `templates/detail-page.html` |
| nothing to show yet | `templates/empty-state.html` |
| one step of a multi-step flow | `templates/wizard-page.html` |
| an overview of many things | `templates/dashboard-page.html` |
| something went wrong | `templates/error-state.html` |

**Not `sink/ui-shell.html`** — same shell in a 22rem sandbox, positioned for a
specimen.

**Read the source comments in what you copied.** ~2,650 lines across the six,
most of it recording an approach that was tried and failed. The comment above
the thing you are about to change is usually the answer to your question.

## 2. Confirm the component is compiled

**34 of 75.** `docs/inventory.md` has the list and the reason for each cut.
`date-picker`, `combo-box`, `toggletip` are deferred; `page-header` is cut. A
class for an uncompiled component resolves to nothing and **fails silently** —
correct-looking markup, no styling.

`npm run verify` catches it, so the loop is short. Knowing first saves designing
around something absent.

## 3. Four failures that produce a finished-looking wrong page

These are the ones to check *while writing*, because none of them looks broken.

1. **A tile inside `layer-two` is invisible on a plain page.** `layer-two`
   resolves to the page's own white. Correct only inside something already
   painting `layer`, like a tab panel. Bare `rux--tile` gives
   `rgb(244,244,244)` and is visible. Copying the idiom out of
   `detail-page.html` faithfully is what shipped this.
2. **Nothing offsets `.rux--content` for a nav inside the header.** Only a
   *sibling* nav indents it. Keep the template's breakpoint-scoped
   `padding-inline-start: 18rem`. A grid offset (`lg:col-start-4`) was tried and
   is wrong — proportional against a fixed 16rem nav. So is a margin.
3. **The sprite must be inlined.** `<use href="#i-name">` against an external
   file is blank in Safari (no cross-document `<use>`, ever) and blocked over
   `file://`. Fails **silently** — a fully styled page with no icons.
   `npm run icons` covers `templates/` only; anything else splices by hand and
   drifts.
4. **Without `rux--stack-vertical` everything is flush.** No automatic vertical
   rhythm exists. Pair it with a scale — the templates use `stack-scale-3`
   through `-7`, usually `-6`. **No gate catches this**; `portal.html` shipped
   with none and passed all seventeen.

Eight more are in `docs/composing-pages.md` §3, including two found by LOOKING
with every gate green: **an unattested composition inherits no spacing** — a tag
inline after list text gets only a 4px word space, and `stack-horizontal` is NOT
the fix, it cannot wrap and truncates the badge in a narrow column — and **an
ordered list's numbers render 24px outside its own box**, so they escape into
the gutter unless the container is padded. Also: specimens that are not operable,
`aria-hidden` over focusable children, an overflow menu covering its trigger,
the missing responsive metric-row idiom, and **the type utility classes** —
`rux--type-*`, 73 of them, which is how a `<legend>` group name is lifted above
the field label beside it. Keep the `<legend>`; an `<h2>` loses the fieldset's
accessible grouping.

## 4. What must not be invented

- **Classes.** Every `rux--*` comes from Carbon. `npm run verify` fails on one
  that does not resolve or whose component is not compiled.
- **Markup structure.** Diff against `docs/carbon-*.json`, not against a guess
  and not against the live Storybook — the captures match the compiled version
  and need no network. `node tools/diff-fragment.mjs <name>`.
- **Behaviour Carbon does not have.** Modules make Carbon's components work;
  they do not add interactions Carbon declines.
- **Decisions.** Roadmap §1.1, §2.1, §4.4, §4.6 record choices *with their
  rejected alternatives*. Ask before reopening one.

## 5. IBM's own pattern guidance

`carbon-website/` is on disk, gitignored — *read from, never shipped*.
Seventeen pattern pages under `src/pages/patterns/`: empty states, forms,
dialogs, notifications, filtering, global header, login, loading, search,
disabled and read-only states. Good on anatomy and when-to-use, which the
component reference cannot answer.

**Two limits.** The patterns assume all of Carbon — read each against
`docs/inventory.md` first. And this repository is **public**: record facts and
decisions with citations, never paste prose. `NOTICE` covers Carbon's
Apache-2.0 *code*, not website guidance content.

For markup the captures remain authoritative. The website says what a pattern
should do; `docs/carbon-*.json` says what the markup is.

## 6. Open the page

**The gates cannot see everything and looking is not optional.** Five shipped
defects passed every gate: two chevrons rotated from the wrong base glyph, a
missing positioning wrapper, a missing styled wrapper, four menu specimens that
were `visibility: hidden`.

Run the browser gates on **your** page. `check-a11y`, `check-runtime-classes`
and `check-spacing` work on a template as well as the sink — **there is no page
argument**, they read whatever document they are evaluated in, so load your page
and run the tool there, fetched from the server rather than pasted. A bug
shipped nine times in `table-page.html` because nobody did this.

Two cannot be pointed at an arbitrary page: `check-rendered`, whose unit is the
`.ks-sec` section no template has, and `check-behaviour`, which needs one of
every component present.

**Use the `sink-check` skill for the procedure** — its six conditions each exist
because getting one wrong produced a confident wrong number. `npm run gates`
says which gate has been run against which page.

## 7. If the page is a template

`docs/verifying-templates.md` is the procedure, and it has one hard rule: a
template's behaviour is **verified against a running Carbon page**, never
derived from `css/rux.css`. The stylesheet gives the mechanism and says nothing
about intent — four wrong shell answers in one sitting came from reading it and
guessing. `check-provenance` requires a `BEHAVIOUR:` comment naming the page as
a URL, the date, and what was NOT covered.

## Using this outside rux-ds

A consumer vendors `css/`, `assets/` and `js/` — **not this skill, not
`sink/`, not the captures, and not the gates**. Everything in §4 is unenforced
there unless the consumer adopts it deliberately. `rux-ln-guides` is the first
such project; its `vendor/rux-ds/PIN` records which commit its copy came from,
and a reference read at a different commit than the vendored CSS is the drift
that pin exists to prevent.
