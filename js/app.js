/* app.js: router, nav, glossary drawer */
(function () {
  'use strict';
  var UI = window.UI, esc = UI.esc;
  var D = window.DATA;
  var NAV = [
    { id: 'home', icon: '🏠', label: 'Home', short: 'Home' },
    { id: 'basics', icon: '🌳', label: 'Start here', short: 'Start' },
    { id: 'lineage', icon: '🧬', label: 'Lineage Explorer', short: 'Lineage' },
    { id: 'reptiles', icon: '🦎', label: 'Reptile types', short: 'Reptiles' },
    { id: 'timeline', icon: '⏳', label: 'Timeline', short: 'Timeline' },
    { id: 'lab', icon: '🔬', label: 'How evolution works', short: 'Evolution' },
    { id: 'giants', icon: '🦕', label: 'Why so big?', short: 'Why big?' },
    { id: 'whatif', icon: '🔮', label: 'What if?', short: 'What if?' },
    { id: 'facts', icon: '💡', label: 'Did you know?', short: 'Facts' },
    { id: 'ar', icon: '📱', label: 'Life-size dinos (AR)', short: 'AR' },
    { id: 'quiz', icon: '🎯', label: 'Quiz', short: 'Quiz' }
  ];
  var main = document.getElementById('view');
  var navEl = document.getElementById('nav');
  var live = document.getElementById('live');
  var current = null, pendingParams = null, token = 0;

  function $(id) { return document.getElementById(id); }

  function buildNav() {
    navEl.innerHTML = NAV.map(function (n) {
      return '<a class="nav-item" href="#/' + n.id + '" data-view="' + n.id + '" title="' + esc(n.label) + '">' +
        '<span class="nav-ico" aria-hidden="true">' + n.icon + '</span>' +
        '<span class="nav-lbl"><span class="l-long">' + esc(n.label) + '</span><span class="l-short">' + esc(n.short) + '</span></span></a>';
    }).join('');
  }

  function setActive(name) {
    var items = navEl.querySelectorAll('.nav-item');
    for (var i = 0; i < items.length; i++) {
      var on = items[i].getAttribute('data-view') === name;
      items[i].classList.toggle('on', on);
      if (on) items[i].setAttribute('aria-current', 'page'); else items[i].removeAttribute('aria-current');
    }
  }

  function parseHash() {
    var h = (location.hash || '').replace(/^#\/?/, '');
    var parts = h.split('/').filter(Boolean).map(decodeURIComponent);
    var name = parts[0] || 'home';
    var seg = parts[1] || '';
    return { name: name, params: seg ? { animal: seg, id: seg, seg: seg } : {} };
  }

  function go(name, params) {
    params = params || {};
    pendingParams = params;
    var seg = params.animal || params.id || params.seg || '';
    var h = '#/' + name + (seg ? '/' + encodeURIComponent(seg) : '');
    if (location.hash === h) route(); else location.hash = h;
  }

  function comingSoon(name) {
    var n = NAV.filter(function (x) { return x.id === name; })[0];
    main.innerHTML = '<section class="card soon"><div class="soon-ico">' + (n ? n.icon : '🛠️') + '</div>' +
      '<h1>' + esc(n ? n.label : 'This page') + '</h1><p>This part of the album is still being built. Come back soon!</p>' +
      '<button class="btn" data-home>Back home</button></section>';
    var b = main.querySelector('[data-home]');
    if (b) b.addEventListener('click', function () { go('home'); });
  }

  function route() {
    var r = parseHash();
    var params = pendingParams || r.params;
    pendingParams = null;
    var name = r.name;
    if (!NAV.some(function (n) { return n.id === name; })) { name = 'home'; }
    if (current && typeof current.destroy === 'function') { try { current.destroy(); } catch (e) { console.error(e); } }
    current = null;
    main.innerHTML = '';
    main.className = 'view view-' + name;
    setActive(name);
    var nav = NAV.filter(function (n) { return n.id === name; })[0];
    document.title = (nav && name !== 'home' ? nav.label + ' · ' : '') + (D && D.app ? D.app.name : 'Family Album');
    var view = window.Views && window.Views[name];
    var my = ++token;
    if (!D) {
      main.innerHTML = '<section class="card soon"><div class="soon-ico">📚</div><h1>Loading the album…</h1><p>The science data has not arrived yet.</p></section>';
    } else if (!view || typeof view.mount !== 'function') {
      comingSoon(name);
    } else {
      var ctx = { DATA: D, Art: window.Art, UI: UI, go: go, params: params, glossary: openGlossary };
      try {
        var d = view.mount(main, ctx);
        if (typeof d === 'function') current = { destroy: d };
      } catch (err) {
        console.error(err);
        main.innerHTML = '<section class="card soon"><div class="soon-ico">🙈</div><h1>Oops!</h1><p>This page tripped over a rock. Try another page.</p></section>';
      }
    }
    if (my === token) {
      window.scrollTo(0, 0);
      live.textContent = (nav ? nav.label : 'Page') + ' page';
    }
  }

  /* glossary */
  var gl = $('glossary'), scrim = $('scrim'), lastFocus = null;
  function renderWords(q) {
    var list = (D && D.glossary) || [];
    q = (q || '').toLowerCase();
    var items = list.filter(function (g) { return !q || (g.term + ' ' + g.def).toLowerCase().indexOf(q) >= 0; })
      .sort(function (a, b) { return a.term.localeCompare(b.term); });
    $('wordsList').innerHTML = items.length ? items.map(function (g) {
      return '<div class="gl-item"><dt>' + esc(g.term) + '</dt><dd>' + esc(g.def) + '</dd></div>';
    }).join('') : '<p class="muted">No words found. Try a shorter search.</p>';
  }
  function openGlossary(term) {
    lastFocus = document.activeElement;
    gl.hidden = false; scrim.hidden = false;
    requestAnimationFrame(function () { gl.classList.add('open'); scrim.classList.add('open'); });
    $('wordsSearch').value = term || '';
    renderWords(term || '');
    $('wordsSearch').focus({ preventScroll: true });
  }
  function closeGlossary() {
    gl.classList.remove('open'); scrim.classList.remove('open');
    setTimeout(function () { gl.hidden = true; scrim.hidden = true; }, 220);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  $('wordsBtn').addEventListener('click', function () { openGlossary(''); });
  $('wordsClose').addEventListener('click', closeGlossary);
  scrim.addEventListener('click', closeGlossary);
  $('wordsSearch').addEventListener('input', function (e) { renderWords(e.target.value); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !gl.hidden) closeGlossary(); });

  UI.bindAR(document);
  /* boot */
  if (D && D.app) {
    $('brandName').textContent = D.app.shortName || D.app.name;
    document.title = D.app.name;
  }
  if (window.Art && window.Art.has('logo')) {
    $('brandLogo').innerHTML = window.Art.svg('logo');
    // faint decorative leaf pattern
    if (window.Art.has('bg-leaf')) {
      try {
        var svg = window.ART['bg-leaf'];
        document.documentElement.style.setProperty('--bg-leaf', 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")');
        document.body.classList.add('has-leaf');
      } catch (e) { /* ignore */ }
    }
  }
  buildNav();
  window.addEventListener('hashchange', route);
  route();
})();
