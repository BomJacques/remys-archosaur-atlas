// node tools/art/make_prompts.js  ->  tools/art/PROMPTS.md  (one image-generation prompt per animal)
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..', '..');
const w = {}; w.window = w; vm.createContext(w);
vm.runInContext(fs.readFileSync(path.join(root, 'js', 'data.js'), 'utf8'), w);
const D = w.DATA;

const STYLE = 'Hand-illustrated natural-history field-guide style, like a modern museum illustration for children. ' +
  'Realistic, scientifically accurate proportions and anatomy. Painterly, softly textured skin (fine scales, wrinkles, feathers drawn as feathers) with gentle shading and subtle mottled colour patterns. ' +
  'Thin dark olive-brown outline. Warm natural colours. A friendly, expressive eye with a small catchlight. ' +
  'ONE animal only, full body visible, side or three-quarter view facing right, feet on an invisible ground. ' +
  'Plain pure white background, no ground, no shadow, no scenery, no text, no labels, no borders. Landscape 4:3, high resolution.';

// anatomy cues the generator tends to get wrong. Keep them short and concrete.
const NOTES = {
  trex: 'Adult Tyrannosaurus rex: huge deep skull with big teeth, tiny TWO-fingered arms with the palms facing inward (not facing down), long heavy tail held out horizontally to balance the body, powerful three-toed legs, mostly scaly skin with a little sparse feather fuzz along the back.',
  tyrannosaur: 'A feathery tyrannosaur like Yutyrannus: shaggy fuzz of simple feathers over the body and tail, long skull, two-fingered small arms, horizontal body.',
  allosaurus: 'Allosaurus: long low skull with two bony crests above the eyes, THREE-fingered hands with big claws, horizontal spine and tail.',
  coelophysis: 'Coelophysis: slim, lightweight, long neck and tail, narrow head with small teeth, three-fingered hands, about the size of a large dog.',
  velociraptor: 'Velociraptor: turkey-sized, fully feathered body, wing feathers on the arms, long feathered tail, large raised sickle claw on the second toe, narrow snout.',
  microraptor: 'Microraptor: small, glossy blue-black feathers, FOUR wings (long feathers on arms and on the legs) and a diamond-shaped tail fan, clawed hands.',
  coelurosaur: 'Sinosauropteryx-like small theropod covered in fine downy fuzz, long tail with ginger-and-cream bands, big head and short arms.',
  maniraptoran: 'Caudipteryx-like feathered dinosaur: fan of tail feathers, wing feathers on the hands, long legs, tiny beak-like snout with a few teeth.',
  theropod: 'A representative early theropod (like Dilophosaurus): bipedal, long tail, two crests on the head, three-toed feet, grasping hands.',
  dinosaur: 'One of the very first dinosaurs, like Eoraptor: small, light, bipedal, long tail, small grasping hands, about a metre long.',
  stegosaurus: 'Stegosaurus: tiny head carried low, 17 large kite-shaped plates alternating along the back, FOUR spikes on the tail, back higher than the shoulders, short front legs.',
  triceratops: 'Triceratops: big bony frill, two long brow horns and one short nose horn, a parrot-like beak, sturdy four-legged body, pebbled skin.',
  ankylosaurus: 'Ankylosaurus: low wide body armoured with bony plates and knobs, spikes along the sides, a big bony club at the end of the tail, small leaf-shaped teeth, broad head.',
  parasaurolophus: 'Parasaurolophus: duck-billed head with a long curved tubular crest sweeping back over the neck, walking on four legs with the option of rearing on two.',
  plateosaurus: 'Plateosaurus: long neck, small head, big body, thumb claw on each hand, could walk on two or four legs, leaf-shaped teeth.',
  brachiosaurus: 'Brachiosaurus: giraffe-like, front legs longer than the back legs, very long neck held high, a bump with the nostrils on top of the head, short tail.',
  argentinosaurus: 'Argentinosaurus: colossal titanosaur sauropod, massive pillar legs, very long neck and tail, small head, wrinkled thick skin.',
  ornithischian: 'A small early bird-hipped dinosaur like Heterodontosaurus: bipedal, a horny beak, small fangs, bristle-like filaments on the back.',
  saurischian: 'An early lizard-hipped dinosaur (like Herrerasaurus): bipedal predator, long jaw, five-fingered hands, long tail.',
  sauropodomorph: 'An early sauropodomorph (like Massospondylus): small head, long neck, bulky body, able to walk on two legs.',
  pterosaur: 'Pteranodon-style pterosaur: membrane wings (NOT feathers) stretched along one hugely long finger, a long toothless beak, a tall backward-pointing crest, tiny body, wings spread in flight, seen from the side. No ground.',
  quetzalcoatlus: 'Quetzalcoatlus: giant azhdarchid pterosaur standing on the ground on its folded wings and hind legs (four-legged stance), very long neck and long straight toothless beak, a giraffe tall.',
  crocodile: 'Saltwater/Nile crocodile: long V-shaped snout with interlocking teeth, armoured bumpy back scutes, raised eye bumps, short sprawling-but-lifted legs, long muscular tail.',
  alligator: 'American alligator: broad U-shaped snout, upper teeth hide the lower teeth when the mouth is closed, dark olive-black armoured back, cream belly.',
  crocodylomorph: 'A long-legged, slim early crocodile relative (like Terrestrisuchus or Sphenosuchus) running on upright legs, light body armour, slender snout.',
  postosuchus: 'Postosuchus: big Triassic predator related to crocodiles, heavy deep skull with large teeth, upright pillar-like legs, a row of armoured scutes along the back.',
  pseudosuchian: 'An armoured aetosaur like Desmatosuchus: small head, wide body covered in bony plates, large spikes sticking out from the shoulders, plant eater.',
  archosaur: 'An early archosaur like Euparkeria: small, light, lizard-sized, with upright-ish back legs, long tail, a pointed snout with sharp teeth, a row of small bony plates on the back.',
  avemetatarsalian: 'A small slender bird-line archosaur like Lagerpeton or Marasuchus: long hind legs, light build, long tail.',
  dinosauromorph: 'A dinosaur cousin like Marasuchus or Silesaurus: long slim legs held under the body, a small head, light body about the size of a cat.',
  gecko: 'A gecko: big eyes with vertical pupils, sticky toe pads clearly shown, bumpy patterned skin, clinging posture.',
  snake: 'A snake with its head raised and its body coiled, rows of smooth scales, a forked tongue flicking.',
  tuatara: 'Tuatara of New Zealand: stocky lizard-like body, a spiny crest down the back and neck, olive-grey scaly skin, a small pale spot on the top of the head (the third eye).',
  mosasaur: 'Mosasaur (like Tylosaurus): giant marine lizard, long crocodile-like jaws full of sharp teeth, four paddle-shaped flippers, a long tail with a fluke at the end, swimming in a gentle S-shape. No ground.',
  plesiosaur: 'Plesiosaur (like Elasmosaurus): very long neck, small head with sharp teeth, a barrel body, four large flippers, short tail, swimming. No ground.',
  ichthyosaur: 'Ichthyosaur (like Ophthalmosaurus): dolphin-shaped body, a long narrow beak, a very large eye, a triangular dorsal fin, a tail with a crescent fluke, swimming. No ground.',
  turtle: 'Green sea turtle: smooth oval shell with scute pattern, paddle flippers, a beak-like mouth, swimming. No ground.',
  tortoise: 'Tortoise: high domed shell with scute pattern, thick elephant-like front legs, wrinkled neck, scaly skin.',
  amniote: 'A small early reptile-like animal like Hylonomus: lizard-sized, sprawling legs, a pointed snout, olive-brown scaly skin. A single amniote egg beside it is welcome.',
  synapsid: 'An early synapsid like Haptodus: a sprawling lizard-like four-legged animal, a skull with a single hole behind each eye, short tail.',
  dimetrodon: 'Dimetrodon: a large sail on the back supported by long spines, two kinds of teeth in a deep skull, sprawling legs, rust and cream colours. It is NOT a dinosaur.',
  cynodont: 'Cynodont like Thrinaxodon: small, fur-covered, whiskered, with a long body and short legs, a bit like a weasel-lizard.',
  mammal: 'A tiny shrew-like early mammal like Morganucodon: furry, large nostrils, whiskers, long tail, big ears, standing on a branch.',
  cat: 'A domestic tabby cat standing or walking, detailed fur, whiskers, alert ears.',
  human: 'A friendly child about nine years old standing and waving, simple t-shirt, shorts and trainers, mid-brown skin tone.',
  magpie: 'Eurasian magpie: black and white with glossy iridescent blue-green on the wing and tail, a very long graduated tail, black bill and legs, perched or standing.',
  chicken: 'A rooster (or hen) with a red comb and wattles, fully drawn feathers, scaly yellow legs with four toes.',
  ostrich: 'Ostrich: very long bare pink-grey neck, small head, huge eyes, a fluffy black-and-white body, two long powerful legs with TWO toes on each foot.',
  penguin: 'Emperor penguin: upright stance, black head and back, white belly, a yellow-orange patch on the neck, flipper wings, webbed feet.',
  hummingbird: 'Hummingbird hovering at a flower, wings blurred, long thin bill, iridescent green and ruby throat.',
  passerine: 'A songbird perched on a twig, three toes forward and one back gripping the twig, small conical beak.',
  archaeopteryx: 'Archaeopteryx: feathered wings with three clawed fingers, a beak with small teeth, a long bony tail lined with feathers, a crow size.',
  avialan: 'An early beaked bird like Confuciusornis: crow-sized, a toothless beak, two long ribbon-like tail feathers, wings with a clawed finger.',
  neornithine: 'A small modern-type ground bird, a bit like a plover, short beak, long thin legs, with a plain brown-grey feather pattern.'
};

const extras = [
  { id: 'plesiosaur', name: 'Plesiosaur', nickname: 'Long-neck swimmer', blurb: '' },
  { id: 'ichthyosaur', name: 'Ichthyosaur', nickname: 'Dolphin-shaped reptile', blurb: '' }
];

const items = D.taxa.map(t => ({ id: t.artId || t.id, name: t.name, nickname: t.nickname, blurb: t.blurb, diet: t.diet, len: t.lengthM, group: t.group, mya: t.mya, rank: t.rank }))
  .concat(extras);
const seen = new Set();
let md = '# Image prompts for Remy\'s Archosaur Atlas\n\n' +
  'Use ONE prompt per image. Save each result as `art-source/<id>.png` (the id in the heading), then run `python tools/art/process.py --shadow`.\n\n' +
  '**Style block (already included in every prompt below):**\n\n> ' + STYLE + '\n\n' +
  '**Tips:** generate on a pure white background; if the tool adds a ground or shadow, ask it to remove it. Keep the animal facing right. ' +
  'If the proportions look wrong, add "check the anatomy notes" and regenerate. For consistency, upload the triceratops reference image with each request and say "same style as the reference".\n\n---\n\n';
let n = 0;
items.forEach(it => {
  if (seen.has(it.id)) return; seen.add(it.id); n++;
  const note = NOTES[it.id] || ('A ' + (it.name || it.id) + '. ' + (it.blurb || ''));
  const meta = [];
  if (it.len) meta.push('about ' + it.len + ' m long');
  if (it.diet) meta.push('diet: ' + it.diet);
  const prompt = STYLE.replace('ONE animal only', 'ONE animal only (' + String(it.name).replace(/\s*\(.*$/, '') + ')') + ' ' + note + (meta.length ? ' (' + meta.join(', ') + '.)' : '');
  md += '## ' + it.id + '\n' + '*' + (it.nickname || it.name) + '*\n\n' + prompt + '\n\n';
});
fs.writeFileSync(path.join(__dirname, 'PROMPTS.md'), md);
fs.writeFileSync(path.join(__dirname, 'ids.txt'), Array.from(seen).join('\n') + '\n');
console.log('wrote', n, 'prompts');
