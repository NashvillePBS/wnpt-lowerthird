// Parses pledge premium sheets (.csv or .xlsx) into gift objects.
// Returns { gifts, issues, sheetName } — issues are rows that couldn't be
// mapped cleanly (missing name and/or donation level) so they can be reviewed.
export async function parseFile(file) {
  const name = (file.name || '').toLowerCase();
  let rows, sheetName = null;
  if (name.endsWith('.xlsx')) {
    const r = await parseXlsx(await file.arrayBuffer());
    rows = r.rows; sheetName = r.sheetName;
  } else {
    rows = parseCsv(await file.text());
  }
  const { gifts, issues } = mapGifts(rows);
  return { gifts, issues, sheetName };
}

function parseCsv(text) {
  const rows = []; let row = [], cell = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

function unzip(buf) {
  const u32 = o => (buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16) | (buf[o + 3] << 24)) >>> 0;
  const u16 = o => buf[o] | (buf[o + 1] << 8);
  const files = {}; let off = 0;
  while (off < buf.length - 4) {
    if (u32(off) !== 0x04034b50) break;
    const method = u16(off + 8), csize = u32(off + 18), nlen = u16(off + 26), elen = u16(off + 28);
    const name = new TextDecoder().decode(buf.slice(off + 30, off + 30 + nlen));
    files[name] = { method, data: buf.slice(off + 30 + nlen + elen, off + 30 + nlen + elen + csize) };
    off = off + 30 + nlen + elen + csize;
  }
  return files;
}
const dec = s => (s || '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(+n));
async function inflateEntry(e) {
  return e.method === 0 ? new TextDecoder().decode(e.data)
    : await new Response(new Blob([e.data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
}
function colIdx(ref) { let n = 0; for (const c of ref) { if (c >= 'A' && c <= 'Z') n = n * 26 + c.charCodeAt(0) - 64; else break; } return n - 1; }
async function sheetRows(files, path, strings) {
  const xml = await inflateEntry(files[path]);
  const out = [];
  for (const [, rxml] of xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)) {
    const row = [];
    for (const m of rxml.matchAll(/<c r="([A-Z]+\d+)"([^>]*)>[\s\S]*?(?:<v>([\s\S]*?)<\/v>)?[\s\S]*?<\/c>/g)) {
      if (m[3] === undefined) continue;
      row[colIdx(m[1])] = /t="s"/.test(m[2]) ? strings[+m[3]] : dec(m[3]);
    }
    out.push(row);
  }
  return out;
}
const NAME_HDR = /premium item name|item name|gift name/i;

async function parseXlsx(ab) {
  const files = unzip(new Uint8Array(ab));
  const ssXml = files['xl/sharedStrings.xml'] ? await inflateEntry(files['xl/sharedStrings.xml']) : '';
  const strings = [...ssXml.matchAll(/<si>([\s\S]*?)<\/si>/g)].map(m => dec(m[1].replace(/<[^>]+>/g, '')).trim());

  let sheetMap = [];
  if (files['xl/workbook.xml'] && files['xl/_rels/workbook.xml.rels']) {
    const wbXml = await inflateEntry(files['xl/workbook.xml']);
    const relsXml = await inflateEntry(files['xl/_rels/workbook.xml.rels']);
    const rels = {};
    for (const m of relsXml.matchAll(/<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"/g)) rels[m[1]] = m[2];
    for (const m of wbXml.matchAll(/<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)) {
      const target = rels[m[2]];
      if (target) sheetMap.push({ name: dec(m[1]), path: 'xl/' + target.replace(/^\/?xl\//, '') });
    }
  }
  if (!sheetMap.length) {
    sheetMap = Object.keys(files).filter(n => /xl\/worksheets\/.*\.xml$/.test(n)).map(n => ({ name: n, path: n }));
  }

  // Prefer a tab literally named "Local Offers"; otherwise scan tabs in order
  // for one whose header row actually has an item-name column.
  const named = sheetMap.find(s => /local\s*offers/i.test(s.name) && files[s.path]);
  if (named) {
    return { rows: await sheetRows(files, named.path, strings), sheetName: named.name };
  }
  for (const s of sheetMap) {
    if (!files[s.path]) continue;
    const rows = await sheetRows(files, s.path, strings);
    if (rows.some(r => (r || []).some(c => NAME_HDR.test((c || '').toString())))) {
      return { rows, sheetName: s.name };
    }
  }
  const first = sheetMap.find(s => files[s.path]);
  return first ? { rows: await sheetRows(files, first.path, strings), sheetName: first.name } : { rows: [], sheetName: null };
}

function mapGifts(rows) {
  let hi = -1, map = null;
  for (let i = 0; i < rows.length; i++) {
    const cells = (rows[i] || []).map(c => (c || '').toString().toLowerCase());
    const nameCol = cells.findIndex(c => NAME_HDR.test(c));
    if (nameCol >= 0) {
      hi = i;
      map = {
        program: cells.findIndex(c => /^program/.test(c)),
        name: nameCol,
        desc: cells.findIndex(c => /description/.test(c)),
        level: cells.findIndex(c => /donation level|level|amount/.test(c)),
        qty: cells.findIndex(c => /quantity|qty/.test(c)),
      };
      break;
    }
  }
  const gifts = [], issues = [];
  const levelRe = /\$?\d[\d,.]*\s*\/\s*\$?\d[\d,.]*/;
  for (let i = 0; i < rows.length; i++) {
    if (hi >= 0 && i <= hi) continue;
    const r = rows[i] || [];
    let g;
    if (map) {
      g = {
        program: (r[map.program] || '').toString().trim(),
        name: (r[map.name] || '').toString().trim(),
        desc: (r[map.desc] || '').toString().trim().slice(0, 300),
        level: (r[map.level] || '').toString().trim(),
        qty: (r[map.qty] || '').toString().trim(),
      };
    } else {
      const cells = r.map(c => (c || '').toString().trim());
      if (!cells.some(Boolean)) continue;
      g = {
        program: cells[0] || '', name: cells[1] || cells[0] || '', desc: '',
        level: cells.find(c => levelRe.test(c)) || '', qty: '',
      };
    }
    const hasAny = g.program || g.name || g.desc || g.level || g.qty;
    if (!hasAny) continue;
    if (!g.name || !g.level) {
      issues.push({
        program: g.program, name: g.name, level: g.level,
        reason: (!g.name && !g.level) ? 'Missing name and donation level' : (!g.name ? 'Missing item name' : 'Missing donation level'),
      });
      continue;
    }
    gifts.push(g);
  }
  return { gifts, issues };
}
