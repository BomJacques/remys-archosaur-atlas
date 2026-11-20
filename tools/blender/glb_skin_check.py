"""Independent GLB check (no Blender): CPU-skins the mesh with the glTF animation at a few times and
reports the bounding box (glTF Y-up, metres) per clip. Usage: python glb_skin_check.py model.glb [model2.glb ...]"""
import json, struct, sys
import numpy as np

COMP = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NCOMP = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16}


def load(path):
    b = open(path, 'rb').read()
    n = struct.unpack('<I', b[12:16])[0]
    j = json.loads(b[20:20 + n])
    off = 20 + n
    m = struct.unpack('<I', b[off:off + 4])[0]
    binch = b[off + 8: off + 8 + m]
    return j, binch


def acc(j, binch, i):
    a = j['accessors'][i]
    bv = j['bufferViews'][a['bufferView']]
    dt = COMP[a['componentType']]
    nc = NCOMP[a['type']]
    stride = bv.get('byteStride')
    base = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    cnt = a['count']
    esz = np.dtype(dt).itemsize * nc
    if stride and stride != esz:
        raw = np.frombuffer(binch, dtype=np.uint8, count=stride * cnt, offset=base).reshape(cnt, stride)[:, :esz]
        arr = np.ascontiguousarray(raw).view(dt)
    else:
        arr = np.frombuffer(binch, dtype=dt, count=cnt * nc, offset=base)
    arr = arr.reshape(cnt, nc).astype(np.float64)
    if a.get('normalized'):
        arr = arr / np.iinfo(dt).max
    return arr


def qmat(q):
    x, y, z, w = q
    return np.array([[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)],
                     [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)],
                     [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]])


def slerp(a, b, t):
    d = np.dot(a, b)
    if d < 0:
        b = -b; d = -d
    if d > 0.9995:
        r = a + t * (b - a)
        return r / np.linalg.norm(r)
    th = np.arccos(d)
    return (np.sin((1 - t) * th) * a + np.sin(t * th) * b) / np.sin(th)


def sample(times, vals, t, rot=False):
    if t <= times[0]:
        return vals[0]
    if t >= times[-1]:
        return vals[-1]
    k = np.searchsorted(times, t) - 1
    u = (t - times[k]) / (times[k + 1] - times[k])
    return slerp(vals[k], vals[k + 1], u) if rot else vals[k] * (1 - u) + vals[k + 1] * u


def check(path):
    j, binch = load(path)
    nodes = j['nodes']
    parent = {}
    for i, n in enumerate(nodes):
        for c in n.get('children', []):
            parent[c] = i

    def local(i, pose):
        n = nodes[i]
        t = np.array(pose.get((i, 'translation'), n.get('translation', [0, 0, 0])), dtype=float)
        r = np.array(pose.get((i, 'rotation'), n.get('rotation', [0, 0, 0, 1])), dtype=float)
        s = np.array(pose.get((i, 'scale'), n.get('scale', [1, 1, 1])), dtype=float)
        M = np.eye(4)
        M[:3, :3] = qmat(r) * s
        M[:3, 3] = t
        if 'matrix' in n and not any(k in n for k in ('translation', 'rotation', 'scale')):
            M = np.array(n['matrix']).reshape(4, 4).T
        return M

    def world(i, pose, cache):
        if i in cache:
            return cache[i]
        M = local(i, pose)
        if i in parent:
            M = world(parent[i], pose, cache) @ M
        cache[i] = M
        return M

    skin = j['skins'][0]
    joints = skin['joints']
    ibm = acc(j, binch, skin['inverseBindMatrices']).reshape(-1, 4, 4).transpose(0, 2, 1)
    prims = []
    for mi, node in enumerate(nodes):
        if 'mesh' in node and 'skin' in node:
            for p in j['meshes'][node['mesh']]['primitives']:
                at = p['attributes']
                prims.append((acc(j, binch, at['POSITION']), acc(j, binch, at['JOINTS_0']).astype(int), acc(j, binch, at['WEIGHTS_0']), node))
    out = {}
    for anim in j['animations']:
        chans = []
        for ch in anim['channels']:
            s = anim['samplers'][ch['sampler']]
            chans.append((ch['target']['node'], ch['target']['path'], acc(j, binch, s['input'])[:, 0], acc(j, binch, s['output'])))
        dur = max(c[2][-1] for c in chans)
        res = []
        for t in np.linspace(0, dur, 9):
            pose = {(nid, path_): sample(tt, vv, t, rot=(path_ == 'rotation')) for nid, path_, tt, vv in chans}
            cache = {}
            skinm = np.array([world(jn, pose, cache) @ ibm[k] for k, jn in enumerate(joints)])
            pts = []
            for pos, jt, wt, node in prims:
                P = np.hstack([pos, np.ones((len(pos), 1))])
                acc_ = np.zeros((len(pos), 4))
                for c in range(4):
                    acc_ += wt[:, c:c + 1] * np.einsum('nij,nj->ni', skinm[jt[:, c]], P)
                pts.append(acc_[:, :3])
            pts = np.vstack(pts)
            res.append((pts.min(0), pts.max(0)))
        mn = np.min([r[0] for r in res], axis=0); mx = np.max([r[1] for r in res], axis=0)
        out[anim.get('name')] = dict(duration_s=round(float(dur), 2), min=mn.round(2).tolist(), max=mx.round(2).tolist(),
                                     size=(mx - mn).round(2).tolist())
    return out


if __name__ == '__main__':
    for p in sys.argv[1:]:
        print(p)
        for k, v in check(p).items():
            print("  ", k, v)
