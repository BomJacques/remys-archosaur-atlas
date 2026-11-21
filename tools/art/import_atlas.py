"""Import the hand-made atlas drawings (F:/Claude code/drawings/atlas-art) into the site.

    python tools/art/import_atlas.py [path/to/atlas-art]

* illustrations/*.png (already transparent) -> assets/art/<id>.webp, registered under the site's art ids
  (one drawing may serve several ids, e.g. the early dinosaur is both `dinosaur` and `theropod`)
* backgrounds + timeline backgrounds -> assets/art/scenes/<name>.webp, registered as scene-<name>
  and mapped onto the era scene ids the site already uses
* writes assets/art/index.js (loaded after the old vector art, so these win)
"""
import os, sys, json, glob, re
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = sys.argv[1] if len(sys.argv) > 1 else r'F:\Claude code\drawings'
ATLAS = os.path.join(SRC, 'atlas-art')
OUT = os.path.join(ROOT, 'assets', 'art')
SCN = os.path.join(OUT, 'scenes')

# drawing file stem -> site art ids (first id names the file)
MAP = {
    'allosaurus': ['allosaurus'], 'american-alligator': ['alligator'], 'ankylosaurus': ['ankylosaurus'],
    'archaeopteryx': ['archaeopteryx', 'avialan'], 'argentinosaurus': ['argentinosaurus'],
    'brachiosaurus': ['brachiosaurus'], 'carnotaurus': ['carnotaurus'], 'chicken': ['chicken'],
    'coelophysis': ['coelophysis'], 'crocodile': ['crocodile'], 'cynodont': ['cynodont'],
    'dimetrodon': ['dimetrodon'], 'diplodocus': ['diplodocus'], 'domestic-cat': ['cat'],
    'early-amniote': ['amniote'], 'early-archosaur': ['archosaur'], 'early-avemetatarsalian': ['avemetatarsalian'],
    'early-coelurosaur': ['coelurosaur'], 'early-crocodylomorph': ['crocodylomorph'],
    'early-dinosaur': ['dinosaur', 'theropod'], 'early-dinosauromorph': ['dinosauromorph'],
    'early-lepidosaur': ['lepidosaur'], 'early-mammal': ['mammal'], 'early-maniraptoran': ['maniraptoran'],
    'early-modern-bird': ['neornithine'], 'early-passerine': ['passerine'], 'early-saurischian': ['saurischian'],
    'early-sauropsid': ['sauropsid'], 'early-synapsid': ['synapsid'], 'early-turtle': ['turtle'],
    'emperor-penguin': ['penguin'], 'eurasian-magpie': ['magpie'], 'gecko': ['gecko'], 'human': ['human'],
    'hummingbird': ['hummingbird'], 'microraptor': ['microraptor'], 'mosasaurus': ['mosasaur'],
    'ostrich': ['ostrich'], 'parasaurolophus': ['parasaurolophus'], 'plateosaurus': ['plateosaurus', 'sauropodomorph'],
    'postosuchus': ['postosuchus', 'pseudosuchian'], 'pteranodon': ['pterosaur'], 'quetzalcoatlus': ['quetzalcoatlus'],
    'snake': ['snake'], 'stegosaurus': ['stegosaurus', 'ornithischian'], 'tortoise': ['tortoise'],
    'triceratops': ['triceratops'], 'tuatara': ['tuatara'], 'tyrannosaurus-rex': ['trex', 'tyrannosaur'],
    'velociraptor': ['velociraptor'],
    # not in the tree yet: for the early-Earth extension
    'acanthostega': ['acanthostega'], 'archean-microbial-mat': ['archean-microbial-mat', 'microbial-mat'], 'luca': ['luca'],
    'pikaia': ['pikaia'], 'tiktaalik': ['tiktaalik'],
}

# era scene ids the site already uses -> background file (relative to SRC)
ERA_SCENES = {
    'scene-permian': 'atlas-art/backgrounds/carboniferous-coal-forest.png',
    'scene-triassic': 'timeline-backgrounds/09-late-triassic-230-to-220-million-years.png',
    'scene-jurassic': 'timeline-backgrounds/08-late-jurassic-150-million-years.png',
    'scene-cretaceous': 'timeline-backgrounds/06-late-cretaceous-67-million-years.png',
    'scene-paleogene': 'timeline-backgrounds/05-eocene-47-million-years.png',
    'scene-today': 'timeline-backgrounds/01-today-eucalypt-park.png',
}

CW, CH = 1200, 900   # 4:3 canvas for animals
MARGIN = 0.03


def to_canvas(im):
    im = im.convert('RGBA')
    bbox = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
    im = im.crop(bbox)
    s = min(CW * (1 - 2 * MARGIN) / im.width, CH * (1 - 2 * MARGIN) / im.height)
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    c = Image.new('RGBA', (CW, CH), (0, 0, 0, 0))
    c.alpha_composite(im, ((CW - im.width) // 2, (CH - im.height) // 2))
    return c


def svg_for(path, slice_=False):
    par = 'xMidYMid slice' if slice_ else 'xMidYMid meet'
    return ('<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><image href="%s" x="0" y="0" width="400" '
            'height="300" preserveAspectRatio="%s"/></svg>' % (path, par))


def main():
    os.makedirs(SCN, exist_ok=True)
    reg = {}
    for stem, ids in MAP.items():
        f = os.path.join(ATLAS, 'illustrations', stem + '.png')
        if not os.path.exists(f):
            print('missing', f); continue
        dest = os.path.join(OUT, ids[0] + '.webp')
        to_canvas(Image.open(f)).save(dest, 'WEBP', quality=84, method=6)
        for i in ids:
            reg[i] = svg_for('assets/art/%s.webp' % ids[0])
        print('%-24s -> %s  %d KB' % (stem, ','.join(ids), os.path.getsize(dest) // 1024))

    # scenes
    scene_files = {}
    for pat in ('atlas-art/backgrounds/*.png', 'timeline-backgrounds/*.png', 'earth-stages/*.png'):
        for f in glob.glob(os.path.join(SRC, pat)):
            name = os.path.splitext(os.path.basename(f))[0]
            name = re.sub(r'^\d+-', '', name)
            scene_files[os.path.relpath(f, SRC).replace('\\', '/')] = name
    for rel, name in scene_files.items():
        im = Image.open(os.path.join(SRC, rel)).convert('RGB')
        if rel.startswith('earth-stages'):
            im = Image.open(os.path.join(SRC, rel)).convert('RGBA')
            im.thumbnail((700, 700), Image.LANCZOS)
            dest = os.path.join(SCN, name + '.webp'); im.save(dest, 'WEBP', quality=84, method=6)
            reg['earth-' + name] = svg_for('assets/art/scenes/%s.webp' % name)
        else:
            im.thumbnail((1280, 720), Image.LANCZOS)
            dest = os.path.join(SCN, name + '.webp'); im.save(dest, 'WEBP', quality=80, method=6)
            reg['scene-' + name] = svg_for('assets/art/scenes/%s.webp' % name, True)
        print('scene %-44s %d KB' % (name, os.path.getsize(dest) // 1024))
    # era aliases
    for sid, rel in ERA_SCENES.items():
        name = scene_files.get(rel)
        if name:
            reg[sid] = svg_for('assets/art/scenes/%s.webp' % name, True)
        else:
            print('era scene source missing', sid, rel)

    js = ['/* generated by tools/art/import_atlas.py: hand-made atlas drawings override the old vector art */',
          '(function(){', 'window.ART = window.ART || {};']
    for k in sorted(reg):
        js.append('ART[%s] = %s;' % (json.dumps(k), json.dumps(reg[k])))
    js.append('})();')
    with open(os.path.join(OUT, 'index.js'), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(js) + '\n')
    print('registered', len(reg), 'art ids')


if __name__ == '__main__':
    main()
