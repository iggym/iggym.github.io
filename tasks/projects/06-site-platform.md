# Site platform: search, RSS, shared tool shell

## Problem
The site now has 10+ tools, essays and 17 content sites. Finding things relies on the Explore dialog's filter, there's no feed for new writing, and each tool page repeats its header, footer and boilerplate by hand.

## Who it's for
Visitors who come back, and me, when adding the next tool.

## MVP scope
- Full-text search across tools, essays and content-site descriptions, from a small JSON index built by a script. Shown in the Explore dialog.
- An RSS/Atom feed for essays and new tools.
- A template for new tool pages (header with Explore and theme toggle, intro, panels, footer, script tags with `?v=`), plus a short checklist in `tasks/README.md`.
- A script that bumps every `?v=` to one value.

## Out of scope
- Moving to a static-site generator. Stay plain HTML on GitHub Pages.

## Acceptance criteria
- [ ] Search finds a tool by a word that appears only in its description.
- [ ] The feed validates in the W3C feed validator.
- [ ] A new tool page made from the template passes the axe audit unchanged.
- [ ] The version script updates every page and nothing else.

## Effort
M

## Builds on
`assets/js/site-map.js`, `assets/css/tool.css`.

## Status
Not started
