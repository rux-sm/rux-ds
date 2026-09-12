//
// ONE SHELL, EMITTED ONCE, FOR EVERY PAGE THIS REPOSITORY GENERATES.
//
// Written 2026-09-11 because the four pages had four different shells and
// nobody had noticed. Counted before this file existed: portal carried a
// persistent side nav and no account panel, builder and theme-creator carried
// a header menu bar and neither a nav nor a panel, index carried the panel and
// no nav, and kitchen-sink had just been given a collapsible nav and a panel.
// Every one of them was hand-kept in its own generator, so they drifted the
// way four copies of anything drift. A design system's own pages disagreeing
// about the design system's own shell is the specific embarrassment this
// removes.
//
// THE SHAPE, and why each part is the way it is:
//
//   COLLAPSIBLE, NOT PERSISTENT. The toggle carries no
//   `__menu-toggle__hidden`, so the hamburger is on screen at every width, and
//   the nav carries `--side-nav--hidden` and opens over the page.
//   js/ui-shell.js names both configurations and calls this one legitimate;
//   templates/ ship the other. Chosen for these pages because none of them
//   wants a 256px column standing open beside its content.
//
//   THE NAV HOLDS PAGES. IBM's UI shell guidance puts the header at the
//   highest level of navigation and the left panel one tier below it, and says
//   content beneath that tier belongs in tabs within the page rather than in
//   the nav. kitchen-sink.html had its 68 section links in here for an
//   afternoon and portal.html had four anchors into its own page for longer
//   than that; both were the wrong tier. A page's own sections are the page's.
//
//   NO HEADER MENU BAR. The same four links in a bar above the panel that
//   holds them is duplication, and the bar is the part that goes: the panel is
//   where Carbon puts a product's navigation.
//
//   NO 18rem CONTENT OFFSET. `.rux--content` is indented only when a nav sits
//   BESIDE it. This one overlays, so an offset would be a permanent gap next
//   to nothing. templates/app-shell.html keeps its offset because it keeps the
//   persistent shell.
//
// WHAT THIS SHELL COSTS, quoted from js/ui-shell.js rather than rediscovered
// once per page: Carbon tightens the app name to 8px of inline start whenever
// the toggle lacks `__hidden`, at every width and with no media query, so
// check-spacing reports 8px against a capture taken from the persistent shell.
// It is correct and there is no capture of this shell to compare against.
//
// NOT USED BY templates/. Those are worked examples a consumer copies, they
// ship the persistent shell deliberately, and check-parity compares them
// against tools/new-project.sh. Nothing here should reach them.
//

// The four pages, in nav order. Order is deliberate and not alphabetical:
// portal is the front door, the sink is the reference, and the two tools
// follow. `file` is what every page links to — these all sit at the root
// together, so no prefix is needed and none is offered.
export const PAGES = [
  { id: 'portal', file: 'portal.html', label: 'Portal' },
  { id: 'kitchen-sink', file: 'kitchen-sink.html', label: 'Kitchen sink' },
  { id: 'builder', file: 'builder.html', label: 'Page builder' },
  { id: 'theme-creator', file: 'theme-creator.html', label: 'Theme creator' },
];

// The eight themes as the profile panel's radio group, generated rather than
// pasted: eight near-identical blocks copied into four files is four copies to
// forget. White is checked because every page ships `data-theme="white"`;
// js/theme.js re-checks whichever one storage holds on load.
const THEME_NAMES = [
  ['white', 'White'], ['g10', 'Gray 10'], ['g90', 'Gray 90'], ['g100', 'Gray 100'],
  ['geist', 'Geist'], ['linear', 'Linear'], ['ant-dark', 'Ant Dark'], ['spotify', 'Spotify'],
];

const themeRadios = () => THEME_NAMES.map(([value, label]) =>
`          <div class="rux--radio-button-wrapper">
            <input id="rux-theme-${value}" class="rux--radio-button" type="radio" name="rux-theme" value="${value}"${value === 'white' ? ' checked' : ''}>
            <label for="rux-theme-${value}" class="rux--radio-button__label">
              <span class="rux--radio-button__appearance"></span>
              <span class="rux--radio-button__label-text">${label}</span>
            </label>
          </div>`).join('\n');

const navItems = current => PAGES.map(p => {
  const active = p.id === current;
  return `      <li class="rux--side-nav__item${active ? ' rux--side-nav__item--active' : ''}">`
    + `<a class="rux--side-nav__link" href="${p.file}"${active ? ' aria-current="page"' : ''}>`
    + `<span class="rux--side-nav__link-text">${p.label}</span></a></li>`;
}).join('\n');

// `current` is one of PAGES' ids. An id this does not know throws rather than
// emitting a shell with nothing marked current — a nav that never says where
// you are is the failure this whole change is about, and a silent one would be
// worse than a build that stops.
export function shell(current) {
  if (!PAGES.some(p => p.id === current))
    throw new Error(`shell(): unknown page "${current}" — expected one of ${PAGES.map(p => p.id).join(', ')}`);
  return `<header class="rux--header" data-theme="g100" aria-label="rux-ds">
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
${themeRadios()}
        </fieldset>
      </div>
      <button type="button" class="rux--btn rux--btn--tertiary" id="rux-profile-sign-in" hidden>Sign in</button>
    </div>
  </div>

  <div class="rux--side-nav__overlay"></div>
  <nav class="rux--side-nav__navigation rux--side-nav rux--side-nav--ux rux--side-nav--hidden" aria-label="Pages">
    <ul class="rux--side-nav__items">
${navItems(current)}
    </ul>
  </nav>
</header>`;
}
