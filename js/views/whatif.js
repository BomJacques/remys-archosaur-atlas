/* whatif.js: speculative biology. Soft parts rarely fossilise, so scientists make careful guesses. */
(function () {
  'use strict';
  window.Views = window.Views || {};

  var DINOS = {
    't-rex': { n: 'T. rex with a feather mane', idea: 'Fossil skin patches show scales on adult T. rex, but its cousins like Yutyrannus were fuzzy with feathers. A showy mane is a guess. Living look-alike idea: a rooster or a vulture.' },
    'triceratops': { n: 'Triceratops with a display frill', idea: 'The big frill may have been brightly coloured to impress mates and rivals, a bit like a peacock\'s tail. No fossil shows the colour.' },
    'diplodocus': { n: 'Diplodocus with a throat sail', idea: 'A flap of skin under the throat, like the dewlap on a lizard or a cow, could have signalled to others. Bones cannot tell us.' },
    'quetzalcoatlus': { n: 'Quetzalcoatlus with a fuzzy coat and display', idea: 'Pterosaurs had fine fuzz (called pycnofibres) and many had head crests. Colourful displays are plausible, but the colours are guesses.' },
    'postosuchus': { n: 'Postosuchus with a neck ruff', idea: 'This crocodile cousin had no feathers. A ruff like a frilled lizard\'s is wild speculation, but it shows how much skin can hide from fossils.' },
    'archaeopteryx': { n: 'Archaeopteryx with a fan display', idea: 'We know Archaeopteryx had feathers. Fan displays are common in birds today, like peacocks and turkeys, so this one is a reasonable guess.' }
  };
  var MODERN = {
    'african-elephant': { n: 'African elephant', x: 'Shrink-wrapped over its bones, the ears, trunk shape, wrinkles and folds all vanish.' },
    'barn-owl': { n: 'Barn owl', x: 'Fluffy feathers make an owl look twice as big as its thin, bony body.' },
    'blue-whale': { n: 'Blue whale', x: 'A thick layer of blubber and smooth skin hides the skeleton completely.' },
    'emperor-penguin': { n: 'Emperor penguin', x: 'Feathers and fat turn a skinny skeleton into a round, cosy penguin.' }
  };

  /* before/after slider: two stacked images, the top one is revealed from the left by the range input */
  function slider(a, b, la, lb, alt) {
    var asp = Math.max(a.aspect, b.aspect), id = 'sl' + Math.random().toString(36).slice(2, 8);
    return '<div class="wi-cmp" style="--asp:' + (1 / asp).toFixed(3) + '">' +
      '<div class="wi-frame"><img class="wi-img wi-base" src="' + a.src + '" alt="' + alt + ' (' + la + ')" loading="lazy" style="clip-path: inset(0 50% 0 0)">' +
      '<img class="wi-img wi-top" src="' + b.src + '" alt="' + alt + ' (' + lb + ')" loading="lazy" style="clip-path: inset(0 0 0 50%)"><span class="wi-bar" style="left:50%"></span></div>' +
      '<div class="wi-labels"><span>' + la + '</span><span>' + lb + '</span></div>' +
      '<input type="range" min="0" max="100" value="50" class="wi-range" id="' + id + '" aria-label="Slide to compare: ' + la + ' and ' + lb + '"></div>';
  }

  window.Views.whatif = {
    title: 'What if?', icon: '🔮',
    mount: function (el, ctx) {
      var esc = ctx.UI.esc, SP = window.SPEC;
      if (!SP) { el.innerHTML = '<section class="card"><h1 class="page-title">What if? 🔮</h1><p>The pictures for this page are still loading.</p></section>'; return; }
      var h = '<section class="card wi-hero"><h1 class="page-title">What if? 🔮</h1>' +
        '<p>Fossils are mostly <b>bones</b>. Skin, feathers, colours, fat, crests and fluff almost never survive. So when artists draw a dinosaur, a lot is educated guessing. This page shows how much a living animal changes once you add the soft parts back, and some <b>what if?</b> ideas for dinosaurs.</p>' +
        '<p class="wi-warn">⚠️ Everything in the "what if" sections is <b>speculation</b>, not evidence. It is a way to think like a scientist, not a fact.</p></section>';

      h += '<section class="card wi-sec"><h2 class="wi-h2">1. Skeleton wrap vs the real animal</h2><p>Some old dinosaur drawings look "shrink-wrapped": skin pulled tight over the bones. Slide to see what happens when you do that to animals we know well.</p><div class="wi-grid">';
      SP.modern.forEach(function (m) {
        var M = MODERN[m.id] || { n: m.id, x: '' };
        h += '<article class="wi-card">' + slider(m.bones, m.living, 'Shrink-wrapped', 'Living animal', esc(M.n)) + '<h3>' + esc(M.n) + '</h3><p>' + esc(M.x) + '</p></article>';
      });
      h += '</div></section>';

      h += '<section class="card wi-sec"><h2 class="wi-h2">2. What if dinosaurs had showy soft parts?</h2><p>Many living animals use soft body parts to show off. Slide between the usual picture and a "what if" version.</p><div class="wi-grid">';
      SP.dinos.forEach(function (d) {
        var D = DINOS[d.id] || { n: d.id, idea: '' };
        h += '<article class="wi-card">' + slider(d.ref, d.spec, 'Usual picture', 'What if?', esc(D.n)) + '<h3>' + esc(D.n) + '</h3><p>' + esc(D.idea) + '</p><p class="wi-tag">Speculation</p></article>';
      });
      h += '</div></section>';

      h += '<section class="card wi-sec"><h2 class="wi-h2">3. Just for fun: silly ideas</h2><p>Not science, just play. Which one would you most like to meet?</p><div class="wi-gallery">';
      SP.silly.forEach(function (s) {
        var name = s.id.replace(/-/g, ' ').replace(/^./, function (c) { return c.toUpperCase(); });
        h += '<figure class="wi-fig"><img src="' + s.src + '" alt="' + esc(name) + '" loading="lazy"><figcaption>' + esc(name) + '</figcaption></figure>';
      });
      h += '</div></section>';
      el.innerHTML = h;

      function onInput(e) {
        var r = e.target.closest('.wi-range'); if (!r) return;
        var f = r.closest('.wi-cmp'), v = +r.value;
        f.querySelector('.wi-top').style.clipPath = 'inset(0 0 0 ' + v + '%)';
        f.querySelector('.wi-base').style.clipPath = 'inset(0 ' + (100 - v) + '% 0 0)';
        f.querySelector('.wi-bar').style.left = v + '%';
      }
      el.addEventListener('input', onInput);
      return function () { el.removeEventListener('input', onInput); };
    }
  };
})();
