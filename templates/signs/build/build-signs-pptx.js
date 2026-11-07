#!/usr/bin/env node
// Builds the Nashville PBS event-sign PowerPoint templates (Letter portrait and Letter landscape) in Arial,
// the stand-in for PBS Sans where fonts cannot ship. Same geometry as the Event Signs generator (signs/signs.js):
// Navy field, a full-width Yellow band, headline / second line / small text, the white station logo bottom-left.
// Usage: node build-signs-pptx.js <outdir>   (needs pptxgenjs on NODE_PATH and the pptx skill's apply_theme.js: see build.sh)
'use strict';
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const { applyTheme } = require(process.env.APPLY_THEME || path.join(__dirname, 'apply_theme.js'));

const OUT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const ASSETS = path.join(__dirname, 'assets');
const THEME = {
  name: 'Nashville PBS Event Signs', headFontFace: 'Arial', bodyFontFace: 'Arial',
  colors: { dk1: '000000', lt1: 'FFFFFF', dk2: '0A145A', lt2: 'EEF0F5', accent1: '2638C4', accent2: 'FE704E', accent3: '087B45', accent4: '486CD8', accent5: 'D6383A', accent6: 'FFCF00', hlink: '2638C4', folHlink: '0F1E8C' }
};
const PHOTO_DRAFT = 'By attending this event, you may be photographed or recorded by Nashville PBS. Images may appear in station programming, promotion and publications.';
const SIGNS = [
  { title: 'Welcome', sub: 'Event name', small: '', arrow: false, notes: 'Welcome sign. Put the event name on the second line. Delete the second line if you do not need it.' },
  { title: 'Registration', sub: '', small: '', arrow: true, notes: 'Directional sign. Drag the arrow’s rotate handle to point it; copy the arrow from this slide onto any other sign.' },
  { title: 'Reserved', sub: 'For whom', small: '', arrow: false, notes: 'Reserved seating or space. Second line: who it is reserved for.' },
  { title: 'Check-In', sub: 'Please have your name ready', small: '', arrow: false, notes: 'Registration or check-in table.' },
  { title: 'Restrooms', sub: '', small: '', arrow: true, notes: 'Restrooms, with the arrow pointing the way.' },
  { title: 'Quiet Please', sub: 'Recording in progress', small: '', arrow: false, notes: 'Quiet please: a recording or a program in progress.' },
  { title: 'Photography Notice', sub: '', small: PHOTO_DRAFT, arrow: false, notes: 'Photography notice. The small text is DRAFT wording: replace it with the notice approved by Communications before printing.' },
  { title: 'Your Headline', sub: 'Second line', small: 'Small text, a sentence or two.', arrow: false, notes: 'Custom sign: replace the three lines; delete the ones you do not need.' }
];

function build(landscape) {
  const pres = new pptxgen();
  const W = landscape ? 11 : 8.5, H = landscape ? 8.5 : 11;
  pres.defineLayout({ name: 'LETTER', width: W, height: H });
  pres.layout = 'LETTER';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  pres.author = 'Nashville PBS'; pres.company = 'Nashville PBS';
  pres.title = 'Nashville PBS Event Signs (' + (landscape ? 'Letter landscape' : 'Letter portrait') + ')';
  pres.subject = 'Printed event sign template';
  const C = pres.SchemeColor;
  // 96 dpi px from signs.js to inches
  const inch = (px) => px / 96;
  const band = inch(28), padX = inch(64), padTop = band + inch(64), padBottom = inch(56);
  const logoH = inch(40), logoW = logoH * 603.48 / 100;
  const arrowSize = inch(landscape ? 300 : 260);
  const contentW = W - 2 * padX;
  // Type: headline 132 px = 99 pt, second line 40 px = 30 pt, small text 26 px = 19.5 pt (Arial is wider than PBS Sans, so the headline is set at 90 pt)
  const textW = landscape ? contentW - arrowSize - inch(56) : contentW;
  const top = padTop + (landscape ? 0.9 : 1.9);
  pres.defineSlideMaster({
    title: 'Sign', background: { color: C.text2 }, objects: [
      { rect: { x: 0, y: 0, w: W, h: band, fill: { color: C.accent6 } } },
      { placeholder: { options: { name: 'headline', type: 'title', x: padX, y: top, w: textW, h: landscape ? 2.2 : 2.6, margin: 0, fontSize: 90, bold: true, color: C.background1, valign: 'top', charSpacing: -2, lineSpacingMultiple: 0.95 }, text: 'Headline' } },
      { placeholder: { options: { name: 'subline', type: 'body', x: padX, y: top + (landscape ? 2.3 : 2.75), w: textW, h: 1.0, margin: 0, fontSize: 30, color: C.background1, valign: 'top', lineSpacingMultiple: 1.1 }, text: 'Second line' } },
      { placeholder: { options: { name: 'small', type: 'body', x: padX, y: top + (landscape ? 3.4 : 3.9), w: Math.min(textW, inch(560)), h: 1.6, margin: 0, fontSize: 19.5, color: C.background1, valign: 'top', lineSpacingMultiple: 1.25 }, text: 'Small text' } },
      { image: { x: padX, y: H - padBottom - logoH, w: logoW, h: logoH, path: path.join(ASSETS, 'logo-white-300.png') } }
    ]
  });
  SIGNS.forEach(sg => {
    const s = pres.addSlide({ masterName: 'Sign' });
    s.addText(sg.title, { placeholder: 'headline' });
    if (sg.sub) s.addText(sg.sub, { placeholder: 'subline' });
    if (sg.small) s.addText(sg.small, { placeholder: 'small' });
    if (sg.arrow) {
      const x = landscape ? W - padX - arrowSize : padX;
      const y = landscape ? (H - arrowSize) / 2 : top + 2.9;
      s.addImage({ path: path.join(ASSETS, 'arrow-yellow.png'), x, y, w: arrowSize, h: arrowSize, objectName: 'Arrow (rotate to point the way)' });
    }
    s.addNotes(sg.notes);
  });
  const how = pres.addSlide({ masterName: 'Sign' });
  how.background = { color: C.background1 };
  how.addText('How to use this template', { placeholder: 'headline', fontSize: 36, color: C.accent1 });
  how.addText([
    { text: 'Duplicate the sign you need, change the words, print at 100% on Letter. Tabloid: File, Print, Scale to fit paper.', options: { breakLine: true } },
    { text: 'The arrow on the Registration and Restrooms signs rotates with its handle; copy it onto any sign.', options: { breakLine: true } },
    { text: 'One accent per sign: the Yellow band. Keep everything inside 0.5 in of the edges.', options: { breakLine: true } },
    { text: 'Arial stands in for PBS Sans. If PBS Sans is installed, Home, Replace, Replace Fonts (Arial to PBS Sans).', options: { breakLine: true } },
    { text: 'For a finished sign without PowerPoint, use Event Signs in the graphics studio: it prints the same design at 300 dpi.' }
  ], { placeholder: 'subline', fontSize: 16, color: C.text1, bullet: true, paraSpaceAfter: 10, h: 4.5 });
  how.addNotes('Instructions slide. Delete it before printing, or leave it: it is the last slide.');
  return pres;
}

(async () => {
  for (const landscape of [false, true]) {
    const file = path.join(OUT, 'NashvillePBS-EventSigns-Letter-' + (landscape ? 'Landscape' : 'Portrait') + '.pptx');
    const pres = build(landscape);
    await pres.writeFile({ fileName: file });
    await applyTheme(file, THEME);
    console.log('wrote', file);
  }
})().catch(e => { console.error(e); process.exit(1); });
