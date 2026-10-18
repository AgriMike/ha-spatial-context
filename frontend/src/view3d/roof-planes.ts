/** A roof drawn from a few explicit sections — hips and gables over
 * rectangles, each with its eave height, pitch and ridge direction — as
 * real planes: crisp ridges, hips and valleys where sections meet, fascia
 * and soffits under the eaves, and sided gable ends. Part of the main
 * bundle (pure numbers), like scene3d.ts. */

import type { RoofFace3d, Vec2 } from "./view3d-api";
import type { RoofEnd, RoofPart } from "../types";

type Vec3 = [number, number, number];

/** Fascia depth below the roof's edge, and the default overhang. */
const FASCIA_M = 0.17;
/** The roof sits this far above its eave height (the wall tops) where it
 * crosses the walls' centre lines — the rafters' depth — so a wall's outer
 * edge never shows through it. */
const HEEL_M = 0.15;
export const ROOF_OVERHANG_M = 0.35;

/** A section in its own frame: `a` along the ridge, `c` across it, both
 * metres from `origin` on the floor plane (x, z). */
export interface RoofSection {
  origin: Vec2;
  /** Unit directions of a and c on the floor plane. */
  along: Vec2;
  across: Vec2;
  /** Its walls: a from a0 to a1, c from c0 to c1. */
  a0: number;
  a1: number;
  c0: number;
  c1: number;
  /** Eave heights (world Y) at the c0 and c1 sides. */
  eave0: number;
  eave1: number;
  pitch: number;
  ends: [RoofEnd, RoofEnd];
  overhang: number;
  /** Gable ends are sided down to here (world Y). */
  base: number;
  gable: "siding" | "shake";
  /** A lean-to: one slope only, falling to the c1 side from a wall along
   * c0 (no eave or overhang there). */
  shed?: boolean;
  /** Its gable ends stand open (a porch's sides): rakes but no siding. */
  openSides?: boolean;
}

/** A plane over the frame: h = ka * a + kc * c + k. */
interface Plane {
  ka: number;
  kc: number;
  k: number;
}

const heightOf = (p: Plane, a: number, c: number) => p.ka * a + p.kc * c + p.k;

/** A convex polygon (a, c) cut down to where f(a, c) <= 0, f linear. */
function clip(poly: Vec2[], f: (a: number, c: number) => number): Vec2[] {
  const out: Vec2[] = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const q = poly[(i + 1) % poly.length]!;
    const fp = f(p[0], p[1]);
    const fq = f(q[0], q[1]);
    if (fp <= 0) out.push(p);
    if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) {
      const t = fp / (fp - fq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}

function area(poly: Vec2[]): number {
  let s = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i]!;
    const q = poly[(i + 1) % poly.length]!;
    s += p[0] * q[1] - q[0] * p[1];
  }
  return Math.abs(s) / 2;
}

/** The section's planes: one rising from each eave side, and from each
 * hipped end. */
function planes(s: RoofSection): Plane[] {
  const out: Plane[] = [
    { ka: 0, kc: -s.pitch, k: s.eave1 + HEEL_M + s.pitch * s.c1 },
  ];
  if (!s.shed)
    out.push({ ka: 0, kc: s.pitch, k: s.eave0 + HEEL_M - s.pitch * s.c0 });
  const low = Math.min(s.eave0, s.eave1) + HEEL_M;
  if (s.ends[0] === "hip")
    out.push({ ka: s.pitch, kc: 0, k: low - s.pitch * s.a0 });
  if (s.ends[1] === "hip")
    out.push({ ka: -s.pitch, kc: 0, k: low + s.pitch * s.a1 });
  return out;
}

/** The roof's surface height over (a, c): the lowest of its planes. */
function surface(ps: Plane[], a: number, c: number): number {
  return Math.min(...ps.map((p) => heightOf(p, a, c)));
}

/** The faces of one section, in world space. */
export function sectionFaces(s: RoofSection): RoofFace3d[] {
  const ps = planes(s);
  const o = s.overhang;
  // Open ends stop at the wall line; so does a lean-to's high side.
  const reach = (end: RoofEnd) => (end === "open" ? 0 : o);
  const A0 = s.a0 - reach(s.ends[0]);
  const A1 = s.a1 + reach(s.ends[1]);
  const C0 = s.shed ? s.c0 : s.c0 - o;
  const C1 = s.c1 + o;
  const world = (a: number, c: number, y: number): Vec3 => [
    s.origin[0] + s.along[0] * a + s.across[0] * c,
    y,
    s.origin[1] + s.along[1] * a + s.across[1] * c,
  ];
  const faces: RoofFace3d[] = [];
  const rect: Vec2[] = [
    [A0, C0],
    [A1, C0],
    [A1, C1],
    [A0, C1],
  ];
  const eps = 1e-6;
  /** Which outer edge of the section a point pair lies along, if any:
   * the inward direction (a, c) and whether it's a gable's rake. */
  const edgeOf = (p: Vec2, q: Vec2): { inward: Vec2; rake: boolean } | null => {
    const on = (i: 0 | 1, v: number) =>
      Math.abs(p[i] - v) < eps && Math.abs(q[i] - v) < eps;
    const trimmed = (end: RoofEnd) => end !== "open";
    if (on(1, C0)) return s.shed ? null : { inward: [0, 1], rake: false };
    if (on(1, C1)) return { inward: [0, -1], rake: false };
    if (on(0, A0) && trimmed(s.ends[0]))
      return { inward: [1, 0], rake: s.ends[0] === "gable" };
    if (on(0, A1) && trimmed(s.ends[1]))
      return { inward: [-1, 0], rake: s.ends[1] === "gable" };
    return null;
  };
  ps.forEach((plane, i) => {
    let poly = rect;
    ps.forEach((other, j) => {
      if (i === j || poly.length < 3) return;
      poly = clip(
        poly,
        (a, c) => heightOf(plane, a, c) - heightOf(other, a, c) - 1e-9,
      );
    });
    if (poly.length < 3 || area(poly) < 1e-4) return;
    faces.push({
      points: poly.map(([a, c]) => world(a, c, heightOf(plane, a, c))),
      kind: "shingle",
    });
    // Fascia and soffit along the outer edges (none without an overhang:
    // a part like that only closes another off).
    for (let k = 0; k < poly.length && o > 0.01; k++) {
      const p = poly[k]!;
      const q = poly[(k + 1) % poly.length]!;
      const edge = edgeOf(p, q);
      if (!edge) continue;
      const hp = heightOf(plane, p[0], p[1]);
      const hq = heightOf(plane, q[0], q[1]);
      faces.push({
        points: [
          world(p[0], p[1], hp),
          world(q[0], q[1], hq),
          world(q[0], q[1], hq - FASCIA_M),
          world(p[0], p[1], hp - FASCIA_M),
        ],
        kind: "trim",
      });
      const [ia, ic] = edge.inward;
      const pi: Vec2 = [p[0] + ia * o, p[1] + ic * o];
      const qi: Vec2 = [q[0] + ia * o, q[1] + ic * o];
      faces.push({
        points: [
          world(p[0], p[1], hp - FASCIA_M),
          world(q[0], q[1], hq - FASCIA_M),
          world(qi[0], qi[1], hq - FASCIA_M),
          world(pi[0], pi[1], hp - FASCIA_M),
        ],
        kind: "trim",
      });
    }
  });
  // Gable ends: sided from the roof down to the base, on the wall line.
  ([0, 1] as const).forEach((end) => {
    if (s.ends[end] !== "gable" || s.openSides) return;
    const a = end === 0 ? s.a0 : s.a1;
    // The surface along the wall line bends where two planes cross.
    const cs = new Set<number>([s.c0, s.c1]);
    for (let i = 0; i < ps.length; i++)
      for (let j = i + 1; j < ps.length; j++) {
        const dk = ps[i]!.kc - ps[j]!.kc;
        if (Math.abs(dk) < 1e-9) continue;
        const c = (heightOf(ps[j]!, a, 0) - heightOf(ps[i]!, a, 0)) / dk;
        if (c > s.c0 && c < s.c1) cs.add(c);
      }
    const top = [...cs]
      .sort((x, y) => x - y)
      .map((c): Vec3 => world(a, c, Math.max(s.base, surface(ps, a, c))));
    const first = top[0]!;
    const last = top[top.length - 1]!;
    faces.push({
      points: [
        [first[0], s.base, first[2]],
        ...top,
        [last[0], s.base, last[2]],
      ],
      kind: s.gable,
    });
  });
  return faces;
}

/** A stored roof part (plan units, ridge along the plan's x or y) as a
 * section; `m` is metres per plan unit. */
export function partSection(part: RoofPart, m: number): RoofSection {
  const alongX = part.ridge === "x";
  const [e0, e1] = Array.isArray(part.eave)
    ? part.eave
    : [part.eave, part.eave];
  const x0 = Math.min(part.x0, part.x1) * m;
  const x1 = Math.max(part.x0, part.x1) * m;
  const y0 = Math.min(part.y0, part.y1) * m;
  const y1 = Math.max(part.y0, part.y1) * m;
  return {
    origin: [0, 0],
    along: alongX ? [1, 0] : [0, 1],
    across: alongX ? [0, 1] : [1, 0],
    a0: alongX ? x0 : y0,
    a1: alongX ? x1 : y1,
    c0: alongX ? y0 : x0,
    c1: alongX ? y1 : x1,
    eave0: e0,
    eave1: e1,
    pitch: part.pitch,
    ends: part.ends ?? ["gable", "gable"],
    overhang: part.overhang ?? ROOF_OVERHANG_M,
    base: part.base ?? Math.min(e0, e1),
    gable: part.gable ?? "siding",
  };
}

/** A porch roof against a wall (corners along the wall's face a, b, then
 * out from b and from a): a lean-to falling from the wall straight down
 * to its eave at the front, its sides open. */
export function porchSection(
  corners: [Vec2, Vec2, Vec2, Vec2],
  eave: number,
  pitch: number,
  overhang: number,
): RoofSection | null {
  const [wa, wb, , oa] = corners;
  const width = Math.hypot(wb[0] - wa[0], wb[1] - wa[1]);
  const depth = Math.hypot(oa[0] - wa[0], oa[1] - wa[1]);
  if (width < 0.1 || depth < 0.1) return null;
  return {
    origin: wa,
    along: [(wb[0] - wa[0]) / width, (wb[1] - wa[1]) / width],
    across: [(oa[0] - wa[0]) / depth, (oa[1] - wa[1]) / depth],
    a0: 0,
    a1: width,
    c0: 0,
    c1: depth,
    eave0: eave,
    eave1: eave,
    pitch,
    ends: ["gable", "gable"],
    overhang,
    base: eave,
    gable: "siding",
    shed: true,
    openSides: true,
  };
}
