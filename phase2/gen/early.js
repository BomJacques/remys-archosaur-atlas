// Phase-2 art, group "early": amniote, synapsid, dimetrodon, cynodont, mammal, cat, human
const fs = require('fs'), path = require('path');
const L = require('../lib');
const f = L.f;

// ---------- helpers ----------
const lg = (id, x1, y1, x2, y2, stops) => `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</linearGradient>`;
const rg = (id, cx, cy, r, stops) => `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</radialGradient>`;
const SOFT = (sd = 8) => `<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
const shadow = (cx, cy, rx, ry, op = .35) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#1a1230" opacity="${op}"/>`;
// many short strokes in ONE path; fn(rnd) -> [x,y,dx,dy]
function strokes(rnd, n, box, len, ang, jitter, color, w, op) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = box[0] + rnd() * (box[2] - box[0]), y = box[1] + rnd() * (box[3] - box[1]);
    const a = (ang + (rnd() - .5) * jitter) * Math.PI / 180, l = len * (.6 + rnd() * .6);
    d += `M${f(x)},${f(y)}l${f(Math.cos(a) * l)},${f(Math.sin(a) * l)}`;
  }
  return `<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${op}"/>`;
}
function arcs(rnd, n, box, s, color, w, op) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = box[0] + rnd() * (box[2] - box[0]), y = box[1] + rnd() * (box[3] - box[1]);
    d += `M${f(x - s)},${f(y)}Q${f(x)},${f(y + s * .9)} ${f(x + s)},${f(y)}`;
  }
  return `<path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${op}"/>`;
}
// stroked limb (round joints). pts = [[x,y],...], ws = widths per segment
function limb(pts, ws, fill, hi, hiOp = .5) {
  let s = '';
  for (let i = 0; i < pts.length - 1; i++) s += `<path d="M${pts[i]}L${pts[i + 1]}" stroke="${fill}" stroke-width="${ws[i]}" stroke-linecap="round" fill="none"/>`;
  if (hi) for (let i = 0; i < pts.length - 1; i++) s += `<path d="M${pts[i][0] - ws[i] * .18},${pts[i][1] - ws[i] * .18}L${pts[i + 1][0] - ws[i] * .18},${pts[i + 1][1] - ws[i] * .18}" stroke="${hi}" stroke-width="${ws[i] * .22}" stroke-linecap="round" fill="none" opacity="${hiOp}"/>`;
  return s;
}
// foot with n toes fanning right, claws
function foot(x, y, n, len, w, toe, claw, a0 = -32, a1 = 26) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (a0 + (a1 - a0) * (n === 1 ? .5 : i / (n - 1))) * Math.PI / 180;
    const l = len * (1 - Math.abs(i - (n - 1) / 2) * .08);
    const ex = x + Math.cos(a) * l, ey = y + Math.sin(a) * l;
    s += `<path d="M${f(x)},${f(y)}L${f(ex)},${f(ey)}" stroke="${toe}" stroke-width="${w}" stroke-linecap="round"/>`;
    s += `<path d="M${f(ex + Math.cos(a) * w * .35)},${f(ey + Math.sin(a) * w * .35 - w * .3)}l${f(Math.cos(a) * w * .9 + 1)},${f(Math.sin(a) * w * .9 + w * .45)}l${f(-w * .2)},${f(-w * .85)}z" fill="${claw}"/>`;
  }
  return s;
}
const eye = (cx, cy, r, iris, pupil = '#1d1730') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${iris}"/><circle cx="${f(cx + r * .12)}" cy="${cy}" r="${f(r * .62)}" fill="${pupil}"/><circle cx="${f(cx + r * .38)}" cy="${f(cy - r * .38)}" r="${f(r * .3)}" fill="#fff"/>`;
const star = (x, y, r, c = '#fff', op = .8) => `<path d="M${x},${y - r}Q${x},${y} ${x + r},${y}Q${x},${y} ${x},${y + r}Q${x},${y} ${x - r},${y}Q${x},${y} ${x},${y - r}z" fill="${c}" opacity="${op}"/>`;

const art = {};
const sheetItems = [];
function put(id, label, inner) { art[id] = L.wrap(id, inner, { label }); sheetItems.push(id); }

// =====================================================================
// DIMETRODON  (hero piece)
// =====================================================================
function dimetrodon() {
  const r = L.rng(11);
  const BODY = 'M258,328 C335,296 470,288 565,306 C600,308 625,292 645,278 C670,262 715,262 745,284 C768,298 784,310 782,322 L700,326 L650,332 C628,372 600,415 540,428 C450,444 340,442 262,414 C200,412 110,440 48,490 C100,410 180,348 258,328 Z';
  let s = `<defs>
${lg('body', 0, 0, 0.15, 1, [[0, '#F08A3E'], [.45, '#CB5A2F'], [1, '#8B3544']])}
${lg('belly', 0, 0, 0, 1, [[0, '#F7D295'], [1, '#E3A474']])}
${lg('sail', 0, 1, 0, 0, [[0, '#9E2F45'], [.4, '#DF5A3A'], [.8, '#FF9A47'], [1, '#FFD36A']])}
${lg('farB', 0, 0, 0, 1, [[0, '#B4492F'], [1, '#6F2B46']])}
<clipPath id="bc"><path id="bs" d="${BODY}"/></clipPath>
${SOFT(10)}</defs>`;
  s += shadow(400, 524, 300, 20, .36);
  // far legs (darker) + tail underside
  const far = '#8F3A38', farH = '#B2553F';
  s += limb([[585, 390], [628, 452], [604, 500]], [36, 28], far, farH, .4) + foot(606, 508, 5, 34, 11, far, '#3b1b2a');
  s += limb([[335, 392], [405, 450], [386, 500]], [38, 28], far, farH, .4) + foot(388, 508, 5, 34, 11, far, '#3b1b2a');
  // ---- sail
  const N = 11, tips = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1), h = 52 + 168 * Math.pow(Math.sin(Math.PI * (.04 + .92 * t)), .85);
    tips.push([f(322 + i * 24 + (i - 5) * 2.2), f(304 - h)]);
  }
  let mem = `M312,312 L${tips[0]}`;
  for (let i = 0; i < N - 1; i++) { const a = tips[i], b = tips[i + 1]; mem += ` Q${f((a[0] + b[0]) / 2)},${f(Math.max(a[1], b[1]) + 22)} ${b}`; }
  mem += ` L566,312 Z`;
  s += `<clipPath id="sc"><path d="${mem}"/></clipPath>`;
  s += `<path d="${mem}" fill="url(#sail)"/>`;
  s += `<g clip-path="url(#sc)">`;
  // translucent banding + glow + veins
  s += `<path d="M300,250 Q440,215 590,250 L590,270 Q440,236 300,270Z M300,200 Q440,160 590,200 L590,215 Q440,176 300,215Z" fill="#B8323C" opacity=".22"/>`;
  s += `<ellipse cx="440" cy="130" rx="95" ry="36" fill="#FFF1A8" opacity=".5" filter="url(#soft)"/>`;
  let veins = '';
  tips.forEach((t, i) => {
    const bx = 322 + i * 24, dx = t[0] - bx, dy = t[1] - 306;
    [.35, .6].forEach((k, j) => { const x = bx + dx * k, y = 306 + dy * k; veins += `M${f(x)},${f(y)}q${f(10 - j * 2)},${f(-14)} ${f(18)},${f(-30 - j * 14)}M${f(x)},${f(y)}q${f(-9)},${f(-12)} ${f(-14)},${f(-26 - j * 12)}`; });
  });
  s += `<path d="${veins}" stroke="#7a2236" stroke-width="2" fill="none" opacity=".35" stroke-linecap="round"/>`;
  s += `</g>`;
  // spines
  let sp = '', spH = '';
  tips.forEach((t, i) => { const bx = 322 + i * 24; sp += `M${bx},312L${t[0]},${t[1] + 3}`; spH += `M${bx - 1.5},312L${t[0] - 1.5},${t[1] + 5}`; });
  s += `<path d="${sp}" stroke="#8C2F3F" stroke-width="6" stroke-linecap="round" fill="none"/>`;
  s += `<path d="${spH}" stroke="#F58A55" stroke-width="2" stroke-linecap="round" fill="none" opacity=".55"/>`;
  tips.forEach(t => { s += `<circle cx="${t[0]}" cy="${t[1] + 2}" r="4.2" fill="#FFB35A"/>`; });
  s += `<path d="${mem.replace(/M312,312 L/, 'M').replace(/ L566,312 Z/, '')}" stroke="#FFE59A" stroke-width="3" fill="none" opacity=".65" stroke-linecap="round" stroke-linejoin="round"/>`;
  // ---- tail (separate lighter bottom shading is in body clip)
  // ---- body
  s += `<use href="#bs" fill="url(#body)"/><g clip-path="url(#bc)">`;
  s += `<ellipse cx="400" cy="452" rx="260" ry="48" fill="url(#belly)" opacity=".95"/>`;
  s += `<path d="M30,490 C110,450 200,438 262,442 C340,452 450,452 540,444 L560,520 L30,520Z" fill="#7a2a4c" opacity=".35"/>`;
  s += `<ellipse cx="450" cy="300" rx="200" ry="26" fill="#FFB067" opacity=".55" filter="url(#soft)"/>`;
  let bands = '';
  for (let i = 0; i < 9; i++) { const x = 290 + i * 34; bands += `M${x},290q${i % 2 ? 14 : 8},${50} ${i % 2 ? -4 : 6},${96}`; }
  for (let i = 0; i < 5; i++) { const x = 90 + i * 34; bands += `M${x + 56},${430 - i * 22}q14,-20 6,-40`; }
  s += `<path d="${bands}" stroke="#6f2540" stroke-width="13" fill="none" stroke-linecap="round" opacity=".28"/>`;
  s += arcs(r, 85, [60, 296, 600, 420], 7, '#FFB06A', 2.4, .55);
  s += arcs(r, 40, [270, 424, 560, 446], 6, '#fff4d0', 2, .5);
  s += `</g>`;
  s += `<path d="M258,328 C335,296 470,288 565,306 C600,308 625,292 645,278" stroke="#FFC27A" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8"/>`;
  s += `<path d="M262,414 C340,442 450,444 540,428" stroke="#3d1a36" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>`;
  // ---- near legs
  const near = '#D2652F', nearH = '#FFA25E';
  s += limb([[548, 378], [498, 452], [548, 504]], [46, 31], near, nearH, .55);
  s += `<ellipse cx="545" cy="378" rx="44" ry="50" fill="#D2652F"/><ellipse cx="540" cy="366" rx="30" ry="30" fill="#F08A3E" opacity=".6" filter="url(#soft)"/>`;
  s += foot(552, 512, 5, 40, 13, '#E07A3A', '#3b1b2a');
  s += limb([[286, 384], [352, 458], [298, 506]], [50, 33], near, nearH, .55);
  s += foot(302, 512, 5, 40, 13, '#E07A3A', '#3b1b2a');
  s += `<ellipse cx="288" cy="378" rx="52" ry="54" fill="#D2652F"/><ellipse cx="284" cy="364" rx="34" ry="30" fill="#F08A3E" opacity=".6" filter="url(#soft)"/>`;
  s += `<path d="M262,420 q30,24 66,10" stroke="#7a2a4c" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>`;
  s += arcs(r, 14, [486, 398, 534, 460], 5, '#FFB06A', 2, .5) + arcs(r, 14, [300, 404, 350, 460], 5, '#FFB06A', 2, .5);
  // ---- head
  s += `<path d="M655,322 L783,323 L774,337 L655,354Z" fill="#59182f"/>`;               // mouth interior
  s += `<path d="M744,326 q1,-14 9,-12 l-2,16z" fill="#E96A8C" opacity=".8"/>`;            // tongue hint
  s += `<path d="M648,282 C672,262 718,262 746,284 C768,298 784,310 782,322 L700,328 L650,332Z" fill="url(#body)"/>`;
  s += `<path d="M648,282 C672,262 718,262 746,284 C768,298 784,310 782,322" stroke="#FFC27A" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/>`;
  s += `<path d="M778,336 C735,356 690,362 650,358 C638,342 650,334 660,332 L776,330Z" fill="#C2532F"/>`;
  s += `<path d="M652,358 C690,364 735,358 778,338" stroke="#FFC27A" stroke-width="2.5" fill="none" opacity=".55"/>`;
  s += `<path d="M660,352 C700,360 740,352 770,340 L774,336 C735,352 690,356 660,346Z" fill="#F7D295" opacity=".8"/>`;
  s += `<ellipse cx="672" cy="300" rx="20" ry="13" fill="#7a2a4c" opacity=".35"/>`;
  // two kinds of teeth: incisors, big canine, small cheek teeth
  s += `<path d="M770,323 l-4,12 l-4,-12z M760,324 l-3,11 l-4,-11z M750,324 l-3,10 l-3,-10z" fill="#FFF6DC"/>`;
  s += `<path d="M722,324 l8,26 l8,-26z" fill="#FFFDF0"/><path d="M728,326 l3,18" stroke="#E7D3A8" stroke-width="2"/>`;
  s += `<path d="M706,326 l-3,8 l-4,-8z M692,327 l-3,8 l-4,-8z M679,328 l-3,8 l-4,-8z M667,329 l-3,8 l-4,-8z" fill="#FFF6DC"/>`;
  s += `<path d="M764,338 l-3,-9 l-4,9z M744,340 l-3,-9 l-4,9z M700,350 l-3,-8 l-4,8z M686,352 l-3,-8 l-4,8z M673,353 l-3,-7 l-4,7z" fill="#FFF6DC" opacity=".95"/>`;
  s += `<path d="M656,330 C700,334 745,328 780,324" stroke="#7a2236" stroke-width="2.5" fill="none" opacity=".7"/>`;
  s += `<ellipse cx="764" cy="296" rx="5" ry="3.4" fill="#5a1d36" transform="rotate(20 764 296)"/>`;
  s += `<path d="M692,278 Q708,266 726,276" stroke="#8E2F3E" stroke-width="7" fill="none" stroke-linecap="round" opacity=".6"/>`;
  s += `<circle cx="708" cy="290" r="13" fill="#FFC247"/><circle cx="710" cy="290" r="7.5" fill="#1a1630"/><circle cx="713" cy="286.5" r="3" fill="#fff"/>`;
  s += `<path d="M694,284 Q708,274 724,284" stroke="#6f2540" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".8"/>`;
  s += arcs(r, 14, [660, 266, 720, 300], 4, '#FFB06A', 1.8, .5);
  return s;
}
put('dimetrodon', 'Dimetrodon, a sail-backed synapsid, not a dinosaur', dimetrodon());

// =====================================================================
// SYNAPSID (Haptodus-like)
// =====================================================================
function synapsid() {
  const r = L.rng(23);
  const BODY = 'M250,330 C320,300 440,294 540,312 C570,316 590,306 610,296 C640,280 690,282 718,302 C740,314 752,324 750,334 L690,338 L630,344 C612,380 590,416 530,428 C450,440 350,438 262,416 C200,420 110,430 48,470 C90,400 170,350 250,330Z';
  let s = `<defs>
${lg('body', 0, 0, 0.1, 1, [[0, '#E4A857'], [.5, '#BF7A3E'], [1, '#7C4A52']])}
${lg('belly', 0, 0, 0, 1, [[0, '#F9E0A8'], [1, '#E7B986']])}
<clipPath id="bc"><path id="bs" d="${BODY}"/></clipPath>${SOFT(9)}</defs>`;
  s += shadow(395, 526, 290, 18, .36);
  const far = '#8E5A44', farH = '#B87D55';
  s += limb([[560, 392], [600, 454], [578, 504]], [30, 22], far, farH, .4) + foot(580, 512, 5, 30, 9, far, '#33222c');
  s += limb([[330, 392], [392, 448], [372, 502]], [32, 23], far, farH, .4) + foot(374, 512, 5, 30, 9, far, '#33222c');
  s += `<use href="#bs" fill="url(#body)"/><g clip-path="url(#bc)">`;
  s += `<ellipse cx="390" cy="436" rx="270" ry="42" fill="url(#belly)"/>`;
  s += `<path d="M30,480 C110,440 200,430 262,436 C340,448 450,446 540,436 L560,520 L30,520Z" fill="#6c3a56" opacity=".3"/>`;
  s += `<ellipse cx="430" cy="302" rx="200" ry="22" fill="#FFD389" opacity=".6" filter="url(#soft)"/>`;
  let b = '';
  for (let i = 0; i < 11; i++) { const x = 270 + i * 28; b += `M${x},294q${i % 2 ? 10 : 4},44 ${i % 2 ? -4 : 5},86`; }
  for (let i = 0; i < 6; i++) b += `M${86 + i * 28},${444 - i * 20}q12,-18 4,-34`;
  s += `<path d="${b}" stroke="#5a3042" stroke-width="10" fill="none" stroke-linecap="round" opacity=".38"/>`;
  s += arcs(r, 80, [50, 300, 620, 430], 6, '#FFD08A', 2.2, .5);
  s += `</g>`;
  s += `<path d="M250,330 C320,300 440,294 540,312 C570,316 590,306 610,296" stroke="#FFE2A0" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".85"/>`;
  // low dorsal ridge of neural spines
  let ridge = ''; for (let i = 0; i < 10; i++) { const x = 330 + i * 20; ridge += `M${x},${309 - Math.sin(i / 9 * Math.PI) * 2}l2,-10`; }
  s += `<path d="${ridge}" stroke="#9A5A3C" stroke-width="5" stroke-linecap="round"/>`;
  const near = '#CB8445', nearH = '#FFD08A';
  s += limb([[540, 380], [498, 450], [545, 502]], [38, 26], near, nearH, .55);
  s += foot(548, 512, 5, 34, 11, '#DA9650', '#33222c');
  s += limb([[282, 386], [346, 456], [296, 504]], [40, 27], near, nearH, .55);
  s += foot(300, 512, 5, 34, 11, '#DA9650', '#33222c');
  s += `<ellipse cx="536" cy="378" rx="38" ry="44" fill="#CB8445"/><ellipse cx="530" cy="366" rx="26" ry="26" fill="#FFD08A" opacity=".5" filter="url(#soft)"/>`;
  s += `<ellipse cx="288" cy="382" rx="44" ry="46" fill="#CB8445"/><ellipse cx="282" cy="368" rx="28" ry="26" fill="#FFD08A" opacity=".5" filter="url(#soft)"/>`;
  s += `<path d="M262,420 q26,20 56,8" stroke="#6c3a56" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>`;
  // dragonfly
  s += `<g transform="translate(640 150) rotate(-12)"><path d="M0,0 Q-40,-34 -78,-18 Q-40,-6 0,0Z M0,0 Q-30,-6 -70,16 Q-34,16 0,0Z" fill="#9FE6F0" opacity=".6"/><path d="M-6,0 Q-46,-30 -72,-16 M-6,2 Q-34,2 -64,14" stroke="#3FA6B8" stroke-width="1.6" fill="none" opacity=".7"/><path d="M0,0 Q18,-24 56,-20 Q18,-12 0,0Z M0,0 Q22,-2 52,16 Q18,14 0,0Z" fill="#9FE6F0" opacity=".6"/><path d="M-62,2 L-8,2 L20,0" stroke="#2f8f83" stroke-width="5" stroke-linecap="round"/><circle cx="24" cy="0" r="7" fill="#2f8f83"/><circle cx="27" cy="-2" r="2.6" fill="#FFE27A"/></g>`;
  // head
  s += `<path d="M632,338 L752,336 L742,348 L632,360Z" fill="#5a2038"/>`;
  s += `<path d="M626,298 C650,280 692,282 718,302 C740,314 752,324 750,334 L690,338 L630,344Z" fill="url(#body)"/>`;
  s += `<path d="M626,298 C650,280 692,282 718,302 C740,314 752,324 750,334" stroke="#FFE2A0" stroke-width="3" fill="none" opacity=".85" stroke-linecap="round"/>`;
  s += `<path d="M746,348 C710,366 665,370 632,364 C622,350 630,344 640,342 L746,342Z" fill="#B87038"/>`;
  s += `<path d="M640,360 C675,366 715,360 744,350" stroke="#F9E0A8" stroke-width="5" fill="none" opacity=".75" stroke-linecap="round"/>`;
  s += `<path d="M740,336 l-3,9 l-4,-9z M728,337 l-3,9 l-4,-9z M714,338 l-3,8 l-4,-8z M700,339 l-3,8 l-4,-8z M686,340 l-3,8 l-4,-8z" fill="#FFF6DC"/>`;
  s += `<path d="M718,338 l6,18 l6,-18z" fill="#fffdf0" opacity="0"/>`;
  s += `<path d="M634,342 C680,342 715,338 750,334" stroke="#6f2540" stroke-width="2.4" fill="none" opacity=".7"/>`;
  s += `<ellipse cx="736" cy="312" rx="4.6" ry="3" fill="#4a1c33" transform="rotate(25 736 312)"/>`;
  s += `<ellipse cx="648" cy="318" rx="16" ry="11" fill="#6c3a56" opacity=".3"/>`;
  s += `<path d="M668,298 Q682,288 698,296" stroke="#7a3a3c" stroke-width="6" fill="none" stroke-linecap="round" opacity=".55"/>`;
  s += eye(682, 308, 12, '#FFC247');
  s += `<path d="M668,303 Q682,294 697,303" stroke="#5a3042" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".8"/>`;
  return s;
}
put('synapsid', 'A Haptodus-like early synapsid', synapsid());

// =====================================================================
// AMNIOTE (Hylonomus-like, with the amniotic egg)
// =====================================================================
function amniote() {
  const r = L.rng(37);
  const G = 452;
  const BODY = 'M92,446 C150,448 230,416 290,388 C340,362 410,352 470,354 C505,356 525,350 548,344 C580,334 612,338 626,356 C634,372 628,392 612,396 C590,402 566,404 548,404 C520,410 495,414 465,416 C410,420 340,422 300,424 C240,432 150,458 92,446Z';
  let s = `<defs>
${lg('body', 0, 0, 0.1, 1, [[0, '#9CB35A'], [.5, '#6C9455'], [1, '#3E6B5A']])}
${lg('log', 0, 0, 0, 1, [[0, '#A06A3C'], [.5, '#7A4A30'], [1, '#4A2C34']])}
${lg('moss', 0, 0, 0, 1, [[0, '#9EDB6A'], [1, '#4FAE5A']])}
${lg('egg', 0.1, 0, 0.8, 1, [[0, '#FFFBEC'], [.55, '#F3E3C3'], [1, '#CBB2A6']])}
${lg('bub', 0, 0, 1, 1, [[0, '#2E5F7A'], [1, '#1F3556']])}
${rg('yolk', .35, .3, .8, [[0, '#FFE27A'], [1, '#F2A93C']])}
<clipPath id="bc"><path id="bs" d="${BODY}"/></clipPath>
<clipPath id="lc"><path d="M60,480 C60,462 84,455 130,454 L720,454 C750,454 768,468 768,498 C768,532 750,556 720,556 L130,556 C84,556 60,540 60,480Z"/></clipPath>
${SOFT(7)}</defs>`;
  // fern fronds behind
  const frond = (x, y, ang, len, c, c2) => { let d = '', e = ''; for (let i = 1; i < 9; i++) { const t = i / 9, px = len * t, py = -Math.sin(t * 2) * 10, ll = (1 - t) * 38 + 8; d += `M${f(px)},${f(py)}l${f(ll * .6)},${f(-ll)}M${f(px)},${f(py)}l${f(ll * .6)},${f(ll)}`; } return `<g transform="translate(${x} ${y}) rotate(${ang})"><path d="M0,0Q${len * .5},-14 ${len},0" stroke="${c}" stroke-width="4" fill="none"/><path d="${d}" stroke="${c2}" stroke-width="7" stroke-linecap="round" fill="none"/></g>`; };
  s += frond(110, 470, -70, 150, '#2f7a54', '#3FA066') + frond(100, 470, -35, 130, '#2f7a54', '#52B872') + frond(120, 470, -108, 120, '#2f7a54', '#2F8A5F');
  s += frond(722, 476, -112, 130, '#2f7a54', '#3FA066') + frond(730, 476, -80, 100, '#2f7a54', '#52B872');
  // ---------- log
  s += shadow(415, 560, 350, 14, .35);
  s += `<path d="M60,480 C60,462 84,455 130,454 L720,454 C750,454 768,468 768,498 C768,532 750,556 720,556 L130,556 C84,556 60,540 60,480Z" fill="url(#log)"/>`;
  s += `<g clip-path="url(#lc)">`;
  let bark = ''; for (let i = 0; i < 9; i++) { const y = 470 + i * 10; bark += `M${100 + (i * 37) % 60},${y}q60,${-6 + (i % 3) * 5} 120,0 t110,2 t140,-3 t120,4`; }
  s += `<path d="${bark}" stroke="#3a2030" stroke-width="3.5" fill="none" opacity=".38" stroke-linecap="round"/>`;
  s += `<path d="M100,462 L740,462" stroke="#E4A56A" stroke-width="5" opacity=".5" stroke-linecap="round"/>`;
  s += `<ellipse cx="400" cy="560" rx="360" ry="26" fill="#2c1a3c" opacity=".4"/>`;
  s += `</g>`;
  s += `<ellipse cx="96" cy="505" rx="40" ry="52" fill="#C58A52"/><ellipse cx="96" cy="505" rx="31" ry="42" fill="none" stroke="#8a5434" stroke-width="3"/><ellipse cx="96" cy="505" rx="20" ry="28" fill="none" stroke="#8a5434" stroke-width="3"/><ellipse cx="96" cy="505" rx="9" ry="13" fill="#9c6238"/>`;
  // moss along the top
  let moss = 'M120,462';
  for (let x = 120; x < 750; x += 38) moss += ` q${19},${-26 - ((x * 7) % 11)} ${38},0`;
  moss += ' L755,474 Q500,486 120,476Z';
  s += `<path d="${moss}" fill="url(#moss)"/>`;
  s += `<path d="M120,466 q60,-16 120,-4 t130,0 t140,2 t120,-4" stroke="#E3FF9A" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  s += arcs(r, 30, [130, 450, 750, 470], 6, '#C9F78A', 2, .6);
  // little mushrooms
  s += `<path d="M220,452 q2,-16 2,-16" stroke="#F3E3C3" stroke-width="5"/><path d="M206,438 q16,-22 32,0z" fill="#E4573C"/><circle cx="216" cy="432" r="2.5" fill="#fff"/><circle cx="226" cy="436" r="2" fill="#fff"/>`;
  // ---------- lizard (far legs)
  const far = '#4F7C52', farH = '#7FA860';
  s += limb([[536, 408], [560, 440], [576, G - 4]], [18, 14], far, farH, .4) + foot(576, G - 2, 5, 15, 5, far, '#2a2a30');
  s += limb([[372, 408], [394, 442], [412, G - 4]], [20, 15], far, farH, .4) + foot(412, G - 2, 5, 16, 5, far, '#2a2a30');
  s += `<use href="#bs" fill="url(#body)"/><g clip-path="url(#bc)">`;
  s += `<path d="M80,452 C200,432 330,430 470,420 C520,414 560,408 640,398 L640,440 L80,470Z" fill="#E9E3A8"/>`;
  s += `<path d="M80,452 C200,432 330,430 470,420 L470,440 L80,470Z" fill="#3a2a58" opacity=".18"/>`;
  s += `<ellipse cx="440" cy="360" rx="150" ry="12" fill="#E8FF9A" opacity=".55" filter="url(#soft)"/>`;
  s += `<path d="M110,440 C200,420 300,386 400,370 C470,364 540,356 600,350" stroke="#3A5A4A" stroke-width="12" fill="none" opacity=".4" stroke-linecap="round"/>`;
  let sp = ''; for (let i = 0; i < 9; i++) { const x = 300 + i * 22; sp += `M${x},${366 - (i % 3) * 3}l8,26`; }
  s += `<path d="${sp}" stroke="#3a5a4a" stroke-width="7" opacity=".28" stroke-linecap="round"/>`;
  s += arcs(r, 90, [90, 360, 625, 420], 5, '#C9E87A', 2, .55);
  s += `</g>`;
  s += `<path d="M92,446 C150,448 230,416 290,388 C340,362 410,352 470,354 C505,356 525,350 548,344 C580,334 612,338 626,356" stroke="#E8FF9A" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/>`;
  const near = '#6C9A55', nearH = '#C9E87A';
  s += limb([[488, 400], [466, 436], [498, G - 4]], [24, 17], near, nearH, .5) + foot(500, G - 2, 5, 16, 6, '#7BA85C', '#2a2a30');
  s += limb([[318, 408], [296, 440], [330, G - 4]], [28, 19], near, nearH, .5) + foot(332, G - 2, 5, 17, 6, '#7BA85C', '#2a2a30');
  // head details
  s += `<path d="M626,384 C598,396 575,398 556,400" stroke="#2f4a3c" stroke-width="2.6" fill="none" opacity=".7" stroke-linecap="round"/>`;
  s += `<ellipse cx="620" cy="364" rx="3.4" ry="2.4" fill="#2f4a3c"/>`;
  s += `<path d="M584,354 Q598,346 612,354" stroke="#3E6B5A" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`;
  s += eye(598, 362, 8.5, '#FFC247');
  s += `<ellipse cx="556" cy="384" rx="7" ry="5" fill="#3E6B5A" opacity=".35"/>`;
  s += `<g transform="translate(40 0)">`;
  // ---------- egg
  s += `<ellipse cx="652" cy="470" rx="62" ry="14" fill="#2f5a3a" opacity=".55"/>`;
  s += `<path d="M652,336 C700,336 724,408 718,448 C714,474 690,486 652,486 C614,486 590,474 586,448 C580,408 604,336 652,336Z" fill="url(#egg)"/>`;
  s += `<path d="M602,440 C598,402 620,360 646,346" stroke="#fff" stroke-width="7" fill="none" opacity=".7" stroke-linecap="round"/>`;
  s += `<path d="M700,380 C716,420 718,456 690,478" stroke="#B7A4AE" stroke-width="7" fill="none" opacity=".45" stroke-linecap="round"/>`;
  s += `<g fill="#B58A62" opacity=".45"><circle cx="640" cy="380" r="4"/><circle cx="668" cy="410" r="5"/><circle cx="630" cy="440" r="4"/><circle cx="690" cy="452" r="3.5"/><circle cx="656" cy="364" r="3"/><circle cx="676" cy="438" r="3"/></g>`;
  // moss in front of egg
  s += `<path d="M588,478 q10,-20 20,-4 q8,-14 18,-2 q10,-12 20,0 q14,-10 24,2 q12,-16 22,0 q12,-12 22,4 L710,490 L590,490Z" fill="#6FC45A"/>`;
  // ---------- cutaway bubble (the amniotic egg idea)
  s += `<path d="M640,332 L660,262 M668,336 L690,262" stroke="#8FE3F5" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round" fill="none" opacity=".8"/>`;
  s += `<g transform="translate(660 156) scale(.9) translate(-660 -156)"><circle cx="660" cy="156" r="104" fill="url(#bub)"/><circle cx="660" cy="156" r="104" fill="none" stroke="#8FE3F5" stroke-width="5" opacity=".85"/>`;
  s += `<circle cx="660" cy="156" r="82" fill="#FFF1CF"/><circle cx="660" cy="156" r="82" fill="none" stroke="#E3C9A0" stroke-width="5"/>`;
  s += `<circle cx="660" cy="156" r="70" fill="#BFEFFF" opacity=".95"/><circle cx="660" cy="156" r="70" fill="none" stroke="#7CCBE8" stroke-width="4"/>`;
  s += `<circle cx="660" cy="190" r="36" fill="url(#yolk)"/><path d="M634,176 q6,-12 18,-14" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>`;
  s += `<path d="M632,146 C628,118 656,104 680,116 C700,126 696,146 680,148 C668,150 662,138 672,132 C680,128 686,136 680,140" stroke="#FF9AA8" stroke-width="12" fill="none" stroke-linecap="round" opacity=".95"/><circle cx="640" cy="132" r="9" fill="#FF8296"/><circle cx="637" cy="130" r="2.8" fill="#2a1a30"/>`;
  s += `<path d="M600,100 C620,76 650,70 674,72" stroke="#fff" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>`;
  s += `</g></g>`;
  s += star(560, 70, 7, '#8FE3F5', .9);
  return s;
}
put('amniote', 'An early lizard-like amniote beside its egg on a mossy log', amniote());

// =====================================================================
// CYNODONT (Thrinaxodon-like, digging)
// =====================================================================
function cynodont() {
  const r = L.rng(51);
  const BODY = 'M215,410 C260,362 360,346 450,350 C500,352 540,350 575,350 C610,344 652,354 690,380 C716,392 724,410 706,420 C690,432 660,434 635,430 C610,442 590,454 550,456 C480,460 380,454 300,458 C250,460 214,452 200,440 C190,430 200,418 215,410Z';
  let s = `<defs>
${lg('fur', 0, 0, 0.1, 1, [[0, '#C79A6B'], [.5, '#9A6F55'], [1, '#5C4358']])}
${lg('belly', 0, 0, 0, 1, [[0, '#EBD0A6'], [1, '#CDA582']])}
${lg('soil', 0, 0, 0, 1, [[0, '#9A6A4A'], [.5, '#744A46'], [1, '#432C42']])}
${rg('hole', .5, .5, .7, [[0, '#1a0f22'], [1, '#33203a']])}
<clipPath id="bc"><path id="bs" d="${BODY}"/></clipPath>${SOFT(8)}</defs>`;
  // soil section
  s += `<path d="M60,500 C120,474 190,478 260,484 C380,494 480,486 560,486 C650,486 700,476 740,496 L740,552 Q740,584 708,584 L92,584 Q60,584 60,552Z" fill="url(#soil)"/>`;
  s += `<path d="M60,500 C120,474 190,478 260,484 C380,494 480,486 560,486 C650,486 700,476 740,496" stroke="#E0A66E" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>`;
  s += `<path d="M60,530 C200,520 320,540 460,530 C600,520 700,534 740,528 M60,562 C220,552 330,570 500,560 C640,552 720,566 740,560" stroke="#2a1830" stroke-width="3" fill="none" opacity=".3"/>`;
  s += `<g fill="#3b2540" opacity=".5"><circle cx="500" cy="540" r="9"/><circle cx="620" cy="552" r="7"/><circle cx="360" cy="548" r="6"/><circle cx="690" cy="520" r="5"/></g><g fill="#C58E62" opacity=".5"><circle cx="440" cy="520" r="4"/><circle cx="580" cy="528" r="3.5"/><circle cx="300" cy="560" r="4"/></g>`;
  // burrow mouth
  s += `<path d="M76,498 C80,424 170,404 214,430 C236,444 244,470 246,486 C190,498 120,506 76,498Z" fill="url(#hole)"/>`;
  s += `<path d="M76,498 C80,424 170,404 214,430" stroke="#E0A66E" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>`;
  s += shadow(480, 506, 230, 12, .35);
  s += `<g transform="translate(0 16)">`;
  // tail into hole
  s += `<path d="M214,412 C180,418 150,436 104,468 L98,474 C150,470 200,468 210,448Z" fill="#8A5E50"/>`;
  s += `<path d="M214,414 C180,420 150,436 110,462" stroke="#E8BC8A" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  // far legs
  const far = '#7B5648', farH = '#A57C5E';
  s += limb([[580, 424], [606, 470], [628, 484]], [38, 28], far, farH, .4) + foot(630, 488, 4, 26, 9, far, '#2a1a28', -40, 30);
  s += limb([[338, 438], [372, 474], [356, 486]], [38, 28], far, farH, .4) + foot(358, 490, 4, 26, 9, far, '#2a1a28', -30, 20);
  s += `<use href="#bs" fill="url(#fur)"/><g clip-path="url(#bc)">`;
  s += `<path d="M190,452 C260,440 330,440 420,442 C500,440 580,430 660,420 L700,470 L190,470Z" fill="url(#belly)"/>`;
  s += `<path d="M190,462 C300,470 440,470 560,458 L600,480 L190,480Z" fill="#4b2f5a" opacity=".3"/>`;
  s += `<ellipse cx="430" cy="356" rx="180" ry="12" fill="#FFE0A0" opacity=".6" filter="url(#soft)"/>`;
  s += strokes(r, 300, [200, 345, 720, 455], 13, 30, 40, '#6B4A52', 2.6, .5);
  s += strokes(r, 260, [200, 345, 720, 440], 12, 25, 40, '#E8BC8A', 2.6, .55);
  s += strokes(r, 120, [200, 440, 650, 460], 11, 20, 40, '#FFF0CE', 2.4, .6);
  s += `</g>`;
  // fur fringe along the back (strands beyond silhouette)
  let fz = ''; for (let i = 0; i < 32; i++) { const x = 235 + i * 12, y = 360 - Math.sin(i / 31 * 2.2) * 4 - (i < 6 ? (6 - i) * -6 : 0); fz += `M${x},${f(y + 6)}l${f(5 + (i % 3))},${f(-9)}`; }
  s += `<path d="${fz}" stroke="#E8BC8A" stroke-width="2.8" stroke-linecap="round" opacity=".8"/>`;
  s += `<path d="M215,410 C260,362 360,346 450,350 C500,352 540,350 575,350 C610,344 652,354 690,380" stroke="#FFDCA0" stroke-width="3.5" fill="none" opacity=".75" stroke-linecap="round"/>`;
  // near legs
  const near = '#A87B5C', nearH = '#E8BC8A';
  s += limb([[560, 426], [524, 470], [566, 486]], [50, 34], near, nearH, .55);
  s += foot(568, 490, 5, 32, 10, '#C99772', '#2a1a28', -42, 34);
  s += limb([[292, 436], [330, 478], [286, 486]], [54, 36], near, nearH, .55);
  s += foot(290, 490, 5, 32, 10, '#C99772', '#2a1a28', -40, 26);
  s += strokes(r, 40, [505, 420, 560, 470], 8, 70, 40, '#EBCB98', 2.2, .6) + strokes(r, 40, [296, 440, 340, 480], 8, 70, 40, '#EBCB98', 2.2, .6);
  // dirt flung by the digging paws
  s += `<g fill="#B27E58"><circle cx="604" cy="470" r="5"/><circle cx="626" cy="452" r="4"/><circle cx="640" cy="472" r="3.4"/><circle cx="616" cy="438" r="3"/><circle cx="650" cy="456" r="2.6"/></g><g fill="#6c4a50"><circle cx="590" cy="454" r="3"/><circle cx="636" cy="486" r="4"/></g>`;
  // head
  s += `<path d="M706,420 C690,432 660,434 635,430 C650,420 680,414 706,418Z" fill="#E9CDA0"/>`;
  s += `<ellipse cx="706" cy="404" rx="12" ry="9" fill="#2e1f34"/><ellipse cx="711" cy="400" rx="4" ry="2.6" fill="#8E7390" opacity=".8"/>`;
  s += `<path d="M706,422 C680,424 662,420 648,414" stroke="#4a2a3e" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".75"/>`;
  s += `<path d="M688,424 l-2,7 l5,-6z" fill="#FFF6DC"/>`;
  s += `<path d="M626,350 C604,340 586,350 590,370 C598,380 612,374 626,368Z" fill="#8A5E50"/><ellipse cx="608" cy="362" rx="8" ry="10" fill="#E39A98" opacity=".6"/>`;
  s += `<path d="M640,366 Q656,356 676,366" stroke="#5C4358" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`;
  s += eye(658, 378, 9, '#3a2430', '#120c18');
  s += `<circle cx="661.5" cy="374.5" r="3" fill="#fff"/>`;
  // whiskers
  let wh = ''; [[-14, 56], [0, 70], [14, 62], [28, 50]].forEach(([a, l], i) => { const x = 712, y = 410 + i * 2; wh += `M${x},${y}q${l * .5},${(a - 8) * 1.2} ${l + 14},${a * 1.2 + 2}`; });
  wh += 'M700,404 q-10,-34 -50,-50 M696,402 q-6,-24 -30,-44';
  s += `<path d="${wh}" stroke="#FFF1D6" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".9"/>`;
  s += `</g>`;
  // grass tufts + sparkle of dust
  s += `<path d="M96,500 q-4,-30 -14,-44 M104,500 q2,-34 -4,-52 M112,500 q8,-26 14,-38 M700,490 q-2,-30 -12,-42 M708,490 q4,-28 0,-44 M716,490 q10,-22 18,-30" stroke="#6FC45A" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  return `<g transform="translate(0 -170) translate(400 0) scale(1.12) translate(-400 0)">` + s + `</g>`;
}
put('cynodont', 'A Thrinaxodon-like cynodont digging at its burrow', cynodont());

// =====================================================================
// MAMMAL (Morganucodon-like, at night)
// =====================================================================
function mammal() {
  const r = L.rng(67);
  const BODY = 'M212,420 C222,372 290,342 360,340 C420,338 470,338 520,352 C560,358 610,372 680,396 C720,408 744,416 752,424 C744,434 716,438 690,438 C650,440 610,444 570,448 C520,458 470,460 420,458 C340,458 262,462 226,450 C210,440 206,430 212,420Z';
  let s = `<defs>
${lg('fur', 0, 0, 0.1, 1, [[0, '#9A7488'], [.5, '#6D5380'], [1, '#392E5C']])}
${lg('belly', 0, 0, 0, 1, [[0, '#D8B3A8'], [1, '#A88596']])}
${lg('sky', 0, 0, 0, 1, [[0, '#2B2A6B', .55], [1, '#2B2A6B', 0]])}
${rg('moon', .5, .5, .5, [[0, '#FFF6D0'], [.55, '#FFF6D0', .5], [1, '#FFF6D0', 0]])}
<clipPath id="bc"><path id="bs" d="${BODY}"/></clipPath>${SOFT(9)}</defs>`;
  // moon + stars
  s += `<circle cx="150" cy="130" r="120" fill="url(#moon)" opacity="0"/><circle cx="150" cy="130" r="58" fill="#FFF3C4"/><circle cx="176" cy="116" r="52" fill="#262660" opacity="0"/>`;
  s += `<path d="M150,72 A58,58 0 1 0 208,134 A46,46 0 1 1 150,72Z" fill="#FFF3C4" opacity="0"/>`;
  s += `<circle cx="128" cy="116" r="9" fill="#E8D49A" opacity=".6"/><circle cx="170" cy="150" r="13" fill="#E8D49A" opacity=".5"/><circle cx="144" cy="160" r="6" fill="#E8D49A" opacity=".5"/>`;
  [[300, 90, 7], [420, 150, 5], [560, 80, 8], [690, 140, 6], [640, 230, 5], [330, 200, 5], [740, 60, 5], [470, 60, 5]].forEach(([x, y, q]) => s += star(x, y, q * 1.8, '#F2C14E', .95));
  // ferns (night silhouettes)
  const frond = (x, y, ang, len, c, c2) => { let d = ''; for (let i = 1; i < 9; i++) { const t = i / 9, px = len * t, py = -Math.sin(t * 2) * 10, ll = (1 - t) * 42 + 8; d += `M${f(px)},${f(py)}l${f(ll * .6)},${f(-ll)}M${f(px)},${f(py)}l${f(ll * .6)},${f(ll)}`; } return `<g transform="translate(${x} ${y}) rotate(${ang})"><path d="M0,0Q${len * .5},-14 ${len},0" stroke="${c}" stroke-width="5" fill="none"/><path d="${d}" stroke="${c2}" stroke-width="8" stroke-linecap="round" fill="none"/></g>`; };
  s += frond(90, 500, -60, 170, '#1d3a58', '#25507a') + frond(80, 500, -95, 130, '#1d3a58', '#2a5a80') + frond(715, 500, -118, 190, '#1d3a58', '#25507a') + frond(730, 500, -80, 140, '#1d3a58', '#2a5a80');
  // ground: leaf litter
  s += `<path d="M50,486 C160,466 300,484 420,476 C560,468 680,482 750,484 L750,530 Q750,560 718,560 L82,560 Q50,560 50,530Z" fill="#2c2a58"/>`;
  s += `<path d="M50,486 C160,466 300,484 420,476 C560,468 680,482 750,484" stroke="#7E8BD8" stroke-width="3" fill="none" opacity=".5"/>`;
  s += `<path d="M120,500 q30,-12 60,0 q-30,12 -60,0z M560,510 q30,-12 60,0 q-30,12 -60,0z M380,520 q26,-10 52,0 q-26,10 -52,0z" fill="#403a78" opacity=".7"/>`;
  s += shadow(450, 474, 250, 12, .45);
  // tail
  s += `<path d="M214,412 C150,402 104,372 78,320 L72,324 C98,384 150,424 216,438Z" fill="#6D5380"/>`;
  s += strokes(r, 40, [74, 322, 214, 430], 8, 200, 40, '#C49A9A', 1.8, .55);
  s += `<path d="M214,414 C150,404 104,374 80,322" stroke="#A8B6FF" stroke-width="2.4" fill="none" opacity=".55" stroke-linecap="round"/>`;
  // far legs
  const far = '#4C3E6E', farH = '#7A66A0';
  s += limb([[524, 440], [548, 462], [566, 472]], [22, 16], far, farH, .3) + foot(566, 475, 4, 18, 6, far, '#1d1630', -28, 24);
  s += limb([[350, 444], [374, 464], [390, 472]], [24, 16], far, farH, .3) + foot(390, 475, 4, 18, 6, far, '#1d1630', -28, 24);
  s += `<use href="#bs" fill="url(#fur)"/><g clip-path="url(#bc)">`;
  s += `<path d="M200,448 C300,438 440,446 560,432 C620,426 680,424 720,420 L720,470 L200,470Z" fill="url(#belly)"/>`;
  s += `<path d="M200,456 C300,460 440,466 570,452 L600,480 L200,480Z" fill="#2e2456" opacity=".4"/>`;
  s += `<ellipse cx="430" cy="346" rx="160" ry="12" fill="#B6C4FF" opacity=".45" filter="url(#soft)"/>`;
  s += strokes(r, 260, [205, 338, 700, 440], 12, 20, 50, '#4A3A6E', 2.4, .5);
  s += strokes(r, 220, [205, 338, 700, 430], 11, 20, 50, '#C9A0A8', 2.2, .5);
  s += strokes(r, 100, [205, 430, 700, 458], 10, 15, 40, '#F1D2C4', 2.2, .6);
  s += `</g>`;
  // back fur strands (rim light)
  let fz = ''; for (let i = 0; i < 38; i++) { const x = 232 + i * 11, t = i / 37; const y = 346 - Math.sin(t * Math.PI) * 6 + (t > .7 ? (t - .7) * 70 : 0) + (t < .1 ? 28 * (.1 - t) * 10 : 0); fz += `M${x},${f(y + 4)}l${f(5)},${f(-10)}`; }
  s += `<path d="${fz}" stroke="#C0CBFF" stroke-width="2.6" stroke-linecap="round" opacity=".75"/>`;
  s += `<path d="M212,418 C222,372 290,342 360,340 C420,338 470,338 520,352 C560,358 600,372 650,394" stroke="#B6C4FF" stroke-width="3.4" fill="none" opacity=".7" stroke-linecap="round"/>`;
  // near legs
  const near = '#755B8E', nearH = '#C0A2C0';
  s += limb([[496, 432], [506, 456], [522, 470]], [30, 20], near, nearH, .5) + foot(524, 474, 5, 20, 7, '#86699E', '#1d1630', -26, 22);
  s += limb([[288, 436], [276, 458], [298, 470]], [34, 22], near, nearH, .5) + foot(300, 474, 5, 20, 7, '#86699E', '#1d1630', -26, 22);
  // ear
  s += `<circle cx="552" cy="360" r="20" fill="#5A4478"/><circle cx="554" cy="362" r="12" fill="#E9A3AC" opacity=".8"/><path d="M536,350 a20,20 0 0 1 28,-4" stroke="#B6C4FF" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>`;
  // snout: nose pad with big nostril
  s += `<path d="M750,426 C720,430 690,428 660,420" stroke="#2b1e44" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".7"/>`;
  s += `<ellipse cx="748" cy="420" rx="14" ry="10.5" fill="#E88BA0"/><ellipse cx="742" cy="414" rx="6" ry="4" fill="#FFC6D0" opacity=".75"/><path d="M750,417 q9,2 7,10 q-9,-1 -7,-10z" fill="#4a1d3a"/>`;
  s += `<path d="M660,404 Q650,424 668,430" stroke="none" fill="none"/>`;
  s += `<path d="M616,372 Q630,364 646,372" stroke="#3a2c5c" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`;
  s += `<circle cx="628" cy="384" r="8.5" fill="#150f22"/><circle cx="632" cy="380.5" r="3.2" fill="#fff"/><circle cx="624" cy="388" r="1.8" fill="#8FA2FF" opacity=".8"/>`;
  // whiskers
  let wh = ''; [[-46, 90], [-22, 100], [2, 96], [24, 84]].forEach(([a, l], i) => { const x = 738, y = 420 + i * 2; wh += `M${x},${y}q${l * .5},${a * .5 - 6} ${l},${a * .9}`; });
  s += `<path d="${wh}" stroke="#A9B6EE" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".85"/>`;
  // tiny beetle snack
  s += `<ellipse cx="640" cy="470" rx="15" ry="10" fill="#3AA79A"/><path d="M640,460 L640,480" stroke="#1e6a70" stroke-width="2"/><path d="M628,464 q12,-8 24,0" stroke="#8FE9D6" stroke-width="2.5" fill="none" opacity=".7"/>`;
  return s;
}
put('mammal', 'A small shrew-like early mammal at night', mammal());

// =====================================================================
// CAT (ginger tabby, sitting)
// =====================================================================
function cat() {
  const r = L.rng(79);
  let s = `<defs>
${lg('fur', 0, 0, 0.9, 1, [[0, '#F7B65C'], [.5, '#E7954A'], [1, '#B66134']])}
${lg('furD', 0, 0, 0, 1, [[0, '#E9993F'], [1, '#A5552E']])}
${lg('white', 0, 0, 0, 1, [[0, '#FFFAF0'], [1, '#EAD6C4']])}
${rg('iris', .5, .45, .6, [[0, '#E4F27A'], [.6, '#9BD04A'], [1, '#3F8A3A']])}
<clipPath id="bc"><path id="bs" d="M468,226 C400,250 330,300 288,376 C254,440 252,504 286,536 L560,540 C586,508 580,414 552,330 C540,290 528,252 520,226Z"/></clipPath>
<clipPath id="hc"><path id="hs" d="M520,98 C580,98 618,136 606,186 C602,214 566,238 520,238 C474,238 438,214 434,186 C422,136 460,98 520,98Z"/></clipPath>
${SOFT(8)}</defs>`;
  s += shadow(430, 548, 260, 20, .38);
  // tail (behind): ginger with dark rings, curling to the front
  const tp = 'M276,520 C240,560 380,574 520,556 C590,548 636,530 628,478 C624,452 640,440 650,430';
  s += `<path d="${tp}" stroke="#B9652F" stroke-width="40" stroke-linecap="round" fill="none"/>`;
  s += `<path d="${tp}" stroke="url(#furD)" stroke-width="36" stroke-linecap="round" fill="none"/>`;
  s += `<path d="${tp}" stroke="#8E4426" stroke-width="37" fill="none" stroke-dasharray="16 30" stroke-dashoffset="-8"/>`;
  s += `<path d="${tp}" stroke="#FFC878" stroke-width="5" fill="none" opacity=".6" transform="translate(0 -13)" stroke-linecap="round"/>`;
  s += `<circle cx="650" cy="430" r="19" fill="#7A3A22"/>`;
  // body
  s += `<use href="#bs" fill="url(#fur)"/><g clip-path="url(#bc)">`;
  s += `<ellipse cx="520" cy="540" rx="300" ry="70" fill="#7a3a52" opacity=".28"/>`;
  s += `<ellipse cx="400" cy="270" rx="150" ry="28" fill="#FFD895" opacity=".55" filter="url(#soft)" transform="rotate(30 400 270)"/>`;
  // tabby stripes across back and haunch
  let st = '';
  for (let i = 0; i < 7; i++) { const t = i / 6; const x = 440 - t * 170, y = 262 + t * 130; st += `M${f(x)},${f(y)}q${f(-18 - i * 2)},${f(20 + i * 3)} ${f(-34)},${f(78 - i * 2)}`; }
  s += `<path d="${st}" stroke="#9B4A24" stroke-width="15" fill="none" stroke-linecap="round" opacity=".68"/>`;
  s += `<path d="M262,420 q28,-14 56,-6 M262,448 q34,-14 66,-8 M268,478 q30,-12 60,-6" stroke="#9B4A24" stroke-width="12" fill="none" stroke-linecap="round" opacity=".6"/>`;
  s += strokes(r, 160, [250, 250, 580, 540], 11, 65, 40, '#FFD392', 2.4, .5);
  s += strokes(r, 120, [250, 250, 580, 540], 10, 60, 40, '#A9582B', 2.2, .4);
  s += `</g>`;
  // haunch (lighter lobe) + hind foot
  s += `<path d="M270,452 C262,396 306,352 360,356 C420,360 450,420 436,480 C428,516 392,534 340,534 C292,534 274,500 270,452Z" fill="#EDA14F"/>`;
  s += `<path d="M284,420 C294,380 330,364 362,368" stroke="#FFD08A" stroke-width="5" fill="none" opacity=".75" stroke-linecap="round"/>`;
  s += `<path d="M300,436 q24,-24 46,-8 M296,462 q30,-26 62,-8 M304,490 q28,-20 56,-4" stroke="#9B4A24" stroke-width="10" fill="none" stroke-linecap="round" opacity=".6"/>`;
  s += strokes(r, 60, [280, 365, 430, 520], 9, 60, 40, '#FFD392', 2.2, .55);
  s += `<path d="M340,524 C336,506 372,498 430,504 C478,508 494,522 484,536 C474,546 380,548 346,540Z" fill="url(#white)"/>`;
  s += `<path d="M360,538 l2,-16 M392,540 l2,-18 M424,540 l0,-16" stroke="#C9A98E" stroke-width="3" opacity=".7" stroke-linecap="round"/>`;
  // chest / front leg
  s += `<path d="M504,300 C538,290 580,320 582,400 C584,460 584,510 578,528 C576,544 540,548 512,546 C500,540 504,504 504,470Z" fill="#EBA050"/>`;
  s += `<path d="M542,330 C572,350 574,420 572,500" stroke="#FFD08A" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>`;
  s += `<path d="M518,420 q20,-10 40,0 M520,446 q22,-10 44,0" stroke="#9B4A24" stroke-width="9" fill="none" opacity=".55" stroke-linecap="round"/>`;
  s += `<path d="M508,490 C506,500 506,520 512,540 C530,552 580,552 586,534 C590,520 580,498 560,494 C540,490 520,486 508,490Z" fill="url(#white)"/>`;
  s += `<path d="M528,540 l0,-14 M548,542 l0,-16 M566,540 l0,-14" stroke="#C9A98E" stroke-width="3" opacity=".7" stroke-linecap="round"/>`;
  // bib
  s += `<path d="M484,262 C520,300 566,300 566,262 C566,350 540,380 520,382 C496,380 478,330 484,262Z" fill="url(#white)"/>`;
  s += strokes(r, 40, [488, 270, 562, 370], 9, 90, 50, '#fff', 2.2, .9);
  // head
  s += `<path d="M445,128 L436,48 L514,100Z" fill="#D07C3A"/><path d="M451,118 L446,66 L494,100Z" fill="#F4A3A8"/>`;
  s += `<path d="M595,128 L604,48 L526,100Z" fill="#D07C3A"/><path d="M589,118 L594,66 L546,100Z" fill="#F4A3A8"/>`;
  s += `<path d="M438,58 L445,100" stroke="#FFD08A" stroke-width="3" opacity=".7" stroke-linecap="round"/>`;
  s += strokes(r, 14, [450, 70, 490, 110], 6, -80, 30, '#FFF1D6', 2, .8) + strokes(r, 14, [550, 70, 590, 110], 6, -100, 30, '#FFF1D6', 2, .8);
  // cheek ruff
  s += `<path d="M436,176 L418,196 L440,200 L426,222 L452,220 L450,236 L476,240 L520,244 L564,240 L590,236 L588,220 L614,222 L600,200 L622,196 L604,176Z" fill="#E3913F"/>`;
  s += `<use href="#hs" fill="url(#fur)"/><g clip-path="url(#hc)">`;
  s += `<ellipse cx="520" cy="112" rx="90" ry="24" fill="#FFE0A5" opacity=".6" filter="url(#soft)"/>`;
  s += `<ellipse cx="520" cy="232" rx="110" ry="30" fill="#7a3a52" opacity=".25"/>`;
  s += `<path d="M520,96 l0,38 M500,98 q-4,18 -8,34 M540,98 q4,18 8,34 M480,106 q-8,14 -12,28 M560,106 q8,14 12,28" stroke="#8E4426" stroke-width="8" fill="none" stroke-linecap="round" opacity=".8"/>`;
  s += `<path d="M440,172 q22,6 38,2 M438,194 q26,8 44,0 M600,172 q-22,6 -38,2 M602,194 q-26,8 -44,0" stroke="#8E4426" stroke-width="7" fill="none" stroke-linecap="round" opacity=".75"/>`;
  s += strokes(r, 80, [436, 98, 604, 238], 8, 90, 120, '#FFD392', 2.2, .45);
  s += `</g>`;
  s += `<path d="M436,176 C430,130 470,100 520,98 C570,100 610,130 604,176" stroke="#FFD392" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  // muzzle
  s += `<ellipse cx="500" cy="208" rx="25" ry="20" fill="url(#white)"/><ellipse cx="540" cy="208" rx="25" ry="20" fill="url(#white)"/><ellipse cx="520" cy="224" rx="22" ry="12" fill="#FFF4E4"/>`;
  s += `<path d="M520,194 L520,206 M520,206 q-8,10 -18,6 M520,206 q8,10 18,6" stroke="#8E4A4A" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M508,190 L532,190 Q528,204 520,206 Q512,204 508,190Z" fill="#F08A9A"/><path d="M512,191 h10" stroke="#FFC6CF" stroke-width="2.4" stroke-linecap="round"/>`;
  s += `<g fill="#C98E7E" opacity=".7"><circle cx="492" cy="208" r="1.6"/><circle cx="500" cy="214" r="1.6"/><circle cx="490" cy="216" r="1.6"/><circle cx="548" cy="208" r="1.6"/><circle cx="540" cy="214" r="1.6"/><circle cx="550" cy="216" r="1.6"/></g>`;
  // eyes
  [[484, -1], [556, 1]].forEach(([x, d]) => {
    s += `<path d="M${x - 22},168 Q${x},152 ${x + 22},168 Q${x},190 ${x - 22},168Z" fill="#2c1f2e"/>`;
    s += `<ellipse cx="${x}" cy="170" rx="17" ry="14" fill="url(#iris)"/><ellipse cx="${x}" cy="170" rx="5" ry="13" fill="#1a1020"/><circle cx="${x + 6}" cy="164" r="4" fill="#fff"/><circle cx="${x - 5}" cy="176" r="1.8" fill="#fff" opacity=".7"/>`;
    s += `<path d="M${x - 22},168 Q${x},150 ${x + 22},168" stroke="#7A3A22" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M${x - 22 * d},168 l${-14 * d},-6" stroke="#2c1f2e" stroke-width="3" stroke-linecap="round"/>`;
  });
  // whiskers
  let wl = '', wr = '';
  [[-30, 100], [-6, 108], [20, 98]].forEach(([a, l], i) => { wl += `M478,${206 + i * 5}q${-l * .5},${a * .5 - 8} ${-l},${a}`; wr += `M562,${206 + i * 5}q${l * .5},${a * .5 - 8} ${l},${a}`; });
  s += `<path d="${wl}${wr}" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".95"/>`;
  s += `<path d="M492,150 q-6,-18 -2,-28 M548,150 q6,-18 2,-28" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`;
  return s;
}
put('cat', 'A ginger tabby cat sitting', cat());

// =====================================================================
// HUMAN (child, waving)
// =====================================================================
function human() {
  let s = `<defs>
${lg('skin', 0, 0, 0.3, 1, [[0, '#BC7F55'], [1, '#A06740']])}
${lg('tee', 0, 0, 0.2, 1, [[0, '#3DC3B0'], [1, '#1E8E94']])}
${lg('short', 0, 0, 0, 1, [[0, '#F4C04A'], [1, '#D9962C']])}
${lg('hair', 0, 0, 0, 1, [[0, '#4a3430'], [1, '#231619']])}
<clipPath id="tc"><path id="ts" d="M345,224 Q400,206 455,224 L464,352 Q400,366 336,352Z"/></clipPath></defs>`;
  const SK = '#B07446', SKD = '#8E5836', SKL = '#CF9468';
  s += shadow(400, 556, 150, 16, .36);
  // far-side pieces: waving arm (viewer's right) behind torso edge
  s += limb([[452, 244], [512, 196], [542, 124]], [30, 26], SK, SKL, .4);
  s += `<path d="M452,244 L512,196" stroke="${SKD}" stroke-width="6" opacity=".25" stroke-linecap="round" transform="translate(5 9)"/>`;
  // hand
  s += `<path d="M540,126 l-16,-46 M548,122 l-4,-52 M556,124 l10,-48 M562,130 l24,-38" stroke="${SK}" stroke-width="13" stroke-linecap="round"/>`;
  s += `<path d="M530,132 l-26,-14" stroke="${SK}" stroke-width="13" stroke-linecap="round"/>`;
  s += `<ellipse cx="548" cy="132" rx="23" ry="20" fill="${SK}"/><path d="M533,122 q12,-8 24,-4" stroke="${SKL}" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>`;
  s += `<path d="M590,56 q16,22 6,50 M606,70 q10,16 4,34" stroke="#7FD6C8" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/><path d="M498,70 q-14,18 -6,42" stroke="#7FD6C8" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>`;
  // legs
  s += `<path d="M350,420 L392,420 L390,512 L354,512Z" fill="${SK}"/><path d="M410,420 L452,420 L448,512 L412,512Z" fill="${SK}"/>`;
  s += `<path d="M392,424 L392,512 L378,512 L380,424Z M452,424 L452,512 L440,512 L440,424Z" fill="${SKD}" opacity=".3"/>`;
  s += `<path d="M352,486 h40 l-2,36 h-36z M410,486 h40 l-2,36 h-36z" fill="#FFF8EC"/><path d="M356,498 h32 M414,498 h32" stroke="#4aa7d8" stroke-width="5" opacity=".9"/>`;
  // shoes
  s += `<path d="M350,522 L392,522 C412,524 420,538 420,548 L334,550 C326,540 332,528 350,522Z" fill="#fff"/><path d="M334,538 C360,544 400,544 420,540 L420,550 L334,552Z" fill="#E8504A"/><path d="M340,534 q30,-8 58,-4" stroke="#bcd" stroke-width="3" fill="none" opacity=".8"/><path d="M366,526 l10,6 M378,525 l8,7" stroke="#8aa" stroke-width="2.5" stroke-linecap="round"/><path d="M340,530 q8,-6 20,-8" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".0"/>`;
  s += `<path d="M410,522 L452,522 C470,528 466,540 466,548 L380,550 C380,538 390,526 410,522Z" fill="#fff" transform="translate(2 0)"/><path d="M382,540 C410,546 450,546 468,542 L468,550 L382,552Z" fill="#E8504A"/><path d="M432,526 l10,6 M444,525 l8,7" stroke="#8aa" stroke-width="2.5" stroke-linecap="round"/><path d="M392,534 q30,-8 58,-4" stroke="#bcd" stroke-width="3" fill="none" opacity=".8"/>`;
  // shorts
  s += `<path d="M338,346 L462,346 L472,432 L408,432 L400,392 L392,432 L328,432Z" fill="url(#short)"/>`;
  s += `<path d="M400,392 L408,432 L472,432 L462,346 L420,346Z" fill="#B87820" opacity=".18"/><path d="M342,358 L458,358" stroke="#FFE08A" stroke-width="4" opacity=".7"/><path d="M342,424 L328,430 M458,424 L472,430" stroke="#B87820" stroke-width="3" opacity=".5"/>`;
  // hanging arm (viewer's left)
  s += limb([[338, 246], [322, 296], [314, 342]], [30, 26], SK, SKL, .4);
  s += `<ellipse cx="313" cy="352" rx="16" ry="19" fill="${SK}"/>`;
  // tee
  s += `<use href="#ts" fill="url(#tee)"/><g clip-path="url(#tc)">`;
  s += `<path d="M336,330 Q400,344 464,330 L464,360 L336,360Z" fill="#136a7a" opacity=".35"/><path d="M345,224 Q360,230 364,262 L358,350" stroke="#136a7a" stroke-width="10" fill="none" opacity=".25"/>`;
  s += `<path d="M350,250 Q400,236 450,250 M350,270 Q400,256 450,270" stroke="#86F0DC" stroke-width="7" fill="none" opacity=".35"/>`;
  s += `<circle cx="400" cy="296" r="22" fill="#FFE08A" opacity=".95"/><circle cx="400" cy="296" r="13" fill="#F28A3E"/><path d="M386,288 q10,-10 22,-6" stroke="#fff" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  s += `</g><path d="M345,224 Q400,206 455,224" stroke="#8FF0DC" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  // sleeves
  s += `<path d="M346,224 C330,232 318,252 310,270 L340,284 L362,246Z" fill="#2FB3A6"/><path d="M310,270 L340,284" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/>`;
  s += `<path d="M454,224 C474,230 492,244 504,262 L478,290 L448,252Z" fill="#2FB3A6"/><path d="M504,262 L478,290" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/><path d="M458,230 C474,236 488,246 498,258" stroke="#8FF0DC" stroke-width="3" fill="none" opacity=".6" stroke-linecap="round"/>`;
  // neck + ears + head
  s += `<path d="M380,178 L420,178 L424,222 Q400,236 376,222Z" fill="${SK}"/><path d="M380,200 Q400,214 422,200 L424,222 Q400,236 376,222Z" fill="${SKD}" opacity=".35"/>`;
  s += `<circle cx="338" cy="144" r="13" fill="${SK}"/><circle cx="338" cy="144" r="6" fill="${SKD}" opacity=".4"/><circle cx="462" cy="144" r="13" fill="${SK}"/><circle cx="462" cy="144" r="6" fill="${SKD}" opacity=".4"/>`;
  s += `<path d="M340,126 C336,80 366,66 400,66 C434,66 464,80 460,126 C462,170 440,200 400,202 C360,200 338,170 340,126Z" fill="url(#skin)"/>`;
  s += `<path d="M350,170 C360,192 380,200 400,202 C430,200 452,184 456,152" stroke="${SKD}" stroke-width="5" fill="none" opacity=".25" stroke-linecap="round"/>`;
  // hair (short, curly)
  s += `<path d="M336,132 C326,86 350,52 400,50 C450,52 474,86 464,132 C458,116 450,102 440,96 C420,106 380,106 360,96 C350,104 342,116 336,132Z" fill="url(#hair)"/>`;
  [[348, 92, 15], [368, 70, 16], [394, 60, 17], [422, 62, 16], [446, 76, 15], [458, 100, 13], [338, 112, 12], [350, 126, 9], [452, 124, 9], [382, 84, 11], [410, 84, 11]].forEach(([x, y, q]) => s += `<circle cx="${x}" cy="${y}" r="${q}" fill="url(#hair)"/>`);
  s += `<path d="M360,64 q14,-12 30,-10 M410,54 q16,0 28,10" stroke="#7a5a54" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>`;
  // face
  s += `<path d="M366,122 Q378,114 392,120 M408,120 Q422,114 434,122" stroke="#2a1a1a" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  [[378, 142], [422, 142]].forEach(([x, y]) => s += `<ellipse cx="${x}" cy="${y}" rx="8.5" ry="10.5" fill="#2a1a1e"/><circle cx="${x + 3}" cy="${y - 4}" r="3.2" fill="#fff"/><circle cx="${x - 3}" cy="${y + 4}" r="1.4" fill="#fff" opacity=".7"/>`);
  s += `<ellipse cx="362" cy="166" rx="12" ry="8" fill="#E2775C" opacity=".35"/><ellipse cx="438" cy="166" rx="12" ry="8" fill="#E2775C" opacity=".35"/>`;
  s += `<path d="M395,156 q5,8 12,2" stroke="${SKD}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>`;
  s += `<path d="M376,172 Q400,196 424,172 Q400,180 376,172Z" fill="#7a2a30"/><path d="M380,173 Q400,181 420,173 Q400,177 380,173Z" fill="#fff"/><path d="M376,172 Q400,196 424,172" stroke="#4a1a22" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return s;
}
put('human', 'A friendly child waving', human());

// ---------- output + contact sheet ----------
L.writeFile('early', art);
const sheetDir = path.join(__dirname, '..', 'sheets');
fs.mkdirSync(sheetDir, { recursive: true });
let html = '<!doctype html><meta charset="utf-8"><title>early</title><body style="margin:0;background:#e9ecf5;font:13px sans-serif"><div style="display:grid;grid-template-columns:1fr;gap:10px;padding:10px">';
sheetItems.forEach(id => { html += `<div style="background:#f7f9ff;border-radius:10px;padding:6px"><b>${id} ${Math.round(art[id].length / 1024)}KB</b><div style="display:flex;align-items:flex-end;gap:10px"><div style="width:640px">${art[id]}</div><div style="width:120px">${art[id]}</div></div></div>`; });
html += '</div><script>var h=location.hash.slice(1);if(h)[].forEach.call(document.querySelectorAll("body>div>div"),function(d){if(d.firstChild.textContent.indexOf(h+" ")!==0)d.style.display="none"})</script></body>';
fs.writeFileSync(path.join(sheetDir, 'early.html'), html);
