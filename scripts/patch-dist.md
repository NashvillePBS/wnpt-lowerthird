# patch-dist.py — mirroring `.dc.html` edits into `dist/index.html`

Read this before touching `dist/`. There is no local bundler (build.md §13.1) —
Design produced the dist builds, and Design is out of the loop now. This script
is how committed source edits reach the deployed bundle.

## How the bundle encodes the source

`dist/index.html` (~2.1 MB, effectively one line — grep it, never open it)
embeds the **entire** `.dc.html` — helmet, template, and component script — as
one escaped JS string:

| In the source | In the bundle |
|---|---|
| `"` | `\"` |
| real newline | the two characters `\n` |
| `</` | `<` followed by `/` (script-tag safety) |
| non-ASCII (curly quotes, em dashes) | raw UTF-8, unescaped |
| `src="assets/…"` on `<img>` | **rewritten to a base64 data URI** |

That last row is the important one: the template text in the bundle is *not*
verbatim source wherever an asset URL appears. Any patch hunk that spans an
`<img src="assets/...">` line can never match.

## How the script works

1. Diff `git show HEAD:<source>` against the worktree `.dc.html` with difflib —
   the hunks are derived, never hand-transcribed, so there is nothing to
   mistype.
2. Merge hunks closer than 3 lines (so overlapping context can't corrupt a
   neighbor) but no wider — small hunks are what keeps them clear of asset
   lines.
3. For each hunk, escape the old text per the table above and require it to
   appear **exactly once** in the bundle. Context grows one line at a time
   (up to 12) until the match is unique.
4. Only after every hunk has matched exactly once is the file written. A count
   of 0 or a never-unique hunk aborts with the offending text printed and
   **nothing written**.

Because the diff base is HEAD, run it **after** editing the source and
**before** committing the source edit. If you committed first, pass the
previous commit as the base by editing `HEAD` in the script for that one run —
or simpler, don't commit until dist is patched and verified.

## The asserts refusing is a feature

During Session 1 the script refused to write **twice** before it was tuned:
once when a hunk's context was so thin (`});`) that it matched three places,
and once when over-eager merging produced a hunk spanning an asset `<img>`
line, which matched nowhere. Both times it printed the offending hunk and
exited without touching the file. That is the designed behavior: a refusal
means *your model of the bundle text is wrong*, and the fix is to look at what
the bundle actually contains — never to force the write, lower the assert to
"replace first match", or hand-edit dist around it.

## Verifying the patched bundle

Byte-level greps are necessary but not sufficient (`grep -c` for the new
identifiers, 0 hits for the old ones). The real proof is booting it:

1. Serve `dist/` locally (`python3 -m http.server -d dist`; there's a
   `dist-preview` entry pattern in `.claude/launch.json`). If the embedded JS
   was corrupted, the page will not render past the splash.
2. Exercise the changed behavior in the served page. Airtable-backed features
   **fail locally by design** — `ALLOW_ORIGIN` CORS, see build.md §11.3 — so
   anything touching the Worker is verified on the deployed URL only.
3. `cp dist/index.html index.html` — GitHub Pages serves the **root** file and
   it must stay byte-identical to `dist/index.html`.
4. Commit, push, wait ~1–2 min for Pages, re-verify on
   https://nashvillepbs.github.io/wnpt-lowerthird/.

## Where it is fragile

- **Asset-adjacent edits.** Editing template lines near an `<img src="assets/…">`
  can pull the rewritten URI into a hunk's context and abort (harmless), or —
  if you edit the asset reference itself — produce a hunk that can't be
  expressed at all. Changing which assets the template uses is a Design-side
  bundling job; the patcher cannot do it.
- **Backslashes.** The escape rules were verified only against text with no
  backslashes; `esc()` asserts on them rather than guess. If a future edit
  introduces one (a regex in the component script, say), verify how the bundle
  encodes it before extending `esc()`.
- **Encoding drift.** The escape table is empirical, verified 2026-07-31
  against the Design export of that date. If Design ever regenerates dist with
  different escaping, the asserts will refuse across the board — that's the
  signal to re-derive the table, not to fight the script.
- **dist-airtable/ and dist-cdn/ are not patched.** They are reference builds
  (build.md §11.2) and drift further from source with every patched change.
  Don't reach for them expecting current behavior.
