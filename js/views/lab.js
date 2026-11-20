/* Lab view: "How evolution works" - story cards + 3 simulations.
   Views.lab = { title, icon, mount(el, ctx) } ; mount returns destroy(). */
(function () {
  'use strict';
  window.Views = window.Views || {};

  /* ---------- tiny helpers ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function mk(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function btn(label, cls, fn) {
    var b = mk('button', 'lab-btn ' + (cls || ''), label);
    b.type = 'button';
    if (fn) b.addEventListener('click', fn);
    return b;
  }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function gauss() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return a.length ? s / a.length : 0; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function pickW(items, w) {
    var t = 0, i;
    for (i = 0; i < w.length; i++) t += w[i];
    var r = Math.random() * t;
    for (i = 0; i < items.length; i++) { r -= w[i]; if (r <= 0) return items[i]; }
    return items[items.length - 1];
  }
  function reduced() {
    try { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function f1(x) { return (Math.round(x * 10) / 10).toFixed(1); }

  /* ---------- fallback concepts (used only if DATA lacks them) ---------- */
  var FALLBACK = [
    { id: 'variation', emoji: '🎲', title: 'Everyone is a little different', kidExplain: 'In any group of animals, no two are exactly alike. Some have thicker beaks, some are darker, some are taller.',
      example: { setup: 'A flock of small birds lives on an island.', steps: ['Some birds have thin beaks.', 'Some have thick beaks.', 'Most are in between.'], punchline: 'Differences are the raw material for evolution.' },
      misconception: 'Animals do not choose their differences. They are born with them.', tryItNote: 'Open Seed Beaks and look at the flock.' },
    { id: 'inheritance', emoji: '🧬', title: 'Chicks are like their parents', kidExplain: 'Many traits are passed on through DNA, so chicks tend to get beaks like their parents.',
      example: { setup: 'A thick-beaked bird has chicks.', steps: ['The chicks get a copy of her DNA.', 'Most chicks have thick beaks too.', 'A few are slightly different (a copy mistake called a mutation).'], punchline: 'Traits travel down the generations.' },
      misconception: 'Things an animal learns or practises in its life (like big muscles) are not passed on through DNA.', tryItNote: 'Watch how chicks in Seed Beaks resemble their parents.' },
    { id: 'selection', emoji: '🍀', title: 'Some survive and have more chicks', kidExplain: 'Whoever fits their surroundings best is a bit more likely to survive and have chicks. This is natural selection. It is not a contest anyone plans.',
      example: { setup: 'A drought leaves only hard seeds.', steps: ['Thick-beaked birds can crack them.', 'Thin-beaked birds go hungry.', 'More thick-beaked birds have chicks.'], punchline: 'Next generation: more thick beaks in the flock.' },
      misconception: 'Nobody is "trying". It simply happens, like sorting with a sieve.', tryItNote: 'Press Drought in Seed Beaks.' },
    { id: 'time', emoji: '⏳', title: 'It takes many generations', kidExplain: 'One generation changes the flock only a tiny bit. Millions of years add up to big differences.',
      example: { setup: 'Small shifts, again and again.', steps: ['Generation 1: tiny shift.', 'Generation 30: clearly different.', 'Generation 1,000,000: a new kind of animal.'], punchline: 'Populations change. Individuals do not.' },
      misconception: 'A single animal never evolves during its life.', tryItNote: 'Run 30 generations in any sim.' },
    { id: 'ancestor', emoji: '🌳', title: 'A family tree of everything', kidExplain: 'Groups that get separated drift apart. Today\'s cousins share a common ancestor. Cousins are not ancestors of each other.',
      example: { setup: 'One group gets split by a river.', steps: ['Each side collects different changes.', 'Over time they look different.', 'Now they are cousin species.'], punchline: 'Crocodiles and birds are archosaur cousins.' },
      misconception: 'Modern animals are not our ancestors. They are cousins on their own branch.', tryItNote: 'Build a tree in Family Tree Maker.' },
    { id: 'nogoal', emoji: '🧭', title: 'No goal, no ladder', kidExplain: 'Evolution has no target and no top step. A trait that helps in one place can hurt in another.',
      example: { setup: 'The weather flips from drought to wet.', steps: ['Thin beaks do a bit better now.', 'The average beak drifts back.', 'Nothing was "aiming" anywhere.'], punchline: 'Fits the place and time, that is all.' },
      misconception: 'Humans are not the "final form". Every living thing is equally evolved.', tryItNote: 'Flip the weather in Seed Beaks.' }
  ];

  /* ====================================================================
     SIM 1: SEED BEAKS
     ==================================================================== */
  var BIRD_COL = '#7fb6e8';
  function beakSvg(t) {
    var d = 4 + 13 * t, len = 9 + 7 * t;
    return '<svg viewBox="0 0 56 44" aria-hidden="true" focusable="false">' +
      '<ellipse cx="22" cy="24" rx="17" ry="15" fill="' + BIRD_COL + '"/>' +
      '<ellipse cx="20" cy="31" rx="10" ry="7" fill="#e9f3fb"/>' +
      '<polygon points="36,' + (22 - d / 2) + ' ' + (36 + len) + ',' + (23 + d * 0.15) + ' 36,' + (22 + d / 2) +
      '" fill="#f2a43a" stroke="#d9831a" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<circle cx="28" cy="18" r="3.6" fill="#fff"/><circle cx="29" cy="18" r="2" fill="#222"/></svg>';
  }

  function seedBeaks(host, ctx) {
    var N = 40, BINS = 12;
    var YEARS = {
      wet: { soft: 0.85, hard: 0.15, name: 'Wet year', emoji: '🌧️', col: '#cfe8f7' },
      normal: { soft: 0.5, hard: 0.5, name: 'Normal year', emoji: '⛅', col: '#e6e6e6' },
      dry: { soft: 0.1, hard: 0.9, name: 'Drought', emoji: '☀️', col: '#f8d9a0' }
    };
    var pop, gen, means, log, mode = 'dry', startHist, last, busy = false, timers = [], dead = null, alive = true;
    function mm(t) { return 6 + 8 * t; }
    function survP(b, Y) {
      var sa = 1 - 0.35 * b, ha = Math.min(1, 1.1 * Math.pow(b, 1.6));
      return 0.08 + 0.85 * (Y.soft * sa + Y.hard * ha);
    }
    function histo(a) {
      var h = []; for (var i = 0; i < BINS; i++) h.push(0);
      a.forEach(function (b) { h[Math.min(BINS - 1, Math.floor(b * BINS))]++; });
      return h;
    }
    function init() {
      pop = []; for (var i = 0; i < N; i++) pop.push(clamp(0.4 + gauss() * 0.1, 0.05, 0.98));
      gen = 0; means = [mean(pop)]; log = []; startHist = histo(pop); last = null; dead = null;
    }
    init();

    var root = mk('div', 'lab-sim');
    root.innerHTML = '<h3 class="lab-sim-title">🐦 Seed Beaks</h3>' +
      '<p class="lab-intro">A flock of 40 small birds eats seeds. Soft seeds are easy. Hard seeds need a thick, strong beak. Pick the weather, then press <b>Next generation</b>.</p>';
    var seedsEl = mk('div', 'lab-seeds');
    var flock = mk('div', 'lab-flock');
    flock.setAttribute('role', 'img');
    var charts = mk('div', 'lab-charts');
    var histEl = mk('div', 'lab-chart'), trendEl = mk('div', 'lab-chart');
    charts.appendChild(histEl); charts.appendChild(trendEl);
    var stats = mk('div', 'lab-stats');
    var controls = mk('div', 'lab-controls');
    var weatherRow = mk('div', 'lab-chips'); weatherRow.setAttribute('role', 'radiogroup'); weatherRow.setAttribute('aria-label', 'Weather');
    var modeBtns = {};
    [['wet', '🌧️ Wet year'], ['normal', '⛅ Normal'], ['dry', '☀️ Drought'], ['random', '🎲 Random']].forEach(function (m) {
      var b = btn(m[1], 'lab-chip', function () { mode = m[0]; syncMode(); drawSeeds(); });
      b.setAttribute('role', 'radio'); modeBtns[m[0]] = b; weatherRow.appendChild(b);
    });
    var actions = mk('div', 'lab-actions');
    var bNext = btn('Next generation ▶', 'lab-primary', function () { step(true); });
    var b10 = btn('+10', '', function () { for (var i = 0; i < 10; i++) step(false); renderAll(); });
    var b30 = btn('+30', '', function () { for (var i = 0; i < 30; i++) step(false); renderAll(); });
    var bReset = btn('↺ Start over', 'lab-ghost', function () { clearT(); busy = false; init(); renderAll(); explain(); });
    [bNext, b10, b30, bReset].forEach(function (b) { actions.appendChild(b); });
    controls.appendChild(weatherRow); controls.appendChild(actions);
    var why = mk('div', 'lab-explain'); why.setAttribute('aria-live', 'polite');
    [seedsEl, flock, stats, charts, controls, why].forEach(function (x) { root.appendChild(x); });
    host.appendChild(root);

    function clearT() { timers.forEach(clearTimeout); timers = []; }
    function syncMode() {
      Object.keys(modeBtns).forEach(function (k) {
        modeBtns[k].classList.toggle('is-on', k === mode);
        modeBtns[k].setAttribute('aria-checked', k === mode ? 'true' : 'false');
      });
    }
    function drawSeeds() {
      var Y = YEARS[mode] || { soft: 0.5, hard: 0.5, name: 'Random weather', emoji: '🎲' };
      var s = '<svg viewBox="0 0 300 54" aria-hidden="true" focusable="false"><rect width="300" height="54" rx="12" fill="' + (Y.col || '#f1ead7') + '"/>';
      var total = 24, hard = Math.round(Y.hard * total), i, x, y;
      for (i = 0; i < total; i++) {
        x = 18 + (i % 12) * 23 + ((i * 7) % 5); y = 17 + Math.floor(i / 12) * 22 + ((i * 3) % 4);
        if (i < hard) s += '<ellipse cx="' + x + '" cy="' + y + '" rx="8" ry="6.5" fill="#8a5a2b" stroke="#5c3a17" stroke-width="1.5"/>';
        else s += '<ellipse cx="' + x + '" cy="' + y + '" rx="4" ry="2.8" fill="#9ccf6a" stroke="#6ea23b"/>';
      }
      s += '</svg>';
      seedsEl.innerHTML = '<div class="lab-seed-label">' + Y.emoji + ' ' + esc(Y.name) + ': <span>big brown = hard seeds, little green = soft seeds</span></div>' + s;
    }
    function renderFlock() {
      var s = '';
      for (var i = 0; i < pop.length; i++) {
        s += '<div class="lab-bird' + (dead && dead[i] ? ' lab-dead' : '') + '">' + beakSvg(pop[i]) + '</div>';
      }
      flock.innerHTML = s;
      flock.setAttribute('aria-label', 'Flock of ' + pop.length + ' birds. Average beak depth ' + f1(mm(mean(pop))) + ' millimetres.');
    }
    function renderCharts() {
      var h = histo(pop), W = 300, H = 120, bw = (W - 20) / BINS, i, s;
      s = '<svg viewBox="0 0 300 152" role="img" aria-label="Histogram of beak thickness"><rect x="10" y="6" width="280" height="' + (H - 6) + '" fill="#fff" rx="6"/>';
      for (i = 0; i < BINS; i++) {
        var bh = h[i] / 20 * (H - 16), sh = startHist[i] / 20 * (H - 16);
        s += '<rect x="' + (10 + i * bw + 2) + '" y="' + (H - bh) + '" width="' + (bw - 4) + '" height="' + bh + '" rx="3" fill="#f2a43a"/>';
        if (gen > 0) s += '<rect x="' + (10 + i * bw + 2) + '" y="' + (H - sh) + '" width="' + (bw - 4) + '" height="' + sh + '" rx="3" fill="none" stroke="#555" stroke-dasharray="3 2"/>';
      }
      var mx = 10 + mean(pop) * (W - 20);
      s += '<polygon points="' + (mx - 6) + ',' + (H + 12) + ' ' + (mx + 6) + ',' + (H + 12) + ' ' + mx + ',' + (H + 2) + '" fill="#d6452b"/>';
      s += '<text x="10" y="150" font-size="10" fill="#555">thin beaks</text><text x="290" y="150" font-size="10" text-anchor="end" fill="#555">thick beaks</text></svg>';
      histEl.innerHTML = '<div class="lab-chart-title">How many birds have each beak <span>(dashed = generation 0)</span></div>' + s;

      var maxG = Math.max(30, gen), TW = 280, TH = 100, ty = function (v) { return 8 + (1 - v) * TH; };
      s = '<svg viewBox="0 0 300 130" role="img" aria-label="Average beak thickness over generations"><rect x="10" y="8" width="280" height="' + TH + '" fill="#fff" rx="6"/>';
      var gw = TW / maxG;
      for (i = 0; i < log.length; i++) s += '<rect x="' + (10 + i * gw) + '" y="8" width="' + gw + '" height="' + TH + '" fill="' + YEARS[log[i]].col + '"/>';
      var pts = means.map(function (m, k) { return (10 + k * gw).toFixed(1) + ',' + ty(m).toFixed(1); }).join(' ');
      s += '<polyline points="' + pts + '" fill="none" stroke="#d6452b" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>';
      s += '<text x="10" y="126" font-size="10" fill="#555">generation 0</text><text x="290" y="126" font-size="10" text-anchor="end" fill="#555">' + maxG + '</text></svg>';
      trendEl.innerHTML = '<div class="lab-chart-title">Average beak over time <span>(bands = weather)</span></div>' + s;
      stats.innerHTML = '<div><b>' + gen + '</b><span>generation</span></div><div><b>' + f1(mm(mean(pop))) + ' mm</b><span>average beak depth</span></div><div><b>' + f1(mm(means[0])) + ' mm</b><span>where we started</span></div>';
    }
    function renderAll() { renderFlock(); renderCharts(); updateBtns(); explain(); }
    function updateBtns() { [bNext, b10, b30, bReset].forEach(function (b) { b.disabled = busy; }); }

    function step(animate) {
      if (busy) return;
      var key = mode === 'random' ? pick(['wet', 'normal', 'dry']) : mode, Y = YEARS[key];
      var surv = pop.map(function (b) { return Math.random() < survP(b, Y); });
      var sv = pop.filter(function (b, i) { return surv[i]; });
      if (sv.length < 2) { // always keep at least the two best fed
        var order = pop.slice().sort(function (a, b) { return survP(b, Y) - survP(a, Y); });
        sv = order.slice(0, 2); surv = pop.map(function (b) { return sv.indexOf(b) >= 0; });
      }
      var kids = [];
      for (var i = 0; i < N; i++) kids.push(clamp(pick(sv) + gauss() * 0.03, 0.05, 0.98));
      var before = mean(pop);
      last = { key: key, before: before, survMean: mean(sv), nSurv: sv.length, after: mean(kids) };
      function commit() {
        pop = kids; gen++; means.push(mean(kids)); log.push(key); dead = null; busy = false; renderAll();
      }
      if (animate && !reduced()) {
        busy = true; dead = surv.map(function (s) { return !s; }); renderFlock(); updateBtns();
        timers.push(setTimeout(commit, 750));
      } else { busy = false; commit_nodraw(); }
      function commit_nodraw() { pop = kids; gen++; means.push(mean(kids)); log.push(key); dead = null; if (animate) renderAll(); }
    }
    function explain() {
      var s = '<h4>What just happened?</h4>';
      if (!last) {
        s += '<p>Right now it is generation 0. The flock has a mix of beaks, mostly in the middle. Nobody has been picked yet. Choose a weather and press <b>Next generation</b>.</p>' +
          '<p class="lab-tip">Big idea: <b>variation</b> (birds differ) + <b>inheritance</b> (chicks copy parents) + <b>selection</b> (some survive more often).</p>';
      } else {
        var Y = YEARS[last.key], dir = last.after > last.before + 0.004 ? 'thicker' : last.after < last.before - 0.004 ? 'thinner' : 'about the same';
        var cause = last.key === 'dry' ? 'Soft seeds ran out. Only hard seeds were left, and <b>thick beaks</b> can crack them. Thin-beaked birds went hungry.' :
          last.key === 'wet' ? 'Soft seeds were everywhere. Any beak could eat, and slimmer beaks were slightly better at picking up small seeds. So the pressure was gentle.' :
            'There were both kinds of seeds, so almost every beak worked. Not much pressure either way.';
        s += '<p>' + Y.emoji + ' <b>' + esc(Y.name) + '.</b> ' + cause + '</p>' +
          '<p><b>' + last.nSurv + ' of ' + N + '</b> birds got enough food to have chicks. The survivors\' beaks averaged <b>' + f1(mm(last.survMean)) + ' mm</b> (the whole flock was ' + f1(mm(last.before)) + ' mm). Their chicks inherited beaks like theirs, plus tiny random differences. The new flock averages <b>' + f1(mm(last.after)) + ' mm</b>: ' + dir + '.</p>' +
          '<p>No bird grew a new beak. The <b>flock</b> changed because the next generation came mostly from the birds that fitted the weather.</p>';
        if (gen >= 5) {
          s += '<p class="lab-tip">After ' + gen + ' generations the average moved from ' + f1(mm(means[0])) + ' mm to ' + f1(mm(means[means.length - 1])) + ' mm. Now flip the weather. The flock will drift the other way. There is no goal, just "what works this year".</p>';
        }
      }
      why.innerHTML = s;
    }
    syncMode(); drawSeeds(); renderAll();
    return function () { alive = false; clearT(); };
  }

  /* ====================================================================
     SIM 2: CAMOUFLAGE CRITTERS
     ==================================================================== */
  var STOPS = [[0, [217, 69, 61]], [0.2, [240, 154, 58]], [0.38, [240, 207, 63]], [0.6, [93, 184, 74]], [0.8, [61, 147, 207]], [1, [139, 95, 196]]];
  function palette(c, shade) {
    c = clamp(c, 0, 1);
    var i = 0; while (i < STOPS.length - 2 && c > STOPS[i + 1][0]) i++;
    var a = STOPS[i], b = STOPS[i + 1], t = (c - a[0]) / (b[0] - a[0]), rgb = [];
    for (var k = 0; k < 3; k++) {
      var v = a[1][k] + (b[1][k] - a[1][k]) * t;
      v = shade > 0 ? v + (255 - v) * shade : v * (1 + shade);
      rgb.push(Math.round(clamp(v, 0, 255)));
    }
    return 'rgb(' + rgb.join(',') + ')';
  }

  function camoCritters(host) {
    var N = 30, MEALS = 10, W = 320, H = 210;
    var BGS = {
      meadow: { name: '🌿 Green meadow', c: 0.6 },
      flowers: { name: '🌼 Yellow flowers', c: 0.38 },
      berries: { name: '🍓 Red berries', c: 0.0 }
    };
    var bgKey = 'meadow', pop, gen, hist, eaten, busy = false, last = null, specks = [], timers = [];
    function newPos() { return { x: 18 + Math.random() * (W - 36), y: 18 + Math.random() * (H - 36), a: Math.random() * 180 }; }
    function init() {
      pop = []; for (var i = 0; i < N; i++) { var p = newPos(); p.c = Math.random(); p.gone = false; pop.push(p); }
      gen = 0; hist = [pop.map(function (p) { return p.c; }).sort()]; eaten = 0; last = null; makeSpecks();
    }
    function makeSpecks() {
      specks = []; var bc = BGS[bgKey].c;
      for (var i = 0; i < 110; i++) specks.push({ x: Math.random() * W, y: Math.random() * H, rx: 4 + Math.random() * 7, ry: 2.5 + Math.random() * 4, a: Math.random() * 180, c: bc + (Math.random() - 0.5) * 0.1, s: (Math.random() - 0.5) * 0.35 });
    }
    function mismatch(c) { return Math.abs(c - BGS[bgKey].c); }
    function meanMis() { return mean(pop.map(function (p) { return mismatch(p.c); })); }
    init();

    var root = mk('div', 'lab-sim');
    root.innerHTML = '<h3 class="lab-sim-title">🐞 Camouflage Critters</h3>' +
      '<p class="lab-intro">You are a hungry bird! <b>Tap the critters you can find</b> to eat ' + MEALS + ' of them. The ones you miss have babies. Watch what happens to their colours.</p>';
    var bgRow = mk('div', 'lab-chips'); bgRow.setAttribute('role', 'radiogroup'); bgRow.setAttribute('aria-label', 'Background');
    var bgBtns = {};
    Object.keys(BGS).forEach(function (k) {
      var b = btn(BGS[k].name, 'lab-chip', function () { bgKey = k; makeSpecks(); syncBg(); render(); });
      b.setAttribute('role', 'radio'); bgBtns[k] = b; bgRow.appendChild(b);
    });
    var meter = mk('div', 'lab-meter');
    var stage = mk('div', 'lab-camo');
    var stats = mk('div', 'lab-stats');
    var histEl = mk('div', 'lab-chart');
    var actions = mk('div', 'lab-actions');
    var bAuto = btn('🤖 Auto-bird ×10 generations', '', function () { autoRun(10); });
    var bReset = btn('↺ Start over', 'lab-ghost', function () { clearT(); busy = false; init(); render(); explain(); });
    actions.appendChild(bAuto); actions.appendChild(bReset);
    var why = mk('div', 'lab-explain'); why.setAttribute('aria-live', 'polite');
    [bgRow, meter, stage, stats, histEl, actions, why].forEach(function (x) { root.appendChild(x); });
    host.appendChild(root);

    function clearT() { timers.forEach(clearTimeout); timers = []; }
    function syncBg() { Object.keys(bgBtns).forEach(function (k) { bgBtns[k].classList.toggle('is-on', k === bgKey); bgBtns[k].setAttribute('aria-checked', k === bgKey ? 'true' : 'false'); }); }
    function render() {
      var bc = BGS[bgKey].c, s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="lab-camo-svg" role="group" aria-label="Meadow with ' + N + ' critters. Tap critters to eat them.">' +
        '<rect width="' + W + '" height="' + H + '" fill="' + palette(bc, -0.05) + '"/>';
      specks.forEach(function (p) { s += '<ellipse cx="' + p.x.toFixed(1) + '" cy="' + p.y.toFixed(1) + '" rx="' + p.rx.toFixed(1) + '" ry="' + p.ry.toFixed(1) + '" transform="rotate(' + p.a.toFixed(0) + ' ' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')" fill="' + palette(p.c, p.s) + '"/>'; });
      pop.forEach(function (p, i) {
        if (p.gone) {
          s += '<text x="' + p.x.toFixed(1) + '" y="' + (p.y + 5).toFixed(1) + '" text-anchor="middle" font-size="14" class="lab-puff">💨</text>';
        } else {
          s += '<g class="lab-critter" data-i="' + i + '" transform="translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') rotate(' + p.a.toFixed(0) + ')">' +
            '<ellipse rx="9" ry="6.3" fill="' + palette(p.c, 0) + '"/><circle cx="-8" r="1" fill="' + palette(p.c, -0.25) + '"/>' +
            '<circle r="15" fill="transparent"/></g>';
        }
      });
      s += '</svg>';
      stage.innerHTML = s;
      meter.innerHTML = '<span>Meals: <b>' + eaten + ' / ' + MEALS + '</b></span><span class="lab-meals">' + new Array(MEALS + 1).join('·').split('').map(function (d, k) { return k < eaten ? '🍽️' : '○'; }).join(' ') + '</span>';
      stats.innerHTML = '<div><b>' + gen + '</b><span>generation</span></div><div><b>' + Math.round(meanMis() * 100) + '%</b><span>average colour mismatch</span></div><div><b>' + (BGS[bgKey].name.split(' ').slice(1).join(' ')) + '</b><span>background</span></div>';
      renderHist();
      bAuto.disabled = busy; bReset.disabled = busy;
    }
    function renderHist() {
      var cols = hist.slice(-30), cw = 280 / 30, s = '<svg viewBox="0 0 300 120" role="img" aria-label="Critter colours in each generation"><rect x="10" y="6" width="280" height="96" rx="6" fill="#fff"/>';
      cols.forEach(function (g, i) {
        g.forEach(function (c, k) { s += '<rect x="' + (10 + i * cw).toFixed(1) + '" y="' + (6 + k * 3.2).toFixed(1) + '" width="' + (cw - 0.5).toFixed(1) + '" height="3.3" fill="' + palette(c, 0) + '"/>'; });
      });
      var off = hist.length - cols.length;
      s += '<text x="10" y="116" font-size="10" fill="#555">generation ' + off + '</text><text x="290" y="116" font-size="10" text-anchor="end" fill="#555">' + (hist.length - 1) + '</text></svg>';
      histEl.innerHTML = '<div class="lab-chart-title">Every critter\'s colour, each generation <span>(one column = one generation)</span></div>' + s;
    }
    stage.addEventListener('pointerdown', function (ev) {
      var g = ev.target.closest && ev.target.closest('.lab-critter');
      if (!g || busy) return;
      ev.preventDefault();
      eat(+g.getAttribute('data-i'));
    });
    function eat(i) {
      var p = pop[i]; if (!p || p.gone) return;
      p.gone = true; eaten++; render();
      if (eaten >= MEALS) { busy = true; render(); timers.push(setTimeout(function () { endRound(); }, reduced() ? 100 : 800)); }
    }
    function endRound() {
      var before = meanMis(), beforeC = mean(pop.map(function (p) { return p.c; }));
      var survivors = pop.filter(function (p) { return !p.gone; });
      var eatenMis = mean(pop.filter(function (p) { return p.gone; }).map(function (p) { return mismatch(p.c); }));
      var survMis = mean(survivors.map(function (p) { return mismatch(p.c); }));
      var np = [];
      for (var i = 0; i < N; i++) { var par = pick(survivors), q = newPos(); q.c = clamp(par.c + gauss() * 0.04, 0, 1); q.gone = false; np.push(q); }
      pop = np; gen++; eaten = 0; busy = false;
      hist.push(pop.map(function (p) { return p.c; }).sort());
      last = { eatenMis: eatenMis, survMis: survMis, before: before, after: meanMis(), bg: bgKey, beforeC: beforeC };
      render(); explain();
    }
    function autoRun(n) {
      if (busy) return; busy = true; render();
      var k = 0;
      (function go() {
        // simulated bird: easier to spot = more contrast with the background
        var pool = pop.slice(), picks = [];
        for (var m = 0; m < MEALS; m++) {
          var w = pool.map(function (p) { return 0.05 + Math.pow(Math.min(1, mismatch(p.c) * 2.2), 1.5); });
          var pk = pickW(pool, w); picks.push(pk); pool.splice(pool.indexOf(pk), 1);
        }
        picks.forEach(function (p) { p.gone = true; });
        endRound(); busy = true; render();
        if (++k < n) timers.push(setTimeout(go, reduced() ? 10 : 120)); else { busy = false; render(); }
      })();
    }
    function explain() {
      var s = '<h4>What just happened?</h4>';
      if (!last) {
        s += '<p>Generation 0: critters come in every colour, all mixed up. Some stand out, some blend in. As the bird, you will naturally spot the bright ones first.</p>' +
          '<p class="lab-tip">Try it: eat ' + MEALS + ' critters, then look at the colour columns below. Try switching the background halfway through!</p>';
      } else {
        var better = last.survMis < last.eatenMis;
        s += '<p>You (the bird) ate ' + MEALS + ' critters. The ones you ate stood out more: average colour mismatch <b>' + Math.round(last.eatenMis * 100) + '%</b>. The ones that escaped matched better: <b>' + Math.round(last.survMis * 100) + '%</b>' + (better ? '.' : '. (This time luck was against the matching ones, which happens!)') + '</p>' +
          '<p>The survivors had babies. Babies are about the same colour as their parents, with tiny random changes. The whole population\'s mismatch went from <b>' + Math.round(last.before * 100) + '%</b> to <b>' + Math.round(last.after * 100) + '%</b>.</p>' +
          '<p>No critter changed colour to hide. Predators removed the easy-to-see ones, so the population became better hidden over generations.</p>';
        if (gen >= 8) s += '<p class="lab-tip">After ' + gen + ' generations, the colour columns bunch around the background. Now switch the background. The colours will slowly swing to match the new one. There is no "right" colour, only what works <i>here</i>.</p>';
      }
      why.innerHTML = s;
    }
    syncBg(); render(); explain();
    return function () { clearT(); };
  }

  /* ====================================================================
     SIM 3: FAMILY TREE MAKER
     ==================================================================== */
  var GENES = ['hue', 'size', 'tail', 'spots', 'ears', 'fluff'];
  function critterSvg(g) {
    var s = 0.7 + 0.6 * g.size, hue = Math.round(10 + g.hue * 300), body = 'hsl(' + hue + ',62%,62%)', dark = 'hsl(' + hue + ',55%,40%)';
    var tailL = 6 + 22 * g.tail, earL = 3 + 11 * g.ears, bx = 30, by = 32, rx = 15 * s, ry = 10.5 * s, hx = bx + rx - 2, hy = by - ry * 0.6, hr = 7.5 * s;
    var o = '<svg viewBox="0 0 70 56" aria-hidden="true" focusable="false">';
    o += '<path d="M' + (bx - rx + 2) + ',' + by + ' q-' + (tailL * 0.5) + ',-' + (tailL * 0.7) + ' -' + tailL + ',-' + (tailL * 0.3) + '" fill="none" stroke="' + dark + '" stroke-width="' + (2.5 + s) + '" stroke-linecap="round"/>';
    o += '<rect x="' + (bx - rx * 0.5) + '" y="' + (by + ry * 0.5) + '" width="4" height="' + (6 + 2 * s) + '" rx="2" fill="' + dark + '"/><rect x="' + (bx + rx * 0.3) + '" y="' + (by + ry * 0.5) + '" width="4" height="' + (6 + 2 * s) + '" rx="2" fill="' + dark + '"/>';
    o += '<ellipse cx="' + bx + '" cy="' + by + '" rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" fill="' + body + '" stroke="hsl(' + hue + ',70%,80%)" stroke-width="' + (0.4 + g.fluff * 3.2).toFixed(1) + '" stroke-dasharray="1.6 1.4"/>';
    var n = Math.round(g.spots * 5), k, sp = [[-6, -2], [0, 3], [5, -3], [-2, -5], [7, 3]];
    for (k = 0; k < n; k++) o += '<circle cx="' + (bx + sp[k][0] * s).toFixed(1) + '" cy="' + (by + sp[k][1] * s).toFixed(1) + '" r="' + (1.8 * s).toFixed(1) + '" fill="' + dark + '" opacity=".6"/>';
    o += '<polygon points="' + (hx - 4 * s) + ',' + (hy - hr * 0.7) + ' ' + (hx - 1) + ',' + (hy - hr * 0.7 - earL) + ' ' + (hx + 1.5 * s) + ',' + (hy - hr * 0.9) + '" fill="' + dark + '"/>';
    o += '<polygon points="' + (hx + 1 * s) + ',' + (hy - hr * 0.9) + ' ' + (hx + 4 * s) + ',' + (hy - hr * 0.9 - earL) + ' ' + (hx + 6 * s) + ',' + (hy - hr * 0.5) + '" fill="' + dark + '"/>';
    o += '<circle cx="' + hx.toFixed(1) + '" cy="' + hy.toFixed(1) + '" r="' + hr.toFixed(1) + '" fill="' + body + '"/>';
    o += '<circle cx="' + (hx + 2.5 * s).toFixed(1) + '" cy="' + (hy - 1).toFixed(1) + '" r="2.4" fill="#fff"/><circle cx="' + (hx + 3.2 * s).toFixed(1) + '" cy="' + (hy - 1).toFixed(1) + '" r="1.2" fill="#222"/>';
    return o + '</svg>';
  }

  function familyTree(host) {
    var SIZE = 10, THR = 0.12, MAXLEAF = 6, nodes, gen, rate = 0.05, homes = false, sel, nextName, last, nextId;
    function rndGenome() { var g = {}; GENES.forEach(function (k) { g[k] = clamp(0.5 + gauss() * 0.05, 0, 1); }); return g; }
    function init() {
      var root = { id: 0, parent: null, kids: [], start: 0, end: null, name: 'A', home: 'warm', pop: [] };
      for (var i = 0; i < SIZE; i++) root.pop.push(rndGenome());
      nodes = [root]; nextId = 1; nextName = 1; gen = 0; sel = []; last = null;
    }
    function leaves(n, out) { out = out || []; if (!n.kids.length) out.push(n); else n.kids.forEach(function (k) { leaves(k, out); }); return out; }
    function allLeaves() { return leaves(nodes[0]); }
    function byId(id) { for (var i = 0; i < nodes.length; i++) if (nodes[i].id === id) return nodes[i]; return null; }
    function gmean(n) { var m = {}; GENES.forEach(function (k) { m[k] = mean(n.pop.map(function (g) { return g[k]; })); }); return m; }
    function dist(a, b) { var A = gmean(a), B = gmean(b), s = 0; GENES.forEach(function (k) { s += Math.abs(A[k] - B[k]); }); return s / GENES.length; }
    function sq(x) { return x * x; }
    function nextGen() {
      allLeaves().forEach(function (n) {
        var w = n.pop.map(function (g) { return homes ? Math.exp(-4 * sq(g.fluff - (n.home === 'cold' ? 0.85 : 0.15))) : 1; }), out = [];
        for (var i = 0; i < SIZE; i++) {
          var par = pickW(n.pop, w), c = {};
          GENES.forEach(function (k) { c[k] = clamp(par[k] + gauss() * rate, 0, 1); });
          out.push(c);
        }
        n.pop = out;
      });
      gen++;
    }
    function split(n) {
      if (n.kids.length || allLeaves().length >= MAXLEAF) return;
      var sh = n.pop.slice().sort(function () { return Math.random() - 0.5; }), half = Math.ceil(sh.length / 2);
      n.end = gen;
      var a = { id: nextId++, parent: n, kids: [], start: gen, end: null, name: String.fromCharCode(65 + nextName++), home: n.home, pop: sh.slice(0, half) };
      var b = { id: nextId++, parent: n, kids: [], start: gen, end: null, name: String.fromCharCode(65 + nextName++), home: n.home === 'warm' ? 'cold' : 'warm', pop: sh.slice(half) };
      n.kids = [a, b]; nodes.push(a, b);
      last = { type: 'split', from: n.name, a: a.name, b: b.name };
    }
    function species() {
      var L = allLeaves(), grp = L.map(function (_, i) { return i; });
      function f(i) { while (grp[i] !== i) i = grp[i]; return i; }
      for (var i = 0; i < L.length; i++) for (var j = i + 1; j < L.length; j++) if (dist(L[i], L[j]) >= THR === false) grp[f(i)] = f(j);
      var set = {}; L.forEach(function (_, i) { set[f(i)] = 1; });
      return Object.keys(set).length;
    }
    function ancestors(n) { var a = []; while (n) { a.push(n); n = n.parent; } return a; }
    function lca(a, b) { var A = ancestors(a); var x = b; while (x) { if (A.indexOf(x) >= 0) return x; x = x.parent; } return nodes[0]; }
    init();

    var root = mk('div', 'lab-sim');
    root.innerHTML = '<h3 class="lab-sim-title">🌳 Family Tree Maker</h3>' +
      '<p class="lab-intro">Meet the <b>Wibblets</b>, made-up critters. They start as one big group. Split the group (a river, a mountain, an ocean...) and let time pass. Watch cousins appear and the family tree grow.</p>';
    var treeEl = mk('div', 'lab-tree');
    var groups = mk('div', 'lab-groups');
    var compare = mk('div', 'lab-compare');
    var controls = mk('div', 'lab-controls');
    var actions = mk('div', 'lab-actions');
    var bNext = btn('Next generation ▶', 'lab-primary', function () { nextGen(); last = { type: 'gen', n: 1 }; render(); });
    var b10 = btn('+10', '', function () { for (var i = 0; i < 10; i++) nextGen(); last = { type: 'gen', n: 10 }; render(); });
    var b30 = btn('+30', '', function () { for (var i = 0; i < 30; i++) nextGen(); last = { type: 'gen', n: 30 }; render(); });
    var bReset = btn('↺ Start over', 'lab-ghost', function () { init(); render(); });
    [bNext, b10, b30, bReset].forEach(function (b) { actions.appendChild(b); });
    var opts = mk('div', 'lab-opts');
    var rateSel = mk('label', 'lab-opt', 'Copy mistakes (mutations): ');
    var rs = mk('select', 'lab-select', '<option value="0.03">few</option><option value="0.05" selected>some</option><option value="0.08">lots</option>');
    rs.addEventListener('change', function () { rate = +rs.value; });
    rateSel.appendChild(rs);
    var homeL = mk('label', 'lab-opt');
    var cb = mk('input'); cb.type = 'checkbox';
    cb.addEventListener('change', function () { homes = cb.checked; render(); });
    homeL.appendChild(cb); homeL.appendChild(document.createTextNode(' Give groups different homes (hot / cold: fluffier is warmer)'));
    opts.appendChild(rateSel); opts.appendChild(homeL);
    controls.appendChild(actions); controls.appendChild(opts);
    var why = mk('div', 'lab-explain'); why.setAttribute('aria-live', 'polite');
    [treeEl, groups, compare, controls, why].forEach(function (x) { root.appendChild(x); });
    host.appendChild(root);

    function hueCol(n) { return 'hsl(' + Math.round(10 + gmean(n).hue * 300) + ',60%,48%)'; }
    function renderTree() {
      var L = allLeaves(), maxG = Math.max(10, gen), W = 320, H = 190, top = 14, bot = 22, padX = 26;
      var xs = {}, i;
      L.forEach(function (l, k) { xs[l.id] = padX + (k + 0.5) * (W - 2 * padX) / L.length; });
      (function setx(n) { if (n.kids.length) { n.kids.forEach(setx); xs[n.id] = mean(n.kids.map(function (k) { return xs[k.id]; })); } })(nodes[0]);
      function y(g) { return top + g / maxG * (H - top - bot); }
      var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Family tree of the Wibblet groups. ' + L.length + ' groups now."><rect width="' + W + '" height="' + H + '" rx="10" fill="#fff"/>';
      for (i = 0; i <= maxG; i += (maxG > 40 ? 20 : maxG > 20 ? 10 : 5)) {
        s += '<line x1="0" x2="' + W + '" y1="' + y(i) + '" y2="' + y(i) + '" stroke="#eee"/><text x="3" y="' + (y(i) - 2) + '" font-size="8" fill="#999">gen ' + i + '</text>';
      }
      nodes.forEach(function (n) {
        var y1 = y(n.start), y2 = y(n.end == null ? gen : n.end), x = xs[n.id];
        s += '<line x1="' + x + '" x2="' + x + '" y1="' + y1 + '" y2="' + y2 + '" stroke="' + hueCol(n) + '" stroke-width="4" stroke-linecap="round"/>';
        if (n.kids.length) {
          var xa = xs[n.kids[0].id], xb = xs[n.kids[1].id];
          s += '<line x1="' + xa + '" x2="' + xb + '" y1="' + y2 + '" y2="' + y2 + '" stroke="#777" stroke-width="2.5" stroke-linecap="round"/>';
          s += '<circle cx="' + x + '" cy="' + y2 + '" r="3.5" fill="#fff" stroke="#555" stroke-width="1.5"/>';
        }
      });
      var anc = null;
      if (sel.length === 2) { anc = lca(byId(sel[0]), byId(sel[1])); if (anc.end != null) s += '<text x="' + (xs[anc.id] + 8) + '" y="' + (y(anc.end) - 6) + '" font-size="9" fill="#a33" font-weight="700">common ancestor</text>'; }
      L.forEach(function (l) {
        var x = xs[l.id], yy = y(gen) + 2, on = sel.indexOf(l.id) >= 0;
        s += '<g class="lab-leaf" data-id="' + l.id + '" tabindex="0" role="button" aria-label="Group ' + l.name + (on ? ' (selected)' : '') + '">' +
          '<circle cx="' + x + '" cy="' + (yy + 8) + '" r="11" fill="' + hueCol(l) + '" stroke="' + (on ? '#222' : '#fff') + '" stroke-width="' + (on ? 3 : 2) + '"/>' +
          '<text x="' + x + '" y="' + (yy + 12) + '" text-anchor="middle" font-size="11" font-weight="800" fill="#fff">' + l.name + '</text></g>';
      });
      s += '</svg>';
      treeEl.innerHTML = '<div class="lab-chart-title">Family tree <span>(time runs downward; tap two groups to compare)</span></div>' + s;
      Array.prototype.forEach.call(treeEl.querySelectorAll('.lab-leaf'), function (g) {
        function go() { toggleSel(+g.getAttribute('data-id')); }
        g.addEventListener('click', go);
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
    }
    function toggleSel(id) {
      var i = sel.indexOf(id);
      if (i >= 0) sel.splice(i, 1); else { sel.push(id); if (sel.length > 2) sel.shift(); }
      renderTree(); renderCompare();
    }
    function renderGroups() {
      var L = allLeaves(); groups.innerHTML = '';
      L.forEach(function (n) {
        var c = mk('div', 'lab-group');
        var cr = '';
        n.pop.slice(0, 5).forEach(function (g) { cr += '<span class="lab-cr">' + critterSvg(g) + '</span>'; });
        c.innerHTML = '<div class="lab-group-head"><b style="background:' + hueCol(n) + '">' + n.name + '</b>' + (homes ? '<span>' + (n.home === 'cold' ? '❄️ cold home' : '🔥 warm home') + '</span>' : '<span>' + n.pop.length + ' Wibblets</span>') + '</div><div class="lab-crs">' + cr + '</div>';
        var sb = btn('✂ Split this group', 'lab-small', function () { split(n); render(); });
        if (L.length >= MAXLEAF) { sb.disabled = true; sb.textContent = 'Tree is full'; }
        c.appendChild(sb);
        groups.appendChild(c);
      });
    }
    function renderCompare() {
      var L = allLeaves();
      if (sel.length < 2 || !byId(sel[0]) || !byId(sel[1]) || byId(sel[0]).kids.length || byId(sel[1]).kids.length) { sel = sel.filter(function (id) { var n = byId(id); return n && !n.kids.length; }); }
      if (sel.length < 2) { compare.innerHTML = L.length < 2 ? '<p class="lab-hint">Split the group to get two groups to compare.</p>' : '<p class="lab-hint">Tap two groups on the tree to compare them.</p>'; return; }
      var a = byId(sel[0]), b = byId(sel[1]), d = dist(a, b), anc = lca(a, b), ago = gen - (anc.end == null ? 0 : anc.end);
      var pct = Math.min(100, d / (THR * 2) * 100);
      compare.innerHTML = '<div class="lab-cmp-head"><b>' + a.name + '</b> vs <b>' + b.name + '</b>: ' + Math.round(d * 100) + '% different</div>' +
        '<div class="lab-bar"><i style="width:' + pct + '%"></i><u style="left:50%" title="species line"></u></div>' +
        '<div class="lab-bar-l"><span>same kind</span><span>cousin species</span></div>' +
        '<p>' + (d >= THR ? '✅ These are now different enough to count as <b>separate cousin species</b>.' : 'Still very similar. They would likely still count as the same kind.') +
        ' Their <b>common ancestor</b> lived ' + ago + ' generation' + (ago === 1 ? '' : 's') + ' ago.</p>';
    }
    function explain() {
      var L = allLeaves(), sp = species(), s = '<h4>What just happened?</h4>';
      if (L.length === 1 && gen === 0) {
        s += '<p>One group of Wibblets, all cousins mixing together. When everyone can mate with everyone, the group stays about the same kind.</p><p class="lab-tip">Press <b>Split this group</b>, then run some generations.</p>';
      } else if (L.length === 1) {
        s += '<p>' + gen + ' generations passed. With only one group, mixing keeps everyone similar, so nothing much splits apart. Try splitting the group.</p>';
      } else {
        if (last && last.type === 'split') s += '<p>✂ Group <b>' + last.from + '</b> was split in two by something like a river or a mountain: <b>' + last.a + '</b> and <b>' + last.b + '</b>. They cannot mix any more. Both come from the same ancestors, so they are <b>cousins</b>.</p>';
        s += '<p>Every generation, copying mistakes in DNA (<b>mutations</b>) add small random differences. Because the groups are apart, each collects <i>its own</i> changes' + (homes ? ', and the different homes push them in different directions too (fluffier survives better in the cold)' : '') + '. Change piles up, generation after generation.</p>' +
          '<p>Right now: <b>' + L.length + ' groups</b>, about <b>' + sp + ' kind' + (sp === 1 ? '' : 's') + '</b> of Wibblet' + (sp > 1 ? '. Groups that drifted apart enough count as separate species' : '. They have not drifted far enough to count as different species yet') + '.</p>';
        s += '<p class="lab-tip">Nobody planned this tree. It has no goal, only splits and slow drifting. Real families (like crocodiles and birds) grew the same way. They are cousins that share a common ancestor, and neither is the other\'s ancestor.</p>';
      }
      why.innerHTML = s;
    }
    function render() {
      renderTree(); renderGroups(); renderCompare(); explain();
      b10.disabled = b30.disabled = bNext.disabled = false;
    }
    render();
    return function () { };
  }

  /* ====================================================================
     VIEW
     ==================================================================== */
  Views.lab = {
    title: 'How evolution works',
    icon: '🧪',
    mount: function (el, ctx) {
      ctx = ctx || {};
      var DATA = ctx.DATA || window.DATA || {};
      var concepts = (DATA.evolutionConcepts && DATA.evolutionConcepts.length) ? DATA.evolutionConcepts : FALLBACK;
      var idx = 0, stepN = 0, activeSim = null, simDestroy = null, simHost;
      el.innerHTML = '';
      var wrap = mk('div', 'lab-view');
      wrap.innerHTML = '<header class="lab-hero"><h2>🧪 How evolution works</h2><p>Evolution is not one animal changing. It is a <b>population</b> changing over many <b>generations</b>. Read the ideas, then play with three tiny worlds.</p></header>';

      /* story */
      var story = mk('section', 'lab-story');
      story.setAttribute('aria-label', 'Big ideas');
      var dots = mk('div', 'lab-dots'), card = mk('div', 'lab-card');
      story.appendChild(dots); story.appendChild(card);
      wrap.appendChild(story);

      function renderStory() {
        var c = concepts[idx], ex = c.example || {}, steps = ex.steps || [];
        dots.innerHTML = '';
        concepts.forEach(function (cc, i) {
          var b = btn(esc(cc.emoji || '•'), 'lab-dot' + (i === idx ? ' is-on' : ''), function () { idx = i; stepN = 0; renderStory(); });
          b.setAttribute('aria-label', 'Idea ' + (i + 1) + ': ' + (cc.title || '')); if (i === idx) b.setAttribute('aria-current', 'step');
          dots.appendChild(b);
        });
        var h = '<div class="lab-card-top"><span class="lab-big-emoji">' + esc(c.emoji || '💡') + '</span><div><div class="lab-kicker">Idea ' + (idx + 1) + ' of ' + concepts.length + '</div><h3>' + esc(c.title) + '</h3></div></div>' +
          '<p class="lab-lead">' + esc(c.kidExplain) + '</p>';
        if (ex.setup) {
          h += '<div class="lab-example"><div class="lab-ex-setup">📖 ' + esc(ex.setup) + '</div><ol class="lab-steps">';
          for (var i = 0; i < steps.length; i++) h += '<li class="' + (i < stepN ? 'is-shown' : 'is-hidden') + '">' + esc(steps[i]) + '</li>';
          h += '</ol>' + (stepN >= steps.length && ex.punchline ? '<div class="lab-punch">⭐ ' + esc(ex.punchline) + '</div>' : '') + '</div>';
        }
        if (c.misconception) h += '<div class="lab-myth"><b>Common mix-up:</b> ' + esc(c.misconception) + '</div>';
        if (c.tryItNote) h += '<div class="lab-try">👇 <b>Try it:</b> ' + esc(c.tryItNote) + '</div>';
        card.innerHTML = h;
        var nav = mk('div', 'lab-nav');
        var prev = btn('◀ Back', 'lab-ghost', function () { idx = (idx + concepts.length - 1) % concepts.length; stepN = 0; renderStory(); });
        var more;
        if (stepN < steps.length) more = btn('Next step ▶', 'lab-primary', function () { stepN++; renderStory(); });
        else more = btn(idx === concepts.length - 1 ? 'Go to the simulations ▼' : 'Next idea ▶', 'lab-primary', function () {
          if (idx === concepts.length - 1) { simHost.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' }); return; }
          idx++; stepN = 0; renderStory();
        });
        nav.appendChild(prev); nav.appendChild(more); card.appendChild(nav);
      }

      /* sims */
      var sims = mk('section', 'lab-sims');
      sims.innerHTML = '<h2 class="lab-h2">Play with evolution</h2>';
      var tabs = mk('div', 'lab-tabs'); tabs.setAttribute('role', 'tablist');
      var defs = [['beaks', '🐦 Seed Beaks', seedBeaks], ['camo', '🐞 Camo Critters', camoCritters], ['tree', '🌳 Family Tree', familyTree]];
      var tabBtns = {};
      simHost = mk('div', 'lab-sim-host'); simHost.setAttribute('role', 'tabpanel');
      function openSim(key) {
        if (simDestroy) { try { simDestroy(); } catch (e) { } simDestroy = null; }
        simHost.innerHTML = ''; activeSim = key;
        defs.forEach(function (d) { tabBtns[d[0]].classList.toggle('is-on', d[0] === key); tabBtns[d[0]].setAttribute('aria-selected', d[0] === key ? 'true' : 'false'); });
        defs.forEach(function (d) { if (d[0] === key) simDestroy = d[2](simHost, ctx); });
      }
      defs.forEach(function (d) {
        var b = btn(d[1], 'lab-tab', function () { openSim(d[0]); });
        b.setAttribute('role', 'tab'); tabBtns[d[0]] = b; tabs.appendChild(b);
      });
      sims.appendChild(tabs); sims.appendChild(simHost);
      wrap.appendChild(sims);

      /* no goal */
      var ng = mk('section', 'lab-nogoal');
      ng.innerHTML = '<h2 class="lab-h2">🧭 Evolution has no goal</h2>' +
        '<div class="lab-ng-grid">' +
        '<div class="lab-ng bad"><span>✋ Myth</span><p>"Animals try to get better, so they evolve."</p></div>' +
        '<div class="lab-ng good"><span>✅ Truth</span><p>Some individuals happen to fit their world a little better, so they leave more chicks. Over generations, the <b>population</b> shifts.</p></div>' +
        '<div class="lab-ng bad"><span>✋ Myth</span><p>"Evolution is a ladder, with humans at the top."</p></div>' +
        '<div class="lab-ng good"><span>✅ Truth</span><p>It is a branching <b>bush</b>. Every living species has had the same amount of time. Crocodiles and birds are cousins, not steps on a ladder.</p></div>' +
        '<div class="lab-ng bad"><span>✋ Myth</span><p>"One animal changes into another during its life."</p></div>' +
        '<div class="lab-ng good"><span>✅ Truth</span><p>Individuals never evolve. Populations do, across many generations. In every sim above, no bird, critter or Wibblet ever changed. The mix did.</p></div>' +
        '</div>';
      wrap.appendChild(ng);

      el.appendChild(wrap);
      renderStory();
      var want = ctx.params && ctx.params.sim;
      openSim(tabBtns[want] ? want : 'beaks');

      return function () { if (simDestroy) { try { simDestroy(); } catch (e) { } } };
    }
  };
})();
