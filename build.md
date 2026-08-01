# build.md — Nashville PBS Lower Thirds Studio

Handoff for a fresh Claude Code session. This documents **why** things are the way they
are. The source tells you what the code does; this file tells you what you're not allowed
to break and what we already tried and threw away.

Primary source of truth: `Nashville PBS - Lower Thirds Studio.dc.html`
(single file — template + logic class). Worker proxy: `worker/lower-thirds-worker.js`.

**How to read this file.** §1–§9 describe intent and design decisions. §10 documents
behavior you cannot infer from the `SHOWS` config — read it before trusting any flag
there, because several do not mean what their names suggest (`hasContent: false` on
Nashville PBS Brand is the sharpest example; see §11.10). §11 records the deployment,
Worker contract, Airtable IDs, and write path, all verified against source on 2026-07-31.
§12 is the work queue. When prose and source disagree, **the source wins** — verify before
you change anything.

**Owner: Shane (wnpt.org).** Anything marked "ask Shane" means do not decide it yourself.

**Work sequence lives in `SESSIONS.md`** — repo setup, the context budget (never open
`dist/*.html`; it will consume the whole window), which bugs belong to which session, and
the git tag to create before changing anything. Read it before starting work.

---

## 0. What this tool is for

Station staff and producers generate **broadcast graphics** — lower thirds, station IDs,
end-credit pages — as **transparent PNGs** that get keyed over video in an NLE / playout
system. The output is not a web page. Every layout decision downstream of this is about
what survives being composited over moving footage and broadcast over the air.

---

## 1. Decisions and reasoning

### 1.1 One file, one Design Component
The whole studio (picker + 6 lower-third generators + Credits + Slice event graphics) is a
single `.dc.html`. Deliberate: the tool ships as one bundled artifact that station staff
open directly. Splitting into child components was considered and rejected (§2.1).

**Do not split this into multiple components without asking Shane.**

### 1.2 PNG with real transparency, rendered from DOM
Export goes DOM → `html-to-image` `toPng()` → blob. Chosen because the previews and the
exports are literally the same DOM subtree, so what staff see is what they get.
Backgrounds are `transparent` at every level of the export node — a stray opaque
background silently ruins the key and nobody notices until it's on air.

**Rule: never introduce a non-transparent background anywhere in an export node.** The
checkerboard in the preview is a UI affordance only and must not be inside the captured node.

### 1.3 Per-show pixel-ratio (`scale`), not a global one
Each show has its own `scale` in `SHOWS` (see §6). They differ because the shows' native
design sizes differ and the goal is a consistent final raster resolution, not a consistent
multiplier. Slice bars are authored at literal 910×320 so `scale: 1`; the WNPT brand bar
is authored small so it renders at `scale: 4`.

**Do not "normalize" these to one value.** That silently changes delivered file
resolution for four shows.

### 1.4 `width: max-content` bars, not fixed-width bars
Station/box-style bars size to their text. Broadcast lower thirds are keyed at whatever
width the name needs — a fixed-width plate with trailing dead space looks wrong over
video and wastes safe-area. Slice is the exception (fixed 910×320) because its slanted
clip-path only works at a known geometry.

### 1.5 Auto-fit name text (`data-fit` + `fitEl`)
The name line is `white-space: nowrap` and shrinks from the show's `base` font size down
to `minF`, bounded by `maxW`. Reason: producers paste long names ("Dr. Katherine
Vanderbilt-Whitfield") and a wrapped name in a lower third is unacceptable on air. The
floor (`minF`) exists so it can never shrink below broadcast legibility.

**`minF` values are legibility floors, not aesthetics. Do not lower them.** If a name
doesn't fit at `minF`, that's a signal for the producer to shorten it — not for us to
shrink further.

### 1.6 Secondary lines are newline-separated, never wrapped
`secLinesOf()` splits on `\n`, trims, drops empties. Producers control the line breaks.
We do **not** auto-wrap secondary text: auto-wrap produces orphan words and unpredictable
bar heights, which breaks the operator's muscle memory for where the bar sits.

### 1.7 60px transparent padding around station/station-ID bars
`buildStationIdBar` / `buildStationBar` wrap in `padding: 60px; background: transparent`.
This is intentional bleed room so the drop shadow isn't clipped at the PNG edge. Removing
it clips the shadow. Editors position by the visible bar, so the padding costs nothing.

### 1.8 Content is optional
A lower third can be saved as a collection with no linked Content record. Earlier behavior
invented Content records; see §2.4.

### 1.9 Bulk entry paths
Two ways in, same parser: **Create multiple** (paste blank-line-separated blocks; first
line = name, remaining lines = secondary) and **Import lower thirds from this content**
(reads the Content record's own `Lower Thirds` long-text field). Both open a *preview*
modal rather than committing directly — bad paste is the most common producer error and
undo after a bulk commit is expensive.

### 1.10 Filenames
`fileNames()` slugifies the name: lowercase, non-alphanumerics → `-`, collapsed, trimmed,
de-duplicated with a numeric suffix, `.png`. Empty name → `lower-third-N.png`.
ZIP name = collection name slug, else series title slug.

**This naming is load-bearing for the edit suite's import.** Do not change the slug rules
without asking Shane. In particular: no spaces, no uppercase, no unicode.

---

## 2. Rejected approaches — read this before you "improve" anything

### 2.1 Splitting the studio into child Design Components
Tried; abandoned. The generators share one `SHOWS` config, one fit algorithm, one export
pipeline, one Airtable connection state. Splitting duplicated all four and made the show
picker's state handoff messy. Single file is the decision.

### 2.2 Canvas-drawn text instead of DOM capture
Considered for export fidelity; rejected. It would mean reimplementing text fitting,
multiline layout, letter-spacing, and every per-show theme twice — and the preview would
no longer be the same code path as the export, which is precisely the bug class we care
most about avoiding on a broadcast tool.

### 2.3 Referencing the Nashville PBS logo SVG by URL in the Credits page
This broke: the credits pages rendered with a **black** logo, then with **no** logo after
bundling. Two separate causes, both now fixed and both easy to reintroduce:
1. The supplied master SVGs ship with an empty `<defs>`, so every path fell back to
   solid black. The white logo used in credits has **explicit `fill` attributes**
   restored.
2. An external `src` reference did not survive bundling. The credits logo is now an
   **inlined data-URI SVG generated by `whiteLogoSVG()`** and injected as
   `data:image/svg+xml;utf8,...`.

**Do not replace `whiteLogoSVG()` with `<img src="assets/...">`.** It will look fine in
dev and ship broken.

### 2.4 Auto-creating Airtable Content records when none was picked
Rejected and removed. The tool was inventing Content rows to satisfy a link field, which
polluted the Content table with duplicates of real episodes. Now: no Content picked →
the lower thirds save as a **collection only**, with no Content link.

**Never reintroduce write-on-demand creation of Content records.**

### 2.5 Auto-wrapping the name line
Tried; rejected. Wrapped names change bar height unpredictably and read badly on air.
Shrink-to-fit with a hard floor is the decision (§1.5).

### 2.6 A single global export scale
Tried; rejected — see §1.3.

### 2.7 Alphabetical Content picker
Rejected. Producers work on the most recent episode nearly every time. The picker sorts by
**created date, newest first**, and groups by Content Type with Episode expanded by default.
Searching expands all groups.

### 2.8 Saving Station ID output to Airtable
Rejected — see §5.

---

## 3. Broadcast constraints (non-negotiable without Shane)

- **Delivery format:** PNG, RGBA, real alpha. No JPEG, no flattened PNG, no WebP.
- **Full-screen graphics are exactly 1920×1080** (Credits pages; Slice broadcast size).
  Rendered at `pixelRatio: 1, width: 1920, height: 1080` — explicitly pinned so a
  hi-DPI dev machine can't emit a 3840×2160 file that the playout system rejects.
- **Title-safe for full-screen graphics = 80% of frame → 192px left/right, 108px
  top/bottom.** All credits content lives inside that box. This is a broadcast
  requirement, not a margin preference.
- **Legibility over moving video** is why the shows use heavy weights, high-contrast
  fills, and (for Nashville PBS brand / Station ID) an opaque plate behind the text
  rather than text floating directly on footage.
- **Minimum type sizes** are encoded as each show's `minF` (§6). Treat as floors.
- **Naming:** lowercase-hyphen slugs, `.png` (§1.10). Credits pages are
  `credits-N.png`, zipped as `credits.zip`.
- **Light mode** exists only where a show has a spec for it (currently Nashville PBS
  Brand). It's for placing the bar over bright footage, not a dark/light UI theme.
  Do not add it to shows that don't have `hasLight: true` without asking Shane.

---

## 4. Credits page rules

Config: `CREDITS = { W:1920, H:1080, safeX:192, safeY:108, contentW:1536, cols:3,
colGap:64, blockGap:40, bandTop:108, bandBottom:812 }`

- **Column count** is user-selectable (2 or 3). Column width is computed:
  `(1536 − (cols−1) × 64) / cols` → 528px at 3 columns, 736px at 2.
- **Content band** runs `bandTop: 108` → `bandBottom: 812`, i.e. it stops well above the
  title-safe bottom. The gap is reserved for the **footer** (2px white rule + inlined
  Nashville PBS white logo + ©year), which is anchored to the title-safe bottom-right
  (`right: 192px, bottom: 108px`, 560px wide). Copyright year is auto but overridable.
- **Explicit page breaks:** each credits *field* is its own page group; `---` inside a
  field forces a further break. Producers use this to keep, e.g., "Special thanks"
  whole.
- **Row auto-balancing** — the part that is easy to break:
  1. Blocks are measured off-screen at the real column width.
  2. Blocks are chunked left-to-right into rows of `cols`.
  3. Row height = tallest block in that row.
  4. Compute `minPages` = the fewest pages that fit at full band capacity.
  5. Then **spread the rows evenly across those `minPages` by height** (target =
     total height / N), rather than greedily filling page 1 to the brim.

  Step 5 is deliberate. Greedy fill produced a packed page followed by a nearly empty
  one, which looks like a mistake on air. **Do not "simplify" this back to greedy fill.**
- The dashed title-safe guide in the preview is **preview-only** and is appended outside
  the captured node. Verify it never lands in an export.
- Fonts must be settled before capture: `document.fonts.ready`, then image load, then a
  double `requestAnimationFrame`. Removing any of those three produces intermittent
  fallback-font renders. This was a real bug.

---

## 5. Why Station ID is download-only

`"station-id"` carries `noSave: true`, `series: null`, `hasContent: false`.

Station IDs are not tied to a Series or a Content record — they're station-level assets
used across the whole schedule. (Note: this reasoning applies to **Station ID only**.
Nashville PBS Brand *can* take a Content link — see §6 and §11.10.) Persisting them into the Airtable Series/Content graph
would require inventing a parent record for them (exactly the anti-pattern in §2.4), and
they'd clutter per-show collection lists forever. They render and download; that's all.

**Do not add save-to-Airtable for Station ID without asking Shane.**

---

## 6. Per-generator spec

`base` = starting font size for the name, `minF` = legibility floor, `maxW` = max name
width before shrinking, `scale` = export pixel ratio.

| key | Series | style | base | minF | maxW | scale | light | content |
|---|---|---|---|---|---|---|---|---|
| `wnpt-brand` | any Series (pickable) | station | 40 | 20 | 760 | 4 | yes | yes, after Series — §11.10 |
| `slice` | A Slice of the Community | slice | 56 | 30 | 736 | 1 | no | yes |
| `aging` | Aging Matters | box | 60 | 30 | 760 | 2 | no | yes |
| `cleanslate` | Clean Slate with Becky Magura | box | 60 | 30 | 760 | 2 | no | yes |
| `nextdoor` | Next Door Neighbors | box | 60 | 30 | 760 | 2 | no | yes |
| `station-id` | — | station + logo lockup | 56 | 28 | 900 | 2 | no | no (`noSave`) |

### Nashville PBS Brand (`wnpt-brand`) — *station* style
- Font **PBS Sans**. Name 800 weight, `line-height:1`, `letter-spacing:-.01em`.
  Secondary 500 weight, 19px.
- Dark: plate `#0A145A`, name `#fff`, secondary `rgba(255,255,255,.82)`, left rule
  **6px `#FFCF00`**, shadow `0 12px 34px rgba(0,0,0,.32)`.
- Light: plate `#fff`, name `#0A145A`, secondary `rgba(10,20,90,.72)`, left rule
  **6px `#2638C4`**, shadow `0 12px 34px rgba(0,0,0,.22)`.
- Plate padding `22px 46px 22px 34px`, gap 7px.
- **Brand requirement:** navy plate + yellow rule, PBS Sans. Colors and the rule are
  brand, not taste. Fit/size behavior is aesthetic-with-a-broadcast-floor.
- **Two-step picker: Series, then Content.** `canPickSeries: true` surfaces a Series
  picker; once a Series is chosen, the Content picker appears for it. `hasContent: false`
  does **not** mean "no content" here — see §11.10 before changing anything about this.

### Station ID (`station-id`) — logo lockup
- Two-part lockup: navy `#0A145A` logo block (`padding:26px 34px`, inlined white logo at
  `height:52px`) + PBS Blue `#2638C4` name panel with a **6px `#FFCF00`** left rule.
- Name 800 PBS Sans, secondary 500 / 19px / `rgba(255,255,255,.8)`.
- **The logo block, its navy, and the yellow rule are brand-mandated.** Do not restyle.

### A Slice of the Community (`slice`) — *slice* style
- **Fixed 910×320.** Slanted plate via
  `clip-path: polygon(72px 0, 100% 0, calc(100% - 72px) 100%, 0 100%)`.
  Padding `40px 64px 0 110px` (the 110px left inset compensates for the slant).
- Background `#050a3a`. Font **Open Sans**.
- Name 700 / 56px / `#fff`.
- Secondary 400 / 26px / `letter-spacing:.06em` / **ALL CAPS** / cyan **`#5afdff`**.
- No light mode.
- **The 910×320 geometry and the clip-path are a matched pair** — change one and the
  slant angle breaks. Ask Shane before touching either.

### Aging Matters (`aging`) — *box* style
- Solid **`#4DB6E7`** box, no border. Font **Chivo**.
- Name **900** weight, 60px, **UPPERCASE**, `#fff`.
- Secondary 900 weight, 34px. **First secondary line is black `#111111`; all subsequent
  lines are white.** That alternation is the show's spec, not a bug.

### Clean Slate with Becky Magura (`cleanslate`) — *box* style
- Solid **`#5fc8c3`** box, no border. Font **Open Sans**.
- Name **300** (light) weight, 60px, sentence case, `#43413c`.
- Secondary 300 weight, 34px, `#43413c`.
- The light weight is deliberate and show-specific; it is the one place we intentionally
  run below normal broadcast weight, at 60px where it stays legible. **Do not bump the
  weight to "fix" it.**

### Next Door Neighbors (`nextdoor`) — *box* style
- **`#f26539`** box with a **2.5px solid white border**. Font **Open Sans**.
- Name 400 weight, 60px, **UPPERCASE**, `#fff`.
- Secondary 300 weight, 34px, **`#111111`**.

Shared box-style geometry: `padding: 40px 90px 44px`, secondary block `margin-top:14px`,
inter-line `gap:6px`.

### Slice event graphics (separate screen, not a lower third)
Fixed sizes, all exported together as a zip (`<slug>-graphics.zip`, slug = `slice-<title>`):
Eventbrite 2160×1080 · Events page 1920×1080 · Broadcast (title-safe) 1920×1080 ·
Newsletter 1080×1080 (plus a 400×400 variant) · Instagram portrait 1080×1440 ·
Instagram story 1080×1920. Each size has an independently draggable focal point for the
background image.

---

## 7. Brand tokens (reusable reference for other WNPT tools)

**Colors — PBS / Nashville PBS core**
| Token | Hex |
|---|---|
| PBS Blue (primary, links, CTAs) | `#2638C4` |
| Navy (dark surfaces, plates) | `#0A145A` |
| Medium Blue (hover/press) | `#0F1E8C` |
| Light Blue (focus ring) | `#486CD8` |
| Yellow (accent rule) | `#FFCF00` |
| Teal | `#48D3CD` |
| Coral | `#FE704E` |

**Colors — UI chrome used in this tool**
| Use | Hex |
|---|---|
| App background | `#eef0f6` |
| Panel background | `#f6f7fb` |
| Card border | `#d7dbe8` |
| Divider | `#e4e7f1` |
| Control border | `#c7cde0` |
| Muted label | `#8890ad` |
| Secondary text | `#5a6180` |

**Colors — show-specific**
| Show | Hex |
|---|---|
| Slice plate | `#050a3a` |
| Slice secondary (cyan) | `#5afdff` |
| Aging Matters | `#4DB6E7` |
| Clean Slate | `#5fc8c3` |
| Clean Slate text | `#43413c` |
| Next Door Neighbors | `#f26539` |
| Box secondary black | `#111111` |

**Type**
- **PBS Sans** — self-hosted woff2, weights 400 / 500 / 700 / 800.
  Files: `fonts/PBSSans.woff2`, `-Medium`, `-Bold`, `-Black`. Stack:
  `"PBS Sans", Arial, sans-serif`. Arial is the sanctioned fallback.
- **Chivo** 400 / 900 (Google Fonts) — Aging Matters only.
- **Open Sans** 300–800 + italics (Google Fonts) — Slice, Clean Slate, Next Door Neighbors.
- UI: PBS Sans. Section eyebrows 800 / 11–13px / `letter-spacing:.06em` / uppercase.
  Card titles 800 / 17px / `letter-spacing:-.01em`. Body 500 / 13–14px / `line-height:1.5`.
- Display/name lines run 800 weight with `letter-spacing:-.01em` and `line-height:1`.

**Geometry**
- Radii: cards 14px, controls 10px, buttons pill. Borders 1px surfaces / 1.5px controls.
- Shadows: `0 1px 3px rgba(...)` for cards; `0 12px 34px rgba(0,0,0,.32)` for broadcast
  plates (`.22` in light mode).
- Spacing: 4px scale. Picker grid 3 columns, 22px gap. Page max-width 1180px.
- Responsive breakpoint at 820px collapses the generator to one column.

---

## 8. Worker `/content` endpoint — current contract

`GET /content` returns:

```json
{ "content": [ { "id": "recXXX",
                 "title": "<Content Title>",
                 "type": "<Content Type single-select>",
                 "lowerThirds": "<Lower Thirds long text>",
                 "created": "<record createdTime ISO>" } ] }
```

sorted server-side by `created` descending.

Field constants in the Worker:
`Content Title`, `Content Type`, `Lower Thirds` (long text, producer-entered),
`Series` (link → Series). Table id `tbl7u0utEYTfwPya9`.

**The front end requires `type`, `lowerThirds`, and `created`.** They drive, respectively:
the Content Type grouping in the picker, the "Import lower thirds from this content"
button, and the newest-first sort. If any is missing the picker degrades — content
lands in an "unknown type" group, the import button no-ops, and ordering falls back to
Airtable's default.

**Deployment verified current (2026-07-31).** The live `/content` endpoint returns
`lowerThirds` and `created`, sorted newest-first — the deployed Worker matches this repo's
source. See §11.9 to re-verify after any Worker change.

**This Worker serves the Lower Thirds Studio only** (confirmed by Shane, 2026-07-31). No
other WNPT tool reads it. Response shapes can be changed as long as the Studio front end
is updated in the same change — there are no external consumers to coordinate with.

---

## 9. Known issues / rough edges (noticed, not fixed)

1. **Worker/front-end version skew** — see §8. Most likely cause of a "broken" picker.
2. **`fitEl` runs only at export/preview-build time**, not on every keystroke. A very long
   name can momentarily overflow the on-screen preview before the fit pass runs. Export
   is correct; the preview lags.
3. **`minF` is a hard stop with no user feedback.** If a name can't fit at the floor it
   just overflows/clips. There's no warning telling the producer to shorten it. Worth
   adding.
4. **Credits balancing measures blocks, not lines.** A single block taller than the whole
   band (`812 − 108 = 704px`) cannot be split and will overflow the page. No guard exists.
5. **Chivo and Open Sans load from Google Fonts over the network.** Offline or blocked,
   Aging Matters / Clean Slate / Next Door Neighbors silently fall back to Arial and
   export wrong. PBS Sans is self-hosted and safe. Self-hosting the other two would fix
   this.
6. **Slice event background images are user-supplied with no resolution check** — a small
   upload will be scaled up into a 2160×1080 export with no warning.
7. **No visible progress during multi-page/multi-size zip renders.** Long batches look
   frozen; only a status flash appears at the end.
8. **Credits preview scaling** clamps to `min(availW/1920, availH/1080, 1)` with fixed
   96/150px chrome allowances — on short viewports the preview gets very small.
9. **No automated visual regression test on exports.** Every change to a `build*Bar`
   function is verified by eye. Any refactor of the export path should be checked
   against known-good PNGs first.

---

## 10. Non-obvious behaviors (not visible in `SHOWS`)

`SHOWS` only carries label / series / style / sizing / flags. Everything below is
behavior we deliberately built that you will not infer from that config.

> **Verification pass, 2026-07-31.** Every testable claim in this section was checked
> against `Nashville PBS - Lower Thirds Studio.dc.html` line by line — dirty tracking, the
> `beforeunload` condition, the trailing-blank convention, import de-duplication, all four
> 300 ms debounces, the Episode default-open special case, the render-pipeline ordering,
> the 8000 px off-screen host, preview transform scaling and the `ResizeObserver`, worker
> URL handling, the 220 ms credits debounce, 1-based `credits-N.png`, the Slice `also:400`
> newsletter variant, and the `slice-<slug>` zip naming. **No discrepancies found.** Two
> behaviors not visible to Design are marked **ADDED** below.

> Read this section before trusting any flag in `SHOWS` — several do not mean what their
> names suggest.


### Entry list & dirty tracking
- Every entry carries a **`dirty` flag**. On save, `pngBase64` is regenerated **only for
  entries that are `dirty` or have no Airtable id** — clean entries are updated as text
  only. This is what makes re-saving a 30-entry collection fast. Don't "simplify" it into
  re-rendering everything.
- Any edit to name / secondary / light mode sets `dirty: true` on **the selected entry
  only**.
- After a successful save, saved entries are stamped with their returned Airtable ids and
  flipped to `dirty: false`.
- **Entries with a blank name are skipped on save** but stay in the UI list.
- Deleting an entry clamps `selected` so it can never point past the end of the list.

### Unsaved-work guard
- A `beforeunload` handler fires **only** when you're on the generator screen *and* at
  least one entry is both `dirty` and has a name. Blank scratch rows never trigger the
  browser's "leave site?" prompt. Deliberate — a spurious prompt trains people to
  dismiss it.

### The trailing blank row convention
- The list always ends with an empty scratch row so there's somewhere to type.
- Opening a collection appends one.
- **Bulk-add and Import both delete that trailing blank row first** if it's untouched
  (no name, no secondary, no id) before appending, so you don't end up with a blank in the
  middle. Then selection jumps to the last added entry.
- Import **de-duplicates by Airtable id** — re-importing something already in the list is
  a no-op rather than a duplicate.

### Bulk parse (`parseLowerThirds`)
Used identically by *Create multiple* and *Import lower thirds from this content*:
- Normalizes `\r\n` and `\r` → `\n`.
- Splits records on **one or more blank lines** (whitespace-only lines count as blank).
- Within a record: first non-empty line = **name**, all remaining lines joined with `\n`
  = **secondary**.
- Every line is trimmed; empty lines inside a record are dropped.
- Records that reduce to nothing are discarded.
- The modal shows a **live numbered preview** that re-parses on every keystroke, and the
  Add button reads "Add N". Nothing is committed until you confirm.
- Imported entries always come in with `lightMode: false` regardless of the show's
  default — light mode is a per-entry decision.

### Content picker
- Grouped by **Content Type**, sorted newest-first by Airtable `createdTime`.
- **Episode is the only group open by default**; the toggle logic special-cases it
  (`cur === undefined ? (type === "Episode") : cur`), so an untouched Episode group reads
  as open and everything else as closed.
- Typing a search **expands all groups**.
- Search is **debounced 300ms** and re-queries the Worker (server-side filter, not a
  client filter). Same 300ms debounce on Series, Collections, and Import search.
- **Picking content auto-fills the collection name** with the content title — *unless*
  you're editing an existing saved collection (`collName && collectionId`), in which case
  the existing name is preserved.
- Selecting content also stashes that record's `Lower Thirds` long text in state; that's
  what enables the Import-from-content button. **No text → the button no-ops silently.**

### Series picker
- Only appears when `canPickSeries` is set (currently Nashville PBS Brand only).
- Once a Series is picked on `wnpt-brand`, the **Content picker appears too** even though
  `hasContent: false` — `showContentPicker = needsContent || (canPickSeries && pickedSeriesTitle)`.
  That's the "file a brand bar under any show" path.
- Entering any generator **resets** series/content/collection selection. State does not
  leak between shows.

### Render pipeline ordering (fragile — this order is the fix for real bugs)
For every export, in order: append node to the off-screen host → **await all `<img>`
loads** → **run `fitEl`** → **double `requestAnimationFrame`** → capture → remove node.
- `fitEl` runs *after* images load because the logo's width affects available space.
- The double rAF is a layout/paint settle. One rAF was not enough.
- `document.fonts.ready` is awaited before the loop starts in the download/zip paths.
- The off-screen host is `left: -99999px` and **8000px wide** so `max-content` bars can
  measure at full natural width instead of being wrapped by the viewport.
- Slice's brand assets (logo, headshot, PBS logo) are preloaded via hidden 1×1 `<img>`
  tags and read back through `sliceAsset()` with hard-coded fallbacks — so the export
  never races the network.

### Preview vs export
- The on-screen preview is a **CSS-transform-scaled** copy that fits the pane; it is not
  the exported node. Export always rebuilds a fresh node at true size.
- **ADDED — the preview renders literal placeholder text; the export does not.** When a
  field is empty the preview draws the word **"Name"** or **"Secondary"** in its place, at
  five template locations: line 314 (Slice, cyan @45%), 323 (box, `bt.placeholder`),
  333 (station dark, white @40%), 344 (station light, navy @35%), 356 (Station ID,
  white @40%). Each uses the **same font size, weight, and letter-spacing as real
  secondary text** — only opacity differs. The export bar builders iterate
  `secLinesOf(entry)` only (lines 1238, 1260), so placeholders never reach the PNG.
  This is the direct cause of §12.1; see there before changing it.
- Preview scaling recomputes on window resize **and** via a `ResizeObserver` on the
  preview pane, so collapsing the sidebar rescales correctly.
- Credits preview clamps scale to a max of 1 — it never upscales.

### Save semantics
- Save creates or updates a **Collection**, then creates/updates each Lower Third, then
  **rewrites the collection's link field to exactly the current list, in order**. Order is
  meaningful and is preserved on reopen. Removing an entry and re-saving unlinks it.
- The collection ZIP attachment is regenerated and replaced on every save.
- Reopening a collection restores entries as **clean** (`dirty: false`) so a no-op save
  doesn't re-render every PNG.
- `noSave: true` (Station ID) hides the entire save/collection UI — the download path is
  the only path.
- **ADDED — `collectionId` is retained after a successful save, and nothing else is
  cleared.** `saveCollection` returns `{ entries: next, collectionId: data.collectionId }`.
  `collName`, `entries` (now carrying record ids), `contentId`, and `pickedSeriesTitle` all
  persist. Because the Worker branches on `collectionId`, a second save with a new name
  **renames and re-points the first collection** rather than creating a new one. This is a
  data-loss path, not a UI annoyance — see §12.2.
- **ADDED — a full reset already exists.** `enterShow(key)` clears entries, selection,
  `collectionId`, `collName`, collections, all content state, and all series state. The
  "All shows" control reaches it. Reuse that block; do not write a second reset.

### Worker URL
- Stored in `localStorage` under **`lt_worker_url`**, falling back to `DEFAULT_WORKER`.
  Trailing slashes are stripped on save. This is why one machine can be pointed at a test
  Worker while others aren't — check it first when a single user reports "Airtable is
  broken."
- The header pill shows connection state (dot + label) purely from whether a URL is set;
  it does **not** ping the Worker.

### Credits screen specifics
- **Each credits textarea is its own page group.** Adding a second field is how producers
  force a page break; `---` inside a field forces further breaks.
- Recompute is **debounced 220ms** on typing, but immediate on add/remove field and on
  column-count change.
- Copyright year is computed automatically but has a manual override field.
- Page navigation clamps at both ends; changing content re-clamps the current page index
  so you can't be stranded past the last page.
- Single-page download is `credits-N.png` where N is the **1-based visible page number**,
  not the array index.

### Slice event graphics
- Each output size keeps its **own independent focal point** for the background image,
  seeded from `defaultFocal(key)` — repositioning for Instagram story does not disturb
  Eventbrite.
- The Newsletter size emits **two** files from one render pass: `1080x1080` and a
  `400x400` variant (the `also` property).
- Zip contents are named `<slug>-<file>.png` where slug is `slice-<title-slug>`, falling
  back to `slice-graphic` when the title is empty.

### Misc
- `flash()` status messages are typed (`busy` / `ok` / `err`) and drive the status colour.
- Filename de-duplication is **within a single export batch only** — two batches can
  produce the same filename. Known and accepted.

---

---

## 11. Addendum — verified against source (Shane, 2026-07-31)

Everything below was read out of `worker/lower-thirds-worker.js` and
`Nashville PBS - Lower Thirds Studio.dc.html`. It closes the open items in §8 and supplements §10.

### 11.1 Deployment

- **Worker:** `https://autumn-rain-853e.wnpt-digital.workers.dev`
- Hardcoded as `Component.DEFAULT_WORKER`; overridable at runtime via
  `localStorage["lt_worker_url"]` (there is a connection setter in the UI).
  All calls go through `api(path)`, which trims trailing slashes off the base.
- **Airtable base:** `appmpL4OjEpPoYmcD`
- **Worker config** (Settings → Variables) — verified in the Cloudflare dashboard
  2026-07-31:
  - `AIRTABLE_BASE_ID` (Plaintext) = `appmpL4OjEpPoYmcD`
  - `AIRTABLE_TOKEN` (Secret, encrypted) — **not present in any source file.**
    `worker/lower-thirds-worker.js` is safe to commit.
  - `ALLOW_ORIGIN` (Plaintext) = `https://nashvillepbs.github.io`
- **Observability:** Logs Enabled, 100% sampling, no export destination, no Tail Worker.
- **CDN dependencies:** `html-to-image@1.11.11` and `jszip@3.10.1` load from the jsdelivr
  CDN (source lines 30–31). This bounds §11.2's "never fails on a bad network" reasoning:
  fonts and assets are inlined in `dist/`, but the export machinery itself is not — if
  jsdelivr is unreachable at page load, rendering and ZIP download are unavailable.

**Deployment method — no pipeline exists.** Every version in the Worker's history is
"Manually deployed" from the Cloudflare Dashboard by `wnpt.digital`. The repo has never
been the Worker's source of truth, so `worker/lower-thirds-worker.js` may differ from what
is actually running. Treat the deployed code as authoritative until proven otherwise.

Active deployment as of 2026-07-31: version `21ae3db8`, deployed 7 days prior — **older
than this Design export.** See §8 and §11.9.

**DECIDED (Shane, 2026-07-31): deploy with `wrangler` from the repo.** Shane wants to
pick this project back up in Code later, with fewer manual steps to get wrong.

Consequence to respect: **the repo is now the source of truth for the Worker.** Never
hand-edit Worker code in the Cloudflare dashboard again — the two copies drift silently
and the next `wrangler deploy` overwrites the dashboard edit with no warning. Variables
and secrets stay in the dashboard; only code moves to the repo.

`worker/wrangler.toml` exists (committed 2026-08-01, Worker name verified against the
account). It carries `keep_vars = true` — **never remove that line**; without it the
first deploy deletes the dashboard's plaintext variables and the tool goes down. The
first actual `wrangler deploy` waits for Session 3; the file's header comment lists the
pre-deploy checks.

### 11.2 Three dist builds — know which one is live

| Build | Size | Worker URL | Notes |
|---|---|---|---|
| `dist/index.html` | ~2.1 MB | yes | **This is what is deployed.** Byte-identical to the live GitHub Pages file (md5 `d0da62955a9d73becbee5d002b662c4b`). Assets inlined. |
| `dist-airtable/index.html` | ~313 KB | yes | Smaller variant, Airtable-connected |
| `dist-cdn/index.html` | ~242 KB | **no** | No Worker URL — disconnected build |

**DECIDED (Shane, 2026-07-31): keep emitting `dist/`.** Do not switch the bundler to a
smaller variant. `dist/` inlines fonts and assets, which is why exports never fall back to
Arial over a bad network — the size is irrelevant for a page a handful of staff open.
`dist-cdn/` has no Worker URL and would silently break the Airtable connection.

### 11.3 "Couldn't load series: Failed to fetch" in the Design canvas is NOT a bug

`ALLOW_ORIGIN` restricts CORS to the deployed GitHub Pages origin. The Design canvas
runs from a different origin, so the browser rejects the response and `fetch` throws.
Expected. The deployed tool works. **Do not "fix" this by loosening `ALLOW_ORIGIN`
to `*` in production** — that removes the only browser-side gate on a Worker holding
a write-scoped Airtable PAT.

### 11.4 Full Worker endpoint contract

Tables: Lower Thirds `tbliZoHF9pEYT3aVx` · Collections `tblcS0voNB7RZg5ck` ·
Series `tbldxGvIU3nxZhfE7` · Content `tbl7u0utEYTfwPya9`

| Method / path | Params | Returns |
|---|---|---|
| `GET /content` | `series` (Series **Title**), `search` | `{content:[{id,title,type,lowerThirds,created}]}`, sorted `created` desc in the Worker |
| `GET /series` | `search` | `{series:[{id,title}]}`, alphabetical, blanks filtered |
| `GET /lower-thirds` | `search` | `{lowerThirds:[{id,name,secondary,lightMode,png}]}` |
| `GET /collections` | `series`, `search`, `limit` (≤50, default 5), `offset` | `{collections:[{id,name,count,created}], nextOffset}`, sorted by `Created` desc |
| `GET /collection` | `id` (required) | `{id,name,series,contentId,contentTitle,zip,entries[]}`; missing `id` → `400 {error:"missing id"}` |
| `POST /save` | JSON body (§11.5) | `{ok,collectionId,seriesId,lowerThirdIds}` |

Unmatched path → `404 {error:"not found",path}`. Any throw → `500 {error}`.
Path matching uses `endsWith()` after stripping trailing slashes, so the Worker
tolerates being mounted under a subpath.

Airtable client: 220 ms sleep after every request to stay under the 5 req/s per-base
limit; `listAll` pages at 100.

### 11.5 The write path — read before touching `/save`

Request body:

```js
{ seriesTitle, contentId?, collectionId?, collectionName,
  entries: [{ id?, name, secondary, lightMode, pngBase64? }],
  zipBase64? }
```

`saveCollection()` order of operations:

1. Resolve `seriesTitle` → Series record via `findByField`. **Throws if not found.**
   (Only when `seriesTitle` is non-empty — an empty title skips the lookup and saves the
   Collection with no Series link. The client always sends one, so that branch is
   theoretical.)
2. Upsert the Collection (`Collection Name` + `Series` link). Create if no `collectionId`.
3. Per entry: upsert Lower Third (`Name`, `Secondary`, `Light Mode`, `Content` link),
   then if `pngBase64` — clear the `PNG` attachment, then upload the new one.
4. Update the Collection's `Lower Thirds` link array to exactly these ids, in order.
   **This is what preserves ordering** — the Sort Order field is not written here.
5. If `zipBase64` — clear the Collection `ZIP` attachment, then upload.

Data-model invariants enforced here:
- A Collection links to exactly one Series.
- Every Lower Third in a Collection links to that Collection's chosen Content.
- `contentId` is null when no Content was picked — for any show, including WNPT Brand.
  WNPT Brand collections **do** routinely carry a Content link (§11.10). The Worker's own
  header comment claims otherwise; that comment is stale and should be corrected when you
  next touch the file.

**Three known fragilities. Shane has reviewed all three (2026-07-31) — see the disposition
on each. Do not change behavior beyond what is stated.**

1. **Not transactional. ACCEPTED — do not build transaction handling.** Six-plus
   sequential Airtable calls, no rollback, no idempotency key. A failure partway leaves a
   half-built Collection, and pressing Save again does not resume — the tool only learns
   record ids on full success, so a retry creates a second set. Shane has accepted this
   knowingly: volume is a few collections a month, failures are loud rather than silent,
   and cleanup is a manual delete on a rare occasion. Document a failure if you see one;
   do not engineer around it.
2. **Series resolved by title string, not record id.** The titles are hardcoded in
   `SHOWS`. Renaming a series in Airtable breaks every save for that show with
   `Series not found in Airtable: "..."`.
3. **Clear-then-upload on attachments is destructive — CHANGE THIS.** Today the Worker
   empties the field, then uploads. If the upload fails in between, the record is left
   with **no file** and the original is gone.

   **DECIDED (Shane, 2026-07-31): upload first, then delete the old attachment.** Airtable's
   upload endpoint appends, so: upload the new file → PATCH the field to keep only the new
   attachment id. A failure now leaves **two copies** — visible, harmless, and recoverable —
   instead of none. Apply this to `PNG` on Lower Thirds and `ZIP` on Collections. It matters
   most for multi-file writes (Credits, §13.6), where more calls mean more chances to fail
   mid-sequence.

### 11.6 Security note — `/save` is unauthenticated

There is no token, signature, or key on any endpoint. `ALLOW_ORIGIN` is CORS, which
only browsers enforce — a direct `curl` bypasses it entirely. Anyone who knows the
Worker URL can create Collections and Lower Thirds records and upload attachments
to the production base.

**DECIDED (Shane, 2026-07-31): no auth gateway. Bot filtering only.**

Do not propose Cloudflare Access, a login, or a shared-secret header again without Shane
raising it first. His reasoning, recorded so it is not re-litigated:

- The tool is used by **freelancers and contractors outside `wnpt.org`**. An
  identity-based gate means chasing account provisioning for people who need the tool once.
- He is **not concerned about the URL being shared.** That is a deliberate, informed
  choice, not an oversight.
- Cloudflare Access is already in use on another WNPT project (swag) and he does not want
  to repeat that experience here.

**What he did approve: something that filters bots.** The original plan was Bot Fight
Mode plus a rate-limiting rule at the Cloudflare edge — but **that plan is not
implementable as written (verified 2026-08-01):** those controls only attach to a zone
you own, the Worker runs on a bare `workers.dev` address (Cloudflare's zone, not ours),
and neither `wnpt.org` nor `nashvillepbs.org` is on Cloudflare DNS (both are on
Microsoft nameservers). There is no dashboard toggle to flip — do not go looking for it.

Disposition (Shane, 2026-08-01): **live with the accepted risk below for now.** If junk
records ever appear, the upgrade path is a small dedicated domain via Cloudflare
Registrar (~$10/yr, auto-connected, no change to station DNS) attached to the Worker as
a custom domain — zone controls then apply — plus a small Code session to point
`DEFAULT_WORKER` at it and disable the `workers.dev` route. Do not propose onboarding
`wnpt.org` itself to Cloudflare; station DNS is Microsoft-managed and out of scope.

- Optionally scope the existing `ALLOW_ORIGIN` CORS header no wider than it already is.
  It stops nothing determined, but it costs nothing to keep correct.

Residual risk, accepted knowingly: anyone with the URL can create Collection and Lower
Third records and upload attachments. There is no delete path and nothing sensitive is
readable. Junk records are visible and reversible.

### 11.7 Field IDs vs field names — important nuance

The Worker uses field **name** constants (`F_SERIES_TITLE`, `F_CONTENT_TITLE`,
`F_CONTENT_TYPE`, `F_CONTENT_LT`, etc.).

**Do not blanket-convert these to field IDs.** `filterByFormula` — used by
`searchFilter()`, `andFilter()`, and `findByField()` — requires field *names*.
Field IDs are not valid inside formulas and will silently return nothing.

Field IDs are only usable for reading and writing `record.fields`, and only if the
list/get calls also pass `returnFieldsByFieldId=true`. If rename-proofing is wanted,
it has to be done deliberately on the read/write side while leaving every formula
string on names. Reference IDs, for that work:

| Table | ID | Fields |
|---|---|---|
| Content | `tbl7u0utEYTfwPya9` | Content Title `fldQFvOHz510ihoJN` · Lower Thirds `fld20wL8p33PxY5Q9` · Series `fldSuOoyPMhSy15Xe` · Content Type `fldlzO2mk8sjYJrIQ` (singleSelect) · Editor `fldAbWvjD35z54HMw` · Editor Email `fldOjIj0bORhkmXEc` (lookup) · Producer `fldIXMfBavDPkFSTL` · **Credits `fldFvjUTlMa8RRs2W`** · **Credits ZIP `fld2CSHQyOIKkKVQD`** · **Credits Last Rendered `fldB5TRTKQHeY6dli`** |
| Lower Thirds | `tbliZoHF9pEYT3aVx` | Name `fldkmmE33EN1EG5bd` · Secondary `fldRGQ6jVSov6jPbw` · Light Mode `fldDnbamP8luhn32D` · PNG `fldM9tnI7MBJe0d3u` · Collection `fldll3IS8rhgrYObx` · Sort Order `fldvv8dHUe5tvO2Dc` |
| Collections | `tblcS0voNB7RZg5ck` | Collection Name `fldE5P0H9ksAsVtyJ` · Lower Thirds `fld1gSSMGvjSZ4QL3` · ZIP `fldjRV74OzOVVKXrM` · Series `fldguzwE4i33vBtgb` |
| Series | `tbldxGvIU3nxZhfE7` | Series Title `fldzulnjTmZMwWGRk` |

`Sort Order` (`fldvv8dHUe5tvO2Dc`) on Lower Thirds is **dead — safe to ignore**
(Shane, 2026-07-31). The Worker never writes it and it is empty on every record in the
table. Ordering comes from the Collection's link array (§11.5 step 4), which Airtable
preserves. Do not start writing it and do not remove it.

### 11.8 Verification

Verify against the deployed URL on a real target, not just locally or in the Design
canvas. Every bug in the last two WNPT projects passed local testing and failed in
production. For anything touching `/save`, test against a scratch Collection first —
that path writes to the live production base and has no undo.

---

### 11.9 Deployed Worker verified CURRENT — 2026-07-31

`GET https://autumn-rain-853e.wnpt-digital.workers.dev/content` was checked directly and
every record carries `lowerThirds` and `created`, sorted newest-first.

**The deployed Worker matches the repo source. No redeploy is needed.** §8's version-skew
warning is resolved. Do not chase a stale deploy when debugging the picker or import —
that hypothesis has been ruled out.

To re-verify after any Worker change, open that URL directly in a browser tab. Direct
navigation is not subject to CORS, so the JSON is readable even though `ALLOW_ORIGIN` is
locked to the Pages origin.

### 11.10 Nashville PBS Brand: Series picker → Content picker (verified in source)

**This is a deliberate, working feature. Do not remove it, and do not "fix" it.**

Nashville PBS Brand can be used for **any Series that has no custom lower-third brand**.
The flow Shane specified and the code implements:

1. Pick the show **Nashville PBS Brand**.
2. A **Series** picker is offered (`canPickSeries: true`).
3. Once a Series is chosen, the **Content** picker appears, scoped to that Series.
4. Save files the collection under the picked Series, with the Content link on each
   lower third.

The whole behavior hinges on one line in `Nashville PBS - Lower Thirds Studio.dc.html`:

```js
showContentPicker: needsContent || (cfg.canPickSeries && !!s.pickedSeriesTitle),
```

`needsContent` is `cfg.hasContent`, which is `false` for `wnpt-brand`. **`hasContent:
false` does not mean this show takes no content.** It means the Content picker is not
shown *unconditionally* — it appears once a Series is picked. Reading the `SHOWS` config
alone gives the opposite impression, and that is exactly how this feature came to be
documented backwards.

Supporting wiring, all correct — leave it alone:

- `selectSeries` and `clearSeries` both clear `contentId`, `contentTitle`,
  `contentLowerThirds`, and `contentResults`. Changing the Series resets the Content
  beneath it instead of leaving a stale mismatch.
- `seriesTitle()` returns `pickedSeriesTitle || cfg.series`, so the save files under the
  picked Series rather than the show default.

**Live evidence:** collection `recei97Ng5wqUAPTL` ("Sara DeWitt: A Nashville Kid at
Heart") is filed under Series **WNPT Brand** with a Content link to `recU0pnbzv1u1F4cb`.
That is the feature working, not a data anomaly — do not "clean it up."

**One stale claim to distrust:** the header comment in `worker/lower-thirds-worker.js`
says "WNPT Brand is the only Series whose collections have NO Content link." That comment
is wrong. Correct it when you next touch the Worker.

## 12. Bug fixes and features requested by Shane

Work these in order. 12.1 and 12.2 are the two that actively confuse users.

### 12.1 Import preview shows a Secondary line that the export doesn't have

**Symptom:** importing from a Content record's `Lower Thirds` long-text field, a block
with only one line still shows a Secondary in the preview. The downloaded PNG correctly
has none.

**Mechanism — verified in source. It is the empty-state placeholder, not the parser.**

`parseLowerThirds` (line 1448) is clean: it normalizes line endings, splits records on
blank lines, trims every line, drops empties, and joins the remainder. A single-line
record yields `credit: ""` exactly as it should. **The parser is not the problem — do not
change it.**

The mismatch is in the **generator's bar preview**. When a secondary is empty (`noSec`),
the preview draws the literal word **"Secondary"** as placeholder text. Five template
locations do this:

| Line | Style | Placeholder colour |
|---|---|---|
| 314 | Slice | cyan @ 45% |
| 323 | box (Aging / Clean Slate / Next Door) | `bt.placeholder` (~50%) |
| 333 | station, dark | white @ 40% |
| 344 | station, light | navy @ 35% |
| 356 | Station ID | white @ 40% |

Each placeholder uses the **same font size, weight, and letter-spacing as real secondary
text** — only opacity differs. The export builders iterate `secLinesOf(entry)` only
(lines 1238 station-ID, 1260 station, 1272 slice, 1290 box), so no placeholder ever
reaches the PNG.

So: import a one-line record → the name fills in → a ghost "Secondary" sits beneath it at
40% opacity, looking like content → the downloaded PNG correctly has none. The export is
right; the preview misleads.

**Why it only bites on import.** The two placeholders are gated differently:

- **Name** placeholder (line 321 and station/slice equivalents) is gated on `noName`.
  Type a name and it disappears. This behaves correctly today.
- **Secondary** placeholder (lines 314, 323, 333, 344, 356) is gated on `noSec` **only**.
  It has no knowledge of whether a name exists.

Typing manually never feels broken — you are mid-edit and the ghost reads as a prompt.
Import is different: the name arrives populated, the secondary is legitimately empty, and
the ghost persists on a row the producer expects to be **finished**. That is the entire
bug.

**DECIDED (Shane, 2026-07-31): hide the Secondary placeholder once the entry has a name.**

Gate the secondary placeholder on `noSec && !hasName` rather than `noSec` alone, at all
five locations. `hasName` already exists as a computed flag at line 1913
(`!!(sel && sel.name)`) — it tracks content only. No new flag is needed. Effect:

- Blank entry → both placeholders show. Unchanged; the empty-state affordance is kept.
- Named entry, no secondary → **no ghost**. The preview now matches the export exactly.
- Imported entry → correct automatically, because imported entries always carry a name.

**`noSec && noName` is the wrong condition — do not use it.** `noName` (line 1914) is
`!(sel && sel.name) && !s.nameFocused`: it goes false when the name input is merely
*focused*, so on a blank entry the Secondary ghost would vanish the moment someone
clicks into the name field. The placeholder must be gated on content, not focus.

Leave the Name placeholder logic alone — it already works. Do not restyle either
placeholder; the fix is the gating condition, nothing else.

**Live reproduction data — do not construct synthetic test cases.** The Content table
holds years of producer-entered values in every imaginable shape. Fetch
`GET <worker>/content` and test the parser against the real corpus. See §12.8 for the
full catalogue of shapes and the guard rails the import needs.

Start with these two:

- `recU0pnbzv1u1F4cb` ("Sara DeWitt: A Nashville Kid at Heart") — single line,
  comma-formatted: `Sara DeWitt, Senior VP & General Manager, PBS KIDS and Education`
- `recj2TIfClKgRPYoN` ("Fatherhood Matters More Than Ever") — correctly formatted
  blank-line-separated blocks; parses without issue

Whether the parser splits comma-format into name and secondary is answerable from the
corpus alone: `rec41TUZha9mJzHl1` is `Vadis Turner, Artist` and `recyo6rSrZje24Tqr` is
`Kyle Albertson, Opera Singer`. Import them and observe — do not rely on recollection of
what a past import produced.

**Verify:** import a Content record whose `Lower Thirds` field has a mix of one-line and
multi-line blocks. For every entry, the on-screen bar and the exported PNG must show the
same lines — no ghost text in either direction.

### 12.2 Saved collection stays loaded with no way to clear it

**Symptom:** after Save collection succeeds, the previous collection remains loaded and
there is no obvious way to start a fresh one.

**This is a data-loss footgun, not just UX friction — verified in source.** On success,
`saveCollection` does:

```js
return { entries: next, collectionId: data.collectionId };
```

`collectionId` is **retained**, and nothing else is cleared — not `collName`, not
`entries` (which now carry their saved record `id`s), not `contentId`, not
`pickedSeriesTitle`.

Now trace what a second save does. The client posts the retained `collectionId`, and the
Worker's `saveCollection` (§11.5) branches on it:

- Step 2 → `api.update(T_COLL, ...)` with the **new** `Collection Name`, so typing a new
  name and saving **renames the existing collection** instead of creating a new one.
- Step 3 → sets that collection's `Lower Thirds` link array to **exactly** the current
  entries, unlinking whatever was there before. Those records survive in the Lower Thirds
  table but are orphaned from any collection.
- Entries that kept an `id` are **updated in place**, so editing them rewrites the
  previous collection's records.

A producer who saves one collection, retypes the name, and saves again silently destroys
the first collection. Treat this as the actual severity of the bug.

**A reset already exists — reuse it, do not write a new one.** `enterShow(key)` clears
`entries`, `selected`, `collectionId`, `collName`, `collections`, `contentId`,
`contentTitle`, `contentResults`, `contentLowerThirds`, `pickedSeriesId`,
`pickedSeriesTitle`, and status. The "All shows" control (top-left) returns to the picker,
so re-entering a show is today's working escape hatch — it is simply not discoverable as
"start a new collection."

**Fix:** extract that reset block out of `enterShow` into a reusable method, call it on
successful save, and add an explicit **New collection** control that calls the same thing.
Keep the show, the Worker connection, and the Series selection — those are session
context. At minimum, `collectionId` must be cleared on save even if nothing else is.

**DECIDED (Shane, 2026-07-31): clear the Content selection too — fully fresh start.**

The reset clears entries, selection, `collectionId`, `collName`, and **`contentId` /
`contentTitle` / `contentLowerThirds`**. Keep only the current show, the Series selection,
and the Worker connection.

**WARNING — do not extract the `enterShow` block verbatim.** `enterShow` clears
`pickedSeriesId` / `pickedSeriesTitle` (line 787), and the post-save reset must **not**.
Copying the block as-is means that on Nashville PBS Brand the picked Series is dropped
after every save, and the next save silently files under the WNPT Brand default —
`seriesTitle()` falls back to `cfg.series` when `pickedSeriesTitle` is empty. The
extracted reset must be parameterized so the post-save path preserves the show **and**
the Series. The explicit "New collection" control may clear the Series too, matching
`enterShow` — that's a user-initiated fresh start, not a silent one.

Also add an explicit escape hatch that doesn't depend on a save succeeding: a "New
collection" / "Clear" control that resets the same state. The absence of any way out
is as much the bug as the stale state.

The success message already names what was saved — line 1382 flashes
`Saved "<name>" to Airtable.` — so nothing to add there; just don't lose it when the
reset lands, or the reset reads as "my work vanished."

### 12.3 First-run tutorial for the non-obvious features

Several capabilities are undiscoverable: Create multiple, Import lower thirds from this
content, the Series picker on Nashville PBS Brand, Light Mode, per-size focal points on
Slice event graphics, and credits page breaks via `---`.

Build a dismissible walkthrough. Store the dismissal in `localStorage` (same place the
Worker URL override lives) and add a "Show tips" control so it can be reopened. Keep it
short — highlight the features above, skip anything self-evident from the UI.

This is a UI feature; **prefer building it in Design** (§14).

### 12.4 Usage logging

**Problem:** staff report using the tool but there's no record of it. Today the only
Airtable write happens on Save collection, so downloads, exports, and Station ID use —
which is download-only by design (§5) — leave no trace at all.

**Approach:** a new `Usage Log` table, deliberately **not linked to Content or Series**,
so logging can never pollute the content graph (§2.4) and never blocks a render.

Suggested fields: `Timestamp`, `Action` (single-select: render / download-png /
download-zip / save-collection / import-content / create-multiple), `Show` (the `SHOWS`
key), `Count` (entries or pages in the batch), `Session` (a random id in `localStorage`,
so repeat use is attributable without identifying anyone), and optionally `User` — but
see below.

New Worker endpoint `POST /log`, fire-and-forget. **Requirements:**

- Never block or fail a render. Wrap the call so a logging error is swallowed silently —
  a broken log must never stop someone getting a PNG on deadline.
- Batch or debounce. A 7-page credits export should be one log row, not seven.
- Respect the 5 req/s per-base ceiling; the Worker's existing 220 ms sleep already helps,
  but logging must not starve a save that's running concurrently.

**DECIDED (Shane, 2026-07-31): identify by User Table, gated at load.**

A short identify screen appears **before the tools are exposed**, so every action in the
session is attributable. Requirements:

- Populate from the **User Table** (`tbl7qTD9DIc3itsMj`) — Name `fldorgfIijrt3mLEL`,
  Email `fldPhtBOmLuOIi6J0`. Needs a new Worker endpoint (`GET /people`) following the
  same shape as `/series`.
- Persist the choice in `localStorage` alongside `lt_worker_url` so returning users are
  not re-prompted every load. Offer a visible way to switch person.
- Log rows carry a **link to the User Table record**, not a typed name string.
- Gate the generator screens on a person being selected.

**This is identification, not authentication.** Anyone can pick any name — consistent
with §11.6 (no gateway). It answers "who used this" for people acting in good faith; it
is not an access control and must not be described as one.

### 12.5 New generators — see §13

Date/Time tags and future templates. Structural guidance is in §13 because it interacts
with the schema question, not just the UI.

### 12.6 Lower-third preview flexes on mobile / narrow viewports

**Symptom:** below the 820px responsive breakpoint the generator collapses to one column
and the lower-third preview flexes with it — spacing and proportions visibly shift, so
the bar looks wrong on screen. The exported PNG is correct: fixed geometry, correct
spacing.

**Why it matters:** producers reasonably believe the preview. Seeing a broken-looking bar
erodes trust in a tool whose entire value is "what you see is what you key over video."
Several people have had to be told "no, it's fine, just export it" — a UX failure even
though the output is right.

**Mechanism — verified in source. The scaler already exists; the capture node's layout
is what breaks.**

A scale-to-fit wrapper is already in place: `scalerRef` wraps `capRef` (lines 306–307),
and `scaleToFit` (lines 809–820) transform-scales it on window resize and via a
ResizeObserver. The transform already lives on a wrapper **outside** the captured node,
so the checkerboard rule (§1.2, §4) is already satisfied. Do not add a second scaler and
do not modify `scaleToFit` — neither is the bug.

The bug is upstream of the scaler. `capRef` is `display:inline-block` inside the
responsive column; below the 820px media query (line 22), shrink-to-fit caps its layout
width at the narrow container. Station and box bars compress and their secondary lines
wrap (they have no `nowrap`). `scaleToFit` then measures the **already-squeezed** node,
finds it fits, and applies scale ≈ 1 — so the reflowed bar shows at full size instead of
a scaled-down correct one.

The export never sees any of this: it renders into the 8000px off-screen host (line 703),
and the export bar builders set `width:max-content` on their wrappers (lines 1222, 1232,
1252, 1254). The preview templates of the same bars lack those widths entirely — that is
the whole preview/export divergence.

**Fix:** make the preview capture node lay out at unconstrained / `max-content` width,
mirroring the export builders, so the bar keeps broadcast geometry and `scaleToFit`
actually engages on narrow viewports. Slice mostly escapes the bug already (its bar is a
fixed 910×320); station and box are the styles that reflow, so test those.

**Verify:** on a real phone, the preview must be a smaller version of the export — same
proportions, same relative spacing — not a rearranged one. Then confirm the exported PNG
dimensions are unchanged from before the fix, on both a station-style bar and a Slice bar.

**Exported PNG dimensions confirmed unchanged.** Session 1 (2026-08-01) touched only
the preview node — the export path renders from separate builders into the off-screen
host — and Shane measured a post-fix Slice export at exactly **910×320** (confirmed
2026-08-01). The preview fix did not alter export geometry.

### 12.7 These three bugs are one bug

§12.1, §12.6, and §9 item 2 are the same failure: **the on-screen preview disagrees with
the exported PNG.** (§12.2 is a separate problem — state, not rendering.)

§2.2 records that DOM capture was chosen over canvas rendering specifically so preview and
export would share one code path — "precisely the bug class we care most about avoiding on
a broadcast tool." These bugs are erosion of that guarantee.

Fix them as one invariant, not three tickets: **whatever the producer sees must be what the
PNG contains.** A fix that patches a symptom while leaving preview and export on different
logic is not complete.

---

### 12.8 The `Lower Thirds` Content field is free text — the import needs guard rails

Observed in live production data on 2026-07-31. `fld20wL8p33PxY5Q9` has been a free-text
field for years and producers have used it for whatever they needed. **Any parser or
import change must be tested against the real corpus**, not synthetic cases.

**Shapes present in production:**

| Shape | Example record |
|---|---|
| Bare name, single line | `Sam Brooks` · `Tonya Abari` · `Natalie Lloyd` |
| Comma-format, single line | `Vadis Turner, Artist` · `Kyle Albertson, Opera Singer` |
| Two people, comma-separated | `Kathy Mattea, Becky Magura` |
| Correct blank-line-separated blocks | `Robert Taylor\nPresident…\n\nEse Morrison\n…` |
| Trailing newline | `David Onri Anderson\nPainter\n` |
| Leading whitespace | `" Khalil Ekulona"` |
| Triple newline between blocks | Pad Thai record (`recfWr9x3qC3vhimH`) |
| Camera-direction annotations | `LOOKING CAMERA RIGHT:` · names suffixed `(RIGHT)` / `(LEFT)` |
| Locators + instructions + interviewees in one field | Last Rites (`recTk6pkzv3iv6rYO`) |
| Embedded producer notes | `recKp7zRm2LLZztHd` contains a parenthetical about comma style |
| Placeholder text | `Christina ______________________` |
| Very large sets | Made in the West (`recIGL7oaP3v9K9ha`) — ~25 people |
| **Sentinel junk** | `N/A` · `Done` · `done` · `TBD ` · `Jim Holden (already made)` |
| **Bare URLs as the entire value** | several records hold only a `dropbox.com/scl/...` link |

**Required guards — this is a real defect, not a hypothetical.** Today, importing from a
URL record produces a lower third whose name is a Dropbox URL, and it will render and
export as a broadcast graphic. Before parsing:

1. **Reject the whole field** when the value is only a URL, or matches a sentinel
   (`N/A`, `TBD`, `Done`, case-insensitive, trimmed). Tell the producer the field has no
   usable lower thirds rather than importing garbage.
2. **Whitespace normalization is already done** — `parseLowerThirds` (line 1448) trims
   every line, splits records on blank lines, and drops empties. No work needed here, and
   it is **not** related to §12.1. Leave the parser alone.
3. **Warn on large imports.** Twenty-five entries in one paste is legitimate (Made in the
   West) but should be confirmed, not silently added.
4. **Preview before commit is already the pattern** (§1.9) — keep it, and make the preview
   show exactly what will be created, including entries the guards dropped and why.

**Comma-format is NOT split — confirmed by Shane, 2026-07-31.** `Vadis Turner, Artist`
imports as a single name line with an empty secondary. Shane had to move the secondary
text by hand after importing `Sara DeWitt, Senior VP & General Manager, PBS KIDS and
Education`. Every comma-format record in the corpus carries that same manual-fix cost.

**DECIDED (Shane, 2026-07-31): do not auto-split on commas. Leave `parseLowerThirds`
alone.**

Splitting on the first comma would preserve later commas in the secondary, but it breaks
real records in this corpus:

- `Kathy Mattea, Becky Magura` — two **people**, not a name and a role.
- `Mick Nelson, Ph.D.` — the comma belongs to the name (credential), not a separator.

The existing workflow already solves it: **the bulk/import modal is a live-editable
textarea** (line 417, bound to `bulkText` via `onBulkText`). Importing loads the raw field
text; the producer inserts a line break where a secondary should begin and the numbered
preview re-parses on every keystroke before anything is committed.

This is a **discoverability** gap, not a parser gap. Cover it in the §12.3 tutorial:
*"Imported text is editable before you add it — put each secondary line on its own line."*

Do not "clean up" the Airtable field itself. It is producer-owned working copy and other
workflows may depend on the notes in it.

### 12.9 `Content Type` values observed in production

Episode · Interstitial · Promo · **NPT Brand**

`NPT Brand` is a legacy type on records created 2021–2024, from before the Nashville PBS
rename. The picker groups by this field (§2.7) and must render legacy values correctly
rather than dropping them into an "unknown type" bucket.

## 13. Adding new generators — keep the pattern

### 13.1 Source of truth — read this first

**HARD RULE (Shane, 2026-08-01): Claude Code is the ONLY writer to this repo.**
Design is a sketchpad, not a source of truth. Design cannot read the repo back —
it can only hand work forward. Anything built in Design arrives as markup or a
component to **integrate into the existing `.dc.html` by hand**. Never export
Design's output over the repo folder: its canvas holds a stale copy of this file
and an export would silently revert committed work with no error.

`Nashville PBS - Lower Thirds Studio.dc.html` is the source. `dist/index.html`,
`dist-airtable/index.html`, and `dist-cdn/index.html` are **generated** — and there
is **no local bundler**. Design is the bundler; it produced the dist builds, and no
build command exists in this repo. `dist/index.html` embeds the entire `.dc.html`
source as an escaped JS string with asset URLs rewritten to data URIs.

The workflow, in Code, every time:

1. Edit the `.dc.html`.
2. Patch `dist/index.html` with the committed patcher — see
   [`scripts/patch-dist.md`](scripts/patch-dist.md) **before** improvising anything.
3. Mirror: `cp dist/index.html index.html` (GitHub Pages serves the root file;
   the two must stay byte-identical).
4. Commit and push — that is the deploy.

**Never edit a `dist/` file directly** except through the patcher, and never edit
the root `index.html` except by copying the patched dist over it.

`support.js` is also generated (`dc-runtime`) and carries its own do-not-edit banner.

### 13.2 The extension pattern

Adding a generator should require exactly two things:

1. A new entry in the `SHOWS` config — `label`, `series`, `style`, `base`, `minF`,
   `maxW`, `scale`, plus the relevant flags (`hasLight`, `hasContent`, `canPickSeries`,
   `noSave`, `logoStation`).
2. A `build*Bar` function for the new style, if it doesn't reuse `station`, `box`, or
   `slice`.

**If a new generator requires changing the export pipeline, the fit algorithm
(`fitEl` / `data-fit`), or `saveCollection`, stop.** That means the abstraction needs
widening first. Widen it deliberately, in its own change, then add the generator. Do not
special-case around the pattern — five shows currently share one code path and that is
why the tool is maintainable.

Re-read §1.3 (per-show `scale`), §1.5 (`minF` floors), and §3 (broadcast constraints)
before choosing values for a new template. `minF` is a legibility floor, not a
starting point for taste.

### 13.3 Saving non-lower-third graphics — schema direction

Station ID, Credits, Slice event graphics, and the planned Date/Time tags don't fit the
`Lower Thirds` table's shape (`Name` / `Secondary` / `Light Mode` / `PNG`).

**Do not widen the Lower Thirds table to accommodate them.** Its filename slugs feed the
edit suite's import (§1.10) and existing views and collections depend on its current
shape. Mixing asset families in turns every existing view into a filtered view.

Direction Shane has chosen — confirm specifics with him before building:

- Keep **`Collections` as the shared container** across all asset families. Add an
  `Asset Type` single-select to Collections (Lower Thirds / Station Graphics /
  Date-Time Tags / Credits).
- Add a sibling **`Graphics`** table for non-lower-third assets: `Name`, `Asset Type`,
  `PNG`, `Collection` link, and a **`Payload`** long-text field holding the generator's
  input state as JSON.
- `Payload` is the important part: it means a new generator needs no schema change.
  Date/Time tags store `{date, time, timezone}`; a future template stores whatever it
  needs. Without it, every new generator costs an Airtable migration.
- `POST /save` takes an `assetType` discriminator and routes to `Lower Thirds` or
  `Graphics` accordingly. The Collection upsert, ordering, and ZIP logic stay shared.

Station ID keeps `noSave: true` unless Shane says otherwise (§5) — the new Graphics
table makes saving it *possible*, which is not the same as deciding to.

### 13.4 Surfacing Content on the Collections record

Collections currently shows its Series but not its Content, because the Content link
lives on Lower Thirds (Collections → Lower Thirds → Content).

**DONE — built by Shane 2026-07-31, verified in the base.** Collections now carries:

| Field | ID | Type | Path |
|---|---|---|---|
| Content | `fldiIblRzdnCW3ggO` | **lookup** | Collections → Lower Thirds → Content |
| Editor Email | `fldBUUjd7rmYQ5vcP` | **rollup** | resolves to a real address, e.g. `jbest@wnpt.org` |

**Important: `fldiIblRzdnCW3ggO` is a lookup, not a link field.** It is derived, so:

- **The Worker cannot write to it.** Do not attempt to set it in `saveCollection`.
- It is empty until at least one Lower Third in the collection carries a Content link.
  A WNPT Brand collection saved with no Content picked will have neither field populated.
- **Empty rows return `[null]`, not `[]`.** The "Senior" collection
  (`reclkXkKXoOKlm83t`) demonstrates this. Test any "is not empty" automation condition
  against that record before trusting it.

### 13.5 Where to do the work

- **Design** — new visual templates, the `SHOWS` entries and `build*Bar` functions, and
  the §12.3 tutorial. It holds the design system and gives a live canvas.
- **Claude Code** — Worker changes, Airtable schema, and bugs §12.1, §12.2, §12.4.

Either side can reach the other (Design's Send to Claude Code; the `claude-design` MCP
server from Code). Do not have both editing the `.dc.html` in the same session.

Note for anyone testing in the Design canvas: Airtable-backed features will fail there
with "Failed to fetch." That is CORS, not a bug — see §11.3.

---

### 13.6 Credits — save to Airtable (Shane's spec, 2026-07-31)

Credits has **no Airtable connection at all** today. It is a standalone screen: render,
download, nothing persists. This section is net-new plumbing.

#### Where credits live: on Content, not on a Collection

A credits render belongs to **exactly one Episode**. So the ZIP attaches directly to the
Content record. This is deliberately different from lower thirds:

| | Parent | Home |
|---|---|---|
| Lower thirds | one Content, many per collection | Collections + Lower Thirds |
| **Credits** | **exactly one Episode** | **Content record directly** |
| Station ID, Date/Time tags, Slice event graphics | no single parent | `Graphics` table (§13.3) |

The payoff: **Content already carries `Editor Email` (`fldOjIj0bORhkmXEc`).** Delivering
credits to an editor needs no rollup, no lookup chain through Collections, and none of the
multi-asset-type plumbing §13.7 wrestles with. Do not route credits through Collections.

#### Picker flow — reuse what exists

Same two-step as Nashville PBS Brand (§11.10): **Series first, then Content.** Lift the
existing `openSeries` / `selectSeries` / content-picker components rather than writing new
ones.

One difference: **filter Content to Content Type = Episode.** Other types do not have
credits. Filter server-side in the Worker's `/content` handler — `filterByFormula` uses
field *names*, so `{Content Type}="Episode"` (see §11.7 on why names, not IDs, in
formulas). Field is `fldlzO2mk8sjYJrIQ`.

With Episode-only filtering the picker's Content Type grouping (§10) becomes redundant on
this screen — a flat newest-first list is fine.

#### Both fields now exist — created 2026-07-31

| Field | ID | Type | Role |
|---|---|---|---|
| `Credits` | `fldFvjUTlMa8RRs2W` | long text | Producer-entered source copy. Read by the generator; **never written to** |
| `Credits ZIP` | `fld2CSHQyOIKkKVQD` | attachments | `credits.zip` plus the individual `credits-N.png` pages, written by the Worker |
| `Credits Last Rendered` | `fldB5TRTKQHeY6dli` | dateTime | Written last on a successful save. Sole automation trigger for editor delivery |

Both carry field descriptions in Airtable explaining their role, the `---` page-break
convention, and the upload-then-delete behavior. No further schema work is needed for
credits saving.

#### Round-trip is lossless — do not invent a delimiter

`creditsFields` is an array of long-text blocks. The in-app help states that **"Add page"
and typing `---` on its own line have the same effect** — field boundaries and `---` are
equivalent representations of the same page break. So:

- **Save:** `creditsFields.join("\n---\n")` → the Content `Credits` field.
- **Import:** split on a line containing only `---` → `creditsFields`.

Reuse the existing `---` handling. Open a **preview modal** before committing, as with
Lower Thirds import (§1.9).

#### Read-only on the source field

**DECIDED (Shane, 2026-07-31): the generator reads `Credits` and never writes to it.**
Producer copy is never overwritten by the tool. A wording fix made inside the generator
lives in the saved ZIP only; the producer must edit Airtable separately for it to persist.

#### Saving the output

- One save = one ZIP (`credits.zip`) on the Content record, plus all page PNGs
  (`credits-1.png` … `credits-N.png`, §3).
- **Upload-then-delete** on every attachment write (§11.5 #3). This matters more here than
  anywhere else — a seven-page render is seven chances to fail mid-sequence, and the old
  behavior would leave the field empty.
- Respect the Worker's 220 ms inter-request pacing; surface progress (§9 item 7).
- **Render settings are NOT stored** (Shane, 2026-07-31). No settings field. Column count
  and copyright-year override are re-picked at render time. The editable source of truth
  is the `Credits` long-text field itself: a producer edits it in Airtable, someone
  regenerates, the output is replaced. Do not add a settings field without Shane asking.

#### Delivery to the editor — trigger design

**Editing the `Credits` field sends nothing. Regenerating sends.** That separation is
deliberate: a producer correcting text in Airtable has not produced a new ZIP, and mailing
the editor a stale file is worse than mailing nothing.

**Do not trigger on the Content record updating.** Content records are written constantly
by formulas, status rollups, and the miniExtensions forms — an update trigger would fire
continuously. **Do not trigger on `Credits ZIP` changing** either; upload-then-delete
(§11.5 #3) touches that field twice per save, so the editor would get two emails each time.

**Field exists: `Credits Last Rendered` (`fldB5TRTKQHeY6dli`, dateTime, Central).** The Worker writes it as
the **very last step** of a successful credits save. The automation watches only that field.

- One write → one email.
- A failed save never stamps → a broken ZIP is never mailed.
- Re-saving after a correction rewrites the stamp → the editor is re-sent automatically.

**No "send to editor" checkbox.** Shane's requirement is explicit: corrections must reach
the editor. A checkbox is the step people forget, and the resulting failure — an editor
cutting from superseded credits — is the expensive one.

**Every successful save sends.** If someone saves three times while iterating, the editor
receives three emails. Accepted. Mitigate with information rather than logic: put the page
count and the render timestamp in the subject line so the newest is obvious. Do not build
suppression or debounce.

**Automation shape:**
- Trigger: Content record updated, watching **only** `Credits Last Rendered` (`fldB5TRTKQHeY6dli`).
- Condition: `Credits ZIP` is not empty **and** `Editor Email` (`fldOjIj0bORhkmXEc`) has an
  address. Test the empty case against a real record before trusting it — the Collections
  rollup returns `[null]` rather than empty (§13.4), and lookups on Content may behave the
  same way.
- Action: email the editor, attach `Credits ZIP`, subject carrying the Content title, page
  count, and render timestamp.

Simpler than the lower-thirds equivalent in §13.7 because the trigger field, the ZIP, and
the editor address all live on the same record. No rollup, no Collections involvement.

### 13.7 Deliver finished graphics to the project editor (Shane, requested 2026-07-31)

**Goal:** when a collection is saved, the editor assigned to that project receives the
graphics automatically, rather than Shane forwarding a ZIP by hand.

**Do not route images through a lookup.** The Collection record already holds the ZIP
attachment (`fldjRV74OzOVVKXrM`), so an Airtable automation triggered on that record can
attach it directly. Only the editor's **email address** needs to travel by lookup, and
that is plain text.

**Verified chain (2026-07-31):**

```
Collections (tblcS0voNB7RZg5ck)
  └─ Content link            ← DOES NOT EXIST YET (§13.4)
       Content (tbl7u0utEYTfwPya9)
         └─ Editor  fldAbWvjD35z54HMw   (link → User Table)
              User Table (tbl7qTD9DIc3itsMj)
                └─ Email  fldPhtBOmLuOIi6J0   (email)
                   Name   fldorgfIijrt3mLEL
```

A Producer link also exists on Content (`fldIXMfBavDPkFSTL`) with its own email lookup
(`fldOZdJyFQXrAZzcZ`). **Shane has decided: editor only.** Do not cc the producer.

**Schema is DONE — Shane built it 2026-07-31, verified in the base:**

- Content already had `Editor Email` (`fldOjIj0bORhkmXEc`, lookup → `fldPhtBOmLuOIi6J0`).
- Collections now has `Content` (`fldiIblRzdnCW3ggO`, lookup via Lower Thirds) and
  `Editor Email` (`fldBUUjd7rmYQ5vcP`, rollup). The rollup returns real addresses.

No further schema work is required for this feature. Note §13.4: the Collections Content
field is a **lookup**, so nothing writes to it.

**DECIDED: editor only, ZIP only.** Do not cc the producer. Do not attach individual PNGs.

**Corrections MUST re-send (Shane, explicit).** If someone fixes a mistake in the design
files, the editor gets the new ZIP. Do **not** add a send-once guard.

**The trigger is the hard part — get this right or editors get spammed.**

`saveCollection` writes to the Collection record several times per save (§11.5): the
upsert, the link-array rewrite, then clear-ZIP followed by upload-ZIP. So:

- ❌ "When record created or updated" → fires 3–4× per save.
- ❌ "When record updated, watching ZIP" → still fires twice (the clear, then the upload).

**Do this instead:** add a `Delivered At` datetime field to Collections and have the
Worker write it **once, at the very end of `saveCollection`, only on full success.**
Trigger the automation on that field changing.

- One write → one email.
- Re-saving after a correction rewrites the stamp → editor is re-sent automatically,
  which is exactly the required behavior.
- A failed save never stamps, so a broken ZIP is never mailed.

This is a small Worker change (one extra PATCH) plus one new field. It is the only
approach here that satisfies "re-send on correction" without duplicate emails.

**Guard the empty case.** Add an automation condition that `Editor Email`
(`fldBUUjd7rmYQ5vcP`) has a real address — and verify that condition against
`reclkXkKXoOKlm83t`, which returns `[null]` rather than empty (§13.4). WNPT Brand
collections saved with no Content picked have no editor and must not attempt to send.

**Credits deliver the same way, but simpler — see §13.6.** Credits attach to the Content
record, which already carries `Editor Email` (`fldOjIj0bORhkmXEc`). Same pattern: Worker
writes a `Delivered At` stamp last, automation triggers on that field, attaches the ZIP,
sends to the editor. No rollup, no Collections involvement, and none of the empty-`[null]`
edge case above.

**Note for future asset types.** The Collections `Editor Email` rollup
(`fldBUUjd7rmYQ5vcP`) routes through the **Lower Thirds** link, so it resolves only for
lower-third collections. If a `Graphics`-backed collection (§13.3) ever needs editor
delivery, that rollup returns nothing. Solve it then, and prefer a **direct `Content` link
on Collections** — writable by the Worker, one lookup, works for every asset type — over
adding a parallel rollup per table. Station IDs and Date/Time tags have no project editor,
so this may never come up.

**Sequencing:** this depends on §13.4 (Content link on Collections) and is therefore
session 4+ work. Do not attempt it during the bug-fix sessions.

## 14. Things this document deliberately does not cover

Repo layout, build/bundling pipeline, hosting, deployment process, Airtable base
configuration and permissions, and how the generated PNGs are ingested by the edit suite:
Deployment, the Worker contract, the Airtable base and table/field IDs, and the write
path **are** documented — see §11.

Still uncovered: the bundling pipeline's exact invocation, and how the edit suite ingests
the generated PNGs. The latter is **outside Shane's control and out of scope** — do not
raise it. The filename convention in §1.10 is the only contract that matters on that side;
keep it stable.

---
