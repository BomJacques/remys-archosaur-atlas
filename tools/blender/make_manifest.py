"""Write models.json + CREDITS.md from the licence files and the per-model stats written by dino_normalize.py.
Usage: python make_manifest.py <models-root> <assets/models dir> <scratch dir>"""
import json, os, re, sys

root, out, scratch = sys.argv[1:4]
ORDER = ['trex', 'pterosaur', 'ankylosaurus', 'diplodocus', 'carnotaurus']
FOLDERS = {'trex': 'animated_t-rex_dinosaur_biting_attack_loop', 'pterosaur': 'animated_flying_pteradactal_dinosaur_loop',
           'ankylosaurus': 'ankylosaurus_updated', 'diplodocus': 'dinosaur', 'carnotaurus': 'primal_carnage_carnotaurus'}
TARGET = {'trex': ('lengthM', 12.3), 'pterosaur': ('wingspanM', 6.0), 'ankylosaurus': ('lengthM', 6.5),
          'diplodocus': ('lengthM', 24.0), 'carnotaurus': ('lengthM', 7.5)}
DEFAULT = {'trex': 'Idle', 'pterosaur': 'Fly', 'ankylosaurus': 'Idle', 'diplodocus': 'Idle', 'carnotaurus': 'Idle'}
CUSTOM_IDLE = {'trex', 'pterosaur', 'diplodocus'}
ORIGINAL_CLIPS = {'trex': ['Bite'], 'pterosaur': ['Fly'], 'ankylosaurus': ['Idle'], 'diplodocus': ['Walk', 'Eat high'], 'carnotaurus': ['Idle']}

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
    models.append({
        'id': mid, 'glb': f'{mid}.glb', 'usdz': f'{mid}.usdz', 'poster': f'{mid}-poster.jpg',
        key: val, 'clips': [c['name'] for c in clips], 'clipInfo': clips,
        'defaultClip': DEFAULT[mid], 'usdzClip': 'Idle', 'tris': st['tris'],
        'sizesKB': {'glb': st['glb_kb'], 'usdz': st['usdz_kb'], 'poster': st['poster_kb']},
        'credit': {'title': title, 'author': author, 'authorUrl': author_url, 'url': src, 'license': 'CC BY 4.0',
                   'licenseUrl': 'http://creativecommons.org/licenses/by/4.0/', 'text': text}})
    credits.append((title, text))
json.dump(models, open(os.path.join(out, 'models.json'), 'w', encoding='utf-8'), indent=2, ensure_ascii=False)
with open(os.path.join(out, 'CREDITS.md'), 'w', encoding='utf-8') as f:
    f.write('# 3D model credits\n\nAll five dinosaur models are licensed under '
            'CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/). They were downloaded from Sketchfab and '
            'modified (scaled, re-textured / texture-downsized, animation clips renamed, an idle clip added where '
            'the original had none, converted to GLB and USDZ).\n\n')
    for t, x in credits:
        f.write(f'- {x}\n')
print('wrote models.json and CREDITS.md for', len(models), 'models')
