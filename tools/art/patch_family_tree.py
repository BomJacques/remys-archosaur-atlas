"""Rewrite the family-tree section of basics.js for the 17 painted portraits (four generations)."""
import io, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
p = os.path.join(ROOT, 'js', 'views', 'basics.js')
s = io.open(p, encoding='utf-8').read()
a = s.index('  /* ---------------- 1. a human family tree ---------------- */')
b = s.index('  /* ---------------- 2. generations and time ---------------- */')

new = r"""  /* ---------------- 1. a human family tree (painted portraits, four generations) ---------------- */
  var X0 = 56;
  var PEOPLE = {
    ggm1: { img: 'ggm1', n: 'Great-grandma', x: X0 + 64, y: 66 }, ggf1: { img: 'ggf1', n: 'Great-grandpa', x: X0 + 176, y: 66 },
    ggm2: { img: 'ggm2', n: 'Great-grandma', x: X0 + 304, y: 66 }, ggf2: { img: 'ggf2', n: 'Great-grandpa', x: X0 + 416, y: 66 },
    ggm3: { img: 'ggm3', n: 'Great-grandma', x: X0 + 544, y: 66 }, ggf3: { img: 'ggf3', n: 'Great-grandpa', x: X0 + 656, y: 66 },
    ggm4: { img: 'ggm4', n: 'Great-grandma', x: X0 + 784, y: 66 }, ggf4: { img: 'ggf4', n: 'Great-grandpa', x: X0 + 896, y: 66 },
    gm1: { img: 'gm1', n: 'Grandma', x: X0 + 120, y: 224 }, gf1: { img: 'gf1', n: 'Grandpa', x: X0 + 360, y: 224 },
    gm2: { img: 'gm2', n: 'Grandma', x: X0 + 600, y: 224 }, gf2: { img: 'gf2', n: 'Grandpa', x: X0 + 840, y: 224 },
    mum: { img: 'mum', n: 'Mum', x: X0 + 190, y: 382 }, aunt: { img: null, n: 'Aunt or uncle', note: '(not pictured)', x: X0 + 300, y: 382 },
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
        var p = PEOPLE[k], hot = on[k], im = p.img && FAM[p.img];
        s += '<g class="bas-person' + (hot ? ' hot' : '') + '"' + (hot ? '' : ' opacity="' + (Object.keys(on).length ? '.78' : '1') + '"') + '>';
        s += '<circle cx="' + p.x + '" cy="' + p.y + '" r="' + (R + 4) + '" fill="' + (hot ? '#fff1d6' : '#fffdf8') + '" stroke="' + (hot ? '#ff6b3d' : '#d9cfb8') + '" stroke-width="' + (hot ? 6 : 3) + '"/>';
        if (im) {
          s += '<clipPath id="fc-' + k + '"><circle cx="' + p.x + '" cy="' + p.y + '" r="' + R + '"/></clipPath>' +
            '<image href="' + im.src + '" x="' + (p.x - R - 4) + '" y="' + (p.y - R - 4) + '" width="' + (2 * R + 8) + '" height="' + (2 * R + 8) + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#fc-' + k + ')"/>';
        } else {
          s += '<g fill="#d9cfb8"><circle cx="' + p.x + '" cy="' + (p.y - 12) + '" r="15"/><path d="M' + (p.x - 28) + ',' + (p.y + 34) + ' C' + (p.x - 28) + ',' + (p.y + 6) + ' ' + (p.x + 28) + ',' + (p.y + 6) + ' ' + (p.x + 28) + ',' + (p.y + 34) + ' Z"/></g>';
        }
        s += '<text x="' + p.x + '" y="' + (p.y + 66) + '" text-anchor="middle" font-size="17" font-weight="800" fill="#2f3b5c">' + esc(p.n) + '</text>' +
          (p.note ? '<text x="' + p.x + '" y="' + (p.y + 84) + '" text-anchor="middle" font-size="14" fill="#8a7d63">' + esc(p.note) + '</text>' : '') + '</g>';
      });
      s += '<g font-size="15" fill="#8a7d63" font-weight="700"><text x="6" y="70">3 generations</text><text x="6" y="88">back</text><text x="6" y="228">2 back</text><text x="6" y="386">1 back</text><text x="6" y="544">now</text></g>';
      s += '<g font-size="16" fill="#b3411f" font-weight="800" opacity=".75"><text x="' + (X0 + 480) + '" y="22" text-anchor="middle">Mum\'s side</text><text x="' + (X0 + 960) + '" y="22" text-anchor="end"></text></g>';
      s += '</svg>';
      wrap.innerHTML = s; note.innerHTML = F.text;
      Array.prototype.forEach.call(chips.children, function (c) { var on2 = c.getAttribute('data-k') === sel; c.classList.toggle('on', on2); c.setAttribute('aria-pressed', on2 ? 'true' : 'false'); });
    }
    chips.addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (b) { sel = b.getAttribute('data-k'); draw(); } });
    draw();
  }

"""
s = s[:a] + new + s[b:]
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('rewrote family tree')
