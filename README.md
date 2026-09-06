# rux-ds

A framework-free UI kit built from Carbon v11, kept as complete as Carbon's markup
allows, that any of rux's projects vendors as static CSS, HTML and JS. Goal revised
2026-09-01; `docs/roadmap.md` §1 has the decision and the phases it re-scoped.

**An agent starts at `AGENTS.md`, then “Picking this up” below.** [`docs/roadmap.md`](docs/roadmap.md)
is the end goal and the decision log, read when a decision is being reopened. This README is the index: current state, what
is open, and where each rule lives. It does not repeat the roadmap, because a rule
stated twice drifts — which is exactly what happened to the Status block below before
2026-08-28.

`CLAUDE.md` is the routing file an agent loads automatically; it points at the rules
below rather than repeating them. **Phase 6's guide to BUILDING a page is complete** —
`templates/app-shell.html` is the frame, with `table-page.html`,
`form-page.html`, `detail-page.html`, `empty-state.html`, `error-state.html`,
`wizard-page.html`, `dashboard-page.html`, `settings-page.html` and `schedule-page.html`
built on it. The kitchen sink remains the worked
example and `sink/*.html` the markup to copy for a component no template carries.

## Status

**Phase 3 complete — stripped.** Carbon compiles under the `rux` namespace, every
shipped fragment has been diffed against Carbon's own rendered DOM, and the build is
now the keep-set rather than all of Carbon.

**Phase 5 (behaviors) — every module written, exit criterion still open.** `js/` is an
overlay kernel plus popover, menu, list-box, tabs, accordion, data-table, form-controls,
ui-shell, dismiss, tile, modal, copy-button, date-picker, and — since §4.13 — theme and
profile. The count is in the generated table below rather than typed here: this sentence
read "fourteen" from the day `theme.js` and `profile.js` landed until 2026-09-04 —
the drift this README's own opening paragraph warns about. **The markup is the API** —
a page built from a template needs no script of its own. An attribute appears only when
trigger and surface are too far apart for the markup to relate them (`data-rux-open` on
modal and menu); a popover, tooltip or overflow menu needs none. Focus trapping, Escape,
outside press and the stack deciding which surface a press belongs to all come from the
kernel.

What is left of the phase is not code: **a screen-reader pass**. `tools/check-a11y.js`'s
current reading on every page is in `docs/gate-coverage.json`, each finding adjudicated
there with its evidence, and `npm run gates` says whether that reading is still current;
a count copied here read nine, then twelve, then twenty-nine within two days. One reading
was wrong by method rather than markup: the sweep took
focus with a CLICK, which is an outside press, and the kernel removed the calendar the
tool then could not find. The cause is the method, not the markup. But it reads
attributes rather than running an AT. Its focus-ring check does now run in an
automated browser, once the page has focus. See "Picking this up".

**Phase 4 (devendor) is DECLINED while admissions are open, decided 2026-08-31.** It
closes as met-by-measurement rather than met-by-deletion: `css/rux.css` carries zero
`cds`, there are no `dependencies` at all, and a consumer fetches the committed
stylesheet and installs nothing — so the runtime half of the goal already holds. What
steps 1–2 would still buy is tidiness of this repository, at the price §4.4 lists: no
admitting a component, no new icon, no theme change, no version bump. §2.1's amendment
of the same day made admissions the project's job, and the door's price is exactly the
ability to admit.

**Revisit on an explicit freeze**, not on quiet. The
execution order it used to end — 1 → 2 → 3 → 5 → 6 → 4 → 7 → 8 — stands for the rest;
the phase numbers are names, not positions. Roadmap §4.4.

### Picking this up

A fresh clone is the whole handover — nothing lives in an editor session or a
machine-local note. This section is the current state and the next steps only.
Every dated pass, measurement and answered decision that used to sit here is in
`docs/log.md`, and stays there as the record.

**Where this stopped, 2026-09-03.** Phases 9, 10 and 11 are done. Phase 7's
component index is implemented and swept — `npm run gates` holds the
cells: `portal.html` carries a Reference column from `docs/component-docs.json`, every compiled
component accounted for and all 135 URLs live, with `action-set` and
`skeleton-styles` honestly marked as having nothing to link. **Its content has
no gate**, which roadmap §4.7 states and proposes. The plan being
executed is roadmap §4.12, three creators and the hub, now named **Rux Apps**,
and after it §4.13: every theme in every app, a profile everywhere, one
backend. Its first step is the next-steps list below.
Landed: the script questionnaire, `docs/choices.md`, the switcher panel in every
template with its behaviour (`v0.1.1`), and the hub itself, pushed and live at
https://rux-sm.github.io/ since 2026-09-02.

**The hub's repository must be named `rux-sm.github.io`, not after the hub.**
Only `<account>.github.io` publishes at the account root, and the root is the
whole arrangement: every module's shell fetches `/switcher.json` and links
`/switcher.js` by absolute path, and `tools/check.mjs` there requires each
`path` to be `/` or `/name/`. A project repository serves at
`https://rux-sm.github.io/<repo>/` instead, where those two fetches 404 —
silently, because `switcher.js` catches and falls back to the entries the page
shipped. `rux-sm/rux-apps` was created on 2026-09-02 under the wrong name and
renamed to `rux-sm.github.io` the same day, before anything was pushed to it.

**One click of rux's on GitHub remains:** Settings → Pages → Source → GitHub
Actions. GitHub enabled Pages from the branch on the first push, so today both
the branch build and `pages.yml` deploy, and the branch build ignores
`tools/check.mjs`. The token here cannot change it (403 on the Pages API).

**Notes is module two in fact, 2026-09-02** (`48786ce` there): the grid button,
the collapsed panel, and `/switcher.js` filling it from the shared list,
verified live with Notes marked current. Its header reads "Rux Notes" since
the same day, by the naming rule in §4.13. The manifest contract is written
down in §4.12.

**§4.13 step 2 is done, 2026-09-02.** `v0.1.2` is cut and both modules are on
it by `tools/new-project.sh` — the hub at `54d3c4a` there, Notes at `27e69a9`
with its `sync-ds.sh` retired and its theme and overrides files linked. Both
sites verified live: Plex loading from the preloads, the switcher filling from
the root. The same-tag CI check for the hub is drafted as a diff and not
applied; it is rux's to accept.

**§4.13 step 3 is DONE, 2026-09-02/03, tagged `v0.1.3`** (`fd2a6e1`, fixed at
`4a29024`, swept at `8fc08a1`): the account panel in every template and the
sink, every theme offered in it, `js/theme.js` and `js/profile.js`, the first
live rule in `css/rux-overrides.css`, the theme and overrides vendored,
`tools/drift.mjs`. **Both modules are on the tag and it is proved across
them**: a theme and a display name chosen on the hub (`020363a` there) are
what Notes (`44486b8` there) opens with, read live on 2026-09-03.

**ONE SHELL, EVERYWHERE, as of `v0.1.4` 2026-09-03.** The notifications glyph
left the templates as well as both modules: nothing notifies, and an icon-only
button with no handler is an affordance that lies. Two global actions ship, in
Carbon's prescribed order — the switcher and the account. `sink/ui-shell.html`
keeps all three, because that fragment is the capture and a template is what an
app ships. Notes gained the mark, which it alone had never carried. Read live
on both sites: the same 33×30 mark, the same `Rux` prefix, the same two
actions, the same account panel. The three shells now differ in their name and
their nav and nothing else.

**§4.13 step 4 is DONE, 2026-09-03** (`rux-backend` `b95f839`). `rux-backend`
(private, `rux-sm/rux-backend`, not tagged) adopted `rux-ui`
(`udnmqhayzhrbltxzzhjw`) as the one shared Supabase project rather than
provisioning a second — it already backed the bus/trip scheduler.
`platform.profiles` (the cross-app profile, owner-only RLS, keyed to
`auth.users`) is live there, tested 4/4 locally first; `rux-ui`'s own
`public.profiles`, an unrelated driver roster, is untouched. Anonymous
sign-in and manual identity linking are live and confirmed in the
dashboard. The GitHub OAuth App and Cloudflare Turnstile site are created,
`platform` is in the live dashboard's exposed schemas, and
`[auth.external.github]` / `[auth.captcha]` are `enabled = true` in
`config.toml`, pushed and confirmed. Roadmap §4.13 has the full account,
including two `config push` mistakes along the way — one that briefly
reverted MFA/email/search-path settings on the live project, one that
briefly pushed placeholder text as the live `client_id` — both caught from
the diff and corrected before anything downstream used them. Read it
before touching `rux-backend`'s `config.toml` again.

**`v0.1.5`, 2026-09-03: the tile-fill rule reaches every app.** `fd437ae`
promoted the hub's one-class fix into `css/rux-overrides.css`, and no tag
carried it — so the hub kept a private copy of a rule meant to be shared,
and Notes had none. Both modules are on the tag by `tools/new-project.sh`
(hub `75a2cfd`, Notes `57ce558`), the hub's local copy is deleted, and both
drift reports read as they did at `v0.1.4`. Read live the same day at
1280×900: the hub's two cards 152 px each, one flush edge, the rule served
from `vendor/` alone. Notes uses no clickable tile, so nothing rendered
there moves. A patch, by §8.2: `CHANGES.md` gains no line.

**§4.13 step 6 is DONE, 2026-09-03** (hub `68ce1fa`): the landing page is
header-only. The side nav the app-shell template carries held Home and an
anchor to a grid already on screen, so it left with the hamburger, the
scrim and the content-indent `<style>` block; the grid from `switcher.json`
and one Foundations link to the rux-ds repository remain, and Carbon's own
`.rux--header ~ .rux--content` rule places the content. Gated on the served
page with the three page-level browser gates loaded from disk on one origin
— runtime-classes 47/47, a11y 0 findings with rings checked, spacing 27/29
with both remainders older than the change and in the ledger — and read
live the same day. Roadmap §4.13 has the readings and what is not done.

**§4.13 step 5 is DONE, verified live, 2026-09-03**
(`rux-sm.github.io` `bf26c6d`). `account.js` at the hub root: opens an
anonymous Supabase session gated on Turnstile, syncs `platform.profiles`
with the local profile field by field (cloud wins on load, local edits push
up debounced), wires the sign-in button to GitHub `linkIdentity`. Read live
by rux, in a real browser: the anonymous session, the Turnstile gate, and
the profile sync (a name and a theme, both survived a reload) all worked.
One real bug turned up in that same read — `linkIdentity` redirects to
GitHub before Supabase knows whether the identity is free, so
`identity_already_exists` (hit by testing across several anonymous
sessions) only ever surfaces as error params on the return redirect, never
through the promise — fixed by falling back to a direct GitHub sign-in on
that specific error. A second gap the same read found: the panel has no
avatar or name/email swap, so nothing showed whether linking had actually
worked; fixed by only revealing the Sign in button while the session is
still anonymous, so its absence is now the signal. Console-verified after
both fixes: `anonymous: false`, `providers: ['github']`.

**The profile system gained its full page, 2026-09-04**
(`rux-sm.github.io` `ff1ab64`; `rux-ds` `252c652`), beyond the nine steps
§4.13 originally scoped: `/account/` at the hub root, built from
`templates/settings-page.html`'s fieldset pattern rather than the raw
template (the hub's own header-only shell is the correct base, not the
side-nav one settings-page.html demos). Three groups — Profile (a
`user-avatar`, initials and a colour hashed from the user id, beside the
name field), Theme, Connected accounts (a status tag plus connect/sign-out,
reusing `sink/table.html`'s tag markup) — real-time-save through
`window.Rux.profile`, no separate Save/Discard, matching the panel's own
already-verified contract instead of adding a second save model. The
panel gained one link, "Account settings", added by `account.js` rather
than rux-ds's markup — the switcher panel's own contents are JS-filled the
same way, so a hub-specific route has no reason to grow every template.
Found stale in the same pass: `js/profile.js`'s comment claiming Carbon
compiles no avatar component — `user-avatar` was admitted 2026-08-31,
before that comment was written; corrected in place. Verified live:
avatar initials/colour and theme/name sync bidirectionally between panel
and page; one real gap surfaced by testing rather than reasoning — with no
session at all (Turnstile blocked, as it does in an automated pane), the
connected-accounts tag read identically to a genuine unlinked anonymous
session, both "Not connected" — fixed with a distinct "Signed out" state.

**A review pass the same day, 2026-09-04, closed the one real gap that
review found and three smaller ones.** The real one: Notes
(`rux-ln-notes` `437cfd2`) never loaded `account.js` at all — it had the
local profile from the shell rollout but none of the cloud half, no
sign-in, no "Account settings" link, because step 5 only ever named "the
hub root". Fixed with three script tags pointing at the hub's one copy,
no new file there. The three smaller ones, all in `rux-sm.github.io`
`9c1c93f`: the connected-accounts tag now reads "Connected as
`<github-username>`" (`identity_data.user_name`, falling back to email)
rather than a bare "Connected"; signing out gets a helper-text note that
it starts a new anonymous session, rather than doing that silently, with
no native `confirm()` since this codebase uses one nowhere else; and
`rux-backend`'s `config.toml` had `/notes/` in `additional_redirect_urls`
where the real path is `/rux-ln-notes/`, harmless today since `account.js`
always redirects to the bare origin but wrong to leave written down —
corrected, pending `config push`.

**`/account/` gated 2026-09-04**, served from a symlink scratch root
beside `rux-ds`'s `tools/` and `docs/` the way step 6 did it —
`check-runtime-classes` 0 stripped, 2 added (the JS-injected panel link);
`check-a11y` 0 findings with `focusRingChecked: true`, confirmed real by
stripping every ring first (13 findings) and restoring; `check-spacing`
28 of 28 comparable classes matched across the signed-out and connected
states, 0 diverges. Seven classes have no Carbon reference at all to
compare against — this page's own compositions, the same ones its own
header comment already names — so those read "nothing to compare," not
"correct."

**THE LOGO IS ONE FILE, AND `v0.1.6` IS CUT, 2026-09-05.** `brand/logo.svg` is
the mark; every shell in every repository embeds it as
`<img src="brand/logo.svg" alt="" style="height:1.5rem;width:auto;…">` — no
class, so `check-classes` has nothing to resolve, and no build step between the
file and the page. **Swap that one file and every shell follows on reload**: no
markup edit in fourteen places, no re-pin. An `<img>` rather than inline SVG is
what makes the swap free, and it costs nothing that was in use — the shell
header measures `#161616` with `#f4f4f4` text in ALL FOUR themes, so
`currentColor` had exactly one value to carry. Sized by HEIGHT with the width
following, so the file's own aspect governs.

Until 2026-09-04 the mark was inlined geometry copied into every shell, which is
why the hub and Notes had drifted onto different marks with no gate able to see
it. `tools/new-project.sh` seeds `brand/logo.svg` and `brand/favicon.svg` only
when ABSENT — the rule `rux-theme.css` already followed — so moving a pin cannot
clobber a replaced mark. Exercised for the first time on the `v0.1.6` move and
confirmed clean in both consumers.

**rux's drawn mark replaced the placeholder, 2026-09-05** (`ca911fb`), stripped
from a 2150-byte Linearity Curve export to 859 with all 14 `d=` strings byte for
byte what Curve wrote. As exported it was `#000000`, which measures **1.16:1**
on the `#161616` header and is invisible — caught by rendering it, not by
reading it. **THE MARK IS NEUTRAL AND THAT IS THE BRAND RULE**, rux's, 2026-09-05:
gray-10 `#f4f4f4` on any dark surface, gray-100 `#161616` on a light one, and no
brand colour anywhere. The blue favicon shipped for a few hours and was rejected
on sight.

**A favicon ships for the first time**, `brand/favicon.svg`, linked by every page
here and in both consumers; none had one before. It is a separate file from the
logo because a favicon gets no CSS from the page, so the light/dark swap lives
inside it — verified in both emulated schemes, not assumed. `npm run marks` no
longer holds a drawing: it READS `brand/logo.svg`, copies the geometry verbatim,
and emits the favicon plus two app icons (`light`, `dark` — four became two when
blue left, since the blue pair would have been byte-identical to the mono pair).
**Swapping the logo does NOT regenerate them**; that needs `npm run marks` and a
copy to each consumer, which is the one thing the swap does not do for you.

**Brand.svg is the official drawing, confirmed 2026-09-05.** It uses integer
coordinates in a 16x16 viewBox, replacing the earlier 1024-unit drawing.
The cleaned SVG preserves all 86 filled cells and the placement of the export; the favicon
and both neutral app icons were regenerated from it. A cell is 1.5px at the
24px header slot on a 1x display and 3 device pixels on a 2x display. Sizes
16, 32, 48 and 64 align to whole pixels at 1x. The header was opened and
measured at 24x24 on a 2x display; no shell sizing changed. Rux Apps and Rux
Notes now carry matching logo and favicon copies locally; publication is
still pending. [Brand usage](brand/README.md) records
the sizes and which file to use on each surface.

**`--` INSIDE AN XML COMMENT IS ILLEGAL, and it has now cost two rounds.** Such
an SVG serves `200 OK` and renders 0x0 — invisible in a network tab and in the
markup, and reasoning about the file catches neither. It shipped once from
`brand/logo.svg` and once from `make-marks`' own generated comment, four broken
icons found only by opening the page. `tools/make-marks.mjs` now refuses to
write one, proved red before it was trusted. It checks that ONE fault and says
so: node ships no `DOMParser` and nothing is vendored to get one, so an unclosed
tag would still pass.

**Next, in order:**

1. Creator 3, the page builder, `builder.html` here — stages 0 to 9 of its
   plan have landed (markers, the gate, the skeleton round trip, the preview
   2026-09-04; select-and-edit, instance identity, add-and-move on a page
   model, the gate registry, undo with a draft that survives a reload, and
   **export with `check-parity`** 2026-09-05). `npm run gates` reads 41 of 41
   current. **The page can now be taken away**: download it, copy its
   `<main>`, or copy the exact `new-project.sh` command — the script stays the
   one project creator. `tools/check-parity.mjs` runs the script's own
   extracted lines against `exportPage`, 10 templates × 3 answer sets, and
   found a real divergence on its first run (roadmap §4.12). **The content
   panel now reads as content**: every field named by what it is, grouped, with
   its original beside it, a per-field reset, and a link target where the markup
   has one, and **button size and table density are swappable per group**. What
   follows is planned in `docs/builder-guided-plan.md` — the catalogue and its
   map, and the guided mode itself — each stage its own proposal. Roadmap §4.12 item 3 has the account. The tier-2 wiring (`check-blocks` and `npm run builder` in
   `verify`, the registry, the CI staleness list) was proposed as a proven diff
   and landed 2026-09-04 on rux's acceptance.
2. Nothing is pending on the brand. Both consumers are on `v0.1.6` and both
   carry the mark and the favicon; `npm run gates` holds the cells.

**Open, not next in order:** whether `templates/settings-page.html`'s
`col-span-4/8/8` (not full-width) is deliberate or just what the template
happened to ship with — `/account/` copied it verbatim rather than decide.
Now that a live settings-shaped page exists on it, revisit the template
with that as a second reference point, not only the original Carbon
capture.

**Creator 2 is done, 2026-09-02** — the `rux-ds-page` skill's §2, a decision
table of eight rows offering only what `docs/choices.md` lists, naming five
things that are not choices, and gating the result through this root.

**Open decisions, rux's:**

| What | Where |
|---|---|
| The custom theme's accent — a purple placeholder today | `css/rux-theme.css` |

**Two human tasks remain, both with an assistive technology running.**
`docs/screen-reader-pass.md` is the procedure and lists what is already done:

- Flip a toggle, to close the `a5f95c8` fix by ear; it is corroborated by the
  reference and by nothing else.
- Open a modal and a popover: the dialog's name on open, focus landing inside,
  and whether the page behind goes silent. In a focused window — `check-a11y.js`
  refuses its focus-ring check when `document.hasFocus()` is false.

**Current figures are generated, not typed.** The table below is rewritten on
every `npm run verify`; `portal.html` is the component set and `npm run gates`
the browser sweep. The two capture-backed gates print this, re-measured
2026-09-02, still 0 findings on both:

    check-tags      669 stories · 2208 classes · 81 with no reference · 10 known · 0 on a different element
    check-ancestry  669 stories · 550 corroborated ancestries · 84 declined · 0 missing

<!-- STATS:BEGIN -->
| | |
|---|---|
| Components | **77 / 83 compiled** in 80 `@use` lines — `data-table` is four of them — and `docs/inventory.md` decides all 83, which `check-inventory` fails if it stops |
| Themes | 4 — white, g10, g90, g100 — plus `rux`, a token override block in `css/rux-theme.css`, not a compile |
| Tokens · classes | **626** `--rux-*` defined, 10 more read through a fallback · **1,798** `.rux--*` |
| Kitchen sink | **68** sections · **976** classes with `templates/` and `js/` |
| Class coverage | **948 / 1,356 (70%)** — ratcheted in `docs/coverage.json` |
| Spacing scale | 13 `--rux-spacing-*` tokens, demoed in the `spacing` section |
| Markup provenance | **72 `rendered-dom` · 6 `source` · 0 `inferred`** across 78 files |
| Icons | 59 symbols in a 16.1 KB sprite — 51 referenced, 8 nothing points at |
| Size | 1023.9 KB raw · 920.9 KB min · **91 KB gzipped** |
| Behaviour JS | **16** modules · **48 KB gzipped** · 164.6 KB raw, 61% of it comment · 64.9 KB of code |

**Every figure above is generated** by `tools/build-readme.mjs` from
`tools/lib/stats.mjs`, rewritten on every `npm run verify`, and CI fails if the
committed copy is stale — the same contract `css/`, `kitchen-sink.html` and
`portal.html` are already under. Do not edit the table by hand; the next build
overwrites it. The gzipped figures are whole KB on purpose: they are read at
level 9 and the last hundred bytes still depend on the zlib the running Node
bundles, so an exact figure makes the build fail on whichever machine did not
generate it. The tripwires those
sizes run against — 96 KB for `css/`, 60 KB for `js/` — are decisions rather
than measurements and live with their reasoning in `tools/build.mjs`.
<!-- STATS:END -->

Before the strip: **83 components** — Carbon 1.114 added eight to the 75 this project
first stripped, and `docs/inventory.md` has since decided all 83 — 4 themes, 939 KB min,
**94.0 KB gzipped**.

The current component count and disposition summary are generated in `portal.html`.
Roadmap §4.9 owns the admission batches and their state; `docs/inventory.md` owns each
component's decision; `npm run gates` and `docs/gate-coverage.json` own the sweep state.
They are intentionally not repeated here.

## Commands

```bash
npm run verify           # build + assemble sink + class resolution + coverage + provenance
npm run coverage --all   # per-component class coverage, thinnest first
npm run coverage:update  # re-record docs/coverage.json after adding sink markup
npm run ancestry         # wrappers Carbon never omits, with the recorded declines
npm run tags             # class-on-the-wrong-element check, with its KNOWN list
```

**`npm install --ignore-scripts` BEFORE `npm run verify`, after any pull that touches `package.json`** — `npm ci --ignore-scripts` on a fresh clone. The flag skips the `ibmtelemetry` postinstall every `@carbon/*` package carries, as CI does.
`verify` BUILDS `css/rux.css` and `.min.css` from the `@carbon/styles` that is in
`node_modules`, and never compares that against what `package.json` pins. So a stale
install does not fail — it rewrites the committed stylesheet from the OLD Carbon and
exits 0.

Measured 2026-08-31, not hypothetical: `package.json` pinned `^1.114.0`, `node_modules`
still held 1.113.0, and one `verify` reverted 736 lines of `css/rux.css` — dropping the
`any-hover` media queries around the overflow-menu hover rules and a `background-color`
on `.rux--btn--icon-only.rux--btn--ghost:focus`. Exit code 0 throughout, which is the
part worth remembering: **the exit code cannot see this**, and this README's own advice
to trust it over grepping output does not help here.

There is a second cost. All five browser gates declare `css/rux.css` and `js` as inputs,
so a spurious rebuild marks every browser cell DIRTY. That prints and does not fail
the build, but it destroys a `26 current · 0 stale` state that takes a browser and a
person to re-earn. `npm install --ignore-scripts` then `npm run verify` restores `css/` byte-identically
and the cells with it.

| | |
|---|---|
| `npm run build` | `src/app.scss` → `css/rux.css` + `.min.css`, verifies zero `cds` |
| `npm run sink` | assembles `sink/*.html` → `kitchen-sink.html` |
| `npm run icons` | quarries `assets/icons.svg` from `@carbon/icons` |
| `npm run inventory` | per-component classes and size → `docs/inventory.json` |
| `tools/extract/` | quarries Carbon's rendered markup → `docs/carbon-co-classes.json`, `docs/carbon-*-dom.json`, and — via the state recipes in `react-dom.js` — `docs/carbon-react-states.json` (roadmap §4.1.7, §4.1.14). Its `spacing` mode captures COMPUTED box properties instead, folded into a signature table — the one question the markup captures cannot answer |
| `tools/check-icons.mjs --unused` | the sprite's symbols nothing in the shipped sink references; `--deferred` is the ones `sink/deferred/` would need back |
| `tools/check-provenance.mjs --inferred` | the fragments whose markup was never diffed against a reference (roadmap §4.1.13) |
| `tools/diff-fragment.mjs <name> --omissions` | where a fragment's nesting disagrees with Carbon, and what Carbon renders that it omits |
| `npm run serve` | kitchen sink at `http://localhost:8642` |
| `npm run watch` | rebuild CSS on change |

## Layout

| Path | What |
|---|---|
| `src/app.scss` | **The build manifest — this file is the strip.** Roadmap §4.3 |
| `css/` | Build output, generated-and-committed. It was to BECOME the source at Phase 4; that devendor is declined while admissions are open — roadmap §4.4 |
| `js/` | **The behaviour layer.** `overlay.js` is the kernel and loads first; the others delegate to it. Roadmap §4.5 |
| `templates/` | **Runnable page skeletons — Phase 6's deliverable.** Ten of them. Each is a COMPLETE page carrying the shell, not a fragment. Roadmap §4.6 |
| `sink/` | One fragment per component, plus `ORDER`, `harness.css`, `harness.js` |
| `kitchen-sink.html` | Generated — do not edit; edit `sink/` and run `npm run sink` |
| `portal.html` | Generated by `npm run portal` — the component index and disposition summary, plus the Reference column from `docs/component-docs.json`. Its CONTENT has no gate, which roadmap §4.7 states and proposes |
| `builder.html` · `builder/` | **Creator 3, in flight — roadmap §4.12.** The page is generated by `tools/build-builder.mjs`; `builder/builder.js` is its behaviour and is deliberately NOT in `js/`, which is the published set `tools/new-project.sh` vendors into every consumer. `blocks.json` is the marked regions, `rewrites.mjs` the one place a template becomes a page — a plain ES module so the browser and `check-parity` run the same code |
| `assets/icons.svg` | Generated sprite, committed |
| `assets/fonts/` | **IBM Plex Sans and Mono, self-hosted and OPT-IN.** Three woff2 files (Latin1: Sans 400 and 600, Mono 400, ~59 KB) plus `plex.css`, which nothing in `css/rux.css` references — a consumer who does not link it gets Carbon's fallback stack exactly as before. The sink, `portal.html` and all ten templates link it, at `font-display: optional` behind a `<link rel="preload">` per face the page reaches, so a load shows one face and never redraws (2026-09-02; the file says why). Roadmap §4.1.1 left Carbon's `$css--font-face` off because it emits 90 rules at a bundler path that 404s, and named this as the way out; no Carbon file is edited and no flag is flipped. OFL-1.1, licence beside the files |
| `brand/logo.svg` · `brand/favicon.svg` | **The logo. Swap the file; nothing else changes.** Every shell in this repository embeds it as `<img src="brand/logo.svg" alt="" style="height:1.5rem;width:auto;…">` — no class, so `check-classes` has nothing to resolve, and no build step between the file and the page. `<img>` rather than inline SVG is what makes the swap free, and it costs nothing: the shell header measures `#161616` with `#f4f4f4` text in ALL FOUR themes (2026-09-04), so `currentColor` had one value to carry and one colourway serves every theme. Sized by HEIGHT with the width following, so the file's own aspect governs and a square logo lands 24x24. The current drawing is Brand.svg on a 16x16 grid. `tools/new-project.sh` seeds it into a consumer only if absent, the rule `rux-theme.css` and `rux-overrides.css` already follow, so moving a pin cannot clobber a logo you replaced. `favicon.svg` is generated from it by `npm run marks` and carries its own `<style>`, because a favicon gets no CSS from the page; every page now links it, which none did before 2026-09-05. Swapping the logo does NOT regenerate it |
| `assets/brand/` | **Two scalable neutral app icons, generated by `npm run marks`, never hand-edited.** `tools/make-marks.mjs` no longer holds a drawing: it READS `brand/logo.svg` and copies its `d=` strings verbatim, so it cannot round or redraw what was drawn, and a swap plus one `npm run marks` carries everything. `light` (dark ink) and `dark` (light ink), each a single fill on a transparent ground, with the contrast against the surface that name is FOR recorded in the file. The favicon is NOT here — it is `brand/favicon.svg`, project-owned like the logo. The generator refuses to write a `--` inside an XML comment, which twice produced an SVG that served 200 OK and rendered 0x0 |
| `tools/` | `new-project.sh` — the one consumer-facing tool, `docs/starting-a-project.md` · `build` · `build-sink` · `build-portal` · `icons` · `make-marks` · `glyphs` · `inventory` · `measure` · `states` · `check-classes` · `check-tokens` · `check-icons` · `check-glyphs` · `check-slots` · `check-compound` · `check-tags` · `check-ancestry` · `check-coverage` · `check-co-classes` · `check-inventory` · `check-headings` · `check-aria-roles` · `check-provenance` · `check-gates` · `check-controls` · `diff-fragment` · `serve` · and five browser-only: `check-a11y.js`, `check-rendered.js`, `check-runtime-classes.js`, `check-spacing.js`, `check-behaviour.js` |
| `tools/lib/ownership.mjs` | Which component owns a class, which are compiled, what counts as a class name — shared by the gates so there is one definition |
| `tools/lib/sources.mjs` | Which files a gate reads PER FILE — `sink/*.html` + `templates/*.html`, `sink/deferred/` excluded — so a finding names a file you can edit |
| `docs/carbon-react-spacing.json` | **What Carbon COMPUTES, harvested 2026-08-28** — 798 class signatures → box properties → the nearest classed ancestor → the stories each was seen in. The markup captures record structure and say nothing about space; this is the other half. 133 signatures compute more than one way and all variants are kept |
| `AGENTS.md` | **The policy, and it binds every agent.** It classifies every artifact into three tiers before you create or modify it, and lists what to stop on. `CLAUDE.md` routes; this decides. `tools/check-controls.mjs` reports which control files a diff touched, and is deliberately NOT a gate — it asserts nothing about the repository |
| `LICENSE` · `NOTICE` | **Apache-2.0**, decided 2026-08-29. `LICENSE` is upstream's own copy of the text; `NOTICE` names each artefact carrying Carbon-derived material. The attribution in `css/` and `assets/` is written by the BUILD tools, so it survives a rebuild — roadmap §8.1 |
| `docs/roadmap.md` | Canonical plan and decision log |
| `docs/log.md` | **The record** — every dated pass, measurement and answered decision, moved out of "Picking this up" so README could stay current |
| `docs/choices.md` | **What a project can choose** — shapes, shell parts, themes, field style, buttons — each attested, and which layer offers it |
| `docs/operating-card.html` | **The printable two-page card for rux** — the per-session loop across rux-ds, atlas and notes, and the once-per-Mac setup. Not a rux-ds page; no gate reads it |
| `docs/starting-a-project.md` | **How a project starts on a tag** — one command, three kinds of file, how the pin moves |
| `docs/verifying-templates.md` | **How a template's behaviour is checked against a running Carbon page** — and the four wrong answers that came from reading the stylesheet instead |
| `docs/verbs.md` | **The five verbs** — the one command, one check and one place to look for each of the five tasks in this family of repositories; a target marked "not yet" is the next thing to build for that verb. rux's card; the routine, where `AGENTS.md` is the policy |
| `docs/composing-pages.md` §3 · `docs/choices.md` "Where a block may go" | **What the builder's placement evidence means, and what it does not** — a matching container layout says the repository has seen an arrangement like this one, never that this one works |
| `docs/builder-coverage.md` | **What the builder's catalogue holds and what it does not** — one row per shipped sink fragment, every column derived; the table between the markers is generated by `npm run blocks`, the eligibility notes beside it are decisions and `check-blocks` fails if one names a fragment that is gone |
| `docs/audits.md` | **Which whole-project sweeps have been run, and what each did NOT look at** — the ledger only; every finding is filed where its decision lives |
| `reference/` | **Portable agent-tooling material — about agents, not about this kit.** The self-correction and verification loop document, its drop-in `AGENTS.md` tier block, and the adoption-audit prompt. Nothing here ships or is read by a gate; `adoption-audit.md` at the root is this repository's own answer to that prompt, run against `3798331` |
| `carbon-website/` | Gitignored quarry — Carbon's docs, read from, never shipped |

## The one rule

**No Carbon file is ever edited.** Customization is `$prefix`, Carbon's own config
flags, and which components and themes get compiled — nothing else. That keeps
components working as designed, keeps Carbon's documentation accurate, and makes a
Carbon upgrade a version bump rather than a re-merge. Roadmap §1.1.

One documented exception, enforced on every build: `tools/build.mjs` renames
`--cds-grid-*`, which Carbon hardcodes past `$prefix`. Roadmap §4.1.2.

## Gates

None is sufficient alone — roadmap §4.1.2 has the bug that proved it — and `npm run gates` prints how many there are and which page each has been run against.

| Gate | Catches | Blind to |
|---|---|---|
| `build.mjs` namespace check | `cds` leakage into output | anything visual |
| `build-portal.mjs` icon assertion | a `#i-name` emitted into `portal.html` that the sprite has no `<symbol>` for — it caught `#i-katex` on its first run | every page it does not generate; its unit is `portal.html` alone |
| `build-builder.mjs` icon assertion | a `#i-name` emitted into `builder.html` that the committed sprite has no `<symbol>` for | every page it does not generate — its unit is `builder.html` alone, and never the page inside its preview |
| `check-classes.mjs` | a class used in HTML **or `js/`** with no CSS behind it · a class whose component was stripped | a class that resolves but renders wrong |
| `check-tokens.mjs` | a `var(--rux-*)` that resolves to nothing | a token whose *value* moved — `check-token-values` covers the values **declared in `css/rux.css`** and only those |
| `check-token-values.mjs` | a `--rux-*` value that moved, was added or was dropped under a stable name, keyed by the context declaring it | a value that changes only through the CASCADE — it reads what `css/rux.css` declares, not what a browser computes |
| `check-icons.mjs` | a `<use>` pointing at a symbol the sprite does not carry · a fragment referencing the sprite externally or a template referencing it bare · a sprite out of step with `icons.mjs` | whether the symbol DRAWS what its name says — that is `check-glyphs` |
| `check-glyphs.mjs` | a sprite symbol whose geometry is not the glyph its name claims, compared against `@carbon/icons` via the `docs/carbon-glyphs.json` snapshot · a symbol name Carbon has no file for | **which slot** a glyph belongs in — that is `check-slots` |
| `check-slots.mjs` | the WRONG GLYPH in a slot, against `docs/carbon-slots.json` — 33 slots, each backed by 3+ stories or 3+ sibling slots agreeing | 11 slots have no Carbon capture that can answer (reported UNCOVERED, never passed) · 25 more are captured but under the corroboration bar |
| `check-compound.mjs` | two classes Carbon compounds, split across elements | wrong nesting order · missing wrapper |
| `check-tags.mjs` | a class on a different element type than Carbon renders it on | classes no story emits (81 today) |
| `check-ancestry.mjs` | a wrapper Carbon renders in **every** capture, absent here | a wrapper Carbon only sometimes renders |
| `check-coverage.mjs` | a component exercising fewer classes than `docs/coverage.json` records | standing still — it ratchets, it does not set a floor |
| `check-co-classes.mjs` | a modifier used without the base class that styles it | a base class Carbon never pairs |
| `check-inventory.mjs` | a component Carbon ships that `docs/inventory.md` has no row for · a row carrying no disposition · a component `src/app.scss` does not list at all · a disposition the manifest contradicts · **a stub in `sink/deferred/` shadowing a fragment that ships** | whether a disposition is RIGHT — it insists one was made, not that it was wise · whether a stub still deferred is still ACCURATE, which no gate reads |
| `check-headings.mjs` | a page with no heading at all · more than one `h1` · an outline that skips a level. Pages only — `sink/*.html` fragments are specimens, not documents | whether a heading says anything useful · a heading that looks like one and is marked up as a `div` |
| `check-aria-roles.mjs` | a `role` on a `rux--` class Carbon never renders that role on — the first gate to read the captures' attribute data | a role on an unclassed element · a MISSING role · whether required child roles exist · anything turning on `aria-live`, which the extractor does not record |
| `check-blocks.mjs` | a BLOCK or SLOT marker that does not pair, sits above PROVENANCE, encloses a `ks-` class or an inline style, or references an id outside its own region · a `builder/blocks.json` disagreeing with its sources in ANY field, in order, or by a duplicate or a missing template record · a `docs/builder-coverage.md` whose table has drifted, or whose eligibility notes name a fragment that is gone, is already marked, or is named twice · a `builder/guide.json` naming a block or slot that does not exist, leaving a template with no purpose line, recommending a variant value the group refuses, or suggesting a placement whose recorded layout does not match the slot **without saying what is unverified** | whether the marked region is the RIGHT part of the fragment, and whether an unmarked fragment SHOULD be marked — both are readings · **whether a suggestion is good**: it checks the map agrees with the catalogue, never that the advice is sound |
| `check-parity.mjs` | `builder/rewrites.mjs`'s `exportPage` disagreeing with the page-writing lines of `tools/new-project.sh`, for any of the ten templates and any of three answer sets · a substitution added to or removed from the script · the extracted region no longer being findable, which faults rather than passing | everything the script does outside those lines — the vendored tree, the PIN, the questions, the drift report · and **whether either side produces valid HTML**: neither escapes the answers, so a name carrying `" < > &` makes markup both sides agree on byte for byte and no browser reads as intended |
| `check-provenance.mjs` | a fragment that does not say where its markup came from · a template that does not say what its BEHAVIOUR was verified against, with a URL and a date | whether either label is true |
| `check-rendered.js` | default browser chrome · collapsed · escaped elements | anything it has no rule for · a section it has nothing to measure in |
| `check-runtime-classes.js` | a class in the markup that no longer exists once the modules have run — what `check-coverage` counts and nobody sees | anything behind an interaction; it is load-time only |
| `check-spacing.js` | a box property that disagrees with what Carbon computes for the same class set, read from `docs/carbon-react-spacing.json`, reported as **known vs unknown** against an adjudicated list | whether the value is RIGHT — only whether it matches Carbon; a class set neither side renders; and it cannot express POSITION, so a `:last-of-type` element measured against a recorded non-last one is a sampling artifact, not a disagreement |
| `check-behaviour.js` | a behaviour module that stops doing what its own header claims — the state a click produces | anything landing in a microtask: focus destination, focus restoration, the order two surfaces close in |
| `check-a11y.js` | dangling idrefs · composites with many tab stops · unnamed controls · roles missing required state | what a screen reader announces · focus-ring contrast · whether the tab order makes sense · **an ARIA role Carbon never renders** · **a page carrying no heading at all** |

`npm run gates` prints how many gates run in `npm run verify` and how many need a
browser, and which page each browser gate has been run against; the `sink-check`
skill runs the browser ones. Every gate's history — what it was written after, what
its first run found, what was adjudicated and why — is in `docs/log.md`, "Gates".
**None of them catches a component that compiles, resolves, and still renders wrong.**
Only looking does. That is why the kitchen sink exists, and why every phase ends by
looking at it — twice now it has been the only thing that found the bug (roadmap §4.1.2,
§4.1.5).

### The sink is interactive — the system is not, yet

`sink/harness.js` is **down to two demo conveniences that were never component
behaviour**: cancelling in-page anchor jumps so a clickable tile does not throw the
reader up the page, and the theme switcher. Everything else has gone. Modal, popover,
tooltip, menu, overflow menu, list box, tabs, accordion, data table, the form controls
and the UI shell all moved to `js/` with real focus management, keyboard support and
ARIA; the blocks driving CUT or DEFERRED components — copy button, content switcher,
tree view, slider, toggletip, combo box, multiselect — were deleted rather than moved,
because driving markup that is not on the page is code nobody can test and nobody will
delete. **390 lines have become 67.** The phase is done when the file is empty. Roadmap §4.1.8.
