# Remy's Archosaur Family Album — build spec (shared contract)

Working title (placeholder, may change): **Remy's Archosaur Family Album**. Store it ONLY in `DATA.app.name`.

Audience: a curious child (~8–12). Tone: warm, funny, concrete, never babyish. Short sentences. Explain every
science word the first time it appears. Visuals first, text second.

Tech: static site, **no build step, no npm, no CDN/external requests** (must work offline and on GitHub Pages
from a repo subfolder → all paths relative). Plain HTML + CSS + vanilla JS (ES2018, no modules; classic
`<script>` tags). Inline SVG for all imagery (we cannot download images). Responsive: phone → tablet → desktop;
touch friendly (44px targets). Respect `prefers-reduced-motion`.

## Science guard-rails (everyone follow)
- Birds ARE dinosaurs (avian dinosaurs), not just "descended from". A magpie is a living theropod dinosaur.
- Crocodilians are archosaur COUSINS of dinosaurs/birds, NOT ancestors. They share a common ancestor ~250 Ma.
- Pterosaurs and marine reptiles (mosasaurs, plesiosaurs, ichthyosaurs) are NOT dinosaurs. Dimetrodon is NOT a
  dinosaur and not really a reptile — it is a synapsid, on the mammal side.
- "Reptile" is an everyday word, not a clean family-tree group (birds are inside it, evolutionarily). Say so kindly.
- Turtle placement is debated (most DNA evidence: close to archosaurs). Say "scientists still argue".
- Evolution has NO goal, no ladder, no "more advanced". Nothing "tries" to evolve. Use "populations", not "an
  animal changes". Individuals don't evolve; populations do over generations.
- Mark uncertainty honestly: theories for giant size are "strong evidence / likely / still debated".
- Dates are approximate, in Mya (million years ago).

## Files and ownership (NO agent edits another agent's files)
```
index.html               GUI agent
css/style.css            GUI agent
css/lab.css              Lab agent  (all selectors prefixed .lab- or .giants-)
js/data.js               Data agent
js/art-core.js           GUI agent
js/art-a.js              Art-A agent
js/art-b.js              Art-B agent
js/app.js                GUI agent
js/views/home.js         GUI agent
js/views/lineage.js      GUI agent   (the main interactive feature)
js/views/reptiles.js     GUI agent
js/views/timeline.js     GUI agent
js/views/quiz.js         GUI agent
js/views/lab.js          Lab agent   (How evolution works + simulations)
js/views/giants.js       Lab agent   (Why did dinosaurs get so big?)
```
Script order in index.html: data.js, art-core.js, art-a.js, art-b.js, views/*.js, app.js. Views are looked up at
navigation time; app.js must tolerate a missing view (friendly "coming soon" card) so agents can work in parallel.

## Shared CSS tokens (defined by GUI agent in :root; Lab agent may use them, with fallbacks)
`--bg --card --ink --muted --accent --accent2 --good --warn --bad --radius --shadow --font`
Bright, friendly, light theme. Rounded system font stack. Era colours come from `DATA.eras[i].color`.

## View contract
Each view file does: `window.Views = window.Views || {}; Views.<name> = { title, icon /*emoji*/, mount(el, ctx) }`
`ctx = { DATA, Art, go(viewName, params) }`. `mount` renders into `el` (empty it first) and may return a
`destroy()` function. Names: `home, lineage, reptiles, timeline, lab, giants, quiz`.
`go('lineage', {animal:'magpie'})` deep-links; views read `params` as `ctx.params`.

## Art contract (SVG strings)
- Files `art-a.js` / `art-b.js` each start with `window.ART = window.ART || {};` then assign
  `ART['<artId>'] = '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">…</svg>';`
- Every SVG: `viewBox="0 0 400 300"`, animal faces RIGHT, transparent background, no `<script>`, no external refs,
  no fixed width/height (scales by CSS). Unique `id`s inside gradients must be prefixed with the artId.
- Style: friendly flat/vector storybook look — bold shapes, soft gradients, rounded forms, big readable eyes,
  2–3 tone shading, a little ground shadow ellipse. Scientifically sensible proportions and the correct
  features (feathers on maniraptorans, etc.). Accurate > cute, but must be appealing to a kid.
- `art-core.js` (GUI agent) provides `Art.svg(id, {cls, title})` → string (placeholder silhouette if missing),
  `Art.has(id)`, `Art.ids()`.
- artId == taxon id (below) for animals. Extra ids: `scene-permian, scene-triassic, scene-jurassic,
  scene-cretaceous, scene-paleogene, scene-today` (wide backdrops, same 400x300 viewBox, no animals or just tiny
  silhouettes), `bg-leaf` and `bg-bones` (subtle tile-able decoration), `logo` (app logo mark: a friendly
  dinosaur/magpie hybrid or a fossil-bird motif).

## THE TREE (canonical ids — data and art MUST use exactly these)
Format: `id (parent)  ≈ Mya first appears  — kid nickname`. `*` = living animal (modern: true).
```
amniote (—) 318 — First egg-layers on land
 synapsid (amniote) 315 — Mammal-side cousins
  dimetrodon (synapsid) 280 — Sail-back (not a dinosaur!)
  cynodont (synapsid) 250 — Furry almost-mammal
   mammal (cynodont) 210 — Mammals
    cat* (mammal)   human* (mammal)
 sauropsid (amniote) 310 — Scaly/feathery side
  lepidosaur (sauropsid) 250 — Lizard & snake family
   gecko* (lepidosaur)   snake* (lepidosaur)   tuatara* (lepidosaur)   mosasaur (lepidosaur) 80 — Sea giant (not a dino)
  turtle (sauropsid) 220 — Shell family (placement debated)
   tortoise* (turtle)
  archosaur (sauropsid) 252 — "Ruling reptiles"
   pseudosuchian (archosaur) 250 — Croc-line archosaurs
    postosuchus (pseudosuchian) 228 — Triassic land-croc "rauisuchian"
    crocodylomorph (pseudosuchian) 230 — Croc relatives
     crocodile* (crocodylomorph)   alligator* (crocodylomorph)
   avemetatarsalian (archosaur) 247 — Bird-line archosaurs
    pterosaur (avemetatarsalian) 228 — Flying reptiles (not dinos)
     quetzalcoatlus (pterosaur) 68 — Giraffe-tall pterosaur
    dinosauromorph (avemetatarsalian) 245 — Dinosaur cousins (e.g. Marasuchus)
     dinosaur (dinosauromorph) 243 — First dinosaurs
      ornithischian (dinosaur) 230 — "Bird-hipped" dinosaurs
       stegosaurus (ornithischian) 150   triceratops (ornithischian) 68   ankylosaurus (ornithischian) 68
       parasaurolophus (ornithischian) 76
      saurischian (dinosaur) 231 — "Lizard-hipped" dinosaurs
       sauropodomorph (saurischian) 230 — Long-neck family
        plateosaurus (sauropodomorph) 215 — Small early long-neck
        brachiosaurus (sauropodomorph) 150   argentinosaurus (sauropodomorph) 95 — one of the biggest ever
       theropod (saurischian) 231 — Meat-eater family (two legs)
        coelophysis (theropod) 215 — Small early theropod
        allosaurus (theropod) 150
        tyrannosaur (theropod) 170 — Tyrannosaur family
         trex (tyrannosaur) 68
        coelurosaur (theropod) 170 — Feathery theropods
         maniraptoran (coelurosaur) 165 — "Hand-graspers"
          velociraptor (maniraptoran) 75   microraptor (maniraptoran) 120 — four-winged glider
          avialan (maniraptoran) 160 — Bird line
           archaeopteryx (avialan) 150 — Famous first-bird fossil
           neornithine (avialan) 100 — Modern-type birds
            ostrich* (neornithine)   chicken* (neornithine)   penguin* (neornithine)
            hummingbird* (neornithine)
            passerine (neornithine) 60 — Perching/song birds
             magpie* (passerine)
```
Totals: 50 taxa. Parents above define `parent`. Root is `amniote`.

## Data contract (`js/data.js` → `window.DATA`)
```js
DATA.app    = { name, tagline, shortName }
DATA.eras   = [{ id, name, startMya, endMya, color, blurb, sceneArtId }]   // Carboniferous→Today (incl. Permian,
                                                                           // Triassic, Jurassic, Cretaceous, Paleogene, Neogene+Quaternary "Today")
DATA.taxa   = [{ id, parent, name, nickname, group, mya, modern:bool, rank:'group'|'species'|'living',
                 diet, lengthM, massKg, habitat,
                 blurb,          // 2 short sentences, kid-level
                 keyTrait,       // "what new thing showed up at this step on the way down the tree" (1 sentence)
                 whyItMatters,   // link to evolution idea (1–2 sentences)
                 facts:[3 strings], artId, color }]
DATA.byId(id), DATA.children(id), DATA.pathTo(id) /* root→id array of taxa */,
DATA.lca(idA, idB) /* last common ancestor taxon */, DATA.mrcaStory(idA,idB) /* kid sentence, e.g. "…share a grandparent from ~250 million years ago" */
DATA.animals = [{ id, headline /* "A magpie is a dinosaur!" */, proof:[3 clues], cousinNote, funFact }]  // living ones
DATA.reptileTypes = [{ id, name, emoji, examples:[], legs, skin, eggs, bloodType, heartOrSkullNote, hips?,
                       keyFact, notDino:bool, taxonId, artId, oneLine }]
   // lizards&snakes, turtles, crocodilians, dinosaurs(non-bird), birds, pterosaurs, marine reptiles(mosasaur/plesiosaur/ichthyosaur),
   // synapsids (Dimetrodon – mammal side), tuatara. Also DATA.reptileCompareRows = fields to compare.
DATA.hipTypes / DATA.archosaurFeatures = short explainers (the "archosaur" skull holes & upright legs; bird-hip vs lizard-hip; "ruling reptile")
DATA.giantTheories = [{ id, emoji, title, oneLiner, explanation, evolutionLesson /* how natural selection explains it */,
                        evidence:[..], confidence:'strong'|'likely'|'debated', counter /* the doubt */ }]
   // oxygen & climate/plant food; air-sac "bird-style" lungs; hollow bones; laying many small eggs (fast growth,
   // no need to carry babies); growth rate; Cope's rule / arms-race (big predators ⇄ big prey); long neck = high
   // browsing & efficient feeding; Gigantothermy / heat; "few competitors after mass extinction" & why dwarfing happens on islands
DATA.evolutionConcepts = [{ id, emoji, title, kidExplain, example:{setup, steps:[…], punchline}, misconception, tryItNote }]
   // variation, inheritance, selection (thicker beaks eat more seeds), time (many generations), adaptation, common ancestor
   // (family tree!), cousins vs ancestors, extinction & mass extinctions, "no goal / no ladder", DNA mutations.
DATA.timelineEvents = [{ mya, title, text, taxonId? }]   // incl. Permian extinction 252, first dinosaurs 243, Triassic ext. 201,
                                                          // Archaeopteryx 150, K-Pg asteroid 66, etc.
DATA.quiz = [{ q, choices:[4], answer:index, why, level:1|2|3 }]  // 20 questions
DATA.glossary = [{ term, def }]
```
Data agent also writes helper functions inside data.js (no deps), and all text must follow science guard-rails.

## Feature list (who builds what)
GUI agent:
- **Home**: hero with logo + big animal picker ("Who do you want to trace back?" — cards with art for the living animals).
- **Lineage Explorer (flagship)**: pick a living animal (magpie, chicken, ostrich, penguin, hummingbird, crocodile,
  alligator, gecko, snake, tortoise, cat, human, tuatara). Show an interactive vertical/horizontal "ancestor path" from
  today back to the first amniote: scrubbing a Time slider (Mya) or clicking ancestor nodes → big art card with
  nickname, keyTrait, facts, scene backdrop by era. Side branches ("cousins that split off here": e.g. at "archosaur"
  show crocodiles vs birds) are expandable and tappable; tap one to compare. A **"Meet the cousin" compare** pick-two
  tool using `DATA.lca` and `mrcaStory`. A "Family tree" overview mode (zoomable radial or left-to-right SVG tree
  of all 50 taxa with the current animal's path highlighted). Everything animates smoothly.
- **Reptile Types**: compare table/cards of `DATA.reptileTypes` (pick any 2–3, side-by-side), plus the "what is an
  archosaur?" explainer with `hipTypes`, and a "Is it a dinosaur?" sorting game (drag or tap: dinosaur / not dinosaur).
- **Timeline**: horizontal era scroller with scene art and `timelineEvents`, tap event to see taxa.
- **Quiz**: 20 questions, 10 random per round, friendly feedback with `why`, score & badges.
- Nav (bottom tab bar on mobile, top bar on desktop), glossary drawer, hash routing (`#/lineage/magpie`), a11y
  (focus states, aria labels, keyboard operable), print-friendly not required.
Lab agent:
- **lab view ("How evolution works")**: step-by-step story-mode concept cards from `DATA.evolutionConcepts` plus 3 working
  simulations — (1) **Seed Beaks**: a flock of birds with varying beak thickness, a seed supply with soft/hard seeds,
  user picks drought/wet year, press "next generation" → watch the average beak change over ~30 generations with a live
  histogram + beak drawings (inline SVG); (2) **Camouflage Critters**: tap-to-be-the-predator game on a background,
  prey colours shift over generations (this is "predation as selection"); (3) **Family Tree Maker**: tiny sandbox where
  a population splits into two isolated groups, mutations accumulate, and groups drift apart into "cousin species" with a
  drawn tree — shows common ancestor & cousins. Each sim has a "What just happened?" plain-English explanation.
  Explicit "no goal" misconception-busting panel.
- **giants view ("Why so big?")**: interactive **size comparison** (scale bar vs child / bus / T. rex / Argentinosaurus using
  taxa `lengthM`, silhouettes from Art), then each `DATA.giantTheories` as an expandable card with confidence meter and
  "how natural selection explains it" strip, plus a mini-sim "Grow-a-neck" (taller food = survival bonus → average neck
  length rises generation by generation) and the "island dwarfing" counter-example.
Art-A agent (ids): scenes + logo + bg tiles + `amniote synapsid dimetrodon cynodont mammal cat human sauropsid lepidosaur gecko snake tuatara mosasaur turtle tortoise archosaur pseudosuchian postosuchus crocodylomorph crocodile alligator avemetatarsalian pterosaur quetzalcoatlus dinosauromorph` (+ extra ids `plesiosaur`, `ichthyosaur` for the reptile compare).
Art-B agent (ids): `dinosaur ornithischian stegosaurus triceratops ankylosaurus parasaurolophus saurischian sauropodomorph plateosaurus brachiosaurus argentinosaurus theropod coelophysis allosaurus tyrannosaur trex coelurosaur maniraptoran velociraptor microraptor avialan archaeopteryx neornithine ostrich chicken penguin hummingbird passerine magpie` (+ extra ids `feather-closeup`, `skeleton-bird-vs-trex` (a side-by-side showing the wishbone/3-finger hand/hollow bones links), `egg-nest`).
 Group ids (e.g. `archosaur`) show a representative/ancestral-looking animal and may include a "?" ghost for hypothetical ancestors, hand-drawn reconstruction style, with a small label NOT burned into the art.

## Quality bar
Each agent: self-test (run `node --check` on JS, open in a headless/real browser if possible and check console errors),
then report a short list of: files written, public API exposed, known gaps. Don't write README/other docs.
Do not use `eval`, `innerHTML` with unescaped untrusted data (data is ours, but keep it tidy). No console errors.
