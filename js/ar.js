/* ar.js: life-size 3D / AR dinosaurs.
   - window.AR_MODELS : taxon id -> model id (for the little "AR" buttons elsewhere)
   - window.openAR(idOrTaxonId) : opens the 3D + AR viewer
   - Views.ar : the "Life-size dinos" gallery page (with credits)
   iPad/iPhone use Apple AR Quick Look (the .usdz file); Android uses WebXR/Scene Viewer (the .glb). */
(function () {
  'use strict';
  var UI = window.UI;
  var esc = UI ? UI.esc : function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var BASE = 'assets/models/';
  var BUS_M = 12, KID_M = 1.3;

  var MODELS = [
    { id: 'trex', name: 'Tyrannosaurus rex', nick: 'T. rex', len: 12.3, what: 'long', taxon: 'trex',
      blurb: 'The famous tyrant lizard king. A bird-line theropod: its closest living relatives are birds like the magpie!',
      clips: ['Idle', 'Bite'], def: 'Idle',
      credit: { title: 'Animated T-Rex Dinosaur Biting Attack Loop', author: 'LasquetiSpice', authorUrl: 'https://sketchfab.com/LasquetiSpice', url: 'https://sketchfab.com/3d-models/animated-t-rex-dinosaur-biting-attack-loop-5bbcadb7d9274843abb5ada35767dba1' } },
    { id: 'ankylosaurus', name: 'Ankylosaurus', nick: 'Armoured tank', len: 6.5, what: 'long', taxon: 'ankylosaurus',
      blurb: 'A living tank! Bony armour covered its back, and a heavy club swung at the end of its tail.',
      clips: ['Idle'], def: 'Idle',
      credit: { title: 'Ankylosaurus Updated', author: 'kenchoo', authorUrl: 'https://sketchfab.com/kenchoo', url: 'https://sketchfab.com/3d-models/ankylosaurus-updated-9ba4629a871c4b0fa792fc1bb629881b' } },
    { id: 'carnotaurus', name: 'Carnotaurus', nick: 'Horned meat-eater', len: 7.5, what: 'long', taxon: null,
      blurb: 'A speedy South American theropod with two small horns over its eyes and very tiny arms.',
      clips: ['Idle'], def: 'Idle',
      credit: { title: 'primal carnage carnotaurus', author: 'seth the yutyrannus', authorUrl: 'https://sketchfab.com/slang107123456789', url: 'https://sketchfab.com/3d-models/primal-carnage-carnotaurus-e7013ee8fb3a4ce4b58da29a8c1f6d6e' } },
    { id: 'diplodocus', name: 'Diplodocus', nick: 'Whip-tail giant', len: 24, what: 'long', taxon: 'sauropodomorph',
      blurb: 'One of the longest dinosaurs. A sauropod: the long-necked family. Its tail was like a giant whip.',
      clips: ['Idle', 'Walk', 'Eat high'], def: 'Idle',
      credit: { title: 'Dinosaur', author: 'mortalityrexotable', authorUrl: 'https://sketchfab.com/mortalityrexotable', url: 'https://sketchfab.com/3d-models/dinosaur-0a43eeb601264d728fb5848ee62482b5' } },
    { id: 'pterosaur', name: 'Pterosaur (Pteranodon-style)', nick: 'Sky glider', len: 6, what: 'wingspan', taxon: 'pterosaur',
      blurb: 'Pterosaurs flew, but they were NOT dinosaurs. They were archosaur cousins. This one is Pteranodon-sized, and the real giants like Quetzalcoatlus were bigger still.',
      clips: ['Fly', 'Idle'], def: 'Fly', arClip: 'Idle',
      credit: { title: 'Animated Flying Pteradactal Dinosaur Loop', author: 'LasquetiSpice', authorUrl: 'https://sketchfab.com/LasquetiSpice', url: 'https://sketchfab.com/3d-models/animated-flying-pteradactal-dinosaur-loop-09f6b1ff7bfd4a2d8d9c0b9827f2a708' } }
  ];
  var byId = {};
  MODELS.forEach(function (m) { byId[m.id] = m; });

  /* taxon id -> model id (drives the AR buttons on other pages) */
  window.AR_MODELS = {};
  MODELS.forEach(function (m) { if (m.taxon) window.AR_MODELS[m.taxon] = m.id; });

  function sizeLine(m) {
    var n = m.len;
    var buses = n / BUS_M, kids = n / KID_M;
    var cmp = buses >= 0.9 ? 'about ' + (Math.round(buses * 10) / 10) + ' city bus' + (Math.round(buses) === 1 ? '' : 'es') + ' ' + (m.what === 'long' ? 'long' : 'wide')
      : 'about ' + Math.round(kids) + ' kids ' + (m.what === 'long' ? 'lying head to toe' : 'with arms out');
    return n + ' m ' + (m.what === 'long' ? 'long' : 'wingspan') + ' · ' + cmp;
  }

  /* ---------- viewer overlay ---------- */
  var mvLoading = null;
  function loadViewer() {
    if (window.customElements && window.customElements.get('model-viewer')) return Promise.resolve();
    if (mvLoading) return mvLoading;
    mvLoading = new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.type = 'module'; s.src = 'js/vendor/model-viewer.min.js';
      s.onload = function () { res(); }; s.onerror = function () { mvLoading = null; rej(new Error('viewer failed to load')); };
      document.head.appendChild(s);
    });
    return mvLoading;
  }

  var overlay = null, lastFocus = null;
  function close() {
    if (!overlay) return;
    overlay.remove(); overlay = null;
    document.body.classList.remove('ar-open');
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { } }
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  window.openAR = function (id) {
    var mid = byId[id] ? id : window.AR_MODELS[id];
    var m = byId[mid];
    if (!m) return;
    close();
    lastFocus = document.activeElement;
    overlay = document.createElement('div');
    overlay.className = 'ar-overlay';
    overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-label', m.name + ' in 3D');
    var c = m.credit;
    overlay.innerHTML =
      '<div class="ar-sheet">' +
      '<button class="ar-close" aria-label="Close" type="button">✕</button>' +
      '<h2 class="ar-title">' + esc(m.name) + '</h2>' +
      '<p class="ar-size">📏 ' + esc(sizeLine(m)) + '</p>' +
      '<div class="ar-stage"><div class="ar-loading">Waking up the dinosaur…</div></div>' +
      '<div class="ar-clips" role="group" aria-label="Animations"></div>' +
      '<button class="ar-go" type="button" hidden>📱 See it life-size in AR</button>' +
      '<p class="ar-note" aria-live="polite"></p>' +
      '<p class="ar-blurb">' + esc(m.blurb) + '</p>' +
      '<p class="ar-credit">3D model “' + esc(c.title) + '” by <a href="' + esc(c.authorUrl) + '" target="_blank" rel="noopener">' + esc(c.author) + '</a> (<a href="' + esc(c.url) + '" target="_blank" rel="noopener">source</a>), ' +
      '<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. Scaled, re-textured and converted for AR.</p>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.classList.add('ar-open');
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay.querySelector('.ar-close').addEventListener('click', close);
    overlay.querySelector('.ar-close').focus({ preventScroll: true });

    var stage = overlay.querySelector('.ar-stage'), note = overlay.querySelector('.ar-note');
    var go = overlay.querySelector('.ar-go'), clipsEl = overlay.querySelector('.ar-clips');
    loadViewer().then(function () {
      if (!overlay) return;
      var mv = document.createElement('model-viewer');
      mv.setAttribute('src', BASE + m.id + '.glb');
      mv.setAttribute('ios-src', BASE + m.id + '.usdz');
      mv.setAttribute('poster', BASE + m.id + '-poster.jpg');
      mv.setAttribute('alt', 'A 3D model of ' + m.name);
      mv.setAttribute('ar', ''); mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look'); mv.setAttribute('ar-scale', 'fixed');
      mv.setAttribute('camera-controls', ''); mv.setAttribute('touch-action', 'pan-y');
      mv.setAttribute('autoplay', ''); mv.setAttribute('animation-name', m.def);
      mv.setAttribute('shadow-intensity', '1'); mv.setAttribute('shadow-softness', '0.8');
      mv.setAttribute('exposure', '1.1'); mv.setAttribute('camera-orbit', '-35deg 78deg auto');
      mv.setAttribute('interaction-prompt', 'auto');
      stage.innerHTML = ''; stage.appendChild(mv);
      clipsEl.innerHTML = m.clips.length > 1 ? m.clips.map(function (n) {
        return '<button type="button" class="ar-clip' + (n === m.def ? ' on' : '') + '" data-clip="' + esc(n) + '">' + esc(n) + '</button>';
      }).join('') : '';
      clipsEl.addEventListener('click', function (e) {
        var b = e.target.closest('[data-clip]'); if (!b) return;
        mv.animationName = b.getAttribute('data-clip');
        Array.prototype.forEach.call(clipsEl.children, function (x) { x.classList.toggle('on', x === b); });
        mv.play();
      });
      mv.addEventListener('load', function () {
        if (mv.canActivateAR) {
          go.hidden = false;
          note.textContent = 'Tip: in AR, find a big flat space and walk around it. Pinching does not resize it, so you see the true size!' +
            (m.arClip ? ' (AR shows the calm “' + m.arClip + '” animation.)' : '');
        } else {
          note.textContent = 'AR needs an iPad, iPhone or a recent Android phone. Here you can spin the dinosaur with your finger or mouse.';
        }
      });
      go.addEventListener('click', function () { try { mv.activateAR(); } catch (e) { note.textContent = 'AR could not start on this device.'; } });
      mv.addEventListener('error', function () { note.textContent = 'The 3D model could not load. Check your connection and try again.'; });
    }).catch(function () {
      stage.innerHTML = '<div class="ar-loading">Sorry, the 3D viewer could not load.</div>';
    });
  };

  /* ---------- gallery page ---------- */
  window.Views = window.Views || {};
  window.Views.ar = {
    title: 'Life-size dinos', icon: '📱',
    mount: function (el) {
      el.innerHTML = '';
      var sec = document.createElement('section');
      sec.className = 'ar-page';
      var h = '<header class="card ar-hero"><h1 class="page-title">Life-size dinos 📱</h1>' +
        '<p>Spin them around, then put them in the room with <strong>AR</strong>. On an iPad, point the camera at a big flat floor and walk around them. You will see how BIG they really were!</p></header>' +
        '<div class="ar-grid">';
      MODELS.forEach(function (m) {
        h += '<article class="card ar-card"><img class="ar-poster" src="' + BASE + m.id + '-poster.jpg" alt="' + esc(m.name) + '" loading="lazy" width="640" height="480">' +
          '<h2>' + esc(m.name) + '</h2><p class="muted">' + esc(sizeLine(m)) + '</p><p>' + esc(m.blurb) + '</p>' +
          '<button class="btn ar-open" type="button" data-model="' + m.id + '">🦖 See it in 3D / AR</button></article>';
      });
      h += '</div><section class="card ar-credits"><h2>Credits</h2><p>These 3D models are shared under the Creative Commons Attribution 4.0 licence (CC BY 4.0). We scaled them to real size, re-textured them and converted them for AR. Thank you to the artists!</p><ul>';
      MODELS.forEach(function (m) {
        var c = m.credit;
        h += '<li>“<a href="' + esc(c.url) + '" target="_blank" rel="noopener">' + esc(c.title) + '</a>” by <a href="' + esc(c.authorUrl) + '" target="_blank" rel="noopener">' + esc(c.author) + '</a></li>';
      });
      h += '</ul><p class="muted">Licence: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. 3D viewer: model-viewer by Google (BSD-3-Clause).</p></section>';
      sec.innerHTML = h;
      el.appendChild(sec);
      sec.addEventListener('click', function (e) {
        var b = e.target.closest('[data-model]');
        if (b) window.openAR(b.getAttribute('data-model'));
      });
    }
  };
})();
