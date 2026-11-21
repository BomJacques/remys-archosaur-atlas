"""Normalise a downloaded Sketchfab model whose animation is a *vertex cache* (glTF morph targets, no skeleton).

Used for 'raptor' (CFG entry has a 'morph' dict).  dino_normalize.main() delegates here; it can also be run directly:
  blender.exe -b --factory-startup --python dino_normalize_morph.py -- --id raptor --models-root <dir> --out <assets/models> --scratch <dir> [--variant mini|far]

What it does
  1. imports the glTF, samples the evaluated (world space) mesh at every frame of the 125-pose run sequence
  2. finds the stride period, removes the travelling root motion (linear detrend) and closes the loop
  3. picks a standing pose for the Idle clip (basis shape = that pose) and builds three synthetic idle shape keys
     (tail sway, head turn, breathing) by bending / inflating the standing pose
  4. compresses the run cycle with PCA into K morph targets (+ one 'mean' target) -> small GLB
  5. rebuilds one joined mesh (5 material slots), keys the clips as shape-key actions, then writes poster / GLB / USDZ
"""
import bpy, sys, os, re, json, math, argparse
import numpy as np
from mathutils import Vector, Matrix

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dino_lib as L
import dino_normalize as D

FPS = 24


def log(*a):
    print("[dino-morph]", *a, flush=True)


def smooth(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3 - 2 * x)


# ---------------------------------------------------------------------------
def import_sources(gltf):
    L.reset_scene()
    bpy.ops.import_scene.gltf(filepath=gltf)
    ms = [o for o in bpy.data.objects if o.type == 'MESH' and o.data.shape_keys]
    ms.sort(key=lambda o: o.name)
    return ms


def sample_world(ms, frames):
    out = []
    for f in frames:
        L.set_frame(f)
        out.append(L.eval_points(ms))
    return np.array(out, dtype=np.float64)


def read_topology(ms):
    """Concatenate source meshes -> faces (global vertex ids), loop uvs, material per face, material list."""
    faces, uvs, mats, matidx = [], [], [], []
    off = 0
    uv_fix = []
    for o in ms:
        me = o.data
        n = len(me.vertices)
        lv = np.empty(len(me.loops), dtype=np.int32)
        me.loops.foreach_get('vertex_index', lv)
        ls = np.empty(len(me.polygons), dtype=np.int32); lt = np.empty(len(me.polygons), dtype=np.int32)
        me.polygons.foreach_get('loop_start', ls); me.polygons.foreach_get('loop_total', lt)
        uv = np.empty(len(me.loops) * 2, dtype=np.float32)
        me.uv_layers[0].data.foreach_get('uv', uv)
        uv = uv.reshape(-1, 2).astype(np.float64)
        mat = o.material_slots[0].material
        # glTF KHR_texture_transform comes in as a Mapping node (the raptor body skin flips V): bake it into the UVs
        for nd in mat.node_tree.nodes:
            if nd.type == 'MAPPING':
                sc, lc = nd.inputs['Scale'].default_value, nd.inputs['Location'].default_value
                uv = np.stack([uv[:, 0] * sc[0] + lc[0], uv[:, 1] * sc[1] + lc[1]], axis=1)
                uv -= np.floor(uv.min(0))
                log('baked uv mapping for', mat.name, tuple(sc), tuple(lc))
                break
        if mat not in mats:
            mats.append(mat)
        mi = mats.index(mat)
        for s, t in zip(ls, lt):
            faces.append(tuple(int(lv[s + k]) + off for k in range(t)))
            matidx.append(mi)
        uvs.append(uv)
        off += n
    return faces, np.vstack(uvs), np.array(matidx, dtype=np.int32), mats


# ---------------------------------------------------------------------------
def find_cycle(W, period, t0):
    """Detrended stride cycle frames t0 .. t0+period (inclusive, last == first)."""
    n = int(round(period))
    cen = W[:, :, :2].mean(1)
    v = (cen[t0 + n] - cen[t0]) / n               # travel per frame (xy), constant over a stride
    R = []
    for k in range(n + 1):
        P = W[t0 + k].copy()
        P[:, :2] -= v * (t0 + k)
        R.append(P)
    R = np.array(R)
    gap = R[n] - R[0]                              # small residual mismatch -> spread linearly over the loop
    for k in range(n + 1):
        R[k] -= gap * (k / n)
    return R, v


def pick_idle(R):
    """Return index (0..n-1) of the most 'standing' pose: feet together under the hips, tail level."""
    H = R[:, :, 2].max() - R[:, :, 2].min()
    scores = []
    for k in range(len(R) - 1):
        P = R[k]
        low = P[:, 2] < P[:, 2].min() + 0.12 * H
        spread = P[low, 1].max() - P[low, 1].min()
        both = abs(P[low & (P[:, 0] > 0), 2].min() - P[low & (P[:, 0] < 0), 2].min()) if (low & (P[:, 0] > 0)).any() and (low & (P[:, 0] < 0)).any() else 9
        scores.append(spread + 3 * both)
    return int(np.argmin(scores)), scores


def synthetic_keys(P0, nrm):
    """Three small idle motions as full-mesh deltas on the standing pose P0 (metres, facing -Y)."""
    ymin, ymax = P0[:, 1].min(), P0[:, 1].max()
    zmin, zmax = P0[:, 2].min(), P0[:, 2].max()
    H = zmax - zmin
    low = P0[:, 2] < zmin + 0.12 * H
    y_hip = float(P0[low, 1].mean())               # feet sit under the hips
    def bend(w, centre, deg):
        a = np.radians(deg) * w
        c, s = np.cos(a), np.sin(a)
        dx, dy = P0[:, 0] - centre[0], P0[:, 1] - centre[1]
        D = np.zeros_like(P0)
        D[:, 0] = c * dx - s * dy - dx
        D[:, 1] = s * dx + c * dy - dy
        return D
    # tail: everything behind the hips swings about a vertical axis through the hips, growing towards the tip
    s_tail = (P0[:, 1] - y_hip) / max(ymax - y_hip, 1e-6)
    tail = bend(smooth(s_tail) ** 1.5, (0.0, y_hip), 9.0)
    # head: neck + head (high and in front of the shoulders) turn about a vertical axis at the base of the neck
    y_neck = ymin + 0.36 * (y_hip - ymin)
    z_neck = zmin + 0.52 * H
    w_head = smooth((y_neck - P0[:, 1]) / (0.5 * (y_neck - ymin))) * smooth((P0[:, 2] - z_neck) / (0.14 * H))
    head = bend(w_head, (0.0, y_neck), 12.0)
    # breathing: the ribcage swells a little along the surface normal
    cy = y_hip - 0.30 * (y_hip - ymin); cz = zmin + 0.62 * H
    d2 = ((P0[:, 1] - cy) / (0.20 * (ymax - ymin))) ** 2 + ((P0[:, 2] - cz) / (0.22 * H)) ** 2
    breathe = nrm * (0.014 * np.exp(-d2))[:, None]
    return dict(tail_sway=tail, head_turn=head, breathe=breathe), dict(y_hip=y_hip, y_neck=y_neck)


# ---------------------------------------------------------------------------
def build_object(name, base, faces, uv, matidx, mats):
    me = bpy.data.meshes.new(name)
    me.from_pydata([tuple(p) for p in base], [], faces)
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    layer = me.uv_layers.new(name='UVMap')
    layer.data.foreach_set('uv', uv.astype(np.float32).ravel())
    for m in mats:
        me.materials.append(m)
    me.polygons.foreach_set('material_index', matidx)
    me.update()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def add_keys(ob, base, deltas):
    ob.shape_key_add(name='Basis', from_mix=False)
    for name, d in deltas.items():
        kb = ob.shape_key_add(name=name, from_mix=False)
        kb.slider_min, kb.slider_max = -10.0, 10.0
        kb.data.foreach_set('co', (base + d).astype(np.float32).ravel())
    return ob.data.shape_keys


def make_clip(key, name, series, frames, interp='LINEAR'):
    """series: {key_name: array over frames}."""
    act = bpy.data.actions.new(name)
    slot = act.slots.new(id_type='KEY', name=key.name)
    if key.animation_data is None:
        key.animation_data_create()
    key.animation_data.action = act
    key.animation_data.action_slot = slot
    layer = act.layers.new('Layer')
    strip = layer.strips.new(type='KEYFRAME')
    cb = strip.channelbag(slot, ensure=True)
    for kn, vals in series.items():
        fc = cb.fcurves.new(f'key_blocks["{kn}"].value', index=0)
        for f, v in zip(frames, vals):
            fc.keyframe_points.insert(float(f), float(v), options={'FAST'})
        for kp in fc.keyframe_points:
            kp.interpolation = interp
        fc.update()
    act.use_fake_user = True
    return act


def apply_weights(key, w):
    for kn, v in w.items():
        key.key_blocks[kn].value = v


# ---------------------------------------------------------------------------
def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument('--id', required=True); ap.add_argument('--models-root', required=True)
    ap.add_argument('--out', required=True); ap.add_argument('--scratch', required=True)
    ap.add_argument('--variant', choices=['mini', 'far'], default=None)
    ap.add_argument('--yaw', type=float, default=None)
    ap.add_argument('--sheet', action='store_true', help='debug: write a contact sheet of the stride cycle')
    args = ap.parse_args(argv)
    mid = args.id
    cfg = D.CFG[mid]
    mc = cfg['morph']
    os.makedirs(args.out, exist_ok=True)
    scratch = os.path.join(args.scratch, mid)
    os.makedirs(scratch, exist_ok=True)
    stats = dict(id=mid)

    ms = import_sources(os.path.join(args.models_root, cfg['folder'], 'scene.gltf'))
    faces, uv, matidx, mats = read_topology(ms)
    sc = bpy.context.scene
    frames_src = list(range(0, 251))
    log('sampling', len(frames_src), 'frames of', sum(len(o.data.vertices) for o in ms), 'verts')
    W = sample_world(ms, frames_src)                # (T, N, 3) raw world coords, Z up, head towards -Y
    n_cyc = int(round(mc['period']))
    t0 = mc['start'] - frames_src[0]
    R, vtrav = find_cycle(W, mc['period'], t0)       # (n+1, N, 3)
    stats['travel_raw_per_frame'] = [float(x) for x in vtrav]
    stats['loop_gap_applied'] = float(np.abs(W[t0 + n_cyc] - W[t0]).max())
    if cfg['yaw'] or args.yaw:
        a = math.radians(args.yaw if args.yaw is not None else cfg['yaw'])
        Rz = np.array([[math.cos(a), -math.sin(a), 0], [math.sin(a), math.cos(a), 0], [0, 0, 1]])
        R = R @ Rz.T
    iidx, scores = pick_idle(R)
    if mc.get('idle_index') is not None:
        iidx = mc['idle_index']
    log('idle pose = cycle frame', iidx)
    stats['idle_cycle_frame'] = iidx
    P0 = R[iidx].copy()
    # --- scale / place (length mode on the standing pose; feet on y=0) ---
    ext = P0.max(0) - P0.min(0)
    s = cfg['target'] / float(max(ext[0], ext[1]))
    ctr = (P0.min(0) + P0.max(0)) / 2
    shift = np.array([-ctr[0], -ctr[1], -float(P0[:, 2].min())])
    def G(P):
        return (P - ctr * np.array([1, 1, 0])) * s + np.array([0, 0, -P0[:, 2].min() * s])
    R = np.array([G(P) for P in R]); P0 = R[iidx].copy()
    stats['scale'] = dict(factor=s, ref_extent_raw=float(max(ext[0], ext[1])), idle_extent_xyz_raw=[float(x) for x in ext])
    log('scale', s)
    # --- keys ---
    nrm = None
    base = P0
    mean_run = R[:n_cyc].mean(0)
    A = (R[:n_cyc] - mean_run).reshape(n_cyc, -1)
    U, S, Vt = np.linalg.svd(A, full_matrices=False)
    K = mc['K']
    sd = S[:K] / math.sqrt(n_cyc)
    pcs = (Vt[:K] * sd[:, None]).reshape(K, -1, 3)
    coef = (A @ Vt[:K].T) / sd                        # (n_cyc, K) weights
    recon = mean_run[None] + np.einsum('tk,knc->tnc', coef, pcs)
    err = np.abs(recon - R[:n_cyc])
    stats['pca'] = dict(K=K, max_err_m=float(err.max()), rms_err_m=float(np.sqrt((err ** 2).mean())),
                        energy=float((S[:K] ** 2).sum() / (S ** 2).sum()))
    log('PCA', stats['pca'])
    # normals of the idle pose for the breathing key
    tmp = build_object('tmp', base, faces, uv, matidx, mats)
    nn = np.empty(len(base) * 3, dtype=np.float32); tmp.data.vertex_normals.foreach_get('vector', nn)
    nrm = nn.reshape(-1, 3).astype(np.float64)
    bpy.data.objects.remove(tmp, do_unlink=True)
    syn, synmeta = synthetic_keys(P0, nrm)
    stats['synthetic'] = synmeta
    deltas = {'run_mean': mean_run - base}
    for k in range(K):
        deltas[f'run_pc{k:02d}'] = pcs[k]
    deltas.update(syn)
    # --- clips (weights per frame) ---
    nI = mc['idle_frames']
    ti = np.arange(nI + 1)
    idle_w = {'tail_sway': np.sin(2 * np.pi * ti / nI),
              'head_turn': 0.8 * np.sin(2 * np.pi * ti / nI * 2 + 0.9),
              'breathe': 0.5 - 0.5 * np.cos(2 * np.pi * ti / nI * 3)}
    run_w = {'run_mean': np.ones(n_cyc + 1)}
    cc = np.vstack([coef, coef[:1]])
    for k in range(K):
        run_w[f'run_pc{k:02d}'] = cc[:, k]
    clips = {'Idle': (idle_w, nI, 'BEZIER'), 'Walk': (run_w, n_cyc, 'LINEAR')}
    zero = lambda n: np.zeros(n + 1)
    for nm in deltas:
        for cn, (w, n, _) in clips.items():
            w.setdefault(nm, zero(n))
    # reconstructed run pose / idle pose for stats
    def pose(w_at):
        P = base.copy()
        for nm, v in w_at.items():
            P += v * deltas[nm]
        return P
    runP = np.array([pose({nm: clips['Walk'][0][nm][f] for nm in deltas}) for f in range(n_cyc + 1)])
    idleP = np.array([pose({nm: clips['Idle'][0][nm][f] for nm in deltas}) for f in range(0, nI + 1, 4)])
    stats['final_ext_run'] = [float(x) for x in (runP.max((0, 1)) - runP.min((0, 1)))]
    stats['final_ext_idle'] = [float(x) for x in (idleP.max((0, 1)) - idleP.min((0, 1)))]
    stats['idle_bounds_min'] = [float(x) for x in idleP.min((0, 1))]
    stats['run_bounds_min'] = [float(x) for x in runP.min((0, 1))]
    stats['run_min_z_median'] = float(np.median(runP[:, :, 2].min(1)))
    stats['run_loop_closure_max_m'] = float(np.abs(runP[-1] - runP[0]).max())
    stats['tris'] = int(sum(len(f) - 2 for f in faces))
    log('final ext run', stats['final_ext_run'], 'idle', stats['final_ext_idle'])
    stats['clips'] = {n: dict(frames=[0.0, float(nf)],
                              max_vertex_travel_m=round(float(np.abs((runP if n == 'Walk' else idleP) - base).max()), 2))
                      for n, (_, nf, _i) in clips.items()}

    if args.sheet:
        L.setup_workbench((320, 240), bg=(0.9, 0.92, 0.94))
        ob0 = build_object('raptor_dbg', base, faces, uv, matidx, mats)
        paths = []
        for i, k in enumerate(range(0, n_cyc, max(1, n_cyc // 12))):
            ob0.data.vertices.foreach_set('co', R[k].astype(np.float32).ravel()); ob0.data.update()
            c = (R[k].min(0) + R[k].max(0)) / 2
            L.make_camera(c, (1, 0, 0.15), 10, ortho=3.0)
            p = os.path.join(scratch, f'_c{i}.png'); L.render_to(p); paths.append(p)
            if i >= 11: break
        L.stitch(paths, 4, os.path.join(args.scratch, f'{mid}_cycle.jpg'))
        log('cycle scores', [round(x, 2) for x in scores], 'idle', iidx)
        return

    # --- rebuild materials (downsized textures) on the old source objects' materials, then new joined mesh ---
    meshes_tmp = ms
    stats['textures'] = D.rebuild_materials(meshes_tmp, mid, os.path.join(scratch, 'tex'))
    mats = [m for m in mats]
    # drop the source objects
    for o in list(ms):
        bpy.data.objects.remove(o, do_unlink=True)
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)

    # --- variant transform ---
    vbase, vdeltas = base, deltas
    if args.variant == 'mini':
        vbase = base * 0.1
        vdeltas = {k: v * 0.1 for k, v in deltas.items()}
    elif args.variant == 'far':
        ymin = float(idleP[:, :, 1].min())
        vbase = base + np.array([0, -ymin, 0])
        stats['far_shift_y_m'] = -ymin

    ob = build_object(mid, vbase, faces, uv, matidx, mats)
    key = add_keys(ob, vbase, vdeltas)
    acts = {}
    for cn, (w, n, interp) in clips.items():
        acts[cn] = make_clip(key, cn, w, list(range(n + 1)), interp)

    def usdz_export(path):
        key.animation_data.action = acts[cfg['usdz_clip']]
        key.animation_data.action_slot = acts[cfg['usdz_clip']].slots[0]
        a, b = acts[cfg['usdz_clip']].frame_range
        sc.frame_start = int(math.floor(a)); sc.frame_end = max(sc.frame_start + 1, int(math.floor(b - 0.5)))
        bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
        bpy.context.view_layer.objects.active = ob
        kw = dict(selected_objects_only=True, export_animation=True, export_hair=False, export_uvmaps=True,
                  export_mesh_colors=False, export_normals=True, export_materials=True, export_armatures=True,
                  only_deform_bones=False, export_shapekeys=True, use_instancing=False,
                  generate_preview_surface=True, generate_materialx_network=False, convert_orientation=True,
                  export_global_forward_selection='NEGATIVE_Z', export_global_up_selection='Y',
                  export_textures_mode='NEW', overwrite_textures=True, relative_paths=True,
                  triangulate_meshes=True, usdz_downscale_size='KEEP', convert_scene_units='METERS',
                  export_lights=False, export_cameras=False, export_custom_properties=False,
                  convert_world_material=False, export_curves=False, export_points=False, export_volumes=False,
                  export_subdivision='IGNORE', evaluation_mode='RENDER')
        bpy.ops.wm.usd_export(filepath=path, **kw)

    if args.variant:
        vpath = os.path.join(args.out, f"{mid}-{args.variant}.usdz")
        if os.path.exists(vpath):
            os.remove(vpath)
        usdz_export(vpath)
        stats['variant'] = args.variant
        stats['usdz_validation'] = D.validate_usdz(vpath, cfg)
        stats['usdz_kb'] = round(os.path.getsize(vpath) / 1024)
        with open(os.path.join(args.scratch, f"{mid}_{args.variant}_stats.json"), 'w') as fh:
            json.dump(stats, fh, indent=1, default=float)
        log('DONE variant', mid, args.variant, stats['usdz_kb'], 'KB')
        return

    # --- poster ---
    def assign_key(arm, action):
        key.animation_data.action = action
        key.animation_data.action_slot = action.slots[0]
    L.assign = assign_key
    poster = os.path.join(args.out, f"{mid}-poster.jpg")
    D.render_poster(None, [ob], cfg, poster, scratch, mid)
    # --- GLB ---
    glb = os.path.join(args.out, f"{mid}.glb")
    key.animation_data.action = None
    # the glTF exporter only picks up shape-key clips from NLA tracks (one track per clip, named after the clip)
    for cn, act in acts.items():
        tr = key.animation_data.nla_tracks.new(); tr.name = cn
        st = tr.strips.new(cn, 0, act); st.name = cn
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.export_scene.gltf(
        filepath=glb, export_format='GLB', use_selection=True, export_yup=True,
        export_animations=True, export_animation_mode='NLA_TRACKS', export_force_sampling=True,
        export_optimize_animation_size=True, export_image_format='AUTO', export_jpeg_quality=85,
        export_skins=False, export_morph=True, export_morph_normal=False, export_morph_tangent=False,
        export_cameras=False, export_lights=False, export_apply=False, export_attributes=False, export_extras=False,
        export_try_sparse_sk=True)
    for tr in list(key.animation_data.nla_tracks):
        key.animation_data.nla_tracks.remove(tr)
    # --- USDZ ---
    usdz = os.path.join(args.out, f"{mid}.usdz")
    if os.path.exists(usdz):
        os.remove(usdz)
    usdz_export(usdz)
    stats['usdz_validation'] = D.validate_usdz(usdz, cfg)
    stats['glb_kb'] = round(os.path.getsize(glb) / 1024)
    stats['usdz_kb'] = round(os.path.getsize(usdz) / 1024)
    stats['poster_kb'] = round(os.path.getsize(poster) / 1024)
    with open(os.path.join(args.scratch, f"{mid}_stats.json"), 'w') as fh:
        json.dump(stats, fh, indent=1, default=float)
    log('DONE', mid, stats['glb_kb'], 'KB glb,', stats['usdz_kb'], 'KB usdz')


if __name__ == '__main__':
    main()
