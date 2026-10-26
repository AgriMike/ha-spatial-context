/**
 * Dug-out areas ("pits"): ground lowered straight down inside an outline,
 * a square indent rather than a graded dip. The terrain and the surfaces
 * over it (lawns, beds) are cut exactly along the outline (see
 * subtractPit), and the pit's own walls and floor are drawn by
 * site-models.ts.
 */
import * as THREE from "three";
import type { Pit3d, Vec2 } from "./view3d-api";

function area(poly: Vec2[]): number {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++)
    a += poly[j]![0] * poly[i]![1] - poly[i]![0] * poly[j]![1];
  return a / 2;
}

/** The part of a polygon on one side of the line through a and b: its
 * left (`left`) or its right. */
function clipLine(poly: Vec2[], a: Vec2, b: Vec2, left: boolean): Vec2[] {
  const side = (p: Vec2) =>
    (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
  const keep = (s: number) => (left ? s >= 0 : s <= 0);
  const out: Vec2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const q = poly[(i + 1) % poly.length]!;
    const sp = side(p);
    const sq = side(q);
    if (keep(sp)) out.push(p);
    if (keep(sp) !== keep(sq) && sp !== sq) {
      const t = sp / (sp - sq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}

/** A pit's outline as counter-clockwise triangles (each convex), worked
 * out once per outline. */
const PARTS = new WeakMap<Vec2[], [Vec2, Vec2, Vec2][]>();

function pitParts(points: Vec2[]): [Vec2, Vec2, Vec2][] {
  let parts = PARTS.get(points);
  if (!parts) {
    const ring = points.map(([x, z]) => new THREE.Vector2(x, z));
    parts = THREE.ShapeUtils.triangulateShape(ring, []).map(([a, b, c]) => {
      const t: [Vec2, Vec2, Vec2] = [points[a!]!, points[b!]!, points[c!]!];
      return area(t) < 0 ? [t[0], t[2], t[1]] : t;
    });
    PARTS.set(points, parts);
  }
  return parts;
}

/** What's left of a polygon outside a pit's outline: pieces, each a
 * polygon (none when it's all inside; itself when it's all outside). */
export function subtractPit(poly: Vec2[], points: Vec2[]): Vec2[][] {
  let pieces = [poly];
  for (const tri of pitParts(points)) {
    const next: Vec2[][] = [];
    for (const piece of pieces) {
      // Outside a convex triangle: beyond its first edge, or within that
      // and beyond its second, or within both and beyond its third.
      let rest = piece;
      for (let k = 0; k < 3 && rest.length >= 3; k++) {
        const a = tri[k]!;
        const b = tri[(k + 1) % 3]!;
        const out = clipLine(rest, a, b, false);
        if (out.length >= 3 && Math.abs(area(out)) > 1e-9) next.push(out);
        rest = clipLine(rest, a, b, true);
      }
    }
    pieces = next;
    if (!pieces.length) break;
  }
  return pieces;
}

/** Whether a stretch (min x, min z, max x, max z) reaches a pit's bounds. */
export function nearPit(
  pit: { box: [number, number, number, number] },
  x0: number,
  z0: number,
  x1: number,
  z1: number,
): boolean {
  const [a, b, c, d] = pit.box;
  return x1 >= a && x0 <= c && z1 >= b && z0 <= d;
}

/** A pit with its bounds (min x, min z, max x, max z). */
export function boxed(pit: Pit3d): Pit3d & {
  box: [number, number, number, number];
} {
  const xs = pit.points.map((p) => p[0]);
  const zs = pit.points.map((p) => p[1]);
  return {
    ...pit,
    box: [Math.min(...xs), Math.min(...zs), Math.max(...xs), Math.max(...zs)],
  };
}

function inside(poly: Vec2[], x: number, z: number): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i]!;
    const [xj, zj] = poly[j]!;
    if (zi > z !== zj > z && x < xi + ((z - zi) * (xj - xi)) / (zj - zi))
      hit = !hit;
  }
  return hit;
}

/** How deep the ground is dug out at a spot (0 outside every pit). */
export function pitDepthAt(
  pits: Pit3d[] | undefined,
  x: number,
  z: number,
): number {
  if (!pits) return 0;
  let most = 0;
  for (const p of pits)
    if (p.depth > most && inside(p.points, x, z)) most = p.depth;
  return most;
}

/** The part of a polygon inside an outline: pieces, each a polygon. */
export function intersectPit(poly: Vec2[], points: Vec2[]): Vec2[][] {
  const out: Vec2[][] = [];
  for (const tri of pitParts(points)) {
    let piece = poly;
    for (let k = 0; k < 3 && piece.length >= 3; k++)
      piece = clipLine(piece, tri[k]!, tri[(k + 1) % 3]!, true);
    if (piece.length >= 3 && Math.abs(area(piece)) > 1e-9) out.push(piece);
  }
  return out;
}

/** How far the ground is raised at a spot (0 outside every raised area). */
export function raiseAt(
  raised: Pit3d[] | undefined,
  x: number,
  z: number,
): number {
  return pitDepthAt(raised, x, z);
}

/** What's left of a polygon, cut along every raised area's outline it
 * reaches: pieces, each with how far up it's raised. */
export function splitRaised(
  poly: Vec2[],
  raised: Pit3d[],
  up = 0,
): { points: Vec2[]; up: number }[] {
  let pieces = [{ points: poly, up }];
  for (const r of raised) {
    const xs = poly.map((p) => p[0]);
    const zs = poly.map((p) => p[1]);
    const rx = r.points.map((p) => p[0]);
    const rz = r.points.map((p) => p[1]);
    if (
      Math.max(...xs) < Math.min(...rx) ||
      Math.min(...xs) > Math.max(...rx) ||
      Math.max(...zs) < Math.min(...rz) ||
      Math.min(...zs) > Math.max(...rz)
    )
      continue;
    pieces = pieces.flatMap((p) => [
      ...subtractPit(p.points, r.points).map((q) => ({ points: q, up: p.up })),
      ...intersectPit(p.points, r.points).map((q) => ({
        points: q,
        up: p.up + r.depth,
      })),
    ]);
  }
  return pieces;
}
