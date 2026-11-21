/* journey.js: "Journeys": follow one animal back through time with painted steps */
(function () {
  'use strict';
  window.Views = window.Views || {};

  var ORDER = [['chicken', 'Chicken'], ['magpie', 'Magpie'], ['hummingbird', 'Hummingbird'], ['crocodile', 'Crocodile'], ['snake', 'Snake'], ['human', 'Human']];

  function shortWhen(w) {
    if (/^today/i.test(w)) return 'Today';
    var m = w.match(/(\d[\d.]*)\s*(?:to\s*(\d[\d.]*)\s*)?(million|billion)/i);
    if (!m) return w;
    var unit = /billion/i.test(m[3]) ? 'Bya' : 'Mya';
    return m[1] + (m[2] ? '–' + m[2] : '') + ' ' + unit;
  }

  window.Views.journey = {
    title: 'Journeys', icon: '',
    mount: function (el, ctx) {
      var T = window.TRAILS, esc = ctx.UI.esc;
      if (!T) { el.innerHTML = '<section class="card"><h1 class="page-title">Journeys</h1><p>The paintings for this page are still loading.</p></section>'; return; }
      var key = (ctx.params && (ctx.params.animal || ctx.params.id)) || 'chicken';
      if (!T[key]) key = 'chicken';
      var idx = 0, timer = 0, alive = true;

      el.innerHTML =
        '<section class="card jn-hero"><h1 class="page-title">Journeys</h1>' +
        '<p>Pick an animal and travel back through time, one painting at a time. Most steps are <b>relatives</b> that show what the ancestors were like, not the exact ancestors themselves.</p>' +
        '<div class="jn-chips" role="group" aria-label="Choose an animal"></div></section>' +
        '<section class="jn-main"><div class="jn-stage" id="jnStage" aria-live="polite"></div>' +
        '<div class="card jn-info" id="jnInfo"></div><div class="jn-ribbon" id="jnRibbon" role="group" aria-label="Steps"></div></section>';
      var chips = el.querySelector('.jn-chips'), stage = el.querySelector('#jnStage'), info = el.querySelector('#jnInfo'), ribbon = el.querySelector('#jnRibbon');
      ORDER.forEach(function (o) {
        if (!T[o[0]]) return;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'jn-chip'; b.setAttribute('data-a', o[0]); b.textContent = o[1]; chips.appendChild(b);
      });

      function stop() { if (timer) { clearTimeout(timer); timer = 0; } }
      function render(anim) {
        var tr = T[key], n = tr.steps.length, st = tr.steps[idx];
        stage.innerHTML =
          '<div class="jn-bg" style="background-image:url(\'' + esc(st.bg) + '\')"></div>' +
          '<div class="jn-fg ' + (anim ? 'jn-in' : '') + '"><img src="' + esc(st.img) + '" alt="' + esc(st.name) + '" style="aspect-ratio:' + (1 / st.aspect).toFixed(3) + '"><span class="jn-shadow"></span></div>' +
          '<span class="jn-pill">Step ' + (idx + 1) + ' of ' + n + '</span><span class="jn-when">' + esc(st.when) + '</span>' +
          '<button type="button" class="jn-nav jn-prev" data-d="-1" aria-label="Back to the previous step"' + (idx === 0 ? ' disabled' : '') + '>&#9664;</button>' +
          '<button type="button" class="jn-nav jn-next" data-d="1" aria-label="On to the next step"' + (idx === n - 1 ? ' disabled' : '') + '>&#9654;</button>';
        info.innerHTML = '<div class="jn-info-top"><div><div class="jn-eyebrow">' + esc(tr.title) + '</div><h2 class="jn-name">' + esc(st.name) + '</h2></div>' +
          '<div class="jn-actions"><button type="button" class="btn" data-play="1">' + (timer ? 'Pause' : 'Play the journey') + '</button>' +
          (key !== 'human' || true ? '<button type="button" class="btn btn-ghost" data-tree="1">Full family tree</button>' : '') + '</div></div>' +
          '<p class="jn-text">' + esc(st.text) + '</p><p class="jn-sub">' + esc(tr.sub) + '</p>';
        ribbon.innerHTML = tr.steps.map(function (s, i) {
          return '<button type="button" class="jn-dot' + (i === idx ? ' on' : '') + (i < idx ? ' past' : '') + '" data-i="' + i + '" aria-label="Step ' + (i + 1) + ': ' + esc(s.name) + '"><span class="jn-dot-t">' + esc(shortWhen(s.when)) + '</span></button>';
        }).join('');
        Array.prototype.forEach.call(chips.children, function (c) { var on = c.getAttribute('data-a') === key; c.classList.toggle('on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      }
      function go(i) { var n = T[key].steps.length; i = Math.max(0, Math.min(n - 1, i)); if (i === idx) return false; idx = i; render(true); return true; }
      function play() {
        if (timer) { stop(); render(false); return; }
        if (idx >= T[key].steps.length - 1) { idx = 0; }
        (function tick() {
          render(false); timer = setTimeout(function () {
            if (!alive) return;
            if (idx < T[key].steps.length - 1) { idx++; render(true); tick(); } else { timer = 0; render(false); }
          }, 4200);
        })();
      }
      function onClick(e) {
        var t = e.target;
        var a = t.closest('[data-a]'); if (a) { stop(); key = a.getAttribute('data-a'); idx = 0; render(true); return; }
        var d = t.closest('[data-d]'); if (d) { stop(); go(idx + (+d.getAttribute('data-d'))); return; }
        var i = t.closest('[data-i]'); if (i) { stop(); idx = +i.getAttribute('data-i'); render(true); return; }
        if (t.closest('[data-play]')) { play(); return; }
        if (t.closest('[data-tree]')) { ctx.go('lineage', { animal: key }); }
      }
      function onKey(e) { if (e.key === 'ArrowRight') { stop(); go(idx + 1); } else if (e.key === 'ArrowLeft') { stop(); go(idx - 1); } }
      el.addEventListener('click', onClick); document.addEventListener('keydown', onKey);
      render(false);
      return function () { alive = false; stop(); el.removeEventListener('click', onClick); document.removeEventListener('keydown', onKey); };
    }
  };
})();
