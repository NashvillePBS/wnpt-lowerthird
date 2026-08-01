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
| `\` (a literal backslash) | `\\` (two backslashes) |
| `src="assets/…"` on `<img>` | **rewritten to a base64 data URI** |
| a camelCase attribute (`onClick=`, `viewBox=`, …) — **template only** | `sc-camel-` + kebab-case (`sc-camel-on-click=`, `sc-camel-view-box=`) |

The asset-URI row is the one to keep in mind: the template text in the bundle
is *not* verbatim source wherever an asset URL appears. Any patch hunk that
spans an `<img src="assets/...">` line can never match.

The camel-attribute row is the other one, discovered Session 2 (2026-08-01)
and easy to miss because it only shows up when a hunk's context happens to
reach an untouched `onClick=`/`onChange=`/`onInput=`/`onFocus=`/`onBlur=`/
`onDrop=`/`onDragOver=`/`onDragLeave=`/`viewBox=`/etc. attribute. This is
`support.js`'s own `CAMEL_ATTR_RE` (`var CAMEL_ATTR_RE = /(\s)([a-z]+[A-Z][A-Za-z0-9]*)(\s*=)/g;`),
baked into the bundle at Design's build time so the browser's HTML parser
never lowercases these attribute names away. **It applies to the template
markup only — never to the component script.** The two live in one file but
are split by the `<script type="text/x-dc" data-dc-script>` tag; `esc()` locates
that line in the OLD (HEAD) source and only runs the camel rewrite on hunks
above it.

Why the split matters: the same regex shape (`lowercase-then-uppercase
identifier`, optionally followed by whitespace, then `=`) also matches a
plain JS class-field arrow function — `closeTips = () => {...}` fits it just
as well as `onClick="..."` does. Applying the rewrite unscoped turned that
line into `sc-camel-close-tips = () => {...}`, a syntax error that the
bundle's own `new Function(...)` eval threw on load (caught via
`read_console_messages`, not by the patcher — it wrote successfully because
the *substitution* was syntactically valid text, just wrong for the script
half of the file). If a future hunk's context must span the
`<script data-dc-script>` boundary itself, treat that as a sign the hunk is
too wide, not as a reason to widen the camel rewrite's scope.

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

Session 2 hit the same class of problem twice more, both resolved by
extending `esc()` rather than working around it (see the encoding table
above): a hunk near an untouched `onClick=` attribute refused at `ctx=1` with
zero matches (the camel-attribute rewrite), and a hunk touching the `api()`
method's `/\/+$/` regex literal hit the backslash assert that used to abort
outright. Both are now handled rather than refused. The one failure mode
Session 2 caused *itself* — applying the camel rewrite to the component
script and corrupting a JS assignment — was not a patcher refusal at all; the
substitution matched cleanly and the file was written. That one only surfaces
by booting the page and reading the console, which is why "verifying the
patched bundle" below is not optional even when the script exits clean.

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
- **The template/script split is positional, not structural.** `esc()` finds
  the `<script type="text/x-dc" data-dc-script>` line once per run and treats
  everything before it as template (camel-rewrite eligible) and everything
  after as script (not). If that tag ever moves, gets renamed, or the file
  grows a second one, the split silently mis-locates — verify by booting the
  page, the same way the corruption described above was actually caught.
- **Backslashes and camelCase attributes are handled, not guessed.** Both
  rules in the encoding table above were empirically verified (2026-07-31 and
  2026-08-01) against this exact `support.js`/Design-export pairing. If a
  future edit introduces a *new* kind of special character or attribute shape
  and `esc()`'s output doesn't match the bundle, don't extend the table by
  guessing — grep the bundle for the surrounding text the way both prior
  discoveries were made (see `CAMEL_ATTR_RE` above), confirm the exact
  transform, then extend `esc()`.
- **Encoding drift.** The escape table is empirical, verified 2026-07-31 and
  2026-08-01 against the Design export of those dates. If Design ever
  regenerates dist with different escaping, the asserts will refuse across
  the board — that's the signal to re-derive the table, not to fight the
  script.
- **dist-airtable/ and dist-cdn/ are not patched.** They are reference builds
  (build.md §11.2) and drift further from source with every patched change.
  Don't reach for them expecting current behavior.
