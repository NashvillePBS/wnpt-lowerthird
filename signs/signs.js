/* Nashville PBS Event Signs: printed signs for station events.
 *
 * Authored at 96 dpi (US Letter 816 x 1056 px, the brand book's Print register measure) and exported as a
 * print-ready PDF whose one image is the same DOM captured at 300 dpi (Letter 2550 x 3300, Tabloid
 * 3300 x 5100). Tabloid is the Letter layout scaled by 11/8.5 with the extra height given to the copy.
 * Rules: Logo, Color, Typography, Graphic Elements and Print in the Design System's brand book. Taste
 * lives in CONFIG; the sign types in SIGNS. Loads after vendor/html-to-image.js and shared/studio-core.js.
 *
 * The field is white by default (Shane, 2026-11-07): these signs are printed in-house on the office
 * color printer, and a Navy page eats its ink. Navy stays as the option for a print shop.
 */
(function (global) {
  'use strict';
  const SC = global.StudioCore;
  const DPI = 96, PRINT_DPI = 300;
  const SIZES = {
    letter:  { label: 'Letter', detail: '8.5 × 11 in', w: 8.5, h: 11 },
    tabloid: { label: 'Tabloid', detail: '11 × 17 in', w: 11, h: 17 }
  };
  const C = { pbsBlue: '#2638C4', navy: '#0A145A', mediumBlue: '#0F1E8C', white: '#FFFFFF' };
  // Yellow is the print register's accent (Documents); Teal and Coral may take its place, never alongside it.
  const ACCENTS = { yellow: '#FFCF00', teal: '#48D3CD', coral: '#FE704E' };
  const FONT = "'PBS Sans',Arial,sans-serif";
  const MARGIN = 48; // px at 96 dpi = 0.5 in: every readable element stays inside it (office printers cannot print the outer 0.2 in)

  // Letter values in px at 96 dpi; Tabloid multiplies them by k = 11 / 8.5. Each is one line to change.
  const CONFIG = {
    assets: 'assets/',
    logoWhite: 'NashvillePBS_Logo_Horizontal_White.svg',
    logoColor: 'NashvillePBS_Logo_Horizontal_Color.svg',
    band: 28,                 // the full-width accent band at the top (a fill, never type)
    padX: 64, padTop: 64, padBottom: 56,
    headline: 132, subline: 40, body: 26, floor: 56,  // floor: the headline never shrinks below (42 pt at Letter)
    logo: 40,                 // the station shield's height (print minimum 0.2 in = 19 px)
    arrow: { portrait: 260, landscape: 300 },
    arrowUsesAccent: true,    // on Navy the arrow takes the accent (12:1 on Navy for Yellow); on white it is Navy
    bodyMax: 560,
    // Partner (sponsor, underwriter) logos: a flex row above the station logo that wraps as logos are
    // added. Each logo keeps its own shape inside a box no taller than maxH and no wider than maxW for
    // the row's count (1 to 3, 4 to 6, 7 or more), so a wide mark and a square mark sit together.
    partners: { label: 'Supported by', labelSize: 20, maxH: [64, 52, 44], maxW: [220, 170, 130], gap: 28, rowGap: 18, above: 36 },
    // QR codes (custom, donate and app signs): 2 in square at Letter, Navy modules, the address printed under it.
    qr: { size: 192, dark: '#0A145A', level: 'M', caption: 22 },
    // The donate sign (Shane, 2026-11-07): "Donate at least $5 per month or $60 per year and enjoy Nashville PBS
    // Passport", with the amounts as fields because the Passport price may change; wnpt.org/donate, not /support.
    donate: { sentence: 'Donate at least ${monthly} per month or ${yearly} per year and enjoy Nashville PBS Passport', url: 'wnpt.org/donate', passportFile: 'Passport_Horizontal_Color.svg', passportH: 54 },
    // Locked QR targets (Shane, 2026-11-07): the donate and app signs always encode these tracked wnpt.tv
    // links, so every scan shows up in Google Analytics and nobody prints an untracked variant. Shane
    // supplies them (shane.md); until a link is set, the donate QR falls back to the printed address and an
    // app block has no QR and the download is blocked. The custom sign is the only one that makes new links.
    // Shane supplied the three links and their QR files from Short.io on 2026-11-07 (the files are his
    // exports with the modules recoloured Navy, nothing else changed): the donate sign scans to
    // wnpt.tv/support; the PBS app block to wnpt.tv/wnptpbs-app, a landing page that sends a phone to its
    // own store and can carry the Nashville PBS app later; the PBS KIDS block to wnpt.tv/pbskidsapps.
    // `file` is the code that prints; `url` is what it encodes (used when a file is missing).
    tracked: {
      donate: { url: 'https://wnpt.tv/support', file: 'qr-support.svg' },
      apps: {
        pbs:     { url: 'https://wnpt.tv/wnptpbs-app', file: 'qr-wnptpbs-app.svg' },
        station: { url: '', file: '' },
        kids:    { url: 'https://wnpt.tv/pbskidsapps', file: 'qr-pbskidsapps.svg' }
      }
    },
    // The app sign: one block per app the staffer turns on. Rules from the PBS App Marketing Guide (July 2024)
    // via the brand book: the PBS logo is the app's graphic (never the store icon), paired with an all-caps call
    // to action; any "free" claim carries the fine print once. The Nashville PBS app has not launched (Shane,
    // 2026-11-07: "keep everything ready for it to be turned on, just don't expose it as an option yet"):
    // `enabled: false` hides it from the page and the sign; flip it to true, set its tracked link, done.
    // Logo heights put the three marks at a similar visual weight.
    apps: {
      pbs:     { label: 'PBS app',           enabled: true,  file: 'PBS_Logo_Color_RGB.svg',                 logoH: 70, cta: 'GET THE FREE PBS APP', finePrint: true },
      station: { label: 'Nashville PBS app', enabled: false, file: 'NashvillePBS_Logo_Horizontal_Color.svg', logoH: 44, cta: 'GET THE FREE NASHVILLE PBS APP', finePrint: false },
      kids:    { label: 'PBS KIDS app',      enabled: true,  file: 'PBS_KIDS_Color_RGB_Digital.svg',          logoH: 96, cta: 'GET THE FREE PBS KIDS APP', finePrint: false }
    },
    // The PBS app's fine print (the PBS App Marketing Guide's "free" claim). Shane, 2026-11-07: the line is
    // for the PBS app only, so `finePrint` on the app decides, not the word FREE.
    finePrint: '*Local PBS station membership required to access some content.',
    // The app sign's blocks: logo over the call to action at left, the QR code at right. Portrait stacks one
    // block per line; landscape puts them side by side, so they are smaller there.
    appBlock: { headline: 96, qr: { portrait: 120, landscape: 112 }, colW: { portrait: 300, landscape: 150 }, cta: 22, caption: 20, captionW: 230, gap: 20, rowGap: 14 }
  };

  const ARROWS = { none: 'None', up: 'Up', 'up-right': 'Up right', right: 'Right', 'down-right': 'Down right', down: 'Down', 'down-left': 'Down left', left: 'Left', 'up-left': 'Up left' };
  const ROT = { right: 0, 'down-right': 45, down: 90, 'down-left': 135, left: 180, 'up-left': 225, up: 270, 'up-right': 315 };

  const FIELDS = [
    { key: 'headline', label: 'Headline', type: 'textarea', rows: 2, placeholder: 'Welcome', hint: 'Big and short. Press Enter to force a line break.' },
    { key: 'subline', label: 'Second line', type: 'text', placeholder: 'Community Screening', hint: 'Event name, room or detail. Optional.' },
    { key: 'body', label: 'Small text', type: 'textarea', rows: 3, placeholder: '', hint: 'A sentence or two. Optional.' },
    { key: 'arrow', label: 'Arrow', type: 'select', options: ARROWS },
    { key: 'partnerLabel', label: 'Partner label', type: 'text', placeholder: 'Supported by', hint: 'Sits above the partner logos. Keep it plain: "Supported by", "Made possible by". Optional.' },
    { key: 'partners', label: 'Partner logos', type: 'images', hint: 'Add one or more logo files (PNG, JPG or SVG). They sit in a row above the station logo, each at its own shape; add more and the row wraps and the logos get smaller. On the white field use color or dark logos; on Navy, white ones. Not remembered after a reload.' }
  ];
  // The station's approved photography notice (Shane Burkeen, 2026-11-07), verbatim apart from the headline's case.
  const QR_FIELDS = [
    { key: 'url', label: 'Web address for the QR code', type: 'text', placeholder: 'wnpt.org/events', hint: 'A wnpt.org address is printed under the code as typed. Any other address stays off the sign unless you tick Show address.' },
    { key: 'showAddress', label: 'Show address', type: 'checkbox', text: 'Print the address under the QR code', hint: 'For links that are not on wnpt.org: prints the short link if one was made, otherwise the address.' },
    { key: 'shortPath', label: 'Short link name', type: 'shortlink', placeholder: 'fall-screening', hint: 'Optional. Makes wnpt.tv/<name> point at the address above (tracked in Short.io) and puts that in the QR code. Leave empty for a random name.' }
  ];
  // What prints under a custom sign's QR code (Shane, 2026-11-07): a wnpt.org address as typed; any other
  // address nothing, unless Show address is ticked, then the short link if there is one, else the address.
  function qrCaption(f) {
    const addr = (f.url || '').trim();
    if (!addr) return '';
    let host = '';
    try { host = new URL(SC.urlTarget(addr)).hostname.toLowerCase(); } catch (e) { host = ''; }
    if (host === 'wnpt.org' || host.endsWith('.wnpt.org')) return addr;
    if (!f.showAddress) return '';
    return (f.shortURL || '').replace(/^https?:\/\//, '') || addr;
  }
  const DONATE_FIELDS = [
    { key: 'headline', label: 'Headline', type: 'textarea', rows: 2, placeholder: 'Donate', hint: 'Press Enter to force a line break.' },
    { key: 'monthly', label: 'Monthly amount', type: 'text', placeholder: '5', hint: 'Dollars per month for Passport; the sentence reads "at least $5 per month".' },
    { key: 'yearly', label: 'Yearly amount', type: 'text', placeholder: '60', hint: 'Dollars per year.' },
    { key: 'body', label: 'Small text', type: 'textarea', rows: 2, placeholder: '', hint: 'A sentence or two under the Passport line. Optional.' },
    { key: 'qrNote', label: 'QR code', type: 'note', hint: 'Fixed: the code is the station\'s tracked donate link, so scans count in Google Analytics. The printed address is wnpt.org/donate.' }
  ];
  const APP_FIELDS = [
    { key: 'headline', label: 'Headline', type: 'textarea', rows: 2, placeholder: 'Get Our Apps', hint: 'Shorter than the other signs so three apps fit. Press Enter to force a line break.' },
    { key: 'subline', label: 'Second line', type: 'text', placeholder: 'Watch on your phone, tablet and TV.', hint: 'Optional.' },
    { key: 'apps', label: 'Apps', type: 'apps', hint: 'Turn on the apps the sign is for. Each gets its logo, its call to action and the station\'s tracked QR code (fixed, so scans count in Google Analytics). A "free" claim adds the required fine print once.' }
  ];
  const PHOTO_SUB = 'This event is being photographed and/or video recorded.';
  const PHOTO_BODY = 'Please be advised that by entering this space, you are agreeing to being filmed and/or photographed, and the resulting assets may be used for marketing or promotional purposes.\n\nIf you do not wish to be photographed or recorded, please notify one of our staff members.\n\nThank you!';
  const SIGNS = {
    welcome:      { label: 'Welcome',              blurb: 'Welcome with the event name.',                       defaults: { headline: 'Welcome', subline: '', body: '', arrow: 'none', partnerLabel: '', partners: [] } },
    directional:  { label: 'Directional',          blurb: 'A destination and an arrow.',                         defaults: { headline: 'Registration', subline: '', body: '', arrow: 'right', partnerLabel: '', partners: [] } },
    reserved:     { label: 'Reserved',             blurb: 'Reserved seating or a reserved space.',               defaults: { headline: 'Reserved', subline: '', body: '', arrow: 'none', partnerLabel: '', partners: [] } },
    registration: { label: 'Registration',         blurb: 'Registration or check-in table.',                     defaults: { headline: 'Check-In', subline: '', body: '', arrow: 'none', partnerLabel: '', partners: [] } },
    restrooms:    { label: 'Restrooms',            blurb: 'Restrooms, with an arrow.',                           defaults: { headline: 'Restrooms', subline: '', body: '', arrow: 'right', partnerLabel: '', partners: [] } },
    quiet:        { label: 'Quiet Please',         blurb: 'Quiet please: recording or a program in progress.',   defaults: { headline: 'Quiet Please', subline: 'Recording in progress', body: '', arrow: 'none', partnerLabel: '', partners: [] } },
    photo:        { label: 'Photography Notice',   blurb: 'The station\'s approved notice that the event is photographed or recorded.',  defaults: { headline: 'Attention', subline: PHOTO_SUB, body: PHOTO_BODY, arrow: 'none', partnerLabel: '', partners: [] } },
    custom:       { label: 'Custom',               blurb: 'Anything else: your own headline and lines, with a QR code if you give it a link.', defaults: { headline: '', subline: '', body: '', arrow: 'none', partnerLabel: '', partners: [], url: '', showAddress: false, shortPath: '', shortURL: '' }, fields: FIELDS.concat(QR_FIELDS) },
    donate:       { label: 'Donate',               blurb: 'wnpt.org/donate with the Passport amounts and the tracked QR code.', defaults: { headline: 'Donate', monthly: '5', yearly: '60', body: '', partnerLabel: '', partners: [] }, fields: DONATE_FIELDS },
    apps:         { label: 'Our Apps',             blurb: 'Download the PBS app or the PBS KIDS app, each with its tracked QR code.', defaults: { headline: 'Get Our Apps', subline: 'Watch on your phone, tablet and TV.', apps: { pbs: true, station: false, kids: true }, partnerLabel: '', partners: [] }, fields: APP_FIELDS }
  };
  function fieldsFor(sign) { return (SIGNS[sign] && SIGNS[sign].fields) || FIELDS; }
  // The Our Apps card names only the apps that are switched on, so a hidden app is not mentioned either.
  (function () {
    const names = Object.values(CONFIG.apps).filter(a => a.enabled).map(a => 'the ' + a.label);
    if (names.length) SIGNS.apps.blurb = 'Download ' + (names.length > 1 ? names.slice(0, -1).join(', ') + ' or ' + names[names.length - 1] : names[0]) + ', each with its tracked QR code.';
  })();

  function dims(state) {
    const sz = SIZES[state.size] || SIZES.letter;
    const land = state.orientation === 'landscape';
    const wIn = land ? sz.h : sz.w, hIn = land ? sz.w : sz.h;
    return { wIn, hIn, W: Math.round(wIn * DPI), H: Math.round(hIn * DPI), k: Math.min(wIn, hIn) / 8.5, land, size: state.size || 'letter' };
  }
  const r = (n) => Math.round(n);

  function arrowSvg(dir, size, color) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('width', size); svg.setAttribute('height', size);
    svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Arrow ' + (ARROWS[dir] || '').toLowerCase());
    svg.style.cssText = 'display:block;transform:rotate(' + (ROT[dir] || 0) + 'deg)';
    const p = document.createElementNS(ns, 'path');
    p.setAttribute('d', 'M14 50h72M56 20l30 30-30 30');
    p.setAttribute('fill', 'none'); p.setAttribute('stroke', color); p.setAttribute('stroke-width', '13');
    p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    // The readable box is the unrotated square: the glyph stays inside it at every angle (its farthest
    // point is 42.5 of 50 units from the centre), while a rotated element's own rect grows by root 2.
    const wrap = SC.el('div', 'width:' + size + 'px;height:' + size + 'px;flex:none');
    wrap.className = 'ec-readable'; wrap.setAttribute('aria-label', 'Arrow ' + (ARROWS[dir] || '').toLowerCase());
    wrap.appendChild(svg);
    return wrap;
  }

  // A QR code with the address under it. `text` is what the code encodes; `shown` what people read.
  function qrBlock(text, shown, k, fg, file) {
    const Q = CONFIG.qr;
    const src = file ? (CONFIG.assets + file) : SC.qrSvgDataUrl(text, Q.dark, Q.level);
    if (!src) return null;
    const box = SC.el('div', 'display:flex;flex-direction:column;align-items:flex-start;gap:' + r(8 * k) + 'px;flex:none');
    const img = document.createElement('img');
    img.src = src; img.alt = 'QR code for ' + shown;
    img.style.cssText = 'display:block;width:' + r(Q.size * k) + 'px;height:' + r(Q.size * k) + 'px';
    img.className = 'ec-readable';
    box.appendChild(img);
    if (shown) {
      const cap = SC.el('div', 'font-size:' + r(Q.caption * k) + 'px;font-weight:700;line-height:1.2;color:' + fg, shown);
      cap.className = 'ec-readable';
      box.appendChild(cap);
    }
    return box;
  }
  function money(v) { const n = String(v == null ? '' : v).trim().replace(/^\$/, ''); return n ? '$' + n : ''; }

  // Donate: headline, the Passport sentence with the amounts, the Passport lockup, the address big, the QR.
  function buildDonate(text, content, f, d, k, fg, navy) {
    const lines = String(f.headline || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    lines.forEach(t => {
      const h = SC.el('div', 'font-size:' + r(CONFIG.headline * k) + 'px;font-weight:800;letter-spacing:-.02em;line-height:1.02;text-wrap:balance;overflow-wrap:normal;color:' + fg, t);
      h.className = 'ec-readable'; h.dataset.fitwrap = '1'; h.dataset.base = r(CONFIG.headline * k); h.dataset.floor = r(CONFIG.floor * k);
      text.appendChild(h);
    });
    const sentence = CONFIG.donate.sentence.replace('${monthly}', money(f.monthly) || '$5').replace('${yearly}', money(f.yearly) || '$60');
    const s1 = SC.el('div', 'font-size:' + r(CONFIG.subline * k) + 'px;font-weight:500;line-height:1.25;margin-top:' + r(18 * k) + 'px;text-wrap:pretty;color:' + fg, sentence);
    s1.className = 'ec-readable'; s1.dataset.fitwrap = '1'; s1.dataset.base = r(CONFIG.subline * k); s1.dataset.floor = r(24 * k);
    text.appendChild(s1);
    const pp = document.createElement('img');
    pp.src = CONFIG.assets + CONFIG.donate.passportFile; pp.alt = 'Nashville PBS Passport';
    pp.style.cssText = 'display:block;height:' + r(CONFIG.donate.passportH * k) + 'px;width:auto;margin-top:' + r(26 * k) + 'px;align-self:flex-start';
    pp.className = 'ec-readable';
    text.appendChild(pp);
    if ((f.body || '').trim()) {
      const b = SC.el('div', 'font-size:' + r(CONFIG.body * k) + 'px;font-weight:400;line-height:1.45;margin-top:' + r(26 * k) + 'px;max-width:' + r(CONFIG.bodyMax * k) + 'px;white-space:pre-line;text-wrap:pretty;color:' + fg, f.body.trim());
      b.className = 'ec-readable'; text.appendChild(b);
    }
    const shown = CONFIG.donate.url;
    const u = SC.el('div', 'font-size:' + r(64 * k) + 'px;font-weight:800;letter-spacing:-.01em;line-height:1.05;margin-top:' + r(34 * k) + 'px;color:' + (navy ? '#fff' : C.pbsBlue), shown);
    u.className = 'ec-readable'; u.dataset.fitwrap = '1'; u.dataset.base = r(64 * k); u.dataset.floor = r(36 * k);
    text.appendChild(u);
    content.appendChild(text);
    const t = CONFIG.tracked.donate || {};
    const q = qrBlock((t.url || '').trim() || SC.urlTarget(shown), '', k, fg, (t.file || '').trim());
    if (q) { if (!d.land) q.style.alignSelf = 'flex-start'; content.appendChild(q); }
  }

  // Apps: headline, second line, then one block per app that is on (logo over the call to action, the QR code
  // beside them), fine print once if any call to action claims "free".
  function buildApps(text, content, box, f, d, k, fg, navy) {
    const A = CONFIG.appBlock;
    const lines = String(f.headline || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    lines.forEach(t => {
      const h = SC.el('div', 'font-size:' + r(A.headline * k) + 'px;font-weight:800;letter-spacing:-.02em;line-height:1.02;text-wrap:balance;overflow-wrap:normal;color:' + fg, t);
      h.className = 'ec-readable'; h.dataset.fitwrap = '1'; h.dataset.base = r(A.headline * k); h.dataset.floor = r(CONFIG.floor * k);
      text.appendChild(h);
    });
    if ((f.subline || '').trim()) {
      const s1 = SC.el('div', 'font-size:' + r(CONFIG.subline * k) + 'px;font-weight:500;line-height:1.25;margin-top:' + r(14 * k) + 'px;text-wrap:pretty;color:' + fg, f.subline.trim());
      s1.className = 'ec-readable'; s1.dataset.fitwrap = '1'; s1.dataset.base = r(CONFIG.subline * k); s1.dataset.floor = r(24 * k);
      text.appendChild(s1);
    }
    content.appendChild(text);
    const apps = f.apps || {};
    const on = Object.keys(CONFIG.apps).filter(key => CONFIG.apps[key].enabled && (apps[key] === true || (apps[key] && apps[key].on)));
    let free = false;
    if (on.length) {
      const qrSize = r((d.land ? A.qr.landscape : A.qr.portrait) * k);
      const colW = r((d.land ? A.colW.landscape : A.colW.portrait) * k);
      const row = SC.el('div', 'display:flex;flex-wrap:wrap;align-items:flex-start;gap:' + r(A.rowGap * k) + 'px ' + r(28 * k) + 'px;margin-top:' + r(28 * k) + 'px;' + (d.land ? '' : 'flex-direction:column'));
      on.forEach(key => {
        const a = CONFIG.apps[key], v = apps[key] || {};
        const block = SC.el('div', 'display:flex;flex-direction:row;align-items:center;gap:' + r(A.gap * k) + 'px;flex:none');
        const col = SC.el('div', 'display:flex;flex-direction:column;align-items:flex-start;gap:' + r(12 * k) + 'px;width:' + colW + 'px;flex:none');
        const logo = document.createElement('img');
        logo.src = CONFIG.assets + a.file; logo.alt = a.label;
        logo.style.cssText = 'display:block;max-height:' + r(a.logoH * k) + 'px;max-width:100%;width:auto;height:auto;object-fit:contain';
        logo.className = 'ec-readable';
        col.appendChild(logo);
        const cta = a.cta.toUpperCase();
        if (a.finePrint) free = true;
        const c = SC.el('div', 'font-size:' + r(A.cta * k) + 'px;font-weight:800;letter-spacing:.04em;line-height:1.2;color:' + fg, cta);
        c.className = 'ec-readable';
        col.appendChild(c);
        block.appendChild(col);
        const t = CONFIG.tracked.apps[key] || {};
        const target = (t.url || '').trim();
        const src = (t.file || '').trim() ? (CONFIG.assets + t.file) : (target ? SC.qrSvgDataUrl(target, CONFIG.qr.dark, CONFIG.qr.level) : '');
        if (!src) block.dataset.missing = 'No tracked link is set for the ' + a.label + ' yet (shane.md): no QR code, so the sign cannot be downloaded.';
        if (src) {
          const qb = SC.el('div', 'display:flex;flex-direction:column;align-items:flex-start;gap:' + r(6 * k) + 'px;flex:none');
          const img = document.createElement('img');
          img.src = src; img.alt = 'QR code for ' + a.label;
          img.style.cssText = 'display:block;width:' + qrSize + 'px;height:' + qrSize + 'px';
          img.className = 'ec-readable';
          qb.appendChild(img);
          // No address under a tracked code: wnpt.tv links are for scanning, not typing (Shane, 2026-11-07).
          block.appendChild(qb);
        }
        row.appendChild(block);
      });
      content.appendChild(row);
    }
    if (free) {
      const fp = SC.el('div', 'font-size:' + r(18 * k) + 'px;font-weight:400;line-height:1.3;margin-top:' + r(20 * k) + 'px;color:' + fg, CONFIG.finePrint);
      fp.className = 'ec-readable';
      content.appendChild(fp);
    }
  }

  function defaultState(sign) {
    const sg = SIGNS[sign] || SIGNS.welcome;
    return { sign: SIGNS[sign] ? sign : 'welcome', colorway: 'white', accent: 'yellow', size: 'letter', orientation: 'portrait', fields: Object.assign({}, sg.defaults, { partners: [] }) };
  }

  // The sign's DOM at 96 dpi. opts.hideReadable hides text, arrow and logo but keeps the layout (self-test).
  function createStage(state, opts) {
    const d = dims(state), k = d.k;
    const sg = SIGNS[state.sign] || SIGNS.welcome;
    const f = Object.assign({}, sg.defaults, state.fields || {});
    const navy = (state.colorway || 'white') === 'navy';
    const accent = ACCENTS[state.accent] || ACCENTS.yellow;
    const fg = navy ? '#fff' : C.navy;
    const stage = SC.el('div', 'position:relative;width:' + d.W + 'px;height:' + d.H + 'px;overflow:hidden;background:' + (navy ? C.navy : '#fff') + ';font-family:' + FONT + ';color:' + fg + ';box-sizing:border-box');
    stage.className = 'ec-stage';
    const band = r(CONFIG.band * k);
    stage.appendChild(SC.el('div', 'position:absolute;left:0;top:0;width:100%;height:' + band + 'px;background:' + accent));
    const box = SC.el('div', 'position:absolute;left:' + r(CONFIG.padX * k) + 'px;right:' + r(CONFIG.padX * k) + 'px;top:' + (band + r(CONFIG.padTop * k)) + 'px;bottom:' + r(CONFIG.padBottom * k) + 'px;display:flex;flex-direction:column');
    const content = SC.el('div', 'flex:1;min-height:0;display:flex;' + (d.land ? 'flex-direction:row;align-items:center;gap:' + r(56 * k) + 'px' : 'flex-direction:column;justify-content:center;gap:' + r(40 * k) + 'px'));
    content.dataset.box = 'copy';
    const text = SC.el('div', 'display:flex;flex-direction:column;min-width:0;' + (d.land ? 'flex:1' : ''));
    if (state.sign === 'donate' || state.sign === 'apps') {
      if (d.land) content.style.flexDirection = 'column';
      content.style.alignItems = 'flex-start'; content.style.justifyContent = 'center';
      if (state.sign === 'donate') { if (d.land) { content.style.flexDirection = 'row'; content.style.alignItems = 'center'; } buildDonate(text, content, f, d, k, fg, navy); }
      else buildApps(text, content, box, f, d, k, fg, navy);
    } else {
    const lines = String(f.headline || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    lines.forEach(t => {
      const h = SC.el('div', 'font-size:' + r(CONFIG.headline * k) + 'px;font-weight:800;letter-spacing:-.02em;line-height:1.02;text-wrap:balance;overflow-wrap:normal;color:' + fg, t);
      h.className = 'ec-readable'; h.dataset.fitwrap = '1'; h.dataset.base = r(CONFIG.headline * k); h.dataset.floor = r(CONFIG.floor * k);
      text.appendChild(h);
    });
    if ((f.subline || '').trim()) {
      const s = SC.el('div', 'font-size:' + r(CONFIG.subline * k) + 'px;font-weight:500;line-height:1.25;margin-top:' + r(18 * k) + 'px;text-wrap:pretty;color:' + fg, f.subline.trim());
      s.className = 'ec-readable'; s.dataset.fitwrap = '1'; s.dataset.base = r(CONFIG.subline * k); s.dataset.floor = r(24 * k);
      text.appendChild(s);
    }
    if ((f.body || '').trim()) {
      const b = SC.el('div', 'font-size:' + r(CONFIG.body * k) + 'px;font-weight:400;line-height:1.45;margin-top:' + r(26 * k) + 'px;max-width:' + r(CONFIG.bodyMax * k) + 'px;white-space:pre-line;text-wrap:pretty;color:' + fg, f.body.trim());
      b.className = 'ec-readable';
      text.appendChild(b);
    }
    content.appendChild(text);
    if (f.arrow && f.arrow !== 'none' && ARROWS[f.arrow]) {
      const size = r((d.land ? CONFIG.arrow.landscape : CONFIG.arrow.portrait) * k);
      const color = navy ? (CONFIG.arrowUsesAccent ? accent : '#fff') : C.navy;
      const a = arrowSvg(f.arrow, size, color);
      if (!d.land) a.style.alignSelf = 'flex-start';
      content.appendChild(a);
    } else if (state.sign === 'custom' && (f.url || '').trim()) {
      const q = qrBlock((f.shortURL || '').trim() || SC.urlTarget(f.url), qrCaption(f), k, fg);
      if (q) { if (!d.land) q.style.alignSelf = 'flex-start'; content.appendChild(q); }
    }
    }
    box.appendChild(content);
    const partners = Array.isArray(f.partners) ? f.partners.filter(x => x && x.src) : [];
    if (partners.length) {
      const P = CONFIG.partners, tier = partners.length <= 3 ? 0 : partners.length <= 6 ? 1 : 2;
      const wrap = SC.el('div', 'flex:none;display:flex;flex-direction:column;gap:' + r(P.rowGap * k) + 'px;margin-top:' + r(P.above * k) + 'px');
      const label = (f.partnerLabel || '').trim();
      if (label) {
        const l = SC.el('div', 'font-size:' + r(P.labelSize * k) + 'px;font-weight:500;line-height:1.2;color:' + fg, label);
        l.className = 'ec-readable';
        wrap.appendChild(l);
      }
      const row = SC.el('div', 'display:flex;flex-wrap:wrap;align-items:center;gap:' + r(P.rowGap * k) + 'px ' + r(P.gap * k) + 'px');
      partners.forEach((pl, i) => {
        const img = document.createElement('img');
        img.src = pl.src; img.alt = pl.name || ('Partner logo ' + (i + 1));
        img.style.cssText = 'display:block;width:auto;height:auto;max-height:' + r(P.maxH[tier] * k) + 'px;max-width:' + r(P.maxW[tier] * k) + 'px;object-fit:contain;flex:none';
        img.className = 'ec-readable';
        row.appendChild(img);
      });
      wrap.appendChild(row);
      box.appendChild(wrap);
    }
    const logo = document.createElement('img');
    logo.src = CONFIG.assets + (navy ? CONFIG.logoWhite : CONFIG.logoColor); logo.alt = 'Nashville PBS';
    logo.style.cssText = 'display:block;height:' + r(CONFIG.logo * k) + 'px;width:auto;margin-top:' + r(32 * k) + 'px;align-self:flex-start;flex:none';
    logo.className = 'ec-readable';
    box.appendChild(logo);
    stage.appendChild(box);
    if (opts && opts.hideReadable) stage.querySelectorAll('.ec-readable').forEach(e => { e.style.visibility = 'hidden'; });
    return stage;
  }

  // Wrapping text shrinks only when a single word is wider than its column, down to its floor; then the
  // copy block must fit between the band and the logo, and nothing readable may enter the print margin.
  function layout(stage, d) {
    const warnings = [], sizes = [];
    stage.querySelectorAll('[data-fitwrap]').forEach(e => {
      const base = +e.dataset.base, floor = +e.dataset.floor;
      let s = base; e.style.fontSize = s + 'px';
      let guard = 0;
      while (e.scrollWidth > e.clientWidth + 1 && s > floor && guard++ < 60) { s = Math.max(floor, Math.floor(s * 0.95)); e.style.fontSize = s + 'px'; }
      if (e.scrollWidth > e.clientWidth + 1) warnings.push('A word is too long for the sign even at the smallest size: "' + e.textContent + '". Shorten it.');
      sizes.push({ text: e.textContent, px: s, pt: Math.round(s * 72 / DPI) });
    });
    stage.querySelectorAll('[data-missing]').forEach(e => warnings.push(e.dataset.missing));
    const copy = stage.querySelector('[data-box]');
    if (copy && copy.scrollHeight > copy.clientHeight + 1) warnings.push('The copy is taller than the sign. Shorten it, remove a line or remove a partner logo.');
    const out = SC.readableOutside(stage, d.W, { x: MARGIN, y: MARGIN, w: d.W - 2 * MARGIN, h: d.H - 2 * MARGIN });
    if (out.length) warnings.push('Inside the 0.5 in print margin: ' + out.map(SC.describe).join(', ') + '. Shorten the copy.');
    warnings.push(...SC.brokenImages(stage));
    return { warnings, sizes };
  }

  // ---------- PDF ----------
  async function deflate(bytes) {
    if (typeof CompressionStream !== 'function') throw new Error('This browser cannot build the PDF (no CompressionStream). Use a current Chrome, Edge, Safari or Firefox.');
    const cs = new CompressionStream('deflate');
    const w = cs.writable.getWriter();
    w.write(bytes); w.close();
    return new Uint8Array(await new Response(cs.readable).arrayBuffer());
  }
  function pdfString(s) { return '(' + String(s).replace(/[^\x20-\x7E]/g, '?').replace(/[\\()]/g, m => '\\' + m) + ')'; }
  // One page, one FlateDecode RGB image at the page's size: the smallest print-ready PDF there is.
  async function canvasToPdf(canvas, pageW, pageH, title) {
    const w = canvas.width, h = canvas.height;
    const px = canvas.getContext('2d').getImageData(0, 0, w, h).data;
    const rgb = new Uint8Array(w * h * 3);
    for (let i = 0, j = 0; i < px.length; i += 4, j += 3) { rgb[j] = px[i]; rgb[j + 1] = px[i + 1]; rgb[j + 2] = px[i + 2]; }
    const img = await deflate(rgb);
    const enc = new TextEncoder();
    const chunks = []; let offset = 0; const offsets = [];
    const push = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; chunks.push(b); offset += b.length; };
    const obj = (n, body) => { offsets[n] = offset; push(n + ' 0 obj\n'); push(body); push('\nendobj\n'); };
    push('%PDF-1.4\n'); push(new Uint8Array([0x25, 0xE2, 0xE3, 0xCF, 0xD3, 0x0A]));
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + pageW + ' ' + pageH + '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
    offsets[4] = offset;
    push('4 0 obj\n<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ' + img.length + ' >>\nstream\n');
    push(img); push('\nendstream\nendobj\n');
    const content = 'q ' + pageW + ' 0 0 ' + pageH + ' 0 0 cm /Im0 Do Q';
    obj(5, '<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream');
    const now = new Date(); const pad = (n) => String(n).padStart(2, '0');
    const date = 'D:' + now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + 'Z';
    obj(6, '<< /Title ' + pdfString(title) + ' /Producer (Nashville PBS Lower Thirds Studio) /Creator (Event Signs) /CreationDate (' + date + ') >>');
    const xref = offset;
    push('xref\n0 7\n0000000000 65535 f \n');
    for (let n = 1; n <= 6; n++) push(String(offsets[n]).padStart(10, '0') + ' 00000 n \n');
    push('trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    return new Blob(chunks, { type: 'application/pdf' });
  }

  async function render(state, opts) {
    const d = dims(state);
    const host = SC.exportHost(d.W, d.H);
    const node = createStage(state, opts);
    host.appendChild(node);
    try {
      await SC.settle(node);
      const lay = layout(node, d);
      await SC.raf2();
      return { node, d, lay, done: () => host.removeChild(node) };
    } catch (e) { host.removeChild(node); throw e; }
  }
  // The print-ready PDF: the sign captured at 300 dpi on one page of the chosen size.
  async function exportPdf(state, opts) {
    const r0 = await render(state, opts);
    try {
      const canvas = await SC.captureCanvas(r0.node, r0.d.W, r0.d.H, PRINT_DPI / DPI);
      const blob = await canvasToPdf(canvas, r0.d.wIn * 72, r0.d.hIn * 72, title(state));
      return { blob, warnings: r0.lay.warnings, sizes: r0.lay.sizes, width: canvas.width, height: canvas.height, pageW: r0.d.wIn * 72, pageH: r0.d.hIn * 72 };
    } finally { r0.done(); }
  }
  // A PNG at the same 300 dpi (or any scale), for screens and for the self-test's diffs.
  async function exportPng(state, scale, opts) {
    const r0 = await render(state, opts);
    try {
      const url = await SC.capturePng(r0.node, r0.d.W, r0.d.H, scale || PRINT_DPI / DPI);
      return { url, warnings: r0.lay.warnings, sizes: r0.lay.sizes, width: Math.round(r0.d.W * (scale || PRINT_DPI / DPI)), height: Math.round(r0.d.H * (scale || PRINT_DPI / DPI)) };
    } finally { r0.done(); }
  }
  function title(state) {
    const sg = SIGNS[state.sign] || SIGNS.welcome;
    const f = Object.assign({}, sg.defaults, state.fields || {});
    return 'Nashville PBS event sign: ' + (String(f.headline || '').split(/\r?\n/)[0].trim() || sg.label);
  }
  function fileName(state, ext) {
    const sg = SIGNS[state.sign] || SIGNS.welcome;
    const f = Object.assign({}, sg.defaults, state.fields || {});
    const d = dims(state);
    const base = SC.slug(String(f.headline || '').split(/\r?\n/)[0]) || SC.slug(sg.label) || 'sign';
    return 'sign-' + base + '-' + d.size + '-' + (d.land ? 'landscape' : 'portrait') + '.' + (ext || 'pdf');
  }

  global.EventSigns = { DPI, PRINT_DPI, MARGIN, SIZES, ACCENTS, CONFIG, SIGNS, FIELDS, ARROWS, fieldsFor, qrCaption, dims, defaultState, createStage, layout, exportPdf, exportPng, fileName, title };
})(window);
