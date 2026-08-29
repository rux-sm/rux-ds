# Audits — what has been swept, and what has not

An audit is a deliberate read of the project as a whole, asking what is missing
rather than whether a known check passes. This file records that the sweep
happened, over what, at what commit — and, the half that matters, **what it did
not look at**.

## What this file is not

**Findings do not live here.** A finding is filed where its decision lives: a
roadmap section, README's "Decisions waiting on you" table, `docs/inventory.md`.
The ledger below carries a one-line pointer to that place and nothing more.

The rule is not tidiness. README already records that a rule stated twice
drifts, and `tools/lib/gates.mjs` records four documents disagreeing over one
word. An audit file holding its own copy of the findings is that defect with a
new filename — it would restate roadmap §4.7 and §4.8 on the day it was written
and contradict them a month later.

## Why this file exists

`docs/gate-coverage.json` was written because a gate never run against a target
is indistinguishable from one that passed. The same hole exists one level up:

**AN AREA NEVER AUDITED IS INDISTINGUISHABLE FROM ONE AUDITED CLEAN.**

An audit's scope statement — "I read the gate registry and CI, I did not run
`npm run verify` and did not open a browser" — is the only thing that separates
those two, and it is the first thing lost when the audit ends. The findings get
filed. The boundary evaporates.

The parallel is exact, and so is the limit `check-provenance` accepts by name:
this file cannot tell whether an entry is honest. It records a claim about a
sweep. Only the person who ran it knows if the sweep was real.

## The surfaces

An entry says which of these it swept. Naming them in advance is what makes
"not covered" mechanical rather than an exercise in remembering.

| | |
|---|---|
| **build** | `src/app.scss`, `package.json`, `.github/workflows/`, the committed-output check |
| **enforcement** | the 14 gates, `tools/lib/gates.mjs`, what each declares itself blind to |
| **behaviour** | `js/` — the modules, and what verifies them |
| **markup** | `sink/`, `templates/`, provenance labels |
| **output** | `css/rux.css`, `kitchen-sink.html`, `assets/icons.svg` |
| **docs** | `README.md`, `CLAUDE.md`, `docs/`, and whether a consumer can find markup |
| **distribution** | licence, version, changelog, how a consumer pins and detects staleness |
| **coverage** | which themes, widths and pages any measurement has actually run at |

## How to run one

1. **Record the commit first.** A finding is about a tree, and the tree moves.
2. **Read, do not assume.** The same rule the gates are built on. `ls` the
   directory before saying a file is missing; `grep` the roadmap before calling
   something unrecorded — most of it is recorded, and the interesting question
   is usually the sequencing rather than the absence.
3. **Separate on-record from unrecorded.** A gap the roadmap already names with
   a rejected alternative is not a finding; re-deriving it is the thing CLAUDE.md
   forbids. Say which phase owns it and move on.
4. **File each finding where its decision lives**, then point at it from here.
5. **Write down what you did not look at.** Not as a caveat — as the entry's
   payload. The next audit starts from it.

---

## Ledger

### 2026-08-29 · `f726cf1` · agent-run, conversational

**Swept:** build · enforcement · docs · distribution · coverage
**Not swept:** behaviour (`js/` read only as line counts, no module internals) ·
markup (no fragment or template read) · output (`css/rux.css` never opened)

**Also not done, and each would change a conclusion below:** `npm run verify`
was not run, so every claim here is structural and none is a pass/fail state.
No page was opened in a browser. `docs/roadmap.md` was read at §4.7, §4.8, §5,
§7 and its section index — 89 KB was not read in full, so "unrecorded" below
means "absent from a targeted grep", not "absent from the roadmap".

| # | Finding | Status | Filed |
|---|---|---|---|
| 1 | No LICENCE or NOTICE; Apache-2.0 material is compiled into committed output | unrecorded | **not yet filed** |
| 2 | `tests/` is empty — 1,942 lines in `js/` have no automated regression net | unrecorded | **not yet filed** |
| 3 | g100 never measured — every browser baseline reads theme white | unrecorded | **not yet filed** |
| 4 | Token value snapshot does not exist | on record, §4.8 | §4.8 — but it runs *after* §4.7 documents the values |
| 5 | No component → fragment → template index for a consumer | on record, §4.7 | §4.7 |
| 6 | No version, no tags, no changelog; consumers pin to a SHA | unrecorded | **not yet filed** |
| 7 | `check-co-classes` prints no path; `check-coverage` has no per-file axis | on record | `gates.mjs` `knownGap` |
| 8 | `dashboard.html` untracked — §4.6 exit evidence outside version control | unrecorded | **not yet filed** |
| 9 | `check-provenance` baseline in `gates.mjs` reads `38 files · 5 source`; a clean-tree run at `f726cf1` returns **39 · 6** | unrecorded | **not yet filed** |

Finding 9 was produced by running `npm run verify` at the end of this sweep —
after the entry above had already recorded that verify was not run. Both
statements stand: the sweep's *findings* were reached without it, and the one
result it did produce is the ninth. It contradicts a `baseline` field in the
gate registry, which is the second kind of figure `gates.mjs` names — a record
with a date, not an assertion — so a stale one is expected and is still worth
correcting at the source.

**The filing is itself incomplete.** Five rows have nowhere to point yet, which
is the honest state and not a formatting gap — filing them means adding rows to
README's decision table or sections to the roadmap, and that is a separate edit
by someone who decides. Until then this ledger is the only record they exist.
