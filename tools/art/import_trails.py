"""Import the journey series -> assets/art/trails/*.webp + assets/art/trails.js (window.TRAILS).
    python tools/art/import_trails.py [drawings_dir]
Each journey is a hand-picked list of painted steps from a living animal back to its distant relatives.
Text is written for ages 8-12 and kept careful: most steps are *relatives* that show what the ancestors looked like."""
import os, sys, json, glob
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = sys.argv[1] if len(sys.argv) > 1 else r'F:\Claude code\drawings'
OUT = os.path.join(ROOT, 'assets', 'art', 'trails')
os.makedirs(OUT, exist_ok=True)

# scene shortcuts (these backgrounds already exist as assets/art/scenes/<name>.webp from import_atlas.py)
S = {
    'farm': 'today-farmyard', 'euc': 'today-eucalypt-park', 'estuary': 'today-tropical-estuary', 'jungle': 'southeast-asian-forest-junglefowl',
    'eocene': 'eocene-47-million-years', 'lcret': 'late-cretaceous-67-million-years', 'ecret': 'early-cretaceous-125-million-years',
    'jur': 'late-jurassic-150-million-years', 'tri': 'late-triassic-230-to-220-million-years', 'dev': 'late-devonian-375-to-365-million-years',
    'coal': 'carboniferous-coal-forest', 'camb': 'cambrian-seafloor', 'micro': 'early-earth-microbial-world', 'luca': 'early-earth-waters',
}

T = {
 'chicken': {'title': "The chicken's journey", 'sub': 'From a farmyard hen back to a fish with elbows', 'dir': 'chicken-series', 'steps': [
  ('01-domestic-hen-today', 'Domestic hen', 'Today', 'Chickens are living dinosaurs. They are bred from red junglefowl that people began keeping thousands of years ago.', ('s', 'farm')),
  ('02-wild-red-junglefowl', 'Wild red junglefowl', 'Today, in the wild', 'The wild bird that today\'s chickens come from lives in the forests of South and Southeast Asia. People tamed it and bred it into hundreds of kinds.', ('s', 'jungle')),
  ('03-asteriornis-about-67-million-years-ago', 'Asteriornis', 'About 67 million years ago', 'Nicknamed the "wonderchicken". It is the oldest known relative of the bird group that holds chickens, turkeys and ducks. It lived just before the asteroid.', ('s', 'lcret')),
  ('04-archaeopteryx-about-150-million-years-ago', 'Archaeopteryx', 'About 150 million years ago', 'A feathered dinosaur with wings, teeth, claws and a long bony tail. It is an early cousin of modern birds, so it shows us what early birds were like.', ('s', 'jur')),
  ('05-early-dinosaur-about-230-million-years-ago', 'An early dinosaur', 'About 230 million years ago', 'The first dinosaurs were small and ran on two legs. Birds are descended from this branch of the family tree.', ('s', 'tri')),
  ('06-tiktaalik-about-375-million-years-ago', 'Tiktaalik', 'About 375 million years ago', 'A big fish with elbow-like fins and a neck. Every animal with a backbone and four limbs, including chickens, comes from fish like this.', ('s', 'dev')),
 ]},
 'crocodile': {'title': "The crocodile's journey", 'sub': 'From a saltwater crocodile back to LUCA', 'dir': 'crocodile-series', 'steps': [
  ('01-saltwater-crocodile-today', 'Saltwater crocodile', 'Today', 'The biggest living reptile. Crocodiles are not ancestors of birds. They are cousins, and they share an ancestor with birds from about 250 million years ago.', ('s', 'estuary')),
  ('02-bernissartia-about-125-million-years-ago', 'Bernissartia', 'About 125 million years ago', 'A small crocodile relative with short jaws and flat teeth for crunching shells. It lived in swamps in what is now Belgium.', ('s', 'ecret')),
  ('03-hesperosuchus-about-220-million-years-ago', 'Hesperosuchus', 'About 220 million years ago', 'An early relative of crocodiles with slim legs held under its body. It ran on land and hunted small animals.', ('s', 'tri')),
  ('04-acanthostega-about-365-million-years-ago', 'Acanthostega', 'About 365 million years ago', 'One of the first animals with limbs and fingers. It still lived mostly in the water.', ('s', 'dev')),
  ('05-tiktaalik-about-375-million-years-ago', 'Tiktaalik', 'About 375 million years ago', 'A fish with strong fins and a neck. Its fins had bones that could push up, a clue to how limbs began.', ('s', 'dev')),
  ('06-luca-billions-of-years-ago', 'LUCA', 'About 4 billion years ago', 'The last universal common ancestor: a tiny cell that every living thing, crocodiles included, comes from.', ('s', 'luca')),
 ]},
 'magpie': {'title': "The magpie's journey", 'sub': 'From an Australian magpie back to LUCA', 'dir': 'magpie-series', 'steps': [
  ('01-australian-magpie-today', 'Australian magpie', 'Today', 'A clever living dinosaur. The Australian magpie is not closely related to the European magpie, but both are perching birds.', ('s', 'euc')),
  ('02-early-perching-bird-about-47-million-years-ago', 'An early perching bird', 'About 47 million years ago', 'Small perching birds were already around by the Eocene. They grew into the songbirds, the biggest bird group of all.', ('s', 'eocene')),
  ('03-archaeopteryx-about-150-million-years-ago', 'Archaeopteryx', 'About 150 million years ago', 'A feathered dinosaur with teeth, claws on its wings and a long bony tail. An early cousin of all modern birds.', ('s', 'jur')),
  ('04-early-dinosaur-about-230-million-years-ago', 'An early dinosaur', 'About 230 million years ago', 'Small, two-legged and light. Birds come from the meat-eating branch of the dinosaur family tree.', ('s', 'tri')),
  ('05-tiktaalik-about-375-million-years-ago', 'Tiktaalik', 'About 375 million years ago', 'A fish with elbow-like fins. Animals with four limbs, birds included, trace back to fish like this.', ('s', 'dev')),
  ('06-luca-billions-of-years-ago', 'LUCA', 'About 4 billion years ago', 'The single kind of ancient cell that all living things share as an ancestor.', ('s', 'luca')),
 ]},
 'hummingbird': {'title': "The hummingbird's journey", 'sub': 'From a tiny hoverer back to a fish with elbows', 'dir': 'hummingbird-series', 'steps': [
  ('01-ruby-throated-hummingbird-today', 'Ruby-throated hummingbird', 'Today', 'A living dinosaur that weighs about as much as a coin. It beats its wings about 50 times every second to hover.', ('b', 'background-01-eastern-woodland-edge')),
  ('02-eurotrochilus-30-to-34-million-years-ago', 'Eurotrochilus', '30 to 34 million years ago', 'One of the oldest known true hummingbird relatives. It lived in Europe, where there are no hummingbirds today.', ('b', 'background-02-oligocene-european-forest')),
  ('03-eocypselus-about-52-million-years-ago', 'Eocypselus', 'About 52 million years ago', 'A small bird from an ancient lake, related to the swifts and hummingbirds. It shows what their common ancestors looked like.', ('b', 'background-03-eocene-fossil-lake')),
  ('04-archaeopteryx-about-150-million-years-ago', 'Archaeopteryx', 'About 150 million years ago', 'A feathered dinosaur with teeth and claws. It is an early cousin of modern birds.', ('b', 'background-04-late-jurassic-lagoon')),
  ('05-early-dinosaur-about-230-million-years-ago', 'An early dinosaur', 'About 230 million years ago', 'Small and quick on two legs. Birds come from this branch of the family tree.', ('b', 'background-05-late-triassic-floodplain')),
  ('06-tiktaalik-about-375-million-years-ago', 'Tiktaalik', 'About 375 million years ago', 'A fish with a neck and elbow-like fins, from the time when animals began to move onto land.', ('b', 'background-06-late-devonian-shallows')),
 ]},
 'snake': {'title': "The snake's journey", 'sub': 'From a carpet python back to a fish with elbows', 'dir': 'snake-series', 'steps': [
  ('01-carpet-python-today', 'Carpet python', 'Today', 'A snake is a lizard that lost its legs. Pythons even keep tiny leftover hip bones and little claws.', ('b', 'background-01-eucalypt-park')),
  ('02-messelopython-about-47-million-years-ago', 'Messelopython', 'About 47 million years ago', 'An early python from a lake in what is now Germany, preserved in great detail.', ('b', 'background-02-eocene-messel-lake')),
  ('03-najash-about-95-million-years-ago-v2', 'Najash', 'About 95 million years ago', 'A snake that still had back legs. It shows snakes did not lose their legs all at once.', ('b', 'background-03-cretaceous-patagonia')),
  ('04-hylonomus-carboniferous-v2', 'Hylonomus', 'About 318 million years ago', 'One of the oldest known reptiles, a small lizard-like animal. It shows what the ancestors of lizards and snakes were like.', ('b', 'background-04-carboniferous-coal-forest')),
  ('05-tiktaalik-about-375-million-years-ago', 'Tiktaalik', 'About 375 million years ago', 'A fish with elbow-like fins. All four-limbed animals, snakes included, come from fish like this.', ('b', 'background-05-late-devonian-shallows')),
 ]},
 'human': {'title': 'Your journey', 'sub': 'From you back to the first living cells', 'dir': 'human-evolution-trail', 'steps': [
  ('01-human', 'Human', 'Today', 'That is you! Humans are mammals, and mammals are on the same branch of the family tree as Dimetrodon.', ('s', 'euc')),
  ('02-homo-erectus', 'Homo erectus', 'About 1.9 million years ago, and later', 'An early human relative that walked upright and made stone tools. It is a cousin of ours more than a grandparent.', ('s', 'euc')),
  ('03-australopithecus-afarensis', 'Australopithecus afarensis', 'About 3 to 4 million years ago', 'An upright-walking ape-like relative of ours, known from the famous skeleton called Lucy.', ('s', 'euc')),
  ('04-teilhardina', 'Teilhardina', 'About 56 million years ago', 'A tiny early primate with big eyes and grasping hands. It lived in warm forests.', ('s', 'eocene')),
  ('05-early-mammal', 'An early mammal', 'About 200 million years ago', 'Shrew-sized and furry. Early mammals lived alongside the dinosaurs for over 140 million years.', ('s', 'tri')),
  ('06-cynodont', 'A cynodont', 'About 250 million years ago', 'An almost-mammal with fur and whiskers. Its jaw bones are the ancestors of your ear bones.', ('s', 'tri')),
  ('07-early-synapsid', 'An early synapsid', 'About 300 million years ago', 'A long-bodied relative on the mammal side of the family tree. It was not a reptile and not a dinosaur.', ('s', 'coal')),
  ('08-acanthostega', 'Acanthostega', 'About 365 million years ago', 'One of the first animals with limbs and fingers. It lived mostly in water.', ('s', 'dev')),
  ('09-tiktaalik', 'Tiktaalik', 'About 375 million years ago', 'A fish with elbow-like fins and a neck. A big step on the way to walking on land.', ('s', 'dev')),
  ('10-pikaia', 'Pikaia', 'About 505 million years ago', 'A small swimmer with a stiff rod along its back, an early relative of animals with backbones.', ('s', 'camb')),
  ('11-early-microbial-life-stromatolites', 'Microbial mats', 'About 3.5 billion years ago', 'Layered mounds built by microbes. These are among the oldest fossils we know.', ('s', 'micro')),
  ('12-luca', 'LUCA', 'About 4 billion years ago', 'The last universal common ancestor: one kind of tiny cell that all living things share as an ancestor.', ('s', 'luca')),
 ]},
}


def cutout(path, dest, maxw=1000):
    im = Image.open(path).convert('RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
    if bb:
        im = im.crop(bb)
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(dest, 'WEBP', quality=84, method=6)
    return im.size


out = {}
for key, spec in T.items():
    steps = []
    for i, (stem, name, when, text, bg) in enumerate(spec['steps'], 1):
        f = os.path.join(SRC, spec['dir'], stem + '.png')
        if not os.path.exists(f):
            print('MISSING', f); continue
        dest = '%s-%02d.webp' % (key, i)
        w, h = cutout(f, os.path.join(OUT, dest))
        if bg[0] == 'b':
            bf = os.path.join(SRC, spec['dir'], bg[1] + '.png')
            bdest = '%s-bg-%02d.webp' % (key, i)
            im = Image.open(bf).convert('RGB'); im.thumbnail((1280, 720), Image.LANCZOS); im.save(os.path.join(OUT, bdest), 'WEBP', quality=80, method=6)
            bgsrc = 'assets/art/trails/' + bdest
        else:
            bgsrc = 'assets/art/scenes/%s.webp' % S[bg[1]]
        steps.append({'img': 'assets/art/trails/' + dest, 'aspect': round(h / w, 4), 'bg': bgsrc, 'name': name, 'when': when, 'text': text})
        print(key, i, name, os.path.getsize(os.path.join(OUT, dest)) // 1024, 'KB')
    out[key] = {'title': spec['title'], 'sub': spec['sub'], 'steps': steps}
with open(os.path.join(ROOT, 'assets', 'art', 'trails.js'), 'w', encoding='utf-8') as fh:
    fh.write('/* generated by tools/art/import_trails.py */\nwindow.TRAILS = ' + json.dumps(out, indent=1, ensure_ascii=False) + ';\n')
tot = sum(os.path.getsize(p) for p in glob.glob(os.path.join(OUT, '*.webp')))
print('trails:', len(out), 'files:', len(glob.glob(os.path.join(OUT, '*.webp'))), '%d KB' % (tot // 1024))
