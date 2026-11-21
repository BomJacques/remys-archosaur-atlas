"""Normalise one downloaded Sketchfab dinosaur glTF for the dino web app + iPad AR.

Run (headless):
  blender.exe -b --factory-startup --python dino_normalize.py -- --id trex \
      --models-root <dir with the extracted folders> --out <assets/models> --scratch <dir>

Produces <id>.glb, <id>.usdz, <id>-poster.jpg and <scratch>/<id>_stats.json.
See run_all.ps1 for the full batch.
"""
import bpy, sys, os, re, json, math, zipfile, argparse, shutil
import numpy as np
from mathutils import Vector, Matrix, Quaternion

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dino_lib as L

meshes_global = []

# ---------------------------------------------------------------------------
# Per-model configuration
#   mode      : 'length' (longest horizontal extent of the standing body) or 'span' (wingspan)
#   yaw       : degrees about +Z applied so the animal faces Blender -Y (== glTF +Z)
#   clips     : original action name -> kid friendly clip name (anything else with length is dropped too)
#   idle      : None (an original clip is already an idle), or a recipe for a custom 'Idle' clip
#   usdz_clip : clip that is baked into the USDZ
#   poster    : (clip, frame) for the poster render
# ---------------------------------------------------------------------------
CFG = {
    'trex': dict(
        folder='animated_t-rex_dinosaur_biting_attack_loop', target=12.3, mode='length', yaw=0,
        clips={'Animation': 'Bite'}, default_clip='Idle', usdz_clip='Idle', ref_clip='Idle',
        idle=dict(kind='proc', donor=('Bite', 200), spine=r'^bn_Spine\d?\.', neck=r'^bn_Neck\d?\.',
                  head=r'^bn_Head\.', tail=r'^bn_Tail\d+\.'),
        face=(r'^bn_Head\.', r'^bn_Tail08\.'), poster=('Idle', 0)),
    'pterosaur': dict(
        folder='animated_flying_pteradactal_dinosaur_loop', target=6.0, mode='span', yaw=0,
        clips={'Animation': 'Fly'}, default_clip='Fly', usdz_clip='Idle', ref_clip='Fly',
        idle=dict(kind='damp', source='Fly', k=0.22),
        face=(r'^head\.', r'^pelvis\.'), poster=('Fly', 0), hover=0.3),
    'ankylosaurus': dict(
        folder='ankylosaurus_updated', target=6.5, mode='length', yaw=0,
        clips={'Animation': 'Idle'}, default_clip='Idle', usdz_clip='Idle', ref_clip='Idle', idle=None,
        face=(r'^Head_', r'^Tail5_'), poster=('Idle', 1)),
    'diplodocus': dict(
        folder='dinosaur', target=24.0, mode='length', yaw=0,
        clips={'Take 001': 'Walk', 'Diplodocus_Eat_High': 'Eat high'}, default_clip='Idle', usdz_clip='Idle',
        ref_clip='Idle',
        idle=dict(kind='proc', donor=('Eat high', 0), spine=r'^Diplodocus_(Spine\d|Ribcage)_0',
                  neck=r'^Diplodocus_Neck\d+_0\d+_\d+$', head=r'^Diplodocus_Head_016',
                  tail=r'^Diplodocus_Tail\d+_\d+_\d+$'),
        face=(r'^Diplodocus_Head_016', r'^Diplodocus_Tail15_'), poster=('Idle', 0), rebind=('Idle', 0)),
    'carnotaurus': dict(
        folder='primal_carnage_carnotaurus', target=7.5, mode='length', yaw=180,
        clips={'C4D Animation Take': 'Idle'}, default_clip='Idle', usdz_clip='Idle', ref_clip='Idle', idle=None,
        face=(r'^center_head_', r'^center_tail5_'), poster=('Idle', 20)),
}

TEX_MAX = 1024
NORMAL_MAX = 1024
SAMPLES = 12


def log(*a):
    print("[dino]", *a, flush=True)


def sanitize(n):
    return re.sub(r'[^A-Za-z0-9_]', '_', n)


# ---------------------------------------------------------------------------
def sample_clip(arm, meshes, action, n=SAMPLES):
    L.assign(arm, action)
    out = []
    for f in L.frames_of(action, n):
        L.set_frame(f)
        out.append(L.eval_points(meshes))
    return out


def rotz(deg):
    return Matrix.Rotation(math.radians(deg), 4, 'Z')


def apply_pts(M, P):
    m = np.array(M)
    return P @ m[:3, :3].T + m[:3, 3]


def measure_scale(arm, meshes, cfg, ref_action):
    """Return (scale, details) from evaluated mesh at several frames + rest pose."""
    R = rotz(cfg['yaw'])
    frames = [apply_pts(R, P) for P in sample_clip(arm, meshes, ref_action, 48 if cfg['mode'] == 'span' else SAMPLES)]
    ex = np.array([P.max(0) - P.min(0) for P in frames])
    if cfg['mode'] == 'length':
        per = ex[:, :2].max(1)
        ref = float(np.median(per))
        info = dict(clip_extent_min=float(per.min()), clip_extent_median=ref, clip_extent_max=float(per.max()))
    else:
        per = ex[:, 0]
        ref = float(per.max())
        info = dict(clip_extent_min=float(per.min()), clip_extent_median=float(np.median(per)), clip_extent_max=ref)
    # rest pose
    arm.animation_data.action = None
    arm.data.pose_position = 'REST'
    bpy.context.view_layer.update()
    Pr = apply_pts(R, L.eval_points(meshes))
    er = Pr.max(0) - Pr.min(0)
    info['rest_extent_xyz'] = [float(x) for x in er]
    info['rest_extent_used'] = float(er[:2].max() if cfg['mode'] == 'length' else er[0])
    arm.data.pose_position = 'POSE'
    return cfg['target'] / ref, ref, info


# ---------------------------------------------------------------------------
def capture_static_pose(arm):
    out = {}
    for pb in arm.pose.bones:
        out[pb.name] = dict(location=list(pb.location), rotation_quaternion=list(pb.rotation_quaternion), scale=list(pb.scale))
    return out


def bake_static_pose(arm, static, action):
    """Some rigs hold non-default static poses on bones that have no keys (e.g. the carnotaurus 'Idle_01' bone is
    rotated -90 deg). Exporters reset un-keyed bones to the rest pose, which breaks the rig. Key them explicitly."""
    cb = action.layers[0].strips[0].channelbags[0]
    have = {(f.data_path, f.array_index) for f in cb.fcurves}
    a, b = action.frame_range
    defaults = dict(location=[0, 0, 0], rotation_quaternion=[1, 0, 0, 0], scale=[1, 1, 1])
    n = 0
    for bone, props in static.items():
        for prop, vals in props.items():
            if all(abs(v - d) < 1e-5 for v, d in zip(vals, defaults[prop])):
                continue
            path = f'pose.bones["{bone}"].{prop}'
            for i, v in enumerate(vals):
                if (path, i) in have:
                    continue
                fc = cb.fcurves.new(path, index=i, group_name=bone)
                fc.keyframe_points.insert(a, v)
                fc.keyframe_points.insert(b, v)
                n += 1
    return n


def rebind_to_pose(arm, meshes, clip, frame):
    """Make the bind/rest pose equal to `clip` at `frame` (so glTF POSITION bounds / USD extents describe the standing
    animal). Meshes get the pose applied, the armature gets 'Apply Pose as Rest Pose', and every action is re-sampled
    (one key per frame, linear) relative to the new rest pose."""
    acts = list(bpy.data.actions)
    depth = {}
    def d(b):
        n = 0
        while b.parent:
            b = b.parent; n += 1
        return n
    order = sorted(arm.data.bones, key=d)
    order_names = [b.name for b in order]
    # 1. record desired armature-space pose matrices for every action frame (old rig)
    rec = {}
    for a in acts:
        L.assign(arm, a)
        lo, hi = int(math.floor(a.frame_range[0])), int(math.ceil(a.frame_range[1]))
        frames = list(range(lo, hi + 1))
        mats = []
        for f in frames:
            L.set_frame(f)
            mats.append({pb.name: pb.matrix.copy() for pb in arm.pose.bones})
        rec[a.name] = (frames, mats)
    log('rebind: recorded')
    # reference mesh bounds in the target pose
    L.assign(arm, bpy.data.actions[clip]); L.set_frame(frame)
    ref = L.eval_points(meshes)
    # 2. bake the pose into the meshes
    for m in meshes:
        mod = [x for x in m.modifiers if x.type == 'ARMATURE'][0]
        with bpy.context.temp_override(object=m, active_object=m, selected_objects=[m]):
            bpy.ops.object.modifier_apply(modifier=mod.name)
        nm = m.modifiers.new('Armature', 'ARMATURE')
        nm.object = arm
    log('rebind: meshes baked')
    # 3. pose -> rest
    bpy.ops.object.select_all(action='DESELECT')
    arm.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.mode_set(mode='POSE')
    bpy.ops.pose.select_all(action='SELECT')
    bpy.ops.pose.armature_apply(selected=False)
    bpy.ops.object.mode_set(mode='OBJECT')
    log('rebind: rest applied')
    # 4. re-key every action relative to the new rest pose (re-fetch bones: edit-mode toggling invalidated references)
    order = [arm.data.bones[n] for n in order_names]
    for a in acts:
        frames, mats = rec[a.name]
        oldname = a.name
        na = bpy.data.actions.new(oldname + '_new')
        slot = na.slots.new(id_type='OBJECT', name=arm.name)
        layer = na.layers.new('Layer')
        strip = layer.strips.new(type='KEYFRAME')
        cb = strip.channelbag(slot, ensure=True)
        data = {b.name: dict(location=[], rotation_quaternion=[], scale=[]) for b in order}
        prevq = {}
        for mt in mats:
            basis = {}
            for b in order:
                rest = b.matrix_local if b.parent is None else b.parent.matrix_local.inverted() @ b.matrix_local
                par = mt[b.parent.name] if b.parent else Matrix.Identity(4)
                bm = (par @ rest).inverted() @ mt[b.name]
                t, q, sc = bm.decompose()
                if b.name in prevq and prevq[b.name].dot(q) < 0:
                    q.negate()
                prevq[b.name] = q.copy()
                data[b.name]['location'].append(tuple(t))
                data[b.name]['rotation_quaternion'].append(tuple(q))
                data[b.name]['scale'].append(tuple(sc))
        n = len(frames)
        for bn, props in data.items():
            for prop, vals in props.items():
                ncomp = len(vals[0])
                for i in range(ncomp):
                    col = [v[i] for v in vals]
                    default = 1.0 if (prop == 'scale' or (prop == 'rotation_quaternion' and i == 0)) else 0.0
                    if max(abs(c - default) for c in col) < 1e-6:
                        # constant at default: still key two frames so the exporter does not reset anything
                        col2 = [default, default]; fr2 = [frames[0], frames[-1]]
                    else:
                        col2, fr2 = col, frames
                    fc = cb.fcurves.new(f'pose.bones["{bn}"].{prop}', index=i, group_name=bn)
                    for f_, c_ in zip(fr2, col2):
                        fc.keyframe_points.insert(float(f_), float(c_), options={'FAST'})
                    for kp in fc.keyframe_points:
                        kp.interpolation = 'LINEAR'
                    fc.update()
        arm.animation_data.action = None
        a.name = oldname + '_old'
        na.name = oldname
        na.use_fake_user = True
        bpy.data.actions.remove(a)
    log('rebind: rekeyed')
    # 5. verify: target pose reproduces the same mesh
    L.assign(arm, bpy.data.actions[clip]); L.set_frame(frame)
    now = L.eval_points(meshes)
    err = float(np.abs(now - ref).max())
    return err


def scale_action_locations(action, f):
    for fc in L.action_fcurves(action):
        if fc.data_path.endswith('.location') and fc.data_path.startswith('pose.bones'):
            for kp in fc.keyframe_points:
                kp.co[1] *= f
                kp.handle_left[1] *= f
                kp.handle_right[1] *= f
            fc.update()


def bake_transform(arm, meshes, G, loc_factor, actions):
    for o in [arm] + meshes:
        o.matrix_world = G @ o.matrix_world
    bpy.ops.object.select_all(action='DESELECT')
    for o in [arm] + meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True, properties=True)
    for a in actions:
        scale_action_locations(a, loc_factor)
    for m in meshes:
        m.parent = arm
        m.matrix_parent_inverse = Matrix.Identity(4)


def ground_action(arm, action, target_floor, hover):
    """Shift one clip vertically (via root-bone location keys) so its feet / lowest point sits at target_floor."""
    pts = sample_clip(arm, meshes_global, action, 48)
    mins = np.array([P[:, 2].min() for P in pts])
    stat = float(mins.min()) if hover else float(np.median(mins))
    dz = target_floor - stat
    if abs(dz) < 0.004:
        return 0.0
    root = [b for b in arm.data.bones if b.parent is None][0]
    rest_rot = root.matrix_local.to_3x3()
    dl = rest_rot.inverted() @ Vector((0, 0, dz))
    path = f'pose.bones["{root.name}"].location'
    cb = action.layers[0].strips[0].channelbags[0]
    for i in range(3):
        fc = next((f for f in cb.fcurves if f.data_path == path and f.array_index == i), None)
        if fc is None:
            fc = cb.fcurves.new(path, index=i, group_name=root.name)
            a, b = action.frame_range
            fc.keyframe_points.insert(a, 0.0)
            fc.keyframe_points.insert(b, 0.0)
        for kp in fc.keyframe_points:
            kp.co[1] += dl[i]
            kp.handle_left[1] += dl[i]
            kp.handle_right[1] += dl[i]
        fc.update()
    return dz


# ---------------------------------------------------------------------------
def make_idle_proc(arm, cfg_idle, name='Idle', length=72, step=6):
    donor_name, donor_frame = cfg_idle['donor']
    donor = bpy.data.actions[donor_name]
    arm_rot_inv = arm.matrix_world.to_quaternion().to_matrix().inverted()
    L.assign(arm, donor)
    L.set_frame(donor_frame)
    base = {}
    for pb in arm.pose.bones:
        base[pb.name] = (pb.location.copy(), pb.rotation_quaternion.copy(), pb.scale.copy(),
                         pb.matrix.to_quaternion().to_matrix())
    def chain(rx):
        bl = [b for b in arm.data.bones if re.search(rx, b.name)]
        def depth(b):
            d = 0
            while b.parent:
                b = b.parent; d += 1
            return d
        return sorted(bl, key=depth)
    chains = {k: chain(cfg_idle[k]) for k in ('spine', 'neck', 'head', 'tail')}
    log("idle chains", {k: [b.name for b in v] for k, v in chains.items()})
    # total swing (degrees) per chain; (axis, total_deg, phase_offset_rad, lag_rad_total)
    X, Z = Vector((1, 0, 0)), Vector((0, 0, 1))
    motions = {
        'spine': [(X, 1.6, 0.0, 0.0)],
        'neck': [(X, 4.0, 0.6, 0.8), (Z, 5.0, 0.6 + math.pi / 2, 0.8)],
        'head': [(X, 2.5, 1.2, 0.0)],
        'tail': [(Z, 14.0, 0.3, 2.0)],
    }
    act = bpy.data.actions.new(name)
    slot = act.slots.new(id_type='OBJECT', name=arm.name)
    arm.animation_data.action = act
    arm.animation_data.action_slot = slot
    for pb in arm.pose.bones:   # reset to base pose then key
        pass
    moving = {}
    for key, bl in chains.items():
        n = max(len(bl), 1)
        for i, b in enumerate(bl):
            moving.setdefault(b.name, []).extend(
                (ax, tot / n, ph + lag * (i / n), ) for (ax, tot, ph, lag) in motions[key])
    frames = list(range(0, length + 1, step))
    for pb in arm.pose.bones:
        loc, rq, sc, rot3 = base[pb.name]
        pb.rotation_mode = 'QUATERNION'
        mv = moving.get(pb.name)
        for f in (frames if mv else (0, length)):
            q = rq.copy()
            if mv:
                for ax, deg, ph in mv:
                    ang = math.radians(deg) * math.sin(2 * math.pi * f / length + ph)
                    axl = (rot3.inverted() @ (arm_rot_inv @ ax)).normalized()
                    q = q @ Quaternion(axl, ang)
            pb.location = loc
            pb.rotation_quaternion = q
            pb.scale = sc
            pb.keyframe_insert('location', frame=f)
            pb.keyframe_insert('rotation_quaternion', frame=f)
            pb.keyframe_insert('scale', frame=f)
    for fc in L.action_fcurves(act):
        for kp in fc.keyframe_points:
            kp.interpolation = 'BEZIER'
    return act


def make_idle_damped(src_action, k, name='Idle'):
    act = src_action.copy()
    act.name = name
    for fc in L.action_fcurves(act):
        vals = [kp.co[1] for kp in fc.keyframe_points]
        if not vals:
            continue
        mean = sum(vals) / len(vals)
        for kp in fc.keyframe_points:
            for attr in ('co', 'handle_left', 'handle_right'):
                v = getattr(kp, attr)
                v[1] = mean + k * (v[1] - mean)
        fc.update()
    return act


# ---------------------------------------------------------------------------
def rebuild_materials(meshes, mid, tmpdir):
    """Replace every material with a simple Principled: base colour + normal map, fixed roughness."""
    os.makedirs(tmpdir, exist_ok=True)
    done = {}
    info = []
    for mi, m in enumerate(meshes):
        for slot in m.material_slots:
            mat = slot.material
            if mat is None or mat.name in done:
                continue
            base_img = norm_img = None
            for n in mat.node_tree.nodes:
                if n.type == 'TEX_IMAGE' and n.image:
                    lab = (n.label or '').upper()
                    if 'BASE' in lab or 'DIFFUSE' in lab:
                        base_img = n.image
                    elif 'NORMAL' in lab:
                        norm_img = n.image
            tag = f"{mid}_{sanitize(mat.name)}"
            new = {}
            for kind, img, mx in (('base', base_img, TEX_MAX), ('normal', norm_img, NORMAL_MAX)):
                if img is None:
                    continue
                w, h = img.size
                px = np.empty(w * h * 4, dtype=np.float32)
                img.pixels.foreach_get(px)
                amin = float(px[3::4].min())
                s = min(1.0, mx / max(w, h))
                nw, nh = max(1, int(round(w * s))), max(1, int(round(h * s)))
                work = img.copy()
                work.scale(nw, nh)
                if kind == 'base' and amin > 0.99:
                    ext, fmt = 'jpg', 'JPEG'
                else:
                    ext, fmt = 'png', 'PNG'
                p = os.path.join(tmpdir, f"{tag}_{kind}.{ext}")
                work.file_format = fmt
                work.save(filepath=p, quality=88)
                bpy.data.images.remove(work)
                ni = bpy.data.images.load(p)
                ni.name = f"{tag}_{kind}"
                ni.colorspace_settings.name = 'sRGB' if kind == 'base' else 'Non-Color'
                ni.pack()
                new[kind] = ni
                info.append(dict(material=mat.name, kind=kind, src=img.name, src_size=[w, h], out_size=[nw, nh],
                                 format=fmt, min_alpha=round(amin, 3), bytes=os.path.getsize(p)))
            # rebuild node tree
            nt = mat.node_tree
            nt.nodes.clear()
            out = nt.nodes.new('ShaderNodeOutputMaterial')
            bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
            nt.links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
            bsdf.inputs['Metallic'].default_value = 0.0
            bsdf.inputs['Roughness'].default_value = 0.8
            if 'base' in new:
                t = nt.nodes.new('ShaderNodeTexImage'); t.image = new['base']; t.label = 'Base Color'
                nt.links.new(t.outputs['Color'], bsdf.inputs['Base Color'])
            if 'normal' in new:
                t = nt.nodes.new('ShaderNodeTexImage'); t.image = new['normal']; t.label = 'Normal'
                nm = nt.nodes.new('ShaderNodeNormalMap')
                nt.links.new(t.outputs['Color'], nm.inputs['Color'])
                nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
            mat.name = tag
            mat.use_backface_culling = False
            done[mat.name] = True
    # drop unused images (the 8 MB originals)
    for img in list(bpy.data.images):
        if img.users == 0:
            bpy.data.images.remove(img)
    return info


# ---------------------------------------------------------------------------
def clip_stats(arm, meshes, action):
    pts = sample_clip(arm, meshes, action, 16)
    cen = np.array([P.mean(0) for P in pts])
    bc = np.array([(P.min(0) + P.max(0)) / 2 for P in pts])
    mn = np.array([P.min(0) for P in pts]); mx = np.array([P.max(0) for P in pts])
    # largest vertex travel relative to frame 0 (motion amplitude)
    disp = max(float(np.linalg.norm(P - pts[0], axis=1).max()) for P in pts)
    return dict(frames=[round(action.frame_range[0], 1), round(action.frame_range[1], 1)],
                centroid_xy_range_m=[round(float(x), 3) for x in np.ptp(cen[:, :2], axis=0)],
                centroid_start_end_diff_m=round(float(np.linalg.norm(cen[0, :2] - cen[-1, :2])), 3),
                bboxcentre_xy_range_m=[round(float(x), 3) for x in np.ptp(bc[:, :2], axis=0)],
                max_vertex_travel_m=round(disp, 2),
                min_z=round(float(mn[:, 2].min()), 3), min_z_median=round(float(np.median(mn[:, 2])), 3),
                ext_xyz_max=[round(float(x), 2) for x in (mx.max(0) - mn.min(0))])


def render_poster(arm, meshes, cfg, out_path, scratch, mid):
    sc = bpy.context.scene
    clip, frame = cfg['poster']
    L.assign(arm, bpy.data.actions[clip])
    L.set_frame(frame)
    P = L.eval_points(meshes)
    L.setup_workbench((1280, 960), bg=(0.90, 0.92, 0.94))
    sh = sc.display.shading
    sh.light = 'STUDIO'
    sh.show_shadows = False
    sh.show_object_outline = False
    mn, mx = P.min(0), P.max(0)
    c = (mn + mx) / 2
    size = float(np.linalg.norm(mx - mn))
    # 3/4 front view (animal faces -Y): camera in front and to the right
    d = Vector((0.85, -1.0, 0.42)).normalized()
    cam = L.make_camera(Vector(c), d, size * 1.6, lens=50)
    cam.data.sensor_fit = 'HORIZONTAL'
    from bpy_extras.object_utils import world_to_camera_view
    sub = P[::max(1, len(P) // 4000)]
    for _ in range(8):
        bpy.context.view_layer.update()
        ndc = np.array([world_to_camera_view(sc, cam, Vector(p)) for p in sub])
        w = ndc[:, 0].max() - ndc[:, 0].min()
        h = ndc[:, 1].max() - ndc[:, 1].min()
        f = max(w / 0.84, h / 0.78)
        cam.location = Vector(c) + (cam.location - Vector(c)) * f
        bpy.context.view_layer.update()
        ndc = np.array([world_to_camera_view(sc, cam, Vector(p)) for p in sub])
        cx = (ndc[:, 0].max() + ndc[:, 0].min()) / 2 - 0.5
        cy = (ndc[:, 1].max() + ndc[:, 1].min()) / 2 - 0.5
        cam.data.shift_x += cx
        cam.data.shift_y += cy * 0.75   # shift is relative to the larger (horizontal) dimension
    big = os.path.join(scratch, f"{mid}_poster_big.png")
    L.render_to(big)
    im = bpy.data.images.load(big)
    im.scale(640, 480)
    im.file_format = 'JPEG'
    im.save(filepath=out_path, quality=90)
    bpy.data.images.remove(im)
    bpy.data.objects.remove(cam, do_unlink=True)


# ---------------------------------------------------------------------------
def export_glb(arm, meshes, path):
    arm.animation_data.action = None
    bpy.ops.object.select_all(action='DESELECT')
    for o in [arm] + meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = arm
    bpy.ops.export_scene.gltf(
        filepath=path, export_format='GLB', use_selection=True, export_yup=True,
        export_animations=True, export_animation_mode='ACTIONS', export_force_sampling=True,
        export_optimize_animation_size=True, export_image_format='AUTO', export_jpeg_quality=85,
        export_skins=True, export_morph=False, export_cameras=False, export_lights=False,
        export_apply=False, export_attributes=False, export_extras=False)


def export_usdz(arm, meshes, action, path):
    sc = bpy.context.scene
    L.assign(arm, action)
    a, b = action.frame_range
    sc.frame_start = int(math.floor(a))
    sc.frame_end = max(sc.frame_start + 1, int(math.floor(b - 0.5)))   # drop the duplicated loop frame
    bpy.ops.object.select_all(action='DESELECT')
    for o in [arm] + meshes:
        o.select_set(True)
    bpy.context.view_layer.objects.active = arm
    kw = dict(selected_objects_only=True, export_animation=True, export_hair=False, export_uvmaps=True,
              export_mesh_colors=False, export_normals=True, export_materials=True, export_armatures=True,
              only_deform_bones=False, export_shapekeys=False, use_instancing=False,
              generate_preview_surface=True, generate_materialx_network=False, convert_orientation=True,
              export_global_forward_selection='NEGATIVE_Z', export_global_up_selection='Y',
              export_textures_mode='NEW', overwrite_textures=True, relative_paths=True,
              triangulate_meshes=True, usdz_downscale_size='KEEP', convert_scene_units='METERS',
              export_lights=False, export_cameras=False, export_custom_properties=False,
              convert_world_material=False, export_curves=False, export_points=False, export_volumes=False,
              export_subdivision='IGNORE', evaluation_mode='RENDER')
    bpy.ops.wm.usd_export(filepath=path, **kw)


def validate_usdz(path, cfg, animated=True):
    rep = dict(file=os.path.basename(path), size_kb=round(os.path.getsize(path) / 1024))
    z = zipfile.ZipFile(path)
    names = z.namelist()
    rep['entries'] = names
    usd_names = [n for n in names if n.lower().endswith(('.usdc', '.usda', '.usd'))]
    rep['first_entry_is_usd'] = names[0] in usd_names
    ok = True
    try:
        from pxr import Usd, UsdGeom, UsdSkel, UsdShade, Sdf
        import tempfile
        tmp = tempfile.mkdtemp()
        z.extractall(tmp)
        stage = Usd.Stage.Open(os.path.join(tmp, usd_names[0]))
        rep['upAxis'] = str(UsdGeom.GetStageUpAxis(stage))
        rep['metersPerUnit'] = UsdGeom.GetStageMetersPerUnit(stage)
        rep['timeCodes'] = [stage.GetStartTimeCode(), stage.GetEndTimeCode(), stage.GetTimeCodesPerSecond()]
        prims = list(stage.Traverse())
        rep['skeletons'] = [str(p.GetPath()) for p in prims if p.IsA(UsdSkel.Skeleton)]
        rep['skelAnimations'] = [str(p.GetPath()) for p in prims if p.IsA(UsdSkel.Animation)]
        rep['meshes'] = [str(p.GetPath()) for p in prims if p.IsA(UsdGeom.Mesh)]
        mats = [p for p in prims if p.IsA(UsdShade.Material)]
        rep['materials'] = [str(p.GetPath()) for p in mats]
        bound = 0
        for p in prims:
            if p.IsA(UsdGeom.Mesh):
                m, _ = UsdShade.MaterialBindingAPI(p).ComputeBoundMaterial()
                bound += 1 if m else 0
        rep['meshes_with_material'] = bound
        shaders = {}
        texfiles = set()
        for p in prims:
            if p.IsA(UsdShade.Shader):
                sid = UsdShade.Shader(p).GetIdAttr().Get()
                shaders[str(sid)] = shaders.get(str(sid), 0) + 1
                if str(sid) == 'UsdUVTexture':
                    f = p.GetAttribute('inputs:file').Get()
                    if f:
                        texfiles.add(str(f.path if hasattr(f, 'path') else f))
        rep['shader_ids'] = shaders
        rep['texture_refs'] = sorted(texfiles)
        inside = {os.path.normpath(n).replace('\\', '/') for n in names}
        rep['textures_missing_in_archive'] = [t for t in texfiles
                                              if os.path.normpath(t).replace('\\', '/').lstrip('./') not in inside]
        rep['animated'] = bool(rep['skelAnimations'])
        if animated:
            ok = ok and rep['animated'] and bool(rep['skeletons'])
        ok = ok and rep['upAxis'] == 'Y' and abs(rep['metersPerUnit'] - 1) < 1e-9 and bound > 0 \
            and not rep['textures_missing_in_archive']
    except Exception as e:
        rep['pxr_error'] = repr(e)
        ok = False
    rep['valid'] = ok
    return rep


# ---------------------------------------------------------------------------
def main():
    argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument('--id', required=True)
    ap.add_argument('--models-root', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--scratch', required=True)
    ap.add_argument('--variant', choices=['mini', 'far'], default=None,
                    help='only write <id>-mini.usdz (1:10 scale) or <id>-far.usdz (origin moved to the nose, body behind it)')
    ap.add_argument('--yaw', type=float, default=None, help='override the configured yaw (debug)')
    args = ap.parse_args(argv)
    mid = args.id
    cfg = CFG[mid]
    if args.yaw is not None:
        cfg['yaw'] = args.yaw
    os.makedirs(args.out, exist_ok=True)
    scratch = os.path.join(args.scratch, mid)
    os.makedirs(scratch, exist_ok=True)
    stats = dict(id=mid)

    arm, meshes = L.import_clean(os.path.join(args.models_root, cfg['folder'], 'scene.gltf'))
    arm.rotation_mode = 'QUATERNION'
    W_a = arm.matrix_world.copy()
    static_pose = capture_static_pose(arm)
    # --- actions: keep real ones, rename, drop junk ---
    for a in list(bpy.data.actions):
        if (a.frame_range[1] - a.frame_range[0]) < 1.0 or a.name not in cfg['clips']:
            if arm.animation_data and arm.animation_data.action == a:
                arm.animation_data.action = None
            bpy.data.actions.remove(a)
    for old, new in cfg['clips'].items():
        bpy.data.actions[old].name = new
        bpy.data.actions[new].use_fake_user = True
        stats.setdefault('static_pose_keys_added', {})[new] = bake_static_pose(arm, static_pose, bpy.data.actions[new])
    # --- custom idle (built in the raw rig units; scaled with everything else below) ---
    if cfg['idle']:
        k = cfg['idle']
        if k['kind'] == 'proc':
            make_idle_proc(arm, k)
        else:
            make_idle_damped(bpy.data.actions[k['source']], k['k'])
        bpy.data.actions['Idle'].use_fake_user = True
    ref = bpy.data.actions[cfg['ref_clip']]
    # --- scale / orientation / ground ---
    s, refext, info = measure_scale(arm, meshes, cfg, ref)
    stats['scale'] = dict(factor=s, ref_extent_raw=refext, **info)
    log(mid, "scale", s, info)
    R = rotz(cfg['yaw'])
    Gs = R @ Matrix.Scale(s, 4)
    pts = [apply_pts(Gs, P) for P in sample_clip(arm, meshes, ref, 48 if cfg['mode'] == 'span' else SAMPLES)]
    ctr = np.mean([(P.min(0) + P.max(0)) / 2 for P in pts], axis=0)
    if cfg['mode'] == 'span':
        allmin = min(P[:, 2].min() for P in pts)
        for a in bpy.data.actions:
            if a != ref:
                allmin = min(allmin, min(P[:, 2].min() for P in (apply_pts(Gs, Q) for Q in sample_clip(arm, meshes, a, 48))))
        tz = cfg.get('hover', 0.3) - allmin
    else:
        tz = -float(np.median([P[:, 2].min() for P in pts]))
    T = Matrix.Translation((-ctr[0], -ctr[1], tz))
    G = T @ Gs
    loc_factor = (G @ W_a).to_scale().x
    log("loc_factor", loc_factor, "translation", tuple(T.translation))
    bake_transform(arm, meshes, G, loc_factor, list(bpy.data.actions))
    # --- ground every clip individually (feet on y=0, or lowest point at the hover height) ---
    meshes_global[:] = meshes
    hover = cfg['mode'] == 'span'
    stats['ground_shift_m'] = {a.name: round(ground_action(arm, a, cfg.get('hover', 0.3) if hover else 0.0, hover), 3)
                               for a in bpy.data.actions}
    if cfg.get('rebind'):
        stats['rebind_max_err_m'] = rebind_to_pose(arm, meshes, *cfg['rebind'])
        log("rebind max error (m):", stats['rebind_max_err_m'])
        stats['rest_extent_after_rebind'] = [float(x) for x in np.ptp(
            (lambda: (setattr(arm.data, 'pose_position', 'REST'), bpy.context.view_layer.update(), L.eval_points(meshes))[-1])(), axis=0)]
        arm.data.pose_position = 'POSE'
    # --- verify bake: re-measure (post-bake) ---
    P = sample_clip(arm, meshes, bpy.data.actions[cfg['ref_clip']])
    if cfg['mode'] == 'length':
        post = float(np.median([max(Q.max(0)[0] - Q.min(0)[0], Q.max(0)[1] - Q.min(0)[1]) for Q in P]))
    else:
        post = float(max(Q.max(0)[0] - Q.min(0)[0] for Q in P))
    stats['post_bake_extent_ref_clip'] = post
    log("post-bake extent (target %.2f): %.3f" % (cfg['target'], post))
    # --- materials / textures ---
    stats['textures'] = rebuild_materials(meshes, mid, os.path.join(scratch, 'tex'))
    # --- stats per clip ---
    stats['clips'] = {}
    for a in bpy.data.actions:
        stats['clips'][a.name] = clip_stats(arm, meshes, a)
    stats['tris'] = L.tri_count(meshes)
    stats['final_ext'] = {}
    if args.variant:
        act = bpy.data.actions[cfg['usdz_clip']]
        if args.variant == 'mini':
            k = 0.1
            G = Matrix.Scale(k, 4)
        else:   # far: origin at the front-most point (Blender -Y == USD +Z), body extends toward USD -Z
            k = 1.0
            ymin = min(P[:, 1].min() for P in sample_clip(arm, meshes, act, 48))
            G = Matrix.Translation((0, -ymin, 0))
            stats['far_shift_y_m'] = float(-ymin)
        bake_transform(arm, meshes, G, k, list(bpy.data.actions))
        vpath = os.path.join(args.out, f"{mid}-{args.variant}.usdz")
        if os.path.exists(vpath):
            os.remove(vpath)
        export_usdz(arm, meshes, act, vpath)
        pts = sample_clip(arm, meshes, act, 48)
        Pall = np.vstack(pts)
        stats['variant'] = args.variant
        stats['variant_bounds_min'] = [float(x) for x in Pall.min(0)]
        stats['variant_bounds_max'] = [float(x) for x in Pall.max(0)]
        stats['usdz_validation'] = validate_usdz(vpath, cfg)
        stats['usdz_kb'] = round(os.path.getsize(vpath) / 1024)
        with open(os.path.join(args.scratch, f"{mid}_{args.variant}_stats.json"), 'w') as fh:
            json.dump(stats, fh, indent=1, default=float)
        log("DONE variant", mid, args.variant, stats['usdz_kb'], "KB", stats['variant_bounds_min'], stats['variant_bounds_max'])
        return
    # --- poster (before exports mutate selection etc.) ---
    poster = os.path.join(args.out, f"{mid}-poster.jpg")
    render_poster(arm, meshes, cfg, poster, scratch, mid)
    # --- GLB ---
    glb = os.path.join(args.out, f"{mid}.glb")
    export_glb(arm, meshes, glb)
    # --- USDZ ---
    usdz = os.path.join(args.out, f"{mid}.usdz")
    if os.path.exists(usdz):
        os.remove(usdz)
    export_usdz(arm, meshes, bpy.data.actions[cfg['usdz_clip']], usdz)
    stats['usdz_validation'] = validate_usdz(usdz, cfg)
    stats['glb_kb'] = round(os.path.getsize(glb) / 1024)
    stats['usdz_kb'] = round(os.path.getsize(usdz) / 1024)
    stats['poster_kb'] = round(os.path.getsize(poster) / 1024)
    with open(os.path.join(args.scratch, f"{mid}_stats.json"), 'w') as fh:
        json.dump(stats, fh, indent=1, default=float)
    log("DONE", mid, stats['glb_kb'], "KB glb,", stats['usdz_kb'], "KB usdz")


if __name__ == '__main__':
    main()
