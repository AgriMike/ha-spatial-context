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
import {
  blendDistance,
  edgeDistances,
  raiseAt,
  raiseOf,
  raiseFor,
  splitRaised,
  subtractPit,
} from "./pits";
import type { Item3d, Pit3d, Vec2 } from "./view3d-api";

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
  /** A wall along a line (back round to its start when `closed`),
   * `thick` across with its corners mitred, from `bottom` up to `top` at
   * each point: one piece, its sides shaded smooth round gentle bends, so
   * a curve reads as a curve. */
  strip(
    line: Vec2[],
    closed: boolean,
    thick: number,
    bottom: (p: Vec2) => number,
    top: (p: Vec2) => number,
    m: THREE.Material,
  ): void {
    const pts: Vec2[] = [];
    for (const q of line) {
      const last = pts[pts.length - 1];
      if (!last || Math.hypot(q[0] - last[0], q[1] - last[1]) > 1e-4)
        pts.push(q);
    }
    if (closed && pts.length > 2) {
      const [a, b] = [pts[0]!, pts[pts.length - 1]!];
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) <= 1e-4) pts.pop();
    }
    const n = pts.length;
    if (n < 2) return;
    const segs = closed ? n : n - 1;
    // Each segment's left-hand normal (x, z).
    const segN = Array.from({ length: segs }, (_, i) => {
      const a = pts[i]!;
      const b = pts[(i + 1) % n]!;
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l] as Vec2;
    });
    const half = thick / 2;
    const left: Vec2[] = [];
    const right: Vec2[] = [];
    /** Each point's side normal, and whether the sides bend smoothly there. */
    const side: Vec2[] = [];
    const smooth: boolean[] = [];
    for (let i = 0; i < n; i++) {
      const nin = closed || i > 0 ? segN[(i - 1 + segs) % segs]! : segN[0]!;
      const nout = closed || i < n - 1 ? segN[i % segs]! : segN[segs - 1]!;
      let mx = nin[0] + nout[0];
      let mz = nin[1] + nout[1];
      const ml = Math.hypot(mx, mz) || 1;
      mx /= ml;
      mz /= ml;
      // Mitred: out along the bisector, far enough to keep the thickness
      // (but not into a spike at a hairpin).
      const k = half / Math.max(0.35, mx * nout[0] + mz * nout[1]);
      const p = pts[i]!;
      left.push([p[0] + mx * k, p[1] + mz * k]);
      right.push([p[0] - mx * k, p[1] - mz * k]);
      side.push([mx, mz]);
      smooth.push(nin[0] * nout[0] + nin[1] * nout[1] > 0.8);
    }
    const yb = pts.map(bottom);
    const yt = pts.map(top);
    const pos: number[] = [];
    const nor: number[] = [];
    type V = [number, number, number];
    /** A triangle, turned to face along `n`, each corner its own normal. */
    const tri = (a: V, b: V, c: V, na: V, nb: V, nc: V, n: V) => {
      const ux = b[0] - a[0];
      const uy = b[1] - a[1];
      const uz = b[2] - a[2];
      const vx = c[0] - a[0];
      const vy = c[1] - a[1];
      const vz = c[2] - a[2];
      const cx = uy * vz - uz * vy;
      const cy = uz * vx - ux * vz;
      const cz = ux * vy - uy * vx;
      if (cx * n[0] + cy * n[1] + cz * n[2] < 0) {
        [b, c] = [c, b];
        [nb, nc] = [nc, nb];
      }
      pos.push(...a, ...b, ...c);
      nor.push(...na, ...nb, ...nc);
    };
    const quad = (a: V, b: V, c: V, d: V, na: V, nb: V, n: V) => {
      tri(a, b, c, na, nb, nb, n);
      tri(a, c, d, na, nb, na, n);
    };
    const up: V = [0, 1, 0];
    for (let i = 0; i < segs; i++) {
      const j = (i + 1) % n;
      const f = segN[i]!;
      for (const s of [1, -1]) {
        const e = s > 0 ? left : right;
        const face: V = [f[0] * s, 0, f[1] * s];
        const ni: V = smooth[i] ? [side[i]![0] * s, 0, side[i]![1] * s] : face;
        const nj: V = smooth[j] ? [side[j]![0] * s, 0, side[j]![1] * s] : face;
        quad(
          [e[i]![0], yb[i]!, e[i]![1]],
          [e[j]![0], yb[j]!, e[j]![1]],
          [e[j]![0], yt[j]!, e[j]![1]],
          [e[i]![0], yt[i]!, e[i]![1]],
          ni,
          nj,
          face,
        );
      }
      quad(
        [left[i]![0], yt[i]!, left[i]![1]],
        [left[j]![0], yt[j]!, left[j]![1]],
        [right[j]![0], yt[j]!, right[j]![1]],
        [right[i]![0], yt[i]!, right[i]![1]],
        up,
        up,
        up,
      );
    }
    // The ends of an open line.
    if (!closed)
      for (const [i, s] of [
        [0, -1],
        [n - 1, 1],
      ] as const) {
        const a = pts[i]!;
        const b = pts[i - s]!;
        const l = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1;
        const out: V = [(a[0] - b[0]) / l, 0, (a[1] - b[1]) / l];
        quad(
          [left[i]![0], yb[i]!, left[i]![1]],
          [right[i]![0], yb[i]!, right[i]![1]],
          [right[i]![0], yt[i]!, right[i]![1]],
          [left[i]![0], yt[i]!, left[i]![1]],
          out,
          out,
          out,
        );
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
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

/** How many times finer a surface is cut where the ground bends (graded,
 * or over the hillside's fold): its pieces about as wide as the terrain's
 * own (0.2 m), so it follows the same curves. */
const SURFACE_SUB = 2;

/** The terrain mesh's widest triangle (its 0.2 m cells' diagonal). */
const TERRAIN_SPAN_M = 0.2 * Math.SQRT2;

/** Whether the ground bends anywhere over a stretch (world x0..x1,
 * z0..z1); where it doesn't, it's one flat or sloping plane. */
export type Bends = (x0: number, z0: number, x1: number, z1: number) => boolean;

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

/** A cell's piece of an outline (a polygon inside the square from xa, za
 * to xb, zb) as triangles, each counter-clockwise in (x, z): a whole
 * square as two, else triangulated as it is. */
function pieceTriangles(
  piece: Vec2[],
  xa: number,
  za: number,
  xb: number,
  zb: number,
  push: (a: Vec2, b: Vec2, c: Vec2) => void,
): void {
  if (piece.length < 3) return;
  const area = Math.abs(polyArea(piece));
  if (area < 1e-9) return;
  if (area >= (xb - xa) * (zb - za) * (1 - 1e-6)) {
    push([xa, za], [xb, za], [xb, zb]);
    push([xa, za], [xb, zb], [xa, zb]);
    return;
  }
  const ring = piece.map(([x, z]) => new THREE.Vector2(x, z));
  for (const [a, b, c] of THREE.ShapeUtils.triangulateShape(ring, []))
    push(piece[a!]!, piece[b!]!, piece[c!]!);
}

/** An outline filled with triangles no wider than `cell`: cut along a
 * grid of that size, each whole square two triangles and each piece the
 * outline crosses triangulated as it is. The cells `split` names (by
 * column and row) are cut `sub` times finer again. Each triangle
 * counter-clockwise in (x, z); by rows of the grid, the first from
 * z = `z0`; `fine` marks those from split cells. */
function cellTriangles(
  outline: Vec2[],
  cell: number,
  split: ((i: number, j: number) => boolean) | null = null,
  sub = 1,
): {
  z0: number;
  rows: { tri: [Vec2, Vec2, Vec2]; fine: boolean }[][];
} {
  let out: { tri: [Vec2, Vec2, Vec2]; fine: boolean }[] = [];
  const rows: (typeof out)[] = [];
  let fine = false;
  const push = (a: Vec2, b: Vec2, c: Vec2) => {
    const turn = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    if (Math.abs(turn) < 1e-12) return;
    out.push({ tri: turn > 0 ? [a, b, c] : [a, c, b], fine });
  };
  const xs = outline.map((p) => p[0]);
  const zs = outline.map((p) => p[1]);
  const i0 = Math.floor(Math.min(...xs) / cell);
  const i1 = Math.ceil(Math.max(...xs) / cell);
  const j0 = Math.floor(Math.min(...zs) / cell);
  const j1 = Math.ceil(Math.max(...zs) / cell);
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
      fine = sub > 1 && !!split?.(i, j);
      if (!fine) {
        pieceTriangles(piece, xa, za, xb, zb, push);
        continue;
      }
      // On bending ground: the same, a finer grid's cells at a time.
      const s = cell / sub;
      if (Math.abs(polyArea(piece)) >= cell * cell * (1 - 1e-6)) {
        for (let b = 0; b < sub; b++)
          for (let a = 0; a < sub; a++) {
            const xc = xa + a * s;
            const zc = za + b * s;
            const xd = a === sub - 1 ? xb : xc + s;
            const zd = b === sub - 1 ? zb : zc + s;
            push([xc, zc], [xd, zc], [xd, zd]);
            push([xc, zc], [xd, zd], [xc, zd]);
          }
        continue;
      }
      for (let b = 0; b < sub; b++) {
        const zc = za + b * s;
        const zd = b === sub - 1 ? zb : za + (b + 1) * s;
        const strip = clipAxis(clipAxis(piece, 1, zc, true), 1, zd, false);
        if (strip.length < 3) continue;
        for (let a = 0; a < sub; a++) {
          const xc = xa + a * s;
          const xd = a === sub - 1 ? xb : xa + (a + 1) * s;
          const bit = clipAxis(clipAxis(strip, 0, xc, true), 0, xd, false);
          pieceTriangles(bit, xc, zc, xd, zd, push);
        }
      }
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
  bends: Bends | null = null,
  pits: Vec2[][] = [],
  raised: Pit3d[] = [],
): THREE.Group {
  const site = item.site!;
  const spec = SURFACES[kind] ?? SURFACES["concrete"]!;
  const outline = site.points;
  const parts = new Parts();
  const cell = SURFACE_CELL_M;
  /** A cell (by column and row) on bending ground, or beside it: cut
   * finer, and lifted clear of the terrain over its curves. One cell
   * round counts too, so where a finer cell meets a coarse one the ground
   * is flat and their edges agree. */
  const ox = outline.map((p) => p[0]);
  const oz = outline.map((p) => p[1]);
  const ci0 = Math.floor(Math.min(...ox) / cell) - 2;
  const cj0 = Math.floor(Math.min(...oz) / cell) - 2;
  const ccols = Math.ceil(Math.max(...ox) / cell) + 3 - ci0;
  const crows = Math.ceil(Math.max(...oz) / cell) + 3 - cj0;
  /** Each cell's answer, once worked out: 1 coarse, 2 fine. */
  const fineCells = new Uint8Array(bends ? ccols * crows : 0);
  const fineAt = (i: number, j: number): boolean => {
    if (!bends) return false;
    const a = i - ci0;
    const b = j - cj0;
    const k = a >= 0 && b >= 0 && a < ccols && b < crows ? b * ccols + a : -1;
    if (k >= 0 && fineCells[k]) return fineCells[k] === 2;
    const corners = [
      toWorld((i - 1) * cell, (j - 1) * cell),
      toWorld((i + 2) * cell, (j - 1) * cell),
      toWorld((i - 1) * cell, (j + 2) * cell),
      toWorld((i + 2) * cell, (j + 2) * cell),
    ];
    const wx = corners.map((c) => c[0]);
    const wz = corners.map((c) => c[1]);
    const v = bends(
      Math.min(...wx),
      Math.min(...wz),
      Math.max(...wx),
      Math.max(...wz),
    );
    if (k >= 0) fineCells[k] = v ? 2 : 1;
    return v;
  };
  /** How far the terrain can rise above a straight line between two of
   * the surface's points on curved ground (both meshes are straight
   * between their points): the bend there times the two spans. */
  const subCell = cell / SURFACE_SUB;
  const SPAN = (1.3 * ((subCell * Math.SQRT2) ** 2 + TERRAIN_SPAN_M ** 2)) / 8;
  // Per-point values, worked out once, in flat arrays over the finer
  // grid's points (the cells round a point share it; the bends and slopes
  // sample its neighbours); points off that grid (on the outline) are
  // simply worked out each time.
  const li0 = Math.floor(Math.min(...ox) / subCell) - 4;
  const lj0 = Math.floor(Math.min(...oz) / subCell) - 4;
  const lcols = Math.ceil(Math.max(...ox) / subCell) + 5 - li0;
  const lrows = Math.ceil(Math.max(...oz) / subCell) + 5 - lj0;
  /** A point's slot in the arrays, or -1 off the finer grid's points. */
  const slot = (x: number, z: number): number => {
    const fx = x / subCell;
    const fz = z / subCell;
    const i = Math.round(fx);
    const j = Math.round(fz);
    if (Math.abs(fx - i) > 1e-6 || Math.abs(fz - j) > 1e-6) return -1;
    const a = i - li0;
    const b = j - lj0;
    if (a < 0 || b < 0 || a >= lcols || b >= lrows) return -1;
    return b * lcols + a;
  };
  const cache = () => new Float32Array(lcols * lrows).fill(NaN);
  const heights = cache();
  const tops = cache();
  const slopeX = bends ? cache() : null;
  const slopeZ = bends ? cache() : null;
  const groundAt = (x: number, z: number) => {
    const k = slot(x, z);
    if (k < 0) return ground(x, z);
    let y = heights[k]!;
    if (y !== y) y = heights[k] = ground(x, z);
    return y;
  };
  const extraLift = (x: number, z: number): number => {
    const g = 2 * groundAt(x, z);
    const f = subCell;
    // Along each axis (f apart) and each diagonal (f√2 apart).
    const most = Math.max(
      Math.abs(groundAt(x + f, z) + groundAt(x - f, z) - g),
      Math.abs(groundAt(x, z + f) + groundAt(x, z - f) - g),
      Math.abs(groundAt(x + f, z + f) + groundAt(x - f, z - f) - g) / 2,
      Math.abs(groundAt(x + f, z - f) + groundAt(x - f, z + f) - g) / 2,
    );
    return Math.min(0.08, (most / (f * f)) * SPAN);
  };
  /** The top's height at a point. */
  const topAt = (x: number, z: number) => {
    let y = groundAt(x, z) + spec.lift;
    // The point's own cell, or on a cell line the cells either side.
    const fx = x / cell;
    const fz = z / cell;
    const ia = Math.floor(fx - 1e-6);
    const ib = Math.floor(fx + 1e-6);
    const ja = Math.floor(fz - 1e-6);
    const jb = Math.floor(fz + 1e-6);
    if (fineAt(ia, ja) || fineAt(ib, ja) || fineAt(ia, jb) || fineAt(ib, jb))
      y += extraLift(x, z);
    return y;
  };
  const top = (x: number, z: number) => {
    const k = slot(x, z);
    if (k < 0) return topAt(x, z);
    let y = tops[k]!;
    if (y !== y) y = tops[k] = topAt(x, z);
    return y;
  };
  /** The ground's own normal at a point (smooth shading over curves),
   * pushed onto `out`. */
  const blended = raised.some((r) => r.blend);
  /** How far raised areas lift a point of a piece (inside those `inside`,
   * by index). */
  const upFor = (x: number, z: number, inside: number[]) =>
    raised.length ? raiseFor(raised, x, z, inside) : 0;
  const pushSlopeNormal = (
    out: number[],
    x: number,
    z: number,
    inside: number[] = [],
  ) => {
    const k = slot(x, z);
    let gx = k < 0 ? NaN : slopeX![k]!;
    let gz = k < 0 ? NaN : slopeZ![k]!;
    if (gx !== gx) {
      const e = subCell;
      gx = (groundAt(x + e, z) - groundAt(x - e, z)) / (2 * e);
      gz = (groundAt(x, z + e) - groundAt(x, z - e)) / (2 * e);
      if (k >= 0) {
        slopeX![k] = gx;
        slopeZ![k] = gz;
      }
    }
    if (blended) {
      // A raised area's blend slopes it too (on the piece's own side of
      // a sharp edge).
      const e = 0.1;
      gx += (upFor(x + e, z, inside) - upFor(x - e, z, inside)) / (2 * e);
      gz += (upFor(x, z + e, inside) - upFor(x, z - e, inside)) / (2 * e);
    }
    const l = Math.hypot(gx, 1, gz);
    out.push(-gx / l, 1 / l, -gz / l);
  };
  /** Where the ground is dug out for the house (a walk-out's lower level,
   * a garage a step down): no surface there, or it'd cover their floors. */
  const inHole = (x: number, z: number) => {
    if (!cut) return false;
    const [wx, wz] = toWorld(x, z);
    return cut(wx, wz);
  };
  /** In the house's dug-out, or in a dug-out area. */
  const dugOut = (x: number, z: number) =>
    inHole(x, z) || pits.some((p) => pointIn(p, x, z));
  let picked: {
    material: THREE.Material;
    rows: { z0: number; cell: number; starts: number[] };
  } | null = null;
  if (outline.length >= 3) {
    const pos: number[] = [];
    const uv: number[] = [];
    const nor: number[] = [];
    /** Lifted clear of the terrain over a blend's curve, as over the
     * grading's (see extraLift): smootherstep's sharpest bend is about
     * 5.8 times its height over its run squared. */
    const blendLift = (x: number, z: number) => {
      let most = 0;
      for (const r of raised) {
        const d = blendDistance(r, x, z);
        if (d === null) continue;
        // Easing off across the blend (both sides of the edge alike), so
        // the lift has no edge of its own.
        const t = 1 - d / r.blend!;
        const ease = t * t * (3 - 2 * t);
        most = Math.max(
          most,
          ((5.8 * r.depth * SPAN) / (r.blend! * r.blend!)) * ease,
        );
        // Where it wraps round a wall's end, the ground climbs steeply
        // out from under the wall: a little more, near the wall.
        const [hard] = edgeDistances(r, x, z);
        if (hard < 0.6 && !pointIn(r.points, x, z)) {
          const s = 1 - d / r.blend!;
          const v = r.depth * s * s * s * (s * (s * 6 - 15) + 10);
          most = Math.max(most, Math.min(0.08, 0.25 * v * (1 - hard / 0.6)));
        }
      }
      return Math.min(0.08, most);
    };
    const emit = (p: Vec2, inside: number[] = []) => {
      const up = raised.length ? upFor(p[0], p[1], inside) : 0;
      const lift = blended ? blendLift(p[0], p[1]) : 0;
      pos.push(p[0], top(p[0], p[1]) + up + lift, p[1]);
      const [wx, wz] = toWorld(p[0], p[1]);
      uv.push(wx / spec.tile, wz / spec.tile);
    };
    const cells = cellTriangles(outline, cell, fineAt, SURFACE_SUB);
    const starts: number[] = [];
    const n = new THREE.Vector3();
    const u = new THREE.Vector3();
    const w = new THREE.Vector3();
    for (const row of cells.rows) {
      starts.push(pos.length / 9);
      for (const { tri, fine } of row) {
        const [a0, b0, c0] = tri;
        if (inHole((a0[0] + b0[0] + c0[0]) / 3, (a0[1] + b0[1] + c0[1]) / 3))
          continue;
        // Cut exactly along any dug-out area's outline it reaches.
        let pieces: Vec2[][] = [tri];
        for (const p of pits) {
          const xs3 = [a0[0], b0[0], c0[0]];
          const zs3 = [a0[1], b0[1], c0[1]];
          if (
            Math.max(...xs3) < Math.min(...p.map((q) => q[0])) ||
            Math.min(...xs3) > Math.max(...p.map((q) => q[0])) ||
            Math.max(...zs3) < Math.min(...p.map((q) => q[1])) ||
            Math.min(...zs3) > Math.max(...p.map((q) => q[1]))
          )
            continue;
          pieces = pieces.flatMap((piece) => subtractPit(piece, p));
        }
        // And along any raised area's: the piece inside it lifted.
        const lifted = raised.length
          ? pieces.flatMap((piece) => splitRaised(piece, raised))
          : pieces.map((points) => ({ points, inside: [] as number[] }));
        for (const { points: piece, inside } of lifted)
          for (let f = 1; f + 1 < piece.length; f++) {
            const [a, b, c] = [piece[0]!, piece[f]!, piece[f + 1]!];
            // Facing up: counter-clockwise in (x, z) is clockwise seen from
            // above (+y) — so emit a, c, b.
            emit(a, inside);
            emit(c, inside);
            emit(b, inside);
            if (fine) {
              // Smooth over the curves, as the terrain is shaded.
              pushSlopeNormal(nor, a[0], a[1], inside);
              pushSlopeNormal(nor, c[0], c[1], inside);
              pushSlopeNormal(nor, b[0], b[1], inside);
            } else {
              // One plane: its face's own.
              const k = pos.length - 9;
              u.set(
                pos[k + 3]! - pos[k]!,
                pos[k + 4]! - pos[k + 1]!,
                pos[k + 5]! - pos[k + 2]!,
              );
              w.set(
                pos[k + 6]! - pos[k]!,
                pos[k + 7]! - pos[k + 1]!,
                pos[k + 8]! - pos[k + 2]!,
              );
              n.crossVectors(u, w).normalize();
              for (let q = 0; q < 3; q++) nor.push(n.x, n.y, n.z);
            }
          }
      }
    }
    starts.push(pos.length / 9);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    const m = new THREE.MeshStandardMaterial({
      color: site.tint ?? spec.color,
      roughness: spec.rough,
      map: surfaceTexture(kind),
    });
    parts.add(g, m);
    picked = {
      material: m,
      rows: { z0: cells.z0, cell, starts },
    };
    // The slab's edge, down into the ground — in short steps, so it
    // follows the ground between the corners as the top does.
    const edge: number[] = [];
    for (let i = 0; i < outline.length; i++) {
      const p = outline[i]!;
      const q = outline[(i + 1) % outline.length]!;
      const n = Math.max(
        1,
        Math.min(
          800,
          Math.ceil(
            Math.hypot(q[0] - p[0], q[1] - p[1]) / (bends ? 0.15 : 0.3),
          ),
        ),
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
        const ua = raiseAt(raised, a[0], a[1]);
        const ub = raiseAt(raised, b[0], b[1]);
        const ya = top(a[0], a[1]) + ua;
        const yb = top(b[0], b[1]) + ub;
        const ga = ground(a[0], a[1]) + ua - 0.05;
        const gb = ground(b[0], b[1]) + ub - 0.05;
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
    // Planting and stones scattered inside it (up on any raised area).
    const topUp = (x: number, z: number) => top(x, z) + raiseAt(raised, x, z);
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
        parts.blob(x, topUp(x, z) + 0.12, z, 0.1, mat("#4f7d3a", 1));
        parts.blob(
          x,
          topUp(x, z) + 0.22,
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
    } else if (kind === "rock") {
      scatter(0.5, (x, z) => {
        if (rand() < 0.6)
          parts.blob(
            x,
            topUp(x, z),
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
        g.translate(x, topUp(x, z) + 0.02, z);
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
function fence(
  item: Item3d,
  kind: string,
  ground: Ground,
  plain: Ground,
): THREE.Group {
  const site = item.site!;
  const parts = new Parts();
  const h = site.height;
  const pts = site.closed ? [...site.points, site.points[0]!] : site.points;
  // Posts: at each corner, and in between no more than `span` apart (a
  // hog panel fence: a panel from each placed point to the next).
  const span =
    kind === "hog"
      ? Infinity
      : kind === "rail"
        ? 2.4
        : kind === "chainlink"
          ? 3
          : 2.4;
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
  const wire = mat("#b4b9bd", 0.45, 0.7);
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
      case "hog": {
        // A kick board on edge along the foot, a welded-wire panel (10 by
        // 15 cm) above it, a rail on edge under a flat cap.
        const foot = mid + 0.2;
        const rail = mid + h - 0.12;
        parts.along(a, b, lo - 0.05, foot - lo + 0.05, 0.04, wood);
        for (let t = 0.1; t < len - 0.05; t += 0.1)
          parts.post(at(t), foot, rail - foot, 0.006, wire);
        for (let y = foot + 0.05; y < rail - 0.02; y += 0.15)
          parts.along(a, b, y, 0.006, 0.006, wire);
        parts.along(a, b, rail, 0.1, 0.04, wood);
        parts.along(a, b, rail + 0.1, 0.04, 0.14, wood);
        break;
      }
      case "retaining":
        // Built in one piece below.
        break;
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
  // A retaining wall: one piece along its line (round its curves too),
  // and a cap. Built up from the site's own grade (half a metre at a
  // time), it stays put as the ground is shaped round it: its foot goes
  // `depth` below whichever is lower, so it always meets the ground.
  if (kind === "retaining") {
    const line: Vec2[] = [];
    for (let i = 0; i + 1 < pts.length; i++) {
      const a = pts[i]!;
      const b = pts[i + 1]!;
      const n = Math.max(
        1,
        Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.5),
      );
      for (let k = 0; k < n; k++)
        line.push([
          a[0] + ((b[0] - a[0]) * k) / n,
          a[1] + ((b[1] - a[1]) * k) / n,
        ]);
    }
    line.push(pts[pts.length - 1]!);
    const thick = Math.max(0.2, site.thick);
    const depth = site.depth ?? 0.3;
    const topAt = (q: Vec2) => plain(q[0], q[1]) + h;
    parts.strip(
      line,
      site.closed,
      thick,
      (q) => Math.min(g0(q), plain(q[0], q[1])) - depth,
      topAt,
      mat(tint ?? "#9b968c", 0.9),
    );
    parts.strip(
      line,
      site.closed,
      thick + 0.05,
      topAt,
      (q) => topAt(q) + 0.06,
      mat("#b8b3a8", 0.85),
    );
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
    hog: [0.09, wood, false],
    retaining: null,
    hedge: null,
    edging: null,
  };
  const p = postFor[kind];
  if (p)
    for (const at of posts)
      // A hog panel fence's posts stop under its cap.
      parts.post(
        at,
        g0(at) - 0.05,
        kind === "hog" ? h + 0.03 : h + 0.1,
        p[0],
        p[1],
        p[2],
      );
  return parts.group();
}

/** Earth faces along an outline, each stretch from `low` up to `high` at
 * its ends, facing its inside (`inward`) or out. */
function earthFaces(
  outline: Vec2[],
  low: (x: number, z: number) => number,
  high: (x: number, z: number) => number,
  inward: boolean,
  only: ((edge: number) => boolean) | null = null,
): THREE.BufferGeometry {
  const side = (polyArea(outline) > 0 ? 1 : -1) * (inward ? 1 : -1);
  const wall: number[] = [];
  for (let i = 0; i < outline.length; i++) {
    if (only && !only(i)) continue;
    const p = outline[i]!;
    const q = outline[(i + 1) % outline.length]!;
    const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    if (len < 1e-4) continue;
    // Left of the edge is inside, for a counter-clockwise outline.
    const nx = (-(q[1] - p[1]) / len) * side;
    const nz = ((q[0] - p[0]) / len) * side;
    const n = Math.max(1, Math.ceil(len / 0.3));
    for (let s = 0; s < n; s++) {
      const a: Vec2 = [
        p[0] + ((q[0] - p[0]) * s) / n,
        p[1] + ((q[1] - p[1]) * s) / n,
      ];
      const b: Vec2 = [
        p[0] + ((q[0] - p[0]) * (s + 1)) / n,
        p[1] + ((q[1] - p[1]) * (s + 1)) / n,
      ];
      const quad: [number, number, number][] = [
        [a[0], low(a[0], a[1]), a[1]],
        [b[0], low(b[0], b[1]), b[1]],
        [b[0], high(b[0], b[1]), b[1]],
        [a[0], high(a[0], a[1]), a[1]],
      ];
      // No face where there's no step to cover.
      if (
        quad[3]![1] - quad[0]![1] < 0.025 &&
        quad[2]![1] - quad[1]![1] < 0.025
      )
        continue;
      const [u, v, w] = [quad[0]!, quad[1]!, quad[2]!];
      const cx = (v[1] - u[1]) * (w[2] - u[2]) - (v[2] - u[2]) * (w[1] - u[1]);
      const cz = (v[0] - u[0]) * (w[1] - u[1]) - (v[1] - u[1]) * (w[0] - u[0]);
      const order =
        cx * nx + cz * nz >= 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2];
      for (const k of order) wall.push(...quad[k]!);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(wall, 3));
  g.computeVertexNormals();
  return g;
}

/** A raised area: the ground lifted straight up inside its outline (the
 * terrain and lawns are lifted there; see pits.ts), with an earth face
 * round its edge from the ground up to it. */
function raisedArea(
  item: Item3d,
  ground: Ground,
  own: Pit3d | null,
): THREE.Group {
  const site = item.site!;
  const up = site.dig ?? 0.5;
  const parts = new Parts();
  if (site.points.length < 3) return parts.group();
  parts.add(
    earthFaces(
      site.points,
      // From the ground just outside it (up its blend, where it blends;
      // see raiseOf) ...
      (x, z) => ground(x, z) + (own ? raiseOf(own, x, z, false) : 0) - 0.02,
      // ... up to its top, past a lawn's lift so no seam shows at the rim.
      (x, z) => ground(x, z) + up + 0.02,
      false,
    ),
    mat(site.tint ?? "#5e4a38", 1),
  );
  return parts.group();
}

/** A dug-out area: the ground lowered straight down inside its outline
 * (the terrain and lawns are cut along it; see pits.ts), with earth walls
 * and a floor following the ground's slope `depth` below it. */
function dig(item: Item3d, ground: Ground): THREE.Group {
  const site = item.site!;
  const depth = site.dig ?? 0.5;
  const outline = site.points;
  const parts = new Parts();
  if (outline.length < 3) return parts.group();
  const floorAt = (x: number, z: number) => ground(x, z) - depth;
  // The floor, cut as a surface is so it follows the ground.
  const pos: number[] = [];
  for (const row of cellTriangles(outline, SURFACE_CELL_M).rows)
    for (const { tri } of row) {
      const [a, b, c] = tri;
      for (const p of [a, c, b]) pos.push(p[0], floorAt(p[0], p[1]), p[1]);
    }
  const floor = new THREE.BufferGeometry();
  floor.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  floor.computeVertexNormals();
  parts.add(floor, mat(site.tint ?? "#7a6450", 1));
  // The walls, facing in, from the ground's edge straight down (up past
  // a lawn's lift too, so no seam shows at the rim).
  parts.add(
    earthFaces(
      outline,
      (x, z) => floorAt(x, z) - 0.01,
      (x, z) => ground(x, z) + 0.02,
      true,
    ),
    mat("#5e4a38", 1),
  );
  return parts.group();
}

/** The site feature an item stands for, or null where it isn't one. */
export function siteModel(
  item: Item3d,
  ground: Ground,
  cut: ((x: number, z: number) => boolean) | null = null,
  bends: Bends | null = null,
  plain: Ground | null = null,
  pits: Pit3d[] | null = null,
  raised: Pit3d[] | null = null,
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
  if (site.surface === "dig") return dig(item, local);

  // The dug-out areas reaching it, in its own frame.
  const toLocal = ([wx, wz]: Vec2): Vec2 => {
    const dx = wx - item.x;
    const dz = wz - item.z;
    return [
      dx * Math.cos(a) - dz * Math.sin(a),
      dx * Math.sin(a) + dz * Math.cos(a),
    ];
  };
  const xs = site.points.map((p) => p[0]);
  const zs = site.points.map((p) => p[1]);
  const localPits = (pits ?? [])
    .map((p) => p.points.map(toLocal))
    .filter(
      (p) =>
        Math.max(...p.map((q) => q[0])) >= Math.min(...xs) &&
        Math.min(...p.map((q) => q[0])) <= Math.max(...xs) &&
        Math.max(...p.map((q) => q[1])) >= Math.min(...zs) &&
        Math.min(...p.map((q) => q[1])) <= Math.max(...zs),
    );
  // The raised areas reaching it, in its own frame.
  const localRaised = (raised ?? [])
    .map((r) => ({ ...r, points: r.points.map(toLocal) }))
    .filter(
      ({ points: p }) =>
        Math.max(...p.map((q) => q[0])) >= Math.min(...xs) &&
        Math.min(...p.map((q) => q[0])) <= Math.max(...xs) &&
        Math.max(...p.map((q) => q[1])) >= Math.min(...zs) &&
        Math.min(...p.map((q) => q[1])) <= Math.max(...zs),
    );
  if (site.surface === "raise")
    return raisedArea(
      item,
      local,
      localRaised.find((r) => r.id === item.id) ?? null,
    );
  if (site.surface)
    return surface(
      item,
      site.surface,
      local,
      toWorld,
      cut,
      bends,
      localPits,
      localRaised,
    );
  /** The site's own grade there, before any shaping (else as drawn). */
  const plainLocal: Ground = plain
    ? (x, z) => {
        const [wx, wz] = toWorld(x, z);
        return plain(wx, wz) - item.y0;
      }
    : local;
  // A fence or hedge on a raised area stands on it (a retaining wall
  // holding one stands on the ground beside it).
  const onRaised: Ground = (x, z) => local(x, z) + raiseAt(localRaised, x, z);
  if (site.fence)
    return site.fence === "retaining"
      ? fence(item, site.fence, local, plainLocal)
      : fence(item, site.fence, onRaised, plainLocal);
  return null;
}
