// feathered maniraptorans: velociraptor, microraptor, coelurosaur, maniraptoran
const T = require('./theropods-lib');
const { drawHead, Piece, bodyPart, limbPart, claw, ground, fuzz, leg, feather, tube, band, edge, f, L } = T;

// fan of long feathers: list of [angle, len]; fill & rachis colours
function fan(P, x, y, list, w, bend, fill, lite) {
  list.forEach(([a, l, dx, dy]) => P.add(feather(x + (dx || 0), y + (dy || 0), a, l, w, bend * (a > 180 ? -1 : 1), fill, lite)));
}
// row of small feathers along a polyline (pts [x,y]) pointing angle a
function row(P, pts, n, a, len, w, fill, jit, seed) {
  const r = L.rng(seed || 3);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1) * (pts.length - 1), k = Math.min(pts.length - 2, Math.floor(t)), u = t - k;
    const x = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * u, y = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * u;
    P.add(feather(x, y, a + (r() - .5) * jit, len * (.8 + r() * .4), w, (r() - .5) * 8, fill));
  }
}

// ---------- VELOCIRAPTOR ----------
function velociraptor() {
  const P = new Piece();
  const c = { top: '#CC6E3C', mid: '#A24A2B', bot: '#5F3A55', sh: '#3A2A55', hi: '#FFB66E', belly: '#F6E3C0', rim: '#FFD08A' };
  const dark = { mid: '#7E3A28', sh: '#3A2A55', hi: '#A24A2B' };
  const wf = P.grad(P.id('wf'), [[0, '#9A4A2C'], [.45, '#5E2F33'], [1, '#231E3C']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const wf2 = P.grad(P.id('wg'), [[0, '#C0683A'], [.5, '#8A4030'], [1, '#2E2548']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const tf = P.grad(P.id('tf'), [[0, '#8A3E28'], [.55, '#4E2A38'], [1, '#1F1C38']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  P.add(ground(410, 550, 220, 17, .35));
  // far leg
  leg(P, { hip: [352, 340], knee: [396, 396], ankle: [354, 452], foot: [364, 538], w: [26, 15, 9, 8], c: dark, toeLen: 42, toeW: 9, claw: '#2A2430', hallux: true });
  // tail feathers (behind tail)
  const spine = [[60, 392, 3, 3], [140, 372, 6, 7], [220, 350, 9, 11], [290, 330, 18, 21], [350, 318, 32, 36], [410, 318, 34, 38], [458, 310, 22, 24], [490, 278, 15, 16], [510, 242, 13, 13]];
  fan(P, 62, 392, [[168, 130], [178, 150], [188, 140], [198, 120], [160, 100]], 15, 6, tf, '#B07A5A');
  row(P, [[100, 380], [150, 366], [200, 352], [250, 338]], 9, 176, 54, 11, tf, 10, 5);
  row(P, [[100, 384], [150, 372], [200, 360], [250, 346]], 8, 190, 40, 9, '#7E3A28', 10, 6);
  const tex = P.scales(P.id('sc'), '#4A2A3A', 13, 11, 2.2, .18, '#FFC98A');
  const B = bodyPart(P, spine, c, { rimFrom: 1, rimW: 3 });
  // fuzz coat on the body
  P.add(`<g clip-path="${B.clip}"><path d="${band(spine, -.1, -1.2)}" fill="${c.belly}" opacity=".35"/></g>`);
  P.add(fuzz(spine, .6, 90, 15, 168, '#E8905A', 4.4, 11, { spread: 26 }) + fuzz(spine, .05, 80, 14, 170, '#D77A44', 4.2, 12, { spread: 26 }));
  P.add(`<g opacity=".8">` + fuzz(spine, -.55, 70, 13, 170, '#F6DDB0', 4.2, 13, { spread: 26 }) + `</g>`);
  P.add(fuzz(spine, 1, 80, 14, -105, '#FFB873', 4.2, 14, { spread: 40 }) + fuzz(spine, -1, 50, 12, 140, '#F6DDB0', 3.8, 15, { spread: 40 }));
  // near leg with feathery pants and raised sickle claw
  leg(P, { hip: [396, 340], knee: [440, 398], ankle: [398, 452], foot: [410, 540], w: [30, 17, 10, 9], c: { mid: c.mid, sh: c.sh, hi: c.hi }, toeLen: 46, toeW: 10, claw: '#2A2430', hallux: true, thighBulge: 4 });
  P.add(fuzz([[396, 340, 28, 28], [436, 392, 18, 18]], .85, 22, 15, 110, '#E8905A', 4, 21, { spread: 30 }) + fuzz([[396, 340, 28, 28], [436, 392, 18, 18]], -.85, 18, 14, 90, '#F6DDB0', 4, 22, { spread: 30 }));
  // sickle claw (toe II held up)
  P.add(`<path d="M404,520 Q424,506 440,486" stroke="#8A6A58" stroke-width="9" fill="none" stroke-linecap="round"/>`);
  P.add(claw(436, 490, -35, 46, 11, '#F0E6D0', '#fff') + `<path d="M440,486 Q470,490 484,520" stroke="#C9B896" stroke-width="2" fill="none" opacity=".0"/>`);
  // wing: feathers fan back from the hand, secondaries along the forearm
  limbPart(P, [[448, 330, 8, 8], [424, 360, 6, 6], [470, 370, 5, 5]], { mid: '#8A3E28', sh: c.sh, hi: c.hi }, { cap: .5 });
  fan(P, 470, 368, [[176, 160], [166, 168], [156, 160], [146, 148], [136, 132], [126, 112]], 17, 8, wf, '#B58A68');
  fan(P, 440, 345, [[165, 130], [150, 118], [135, 100]], 15, 6, wf2, '#E09A6A');
  limbPart(P, [[470, 370, 5, 5], [494, 380, 3.4, 3.4]], { mid: '#8A3E28', sh: c.sh, hi: c.hi }, { cap: .4 });
  limbPart(P, [[470, 370, 4, 4], [496, 368, 3, 3]], { mid: '#8A3E28', sh: c.sh, hi: c.hi }, { cap: .4 });
  P.add(claw(494, 380, 40, 18, 5.5, '#2A2430') + claw(496, 368, 0, 17, 5.5, '#2A2430'));
  // head (long, narrow, slightly concave snout)
  drawHead(P, c, {
    head: [[494, 226], [508, 204], [540, 196], [578, 202], [616, 212], [654, 224], [668, 234], [660, 242], [620, 244], [580, 246], [538, 248], [506, 246], [492, 238]],
    jaw: [[660, 244], [650, 254], [610, 260], [566, 260], [524, 258], [498, 250], [496, 242], [540, 250], [590, 250], [640, 246]],
    eye: [548, 218, 9.5], iris: '#F4B73A', nostril: [650, 230], rimN: 7,
    shade: `<ellipse cx="520" cy="238" rx="36" ry="12" fill="#3A2A55" opacity=".25"/><path d="M510,206 Q560,190 660,230" stroke="${c.hi}" stroke-width="8" fill="none" opacity=".3"/>`,
    mouth: 'M668,238 Q640,246 600,246 Q550,252 514,248',
    up: [656, 243, 570, 248, 12, 9, 5], low: [580, 252, 640, 246, 8, 7, 4.5], brow: []
  });
  // head crest fuzz + cheek feathers
  P.add(fuzz([[494, 226, 10, 10], [510, 204, 8, 8], [545, 196, 6, 6]], 1, 12, 18, -120, '#FFB873', 4.2, 31, { spread: 40 }));
  P.add(fuzz([[492, 238, 12, 12], [500, 270, 10, 10]], 0, 8, 16, 120, '#E8905A', 4, 32, { spread: 40 }));
  return '<g transform="translate(-6 -6)">' + P.svg() + '</g>';
}

// ---------- MICRORAPTOR ----------
function microraptor() {
  const P = new Piece();
  const c = { top: '#2B3A6A', mid: '#1B2448', bot: '#120F2C', sh: '#0A0820', hi: '#7FE0F0', belly: '#2E4A7A', rim: '#8FF0FF' };
  const ir = (id, a) => P.grad(P.id(id), a, { x1: 0, y1: 0, x2: 1, y2: 0 });
  const w1 = ir('w1', [[0, '#141A38'], [.35, '#1F4E78'], [.7, '#2C8C90'], [1, '#5B3A90']]);
  const w2 = ir('w2', [[0, '#1A1740'], [.4, '#35307A'], [.8, '#3A7AA8'], [1, '#2A9A8A']]);
  const w3 = ir('w3', [[0, '#101430'], [.5, '#244868'], [1, '#6A3C98']]);
  const lite = '#8FE8F0';
  // hind wing (far side) pointing back and down
  fan(P, 330, 350, [[112, 190], [124, 205], [136, 215], [148, 205], [160, 185], [170, 160]], 20, 8, w3, lite);
  // far forewing
  fan(P, 420, 296, [[214, 200], [226, 214], [238, 220], [250, 206]], 20, 8, w3, lite);
  // tail with diamond fan
  const spine = [[210, 352, 3, 3], [270, 346, 7, 8], [330, 338, 18, 22], [390, 326, 30, 34], [450, 318, 30, 32], [490, 296, 20, 20], [512, 268, 14, 14]];
  P.add(`<path d="M200,352 Q130,355 74,364 M200,352 Q130,350 64,350" stroke="#1B2448" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  fan(P, 205, 352, [[168, 120], [174, 150], [180, 170], [186, 150], [192, 120]], 15, 6, w1, lite);
  // two long streamers
  P.add(feather(190, 352, 178, 215, 9, 8, w2, lite) + feather(190, 352, 184, 205, 9, -8, w1, lite));
  const B = bodyPart(P, spine, c, { rimFrom: 1, rimW: 3 });
  P.add(`<g opacity=".85">` + fuzz(spine, .3, 60, 12, 165, '#3A6AA0', 4, 11, { spread: 26 }) + fuzz(spine, -.4, 40, 12, 160, '#4C86B0', 3.8, 12, { spread: 26 }) + `</g>`);
  P.add(fuzz(spine, 1, 40, 12, -105, '#5AB8D0', 3.6, 14, { spread: 40 }));
  // near hind wing + leg
  fan(P, 360, 350, [[100, 200], [112, 214], [124, 224], [136, 218], [148, 200], [158, 176]], 20, 8, w1, lite);
  limbPart(P, [[372, 338, 15, 15], [350, 396, 8, 8], [352, 440, 6, 6]], { mid: '#1B2448', sh: '#0A0820', hi: '#4C86B0' }, { cap: .5 });
  [[0, 32, 10], [20, 28, 8]].forEach(([dy, dx, a]) => P.add(`<path d="M352,440 Q${352 + dx},${446 + dy} ${352 + dx * 1.5},${450 + dy}" stroke="#241F44" stroke-width="5" fill="none" stroke-linecap="round"/>`));
  P.add(claw(404, 450, 40, 12, 5, '#D8D0C0') + claw(376, 458, 35, 12, 5, '#D8D0C0'));
  // near forewing: spread up and back
  limbPart(P, [[440, 304, 10, 10], [436, 258, 7, 7], [420, 214, 5, 5]], { mid: '#1B2448', sh: '#0A0820', hi: '#4C86B0' }, { cap: .5 });
  fan(P, 438, 300, [[200, 215], [212, 228], [224, 236], [236, 232], [248, 218], [260, 196]], 22, 9, w2, lite, 0);
  fan(P, 420, 216, [[188, 150], [200, 160], [212, 166]], 19, 8, w1, lite);
  // head, with small crest
  drawHead(P, c, {
    head: [[494, 272], [506, 246], [534, 236], [566, 240], [590, 252], [598, 264], [590, 272], [560, 276], [530, 280], [504, 284], [492, 280]],
    jaw: [[590, 274], [580, 284], [554, 290], [524, 292], [500, 290], [492, 282], [530, 282], [562, 280]],
    eye: [538, 256, 10], iris: '#F2A02E', nostril: [586, 258], rimN: 6,
    shade: `<path d="M504,248 Q550,230 596,262" stroke="${c.hi}" stroke-width="6" fill="none" opacity=".35"/>`,
    mouth: 'M598,268 Q580,278 552,278 Q530,284 504,284',
    up: [592, 272, 548, 278, 7, 7, 4], low: [548, 280, 584, 276, 5, 6, 3.5], brow: []
  });
  P.add(`<g>` + feather(520, 242, -75, 54, 8, 5, w1, lite) + feather(530, 240, -60, 60, 8, 5, w2, lite) + feather(510, 246, -92, 44, 7, 4, w1, lite) + `</g>`);
  return '<g transform="translate(18 -20)">' + P.svg() + '</g>';
}

// ---------- COELUROSAUR (Sinosauropteryx-like) ----------
function coelurosaur() {
  const P = new Piece();
  const c = { top: '#E48E3C', mid: '#CC6A2E', bot: '#8E4B4E', sh: '#4A2D52', hi: '#FFCB7C', belly: '#FBEED0', rim: '#FFDA96' };
  const dark = { mid: '#A8561F', sh: '#4A2D52', hi: '#CC6A2E' };
  P.add(ground(390, 548, 300, 18, .35));
  leg(P, { hip: [480, 396], knee: [520, 450], ankle: [486, 498], foot: [496, 536], w: [26, 15, 9, 8], c: dark, toeLen: 40, toeW: 9, claw: '#3A2F3A', hallux: true });
  const spine = [[40, 420, 3, 3], [120, 410, 6, 7], [200, 400, 9, 10], [280, 388, 12, 13], [350, 374, 16, 18], [420, 360, 32, 38], [480, 354, 36, 40], [540, 346, 26, 28], [590, 332, 20, 22], [622, 318, 17, 18]];
  const B = bodyPart(P, spine, c, { rimFrom: 1, rimW: 3 });
  // ringed tail
  let rings = '';
  for (let i = 0; i < 16; i++) { const x = 70 + i * 22; rings += `M${x},${300 + i * 0}v220`; }
  P.add(`<g clip-path="${B.clip}"><path d="${rings}" stroke="#FBEED0" stroke-width="9" opacity=".8" transform="skewX(-3)"/>` +
    `<path d="M70,470 L350,470 L350,430 Q220,438 70,424Z" fill="#FBEED0" opacity=".0"/></g>`);
  // downy fuzz coat, all over
  P.add(`<g opacity=".75">` + fuzz(spine, .5, 100, 13, 170, '#FFB05A', 4.4, 11, { spread: 30 }) + fuzz(spine, -.1, 90, 13, 172, '#E88A3A', 4.2, 12, { spread: 30 }) + `</g>`);
  P.add(fuzz(spine, 1, 110, 13, -100, '#FFC27A', 4.4, 14, { spread: 45 }) + fuzz(spine, -1, 70, 11, 150, '#F6DDB0', 3.8, 15, { spread: 40 }));
  // tail ring tufts so silhouette stays fluffy
  P.add(fuzz(spine.slice(0, 5), 1, 40, 11, -110, '#FBEED0', 4, 16, { spread: 30 }));
  // near leg + fuzz
  leg(P, { hip: [440, 394], knee: [486, 448], ankle: [446, 498], foot: [456, 538], w: [32, 17, 10, 9], c: { mid: c.mid, sh: c.sh, hi: c.hi }, toeLen: 44, toeW: 10, claw: '#3A2F3A', hallux: true, thighBulge: 4 });
  P.add(fuzz([[440, 394, 30, 30], [484, 446, 18, 18]], .9, 22, 14, 110, '#FFB05A', 4, 21, { spread: 30 }));
  // tiny arm
  limbPart(P, [[560, 356, 8, 8], [574, 386, 6, 6], [596, 396, 4.5, 4.5]], { mid: c.mid, sh: c.sh, hi: c.hi }, { cap: .5 });
  [[612, 408, 40], [616, 396, 8]].forEach(([x, y, a]) => { limbPart(P, [[596, 396, 3, 3], [x, y, 2, 2]], { mid: c.mid, sh: c.sh }, { cap: .4 }); P.add(claw(x, y, a, 11, 4, '#3A2F3A')); });
  // head with bandit mask
  drawHead(P, c, {
    head: [[592, 330], [610, 304], [646, 296], [686, 304], [718, 316], [734, 330], [730, 342], [700, 348], [660, 352], [622, 356], [598, 352], [588, 342]],
    jaw: [[726, 344], [716, 356], [684, 364], [648, 368], [616, 366], [596, 358], [592, 348], [640, 358], [690, 352]],
    eye: [652, 322, 10.5], iris: '#F4B73A', nostril: [722, 326], rimN: 7,
    shade: `<path d="M630,326 Q665,318 700,342" stroke="#5A2E3A" stroke-width="11" fill="none" opacity=".55" stroke-linecap="round"/><path d="M606,312 Q650,296 722,326" stroke="${c.hi}" stroke-width="9" fill="none" opacity=".3"/>`,
    mouth: 'M734,338 Q712,350 676,350 Q640,358 606,354',
    up: [724, 346, 646, 354, 10, 8, 5], low: [650, 360, 712, 352, 7, 7, 4.5], brow: []
  });
  P.add(fuzz([[592, 330, 10, 10], [610, 304, 8, 8], [646, 296, 6, 6]], 1.1, 12, 14, -110, '#FFC27A', 4, 31, { spread: 40 }));
  return '<g transform="translate(-4 -30)">' + P.svg() + '</g>';
}

// ---------- MANIRAPTORAN (Caudipteryx-like) ----------
function maniraptoran() {
  const P = new Piece();
  const c = { top: '#3D8AA8', mid: '#2C6C90', bot: '#4A4A7E', sh: '#2A2458', hi: '#9BE6E8', belly: '#F2E6CC', rim: '#C8F4F0' };
  const dark = { mid: '#8A5A38', sh: '#2A2458', hi: '#B9803E' };
  const q1 = P.grad(P.id('q'), [[0, '#2C6C90'], [.5, '#244E80'], [1, '#1C2858']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  const q2 = P.grad(P.id('r'), [[0, '#E08A3A'], [.5, '#B5602E'], [1, '#6A2E38']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  P.add(ground(410, 550, 210, 17, .35));
  leg(P, { hip: [400, 360], knee: [446, 428], ankle: [404, 484], foot: [414, 538], w: [26, 14, 9, 8.5], c: dark, toeLen: 44, toeW: 9, claw: '#3A2F3A', hallux: true });
  // tail fan (short tail, fan of rectrices)
  fan(P, 262, 322, [[150, 130], [162, 150], [174, 160], [186, 150], [198, 130], [208, 104]], 16, 7, q2, '#F6C27A');
  const spine = [[250, 326, 8, 9], [300, 320, 22, 26], [360, 314, 46, 54], [420, 312, 48, 52], [466, 296, 34, 34], [496, 256, 20, 20], [504, 214, 14, 14], [520, 182, 13, 13]];
  const B = bodyPart(P, spine, c, { rimFrom: 1, rimW: 3 });
  P.add(`<g opacity=".8">` + fuzz(spine, .5, 90, 13, 170, '#6FC0D8', 4.2, 11, { spread: 30 }) + fuzz(spine, 0, 80, 13, 172, '#3D8AA8', 4.2, 12, { spread: 30 }) + `</g>`);
  P.add(fuzz(spine, 1, 70, 13, -100, '#9BE6E8', 4.2, 14, { spread: 45 }) + `<g opacity=".8">` + fuzz(spine, -.6, 50, 12, 165, '#F2E6CC', 3.8, 15, { spread: 30 }) + `</g>`);
  // near leg
  leg(P, { hip: [440, 358], knee: [484, 430], ankle: [446, 486], foot: [456, 540], w: [30, 16, 10, 9], c: { mid: '#A06A3A', sh: c.sh, hi: '#D9A05A' }, toeLen: 46, toeW: 10, claw: '#3A2F3A', hallux: true, thighBulge: 4 });
  P.add(fuzz([[440, 358, 28, 28], [482, 428, 16, 16]], .85, 20, 14, 105, '#6FC0D8', 4, 21, { spread: 30 }));
  // wing quills on arm
  limbPart(P, [[470, 318, 9, 9], [452, 354, 7, 7], [492, 372, 5, 5]], { mid: '#2C6C90', sh: c.sh, hi: c.hi }, { cap: .5 });
  fan(P, 492, 372, [[170, 120], [158, 128], [146, 124], [134, 112], [122, 98]], 14, 7, q1, '#9BE6E8');
  fan(P, 462, 346, [[160, 98], [148, 90], [136, 78]], 13, 6, q2, '#F6C27A');
  limbPart(P, [[492, 372, 4, 4], [514, 384, 2.8, 2.8]], { mid: '#2C6C90', sh: c.sh }, { cap: .4 });
  P.add(claw(514, 384, 40, 14, 5, '#3A2F3A'));
  // small head with a beak-like snout and a few front teeth
  drawHead(P, c, {
    head: [[502, 190], [514, 168], [540, 160], [566, 166], [584, 180], [588, 192], [578, 200], [552, 204], [526, 208], [506, 206]],
    jaw: [[578, 202], [570, 212], [546, 218], [522, 218], [504, 212], [510, 206], [540, 208]],
    eye: [538, 178, 9], iris: '#F2A02E', nostril: [578, 184], rimN: 6,
    shade: `<path d="M514,168 Q550,154 584,184" stroke="${c.hi}" stroke-width="6" fill="none" opacity=".35"/>`,
    mouth: 'M588,194 Q566,204 540,205 Q522,208 508,206',
    up: [582, 198, 556, 202, 4, 8, 4], brow: []
  });
  P.add(fuzz([[504, 190, 8, 8], [520, 168, 6, 6], [545, 160, 6, 6]], 1, 8, 14, -110, '#F6C27A', 3.8, 31, { spread: 40 }));
  return '<g transform="translate(24 0)">' + P.svg() + '</g>';
}

module.exports = { velociraptor, microraptor, coelurosaur, maniraptoran, fan, row };
