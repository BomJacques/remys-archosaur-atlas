/* Home view */
(function () {
  'use strict';
  window.Views = window.Views || {};
  var LIVING = ['magpie', 'chicken', 'ostrich', 'penguin', 'hummingbird', 'crocodile', 'alligator', 'gecko', 'snake', 'tortoise', 'cat', 'human', 'tuatara'];
  var TILES = [
    { id: 'journey', icon: '🧭', t: 'Journeys', d: 'Follow a chicken, magpie, snake or you back through time.', c: '#0ea5e9' },
    { id: 'basics', icon: '🌳', t: 'Start here', d: 'Family trees, generations, and what extinct really means.', c: '#16a34a' },
    { id: 'whatif', icon: '🔮', t: 'What if?', d: 'Fossils are mostly bones. What could the soft parts have looked like?', c: '#db2777' },
    { id: 'lineage', icon: '🧬', t: 'Lineage Explorer', d: 'Slide back through time and meet every ancestor.', c: '#ff6b3d' },
    { id: 'reptiles', icon: '🦎', t: 'Reptile types', d: 'Compare reptiles and play "Is it a dinosaur?"', c: '#2bb3a3' },
    { id: 'timeline', icon: '⏳', t: 'Earth timeline', d: 'See how Earth and life changed over 4.5 billion years.', c: '#7c5cff' },
    { id: 'lab', icon: '🔬', t: 'How evolution works', d: 'Run tiny experiments with birds and bugs.', c: '#3b82f6' },
    { id: 'giants', icon: '🦕', t: 'Why so big?', d: 'How did dinosaurs grow so huge?', c: '#f5a524' },
    { id: 'facts', icon: '💡', t: 'Did you know?', d: 'Surprising cousins: is a dugong closer to an elephant or a dolphin?', c: '#14b8a6' },
    { id: 'ar', icon: '📱', t: 'Life-size dinos', d: 'See dinosaurs at real size with your camera.', c: '#8b5cf6' },
    { id: 'quiz', icon: '🎯', t: 'Quiz', d: 'Ten questions. Win a badge!', c: '#e5484d' }
  ];

  Views.home = {
    title: 'Home', icon: '🏠',
    mount: function (el, ctx) {
      var D = ctx.DATA, Art = ctx.Art, esc = ctx.UI.esc;
      var ids = LIVING.filter(function (id) { return D.byId(id); });
      var animals = {};
      (D.animals || []).forEach(function (a) { animals[a.id] = a; });
      var facts = (D.animals || []).map(function (a) { return a.funFact; }).filter(Boolean).concat((window.FACTS || []).map(function (f) { return f.title + ' ' + f.text; }));
      var fi = Math.floor(Math.random() * Math.max(1, facts.length));

      el.innerHTML =
        '<section class="hero">' +
        '<div class="hero-logo">' + Art.svg('logo') + '</div>' +
        '<div class="hero-text"><h1>' + esc(D.app.name) + '</h1><p class="hero-tag">' + esc(D.app.tagline) + '</p>' +
        '<button class="btn btn-big" data-go="lineage" data-animal="magpie">🧬 Start tracing</button></div>' +
        '</section>' +
        '<section class="home-pick"><h2 class="sec-title">Who do you want to trace back?</h2>' +
        '<p class="sec-sub">Tap an animal to find its family tree, all the way back to the first egg-layers.</p>' +
        '<div class="animal-grid">' + ids.map(function (id) {
          var t = D.byId(id), a = animals[id];
          return '<button class="animal-card" data-go="lineage" data-animal="' + id + '" style="--c:' + esc(t.color || '#ff6b3d') + '">' +
            '<span class="ac-art">' + Art.svg(t.artId || id) + '</span>' +
            '<span class="ac-name">' + esc(t.name) + '</span>' +
            (a ? '<span class="ac-head">' + esc(a.headline) + '</span>' : '') + '</button>';
        }).join('') + '</div></section>' +
        (facts.length ? '<section class="card funfact"><div class="ff-ico">💡</div><div class="ff-body"><h3>Did you know?</h3><p id="ffText">' + esc(facts[fi]) + '</p></div>' +
          '<button class="btn btn-ghost" id="ffNext">Another one</button></section>' : '') +
        '<section><h2 class="sec-title">More to explore</h2><div class="tile-grid">' + TILES.map(function (t) {
          return '<button class="tile" data-go="' + t.id + '" style="--c:' + t.c + '"><span class="tile-ico">' + t.icon + '</span>' +
            '<span class="tile-t">' + esc(t.t) + '</span><span class="tile-d">' + esc(t.d) + '</span></button>';
        }).join('') + '</div></section>';

      function onClick(e) {
        var b = e.target.closest('[data-go]');
        if (b) { ctx.go(b.getAttribute('data-go'), b.getAttribute('data-animal') ? { animal: b.getAttribute('data-animal') } : {}); return; }
        if (e.target.closest('#ffNext')) {
          fi = (fi + 1) % facts.length;
          var p = el.querySelector('#ffText');
          p.textContent = facts[fi];
          p.classList.remove('fade'); void p.offsetWidth; p.classList.add('fade');
        }
      }
      el.addEventListener('click', onClick);
      return function () { el.removeEventListener('click', onClick); };
    }
  };
})();
