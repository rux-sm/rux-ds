@AGENTS.md

Read `README.md` "Picking this up" first. `docs/roadmap.md` is the decision
log. Skills: `sink-check` for the browser gates, `rux-ds-page` for building
a page.

Consumer-facing work starts with `node tools/exchange.mjs` — every open ask
from the projects built on this one, read from their own frontmatter. A
`SessionStart` hook runs it, so the list is usually already above; run it by
hand when it is not, since the hook is local settings and does not travel.
`docs/consumer-policy.md` is what those projects agreed to.
