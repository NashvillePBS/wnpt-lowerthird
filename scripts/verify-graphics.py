#!/usr/bin/env python3
"""Render the studio's sibling generators through their real export pipelines in headless Chrome and check
the brand's geometry rules with pixel reads.

End cards (endcards/selftest.html): every style at HD 1920x1080 and UHD 3840x2160, exported twice, in full
and with every readable element (text, logos, QR) hidden but still laid out. The pixels that differ are the
ink; its bounding box must sit inside title-safe, (192,108)-(1728,972) at HD and (384,216)-(3456,1944) at
UHD; every fitted line is at least 40 px at HD; the PNG is opaque; the export raised no warning.

Event signs (signs/selftest.html): each case as the real PDF (one FlateDecode RGB image at 300 dpi on a
Letter or Tabloid page) plus a PNG of the same frame with the readable elements hidden. The PDF's page
size must match the chosen paper, its image must be the page at 300 dpi, and the ink must stay inside the
0.5 in print margin (150 px at 300 dpi); no warning.

Usage: python3 scripts/verify-graphics.py [--samples] [--keep DIR] [--only endcards|signs]
"""
import base64, io, json, os, re, socket, subprocess, sys, time, zlib

from PIL import Image, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NODE = os.environ.get('NODE') or (subprocess.run(['/bin/zsh', '-lc', 'command -v node'], capture_output=True, text=True).stdout.strip() or 'node')


def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); p = s.getsockname()[1]; s.close(); return p


def wait_port(port, secs=10):
    end = time.time() + secs
    while time.time() < end:
        try:
            socket.create_connection(('127.0.0.1', port), timeout=0.5).close(); return True
        except OSError:
            time.sleep(0.1)
    return False


def run_harness(page):
    port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1', '-d', ROOT],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        if not wait_port(port):
            raise SystemExit('local server did not start')
        url = 'http://127.0.0.1:%d/%s' % (port, page)
        res = subprocess.run([NODE, os.path.join(ROOT, 'scripts', 'endcards-harness.mjs'), url], capture_output=True, text=True, timeout=1200)
    finally:
        srv.terminate()
    if res.returncode != 0 or not res.stdout.strip():
        sys.stderr.write(res.stderr[-3000:])
        raise SystemExit('harness failed for ' + page)
    data = json.loads(res.stdout)
    if data.get('error'):
        raise SystemExit('harness error in %s: %s' % (page, data['error']))
    print('%s: PBS Sans loaded: %s' % (page, data.get('fontsOk')))
    for e in data.get('errors') or []:
        if 'favicon.ico' not in e:
            print('  browser: ' + e)
    return data


def decode(data_url):
    return Image.open(io.BytesIO(base64.b64decode(data_url.split(',', 1)[1])))


def ink_bbox(full, bg):
    diff = ImageChops.difference(full.convert('RGB'), bg.convert('RGB')).convert('L').point(lambda v: 255 if v > 8 else 0)
    return diff.getbbox()  # (left, top, right, bottom); right/bottom exclusive


def inside(bbox, rect):
    return bool(bbox) and bbox[0] >= rect[0] and bbox[1] >= rect[1] and bbox[2] <= rect[2] and bbox[3] <= rect[3]


def check_endcards(samples, keep):
    data = run_harness('endcards/selftest.html')
    ok = True; rows = []
    for name, r in data['results'].items():
        for scale in (1, 2):
            full, bg = decode(r['x%d' % scale]), decode(r['x%d_bg' % scale])
            size_ok = full.size == (1920 * scale, 1080 * scale) and bg.size == full.size
            bbox = ink_bbox(full, bg)
            safe = (192 * scale, 108 * scale, 1728 * scale, 972 * scale)
            sizes = r['x%d_sizes' % scale]
            min_px = min([s['px'] for s in sizes], default=None)
            warnings = r['x%d_warnings' % scale]
            opaque = full.convert('RGBA').getextrema()[3][0] == 255
            row_ok = size_ok and inside(bbox, safe) and (min_px is None or min_px >= 40) and not warnings and opaque
            ok = ok and row_ok
            rows.append((name, '%dx%d' % full.size, bbox, safe, min_px, 'ok' if row_ok else 'FAIL', warnings))
            if keep:
                os.makedirs(keep, exist_ok=True)
                full.save(os.path.join(keep, 'endcard-%s-%dx%d.png' % (name, full.size[0], full.size[1])))
            if samples and scale == 1:
                d = os.path.join(ROOT, 'endcards', 'samples'); os.makedirs(d, exist_ok=True)
                full.convert('RGB').resize((960, 540), Image.LANCZOS).save(os.path.join(d, name + '.png'), optimize=True)
    print('%-16s %-10s %-28s %-28s %-7s %s' % ('end card', 'export', 'ink bbox (l,t,r,b)', 'title-safe', 'min px', 'result'))
    for name, sz, bbox, safe, min_px, res, warnings in rows:
        print('%-16s %-10s %-28s %-28s %-7s %s' % (name, sz, bbox, safe, min_px, res))
        for w in warnings:
            print('    warning: ' + w)
    return ok


def pdf_image(pdf_bytes):
    """The one image of a sign PDF as a PIL image, plus the page size in points."""
    mb = re.search(rb'/MediaBox \[0 0 ([0-9.]+) ([0-9.]+)\]', pdf_bytes)
    m = re.search(rb'/Width (\d+) /Height (\d+) /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length (\d+) >>\nstream\n', pdf_bytes)
    if not mb or not m:
        raise ValueError('not the expected PDF structure')
    w, h, n = int(m.group(1)), int(m.group(2)), int(m.group(3))
    raw = zlib.decompress(pdf_bytes[m.end():m.end() + n])
    if len(raw) != w * h * 3:
        raise ValueError('image data is %d bytes, expected %d' % (len(raw), w * h * 3))
    img = Image.frombytes('RGB', (w, h), raw)
    return img, (float(mb.group(1)), float(mb.group(2))), pdf_bytes.endswith(b'%%EOF\n')


def check_signs(samples, keep):
    data = run_harness('signs/selftest.html')
    ok = True; rows = []
    for name, r in data['results'].items():
        pdf_bytes = base64.b64decode(r['pdf'].split(',', 1)[1])
        try:
            full, page, eof = pdf_image(pdf_bytes)
        except Exception as e:
            rows.append((name, 'unreadable PDF: %s' % e, None, None, None, 'FAIL', r['warnings'])); ok = False; continue
        bg = decode(r['bg'])
        d = r['dims']
        want_page = (round(d['wIn'] * 72, 2), round(d['hIn'] * 72, 2))
        want_px = (round(d['wIn'] * 300), round(d['hIn'] * 300))
        page_ok = (round(page[0], 2), round(page[1], 2)) == want_page and eof
        size_ok = full.size == want_px and bg.size == want_px
        bbox = ink_bbox(full, bg)
        margin = (150, 150, full.size[0] - 150, full.size[1] - 150)
        min_pt = min([s['pt'] for s in r['sizes']], default=None)
        warnings = r['warnings']
        row_ok = page_ok and size_ok and inside(bbox, margin) and not warnings
        ok = ok and row_ok
        rows.append((name, '%gx%g pt, %dx%d px' % (page[0], page[1], full.size[0], full.size[1]), bbox, margin, min_pt, 'ok' if row_ok else 'FAIL', warnings))
        if keep:
            os.makedirs(keep, exist_ok=True)
            with open(os.path.join(keep, r['fileName']), 'wb') as f:
                f.write(pdf_bytes)
        if samples:
            dd = os.path.join(ROOT, 'signs', 'samples'); os.makedirs(dd, exist_ok=True)
            full.resize((full.size[0] // 4, full.size[1] // 4), Image.LANCZOS).save(os.path.join(dd, name + '.png'), optimize=True)
    print('%-32s %-26s %-28s %-26s %-7s %s' % ('sign', 'page, image', 'ink bbox (l,t,r,b)', '0.5 in margin', 'min pt', 'result'))
    for name, sz, bbox, margin, min_pt, res, warnings in rows:
        print('%-32s %-26s %-28s %-26s %-7s %s' % (name, sz, bbox, margin, min_pt, res))
        for w in warnings:
            print('    warning: ' + w)
    return ok


def main():
    samples = '--samples' in sys.argv
    keep = sys.argv[sys.argv.index('--keep') + 1] if '--keep' in sys.argv else None
    only = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
    ok = True
    if only in (None, 'endcards'):
        ok = check_endcards(samples, keep) and ok
    if only in (None, 'signs'):
        ok = check_signs(samples, keep) and ok
    print('ALL OK' if ok else 'FAILURES')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
