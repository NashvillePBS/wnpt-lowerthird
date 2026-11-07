# Nashville PBS Lower Thirds Studio

The station's graphics studio. It started as a lower-thirds generator for
Nashville PBS producers and now makes lower thirds, station IDs, credit rolls,
on-air end cards, printed event signs, pledge screens, business cards and name
tags: transparent PNGs keyed over video, full-frame HD and UHD stills, and
print-ready PDFs.

**Live:** https://nashvillepbs.github.io/wnpt-lowerthird/ until the move to
**https://graphics.wnpt.app/** (staff sign-in) completes; `PROGRESS.md` says
where the move stands and `docs/DECISIONS.md` why. GitHub Pages serves the root
`index.html`, which is a byte-for-byte copy of `dist/index.html`; the Worker in
`wrangler.toml` serves the same files at the new address.

## Repo map

| Path | What it is |
|---|---|
| `Nashville PBS - Lower Thirds Studio.dc.html` | **THE SOURCE** |
| `dist/` | Generated bundle — never edit directly |
| `pledge/` | Pledge Graphics — self-contained sibling page, its own vendored runtime (build.md §13.8) |
| `business-essentials/` | Business Essentials — business card + name tag, self-contained sibling page, CMYK vector PDF export (build.md §13.9) |
| `endcards/` | End Cards — on-air endpage, slates and support end card at HD and UHD, sibling page, plain JS (BUILD-graphics.md Part A) |
| `signs/` | Event Signs — printed event signs as 300 dpi PDFs, Letter and Tabloid, sibling page, plain JS (BUILD-graphics.md Part B) |
| `shared/`, `vendor/` | The capture core the two plain-JS generators share, and the vendored libraries with their hashes |
| `templates/signs/` | Arial PowerPoint templates for custom event signs, and their build script |
| `worker/` | Cloudflare Worker, the Airtable proxy |
| `wrangler.toml`, `.assetsignore` | The static-assets Worker that serves this repo at graphics.wnpt.app |
| `_ds/`, `assets/`, `fonts/` | Design system, artwork, PBS Sans |
| `scripts/` | The dist patcher and its documentation |

## The rule

**Claude Code is the only writer to this repo.** Design is a sketchpad — it can
only hand work forward, and its output must be integrated into the existing
`.dc.html` by hand. It must never export over this folder; its canvas holds a
stale copy and would silently revert committed work.

## Where to look

- `build.md` — decisions, constraints, and the bug queue (the studio bundle)
- `BUILD-graphics.md` — the end cards, the event signs and the hosting move
- `PROGRESS.md` — where the current work stands; `shane.md` — what only a person can do
- `docs/DECISIONS.md` — standing decisions and external contracts since November 2026
- `SESSIONS.md` — the work order and context budget
- `scripts/patch-dist.md` — how to rebuild `dist/`; `scripts/verify-graphics.py` — the pixel-read verifier
