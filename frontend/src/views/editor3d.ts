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
