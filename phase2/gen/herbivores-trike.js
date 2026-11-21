const K = require('./herbivores-kit');
const { L, f, ribbon, SOFT, skin, arcField, pebbles, bands, shadow, eye, foot, ell, ep, GY } = K;

function trike(o) {
  o = o || {};
  const rand = L.rng(23);
  const bodyR = ribbon([[60, 434, 5], [150, 426, 21], [240, 394, 46], [330, 354, 88], [420, 350, 98], [500, 372, 86], [565, 400, 62]], 5);
  const head = 'M596,338C626,302 676,306 704,334C738,352 768,384 782,412C788,426 778,440 758,446C730,454 700,458 672,455C636,456 600,436 596,338Z';
  const hind = ribbon([[336, 400, 50], [348, 462, 35], [342, 508, 27]], 5);
  const hindFar = ribbon([[286, 400, 44], [296, 460, 32], [288, 506, 25]], 5);
  const fore = ribbon([[512, 412, 44], [532, 464, 34], [526, 508, 28]], 5);
  const foreFar = ribbon([[462, 414, 40], [474, 464, 31], [468, 506, 25]], 5);
  const horn = (x, y, tx, ty, w) => ({ x, y, a: Math.atan2(ty - y, tx - x) * 180 / Math.PI, l: Math.hypot(tx - x, ty - y), w });
  const hornP = h => `M0,${f(-h.w)}C${f(h.l * .4)},${f(-h.w * .7)} ${f(h.l * .8)},${f(-h.w * .25)} ${f(h.l)},0C${f(h.l * .8)},${f(h.w * .22)} ${f(h.l * .4)},${f(h.w * .7)} 0,${f(h.w)}Z`;
  const hn = horn(672, 330, 776, 250, 19), hf = horn(702, 334, 792, 262, 16), nz = horn(744, 380, 778, 352, 11);
  const fr = { cx: 592, cy: 284, rx: 86, ry: 138, rot: -14 };
  const tr = h => `transform="translate(${f(h.x)} ${f(h.y)}) rotate(${f(h.a)})"`;
  if (o.sil) return [bodyR, head, hind, hindFar, fore, foreFar].map(r => `<path d="${r.d || r}"/>`).join('') +
    `<ellipse cx="${fr.cx}" cy="${fr.cy}" rx="${fr.rx}" ry="${fr.ry}" transform="rotate(${fr.rot} ${fr.cx} ${fr.cy})"/>` +
    [hn, nz].map(h => `<path ${tr(h)} d="${hornP(h)}"/>`).join('');
  let s = shadow(400, GY + 2, 330, 24);
  s += `<defs><radialGradient id="frg" cx=".5" cy=".62" r=".7"><stop offset="0" stop-color="#E8683A"/><stop offset=".55" stop-color="#F0954A"/><stop offset="1" stop-color="#FFD072"/></radialGradient>` +
    `<linearGradient id="hrn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B58B5A"/><stop offset=".55" stop-color="#F3E3B8"/><stop offset="1" stop-color="#FFF6DA"/></linearGradient>${SOFT}</defs>`;
  const legC = { hi: '#B7B868', base: '#869A58', lo: '#566A6E', sh: '#2E3868', rim: '#F4EBA0', lite: '#E4E08A' };
  const C = { hi: '#CBC670', base: '#93A152', lo: '#5A6A6C', sh: '#35386A', rim: '#F6EDA4', lite: '#E8E48C' };
  s += `<path ${tr(hf)} d="${hornP(hf)}" fill="#B99A68"/>`;
  [[hindFar, 288, 514], [foreFar, 470, 512]].forEach(([r, x, gy]) => {
    s += skin([r], r, { hi: '#76905A', base: '#5E7A5E', lo: '#44566C', sh: '#262e5a', rim: '#B8CC80', lite: '#B8CC80' }, { y0: 390, y1: 520, belly: false, hl: false });
    s += foot(x + 2, gy, 52, 22, '#566E5C', '#E7D7A8', 3);
  });
  // frill
  let frs = `<g transform="rotate(${fr.rot} ${fr.cx} ${fr.cy}) translate(${fr.cx} ${fr.cy})">`;
  for (let k = 0; k < 17; k++) {
    const th = (-72 - k * 11.5) * Math.PI / 180, x = fr.rx * Math.cos(th), y = fr.ry * Math.sin(th), a = Math.atan2(Math.sin(th) * fr.rx, Math.cos(th) * fr.ry) * 180 / Math.PI;
    frs += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)})"><path d="M-3,-13Q18,0 -3,13Z" fill="#F4E2B4"/><path d="M-3,-13Q9,-3 6,0" stroke="#fff" stroke-width="2" fill="none" opacity=".6"/></g>`;
  }
  frs += `<ellipse rx="${fr.rx}" ry="${fr.ry}" fill="url(#frg)"/><ellipse rx="${fr.rx - 7}" ry="${fr.ry - 7}" fill="none" stroke="#FFE7A8" stroke-width="3" opacity=".6"/>`;
  frs += `<ellipse rx="${f(fr.rx * .78)}" ry="${f(fr.ry * .8)}" fill="none" stroke="#FFE7A8" stroke-width="8" stroke-dasharray="1 17" stroke-linecap="round" opacity=".75"/><ellipse rx="${f(fr.rx * .52)}" ry="${f(fr.ry * .56)}" fill="none" stroke="#B93A2E" stroke-width="7" stroke-dasharray="1 15" stroke-linecap="round" opacity=".4"/>`;
  frs += `<path d="M0,${f(fr.ry * .9)}L0,${f(-fr.ry * .2)}M${f(-fr.rx * .3)},${f(fr.ry * .85)}Q${f(-fr.rx * .5)},${f(fr.ry * .1)} ${f(-fr.rx * .28)},${f(-fr.ry * .35)}" stroke="#A93428" stroke-width="3" fill="none" opacity=".3" stroke-linecap="round"/>`;
  frs += `<path d="M${f(-fr.rx * .9)},${f(-fr.ry * .1)}C${f(-fr.rx * .85)},${f(-fr.ry * .6)} ${f(-fr.rx * .4)},${f(-fr.ry * .95)} ${f(fr.rx * .3)},${f(-fr.ry * .93)}" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".45"/></g>`;
  s += frs;
  const tex = arcField(rand, 120, 300, 700, 480, 30, 26, 11, '#E8E48C', .38, 2.4) + pebbles(rand, 60, 250, 700, 480, 90, 2.5, 6, '#3B5A5C', .22) + pebbles(rand, 150, 260, 640, 400, 40, 2.5, 5, '#F1EDA2', .3) +
    bands(160, 560, 255, 420, 10, '#4E6358', .22, 8, 16, rand) + ell(430, 440, 130, 22, 'fill="#F0F2B0" opacity=".2" filter="url(#soft)"');
  s += skin([bodyR, head], bodyR, C, { y0: 250, y1: 475, tex, sw: 52, hw: 22 });
  s += `<path d="M566,360C556,378 556,404 566,424M544,352C532,376 534,402 544,424M522,352C514,372 514,392 522,408" stroke="#3B4A5E" stroke-width="3" fill="none" stroke-linecap="round" opacity=".28"/>`;
  const lt = (x0, y0, x1, y1) => arcField(rand, x0, y0, x1, y1, 22, 19, 8, '#E8E48C', .4, 2.2) + pebbles(rand, x0, y0, x1, y1, 14, 2, 4, '#3B5A5C', .22);
  s += skin([hind, ep(340, 398, 64, 68)], hind, legC, { y0: 335, y1: 520, tex: lt(300, 340, 400, 510), sw: 34, hw: 12 });
  s += foot(346, GY, 70, 28, '#6F8A58', '#EFE0B0', 4);
  s += skin([fore, ep(512, 406, 48, 52)], fore, legC, { y0: 360, y1: 520, tex: lt(470, 380, 570, 510), sw: 30, hw: 12 });
  s += foot(532, GY, 64, 26, '#6F8A58', '#EFE0B0', 4);
  // horns, beak, face
  s += `<path ${tr(hn)} d="${hornP(hn)}" fill="url(#hrn)"/><path ${tr(hn)} d="M${f(hn.l * .12)},${f(-hn.w * .5)}C${f(hn.l * .4)},${f(-hn.w * .45)} ${f(hn.l * .7)},${f(-hn.w * .2)} ${f(hn.l * .94)},0" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>` +
    `<path ${tr(hn)} d="M0,${-hn.w}L0,${hn.w}" stroke="#8C6A3E" stroke-width="5" opacity=".4"/>`;
  s += `<path ${tr(nz)} d="${hornP(nz)}" fill="url(#hrn)"/>`;
  s += `<path d="M748,404C766,406 784,418 786,430C784,442 772,448 756,448C752,434 750,420 748,404Z" fill="#DDBC76"/><path d="M752,408C768,410 782,420 785,430" stroke="#FFF1C0" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>` +
    `<path d="M784,436C760,446 722,447 690,440" stroke="#2c3a22" stroke-width="3.5" fill="none" stroke-linecap="round" opacity=".7"/>` +
    ell(738, 392, 4, 3, 'fill="#2a3322" opacity=".7"') +
    `<path d="M652,330C664,320 690,326 706,340" stroke="#C9B67A" stroke-width="10" fill="none" stroke-linecap="round" opacity=".55"/>` +
    ell(690, 420, 24, 16, 'fill="#4B5A62" opacity=".25"') +
    eye(676, 352, 8, '#F2B84B', { brow: 2 }) +
    `<path d="M610,350C640,310 680,318 700,334" stroke="#F6EDA4" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>`;
  return s;
}
module.exports = trike;
