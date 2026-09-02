#!/bin/sh
#
# Start a project on rux-ds, or move one to a newer pin. Phase 11, roadmap §4.11.
#
#   sh tools/new-project.sh <dir> [template] [page]
#
#   <dir>       the project; created if absent
#   [template]  a name from templates/, default app-shell
#   [page]      the file written, default index (→ <dir>/index.html)
#
# Run from THIS checkout, at a tag. It refuses a dirty tree for sync-ds.sh's
# reason: a pin is a claim about the bytes copied, and a modified tracked
# file makes the claim wrong while looking precise.
#
# THREE KINDS OF FILE, AND THE SCRIPT TREATS THEM DIFFERENTLY.
#   vendor/rux-ds/          rux-ds's. Overwritten on every run; never edit it,
#                           the next run erases the edit and the fix belongs
#                           upstream. PIN says which tag and commit it is.
#   rux-theme.css           the project's, from the first run on. Written only
#   rux-overrides.css       if absent; re-running moves the pin around them.
#   <page>.html             the project's. Written only if absent, from the
#                           template with its five paths pointed at vendor/.
#
# docs/starting-a-project.md is the long version.
set -e

HERE="$(cd "$(dirname "$0")/.." && pwd)"
DIR="${1:?usage: sh tools/new-project.sh <dir> [template] [page]}"
TPL="${2:-app-shell}"
PAGE="${3:-index}"

[ -f "$HERE/templates/$TPL.html" ] || {
  echo "no templates/$TPL.html — the templates are:"
  ls "$HERE/templates" | sed 's/\.html$//; s/^/  /'
  exit 1
}

if [ -n "$(git -C "$HERE" status --porcelain -uno)" ]; then
  echo "rux-ds has uncommitted changes to tracked files; commit them first."
  echo "A pin taken from a dirty tree names the wrong bytes."
  git -C "$HERE" status --short -uno
  exit 1
fi

SHA="$(git -C "$HERE" rev-parse HEAD)"
TAG="$(git -C "$HERE" describe --tags --exact-match 2>/dev/null || true)"
OUT="$DIR/vendor/rux-ds"

mkdir -p "$OUT/css" "$OUT/js" "$OUT/assets/fonts"
cp "$HERE/css/rux.css" "$HERE/css/rux.min.css" "$OUT/css/"
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
  [ -e "$DIR/$f" ] || cp "$HERE/css/$f" "$DIR/$f"
done

if [ -e "$DIR/$PAGE.html" ]; then
  PAGE_NOTE="kept, already there"
else
  sed -e 's|"\.\./css/rux\.css"|"vendor/rux-ds/css/rux.css"|' \
      -e 's|"\.\./css/rux-theme\.css"|"rux-theme.css"|' \
      -e 's|"\.\./css/rux-overrides\.css"|"rux-overrides.css"|' \
      -e 's|"\.\./assets/|"vendor/rux-ds/assets/|g' \
      -e 's|"\.\./js/|"vendor/rux-ds/js/|g' \
      "$HERE/templates/$TPL.html" > "$DIR/$PAGE.html"
  PAGE_NOTE="written from templates/$TPL.html"
fi

echo "rux-ds ${TAG:-$(echo "$SHA" | cut -c1-7)} → $DIR"
echo "  vendor/rux-ds/   css $(ls "$OUT/css" | wc -l | tr -d ' ') · js $(ls "$OUT/js" | wc -l | tr -d ' ') · fonts $(ls "$OUT/assets/fonts" | wc -l | tr -d ' ') · PIN"
echo "  rux-theme.css, rux-overrides.css   yours; left alone if present"
echo "  $PAGE.html   $PAGE_NOTE"
