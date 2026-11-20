/* art-core.js: Art helper (SVG strings) + tiny shared UI helpers */
(function () {
  'use strict';
  var A = window.ART = window.ART || {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var PH = '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">' +
    '<ellipse cx="200" cy="262" rx="120" ry="16" fill="#000" opacity=".08"/>' +
    '<path d="M70 230c-6-60 30-110 90-120 20-30 70-40 100-10 40 0 70 40 60 90-4 26-30 40-60 40H110c-24 0-38-.5-40-0z" fill="#c9d3e6"/>' +
    '<circle cx="262" cy="130" r="14" fill="#fff"/><circle cx="266" cy="132" r="7" fill="#26324a"/>' +
    '<text x="170" y="205" font-family="sans-serif" font-size="80" font-weight="800" fill="#fff" text-anchor="middle">?</text></svg>';

  window.Art = {
    has: function (id) { return !!A[id]; },
    ids: function () { return Object.keys(A); },
    svg: function (id, o) {
      o = o || {};
      var s = A[id], missing = false;
      if (!s) { s = PH; missing = true; }
      var attrs = ' class="art' + (o.cls ? ' ' + esc(o.cls) : '') + (missing ? ' art-missing' : '') + '"';
      attrs += o.title ? ' role="img" aria-label="' + esc(o.title) + '"' : ' aria-hidden="true" focusable="false"';
      return s.replace(/<svg\b([^>]*)>/, function (m, rest) {
        rest = rest.replace(/\sclass="[^"]*"/, '').replace(/\srole="[^"]*"/, '').replace(/\saria-hidden="[^"]*"/, '');
        if (o.slice) rest = rest.replace(/\spreserveAspectRatio="[^"]*"/, '') + ' preserveAspectRatio="xMidYMid slice"';
        return '<svg' + rest + attrs + '>';
      });
    }
  };

  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  window.UI = {
    esc: esc,
    clamp: clamp,
    reduced: function () {
      try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
    },
    shuffle: function (arr) {
      var a = arr.slice(), i, j, t;
      for (i = a.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
      return a;
    },
    store: {
      get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
    },
    fmtMya: function (m) {
      if (m == null) return '';
      if (m <= 0) return 'today';
      return 'about ' + m + ' million years ago';
    },
    /* era containing a time (Mya) */
    eraFor: function (D, m) {
      var eras = D.eras || [], i;
      for (i = 0; i < eras.length; i++) if (m <= eras[i].startMya && m >= eras[i].endMya) return eras[i];
      if (!eras.length) return null;
      return m > eras[0].startMya ? eras[0] : eras[eras.length - 1];
    },
    /* AR slot: only shows if the AR module has a model for this taxon */
    arButton: function (id) {
      if (window.AR_MODELS && window.AR_MODELS[id] && typeof window.openAR === 'function') {
        return '<button class="btn btn-ar" type="button" data-ar="' + esc(id) + '">📱 See it life-size (AR)</button>';
      }
      return '';
    },
    bindAR: function (root) {
      root.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('[data-ar]');
        if (b && typeof window.openAR === 'function') { e.preventDefault(); window.openAR(b.getAttribute('data-ar')); }
      });
    }
  };
})();
