/** Exact duplicates in a floor's walls and doors/windows — left by
 * importing the same SVG plan twice — merged back into one each. Two
 * copies of a window both throw daylight, so turning one copy's daylight
 * off only halved it. */

import type { Opening, Wall } from "../types";

const pointsKey = (points: [number, number][]): string =>
  points.map(([x, y]) => `${Math.round(x)},${Math.round(y)}`).join(" ");

/** The same wall drawn either way round. */
const wallKey = (wall: Wall): string => {
  const forward = pointsKey(wall.points);
  const backward = pointsKey([...wall.points].reverse());
  return forward < backward ? forward : backward;
};

const openingKey = (o: Opening): string =>
  `${o.type}|${o.wallId}|${Math.round(o.x)}|${Math.round(o.y)}|${Math.round(o.width)}`;

/** How much a copy has been set up (a cover, garage, daylight tuning) —
 * the copy kept is the one with the most. */
const configured = (o: Opening): number =>
  (o.cover_entity_id ? 2 : 0) +
  (o.cover_right_entity_id ? 2 : 0) +
  (o.garage ? 1 : 0) +
  (o.daylight && Object.keys(o.daylight).length > 0 ? 1 : 0);

/** The walls and openings with exact duplicates merged, or null when there
 * are none. Of each duplicate wall the last is kept and the others'
 * openings move onto it; of each duplicate opening the one with the most
 * set up is kept (the last on a tie). */
export function mergeDuplicateGeometry(
  walls: Wall[],
  openings: Opening[],
): { walls: Wall[]; openings: Opening[] } | null {
  const keptWall = new Map<string, Wall>();
  for (const wall of walls) keptWall.set(wallKey(wall), wall);
  const wallIdMap = new Map<string, string>();
  for (const wall of walls) {
    const kept = keptWall.get(wallKey(wall))!;
    if (kept.id !== wall.id) wallIdMap.set(wall.id, kept.id);
  }
  const moved = openings.map((o) => {
    const to = wallIdMap.get(o.wallId);
    return to ? { ...o, wallId: to } : o;
  });
  const best = new Map<string, Opening>();
  for (const o of moved) {
    const key = openingKey(o);
    const current = best.get(key);
    if (!current || configured(o) >= configured(current)) best.set(key, o);
  }
  const keptIds = new Set([...best.values()].map((o) => o.id));
  const nextWalls = walls.filter((w) => !wallIdMap.has(w.id));
  const nextOpenings = moved.filter((o) => keptIds.has(o.id));
  if (
    nextWalls.length === walls.length &&
    nextOpenings.length === openings.length
  ) {
    return null;
  }
  return { walls: nextWalls, openings: nextOpenings };
}
