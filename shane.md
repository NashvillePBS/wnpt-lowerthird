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
8. ⬜ **The Short.io key needs setting again, and rotating.** The first attempt saved the key under
   the wrong name: the secret's *name* came out as `SHORTIO_API_KEY` followed by the key itself (the
   key was typed on the command line instead of at the prompt), so the Worker cannot find it, and the
   key now sits in a non-secret field that anyone with access to the Cloudflare account can list.
   Claude is not allowed to delete secrets. Three steps, in order:
   1. In Short.io, make a new key (a **public** key, `pk_…`, is enough for this Worker) and retire the
      old one, since the old one has been exposed.
   2. Remove the mis-named secret: in Cloudflare → Workers & Pages → wnpt-graphics → Settings →
      Variables and Secrets, delete the one whose name starts with `SHORTIO_API_KEYsk_`.
   3. Add the new key under the right name. Run this and paste the key **only when the prompt asks
      for it**, not on the command line:
      ```bash
      cd "/Users/sburkeen/Projects/wnpt-lowerthird" && npx wrangler secret put SHORTIO_API_KEY
      ```
      You should see "Success! Uploaded secret SHORTIO_API_KEY". Then tell Claude, who makes one test
      link (`wnpt.tv/graphics-test`) and checks it.
   One thing to know, your call: wnpt.tv is set up in Short.io as a meta-refresh redirect with Google
   Analytics (wnpt-web-sync PROGRESS §8.6), which adds a short hop to every QR scan before the phone
   lands on the page; if you would rather the sign links jump straight through, that is a Short.io
   domain setting, not this repo.
9. ✅ **Tracked QR codes in place** (your three Short.io exports, 2026-11-07): the Donate sign scans to
   wnpt.tv/support, the PBS app block to wnpt.tv/wnptpbs-app (your landing page that picks the store and
   can carry the Nashville PBS app later), the PBS KIDS block to wnpt.tv/pbskidsapps. For launch day the
   Nashville PBS app needs its flag flipped (`CONFIG.apps.station.enabled`) and a link or file in
   `CONFIG.tracked.apps.station`; say the word.
10. ✅ **Wording and addresses settled** (you, 2026-11-07): GET THE FREE PBS APP with the fine print;
   GET THE FREE PBS KIDS APP without it; the support end card stays on wnpt.org/support (tracked from
   air); the signs use wnpt.org/donate.
11. ⏸ **Outside editors on graphics.wnpt.app:** not added by hand. The brand-page session is building
   the self-service agency tool on brand.wnpt.app that edits Access policies; the studio's policy should
   be the one that tool manages. When it takes over, delete the graphics.wnpt.app entry from wnpt-events
   `scripts/setup-access.mjs` (its comment says why).
