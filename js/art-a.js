window.ART = window.ART || {};
(function () {
  'use strict';
  var ART = window.ART;

  /* ---------- helpers ---------- */
  function build(id, fn) {
    var defs = [];
    function stops(cs) {
      return cs.map(function (c, i) {
        return '<stop offset="' + (cs.length === 1 ? 0 : i / (cs.length - 1)) + '" stop-color="' + c + '"/>';
      }).join('');
    }
    function g(n, cs, dir) {
      var gid = id + '-' + n;
      var xy = dir === 'h' ? 'x1="0" y1="0" x2="1" y2="0"' : dir === 'd' ? 'x1="0" y1="0" x2="1" y2="1"' : 'x1="0" y1="0" x2="0" y2="1"';
      defs.push('<linearGradient id="' + gid + '" ' + xy + '>' + stops(cs) + '</linearGradient>');
      return 'url(#' + gid + ')';
    }
    function rg(n, cs, cx, cy, r) {
      var gid = id + '-' + n;
      defs.push('<radialGradient id="' + gid + '" cx="' + (cx == null ? 0.4 : cx) + '" cy="' + (cy == null ? 0.35 : cy) + '" r="' + (r == null ? 0.75 : r) + '">' + stops(cs) + '</radialGradient>');
      return 'url(#' + gid + ')';
    }
    var body = fn(g, rg);
    ART[id] = '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">' +
      (defs.length ? '<defs>' + defs.join('') + '</defs>' : '') + body + '</svg>';
  }

  var INK = '#2a1d14';
  function eye(x, y, r, o) {
    o = o || {};
    var pupil = o.slit
      ? '<ellipse cx="' + (x + r * 0.15) + '" cy="' + y + '" rx="' + (r * 0.22) + '" ry="' + (r * 0.8) + '" fill="' + INK + '"/>'
      : '<circle cx="' + (x + r * 0.2) + '" cy="' + y + '" r="' + (r * 0.62) + '" fill="' + INK + '"/>';
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + (o.iris || '#fff') + '" stroke="' + INK + '" stroke-opacity=".35" stroke-width="1"/>' +
      pupil + '<circle cx="' + (x + r * 0.42) + '" cy="' + (y - r * 0.3) + '" r="' + (r * 0.24) + '" fill="#fff"/>';
  }
  function sh(cx, cy, rx, op) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + (rx * 0.09) + '" fill="' + INK + '" opacity="' + (op || 0.2) + '"/>';
  }
  function limb(d, w, c, extra) {
    return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"' + (extra || '') + '/>';
  }
  function teeth(x0, y0, n, step, size, dir) {
    var o = '';
    for (var i = 0; i < n; i++) {
      var x = x0 + i * step;
      o += '<path d="M' + x + ' ' + y0 + ' l' + (step * 0.5) + ' ' + (size * (dir || 1)) + ' l' + (step * 0.5) + ' ' + (-size * (dir || 1)) + 'z" fill="#fffaf0" stroke="#d8cdb8" stroke-width=".5"/>';
    }
    return o;
  }
  function waves(y, c, op) {
    return '<path d="M0 ' + y + ' Q25 ' + (y - 10) + ' 50 ' + y + ' T100 ' + y + ' T150 ' + y + ' T200 ' + y + ' T250 ' + y + ' T300 ' + y + ' T350 ' + y + ' T400 ' + y + ' V300 H0z" fill="' + c + '" opacity="' + op + '"/>';
  }

  /* ---------- scenery helpers ---------- */
  function cloud(x, y, s, op) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" opacity="' + (op || 0.85) + '" fill="#fff">' +
      '<ellipse cx="0" cy="0" rx="34" ry="12"/><ellipse cx="-14" cy="-9" rx="18" ry="12"/><ellipse cx="10" cy="-12" rx="20" ry="14"/></g>';
  }
  function sun(x, y, r, c1, c2) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 1.7) + '" fill="' + c2 + '" opacity=".25"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 1.3) + '" fill="' + c2 + '" opacity=".35"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c1 + '"/>';
  }
  function frondPath(d, c, w) {
    return '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="' + w + '" stroke-dasharray="2.4 2.2"/>' +
      '<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="1.6"/>';
  }
  function fern(x, y, s, c) {
    var as = [-66, -42, -18, 8, 32, 58], o = '';
    for (var i = 0; i < as.length; i++) {
      var a = as[i], len = 46 * s * (1 - Math.abs(a - 0) / 220), sg = a >= 0 ? 1 : -1;
      o += '<g transform="translate(' + x + ' ' + y + ') rotate(' + a + ')">' +
        frondPath('M0 0 Q0 ' + (-len * 0.9) + ' ' + (len * 0.42 * sg) + ' ' + (-len * 0.9), c, 10 * s) + '</g>';
    }
    return o;
  }
  function conifer(x, y, h, c1, c2) {
    var w = h * 0.42;
    return '<rect x="' + (x - h * 0.04) + '" y="' + (y - h * 0.25) + '" width="' + (h * 0.08) + '" height="' + (h * 0.25) + '" fill="#6b4a2e"/>' +
      '<path d="M' + x + ' ' + (y - h) + ' L' + (x + w * 0.55) + ' ' + (y - h * 0.5) + ' L' + (x - w * 0.55) + ' ' + (y - h * 0.5) + 'z" fill="' + c2 + '"/>' +
      '<path d="M' + x + ' ' + (y - h * 0.8) + ' L' + (x + w * 0.8) + ' ' + (y - h * 0.3) + ' L' + (x - w * 0.8) + ' ' + (y - h * 0.3) + 'z" fill="' + c1 + '"/>' +
      '<path d="M' + x + ' ' + (y - h * 0.55) + ' L' + (x + w) + ' ' + (y - h * 0.1) + ' L' + (x - w) + ' ' + (y - h * 0.1) + 'z" fill="' + c2 + '"/>';
  }
  function palm(x, y, h, c, s) {
    s = s || 1;
    var tx = x + 8 * s, ty = y - h, o = '';
    o += '<path d="M' + x + ' ' + y + ' Q' + (x + 16 * s) + ' ' + (y - h * 0.5) + ' ' + tx + ' ' + ty + '" fill="none" stroke="#8a5a34" stroke-width="' + (8 * s) + '" stroke-linecap="round"/>';
    var dxs = [-46, -30, -14, 14, 30, 46];
    for (var i = 0; i < dxs.length; i++) {
      var dx = dxs[i] * s;
      o += frondPath('M' + tx + ' ' + ty + ' Q' + (tx + dx * 0.5) + ' ' + (ty - 34 * s) + ' ' + (tx + dx * 1.3) + ' ' + (ty + 14 * s + Math.abs(dx) * 0.2), c, 9 * s);
    }
    o += frondPath('M' + tx + ' ' + ty + ' Q' + (tx - 4 * s) + ' ' + (ty - 22 * s) + ' ' + (tx - 8 * s) + ' ' + (ty - 36 * s), c, 8 * s);
    o += '<circle cx="' + tx + '" cy="' + (ty + 3) + '" r="' + (4 * s) + '" fill="#6b4a2e"/>';
    return o;
  }
  function cycad(x, y, s, c) {
    var o = '<path d="M' + (x - 9 * s) + ' ' + y + ' Q' + (x - 11 * s) + ' ' + (y - 24 * s) + ' ' + (x - 7 * s) + ' ' + (y - 38 * s) + ' L' + (x + 7 * s) + ' ' + (y - 38 * s) + ' Q' + (x + 11 * s) + ' ' + (y - 24 * s) + ' ' + (x + 9 * s) + ' ' + y + 'z" fill="#7a5a3a"/>';
    for (var r = 0; r < 4; r++) o += '<path d="M' + (x - 10 * s) + ' ' + (y - 8 * s - r * 8 * s) + ' q10 4 20 0" stroke="#5a4028" stroke-width="1.5" fill="none"/>';
    var as = [-75, -50, -25, 0, 25, 50, 75];
    for (var i = 0; i < as.length; i++) {
      var a = as[i], sg = a >= 0 ? 1 : -1;
      o += '<g transform="translate(' + x + ' ' + (y - 38 * s) + ') rotate(' + a + ')">' + frondPath('M0 0 Q0 ' + (-36 * s) + ' ' + (22 * s * sg) + ' ' + (-40 * s), c, 8 * s) + '</g>';
    }
    return o;
  }
  function horsetail(x, y, h, c) {
    var o = '<rect x="' + (x - 2.2) + '" y="' + (y - h) + '" width="4.4" height="' + h + '" fill="' + c + '"/>';
    for (var k = 1; k < 6; k++) {
      var yy = y - h * k / 6.2;
      o += '<path d="M' + (x - 9) + ' ' + (yy - 7) + ' L' + x + ' ' + yy + ' L' + (x + 9) + ' ' + (yy - 7) + '" stroke="' + c + '" stroke-width="2" fill="none"/>';
      o += '<rect x="' + (x - 3.2) + '" y="' + (yy - 1) + '" width="6.4" height="2.6" rx="1" fill="#2f5a34" opacity=".5"/>';
    }
    o += '<ellipse cx="' + x + '" cy="' + (y - h - 4) + '" rx="3.4" ry="8" fill="' + c + '"/>';
    return o;
  }
  function tree(x, y, h, c1, c2, trunk) {
    var r = h * 0.3;
    return '<path d="M' + (x - h * 0.05) + ' ' + y + ' Q' + x + ' ' + (y - h * 0.4) + ' ' + (x - h * 0.03) + ' ' + (y - h * 0.62) + ' L' + (x + h * 0.04) + ' ' + (y - h * 0.62) + ' Q' + (x + h * 0.02) + ' ' + (y - h * 0.4) + ' ' + (x + h * 0.06) + ' ' + y + 'z" fill="' + (trunk || '#7a5230') + '"/>' +
      '<circle cx="' + (x - r * 0.6) + '" cy="' + (y - h * 0.68) + '" r="' + (r * 0.9) + '" fill="' + c2 + '"/>' +
      '<circle cx="' + (x + r * 0.6) + '" cy="' + (y - h * 0.68) + '" r="' + (r * 0.9) + '" fill="' + c2 + '"/>' +
      '<circle cx="' + x + '" cy="' + (y - h * 0.82) + '" r="' + r + '" fill="' + c1 + '"/>' +
      '<circle cx="' + (x - r * 0.3) + '" cy="' + (y - h * 0.9) + '" r="' + (r * 0.45) + '" fill="#fff" opacity=".12"/>';
  }
  function araucaria(x, y, h, c1, c2) {
    var o = '<path d="M' + (x - 5) + ' ' + y + ' L' + (x - 3) + ' ' + (y - h) + ' L' + (x + 3) + ' ' + (y - h) + ' L' + (x + 5) + ' ' + y + 'z" fill="#6f4c30"/>';
    var tiers = [0.95, 0.8, 0.66];
    for (var i = 0; i < tiers.length; i++) {
      var ty = y - h * tiers[i], w = 30 + i * 8;
      o += '<path d="M' + (x - w) + ' ' + (ty + 8) + ' Q' + x + ' ' + (ty - 14) + ' ' + (x + w) + ' ' + (ty + 8) + ' Q' + x + ' ' + (ty + 2) + ' ' + (x - w) + ' ' + (ty + 8) + 'z" fill="' + (i % 2 ? c1 : c2) + '"/>';
      o += '<ellipse cx="' + x + '" cy="' + (ty - 2) + '" rx="' + (w * 0.8) + '" ry="7" fill="' + c1 + '"/>';
    }
    return o;
  }
  function grass(x, y, s, c) {
    var o = '';
    var as = [-30, -12, 8, 28];
    for (var i = 0; i < as.length; i++) o += '<path transform="translate(' + x + ' ' + y + ') rotate(' + as[i] + ') scale(' + s + ')" d="M-3 0 Q-2 -14 0 -24 Q3 -14 3 0z" fill="' + c + '"/>';
    return o;
  }
  function flower(x, y, s, petal, mid) {
    var o = '<path d="M' + x + ' ' + y + ' q-2 ' + (-10 * s) + ' 0 ' + (-18 * s) + '" stroke="#3e8a3e" stroke-width="2" fill="none"/>';
    for (var i = 0; i < 5; i++) {
      var a = i * 72 * Math.PI / 180;
      o += '<circle cx="' + (x + Math.cos(a) * 4.2 * s) + '" cy="' + (y - 18 * s + Math.sin(a) * 4.2 * s) + '" r="' + (3.4 * s) + '" fill="' + petal + '"/>';
    }
    o += '<circle cx="' + x + '" cy="' + (y - 18 * s) + '" r="' + (2.6 * s) + '" fill="' + mid + '"/>';
    return o;
  }
  function mount(x, w, h, base, c, snow) {
    var o = '<path d="M' + (x - w) + ' ' + base + ' L' + (x - w * 0.12) + ' ' + (base - h) + ' Q' + x + ' ' + (base - h - 6) + ' ' + (x + w * 0.12) + ' ' + (base - h) + ' L' + (x + w) + ' ' + base + 'z" fill="' + c + '"/>';
    if (snow) o += '<path d="M' + (x - w * 0.2) + ' ' + (base - h * 0.84) + ' L' + (x - w * 0.12) + ' ' + (base - h) + ' Q' + x + ' ' + (base - h - 6) + ' ' + (x + w * 0.12) + ' ' + (base - h) + ' L' + (x + w * 0.22) + ' ' + (base - h * 0.82) + ' L' + (x + w * 0.05) + ' ' + (base - h * 0.9) + ' L' + (x - w * 0.06) + ' ' + (base - h * 0.8) + 'z" fill="#fff" opacity=".85"/>';
    return o;
  }
  function bird(x, y, s, c) {
    return '<path transform="translate(' + x + ' ' + y + ') scale(' + s + ')" d="M-10 0 Q-5 -8 0 0 Q5 -8 10 0 Q5 -4 0 3 Q-5 -4 -10 0z" fill="' + c + '"/>';
  }

  /* ---------- SCENES ---------- */
  build('scene-permian', function (g) {
    return '<rect width="400" height="300" fill="' + g('sky', ['#ffe3b3', '#f9b97c', '#ec8a5a']) + '"/>' +
      sun(300, 92, 34, '#fff3c9', '#ffd27a') +
      cloud(90, 60, 0.9, 0.55) + cloud(230, 40, 0.6, 0.45) +
      '<path d="M0 190 L30 190 L38 150 L90 150 L100 190 L150 190 L156 168 L210 168 L218 190 L400 190 V300 H0z" fill="' + g('mesa', ['#c7684a', '#9a4a33']) + '"/>' +
      '<path d="M38 150 L90 150 L92 160 L36 160z M156 168 L210 168 L212 176 L154 176z" fill="#e08a62" opacity=".7"/>' +
      '<path d="M0 218 Q70 190 140 214 T290 208 T400 206 V300 H0z" fill="' + g('dune', ['#e09a60', '#c4763f']) + '"/>' +
      '<path d="M0 246 Q90 226 190 244 T400 238 V300 H0z" fill="' + g('gr', ['#c98048', '#8e4e2b']) + '"/>' +
      '<path d="M40 258 Q70 250 100 258 M250 262 Q290 252 330 262" stroke="#7a3f22" stroke-width="2" fill="none" opacity=".5"/>' +
      '<g transform="translate(262 205) scale(.34)" fill="#6a3a22" opacity=".85"><ellipse cx="60" cy="40" rx="50" ry="22"/><path d="M20 36 C22 -10 50 -26 75 -10 C85 0 90 20 85 36z"/><path d="M100 32 C120 24 140 30 150 38 C140 52 110 56 96 52z"/><path d="M12 42 C-20 52 -30 64 -50 60 C-20 74 8 60 20 52z"/><rect x="26" y="52" width="8" height="26" rx="4"/><rect x="82" y="52" width="8" height="26" rx="4"/></g>' +
      conifer(40, 236, 52, '#4d7a3a', '#3a6a30') + conifer(66, 244, 36, '#5a8a40', '#456f33') +
      horsetail(338, 252, 40, '#6a9a4a') + horsetail(352, 256, 30, '#5a8a42') +
      fern(180, 258, 0.9, '#5f8f3f') + fern(300, 260, 0.7, '#6a9a44') + fern(18, 262, 0.8, '#5b8a3e') +
      '<ellipse cx="120" cy="262" rx="26" ry="5" fill="#6bb6c9" opacity=".7"/>';
  });

  build('scene-triassic', function (g) {
    return '<rect width="400" height="300" fill="' + g('sky', ['#bfe4f2', '#f6e4c0', '#f9d49a']) + '"/>' +
      sun(90, 80, 28, '#fffbe0', '#ffe9a0') +
      cloud(250, 55, 1, 0.8) + cloud(340, 95, 0.6, 0.6) +
      mount(300, 110, 70, 200, '#b98e6a') + mount(120, 90, 54, 200, '#c99d78') +
      '<path d="M0 200 Q100 190 200 202 T400 196 V300 H0z" fill="' + g('hill', ['#d6a57a', '#b87d54']) + '"/>' +
      '<path d="M120 228 Q200 214 300 228 Q330 250 270 262 Q190 270 130 258 Q96 246 120 228z" fill="' + g('lake', ['#8fd3e0', '#4fa6c4']) + '"/>' +
      '<path d="M150 236 Q200 230 250 236" stroke="#fff" stroke-width="2" opacity=".5" fill="none"/>' +
      '<path d="M0 252 Q100 236 200 258 T400 246 V300 H0z" fill="' + g('gr', ['#b9824f', '#8a5a34']) + '"/>' +
      cycad(48, 262, 1.3, '#3f8a4a') + cycad(352, 262, 1.1, '#4a9a50') +
      horsetail(90, 262, 52, '#6aa04c') + horsetail(104, 264, 36, '#5a9042') + horsetail(318, 262, 46, '#6aa04c') +
      fern(220, 268, 0.8, '#5a9a44') + fern(18, 268, 0.7, '#4f8a3e');
  });

  build('scene-jurassic', function (g) {
    return '<rect width="400" height="300" fill="' + g('sky', ['#8fd0f0', '#c9ecf7', '#eaf8ee']) + '"/>' +
      sun(320, 62, 24, '#fffdf0', '#fff3b0') +
      cloud(80, 50, 1, 0.9) + cloud(200, 80, 0.7, 0.8) +
      mount(90, 130, 90, 190, '#a9c6d2') + mount(290, 150, 70, 190, '#b9d3dc') +
      '<path d="M0 190 Q100 170 200 188 T400 180 V300 H0z" fill="' + g('hill', ['#7dc27a', '#4f9a5a']) + '"/>' +
      '<g fill="#4a7a6a" opacity=".55" transform="translate(196 150)"><ellipse cx="0" cy="22" rx="20" ry="9"/><path d="M14 20 Q26 0 22 -14 L28 -14 Q34 4 24 24z"/><ellipse cx="27" cy="-15" rx="6" ry="3.5"/><path d="M-18 22 Q-34 28 -42 34 Q-30 32 -16 28z"/><rect x="-10" y="26" width="5" height="12"/><rect x="8" y="26" width="5" height="12"/></g>' +
      araucaria(60, 228, 120, '#3f8f4c', '#2f7a3f') + araucaria(344, 232, 140, '#3f8f4c', '#2f7a3f') + araucaria(300, 214, 70, '#4a9a55', '#38864a') +
      '<path d="M0 236 Q100 220 200 238 T400 230 V300 H0z" fill="' + g('gr', ['#58ab5b', '#2f7f45']) + '"/>' +
      fern(130, 268, 1.1, '#2f8a3f') + fern(240, 270, 0.9, '#3a9a48') + fern(30, 272, 1, '#2a7a3a') + fern(372, 272, 0.9, '#2f8a3f') +
      cycad(196, 262, 0.9, '#3a9a48') +
      flower(160, 276, 0.8, '#fff', '#ffd34a');
  });

  build('scene-cretaceous', function (g) {
    return '<rect width="400" height="300" fill="' + g('sky', ['#7ec3ea', '#f6d6a8', '#f6a07a']) + '"/>' +
      sun(78, 98, 26, '#fff4c4', '#ffd079') +
      '<path d="M310 20 L350 50" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/><circle cx="312" cy="22" r="5" fill="#fff"/><circle cx="312" cy="22" r="9" fill="#fff" opacity=".35"/>' +
      cloud(160, 52, 0.9, 0.75) + cloud(260, 96, 0.6, 0.55) +
      bird(210, 30, 1.2, '#5a4a6a') + bird(240, 44, 0.9, '#5a4a6a') + bird(120, 130, 0.8, '#6a5a7a') +
      '<path d="M250 196 L300 106 Q320 98 340 106 L400 196z" fill="' + g('vol', ['#7a5a56', '#4e3a3a']) + '"/>' +
      '<path d="M300 106 Q320 114 340 106 L332 120 Q320 124 308 120z" fill="#ff8a3a"/>' +
      '<path d="M318 108 C300 80 340 66 316 40 C350 56 350 84 326 106z" fill="#6b5a5a" opacity=".7"/>' +
      '<path d="M0 196 Q100 176 200 194 T400 188 V300 H0z" fill="' + g('hill', ['#8ec06a', '#5e9a50']) + '"/>' +
      '<path d="M0 238 Q100 222 200 240 T400 232 V300 H0z" fill="' + g('gr', ['#6eb35a', '#3f8a4a']) + '"/>' +
      tree(70, 240, 90, '#5aa84a', '#3f8a3e') +
      '<g fill="#ff9ec4"><circle cx="48" cy="170" r="5"/><circle cx="66" cy="160" r="5"/><circle cx="84" cy="174" r="5"/><circle cx="58" cy="186" r="5"/><circle cx="92" cy="156" r="4"/></g>' +
      '<g fill="#fff"><circle cx="76" cy="176" r="4"/><circle cx="52" cy="152" r="4"/></g>' +
      tree(338, 246, 70, '#6ab852', '#46984a') +
      '<g fill="#ffd34a"><circle cx="322" cy="198" r="4"/><circle cx="342" cy="192" r="4"/><circle cx="352" cy="206" r="4"/></g>' +
      fern(180, 268, 0.9, '#3f8a3f') + fern(260, 270, 0.7, '#4a9a48') +
      flower(120, 272, 1, '#ff6fa0', '#ffe27a') + flower(140, 278, 0.9, '#fff', '#ffcf4a') + flower(220, 274, 1, '#c78bff', '#ffe27a') + flower(300, 278, 0.9, '#ff6fa0', '#ffe27a');
  });

  build('scene-paleogene', function (g) {
    return '<rect width="400" height="300" fill="' + g('sky', ['#7fd0ee', '#bfe9f3', '#f5f1d2']) + '"/>' +
      sun(320, 70, 22, '#fffdf0', '#fff0a8') +
      cloud(90, 48, 1, 0.9) + cloud(230, 76, 0.7, 0.8) +
      bird(150, 100, 1, '#3a4a5a') + bird(172, 112, 0.8, '#3a4a5a') +
      mount(70, 120, 66, 196, '#9fcdbd') + mount(280, 150, 52, 196, '#b3dccb') +
      '<path d="M0 196 Q100 182 200 196 T400 190 V300 H0z" fill="' + g('hill', ['#86cf86', '#56ad6a']) + '"/>' +
      '<path d="M0 232 Q110 216 210 234 T400 226 V300 H0z" fill="' + g('gr', ['#6cc178', '#3a9560']) + '"/>' +
      palm(60, 244, 100, '#2f9a55', 1) + palm(340, 248, 84, '#37a85e', 0.9) + palm(110, 240, 56, '#47b46a', 0.7) +
      tree(220, 240, 70, '#4fb06a', '#348f55') +
      fern(160, 268, 1, '#2f8a4a') + fern(290, 270, 0.8, '#3a9a55') + fern(18, 270, 0.8, '#2f8a4a') +
      grass(250, 278, 1, '#3a9a4a') + grass(190, 280, 1, '#4aaa58') +
      flower(120, 276, 0.9, '#fff', '#ffd34a') + flower(320, 278, 1, '#ff9ec4', '#ffe27a');
  });

  build('scene-today', function (g) {
    return '<rect width="400" height="300" fill="' + g('sky', ['#6ec6f5', '#b9e6fb', '#e8f7ff']) + '"/>' +
      sun(330, 58, 24, '#fff6b0', '#ffe27a') +
      cloud(80, 56, 1.1, 0.95) + cloud(210, 40, 0.7, 0.9) + cloud(290, 110, 0.6, 0.8) +
      bird(150, 90, 1.1, '#2b2f3a') + bird(178, 104, 0.9, '#2b2f3a') + bird(130, 112, 0.8, '#2b2f3a') +
      mount(300, 140, 60, 190, '#9dc6e0', true) + mount(120, 100, 46, 190, '#b4d4ea') +
      '<path d="M0 190 Q100 172 200 190 T400 184 V300 H0z" fill="' + g('hill', ['#92d36a', '#5ea84a']) + '"/>' +
      '<path d="M0 226 Q110 208 210 228 T400 218 V300 H0z" fill="' + g('gr', ['#7fcf5a', '#4a9a3a']) + '"/>' +
      '<path d="M170 300 Q200 262 230 226 L238 226 Q222 262 214 300z" fill="#e9d6a8" opacity=".9"/>' +
      tree(60, 238, 96, '#4faa48', '#368a3a') + tree(340, 240, 80, '#58b450', '#3d9440') +
      '<rect x="270" y="196" width="26" height="20" fill="#f4e3c8"/><path d="M266 198 L283 182 L300 198z" fill="#d9644a"/><rect x="278" y="204" width="8" height="12" fill="#8a5a34"/>' +
      flower(110, 270, 1.1, '#ff6fa0', '#ffe27a') + flower(128, 276, 1, '#fff', '#ffcf4a') + flower(250, 272, 1.1, '#c78bff', '#ffe27a') +
      flower(300, 280, 1, '#ffd34a', '#ff8a3a') + flower(30, 278, 1, '#ff6fa0', '#ffe27a') + flower(366, 276, 1.1, '#fff', '#ffcf4a') +
      grass(80, 282, 1.1, '#3f9a3a') + grass(210, 284, 1.1, '#4aaa44') + grass(330, 286, 1, '#3f9a3a');
  });

  /* ---------- tiles + logo ---------- */
  build('bg-leaf', function () {
    var o = '', i, leaves = [
      [40, 50, 30, '#7fcf7a', 0.16], [150, 30, -20, '#5fb86a', 0.14], [260, 70, 50, '#9bdc86', 0.16], [350, 30, -40, '#6fc27a', 0.14],
      [90, 140, -60, '#9bdc86', 0.15], [210, 150, 20, '#6fc27a', 0.16], [320, 160, -30, '#7fcf7a', 0.14], [30, 240, 40, '#6fc27a', 0.15],
      [140, 250, -50, '#7fcf7a', 0.16], [250, 260, 30, '#9bdc86', 0.14], [360, 250, -20, '#5fb86a', 0.15]
    ];
    for (i = 0; i < leaves.length; i++) {
      var l = leaves[i];
      o += '<g transform="translate(' + l[0] + ' ' + l[1] + ') rotate(' + l[2] + ')" opacity="' + l[4] + '"><path d="M0 -22 C16 -12 16 12 0 24 C-16 12 -16 -12 0 -22z" fill="' + l[3] + '"/><path d="M0 -18 L0 26" stroke="#2f7a45" stroke-width="1.5"/><path d="M0 -4 L8 -10 M0 6 L9 0 M0 -4 L-8 -10 M0 6 L-9 0" stroke="#2f7a45" stroke-width="1"/></g>';
    }
    return o;
  });

  build('bg-bones', function () {
    var o = '', c = '#a88a5a';
    function bone(x, y, r, len) {
      return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')" opacity=".13" fill="' + c + '"><rect x="' + (-len / 2) + '" y="-4" width="' + len + '" height="8" rx="4"/><circle cx="' + (-len / 2) + '" cy="-6" r="6"/><circle cx="' + (-len / 2) + '" cy="6" r="6"/><circle cx="' + (len / 2) + '" cy="-6" r="6"/><circle cx="' + (len / 2) + '" cy="6" r="6"/></g>';
    }
    function print(x, y, r) {
      return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')" opacity=".12" fill="' + c + '"><path d="M0 -16 C6 -16 8 -6 5 4 L0 14 L-5 4 C-8 -6 -6 -16 0 -16z"/><path d="M-9 -2 C-16 -8 -18 -18 -14 -22 C-8 -22 -6 -10 -7 -2z" transform="scale(.8)"/><path d="M9 -2 C16 -8 18 -18 14 -22 C8 -22 6 -10 7 -2z" transform="scale(.8)"/></g>';
    }
    function shell(x, y, r) {
      return '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ')" opacity=".13"><path d="M0 0 a4 4 0 0 1 8 0 a8 8 0 0 1 -16 0 a12 12 0 0 1 24 0 a16 16 0 0 1 -32 0" fill="none" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/></g>';
    }
    o += bone(70, 60, -30, 40) + bone(280, 40, 25, 30) + bone(200, 160, 70, 36) + bone(340, 210, -20, 44) + bone(60, 250, 20, 32);
    o += print(160, 70, 20) + print(330, 110, -15) + print(110, 170, 40) + print(280, 270, 10) + print(230, 230, -30);
    o += shell(30, 140, 0) + shell(360, 150, 30) + shell(170, 280, 0) + shell(240, 100, -20);
    return o;
  });

  build('logo', function (g) {
    return '<circle cx="200" cy="150" r="138" fill="' + g('bg', ['#46c2b0', '#2a8f9a'], 'd') + '"/>' +
      '<circle cx="200" cy="150" r="138" fill="none" stroke="#fff" stroke-width="6" opacity=".9"/>' +
      '<circle cx="200" cy="150" r="124" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 7" opacity=".7"/>' +
      '<g transform="translate(168 92)"><path d="M0 40 C-16 18 -22 0 -18 -18 C-6 -4 0 14 6 34z" fill="#1f3a6a"/><path d="M12 38 C2 10 4 -14 14 -32 C20 -10 22 14 22 36z" fill="#2c5aa0"/><path d="M26 36 C26 10 34 -10 50 -22 C48 0 44 20 38 40z" fill="#3b82c4"/></g>' +
      '<path d="M138 250 C128 200 140 160 172 148 L240 150 C268 170 262 220 262 250z" fill="' + g('neck', ['#ffffff', '#e6edf2']) + '"/>' +
      '<path d="M156 160 C156 118 196 104 232 112 C262 118 290 132 322 150 C336 158 332 170 318 174 C290 182 262 190 238 198 C200 208 156 200 156 160z" fill="' + g('head', ['#3b4a63', '#1f2a40']) + '"/>' +
      '<path d="M200 184 C226 196 262 188 318 174 C290 184 250 206 214 204 C200 200 196 192 200 184z" fill="#fff"/>' +
      '<path d="M318 156 C334 156 340 166 326 170 L296 176z" fill="#ffb84a"/>' +
      '<path d="M232 190 L322 172" stroke="#c96a2a" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M270 188 l4 -9 l4 8 M288 183 l4 -9 l4 8 M304 178 l3 -7 l4 6" fill="#fff" stroke="#e8d9c0" stroke-width=".7"/>' +
      eye(236, 140, 17) + '<path d="M214 124 Q236 114 258 124" stroke="#1f2a40" stroke-width="5" fill="none" stroke-linecap="round"/>' +
      '<path d="M164 148 C190 156 214 168 232 168" stroke="#5aa0d8" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>';
  });

  /* ---------- generic sprawling land animal (early amniotes etc.) ---------- */
  function bz(p0, p1, p2, p3, t) {
    var u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
  }
  function sprawler(g, o) {
    var s1 = o.skin[0], s2 = o.skin[1], belly = o.belly || '#f3e3b8', dark = o.dark || s2, out = '';
    var P = [[140, 190], [150, 165], [230, 160], [275, 178]], i, p;
    out += limb('M245 214 L256 242 L274 259', 15, dark) + limb('M190 218 L198 244 L216 259', 15, dark);
    out += '<path d="M255 258 l14 2 M258 256 l14 -4" stroke="' + dark + '" stroke-width="5" stroke-linecap="round"/>';
    out += '<path d="M150 190 C110 194 80 216 36 226 C76 244 120 236 156 226z" fill="' + g('tail', [s1, s2]) + '"/>';
    if (o.sail) {
      var base = [], top = [], n = 9, sailD;
      for (i = 0; i <= n; i++) {
        var t = 0.12 + (0.8 * i) / n;
        p = bz(P[0], P[1], P[2], P[3], t);
        var h = 110 * Math.sin(Math.PI * (i / n)) * 0.92 + 14;
        base.push(p); top.push([p[0] - 6 + i * 1.5, p[1] - h]);
      }
      sailD = 'M' + base[0][0] + ' ' + base[0][1];
      for (i = 0; i <= n; i++) sailD += ' L' + top[i][0] + ' ' + top[i][1];
      for (i = n; i >= 0; i--) sailD += ' L' + base[i][0] + ' ' + (base[i][1] + 4);
      out += '<path d="' + sailD + 'z" fill="' + g('sail', ['#f6a35a', '#d8452e', '#b52e2e']) + '" stroke="#8a2a22" stroke-width="2" stroke-linejoin="round"/>';
      for (i = 0; i <= n; i++) out += '<path d="M' + base[i][0] + ' ' + (base[i][1] + 4) + ' L' + top[i][0] + ' ' + (top[i][1] + 5) + '" stroke="#f9d9a0" stroke-width="3.4" stroke-linecap="round" opacity=".85"/>';
    }
    out += '<path d="M140 190 C150 165 230 160 275 178 C295 186 300 205 285 222 C250 240 170 238 145 224 C135 214 135 200 140 190z" fill="' + g('body', [s1, s2]) + '"/>';
    out += '<path d="M150 222 C190 238 250 240 284 220 C294 214 298 206 296 200 C270 224 190 230 150 222z" fill="' + belly + '" opacity=".9"/>';
    if (o.stripes) for (i = 0; i < 5; i++) { p = bz(P[0], P[1], P[2], P[3], 0.18 + i * 0.16); out += '<path d="M' + p[0] + ' ' + (p[1] + 2) + ' q-4 20 2 38" stroke="' + dark + '" stroke-width="7" fill="none" stroke-linecap="round" opacity=".45"/>'; }
    if (o.spots) for (i = 0; i < 7; i++) { p = bz(P[0], P[1], P[2], P[3], 0.1 + i * 0.12); out += '<circle cx="' + (p[0] + 3) + '" cy="' + (p[1] + 14 + (i % 2) * 12) + '" r="' + (4 + (i % 3)) + '" fill="' + (o.spotColor || '#fff3a0') + '" opacity=".75"/>'; }
    if (o.scales) for (i = 0; i < 18; i++) { out += '<path d="M' + (160 + (i % 6) * 22) + ' ' + (190 + Math.floor(i / 6) * 14) + ' q5 6 10 0" stroke="' + dark + '" stroke-width="1.8" fill="none" opacity=".4"/>'; }
    if (o.crest) {
      for (i = 0; i < 12; i++) { p = bz(P[0], P[1], P[2], P[3], 0.06 + i * 0.075); out += '<path d="M' + (p[0] - 5) + ' ' + (p[1] + 2) + ' L' + (p[0] + 1) + ' ' + (p[1] - 15) + ' L' + (p[0] + 6) + ' ' + (p[1] + 1) + 'z" fill="' + (o.crestColor || '#e8dcb0') + '" stroke="' + dark + '" stroke-width="1"/>'; }
      for (i = 0; i < 5; i++) out += '<path d="M' + (120 - i * 16) + ' ' + (214 - i * 4) + ' l4 -10 l5 10z" fill="' + (o.crestColor || '#e8dcb0') + '" stroke="' + dark + '" stroke-width="1"/>';
    }
    out += limb('M262 212 L284 242 L304 259', 17, s1) + limb('M160 214 L150 243 L172 259', 17, s1);
    out += '<path d="M300 258 l14 1 M302 256 l13 -5 M171 258 l14 1 M171 255 l13 -5" stroke="' + s1 + '" stroke-width="5.5" stroke-linecap="round"/>';
    var hs = o.headSize || 1;
    out += '<g transform="translate(' + (270 - 270 * hs) + ' ' + (190 - 190 * hs) + ') scale(' + hs + ')">';
    out += '<path d="M268 176 C282 158 320 158 346 176 C358 184 360 196 350 202 C330 210 298 212 280 206 C266 198 262 186 268 176z" fill="' + g('head', [s1, s2]) + '"/>';
    out += '<path d="M282 204 C310 212 334 210 350 202 C356 198 358 194 357 190 C336 202 306 204 282 204z" fill="' + belly + '" opacity=".9"/>';
    out += '<path d="M292 198 Q326 204 354 194" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
    if (o.teeth) out += teeth(300, 198, 6, 8, 6, -1);
    out += '<circle cx="349" cy="183" r="2.4" fill="' + INK + '"/>';
    out += eye(318, 176, 8.5);
    if (o.holes === 1) out += '<ellipse cx="296" cy="176" rx="6" ry="8" fill="' + INK + '" opacity=".55"/>';
    if (o.holes === 2) out += '<ellipse cx="296" cy="172" rx="5" ry="5" fill="' + INK + '" opacity=".5"/><ellipse cx="297" cy="184" rx="5" ry="4.5" fill="' + INK + '" opacity=".5"/>';
    if (o.tongue) out += '<path d="M352 196 q16 2 24 -6 M376 190 l8 -6 M376 190 l8 4" stroke="#e2475a" stroke-width="3" fill="none" stroke-linecap="round"/>';
    out += '</g>';
    var k = o.k || 1.18;
    return k === 1 ? out : '<g transform="translate(' + (200 * (1 - k)) + ' ' + (262 * (1 - k)) + ') scale(' + k + ')">' + out + '</g>';
  }

  build('amniote', function (g) {
    return sh(190, 266, 170) +
      '<g transform="translate(-30 4)">' + sprawler(g, { skin: ['#a8905a', '#6f5a36'], belly: '#efe0b6', stripes: true, scales: true, headSize: 0.95, k: 1 }) + '</g>' +
      fern(60, 264, 0.9, '#4f8a3e') + fern(110, 268, 0.6, '#5a9a44') +
      '<ellipse cx="344" cy="238" rx="28" ry="33" fill="' + g('egg', ['#fffaf0', '#e8dcc0'], 'd') + '" stroke="#cdbf9f" stroke-width="2"/>' +
      '<path d="M330 222 q6 -5 10 2 M352 250 q6 3 8 -4 M336 252 q4 4 8 0" stroke="#cdbf9f" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M326 232 q4 -12 14 -16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>' +
      '<ellipse cx="344" cy="268" rx="30" ry="3.5" fill="' + INK + '" opacity=".2"/>';
  });

  build('synapsid', function (g) {
    return sh(200, 266, 170) +
      sprawler(g, { skin: ['#c9a574', '#8a6a42'], belly: '#f4e6c4', holes: 1, teeth: true, stripes: true, headSize: 1.08 }) +
      fern(40, 268, 0.8, '#5a8a40') + grass(360, 270, 1.2, '#6a9a4a');
  });

  build('sauropsid', function (g) {
    return sh(200, 266, 170) +
      sprawler(g, { skin: ['#7fb06a', '#3f7a46'], belly: '#eef0b8', holes: 2, scales: true, spots: true, spotColor: '#c6e68a', headSize: 1 }) +
      fern(50, 268, 0.8, '#4f9a44') + grass(350, 270, 1.2, '#5aa94a');
  });

  build('lepidosaur', function (g) {
    return sh(200, 266, 170) +
      sprawler(g, { skin: ['#7ad06a', '#2f9a5a'], belly: '#f6f1b8', scales: true, spots: true, spotColor: '#ffe25a', tongue: true, headSize: 1 }) +
      grass(50, 270, 1.2, '#4aa94a') + flower(364, 270, 0.9, '#ff6fa0', '#ffe27a');
  });

  build('tuatara', function (g) {
    return sh(200, 266, 170) +
      sprawler(g, { skin: ['#9aa66a', '#5e6e3c'], belly: '#d8d79a', crest: true, spots: true, spotColor: '#c9cf8a', scales: true, headSize: 1.08 });
  });

  build('dimetrodon', function (g) {
    return sh(200, 267, 175) +
      sprawler(g, { skin: ['#e29a58', '#a85a2e'], belly: '#f9e0b0', sail: true, teeth: true, holes: 1, stripes: true, headSize: 1.1, k: 1.04 }) +
      grass(366, 272, 1.1, '#7a9a4a');
  });

  /* ---------- mammal side ---------- */
  build('cynodont', function (g) {
    var s1 = '#c49a68', s2 = '#8a6238', dk = '#6e4c2a', o = '';
    o += sh(200, 266, 170);
    o += limb('M246 214 L252 240 L260 258', 15, dk) + limb('M178 216 L174 242 L180 258', 15, dk);
    o += '<path d="M126 196 C96 192 70 204 60 226 C84 222 108 226 130 226z" fill="' + g('tail', [s1, s2]) + '"/>';
    o += '<path d="M120 190 C128 160 240 154 268 178 C284 194 274 226 242 234 C200 244 142 238 124 222 C112 212 112 198 120 190z" fill="' + g('body', [s1, s2]) + '"/>';
    o += '<path d="M138 228 C180 244 240 242 262 224 C262 232 240 244 200 246 C170 246 148 240 138 228z" fill="#f1dcb2"/>';
    for (var i = 0; i < 11; i++) o += '<path d="M' + (140 + i * 11) + ' ' + (172 - Math.sin(i / 10 * 3) * 4 + 4) + ' l3 -9 l4 9" stroke="' + s2 + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
    o += limb('M252 214 L260 242 L268 259', 18, s1) + limb('M158 216 L152 243 L160 259', 18, s1);
    o += '<ellipse cx="270" cy="259" rx="11" ry="5" fill="' + s1 + '"/><ellipse cx="162" cy="259" rx="11" ry="5" fill="' + s1 + '"/>';
    // head
    o += '<path d="M250 176 C260 148 296 142 322 156 L362 180 C370 188 362 200 350 200 L300 208 C270 212 248 198 250 176z" fill="' + g('head', [s1, s2]) + '"/>';
    o += '<path d="M290 208 L350 200 C356 199 360 196 360 192 C340 206 312 212 290 208z" fill="#f1dcb2"/>';
    o += '<path d="M294 205 Q330 200 356 194" stroke="' + INK + '" stroke-width="2" fill="none"/>' + teeth(318, 199, 4, 7, 5, -1);
    o += '<ellipse cx="364" cy="183" rx="6" ry="4.5" fill="#3a2a2a"/>';
    o += '<path d="M262 156 C256 136 270 126 284 134 C292 140 292 150 288 156z" fill="' + s2 + '"/><path d="M268 152 C266 142 274 138 280 142 C284 146 284 150 282 152z" fill="#f2b6a0"/>';
    o += eye(300, 170, 8.5, { iris: '#fff' });
    o += '<path d="M340 190 L392 176 M340 194 L394 192 M340 198 L388 206" stroke="#fff8e6" stroke-width="1.6" stroke-linecap="round"/>';
    return o;
  });

  build('mammal', function (g) {
    var s1 = '#b39a80', s2 = '#7a6450', o = '';
    o += sh(200, 268, 160);
    // log
    o += '<path d="M40 252 Q40 238 60 238 L340 238 Q362 238 362 252 Q362 268 340 268 L60 268 Q40 268 40 252z" fill="' + g('log', ['#a97a4c', '#6e4a2a']) + '"/>';
    o += '<ellipse cx="350" cy="253" rx="12" ry="15" fill="#d9b684"/><ellipse cx="350" cy="253" rx="7" ry="9" fill="none" stroke="#a97a4c" stroke-width="2"/>';
    o += '<path d="M80 246 q40 -4 80 0 M200 258 q50 4 90 -2" stroke="#59391f" stroke-width="2" fill="none" opacity=".5"/>';
    o += fern(70, 240, 0.7, '#4f9a44');
    // tail
    o += '<path d="M118 200 C80 204 56 190 44 160 C40 152 48 148 52 154 C62 176 84 188 122 186z" fill="' + s2 + '"/>';
    // far legs
    o += limb('M236 224 L250 238', 13, '#6a5644') + limb('M156 226 L146 238', 13, '#6a5644');
    // body
    o += '<path d="M114 196 C120 150 250 142 278 176 C292 196 282 226 250 236 L150 238 C118 232 108 214 114 196z" fill="' + g('body', [s1, s2]) + '"/>';
    o += '<path d="M146 236 C190 244 250 244 276 220 C272 238 246 244 200 246 C170 246 152 242 146 236z" fill="#efe2cc"/>';
    for (var i = 0; i < 12; i++) o += '<path d="M' + (132 + i * 11) + ' ' + (162 + Math.abs(i - 6) * 1.8) + ' l2 -6 M' + (136 + i * 11) + ' ' + (160 + Math.abs(i - 6) * 1.8) + ' l2 -6" stroke="' + s2 + '" stroke-width="2" stroke-linecap="round"/>';
    o += limb('M248 222 L262 238', 15, s1) + limb('M168 224 L160 238', 15, s1);
    o += '<ellipse cx="266" cy="239" rx="11" ry="5" fill="#d9a89a"/><ellipse cx="160" cy="239" rx="11" ry="5" fill="#d9a89a"/>';
    // head
    o += '<path d="M262 168 C272 148 308 146 336 162 L376 186 C382 192 376 200 366 200 L318 204 C284 208 262 196 262 168z" fill="' + g('head', [s1, s2]) + '"/>';
    o += '<path d="M310 204 L366 200 C370 199 374 196 374 192 C352 204 330 208 310 204z" fill="#efe2cc"/>';
    o += '<circle cx="378" cy="188" r="5.5" fill="#2a1d14"/><circle cx="376" cy="186" r="1.6" fill="#fff"/>';
    o += '<circle cx="276" cy="150" r="13" fill="' + s2 + '"/><circle cx="276" cy="150" r="7.5" fill="#e7b3a0"/>';
    o += eye(318, 170, 11);
    o += '<path d="M350 192 L392 180 M350 196 L392 194 M350 199 L388 208" stroke="#3a2a22" stroke-width="1.6" stroke-linecap="round"/>';
    // a beetle snack
    o += '<ellipse cx="320" cy="232" rx="0" ry="0"/>';
    return o;
  });

  build('cat', function (g) {
    var s1 = '#f5a64a', s2 = '#d9772a', dk = '#b9601e', o = '';
    o += sh(200, 267, 150);
    o += '<path d="M116 200 C70 196 52 150 84 112" stroke="' + s2 + '" stroke-width="20" fill="none" stroke-linecap="round"/>';
    o += '<path d="M116 200 C70 196 52 150 84 112" stroke="' + dk + '" stroke-width="20" fill="none" stroke-dasharray="6 14" stroke-dashoffset="4"/>';
    o += '<path d="M116 200 C70 196 52 150 84 112" stroke="#f5a64a" stroke-width="2" fill="none" opacity="0"/>';
    o += limb('M236 214 L242 260', 17, dk) + limb('M140 214 L136 260', 17, dk);
    o += '<path d="M108 192 C110 156 172 150 232 156 C264 158 278 176 274 206 C270 232 242 242 212 242 L152 242 C124 240 106 216 108 192z" fill="' + g('body', [s1, s2]) + '"/>';
    for (var i = 0; i < 5; i++) o += '<path d="M' + (136 + i * 22) + ' ' + (162 - (i % 2) * 1) + ' q-4 22 4 40" stroke="' + dk + '" stroke-width="6" stroke-linecap="round" fill="none" opacity=".8"/>';
    o += '<ellipse cx="148" cy="212" rx="38" ry="30" fill="' + s1 + '" opacity=".6"/>';
    o += limb('M254 214 L258 258', 19, s1) + limb('M156 226 L160 258', 17, s1);
    o += '<ellipse cx="262" cy="259" rx="14" ry="6" fill="#fff6e6"/><ellipse cx="164" cy="259" rx="14" ry="6" fill="#fff6e6"/>';
    // head
    o += '<path d="M276 118 L280 76 L308 104z" fill="' + s2 + '"/><path d="M283 108 L284 88 L298 104z" fill="#f4a5a5"/>';
    o += '<path d="M318 104 L342 78 L350 122z" fill="' + s2 + '"/><path d="M330 108 L341 92 L343 114z" fill="#f4a5a5"/>';
    o += '<circle cx="308" cy="150" r="42" fill="' + g('head', [s1, s2], 'd') + '"/>';
    o += '<ellipse cx="336" cy="166" rx="20" ry="16" fill="#fff6e6"/>';
    o += '<path d="M296 112 l2 14 M308 110 l0 15 M320 112 l-2 14" stroke="' + dk + '" stroke-width="5" stroke-linecap="round"/>';
    o += '<path d="M344 158 l10 0 l-5 7z" fill="#f08a96"/><path d="M349 165 q-4 7 -11 6 M349 165 q4 7 11 5" stroke="#8a4a3a" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    o += eye(324, 146, 10, { iris: '#a8e65a', slit: true });
    o += '<path d="M354 160 L392 148 M354 164 L394 164 M354 168 L388 178" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/><path d="M354 160 L392 148 M354 164 L394 164 M354 168 L388 178" stroke="#8a5a3a" stroke-width=".6" opacity=".4"/>';
    return o;
  });

  build('human', function (g) {
    var skin = '#f2c29b', o = '';
    o += sh(200, 268, 90, 0.22);
    o += limb('M186 196 L182 250', 15, skin) + limb('M218 196 L226 250', 15, skin);
    o += '<path d="M168 244 C168 252 172 262 190 262 L208 262 C212 262 212 256 206 252 L196 244z" fill="#e8534a"/><path d="M168 258 L212 258 L212 264 L168 264z" fill="#fff" opacity=".9"/>';
    o += '<path d="M214 244 C214 252 218 262 236 262 L256 262 C260 262 260 256 254 252 L244 244z" fill="#e8534a"/><path d="M214 258 L260 258 L260 264 L214 264z" fill="#fff" opacity=".9"/>';
    o += '<path d="M170 182 L234 182 L238 214 L206 214 L202 200 L198 214 L166 214z" fill="' + g('shorts', ['#4f8ae0', '#2f5fb0']) + '"/>';
    o += limb('M172 130 L152 178', 13, skin);
    o += '<circle cx="152" cy="180" r="8" fill="' + skin + '"/>';
    o += '<path d="M166 120 C166 106 236 106 236 120 L240 188 L162 188z" fill="' + g('shirt', ['#ffd84a', '#f2a93a']) + '"/>';
    o += '<path d="M164 150 L240 150 M163 168 L240 168" stroke="#fff" stroke-width="5" opacity=".55"/>';
    o += '<path d="M200 138 l5 10 11 1 -8 8 2 11 -10 -6 -10 6 2 -11 -8 -8 11 -1z" fill="#e8534a" transform="translate(0 -8) scale(.9) translate(22 8)"/>';
    o += limb('M230 128 L264 100 L272 66', 13, skin) + '<circle cx="273" cy="60" r="9" fill="' + skin + '"/>';
    o += '<rect x="192" y="98" width="17" height="22" rx="6" fill="#e6ac80"/>';
    o += '<circle cx="200" cy="76" r="35" fill="' + g('head', ['#f8d2ae', '#eeb386'], 'd') + '"/>';
    o += '<circle cx="171" cy="80" r="8" fill="#eeb386"/>';
    o += '<path d="M166 78 C158 34 214 26 238 60 C218 54 194 56 182 82 C178 90 168 88 166 78z" fill="' + g('hair', ['#7a4a2a', '#4a2c18']) + '"/>';
    o += eye(218, 80, 6.2) + '<path d="M210 70 Q219 65 228 70" stroke="#4a2c18" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    o += '<path d="M236 86 q4 4 0 8" stroke="#d9946a" stroke-width="2" fill="none" stroke-linecap="round"/>';
    o += '<path d="M212 94 Q224 106 236 94" stroke="#a8432e" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="208" cy="92" r="5" fill="#f08a86" opacity=".5"/>';
    return o;
  });

  /* ---------- lizards, snakes ---------- */
  build('gecko', function (g) {
    var s1 = '#a6dc5a', s2 = '#3f9a5a', o = '';
    o += '<path d="M6 252 Q120 238 230 248 T396 236" stroke="' + g('br', ['#9a6a3a', '#6e4624']) + '" stroke-width="20" fill="none" stroke-linecap="round"/>';
    o += '<path d="M20 244 Q60 236 90 242" stroke="#c18a52" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>';
    o += '<path d="M60 252 C40 270 20 270 14 280 C40 282 60 270 84 256z" fill="#3fa05a"/><path d="M340 240 C350 270 366 280 392 276 C380 262 372 250 352 238z" fill="#4ab062"/>';
    o += sh(200, 268, 150, 0.14);
    // tail
    o += '<path d="M122 212 C84 216 58 196 44 164 C38 150 28 152 28 164 C32 192 64 236 124 232z" fill="' + g('tail', [s1, s2]) + '"/>';
    o += '<path d="M60 190 l10 4 M50 172 l9 4 M72 206 l10 3" stroke="#2f7a46" stroke-width="3" stroke-linecap="round" opacity=".7"/>';
    // far legs
    o += limb('M236 222 L262 242 L284 244', 11, '#3a8a50') + limb('M150 224 L134 244 L114 246', 11, '#3a8a50');
    o += '<g fill="#3a8a50"><circle cx="290" cy="243" r="5"/><circle cx="290" cy="251" r="4"/><circle cx="112" cy="246" r="5"/></g>';
    o += '<path d="M108 216 C118 190 218 184 268 194 C290 198 298 212 290 224 C250 242 150 240 116 232 C106 228 104 222 108 216z" fill="' + g('body', [s1, s2]) + '"/>';
    o += '<path d="M120 230 C160 242 250 242 288 224 C282 238 240 246 190 246 C150 246 128 240 120 230z" fill="#e9f4b0"/>';
    var sp = [[150, 204, 7], [178, 200, 8], [206, 202, 7], [234, 204, 8], [164, 216, 5], [194, 216, 6], [222, 218, 5]];
    for (var i = 0; i < sp.length; i++) o += '<circle cx="' + sp[i][0] + '" cy="' + sp[i][1] + '" r="' + sp[i][2] + '" fill="#ff9a3c" opacity=".9"/>';
    // near legs
    o += limb('M256 224 L292 238 L318 244', 12, s1) + limb('M138 226 L120 244 L98 248', 12, s1);
    o += '<g fill="' + s1 + '"><circle cx="324" cy="241" r="5"/><circle cx="326" cy="249" r="5"/><circle cx="318" cy="253" r="4.5"/><circle cx="94" cy="246" r="5"/><circle cx="92" cy="254" r="5"/><circle cx="100" cy="257" r="4.5"/></g>';
    // head
    o += '<path d="M262 196 C284 176 328 176 354 196 C364 206 358 218 346 222 C320 230 286 228 270 222z" fill="' + g('head', [s1, s2]) + '"/>';
    o += '<path d="M276 224 C300 232 330 230 348 222 C352 220 356 216 356 212 C336 224 300 224 276 224z" fill="#e9f4b0"/>';
    o += '<path d="M300 218 Q330 224 356 212" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
    o += '<circle cx="352" cy="202" r="2" fill="' + INK + '"/>';
    o += '<circle cx="314" cy="186" r="19" fill="' + s2 + '"/>' + eye(314, 186, 15, { iris: '#ffd54a', slit: true });
    return o;
  });

  build('snake', function (g) {
    var d = 'M26 258 C90 272 150 264 172 244 C194 222 150 206 110 214 C68 222 72 254 132 252 C210 252 262 248 284 220 C304 192 286 162 300 134 C308 116 324 106 334 108';
    var o = sh(200, 270, 160, 0.16);
    o += '<path d="' + d + '" fill="none" stroke="#2c6e3a" stroke-width="40" stroke-linecap="round" stroke-linejoin="round"/>';
    o += '<path d="' + d + '" fill="none" stroke="' + g('sk', ['#8bd24f', '#4aa850']) + '" stroke-width="32" stroke-linecap="round" stroke-linejoin="round"/>';
    o += '<path d="' + d + '" fill="none" stroke="#2f7a3a" stroke-width="16" stroke-dasharray="11 15" stroke-dashoffset="3"/>';
    o += '<path d="' + d + '" fill="none" stroke="#ffe27a" stroke-width="5" stroke-dasharray="3 23" stroke-dashoffset="-3" stroke-linecap="round"/>';
    o += '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".18" transform="translate(0 -9)"/>';
    // head
    o += '<g transform="rotate(-12 340 104)"><path d="M312 104 C312 86 340 80 362 90 C378 96 380 112 366 120 C346 128 316 124 312 104z" fill="' + g('hd', ['#9bdc5a', '#3f9a4a']) + '"/>';
    o += '<path d="M318 116 C336 128 362 124 372 114 C368 124 344 132 322 124z" fill="#f2f6b8"/>';
    o += '<path d="M330 104 l8 -6 M342 100 l8 -4" stroke="#2f7a3a" stroke-width="4" stroke-linecap="round" opacity=".5"/>';
    o += '<circle cx="372" cy="102" r="2" fill="' + INK + '"/>' + eye(344, 98, 8, { iris: '#ffe27a', slit: true }) + '</g>';
    o += '<path d="M376 112 q8 3 13 -3 M389 109 l4 -5 M389 109 l5 4" stroke="#e8394f" stroke-width="3" fill="none" stroke-linecap="round" transform="rotate(-12 340 104)"/>';
    o += grass(344, 268, 1.3, '#4aa94a') + grass(40, 268, 1.1, '#4aa94a');
    return o;
  });

  /* ---------- sea reptiles ---------- */
  function bubbles(list) {
    return list.map(function (b) { return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="#fff" opacity=".55" stroke="#9fd8ef" stroke-width="1"/>'; }).join('');
  }

  build('mosasaur', function (g) {
    var o = waves(236, '#5fb8dd', 0.3);
    o += '<path d="M44 238 C30 226 20 212 12 194 C30 198 48 212 66 232z" fill="#2f6a7a"/>';
    o += '<path d="M44 240 C34 254 26 268 24 280 C42 270 58 256 72 242z" fill="#2f6a7a"/>';
    o += '<path d="M30 238 C90 232 150 205 215 188 C265 175 300 156 335 150 C342 172 332 192 302 206 C252 232 170 250 110 252 C80 254 52 248 30 238z" fill="' + g('body', ['#6cc2a0', '#2f7a84']) + '"/>';
    o += '<path d="M110 252 C170 250 252 232 302 206 C322 196 332 188 336 184 C306 216 240 240 170 245 C140 248 120 250 110 252z" fill="#e8f0c8" opacity=".9"/>';
    for (var i = 0; i < 9; i++) o += '<path d="M' + (96 + i * 22) + ' ' + (216 - i * 6.2) + ' l5 -7 l5 6" fill="#2f6a7a"/>';
    for (var j = 0; j < 5; j++) o += '<path d="M' + (120 + j * 36) + ' ' + (226 - j * 12) + ' q8 10 4 24" stroke="#2f6a7a" stroke-width="6" fill="none" stroke-linecap="round" opacity=".45"/>';
    o += '<path d="M214 222 C228 244 250 258 268 256 C262 240 246 226 232 210z" fill="' + g('fl', ['#58a8a0', '#2f6a7a']) + '"/>';
    o += '<path d="M318 148 C336 136 366 138 394 152 L394 162 C370 166 340 172 322 172z" fill="' + g('hd', ['#6cc2a0', '#3a8a8a']) + '"/>';
    o += '<path d="M322 170 C346 170 372 168 392 164 C388 178 362 184 332 188 C316 188 310 180 322 170z" fill="#e8f0c8"/>';
    o += '<path d="M324 172 C346 170 372 166 394 160" stroke="' + INK + '" stroke-width="2" fill="none"/>' + teeth(346, 168, 6, 7, 5, 1);
    o += eye(338, 152, 7.5, { iris: '#ffe27a' });
    o += '<circle cx="386" cy="153" r="2" fill="' + INK + '"/>';
    o += waves(248, '#3f9fd4', 0.5);
    o += '<path d="M0 252 Q40 244 80 252 T160 252 T240 252 T320 252 T400 252" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>';
    o += bubbles([[330, 224, 5], [346, 212, 3.5], [60, 258, 4], [290, 262, 4]]);
    return o;
  });

  build('plesiosaur', function (g) {
    var o = waves(230, '#5fb8dd', 0.3);
    o += '<path d="M118 205 C80 210 60 222 28 238 C70 234 100 234 122 224z" fill="#2c7a80"/>';
    o += '<path d="M150 224 L134 264 L164 262 L172 228z" fill="#3a8a88"/><path d="M238 222 L254 262 L282 248 L266 220z" fill="#3a8a88"/>';
    o += '<path d="M240 182 C282 172 292 124 287 92 C286 72 300 56 318 58 L318 76 C308 80 306 92 306 102 C308 142 302 192 264 218z" fill="' + g('neck', ['#6cc2a8', '#2f8a88']) + '"/>';
    o += '<ellipse cx="190" cy="206" rx="82" ry="35" fill="' + g('body', ['#70c8aa', '#2f8a86']) + '"/>';
    o += '<path d="M118 216 C150 240 230 244 268 218 C262 238 220 248 190 248 C156 248 128 236 118 216z" fill="#e8f0c8" opacity=".9"/>';
    for (var i = 0; i < 6; i++) o += '<circle cx="' + (140 + i * 22) + '" cy="' + (196 + (i % 2) * 10) + '" r="5" fill="#2f7a7a" opacity=".45"/>';
    o += '<path d="M146 228 L130 266 L162 262 L166 232z" fill="#4aa898"/><path d="M232 226 L248 266 L280 252 L262 224z" fill="#4aa898"/>';
    o += '<path d="M298 60 C306 46 336 44 354 58 C360 64 356 74 346 76 C330 80 310 78 300 72z" fill="' + g('hd', ['#6cc2a8', '#3a8a8a']) + '"/>';
    o += '<path d="M310 74 C330 78 346 76 354 70" stroke="' + INK + '" stroke-width="1.6" fill="none"/>' + teeth(324, 74, 4, 6, 4, 1);
    o += eye(318, 62, 6.2, { iris: '#ffe27a' });
    o += waves(246, '#3f9fd4', 0.5);
    o += '<path d="M0 250 Q40 242 80 250 T160 250 T240 250 T320 250 T400 250" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>';
    o += bubbles([[90, 262, 4], [300, 258, 5], [316, 270, 3]]);
    return o;
  });

  build('ichthyosaur', function (g) {
    var o = waves(244, '#5fb8dd', 0.3);
    o += '<g transform="rotate(-9 200 190)">';
    o += '<path d="M62 198 C40 176 30 150 36 128 C50 150 62 170 76 196z" fill="#2f5f8c"/>';
    o += '<path d="M62 206 C44 228 36 252 40 272 C54 250 66 232 78 206z" fill="#2f5f8c"/>';
    o += '<path d="M62 198 C100 160 180 140 250 152 C300 160 340 172 392 186 L392 192 C350 196 320 204 290 214 C230 242 130 236 62 206z" fill="' + g('body', ['#7cb4dc', '#34608c']) + '"/>';
    o += '<path d="M64 206 C130 236 230 242 290 214 C318 204 350 196 392 192 C350 204 320 220 290 230 C230 252 130 248 64 210z" fill="#e6f1f8" opacity=".9"/>';
    o += '<path d="M170 152 L198 108 L220 148z" fill="#2f5f8c"/>';
    o += '<path d="M236 214 L216 254 L258 236z" fill="#2f5f8c"/>';
    o += '<path d="M310 186 L392 190" stroke="' + INK + '" stroke-width="2"/>' + teeth(330, 187, 9, 6, 4, 1);
    o += '<circle cx="320" cy="170" r="17" fill="#2f5f8c" opacity=".35"/>' + eye(320, 170, 13, { iris: '#ffe27a' });
    o += '<circle cx="388" cy="184" r="2" fill="' + INK + '"/>';
    for (var i = 0; i < 4; i++) o += '<path d="M' + (110 + i * 34) + ' ' + (180 - i * 3) + ' q6 14 0 30" stroke="#34608c" stroke-width="5" fill="none" stroke-linecap="round" opacity=".4"/>';
    o += '</g>';
    o += waves(256, '#3f9fd4', 0.5);
    o += '<path d="M0 260 Q40 252 80 260 T160 260 T240 260 T320 260 T400 260" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>';
    o += bubbles([[360, 240, 4], [376, 226, 3], [100, 266, 4]]);
    return o;
  });

  /* ---------- turtles ---------- */
  function hexPts(cx, cy, r) {
    var p = [];
    for (var i = 0; i < 6; i++) { var a = (Math.PI / 3) * i; p.push((cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1)); }
    return p.join(' ');
  }
  function hexGrid(list, fill, stroke) {
    return list.map(function (h) { return '<polygon points="' + hexPts(h[0], h[1], h[2]) + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="3" stroke-linejoin="round"/>'; }).join('');
  }

  build('turtle', function (g) {
    var shell = 'M104 192 C104 116 276 108 304 186 C308 200 292 210 270 212 L140 214 C116 214 104 206 104 192z';
    var o = waves(256, '#5fb8dd', 0.28);
    o += '<defs><clipPath id="turtle-c"><path d="' + shell + '"/></clipPath></defs>';
    o += '<path d="M140 204 C120 226 100 240 82 242 C98 228 112 212 124 196z" fill="#6a9a4a"/>';
    o += '<path d="M268 196 C300 222 344 252 376 254 C362 236 332 210 294 186z" fill="' + g('fl', ['#8cc460', '#4d7a3a']) + '"/>';
    o += '<path d="M104 192 C104 116 276 108 304 186 C308 200 292 210 270 212 L140 214 C116 214 104 206 104 192z" fill="' + g('sh', ['#a8cc5a', '#4d7a3a']) + '"/>';
    o += '<g clip-path="url(#turtle-c)">' + hexGrid([[200, 146, 27], [152, 170, 25], [248, 170, 25], [200, 194, 25], [112, 194, 24], [288, 194, 24], [160, 124, 22], [240, 124, 22]], '#b9d76a', '#3f6a2e') + '<path d="M104 150 C150 100 260 96 300 150 L300 112 L104 112z" fill="#fff" opacity=".12"/></g>';
    o += '<path d="' + shell + '" fill="none" stroke="#3f6a2e" stroke-width="4" stroke-linejoin="round"/>';
    o += '<path d="M112 206 Q200 228 296 206 L300 214 Q200 236 114 214z" fill="#f2e6b8"/>';
    o += '<path d="M290 168 C306 156 322 148 338 146" stroke="#8cc460" stroke-width="22" fill="none" stroke-linecap="round"/>';
    o += '<path d="M318 156 C322 134 356 126 378 142 C392 150 386 168 368 172 C348 178 326 176 318 164z" fill="' + g('hd', ['#a8d66a', '#5a9a46']) + '"/>';
    o += '<path d="M360 160 C372 162 382 160 388 154" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    o += '<circle cx="384" cy="148" r="2" fill="' + INK + '"/>' + eye(356, 144, 8, { iris: '#fff' });
    o += '<path d="M328 140 q8 -8 18 -6" stroke="#3f6a2e" stroke-width="2" fill="none" opacity=".5"/>';
    o += bubbles([[330, 118, 4], [350, 100, 3], [60, 268, 4], [340, 270, 3.5]]);
    o += sh(200, 272, 120, 0.12);
    return o;
  });

  build('tortoise', function (g) {
    var shell = 'M92 218 C88 120 140 84 200 84 C262 84 314 120 308 218z';
    var o = sh(200, 267, 160);
    o += '<defs><clipPath id="tortoise-c"><path d="' + shell + '"/></clipPath></defs>';
    o += limb('M270 226 L280 262', 28, '#a69a68') + limb('M126 226 L118 262', 28, '#a69a68');
    o += '<path d="M104 236 C84 238 70 246 62 254 C80 254 98 250 112 244z" fill="#b5a878"/>';
    o += '<path d="M294 202 C320 198 336 188 348 176" stroke="#c4b884" stroke-width="30" fill="none" stroke-linecap="round"/>';
    o += '<path d="M300 190 q10 6 20 0 M306 204 q10 6 20 0" stroke="#8a7a50" stroke-width="2" fill="none" opacity=".5"/>';
    o += '<path d="M92 218 C88 120 140 84 200 84 C262 84 314 120 308 218z" fill="' + g('sh', ['#dcb85a', '#7a5a22']) + '"/>';
    o += '<g clip-path="url(#tortoise-c)">' + hexGrid([[200, 130, 34], [142, 160, 30], [258, 160, 30], [200, 190, 30], [112, 200, 26], [288, 200, 26], [160, 96, 24], [240, 96, 24]], '#e7c872', '#6a4a1a') + '<path d="M96 160 C130 96 270 94 304 160 L304 90 L96 90z" fill="#fff" opacity=".13"/></g>';
    o += '<path d="' + shell + '" fill="none" stroke="#6a4a1a" stroke-width="4"/>';
    o += '<path d="M84 214 L316 214 L308 234 L92 234z" fill="' + g('rim', ['#a07a32', '#6a4a1a']) + '" stroke="#6a4a1a" stroke-width="2"/>';
    o += '<path d="M104 214 v20 M130 214 v20 M156 214 v20 M184 214 v20 M212 214 v20 M240 214 v20 M268 214 v20 M292 214 v20" stroke="#6a4a1a" stroke-width="1.6" opacity=".6"/>';
    o += limb('M280 226 L290 262', 30, '#c4b884') + limb('M136 228 L130 262', 30, '#c4b884');
    o += '<ellipse cx="294" cy="262" rx="19" ry="7" fill="#c4b884"/><ellipse cx="132" cy="262" rx="19" ry="7" fill="#c4b884"/>';
    o += '<path d="M288 262 v-5 M296 263 v-5 M304 262 v-5 M126 262 v-5 M134 263 v-5 M142 262 v-5" stroke="#6a5a3a" stroke-width="3" stroke-linecap="round"/>';
    o += '<path d="M334 172 C336 150 368 144 386 160 C396 170 388 186 372 188 C354 192 338 188 334 180z" fill="' + g('hd', ['#d6ca94', '#a69a68']) + '"/>';
    o += '<path d="M364 178 C374 180 384 176 390 170" stroke="' + INK + '" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    o += '<circle cx="388" cy="162" r="2" fill="' + INK + '"/>' + eye(364, 160, 8);
    o += '<path d="M356 150 q10 -6 22 -2" stroke="#8a7a50" stroke-width="2" fill="none" opacity=".6"/>';
    o += grass(30, 270, 1.2, '#5aa94a') + grass(364, 276, 1.3, '#5aa94a') + flower(344, 272, 1, '#ffe27a', '#ff8a3a');
    return o;
  });

  /* ---------- crocodilians ---------- */
  function croc(g, o) {
    var s1 = o.skin[0], s2 = o.skin[1], dk = o.dark, out = '', i;
    out += limb('M262 232 L278 248 L298 258', 20, dk) + limb('M156 232 L146 250 L164 259', 20, dk);
    out += '<path d="M135 194 C100 196 60 206 14 226 C60 238 100 242 140 240z" fill="' + g('tail', [s1, s2]) + '"/>';
    for (i = 0; i < 9; i++) out += '<path d="M' + (28 + i * 11) + ' ' + (222 - i * 3.2) + ' l5 -9 l5 9z" fill="' + dk + '"/>';
    out += '<path d="M122 200 C130 178 250 174 282 190 C294 198 294 222 280 232 C240 248 160 250 128 240 C112 232 112 210 122 200z" fill="' + g('body', [s1, s2]) + '"/>';
    out += '<path d="M128 240 C160 252 240 250 280 232 C288 226 292 220 292 214 C270 236 170 244 128 234z" fill="' + o.belly + '"/>';
    for (i = 0; i < 11; i++) out += '<path d="M' + (132 + i * 13) + ' ' + (184 + Math.abs(i - 5) * 0.8) + ' l5 -9 l5 9z" fill="' + dk + '"/>';
    for (i = 0; i < 6; i++) out += '<circle cx="' + (146 + i * 22) + '" cy="' + (206 + (i % 2) * 8) + '" r="3.2" fill="' + dk + '" opacity=".45"/>';
    out += limb('M270 234 L290 250 L310 260', 22, s1) + limb('M168 234 L154 252 L176 260', 22, s1);
    out += '<path d="M310 262 l10 0 M310 258 l9 -3 M178 262 l10 0 M176 258 l9 -3" stroke="' + s1 + '" stroke-width="5" stroke-linecap="round"/>';
    if (o.snout === 'v') {
      out += '<path d="M290 214 L386 208 L380 214 L296 218z" fill="#a83a40"/>';
      out += '<path d="M290 212 L384 209 C392 211 388 220 374 224 L300 234 C288 232 282 222 290 212z" fill="' + g('jaw', [o.belly, '#cfd7a0']) + '"/>';
      out += '<path d="M268 186 C290 177 320 179 392 196 C396 202 390 206 382 207 L292 212 C276 208 268 198 268 186z" fill="' + g('hd', [s1, s2]) + '"/>';
      out += '<path d="M296 211 L384 207" stroke="' + INK + '" stroke-width="1.6"/>' + teeth(304, 211, 10, 8, 6, 1) + teeth(310, 215, 8, 9, 5, -1);
      out += '<ellipse cx="386" cy="196" rx="6" ry="4" fill="' + dk + '"/>';
    } else {
      out += '<path d="M270 186 C290 178 322 178 366 186 C390 190 396 206 380 214 C366 220 340 222 300 222 C282 220 270 202 270 186z" fill="' + g('hd', [s1, s2]) + '"/>';
      out += '<path d="M290 214 C320 222 360 222 380 214 C386 210 390 206 391 202 C374 214 330 216 290 214z" fill="' + o.belly + '"/>';
      out += '<path d="M292 212 C320 218 356 216 384 206" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
      out += '<path d="M318 214 l3 5 l3 -5 M340 214 l3 5 l3 -5 M362 211 l3 5 l3 -5" fill="#fffaf0" stroke="#d8cdb8" stroke-width=".5"/>';
      out += '<ellipse cx="384" cy="192" rx="5" ry="3.5" fill="' + dk + '"/><ellipse cx="372" cy="190" rx="3" ry="2" fill="' + dk + '" opacity=".6"/>';
    }
    out += '<ellipse cx="294" cy="186" rx="12" ry="9" fill="' + s2 + '"/>' + eye(294, 184, 6.5, { iris: '#ffd54a', slit: true });
    return out;
  }

  build('crocodile', function (g) {
    return sh(200, 268, 190) +
      '<path d="M0 262 Q60 254 120 264 L400 266 V300 H0z" fill="#b9a46a" opacity=".5"/>' +
      croc(g, { skin: ['#8fae56', '#4f7a34'], dark: '#3f5f2a', belly: '#f1e8a8', snout: 'v' }) +
      waves(268, '#4fa6c4', 0.45) + grass(366, 272, 1.1, '#5aa94a') + grass(30, 276, 1.1, '#5aa94a');
  });

  build('alligator', function (g) {
    return sh(200, 268, 190, 0.12) +
      croc(g, { skin: ['#6a8a62', '#33503a'], dark: '#27402f', belly: '#dfe2c0', snout: 'u' }) +
      waves(262, '#3f8a8a', 0.55) + waves(272, '#2f7a7a', 0.5) +
      '<ellipse cx="60" cy="262" rx="22" ry="6" fill="#4aa850"/><path d="M60 262 L72 258" stroke="#2f7a3a" stroke-width="2"/><circle cx="70" cy="258" r="4" fill="#ff9ec4"/>' +
      '<path d="M358 270 L356 220 M370 270 L372 210 M380 270 L378 232" stroke="#6a9a4a" stroke-width="3"/><ellipse cx="372" cy="204" rx="4" ry="10" fill="#8a5a34"/><ellipse cx="356" cy="214" rx="4" ry="9" fill="#8a5a34"/>';
  });

  /* ---------- archosaurs: croc-line and bird-line cousins ---------- */
  build('archosaur', function (g) {
    var s1 = '#98b85e', s2 = '#4e6e38', dk = '#3d5a2c', o = sh(200, 267, 170);
    o += limb('M192 198 L182 238 L202 260', 13, dk) + limb('M252 192 L262 226 L276 260', 11, dk);
    o += '<path d="M130 176 C96 176 60 196 18 238 C58 234 100 222 140 206z" fill="' + g('tail', [s1, s2]) + '"/>';
    o += '<path d="M124 180 C140 148 222 140 262 152 C286 158 296 172 286 186 C262 208 176 214 136 202 C120 196 116 188 124 180z" fill="' + g('body', [s1, s2]) + '"/>';
    o += '<path d="M138 204 C176 216 256 208 284 188 C276 206 240 220 190 220 C164 220 144 212 138 204z" fill="#eef0b8"/>';
    for (var i = 0; i < 10; i++) o += '<ellipse cx="' + (148 + i * 12) + '" cy="' + (156 - Math.sin(i / 9 * 3) * 3 + (i > 6 ? (i - 6) * 3 : 0)) + '" rx="4" ry="3" fill="' + dk + '" opacity=".7"/>';
    for (var j = 0; j < 4; j++) o += '<path d="M' + (160 + j * 24) + ' 160 q-4 16 2 32" stroke="' + dk + '" stroke-width="6" fill="none" stroke-linecap="round" opacity=".35"/>';
    o += '<path d="M60 222 q6 -10 12 -14 M90 214 q6 -10 12 -14" stroke="' + dk + '" stroke-width="5" stroke-linecap="round" fill="none" opacity=".4"/>';
    o += '<ellipse cx="172" cy="196" rx="28" ry="22" fill="' + s1 + '"/>';
    o += limb('M176 202 L166 238 L188 260', 15, s1) + '<path d="M186 260 l20 1 M186 258 l18 -5" stroke="' + s1 + '" stroke-width="5.5" stroke-linecap="round"/>';
    o += limb('M254 192 L266 226 L282 260', 12, s1) + '<path d="M282 260 l14 0" stroke="' + s1 + '" stroke-width="5" stroke-linecap="round"/>';
    o += '<path d="M262 152 C282 136 296 124 308 120 L330 134 C312 146 296 164 280 184z" fill="' + g('neck', [s1, s2]) + '"/>';
    o += '<path d="M300 118 C316 106 350 108 376 126 L380 134 C354 142 326 144 306 140 C296 134 294 124 300 118z" fill="' + g('head', [s1, s2]) + '"/>';
    o += '<path d="M310 138 C340 142 366 138 380 134 C372 142 340 148 312 146z" fill="#eef0b8"/>';
    o += '<path d="M312 136 Q346 140 378 132" stroke="' + INK + '" stroke-width="2" fill="none"/>' + teeth(330, 137, 6, 7, 5, 1);
    o += '<ellipse cx="344" cy="122" rx="6" ry="4" fill="' + INK + '" opacity=".45"/><circle cx="376" cy="126" r="2" fill="' + INK + '"/>' + eye(322, 124, 7.5);
    return o;
  });

  build('pseudosuchian', function (g) {
    var s1 = '#b0a384', s2 = '#6e6247', dk = '#574c36', o = sh(200, 267, 180);
    o += limb('M246 226 L252 262', 20, dk) + limb('M176 228 L172 262', 20, dk);
    o += '<path d="M130 196 C100 200 60 216 14 244 C66 248 110 240 140 232z" fill="' + g('tail', [s1, s2]) + '"/>';
    for (var t = 0; t < 7; t++) o += '<rect x="' + (28 + t * 14) + '" y="' + (232 - t * 4.2) + '" width="8" height="8" rx="2" fill="' + dk + '" transform="rotate(-20 ' + (32 + t * 14) + ' ' + (236 - t * 4) + ')"/>';
    o += '<path d="M108 196 C116 152 266 148 288 176 C300 192 294 218 270 230 C226 246 156 244 122 230 C108 222 104 208 108 196z" fill="' + g('body', [s1, s2]) + '"/>';
    for (var r = 0; r < 10; r++) {
      o += '<rect x="' + (124 + r * 15) + '" y="' + (164 - Math.sin(r / 9 * 3) * 3 + 2) + '" width="13" height="12" rx="3" fill="' + (r % 2 ? '#c9bd9c' : '#b9ad8c') + '" stroke="' + dk + '" stroke-width="1.5"/>';
      o += '<rect x="' + (124 + r * 15) + '" y="' + (180 - Math.sin(r / 9 * 3) * 2) + '" width="13" height="12" rx="3" fill="' + (r % 2 ? '#b9ad8c' : '#c9bd9c') + '" stroke="' + dk + '" stroke-width="1.5"/>';
    }
    o += '<path d="M236 158 L250 128 L260 162z M214 158 L224 134 L236 160z" fill="#d6ca9c" stroke="' + dk + '" stroke-width="1.5"/>';
    o += '<path d="M136 226 C180 242 250 242 284 218 C282 232 240 248 190 248 C160 246 144 238 136 226z" fill="#e8dfc0"/>';
    o += limb('M258 228 L264 262', 22, s1) + limb('M160 228 L154 262', 22, s1);
    o += '<ellipse cx="268" cy="262" rx="14" ry="5" fill="' + s1 + '"/><ellipse cx="156" cy="262" rx="14" ry="5" fill="' + s1 + '"/>';
    o += '<path d="M278 176 C292 164 322 166 342 180 C356 188 354 204 340 208 C320 212 296 208 284 198z" fill="' + g('head', [s1, s2]) + '"/>';
    o += '<path d="M336 186 C352 184 366 192 362 204 C356 212 342 210 336 204z" fill="#cdbfa0"/>';
    o += '<circle cx="354" cy="194" r="2.4" fill="' + INK + '"/><path d="M296 202 Q326 208 342 204" stroke="' + INK + '" stroke-width="2" fill="none"/>';
    o += eye(312, 182, 7.5);
    o += '<path d="M290 178 q8 -10 20 -8" stroke="' + dk + '" stroke-width="3" fill="none"/>';
    return o;
  });

  build('postosuchus', function (g) {
    var s1 = '#a8845a', s2 = '#5e4430', dk = '#3e2c1e', o = sh(200, 267, 180);
    o += limb('M236 218 L244 262', 22, dk) + limb('M172 222 L176 262', 26, dk);
    o += '<path d="M120 190 C90 196 52 216 12 240 C60 246 110 236 140 222z" fill="' + g('tail', [s1, s2]) + '"/>';
    o += '<path d="M100 186 C120 140 250 136 282 160 C298 174 292 202 272 216 C222 236 150 230 120 218 C104 210 96 198 100 186z" fill="' + g('body', [s1, s2]) + '"/>';
    for (var i = 0; i < 11; i++) o += '<path d="M' + (118 + i * 14) + ' ' + (162 - Math.sin(i / 10 * 3.2) * 4 + (i < 2 ? 12 : 0)) + ' l6 -13 l6 13z" fill="' + dk + '"/>';
    for (var j = 0; j < 6; j++) o += '<path d="M' + (136 + j * 22) + ' 170 q-4 22 2 40" stroke="#e0a860" stroke-width="6" fill="none" stroke-linecap="round" opacity=".55"/>';
    o += '<path d="M130 220 C180 240 250 238 284 206 C284 226 240 244 190 244 C158 244 138 236 130 220z" fill="#e8d8b0"/>';
    o += '<ellipse cx="160" cy="206" rx="32" ry="26" fill="' + s1 + '"/>';
    o += limb('M164 214 L156 244 L168 262', 24, s1) + '<ellipse cx="174" cy="262" rx="16" ry="5.5" fill="' + s1 + '"/>';
    o += limb('M250 216 L258 244 L262 262', 20, s1) + '<ellipse cx="268" cy="262" rx="14" ry="5" fill="' + s1 + '"/>';
    o += '<path d="M268 160 C280 138 320 128 358 138 C380 144 390 160 386 176 C382 186 372 192 356 192 L300 194 C282 192 268 180 268 160z" fill="' + g('head', [s1, s2]) + '"/>';
    o += '<path d="M296 194 C320 198 360 196 384 182 C380 190 366 198 346 200 L304 202z" fill="#e8d8b0"/>';
    o += '<path d="M300 192 C330 194 360 190 384 180" stroke="' + INK + '" stroke-width="2.4" fill="none"/>' + teeth(312, 192, 7, 10, 9, 1);
    o += '<ellipse cx="380" cy="152" rx="6" ry="4" fill="' + INK + '"/>';
    o += '<path d="M310 136 q16 -8 32 0" stroke="' + dk + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
    o += eye(326, 148, 8.5, { iris: '#ffd54a' });
    return o;
  });

  build('crocodylomorph', function (g) {
    var s1 = '#b8b070', s2 = '#6e7a44', dk = '#4e5a30', o = sh(200, 267, 170);
    o += '<path d="M30 190 l50 0 M10 204 l60 0 M26 218 l44 0" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>';
    o += limb('M190 186 L172 226 L190 258', 11, dk) + limb('M240 186 L252 224 L270 258', 10, dk);
    o += '<path d="M130 164 C100 160 70 172 36 200 C74 198 110 192 138 184z" fill="' + g('tail', [s1, s2]) + '"/>';
    o += '<path d="M120 164 C140 148 230 146 262 158 C280 165 280 182 262 190 C220 202 150 198 126 185 C116 178 114 170 120 164z" fill="' + g('body', [s1, s2]) + '"/>';
    o += '<path d="M130 188 C170 202 240 198 266 188 C250 206 200 210 160 204z" fill="#f0eac0"/>';
    for (var i = 0; i < 10; i++) o += '<rect x="' + (130 + i * 13) + '" y="' + (150 - Math.sin(i / 9 * 3) * 2) + '" width="9" height="8" rx="2" fill="' + dk + '"/>';
    o += '<ellipse cx="176" cy="184" rx="22" ry="17" fill="' + s1 + '"/>';
    o += limb('M180 188 L160 228 L182 258', 12, s1) + limb('M250 188 L262 226 L282 258', 11, s1);
    o += '<path d="M182 258 l20 1 M282 258 l16 0" stroke="' + s1 + '" stroke-width="5" stroke-linecap="round"/>';
    o += '<path d="M260 160 C274 144 292 140 304 146 L312 160z" fill="' + s1 + '"/>';
    o += '<path d="M268 160 C286 148 320 150 360 164 C366 168 364 174 358 176 L276 182 C266 178 262 168 268 160z" fill="' + g('head', [s1, s2]) + '"/>';
    o += '<path d="M276 180 L358 176" stroke="' + INK + '" stroke-width="2"/>' + teeth(304, 177, 8, 7, 5, 1);
    o += '<circle cx="358" cy="166" r="2.4" fill="' + INK + '"/>' + eye(292, 160, 8, { iris: '#ffd54a', slit: true });
    return o;
  });

  build('avemetatarsalian', function (g) {
    var s1 = '#9ab6cc', s2 = '#4a6a8a', dk = '#36506a', o = sh(200, 267, 180);
    o += limb('M202 204 L196 238 L212 260', 12, dk) + limb('M244 202 L252 236 L268 260', 11, dk);
    o += '<path d="M140 178 C100 180 56 198 10 228 C56 222 104 214 146 202z" fill="' + g('tail', [s1, s2]) + '"/>';
    for (var k = 0; k < 4; k++) o += '<path d="M' + (34 + k * 26) + ' ' + (216 - k * 6) + ' q4 -12 12 -16" stroke="' + dk + '" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>';
    o += '<path d="M130 184 C140 158 222 152 252 164 C270 172 270 196 254 206 C220 220 156 216 134 204 C124 198 124 190 130 184z" fill="' + g('body', [s1, s2]) + '"/>';
    o += '<path d="M138 206 C176 220 240 214 256 202 C246 218 210 226 176 222z" fill="#f2e6c0"/>';
    for (var i = 0; i < 6; i++) o += '<path d="M' + (148 + i * 18) + ' 164 q-4 14 2 28" stroke="' + dk + '" stroke-width="6" fill="none" stroke-linecap="round" opacity=".35"/>';
    o += '<ellipse cx="166" cy="198" rx="24" ry="18" fill="' + s1 + '"/>';
    o += limb('M168 204 L152 240 L172 260', 14, s1) + '<path d="M172 260 l18 1" stroke="' + s1 + '" stroke-width="5" stroke-linecap="round"/>';
    o += limb('M238 204 L244 236 L258 260', 12, s1) + '<path d="M258 260 l14 0" stroke="' + s1 + '" stroke-width="5" stroke-linecap="round"/>';
    o += '<path d="M246 168 C262 140 270 112 284 94 L304 100 C294 124 292 156 270 196z" fill="' + g('neck', [s1, s2]) + '"/>';
    o += '<path d="M280 92 C290 78 324 80 348 94 C354 98 352 104 346 106 C324 112 300 110 286 106z" fill="' + g('head', [s1, s2]) + '"/>';
    o += '<path d="M292 106 C318 110 338 108 348 104" stroke="' + INK + '" stroke-width="1.8" fill="none"/>' + teeth(316, 108, 5, 6, 4, 1);
    o += '<ellipse cx="330" cy="94" rx="5" ry="3.4" fill="' + INK + '" opacity=".4"/>' + eye(304, 94, 7);
    o += grass(366, 268, 1.1, '#5aa94a') + fern(60, 268, 0.7, '#4f8a44');
    return o;
  });

  build('dinosauromorph', function (g) {
    var s1 = '#e0a060', s2 = '#a05a32', dk = '#7a3e22', o = sh(200, 267, 150);
    o += '<path d="M20 150 l50 0 M6 168 l60 0 M24 186 l40 0" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/>';
    o += limb('M214 188 L248 214 L240 244 L262 252', 13, dk);
    o += '<path d="M152 154 C110 150 66 162 22 192 C66 186 112 184 154 172z" fill="' + g('tail', [s1, s2]) + '"/>';
    o += '<path d="M150 150 C170 128 230 124 262 140 C280 150 280 170 262 180 C230 194 176 190 156 176 C144 168 142 158 150 150z" fill="' + g('body', [s1, s2]) + '"/>';
    o += '<path d="M160 178 C196 192 240 190 264 178 C250 194 212 200 180 192z" fill="#f6e4b8"/>';
    for (var i = 0; i < 5; i++) o += '<path d="M' + (168 + i * 20) + ' 134 q-4 14 2 26" stroke="' + dk + '" stroke-width="6" fill="none" stroke-linecap="round" opacity=".35"/>';
    o += '<ellipse cx="196" cy="176" rx="30" ry="22" fill="' + s1 + '"/>';
    o += limb('M200 186 L214 226 L196 258', 15, s1) + '<path d="M196 258 l26 1 M196 256 l22 -6" stroke="' + s1 + '" stroke-width="6" stroke-linecap="round"/>';
    o += limb('M262 160 L276 178 L290 176', 7, s1);
    o += '<path d="M258 140 C272 124 282 112 294 108 L312 120 C300 130 288 146 276 160z" fill="' + g('neck', [s1, s2]) + '"/>';
    o += '<path d="M290 106 C302 96 328 98 346 112 C352 116 350 122 344 124 C326 128 304 126 294 122z" fill="' + g('head', [s1, s2]) + '"/>';
    o += '<path d="M298 122 C320 126 338 124 346 120" stroke="' + INK + '" stroke-width="1.8" fill="none"/>' + teeth(318, 124, 5, 6, 4, 1);
    o += eye(310, 110, 7.2) + '<circle cx="344" cy="114" r="1.8" fill="' + INK + '"/>';
    return o;
  });

  /* ---------- flying reptiles ---------- */
  build('pterosaur', function (g) {
    var skin = '#e08a52', mem = g('mem', ['#f4cf86', '#d89a52']), bone = '#a85e34', o = '';
    o += cloud(300, 70, 0.8, 0.6) + cloud(70, 240, 0.9, 0.5);
    // far wing, down and forward
    o += '<path d="M232 160 L258 224 L340 272 Q318 250 314 238 Q292 246 278 232 Q262 214 220 192z" fill="#c8844a" stroke="#a05a2e" stroke-width="2" stroke-linejoin="round"/>';
    o += '<path d="M232 160 L258 224 L340 272" fill="none" stroke="' + bone + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>';
    // tail with vane
    o += '<path d="M176 164 C140 176 100 192 56 214" stroke="' + skin + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
    o += '<g transform="translate(50 217) rotate(157)"><path d="M-20 0 L0 -11 L20 0 L0 11z" fill="#c8402e" stroke="#8a2a22" stroke-width="2" stroke-linejoin="round"/><path d="M-14 0 L14 0" stroke="#f08a6a" stroke-width="2"/></g>';
    o += '<path d="M196 170 L190 192 L204 200" stroke="' + skin + '" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    o += '<ellipse cx="214" cy="158" rx="44" ry="19" fill="' + g('body', ['#f0a468', '#b9602e']) + '"/>';
    o += '<path d="M180 166 C204 180 236 178 252 164 C244 182 216 190 192 184z" fill="#f8dcae"/>';
    // near wing, up and back
    o += '<path d="M222 150 L210 84 L116 24 Q148 62 140 80 Q164 96 152 116 Q176 128 170 148 Q184 156 180 170 Z" fill="' + mem + '" stroke="#a05a2e" stroke-width="2" stroke-linejoin="round"/>';
    o += '<path d="M210 84 L140 80 M210 84 L152 116 M210 84 L170 148 M210 84 L180 168" stroke="#d09a58" stroke-width="2" opacity=".8"/>';
    o += '<path d="M222 150 L210 84 L116 24" fill="none" stroke="' + bone + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>';
    o += '<circle cx="210" cy="84" r="5.5" fill="' + bone + '"/>';
    // head
    o += '<path d="M252 146 C262 134 284 130 296 134 L346 150 L350 156 C322 160 300 164 278 166 C260 164 250 156 252 146z" fill="' + g('hd', ['#f0a468', '#b9602e']) + '"/>';
    o += '<path d="M290 160 L346 156 L350 158 C326 164 304 168 284 168z" fill="#f8dcae"/>';
    o += teeth(310, 158, 6, 6, 5, 1) + '<path d="M296 160 L346 156" stroke="' + INK + '" stroke-width="1.6"/>';
    o += eye(280, 146, 8, { iris: '#ffe27a' }) + '<circle cx="346" cy="150" r="1.8" fill="' + INK + '"/>';
    return o;
  });

  build('quetzalcoatlus', function (g) {
    var s1 = '#d8b4a0', s2 = '#9a7a68', mem = g('mem', ['#e8c4b0', '#b08a76']), o = sh(200, 267, 150, 0.2);
    // tiny human for scale
    o += '<g fill="#6a5a7a" opacity=".6"><circle cx="352" cy="188" r="8"/><path d="M344 198 L360 198 L362 232 L356 232 L356 262 L350 262 L350 238 L346 262 L340 262 L342 232 L340 232z"/></g>';
    o += '<path d="M338 204 q16 -4 22 4" stroke="#6a5a7a" stroke-width="0" fill="none"/>';
    // folded wing membrane behind
    o += '<path d="M204 130 C170 124 140 150 138 214 L158 240 C166 200 190 178 214 164z" fill="' + mem + '" stroke="#8a6a58" stroke-width="2" stroke-linejoin="round"/>';
    o += '<path d="M204 130 C170 124 140 150 138 214 L158 240" fill="none" stroke="#8a6a58" stroke-width="5" stroke-linecap="round"/>';
    // hind leg
    o += limb('M178 170 L170 214 L172 258', 13, s2) + '<ellipse cx="182" cy="262" rx="14" ry="4.5" fill="' + s2 + '"/>';
    o += '<ellipse cx="190" cy="152" rx="44" ry="27" fill="' + g('body', [s1, s2]) + '"/>';
    o += '<path d="M156 168 C186 184 222 180 234 164 C226 184 196 192 166 182z" fill="#f4e6d8"/>';
    // neck
    o += '<path d="M218 134 C250 124 262 88 266 62 L288 58 C290 92 278 132 250 162z" fill="' + g('neck', [s1, s2]) + '"/>';
    o += '<path d="M232 120 q12 -6 18 -20 M240 140 q12 -8 20 -26" stroke="' + s2 + '" stroke-width="2" fill="none" opacity=".5"/>';
    // front limb down to the ground
    o += limb('M214 150 L228 206 L240 258', 12, s2) + '<path d="M240 258 l14 2 M236 256 l12 -8" stroke="' + s2 + '" stroke-width="4.5" stroke-linecap="round"/>';
    // head and beak
    o += '<path d="M262 54 C252 40 236 32 220 30 C236 42 248 52 258 66z" fill="#e0603a" stroke="#a8402a" stroke-width="1.5" stroke-linejoin="round"/>';
    o += '<path d="M260 50 C288 40 340 56 392 68 L392 71 C340 72 296 74 266 74z" fill="' + g('bk', ['#e8c8b0', '#b8907a']) + '"/>';
    o += '<path d="M266 72 C296 72 340 72 392 71" stroke="' + INK + '" stroke-width="1.4" fill="none"/>';
    o += '<path d="M262 56 C262 46 280 44 288 52 C292 62 286 74 266 74z" fill="' + s1 + '"/>';
    o += eye(274, 58, 6.5) + '<circle cx="388" cy="68" r="1.6" fill="' + INK + '"/>';
    return o;
  });
})();
