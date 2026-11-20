"""Shared helpers for the dino model pipeline (Blender 5.x, run headless)."""
import bpy, math, os, sys, json
import numpy as np
from mathutils import Vector, Matrix, Euler


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def import_clean(gltf_path):
    """Import a glTF, drop cameras/lights/helper meshes/empties, flatten hierarchy
    keeping world transforms. Returns (armature, [skinned meshes])."""
    reset_scene()
    bpy.ops.import_scene.gltf(filepath=gltf_path)
    arm = [o for o in bpy.data.objects if o.type == 'ARMATURE'][0]
    meshes = [o for o in bpy.data.objects if o.type == 'MESH' and any(m.type == 'ARMATURE' for m in o.modifiers)]
    keep = set([arm] + meshes)
    for o in list(keep):
        mw = o.matrix_world.copy()
        o.parent = None
        o.matrix_world = mw
    for o in list(bpy.data.objects):
        if o not in keep:
            bpy.data.objects.remove(o, do_unlink=True)
    for b in arm.data.bones:
        pass
    return arm, meshes


def action_fcurves(action):
    out = []
    for layer in action.layers:
        for strip in layer.strips:
            for cb in strip.channelbags:
                out.extend(cb.fcurves)
    return out


def real_actions(min_len=1.0):
    return [a for a in bpy.data.actions if (a.frame_range[1] - a.frame_range[0]) >= min_len]


def assign(arm, action):
    if arm.animation_data is None:
        arm.animation_data_create()
    arm.animation_data.action = action
    if action is not None and action.slots:
        try:
            arm.animation_data.action_slot = action.slots[0]
        except Exception:
            pass


def eval_points(meshes):
    """World-space evaluated (posed, skinned) vertex positions, Nx3 numpy array."""
    dg = bpy.context.evaluated_depsgraph_get()
    dg.update()
    pts = []
    for o in meshes:
        eo = o.evaluated_get(dg)
        me = eo.to_mesh()
        n = len(me.vertices)
        co = np.empty(n * 3, dtype=np.float32)
        me.vertices.foreach_get('co', co)
        co = co.reshape(n, 3)
        m = np.array(eo.matrix_world, dtype=np.float64)
        pts.append(co @ m[:3, :3].T + m[:3, 3])
        eo.to_mesh_clear()
    return np.vstack(pts)


def frames_of(action, n=12):
    a, b = action.frame_range
    return [a + (b - a) * i / n for i in range(n + 1)]


def set_frame(f):
    bpy.context.scene.frame_set(int(math.floor(f)), subframe=f - math.floor(f))


def tri_count(meshes):
    dg = bpy.context.evaluated_depsgraph_get()
    t = 0
    for o in meshes:
        me = o.data
        t += sum(len(p.vertices) - 2 for p in me.polygons)
    return t


# ---------------- rendering -----------------
def setup_workbench(res=(640, 480), bg=(0.93, 0.94, 0.96)):
    sc = bpy.context.scene
    sc.render.engine = 'BLENDER_WORKBENCH'
    sc.render.resolution_x, sc.render.resolution_y = res
    sc.render.resolution_percentage = 100
    sc.render.image_settings.file_format = 'PNG'
    sh = sc.display.shading
    sh.light = 'STUDIO'
    sh.color_type = 'TEXTURE'
    sh.show_shadows = True
    sh.shadow_intensity = 0.35
    sh.show_cavity = False
    sh.studio_light = 'Default' if 'Default' in [s.name for s in bpy.context.preferences.studio_lights] else sh.studio_light
    w = bpy.data.worlds.new('bgw')
    w.color = bg
    sc.world = w
    sc.view_settings.view_transform = 'Standard'
    sc.render.film_transparent = False
    sc.display_settings.display_device = 'sRGB'


def make_camera(target, direction, dist, lens=50, ortho=None):
    cam = bpy.data.objects.get('PreviewCam')
    if cam is None:
        cd = bpy.data.cameras.new('PreviewCam')
        cam = bpy.data.objects.new('PreviewCam', cd)
        bpy.context.scene.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    d = Vector(direction).normalized()
    cam.location = Vector(target) + d * dist
    look = (Vector(target) - cam.location).normalized()
    cam.rotation_euler = look.to_track_quat('-Z', 'Y').to_euler()
    if ortho:
        cam.data.type = 'ORTHO'
        cam.data.ortho_scale = ortho
    else:
        cam.data.type = 'PERSP'
        cam.data.lens = lens
    cam.data.clip_start = 0.01
    cam.data.clip_end = 5000
    return cam


def render_to(path):
    bpy.context.scene.render.filepath = path
    bpy.ops.render.render(write_still=True)


def stitch(paths, cols, out):
    imgs = []
    for p in paths:
        im = bpy.data.images.load(p)
        w, h = im.size
        a = np.array(im.pixels[:], dtype=np.float32).reshape(h, w, 4)
        imgs.append(a)
        bpy.data.images.remove(im)
    h, w = imgs[0].shape[:2]
    rows = (len(imgs) + cols - 1) // cols
    sheet = np.ones((rows * h, cols * w, 4), dtype=np.float32)
    for i, a in enumerate(imgs):
        r, c = divmod(i, cols)
        sheet[(rows - 1 - r) * h:(rows - r) * h, c * w:(c + 1) * w] = a
    im = bpy.data.images.new('sheet', cols * w, rows * h)
    im.pixels.foreach_set(sheet.ravel())
    im.filepath_raw = out
    im.file_format = 'JPEG'
    im.save()
    bpy.data.images.remove(im)
