/** The site in 3D (part of the lazily loaded 3D module): driveways,
 * paths, patios, lawn and planting beds draped over the ground, and
 * fences, retaining walls, hedges and edging built along their lines —
 * from the plan's site outlines (see furniture-catalog.ts's SITE).
 *
 * Everything is built in the item's own frame (as Item3d's footprint),
 * its heights from `ground`: the ground's height at a spot of that frame,
 * relative to the item's base. */

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Item3d, Vec2 } from "./view3d-api";

type Ground = (x: number, z: number) => number;

/** Each surface: how far its top stands above the ground, its look. */
const SURFACES: Record<
  string,
  { lift: number; color: string; tile: number; rough: number }
> = {
  concrete: { lift: 0.05, color: "#c9c6bf", tile: 3, rough: 0.9 },
  asphalt: { lift: 0.04, color: "#4c4d4f", tile: 2, rough: 0.95 },
  pavers: { lift: 0.05, color: "#b27f5a", tile: 1.2, rough: 0.85 },
  flagstone: { lift: 0.05, color: "#a8a196", tile: 2.4, rough: 0.9 },
  gravel: { lift: 0.025, color: "#cbbfa6", tile: 1.5, rough: 1 },
  lawn: { lift: 0.015, color: "#6f9e45", tile: 2, rough: 1 },
  mulch: { lift: 0.06, color: "#5b3f2e", tile: 1.5, rough: 1 },
  flowers: { lift: 0.06, color: "#5b3f2e", tile: 1.5, rough: 1 },
  shrubs: { lift: 0.06, color: "#5b3f2e", tile: 1.5, rough: 1 },
  rock: { lift: 0.04, color: "#a3a19c", tile: 1.2, rough: 0.9 },
  stepping: { lift: 0.02, color: "#7f9a5c", tile: 2, rough: 1 },
};

const TEXTURES = new Map<string, THREE.Texture>();

/** A tileable pattern for a surface, white-ish (tinted by its colour). */
function surfaceTexture(kind: string): THREE.Texture {
  const known = TEXTURES.get(kind);
  if (known) return known;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d")!;
  let seed = 23;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const grey = (v: number) => {
    const c = Math.max(0, Math.min(255, Math.round(v)));
    return `rgb(${c},${c},${c})`;
  };
  const noise = (base: number, spread: number, n: number, dot = 2) => {
    g.fillStyle = grey(base);
    g.fillRect(0, 0, size, size);
    for (let i = 0; i < n; i++) {
      g.fillStyle = grey(base + (rand() - 0.5) * spread);
      g.fillRect(rand() * size, rand() * size, dot, dot);
    }
  };
  switch (kind) {
    case "concrete":
      noise(235, 30, 8000);
      // Control joints.
      g.fillStyle = grey(170);
      g.fillRect(0, 0, size, 2);
      g.fillRect(0, 0, 2, size);
      break;
    case "asphalt":
      noise(235, 50, 20000);
      break;
    case "pavers": {
      g.fillStyle = grey(170);
      g.fillRect(0, 0, size, size);
      const rows = 8;
      const h = size / rows;
      for (let r = 0; r < rows; r++) {
        const off = r % 2 ? size / 8 : 0;
        for (let c = -1; c < 4; c++) {
          g.fillStyle = grey(230 + (rand() - 0.5) * 40);
          g.fillRect(off + (c * size) / 4 + 2, r * h + 2, size / 4 - 4, h - 4);
        }
      }
      break;
    }
    case "flagstone": {
      g.fillStyle = grey(150);
      g.fillRect(0, 0, size, size);
      for (let r = 0; r < 4; r++) {
        let x = -rand() * 40;
        while (x < size) {
          const w = 40 + rand() * 60;
          g.fillStyle = grey(225 + (rand() - 0.5) * 50);
          g.fillRect(x + 3, r * (size / 4) + 3, w - 6, size / 4 - 6);
          x += w;
        }
      }
      break;
    }
    case "gravel":
    case "rock":
      noise(220, 70, 30000, 3);
      break;
    case "lawn":
      noise(230, 40, 40000, 1);
      g.globalAlpha = 0.12;
      for (let i = 0; i < size; i += 16) {
        g.fillStyle = grey(200);
        g.fillRect(0, i, size, 8);
      }
      g.globalAlpha = 1;
      break;
    default:
      noise(225, 50, 20000, 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  TEXTURES.set(kind, tex);
  return tex;
}

const MATS = new Map<string, THREE.MeshStandardMaterial>();
function mat(
  color: string,
  rough = 0.85,
  opacity = 1,
): THREE.MeshStandardMaterial {
  const key = `${color}|${rough}|${opacity}`;
  let m = MATS.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: rough });
    if (opacity < 1) {
      m.transparent = true;
      m.opacity = opacity;
      m.depthWrite = false;
      m.side = THREE.DoubleSide;
    }
    MATS.set(key, m);
  }
  return m;
}

function pointIn(poly: Vec2[], x: number, z: number): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i]!;
    const [xj, zj] = poly[j]!;
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)
      inside = !inside;
  }
  return inside;
}

/** Collects geometries by material and merges them. */
class Parts {
  private map = new Map<THREE.Material, THREE.BufferGeometry[]>();
  add(g: THREE.BufferGeometry, m: THREE.Material): void {
    const n = g.index ? g.toNonIndexed() : g;
    if (n !== g) g.dispose();
    for (const k of Object.keys(n.attributes))
      if (k !== "position" && k !== "normal" && k !== "uv")
        n.deleteAttribute(k);
    if (!n.getAttribute("uv"))
      n.setAttribute(
        "uv",
        new THREE.BufferAttribute(
          new Float32Array(n.getAttribute("position").count * 2),
          2,
        ),
      );
    const list = this.map.get(m) ?? [];
    list.push(n);
    this.map.set(m, list);
  }
  /** A box `len` long along a→b, `thick` across, from y0 up `h`. */
  along(
    a: Vec2,
    b: Vec2,
    y0: number,
    h: number,
    thick: number,
    m: THREE.Material,
    soft = 0,
  ): void {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 0.01 || h <= 0) return;
    const g =
      soft > 0
        ? new RoundedBoxGeometry(
            len,
            h,
            thick,
            2,
            Math.min(soft, h / 2 - 0.001, thick / 2 - 0.001),
          )
        : new THREE.BoxGeometry(len, h, thick);
    g.rotateY(-Math.atan2(b[1] - a[1], b[0] - a[0]));
    g.translate((a[0] + b[0]) / 2, y0 + h / 2, (a[1] + b[1]) / 2);
    this.add(g, m);
  }
  post(
    p: Vec2,
    y0: number,
    h: number,
    size: number,
    m: THREE.Material,
    round = false,
  ): void {
    const g = round
      ? new THREE.CylinderGeometry(size / 2, size / 2, h, 10)
      : new THREE.BoxGeometry(size, h, size);
    g.translate(p[0], y0 + h / 2, p[1]);
    this.add(g, m);
  }
  blob(
    x: number,
    y: number,
    z: number,
    r: number,
    m: THREE.Material,
    sy = 1,
  ): void {
    const g = new THREE.IcosahedronGeometry(r, 1);
    g.scale(1, sy, 1);
    g.translate(x, y, z);
    this.add(g, m);
  }
  group(): THREE.Group {
    const out = new THREE.Group();
    for (const [m, list] of this.map) {
      const merged = mergeGeometries(list);
      for (const g of list) g.dispose();
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, m);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      out.add(mesh);
    }
    return out;
  }
}

/** How finely a surface's top is cut (metres): no piece wider than
 * this, so it follows the ground's rise and fall. */
const SURFACE_CELL_M = 0.45;

/** The part of a polygon on one side of an axis line: x (axis 0) or z
 * (axis 1) at least `at` (keep "above"), else at most. */
function clipAxis(
  poly: Vec2[],
  axis: 0 | 1,
  at: number,
  above: boolean,
): Vec2[] {
  const out: Vec2[] = [];
  const inside = (p: Vec2) => (above ? p[axis] >= at : p[axis] <= at);
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const q = poly[(i + 1) % poly.length]!;
    const pin = inside(p);
    if (pin) out.push(p);
    if (pin !== inside(q)) {
      const t = (at - p[axis]) / (q[axis] - p[axis]);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}

function polyArea(poly: Vec2[]): number {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++)
    a += poly[j]![0] * poly[i]![1] - poly[i]![0] * poly[j]![1];
  return a / 2;
}

/** An outline filled with triangles no wider than `cell`: cut along a
 * grid of that size, each whole square two triangles and each piece the
 * outline crosses triangulated as it is. Each counter-clockwise in
 * (x, z); by rows of the grid, the first from z = `z0`. */
function cellTriangles(
  outline: Vec2[],
  cell: number,
): { z0: number; rows: [Vec2, Vec2, Vec2][][] } {
  let out: [Vec2, Vec2, Vec2][] = [];
  const rows: [Vec2, Vec2, Vec2][][] = [];
  const push = (a: Vec2, b: Vec2, c: Vec2) => {
    const turn = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (Math.abs(turn) < 1e-12) return;
    out.push(turn > 0 ? [a, b, c] : [a, c, b]);
  };
  const xs = outline.map((p) => p[0]);
  const zs = outline.map((p) => p[1]);
  const i0 = Math.floor(Math.min(...xs) / cell);
  const i1 = Math.ceil(Math.max(...xs) / cell);
  const j0 = Math.floor(Math.min(...zs) / cell);
  const j1 = Math.ceil(Math.max(...zs) / cell);
  const full = cell * cell * (1 - 1e-6);
  for (let j = j0; j < j1; j++) {
    const za = j * cell;
    const zb = (j + 1) * cell;
    out = [];
    rows.push(out);
    const row = clipAxis(clipAxis(outline, 1, za, true), 1, zb, false);
    if (row.length < 3) continue;
    for (let i = i0; i < i1; i++) {
      const xa = i * cell;
      const xb = (i + 1) * cell;
      const piece = clipAxis(clipAxis(row, 0, xa, true), 0, xb, false);
      if (piece.length < 3) continue;
      const area = Math.abs(polyArea(piece));
      if (area < 1e-9) continue;
      if (area >= full) {
        push([xa, za], [xb, za], [xb, zb]);
        push([xa, za], [xb, zb], [xa, zb]);
        continue;
      }
      const ring = piece.map(([x, z]) => new THREE.Vector2(x, z));
      for (const [a, b, c] of THREE.ShapeUtils.triangulateShape(ring, []))
        push(piece[a!]!, piece[b!]!, piece[c!]!);
    }
  }
  return { z0: j0 * cell, rows };
}

/** A surface's top, picked only among the rows of its grid the ray
 * passes over (see cellTriangles) rather than every triangle: the same
 * hits, found in a fraction of the time. `userData.rows` holds where each
 * row starts (in triangles), from z = `z0`, `cell` apart. */
function rowRaycast(
  this: THREE.Mesh,
  raycaster: THREE.Raycaster,
  hits: THREE.Intersection[],
): void {
  const rows = this.userData["rows"] as
    { z0: number; cell: number; starts: number[] } | undefined;
  const g = this.geometry;
  if (!rows) return THREE.Mesh.prototype.raycast.call(this, raycaster, hits);
  if (!g.boundingBox) g.computeBoundingBox();
  const box = g.boundingBox!;
  const ray = raycaster.ray
    .clone()
    .applyMatrix4(this.matrixWorld.clone().invert());
  // The stretch of the ray inside the bounds, on each axis in turn.
  let t0 = 0;
  let t1 = Infinity;
  for (const k of ["x", "y", "z"] as const) {
    const o = ray.origin[k];
    const d = ray.direction[k];
    if (Math.abs(d) < 1e-12) {
      if (o < box.min[k] || o > box.max[k]) return;
      continue;
    }
    let a = (box.min[k] - o) / d;
    let b = (box.max[k] - o) / d;
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a);
    t1 = Math.min(t1, b);
  }
  if (t0 > t1) return;
  const za = ray.origin.z + ray.direction.z * t0;
  const zb = ray.origin.z + ray.direction.z * t1;
  const n = rows.starts.length - 1;
  const first = Math.max(
    0,
    Math.floor((Math.min(za, zb) - rows.z0) / rows.cell) - 1,
  );
  const last = Math.min(
    n - 1,
    Math.floor((Math.max(za, zb) - rows.z0) / rows.cell) + 1,
  );
  if (first > last) return;
  const range = g.drawRange;
  const [start, count] = [range.start, range.count];
  g.setDrawRange(
    rows.starts[first]! * 3,
    (rows.starts[last + 1]! - rows.starts[first]!) * 3,
  );
  try {
    THREE.Mesh.prototype.raycast.call(this, raycaster, hits);
  } finally {
    g.setDrawRange(start, count);
  }
}

/** A surface (a driveway, a lawn) over the ground: its outline filled,
 * finely subdivided so it follows the ground's slope, and edged down to
 * the ground. */
function surface(
  item: Item3d,
  kind: string,
  ground: Ground,
  toWorld: (x: number, z: number) => Vec2,
  cut: ((x: number, z: number) => boolean) | null = null,
): THREE.Group {
  const site = item.site!;
  const spec = SURFACES[kind] ?? SURFACES["concrete"]!;
  const outline = site.points;
  const parts = new Parts();
  const top = (x: number, z: number) => ground(x, z) + spec.lift;
  /** Where the ground is dug out for the house (a walk-out's lower level,
   * a garage a step down): no surface there, or it'd cover their floors. */
  const dugOut = (x: number, z: number) => {
    if (!cut) return false;
    const [wx, wz] = toWorld(x, z);
    return cut(wx, wz);
  };
  let picked: {
    material: THREE.Material;
    rows: { z0: number; cell: number; starts: number[] };
  } | null = null;
  if (outline.length >= 3) {
    const pos: number[] = [];
    const uv: number[] = [];
    const emit = (p: Vec2) => {
      pos.push(p[0], top(p[0], p[1]), p[1]);
      const [wx, wz] = toWorld(p[0], p[1]);
      uv.push(wx / spec.tile, wz / spec.tile);
    };
    const cells = cellTriangles(outline, SURFACE_CELL_M);
    const starts: number[] = [];
    for (const row of cells.rows) {
      starts.push(pos.length / 9);
      for (const [a, b, c] of row) {
        if (dugOut((a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3))
          continue;
        // Facing up: counter-clockwise in (x, z) is clockwise seen from
        // above (+y) — so emit a, c, b.
        emit(a);
        emit(c);
        emit(b);
      }
    }
    starts.push(pos.length / 9);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals();
    const m = new THREE.MeshStandardMaterial({
      color: site.tint ?? spec.color,
      roughness: spec.rough,
      map: surfaceTexture(kind),
    });
    parts.add(g, m);
    picked = {
      material: m,
      rows: { z0: cells.z0, cell: SURFACE_CELL_M, starts },
    };
    // The slab's edge, down into the ground — in short steps, so it
    // follows the ground between the corners as the top does.
    const edge: number[] = [];
    for (let i = 0; i < outline.length; i++) {
      const p = outline[i]!;
      const q = outline[(i + 1) % outline.length]!;
      const n = Math.max(
        1,
        Math.min(400, Math.ceil(Math.hypot(q[0] - p[0], q[1] - p[1]) / 0.3)),
      );
      for (let s = 0; s < n; s++) {
        const a: Vec2 = [
          p[0] + ((q[0] - p[0]) * s) / n,
          p[1] + ((q[1] - p[1]) * s) / n,
        ];
        const b: Vec2 = [
          p[0] + ((q[0] - p[0]) * (s + 1)) / n,
          p[1] + ((q[1] - p[1]) * (s + 1)) / n,
        ];
        if (dugOut((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)) continue;
        const ya = top(a[0], a[1]);
        const yb = top(b[0], b[1]);
        const ga = ground(a[0], a[1]) - 0.05;
        const gb = ground(b[0], b[1]) - 0.05;
        edge.push(a[0], ya, a[1], b[0], yb, b[1], b[0], gb, b[1]);
        edge.push(a[0], ya, a[1], b[0], gb, b[1], a[0], ga, a[1]);
      }
    }
    const eg = new THREE.BufferGeometry();
    eg.setAttribute("position", new THREE.Float32BufferAttribute(edge, 3));
    eg.computeVertexNormals();
    parts.add(
      eg,
      mat(
        spec.color === SURFACES["lawn"]!.color ? "#5b4636" : spec.color,
        0.95,
      ),
    );
    // Planting and stones scattered inside it.
    const xs = outline.map((p) => p[0]);
    const zs = outline.map((p) => p[1]);
    const [x0, x1, z0, z1] = [
      Math.min(...xs),
      Math.max(...xs),
      Math.min(...zs),
      Math.max(...zs),
    ];
    let seed = Math.round((x1 - x0) * 1000 + (z1 - z0) * 77) || 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const scatter = (step: number, fn: (x: number, z: number) => void) => {
      for (let x = x0 + step / 2; x < x1; x += step)
        for (let z = z0 + step / 2; z < z1; z += step) {
          const jx = x + (rand() - 0.5) * step * 0.6;
          const jz = z + (rand() - 0.5) * step * 0.6;
          if (pointIn(outline, jx, jz) && !dugOut(jx, jz)) fn(jx, jz);
        }
    };
    if (kind === "flowers") {
      const colors = ["#d94f70", "#f2c14e", "#9b5de5", "#f78154", "#ffffff"];
      scatter(0.3, (x, z) => {
        parts.blob(x, top(x, z) + 0.12, z, 0.1, mat("#4f7d3a", 1));
        parts.blob(
          x,
          top(x, z) + 0.22,
          z,
          0.06,
          mat(colors[Math.floor(rand() * colors.length)]!, 0.8),
        );
      });
    } else if (kind === "shrubs") {
      scatter(0.9, (x, z) => {
        const r = 0.28 + rand() * 0.18;
        parts.blob(
          x,
          top(x, z) + r * 0.8,
          z,
          r,
          mat(rand() < 0.5 ? "#4f7d3a" : "#5e8c42", 1),
          0.85,
        );
      });
    } else if (kind === "mulch") {
      scatter(1.2, (x, z) => {
        if (rand() < 0.5)
          parts.blob(x, top(x, z) + 0.18, z, 0.22, mat("#5e8c42", 1), 0.8);
      });
    } else if (kind === "rock") {
      scatter(0.5, (x, z) => {
        if (rand() < 0.6)
          parts.blob(
            x,
            top(x, z),
            z,
            0.08 + rand() * 0.1,
            mat("#8f8c86", 0.9),
            0.5,
          );
      });
    } else if (kind === "stepping") {
      scatter(0.6, (x, z) => {
        const g = new THREE.CylinderGeometry(0.22, 0.24, 0.05, 14);
        g.scale(1, 1, 0.8 + rand() * 0.3);
        g.translate(x, top(x, z) + 0.02, z);
        parts.add(g, mat("#b7b2a8", 0.9));
      });
    }
  }
  const out = parts.group();
  // Its top, picked by rows of the grid it was cut along.
  if (picked)
    for (const c of out.children) {
      const mesh = c as THREE.Mesh;
      if (mesh.material !== picked.material) continue;
      mesh.userData["rows"] = picked.rows;
      mesh.raycast = rowRaycast;
    }
  return out;
}

/** A fence (or wall, hedge, edging) along the line: posts at its corners
 * and every few metres, what fills between them, all following the
 * ground. */
function fence(item: Item3d, kind: string, ground: Ground): THREE.Group {
  const site = item.site!;
  const parts = new Parts();
  const h = site.height;
  const pts = site.closed ? [...site.points, site.points[0]!] : site.points;
  // Posts: at each corner, and in between no more than `span` apart.
  const span = kind === "rail" ? 2.4 : kind === "chainlink" ? 3 : 2.4;
  const posts: Vec2[] = [];
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.ceil(len / span));
    for (let k = 0; k < n; k++)
      posts.push([
        a[0] + ((b[0] - a[0]) * k) / n,
        a[1] + ((b[1] - a[1]) * k) / n,
      ]);
  }
  posts.push(pts[pts.length - 1]!);
  const tint = site.tint;
  const wood = mat(tint ?? "#8b6a4f", 0.85);
  const white = mat(tint ?? "#f2f2ef", 0.6);
  const black = mat(tint ?? "#2e3236", 0.5);
  const grey = mat(tint ?? "#8a9096", 0.5);
  const g0 = (p: Vec2) => ground(p[0], p[1]);
  for (let i = 0; i + 1 < posts.length; i++) {
    const a = posts[i]!;
    const b = posts[i + 1]!;
    const ga = g0(a);
    const gb = g0(b);
    const lo = Math.min(ga, gb);
    const mid = (ga + gb) / 2;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len < 0.02) continue;
    const ux = (b[0] - a[0]) / len;
    const uz = (b[1] - a[1]) / len;
    const at = (t: number): Vec2 => [a[0] + ux * t, a[1] + uz * t];
    switch (kind) {
      case "privacy":
      case "vinyl": {
        const m = kind === "vinyl" ? white : wood;
        parts.along(a, b, lo, mid - lo + h - 0.05, 0.03, m);
        parts.along(a, b, mid + h - 0.06, 0.06, 0.06, m);
        if (kind === "privacy")
          for (let t = 0.14; t < len; t += 0.14)
            parts.along(
              at(t - 0.004),
              at(t + 0.004),
              lo,
              mid - lo + h - 0.06,
              0.035,
              mat("#6e5240", 0.9),
            );
        break;
      }
      case "picket": {
        for (const y of [0.25, h - 0.25])
          parts.along(a, b, mid + y, 0.06, 0.025, white);
        for (let t = 0.06; t < len - 0.03; t += 0.13)
          parts.along(
            at(t - 0.035),
            at(t + 0.035),
            g0(at(t)),
            h - 0.04,
            0.02,
            white,
          );
        break;
      }
      case "chainlink": {
        parts.along(
          a,
          b,
          lo,
          mid - lo + h - 0.03,
          0.01,
          mat("#9aa3ab", 0.5, 0.45),
        );
        const g = new THREE.CylinderGeometry(0.02, 0.02, len, 8);
        g.rotateZ(Math.PI / 2);
        g.rotateY(-Math.atan2(uz, ux));
        g.translate((a[0] + b[0]) / 2, mid + h - 0.02, (a[1] + b[1]) / 2);
        parts.add(g, grey);
        break;
      }
      case "rail": {
        for (const y of [h * 0.3, h * 0.62, h * 0.92])
          parts.along(a, b, mid + y - 0.05, 0.1, 0.08, wood, 0.03);
        break;
      }
      case "metal": {
        for (const y of [0.1, h - 0.06])
          parts.along(a, b, mid + y, 0.03, 0.03, black);
        for (let t = 0.11; t < len - 0.05; t += 0.12)
          parts.along(
            at(t - 0.008),
            at(t + 0.008),
            g0(at(t)),
            h - 0.02,
            0.016,
            black,
          );
        break;
      }
      case "retaining": {
        parts.along(
          a,
          b,
          lo - 0.1,
          mid - lo + h + 0.1,
          Math.max(0.2, site.thick),
          mat(tint ?? "#9b968c", 0.9),
          0.01,
        );
        parts.along(
          a,
          b,
          mid + h,
          0.06,
          Math.max(0.2, site.thick) + 0.04,
          mat("#b8b3a8", 0.85),
        );
        break;
      }
      case "hedge":
        break;
      case "edging": {
        parts.along(
          a,
          b,
          lo - 0.05,
          mid - lo + Math.max(0.06, h),
          0.03,
          mat(tint ?? "#4a3a2c", 0.8),
        );
        break;
      }
    }
  }
  // A hedge: one clipped run per stretch of its line, leafy on top.
  if (kind === "hedge") {
    const thick = Math.max(0.3, site.thick);
    const leaf = mat(tint ?? "#4f7d3a", 1);
    const leaf2 = mat(tint ?? "#5c8a44", 1);
    let seed = 11;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i]!;
      const b = pts[i + 1]!;
      const ga = g0(a);
      const gb = g0(b);
      const lo = Math.min(ga, gb);
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 0.02) continue;
      const ux = (b[0] - a[0]) / len;
      const uz = (b[1] - a[1]) / len;
      // Run on past each corner by half its thickness, so corners close.
      const e = thick / 2;
      const a2: Vec2 = [a[0] - ux * e, a[1] - uz * e];
      const b2: Vec2 = [b[0] + ux * e, b[1] + uz * e];
      parts.along(
        a2,
        b2,
        lo - 0.05,
        (ga + gb) / 2 - lo + h * 0.85,
        thick,
        leaf,
        Math.min(0.2, thick / 2 - 0.01),
      );
      for (let t = 0; t <= len; t += 0.45) {
        const x = a[0] + ux * t + (rand() - 0.5) * 0.1;
        const z = a[1] + uz * t + (rand() - 0.5) * 0.1;
        parts.blob(
          x,
          g0([x, z]) + h * 0.8,
          z,
          thick * (0.32 + rand() * 0.12),
          rand() < 0.5 ? leaf : leaf2,
          0.7,
        );
      }
    }
  }
  // The posts.
  const postFor: Record<string, [number, THREE.Material, boolean] | null> = {
    privacy: [0.1, wood, false],
    vinyl: [0.12, white, false],
    picket: [0.09, white, false],
    chainlink: [0.05, grey, true],
    rail: [0.14, wood, true],
    metal: [0.05, black, false],
    retaining: null,
    hedge: null,
    edging: null,
  };
  const p = postFor[kind];
  if (p)
    for (const at of posts)
      parts.post(at, g0(at) - 0.05, h + 0.1, p[0], p[1], p[2]);
  return parts.group();
}

/** The site feature an item stands for, or null where it isn't one. */
export function siteModel(
  item: Item3d,
  ground: Ground,
  cut: ((x: number, z: number) => boolean) | null = null,
): THREE.Group | null {
  const site = item.site;
  if (!site || site.points.length < 2) return null;
  const a = item.angle;
  const toWorld = (x: number, z: number): Vec2 => [
    item.x + x * Math.cos(a) + z * Math.sin(a),
    item.z - x * Math.sin(a) + z * Math.cos(a),
  ];
  const local: Ground = (x, z) => {
    const [wx, wz] = toWorld(x, z);
    return ground(wx, wz) - item.y0;
  };
  if (site.surface) return surface(item, site.surface, local, toWorld, cut);
  if (site.fence) return fence(item, site.fence, local);
  return null;
}
