/* Timeline view: era scroller + events */
(function () {
  'use strict';
  window.Views = window.Views || {};

  Views.timeline = {
    title: 'Timeline', icon: '⏳',
    mount: function (el, ctx) {
      var D = ctx.DATA, Art = ctx.Art, UI = ctx.UI, esc = UI.esc;
      var eras = D.eras || [], events = (D.timelineEvents || []).slice().sort(function (a, b) { return b.mya - a.mya; });
      var selEv = null, selEra = eras.length ? eras[Math.max(0, eras.length - 4)].id : null;

      function eraEvents(e) {
        return events.map(function (ev, i) { return { ev: ev, i: i }; }).filter(function (x) {
          var m = x.ev.mya; return m <= e.startMya && (m > e.endMya || (m === e.endMya && e.endMya === 0) || (m === e.endMya && false));
        });
      }
      function taxaIn(e) {
        return D.taxa.filter(function (t) { return !t.modern && t.rank !== 'group' ? (t.mya <= e.startMya && t.mya > e.endMya) : false; });
      }
      function render() {
        var cur = eras.filter(function (e) { return e.id === selEra; })[0] || eras[0];
        el.innerHTML =
          '<div class="tl"><header class="lin-head"><h1 class="page-title">Timeline</h1><p class="page-sub">Swipe through the ages of Earth. Tap a glowing event to find out what happened.</p></header>' +
          '<div class="era-scroll" id="eraScroll" role="list">' + eras.map(function (e) {
            var evs = eraEvents(e);
            return '<section class="era-card' + (e.id === selEra ? ' on' : '') + '" role="listitem" style="--c:' + esc(e.color) + '">' +
              '<button class="era-top" data-era="' + esc(e.id) + '" aria-pressed="' + (e.id === selEra) + '"><span class="era-scene">' + Art.svg(e.sceneArtId, { slice: true }) + '</span>' +
              '<span class="era-name">' + esc(e.name) + '</span><span class="era-yrs">' + e.startMya + '–' + e.endMya + ' Mya</span></button>' +
              '<div class="era-evs">' + (evs.length ? evs.map(function (x) {
                var boom = /extinct|asteroid|crash/i.test(x.ev.title);
                return '<button class="ev' + (boom ? ' boom' : '') + (selEv === x.i ? ' on' : '') + '" data-ev="' + x.i + '"><b>' + x.ev.mya + ' Mya</b><span>' + (boom ? '💥 ' : '') + esc(x.ev.title) + '</span></button>';
              }).join('') : '<p class="muted">Quiet times in our album.</p>') + '</div></section>';
          }).join('') + '</div>' + detail(cur) + '</div>';
      }
      function detail(cur) {
        if (selEv != null) {
          var ev = events[selEv], t = ev.taxonId && D.byId(ev.taxonId);
          var e = UI.eraFor(D, ev.mya);
          return '<section class="card ev-detail" id="evd" style="--c:' + esc(e ? e.color : '#ff6b3d') + '"><div class="evd-txt"><div class="info-step">' + ev.mya + ' million years ago' + (e ? ' · ' + esc(e.name) : '') + '</div>' +
            '<h2>' + esc(ev.title) + '</h2><p>' + esc(ev.text) + '</p>' +
            (t ? '<div class="row"><button class="btn" data-go="' + t.id + '">🧬 See ' + esc(t.name) + '’s family path</button></div>' : '') +
            '</div>' + (t ? '<div class="evd-art">' + Art.svg(t.artId || t.id) + '<b>' + esc(t.name) + '</b></div>' : '') + '</section>';
        }
        var ts = taxaIn(cur);
        return '<section class="card ev-detail era-detail" id="evd" style="--c:' + esc(cur.color) + '"><div class="evd-txt"><div class="info-step">' + cur.startMya + '–' + cur.endMya + ' million years ago</div>' +
          '<h2>' + esc(cur.name) + '</h2><p>' + esc(cur.blurb) + '</p></div>' +
          (ts.length ? '<div class="era-taxa"><h3>Animals that show up in this age</h3><div class="chips">' + ts.map(function (t) {
            return '<button class="chip" data-go="' + t.id + '"><span class="chip-art">' + Art.svg(t.artId || t.id) + '</span><span class="chip-t">' + esc(t.name) + '</span></button>';
          }).join('') + '</div></div>' : '') + '</section>';
      }
      function onClick(e) {
        var b;
        if ((b = e.target.closest('[data-era]'))) { selEra = b.getAttribute('data-era'); selEv = null; keep(); return; }
        if ((b = e.target.closest('[data-ev]'))) {
          selEv = +b.getAttribute('data-ev');
          var ev = events[selEv], er = UI.eraFor(D, ev.mya); if (er) selEra = er.id;
          keep(); return;
        }
        if ((b = e.target.closest('[data-go]'))) ctx.go('lineage', { animal: b.getAttribute('data-go') });
      }
      function keep() {
        var sc = el.querySelector('#eraScroll'), x = sc ? sc.scrollLeft : 0;
        render();
        var n = el.querySelector('#eraScroll'); n.scrollLeft = x;
        var on = n.querySelector('.era-card.on');
        if (on) { var l = on.offsetLeft - (n.clientWidth - on.offsetWidth) / 2; try { n.scrollTo({ left: l, behavior: UI.reduced() ? 'auto' : 'smooth' }); } catch (e) { n.scrollLeft = l; } }
        var d = el.querySelector('#evd'); if (d) d.classList.add('flash');
      }
      render();
      var sc0 = el.querySelector('#eraScroll'), on0 = sc0.querySelector('.era-card.on');
      if (on0) sc0.scrollLeft = on0.offsetLeft - (sc0.clientWidth - on0.offsetWidth) / 2;
      el.addEventListener('click', onClick);
      return function () { el.removeEventListener('click', onClick); };
    }
  };
})();
