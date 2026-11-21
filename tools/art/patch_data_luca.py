"""One-off patch: extend js/data.js back to LUCA (run once; safe to re-run, it checks first)."""
import io, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
p = os.path.join(ROOT, 'js', 'data.js')
s = io.open(p, encoding='utf-8').read()
if "id: 'hadean'" in s:
    print('already patched'); raise SystemExit

# 1) eras (oldest first)
eras = """    { id: 'hadean', name: 'Hadean', startMya: 4540, endMya: 4000, color: '#d9622b',
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
"""
s = s.replace("  DATA.eras = [\n", "  DATA.eras = [\n" + eras, 1)

# 2) taxa: new base of the tree
taxa = """  T('luca', null, 'LUCA', 'Last Universal Common Ancestor', 'Life', 4000, 'group', 'Chemicals (probably)', 0, 0, 'Warm water, perhaps near hot vents',
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
"""
s = s.replace("  T('amniote', null,", taxa + "  T('amniote', 'acanthostega',", 1)

# 3) timeline events (oldest first)
ev = """    { mya: 4540, title: 'Earth forms', text: 'A ball of hot rock forms around a young Sun. For a long time it is far too hot for life as we know it.' },
    { mya: 4000, title: 'LUCA lives', text: 'The last common ancestor of all living things lives, as far as we can tell from DNA. Every animal, plant, fungus and microbe alive today descends from it.', taxonId: 'luca' },
    { mya: 3500, title: 'Stromatolites', text: 'Microbes build layered mounds. These are among the oldest fossils we have.', taxonId: 'microbial-mat' },
    { mya: 2400, title: 'The Great Oxidation', text: 'Cyanobacteria have been making oxygen for a long time. Now it builds up in the air and changes the whole planet.' },
    { mya: 700, title: 'Snowball Earth', text: 'Ice may cover much of the planet at times. Life survives, then the first animals appear not long after.' },
    { mya: 530, title: 'The Cambrian explosion', text: 'Animals with eyes, shells and legs suddenly become common in the fossil record.' },
    { mya: 505, title: 'Pikaia swims', text: 'A small swimmer with a stiff rod down its back, an early relative of animals with backbones.', taxonId: 'pikaia' },
    { mya: 375, title: 'Tiktaalik', text: 'A fish with elbow-like fins and a neck, a snapshot of how limbs began.', taxonId: 'tiktaalik' },
    { mya: 365, title: 'Acanthostega', text: 'Four limbs with fingers, but still mostly living in water.', taxonId: 'acanthostega' },
"""
s = s.replace("  DATA.timelineEvents = [\n", "  DATA.timelineEvents = [\n" + ev, 1)
s = s.replace("travel back 300 million years", "travel back 4 billion years")
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('patched')
