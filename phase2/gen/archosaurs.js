// node phase2/gen/archosaurs.js  -> phase2/out/art2-archosaurs.js
const L = require('../lib');
const f = L.f;
const art = {};

// ---------- helpers ----------
const lin = (id, x1, y1, x2, y2, stops) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">` + stops.map((c, i) => `<stop offset="${f(i / (stops.length - 1))}" stop-color="${c}"/>`).join('') + `</linearGradient>`;
const rad = (id, cx, cy, r, stops) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">` + stops.map((c, i) => `<stop offset="${f(i / (stops.length - 1))}" stop-color="${c}"/>`).join('') + `</radialGradient>`;
const soft = (id, sd) => `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
const shadow = (cx, cy, rx, ry, op) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#10182b" opacity="${op || .35}"/>`;
const eye = (x, y, r, iris, pup) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${iris}"/>` + (pup === 'slit' ? `<ellipse cx="${f(x + r * .1)}" cy="${y}" rx="${f(r * .32)}" ry="${f(r * .82)}" fill="#161224"/>` : `<circle cx="${f(x + r * .1)}" cy="${y}" r="${f(r * .62)}" fill="#161224"/>`) + `<circle cx="${f(x + r * .42)}" cy="${f(y - r * .4)}" r="${f(r * .3)}" fill="#fff"/>`;
// cubic point + tangent angle
function bez(P, t) {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = P, u = 1 - t;
  const x = u*u*u*x0 + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x3, y = u*u*u*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3;
  const dx = 3*u*u*(x1-x0) + 6*u*t*(x2-x1) + 3*t*t*(x3-x2), dy = 3*u*u*(y1-y0) + 6*u*t*(y2-y1) + 3*t*t*(y3-y2);
  return { x, y, a: Math.atan2(dy, dx) * 180 / Math.PI };
}
// n samples along a list of cubics, evenly in t per curve
function along(curves, n) {
  const pts = [], per = n / curves.length;
  curves.forEach(c => { for (let i = 0; i < per; i++) pts.push(bez(c, (i + .5) / per)); });
  return pts;
}
const cp = c => `C${c[2]},${c[3]} ${c[4]},${c[5]} ${c[6]},${c[7]}`;
const svg = (label, defs, body) => `<defs>${defs}</defs>${body}`;
// tooth: triangle hanging from (x,y) pointing in direction dir (+1 down, -1 up)
const tooth = (x, y, w, h, dir, fill) => `<path d="M${f(x - w / 2)},${f(y)} L${f(x + w / 2)},${f(y)} L${f(x + w * .1)},${f(y + dir * h)} Z" fill="${fill || '#F7F1DC'}"/>`;
// leg segment strokes: polyline of points w/ width, base + highlight + shade
function limb(pts, w, base, lite, dark) {
  const d = 'M' + pts.map(p => p.join(',')).join(' L');
  return `<path d="${d}" stroke="${dark}" stroke-width="${w + 4}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".55" transform="translate(2 3)"/>` +
    `<path d="${d}" stroke="${base}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<path d="${d}" stroke="${lite}" stroke-width="${f(w * .22)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".45" transform="translate(${f(-w * .22)} ${f(-w * .24)})"/>`;
}

// =====================================================================
// CROCODILE
// =====================================================================
function crocLike(o) {
  const back = [
    [44, 452, 90, 432, 150, 384, 214, 344],
    [214, 344, 250, 322, 300, 318, 360, 322],
    [360, 322, 430, 327, 480, 323, 530, 318],
    [530, 318, 560, 312, 586, 318, 608, 328],
  ];
  const bodyD = `M${back[0][0]},${back[0][1]} ${back.map(cp).join(' ')} ${o.snout} C580,398 552,410 520,416 C450,430 335,430 262,414 C200,402 150,424 112,446 C86,460 64,466 44,452 Z`;
  const defs = [
    lin('skin', 0, 0, 0, 1, o.skin),
    lin('belly', 0, 0, 0, 1, ['#E9E2A6', '#D3CB8A']),
    lin('limb', 0, 0, 0, 1, ['#7F9340', '#587235']),
    `<clipPath id="bc"><path d="${bodyD}"/></clipPath>`,
    `<pattern id="scute" width="24" height="18" patternUnits="userSpaceOnUse"><rect x="1.5" y="1.5" width="21" height="15" rx="5" fill="${o.sc[0]}" stroke="${o.sc[1]}" stroke-width="2" stroke-opacity=".7"/><path d="M5,6 Q12,3 19,6" stroke="${o.sc[2]}" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/></pattern>`,
    `<pattern id="belly-s" width="16" height="12" patternUnits="userSpaceOnUse"><rect x=".5" y=".5" width="15" height="11" rx="3" fill="none" stroke="#B3A968" stroke-width="1.6" opacity=".7"/></pattern>`,
    soft('sf', 8),
  ].join('');
  let b = '';
  b += shadow(410, 478, 360, 18, .35);
  // far legs
  const foot=(x,y,col,cl,s)=>{let o='';[[-16,-4],[-6,6],[6,8],[18,2]].forEach(([dx,dy])=>{o+='<path d="M'+x+','+y+' l'+f(dx*s)+','+f(dy*s+4)+'" stroke="'+col+'" stroke-width="'+f(9*s)+'" stroke-linecap="round"/>';});o+='<ellipse cx="'+x+'" cy="'+(y-1)+'" rx="'+f(14*s)+'" ry="'+f(7*s)+'" fill="'+col+'"/>';if(cl)[[-16,-4],[-6,6],[6,8],[18,2]].forEach(([dx,dy])=>{o+='<circle cx="'+f(x+dx*s*1.12)+'" cy="'+f(y+dy*s+5)+'" r="2.8" fill="#EDE6C6"/>';});return o;};
  b += limb([[334,402],[352,436],[336,464]], 28, o.lc[3], o.lc[4], '#1A2A24') + foot(336,466,o.lc[3],0,.9);
  b += limb([[566,402],[594,432],[606,464]], 26, o.lc[3], o.lc[4], '#1A2A24') + foot(608,466,o.lc[3],0,.9);
  // body
  b += `<path d="${bodyD}" fill="url(#skin)"/>`;
  b += `<g clip-path="url(#bc)">`;
  // cream belly
  b += `<path d="M30,470 C120,440 190,420 262,416 C340,432 450,432 520,418 C560,410 580,398 610,392 L700,386 L780,380 L780,520 L30,520 Z" fill="url(#belly)"/>`;
  b += `<path d="M30,470 C120,440 190,420 262,416 C340,432 450,432 520,418 C560,410 580,398 610,392 L700,386 L780,380 L780,520 L30,520 Z" fill="url(#belly-s)"/>`;
  // dorsal scute band
  b += `<path d="${back.map((c, i) => (i ? '' : `M${c[0]},${c[1]} `) + cp(c)).join(' ')} L608,372 C560,372 500,376 430,376 C340,374 280,372 232,392 C190,420 120,456 44,452 Z" fill="url(#scute)" opacity=".85"/>`;
  // tail dark bands
  for (let i = 0; i < 5; i++) { const x = 90 + i * 28; b += `<path d="M${x},${470 - i * 14} L${x + 14},${380 - i * 14} L${x + 26},${384 - i * 14} L${x + 12},${474 - i * 14} Z" fill="#1F3A33" opacity=".35"/>`; }
  // shading: underbelly shadow, back highlight
  b += `<path d="M30,470 C120,440 190,420 262,416 C340,432 450,432 520,418 L520,440 L30,480 Z" fill="#35366A" opacity=".28"/>`;
  b += `<ellipse cx="420" cy="322" rx="220" ry="14" fill="${o.hi}" opacity=".4" filter="url(#sf)"/>`;
  b += `<ellipse cx="690" cy="342" rx="70" ry="8" fill="${o.hi}" opacity=".35" filter="url(#sf)"/>`;
  b += `</g>`;
  // keels along the back
  along(back.slice(0, 3), 26).forEach((p, i, a) => {
    const s = 0.55 + 0.45 * (i / a.length);
    b += `<g transform="translate(${f(p.x)} ${f(p.y)}) rotate(${f(p.a)}) scale(${o.ks||1})"><path d="M-9,1 L0,${f(-13 * s - 1)} L9,1 Z" fill="${o.keel[0]}"/><path d="M-9,1 L0,${f(-13 * s - 1)}" stroke="${o.keel[1]}" stroke-width="2" opacity=".8" stroke-linecap="round" fill="none"/></g>`;
  });
  b += o.head;
  // near legs
  b += limb([[286,396],[256,432],[274,464]], 38, o.lc[0], o.lc[1], '#1A2A24') + foot(276,468,o.lc[2],1,1.15);
  b += limb([[522,400],[550,432],[566,466]], 34, o.lc[0], o.lc[1], '#1A2A24') + foot(570,470,o.lc[2],1,1.1);
  // limb scale dashes
  b += `<path d="M276,408 L262,446 M528,412 L556,450" stroke="#3B5230" stroke-width="30" stroke-dasharray="1.5 9" opacity=".25" fill="none"/>`;
  return svg('croc', defs, b);
}
const crocHead = () => {
  let b = '';
  b += `<path d="M214,344 C250,322 300,318 360,322 C430,327 480,323 530,318 C560,312 586,318 608,328 C650,330 700,336 742,341" stroke="#D7E27E" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  b += `<path d="M604,392 C640,386 690,382 736,376 C750,374 762,370 766,360 C740,368 690,366 650,368 C625,368 610,372 598,376 Z" fill="#CDBB6A"/>`;
  b += `<path d="M604,392 C640,386 690,382 736,376 C750,374 762,370 766,360" stroke="#F0E8A8" stroke-width="2.5" fill="none" opacity=".6"/>`;
  b += `<path d="M766,360 C740,367 700,362 660,366 C632,368 612,372 596,366" stroke="#27382B" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < 12; i++) { const x = 750 - i * 12; const y = 362 + (x < 700 ? 1 : 0) + (i > 7 ? 3 : 0); b += tooth(x, y - 1, 6, 10 + (i % 3 === 0 ? 3 : 0), 1); }
  for (let i = 0; i < 9; i++) { const x = 740 - i * 13 - 5; b += tooth(x, 370 + (i > 5 ? 0 : 1), 5, 8, -1, '#E8E1C6'); }
  b += `<ellipse cx="744" cy="342" rx="13" ry="9" fill="#5C7338"/><ellipse cx="742" cy="338" rx="9" ry="4" fill="#B7C865" opacity=".7"/><ellipse cx="748" cy="341" rx="4" ry="2.6" fill="#1D2A22"/>`;
  b += `<ellipse cx="624" cy="324" rx="25" ry="15" fill="#617B38"/><path d="M602,320 Q624,304 648,320" stroke="#C9D774" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  b += eye(627, 326, 9, '#E8B52E', 'slit');
  b += `<path d="M612,320 Q627,311 643,321" stroke="#2F4A2C" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  b += `<path d="M596,336 q12,6 8,18" stroke="#2F4A2C" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  return b;
};
const alliHead = () => {
  let b = '';
  b += `<path d="M214,344 C250,322 300,318 360,322 C430,327 480,323 530,318 C560,312 586,318 608,328 C640,331 676,334 706,338" stroke="#B6C59A" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
  b += `<path d="M604,392 C630,388 662,386 698,382 C714,380 726,374 728,362 C704,370 670,366 640,370 C620,372 606,372 598,376 Z" fill="#D6CFA0"/>`;
  b += `<path d="M604,392 C630,388 662,386 698,382 C714,380 726,374 728,362" stroke="#F2EBC0" stroke-width="2.5" fill="none" opacity=".6"/>`;
  // upper lip overhangs lower jaw
  b += `<path d="M728,360 C704,368 670,363 640,368 C620,371 606,370 596,366 L600,358 C640,356 690,350 726,346 Z" fill="#46503A"/>`;
  b += `<path d="M728,362 C704,370 670,366 640,370 C620,372 606,372 596,366" stroke="#1B231F" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < 7; i++) b += tooth(712 - i * 14, 366 + (i > 3 ? 2 : 0), 5, 6 + (i % 2) * 2, 1, '#EFE9D0');
  b += `<ellipse cx="716" cy="340" rx="16" ry="10" fill="#4C583F"/><ellipse cx="713" cy="336" rx="11" ry="4" fill="#9BAA82" opacity=".7"/><ellipse cx="720" cy="338" rx="4.5" ry="3" fill="#161D1B"/>`;
  b += `<ellipse cx="624" cy="324" rx="25" ry="15" fill="#4F5B40"/><path d="M602,320 Q624,304 648,320" stroke="#A9B98F" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  b += eye(627, 326, 9, '#C9A63A', 'slit');
  b += `<path d="M612,320 Q627,311 643,321" stroke="#1F2822" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  b += `<path d="M596,336 q12,6 8,18" stroke="#1F2822" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  return b;
};
art.crocodile = L.wrap('crocodile', crocLike({
  snout: 'C650,330 700,336 742,341 C760,343 770,352 766,360 C762,370 750,374 736,376 C690,382 640,386 604,392',
  skin: ['#97AA45', '#6D8236', '#46602F', '#2F4A3C'], sc: ['#82954A', '#3B5230', '#D4DE86'], keel: ['#4E6A33', '#C9D774'], hi: '#E4EC8E', lc: ['#6F8738', '#A6BB52', '#5B7231', '#3E5630', '#5E7B3A'], head: crocHead(),
}), { label: 'A saltwater crocodile with armoured back scutes and a toothy snout' });
art.alligator = L.wrap('alligator', crocLike({
  snout: 'C640,331 676,332 704,334 C724,336 734,348 730,362 C726,374 714,380 698,382 C660,386 630,388 604,392',
  skin: ['#6C7B55', '#4D5B3F', '#323E36', '#222B30'], sc: ['#58664A', '#222B25', '#98A883'], keel: ['#3B4633', '#9BAA82'], hi: '#B6C59A', ks: .8, lc: ['#58664A', '#8E9E78', '#46523C', '#323D30', '#4C5A44'], head: alliHead(),
}), { label: 'An American alligator with a broad snout and dark skin' });


const H = { f, lin, rad, soft, shadow, eye, bez, along, cp, svg, tooth, limb };
require('./archosaurs_p1')(H, art, L);
//@@MORE@@
module.exports = { art };
if (require.main === module) L.writeFile('archosaurs', art);
