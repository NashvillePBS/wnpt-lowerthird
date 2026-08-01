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
