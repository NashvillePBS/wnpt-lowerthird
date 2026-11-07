# PROGRESS.md — the baton between sessions

The history of the studio's earlier sessions is in `SESSIONS.md` ("Completed"). This file starts with
the End Cards build and carries forward from here. Human-only tasks are in `shane.md`; standing
decisions in `docs/DECISIONS.md`; the spec for the November work in `BUILD-graphics.md`.

## Session 3, 2026-11-07: event signs, the shared core, and the move prepared

**Status:** signs built and verified; the move to graphics.wnpt.app is prepared end to end but four of
its production steps were refused by this session's permission mode and wait on Shane or a session
that may run them (shane.md 1 to 4, each a pasteable command). Nothing is linked from the studio's
picker yet (Shane's styles answer, shane.md 5).

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
- The move, prepared: `wrangler.toml` (static-assets Worker `wnpt-graphics`, route held off),
  `.assetsignore`, `package.json` with wrangler 4.158; the Worker uploaded with **no route and no
  workers.dev address** (version `ade31ea4`, 105 files); the proxy code and `worker/wrangler.toml` take
  a list of origins (not deployed: refused); the Access entry committed in wnpt-events (not pushed:
  refused); the hub tile committed in wnpt-hub (not pushed: refused); the redirect page prepared on
  the `gh-pages` branch (see the commit message for whether its push went through).
- Docs: BUILD-graphics.md (Parts A to D), docs/DECISIONS.md 1 to 7, README.md repo map, build.md §13.10,
  SESSIONS.md.

Evidence
- Verifier readouts: BUILD-graphics.md §A8, §B8 and the commit message.
- Proxy CORS check against the deployed proxy, before the refused deploy: it still answers the Pages
  origin only (the dashboard variable); the list goes live with shane.md 3.
- `wrangler deploy` of the site Worker: "Uploaded 91 files (14 already uploaded)", "No targets
  deployed" (by design: no route yet).
- Refusals (auto-mode classifier): `git push` to wnpt-events (shared resource), `wrangler deploy` of
  the proxy (production deploy). Not worked around.

Next, in order (shane.md 1 to 4 carry the commands)
1. Create the Access application: push wnpt-events and run its `access.yml` workflow.
2. Switch the route on: uncomment `routes` in `wrangler.toml`, `npm run deploy`, confirm from outside
   (`curl -sI https://graphics.wnpt.app/` answers 302 to nashville-pbs.cloudflareaccess.com) and from a
   signed-in browser (the picker, a lower third export, an end card export, a sign PDF).
3. Deploy the proxy (`npm run deploy:proxy`) and confirm the studio at the new address loads series.
4. Push and deploy the hub; switch the Pages source to `gh-pages`; confirm the old URL redirects; then
   drop the Pages origin from `ALLOW_ORIGIN` and redeploy the proxy.
5. Tell the brand page session the final address (`https://graphics.wnpt.app/endcards/`, `/signs/`).
6. Shane's picks (shane.md 5 to 7): link the picked generators from the studio's Misc grid via
   `scripts/patch-dist.py`, `cp dist/index.html index.html`, push.

Recommended model for the next session: `sonnet` for the deploy steps and the picker card; the
strongest tier only if a generator changes.

## Session 2, 2026-11-06: End Cards

**Status:** built, verified and pushed (commit 7f66108); superseded by session 3 above for everything
after. Four end-card styles: endpage (tune-in, or funding and credits text), slate (Community rail on
Navy), announcement slate (full Community field with the 50% overlay), support end card (white circle,
VISIT / CALL OR TEXT, generated QR). HD and UHD PNG export through the studio's own capture method;
downloads blocked while any broadcast warning stands. Verifier: 10 of 10 exports inside title-safe,
no line under 40px. Local page check in the built-in browser: renders with no console errors, Download
HD ran and reported the file name (the pane keeps no file; a real download is checked on the deployed
address in session 3's step 2).
