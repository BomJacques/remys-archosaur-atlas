/* facts.js: "Did you know?" page: Cousin Challenge game + surprising facts + modern look-alikes.
   Also exposes window.FACTS (used by the home page "Did you know?" shuffle). */
(function () {
  'use strict';

  /* ---------- the facts ----------
     tag: cousins | dino | lookalike | evo
     conf (optional): 'solid' (well established) or 'likely' (strong evidence, still debated) */
  var FACTS = [
    { id: 'dugong', emoji: '🌊', tag: 'cousins', title: 'A dugong is closer kin to an elephant than to a dolphin!',
      text: 'Dugongs and manatees ("sea cows") look like they should be dolphin cousins, because they live in the sea. But their family tree says their nearest relatives are elephants and hyraxes.',
      why: 'Their ancestors walked on land, then went back to the water. Living in water shaped their bodies, but not their family tree.', conf: 'solid' },
    { id: 'hippo', emoji: '🦛', tag: 'cousins', title: 'Hippos are closer kin to whales than to pigs',
      text: 'The closest living relatives of whales and dolphins are hippos! The ancestor of both was a land animal that lived about 55 million years ago.',
      why: 'Whales are mammals whose ancestors walked on land. Look inside a whale and you can find tiny leftover hip bones.', conf: 'solid' },
    { id: 'bat', emoji: '🦇', tag: 'cousins', title: 'A bat is closer kin to a cow than to a mouse',
      text: 'Bats look a bit like flying mice, but DNA says they are in the same big branch as horses, cows, dogs and whales instead.',
      why: 'Wings evolved from front legs. Looking alike on the outside can hide very different family trees.', conf: 'solid' },
    { id: 'mouse', emoji: '🐭', tag: 'cousins', title: 'You are closer kin to a mouse than to a dog',
      text: 'Humans and mice share a common ancestor from around 90 million years ago. Dogs split off from our branch a little earlier.',
      why: 'Closeness on the tree is about how recently two animals shared an ancestor, not about who looks or acts more like us.', conf: 'likely' },
    { id: 'croc-bird', emoji: '🐊', tag: 'cousins', title: 'Crocodiles are closer kin to birds than to lizards',
      text: 'Crocodiles and birds are the only living archosaurs ("ruling reptiles"). A crocodile is a distant cousin of a magpie, not a giant gecko!',
      why: 'The archosaur branch split in two: one side led to crocodiles, the other to dinosaurs and birds.', conf: 'solid', go: ['lineage', 'crocodile'] },
    { id: 'chicken-trex', emoji: '🐔', tag: 'dino', title: 'A chicken is closer kin to T. rex than T. rex is to Stegosaurus',
      text: 'T. rex and chickens were both theropods (two-legged dinosaurs with three main toes). Stegosaurus was on a different branch of the dinosaur family tree.',
      why: 'Dinosaurs are not one ladder. They are a branching tree, and one twig of it is still alive: birds.', conf: 'solid', go: ['lineage', 'chicken'] },
    { id: 'magpie-mirror', emoji: '🪞', tag: 'dino', title: 'A magpie can recognise itself in a mirror',
      text: 'Eurasian magpies have passed a mirror test that only a few animals pass. Living dinosaurs can be very clever.',
      why: 'Big brains evolved more than once. Corvids (the crow and magpie family) and apes both got there on their own.', conf: 'solid', go: ['lineage', 'magpie'] },
    { id: 'hummer', emoji: '🐝', tag: 'dino', title: 'The smallest dinosaur alive weighs about as much as a paperclip',
      text: 'The bee hummingbird is a living dinosaur, only about 6 cm long and around 2 grams. Its ancestors included animals as big as a bus.',
      why: 'Shrinking can be an advantage too. Small bodies and fast wings let hummingbirds hover and sip nectar.', conf: 'solid', go: ['lineage', 'hummingbird'] },
    { id: 'wishbone', emoji: '🥢', tag: 'dino', title: 'Your Sunday-roast wishbone is a dinosaur bone',
      text: 'The wishbone (furcula) is two collarbones joined together. Many theropod dinosaurs, including T. rex, had one too.',
      why: 'Birds did not invent the wishbone. They inherited it from their dinosaur ancestors.', conf: 'solid' },
    { id: 'chicken-scales', emoji: '🦶', tag: 'dino', title: 'Chicken feet are covered in scales',
      text: 'Look at a chicken\'s legs: scales! Feathers and scales are built from the same kind of material (keratin) and birds kept scales on their feet.',
      why: 'Evolution often re-uses old parts. Feathers grew from skin that already made scales.', conf: 'solid', go: ['lineage', 'chicken'] },
    { id: 'ostrich', emoji: '🏃', tag: 'dino', title: 'An ostrich can sprint about as fast as a car in town',
      text: 'Ostriches can run around 70 km/h. Some "ostrich-mimic" dinosaurs (ornithomimids) had a similar body and may have been nearly as quick.',
      why: 'When a long-legged, light body works well for running, evolution can find it more than once.', conf: 'likely', go: ['lineage', 'ostrich'] },
    { id: 'cassowary', emoji: '🦤', tag: 'dino', title: 'A cassowary is probably the closest you can get to meeting a raptor',
      text: 'Cassowaries are huge, flightless birds with a head crest and a dagger-like claw about as long as your hand. They are shy but they are very dangerous if cornered.',
      why: 'Flightlessness evolved many times in birds that had plenty of food on the ground and few predators.', conf: 'solid' },
    { id: 'dolphin-ichthyo', emoji: '🐬', tag: 'lookalike', title: 'Dolphins and ichthyosaurs look alike but are not related',
      text: 'Ichthyosaurs were reptiles that lived in the sea at the same time as the dinosaurs. They had a dolphin-shaped body, a fin on the back and a tail fluke. Dolphins are mammals that evolved the same shape about 150 million years later.',
      why: 'This is called convergent evolution: the same problem (fast swimming) can lead to the same shape in very different animals.', conf: 'solid' },
    { id: 'rhino-trike', emoji: '🦏', tag: 'lookalike', title: 'A rhino is the modern Triceratops, but not a relative',
      text: 'Big, heavy plant-eaters with horns on the face evolved twice: ceratopsian dinosaurs and, much later, rhinos. They are far apart on the tree.',
      why: 'Defending yourself with horns and eating tough plants is a way of life that evolution finds again and again.', conf: 'solid' },
    { id: 'giraffe-sauro', emoji: '🦒', tag: 'lookalike', title: 'Giraffes reach high leaves like long-necked dinosaurs did',
      text: 'Sauropods (like Brachiosaurus) and giraffes both stretched their necks to eat leaves other animals could not reach. They are not related at all.',
      why: 'Food high up in the trees is a prize. Longer necks helped those that could reach it leave more babies.', conf: 'solid', go: ['giants'] },
    { id: 'albatross', emoji: '🪽', tag: 'lookalike', title: 'Albatrosses glide over the sea like some pterosaurs did',
      text: 'Pterosaurs such as Pteranodon soared over the oceans looking for fish. Albatrosses do the same today, with feathers instead of skin wings. Pterosaurs were NOT dinosaurs, and birds are not pterosaurs.',
      why: 'Flight evolved separately in pterosaurs, birds and bats. Each built wings from different body parts.', conf: 'solid' },
    { id: 'penguin-marine', emoji: '🐧', tag: 'lookalike', title: 'Penguins are dinosaurs that went back to the sea',
      text: 'Penguins cannot fly, but they "fly" underwater using their wings. Long ago, marine reptiles like mosasaurs and plesiosaurs also made their living in the sea.',
      why: 'Many land animals have returned to the water: whales, seals, penguins, sea turtles and sea snakes.', conf: 'solid', go: ['lineage', 'penguin'] },
    { id: 'komodo', emoji: '🦎', tag: 'cousins', title: 'Mosasaurs were giant sea lizards related to snakes and monitor lizards',
      text: 'Mosasaurs were not dinosaurs. They belong to the lizard-and-snake branch, and the Komodo dragon (the biggest living lizard) is one of their distant cousins.',
      why: 'Lizards went to sea more than once. Mosasaurs grew over 10 metres long.', conf: 'solid', go: ['lineage', 'gecko'] },
    { id: 'snake-lizard', emoji: '🐍', tag: 'cousins', title: 'A snake is a lizard that lost its legs',
      text: 'Snakes grew from legged lizard ancestors. Some snakes, like boas, still have tiny leftover hip bones and little claws.',
      why: 'If an animal no longer needs a body part, there is nothing keeping it big. Over many generations it can shrink away.', conf: 'solid', go: ['lineage', 'snake'] },
    { id: 'tuatara', emoji: '🏝️', tag: 'cousins', title: 'The tuatara looks like a lizard, but it is not one',
      text: 'The tuatara of New Zealand is the last survivor of a separate branch, and it even has a "third eye" on top of its head that senses light.',
      why: 'Some branches of the tree have lots of twigs, and some, like this one, have just one left.', conf: 'solid', go: ['lineage', 'tuatara'] },
    { id: 'turtle', emoji: '🐢', tag: 'cousins', title: 'A turtle shell is its ribs!',
      text: 'The shell grows from the turtle\'s ribs and backbone. Where turtles fit on the family tree is still argued about, but a lot of the DNA evidence puts them close to the crocodile-and-bird branch.',
      why: 'Evolution builds new things out of old parts. A turtle shell is a rib cage that spread out and fused.', conf: 'likely', go: ['lineage', 'tortoise'] },
    { id: 'parenting', emoji: '🥚', tag: 'cousins', title: 'Crocodiles and birds are both caring parents',
      text: 'Crocodiles guard their nests and carry their hatchlings gently in their jaws. Birds also build nests and feed their chicks. Both are archosaurs, so they may have inherited this from a common ancestor.',
      why: 'Behaviour can run in a family tree, just like bones.', conf: 'likely', go: ['lineage', 'crocodile'] },
    { id: 'no-ladder', emoji: '🪜', tag: 'evo', title: 'Humans did not come from chimpanzees',
      text: 'Humans and chimpanzees are cousins. We share a common ancestor from about 6 to 7 million years ago, which was neither a human nor a chimp.',
      why: 'Evolution is a branching bush, not a ladder, and nobody is the "final form".', conf: 'solid', go: ['lineage', 'human'] },
    { id: 'living-fossil', emoji: '🦖', tag: 'evo', title: 'Crocodiles are not "unchanged dinosaurs"',
      text: 'Crocodile ancestors were not dinosaurs, and early crocodile relatives were very different: some ran on two legs and some were armoured plant-eaters. Today\'s crocodiles kept a body plan that works.',
      why: 'If a shape keeps working in a stable home, selection keeps it. That is different from "not changing".', conf: 'solid', go: ['lineage', 'crocodile'] }
  ];
  window.FACTS = FACTS;

  var TAGS = [
    { id: 'all', t: 'All facts', e: '✨' },
    { id: 'cousins', t: 'Surprising cousins', e: '🤝' },
    { id: 'dino', t: 'Living dinosaurs', e: '🐦' },
    { id: 'lookalike', t: 'Look-alikes', e: '🪞' },
    { id: 'evo', t: 'Evolution myths', e: '🌿' }
  ];

  /* ---------- Cousin Challenge ----------
     a, b = the close pair (b is the correct answer), c = the more distant animal.
     ma / mr = about when the pairs' ancestors lived (million years ago), for non-tree animals.
     Items with an `id` come from the family tree data (art and dates are looked up). */
  var TRIPLES = [
    { a: { n: 'Dugong', e: '🌊', s: 'a sea cow' }, b: { n: 'Elephant', e: '🐘' }, c: { n: 'Dolphin', e: '🐬' }, ma: 'about 65', mr: 'about 100',
      why: 'Dugongs, elephants and hyraxes belong to one branch that began in Africa. Dolphins are in a different one. Dugongs look like dolphins because both live in water.' },
    { a: { n: 'Hippo', e: '🦛' }, b: { n: 'Dolphin', e: '🐬' }, c: { n: 'Pig', e: '🐖' }, ma: 'about 55', mr: 'about 60',
      why: 'Whales and dolphins grew from land animals that were close relatives of hippos. Pigs only look like hippos on the outside.' },
    { a: { n: 'Bat', e: '🦇' }, b: { n: 'Cow', e: '🐄' }, c: { n: 'Mouse', e: '🐭' }, ma: 'about 80', mr: 'about 95',
      why: 'Bats sit with horses, cows, dogs and whales. Mice and rats are in a different branch with us and rabbits.' },
    { a: { n: 'Human', e: '🧒' }, b: { n: 'Mouse', e: '🐭' }, c: { n: 'Dog', e: '🐕' }, ma: 'about 90', mr: 'about 95',
      why: 'Mice and humans share a more recent ancestor than either does with dogs. It is a close call, so the answer is "a little closer".' },
    { a: { id: 'crocodile' }, b: { id: 'magpie' }, c: { id: 'gecko' }, tree: true,
      why: 'Crocodiles and birds are both archosaurs. Lizards are on another branch, even though a crocodile looks much more like a big lizard.' },
    { a: { id: 'trex' }, b: { id: 'chicken' }, c: { id: 'stegosaurus' }, tree: true,
      why: 'T. rex and a chicken are both theropods. Stegosaurus was on the other main branch of the dinosaur family tree.' }
  ];

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  window.Views = window.Views || {};
  window.Views.facts = {
    title: 'Did you know?', icon: '💡',
    mount: function (el, ctx) {
      var D = ctx.DATA, Art = ctx.Art, esc = ctx.UI.esc;
      var tag = 'all';
      var G = { round: -1, score: 0, list: [], answered: false };

      function shortName(t) { return String(t.name).replace(/\s*\(.*$/, ''); }
      function item(x) {
        if (x.id && D.byId(x.id)) { var t = D.byId(x.id); return { n: shortName(t), art: t.artId || t.id, taxon: t }; }
        return { n: x.n, e: x.e, s: x.s };
      }
      function face(it, big) {
        return '<span class="facts-face' + (big ? ' big' : '') + '">' +
          (it.art && Art.has(it.art) ? Art.svg(it.art) : '<span class="facts-emoji" aria-hidden="true">' + (it.e || '❓') + '</span>') + '</span>';
      }
      function times(tr) {
        if (tr.tree) {
          var l1 = D.lca(tr.a.id, tr.b.id), l2 = D.lca(tr.a.id, tr.c.id);
          return { ma: l1 ? 'about ' + l1.mya : '?', mr: l2 ? 'about ' + l2.mya : '?', n1: l1 ? shortName(l1) : '', n2: l2 ? shortName(l2) : '' };
        }
        return { ma: tr.ma, mr: tr.mr };
      }
      function diagram(tr) {
        var A = item(tr.a), B = item(tr.b), C = item(tr.c), T = times(tr);
        var svg = '<svg viewBox="0 0 300 120" class="facts-tree-svg" role="img" aria-label="Family tree: ' + esc(A.n + ' and ' + B.n) + ' are closer than ' + esc(C.n) + '">' +
          '<g fill="none" stroke="#2f3b5c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M50,118 V80 H100"/><path d="M150,118 V80 H100"/><path d="M100,80 V44 H175" stroke="#ff6b3d"/><path d="M250,118 V44 H175"/><path d="M175,44 V12" stroke-dasharray="2 5"/></g>' +
          '<circle cx="100" cy="80" r="5" fill="#ff6b3d"/><circle cx="175" cy="44" r="5" fill="#2f3b5c"/>' +
          '<text x="104" y="96" font-size="10" fill="#b3411f" font-weight="700">' + esc(T.ma) + ' million years ago</text>' +
          '<text x="180" y="40" font-size="10" fill="#2f3b5c" font-weight="700">' + esc(T.mr) + ' million years ago</text></svg>';
        return '<div class="facts-diagram">' + svg + '<div class="facts-leaves">' + [A, B, C].map(function (it, i) {
          return '<div class="facts-leaf' + (i === 2 ? ' far' : '') + '">' + face(it) + '<b>' + esc(it.n) + '</b></div>';
        }).join('') + '</div></div>';
      }

      /* ---------- game ---------- */
      function startGame() { G.list = shuffle(TRIPLES); G.round = 0; G.score = 0; G.answered = false; renderGame(); }
      function renderGame() {
        var box = el.querySelector('#factsGame');
        if (G.round < 0) {
          box.innerHTML = '<div class="facts-game-intro"><div class="facts-big">🤝</div><h2>Cousin Challenge</h2>' +
            '<p>Some animals look alike but are not close kin. Can you pick the <b>closer cousin</b>? ' + TRIPLES.length + ' quick rounds.</p>' +
            '<button class="btn btn-big" id="gStart" type="button">Start the challenge</button></div>';
          return;
        }
        if (G.round >= G.list.length) {
          var pct = G.score / G.list.length;
          box.innerHTML = '<div class="facts-game-intro"><div class="facts-big">' + (pct >= 0.8 ? '🏆' : pct >= 0.5 ? '⭐' : '🌱') + '</div><h2>' + G.score + ' out of ' + G.list.length + '!</h2>' +
            '<p>' + (pct >= 0.8 ? 'Amazing! You think like an evolutionary biologist.' : pct >= 0.5 ? 'Nice work. The family tree is full of surprises!' : 'Tricky, right? Looks can fool you. That is the whole point.') + '</p>' +
            '<button class="btn btn-big" id="gStart" type="button">Play again</button></div>';
          return;
        }
        var tr = G.list[G.round], A = item(tr.a), opts = shuffle([{ k: 'b', it: item(tr.b) }, { k: 'c', it: item(tr.c) }]);
        box.innerHTML = '<div class="facts-q"><div class="facts-q-top">Round ' + (G.round + 1) + ' of ' + G.list.length + ' · score ' + G.score + '</div>' +
          '<h2 class="facts-q-title">Which is the <b>closer cousin</b> of the ' + esc(A.n) + '?' + (A.s ? ' <span class="muted">(' + esc(A.s) + ')</span>' : '') + '</h2>' +
          '<div class="facts-q-a">' + face(A, true) + '</div>' +
          '<div class="facts-opts">' + opts.map(function (o) {
            return '<button type="button" class="facts-opt" data-k="' + o.k + '">' + face(o.it) + '<span>' + esc(o.it.n) + '</span></button>';
          }).join('') + '</div><div class="facts-reveal" id="gReveal" aria-live="polite"></div></div>';
        G.answered = false;
      }
      function answer(k, btn) {
        if (G.answered) return; G.answered = true;
        var tr = G.list[G.round], ok = k === 'b';
        if (ok) G.score++;
        var opts = el.querySelectorAll('.facts-opt');
        Array.prototype.forEach.call(opts, function (o) {
          o.disabled = true;
          o.classList.add(o.getAttribute('data-k') === 'b' ? 'right' : (o === btn ? 'wrong' : 'dim'));
        });
        el.querySelector('#gReveal').innerHTML = '<p class="facts-verdict ' + (ok ? 'ok' : 'no') + '">' + (ok ? '✅ Yes!' : '❌ Not quite.') + '</p>' + diagram(tr) +
          '<p>' + esc(tr.why) + '</p><button class="btn" id="gNext" type="button">' + (G.round + 1 >= G.list.length ? 'See my score' : 'Next round ▶') + '</button>';
        var n = el.querySelector('#gNext'); if (n) n.focus({ preventScroll: false });
      }

      /* ---------- cards ---------- */
      function renderCards() {
        var list = FACTS.filter(function (f) { return tag === 'all' || f.tag === tag; });
        el.querySelector('#factsCards').innerHTML = list.map(function (f) {
          return '<article class="card facts-card" data-t="' + f.tag + '"><div class="facts-card-top"><span class="facts-card-ico" aria-hidden="true">' + f.emoji + '</span>' +
            '<h3>' + esc(f.title) + '</h3></div><p>' + esc(f.text) + '</p>' +
            '<p class="facts-why"><b>Evolution idea:</b> ' + esc(f.why) + '</p>' +
            (f.conf === 'likely' ? '<p class="facts-conf">🔎 Strong evidence, but scientists still debate some details.</p>' : '') +
            (f.go ? '<button class="btn btn-ghost" type="button" data-go="' + f.go[0] + '"' + (f.go[1] ? ' data-animal="' + f.go[1] + '"' : '') + '>' + (f.go[0] === 'giants' ? 'See the size comparison' : 'Trace this family tree') + '</button>' : '') +
            '</article>';
        }).join('');
        Array.prototype.forEach.call(el.querySelectorAll('.facts-tag'), function (b) { b.classList.toggle('on', b.getAttribute('data-tag') === tag); b.setAttribute('aria-pressed', b.getAttribute('data-tag') === tag ? 'true' : 'false'); });
      }

      el.innerHTML = '<section class="card facts-hero"><h1 class="page-title">Did you know? 💡</h1>' +
        '<p>The family tree is full of surprises. Animals that <b>look</b> alike can be far-off cousins, and animals that look nothing like each other can be close kin. Play the challenge, then explore the facts.</p></section>' +
        '<section class="card facts-game" id="factsGame"></section>' +
        '<h2 class="sec-title">Surprising facts</h2>' +
        '<div class="facts-tags" role="group" aria-label="Filter facts">' + TAGS.map(function (t) { return '<button type="button" class="facts-tag" data-tag="' + t.id + '" aria-pressed="false">' + t.e + ' ' + t.t + '</button>'; }).join('') + '</div>' +
        '<div class="facts-cards" id="factsCards"></div>';
      renderGame(); renderCards();

      function onClick(e) {
        var t = e.target;
        if (t.closest('#gStart')) { startGame(); return; }
        var o = t.closest('.facts-opt'); if (o) { answer(o.getAttribute('data-k'), o); return; }
        if (t.closest('#gNext')) { G.round++; renderGame(); return; }
        var tg = t.closest('.facts-tag'); if (tg) { tag = tg.getAttribute('data-tag'); renderCards(); return; }
        var b = t.closest('[data-go]');
        if (b) { ctx.go(b.getAttribute('data-go'), b.getAttribute('data-animal') ? { animal: b.getAttribute('data-animal') } : {}); }
      }
      el.addEventListener('click', onClick);
      return function () { el.removeEventListener('click', onClick); };
    }
  };
})();
