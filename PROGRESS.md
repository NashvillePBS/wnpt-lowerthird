# PROGRESS.md — the baton between sessions

The history of the studio's earlier sessions is in `SESSIONS.md` ("Completed"). This file starts with
the End Cards build and carries forward from here. Human-only tasks are in `shane.md`; standing
decisions in `docs/DECISIONS.md`; the spec for the November work in `BUILD-graphics.md`.

## Session 3, 2026-11-07: event signs, the shared core, and the move to graphics.wnpt.app

**Status:** complete. Signs built and verified; the studio is live at https://graphics.wnpt.app/ behind
Access and the old address redirects. The picker links End Cards and Event Signs (Shane, 2026-11-07:
"two cards on the studio page"; each page keeps its own internal picker).

Done
- `signs/`: eight printed event signs (welcome, directional with arrow, reserved, registration,
  restrooms, quiet please, photography notice, custom) at Letter and Tabloid, portrait and landscape,
  Navy or white field, one accent; print-ready PDF at 300 dpi written in the browser; 300 dpi PNG.
- `shared/studio-core.js`: the capture pipeline both generators share; `endcards/` moved onto it with
  identical verifier numbers; `vendor/` moved to the repo root.
- `scripts/verify-graphics.py` (was verify-endcards.py): end cards and signs, 22 exports, ALL OK
  (readouts in BUILD-graphics.md §A8 and §B8; samples under `endcards/samples/`, `signs/samples/`).
- `templates/signs/`: the Arial PowerPoint sign templates, Letter portrait and landscape, with the
  build script; QuickLook renders the first slide as designed (not opened in PowerPoint: human click).
- The move (docs/DECISIONS.md 1 to 3), in order: Access application created by wnpt-events
  `access.yml` (run 42398381658: "created graphics.wnpt.app (allow)"); site Worker `wnpt-graphics`
  deployed on the custom domain (version 40d3553a, then 647a1b5e with `.wrangler` ignored); proxy
  deployed with the origin list (9d00fae7), then with the new origin only (b184ae9a); hub tile pushed
  (c72685a) and deployed (28c88286); Pages source switched to `gh-pages` (build 603f386). The first
  attempts at the pushes and deploys were refused by the session's permission mode; Shane answered
  "Let Claude retry" and they went through one step at a time.

Evidence
- Outside: `curl -sI https://graphics.wnpt.app/`, `/endcards/`, `/signs/` answer 302 to
  nashville-pbs.cloudflareaccess.com; DNS was empty before the deploy (no collision).
- Signed in (Shane's Chrome): the picker loads; the Nashville PBS Brand generator's Series picker
  lists series through the proxy from the new origin; End Cards downloaded
  `endpage-tennessee-crossroads-1920x1080.png` (checked in ~/Downloads: 1920×1080 RGBA, opaque);
  Event Signs downloaded `sign-welcome-letter-portrait.pdf` (47,692 bytes; MediaBox 612×792 pt; one
  2550×3300 RGB image; Navy at (100,100), white at the centre). No console errors on either page.
- Proxy CORS after the final deploy: Origin graphics.wnpt.app is echoed; Origin nashvillepbs.github.io
  gets graphics.wnpt.app back (the browser blocks it); `/series` still answers.
- Old address after the Pages switch: `/` serves "Moved · Nashville PBS Lower Thirds Studio" (200);
  `/endcards/`, `/pledge/`, `/fonts/PBSSans.woff2` answer 404 with the same redirect page; in Chrome
  the `/endcards/` bookmark lands on https://graphics.wnpt.app/endcards/.
- Hub: wnpt.app deployed with the Graphics tile at https://graphics.wnpt.app/.

- Picker cards for End Cards and Event Signs added to the studio's Misc grid through
  `scripts/patch-dist.py` (one hunk, ctx=1), `dist/index.html` mirrored to the root, deployed; the
  patched bundle booted locally with both cards and their chevrons rendering, and the cards were
  clicked through on graphics.wnpt.app (see the commit message of the commit that adds this line).

Next
1. Shane's remaining answers (shane.md 4 to 6): sponsor logos on signs, the support card's phone and
   terms line, the photography notice wording.
2. When the brand-site agency tool takes over the Access policy, delete the graphics.wnpt.app entry
   from wnpt-events `scripts/setup-access.mjs` (shane.md 8).
3. Optional: the repository private (shane.md 2); a hostname rename (shane.md 3).

Recommended model for the next session: `sonnet` for the picker card and deploy; the strongest tier
only if a generator changes.

## Session 2, 2026-11-06: End Cards

**Status:** built, verified and pushed (commit 7f66108); superseded by session 3 above for everything
after. Four end-card styles: endpage (tune-in, or funding and credits text), slate (Community rail on
Navy), announcement slate (full Community field with the 50% overlay), support end card (white circle,
VISIT / CALL OR TEXT, generated QR). HD and UHD PNG export through the studio's own capture method;
downloads blocked while any broadcast warning stands. Verifier: 10 of 10 exports inside title-safe,
no line under 40px. Local page check in the built-in browser: renders with no console errors, Download
HD ran and reported the file name (the pane keeps no file; a real download is checked on the deployed
address in session 3's step 2).
