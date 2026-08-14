# Nashville PBS Lower Thirds Studio

A broadcast graphics generator for Nashville PBS producers. It renders lower
thirds, station IDs, credit rolls, and event graphics as transparent PNGs that
get keyed over video in an NLE or playout system.

**Live:** https://nashvillepbs.github.io/wnpt-lowerthird/
GitHub Pages serves the root `index.html`, which is a byte-for-byte copy of
`dist/index.html`.

## Repo map

| Path | What it is |
|---|---|
| `Nashville PBS - Lower Thirds Studio.dc.html` | **THE SOURCE** |
| `dist/` | Generated bundle — never edit directly |
| `pledge/` | Pledge Graphics — self-contained sibling page, its own vendored runtime (build.md §13.8) |
| `business-essentials/` | Business Essentials — business card + name tag, self-contained sibling page, CMYK vector PDF export (build.md §13.9) |
| `worker/` | Cloudflare Worker, the Airtable proxy |
| `_ds/`, `assets/`, `fonts/` | Design system, artwork, PBS Sans |
| `scripts/` | The dist patcher and its documentation |

## The rule

**Claude Code is the only writer to this repo.** Design is a sketchpad — it can
only hand work forward, and its output must be integrated into the existing
`.dc.html` by hand. It must never export over this folder; its canvas holds a
stale copy and would silently revert committed work.

## Where to look

- `build.md` — decisions, constraints, and the bug queue
- `SESSIONS.md` — the work order and context budget
- `scripts/patch-dist.md` — how to rebuild `dist/`
