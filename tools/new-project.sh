#!/bin/sh
#
# Start a project on rux-ds, or move one to a newer pin. Phase 11, roadmap §4.11.
#
#   sh tools/new-project.sh                       asks, one question at a time
#   sh tools/new-project.sh <dir> [template] [page]
#   sh tools/new-project.sh <dir> --template table-page --theme g10 \
#                           --name "Orders" --title "Orders" --page orders
#   sh tools/new-project.sh <dir>             on a project that has a PIN:
#                                             moves the pin, asks nothing,
#                                             writes no page
#   sh tools/new-project.sh <dir> --tag vX.Y.Z   the same, from that tag's
#                                             tree, this clone staying where
#                                             it is; refuses a tag not on origin
#   sh tools/new-project.sh <dir> --path /name/  the app's path under the
#                                             account root (default: /<dir>/),
#                                             used once, for the switcher
#
# Every question offers only what the templates and sink attest; the list of
# what a project can choose, and which layer offers it, is docs/choices.md.
# What THIS script chooses is what a text substitution on a template can do:
# the template, the theme on <html>, the product name in the header, the
# page title and the file name. Which fields, which buttons, which shell
# parts — that is composition, and the rux-ds-page skill does it.
#
# Run from THIS checkout. Without --tag it vendors the working tree and
# refuses a dirty one for sync-ds.sh's reason: a pin is a claim about the
# bytes copied, and a modified tracked file makes the claim wrong while
# looking precise. With --tag the tree is not read at all.
#
# THREE KINDS OF FILE, AND THE SCRIPT TREATS THEM DIFFERENTLY.
#   vendor/rux-ds/          rux-ds's. Overwritten on every run; never edit it,
#                           the next run erases the edit and the fix belongs
#                           upstream. PIN says which tag and commit it is.
#                           Since 2026-09-02 (roadmap §4.13) it also carries
#                           css/rux-theme.css and css/rux-overrides.css — the
#                           canonical theme and rules, the same in every app —
#                           and templates/, for the drift report below.
#   rux-theme.css           the project's OWN deltas, linked after the vendored
#   rux-overrides.css       pair. Written only if absent, and written EMPTY but
#                           for a header; re-running moves the pin around them.
#   <page>.html             the project's. Written only if absent, from the
#                           template with its five paths pointed at vendor/
#                           and the two project links added after them.
#
# AFTER A PIN MOVE THE DRIFT REPORT RUNS: tools/drift.mjs compares each page's
# shell to the vendored template and prints what differs. It blocks nothing;
# a page is the project's, and the report is what says a shell change upstream
# has not reached it.
#
# --tag EXPORTS, NEVER CHECKS OUT. Until 2026-09-05 moving a pin meant
# `git checkout vX.Y.Z` here, running this, and `git checkout main` -- the
# third command the one nobody remembers (docs/verbs.md, verb 4). With --tag
# the files come from `git archive` of that tag into a scratch directory, this
# clone stays on whatever it is on, dirty or not, and the PIN names the tag's
# commit. What the tag does not carry -- tools/app-check.mjs before it existed
# -- is not vendored, and the scaffold says so rather than writing a launcher
# into nothing.
#
# THE FIRST RUN SCAFFOLDS. With no PIN in the folder, tools/app-skeleton/ is
# copied in (each file only if absent): the check and serve launchers, the
# hook, the Pages workflow, AGENTS.md. The written page gets its switcher
# entries replaced with Home and this app and /switcher.js linked before
# </body> -- two things the drift report cannot see and verb 3 did by hand.
# That rewrite happens AFTER the page-writing region check-parity extracts,
# because the builder's export does not do it: the builder makes a page, this
# makes an app. Then the new app's own check runs.
#
# docs/starting-a-project.md is the long version.
set -e

HERE="$(cd "$(dirname "$0")/.." && pwd)"
THEMES="white g10 g90 g100 rux"
TEMPLATES="$(ls "$HERE/templates" | sed 's/\.html$//')"

has() { for x in $2; do [ "$x" = "$1" ] && return 0; done; return 1; }
esc() { printf '%s' "$1" | sed 's/[&|\\]/\\&/g'; }

# ---- arguments ------------------------------------------------------------
DIR=""; TPL=""; THEME=""; NAME=""; PREFIX="Rux"; TITLE=""; PAGE=""; TAG_ARG=""; APP_PATH=""
while [ $# -gt 0 ]; do
  case "$1" in
    --template) TPL="$2"; shift 2 ;;
    --theme)    THEME="$2"; shift 2 ;;
    --name)     NAME="$2"; shift 2 ;;
    --prefix)   PREFIX="$2"; shift 2 ;;
    --title)    TITLE="$2"; shift 2 ;;
    --page)     PAGE="$2"; shift 2 ;;
    --tag)      TAG_ARG="$2"; shift 2 ;;
    --path)     APP_PATH="$2"; shift 2 ;;
    -h|--help)  sed -n '3,21p' "$0"; exit 0 ;;
    --*)        echo "unknown flag $1"; exit 1 ;;
    *) if [ -z "$DIR" ]; then DIR="$1"; elif [ -z "$TPL" ]; then TPL="$1"; elif [ -z "$PAGE" ]; then PAGE="$1"; fi; shift ;;
  esac
done

# ---- a project that already has a PIN: move the pin and nothing else ------
# Measured 2026-09-02: re-running with only the folder, as "Moving the pin"
# in docs/starting-a-project.md shows, re-asked the five questions and wrote
# an index.html from app-shell into a project whose page was orders.html.
# A PIN is the proof a project exists. With one present and no template,
# theme, name, title or page named, the run is a pin move; name any of
# those and it is a second page, asked for as before.
MOVE_ONLY=""
if [ -n "$DIR" ] && [ -e "$DIR/vendor/rux-ds/PIN" ] && [ -z "$TPL$THEME$NAME$TITLE$PAGE" ]; then
  MOVE_ONLY=1
  OLD_PIN="$(sed -n 's/^commit  *//p' "$DIR/vendor/rux-ds/PIN" | cut -c1-7)"
fi

# ---- the questions, asked only for what was not given ---------------------
# A numbered list, a default in brackets, Enter takes the default.
ask() { # ask VAR "question" "default" "options or empty"
  _v="$1"; _q="$2"; _d="$3"; _o="$4"
  if [ -n "$_o" ]; then
    i=0; for x in $_o; do i=$((i+1)); printf '  %2d  %s\n' "$i" "$x"; done
  fi
  printf '%s [%s]: ' "$_q" "$_d"
  read -r _a || _a=""
  [ -z "$_a" ] && _a="$_d"
  if [ -n "$_o" ] && [ "$_a" -eq "$_a" ] 2>/dev/null; then
    _a="$(printf '%s\n' $_o | sed -n "${_a}p")"
  fi
  eval "$_v=\"\$_a\""
}
if [ -z "$DIR" ]; then
  echo "rux-ds: a new project. Enter takes the default."
  ask DIR "Folder for the project" "$HOME/Developer/my-app" ""
fi
if [ -z "$MOVE_ONLY" ]; then
if [ -z "$TPL" ]; then
  echo "The page shape — each is a complete page, shell included (docs/choices.md):"
  ask TPL "Template" "app-shell" "$TEMPLATES"
fi
has "$TPL" "$TEMPLATES" || { echo "no templates/$TPL.html; the templates are:"; printf '  %s\n' $TEMPLATES; exit 1; }
if [ -z "$THEME" ]; then
  echo "The DEFAULT theme on <html> -- every page offers all five in its account"
  echo "panel, and a visitor's choice wins; the shell header keeps its own dark one:"
  ask THEME "Theme" "white" "$THEMES"
fi
has "$THEME" "$THEMES" || { echo "no theme $THEME; one of: $THEMES"; exit 1; }
if [ -z "$NAME" ]; then
  echo "The product name in the header, after the '$PREFIX' prefix:"
  ask NAME "Name" "DS" ""
fi
if [ -z "$TITLE" ]; then
  ask TITLE "Browser tab title" "$PREFIX $NAME" ""
fi
if [ -z "$PAGE" ]; then
  ask PAGE "File name, without .html" "index" ""
fi
fi

# A first run is the one with no PIN yet: it scaffolds (below). Decided here,
# before anything is written, so a run that fails halfway cannot look like one.
NEW_APP=""
[ -e "$DIR/vendor/rux-ds/PIN" ] || NEW_APP=1

# ---- the source: this tree, or a tag's ------------------------------------
SCRATCH=""; NEW=""
# Whatever the exit, nothing half-built is left behind: not the export, and
# not a vendor/rux-ds.new that never got its move.
cleanup() { rm -rf ${SCRATCH:+"$SCRATCH"} ${NEW:+"$NEW"}; }
trap cleanup EXIT
if [ -n "$TAG_ARG" ]; then
  # A TAG, RESOLVED AND NEVER CHECKED OUT. rev-parse refuses a branch, a bare
  # commit or a typo; ^{commit} peels an annotated tag to what it names.
  SHA="$(git -C "$HERE" rev-parse --verify -q "refs/tags/$TAG_ARG^{commit}" || true)"
  if [ -z "$SHA" ]; then
    echo "no tag $TAG_ARG in rux-ds. git -C $HERE fetch --tags, or the tags are:"
    git -C "$HERE" tag | sed 's/^/  /'
    exit 1
  fi
  TAG="$TAG_ARG"
  # ON ORIGIN, NOT ONLY LOCAL, for the reason the branch check below gives:
  # a tag pushed from one Mac and not the other names nothing there. Asked of
  # origin directly; when origin cannot be reached that is said, not assumed.
  RC=0; git -C "$HERE" ls-remote --exit-code --tags origin "refs/tags/$TAG" >/dev/null 2>&1 || RC=$?
  if [ "$RC" -eq 2 ]; then
    echo "tag $TAG is not on origin. git -C $HERE push origin $TAG first."
    exit 1
  elif [ "$RC" -ne 0 ]; then
    echo "note: origin unreachable; whether $TAG is pushed was not checked"
  fi
  SCRATCH="$(mktemp -d)"
  git -C "$HERE" archive --format=tar "$TAG" css js assets templates | tar -x -C "$SCRATCH"
  if git -C "$HERE" cat-file -e "$TAG:tools/app-check.mjs" 2>/dev/null; then
    git -C "$HERE" archive --format=tar "$TAG" tools/app-check.mjs tools/serve.mjs .githooks/commit-msg | tar -x -C "$SCRATCH"
  fi
  SRC="$SCRATCH"
else
  if [ -n "$(git -C "$HERE" status --porcelain -uno)" ]; then
    echo "rux-ds has uncommitted changes to tracked files; commit them first,"
    echo "or name a tag: --tag vX.Y.Z takes the files from the tag, not the tree."
    echo "A pin taken from a dirty tree names the wrong bytes."
    git -C "$HERE" status --short -uno
    exit 1
  fi
  # PUSHED, NOT ONLY CLEAN. A pin names a commit; if the other machine never
  # receives it, the pin names nothing there. Measured 2026-09-02: the portal
  # sat committed and unpushed on one Mac while the README on the other pointed
  # at it. Compared against the last fetch, which is the best a local check has.
  UP="$(git -C "$HERE" rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)"
  if [ -z "$UP" ]; then
    echo "note: rux-ds has no upstream branch; pushed-ness not checked"
  elif [ "$(git -C "$HERE" rev-list --count "$UP..HEAD")" != "0" ]; then
    echo "rux-ds has commits not on $UP. Push them first -- a pin that names an"
    echo "unpushed commit names nothing on the other machine."
    exit 1
  fi
  SHA="$(git -C "$HERE" rev-parse HEAD)"
  TAG="$(git -C "$HERE" describe --tags --exact-match 2>/dev/null || true)"
  SRC="$HERE"
fi

# ---- the pin --------------------------------------------------------------
# BUILT BESIDE, THEN SWAPPED. Copying over the old directory left behind any
# file a release had dropped, so vendor/ could carry a module no tag shipped.
# Now vendor/rux-ds is exactly the release: staged complete, then put in
# place in one move, and a failure before the move changes nothing.
OUT="$DIR/vendor/rux-ds"
NEW="$OUT.new"
rm -rf "$NEW"
mkdir -p "$NEW/css" "$NEW/js" "$NEW/assets/fonts" "$NEW/templates"
cp "$SRC/css/rux.css" "$SRC/css/rux.min.css" "$SRC/css/rux-theme.css" "$SRC/css/rux-overrides.css" "$NEW/css/"
cp "$SRC/templates/"*.html "$NEW/templates/"
cp "$SRC/js/"*.js "$NEW/js/"
cp "$SRC/assets/icons.svg" "$NEW/assets/"
# The typeface is part of the design system: rux.css names IBM Plex Sans and
# carries no @font-face; assets/fonts/plex.css does, and LICENSE.txt ships
# with the font, not beside it.
cp "$SRC/assets/fonts/"* "$NEW/assets/fonts/"
# The app's launchers point here (tools/app-skeleton): the shared check, the
# server, the commit hook. Vendored as a set, and only from a release that has
# the check -- a tag from before 2026-09-05 has none, and the scaffold says so
# below. serve.mjs and the hook existed earlier, but vendoring them alone
# would make a pin move to an old tag add files that tag never shipped as
# an app contract.
if [ -e "$SRC/tools/app-check.mjs" ]; then
  mkdir -p "$NEW/tools" "$NEW/githooks"
  cp "$SRC/tools/app-check.mjs" "$SRC/tools/serve.mjs" "$NEW/tools/"
  cp "$SRC/.githooks/commit-msg" "$NEW/githooks/"
fi

cat > "$NEW/PIN" <<PIN
tag     ${TAG:-(none: a commit between tags)}
commit  $SHA
date    $(date -u +%Y-%m-%dT%H:%M:%SZ)
subject $(git -C "$HERE" log -1 --format=%s "$SHA")

Written by rux-ds tools/new-project.sh${TAG_ARG:+ from the tag, not the tree}. Re-run it to move
the pin; do not edit anything under vendor/, the next run overwrites it.
CHANGES.md in rux-ds names any class that left between two tags.
PIN
rm -rf "$OUT"
mv "$NEW" "$OUT"

# The logo is the project's, like the two CSS deltas below: seeded once and
# never overwritten, so moving the pin cannot clobber a mark you replaced.
# rux-ds ships a placeholder; swapping brand/logo.svg is the whole procedure.
mkdir -p "$DIR/brand"
[ -e "$DIR/brand/logo.svg" ] || cp "$HERE/brand/logo.svg" "$DIR/brand/logo.svg"
[ -e "$DIR/brand/favicon.svg" ] || cp "$HERE/brand/favicon.svg" "$DIR/brand/favicon.svg"

for f in rux-theme.css rux-overrides.css; do
  [ -e "$DIR/$f" ] || cat > "$DIR/$f" <<DELTA
/* $f -- this project's own, linked after vendor/rux-ds/css/$f, which is
   rux-ds's and is overwritten on every pin move. Only what THIS project changes
   goes here: token values inside a [data-theme] block (rux-theme.css), or
   component rules at Carbon's own specificity with no !important
   (rux-overrides.css). Empty is the normal state. rux-ds AGENTS.md, "Where a
   change goes". */
DELTA
done

# ---- the page: five paths, then the five substitutions --------------------
if [ -n "$MOVE_ONLY" ]; then
  PAGE_NOTE=""
elif [ -e "$DIR/$PAGE.html" ]; then
  PAGE_NOTE="kept, already there"
else
  # The template comes from the SAME tree as the css it links. The region
  # below reads "$HERE/templates" and check-parity extracts it by that text,
  # so in tag mode HERE points at the export for exactly these lines.
  TREE="$HERE"; HERE="$SRC"
  N="$(esc "$NAME")"; P="$(esc "$PREFIX")"; T="$(esc "$TITLE")"
  sed -e 's|"\.\./css/rux\.css"|"vendor/rux-ds/css/rux.css"|' \
      -e 's|"\.\./css/rux-theme\.css"|"vendor/rux-ds/css/rux-theme.css"|' \
      -e 's|"\.\./css/rux-overrides\.css"|"vendor/rux-ds/css/rux-overrides.css"|' \
      -e 's|"\.\./brand/|"brand/|g' \
      -e 's|"\.\./assets/|"vendor/rux-ds/assets/|g' \
      -e 's|"\.\./js/|"vendor/rux-ds/js/|g' \
      -e "s|^<html lang=\"en\" data-theme=\"white\">|<html lang=\"en\" data-theme=\"$THEME\">|" \
      -e "s|<title>[^<]*</title>|<title>$T</title>|" \
      -e "s|name--prefix\">Rux</span>&nbsp;DS|name--prefix\">$P</span>\&nbsp;$N|" \
      -e "s|aria-label=\"Rux DS\"|aria-label=\"$P $N\"|g" \
      "$HERE/templates/$TPL.html" \
  | awk '{ print } /href="vendor\/rux-ds\/css\/rux-overrides\.css"/ { print "<link rel=\"stylesheet\" href=\"rux-theme.css\">"; print "<link rel=\"stylesheet\" href=\"rux-overrides.css\">" }' \
  > "$DIR/$PAGE.html"
  HERE="$TREE"
  PAGE_NOTE="written from templates/$TPL.html · theme $THEME · '$PREFIX $NAME'"

  # ---- the app step: the switcher, and /switcher.js ----------------------
  # A template's switcher lists three invented apps so the panel has something
  # to open on. An app's lists Home and itself; at runtime /switcher.js at the
  # account root replaces the list with the hub's switcher.json and marks the
  # app you are on -- so the entries written here are what a visitor sees only
  # when that fetch fails. Done on the first page of a new app only: a second
  # page copies the first, and a page that exists is never touched.
  if [ -n "$NEW_APP" ] && grep -q 'class="rux--switcher"' "$DIR/$PAGE.html"; then
    [ -n "$APP_PATH" ] || APP_PATH="/$(basename "$DIR")/"
    case "$APP_PATH" in
      /|/*/) ;;
      *) echo "--path must be / or /name/, got $APP_PATH"; exit 1 ;;
    esac
    AP="$(esc "$APP_PATH")"; AN="$(esc "$PREFIX $NAME")"
    awk -v home='      <li class="rux--switcher__item"><a class="rux--switcher__item-link" href="/">Home</a></li>' \
        -v rule='      <li><hr class="rux--switcher__item--divider"></li>' \
        -v self="      <li class=\"rux--switcher__item\"><a class=\"rux--switcher__item-link\" href=\"$AP\" aria-current=\"page\">$AN</a></li>" '
      /class="rux--switcher"/ { print; print home; print rule; print self; skip=1; next }
      skip && /<\/ul>/ { skip=0 }
      !skip { print }
    ' "$DIR/$PAGE.html" | awk '/^<\/body>/ && !done { print "<script src=\"/switcher.js\"></script>"; done=1 } { print }' > "$DIR/$PAGE.html.new"
    mv "$DIR/$PAGE.html.new" "$DIR/$PAGE.html"
    PAGE_NOTE="$PAGE_NOTE · switcher: Home, $APP_PATH · /switcher.js linked"
  fi
fi

# ---- the scaffold, on a first run only -------------------------------------
# tools/app-skeleton/, each file only if absent, four placeholders filled.
# README.md there describes the skeleton and is not part of an app.
SKEL_NOTE=""
if [ -n "$NEW_APP" ]; then
  [ -n "$APP_PATH" ] || APP_PATH="/$(basename "$DIR")/"
  DN="$(esc "$PREFIX $NAME")"; DT="$(esc "${TITLE:-$PREFIX $NAME}")"; DP="$(esc "$APP_PATH")"; DD="$(esc "$(basename "$DIR")")"
  SKEL="$HERE/tools/app-skeleton"
  WROTE=""
  for f in $(cd "$SKEL" && find . -type f ! -name README.md | sed 's|^\./||' | sort); do
    [ -e "$DIR/$f" ] && continue
    mkdir -p "$DIR/$(dirname "$f")"
    sed -e "s|@NAME@|$DN|g" -e "s|@TITLE@|$DT|g" -e "s|@PATH@|$DP|g" -e "s|@DIR@|$DD|g" "$SKEL/$f" > "$DIR/$f"
    [ -x "$SKEL/$f" ] && chmod +x "$DIR/$f"
    WROTE="$WROTE $f"
  done
  SKEL_NOTE="${WROTE:-nothing, all present}"
fi

echo "rux-ds ${TAG:-$(echo "$SHA" | cut -c1-7)} → $DIR${TAG_ARG:+   (exported from the tag; this clone untouched)}"
echo "  vendor/rux-ds/   css $(ls "$OUT/css" | wc -l | tr -d ' ') · js $(ls "$OUT/js" | wc -l | tr -d ' ') · fonts $(ls "$OUT/assets/fonts" | wc -l | tr -d ' ') · templates $(ls "$OUT/templates" | wc -l | tr -d ' ') · PIN$([ -e "$OUT/tools/app-check.mjs" ] && printf ' · tools/app-check.mjs, tools/serve.mjs, githooks/commit-msg')"
echo "  rux-theme.css, rux-overrides.css   yours, deltas only; left alone if present"
echo "  brand/logo.svg, brand/favicon.svg   yours; swap any time, left alone if present"
if [ -n "$MOVE_ONLY" ]; then
  echo "  pages   left alone; pin moved from $OLD_PIN. Name --template or --page to add one"
else
  echo "  $PAGE.html   $PAGE_NOTE"
fi
[ -n "$SKEL_NOTE" ] && echo "  scaffold  $SKEL_NOTE"

# The drift report, on every run: what each page's shell carries that the
# vendored template does not, and the reverse. It prints and blocks nothing.
node "$HERE/tools/drift.mjs" "$DIR"

# ---- a new app's own check, and what is left to a person -------------------
if [ -n "$NEW_APP" ]; then
  echo ""
  if [ -e "$OUT/tools/app-check.mjs" ]; then
    echo "── the app's check: node tools/check.mjs"
    CHECK_RC=0; ( cd "$DIR" && node tools/check.mjs ) || CHECK_RC=$?
  else
    echo "  NOT CHECKED: ${TAG:-this commit} predates tools/app-check.mjs, so tools/check.mjs,"
    echo "  tools/serve.mjs and .githooks/commit-msg point at files vendor/ does not have."
    echo "  Move the pin to a tag that carries them and they start working."
  fi
  echo ""
  echo "  Left to you, in this order (docs/verbs.md, verb 3):"
  echo "    cd $DIR && git init && git config core.hooksPath .githooks"
  echo "    create the repository (gh repo create, once rux has named the app); enable Pages (rux's click)"
  echo "    add {\"name\",\"path\":\"$APP_PATH\",\"description\"} to the hub's switcher.json; node tools/check.mjs there"
  echo "    open the page in every theme, then commit and push both"
fi
