"""Fact-check corrections for data.js / facts.js (run once)."""
import io, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def edit(rel, pairs):
    p = os.path.join(ROOT, rel)
    s = io.open(p, encoding='utf-8').read()
    for a, b in pairs:
        if a not in s:
            print('  NOT FOUND in', rel, ':', a[:70]); continue
        s = s.replace(a, b, 1)
    io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
    print('patched', rel)


edit('js/data.js', [
    # dates: Hylonomus (318) is a sauropsid; the oldest synapsid fossils (Archaeothyris) are ~306-308; cynodonts appear in the late Permian
    ("T('synapsid', 'amniote', 'Synapsids', 'Mammal-side cousins', 'Synapsids', 315,", "T('synapsid', 'amniote', 'Synapsids', 'Mammal-side cousins', 'Synapsids', 308,"),
    ("T('sauropsid', 'amniote', 'Sauropsids', 'Scaly and feathery side', 'Sauropsids', 310,", "T('sauropsid', 'amniote', 'Sauropsids', 'Scaly and feathery side', 'Sauropsids', 318,"),
    ("'Cynodonts', 250, 'group'", "'Cynodonts', 260, 'group'"),
    ("{ mya: 315, title: 'Synapsids split off', text: 'The mammal-side branch begins.', taxonId: 'synapsid' },",
     "{ mya: 308, title: 'Earliest synapsid fossils', text: 'The mammal-side branch has already split off by now. The oldest fossils we have of it are about 308 million years old.', taxonId: 'synapsid' },"),
    ("    { mya: 310, title: 'Sauropsids split off', text: 'The scaly and feathery branch begins. It leads to lizards, turtles, crocs, dinosaurs, and birds.', taxonId: 'sauropsid' },\n", ""),
    ("text: 'Small animals lay eggs that survive on dry land. Everything in this album traces back to them.'",
     "text: 'Small animals lay eggs that survive on dry land. The oldest fossil is Hylonomus, about 318 million years old. The family soon splits into the mammal side and the reptile-and-bird side.'"),
    ("Near the end, the first amniotes (animals whose eggs can survive on dry land) appear.", "In the middle of this time, the first amniotes (animals whose eggs can survive on dry land) appear."),
    # facts
    ("It lived about 30 million years BEFORE the first dinosaur.", "It lived at least 30 million years BEFORE the first dinosaur."),
    ("Stegosaurus lived about 150 million years ago, closer to us in time than to the first dinosaurs.", "T. rex lived closer to us in time than to Stegosaurus. About 82 million years separate Stegosaurus from T. rex, but only about 66 million years separate T. rex from today."),
    ("Its arms were stronger than a T. rex's.", "Its arms were longer than a T. rex's and had three big claws."),
    ("There are more chickens than any other bird, about 25 billion.", "There are more chickens than any other bird, more than 25 billion at any one time."),
    ("A perfect in-between fossil.", "A famous in-between fossil."),
    ("a perfect in-between fossil, though many feathered dinosaurs are now known.", "a famous in-between fossil, though many feathered dinosaurs are now known."),
    ("The earliest dinosaur fossils, from ~230 million years ago, were small.", "The earliest dinosaur fossils, from about 230 to 243 million years ago, were small."),
    ("'Tortoise (Testudinidae)', 'Armoured plant-eater'", "'Tortoise (Testudinidae)', 'Armoured plant-eater'"),
])

edit('js/views/facts.js', [
    ("The bee hummingbird is a living dinosaur, only about 6 cm long and around 2 grams.", "The bee hummingbird is a living dinosaur, only about 6 cm long and around 2 grams, about the weight of two paperclips."),
    ("The smallest dinosaur alive weighs about as much as a paperclip", "The smallest dinosaur alive weighs about as much as two paperclips"),
    ("Dolphins are mammals that evolved the same shape about 150 million years later.", "Dolphins are mammals that evolved a similar shape tens of millions of years after the ichthyosaurs had died out."),
    ("The ancestor of both was a land animal that lived about 55 million years ago.", "The ancestor of both was a land animal that lived about 55 to 60 million years ago."),
    ("Crocodile ancestors were not dinosaurs, and early crocodile relatives were very different: some ran on two legs and some were armoured plant-eaters.", "Crocodile ancestors were not dinosaurs, and early crocodile relatives were very different: some ran on slim upright legs, and a relative group, the aetosaurs, were armoured plant-eaters."),
])
