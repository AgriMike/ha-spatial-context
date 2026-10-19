/** The 3D editor's changes to a floor's plan (see floorplan-3d-view.ts):
 * pure functions from a layout to a patch of it, in the plan's own stored
 * units, so a change made in 3D is the same as one made on the plan (one
 * undo step, saved the same way). */

import { catalogItem } from "../canvas/furniture-catalog";
import { distance, nearestPointOnPolyline } from "../canvas/geometry";
import { DEFAULT_WALL_MATERIAL } from "../canvas/materials";
import { newId } from "../ha-client";
import type {
  FloorLayout,
  FurnitureItem,
  Opening,
  OpeningType,
  Room,
  Wall,
} from "../types";

export type Pt = [number, number];
export type LayoutPatch = Partial<
  Pick<FloorLayout, "walls" | "openings" | "furniture" | "rooms">
>;

/** Default sizes, centimetres. */
export const DOOR_WIDTH_CM = 82;
export const WINDOW_WIDTH_CM = 90;
export const NEW_WALL_CM = 10;

const near = (a: Pt, b: Pt, tol: number) =>
  Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol;

/** Where each opening sits on its wall: its segment and how far along it
 * (0-1), so it stays put on the wall when the wall moves. */
function openingSpots(
  layout: FloorLayout,
): Map<string, { seg: number; t: number }> {
  const out = new Map<string, { seg: number; t: number }>();
  for (const o of layout.openings) {
    const wall = layout.walls.find((w) => w.id === o.wallId);
    if (!wall || wall.points.length < 2) continue;
    const { segmentIndex: seg } = nearestPointOnPolyline(wall.points, o.x, o.y);
    const a = wall.points[seg]!;
    const b = wall.points[seg + 1]!;
    const len2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
    const t =
      len2 > 0
        ? ((o.x - a[0]) * (b[0] - a[0]) + (o.y - a[1]) * (b[1] - a[1])) / len2
        : 0;
    out.set(o.id, { seg, t: Math.max(0, Math.min(1, t)) });
  }
  return out;
}

function placeOpenings(
  layout: FloorLayout,
  walls: Wall[],
  spots: Map<string, { seg: number; t: number }>,
): Opening[] {
  return layout.openings.map((o) => {
    const spot = spots.get(o.id);
    const wall = walls.find((w) => w.id === o.wallId);
    if (!spot || !wall) return o;
    const a = wall.points[spot.seg];
    const b = wall.points[spot.seg + 1];
    if (!a || !b) return o;
    return {
      ...o,
      x: a[0] + (b[0] - a[0]) * spot.t,
      y: a[1] + (b[1] - a[1]) * spot.t,
    };
  });
}

/** Moves every wall and room corner lying at a point to a new place —
 * walls meeting there move together, rooms follow their walls — keeping
 * each opening where it was along its wall. */
export function moveCorners(
  layout: FloorLayout,
  moves: { from: Pt; to: Pt }[],
  tol: number,
): LayoutPatch {
  const spots = openingSpots(layout);
  const shift = (p: Pt): Pt => {
    for (const m of moves) if (near(p, m.from, tol)) return [...m.to];
    return p;
  };
  const walls = layout.walls.map((w) => ({
    ...w,
    points: w.points.map((p) => shift(p as Pt)),
  }));
  const rooms = layout.rooms.map((r) => ({
    ...r,
    points: r.points.map((p) => shift(p as Pt)),
  }));
  return { walls, rooms, openings: placeOpenings(layout, walls, spots) };
}

/** A wall segment moved square to itself by `d` (plan units, along its
 * left-hand normal), carrying the walls and rooms joined at its ends. */
export function moveSegment(
  layout: FloorLayout,
  wallId: string,
  seg: number,
  d: number,
  tol: number,
): LayoutPatch {
  const wall = layout.walls.find((w) => w.id === wallId);
  const a = wall?.points[seg] as Pt | undefined;
  const b = wall?.points[seg + 1] as Pt | undefined;
  if (!a || !b) return {};
  const len = distance(a[0], a[1], b[0], b[1]);
  if (len <= 0) return {};
  const nx = -(b[1] - a[1]) / len;
  const ny = (b[0] - a[0]) / len;
  return moveCorners(
    layout,
    [
      { from: a, to: [a[0] + nx * d, a[1] + ny * d] },
      { from: b, to: [b[0] + nx * d, b[1] + ny * d] },
    ],
    tol,
  );
}

/** How far a point is from a segment's line, along its left-hand normal. */
export function offsetFrom(a: Pt, b: Pt, p: Pt): number {
  const len = distance(a[0], a[1], b[0], b[1]);
  if (len <= 0) return 0;
  const nx = -(b[1] - a[1]) / len;
  const ny = (b[0] - a[0]) / len;
  return (p[0] - a[0]) * nx + (p[1] - a[1]) * ny;
}

export function addWall(
  layout: FloorLayout,
  points: Pt[],
  thicknessCm = NEW_WALL_CM,
): { patch: LayoutPatch; id: string } {
  const id = newId("wall");
  const wall: Wall = {
    id,
    material: DEFAULT_WALL_MATERIAL,
    thickness_cm: thicknessCm,
    points: points.map((p) => [p[0], p[1]] as [number, number]),
  };
  return { patch: { walls: [...layout.walls, wall] }, id };
}

export function deleteWall(layout: FloorLayout, id: string): LayoutPatch {
  return {
    walls: layout.walls.filter((w) => w.id !== id),
    openings: layout.openings.filter((o) => o.wallId !== id),
  };
}

export function patchWall(
  layout: FloorLayout,
  id: string,
  patch: Partial<Wall>,
): LayoutPatch {
  return {
    walls: layout.walls.map((w) => (w.id === id ? { ...w, ...patch } : w)),
  };
}

/** Splits a wall's segment with a new corner at a point on it (its
 * openings stay where they are: each sits on whichever part it's on). */
export function insertCorner(
  layout: FloorLayout,
  wallId: string,
  seg: number,
  at: Pt,
): LayoutPatch {
  return {
    walls: layout.walls.map((w) => {
      if (w.id !== wallId) return w;
      const points = [...w.points];
      points.splice(seg + 1, 0, [at[0], at[1]]);
      return { ...w, points };
    }),
  };
}

/** Removes a wall's corner (not one of its two ends of a two-point wall). */
export function deleteCorner(
  layout: FloorLayout,
  wallId: string,
  index: number,
): LayoutPatch {
  const wall = layout.walls.find((w) => w.id === wallId);
  if (!wall || wall.points.length <= 2) return {};
  return {
    walls: layout.walls.map((w) =>
      w.id === wallId
        ? { ...w, points: w.points.filter((_, k) => k !== index) }
        : w,
    ),
  };
}

/** The nearest point on a wall to a spot, kept clear of its ends by half
 * an opening's width (plan units). */
export function spotOnWall(
  wall: Wall,
  p: Pt,
  halfWidth: number,
): { at: Pt; seg: number } | null {
  if (wall.points.length < 2) return null;
  const { point, segmentIndex: seg } = nearestPointOnPolyline(
    wall.points,
    p[0],
    p[1],
  );
  const a = wall.points[seg]!;
  const b = wall.points[seg + 1]!;
  const len = distance(a[0], a[1], b[0], b[1]);
  if (len < halfWidth * 2)
    return { at: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], seg };
  let t =
    ((point[0] - a[0]) * (b[0] - a[0]) + (point[1] - a[1]) * (b[1] - a[1])) /
    (len * len);
  t = Math.max(halfWidth / len, Math.min(1 - halfWidth / len, t));
  return { at: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], seg };
}

export function addOpening(
  layout: FloorLayout,
  wall: Wall,
  at: Pt,
  type: OpeningType,
  width: number,
): { patch: LayoutPatch; id: string } {
  const id = newId("opening");
  const opening: Opening = {
    id,
    wallId: wall.id,
    type,
    x: at[0],
    y: at[1],
    width,
  };
  return { patch: { openings: [...layout.openings, opening] }, id };
}

export function patchOpening(
  layout: FloorLayout,
  id: string,
  patch: Partial<Opening>,
): LayoutPatch {
  return {
    openings: layout.openings.map((o) =>
      o.id === id ? { ...o, ...patch } : o,
    ),
  };
}

export function deleteOpening(layout: FloorLayout, id: string): LayoutPatch {
  return { openings: layout.openings.filter((o) => o.id !== id) };
}

export function addItem(
  layout: FloorLayout,
  kind: string,
  at: Pt,
  rotationDeg: number,
): { patch: LayoutPatch; id: string } | null {
  const entry = catalogItem(kind);
  if (!entry) return null;
  const id = newId("furniture");
  const item: FurnitureItem = {
    id,
    kind: entry.id,
    x: at[0],
    y: at[1],
    rotation_deg: rotationDeg,
    width_cm: entry.w,
    depth_cm: entry.d,
    stroke_width: 1.5,
  };
  return { patch: { furniture: [...layout.furniture, item] }, id };
}

export function patchItem(
  layout: FloorLayout,
  id: string,
  patch: Partial<FurnitureItem>,
): LayoutPatch {
  return {
    furniture: layout.furniture.map((f) =>
      f.id === id ? { ...f, ...patch } : f,
    ),
  };
}

export function deleteItem(layout: FloorLayout, id: string): LayoutPatch {
  return { furniture: layout.furniture.filter((f) => f.id !== id) };
}

export function duplicateItem(
  layout: FloorLayout,
  id: string,
  offset: number,
): { patch: LayoutPatch; id: string } | null {
  const item = layout.furniture.find((f) => f.id === id);
  if (!item) return null;
  const copy: FurnitureItem = {
    ...item,
    id: newId("furniture"),
    x: item.x + offset,
    y: item.y + offset,
  };
  return { patch: { furniture: [...layout.furniture, copy] }, id: copy.id };
}

export function patchRoom(
  layout: FloorLayout,
  id: string,
  patch: Partial<Room>,
): LayoutPatch {
  return {
    rooms: layout.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  };
}

/** A point snapped: to a corner of a wall nearby, else to a grid (plan
 * units). */
export function snapPoint(
  layout: FloorLayout,
  p: Pt,
  grid: number,
  reach: number,
  except?: { wallId: string; index: number },
): Pt {
  let best: Pt | null = null;
  let bestD = reach;
  for (const w of layout.walls)
    w.points.forEach((q, k) => {
      if (except && w.id === except.wallId && k === except.index) return;
      const d = distance(p[0], p[1], q[0], q[1]);
      if (d < bestD) {
        bestD = d;
        best = [q[0], q[1]];
      }
    });
  if (best) return best;
  if (grid <= 0) return p;
  return [Math.round(p[0] / grid) * grid, Math.round(p[1] / grid) * grid];
}

/** A point turned to the nearest 45° from a previous one, at the same
 * distance. */
export function snapAngle(from: Pt, p: Pt): Pt {
  const dx = p[0] - from[0];
  const dy = p[1] - from[1];
  const len = Math.hypot(dx, dy);
  if (len <= 0) return p;
  const step = Math.PI / 4;
  const a = Math.round(Math.atan2(dy, dx) / step) * step;
  return [from[0] + Math.cos(a) * len, from[1] + Math.sin(a) * len];
}

/** A wall line to snap to: on this floor or another of the building, in
 * this floor's plan units, with that floor's level (metres, relative to
 * this one's). */
export interface SnapWall {
  own: boolean;
  a: Pt;
  b: Pt;
  level: number;
}

/** A guide to draw for a snap (plan units, the levels it spans). */
export interface SnapGuide {
  kind: "align" | "wall" | "plumb";
  own: boolean;
  a: Pt;
  b: Pt;
  level: number;
}

/** A point snapped the way a drawing program does it, against the walls
 * of every floor: onto a corner, else lined up with corners (across or
 * along), else at 45° steps from the previous point, else onto a wall's
 * line, else onto a grid. With the guides that explain it. */
export function smartSnap(
  p: Pt,
  walls: SnapWall[],
  opts: {
    reach: number;
    grid: number;
    from?: Pt | null;
    angle: boolean;
    except?: Pt | null;
  },
): { p: Pt; guides: SnapGuide[] } {
  const { reach } = opts;
  const corners: { p: Pt; own: boolean; level: number }[] = [];
  const seen = new Set<string>();
  for (const w of walls)
    for (const c of [w.a, w.b]) {
      if (opts.except && near(c, opts.except, 1e-6)) continue;
      const key = `${c[0].toFixed(2)},${c[1].toFixed(2)},${w.level.toFixed(2)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      corners.push({ p: c, own: w.own, level: w.level });
    }
  // A corner right there (this floor's first).
  let best: (typeof corners)[number] | null = null;
  let bestD = reach;
  for (const c of corners) {
    const d = distance(p[0], p[1], c.p[0], c.p[1]) - (c.own ? 1e-6 : 0);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  if (best)
    return {
      p: [best.p[0], best.p[1]],
      guides: best.own
        ? []
        : [
            {
              kind: "plumb",
              own: false,
              a: best.p,
              b: best.p,
              level: best.level,
            },
          ],
    };
  let q: Pt = opts.from && opts.angle ? snapAngle(opts.from, p) : p;
  // Lined up with a corner, across (x) and along (y).
  const along = reach * 0.6;
  let ax: (typeof corners)[number] | null = null;
  let ay: (typeof corners)[number] | null = null;
  for (const c of corners) {
    const dx = Math.abs(c.p[0] - q[0]);
    const dy = Math.abs(c.p[1] - q[1]);
    if (dx < along && (!ax || dx < Math.abs(ax.p[0] - q[0]))) ax = c;
    if (dy < along && (!ay || dy < Math.abs(ay.p[1] - q[1]))) ay = c;
  }
  const guides: SnapGuide[] = [];
  if (ax || ay) {
    q = [ax ? ax.p[0] : q[0], ay ? ay.p[1] : q[1]];
    for (const c of [ax, ay])
      if (c)
        guides.push({
          kind: "align",
          own: c.own,
          a: c.p,
          b: q,
          level: c.level,
        });
    return { p: q, guides };
  }
  if (opts.from && opts.angle) return { p: q, guides };
  // Onto a wall's line.
  let seg: SnapWall | null = null;
  let segAt: Pt | null = null;
  let segD = reach * 0.6;
  for (const w of walls) {
    const len2 = (w.b[0] - w.a[0]) ** 2 + (w.b[1] - w.a[1]) ** 2;
    if (len2 <= 0) continue;
    let t =
      ((q[0] - w.a[0]) * (w.b[0] - w.a[0]) +
        (q[1] - w.a[1]) * (w.b[1] - w.a[1])) /
      len2;
    t = Math.max(0, Math.min(1, t));
    const at: Pt = [
      w.a[0] + (w.b[0] - w.a[0]) * t,
      w.a[1] + (w.b[1] - w.a[1]) * t,
    ];
    const d = distance(q[0], q[1], at[0], at[1]);
    if (d < segD) {
      segD = d;
      seg = w;
      segAt = at;
    }
  }
  if (seg && segAt)
    return {
      p: segAt,
      guides: [
        { kind: "wall", own: seg.own, a: seg.a, b: seg.b, level: seg.level },
      ],
    };
  if (opts.grid > 0)
    q = [
      Math.round(q[0] / opts.grid) * opts.grid,
      Math.round(q[1] / opts.grid) * opts.grid,
    ];
  return { p: q, guides };
}

/** A wall segment's move (along its normal, `d`) snapped so its line
 * meets a parallel wall's — this floor's or another's. */
export function snapOffset(
  a: Pt,
  b: Pt,
  d: number,
  walls: SnapWall[],
  reach: number,
): { d: number; guide: SnapGuide | null } {
  const len = distance(a[0], a[1], b[0], b[1]);
  if (len <= 0) return { d, guide: null };
  const ux = (b[0] - a[0]) / len;
  const uy = (b[1] - a[1]) / len;
  let best: { d: number; w: SnapWall } | null = null;
  for (const w of walls) {
    const wl = distance(w.a[0], w.a[1], w.b[0], w.b[1]);
    if (wl <= 0) continue;
    const cross = Math.abs(
      ux * ((w.b[1] - w.a[1]) / wl) - uy * ((w.b[0] - w.a[0]) / wl),
    );
    if (cross > 0.02) continue;
    const cand = offsetFrom(a, b, w.a);
    // Not the segment itself.
    if (Math.abs(cand) < 1e-6 && w.own) continue;
    if (
      Math.abs(cand - d) < reach &&
      (!best || Math.abs(cand - d) < Math.abs(best.d - d))
    )
      best = { d: cand, w };
  }
  return best
    ? {
        d: best.d,
        guide: {
          kind: "wall",
          own: best.w.own,
          a: best.w.a,
          b: best.w.b,
          level: best.w.level,
        },
      }
    : { d, guide: null };
}

// --- outlines (free-form shapes, site items) ------------------------------

/** An outline item's corners on the plan (plan units), as drawn: its
 * fractions of its size, about its centre, mirrored and turned. */
export function outlinePoints(item: FurnitureItem, perCm: number): Pt[] {
  const w = item.width_cm;
  const d = item.depth_cm;
  const a = (-item.rotation_deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return (item.points ?? []).map(([fx, fy]) => {
    const lx = (item.mirrored ? 1 - fx : fx) * w - w / 2;
    const lz = fy * d - d / 2;
    return [
      item.x + (lx * c + lz * s) * perCm,
      item.y + (-lx * s + lz * c) * perCm,
    ];
  });
}

/** The item fitted to new corners (plan units), keeping its turn: its
 * centre, size and corner fractions. */
export function fitOutline(
  item: FurnitureItem,
  pts: Pt[],
  perCm: number,
): Partial<FurnitureItem> {
  const a = (-item.rotation_deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  // Into the item's own frame (cm, about its old centre).
  const local = pts.map(([x, y]): Pt => {
    const dx = (x - item.x) / perCm;
    const dy = (y - item.y) / perCm;
    const lx = dx * c - dy * s;
    const lz = dx * s + dy * c;
    return [item.mirrored ? -lx : lx, lz];
  });
  const xs = local.map((p) => p[0]);
  const zs = local.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const z0 = Math.min(...zs);
  const z1 = Math.max(...zs);
  const w = Math.max(1, x1 - x0);
  const d = Math.max(1, z1 - z0);
  const cx = item.mirrored ? -(x0 + x1) / 2 : (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  return {
    x: item.x + (cx * c + cz * s) * perCm,
    y: item.y + (-cx * s + cz * c) * perCm,
    width_cm: w,
    depth_cm: d,
    points: local.map(([lx, lz]): [number, number] => [
      x1 > x0 ? (lx - x0) / (x1 - x0) : 0.5,
      z1 > z0 ? (lz - z0) / (z1 - z0) : 0.5,
    ]),
  };
}

/** A new outline item of a kind through plan points (unturned). */
export function addOutlineItem(
  layout: FloorLayout,
  kind: string,
  pts: Pt[],
  closed: boolean,
  perCm: number,
): { patch: LayoutPatch; id: string } | null {
  const entry = catalogItem(kind);
  if (!entry || pts.length < 2) return null;
  const id = newId("furniture");
  const base: FurnitureItem = {
    id,
    kind: entry.id,
    x: pts[0]![0],
    y: pts[0]![1],
    rotation_deg: 0,
    width_cm: 1,
    depth_cm: 1,
    stroke_width: 1.5,
    closed,
    ...(typeof entry.opts["color"] === "string"
      ? { color: entry.opts["color"], fill: !!entry.opts["fill"] }
      : {}),
  };
  const item = { ...base, ...fitOutline(base, pts, perCm) };
  return { patch: { furniture: [...layout.furniture, item] }, id };
}
