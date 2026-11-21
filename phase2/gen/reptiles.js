// Reptiles group generator: node phase2/gen/reptiles.js -> phase2/out/art2-reptiles.js + phase2/sheets/reptiles.html
const fs = require('fs'), path = require('path');
const L = require('../lib');
const f = L.f;
const S = (x, y) => Math.round(x) + ',' + Math.round(y);

// ---------- geometry helpers ----------
function cr(pts, closed) {
  const n = pts.length;
  let d = 'M' + S(pts[0][0], pts[0][1]);
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p1 = pts[i], p2 = pts[(i + 1) % n];
    const p0 = (closed || i > 0) ? pts[(i - 1 + n) % n] : p1;
    const p3 = (closed || i < n - 2) ? pts[(i + 2) % n] : p2;
    d += ' C' + S(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6) + ' ' + S(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6) + ' ' + S(p2[0], p2[1]);
  }
  return d + (closed ? 'Z' : '');
}
function hermite(keys) {
  if (typeof keys === 'number') return () => keys;
  if (typeof keys === 'function') return keys;
  const n = keys.length;
  const m = keys.map((k, i) => { const a = keys[Math.max(0, i - 1)], b = keys[Math.min(n - 1, i + 1)]; return (b[1] - a[1]) / Math.max(1e-6, b[0] - a[0]); });
  return u => {
    if (u <= keys[0][0]) return keys[0][1];
    if (u >= keys[n - 1][0]) return keys[n - 1][1];
    let i = 0; while (u > keys[i + 1][0]) i++;
    const [u0, v0] = keys[i], [u1, v1] = keys[i + 1], h = u1 - u0, t = (u - u0) / h, t2 = t * t, t3 = t2 * t;
    return Math.max(0, (2 * t3 - 3 * t2 + 1) * v0 + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * v1 + (t3 - t2) * h * m[i + 1]);
  };
}
function curvePts(ctrl, step) {
  const dense = [], n = ctrl.length;
  for (let i = 0; i < n - 1; i++) {
    const p1 = ctrl[i], p2 = ctrl[i + 1], p0 = i > 0 ? ctrl[i - 1] : p1, p3 = i < n - 2 ? ctrl[i + 2] : p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let k = 0; k < 20; k++) {
      const t = k / 20, a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, d = t ** 3;
      dense.push([a * p1[0] + b * c1[0] + c * c2[0] + d * p2[0], a * p1[1] + b * c1[1] + c * c2[1] + d * p2[1]]);
    }
  }
  dense.push(ctrl[n - 1]);
  const cum = [0];
  for (let i = 1; i < dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i][0] - dense[i - 1][0], dense[i][1] - dense[i - 1][1]));
  const len = cum[cum.length - 1], N = Math.max(6, Math.round(len / step));
  const out = []; let j = 0;
  for (let i = 0; i <= N; i++) {
    const t = len * i / N;
    while (j < dense.length - 2 && cum[j + 1] < t) j++;
    const s = (t - cum[j]) / Math.max(1e-6, cum[j + 1] - cum[j]);
    out.push([dense[j][0] + (dense[j + 1][0] - dense[j][0]) * s, dense[j][1] + (dense[j + 1][1] - dense[j][1]) * s]);
  }
  return { pts: out, len, N };
}
// ribbon along a centreline with asymmetric half-widths (top = left-of-travel "up" side when moving rightwards)
function ribbon(ctrl, wtK, wbK, step) {
  const cp = curvePts(ctrl, step || 14), N = cp.N, P = cp.pts;
  const wt = hermite(wtK), wb = hermite(wbK == null ? wtK : wbK);
  const nr = P.map((p, i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(N, i + 1)];
    const tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1;
    return [ty / l, -tx / l, tx / l, ty / l];
  });
  const R = { N, P, nr, wt, wb, len: cp.len };
  R.at = (u, fd, off) => {
    u = Math.max(0, Math.min(1, u));
    const x = u * N, i = Math.min(N - 1, Math.floor(x)), s = x - i;
    const px = P[i][0] + (P[i + 1][0] - P[i][0]) * s, py = P[i][1] + (P[i + 1][1] - P[i][1]) * s;
    let nx = nr[i][0] + (nr[i + 1][0] - nr[i][0]) * s, ny = nr[i][1] + (nr[i + 1][1] - nr[i][1]) * s;
    const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const tv = wt(u), bv = wb(u), d = tv - fd * (tv + bv) + (off || 0);
    return [px + nx * d, py + ny * d, Math.atan2(-nx, ny) * 180 / Math.PI];
  };
  R.tn = u => { u = Math.max(0, Math.min(1, u)); const x = u * N, i = Math.min(N - 1, Math.floor(x)), s = x - i; let nx = nr[i][0] + (nr[i + 1][0] - nr[i][0]) * s, ny = nr[i][1] + (nr[i + 1][1] - nr[i][1]) * s; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l; return [-ny, nx, nx, ny]; };
  R.pts = (fd, u0, u1) => { const o = []; const a = Math.round((u0 == null ? 0 : u0) * N), b = Math.round((u1 == null ? 1 : u1) * N); for (let i = a; i <= b; i++) o.push(R.at(i / N, fd)); return o; };
  R.d = () => cr(R.pts(0).concat(R.pts(1).reverse()), true);
  R.edge = (fd, u0, u1) => cr(R.pts(fd, u0, u1), false);
  R.strip = (f0, f1, u0, u1) => cr(R.pts(f0, u0, u1).concat(R.pts(f1, u0, u1).reverse()), true);
  return R;
}
const rot = a => a * Math.PI / 180;
function limb(ctrl, w, fill) {
  const h = hermite(w), [a, k, c] = ctrl, w0 = h(0), w1 = h(.5), w2 = h(1);
  return `<g stroke="${fill}" fill="${fill}" stroke-linecap="round" stroke-linejoin="round"><path d="M${S(a[0], a[1])} L${S(k[0], k[1])}" stroke-width="${f(w0 + w1)}"/><path d="M${S(k[0], k[1])} L${S(c[0], c[1])}" stroke-width="${f(w1 + w2)}"/></g>`;
}
// light rays + bubbles for marine animals
function marineFx(seed, cols) {
  const rnd = L.rng(seed); let s = '';
  s += `<g opacity=".5">`;
  [[120, 60, 60], [250, 30, 90], [420, 50, 70], [560, 20, 100], [690, 40, 60]].forEach(([x, w, op], i) => {
    s += `<path d="M${x},20 L${x + w},20 L${x + w - 150},590 L${x - 70},590 Z" fill="url(#ray)" opacity="${(op / 130).toFixed(2)}"/>`;
  });
  s += `</g>`;
  for (let i = 0; i < 12; i++) {
    const x = 60 + rnd() * 680, y = 50 + rnd() * 500, r = 3 + rnd() * 8;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#cdeff7" fill-opacity=".14" stroke="#e8fbff" stroke-opacity=".6" stroke-width="1.6"/><circle cx="${f(x - r * .35)}" cy="${f(y - r * .35)}" r="${f(r * .22)}" fill="#fff" opacity=".8"/>`;
  }
  return s;
}
const rayDef = `<linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8f6ff" stop-opacity=".9"/><stop offset="1" stop-color="#d8f6ff" stop-opacity="0"/></linearGradient>`;
const softDef = (id, sd) => `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
const grad = (id, stops, v) => `<linearGradient id="${id}" x1="${v === 'h' ? 0 : 0}" y1="0" x2="${v === 'h' ? 1 : 0}" y2="${v === 'h' ? 0 : 1}">` + stops.map((c, i) => `<stop offset="${f(i / (stops.length - 1))}" stop-color="${c}"/>`).join('') + `</linearGradient>`;
const shadowEl = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry || 22}" fill="#1b2430" opacity=".35"/>`;
const svgWrap = (defs, body) => `<defs>${defs}</defs>${body}`;

const art = {};
const pieces = {};

// ======================================================= GECKO
pieces.gecko = function () {
  const rnd = L.rng(11);
  const defs = [
    grad('skin', ['#9CC3D3', '#6A9AB5', '#41648A']),
    grad('limb', ['#86B0C4', '#5887A6', '#3B5D83']),
    grad('limbFar', ['#5E88A3', '#44698D', '#324D74']),
    softDef('soft', 7),
    `<pattern id="gran" width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.4" fill="#fff" opacity=".5"/><circle cx="8.5" cy="8.5" r="2.4" fill="#fff" opacity=".5"/><circle cx="8.5" cy="3" r="1.3" fill="#1d3354" opacity=".35"/><circle cx="3" cy="8.5" r="1.3" fill="#1d3354" opacity=".35"/></pattern>`
  ];
  const ctrl = [[70, 250], [78, 325], [120, 395], [200, 428], [295, 420], [385, 410], [470, 406], [545, 404], [600, 394], [655, 380], [712, 376], [768, 388]];
  const wt = [[0, 2], [.1, 9], [.2, 16], [.3, 28], [.4, 46], [.5, 58], [.6, 56], [.68, 44], [.74, 34], [.8, 42], [.88, 48], [.94, 38], [.98, 18], [1, 5]];
  const wb = [[0, 2], [.1, 8], [.2, 15], [.3, 26], [.4, 42], [.5, 50], [.6, 44], [.68, 28], [.74, 22], [.8, 32], [.88, 36], [.94, 24], [.98, 11], [1, 4]];
  const B = ribbon(ctrl, wt, wb, 20);
  defs.push(`<clipPath id="bc"><path d="${B.d()}"/></clipPath>`);
  const o = [];
  o.push(shadowEl(410, 506, 310, 20));
  // toes with sticky pads
  function foot(x, y, far, sc) {
    let s = '';
    const col = far ? '#4B7595' : '#6E9CB8', pad = far ? '#D8C79A' : '#F3E5B8', lam = far ? '#A28D5E' : '#B79D68';
    [[-48, 42], [-24, 52], [0, 56], [24, 52], [48, 42]].forEach(([a, l], i) => {
      l *= sc;
      const ex = x + Math.cos(rot(a)) * l, ey = y + Math.sin(rot(a)) * l * .75;
      s += `<path d="M${S(x, y)} L${S(ex, ey)}" stroke="${col}" stroke-width="${far ? 10 : 12}" stroke-linecap="round"/>`;
      const ang = Math.atan2(ey - y, ex - x) * 180 / Math.PI;
      s += `<g transform="translate(${S(ex, ey)}) rotate(${f(ang)})"><ellipse cx="2" cy="0" rx="${f(12 * sc)}" ry="${f(9 * sc)}" fill="${pad}"/>`;
      for (let k = -1; k <= 1; k++) s += `<path d="M${f(k * 4.5 * sc - 1)},${f(-7 * sc)} Q${f(k * 4.5 * sc + 3)},0 ${f(k * 4.5 * sc - 1)},${f(7 * sc)}" stroke="${lam}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M${f(14 * sc)},0 l${f(5 * sc)},0" stroke="#33456a" stroke-width="2.2" stroke-linecap="round"/></g>`;
    });
    s += `<circle cx="${x}" cy="${y}" r="${far ? 9 : 11}" fill="${col}"/>`;
    return s;
  }
  // far legs
  const H=B.at(.42,.78), Fr=B.at(.64,.78); const add=(p,dx,dy)=>[p[0]+dx,p[1]+dy];
  o.push(limb([H, add(H,40,30), add(H,-2,78)], [[0, 26], [.5, 16], [1, 12]], 'url(#limbFar)'));
  o.push(foot(H[0]-2, H[1]+78, true, .85));
  o.push(limb([Fr, add(Fr,-26,34), add(Fr,36,72)], [[0, 22], [.5, 14], [1, 10]], 'url(#limbFar)'));
  o.push(foot(Fr[0]+40, Fr[1]+72, true, .8));
  // body
  o.push(`<path d="${B.d()}" fill="url(#skin)"/>`);
  o.push(`<g clip-path="url(#bc)">`);
  o.push(`<path d="${B.strip(.62, 1.05)}" fill="#DCE9DE" opacity=".9"/>`);
  o.push(`<path d="${B.strip(.5, .66)}" fill="#2A4670" opacity=".28" filter="url(#soft)"/>`);
  o.push(`<path d="${B.strip(-.05, .22, .12, .9)}" fill="#EAFBFF" opacity=".55" filter="url(#soft)"/>`);
  // tail bands + body bands
  for (let k = 0; k < 7; k++) {
    const u0 = .06 + k * .042, u1 = u0 + .022;
    o.push(`<path d="${B.strip(-.1, 1.1, u0, u1)}" fill="#2B4469" opacity=".42"/>`);
  }
  [[.36, .39], [.45, .49], [.55, .59]].forEach(([a, b]) => o.push(`<path d="${B.strip(-.1, .72, a, b)}" fill="#2B4469" opacity=".3"/>`));
  o.push(`<rect x="0" y="0" width="800" height="600" fill="url(#gran)" opacity=".3"/>`);
  // orange spots
  for (let i = 0; i < 34; i++) {
    const u = .28 + rnd() * .62, fd = .02 + rnd() * .5, p = B.at(u, fd), r = 3.5 + rnd() * 6.5;
    o.push(`<ellipse cx="${f(p[0])}" cy="${f(p[1])}" rx="${f(r * 1.2)}" ry="${f(r)}" fill="${rnd() > .3 ? '#F28B38' : '#FFB75E'}" opacity=".95" transform="rotate(${f(p[2])} ${f(p[0])} ${f(p[1])})"/>`);
  }
  o.push(`</g>`);
  o.push(`<path d="${B.edge(0, .16, .98)}" stroke="#D5F4FF" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`);
  o.push(`<path d="${B.edge(1, .3, .72)}" stroke="#25364f" stroke-width="3" fill="none" opacity=".25"/>`);
  // head details
  o.push(`<path d="${B.edge(.62, .8, .985)}" stroke="#274064" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".7"/>`);
  const n = B.at(.972, .28);
  o.push(`<ellipse cx="${f(n[0])}" cy="${f(n[1])}" rx="3.5" ry="2.6" fill="#1f2f4a"/>`);
  const e = B.at(.87, .3);
  o.push(`<circle cx="${f(e[0])}" cy="${f(e[1])}" r="27" fill="#4F7DA0"/><circle cx="${f(e[0])}" cy="${f(e[1])}" r="22" fill="#F7C948"/><circle cx="${f(e[0])}" cy="${f(e[1])}" r="22" fill="#E58B2A" opacity=".35" clip-path="none"/>`);
  o.push(`<path d="M${S(e[0] - 17, e[1] - 6)} A19,19 0 0 1 ${S(e[0] + 17, e[1] - 6)}" stroke="#FFE98A" stroke-width="3" fill="none" opacity=".8"/>`);
  o.push(`<ellipse cx="${f(e[0] + 1)}" cy="${f(e[1])}" rx="4.6" ry="18" fill="#1a1630"/><circle cx="${f(e[0] + 8)}" cy="${f(e[1] - 9)}" r="4" fill="#fff"/><circle cx="${f(e[0] - 6)}" cy="${f(e[1] + 8)}" r="1.8" fill="#fff" opacity=".8"/>`);
  o.push(`<path d="M${S(e[0] - 26, e[1] - 18)} q24,-18 52,-2" stroke="#2B4469" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/>`);
  // near legs
  const H2=add(H,40,0), F2=add(Fr,-30,0);
  o.push(limb([H2, add(H2,46,32), add(H2,-12,80)], [[0, 32], [.5, 19], [1, 13]], 'url(#limb)'));
  o.push(`<path d="${cr([add(H2,-6,-6), add(H2,34,24), add(H2,-6,60)], false)}" stroke="#CBEFFF" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>`);
  o.push(foot(H2[0]-12, H2[1]+80, false, 1));
  o.push(limb([F2, add(F2,-30,36), add(F2,34,74)], [[0, 28], [.5, 17], [1, 12]], 'url(#limb)'));
  o.push(`<path d="${cr([add(F2,4,-4), add(F2,-20,30), add(F2,26,62)], false)}" stroke="#CBEFFF" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>`);
  o.push(foot(F2[0]+38, F2[1]+74, false, 1));
  return svgWrap(defs.join(''), o.join(''));
};

// ---------- build ----------
const ids = process.argv.slice(2);
Object.keys(pieces).forEach(id => {
  if (ids.length && !ids.includes(id)) return;
  const labels = {
    sauropsid: 'An early sprawling reptile-like animal', lepidosaur: 'An early lizard-like lepidosaur', gecko: 'A gecko with sticky toe pads',
    snake: 'A coiled snake with raised head', tuatara: 'A tuatara', mosasaur: 'A mosasaur swimming', plesiosaur: 'A long-necked plesiosaur',
    ichthyosaur: 'An ichthyosaur', turtle: 'A green sea turtle', tortoise: 'A domed tortoise'
  };
  art[id] = L.wrap(id, pieces[id](), { label: labels[id] });
});
L.writeFile('reptiles', art);
const order = Object.keys(art);
let html = '<!doctype html><meta charset="utf-8"><title>reptiles</title><body style="background:#e9eef2;font:12px sans-serif"><div style="display:grid;grid-template-columns:repeat(1,700px);gap:12px">';
order.forEach(id => { html += `<div style="background:#f6f1e6;border-radius:8px;padding:4px"><b>${id}</b> ${Math.round(art[id].length / 1024)}KB<div style="width:680px;height:510px">${art[id]}</div><div style="width:120px;height:90px;display:inline-block">${art[id]}</div></div>`; });
html += '</div>';
fs.mkdirSync(path.join(__dirname, '..', 'sheets'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'sheets', 'reptiles.html'), html);
