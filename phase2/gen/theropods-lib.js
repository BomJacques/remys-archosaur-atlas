// Shared drawing toolkit for the theropod group (800x600 canvas, animals face right)
const L = require('../lib');
const f = L.f;

// Catmull-Rom -> cubic bezier path through points
function smooth(pts, closed) {
  const n = pts.length;
  const P = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
  }
  return d + (closed ? 'Z' : '');
}

// points [x,y,up,down]; returns offset point at fraction fr (>=0 toward "up" side, <0 toward "down")
function offs(pts) {
  const n = pts.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const up = pts[i][2], dn = pts[i].length > 3 ? pts[i][3] : pts[i][2];
    out.push({ x: pts[i][0], y: pts[i][1], nx: ty, ny: -tx, tx, ty, up, dn });
  }
  return out;
}
function at(o, fr) { const w = fr >= 0 ? o.up : o.dn; return [o.x + o.nx * w * fr, o.y + o.ny * w * fr]; }
// closed tube outline with rounded caps
function tube(pts, capK) {
  const o = offs(pts), U = o.map(p => at(p, 1)), D = o.map(p => at(p, -1)).reverse();
  const e = o[o.length - 1], s = o[0], k = capK === undefined ? .6 : capK;
  const ew = Math.max(e.up, e.dn) * k, sw = Math.max(s.up, s.dn) * k;
  const poly = U.concat(k ? [[e.x + e.tx * ew, e.y + e.ty * ew]] : [], D, k ? [[s.x - s.tx * sw, s.y - s.ty * sw]] : []);
  return smooth(poly, true);
}
// band between fractions a and b of the half-widths (a,b in -1..1)
function band(pts, a, b) {
  const o = offs(pts);
  const A = o.map(p => at(p, a)), B = o.map(p => at(p, b)).reverse();
  return smooth(A.concat(B), true);
}
// open edge line at fraction fr
function edge(pts, fr, from, to) {
  const o = offs(pts).map(p => at(p, fr));
  return smooth(o.slice(from || 0, to === undefined ? o.length : to), false);
}

// ---- piece builder ----
class Piece {
  constructor(pre) { this.defs = []; this.out = []; this.n = 0; this.pre = pre || ''; }
  id(p) { return this.pre + (p || 'k') + (++this.n); }
  def(s) { this.defs.push(s); }
  add(s) { this.out.push(s); }
  grad(id, stops, o) {
    o = o || {};
    const x1 = o.x1 === undefined ? 0 : o.x1, y1 = o.y1 === undefined ? 0 : o.y1, x2 = o.x2 === undefined ? 0 : o.x2, y2 = o.y2 === undefined ? 1 : o.y2;
    this.def(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">` + stops.map(([t, c, op]) => `<stop offset="${t}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('') + `</linearGradient>`);
    return `url(#${id})`;
  }
  rgrad(id, stops, cx, cy, r) {
    this.def(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">` + stops.map(([t, c, op]) => `<stop offset="${t}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`).join('') + `</radialGradient>`);
    return `url(#${id})`;
  }
  clip(id, d) { this.def(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return `url(#${id})`; }
  blur(id, sd) { this.def(`<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="${sd}"/></filter>`); return `url(#${id})`; }
  // scale pattern (arcs)
  // pebbled / scaly skin pattern: staggered dark dots with light dot offset
  scales(id, col, w, h, sw, op, hi) {
    this.def(`<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse"><circle cx="${f(w/4)}" cy="${f(h/4)}" r="${sw}" fill="${col}" opacity="${op}"/><circle cx="${f(w*.75)}" cy="${f(h*.75)}" r="${sw}" fill="${col}" opacity="${op}"/>${hi ? `<circle cx="${f(w/4-sw*.5)}" cy="${f(h/4-sw*.5)}" r="${f(sw*.5)}" fill="${hi}" opacity="${op}"/><circle cx="${f(w*.75-sw*.5)}" cy="${f(h*.75-sw*.5)}" r="${f(sw*.5)}" fill="${hi}" opacity="${op}"/>` : ''}</pattern>`);
    return `url(#${id})`;
  }
  svg() { return `<defs>${this.defs.join('')}</defs>` + this.out.join(''); }
}

// A big body part: base tube with 3-tone shading. pts are [x,y,up,down]; c = {top,mid,bot,hi,sh,belly,rim}
// Returns clip url so caller can add more clipped detail.
function bodyPart(P, pts, c, o) {
  o = o || {};
  const id = P.id('bp'), d = tube(pts, o.cap);
  const g = P.grad(P.id('g'), [[0, c.top], [.55, c.mid], [1, c.bot]], { y1: 0, y2: 1 });
  const cl = P.clip(id, d);
  P.add(`<path d="${d}" fill="${g}"/>`);
  P.add(`<g clip-path="${cl}">`);
  if (c.belly) P.add(`<path d="${band(pts, -.35, -1.2)}" fill="${c.belly}" opacity="${o.bellyOp || .85}"/>`);
  P.add(`<path d="${band(pts, -.5, -1.3)}" fill="${c.sh}" opacity=".38"/>`);
  if (o.tex) P.add(`<path d="${d}" fill="${o.tex}"/>`);
  if (c.hi) P.add(`<path d="${band(pts, .98, .4)}" fill="${c.hi}" opacity=".32"/>`);
  P.add(`</g>`);
  if (c.rim) P.add(`<path d="${edge(pts, .94, o.rimFrom, o.rimTo)}" fill="none" stroke="${c.rim}" stroke-width="${o.rimW || 3}" stroke-linecap="round" opacity=".75"/>`);
  return { d, clip: cl, id };
}

// simple shaded tube (limbs): base + top highlight band + bottom shadow band
function limbPart(P, pts, c, o) {
  o = o || {};
  const d = tube(pts, o.cap);
  P.add(`<path d="${d}" fill="${c.mid}"/>`);
  P.add(`<path d="${band(pts, -.2, -.98)}" fill="${c.sh}" opacity="${o.shOp || .5}"/>`);
  if (c.hi) P.add(`<path d="${band(pts, .95, .35)}" fill="${c.hi}" opacity="${o.hiOp || .4}"/>`);
  return d;
}

function claw(x, y, ang, len, w, col, hi) {
  const d = `M0,${-w / 2} Q${f(len * .6)},${f(-w * .5)} ${f(len)},${f(w * .5)} Q${f(len * .5)},${f(w * .2)} 0,${w / 2} Z`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${ang})"><path d="${d}" fill="${col}"/>` + (hi ? `<path d="M${f(len * .1)},${f(-w * .25)} Q${f(len * .55)},${f(-w * .35)} ${f(len * .9)},${f(w * .35)}" stroke="${hi}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".6"/>` : '') + `</g>`;
}

// teeth along a line from (x1,y1) to (x2,y2); n teeth of length len pointing dir (1 = down, -1 = up)
function teeth(x1, y1, x2, y2, n, len, w, dir, col) {
  let d = '';
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? .5 : i / (n - 1), x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t;
    const l = len * (.75 + .5 * Math.sin(t * 3.1));
    d += `M${f(x - w / 2)},${f(y)} L${f(x + w * .1)},${f(y + dir * l)} L${f(x + w / 2)},${f(y)}Z`;
  }
  return `<path d="${d}" fill="${col || '#FFF6E0'}"/>`;
}

function eye(x, y, r, iris, pup) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${iris}"/><ellipse cx="${f(x + r * .1)}" cy="${y}" rx="${f(r * .55)}" ry="${f(r * .8)}" fill="${pup || '#1a1630'}"/><circle cx="${f(x + r * .35)}" cy="${f(y - r * .4)}" r="${f(r * .3)}" fill="#fff"/>`;
}

function ground(cx, cy, rx, ry, op) {
  return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#1b1838" opacity="${op || .35}"/>`;
}

// fuzz: short rounded strokes along the top of a tube (downy protofeathers). returns a path string
function fuzz(pts, fr, n, len, ang, col, sw, seed, opt) {
  opt = opt || {};
  const r = L.rng(seed || 7), o = offs(pts);
  let d = '';
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1) * (o.length - 1), k = Math.floor(t), a = o[k], b = o[Math.min(o.length - 1, k + 1)], u = t - k;
    const pa = at(a, fr), pb = at(b, fr);
    const x = pa[0] + (pb[0] - pa[0]) * u + (r() - .5) * 6, y = pa[1] + (pb[1] - pa[1]) * u + (r() - .5) * 6;
    const an = (ang + (r() - .5) * (opt.spread || 40)) * Math.PI / 180, l = len * (.6 + r() * .8);
    // curved tuft
    const dx = Math.cos(an) * l, dy = Math.sin(an) * l;
    d += `M${f(x)},${f(y)}q${f(dx * .5 + dy * .15)},${f(dy * .5 - dx * .15)} ${f(dx)},${f(dy)}`;
  }
  return `<path d="${d}" stroke="${col}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
}

// vane feather (leaf shape) as <g> at x,y,angle
function feather(x, y, ang, len, w, bend, fill, lite) {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)})">${L.leafFeather(len, w, bend, fill, lite)}</g>`;
}
// small feather (no ribs) using <use>
function useF(id, x, y, ang, sx, sy, fill) {
  return `<use href="#${id}" transform="translate(${f(x)} ${f(y)}) rotate(${f(ang)}) scale(${sx} ${sy || sx})"${fill ? ` fill="${fill}"` : ''}/>`;
}

// Bipedal theropod leg. o: {hip,knee,ankle,foot:[x,y], w:[thigh,knee,ankle,metatarsus], c:{mid,sh,hi}, toe:{len,w,claw,spread}, hallux}
function leg(P, o) {
  const c = o.c, [hip, knee, ank, ft] = [o.hip, o.knee, o.ankle, o.foot], w = o.w;
  const gy = ft[1];
  const toes = o.toes || [[1, 0], [.82, -.12], [.7, .1]];
  const tl = o.toeLen || 60, tw = o.toeW || 13;
  // toes behind shin first
  toes.forEach((t, i) => {
    const tx = ft[0] + tl * t[0], ty = gy - 4 + (t[1]) * 14 * 0 + (i === 1 ? -3 : i === 2 ? 2 : 0);
    const pts = [[ft[0], gy - tw * .6, tw * .75, tw * .55], [ft[0] + (tx - ft[0]) * .5, gy - tw * .4 + (i === 1 ? -3 : 0), tw * .5, tw * .45], [tx, ty + (i === 0 ? 2 : 0) - tw * .3, tw * .28, tw * .3]];
    limbPart(P, pts, c, { cap: .5 });
    P.add(claw(tx + tw * .1, ty - tw * .2, 20, tw * 1.15, tw * .6, o.claw || '#4A3A30', '#9a8a7a'));
  });
  if (o.hallux) P.add(claw(ft[0] - 10, ft[1] - 38, 140, 18, 8, o.claw || '#4A3A30'));
  limbPart(P, [[ank[0], ank[1], w[2], w[2]], [ft[0], ft[1] - 6, w[3], w[3]]], c, { cap: .3 });
  limbPart(P, [[knee[0], knee[1], w[1], w[1]], [ank[0], ank[1], w[2], w[2]]], c, { cap: .4 });
  limbPart(P, [[hip[0], hip[1], w[0], w[0]], [(hip[0] + knee[0]) / 2 + (o.thighBulge || 0), (hip[1] + knee[1]) / 2, w[0] * .95, w[0] * .8], [knee[0], knee[1], w[1], w[1]]], c, { cap: .4 });
  // knee + ankle joints
  P.add(`<circle cx="${knee[0]}" cy="${knee[1]}" r="${f(w[1] * .85)}" fill="${c.mid}"/><circle cx="${f(knee[0] - w[1] * .2)}" cy="${f(knee[1] - w[1] * .25)}" r="${f(w[1] * .5)}" fill="${c.hi}" opacity=".3"/>`);
}

// generic head: h = {head:[pts], jaw:[pts], eye:[x,y,r], iris, nostril:[x,y], mouth:'path d', up:[x1,y1,x2,y2,n,len,w], low:[...], brow:[svg strings], tex, shade}
function drawHead(P, c, h) {
  const jd = smooth(h.jaw, true);
  P.add(`<path d="${jd}" fill="${c.bot}"/><path d="${smooth(h.jaw.slice(2, 7), true)}" fill="${c.belly}" opacity=".7"/>`);
  if (h.low) P.add(teeth(...h.low, -1, '#F7EBCB'));
  const hd = smooth(h.head, true), hg = P.grad(P.id('hg'), [[0, c.top], [.6, c.mid], [1, c.bot]]);
  const hc = P.clip(P.id('hc'), hd);
  P.add(`<path d="${hd}" fill="${hg}"/><g clip-path="${hc}">` + (h.tex ? `<path d="${hd}" fill="${h.tex}"/>` : '') + (h.shade || '') + `</g>`);
  P.add(`<path d="${smooth(h.head.slice(0, h.rimN || 6), false)}" stroke="${c.rim}" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/>`);
  P.add(`<path d="${h.mouth}" stroke="#23283E" stroke-width="3" fill="none" stroke-linecap="round" opacity=".75"/>`);
  if (h.up) P.add(teeth(...h.up, 1, '#FFF6E0'));
  (h.brow || []).forEach(b => P.add(b));
  P.add(`<ellipse cx="${h.nostril[0]}" cy="${h.nostril[1]}" rx="6" ry="3.5" fill="#1F2438" transform="rotate(25 ${h.nostril[0]} ${h.nostril[1]})"/>`);
  P.add(eye(h.eye[0], h.eye[1], h.eye[2], h.iris || '#F4B73A'));
  P.add(`<path d="M${h.eye[0] - h.eye[2] - 3},${h.eye[1] - h.eye[2] * .6} Q${h.eye[0]},${h.eye[1] - h.eye[2] * 1.5} ${h.eye[0] + h.eye[2] + 4},${h.eye[1] - h.eye[2] * .7}" stroke="#1F2A3A" stroke-width="3" fill="none" stroke-linecap="round" opacity=".55"/>`);
}

module.exports = { drawHead, leg, L, f, smooth, tube, band, edge, offs, at, Piece, bodyPart, limbPart, claw, teeth, eye, ground, fuzz, feather, useF };
