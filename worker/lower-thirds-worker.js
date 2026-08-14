/**
 * Nashville PBS — Lower Thirds → Airtable proxy (Cloudflare Worker)
 * ------------------------------------------------------------------
 * Holds the Airtable Personal Access Token secretly (as a Worker Secret)
 * so the public web tool never sees it. The browser renders the PNGs/ZIP
 * and sends them here as base64; this Worker writes records + attachments.
 *
 * Required Worker settings (Settings → Variables):
 *   AIRTABLE_TOKEN   (Secret)  — your Personal Access Token
 *   AIRTABLE_BASE_ID (Variable) — e.g. appXXXXXXXXXXXXXX
 *   ALLOW_ORIGIN     (Variable) — your site origin, e.g. https://nashvillepbs.github.io
 *                                 (use * while testing)
 *
 * DATA MODEL (linked records)
 *   Series   (tbldxGvIU3nxZhfE7)  title field "Series Title"
 *   Content  (tbl7u0utEYTfwPya9)  title "Content Title", linked to Series via "Series"
 *   Collections (tblcS0voNB7RZg5ck)  "Collection Name", "Lower Thirds", "ZIP",
 *                                    "Created", and "Series" (link → Series)
 *   Lower Thirds (tbliZoHF9pEYT3aVx) "Name","Secondary","Light Mode","PNG",
 *                                    "Collections", and "Content" (link → Content)
 *
 *   • A Collection links to exactly one Series (the show).
 *   • Each Lower Third links to the Collection's chosen Content (episode).
 *   • WNPT Brand is the only Series whose collections have NO Content link.
 *
 * BUSINESS ESSENTIALS (business-essentials/ — cards + name tags, build.md §13.9)
 *   User Table (tbl7qTD9DIc3itsMj)  read only: "Name","Title","Email",
 *                                   "Business Phone Number","Business Cell Phone"
 *   Graphics   (tblZKp11zMShtmjIx)  written: "Name","Graphics Type","Attachments",
 *                                   "Created","User Table" (link → User Table)
 *
 *   • Same base, same secret, same CORS origin as everything above — these two
 *     endpoints were added here rather than as a second Worker so there is one
 *     deploy and one token to rotate.
 *   • "Archived" on Graphics is deliberately NOT written here; an Airtable
 *     automation flags superseded rows (build.md §13.9).
 */

const T_LOWER = "tbliZoHF9pEYT3aVx";   // Lower Thirds
const T_COLL = "tblcS0voNB7RZg5ck";    // Collections
const T_SERIES = "tbldxGvIU3nxZhfE7";  // Series
const T_CONTENT = "tbl7u0utEYTfwPya9"; // Content

const F_SERIES_TITLE = "Series Title";
const F_CONTENT_TITLE = "Content Title";
const F_CONTENT_TYPE = "Content Type";  // single-select on Content
const F_CONTENT_LT = "Lower Thirds";    // long text on Content (producer-entered)
const F_CONTENT_SERIES = "Series"; // link on Content → Series
const F_COLL_SERIES = "Series";    // link on Collections → Series
const F_LT_CONTENT = "Content";    // link on Lower Thirds → Content

/* Business Essentials — verified against the base 2026-08-13. The field names
   below are the real columns, not the handoff's guesses: the attachment field
   is "Attachments" (plural), the link to a person is "User Table", and
   "Graphics Type" is a MULTIPLE-select, so it is written as an array. */
const T_USERS = "tbl7qTD9DIc3itsMj";    // User Table
const T_GRAPHICS = "tblZKp11zMShtmjIx"; // Graphics

const F_USER_NAME = "Name";
const F_USER_TITLE = "Title";
const F_USER_EMAIL = "Email";
const F_USER_PHONE = "Business Phone Number";
const F_USER_CELL = "Business Cell Phone";

const F_G_NAME = "Name";
const F_G_TYPE = "Graphics Type";   // multipleSelects
const F_G_ATTACHMENT = "Attachments";
const F_G_CREATED = "Created";
const F_G_USER = "User Table";      // link on Graphics → User Table
const F_G_REVIEW = "Needs Review";  // checkbox — drives the review email automation
const F_G_REVIEW_NOTES = "Review Notes"; // long text — becomes the email body
// The only Graphics Type options that exist in the base. Airtable rejects an
// unknown option outright (no typecast here), so check first and say why.
const GRAPHICS_TYPES = ["Business Card", "Name Tag", "Station ID"];

export default {
  async fetch(request, env) {
    const origin = env.ALLOW_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json" } });

    try {
      const url = new URL(request.url);
      const path = url.pathname.replace(/\/+$/, "");
      const api = new Airtable(env.AIRTABLE_TOKEN, env.AIRTABLE_BASE_ID);

      // GET /content?series=<Series Title>&search=  → content for a series
      if (request.method === "GET" && path.endsWith("/content")) {
        const series = (url.searchParams.get("series") || "").trim();
        const search = (url.searchParams.get("search") || "").trim();
        const recs = await api.listAll(T_CONTENT, andFilter([
          series ? `ARRAYJOIN({${F_CONTENT_SERIES}})="${esc(series)}"` : null,
          search ? searchFilter(search, F_CONTENT_TITLE) : null,
        ]));
        return json({
          content: recs
            .map(r => ({ id: r.id, title: r.fields[F_CONTENT_TITLE] || "", type: r.fields[F_CONTENT_TYPE] || "", lowerThirds: r.fields[F_CONTENT_LT] || "", created: r.createdTime || null }))
            .sort((a, b) => (b.created || "").localeCompare(a.created || "")),
        });
      }

      // GET /series?search=  → list series (for the generic-brand Series picker)
      if (request.method === "GET" && path.endsWith("/series")) {
        const search = (url.searchParams.get("search") || "").trim();
        const recs = await api.listAll(T_SERIES, search ? searchFilter(search, F_SERIES_TITLE) : null);
        return json({
          series: recs
            .map(r => ({ id: r.id, title: r.fields[F_SERIES_TITLE] || "" }))
            .filter(x => x.title)
            .sort((a, b) => a.title.localeCompare(b.title)),
        });
      }

      // GET /lower-thirds?search=  → list lower thirds (for Import)
      if (request.method === "GET" && path.endsWith("/lower-thirds")) {
        const search = (url.searchParams.get("search") || "").trim();
        const recs = await api.listAll(T_LOWER, search ? searchFilter(search, "Name") : null);
        return json({
          lowerThirds: recs.map(r => ({
            id: r.id,
            name: r.fields["Name"] || "",
            secondary: r.fields["Secondary"] || "",
            lightMode: !!r.fields["Light Mode"],
            png: firstAtt(r.fields["PNG"]),
          })),
        });
      }

      // GET /collections?series=<Series Title>&search=&offset=&limit=
      if (request.method === "GET" && path.endsWith("/collections")) {
        const series = (url.searchParams.get("series") || "").trim();
        const search = (url.searchParams.get("search") || "").trim();
        const limit = Math.min(parseInt(url.searchParams.get("limit") || "5", 10), 50);
        const offset = url.searchParams.get("offset") || "";
        const page = await api.list(T_COLL, {
          filter: andFilter([
            series ? `ARRAYJOIN({${F_COLL_SERIES}})="${esc(series)}"` : null,
            search ? searchFilter(search, "Collection Name") : null,
          ]),
          sort: [{ field: "Created", direction: "desc" }],
          pageSize: limit,
          offset,
        });
        return json({
          collections: page.records.map(r => ({
            id: r.id,
            name: r.fields["Collection Name"] || "",
            count: (r.fields["Lower Thirds"] || []).length,
            created: r.fields["Created"] || null,
          })),
          nextOffset: page.offset || null,
        });
      }

      // GET /collection?id=recXXX  → one collection + its lower thirds (ordered)
      if (request.method === "GET" && path.endsWith("/collection")) {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "missing id" }, 400);
        const coll = await api.get(T_COLL, id);

        // resolve the linked Series → title
        let seriesTitle = "";
        const seriesId = (coll.fields[F_COLL_SERIES] || [])[0];
        if (seriesId) {
          try { const s = await api.get(T_SERIES, seriesId); seriesTitle = s.fields[F_SERIES_TITLE] || ""; } catch (e) {}
        }

        const links = coll.fields["Lower Thirds"] || [];
        const entries = [];
        let contentId = null, contentTitle = "";
        for (const link of links) {
          const linkId = typeof link === "string" ? link : (link && link.id);
          if (!linkId) continue;
          const r = await api.get(T_LOWER, linkId);
          const cId = (r.fields[F_LT_CONTENT] || [])[0] || null;
          if (cId && !contentId) {
            contentId = cId;
            try { const c = await api.get(T_CONTENT, cId); contentTitle = c.fields[F_CONTENT_TITLE] || ""; } catch (e) {}
          }
          entries.push({
            id: r.id,
            name: r.fields["Name"] || "",
            secondary: r.fields["Secondary"] || "",
            lightMode: !!r.fields["Light Mode"],
            png: firstAtt(r.fields["PNG"]),
          });
        }
        return json({
          id: coll.id,
          name: coll.fields["Collection Name"] || "",
          series: seriesTitle,
          contentId,
          contentTitle,
          zip: firstAtt(coll.fields["ZIP"]),
          entries,
        });
      }

      // POST /save  → create or update a collection and its lower thirds
      if (request.method === "POST" && path.endsWith("/save")) {
        const body = await request.json();
        const result = await saveCollection(api, body);
        return json(result);
      }

      // GET /users?search=  → staff lookup for Business Essentials
      if (request.method === "GET" && path.endsWith("/users")) {
        const search = (url.searchParams.get("search") || "").trim();
        const recs = await api.listAll(T_USERS, search ? searchFilter(search, F_USER_NAME) : null);
        return json({
          users: recs.map(r => ({
            id: r.id,
            name: r.fields[F_USER_NAME] || "",
            title: r.fields[F_USER_TITLE] || "",
            email: r.fields[F_USER_EMAIL] || "",
            phone: r.fields[F_USER_PHONE] || "",
            cell: r.fields[F_USER_CELL] || "",
          })).filter(u => u.name),
        });
      }

      // POST /save-graphic  → one Graphics row + the print PDF as its attachment
      if (request.method === "POST" && path.endsWith("/save-graphic")) {
        const body = await request.json();
        const result = await saveGraphic(api, body);
        return json(result);
      }

      return json({ error: "not found", path }, 404);
    } catch (err) {
      return json({ error: String(err && err.message || err) }, 500);
    }
  },
};

/* ----------------------------- save logic ----------------------------- */
// body = {
//   seriesTitle: string,            // the show — resolved to a Series record id
//   contentId?: string,             // the episode — linked on every lower third (null for WNPT Brand)
//   collectionId?: string,
//   collectionName: string,
//   entries: [{ id?, name, secondary, lightMode, pngBase64? }],
//   zipBase64?: string,
// }
async function saveCollection(api, body) {
  const { collectionName, entries = [], zipBase64 } = body;
  const seriesTitle = (body.seriesTitle || "").trim();
  const contentId = body.contentId || null;
  let collectionId = body.collectionId || null;

  // resolve Series title → record id
  let seriesId = null;
  if (seriesTitle) {
    const s = await api.findByField(T_SERIES, F_SERIES_TITLE, seriesTitle);
    if (!s) throw new Error('Series not found in Airtable: "' + seriesTitle + '"');
    seriesId = s.id;
  }

  // 1) upsert the Collection row (+ Series link)
  const collFields = { "Collection Name": collectionName };
  if (seriesId) collFields[F_COLL_SERIES] = [seriesId];
  if (collectionId) {
    await api.update(T_COLL, [{ id: collectionId, fields: collFields }]);
  } else {
    const created = await api.create(T_COLL, [{ fields: collFields }]);
    collectionId = created[0].id;
  }

  // 2) upsert each Lower Third (+ Content link), collect ids in order
  const ids = [];
  for (const e of entries) {
    const fields = {
      "Name": e.name || "",
      "Secondary": e.secondary || "",
      "Light Mode": !!e.lightMode,
      [F_LT_CONTENT]: contentId ? [contentId] : [],
    };
    let recId = e.id || null;
    if (recId) {
      await api.update(T_LOWER, [{ id: recId, fields }]);
    } else {
      const created = await api.create(T_LOWER, [{ fields }]);
      recId = created[0].id;
    }
    if (e.pngBase64) {
      await api.clearAttachment(T_LOWER, recId, "PNG");
      await api.uploadAttachment(recId, "PNG", e.pngBase64, "image/png", slug(e.name) + ".png");
    }
    ids.push(recId);
  }

  // 3) link the collection to exactly these lower thirds (in order)
  await api.update(T_COLL, [{ id: collectionId, fields: { "Lower Thirds": ids } }]);

  // 4) replace the collection ZIP
  if (zipBase64) {
    await api.clearAttachment(T_COLL, collectionId, "ZIP");
    await api.uploadAttachment(collectionId, "ZIP", zipBase64, "application/zip", slug(collectionName) + ".zip");
  }

  return { ok: true, collectionId, seriesId, lowerThirdIds: ids };
}

/* ------------------- Business Essentials save logic ------------------- */
// body = {
//   userId?: string,               // User Table record, only when picked from search
//   personName: string,
//   graphicsType: "Business Card" | "Name Tag",
//   pdfBase64: string,
//   fileName?: string,
//   details?: { title, email, phone, cell },  // what the operator actually typed
//   recordId?: string,             // update this row instead of adding another
// }
// Creates one Graphics row named "{Person} - {Graphics Type} - {YYYY-MM-DD}" and
// uploads the print-ready PDF into it.
//
// `recordId` exists for the page's autosave: a session that keeps editing would
// otherwise leave a trail of near-identical rows (and a review email for each
// create). The page passes back the id it got, so one session's card stays one
// row, rewritten in place. Omit it and this behaves as before — a new row every
// time — which is what a fresh person or a fresh output does.
async function saveGraphic(api, body) {
  const { userId, personName, graphicsType, pdfBase64, fileName, recordId: existingId } = body;
  if (!personName || !graphicsType || !pdfBase64) {
    throw new Error("personName, graphicsType and pdfBase64 are required");
  }
  if (!GRAPHICS_TYPES.includes(graphicsType)) {
    throw new Error(`Unknown Graphics Type "${graphicsType}" — the base allows: ${GRAPHICS_TYPES.join(", ")}`);
  }

  // Station-local date, not UTC: a card saved at 8pm in Nashville is still
  // today's card, and the record name carries this date.
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" }); // YYYY-MM-DD
  const recordName = `${personName} - ${graphicsType} - ${today}`;

  const fields = {
    [F_G_NAME]: recordName,
    [F_G_TYPE]: [graphicsType], // multiple-select: always an array
    [F_G_CREATED]: today,
  };
  if (userId) fields[F_G_USER] = [userId];

  // Flag anything the User Table doesn't already agree with, so the source of
  // truth can be reconciled instead of drifting. Set on the create call itself so
  // the review automation sees it on the recordCreated trigger.
  const review = await reviewNotes(api, { userId, personName, graphicsType, details: body.details });
  // written either way, so a row that gets corrected doesn't keep a stale flag
  fields[F_G_REVIEW] = !!review;
  fields[F_G_REVIEW_NOTES] = review || "";

  let recordId = existingId || null;
  if (recordId) {
    await api.update(T_GRAPHICS, [{ id: recordId, fields }]);
    // clear-then-upload, same as the Lower Thirds PNG path: a failed upload can
    // leave the field briefly empty, which the next autosave rewrites
    await api.clearAttachment(T_GRAPHICS, recordId, F_G_ATTACHMENT);
  } else {
    const created = await api.create(T_GRAPHICS, [{ fields }]);
    recordId = created[0].id;
  }
  await api.uploadAttachment(
    recordId, F_G_ATTACHMENT, pdfBase64, "application/pdf",
    fileName || slug(recordName) + ".pdf",
  );

  return { ok: true, recordId, name: recordName, needsReview: !!review, updated: !!existingId };
}

/* Does this save disagree with the User Table? Returns the note to file, or "" when
   everything matched (and so nothing needs a human).

   Two cases are worth flagging:
     • nobody was picked from the search — the person may be missing from the User
       Table entirely, or the operator skipped the lookup;
     • somebody was picked, but a field on the card differs from their record —
       usually a promotion or a new number that never made it back to the table.

   Deliberately NOT flagged: a blank office phone (the card falls back to the
   station number, which is not a contradiction) and a blank cell (optional by
   design). Phone numbers compare on digits only, so (615) 259-9325 and
   615.259.9325 are the same number. */
async function reviewNotes(api, { userId, personName, graphicsType, details }) {
  const d = details || {};
  const typed = {
    Name: (personName || "").trim(),
    Title: (d.title || "").trim(),
    Email: (d.email || "").trim(),
    "Business Phone Number": (d.phone || "").trim(),
    "Business Cell Phone": (d.cell || "").trim(),
  };
  // one line per field, as Markdown bullets: the notes are read both in the
  // Airtable cell and as the body of the review email, and single newlines
  // collapse when Airtable renders Markdown into an email
  const listTyped = () => Object.keys(typed)
    .filter((k) => typed[k])
    .map((k) => `- **${k}:** ${typed[k]}`)
    .join("\n");

  if (!userId) {
    return `${personName} was not picked from the User Table, so this ${graphicsType.toLowerCase()} was built from typed details.\n\n` +
      `What was entered:\n${listTyped()}\n\n` +
      `If they're staff, add them to the User Table so the next card pulls automatically. ` +
      `If they're already in there, the person who made this skipped the Find Employee lookup.`;
  }

  let user;
  try {
    user = await api.get(T_USERS, userId);
  } catch (e) {
    // a lookup failure must never cost someone their card
    return `Couldn't read the User Table record for ${personName} to compare it (${e.message || e}). Worth a look.`;
  }
  const f = user.fields || {};
  const onRecord = {
    Name: String(f[F_USER_NAME] || "").trim(),
    Title: String(f[F_USER_TITLE] || "").trim(),
    Email: String(f[F_USER_EMAIL] || "").trim(),
    "Business Phone Number": String(f[F_USER_PHONE] || "").trim(),
    "Business Cell Phone": String(f[F_USER_CELL] || "").trim(),
  };
  const isPhone = (k) => k === "Business Phone Number" || k === "Business Cell Phone";
  const same = (k, a, b) => (isPhone(k)
    ? a.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "") === b.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "")
    : a.toLowerCase() === b.toLowerCase());

  const diffs = Object.keys(typed)
    .filter((k) => typed[k] && !same(k, typed[k], onRecord[k]))
    .map((k) => `- **${k}** — on the ${graphicsType.toLowerCase()}: ${typed[k]} · in the User Table: ${onRecord[k] || "(empty)"}`);

  if (!diffs.length) return "";
  return `${personName}'s ${graphicsType.toLowerCase()} was built with details that differ from their User Table record:\n\n${diffs.join("\n")}\n\n` +
    `Update the User Table if the card is right, or reissue the card if the table is.`;
}

/* ----------------------------- helpers ----------------------------- */
function esc(s) { return String(s).replace(/"/g, '\\"'); }
function searchFilter(search, field) {
  return `SEARCH(LOWER("${esc(search)}"), LOWER({${field}}))`;
}
function andFilter(parts) {
  const clean = parts.filter(Boolean);
  if (!clean.length) return null;
  if (clean.length === 1) return clean[0];
  return `AND(${clean.join(", ")})`;
}
function firstAtt(att) {
  if (Array.isArray(att) && att.length) return { url: att[0].url, filename: att[0].filename };
  return null;
}
function slug(s) {
  return (s || "lower-third").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "lower-third";
}

/* --------------------------- Airtable client --------------------------- */
class Airtable {
  constructor(token, baseId) {
    this.token = token;
    this.baseId = baseId;
    this.api = "https://api.airtable.com/v0";
    this.content = "https://content.airtable.com/v0";
  }
  headers(extra = {}) { return { Authorization: `Bearer ${this.token}`, ...extra }; }
  async req(url, opts = {}) {
    const res = await fetch(url, { ...opts, headers: this.headers(opts.headers) });
    if (!res.ok) { const text = await res.text(); throw new Error(`Airtable ${res.status}: ${text}`); }
    await sleep(220); // keep under 5 req/sec per base
    return res.json();
  }
  enc(table) { return encodeURIComponent(table); }
  async list(table, { filter, sort, pageSize = 100, offset } = {}) {
    const u = new URL(`${this.api}/${this.baseId}/${this.enc(table)}`);
    if (filter) u.searchParams.set("filterByFormula", filter);
    if (pageSize) u.searchParams.set("pageSize", String(pageSize));
    if (offset) u.searchParams.set("offset", offset);
    (sort || []).forEach((s, i) => {
      u.searchParams.set(`sort[${i}][field]`, s.field);
      u.searchParams.set(`sort[${i}][direction]`, s.direction);
    });
    return this.req(u.toString());
  }
  async listAll(table, filter) {
    let out = [], offset;
    do {
      const page = await this.list(table, { filter, pageSize: 100, offset });
      out = out.concat(page.records);
      offset = page.offset;
    } while (offset);
    return out;
  }
  async get(table, id) { return this.req(`${this.api}/${this.baseId}/${this.enc(table)}/${id}`); }
  async findByField(table, field, value) {
    const page = await this.list(table, { filter: `{${field}}="${esc(value)}"`, pageSize: 1 });
    return (page.records && page.records[0]) || null;
  }
  async create(table, records) {
    const data = await this.req(`${this.api}/${this.baseId}/${this.enc(table)}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ records }),
    });
    return data.records;
  }
  async update(table, records) {
    const data = await this.req(`${this.api}/${this.baseId}/${this.enc(table)}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ records }),
    });
    return data.records;
  }
  async clearAttachment(table, id, field) { return this.update(table, [{ id, fields: { [field]: [] } }]); }
  async uploadAttachment(recordId, field, base64, contentType, filename) {
    const clean = base64.includes(",") ? base64.split(",")[1] : base64;
    return this.req(`${this.content}/${this.baseId}/${recordId}/${encodeURIComponent(field)}/uploadAttachment`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentType, file: clean, filename }),
    });
  }
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
