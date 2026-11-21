// part 1: shared limb helpers + crocodylomorph, postosuchus, pseudosuchian
module.exports = (H, art, L) => {
const { f, lin, soft, shadow, eye, along, cp, svg, tooth, limb } = H;

// tapered limb: pts [[x,y]...], ws widths per point
function leg(pts, ws, base, lite, dark) {
  const segs = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const k = 3;
    for (let j = 0; j < k; j++) {
      const a = j / k, b = (j + 1) / k;
      const p0 = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * a, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * a];
      const p1 = [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * b, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * b];
      segs.push('M' + f(p0[0]) + ',' + f(p0[1]) + 'L' + f(p1[0]) + ',' + f(p1[1]), f(ws[i] + (ws[i + 1] - ws[i]) * (a + b) / 2));
    }
  }
  let o = '<g transform="translate(2 3)" opacity=".5" stroke-linecap="round" fill="none" stroke="' + dark + '">';
  for (let i = 0; i < segs.length; i += 2) o += '<path d="' + segs[i] + '" stroke-width="' + f(segs[i + 1] + 4) + '"/>';
  o += '</g><g stroke-linecap="round" fill="none" stroke="' + base + '">';
  for (let i = 0; i < segs.length; i += 2) o += '<path d="' + segs[i] + '" stroke-width="' + segs[i + 1] + '"/>';
  const w0 = ws[0];
  o += '</g><path d="M' + pts.map(p => f(p[0] - w0 * .05) + ',' + f(p[1])).join('L') + '" stroke="' + lite + '" stroke-width="' + f(Math.max(3, w0 * .14)) + '" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".4" transform="translate(' + f(-w0 * .07) + ' ' + f(-w0 * .02) + ')"/>';
  return o;
}
// fan-toed foot facing right
function foot2(x, y, col, claw, s, n, lite) {
  let o = '';
  const spread = n === 3 ? [[24, -2], [26, 5], [18, 10]] : n === 2 ? [[26, 0], [20, 8]] : [[22, -4], [27, 2], [25, 8], [17, 12]];
  spread.forEach(([dx, dy]) => { o += `<path d="M${f(x)},${f(y)} L${f(x + dx * s)},${f(y + dy * s + 3)}" stroke="${col}" stroke-width="${f(8 * s)}" stroke-linecap="round"/>`; });
  o += `<ellipse cx="${f(x + 3 * s)}" cy="${f(y)}" rx="${f(13 * s)}" ry="${f(7 * s)}" fill="${col}"/>`;
  if (lite) o += `<path d="M${f(x - 6 * s)},${f(y - 4 * s)} q${f(10 * s)},${f(-4 * s)} ${f(20 * s)},0" stroke="${lite}" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>`;
  if (claw) spread.forEach(([dx, dy]) => { o += `<path d="M${f(x + dx * s - 1)},${f(y + dy * s + 1)} l${f(8 * s)},${f(2 * s + 2)} l${f(-6 * s)},${f(4 * s)} Z" fill="${claw}"/>`; });
  return o;
}
// plates along a curve list
function plates(curves, n, w, h, fill, stroke, hi, off, grow) {
  return along(curves, n).map((p, i, a) => {
    const g = grow ? 1 + grow * (i / a.length) : 1;
    return `<g transform="translate(${f(p.x)} ${f(p.y)}) rotate(${f(p.a)}) translate(0 ${f(off)}) scale(${f(g)})"><rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${w}" height="${h}" rx="${f(h * .38)}" fill="${fill}" stroke="${stroke}" stroke-width="1.8" stroke-opacity=".75"/>` + (hi ? `<path d="M${f(-w * .3)},${f(-h * .1)} q${f(w * .3)},${f(-h * .35)} ${f(w * .6)},0" stroke="${hi}" stroke-width="1.8" fill="none" opacity=".7" stroke-linecap="round"/>` : '') + `</g>`;
  }).join('');
}
const spike = (x, y, ang, len, w, fill, hi) => `<g transform="translate(${x} ${y}) rotate(${ang})"><path d="M0,${-w / 2} C${f(len * .4)},${-w * .5} ${f(len * .75)},${f(-w * .25)} ${len},${f(-w * .05)} C${f(len * .7)},${f(w * .3)} ${f(len * .4)},${f(w * .5)} 0,${w / 2} Z" fill="${fill}"/><path d="M${f(len * .05)},${f(-w * .25)} C${f(len * .4)},${f(-w * .3)} ${f(len * .7)},${f(-w * .18)} ${f(len * .94)},${f(-w * .05)}" stroke="${hi}" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/></g>`;
const fit = (b, dx, dy, s) => `<g transform="translate(${dx} ${dy}) scale(${s})">${b}</g>`;
Object.assign(H, { leg, foot2, plates, spike, fit });

// =====================================================================
// CROCODYLOMORPH  (Sphenosuchus-like: slim, long-legged, upright land runner)
// =====================================================================
function crocomorph() {
  const back = [[58, 352, 130, 330, 210, 290, 275, 262], [275, 262, 320, 246, 400, 248, 470, 252], [470, 252, 505, 254, 530, 246, 552, 230]];
  const bodyD = `M58,352 ${back.map(cp).join(' ')} C566,218 582,212 600,214 C640,214 690,226 722,236 C734,240 736,250 726,255 C700,262 650,264 612,264 C590,264 572,268 558,278 C542,298 520,326 480,338 C420,348 340,346 296,328 C250,316 190,330 150,346 C112,358 80,362 58,352 Z`;
  const defs = [
    lin('sk', 0, 0, 0, 1, ['#D7BE74', '#B49A58', '#7C6A4C', '#544A60']),
    lin('bel', 0, 0, 0, 1, ['#F5EBC4', '#E0CE98']),
    `<clipPath id="bc"><path d="${bodyD}"/></clipPath>`,
    soft('sf', 7),
  ].join('');
  const lc = ['#B49A58', '#E6D08C', '#3F3A52'], far = ['#7C6A4C', '#A08850'];
  let b = shadow(400, 506, 310, 14, .35);
  b += leg([[350, 312], [372, 392], [350, 448], [368, 496]], [30, 22, 12, 10], far[0], far[1], '#2A2A3A') + foot2(368, 500, far[0], 0, .8, 3);
  b += leg([[468, 326], [470, 392], [452, 440], [468, 496]], [22, 16, 10, 8], far[0], far[1], '#2A2A3A') + foot2(468, 500, far[0], 0, .7, 3);
  b += `<path d="${bodyD}" fill="url(#sk)"/><g clip-path="url(#bc)">`;
  b += `<path d="M40,376 C130,350 190,334 296,330 C340,348 420,350 480,340 C530,326 548,300 580,280 L740,262 L740,380 L40,400 Z" fill="url(#bel)"/>`;
  for (let i = 0; i < 5; i++) { const x = 90 + i * 40; b += `<path d="M${x},230 L${x + 16},230 L${x + 4},400 L${x - 14},400 Z" fill="#4A3A30" opacity=".26"/>`; }
  for (let i = 0; i < 7; i++) { const x = 300 + i * 34; b += `<path d="M${x},240 l16,0 l-8,100 l-16,0 Z" fill="#4A3A30" opacity=".26"/>`; }
  b += `<path d="M40,380 C130,356 190,342 296,336 C340,354 420,356 480,346 L480,380 L40,420 Z" fill="#3E3B6E" opacity=".25"/>`;
  b += `<ellipse cx="390" cy="248" rx="190" ry="12" fill="#FFF0A8" opacity=".5" filter="url(#sf)"/>`;
  b += `</g>`;
  b += plates(back, 34, 14, 9, '#C7AE6C', '#5B4A38', '#FFF0B0', 7, 0);
  b += plates(back, 34, 12, 8, '#B49A58', '#5B4A38', 0, 17, 0);
  b += `<path d="M275,262 C320,246 400,248 470,252 C505,254 530,246 552,230 C566,218 582,212 600,214 C640,214 690,226 722,236" stroke="#FFF0B0" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  b += `<path d="M728,254 C700,262 650,258 604,260" stroke="#3A2E2A" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < 9; i++) b += tooth(718 - i * 11, 257 + (i > 5 ? 1 : 0), 4.4, 8, 1, '#FAF4DC');
  b += `<ellipse cx="716" cy="238" rx="6" ry="3.4" fill="#2A2230"/><path d="M706,234 q8,-6 16,-2" stroke="#FFF0B0" stroke-width="2" fill="none" opacity=".6"/>`;
  b += `<path d="M610,226 Q630,212 654,226" stroke="#6D5A3A" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  b += eye(632, 236, 10, '#F0B840') + `<path d="M620,228 Q634,220 648,229" stroke="#4A3A30" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8"/>`;
  b += `<path d="M600,244 q12,8 6,20" stroke="#6D5A3A" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
  b += leg([[300, 306], [330, 386], [300, 450], [320, 498]], [36, 26, 14, 11], lc[0], lc[1], lc[2]) + foot2(322, 502, lc[0], '#F3EBD0', .95, 4, lc[1]);
  b += leg([[496, 320], [510, 392], [490, 442], [510, 498]], [26, 18, 11, 9], lc[0], lc[1], lc[2]) + foot2(512, 502, lc[0], '#F3EBD0', .85, 4, lc[1]);
  return svg('croco', defs, fit(b, -10, -80, 1.04));
}
art.crocodylomorph = L.wrap('crocodylomorph', crocomorph(), { label: 'A slim, long-legged early crocodile relative running upright on land' });

// =====================================================================
// POSTOSUCHUS  (heavy-skulled Triassic predator, pillar-erect legs)
// =====================================================================
function postosuchus() {
  const back = [[56, 392, 120, 372, 220, 300, 300, 262], [300, 262, 350, 238, 430, 244, 500, 262], [500, 262, 530, 268, 556, 258, 576, 244]];
  const bodyD = `M56,392 ${back.map(cp).join(' ')} C600,226 640,222 680,236 C712,246 742,262 750,278 C754,292 742,310 720,318 C690,330 640,332 604,324 C580,332 560,342 540,356 C520,376 480,388 430,390 C380,394 330,388 290,372 C250,364 200,384 150,400 C110,414 80,416 56,392 Z`;
  const defs = [
    lin('sk', 0, 0, 0, 1, ['#A88A5A', '#7C6644', '#54443A', '#3A3552']),
    lin('bel', 0, 0, 0, 1, ['#D9C79A', '#B9A57A']),
    `<clipPath id="bc"><path d="${bodyD}"/></clipPath>`,
    soft('sf', 8),
  ].join('');
  const lc = ['#8A7048', '#C1A66E', '#2E2640'], far = ['#5E4D3A', '#85704E'];
  let b = shadow(400, 512, 340, 15, .35);
  b += leg([[372, 336], [396, 408], [368, 462], [386, 504]], [50, 36, 22, 16], far[0], far[1], '#241F36') + foot2(388, 508, far[0], 0, 1, 3);
  b += leg([[480, 340], [492, 408], [474, 456], [490, 504]], [28, 20, 14, 10], far[0], far[1], '#241F36') + foot2(490, 508, far[0], 0, .8, 3);
  b += `<path d="${bodyD}" fill="url(#sk)"/><g clip-path="url(#bc)">`;
  b += `<path d="M40,420 C130,400 210,390 290,378 C350,396 450,400 520,378 C560,366 580,340 610,330 L760,320 L760,440 L40,440 Z" fill="url(#bel)"/>`;
  for (let i = 0; i < 6; i++) { const x = 90 + i * 44; b += `<path d="M${x},230 l22,0 l-8,200 l-22,0 Z" fill="#3B2C2A" opacity="${i < 4 ? .28 : .12}"/>`; }
  b += `<path d="M40,420 C130,400 210,390 290,378 C350,396 450,400 520,378 L520,420 L40,440 Z" fill="#3A3770" opacity=".28"/>`;
  b += `<ellipse cx="420" cy="250" rx="210" ry="14" fill="#FFE49A" opacity=".5" filter="url(#sf)"/>`;
  b += `<ellipse cx="670" cy="244" rx="60" ry="10" fill="#FFE49A" opacity=".4" filter="url(#sf)"/>`;
  b += `</g>`;
  b += plates(back, 20, 28, 18, '#9A8156', '#44342A', '#E8D49A', 9, .15);
  b += plates(back, 20, 24, 16, '#836B48', '#44342A', 0, 28, .1);
  b += plates(back.slice(1), 12, 20, 14, '#78613F', '#44342A', 0, 45, 0);
  b += `<path d="M300,262 C350,238 430,244 500,262 C530,268 556,258 576,244 C600,226 640,222 680,236 C712,246 742,262 750,278" stroke="#FFE49A" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  b += `<path d="M604,324 C640,332 690,330 720,318 C742,310 754,292 750,278 C734,294 690,298 640,296 C620,296 604,300 592,296 Z" fill="#CDB98A"/>`;
  b += `<path d="M752,292 C712,302 668,298 626,294 C612,293 600,296 590,292" stroke="#2C2230" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < 10; i++) { const x = 738 - i * 13; b += tooth(x, 296 + (i > 6 ? 0 : 1), 7, 13 + (i % 3 === 0 ? 4 : 0), 1, '#FBF5DD'); }
  for (let i = 0; i < 7; i++) { const x = 730 - i * 16; b += tooth(x, 311, 5.5, 8, -1, '#EBE3C4'); }
  b += `<ellipse cx="738" cy="262" rx="12" ry="7" fill="#6D573C"/><ellipse cx="740" cy="260" rx="5" ry="3" fill="#2A2230"/><path d="M700,244 q16,-2 28,6" stroke="#E8D49A" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>`;
  b += `<path d="M632,236 Q662,222 690,240" stroke="#5B452F" stroke-width="9" fill="none" stroke-linecap="round" opacity=".8"/><path d="M632,234 Q662,219 690,237" stroke="#E8D49A" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  b += eye(656, 256, 11, '#F0B02E') + `<path d="M642,244 Q660,238 674,250" stroke="#3B2C2A" stroke-width="4.5" fill="none" stroke-linecap="round" opacity=".85"/>`;
  b += `<path d="M604,262 q14,10 8,28" stroke="#4A3828" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
  b += leg([[336, 322], [364, 404], [330, 466], [350, 508]], [64, 46, 26, 18], lc[0], lc[1], lc[2]) + foot2(352, 512, lc[0], '#F3EBD0', 1.2, 4, lc[1]);
  b += leg([[506, 336], [520, 404], [502, 456], [520, 506]], [32, 22, 15, 11], lc[0], lc[1], lc[2]) + foot2(522, 510, lc[0], '#F3EBD0', .95, 4, lc[1]);
  b += `<path d="M324,340 L338,420 M512,350 L512,420" stroke="#3B2C2A" stroke-width="28" stroke-dasharray="1.5 9" opacity=".18" fill="none"/>`;
  return svg('posto', defs, fit(b, -10, -80, 1.04));
}
art.postosuchus = L.wrap('postosuchus', postosuchus(), { label: 'Postosuchus, a big Triassic croc-line predator with pillar-like legs and armour plates' });

// =====================================================================
// PSEUDOSUCHIAN  (Desmatosuchus-like armoured aetosaur with shoulder spikes)
// =====================================================================
function aetosaur() {
  const bodyD = 'M64,410 C110,396 160,344 230,318 C300,296 400,290 470,296 C530,300 570,312 596,334 C612,344 636,350 660,360 C690,372 716,386 718,402 C716,414 702,418 688,412 C660,408 636,410 612,408 C590,420 570,432 552,440 C500,452 420,452 350,448 C290,446 240,440 200,424 C150,420 100,424 64,410 Z';
  const band = 'M64,410 C110,396 160,344 230,318 C300,296 400,290 470,296 C530,300 570,312 596,334 L586,372 C520,358 440,350 380,352 C320,354 260,364 210,388 C160,410 110,418 64,414 Z';
  const defs = [
    lin('sk', 0, 0, 0, 1, ['#A5B25F', '#788944', '#4F6340', '#34443F']),
    lin('bel', 0, 0, 0, 1, ['#DCD79E', '#B5B074']),
    '<clipPath id="bc"><path d="' + bodyD + '"/></clipPath>',
    '<pattern id="arm" width="32" height="24" patternUnits="userSpaceOnUse"><rect x="1.5" y="1.5" width="29" height="21" rx="6" fill="#92A053" stroke="#2F3B28" stroke-width="2.4" stroke-opacity=".7"/><path d="M16,5 L16,20" stroke="#4A5A33" stroke-width="3" opacity=".55"/><path d="M5,8 Q16,3 27,8" stroke="#E0EAA2" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/></pattern>',
    soft('sf', 8),
  ].join('');
  const lc = ['#7C8C45', '#B9C876', '#26352F'], far = ['#4C5A36', '#6E7F46'];
  let b = shadow(400, 514, 330, 15, .35);
  b += leg([[250, 420], [262, 464], [246, 504]], [46, 34, 28], far[0], far[1], '#1F2A28') + foot2(250, 507, far[0], 0, 1, 4);
  b += leg([[530, 424], [546, 466], [534, 504]], [40, 30, 24], far[0], far[1], '#1F2A28') + foot2(538, 507, far[0], 0, .9, 4);
  b += '<path d="' + bodyD + '" fill="url(#sk)"/><g clip-path="url(#bc)">';
  b += '<path d="M40,480 C120,450 200,424 300,432 C380,450 460,454 540,440 C580,420 600,408 640,408 L760,396 L760,480 L40,480 Z" fill="url(#bel)"/>';
  b += '<path d="' + band + '" fill="url(#arm)"/>';
  b += '<path d="M40,470 C120,440 200,430 260,436 C330,452 440,454 540,436 L540,480 L40,490 Z" fill="#3A3A70" opacity=".3"/>';
  b += '<path d="M64,414 C110,418 160,410 210,388 C260,364 320,354 380,352 C440,350 520,358 586,372 L586,392 C520,380 440,376 380,378 C320,380 270,390 220,410 Z" fill="#2E3A2E" opacity=".22"/>';
  b += '<ellipse cx="390" cy="298" rx="190" ry="12" fill="#F2F8B0" opacity=".5" filter="url(#sf)"/>';
  b += '</g>';
  [[250, 358, 232, 34, 16], [300, 354, 228, 38, 17], [350, 354, 224, 42, 18], [400, 354, 222, 46, 18]].forEach(([x, y, a, l, w]) => b += spike(x, y, a, l, w, '#6F7E3E', '#D8E48A'));
  b += spike(452, 340, 262, 92, 24, '#76853F', '#E4EE9C') + spike(504, 346, 238, 100, 26, '#8C9B52', '#EEF6B0');
  b += '<path d="M110,394 C150,350 230,318 300,300 C360,290 440,290 470,296 C530,300 570,312 596,334" stroke="#EAF2A8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>';
  b += '<path d="M596,334 C612,344 636,350 660,360 C690,372 716,386 718,402" stroke="#E0EAA2" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>';
  b += '<path d="M612,408 C636,410 660,408 688,412 C702,418 716,414 718,402 C700,396 650,392 612,392 Z" fill="#CFC98E"/>';
  b += '<path d="M716,402 C690,396 648,394 612,394" stroke="#2C3A2C" stroke-width="3" fill="none" stroke-linecap="round"/>';
  b += '<ellipse cx="708" cy="386" rx="11" ry="9" fill="#5C6C3A"/><ellipse cx="712" cy="384" rx="4" ry="3" fill="#1D2A22"/>';
  b += '<path d="M640,368 Q664,366 684,380" stroke="#D8E48A" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>';
  b += eye(644, 380, 8, '#E8B63A') + '<path d="M631,374 Q644,367 656,376" stroke="#2C3A2C" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8"/>';
  b += leg([[276, 420], [292, 466], [270, 506]], [56, 40, 32], lc[0], lc[1], lc[2]) + foot2(274, 509, lc[0], '#F2EBCE', 1.1, 4, lc[1]);
  b += leg([[552, 430], [572, 470], [558, 506]], [48, 34, 28], lc[0], lc[1], lc[2]) + foot2(562, 509, lc[0], '#F2EBCE', 1, 4, lc[1]);
  return svg('pseudo', defs, fit(b, -6, -90, 1.03));
}
art.pseudosuchian = L.wrap('pseudosuchian', aetosaur(), { label: 'An armoured croc-line aetosaur with plated back and shoulder spikes' });
};
