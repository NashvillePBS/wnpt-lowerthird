/* Nashville PBS End Cards: the one builder the preview and the export share.
 *
 * Everything here is authored at 1920 x 1080 (HD). The UHD master is the same DOM captured at
 * 2x (3840 x 2160), never a separate layout. Rules come from the Design System's Broadcast
 * section (title-safe = inner 80%, 40px minimum type at 1080, one accent, PBS Sans only); the
 * numbers that are art direction rather than rules sit in CONFIG and STYLES so a decision is a
 * config change, not a rewrite (see BUILD-endcards.md).
 */
(function (global) {
  'use strict';

  const W = 1920, H = 1080;
  // Title-safe: inner 80% (inset 10% per edge). Action-safe: inner 90% (inset 5%). HD pixel reads.
  const SAFE = {
    title:  { x: 192, y: 108, w: 1536, h: 864 },
    action: { x: 96,  y: 54,  w: 1728, h: 972 }
  };
  const C = { pbsBlue: '#2638C4', navy: '#0A145A', mediumBlue: '#0F1E8C', lightBlue: '#486CD8', white: '#FFFFFF' };
  const ACCENTS = { teal: '#48D3CD', yellow: '#FFCF00', coral: '#FE704E', white: '#FFFFFF' };
  // --gradient-primary-tr: light source top-right, the on-air default for endpages, promos and title cards.
  const GRADIENT_TR = 'linear-gradient(225deg,#486CD8 0%,#2638C4 45%,#0F1E8C 100%)';
  const FONT = "'PBS Sans',Arial,sans-serif";
  const FLOOR = 40; // px at 1080 (3.7% of frame height): the on-air minimum. Shorten the copy, never go below.

  const CONFIG = {
    assets: 'assets/',
    // Both brand Patterns are a 6 x 6 grid of 320-unit cells in a 1920 tile. Rows/columns are counted in cells.
    patterns: {
      community: { label: 'Community', file: 'Community_Pattern_RGB_1920x1920.svg', cells: 6 },
      insight:   { label: 'Insight',   file: 'Insight_Pattern_RGB_1920x1920.svg',   cells: 6 }
    },
    fieldRows: 5,      // whole rows of cells across the 1080 frame height (brand book: 3 to 6)
    railWidth: 270,    // the slate rail, 14% of the frame width (BroadcastSlates preview)
    railColumns: 3,    // whole columns of cells inside the rail (brand book: at least 3)
    overlay: 0.5,      // Navy overlay over a full pattern field that carries text (brand book: 50% or more)
    // Co-brand lockups for the endpage. `shield` is the share of the file's height that is the station
    // shield, so every channel renders with the shield at the same height as the plain station logo.
    // PBS KIDS: the October 2026 rule (color digital file only on screen) is the default; if Shane keeps
    // the station-derived reverse treatment instead (design-system shane.md 5), change this file.
    channels: {
      station:  { label: 'Nashville PBS',          file: 'NashvillePBS_Logo_Horizontal_White.svg',             shield: 1 },
      world:    { label: 'WORLD',                  file: 'NashvillePBSWORLD_Inverse_Horizontal.svg',           shield: 1 },
      create:   { label: 'Create TV',              file: 'NashvillePBS_Create_Pipe_White.svg',                 shield: 1 },
      allarts:  { label: 'ALL ARTS',               file: 'PBSNashville_AllArts_WHITE_RGB-HEX.svg',             shield: 0.94 },
      kids:     { label: 'PBS KIDS',               file: 'PBSKids_NashvillePBS_Horizontal_Digital_OnDark.svg', shield: 100 / 210 },
      passport: { label: 'Nashville PBS Passport', file: 'Passport_Horizontal_White.svg',                      shield: 1 }
    },
    stationColor: 'NashvillePBS_Logo_Horizontal_Color.svg',
    // The support card's circle: a true circle (the October template drew an ellipse), 2150px across,
    // centred at (614, 540) so it covers the whole content column inside title-safe.
    circle: { d: 2150, cx: 614, cy: 540 },
    qr: { size: 250, quiet: 4, level: 'M', dark: '#0A145A' },
    // The support card's fine print. The October template set 29px; the station rule is 40px minimum on air
    // (shorten the copy rather than shrink). Shane's call; a smaller value here is the only change needed.
    finePrint: 40
  };

  const STYLES = {
    endpage: {
      label: 'Endpage',
      blurb: 'Title, tune-in and the co-brand on the top-right gradient. Optional funding or credits text.',
      background: 'gradient', pattern: 'community', overlay: true, accent: 'teal', channel: 'station', coBrand: true,
      slugKey: 'title',
      fields: [
        { key: 'strand', label: 'Strand', type: 'text', placeholder: 'ALL NEW', hint: 'Short line above the title. Renders in ALL CAPS. Optional.' },
        { key: 'title', label: 'Title', type: 'textarea', rows: 2, placeholder: 'Tennessee Crossroads', hint: 'Press Enter to break a long title. Lines never wrap on their own.' },
        { key: 'qualifier', label: 'Qualifier', type: 'text', placeholder: 'Season 38', hint: 'One line under the title. Optional.' },
        { key: 'text', label: 'Funding or credits text', type: 'textarea', rows: 3, placeholder: 'This program was made possible by…', hint: 'A short paragraph under the title. Press Enter for a new line. Optional.' },
        { key: 'tunein', label: 'Tune-in', type: 'text', placeholder: 'TONIGHT AT 8', hint: 'Renders in ALL CAPS in the accent color. With TONIGHT, leave out "pm". Optional.' }
      ],
      defaults: { strand: 'ALL NEW', title: 'Tennessee Crossroads', qualifier: '', text: '', tunein: 'TONIGHT AT 8' }
    },
    slate: {
      label: 'Slate',
      blurb: 'Station message beside the Community rail on Navy: "We now join…", "Please stand by".',
      background: 'pattern-rail', pattern: 'community', overlay: true, accent: 'teal', channel: 'station',
      slugKey: 'message',
      fields: [
        { key: 'message', label: 'Message', type: 'textarea', rows: 4, placeholder: 'We now join the following program already in progress.', hint: 'Sentence case. Press Enter to force a line break; otherwise lines wrap.' }
      ],
      defaults: { message: 'We now join the following program already in progress.' }
    },
    'slate-caps': {
      label: 'Announcement slate',
      blurb: 'Three ALL CAPS lines centred on the full Community field: technical difficulties and the like.',
      background: 'pattern', pattern: 'community', overlay: true, accent: 'teal', channel: 'station',
      slugKey: 'main',
      fields: [
        { key: 'top', label: 'Top line', type: 'text', placeholder: 'WE ARE EXPERIENCING', hint: 'Renders in ALL CAPS.' },
        { key: 'main', label: 'Main line', type: 'text', placeholder: 'TECHNICAL DIFFICULTIES', hint: 'The big line. Renders in ALL CAPS.' },
        { key: 'sub', label: 'Bottom line', type: 'text', placeholder: 'WE WILL BE BACK MOMENTARILY', hint: 'Renders in ALL CAPS. Optional.' }
      ],
      defaults: { top: 'WE ARE EXPERIENCING', main: 'TECHNICAL DIFFICULTIES', sub: 'WE WILL BE BACK MOMENTARILY' }
    },
    support: {
      label: 'Support end card',
      blurb: 'White circle field over the Community pattern: VISIT, CALL OR TEXT, a QR code made from the address.',
      background: 'pattern', pattern: 'community', overlay: false, accent: 'teal', channel: 'station',
      slugKey: 'url',
      fields: [
        { key: 'visit', label: 'Address label', type: 'text', placeholder: 'VISIT', hint: 'Renders in ALL CAPS.' },
        { key: 'url', label: 'Web address', type: 'text', placeholder: 'wnpt.org/support', hint: 'Shown as typed; the QR code points at https:// plus this address.' },
        { key: 'cta', label: 'Phone label', type: 'text', placeholder: 'CALL OR TEXT “GIVE” TO', hint: 'Renders in ALL CAPS.' },
        { key: 'phone', label: 'Phone number', type: 'text', placeholder: '1 (844) 213-5345' },
        { key: 'disclaimer', label: 'Fine print', type: 'textarea', rows: 2, placeholder: 'Msg & Data rates may apply. Terms: wnpt.org/terms. Text STOP to cancel.', hint: 'Two lines at most at the 40px on-air minimum. Optional.' },
        { key: 'qrImage', label: 'QR code', type: 'image', hint: 'Made from the web address unless you upload your own (PNG or SVG).' }
      ],
      defaults: { visit: 'VISIT', url: 'wnpt.org/support', cta: 'CALL OR TEXT “GIVE” TO', phone: '1 (844) 213-5345', disclaimer: 'Msg & Data rates may apply. Terms: wnpt.org/terms. Text STOP to cancel.', qrImage: '' }
    }
  };

  // ---------- small helpers ----------
  function el(tag, css, text) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  }
  // A single display line that shrinks to `max` px wide and never below FLOOR (layout() does the fitting).
  function line(text, o) {
    const e = el('div', 'white-space:nowrap;flex:none;font-weight:' + o.weight + ';letter-spacing:' + (o.ls || '0') +
      ';line-height:' + (o.lh || 1.15) + ';color:' + (o.color || '#fff') + ';' + (o.css || ''), text);
    e.className = 'ec-readable';
    e.dataset.fit = o.max; e.dataset.base = o.size;
    e.style.fontSize = o.size + 'px';
    return e;
  }
  function logo(channel, shieldPx, css) {
    const ch = CONFIG.channels[channel] || CONFIG.channels.station;
    const img = document.createElement('img');
    img.src = CONFIG.assets + ch.file; img.alt = ch.label;
    img.style.cssText = 'display:block;width:auto;height:' + (shieldPx / ch.shield) + 'px;' + (css || '');
    img.className = 'ec-readable';
    return img;
  }
  function qrTarget(u) {
    u = (u || '').trim();
    if (!u) return '';
    return /^[a-z][a-z0-9+.-]*:\/\//i.test(u) ? u : 'https://' + u;
  }
  // Navy modules on white, 4-module quiet zone, drawn as an SVG so the 2x export stays crisp.
  function qrSvgDataUrl(text) {
    if (!text || typeof global.qrcode !== 'function') return '';
    const q = global.qrcode(0, CONFIG.qr.level);
    q.addData(text); q.make();
    const n = q.getModuleCount(), m = CONFIG.qr.quiet, size = n + m * 2;
    let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" shape-rendering="crispEdges">' +
      '<rect width="' + size + '" height="' + size + '" fill="#fff"/><path d="' + d + '" fill="' + CONFIG.qr.dark + '"/></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  // ---------- backgrounds ----------
  // 'gradient' | 'pattern' (full field) | 'pattern-rail' (left rail on Navy) | 'navy'
  function background(stage, state, style) {
    const mode = (state.background && state.background !== 'auto') ? state.background : style.background;
    const pat = CONFIG.patterns[state.pattern || style.pattern] || CONFIG.patterns.community;
    const url = 'url("' + CONFIG.assets + pat.file + '")';
    if (mode === 'gradient') {
      stage.appendChild(el('div', 'position:absolute;inset:0;background:' + GRADIENT_TR));
    } else if (mode === 'pattern') {
      // Whole rows across the frame height, centred so the sides crop evenly (brand book, Patterns).
      const tile = (H / CONFIG.fieldRows) * pat.cells;
      stage.appendChild(el('div', 'position:absolute;inset:0;background:' + C.mediumBlue + ' ' + url + ' center top / ' + tile + 'px ' + tile + 'px repeat'));
      if (style.overlay) stage.appendChild(el('div', 'position:absolute;inset:0;background:rgba(10,20,90,' + CONFIG.overlay + ')'));
    } else if (mode === 'pattern-rail') {
      const tile = (CONFIG.railWidth / CONFIG.railColumns) * pat.cells;
      stage.appendChild(el('div', 'position:absolute;left:0;top:0;width:' + CONFIG.railWidth + 'px;height:' + H + 'px;background:' + C.mediumBlue + ' ' + url + ' left top / ' + tile + 'px ' + tile + 'px repeat'));
    }
    // 'navy': the stage's own background.
    return mode;
  }

  // ---------- the four layouts ----------
  const BUILDERS = {
    endpage(stage, f, o) {
      const box = el('div', 'position:absolute;left:192px;top:108px;width:1536px;height:864px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center');
      box.dataset.box = 'title-safe';
      if (f.strand.trim()) box.appendChild(line(f.strand.trim().toUpperCase(), { size: 40, weight: 700, ls: '.2em', max: 1536 }));
      const lines = f.title.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
      if (lines.length) {
        const t = el('div', 'display:flex;flex-direction:column;align-items:center;margin:24px 0 10px');
        lines.forEach(s => t.appendChild(line(s, { size: 112, weight: 800, ls: '-.01em', lh: 1.05, max: 1520 })));
        box.appendChild(t);
      }
      if (f.qualifier.trim()) box.appendChild(line(f.qualifier.trim(), { size: 40, weight: 500, color: 'rgba(255,255,255,.85)', max: 1520, css: 'margin-bottom:8px' }));
      if (f.text.trim()) {
        const p = el('div', 'font-size:40px;font-weight:500;line-height:1.4;max-width:1280px;white-space:pre-line;text-wrap:pretty;margin-top:24px;color:#fff', f.text.trim());
        p.className = 'ec-readable';
        box.appendChild(p);
      }
      if (f.tunein.trim()) box.appendChild(line(f.tunein.trim().toUpperCase(), { size: 64, weight: 800, ls: '.1em', color: o.accent, max: 1520, css: 'margin-top:28px' }));
      box.appendChild(logo(o.state.channel || o.style.channel, 52, 'margin-top:80px'));
      stage.appendChild(box);
    },
    slate(stage, f, o) {
      const box = el('div', 'position:absolute;left:480px;top:108px;right:192px;bottom:108px;display:flex;flex-direction:column;justify-content:center;gap:140px');
      box.dataset.box = 'title-safe';
      const m = el('div', 'font-size:72px;line-height:1.4;font-weight:500;max-width:1150px;white-space:pre-line;text-wrap:pretty;color:#fff', f.message.trim());
      m.className = 'ec-readable';
      box.appendChild(m);
      box.appendChild(logo('station', 60, 'align-self:flex-start'));
      stage.appendChild(box);
    },
    'slate-caps'(stage, f, o) {
      const box = el('div', 'position:absolute;left:192px;top:108px;width:1536px;height:864px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center');
      box.dataset.box = 'title-safe';
      if (f.top.trim()) box.appendChild(line(f.top.trim().toUpperCase(), { size: 54, weight: 700, ls: '.18em', max: 1536 }));
      if (f.main.trim()) box.appendChild(line(f.main.trim().toUpperCase(), { size: 104, weight: 800, ls: '.05em', max: 1536, css: 'margin:44px 0' }));
      if (f.sub.trim()) box.appendChild(line(f.sub.trim().toUpperCase(), { size: 54, weight: 700, ls: '.18em', max: 1536 }));
      box.appendChild(logo('station', 60, 'margin-top:120px'));
      stage.appendChild(box);
    },
    support(stage, f, o) {
      const k = CONFIG.circle;
      stage.appendChild(el('div', 'position:absolute;left:' + (k.cx - k.d / 2) + 'px;top:' + (k.cy - k.d / 2) + 'px;width:' + k.d + 'px;height:' + k.d + 'px;border-radius:50%;background:#fff'));
      const col = el('div', 'position:absolute;left:198px;top:108px;width:1274px;height:864px;display:flex;flex-direction:column');
      col.dataset.box = 'title-safe';
      const row = el('div', 'display:flex;justify-content:space-between;align-items:flex-start');
      const lg = document.createElement('img');
      lg.src = CONFIG.assets + CONFIG.stationColor; lg.alt = 'Nashville PBS';
      lg.style.cssText = 'display:block;height:72px;width:auto'; lg.className = 'ec-readable';
      row.appendChild(lg);
      const qrSrc = (f.qrImage || '').trim() || qrSvgDataUrl(qrTarget(f.url));
      if (qrSrc) {
        const qr = document.createElement('img');
        qr.src = qrSrc; qr.alt = 'QR code';
        qr.style.cssText = 'display:block;width:' + CONFIG.qr.size + 'px;height:' + CONFIG.qr.size + 'px;object-fit:contain';
        qr.className = 'ec-readable';
        row.appendChild(qr);
      }
      col.appendChild(row);
      const b = el('div', 'margin-top:auto');
      if (f.visit.trim()) b.appendChild(line(f.visit.trim().toUpperCase(), { size: 54, weight: 800, ls: '.04em', color: C.navy, max: 1274 }));
      if (f.url.trim()) b.appendChild(line(f.url.trim(), { size: 150, weight: 800, ls: '-.02em', lh: 1, color: C.mediumBlue, max: 1274, css: 'margin:6px 0 40px' }));
      if (f.cta.trim()) b.appendChild(line(f.cta.trim().toUpperCase(), { size: 54, weight: 800, ls: '.04em', color: C.navy, max: 1274 }));
      if (f.phone.trim()) b.appendChild(line(f.phone.trim(), { size: 150, weight: 800, ls: '-.01em', lh: 1, color: C.mediumBlue, max: 1274, css: 'margin-top:6px' }));
      if (f.disclaimer.trim()) {
        const d = el('div', 'font-size:' + CONFIG.finePrint + 'px;font-weight:500;line-height:1.25;color:' + C.navy + ';margin-top:16px;white-space:pre-line;text-wrap:pretty', f.disclaimer.trim());
        d.className = 'ec-readable';
        b.appendChild(d);
      }
      col.appendChild(b);
      stage.appendChild(col);
    }
  };

  // Brand copy rules the tool can check for the producer.
  function copyWarnings(state) {
    const st = STYLES[state.style] || STYLES.endpage;
    const f = Object.assign({}, st.defaults, state.fields || {});
    const out = [];
    const tune = (f.tunein || '').trim();
    if (/\btonight\b/i.test(tune) && /\b(a|p)\.?m\b/i.test(tune)) out.push('Tune-in: with TONIGHT, leave out "pm" (PBS on-air rule).');
    return out;
  }

  function defaultState(style) {
    const st = STYLES[style] || STYLES.endpage;
    return { style: STYLES[style] ? style : 'endpage', accent: st.accent, background: 'auto', pattern: st.pattern, channel: st.channel, fields: Object.assign({}, st.defaults) };
  }

  // Build the 1920 x 1080 stage for a state. opts.hideReadable keeps the layout but hides every readable
  // element (text, logos, QR): the self-test diffs that against the full render to find the ink.
  function createStage(state, opts) {
    const style = STYLES[state.style] || STYLES.endpage;
    const f = Object.assign({}, style.defaults, state.fields || {});
    const accent = ACCENTS[state.accent] || ACCENTS[style.accent] || ACCENTS.teal;
    const stage = el('div', 'position:relative;width:' + W + 'px;height:' + H + 'px;overflow:hidden;background:' + C.navy + ';font-family:' + FONT + ';color:#fff;box-sizing:border-box');
    stage.className = 'ec-stage';
    background(stage, state, style);
    BUILDERS[style === STYLES[state.style] ? state.style : 'endpage'](stage, f, { accent, state, style });
    if (opts && opts.hideReadable) stage.querySelectorAll('.ec-readable').forEach(e => { e.style.visibility = 'hidden'; });
    return stage;
  }

  // Fit every single-line element to its width (floor FLOOR), then report what could not fit and
  // whether any readable element crosses title-safe. Run after the stage is in the document.
  function layout(stage) {
    const warnings = [], sizes = [];
    stage.querySelectorAll('[data-fit]').forEach(e => {
      const max = +e.dataset.fit, base = +e.dataset.base;
      e.style.fontSize = base + 'px';
      const w = e.scrollWidth;
      if (w > max) {
        e.style.fontSize = Math.max(FLOOR, Math.floor(base * max / w)) + 'px';
        if (e.scrollWidth > max + 1) warnings.push('Too long even at the ' + FLOOR + 'px on-air minimum: "' + e.textContent + '". Shorten it.');
      }
      sizes.push({ text: e.textContent, px: parseFloat(e.style.fontSize) });
    });
    const s = stage.getBoundingClientRect();
    const k = s.width / W; // the preview is scaled; measure in stage units
    const t = SAFE.title;
    const out = [];
    stage.querySelectorAll('.ec-readable').forEach(e => {
      const r = e.getBoundingClientRect();
      if (!r.width && !r.height) return;
      const x0 = (r.left - s.left) / k, y0 = (r.top - s.top) / k, x1 = (r.right - s.left) / k, y1 = (r.bottom - s.top) / k;
      if (x0 < t.x - .5 || y0 < t.y - .5 || x1 > t.x + t.w + .5 || y1 > t.y + t.h + .5) out.push(e);
    });
    if (out.length) warnings.push('Outside title-safe: ' + out.map(e => e.tagName === 'IMG' ? e.alt : '"' + e.textContent.trim().slice(0, 40) + '"').join(', ') + '. Shorten the copy.');
    stage.querySelectorAll('img').forEach(im => { if (im.complete && !im.naturalWidth) warnings.push('An image did not load: ' + (im.alt || im.src)); });
    return { warnings, sizes };
  }

  // ---------- export ----------
  const raf2 = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  async function settle(node) {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await Promise.all(Array.from(node.querySelectorAll('img')).map(im => (im.complete) ? null : new Promise(res => { im.onload = res; im.onerror = res; })));
    await raf2();
  }
  function exportHost() {
    let h = document.getElementById('ec-export-host');
    if (!h) {
      h = el('div', 'position:fixed;left:-30000px;top:0;width:' + W + 'px;height:' + H + 'px;overflow:visible;pointer-events:none');
      h.id = 'ec-export-host';
      document.body.appendChild(h);
    }
    return h;
  }
  // scale 1 = HD 1920 x 1080; scale 2 = UHD 3840 x 2160. The node is built fresh off-screen at natural size and,
  // for UHD, scaled with a real CSS transform so the browser paints text at the target resolution
  // (the studio's captureAtScale fix, build.md: html-to-image upscales a small raster otherwise).
  async function exportPng(state, scale, opts) {
    const s = scale || 1;
    const host = exportHost();
    const node = createStage(state, opts);
    host.appendChild(node);
    try {
      await settle(node);
      const lay = layout(node);
      lay.warnings = copyWarnings(state).concat(lay.warnings);
      await raf2();
      let url;
      if (s === 1) {
        url = await global.htmlToImage.toPng(node, { pixelRatio: 1, width: W, height: H });
      } else {
        node.style.transformOrigin = 'top left';
        node.style.transform = 'scale(' + s + ')';
        await raf2();
        url = await global.htmlToImage.toPng(node, { pixelRatio: 1, width: W * s, height: H * s });
      }
      return { url, warnings: lay.warnings, sizes: lay.sizes, width: W * s, height: H * s };
    } finally {
      host.removeChild(node);
    }
  }
  function slug(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48); }
  function fileName(state, scale) {
    const st = STYLES[state.style] || STYLES.endpage;
    const f = Object.assign({}, st.defaults, state.fields || {});
    const base = slug(String(f[st.slugKey] || '').split(/\r?\n/)[0]) || 'end-card';
    return state.style + '-' + base + '-' + (W * (scale || 1)) + 'x' + (H * (scale || 1)) + '.png';
  }

  global.EndCards = { W, H, SAFE, FLOOR, C, ACCENTS, CONFIG, STYLES, createStage, layout, copyWarnings, exportPng, fileName, defaultState, qrSvgDataUrl, qrTarget };
})(window);
