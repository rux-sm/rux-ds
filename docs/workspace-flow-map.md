---
id: rux-ds-workspace-flow-map
type: reference
status: draft — partially superseded 2026-09-10, see the top notice
updated: 2026-09-10
covers: [rux-ds, rux-sm.github.io, rux-ln-notes, rux-scheduler]
verbs: [1, 2, 3, 4, 5]
---

# The rux-ds workspace — flow map

**This file is the source. Any picture is generated from it.** Sections 3 to 6
are the drawing: lanes, stages, nodes, edges. No coordinate, colour or pixel
appears anywhere in this document.

**It composes and owns nothing.** Every command below is already carried by
`docs/verbs.md`, every rule by `AGENTS.md`, every count by `npm run gates`.
Section 5's **Verb** column is the link back, so a step that moves in the card
is findable here rather than silently stale. If this map and `docs/verbs.md`
disagree, the card is right and this is the bug.

**It answers a different question from the card.** `docs/verbs.md` answers
*what do I type*. This answers *where am I in the chain, what can refuse me
here, and what happens with no message at all*.

**SUPERSEDED IN PART, 2026-09-10 — §8.4 WAS TAKEN, and this section said what
that would do before it happened.** No app vendors `vendor/rux-ds/` any more
(roadmap §8.4, §8.6, all five steps done the same day; `docs/log.md` has each
one's proof). That removes stage 7 and nodes 17–21 exactly as this paragraph
said it would, and node 16 (cut the tag) now reaches every app directly —
there is no separate adopt phase left to walk. **What is NOT redrawn here**:
sections 4 through 6 below (stages, nodes, edges) still show the old eight-
stage, twenty-one-node shape and have not been renumbered to match. Read
`docs/verbs.md` (four verbs now, not five) and roadmap §8.6 as current; treat
stage 7, nodes 17–21, and any edge naming them, as retired rather than live.
A full redraw is the next thing to do with this file, not done in this pass —
this notice exists so the gap is found by reading it, not by trusting a
picture generated from a stale source.

---

## 1. Decisions to settle before it is drawn

Five, and only the first is a drawing question.

| | Decision | Options | Recommended |
|---|---|---|---|
| **D1** | **Canvas** | (a) one wall chart, all four lanes, commands on every box · (b) page-fit, commands dropped to the node table · (c) split — make side, ship side | **(a)**. The command is the reason to have it open beside the terminal; without it the chart only restates the card's contents |
| **D2** | **Where it lives** | (a) a figure inside `docs/verbs.md` · (b) its own `reference` document that the card and `README.md` point at | **(b)**. It spans four repositories, so hanging it off one card understates it |
| **D3** | **Scope** | Whether to draw the 26 gates individually, or as one node | **One node.** `tools/lib/gates.mjs` is the registry and drawing it twice is the duplication this repository keeps being bitten by |
| **D4** | **The prose panels** | (a) inside the figure as SVG text · (b) printed beside it | **(b)**. Prose inside markup is invisible to every gate here. Section 7 already holds it as prose |
| **D5** | **Format** | (a) hand-drawn SVG now · (b) generated from sections 3–6 | **(b) as the destination**, (a) is acceptable first. Nothing generates a diagram in this repository yet, and this document is the argument for building it |

---

## 2. What the reader is meant to take from it

Three things, in this order. If a change to the map makes one of them harder to
see, the change is wrong.

1. **The tag is the boundary.** Everything left of it can be redone for free.
   Nothing right of it moves until a tag is cut. Stage 6 exists to make that a
   place rather than a step.
2. **Passing every gate is not the finish.** Stage 4 is a separate stage on
   purpose. Five shipped defects passed every gate this repository has.
3. **The chain fails quietly in five places, and one more fails LOUDLY and
   still slips past the step meant to catch it.** Section 7 states all six.
   Four of the first five produce no message at all.

---

## 3. Lanes

Ordered top to bottom. The lane names the place, so a node never repeats it.

| | Lane | Carries |
|---|---|---|
| 1 | rux-ds | Where a class, a rule and a page are born. The only place they are born |
| 2 | The browser | The served page. Everything a file cannot answer |
| 3 | The record | What the next session reads before it starts |
| 4 | Release and adopt | The tag, and the four repositories that pin it |

---

## 4. Stages

Ordered left to right. Stage 6 is the boundary; the renderer draws that, this
file states it.

| | Stage | What changes in it |
|---|---|---|
| 1 | Decide | Nothing yet. Which tier the change is, and which file it belongs in |
| 2 | Change | The edit exists on disk |
| 3 | Prove | Every Node gate has run and returned an exit code |
| 4 | Look | A person has seen the page in a browser |
| 5 | Record | The state files and the log say what happened |
| 6 | **Release** | **The boundary.** A tag exists. Consumers can now reach it |
| 7 | Adopt | Each app's `vendor/` and `PIN` move |
| 8 | Confirm | Each site is open, live, in every theme |

---

## 5. Nodes

`#` is reading order across the whole map. `Kind` drives how a node is drawn and
nothing else:

- **decision** — a judgement, no command
- **step** — you do something
- **gate** — it can refuse you
- **read** — you look; nothing changes
- **transfer** — the act that crosses a boundary

**Verb** names the entry in `docs/verbs.md` that owns the detail. This map states
the act; it never restates the detail.

### 5.1 rux-ds

| # | Step | Command or file | Kind | What happens | Verb |
|---|---|---|---|---|---|
| 1 | **Start clean** | `git pull --ff-only && npm install --ignore-scripts` | step | The install matters only when `package.json` moved. Skipping it there makes node 6 report against the wrong tree | before any |
| 2 | **Classify the change** | `AGENTS.md` → Change classification | decision | Tier 2 — a gate, a baseline, a fixture, `CONTROL_FILES`, `AGENTS.md` itself — **stops here** and is proposed as a diff. Tier 3 is normal work | before any |
| 3 | **Place the change** | `AGENTS.md` → Where a change goes | decision | A colour → `css/rux-theme.css`. A component rule → `css/rux-overrides.css`. Which components exist → `src/app.scss`. Never `node_modules/@carbon` | 2 |
| 4 | **Copy a template** | `templates/*.html`, skill `rux-ds-page` | step | Never start from scratch or from a guess. Each template is a whole page, shell included | 1 |
| 5 | **Diff the markup** | `node tools/diff-fragment.mjs <name>` | gate | Against `docs/carbon-*.json`, the captured Carbon DOM. Never against live Storybook, never against a guess | 1 |
| 6 | **Run every Node gate** | `npm run verify` | gate | 21 gates plus the build. **Check the exit code, do not grep the output** | 1, 5 |
| 7 | **Name what was touched** | `node tools/check-controls.mjs` | read | Says which controls the diff touched. Blocks nothing, because one maintainer has nowhere to escalate | 2 |

### 5.2 The browser

| # | Step | Command or file | Kind | What happens | Verb |
|---|---|---|---|---|---|
| 8 | **Serve the page** | `npm run serve` → `localhost:8642`; or `npm run serve:workspace` → `localhost:8640`, every site on one origin | step | An app serves itself on 8643 with its own `tools/serve.mjs`. The workspace server serves it at its live path, with the switcher list resolving | 1 |
| 9 | **Run the five browser gates** | skill `sink-check` | gate | `check-a11y`, `check-rendered`, `check-runtime-classes`, `check-spacing`, `check-behaviour`. Pasted into the console of the served page — they are not Node tools, deliberately | 1 |
| 10 | **Record the sweep** | `npm run gates` | gate | Says which page each browser gate was last run against, and **fails on a page never swept**. This is where the counts live. Never in prose | 1 |
| 11 | **Open the page** | no command | gate | Every theme — white, g10, g90, g100, rux — from the account panel. **This is the only node that catches a page that compiles, resolves and still renders wrong** | 1 |

### 5.3 The record

| # | Step | Command or file | Kind | What happens | Verb |
|---|---|---|---|---|---|
| 12 | **Log the pass** | `docs/log.md` | step | Every dated pass, measurement and answered decision. Including the ones that were wrong | 1–5 |
| 13 | **Update the state** | `README.md` → Picking this up | step | Current state and what is open. A correction is made in the open, not quietly | 1–5 |
| 14 | **Commit** | `.githooks/commit-msg` | gate | `type(scope): Subject`, subject ≤ 50 characters, body wrapped at 72, authored by rux alone. Armed once per clone with `git config core.hooksPath .githooks` | 1–5 |

### 5.4 Release and adopt

| # | Step | Command or file | Kind | What happens | Verb |
|---|---|---|---|---|---|
| 15 | **Record a removal** | `CHANGES.md` | step | **Only when a class or component left.** That makes the tag a minor; otherwise a patch. Additions are safe and are not recorded. Nothing has been removed yet | 5 |
| 16 | **Cut the tag** | `git tag vX.Y.Z` then `git push origin vX.Y.Z` | transfer | **The boundary.** Two commands — one carrying both is refused. rux's call alone | 5 |
| 17 | **Move every pin** | `sh tools/roll-out.sh vX.Y.Z` | transfer | Finds every sibling folder holding a `vendor/rux-ds/PIN`, refuses the lot if any is dirty, exports the tag per app, runs that app's own check, stops at the first failure. Only `vendor/` changes. It commits nothing | 4 |
| 18 | **Read each drift report** | `tools/drift.mjs`, run by node 17 | read | Compares the page's `<head>` resources and header skeleton to the vendored `app-shell`. **Blocks nothing** — a page is the app's own | 4 |
| 19 | **Read what left** | `CHANGES.md` between the two tags | read | A class that left is the one hazard a green check does not show | 4 |
| 20 | **Commit and push per app** | `chore(vendor): Move the pin to rux-ds vX.Y.Z`, then `push` | step | The printed command stages `vendor/rux-ds` explicitly — `commit -a` would skip a newly vendored file. **For a generated app, this is not enough on its own** — see 7.1's sixth failure | 4 |
| 21 | **Open each site** | the live URL | gate | Header, switcher, account panel, theme. Record the pass in `docs/log.md` | 4 |

---

## 6. Edges

`flow` is the sequence. `branch` splits by what kind of change it was. `feed` is
a dependency that is not a sequence — the thing must be true, but you do not
walk it.

| From | To | Kind | Label |
|---|---|---|---|
| 1 | 2 | flow | — |
| 2 | 3 | branch | tier 3 — normal work |
| 2 | — | branch | **tier 2 — stop, propose a diff, do not judge it yourself** |
| 3 | 4 | branch | the change is a page |
| 3 | 6 | branch | the change is a colour or a rule |
| 4 | 5 | flow | — |
| 5 | 6 | flow | — |
| 6 | 7 | feed | only when the diff touched a control |
| 6 | 8 | flow | exit code 0 |
| 8 | 9 | flow | — |
| 9 | 10 | flow | — |
| 10 | 11 | flow | — |
| 11 | 12 | flow | — |
| 12 | 13 | flow | — |
| 13 | 14 | flow | — |
| 14 | 15 | branch | releasing |
| 14 | — | branch | not releasing — the chain ends here, on `main` |
| 15 | 16 | flow | — |
| 16 | 17 | branch | **only when there is a reason** — see below |
| 17 | 18 | flow | — |
| 18 | 19 | flow | — |
| 19 | 20 | flow | — |
| 20 | 21 | flow | — |

**Node 16 to node 17 is not automatic, and that is the design.** A tag exists
for consumers to reach; moving them is a separate act, done when `CHANGES.md`
gained a line, the drift report names a shell change, or an app needs something
that arrived. `PIN` records which tag each app is on either way.

---

## 7. Prose beside the figure

Per D4 this is printed next to the drawing, not inside it.

### 7.1 Six ways this flow fails

**Every gate passes and the page is still wrong.** The gates read files and
attributes. They cannot see a component that compiles, resolves and renders
wrong. **Five shipped defects passed all of them.** Node 11 is the only thing
that has ever caught these, and twice it was the only thing that found the bug.

**The right gate, run on the wrong page, reads zero.** `check-a11y` reported no
findings on the kitchen sink for as long as the batch-bar defect existed,
because the sink ships that bar open and the defect only occurs when it is
closed. It surfaced on `templates/table-page.html`. **Run the browser gates on
the templates too, not only on the sink.**

**A count typed into prose goes stale and nothing re-reads it.** The README said
"47 of 47 sweep cells" for two days after the number was 50. The gate registry's
own header said 14 gates when the answer was 21. Under an agent a stale sentence
is not untidiness — it is a corrupted variable. `npm run gates` and
`portal.html` are where counts live; `docs/agent-tooling.md` is the argument.

**The work is done and no tag carries it.** Nothing measures the distance
between `main` and the newest tag, so an app keeps reading an old pin and looks
correct doing it. **Only prose says so, which is failure three waiting to
happen** — this document's own §8.3 cross-reference read "44 commits past
`v0.1.11`" on 2026-09-09, the same day `docs/log.md` records the true figure
as 49 and roadmap §8.3 itself as 45: three numbers, one day, none of them
re-read. `v0.1.12` closed the gap the same day.
`git log $(git describe --tags --abbrev=0)..main --oneline | wc -l` is the
command that answers it truthfully; today it reads 0, and it will drift the
moment the next commit lands.

**An app keeps naming an older tag after a roll-out, and is right to.** `PIN`
carries a checksum of the vendored bytes, so a move to a tag whose files are
identical writes nothing and leaves the old tag name in place. This reads as a
failed roll-out and is not one. The pin names bytes, not a position in the tag
order.

**Node 17's own check passes while a generated app is still stale, and nothing
in this chain says to rebuild first.** Found live, 2026-09-09, moving
`rux-ln-notes` from `v0.1.11` to `v0.1.12`: `roll-out.sh` ran `node
tools/check.mjs`, which read `sprite 1769 inlined symbols match` — a true
reading, because the shared check only verifies that every inlined symbol is
SOMEWHERE in what rux-ds ships, never that a page carries the CURRENT sprite
in full. Notes' pages are generated and `build.mjs` inlines rux-ds's whole
sprite, not a subset, into every one; two symbols had joined it since Notes
last built, so the committed pages were stale against the pin that had just
moved, and neither `roll-out.sh` nor Notes' own AGENTS.md "Moving the pin"
procedure says to run `node tools/build.mjs` before committing — checked
against both, and neither names it. It reached `git push` and was refused
there: Notes' `pages.yml` runs `build.mjs` and diffs the result before
deploying, which is the one place in this chain that happened to catch it.
An app without that build-and-diff step would have had nothing to catch it at
all. **Correcting `roll-out.sh` or Notes' own procedure is a separate
change**, the same rule section 9 already applies to the scheduler-row gap.

### 7.2 What has actually been walked

**Verbs 1, 2 and 5 are walked constantly** — pages, rules and thirteen tags,
the whole way to `v0.1.12`.

**Verb 3 has been walked twice**, adding rux-scheduler and this repository's own
site to the switcher.

**Verb 4 has now run for real, 2026-09-09, and found something the rehearsal
could not have.** `tools/roll-out.sh v0.1.6` was exercised as a self-test on
2026-09-05 — it refused the hub while it carried untracked files, then moved
both apps, both checks passed, and both were restored afterwards, so nothing
was actually pushed or lived on. On 2026-09-09 `v0.1.12` moved all three real
apps for the first time: `roll-out.sh` ran, each app's own check passed, and
the commit-and-push at node 20 went out for all three. One of them —
`rux-ln-notes` — then failed at deploy, caught by its own CI rather than by
anything in this chain; that is 7.1's sixth failure, and it was fixed with a
second commit before node 21 was walked. All three sites were then opened
live: header, switcher, account panel, theme, no console errors, pin reading
`v0.1.12` over the network on each. **This is the first time verb 4 has moved
something live rather than a rehearsal**, and the record it leaves is the
commit history of the three apps that day, not a note in this file.

**Nothing has ever been removed.** `CHANGES.md` reads "Nothing removed yet", so
node 15 has never fired and every tag so far has been an addition or a fix.

---

## 8. Deliberately not on the map

| Left off | Why |
|---|---|
| The 26 gates one by one | `tools/lib/gates.mjs` is the registry and `npm run gates` is the reading. Drawing them here makes a second list to go stale |
| The build steps inside `npm run verify` | `build`, `sink`, `portal`, `readme`, `blocks`, `builder`, the two theme builders — they are one node because you never run them singly |
| Carbon's own compile and the strip | Roadmap §1 owns it. It happens once per Carbon version, not once per change |
| `rux-backend` | It has no page and no pin. Its own decisions live in roadmap §4.13 |
| `rux-ln-atlas` | Private. Nothing from it appears here, by the rule at the top of `AGENTS.md` |
| The screen-reader pass | It has no command and no gate. `docs/screen-reader-pass.md` owns it, and it is the one thing on this chain a person must do with an assistive technology running |

---

## 9. Sources

1. **`docs/verbs.md`** — the card. Every command in section 5 is carried by one
   of its five verbs, named in the **Verb** column. This map adds no command of
   its own.
2. **`AGENTS.md`** — the policy behind nodes 2, 3 and 14, and the rule that
   makes node 2 a stop rather than a step.
3. **`docs/agent-tooling.md`** — the six instruments, and the argument behind
   failure three.
4. **`README.md` and `docs/log.md`** — the state and the record. The unreleased
   distance in failure four, and the roll-out rehearsal in 7.2, are both read
   from the log.
5. **`package.json` and `tools/`** — every command above was confirmed to exist
   on 2026-09-09. `roll-out.sh`, `app-check.mjs`, `diff-fragment.mjs`,
   `check-controls.mjs`, `serve.mjs`, `drift.mjs` and `new-project.sh` are all
   present.

**One source was stale and this map did not inherit it, and it is fixed.**
`docs/verbs.md`'s closing table, "What each repository is, in one line", had
no row for `rux-scheduler` — it was drafted 2026-09-05 and the scheduler
joined afterwards. Corrected in the card itself on 2026-09-09 (`0720737`),
rather than here: Section 3 lists the lane rather than copying that table, so
this document never carried the gap and needed no change of its own. Recorded
as a closed finding rather than deleted, on the same rule that keeps a
correction visible in `docs/log.md` — silently removing a note that turned out
to be fixable reads as though the map never caught it.
