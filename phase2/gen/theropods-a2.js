// allosaurus + coelophysis
const T = require('./theropods-lib');
const { drawHead, Piece, bodyPart, limbPart, claw, ground, fuzz, leg } = T;

function allosaurus() {
  const P = new Piece();
  const c = { top: '#D49648', mid: '#B8743A', bot: '#6F4A5C', sh: '#3E2E52', hi: '#FFD27E', belly: '#F4E0B0', rim: '#FFE6A8' };
  const dark = { mid: '#8E5A34', sh: '#3E2E52', hi: '#B8743A' };
  P.add(ground(410, 548, 260, 21, .35));
  leg(P, { hip: [330, 342], knee: [378, 412], ankle: [338, 476], foot: [348, 531], w: [42, 24, 15, 13], c: dark, toeLen: 50, toeW: 11, claw: '#2E2A34', hallux: true });
  const spine = [[50, 362, 3, 3], [130, 348, 11, 13], [210, 328, 28, 32], [290, 310, 50, 56], [370, 302, 64, 70], [440, 304, 62, 64], [490, 292, 42, 42], [528, 256, 32, 30], [558, 224, 28, 26]];
  const tex = P.scales(P.id('sc'), '#3E2A3A', 16, 14, 3, .28, '#FFE9A8');
  const B = bodyPart(P, spine, c, { tex, rimFrom: 1, rimW: 3.2 });
  let st = '';
  [[110, 336, 60], [150, 322, 70], [195, 308, 80], [245, 292, 90], [300, 272, 100], [355, 262, 105], [410, 264, 100], [460, 266, 90]].forEach(([x, y, l], i) => { st += `M${x},${y}q${12 + (i % 2) * 6},${l * .45} ${i % 2 ? 6 : -2},${l}`; });
  P.add(`<g clip-path="${B.clip}"><path d="${st}" stroke="#5B3226" stroke-width="12" fill="none" stroke-linecap="round" opacity=".42"/><ellipse cx="440" cy="378" rx="80" ry="20" fill="#fff6c8" opacity=".22"/></g>`);
  leg(P, { hip: [392, 340], knee: [444, 412], ankle: [398, 480], foot: [410, 535], w: [54, 30, 17, 15], c: { mid: c.mid, sh: c.sh, hi: c.hi }, toeLen: 58, toeW: 13, claw: '#3A2F3A', hallux: true, thighBulge: 6 });
  // three-fingered arm, palms facing each other
  const ac = { mid: c.mid, sh: c.sh, hi: c.hi };
  limbPart(P, [[484, 318, 12, 12], [502, 352, 9, 9], [526, 366, 7, 7]], ac, { cap: .5 });
  [[548, 380], [554, 368], [546, 356]].forEach(([x, y], i) => {
    limbPart(P, [[525, 366, 4.2, 4.2], [x, y, 2.8, 2.8]], ac, { cap: .4 });
    P.add(claw(x, y, [40, 5, -30][i], 17, 5.5, '#3A2F3A', '#9a8a7a'));
  });
  const brow = [
    `<path d="M588,176 Q604,150 636,160 Q650,166 660,172 Q626,170 604,184Z" fill="#9B5C34"/><path d="M590,174 Q606,153 634,162" stroke="${c.rim}" stroke-width="2.4" fill="none" opacity=".7" stroke-linecap="round"/>`,
    `<path d="M660,176 Q690,160 720,182" stroke="#6F3F2E" stroke-width="7" fill="none" stroke-linecap="round" opacity=".5"/>`
  ];
  drawHead(P, c, {
    head: [[540, 198], [568, 172], [620, 164], [680, 176], [740, 196], [764, 208], [764, 222], [748, 232], [690, 236], [630, 240], [585, 240], [552, 228], [538, 212]],
    jaw: [[750, 234], [744, 247], [700, 257], [650, 264], [600, 264], [566, 254], [552, 236], [600, 246], [660, 248], [708, 242]],
    eye: [626, 184, 8.5], iris: '#F2B032', nostril: [746, 206], tex,
    shade: `<ellipse cx="610" cy="214" rx="50" ry="22" fill="#3E2E52" opacity=".22"/><path d="M580,176 Q650,154 740,196" stroke="${c.hi}" stroke-width="12" fill="none" opacity=".25"/>`,
    mouth: 'M764,224 Q740,238 696,237 Q650,247 608,241',
    up: [738, 234, 660, 241, 11, 13, 7], low: [668, 249, 730, 243, 9, 10, 6], brow
  });
  return `<g transform="translate(0 6)">` + P.svg() + '</g>';
}

function coelophysisBuild(o) {
  o = o || {};
  const P = new Piece(o.pre || '');
  const c = o.c || { top: '#E2C08C', mid: '#C4A06E', bot: '#85729A', sh: '#4A4066', hi: '#FFEDB4', belly: '#F6EBD0', rim: '#FFF3C8' };
  const dark = { mid: '#A58456', sh: '#4A4066', hi: '#D8B880' };
  if (!o.noGround) P.add(ground(400, 540, 230, 18, .35));
  leg(P, { hip: [326, 324], knee: [372, 388], ankle: [334, 456], foot: [344, 531], w: [22, 13, 9, 8.5], c: dark, toeLen: 50, toeW: 9.5, claw: '#4A3A30', hallux: true });
  const spine = [[40, 336, 3, 3], [120, 326, 8, 9], [200, 316, 16, 19], [280, 308, 28, 32], [340, 302, 34, 36], [392, 296, 32, 32], [430, 278, 21, 20], [458, 242, 16, 16], [476, 208, 13, 13]];
  const tex = P.scales(P.id('sc'), '#5A4660', 13, 11, 2.2, .25, '#FFF0C0');
  const B = bodyPart(P, spine, c, { tex, rimFrom: 1, rimW: 2.8 });
  let st = '';
  [[100, 322, 26], [140, 316, 30], [180, 306, 36], [222, 296, 44], [268, 286, 52], [316, 276, 58], [366, 270, 52]].forEach(([x, y, l], i) => { st += `M${x},${y}q${8 + (i % 2) * 4},${l * .45} ${i % 2 ? 4 : -2},${l}`; });
  P.add(`<g clip-path="${B.clip}"><path d="${st}" stroke="#6E4E40" stroke-width="8" fill="none" stroke-linecap="round" opacity=".4"/></g>`);
  leg(P, { hip: [356, 320], knee: [404, 384], ankle: [364, 452], foot: [374, 535], w: [26, 14, 9.5, 9], c: { mid: c.mid, sh: c.sh, hi: c.hi }, toeLen: 54, toeW: 10, claw: '#4A3A30', hallux: true, thighBulge: 4 });
  const ac = { mid: c.mid, sh: c.sh, hi: c.hi };
  limbPart(P, [[402, 316, 8, 8], [418, 342, 6.5, 6.5], [448, 350, 5, 5]], ac, { cap: .5 });
  [[472, 360], [478, 349], [470, 340]].forEach(([x, y], i) => {
    limbPart(P, [[447, 350, 3, 3], [x, y, 2, 2]], ac, { cap: .4 });
    P.add(claw(x, y, [35, 5, -28][i], 12, 4, '#4A3A30'));
  });
  drawHead(P, c, {
    head: [[458, 206], [474, 188], [506, 182], [544, 188], [578, 198], [600, 206], [600, 216], [584, 222], [540, 224], [500, 226], [470, 224], [454, 216]],
    jaw: [[588, 220], [582, 230], [548, 238], [506, 240], [472, 238], [452, 228], [452, 218], [500, 228], [546, 226], [578, 224]],
    eye: [508, 200, 9], iris: '#F28A2E', nostril: [588, 208], tex,
    shade: `<ellipse cx="490" cy="218" rx="40" ry="14" fill="#4A4066" opacity=".22"/><path d="M470,192 Q530,176 592,204" stroke="${c.hi}" stroke-width="8" fill="none" opacity=".3"/>`,
    mouth: 'M600,214 Q580,226 540,225 Q510,230 476,226',
    up: [584, 222, 520, 226, 12, 8, 4.5], low: [530, 228, 580, 224, 9, 7, 4], rimN: 6
  });
  return P.svg();
}
function coelophysis() { return '<g transform="translate(70 18) scale(1.1)">' + coelophysisBuild() + '</g>'; }
module.exports = { allosaurus, coelophysis, coelophysisRaw: coelophysisBuild };
