/* Art-B: dinosaurs, birds and extras. Hand-built inline SVG strings -> window.ART */
window.ART = window.ART || {};
(function () {
  'use strict';
  var B = {};
  var G = 258;

  function f1(n) { return Math.round(n * 10) / 10; }
  function lg(id, stops, x1, y1, x2, y2) {
    return '<linearGradient id="' + id + '" x1="' + (x1 || 0) + '" y1="' + (y1 || 0) + '" x2="' + (x2 || 0) + '" y2="' + (y2 === undefined ? 1 : y2) + '">' +
      stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') + '</linearGradient>';
  }
  function lgu(id, stops, y0, y1) {
    return '<linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="' + y0 + '" x2="0" y2="' + y1 + '">' + stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') + '</linearGradient>';
  }
  function legN(p, pts, col) { return limb(pts.slice(0, 2), 'url(#' + p + '-b)') + limb(pts.slice(1), col); }
  function rgr(id, stops, cx, cy, r) {
    return '<radialGradient id="' + id + '" cx="' + (cx === undefined ? .5 : cx) + '" cy="' + (cy === undefined ? .5 : cy) + '" r="' + (r || .5) + '">' +
      stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"/>'; }).join('') + '</radialGradient>';
  }
  function rng(seed) { var s = seed || 7; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  function shadow(cx, cy, rx, op) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + f1(rx * 0.085) + '" fill="#2b2b2b" opacity="' + (op || 0.2) + '"/>'; }
  function eye(x, y, r, iris) {
    iris = iris || '#f2b632';
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + iris + '" stroke="#2a1a10" stroke-width="' + f1(r * .22) + '"/>' +
      '<circle cx="' + f1(x + r * .12) + '" cy="' + y + '" r="' + f1(r * .52) + '" fill="#161212"/>' +
      '<circle cx="' + f1(x - r * .2) + '" cy="' + f1(y - r * .28) + '" r="' + f1(r * .26) + '" fill="#fff"/>';
  }
  // tapered limb: pts = [[x,y,width],...]
  function limb(pts, fill) {
    var s = '';
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + f1(p[2] / 2) + '" fill="' + fill + '"/>';
      if (i < pts.length - 1) {
        var q = pts[i + 1], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = -dy / l, ny = dx / l, a = p[2] / 2, b = q[2] / 2;
        s += '<polygon points="' + [p[0] + nx * a, p[1] + ny * a, q[0] + nx * b, q[1] + ny * b, q[0] - nx * b, q[1] - ny * b, p[0] - nx * a, p[1] - ny * a].map(f1).join(' ') + '" fill="' + fill + '"/>';
      }
    }
    return s;
  }
  function claw(x, y, ang, l, col) {
    l = l || 7;
    return '<path transform="translate(' + x + ' ' + y + ') rotate(' + (ang || 0) + ')" d="M0 -2.6 Q' + f1(l * .7) + ' -2 ' + l + ' 1.5 Q' + f1(l * .5) + ' 1 0 2.6Z" fill="' + (col || '#2b2118') + '"/>';
  }
  // three-toed theropod foot, ankle at x, ground G
  function foot(x, g, col, len, cl) {
    len = len || 38; cl = cl || '#2b2118';
    return limb([[x, g - 15, 15], [x + len * .5, g - 8, 12], [x + len, g - 5, 9]], col) +
      limb([[x + 2, g - 14, 12], [x + len * .4, g - 13, 9], [x + len * .75, g - 9, 7]], col) +
      limb([[x - 2, g - 12, 10], [x - 12, g - 6, 8]], col) +
      claw(x + len + 3, g - 4, 8, 8, cl) + claw(x + len * .75 + 3, g - 9, 22, 7, cl) + claw(x - 15, g - 5, 160, 6, cl);
  }
  function skin(p, d, c, extra) {
    return '<defs>' + lgu(p + '-b', [[0, c.top], [.5, c.mid], [.9, c.bot]], c.y0 || 90, c.y1 || 262) + '<clipPath id="' + p + '-cp"><path d="' + d + '"/></clipPath></defs>' +
      '<path d="' + d + '" fill="url(#' + p + '-b)"/>' +
      '<g clip-path="url(#' + p + '-cp)">' + (extra || '') + '</g>' +
      '<path d="' + d + '" fill="none" stroke="' + (c.line || 'rgba(0,0,0,.35)') + '" stroke-width="2" stroke-linejoin="round" opacity=".55"/>';
  }
  function stripes(ds, col, w, op) {
    return ds.map(function (d) { return '<path d="' + d + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round" opacity="' + (op || .35) + '"/>'; }).join('');
  }
  // short hair/filament strokes standing out from a polyline (left->right along a top edge gives outward = up)
  function hairs(pts, len, col, w, seed, side) {
    var r = rng(seed || 3), s = '', sd = side || 1;
    for (var i = 0; i < pts.length - 1; i++) {
      var a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1;
      var n = Math.max(1, Math.round(l / 4.5)), nx = dy / l * sd, ny = -dx / l * sd;
      for (var k = 0; k < n; k++) {
        var t = k / n, x = a[0] + dx * t, y = a[1] + dy * t, L = len * (.55 + r() * .75), bend = (r() - .5) * len * .6;
        var ex = x + nx * L + dx / l * bend, ey = y + ny * L + dy / l * bend;
        s += '<path d="M' + f1(x) + ' ' + f1(y) + ' Q' + f1(x + nx * L * .5 + dx / l * bend * .2) + ' ' + f1(y + ny * L * .5 + dy / l * bend * .2) + ' ' + f1(ex) + ' ' + f1(ey) + '"/>';
      }
    }
    return '<g fill="none" stroke="' + col + '" stroke-width="' + (w || 1.6) + '" stroke-linecap="round">' + s + '</g>';
  }
  // feather (leaf shape) rooted at x,y pointing along angle
  function leaf(x, y, len, w, ang, fill, shaft) {
    var s = '<path transform="translate(' + x + ' ' + y + ') rotate(' + ang + ')" d="M0 0C' + f1(len * .25) + ' ' + f1(-w) + ' ' + f1(len * .75) + ' ' + f1(-w * .85) + ' ' + len + ' 0C' + f1(len * .75) + ' ' + f1(w * .85) + ' ' + f1(len * .25) + ' ' + f1(w) + ' 0 0Z" fill="' + fill + '"/>';
    if (shaft) s += '<path transform="translate(' + x + ' ' + y + ') rotate(' + ang + ')" d="M2 0L' + f1(len * .96) + ' 0" stroke="' + shaft + '" stroke-width="1" opacity=".5" fill="none"/>';
    return s;
  }
  function ghost(p, inner, rgb, op) {
    return '<defs><filter id="' + p + '-gf" x="-5%" y="-5%" width="110%" height="110%"><feColorMatrix type="matrix" values="0 0 0 0 ' + rgb[0] + ' 0 0 0 0 ' + rgb[1] + ' 0 0 0 0 ' + rgb[2] + ' 0 0 0 1 0"/></filter></defs><g filter="url(#' + p + '-gf)" opacity="' + op + '">' + inner + '</g>';
  }
  function place(inner, x, y, s, flip) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (flip ? -s : s) + ' ' + s + ')">' + inner + '</g>';
  }
  function svg(body) {
    return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">' + body + '</svg>';
  }
  function teeth(pts, col, dir) { // pts: [[x,y],...] small triangles pointing dir (1 down, -1 up)
    return pts.map(function (q) { return '<path d="M' + (q[0] - 2.2) + ' ' + q[1] + ' L' + (q[0] + 2.2) + ' ' + q[1] + ' L' + q[0] + ' ' + (q[1] + 5 * dir) + 'Z" fill="' + (col || '#fff8e6') + '"/>'; }).join('');
  }

  /* ---------- T. REX (and tyrannosaur, same body plan) ---------- */
  var TREX_D = 'M14 206C55 200 105 186 138 152C158 130 188 118 218 118C244 118 256 108 262 92C266 74 280 56 310 53C335 51 360 62 376 74C382 80 378 90 368 93C368 104 350 112 320 114C300 116 285 112 278 108C276 128 268 150 262 178C250 208 215 220 185 216C160 213 140 207 120 207C90 210 50 212 14 206Z';
  B.trex = function (p, o) {
    o = o || {};
    var c = o.c || { top: '#3f6b3f', mid: '#6f9a55', bot: '#e1d796', line: '#243d25' };
    var dark = o.dark || '#4a6e3a', mid = o.mid || '#6f9a55';
    var s = shadow(200, G + 2, 130);
    s += limb([[158, 176, 44], [186, 222, 32], [168, 246, 17]], dark) + foot(168, G, dark, 36);
    s += limb([[254, 138, 14], [266, 154, 10], [276, 160, 8]], dark);
    var extra = stripes(['M120 150 q14 34 4 62', 'M150 135 q16 36 8 78', 'M184 124 q16 36 8 84', 'M218 120 q14 34 6 78', 'M80 178 q8 16 2 32', 'M50 186 q6 14 0 22'], c.top, 9, .38) +
      '<ellipse cx="236" cy="206" rx="62" ry="26" fill="#fff6c8" opacity=".28"/>';
    if (o.fuzz) extra += hairs([[10, 202], [60, 194], [110, 176], [140, 148], [175, 126], [215, 116], [248, 114]], 7, o.fuzzc || '#e8a05a', 1.7, 5);
    s += skin(p, TREX_D, c, extra);
    // near leg
    s += legN(p, [[186, 176, 52], [214, 222, 36], [192, 246, 21]], mid) + foot(192, G, mid, 40);
    // arm
    s += limb([[260, 138, 17], [274, 158, 12], [286, 166, 9]], mid) + limb([[286, 166, 6], [298, 174, 4]], mid) + limb([[286, 166, 6], [297, 166, 4]], mid) + claw(299, 175, 20, 6) + claw(299, 166, -5, 6);
    // head details
    s += '<path d="M372 86C350 94 322 98 296 97" fill="none" stroke="#2a1812" stroke-width="2.2" stroke-linecap="round"/>';
    s += '<path d="M276 106C292 112 310 110 322 106" fill="none" stroke="#2a1812" stroke-width="1.6" opacity=".4"/>';
    s += teeth([[360, 90], [349, 92], [338, 94], [327, 95], [316, 96]], '#fff8e6', 1) + teeth([[354, 100], [342, 101], [330, 102]], '#fff8e6', -1);
    s += '<path d="M295 66C303 59 315 60 320 67" fill="none" stroke="#243d25" stroke-width="4" stroke-linecap="round"/>';
    s += eye(308, 73, 6.5, '#f2b632');
    s += '<circle cx="368" cy="78" r="2" fill="#2a1812"/>';
    if (o.crest) s += '<path d="M330 54 q6 -9 14 -2 q4 -10 14 -1 q4 -8 12 2" fill="' + dark + '" stroke="#243d25" stroke-width="1.2"/>';
    return s;
  };
  B.tyrannosaur = function (p) {
    var c = { top: '#8a4a28', mid: '#c27a44', bot: '#f0d6a4', line: '#5a2e18' };
    return '<g transform="translate(36 38) scale(.86)">' + B.trex(p + 'x', { c: c, dark: '#9a5a30', mid: '#c27a44', fuzz: true, fuzzc: '#f0b070', crest: true }) + '</g>';
  };

  /* ---------- ALLOSAURUS ---------- */
  var ALLO_D = 'M12 192C52 190 100 178 134 150C158 130 190 122 222 124C246 124 258 112 266 96C272 80 290 66 316 62C342 58 372 66 388 78C392 84 388 90 380 92C376 102 358 108 334 109C316 110 300 108 290 104C288 126 280 150 270 176C258 206 225 216 192 214C165 212 142 206 122 204C90 206 50 204 12 192Z';
  B.allosaurus = function (p) {
    var c = { top: '#7d4d2c', mid: '#c18a4c', bot: '#efd9a4', line: '#4a2d18' };
    var dark = '#9a6a3a', mid = '#c18a4c';
    var s = shadow(200, G + 2, 130);
    s += limb([[156, 172, 40], [184, 216, 30], [166, 244, 16]], dark) + foot(166, G, dark, 38);
    var extra = stripes(['M110 150 q14 30 6 56', 'M140 138 q16 34 8 70', 'M175 128 q16 36 6 80', 'M210 126 q14 34 4 74', 'M70 168 q8 14 2 24'], c.top, 9, .4) +
      '<ellipse cx="236" cy="206" rx="62" ry="22" fill="#fff6c8" opacity=".3"/>';
    s += skin(p, ALLO_D, c, extra);
    s += legN(p, [[184, 172, 48], [212, 216, 32], [192, 244, 19]], mid) + foot(192, G, mid, 40);
    // arm with 3 fingers, palms facing each other (not pronated)
    s += limb([[262, 140, 16], [282, 160, 12], [298, 166, 9]], mid) + limb([[298, 166, 6], [314, 174, 4]], mid) + limb([[298, 166, 6], [316, 166, 4]], mid) + limb([[298, 166, 5], [312, 160, 3.5]], mid) +
      claw(316, 175, 25, 7) + claw(318, 166, 0, 7) + claw(314, 159, -25, 6);
    s += '<path d="M388 82C366 92 340 98 306 98" fill="none" stroke="#2a1812" stroke-width="2.2" stroke-linecap="round"/>';
    s += teeth([[374, 91], [362, 94], [350, 96], [338, 97], [326, 97], [314, 98]], '#fff8e6', 1) + teeth([[364, 101], [350, 102], [336, 103]], '#fff8e6', -1);
    // brow horns / crests
    s += '<path d="M310 64 q4 -14 14 -10 q3 4 -2 10Z" fill="#8a5a30" stroke="#4a2d18" stroke-width="1.2"/><path d="M330 60 q6 -12 14 -6 q2 5 -4 10Z" fill="#8a5a30" stroke="#4a2d18" stroke-width="1.2"/>';
    s += '<path d="M310 70C318 66 330 68 334 74" fill="none" stroke="#4a2d18" stroke-width="3.5" stroke-linecap="round"/>';
    s += eye(322, 77, 6, '#f2c94a');
    s += '<circle cx="383" cy="80" r="2" fill="#2a1812"/>';
    return s;
  };

  /* ---------- small slender theropod (coelophysis) ---------- */
  var COELO_D = 'M10 170C50 170 90 162 118 150C140 138 180 134 215 138C240 140 252 128 262 112C270 96 285 82 305 78C322 74 345 80 362 90C366 94 362 99 355 99C340 99 322 101 310 108C302 118 296 135 288 150C278 175 255 190 225 190C195 192 170 188 150 185C110 182 55 178 10 170Z';
  B.coelophysis = function (p, o) {
    o = o || {};
    var c = o.c || { top: '#6b7f4a', mid: '#a8b46a', bot: '#f0e6b4', line: '#3a4a26' };
    var dark = o.dark || '#7e8c54', mid = o.mid || '#a8b46a';
    var s = shadow(190, G + 2, 120);
    s += limb([[146, 162, 26], [170, 202, 17], [152, 244, 9]], dark) + foot(152, G, dark, 32);
    var extra = stripes(['M90 160 q8 10 4 24', 'M120 148 q10 14 4 36', 'M150 140 q10 14 4 38', 'M184 138 q8 14 2 36', 'M50 168 q4 6 2 12'], c.top, 6, .45) +
      '<ellipse cx="225" cy="182" rx="60" ry="12" fill="#fff9d8" opacity=".35"/>';
    if (o.fuzz) extra += hairs([[8, 168], [60, 164], [110, 150], [150, 138], [200, 134], [240, 134]], 5, o.fuzzc || '#d8a060', 1.4, 9);
    s += skin(p, COELO_D, c, extra);
    s += legN(p, [[168, 160, 30], [194, 202, 18], [174, 244, 10]], mid) + foot(174, G, mid, 34);
    s += limb([[258, 148, 10], [270, 166, 7], [282, 172, 6]], mid) + limb([[282, 172, 4], [292, 178, 3]], mid) + limb([[282, 172, 4], [294, 172, 3]], mid) + claw(294, 178, 25, 5) + claw(296, 172, 0, 5);
    s += '<path d="M360 92C344 95 326 97 308 98" fill="none" stroke="#2a1812" stroke-width="1.8" stroke-linecap="round"/>';
    s += teeth([[348, 95], [338, 96], [328, 97], [318, 98]], '#fff8e6', 1);
    s += eye(322, 86, 5.5, '#f2b632');
    s += '<circle cx="354" cy="89" r="1.5" fill="#2a1812"/>';
    return s;
  };

  function fuzzFilter(p, sc) {
    return '<defs><filter id="' + p + '-fz" x="-4%" y="-6%" width="108%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".11" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="' + (sc || 6) + '" xChannelSelector="R" yChannelSelector="G"/></filter></defs>';
  }

  /* ---------- COELUROSAUR: Sinosauropteryx-like, fuzzy with ringed tail ---------- */
  var COELURO_D = 'M8 180C50 178 100 170 130 154C150 142 180 138 205 142C228 144 240 136 250 126C258 114 270 106 288 102C308 98 335 104 352 114C357 118 354 124 346 125C330 126 316 130 306 136C300 148 294 162 284 174C270 192 245 200 218 200C190 200 165 194 148 192C105 190 55 186 8 180Z';
  B.coelurosaur = function (p) {
    var c = { top: '#b5541f', mid: '#e08a3c', bot: '#fbe6bc' };
    var s = shadow(190, G + 2, 120);
    s += limb([[148, 168, 26], [172, 208, 17], [154, 244, 9]], '#c9712e') + foot(154, G, '#c9712e', 30);
    var rings = [];
    for (var i = 0; i < 9; i++) rings.push('M' + (24 + i * 15) + ' ' + (166 + i * 1.6) + ' q4 8 0 20');
    var extra = stripes(rings, '#fff0d0', 5, .85) + '<ellipse cx="232" cy="190" rx="62" ry="14" fill="#fff8e0" opacity=".7"/>' +
      hairs([[8, 178], [60, 172], [110, 160], [150, 142], [200, 138], [240, 136], [262, 118], [290, 102]], 6, '#f2a050', 1.5, 11) +
      hairs([[8, 183], [60, 188], [110, 192]], 5, '#c9712e', 1.4, 3, -1);
    s += fuzzFilter(p, 5) + '<g filter="url(#' + p + '-fz)">' + skin(p, COELURO_D, c, extra) + '</g>';
    s += legN(p, [[172, 168, 30], [196, 208, 18], [176, 244, 10]], '#e08a3c') + foot(176, G, '#e08a3c', 32);
    s += limb([[262, 150, 11], [272, 168, 8], [284, 174, 6]], '#e08a3c') + claw(288, 176, 25, 5) + claw(288, 170, -5, 5);
    s += '<path d="M354 118C338 122 322 124 308 126" fill="none" stroke="#3b2414" stroke-width="1.8" stroke-linecap="round"/>';
    s += eye(322, 112, 6.5, '#f2b632') + '<circle cx="350" cy="116" r="1.6" fill="#3b2414"/>';
    return s;
  };

  /* ---------- MANIRAPTORAN: Caudipteryx-like, wing arms + tail fan ---------- */
  B.maniraptoran = function (p) {
    var s = shadow(195, G + 2, 105);
    // far leg
    s += limb([[178, 170, 22], [200, 214, 14], [188, 246, 8]], '#a05a2c') + foot(188, G, '#a05a2c', 28);
    s += '<g transform="translate(0 -26)">';
    // tail fan behind
    var fan = '';
    for (var i = 0; i < 9; i++) fan += leaf(104, 160, 62 + (i % 2) * 8, 8, 160 + i * 9, i % 2 ? '#2f4b6e' : '#ff9d4a', '#fff');
    s += fan;
    var d = 'M104 150C112 122 160 112 205 120C242 128 262 142 262 164C262 192 230 208 190 208C150 208 100 186 104 150Z';
    s += '<defs>' + lg(p + '-b', [[0, '#a8431f'], [.5, '#e07a3a'], [1, '#fbe1b0']]) + '<clipPath id="' + p + '-cp"><path d="' + d + '"/></clipPath></defs>' + fuzzFilter(p, 6) +
      '<g filter="url(#' + p + '-fz)"><path d="' + d + '" fill="url(#' + p + '-b)"/><g clip-path="url(#' + p + '-cp)">' +
      hairs([[104, 152], [130, 126], [175, 114], [215, 122], [250, 138]], 8, '#f5a860', 1.6, 7) + '<ellipse cx="215" cy="200" rx="60" ry="16" fill="#fff4d6" opacity=".6"/></g></g>';
    // neck + head
    s += limb([[246, 140, 30], [270, 112, 20], [290, 96, 18]], '#d36a2e');
    s += '<circle cx="298" cy="92" r="19" fill="#d36a2e"/><path d="M308 90 C322 90 338 94 342 100 C340 108 322 108 308 106Z" fill="#e8c35a" stroke="#8a6a20" stroke-width="1.2"/>';
    s += '<path d="M284 76 q-2 -12 6 -14 q-1 8 6 8 q2 -8 9 -6 q-3 8 2 12" fill="#2f4b6e"/>' + eye(300, 88, 6, '#ffd24a');
    s += '<path d="M310 103 L342 101" stroke="#7a5a18" stroke-width="1.2"/>';
    s += '</g>';
    s += limb([[198, 164, 28], [222, 212, 17], [206, 246, 9]], '#c2733a') + foot(206, G, '#c2733a', 30);
    s += '<g transform="translate(0 -26)">';
    // wing: arm + feather fans
    var w = '';
    for (var k = 0; k < 7; k++) w += leaf(250, 160, 78 - k * 3, 9, 120 + k * 9, k % 2 ? '#273f5e' : '#35557c', '#8fb0d8');
    for (var k2 = 0; k2 < 5; k2++) w += leaf(244, 158, 50, 8, 130 + k2 * 10, '#e8f0ff', '#a0b8d8');
    s += w + '<path d="M240 150 L262 172" stroke="#c2733a" stroke-width="9" stroke-linecap="round"/>' + claw(262, 172, 60, 6);
    s += '</g>';
    return s;
  };

  /* ---------- VELOCIRAPTOR ---------- */
  var VELO_D = 'M12 180C60 178 105 170 132 152C152 138 185 132 212 136C236 140 248 130 256 116C262 102 274 94 290 92C308 88 335 94 360 108C364 112 358 116 350 116C334 116 322 120 312 126C306 138 300 152 290 164C276 184 250 198 222 198C194 198 168 194 150 192C108 188 56 186 12 180Z';
  B.velociraptor = function (p) {
    var c = { top: '#6b4528', mid: '#b07840', bot: '#f2dcae' };
    var s = shadow(190, G + 2, 125);
    function rf(x, col, up) {
      return limb([[x, 166, 28], [x + 22, 204, 18], [x + 6, 244, 9]], col) +
        limb([[x + 6, G - 15, 11], [x + 30, G - 7, 9], [x + 38, G - 4, 8]], col) + limb([[x + 6, G - 15, 10], [x + 24, G - 12, 7]], col) + limb([[x + 4, G - 16, 9], [x + 16, G - 26, 6]], col) +
        '<path d="M' + (x + 14) + ' ' + (G - 30) + ' Q' + (x + 40) + ' ' + (G - 34) + ' ' + (x + 38) + ' ' + (G - 10) + ' Q' + (x + 30) + ' ' + (G - 24) + ' ' + (x + 14) + ' ' + (G - 25) + 'Z" fill="#2b2118"/>' + claw(x + 42, G - 4, 8, 6);
    }
    // stiff tail feathers
    var tf = '';
    for (var i = 0; i < 10; i++) tf += leaf(30 + i * 9, 176 - i * 1.2, 36, 4, 195 + (i % 2) * 6, i % 2 ? '#3a2a1c' : '#7a5230');
    s += rf(148, '#8a5e32');
    s += tf;
    var extra = stripes(['M60 170 q6 10 2 18', 'M90 164 q6 12 2 22', 'M120 156 q6 14 2 26', 'M32 172 q4 8 0 14'], '#2e1c10', 5, .5) + '<ellipse cx="236" cy="192" rx="60" ry="12" fill="#fff6dc" opacity=".6"/>' +
      hairs([[10, 178], [70, 172], [120, 156], [160, 140], [210, 134], [244, 134]], 5, '#c98c50', 1.4, 21);
    s += skin(p, VELO_D, c, extra);
    // wing (arm + primaries)
    var w = '';
    for (var k = 0; k < 7; k++) w += leaf(240, 148, 72 - k * 3, 8, 118 + k * 9, k % 2 ? '#3a2a1c' : '#4a3422', '#d9c3a0');
    for (var k2 = 0; k2 < 5; k2++) w += leaf(236, 146, 44, 7, 128 + k2 * 11, '#f4ead8', '#b8a080');
    s += w + '<path d="M236 142 L256 162" stroke="#b07840" stroke-width="8" stroke-linecap="round"/>' + claw(258, 164, 50, 6);
    s += rf(176, '#b07840');
    // head
    s += '<path d="M358 108C342 112 326 114 312 117" fill="none" stroke="#2a1812" stroke-width="1.8" stroke-linecap="round"/>' + teeth([[346, 112], [336, 114], [326, 115], [318, 116]], '#fff8e6', 1);
    s += '<path d="M290 98 q10 -12 24 -4" fill="none" stroke="#4a3018" stroke-width="3.5" stroke-linecap="round"/>' + eye(308, 103, 6, '#e8a828');
    s += '<circle cx="355" cy="104" r="1.6" fill="#2a1812"/>';
    s += '<path d="M262 106 q-8 -14 2 -20 q2 8 8 8 q2 -8 10 -8 q-4 8 -2 16" fill="#4a3018"/>';
    return s;
  };

  /* ---------- MICRORAPTOR (four-winged glider) ---------- */
  B.microraptor = function (p) {
    var s = shadow(200, G + 2, 90, .1);
    s += '<defs>' + lg(p + '-w', [[0, '#2a4a7a'], [.55, '#1b2d52'], [1, '#2a7a82']], 0, 0, 1, 1) + lg(p + '-w2', [[0, '#16233f'], [1, '#243d66']], 0, 0, 1, 1) + lg(p + '-b', [[0, '#1d2e52'], [.6, '#2e4c80'], [1, '#6a7a96']]) + '</defs>';
    function fan(x, y, n, len, a0, a1, w, fill, shaft) { var o = ''; for (var i = 0; i < n; i++) { var t = i / (n - 1); o += leaf(x, y, f1(len * (1 - .18 * Math.abs(t - .45))), w, f1(a0 + (a1 - a0) * t), fill, shaft); } return o; }
    // far wings (raised behind, darker, shorter)
    s += fan(234, 150, 13, 92, 200, 262, 8, 'url(#' + p + '-w2)', '#4a6a9a') + fan(176, 158, 11, 74, 205, 262, 7, 'url(#' + p + '-w2)', '#4a6a9a');
    // tail with diamond fan
    s += limb([[150, 172, 14], [100, 190, 8], [66, 200, 5]], '#1d2e52');
    s += fan(68, 200, 11, 76, 150, 216, 9, 'url(#' + p + '-w)', '#7aa8d8');
    // hindwing from thigh (below, behind body)
    s += fan(184, 188, 14, 98, 96, 156, 8, 'url(#' + p + '-w)', '#7aa8d8');
    s += limb([[192, 190, 20], [206, 214, 11], [228, 224, 8]], '#243a64') + claw(232, 226, 20, 6, '#111');
    // body
    s += '<path d="M130 174C140 148 190 140 236 148C262 154 276 166 268 182C256 202 200 212 160 202C140 196 128 186 130 174Z" fill="url(#' + p + '-b)"/>' +
      hairs([[134, 166], [160, 148], [200, 141], [240, 148]], 6, '#3e5f95', 1.5, 31) + '<path d="M170 196C200 206 240 200 262 184" stroke="#8a9ab8" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>';
    s += limb([[258, 158, 24], [278, 146, 18]], '#243a64');
    s += '<circle cx="288" cy="140" r="17" fill="#243a64"/><path d="M298 138C312 136 324 140 328 146C322 152 308 152 298 150Z" fill="#243a64"/>';
    s += '<path d="M300 148 L326 146" stroke="#0e1626" stroke-width="1.4"/>' + teeth([[312, 147], [320, 146]], '#fff', 1) + eye(294, 136, 6, '#f2c04a');
    s += '<path d="M276 126 q2 -14 12 -16 q-2 8 4 10 q4 -8 12 -6 q-4 6 -2 12" fill="#2f4f86"/>';
    // near forewing, spread downward and back
    s += fan(246, 166, 17, 118, 96, 170, 9, 'url(#' + p + '-w)', '#9bc0ee');
    s += fan(244, 166, 10, 66, 106, 166, 8, '#4f78b0', '#bcd6f4');
    s += '<path d="M240 160 L268 176" stroke="#243a64" stroke-width="10" stroke-linecap="round"/>' + claw(270, 177, 40, 6, '#111');
    return s;
  };

  /* ---------- ARCHAEOPTERYX ---------- */
  B.archaeopteryx = function (p) {
    var s = '<defs>' + lg(p + '-b', [[0, '#2b2f3a'], [.5, '#4a4640'], [1, '#b9a98a']]) + lg(p + '-rk', [[0, '#9a9aa4'], [1, '#6a6a78']]) + '</defs>';
    s += '<path d="M110 244C130 228 270 226 308 238C316 250 296 258 260 258L150 258C118 258 104 252 110 244Z" fill="url(#' + p + '-rk)"/><ellipse cx="210" cy="240" rx="80" ry="6" fill="#fff" opacity=".2"/>';
    // bony tail with feathers
    var t = '';
    var pts = [[138, 178], [112, 188], [86, 198], [62, 206], [40, 212]];
    for (var i = 0; i < pts.length; i++) {
      t += leaf(pts[i][0], pts[i][1], 46 - i * 3, 7, 228 - i * 4, i % 2 ? '#3a3a44' : '#555563', '#aaa') + leaf(pts[i][0], pts[i][1], 46 - i * 3, 7, 160 + i * 3, i % 2 ? '#555563' : '#3a3a44', '#aaa');
    }
    s += t + limb([[140, 176, 16], [112, 188, 10], [86, 198, 8], [60, 207, 6], [36, 213, 4]], '#3a3a44');
    // far leg
    s += limb([[205, 190, 18], [226, 216, 10], [220, 238, 7]], '#7a6a52');
    s += limb([[220, 238, 7], [246, 242, 6]], '#7a6a52') + limb([[220, 238, 7], [240, 236, 5]], '#7a6a52');
    // body
    var bd = 'M128 164C150 132 210 122 252 136C278 146 284 168 264 192C240 214 190 216 160 198C140 188 124 174 128 164Z';
    s += '<path d="' + bd + '" fill="url(#' + p + '-b)"/>';
    s += '<path d="M168 200C200 214 244 206 262 188" fill="none" stroke="#d8c8a8" stroke-width="6" opacity=".5" stroke-linecap="round"/>';
    // leg feathers
    s += leaf(190, 196, 40, 9, 100, '#3e3c46', '#999') + leaf(200, 198, 36, 8, 92, '#4a4852', '#999');
    // near leg
    s += limb([[212, 194, 22], [236, 220, 12], [230, 240, 8]], '#8a7a60');
    s += limb([[230, 240, 8], [260, 245, 7]], '#8a7a60') + limb([[230, 240, 8], [254, 238, 6]], '#8a7a60') + limb([[230, 240, 8], [216, 246, 6]], '#8a7a60') + claw(263, 246, 8, 6) + claw(257, 238, 20, 6);
    // neck, head
    s += limb([[262, 150, 26], [284, 126, 20]], '#4a4640');
    s += '<circle cx="292" cy="114" r="18" fill="#4a4640"/>';
    s += '<path d="M303 108 C322 106 338 110 342 116 C338 122 318 122 304 122Z" fill="#6a6258"/><path d="M304 118 L340 116" stroke="#1a1612" stroke-width="1.3"/>' + teeth([[316, 118], [324, 117], [332, 116]], '#fffbe8', 1) + teeth([[318, 118], [328, 117]], '#fffbe8', -1);
    s += eye(296, 110, 6, '#e8a828') + '<circle cx="334" cy="112" r="1.4" fill="#111"/>';
    s += '<path d="M278 98 q2 -10 10 -10 q-2 6 4 8 q4 -6 10 -4 q-4 6 -2 10" fill="#3a3a44"/>';
    // wing
    var w = '';
    for (var k = 0; k < 8; k++) w += leaf(240, 146, 118 - k * 4, 12, 166 + k * 7, k % 2 ? '#2f2f3a' : '#3d3d4a', '#b0a898');
    for (var k2 = 0; k2 < 6; k2++) w += leaf(236, 148, 72, 10, 170 + k2 * 9, '#59596a', '#c0b8a8');
    s += w + '<path d="M232 156 L258 130 L270 120" stroke="#4a4640" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" fill="none"/>' +
      claw(272, 118, -35, 7) + claw(268, 126, -5, 6) + claw(262, 132, 15, 6);
    return s;
  };

  /* ---------- AVIALAN: Confuciusornis-like, perched ---------- */
  B.avialan = function (p) {
    var s = '<defs>' + lg(p + '-b', [[0, '#5a4a3a'], [.6, '#8a7458'], [1, '#e6d4aa']]) + '</defs>';
    s += '<path d="M60 236C140 226 280 226 350 238C355 242 350 246 340 246L70 246C58 246 54 240 60 236Z" fill="#6b4a2a"/><path d="M60 236C140 226 280 226 350 238" fill="none" stroke="#9a7a4a" stroke-width="3"/>';
    s += '<path d="M310 238 q20 -30 40 -22 q-14 6 -22 22Z" fill="#5f9a4a"/><path d="M96 234 q-10 -26 -34 -26 q14 8 20 26Z" fill="#6aa856"/>';
    // streamers
    s += '<path d="M148 186C110 204 80 228 22 236C70 244 120 232 158 200Z" fill="#6b5a44"/><path d="M152 184C130 190 100 196 40 190C90 210 130 206 160 194Z" fill="#8a7458"/>';
    s += '<path d="M148 186C110 204 80 228 22 236" fill="none" stroke="#3a2e22" stroke-width="1.4" opacity=".6"/>';
    var bd = 'M136 168C154 136 214 126 254 140C280 150 286 172 266 194C242 214 192 216 164 200C144 190 130 178 136 168Z';
    s += '<path d="' + bd + '" fill="url(#' + p + '-b)"/>';
    s += limb([[202, 198, 18], [212, 224, 10], [206, 236, 7]], '#c8a050') + limb([[206, 236, 7], [226, 240, 5]], '#c8a050') + limb([[206, 236, 7], [192, 240, 5]], '#c8a050');
    s += limb([[230, 200, 18], [238, 226, 10], [232, 238, 7]], '#d8b060') + limb([[232, 238, 7], [252, 242, 5]], '#d8b060') + limb([[232, 238, 7], [218, 242, 5]], '#d8b060') + claw(255, 242, 10, 5) + claw(213, 243, 170, 5);
    s += limb([[264, 156, 26], [282, 130, 20]], '#6a5a44') + '<circle cx="290" cy="118" r="18" fill="#7a644a"/>';
    s += '<path d="M303 112C322 110 334 116 336 122C326 128 312 126 303 126Z" fill="#e8dcb8" stroke="#8a7a50" stroke-width="1.2"/><path d="M304 122 L332 121" stroke="#5a4a2a" stroke-width="1.2"/>';
    s += '<path d="M276 104 q2 -14 14 -14 q4 10 -2 14Z" fill="#b8643a"/>' + eye(294, 113, 6, '#f2c04a');
    // wing folded with feathers back
    var w = '';
    for (var k = 0; k < 7; k++) w += leaf(236, 152, 92 - k * 4, 11, 168 + k * 6, k % 2 ? '#3d3226' : '#5a4a38', '#b8a888');
    for (var k2 = 0; k2 < 5; k2++) w += leaf(230, 156, 54, 9, 172 + k2 * 9, '#8a7458', '#d8c8a0');
    s += w + '<path d="M232 158 L256 140" stroke="#6a5a44" stroke-width="9" stroke-linecap="round"/>' + claw(258, 138, -30, 7);
    return s;
  };

  function spots(seed, n, x0, y0, x1, y1, rmin, rmax, col, op) {
    var r = rng(seed), s = '';
    for (var i = 0; i < n; i++) s += '<circle cx="' + f1(x0 + r() * (x1 - x0)) + '" cy="' + f1(y0 + r() * (y1 - y0)) + '" r="' + f1(rmin + r() * (rmax - rmin)) + '"/>';
    return '<g fill="' + col + '" opacity="' + (op || .25) + '">' + s + '</g>';
  }
  function hoofs(x, g, w, col) { // three round toenails on a column foot
    return '<ellipse cx="' + x + '" cy="' + (g - 5) + '" rx="' + w + '" ry="9" fill="' + col + '"/>' +
      [-.6, 0, .6].map(function (k) { return '<ellipse cx="' + f1(x + k * w * .85) + '" cy="' + (g - 3) + '" rx="3.6" ry="4.6" fill="#f0e2c4" stroke="#6a5a40" stroke-width=".8"/>'; }).join('');
  }

  /* ---------- STEGOSAURUS ---------- */
  var STEGO_D = 'M18 178C50 172 90 155 112 128C135 98 180 92 210 105C235 115 255 135 280 150C300 160 320 175 345 184C362 188 372 196 366 204C355 212 335 210 318 204C300 205 290 215 275 220C255 232 225 232 190 228C160 228 140 222 125 205C108 185 70 186 18 178Z';
  B.stegosaurus = function (p) {
    var c = { top: '#5a7a3c', mid: '#8fae5a', bot: '#dfe6a6', line: '#2f4620' };
    var s = shadow(195, G + 2, 150);
    var plates = [[130, 116, 30, 40, -30], [154, 102, 38, 56, -18], [182, 97, 42, 66, -6], [210, 105, 40, 62, 8], [236, 119, 36, 54, 20], [259, 138, 30, 42, 32]];
    s += '<defs>' + lg(p + '-pl', [[0, '#e8512e'], [.6, '#f08a3c'], [1, '#ffcc66']]) + '</defs>';
    // spikes (thagomizer)
    function spike(x, y, tx, ty) { return '<path d="M' + (x - 7) + ' ' + (y + 2) + ' L' + tx + ' ' + ty + ' L' + (x + 7) + ' ' + (y + 2) + 'Z" fill="#efe2c0" stroke="#8a7a5a" stroke-width="1.2" stroke-linejoin="round"/>'; }
    s += spike(66, 155, 60, 118) + spike(44, 166, 30, 130) + '<path d="M22 174 L-2 168 L14 184Z" fill="#efe2c0" stroke="#8a7a5a" stroke-width="1.2"/>';
    plates.forEach(function (q) {
      s += '<g transform="translate(' + q[0] + ' ' + q[1] + ') rotate(' + q[4] + ')"><path d="M' + (-q[2] / 2) + ' 6 Q' + (-q[2] / 2 - 3) + ' ' + (-q[3] * .7) + ' ' + (-q[2] * .1) + ' ' + (-q[3]) + ' Q' + (q[2] / 2 + 3) + ' ' + (-q[3] * .85) + ' ' + (q[2] / 2) + ' 6Z" fill="url(#' + p + '-pl)" stroke="#a8321a" stroke-width="1.6" stroke-linejoin="round"/>' +
        '<path d="M-6 -4 Q-8 ' + (-q[3] * .5) + ' -2 ' + (-q[3] * .8) + ' M6 -4 Q8 ' + (-q[3] * .5) + ' 3 ' + (-q[3] * .75) + '" fill="none" stroke="#fff" stroke-width="1.6" opacity=".4" stroke-linecap="round"/></g>';
    });
    // far legs
    s += limb([[176, 192, 44], [180, 232, 32], [182, 248, 26]], '#6c8a46') + hoofs(184, G, 18, '#6c8a46');
    s += limb([[244, 204, 28], [246, 236, 22], [248, 248, 20]], '#6c8a46') + hoofs(250, G, 13, '#6c8a46');
    var extra = spots(5, 40, 40, 100, 330, 230, 2, 6, c.top, .25) + stripes(['M120 130 q14 30 8 70', 'M170 100 q14 30 6 100', 'M220 112 q14 30 6 100'], c.top, 8, .22) + '<ellipse cx="230" cy="226" rx="90" ry="16" fill="#fff9c8" opacity=".35"/>';
    s += skin(p, STEGO_D, c, extra);
    s += limb([[146, 190, 54], [152, 232, 38], [156, 248, 30]], '#8fae5a') + hoofs(160, G, 20, '#8fae5a');
    s += limb([[266, 202, 32], [270, 236, 26], [272, 248, 22]], '#8fae5a') + hoofs(274, G, 14, '#8fae5a');
    s += '<ellipse cx="148" cy="192" rx="20" ry="16" fill="#fff" opacity=".08"/>';
    s += '<path d="M366 204C352 206 340 202 330 198" fill="none" stroke="#2a3a18" stroke-width="2" stroke-linecap="round"/>' + eye(350, 194, 5, '#f2c94a') +
      '<circle cx="364" cy="192" r="1.6" fill="#2a3a18"/>';
    return s;
  };

  /* ---------- TRICERATOPS ---------- */
  B.triceratops = function (p) {
    var c = { top: '#7a7a4a', mid: '#b3a86a', bot: '#ebdfae', line: '#4a4a28' };
    var s = shadow(200, G + 2, 150);
    s += '<defs>' + lg(p + '-fr', [[0, '#e8683a'], [1, '#f6b05a']], 0, 1, 0, 0) + '</defs>';
    // frill
    var frill = '';
    for (var a = 196; a <= 344; a += 12) {
      var rad = a * Math.PI / 180;
      frill += '<circle cx="' + f1(300 + Math.cos(rad) * 54) + '" cy="' + f1(116 + Math.sin(rad) * 62) + '" r="6.5" fill="#f4e3b8" stroke="#a8502a" stroke-width="1.2"/>';
    }
    s += '<path d="M264 150C240 100 260 50 306 54C350 58 366 100 350 150Z" fill="url(#' + p + '-fr)" stroke="#a8502a" stroke-width="2"/>' + frill +
      '<g fill="#f4e3b8" opacity=".75">' + [[286, 88, 7], [312, 80, 7], [336, 96, 6], [276, 118, 6], [304, 108, 7], [330, 124, 6]].map(function (q) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="' + q[2] + '"/>'; }).join('') + '</g>';
    // far legs
    s += limb([[178, 210, 42], [178, 236, 32], [180, 248, 28]], '#8c8250') + hoofs(182, G, 17, '#8c8250');
    s += limb([[270, 208, 36], [276, 238, 28]], '#8c8250') + hoofs(280, G, 13, '#8c8250');
    var body = 'M18 208C55 198 85 168 118 145C150 122 215 116 262 126C290 132 300 160 296 195C294 220 270 232 245 232C215 234 200 228 180 230C150 232 135 228 120 215C90 205 50 214 18 208Z';
    s += skin(p, body, c, spots(8, 40, 40, 120, 290, 220, 2, 6, c.top, .22) + stripes(['M110 150 q14 30 8 70', 'M160 128 q14 34 8 90', 'M210 122 q14 34 8 90'], c.top, 9, .22) + '<ellipse cx="230" cy="228" rx="80" ry="14" fill="#fff9c8" opacity=".3"/>');
    s += limb([[146, 208, 54], [150, 236, 38], [152, 248, 32]], '#b3a86a') + hoofs(156, G, 20, '#b3a86a');
    s += limb([[258, 204, 42], [264, 236, 32], [266, 248, 28]], '#b3a86a') + hoofs(270, G, 16, '#b3a86a');
    // head
    var head = 'M278 128C306 104 348 110 368 140C378 158 392 176 392 196C390 210 372 212 362 204C346 216 312 224 286 210Z';
    s += '<path d="' + head + '" fill="#b3a86a" stroke="#4a4a28" stroke-width="2" opacity="1"/>' +
      '<path d="M282 190C310 200 340 196 362 192" fill="none" stroke="#fff6c8" stroke-width="10" opacity=".25" stroke-linecap="round"/>';
    s += '<path d="M372 176C388 178 398 190 392 206C382 208 372 200 366 192Z" fill="#efe0b0" stroke="#8a7a40" stroke-width="1.4"/>' +
      '<path d="M368 194 C354 200 340 200 326 196" fill="none" stroke="#2a2a14" stroke-width="2" stroke-linecap="round"/>';
    // horns
    s += '<path d="M326 124 L396 104 L350 148Z" fill="#f4ead0" stroke="#8a7a50" stroke-width="1.6" stroke-linejoin="round"/>' +
      '<path d="M368 160 L388 142 L388 174Z" fill="#f4ead0" stroke="#8a7a50" stroke-width="1.6" stroke-linejoin="round"/>';
    s += '<path d="M324 138 q14 -8 26 0" fill="none" stroke="#4a4a28" stroke-width="4" stroke-linecap="round"/>' + eye(338, 148, 6.5, '#e89a30') + '<circle cx="380" cy="184" r="2" fill="#2a2a14"/>';
    return s;
  };

  /* ---------- ANKYLOSAURUS ---------- */
  B.ankylosaurus = function (p) {
    var c = { top: '#5a4a38', mid: '#8a7054', bot: '#cdb890', line: '#33281c' };
    var s = shadow(205, G + 2, 160);
    var inner = '';
    // tail handle + club
    inner += limb([[86, 200, 38], [60, 200, 26], [46, 198, 22]], '#7a6248');
    inner += '<defs>' + rgr(p + '-cl', [[0, '#e6d6a6'], [1, '#9a8458']], .35, .3, .8) + '</defs><ellipse cx="34" cy="198" rx="30" ry="24" fill="url(#' + p + '-cl)" stroke="#4a3a24" stroke-width="2"/>' +
      '<path d="M16 186 q8 -4 10 6 M34 178 q8 4 4 14 M46 190 q6 6 0 12" fill="none" stroke="#6a5634" stroke-width="2" stroke-linecap="round" opacity=".6"/>' +
      '<path d="M2 196 L-6 196 L2 206Z M20 220 L18 232 L30 224Z" fill="#efe2c0" stroke="#6a5634" stroke-width="1.2"/>';
    var side = ''; for (var i = 0; i < 6; i++) side += '<path d="M' + (96 + i * 36) + ' ' + (122 + Math.pow((i - 2.6) / 3, 2) * 40) + ' l-8 -16 l16 2Z" fill="#efe2c0" stroke="#6a5634" stroke-width="1.2" stroke-linejoin="round"/>';
    // far legs
    inner += limb([[120, 214, 32], [122, 240, 26]], '#6a5440') + hoofs(124, G, 14, '#6a5440') + limb([[280, 214, 32], [284, 240, 26]], '#6a5440') + hoofs(288, G, 14, '#6a5440');
    var d = 'M55 210C55 150 120 118 200 118C265 118 315 135 335 165C350 160 378 170 385 190C388 205 365 212 340 208C320 222 290 232 250 232C200 236 120 236 55 210Z';
    var arm = '';
    for (var r = 0; r < 3; r++) for (var x = 70 + (r % 2) * 14; x < 340; x += 28) {
      var yy = 126 + Math.pow((x - 200) / 140, 2) * 46 + r * 20;
      arm += '<ellipse cx="' + x + '" cy="' + f1(yy) + '" rx="12" ry="8" fill="url(#' + p + '-os)" stroke="#33281c" stroke-width="1.2"/>';
    }
    inner += side;
    inner += skin(p, d, c, '<defs>' + lg(p + '-os', [[0, '#b59a70'], [1, '#6a5438']]) + '</defs>' + arm + '<ellipse cx="220" cy="232" rx="90" ry="12" fill="#fff4c8" opacity=".25"/>');
    inner += limb([[100, 216, 40], [102, 240, 30]], '#8a7054') + hoofs(104, G, 17, '#8a7054') + limb([[300, 216, 40], [304, 240, 30]], '#8a7054') + hoofs(308, G, 17, '#8a7054');
    inner += '<path d="M385 192C372 200 356 200 342 198" fill="none" stroke="#33281c" stroke-width="2" stroke-linecap="round"/>' + eye(358, 180, 5.5, '#e8a838') + '<circle cx="379" cy="186" r="1.8" fill="#33281c"/>' +
      '<path d="M340 168 L346 150 L356 170Z M326 160 L328 144 L338 162Z" fill="#efe2c0" stroke="#6a5634" stroke-width="1.2"/>';
    return s + '<g transform="translate(18 6) scale(.93)">' + inner + '</g>';
  };

  /* ---------- PARASAUROLOPHUS ---------- */
  B.parasaurolophus = function (p) {
    var c = { top: '#2f7a6e', mid: '#5fb08a', bot: '#d8ecb8', line: '#1e4a42' };
    var s = shadow(190, G + 2, 135);
    function leg(x, col) { return limb([[x, 190, 46], [x + 26, 228, 32], [x + 8, 246, 18]], col) + limb([[x + 8, G - 12, 16], [x + 24, G - 6, 11], [x + 38, G - 5, 9]], col) + limb([[x + 8, G - 14, 12], [x + 20, G - 14, 8]], col) + '<ellipse cx="' + (x + 40) + '" cy="' + (G - 5) + '" rx="5" ry="4" fill="#3a3028"/>'; }
    s += leg(138, '#3f8c78');
    s += limb([[262, 172, 15], [274, 206, 11], [280, 226, 12]], '#3f8c78');
    var d = 'M15 192C60 187 110 167 140 142C165 120 205 114 235 120C255 124 268 120 278 107C280 90 300 78 330 72C352 70 375 80 378 90C380 98 370 102 360 100C340 104 320 112 300 112C292 135 290 160 285 185C270 215 240 222 205 220C170 218 150 215 135 205C100 200 55 207 15 192Z';
    s += skin(p, d, c, stripes(['M60 180 q10 -10 4 -22', 'M110 160 q10 -10 6 -26', 'M150 140 q12 -4 12 -24', 'M190 126 q10 4 14 -12', 'M225 124 q10 6 18 -8'], c.top, 8, .45) + '<ellipse cx="220" cy="214" rx="70" ry="12" fill="#fff9c8" opacity=".35"/>');
    s += leg(166, '#5fb08a') + '<ellipse cx="190" cy="196" rx="20" ry="14" fill="#fff" opacity=".07"/>';
    s += limb([[260, 168, 17], [274, 204, 12], [284, 224, 13]], '#5fb08a') + '<ellipse cx="288" cy="228" rx="9" ry="6" fill="#5fb08a"/>';
    // crest tube
    s += '<path d="M356 76C346 38 282 30 214 68C208 80 218 90 232 84C276 62 312 66 322 92C336 96 350 90 356 76Z" fill="#e4553a" stroke="#7a2e22" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M346 66C330 44 284 42 232 68" fill="none" stroke="#ffb090" stroke-width="3" stroke-linecap="round" opacity=".6"/>' +
      '<path d="M340 78C300 58 262 66 232 80" fill="none" stroke="#a83a24" stroke-width="2" stroke-linecap="round" opacity=".5"/>' +
      [[330, 52, 326, 64], [310, 44, 306, 58], [288, 42, 286, 58], [266, 46, 266, 62], [244, 54, 246, 68]].map(function (q) { return '<path d="M' + q[0] + ' ' + q[1] + 'L' + q[2] + ' ' + q[3] + '" stroke="#7a2e22" stroke-width="2.2" opacity=".5"/>'; }).join('');
    s += '<path d="M376 92C354 96 332 100 312 102" fill="none" stroke="#1e3a2e" stroke-width="2" stroke-linecap="round"/>' + eye(314, 88, 6, '#f2c94a') + '<circle cx="369" cy="86" r="2" fill="#1e3a2e"/>' +
      '<path d="M304 82 q8 -8 18 -2" fill="none" stroke="#1e4a42" stroke-width="3.5" stroke-linecap="round"/>';
    return s;
  };

  /* ---------- SAUROPODS ---------- */
  function sauro(p, o) {
    var hx = o.hx, hy = o.hy, sg = o.sag === undefined ? 36 : o.sag, c = o.c;
    var d = 'M22 214C60 210 110 192 140 162C165 140 195 128 225 120C' + (225 + 45) + ' ' + (110) + ' ' + (hx - 46) + ' ' + (hy + 12 + sg) + ' ' + (hx - 8) + ' ' + (hy + 12) +
      'C' + (hx - 2) + ' ' + (hy - 2) + ' ' + (hx + 16) + ' ' + (hy - 6) + ' ' + (hx + 30) + ' ' + (hy + 4) + 'C' + (hx + 40) + ' ' + (hy + 12) + ' ' + (hx + 38) + ' ' + (hy + 22) + ' ' + (hx + 28) + ' ' + (hy + 25) +
      'C' + (hx + 16) + ' ' + (hy + 28) + ' ' + (hx + 8) + ' ' + (hy + 30) + ' ' + (hx - 2) + ' ' + (hy + 32) + 'C' + (hx - 30) + ' ' + (hy + 32 + sg * 1.3) + ' 290 150 274 188C260 216 228 226 198 224C168 224 152 222 136 215C110 217 60 222 22 216Z';
    var s = shadow(190, G + 2, 150);
    s += limb([[196, 214, 40], [198, 238, 32], [199, 248, 28]], o.dark) + hoofs(200, G, 17, o.dark);
    s += limb([[270, 212, 34], [272, 238, 28], [274, 248, 24]], o.dark) + hoofs(276, G, 14, o.dark);
    var ex = spots(o.seed, 50, 30, 110, 340, 230, 2, 6, c.top, .22) + stripes(o.stripes || [], c.top, 8, .22) + '<ellipse cx="215" cy="222" rx="70" ry="10" fill="#fff9c8" opacity=".35"/>';
    s += skin(p, d, c, ex);
    s += limb([[148, 212, 50], [150, 238, 38], [152, 248, 32]], o.mid) + hoofs(156, G, 20, o.mid);
    s += limb([[250, 206, 40], [254, 238, 32], [256, 248, 28]], o.mid) + hoofs(260, G, 16, o.mid);
    s += '<ellipse cx="156" cy="196" rx="18" ry="14" fill="#fff" opacity=".08"/>';
    s += '<path d="M' + (hx + 34) + ' ' + (hy + 17) + 'C' + (hx + 20) + ' ' + (hy + 24) + ' ' + (hx + 8) + ' ' + (hy + 24) + ' ' + (hx + 2) + ' ' + (hy + 24) + '" fill="none" stroke="#2a2014" stroke-width="1.8" stroke-linecap="round"/>';
    s += eye(hx + 14, hy + 8, 5.5, '#f2c94a') + '<circle cx="' + (hx + 30) + '" cy="' + (hy + 7) + '" r="1.8" fill="#2a2014"/>';
    return s;
  }
  B.brachiosaurus = function (p) {
    return sauro(p, { hx: 318, hy: 34, sag: 36, c: { top: '#3f7f85', mid: '#74b0a8', bot: '#e4efc0', line: '#25505a' }, mid: '#74b0a8', dark: '#4f8f92', seed: 3, stripes: ['M150 150 q12 30 6 66', 'M190 130 q12 34 6 84', 'M270 90 q10 8 4 24'] });
  };
  B.argentinosaurus = function (p) {
    return sauro(p, { hx: 346, hy: 92, sag: 8, c: { top: '#6a5a3a', mid: '#a8905a', bot: '#ecdcaa', line: '#44381e' }, mid: '#a8905a', dark: '#7e6a40', seed: 11, stripes: ['M150 150 q12 30 6 66', 'M190 130 q12 34 6 84', 'M100 180 q8 14 2 26'] });
  };

  /* ---------- PLATEOSAURUS ---------- */
  var PLATEO_D = 'M12 212C55 205 100 188 128 160C150 138 190 130 225 132C250 134 262 125 272 105C282 85 300 70 318 62C332 54 352 58 360 66C366 72 362 80 352 82C338 84 330 90 325 100C320 118 306 138 300 160C292 190 262 212 225 214C195 216 170 212 150 210C105 210 55 218 12 212Z';
  B.plateosaurus = function (p) {
    var c = { top: '#7a6a3a', mid: '#b8a460', bot: '#f0e4b0', line: '#4a3e20' };
    var s = shadow(190, G + 2, 135);
    s += limb([[150, 166, 40], [178, 212, 26], [160, 246, 14]], '#8f7e48') + foot(160, G, '#8f7e48', 34);
    s += '<g transform="translate(0 -24)">';
    s += skin(p, PLATEO_D, c, stripes(['M80 195 q10 -10 6 -26', 'M120 180 q10 -14 6 -32', 'M170 150 q12 0 8 -16', 'M215 140 q12 6 12 -12', 'M300 110 q-8 -6 -4 -18'], c.top, 7, .4) + spots(2, 30, 30, 130, 300, 210, 2, 5, c.top, .2) + '<ellipse cx="235" cy="206" rx="64" ry="12" fill="#fff9c8" opacity=".35"/>');
    s += '</g>';
    s += legN(p, [[180, 166, 46], [208, 212, 28], [188, 246, 16]], '#b8a460') + foot(188, G, '#b8a460', 38);
    s += '<g transform="translate(0 -24)">';
    s += limb([[268, 146, 15], [284, 166, 11], [296, 176, 9]], '#b8a460') + limb([[296, 176, 6], [308, 184, 4]], '#b8a460') + limb([[296, 176, 6], [310, 177, 4]], '#b8a460') + limb([[296, 176, 5], [307, 170, 4]], '#b8a460') + claw(309, 185, 25, 6) + claw(312, 177, 0, 6) + claw(309, 169, -30, 7);
    s += '<path d="M360 74C348 79 334 80 324 78" fill="none" stroke="#3a2e18" stroke-width="2" stroke-linecap="round"/>' + eye(336, 66, 5.5, '#f2c94a') + '<circle cx="357" cy="68" r="1.6" fill="#3a2e18"/>' +
      teeth([[350, 78], [343, 79], [336, 79]], '#fff8e6', -1);
    s += '</g>';
    return s;
  };

  /* ============================ BIRDS ============================ */
  function bfoot(x, g, col, len, w, nail) { // bird foot seen from the side
    len = len || 26; w = w || 5;
    return limb([[x, g - 6, w + 1], [x + len, g - 2, w - 1]], col) + limb([[x, g - 6, w], [x + len * .75, g - 9, w - 1.5]], col) + limb([[x, g - 5, w], [x - len * .5, g - 3, w - 1]], col) +
      '<circle cx="' + (x + len) + '" cy="' + (g - 2) + '" r="' + (w * .5) + '" fill="' + (nail || '#3a2e24') + '"/>';
  }

  /* ---------- CHICKEN (rooster) ---------- */
  B.chicken = function (p) {
    var s = shadow(200, G + 2, 105);
    s += '<defs>' + lg(p + '-b', [[0, '#a8431a'], [.5, '#d9772c'], [1, '#f2b84c']]) + lg(p + '-t', [[0, '#0e3a2e'], [.5, '#1f8a6a'], [1, '#6cc4a4']], 0, 0, 1, 1) + lg(p + '-h', [[0, '#e8921c'], [1, '#ffd958']]) + lg(p + '-w', [[0, '#7a2e14'], [1, '#c0561f']]) + '</defs>';
    // tail sickles
    var tl = '';
    [[232, 70, 15], [238, 82, 13], [246, 92, 12], [226, 78, 12], [252, 70, 11]].forEach(function (q, i) { tl += leaf(112, 148, q[1] + 20, q[2], q[0] + 0, i % 2 ? '#0f3a2c' : 'url(#' + p + '-t)', '#9be0c0'); });
    tl += leaf(112, 150, 70, 12, 262, '#b8501a', '#ffd070') + leaf(112, 150, 80, 12, 250, '#7a2e14', '#ffb060');
    s += tl;
    // far leg
    s += limb([[214, 206, 12], [216, 236, 9], [218, 250, 8]], '#d89a2a') + bfoot(218, G, '#d89a2a', 26, 6);
    var d = 'M100 150C110 118 160 108 195 116C225 120 240 112 250 92C256 80 262 76 268 78C275 105 280 125 262 160C250 190 220 214 180 214C140 214 112 190 100 150Z';
    s += '<path d="' + d + '" fill="url(#' + p + '-b)"/>';
    // breast + hackle feathers
    var h = '';
    for (var i = 0; i < 9; i++) h += leaf(252 - i * 3, 86 + i * 4, 38, 8, 100 + i * 7, i % 2 ? '#f0a020' : '#ffcf48', '#b86a10');
    s += h;
    s += '<path d="M262 118C276 130 268 164 250 186C238 198 222 206 206 210C240 176 256 150 262 118Z" fill="#7a2e14" opacity=".35"/>';
    // wing
    var w = '';
    for (var k = 0; k < 7; k++) w += leaf(206, 140 + k * 5, 78 - k * 3, 12, 160 - k * 4, k % 2 ? '#8a3716' : '#a8431a', '#ffcf80');
    s += '<path d="M200 140C170 132 140 150 146 184C160 196 200 190 220 170C226 156 216 142 200 140Z" fill="url(#' + p + '-w)" stroke="#5a200c" stroke-width="1.4"/>';
    s += '<path d="M200 142C176 138 152 154 152 182" fill="none" stroke="#ffcf80" stroke-width="1.6" opacity=".5"/>';
    for (var j = 0; j < 4; j++) s += leaf(202 - j * 4, 150 + j * 9, 52 - j * 3, 8, 170 + j * 2, j % 2 ? '#7a2e14' : '#963a18', '#e8a060');
    // head
    s += '<circle cx="282" cy="76" r="21" fill="#e2802a"/><circle cx="282" cy="76" r="21" fill="url(#' + p + '-h)" opacity=".5"/>';
    s += '<ellipse cx="280" cy="84" rx="10" ry="8" fill="#f4f0e0"/>';
    s += '<path d="M296 70 L326 80 L297 88Z" fill="#f2a830" stroke="#b46a10" stroke-width="1.5" stroke-linejoin="round"/><path d="M298 78 L322 80" stroke="#b46a10" stroke-width="1.2"/>';
    s += '<path d="M300 90 C310 96 308 110 298 108 C292 104 292 96 296 90Z" fill="#e0221c" stroke="#a01010" stroke-width="1"/>';
    s += '<path d="M266 58 C262 42 272 36 276 46 C276 34 288 32 290 44 C294 36 304 40 298 54 C300 62 286 62 266 58Z" fill="#e0221c" stroke="#a01010" stroke-width="1.4" stroke-linejoin="round"/>';
    s += eye(288, 71, 5.5, '#ffb020') + '<ellipse cx="276" cy="82" rx="5" ry="6" fill="#f0f0f0" opacity=".9"/>';
    // near leg
    s += limb([[188, 208, 14], [190, 236, 10], [192, 250, 9]], '#f0b030') + bfoot(192, G, '#f0b030', 28, 7) + '<path d="M184 238 q-8 2 -10 8" stroke="#d89a2a" stroke-width="4" fill="none" stroke-linecap="round"/>';
    s += '<ellipse cx="190" cy="206" rx="24" ry="12" fill="#c8561c"/>';
    return s;
  };

  /* ---------- PENGUIN (emperor) ---------- */
  B.penguin = function (p) {
    var s = '<defs>' + lg(p + '-ice', [[0, '#ffffff'], [1, '#bfe6f6']]) + lg(p + '-bk', [[0, '#1a2030'], [1, '#323a52']]) + rgr(p + '-y', [[0, '#ffd23a'], [.6, '#ffb52e'], [1, 'rgba(255,200,60,0)']], .5, .5, .5) + lg(p + '-wh', [[0, '#ffffff'], [1, '#d6e4f0']]) + '</defs>';
    s += '<ellipse cx="205" cy="256" rx="120" ry="15" fill="url(#' + p + '-ice)"/><ellipse cx="205" cy="260" rx="112" ry="9" fill="#9ed2ea" opacity=".6"/>';
    s += '<ellipse cx="205" cy="258" rx="72" ry="6" fill="#2b3a5a" opacity=".22"/>';
    var d = 'M178 66C178 38 222 34 230 62C234 72 232 82 228 92C250 130 256 190 242 232C238 248 206 256 182 250C152 242 148 190 160 140C166 112 176 90 178 66Z';
    s += '<g transform="translate(-34 0) scale(1.17 1)">';
    s += '<path d="' + d + '" fill="url(#' + p + '-bk)"/>';
    s += '<clipPath id="' + p + '-cp"><path d="' + d + '"/></clipPath><g clip-path="url(#' + p + '-cp)"><path d="M236 94C256 134 258 196 240 240L196 252C214 210 222 150 214 98Z" fill="url(#' + p + '-wh)"/><ellipse cx="226" cy="104" rx="24" ry="22" fill="url(#' + p + '-y)"/>' +
      '<path d="M230 150 q10 40 4 80" stroke="#b8c8d8" stroke-width="3" fill="none" opacity=".5"/></g>';
    s += '<path d="M176 116C146 140 146 192 162 208C172 192 184 152 190 124Z" fill="#232a40" stroke="#10141f" stroke-width="1.5"/>';
    s += '<ellipse cx="214" cy="80" rx="12" ry="9" fill="#ffc531" opacity=".95"/>';
    s += '<path d="M228 62C244 62 258 68 264 78C256 84 242 83 228 80Z" fill="#1a2030"/><path d="M230 78C244 82 256 83 263 79C258 74 246 74 230 74Z" fill="#ff8f6a"/><path d="M232 71 C244 70 256 72 262 76" fill="none" stroke="#fff" stroke-width="1.2" opacity=".35"/>';
    s += '<circle cx="216" cy="64" r="5" fill="#2a1a10"/><circle cx="217.5" cy="62.5" r="1.8" fill="#fff"/><circle cx="214" cy="65.5" r=".9" fill="#fff"/>';
    s += limb([[196, 250, 18], [230, 252, 10]], '#f0a040') + '<ellipse cx="222" cy="254" rx="24" ry="6" fill="#e89038"/>' + '<ellipse cx="184" cy="254" rx="18" ry="5" fill="#d8802c"/>';
    s += '<path d="M160 222 q-18 18 -28 28 q22 -2 36 -10Z" fill="#232a40"/>';
    s += '</g>';
    return s;
  };

  /* ---------- HUMMINGBIRD ---------- */
  B.hummingbird = function (p) {
    var s = '<defs>' + lg(p + '-g', [[0, '#0f7a52'], [.5, '#27c27a'], [1, '#7ae0b0']]) + rgr(p + '-r', [[0, '#ff6a8a'], [1, '#c4123c']], .4, .4, .7) + lg(p + '-fl', [[0, '#ff7ab0'], [1, '#ffc23a']], 1, 0, 0, 0) + '</defs>';
    s += shadow(200, G + 2, 80, .12);
    // flower
    s += '<path d="M352 128 C350 170 360 220 340 258" fill="none" stroke="#3f9a4a" stroke-width="6" stroke-linecap="round"/><path d="M350 200 C320 190 306 206 300 224 C324 228 342 218 350 200Z" fill="#4fb85a"/>';
    s += '<path d="M352 112 C336 98 330 74 344 66 C360 62 372 80 366 100Z" fill="#ff8a3a"/><path d="M352 124 C328 128 316 108 322 94 C336 92 350 104 354 116Z" fill="url(#' + p + '-fl)" stroke="#d8402a" stroke-width="1"/>';
    s += '<ellipse cx="348" cy="112" rx="14" ry="20" fill="url(#' + p + '-fl)" stroke="#d8402a" stroke-width="1.2"/><ellipse cx="341" cy="112" rx="5" ry="10" fill="#ffe27a" opacity=".9"/>';
    s += '<g transform="rotate(-18 200 170)">';
    // wings (blur)
    var wa = '<path d="M196 150 C186 96 140 58 100 50 C112 90 150 128 196 156Z" fill="#cfe8f0" opacity=".55"/><path d="M200 150 C222 90 262 60 300 62 C282 102 240 134 202 156Z" fill="#b8d8e8" opacity=".5"/>';
    s += '<path d="M200 156 C176 120 130 100 84 100 C108 134 156 156 200 164Z" fill="#9ec6d6" opacity=".45"/>' + wa;
    // tail
    s += leaf(150, 168, 62, 7, 168, '#1f8a5a', '#8affc8') + leaf(150, 172, 62, 7, 188, '#157a4c', '#8affc8') + leaf(150, 170, 66, 6, 178, '#2aa56e', '#8affc8');
    // body
    s += '<path d="M140 172 C150 148 210 140 246 152 C268 160 270 184 250 194 C220 206 160 198 140 172Z" fill="url(#' + p + '-g)"/>';
    s += '<path d="M180 190 C210 204 244 196 256 184 C240 190 200 196 180 190Z" fill="#f4f0dc"/>';
    s += '<path d="M232 170 C246 172 262 176 262 186 C252 198 236 194 228 184Z" fill="url(#' + p + '-r)"/>';
    s += '<circle cx="246" cy="158" r="19" fill="#22b074"/><circle cx="246" cy="158" r="19" fill="url(#' + p + '-g)" opacity=".6"/>';
    s += '<path d="M262 160 L346 158 L262 166Z" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="2" stroke-linejoin="round"/>';
    s += '<circle cx="252" cy="154" r="5" fill="#1a1a1a"/><circle cx="253.5" cy="152.5" r="1.8" fill="#fff"/>';
    s += '<path d="M200 156 C190 124 156 100 120 92 C128 128 160 152 200 162Z" fill="#dff0f6" opacity=".6"/>';
    s += leaf(204, 158, 80, 10, 235, 'rgba(210,235,245,.55)') + leaf(204, 158, 70, 9, 215, 'rgba(210,235,245,.5)');
    s += '</g>';
    s += limb([[220, 186, 5], [214, 198, 3]], '#2a2a2a');
    return s;
  };

  /* ---------- OSTRICH ---------- */
  B.ostrich = function (p) {
    var s = shadow(190, G + 2, 100);
    s += '<defs>' + lg(p + '-n', [[0, '#c98a82'], [1, '#e8b8a8']], 0, 0, 1, 0) + rgr(p + '-b', [[0, '#3a3a46'], [1, '#14141c']], .4, .35, .75) + '</defs>';
    var skinc = '#e2a99c', skind = '#c98a82';
    function oleg(x, col) { return limb([[x, 190, 28], [x + 12, 226, 19], [x + 6, 248, 12]], col) + limb([[x + 6, G - 12, 12], [x + 28, G - 5, 11]], col) + limb([[x + 6, G - 12, 9], [x + 16, G - 6, 7]], col) + '<ellipse cx="' + (x + 33) + '" cy="' + (G - 5) + '" rx="6" ry="5" fill="#4a3a34"/>'; }
    s += oleg(190, skind);
    // tail plumes
    var tp = ''; for (var i = 0; i < 9; i++) tp += leaf(100, 130 + i * 3, 62, 11, 165 + i * 12, i % 2 ? '#f6f4ee' : '#e8e4da', '#cfc8b8');
    s += tp;
    s += '<ellipse cx="170" cy="138" rx="84" ry="52" fill="url(#' + p + '-b)"/>';
    // fluffy bottom edge
    var fl = ''; for (var a = 0; a < 11; a++) fl += '<circle cx="' + (100 + a * 14) + '" cy="' + (176 + Math.sin(a / 10 * Math.PI) * 10) + '" r="14" fill="#1b1b24"/>';
    s += fl;
    // wing plumes
    var wp = ''; for (var k = 0; k < 7; k++) wp += leaf(140 + k * 4, 112 + k * 6, 84 - k * 4, 14, 176 - k * 3, k % 2 ? '#fbfaf5' : '#f0eee6', '#d8d0c0');
    s += wp;
    for (var m = 0; m < 5; m++) s += leaf(150 + m * 5, 108 + m * 6, 60, 10, 168 - m * 3, '#ffffff', '#e0d8c8');
    s += '<ellipse cx="238" cy="124" rx="26" ry="30" fill="#1f1f28"/>';
    // neck
    s += limb([[238, 118, 32], [250, 90, 22], [260, 62, 16], [270, 44, 13], [278, 34, 12]], skinc);
    s += '<path d="M246 112 q-4 -6 -4 -14" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".16" fill="none"/>';
    s += '<g fill="#fbfaf5">' + [[222, 108], [236, 114], [250, 112], [232, 100], [246, 102]].map(function (q) { return '<circle cx="' + q[0] + '" cy="' + q[1] + '" r="10"/>'; }).join('') + '</g>';
    // head
    s += '<ellipse cx="288" cy="30" rx="17" ry="12" fill="' + skinc + '"/><path d="M299 25 C312 24 326 27 328 32 C326 38 310 39 298 37Z" fill="#e8b0a0" stroke="#b07060" stroke-width="1.2"/><path d="M300 33 L326 32" stroke="#b07060" stroke-width="1"/>' +
      '<circle cx="319" cy="28" r="1.4" fill="#8a4a40"/>';
    s += '<circle cx="288" cy="25" r="8" fill="#fff" stroke="#3a2a28" stroke-width="1.4"/><circle cx="290" cy="25.5" r="5" fill="#3a2214"/><circle cx="291.5" cy="23.5" r="1.8" fill="#fff"/>' +
      '<path d="M281 18 q3 -5 6 -4 M286 16 q4 -5 7 -3 M292 17 q4 -4 7 -1" stroke="#3a2a28" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
    s += oleg(166, skinc);
    return s;
  };

  /* ---------- MAGPIE ---------- */
  B.magpie = function (p) {
    var s = '<defs>' + lg(p + '-t', [[0, '#1a4a8a'], [.35, '#1f8a7a'], [.7, '#3aa86a'], [1, '#8a6a2a']], 1, 0, 0, 1) + lg(p + '-w', [[0, '#17407c'], [.5, '#1f8a8a'], [1, '#2a5a9a']], 0, 0, 1, 1) + lg(p + '-bk', [[0, '#0a0a10'], [1, '#2a2e3a']]) + '</defs>';
    s += shadow(210, G + 2, 100, .15);
    // branch
    s += '<path d="M60 244 C140 236 260 238 360 232 L360 240 C260 248 140 250 60 252Z" fill="#7a5230"/><path d="M60 244 C140 236 260 238 360 232" fill="none" stroke="#a6794a" stroke-width="2.5"/>' +
      '<path d="M320 236 q22 -36 48 -26 q-18 6 -28 28Z" fill="#5faa4a"/><path d="M110 244 q-12 -30 -40 -30 q16 10 24 30Z" fill="#74b858"/>';
    // tail
    s += '<path d="M140 160 C100 170 56 190 14 220 C12 228 24 230 36 226 C80 214 120 200 148 184Z" fill="url(#' + p + '-t)"/>';
    s += '<path d="M138 164 C98 176 58 196 22 220" fill="none" stroke="#7affd0" stroke-width="2.2" opacity=".45" stroke-linecap="round"/><path d="M146 182 C112 196 76 210 38 226" fill="none" stroke="#0a1a3a" stroke-width="1.6" opacity=".5"/>';
    // legs
    s += limb([[208, 206, 9], [210, 228, 6]], '#121218') + bfoot(210, 244, '#121218', 20, 5, '#000') + limb([[232, 204, 9], [236, 228, 6]], '#1b1b22') + bfoot(236, 244, '#1b1b22', 20, 5, '#000');
    // body
    var d = 'M246 98C220 118 170 140 134 166L134 182C160 196 190 206 216 208C246 206 272 180 280 140C286 125 292 112 290 100C290 78 258 62 246 82Z';
    s += '<path d="' + d + '" fill="url(#' + p + '-bk)"/>';
    s += '<clipPath id="' + p + '-cp"><path d="' + d + '"/></clipPath><g clip-path="url(#' + p + '-cp)"><path d="M284 132 C270 170 240 190 206 206 L150 200 L150 182 C190 190 226 176 244 150 C256 134 270 128 284 132Z" fill="#fff"/><path d="M200 196 C226 196 250 178 262 152" fill="none" stroke="#d8dce8" stroke-width="5" opacity=".6"/></g>';
    // wing
    s += '<path d="M238 118 C206 112 168 140 134 186 C128 192 138 196 148 192 C186 182 226 160 246 134Z" fill="url(#' + p + '-w)"/>';
    s += '<path d="M214 120 C186 128 160 148 142 176 C170 160 200 150 232 136Z" fill="#fff" opacity=".95"/>';
    s += '<path d="M150 190 C170 184 200 172 220 156" fill="none" stroke="#0a1a3a" stroke-width="3" opacity=".5"/><path d="M236 124 C208 124 180 142 152 172" fill="none" stroke="#6af0d0" stroke-width="2" opacity=".5" stroke-linecap="round"/>';
    // head
    s += '<path d="M286 84 C300 82 322 88 334 96 C326 104 306 106 290 106Z" fill="#0a0a10" stroke="#000" stroke-width="1.2" stroke-linejoin="round"/><path d="M290 100 L330 98" stroke="#3a3a46" stroke-width="1.2"/>';
    s += '<circle cx="272" cy="90" r="4.8" fill="#4a2a14"/><circle cx="270.5" cy="88.5" r="1.8" fill="#fff"/><circle cx="272" cy="90" r="7.5" fill="none" stroke="#4a4e60" stroke-width=".8" opacity=".6"/>';
    s += '<path d="M252 70 C260 62 276 62 284 70" fill="none" stroke="#5a6070" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>';
    return s;
  };

  /* ---------- PASSERINE (perching songbird) ---------- */
  B.passerine = function (p) {
    var s = '<defs>' + lg(p + '-b', [[0, '#7a4a28'], [.55, '#b27a46'], [1, '#f2e2c0']]) + lg(p + '-r', [[0, '#e86a2a'], [1, '#f6a24a']]) + '</defs>';
    s += shadow(210, G + 2, 90, .12);
    s += '<path d="M70 238 C150 228 270 232 340 222 L340 230 C270 242 150 242 70 246Z" fill="#7a5230"/><path d="M70 238 C150 228 270 232 340 222" fill="none" stroke="#a6794a" stroke-width="2.5"/>' +
      '<path d="M290 228 q18 -34 46 -24 q-16 6 -26 26Z" fill="#5faa4a"/><path d="M110 236 q-10 -28 -36 -28 q14 8 22 28Z" fill="#74b858"/>';
    s += '<path d="M160 170 C128 176 96 190 60 214 C70 218 84 218 96 214 C120 206 150 192 168 184Z" fill="#6a4426"/>';
    s += limb([[200, 202, 8], [204, 226, 5]], '#9a6a4a') + bfoot(204, 236, '#9a6a4a', 17, 4) + limb([[224, 202, 8], [228, 224, 5]], '#b27a5a') + bfoot(228, 232, '#b27a5a', 17, 4);
    var d = 'M170 160C176 124 232 110 262 130C280 142 284 170 268 192C250 214 206 216 184 200C170 190 166 176 170 160Z';
    s += '<path d="' + d + '" fill="url(#' + p + '-b)"/>';
    s += '<path d="M262 134 C284 140 288 170 268 192 C252 210 226 214 208 210 C240 200 262 170 262 134Z" fill="#fbeed0" opacity=".9"/>';
    s += '<path d="M236 150 C226 146 214 150 206 158 M244 168 C232 164 220 168 212 176" stroke="#7a4a28" stroke-width="2.2" fill="none" stroke-linecap="round" opacity=".6"/>';
    // wing
    s += '<path d="M236 128 C206 126 178 146 170 178 C196 184 236 166 250 140Z" fill="#6a4426"/>' + leaf(246, 134, 80, 12, 150, '#7e5230', '#c8a070') + leaf(244, 138, 70, 11, 158, '#6a4426', '#c8a070') +
      '<path d="M216 134 C196 140 184 154 180 170" fill="none" stroke="#f0d8a8" stroke-width="3" opacity=".8" stroke-linecap="round"/>';
    // head
    s += '<circle cx="272" cy="114" r="24" fill="#9a6232"/><path d="M252 108 C256 94 280 92 292 102 C282 100 266 102 252 108Z" fill="#6a3c1c"/>';
    s += '<path d="M260 124 C270 134 288 134 296 124 C292 138 270 142 258 130Z" fill="#fbeed0"/>';
    s += '<path d="M290 106 L316 112 L291 120Z" fill="#d8a85a" stroke="#8a6020" stroke-width="1.2" stroke-linejoin="round"/><path d="M290 118 L314 114 L290 126Z" fill="#c89448" stroke="#8a6020" stroke-width="1.2" stroke-linejoin="round"/>';
    s += eye(280, 108, 5.5, '#3a2210') + '<path d="M262 106 C270 102 280 104 286 108" stroke="#f0e0b8" stroke-width="2" fill="none" opacity=".7"/>';
    // music notes
    s += '<g fill="#e06a4a"><ellipse cx="338" cy="84" rx="6" ry="4.5" transform="rotate(-20 338 84)"/><rect x="342" y="62" width="2.4" height="22"/><path d="M344 62 q10 4 8 14 q-2 -6 -8 -6Z"/><ellipse cx="362" cy="62" rx="5" ry="4" transform="rotate(-20 362 62)"/><rect x="365.5" y="44" width="2.2" height="19"/></g>';
    return s;
  };

  /* ---------- NEORNITHINE (generic modern bird, plover-like) ---------- */
  B.neornithine = function (p) {
    var s = '<defs>' + lg(p + '-b', [[0, '#6a5a48'], [.55, '#a89478'], [1, '#f6efe0']]) + '</defs>';
    s += shadow(200, G + 2, 100);
    s += '<path d="M40 252 C100 244 160 250 220 248 C280 246 340 250 380 254 L380 262 L40 262Z" fill="#d8c8a0" opacity=".5"/>';
    s += '<path d="M156 172 C100 186 70 204 48 224 C70 228 104 224 156 204Z" fill="#7a6a58"/>';
    s += limb([[190, 196, 8], [192, 232, 5], [194, 248, 4]], '#e8a85a') + bfoot(194, G, '#e8a85a', 20, 4) + limb([[214, 196, 8], [218, 230, 5], [220, 246, 4]], '#f4bc6a') + bfoot(220, 256, '#f4bc6a', 20, 4);
    var d = 'M130 170C138 136 200 124 240 138C268 148 278 176 262 198C244 218 190 220 160 204C142 194 126 184 130 170Z';
    s += '<path d="' + d + '" fill="url(#' + p + '-b)"/>' + spots(3, 22, 150, 140, 240, 190, 2, 4, '#4a3a2c', .5);
    s += '<path d="M262 146 C282 156 280 184 262 198 C248 212 220 216 200 214 C238 202 258 176 262 146Z" fill="#fff8e8"/>';
    s += '<path d="M240 140 C218 138 186 150 168 176 C200 184 238 168 252 150Z" fill="#7a6650"/>' + leaf(250, 144, 70, 10, 158, '#8a7458', '#d8c8a0');
    s += limb([[262, 140, 24], [274, 120, 20]], '#a89478') + '<circle cx="282" cy="114" r="19" fill="#b8a488"/><path d="M270 126 C280 134 296 132 300 122 C296 138 278 142 266 134Z" fill="#fffaf0"/>';
    s += '<path d="M262 106 C270 94 294 96 300 106 C288 102 272 102 262 106Z" fill="#3a2e24"/>';
    s += '<path d="M298 112 L320 116 L298 122Z" fill="#2a2420" stroke="#000" stroke-width="1" stroke-linejoin="round"/>' + eye(288, 110, 5.5, '#2a1a10');
    s += '<g opacity=".28" fill="none" stroke="#6a8a9a" stroke-width="3" stroke-linecap="round"><path d="M60 100 q8 -8 16 0"/><path d="M80 80 q8 -8 16 0"/></g>';
    return s;
  };

  /* ---------- small beaked, bristly early ornithischian ---------- */
  var ORNITH_D = 'M12 188C50 186 96 176 126 156C148 142 184 138 210 142C232 144 244 138 252 130C258 120 268 110 282 106C296 100 316 102 326 110C332 114 330 122 322 124C312 126 304 130 300 138C296 152 290 166 280 176C266 194 242 202 214 202C186 202 164 198 148 196C104 194 54 192 12 188Z';
  function ornith(p) {
    var c = { top: '#6a6a3a', mid: '#a8a45a', bot: '#efe6b4', line: '#3a3a1e' };
    var s = shadow(190, G + 2, 120);
    s += limb([[150, 170, 28], [172, 208, 18], [156, 244, 10]], '#7e7a42') + foot(156, G, '#7e7a42', 30);
    var extra = stripes(['M60 176 q8 8 4 16', 'M100 166 q8 10 4 24', 'M140 152 q10 12 4 28', 'M180 146 q8 12 2 26'], c.top, 6, .4) + '<ellipse cx="232" cy="194" rx="56" ry="12" fill="#fff9d8" opacity=".4"/>' +
      hairs([[10, 186], [60, 180], [110, 160], [150, 144], [200, 140], [240, 140]], 7, '#4a4a26', 1.6, 6);
    s += skin(p, ORNITH_D, c, extra);
    s += hairs([[10, 186], [60, 180], [110, 160], [150, 144], [200, 140], [240, 140]], 8, '#5a5a2e', 1.6, 6);
    s += legN(p, [[174, 170, 30], [198, 208, 18], [178, 244, 10]], '#a8a45a') + foot(178, G, '#a8a45a', 32);
    s += limb([[262, 150, 11], [274, 168, 8], [286, 174, 7]], '#a8a45a') + claw(290, 176, 25, 5) + claw(290, 170, -5, 5) + claw(288, 164, -30, 5);
    s += '<path d="M326 118 C314 122 304 124 296 124" fill="none" stroke="#2a2410" stroke-width="1.8" stroke-linecap="round"/>';
    s += '<path d="M312 122 L316 134 L320 122Z" fill="#fffbe8" stroke="#8a8050" stroke-width=".8"/>';
    s += '<path d="M322 108 C330 108 334 114 330 120 C326 120 322 116 322 108Z" fill="#f4dc90" stroke="#8a7030" stroke-width="1"/>';
    s += eye(308, 112, 6, '#f2b632');
    return s;
  }
  B.ornithischian = function (p) {
    return ghost(p + 'g1', place(B.stegosaurus(p + 's'), 110, 16, .5), [.45, .6, .5], .45) +
      ghost(p + 'g2', place(B.triceratops(p + 't'), 228, 28, .43, false), [.6, .55, .4], .45) +
      place(ornith(p + 'o'), 0, 40, .86);
  };
  B.saurischian = function (p) {
    return place(B.brachiosaurus(p + 'b'), 164, 40, .6) + place(B.allosaurus(p + 'a'), -8, 110, .56);
  };
  B.sauropodomorph = function (p) {
    return place(B.argentinosaurus(p + 'a'), 112, 22, .72) + place(B.plateosaurus(p + 'p'), -4, 100, .62);
  };
  function qmark(x, y, s, col) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="none" stroke="' + col + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"><path d="M-24 -34C-26 -70 28 -74 28 -40C28 -18 2 -16 2 6"/></g><circle cx="' + (x + 2 * s) + '" cy="' + (y + 30 * s) + '" r="' + (6 * s) + '" fill="' + col + '"/>';
  }
  B.theropod = function (p) {
    return place(B.trex(p + 't'), 196, 56, .5) + place(B.coelophysis(p + 'c'), -10, 70, .8);
  };
  B.dinosaur = function (p) {
    var inner = B.coelophysis(p + 'e', { c: { top: '#8a5a30', mid: '#c8924a', bot: '#f6e4b8', line: '#4a3018' }, dark: '#a8763a', mid: '#c8924a' });
    return qmark(330, 84, 1.1, 'rgba(120,110,150,.35)') + place(inner, 0, 18, .9);
  };

  /* ============================ EXTRAS ============================ */
  function bez(a, b, c, d, t) { var u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; }
  function vert(a, b, c, d, n, r0, r1, col, st) { // chain of vertebrae along a bezier
    var s = '';
    for (var i = 0; i <= n; i++) { var t = i / n, q = bez(a, b, c, d, t), r = r0 + (r1 - r0) * t; s += '<ellipse cx="' + f1(q[0]) + '" cy="' + f1(q[1]) + '" rx="' + f1(r) + '" ry="' + f1(r * .85) + '" fill="' + col + '" stroke="' + st + '" stroke-width="1"/>'; }
    return s;
  }
  function bone(pts, w, col, st) { // pts [[x,y],[x,y]] simple long bone with knobs
    var a = pts[0], b = pts[1], s = '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + st + '" stroke-width="' + (w + 2) + '" stroke-linecap="round"/><line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="' + col + '" stroke-width="' + w + '" stroke-linecap="round"/>';
    return s;
  }
  function marker(x, y, n) { return '<circle cx="' + x + '" cy="' + y + '" r="10" fill="#ff7a3a" stroke="#fff" stroke-width="2"/><text x="' + x + '" y="' + (y + 4.5) + '" font-family="Verdana,Arial,sans-serif" font-size="13" font-weight="700" text-anchor="middle" fill="#fff">' + n + '</text>'; }

  function trexSkel(col, st) {
    var s = '';
    s += vert([8, 176], [30, 172], [44, 156], [64, 140], 14, 2.2, 5.2, col, st);
    s += vert([64, 140], [84, 126], [108, 120], [128, 124], 9, 5.2, 4.8, col, st);
    s += vert([128, 124], [140, 122], [146, 106], [154, 98], 6, 4.6, 3.4, col, st);
    // ribs
    for (var i = 0; i < 6; i++) { var x = 88 + i * 8, y = 124 - Math.sin(i / 5 * 2) * 2 + 2; s += '<path d="M' + x + ' ' + y + ' q9 ' + (14 + i % 3 * 4) + ' ' + (4 - i * 1.5) + ' ' + (32 - Math.abs(i - 2) * 3) + '" fill="none" stroke="' + st + '" stroke-width="4.2" stroke-linecap="round"/><path d="M' + x + ' ' + y + ' q9 ' + (14 + i % 3 * 4) + ' ' + (4 - i * 1.5) + ' ' + (32 - Math.abs(i - 2) * 3) + '" fill="none" stroke="' + col + '" stroke-width="2.6" stroke-linecap="round"/>'; }
    // pelvis
    s += '<path d="M48 140 C54 126 78 124 84 134 C80 144 62 148 48 140Z" fill="' + col + '" stroke="' + st + '" stroke-width="1.5"/>' + bone([[66, 144], [84, 168]], 5, col, st) + bone([[62, 146], [50, 170]], 5, col, st) + '<ellipse cx="86" cy="171" rx="6" ry="4" fill="' + col + '" stroke="' + st + '" stroke-width="1.2"/>';
    // leg
    s += bone([[68, 146], [92, 186]], 8, col, st) + bone([[92, 186], [74, 212]], 6, col, st) + bone([[74, 212], [78, 222]], 4.5, col, st) + bone([[78, 224], [108, 226]], 4.5, col, st) + bone([[78, 224], [102, 220]], 3.5, col, st) + bone([[78, 224], [66, 226]], 3.5, col, st);
    s += '<circle cx="92" cy="186" r="5.5" fill="' + col + '" stroke="' + st + '" stroke-width="1.3"/>';
    // arm: tiny 2 fingers
    s += bone([[128, 130], [138, 146]], 3.5, col, st) + bone([[138, 146], [148, 150]], 3, col, st) + bone([[148, 150], [156, 156]], 2.2, col, st) + bone([[148, 150], [157, 148]], 2.2, col, st);
    // furcula (boomerang)
    s += '<path d="M120 134 C124 144 132 146 138 138" fill="none" stroke="' + st + '" stroke-width="4.5" stroke-linecap="round"/><path d="M120 134 C124 144 132 146 138 138" fill="none" stroke="#ffe7a0" stroke-width="2.6" stroke-linecap="round"/>';
    // skull
    s += '<path d="M150 98 C150 84 168 78 188 86 C194 92 194 98 192 102 L190 106 C182 110 168 110 160 108 C154 106 150 104 150 98Z" fill="' + col + '" stroke="' + st + '" stroke-width="1.6"/>';
    s += '<path d="M160 108 C170 112 184 112 192 106 L192 112 C184 118 168 118 158 114Z" fill="' + col + '" stroke="' + st + '" stroke-width="1.4"/>';
    s += '<ellipse cx="167" cy="94" rx="5" ry="5.5" fill="#3a2e1c"/><ellipse cx="180" cy="95" rx="6" ry="3.5" fill="#3a2e1c" opacity=".8"/>' + teeth([[182, 108], [175, 109], [168, 109]], '#fffdf0', 1);
    return s;
  }
  function birdSkel(col, st) {
    var s = '', ox = 0;
    // tail + pygostyle
    s += vert([262, 132], [250, 130], [244, 128], [236, 126], 5, 2.8, 2.2, col, st);
    s += '<path d="M236 126 L214 112 M236 126 L212 124 M236 126 L214 138" stroke="' + st + '" stroke-width="3.4" stroke-linecap="round"/><path d="M236 126 L214 112 M236 126 L212 124 M236 126 L214 138" stroke="' + col + '" stroke-width="1.8" stroke-linecap="round"/>';
    // body spine (synsacrum)
    s += vert([262, 132], [280, 126], [298, 126], [316, 130], 6, 3.4, 3.4, col, st);
    // neck S-curve
    s += vert([316, 130], [336, 128], [330, 96], [350, 90], 9, 3.4, 2.6, col, st);
    // sternum + keel
    s += '<path d="M276 172 C292 184 322 190 348 166 L336 156 C316 168 296 164 284 156Z" fill="' + col + '" stroke="' + st + '" stroke-width="1.6"/><path d="M280 166 C300 196 332 196 350 170 C332 184 304 184 280 166Z" fill="#ead9b0" stroke="' + st + '" stroke-width="1.4"/>';
    // ribs
    for (var i = 0; i < 5; i++) s += '<path d="M' + (280 + i * 9) + ' 128 q8 ' + (14 + i) + ' ' + (4 + i * 3) + ' ' + (30 + i) + '" fill="none" stroke="' + st + '" stroke-width="3.6" stroke-linecap="round"/><path d="M' + (280 + i * 9) + ' 128 q8 ' + (14 + i) + ' ' + (4 + i * 3) + ' ' + (30 + i) + '" fill="none" stroke="' + col + '" stroke-width="2.2" stroke-linecap="round"/>';
    // furcula (wishbone, V)
    s += '<path d="M310 136 L326 164 L342 140" fill="none" stroke="' + st + '" stroke-width="5.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M310 136 L326 164 L342 140" fill="none" stroke="#ffe7a0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>';
    // wing folded: humerus, forearm, hand fused with 3 finger bones
    s += bone([[308, 138], [286, 150]], 5, col, st) + bone([[286, 150], [262, 144]], 4, col, st) + bone([[262, 144], [244, 150]], 4.4, col, st) + bone([[262, 144], [248, 142]], 2.6, col, st) + bone([[262, 146], [250, 156]], 2.2, col, st);
    // pelvis
    s += '<path d="M252 130 C258 118 282 118 288 128 C282 138 262 140 252 130Z" fill="' + col + '" stroke="' + st + '" stroke-width="1.5"/>' + bone([[268, 138], [250, 158]], 3.6, col, st);
    // leg: short femur forward, long tibiotarsus, tarsometatarsus, toes
    s += bone([[272, 136], [292, 170]], 6, col, st) + bone([[292, 170], [276, 218]], 5.2, col, st) + bone([[276, 218], [282, 248]], 4.2, col, st) +
      bone([[282, 248], [308, 252]], 3.4, col, st) + bone([[282, 248], [304, 244]], 2.8, col, st) + bone([[282, 248], [268, 252]], 2.8, col, st);
    s += '<circle cx="292" cy="170" r="4.6" fill="' + col + '" stroke="' + st + '" stroke-width="1.2"/>';
    // skull with beak
    s += '<path d="M346 88 C346 76 362 72 372 80 C376 82 378 86 378 88 C378 94 372 96 366 96 C358 98 350 98 346 94Z" fill="' + col + '" stroke="' + st + '" stroke-width="1.5"/><path d="M372 80 L396 88 L372 94Z" fill="#f2c060" stroke="#8a6a20" stroke-width="1.4" stroke-linejoin="round"/><circle cx="358" cy="84" r="4.6" fill="#3a2e1c"/>';
    return s;
  }
  window.ART['skeleton-bird-vs-trex'] = svg((function () {
    var p = 'skeleton-bird-vs-trex', col = '#f4ead0', st = '#8a7448';
    var s = '<defs>' + lg(p + '-ig', [[0, '#fff'], [1, '#e6dcc0']]) + '</defs>';
    s += '<path d="M200 20 L200 260" stroke="#c9b892" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/>';
    s += shadow(100, 240, 80, .1) + shadow(300, 258, 80, .1);
    s += '<g transform="translate(-2 6)">' + trexSkel(col, st) + '</g>';
    s += birdSkel(col, st);
    // markers: wishbone, 3-finger hand, hollow bone
    s += marker(130, 124, 1) + marker(316, 124, 1);
    s += marker(150, 170, 2) + marker(254, 168, 2);
    // inset: hollow bone cross-section
    s += '<circle cx="200" cy="252" r="26" fill="url(#' + p + '-ig)" stroke="#c9b892" stroke-width="2"/><circle cx="200" cy="252" r="17" fill="#fff" stroke="#8a7448" stroke-width="5"/><circle cx="200" cy="252" r="17" fill="none" stroke="#f4ead0" stroke-width="2.5"/>' +
      '<path d="M190 242 L210 262 M210 242 L190 262 M200 236 L200 268 M184 252 L216 252" stroke="#c9b892" stroke-width="1.6"/>' + marker(200, 226, 3);
    s += '<path d="M174 252 C150 250 120 238 98 220 M226 252 C250 252 262 240 276 226" fill="none" stroke="#ff7a3a" stroke-width="1.6" stroke-dasharray="2 5" stroke-linecap="round" opacity=".7"/>';
    return s;
  })());

  window.ART['feather-closeup'] = svg((function () {
    var p = 'feather-closeup';
    var s = '<defs>' + lg(p + '-v', [[0, '#1c4a8a'], [.4, '#1f9a8a'], [.75, '#3fb870'], [1, '#2a5a9a']], 0, 0, 1, 0) + lg(p + '-v2', [[0, '#ffffff'], [1, '#ffffff']]) +
      '<clipPath id="' + p + '-m"><circle cx="298" cy="192" r="74"/></clipPath></defs>';
    s += '<ellipse cx="170" cy="272" rx="120" ry="9" fill="#2b2b2b" opacity=".12"/>';
    // main feather
    var f = '<g transform="translate(34 252) rotate(-34)">';
    f += '<path d="M10 0 C60 -52 220 -58 310 -2 C220 52 60 48 10 0Z" fill="url(#' + p + '-v)"/>';
    var L = 296;
    for (var i = 0; i < 34; i++) {
      var t = i / 33, x = 24 + t * (L - 24), h = 48 * Math.pow(Math.sin(Math.PI * (.08 + t * .88)), .85) * (1 - t * .25);
      f += '<path d="M' + f1(x) + ' 0 L' + f1(x + 18) + ' ' + f1(-h) + ' M' + f1(x) + ' 0 L' + f1(x + 18) + ' ' + f1(h) + '" stroke="#bff0e0" stroke-width="1" opacity=".5" fill="none"/>';
    }
    f += '<path d="M10 0 C60 -52 220 -58 310 -2" fill="none" stroke="#0e2e5a" stroke-width="2" opacity=".5"/><path d="M10 0 C60 48 220 52 310 -2" fill="none" stroke="#0e2e5a" stroke-width="2" opacity=".5"/>';
    f += '<path d="M60 -22 C130 -40 210 -38 280 -10" fill="none" stroke="#9ff0d0" stroke-width="3" opacity=".35" stroke-linecap="round"/>';
    // eye-spot shimmer
    f += '<ellipse cx="236" cy="-6" rx="22" ry="14" fill="#173a78" opacity=".55"/><ellipse cx="236" cy="-6" rx="12" ry="7" fill="#29c89a" opacity=".75"/>';
    // rachis
    f += '<path d="M-26 -2 L312 -2 L312 2 L-26 4Z" fill="#f4ecd6" stroke="#b8a878" stroke-width="1"/>';
    // downy base
    for (var j = 0; j < 14; j++) f += '<path d="M' + (4 + j * 1.5) + ' 0 q' + (-10 - j * 1.6) + ' ' + (j % 2 ? -14 - j : 14 + j) + ' ' + (-20 - j * 3) + ' ' + (j % 2 ? -20 : 20) + '" stroke="#e8f0f4" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".9"/>';
    f += '</g>';
    s += f;
    // magnifier
    s += '<circle cx="298" cy="192" r="78" fill="#fff" stroke="#6a5a48" stroke-width="7"/>';
    s += '<g clip-path="url(#' + p + '-m)"><rect x="210" y="110" width="170" height="170" fill="#eaf7f4"/>';
    for (var b = 0; b < 5; b++) {
      var ox = -34 + b * 34;
      s += '<line x1="' + (240 + ox) + '" y1="280" x2="' + (300 + ox) + '" y2="110" stroke="#1f8a8a" stroke-width="12" stroke-linecap="round"/><line x1="' + (240 + ox) + '" y1="280" x2="' + (300 + ox) + '" y2="110" stroke="#5fd0c0" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>';
    }
    for (var q = 0; q < 5; q++) for (var m = 0; m < 4; m++) {
      var ty = 128 + m * 38 - q * 4, tx = 262 + q * 34 - (m * 12);
      s += '<path d="M' + tx + ' ' + ty + ' l16 -2 q6 -1 6 5 M' + tx + ' ' + (ty + 10) + ' l16 -2 q6 -1 6 5" stroke="#2a5a9a" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".7"/>';
    }
    s += '</g>';
    s += '<path d="M352 246 L384 280" stroke="#6a5a48" stroke-width="12" stroke-linecap="round"/>';
    s += '<circle cx="298" cy="192" r="78" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>';
    s += '<path d="M222 164 q8 -26 36 -34" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>';
    // proto-feather filaments (simple dino fuzz)
    s += '<g fill="none" stroke="#e08a3c" stroke-width="3" stroke-linecap="round"><path d="M40 48 q-6 -22 6 -36"/><path d="M52 52 q0 -26 16 -38"/><path d="M62 56 q8 -22 26 -26"/></g><circle cx="52" cy="60" r="5" fill="#c9712e"/>';
    return s;
  })());

  window.ART['egg-nest'] = svg((function () {
    var p = 'egg-nest';
    var s = '<defs>' + lg(p + '-n', [[0, '#8a6038'], [1, '#c8a060']]) + lg(p + '-e1', [[0, '#e2f2ec'], [1, '#a8d4c8']], .2, 0, .8, 1) + lg(p + '-e2', [[0, '#fff7e6'], [1, '#e8d0a0']], .2, 0, .8, 1) + lg(p + '-e3', [[0, '#f8f0dc'], [1, '#d8c8a0']], .2, 0, .8, 1) + rgr(p + '-f', [[0, '#ffd070'], [1, '#e8902c']], .4, .35, .7) + '</defs>';
    s += '<ellipse cx="200" cy="262" rx="160" ry="14" fill="#2b2b2b" opacity=".16"/>';
    s += '<path d="M0 262 q30 -30 20 -52 M14 262 q14 -26 30 -38 M386 262 q-24 -28 -14 -54 M372 262 q-10 -24 -28 -34" stroke="#5faa4a" stroke-width="5" fill="none" stroke-linecap="round"/>';
    // nest back
    s += '<ellipse cx="200" cy="218" rx="150" ry="44" fill="#6a4426"/>';
    var r = rng(5), tw = '';
    for (var i = 0; i < 30; i++) { var a = r() * 6.283, rx = 138 * (.7 + r() * .3), x = 200 + Math.cos(a) * rx, y = 218 + Math.sin(a) * rx * .3; tw += '<path d="M' + f1(x - 28) + ' ' + f1(y - 4 + r() * 6) + ' Q' + f1(x) + ' ' + f1(y - 14 + r() * 10) + ' ' + f1(x + 28) + ' ' + f1(y + r() * 8) + '" stroke="' + (i % 3 ? '#a87a44' : '#8a5a30') + '" stroke-width="' + f1(4 + r() * 3) + '" fill="none" stroke-linecap="round"/>'; }
    s += tw;
    s += '<ellipse cx="200" cy="214" rx="124" ry="30" fill="#4a2e14" opacity=".85"/>';
    // eggs
    function egg(x, y, w, h, g, rot, sp) {
      return '<g transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"><ellipse rx="' + w + '" ry="' + h + '" fill="url(#' + p + '-' + g + ')" stroke="rgba(90,70,40,.35)" stroke-width="1.4"/>' +
        (sp || '') + '<ellipse cx="' + f1(-w * .35) + '" cy="' + f1(-h * .4) + '" rx="' + f1(w * .22) + '" ry="' + f1(h * .14) + '" fill="#fff" opacity=".6" transform="rotate(-25 ' + f1(-w * .35) + ' ' + f1(-h * .4) + ')"/></g>';
    }
    var dots = '<g fill="#7a8a6a" opacity=".5"><circle cx="-6" cy="4" r="1.6"/><circle cx="6" cy="-8" r="1.4"/><circle cx="4" cy="12" r="1.8"/><circle cx="-10" cy="-10" r="1.3"/></g>';
    s += egg(90, 206, 22, 30, 'e1', -14, dots) + egg(124, 218, 24, 32, 'e2', 10, '') + egg(310, 208, 22, 30, 'e1', 16, dots) + egg(278, 220, 24, 32, 'e3', -8, '');
    // hatchling in the middle
    s += '<g transform="translate(200 176)">';
    s += '<ellipse cx="0" cy="34" rx="34" ry="28" fill="url(#' + p + '-e2)" stroke="rgba(90,70,40,.35)" stroke-width="1.4"/>';
    s += '<ellipse cx="0" cy="-2" rx="30" ry="28" fill="url(#' + p + '-f)"/>';
    var fz = ''; for (var k = 0; k < 16; k++) { var aa = (k / 16) * 6.283; fz += '<path d="M' + f1(Math.cos(aa) * 26) + ' ' + f1(-2 + Math.sin(aa) * 24) + ' l' + f1(Math.cos(aa) * 8) + ' ' + f1(Math.sin(aa) * 8) + '"/>'; }
    s += '<g stroke="#ffc060" stroke-width="2.2" stroke-linecap="round">' + fz + '</g>';
    s += '<path d="M-6 -30 q-4 -12 4 -16 q0 8 6 8 q4 -8 10 -4 q-4 6 -2 12" fill="#e8902c"/>';
    s += '<circle cx="-11" cy="-4" r="9" fill="#fff" stroke="#3a2a1c" stroke-width="1.6"/><circle cx="-9" cy="-3" r="5.4" fill="#2a1a10"/><circle cx="-7.4" cy="-5.4" r="2" fill="#fff"/>';
    s += '<circle cx="12" cy="-4" r="9" fill="#fff" stroke="#3a2a1c" stroke-width="1.6"/><circle cx="14" cy="-3" r="5.4" fill="#2a1a10"/><circle cx="15.6" cy="-5.4" r="2" fill="#fff"/>';
    s += '<path d="M-4 10 C0 5 14 5 18 10 C14 20 0 20 -4 10Z" fill="#f2c060" stroke="#a86a18" stroke-width="1.4" stroke-linejoin="round"/><path d="M-2 11 q8 3 18 0" stroke="#a86a18" stroke-width="1.2" fill="none"/>';
    s += '<circle cx="-11" cy="12" r="5" fill="#ff9a8a" opacity=".5"/>';
    s += '<path d="M-38 30 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l8 12 l8 -12 l6 10 L38 40 L-38 40Z" fill="url(#' + p + '-e2)" stroke="rgba(90,70,40,.45)" stroke-width="1.4" stroke-linejoin="round"/>';
    s += '</g>';
    // nest front rim
    var fr = '';
    for (var j = 0; j < 26; j++) { var t2 = j / 25, x2 = 60 + t2 * 280, y2 = 232 + Math.sin(t2 * Math.PI) * 18; fr += '<path d="M' + f1(x2 - 30) + ' ' + f1(y2 - 6 + r() * 6) + ' Q' + f1(x2) + ' ' + f1(y2 + 6 + r() * 6) + ' ' + f1(x2 + 30) + ' ' + f1(y2 - 6 + r() * 8) + '" stroke="' + (j % 3 ? '#a87a44' : (j % 2 ? '#c8a060' : '#7a4e28')) + '" stroke-width="' + f1(5 + r() * 3) + '" fill="none" stroke-linecap="round"/>'; }
    s += fr;
    return s;
  })());

  /* ---------- registration ---------- */
  var ids = ['trex', 'tyrannosaur', 'allosaurus', 'coelophysis', 'coelurosaur', 'maniraptoran', 'velociraptor', 'microraptor', 'archaeopteryx', 'avialan',
    'stegosaurus', 'triceratops', 'ankylosaurus', 'parasaurolophus', 'brachiosaurus', 'argentinosaurus', 'plateosaurus',
    'chicken', 'penguin', 'hummingbird', 'ostrich', 'magpie', 'passerine', 'neornithine',
    'ornithischian', 'saurischian', 'sauropodomorph', 'theropod', 'dinosaur'];
  ids.forEach(function (id) { window.ART[id] = svg(B[id](id)); });
})();
