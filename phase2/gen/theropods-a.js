// T. rex, tyrannosaur, allosaurus, coelophysis
const T = require('./theropods-lib');
const { drawHead, Piece, bodyPart, limbPart, tube, band, edge, claw, teeth, eye, ground, fuzz, leg, f } = T;

// ---------- T. REX ----------
function trex(o) {
  o = o || {};
  const P = new Piece();
  const c = o.c || { top: '#82A04F', mid: '#5E8147', bot: '#3C5A58', sh: '#2A3A62', hi: '#D6E37A', belly: '#EAD79A', rim: '#EEF5A8' };
  const dark = o.dark || { mid: '#46623F', sh: '#25304F', hi: '#7C9A52' };
  const lite = { mid: c.mid, sh: c.sh, hi: c.hi };
  const stripe = o.stripe || '#34502F';
  P.add(ground(410, 548, 270, 22, .35));

  // far leg
  leg(P, { hip: [345, 345], knee: [392, 418], ankle: [346, 480], foot: [356, 532], w: [50, 28, 17, 15], c: dark, toeLen: 54, toeW: 12, claw: '#2E2A34', hallux: true });

  // tail + body + neck
  const spine = [[50, 352, 3, 3], [130, 340, 13, 15], [210, 320, 32, 36], [290, 302, 58, 66], [370, 294, 76, 84], [450, 298, 76, 80], [510, 288, 56, 56], [552, 250, 42, 40], [584, 212, 38, 36]];
  const tex = o.fuzzy ? 'none' : P.scales(P.id('sc'), '#1F3A3A', 16, 14, 3, .3, '#E6F09A');
  const B = bodyPart(P, spine, c, { tex, rimFrom: 1, rimW: 3.2 });
  // dorsal stripes
  let st = '';
  [[120, 316, 80], [170, 300, 90], [220, 280, 100], [275, 260, 110], [330, 244, 120], [390, 238, 120], [445, 244, 110]].forEach(([x, y, l], i) => {
    st += `M${x},${y}q${14 + (i % 2) * 6},${l * .45} ${i % 2 ? 6 : -2},${l}`;
  });
  P.add(`<g clip-path="${B.clip}"><path d="${st}" stroke="${stripe}" stroke-width="11" fill="none" stroke-linecap="round" opacity=".42"/>` +
    `<path d="M260,372 Q380,404 520,372" stroke="#8E7BAA" stroke-width="3" fill="none" opacity=".35"/><ellipse cx="460" cy="390" rx="90" ry="22" fill="#fff6c8" opacity=".25"/></g>`);
  // little feather fuzz on neck/back (adult T. rex: mostly scaly)
  P.add(fuzz(spine, .98, 26, 13, -60, '#D9B65A', 3.2, 4, { spread: 36 }));

  if (o.fuzzy) {
    // Yutyrannus-style protofeather coat: layered tufts swept back along the body
    const cols = o.fz;
    P.add(`<g opacity=".7">` + fuzz(spine, .5, 85, 13, 172, cols[2], 4.2, 11, { spread: 30 }) + fuzz(spine, 0, 85, 13, 172, cols[1], 4.2, 12, { spread: 30 }) + fuzz(spine, -.55, 70, 12, 165, cols[2], 4, 13, { spread: 30 }) + `</g>`);
    P.add(fuzz(spine, .98, 70, 15, -105, cols[0], 4.4, 14, { spread: 40 }) + fuzz(spine, -.98, 60, 12, 150, cols[1], 4, 15, { spread: 40 }));
    P.add(`<g opacity=".8">` + fuzz(spine.slice(0, 4), .6, 40, 15, 178, cols[0], 4.4, 16, { spread: 20 }) + `</g>`);
    P.add(fuzz(spine.slice(3), .7, 40, 14, -140, cols[3], 3.4, 17, { spread: 40 }));
  }
  // ---- near leg ----
  leg(P, { hip: [405, 338], knee: [458, 424], ankle: [408, 490], foot: [420, 535], w: [66, 36, 20, 18], c: lite, toeLen: 62, toeW: 14, claw: '#3A2F3A', hallux: true, thighBulge: 8 });
  if (o.fuzzy) P.add(fuzz([[405, 338, 40, 40], [440, 392, 36, 36]], .9, 28, 13, 120, o.fz[0], 4, 21, { spread: 40 }) + fuzz([[405, 338, 40, 40], [440, 392, 36, 36]], -.9, 24, 12, 100, o.fz[1], 4, 22, { spread: 40 }));
  // thigh muscle shading
  P.add(`<ellipse cx="405" cy="385" rx="34" ry="52" fill="#2A3A62" opacity=".16" transform="rotate(-25 405 385)"/>`);

  // ---- small two-fingered arm (palms face each other, not pronated) ----
  limbPart(P, [[512, 326, 14, 14], [530, 352, 10, 10], [548, 362, 7, 7]], lite, { cap: .5 });
  limbPart(P, [[546, 361, 4.5, 4.5], [562, 372, 3, 3]], lite, { cap: .4 });
  limbPart(P, [[546, 362, 4.5, 4.5], [566, 362, 3, 3]], lite, { cap: .4 });
  P.add(claw(560, 371, 30, 13, 5.5, '#3A2F3A') + claw(564, 362, 0, 13, 5.5, '#3A2F3A'));

  // ---- head (scaled up: T. rex has a huge skull) ----
  P.add('<g transform="translate(-140 -41) scale(1.22)">');
  const jaw = [[742, 226], [738, 242], [706, 258], [654, 271], [606, 274], [576, 262], [572, 240], [612, 246], [662, 246], [706, 238]];
  const jd = T.smooth(jaw, true);
  P.add(`<path d="${jd}" fill="${c.bot}"/>`);
  P.add(`<path d="${T.smooth([[700, 242], [740, 232], [736, 244], [706, 258], [654, 271], [606, 274], [640, 262]], true)}" fill="${c.belly}" opacity=".8"/>`);
  P.add(`<path d="M576,262 Q604,276 654,271 Q706,262 738,242" stroke="${c.rim}" stroke-width="2.4" fill="none" opacity=".55" stroke-linecap="round"/>`);
  // lower teeth
  P.add(teeth(660, 247, 722, 240, 8, 11, 7, -1, '#F7EBCB'));
  const head = [[574, 178], [598, 150], [648, 140], [694, 158], [732, 178], [754, 193], [758, 210], [744, 224], [700, 232], [650, 240], [608, 240], [580, 228], [566, 204]];
  const hd = T.smooth(head, true), hg = P.grad(P.id('hg'), [[0, c.top], [.6, c.mid], [1, c.bot]]);
  const hc = P.clip(P.id('hc'), hd);
  P.add(`<path d="${hd}" fill="${hg}"/>`);
  P.add(`<g clip-path="${hc}"><path d="${hd}" fill="${tex}"/>` +
    `<path d="M600,150 Q660,132 740,184 L752,196 Q690,168 640,160 Z" fill="${c.hi}" opacity=".35"/>` +
    `<ellipse cx="620" cy="214" rx="48" ry="30" fill="#2A3A62" opacity=".22"/>` +
    `<path d="M700,232 L760,226 L758,215 Q730,226 700,222Z" fill="#E9D69C" opacity=".6"/>` +
    // brow ridge + cheek
    `<path d="M618,160 Q640,148 668,156 Q644,164 626,172Z" fill="#2E4A3A" opacity=".55"/>` +
    `<path d="M598,215 Q640,240 690,226" stroke="#2A3A62" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/>` +
    `</g>`);
  P.add(`<path d="M574,178 Q598,148 648,140 Q694,156 732,178 L754,193" stroke="${c.rim}" stroke-width="3.2" fill="none" opacity=".8" stroke-linecap="round" stroke-linejoin="round"/>`);
  // mouth line with slight smile, upper teeth
  P.add(`<path d="M758,212 Q730,238 690,236 Q650,246 614,241" stroke="#23283E" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".8"/>`);
  P.add(teeth(724, 232, 654, 241, 8, 14, 8, 1, '#FFF6E0'));
  // nostril, eye
  P.add(`<ellipse cx="738" cy="196" rx="7" ry="4" fill="#1F2438" transform="rotate(28 738 196)"/>`);
  P.add(`<path d="M640,170 Q655,158 676,166" stroke="#2A3A62" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/>`);
  P.add(eye(648, 176, 10.5, '#F4B73A'));
  P.add(`<path d="M634,166 Q650,154 668,162" stroke="#1F2A3A" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".5"/>`);
  if (o.fuzzy) P.add(fuzz([[574, 190, 20, 20], [600, 156, 16, 16], [650, 146, 12, 12], [700, 162, 10, 10]], 1.1, 30, 13, -110, o.fz[0], 4, 31, { spread: 50 }) + fuzz([[575, 200, 20, 20], [600, 235, 12, 12]], 0, 14, 13, 130, o.fz[2], 3.6, 32, { spread: 50 }));
  P.add('</g>');
  if (o.fuzzy) P.add(`<path d="M512,326 L548,362 L536,378 Z" fill="${o.fz[1]}" opacity=".0"/>` + fuzz([[512, 326, 10, 10], [548, 362, 6, 6]], .5, 8, 16, 60, o.fz[0], 4, 41, { spread: 40 }));
  if (o.extra) o.extra(P, { spine, head });
  return `<g transform="translate(26 26) scale(.95)">` + P.svg() + `</g>`;
}

function tyrannosaur() {
  return trex({
    fuzzy: true, stripe: '#8A3E24', dark: { mid: '#9A4A26', sh: '#4A2848', hi: '#C4702F' },
    fz: ['#FFC879', '#E58F45', '#C4602F', '#FFE2A8'],
    c: { top: '#E58F45', mid: '#C4602F', bot: '#8A3F4E', sh: '#4A2848', hi: '#FFD07A', belly: '#F8E4B8', rim: '#FFE7A0' }
  });
}

const A2 = require('./theropods-a2');
module.exports = { trex, tyrannosaur, allosaurus: A2.allosaurus, coelophysis: A2.coelophysis, coeloRaw: A2.coelophysisRaw };
