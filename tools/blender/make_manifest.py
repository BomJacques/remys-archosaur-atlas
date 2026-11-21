"""Write models.json + CREDITS.md from the licence files and the per-model stats written by dino_normalize.py.
Usage: python make_manifest.py <models-root> <assets/models dir> <scratch dir>"""
import json, os, re, sys

root, out, scratch = sys.argv[1:4]
ORDER = ['trex', 'pterosaur', 'ankylosaurus', 'diplodocus', 'carnotaurus', 'raptor', 'pteranodon', 'pliosaur']
FOLDERS = {'trex': 'animated_t-rex_dinosaur_biting_attack_loop', 'pterosaur': 'animated_flying_pteradactal_dinosaur_loop',
           'ankylosaurus': 'ankylosaurus_updated', 'diplodocus': 'dinosaur', 'carnotaurus': 'primal_carnage_carnotaurus',
           'raptor': 'jurassic_world_raptor2jurassicworldmoviemaker', 'pteranodon': 'male_pteranodon_-_natural_locomotion_rig',
           'pliosaur': 'pliosaur_jurassic_sea_predator_-_animated'}
TARGET = {'trex': ('lengthM', 12.3), 'pterosaur': ('wingspanM', 6.0), 'ankylosaurus': ('lengthM', 6.5),
          'diplodocus': ('lengthM', 24.0), 'carnotaurus': ('lengthM', 7.5), 'raptor': ('lengthM', 2.0),
          'pteranodon': ('wingspanM', 6.0), 'pliosaur': ('lengthM', 10.0)}
DEFAULT = {'trex': 'Idle', 'pterosaur': 'Fly', 'ankylosaurus': 'Idle', 'diplodocus': 'Idle', 'carnotaurus': 'Idle',
           'raptor': 'Idle', 'pteranodon': 'Fly', 'pliosaur': 'Swim'}
CUSTOM_IDLE = {'trex', 'pterosaur', 'diplodocus', 'raptor'}
MORPH_RIG = {'raptor'}      # vertex-cache animation (morph targets), no skeleton
ORIGINAL_CLIPS = {'trex': ['Bite'], 'pterosaur': ['Fly'], 'ankylosaurus': ['Idle'], 'diplodocus': ['Walk', 'Eat high'], 'carnotaurus': ['Idle'],
                 'raptor': ['Walk'], 'pteranodon': ['Fly', 'Glide', 'Idle', 'Walk', 'Snap'], 'pliosaur': ['Swim', 'Dash', 'Idle', 'Bite']}

models, credits = [], []
for mid in ORDER:
    lic = open(os.path.join(root, FOLDERS[mid], 'license.txt'), encoding='utf-8').read()
    title = re.search(r'\* title:\s*(.+)', lic).group(1).strip()
    src = re.search(r'\* source:\s*(\S+)', lic).group(1).strip()
    am = re.search(r'\* author:\s*(.+?)\s*\((https?://[^)]+)\)', lic)
    author, author_url = am.group(1).strip(), am.group(2).strip()
    text = re.search(r'^This work is based on .*$', lic, re.M).group(0).strip()
    text += ' Scaled, re-textured and converted for AR.'
    st = json.load(open(os.path.join(scratch, f'{mid}_stats.json')))
    clips = []
    for name, c in st['clips'].items():
        a, b = c['frames']
        clips.append(dict(name=name, frames=[a, b], seconds=round((b - a) / 24, 2),
                          source='custom' if (name == 'Idle' and mid in CUSTOM_IDLE) else 'original'))
    key, val = TARGET[mid]
    extra = {}
    for v, name in (('mini', 'usdzMini'), ('far', 'usdzFar')):
        fp = os.path.join(scratch, f'{mid}_{v}_stats.json')
        if os.path.exists(fp):
            extra[name] = (f'{mid}-{v}.usdz', json.load(open(fp))['usdz_kb'])
    models.append({
        'id': mid, 'rig': 'morph' if mid in MORPH_RIG else 'skeleton', 'glb': f'{mid}.glb', 'usdz': f'{mid}.usdz', 'poster': f'{mid}-poster.jpg',
        key: val, 'clips': [c['name'] for c in clips], 'clipInfo': clips,
        'defaultClip': DEFAULT[mid], 'usdzClip': 'Idle', 'tris': st['tris'],
        'sizesKB': dict({'glb': st['glb_kb'], 'usdz': st['usdz_kb'], 'poster': st['poster_kb']},
                        **{k: v[1] for k, v in extra.items()}),
        **{k: v[0] for k, v in extra.items()},
        'credit': {'title': title, 'author': author, 'authorUrl': author_url, 'url': src, 'license': 'CC BY 4.0',
                   'licenseUrl': 'http://creativecommons.org/licenses/by/4.0/', 'text': text}})
    credits.append((title, text))
json.dump(models, open(os.path.join(out, 'models.json'), 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
with open(os.path.join(out, 'CREDITS.md'), 'w', encoding='utf-8') as f:
    f.write('# 3D model credits\n\nAll %d models (dinosaurs and other prehistoric reptiles) are licensed under '
            'CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/). They were downloaded from Sketchfab and '
            'modified (scaled, re-textured / texture-downsized, animation clips renamed, an idle clip added where '
            'the original had none, converted to GLB and USDZ; the raptor vertex animation was re-encoded as '
            'compressed morph targets and made to play in place).\n\n' % len(credits))
    for t, x in credits:
        f.write(f'- {x}\n')
print('wrote models.json and CREDITS.md for', len(models), 'models')
