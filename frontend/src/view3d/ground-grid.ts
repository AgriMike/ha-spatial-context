import type { GroundGrid } from "../types";

/** The most points a grading grid keeps (each side). */
const MAX_SIDE = 160;

/** A node's raise (metres), zero off the grid. */
function node(g: GroundGrid, i: number, j: number): number {
  if (i < 0 || j < 0 || i >= g.cols || j >= g.rows) return 0;
  return g.h[j * g.cols + i] ?? 0;
}

/** Catmull-Rom weights: the curve runs through every node. */
function weights(t: number): [number, number, number, number] {
  const t2 = t * t;
  const t3 = t2 * t;
  return [
    (-t3 + 2 * t2 - t) / 2,
    (3 * t3 - 5 * t2 + 2) / 2,
    (-3 * t3 + 4 * t2 + t) / 2,
    (t3 - t2) / 2,
  ];
}

/** How far the grading raises (or lowers) the ground at a spot (x, z on
 * the floor plane, metres): smoothed between the grid's points, easing
 * back to nothing past its edge. */
export function gridOffset(
  g: GroundGrid | null | undefined,
  x: number,
  z: number,
): number {
  if (!g || !g.cols || !g.rows || g.step <= 0) return 0;
  const fx = (x - g.x0) / g.step;
  const fz = (z - g.z0) / g.step;
  if (fx < -2 || fz < -2 || fx > g.cols + 1 || fz > g.rows + 1) return 0;
  const i = Math.floor(fx);
  const j = Math.floor(fz);
  const wx = weights(fx - i);
  const wz = weights(fz - j);
  let sum = 0;
  for (let b = 0; b < 4; b++) {
    let row = 0;
    for (let a = 0; a < 4; a++) row += wx[a]! * node(g, i - 1 + a, j - 1 + b);
    sum += wz[b]! * row;
  }
  return sum;
}

function inside(poly: [number, number][], x: number, z: number): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i]!;
    const [xj, zj] = poly[j]!;
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)
      hit = !hit;
  }
  return hit;
}

/** Each outline's bounds (min x, min z, max x, max z), worked out once
 * per list: a point outside them can't be inside it. */
const COVER_BOUNDS = new WeakMap<
  [number, number][][],
  [number, number, number, number][]
>();

function coverBounds(
  cover: [number, number][][],
): [number, number, number, number][] {
  let out = COVER_BOUNDS.get(cover);
  if (!out) {
    out = cover.map((poly) => {
      let [x0, z0, x1, z1] = [Infinity, Infinity, -Infinity, -Infinity];
      for (const [x, z] of poly) {
        x0 = Math.min(x0, x);
        z0 = Math.min(z0, z);
        x1 = Math.max(x1, x);
        z1 = Math.max(z1, z);
      }
      return [x0, z0, x1, z1];
    });
    COVER_BOUNDS.set(cover, out);
  }
  return out;
}

/** gridOffset, but nothing under the building (`cover`, its rooms'
 * outlines): it stands on its foundation, the grading round it. */
export function gradeAt(
  g: GroundGrid | null | undefined,
  cover: [number, number][][] | undefined,
  x: number,
  z: number,
): number {
  if (!g) return 0;
  const v = gridOffset(g, x, z);
  if (v === 0 || !cover) return v;
  const bounds = coverBounds(cover);
  for (let k = 0; k < cover.length; k++) {
    const [x0, z0, x1, z1] = bounds[k]!;
    if (x < x0 || x > x1 || z < z0 || z > z1) continue;
    if (inside(cover[k]!, x, z)) return 0;
  }
  return v;
}

/** The grid grown (with level points) to cover a stretch of ground, its
 * points kept where they were. */
export function growGrid(
  g: GroundGrid | null | undefined,
  minX: number,
  minZ: number,
  maxX: number,
  maxZ: number,
  step: number,
): GroundGrid {
  const s = g?.step ?? step;
  const x0 = g ? g.x0 : Math.floor(minX / s) * s;
  const z0 = g ? g.z0 : Math.floor(minZ / s) * s;
  // Whole steps out from the old origin, so old points stay on the grid.
  const padL = Math.max(0, Math.ceil((x0 - minX) / s));
  const padT = Math.max(0, Math.ceil((z0 - minZ) / s));
  const oldCols = g?.cols ?? 1;
  const oldRows = g?.rows ?? 1;
  const padR = Math.max(0, Math.ceil((maxX - (x0 + (oldCols - 1) * s)) / s));
  const padB = Math.max(0, Math.ceil((maxZ - (z0 + (oldRows - 1) * s)) / s));
  const cols = Math.min(MAX_SIDE, oldCols + padL + padR);
  const rows = Math.min(MAX_SIDE, oldRows + padT + padB);
  if (g && cols === g.cols && rows === g.rows && !padL && !padT) return g;
  const h = new Array<number>(cols * rows).fill(0);
  if (g)
    for (let j = 0; j < g.rows; j++)
      for (let i = 0; i < g.cols; i++) {
        const ni = i + padL;
        const nj = j + padT;
        if (ni < cols && nj < rows) h[nj * cols + ni] = node(g, i, j);
      }
  return { x0: x0 - padL * s, z0: z0 - padT * s, step: s, cols, rows, h };
}

export type GradeMode = "raise" | "lower" | "flatten" | "smooth" | "reset";

/** How much of a dab a spot `d` metres from its middle gets: all of it
 * within `radius`, easing to none across `feather` beyond it — with no
 * crease where it meets the ground round it (smootherstep). */
export function brushWeight(
  d: number,
  radius: number,
  feather: number,
): number {
  if (d <= radius) return 1;
  if (feather <= 0 || d >= radius + feather) return 0;
  const t = 1 - (d - radius) / feather;
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** A binomial blur's weights: a soft average of a point and those round. */
const BLUR = [1, 2, 1];

/** A brush stroke's dab at a spot: raises, lowers, levels (toward
 * `level`, a raise), smooths or returns to the site's own grade (no raise)
 * the points within `radius`, fully, and fading to nothing across
 * `feather` metres beyond. */
export function brushGrid(
  g: GroundGrid,
  x: number,
  z: number,
  radius: number,
  amount: number,
  mode: GradeMode,
  level = 0,
  feather = 0,
): GroundGrid {
  const h = g.h.slice();
  const r = Math.max(radius, g.step * 0.5);
  const reach = r + Math.max(0, feather);
  const i0 = Math.max(0, Math.floor((x - reach - g.x0) / g.step));
  const i1 = Math.min(g.cols - 1, Math.ceil((x + reach - g.x0) / g.step));
  const j0 = Math.max(0, Math.floor((z - reach - g.z0) / g.step));
  const j1 = Math.min(g.rows - 1, Math.ceil((z + reach - g.z0) / g.step));
  for (let j = j0; j <= j1; j++)
    for (let i = i0; i <= i1; i++) {
      const d = Math.hypot(g.x0 + i * g.step - x, g.z0 + j * g.step - z);
      const f = brushWeight(d, r, feather);
      if (f <= 0) continue;
      const k = j * g.cols + i;
      const v = g.h[k] ?? 0;
      let next: number;
      if (mode === "raise") next = v + amount * f;
      else if (mode === "lower") next = v - amount * f;
      else if (mode === "flatten")
        next = v + (level - v) * Math.min(1, f * 0.5);
      else if (mode === "reset") {
        // Straight back to the site's own grade within the radius, easing
        // into what's round it across the feather.
        next = v * (1 - f);
        if (Math.abs(next) < 0.005) next = 0;
      } else {
        // A little toward a soft average of the points round: lumps a
        // point across iron out, while a bank or berm keeps its shape.
        let sum = 0;
        let n = 0;
        for (let b = -1; b <= 1; b++)
          for (let a = -1; a <= 1; a++) {
            if (i + a < 0 || j + b < 0 || i + a >= g.cols || j + b >= g.rows)
              continue;
            const w = BLUR[a + 1]! * BLUR[b + 1]!;
            sum += (g.h[(j + b) * g.cols + i + a] ?? 0) * w;
            n += w;
          }
        next = v + (sum / n - v) * f * 0.5;
      }
      h[k] = Math.round(Math.max(-20, Math.min(20, next)) * 1000) / 1000;
    }
  return { ...g, h };
}

/** The nearest grid point to a spot, if it's within half a step. */
export function nearestNode(
  g: GroundGrid | null | undefined,
  x: number,
  z: number,
): { i: number; j: number } | null {
  if (!g) return null;
  const i = Math.round((x - g.x0) / g.step);
  const j = Math.round((z - g.z0) / g.step);
  if (i < 0 || j < 0 || i >= g.cols || j >= g.rows) return null;
  return { i, j };
}

/** The grid with no raised or lowered points: none. */
export function gridIsLevel(g: GroundGrid | null | undefined): boolean {
  return !g || g.h.every((v) => Math.abs(v) < 1e-4);
}
