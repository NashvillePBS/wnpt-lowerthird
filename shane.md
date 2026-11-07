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
5. ✅ **Copy approved** (you, 2026-11-07): the photography notice now carries the station's wording
   ("Attention" / "This event is being photographed and/or video recorded." / the two paragraphs and
   "Thank you!") in the tool, and the support end card's address, number and terms line stand as
   shipped.
6. ⬜ **Art direction defaults** (silence keeps them): the support card's fine print at the 40px
   on-air minimum (the template had 29px); the slate rail at 3 pattern columns; the full pattern field
   at 5 rows; PBS KIDS on screen as the paired color digital file (design-system shane.md 5); the sign
   band at 28px in Yellow. Each is one config value (BUILD-graphics.md §A5, §B7).
7. ✅ **PowerPoint sign templates removed** (you, 2026-11-07: the generator is enough). They were built
   at another session's request, not yours.
8. ⬜ **Set the Short.io key on the graphics Worker** so the sign generator can make wnpt.tv short
   links for its QR codes. The web-sync Worker already holds this key as a secret you set on 2026-08-25;
   a secret cannot be copied between Workers, so paste it once more here (it stays in Cloudflare, never
   in this repo or in chat):
   ```bash
   cd "/Users/sburkeen/Projects/wnpt-lowerthird" && npx wrangler secret put SHORTIO_API_KEY
   ```
   Paste the key at the prompt and press Return. You should see "Success! Uploaded secret
   SHORTIO_API_KEY". Then tell Claude, who makes one test link (`wnpt.tv/graphics-test`) and checks it.
   One thing to know, your call: wnpt.tv is set up in Short.io as a meta-refresh redirect with Google
   Analytics (wnpt-web-sync PROGRESS §8.6), which adds a short hop to every QR scan before the phone
   lands on the page. That is how your other wnpt.tv links behave today; if you would rather the sign
   links jump straight through, that is a Short.io domain setting, not something in this repo.
9. ⬜ **Three answers for the app sign** (BUILD-graphics.md §B2): the links each QR code should point at
   (the PBS app, the Nashville PBS app, the PBS KIDS app: an app-store page, a landing page, or a
   wnpt.tv link you already use); whether the Nashville PBS app may be shown at all (the October brand
   book still says "the Nashville PBS app is not launched: do not reference it"; you say the station has
   one, so your word stands, but say so); and the three calls to action, which today read GET THE FREE
   PBS APP, GET THE FREE NASHVILLE PBS APP and GET THE FREE PBS KIDS VIDEO APP (editable on the sign).
10. ⬜ **The support end card's address:** you asked for /support to become /donate on the signs. The
   support end card (`endcards/`) still reads wnpt.org/support, which you confirmed this morning. Say
   "change it" and it becomes wnpt.org/donate too.
11. ⏸ **Outside editors on graphics.wnpt.app:** not added by hand. The brand-page session is building
   the self-service agency tool on brand.wnpt.app that edits Access policies; the studio's policy should
   be the one that tool manages. When it takes over, delete the graphics.wnpt.app entry from wnpt-events
   `scripts/setup-access.mjs` (its comment says why).
