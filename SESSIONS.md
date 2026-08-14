# SESSIONS.md — Claude Code work order

Sequenced deliberately. **Do not skip ahead.** Session 1 is scoped so it cannot damage
production data; later sessions can. Each session must end with the tool verified
working before the next begins.

---

## Session 0 — repo setup (do this first, before any code)

The repo currently contains only `index.html` (the 2.1 MB generated bundle) plus two
manual `.htmlbck` backups. **There is no source in git.** Nothing can be safely changed
until the Design export is committed.

### 1. Tag the working state — before touching anything

```bash
git tag working-2026-07-31
git push --tags
```

That tag is the way back. `index.html` at the repo root is byte-identical to
`dist/index.html` (md5 `d0da62955a9d73becbee5d002b662c4b`) — verify that hash still
matches before starting, so the baseline is known-clean.

### 2. Unpack the Design export into the repo

**Do not overwrite the existing root `index.html`.** That is the file GitHub Pages serves.

Include:

| Item | Why |
|---|---|
| `_ds/` | Design system tokens + self-hosted PBS Sans |
| `assets/` | Logos, show artwork |
| `build.md` | **Use the version supplied with this file, not the export's copy** |
| `dist/` | The deployed build (§11.2 — keep emitting this one) |
| `dist-airtable/`, `dist-cdn/` | Alternate builds, kept for reference |
| `fonts/` | PBS Sans woff2 |
| `Nashville PBS - Lower Thirds Studio.dc.html` | **THE SOURCE — 164 KB.** Everything else is generated from it |
| `Lower Thirds.dc.html`, `Nashville PBS - Generate Lower Thirds.dc.html`, `Nashville PBS - Lower Thirds (Airtable).dc.html`, `Slice of Community Concept.dc.html` | Earlier iterations, kept for history |
| `support.js` | Generated dc-runtime. Do not edit |
| `worker/lower-thirds-worker.js` | **Currently nowhere in git.** Highest-value missing file |
| `SESSIONS.md`, `.gitignore` | Supplied alongside build.md |

Skip — roughly 37 MB of Design scratch, already covered by `.gitignore`:

- `uploads/` (~34 MB) · `screenshots/` · `exports/` · `.thumbnail`

Result is about 7 MB.

**Easy mistake:** `Nashville PBS - Lower Thirds (Airtable).dc.html` (40 KB) and
`Nashville PBS - Lower Thirds Studio.dc.html` (164 KB) truncate to nearly the same name in
Finder. Sort by size. The 164 KB one is the source.

### 3. Commit

```bash
git add -A
git commit -m "Add Design export: source, worker, design system, handoff docs"
git push
```

Verify afterwards that the live page still loads and that root `index.html` is unchanged.

---

## Context budget — read this first, every session

The repo contains files that will consume an entire context window in one call.

**Never open these:**

| File / folder | Why |
|---|---|
| `dist/index.html` | ~2.1 MB — a single read exhausts the context window |
| `dist-airtable/index.html`, `dist-cdn/index.html` | Generated bundles, same hazard |
| `support.js` | ~66 KB of generated runtime, marked do-not-edit |
| `uploads/`, `screenshots/`, `exports/` | ~40 MB of images, no source value |

**The only source file you need is `Nashville PBS - Lower Thirds Studio.dc.html`**
(~167 KB). It is the source of truth. The `dist/` files are generated from it and will
be overwritten on the next Design sync — editing them does nothing durable.

When you need to locate something in the source, `grep -n` for it first and read the
surrounding lines. Do not read the whole file into context unless you have to.

---

## Session 1 — the three display bugs (SAFE: no data risk)

**Scope: §12.1, §12.2, §12.6. Nothing else.**

These are all client-side rendering and state. They do **not** touch
`worker/lower-thirds-worker.js`, do not require a Worker redeploy, do not change
Airtable schema, and do not go near `POST /save`. Session 1 cannot corrupt the base.

If a fix appears to require a Worker or schema change, **stop and ask Shane** — it means
the bug was misdiagnosed.

### The unifying theme — state this in the fix, not just the code

All three bugs are the same failure: **the on-screen preview disagrees with the
exported PNG.**

build.md §2.2 records that DOM capture was chosen over canvas rendering specifically so
the preview and the export would share one code path — "precisely the bug class we care
most about avoiding on a broadcast tool." These three bugs are erosion of that
guarantee.

Fix them as one invariant, not three tickets: **whatever the producer sees must be what
the PNG contains.** A fix that patches a symptom while leaving the preview and export on
different logic is not complete.

### Verification for session 1

For each fix, compare the on-screen preview against the downloaded PNG directly. Test on
the **deployed URL**, and for §12.6 on a **real phone**, not a resized desktop window.

Do not report success from local testing alone. Every bug in the last two WNPT projects
passed locally and failed on the real target.

### Ending session 1

Rebuild `dist/` from the `.dc.html`, deploy, confirm the live tool still works end to
end — including a real Save collection against a scratch collection — and commit. Only
then move on.

---

## Session 2 — tutorial (§12.3)

UI only, still no data risk. Gate: session 1 verified and deployed — **met, 2026-08-01.**

Scope, exactly: a dismissible first-run walkthrough of the undiscoverable features
listed in build.md §12.3 (Create multiple, Import from content, the Series picker on
Nashville PBS Brand, Light Mode, Slice event focal points, credits `---` page breaks) —
plus the Session-1 "New collection" control, which is new since that list was written.
Dismissal persists in `localStorage` (same place as `lt_worker_url`; pick a key like
`lt_tips_seen`), and a visible "Show tips" control reopens it.

Rules of the road (all already documented — follow, don't re-derive):

- Read the **context budget** section above first. Never open `dist/index.html`.
- The only file to edit is `Nashville PBS - Lower Thirds Studio.dc.html`.
  Template conditionals are `<sc-if value="{{ flag }}">` with **single flags only** —
  no expressions; compute combined conditions as props in the render function.
- Rebuild/deploy loop: `python3 scripts/patch-dist.py` (read `scripts/patch-dist.md`
  FIRST; run it after editing source, BEFORE committing) →
  `cp dist/index.html index.html` → verify locally (serve `dist/`; Airtable calls fail
  locally by design, §11.3) → commit, push → verify on
  https://nashvillepbs.github.io/wnpt-lowerthird/.
- Design may be used to *sketch* the tutorial's look, but its output arrives as markup
  to integrate into the `.dc.html` by hand — never export over the repo (§13.1).
- Do not touch `worker/`, Airtable schema, or anything near `POST /save`.

Done means: tutorial shows on first visit, dismisses and stays dismissed across
reloads, reopens from "Show tips", renders sanely at phone width (the 820px breakpoint
collapses the layout — test at 375px), and the deployed tool's existing flows —
generator, save, credits — are untouched.

---

## Session 3 — usage logging (§12.4)

**First session that touches the Worker and Airtable schema.** Do not start until
sessions 1–2 are confirmed working in production for a few days of real use.

The identify-or-anonymous decision is already made — build.md §12.4, DECIDED: identify
by User Table, gated at load. Read that section before writing any code; it specifies
the table, field IDs, the `GET /people` endpoint shape, and the localStorage persistence.

`/save` auth is already settled — see build.md §11.6. **No gateway, no shared secret,
and no edge bot-filtering either:** the original Bot Fight Mode plan turned out not to
be implementable on a workers.dev address (§11.6 records why, and the upgrade path).
Accepted risk stands. Do not re-open this.

This is the first `wrangler deploy` from the repo — `worker/wrangler.toml` exists; read
its header comment for the pre-deploy checks (login as wnpt.digital, confirm the
compatibility date, and never remove `keep_vars = true`). Verify the existing endpoints
still respond correctly afterward — a broken `/series` or `/content` takes the whole
tool down.

---

## Session 4+ — expansion (§13)

Graphics table, credits saving and editor delivery (§13.6), new generators. **On hold by Shane's decision** until
the bug fixes prove the workflow. Do not begin without his explicit go-ahead.

---

## Pledge Graphics cloud sync — after Session 3, own session

The Pledge Graphics page (`pledge/`, added 2026-08-01 — build.md §13.8) works today on
`localStorage` only. Design's spec for moving it to a shared Airtable-backed queue with
image round-trip is committed verbatim at `pledge/SYNC-SPEC.md`. This is a bigger build
than Session 3's logging (~7 Worker endpoints, attachment uploads, debounced autosave,
offline fallback) — do not fold it into Session 3, and read §13.8's rules first:
`pledge/` has **no bundle and no patcher**; edit `pledge/index.html` directly.

---

## Bug details

All bug specifications live in `build.md` §12. Session 1 covers **§12.1, §12.2, and
§12.6** — read §12.7 first, it explains why those three are one problem rather than three.

---

## Completed

**Session 1 — 2026-08-01, commit `d9729d8`.** All three display bugs shipped and
deployed: §12.1 gates the Secondary placeholder on content (`!hasSec && !hasName`, via a
`secPlaceholder` flag) so named entries show no ghost; §12.2 extracts the reset into
`freshCollectionState()` — which, unlike `enterShow`, preserves the picked Series — runs
it on successful save, and adds a New collection control with an unsaved-work confirm;
§12.6 puts `width:max-content` on the preview capture node so bars keep broadcast
geometry and the existing `scaleToFit` scaler engages below the 820px breakpoint instead
of letting text wrap. Verified on the deployed URL: no ghost on named entries, a real
scratch save to Airtable (`recDwCHIe5OFiDgTn`, "SCRATCH - Session 1 verification (safe
to delete)" — deletable), the post-save reset with the success message naming what was
saved, load-then-escape of an existing collection, Series retention through the reset,
and a 375px viewport where the capture node measured full geometry (682×232) under a
0.49 transform with no reflow. Both follow-ups closed 2026-08-01: Shane measured a Slice
export at exactly 910×320 and confirmed the preview on a real phone. Follow-up commits:
`54a25fb` documented the repo-only workflow (build.md §13.1) and committed the dist
patcher (`scripts/`); `dceaead` added `worker/wrangler.toml` and recorded that edge
bot-filtering cannot attach to workers.dev (build.md §11.6). **Session 1 is fully
closed.**

**Session 2 — 2026-08-01, commits `80bb075` (patcher fix) and `5f2f1a8` (tutorial).**
Shipped the §12.3 first-run tutorial exactly as scoped: a dismissible "A few things worth
knowing" modal covering Create multiple, Import from content, the Series picker on
Nashville PBS Brand, Light Mode, Slice event focal points, and credits `---` page breaks,
plus the Session-1 New collection control. Dismissal persists in `localStorage`
(`lt_tips_seen`), and a "Show tips" control next to the Lower Thirds heading on the
splash screen reopens it. Along the way, patching the tutorial into `dist/` surfaced two
undocumented encoding rules baked into the bundle by Design's build — a camelCase
attribute rewrite (`onClick=` → `sc-camel-on-click=`, matching `support.js`'s own
`CAMEL_ATTR_RE`) and backslash-doubling — neither previously in `patch-dist.py`'s escape
table. A first attempt at the camel-attribute fix applied it indiscriminately and
corrupted the component script (`closeTips = () => {...}` became invalid JS); caught by
booting the page and reading the console, not by the patcher, since the substitution
itself matched cleanly. Fixed by splitting `esc()` at the `<script data-dc-script>`
boundary so the rewrite only touches template hunks, and documented both rules plus the
corruption story in `scripts/patch-dist.md`. Verified on the deployed URL: first visit
shows the tutorial, dismissal survives a reload, "Show tips" reopens it, and the
generator and credits flows are unaffected. **Session 2 is fully closed.**

**Station ID logo/export fixes + tips redesign — 2026-08-05, commits `c85448c`, `6609ec6`,
`7495742`.** Three small fixes from a live-testing session, unrelated to the numbered
sequence above.

`c85448c` — the Station ID PNG export was rendering the PBS "head" mark invisible.
`whiteLogoSVG()` (the inline logo used only for that export path, kept separate from
`assets/NashvillePBS_Logo_Horizontal_White.svg` so the bundle doesn't 404 on it) wrapped
every path in one `fill="#ffffff"` group, so the head icon — which the real asset colors
`#2638C4` to stand out against the white circle behind it — painted white-on-white and
disappeared. Split into two fill groups matching the real asset. Verified by rasterizing
the corrected markup the way the export does and sampling the head icon's pixel color
(`rgb(38,56,196)` = `#2638C4`, not white).

`6609ec6` — exports at `scale > 1` (Nashville PBS Brand's is 4) looked blurry against a
sharp on-screen preview. Root cause traced to the vendored `html-to-image@1.11.11`
source: it rasterizes the node into an SVG `foreignObject` at the node's natural
(unscaled) CSS size, then canvas-stretches that fixed-resolution bitmap by `pixelRatio` —
so a higher `scale` was upscaling a small raster, not actually rendering more detail.
Added `captureAtScale()`: measures the node's natural size, applies a real CSS
`transform: scale()`, and passes the *scaled* size as explicit `width`/`height` options
with `pixelRatio: 1`, so the browser paints text at the target resolution instead of
interpolating it up afterward. Wired into `captureNode` (station/box/station-id bars) and
`renderSlicePng`'s bigger marketing-size variant; the 1920×1080 credits export already
renders at true native size and needed no change. Verified by capturing the real
"Nashville PBS Brand" export through the running app, cropping a glyph, and confirming
tight anti-aliasing edges instead of the wide blur the old code produced.

`7495742` — replaced the Session 2 "Show tips" popup (a dismissible modal, gated on
`localStorage.lt_tips_seen`) with a closed-by-default accordion above the Lower Thirds
heading, using the same collapse pattern as the Collections list (`toggleColl` /
`collOpen`). Dropped the first-visit auto-open and dismissal tracking — the section is
just always there, closed. Session 2's writeup above describes the popup as it existed
then; that UI no longer exists in the code. Verified in the local dist build: closed by
default, expands in place with all seven tips, no console errors.

**Pledge Graphics added — 2026-08-01.** First Design→Code handoff of a whole generator,
integrated per Option B (build.md §13.8): the working app landed verbatim at `pledge/`
with its own vendored `support.js` (newer than the studio's — deliberate), `_ds` hrefs
repointed to the shared repo copy, and a Pledge Graphics card added to the picker's MISC
section linking to it. Verified locally (boots clean from the repo tree, tabs
interactive, all shared `_ds` requests 200, card renders and navigates) and on the
deployed URL. The Airtable cloud-sync spec from the handoff is parked verbatim at
`pledge/SYNC-SPEC.md` for its own session after Session 3. The handoff format (working
`.dc.html` + imported modules + assets + README) is the proven template for future
generators.

**Business Essentials added — 2026-08-13.** Second Design→Code handoff of a whole
generator, integrated on the §13.8 pattern: the app landed at `business-essentials/` with
its own vendored `support.js`, assets, fonts (woff2 + ttf) and `print-colors.json`, its
header restyled to the studio's generator header (Back to main pill, logo / label
lockup), and a Business Essentials card added to the picker's MISC section. Three pieces
of work beyond the drop-in:

*Worker.* `GET /users` and `POST /save-graphic` were added to the existing
`worker/lower-thirds-worker.js` rather than deployed as a second Worker — same base, same
secret, same CORS origin, so one deploy and one token. The handoff's placeholder table
IDs were replaced with the real ones (User Table `tbl7qTD9DIc3itsMj`, Graphics
`tblZKp11zMShtmjIx`) and three of its guessed field names turned out to be wrong against
the base: the attachment field is `Attachments`, the person link is `User Table`, the
archive checkbox is `Archived`. `Graphics Type` is a multiple-select, so it writes as an
array and the Worker validates the value first instead of letting Airtable 422. Deployed
with `wrangler` (`keep_vars` intact); `/series`, `/content` and the new `/users` all
verified against the deployed URL afterwards.

*CMYK vector export.* The handoff's "optional" third task, now done: the 600dpi RGB
raster is gone and the PDF is drawn instead — vector paths for artwork, real text in
embedded PBS Sans TTFs (`@pdf-lib/fontkit`), every colour `PDFLib.cmyk()` from
`print-colors.json`. Geometry is read out of the live preview rather than re-declared, so
the Circle Crop clearances and type floors are inherited from the template by
construction. Artwork is clipped to the BleedBox and pages carry real TrimBox/BleedBox.
Verified on the generated files: only `k`/`K` colour operators and zero image XObjects in
the content streams, correct page/trim/bleed sizes on both outputs, the QR sampling
module-for-module identical to its source SVG out of a rasterised page (0 of 1089
wrong), and a title baseline within 0.17pt of the DOM's.

*Colour discipline.* The `reference/` InDesign JPGs are geometry-accurate but not
colour-accurate — deliberately left out of the repo so a later session can't sample the
shifted blues and "correct" the palette. The warning is recorded in build.md §13.9 and at
the top of `business-essentials/BUILD-NOTES.md`.

Still open: the Airtable automation that checks `Archived` on superseded Graphics rows
(intentionally not the Worker's job), and a real print job through a vendor's RIP.
