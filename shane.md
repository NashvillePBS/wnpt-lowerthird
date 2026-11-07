# Shane's tasks (human-only, or refused to this session)

Ordered by what each one unblocks. ✅ done · ⬜ open · ⏸ parked. Items 1 to 4 are the production
steps of the move that this Claude session was not allowed to run (its permission mode refused pushes
to other repos and production deploys); each is one pasteable command, or a session with the
permission can run it. Do them in order.

1. ⬜ **Create the Access application for graphics.wnpt.app.** The entry is committed in wnpt-events
   (commit 169d433, local only). Push it and run the workflow:
   ```bash
   cd "/Users/sburkeen/Projects/wnpt-events" && git push
   ```
   ```bash
   cd "/Users/sburkeen/Projects/wnpt-events" && gh workflow run access.yml && sleep 20 && gh run list --workflow=access.yml --limit 1
   ```
   You should see the run marked completed; its log says `created  graphics.wnpt.app  (allow)`.
   (The hostname is a default; to rename it, change `graphics.wnpt.app` in that entry, in
   `wrangler.toml`, in wnpt-hub `src/apps.ts` and in the redirect page before running these.)
2. ⬜ **Switch the studio's route on.** In `wrangler.toml` at the repo root, remove the `#` from the
   two `routes` lines and the `workers_dev = false` line can stay. Then:
   ```bash
   cd "/Users/sburkeen/Projects/wnpt-lowerthird" && npm run deploy
   ```
   ```bash
   curl -sI https://graphics.wnpt.app/ | head -5
   ```
   You should see `HTTP/2 302` and a `location:` on nashville-pbs.cloudflareaccess.com. Then open
   https://graphics.wnpt.app/ in your browser, sign in, and try one lower third download, one end card
   at https://graphics.wnpt.app/endcards/ and one sign PDF at https://graphics.wnpt.app/signs/.
3. ⬜ **Deploy the Airtable proxy** so the new address can load series and content:
   ```bash
   cd "/Users/sburkeen/Projects/wnpt-lowerthird" && npm run deploy:proxy
   ```
   Then reload https://graphics.wnpt.app/ and open the Nashville PBS Brand generator: the Series
   picker should list series. If it says "Couldn't load series", tell Claude.
4. ⬜ **Point the hub at the new address and retire the old one.**
   ```bash
   cd "/Users/sburkeen/Projects/wnpt-hub" && git push && npm run deploy
   ```
   ```bash
   cd "/Users/sburkeen/Projects/wnpt-lowerthird" && gh api -X PUT repos/NashvillePBS/wnpt-lowerthird/pages -f "source[branch]=gh-pages" -f "source[path]=/"
   ```
   After a minute, https://nashvillepbs.github.io/wnpt-lowerthird/endcards/ should bounce you to
   https://graphics.wnpt.app/endcards/. Then tell Claude: it drops the Pages origin from the proxy's
   list and redeploys. Optional, your call, one click: GitHub → wnpt-lowerthird → Settings → General →
   Danger Zone → Change visibility → Private, which takes the PBS Sans files off github.com; the
   redirect page stops working then (Pages needs a public repo on the org's plan).
5. ⬜ **Pick what the studio's picker links to** (art direction): the four end-card styles
   (Endpage, Slate, Announcement slate, Support end card) and the eight signs (Welcome, Directional,
   Reserved, Registration, Restrooms, Quiet Please, Photography Notice, Custom) are all built and
   verified. Say which go live now; Claude adds the picker cards the same day. Also: should a sign
   ever carry a sponsor or underwriter logo? (BUILD-graphics.md Part C, 1 to 3.)
6. ⬜ **Approve two pieces of copy before anyone prints or airs them:** the photography notice's
   small text (the tool ships a draft: "By attending this event, you may be photographed or recorded by
   Nashville PBS. Images may appear in station programming, promotion and publications.") and the
   support end card's facts: `wnpt.org/support` (lands on the pledge cart, fine), the text-to-give
   keyword "GIVE" and number `1 (844) 213-5345`, and "Msg & Data rates may apply. Terms: wnpt.org/terms.
   Text STOP to cancel." The last three appear nowhere on wnpt.org and came from the October On-Air
   template. Reply with corrections or "they stand".
7. ⬜ **Art direction defaults** (silence keeps them): the support card's fine print at the 40px
   on-air minimum (the template had 29px); the slate rail at 3 pattern columns; the full pattern field
   at 5 rows; PBS KIDS on screen as the paired color digital file (design-system shane.md 5); the sign
   band at 28px in Yellow. Each is one config value (BUILD-graphics.md §A5, §B7).
8. ⬜ **Open the PowerPoint sign templates once in PowerPoint** (`templates/signs/*.pptx`, also at
   https://graphics.wnpt.app/templates/signs/ once live): this session could only check them with
   QuickLook, because PowerPoint's file-access dialog needs a person at the Mac. If PowerPoint offers to
   repair a file, tell Claude.
9. ⏸ **Outside editors on graphics.wnpt.app:** not added by hand. The brand-page session is building
   the self-service agency tool on brand.wnpt.app that edits Access policies; the studio's policy should
   be the one that tool manages. When it takes over, delete the graphics.wnpt.app entry from wnpt-events
   `scripts/setup-access.mjs` (its comment says why).
