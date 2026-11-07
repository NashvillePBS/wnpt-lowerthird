# Shane's tasks (human-only, or refused to this session)

Ordered by what each one unblocks. ✅ done · ⬜ open · ⏸ parked.

1. ✅ **The move to graphics.wnpt.app is live** (2026-11-07, after you said "Let Claude retry"): the
   Access application exists (wnpt-events access.yml run 42398381658, "created graphics.wnpt.app
   (allow)"), the site Worker answers on the custom domain, the Airtable proxy allows only the new
   origin, the hub's Graphics tile points there, and the old GitHub Pages address is a redirect page.
   Verified from outside (302 to the Access login) and from your signed-in Chrome (picker, Series picker
   listing series, an end card downloaded at 1920×1080, a sign PDF downloaded at Letter 300 dpi).
2. ⬜ **Optional, one click: make the repository private.** GitHub → NashvillePBS/wnpt-lowerthird →
   Settings → General → Danger Zone → Change visibility → Private. It takes the PBS Sans files off
   github.com (the Pages site no longer serves them, the repository still does). The redirect page at the
   old address stops working then, since Pages needs a public repository on the org's plan; by that time
   the hub, the brand page and bookmarks point at graphics.wnpt.app anyway.
3. ⬜ **Rename the hostname if you want to** (it is a default): change `graphics.wnpt.app` in
   `wrangler.toml`, in wnpt-events `scripts/setup-access.mjs`, in wnpt-hub `src/apps.ts` and on the
   `gh-pages` branch's redirect page, and tell Claude to redeploy the four.
4. ✅ **The picker links both generators** (your call, 2026-11-07: "two cards on the studio page",
   one for End Cards and one for Event Signs, each page keeping its own internal picker of four styles
   and eight signs). ✅ Partner logos: built as a wrapping flex row above the station logo (your call
   the same day). ✅ Signs print on white by default now (your call the same day; the first release
   defaulted to Navy, which would have eaten the office printer's ink).
5. ⬜ **Approve two pieces of copy before anyone prints or airs them:** the photography notice's
   small text (the tool ships a draft: "By attending this event, you may be photographed or recorded by
   Nashville PBS. Images may appear in station programming, promotion and publications.") and the
   support end card's facts: `wnpt.org/support` (lands on the pledge cart, fine), the text-to-give
   keyword "GIVE" and number `1 (844) 213-5345`, and "Msg & Data rates may apply. Terms: wnpt.org/terms.
   Text STOP to cancel." The last three appear nowhere on wnpt.org and came from the October On-Air
   template. Reply with corrections or "they stand".
6. ⬜ **Art direction defaults** (silence keeps them): the support card's fine print at the 40px
   on-air minimum (the template had 29px); the slate rail at 3 pattern columns; the full pattern field
   at 5 rows; PBS KIDS on screen as the paired color digital file (design-system shane.md 5); the sign
   band at 28px in Yellow. Each is one config value (BUILD-graphics.md §A5, §B7).
7. ⬜ **Open the PowerPoint sign templates once in PowerPoint** (`templates/signs/*.pptx`, also at
   https://graphics.wnpt.app/templates/signs/NashvillePBS-EventSigns-Letter-Portrait.pptx): this session could only check them with
   QuickLook, because PowerPoint's file-access dialog needs a person at the Mac. If PowerPoint offers to
   repair a file, tell Claude.
8. ⏸ **Outside editors on graphics.wnpt.app:** not added by hand. The brand-page session is building
   the self-service agency tool on brand.wnpt.app that edits Access policies; the studio's policy should
   be the one that tool manages. When it takes over, delete the graphics.wnpt.app entry from wnpt-events
   `scripts/setup-access.mjs` (its comment says why).
