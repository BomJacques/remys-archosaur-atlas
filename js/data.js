/* Remy's Archosaur Family Album - data (single classic script, sets window.DATA).
   All dates are approximate, in Mya (million years ago). */
(function () {
  'use strict';

  var DATA = {};

  DATA.app = {
    name: "Remy's Archosaur Atlas",
    shortName: "Archosaur Atlas",
    tagline: "Pick an animal, travel back 4 billion years, and meet your dino-sized cousins!"
  };

  /* ---------------- ERAS ---------------- */
  DATA.eras = [
    { id: 'hadean', name: 'Hadean', startMya: 4540, endMya: 4000, color: '#d9622b',
      blurb: "A brand-new, red-hot Earth. The surface is partly molten and rocks keep crashing in. The oceans form near the end. Life may start by the end of this time.", sceneArtId: 'earth-hadean-young-earth' },
    { id: 'archean', name: 'Archean', startMya: 4000, endMya: 2500, color: '#2f6fa8',
      blurb: "Warm oceans, volcanoes, and no oxygen in the air. The first life is single cells. By 3.5 billion years ago microbes build layered mounds called stromatolites.", sceneArtId: 'scene-early-earth-microbial-world' },
    { id: 'proterozoic', name: 'Proterozoic', startMya: 2500, endMya: 539, color: '#6f8fb8',
      blurb: "Tiny cyanobacteria fill the air with oxygen. Ice may cover almost the whole planet in 'Snowball Earth' times. Late on, the first animals appear.", sceneArtId: 'scene-early-earth-waters' },
    { id: 'cambrian', name: 'Cambrian', startMya: 539, endMya: 485, color: '#3aa6a0',
      blurb: "Animals suddenly diversify in the sea, with eyes, shells, and legs. Small swimmers like Pikaia show the first signs of a backbone-style body.", sceneArtId: 'scene-cambrian-seafloor' },
    { id: 'ordsil', name: 'Ordovician and Silurian', startMya: 485, endMya: 419, color: '#4f86c6',
      blurb: "Seas full of shelled animals and early fish. The first plants creep onto the land edge.", sceneArtId: 'scene-cambrian-seafloor' },
    { id: 'devonian', name: 'Devonian', startMya: 419, endMya: 359, color: '#8a6fc1',
      blurb: "The Age of Fishes. Some fish grow strong fins, and the first four-legged animals like Acanthostega appear in shallow water.", sceneArtId: 'scene-late-devonian-375-to-365-million-years' },
    { id: 'carboniferous', name: 'Carboniferous', startMya: 359, endMya: 299, color: '#5b8c5a',
      blurb: "Steamy swamp forests with giant ferns and dragonfly-like insects as big as crows. In the middle of this time, the first amniotes (animals whose eggs can survive on dry land) appear.", sceneArtId: 'scene-permian' },
    { id: 'permian', name: 'Permian', startMya: 299, endMya: 252, color: '#c8743a',
      blurb: "One huge supercontinent with hot, dry deserts. Sail-backed Dimetrodon and other mammal-side animals rule. It ends with the biggest mass extinction ever.", sceneArtId: 'scene-permian' },
    { id: 'triassic', name: 'Triassic', startMya: 252, endMya: 201, color: '#a65d7e',
      blurb: "Life rebuilds after the Permian extinction. Archosaurs boom: early crocodile relatives, the first pterosaurs, the first dinosaurs, and the first tiny mammals.", sceneArtId: 'scene-triassic' },
    { id: 'jurassic', name: 'Jurassic', startMya: 201, endMya: 145, color: '#2f8f83',
      blurb: "Warm and green. Giant long-necked dinosaurs, plated stegosaurs, and big meat-eaters. Small feathered theropods give rise to the first birds.", sceneArtId: 'scene-jurassic' },
    { id: 'cretaceous', name: 'Cretaceous', startMya: 145, endMya: 66, color: '#6a9a3a',
      blurb: "Flowers appear. Tyrannosaurs, horned dinosaurs, and feathered raptors thrive. It ends when an asteroid hits and a mass extinction wipes out the non-bird dinosaurs.", sceneArtId: 'scene-cretaceous' },
    { id: 'paleogene', name: 'Paleogene', startMya: 66, endMya: 23, color: '#d9a441',
      blurb: "The world after the asteroid. Mammals and birds spread into the empty spaces, and songbirds begin to take off.", sceneArtId: 'scene-paleogene' },
    { id: 'today', name: 'Today', startMya: 23, endMya: 0, color: '#3b82c4',
      blurb: "Grasslands, ice ages, and us. About 11,000 species of living birds are the only dinosaurs still around.", sceneArtId: 'scene-today' }
  ];

  /* ---------------- TAXA ----------------
     T(id, parent, name, nickname, group, mya, rank, diet, lengthM, massKg, habitat, blurb, keyTrait, whyItMatters, facts[3]) */
  var RAW = [];
  function T(id, parent, name, nick, group, mya, rank, diet, len, mass, hab, blurb, key, why, facts) {
    RAW.push({ id: id, parent: parent, name: name, nickname: nick, group: group, mya: mya,
      modern: rank === 'living', rank: rank, diet: diet, lengthM: len, massKg: mass, habitat: hab,
      blurb: blurb, keyTrait: key, whyItMatters: why, facts: facts, artId: id });
  }

  T('luca', null, 'LUCA', 'Last Universal Common Ancestor', 'Life', 4000, 'group', 'Chemicals (probably)', 0, 0, 'Warm water, perhaps near hot vents',
    "LUCA is the single kind of ancient cell that all living things share as an ancestor: bacteria, mushrooms, oak trees, and you. Nobody has found its fossil. Scientists work it out from the DNA all life shares.",
    "A living cell that could copy its DNA and build proteins from a shared genetic code.",
    "Every living thing uses the same genetic code. That is strong evidence that all life comes from one common ancestor.",
    ["LUCA was probably a tiny single cell, not an animal.", "Scientists estimate it lived around 4 billion years ago, but that date is uncertain.", "It is the last common ancestor. Other life may have lived beside it, but only its descendants are still here."]);
  T('microbial-mat', 'luca', 'Microbial mats (stromatolites)', 'Layered mounds of microbes', 'Life', 3500, 'group', 'Sunlight and chemicals', 0, 0, 'Shallow warm seas',
    "Communities of microbes build layered mounds called stromatolites. Some fossil ones are about 3.5 billion years old, among the oldest signs of life. A few still grow today.",
    "Microbes team up in layered mats, and some (cyanobacteria) start using sunlight and making oxygen.",
    "Tiny cells changed the whole planet. Their oxygen later made big animals possible.",
    ["Fossil stromatolites in Western Australia are about 3.5 billion years old.", "You can still see living stromatolites at Shark Bay in Western Australia.", "Cyanobacteria slowly filled the air with oxygen, a change called the Great Oxidation about 2.4 billion years ago."]);
  T('pikaia', 'microbial-mat', 'Pikaia', 'Early swimmer with a stiff back-rod', 'Chordates', 505, 'species', 'Tiny food particles (probably)', 0.05, 0.001, 'Cambrian seas',
    "A small, flat swimmer about 5 cm long. It had a stiff rod (a notochord) along its back and muscle blocks, signs that it was an early relative of animals with backbones.",
    "A stiff rod along the back and zig-zag muscle blocks for swimming.",
    "The notochord is the ancestor of the backbone. Our own backbones grew from this kind of body plan.",
    ["Pikaia fossils come from the Burgess Shale in Canada, about 505 million years old.", "It was only about 5 cm long.", "Scientists still debate exactly where it fits on the family tree, but it shows what early chordates looked like."]);
  T('tiktaalik', 'pikaia', 'Tiktaalik', 'Fish with elbows and a neck', 'Tetrapodomorphs', 375, 'species', 'Small fish', 2.5, 100, 'Shallow streams and swamps',
    "A big, flat-headed fish with strong fins and a neck. Its fins had wrist-like bones, a clue to how animals later walked on land.",
    "Sturdy fins with bones that could push up, plus a flexible neck and lungs.",
    "A transitional fossil: big changes happen as many small steps, and Tiktaalik shows one of them.",
    ["It was found in 2004 on Ellesmere Island in Arctic Canada.", "Its name comes from an Inuktitut word for a large freshwater fish.", "It had gills and lungs, and it could lift its head out of the water."]);
  T('acanthostega', 'tiktaalik', 'Acanthostega', 'Four-legged water-dweller', 'Tetrapods', 365, 'species', 'Small fish and invertebrates', 0.6, 5, 'Shallow freshwater',
    "One of the first animals with real limbs with fingers, but it still lived mostly in the water and had gills and a fish-like tail fin.",
    "Limbs with fingers (eight on each hand) and a flat tail for swimming.",
    "Legs seem to have evolved first for moving in shallow water. Only later did they help animals walk on land.",
    ["It had eight fingers on each front foot.", "It had gills like a fish and a tail fin.", "It lived about 365 million years ago in Greenland, which was warm swamp land then."]);
  T('amniote', 'acanthostega', 'Amniotes', 'First egg-layers on land', 'Amniotes', 318, 'group', 'Small animals (probably insects)', 0.2, 0.1, 'Coal-swamp forests',
    "These small lizard-like animals lived about 318 million years ago. Nobody has found one single fossil and said 'this is THE ancestor', so this picture is a reconstruction.",
    "The amniotic egg: a shelled or leathery egg with its own little pond inside, so babies could be born on dry land.",
    "Every mammal, lizard, bird, croc and dinosaur has this animal's blood in the family. Our whole album starts here.",
    ["Early amniotes like Hylonomus were about the size of a lizard, around 20 cm long.", "Their eggs had a built-in water bag (the amnion), so they did not need to lay eggs in a pond like frogs do.", "Soon after they appeared, the family split into two big branches: the mammal side and the reptile-and-bird side."]);

  T('synapsid', 'amniote', 'Synapsids', 'Mammal-side cousins', 'Synapsids', 308, 'group', 'Varied: insects to meat', 1.5, 20, 'Swamps and deserts',
    "Synapsids are the branch that leads to mammals, including us. They have one opening low on each side of the skull behind the eye.",
    "One hole on each side of the skull (the word synapsid means 'fused arch'), which gave jaw muscles room to grow bigger.",
    "Our own branch split off from the reptile-and-bird branch over 300 million years ago. We are very distant cousins of lizards and birds, not descendants.",
    ["Old books called early synapsids 'mammal-like reptiles'. Scientists stopped using that name because they were never reptiles.", "Synapsids were the top land animals for much of the Permian.", "Only mammals survive today from this big branch."]);

  T('dimetrodon', 'synapsid', 'Dimetrodon', 'Sail-back (not a dinosaur!)', 'Synapsids', 280, 'species', 'Carnivore', 3.0, 250, 'Dry Permian plains',
    "Dimetrodon had a tall sail on its back and big teeth of different shapes. It lived at least 30 million years BEFORE the first dinosaur.",
    "Teeth of different shapes (stabbing, slicing) like mammals have, and a synapsid skull.",
    "Dimetrodon shows how a look-alike can be a cousin from a totally different branch. It is closer to you than it is to any dinosaur.",
    ["It is not a dinosaur, and not really a reptile: it is on the mammal side of the tree.", "The sail may have helped it warm up or show off. Scientists are still not sure which.", "Dimetrodon went extinct about 270 million years ago, long before dinosaurs existed."]);

  T('cynodont', 'synapsid', 'Cynodonts', 'Furry almost-mammal', 'Synapsids', 260, 'group', 'Insects and small prey', 0.5, 3, 'Triassic woodlands and burrows',
    "Cynodonts were small, fast animals that were probably warm-blooded and likely furry. They survived the biggest mass extinction.",
    "Whiskers and fur are likely (we infer them from tiny holes in the face bones), plus a more mammal-like jaw and teeth.",
    "Mammals did not appear in a single jump. Fossils show many small steps, so we can see the change happening across generations.",
    ["Some Triassic cynodonts dug burrows, which may have helped them live through hard times.", "Their jaw bones slowly shrank and some became tiny ear bones, now used in your hearing.", "Fur is soft and rarely fossilises, so we know it mostly from clues, not from preserved hair."]);

  T('mammal', 'cynodont', 'Mammals', 'Mammals', 'Synapsids', 210, 'group', 'Varied', 0.1, 0.03, 'Under dinosaurs\' feet',
    "The first mammals were tiny, about the size of a mouse. For over 140 million years they lived alongside the dinosaurs.",
    "Milk for babies, three tiny ear bones, and a jaw made of a single bone on each side.",
    "Mammals got big only after the dinosaurs (apart from birds) were gone. Open space is a big deal for evolution.",
    ["The first mammals were small, mostly nighttime animals.", "Platypus and echidnas are mammals that still lay eggs.", "There are about 6,000 mammal species alive today."]);

  T('cat', 'mammal', 'Domestic cat (Felis catus)', 'Cat', 'Mammals', 0, 'living', 'Meat (carnivore)', 0.46, 4.5, 'Homes, farms, and the wild',
    "Cats are mammals: furry, milk-drinking, and warm-blooded. They share an ancient grandparent with birds, over 300 million years back.",
    "Sharp slicing teeth and sensitive whiskers for a hunter's life.",
    "Cats and birds look nothing alike, yet both inherited a backbone, four limb-bones, and an amniote egg-ancestor from the same far-away ancestor.",
    ["Pet cats have lived with people for about 10,000 years.", "A cat's whiskers can sense tiny air movements.", "Cats can rotate their ears independently."]);

  T('human', 'mammal', 'Human (Homo sapiens)', 'Human (you!)', 'Mammals', 0, 'living', 'Everything (omnivore)', 1.7, 60, 'Everywhere',
    "That's you! You are a mammal, and an amniote, and your family tree runs through the same branch as Dimetrodon.",
    "A very big brain for our body size and hands that can grip tools.",
    "Humans are one twig on the tree, not the top of a ladder. Every living species has been evolving for exactly as long as we have.",
    ["Humans appeared only about 300,000 years ago.", "You share a common ancestor with a magpie that lived around 318 million years ago.", "Your ear bones began as jaw bones in your distant cynodont cousins."]);

  T('sauropsid', 'amniote', 'Sauropsids', 'Scaly and feathery side', 'Sauropsids', 318, 'group', 'Varied', 0.3, 0.5, 'Carboniferous forests',
    "Sauropsids are the other big amniote branch. It includes lizards, snakes, turtles, crocodiles, dinosaurs, and birds.",
    "Skulls with two openings (or ancestors of that), and skin that made scales or feathers.",
    "The word 'reptile' is an everyday word. Birds are inside this branch, so if you want a tidy family tree, birds count as reptiles too.",
    ["Scales, feathers, and claws are all made of the same protein, keratin (like your fingernails).", "Birds are sauropsids, just like lizards.", "Scientists use 'reptile' loosely, because the tidy tree group includes birds."]);

  T('lepidosaur', 'sauropsid', 'Lepidosaurs', 'Lizard and snake family', 'Lepidosaurs', 250, 'group', 'Varied', 0.3, 0.1, 'Many habitats',
    "Lepidosaurs are the lizards, snakes, and the tuatara. Most have overlapping scales and shed their skin.",
    "Overlapping scales that are shed, and a sideways-opening cloaca (the all-in-one exit). Scientists use the word 'lepidosaur' for the group.",
    "Lizards and snakes are not 'older' or 'simpler' than us. They are a different branch that has kept adapting for 250 million years.",
    ["There are over 11,000 species of lizards and snakes.", "Snakes are lizards that lost their legs.", "Many lizards can drop their tail to escape a predator."]);

  T('gecko', 'lepidosaur', 'Gecko (Gekkonidae)', 'Gecko', 'Lepidosaurs', 0, 'living', 'Insects', 0.15, 0.05, 'Warm places worldwide',
    "Geckos are small lizards famous for walking up walls and ceilings.",
    "Toe pads covered in millions of tiny hairs that stick using weak forces between molecules.",
    "Climbing toe pads are a neat example of adaptation: many generations of survivors that clung better passed on better grip.",
    ["Gecko toes can hold a gecko's weight on glass.", "Most geckos can't blink: they clean their eyes with their tongue.", "There are over 1,500 gecko species."]);

  T('snake', 'lepidosaur', 'Snake (Serpentes)', 'Snake', 'Lepidosaurs', 0, 'living', 'Meat (carnivore)', 1.5, 2, 'Almost everywhere but cold poles',
    "Snakes are lizards that lost their legs over a very long time. They taste the air with their tongue.",
    "A long, flexible body with no legs and a jaw that stretches wide.",
    "Snakes show that losing something can be useful. Legless bodies slid into burrows and gaps, so those populations did well.",
    ["Some snakes, like boas, still have tiny leg bones inside.", "A snake smells by flicking its tongue to collect scent particles.", "There are about 4,000 snake species."]);

  T('tuatara', 'lepidosaur', 'Tuatara (Sphenodon)', 'Tuatara', 'Lepidosaurs', 0, 'living', 'Insects, eggs, small animals', 0.6, 1, 'Islands of New Zealand',
    "Tuataras look like lizards but are on their own tiny branch. They are the only survivors of a group that was once widespread.",
    "A different skull and teeth fused to the jaw, plus a faint 'third eye' spot on top of the head.",
    "A 'living fossil' is a misleading name: tuataras have kept evolving too. They just have few close cousins left.",
    ["Tuataras live only in New Zealand.", "They can live more than 60 years, and live slowly in cool weather.", "The third eye on top of the head can sense light but cannot see images."]);

  T('mosasaur', 'lepidosaur', 'Mosasaurs (Mosasaurus)', 'Sea giant (not a dino)', 'Lepidosaurs', 80, 'species', 'Fish, squid, other marine reptiles', 12, 5000, 'Warm shallow seas',
    "Mosasaurs were giant swimming lizards with flippers and tail fins. They are NOT dinosaurs. They are much closer to snakes and lizards.",
    "A paddle-shaped body with flippers and a long tail fin, built from a lizard body plan.",
    "Mosasaurs show how a lizard-family group evolved a sea-going body: similar needs, similar shapes.",
    ["Mosasaurs shared the ocean with sharks and giant fish.", "They went extinct in the same asteroid event that ended the other big dinosaurs.", "Their closest living relatives are monitor lizards and snakes."]);

  T('turtle', 'sauropsid', 'Turtles (Testudines)', 'Shell family', 'Turtles', 220, 'group', 'Varied', 0.8, 30, 'Water and land',
    "Turtles have a shell built from their own ribs and backbone. Scientists still argue where they fit on the tree.",
    "A shell made from the ribs and backbone grown wide and joined with bony plates.",
    "Most DNA evidence puts turtles close to archosaurs, but scientists still argue, and that's honest science: new evidence can change the tree.",
    ["Turtle fossils from ~220 million years ago, like Odontochelys, had a half-shell and teeth.", "Their shoulder blades are inside their ribs, unlike any other animal.", "Where turtles belong in the tree is still debated."]);

  T('tortoise', 'turtle', 'Tortoise (Testudinidae)', 'Tortoise', 'Turtles', 0, 'living', 'Plants', 0.3, 2, 'Land: grasslands, deserts, islands',
    "Tortoises are land-living turtles with high domed shells and stumpy elephant-like feet.",
    "A high domed shell and heavy legs for walking on land.",
    "Island tortoises show 'cousin species': each island's population changed a bit differently over time.",
    ["Some tortoises live over 150 years.", "Giant tortoises on islands can grow over 1 metre long.", "A tortoise can't leave its shell: it's part of its skeleton."]);

  T('archosaur', 'sauropsid', 'Archosaurs', "'Ruling reptiles'", 'Archosaurs', 252, 'group', 'Varied', 1.5, 15, 'Triassic lands',
    "Archosaur means 'ruling reptile'. The group includes crocodiles, pterosaurs, dinosaurs, and birds, all sharing one ancestor around 250 million years ago.",
    "An extra opening in the snout and a hole in the lower jaw, plus teeth set in sockets, and a more upright stance.",
    "Birds and crocodiles are cousins, not ancestor and descendant. They split from the same common ancestor roughly 250 million years ago.",
    ["The name archosaur was given because many of them ended up as top animals.", "The living archosaurs are crocodilians and birds.", "More than 11,000 living archosaur species are birds."]);

  T('pseudosuchian', 'archosaur', 'Pseudosuchians', 'Croc-line archosaurs', 'Archosaurs', 250, 'group', 'Varied', 3, 200, 'Triassic lands and rivers',
    "Pseudosuchians are the 'croc-line'. The Triassic was full of them: some walked upright and looked nothing like a crocodile.",
    "Ankle joints that swing in a 'crocodile-style' way.",
    "A branch that now has only crocs left was once very diverse. Extinction removes branches, it doesn't set a goal.",
    ["Some croc-line animals were fast two-legged runners.", "Others were huge land hunters.", "The living crocodilians are just a small leftover of this big branch."]);

  T('postosuchus', 'pseudosuchian', 'Postosuchus', 'Triassic land-croc', 'Archosaurs', 228, 'species', 'Carnivore', 4.5, 300, 'Triassic woodlands',
    "Postosuchus was a big meat-eating croc-line archosaur that walked on land. Before dinosaurs got big, animals like this were top hunters.",
    "Long legs held more underneath the body, making a land hunter.",
    "Postosuchus ruled before dinosaurs did. Who is 'on top' changes over time as the world changes.",
    ["Postosuchus is called a 'rauisuchian', but scientists still argue how this group is arranged.", "It is not a dinosaur.", "It lived in what is now North America."]);

  T('crocodylomorph', 'pseudosuchian', 'Crocodylomorphs', 'Croc relatives', 'Archosaurs', 230, 'group', 'Varied', 1.5, 20, 'Land and water',
    "The earliest crocodylomorphs were small, long-legged land runners. Later ones took to the water.",
    "A body line that led to the crocodile-style bones and, later, the long snout.",
    "Crocs did not stay the same for millions of years: they changed a lot, with sea-going and plant-eating forms.",
    ["Some early relatives were slim runners.", "A few ancient ones lived in the sea.", "Crocs and alligators are the 'crown' of this group."]);

  T('crocodile', 'crocodylomorph', 'Crocodile (Crocodylus)', 'Crocodile', 'Archosaurs', 0, 'living', 'Meat (carnivore)', 4.5, 500, 'Rivers, lakes, coasts',
    "Crocodiles are strong ambush hunters. They are a cousin of dinosaurs and birds, NOT an ancestor.",
    "A powerful bite and a heart with four chambers, like birds.",
    "The crocodile and magpie share a common ancestor from about 250 million years ago. They are cousins who have each changed since.",
    ["Crocodiles have a four-chambered heart, like birds.", "Mother crocodiles carry babies gently in their mouths.", "Saltwater crocodiles can reach over 5 metres, the biggest living reptiles."]);

  T('alligator', 'crocodylomorph', 'American alligator (Alligator mississippiensis)', 'Alligator', 'Archosaurs', 0, 'living', 'Meat (carnivore)', 3.5, 300, 'Swamps and slow rivers',
    "Alligators are crocodilians with a wide U-shaped snout. They build nests of plants.",
    "A wide, rounded snout, good for crushing turtles and other prey.",
    "Alligators and crocodiles are close cousins, like a magpie and a chicken are to each other: a recent split.",
    ["Alligator mothers guard their nests and babies.", "The temperature of the nest decides if eggs hatch as males or females.", "They can survive in water that gets cold."]);

  T('avemetatarsalian', 'archosaur', 'Avemetatarsalians', 'Bird-line archosaurs', 'Archosaurs', 247, 'group', 'Varied', 1, 5, 'Triassic lands',
    "The 'bird-line' branch: it includes pterosaurs, dinosaurs, and so birds. The name means 'bird foot bones'.",
    "A simple, hinge-like ankle and slender legs held under the body.",
    "The bird-line archosaurs show how a small branch can turn into a huge one: small, light, fast animals got a big start.",
    ["The name refers to the foot bones that look like a bird's.", "Many early members were small, slim runners.", "Pterosaurs and dinosaurs both come from this branch."]);

  T('pterosaur', 'avemetatarsalian', 'Pterosaurs', 'Flying reptiles (not dinos)', 'Archosaurs', 228, 'group', 'Fish, insects, small animals', 2, 20, 'Coasts and skies',
    "Pterosaurs were the first backboned animals to fly with wings. They are NOT dinosaurs, but are close cousins.",
    "A wing made of skin stretched along one hugely long finger.",
    "Pterosaurs, birds, and bats each evolved flight separately. Different bodies, same problem.",
    ["They had fuzzy coats called pycnofibres. Scientists still debate if these are related to feathers.", "Pterosaurs ranged from sparrow-size to giraffe-height.", "They died out 66 million years ago."]);

  T('quetzalcoatlus', 'pterosaur', 'Quetzalcoatlus', 'Giraffe-tall pterosaur', 'Archosaurs', 68, 'species', 'Probably small animals on land', 10, 200, 'Inland plains',
    "Quetzalcoatlus had a wingspan of around 10 metres and stood as tall as a giraffe on the ground. It may have stalked prey on land.",
    "A giant body with a long neck and a spear-like beak.",
    "One of the biggest flying animals ever shows how large size can evolve when there is room and food.",
    ["Its wingspan is an estimate, as only partial skeletons are known.", "It was named after the Aztec feathered serpent god Quetzalcoatl.", "It lived at the very end of the dinosaur age."]);

  T('dinosauromorph', 'avemetatarsalian', 'Dinosauromorphs', 'Dinosaur cousins', 'Archosaurs', 245, 'group', 'Small animals', 0.7, 2, 'Triassic lands',
    "These dinosaur cousins, like Marasuchus, were small and light. They hint at what the first dinosaurs came from.",
    "Long hind legs, and an upright stance with legs under the body.",
    "Fossils like these show the steps leading up to dinosaurs, rather than a sudden jump.",
    ["Marasuchus was about half a metre long.", "Some may have run on two legs.", "They lived alongside early dinosaurs."]);

  T('dinosaur', 'dinosauromorph', 'Dinosaurs', 'First dinosaurs', 'Dinosaurs', 243, 'group', 'Varied', 1.5, 10, 'Triassic lands',
    "The first dinosaurs were small to medium and ran on two legs. A hole in the hip socket is the big dinosaur clue.",
    "A hip socket with an open hole in it, which let the legs be held straight under the body.",
    "Early dinosaurs were not huge or rulers. They became dominant later, after other archosaurs died out in a mass extinction at the end of the Triassic.",
    ["The earliest dinosaur fossils, from about 230 to 243 million years ago, were small.", "The two big dinosaur branches are named for their hips.", "Birds are part of the dinosaur family."]);

  T('ornithischian', 'dinosaur', 'Ornithischians', "'Bird-hipped' dinosaurs", 'Dinosaurs', 230, 'group', 'Mostly plants', 2, 100, 'Forests and plains',
    "The name means 'bird-hipped'. Funny twist: birds did NOT come from this branch. Birds are 'lizard-hipped'.",
    "A hip bone that points backward, and a toothless beak at the front of the mouth.",
    "Birds ended up with bird-style hips by their own separate route. Similar-looking traits can appear more than once.",
    ["Stegosaurs, Triceratops, and duck-billed dinosaurs are in this group.", "Most ornithischians ate plants.", "Some had feather-like bristles."]);

  T('stegosaurus', 'ornithischian', 'Stegosaurus', 'Plate-back', 'Dinosaurs', 150, 'species', 'Plants', 8, 5000, 'Late Jurassic plains',
    "Stegosaurus had two rows of big plates and a spiky tail. Its brain was only about the size of a lime or a small lemon.",
    "Big back plates and a tail with spikes called the thagomizer.",
    "Plates might have been for show or controlling temperature. Scientists are still debating this.",
    ["Its tail spikes are called the thagomizer, a name born from a joke in a comic.", "T. rex lived closer to us in time than to Stegosaurus. About 82 million years separate Stegosaurus from T. rex, but only about 66 million years separate T. rex from today.", "It lived about 80 million years before T. rex."]);

  T('triceratops', 'ornithischian', 'Triceratops', 'Three-horn', 'Dinosaurs', 68, 'species', 'Plants', 8, 6000, 'Late Cretaceous forests and plains',
    "Triceratops had three horns and a bony frill. It lived at the very end of the dinosaur age, alongside T. rex.",
    "A big skull with horns and a frill, plus a strong beak.",
    "Horns can be for defence, for impressing others, or both. Scientists have good evidence for display uses.",
    ["Its frill may have helped it recognise others of its own kind.", "It had hundreds of tightly packed teeth for chewing tough plants.", "It lived in western North America."]);

  T('ankylosaurus', 'ornithischian', 'Ankylosaurus', 'Armoured tank', 'Dinosaurs', 68, 'species', 'Plants', 6.5, 6000, 'Late Cretaceous plains',
    "Ankylosaurus was covered in bony armour and had a tail club like a big hammer.",
    "Bony armour plates set in the skin and a heavy tail club.",
    "Armour and clubs fit with an arms-race idea: stronger defences can favour stronger attacks, and the reverse.",
    ["Its tail club was made of fused bone and might have broken a predator's leg.", "Even its eyelids had bone.", "It lived about 68 million years ago."]);

  T('parasaurolophus', 'ornithischian', 'Parasaurolophus', 'Trumpet-head', 'Dinosaurs', 76, 'species', 'Plants', 9.5, 2500, 'Late Cretaceous woodlands',
    "Parasaurolophus had a long hollow crest on its head. It may have worked like a horn to make low sounds.",
    "A hollow head crest with tubes inside it, probably for sounds and showing off.",
    "Showy crests and calls may help animals find mates: that can shape who has the most babies.",
    ["Computer models suggest the crest made deep, honking sounds.", "It is a 'duck-billed' dinosaur, or hadrosaur.", "It could walk on two legs or four."]);

  T('saurischian', 'dinosaur', 'Saurischians', "'Lizard-hipped' dinosaurs", 'Dinosaurs', 231, 'group', 'Varied', 2, 100, 'Triassic lands',
    "Saurischian means 'lizard-hipped'. Funny twist: BIRDS belong to this lizard-hipped group, not the 'bird-hipped' one.",
    "A hip with the pubis bone pointing forward, and a long neck and a grasping hand.",
    "Names can be confusing. Family trees are built from many traits, not just names that sound right.",
    ["Both long-necks and meat-eaters, including birds, are saurischians.", "The 'lizard-hip' is the older, more common hip shape.", "Bird hips evolved from lizard hips later."]);

  T('sauropodomorph', 'saurischian', 'Sauropodomorphs', 'Long-neck family', 'Dinosaurs', 230, 'group', 'Plants', 6, 1000, 'Forests and plains',
    "Sauropodomorphs started small and grew into the biggest land animals ever. Their trademark is a long neck and a small head.",
    "A long neck and small head, and a body that got larger and larger over time.",
    "Many descendants separately evolved big size, which fits several of the 'why so big?' ideas.",
    ["The family ranges from a turkey-size runner to a 30-metre giant.", "They swallowed plants whole, not chewing.", "They laid eggs about the size of a football."]);

  T('plateosaurus', 'sauropodomorph', 'Plateosaurus', 'Small early long-neck', 'Dinosaurs', 215, 'species', 'Plants', 8, 4000, 'Late Triassic Europe',
    "Plateosaurus was an early long-neck that was medium-size. It could probably rear up to reach leaves.",
    "A longer neck than its ancestors and the start of a bigger body.",
    "It shows a middle step on the way to the giants. Evolution works in small steps.",
    ["Over 100 Plateosaurus skeletons have been found in Europe.", "It is much smaller than later Jurassic long-necks.", "It lived about 215 million years ago."]);

  T('brachiosaurus', 'sauropodomorph', 'Brachiosaurus', 'Giraffe-dino', 'Dinosaurs', 150, 'species', 'Plants', 22, 35000, 'Late Jurassic forests',
    "Brachiosaurus had longer front legs than back legs, so its body sloped up like a giraffe. It ate treetop leaves.",
    "Front legs longer than back legs, which raised the neck to a great height.",
    "A long neck lets one animal reach lots of food without moving. Natural selection can favour that.",
    ["It may have stood around 12 metres tall.", "Masses are estimates and scientists argue about the exact numbers.", "It lived in North America."]);

  T('argentinosaurus', 'sauropodomorph', 'Argentinosaurus', 'One of the biggest ever', 'Dinosaurs', 95, 'species', 'Plants', 33, 70000, 'Cretaceous South America',
    "Argentinosaurus is one of the biggest land animals ever known. We have only some of its bones, so its exact size is an estimate.",
    "A body of truly giant size, with air-filled bones keeping it lighter than it looks.",
    "Giants like this arose from many small steps over tens of millions of years, and sauropods grew fast and laid many eggs.",
    ["Its size is estimated from partial bones, so the numbers may change.", "A single thigh bone is taller than a grown person.", "Many scientists say it was about 30 metres or longer."]);

  T('theropod', 'saurischian', 'Theropods', 'Meat-eater family', 'Dinosaurs', 231, 'group', 'Mostly meat, some plants', 3, 50, 'Everywhere',
    "Theropods walked on two legs and had hollow bones. Most were meat-eaters, and the family includes every living bird.",
    "Walking on two legs, with hollow, light bones and three main fingers on each hand.",
    "Birds are not just 'like' theropods: they are theropods, as a family is still in the family.",
    ["Theropod means 'beast foot'.", "Some theropods turned into plant-eaters.", "The smallest living theropod is the bee hummingbird."]);

  T('coelophysis', 'theropod', 'Coelophysis', 'Slim early hunter', 'Dinosaurs', 215, 'species', 'Small animals and fish', 3, 20, 'Late Triassic North America',
    "Coelophysis was a small and slim fast runner with hollow bones. Found in big groups at one site in New Mexico.",
    "Light hollow bones and a slim body, built for speed.",
    "It shows that the 'bird-style' light skeleton was already there early on.",
    ["Many skeletons were found together at Ghost Ranch.", "The old claim that it ate its own babies was a mix-up: those bones were other animals.", "Some scientists think it had simple fuzz, but this is not proven."]);

  T('allosaurus', 'theropod', 'Allosaurus', 'Jurassic hunter', 'Dinosaurs', 150, 'species', 'Carnivore', 9, 2000, 'Late Jurassic plains',
    "Allosaurus was a top predator of the Jurassic, with a big head and sharp, blade-like teeth.",
    "A large skull with blade-like teeth, and strong arms with three clawed fingers.",
    "Big hunters and big prey go together in an arms race: bigger prey, bigger predators.",
    ["Allosaurus lived 80 million years before T. rex.", "It may have hunted in a way like a hatchet, with its head.", "Its arms were longer than a T. rex's and had three big claws."]);

  T('tyrannosaur', 'theropod', 'Tyrannosaurs', 'Tyrannosaur family', 'Dinosaurs', 170, 'group', 'Meat', 4, 300, 'Northern lands',
    "The earliest tyrannosaurs were small, feathered, and fast. It was only late that they grew huge.",
    "A skull built with strong bones and big, thick teeth. Early ones had long arms; later ones had tiny ones.",
    "Tyrannosaurs show that big size evolved late, after a long time as small animals.",
    ["Early tyrannosaurs, like Dilong, had simple feathers.", "They became giants only in the last ~20 million years of the dinosaur age.", "They are close cousins of the raptors and birds."]);

  T('trex', 'tyrannosaur', 'Tyrannosaurus rex', 'T. rex', 'Dinosaurs', 68, 'species', 'Carnivore', 12, 8000, 'Late Cretaceous North America',
    "T. rex had a bite among the strongest of any land animal, and tiny but strong arms. It lived at the very end of the dinosaur age.",
    "Huge size, a very strong bite, and a great sense of smell.",
    "T. rex was alive closer to our time than Stegosaurus was to T. rex. Dinosaur time is very long.",
    ["Fossils show T. rex probably had scaly skin, at least on parts of its body. Scientists still debate how much it was feathered.", "Its teeth could be about 20 cm long, including the root.", "Young T. rex grew very fast in their teens."]);

  T('coelurosaur', 'theropod', 'Coelurosaurs', 'Feathery theropods', 'Dinosaurs', 170, 'group', 'Varied', 2, 30, 'Many habitats',
    "Coelurosaurs include tyrannosaurs, raptors, and birds. Many had fuzz or feathers.",
    "Fuzzy or feathery body coverings are widespread.",
    "Feathers appeared for warmth or display long before flight.",
    ["Feathers are found in many fossils from China.", "Feather fuzz kept animals warm.", "The group includes the ancestors of all birds."]);

  T('maniraptoran', 'coelurosaur', 'Maniraptorans', "'Hand-graspers'", 'Dinosaurs', 165, 'group', 'Varied', 1.5, 10, 'Many habitats',
    "Maniraptorans had long arms with grasping hands and wing-like feathers. Raptors and birds belong here.",
    "Long arms with big feathers, and a wrist that folds, much like a bird's wing.",
    "The wrist fold that helps a bird flap came first in earthbound hunters. Parts get re-used for new jobs.",
    ["Maniraptoran means 'hand grabber'.", "Their wrist bone could swing sideways like a wing fold.", "Some were plant-eaters, and some had wings but didn't fly."]);

  T('velociraptor', 'maniraptoran', 'Velociraptor', 'Turkey-size raptor', 'Dinosaurs', 75, 'species', 'Carnivore', 2, 15, 'Cretaceous Mongolia',
    "Velociraptor was about the size of a turkey, much smaller than in the movies, and had feathers.",
    "Feathered arms and a big sickle-shaped claw on each foot.",
    "Fossil quill knobs on its arm bone show it had feathers, a link between dinosaurs and birds.",
    ["It was much smaller than the movie version and feathered.", "It had a large sickle claw on each foot.", "It lived in what is now Mongolia."]);

  T('microraptor', 'maniraptoran', 'Microraptor', 'Four-winged glider', 'Dinosaurs', 120, 'species', 'Small animals, fish', 0.8, 1, 'Cretaceous China forests',
    "Microraptor had feathers on its arms AND legs. It could probably glide between trees. It was glossy black, as shown by fossils.",
    "Long feathers on the arms and legs, like four wings.",
    "It shows flight did not come in one go. Different experiments in flying and gliding existed.",
    ["Fossil pigment cells suggest iridescent black feathers.", "It was only the size of a crow.", "Many feathered fossils come from China."]);

  T('avialan', 'maniraptoran', 'Avialans', 'Bird line', 'Dinosaurs', 160, 'group', 'Varied', 0.5, 1, 'Forests and shores',
    "Avialans are the group of birds and their closest dinosaur relatives that had wings built for flight.",
    "Wings with long feathers and a lighter skeleton, flight-ready.",
    "The line between a 'bird' and 'non-bird dinosaur' is fuzzy. That is how evolution works: gradual change.",
    ["The line is blurry, and scientists still argue on where exactly 'bird' starts.", "Avialans had teeth and long tails at first.", "They lived with other feathered dinosaurs."]);

  T('archaeopteryx', 'avialan', 'Archaeopteryx', 'Famous first-bird fossil', 'Dinosaurs', 150, 'species', 'Insects and small animals', 0.5, 1, 'Late Jurassic islands of Europe',
    "Archaeopteryx had wings with feathers, but also teeth, claws on its wings, and a long bony tail. A famous in-between fossil.",
    "Wing feathers like a modern bird's, with a dinosaur's teeth, claws, and bony tail.",
    "Found in 1861, just two years after Darwin's big book, it was exactly the sort of fossil that evolution predicted.",
    ["It was found in Germany in limestone.", "Scientists still debate how well it flew.", "Newer fossils show it is one of many feathered dinosaurs."]);

  T('neornithine', 'avialan', 'Neornithines', 'Modern-type birds', 'Dinosaurs', 100, 'group', 'Varied', 0.3, 0.5, 'Everywhere',
    "Neornithines are the birds alive now: they have a beak and no teeth, and a short tail.",
    "A toothless beak and a short tail (the pygostyle, a stub of fused bones).",
    "Only the lucky bird lineages survived the asteroid 66 million years ago. Beaks may have helped them eat seeds in hard times.",
    ["The 'seeds after the asteroid' idea is a likely explanation but still debated.", "All living birds come from this group.", "Today there are about 11,000 species."]);

  T('ostrich', 'neornithine', 'Ostrich (Struthio camelus)', 'Ostrich', 'Dinosaurs', 0, 'living', 'Plants, seeds, bugs', 2.3, 120, 'African savannas',
    "The ostrich is the biggest living bird. It can't fly but can run faster than a horse over long distances.",
    "Long, strong legs with only two toes, built for running.",
    "Losing flight can be a good deal when it lets a bird grow big and fast. Evolution isn't about 'better' or 'worse'.",
    ["Ostriches can run about 70 km/h.", "An ostrich egg is the biggest egg of any living bird.", "Ostriches are theropod dinosaurs, like T. rex."]);

  T('chicken', 'neornithine', 'Chicken (Gallus gallus domesticus)', 'Chicken', 'Dinosaurs', 0, 'living', 'Seeds, bugs, plants', 0.5, 2.5, 'Farms everywhere',
    "Chickens come from jungle fowl in southeast Asia. People have bred them for thousands of years. A chicken is a living dinosaur.",
    "A strong beak, and scratching feet.",
    "Selective breeding (people choosing which chickens have chicks) shows how traits can change over generations.",
    ["There are more chickens than any other bird, more than 25 billion at any one time.", "Scientists found that chickens can grow teeth-like structures by tweaking genes in the lab, an echo of their toothed ancestors.", "Chicken legs and scaly feet show their dinosaur heritage."]);

  T('penguin', 'neornithine', 'Emperor penguin (Aptenodytes forsteri)', 'Penguin', 'Dinosaurs', 0, 'living', 'Fish, squid, krill', 1.1, 30, 'Antarctic ice and seas',
    "Penguins are birds that gave up flying in the air and fly through water instead. They use their wings as flippers.",
    "Flipper-like wings, thick feathers, and dense bones for diving.",
    "Same animals, different job: wings that were once for air flight became flippers. A trait can be re-used.",
    ["Emperor penguins can dive deeper than 500 metres.", "Dad emperors keep the egg warm on their feet.", "Penguins are dinosaurs that swim."]);

  T('hummingbird', 'neornithine', 'Hummingbird (Trochilidae)', 'Hummingbird', 'Dinosaurs', 0, 'living', 'Nectar and tiny insects', 0.1, 0.005, 'The Americas',
    "Hummingbirds are tiny and can hover. The bee hummingbird weighs about 2 grams, the smallest dinosaur alive.",
    "Wings that rotate so it can hover, and a long beak and tongue for nectar.",
    "Flowers and hummingbirds changed together over many generations: flowers shaped by birds, and birds shaped by flowers.",
    ["Their wings can beat dozens of times per second.", "They are the only birds that can fly backwards.", "Their hearts can beat over 1,000 times a minute."]);

  T('passerine', 'neornithine', 'Passerines', 'Perching and song birds', 'Dinosaurs', 60, 'group', 'Varied', 0.2, 0.05, 'Everywhere',
    "More than half of all bird species are passerines. They have feet built for gripping a branch.",
    "Three toes pointing forward and one back, for a strong perch, and complex songs.",
    "A new way to perch and sing opened doors to many niches. It resulted in thousands of species.",
    ["Over 6,000 species, more than half of all birds.", "They include sparrows, crows, robins, and magpies.", "Many learn their songs from their parents."]);

  T('magpie', 'passerine', 'Eurasian magpie (Pica pica)', 'Magpie', 'Dinosaurs', 0, 'living', 'Insects, seeds, scraps, eggs', 0.45, 0.22, 'Woods, parks, towns in Europe and Asia',
    "The magpie is a clever black-and-white bird, and also a living theropod dinosaur, like T. rex and Velociraptor.",
    "A very large brain for a bird, and glossy feathers that shimmer blue-green.",
    "A magpie shares a recent ancestor with other birds, a more distant one with Velociraptor, and a far-off one with crocodiles.",
    ["Magpies can recognise themselves in a mirror, which only a few animals do.", "Their feathers' blue-green shimmer comes from tiny structures, not colour paint.", "They are theropod dinosaurs, in the same family as T. rex."]);

  /* colour by branch */
  var BRANCH_COLORS = { synapsid: '#e76f51', lepidosaur: '#6a994e', turtle: '#2a9d8f', pseudosuchian: '#3d7a4a',
    pterosaur: '#8e6bbf', ornithischian: '#e9a23b', sauropodomorph: '#4a90d9', tyrannosaur: '#c0392b', theropod: '#d64550',
    avialan: '#e86aa0', saurischian: '#4a90d9', dinosaur: '#d9a441', dinosauromorph: '#9a8c6a', avemetatarsalian: '#8e6bbf',
    archosaur: '#2f8f83', sauropsid: '#7b8794', amniote: '#7b8794' };

  DATA.taxa = RAW;
  var INDEX = {};
  RAW.forEach(function (t) { INDEX[t.id] = t; });
  DATA.taxa.forEach(function (t) {
    var p = [], n = t;
    while (n) { p.unshift(n.id); n = n.parent ? INDEX[n.parent] : null; }
    var order = ['avialan', 'tyrannosaur', 'theropod', 'sauropodomorph', 'saurischian', 'ornithischian', 'dinosaur', 'pterosaur',
      'avemetatarsalian', 'pseudosuchian', 'archosaur', 'turtle', 'lepidosaur', 'synapsid', 'sauropsid', 'amniote'];
    var c = '#7b8794';
    for (var i = 0; i < order.length; i++) { if (p.indexOf(order[i]) >= 0) { c = BRANCH_COLORS[order[i]]; break; } }
    t.color = c;
  });

  /* ---------------- helpers ---------------- */
  DATA.byId = function (id) { return INDEX[id] || null; };
  DATA.children = function (id) { return RAW.filter(function (t) { return t.parent === id; }); };
  DATA.pathTo = function (id) {
    var out = [], n = INDEX[id];
    while (n) { out.unshift(n); n = n.parent ? INDEX[n.parent] : null; }
    return out;
  };
  DATA.lca = function (a, b) {
    var pa = DATA.pathTo(a), pb = DATA.pathTo(b), last = null;
    for (var i = 0; i < pa.length && i < pb.length; i++) {
      if (pa[i].id === pb[i].id) last = pa[i]; else break;
    }
    return last;
  };
  DATA.mrcaStory = function (a, b) {
    var A = INDEX[a], B = INDEX[b];
    if (!A || !B) return '';
    if (a === b) return 'That is the same animal! Pick a different one to compare.';
    var L = DATA.lca(a, b);
    if (!L) return '';
    var when = L.mya ? 'about ' + L.mya + ' million years ago' : 'long ago';
    if (L.id === a || L.id === b) {
      var anc = (L.id === a) ? A : B, other = (L.id === a) ? B : A;
      return anc.nickname + ' belongs to the group that ' + other.nickname + ' is a part of. The group first showed up ' + when + '.';
    }
    return A.nickname + ' and ' + B.nickname + ' are cousins. They share a common ancestor, the ' +
      L.nickname.toLowerCase() + ' (' + L.name + '), who lived ' + when +
      ". That's like sharing a grandparent, only with millions of years in between. (Dates are approximate.)";
  };

  /* ---------------- animals (living) ---------------- */
  DATA.animals = [
    { id: 'magpie', headline: 'A magpie is a dinosaur!',
      proof: ['Hollow bones, a wishbone, and three main fingers in the hand, just like theropods such as Velociraptor.', 'Fossils like Archaeopteryx and Microraptor have feathers, wings, and teeth, filling in the steps between.', 'Birds lay eggs, build nests, and some fossil dinosaurs were found sitting on nests, brooding like birds.'],
      cousinNote: 'Crocodiles are cousins: they share an ancestor with magpies from about 250 million years ago.',
      funFact: 'Magpies can pass the mirror test, noticing a mark on their own body.' },
    { id: 'chicken', headline: 'A chicken is a living dinosaur!',
      proof: ['Chickens have scaly legs, a feature shared with dinosaurs.', 'Chicken embryos can grow tooth-like structures when scientists tweak genes: a hint of ancient genes.', 'Their skeleton matches small theropods bone by bone.'],
      cousinNote: 'Closest cousin: other birds. A little farther: ostrich. Much farther: crocodiles.',
      funFact: 'Chickens are one of the most numerous birds on Earth.' },
    { id: 'ostrich', headline: 'An ostrich is a giant running dinosaur!',
      proof: ['Strong legs and two toes, like fast-running theropods.', "It's a theropod dinosaur, in the same big family as T. rex.", 'Its eggs, nest, and growth are bird-style, like fossil dinosaurs.'],
      cousinNote: 'Ostriches split from other living birds very early in the line.',
      funFact: 'An ostrich eye is bigger than its brain, per body part, one of the largest eyes of any land animal.' },
    { id: 'penguin', headline: 'A penguin is a dinosaur that swims!',
      proof: ['A bird skeleton, just with flipper wings.', 'Penguin fossils over 60 million years old show their ancestors were flying birds.', 'They still lay eggs and have feathers.'],
      cousinNote: 'Mosasaurs swam too, but they are lizard relatives, not dinosaurs.',
      funFact: 'A giant penguin fossil from about 37 million years ago stood about as tall as a person.' },
    { id: 'hummingbird', headline: 'A hummingbird is the tiniest living dinosaur!',
      proof: ['A dinosaur family skeleton: hollow bones, a wishbone, feathers.', 'It still has three-fingered hand bones inside its wing.', 'Its feathers, like those of fossil dinosaurs, shimmer from tiny structures.'],
      cousinNote: 'Hummingbirds are cousins to all other birds, near swifts.',
      funFact: 'The bee hummingbird weighs about 2 grams, lighter than a coin.' },
    { id: 'crocodile', headline: 'A crocodile is a cousin of dinosaurs, not an ancestor!',
      proof: ['Crocs and birds share an archosaur ancestor from about 250 million years ago.', 'Both have a four-chambered heart and teeth (or ancestral teeth) in sockets.', 'Crocs lay eggs and guard nests, like birds.'],
      cousinNote: 'Crocs are the closest living relatives of birds. That does NOT mean they are dinosaurs.',
      funFact: "Some crocodiles can 'gallop' on land." },
    { id: 'alligator', headline: 'An alligator is a croc-line archosaur!',
      proof: ['Same archosaur family as crocs and birds.', 'It builds a nest and guards it, like many birds.', 'Its bones and skull have the archosaur holes.'],
      cousinNote: 'Alligators and crocs split from each other roughly 80+ million years ago (a very rough date).',
      funFact: 'Nest temperature decides if baby alligators are male or female.' },
    { id: 'gecko', headline: 'A gecko is a lizard: on the scaly side!',
      proof: ['A lepidosaur, with shed skin and scales.', 'Lizards and archosaurs split about 270+ million years ago.', 'Gecko toe-pads are a cool adaptation.'],
      cousinNote: "Geckos are on the lizard-snake branch, far from birds in the family tree.",
      funFact: 'Geckos can hang from a ceiling with one toe.' },
    { id: 'snake', headline: 'A snake is a lizard that lost its legs!',
      proof: ['Snake skeletons descend from lizard ancestors.', 'Some snakes have tiny leftover hip bones.', 'Fossil snakes with tiny legs have been found.'],
      cousinNote: 'Snakes and geckos are both lizard-branch cousins. Snakes are a branch within the lizards.',
      funFact: 'A snake can unhinge nothing: its jaw bones are just loosely joined, so it stretches wide.' },
    { id: 'tortoise', headline: 'A tortoise wears its ribs on the outside!',
      proof: ['The shell is made of ribs and backbone.', 'Fossil turtles show the shell forming step by step.', 'DNA hints turtles are close to archosaurs, but scientists still argue.'],
      cousinNote: "Where turtles belong in the tree is still debated.",
      funFact: 'Some tortoises live longer than 150 years.' },
    { id: 'cat', headline: 'A cat is on the mammal side, a far cousin!',
      proof: ['Fur and milk: both mammal traits.', 'Cats share an ancestor with birds over 300 million years ago.', 'Ear bones came from old jaw bones.'],
      cousinNote: 'Cats are far cousins of every reptile and bird.',
      funFact: 'Cats have a very flexible spine, with extra-springy backbones.' },
    { id: 'human', headline: 'You are on the mammal side, too!',
      proof: ['You have fur (hair), milk-making ancestors, and middle-ear bones.', 'You share an ancestor with every bird, lizard, and croc.', 'Your DNA is very similar to other mammals.'],
      cousinNote: 'Humans, dogs, and cats are all mammals. We are cousins to Dimetrodon-side animals, too.',
      funFact: 'The same old ancestor that gave you a backbone also gave one to a magpie.' },
    { id: 'tuatara', headline: 'A tuatara is NOT a lizard, but is lizard-family!',
      proof: ['Its skull is different from lizards.', 'It has teeth fused to the jaw.', 'It lives only in New Zealand.'],
      cousinNote: 'Tuatara and lizards are sister groups in the lepidosaur branch.',
      funFact: 'Tuataras can breathe very slowly, only once an hour when cold.' }
  ];

  /* ---------------- reptile types ---------------- */
  DATA.reptileCompareRows = [
    { key: 'examples', label: 'Examples' }, { key: 'legs', label: 'Legs' }, { key: 'skin', label: 'Skin / covering' },
    { key: 'eggs', label: 'Eggs' }, { key: 'bloodType', label: 'Body heat' }, { key: 'heartOrSkullNote', label: 'Heart or skull' },
    { key: 'hips', label: 'Hips' }, { key: 'keyFact', label: 'Key fact' }, { key: 'notDino', label: 'Dinosaur?' }
  ];
  DATA.reptileTypes = [
    { id: 'lizards-snakes', name: 'Lizards and snakes', emoji: '🦎', examples: ['gecko', 'iguana', 'snake'], legs: 'Four legs, or none in snakes', skin: 'Overlapping scales, shed in pieces or whole', eggs: 'Leathery eggs, some give live birth', bloodType: 'Ectotherm (gets heat from outside)', heartOrSkullNote: 'Three-chambered heart; skull with loose jaw joints.', keyFact: 'Snakes are lizards that lost their legs.', notDino: true, taxonId: 'lepidosaur', artId: 'gecko', oneLine: 'Scaly, many species, and not dinosaurs.' },
    { id: 'turtles', name: 'Turtles and tortoises', emoji: '🐢', examples: ['tortoise', 'sea turtle'], legs: 'Four legs or flippers', skin: 'Scales plus a shell', eggs: 'Hard or leathery eggs buried in sand or soil', bloodType: 'Ectotherm', heartOrSkullNote: 'Skull has no holes behind the eye. Their exact place on the tree is still argued.', keyFact: 'The shell is part of the skeleton: ribs and backbone.', notDino: true, taxonId: 'turtle', artId: 'tortoise', oneLine: 'Shell family, placement still debated.' },
    { id: 'crocodilians', name: 'Crocodilians', emoji: '🐊', examples: ['crocodile', 'alligator', 'gharial'], legs: 'Four short legs', skin: 'Thick bony scales', eggs: 'Hard-ish eggs in a nest', bloodType: 'Ectotherm', heartOrSkullNote: 'Four-chambered heart and archosaur skull holes.', hips: 'Own hip shape', keyFact: 'They are bird cousins, closer to birds than to lizards.', notDino: true, taxonId: 'crocodylomorph', artId: 'crocodile', oneLine: 'Archosaur cousins of dinosaurs and birds.' },
    { id: 'dinosaurs', name: 'Dinosaurs (non-bird)', emoji: '🦖', examples: ['T. rex', 'Triceratops', 'Argentinosaurus'], legs: 'Held straight under the body', skin: 'Scales, feathers, or both', eggs: 'Hard-shelled eggs, often in nests', bloodType: 'Debated; many likely had fast metabolisms', heartOrSkullNote: 'Open hip socket and archosaur skull holes.', hips: 'Bird-hipped or lizard-hipped', keyFact: 'Non-bird dinosaurs died out ~66 million years ago.', notDino: false, taxonId: 'dinosaur', artId: 'trex', oneLine: 'The upright-legged archosaurs.' },
    { id: 'birds', name: 'Birds', emoji: '🐦', examples: ['magpie', 'ostrich', 'penguin'], legs: 'Two legs, feathered wings', skin: 'Feathers, scaly legs', eggs: 'Hard-shelled eggs in nests', bloodType: 'Endotherm (warm-blooded)', heartOrSkullNote: 'Four-chambered heart, beak, and air-sac lungs.', hips: 'Bird-style hips, but they come from the lizard-hip branch', keyFact: 'Birds ARE dinosaurs: avian dinosaurs.', notDino: false, taxonId: 'neornithine', artId: 'magpie', oneLine: 'The living dinosaurs.' },
    { id: 'pterosaurs', name: 'Pterosaurs', emoji: '🪽', examples: ['Quetzalcoatlus', 'Pteranodon'], legs: 'Four limbs, front ones are wings', skin: 'Skin wings and fuzz', eggs: 'Soft-shelled eggs, we think', bloodType: 'Probably warm-blooded', heartOrSkullNote: 'Archosaur skull; hollow bones.', keyFact: 'Flying reptiles, close cousins of dinosaurs but not dinosaurs.', notDino: true, taxonId: 'pterosaur', artId: 'quetzalcoatlus', oneLine: 'Flying cousins of the dinosaurs.' },
    { id: 'marine', name: 'Marine reptiles', emoji: '🌊', examples: ['Mosasaurus', 'Plesiosaur', 'Ichthyosaur'], legs: 'Flippers', skin: 'Smooth skin, scaly', eggs: 'Some gave live birth (ichthyosaurs did)', bloodType: 'Unsure; some may have been warm-blooded', heartOrSkullNote: 'Different groups; not one family.', keyFact: 'Mosasaurs are lizard relatives. Plesiosaurs and ichthyosaurs are other groups. None are dinosaurs.', notDino: true, taxonId: 'mosasaur', artId: 'mosasaur', oneLine: 'Sea-going reptiles, not dinosaurs.' },
    { id: 'synapsids', name: 'Synapsids (Dimetrodon)', emoji: '⛵', examples: ['Dimetrodon', 'cynodonts', 'mammals'], legs: 'Four legs', skin: 'Scaly or furry, depends on the animal', eggs: 'Egg-layers (early), live-birth in most mammals', bloodType: 'Moving toward warm-blooded', heartOrSkullNote: 'One skull opening behind the eye.', keyFact: 'On the mammal side of the tree, not reptiles and not dinosaurs.', notDino: true, taxonId: 'dimetrodon', artId: 'dimetrodon', oneLine: 'Mammal-side cousins.' },
    { id: 'tuatara', name: 'Tuatara', emoji: '🦖', examples: ['Sphenodon'], legs: 'Four legs', skin: 'Scaly with a spiny crest', eggs: 'Soft eggs buried for over a year', bloodType: 'Ectotherm, active in cool weather', heartOrSkullNote: 'Differs from lizards in its skull and teeth.', keyFact: 'Lives only in New Zealand and is the last of its branch.', notDino: true, taxonId: 'tuatara', artId: 'tuatara', oneLine: 'Not a lizard, but lizard-family.' }
  ];

  /* ---------------- explainers ---------------- */
  DATA.archosaurFeatures = [
    { id: 'name', title: "What does 'archosaur' mean?", text: "It means 'ruling reptile'. The group includes crocodiles, pterosaurs, dinosaurs, and birds. It's a tidy family, and every member comes from one common ancestor from about 250 million years ago." },
    { id: 'skull', title: 'Extra skull holes', text: 'Archosaurs have an extra opening in front of the eye (called the antorbital fenestra) and one in the lower jaw. They made the skull lighter and gave muscles room.' },
    { id: 'legs', title: 'Legs under the body', text: 'Many archosaurs held their legs more directly below their bodies, rather than sprawling out like a lizard. This is better for running and for carrying weight.' },
    { id: 'teeth', title: 'Teeth in sockets', text: 'Archosaur teeth sit in deep sockets in the jaw, rather than being fused on. It makes them strong and easy to replace.' },
    { id: 'cousins', title: 'Cousins, not parents', text: 'Crocodiles and birds are archosaur cousins. Neither came from the other. They each kept changing for 250 million years.' }
  ];
  DATA.hipTypes = [
    { id: 'saurischian', name: "Lizard-hipped (saurischian)", text: "The pubis bone points forward. Long-necks and meat-eaters had it, and so do BIRDS, since birds are theropods.", examples: ['T. rex', 'Brachiosaurus', 'magpie'] },
    { id: 'ornithischian', name: "Bird-hipped (ornithischian)", text: "The pubis bone points backward, parallel to the sit bone. Funny twist: birds did NOT come from this group. They ended up with similar-looking hips by their own route.", examples: ['Stegosaurus', 'Triceratops', 'Parasaurolophus'] },
    { id: 'open-socket', name: 'The open hip socket', text: 'In dinosaurs, there is a hole through the hip socket, so the leg bone can sit straight underneath. It is the classic clue that a fossil is a dinosaur.', examples: ['all dinosaurs'] }
  ];

  /* ---------------- giant theories ---------------- */
  DATA.giantTheories = [
    { id: 'oxygen-plants', emoji: '🌿', title: 'Lots of food: warm climate and lots of plants',
      oneLiner: 'A warm, green world gave plant-eaters plenty to eat.',
      explanation: 'During much of the Jurassic and Cretaceous, the climate was warm and plants grew well. More food can support bigger animals.',
      evolutionLesson: 'If big individuals in a population could eat more, survive droughts, and escape predators, they had more babies. Over many generations the average size crept upward.',
      evidence: ['Fossil plants show lush, warm forests.', 'Giant sauropods lived where plants were plentiful.', 'Size rose and fell over time with climate changes.'],
      confidence: 'likely', counter: 'Giant mammals also lived in cooler times, and more food alone does not explain why dinosaurs got bigger than mammals.' },
    { id: 'air-sacs', emoji: '🫁', title: 'Bird-style breathing: air sacs',
      oneLiner: 'Air sacs gave dinosaurs a more efficient way to breathe.',
      explanation: 'Bird lungs have air sacs that push air one way through the lungs, so more oxygen gets absorbed. Fossil bones with air holes suggest sauropods and theropods had them.',
      evolutionLesson: 'A small change in breathing could help animals survive low-oxygen times. Those with better breathing left more offspring, and later descendants could grow bigger.',
      evidence: ['Air pockets in vertebrae of sauropods and theropods.', 'Living birds, the dinosaur survivors, have these air sacs.', 'The system also lightened the body.'],
      confidence: 'likely', counter: 'Soft tissue does not fossilise, so the lungs are inferred from the bones. Some scientists question how much it mattered for size.' },
    { id: 'hollow-bones', emoji: '🦴', title: 'Hollow, light bones',
      oneLiner: 'Air-filled bones made a giant body lighter.',
      explanation: 'Sauropod bones had air spaces, so a huge skeleton weighed much less than a solid one would.',
      evolutionLesson: 'Light but strong bones helped bigger individuals move, so lighter-boned lines did better and the size limit moved up.',
      evidence: ['Hollow spaces in the vertebrae of sauropods.', 'Bird bones are hollow too.', 'Computer models show weight savings.'],
      confidence: 'strong', counter: 'Hollow bones help, but they are not the only reason: other big animals did not have them.' },
    { id: 'many-eggs', emoji: '🥚', title: 'Many small eggs, no baby carrying',
      oneLiner: 'Laying eggs let mothers have lots of babies without carrying them.',
      explanation: 'An elephant mother carries one huge baby for 22 months. A sauropod laid many eggs, so size was not limited by pregnancy, and she could replace losses fast.',
      evolutionLesson: 'Lines that made more young survived losses better, so big bodies could last through tough times.',
      evidence: ['Sauropod nesting sites with many eggs.', 'Egg size is limited by shell, so babies started small.', 'Birds lay eggs today and are many.'],
      confidence: 'likely', counter: 'Many small animals also lay many eggs and stay small, so eggs are a helper, not the full answer.' },
    { id: 'fast-growth', emoji: '📈', title: 'Fast growth',
      oneLiner: 'Dinosaur babies grew very fast.',
      explanation: 'Growth rings in bones show many dinosaurs grew quickly, reaching big size in decades instead of centuries.',
      evolutionLesson: 'Young that grew faster spent less time small and easy to eat, so fast growers left more offspring.',
      evidence: ['Growth rings (lines in bones, like tree rings).', 'Young T. rex gained a lot of weight per year in the teen years.', 'Bone tissue structure of fast growers.'],
      confidence: 'strong', counter: 'Speed varied between species, and dating from bone rings has some error.' },
    { id: 'arms-race', emoji: '⚔️', title: "Arms race: big hunters and big prey (Cope's rule)",
      oneLiner: 'Bigger prey pushed for bigger predators, and the reverse.',
      explanation: "Cope's rule is the observation that animal lines often grow bigger over time. A big body is safe from most predators, and predators grew to catch big prey.",
      evolutionLesson: 'If larger prey survived better, the population got bigger. Then only larger predators could catch them, and so on. Nobody was trying: the survivors just passed on their genes.',
      evidence: ['Large predators lived with large prey.', 'Armoured dinosaurs and large-clubbed tails.', 'Size increases seen across several dinosaur groups.'],
      confidence: 'debated', counter: "Not every line grew bigger, and some lines got smaller. 'Cope's rule' has plenty of exceptions." },
    { id: 'long-neck', emoji: '🦒', title: 'Long necks for treetop food',
      oneLiner: 'A long neck reached high leaves and swept a wide area.',
      explanation: 'A long neck lets an animal eat a big area without moving its heavy body, saving energy.',
      evolutionLesson: 'In a population with different neck lengths, longer-necked ones got more food in hard times, had more babies, and passed on neck traits. Over generations, necks got longer.',
      evidence: ['Sauropod neck bones were light and air-filled.', 'Different sauropods ate at different heights.', 'Computer models suggest sweeping saves energy.'],
      confidence: 'likely', counter: 'Some scientists think necks also helped with showing off, and some say the neck was held low.' },
    { id: 'heat', emoji: '🔥', title: 'Gigantothermy: big bodies stay warm',
      oneLiner: 'A big body loses heat slowly, so temperature stays steady.',
      explanation: 'Big animals have less surface for their size, so they keep heat. This helps if you are warm in the day and cool at night.',
      evolutionLesson: 'Bigger individuals kept steady temperatures with less food energy, which could help them live and have young.',
      evidence: ['Models of heat loss by body size.', 'Large crocs and turtles show this today.', 'Bone studies suggest many were warm.'],
      confidence: 'debated', counter: 'Dinosaur body heat is still researched. Big size may be a result rather than a cause.' },
    { id: 'empty-world', emoji: '🌍', title: 'Few competitors, and why islands make dwarfs',
      oneLiner: 'After mass extinctions there is room to grow, and on small islands, animals can shrink.',
      explanation: 'After a mass extinction, survivors face fewer competitors. On islands with little food, smaller bodies are better. Fossils show dwarf dinosaurs like Europasaurus, a small sauropod from an island.',
      evolutionLesson: 'Size is not one-way. Where food is short, smaller individuals survive better, so the average size drops. Evolution follows what works in a place, with no goal.',
      evidence: ['Europasaurus: a dwarf sauropod from a Jurassic island in Europe.', 'Dwarf elephants and mammoths on islands.', 'Big groups bloom after mass extinctions.'],
      confidence: 'strong', counter: 'Island dwarfing is well documented, but not all small islands gave small animals.' }
  ];

  /* ---------------- evolution concepts ---------------- */
  DATA.evolutionConcepts = [
    { id: 'variation', emoji: '🎨', title: 'Variation: everyone is a little different',
      kidExplain: "No two birds are the same. Some beaks are thick, some are thin. That is called variation.",
      example: { setup: "A flock of birds lives on an island.",
        steps: ["Some beaks are thin.", "Some are thick.", "Nobody chose this. Genes made them different."],
        punchline: "Without differences, nature has nothing to pick from." },
      misconception: "Wrong idea: \"everyone in a species is the same.\" They are all a bit different.",
      tryItNote: "In Seed Beaks, look at the bars at the start. That is variation." },
    { id: 'inheritance', emoji: '🧬', title: 'Inheritance: kids resemble parents',
      kidExplain: "Parents pass on genes. Thick-beaked parents usually have thick-beaked chicks.",
      example: { setup: "Two thick-beaked birds have chicks.",
        steps: ["Chicks get genes from both parents.", "Their beaks are a lot like their parents'.", "A few are a little different."],
        punchline: "Helpful traits get passed on." },
      misconception: "Wrong idea: \"things an animal learns go into its genes.\" Gym muscles are not inherited.",
      tryItNote: "In the sims, chicks copy their parents with a tiny wobble." },
    { id: 'selection', emoji: '🌰', title: 'Natural selection: the seed-eating birds, step by step',
      kidExplain: "Animals that fit their home best survive and have more babies. This is natural selection.",
      example: { setup: "Birds eat seeds. Some seeds are soft. Some are very hard.",
        steps: ["1. Normal year: lots of soft seeds. Every beak works.", "2. Drought! Only hard seeds are left.", "3. Thin beaks cannot crack them. Those birds go hungry.", "4. Thick beaks can. Those birds survive and have chicks.", "5. Chicks get thick beaks too. The flock now has thicker beaks."],
        punchline: "No bird chose a thicker beak. The flock changed because thick beaks worked better." },
      misconception: "Wrong idea: \"the birds tried to grow thicker beaks.\" Birds never change their beaks. The flock changes.",
      tryItNote: "Try Seed Beaks: pick Drought and press Next generation." },
    { id: 'time', emoji: '⏳', title: 'Time: many generations',
      kidExplain: "One generation changes a tiny bit. Millions of generations add up to a lot.",
      example: { setup: "A beak gets a tiny bit thicker each generation.",
        steps: ["After 1 generation: you cannot tell.", "After 30 generations: clearly thicker.", "After a million: a whole new bird!"],
        punchline: "Tiny steps plus lots of time make big changes." },
      misconception: "Wrong idea: \"evolution happens in one lifetime.\" It usually takes many, many generations.",
      tryItNote: "Press +30 in the sims to fast-forward time." },
    { id: 'adaptation', emoji: '🧤', title: 'Adaptation: a trait that fits',
      kidExplain: "An adaptation is a trait that helps an animal live where it lives.",
      example: { setup: "A gecko can climb glass.",
        steps: ["Long ago, some geckos had grippier toes.", "They fell less and had more babies.", "Over time, toes got better and better."],
        punchline: "An adaptation fits one place and time. It is not good forever." },
      misconception: "Wrong idea: \"animals change on purpose when they need to.\" There is no plan.",
      tryItNote: "In Camo Critters, colours slowly match the background." },
    { id: 'common-ancestor', emoji: '🌳', title: 'Common ancestors: it is a family tree',
      kidExplain: "All living things are related. You and a magpie share a great-great-...-grandparent.",
      example: { setup: "Take a magpie and a crocodile.",
        steps: ["Trace the magpie back.", "Trace the crocodile back.", "About 250 million years ago, the lines meet at one archosaur."],
        punchline: "Where two lines meet is their common ancestor." },
      misconception: "Wrong idea: \"humans came from monkeys.\" We share ancestors with them.",
      tryItNote: "Use the Cousin tool in Lineage to find any common ancestor." },
    { id: 'cousins', emoji: '🤝', title: 'Cousins, not ancestors',
      kidExplain: 'Your cousin is not your parent. In the same way, crocodiles are not the ancestors of birds. They are cousins who split from a shared ancestor.',
      example: { setup: 'Think of two cousins who share grandparents.',
        steps: ['The grandparents had two children, who each had families.', 'The two cousins share grandparents but are not each other\'s parents.', 'Same with crocodiles and birds: the shared "grandparent" was an archosaur from about 250 million years ago.'],
        punchline: 'Living animals are the ends of long branches. None of them is an ancestor of the others.' },
      misconception: 'Wrong idea: "a crocodile is a stage on the way to a bird." Both have changed for 250 million years.',
      tryItNote: 'Open the family tree view and spot who is a cousin and who is an ancestor.' },
    { id: 'extinction', emoji: '☄️', title: 'Extinction and mass extinctions',
      kidExplain: "Extinction is when the last one of a kind dies. Most kinds that ever lived are gone.",
      example: { setup: "66 million years ago, an asteroid hit Earth.",
        steps: ["Dust hid the sun and plants struggled.", "Big animals that needed lots of food had a hard time.", "Some small animals survived, including birds, mammals and crocs.", "Survivors spread into the empty spaces."],
        punchline: "Mass extinctions make room for new animals." },
      misconception: "Wrong idea: \"dinosaurs were too dumb to survive.\" They did great for 170 million years, and birds are still here.",
      tryItNote: "On the Earth timeline, find the big extinctions." },
    { id: 'no-goal', emoji: '🚫', title: 'No goal, no ladder',
      kidExplain: "Evolution has no goal. No animal is \"more advanced\". Each one fits its own home.",
      example: { setup: "Is a human more evolved than a crocodile?",
        steps: ["Both evolved for the same amount of time.", "Crocs fit rivers. We fit our lives.", "Neither is a step to the other."],
        punchline: "Think of a bush with many branches, not a ladder." },
      misconception: "Wrong idea: \"evolution makes things better and better.\" It makes things fit. When homes change, so do the winners.",
      tryItNote: "In Seed Beaks, flip wet and dry. The winner flips too." },
    { id: 'mutation', emoji: '✨', title: 'DNA mutations: new variation',
      kidExplain: "When DNA is copied, tiny mistakes happen. These are mutations. Most do nothing. A few help.",
      example: { setup: "One chick has a mutation. Its beak is a bit thicker.",
        steps: ["It is born with a thicker beak.", "In a drought it can crack hard seeds.", "It passes the change on to its chicks."],
        punchline: "Mutations make new variety. Selection picks the winners." },
      misconception: "Wrong idea: \"animals mutate because they need to.\" Mutations are random.",
      tryItNote: "In Family Tree Maker, random changes pile up and groups drift apart." }
  ];

  /* ---------------- timeline ---------------- */
  DATA.timelineEvents = [
    { mya: 4540, title: 'Earth forms', text: 'A ball of hot rock forms around a young Sun. For a long time it is far too hot for life as we know it.' },
    { mya: 4000, title: 'LUCA lives', text: 'The last common ancestor of all living things lives, as far as we can tell from DNA. Every animal, plant, fungus and microbe alive today descends from it.', taxonId: 'luca' },
    { mya: 3500, title: 'Stromatolites', text: 'Microbes build layered mounds. These are among the oldest fossils we have.', taxonId: 'microbial-mat' },
    { mya: 2400, title: 'The Great Oxidation', text: 'Cyanobacteria have been making oxygen for a long time. Now it builds up in the air and changes the whole planet.' },
    { mya: 700, title: 'Snowball Earth', text: 'Ice may cover much of the planet at times. Life survives, then the first animals appear not long after.' },
    { mya: 530, title: 'The Cambrian explosion', text: 'Animals with eyes, shells and legs suddenly become common in the fossil record.' },
    { mya: 505, title: 'Pikaia swims', text: 'A small swimmer with a stiff rod down its back, an early relative of animals with backbones.', taxonId: 'pikaia' },
    { mya: 375, title: 'Tiktaalik', text: 'A fish with elbow-like fins and a neck, a snapshot of how limbs began.', taxonId: 'tiktaalik' },
    { mya: 365, title: 'Acanthostega', text: 'Four limbs with fingers, but still mostly living in water.', taxonId: 'acanthostega' },
    { mya: 318, title: 'First amniotes', text: 'Small animals lay eggs that survive on dry land. The oldest fossil is Hylonomus, about 318 million years old. The family soon splits into the mammal side and the reptile-and-bird side.', taxonId: 'amniote' },
    { mya: 308, title: 'Earliest synapsid fossils', text: 'The mammal-side branch has already split off by now. The oldest fossils we have of it are about 308 million years old.', taxonId: 'synapsid' },
    { mya: 280, title: 'Dimetrodon', text: 'The sail-backed top predator of dry Permian lands. It is a synapsid, not a dinosaur.', taxonId: 'dimetrodon' },
    { mya: 252, title: 'The Permian extinction', text: 'The biggest mass extinction ever. Most species vanish. Archosaurs soon begin to spread.', taxonId: 'archosaur' },
    { mya: 250, title: 'Croc-line and bird-line split', text: 'Archosaurs divide into croc-line cousins and bird-line cousins.', taxonId: 'pseudosuchian' },
    { mya: 245, title: 'Dinosaur cousins appear', text: 'Small, light animals like Marasuchus show up.', taxonId: 'dinosauromorph' },
    { mya: 243, title: 'First dinosaurs', text: 'Small to medium animals walking upright. They are not the rulers yet.', taxonId: 'dinosaur' },
    { mya: 228, title: 'First pterosaurs', text: 'The first flying backboned animals with skin wings.', taxonId: 'pterosaur' },
    { mya: 210, title: 'First mammals', text: 'Tiny furry mammals appear and live alongside dinosaurs for 140 million years.', taxonId: 'mammal' },
    { mya: 201, title: 'The end-Triassic extinction', text: 'Many croc-line archosaurs die out. Dinosaurs spread widely afterward.', taxonId: 'dinosaur' },
    { mya: 170, title: 'Feathery theropods', text: 'Coelurosaurs and early tyrannosaurs appear. Many have fuzz or feathers.', taxonId: 'coelurosaur' },
    { mya: 150, title: 'Archaeopteryx and Stegosaurus', text: 'The famous first-bird fossil lives with giant long-necks and plated dinosaurs.', taxonId: 'archaeopteryx' },
    { mya: 120, title: 'Four-winged Microraptor', text: 'A glider with feathers on all four limbs.', taxonId: 'microraptor' },
    { mya: 100, title: 'Modern-type birds', text: 'Birds with beaks and short tails show up.', taxonId: 'neornithine' },
    { mya: 95, title: 'Argentinosaurus', text: 'One of the biggest land animals ever known. Size is an estimate.', taxonId: 'argentinosaurus' },
    { mya: 80, title: 'Mosasaurs rule the sea', text: 'Giant swimming relatives of lizards. They are not dinosaurs.', taxonId: 'mosasaur' },
    { mya: 68, title: 'T. rex and Triceratops', text: 'The last big dinosaurs share the same lands.', taxonId: 'trex' },
    { mya: 66, title: 'The asteroid', text: 'An asteroid hits the Earth. All non-bird dinosaurs and pterosaurs die out. Some birds, mammals, and crocs survive.', taxonId: 'neornithine' },
    { mya: 60, title: 'Songbirds begin', text: 'Passerines, perching and singing birds, start to appear. They become more than half of all bird species.', taxonId: 'passerine' },
    { mya: 0.3, title: 'Humans appear', text: 'Homo sapiens shows up, a very recent branch of the mammal family.', taxonId: 'human' }
  ];

  /* ---------------- quiz ---------------- */
  DATA.quiz = [
    { q: 'Which living animal is a dinosaur?', choices: ['Crocodile', 'Magpie', 'Gecko', 'Tortoise'], answer: 1, why: 'Birds are avian dinosaurs, living members of the theropod family, like T. rex.', level: 1 },
    { q: 'Is a crocodile an ancestor of birds?', choices: ['Yes, birds came from crocs', 'No, they are cousins that share an ancestor', 'Yes, but only ostriches', 'No, they are not related at all'], answer: 1, why: 'Crocodiles and birds are archosaur cousins. They share a common ancestor from about 250 million years ago.', level: 1 },
    { q: 'Was Dimetrodon a dinosaur?', choices: ['Yes', 'Yes, a sail-back dinosaur', 'No, it was on the mammal side of the tree', 'No, it was a pterosaur'], answer: 2, why: 'Dimetrodon is a synapsid, closer to mammals than to dinosaurs, and lived before dinosaurs existed.', level: 1 },
    { q: 'Are pterosaurs dinosaurs?', choices: ['No, they are close cousins', 'Yes, flying dinosaurs', 'Yes, but only small ones', 'No, they are mammals'], answer: 0, why: 'Pterosaurs are archosaurs, bird-line cousins of dinosaurs, but not dinosaurs themselves.', level: 1 },
    { q: 'What does an amniote egg let animals do?', choices: ['Fly', 'Live on dry land from the first day of life', 'Breathe fire', 'Grow teeth'], answer: 1, why: 'The amniote egg has its own watery bag, so babies can develop on dry land.', level: 1 },
    { q: 'Which is the best way to say how evolution works?', choices: ['Animals try to get better', 'A population changes over many generations as some traits help survival', 'Animals change during their lifetime and pass it on', 'It climbs a ladder toward humans'], answer: 1, why: 'Populations change over generations. Nothing tries, and there is no ladder.', level: 2 },
    { q: 'In the seed-bird story, why did the average beak get thicker in a drought?', choices: ['Birds decided to grow thicker beaks', 'Thick-beaked birds could crack hard seeds, survived more, and passed on their genes', 'Seeds made beaks grow', 'Thin beaks fell off'], answer: 1, why: 'Selection favours the beaks that work. Chicks inherit their parents\' beak genes.', level: 2 },
    { q: 'Mosasaurs were...', choices: ['Swimming dinosaurs', 'Swimming relatives of lizards and snakes', 'Giant crocodiles', 'Fish'], answer: 1, why: 'Mosasaurs are lepidosaurs, related to lizards and snakes. Not dinosaurs.', level: 2 },
    { q: "'Bird-hipped' dinosaurs are NOT the ancestors of birds. Birds come from...", choices: ['Lizard-hipped dinosaurs', 'Crocodiles', 'Pterosaurs', 'Bird-hipped dinosaurs'], answer: 0, why: 'Birds are theropods, part of the lizard-hipped (saurischian) group. The names are a famous mix-up.', level: 2 },
    { q: 'Which animal is closest to birds, among living animals?', choices: ['Lizards', 'Crocodiles', 'Turtles (for sure)', 'Cats'], answer: 1, why: 'Crocodilians are the closest living relatives of birds. Turtles may be close too, but scientists still argue.', level: 2 },
    { q: 'About when did the non-bird dinosaurs die out?', choices: ['252 million years ago', '201 million years ago', '66 million years ago', '10 million years ago'], answer: 2, why: 'An asteroid hit about 66 million years ago, and all non-bird dinosaurs died out.', level: 1 },
    { q: 'Which is TRUE about Velociraptor?', choices: ['It was as big as a human and had no feathers', 'It was about turkey-size and had feathers', 'It lived with Stegosaurus', 'It ate only plants'], answer: 1, why: 'Fossils show quill knobs for feathers on its arm. It was around the size of a turkey.', level: 2 },
    { q: 'Why is "reptile" a tricky word for scientists?', choices: ['Reptiles do not exist', 'Birds are inside the reptile branch of the family tree, so it is not a tidy group', 'Reptiles are mammals', 'Reptiles are all dinosaurs'], answer: 1, why: 'Everyday "reptile" leaves out birds, but birds belong to the same branch. So scientists use family-tree names.', level: 3 },
    { q: 'Where do turtles go on the family tree?', choices: ['Everyone agrees', 'Scientists still argue, but DNA often puts them near archosaurs', 'Next to cats', 'They are dinosaurs'], answer: 1, why: 'Fossil and DNA clues disagree a bit, so it is still debated.', level: 3 },
    { q: 'Which of these is a good idea about why sauropods got giant? (pick the careful one)', choices: ['Scientists have proven one single cause', 'Probably several things together: food, light bones, air sacs, many eggs, fast growth', 'Dinosaurs wanted to be big', 'Because they were old'], answer: 1, why: 'There are several strong ideas that work together, and some details are debated.', level: 3 },
    { q: 'What is a "common ancestor"?', choices: ['An animal that lives today', 'A shared ancestor of two or more living groups', 'The biggest animal', 'A fossil in a museum'], answer: 1, why: 'The last common ancestor is where two family lines meet when you trace them back.', level: 2 },
    { q: 'Island dwarfing means...', choices: ['Animals on islands sometimes become smaller over generations when food is scarce', 'Islands shrink animals instantly', 'Dwarfs sail to islands', 'Dinosaurs lived only on islands'], answer: 0, why: 'On small islands with little food, smaller individuals can survive better, so the average size falls.', level: 3 },
    { q: 'What did Archaeopteryx have?', choices: ['Only feathers', 'Feathered wings plus teeth, claws, and a bony tail', 'Fur and milk', 'A shell'], answer: 1, why: 'It mixed bird and dinosaur features, a famous in-between fossil, though many feathered dinosaurs are now known.', level: 2 },
    { q: 'Who is the most "advanced": a human or a crocodile?', choices: ['Human', 'Crocodile', 'Neither: both fit their lives and have evolved for the same time', 'The one with the biggest brain'], answer: 2, why: 'Evolution has no ladder and no goal. Each species fits its place.', level: 1 },
    { q: 'A mutation is...', choices: ['A random change in DNA that can add new variation', 'A plan by the animal', 'Always harmful', 'Something you get from the gym'], answer: 0, why: 'Mutations are random. Most do nothing, some harm, and a few help.', level: 3 }
  ];

  /* ---------------- glossary ---------------- */
  DATA.glossary = [
    { term: 'Adaptation', def: 'A trait that helps a population survive and have babies in the place it lives. It builds up over many generations.' },
    { term: 'Amniote', def: 'An animal whose eggs (or embryos) have a protective water bag, so babies develop on land. Includes reptiles, birds, and mammals.' },
    { term: 'Archosaur', def: "'Ruling reptile': the group with crocodiles, pterosaurs, dinosaurs, and birds." },
    { term: 'Avian dinosaur', def: 'Another name for a bird. Birds are living dinosaurs.' },
    { term: 'Avialan', def: 'The bird line: birds and their closest feathered dinosaur relatives with flight wings.' },
    { term: 'Clade', def: 'A group made of an ancestor and ALL of its descendants. A tidy branch of the family tree.' },
    { term: 'Common ancestor', def: 'An ancestor shared by two or more kinds of animals.' },
    { term: 'Cousin (in evolution)', def: 'A relative on a different branch. It shares an ancestor but is not the ancestor.' },
    { term: 'Crocodylomorph', def: 'The croc-relative group, including crocodiles and alligators.' },
    { term: 'Cynodont', def: 'A furry, almost-mammal synapsid from which mammals came.' },
    { term: 'Deep time', def: 'The huge span of millions of years in Earth history.' },
    { term: 'Ectotherm', def: "An animal that gets most of its body heat from the outside world. Often called 'cold-blooded'." },
    { term: 'Endotherm', def: "An animal that makes its own body heat. Often called 'warm-blooded'." },
    { term: 'Era / Period', def: 'A named chunk of Earth history, like the Jurassic.' },
    { term: 'Evolution', def: 'Change in the traits of a population over many generations.' },
    { term: 'Extinction', def: 'When the last member of a species dies.' },
    { term: 'Fossil', def: 'Remains or traces of ancient life, usually in rock.' },
    { term: 'Gene', def: 'A section of DNA with instructions that helps build a trait.' },
    { term: 'Inheritance', def: 'Passing traits from parents to offspring through genes.' },
    { term: 'Lepidosaur', def: 'Scaly group that has lizards, snakes, and the tuatara.' },
    { term: 'Mass extinction', def: 'A time when many species die out in a short while.' },
    { term: 'Mya', def: 'Million years ago.' },
    { term: 'Mutation', def: 'A random change in DNA.' },
    { term: 'Natural selection', def: 'When individuals with helpful traits survive and have more babies, so those traits get common in the population.' },
    { term: 'Ornithischian', def: "'Bird-hipped' dinosaurs, like Stegosaurus and Triceratops. Birds are NOT in this group." },
    { term: 'Population', def: 'A group of the same kind of animals living in one place. Populations evolve, not single animals.' },
    { term: 'Pterosaur', def: 'Flying reptile cousin of the dinosaurs. Not a dinosaur.' },
    { term: 'Saurischian', def: "'Lizard-hipped' dinosaurs: long-necks and theropods, and so birds." },
    { term: 'Sauropod', def: 'A long-necked, giant plant-eating dinosaur, like Brachiosaurus.' },
    { term: 'Synapsid', def: 'The branch that leads to mammals. Dimetrodon belongs here.' },
    { term: 'Theropod', def: 'Two-legged dinosaurs with hollow bones. Includes T. rex and all birds.' },
    { term: 'Trait', def: 'A feature of a living thing, like beak thickness or colour.' },
    { term: 'Variation', def: 'Small differences between individuals in a population.' }
  ];

  window.DATA = DATA;
})();
