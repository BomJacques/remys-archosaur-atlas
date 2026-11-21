// Shared drawing kit for the herbivores group (800x600 authoring canvas, animals face RIGHT)
const L = require('../lib');
const f = L.f;
let UID = 0;
const uid = () => 'u' + (++UID);

// ---- geometry ----
function cr(pts, n) {
  const P = [pts[0]].concat(pts, [pts[pts.length - 1]]);
  const out = [];
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const c = (a, b, c_, d) => 0.5 * ((2 * b) + (-a + c_) * t + (2 * a - 5 * b + 4 * c_ - d) * t2 + (-a + 3 * b - 3 * c_ + d) * t3);
      const s = t * t * (3 - 2 * t);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1]), p1[2] + (p2[2] - p1[2]) * s]);
    }
  }
  const l = pts[pts.length - 1];
  out.push([l[0], l[1], l[2]]);
  return out;
}
const poly = (a, close) => 'M' + a.map(p => Math.round(p[0]) + ',' + Math.round(p[1])).join('L') + (close === false ? '' : 'Z');
// ribbon through [x,y,halfwidth] control points. L side = "up/front" side for rightward travel.
function ribbon(pts, n) {
  const c = cr(pts, n || 5), Lp = [], Rp = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = dy / l, ny = -dx / l;
    Lp.push([c[i][0] + nx * c[i][2], c[i][1] + ny * c[i][2]]);
    Rp.push([c[i][0] - nx * c[i][2], c[i][1] - ny * c[i][2]]);
  }
  return { c, L: Lp, R: Rp, d: poly(Lp.concat(Rp.slice().reverse())) };
}
const sl = (arr, a, b) => arr.slice(Math.floor(arr.length * a), Math.ceil(arr.length * b) + 1);
// point + tangent angle (deg) at fraction t along arr(L/R/c)
function at(rib, t, side) {
  const arr = rib[side || 'L'], i = Math.max(1, Math.min(arr.length - 2, Math.round(t * (arr.length - 1))));
  const a = arr[i - 1], b = arr[i + 1];
  return { x: arr[i][0], y: arr[i][1], ang: Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI, w: rib.c[i][2] };
}
const ell = (cx, cy, rx, ry, extra) => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" ${extra || ''}/>`;
const SOFT = '<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>';

// ---- skin: union fill + shading + rim ----
// parts: array of ribbons or raw d strings. main: ribbon providing the back (L) and belly (R) edges.
// col: {hi, base, lo, sh, rim, lite}; o: {y0,y1 gradient span, tex, sw (belly shadow width), hw (highlight width), vert}
function skin(parts, main, col, o) {
  o = o || {};
  const id = uid(), ds = parts.map(p => typeof p === 'string' ? p : p.d);
  let s = ds.map((d, k) => `<path id="${id}p${k}" d="${d}"/>`).join('') + `<clipPath id="${id}c">${ds.map((d, k) => `<use href="#${id}p${k}"/>`).join('')}</clipPath>`;
  const vert = o.horizontal ? `x1="${o.y0}" y1="0" x2="${o.y1}" y2="0"` : `x1="0" y1="${o.y0}" x2="0" y2="${o.y1}"`;
  s += `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" ${vert}><stop offset="0" stop-color="${col.hi}"/><stop offset=".5" stop-color="${col.base}"/><stop offset="1" stop-color="${col.lo}"/></linearGradient>`;
  s = `<defs>${s}</defs>`;
  ds.forEach((d, k) => { s += `<use href="#${id}p${k}" fill="url(#${id}g)"/>`; });
  s += `<g clip-path="url(#${id}c)">`;
  if (o.belly !== false) s += `<path d="${poly(sl(main.R, o.r0 || 0, o.r1 || 1), false)}" stroke="${col.sh}" stroke-width="${o.sw || 46}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".5" filter="url(#soft)"/>`;
  if (o.hl !== false) s += `<path d="${poly(sl(main.L, o.h0 || 0, o.h1 || 1), false)}" stroke="${col.lite}" stroke-width="${o.hw || 20}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".42" filter="url(#soft)" transform="translate(0 ${o.hdy === undefined ? 9 : o.hdy})"/>`;
  if (o.tex) s += o.tex;
  if (o.post) s += o.post;
  s += `<path d="${poly(sl(main.L, o.h0 || 0, o.h1 || 1), false)}" stroke="${col.rim}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".62"/>`;
  s += `</g>`;
  return s;
}

// ---- textures (return strings; apply inside a clipped group) ----
function arcField(rand, x0, y0, x1, y1, dx, dy, size, color, op, sw) {
  let d = '';
  for (let r = 0, y = y0; y < y1; y += dy, r++) for (let x = x0 + (r % 2) * dx / 2; x < x1; x += dx) {
    const jx = (rand() - .5) * dx * .25, jy = (rand() - .5) * dy * .25;
    d += `M${f(x + jx - size)},${f(y + jy)}q${f(size)},${f(size * 1.15)} ${f(size * 2)},0`;
  }
  return `<path d="${d}" stroke="${color}" stroke-width="${sw || 2.6}" fill="none" stroke-linecap="round" opacity="${op}"/>`;
}
function pebbles(rand, x0, y0, x1, y1, n, rmin, rmax, color, op) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + rand() * (x1 - x0), y = y0 + rand() * (y1 - y0), r = rmin + rand() * (rmax - rmin);
    d += `M${f(x - r)},${f(y)}a${f(r)},${f(r * .78)} 0 1,0 ${f(r * 2)},0a${f(r)},${f(r * .78)} 0 1,0 ${f(-r * 2)},0`;
  }
  return `<path d="${d}" fill="${color}" opacity="${op}"/>`;
}
function bands(x0, x1, y0, y1, n, color, op, lean, wid, rand) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + (x1 - x0) * (i + .5) / n, w = wid * (.6 + .8 * rand());
    s += `<path d="M${f(x)},${y0}q${f(lean)},${f((y1 - y0) / 2)} ${f(lean * .3)},${f(y1 - y0)}" stroke="${color}" stroke-width="${f(w)}" fill="none" opacity="${op}" stroke-linecap="round"/>`;
  }
  return s;
}
const shadow = (cx, cy, rx, ry) => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry || rx * .1)}" fill="#0a0e26" opacity=".35"/>`;
function eye(x, y, r, iris, o) {
  o = o || {};
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${iris || '#F2B84B'}"/><circle cx="${f(x + r * .1)}" cy="${f(y)}" r="${f(r * .62)}" fill="#1a1630"/><circle cx="${f(x + r * .42)}" cy="${f(y - r * .38)}" r="${f(r * .3)}" fill="#fff"/>` +
    `<path d="M${f(x - r * 1.25)},${f(y - r * .55)}Q${f(x)},${f(y - r * 1.5 - (o.brow || 0))} ${f(x + r * 1.3)},${f(y - r * .45 + (o.tilt || 0))}" stroke="${o.browCol || '#33402a'}" stroke-width="${f(Math.max(2.5, r * .38))}" fill="none" stroke-linecap="round" opacity=".7"/>`;
}
// claw / hoof helpers
const claw = (x, y, ang, len, w, fill) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})"><path d="M0,${f(-w / 2)}C${f(len * .5)},${f(-w * .5)} ${f(len * .9)},${f(-w * .2)} ${f(len)},${f(w * .35)}C${f(len * .6)},${f(w * .3)} ${f(len * .3)},${f(w * .5)} 0,${f(w / 2)}Z" fill="${fill}"/></g>`;
// elephantine / hoofed foot at ground: x centre, gy ground y, w width, toes count
function foot(x, gy, w, h, skinc, nailc, toes, dir) {
  dir = dir || 1;
  let s = `<path d="M${f(x - w * .5)},${f(gy - h)}C${f(x - w * .62)},${f(gy - h * .3)} ${f(x - w * .5)},${f(gy)} ${f(x - w * .2)},${f(gy)}L${f(x + w * .45 * dir + w * .1)},${f(gy)}C${f(x + w * .78)},${f(gy)} ${f(x + w * .7)},${f(gy - h * .5)} ${f(x + w * .5)},${f(gy - h)}Z" fill="${skinc}"/>`;
  for (let i = 0; i < toes; i++) {
    const tx = x - w * .12 + (i + .5) * (w * .62 / toes) + w * .04;
    s += `<path d="M${f(tx - w * .08)},${f(gy - h * .22)}q${f(w * .08)},${f(-h * .35)} ${f(w * .16)},0l0,${f(h * .24)}l${f(-w * .16)},0Z" fill="${nailc}"/>`;
  }
  return s;
}

const ep = (cx, cy, rx, ry) => `M${f(cx - rx)},${f(cy)}a${f(rx)},${f(ry)} 0 1,0 ${f(rx * 2)},0a${f(rx)},${f(ry)} 0 1,0 ${f(-rx * 2)},0Z`;
module.exports = { ep, GY: 520, L, f, uid, cr, poly, ribbon, sl, at, ell, SOFT, skin, arcField, pebbles, bands, shadow, eye, claw, foot, rng: L.rng };
