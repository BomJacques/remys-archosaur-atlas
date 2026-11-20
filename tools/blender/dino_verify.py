"""Re-import the exported GLB (and USDZ) of one model and check size / clips / facing / ground.

  blender.exe -b --factory-startup --python dino_verify.py -- --id trex --out <assets/models> --scratch <dir>
Writes <scratch>/<id>_verify.json and preview sheets <scratch>/<id>_verify_*.jpg
"""
import bpy, sys, os, re, json, math, argparse
import numpy as np
from mathutils import Vector

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dino_lib as L
from dino_normalize import CFG


def skinned():
    return [o for o in bpy.data.objects if o.type == 'MESH' and any(m.type == 'ARMATURE' for m in o.modifiers)]


def measure(arm, meshes, act, n=8):
    L.assign(arm, act)
    res = []
    for f in L.frames_of(act, n):
        L.set_frame(f)
        P = L.eval_points(meshes)
        res.append((P.min(0), P.max(0), P.mean(0)))
    mn = np.min([r[0] for r in res], axis=0); mx = np.max([r[1] for r in res], axis=0)
    cen = np.array([r[2] for r in res])
    return dict(frames=[round(act.frame_range[0], 2), round(act.frame_range[1], 2)],
                union_min=[round(float(x), 3) for x in mn], union_max=[round(float(x), 3) for x in mx],
                union_size=[round(float(x), 3) for x in (mx - mn)],
                per_frame_min_z_median=round(float(np.median([r[0][2] for r in res])), 3),
                centroid_xy_range=[round(float(x), 3) for x in np.ptp(cen[:, :2], axis=0)])


def sheet(arm, meshes, act, out, views):
    L.assign(arm, act)
    a, b = act.frame_range
    L.setup_workbench((320, 240), bg=(0.9, 0.92, 0.94))
    paths = []
    allp = []
    for f in L.frames_of(act, 7):
        L.set_frame(f); allp.append(L.eval_points(meshes))
    P = np.vstack(allp)
    c = (P.min(0) + P.max(0)) / 2
    sz = float((P.max(0) - P.min(0)).max()) * 1.1
    for vi, (vname, d) in enumerate(views):
        for i, f in enumerate(L.frames_of(act, 3)):
            L.set_frame(f)
            L.make_camera(c, d, sz * 2, ortho=sz)
            p = os.path.join(os.path.dirname(out), f"_v{vi}_{i}.png"); L.render_to(p); paths.append(p)
    L.stitch(paths, 4, out)
    for p in paths:
        os.remove(p)


def main():
    argv = sys.argv[sys.argv.index('--') + 1:]
    ap = argparse.ArgumentParser()
    ap.add_argument('--id', required=True); ap.add_argument('--out', required=True); ap.add_argument('--scratch', required=True)
    ap.add_argument('--sheets', action='store_true')
    a = ap.parse_args(argv)
    cfg = CFG[a.id]
    rep = dict(id=a.id)
    L.reset_scene()
    bpy.ops.import_scene.gltf(filepath=os.path.join(a.out, f"{a.id}.glb"))
    arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
    meshes = skinned()
    rep['glb_objects'] = sorted((o.type, o.name) for o in bpy.data.objects)
    rep['glb_arm_scale'] = [round(x, 4) for x in arm.matrix_world.to_scale()]
    rep['glb_actions'] = sorted(act.name for act in bpy.data.actions)
    rep['glb_clips'] = {}
    for act in bpy.data.actions:
        rep['glb_clips'][act.name] = measure(arm, meshes, act)
    # facing via bones (Blender -Y == glTF +Z)
    L.assign(arm, bpy.data.actions[0]); L.set_frame(0)
    def find(rx):
        for pb in arm.pose.bones:
            if re.search(rx, pb.name):
                return (arm.matrix_world @ pb.head)
    hd, tl = find(cfg['face'][0]), find(cfg['face'][1])
    if hd is not None and tl is not None:
        rep['glb_head_minus_tail_blender_y'] = round(float(hd.y - tl.y), 2)
        rep['glb_facing'] = 'glTF +Z (Blender -Y)' if hd.y < tl.y else 'WRONG (Blender +Y)'
    # texture sizes in glb
    rep['glb_images'] = [(i.name, list(i.size), i.file_format) for i in bpy.data.images if i.type == 'IMAGE']
    rep['tris'] = L.tri_count(meshes)
    if a.sheets:
        for act in bpy.data.actions:
            if act.name == cfg['default_clip'] or act.name == 'Idle':
                sheet(arm, meshes, act, os.path.join(a.scratch, f"{a.id}_verify_{act.name.replace(' ', '_')}.jpg"),
                      [('side', (1, 0, 0.2)), ('top', (0, -0.001, 1)), ('front', (0.0, -1, 0.2))])
                break
    # USDZ re-import
    L.reset_scene()
    try:
        bpy.ops.wm.usd_import(filepath=os.path.join(a.out, f"{a.id}.usdz"))
        arm = [o for o in bpy.data.objects if o.type == 'ARMATURE']
        ms = [o for o in bpy.data.objects if o.type == 'MESH']  # USD import: skin is applied via UsdSkel -> armature modifier
        rep['usd_reimport_objects'] = sorted((o.type, o.name) for o in bpy.data.objects)
        P = L.eval_points(ms)
        rep['usd_reimport_frame_start_size'] = [round(float(x), 3) for x in (P.max(0) - P.min(0))]
        rep['usd_reimport_min'] = [round(float(x), 3) for x in P.min(0)]
        rep['usd_reimport_max'] = [round(float(x), 3) for x in P.max(0)]
        sc = bpy.context.scene
        rep['usd_reimport_frames'] = [sc.frame_start, sc.frame_end]
        # animate a bit: size at mid frame
        L.set_frame((sc.frame_start + sc.frame_end) / 2)
        P2 = L.eval_points(ms)
        if arm:
            ar = arm[0]
            sc2 = bpy.context.scene
            L.assign(ar, ar.animation_data.action) if ar.animation_data and ar.animation_data.action else None
            L.set_frame(sc2.frame_start)
            def findu(rx):
                rx = rx.replace('\.', '_')
                for pb in ar.pose.bones:
                    if re.search(rx, pb.name):
                        return ar.matrix_world @ pb.head
            hu, tu = findu(cfg['face'][0]), findu(cfg['face'][1])
            if hu is not None and tu is not None:
                rep['usd_reimport_head_minus_tail_y'] = round(float(hu.y - tu.y), 2)
                rep['usd_facing'] = 'USD +Z (Blender -Y) OK' if hu.y < tu.y else 'WRONG'
        rep['usd_reimport_mid_size'] = [round(float(x), 3) for x in (P2.max(0) - P2.min(0))]
    except Exception as e:
        rep['usd_reimport_error'] = repr(e)
    with open(os.path.join(a.scratch, f"{a.id}_verify.json"), 'w') as fh:
        json.dump(rep, fh, indent=1)
    print("[verify]", json.dumps(rep)[:3000])


if __name__ == '__main__':
    main()
