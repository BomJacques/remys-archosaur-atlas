// Scenes group: 6 era backdrops + logo + bg-leaf + bg-bones.   node phase2/gen/scenes.js
const L = require('../lib');
const { f, rng } = L;

// ---------------------------------------------------------------- builder
function mk() {
  const D = [], B = [];
  return {
    D, B,
    add: s => B.push(s),
    grad(id, stops, o) {
      o = o || {};
      D.push(`<linearGradient id="${id}" x1="${o.x1 || 0}" y1="${o.y1 || 0}" x2="${o.x2 || 0}" y2="${o.y2 === undefined ? 1 : o.y2}">` +
        stops.map(([off, c, op]) => `<stop offset="${off}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('') + `</linearGradient>`);
    },
    rgrad(id, stops, cx, cy, r) {
      D.push(`<radialGradient id="${id}" cx="${cx || .5}" cy="${cy || .5}" r="${r || .5}">` +
        stops.map(([off, c, op]) => `<stop offset="${off}" stop-color="${c}" stop-opacity="${op === undefined ? 1 : op}"/>`).join('') + `</radialGradient>`);
    },
    out() { return `<defs>${D.join('')}</defs>${B.join('')}`; }
  };
}

// smooth ridge line across the canvas filled down to the bottom
function ridge(seed, y, amp, fill, step, o) {
  o = o || {};
  const r = rng(seed); step = step || 90;
  const pts = [];
  for (let x = -60; x <= 860 + step; x += step) pts.push([x, y + (r() - .5) * 2 * amp + (o.slope ? (x - 400) * o.slope : 0)]);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], dx = (x1 - x0) / 2;
    d += ` C${f(x0 + dx)},${f(y0)} ${f(x1 - dx)},${f(y1)} ${f(x1)},${f(y1)}`;
  }
  d += ` L${f(pts[pts.length - 1][0])},${o.bottom || 620} L-60,${o.bottom || 620} Z`;
  return `<path d="${d}" fill="${fill}"${o.op ? ` opacity="${o.op}"` : ''}/>`;
}
// flat-topped mesas
function mesas(seed, y, fill, fillLite, n) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = 20 + i * (760 / n) + r() * 50, w = 70 + r() * 90, h = 34 + r() * 46, t = w * .12;
    s += `<path d="M${f(x)},${y + 10} L${f(x + t)},${f(y - h)} L${f(x + w - t)},${f(y - h)} L${f(x + w)},${y + 10} Z" fill="${fill}"/>`;
    s += `<path d="M${f(x)},${y + 10} L${f(x + t)},${f(y - h)} L${f(x + w * .4)},${f(y - h)} L${f(x + w * .25)},${y + 10} Z" fill="${fillLite}" opacity=".55"/>`;
  }
  return s;
}
function rays(sx, sy, targets, w, op) {
  return targets.map(([tx, tw]) => `<path d="M${sx - w},${sy} L${sx + w},${sy} L${tx + tw},640 L${tx - tw},640 Z" fill="url(#ray)" opacity="${op}"/>`).join('');
}
function haze(S, id, y, h, col, op) {
  S.grad(id, [[0, col, 0], [.55, col, op], [1, col, 0]]);
  return `<rect x="0" y="${y}" width="800" height="${h}" fill="url(#${id})"/>`;
}
function stars(r, n, col, op) {
  let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${f(r() * 800)}" cy="${f(r() * 200)}" r="${f(.8 + r() * 1.4)}" fill="${col}" opacity="${f(op * (.4 + r() * .6))}"/>`;
  return s;
}
function cloud(x, y, s, col, op) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${col}" opacity="${op}"><ellipse cx="0" cy="0" rx="60" ry="14"/><ellipse cx="-22" cy="-10" rx="30" ry="14"/><ellipse cx="14" cy="-15" rx="34" ry="17"/><ellipse cx="38" cy="-4" rx="26" ry="10"/></g>`;
}

// ---------------------------------------------------------------- plants
// feathery frond; local frame points +x, curl bends it
function frond(x, y, len, ang, curl, col, lw, n, spine) {
  const pts = [];
  const bez = t => [2 * (1 - t) * t * len * .5 + t * t * len, 2 * (1 - t) * t * (-len * .35) + t * t * curl];
  // quad: P0=(0,0) C=(len*.5,-len*.35) P1=(len,curl)
  const tan = t => { const dx = 2 * (1 - t) * len * .5 + 2 * t * (len - len * .5), dy = 2 * (1 - t) * (-len * .35) + 2 * t * (curl + len * .35); const m = Math.hypot(dx, dy); return [dx / m, dy / m]; };
  let d = '';
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1) * .96 + .02, [px, py] = bez(t), [tx, ty] = tan(t);
    const ll = lw * (1.05 - t * .8);
    [1, -1].forEach(sd => {
      const nx = -ty * sd, ny = tx * sd;
      d += `M${f(px)},${f(py)} l${f(nx * ll + tx * ll * .7)},${f(ny * ll + ty * ll * .7)}`;
    });
  }
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><path d="${d}" stroke="${col}" stroke-width="${f(Math.max(2, lw * .22))}" stroke-linecap="round" fill="none"/>` +
    `<path d="M0,0 Q${f(len * .5)},${f(-len * .35)} ${f(len)},${f(curl)}" stroke="${spine || col}" stroke-width="2.4" stroke-linecap="round" fill="none"/></g>`;
}
function fern(x, y, s, c1, c2, nf, seed) {
  const r = rng(seed || 7); let o = '';
  nf = nf || 7;
  for (let i = 0; i < nf; i++) {
    const a = -165 + i * (150 / (nf - 1)) + (r() - .5) * 8;
    const len = s * (.75 + r() * .45) * (1 - Math.abs(i - (nf - 1) / 2) / nf * .5);
    const cur = (a < -90 ? -1 : 1) * len * .35;
    o += frond(x, y, len, a, cur, i % 2 ? c1 : c2, s * .16, Math.round(len / 9), c1);
  }
  return o;
}
function conifer(x, y, h, dark, mid, lite, trunk) {
  const w0 = h * .27; let s = `<rect x="${f(x - h * .025)}" y="${f(y - h * .18)}" width="${f(h * .05)}" height="${f(h * .2)}" fill="${trunk || dark}"/>`;
  const n = 6;
  for (let i = 0; i < n; i++) {
    const top = y - h + i * (h * .13), bot = top + h * .3 - i * h * .012, w = w0 * (.4 + i * .13);
    const p = `M${f(x)},${f(top)} L${f(x + w)},${f(bot)} Q${f(x + w * .5)},${f(bot - h * .04)} ${f(x)},${f(bot - h * .015)} Q${f(x - w * .5)},${f(bot - h * .04)} ${f(x - w)},${f(bot)} Z`;
    s += `<path d="${p}" fill="${i % 2 ? mid : dark}"/>`;
    s += `<path d="M${f(x)},${f(top)} L${f(x - w)},${f(bot)} Q${f(x - w * .5)},${f(bot - h * .04)} ${f(x)},${f(bot - h * .015)} Z" fill="${lite}" opacity=".35"/>`;
  }
  return s;
}
// tall umbrella-crowned conifer (araucaria-like)
function araucaria(x, y, h, trunk, dark, mid, lite) {
  let s = `<path d="M${f(x - h * .03)},${y} L${f(x - h * .015)},${f(y - h)} L${f(x + h * .015)},${f(y - h)} L${f(x + h * .03)},${y} Z" fill="${trunk}"/>`;
  s += `<path d="M${f(x - h * .03)},${y} L${f(x - h * .015)},${f(y - h)} L${f(x - h * .002)},${f(y - h)} L${f(x - h * .004)},${y} Z" fill="${lite}" opacity=".3"/>`;
  const tiers = [[.55, .26], [.66, .22], [.77, .18], [.88, .13], [.96, .08]];
  tiers.forEach(([t, w], i) => {
    const yy = y - h * t, ww = h * w;
    s += `<path d="M${f(x - ww)},${f(yy + h * .03)} Q${f(x - ww * .5)},${f(yy - h * .045)} ${f(x)},${f(yy - h * .02)} Q${f(x + ww * .5)},${f(yy - h * .045)} ${f(x + ww)},${f(yy + h * .03)} Q${f(x)},${f(yy + h * .07)} ${f(x - ww)},${f(yy + h * .03)} Z" fill="${i % 2 ? mid : dark}"/>`;
    s += `<path d="M${f(x - ww)},${f(yy + h * .03)} Q${f(x - ww * .5)},${f(yy - h * .045)} ${f(x)},${f(yy - h * .02)} Q${f(x - ww * .4)},${f(yy + h * .02)} ${f(x - ww)},${f(yy + h * .03)} Z" fill="${lite}" opacity=".4"/>`;
  });
  return s;
}
function horsetail(x, y, h, col, lite) {
  const seg = 14 + (h % 7); let d = '', nd = '', w = 7;
  for (let yy = y; yy > y - h; yy -= seg) {
    const sp = 5 + (y - yy) * .06 * 0 + 11 * (1 - (y - yy) / h);
    for (let k = -3; k <= 3; k++) d += `M${f(x)},${f(yy)} l${f(k * 5)},${f(-sp - 4 + Math.abs(k))}`;
    nd += `M${f(x - w / 2)},${f(yy)} h${w}`;
  }
  return `<path d="M${x},${y} L${x},${y - h}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/><path d="M${x - 1.5},${y} L${x - 1.5},${y - h}" stroke="${lite}" stroke-width="2" opacity=".5"/><path d="${nd}" stroke="${lite}" stroke-width="2.5" opacity=".7"/><path d="${d}" stroke="${col}" stroke-width="2.2" stroke-linecap="round" fill="none"/><path d="M${x - 5},${y - h - 2} Q${x},${y - h - 20} ${x + 5},${y - h - 2} Z" fill="${col}"/>`;
}
function cycad(x, y, s, trunk, tlite, c1, c2, seed) {
  const r = rng(seed || 3);
  let o = `<path d="M${f(x - s * .16)},${y} Q${f(x - s * .2)},${f(y - s * .3)} ${f(x - s * .13)},${f(y - s * .45)} L${f(x + s * .13)},${f(y - s * .45)} Q${f(x + s * .2)},${f(y - s * .3)} ${f(x + s * .16)},${y} Z" fill="${trunk}"/>`;
  for (let k = 1; k < 5; k++) o += `<path d="M${f(x - s * .18)},${f(y - k * s * .1)} q${f(s * .18)},${f(s * .06)} ${f(s * .36)},0" stroke="${tlite}" stroke-width="3" fill="none" opacity=".55" stroke-linecap="round"/>`;
  const nf = 9;
  for (let i = 0; i < nf; i++) {
    const a = -170 + i * (160 / (nf - 1)), len = s * (.85 + r() * .25) * (i === 4 ? .8 : 1);
    o += frond(x, y - s * .45, len, a, (a < -90 ? -1 : 1) * len * .5, i % 2 ? c1 : c2, s * .18, Math.round(len / 10), c1);
  }
  return o;
}
function grass(x, y, h, col, n, seed) {
  const r = rng(seed); let d = '';
  for (let i = 0; i < n; i++) {
    const a = (i / (n - 1) - .5) * 1.5 + (r() - .5) * .3, hh = h * (.6 + r() * .5);
    d += `M${f(x + (i - n / 2) * 2.4)},${y} Q${f(x + Math.sin(a) * hh * .3)},${f(y - hh * .6)} ${f(x + Math.sin(a) * hh * .8 + (r() - .5) * 6)},${f(y - hh * Math.cos(a) * .95)} Q${f(x + Math.sin(a) * hh * .35 + 3)},${f(y - hh * .5)} ${f(x + (i - n / 2) * 2.4 + 4)},${y} Z `;
  }
  return `<path d="${d}" fill="${col}"/>`;
}
function oak(x, y, s, trunk, tlite, c1, c2, c3, seed, nb) {
  const r = rng(seed || 5); let o = '';
  o += `<path d="M${f(x - s * .09)},${y} C${f(x - s * .06)},${f(y - s * .2)} ${f(x - s * .07)},${f(y - s * .35)} ${f(x - s * .04)},${f(y - s * .55)} L${f(x + s * .04)},${f(y - s * .55)} C${f(x + s * .07)},${f(y - s * .35)} ${f(x + s * .06)},${f(y - s * .2)} ${f(x + s * .1)},${y} Z" fill="${trunk}"/>`;
  o += `<path d="M${f(x - s * .09)},${y} C${f(x - s * .06)},${f(y - s * .2)} ${f(x - s * .07)},${f(y - s * .35)} ${f(x - s * .04)},${f(y - s * .55)} L${f(x - s * .01)},${f(y - s * .55)} C${f(x - s * .03)},${f(y - s * .3)} ${f(x - s * .02)},${f(y - s * .2)} ${f(x - s * .03)},${y} Z" fill="${tlite}" opacity=".4"/>`;
  o += `<path d="M${x},${f(y - s * .42)} L${f(x - s * .3)},${f(y - s * .62)} M${x},${f(y - s * .45)} L${f(x + s * .33)},${f(y - s * .66)}" stroke="${trunk}" stroke-width="${f(s * .035)}" stroke-linecap="round"/>`;
  const blobs = [];
  for (let i = 0; i < (nb || 12); i++) { const a = r() * 6.28, d = Math.sqrt(r()); blobs.push([x + Math.cos(a) * d * s * .42, y - s * .78 + Math.sin(a) * d * s * .24, s * (.13 + r() * .1)]); }
  blobs.forEach(([bx, by, br]) => o += `<circle cx="${f(bx)}" cy="${f(by)}" r="${f(br)}" fill="${c1}"/>`);
  blobs.forEach(([bx, by, br]) => o += `<circle cx="${f(bx - br * .15)}" cy="${f(by - br * .22)}" r="${f(br * .78)}" fill="${c2}"/>`);
  blobs.forEach(([bx, by, br], i) => { if (i % 2 === 0) o += `<circle cx="${f(bx - br * .3)}" cy="${f(by - br * .42)}" r="${f(br * .42)}" fill="${c3}" opacity=".8"/>`; });
  return o;
}
function flower(x, y, r, col, mid, n, ang) {
  let o = ''; n = n || 5;
  for (let i = 0; i < n; i++) o += `<ellipse cx="${f(x)}" cy="${f(y - r * .62)}" rx="${f(r * .38)}" ry="${f(r * .66)}" fill="${col}" transform="rotate(${f(ang + i * 360 / n)} ${f(x)} ${f(y)})"/>`;
  return o + `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * .3)}" fill="${mid}"/>`;
}
function magnolia(x, y, r, col, lite, mid) { // upright cup flower
  return `<g transform="translate(${x} ${y})"><ellipse cx="-${f(r * .5)}" cy="0" rx="${f(r * .42)}" ry="${f(r * .9)}" fill="${col}" transform="rotate(-24 -${f(r * .5)} ${f(r * .5)})"/><ellipse cx="${f(r * .5)}" cy="0" rx="${f(r * .42)}" ry="${f(r * .9)}" fill="${col}" transform="rotate(24 ${f(r * .5)} ${f(r * .5)})"/><ellipse cx="0" cy="${f(-r * .08)}" rx="${f(r * .45)}" ry="${f(r)}" fill="${lite}"/><path d="M0,${f(-r * .8)} Q${f(r * .15)},${f(-r * .3)} 0,${f(r * .6)}" stroke="${mid}" stroke-width="2" fill="none" opacity=".45"/><circle cx="0" cy="${f(-r * .85)}" r="${f(r * .12)}" fill="#FFD85A"/></g>`;
}
function magTree(x, y, s, trunk, tl, l1, l2, l3, fl1, fl2, fm, seed) {
  const r = rng(seed || 9); let o = '';
  o += `<path d="M${f(x - s * .05)},${y} C${f(x - s * .03)},${f(y - s * .2)} ${f(x - s * .04)},${f(y - s * .3)} ${f(x - s * .02)},${f(y - s * .4)} L${f(x + s * .02)},${f(y - s * .4)} C${f(x + s * .04)},${f(y - s * .3)} ${f(x + s * .03)},${f(y - s * .2)} ${f(x + s * .06)},${y} Z" fill="${trunk}"/>`;
  o += `<path d="M${x},${f(y - s * .32)} L${f(x - s * .28)},${f(y - s * .5)} M${x},${f(y - s * .35)} L${f(x + s * .3)},${f(y - s * .52)}" stroke="${trunk}" stroke-width="${f(s * .03)}" stroke-linecap="round"/>`;
  const bl = [];
  for (let i = 0; i < 10; i++) { const a = r() * 6.28, d = Math.sqrt(r()); bl.push([x + Math.cos(a) * d * s * .4, y - s * .62 + Math.sin(a) * d * s * .2, s * (.09 + r() * .06)]); }
  bl.forEach(([bx, by, br]) => o += `<ellipse cx="${f(bx)}" cy="${f(by)}" rx="${f(br * 1.5)}" ry="${f(br)}" fill="${l1}"/>`);
  bl.forEach(([bx, by, br]) => o += `<ellipse cx="${f(bx - br * .2)}" cy="${f(by - br * .2)}" rx="${f(br * 1.2)}" ry="${f(br * .75)}" fill="${l2}"/>`);
  bl.forEach(([bx, by, br], i) => { if (i % 3 === 0) o += `<ellipse cx="${f(bx - br * .4)}" cy="${f(by - br * .4)}" rx="${f(br * .6)}" ry="${f(br * .3)}" fill="${l3}" opacity=".8"/>`; });
  bl.forEach(([bx, by, br], i) => { if (i % 2 === 0) o += magnolia(f(bx + (r() - .5) * br), f(by - br * .4), s * .05, fl1, fl2, fm); });
  return o;
}

// ---------------------------------------------------------------- silhouettes (stroke based, one colour)
function sauropod(x, y, s, col, flip) {
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})" fill="${col}" stroke="${col}" stroke-linecap="round">` +
    `<ellipse cx="0" cy="0" rx="62" ry="30" stroke="none"/>` +
    `<path d="M40,-12 C74,-34 76,-84 100,-118" stroke-width="19" fill="none"/>` +
    `<ellipse cx="108" cy="-124" rx="13" ry="7.5" stroke="none" transform="rotate(-20 108 -124)"/>` +
    `<path d="M-48,-18 C-100,-12 -140,22 -190,42 C-140,30 -100,28 -48,24 Z" stroke="none"/>` +
    `<path d="M-38,14 L-40,64 M-18,18 L-14,66 M28,18 L30,66 M48,10 L56,64" stroke-width="15" fill="none"/></g>`;
}
function theropod(x, y, s, col) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${col}" stroke="${col}" stroke-linecap="round" stroke-linejoin="round">` +
    `<ellipse cx="0" cy="0" rx="28" ry="13" transform="rotate(-8)" stroke="none"/>` +
    `<path d="M20,-6 C34,-18 38,-30 46,-38" stroke-width="9" fill="none"/>` +
    `<path d="M40,-42 L66,-40 L62,-34 L48,-32 Z" stroke-width="3"/>` +
    `<path d="M-24,-4 C-60,-6 -90,6 -124,24 C-90,10 -60,10 -22,8 Z" stroke="none"/>` +
    `<path d="M-4,8 L-8,34 L-22,50 L-8,50 M10,8 L14,34 L4,52 L16,52" stroke-width="6" fill="none"/>` +
    `<path d="M24,0 L40,8 M28,4 L42,2" stroke-width="3.5" fill="none"/></g>`;
}
function dragonfly(x, y, s, ang, body, wing, wing2) {
  const wg = (rx, ry, ox, oy, a, o) => `<ellipse cx="${ox}" cy="${oy}" rx="${rx}" ry="${ry}" fill="${wing}" opacity="${o}" transform="rotate(${a} ${ox} ${oy})"/>`;
  return `<g transform="translate(${x} ${y}) rotate(${ang}) scale(${s})">` +
    wg(38, 8, 10, -18, -22, .5) + wg(34, 7, -8, -16, 14, .5) + wg(38, 8, 10, 18, 22, .38) + wg(34, 7, -8, 16, -14, .38) +
    `<path d="M-6,-16 L-4,-26 M18,-20 l-2,-8 M-6,16 L-4,26" stroke="${wing2}" stroke-width="1.5" opacity=".5" fill="none"/>` +
    `<path d="M-62,2 L-8,0" stroke="${body}" stroke-width="5" stroke-linecap="round"/><path d="M-8,0 L22,0" stroke="${body}" stroke-width="9" stroke-linecap="round"/>` +
    `<path d="M-60,0 L-10,0" stroke="${wing2}" stroke-width="1.6" stroke-dasharray="3 5" opacity=".6"/>` +
    `<circle cx="26" cy="0" r="7" fill="${body}"/><circle cx="29" cy="-3" r="4.2" fill="${wing2}"/></g>`;
}
function gastornis(x, y, s, col) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${col}" stroke="${col}" stroke-linecap="round" stroke-linejoin="round">` +
    `<ellipse cx="0" cy="0" rx="44" ry="32" stroke="none"/><path d="M-36,0 L-70,18 L-44,26 Z" stroke="none"/>` +
    `<path d="M26,-14 C46,-40 52,-60 56,-80" stroke-width="20" fill="none"/>` +
    `<ellipse cx="62" cy="-88" rx="22" ry="16" stroke="none"/><path d="M76,-100 C100,-98 106,-80 92,-68 L74,-78 Z" stroke="none"/>` +
    `<path d="M-8,26 L-6,72 M12,26 L16,72" stroke-width="10" fill="none"/><path d="M-6,72 l-18,6 M-6,72 l8,8 M16,72 l-14,8 M16,72 l12,6" stroke-width="5" fill="none"/></g>`;
}
function magpie(x, y, s) {
  return `<g transform="translate(${x} ${y}) scale(${s})">` +
    // tail
    `<path d="M-30,-4 C-80,0 -130,30 -170,52 C-120,52 -70,34 -26,14 Z" fill="#15334f"/><path d="M-40,-2 C-80,4 -120,26 -156,44 C-120,34 -80,24 -40,8 Z" fill="#1f8e8a" opacity=".85"/>` +
    // body
    `<ellipse cx="0" cy="0" rx="48" ry="30" fill="#1a2238" transform="rotate(-18)"/>` +
    `<path d="M-6,12 C10,34 38,30 50,6 C40,14 20,22 -6,12 Z" fill="#1a2238"/>` +
    `<path d="M-16,8 C0,30 28,28 40,8 C28,16 4,20 -16,8 Z" fill="#F7F4EC"/>` +
    // wing
    `<path d="M-38,-12 C-10,-30 30,-18 44,4 C20,2 -8,6 -38,-12 Z" fill="#2A5FA8"/><path d="M-30,-12 C-6,-24 24,-16 38,0 C14,-2 -10,2 -30,-12 Z" fill="#1F8E8A"/><path d="M-24,-14 C-4,-22 18,-18 30,-8" stroke="#8FE3F5" stroke-width="2" fill="none" opacity=".7" stroke-linecap="round"/>` +
    `<path d="M-30,-10 C-16,-16 -2,-14 6,-6" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>` +
    // head
    `<circle cx="44" cy="-24" r="20" fill="#1a2238"/><path d="M30,-38 C40,-46 56,-44 62,-34" stroke="#4B6AA8" stroke-width="2.5" fill="none" opacity=".7" stroke-linecap="round"/>` +
    `<path d="M60,-30 L86,-24 L60,-17 Z" fill="#202634"/><path d="M62,-29 L84,-24" stroke="#5a6580" stroke-width="1.6" opacity=".7"/>` +
    `<circle cx="48" cy="-28" r="4.4" fill="#F4C54A"/><circle cx="48.6" cy="-28" r="2.6" fill="#0c1020"/><circle cx="49.6" cy="-29.2" r="1" fill="#fff"/>` +
    // legs
    `<path d="M-6,26 L-6,38 M10,28 L10,38" stroke="#2a2a38" stroke-width="3.5" stroke-linecap="round"/></g>`;
}

// ================================================================ scene assembly
const art = {};
function finish(id, S, label) { art[id] = L.wrap(id, S.out(), { label }); }

function frame(S, skyStops) {
  S.grad('sky', skyStops);
  S.grad('ray', [[0, '#fff', .5], [.6, '#fff', .12], [1, '#fff', 0]]);
  S.add(`<rect width="800" height="600" fill="url(#sky)"/>`);
}
function vignette(S, col, op) {
  S.rgrad('vg', [[.55, col, 0], [1, col, op]], .5, .5, .75);
  S.add(`<rect width="800" height="600" fill="url(#vg)"/>`);
}

// ---------------- PERMIAN
(function () {
  const S = mk(), r = rng(11);
  frame(S, [[0, '#C9694A'], [.38, '#E8935A'], [.62, '#F6C58C'], [1, '#F8DDAE']]);
  S.rgrad('sun', [[0, '#FFF4D0', 1], [.25, '#FFE0A0', .75], [1, '#FFC070', 0]]);
  S.add(`<circle cx="580" cy="190" r="190" fill="url(#sun)"/><circle cx="580" cy="190" r="46" fill="#FFF0C8"/>`);
  S.add(rays(580, 190, [[120, 40], [330, 50], [560, 40], [760, 50]], 20, .22));
  S.add(cloud(150, 100, 1.2, '#F9C28E', .55) + cloud(330, 60, .8, '#F9C28E', .4));
  // distant mesas
  S.grad('m1', [[0, '#C98064'], [1, '#E4A67E']]);
  S.add(mesas(4, 350, '#C58467', '#E2A37F', 6));
  S.add(haze(S, 'h1', 300, 80, '#F8D6A4', .55));
  S.grad('r2', [[0, '#B25E42'], [1, '#D89A70']]);
  S.add(ridge(21, 372, 14, 'url(#r2)', 110));
  // sparse far conifers
  [[90, 392, 70], [230, 380, 60], [640, 388, 74], [740, 380, 56]].forEach(([x, y, h], i) => S.add(conifer(x, y, h, '#6F5B3C', '#8A7346', '#C7A765', '#6A4630')));
  S.add(haze(S, 'h2', 360, 70, '#F2C490', .45));
  S.grad('r3', [[0, '#9E4A33'], [1, '#C77C54']]);
  S.add(ridge(33, 420, 12, 'url(#r3)', 100));
  // dune highlights
  S.add(`<path d="M-20,430 C120,408 260,416 380,440 C260,430 120,424 -20,446 Z" fill="#E7A978" opacity=".45"/><path d="M420,436 C560,412 700,416 830,438 C700,428 560,430 420,450 Z" fill="#E7A978" opacity=".4"/>`);
  // seed ferns & small conifers mid
  S.add(fern(120, 450, 54, '#6C7A3C', '#8B8F4A', 7, 2));
  S.add(fern(690, 448, 50, '#6C7A3C', '#8B8F4A', 7, 3));
  S.add(conifer(60, 450, 130, '#5E5A32', '#788044', '#B7AE6A', '#5A3A28'));
  S.add(conifer(735, 452, 150, '#5E5A32', '#788044', '#B7AE6A', '#5A3A28'));
  // foreground ground
  S.grad('g', [[0, '#A04A32'], [.5, '#84382C'], [1, '#62282B']]);
  S.add(ridge(41, 490, 10, 'url(#g)', 120));
  S.add(`<path d="M250,530 l30,-6 l22,8 l30,-4 M460,540 l26,6 l34,-8 l24,4 M340,566 l20,-6 l30,6 M130,520 l24,6 l20,-4" stroke="#5A2226" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round" stroke-linejoin="round"/>`);
  S.add(conifer(300, 500, 60, '#5E5A32', '#788044', '#B7AE6A', '#5A3A28') + conifer(520, 500, 52, '#5E5A32', '#788044', '#B7AE6A', '#5A3A28'));
  S.add(`<path d="M-20,520 C200,500 330,512 440,508 C560,504 700,500 830,516 L830,620 L-20,620 Z" fill="#5A2626" opacity=".5"/>`);
  // rocks
  S.add(`<path d="M24,508 l22,-26 l38,2 l16,24 Z" fill="#7B3A2E"/><path d="M24,508 l22,-26 l16,1 l-6,25 Z" fill="#A45A42" opacity=".6"/><path d="M660,512 l18,-18 l32,2 l14,16 Z" fill="#7B3A2E"/><path d="M660,512 l18,-18 l12,1 l-4,17 Z" fill="#A45A42" opacity=".6"/>`);
  // seed-fern clumps foreground
  S.add(fern(70, 548, 80, '#5B6B30', '#7C8442', 8, 5));
  S.add(fern(745, 552, 90, '#5B6B30', '#7C8442', 8, 6));
  S.add(grass(190, 560, 30, '#7C8442', 8, 1) + grass(610, 558, 28, '#7C8442', 8, 2));
  // giant dragonflies
  S.add(dragonfly(190, 190, 1.35, -8, '#2C6B73', '#FFF1D6', '#1D3B4A'));
  S.add(dragonfly(640, 290, .85, 14, '#B04A2A', '#FFF1D6', '#5A2A24'));
  S.add(dragonfly(430, 120, .5, -4, '#2C6B73', '#FFF1D6', '#1D3B4A'));
  S.add(haze(S, 'h3', 500, 100, '#7A3028', .4));
  vignette(S, '#4A1C20', .4);
  finish('scene-permian', S, 'A hot red Permian landscape with giant dragonflies');
})();

// ---------------- TRIASSIC
(function () {
  const S = mk();
  frame(S, [[0, '#4FA3B4'], [.4, '#9ED0C0'], [.7, '#F1E3B0'], [1, '#F7E6B8']]);
  S.rgrad('sun', [[0, '#FFFBE0', 1], [.3, '#FFF0B0', .7], [1, '#FFE090', 0]]);
  S.add(`<circle cx="210" cy="150" r="180" fill="url(#sun)"/><circle cx="210" cy="150" r="38" fill="#FFFBE6"/>`);
  S.add(rays(210, 150, [[100, 40], [300, 50], [460, 40], [620, 50]], 18, .2));
  S.add(cloud(560, 90, 1.1, '#fff', .5) + cloud(700, 150, .8, '#fff', .4));
  S.grad('a', [[0, '#7FA89A'], [1, '#B7C7A0']]);
  S.add(ridge(5, 330, 24, 'url(#a)', 130));
  S.add(haze(S, 'h1', 290, 90, '#F4E6BC', .6));
  // far dinosaurian silhouette on the ridge
  S.add(theropod(560, 364, .75, '#6E8A78'));
  S.grad('b', [[0, '#8FA66E'], [1, '#C7C690']]);
  S.add(ridge(8, 372, 14, 'url(#b)', 100));
  // distant horsetail stand
  for (let i = 0; i < 9; i++) S.add(horsetail(300 + i * 21 + (i % 2) * 6, 400, 34 + (i * 7) % 20, '#86A460', '#B7CC8A'));
  S.add(haze(S, 'h2', 360, 70, '#F1E3B0', .45));
  S.grad('c', [[0, '#8C8F4A'], [1, '#B09A58']]);
  S.add(ridge(14, 430, 12, 'url(#c)', 110));
  S.add(`<path d="M-20,452 C150,430 300,436 420,456 C300,446 150,450 -20,470 Z" fill="#E5CE86" opacity=".5"/>`);
  // cycads mid sides
  S.add(cycad(110, 464, 80, '#6B5638', '#A98A58', '#3F7D4A', '#5E9A58', 3));
  S.add(cycad(700, 468, 90, '#6B5638', '#A98A58', '#3F7D4A', '#5E9A58', 4));
  S.add(conifer(250, 454, 100, '#3F6B3E', '#58844C', '#9BC27A', '#6A4630'));
  S.add(conifer(560, 456, 84, '#3F6B3E', '#58844C', '#9BC27A', '#6A4630'));
  S.grad('g', [[0, '#9A8A48'], [.5, '#7C7040'], [1, '#5A5030']]);
  S.add(ridge(19, 500, 10, 'url(#g)', 120));
  // foreground horsetails left/right
  [[28, 570, 150], [52, 575, 110], [78, 572, 170], [738, 572, 150], [762, 576, 120], [714, 570, 90]].forEach(([x, y, h]) => S.add(horsetail(x, y, h, '#4C7E3C', '#9ECB78')));
  S.add(fern(150, 556, 78, '#3F7D4A', '#5E9A58', 8, 8));
  S.add(fern(640, 560, 84, '#3F7D4A', '#5E9A58', 8, 9));
  S.add(grass(230, 566, 26, '#5E9A58', 8, 3) + grass(560, 566, 26, '#5E9A58', 8, 4));
  S.add(haze(S, 'h3', 520, 90, '#4C4A2A', .35));
  vignette(S, '#2E3A22', .28);
  finish('scene-triassic', S, 'A hot Triassic landscape with horsetails, cycads and a distant early dinosaur');
})();

// ---------------- JURASSIC
(function () {
  const S = mk();
  frame(S, [[0, '#4C9FC0'], [.35, '#8CCBC6'], [.65, '#FBE2A0'], [1, '#FFE9B0']]);
  S.rgrad('sun', [[0, '#FFFBDC', 1], [.3, '#FFE9A0', .75], [1, '#FFCF70', 0]]);
  S.add(`<circle cx="610" cy="210" r="230" fill="url(#sun)"/><circle cx="610" cy="210" r="42" fill="#FFF8D2"/>`);
  S.add(rays(610, 210, [[60, 40], [200, 50], [340, 40], [480, 50], [700, 40]], 20, .26));
  S.add(cloud(130, 90, 1.2, '#fff', .55) + cloud(380, 140, .8, '#fff', .4));
  S.grad('a', [[0, '#6FA3A0'], [1, '#B9CFAE']]);
  S.add(ridge(3, 318, 26, 'url(#a)', 130));
  S.add(haze(S, 'h1', 290, 90, '#FBEBB8', .6));
  // misty distant sauropod
  S.add(sauropod(255, 372, .52, '#6C9A8E', false));
  S.add(`<g opacity=".7">${sauropod(345, 380, .4, '#7BA799', false)}</g>`);
  S.grad('b', [[0, '#6D9E62'], [1, '#B6CD8E']]);
  S.add(ridge(6, 376, 14, 'url(#b)', 100));
  // lake band
  S.grad('lake', [[0, '#8FD0CC'], [1, '#4E9AA6']]);
  S.add(`<path d="M-20,404 C140,394 300,398 420,404 C560,410 700,398 830,402 L830,436 C680,444 540,438 400,442 C260,446 120,440 -20,440 Z" fill="url(#lake)"/><path d="M80,414 h60 M300,420 h90 M560,412 h70" stroke="#E8FBF0" stroke-width="2" opacity=".5" stroke-linecap="round"/>`);
  S.add(haze(S, 'h2', 380, 60, '#FBEBB8', .4));
  // tall conifers mid
  [[300, 420, 130], [330, 424, 100], [510, 424, 110]].forEach(([x, y, h]) => S.add(araucaria(x, y, h, '#6A4A30', '#2F6B45', '#3F8650', '#9BD07A')));
  S.grad('c', [[0, '#4C8A4A'], [1, '#7DAE5A']]);
  S.add(ridge(9, 448, 12, 'url(#c)', 110));
  // big side trees
  S.add(araucaria(70, 520, 340, '#5A3E2A', '#2A6641', '#3B8450', '#A0D67E'));
  S.add(araucaria(740, 526, 360, '#5A3E2A', '#2A6641', '#3B8450', '#A0D67E'));
  S.grad('g', [[0, '#5A9A48'], [.6, '#3F7F3E'], [1, '#2D5E36']]);
  S.add(ridge(12, 492, 10, 'url(#g)', 120));
  S.add(cycad(170, 540, 86, '#6B5638', '#A98A58', '#2F7A3C', '#58A24C', 5));
  S.add(cycad(650, 546, 92, '#6B5638', '#A98A58', '#2F7A3C', '#58A24C', 6));
  S.add(fern(250, 566, 70, '#2F7A3C', '#58A24C', 8, 10));
  S.add(fern(560, 568, 74, '#2F7A3C', '#58A24C', 8, 11));
  S.add(fern(30, 580, 90, '#256A38', '#3F8E48', 8, 12) + fern(780, 584, 90, '#256A38', '#3F8E48', 8, 13));
  S.add(grass(390, 572, 22, '#58A24C', 8, 5));
  S.add(haze(S, 'h3', 520, 90, '#1F4A30', .3));
  vignette(S, '#1F3F2A', .3);
  finish('scene-jurassic', S, 'A lush golden Jurassic forest with a distant sauropod');
})();

// ---------------- CRETACEOUS
(function () {
  const S = mk(), r = rng(31);
  frame(S, [[0, '#32285E'], [.3, '#7A3E7A'], [.58, '#E2587A'], [.82, '#FFA45A'], [1, '#FFCF82']]);
  S.add(stars(r, 26, '#FFE8F0', .8));
  S.rgrad('sun', [[0, '#FFF2C0', 1], [.3, '#FFC070', .7], [1, '#FF8A50', 0]]);
  S.add(`<circle cx="400" cy="340" r="250" fill="url(#sun)"/><circle cx="400" cy="340" r="52" fill="#FFE9B0"/>`);
  S.add(rays(400, 340, [[60, 50], [220, 40], [580, 40], [740, 50]], 18, .16));
  // comet streak (upper left)
  S.grad('cm', [[0, '#fff', 0], [1, '#FFF6D8', .85]], { x1: 0, y1: 0, x2: 1, y2: 1 });
  S.add(`<path d="M80,30 L215,128 L226,114 Z" fill="url(#cm)"/><path d="M140,30 L222,122 L228,114 Z" fill="url(#cm)" opacity=".5"/><circle cx="224" cy="122" r="26" fill="#FFC070" opacity=".3"/><circle cx="224" cy="122" r="12" fill="#FFF3D0"/><circle cx="222" cy="120" r="6" fill="#fff"/>`);
  S.add(cloud(560, 120, 1.2, '#F28CA0', .5) + cloud(130, 270, 1, '#FFB27A', .5) + cloud(690, 250, .9, '#FFB27A', .45));
  // volcano far right
  S.grad('vol', [[0, '#6C3A66'], [1, '#B8586E']]);
  S.add(`<path d="M520,410 L650,262 L690,262 L850,430 Z" fill="url(#vol)"/><path d="M520,410 L650,262 L668,262 L640,420 Z" fill="#D87A86" opacity=".4"/><path d="M652,262 Q672,252 690,262 Q672,270 652,262 Z" fill="#FF8A3A"/>`);
  S.add(`<path d="M668,262 C640,220 690,190 660,140 C700,170 730,210 700,258 Z" fill="#6A4A66" opacity=".55"/><path d="M668,262 C655,230 690,215 676,180 C706,205 712,235 694,258 Z" fill="#8F6580" opacity=".5"/>`);
  S.add(haze(S, 'h1', 340, 90, '#FFB27A', .5));
  S.grad('a', [[0, '#5E3A6A'], [1, '#B05E6E']]);
  S.add(ridge(7, 396, 18, 'url(#a)', 120));
  // distant conifer silhouettes
  for (let i = 0; i < 10; i++) S.add(conifer(40 + i * 82 + (i % 3) * 14, 410, 56 + (i * 13) % 30, '#5A3A66', '#6E4470', '#B0627A', '#4A2E54'));
  S.add(haze(S, 'h2', 380, 70, '#FF9C6A', .4));
  S.grad('b', [[0, '#5B4476'], [1, '#6F5A72']]);
  S.add(ridge(9, 432, 12, 'url(#b)', 110));
  // river reflecting sunset
  S.grad('lk', [[0, '#FFC27A'], [1, '#C86878']]);
  S.add(`<path d="M-20,452 C150,446 300,450 420,452 C560,454 700,446 830,450 L830,474 C680,480 540,476 400,480 C260,482 120,478 -20,478 Z" fill="url(#lk)" opacity=".85"/>`);
  // magnolia trees
  S.add(magTree(130, 500, 230, '#4A2E3E', '#8A5A60', '#2F5A44', '#3E7650', '#7FB070', '#FFE6EE', '#FFB4C8', '#E0709A', 4));
  S.add(magTree(690, 506, 250, '#4A2E3E', '#8A5A60', '#2F5A44', '#3E7650', '#7FB070', '#FFF4F6', '#FFC0CE', '#E0709A', 6));
  S.add(araucaria(40, 530, 300, '#3F2A3C', '#2A3F46', '#385C52', '#8FBF86'));
  S.add(araucaria(776, 530, 320, '#3F2A3C', '#2A3F46', '#385C52', '#8FBF86'));
  S.grad('g', [[0, '#4C5C48'], [.5, '#3A4A44'], [1, '#2A3340']]);
  S.add(ridge(15, 512, 9, 'url(#g)', 120));
  S.add(fern(250, 562, 70, '#3E7650', '#5E9A62', 8, 14) + fern(560, 566, 72, '#3E7650', '#5E9A62', 8, 15));
  // small flowering plants
  [[300, 560], [330, 570], [490, 566], [520, 574], [420, 572]].forEach(([x, y], i) => {
    S.add(`<path d="M${x},${y + 14} L${x},${y}" stroke="#3E7650" stroke-width="3"/>` + flower(x, y, 11, i % 2 ? '#FFD4DE' : '#FFF0F4', '#F2B04A', 5, i * 20));
  });
  S.add(grass(400, 584, 22, '#5E9A62', 8, 6));
  S.add(haze(S, 'h3', 520, 90, '#2A1E40', .35));
  vignette(S, '#241A3C', .38);
  finish('scene-cretaceous', S, 'A Cretaceous sunset with flowering plants, a volcano and a comet');
})();

// ---------------- PALEOGENE
(function () {
  const S = mk();
  frame(S, [[0, '#9FB0C4'], [.4, '#C7CFD6'], [.7, '#EFE6D2'], [1, '#F4ECD8']]);
  S.rgrad('sun', [[0, '#FFFFFF', .9], [.4, '#FFF5DC', .5], [1, '#FFF0D0', 0]]);
  S.add(`<circle cx="470" cy="190" r="240" fill="url(#sun)"/><circle cx="470" cy="190" r="34" fill="#FFFBF0" opacity=".9"/>`);
  S.add(rays(470, 190, [[200, 50], [360, 40], [560, 40], [700, 50]], 18, .2));
  S.add(cloud(120, 100, 1.3, '#fff', .5) + cloud(640, 80, 1.1, '#fff', .5) + cloud(300, 170, .8, '#fff', .35));
  S.grad('a', [[0, '#8FA4A0'], [1, '#C0CEC0']]);
  S.add(ridge(5, 330, 24, 'url(#a)', 130));
  S.add(haze(S, 'h1', 290, 100, '#F1ECDA', .65));
  S.grad('b', [[0, '#7FA088'], [1, '#B5CCA8']]);
  S.add(ridge(8, 372, 16, 'url(#b)', 100));
  // big flightless bird far on the right
  S.add(haze(S, 'h2', 370, 70, '#F1ECDA', .5));
  // forest band
  for (let i = 0; i < 9; i++) { const tx = 30 + i * 100 + (i % 2) * 20; if (tx > 520 && tx < 720) continue; S.add(oak(tx, 436, 88 + (i * 17) % 30, '#5A5048', '#8A7E70', '#4C7A56', '#6A9A68', '#A6C888', i + 3, 7)); }
  S.grad('c', [[0, '#5E7C58'], [1, '#7A8E64']]);
  S.add(ridge(11, 446, 10, 'url(#c)', 110));
  S.add(`<ellipse cx="618" cy="480" rx="70" ry="9" fill="#2E3A30" opacity=".35"/>`);
  S.add(gastornis(618, 414, .9, '#55655F'));
  // dark ash soil foreground
  S.grad('soil', [[0, '#5A5662'], [.5, '#44404C'], [1, '#2E2B38']]);
  S.add(ridge(17, 490, 9, 'url(#soil)', 100));
  S.add(`<path d="M-20,520 C140,500 300,512 430,508 C560,504 700,500 830,514" stroke="#7C7886" stroke-width="3" fill="none" opacity=".35"/>`);
  // ash speckle
  const r = rng(77); let sp = '';
  for (let i = 0; i < 40; i++) sp += `<circle cx="${f(r() * 800)}" cy="${f(500 + r() * 100)}" r="${f(1 + r() * 2)}" fill="#8B879A" opacity=".4"/>`;
  S.add(sp);
  // recovering ferns
  S.add(fern(90, 552, 86, '#3F8A4A', '#6EB45E', 9, 20));
  S.add(fern(710, 556, 92, '#3F8A4A', '#6EB45E', 9, 21));
  S.add(fern(240, 570, 58, '#4C9A52', '#86C868', 7, 22) + fern(560, 574, 60, '#4C9A52', '#86C868', 7, 23));
  S.add(fern(430, 584, 40, '#5AA85A', '#9ED878', 6, 24));
  // small seedlings
  [[160, 530], [640, 534], [340, 548], [500, 552]].forEach(([x, y]) => S.add(`<path d="M${x},${y + 10} L${x},${y - 6}" stroke="#4C9A52" stroke-width="2.5"/><ellipse cx="${x - 6}" cy="${y - 4}" rx="7" ry="3.5" fill="#86C868" transform="rotate(-30 ${x - 6} ${y - 4})"/><ellipse cx="${x + 6}" cy="${y - 6}" rx="7" ry="3.5" fill="#6EB45E" transform="rotate(30 ${x + 6} ${y - 6})"/>`));
  S.add(haze(S, 'h3', 500, 100, '#F1ECDA', .22));
  vignette(S, '#2E3440', .22);
  finish('scene-paleogene', S, 'A soft Paleogene scene: forest recovering on dark ash soil, with a big flightless bird');
})();

// ---------------- TODAY
(function () {
  const S = mk();
  frame(S, [[0, '#3C9CE8'], [.45, '#8CCBF4'], [.75, '#D4EEFF'], [1, '#EAF6FF']]);
  S.rgrad('sun', [[0, '#FFFFFF', .9], [.4, '#FFF7D0', .5], [1, '#FFF0B0', 0]]);
  S.add(`<circle cx="620" cy="130" r="200" fill="url(#sun)"/><circle cx="620" cy="130" r="34" fill="#FFFBE0"/>`);
  S.add(rays(620, 130, [[100, 50], [280, 40], [470, 40], [660, 50]], 16, .22));
  S.add(cloud(150, 110, 1.4, '#fff', .9) + cloud(430, 70, 1, '#fff', .85) + cloud(720, 220, 1, '#fff', .8) + cloud(300, 230, .8, '#fff', .7));
  S.grad('a', [[0, '#7FB0C0'], [1, '#B5D4B8']]);
  S.add(ridge(5, 330, 26, 'url(#a)', 140));
  S.add(haze(S, 'h1', 300, 80, '#EAF6FF', .55));
  S.grad('b', [[0, '#6FAE6A'], [1, '#A8D07E']]);
  S.add(ridge(8, 372, 14, 'url(#b)', 110));
  // distant tree clumps
  for (let i = 0; i < 7; i++) S.add(`<ellipse cx="${60 + i * 120 + (i % 2) * 30}" cy="378" rx="${30 + (i * 7) % 16}" ry="${16 + (i * 5) % 8}" fill="#4F9A5A"/><ellipse cx="${54 + i * 120 + (i % 2) * 30}" cy="372" rx="${22 + (i * 7) % 12}" ry="${10 + (i * 5) % 6}" fill="#6CB868" opacity=".8"/>`);
  S.add(haze(S, 'h2', 360, 60, '#EAF6FF', .35));
  S.grad('c', [[0, '#5AA84C'], [1, '#86C458']]);
  S.add(ridge(11, 420, 12, 'url(#c)', 120));
  S.add(`<path d="M-20,440 C160,420 300,428 420,446 C300,438 160,438 -20,458 Z" fill="#B6E07C" opacity=".5"/>`);
  S.grad('g', [[0, '#4C9A44'], [.6, '#3A8040'], [1, '#2C6A3A']]);
  S.add(ridge(14, 478, 10, 'url(#g)', 120));
  // oak on the right with magpie on a branch
  S.add(oak(668, 520, 380, '#6A4A32', '#A07A56', '#2F7A3A', '#4C9C48', '#9AD060', 2));
  // branch towards the left with magpie
  S.add(`<path d="M640,330 C600,318 560,322 520,330" stroke="#6A4A32" stroke-width="10" stroke-linecap="round" fill="none"/><path d="M640,327 C600,315 560,319 520,327" stroke="#A07A56" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".6"/>`);
  S.add(`<g>` + `<ellipse cx="540" cy="324" rx="16" ry="9" fill="#4C9C48"/><ellipse cx="536" cy="320" rx="10" ry="5" fill="#9AD060" opacity=".8"/>` + `</g>`);
  S.add(magpie(580, 300, .62));
  // oak on the left, smaller
  S.add(oak(90, 506, 240, '#6A4A32', '#A07A56', '#2F7A3A', '#4C9C48', '#9AD060', 8));
  // meadow grass + flowers
  S.add(grass(220, 540, 34, '#3F9A48', 10, 1) + grass(400, 552, 36, '#3F9A48', 10, 2) + grass(560, 548, 30, '#3F9A48', 10, 3) + grass(30, 580, 40, '#2F8040', 10, 4) + grass(780, 590, 42, '#2F8040', 10, 5));
  const r = rng(99), cols = [['#FFFFFF', '#FFD24A'], ['#FF6F78', '#7A2A2A'], ['#FFD84A', '#E08A20'], ['#B88CF0', '#FFE27A'], ['#FFFFFF', '#FFD24A']];
  for (let i = 0; i < 20; i++) {
    const x = 160 + r() * 480, y = 520 + r() * 66, k = cols[i % cols.length], rad = 6 + (y - 520) * .08;
    S.add(`<path d="M${f(x)},${f(y + rad * 2.2)} L${f(x)},${f(y)}" stroke="#2F8040" stroke-width="2"/>` + flower(f(x), f(y), f(rad), k[0], k[1], 5, f(r() * 70)));
  }
  S.add(haze(S, 'h3', 520, 90, '#1F5A30', .22));
  vignette(S, '#1F4A5A', .16);
  finish('scene-today', S, 'A sunny modern meadow with an oak tree and a magpie');
})();

// ================================================================ LOGO
(function () {
  const S = mk();
  S.grad('badge', [[0, '#2AA5A0'], [.55, '#1B5F8C'], [1, '#1A2B63']], { x1: .2, y1: 0, x2: .8, y2: 1 });
  S.grad('cream', [[0, '#FFF6DC'], [1, '#F6DFA8']], { x1: .3, y1: 0, x2: .7, y2: 1 });
  S.grad('headG', [[0, '#2C3A66'], [.6, '#18223F'], [1, '#0F1730']], { x1: .2, y1: 0, x2: .6, y2: 1 });
  S.grad('tealF', [[0, '#1E3F78'], [.5, '#1F8E8A'], [1, '#35C9A8']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  S.grad('blueF', [[0, '#3A2A78'], [.55, '#2A5FA8'], [1, '#3FB6D8']], { x1: 0, y1: 0, x2: 1, y2: 0 });
  S.D.push(`<clipPath id="disc"><circle cx="400" cy="300" r="236"/></clipPath>`);
  S.D.push(`<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>`);
  S.add(`<rect x="100" y="4" width="600" height="592" rx="150" fill="url(#badge)"/>`);
  S.add(`<rect x="112" y="16" width="576" height="568" rx="140" fill="none" stroke="#7FE0D0" stroke-width="5" opacity=".55"/>`);
  S.add(`<circle cx="400" cy="300" r="246" fill="#0F2A55" opacity=".35"/><circle cx="400" cy="300" r="236" fill="url(#cream)"/>`);
  // family-tree motif
  S.add(`<g clip-path="url(#disc)" stroke="#C8A25E" stroke-width="10" stroke-linecap="round" fill="none" opacity=".85"><path d="M400,560 L400,480 M400,480 C360,430 300,420 250,440 M400,480 C440,440 520,440 560,470 M250,440 C220,420 200,390 190,360 M250,440 C220,460 190,470 160,470 M560,470 C590,450 620,420 630,380 M560,470 C600,490 630,500 650,520"/></g>`);
  S.add(`<g clip-path="url(#disc)" fill="#E3BC72" opacity=".75"><circle cx="190" cy="360" r="14"/><circle cx="160" cy="470" r="14"/><circle cx="630" cy="380" r="14"/><circle cx="650" cy="520" r="14"/><circle cx="250" cy="440" r="11"/><circle cx="560" cy="470" r="11"/></g>`);
  // neck / chest
  S.add(`<g clip-path="url(#disc)">` +
    `<path d="M214,640 C196,500 236,380 318,300 C372,252 452,244 500,286 L505,330 C490,362 480,392 474,424 C470,500 450,580 440,640 Z" fill="url(#headG)"/>` +
    `<path d="M214,640 C200,520 226,430 262,380 C246,470 262,560 290,640 Z" fill="#fff" opacity=".9"/>` +
    `<path d="M248,640 C238,540 252,470 276,420 C270,490 284,570 306,640 Z" fill="#DDE6F2" opacity=".8"/></g>`);
  // crest feathers (teal)
  const feath = (a, Lf, w, b, fill, lite) => `<g transform="translate(398 268) rotate(${a})">${L.leafFeather(Lf, w, b, fill, lite)}</g>`;
  S.add(feath(222, 190, 26, -34, 'url(#blueF)', '#8FE3F5'));
  S.add(feath(200, 210, 28, -22, 'url(#tealF)', '#9BF2D6'));
  S.add(feath(180, 190, 26, -14, 'url(#blueF)', '#8FE3F5'));
  S.add(feath(160, 150, 22, -6, 'url(#tealF)', '#9BF2D6'));
  // head
  S.add(`<path d="M318,300 C340,238 440,224 492,270 C508,284 508,312 494,330 C470,352 420,372 360,360 C322,350 308,326 318,300 Z" fill="url(#headG)"/>`);
  S.add(`<path d="M334,270 C372,238 436,238 480,268" stroke="#5A82D0" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>`);
  S.add(`<path d="M356,332 C400,350 450,346 484,326" stroke="#0A0F22" stroke-width="10" fill="none" opacity=".5" stroke-linecap="round"/>`);
  // beak
  S.add(`<path d="M488,280 C534,278 588,296 618,328 C570,330 530,330 494,334 Z" fill="#3C4660"/><path d="M488,280 C534,278 588,296 618,328 C580,306 536,294 490,292 Z" fill="#7A8AAE" opacity=".8"/>`);
  S.add(`<path d="M494,334 C540,332 580,338 604,346 C566,362 526,360 488,350 Z" fill="#242B40"/>`);
  S.add(`<path d="M520,336 l8,10 l8,-10 M548,338 l7,9 l7,-9" fill="#fff" opacity=".95"/>`);
  S.add(`<ellipse cx="512" cy="302" rx="7" ry="4" fill="#0A0F22" opacity=".8" transform="rotate(14 512 302)"/>`);
  // eye
  S.add(`<path d="M404,276 C428,262 458,268 470,286" stroke="#0A0F22" stroke-width="10" fill="none" stroke-linecap="round"/>`);
  S.add(`<circle cx="438" cy="300" r="30" fill="#F7C04A"/><circle cx="438" cy="300" r="30" fill="none" stroke="#FFE08A" stroke-width="3" opacity=".7"/><circle cx="442" cy="300" r="17" fill="#120C20"/><circle cx="450" cy="291" r="7" fill="#fff"/><circle cx="433" cy="311" r="3" fill="#fff" opacity=".8"/>`);
  finishLogo(S);
  function finishLogo(S) { art['logo'] = L.wrap('logo', S.out(), { label: "Remy's Archosaur Atlas logo" }); }
})();

// ================================================================ BG PATTERNS
(function () {
  const S = mk(), r = rng(2024);
  const tones = ['#7FA46A', '#9BBE82', '#6A9460', '#B2CC8C'];
  let o = '';
  const leaf = (x, y, s, a, c) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)}) scale(${s})"><path d="M0,0 C10,-26 52,-26 72,0 C52,26 10,26 0,0 Z" fill="${c}"/><path d="M4,0 L66,0" stroke="#fff" stroke-width="3" opacity=".45" stroke-linecap="round"/><path d="M22,0 l12,-10 M22,0 l12,10 M40,0 l10,-8 M40,0 l10,8" stroke="#fff" stroke-width="2" opacity=".3" fill="none" stroke-linecap="round"/><path d="M0,0 L-16,0" stroke="${c}" stroke-width="3" stroke-linecap="round"/></g>`;
  const fl = (x, y, s, a, c) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(a)}) scale(${s})"><path d="M0,0 C6,-18 30,-30 50,-18 C30,-14 14,-6 0,0 Z" fill="${c}"/><path d="M0,0 C6,18 30,30 50,18 C30,14 14,6 0,0 Z" fill="${c}" opacity=".8"/></g>`;
  const pts = [];
  for (let i = 0; i < 30 && pts.length < 17; i++) {
    const x = 215 + r() * 370, y = 165 + r() * 270;
    if (pts.every(p => Math.hypot(p[0] - x, p[1] - y) > 62)) pts.push([x, y]);
  }
  pts.forEach(([x, y], i) => { o += i % 4 === 3 ? fl(x, y, .8 + r() * .5, r() * 360, tones[i % 4]) : leaf(x, y, .7 + r() * .6, r() * 360, tones[i % 4]); });
  S.add(`<g opacity=".5">${o}</g>`);
  art['bg-leaf'] = L.wrap('bg-leaf', S.out(), { label: 'Scattered leaves pattern' });
})();
(function () {
  const S = mk(), r = rng(515);
  const tn = ['#B9A581', '#CDBB96', '#A89472'];
  const femur = (c, l) => `<path d="M-46,0 L46,0" stroke="${c}" stroke-width="12" stroke-linecap="round"/><circle cx="-52" cy="-7" r="10" fill="${c}"/><circle cx="-52" cy="7" r="10" fill="${c}"/><circle cx="52" cy="-8" r="9" fill="${c}"/><circle cx="52" cy="8" r="9" fill="${c}"/><path d="M-40,-3 L40,-3" stroke="${l}" stroke-width="3" opacity=".6" stroke-linecap="round"/>`;
  const rib = (c, l) => `<path d="M-36,22 C-40,-24 20,-38 44,-18" stroke="${c}" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M-32,16 C-34,-16 14,-28 36,-14" stroke="${l}" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>`;
  const vert = (c, l) => `<circle cx="0" cy="0" r="17" fill="${c}"/><circle cx="0" cy="0" r="7" fill="${l}" opacity=".7"/><path d="M0,-17 L0,-34 M-17,0 L-34,-6 M17,0 L34,-6" stroke="${c}" stroke-width="8" stroke-linecap="round"/>`;
  const claw = (c, l) => `<path d="M-22,14 C-14,-24 22,-30 40,-6 C20,-16 4,-6 -4,18 Z" fill="${c}"/><path d="M-12,8 C-6,-14 16,-22 30,-8" stroke="${l}" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>`;
  const tooth = (c, l) => `<path d="M-12,-20 C-14,0 -8,16 0,30 C8,16 14,0 12,-20 Z" fill="${c}"/><path d="M-6,-14 C-7,0 -4,10 0,20" stroke="${l}" stroke-width="2.5" fill="none" opacity=".6" stroke-linecap="round"/>`;
  const skull = (c, l) => `<path d="M-40,8 C-44,-24 -10,-34 24,-24 C46,-18 58,-8 58,2 L22,6 L20,18 L-4,16 C-12,22 -30,22 -40,8 Z" fill="${c}"/><circle cx="-8" cy="-6" r="9" fill="${l}" opacity=".5"/><path d="M26,8 l3,-4 l3,4 M36,6 l3,-4 l3,4 M46,4 l3,-4 l3,4" stroke="${l}" stroke-width="2" fill="none" opacity=".7"/>`;
  const kinds = [femur, rib, vert, claw, tooth, femur, rib, skull, vert, tooth, claw, rib];
  const pts = [];
  for (let i = 0; i < 60 && pts.length < 12; i++) {
    const x = 225 + r() * 350, y = 175 + r() * 250;
    if (pts.every(p => Math.hypot(p[0] - x, p[1] - y) > 84)) pts.push([x, y]);
  }
  let o = '';
  pts.forEach(([x, y], i) => { o += `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(r() * 360)}) scale(${f(1.15 + r() * .4)})">${kinds[i % kinds.length](tn[i % 3], '#F6ECD2')}</g>`; });
  S.add(`<g opacity=".5">${o}</g>`);
  art['bg-bones'] = L.wrap('bg-bones', S.out(), { label: 'Scattered fossil bones pattern' });
})();

L.writeFile('scenes', art);
