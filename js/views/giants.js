/* Giants view: "Why did dinosaurs get so big?"
   Views.giants = { title, icon, mount(el, ctx) } ; mount returns destroy(). */
(function () {
  'use strict';
  window.Views = window.Views || {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(label, cls, fn) { var b = mk('button', 'giants-btn ' + (cls || ''), label); b.type = 'button'; if (fn) b.addEventListener('click', fn); return b; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function gauss() { var u = 0, v = 0; while (u === 0) u = Math.random(); while (v === 0) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function reduced() { try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function nice(n) { return n >= 1000 ? (Math.round(n / 100) / 10) + ' tonnes' : Math.round(n) + ' kg'; }

  var FALLBACK_LEN = { trex: 12.3, argentinosaurus: 30, brachiosaurus: 22, human: 1.7, allosaurus: 9, triceratops: 8.5, stegosaurus: 9 };
  var FALLBACK_MASS = { trex: 8000, argentinosaurus: 70000, brachiosaurus: 35000, triceratops: 6000, allosaurus: 2000, stegosaurus: 5000 };

  var FALLBACK_THEORIES = [
    { id: 'eggs', emoji: '🥚', title: 'Lots of small eggs', oneLiner: 'Laying eggs instead of carrying babies lets you be huge.', explanation: 'A big mammal mum has to carry one baby for months. A dinosaur could lay many eggs and walk away. So she could keep growing without risking her babies.', evolutionLesson: 'Individuals in a population that could grow bigger and still raise young left more offspring. Over generations, the population got bigger.', evidence: ['Fossil nests with dozens of eggs', 'Eggs of the biggest dinosaurs were only about the size of a football'], confidence: 'likely', counter: 'Other egg layers stayed small.' },
    { id: 'lungs', emoji: '🫁', title: 'Bird-style air sacs', oneLiner: 'Lungs with air sacs are very good at getting oxygen.', explanation: 'Birds, which are living dinosaurs, have air sacs that push air through the lungs in one direction. Fossil bones show that sauropods had them too.', evolutionLesson: 'Air-sac lungs were already there in an ancestor. Descendants that could use them to be big survived well in warm, low-oxygen worlds.', evidence: ['Hollow pockets in fossil neck and back bones'], confidence: 'strong', counter: 'Air sacs alone do not explain the size.' },
    { id: 'arms', emoji: '🥊', title: 'An arms race', oneLiner: 'Big predators and big prey push each other up.', explanation: 'If predators are big, the bigger plant-eaters are safer. If prey is big, bigger predators eat better.', evolutionLesson: 'Each side selects the other. Neither is "trying"; the bigger ones just survive more often.', evidence: ['Giant predators lived with giant plant-eaters'], confidence: 'debated', counter: 'Some giants had few predators.' }
  ];

  /* simple drawn stand-ins */
  var KID_SVG = '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><circle cx="50" cy="16" r="10" fill="#f3c9a0"/><path d="M40 12 q10 -12 20 0 q-4 -2 -10 -2 q-6 0 -10 2z" fill="#5a3a22"/><rect x="38" y="28" width="24" height="34" rx="9" fill="#e8504a"/><rect x="39" y="60" width="9" height="36" rx="4" fill="#3b5ba5"/><rect x="52" y="60" width="9" height="36" rx="4" fill="#3b5ba5"/><rect x="26" y="30" width="9" height="28" rx="4" fill="#f3c9a0"/><rect x="65" y="30" width="9" height="28" rx="4" fill="#f3c9a0"/></svg>';
  var BUS_SVG = '<svg viewBox="0 0 120 50" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><rect x="2" y="6" width="116" height="34" rx="8" fill="#f2b63a"/><g fill="#cfeaf8" stroke="#3a6f8a" stroke-width="1.5"><rect x="8" y="12" width="16" height="12" rx="2"/><rect x="28" y="12" width="16" height="12" rx="2"/><rect x="48" y="12" width="16" height="12" rx="2"/><rect x="68" y="12" width="16" height="12" rx="2"/><rect x="88" y="12" width="26" height="16" rx="3"/></g><rect x="2" y="32" width="116" height="3" fill="#d98c1f"/><circle cx="28" cy="41" r="7" fill="#333"/><circle cx="92" cy="41" r="7" fill="#333"/><circle cx="28" cy="41" r="3" fill="#bbb"/><circle cx="92" cy="41" r="3" fill="#bbb"/></svg>';

  function dinoSvg(col, uid) {
    return '<svg viewBox="0 0 200 110" aria-hidden="true" focusable="false"><ellipse cx="100" cy="104" rx="70" ry="5" fill="rgba(0,0,0,.12)"/>' +
      '<path d="M20 70 q-12 6 -16 14 q16 -2 26 -8z" fill="' + col + '"/><ellipse cx="85" cy="68" rx="55" ry="26" fill="' + col + '"/>' +
      '<path d="M120 62 q22 -14 28 -44 q2 -8 8 -8 q10 0 8 10 q-4 38 -28 62z" fill="' + col + '"/><circle cx="158" cy="16" r="9" fill="' + col + '"/><circle cx="162" cy="14" r="3.2" fill="#fff"/><circle cx="163" cy="14" r="1.6" fill="#222"/>' +
      '<rect x="50" y="84" width="13" height="20" rx="5" fill="' + col + '"/><rect x="100" y="84" width="13" height="20" rx="5" fill="' + col + '"/></svg>';
  }

  /* ====================================================================
     1. SIZE COMPARISON
     ==================================================================== */
  function sizeComparison(host, ctx) {
    var DATA = ctx.DATA || window.DATA || {}, Art = ctx.Art || window.Art;
    function artFor(id, aid) {
      var s = '';
      try { if (Art && Art.svg) s = Art.svg(aid || id); else if (window.ART && window.ART[aid || id]) s = window.ART[aid || id]; } catch (e) { s = ''; }
      if (!s) return dinoSvg('#9aa7b4');
      return s.replace(/viewBox="0 0 400 300"/, 'viewBox="0 40 400 235" preserveAspectRatio="xMinYMax meet"');
    }
    var items = [
      { id: 'child', name: 'A kid', len: 1.3, mass: 35, svg: KID_SVG, aspect: 1, extra: 'about 1.3 m tall', fixed: true },
      { id: 'bus', name: 'A city bus', len: 12, mass: 12000, svg: BUS_SVG, aspect: 50 / 120, extra: 'about 12 m long', fixed: true }
    ];
    var seen = {}, CMP = window.COMPARE;
    if (CMP && Object.keys(CMP).length) {
      /* painted cut-outs drawn to one common scale (100 px = 1 m in the source files) */
      items = [];
      Object.keys(CMP).forEach(function (k) {
        var c = CMP[k], t = DATA.byId && DATA.byId(k);
        var nm = k === 'child' ? 'A kid' : k === 'bus' ? 'A city bus' : t ? String(t.name).replace(/\s*\(.*$/, '') : k.charAt(0).toUpperCase() + k.slice(1);
        var len = t && t.lengthM ? t.lengthM : c.widthM;
        items.push({ id: k, name: nm, len: c.widthM, shown: len, mass: t ? t.massKg : (k === 'child' ? 35 : k === 'bus' ? 12000 : 0), img: c, fixed: k === 'child' || k === 'bus',
          extra: k === 'child' ? 'about 1.3 m tall' : k === 'bus' ? 'about 12 m long' : null });
      });
      seen = { trex: 1, argentinosaurus: 1 };
    } else {
    var taxa = (DATA.taxa || []).filter(function (t) { return t && t.rank !== 'group' && (t.lengthM > 0 || FALLBACK_LEN[t.id]); });
    taxa.forEach(function (t) {
      if (seen[t.id] || t.id === 'human') return; seen[t.id] = 1;
      items.push({ id: t.id, name: t.nickname && t.name ? t.name : (t.name || t.id), len: t.lengthM || FALLBACK_LEN[t.id], mass: t.massKg || FALLBACK_MASS[t.id], art: t.artId || t.id, aspect: 235 / 400, taxon: t });
    });
    ['trex', 'argentinosaurus'].forEach(function (id) {
      if (!seen[id]) { items.push({ id: id, name: id === 'trex' ? 'T. rex' : 'Argentinosaurus', len: FALLBACK_LEN[id], mass: FALLBACK_MASS[id], art: id, aspect: 235 / 400 }); }
    });
    }
    var on = { child: 1, bus: 1, trex: 1, argentinosaurus: 1 };
    var root = mk('section', 'giants-sec');
    root.innerHTML = '<h2 class="giants-h2">📏 How big is big?</h2><p class="giants-intro">Tap the animals to put them in the line-up. Every picture is drawn to the same scale, so you can see who towers over who.</p>';
    var chips = mk('div', 'giants-chips'); chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', 'Choose animals to compare');
    var ruler = mk('div', 'giants-ruler'), rows = mk('div', 'giants-rows');
    root.appendChild(chips); root.appendChild(ruler); root.appendChild(rows);
    var note = mk('p', 'giants-note', 'Sizes are best estimates from fossils and change as new bones are found. Art is only roughly to scale.');
    root.appendChild(note);
    host.appendChild(root);

    function arOK(id) {
      try {
        if (typeof window.openAR !== 'function' || !window.AR_MODELS) return false;
        var m = window.AR_MODELS;
        return Array.isArray(m) ? m.indexOf(id) >= 0 : !!m[id];
      } catch (e) { return false; }
    }
    function render() {
      chips.innerHTML = '';
      items.forEach(function (it) {
        var b = btn(esc(it.name), 'giants-chip' + (on[it.id] ? ' is-on' : ''), function () { if (on[it.id]) { delete on[it.id]; } else on[it.id] = 1; render(); });
        b.setAttribute('aria-pressed', on[it.id] ? 'true' : 'false');
        chips.appendChild(b);
      });
      var sel = items.filter(function (i) { return on[i.id]; }).sort(function (a, b) { return a.len - b.len; });
      rows.innerHTML = ''; ruler.innerHTML = '';
      if (!sel.length) { rows.innerHTML = '<p class="giants-hint">Pick at least one animal above.</p>'; return; }
      var max = Math.max.apply(null, sel.map(function (i) { return i.len; })), step = max > 20 ? 5 : max > 8 ? 2 : 1, t = '';
      for (var m = 0; m <= max; m += step) t += '<span class="' + (m / max > 0.93 ? 'giants-tick-end' : '') + '" style="left:' + (m / max * 100) + '%">' + m + ' m</span>';
      ruler.innerHTML = '<div class="giants-ticks">' + t + '</div>';
      sel.forEach(function (it) {
        var pct = it.len / max * 100, row = mk('div', 'giants-row');
        var art = mk('div', 'giants-art'); art.style.width = pct + '%';
        art.innerHTML = it.img ? '<img class="giants-pic" src="' + esc(it.img.src) + '" alt="' + esc(it.name) + '" loading="lazy" style="width:100%;height:auto;display:block">' : (it.svg || artFor(it.id, it.art));
        var info = mk('div', 'giants-info');
        info.innerHTML = '<b>' + esc(it.name) + '</b> <span>' + (it.extra || (f1(it.shown || it.len) + ' m long')) + (it.mass ? ' · ' + nice(it.mass) : '') + '</span>';
        var bar = mk('div', 'giants-scalebar'); bar.style.width = pct + '%';
        row.appendChild(info); row.appendChild(art); row.appendChild(bar);
        if (!it.fixed && arOK(it.id)) {
          var ab = btn('📱 See it life-size (AR)', 'giants-ar', function () { try { window.openAR(it.id); } catch (e) { } });
          row.appendChild(ab);
        }
        rows.appendChild(row);
      });
    }
    render();
  }

  /* ====================================================================
     2. THEORY CARDS
     ==================================================================== */
  function theories(host, ctx) {
    var DATA = ctx.DATA || window.DATA || {};
    var list = (DATA.giantTheories && DATA.giantTheories.length) ? DATA.giantTheories : FALLBACK_THEORIES;
    var CONF = { strong: [3, 'Strong evidence'], likely: [2, 'Likely'], debated: [1, 'Still debated'] };
    var root = mk('section', 'giants-sec');
    root.innerHTML = '<h2 class="giants-h2">🔍 Big ideas about being big</h2><p class="giants-intro">Scientists have several ideas for why some dinosaurs became giants. Probably <b>many</b> of them played a part. Tap a card to open it.</p>';
    var wrap = mk('div', 'giants-cards');
    list.forEach(function (t, i) {
      var c = CONF[t.confidence] || CONF.debated;
      var card = mk('div', 'giants-theory');
      var head = mk('button', 'giants-theory-head');
      head.type = 'button'; head.setAttribute('aria-expanded', 'false');
      var bodyId = 'giants-th-' + i;
      head.setAttribute('aria-controls', bodyId);
      var meter = '<span class="giants-meter" aria-label="' + c[1] + '">';
      for (var k = 1; k <= 3; k++) meter += '<i class="' + (k <= c[0] ? 'on c' + c[0] : '') + '"></i>';
      meter += '</span>';
      head.innerHTML = '<span class="giants-emoji">' + esc(t.emoji || '💡') + '</span><span class="giants-th-text"><b>' + esc(t.title) + '</b><span>' + esc(t.oneLiner) + '</span></span><span class="giants-th-side">' + meter + '<em>' + c[1] + '</em></span><span class="giants-chev" aria-hidden="true">▾</span>';
      var body = mk('div', 'giants-theory-body'); body.id = bodyId; body.hidden = true;
      var ev = (t.evidence || []).map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('');
      body.innerHTML = '<p>' + esc(t.explanation) + '</p>' +
        (ev ? '<div class="giants-label">Clues scientists found</div><ul>' + ev + '</ul>' : '') +
        (t.evolutionLesson ? '<div class="giants-ns"><b>🌱 How natural selection explains it</b><p>' + esc(t.evolutionLesson) + '</p></div>' : '') +
        (t.counter ? '<div class="giants-counter"><b>🤔 But hold on...</b><p>' + esc(t.counter) + '</p></div>' : '');
      head.addEventListener('click', function () {
        var open = head.getAttribute('aria-expanded') === 'true';
        head.setAttribute('aria-expanded', open ? 'false' : 'true'); body.hidden = open; card.classList.toggle('is-open', !open);
      });
      card.appendChild(head); card.appendChild(body); wrap.appendChild(card);
    });
    root.appendChild(wrap);
    host.appendChild(root);
  }

  /* ====================================================================
     3. GROW-A-NECK
     ==================================================================== */
  function growNeck(host) {
    var N = 40, SHOW = 10, H = 0.4, pop, gen, means, hs, last, dead = null, busy = false, timers = [];
    var FOOD = { 0: 'No leaves up high', 0.4: 'Some leaves up high', 0.8: 'Lots of leaves up high' };
    function smooth(n) { var t = clamp((n - 0.3) / 0.4, 0, 1); return t * t * (3 - 2 * t); }
    function surv(n, h) { return clamp(0.1 + 0.85 * ((1 - h) * 0.6 + h * smooth(n) - 0.15 * n), 0.03, 0.97); }
    function neckM(n) { return 1 + 9 * n; }
    function init() { pop = []; for (var i = 0; i < N; i++) pop.push(clamp(0.3 + gauss() * 0.07, 0.05, 0.98)); gen = 0; means = [mean(pop)]; hs = []; last = null; dead = null; }
    init();
    var root = mk('section', 'giants-sec');
    root.innerHTML = '<h2 class="giants-h2">🦕 Mini-game: Grow-a-neck</h2><p class="giants-intro">A herd of 40 plant-eaters has necks of different lengths. Short necks reach low plants. Long necks reach juicy leaves high up, but long necks also cost more energy. Choose the food, then press <b>Next generation</b>.</p>';
    var scene = mk('div', 'giants-scene'), stats = mk('div', 'giants-stats'), chart = mk('div', 'giants-chart');
    var chips = mk('div', 'giants-chips'); chips.setAttribute('role', 'radiogroup');
    var chipB = {};
    [0, 0.4, 0.8].forEach(function (h) { var b = btn(FOOD[h], 'giants-chip', function () { H = h; sync(); drawScene(); }); b.setAttribute('role', 'radio'); chipB[h] = b; chips.appendChild(b); });
    var acts = mk('div', 'giants-actions');
    var bN = btn('Next generation ▶', 'giants-primary', function () { step(true); });
    var b10 = btn('+10', '', function () { for (var i = 0; i < 10; i++) step(false); renderAll(); });
    var b30 = btn('+30', '', function () { for (var i = 0; i < 30; i++) step(false); renderAll(); });
    var bR = btn('↺ Start over', 'giants-ghost', function () { timers.forEach(clearTimeout); busy = false; init(); renderAll(); });
    [bN, b10, b30, bR].forEach(function (b) { acts.appendChild(b); });
    var why = mk('div', 'giants-explain'); why.setAttribute('aria-live', 'polite');
    [scene, stats, chart, chips, acts, why].forEach(function (x) { root.appendChild(x); });
    host.appendChild(root);

    function sync() { Object.keys(chipB).forEach(function (k) { var on = (+k === H); chipB[k].classList.toggle('is-on', on); chipB[k].setAttribute('aria-checked', on ? 'true' : 'false'); }); }
    function drawScene() {
      var SA = window.SIMART;
      if (SA && SA['neck-short'] && SA['neck-medium'] && SA['neck-long'] && SA['tree-none']) {
        var tree = H > 0.6 ? SA['tree-lots'] : H > 0.2 ? SA['tree-some'] : SA['tree-none'];
        var html = '<div class="giants-gscene" role="img" aria-label="Herd of ' + N + ' plant-eaters. Average neck about ' + f1(neckM(mean(pop))) + ' metres. ' + (H > 0.6 ? 'Lots of leaves high up.' : H > 0.2 ? 'Some leaves high up.' : 'No leaves high up.') + '">' +
          '<img class="giants-gtree" src="' + tree.src + '" alt=""><div class="giants-herd">';
        pop.slice(0, SHOW).forEach(function (n, k) {
          var im = n < 0.3 ? SA['neck-short'] : n < 0.55 ? SA['neck-medium'] : SA['neck-long'];
          html += '<img class="giants-an' + (dead && dead[k] ? ' giants-dead' : '') + '" src="' + im.src + '" alt="">';
        });
        scene.innerHTML = html + '</div><span class="giants-gnote">10 of 40 shown</span></div>';
        return;
      }
      var W = 320, Ht = 190, g = 170, s = '<svg viewBox="0 0 ' + W + ' ' + Ht + '" role="img" aria-label="Herd of ' + N + ' plant-eaters. Average neck about ' + f1(neckM(mean(pop))) + ' metres.">' +
        '<rect width="' + W + '" height="' + Ht + '" rx="12" fill="#dff1fb"/><rect y="' + g + '" width="' + W + '" height="' + (Ht - g) + '" fill="#8cc96a"/>';
      var i, x, nk, hy;
      s += '<rect x="278" y="70" width="10" height="' + (g - 70) + '" fill="#8a5a2b"/>';
      s += '<ellipse cx="283" cy="62" rx="34" ry="30" fill="' + (H > 0 ? '#4fa04a' : '#b9c9a2') + '" opacity="' + (H > 0 ? 1 : 0.5) + '"/>';
      s += '<text x="283" y="66" text-anchor="middle" font-size="9" fill="#fff" font-weight="700">' + (H > 0.5 ? 'leaves!' : H > 0 ? 'some' : 'bare') + '</text>';
      for (i = 0; i < 6; i++) s += '<circle cx="' + (200 + i * 14) + '" cy="' + (g - 3) + '" r="5" fill="#5fb04a"/>';
      var shown = pop.slice(0, SHOW);
      shown.forEach(function (n, k) {
        x = 18 + k * 24; nk = 8 + 100 * n; hy = g - 12 - nk;
        var d = dead && dead[k];
        s += '<g class="giants-an' + (d ? ' giants-dead' : '') + '"><ellipse cx="' + x + '" cy="' + (g - 9) + '" rx="11" ry="7" fill="#6f9fd8"/>' +
          '<path d="M' + (x + 6) + ' ' + (g - 12) + ' L' + (x + 9) + ' ' + hy + '" stroke="#6f9fd8" stroke-width="6" stroke-linecap="round" fill="none"/>' +
          '<circle cx="' + (x + 11) + '" cy="' + (hy - 1) + '" r="4.5" fill="#6f9fd8"/><circle cx="' + (x + 12.5) + '" cy="' + (hy - 2) + '" r="1.2" fill="#222"/>' +
          '<rect x="' + (x - 6) + '" y="' + (g - 4) + '" width="4" height="4" fill="#4d78ad"/><rect x="' + (x + 4) + '" y="' + (g - 4) + '" width="4" height="4" fill="#4d78ad"/></g>';
      });
      s += '<text x="8" y="14" font-size="10" fill="#456">10 of 40 shown</text></svg>';
      scene.innerHTML = s;
    }
    function drawChart() {
      var maxG = Math.max(30, gen), gw = 280 / maxG, s = '<svg viewBox="0 0 300 130" role="img" aria-label="Average neck length over generations"><rect x="10" y="8" width="280" height="100" rx="6" fill="#fff"/>';
      var bands = { 0: '#f3e3c3', 0.4: '#e6f0d4', 0.8: '#cfe8c0' };
      hs.forEach(function (h, i) { s += '<rect x="' + (10 + i * gw) + '" y="8" width="' + gw + '" height="100" fill="' + bands[h] + '"/>'; });
      s += '<polyline fill="none" stroke="#2f6fb5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="' + means.map(function (m, i) { return (10 + i * gw).toFixed(1) + ',' + (8 + (1 - m) * 100).toFixed(1); }).join(' ') + '"/>';
      s += '<text x="10" y="124" font-size="10" fill="#555">generation 0</text><text x="290" y="124" font-size="10" text-anchor="end" fill="#555">' + maxG + '</text></svg>';
      chart.innerHTML = '<div class="giants-chart-title">Average neck length <span>(shading = how much high food there was)</span></div>' + s;
      stats.innerHTML = '<div><b>' + gen + '</b><span>generation</span></div><div><b>' + f1(neckM(mean(pop))) + ' m</b><span>average neck</span></div><div><b>' + f1(neckM(means[0])) + ' m</b><span>at the start</span></div>';
    }
    function explain() {
      var s = '<h4>What just happened?</h4>';
      if (!last) s += '<p>Generation 0: the herd has a mix of neck lengths, mostly medium. Nobody is "trying" to grow a longer neck. Pick the food, then press <b>Next generation</b>.</p>';
      else {
        var dir = last.after > last.before + 0.004 ? 'longer' : last.after < last.before - 0.004 ? 'shorter' : 'about the same';
        var cause = last.h > 0.5 ? 'There were lots of leaves up high that only long necks could reach. Short-necked animals ate less and had fewer babies.' : last.h > 0 ? 'Some leaves were up high. Long necks got extra food, but a long neck also costs energy.' : 'All the food was low down. A long neck gave no extra food and still cost energy, so <b>shorter</b> necks did slightly better.';
        s += '<p>' + cause + '</p><p><b>' + last.n + ' of ' + N + '</b> animals got enough food to have babies. Their necks averaged <b>' + f1(neckM(last.sm)) + ' m</b> (herd: ' + f1(neckM(last.before)) + ' m). Babies inherit neck length from parents, plus tiny random changes. The new herd averages <b>' + f1(neckM(last.after)) + ' m</b>: ' + dir + '.</p>' +
          '<p>No animal stretched its neck. The <b>herd</b> changed because the next generation came mostly from the animals whose necks worked best.</p>';
        if (gen >= 10) s += '<p class="giants-tip">There is no goal: change the food and the herd drifts the other way. A very long neck stops paying off once the extra energy cost outweighs the extra leaves.</p>';
      }
      why.innerHTML = s;
    }
    function renderAll() { drawScene(); drawChart(); explain(); [bN, b10, b30, bR].forEach(function (b) { b.disabled = busy; }); }
    function step(animate) {
      if (busy) return;
      var flags = pop.map(function (n) { return Math.random() < surv(n, H); });
      var sv = pop.filter(function (n, i) { return flags[i]; });
      if (sv.length < 2) { sv = pop.slice().sort(function (a, b) { return surv(b, H) - surv(a, H); }).slice(0, 2); flags = pop.map(function (n) { return sv.indexOf(n) >= 0; }); }
      var kids = []; for (var i = 0; i < N; i++) kids.push(clamp(pick(sv) + gauss() * 0.03, 0.05, 0.98));
      last = { h: H, before: mean(pop), sm: mean(sv), n: sv.length, after: mean(kids) };
      function commit() { pop = kids; gen++; means.push(mean(kids)); hs.push(H); dead = null; busy = false; renderAll(); }
      if (animate && !reduced()) {
        busy = true; dead = flags.map(function (f) { return !f; }); renderAll(); timers.push(setTimeout(commit, 750));
      } else { pop = kids; gen++; means.push(mean(kids)); hs.push(H); if (animate) renderAll(); }
    }
    sync(); renderAll();
    return function () { timers.forEach(clearTimeout); };
  }

  /* ====================================================================
     4. ISLAND DWARFING
     ==================================================================== */
  function islands(host, ctx) {
    var Art = ctx.Art || window.Art;
    var N = 30, pops, gen, hist, last;
    var ENV = { main: { pred: 0.7, scar: 0.1 }, isle: { pred: 0, scar: 0.9 } };
    function surv(s, e) { return clamp(0.9 - e.pred * (1 - s) * 0.8 - e.scar * s * 0.9, 0.05, 0.97); }
    function lenM(s) { return 4 + 16 * s; }
    function init() { pops = { main: [], isle: [] }; for (var i = 0; i < N; i++) { pops.main.push(clamp(0.6 + gauss() * 0.06, 0.05, 0.98)); pops.isle.push(clamp(0.6 + gauss() * 0.06, 0.05, 0.98)); } gen = 0; hist = [{ main: mean(pops.main), isle: mean(pops.isle) }]; last = null; }
    init();
    var root = mk('section', 'giants-sec');
    root.innerHTML = '<h2 class="giants-h2">🏝️ The twist: island dwarfs</h2><p class="giants-intro">Bigger is not always better. Take one plant-eating dinosaur group and put some on a <b>mainland</b> with hungry predators and some on a small <b>island</b> with no predators but not much food. Same animals, different places. Press <b>Next generation</b>.</p>';
    var panels = mk('div', 'giants-islands'), stats = mk('div', 'giants-stats'), chart = mk('div', 'giants-chart');
    var acts = mk('div', 'giants-actions');
    var bN = btn('Next generation ▶', 'giants-primary', function () { step(); });
    var b10 = btn('+10', '', function () { for (var i = 0; i < 10; i++) step(true); render(); });
    var b30 = btn('+30', '', function () { for (var i = 0; i < 30; i++) step(true); render(); });
    var bR = btn('↺ Start over', 'giants-ghost', function () { init(); render(); });
    [bN, b10, b30, bR].forEach(function (b) { acts.appendChild(b); });
    var why = mk('div', 'giants-explain'); why.setAttribute('aria-live', 'polite');
    var real = mk('div', 'giants-real', '<b>🦕 It really happened.</b> <i>Europasaurus</i> lived about 154 million years ago on an island in what is now Germany. It was a sauropod only about 6 metres long. Its mainland cousins were much bigger. Many scientists think island life shrank its ancestors over generations (still being studied). Dwarf elephants on islands are another example.');
    [panels, stats, chart, acts, why, real].forEach(function (x) { root.appendChild(x); });
    host.appendChild(root);

    function step(silent) {
      var before = { main: mean(pops.main), isle: mean(pops.isle) }, info = {};
      ['main', 'isle'].forEach(function (k) {
        var e = ENV[k], sv = pops[k].filter(function (s) { return Math.random() < surv(s, e); });
        if (sv.length < 2) sv = pops[k].slice().sort(function (a, b) { return surv(b, e) - surv(a, e); }).slice(0, 2);
        var kids = []; for (var i = 0; i < N; i++) kids.push(clamp(pick(sv) + gauss() * 0.03, 0.05, 0.98));
        info[k] = sv.length; pops[k] = kids;
      });
      gen++; hist.push({ main: mean(pops.main), isle: mean(pops.isle) });
      last = { before: before, after: hist[hist.length - 1], n: info };
      if (!silent) render();
    }
    function creature(s, col, label, extra) {
      var scale = 0.35 + 0.65 * s, art = '';
      if (window.SIMART && window.SIMART['island-sauropod']) {
        return '<div class="giants-isle"><div class="giants-isle-title">' + label + '</div><div class="giants-isle-box"><div class="giants-isle-art" style="width:' + Math.round(scale * 100) + '%"><img src="' + window.SIMART['island-sauropod'].src + '" alt="" style="width:100%;height:auto;display:block"></div></div><div class="giants-isle-len">average length about <b>' + f1(lenM(s)) + ' m</b></div><div class="giants-isle-note">' + extra + '</div></div>';
      }
      try { if (Art && Art.svg) art = Art.svg('brachiosaurus'); else if (window.ART && window.ART.brachiosaurus) art = window.ART.brachiosaurus; } catch (e) { art = ''; }
      return '<div class="giants-isle"><div class="giants-isle-title">' + label + '</div><div class="giants-isle-box"><div class="giants-isle-art" style="width:' + Math.round(scale * 100) + '%">' + (art || dinoSvg(col)) + '</div></div><div class="giants-isle-len">average length about <b>' + f1(lenM(s)) + ' m</b></div><div class="giants-isle-note">' + extra + '</div></div>';
    }
    function render() {
      var a = hist[hist.length - 1];
      panels.innerHTML = creature(a.main, '#6f9fd8', '🏞️ Mainland', 'Hungry predators. Small bodies get eaten, so bigger is safer.') + creature(a.isle, '#e39a5a', '🏝️ Island', 'No predators, but little food. Big bodies need lots of food, so smaller is better.');
      stats.innerHTML = '<div><b>' + gen + '</b><span>generation</span></div><div><b>' + f1(lenM(a.main)) + ' m</b><span>mainland average</span></div><div><b>' + f1(lenM(a.isle)) + ' m</b><span>island average</span></div>';
      var maxG = Math.max(30, gen), gw = 280 / maxG, line = function (k, col) { return '<polyline fill="none" stroke="' + col + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="' + hist.map(function (h, i) { return (10 + i * gw).toFixed(1) + ',' + (8 + (1 - h[k]) * 100).toFixed(1); }).join(' ') + '"/>'; };
      chart.innerHTML = '<div class="giants-chart-title">Average body size <span><b style="color:#2f6fb5">blue = mainland</b>, <b style="color:#d9742c">orange = island</b></span></div><svg viewBox="0 0 300 130" role="img" aria-label="Body size over generations on mainland and island"><rect x="10" y="8" width="280" height="100" rx="6" fill="#fff"/>' + line('main', '#2f6fb5') + line('isle', '#d9742c') + '<text x="10" y="124" font-size="10" fill="#555">generation 0</text><text x="290" y="124" font-size="10" text-anchor="end" fill="#555">' + maxG + '</text></svg>';
      var s = '<h4>What just happened?</h4>';
      if (!last) s += '<p>Both groups start the same: a mix of body sizes, mostly medium-big. The only difference is <b>where they live</b>. Nobody is aiming to be big or small.</p>';
      else {
        var dm = last.after.main - last.before.main, di = last.after.isle - last.before.isle;
        s += '<p>On the <b>mainland</b>, a small body was risky (predators), so bigger animals survived a bit more often. The average moved ' + (dm >= 0 ? 'bigger' : 'smaller') + '. On the <b>island</b> there were no predators, and a big body just meant needing more food. Smaller animals did better, so the average moved ' + (di >= 0 ? 'bigger (by chance this time)' : 'smaller') + '.</p>' +
          '<p>Same starting animals, opposite directions. That shows <b>size is not a goal</b>. It is whatever works in that place and time, and it happens to the <b>population</b> over generations.</p>';
      }
      why.innerHTML = s;
    }
    render();
    return function () { };
  }

  /* ====================================================================
     VIEW
     ==================================================================== */
  Views.giants = {
    title: 'Why so big?',
    icon: '🦕',
    mount: function (el, ctx) {
      ctx = ctx || {};
      el.innerHTML = '';
      var wrap = mk('div', 'giants-view');
      wrap.innerHTML = '<header class="giants-hero"><h2>🦕 Why did dinosaurs get so big?</h2><p>The biggest dinosaurs, the long-necked <b>sauropods</b>, were the largest land animals ever. Scientists think several things helped. Nobody is sure which mattered most.</p></header>';
      var d = [];
      [sizeComparison, theories, growNeck, islands].forEach(function (fn) {
        var box = mk('div', 'giants-block'); wrap.appendChild(box);
        try { var r = fn(box, ctx); if (typeof r === 'function') d.push(r); } catch (e) { box.innerHTML = '<p class="giants-hint">This part could not load.</p>'; if (window.console) console.error(e); }
      });
      var ng = mk('section', 'giants-sec giants-nogoal');
      ng.innerHTML = '<h2 class="giants-h2">🧭 Remember: no goal</h2><p>Dinosaurs did not "want" to be big. In a population, bigger animals sometimes survived and had babies more often, so the average size crept up over many generations. And on an island, small was better. Big is not "more advanced", it is just one way to fit a place and time.</p>';
      wrap.appendChild(ng);
      el.appendChild(wrap);
      return function () { d.forEach(function (f) { try { f(); } catch (e) { } }); };
    }
  };
})();
