#!/usr/bin/env python3
"""Render every end-card style through the tool's real export pipeline in headless Chrome and check the
broadcast rules with pixel reads.

For each style and size (HD 1920x1080, UHD 3840x2160) the harness (endcards/selftest.html) exports the frame
twice: in full, and with every readable element (text, logos, QR) hidden but still laid out. The pixels that
differ are the ink. The ink's bounding box must sit inside title-safe: (192,108)-(1728,972) at HD and
(384,216)-(3456,1944) at UHD. Every fitted line must be at least 40 px at HD, and no export may carry a
warning. With --samples the HD renders are written to endcards/samples/ at half size for the docs.

Usage: python3 scripts/verify-endcards.py [--samples] [--keep DIR]
"""
import base64, html, io, json, os, re, socket, subprocess, sys, time

from PIL import Image, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
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


def run_harness():
    port = free_port()
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1', '-d', ROOT],
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        if not wait_port(port):
            raise SystemExit('local server did not start')
        url = 'http://127.0.0.1:%d/endcards/selftest.html' % port
        res = subprocess.run([NODE, os.path.join(ROOT, 'scripts', 'endcards-harness.mjs'), url],
                             capture_output=True, text=True, timeout=900)
    finally:
        srv.terminate()
    if res.returncode != 0 or not res.stdout.strip():
        sys.stderr.write(res.stderr[-3000:])
        raise SystemExit('harness failed')
    return json.loads(res.stdout)


def decode(data_url):
    return Image.open(io.BytesIO(base64.b64decode(data_url.split(',', 1)[1])))


def main():
    samples = '--samples' in sys.argv
    keep = sys.argv[sys.argv.index('--keep') + 1] if '--keep' in sys.argv else None
    data = run_harness()
    if data.get('error'):
        raise SystemExit('harness error: ' + data['error'])
    print('PBS Sans loaded in the harness: %s' % data.get('fontsOk'))
    for e in data.get('errors') or []:
        print('browser: ' + e)
    ok = True
    rows = []
    for name, r in data['results'].items():
        for scale in (1, 2):
            full, bg = decode(r['x%d' % scale]), decode(r['x%d_bg' % scale])
            size_ok = full.size == (1920 * scale, 1080 * scale) and bg.size == full.size
            diff = ImageChops.difference(full.convert('RGB'), bg.convert('RGB')).convert('L').point(lambda v: 255 if v > 8 else 0)
            bbox = diff.getbbox()  # (left, top, right, bottom); right/bottom exclusive
            safe = (192 * scale, 108 * scale, 1728 * scale, 972 * scale)
            inside = bool(bbox) and bbox[0] >= safe[0] and bbox[1] >= safe[1] and bbox[2] <= safe[2] and bbox[3] <= safe[3]
            sizes = r['x%d_sizes' % scale]
            min_px = min([s['px'] for s in sizes], default=None)
            floor_ok = min_px is None or min_px >= 40
            warnings = r['x%d_warnings' % scale]
            opaque = full.convert('RGBA').getextrema()[3][0] == 255
            row_ok = size_ok and inside and floor_ok and not warnings and opaque
            ok = ok and row_ok
            rows.append((name, '%dx%d' % full.size, bbox, safe, min_px, 'ok' if row_ok else 'FAIL', warnings))
            if keep:
                os.makedirs(keep, exist_ok=True)
                full.save(os.path.join(keep, '%s-%dx%d.png' % (name, full.size[0], full.size[1])))
                bg.save(os.path.join(keep, '%s-%dx%d-bg.png' % (name, full.size[0], full.size[1])))
            if samples and scale == 1:
                d = os.path.join(ROOT, 'endcards', 'samples'); os.makedirs(d, exist_ok=True)
                full.convert('RGB').resize((960, 540), Image.LANCZOS).save(os.path.join(d, name + '.png'), optimize=True)
    print('%-16s %-10s %-28s %-28s %-7s %s' % ('style', 'export', 'ink bbox (l,t,r,b)', 'title-safe', 'min px', 'result'))
    for name, sz, bbox, safe, min_px, res, warnings in rows:
        print('%-16s %-10s %-28s %-28s %-7s %s' % (name, sz, bbox, safe, min_px, res))
        for w in warnings:
            print('    warning: ' + w)
    print('ALL OK' if ok else 'FAILURES')
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
