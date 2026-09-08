#!/bin/sh
#
# Move every app in the workspace to one rux-ds tag. docs/verbs.md, verb 4.
#
#   sh tools/roll-out.sh vX.Y.Z              every sibling with a vendor/rux-ds/PIN
#   sh tools/roll-out.sh vX.Y.Z --app name   one of them
#   sh tools/roll-out.sh vX.Y.Z --dry-run    say what would move, move nothing
#
# AN APP THAT ALREADY HOLDS THOSE BYTES IS LEFT ALONE. Since the PIN carries a
# sha256 of the vendored tree, new-project.sh declines a move to a tag whose
# vendored files are identical, so a run can legitimately change nothing. The
# summary separates moved from already-holding and prints a commit command
# only for the first; a run where nothing moved says so and asks for none.
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
# CHANGED AND UNCHANGED ARE NOT THE SAME OUTCOME. Since the pin carries a
# checksum, new-project.sh declines to write when the app already holds the
# bytes the tag carries, so a run can legitimately move nothing. Preflight
# refused every app that was not clean, so anything present afterwards is this
# run's. Read with `status --porcelain`, not `diff`, because a release that
# ADDS a file leaves it untracked and a diff would call that unchanged.
MOVED=""; UNMOVED=""
for app in $APPS; do
  name="$(basename "$app")"
  echo ""; echo "══ $name"
  sh "$HERE/tools/new-project.sh" "$app" --tag "$TAG"
  echo ""; echo "── $name: node tools/check.mjs"
  if ( cd "$app" && node tools/check.mjs ); then
    if [ -n "$(git -C "$app" status --porcelain -- vendor/)" ]; then
      MOVED="$MOVED $name"
    else
      UNMOVED="$UNMOVED $name"
    fi
  else
    echo ""
    echo "$name FAILED its check on $TAG. Nothing is committed. To put it back:"
    echo "    git -C $app checkout -- vendor/ && git -C $app clean -fdq vendor/"
    echo "Moved before it:${MOVED:- none}. Fix the app or the release, then re-run."
    exit 1
  fi
done

echo ""
[ -n "$MOVED" ] && echo "══ moved to $TAG:$MOVED"
[ -n "$UNMOVED" ] && echo "══ already holding these bytes, PIN unchanged:$UNMOVED"
for app in $APPS; do
  name="$(basename "$app")"
  case " $UNMOVED " in
    *" $name "*) echo ""; echo "  $name"; echo "    vendor/ already holds these bytes; PIN unchanged" ;;
    *) echo ""; echo "  $name"; git -C "$app" status --porcelain -- vendor/ | sed 's/^/    /' ;;
  esac
done
echo ""
if [ -z "$MOVED" ]; then
  echo "  NOTHING TO COMMIT. Every app already held the bytes $TAG carries, so each"
  echo "  PIN still names the tag it already named. That is the pin doing"
  echo "  its job: it names bytes, not the newest tag."
else
  echo "  Nothing is committed. For each app under \"moved\" above: read the drift"
  echo "  report and CHANGES.md between the tags, open the site, then"
  # `commit -am` STAGES NO NEW FILE. A release that ADDS a vendored module
  # leaves it untracked, -a skips it, and the commit then carries a PIN whose
  # checksum covers a file the commit does not contain -- so the app fails its
  # own pin check on the next clone or CI run. Measured 2026-09-07: a tag
  # adding one js/ file produced exactly that, app-check exit 1 on the
  # committed tree. Stage the directory, do not rely on -a.
  echo "    git add -A -- vendor/rux-ds && git commit -m 'chore(vendor): Move the pin to rux-ds $TAG' && git push"
fi
