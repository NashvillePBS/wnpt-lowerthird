/* Nashville PBS graphics studio: the capture pipeline the sibling generators share (endcards/, signs/).
 *
 * One rule runs through it: the preview and the export are the same DOM. A generator builds its stage
 * with these helpers, lays it out with fitLines(), and exports with capture*(). The UHD and print
 * exports scale the node with a real CSS transform and capture at the target size, so the browser
 * paints text at that resolution instead of upscaling a small raster (the studio's captureAtScale
 * fix, 2026-08-05, build.md). Loads after vendor/html-to-image.js.
 */
(function (global) {
  'use strict';

  function el(tag, css, text) {
    const e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  }

  // A single display line that fitLines() shrinks to data-fit px wide, never below the floor it is given.
  function line(text, o) {
    const e = el('div', 'white-space:nowrap;flex:none;font-weight:' + o.weight + ';letter-spacing:' + (o.ls || '0') +
      ';line-height:' + (o.lh || 1.15) + ';color:' + (o.color || '#fff') + ';' + (o.css || ''), text);
    e.className = 'ec-readable';
    e.dataset.fit = o.max; e.dataset.base = o.size;
    e.style.fontSize = o.size + 'px';
    return e;
  }

  // Shrink every [data-fit] element to its width, stopping at `floor` px. Returns the lines that still
  // do not fit (the producer shortens the copy) and the final size of every fitted line.
  function fitLines(root, floor) {
    const warnings = [], sizes = [];
    root.querySelectorAll('[data-fit]').forEach(e => {
      const max = +e.dataset.fit, base = +e.dataset.base;
      e.style.fontSize = base + 'px';
      const w = e.scrollWidth;
      if (w > max) {
        e.style.fontSize = Math.max(floor, Math.floor(base * max / w)) + 'px';
        if (e.scrollWidth > max + 1) warnings.push('Too long even at the ' + floor + 'px minimum: "' + e.textContent + '". Shorten it.');
      }
      sizes.push({ text: e.textContent, px: parseFloat(e.style.fontSize) });
    });
    return { warnings, sizes };
  }

  // Every .ec-readable element whose box crosses `rect` (stage units; the stage may be scaled on screen).
  function readableOutside(stage, stageW, rect) {
    const s = stage.getBoundingClientRect();
    const k = s.width / stageW;
    const out = [];
    stage.querySelectorAll('.ec-readable').forEach(e => {
      const r = e.getBoundingClientRect();
      if (!r.width && !r.height) return;
      const x0 = (r.left - s.left) / k, y0 = (r.top - s.top) / k, x1 = (r.right - s.left) / k, y1 = (r.bottom - s.top) / k;
      if (x0 < rect.x - .5 || y0 < rect.y - .5 || x1 > rect.x + rect.w + .5 || y1 > rect.y + rect.h + .5) out.push(e);
    });
    return out;
  }
  function describe(e) { return e.tagName === 'IMG' ? e.alt : (e.getAttribute('aria-label') || '"' + e.textContent.trim().slice(0, 40) + '"'); }

  function brokenImages(root) {
    const out = [];
    root.querySelectorAll('img').forEach(im => { if (im.complete && !im.naturalWidth) out.push('An image did not load: ' + (im.alt || im.src)); });
    return out;
  }

  const raf2 = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  // Fonts settle, images load, then two frames: the credits rule (build.md §4); dropping one gives fallback-font renders.
  async function settle(node) {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    await Promise.all(Array.from(node.querySelectorAll('img')).map(im => im.complete ? null : new Promise(res => { im.onload = res; im.onerror = res; })));
    await raf2();
  }

  function exportHost(w, h) {
    let host = document.getElementById('ec-export-host');
    if (!host) {
      host = el('div', 'position:fixed;left:-30000px;top:0;overflow:visible;pointer-events:none');
      host.id = 'ec-export-host';
      document.body.appendChild(host);
    }
    host.style.width = w + 'px'; host.style.height = h + 'px';
    return host;
  }

  // Capture a node that is in the document at its natural CSS size w x h, at `scale` times that size.
  async function captureWith(fn, node, w, h, scale) {
    const s = scale || 1;
    if (s === 1) return fn(node, { pixelRatio: 1, width: w, height: h });
    const prevT = node.style.transform, prevO = node.style.transformOrigin;
    node.style.transformOrigin = 'top left';
    node.style.transform = 'scale(' + s + ')';
    await raf2();
    try {
      return await fn(node, { pixelRatio: 1, width: Math.round(w * s), height: Math.round(h * s) });
    } finally {
      node.style.transform = prevT; node.style.transformOrigin = prevO;
    }
  }
  const capturePng = (node, w, h, scale) => captureWith((n, o) => global.htmlToImage.toPng(n, o), node, w, h, scale);
  const captureCanvas = (node, w, h, scale) => captureWith((n, o) => global.htmlToImage.toCanvas(n, o), node, w, h, scale);

  function slug(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48); }
  function download(url, name) { const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }

  global.StudioCore = { el, line, fitLines, readableOutside, describe, brokenImages, raf2, settle, exportHost, capturePng, captureCanvas, slug, download };
})(window);
