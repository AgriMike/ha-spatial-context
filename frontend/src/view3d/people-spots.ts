/** Where people stand in the 3D view: the same place the 2D plan puts
 * them (canvas/people.ts, floorplan-canvas.ts's _personSpots) — as far
 * from the nearest Bluetooth proxy's pin as Bermuda says, toward the
 * middle of the room, else in the middle of the room — in metres on their
 * floor, then moved the least it takes to stand clear of the walls, the
 * furniture and each other (nobody stands inside the sofa). */

import { computePeople, type PersonOnPlan } from "../canvas/people";
import {
  pointInPolygon,
  pointToSegmentDistance,
  roomLabelPoint,
} from "../canvas/geometry";
import { largeUnitLabel, type UnitSystem } from "../units";
import { localize } from "../i18n";
import type { FloorLayout, HomeAssistant } from "../types";
import { metersPerUnit } from "./scene3d";
import type { Item3d, Person3d } from "./view3d-api";

/** How far (metres) a figure keeps from the walls, from what stands on
 * the floor, from the proxy's pin and from each other. */
const WALL_CLEAR_M = 0.3;
const ITEM_CLEAR_M = 0.2;
const PIN_CLEAR_M = 0.45;
const APART_M = 0.6;
/** How far out it looks for a free spot, in steps of this. */
const SEARCH_M = 2.4;
const STEP_M = 0.15;

export interface PeopleFloor {
  floorId: string;
  layout: FloorLayout;
  /** The floor's things as last drawn (Floor3d.items): what to stand
   * clear of. */
  items: Item3d[];
}

type P2 = [number, number];

/** Whether a spot is taken by something standing on the floor. */
function blockers(items: Item3d[]): ((x: number, z: number) => boolean)[] {
  return items
    .filter(
      (i) =>
        // On the floor (not hung from the ceiling or high on a wall), and
        // more than a rug.
        i.y0 < 1 && i.y0 + i.height > 0.15 && !i.site?.surface,
    )
    .map((i) => {
      const c = Math.cos(i.angle);
      const s = Math.sin(i.angle);
      const hw = i.width / 2 + ITEM_CLEAR_M;
      const hd = i.depth / 2 + ITEM_CLEAR_M;
      return (x: number, z: number) => {
        const dx = x - i.x;
        const dz = z - i.z;
        // Into the item's own frame (it's turned `angle` about +Y).
        const lx = c * dx - s * dz;
        const lz = s * dx + c * dz;
        return Math.abs(lx) <= hw && Math.abs(lz) <= hd;
      };
    });
}

function wallDistance(x: number, z: number, poly: P2[]): number {
  let d = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[j]!;
    const b = poly[i]!;
    d = Math.min(d, pointToSegmentDistance(x, z, a[0], a[1], b[0], b[1]));
  }
  return d;
}

/** The free spot nearest `target` inside the room: clear of its walls,
 * of `placed` people and (unless nothing is) of the furniture. Ties go to
 * the spot nearer the room's middle. */
function freeSpot(
  target: P2,
  middle: P2,
  poly: P2[],
  blocked: ((x: number, z: number) => boolean)[],
  placed: P2[],
): P2 {
  const passes: { wall: number; items: boolean }[] = [
    { wall: WALL_CLEAR_M, items: true },
    { wall: WALL_CLEAR_M, items: false },
    // A closet too narrow to stand clear in.
    { wall: 0.05, items: false },
  ];
  for (const pass of passes) {
    const ok = (x: number, z: number) =>
      pointInPolygon(x, z, poly) &&
      wallDistance(x, z, poly) >= pass.wall &&
      placed.every((q) => Math.hypot(q[0] - x, q[1] - z) >= APART_M) &&
      (!pass.items || !blocked.some((b) => b(x, z)));
    if (ok(target[0], target[1])) return target;
    for (let r = STEP_M; r <= SEARCH_M + 1e-9; r += STEP_M) {
      const n = Math.max(8, Math.round((2 * Math.PI * r) / STEP_M));
      let best: P2 | null = null;
      let bestD = Infinity;
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const x = target[0] + Math.cos(a) * r;
        const z = target[1] + Math.sin(a) * r;
        if (!ok(x, z)) continue;
        const d = Math.hypot(x - middle[0], z - middle[1]);
        if (d < bestD) {
          bestD = d;
          best = [x, z];
        }
      }
      if (best) return best;
    }
  }
  return pointInPolygon(target[0], target[1], poly) ? target : middle;
}

/** A person's tooltip: where they are, then each of their devices (as on
 * the plan). */
function titleOf(p: PersonOnPlan, units: UnitSystem): string {
  const far = (m: number) =>
    `${(units === "imperial" ? m / 0.3048 : m).toFixed(1)} ${largeUnitLabel(units)}`;
  const lines = [`${p.name} · ${p.areaName}`];
  for (const d of p.devices) {
    const where = d.areaName ?? localize("people.notSeen");
    const near =
      d.areaName && d.distanceM !== null && d.scanner
        ? ` · ${localize("people.fromProxy", { distance: far(d.distanceM), proxy: d.scanner })}`
        : "";
    lines.push(`${d.name}: ${where}${near}`);
  }
  return lines.join("\n");
}

/** Bermuda's people on each floor (as computePeople finds them), placed:
 * each one once, on the first floor that has them. */
export function peopleOnFloors(
  floors: { floorId: string; layout: FloorLayout }[],
  hass: HomeAssistant,
  choices: Record<string, string> | undefined,
): { floorId: string; people: PersonOnPlan[] }[] {
  const seen = new Set<string>();
  return floors.map((f) => {
    const people = computePeople(
      f.layout.rooms,
      f.layout.pins,
      hass,
      choices,
    ).filter((p) => !seen.has(p.key));
    for (const p of people) seen.add(p.key);
    return { floorId: f.floorId, people };
  });
}

/** Where each person stands, in metres on their floor. */
export function placePeople(
  found: { floorId: string; people: PersonOnPlan[] }[],
  floors: PeopleFloor[],
  units: UnitSystem,
): Person3d[] {
  const out: Person3d[] = [];
  for (const { floorId, people } of found) {
    const floor = floors.find((f) => f.floorId === floorId);
    if (!floor || !people.length) continue;
    const m = metersPerUnit(floor.layout.scale);
    const blocked = blockers(floor.items);
    const placed: P2[] = [];
    for (const p of people) {
      const room = floor.layout.rooms.find((r) => r.id === p.roomId);
      if (!room || room.points.length < 3) continue;
      const poly = room.points.map(([x, y]) => [x * m, y * m] as P2);
      const [lx, ly] = room.label_position ?? roomLabelPoint(room.points);
      const middle: P2 = [lx * m, ly * m];
      let target = middle;
      if (p.proxy && p.distanceM !== null) {
        // From the proxy toward the middle of the room, as far as Bermuda
        // says: which way is a guess; how far isn't.
        const sx = p.proxy.x * m;
        const sz = p.proxy.y * m;
        const len = Math.hypot(middle[0] - sx, middle[1] - sz);
        const [ux, uz] =
          len > 1e-6
            ? [(middle[0] - sx) / len, (middle[1] - sz) / len]
            : [0, 1];
        const t = Math.min(
          Math.max(p.distanceM, PIN_CLEAR_M),
          Math.max(len, PIN_CLEAR_M),
        );
        target = [sx + ux * t, sz + uz * t];
      }
      const spot = freeSpot(target, middle, poly, blocked, placed);
      placed.push(spot);
      out.push({
        key: p.key,
        floorId,
        x: spot[0],
        z: spot[1],
        // On the room's floor (a sunken room's, a deck's a little lower).
        y: (room.floor_offset_m ?? 0) + (room.outdoor ? -0.02 : 0),
        // Toward the middle of the room (from its middle, the plan's down).
        facing:
          Math.hypot(middle[0] - spot[0], middle[1] - spot[1]) > 0.3
            ? Math.atan2(middle[0] - spot[0], middle[1] - spot[1])
            : 0,
        indoor: !room.outdoor,
        name: p.shortName,
        initials: p.initials,
        color: p.color,
        picture: p.picture,
        entityId: p.entityId,
        title: titleOf(p, units),
      });
    }
  }
  return out;
}
