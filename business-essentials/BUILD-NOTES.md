# BUILD-NOTES — Business Essentials

The handoff notes for `business-essentials/index.html`, kept with the page. Read this
before changing the layout, the artwork, or the export. Repo-side context — how the page
is wired into the studio, the Worker, and the CMYK export — is in `build.md` §13.9.

---

## Hard rules — do not "improve" these

(From the handoff's own CLAUDE.md. Every one of these was learned the expensive way.)

- **Type floors are print-legibility floors.** The card canvas is 540px wide for a 270pt
  bleed box: exactly **2px per point**. `Component.FLOORS` = card name 14px (7pt), card
  title 12px (6pt), tag name 20px (10pt), tag title 12px (6pt). Do not lower them. When
  text won't fit at the floor the tool shows a warning — that is the intended behaviour,
  not a bug to "fix" by shrinking further.
- **Circle Crop padding (PBS Brand Guide p41)** is enforced on **both** faces: *inside*
  the crop, text stops at the chord (canvas x 306); *outside*, elements clear the curve
  by 10% of layout height (28.8px). Positions were solved against the real arc — don't
  nudge them by eye. Numbers below.
- **Brand SVGs use inline `fill` attributes, never a `<style>` block.** Style blocks have
  been silently stripped on save, reverting artwork to black. The CMYK export also reads
  those `fill` attributes directly — a CSS-class refactor would export black.
- **The pattern's shape→colour mapping**: background rect + *both* profile shapes = PBS
  Blue; large curved mass + circle = Navy. Filling a profile navy destroys the repeating
  heads. It was derived empirically, not guessed.
- **The QR is vector, normal polarity, PBS Blue on white**, decoded module-for-module
  from the source PNG. Don't invert or hand-edit the paths. To replace it, decode a clean
  PNG to its module grid and re-emit rects.
- **CMYK comes from `print-colors.json`** (PBS Brand Guide). Never convert from hex — a
  naive conversion of PBS Blue gives C81 M71 Y0 K23 instead of the real C100 M65 Y0 K0.
- **The back card's arc is the front pattern's own path**, rendered with
  `preserveAspectRatio="xMidYMid slice"` so both faces share one circle crop by
  construction. Don't replace it with a hand-written `clip-path` — that was tried and
  didn't match.
- **Every text run is a single line** (`white-space:nowrap`). The vector export draws a
  run on one line and warns if it ever wraps.

### Data rules

- Office phone falls back to the station number **(615) 259-9325** when the User record's
  `Business Phone Number` is empty.
- The cell line renders **only** when there's a value. It must not leave an empty line.
- The address block **bottom-aligns with the last line of the contact block** — both are
  anchored with the same `bottom` value, whether or not the cell line is present.
- Every field stays manually editable regardless of what Airtable supplied.
- `Archived` on Graphics is **not** written by the Worker — it's an Airtable automation,
  "Graphics — archive superseded cards and name tags", which exists as a **draft that has
  to be switched on in the Airtable UI** (build.md §13.9.1). Rows with no `User Table`
  link are left alone by design.
- **Download** is always the tab you're on. **Download both (ZIP)** and **Save** cover both
  outputs once both are complete — name + title for the tag, name + title + email for the
  card. The Save button's label always states what it is about to write.

### Before you call it done

- Both faces still inside trim, nothing crossing the dashed guides.
- Long name *and* long title (50+ characters) → warning appears, type holds at the floor.
- Cell phone empty → no orphan line, address still bottom-aligned.
- Export both outputs and check page sizes: card 310×202pt / 2 pages, tag 274×148pt /
  1 page, crop marks present outside the bleed.

Ask Shane before changing trim sizes, brand colours, the arc, the crop-padding rules, or
the Airtable schema.

---

## What changed when this was integrated (2026-08-13)

The notes below are the handoff verbatim. Three things they describe as open or stubbed
are done, so read them with these corrections in hand:

1. **The Worker is wired and deployed.** Its endpoints live in
   `worker/lower-thirds-worker.js`, not a separate Worker file. The placeholder table IDs
   are replaced with real ones, and three of the handoff's guessed field names were wrong
   (`Attachments`, `User Table`, `Archived`). See build.md §13.9 for the table.
2. **The export is true CMYK vector.** Section "Colour mode of the exported PDF" below
   describes a 600dpi RGB raster with vector crop marks — that is history. Nothing is
   rasterised now, `EXPORT_DPI`/`EXPORT_RATIO` are gone, and every colour in the file is
   DeviceCMYK from `print-colors.json`.
3. **The launcher tile exists**, as an `<a href="business-essentials/">` card in the
   studio's MISC grid, built from the studio's own tile markup rather than the standalone
   CSS the last section of these notes proposes. That section is kept for its rationale
   only — the classes in it are not used anywhere.

Also note: **`reference/` is not in this repo.** Those InDesign JPGs are geometry-accurate
but *not* colour-accurate (the CMYK→sRGB conversion shifted the blues to ≈`#005698`/
`#13376f`), so they are deliberately absent — there is nothing here to sample by mistake.
They remain in the original handoff zip if positions ever need re-measuring.

---

# business-essentials.md — Business Essentials (cards + name tags)

Handoff notes for Claude Code. Source: `Business Essentials.dc.html` (template +
logic, one file). Worker proxy: `worker/business-essentials-worker.js` (stub —
table/field IDs are placeholders, see below).

## What it does

One generator, two outputs, picked by tab in the sidebar:
- **Business card** — front (static, station-branded) + back (personalized), exported
  as a single 2-page print PDF.
- **Name tag** — single card, exported as a single 1-page print PDF.

Fields (Name, Title, Email, Office phone) are always manually editable, and can
optionally be prefilled by searching the Airtable **User table** (sidebar "Find in
User Table"). Cell phone is manual-only — there's no source field for it.

## Print specs (matched to the supplied InDesign masters)

- Business card: **3.5×2in trim**, 0.125in bleed (from `Nashville-PBS-Business-Cards`
  InDesign layout — `21p0 × 12p0`, bleed `0p9`).
- Name tag: **3×1.25in trim**, 0.125in bleed (read directly from the `TrimBox`/
  `BleedBox` in the supplied `name-tags.pdf`).
- Exported PDF pages add extra margin beyond the bleed so crop marks have room to sit
  outside the bleed area without touching it (mark length 14pt, 6pt gap, matching
  common prepress convention). Marks are vector (true black), independent of the
  card art.

## Colors — official CMYK (from the PBS Brand Guide)

The station supplied the real values from the PBS Brand Guide's Primary Palette. These are
recorded machine-readably in **`print-colors.json`**. The guide is explicit: *CMYK is for
print; hex/RGB are for digital use only.* PMS is recorded for reference but **not** used —
the station's vendors generally can't run spot.

| Role on the card | Token | Hex | CMYK | PMS |
|---|---|---|---|---|
| Pattern field, QR modules | PBS Blue | `#2638C4` | **C100 M65 Y0 K0** | 293 |
| Head silhouettes, back plate, address | Navy Blue | `#0A145A` | **C100 M95 Y0 K42** | 2757 |
| Handle line, social icons, title | Teal | `#48D3CD` | **C49 M0 Y23 K0** | 3252 |
| QR background | White | `#FFFFFF` | C0 M0 Y0 K0 | — |
| Crop marks | — | — | **K-only (C0 M0 Y0 K100)** | — |

Also in the guide but unused on this card: Medium Blue `#0F1E8C` C100 M80 Y0 K21 (PMS 280),
Yellow `#FFCF00` C0 M9 Y100 K0 (PMS 109), Coral `#FE704E` C0 M59 Y50 K0 (PMS 2345).

⚠️ **Do not derive CMYK from the hex values.** A naive RGB→CMYK conversion of PBS Blue gives
about C81 M71 Y0 K23, which is wrong — the real build is C100 M65 Y0 K0. An earlier revision
of this document contained those computed numbers; they have been replaced.

⚠️ **The reference JPEGs are not colour-accurate.** They were exported from InDesign as JPG
(because the layered PDFs couldn't be read here) and the CMYK→sRGB conversion shifted the
blues to roughly `#005698`/`#13376f`. Sample those files for *geometry only*, never colour.

### Colour mode of the exported PDF
Crop marks are drawn as **K-only black** via `pdf-lib`'s `cmyk()`. The card artwork is a
600dpi raster embedded as **RGB**, because browsers have no device-CMYK raster pipeline —
so the values above are what the artwork *converts to*, not what is embedded. To ship
genuinely separated CMYK, in order of effort:
1. Let the vendor's RIP convert using the table above as the target (normal for most shops).
2. Add a server-side conversion in the Worker (Ghostscript container, or Adobe PDF Services)
   that re-processes the PDF to CMYK before it reaches Airtable.
3. Rebuild the export as native vector + text with `drawSvgPath` + `cmyk()`. This is the only
   fully-correct route and is **now unblocked**: the pattern, plate and QR are all vector, and
   the station supplied PBS Sans as TTF — `fonts/PBSSans{,-Medium,-Bold,-Black}.ttf` are in
   the project for `pdf-lib` + `@pdf-lib/fontkit` to embed. **Not yet implemented** — this is
   the recommended next piece of work. The `.woff2` files stay for on-screen rendering.

## Export resolution

Exports render at **600dpi** (`EXPORT_DPI`/`EXPORT_RATIO` on the logic class). The cards are
authored at 2px per point (144ppi), so the capture pixel ratio is 600/144 ≈ 4.167 — a
business card face comes out 2250×1350px. An earlier revision used 2.5 (360dpi), which
looked soft in print. Don't lower this without a reason.

## Front card art

`assets/card-front-pattern.svg` and `assets/app-qr-white.svg` are the user's own
InDesign/Illustrator masters (`uploads/Brand_Graphic_Template_Symbol Crop_Print_version 1.svg`,
`uploads/app-qr.svg`), copied in and given explicit `fill` colors — they shipped with
an empty `<defs>` (same issue as the design system's original logo files), so a
`<style>` block was added assigning navy/blue to the pattern and white to the QR
modules (functionally a same-code negative/reversed QR, which scans fine against the
navy background it sits on).

Per the station's instruction, the app callout text on the front reads **"DOWNLOAD /
THE APP"** (was "WATCH ON THE / PBS APP").

### ⚠️ The shape→color mapping is load-bearing — don't "tidy" it
The pattern art has five shapes and only two colors, and the mapping is *not* intuitive:

| Shape (original class) | Color | Why |
|---|---|---|
| background `rect` | PBS Blue (field) | |
| big curved mass | Navy | the dominant shape |
| stem profile | **PBS Blue** | reads as a cutout through the navy |
| inner profile | **PBS Blue** | ← makes the *repeating heads* read |
| circle ("eye") | Navy | |

The two PBS-Blue profile shapes are what carve the navy mass into three staggered head
silhouettes. Filling either of them navy collapses the whole pattern into one solid blob.
This mapping was derived empirically (each shape rendered in a unique probe color, then
matched against the reference artwork), not guessed.

### SVG assets: no `<style>` blocks
Both `assets/card-front-pattern.svg` and `assets/app-qr.svg` use **inline `fill`
attributes**. The original files shipped with an empty `<defs>` and class-based fills, so
everything rendered black. Note that writing a `<style>` block into an SVG in this
environment does not survive the save (it is stripped), so inline `fill` is the only
reliable route — do not "refactor" these back to CSS classes.

### QR code — rebuilt as vector from a clean source
`assets/app-qr.svg` is **generated**, not the original supplied file. The station provided a
clean 930×930 PNG of the code; that was decoded to its module grid (29×29 modules, QR
version 3, 30px per module, all three finder patterns validated) and re-emitted as crisp
vector rects — white background, PBS Blue modules, 2-module quiet zone. The rebuild was
verified **module-for-module identical** to the source (841/841 modules matched).

Two earlier attempts failed and are worth not repeating: the original vendor SVG had
class-based fills with an empty `<defs>` (rendered black), and recolouring it by hand
inverted the polarity so the finder patterns filled as solid blocks. If the code ever needs
to change, get a clean PNG or the raw URL and re-run the grid extraction rather than editing
paths by hand.

## Back card curve — the same arc as the front, by construction

The back plate is **the front pattern's own big curved path**, rendered as an inline
`<svg>` with `preserveAspectRatio="xMidYMid slice"` — the identical scale/crop the front
uses. So the two faces share one circle crop by construction rather than by eye. Do not
replace this with a hand-written `clip-path`; an earlier version did that and the curve
did not match the front.

## Circle Crop padding — PBS Brand Guide p41

Both rules from the guide are enforced on **both faces** — the front and the back share the
same arc, so the same clearances apply to each. (A revision of this tool applied them to the
back only; the front logo and app callout were sitting 18.5px and 2.4px off the curve.)

- **Inside the crop:** text must not extend past a straight line from the top of the curve to
  the bottom of the curve. That chord sits where the arc meets the card edges — art x 693.3,
  i.e. **canvas x 306**. The name/title box is therefore capped at `right:234px` (540−306) and
  the name's shrink-to-fit width is 252px, so a long name shortens rather than crossing it.
- **Outside the crop:** minimum padding between text and the curve is **10% of the layout
  height** = 28.8px on the 288px trim height. The curve's x at each element's own vertical
  band was solved from the arc (centre art (170.8, 396), R 655.6) and each element placed
  beyond it:

  | Face | Element | Curve x over its band | Placement | Clearance |
  |---|---|---|---|---|
  | Back | Logo | 351.5 | `right:36px` (left 381) | 29.5px |
  | Back | Address | 355.7 | `left:385px` | 29.3px |
  | Front | Logo | 351.5 | `right:44px` (left 381) | 29.5px |
  | Front | App callout | 355.9 | `right:44px`, `width:111px` (left 385) | 29.1px |

  The front callout carries an **explicit `width:111px`** so its left edge is pinned at 385
  regardless of how the text measures — that's what guarantees the clearance rather than
  relying on font metrics. Its QR (40px) and type (10/14px) were sized down to fit that box.

Note this pushes elements slightly further right than the supplied reference had them — the
original artwork sits ~10px off the curve on the back and effectively touches it on the
front, short of its own 10% rule. The guide was treated as authoritative. If the station
would rather match the existing printed card, the numbers to relax are in the table above.

## Layout is measured, not eyeballed

Every element position and type size on both faces was derived by pixel-measuring the
supplied reference exports (element bounding boxes as fractions of the trim box, then
mapped onto the canvas). Notably:
- The left contact column sits at 7.2% of trim width from the trim edge.
- **The address block bottom-aligns with the last line of the contact block** (both at
  87.9% of trim height in the original) — this is why both are anchored with the same
  `bottom` value rather than absolute `top`s. It holds whether or not the cell line is
  present.
- The type scale is much smaller than it looks on screen: the measured name is ~20px on the
  540×324 authoring canvas, not ~34px. An earlier version ran ~1.7× oversized throughout.
- **Type floors are print-legibility floors, not aesthetics — do not lower them.** The cards
  are authored at 2px per point, so the px floors on `Component.FLOORS` convert directly:
  card name 14px = 7pt, card title 12px = 6pt, tag name 20px = 10pt, tag title 12px = 6pt.
  An earlier revision used 8–9px floors, which let an ordinary 42-character title shrink to
  5pt and a 52-character one to 4pt — unprintable, and it silently crossed the Circle Crop
  chord with no feedback.
- **When text won't fit at the floor, the tool says so instead of shrinking further.**
  `fitEl` returns whether the text actually fits; `fitAll` collects the failures and shows a
  warning in the sidebar naming the offending field. This is deliberate: the alternatives are
  illegible type or a silent brand-rule breach. (The sibling tools' `build.md` §9 lists
  "minF is a hard stop with no user feedback" as a known gap — this is that gap closed.)
- **The name size is user-adjustable** (sidebar slider, 14–44px, default 24 on the card and 35
  on the name tag, with Reset). The station asked for manual control because auto-fit alone
  wasn't giving them the presence they wanted. Auto-shrink still applies as a backstop, but
  only when the name would cross the Circle Crop chord — that's a brand rule, not taste.

## Airtable wiring — what's stubbed vs. what needs filling in

`worker/business-essentials-worker.js` mirrors `worker/lower-thirds-worker.js`'s
pattern (same `Airtable` client class, same CORS/secret setup). It implements:
- `GET /users?search=` — search the User table by Name.
- `POST /save-graphic` — create one Graphics record + upload the PDF as its attachment.

**Placeholders that need real values before this works — UNKNOWN, ask the station:**
- `T_USERS`, `T_GRAPHICS` — real table IDs (or names) for User table and the new
  Graphics table.
- Field name constants at the top of the worker (`F_USER_*`, `F_G_*`) — confirm they
  match the real column names exactly (Airtable field names are case-sensitive in the
  API).
- Graphics table needs: `Name` (text), `Graphics Type` (single select with at least
  "Business Card" and "Name Tag" options), `Attachment` (attachment field), `Created`
  (date field), `User` (link field → User table). `Archive` (checkbox) is **not**
  written by this Worker — see below.
- Deploy the Worker (same Cloudflare Workers flow as the lower-thirds one) and point
  the tool at it via the header's "Connect Airtable" button (stored in
  `localStorage["be_worker_url"]`, same pattern as the Lower Thirds tool's
  `lt_worker_url`).

## Archive-on-supersede — intentionally left to an Airtable automation

Per the brief: when a person's card/tag is regenerated, the older Graphics row for
that same person + Graphics Type should get its **Archive** checkbox set. This Worker
does not do that — it only creates new rows. Recommended: an Airtable automation
triggered on new Graphics records that finds other rows with the same `User` link +
same `Graphics Type` + `Archive` unchecked, and checks `Archive` on all but the
newest. Doing this as a query-then-write in the Worker instead would need a race-safe
"find and update" step per save; Airtable's own automation trigger is simpler and
avoids a duplicate-detection bug class.

## Bleed and crop marks — yes, on both outputs

Both the business card and the name tag go through the same `addPrintPage()` routine, so
both PDFs carry bleed and crop marks:

| | Trim | Bleed | PDF page size |
|---|---|---|---|
| Business card | 3.5×2in (252×144pt) | 0.125in (9pt) | 310×202pt (2 pages: front, back) |
| Name tag | 3×1.25in (216×90pt) | 0.125in (9pt) | 274×148pt (1 page) |

The page is trim + 2×(bleed 9pt + gap 6pt + mark 14pt) = trim + 58pt, so the marks sit in
clear space *outside* the bleed box and never touch live art. Artwork is placed at the full
bleed size (trim + 18pt), and eight marks are drawn at the four trim corners.

## Social row + Business Cell Phone

- The back card's top-left block is now `@nashvillepbs` plus Facebook / Instagram /
  LinkedIn / YouTube line icons, with `wnpt.org` on the line beneath. Icons are inline
  stroke SVGs in the Lucide style the design system sanctions (~2px stroke, rounded joins).
- The Worker reads **`Business Cell Phone`** from the User table (`F_USER_CELL`). It
  prefills the Cell field; the cell line only renders when a value is present, and whoever
  is using the tool can always type one in manually.
- Office phone still falls back to the station number `(615) 259-9325` when the User
  record's `Business Phone Number` is empty.

## Naming convention

- Downloaded PDF filename: `{name-slug}-business-card.pdf` or `{name-slug}-name-tag.pdf`.
- Airtable Graphics record `Name` field: `"{Person Name} - {Graphics Type} - {Date}"`,
  e.g. `"Becky Magura - Business Card - 2026-08-13"`.

## Things not covered here

Exact Airtable base ID, table/field IDs, User table's real field names beyond what
was described in chat (Name, Title, Email, Business Phone Number), and Worker
deployment/hosting: **UNKNOWN — confirm with the station before wiring this live.**


---

# Launcher tile for the generator hub page

Add this to the hub page (the one at `nashvillepbs.github.io/wnpt-lowerthird/`), **under the
`Misc` section**:

- **Label:** `Business Essentials`
- **Description:** `Business Card and Name Tag`
- **Links to:** the bundled `Business Essentials` page
- **Section:** `Misc`

⚠️ **Assumption to check.** The published hub page is a self-unpacking bundle, so its live
markup could not be read to copy exact classes. The spec below is built from the tool
family's own established vocabulary (the same tokens the Lower Thirds tools use — see
`build.md` §7). If the hub has its own tile component, use it and only take the label,
description and section from above.

## Tile markup

```html
<a class="tool-tile" href="business-essentials.html">
  <span class="tool-tile__icon" aria-hidden="true">
    <!-- card + person glyph, 2px stroke, rounded joins (Lucide style) -->
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"></rect>
      <circle cx="8" cy="11" r="2"></circle>
      <path d="M5 16c.7-1.4 1.8-2 3-2s2.3.6 3 2"></path>
      <path d="M15 10h4M15 14h2"></path>
    </svg>
  </span>
  <span class="tool-tile__text">
    <span class="tool-tile__name">Business Essentials</span>
    <span class="tool-tile__desc">Business Card and Name Tag</span>
  </span>
  <svg class="tool-tile__chev" width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
</a>
```

## Tile styles

These are the values the generator UIs already use, so the tile will sit consistently
alongside the existing ones.

```css
.tool-tile{
  display:flex; align-items:center; gap:14px;
  padding:16px 18px;
  background:#fff;
  border:1.5px solid #e4e7f1;
  border-radius:14px;                 /* card radius used across these tools */
  text-decoration:none;
  font-family:"PBS Sans", Arial, sans-serif;
  color:#0A145A;
  box-shadow:0 1px 3px rgba(10,20,90,.06);
  transition:background .15s ease, border-color .15s ease,
             box-shadow .15s ease, transform .15s ease;
}
.tool-tile:hover{
  background:#f4f6fc;
  border-color:#2638C4;               /* PBS Blue */
  box-shadow:0 6px 18px rgba(10,20,90,.10);
  transform:translateY(-2px);         /* the 2px lift the brand uses */
  text-decoration:none;
}
.tool-tile:active{ border-color:#0A145A; transform:translateY(0); }
.tool-tile:focus-visible{ outline:3px solid #486CD8; outline-offset:2px; }

.tool-tile__icon{
  display:flex; align-items:center; justify-content:center;
  width:40px; height:40px; flex:none;
  border-radius:10px;
  background:#eef1fb; color:#2638C4;
}
.tool-tile__text{ display:flex; flex-direction:column; gap:2px; min-width:0; }
.tool-tile__name{
  font-weight:800; font-size:16px; letter-spacing:-.01em; color:#0A145A;
}
.tool-tile__desc{
  font-weight:500; font-size:13px; line-height:1.4; color:#5a6180;
}
.tool-tile__chev{ margin-left:auto; flex:none; color:#9aa2bd; }
.tool-tile:hover .tool-tile__chev{ color:#2638C4; }
```

## Section heading

If `Misc` doesn't exist yet, match the eyebrow style the tools use for section labels:

```css
.tool-section__label{
  font-family:"PBS Sans", Arial, sans-serif;
  font-weight:800; font-size:13px; letter-spacing:.06em;
  text-transform:uppercase; color:#5a6180;
  margin:0 0 12px;
}
```

```html
<h2 class="tool-section__label">Misc</h2>
```

Grid for the tiles, if one is needed: `display:grid; gap:14px;
grid-template-columns:repeat(auto-fill,minmax(320px,1fr));`.

Sentence case for the label and description (brand voice rule); uppercase is reserved for
the small section eyebrow.
