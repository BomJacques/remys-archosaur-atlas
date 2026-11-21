"""Patch basics.js: painted family figures (window.FAMILY) with neutral silhouette placeholders, no emoji people."""
import io, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
p = os.path.join(ROOT, 'js', 'views', 'basics.js')
s = io.open(p, encoding='utf-8').read()

# 1) people
a = s.index('  var PEOPLE = {'); b = s.index('  var LINKS =')
people = """  var PEOPLE = {
    gm1: { img: 'grandma', n: 'Grandma', x: 90, y: 62 }, gf1: { img: 'grandpa', n: 'Grandpa', x: 190, y: 62 },
    gm2: { img: 'granny', n: 'Granny', x: 410, y: 62 }, gf2: { img: 'pop', n: 'Pop', x: 510, y: 62 },
    mum: { img: 'mum', n: 'Mum', x: 120, y: 206 }, aunt: { img: 'aunt', n: 'Aunt', x: 235, y: 206 }, dad: { img: 'dad', n: 'Dad', x: 440, y: 206 },
    you: { img: 'you', n: 'You', x: 270, y: 350 }, sis: { img: 'sister', n: 'Sister', x: 370, y: 350 }, cousin: { img: 'cousin', n: 'Cousin', x: 160, y: 350 }
  };
"""
s = s[:a] + people + s[b:]

# 2) chip labels without emoji
s = re.sub(r"var LABELS = \{[^}]*\};", "var LABELS = { parents: 'Parents', grand: 'Grandparents', sib: 'Sibling', cousin: 'Cousin', common: 'Common ancestor' };", s)

# 3) drawing
a = s.index("      var s = '<svg viewBox=\"0 0 600 330\""); b = s.index("      wrap.innerHTML = s; note.innerHTML = F.text;")
draw = """      var s = '<svg viewBox="0 0 600 420" role="img" aria-label="A simple family tree with grandparents, parents, aunt, you, a sister and a cousin">';
      s += '<g stroke="#b9a98a" stroke-width="3" fill="none" stroke-linecap="round">';
      LINKS.forEach(function (l) {
        var a = PEOPLE[l[0]], b = PEOPLE[l[1]], hot = on[l[0]] && on[l[1]];
        s += '<path d="M' + a.x + ',' + (a.y + 72) + ' C' + a.x + ',' + (a.y + 100) + ' ' + b.x + ',' + (b.y - 76) + ' ' + b.x + ',' + (b.y - 50) + '" ' + (hot ? 'stroke="#ff6b3d" stroke-width="5"' : '') + '/>';
      });
      s += '</g>';
      var FAM = window.FAMILY || {};
      Object.keys(PEOPLE).forEach(function (k) {
        var p = PEOPLE[k], hot = on[k], im = FAM[p.img] || (p.img === 'you' && window.Art && window.Art.has('human') ? { art: 'human' } : null);
        var x0 = p.x - 40, y0 = p.y - 52;
        s += '<g class="bas-person' + (hot ? ' hot' : '') + '"><rect x="' + x0 + '" y="' + y0 + '" width="80" height="104" rx="18" fill="' + (hot ? '#fff1d6' : '#fffdf8') + '" stroke="' + (hot ? '#ff6b3d' : '#d9cfb8') + '" stroke-width="' + (hot ? 5 : 3) + '"/>';
        if (im && im.src) {
          var asp = im.aspect || 1.6, w = 72, h = w * asp; if (h > 96) { h = 96; w = h / asp; }
          s += '<image href="' + im.src + '" x="' + (p.x - w / 2) + '" y="' + (p.y + 48 - h) + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMax meet"/>';
        } else if (im && im.art) {
          s += '<image href="assets/art/' + im.art + '.webp" x="' + (p.x - 38) + '" y="' + (p.y - 26) + '" width="76" height="57" preserveAspectRatio="xMidYMid meet"/>';
        } else {
          s += '<g fill="#d9cfb8"><circle cx="' + p.x + '" cy="' + (p.y - 16) + '" r="15"/><path d="M' + (p.x - 28) + ',' + (p.y + 44) + ' C' + (p.x - 28) + ',' + (p.y + 8) + ' ' + (p.x + 28) + ',' + (p.y + 8) + ' ' + (p.x + 28) + ',' + (p.y + 44) + ' Z"/></g>';
        }
        s += '<text x="' + p.x + '" y="' + (p.y + 70) + '" text-anchor="middle" font-size="15" font-weight="800" fill="#2f3b5c">' + esc(p.n) + '</text></g>';
      });
      s += '<text x="8" y="66" font-size="12" fill="#8a7d63">2 gens back</text><text x="8" y="210" font-size="12" fill="#8a7d63">1 gen back</text><text x="8" y="354" font-size="12" fill="#8a7d63">now</text></svg>';
"""
s = s[:a] + draw + s[b:]

# 4) emoji out of the generation chips and the extinction tree/cards on this page
s = re.sub(r" (🦠|🐭|🐔|🧒|🦖|🥚|🐘|🦎|🐢|🦕|🐊|🐦)'", "'", s)
s = re.sub(r"(emoji-free) ", r"\1 ", s)
s = s.replace("e: '🐺', ", "e: '', ").replace("e: '🐦', ", "e: '', ").replace("e: '🕊️', ", "e: '', ").replace("e: '🦣', ", "e: '', ").replace("e: '🦕', ", "e: '', ")
s = s.replace("<span class=\"bas-card-e\">' + c.e + '</span>", "")
s = s.replace("'<span class=\"bas-dot\" aria-hidden=\"true\">' + (a ? '🟢' : '⚫') + '</span>", "'<span class=\"bas-dot ' + (a ? 'on' : 'off') + '\" aria-hidden=\"true\"></span>")
s = s.replace("<b>🐦 Think about it:</b>", "<b>Think about it:</b>").replace("'Start here 🌳'", "'Start here'").replace("Start here 🌳</h1>", "Start here</h1>")
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('patched; emoji left:', len(re.findall(r'[\U0001F300-\U0001FAFF☀-➿]', s)))
