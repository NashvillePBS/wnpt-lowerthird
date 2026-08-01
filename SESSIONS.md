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

Requires one decision from Shane before any code is written:

- Whether logging identifies individuals or stays session-anonymous

`/save` auth is already settled — see build.md §11.6. **No gateway, no shared secret.**
Bot Fight Mode plus a rate-limit rule at the Cloudflare edge, configured in the dashboard,
no application change. Do not re-open this.

Requires a Worker redeploy. Verify the existing endpoints still respond correctly
afterward — a broken `/series` or `/content` takes the whole tool down.

---

## Session 4+ — expansion (§13)

Graphics table, credits saving and editor delivery (§13.6), new generators. **On hold by Shane's decision** until
the bug fixes prove the workflow. Do not begin without his explicit go-ahead.

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
