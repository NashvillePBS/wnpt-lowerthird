# Decisions

Standing decisions and external contracts for Lower Thirds Studio, the station's graphics studio.
Older decisions live in `build.md` (§1, §2, §11 and the per-generator sections); this file starts with
the November 2026 work. A rename that breaks a contract below is a bug even if every test passes.

1. **The studio moves to `graphics.wnpt.app` behind Cloudflare Access** (Shane, 2026-11-07: "Yes, move
   it"). A static-assets Worker (`wrangler.toml` at the repo root, name `wnpt-graphics`) serves the
   repository; `.assetsignore` says what stays out. The hostname is a default and renameable. The
   Access application is staff-only (@wnpt.org) and defined in wnpt-events `scripts/setup-access.mjs`
   until the brand-site agency tool takes its policy over, at which point that entry is deleted so the
   script cannot clobber the tool's edits. The route was switched on after the application existed (live 2026-11-07 17:53 UTC).
2. **`ALLOW_ORIGIN` lives in `worker/wrangler.toml` `[vars]`, as a comma-separated list** (2026-11-07).
   The proxy echoes the matching origin. Until now it was a dashboard variable holding one origin
   (build.md §11.1); with the studio changing hosts the origin belongs with the code. `AIRTABLE_BASE_ID`
   and the `AIRTABLE_TOKEN` secret stay in the dashboard; `keep_vars = true` stays.
3. **GitHub Pages becomes a redirect, not a second copy** (2026-11-07). The Pages source moves to a
   `gh-pages` branch holding only `index.html`, `404.html` (both redirect, keeping the path) and
   `.nojekyll`, so the public site stops serving the tool and the PBS Sans files while bookmarks keep
   working (switched 2026-11-07, Pages build 603f386). Making the repository private, which takes the
   font files off github.com as well, is Shane's click (shane.md): on the org's plan a private repo
   cannot serve the redirect.
4. **Sibling pages, plain JS, one shared capture core** (2026-11-06/07). New generators are sibling
   pages like `pledge/` and `business-essentials/` (build.md §13.8), written in plain HTML and JS with
   no dc runtime and no patcher, on `shared/studio-core.js` (element helpers, line fitting, the
   readable-element check, settling, capture at scale) and the vendored libraries in `vendor/`. The
   studio's `.dc.html` gets one picker card per generator, through the patcher.
5. **Preview equals export, and the verifier proves it with pixel reads** (2026-11-06). Every
   generator ships a `selftest.html`; `scripts/verify-graphics.py` runs the real export in headless
   Chrome over the DevTools protocol and checks the geometry rules (title-safe for end cards, the 0.5 in
   margin and the page size for signs) before a commit. `--dump-dom --virtual-time-budget` returns
   before async exports finish: do not go back to it.
6. **Downloads are blocked while a warning stands** (2026-11-06): a line that cannot fit at the floor,
   anything readable outside the safe area, a missing image, "pm" after TONIGHT. The Business
   Essentials rule, applied to broadcast and print.
7. **Signs export a 300 dpi raster PDF with no bleed** (2026-11-07). One page at the paper size, one
   FlateDecode RGB image, written by `signs/signs.js` itself. Vector text with embedded PBS Sans (the
   Business Essentials path) is a later upgrade if a press job needs it.

8. **Signs print on a white field by default** (Shane, 2026-11-07: "the background needs to be mostly
   white"). The signs exist so staff can print one quickly on the office color printer, and a Navy page
   eats its ink; the first release shipped Navy as the default and was corrected the same day. Navy
   stays as the option for a print shop or a sign holder. The PowerPoint sign templates were not part
   of this call and stay as built (Shane: "do not rebuild the powerpoint templates in white").
10. **No Word or PowerPoint sign templates** (Shane, 2026-11-07): the generator is the one way to make a
   sign; a template was another session's idea, not his, and was removed.
11. **Changes beyond the ask are checked with Shane first** (Shane, 2026-11-07, after the template
   rebuild). A request to change one thing is not a request to change its neighbours; propose, then do.
9. **Partner logos on signs are a flex row** (Shane, 2026-11-07): any number of logo files, each at
   its own shape, in a wrapping row above the station logo that steps its size tiers down as logos are
   added, under a plain label ("Supported by"). Never larger than the station lockup, never ad copy.

12. **Short links come from the studio's own API, never from a key in the page** (2026-11-07).
   `POST /api/shortlink` on graphics.wnpt.app runs in `src/graphics-worker.js` (the static-assets
   Worker gained code; `run_worker_first = ["/api/*"]`), verifies the Access JWT against the
   application's audience, and calls Short.io with the secret `SHORTIO_API_KEY`. Domain `wnpt.tv`, the
   one the web-sync Worker uses; a separate copy of the key, because secrets cannot be shared.

13. **Tracked QR codes are locked on the Donate and Our Apps signs** (Shane, 2026-11-07). Their codes
   encode fixed wnpt.tv links in `signs/signs.js` `CONFIG.tracked`, set once by Shane so every scan
   counts in Google Analytics; staff cannot change them. The custom sign is the only one that makes new
   short links. The Nashville PBS app stays wired in behind `CONFIG.apps.station.enabled = false` until
   it launches; the brand book's rule (not launched, not referenced) holds until Shane flips it.

## External contracts

- `endcards/` and `signs/` are linked by path from the studio's picker and from brand.wnpt.app; the
  folder names are addresses. `https://graphics.wnpt.app/endcards/` and `/signs/` once the move is
  live; `https://nashvillepbs.github.io/wnpt-lowerthird/endcards/` and `/signs/` until then.
- `vendor/html-to-image.js` and `vendor/qrcode.js` are referenced by relative path from both
  generators and their self-tests; `vendor/NOTICE.md` carries the versions and hashes.
- `POST /api/shortlink` takes `{ url, path?, title? }` and answers `{ shortURL, path }`; 401 without
  an Access session, 503 without the key, 409 when the name is taken. `GET /api/shortlink/status`
  answers `{ configured }`. The signs page reads both.
- The Airtable proxy's response header `Access-Control-Allow-Origin` echoes one of the origins in
  `ALLOW_ORIGIN`; the studio's bundle calls the proxy from the page origin and nothing else.
- Export file names: end cards `<style>-<slug>-<WxH>.png` (build.md §1.10 slug rules); signs
  `sign-<slug>-<paper>-<orientation>.pdf|png`.
