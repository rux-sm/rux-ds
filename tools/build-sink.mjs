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
  .map(s => `    <a href="#${idOf(s)}">${titleOf(s)}</a>`).join('\n');

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

<!-- THE COLLAPSIBLE SHELL, not the persistent one, and js/ui-shell.js names
     both. The toggle carries NO __menu-toggle__hidden, so the hamburger is on
     screen at every width; the nav carries --side-nav--hidden, so it is closed
     until the button opens it over the page. templates/ all ship the other
     one. Chosen 2026-09-11: this page is four pages deep and does not want a
     256px column standing open beside 68 sections.

     SO THERE IS NO 18rem OFFSET HERE. The content is indented only when a nav
     sits BESIDE it; this nav overlays, so an offset would be a permanent gap
     next to nothing. templates/app-shell.html keeps its offset because it
     keeps the persistent shell.

     WHAT THIS SHELL COSTS, quoted from js/ui-shell.js rather than rediscovered:
     Carbon tightens the app name to 8px of inline start whenever the toggle
     lacks __hidden, at every width and with no media query, so check-spacing
     reports 8px against a capture taken from the persistent shell. It is
     correct and there is no capture of this shell to compare against. -->
<header class="rux--header" data-theme="g100" aria-label="rux-ds">
  <a class="rux--skip-to-content" href="#main-content">Skip to main content</a>
  <button type="button" class="rux--header__action rux--header__menu-trigger rux--header__menu-toggle" aria-label="Open menu" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><use href="#i-menu"/></svg></button>
  <a class="rux--header__name" href="portal.html"><img src="brand/logo.svg" alt="" style="height:1.5rem;width:auto;margin-right:.5rem;flex:none"><span class="rux--header__name--prefix">Rux</span>&nbsp;DS</a>
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
  <!-- THE PAGES, WHICH IS WHAT A LEFT PANEL HOLDS. IBM's UI shell left panel
       usage puts the header at the highest level of navigation and the left
       panel one tier below it, and says content BENEATH that tier belongs in
       tabs within the page rather than in the nav. This page's 68 section
       links were in here until 2026-09-11 and that was the wrong tier: they
       are page content, so they are back in the page as the index they always
       were. templates/app-shell.html models the same thing -- its panel holds
       Dashboard, Trips, Invoices, not anchors. -->
  <nav class="rux--side-nav__navigation rux--side-nav rux--side-nav--ux rux--side-nav--hidden" aria-label="Pages">
    <ul class="rux--side-nav__items">
      <li class="rux--side-nav__item"><a class="rux--side-nav__link" href="portal.html"><span class="rux--side-nav__link-text">Portal</span></a></li>
      <li class="rux--side-nav__item rux--side-nav__item--active"><a class="rux--side-nav__link" href="kitchen-sink.html" aria-current="page"><span class="rux--side-nav__link-text">Kitchen sink</span></a></li>
      <li class="rux--side-nav__item"><a class="rux--side-nav__link" href="builder.html"><span class="rux--side-nav__link-text">Page builder</span></a></li>
      <li class="rux--side-nav__item"><a class="rux--side-nav__link" href="theme-creator.html"><span class="rux--side-nav__link-text">Theme creator</span></a></li>
    </ul>
  </nav>
</header>

<main id="main-content" class="rux--content ks-main">
  <h1>Kitchen sink</h1>
  <p class="ks-count">${sections.length} sections · every component this system compiles, on one page</p>

  <!-- THE SECTION INDEX, IN THE PAGE WHERE IT BELONGS. Not a shell part and
       not pretending to be one: ks- chrome, 19px rows, sorted by title while
       sink/ORDER groups the page below it. It lived in the left panel for one
       afternoon and Carbon's own guidance says that tier is for pages. -->
  <nav class="ks-index" aria-label="Sections">
${nav}
  </nav>

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
