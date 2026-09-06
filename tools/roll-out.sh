#!/bin/sh
#
# Move every app in the workspace to one rux-ds tag. docs/verbs.md, verb 4.
#
#   sh tools/roll-out.sh vX.Y.Z              every sibling with a vendor/rux-ds/PIN
#   sh tools/roll-out.sh vX.Y.Z --app name   one of them
#   sh tools/roll-out.sh vX.Y.Z --dry-run    say what would move, move nothing
#
# WHAT IT IS. A loop over `tools/new-project.sh <app> --tag vX.Y.Z`, with the
# checks a person forgets done first and for every target before any target
# changes: the tag resolves here; each app is a git repository, clean, with an
# upstream, and has its own tools/check.mjs to run afterwards. Then one app at
# a time -- export, that app's own check -- stopping at the first failure with
# the exact recovery printed. It never commits, never pushes, and the rux-ds
# clone stays on whatever branch it is on. Notes was on this path by hand
# since 2026-09-02; the hub and Notes are the two it finds.
#
# WHAT IT DOES NOT DO. Read CHANGES.md for you -- a class that LEFT between
# the two tags is the one hazard a green check does not show, and the drift
# report each run prints names what a page's shell lacks; both are read by a
# person before the commit. Discovery is the folders beside this checkout,
# nothing configured: an app with no PIN is not on rux-ds and is not touched.
set -e

HERE="$(cd "$(dirname "$0")/.." && pwd)"
WS="$(dirname "$HERE")"
TAG=""; ONLY=""; DRY=""
while [ $# -gt 0 ]; do
  case "$1" in
    --app)     ONLY="$2"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    -h|--help) sed -n '3,8p' "$0"; exit 0 ;;
    --*)       echo "unknown flag $1"; exit 1 ;;
    *)         TAG="$1"; shift ;;
  esac
done
[ -n "$TAG" ] || { echo "which tag? sh tools/roll-out.sh vX.Y.Z"; exit 1; }

# ---- preflight: everything, before anything -------------------------------
SHA="$(git -C "$HERE" rev-parse --verify -q "refs/tags/$TAG^{commit}" || true)"
[ -n "$SHA" ] || { echo "no tag $TAG in rux-ds; git -C $HERE fetch --tags"; exit 1; }

APPS=""; BAD=0
for pin in "$WS"/*/vendor/rux-ds/PIN; do
  [ -e "$pin" ] || continue
  app="$(cd "$(dirname "$pin")/../.." && pwd)"
  [ "$app" = "$HERE" ] && continue
  name="$(basename "$app")"
  [ -n "$ONLY" ] && [ "$name" != "$ONLY" ] && continue
  from="$(sed -n 's/^tag  *//p' "$pin")"
  why=""
  git -C "$app" rev-parse --git-dir >/dev/null 2>&1 || why="not a git repository"
  [ -z "$why" ] && [ -n "$(git -C "$app" status --porcelain)" ] && why="dirty; commit or stash first, so the vendor diff is the only diff"
  [ -z "$why" ] && ! git -C "$app" rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1 && why="no upstream branch"
  [ -z "$why" ] && [ ! -e "$app/tools/check.mjs" ] && why="no tools/check.mjs to run after the move"
  if [ -n "$why" ]; then
    printf '  %-22s %-8s REFUSED  %s\n' "$name" "$from" "$why"; BAD=$((BAD+1))
  else
    printf '  %-22s %-8s → %s\n' "$name" "$from" "$TAG"
    APPS="$APPS $app"
  fi
done
[ -n "$APPS" ] || { echo "nothing to move: no sibling of $HERE carries vendor/rux-ds/PIN${ONLY:+ named $ONLY}"; exit 1; }
[ "$BAD" -eq 0 ] || { echo ""; echo "$BAD refused; nothing moved. Fix them, or --app one that is ready."; exit 1; }
[ -z "$DRY" ] || { echo ""; echo "dry run: nothing moved."; exit 0; }

# ---- one at a time, stop at the first failure -----------------------------
MOVED=""
for app in $APPS; do
  name="$(basename "$app")"
  echo ""; echo "══ $name"
  sh "$HERE/tools/new-project.sh" "$app" --tag "$TAG"
  echo ""; echo "── $name: node tools/check.mjs"
  if ( cd "$app" && node tools/check.mjs ); then
    MOVED="$MOVED $name"
  else
    echo ""
    echo "$name FAILED its check on $TAG. Nothing is committed. To put it back:"
    echo "    git -C $app checkout -- vendor/ && git -C $app clean -fdq vendor/"
    echo "Moved before it:${MOVED:- none}. Fix the app or the release, then re-run."
    exit 1
  fi
done

echo ""; echo "══ moved to $TAG:$MOVED"
for app in $APPS; do
  echo ""; echo "  $(basename "$app")"; git -C "$app" diff --stat -- vendor/ | sed 's/^/    /'
done
echo ""
echo "  Nothing is committed. Per app: read the drift report above and CHANGES.md"
echo "  between the tags, open the site, then"
echo "    git commit -am 'chore(vendor): Move the pin to rux-ds $TAG' && git push"
