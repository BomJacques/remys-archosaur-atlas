/* earth.js: the Earth timeline (replaces the old Timeline page). Painted scenes, globes, and what changed. */
(function () {
  'use strict';
  window.Views = window.Views || {};

  var DAY = 4540; /* Earth's age in millions of years, for the "Earth day clock" */

  /* mya, title, text, bg scene id, globe id, animals shown, links [view, animal, label] */
  var EVENTS = [
    { mya: 4540, title: 'Earth forms', globe: 'earth-hadean-young-earth',
      text: 'Earth forms from dust and rock circling the young Sun. It is red-hot and covered in lava, and rocks keep crashing into it. A giant crash may have thrown out the material that made the Moon.' },
    { mya: 4000, title: 'LUCA lives', bg: 'scene-early-earth-waters', art: ['luca'], links: [['lineage', 'magpie', 'Trace a magpie back to LUCA']],
      text: 'Oceans cover the planet. Somewhere in them lives the last universal common ancestor, a tiny cell that every living thing today descends from. We have no fossil of it. Scientists work it out from the DNA all life shares, and the date is uncertain.' },
    { mya: 3500, title: 'Microbes build mounds', bg: 'scene-early-earth-microbial-world', art: ['archean-microbial-mat'],
      text: 'Communities of microbes build layered mounds called stromatolites. Fossil ones in Western Australia are about 3.5 billion years old, among the oldest fossils we know. Living stromatolites still grow at Shark Bay.' },
    { mya: 2400, title: 'The air fills with oxygen', globe: 'earth-archean-early-oceans',
      text: 'Cyanobacteria use sunlight to make oxygen. For a long time the oxygen is soaked up by rocks and seawater. Then, about 2.4 billion years ago, it starts to build up in the air. Many microbes that cannot live with oxygen struggle, and later animals will breathe it.' },
    { mya: 700, title: 'Snowball Earth', globe: 'earth-proterozoic-snowball-earth',
      text: 'Between about 720 and 635 million years ago, ice may have covered much of the planet in long freezes. Scientists still debate how much of the ocean froze. Life survives, and the first animals appear not long after.' },
    { mya: 505, title: 'Animals fill the sea', bg: 'scene-cambrian-seafloor', art: ['pikaia'], links: [['journey', 'human', 'See the human journey']],
      text: 'In the Cambrian, animals with eyes, shells and legs suddenly become common in the fossil record. Small swimmers like Pikaia have a stiff rod along the back, an early sign of the backbone body plan.' },
    { mya: 375, title: 'Fish with elbows', bg: 'scene-late-devonian-375-to-365-million-years', art: ['tiktaalik', 'acanthostega'],
      text: 'In the Age of Fishes, some fish grow strong fins with bones inside. Tiktaalik has a neck and elbow-like fins. A little later, Acanthostega has limbs with fingers, but still lives mostly in water.' },
    { mya: 318, title: 'Coal forests and the first egg-layers', bg: 'scene-carboniferous-coal-forest', globe: 'earth-paleozoic-pangaea-forming', art: ['amniote'], links: [['lineage', 'cat', 'Trace a cat back']],
      text: 'Huge swamp forests grow and, over time, their buried trees become coal. The first amniotes appear: small animals whose eggs can survive on dry land. The continents are drifting together to form one supercontinent, Pangaea.' },
    { mya: 252, title: 'The Great Dying', globe: 'earth-paleozoic-pangaea-forming',
      text: 'The biggest mass extinction ever wipes out most species on land and in the sea. Huge volcanic eruptions in Siberia changed the air and the oceans. Life slowly rebuilds, and the archosaur branch (crocodile cousins, pterosaurs, dinosaurs) begins to spread.' },
    { mya: 243, title: 'The first dinosaurs', bg: 'scene-late-triassic-230-to-220-million-years', art: ['dinosaur', 'postosuchus'], links: [['reptiles', '', 'Is it a dinosaur? Play the game']],
      text: 'Small, two-legged dinosaurs appear. They share the world with crocodile cousins like Postosuchus, which are the top predators for now. Dinosaurs are not the rulers yet.' },
    { mya: 150, title: 'Giants and the first birds', bg: 'scene-late-jurassic-150-million-years', globe: 'earth-mesozoic-continents-splitting', art: ['brachiosaurus', 'archaeopteryx'], links: [['giants', '', 'Why did dinosaurs get so big?']],
      text: 'Pangaea is splitting apart. Giant long-necked dinosaurs feed on treetops. Small feathered dinosaurs like Archaeopteryx, with wings, teeth and claws, show how birds began.' },
    { mya: 125, title: 'Flowers and feathers', bg: 'scene-early-cretaceous-125-million-years', art: ['microraptor'],
      text: 'Flowering plants spread across the land. Many small dinosaurs have feathers, like Microraptor, which has feathers on all four limbs and may have glided between trees.' },
    { mya: 68, title: 'The last giants', bg: 'scene-late-cretaceous-67-million-years', art: ['trex', 'triceratops'], links: [['lineage', 'trex', 'Trace T. rex']],
      text: 'T. rex and Triceratops live in western North America. They are some of the last non-bird dinosaurs.' },
    { mya: 66, title: 'The asteroid', globe: 'earth-mesozoic-continents-splitting', links: [['basics', '', 'What does extinct mean?']],
      text: 'A rock about 10 km wide hits near what is now Mexico. Around three quarters of species die out, including all non-bird dinosaurs, the pterosaurs, mosasaurs and plesiosaurs. Birds, mammals, crocodiles and turtles survive. Birds are the one dinosaur branch still alive.' },
    { mya: 47, title: 'Birds and mammals spread', bg: 'scene-eocene-47-million-years', art: ['passerine', 'mammal'],
      text: 'The world is warm and forested. Birds and mammals spread into the spaces the dinosaurs left. Small perching birds, the ancestors of songbirds, are on their way.' },
    { mya: 0.3, title: 'Today', bg: 'scene-today-eucalypt-park', globe: 'earth-cenozoic-earth-today', art: ['magpie', 'human'], links: [['journey', 'magpie', 'See the magpie journey']],
      text: 'The continents sit where we see them now. Ice ages have come and gone. Our species, Homo sapiens, appeared about 300,000 years ago, a tiny moment on the Earth clock. Around 11,000 kinds of living birds are the dinosaurs that are still here.' }
  ];

  function clock(mya) {
    var sec = Math.max(0, Math.round((DAY - mya) / DAY * 86400));
    if (sec > 86399) sec = 86399;
    var h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60;
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return p(h) + ':' + p(m) + ':' + p(s);
  }
  function when(m) {
    if (m >= 1000) return (Math.round(m / 100) / 10).toString().replace(/\.0$/, '') + ' billion years ago';
    if (m < 1) return Math.round(m * 1e6).toLocaleString('en-AU') + ' years ago';
    return m + ' million years ago';
  }

  window.Views.timeline = {
    title: 'Earth timeline', icon: '',
    mount: function (el, ctx) {
      var Art = ctx.Art, esc = ctx.UI.esc;
      var globes = EVENTS.filter(function (e) { return e.globe; });
      var h = '<section class="card ea-hero"><h1 class="page-title">Earth timeline</h1>' +
        '<p>Earth is about 4.5 billion years old. This is the story of the big changes. To feel how long it took, imagine all of Earth\'s history squeezed into <b>one day</b>: every event shows what time it would be on that Earth clock.</p>' +
        '<div class="ea-strip" role="group" aria-label="Jump to a time">' +
        [['Hadean', 0], ['Archean', 1], ['Snowball', 4], ['Cambrian', 5], ['Dinosaurs', 9], ['Today', EVENTS.length - 1]].map(function (j) { return '<button type="button" class="ea-jump" data-j="' + j[1] + '">' + j[0] + '</button>'; }).join('') + '</div></section>';
      h += '<div class="ea-list">';
      EVENTS.forEach(function (e, i) {
        var scene = e.bg && Art.has(e.bg) ? '<div class="ea-bg" style="background-image:url(\'' + esc(/src="/.test('') ? '' : (window.ART[e.bg].match(/href="([^"]+)"/) || [0, ''])[1]) + '\')"></div>' : '<div class="ea-bg ea-space"></div>';
        var fg = '';
        if (e.art) fg = '<div class="ea-fg">' + e.art.map(function (a) { return '<span class="ea-an">' + Art.svg(a) + '</span>'; }).join('') + '</div>';
        var gl = e.globe && Art.has(e.globe) ? '<span class="ea-globe' + (e.bg ? ' small' : '') + '">' + Art.svg(e.globe) + '</span>' : '';
        h += '<article class="card ea-card" id="ea' + i + '"><div class="ea-media">' + scene + fg + gl + '</div>' +
          '<div class="ea-body"><div class="ea-when"><b>' + esc(when(e.mya)) + '</b><span class="ea-clock" title="If Earth\'s whole history were one day">Earth clock ' + clock(e.mya) + '</span></div>' +
          '<h2>' + esc(e.title) + '</h2><p>' + esc(e.text) + '</p>' +
          (e.links ? '<div class="ea-links">' + e.links.map(function (l) { return '<button type="button" class="btn btn-ghost" data-go="' + l[0] + '"' + (l[1] ? ' data-animal="' + l[1] + '"' : '') + '>' + esc(l[2]) + '</button>'; }).join('') + '</div>' : '') +
          '</div></article>';
      });
      h += '</div><p class="ea-foot">Dates are approximate and some are still debated. The Earth clock squeezes 4.54 billion years into 24 hours.</p>';
      el.innerHTML = h;
      function onClick(e) {
        var j = e.target.closest('[data-j]');
        if (j) { var t = el.querySelector('#ea' + j.getAttribute('data-j')); if (t) t.scrollIntoView({ behavior: ctx.UI.reduced() ? 'auto' : 'smooth', block: 'start' }); return; }
        var g = e.target.closest('[data-go]');
        if (g) ctx.go(g.getAttribute('data-go'), g.getAttribute('data-animal') ? { animal: g.getAttribute('data-animal') } : {});
      }
      el.addEventListener('click', onClick);
      return function () { el.removeEventListener('click', onClick); };
    }
  };
})();
