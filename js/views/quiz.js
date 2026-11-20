/* Quiz view */
(function () {
  'use strict';
  window.Views = window.Views || {};

  var BADGES = [
    { min: 0, icon: '🥚', name: 'Curious Egg', msg: 'Everyone starts as an egg. Try the Lineage Explorer, then play again!' },
    { min: 4, icon: '🐣', name: 'Hatchling', msg: 'You are hatching ideas. Nice start!' },
    { min: 6, icon: '🦎', name: 'Sharp Scout', msg: 'You know your cousins from your ancestors.' },
    { min: 8, icon: '🦖', name: 'Dino Detective', msg: 'Great work. You spot the tricky ones!' },
    { min: 10, icon: '🐦', name: 'Feathered Genius', msg: 'Perfect score! You are a real living dinosaur expert.' }
  ];

  Views.quiz = {
    title: 'Quiz', icon: '🎯',
    mount: function (el, ctx) {
      var D = ctx.DATA, UI = ctx.UI, esc = UI.esc;
      var Q = D.quiz || [], R = null;

      function start() {
        var picks = UI.shuffle(Q).slice(0, 10).sort(function (a, b) { return (a.level || 1) - (b.level || 1); }).map(function (q) {
          var idx = UI.shuffle(q.choices.map(function (c, i) { return i; }));
          return { q: q.q, why: q.why, choices: idx.map(function (i) { return q.choices[i]; }), answer: idx.indexOf(q.answer), level: q.level };
        });
        R = { qs: picks, i: 0, score: 0, picked: null };
        draw();
      }
      function intro() {
        var best = UI.store.get('remy.quizBest');
        el.innerHTML = '<div class="quiz"><section class="card quiz-card q-intro"><div class="g-big">🎯</div><h1 class="page-title">Quiz time!</h1>' +
          '<p>Ten questions about family trees, dinosaurs and evolution. Win a badge!</p>' +
          (best ? '<p class="muted">Your best score: <b>' + esc(best) + ' / 10</b></p>' : '') +
          '<button class="btn btn-big" id="qStart">Start the quiz</button></section></div>';
      }
      function draw() {
        if (R.i >= R.qs.length) return end();
        var q = R.qs[R.i];
        el.innerHTML = '<div class="quiz"><div class="q-prog" role="progressbar" aria-valuemin="0" aria-valuemax="' + R.qs.length + '" aria-valuenow="' + R.i + '"><span style="width:' + (R.i / R.qs.length * 100) + '%"></span></div>' +
          '<section class="card quiz-card"><div class="g-top"><span>Question ' + (R.i + 1) + ' of ' + R.qs.length + '</span><span>⭐ ' + R.score + '</span></div>' +
          '<h2 class="q-text">' + esc(q.q) + '</h2><div class="q-choices">' + q.choices.map(function (c, i) {
            return '<button class="q-choice" data-c="' + i + '"><span class="q-key">' + 'ABCD'.charAt(i) + '</span><span>' + esc(c) + '</span></button>';
          }).join('') + '</div><div id="qFb" aria-live="polite"></div></section></div>';
      }
      function pick(i) {
        if (R.picked != null) return;
        var q = R.qs[R.i], ok = i === q.answer;
        R.picked = i; if (ok) R.score++;
        el.querySelectorAll('.q-choice').forEach(function (b, k) {
          b.disabled = true;
          if (k === q.answer) b.classList.add('right');
          else if (k === i) b.classList.add('wrong');
        });
        el.querySelector('#qFb').innerHTML = '<div class="fb ' + (ok ? 'good' : 'bad') + '"><b>' + (ok ? '🎉 Correct!' : '🤔 Not this time.') + '</b> ' + esc(q.why || '') + '</div>' +
          '<button class="btn btn-big" id="qNext">' + (R.i + 1 >= R.qs.length ? 'See my badge' : 'Next question ▶') + '</button>';
        var nb = el.querySelector('#qNext'); if (nb) nb.focus({ preventScroll: true });
      }
      function end() {
        var s = R.score, b = BADGES[0];
        BADGES.forEach(function (x) { if (s >= x.min) b = x; });
        var best = +UI.store.get('remy.quizBest') || 0, newBest = s > best;
        if (newBest) UI.store.set('remy.quizBest', String(s));
        el.innerHTML = '<div class="quiz"><section class="card quiz-card q-end"><div class="badge-big">' + b.icon + '</div><h1 class="page-title">' + esc(b.name) + '</h1>' +
          '<p class="score-line">You got <b>' + s + ' out of ' + R.qs.length + '</b></p><p>' + esc(b.msg) + '</p>' +
          (newBest && s > 0 ? '<p class="newbest">🌟 New best score!</p>' : '') +
          '<div class="row center"><button class="btn btn-big" id="qStart">Play again</button><button class="btn btn-ghost" data-go="lineage">Explore lineages</button></div></section></div>';
      }
      function onClick(e) {
        var b;
        if (e.target.closest('#qStart')) { start(); return; }
        if ((b = e.target.closest('[data-c]'))) { pick(+b.getAttribute('data-c')); return; }
        if (e.target.closest('#qNext')) { R.i++; R.picked = null; draw(); window.scrollTo(0, 0); return; }
        if ((b = e.target.closest('[data-go]'))) ctx.go(b.getAttribute('data-go'));
      }
      function onKey(e) {
        if (!R || R.picked != null || R.i >= R.qs.length) return;
        var k = 'abcd'.indexOf((e.key || '').toLowerCase());
        if (k < 0) k = '1234'.indexOf(e.key);
        if (k >= 0 && k < R.qs[R.i].choices.length) pick(k);
      }
      if (!Q.length) { el.innerHTML = '<section class="card soon"><h1>Quiz</h1><p>Questions are on their way!</p></section>'; return; }
      intro();
      el.addEventListener('click', onClick);
      document.addEventListener('keydown', onKey);
      return function () { el.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
    }
  };
})();
