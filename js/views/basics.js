/* basics.js: "Start here": family trees, generations, extinction */
(function () {
  'use strict';
  window.Views = window.Views || {};

  /* ---------------- 1. a human family tree (painted portraits, four generations) ---------------- */
  var X0 = 56;
  var PEOPLE = {
    ggm1: { img: 'ggm1', n: 'Great-grandma', x: X0 + 64, y: 66 }, ggf1: { img: 'ggf1', n: 'Great-grandpa', x: X0 + 176, y: 66 },
    ggm2: { img: 'ggm2', n: 'Great-grandma', x: X0 + 304, y: 66 }, ggf2: { img: 'ggf2', n: 'Great-grandpa', x: X0 + 416, y: 66 },
    ggm3: { img: 'ggm3', n: 'Great-grandma', x: X0 + 544, y: 66 }, ggf3: { img: 'ggf3', n: 'Great-grandpa', x: X0 + 656, y: 66 },
    ggm4: { img: 'ggm4', n: 'Great-grandma', x: X0 + 784, y: 66 }, ggf4: { img: 'ggf4', n: 'Great-grandpa', x: X0 + 896, y: 66 },
    gm1: { img: 'gm1', n: 'Grandma', x: X0 + 120, y: 224 }, gf1: { img: 'gf1', n: 'Grandpa', x: X0 + 360, y: 224 },
    gm2: { img: 'gm2', n: 'Grandma', x: X0 + 600, y: 224 }, gf2: { img: 'gf2', n: 'Grandpa', x: X0 + 840, y: 224 },
    mum: { img: 'mum', n: 'Mum', x: X0 + 190, y: 382 }, aunt: { img: 'aunt', n: 'Aunt or uncle', note: '', x: X0 + 300, y: 382 },
    dad: { img: 'dad', n: 'Dad', x: X0 + 720, y: 382 },
    you: { img: 'you', n: 'You', x: X0 + 405, y: 540 }, sib: { img: 'sibling', n: 'Sibling', x: X0 + 505, y: 540 }, cousin: { img: 'cousin', n: 'Cousin', x: X0 + 300, y: 540 }
  };
  var LINKS = [['ggm1', 'gm1'], ['ggf1', 'gm1'], ['ggm2', 'gf1'], ['ggf2', 'gf1'], ['ggm3', 'gm2'], ['ggf3', 'gm2'], ['ggm4', 'gf2'], ['ggf4', 'gf2'],
    ['gm1', 'mum'], ['gf1', 'mum'], ['gm1', 'aunt'], ['gf1', 'aunt'], ['gm2', 'dad'], ['gf2', 'dad'], ['mum', 'you'], ['dad', 'you'], ['mum', 'sib'], ['dad', 'sib'], ['aunt', 'cousin']];
  var FOCUS = {
    parents: { ids: ['mum', 'dad'], text: 'Your <b>parents</b> are one generation back. Each of them passed half of your DNA to you.' },
    grand: { ids: ['gm1', 'gf1', 'gm2', 'gf2'], text: 'Your <b>grandparents</b> are two generations back. You have four of them.' },
    great: { ids: ['ggm1', 'ggf1', 'ggm2', 'ggf2', 'ggm3', 'ggf3', 'ggm4', 'ggf4'], text: 'Your <b>great-grandparents</b> are three generations back. You have eight. The number <b>doubles</b> every generation: 2, 4, 8, 16... Ten generations back (about 250 years) there would be 1,024 ancestors, although in real families some ancestors turn up more than once.' },
    sib: { ids: ['sib', 'mum', 'dad'], text: 'A <b>sibling</b> shares both parents with you, so your closest common ancestors are only one generation back.' },
    cousin: { ids: ['cousin', 'aunt', 'gm1', 'gf1'], text: 'A <b>cousin</b> is not a sibling. You and your cousin share <b>grandparents</b> (two generations back) but not parents. Cousins are on different twigs of the same branch.' },
    common: { ids: ['gm1', 'gf1', 'cousin', 'you'], text: 'The <b>common ancestor</b> of you and your cousin is Grandma and Grandpa on Mum\'s side. Evolution\'s family trees work the same way. A crocodile and a magpie are cousins too, but their shared "grandparent" lived about 250 million years ago.' }
  };

  function familyTree(host, ctx) {
    var esc = ctx.UI.esc, sel = 'common';
    var root = document.createElement('section'); root.className = 'card bas-sec';
    root.innerHTML = '<h2 class="bas-h2">1. A family tree you already know</h2>' +
      '<p>A family tree shows who came from whom. Each row is a <b>generation</b>. Tap a button to see how people are related.</p>' +
      '<div class="bas-chips" role="group" aria-label="Show relatives"></div><div class="bas-svg-wrap"></div><div class="bas-note" aria-live="polite"></div>';
    host.appendChild(root);
    var chips = root.querySelector('.bas-chips'), wrap = root.querySelector('.bas-svg-wrap'), note = root.querySelector('.bas-note');
    var LABELS = { parents: 'Parents', grand: 'Grandparents', great: 'Great-grandparents', sib: 'Sibling', cousin: 'Cousin', common: 'Common ancestor' };
    Object.keys(LABELS).forEach(function (k) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'bas-chip'; b.textContent = LABELS[k]; b.setAttribute('data-k', k); chips.appendChild(b);
    });
    var R = 44; /* portrait radius */
    function draw() {
      var F = FOCUS[sel], on = {}; F.ids.forEach(function (i) { on[i] = 1; });
      var FAM = window.FAMILY || {};
      var s = '<svg viewBox="0 0 1060 650" role="img" aria-label="A family tree with four generations: great-grandparents, grandparents, parents, and you with a sibling and a cousin">';
      s += '<g stroke="#b9a98a" stroke-width="3" fill="none" stroke-linecap="round">';
      LINKS.forEach(function (l) {
        var a = PEOPLE[l[0]], b = PEOPLE[l[1]], hot = on[l[0]] && on[l[1]], dash = (l[0] === 'aunt' || l[1] === 'aunt');
        s += '<path d="M' + a.x + ',' + (a.y + 70) + ' C' + a.x + ',' + (a.y + 104) + ' ' + b.x + ',' + (b.y - 74) + ' ' + b.x + ',' + (b.y - 48) + '" ' + (hot ? 'stroke="#ff6b3d" stroke-width="5"' : '') + (dash ? ' stroke-dasharray="7 7"' : '') + '/>';
      });
      s += '</g>';
      Object.keys(PEOPLE).forEach(function (k) {
        var p = PEOPLE[k], hot = on[k], im = p.img && (FAM[p.img] || (p.img === 'aunt' ? { src: 'assets/art/family/aunt.svg' } : null));
        s += '<g class="bas-person' + (hot ? ' hot' : '') + '"' + (hot ? '' : ' opacity="' + (Object.keys(on).length ? '.78' : '1') + '"') + '>';
        s += '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + (R + 4) + '" fill="' + (hot ? '#fff1d6' : '#fffdf8') + '" stroke="' + (hot ? '#ff6b3d' : '#d9cfb8') + '" stroke-width="' + (hot ? 6 : 3) + '"/>';
        if (im) {
          s += '<clipPath id="fc-' + k + '"><circle cx="' + p.x + '" cy="' + p.y + '" r="' + R + '"/></clipPath>' +
            '<image href="' + im.src + '" x="' + (p.x - R - 4) + '" y="' + (p.y - R - 4) + '" width="' + (2 * R + 8) + '" height="' + (2 * R + 8) + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#fc-' + k + ')"/>';
        } else {
          s += '<g fill="#d9cfb8"><circle cx="' + p.x + '" cy="' + (p.y - 12) + '" r="15"/><path d="M' + (p.x - 28) + ',' + (p.y + 34) + ' C' + (p.x - 28) + ',' + (p.y + 6) + ' ' + (p.x + 28) + ',' + (p.y + 6) + ' ' + (p.x + 28) + ',' + (p.y + 34) + ' Z"/></g>';
        }
        var nm = p.n.indexOf('Great-') === 0
          ? '<text x="' + p.x + '" y="' + (p.y + 64) + '" text-anchor="middle" font-size="16" font-weight="800" fill="#2f3b5c">Great-</text><text x="' + p.x + '" y="' + (p.y + 81) + '" text-anchor="middle" font-size="16" font-weight="800" fill="#2f3b5c">' + esc(p.n.slice(6)) + '</text>'
          : '<text x="' + p.x + '" y="' + (p.y + 66) + '" text-anchor="middle" font-size="17" font-weight="800" fill="#2f3b5c">' + esc(p.n) + '</text>';
        s += nm +
          (p.note ? '<text x="' + p.x + '" y="' + (p.y + 84) + '" text-anchor="middle" font-size="14" fill="#8a7d63">' + esc(p.note) + '</text>' : '') + '</g>';
      });
      s += '<g font-size="15" fill="#8a7d63" font-weight="700"><text x="6" y="70">3 back</text><text x="6" y="228">2 back</text><text x="6" y="386">1 back</text><text x="6" y="544">now</text></g>';
      s += '</svg>';
      wrap.innerHTML = s; note.innerHTML = F.text;
      Array.prototype.forEach.call(chips.children, function (c) { var on2 = c.getAttribute('data-k') === sel; c.classList.toggle('on', on2); c.setAttribute('aria-pressed', on2 ? 'true' : 'false'); });
    }
    chips.addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (b) { sel = b.getAttribute('data-k'); draw(); } });
    draw();
  }

  /* ---------------- 2. generations and time ---------------- */
  var KINDS = [
    { id: 'bacteria', n: 'Bacteria', yr: 20 / 525600, say: 'about 20 minutes' },
    { id: 'mouse', n: 'Mouse', yr: 1, say: 'about 1 year' },
    { id: 'chicken', n: 'Chicken', yr: 1.5, say: 'about 1 to 2 years' },
    { id: 'human', n: 'Human', yr: 25, say: 'about 25 years' },
    { id: 'dino', n: 'Big dinosaur', yr: 20, say: 'roughly 15 to 25 years (estimate)' }
  ];
  var STOPS = [
    { n: 'The Roman Empire', mya: 0.002 }, { n: 'The last ice age ended', mya: 0.012 }, { n: 'First humans (Homo sapiens)', mya: 0.3 },
    { n: 'T. rex lived', mya: 68 }, { n: 'First birds (Archaeopteryx)', mya: 150 }, { n: 'First dinosaurs', mya: 243 },
    { n: 'First egg-layers on land', mya: 318 }, { n: 'First animals with limbs', mya: 365 }, { n: 'LUCA', mya: 4000 }
  ];
  function fmtNum(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(1).replace(/\.0$/, '') + ' trillion';
    if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + ' billion';
    if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + ' million';
    return Math.round(n).toLocaleString('en-AU');
  }
  function generations(host, ctx) {
    var kind = 'human', stop = 3;
    var root = document.createElement('section'); root.className = 'card bas-sec';
    root.innerHTML = '<h2 class="bas-h2">2. Generations: counting back through time</h2>' +
      '<p>A <b>generation</b> is one step from parents to children. How long a generation lasts depends on the animal. Pick an animal and a moment in the past to count the generations in between.</p>' +
      '<div class="bas-label">Who is counting?</div><div class="bas-chips" id="gKinds"></div>' +
      '<div class="bas-label">How far back?</div><div class="bas-chips" id="gStops"></div>' +
      '<div class="bas-result" aria-live="polite"></div>';
    host.appendChild(root);
    var kEl = root.querySelector('#gKinds'), sEl = root.querySelector('#gStops'), out = root.querySelector('.bas-result');
    KINDS.forEach(function (k) { var b = document.createElement('button'); b.type = 'button'; b.className = 'bas-chip'; b.textContent = k.n; b.setAttribute('data-kind', k.id); kEl.appendChild(b); });
    STOPS.forEach(function (s, i) { var b = document.createElement('button'); b.type = 'button'; b.className = 'bas-chip'; b.textContent = s.n; b.setAttribute('data-stop', i); sEl.appendChild(b); });
    function calc() {
      var K = KINDS.filter(function (k) { return k.id === kind; })[0], S = STOPS[stop];
      var years = S.mya * 1e6, gens = years / K.yr;
      var line = gens * 0.5; /* one person every half metre, shoulder to shoulder */
      var km = line / 1000;
      var yearsTxt = S.mya < 1 ? Math.round(S.mya * 1e6).toLocaleString('en-AU') + ' years' : S.mya >= 1000 ? (S.mya / 1000) + ' billion years' : S.mya + ' million years';
      var dots = '', n = Math.min(40, Math.max(1, Math.round(gens)));
      for (var i = 0; i < n; i++) dots += '<i></i>';
      out.innerHTML = '<div class="bas-big">' + (gens < 1 ? 'Less than 1' : fmtNum(gens)) + ' <span>generations</span></div>' +
        '<p>A ' + K.n.replace(/ .*$/, '').toLowerCase() + ' generation is ' + K.say + '. Going back to <b>' + ctx.UI.esc(S.n) + '</b> (' + yearsTxt + ' ago) is that many parents-to-children steps.</p>' +
        (gens >= 100 ? '<p class="bas-fun">If one ancestor stood for every generation, shoulder to shoulder (half a metre each), the line would be about <b>' + (km >= 1 ? fmtNum(km) + ' km' : Math.round(line) + ' m') + '</b> long' +
          (km > 40000 ? ', which is more than once around the Earth!' : km > 1000 ? '. That is about as far as Brisbane to Melbourne.' : '.') + '</p>' : '') +
        '<div class="bas-dots" aria-hidden="true">' + dots + (gens > 40 ? '<em>…</em>' : '') + '</div>' +
        '<p class="bas-small">Each dot is one generation' + (gens > 40 ? ' (only the first 40 are drawn)' : '') + '. Changes pile up slowly: every chick is a tiny bit different, and over many generations the differences add up.</p>';
      Array.prototype.forEach.call(kEl.children, function (c) { c.classList.toggle('on', c.getAttribute('data-kind') === kind); });
      Array.prototype.forEach.call(sEl.children, function (c) { c.classList.toggle('on', +c.getAttribute('data-stop') === stop); });
    }
    root.addEventListener('click', function (e) {
      var k = e.target.closest('[data-kind]'), s = e.target.closest('[data-stop]');
      if (k) { kind = k.getAttribute('data-kind'); calc(); } else if (s) { stop = +s.getAttribute('data-stop'); calc(); }
    });
    calc();
  }

  /* ---------------- 3. extinction ---------------- */
  var TREE = { id: 'root', n: 'Amniotes', kids: [
    { id: 'syn', n: 'Mammal side', kids: [{ id: 'mam', n: 'Mammals', alive: true }] },
    { id: 'sau', n: 'Reptile-and-bird side', kids: [
      { id: 'lep', n: 'Lizards and snakes', alive: true, sub: ['Mosasaurs (extinct) were in this group'] },
      { id: 'tur', n: 'Turtles', alive: true },
      { id: 'ple', n: 'Plesiosaurs', alive: false, note: 'Sea reptiles. All gone about 66 million years ago.' },
      { id: 'arc', n: 'Archosaurs', kids: [
        { id: 'cro', n: 'Crocodiles', alive: true },
        { id: 'pte', n: 'Pterosaurs', alive: false, note: 'Flying reptiles. All gone about 66 million years ago.' },
        { id: 'din', n: 'Dinosaurs', kids: [
          { id: 'ndi', n: 'Non-bird dinosaurs (T. rex, Triceratops…)', alive: false, note: 'All gone about 66 million years ago.' },
          { id: 'bir', n: 'Birds', alive: true }
        ] }
      ] }
    ] }
  ] };

  function extinction(host, ctx) {
    var esc = ctx.UI.esc, state = {};
    (function init(n) { if (n.kids) n.kids.forEach(init); else state[n.id] = !!n.alive; })(TREE);
    var base = JSON.parse(JSON.stringify(state));
    var root = document.createElement('section'); root.className = 'card bas-sec';
    root.innerHTML = '<h2 class="bas-h2">3. When a branch ends: extinction</h2>' +
      '<p>An animal group is <b>extinct</b> when none of its members are left, <b>and</b> it has no living descendants. On a family tree that is a branch that stops. A group is only "alive" if at least one twig beyond it is still alive.</p>' +
      '<div class="bas-ex-intro"><b>Think about it:</b> imagine every bird died out tomorrow. Birds are living dinosaurs, so that would be the end of the whole dinosaur family tree. The "dinosaurs died out" story is really "all the dinosaurs except the birds died out". Pterosaurs and plesiosaurs left no descendants at all, so their branches really did end.</div>' +
      '<div class="bas-chips" id="exPre"></div><div class="bas-tree" id="exTree" role="tree" aria-label="Family tree showing which groups are alive"></div><div class="bas-note" id="exNote" aria-live="polite"></div>' +
      '<h3 class="bas-h3">Extinctions we know about</h3><div class="bas-cards" id="exCards"></div>' +
      '<p class="bas-small">A mass extinction is when many groups die out at nearly the same time. The biggest was about 252 million years ago. The one that ended the non-bird dinosaurs, about 66 million years ago, followed an asteroid hit.</p>';
    host.appendChild(root);
    var pre = root.querySelector('#exPre'), tree = root.querySelector('#exTree'), note = root.querySelector('#exNote');
    [['real', 'Real world today'], ['nobird', 'What if birds died out?'], ['noarch', 'What if birds AND crocodiles died out?'], ['nomam', 'What if all mammals died out?']].forEach(function (p) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'bas-chip'; b.textContent = p[1]; b.setAttribute('data-pre', p[0]); pre.appendChild(b);
    });
    function alive(n) { return n.kids ? n.kids.some(alive) : !!state[n.id]; }
    function render(n, depth) {
      var a = alive(n), leaf = !n.kids;
      var h = '<div class="bas-node' + (a ? ' alive' : ' dead') + (leaf ? ' leaf' : '') + '" role="treeitem" style="--d:' + depth + '">' +
        (leaf ? '<button type="button" class="bas-toggle" data-leaf="' + n.id + '" aria-pressed="' + (a ? 'true' : 'false') + '" aria-label="' + esc(n.n) + ': ' + (a ? 'alive. Tap to make it go extinct' : 'extinct. Tap to bring it back') + '">' : '<span class="bas-toggle plain">') +
        '<span class="bas-dot ' + (a ? 'on' : 'off') + '" aria-hidden="true"></span><span class="bas-name">' + esc(n.n) + '</span><span class="bas-state">' + (a ? 'alive' : 'line ended') + '</span>' + (leaf ? '</button>' : '</span>') + '</div>';
      if (n.kids) h += '<div class="bas-kids">' + n.kids.map(function (k) { return render(k, depth + 1); }).join('') + '</div>';
      return h;
    }
    function find(id, n) { n = n || TREE; if (n.id === id) return n; if (n.kids) for (var i = 0; i < n.kids.length; i++) { var r = find(id, n.kids[i]); if (r) return r; } return null; }
    function msg() {
      var din = find('din'), arc = find('arc'), bir = find('bir');
      if (!alive(bir) && !alive(din)) return '<b>The whole dinosaur family tree has ended.</b> Birds were the last branch. This is what "extinct" really means: no living descendants anywhere on the tree.';
      if (!alive(arc)) return '<b>The archosaur branch (crocodiles, pterosaurs, dinosaurs, birds) has ended.</b> A huge, successful family would be gone.';
      if (!alive(find('mam'))) return '<b>Mammals are gone.</b> That includes us, elephants, bats and whales. The mammal side of the tree would end.';
      if (alive(din)) return 'Dinosaurs are <b>still alive</b>, but only through <b>birds</b>. The other dinosaur branch (T. rex, Triceratops and the rest) ended about 66 million years ago. Tap any animal group to make it go extinct.';
      return 'Tap an animal group to make it go extinct, or tap again to bring it back.';
    }
    function draw() {
      tree.innerHTML = render(TREE, 0); note.innerHTML = msg();
      Array.prototype.forEach.call(pre.children, function (c) {
        var p = c.getAttribute('data-pre'), exp = JSON.parse(JSON.stringify(base));
        if (p === 'nobird') exp.bir = false; else if (p === 'noarch') { exp.bir = false; exp.cro = false; } else if (p === 'nomam') exp.mam = false;
        c.classList.toggle('on', JSON.stringify(exp) === JSON.stringify(state));
      });
    }
    root.addEventListener('click', function (e) {
      var l = e.target.closest('[data-leaf]'), p = e.target.closest('[data-pre]');
      if (l) { state[l.getAttribute('data-leaf')] = !state[l.getAttribute('data-leaf')]; draw(); }
      else if (p) {
        state = JSON.parse(JSON.stringify(base)); var k = p.getAttribute('data-pre');
        if (k === 'nobird') state.bir = false; else if (k === 'noarch') { state.bir = false; state.cro = false; } else if (k === 'nomam') state.mam = false;
        draw();
      }
    });
    var cards = [
      { e: '', t: 'Thylacine (Tasmanian tiger)', x: 'The last known one died in a zoo in 1936. Hunting and losing its habitat ended the whole line.' },
      { e: '', t: 'Dodo', x: 'A flightless pigeon from Mauritius. It was gone within about 100 years of people arriving, in the 1600s.' },
      { e: '', t: 'Passenger pigeon', x: 'Once billions flew in huge flocks in North America. The last one, Martha, died in 1914.' },
      { e: '', t: 'Woolly mammoth', x: 'Small groups lived on an Arctic island until about 4,000 years ago. Then the line ended.' },
      { e: '', t: 'Plesiosaurs and pterosaurs', x: 'Each group lasted over 100 million years, then left no descendants. Extinction does not mean a group was a failure.' }
    ];
    root.querySelector('#exCards').innerHTML = cards.map(function (c) { return '<div class="bas-card"><b>' + esc(c.t) + '</b><p>' + esc(c.x) + '</p></div>'; }).join('');
    draw();
  }

  window.Views.basics = {
    title: 'Start here', icon: '',
    mount: function (el, ctx) {
      el.innerHTML = '<section class="card bas-hero"><h1 class="page-title">Start here</h1><p>Three big ideas make the rest of this album easy: <b>family trees</b>, <b>generations</b>, and what <b>extinct</b> really means.</p></section>';
      familyTree(el, ctx); generations(el, ctx); extinction(el, ctx);
      return function () { };
    }
  };
})();
