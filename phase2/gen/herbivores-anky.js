const K = require('./herbivores-kit');
const { L, f, ribbon, poly, sl, at, SOFT, skin, pebbles, shadow, eye, foot, ell, ep, GY } = K;

function anky(o) {
  o = o || {};
  const rand = L.rng(37);
  const bodyR = ribbon([[100, 446, 13], [165, 436, 19], [228, 418, 30], [305, 398, 52], [385, 378, 82], [470, 376, 90], [560, 390, 78], [622, 408, 54]], 5);
  const head = 'M612,388C646,380 692,392 726,410C752,424 762,442 748,457C724,469 688,472 658,464C632,456 614,436 612,388Z';
  const hind = ribbon([[392, 432, 46], [404, 482, 36], [398, 512, 30]], 5);
  const hindFar = ribbon([[336, 432, 42], [346, 482, 33], [340, 510, 28]], 5);
  const fore = ribbon([[566, 436, 40], [584, 484, 31], [578, 512, 26]], 5);
  const foreFar = ribbon([[514, 438, 38], [526, 484, 30], [520, 510, 25]], 5);
  const club = { cx: 86, cy: 444, rx: 50, ry: 38 };
  if (o.sil) return [bodyR, head, hind, hindFar, fore, foreFar].map(r => `<path d="${r.d || r}"/>`).join('') + `<ellipse cx="${club.cx}" cy="${club.cy}" rx="${club.rx}" ry="${club.ry}"/>`;
  let s = shadow(400, GY + 2, 340, 24);
  s += `<defs><linearGradient id="osg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF0C4"/><stop offset=".55" stop-color="#E4C890"/><stop offset="1" stop-color="#B78A5C"/></linearGradient>` +
    `<linearGradient id="osd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8CE98"/><stop offset=".6" stop-color="#C79C6A"/><stop offset="1" stop-color="#8E6446"/></linearGradient>` +
    `<g id="sc"><ellipse cx="0" cy="2.5" rx="18" ry="12.5" fill="#4A2E36" opacity=".45"/><ellipse rx="17" ry="12" fill="url(#osg)"/><path d="M-14,1Q0,-9 14,1" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/><path d="M-12,3Q0,10 12,3" stroke="#8A5A3A" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".45"/><path d="M0,-9L0,9" stroke="#9A6E48" stroke-width="2.2" opacity=".35"/></g>` +
    `<g id="sd"><ellipse cx="0" cy="2.5" rx="18" ry="12.5" fill="#3A2630" opacity=".45"/><ellipse rx="17" ry="12" fill="url(#osd)"/><path d="M-14,1Q0,-9 14,1" stroke="#FFE9B8" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".5"/><path d="M0,-9L0,9" stroke="#7A5238" stroke-width="2.2" opacity=".35"/></g>` +
    `<linearGradient id="clb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4E2B0"/><stop offset=".6" stop-color="#CBA070"/><stop offset="1" stop-color="#8E6A52"/></linearGradient>${SOFT}</defs>`;
  const C = { hi: '#D4A466', base: '#A56E46', lo: '#62495E', sh: '#382C5C', rim: '#FFDCA2', lite: '#F2C282' };
  const legC = { hi: '#B98258', base: '#8E5C42', lo: '#5A4558', sh: '#352A58', rim: '#FFDCA2', lite: '#F2C282' };
  // far spikes along belly line + far legs
  [[hindFar, 340, 512], [foreFar, 520, 510]].forEach(([r, x, gy]) => {
    s += skin([r], r, { hi: '#7C5640', base: '#684A46', lo: '#4A3A54', sh: '#2a2050', rim: '#C99A68', lite: '#C99A68' }, { y0: 420, y1: 520, belly: false, hl: false });
    s += foot(x + 2, gy, 52, 20, '#5E4448', '#E7D7A8', 3);
  });
  // tail club (behind tail join)
  const cl = `<g transform="translate(${club.cx} ${club.cy})"><ellipse cx="2" cy="6" rx="${club.rx}" ry="${club.ry}" fill="#4A2E4E" opacity=".35"/><ellipse rx="${club.rx}" ry="${club.ry}" fill="url(#clb)"/>` +
    `<path d="M-30,-22Q-6,-34 26,-24M-40,-4Q0,-14 42,-6M-38,14Q0,6 40,14" stroke="#8A5C40" stroke-width="3" fill="none" stroke-linecap="round" opacity=".4"/>` +
    `<path d="M-6,-34L-6,32M-26,-26L-30,22M16,-30L20,28" stroke="#8A5C40" stroke-width="2.5" opacity=".28"/>` +
    `<path d="M-34,-18Q-14,-34 18,-32" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".6"/><path d="M${club.rx - 6},-20L${club.rx + 6},-34L${club.rx - 12},-4Z" fill="#E4C890"/><path d="M${club.rx - 6},22L${club.rx + 8},32L${club.rx - 14},4Z" fill="#B88C5C"/></g>`;
  s += cl;
  // spikes along back (before body so base is covered)
  let sp = '';
  const spike = (a, len, w, col, flip) => `<g transform="translate(${f(a.x)} ${f(a.y)}) rotate(${f(a.ang + (flip ? 180 : 0))})"><path d="M${f(-w)},4Q${f(-w * .5)},${f(len * .6)} 0,${f(-len)}" transform="scale(1 -1)" fill="none"/><path d="M${f(-w)},3L0,${f(-len)}L${f(w)},3Z" fill="${col}"/><path d="M${f(-w * .6)},0L0,${f(-len * .9)}" stroke="#fff" stroke-width="2.4" opacity=".5" stroke-linecap="round"/></g>`;
  for (let i = 0; i < 12; i++) {
    const t = .3 + i * .062, a = at(bodyR, t, 'L'), len = 20 + 12 * Math.sin(Math.PI * (i + 1) / 13);
    sp += spike({ x: a.x, y: a.y + 5, ang: a.ang }, len, 9, i % 2 ? '#E4C890' : '#F2DCAC');
  }
  // big shoulder spike
  const sh = at(bodyR, .78, 'L');
  sp += spike({ x: sh.x + 4, y: sh.y + 8, ang: sh.ang + 12 }, 50, 13, '#F2DCAC');
  s += sp;
  // body + scutes
  let sc = '';
  const rows = 4;
  for (let c = 0; c < 15; c++) {
    const t = .27 + c * .046, a = at(bodyR, t, 'L'), wb = a.w;
    for (let r = 0; r < rows; r++) {
      const y = a.y + 14 + r * (wb * 1.55 / rows) + (c % 2) * 6, x = a.x + r * 3 + (c % 2) * 6;
      const k = (r === 0 ? .8 : 1) * (.8 + .5 * Math.min(1, wb / 80));
      if (y > a.y + wb * 1.5) continue;
      sc += `<use href="#${(r + c) % 3 === 1 ? 'sd' : 'sc'}" transform="translate(${f(x)} ${f(y)}) rotate(${f(a.ang * .6)}) scale(${f(k)} ${f(k * (r === 0 ? .8 : 1))})"/>`;
    }
  }
  const post = `<path d="${poly(sl(bodyR.R, .25, 1), false)}" stroke="#2F2458" stroke-width="56" fill="none" opacity=".3" filter="url(#soft)" stroke-linejoin="round"/>` +
    `<path d="${poly(sl(bodyR.L, .15, .95), false)}" stroke="#FFE2A8" stroke-width="12" fill="none" opacity=".3" filter="url(#soft)" transform="translate(0 6)"/>`;
  const tex = pebbles(rand, 100, 330, 740, 470, 80, 2, 4.5, '#3A2640', .2) + pebbles(rand, 100, 330, 740, 470, 40, 2, 4, '#F4C78A', .25);
  s += skin([bodyR, head], bodyR, C, { y0: 285, y1: 475, tex: tex + sc, post, belly: false, hl: false });
  // lateral spikes along the flank (point down/out)
  for (let i = 0; i < 9; i++) {
    const t = .34 + i * .068, a = at(bodyR, t, 'c');
    s += spike({ x: a.x, y: a.y + a.w * .42, ang: a.ang }, 26 + 8 * Math.sin(Math.PI * (i + 1) / 10), 9, i % 2 ? '#CFA874' : '#E6CB98', true);
  }
  // neck armour bands
  for (let i = 0; i < 3; i++) { const a = at(bodyR, .93 + i * .03, 'L'); s += `<use href="#sd" transform="translate(${f(a.x - 2)} ${f(a.y + 18)}) rotate(70) scale(1.15 .8)"/>`; }
  // legs
  const lt = pebbles(rand, 340, 440, 620, 515, 22, 2, 3.5, '#3A2640', .2);
  s += skin([hind, ep(396, 436, 54, 40)], hind, legC, { y0: 395, y1: 520, tex: lt, sw: 30, hw: 12 });
  s += foot(404, GY, 60, 22, '#8E5C42', '#EFE0B0', 3);
  s += skin([fore, ep(570, 440, 44, 36)], fore, legC, { y0: 400, y1: 520, tex: lt, sw: 28, hw: 12 });
  s += foot(584, GY, 56, 21, '#8E5C42', '#EFE0B0', 3);
  // head: bony horns at rear, beak, eye
  const hornB = (x, y, tx, ty, w, col) => `<path d="M${x},${y - w}L${tx},${ty}L${x + w * .5},${y + w * .8}Z" fill="${col}"/>`;
  s += hornB(652, 392, 626, 358, 12, '#C99A68') + hornB(670, 392, 652, 354, 14, '#F0D8A4') + `<path d="M670,380L654,358" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>`;
  s += `<path d="M722,432C740,432 752,442 750,454C744,460 732,462 718,458Z" fill="#E4C890" opacity=".85"/>` +
    `<path d="M750,452C724,464 690,466 662,458" stroke="#2c2230" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".6"/>` +
    ell(736, 424, 3.6, 2.6, 'fill="#2a2030" opacity=".7"') +
    ell(690, 450, 20, 10, 'fill="#4A3860" opacity=".3"') +
    `<path d="M660,404C676,394 704,400 720,414" stroke="#F0D8A4" stroke-width="9" fill="none" stroke-linecap="round" opacity=".55"/>` +
    eye(690, 424, 7.5, '#F2B84B', { brow: 3, browCol: '#4A2E26' }) +
    `<circle cx="700" cy="408" r="5" fill="#EBD3A0"/><circle cx="716" cy="414" r="4.5" fill="#EBD3A0"/><circle cx="672" cy="416" r="4" fill="#EBD3A0"/>`;
  return s;
}
module.exports = anky;
