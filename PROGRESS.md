# PROGRESS.md — the baton between sessions

The history of the studio's earlier sessions is in `SESSIONS.md` ("Completed"). This file starts with
the End Cards build and carries forward from here. Human-only tasks are in `shane.md`.

## Session: End Cards, 2026-11-06

**Status:** built and verified; waiting on Shane's two calls (styles to ship first, hosting) before the
studio links to it. Nothing in the studio's bundle changed yet.

Done
- `endcards/`: sibling page (no dc runtime, no patcher) with four styles: endpage (tune-in, or funding
  and credits text), slate (Community rail on Navy), announcement slate (full Community field with the
  50% overlay), support end card (white circle, VISIT / CALL OR TEXT, generated QR). HD and UHD PNG
  export through the studio's own capture method; downloads blocked while any broadcast warning stands.
- Spec and decision record: `BUILD-endcards.md` (the set, the safe-area geometry, the config hooks for
  the design system's open art-direction calls, the departures from the October template).
- Verification: `scripts/verify-endcards.py` renders every style at both sizes through the real
  export in headless Chrome and checks title-safe with pixel reads (readout in BUILD-endcards.md §8:
  ALL OK, 10 of 10 exports inside title-safe, no line under 40px).
- Vendored: both brand patterns, both station lockups and five channel marks from the design-system
  mirror; html-to-image 1.11.11 and qrcode-generator 1.4.4 with hashes (`endcards/vendor/NOTICE.md`).

Evidence
- Verifier readout and the five sample renders: BUILD-endcards.md §8 and §9.
- Local page check: see the commit message of the commit that adds this file.

Open questions for Shane (also shane.md): styles to ship first; move the studio from GitHub Pages to a
wnpt.app subdomain behind Access; the support card's facts; the art-direction defaults.

Next
1. Shane answers; enable the picked styles; add the End Cards card to the studio's Misc grid via
   `scripts/patch-dist.py`; `cp dist/index.html index.html`; push; verify on the deployed URL with a
   real download at both sizes; close SESSIONS.md, build.md §13.10, shane.md.
2. If Shane says move: its own session (Worker serving the repo, Access app, `ALLOW_ORIGIN`, redirect).
3. Tell the brand page session (brand.wnpt.app) the final URL.

Recommended model for the next session: `sonnet` for the picker card, docs and deploy; the strongest
tier if the hosting move happens in the same session.
