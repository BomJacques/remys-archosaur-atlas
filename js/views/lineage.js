/* Lineage Explorer: the flagship view */
(function () {
  'use strict';
  window.Views = window.Views || {};
  var LIVING = ['magpie', 'chicken', 'ostrich', 'penguin', 'hummingbird', 'crocodile', 'alligator', 'gecko', 'snake', 'tortoise', 'cat', 'human', 'tuatara'];

  Views.lineage = {
    title: 'Lineage Explorer', icon: '🧬',
    mount: function (el, ctx) {
      var D = ctx.DATA, Art = ctx.Art, UI = ctx.UI, esc = UI.esc;
      var living = LIVING.filter(function (id) { return D.byId(id); });
      var p = ctx.params || {};
      var saved = UI.store.get('remy.animal');
      var start = (p.animal && D.byId(p.animal)) ? p.animal : (saved && D.byId(saved) ? saved : (D.byId('magpie') ? 'magpie' : living[0]));
      var S = { animal: start, mode: 'path', idx: 0, b: null, sel: null, cousin: null, zoom: 1, playing: false };
      var raf = 0, playTimer = 0, alive = true, body;
      var cache = {};

      function path() { return D.pathTo(S.animal); }
      function mya0(t) { return t.modern ? 0 : Math.max(0, t.mya || 0); }
      function maxM() { var pa = path(); return Math.max(1, Math.ceil(pa[0].mya || 300)); }
      /* Time is drawn on a squashed (log) scale so 4 billion years still leaves room for the dinosaurs.
         wp: millions of years ago -> 0..1 (0 = oldest, left; 1 = today, right). wm is the inverse. */
      var SL = 1000;
      function wp(m, maxm) { return 1 - Math.log(1 + Math.max(0, m)) / Math.log(1 + maxm); }
      function wm(p, maxm) { return Math.exp((1 - p) * Math.log(1 + maxm)) - 1; }
      function bil(m) { return (Math.round(m / 100) / 10).toString().replace(/\.0$/, ''); }
      function fmtBig(m) { m = Math.round(m); return m >= 1000 ? '≈ ' + bil(m) + ' billion years ago' : '≈ ' + m + ' million years ago'; }
      function fmtShort(m) { return m >= 1000 ? bil(m) + ' Bya' : m + ' Mya'; }
      function eraOf(t) { return UI.eraFor(D, mya0(t)); }
      function colorOf(t) { var e = eraOf(t); return (e && e.color) || '#ff6b3d'; }
      function leaves(id) {
        if (cache[id]) return cache[id];
        var t = D.byId(id), kids = D.children(id), out = [];
        if (t.modern) out.push(id);
        kids.forEach(function (k) { out = out.concat(leaves(k.id)); });
        cache[id] = out;
        return out;
      }
      function nodeAt(m) {
        var pa = path(), r = 0, i;
        for (i = 0; i < pa.length; i++) if (mya0(pa[i]) >= m) r = i;
        return r;
      }
      function cousinsAt(i) {
        var pa = path(), n = pa[i], nxt = pa[i + 1];
        return D.children(n.id).filter(function (c) { return !nxt || c.id !== nxt.id; });
      }
      function tName(id) { var t = D.byId(id); return t ? t.name : id; }
      function art(t, cls) { return Art.svg(t.artId || t.id, { cls: cls || '' }); }

      /* ---------- shell ---------- */
      function chipRow(sel, attr) {
        var h = living.map(function (id) {
          var t = D.byId(id);
          return '<button class="chip' + (id === sel ? ' on' : '') + '" data-' + attr + '="' + id + '" aria-pressed="' + (id === sel) + '">' +
            '<span class="chip-art">' + art(t) + '</span><span class="chip-t">' + esc(t.name) + '</span></button>';
        }).join('');
        if (sel && living.indexOf(sel) < 0 && D.byId(sel)) {
          var x = D.byId(sel);
          h = '<button class="chip on" data-' + attr + '="' + sel + '" aria-pressed="true"><span class="chip-art">' + art(x) + '</span><span class="chip-t">' + esc(x.name) + '</span></button>' + h;
        }
        return h;
      }
      function shell() {
        el.innerHTML =
          '<div class="lin">' +
          '<header class="lin-head"><h1 class="page-title">Lineage Explorer</h1>' +
          '<p class="page-sub">Pick an animal. Then travel back through its family history.</p></header>' +
          '<div class="chips" id="pick" role="group" aria-label="Pick an animal">' + chipRow(S.animal, 'pick') + '</div>' +
          '<div class="tabs" role="tablist" aria-label="Explorer mode">' +
          tab('path', '🛤️ Ancestor path') + tab('tree', '🌳 Family tree') + tab('cmp', '🤝 Meet the cousin') + '</div>' +
          '<div class="lin-body" id="linBody"></div></div>';
        body = el.querySelector('#linBody');
      }
      function tab(id, label) {
        return '<button class="tab' + (S.mode === id ? ' on' : '') + '" role="tab" aria-selected="' + (S.mode === id) + '" data-mode="' + id + '">' + label + '</button>';
      }
      function renderMode() {
        stopPlay();
        el.querySelectorAll('.tab').forEach(function (b) {
          var on = b.getAttribute('data-mode') === S.mode;
          b.classList.toggle('on', on); b.setAttribute('aria-selected', on);
        });
        if (S.mode === 'path') renderPath();
        else if (S.mode === 'tree') renderTree();
        else renderCompare();
      }
      function refreshPicker() {
        el.querySelector('#pick').innerHTML = chipRow(S.animal, 'pick');
      }
      function setAnimal(id, keepMode) {
        if (!D.byId(id)) return;
        S.animal = id; S.cousin = null; S.idx = path().length - 1;
        if (living.indexOf(id) >= 0) UI.store.set('remy.animal', id);
        try { history.replaceState(null, '', '#/lineage/' + encodeURIComponent(id)); } catch (e) { /* ignore */ }
        refreshPicker();
        if (!keepMode) S.mode = S.mode === 'cmp' ? 'cmp' : S.mode;
        if (S.mode === 'tree') { S.sel = id; updateTreeHighlight(true); } else renderMode();
      }

      /* ---------- PATH MODE ---------- */
      var pathEl, stageEl;
      function renderPath() {
        var pa = path(), maxm = maxM();
        S.idx = Math.min(S.idx, pa.length - 1);
        var nodes = pa.map(function (t, i) {
          var cn = i < pa.length - 1 ? cousinsAt(i).length : 0;
          return (i ? '<span class="pconn" aria-hidden="true"></span>' : '') +
            '<button class="pnode" data-i="' + i + '" style="--c:' + esc(colorOf(t)) + '" aria-label="' + esc(t.name + ', ' + (mya0(t) ? fmtBig(mya0(t)) : 'today')) + '">' +
            '<span class="pn-art">' + art(t) + '</span><span class="pn-name">' + esc(t.name) + '</span>' +
            '<span class="pn-mya">' + (mya0(t) ? fmtShort(mya0(t)) : 'today') + '</span>' +
            (cn ? '<span class="pn-badge" title="' + cn + ' side branch' + (cn > 1 ? 'es' : '') + '">+' + cn + '</span>' : '') + '</button>';
        }).join('');
        var marks = pa.map(function (t) {
          return '<span class="smark" style="left:' + UI.clamp(wp(mya0(t), maxm) * 100, 0, 100) + '%"></span>';
        }).join('');
        body.innerHTML =
          '<div class="pathwrap" id="pathWrap"><div class="path" id="pathEl" role="list">' + nodes + '</div></div>' +
          '<div class="card sl-card">' +
          '<div class="sl-top"><button class="btn" id="playBtn">▶ Play the journey</button>' +
          '<div class="sl-time"><span class="sl-big" id="slBig"></span><span class="sl-era" id="slEra"></span></div></div>' +
          '<div class="sl-track-wrap"><div class="sl-marks">' + marks + '</div>' +
          '<input class="sl" id="sl" type="range" min="0" max="' + SL + '" step="1" value="' + SL + '" aria-label="Time slider: drag to travel back in time" style="--track:' + trackGradient(maxm) + '">' +
          '</div><div class="sl-ends"><span>◀ ' + fmtBig(maxm).replace('≈ ', '') + '</span><span>Today ▶</span></div></div>' +
          '<div class="stage" id="stage"></div><div id="cousins"></div>';
        pathEl = body.querySelector('#pathEl'); stageEl = body.querySelector('#stage');
        stageEl.innerHTML = '<div class="scene" id="scene"><div class="scene-bg" id="sceneBg"></div><div class="scene-art" id="sceneArt"></div>' +
          '<span class="scene-era" id="sceneEra"></span></div><div class="info" id="info"></div>';
        S.eraId = null;
        select(S.idx, { noTween: true, noScroll: false, instant: true });
        var s = body.querySelector('#sl'); s.value = Math.round(wp(mya0(pa[S.idx]), maxm) * SL);
        paintSlider();
      }
      function trackGradient(maxm) {
        var stops = [];
        (D.eras || []).forEach(function (e) {
          var a = wp(Math.min(e.startMya, maxm), maxm), b = wp(e.endMya, maxm);
          if (b <= 0 || a >= 1) return;
          a = UI.clamp(a, 0, 1); b = UI.clamp(b, 0, 1);
          stops.push(e.color + ' ' + (a * 100).toFixed(1) + '%', e.color + ' ' + (b * 100).toFixed(1) + '%');
        });
        return stops.length ? 'linear-gradient(90deg,' + stops.join(',') + ')' : 'linear-gradient(90deg,#ffd9a0,#9be3d7)';
      }
      function paintSlider() {
        var s = body.querySelector('#sl'); if (!s) return;
        var m = Math.max(0, wm(+s.value / SL, maxM()));
        var big = body.querySelector('#slBig'), er = body.querySelector('#slEra');
        if (big) big.textContent = m < 0.5 ? 'Today' : fmtBig(m);
        var e = UI.eraFor(D, m);
        if (er && e) er.textContent = e.name;
      }
      function tween(to) {
        var s = body.querySelector('#sl'); if (!s) return;
        cancelAnimationFrame(raf);
        if (UI.reduced()) { s.value = to; paintSlider(); return; }
        var from = +s.value, t0 = performance.now();
        (function f(n) {
          var k = Math.min(1, (n - t0) / 500); k = 1 - Math.pow(1 - k, 3);
          s.value = from + (to - from) * k; paintSlider();
          if (k < 1 && alive) raf = requestAnimationFrame(f);
        })(t0);
      }
      function select(i, o) {
        o = o || {};
        var pa = path(); i = UI.clamp(i, 0, pa.length - 1);
        var dir = i >= S.idx ? 1 : -1; S.idx = i; S.cousin = null;
        pathEl.querySelectorAll('.pnode').forEach(function (b) {
          var on = +b.getAttribute('data-i') === i;
          b.classList.toggle('on', on); b.classList.toggle('past', +b.getAttribute('data-i') < i);
          if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
        });
        if (!o.fromSlider) tween(Math.round(wp(mya0(pa[i]), maxM()) * SL));
        var on = pathEl.querySelector('.pnode.on'), wrap = body.querySelector('#pathWrap');
        if (on && wrap) {
          var left = on.offsetLeft - (wrap.clientWidth - on.offsetWidth) / 2;
          try { wrap.scrollTo({ left: left, behavior: o.instant || UI.reduced() ? 'auto' : 'smooth' }); } catch (e) { wrap.scrollLeft = left; }
        }
        updateStage(dir, o);
        updateCousins();
      }
      function updateStage(dir, o) {
        var pa = path(), t = pa[S.idx], last = S.idx === pa.length - 1;
        var era = eraOf(t), m = mya0(t);
        var scene = body.querySelector('#scene');
        scene.style.setProperty('--c', (era && era.color) || '#ffd9a0');
        if (era && S.eraId !== era.id) {
          S.eraId = era.id;
          var bg = body.querySelector('#sceneBg');
          var layer = document.createElement('div');
          layer.className = 'bg-layer';
          layer.innerHTML = Art.has(era.sceneArtId) ? Art.svg(era.sceneArtId, { slice: true }) : '';
          bg.appendChild(layer);
          setTimeout(function () { while (bg.children.length > 1) bg.removeChild(bg.firstChild); }, 700);
          var le = body.querySelector('#sceneEra');
          le.textContent = era.name; le.style.background = era.color;
        }
        var sa = body.querySelector('#sceneArt');
        sa.innerHTML = '<div class="hero-art ' + (dir > 0 ? 'in-r' : 'in-l') + '">' + art(t) + '</div>';
        var next = pa[S.idx + 1], prev = pa[S.idx - 1];
        var h = '<div class="info-in">' +
          '<div class="info-step">Step ' + (S.idx + 1) + ' of ' + pa.length + ' · ' + (m ? 'first appears ' + UI.fmtMya(m) : 'living today') + '</div>' +
          '<h2 class="info-name">' + esc(t.name) + '</h2>' + (UI.pronHtml ? UI.pronHtml(t.id) : '') +
          (t.nickname ? '<p class="info-nick">“' + esc(t.nickname) + '”</p>' : '') +
          (last ? '<div class="you-here">📍 This is the animal you picked!</div>' : '<div class="you-here ghost">An ancestor group of ' + esc(tName(S.animal)) + '</div>') +
          (t.keyTrait ? '<div class="keytrait"><b>✨ New at this step</b><span>' + esc(t.keyTrait) + '</span></div>' : '') +
          (t.blurb ? '<p class="info-blurb">' + esc(t.blurb) + '</p>' : '') +
          statChips(t) +
          (t.facts && t.facts.length ? '<ul class="facts">' + t.facts.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '') +
          (t.whyItMatters ? '<div class="why"><b>🧠 Why it matters</b><span>' + esc(t.whyItMatters) + '</span></div>' : '') +
          (last ? animalExtra(t.id) : '') +
          UI.arButton(t.id) +
          '<div class="stepper"><button class="btn btn-ghost" data-step="-1"' + (prev ? '' : ' disabled') + '>⏪ Older' + (prev ? ': ' + esc(prev.name) : '') + '</button>' +
          '<button class="btn" data-step="1"' + (next ? '' : ' disabled') + '>' + (next ? 'Newer: ' + esc(next.name) : 'Today') + ' ⏩</button></div></div>';
        body.querySelector('#info').innerHTML = h;
      }
      function statChips(t) {
        var c = [];
        if (t.diet) c.push('🍽️ ' + t.diet);
        if (t.lengthM) c.push('📏 ' + t.lengthM + ' m long');
        if (t.massKg) c.push('⚖️ ' + (t.massKg >= 1000 ? (t.massKg / 1000) + ' tonnes' : t.massKg + ' kg'));
        if (t.habitat) c.push('🌍 ' + t.habitat);
        return c.length ? '<div class="stats">' + c.map(function (x) { return '<span class="stat">' + esc(x) + '</span>'; }).join('') + '</div>' : '';
      }
      function animalExtra(id) {
        var a = (D.animals || []).filter(function (x) { return x.id === id; })[0];
        if (!a) return '';
        return '<div class="animal-extra"><h3>' + esc(a.headline) + '</h3>' +
          (a.proof && a.proof.length ? '<ol>' + a.proof.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' : '') +
          (a.cousinNote ? '<p><b>Cousins:</b> ' + esc(a.cousinNote) + '</p>' : '') +
          (a.funFact ? '<p><b>Fun fact:</b> ' + esc(a.funFact) + '</p>' : '') + '</div>';
      }
      function updateCousins() {
        var pa = path(), i = S.idx, box = body.querySelector('#cousins');
        var cs = i < pa.length - 1 ? cousinsAt(i) : [];
        var t = pa[i], h;
        if (i === pa.length - 1) {
          h = '<section class="card cousins"><h3>🌿 Cousins</h3><p>' + esc(t.name) + ' is at the very tip of its branch. Cousins split off at earlier steps. Look for the green <b>+</b> badges on the path above.</p>' +
            '<button class="btn" data-step="-1">⏪ Go back one step</button></section>';
        } else if (!cs.length) {
          h = '<section class="card cousins"><h3>🌿 Cousins</h3><p>No side branches split off at this step in our album. The family just kept going on one line.</p></section>';
        } else {
          h = '<section class="card cousins"><h3>🌿 Cousins that split off after ' + esc(t.name) + '</h3>' +
            '<p>Long ago this family divided into branches. ' + esc(tName(S.animal)) + ' came from one branch. These are the others. They are <b>cousins</b>, not ancestors. Tap one!</p>' +
            '<div class="cousin-row">' + cs.map(function (c) {
              return '<button class="cousin' + (S.cousin === c.id ? ' on' : '') + '" data-cousin="' + c.id + '" aria-pressed="' + (S.cousin === c.id) + '" style="--c:' + esc(colorOf(c)) + '">' +
                '<span class="co-art">' + art(c) + '</span><span class="co-name">' + esc(c.name) + '</span>' +
                (c.nickname ? '<span class="co-nick">' + esc(c.nickname) + '</span>' : '') + '</button>';
            }).join('') + '</div><div id="cousinDetail"></div></section>';
        }
        box.innerHTML = h;
        if (S.cousin) fillCousin();
      }
      function fillCousin() {
        var c = D.byId(S.cousin), d = body.querySelector('#cousinDetail'); if (!c || !d) return;
        var lv = leaves(c.id).filter(function (id) { return id !== S.animal; });
        d.innerHTML = '<div class="co-detail"><div class="co-detail-art">' + art(c) + '</div><div class="co-detail-txt">' +
          '<h4>' + esc(c.name) + (c.nickname ? ' <small>“' + esc(c.nickname) + '”</small>' : '') + '</h4>' + (UI.pronHtml ? UI.pronHtml(c.id) : '') +
          '<p>' + esc(c.blurb || '') + '</p>' +
          (lv.length ? '<p class="live-line"><b>Living today:</b> ' + lv.slice(0, 6).map(function (id) { return '<button class="mini-link" data-trace="' + id + '">' + esc(tName(id)) + '</button>'; }).join(' ') + '</p>' :
            '<p class="live-line muted">No living animals from this branch. It is extinct.</p>') +
          UI.arButton(c.id) +
          '<div class="row"><button class="btn" data-compare="' + c.id + '">🤝 Compare with ' + esc(tName(S.animal)) + '</button></div></div></div>';
      }

      /* ---------- TREE MODE ---------- */
      var TL = null;
      function layout() {
        if (TL) return TL;
        var root = D.taxa.filter(function (t) { return !t.parent; })[0];
        var pos = {}, row = 0;
        (function walk(t) {
          var ks = D.children(t.id);
          if (!ks.length) { pos[t.id] = { row: row++ }; return; }
          ks.forEach(walk);
          var s = 0; ks.forEach(function (k) { s += pos[k.id].row; });
          pos[t.id] = { row: s / ks.length };
        })(root);
        var W = 900, padL = 28, padR = 170, padT = 54, rowH = 34, maxm = Math.max(root.mya, 320);
        D.taxa.forEach(function (t) {
          var m = t.modern ? 0 : (t.mya || 0);
          pos[t.id].x = padL + wp(m, maxm) * W;
          pos[t.id].y = padT + pos[t.id].row * rowH;
        });
        TL = { pos: pos, W: W, padL: padL, padR: padR, padT: padT, rowH: rowH, maxm: maxm, rows: row, w: W + padL + padR, h: padT + row * rowH + 20 };
        return TL;
      }
      function renderTree() {
        var L = layout(); if (!S.sel) S.sel = S.animal;
        var svg = '<svg class="tree-svg" id="treeSvg" viewBox="0 0 ' + L.w + ' ' + L.h + '" width="' + (L.w * S.zoom) + '" height="' + (L.h * S.zoom) + '" role="group" aria-label="Family tree of all animals in the album">';
        (D.eras || []).forEach(function (e) {
          var x1 = L.padL + wp(Math.min(e.startMya, L.maxm), L.maxm) * L.W, x2 = L.padL + wp(e.endMya, L.maxm) * L.W;
          if (x2 <= x1) return;
          svg += '<rect x="' + x1 + '" y="0" width="' + (x2 - x1) + '" height="' + L.h + '" fill="' + esc(e.color) + '" opacity=".13"/>' +
            '<text class="era-lbl" x="' + (x1 + 6) + '" y="22" fill="' + esc(e.color) + '">' + esc(e.name) + '</text>';
        });
        var edges = '', nodes = '';
        D.taxa.forEach(function (t) {
          var P = L.pos[t.id];
          if (t.parent) {
            var Q = L.pos[t.parent];
            edges += '<path class="edge" data-e="' + t.id + '" d="M' + Q.x + ',' + Q.y + ' V' + P.y + ' H' + P.x + '"/>';
          }
          var kids = D.children(t.id).length;
          nodes += '<g class="tnode' + (kids ? '' : ' leaf') + (t.modern ? ' liv' : '') + '" data-t="' + t.id + '" tabindex="0" role="button" aria-label="' + esc(t.name) + '" transform="translate(' + P.x + ',' + P.y + ')">' +
            '<circle class="hit" r="17"/><circle class="dot" r="' + (t.modern ? 8 : 6) + '" fill="' + esc(colorOf(t)) + '"/>' +
            '<text class="tlbl" x="' + (kids ? 0 : 12) + '" y="' + (kids ? -11 : 5) + '" text-anchor="' + (kids ? 'middle' : 'start') + '">' + esc(t.name) + '</text></g>';
        });
        svg += edges + nodes + '</svg>';
        body.innerHTML =
          '<div class="card tree-card"><div class="tree-bar"><p class="tree-hint">Your path is lit up. Tap any dot to learn about it. Scroll to look around.</p>' +
          '<div class="zoomctl"><button class="btn btn-ghost" data-zoom="-1" aria-label="Zoom out">−</button><span id="zoomLbl">' + Math.round(S.zoom * 100) + '%</span>' +
          '<button class="btn btn-ghost" data-zoom="1" aria-label="Zoom in">+</button><button class="btn btn-ghost" data-zoom="fit">Find ' + esc(tName(S.animal)) + '</button></div></div>' +
          '<div class="tree-scroll" id="treeScroll">' + svg + '</div></div><div id="treeInfo"></div>';
        updateTreeHighlight(false);
        setTimeout(function () { centerTree(true); }, 30);
      }
      function updateTreeHighlight(smooth) {
        var svg = body.querySelector('#treeSvg'); if (!svg) return;
        var onp = {}; path().forEach(function (t) { onp[t.id] = true; });
        svg.querySelectorAll('.edge').forEach(function (e) { e.classList.toggle('on', !!onp[e.getAttribute('data-e')]); });
        svg.querySelectorAll('.tnode').forEach(function (n) {
          var id = n.getAttribute('data-t');
          n.classList.toggle('on', !!onp[id]); n.classList.toggle('sel', id === S.sel);
        });
        // draw path edges on top
        var tops = svg.querySelectorAll('.edge.on'); tops.forEach(function (e) { e.parentNode.insertBefore(e, svg.querySelector('.tnode')); });
        var lbl = body.querySelector('.zoomctl .btn:last-child'); if (lbl) lbl.textContent = 'Find ' + tName(S.animal);
        treeInfo();
        if (smooth) centerTree(false);
      }
      function centerTree(instant) {
        var sc = body.querySelector('#treeScroll'); if (!sc) return;
        var P = layout().pos[S.sel || S.animal]; if (!P) return;
        var x = P.x * S.zoom - sc.clientWidth * 0.6, y = P.y * S.zoom - sc.clientHeight / 2;
        try { sc.scrollTo({ left: Math.max(0, x), top: Math.max(0, y), behavior: instant || UI.reduced() ? 'auto' : 'smooth' }); } catch (e) { sc.scrollLeft = x; sc.scrollTop = y; }
      }
      function treeInfo() {
        var box = body.querySelector('#treeInfo'); if (!box) return;
        var t = D.byId(S.sel), onp = path().some(function (x) { return x.id === t.id; });
        var rel;
        if (t.id === S.animal) rel = '📍 This is ' + esc(t.name) + ', the animal you picked.';
        else if (onp) rel = '🛤️ An <b>ancestor</b> of ' + esc(tName(S.animal)) + '. It is on the lit-up path.';
        else {
          var l = D.lca(S.animal, t.id);
          rel = '🌿 A <b>cousin</b> branch. ' + (D.mrcaStory ? esc(D.mrcaStory(S.animal, t.id)) : (l ? 'You share an ancestor: ' + esc(l.name) : ''));
        }
        box.innerHTML = '<section class="card tree-info" style="--c:' + esc(colorOf(t)) + '"><div class="ti-art">' + art(t) + '</div><div class="ti-txt">' +
          '<h3>' + esc(t.name) + (t.nickname ? ' <small>“' + esc(t.nickname) + '”</small>' : '') + '</h3>' + (UI.pronHtml ? UI.pronHtml(t.id) : '') +
          '<p class="ti-rel">' + rel + '</p><p>' + esc(t.blurb || '') + '</p>' +
          '<p class="muted">' + (t.modern ? 'Living today' : 'First appears ' + UI.fmtMya(t.mya)) + '</p>' + UI.arButton(t.id) +
          '<div class="row">' + (t.modern && t.id !== S.animal ? '<button class="btn" data-trace="' + t.id + '">🧬 Trace ' + esc(t.name) + '</button>' : '') +
          (onp ? '<button class="btn" data-openpath="' + t.id + '">🛤️ Show on the path</button>' : '') +
          (t.id !== S.animal ? '<button class="btn btn-ghost" data-compare="' + t.id + '">🤝 Compare with ' + esc(tName(S.animal)) + '</button>' : '') +
          '</div></div></section>';
      }
      function zoom(d) {
        S.zoom = d === 'fit' ? 1 : UI.clamp(S.zoom + d * 0.25, 0.5, 2.5);
        var L = layout(), svg = body.querySelector('#treeSvg');
        svg.setAttribute('width', L.w * S.zoom); svg.setAttribute('height', L.h * S.zoom);
        body.querySelector('#zoomLbl').textContent = Math.round(S.zoom * 100) + '%';
        S.sel = d === 'fit' ? S.animal : S.sel;
        if (d === 'fit') updateTreeHighlight(false);
        centerTree(false);
      }

      /* ---------- COMPARE MODE ---------- */
      function pickDefaultB() {
        var c = ['crocodile', 'magpie', 'human', 'gecko'];
        for (var i = 0; i < c.length; i++) if (c[i] !== S.animal && D.byId(c[i])) return c[i];
        return living[0];
      }
      function renderCompare() {
        if (!S.b || !D.byId(S.b) || S.b === S.animal) S.b = pickDefaultB();
        var a = D.byId(S.animal), b = D.byId(S.b);
        var same = a.id === b.id, l = same ? a : D.lca(a.id, b.id);
        var pa = D.pathTo(a.id), pb = D.pathTo(b.id);
        var li = l ? pa.map(function (t) { return t.id; }).indexOf(l.id) : 0;
        var sa = pa.slice(li + 1), sb = pb.slice(li + 1);
        body.innerHTML =
          '<div class="card cmp-pick"><div class="cmp-pickrow"><b>Animal 1</b><div class="chips small" id="cmpA">' + chipRow(S.animal, 'ca') + '</div></div>' +
          '<div class="cmp-pickrow"><b>Animal 2</b><div class="chips small" id="cmpB">' + chipRow(S.b, 'cb') + '</div></div>' +
          '<div class="row"><button class="btn btn-ghost" id="swap">⇄ Swap</button><button class="btn" id="surprise">🎲 Surprise me</button></div></div>' +
          '<div class="versus"><div class="vs-card" style="--c:' + esc(colorOf(a)) + '">' + art(a) + '<h3>' + esc(a.name) + '</h3></div><div class="vs-mid">🤝</div>' +
          '<div class="vs-card" style="--c:' + esc(colorOf(b)) + '">' + art(b) + '<h3>' + esc(b.name) + '</h3></div></div>' +
          '<section class="card cmp-result">' + (same ? '<h3>That is the same animal!</h3><p>Pick a different Animal 2 to meet a cousin.</p>' :
            '<h3>Their last shared ancestor</h3><div class="cmp-lca">' + (l ? '<div class="lca-art">' + art(l) + '</div>' : '') +
            '<div><h4>' + esc(l ? l.name : '?') + (l && l.nickname ? ' <small>“' + esc(l.nickname) + '”</small>' : '') + '</h4>' +
            '<p class="story">' + esc(D.mrcaStory ? D.mrcaStory(a.id, b.id) : '') + '</p>' +
            (l && l.keyTrait ? '<p class="muted">' + esc(l.keyTrait) + '</p>' : '') + '</div></div>' +
            '<div class="cmp-diagram">' + diagram(l, a, b, sa, sb) + '</div>' +
            '<p class="steps">' + esc(a.name) + ' is <b>' + sa.length + '</b> step' + (sa.length === 1 ? '' : 's') + ' from the shared ancestor. ' + esc(b.name) + ' is <b>' + sb.length + '</b>. ' +
            'Both kept evolving for the same amount of time since they split. Neither is "more advanced".</p>' +
            '<div class="row"><button class="btn" data-trace="' + a.id + '">🧬 Trace ' + esc(a.name) + '</button>' +
            (b.modern ? '<button class="btn" data-trace="' + b.id + '">🧬 Trace ' + esc(b.name) + '</button>' : '') + '</div>') + '</section>';
      }
      function diagram(l, a, b, sa, sb) {
        var W = 640, H = 270, lx = 70, ly = H / 2, ex = 520, ay = 52, by = H - 52;
        function branch(steps, y, col, endT) {
          var s = '<path class="dg-line" d="M' + lx + ',' + ly + ' C' + (lx + 120) + ',' + ly + ' ' + (lx + 120) + ',' + y + ' ' + (lx + 200) + ',' + y + ' L' + ex + ',' + y + '" stroke="' + col + '"/>';
          var inter = steps.slice(0, -1), n = inter.length;
          inter.forEach(function (t, i) {
            var x = lx + 200 + (ex - lx - 200) * (i + 1) / (n + 1);
            s += '<circle cx="' + x + '" cy="' + y + '" r="7" fill="#fff" stroke="' + col + '" stroke-width="4"><title>' + esc(t.name) + '</title></circle>';
            if (n <= 4) s += '<text class="dg-small" x="' + x + '" y="' + (y + (y < ly ? -14 : 24)) + '" text-anchor="middle">' + esc(t.name) + '</text>';
          });
          s += '<circle cx="' + ex + '" cy="' + y + '" r="11" fill="' + col + '"/><text class="dg-end" x="' + (ex + 18) + '" y="' + (y + 6) + '">' + esc(endT.name) + '</text>';
          return s;
        }
        var ca = '#ff6b3d', cb = '#2bb3a3';
        return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="dg" role="img" aria-label="Diagram: ' + esc(a.name) + ' and ' + esc(b.name) + ' split from ' + esc(l ? l.name : 'a shared ancestor') + '">' +
          branch(sa.length ? sa : [a], ay, ca, a) + branch(sb.length ? sb : [b], by, cb, b) +
          '<circle cx="' + lx + '" cy="' + ly + '" r="15" fill="#ffd23f" stroke="#26324a" stroke-width="3"/>' +
          '<text class="dg-end" x="' + lx + '" y="' + (ly + 38) + '" text-anchor="middle">' + esc(l ? l.name : '') + '</text>' +
          (l && l.mya ? '<text class="dg-small" x="' + lx + '" y="' + (ly - 24) + '" text-anchor="middle">~' + l.mya + ' Mya</text>' : '') + '</svg>';
      }

      /* ---------- play ---------- */
      function stopPlay() {
        S.playing = false; clearTimeout(playTimer);
        var b = body && body.querySelector('#playBtn'); if (b) b.textContent = '▶ Play the journey';
      }
      function startPlay() {
        S.playing = true; S.idx = -1;
        var b = body.querySelector('#playBtn'); if (b) b.textContent = '⏸ Pause';
        (function step() {
          if (!S.playing || !alive) return;
          var n = S.idx + 1;
          if (n >= path().length) { stopPlay(); return; }
          select(n); playTimer = setTimeout(step, 2600);
        })();
      }

      /* ---------- events ---------- */
      function onClick(e) {
        var t = e.target, b;
        if ((b = t.closest('[data-pick]'))) { stopPlay(); setAnimal(b.getAttribute('data-pick')); return; }
        if ((b = t.closest('[data-mode]'))) { S.mode = b.getAttribute('data-mode'); renderMode(); return; }
        if ((b = t.closest('.pnode'))) { stopPlay(); select(+b.getAttribute('data-i')); return; }
        if ((b = t.closest('[data-step]'))) { stopPlay(); select(S.idx + (+b.getAttribute('data-step'))); return; }
        if (t.closest('#playBtn')) { if (S.playing) stopPlay(); else startPlay(); return; }
        if ((b = t.closest('[data-cousin]'))) {
          var id = b.getAttribute('data-cousin'); S.cousin = S.cousin === id ? null : id;
          body.querySelectorAll('.cousin').forEach(function (x) { var on = x.getAttribute('data-cousin') === S.cousin; x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); });
          var d = body.querySelector('#cousinDetail'); d.innerHTML = '';
          if (S.cousin) { fillCousin(); try { d.scrollIntoView({ behavior: UI.reduced() ? 'auto' : 'smooth', block: 'nearest' }); } catch (x) { /* ignore */ } }
          return;
        }
        if ((b = t.closest('[data-trace]'))) {
          var id2 = b.getAttribute('data-trace'); S.mode = 'path';
          setAnimal(id2); window.scrollTo(0, 0); return;
        }
        if ((b = t.closest('[data-compare]'))) { S.b = b.getAttribute('data-compare'); S.mode = 'cmp'; renderMode(); window.scrollTo(0, 0); return; }
        if ((b = t.closest('[data-openpath]'))) {
          var pa = path(), ix = pa.map(function (x) { return x.id; }).indexOf(b.getAttribute('data-openpath'));
          S.mode = 'path'; S.idx = Math.max(0, ix); renderMode(); window.scrollTo(0, 0); return;
        }
        if ((b = t.closest('[data-zoom]'))) { var z = b.getAttribute('data-zoom'); zoom(z === 'fit' ? 'fit' : +z); return; }
        if ((b = t.closest('.tnode'))) { S.sel = b.getAttribute('data-t'); updateTreeHighlight(false); return; }
        if ((b = t.closest('[data-ca]'))) { S.animal = b.getAttribute('data-ca'); S.idx = path().length - 1; UI.store.set('remy.animal', S.animal); refreshPicker(); renderCompare(); return; }
        if ((b = t.closest('[data-cb]'))) { S.b = b.getAttribute('data-cb'); renderCompare(); return; }
        if (t.closest('#swap')) { var x = S.animal; S.animal = S.b; S.b = x; S.idx = path().length - 1; refreshPicker(); renderCompare(); return; }
        if (t.closest('#surprise')) {
          var pool = living.filter(function (id) { return id !== S.animal; });
          S.b = pool[Math.floor(Math.random() * pool.length)]; renderCompare(); return;
        }
      }
      function onInput(e) {
        if (e.target.id !== 'sl') return;
        stopPlay(); cancelAnimationFrame(raf); paintSlider();
        var i = nodeAt(Math.max(0, wm(+e.target.value / SL, maxM())));
        if (i !== S.idx) select(i, { fromSlider: true });
      }
      function onKey(e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('.tnode')) {
          e.preventDefault(); S.sel = e.target.closest('.tnode').getAttribute('data-t'); updateTreeHighlight(false);
        } else if (S.mode === 'path' && !/INPUT|TEXTAREA/.test(e.target.tagName)) {
          if (e.key === 'ArrowRight') select(S.idx + 1); else if (e.key === 'ArrowLeft') select(S.idx - 1);
        }
      }

      shell();
      S.idx = path().length - 1;
      renderMode();
      el.addEventListener('click', onClick);
      el.addEventListener('input', onInput);
      el.addEventListener('keydown', onKey);
      return function () {
        alive = false; stopPlay(); cancelAnimationFrame(raf);
        el.removeEventListener('click', onClick); el.removeEventListener('input', onInput); el.removeEventListener('keydown', onKey);
      };
    }
  };
})();
