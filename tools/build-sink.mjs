#!/usr/bin/env node
//
// Assembles kitchen-sink.html from sink/*.html fragments.
//
// One fragment per component keeps 75 sections editable in isolation and keeps the
// nav in sync automatically — a hand-maintained nav for 75 entries drifts the first
// time a section is renamed.
//
// Order comes from sink/ORDER; anything not listed there is appended alphabetically
// and reported, so a new fragment can never be silently invisible.
//
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';

const frags = readdirSync('sink').filter(f => f.endsWith('.html')).map(f => f.replace(/\.html$/, ''));
const order = existsSync('sink/ORDER')
  ? readFileSync('sink/ORDER', 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'))
  : [];
const known = order.filter(o => frags.includes(o));
const extra = frags.filter(f => !order.includes(f)).sort();
if (extra.length) console.log(`  not in sink/ORDER, appended: ${extra.join(' ')}`);
const missing = order.filter(o => !frags.includes(o));
if (missing.length) console.log(`  in ORDER but no fragment yet: ${missing.length} (${missing.slice(0,8).join(' ')}${missing.length>8?' …':''})`);
const seq = [...known, ...extra];

const titleOf = html => (html.match(/<h2>([^<]+)<\/h2>/) ?? [, '?'])[1];
const idOf = html => (html.match(/id="([^"]+)"/) ?? [, '?'])[1];

const sections = seq.map(n => readFileSync(`sink/${n}.html`, 'utf8').trim());
const sprite = existsSync('assets/icons.svg')
  ? readFileSync('assets/icons.svg', 'utf8').trim()
  : '<!-- no assets/icons.svg; run tools/icons.mjs -->';
// THE NAV IS SORTED AND THE PAGE IS NOT, and the split is the point.
// sink/ORDER groups the page by kind, so the form controls sit together and
// the overlays sit together and a reader comparing two of a kind has them side
// by side. That is worth keeping and it is useless for FINDING one of 68 by
// name, which is what the nav is for. Asked for 2026-09-11 after the whole
// list was read looking for one entry. Sorted on the visible TITLE rather than
// the fragment name, because the title is what is on screen to scan --
// `combo-button` and `Combo button` sort the same here, but `ui-shell` and
// `UI shell` do not, and the reader only ever sees the second. localeCompare
// so case does not split the alphabet into two runs.
const nav = sections
  .slice()
  .sort((a, b) => titleOf(a).localeCompare(titleOf(b), 'en', { sensitivity: 'base' }))
  .map(s => `      <li class="rux--side-nav__item"><a class="rux--side-nav__link" href="#${idOf(s)}"><span class="rux--side-nav__link-text">${titleOf(s)}</span></a></li>`)
  .join('\n');

// THE EIGHT THEMES, as the profile panel's radio group. Same markup as
// templates/app-shell.html's, generated rather than pasted because the sink
// is generated and a hand-kept copy of eight near-identical blocks drifts.
// White is checked because <html> ships data-theme="white"; js/theme.js
// re-checks whichever one storage holds on load.
const THEME_NAMES = [
  ['white', 'White'], ['g10', 'Gray 10'], ['g90', 'Gray 90'], ['g100', 'Gray 100'],
  ['geist', 'Geist'], ['linear', 'Linear'], ['ant-dark', 'Ant Dark'], ['spotify', 'Spotify'],
];
const THEMES = THEME_NAMES.map(([value, label]) => `          <div class="rux--radio-button-wrapper">
            <input id="rux-theme-${value}" class="rux--radio-button" type="radio" name="rux-theme" value="${value}"${value === 'white' ? ' checked' : ''}>
            <label for="rux-theme-${value}" class="rux--radio-button__label">
              <span class="rux--radio-button__appearance"></span>
              <span class="rux--radio-button__label-text">${label}</span>
            </label>
          </div>`).join('\n');

const page = `<!doctype html>
<html lang="en" data-theme="white">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>rux-ds — kitchen sink</title>
<link rel="icon" href="brand/favicon.svg" type="image/svg+xml">
<link rel="preload" as="font" type="font/woff2" crossorigin href="assets/fonts/IBMPlexSans-Regular-Latin1.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="assets/fonts/IBMPlexSans-SemiBold-Latin1.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="assets/fonts/IBMPlexMono-Regular-Latin1.woff2">
<link rel="stylesheet" href="assets/fonts/plex.css">
<link rel="stylesheet" href="css/rux.css">
<link rel="stylesheet" href="css/rux-theme.css">
<link rel="stylesheet" href="css/rux-overrides.css">
<script src="js/custom-themes.js"></script>
<script src="js/theme.js"></script>
<link rel="stylesheet" href="sink/harness.css">
</head>
<body>

${sprite}

<!-- THE ONE PIECE OF LAYOUT CARBON DOES NOT SHIP, copied from
     templates/app-shell.html with its reasoning intact: .rux--content is
     indented only by a SIBLING side nav, and the nav in this shell lives
     inside the header, so none of Carbon's three rules match. 16rem clears
     the nav and the remaining 2rem is the content's own gutter. Scoped to the
     same breakpoint the nav is, because below it the nav is 0 wide and
     overlays instead. -->
<style>
@media (min-width: 66rem) {
  .rux--content { padding-inline-start: 18rem; }
}
</style>

<header class="rux--header" data-theme="g100" aria-label="rux-ds">
  <a class="rux--skip-to-content" href="#main-content">Skip to main content</a>
  <button type="button" class="rux--header__action rux--header__menu-trigger rux--header__menu-toggle rux--header__menu-toggle__hidden" aria-label="Open menu" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><use href="#i-menu"/></svg></button>
  <a class="rux--header__name" href="portal.html"><img src="brand/logo.svg" alt="" style="height:1.5rem;width:auto;margin-right:.5rem;flex:none"><span class="rux--header__name--prefix">Rux</span>&nbsp;DS</a>
  <nav class="rux--header__nav" aria-label="rux-ds">
    <ul class="rux--header__menu-bar">
      <li><a class="rux--header__menu-item" href="portal.html"><span class="rux--text-truncate-end">Portal</span></a></li>
      <li><a class="rux--header__menu-item rux--header__menu-item--current" href="kitchen-sink.html" aria-current="page"><span class="rux--text-truncate-end">Kitchen sink</span></a></li>
      <li><a class="rux--header__menu-item" href="builder.html"><span class="rux--text-truncate-end">Builder</span></a></li>
      <li><a class="rux--header__menu-item" href="theme-creator.html"><span class="rux--text-truncate-end">Theme creator</span></a></li>
    </ul>
  </nav>
  <div class="rux--header__global">
    <button type="button" class="rux--header__action rux--btn rux--layout--size-lg rux--btn--ghost rux--btn--icon-only" aria-label="Account" aria-expanded="false" aria-controls="rux-account-panel"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><use href="#i-user--avatar"/></svg></button>
    <button type="button" class="rux--header__action rux--btn rux--layout--size-lg rux--btn--ghost rux--btn--icon-only" aria-label="App switcher" aria-expanded="false" aria-controls="rux-switcher-panel"><svg width="20" height="20" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><use href="#i-grid"/></svg></button>
  </div>
  <div class="rux--header-panel" id="rux-switcher-panel">
    <ul class="rux--switcher" aria-label="Applications">
      <li class="rux--switcher__item"><a class="rux--switcher__item-link" href="/rux-ds/" aria-current="page">Design System</a></li>
      <li><hr class="rux--switcher__item--divider"></li>
      <li class="rux--switcher__item"><a class="rux--switcher__item-link" href="/">Home</a></li>
      <li class="rux--switcher__item"><a class="rux--switcher__item-link" href="/rux-ln-notes/">Notes</a></li>
      <li class="rux--switcher__item"><a class="rux--switcher__item-link" href="/rux-scheduler/">Scheduler</a></li>
    </ul>
  </div>
  <!-- THE THEME CONTROL LIVES HERE NOW, and it did not until 2026-09-11.
       Eight data-set-theme buttons sat at the top of the content instead,
       and templates/app-shell.html's own comment recorded that as deliberate —
       "the sink's five buttons stay in harness.js as a demo convenience". rux
       asked for the sink to match every other page, so the convenience is
       withdrawn and the profile panel is the one place a theme is chosen.
       js/profile.js drives the radios and js/theme.js stores the choice, both
       already loaded here. Carbon reserves the header's global actions for
       universal system functions and no capture has a theme button, which is
       why it is in this panel rather than beside the account icon. -->
  <div class="rux--header-panel" id="rux-account-panel">
    <div class="rux--layer-two rux--stack-vertical rux--stack-scale-5">
      <div class="rux--form-item rux--text-input-wrapper">
        <div class="rux--text-input__label-wrapper">
          <label class="rux--label" for="rux-profile-name">Display name</label>
        </div>
        <div class="rux--text-input__field-outer-wrapper">
          <div class="rux--text-input__field-wrapper">
            <input id="rux-profile-name" class="rux--text-input" type="text" autocomplete="nickname" placeholder="Saved in this browser">
          </div>
        </div>
      </div>
      <div class="rux--form-item">
        <fieldset class="rux--radio-button-group rux--radio-button-group--label-right rux--radio-button-group--vertical" id="rux-profile-theme">
          <legend class="rux--label">Theme</legend>
${THEMES}
        </fieldset>
      </div>
      <button type="button" class="rux--btn rux--btn--tertiary" id="rux-profile-sign-in" hidden>Sign in</button>
    </div>
  </div>

  <div class="rux--side-nav__overlay"></div>
  <!-- THE SECTION LIST, WHICH IS WHAT A SIDE NAV IS FOR — the same thing
       portal.html puts in its own, four links there and ${sections.length}
       here. Sorted by title; sink/ORDER still groups the PAGE. No icons: 65
       of the 74 captured side-nav links carry none, so an icon-less link is
       the majority shape rather than an omission, and ${sections.length}
       invented glyphs would be ${sections.length} inventions.

       IT IS TALLER THAN THE LIST IT REPLACES AND THAT WAS MEASURED, not
       discovered afterwards: Carbon's link is a fixed 2rem against the old
       harness row's 19px, so the list goes from 1292px to about 2176px and a
       900px window shows roughly 28 entries where it showed 47. Carbon
       compiles no denser variant. Expandable categories would collapse it —
       app-shell.html demonstrates them — but grouping ${sections.length}
       components is a judgement nobody has made, and sink/ORDER's own
       grouping has already half-rotted at the tail. Flat until then. -->
  <nav class="rux--side-nav__navigation rux--side-nav rux--side-nav--ux" aria-label="Sections">
    <ul class="rux--side-nav__items">
${nav}
    </ul>
  </nav>
</header>

<main id="main-content" class="rux--content ks-main">
  <h1>Kitchen sink</h1>
  <p class="ks-count">${sections.length} sections · every component this system compiles, on one page</p>

${sections.join('\n\n')}
</main>

<!-- Phase 5 behaviour layer. The kernel loads FIRST; modules delegate to it.
     These are the system's, not the sink's — a page from templates/ loads the
     same two files. sink/harness.js is scaffolding for whatever Phase 5 has
     not reached yet, and shrinks with every module that lands. -->
<script src="js/overlay.js"></script>
<script src="js/popover.js"></script>
<script src="js/menu.js"></script>
<script src="js/list-box.js"></script>
<script src="js/date-picker.js"></script>
<script src="js/copy-button.js"></script>
<script src="js/tabs.js"></script>
<script src="js/accordion.js"></script>
<script src="js/data-table.js"></script>
<script src="js/form-controls.js"></script>
<script src="js/ui-shell.js"></script>
<script src="js/dismiss.js"></script>
<script src="js/tile.js"></script>
<script src="js/scroll-gradient.js"></script>
<script src="js/modal.js"></script>
<script src="js/profile.js"></script>
<script src="sink/harness.js"></script>
</body>
</html>
`;
writeFileSync('kitchen-sink.html', page);
console.log(`  kitchen-sink.html — ${sections.length} sections, ${(page.length/1024).toFixed(0)} KB`);
