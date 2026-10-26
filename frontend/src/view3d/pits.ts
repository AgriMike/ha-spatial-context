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

/** A polygon's bounds (min x, min z, max x, max z). */
function bounds(poly: Vec2[]): [number, number, number, number] {
  let [x0, z0, x1, z1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, z] of poly) {
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (z < z0) z0 = z;
    if (z > z1) z1 = z;
  }
  return [x0, z0, x1, z1];
}

/** Whether a triangle's bounds miss a box. */
function misses(
  tri: [Vec2, Vec2, Vec2],
  [x0, z0, x1, z1]: [number, number, number, number],
): boolean {
  const [a, b, c] = tri;
  return (
    Math.max(a[0], b[0], c[0]) < x0 ||
    Math.min(a[0], b[0], c[0]) > x1 ||
    Math.max(a[1], b[1], c[1]) < z0 ||
    Math.min(a[1], b[1], c[1]) > z1
  );
}

/** What's left of a polygon outside a pit's outline: pieces, each a
 * polygon (none when it's all inside; itself when it's all outside). */
export function subtractPit(poly: Vec2[], points: Vec2[]): Vec2[][] {
  let pieces = [poly];
  const box = bounds(poly);
  for (const tri of pitParts(points)) {
    // A triangle clear of it leaves it as it is.
    if (misses(tri, box)) continue;
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
    if (p.depth > most && nearBox(p.points, x, z, 0) && inside(p.points, x, z))
      most = p.depth;
  return most;
}

/** The part of a polygon inside an outline: pieces, each a polygon. */
export function intersectPit(poly: Vec2[], points: Vec2[]): Vec2[][] {
  const out: Vec2[][] = [];
  const box = bounds(poly);
  for (const tri of pitParts(points)) {
    if (misses(tri, box)) continue;
    let piece = poly;
    for (let k = 0; k < 3 && piece.length >= 3; k++)
      piece = clipLine(piece, tri[k]!, tri[(k + 1) % 3]!, true);
    if (piece.length >= 3 && Math.abs(area(piece)) > 1e-9) out.push(piece);
  }
  return out;
}

/** An outline's bounds (min x, min z, max x, max z), worked out once. */
const BOXES = new WeakMap<Vec2[], [number, number, number, number]>();

export function boxOf(points: Vec2[]): [number, number, number, number] {
  let b = BOXES.get(points);
  if (!b) {
    b = [Infinity, Infinity, -Infinity, -Infinity];
    for (const [x, z] of points) {
      b[0] = Math.min(b[0], x);
      b[1] = Math.min(b[1], z);
      b[2] = Math.max(b[2], x);
      b[3] = Math.max(b[3], z);
    }
    BOXES.set(points, b);
  }
  return b;
}

/** Whether a spot is within `reach` of an outline's bounds. */
function nearBox(points: Vec2[], x: number, z: number, reach: number) {
  const [x0, z0, x1, z1] = boxOf(points);
  return (
    x >= x0 - reach && x <= x1 + reach && z >= z0 - reach && z <= z1 + reach
  );
}

/** How far a spot is from an outline's nearest sharp edge and its
 * nearest blended one (edge k runs from point k to the next). */
export function edgeDistances(
  r: Pit3d,
  x: number,
  z: number,
): [number, number] {
  let hard = Infinity;
  let soft = Infinity;
  const pts = r.points;
  for (let k = 0; k < pts.length; k++) {
    const [ax, az] = pts[k]!;
    const [bx, bz] = pts[(k + 1) % pts.length]!;
    const dx = bx - ax;
    const dz = bz - az;
    const ll = dx * dx + dz * dz;
    const t =
      ll > 0
        ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / ll))
        : 0;
    const d = Math.hypot(x - ax - dx * t, z - az - dz * t);
    if (r.hard?.[k]) hard = Math.min(hard, d);
    else soft = Math.min(soft, d);
  }
  return [hard, soft];
}

/** Outside a raised area but within the blend of its blended edges: how
 * far from them (else null). */
export function blendDistance(r: Pit3d, x: number, z: number): number | null {
  if (r.band) return bandDistance(r, x, z);
  if (!r.blend || r.blend <= 0 || !nearBox(r.points, x, z, r.blend))
    return null;
  const [, soft] = edgeDistances(r, x, z);
  return soft < r.blend ? soft : null;
}

/** How far a raised area lifts the ground at a spot: all of its height
 * inside it (`inside`, else as the spot lies). Outside, it eases down
 * across its blend from its blended edges (smootherstep, no crease top or
 * bottom), and to nothing toward its sharp edges (as along a wall),
 * weighed by how near each is: a sharp drop only right at a sharp edge,
 * smooth everywhere else (round a wall's free end too). */
/** How far a spot is from a line (open polyline), and how far along it
 * that nearest point lies, and its whole length. */
function alongLine(
  line: Vec2[],
  x: number,
  z: number,
): [number, number, number] {
  let best = Infinity;
  let at = 0;
  let run = 0;
  for (let k = 0; k + 1 < line.length; k++) {
    const [ax, az] = line[k]!;
    const [bx, bz] = line[k + 1]!;
    const dx = bx - ax;
    const dz = bz - az;
    const ll = dx * dx + dz * dz;
    const len = Math.sqrt(ll);
    const t =
      ll > 0
        ? Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / ll))
        : 0;
    const d = Math.hypot(x - ax - dx * t, z - az - dz * t);
    if (d < best) {
      best = d;
      at = run + t * len;
    }
    run += len;
  }
  return [best, at, run];
}

/** Soil a wall holds back, at a spot in its band: its full height at the
 * wall, rolling down to nothing across the band (smootherstep: level at
 * the wall's top, no crease at the foot), tapering off over the last
 * metre to each free end of the wall. */
export function bandRaise(r: Pit3d, x: number, z: number): number {
  const b = r.blend ?? 0;
  if (!r.band || b <= 0) return 0;
  const [d, s, length] = alongLine(r.band.line, x, z);
  if (d >= b) return 0;
  const t = 1 - d / b;
  const ease = t * t * t * (t * (t * 6 - 15) + 10);
  const f = Math.min(1, b, length / 2);
  const e = f > 0 ? Math.min(1, Math.min(s, length - s) / f) : 1;
  return r.depth * ease * e * e * (3 - 2 * e);
}

/** Within a wall's soil band: how far from the wall (else null). */
export function bandDistance(r: Pit3d, x: number, z: number): number | null {
  if (!r.band || !nearBox(r.points, x, z, 0) || !inside(r.points, x, z))
    return null;
  return alongLine(r.band.line, x, z)[0];
}

export function raiseOf(
  r: Pit3d,
  x: number,
  z: number,
  inside: boolean = nearBox(r.points, x, z, 0) && pitDepthAt([r], x, z) > 0,
): number {
  // A wall's soil: only within its band, nothing on the wall's far side.
  if (r.band) return inside ? bandRaise(r, x, z) : 0;
  if (inside) return r.depth;
  if (!r.blend || r.blend <= 0 || !nearBox(r.points, x, z, r.blend)) return 0;
  const [hard, soft] = edgeDistances(r, x, z);
  if (soft >= r.blend) return 0;
  const t = 1 - soft / r.blend;
  const ease = t * t * t * (t * (t * 6 - 15) + 10);
  // Toward a sharp edge, down to nothing within 15 cm (under the wall
  // along it, mostly); the step this leaves along a blended edge right by
  // a sharp one gets an earth face (see site-models raisedArea).
  const k = Number.isFinite(hard)
    ? Math.min(1, hard / Math.min(r.blend, 0.15))
    : 1;
  const share = k * k * (3 - 2 * k);
  return r.depth * ease * share;
}

/** How far the ground is raised at a spot (0 outside every raised area
 * and its blends). */
export function raiseAt(
  raised: Pit3d[] | undefined,
  x: number,
  z: number,
): number {
  if (!raised) return 0;
  let most = 0;
  for (const r of raised) most = Math.max(most, raiseOf(r, x, z));
  return most;
}

/** raiseAt for a point of a piece known to lie inside the raised areas
 * `inside` (by index) and outside the rest: a point on a sharp edge
 * takes its piece's side. */
export function raiseFor(
  raised: Pit3d[],
  x: number,
  z: number,
  inside: number[],
): number {
  let most = 0;
  raised.forEach((r, k) => {
    most = Math.max(most, raiseOf(r, x, z, inside.includes(k)));
  });
  return most;
}

/** A polygon cut along every raised area's outline it reaches: pieces,
 * each with the raised areas (by index) it lies inside. */
export function splitRaised(
  poly: Vec2[],
  raised: Pit3d[],
  inside: number[] = [],
): { points: Vec2[]; inside: number[] }[] {
  let pieces = [{ points: poly, inside }];
  let [px0, pz0, px1, pz1] = [Infinity, Infinity, -Infinity, -Infinity];
  for (const [x, z] of poly) {
    if (x < px0) px0 = x;
    if (x > px1) px1 = x;
    if (z < pz0) pz0 = z;
    if (z > pz1) pz1 = z;
  }
  raised.forEach((r, k) => {
    const [rx0, rz0, rx1, rz1] = boxOf(r.points);
    if (px1 < rx0 || px0 > rx1 || pz1 < rz0 || pz0 > rz1) return;
    pieces = pieces.flatMap((p) => [
      ...subtractPit(p.points, r.points).map((q) => ({
        points: q,
        inside: p.inside,
      })),
      ...intersectPit(p.points, r.points).map((q) => ({
        points: q,
        inside: [...p.inside, k],
      })),
    ]);
  });
  return pieces;
}
