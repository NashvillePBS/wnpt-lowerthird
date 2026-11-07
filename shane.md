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
8. ⬜ **Set the Short.io key on the graphics Worker** so the custom sign can make wnpt.tv short links
   for its QR codes. In Short.io, a **public key** (starts with `pk_`) is enough and safer: it can only
   create links, which is all the Worker does; the secret key works too. The web-sync Worker holds its
   own copy; secrets cannot be copied between Workers, so paste once more here (it stays in Cloudflare,
   never in this repo or in chat):
   ```bash
   cd "/Users/sburkeen/Projects/wnpt-lowerthird" && npx wrangler secret put SHORTIO_API_KEY
   ```
   Paste the key at the prompt and press Return. You should see "Success! Uploaded secret
   SHORTIO_API_KEY". Then tell Claude, who makes one test link (`wnpt.tv/graphics-test`) and checks it.
   One thing to know, your call: wnpt.tv is set up in Short.io as a meta-refresh redirect with Google
   Analytics (wnpt-web-sync PROGRESS §8.6), which adds a short hop to every QR scan before the phone
   lands on the page. That is how your other wnpt.tv links behave today; if you would rather the sign
   links jump straight through, that is a Short.io domain setting, not something in this repo.
9. ⬜ **The tracked links for the locked QR codes.** The Donate and Our Apps signs encode fixed wnpt.tv
   links so scans count in your Google Analytics. Make them in Short.io (with whatever tracking you
   want on each) and send Claude the three short links: the donate page, the PBS app, the PBS KIDS app.
   Claude puts them in `signs/signs.js` `CONFIG.tracked`. Until then the Donate QR points at
   wnpt.org/donate itself and the Our Apps sign cannot be downloaded. Keep a fourth, for the Nashville
   PBS app, for launch day: it is wired in and hidden (`CONFIG.apps.station.enabled`).
10. ⬜ **Two wordings to confirm** (editable only in config, on purpose): GET THE FREE PBS APP and GET
   THE FREE PBS KIDS VIDEO APP, with the fine print "*Local PBS station membership required to access some
   content." Also: the support end card (`endcards/`) still reads wnpt.org/support; say "change it" and
   it becomes wnpt.org/donate like the signs.
11. ⏸ **Outside editors on graphics.wnpt.app:** not added by hand. The brand-page session is building
   the self-service agency tool on brand.wnpt.app that edits Access policies; the studio's policy should
   be the one that tool manages. When it takes over, delete the graphics.wnpt.app entry from wnpt-events
   `scripts/setup-access.mjs` (its comment says why).
