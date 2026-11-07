#!/usr/bin/env python3
"""Render the options Shane compares and write them, labelled, under docs/options/.

End cards (endcards/optionstest.html): slate rail columns 2/3/4, announcement-slate pattern rows 4/5/6, and the
three PBS KIDS treatments, each through the real export. Every one is checked with pixel reads: the ink (all
text, logos and QR codes) must sit inside title-safe, (192,108)-(1728,972) at 1920x1080, with no warning.
Signs (signs/selftest.html): band thickness, band colour, the Navy option, and a printer view that shades the
0.25 in strip an office printer cannot print; every sign must have nothing printed inside 0.58 in of an edge.

Usage: python3 scripts/render-options.py
"""
import base64, io, os, sys, zlib, re
from PIL import Image, ImageChops, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib.util
spec = importlib.util.spec_from_file_location('vg', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'verify-graphics.py'))
vg = importlib.util.module_from_spec(spec); spec.loader.exec_module(vg)

ROOT = vg.ROOT
OUT = os.path.join(ROOT, 'docs', 'options')
FONT = '/System/Library/Fonts/Helvetica.ttc'

def font(size):
    try: return ImageFont.truetype(FONT, size, index=1)
    except Exception: return ImageFont.load_default()

def strip(cells, title, note, cell_w):
    """cells: list of (PIL image, label). Returns one labelled image."""
    pad, head, foot = 24, 70, 62
    ch = max(int(im.size[1] * cell_w / im.size[0]) for im, _ in cells)
    W = pad + len(cells) * (cell_w + pad)
    H = head + ch + foot + pad
    out = Image.new('RGB', (W, H), (238, 240, 246))
    d = ImageDraw.Draw(out)
    d.text((pad, 18), title, fill=(10, 20, 90), font=font(28))
    d.text((pad, 50 - 6), '', fill=(0, 0, 0), font=font(2))
    for i, (im, label) in enumerate(cells):
        x = pad + i * (cell_w + pad)
        sc = im.convert('RGB').resize((cell_w, int(im.size[1] * cell_w / im.size[0])), Image.LANCZOS)
        out.paste(sc, (x, head))
        d.rectangle([x - 1, head - 1, x + cell_w, head + sc.size[1]], outline=(180, 186, 210))
        d.text((x, head + ch + 10), label, fill=(10, 20, 90), font=font(22))
    d.text((pad, H - 40), note, fill=(90, 98, 128), font=font(18))
    return out

def main():
    os.makedirs(OUT, exist_ok=True)
    report = []
    # ---------------- end cards ----------------
    data = vg.run_harness('endcards/optionstest.html')
    imgs, ok_all = {}, True
    for name, r in data['results'].items():
        full, bg = vg.decode(r['x1']), vg.decode(r['x1_bg'])
        bbox = vg.ink_bbox(full, bg)
        ok = vg.inside(bbox, (192, 108, 1728, 972)) and not r['x1_warnings']
        ok_all = ok_all and ok
        imgs[name] = full
        report.append('| %s | %s | %s |' % (name, bbox, 'inside title-safe' if ok else 'FAIL ' + '; '.join(r['x1_warnings'])))
    groups = [
        ('endcards-slate-rail-columns.png', 'Slate: how many pattern columns in the left rail', 'Rail is 14% of the frame wide; more columns = smaller shapes. Shane chose 2 (2026-11-07).',
         [('rail-2-columns', '2 columns (chosen)'), ('rail-3-columns', '3 columns'), ('rail-4-columns', '4 columns')]),
        ('endcards-pattern-rows.png', 'Announcement slate: how many pattern rows across the frame', 'More rows = smaller shapes behind the text. Brand book: 3 to 6 whole rows. Shane kept 5.',
         [('rows-4', '4 rows'), ('rows-5', '5 rows (chosen)'), ('rows-6', '6 rows')]),
        ('endcards-pbs-kids-treatments.png', 'Endpage: PBS KIDS pairing on the gradient', 'KIDS is never alone and never a lockup. Reverse circle uses the station-derived digital file (design-system shane.md 5); stacked is larger because it is taller.',
         [('kids-color-pair', 'Color circle beside station logo'), ('kids-reverse-pair', 'Reverse circle (chosen)'), ('kids-stacked-pair', 'Stacked: KIDS above station logo')]),
    ]
    for fname, title, note, cells in groups:
        strip([(imgs[k], l) for k, l in cells], title, note, 620).save(os.path.join(OUT, fname), optimize=True)
    # ---------------- signs ----------------
    sdata = vg.run_harness('signs/selftest.html')
    simg, frame_ok_all = {}, True
    for name, r in sdata['results'].items():
        pdf = base64.b64decode(r['pdf'].split(',', 1)[1])
        im, page, eof = vg.pdf_image(pdf)
        simg[name] = im
        printed = ImageChops.invert(im.convert('L')).point(lambda v: 255 if v > 12 else 0).getbbox()
        ok = vg.inside(printed, (174, 174, im.size[0] - 174, im.size[1] - 174)) and not r['warnings']
        frame_ok_all = frame_ok_all and ok
    sg = [
        ('signs-band-thickness.png', 'Signs: band thickness (the band sits inside a white border)', 'Thin, Standard, Thick (chosen). All three keep the same white border all round.',
         [('welcome-thin-letter-portrait', 'Thin'), ('welcome-standard-letter-portrait', 'Standard'), ('welcome-letter-portrait', 'Thick (chosen)')]),
        ('signs-band-colors.png', 'Signs: band color, one accent per sign', 'Yellow (default), Teal, Coral.',
         [('welcome-letter-portrait', 'Yellow (default)'), ('welcome-teal-letter-portrait', 'Teal'), ('welcome-coral-letter-portrait', 'Coral')]),
        ('signs-navy-option.png', 'Signs: the Navy option is a panel inside the same white border', 'For a print shop or sign holder; it uses far more ink. White logo versions are used on Navy.',
         [('welcome-navy-letter-portrait', 'Welcome'), ('donate-navy-letter-portrait', 'Donate'), ('apps-navy-letter-portrait', 'Our Apps')]),
    ]
    for fname, title, note, cells in sg:
        strip([(simg[k], l) for k, l in cells], title, note, 460).save(os.path.join(OUT, fname), optimize=True)
    # printer view: shade the 0.25 in strip an office printer cannot print, on the default signs
    def printer_view(im):
        v = im.convert('RGB').copy(); w, h = v.size; m = 75  # 0.25 in at 300 dpi
        ov = Image.new('RGBA', v.size, (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
        shade = (120, 120, 130, 150)
        d.rectangle([0, 0, w, m], fill=shade); d.rectangle([0, h - m, w, h], fill=shade)
        d.rectangle([0, 0, m, h], fill=shade); d.rectangle([w - m, 0, w, h], fill=shade)
        return Image.alpha_composite(v.convert('RGBA'), ov).convert('RGB')
    strip([(printer_view(simg['welcome-letter-portrait']), 'Welcome'), (printer_view(simg['donate-letter-portrait']), 'Donate'), (printer_view(simg['apps-default-letter-portrait']), 'Our Apps')],
          'Signs: what an office printer prints', 'Gray = the 0.25 in strip a typical office printer leaves unprinted. Nothing is in it; the band starts 0.58 in from every edge.', 460).save(os.path.join(OUT, 'signs-printer-view.png'), optimize=True)
    with open(os.path.join(OUT, 'REPORT.md'), 'w') as f:
        f.write('# Options render report\n\nEnd-card options, ink (every text, logo and QR) against title-safe (192,108)-(1728,972):\n\n| option | ink bbox (l,t,r,b) | result |\n|---|---|---|\n' + '\n'.join(report) + '\n\nSigns: every case in signs/selftest.html has no printed pixel inside 0.58 in of an edge: %s.\n' % ('yes' if frame_ok_all else 'NO'))
    print('\n'.join(report)); print('signs printer-border check:', 'yes' if frame_ok_all else 'NO')
    print('written:', sorted(os.listdir(OUT)))
    sys.exit(0 if (ok_all and frame_ok_all) else 1)

if __name__ == '__main__':
    main()
