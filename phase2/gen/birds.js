// Phase-2 bird illustrations -> phase2/out/art2-birds.js   (node phase2/gen/birds.js)
const L = require('../lib');
const f = L.f;
const art = {};

// ---------- helpers ----------
const lg = (id, stops, x1 = 0, y1 = 0, x2 = 1, y2 = 1) =>
  `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</linearGradient>`;
const rg = (id, stops, cx = .5, cy = .5, r = .5, fx, fy) =>
  `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx != null ? ` fx="${fx}" fy="${fy}"` : ''}>${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</radialGradient>`;
const soft = (id = 'soft', sd = 9) => `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
const shadow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry || Math.round(rx * .1)}" fill="#0a0e26" opacity=".35"/>`;
const eye = (x, y, r, iris, pup = '#17121f') =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${iris}"/><circle cx="${x + r * .08}" cy="${y}" r="${f(r * .6)}" fill="${pup}"/><circle cx="${f(x + r * .32)}" cy="${f(y - r * .34)}" r="${f(r * .34)}" fill="#fff"/>`;
const feat = (ox, oy, ang, len, w, bend, fill, lite) =>
  `<g transform="translate(${ox} ${oy}) rotate(${ang})">${L.leafFeather(len, w, bend, fill, lite)}</g>`;
// U-shaped scallop strokes (feather edges)
function scal(x0, y0, cols, rows, dx, dy, w, col, op, sw) {
  let s = '';
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = x0 + c * dx + (r % 2) * dx / 2, y = y0 + r * dy;
    s += `<path d="M${f(x - w)},${f(y)} Q${f(x)},${f(y + w * 1.3)} ${f(x + w)},${f(y)}"/>`;
  }
  return `<g stroke="${col}" stroke-width="${sw || 3}" fill="none" stroke-linecap="round" opacity="${op}">${s}</g>`;
}
const toe = (x, y, dx, dy, w, col, claw, cl = true) =>
  `<path d="M${x},${y} L${f(x + dx)},${f(y + dy)}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>` +
  (cl ? `<path d="M${f(x + dx * .88)},${f(y + dy * .88)} l${f(dx * .26)},${f(dy * .26 + w * .35)}" stroke="${claw}" stroke-width="${f(w * .62)}" stroke-linecap="round"/>` : '');
const bez = (p, t) => {
  const u = 1 - t;
  return [0, 1].map(i => u * u * u * p[0][i] + 3 * u * u * t * p[1][i] + 3 * u * t * t * p[2][i] + t * t * t * p[3][i]);
};
const bezAng = (p, t) => {
  const u = 1 - t;
  const dx = 3 * u * u * (p[1][0] - p[0][0]) + 6 * u * t * (p[2][0] - p[1][0]) + 3 * t * t * (p[3][0] - p[2][0]);
  const dy = 3 * u * u * (p[1][1] - p[0][1]) + 6 * u * t * (p[2][1] - p[1][1]) + 3 * t * t * (p[3][1] - p[2][1]);
  return Math.atan2(dy, dx) * 180 / Math.PI;
};
const wrapSvg = (id, inner, label) => { art[id] = L.wrap(id, inner, { label }); };
const svg = (defs, body) => `<defs>${defs}</defs>${body}`;

// =====================================================================
// MAGPIE
// =====================================================================
(() => {
  const B = 'M522,232 C566,268 552,362 478,404 C412,436 332,404 292,350 C272,316 298,284 350,258 C420,216 482,200 522,232 Z';
  const W = 'M476,278 C506,322 456,384 336,412 C296,420 252,414 236,408 C276,382 326,340 376,292 C410,262 452,258 476,278 Z';
  const defs = lg('blk', [[0, '#3d4466'], [.5, '#1c1e36'], [1, '#0a0a16']], .2, 0, .7, 1) +
    lg('wht', [[0, '#ffffff'], [.6, '#eef1fb'], [1, '#b9c4e6']], 0, 0, 0, 1) +
    lg('irid', [[0, '#1b3a9a'], [.45, '#1c8f9a'], [1, '#43c48a']], 0, 0, 1, .6) +
    lg('irid2', [[0, '#2b2a96'], [.5, '#2468c0'], [1, '#36c2a0']], 0, 0, 1, 0) +
    lg('tailG', [[0, '#122a7a'], [.35, '#1b7a9c'], [.7, '#2db08a'], [1, '#7a45b0']], 0, 0, 1, 0) +
    soft('soft', 8) +
    `<clipPath id="bc"><path d="${B}"/></clipPath><clipPath id="wc"><path d="${W}"/></clipPath>`;
  let o = '';
  o += shadow(400, 556, 210, 18);
  // tail: graduated, long
  [[150, 190, 24], [158, 255, 26], [182, 215, 24], [174, 285, 26], [166, 345, 28]].forEach(([a, l, w]) => {
    o += feat(330, 336, a, l, w, 10, 'url(#tailG)', '#8fe9ff');
  });
  // glossy streak on central tail feather
  o += `<g transform="translate(330 336) rotate(166)"><path d="M40,-6 Q170,2 320,12" stroke="#b7f5ff" stroke-width="5" fill="none" opacity=".25" stroke-linecap="round"/></g>`;
  // legs
  const leg = (x, sh) => {
    const c = sh ? '#14141f' : '#1e1f30';
    return `<path d="M${x},396 L${x + 4},${528}" stroke="${c}" stroke-width="10" stroke-linecap="round"/>` +
      `<path d="M${x + 4},528 l-2,-4" stroke="#5a6288" stroke-width="2" opacity=".5"/>` +
      toe(x + 4, 530, 46, 6, 8, c, '#0b0b12') + toe(x + 4, 530, 38, 18, 8, c, '#0b0b12') + toe(x + 4, 530, 36, -6, 7, c, '#0b0b12') + toe(x + 4, 530, -28, 8, 8, c, '#0b0b12');
  };
  o += leg(388, true) + leg(446, false);
  // body
  o += `<path d="${B}" fill="url(#blk)"/>`;
  o += `<g clip-path="url(#bc)">`;
  o += `<ellipse cx="448" cy="392" rx="128" ry="66" fill="url(#wht)"/>`;
  o += `<ellipse cx="440" cy="446" rx="170" ry="40" fill="#5a66a8" opacity=".45"/>`;
  o += `<ellipse cx="420" cy="232" rx="120" ry="14" fill="#8fa2e8" opacity=".5" filter="url(#soft)"/>`;
  o += scal(470, 318, 3, 3, 24, 20, 9, '#c9d0ee', .45, 2.5);
  o += `<path d="M350,396 C400,372 450,380 500,372" stroke="#9aa6d8" stroke-width="2.5" fill="none" opacity=".45" stroke-linecap="round"/>`;
  o += scal(350, 404, 5, 2, 26, 16, 10, '#aab4de', .5, 2.5);
  o += `</g>`;
  o += `<path d="M350,258 C420,216 482,200 522,232" stroke="#8d9ae0" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  // wing
  o += `<path d="${W}" fill="url(#irid)"/>`;
  o += `<g clip-path="url(#wc)">`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
    const x = 420 - c * 30 + (r % 2) * 14 - r * 20, y = 300 + r * 24 + c * 12;
    o += `<path d="M${x - 15},${y - 18} L${x + 15},${y - 18} L${x + 15},${y} C${x + 15},${y + 12} ${x + 6},${y + 20} ${x},${y + 24} C${x - 6},${y + 20} ${x - 15},${y + 12} ${x - 15},${y} Z" fill="${['#1d4fb0', '#1b8fa8', '#2a9a7a', '#2d58a8'][(r + c) % 4]}" opacity=".55" stroke="#0e1d4a" stroke-opacity=".4" stroke-width="2"/>`;
  }
  // primaries
  for (let i = 0; i < 7; i++) o += `<path d="M${392 - i * 20},${330 + i * 7} L${250 + i * 4},${404 + i * 0}" stroke="${i % 2 ? '#1b2f8a' : '#4fd2c0'}" stroke-width="3" opacity=".55" stroke-linecap="round"/>`;
  o += `<ellipse cx="400" cy="296" rx="90" ry="12" fill="#7fe6e0" opacity=".4" filter="url(#soft)"/>`;
  // white scapular patch
  o += `<path d="M360,306 C396,268 456,260 486,284 C490,296 488,306 480,312 C452,300 412,310 384,336 Z" fill="url(#wht)"/>`;
  o += `<path d="M384,336 C412,310 452,300 480,312" stroke="#9fb0e6" stroke-width="3" fill="none" opacity=".6"/>`;
  o += `</g>`;
  o += `<path d="M376,292 C410,262 452,258 476,278" stroke="#b8f2ff" stroke-width="2.5" fill="none" opacity=".7" stroke-linecap="round"/>`;
  // head
  o += `<circle cx="548" cy="196" r="42" fill="url(#blk)"/>`;
  o += `<path d="M514,184 C524,160 560,150 582,172" stroke="#8d9ae0" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  o += `<ellipse cx="540" cy="172" rx="30" ry="10" fill="#4a64c8" opacity=".45" filter="url(#soft)"/>`;
  o += `<path d="M580,178 C612,174 646,190 654,210 C622,214 598,216 574,214 Z" fill="#15151f"/>`;
  o += `<path d="M574,214 C600,224 632,222 654,210 C620,216 598,216 574,214 Z" fill="#06060c"/>`;
  o += `<path d="M584,183 C612,180 636,192 646,204" stroke="#6a76a8" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>`;
  o += `<circle cx="598" cy="190" r="2.2" fill="#000" opacity=".5"/>`;
  o += eye(560, 187, 9, '#5a3216');
  o += `<path d="M548,176 Q560,170 574,176" stroke="#0a0a14" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>`;
  wrapSvg('magpie', svg(defs, o), 'A magpie with black and white plumage and a long, shiny blue-green tail');
})();

// =====================================================================
// PENGUIN (emperor)
// =====================================================================
(() => {
  const B = 'M432,86 C468,86 488,118 484,152 C482,176 492,200 500,240 C516,320 520,420 490,490 C470,530 430,540 400,540 C360,540 328,520 316,478 C300,420 304,320 330,250 C346,205 360,185 366,150 C370,112 398,86 432,86 Z';
  const defs = lg('pb', [[0, '#40507a'], [.5, '#1f2848'], [1, '#10142a']], 0, 0, 1, 1) +
    lg('bel', [[0, '#FFE39A'], [.3, '#FFF4D6'], [1, '#D6E2F4']], 0, 0, 0, 1) +
    lg('ear', [[0, '#FF8F1A'], [.45, '#FFC53D'], [1, '#FFE9A0', 0]], 0, 0, .3, 1) +
    lg('fl', [[0, '#34416c'], [1, '#10142a']], 0, 0, 1, 1) +
    lg('ft', [[0, '#6a5a7a'], [1, '#2e2840']], 0, 0, 0, 1) + soft('soft', 8) +
    `<clipPath id="bc"><path d="${B}"/></clipPath>`;
  let o = shadow(410, 552, 170, 17);
  // tail stub
  o += `<path d="M322,480 C302,500 296,522 308,538 C332,534 348,522 356,506 Z" fill="#161c38"/>`;
  // feet
  o += `<path d="M360,536 C380,520 430,524 456,536 L462,552 C420,564 380,562 352,552 Z" fill="url(#ft)"/>`;
  o += `<path d="M450,536 C476,526 506,534 514,546 L516,556 C490,564 460,560 440,552 Z" fill="url(#ft)"/>`;
  [372, 398, 424].forEach(x => o += `<path d="M${x},548 l4,12" stroke="#1a1626" stroke-width="3" stroke-linecap="round"/>`);
  [468, 490, 508].forEach(x => o += `<path d="M${x},546 l4,10" stroke="#1a1626" stroke-width="3" stroke-linecap="round"/>`);
  o += `<path d="M366,536 C390,526 430,528 452,538" stroke="#a79ab8" stroke-width="2.5" fill="none" opacity=".6"/>`;
  // body
  o += `<path d="${B}" fill="url(#pb)"/>`;
  o += `<g clip-path="url(#bc)">`;
  o += `<path d="M470,204 C506,262 524,380 494,480 C472,538 400,548 376,520 C410,450 420,330 408,238 C425,214 450,206 470,204 Z" fill="url(#bel)"/>`;
  o += `<path d="M520,330 C526,420 500,500 440,540" stroke="#8fa6d8" stroke-width="22" fill="none" opacity=".35" filter="url(#soft)"/>`;
  o += `<path d="M408,238 C420,330 412,440 376,520" stroke="#6c7fb8" stroke-width="12" fill="none" opacity=".35" filter="url(#soft)"/>`;
  o += scal(430, 300, 3, 8, 24, 26, 9, '#b8c6e6', .5, 2.5);
  o += `<ellipse cx="410" cy="100" rx="40" ry="10" fill="#7488c8" opacity=".55" filter="url(#soft)"/>`;
  o += `</g>`;
  o += `<path d="M366,150 C370,112 398,86 432,86 C468,86 488,118 484,152" stroke="#8aa0e0" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  // ear patch
  o += `<path d="M408,126 C424,114 452,120 464,146 C472,172 466,208 454,238 C430,224 406,180 408,126 Z" fill="url(#ear)"/>`;
  o += `<path d="M416,126 C430,120 448,126 456,142" stroke="#FFE9A8" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  // flipper
  o += `<path d="M372,226 C340,262 322,350 332,436 C358,398 394,322 406,250 Z" fill="url(#fl)"/>`;
  o += `<path d="M372,226 C340,262 322,350 332,436" stroke="#8aa0e0" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  o += `<path d="M386,250 C370,300 354,360 344,410" stroke="#0a0d20" stroke-width="3" fill="none" opacity=".4"/>`;
  // bill
  o += `<path d="M482,126 C520,126 548,144 558,170 C540,166 514,164 482,158 Z" fill="#252233"/>`;
  o += `<path d="M482,158 C516,164 538,170 556,176 C534,190 506,186 482,174 Z" fill="#FF8F5E"/>`;
  o += `<path d="M486,132 C514,132 536,144 548,160" stroke="#6a6488" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>`;
  o += `<path d="M498,140 l8,2" stroke="#000" stroke-width="2.5" opacity=".5" stroke-linecap="round"/>`;
  o += eye(464, 124, 7, '#6b4a2a');
  wrapSvg('penguin', svg(defs, o), 'An emperor penguin with a yellow-orange ear patch');
})();

// =====================================================================
// HUMMINGBIRD
// =====================================================================
(() => {
  const defs = lg('hg', [[0, '#5fe0a0'], [.45, '#16a070'], [1, '#08503f']], 0, 0, 1, 1) +
    lg('hb', [[0, '#f4f7ee'], [1, '#9db3a8']], 0, 0, 0, 1) +
    rg('gorg', [[0, '#ff6a9a'], [.5, '#ff2f6d'], [1, '#a30f3c']], .35, .3, .75) +
    lg('crown', [[0, '#4b8cff'], [1, '#16a070']], 0, 0, 1, 1) +
    lg('tl', [[0, '#0b5d4a'], [1, '#2a2f6a']], 0, 0, 1, 0) +
    lg('pet', [[0, '#ff9a5e'], [.6, '#ff5f7e'], [1, '#c8286a']], 0, 0, 1, 1) +
    lg('pet2', [[0, '#ffd1a8'], [1, '#ff7a90']], 0, 0, 1, 1) +
    lg('lf', [[0, '#5fcf6a'], [1, '#1d7a48']], 0, 0, 1, 1) +
    soft('soft', 5);
  let o = '';
  // stem + leaves + bud
  o += `<path d="M706,560 C690,470 740,380 690,260" stroke="#2c8a4c" stroke-width="10" fill="none" stroke-linecap="round"/>`;
  o += `<path d="M706,560 C690,470 740,380 690,260" stroke="#7be08a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6" transform="translate(-3 0)"/>`;
  o += feat(702, 470, 200, 130, 26, 12, 'url(#lf)', '#bff5b0');
  o += feat(716, 400, -20, 110, 22, -10, 'url(#lf)', '#bff5b0');
  o += `<ellipse cx="750" cy="340" rx="22" ry="34" fill="url(#pet)" transform="rotate(25 750 340)"/>`;
  o += `<path d="M728,372 C716,350 724,330 740,320" stroke="#2c8a4c" stroke-width="5" fill="none"/>`;
  // flower (face on)
  for (let i = 0; i < 5; i++) {
    const a = i * 72 + 12;
    o += `<g transform="translate(660 204) rotate(${a})"><ellipse cx="46" cy="0" rx="56" ry="32" fill="url(#pet)"/><path d="M12,0 L82,0 M20,-8 L68,-14 M20,8 L68,14" stroke="#ffd0b0" stroke-width="2.5" opacity=".5" fill="none" stroke-linecap="round"/><ellipse cx="60" cy="-10" rx="26" ry="9" fill="#ffb7a0" opacity=".35"/></g>`;
  }
  o += `<circle cx="660" cy="204" r="24" fill="#a31c52"/><circle cx="660" cy="204" r="14" fill="#ffcb3d"/>`;
  [[-14, -22], [10, -26], [26, -8], [18, 20], [-10, 22]].forEach(([x, y]) => o += `<path d="M660,204 L${660 + x},${204 + y}" stroke="#ffe08a" stroke-width="2.5"/><circle cx="${660 + x}" cy="${204 + y}" r="4" fill="#ffb02e"/>`);
  // far wing (behind body) with blur ghost
  const wing = (ang, op, extra) => {
    let s = `<g transform="translate(356 288)" opacity="${op}">`;
    [0, 12, 24, 36].forEach((d, i) => { s += `<g transform="rotate(${ang + d - 20})"><path d="M0,0 C60,-26 190,-34 260,0 C190,26 60,24 0,0 Z" fill="#dff3f4" opacity="${.5 - i * .08}"/></g>`; });
    return s + `</g>`;
  };
  o += `<g filter="url(#soft)">${wing(228, .8)}</g>`;
  o += `<g transform="translate(356 288) rotate(236)" opacity=".55"><path d="M0,0 C60,-18 190,-24 250,0 C190,16 60,16 0,0 Z" fill="#b8dde6"/><path d="M10,0 L240,0" stroke="#fff" stroke-width="3" opacity=".7"/></g>`;
  // tail
  o += `<g transform="translate(300 358)">${[160, 178, 196].map((a, i) => `<g transform="rotate(${a + 28})">${L.leafFeather(120 - i * 4, 18, 0, 'url(#tl)', '#7be0b8')}</g>`).join('')}</g>`;
  // body
  o += `<g transform="translate(346 326) rotate(-48)"><ellipse cx="0" cy="0" rx="92" ry="46" fill="url(#hg)"/><ellipse cx="6" cy="20" rx="78" ry="26" fill="url(#hb)"/><path d="M-70,22 C-20,34 40,34 78,18" stroke="#6f877e" stroke-width="3" fill="none" opacity=".4"/><ellipse cx="-4" cy="-28" rx="64" ry="9" fill="#9bf5c4" opacity=".6" filter="url(#soft)"/><path d="M-80,-16 C-30,-46 30,-44 76,-28" stroke="#b9ffd6" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/></g>`;
  o += scal(300, 330, 3, 2, 18, 14, 7, '#0b5d4a', .35, 2.5).replace('<g ', '<g transform="rotate(-20 330 340)" ');
  // legs tucked
  o += `<path d="M340,384 l-8,18 M352,382 l-4,18" stroke="#3a3040" stroke-width="4" stroke-linecap="round"/>`;
  // near wing (blurred) over body shoulder
  o += `<g filter="url(#soft)">${wing(214, .85)}</g>`;
  o += `<g transform="translate(360 290) rotate(218)"><path d="M0,0 C70,-20 180,-22 232,0 C180,14 70,14 0,0 Z" fill="#cfe9ef" opacity=".55"/><path d="M6,0 L226,0" stroke="#fff" stroke-width="4" opacity=".75" stroke-linecap="round"/></g>`;
  o += `<g transform="translate(360 290)" opacity=".25"><path d="M0,0 C40,60 130,110 210,120 C150,60 60,20 0,0 Z" fill="#cfe9ef"/></g>`;
  // head
  o += `<circle cx="418" cy="258" r="35" fill="url(#hg)"/>`;
  o += `<path d="M390,246 C396,226 430,222 448,240 C430,236 410,240 390,252 Z" fill="url(#crown)" opacity=".9"/>`;
  o += `<ellipse cx="414" cy="282" rx="26" ry="19" fill="url(#gorg)" transform="rotate(-20 414 282)"/>`;
  o += `<path d="M400,280 q10,-8 22,-4" stroke="#ffc2d6" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  o += `<path d="M444,248 L644,200 L644,206 L446,266 Z" fill="#2a2433"/><path d="M446,251 L640,202" stroke="#6a5f80" stroke-width="2" opacity=".7"/>`;
  o += eye(434, 252, 8, '#2a1a22', '#0c0710');
  o += `<ellipse cx="426" cy="262" rx="5" ry="3" fill="#fff" opacity=".6"/>`;
  wrapSvg('hummingbird', svg(defs, o), 'A hummingbird hovering at a flower with blurred wings');
})();

// =====================================================================
// OSTRICH
// =====================================================================
(() => {
  const BODY = 'M206,236 C226,172 330,144 430,160 C504,174 542,220 532,272 C522,332 442,362 352,358 C272,352 192,312 206,236 Z';
  const defs = lg('blk', [[0, '#454a5c'], [.5, '#22252f'], [1, '#0f1016']], .2, 0, .6, 1) +
    lg('wht', [[0, '#ffffff'], [.6, '#f2f1ee'], [1, '#c6cde4']], 0, 0, 0, 1) +
    lg('skin', [[0, '#f8bab0'], [1, '#d98484']], 0, 0, 1, 0) +
    lg('skinD', [[0, '#d9948e'], [1, '#b8646a']], 0, 0, 1, 0) +
    lg('nail', [[0, '#6a6070'], [1, '#2b2630']], 0, 0, 1, 1) + soft('soft', 8) +
    `<clipPath id="bc"><path d="${BODY}"/></clipPath>`;
  let o = shadow(440, 564, 230, 18);
  const leg = (dx, far) => {
    const sk = far ? 'url(#skinD)' : 'url(#skin)', sc = far ? '#a85a62' : '#c26e72', hl = far ? '#e8aaa4' : '#ffd8cf';
    let s = '';
    s += `<path d="M${394 + dx},330 C${382 + dx},380 ${392 + dx},430 ${414 + dx},460 L${450 + dx},452 C${456 + dx},410 ${450 + dx},370 ${442 + dx},330 Z" fill="${sk}"/>`;
    s += `<path d="M${416 + dx},452 C${414 + dx},490 ${412 + dx},520 ${410 + dx},546 L${434 + dx},548 C${438 + dx},520 ${440 + dx},490 ${446 + dx},452 Z" fill="${sk}"/>`;
    s += `<circle cx="${432 + dx}" cy="456" r="22" fill="${sk}"/>`;
    for (let y = 468; y < 540; y += 10) s += `<path d="M${414 + dx},${y} Q${424 + dx},${y + 7} ${436 + dx},${y}" stroke="${sc}" stroke-width="2.2" fill="none" opacity=".8"/>`;
    for (let i = 0; i < 4; i++) s += `<path d="M${404 + dx + i * 10},${380 + (i % 2) * 14} q8,10 16,0" stroke="${sc}" stroke-width="2.5" fill="none" opacity=".7"/>`;
    s += `<path d="M${396 + dx},340 C${388 + dx},390 ${396 + dx},430 ${414 + dx},458" stroke="${hl}" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
    // two-toed foot
    s += `<path d="M${406 + dx},540 C${416 + dx},528 ${470 + dx},532 ${504 + dx},548 C${516 + dx},554 ${514 + dx},566 ${498 + dx},566 L${410 + dx},566 C${396 + dx},562 ${394 + dx},548 ${406 + dx},540 Z" fill="${sk}"/>`;
    s += `<path d="M${496 + dx},546 C${510 + dx},548 ${524 + dx},556 ${520 + dx},566 L${496 + dx},566 Z" fill="url(#nail)"/>`;
    s += `<path d="M${384 + dx},552 C${394 + dx},546 ${410 + dx},548 ${414 + dx},556 C${406 + dx},566 ${386 + dx},566 ${378 + dx},560 Z" fill="${far ? '#b8646a' : '#d98484'}"/>`;
    s += `<path d="M${380 + dx},556 C${372 + dx},556 ${368 + dx},562 ${376 + dx},566 L${388 + dx},566 Z" fill="url(#nail)"/>`;
    s += `<path d="M${412 + dx},544 C${440 + dx},536 ${470 + dx},540 ${498 + dx},550" stroke="${hl}" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>`;
    for (let i = 0; i < 5; i++) s += `<path d="M${430 + dx + i * 16},548 q6,8 12,2" stroke="${sc}" stroke-width="2" fill="none" opacity=".7"/>`;
    return s;
  };
  // far leg
  o += leg(-62, true);
  // tail plumes (white) behind body
  [[150, 170, 30], [162, 200, 32], [174, 220, 32], [186, 210, 30], [198, 180, 28], [208, 150, 26]].forEach(([a, l, w], i) => {
    o += feat(236, 232 + i * 3, a, l, w, 14, 'url(#wht)', '#aeb8d8');
  });
  // body
  o += `<path d="${BODY}" fill="url(#blk)"/>`;
  o += `<g clip-path="url(#bc)">`;
  o += `<ellipse cx="400" cy="372" rx="220" ry="50" fill="#07070c" opacity=".55"/>`;
  o += `<ellipse cx="400" cy="162" rx="150" ry="16" fill="#8590b8" opacity=".5" filter="url(#soft)"/>`;
  o += scal(230, 190, 10, 6, 30, 26, 12, '#7a84a8', .4, 3);
  o += `</g>`;
  o += `<path d="M206,236 C226,172 330,144 430,160 C504,174 542,220 532,272" stroke="#9aa6d0" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>`;
  // wing: white fluffy
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
    const x = 300 + c * 32 + (r % 2) * 16, y = 232 + r * 24 - c * 4 + (c > 3 ? 0 : 0);
    o += feat(x, y, 100 + r * 4 + (c - 3) * 3, 78 - r * 6, 17, 6, r % 2 ? 'url(#wht)' : '#f7f6f2', '#c6cde4').replace(/opacity="\.7"/g, 'opacity=".5"');
  }
  o += `<ellipse cx="400" cy="236" rx="110" ry="12" fill="#fff" opacity=".6" filter="url(#soft)"/>`;
  for (let i = 0; i < 6; i++) o += feat(246 + i * 34, 262 + i * 6, 156 + i * 3, 92 - i * 2, 20, 10, 'url(#wht)', '#b8c0dc');
  // black body plumes edge over lower belly
  o += `<path d="M230,300 C300,350 420,362 520,310" stroke="#05060a" stroke-width="16" fill="none" opacity=".25" stroke-linecap="round"/>`;
  // thigh / near leg
  o += leg(0, false);
  // neck
  o += `<path d="M484,266 C474,206 496,150 540,104 L562,120 C540,150 536,190 548,236 C552,252 552,262 548,272 Z" fill="url(#skin)"/>`;
  o += `<path d="M542,112 C524,140 518,186 530,236" stroke="#ffdfd6" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>`;
  o += `<path d="M498,200 C502,150 520,128 540,112" stroke="#b8646a" stroke-width="5" fill="none" opacity=".3" stroke-linecap="round"/>`;
  // sparse neck down
  const r = L.rng(7);
  for (let i = 0; i < 26; i++) {
    const t = r(), x = 490 + t * 30 - (1 - t) * 0 + (t > .5 ? 10 : 0), y = 250 - t * 140 + (r() - .5) * 20;
    o += `<path d="M${f(x + 8 * (1 - t))},${f(y)} l${f(4 + r() * 5)},${f(-3 - r() * 4)}" stroke="#fff" stroke-width="2" opacity=".8" stroke-linecap="round"/>`;
  }
  // white collar fluff
  for (let i = 0; i < 9; i++) o += feat(474 + i * 8, 268 + (i % 2) * 6, 270 + (i - 4) * 8, 40, 9, 0, i % 2 ? '#fff' : '#eef0f6', null);
  // head
  o += `<ellipse cx="586" cy="86" rx="32" ry="22" fill="url(#skin)" transform="rotate(12 586 86)"/>`;
  o += `<path d="M606,86 C632,82 656,90 662,100 C644,110 620,108 604,104 Z" fill="#e6a8a0"/><path d="M606,98 C630,102 650,100 662,100 C646,108 620,108 604,104 Z" fill="#c2787e"/>`;
  o += `<path d="M610,86 C630,84 650,90 658,98" stroke="#fff0ea" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>`;
  o += `<path d="M636,92 l6,0" stroke="#7a3a42" stroke-width="3" stroke-linecap="round" opacity=".6"/>`;
  o += `<circle cx="590" cy="80" r="12" fill="#fff"/>` + eye(591, 80, 10, '#4a2a18', '#120a08');
  o += `<path d="M578,72 l-4,-6 M586,68 l-1,-7 M595,68 l3,-6" stroke="#2a1a14" stroke-width="2.5" stroke-linecap="round"/>`;
  wrapSvg('ostrich', svg(defs, o), 'An ostrich with a long pink neck, black and white plumage and two-toed feet');
})();

// =====================================================================
// ARCHAEOPTERYX
// =====================================================================
(() => {
  const defs = lg('af', [[0, '#2a3a6a'], [.6, '#4a5aa0'], [1, '#7a86c8']], 0, 0, 1, 0) +
    lg('af2', [[0, '#3a2f55'], [1, '#8a6aa8']], 0, 0, 1, 0) +
    lg('skin', [[0, '#b0a06a'], [1, '#6f6040']], 0, 0, 1, 1) +
    lg('bel', [[0, '#e8d8a8'], [1, '#a08a60']], 0, 0, 0, 1) +
    lg('body', [[0, '#5a6aa8'], [.5, '#33407a'], [1, '#1d2450']], .2, 0, .6, 1) +
    lg('tip', [[0, '#d0a54a'], [1, '#7a4a2a']], 0, 0, 1, 1) + soft('soft', 8) +
    `<clipPath id="bc"><path id="bs" d="M296,340 C304,288 380,258 442,274 C492,288 522,322 502,372 C478,424 390,434 338,406 C310,390 292,366 296,340 Z"/></clipPath>`;
  let o = shadow(430, 560, 210, 16);
  // tail
  const tp = [[306, 346], [236, 376], [150, 424], [64, 462]];
  for (let i = 0; i < 13; i++) {
    const t = .08 + i * .075, [x, y] = bez(tp, t), a = bezAng(tp, t), len = 92 - t * 40;
    o += feat(f(x), f(y), f(a - 28), f(len), 9, 2, 'url(#af2)', '#b6a8e8');
    o += feat(f(x), f(y), f(a + 168 - 360 + 14), f(len), 9, -2, 'url(#af)', '#a8b6f0');
  }
  o += `<path d="M312,334 C240,362 150,410 62,454 L66,470 C150,436 240,402 314,366 Z" fill="url(#skin)"/>`;
  for (let i = 1; i < 14; i++) { const [x, y] = bez(tp, i * .07), a = bezAng(tp, i * .07); o += `<path d="M${f(x)},${f(y - 10)} l-3,22" stroke="#4a3d28" stroke-width="2" opacity=".5" transform="rotate(${f(a - 155)} ${f(x)} ${f(y)})"/>`; }
  // far leg
  o += `<path d="M398,396 L436,446 L408,502 L414,540" stroke="#6a5a3a" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += toe(414, 542, 36, 6, 8, '#6a5a3a', '#2a2018') + toe(414, 542, 30, -6, 8, '#6a5a3a', '#2a2018') + toe(414, 542, -18, 6, 7, '#6a5a3a', '#2a2018');
  // neck
  o += `<path d="M450,296 C490,272 492,236 510,214 L564,240 C552,270 548,306 520,336 Z" fill="url(#skin)"/>`;
  for (let i = 0; i < 8; i++) o += `<path d="M${470 + i * 7},${284 - i * 8} q10,6 12,16" stroke="#3a4a8a" stroke-width="4" opacity=".6" stroke-linecap="round"/>`;
  // body
  o += `<path d="M296,340 C304,288 380,258 442,274 C492,288 522,322 502,372 C478,424 390,434 338,406 C310,390 292,366 296,340 Z" fill="url(#body)"/>`;
  o += `<g clip-path="url(#bc)">`;
  o += `<ellipse cx="440" cy="414" rx="170" ry="44" fill="url(#bel)" opacity=".75"/>`;
  o += `<ellipse cx="400" cy="270" rx="120" ry="14" fill="#9aaaf0" opacity=".5" filter="url(#soft)"/>`;
  o += scal(300, 310, 8, 5, 26, 22, 11, '#a8b6f0', .45, 3);
  o += `</g>`;
  // near leg: feathered thigh + reptilian shank
  o += `<path d="M386,392 L440,448 L412,504 L420,542" stroke="url(#skin)" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<path d="M384,386 L440,446" stroke="#c9bb88" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>`;
  for (let i = 0; i < 5; i++) o += feat(396 + i * 8, 398 + i * 12, 70 + i * 3, 62 - i * 4, 11, 4, i % 2 ? 'url(#af)' : 'url(#af2)', '#a8b6f0');
  o += toe(420, 544, 46, 4, 10, '#8a7a4a', '#2a2018') + toe(420, 544, 38, -8, 10, '#8a7a4a', '#2a2018') + toe(420, 544, 38, 14, 9, '#8a7a4a', '#2a2018') + toe(420, 544, -24, 8, 8, '#8a7a4a', '#2a2018');
  o += `<path d="M420,512 l22,-14" stroke="#8a7a4a" stroke-width="7" stroke-linecap="round"/><path d="M438,500 l10,-6" stroke="#2a2018" stroke-width="5" stroke-linecap="round"/>`;
  // wing (raised): secondaries + primaries
  const wr = [446, 160];
  for (let i = 0; i < 8; i++) o += feat(f(430 - i * 2), f(268 - i * 14), 196 + i * 1.5, f(190 - i * 6), 17, 6, 'url(#af2)', '#b6a8e8');
  for (let i = 0; i < 7; i++) o += feat(wr[0] + 6, wr[1] + 4, f(178 + i * 5), f(250 - i * 8), 18, 8, i % 2 ? 'url(#af)' : 'url(#af2)', '#b8c6ff');
  for (let i = 0; i < 6; i++) o += feat(f(404 + i * 8), f(246 - i * 14), 190 + i * 3, 70, 14, 4, 'url(#tip)', '#ffe0a0');
  // arm bones + three clawed fingers
  o += `<path d="M452,310 L408,262 L454,166" stroke="#7a6a44" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `<path d="M454,166 L454,166" stroke="#7a6a44" stroke-width="12"/>`;
  [[86, -52, 0], [84, -24, 0], [70, 6, 0]].forEach(([dx, dy], i) => {
    const x = 454, y = 164, ex = x + dx, ey = y + dy;
    o += `<path d="M${x},${y} L${ex},${ey}" stroke="#8a7a4a" stroke-width="${8 - i}" stroke-linecap="round"/>`;
    o += `<path d="M${ex},${ey} q16,-4 22,12" stroke="#2a2018" stroke-width="${5 - i * .5}" fill="none" stroke-linecap="round"/>`;
  });
  o += `<path d="M404,266 L454,166" stroke="#b8a878" stroke-width="3" opacity=".5" fill="none"/>`;
  // head
  o += `<path d="M508,206 C534,182 584,182 620,212 C630,222 626,234 616,238 L562,246 C528,248 504,230 508,206 Z" fill="url(#skin)"/>`;
  o += `<path d="M512,204 C538,184 582,186 616,210" stroke="#e8dcaa" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  o += `<path d="M562,242 L614,242 C618,254 594,262 566,258 Z" fill="#8a7848"/>`;
  o += `<path d="M562,242 L614,242" stroke="#2a2018" stroke-width="2" opacity=".6"/>`;
  for (let i = 0; i < 6; i++) o += `<path d="M${576 + i * 7},${i > 3 ? 233 : 236} l3,9 l3,-9 Z" fill="#fff8e0"/>`;
  for (let i = 0; i < 4; i++) o += `<path d="M${580 + i * 8},242 l3,-8 l3,8 Z" fill="#fff8e0" transform="translate(0 2)"/>`;
  o += `<circle cx="608" cy="212" r="3" fill="#3a2e1c"/>`;
  o += eye(546, 212, 10, '#e0a028', '#140e08');
  o += `<path d="M530,204 Q548,194 566,204" stroke="#3a2e1c" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;
  // head feather crest/neck
  [0, 1, 2].forEach(i => o += feat(514 + i * 6, 214 + i * 4, 200 + i * 10, 36, 7, 0, 'url(#af)', '#a8b6f0'));
  wrapSvg('archaeopteryx', svg(defs, o), 'Archaeopteryx, a feathered dinosaur-bird with teeth, clawed fingers and a long bony tail');
})();

// =====================================================================
// AVIALAN (Confuciusornis-like)
// =====================================================================
(() => {
  const B = 'M300,372 C290,300 340,255 410,262 C470,270 500,310 490,360 C480,420 420,452 360,442 C320,434 304,406 300,372 Z';
  const defs = lg('back', [[0, '#a8884a'], [.5, '#755f34'], [1, '#43361e']], .1, 0, .8, 1) +
    lg('bel', [[0, '#f6e6b2'], [1, '#cdb078']], 0, 0, 0, 1) +
    lg('wg', [[0, '#5a4630'], [1, '#2e2418']], 0, 0, 1, 1) +
    lg('rib', [[0, '#1f6f86'], [.6, '#2fa0b0'], [1, '#8fe0d8']], 0, 0, 1, 0) +
    lg('br', [[0, '#8a6a44'], [1, '#4a3622']], 0, 0, 0, 1) +
    lg('lf', [[0, '#7fc06a'], [1, '#2f7a48']], 0, 0, 1, 1) + soft('soft', 8) +
    `<clipPath id="bc"><path d="${B}"/></clipPath>`;
  let o = '';
  // ribbon tail feathers (hang below branch)
  const rp = [[312, 396], [270, 470], [220, 540], [110, 576]];
  const rib = (dy, w, op) => {
    let d = `M${rp[0][0]},${rp[0][1] + dy}`;
    d += ` C${rp[1][0]},${rp[1][1] + dy} ${rp[2][0]},${rp[2][1] + dy} ${rp[3][0]},${rp[3][1] + dy}`;
    return `<path d="${d}" stroke="url(#rib)" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${op}"/>`;
  };
  o += `<g transform="translate(14 0)">${rib(-6, 15, 1)}</g>` + rib(8, 14, 1);
  o += `<path d="M312,396 C270,470 220,540 112,576" stroke="#bff3ee" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round" transform="translate(-2 3)"/>`;
  // short tail fan
  [[120, 90], [134, 110], [148, 96]].forEach(([a, l]) => o += feat(318, 392, a, l, 16, 6, 'url(#wg)', '#e2b23c'));
  // branch
  o += `<path d="M60,500 C200,480 420,490 620,470 L740,458 L742,486 C620,500 400,516 200,520 L56,528 Z" fill="url(#br)"/>`;
  o += `<path d="M70,498 C200,478 420,486 620,468 L736,458" stroke="#c49a66" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  o += `<path d="M120,514 L190,508 M300,512 l60,-3 M520,500 l70,-6" stroke="#2a1c10" stroke-width="3" opacity=".4" stroke-linecap="round"/>`;
  o += feat(600, 468, 280, 70, 18, 4, 'url(#lf)', '#d0f5b0') + feat(600, 468, 330, 80, 18, 0, 'url(#lf)', '#d0f5b0');
  // legs + feet gripping
  const leg = (x) => `<path d="M${x},426 L${x + 8},474" stroke="#8a6a3a" stroke-width="13" stroke-linecap="round"/>` +
    [0, 1, 2].map(i => `<path d="M${x + 8},470 q${34 + i * 2},${-8 + i * 2} ${44 + i * 4},${18 + i * 6}" stroke="#d7a64a" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="${x + 52 + i * 4}" cy="${488 + i * 6}" r="4.5" fill="#2a1c10"/>`).join('') +
    `<path d="M${x + 8},470 q-26,-4 -34,14" stroke="#d7a64a" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="${x - 26}" cy="486" r="4.5" fill="#2a1c10"/>`;
  o += leg(380) + leg(424);
  // body
  o += `<path d="${B}" fill="url(#back)"/>`;
  o += `<g clip-path="url(#bc)">`;
  o += `<ellipse cx="450" cy="400" rx="110" ry="70" fill="url(#bel)"/>`;
  o += `<ellipse cx="420" cy="448" rx="150" ry="30" fill="#4a3a28" opacity=".35"/>`;
  o += `<ellipse cx="400" cy="262" rx="110" ry="12" fill="#f0d890" opacity=".5" filter="url(#soft)"/>`;
  o += scal(430, 330, 4, 5, 22, 20, 9, '#a58a54', .6, 2.5);
  o += `</g>`;
  o += `<path d="M340,262 C400,252 470,268 498,330" stroke="#f0d890" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  // wing folded
  const Wn = 'M368,284 C430,270 478,320 462,392 C446,430 394,444 330,440 C300,436 290,424 292,420 C326,404 340,350 368,284 Z';
  o += `<path d="${Wn}" fill="url(#wg)"/>`;
  o += `<clipPath id="wc"><path d="${Wn}"/></clipPath><g clip-path="url(#wc)">`;
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
    const x = 380 + c * 24 - r * 14 + (r % 2) * 12, y = 300 + r * 24 + c * 6;
    o += `<path d="M${x - 12},${y - 16} L${x + 12},${y - 16} L${x + 12},${y} C${x + 12},${y + 10} ${x + 5},${y + 16} ${x},${y + 20} C${x - 5},${y + 16} ${x - 12},${y + 10} ${x - 12},${y} Z" fill="${r % 2 ? '#6a5236' : '#7a6040'}" stroke="#e2b23c" stroke-opacity=".7" stroke-width="2.2"/>`;
  }
  for (let i = 0; i < 6; i++) o += `<path d="M${420 - i * 22},${350 + i * 14} L${300 + i * 2},${430}" stroke="#e2b23c" stroke-width="2.5" opacity=".5" stroke-linecap="round"/>`;
  o += `</g>`;
  o += `<path d="M368,284 C430,270 478,320 462,392" stroke="#f6d27a" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  // wrist claw
  o += `<path d="M462,330 C482,326 492,334 490,350 C480,342 470,340 460,344 Z" fill="#e8d8a8"/><path d="M486,332 C494,338 494,346 490,352" stroke="#3a2c1c" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  // head
  o += `<circle cx="480" cy="232" r="40" fill="url(#back)"/>`;
  o += `<ellipse cx="500" cy="254" rx="28" ry="20" fill="url(#bel)"/>`;
  [0, 1, 2, 3].forEach(i => o += feat(458 + i * 8, 196 + i * 2, 230 + i * 14, 40, 8, 0, 'url(#wg)', '#e2b23c'));
  o += `<path d="M452,214 C466,196 498,196 512,212" stroke="#f0d890" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  o += `<path d="M512,224 C540,222 560,236 568,252 C548,256 526,254 508,250 Z" fill="#f2b84b"/><path d="M508,250 C530,256 552,258 568,252 C550,266 526,264 508,256 Z" fill="#c98a30"/>`;
  o += `<path d="M518,229 C540,228 556,238 562,248" stroke="#ffe29a" stroke-width="2.5" fill="none" opacity=".7" stroke-linecap="round"/>`;
  o += `<circle cx="534" cy="236" r="2.2" fill="#6a4010"/>`;
  o += eye(494, 224, 9, '#e0a028', '#140e08');
  o += `<path d="M482,214 Q494,206 508,212" stroke="#3a2c1c" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  wrapSvg('avialan', svg(defs, o), 'An early beaked bird like Confuciusornis perched on a branch with two long ribbon tail feathers');
})();

// =====================================================================
// NEORNITHINE (tinamou-like ground bird)
// =====================================================================
(() => {
  const B = 'M200,360 C190,280 260,215 360,210 C440,206 500,240 520,300 C535,350 500,420 420,448 C330,470 215,450 200,360 Z';
  const defs = lg('back', [[0, '#c89a5c'], [.5, '#97693a'], [1, '#5e3e28']], .1, 0, .7, 1) +
    lg('bel', [[0, '#f3dfb4'], [1, '#c8a574']], 0, 0, 0, 1) +
    lg('leg', [[0, '#e0b45a'], [1, '#a8782e']], 0, 0, 1, 0) +
    lg('wg', [[0, '#9a6a3a'], [1, '#573a24']], 0, 0, 1, 1) +
    lg('hd', [[0, '#7a5a3e'], [1, '#3e2c20']], 0, 0, 1, 1) + soft('soft', 8) +
    `<clipPath id="bc"><path d="${B}"/></clipPath>`;
  let o = shadow(400, 560, 220, 16);
  // short rump feathers
  [[168, 90], [180, 100], [192, 86]].forEach(([a, l]) => o += feat(226, 330, a, l, 22, 8, 'url(#wg)', '#e0b878'));
  // far leg
  const leg = (x, sh) => {
    const c = sh ? '#a8782e' : 'url(#leg)', t = sh ? '#8e6224' : '#d8a848', cl = '#3a2a1c';
    let s = `<path d="M${x},440 L${x + 6},536" stroke="${c}" stroke-width="16" stroke-linecap="round"/>`;
    for (let y = 456; y < 530; y += 10) s += `<path d="M${x - 6},${y} Q${x + 3},${y + 6} ${x + 12},${y}" stroke="#7a5420" stroke-width="2" fill="none" opacity=".6"/>`;
    s += toe(x + 6, 538, 46, 6, 10, t, cl) + toe(x + 6, 538, 38, 18, 10, t, cl) + toe(x + 6, 538, 36, -8, 9, t, cl) + toe(x + 6, 538, -26, 8, 9, t, cl);
    return s;
  };
  o += leg(372, true) + leg(440, false);
  // neck + body
  o += `<path d="M470,290 C490,260 500,230 520,200 L580,224 C566,256 560,300 530,340 Z" fill="url(#back)"/>`;
  o += `<path d="${B}" fill="url(#back)"/>`;
  o += `<g clip-path="url(#bc)">`;
  o += `<path d="M300,448 C360,360 450,320 560,330 L560,480 L260,480 Z" fill="url(#bel)"/>`;
  o += `<ellipse cx="400" cy="214" rx="150" ry="16" fill="#f0c890" opacity=".5" filter="url(#soft)"/>`;
  const r = L.rng(11);
  for (let i = 0; i < 80; i++) { const x = 210 + r() * 320, y = 230 + r() * 210; o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(3 + r() * 5)}" ry="${f(2 + r() * 3)}" fill="${r() > .5 ? '#f6e4bc' : '#3a2616'}" opacity=".55" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`; }
  o += `<path d="M232,330 C300,360 380,376 470,350" stroke="#3a2616" stroke-width="4" fill="none" opacity=".25"/>`;
  o += `</g>`;
  o += `<path d="M236,270 C290,226 400,208 470,232" stroke="#f0c890" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  // wing
  const Wn = 'M260,290 C330,250 450,270 480,340 C470,392 380,410 300,390 C250,376 230,330 260,290 Z';
  o += `<path d="${Wn}" fill="url(#wg)"/><clipPath id="wc"><path d="${Wn}"/></clipPath><g clip-path="url(#wc)">`;
  for (let rr = 0; rr < 4; rr++) for (let c = 0; c < 7; c++) {
    const x = 266 + c * 30 + (rr % 2) * 15, y = 286 + rr * 24;
    o += `<path d="M${x - 14},${y - 18} L${x + 14},${y - 18} L${x + 14},${y} C${x + 14},${y + 12} ${x + 5},${y + 18} ${x},${y + 22} C${x - 5},${y + 18} ${x - 14},${y + 12} ${x - 14},${y} Z" fill="${['#b27c46', '#a67040', '#9a6638', '#8e5c32'][rr]}" stroke="#3a2418" stroke-opacity=".4" stroke-width="2"/><path d="M${x - 9},${y + 2} C${x - 9},${y + 10} ${x - 4},${y + 14} ${x},${y + 17}" stroke="#f0c890" stroke-width="2" fill="none" opacity=".6" stroke-linecap="round"/>`;
  }
  o += `</g><path d="M260,290 C330,250 450,270 480,340" stroke="#f6d8a0" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  // head
  o += `<circle cx="574" cy="204" r="36" fill="url(#hd)"/>`;
  o += `<path d="M542,184 C556,164 592,164 606,190 C590,180 560,182 542,194 Z" fill="#3a2a20"/>`;
  o += `<path d="M548,198 C568,186 598,190 610,200 L606,208 C590,198 566,200 552,210 Z" fill="#f6e4bc"/>`;
  o += `<ellipse cx="566" cy="228" rx="22" ry="12" fill="#d8c8a8" transform="rotate(10 566 228)"/>`;
  o += `<path d="M604,208 C630,208 650,220 654,234 C632,236 614,232 600,226 Z" fill="#6a5440"/><path d="M606,212 C628,212 644,222 650,232" stroke="#a89070" stroke-width="2.5" fill="none" opacity=".7" stroke-linecap="round"/>`;
  o += eye(584, 214, 8, '#8a4a1a', '#120a06');
  wrapSvg('neornithine', svg(defs, o), 'A small plump ground bird, a stand-in for the earliest modern birds');
})();

// =====================================================================
// PASSERINE (bluebird on a twig)
// =====================================================================
(() => {
  const B = 'M340,262 C356,196 476,176 504,252 C528,322 494,424 424,470 C364,486 312,426 322,344 C324,312 330,288 340,262 Z';
  const defs = lg('pb', [[0, '#5a9af0'], [.5, '#2f6fcf'], [1, '#1b3f90']], .1, 0, .8, 1) +
    lg('or', [[0, '#ffa862'], [.5, '#ee7c3a'], [1, '#c8502a']], 0, 0, 0, 1) +
    lg('wh', [[0, '#ffffff'], [1, '#cfd8ee']], 0, 0, 0, 1) +
    lg('wg', [[0, '#3a76d8'], [1, '#1a3a88']], 0, 0, 1, 1) +
    lg('br', [[0, '#8a6a44'], [1, '#4a3622']], 0, 0, 0, 1) +
    lg('lf', [[0, '#7fc06a'], [1, '#2f7a48']], 0, 0, 1, 1) + soft('soft', 8) +
    `<clipPath id="bc"><path d="${B}"/><circle cx="440" cy="186" r="52"/></clipPath>`;
  let o = '';
  // tail (behind branch)
  [[96, 190, 24], [104, 200, 24], [112, 184, 22], [120, 160, 20]].forEach(([a, l, w]) => o += feat(364, 440, a, l, w, 0, 'url(#wg)', '#9fc0ff'));
  // branch
  o += `<path d="M60,496 C220,476 420,484 600,456 L760,440 L764,468 C600,490 420,512 220,512 L56,524 Z" fill="url(#br)"/>`;
  o += `<path d="M70,494 C220,474 420,482 600,454 L756,440" stroke="#c49a66" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  o += `<path d="M130,508 l80,-4 M330,506 l70,-3 M560,490 l80,-8" stroke="#2a1c10" stroke-width="3" opacity=".4" stroke-linecap="round"/>`;
  o += `<path d="M600,458 C640,420 680,404 720,406" stroke="#6a4a2c" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  o += feat(640, 428, 300, 90, 22, 6, 'url(#lf)', '#d0f5b0') + feat(690, 408, 340, 90, 22, 0, 'url(#lf)', '#d0f5b0') + feat(210, 494, 230, 90, 20, 0, 'url(#lf)', '#d0f5b0');
  // feet: 3 forward + 1 back
  const foot = (x) => `<path d="M${x},440 L${x + 4},472" stroke="#3a3040" stroke-width="7" stroke-linecap="round"/>` +
    [0, 1, 2].map(i => `<path d="M${x + 4},474 q${22 + i * 3},${-6 + i * 3} ${32 + i * 4},${10 + i * 4}" stroke="#4a3e52" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('') +
    `<path d="M${x + 4},474 q-18,-4 -26,10" stroke="#4a3e52" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  o += foot(392) + foot(432);
  // body
  o += `<path d="${B}" fill="url(#pb)"/><circle cx="440" cy="186" r="52" fill="url(#pb)"/>`;
  o += `<g clip-path="url(#bc)">`;
  o += `<path d="M470,226 C520,290 520,400 440,480 L300,480 C380,420 420,340 392,232 Z" fill="url(#or)"/>`;
  o += `<path d="M420,400 C460,380 500,330 504,300 L560,300 L560,500 L400,500 Z" fill="url(#wh)"/>`;
  o += `<ellipse cx="470" cy="470" rx="90" ry="22" fill="#a8b8e0" opacity=".5"/>`;
  o += scal(430, 290, 3, 5, 24, 22, 9, '#ffc690', .5, 2.5);
  o += `<ellipse cx="430" cy="142" rx="44" ry="10" fill="#9ec4ff" opacity=".6" filter="url(#soft)"/>`;
  o += `</g>`;
  o += `<path d="M390,160 C400,132 450,124 480,150" stroke="#b8d8ff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  // wing
  const Wn = 'M356,262 C420,250 470,300 462,380 C452,440 410,474 372,470 C336,430 326,330 356,262 Z';
  o += `<path d="${Wn}" fill="url(#wg)"/><clipPath id="wc"><path d="${Wn}"/></clipPath><g clip-path="url(#wc)">`;
  for (let rr = 0; rr < 4; rr++) for (let c = 0; c < 4; c++) {
    const x = 366 + c * 24 + (rr % 2) * 12, y = 282 + rr * 26;
    o += `<path d="M${x - 12},${y - 16} L${x + 12},${y - 16} L${x + 12},${y} C${x + 12},${y + 10} ${x + 5},${y + 16} ${x},${y + 20} C${x - 5},${y + 16} ${x - 12},${y + 10} ${x - 12},${y} Z" fill="${rr % 2 ? '#2f66c4' : '#3a76d8'}" stroke="#12286a" stroke-opacity=".4" stroke-width="2"/>`;
  }
  for (let i = 0; i < 5; i++) o += `<path d="M${400 + i * 12},${390 + i * 8} L${384 + i * 6},468" stroke="#9fc0ff" stroke-width="2.5" opacity=".5" stroke-linecap="round"/>`;
  o += `</g><path d="M356,262 C420,250 470,300 462,380" stroke="#b8d8ff" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  // beak (open, singing)
  o += `<path d="M486,188 L538,180 L530,210 L484,198 Z" fill="#d0506a"/>`;
  o += `<path d="M484,166 C506,166 526,170 540,178 C520,186 502,188 484,188 Z" fill="#2c2a38"/>`;
  o += `<path d="M486,196 C506,198 522,204 532,212 C514,212 498,208 484,204 Z" fill="#2c2a38"/>`;
  o += `<path d="M490,170 C508,170 524,174 534,179" stroke="#7a7898" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>`;
  o += `<ellipse cx="500" cy="196" rx="8" ry="3" fill="#ff9aae" opacity=".7"/>`;
  o += eye(462, 172, 9, '#3a2012', '#0c0608');
  o += `<path d="M450,160 Q462,154 476,160" stroke="#12286a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>`;
  wrapSvg('passerine', svg(defs, o), 'A songbird perched on a twig, singing');
})();

// =====================================================================
// EGG + NEST
// =====================================================================
(() => {
  const EGG = 'M0,-82 C40,-82 64,-30 64,16 C64,58 36,82 0,82 C-36,82 -64,58 -64,16 C-64,-30 -40,-82 0,-82 Z';
  const defs = lg('egg', [[0, '#c4efe6'], [.5, '#8ed4cc'], [1, '#4aa0aa']], 0, 0, 1, 1) +
    lg('inner', [[0, '#fff8e6'], [1, '#d8c8a8']], 0, 0, 0, 1) +
    rg('chick', [[0, '#ffe58a'], [.7, '#f4b840'], [1, '#d88a28']], .4, .35, .7) +
    lg('nest', [[0, '#8a6a42'], [1, '#4a3320']], 0, 0, 0, 1) +
    lg('in', [[0, '#2a1c12'], [1, '#52382a']], 0, 0, 0, 1) + soft('soft', 7) +
    `<clipPath id="eggc"><path id="eggp" d="${EGG}"/></clipPath>`;
  const r = L.rng(5);
  const egg = (x, y, s, rot, cracked) => {
    let g = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">`;
    g += `<path d="${EGG}" fill="url(#egg)"/><g clip-path="url(#eggc)">`;
    for (let i = 0; i < 26; i++) { const px = -56 + r() * 112, py = -76 + r() * 150; g += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(2 + r() * 4)}" ry="${f(1.5 + r() * 3)}" fill="${r() > .4 ? '#7a5a48' : '#a8826a'}" opacity=".65"/>`; }
    g += `<ellipse cx="22" cy="46" rx="60" ry="46" fill="#2a6a8a" opacity=".3" filter="url(#soft)"/>`;
    g += `<ellipse cx="-24" cy="-34" rx="14" ry="26" fill="#fff" opacity=".55" filter="url(#soft)" transform="rotate(18 -24 -34)"/></g></g>`;
    return g;
  };
  let o = shadow(400, 572, 310, 20);
  // back rim of nest
  o += `<ellipse cx="400" cy="390" rx="300" ry="100" fill="#6a4c30"/><ellipse cx="400" cy="394" rx="268" ry="80" fill="url(#in)"/>`;
  // twigs on back rim
  for (let i = 0; i < 50; i++) {
    const a = Math.PI * (1 + r()), cx = 400 + Math.cos(a) * 285, cy = 390 + Math.sin(a) * 92;
    o += `<path d="M${f(cx - 30 * Math.sin(a))},${f(cy + 12)} q${f(28)},${f(-14 - r() * 10)} ${f(60 * Math.cos(a) * .3 + 50)},${f(r() * 10 - 5)}" stroke="${['#a07a4a', '#7a5a38', '#c49a64', '#5a4028'][i % 4]}" stroke-width="${f(5 + r() * 4)}" fill="none" stroke-linecap="round"/>`;
  }
  o += `<ellipse cx="400" cy="396" rx="250" ry="70" fill="url(#in)"/>`;
  // eggs
  o += egg(262, 360, 1.0, -14);
  o += egg(548, 354, .98, 14);
  o += egg(488, 412, .95, 6);
  // cracked egg + chick
  const cx = 380, cy = 360;
  o += `<g transform="translate(${cx} ${cy})">`;
  o += `<path d="M-60,-30 C-60,40 -40,70 0,72 C40,70 60,40 60,-30 Z" fill="#4a2a1a" opacity=".5"/>`;
  // chick head/body
  o += `<circle cx="0" cy="-44" r="58" fill="url(#chick)"/>`;
  for (let i = 0; i < 14; i++) {
    const a = Math.PI * (1.05 + i * .068), x = Math.cos(a) * 54, y = -44 + Math.sin(a) * 54;
    o += `<path d="M${f(x)},${f(y)} l${f(Math.cos(a) * 14 + (i % 2 ? 4 : -4))},${f(Math.sin(a) * 14)}" stroke="#ffd96a" stroke-width="6" stroke-linecap="round"/>`;
  }
  o += `<ellipse cx="-10" cy="-78" rx="30" ry="10" fill="#fff4b8" opacity=".6" filter="url(#soft)"/>`;
  [[-24, -42], [24, -42]].forEach(([x, y]) => o += eye(x, y, 10, '#1a1210', '#0a0606').replace('r="10"', 'r="11"'));
  o += `<path d="M-6,-24 L8,-24 L1,-10 Z" fill="#f08a30"/><path d="M-6,-24 L8,-24 L2,-20 Z" fill="#ffb060"/>`;
  o += `<path d="M-38,-54 Q-24,-62 -12,-54 M12,-54 Q24,-62 38,-54" stroke="#b87a20" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>`;
  // shell cup
  o += `<path d="M-66,-8 L-48,-36 L-34,-6 L-16,-40 L0,-4 L16,-42 L32,-8 L48,-36 L66,-6 C68,40 40,84 0,84 C-40,84 -68,40 -66,-8 Z" fill="url(#egg)"/>`;
  o += `<g clip-path="url(#eggc)" transform="translate(0 2) scale(1.03)">`;
  for (let i = 0; i < 18; i++) { const px = -56 + r() * 112, py = -4 + r() * 82; o += `<ellipse cx="${f(px)}" cy="${f(py)}" rx="${f(2 + r() * 4)}" ry="${f(1.5 + r() * 3)}" fill="#7a5a48" opacity=".6"/>`; }
  o += `<ellipse cx="22" cy="56" rx="60" ry="40" fill="#2a6a8a" opacity=".3" filter="url(#soft)"/></g>`;
  o += `<path d="M-66,-8 L-48,-36 L-34,-6 L-16,-40 L0,-4 L16,-42 L32,-8 L48,-36 L66,-6" stroke="#fff8e6" stroke-width="4" fill="none" stroke-linejoin="round" opacity=".9"/>`;
  o += `<path d="M-60,-8 L-46,-28 L-33,-4 L-16,-32" stroke="#d8c8a8" stroke-width="2" fill="none" opacity=".6"/>`;
  o += `<path d="M10,0 l-8,22 l10,10 l-6,22" stroke="#2a6a8a" stroke-width="2.5" fill="none" opacity=".5" stroke-linecap="round" stroke-linejoin="round"/>`;
  o += `</g>`;
  // front of nest
  const Fr = 'M96,396 C100,520 250,566 400,566 C550,566 700,520 704,396 C650,456 150,456 96,396 Z';
  o += `<path d="${Fr}" fill="url(#nest)"/><clipPath id="nf"><path d="${Fr}"/></clipPath><g clip-path="url(#nf)">`;
  for (let i = 0; i < 90; i++) {
    const x = 90 + r() * 620, y = 410 + r() * 160, l = 60 + r() * 90, a = (r() - .5) * 28 + (x < 400 ? 16 : -16) * (y - 410) / 100;
    o += `<path d="M${f(x)},${f(y)} q${f(l / 2)},${f(-6 - r() * 14)} ${f(l)},${f(r() * 12 - 6)}" stroke="${['#b88a52', '#8a6238', '#d0a468', '#5e4228', '#a07444'][i % 5]}" stroke-width="${f(5 + r() * 5)}" fill="none" stroke-linecap="round" transform="rotate(${f(a)} ${f(x)} ${f(y)})"/>`;
  }
  o += `<ellipse cx="400" cy="570" rx="320" ry="40" fill="#1a0e08" opacity=".5"/></g>`;
  o += `<path d="M96,396 C150,456 650,456 704,396" stroke="#d0a468" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>`;
  // grass blades
  o += `<path d="M110,480 C100,430 120,400 112,370 M690,480 C704,430 684,400 694,372" stroke="#7fb060" stroke-width="6" fill="none" stroke-linecap="round" opacity=".9"/>`;
  wrapSvg('egg-nest', svg(defs, o), 'A nest holding speckled eggs, one hatching with a chick peeking out');
})();

// =====================================================================
// FEATHER CLOSE-UP
// =====================================================================
(() => {
  const stops = [[0, [58, 42, 120]], [.3, [42, 95, 168]], [.6, [26, 166, 160]], [.85, [63, 208, 138]], [1, [216, 232, 106]]];
  const col = (t, k) => {
    t = Math.max(0, Math.min(1, t));
    for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) {
      const a = stops[i - 1], b = stops[i], u = (t - a[0]) / (b[0] - a[0]);
      return '#' + [0, 1, 2].map(j => Math.max(0, Math.min(255, Math.round((a[1][j] + (b[1][j] - a[1][j]) * u) * k))).toString(16).padStart(2, '0')).join('');
    }
  };
  const P0 = [120, 546], C = [300, 262], P2 = [660, 70];
  const P = t => [(1 - t) * (1 - t) * P0[0] + 2 * (1 - t) * t * C[0] + t * t * P2[0], (1 - t) * (1 - t) * P0[1] + 2 * (1 - t) * t * C[1] + t * t * P2[1]];
  const T = t => { const dx = 2 * (1 - t) * (C[0] - P0[0]) + 2 * t * (P2[0] - C[0]), dy = 2 * (1 - t) * (C[1] - P0[1]) + 2 * t * (P2[1] - C[1]); const l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
  const Wd = t => { const u = (t - .16) / .84; if (u <= 0 || u >= 1) return 0; return 92 * Math.pow(Math.sin(Math.PI * Math.pow(u, .78)), .62); };
  const side = (t, s) => { const p = P(t), tg = T(t), n = [tg[1] * s, -tg[0] * s]; const w = Wd(t) * (s > 0 ? 1 : .86); return [p[0] + n[0] * w, p[1] + n[1] * w]; };
  const outline = s => { const a = []; for (let i = 0; i <= 60; i++) { const t = .16 + i * .84 / 60; a.push(side(t, s).map(f).join(',')); } return a; };
  const poly = 'M' + outline(1).join(' L') + ' L' + outline(-1).reverse().join(' L') + ' Z';
  const defs = lg('vane', [[0, '#3a2a78'], [.3, '#2a5fa8'], [.6, '#1aa6a0'], [.85, '#3fd08a'], [1, '#d8e86a']], .1, .95, .9, .05) +
    lg('dn', [[0, '#ffb066'], [1, '#ff6a7a']], 0, 0, 1, 1) +
    lg('lens', [[0, '#1a1f4a'], [1, '#2a4a8a']], 0, 0, 1, 1) + soft('soft', 10) +
    `<clipPath id="vc"><path d="${poly}"/></clipPath><clipPath id="lc"><circle cx="160" cy="170" r="110"/></clipPath>`;
  let o = shadow(400, 584, 250, 10).replace('opacity=".35"', 'opacity=".2"');
  // vane fill + barbs
  o += `<path d="${poly}" fill="url(#vane)"/>`;
  o += `<g clip-path="url(#vc)">`;
  const r = L.rng(3);
  let gl = '', gd = '';
  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i < 74; i++) {
      const t = .16 + i * .84 / 74 + (s > 0 ? 0 : .004);
      if (s > 0 && t > .5 && t < .56) continue; // a split in the vane
      const p = P(t), tg = T(t), n = [tg[1] * s, -tg[0] * s], w = Wd(t) * (s > 0 ? 1 : .86);
      const t2 = Math.min(.999, t + w * .0012), e = side(t2, s);
      const m = [(p[0] + e[0]) / 2 + tg[0] * 8, (p[1] + e[1]) / 2 + tg[1] * 8];
      const d = `M${f(p[0])},${f(p[1])} Q${f(m[0])},${f(m[1])} ${f(e[0])},${f(e[1])}`;
      if (i % 2) gl += `<path d="${d}" stroke="${col(t, 1.22)}"/>`; else gd += `<path d="${d}" stroke="${col(t, .72)}"/>`;
    }
  }
  o += `<g stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".55">${gd}</g><g stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".5">${gl}</g>`;
  // soft light band down the vane
  o += `<path d="M${f(P(.2)[0] + 18)},${f(P(.2)[1] - 8)} Q${f(C[0] + 30)},${f(C[1] - 10)} ${f(P2[0] - 40)},${f(P2[1] + 40)}" stroke="#ffffff" stroke-width="26" fill="none" opacity=".16" filter="url(#soft)"/>`;
  o += `</g>`;
  // split: dark gap lines
  const sp = P(.53), st = T(.53);
  o += `<path d="M${f(sp[0] + st[1] * 4)},${f(sp[1] - st[0] * 4)} L${f(sp[0] + st[1] * 58 + st[0] * 14)},${f(sp[1] - st[0] * 58 + st[1] * 14)}" stroke="#1a1f4a" stroke-width="3" opacity=".45" stroke-linecap="round"/>`;
  // rim outline highlight
  o += `<path d="M${outline(1).join(' L')}" stroke="#d6f5ff" stroke-width="2.5" fill="none" opacity=".5"/>`;
  // quill / calamus + shaft
  o += `<path d="M${P0[0]},${P0[1]} Q${C[0]},${C[1]} ${P2[0]},${P2[1]}" stroke="#7a6240" stroke-width="12" fill="none" stroke-linecap="round"/>`;
  o += `<path d="M${P(.17)[0]},${P(.17)[1]} Q${f(C[0] + 60)},${f(C[1] - 30)} ${f(P(.99)[0])},${f(P(.99)[1])}" stroke="#f4ecd0" stroke-width="5" fill="none" stroke-linecap="round" opacity=".95"/>`;
  o += `<path d="M${P0[0]},${P0[1]} Q${C[0] - 20},${C[1] + 20} ${P(.2)[0] - 20},${P(.2)[1] + 10}" stroke="#e8d8a8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  o += `<ellipse cx="${P0[0]}" cy="${P0[1]}" rx="9" ry="6" fill="#3a2a18" transform="rotate(-60 ${P0[0]} ${P0[1]})"/>`;
  // fluffy lower barbs near base (afterfeather style)
  for (let i = 0; i < 14; i++) {
    const t = .08 + i * .012, p = P(t), s = i % 2 ? 1 : -1, tg = T(t);
    o += `<path d="M${f(p[0])},${f(p[1])} q${f(tg[1] * s * 24)},${f(-tg[0] * s * 24 - 8)} ${f(tg[1] * s * 36 + tg[0] * 14)},${f(-tg[0] * s * 36 + tg[1] * 14)}" stroke="${col(.02 + i * .01, 1.4)}" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>`;
  }
  // magnified lens: barbs + barbules
  o += `<circle cx="160" cy="170" r="114" fill="#0c1038" opacity=".25"/>`;
  o += `<circle cx="160" cy="170" r="110" fill="url(#lens)"/><g clip-path="url(#lc)">`;
  for (let i = -3; i <= 3; i++) {
    const cx = 160 + i * 52, w = 14;
    o += `<g transform="rotate(-28 160 170)"><rect x="${cx - w / 2}" y="40" width="${w}" height="260" rx="7" fill="${col(.35 + i * .06, 1.05)}"/><rect x="${cx - 4}" y="40" width="3" height="260" fill="#fff" opacity=".3"/>`;
    for (let y = 52; y < 300; y += 11) o += `<path d="M${cx + w / 2},${y} l22,${f(6)} M${cx - w / 2},${y} l-22,${f(6)}" stroke="${col(.4 + i * .06, 1.3)}" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>`;
    for (let y = 56; y < 300; y += 22) o += `<path d="M${cx + w / 2 + 20},${y + 6} l4,5 M${cx - w / 2 - 20},${y + 6} l-4,5" stroke="#fff" stroke-width="1.6" opacity=".6" stroke-linecap="round"/>`;
    o += `</g>`;
  }
  o += `</g><circle cx="160" cy="170" r="110" fill="none" stroke="#e8f4ff" stroke-width="5"/>`;
  o += `<path d="M90,100 A110,110 0 0 1 170,62" stroke="#fff" stroke-width="4" fill="none" opacity=".4" stroke-linecap="round"/>`;
  // connector to the feather
  const lp = P(.6), ls = side(.6, 1);
  o += `<path d="M232,254 L${f(ls[0] - 20)},${f(ls[1] + 20)}" stroke="#e8f4ff" stroke-width="3" opacity=".7" stroke-dasharray="6 6" stroke-linecap="round"/>`;
  o += `<circle cx="${f(ls[0] - 20)}" cy="${f(ls[1] + 20)}" r="8" fill="none" stroke="#e8f4ff" stroke-width="3" opacity=".8"/>`;
  // down feather
  const dc = [640, 470];
  o += `<ellipse cx="${dc[0]}" cy="${dc[1]}" rx="90" ry="70" fill="#ffb27a" opacity=".25" filter="url(#soft)"/>`;
  o += `<path d="M${dc[0] + 4},560 Q${dc[0] - 6},520 ${dc[0]},${dc[1] + 6}" stroke="#d8b880" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  const r2 = L.rng(9);
  for (let i = 0; i < 52; i++) {
    const a = (-200 + i * (220 / 52) + (r2() - .5) * 8) * Math.PI / 180, l = 56 + r2() * 56, cu = (r2() - .5) * 60;
    const ex = dc[0] + Math.cos(a) * l, ey = dc[1] + Math.sin(a) * l + 14, mx = dc[0] + Math.cos(a) * l * .5 + Math.cos(a + 1.57) * cu, my = dc[1] + Math.sin(a) * l * .5 + Math.sin(a + 1.57) * cu;
    o += `<path d="M${dc[0]},${dc[1] + 6} Q${f(mx)},${f(my)} ${f(ex)},${f(ey)}" stroke="${i % 3 ? '#ff9a5e' : (i % 2 ? '#ffd0a0' : '#ff6a7a')}" stroke-width="${f(2.2 + r2() * 1.6)}" fill="none" stroke-linecap="round" opacity="${f(.55 + r2() * .4)}"/>`;
  }
  wrapSvg('feather-closeup', svg(defs, o), 'A close-up of a large flight feather showing the shaft, barbs and a magnified look at barbules, beside a small downy feather');
})();

L.writeFile('birds', art);
