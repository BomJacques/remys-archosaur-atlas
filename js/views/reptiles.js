/* Reptile Types view: compare cards, archosaur explainer, "Is it a dinosaur?" game */
(function () {
  'use strict';
  window.Views = window.Views || {};

  var DINO = ['stegosaurus', 'triceratops', 'ankylosaurus', 'parasaurolophus', 'plateosaurus', 'brachiosaurus', 'argentinosaurus', 'coelophysis', 'allosaurus', 'trex', 'velociraptor', 'microraptor', 'archaeopteryx', 'ostrich', 'chicken', 'penguin', 'hummingbird', 'magpie'];
  var NOT = ['dimetrodon', 'mosasaur', 'quetzalcoatlus', 'pterosaur', 'postosuchus', 'crocodile', 'alligator', 'gecko', 'snake', 'tuatara', 'tortoise', 'cat', 'human'];

  Views.reptiles = {
    title: 'Reptile types', icon: '🦎',
    mount: function (el, ctx) {
      var D = ctx.DATA, Art = ctx.Art, UI = ctx.UI, esc = UI.esc;
      var types = D.reptileTypes || [];
      var sel = [];
      var rows = (D.reptileCompareRows || []).map(function (r) {
        return typeof r === 'string' ? { key: r, label: r.replace(/([A-Z])/g, ' $1').replace(/^./, function (c) { return c.toUpperCase(); }) } : { key: r.key || r.id || r.field, label: r.label || r.name || r.key };
      });
      if (!rows.length) rows = ['examples', 'legs', 'skin', 'eggs', 'bloodType', 'heartOrSkullNote', 'keyFact'].map(function (k) { return { key: k, label: k }; });
      var game = null, alive = true;

      function val(t, k) {
        var v = t[k];
        if (k === 'notDino') return t.notDino ? '❌ Not a dinosaur' : '✅ Dinosaur';
        if (Array.isArray(v)) return v.join(', ');
        return v == null || v === '' ? '—' : String(v);
      }
      function isDino(id) { return D.pathTo(id).some(function (t) { return t.id === 'dinosaur'; }); }

      /* generic explainer renderer */
      function explainer(x) {
        var items = [];
        if (Array.isArray(x)) items = x;
        else if (x && typeof x === 'object') items = Object.keys(x).map(function (k) { var v = x[k]; return typeof v === 'object' ? v : { title: k, text: v }; });
        else if (x) items = [x];
        return items.map(function (it) {
          if (typeof it === 'string') return '<div class="ex-item"><p>' + esc(it) + '</p></div>';
          var title = it.title || it.name || it.label || it.term || '';
          var text = it.text || it.body || it.explain || it.desc || it.description || it.blurb || it.oneLine || '';
          var ex = it.examples && it.examples.length ? '<p class="ex-ex">' + it.examples.map(function (e) { return '<span class="stat">' + esc(e) + '</span>'; }).join(' ') + '</p>' : '';
          return '<div class="ex-item">' + (title ? '<h4>' + esc(title) + '</h4>' : '') + '<p>' + esc(text) + '</p>' + ex + '</div>';
        }).join('');
      }

      function cards() {
        return types.map(function (t) {
          var on = sel.indexOf(t.id) >= 0;
          return '<div class="rt-card' + (on ? ' on' : '') + '"><button class="rt-main" data-rt="' + esc(t.id) + '" aria-pressed="' + on + '">' +
            '<span class="rt-art">' + Art.svg(t.artId || t.taxonId) + '</span>' +
            '<span class="rt-name">' + esc(t.emoji || '') + ' ' + esc(t.name) + '</span>' +
            '<span class="rt-line">' + esc(t.oneLine || '') + '</span>' +
            '<span class="rt-badge ' + (t.notDino ? 'no' : 'yes') + '">' + (t.notDino ? 'Not a dinosaur' : 'Dinosaur') + '</span>' +
            '<span class="rt-pick">' + (on ? '✓ Picked' : '+ Compare') + '</span></button>' +
            (t.taxonId ? UI.arButton(t.taxonId) : '') + '</div>';
        }).join('');
      }
      function table() {
        var box = el.querySelector('#rtCompare');
        if (sel.length < 2) {
          box.innerHTML = '<p class="muted rt-hint">Pick 2 or 3 groups above to compare them side by side.</p>';
          return;
        }
        var ts = sel.map(function (id) { return types.filter(function (t) { return t.id === id; })[0]; });
        box.innerHTML = '<div class="cmp-table-wrap"><table class="cmp-table"><thead><tr><th></th>' + ts.map(function (t) {
          return '<th><div class="ct-art">' + Art.svg(t.artId || t.taxonId) + '</div>' + esc(t.name) + '</th>';
        }).join('') + '</tr></thead><tbody>' + rows.map(function (r) {
          return '<tr><th scope="row">' + esc(r.label) + '</th>' + ts.map(function (t) { return '<td>' + esc(val(t, r.key)) + '</td>'; }).join('') + '</tr>';
        }).join('') + '</tbody></table></div>';
      }

      el.innerHTML =
        '<div class="rep">' +
        '<header class="lin-head"><h1 class="page-title">Reptile types</h1><p class="page-sub">Lizards, crocodiles, dinosaurs, birds… who is related to who?</p></header>' +
        '<div class="card note"><b>🤔 Is "reptile" a real family?</b> Not quite! It is an everyday word. Birds sit inside the reptile branch of the family tree, so a group of "reptiles that leaves out birds" is not one clean family. Scientists still argue about where turtles fit too.</div>' +
        '<h2 class="sec-title">Compare groups</h2><div class="rt-grid" id="rtGrid">' + cards() + '</div><div id="rtCompare" class="rt-compare"></div>' +
        '<h2 class="sec-title">What is an archosaur?</h2><div class="card arch">' +
        '<div class="arch-art">' + (Art.has('skeleton-bird-vs-trex') ? Art.svg('skeleton-bird-vs-trex', { title: 'A bird skeleton next to a T. rex skeleton' }) : Art.svg('archosaur')) + '</div>' +
        '<div class="arch-txt"><div class="ex-grid">' + explainer(D.archosaurFeatures) + '</div></div></div>' +
        '<h3 class="sec-sub-title">Two kinds of dinosaur hips</h3><div class="ex-grid hips">' + explainer(D.hipTypes) + '</div>' +
        '<h2 class="sec-title">Game: Is it a dinosaur?</h2><div class="card game" id="game"></div></div>';

      table();

      /* ---------- game ---------- */
      function newGame() {
        var pool = UI.shuffle(DINO.filter(function (i) { return D.byId(i); })).slice(0, 5)
          .concat(UI.shuffle(NOT.filter(function (i) { return D.byId(i); })).slice(0, 5));
        game = { q: UI.shuffle(pool), i: 0, score: 0, answered: false };
        drawGame();
      }
      function whyText(id) {
        var t = D.byId(id), p = D.pathTo(id).map(function (x) { return x.id; });
        if (isDino(id)) {
          if (p.indexOf('avialan') >= 0) return t.name + ' is a bird, and birds are living dinosaurs (theropods, like T. rex).';
          return t.name + ' is a ' + (p.indexOf('ornithischian') >= 0 ? 'bird-hipped' : 'lizard-hipped') + ' dinosaur.';
        }
        if (p.indexOf('pterosaur') >= 0) return t.name + ' was a flying reptile, a pterosaur. It was a close cousin of dinosaurs, but not one.';
        if (p.indexOf('mosasaur') >= 0) return t.name + ' was a giant sea lizard. It was in the lizard-and-snake family, not a dinosaur.';
        if (p.indexOf('pseudosuchian') >= 0) return t.name + ' is on the crocodile side of the archosaur family. It is a cousin of dinosaurs, not one.';
        if (p.indexOf('synapsid') >= 0) return t.name + ' is on the mammal side of the family tree. It is not a dinosaur.';
        return t.name + ' is not a dinosaur. It belongs to a different branch of the family tree.';
      }
      function drawGame() {
        var box = el.querySelector('#game'); if (!box) return;
        if (game.i >= game.q.length) {
          var s = game.score, n = game.q.length;
          var msg = s === n ? 'Perfect! You are a dino detective!' : s >= 8 ? 'Brilliant! Nearly perfect.' : s >= 5 ? 'Nice work! Birds and pterosaurs are tricky.' : 'Good try! Play again and you will spot them.';
          box.innerHTML = '<div class="g-end"><div class="g-big">' + (s >= 8 ? '🏆' : '⭐') + '</div><h3>' + s + ' out of ' + n + '</h3><p>' + msg + '</p><button class="btn btn-big" id="gAgain">Play again</button></div>';
          return;
        }
        var t = D.byId(game.q[game.i]);
        box.innerHTML = '<div class="g-top"><span>Question ' + (game.i + 1) + ' of ' + game.q.length + '</span><span>⭐ ' + game.score + '</span></div>' +
          '<p class="g-help">Drag the card to a side, or tap a button.</p>' +
          '<div class="g-arena"><div class="g-zone g-no" id="zNo">❌<br>Not a dinosaur</div>' +
          '<div class="g-card" id="gCard" style="touch-action:none"><div class="g-art">' + Art.svg(t.artId || t.id) + '</div><h3>' + esc(t.name) + '</h3>' + (UI.pronHtml ? UI.pronHtml(t.id) : '') +
          (t.nickname ? '<p>“' + esc(t.nickname) + '”</p>' : '') + '</div>' +
          '<div class="g-zone g-yes" id="zYes">✅<br>Dinosaur</div></div>' +
          '<div class="g-btns"><button class="btn btn-no" data-ans="no">❌ Not a dinosaur</button><button class="btn btn-yes" data-ans="yes">✅ Dinosaur</button></div>' +
          '<div class="g-fb" id="gFb" aria-live="polite"></div>';
        bindDrag(box.querySelector('#gCard'));
      }
      function answer(yes) {
        if (!game || game.answered) return;
        game.answered = true;
        var id = game.q[game.i], ok = isDino(id) === yes;
        if (ok) game.score++;
        var fb = el.querySelector('#gFb'), card = el.querySelector('#gCard');
        if (card) { card.style.transition = 'transform .3s, opacity .3s'; card.classList.add(ok ? 'right' : 'wrong'); card.style.transform = ''; }
        el.querySelectorAll('.g-btns .btn').forEach(function (b) { b.disabled = true; });
        fb.innerHTML = '<div class="fb ' + (ok ? 'good' : 'bad') + '"><b>' + (ok ? '🎉 Yes!' : '🤔 Not quite.') + '</b> ' + esc(whyText(id)) + '</div>' +
          '<button class="btn btn-big" id="gNext">' + (game.i + 1 >= game.q.length ? 'See my score' : 'Next ▶') + '</button>';
        var nb = fb.querySelector('#gNext'); if (nb) nb.focus({ preventScroll: true });
      }
      function bindDrag(card) {
        var x0 = 0, drag = false, dx = 0, id0 = null;
        var zy = el.querySelector('#zYes'), zn = el.querySelector('#zNo');
        card.addEventListener('pointerdown', function (e) {
          if (game.answered) return;
          drag = true; x0 = e.clientX; dx = 0; id0 = e.pointerId; card.style.transition = 'none';
          try { card.setPointerCapture(e.pointerId); } catch (x) { /* ignore */ }
        });
        card.addEventListener('pointermove', function (e) {
          if (!drag) return;
          dx = e.clientX - x0;
          card.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 20) + 'deg)';
          zy.classList.toggle('hot', dx > 40); zn.classList.toggle('hot', dx < -40);
        });
        function end() {
          if (!drag) return; drag = false;
          zy.classList.remove('hot'); zn.classList.remove('hot');
          if (Math.abs(dx) > 70) answer(dx > 0);
          else { card.style.transition = 'transform .25s'; card.style.transform = ''; }
        }
        card.addEventListener('pointerup', end);
        card.addEventListener('pointercancel', end);
      }

      function onClick(e) {
        var b = e.target.closest('[data-rt]');
        if (b) {
          var id = b.getAttribute('data-rt'), i = sel.indexOf(id);
          if (i >= 0) sel.splice(i, 1); else { if (sel.length >= 3) sel.shift(); sel.push(id); }
          el.querySelector('#rtGrid').innerHTML = cards(); table();
          return;
        }
        if ((b = e.target.closest('[data-ans]'))) { answer(b.getAttribute('data-ans') === 'yes'); return; }
        if (e.target.closest('#gNext')) { game.i++; game.answered = false; drawGame(); return; }
        if (e.target.closest('#gAgain')) { newGame(); }
      }
      el.addEventListener('click', onClick);
      newGame();
      return function () { alive = false; el.removeEventListener('click', onClick); };
    }
  };
})();
