// Herbivore illustrations: node phase2/gen/herbivores.js -> phase2/out/art2-herbivores.js
const K = require('./herbivores-kit');
const { L, f, uid, ribbon, poly, sl, at, ell, SOFT, skin, arcField, pebbles, bands, shadow, eye, claw, foot } = K;
const ep = (cx, cy, rx, ry) => `M${f(cx - rx)},${f(cy)}a${f(rx)},${f(ry)} 0 1,0 ${f(rx * 2)},0a${f(rx)},${f(ry)} 0 1,0 ${f(-rx * 2)},0Z`;
const art = {};
const GY = 520;

// transform helper
const place = (s, x, y, sc, o) => `<g transform="translate(${f(x)} ${f(y)}) scale(${sc})"${o ? ' opacity="' + o + '"' : ''}>${s}</g>`;

// ================= STEGOSAURUS =================
function stego(o) {
  o = o || {};
  const rand = L.rng(11);
  const C = { hi: '#A4D46C', base: '#4FA06E', lo: '#2F6A86', sh: '#2A3F78', rim: '#E8F8A8', lite: '#CFF08C' };
  const bodyR = ribbon([[55, 400, 5], [140, 402, 19], [230, 392, 36], [320, 366, 52], [400, 334, 78], [470, 332, 86], [540, 350, 80], [600, 384, 62], [650, 418, 42], [690, 440, 28]], 7);
  const head = 'M676,428C700,421 738,434 762,450C778,460 781,473 766,480C744,489 712,491 690,485C671,479 667,447 676,428Z';
  const hind = ribbon([[420, 392, 40], [436, 455, 30], [428, 508, 21]], 6);
  const hindFar = ribbon([[372, 392, 36], [386, 452, 27], [376, 506, 19]], 6);
  const fore = ribbon([[612, 408, 28], [624, 468, 22], [620, 508, 17]], 6);
  const foreFar = ribbon([[566, 408, 25], [572, 466, 20], [566, 506, 16]], 6);
  if (o.sil) {
    let q = [bodyR, head, hind, hindFar, fore, foreFar, ep(418, 398, 60, 64)].map(r => `<path d="${r.d || r}"/>`).join('');
    for (let i = 0; i < 17; i++) {
      const t = .26 + i * (.60 / 16), a = at(bodyR, t, 'L'), h = 34 + 104 * Math.pow(Math.sin(Math.PI * (i + 1.4) / 18.6), 1.1);
      q += `<path transform="translate(${f(a.x)} ${f(a.y + 8)}) rotate(${f(a.ang - 8)})" d="M${f(-h * .3)},0L${f(-h * .02)},${f(-h)}L${f(h * .34)},0Z"/>`;
    }
    return q;
  }
  let s = '';
  s += shadow(400, GY + 2, 330, 24);
  // --- far plates (behind body)
  const N = 17, plates = [];
  for (let i = 0; i < N; i++) {
    const t = .26 + i * (.60 / (N - 1)), prof = Math.sin(Math.PI * (i + 1.4) / (N + 1.6));
    plates.push({ i, t, h: 34 + 104 * Math.pow(prof, 1.1), far: i % 2 === 1 });
  }
  const plate = (p, near) => {
    const a = at(bodyR, p.t, 'L'), h = p.h * (near ? 1 : .88), w = h * (near ? .62 : .56) + 6;
    const rot = a.ang - 8 - (near ? 0 : 6) + (p.t > .8 ? 8 : 0) * (1 - 0);
    const sink = near ? 8 : 20;
    const bx = a.x + (near ? 0 : 7), by = a.y + sink - (near ? 0 : 6);
    const sh = `M${f(-w / 2)},0C${f(-w * .62)},${f(-h * .5)} ${f(-w * .34)},${f(-h * .95)} ${f(-w * .04)},${f(-h)}C${f(w * .42)},${f(-h * .96)} ${f(w * .66)},${f(-h * .5)} ${f(w / 2)},0Z`;
    let g = `<g transform="translate(${f(bx)} ${f(by)}) rotate(${f(rot)})"><path d="${sh}" fill="url(#${near ? 'plN' : 'plF'})"/>`;
    g += `<path d="M0,${f(-h * .06)}L${f(-w * .02)},${f(-h * .78)}M${f(-w * .26)},${f(-h * .1)}Q${f(-w * .3)},${f(-h * .5)} ${f(-w * .14)},${f(-h * .7)}M${f(w * .26)},${f(-h * .1)}Q${f(w * .3)},${f(-h * .5)} ${f(w * .15)},${f(-h * .72)}` +
      `M${f(-w * .4)},${f(-h * .32)}Q0,${f(-h * .22)} ${f(w * .42)},${f(-h * .3)}" stroke="${near ? '#A92E2B' : '#8A2A33'}" stroke-width="${near ? 3 : 2.4}" fill="none" stroke-linecap="round" opacity=".42"/>`;
    g += `<path d="M${f(w * .5)},${f(-h * .04)}C${f(w * .64)},${f(-h * .5)} ${f(w * .42)},${f(-h * .94)} ${f(w * .02)},${f(-h * 1.0)}" stroke="#FFE9A4" stroke-width="3.2" fill="none" stroke-linecap="round" opacity="${near ? .75 : .45}"/>`;
    g += `<path d="M${f(-w / 2)},0C${f(-w * .2)},${f(-h * .12)} ${f(w * .2)},${f(-h * .12)} ${f(w / 2)},0Z" fill="#6E1F38" opacity=".3"/></g>`;
    return g;
  };
  s += `<defs><linearGradient id="plN" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#D93D33"/><stop offset=".5" stop-color="#F2853A"/><stop offset="1" stop-color="#FFC95A"/></linearGradient>` +
    `<linearGradient id="plF" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9E2E45"/><stop offset=".55" stop-color="#CB5A3E"/><stop offset="1" stop-color="#E69A4C"/></linearGradient>` +
    `<linearGradient id="spk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C79A62"/><stop offset=".5" stop-color="#F1E2B8"/><stop offset="1" stop-color="#FFF6DA"/></linearGradient>${SOFT}</defs>`;
  plates.filter(p => p.far).forEach(p => { s += plate(p, false); });
  // tail spikes (thagomizer): far pair first
  const spike = (x, y, ang, len, w, dark) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${ang})"><path d="M0,${-w}C${f(len * .35)},${f(-w * .8)} ${f(len * .78)},${f(-w * .3)} ${len},0C${f(len * .78)},${f(w * .26)} ${f(len * .35)},${f(w * .78)} 0,${w}Z" fill="${dark ? '#B98F5E' : 'url(#spk)'}"/>` +
    `<path d="M${f(len * .06)},${f(-w * .55)}C${f(len * .4)},${f(-w * .5)} ${f(len * .7)},${f(-w * .2)} ${f(len * .96)},0" stroke="#fff" stroke-width="2.6" fill="none" opacity="${dark ? .3 : .7}" stroke-linecap="round"/><path d="M${f(len * .02)},${-w}L${f(len * .06)},${w}" stroke="#7A5530" stroke-width="3.5" opacity=".5"/></g>`;
  s += spike(112, 392, -150, 96, 11, true) + spike(150, 384, -128, 88, 12, true);
  // far legs
  [[hindFar, 372, 514], [foreFar, 568, 512]].forEach(([r, x, gy]) => {
    s += skin([r], r, { hi: '#3E8E6E', base: '#2F7478', lo: '#244C70', sh: '#1d2a5a', rim: '#8FD0A0', lite: '#8FD0A0' }, { y0: 390, y1: 520, belly: false, hl: false });
    s += foot(x + 4, gy, 44, 20, '#2A6C74', '#E7D7A8', 3);
  });
  // body
  const thigh = ep(418, 398, 60, 64), shoulder = ep(612, 404, 40, 46);
  const tex = arcField(rand, 150, 300, 700, 470, 26, 22, 9, '#CFF08C', .5, 2.4) +
    pebbles(rand, 60, 250, 700, 480, 90, 2, 4.5, '#1F5470', .22) +
    bands(180, 640, 245, 400, 12, '#235F73', .24, 10, 14, rand) +
    ell(560, 440, 100, 20, 'fill="#F0F2A8" opacity=".22" filter="url(#soft)"');
  s += skin([bodyR, head], bodyR, C, { y0: 245, y1: 490, tex, sw: 50, hw: 22 });
  // neck studs and throat shade
  for (let i = 0; i < 5; i++) { const a = at(bodyR, .8 + i * .035, 'L'); s += `<circle cx="${f(a.x + 2)}" cy="${f(a.y + 12)}" r="${5 - i * .4}" fill="#F7C45A"/><circle cx="${f(a.x)}" cy="${f(a.y + 10)}" r="2" fill="#FFF2B8" opacity=".8"/>`; }
  // near legs
  const thighS = skin([thigh], { R: ribbon([[360, 410, 56], [420, 470, 60]]).R, L: ribbon([[360, 360, 40], [430, 340, 60], [480, 380, 50]]).L }, { hi: '#6BB874', base: '#3F8F72', lo: '#2A6784', sh: '#2A3F78', rim: '#DDF59A', lite: '#BDEB88' }, { y0: 335, y1: 465, sw: 40, hw: 14, tex: arcField(rand, 360, 345, 480, 460, 22, 20, 8, '#CFF08C', .5, 2.4) + pebbles(rand, 360, 340, 480, 460, 25, 2, 4, '#1F5470', .2), r0: .2, r1: .9 });
  const legC = { hi: '#74BE76', base: '#43957A', lo: '#2A6286', sh: '#223470', rim: '#DDF59A', lite: '#CFF08C' };
  const lt = (r, x0, y0, x1, y1) => arcField(rand, x0, y0, x1, y1, 20, 18, 7, '#CFF08C', .45, 2.2) + pebbles(rand, x0, y0, x1, y1, 14, 2, 3.5, '#1F5470', .2);
  s += skin([hind], hind, legC, { y0: 400, y1: 520, tex: lt(hind, 395, 420, 460, 510), sw: 26, hw: 10, r0: 0, r1: 1 });
  s += foot(432, GY, 62, 26, '#3F8C78', '#EFE0B0', 3);
  s += thighS;
  s += skin([fore, shoulder], fore, legC, { y0: 380, y1: 520, tex: lt(fore, 590, 400, 650, 510), sw: 22, hw: 9 });
  s += foot(624, GY, 52, 24, '#3F8C78', '#EFE0B0', 3);
  // near plates
  plates.filter(p => !p.far).forEach(p => { s += plate(p, true); });
  // near tail spikes
  s += spike(86, 396, -112, 108, 13, false) + spike(124, 388, -96, 118, 14, false);
  // head details
  s += `<path d="M742,444C760,448 778,458 780,470C779,478 771,482 760,483C751,471 745,458 742,444Z" fill="#E3C27C"/>` +
    `<path d="M744,447C760,452 775,461 779,470" stroke="#FFF1C0" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>` +
    `<path d="M768,476C746,483 722,484 702,477" stroke="#25402c" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".7"/>` +
    `<path d="M700,478C702,472 706,470 710,472" stroke="#25402c" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".5"/>` +
    ell(742, 453, 3.6, 2.6, 'fill="#1d3322" opacity=".7"') +
    ell(704, 468, 17, 11, 'fill="#2D6E84" opacity=".35"') +
    eye(718, 456, 6.8, '#F6C250', { brow: 1 }) +
    `<path d="M690,432C706,428 728,434 748,445" stroke="#E8F8A8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>`;
  return s;
}
art.stegosaurus = L.wrap('stegosaurus', stego(), { label: 'Stegosaurus with 17 plates and a four-spiked tail' });

const trike = require('./herbivores-trike');
art.triceratops = L.wrap('triceratops', `<g transform="translate(-24 0)">${trike()}</g>`, { label: 'Triceratops with a three-horned face and large frill' });

const anky = require('./herbivores-anky');
art.ankylosaurus = L.wrap('ankylosaurus', anky(), { label: 'Ankylosaurus with armour plates and a tail club' });

L.writeFile('herbivores', art);
