# Handoff: Cloud Session Sync for the Pledge Graphics Generator

## Overview
The Pledge Graphics Generator is a working, client-side-only tool (built as a single HTML file) that lets Nashville PBS staff turn a pledge gift sheet into broadcast-ready PNG graphics. It is fully functional today, but session state (the graphics queue, positions, and especially uploaded gift images) only lives in one browser's memory/localStorage. On pledge night, a *different* person on a *different* machine needs to open the tool, see the current state of every graphic exactly as it was left, fix one, and export just that PNG — without re-uploading anything.

This handoff asks for a **backend sync layer** added on top of the existing tool, mirroring the architecture already used for the station's lower-thirds generator: **Airtable as the data store, a Cloudflare Worker as the API/auth boundary.** The UI, layout math, background removal, canvas drawing, and PNG export logic are all done and should not be redesigned — only the persistence layer changes, from `localStorage` + in-memory blobs to continuous cloud sync.

## About the Design Files
`Pledge Graphics Generator.dc.html` in this folder is the **current, fully working implementation** — not a mockup. It is a real single-file app (inline-styled markup + a plain JS class-based render loop) that already does everything except cloud persistence. Treat it as the reference implementation and starting point: recreate/extend it in whatever stack fits the target deployment (a plain static site calling the Worker is simplest and matches the existing file's architecture; no framework is required). `sheet-parser.js` (CSV/XLSX parsing) can be used as-is.

## Fidelity
**High-fidelity, functional reference** — this is not a visual mock. The visual design, broadcast-safe positioning (SPEC constants), background-removal algorithm, and export logic in the file are final and should be preserved exactly. The only work is: (1) swap local persistence for cloud persistence, (2) make the queue shared/multi-user instead of per-browser.

## What Needs to Change
### Today (client-only)
- `state.queue` (array of graphic items: mode, title, amount, label, annual, layout offsets, titleScale, program, filename) persists to `localStorage` under key `ppg-v1`.
- Uploaded gift images are held as `URL.createObjectURL()` blobs in an in-memory `this.store` map — **never persisted**. Reload the page or open a different machine and every image is gone, even though the queue metadata survives (on that one browser).
- The uploaded gift sheet (CSV/XLSX) is parsed in-memory and not stored at all.

### Needed (cloud-backed)
- **Continuous auto-save**: every edit (drag, text change, image add/remove, title, amount, layout) should debounce (~800ms–1.5s, matching the existing `persist()` debounce pattern already in the file) and push the full current queue item to the backend. No explicit "Save" step — it should always reflect the latest state, like the lower-thirds tool.
- **Shared session, not per-browser**: anyone with access to the tool should load the same live queue, regardless of device. There is no login/multi-tenant requirement — treat it as one shared "current pledge session" (see Data Model).
- **Images must round-trip through the cloud**, not just metadata. A person on a different machine needs to see and re-export the *exact* graphic, including its uploaded photo(s) and whatever background-removal state was applied.
- **No long-term reuse requirement**: per the station, these graphics are not reused pledge-to-pledge. It's fine (and encouraged) to support clearing/archiving a session between pledge periods rather than accumulating indefinitely — a manual "Clear session" action is sufficient; no versioning/history UI is required.

## Data Model (Airtable)
Suggested base — one table, `QueueItems`, one row per graphic in the queue:

| Field | Type | Notes |
|---|---|---|
| `itemId` | Single line text | Stable client-generated id (already exists as `item.id` in the code) |
| `order` | Number | Position in the queue, for stable ordering |
| `mode` | Single select | `standard` / `ticket` / `show` |
| `program` | Single line text | Show/program this gift belongs to (drives per-show numbering + export folder) |
| `showOf` | Single line text | For show-screen items, which program they represent |
| `title` | Long text | Gift title / show title (line breaks matter) |
| `amount`, `label`, `annual` | Single line text | Donation circle fields |
| `showSecondary` | Checkbox | Whether the "or $X Annual" circle shows |
| `titleScale` | Number | Title size multiplier |
| `layoutJson` | Long text (JSON) | The `{c1,c2,title}` drag-offset object |
| `filename` | Single line text | User override filename, if set |
| `images` | Attachment | **One attachment field, multiple files** — the original uploaded image(s) for this item |
| `imageMetaJson` | Long text (JSON) | Per-image x/y/w/ar/removeBg/tol, keyed by attachment filename, so layout + background-removal settings survive |
| `updatedAt` | Last modified time | Airtable-native, for debugging/ordering |

A second table, `SheetUpload`, single row: the last-uploaded gift sheet as an Attachment field plus the parsed `sheetName`/`gifts` JSON, so a fresh device doesn't need the Excel re-uploaded to see gift names/levels (uploading images and fixing a graphic doesn't require the original sheet, but restoring full context does).

## API (Cloudflare Worker)
The Worker is the only thing holding the Airtable API key — the client never talks to Airtable directly (same pattern as the lower-thirds tool). Suggested endpoints:

- `GET /api/queue` — returns the full current queue (all `QueueItems` rows, image attachments included as URLs), plus the last sheet upload if present.
- `PATCH /api/queue/:itemId` — upsert one item's fields (debounced client-side, called on every edit).
- `POST /api/queue/:itemId/image` — upload a new image for an item. Accept the raw file (multipart or base64) and use Airtable's attachment upload API (`POST .../{recordId}/{attachmentFieldId}/uploadAttachment`, base64 body) so no separate object storage is needed.
- `DELETE /api/queue/:itemId` — remove an item from the queue.
- `DELETE /api/queue/:itemId/image/:filename` — remove a single image from an item.
- `POST /api/sheet` — upload/replace the gift sheet (stores the file + a re-parsed JSON of gifts/programs).
- `POST /api/session/clear` — wipe the queue for a new pledge period.

## Interactions & Behavior
- On load, the client calls `GET /api/queue` and rebuilds `state.queue` + re-hydrates `this.store` (image objects) from the returned attachment URLs, exactly like today's app rebuilds from `localStorage` + already-loaded images — the rendering/canvas code is unchanged.
- Every mutation that currently calls `this.persist()` (see `updateCur`, `patchImage`, drag handlers, etc. in the file) should additionally trigger a debounced `PATCH /api/queue/:itemId`.
- New image uploads (`addFiles`, `loadImageFromUrl`) should, after local background-removal processing, upload the **processed result is not needed server-side** — store the *original* image (background removal is deterministic and re-run client-side from the stored per-image `tol`/`removeBg` settings in `imageMetaJson`) to keep payloads small and avoid re-uploading on every strength-slider tweak.
- Export (single PNG, per-tab, "Export all" zip) stays 100% client-side and unchanged — it only reads from the already-hydrated in-memory state.
- If the Worker/Airtable is unreachable, keep the existing `localStorage` behavior as an offline fallback so the tool doesn't become unusable mid-pledge-night due to a network hiccup — sync back up once reachable.

## Design Tokens / Visual Spec
No visual changes. All positioning, colors, and type live in the `SPEC` constant and inline styles inside `Pledge Graphics Generator.dc.html` — copy as-is.

## Assets
`assets/` folder included: Nashville PBS logo lockups, Passport lockup, donation-bar and community-pattern backgrounds. These are static and load the same way regardless of backend.

## Files
- `Pledge Graphics Generator.dc.html` — the full current implementation (UI + logic + export + background removal). This is the file to extend with the sync layer described above.
- `sheet-parser.js` — CSV/XLSX parsing module, used as-is.
- `assets/` — static images referenced by the app.
