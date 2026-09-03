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
#
# Every question offers only what the templates and sink attest; the list of
# what a project can choose, and which layer offers it, is docs/choices.md.
# What THIS script chooses is what a text substitution on a template can do:
# the template, the theme on <html>, the product name in the header, the
# page title and the file name. Which fields, which buttons, which shell
# parts — that is composition, and the rux-ds-page skill does it.
#
# Run from THIS checkout, at a tag. It refuses a dirty tree for sync-ds.sh's
# reason: a pin is a claim about the bytes copied, and a modified tracked
# file makes the claim wrong while looking precise.
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
# docs/starting-a-project.md is the long version.
set -e

HERE="$(cd "$(dirname "$0")/.." && pwd)"
THEMES="white g10 g90 g100 rux"
TEMPLATES="$(ls "$HERE/templates" | sed 's/\.html$//')"

has() { for x in $2; do [ "$x" = "$1" ] && return 0; done; return 1; }
esc() { printf '%s' "$1" | sed 's/[&|\\]/\\&/g'; }

# ---- arguments ------------------------------------------------------------
DIR=""; TPL=""; THEME=""; NAME=""; PREFIX="Rux"; TITLE=""; PAGE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --template) TPL="$2"; shift 2 ;;
    --theme)    THEME="$2"; shift 2 ;;
    --name)     NAME="$2"; shift 2 ;;
    --prefix)   PREFIX="$2"; shift 2 ;;
    --title)    TITLE="$2"; shift 2 ;;
    --page)     PAGE="$2"; shift 2 ;;
    -h|--help)  sed -n '3,15p' "$0"; exit 0 ;;
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

# ---- the pin --------------------------------------------------------------
if [ -n "$(git -C "$HERE" status --porcelain -uno)" ]; then
  echo "rux-ds has uncommitted changes to tracked files; commit them first."
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
OUT="$DIR/vendor/rux-ds"

mkdir -p "$OUT/css" "$OUT/js" "$OUT/assets/fonts"
cp "$HERE/css/rux.css" "$HERE/css/rux.min.css" "$HERE/css/rux-theme.css" "$HERE/css/rux-overrides.css" "$OUT/css/"
mkdir -p "$OUT/templates"
cp "$HERE/templates/"*.html "$OUT/templates/"
cp "$HERE/js/"*.js "$OUT/js/"
cp "$HERE/assets/icons.svg" "$OUT/assets/"
# The typeface is part of the design system: rux.css names IBM Plex Sans and
# carries no @font-face; assets/fonts/plex.css does, and LICENSE.txt ships
# with the font, not beside it.
cp "$HERE/assets/fonts/"* "$OUT/assets/fonts/"

cat > "$OUT/PIN" <<PIN
tag     ${TAG:-(none: a commit between tags)}
commit  $SHA
date    $(date -u +%Y-%m-%dT%H:%M:%SZ)
subject $(git -C "$HERE" log -1 --format=%s)

Written by rux-ds tools/new-project.sh from a clean tree. Re-run it to move
the pin; do not edit anything under vendor/, the next run overwrites it.
CHANGES.md in rux-ds names any class that left between two tags.
PIN

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
  N="$(esc "$NAME")"; P="$(esc "$PREFIX")"; T="$(esc "$TITLE")"
  sed -e 's|"\.\./css/rux\.css"|"vendor/rux-ds/css/rux.css"|' \
      -e 's|"\.\./css/rux-theme\.css"|"vendor/rux-ds/css/rux-theme.css"|' \
      -e 's|"\.\./css/rux-overrides\.css"|"vendor/rux-ds/css/rux-overrides.css"|' \
      -e 's|"\.\./assets/|"vendor/rux-ds/assets/|g' \
      -e 's|"\.\./js/|"vendor/rux-ds/js/|g' \
      -e "s|^<html lang=\"en\" data-theme=\"white\">|<html lang=\"en\" data-theme=\"$THEME\">|" \
      -e "s|<title>[^<]*</title>|<title>$T</title>|" \
      -e "s|name--prefix\">Rux</span>&nbsp;DS|name--prefix\">$P</span>\&nbsp;$N|" \
      -e "s|aria-label=\"Rux DS\"|aria-label=\"$P $N\"|g" \
      "$HERE/templates/$TPL.html" \
  | awk '{ print } /href="vendor\/rux-ds\/css\/rux-overrides\.css"/ { print "<link rel=\"stylesheet\" href=\"rux-theme.css\">"; print "<link rel=\"stylesheet\" href=\"rux-overrides.css\">" }' \
  > "$DIR/$PAGE.html"
  PAGE_NOTE="written from templates/$TPL.html · theme $THEME · '$PREFIX $NAME'"
fi

echo "rux-ds ${TAG:-$(echo "$SHA" | cut -c1-7)} → $DIR"
echo "  vendor/rux-ds/   css $(ls "$OUT/css" | wc -l | tr -d ' ') · js $(ls "$OUT/js" | wc -l | tr -d ' ') · fonts $(ls "$OUT/assets/fonts" | wc -l | tr -d ' ') · templates $(ls "$OUT/templates" | wc -l | tr -d ' ') · PIN"
echo "  rux-theme.css, rux-overrides.css   yours, deltas only; left alone if present"
if [ -n "$MOVE_ONLY" ]; then
  echo "  pages   left alone; pin moved from $OLD_PIN. Name --template or --page to add one"
else
  echo "  $PAGE.html   $PAGE_NOTE"
fi

# The drift report, on every run: what each page's shell carries that the
# vendored template does not, and the reverse. It prints and blocks nothing.
node "$HERE/tools/drift.mjs" "$DIR"
