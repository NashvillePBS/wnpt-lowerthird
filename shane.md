# Shane's tasks (human-only, or refused to this session)

Ordered by what each one unblocks. ✅ done · ⬜ open · ⏸ parked.

1. ✅ **The move to graphics.wnpt.app is live** (2026-11-07, after you said "Let Claude retry"): the
   Access application exists (wnpt-events access.yml run 42398381658, "created graphics.wnpt.app
   (allow)"), the site Worker answers on the custom domain, the Airtable proxy allows only the new
   origin, the hub's Graphics tile points there, and the old GitHub Pages address is a redirect page.
   Verified from outside (302 to the Access login) and from your signed-in Chrome (picker, Series picker
   listing series, an end card downloaded at 1920×1080, a sign PDF downloaded at Letter 300 dpi).
2. ✅ **Repository stays public, PBS Sans stays where it is** (you, 2026-11-07: "I own it"). Standing
   decision; not raised again.
3. ✅ **Hostname stays graphics.wnpt.app** (you, 2026-11-07): it is the studio's own address.
4. ✅ **The picker links both generators** (your call, 2026-11-07: "two cards on the studio page",
   one for End Cards and one for Event Signs, each page keeping its own internal picker of four styles
   and eight signs). ✅ Partner logos: built as a wrapping flex row above the station logo (your call
   the same day). ✅ Signs print on white by default now (your call the same day; the first release
   defaulted to Navy, which would have eaten the office printer's ink).
5. ✅ **Copy approved** (you, 2026-11-07): the photography notice now carries the station's wording
   ("Attention" / "This event is being photographed and/or video recorded." / the two paragraphs and
   "Thank you!") in the tool, and the support end card's address, number and terms line stand as
   shipped.
6. ⬜ **Pick from the rendered options** (you asked for options, 2026-11-07; renders in `docs/options/`):
   slate rail columns 2/3/4, announcement-slate pattern rows 4/5/6, the PBS KIDS pairing (color,
   reverse, stacked), and the signs' band thickness, color and Navy option. Current defaults stay until
   you pick: rail 3, rows 5, KIDS color pair, band Standard in Yellow. The support card's fine print
   stays at 40px (settled: everything on a broadcast end card sits inside the title-safe area).
7. ✅ **PowerPoint sign templates removed** (you, 2026-11-07: the generator is enough). They were built
   at another session's request, not yours.
8. ✅ **Short.io key rotated and set under the right name** (you, 2026-11-07): the exposed first key
   is retired, the mis-named secret is gone (the Worker lists only `SHORTIO_API_KEY`), and the custom
   sign made `wnpt.tv/graphics-test-2` with the new key; from outside it answers with the meta-refresh
   page to wnpt.org. The two test links (`graphics-test`, `graphics-test-2`) are yours to delete in
   Short.io or keep. One thing to know, your call: wnpt.tv is set up in Short.io as a meta-refresh
   redirect with Google Analytics (wnpt-web-sync PROGRESS §8.6), which adds a short hop to every QR
   scan before the phone lands on the page; if you would rather the sign links jump straight through,
   that is a Short.io domain setting, not this repo.
9. ✅ **Tracked QR codes in place** (your three Short.io exports, 2026-11-07): the Donate sign scans to
   wnpt.tv/support, the PBS app block to wnpt.tv/wnptpbs-app (your landing page that picks the store and
   can carry the Nashville PBS app later), the PBS KIDS block to wnpt.tv/pbskidsapps. For launch day the
   Nashville PBS app needs its flag flipped (`CONFIG.apps.station.enabled`) and a link or file in
   `CONFIG.tracked.apps.station`. It stays hidden until you say it has launched (your words: "Stay
   hidden, don't ask again").
10. ✅ **Wording and addresses settled** (you, 2026-11-07): GET THE FREE PBS APP with the fine print;
   GET THE FREE PBS KIDS APP without it; the support end card stays on wnpt.org/support (tracked from
   air); the signs use wnpt.org/donate.
11. ⏸ **Outside editors on graphics.wnpt.app:** not added by hand. The brand-page session is building
   the self-service agency tool on brand.wnpt.app that edits Access policies; the studio's policy should
   be the one that tool manages. When it takes over, delete the graphics.wnpt.app entry from wnpt-events
   `scripts/setup-access.mjs` (its comment says why).
