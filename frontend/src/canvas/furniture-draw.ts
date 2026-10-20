/** Simple line drawings for furniture and household items (see
 * furniture-catalog.ts), drawn top-down in plan view.
 *
 * Every drawing is a template: a function of the item's real size, in
 * centimetres, so resizing redraws it rather than stretching it — a longer
 * dining table gets more room between its chairs, not oval chairs. Local
 * coordinates run from (0, 0) at the back-left corner to (w, d) at the
 * front-right: the back of a sofa, bed head or toilet tank is at y = 0,
 * against the wall. The first primitive is always the item's main body
 * (what "Fill" shades). */

import { svg, type SVGTemplateResult } from "lit";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { UI_ICONS } from "./ui-icons";
import { ART } from "./art-items";
import { svgDataUrl, type CustomIcon } from "./custom-icons";

export type Pt = [number, number];

export type Prim =
  | {
      t: "rect";
      x: number;
      y: number;
      w: number;
      h: number;
      r?: number | undefined;
      /** Degrees about the rect's own centre. */
      rot?: number | undefined;
      dash?: boolean | undefined;
    }
  | {
      t: "ellipse";
      cx: number;
      cy: number;
      rx: number;
      ry: number;
      rot?: number | undefined;
      dash?: boolean | undefined;
    }
  | {
      t: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      dash?: boolean | undefined;
    }
  | { t: "poly"; points: Pt[]; closed: boolean; dash?: boolean | undefined }
  | { t: "path"; d: string; dash?: boolean | undefined }
  /** A baked-in detailed drawing (see art-items.ts), stretched to w x d. */
  | { t: "art"; name: string; w: number; d: number; dash?: boolean | undefined }
  /** An imported SVG (see custom-icons.ts), fitted into w x d. */
  | { t: "image"; id: string; w: number; d: number; dash?: boolean | undefined }
  /** A 64x64 single-colour icon (see ui-icons.ts), fitted into w x d. */
  | {
      t: "icon";
      name: string;
      w: number;
      d: number;
      dash?: boolean | undefined;
    };

export type Opts = Record<string, number | string | boolean | undefined>;
type Template = (w: number, d: number, o: Opts) => Prim[];

// --- primitives ------------------------------------------------------------

const rect = (
  x: number,
  y: number,
  w: number,
  h: number,
  r?: number,
  dash?: boolean,
): Prim => ({ t: "rect", x, y, w, h, r, dash });
const ell = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot?: number,
  dash?: boolean,
): Prim => ({ t: "ellipse", cx, cy, rx, ry, rot, dash });
const circ = (cx: number, cy: number, r: number, dash?: boolean): Prim =>
  ell(cx, cy, r, r, undefined, dash);
const line = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dash?: boolean,
): Prim => ({ t: "line", x1, y1, x2, y2, dash });
const poly = (points: Pt[], closed = true, dash?: boolean): Prim => ({
  t: "poly",
  points,
  closed,
  dash,
});
const path = (d: string, dash?: boolean): Prim => ({ t: "path", d, dash });

const num = (o: Opts, key: string, fallback: number): number => {
  const v = o[key];
  return typeof v === "number" ? v : fallback;
};
const flag = (o: Opts, key: string): boolean => o[key] === true;
const min = Math.min;
const max = Math.max;

/** Evenly spaced positions strictly inside [a, b]: n dividers make n+1 bays. */
function dividers(a: number, b: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => a + ((b - a) * (i + 1)) / (n + 1));
}
/** n evenly spaced centres across [a, b]. */
function centres(a: number, b: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => a + ((b - a) * (i + 0.5)) / n);
}

/** A chair seen from above at (cx, cy), its back away from `angle`'s
 * direction (radians, the way it faces). */
function chairAt(cx: number, cy: number, angle: number, size = 42): Prim[] {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const h = size / 2;
  const at = (lx: number, ly: number): Pt => [
    cx + lx * c - ly * s,
    cy + lx * s + ly * c,
  ];
  // A soft, rounded seat with its back rest behind it.
  const deg = (angle * 180) / Math.PI;
  const [bx, by] = at(-h - 3.5, 0);
  return [
    {
      t: "rect",
      x: cx - h,
      y: cy - h,
      w: size,
      h: size,
      r: size * 0.28,
      rot: deg,
    },
    {
      t: "rect",
      x: bx - 3,
      y: by - (h - 3),
      w: 6,
      h: size - 6,
      r: 3,
      rot: deg,
    },
  ];
}

function crossX(x: number, y: number, w: number, h: number): Prim[] {
  return [line(x, y, x + w, y + h), line(x + w, y, x, y + h)];
}

/** A burner/hob ring. */
function burner(cx: number, cy: number, r: number): Prim[] {
  return [circ(cx, cy, r), circ(cx, cy, r * 0.45)];
}

// --- houseplants -------------------------------------------------------------

type LeafShape = "lance" | "heart" | "blade" | "oval";

/** A leaf seen from above as an SVG path: its base `start` along the
 * direction `deg` from (cx, cy), reaching `len` further, `wid` across. */
function leafPath(
  cx: number,
  cy: number,
  deg: number,
  start: number,
  len: number,
  wid: number,
  shape: LeafShape,
): string {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const P = (x: number, y: number) =>
    `${(cx + x * c - y * s).toFixed(2)},${(cy + x * s + y * c).toFixed(2)}`;
  const b = start;
  const t = start + len;
  switch (shape) {
    case "heart":
      return `M${P(b, 0)} C${P(b + len * 0.02, -wid * 1.25)} ${P(b + len * 0.85, -wid * 1.05)} ${P(t, 0)} C${P(b + len * 0.85, wid * 1.05)} ${P(b + len * 0.02, wid * 1.25)} ${P(b, 0)} Z`;
    case "blade":
      return `M${P(b, -wid * 0.45)} Q${P(b + len * 0.65, -wid)} ${P(t, 0)} Q${P(b + len * 0.65, wid)} ${P(b, wid * 0.45)} Z`;
    case "oval":
      return `M${P(b, 0)} C${P(b + len * 0.1, -wid * 1.1)} ${P(b + len * 0.9, -wid * 1.1)} ${P(t, 0)} C${P(b + len * 0.9, wid * 1.1)} ${P(b + len * 0.1, wid * 1.1)} ${P(b, 0)} Z`;
    default:
      return `M${P(b, 0)} Q${P(b + len / 2, -wid)} ${P(t, 0)} Q${P(b + len / 2, wid)} ${P(b, 0)} Z`;
  }
}

/** A straight vein/stem line along a leaf's direction. */
function ray(
  cx: number,
  cy: number,
  deg: number,
  from: number,
  to: number,
): Prim {
  const a = (deg * Math.PI) / 180;
  return line(
    cx + Math.cos(a) * from,
    cy + Math.sin(a) * from,
    cx + Math.cos(a) * to,
    cy + Math.sin(a) * to,
  );
}

/** Evenly spread angles, nudged so a ring of leaves doesn't look stamped. */
function spread(n: number, offset = 0, jitter = 9): number[] {
  return Array.from(
    { length: n },
    (_, i) => offset + (i * 360) / n + (((i * 37) % 3) - 1) * jitter,
  );
}

function pot(cx: number, cy: number, r: number): Prim[] {
  return [circ(cx, cy, r), circ(cx, cy, r * 0.78, true)];
}

/** A trailing vine from (x0, y0) curving out, small leaves along it. */
function vine(
  x0: number,
  y0: number,
  deg: number,
  len: number,
  leaf: number,
  bend: number,
): Prim[] {
  const a = (deg * Math.PI) / 180;
  const ex = x0 + Math.cos(a) * len;
  const ey = y0 + Math.sin(a) * len;
  const qx = (x0 + ex) / 2 - Math.sin(a) * len * bend;
  const qy = (y0 + ey) / 2 + Math.cos(a) * len * bend;
  const out: Prim[] = [path(`M${x0},${y0} Q${qx},${qy} ${ex},${ey}`)];
  for (let i = 1; i <= 4; i++) {
    const t = i / 4.4;
    const x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * qx + t * t * ex;
    const y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * qy + t * t * ey;
    const dx = 2 * (1 - t) * (qx - x0) + 2 * t * (ex - qx);
    const dy = 2 * (1 - t) * (qy - y0) + 2 * t * (ey - qy);
    const tangent = (Math.atan2(dy, dx) * 180) / Math.PI;
    out.push(
      path(
        leafPath(
          x,
          y,
          tangent + (i % 2 ? 55 : -55),
          0,
          leaf,
          leaf * 0.42,
          "heart",
        ),
      ),
    );
  }
  return out;
}

/** Top-down houseplants, by `kind`. Leaves first (so "Fill" shades the
 * foliage), pot rim drawn where it would show. */
function houseplant(w: number, d: number, kind: string): Prim[] {
  const cx = w / 2;
  const cy = d / 2;
  const R = Math.min(w, d) / 2;
  const out: Prim[] = [];
  const leaves = (
    n: number,
    shape: LeafShape,
    start: number,
    len: number,
    wid: number,
    veins = true,
    offset = 0,
  ) => {
    for (const deg of spread(n, offset)) {
      out.push(path(leafPath(cx, cy, deg, start, len, wid, shape)));
      if (veins) out.push(ray(cx, cy, deg, start, start + len * 0.85));
    }
  };
  switch (kind) {
    case "monstera": {
      // Big split heart leaves, their slits cut in from the edges.
      for (const deg of spread(6, 15, 12)) {
        const len = R * 0.72;
        const wid = R * 0.34;
        const st = R * 0.24;
        out.push(path(leafPath(cx, cy, deg, st, len, wid, "heart")));
        out.push(ray(cx, cy, deg, st, st + len * 0.9));
        const a = (deg * Math.PI) / 180;
        for (const f of [0.3, 0.52, 0.72]) {
          for (const side of [-1, 1]) {
            const along = st + len * f;
            const edge =
              wid * 0.95 * Math.sin(Math.PI * Math.min(0.95, f + 0.1));
            const x1 = cx + Math.cos(a) * along - Math.sin(a) * side * edge;
            const y1 = cy + Math.sin(a) * along + Math.cos(a) * side * edge;
            const x2 =
              cx +
              Math.cos(a) * (along - len * 0.05) -
              Math.sin(a) * side * wid * 0.3;
            const y2 =
              cy +
              Math.sin(a) * (along - len * 0.05) +
              Math.cos(a) * side * wid * 0.3;
            out.push(line(x1, y1, x2, y2));
          }
        }
        out.push(ray(cx, cy, deg, R * 0.16, st));
      }
      out.push(...pot(cx, cy, R * 0.26));
      break;
    }
    case "bird": {
      // Long paddle leaves on bare stems, fanned out.
      for (const deg of spread(7, 0, 6)) {
        out.push(ray(cx, cy, deg, R * 0.14, R * 0.42));
        out.push(
          path(leafPath(cx, cy, deg, R * 0.42, R * 0.56, R * 0.13, "oval")),
        );
        out.push(ray(cx, cy, deg, R * 0.42, R * 0.94));
      }
      out.push(...pot(cx, cy, R * 0.2));
      break;
    }
    case "snake": {
      // Upright, banded sword leaves fanning out of the pot.
      out.push(...pot(cx, cy, R * 0.42));
      for (const deg of spread(7, 10, 16)) {
        const a = (deg * Math.PI) / 180;
        const st = R * 0.1;
        const len = R * (0.68 + ((deg * 7) % 3) * 0.08);
        out.push(path(leafPath(cx, cy, deg, st, len, R * 0.16, "blade")));
        for (const f of [0.3, 0.5, 0.7]) {
          const x = cx + Math.cos(a) * (st + len * f);
          const y = cy + Math.sin(a) * (st + len * f);
          const hw = R * 0.16 * 0.8 * (1 - f * 0.5);
          out.push(
            line(
              x - Math.sin(a) * hw,
              y + Math.cos(a) * hw,
              x + Math.sin(a) * hw * 0.4,
              y - Math.cos(a) * hw * 0.4,
            ),
          );
        }
      }
      break;
    }
    case "pothos":
    case "pothosHanging": {
      const hanging = kind === "pothosHanging";
      const pr = R * (hanging ? 0.34 : 0.4);
      out.push(...pot(cx, cy, pr));
      leaves(5, "heart", pr * 0.15, pr * 0.75, pr * 0.32, false, 20);
      for (const deg of spread(hanging ? 6 : 4, 40, 15)) {
        const a = (deg * Math.PI) / 180;
        out.push(
          ...vine(
            cx + Math.cos(a) * pr,
            cy + Math.sin(a) * pr,
            deg,
            R - pr,
            R * 0.16,
            deg % 2 ? 0.25 : -0.25,
          ),
        );
      }
      if (hanging)
        for (const deg of [30, 150, 270])
          out.push(ray(cx, cy, deg, pr, R * 0.5));
      break;
    }
    case "fern":
      for (const deg of spread(14, 0, 8)) {
        out.push(ray(cx, cy, deg, R * 0.1, R * 0.96));
        const a = (deg * Math.PI) / 180;
        for (let f = 0.25; f < 0.95; f += 0.12) {
          const x = cx + Math.cos(a) * R * f;
          const y = cy + Math.sin(a) * R * f;
          const l = R * 0.1 * (1 - f * 0.6);
          out.push(
            line(x, y, x + Math.cos(a + 0.9) * l, y + Math.sin(a + 0.9) * l),
          );
          out.push(
            line(x, y, x + Math.cos(a - 0.9) * l, y + Math.sin(a - 0.9) * l),
          );
        }
      }
      out.push(circ(cx, cy, R * 0.12));
      break;
    case "peace":
      leaves(8, "lance", R * 0.15, R * 0.8, R * 0.2);
      for (const deg of [60, 200, 320]) {
        out.push(
          path(leafPath(cx, cy, deg, R * 0.25, R * 0.4, R * 0.13, "oval")),
        );
      }
      out.push(circ(cx, cy, R * 0.15));
      break;
    case "zz":
      for (const deg of spread(7, 5, 10)) {
        out.push(ray(cx, cy, deg, R * 0.1, R * 0.95));
        const a = (deg * Math.PI) / 180;
        for (let f = 0.3; f < 0.95; f += 0.16) {
          for (const side of [-1, 1]) {
            const x = cx + Math.cos(a) * R * f;
            const y = cy + Math.sin(a) * R * f;
            out.push(
              path(
                leafPath(x, y, deg + side * 50, 0, R * 0.18, R * 0.07, "oval"),
              ),
            );
          }
        }
      }
      out.push(circ(cx, cy, R * 0.12));
      break;
    case "rubber":
      leaves(7, "oval", R * 0.2, R * 0.75, R * 0.24);
      out.push(...pot(cx, cy, R * 0.22));
      break;
    case "fiddle":
      leaves(9, "heart", R * 0.18, R * 0.72, R * 0.3, true, 12);
      out.push(circ(cx, cy, R * 0.14));
      break;
    case "philodendron":
      leaves(7, "heart", R * 0.18, R * 0.7, R * 0.26, true, 25);
      out.push(...pot(cx, cy, R * 0.22));
      break;
    case "spider":
      for (const deg of spread(16, 0, 6)) {
        const a = (deg * Math.PI) / 180;
        const ex = cx + Math.cos(a) * R * 0.95;
        const ey = cy + Math.sin(a) * R * 0.95;
        const qx = cx + Math.cos(a + 0.35) * R * 0.6;
        const qy = cy + Math.sin(a + 0.35) * R * 0.6;
        out.push(path(`M${cx},${cy} Q${qx},${qy} ${ex},${ey}`));
      }
      out.push(...pot(cx, cy, R * 0.25));
      break;
    case "aloe":
      for (const deg of spread(9, 0, 8)) {
        out.push(
          path(leafPath(cx, cy, deg, R * 0.08, R * 0.88, R * 0.14, "blade")),
        );
      }
      out.push(circ(cx, cy, R * 0.12));
      break;
    case "succulent":
      for (const [n, r0, r1] of [
        [10, 0.45, 0.95],
        [7, 0.25, 0.62],
        [5, 0.05, 0.32],
      ] as [number, number, number][]) {
        for (const deg of spread(n, n * 9, 0))
          out.push(
            path(
              leafPath(
                cx,
                cy,
                deg,
                R * r0,
                R * (r1 - r0),
                R * (r1 - r0) * 0.45,
                "oval",
              ),
            ),
          );
      }
      break;
    case "pilea":
      for (const deg of spread(9, 0, 10)) {
        const a = (deg * Math.PI) / 180;
        const r = R * 0.62;
        out.push(ray(cx, cy, deg, R * 0.12, r - R * 0.22));
        out.push(circ(cx + Math.cos(a) * r, cy + Math.sin(a) * r, R * 0.22));
      }
      out.push(circ(cx, cy, R * 0.12));
      break;
    case "calathea":
      for (const deg of spread(8, 0, 10)) {
        out.push(
          path(leafPath(cx, cy, deg, R * 0.15, R * 0.8, R * 0.25, "oval")),
        );
        out.push(ray(cx, cy, deg, R * 0.15, R * 0.92));
        const a = (deg * Math.PI) / 180;
        for (const f of [0.35, 0.55, 0.75]) {
          const x = cx + Math.cos(a) * R * f;
          const y = cy + Math.sin(a) * R * f;
          out.push(
            line(
              x - Math.sin(a) * R * 0.12,
              y + Math.cos(a) * R * 0.12,
              x + Math.sin(a) * R * 0.12,
              y - Math.cos(a) * R * 0.12,
            ),
          );
        }
      }
      break;
    case "palm":
      for (const deg of spread(9, 0, 8)) {
        out.push(ray(cx, cy, deg, R * 0.1, R * 0.97));
        const a = (deg * Math.PI) / 180;
        for (let f = 0.3; f < 0.95; f += 0.1) {
          const x = cx + Math.cos(a) * R * f;
          const y = cy + Math.sin(a) * R * f;
          const l = R * 0.2 * Math.sin(Math.PI * f);
          out.push(
            line(x, y, x + Math.cos(a + 0.6) * l, y + Math.sin(a + 0.6) * l),
          );
          out.push(
            line(x, y, x + Math.cos(a - 0.6) * l, y + Math.sin(a - 0.6) * l),
          );
        }
      }
      out.push(...pot(cx, cy, R * 0.18));
      break;
    case "orchid":
      for (const deg of [20, 200, 110]) {
        out.push(
          path(leafPath(cx, cy, deg, R * 0.1, R * 0.72, R * 0.2, "oval")),
        );
      }
      out.push(
        path(
          `M${cx},${cy} Q${cx + R * 0.2},${cy - R * 0.6} ${cx + R * 0.7},${cy - R * 0.55}`,
        ),
      );
      for (const f of [0.45, 0.65, 0.85]) {
        const x = cx + R * 0.7 * f;
        const y = cy - R * 0.62 * Math.sin(Math.PI * f * 0.6) - R * 0.1;
        out.push(circ(x, y, R * 0.12), circ(x, y, R * 0.04));
      }
      out.push(...pot(cx, cy, R * 0.28));
      break;
    case "dracaena":
      for (const deg of spread(12, 0, 10)) {
        out.push(
          path(leafPath(cx, cy, deg, R * 0.12, R * 0.85, R * 0.08, "lance")),
        );
      }
      out.push(circ(cx, cy, R * 0.12));
      break;
    case "jade":
      for (const deg of spread(6, 0, 15)) {
        const a = (deg * Math.PI) / 180;
        out.push(ray(cx, cy, deg, R * 0.15, R * 0.7));
        for (const f of [0.45, 0.75]) {
          const x = cx + Math.cos(a) * R * f;
          const y = cy + Math.sin(a) * R * f;
          out.push(
            path(leafPath(x, y, deg + 40, 0, R * 0.26, R * 0.12, "oval")),
          );
          out.push(
            path(leafPath(x, y, deg - 40, 0, R * 0.26, R * 0.12, "oval")),
          );
        }
      }
      out.push(...pot(cx, cy, R * 0.18));
      break;
    case "olive":
      out.push(path(scallopPath(cx, cy, R * 0.92, 11), true));
      for (const deg of spread(18, 0, 12)) {
        const a = (deg * Math.PI) / 180;
        const r = R * (0.35 + ((deg * 13) % 7) * 0.07);
        out.push(
          path(
            leafPath(
              cx + Math.cos(a) * r,
              cy + Math.sin(a) * r,
              deg + 30,
              0,
              R * 0.22,
              R * 0.05,
              "lance",
            ),
          ),
        );
      }
      out.push(circ(cx, cy, R * 0.08));
      break;
    case "herbs": {
      const n = 3;
      for (let i = 0; i < n; i++) {
        const px = (w * (i + 0.5)) / n;
        const pr = Math.min(w / n, d) * 0.42;
        out.push(circ(px, d / 2, pr));
        for (const deg of spread(6, i * 20, 10))
          out.push(
            path(
              leafPath(px, d / 2, deg, pr * 0.1, pr * 0.75, pr * 0.22, "oval"),
            ),
          );
      }
      break;
    }
    default:
      out.push(...pot(cx, cy, R * 0.4));
  }
  return out;
}

function scallopPath(cx: number, cy: number, r: number, lobes: number): string {
  const pts = Array.from({ length: lobes }, (_, i) => {
    const a = (i / lobes) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
  });
  const lobeR = r * Math.sin(Math.PI / lobes) * 1.15;
  const first = pts[0]!;
  let d = `M${first[0]},${first[1]}`;
  for (let i = 1; i <= lobes; i++) {
    const p = pts[i % lobes]!;
    d += ` A${lobeR},${lobeR} 0 0 1 ${p[0]},${p[1]}`;
  }
  return d + " Z";
}

/** A tree, shrub, grass or rock from above (see the "landscape"
 * template): a canopy's scallops, a conifer's star of boughs, a grass's
 * fan of blades, a yucca's spikes, flowers' heads, a boulder's facets. */
function landscapeTop(w: number, d: number, form: string): Prim[] {
  const cx = w / 2;
  const cy = d / 2;
  const r = min(w, d) / 2 - 1;
  const ray = (n: number, r0: number, r1: number, dash?: boolean) =>
    Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + 0.3;
      return line(
        cx + Math.cos(a) * r0,
        cy + Math.sin(a) * r0,
        cx + Math.cos(a) * r1,
        cy + Math.sin(a) * r1,
        dash,
      );
    });
  const star = (n: number, r0: number, r1: number): Prim =>
    poly(
      Array.from({ length: n * 2 }, (_, i): Pt => {
        const a = (i / (n * 2)) * Math.PI * 2;
        const k = i % 2 ? r0 : r1;
        return [cx + Math.cos(a) * k, cy + Math.sin(a) * k];
      }),
    );
  switch (form) {
    case "conifer":
    case "pine":
    case "mugo":
    case "column":
      return [
        star(form === "column" ? 10 : 14, r * 0.72, r),
        circ(cx, cy, r * 0.08),
      ];
    case "palm":
      return [circ(cx, cy, r * 0.1), ...ray(9, r * 0.12, r)];
    case "grass":
    case "reed":
    case "lavender":
    case "fern":
    case "daylily":
      return [circ(cx, cy, r * 0.15), ...ray(18, r * 0.2, r)];
    case "yucca":
    case "agave":
      return [
        star(form === "agave" ? 9 : 16, r * 0.25, r),
        circ(cx, cy, r * 0.12),
      ];
    case "hosta":
      return Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * 360;
        const rad = (a * Math.PI) / 180;
        return ell(
          cx + Math.cos(rad) * r * 0.55,
          cy + Math.sin(rad) * r * 0.55,
          r * 0.45,
          r * 0.22,
          a,
        );
      });
    case "flowers":
      return [
        ell(cx, cy, w / 2 - 1, d / 2 - 1),
        ...Array.from({ length: 9 }, (_, i) =>
          circ(
            cx + Math.cos(i * 2.4) * (w / 2 - 6) * Math.sqrt((i + 0.5) / 9),
            cy + Math.sin(i * 2.4) * (d / 2 - 6) * Math.sqrt((i + 0.5) / 9),
            min(w, d) * 0.06,
          ),
        ),
      ];
    case "boulder":
    case "boulders":
      return [
        poly(
          Array.from({ length: 7 }, (_, i): Pt => {
            const a = (i / 7) * Math.PI * 2;
            const k = 0.82 + 0.18 * Math.sin(i * 2.7);
            return [
              cx + Math.cos(a) * (w / 2) * k,
              cy + Math.sin(a) * (d / 2) * k,
            ];
          }),
        ),
        line(cx - w * 0.15, cy - d * 0.1, cx + w * 0.1, cy + d * 0.12),
      ];
    default:
      return [
        path(scallopPath(cx, cy, r, form === "spreader" ? 12 : 9)),
        circ(cx, cy, r * 0.05),
      ];
  }
}

// --- templates -------------------------------------------------------------

const T: Record<string, Template> = {
  /** Plain box; opts: r (corner radius), x (diagonals), inset, dash. */
  box: (w, d, o) => {
    const out = [rect(0, 0, w, d, num(o, "r", 0), flag(o, "dash"))];
    if (flag(o, "x")) out.push(...crossX(0, 0, w, d));
    const inset = num(o, "inset", 0);
    if (inset > 0) out.push(rect(inset, inset, w - 2 * inset, d - 2 * inset));
    return out;
  },
  rounded: (w, d, o) => [rect(0, 0, w, d, min(w, d) * num(o, "k", 0.2))],
  circle: (w, d, o) => {
    const out = [ell(w / 2, d / 2, w / 2, d / 2)];
    const inner = num(o, "inner", 0);
    if (inner > 0)
      out.push(ell(w / 2, d / 2, (w / 2) * inner, (d / 2) * inner));
    if (flag(o, "cross"))
      out.push(line(w / 2, 0, w / 2, d), line(0, d / 2, w, d / 2));
    return out;
  },

  // Storage
  cabinet: (w, d, o) => {
    const doors = num(o, "doors", max(1, Math.round(w / 50)));
    const out = [
      rect(0, 0, w, d, 0, flag(o, "dash")),
      line(0, d - 3, w, d - 3),
    ];
    for (const x of dividers(0, w, doors - 1)) out.push(line(x, d - 3, x, d));
    if (flag(o, "x")) out.push(...crossX(0, 0, w, d - 3));
    return out;
  },
  drawers: (w, d, o) => {
    const cols = num(o, "cols", max(1, Math.round(w / 60)));
    const out = [rect(0, 0, w, d), line(0, d - 3, w, d - 3)];
    for (const x of dividers(0, w, cols - 1)) out.push(line(x, d - 3, x, d));
    for (const x of centres(0, w, cols))
      out.push(
        line(x - min(8, w / cols / 4), d - 6, x + min(8, w / cols / 4), d - 6),
      );
    return out;
  },
  wardrobe: (w, d) => {
    const out = [rect(0, 0, w, d), line(4, d / 2, w - 4, d / 2, true)];
    for (let x = 10; x < w - 6; x += 9)
      out.push(line(x - 3, d / 2 - d * 0.3, x + 3, d / 2 + d * 0.3));
    for (const x of dividers(0, w, max(1, Math.round(w / 50)) - 1))
      out.push(line(x, d - 3, x, d));
    out.push(line(0, d - 3, w, d - 3));
    return out;
  },
  shelf: (w, d, o) => {
    const bay = num(o, "bay", 80);
    const out = [rect(0, 0, w, d)];
    for (const x of dividers(0, w, max(0, Math.round(w / bay) - 1)))
      out.push(line(x, 0, x, d));
    out.push(line(2, d * 0.5, w - 2, d * 0.5, true));
    return out;
  },
  // A floating shelf: up on the wall, so dashed like wall cabinets, with
  // its solid back edge along the wall it's fixed to.
  floatingShelf: (w, d) => [rect(0, 0, w, d, 1, true), line(0, 0.6, w, 0.6)],
  // A 3D printer: frame, build plate, the gantry across it with the print
  // head, and the filament spool on the back. Enclosed ones get a second
  // outline for the cabinet.
  printer3d: (w, d, o) => {
    const spool = Math.min(d * 0.22, 12);
    const top = spool * 0.9;
    const fd = d - top;
    const out: Prim[] = [rect(0, top, w, fd, 3)];
    if (flag(o, "enclosed")) out.push(rect(2.5, top + 2.5, w - 5, fd - 5, 2));
    const m = Math.min(w, fd) * 0.16;
    const plate = Math.min(w - 2 * m, fd - 2 * m);
    const px = (w - plate) / 2;
    const py = top + (fd - plate) / 2 + m * 0.2;
    out.push(rect(px, py, plate, plate, 1, true));
    const gy = py + plate * 0.42;
    out.push(line(m * 0.5, gy, w - m * 0.5, gy));
    out.push(rect(w * 0.55 - 3.5, gy - 3.5, 7, 7, 1.5));
    out.push(
      circ(w / 2, top * 0.55, spool * 0.55),
      circ(w / 2, top * 0.55, spool * 0.18),
    );
    return out;
  },
  // A hydroponic garden: the tray and its lid lip, with a grid of net pots
  // that fills whatever size it's set to (one about every 15 cm).
  hydroBed: (w, d, o) => {
    const out: Prim[] = [rect(0, 0, w, d, 3), rect(2.5, 2.5, w - 5, d - 5, 2)];
    const pitch = num(o, "pitch", 15);
    const cols = Math.max(1, Math.round((w - 5) / pitch));
    const rows = Math.max(1, Math.round((d - 5) / pitch));
    const r = Math.min((w - 5) / cols, (d - 5) / rows) * 0.26;
    for (let c = 0; c < cols; c++)
      for (let k = 0; k < rows; k++) {
        const x = 2.5 + ((w - 5) / cols) * (c + 0.5);
        const y = 2.5 + ((d - 5) / rows) * (k + 0.5);
        out.push(circ(x, y, r), circ(x, y, r * 0.4));
      }
    return out;
  },
  closetRod: (w, d) => {
    const out = [rect(0, 0, w, d, 0, true), line(0, d * 0.45, w, d * 0.45)];
    for (let x = 6; x < w - 4; x += 10)
      out.push(line(x - 2, d * 0.2, x + 2, d * 0.7));
    return out;
  },
  cubby: (w, d, o) => {
    const cols = num(o, "cols", max(2, Math.round(w / 35)));
    const out = [rect(0, 0, w, d)];
    for (const x of dividers(0, w, cols - 1)) out.push(line(x, 0, x, d));
    return out;
  },
  chest: (w, d) => [
    rect(0, 0, w, d, 3),
    line(0, d * 0.25, w, d * 0.25),
    rect(w / 2 - 5, d - 4, 10, 4),
  ],

  // Beds
  bed: (w, d, o) => {
    const pillows = num(o, "pillows", w >= 120 ? 2 : 1);
    const head = min(8, d * 0.05);
    const out = [rect(0, 0, w, d, 3), rect(0, 0, w, head)];
    const pw = (w - 12 - (pillows - 1) * 6) / pillows;
    for (let i = 0; i < pillows; i++)
      out.push(rect(6 + i * (pw + 6), head + 5, pw, min(22, d * 0.14), 5));
    const fold = d * 0.33;
    out.push(line(0, fold, w, fold), line(0, fold + 5, w, fold + 5));
    out.push(line(w * 0.62, fold + 5, w, fold + d * 0.18));
    if (flag(o, "bunk"))
      out.push(...crossX(0, 0, w, d).map((p) => ({ ...p, dash: true })));
    if (flag(o, "trundle"))
      out.push(rect(4, d * 0.15, w - 8, d * 0.8, 0, true));
    return out;
  },
  crib: (w, d) => {
    const out = [rect(0, 0, w, d, 2), rect(4, 4, w - 8, d - 8, 2)];
    for (let x = 8; x < w - 4; x += 8)
      out.push(line(x, 0, x, 4), line(x, d - 4, x, d));
    return out;
  },
  bassinet: (w, d) => [
    ell(w / 2, d / 2, w / 2, d / 2),
    ell(w / 2, d / 2, w / 2 - 5, d / 2 - 5),
    line(w * 0.2, d * 0.2, w * 0.8, d * 0.2),
  ],

  // Seating
  sofa: (w, d, o) => {
    const seats = num(o, "seats", 3);
    const back = min(24, d * 0.26);
    const arm = flag(o, "noArms") ? 0 : min(18, w * 0.14);
    const out = [rect(0, 0, w, d, 6), line(arm, back, w - arm, back)];
    if (arm > 0)
      out.push(line(arm, back, arm, d), line(w - arm, back, w - arm, d));
    for (const x of dividers(arm, w - arm, seats - 1))
      out.push(line(x, back, x, d - 4));
    if (flag(o, "recliner"))
      out.push(rect(arm + 4, d, w - 2 * arm - 8, 30, 3, true));
    return out;
  },
  sectional: (w, d, o) => {
    const sd = num(o, "seatDepth", 95);
    const cw = num(o, "chaise", 95);
    const back = 22;
    const out = [
      poly([
        [0, 0],
        [w, 0],
        [w, sd],
        [cw, sd],
        [cw, d],
        [0, d],
      ]),
      poly(
        [
          [w - 18, back],
          [back, back],
          [back, d],
        ],
        false,
      ),
      line(w - 18, back, w - 18, sd),
    ];
    const seats = num(o, "seats", 3);
    for (const x of dividers(cw, w - 18, seats - 1))
      out.push(line(x, back, x, sd - 4));
    out.push(line(back, sd, cw, sd));
    return out;
  },
  uSectional: (w, d) => {
    const sd = 95;
    const back = 22;
    return [
      poly([
        [0, 0],
        [w, 0],
        [w, d],
        [w - sd, d],
        [w - sd, sd],
        [sd, sd],
        [sd, d],
        [0, d],
      ]),
      poly(
        [
          [back, d],
          [back, back],
          [w - back, back],
          [w - back, d],
        ],
        false,
      ),
      line(back, sd, sd, sd),
      line(w - sd, sd, w - back, sd),
    ];
  },
  chaise: (w, d) => [
    rect(0, 0, w, d, 8),
    path(`M${w * 0.22},2 Q${w * 0.1},${d / 2} ${w * 0.22},${d - 2}`),
    line(w * 0.6, 3, w * 0.6, d - 3),
  ],
  ottoman: (w, d, o) =>
    flag(o, "round")
      ? [
          ell(w / 2, d / 2, w / 2, d / 2),
          ell(w / 2, d / 2, w / 2 - 6, d / 2 - 6),
        ]
      : [rect(0, 0, w, d, 8), rect(6, 6, w - 12, d - 12, 5)],
  pouf: (w, d) => [
    ell(w / 2, d / 2, w / 2, d / 2),
    ...[0, 1, 2, 3].map((i) =>
      line(
        w / 2,
        d / 2,
        w / 2 + (w / 2) * Math.cos((i * Math.PI) / 2 + 0.4),
        d / 2 + (d / 2) * Math.sin((i * Math.PI) / 2 + 0.4),
      ),
    ),
  ],
  beanbag: (w, d) => [
    path(
      `M${w * 0.5},0 C${w * 0.95},0 ${w},${d * 0.35} ${w},${d * 0.6} C${w},${d * 0.95} ${w * 0.7},${d} ${w * 0.45},${d} C${w * 0.1},${d} 0,${d * 0.75} 0,${d * 0.5} C0,${d * 0.15} ${w * 0.2},0 ${w * 0.5},0 Z`,
    ),
    ell(w * 0.52, d * 0.58, w * 0.28, d * 0.25),
  ],
  chair: (w, d, o) => {
    const back = min(10, d * 0.2);
    const out = [rect(0, back, w, d - back, 4), rect(0, 0, w, back, 3)];
    if (flag(o, "arms"))
      out.push(line(5, back, 5, d - 4), line(w - 5, back, w - 5, d - 4));
    if (flag(o, "rocker"))
      out.push(
        path(`M-2,${back} Q-6,${d / 2} -2,${d + 6}`),
        path(`M${w + 2},${back} Q${w + 6},${d / 2} ${w + 2},${d + 6}`),
      );
    return out;
  },
  officeChair: (w, d) => {
    const cx = w / 2;
    const cy = d * 0.55;
    const r = min(w, d) * 0.3;
    const out = [
      circ(cx, cy, r),
      path(
        `M${cx - r},${cy - r * 0.6} Q${cx},${cy - r * 1.6} ${cx + r},${cy - r * 0.6}`,
      ),
    ];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5 + Math.PI / 5;
      const ex = cx + Math.cos(a) * min(w, d) * 0.47;
      const ey = cy + Math.sin(a) * min(w, d) * 0.45;
      out.push(line(cx, cy, ex, ey), circ(ex, ey, 2.5));
    }
    return out;
  },
  stool: (w, d) => [
    ell(w / 2, d / 2, w / 2, d / 2),
    ell(w / 2, d / 2, w * 0.3, d * 0.3),
  ],
  bench: (w, d, o) => {
    const out = [rect(0, 0, w, d, 2)];
    for (const y of dividers(0, d, num(o, "slats", 3)))
      out.push(line(2, y, w - 2, y));
    if (flag(o, "back")) out.push(rect(0, 0, w, 6));
    return out;
  },

  // Tables
  table: (w, d, o) => {
    const top = num(o, "top", 0);
    const bottom = num(o, "bottom", 0);
    const left = num(o, "left", 0);
    const right = num(o, "right", 0);
    const cd = 45;
    const tx = left ? cd : 0;
    const ty = top ? cd : 0;
    const tw = w - tx - (right ? cd : 0);
    const th = d - ty - (bottom ? cd : 0);
    const oval = o["shape"] === "oval";
    const out: Prim[] = [
      oval
        ? ell(tx + tw / 2, ty + th / 2, tw / 2, th / 2)
        : rect(tx, ty, tw, th, num(o, "r", 2)),
    ];
    if (flag(o, "glass")) out.push(rect(tx + 4, ty + 4, tw - 8, th - 8, 1));
    const inset = oval ? tw * 0.18 : 0;
    for (const x of centres(tx + inset, tx + tw - inset, top))
      out.push(...chairAt(x, ty - 10, Math.PI / 2));
    for (const x of centres(tx + inset, tx + tw - inset, bottom))
      out.push(...chairAt(x, ty + th + 10, -Math.PI / 2));
    for (const y of centres(ty, ty + th, left))
      out.push(...chairAt(tx - 10, y, 0));
    for (const y of centres(ty, ty + th, right))
      out.push(...chairAt(tx + tw + 10, y, Math.PI));
    return out;
  },
  roundTable: (w, d, o) => {
    const n = num(o, "chairs", 0);
    const cx = w / 2;
    const cy = d / 2;
    const tr = n > 0 ? min(w, d) / 2 - 42 : min(w, d) / 2;
    const out: Prim[] = [circ(cx, cy, tr)];
    if (flag(o, "pedestal")) out.push(circ(cx, cy, tr * 0.3, true));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const r = tr + 12;
      out.push(
        ...chairAt(cx + Math.cos(a) * r, cy + Math.sin(a) * r, a + Math.PI, 40),
      );
    }
    return out;
  },
  desk: (w, d, o) => {
    const dd = num(o, "desk", d);
    const out: Prim[] = [rect(0, 0, w, dd, 2)];
    if (flag(o, "monitor"))
      out.push(rect(w / 2 - 28, 6, 56, 3), line(w / 2, 9, w / 2, 16));
    if (flag(o, "drawers"))
      out.push(
        rect(w - 45, 2, 42, dd - 4),
        line(w - 45, dd * 0.5, w - 3, dd * 0.5),
      );
    if (dd < d)
      out.push(
        ...chairAt(w / 2, dd + (d - dd) / 2, -Math.PI / 2, min(48, d - dd)),
      );
    return out;
  },
  // The chair the desks are drawn with, on its own: back rest at the back
  // (y = 0), seat in front of it.
  deskChair: (w, d) => {
    const size = Math.max(4, Math.min(w, d - 7));
    return chairAt(w / 2, d - size / 2, Math.PI / 2, size);
  },
  lDesk: (w, d, o) => {
    const dd = num(o, "desk", 60);
    const out: Prim[] = [
      poly([
        [0, 0],
        [w, 0],
        [w, dd],
        [dd, dd],
        [dd, d],
        [0, d],
      ]),
    ];
    if (flag(o, "chair"))
      out.push(...chairAt(dd + 30, dd + 32, -Math.PI * 0.75, 46));
    return out;
  },
  uDesk: (w, d) => [
    poly([
      [0, 0],
      [w, 0],
      [w, d],
      [w - 60, d],
      [w - 60, 60],
      [60, 60],
      [60, d],
      [0, d],
    ]),
  ],
  pedestalTable: (w, d) => [
    circ(w / 2, d / 2, min(w, d) / 2),
    circ(w / 2, d / 2, min(w, d) * 0.12, true),
  ],
  console: (w, d) => [rect(0, 0, w, d, 2), line(4, d / 2, w - 4, d / 2, true)],
  tvStand: (w, d) => {
    const out = [rect(0, 0, w, d, 2), line(0, d - 3, w, d - 3)];
    for (const x of dividers(0, w, max(1, Math.round(w / 50)) - 1))
      out.push(line(x, d - 3, x, d));
    return out;
  },
  island: (w, d, o) => {
    const seats = num(o, "seats", 0);
    const id = seats > 0 ? d - 45 : d;
    const out: Prim[] = [rect(0, 0, w, id, 2), line(0, 3, w, 3)];
    if (seats > 0) {
      out.push(line(0, id - 25, w, id - 25, true));
      for (const x of centres(0, w, seats))
        out.push(circ(x, id + 20, 17), circ(x, id + 20, 9));
    }
    if (flag(o, "sink")) out.push(rect(w / 2 - 35, 8, 70, 40, 4));
    if (flag(o, "hob"))
      for (const [x, y] of [
        [w * 0.3, 18],
        [w * 0.3, 40],
        [w * 0.42, 18],
        [w * 0.42, 40],
      ] as Pt[])
        out.push(circ(x, y, 7));
    return out;
  },

  // Kitchen
  counter: (w, d, o) => {
    const out = [rect(0, 0, w, d), line(0, d - 3, w, d - 3)];
    if (flag(o, "x")) out.push(...crossX(0, 0, w, d - 3));
    return out;
  },
  sink: (w, d, o) => {
    const basins = num(o, "basins", 1);
    const out = [rect(0, 0, w, d)];
    const bw = (w - 16 - (basins - 1) * 6) / basins;
    // A rear drain sits in the basin's back right corner (an offset drain
    // leaves the basin clear for big pots).
    const rear = flag(o, "rearDrain");
    for (let i = 0; i < basins; i++) {
      const x = 8 + i * (bw + 6);
      out.push(
        rect(x, 12, bw, d - 22, 5),
        rear
          ? circ(x + bw - 7, 19, 2.5)
          : circ(x + bw / 2, 12 + (d - 22) * 0.6, 2.5),
      );
    }
    out.push(line(w / 2, 3, w / 2, 10), circ(w / 2, 4, 2));
    if (flag(o, "apron")) out.push(line(0, d - 4, w, d - 4));
    return out;
  },
  // A bezelless (undermount) sink: just one basin outline, the faucet
  // behind it and the drain — offset to the back right unless centred.
  // Stretches to any size; faucet and drain keep their real size.
  bezellessSink: (w, d, o) => {
    const top = Math.min(10, d * 0.2);
    // Square, tight corners (a plain rect would get the soft ones).
    const out: Prim[] = [
      path(
        roundedPolyPath(
          [
            [0.5, top],
            [w - 0.5, top],
            [w - 0.5, d - 0.5],
            [0.5, d - 0.5],
          ],
          true,
          1.5,
        ),
      ),
    ];
    out.push(
      circ(w / 2, top * 0.4, Math.min(2.4, top * 0.3)),
      line(w / 2, top * 0.4 + Math.min(2.4, top * 0.3), w / 2, top + 3),
      circ(w / 2, top + 4, 1),
    );
    const [dx, dy] = flag(o, "centreDrain")
      ? [w / 2, top + (d - top) * 0.55]
      : [w - 7, top + 7];
    out.push(circ(dx, dy, 2.4), circ(dx, dy, 0.7));
    return out;
  },
  range: (w, d, o) => {
    const burners = num(o, "burners", 4);
    const cols = burners >= 6 ? 3 : burners === 5 ? 3 : 2;
    const rows = 2;
    const top = flag(o, "noBack") ? 4 : 12;
    const out = [rect(0, 0, w, d)];
    if (!flag(o, "noBack")) out.push(line(0, 9, w, 9));
    const xs = centres(4, w - 4, cols);
    const ys = centres(top, d - 6, rows);
    let n = 0;
    for (const y of ys)
      for (const x of xs) {
        if (n++ >= burners) break;
        out.push(
          ...burner(x, y, min((w - 8) / cols, (d - top - 6) / rows) * 0.34),
        );
      }
    if (flag(o, "griddle"))
      out.push(rect(w * 0.38, top + 4, w * 0.24, d - top - 14, 2));
    return out;
  },
  fridge: (w, d, o) => {
    const doors = num(o, "doors", 1);
    const out = [rect(0, 0, w, d, 1), line(0, d - 5, w, d - 5)];
    if (doors >= 2) out.push(line(w / 2, d - 5, w / 2, d));
    if (doors >= 2)
      out.push(
        line(w / 2 - 4, d - 9, w / 2 - 4, d - 5),
        line(w / 2 + 4, d - 9, w / 2 + 4, d - 5),
      );
    else out.push(line(w - 6, d - 9, w - 6, d - 5));
    if (flag(o, "x")) out.push(...crossX(0, 0, w, d - 5));
    return out;
  },
  dishwasher: (w, d) => [
    rect(0, 0, w, d),
    line(0, d - 3, w, d - 3),
    ...crossX(0, 0, w, d - 3),
  ],
  appliance: (w, d, o) => {
    const out = [rect(0, 0, w, d, num(o, "r", 2))];
    if (flag(o, "window"))
      out.push(
        rect(w * 0.08, d * 0.25, w * 0.6, d * 0.6, 2),
        line(w * 0.78, d * 0.3, w * 0.78, d * 0.8),
      );
    if (flag(o, "slots"))
      out.push(
        rect(w * 0.2, d * 0.2, w * 0.25, d * 0.6, 1),
        rect(w * 0.55, d * 0.2, w * 0.25, d * 0.6, 1),
      );
    if (flag(o, "jug"))
      out.push(
        circ(w * 0.55, d * 0.55, min(w, d) * 0.3),
        line(w * 0.15, d * 0.55, w * 0.27, d * 0.55),
      );
    if (flag(o, "bowl"))
      out.push(
        circ(w * 0.45, d * 0.6, min(w, d) * 0.3),
        rect(w * 0.7, 0, w * 0.3, d * 0.9, 3),
      );
    if (flag(o, "dial")) out.push(circ(w * 0.5, d * 0.5, min(w, d) * 0.25));
    return out;
  },
  hood: (w, d) => [
    rect(0, 0, w, d, 0, true),
    poly(
      [
        [w * 0.35, 0],
        [w * 0.65, 0],
        [w * 0.8, d],
        [w * 0.2, d],
      ],
      true,
      true,
    ),
  ],
  trash: (w, d, o) =>
    flag(o, "round")
      ? [
          ell(w / 2, d / 2, w / 2, d / 2),
          ell(w / 2, d / 2, w / 2 - 3, d / 2 - 3),
          line(w * 0.3, d * 0.2, w * 0.7, d * 0.2),
        ]
      : [
          rect(0, 0, w, d, 3),
          line(0, d * 0.2, w, d * 0.2),
          line(w * 0.35, d * 0.6, w * 0.65, d * 0.6),
        ],
  cart: (w, d) => [
    rect(0, 0, w, d, 2),
    rect(4, 4, w - 8, d - 8, 1),
    circ(4, 4, 2.5),
    circ(w - 4, 4, 2.5),
    circ(4, d - 4, 2.5),
    circ(w - 4, d - 4, 2.5),
  ],

  // Bathroom
  toilet: (w, d, o) => {
    const tank = flag(o, "wallHung") ? d * 0.12 : d * 0.3;
    return [
      rect(w * 0.08, 0, w * 0.84, tank, 3),
      ell(w / 2, tank + (d - tank) / 2, w * 0.42, (d - tank) / 2),
      ell(w / 2, tank + (d - tank) * 0.52, w * 0.28, (d - tank) * 0.36),
    ];
  },
  bidet: (w, d) => [
    rect(w * 0.15, 0, w * 0.7, d * 0.15, 2),
    ell(w / 2, d * 0.15 + d * 0.425, w * 0.45, d * 0.425),
    ell(w / 2, d * 0.55, w * 0.25, d * 0.25),
    circ(w / 2, d * 0.2, 2),
  ],
  urinal: (w, d) => [
    path(
      `M0,0 L${w},0 L${w},${d * 0.3} Q${w},${d} ${w / 2},${d} Q0,${d} 0,${d * 0.3} Z`,
    ),
    ell(w / 2, d * 0.45, w * 0.28, d * 0.3),
  ],
  vanity: (w, d, o) => {
    const basins = num(o, "basins", 1);
    const out = [rect(0, 0, w, d), line(0, d - 3, w, d - 3)];
    // One long trough basin with a tap per basin's worth of width.
    if (flag(o, "trough")) {
      const taps = Math.max(1, num(o, "taps", 2));
      out.push(rect(10, d * 0.28, w - 20, d * 0.5, 4));
      for (const x of centres(10, w - 10, taps))
        out.push(circ(x, d * 0.15, 2), circ(x, d * 0.6, 2));
      return out;
    }
    for (const x of centres(0, w, basins)) {
      if (flag(o, "rect")) {
        // A rectangular undermount basin, drain in the middle.
        const bw = min(46, w / basins - 14);
        out.push(
          rect(x - bw / 2, d * 0.28, bw, d * 0.5, 4),
          circ(x, d * 0.53, 2),
          circ(x, d * 0.15, 2),
        );
      } else {
        out.push(
          ell(x, d * 0.5, min(22, w / basins / 2 - 5), d * 0.28),
          circ(x, d * 0.18, 2),
        );
      }
    }
    return out;
  },
  pedestalSink: (w, d) => [
    path(
      `M0,0 L${w},0 L${w},${d * 0.3} Q${w},${d} ${w / 2},${d} Q0,${d} 0,${d * 0.3} Z`,
    ),
    ell(w / 2, d * 0.45, w * 0.32, d * 0.28),
    circ(w / 2, d * 0.12, 2),
  ],
  bathtub: (w, d, o) => {
    const out = [rect(0, 0, w, d, flag(o, "free") ? d / 2 : 2)];
    out.push(rect(8, 8, w - 16, d - 16, min(d / 2 - 8, 26)));
    out.push(circ(flag(o, "free") ? w / 2 : 20, d / 2, 3));
    if (flag(o, "claw"))
      for (const [x, y] of [
        [d / 2, 2],
        [w - d / 2, 2],
        [d / 2, d - 2],
        [w - d / 2, d - 2],
      ] as Pt[])
        out.push(circ(x, y, 3));
    if (flag(o, "jets"))
      for (const x of [w * 0.3, w * 0.5, w * 0.7])
        out.push(circ(x, 12, 2), circ(x, d - 12, 2));
    return out;
  },
  cornerTub: (w, d) => [
    path(
      `M0,0 L${w},0 L${w},${d * 0.35} A${w * 0.65},${d * 0.65} 0 0 1 ${w * 0.35},${d} L0,${d} Z`,
    ),
    path(
      `M8,8 L${w - 8},8 L${w - 8},${d * 0.35} A${w * 0.6},${d * 0.6} 0 0 1 ${w * 0.35},${d - 8} L8,${d - 8} Z`,
    ),
    circ(w * 0.3, d * 0.3, 3),
  ],
  shower: (w, d, o) => {
    const out = [
      rect(0, 0, w, d),
      ...crossX(0, 0, w, d),
      circ(w / 2, d / 2, 3),
    ];
    if (flag(o, "walkIn")) out.push(line(w, d * 0.4, w, d, true));
    return out;
  },
  neoAngleShower: (w, d) => [
    poly([
      [0, 0],
      [w, 0],
      [w, d * 0.6],
      [w * 0.6, d],
      [0, d],
    ]),
    line(0, 0, w * 0.8, d * 0.8),
    circ(w * 0.45, d * 0.45, 3),
  ],
  hotTub: (w, d) => [
    rect(0, 0, w, d, 20),
    rect(14, 14, w - 28, d - 28, 14),
    ...[0, 1, 2, 3].map((i) =>
      circ(i % 2 ? w - 22 : 22, i < 2 ? 22 : d - 22, 4),
    ),
  ],
  towelRail: (w, d) => [
    rect(0, 0, w, d, 1),
    ...dividers(0, w, 4).map((x) => line(x, 0, x, d)),
  ],

  // Laundry & utility
  washer: (w, d, o) => {
    const out = [
      rect(0, 0, w, d, 2),
      line(0, 10, w, 10),
      circ(w / 2, (d + 10) / 2, min(w, d - 10) * 0.33),
    ];
    if (flag(o, "dryer"))
      out.push(circ(w / 2, (d + 10) / 2, min(w, d - 10) * 0.22, true));
    if (flag(o, "stack"))
      out.push(...crossX(0, 10, w, d - 10).map((p) => ({ ...p, dash: true })));
    if (flag(o, "top")) out.push(rect(w * 0.15, 14, w * 0.7, d - 20, 3));
    return out;
  },
  waterHeater: (w, d, o) =>
    flag(o, "tankless")
      ? [
          rect(0, 0, w, d, 2),
          rect(w * 0.2, d * 0.25, w * 0.6, d * 0.5, 2),
          line(w * 0.3, d, w * 0.3, d + 0.01),
        ]
      : [
          circ(w / 2, d / 2, min(w, d) / 2),
          circ(w / 2, d / 2, min(w, d) * 0.35),
          rect(w * 0.42, -2, w * 0.16, 6),
          line(w / 2, d / 2, w * 0.85, d * 0.15),
        ],
  furnace: (w, d) => [
    rect(0, 0, w, d),
    ...dividers(0, w, 3).map((x) => line(x, 4, x, d - 4)),
    line(0, d - 4, w, d - 4),
  ],
  condenser: (w, d) => {
    const r = min(w, d) * 0.4;
    const out = [
      rect(0, 0, w, d, 2),
      circ(w / 2, d / 2, r),
      circ(w / 2, d / 2, r * 0.18),
    ];
    for (let i = 0; i < 4; i++)
      out.push(
        ell(
          w / 2 + Math.cos((i * Math.PI) / 2 + 0.4) * r * 0.55,
          d / 2 + Math.sin((i * Math.PI) / 2 + 0.4) * r * 0.55,
          r * 0.35,
          r * 0.15,
          i * 90 + 23,
        ),
      );
    return out;
  },
  radiator: (w, d) => {
    const out = [rect(0, 0, w, d, 1)];
    for (let x = 5; x < w - 2; x += 5) out.push(line(x, 1, x, d - 1));
    return out;
  },
  fireplace: (w, d, o) => {
    const hearth = flag(o, "noHearth") ? 0 : d * 0.3;
    const body = d - hearth;
    const out = [
      rect(0, 0, w, body),
      poly([
        [w * 0.2, body * 0.25],
        [w * 0.8, body * 0.25],
        [w * 0.9, body],
        [w * 0.1, body],
      ]),
    ];
    if (hearth) out.push(rect(-0.01, body, w, hearth, 0, true));
    return out;
  },
  stove: (w, d) => [
    circ(w / 2, d / 2, min(w, d) / 2),
    rect(w * 0.3, d * 0.55, w * 0.4, d * 0.3, 2),
    circ(w / 2, d * 0.15, min(w, d) * 0.08),
  ],
  electricalPanel: (w, d) => {
    const out = [rect(0, 0, w, d), rect(3, 1, w - 6, d - 2)];
    for (const x of dividers(3, w - 3, max(2, Math.round(w / 6))))
      out.push(line(x, 1, x, d - 1));
    return out;
  },
  tank: (w, d, o) => {
    const n = num(o, "tanks", 1);
    const out: Prim[] = [rect(0, 0, w, d, 0, true)];
    for (const x of centres(0, w, n))
      out.push(circ(x, d / 2, min(w / n, d) * 0.45));
    if (flag(o, "brine"))
      out.push(rect(w * 0.55, d * 0.1, w * 0.4, d * 0.8, 3));
    return out;
  },
  ladder: (w, d) => {
    const out = [line(0, 0, 0, d), line(w, 0, w, d)];
    for (let y = 25; y < d; y += 28) out.push(line(0, y, w, y));
    out.unshift(rect(0, 0, w, d, 0, true));
    return out;
  },
  ironingBoard: (w, d) => [
    path(
      `M0,${d * 0.1} L${w * 0.75},${d * 0.1} Q${w},${d * 0.5} ${w * 0.75},${d * 0.9} L0,${d * 0.9} Z`,
    ),
    line(w * 0.1, d / 2, w * 0.6, d / 2, true),
  ],
  rack: (w, d, o) => {
    const out = [rect(0, 0, w, d, 1)];
    for (const y of dividers(0, d, num(o, "rails", 4)))
      out.push(line(0, y, w, y));
    return out;
  },

  // Electronics & smart home
  tv: (w, d, o) => {
    const sd = min(d, 8);
    const out: Prim[] = [rect(0, 0, w, sd, 1)];
    if (flag(o, "stand")) out.push(rect(w * 0.35, sd, w * 0.3, d - sd, 3));
    else out.push(line(w * 0.05, sd / 2, w * 0.95, sd / 2, true));
    return out;
  },
  screen: (w, d) => [rect(0, 0, w, d, 1, true), line(0, d / 2, w, d / 2)],
  speaker: (w, d, o) => {
    const out = [rect(0, 0, w, d, 2), circ(w / 2, d * 0.55, min(w, d) * 0.32)];
    if (flag(o, "tweeter")) out.push(circ(w / 2, d * 0.15, min(w, d) * 0.08));
    return out;
  },
  soundbar: (w, d) => [
    rect(0, 0, w, d, d / 2),
    ...centres(4, w - 4, max(3, Math.round(w / 12))).map((x) =>
      circ(x, d / 2, 1),
    ),
  ],
  device: (w, d, o) => {
    const out = [rect(0, 0, w, d, num(o, "r", 2))];
    for (const x of centres(0, w, num(o, "antennas", 0)))
      out.push(line(x, 0, x, -min(12, d)));
    const leds = num(o, "leds", 0);
    for (const x of centres(w * 0.2, w * 0.8, leds))
      out.push(circ(x, d - 2.5, 0.8));
    if (flag(o, "screen"))
      out.push(rect(w * 0.1, d * 0.15, w * 0.8, d * 0.6, 1));
    if (flag(o, "lens")) out.push(circ(w / 2, d * 0.7, min(w, d) * 0.22));
    if (flag(o, "button")) out.push(circ(w / 2, d * 0.65, min(w, d) * 0.25));
    if (flag(o, "fan")) out.push(circ(w / 2, d / 2, min(w, d) * 0.3));
    if (flag(o, "rackUnits"))
      for (const y of dividers(0, d, max(2, Math.round(d / 8))))
        out.push(line(2, y, w - 2, y));
    if (flag(o, "x")) out.push(...crossX(0, 0, w, d));
    return out;
  },
  puck: (w, d, o) => {
    const out = [
      ell(w / 2, d / 2, w / 2, d / 2),
      ell(w / 2, d / 2, w * 0.3, d * 0.3),
    ];
    if (flag(o, "dot")) out.push(circ(w / 2, d / 2, min(w, d) * 0.06));
    if (flag(o, "dash"))
      out[0] = ell(w / 2, d / 2, w / 2, d / 2, undefined, true);
    return out;
  },
  laptop: (w, d) => [
    rect(0, d * 0.1, w, d * 0.9, 2),
    rect(0, 0, w, d * 0.1, 1),
    rect(w * 0.1, d * 0.22, w * 0.8, d * 0.4, 1),
    rect(w * 0.35, d * 0.7, w * 0.3, d * 0.2, 1),
  ],
  monitor: (w, d) => [
    rect(0, 0, w, min(4, d), 1),
    rect(w * 0.38, min(4, d), w * 0.24, d - min(4, d), 2),
    line(w / 2, min(4, d), w / 2, d * 0.5),
  ],
  printer: (w, d) => [
    rect(0, d * 0.15, w, d * 0.85, 3),
    rect(w * 0.2, 0, w * 0.6, d * 0.15, 1),
    line(w * 0.2, d * 0.8, w * 0.8, d * 0.8),
  ],
  projector: (w, d) => [
    rect(0, 0, w, d, 3),
    circ(w * 0.7, d - 4, min(w, d) * 0.15),
    line(w * 0.15, d * 0.3, w * 0.45, d * 0.3),
  ],
  ceilingFan: (w, d, o) => {
    const blades = num(o, "blades", 4);
    const r = min(w, d) / 2;
    const out: Prim[] = [circ(w / 2, d / 2, r * 0.14)];
    for (let i = 0; i < blades; i++) {
      const a = (i / blades) * 360;
      const rad = (a * Math.PI) / 180;
      out.push(
        ell(
          w / 2 + Math.cos(rad) * r * 0.57,
          d / 2 + Math.sin(rad) * r * 0.57,
          r * 0.43,
          r * 0.11,
          a,
        ),
      );
    }
    out.push(circ(w / 2, d / 2, r, true));
    return out;
  },
  floorFan: (w, d) => [
    circ(w / 2, d * 0.45, min(w, d) * 0.45),
    circ(w / 2, d * 0.45, min(w, d) * 0.1),
    ...[0, 120, 240].map((a) =>
      ell(
        w / 2 + Math.cos((a * Math.PI) / 180) * min(w, d) * 0.24,
        d * 0.45 + Math.sin((a * Math.PI) / 180) * min(w, d) * 0.24,
        min(w, d) * 0.18,
        min(w, d) * 0.08,
        a,
      ),
    ),
    rect(w * 0.3, d * 0.85, w * 0.4, d * 0.15, 2),
  ],
  grille: (w, d, o) => {
    const out = [rect(0, 0, w, d, num(o, "r", 3))];
    for (const y of dividers(0, d, num(o, "lines", 4)))
      out.push(line(w * 0.12, y, w * 0.88, y));
    return out;
  },

  // Lighting
  lamp: (w, d) => [
    circ(w / 2, d / 2, min(w, d) / 2),
    line(
      w / 2 - min(w, d) * 0.35,
      d / 2 - min(w, d) * 0.35,
      w / 2 + min(w, d) * 0.35,
      d / 2 + min(w, d) * 0.35,
    ),
    line(
      w / 2 + min(w, d) * 0.35,
      d / 2 - min(w, d) * 0.35,
      w / 2 - min(w, d) * 0.35,
      d / 2 + min(w, d) * 0.35,
    ),
  ],
  arcLamp: (w, d) => [
    circ(w * 0.15, d * 0.8, min(w, d) * 0.15),
    path(`M${w * 0.15},${d * 0.8} Q${w * 0.2},0 ${w * 0.8},${d * 0.2}`),
    circ(w * 0.8, d * 0.3, min(w, d) * 0.18),
  ],
  ceilingLight: (w, d) => {
    const r = min(w, d) / 2;
    const out: Prim[] = [circ(w / 2, d / 2, r * 0.55)];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      out.push(
        line(
          w / 2 + Math.cos(a) * r * 0.7,
          d / 2 + Math.sin(a) * r * 0.7,
          w / 2 + Math.cos(a) * r,
          d / 2 + Math.sin(a) * r,
        ),
      );
    }
    return out;
  },
  chandelier: (w, d, o) => {
    const arms = num(o, "arms", 6);
    const r = min(w, d) / 2;
    const out: Prim[] = [circ(w / 2, d / 2, r * 0.18)];
    for (let i = 0; i < arms; i++) {
      const a = (i / arms) * Math.PI * 2;
      const ex = w / 2 + Math.cos(a) * r * 0.82;
      const ey = d / 2 + Math.sin(a) * r * 0.82;
      out.push(line(w / 2, d / 2, ex, ey), circ(ex, ey, r * 0.16));
    }
    return out;
  },
  trackLight: (w, d) => [
    rect(0, d / 2 - 1.5, w, 3, 1),
    ...centres(0, w, max(2, Math.round(w / 30))).map((x) =>
      circ(x, d / 2, min(5, d / 2)),
    ),
  ],
  sconce: (w, d) => [
    rect(0, 0, w, d * 0.3),
    path(`M0,${d * 0.3} Q${w / 2},${d * 1.4} ${w},${d * 0.3}`),
  ],

  // Light fixtures
  /** A long, thin light — baseboard, cove, under-cabinet, toe-kick: a slim
   * channel with its LEDs dotted along it, however long it's stretched. */
  linearLight: (w, d, o) => {
    const out: Prim[] = [rect(0, 0, w, d, Math.min(d / 2, 3))];
    const pitch = num(o, "pitch", 8);
    for (let x = pitch / 2; x < w; x += pitch)
      out.push(circ(x, d / 2, Math.max(0.6, Math.min(d * 0.28, 1.6))));
    if (flag(o, "cove")) out.push(line(0, -3, w, -3, true));
    return out;
  },
  panelLight: (w, d, o) => {
    const out = [rect(0, 0, w, d, 1), rect(3, 3, w - 6, d - 6)];
    const cols = num(o, "cols", 2);
    const rows = num(o, "rows", Math.max(2, Math.round(d / (w / cols))));
    for (const x of dividers(3, w - 3, cols - 1))
      out.push(line(x, 3, x, d - 3, true));
    for (const y of dividers(3, d - 3, rows - 1))
      out.push(line(3, y, w - 3, y, true));
    return out;
  },
  shopLight: (w, d) => [
    rect(0, 0, w, d, 2),
    line(4, d * 0.33, w - 4, d * 0.33),
    line(4, d * 0.67, w - 4, d * 0.67),
    rect(-1, d * 0.2, 3, d * 0.6),
    rect(w - 2, d * 0.2, 3, d * 0.6),
  ],
  gimbal: (w, d) => [
    circ(w / 2, d / 2, min(w, d) / 2),
    circ(w / 2, d / 2, min(w, d) * 0.36),
    circ(w * 0.58, d * 0.44, min(w, d) * 0.18),
  ],
  wafer: (w, d) => [
    circ(w / 2, d / 2, min(w, d) / 2),
    circ(w / 2, d / 2, min(w, d) * 0.43, true),
  ],
  /** A directional spot: its head at the back, beam spreading forward. */
  spotlight: (w, d) => [
    circ(w / 2, w / 2, w / 2.2),
    poly(
      [
        [w * 0.3, w * 0.8],
        [w * 0.7, w * 0.8],
        [w, d],
        [0, d],
      ],
      true,
      true,
    ),
  ],
  flood: (w, d, o) => {
    const heads = num(o, "heads", 1);
    const out: Prim[] = [rect(0, 0, w, d * 0.45, 2)];
    for (const x of centres(0, w, heads)) {
      out.push(
        rect(x - w / heads / 2 + 2, d * 0.45, w / heads - 4, d * 0.4, 2),
      );
      out.push(
        line(x, d * 0.85, x - w / heads / 2, d, true),
        line(x, d * 0.85, x + w / heads / 2, d, true),
      );
    }
    if (flag(o, "sensor"))
      out.push(circ(w / 2, d * 0.22, Math.min(w, d) * 0.12));
    return out;
  },
  pathLight: (w, d) => {
    const r = min(w, d) / 2;
    const out: Prim[] = [
      circ(w / 2, d / 2, r * 0.4),
      circ(w / 2, d / 2, r * 0.15),
    ];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      out.push(
        line(
          w / 2 + Math.cos(a) * r * 0.55,
          d / 2 + Math.sin(a) * r * 0.55,
          w / 2 + Math.cos(a) * r,
          d / 2 + Math.sin(a) * r,
          true,
        ),
      );
    }
    return out;
  },
  bollard: (w, d) => [
    circ(w / 2, d / 2, min(w, d) / 2),
    circ(w / 2, d / 2, min(w, d) * 0.3),
    line(w * 0.15, d / 2, w * 0.85, d / 2),
    line(w / 2, d * 0.15, w / 2, d * 0.85),
  ],
  stepLight: (w, d) => {
    const out = [rect(0, 0, w, d, 1)];
    for (const x of dividers(0, w, 3)) out.push(line(x, d * 0.2, x, d * 0.8));
    return out;
  },
  vanityBar: (w, d, o) => {
    const bulbs = num(o, "bulbs", 3);
    const out: Prim[] = [rect(0, d * 0.3, w, d * 0.4, d * 0.2)];
    for (const x of centres(0, w, bulbs))
      out.push(circ(x, d / 2, Math.min(d / 2, w / bulbs / 3)));
    return out;
  },
  pictureLight: (w, d) => [
    rect(0, 0, w, d * 0.4, 1),
    path(`M0,${d * 0.4} Q${w / 2},${d * 1.1} ${w},${d * 0.4}`, true),
    line(w / 2, 0, w / 2, -d * 0.4),
  ],
  lantern: (w, d) => {
    const pts: Pt[] = Array.from({ length: 8 }, (_, i) => [
      w / 2 + Math.cos(((i + 0.5) * Math.PI) / 4) * (w / 2),
      d / 2 + Math.sin(((i + 0.5) * Math.PI) / 4) * (d / 2),
    ]);
    return [
      poly(pts),
      circ(w / 2, d / 2, min(w, d) * 0.25),
      ...pts
        .filter((_, i) => i % 2 === 0)
        .map(([x, y]) => line(w / 2, d / 2, x, y, true)),
    ];
  },
  // A drum shade: its rim, the diffuser inside, the bulb at the centre.
  drumShade: (w, d) => [
    ell(w / 2, d / 2, w / 2, d / 2),
    ell(w / 2, d / 2, w * 0.42, d * 0.42, undefined, true),
    circ(w / 2, d / 2, min(w, d) * 0.08),
  ],
  // A glass globe with a soft highlight.
  globeLight: (w, d) => {
    const r = min(w, d) / 2;
    return [
      ell(w / 2, d / 2, w / 2, d / 2),
      path(
        `M${w / 2 - r * 0.55},${d / 2 - r * 0.1} A${r * 0.6},${r * 0.6} 0 0 1 ${w / 2 - r * 0.1},${d / 2 - r * 0.55}`,
      ),
      circ(w / 2, d / 2, r * 0.12),
    ];
  },
  // Globes hung at different drops from one canopy.
  globeCluster: (w, d) => {
    const r = min(w, d) / 2;
    const out: Prim[] = [circ(w / 2, d / 2, r * 0.14)];
    const spots: [number, number, number][] = [
      [-0.45, -0.35, 0.3],
      [0.45, -0.3, 0.26],
      [0.1, 0.5, 0.32],
      [-0.5, 0.42, 0.2],
      [0.55, 0.45, 0.18],
    ];
    for (const [fx, fy, fr] of spots) {
      const x = w / 2 + fx * r * 0.95;
      const y = d / 2 + fy * r * 0.95;
      out.push(line(w / 2, d / 2, x, y, true), circ(x, y, fr * r));
    }
    return out;
  },
  // A dome shade seen from above: the rim and the shade's ribs.
  domePendant: (w, d) => {
    const r = min(w, d) / 2;
    const out: Prim[] = [
      ell(w / 2, d / 2, w / 2, d / 2),
      circ(w / 2, d / 2, r * 0.18),
    ];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      out.push(
        line(
          w / 2 + Math.cos(a) * r * 0.18,
          d / 2 + Math.sin(a) * r * 0.18,
          w / 2 + Math.cos(a) * r * 0.85,
          d / 2 + Math.sin(a) * r * 0.85,
          true,
        ),
      );
    }
    return out;
  },
  squareLight: (w, d) => [
    rect(0, 0, w, d, min(w, d) * 0.12),
    rect(w * 0.2, d * 0.2, w * 0.6, d * 0.6, min(w, d) * 0.08),
  ],
  // Modern halo rings, one inside the next.
  ringLight: (w, d, o) => {
    const n = Math.max(1, num(o, "rings", 1));
    const out: Prim[] = [];
    for (let i = 0; i < n; i++) {
      const k = 1 - i * (0.55 / Math.max(1, n));
      out.push(ell(w / 2, d / 2, (w / 2) * k, (d / 2) * k));
      out.push(
        ell(
          w / 2,
          d / 2,
          (w / 2) * k - 2.5,
          (d / 2) * k - 2.5,
          undefined,
          true,
        ),
      );
    }
    out.push(circ(w / 2, d / 2, min(w, d) * 0.05));
    return out;
  },
  // A bar with candle-style arms both sides.
  linearChandelier: (w, d) => {
    const out: Prim[] = [rect(0, d * 0.42, w, d * 0.16, d * 0.08)];
    const n = Math.max(2, Math.round(w / 25));
    for (const x of dividers(0, w, n)) {
      out.push(line(x, d * 0.42, x, d * 0.12), circ(x, d * 0.1, d * 0.1));
      out.push(line(x, d * 0.58, x, d * 0.88), circ(x, d * 0.9, d * 0.1));
    }
    return out;
  },
  // A ceiling bar with aimable spots along it.
  spotBar: (w, d, o) => {
    const n = Math.max(1, num(o, "spots", 3));
    const out: Prim[] = [rect(0, d * 0.35, w, d * 0.3, d * 0.15)];
    const r = min(d * 0.5, w / (n * 2.4));
    for (let i = 0; i < n; i++) {
      const x = (w / n) * (i + 0.5);
      out.push(circ(x, d / 2, r), circ(x, d / 2, r * 0.45));
    }
    return out;
  },
  // A wall plate with a hinged arm out to its shade.
  swingArm: (w, d) => [
    rect(0, 0, w, d * 0.12, 1),
    line(w / 2, d * 0.12, w / 2, d * 0.62),
    circ(w / 2, d * 0.62, w * 0.12),
    ell(w / 2, d * 0.82, w / 2, d * 0.18),
  ],
  // Wall lamps: a back plate and a shade per head.
  wallLamp: (w, d, o) => {
    const heads = Math.max(1, num(o, "heads", 1));
    const out: Prim[] = [rect(0, 0, w, d * 0.25, 1)];
    for (let i = 0; i < heads; i++) {
      const cx = (w / heads) * (i + 0.5);
      const r = min(w / heads, d) * 0.42;
      out.push(
        path(
          `M${cx - r},${d * 0.25} Q${cx},${d * 0.25 + r * 2.1} ${cx + r},${d * 0.25}`,
        ),
      );
    }
    return out;
  },
  // Three splayed legs under a round shade.
  tripodLamp: (w, d) => {
    const r = min(w, d) / 2;
    const out: Prim[] = [circ(w / 2, d / 2, r * 0.42)];
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + (i / 3) * Math.PI * 2;
      out.push(
        line(
          w / 2 + Math.cos(a) * r * 0.42,
          d / 2 + Math.sin(a) * r * 0.42,
          w / 2 + Math.cos(a) * r,
          d / 2 + Math.sin(a) * r,
        ),
        circ(w / 2 + Math.cos(a) * r, d / 2 + Math.sin(a) * r, r * 0.05),
      );
    }
    return out;
  },
  // A slim pole on a triangular base that tucks into a corner.
  cornerLamp: (w, d) => [
    poly([
      [0, 0],
      [w, 0],
      [0, d],
    ]),
    circ(w * 0.3, d * 0.3, min(w, d) * 0.12),
    line(w * 0.3, d * 0.3, w * 0.62, d * 0.62, true),
  ],
  // A rough-hewn salt crystal.
  saltLamp: (w, d) => [
    path(
      `M${w * 0.2},${d} L${w * 0.05},${d * 0.55} L${w * 0.25},${d * 0.1} L${w * 0.6},0 L${w * 0.95},${d * 0.35} L${w * 0.85},${d} Z`,
    ),
    path(
      `M${w * 0.3},${d * 0.75} L${w * 0.45},${d * 0.35} L${w * 0.7},${d * 0.55}`,
      true,
    ),
  ],
  // Modular hexagon panels, tiled in a cluster.
  hexPanels: (w, d) => {
    const r = min(w / 4.2, d / 3.6);
    const hw = Math.sqrt(3) * r;
    const hex = (cx: number, cy: number) =>
      poly(
        Array.from({ length: 6 }, (_, i): Pt => [
          cx + Math.cos((Math.PI / 3) * i + Math.PI / 6) * r,
          cy + Math.sin((Math.PI / 3) * i + Math.PI / 6) * r,
        ]),
      );
    const cy = d / 2;
    const x0 = w / 2 - hw;
    return [
      hex(x0, cy - r * 0.75),
      hex(x0 + hw, cy - r * 0.75),
      hex(x0 + hw / 2, cy + r * 0.75),
      hex(x0 + hw * 1.5, cy + r * 0.75),
      hex(x0 + hw * 2, cy - r * 0.75),
    ].filter((p) =>
      p.t === "poly"
        ? p.points.every(([x]) => x >= -0.5 && x <= w + 0.5)
        : true,
    );
  },
  // Triangle panels, alternating up and down.
  triPanels: (w, d) => {
    const out: Prim[] = [];
    const n = Math.max(2, Math.round((w / d) * 2));
    const s = w / ((n + 1) / 2);
    for (let i = 0; i < n; i++) {
      const x = (i * s) / 2;
      out.push(
        i % 2 === 0
          ? poly([
              [x, d],
              [x + s / 2, 0],
              [x + s, d],
            ])
          : poly([
              [x, 0],
              [x + s, 0],
              [x + s / 2, d],
            ]),
      );
    }
    return out;
  },
  // A dome projector throwing stars.
  starProjector: (w, d) => {
    const r = min(w, d) / 2;
    const out: Prim[] = [
      circ(w / 2, d / 2, r * 0.6),
      circ(w / 2, d / 2, r * 0.25),
    ];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.3;
      out.push(
        circ(
          w / 2 + Math.cos(a) * r * 0.88,
          d / 2 + Math.sin(a) * r * 0.88,
          r * 0.05,
        ),
      );
    }
    return out;
  },
  // A gooseneck arm from the wall out to a wide barn shade.
  barnLight: (w, d) => [
    rect(w * 0.35, 0, w * 0.3, d * 0.08, 1),
    path(`M${w / 2},${d * 0.08} Q${w / 2},${d * 0.35} ${w / 2},${d * 0.45}`),
    ell(w / 2, d * 0.72, w / 2, d * 0.28),
    circ(w / 2, d * 0.72, min(w, d) * 0.08),
  ],
  // Festoon bulbs swagged between posts.
  cafeLights: (w, d) => {
    const spans = Math.max(1, Math.round(w / 200));
    const span = w / spans;
    const out: Prim[] = [];
    let dpath = `M0,${d * 0.15}`;
    for (let i = 0; i < spans; i++) {
      const x = i * span;
      dpath += ` Q${x + span / 2},${d * 1.1} ${x + span},${d * 0.15}`;
      out.push(circ(x, d * 0.15, d * 0.12));
    }
    out.unshift(path(dpath));
    out.push(circ(w, d * 0.15, d * 0.12));
    const bulbs = Math.max(4, Math.round(w / 30));
    for (let i = 1; i < bulbs; i++) {
      const t = i / bulbs;
      const local = ((t * w) % span) / span;
      const y =
        d * 0.15 + (d * 0.95 - d * 0.15) * 4 * local * (1 - local) * 0.5;
      out.push(circ(t * w, y + d * 0.08, Math.min(2.2, d * 0.08)));
    }
    return out;
  },
  postCap: (w, d) => [
    rect(0, 0, w, d, 1),
    rect(w * 0.15, d * 0.15, w * 0.7, d * 0.7, 1, true),
    circ(w / 2, d / 2, min(w, d) * 0.2),
  ],
  // A recessed ground light: rim, grille, lamp.
  wellLight: (w, d) => {
    const r = min(w, d) / 2;
    return [
      circ(w / 2, d / 2, r),
      circ(w / 2, d / 2, r * 0.75),
      line(w / 2 - r * 0.75, d / 2, w / 2 + r * 0.75, d / 2),
      line(w / 2, d / 2 - r * 0.75, w / 2, d / 2 + r * 0.75),
    ];
  },
  skylightPanel: (w, d) => [
    rect(0, 0, w, d, 2),
    rect(4, 4, w - 8, d - 8, 1),
    line(4, 4, w - 4, d - 4, true),
    line(w - 4, 4, 4, d - 4, true),
  ],
  linearPendant: (w, d) => [
    rect(0, d * 0.25, w, d * 0.5, d * 0.25),
    line(d * 0.4, d / 2, w - d * 0.4, d / 2, true),
    circ(w * 0.15, d / 2, d * 0.12),
    circ(w * 0.85, d / 2, d * 0.12),
  ],
  pendantRow: (w, d, o) => {
    const n = num(o, "lights", 3);
    const out: Prim[] = [line(0, d / 2, w, d / 2, true)];
    const r = Math.min(d / 2, w / n / 2.4);
    for (const x of centres(0, w, n))
      out.push(circ(x, d / 2, r), circ(x, d / 2, r * 0.4));
    out.unshift(rect(0, 0, w, d, 0, true));
    return out;
  },
  lightBar: (w, d) => [
    rect(0, 0, w, d, d / 3),
    rect(2, d * 0.3, w - 4, d * 0.4, d * 0.2),
    line(-3, d / 2, -1, d / 2),
    line(w + 1, d / 2, w + 3, d / 2),
  ],
  neon: (w, d) => {
    let p = `M0,${d / 2}`;
    const waves = Math.max(2, Math.round(w / 15));
    for (let i = 0; i < waves; i++) {
      const x = (w * (i + 0.5)) / waves;
      const y = i % 2 ? d : 0;
      p += ` Q${x},${y} ${(w * (i + 1)) / waves},${d / 2}`;
    }
    return [rect(0, 0, w, d, 1, true), path(p)];
  },
  monorail: (w, d) => {
    const out: Prim[] = [
      path(
        `M0,${d / 2} C${w * 0.25},0 ${w * 0.5},${d} ${w * 0.75},${d / 2} S${w},${d * 0.2} ${w},${d * 0.3}`,
      ),
    ];
    for (const t of [0.15, 0.4, 0.65, 0.9])
      out.push(
        circ(
          w * t,
          d / 2 + Math.sin(t * Math.PI * 2) * d * 0.25,
          Math.min(d * 0.2, 4),
        ),
      );
    out.unshift(rect(0, 0, w, d, 0, true));
    return out;
  },
  uplight: (w, d) => [
    circ(w / 2, d / 2, min(w, d) / 2),
    circ(w / 2, d / 2, min(w, d) * 0.3),
    circ(w / 2, d / 2, min(w, d) * 0.42, true),
  ],
  fanLight: (w, d) => [
    circ(w / 2, d / 2, min(w, d) * 0.16),
    circ(w / 2, d / 2, min(w, d) * 0.08),
    ...T["ceilingFan"]!(w, d, { blades: 5 }).slice(1),
  ],
  exitSign: (w, d) => [
    rect(0, 0, w, d, 1),
    rect(w * 0.15, d * 0.2, w * 0.7, d * 0.6, 1),
    line(w * 0.25, d / 2, w * 0.75, d / 2),
  ],

  /** One of the line icons (opts.icon, see ui-icons.ts), single colour. */
  icon: (w, d, o) => [{ t: "icon", name: String(o["icon"] ?? ""), w, d }],

  /** A houseplant seen from above, by opts.kind (monstera, bird, snake,
   * pothos, fern, …). */
  houseplant: (w, d, o) => houseplant(w, d, String(o["kind"] ?? "")),

  // Plants & decor
  plant: (w, d, o) => {
    const n = num(o, "leaves", 7);
    const r = min(w, d) / 2;
    const out: Prim[] = [circ(w / 2, d / 2, r * 0.3)];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 360;
      const rad = (a * Math.PI) / 180;
      out.push(
        ell(
          w / 2 + Math.cos(rad) * r * 0.62,
          d / 2 + Math.sin(rad) * r * 0.62,
          r * 0.38,
          r * 0.16,
          a,
        ),
      );
    }
    return out;
  },
  tree: (w, d, o) => [
    path(scallopPath(w / 2, d / 2, min(w, d) / 2 - 2, num(o, "lobes", 9))),
    circ(w / 2, d / 2, min(w, d) * 0.05),
  ],
  /** A planting seen from above, by opts.form (see outdoor-models.ts). */
  landscape: (w, d, o) => landscapeTop(w, d, String(o["form"] ?? "")),
  /** A slim pedestal or wall light: its body, and the lit face along its
   * front. */
  impress: (w, d) => [
    rect(0, 0, w, d, 1),
    rect(w * 0.12, d * 0.62, w * 0.76, d * 0.28, 1, true),
  ],
  cactus: (w, d) => [
    circ(w / 2, d / 2, min(w, d) / 2),
    circ(w / 2, d / 2, min(w, d) * 0.25),
    ...[0, 1, 2, 3, 4, 5].map((i) =>
      line(
        w / 2,
        d / 2,
        w / 2 + Math.cos(i) * min(w, d) * 0.45,
        d / 2 + Math.sin(i) * min(w, d) * 0.45,
      ),
    ),
  ],
  mirror: (w, d) => {
    const out = [rect(0, 0, w, d, 1)];
    for (let x = 4; x < w; x += 8) out.push(line(x, d, x + d, 0));
    return out;
  },
  divider: (w, d, o) => {
    const panels = num(o, "panels", 3);
    const pts: Pt[] = [];
    for (let i = 0; i <= panels; i++)
      pts.push([(w * i) / panels, i % 2 ? d : 0]);
    return [rect(0, 0, w, d, 0, true), poly(pts, false)];
  },
  clock: (w, d) => [
    rect(0, 0, w, d, 2),
    circ(w / 2, d * 0.55, min(w, d) * 0.3),
    line(w / 2, d * 0.55, w / 2, d * 0.35),
  ],
  globe: (w, d) => [
    circ(w / 2, d / 2, min(w, d) / 2),
    ell(w / 2, d / 2, min(w, d) * 0.2, min(w, d) / 2),
    line(0, d / 2, w, d / 2),
  ],
  /** A straight flight: its treads across, every ~27 cm. */
  stairs: (w, d) => {
    const out: Prim[] = [rect(0, 0, w, d)];
    const n = max(2, Math.round(d / 27));
    for (const y of dividers(0, d, n - 1)) out.push(line(0, y, w, y));
    return out;
  },
  rug: (w, d, o) => {
    if (flag(o, "round"))
      return [
        ell(w / 2, d / 2, w / 2, d / 2),
        ell(w / 2, d / 2, w / 2 - 8, d / 2 - 8, undefined, true),
      ];
    const out = [rect(0, 0, w, d), rect(8, 8, w - 16, d - 16, 0, true)];
    for (let y = 4; y < d; y += 6)
      out.push(line(-4, y, 0, y), line(w, y, w + 4, y));
    return out;
  },

  // Outdoor & garden
  grill: (w, d, o) => {
    const bx = flag(o, "noShelves") ? 0 : w * 0.22;
    const out = [rect(bx, 0, w - 2 * bx, d, 6)];
    for (const x of dividers(bx, w - bx, 5)) out.push(line(x, 6, x, d - 6));
    if (bx)
      out.push(
        rect(0, d * 0.1, bx, d * 0.8, 1),
        rect(w - bx, d * 0.1, bx, d * 0.8, 1),
      );
    return out;
  },
  kamado: (w, d) => [
    circ(w / 2, d / 2, min(w, d) / 2),
    circ(w / 2, d / 2, min(w, d) * 0.38),
    ...dividers(w * 0.15, w * 0.85, 4).map((x) => line(x, d * 0.2, x, d * 0.8)),
  ],
  firePit: (w, d, o) =>
    flag(o, "square")
      ? [
          rect(0, 0, w, d, 3),
          rect(w * 0.18, d * 0.18, w * 0.64, d * 0.64, 2),
          rect(w * 0.3, d * 0.3, w * 0.4, d * 0.4, 1, true),
        ]
      : [
          circ(w / 2, d / 2, min(w, d) / 2),
          circ(w / 2, d / 2, min(w, d) * 0.34),
          circ(w / 2, d / 2, min(w, d) * 0.2, true),
        ],
  umbrella: (w, d) => {
    const r = min(w, d) / 2;
    const out: Prim[] = [circ(w / 2, d / 2, r, true), circ(w / 2, d / 2, 3)];
    for (let i = 0; i < 8; i++)
      out.push(
        line(
          w / 2,
          d / 2,
          w / 2 + Math.cos((i * Math.PI) / 4) * r,
          d / 2 + Math.sin((i * Math.PI) / 4) * r,
        ),
      );
    return out;
  },
  cantileverUmbrella: (w, d) => [
    circ(w * 0.58, d / 2, min(w * 0.42, d / 2), true),
    rect(0, d / 2 - 15, 30, 30, 2),
    line(15, d / 2, w * 0.58, d / 2),
  ],
  hammock: (w, d) => [
    ell(w / 2, d / 2, w * 0.35, d * 0.4),
    line(0, d / 2, w * 0.15, d / 2),
    line(w * 0.85, d / 2, w, d / 2),
    rect(0, 0, w, d, 0, true),
  ],
  swingSet: (w, d, o) => {
    const seats = num(o, "seats", 2);
    const out: Prim[] = [
      rect(0, 0, w, d, 0, true),
      line(0, d / 2, w, d / 2),
      line(0, 0, 10, d / 2),
      line(0, d, 10, d / 2),
      line(w, 0, w - 10, d / 2),
      line(w, d, w - 10, d / 2),
    ];
    for (const x of centres(20, w - 20, seats))
      out.push(rect(x - 22, d / 2 - 8, 44, 16, 3));
    return out;
  },
  trampoline: (w, d) => [
    circ(w / 2, d / 2, min(w, d) / 2),
    circ(w / 2, d / 2, min(w, d) * 0.42),
    circ(w / 2, d / 2, min(w, d) / 2 - 2, true),
  ],
  pool: (w, d, o) => {
    if (flag(o, "round"))
      return [
        circ(w / 2, d / 2, min(w, d) / 2),
        circ(w / 2, d / 2, min(w, d) / 2 - 15),
      ];
    const out = [rect(0, 0, w, d, 20), rect(15, 15, w - 30, d - 30, 12)];
    for (let i = 1; i <= 3; i++)
      out.push(line(15 + i * 30, 15, 15 + i * 30, 15 + d * 0.3));
    return out;
  },
  shed: (w, d) => [
    rect(0, 0, w, d),
    line(0, d / 2, w, d / 2),
    line(w * 0.35, d, w * 0.65, d - 0.01),
    rect(w * 0.35, d - 4, w * 0.3, 4),
  ],
  greenhouse: (w, d) => {
    const out = [rect(0, 0, w, d), line(0, d / 2, w, d / 2)];
    for (const x of dividers(0, w, max(2, Math.round(w / 60))))
      out.push(line(x, 0, x, d, true));
    return out;
  },
  raisedBed: (w, d) => {
    const out = [rect(0, 0, w, d), rect(6, 6, w - 12, d - 12)];
    for (const x of centres(6, w - 6, max(2, Math.round(w / 35))))
      for (const y of centres(6, d - 6, max(1, Math.round(d / 35))))
        out.push(circ(x, y, 5));
    return out;
  },
  planter: (w, d, o) => {
    const body = flag(o, "round")
      ? ell(w / 2, d / 2, w / 2, d / 2)
      : rect(0, 0, w, d, 3);
    return [
      body,
      ...T["plant"]!(w * 0.8, d * 0.8, { leaves: 6 }).map((p) =>
        offset(p, w * 0.1, d * 0.1),
      ),
    ];
  },
  compost: (w, d) => [
    rect(0, 0, w, d, 2),
    ...dividers(0, w, 3).map((x) => line(x, 0, x, d)),
    line(0, d * 0.15, w, d * 0.15),
  ],
  picnicTable: (w, d) => [
    rect(0, d * 0.28, w, d * 0.44, 2),
    rect(0, 0, w, d * 0.2, 1),
    rect(0, d * 0.8, w, d * 0.2, 1),
    line(w * 0.15, d * 0.28, w * 0.15, d * 0.72, true),
    line(w * 0.85, d * 0.28, w * 0.85, d * 0.72, true),
  ],
  mower: (w, d, o) =>
    flag(o, "riding")
      ? [
          rect(0, 0, w, d, 15),
          rect(w * 0.3, d * 0.45, w * 0.4, d * 0.25, 5),
          circ(w / 2, d * 0.25, min(w, d) * 0.12),
          rect(-6, d * 0.6, 6, d * 0.3),
          rect(w, d * 0.6, 6, d * 0.3),
        ]
      : [
          rect(0, d * 0.35, w, d * 0.65, 6),
          circ(w / 2, d * 0.67, min(w, d * 0.65) * 0.4),
          line(w * 0.2, d * 0.35, w * 0.3, 0),
          line(w * 0.8, d * 0.35, w * 0.7, 0),
          line(w * 0.3, 0, w * 0.7, 0),
        ],
  wheelbarrow: (w, d) => [
    poly([
      [w * 0.1, d * 0.2],
      [w * 0.9, d * 0.2],
      [w * 0.75, d * 0.75],
      [w * 0.25, d * 0.75],
    ]),
    rect(w * 0.45, d * 0.78, w * 0.1, d * 0.22, 2),
    line(w * 0.2, d * 0.2, w * 0.15, 0),
    line(w * 0.8, d * 0.2, w * 0.85, 0),
  ],
  coop: (w, d) => [
    rect(0, 0, w * 0.45, d),
    line(0, d / 2, w * 0.45, d / 2),
    rect(w * 0.45, 0, w * 0.55, d, 0, true),
    ...dividers(w * 0.45, w, 4).map((x) => line(x, 0, x, d, true)),
  ],

  // Vehicles & garage
  car: (w, d) => [
    rect(w * 0.06, 0, w * 0.88, d, min(w, d) * 0.22),
    path(
      `M${w * 0.12},${d * 0.3} Q${w / 2},${d * 0.22} ${w * 0.88},${d * 0.3}`,
    ),
    path(
      `M${w * 0.14},${d * 0.82} Q${w / 2},${d * 0.88} ${w * 0.86},${d * 0.82}`,
    ),
    line(w * 0.12, d * 0.3, w * 0.14, d * 0.82),
    line(w * 0.88, d * 0.3, w * 0.86, d * 0.82),
    rect(0, d * 0.3, w * 0.06, d * 0.05, 1),
    rect(w * 0.94, d * 0.3, w * 0.06, d * 0.05, 1),
  ],
  motorcycle: (w, d) => [
    ell(w / 2, d / 2, w * 0.18, d / 2),
    line(0, d * 0.22, w, d * 0.22),
    rect(w * 0.4, d * 0.45, w * 0.2, d * 0.22, 3),
  ],
  bicycle: (w, d) => [
    rect(w * 0.45, 0, w * 0.1, d * 0.3, 1),
    rect(w * 0.45, d * 0.7, w * 0.1, d * 0.3, 1),
    line(w / 2, d * 0.3, w / 2, d * 0.7),
    line(0, d * 0.12, w, d * 0.12),
    rect(w * 0.42, d * 0.62, w * 0.16, d * 0.06, 2),
  ],
  scooter: (w, d) => [
    rect(w * 0.3, d * 0.1, w * 0.4, d * 0.8, 3),
    line(0, d * 0.05, w, d * 0.05),
  ],
  boat: (w, d) => [
    path(
      `M0,${d / 2} Q${w * 0.25},0 ${w},${d * 0.35} L${w},${d * 0.65} Q${w * 0.25},${d} 0,${d / 2} Z`,
    ),
    ell(w * 0.5, d / 2, w * 0.12, d * 0.2),
  ],
  workbench: (w, d, o) => {
    const out = [
      rect(0, 0, w, d),
      line(0, d - 4, w, d - 4),
      rect(w - 22, d - 10, 18, 14, 1),
    ];
    if (flag(o, "pegboard")) out.push(line(0, -6, w, -6, true));
    return out;
  },
  tableSaw: (w, d) => [
    rect(0, 0, w, d, 1),
    rect(w / 2 - 1, d * 0.3, 2, d * 0.3),
    line(w * 0.7, 0, w * 0.7, d),
    rect(-w * 0.25, 0, w * 0.25, d, 0, true),
  ],
  miterSaw: (w, d) => [
    rect(0, 0, w, d, 2),
    circ(w / 2, d * 0.45, min(w, d) * 0.3),
    line(0, d * 0.75, w, d * 0.75),
  ],
  drillPress: (w, d) => [
    rect(0, 0, w, d, 2),
    circ(w / 2, d * 0.6, min(w, d) * 0.25),
    rect(w * 0.3, 0, w * 0.4, d * 0.3, 2),
  ],
  compressor: (w, d) => [
    ell(w / 2, d * 0.6, w / 2, d * 0.4),
    rect(w * 0.25, 0, w * 0.5, d * 0.3, 2),
    circ(w * 0.2, d * 0.15, min(w, d) * 0.1),
  ],
  generator: (w, d) => [
    rect(0, 0, w, d, 3),
    rect(4, 4, w - 8, d - 8, 2),
    circ(w * 0.3, d / 2, min(w, d) * 0.22),
    line(w * 0.6, d * 0.3, w * 0.9, d * 0.3),
  ],

  // Fitness & hobby
  treadmill: (w, d) => [
    rect(0, 0, w, d, 4),
    rect(w * 0.15, d * 0.18, w * 0.7, d * 0.78, 2),
    rect(0, 0, w, d * 0.12, 2),
  ],
  elliptical: (w, d) => [
    rect(0, 0, w, d, w / 2),
    ell(w * 0.3, d * 0.55, w * 0.12, d * 0.18),
    ell(w * 0.7, d * 0.55, w * 0.12, d * 0.18),
    rect(w * 0.2, 0, w * 0.6, d * 0.12, 2),
  ],
  exerciseBike: (w, d) => [
    ell(w / 2, d / 2, w * 0.3, d / 2),
    rect(w * 0.35, d * 0.55, w * 0.3, d * 0.15, 3),
    line(0, d * 0.12, w, d * 0.12),
  ],
  rower: (w, d) => [
    rect(w * 0.35, 0, w * 0.3, d, 3),
    rect(w * 0.25, d * 0.55, w * 0.5, d * 0.12, 3),
    rect(0, 0, w, d * 0.15, 4),
    line(w * 0.1, d * 0.2, w * 0.9, d * 0.2),
  ],
  powerRack: (w, d) => [
    rect(0, 0, w, d),
    ...(
      [
        [0, 0],
        [w - 8, 0],
        [0, d - 8],
        [w - 8, d - 8],
      ] as Pt[]
    ).map(([x, y]) => rect(x, y, 8, 8)),
    line(-10, d / 2, w + 10, d / 2),
    rect(-14, d / 2 - 12, 4, 24),
    rect(w + 10, d / 2 - 12, 4, 24),
  ],
  weightBench: (w, d) => [
    rect(w * 0.3, 0, w * 0.4, d, 4),
    line(0, d * 0.18, w, d * 0.18),
    rect(0, d * 0.18 - 10, 5, 20),
    rect(w - 5, d * 0.18 - 10, 5, 20),
  ],
  dumbbellRack: (w, d) => {
    const out = [rect(0, 0, w, d, 2)];
    for (const x of centres(0, w, max(3, Math.round(w / 18))))
      out.push(
        circ(x, d * 0.3, 4),
        circ(x, d * 0.7, 4),
        line(x, d * 0.3, x, d * 0.7),
      );
    return out;
  },
  poolTable: (w, d) => [
    rect(0, 0, w, d, 4),
    rect(10, 10, w - 20, d - 20),
    ...(
      [
        [10, 10],
        [w / 2, 8],
        [w - 10, 10],
        [10, d - 10],
        [w / 2, d - 8],
        [w - 10, d - 10],
      ] as Pt[]
    ).map(([x, y]) => circ(x, y, 4)),
  ],
  pingPong: (w, d) => [
    rect(0, 0, w, d),
    line(w / 2, -6, w / 2, d + 6),
    line(0, d / 2, w, d / 2),
  ],
  foosball: (w, d) => {
    const out = [rect(0, d * 0.15, w, d * 0.7, 2)];
    for (const x of dividers(0, w, 8))
      out.push(line(x, 0, x, d), rect(x - 2, d * 0.45, 4, d * 0.1));
    return out;
  },
  airHockey: (w, d) => [
    rect(0, 0, w, d, 8),
    line(w / 2, 0, w / 2, d),
    circ(w / 2, d / 2, min(w, d) * 0.15),
    rect(0, d * 0.35, 3, d * 0.3),
    rect(w - 3, d * 0.35, 3, d * 0.3),
  ],
  arcade: (w, d) => [
    rect(0, 0, w, d, 2),
    rect(w * 0.1, d * 0.1, w * 0.8, d * 0.45, 2),
    line(0, d * 0.7, w, d * 0.7),
    circ(w * 0.3, d * 0.82, 3),
    circ(w * 0.6, d * 0.82, 2),
    circ(w * 0.72, d * 0.82, 2),
  ],
  piano: (w, d, o) => {
    if (flag(o, "grand")) {
      return [
        path(
          `M0,0 L${w * 0.45},0 C${w * 0.75},0 ${w * 0.65},${d * 0.45} ${w},${d * 0.65} L${w},${d} L0,${d} Z`,
        ),
        rect(0, d * 0.82, w, d * 0.18),
        ...dividers(0, w, Math.round(w / 3.5)).map((x) =>
          line(x, d * 0.82, x, d),
        ),
      ];
    }
    const kd = min(16, d * 0.3);
    const out = [rect(0, 0, w, d), rect(w * 0.04, d - kd, w * 0.92, kd)];
    for (const x of dividers(w * 0.04, w * 0.96, Math.round(w / 3.5)))
      out.push(line(x, d - kd, x, d));
    return out;
  },
  drumKit: (w, d) => [
    ell(w / 2, d * 0.55, w * 0.18, d * 0.2),
    circ(w * 0.33, d * 0.25, min(w, d) * 0.1),
    circ(w * 0.62, d * 0.22, min(w, d) * 0.1),
    circ(w * 0.78, d * 0.6, min(w, d) * 0.14),
    circ(w * 0.12, d * 0.3, min(w, d) * 0.16, true),
    circ(w * 0.88, d * 0.2, min(w, d) * 0.16, true),
    circ(w * 0.18, d * 0.68, min(w, d) * 0.11),
    circ(w / 2, d * 0.92, min(w, d) * 0.07),
  ],
  guitar: (w, d) => [
    circ(w / 2, d * 0.78, min(w, d * 0.45) * 0.5),
    circ(w / 2, d * 0.52, min(w, d * 0.35) * 0.38),
    rect(w * 0.45, 0, w * 0.1, d * 0.45),
    circ(w / 2, d * 0.7, 3),
  ],
  easel: (w, d) => [
    line(w * 0.1, d, w / 2, 0),
    line(w * 0.9, d, w / 2, 0),
    line(w / 2, 0, w / 2, d * 0.6),
    rect(w * 0.15, d * 0.2, w * 0.7, 3),
  ],
  mat: (w, d) => [
    rect(0, 0, w, d, 3),
    path(`M${w - 10},0 Q${w},${d / 2} ${w - 10},${d}`),
  ],
  bag: (w, d) => [
    circ(w / 2, d / 2, min(w, d) / 2),
    circ(w / 2, d / 2, min(w, d) * 0.3),
  ],

  // Pets & kids
  petBed: (w, d) => [
    ell(w / 2, d / 2, w / 2, d / 2),
    ell(w / 2, d * 0.55, w * 0.36, d * 0.33),
  ],
  // Elevated cot: a tube frame with a foot at each corner, the mesh
  // stretched inside it with its stitched, chamfered panel.
  petCot: (w, d) => {
    const s = min(w, d);
    const t = s * 0.07;
    const c = s * 0.16;
    const i = t * 2.2;
    return [
      rect(0, 0, w, d, t),
      rect(t, t, w - 2 * t, d - 2 * t, t * 0.4),
      poly(
        [
          [i + c, i],
          [w - i - c, i],
          [w - i, i + c],
          [w - i, d - i - c],
          [w - i - c, d - i],
          [i + c, d - i],
          [i, d - i - c],
          [i, i + c],
        ],
        true,
        true,
      ),
      ...[
        [t * 0.5, t * 0.5],
        [w - t * 0.5, t * 0.5],
        [w - t * 0.5, d - t * 0.5],
        [t * 0.5, d - t * 0.5],
      ].map(([x, y]) => circ(x ?? 0, y ?? 0, t * 0.75)),
    ];
  },
  // Bolsters round the back and sides, open at the front.
  petBolster: (w, d) => {
    const b = min(w, d) * 0.2;
    return [
      rect(0, 0, w, d, b * 0.9),
      rect(b, b, w - 2 * b, d - b - 2, b * 0.5),
      line(b * 0.4, d - 1, b, d - 1),
      line(w - b, d - 1, w - b * 0.4, d - 1),
    ];
  },
  // Flat orthopedic mattress: a stitched border and a few tufts.
  petMattress: (w, d) => {
    const m = min(w, d) * 0.09;
    return [
      rect(0, 0, w, d, m),
      rect(m, m, w - 2 * m, d - 2 * m, m * 0.6, true),
      ...[0.3, 0.7].flatMap((fy) =>
        [0.25, 0.5, 0.75].map((fx) => circ(w * fx, d * fy, m * 0.3)),
      ),
    ];
  },
  // Round donut bed: a deep bolster ring round a sunken cushion.
  petDonut: (w, d) => [
    ell(w / 2, d / 2, w / 2, d / 2),
    ell(w / 2, d / 2, w * 0.31, d * 0.31),
    ell(w / 2, d / 2, w * 0.41, d * 0.41, undefined, true),
  ],
  // Hooded cave bed: the roof seen from above, the opening at the front.
  petCave: (w, d) => [
    path(
      `M${w * 0.12},${d} C${-w * 0.04},${d * 0.55} ${w * 0.15},0 ${w / 2},0 C${w * 0.85},0 ${w * 1.04},${d * 0.55} ${w * 0.88},${d} Z`,
    ),
    path(`M${w * 0.28},${d} Q${w / 2},${d * 0.52} ${w * 0.72},${d}`),
    path(
      `M${w * 0.22},${d * 0.72} C${w * 0.18},${d * 0.3} ${w * 0.35},${d * 0.12} ${w / 2},${d * 0.12} C${w * 0.65},${d * 0.12} ${w * 0.82},${d * 0.3} ${w * 0.78},${d * 0.72}`,
      true,
    ),
  ],
  // Basic shapes: the same soft corners and line weight as the items.
  shapeRect: (w, d, o) => [
    o["corners"]
      ? shapePoly(w, d, shapeCornerFractions("shapeRect", o), o)
      : rect(0, 0, w, d),
  ],
  shapeEllipse: (w, d) => [ell(w / 2, d / 2, w / 2, d / 2)],
  shapeTriangle: (w, d, o) => [
    shapePoly(w, d, shapeCornerFractions("shapeTriangle", o), o),
  ],
  shapeRightTriangle: (w, d, o) => [
    shapePoly(w, d, shapeCornerFractions("shapeRightTriangle", o), o),
  ],
  shapeDiamond: (w, d, o) => [
    shapePoly(w, d, shapeCornerFractions("shapeDiamond", o), o),
  ],
  shapePolygon: (w, d, o) => [
    shapePoly(w, d, shapeCornerFractions("shapePolygon", o), o),
  ],
  shapeStar: (w, d, o) => [
    shapePoly(w, d, shapeCornerFractions("shapeStar", o), o),
  ],
  shapeL: (w, d, o) => [shapePoly(w, d, shapeCornerFractions("shapeL", o), o)],
  shapeU: (w, d, o) => [shapePoly(w, d, shapeCornerFractions("shapeU", o), o)],
  shapePlus: (w, d, o) => [
    shapePoly(w, d, shapeCornerFractions("shapePlus", o), o),
  ],
  shapeArrow: (w, d, o) => [
    shapePoly(w, d, shapeCornerFractions("shapeArrow", o), o),
  ],
  shapeSemicircle: (w, d) => [path(`M0,${d} A${w / 2},${d} 0 0 1 ${w},${d} Z`)],
  shapeQuarter: (w, d) => [path(`M0,0 A${w},${d} 0 0 1 ${w},${d} L0,${d} Z`)],
  shapeLine: (w, d) => [line(0, d / 2, w, d / 2)],
  shapeDashedLine: (w, d) => [line(0, d / 2, w, d / 2, true)],
  shapeFreeform: (w, d, o) => [
    shapePoly(w, d, shapeCornerFractions("shapeFreeform", o), o),
  ],
  art: (w, d, o) => [
    { t: "art", name: typeof o["art"] === "string" ? o["art"] : "", w, d },
  ],
  custom: (w, d, o) => [
    {
      t: "image",
      id: typeof o["custom"] === "string" ? o["custom"] : "",
      w,
      d,
    },
  ],
  catTree: (w, d) => [
    rect(0, 0, w, d, 2),
    circ(w * 0.35, d * 0.35, min(w, d) * 0.28, true),
    circ(w * 0.68, d * 0.65, min(w, d) * 0.25, true),
    circ(w * 0.35, d * 0.35, 4),
    circ(w * 0.68, d * 0.65, 4),
  ],
  crate: (w, d) => {
    const out = [rect(0, 0, w, d, 2)];
    for (const x of dividers(0, w, Math.round(w / 8)))
      out.push(line(x, 0, x, d));
    out.push(rect(w * 0.3, d - 3, w * 0.4, 3));
    return out;
  },
  bowls: (w, d) => [
    rect(0, 0, w, d, d / 2),
    circ(w * 0.28, d / 2, d * 0.35),
    circ(w * 0.72, d / 2, d * 0.35),
  ],
  aquarium: (w, d) => [
    rect(0, 0, w, d, 1),
    rect(3, 3, w - 6, d - 6, 0, true),
    path(
      `M5,${d / 2} Q${w * 0.25},${d * 0.3} ${w / 2},${d / 2} T${w - 5},${d / 2}`,
    ),
  ],
  cage: (w, d, o) => {
    if (flag(o, "round"))
      return [
        circ(w / 2, d / 2, min(w, d) / 2),
        ...[0, 1, 2, 3, 4, 5].map((i) =>
          line(
            w / 2,
            d / 2,
            w / 2 + (Math.cos((i * Math.PI) / 3) * min(w, d)) / 2,
            d / 2 + (Math.sin((i * Math.PI) / 3) * min(w, d)) / 2,
          ),
        ),
      ];
    const out = [rect(0, 0, w, d, 2)];
    for (const x of dividers(0, w, Math.round(w / 6)))
      out.push(line(x, 0, x, d));
    return out;
  },
  playpen: (w, d) => {
    const out = [rect(0, 0, w, d, 3), rect(5, 5, w - 10, d - 10, 2, true)];
    for (let x = 10; x < w - 5; x += 10)
      out.push(line(x, 0, x, 5), line(x, d - 5, x, d));
    return out;
  },
  changingTable: (w, d) => [
    rect(0, 0, w, d),
    rect(w * 0.08, d * 0.12, w * 0.84, d * 0.76, 8),
    line(w * 0.3, d * 0.12, w * 0.3, d * 0.88),
  ],
  highChair: (w, d) => [
    rect(w * 0.15, d * 0.25, w * 0.7, d * 0.6, 4),
    path(
      `M${w * 0.1},${d * 0.25} Q${w / 2},${-d * 0.05} ${w * 0.9},${d * 0.25}`,
    ),
    ...(
      [
        [0, d],
        [w, d],
        [0, 0],
        [w, 0],
      ] as Pt[]
    ).map(([x, y]) => circ(x, y, 2)),
  ],
  teepee: (w, d) => {
    const pts: Pt[] = Array.from({ length: 6 }, (_, i) => [
      w / 2 + (Math.cos((i * Math.PI) / 3) * w) / 2,
      d / 2 + (Math.sin((i * Math.PI) / 3) * d) / 2,
    ]);
    return [poly(pts), ...pts.map(([x, y]) => line(w / 2, d / 2, x, y))];
  },
  ballPit: (w, d, o) => {
    const out = [
      flag(o, "round") ? ell(w / 2, d / 2, w / 2, d / 2) : rect(0, 0, w, d, 6),
    ];
    for (const x of centres(w * 0.15, w * 0.85, 5))
      for (const y of centres(d * 0.15, d * 0.85, 4))
        out.push(circ(x + ((y * 7) % 5), y, 3.5));
    return out;
  },
  stroller: (w, d) => [
    rect(w * 0.1, d * 0.12, w * 0.8, d * 0.65, 8),
    line(0, d * 0.02, w, d * 0.02),
    ...(
      [
        [w * 0.05, d * 0.8],
        [w * 0.95, d * 0.8],
        [w * 0.05, d * 0.12],
        [w * 0.95, d * 0.12],
      ] as Pt[]
    ).map(([x, y]) => rect(x - 2, y, 4, 12, 1)),
  ],
  dollhouse: (w, d) => [
    rect(0, 0, w, d),
    line(0, d * 0.3, w, d * 0.3),
    line(w / 2, d * 0.3, w / 2, d),
    line(0, d * 0.65, w, d * 0.65),
  ],
  playKitchen: (w, d) => [
    rect(0, 0, w, d),
    circ(w * 0.2, d * 0.45, 6),
    circ(w * 0.38, d * 0.45, 6),
    rect(w * 0.55, d * 0.2, w * 0.35, d * 0.55, 4),
  ],
  toyBox: (w, d) => [
    rect(0, 0, w, d, 3),
    line(0, d * 0.2, w, d * 0.2),
    circ(w / 2, d * 0.6, min(w, d) * 0.12),
  ],
};

function offset(p: Prim, dx: number, dy: number): Prim {
  switch (p.t) {
    case "rect":
      return { ...p, x: p.x + dx, y: p.y + dy };
    case "ellipse":
      return { ...p, cx: p.cx + dx, cy: p.cy + dy };
    case "line":
      return {
        ...p,
        x1: p.x1 + dx,
        y1: p.y1 + dy,
        x2: p.x2 + dx,
        y2: p.y2 + dy,
      };
    case "poly":
      return { ...p, points: p.points.map(([x, y]): Pt => [x + dx, y + dy]) };
    case "path":
    case "icon":
    case "image":
    case "art":
      return p; // only used for leaf ellipses (see planter)
  }
}

export const TEMPLATE_NAMES = Object.keys(T);

export function hasTemplate(name: string): boolean {
  return name in T;
}

/** The drawing for one item at its real size. Unknown templates fall back
 * to a crossed box so a bad catalog entry is visible, not invisible. */
export function drawItem(
  template: string,
  w: number,
  d: number,
  opts: Opts = {},
): Prim[] {
  const fn = T[template] ?? T["box"]!;
  return fn(w, d, template in T ? opts : { x: true });
}

/** The corner softening every drawn box gets (see renderPrims' rect):
 * 22% of the shorter side, at most 6 cm. */
export function softRadius(w: number, d: number): number {
  return Math.min(Math.min(w, d) * 0.22, 6);
}

/** A path through `points` with each corner rounded by up to `r` (never
 * more than half of either side meeting there) — shapes and free-form
 * outlines get the same soft corners as the boxes. */
/** The same soft-cornered outline as roundedPolyPath, as points: each
 * corner's curve sampled in `seg` steps. */
export function roundedPolyPoints(
  points: Pt[],
  closed: boolean,
  r: number | number[],
  seg = 8,
): Pt[] {
  const n = points.length;
  if (n < 3 && closed) return points;
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const p = points[i]!;
    if (!closed && (i === 0 || i === n - 1)) {
      out.push(p);
      continue;
    }
    const a = points[(i - 1 + n) % n]!;
    const b = points[(i + 1) % n]!;
    const la = Math.hypot(a[0] - p[0], a[1] - p[1]) || 1;
    const lb = Math.hypot(b[0] - p[0], b[1] - p[1]) || 1;
    const ri = typeof r === "number" ? r : (r[i] ?? 0);
    const k = Math.max(0, Math.min(ri, la / 2, lb / 2));
    if (k <= 1e-9) {
      out.push(p);
      continue;
    }
    const inn: Pt = [
      p[0] + ((a[0] - p[0]) / la) * k,
      p[1] + ((a[1] - p[1]) / la) * k,
    ];
    const outP: Pt = [
      p[0] + ((b[0] - p[0]) / lb) * k,
      p[1] + ((b[1] - p[1]) / lb) * k,
    ];
    for (let s = 0; s <= seg; s++) {
      const t = s / seg;
      const u = 1 - t;
      out.push([
        u * u * inn[0] + 2 * u * t * p[0] + t * t * outP[0],
        u * u * inn[1] + 2 * u * t * p[1] + t * t * outP[1],
      ]);
    }
  }
  return out;
}

export function roundedPolyPath(
  points: Pt[],
  closed: boolean,
  r: number | number[],
): string {
  const n = points.length;
  if (n < 2) return "";
  const fmt = (v: number) => Math.round(v * 100) / 100;
  const corner = (i: number) => {
    const p = points[i]!;
    const a = points[(i - 1 + n) % n]!;
    const b = points[(i + 1) % n]!;
    const la = Math.hypot(a[0] - p[0], a[1] - p[1]) || 1;
    const lb = Math.hypot(b[0] - p[0], b[1] - p[1]) || 1;
    const ri = typeof r === "number" ? r : (r[i] ?? 0);
    const k = Math.max(0, Math.min(ri, la / 2, lb / 2));
    return {
      p,
      inn: [p[0] + ((a[0] - p[0]) / la) * k, p[1] + ((a[1] - p[1]) / la) * k],
      out: [p[0] + ((b[0] - p[0]) / lb) * k, p[1] + ((b[1] - p[1]) / lb) * k],
    };
  };
  if (!closed) {
    let d = `M${fmt(points[0]![0])},${fmt(points[0]![1])}`;
    for (let i = 1; i < n - 1; i++) {
      const c = corner(i);
      d += ` L${fmt(c.inn[0]!)},${fmt(c.inn[1]!)} Q${fmt(c.p[0])},${fmt(c.p[1])} ${fmt(c.out[0]!)},${fmt(c.out[1]!)}`;
    }
    d += ` L${fmt(points[n - 1]![0])},${fmt(points[n - 1]![1])}`;
    return d;
  }
  const c0 = corner(0);
  let d = `M${fmt(c0.out[0]!)},${fmt(c0.out[1]!)}`;
  for (let i = 1; i <= n; i++) {
    const c = corner(i % n);
    d += ` L${fmt(c.inn[0]!)},${fmt(c.inn[1]!)} Q${fmt(c.p[0])},${fmt(c.p[1])} ${fmt(c.out[0]!)},${fmt(c.out[1]!)}`;
  }
  return `${d} Z`;
}

/** Each corner's rounding: from the item's own per-corner percentages
 * (opts.corners, "0,50,100…": 0 square, 100 as round as the shorter side
 * allows), else the usual soft corners. */
export function cornerRadii(
  o: Opts,
  w: number,
  d: number,
  n: number,
  fallback: number,
): number | number[] {
  const raw = o["corners"];
  if (typeof raw !== "string" || !raw) return fallback;
  const pcts = raw.split(",").map(Number);
  const full = Math.min(w, d) / 2;
  return Array.from({ length: n }, (_, i) => {
    const pct = pcts[i];
    return pct === undefined || !Number.isFinite(pct)
      ? fallback
      : (Math.max(0, Math.min(100, pct)) / 100) * full;
  });
}

/** A soft-cornered polygon, fitted to w x d from 0–1 fractions. */
const shapePoly = (
  w: number,
  d: number,
  frac: Pt[],
  o: Opts = {},
  closed = true,
): Prim =>
  path(
    roundedPolyPath(
      frac.map(([fx, fy]): Pt => [fx * w, fy * d]),
      closed,
      cornerRadii(o, w, d, frac.length, softRadius(w, d)),
    ),
  );

/** How many corners a drawn shape has, for its per-corner rounding — 0
 * for anything without (circles, arcs, lines, furniture). */
export function shapeCornerCount(
  template: string,
  opts: Opts,
  points?: [number, number][] | null,
): number {
  if (points && points.length >= 2) return points.length;
  return shapeCornerFractions(template, opts).length;
}

/** The usual soft rounding as a percentage, for a corner left unset. */
export function defaultCornerPct(w: number, d: number): number {
  const full = Math.min(w, d) / 2;
  return full > 0 ? Math.round((softRadius(w, d) / full) * 100) : 0;
}

/** n points round an ellipse, the first at the top. */
const ring = (n: number, k = 1, turn = 0): Pt[] =>
  Array.from({ length: n }, (_, i): Pt => {
    const a = -Math.PI / 2 + turn + (i / n) * Math.PI * 2;
    return [0.5 + Math.cos(a) * 0.5 * k, 0.5 + Math.sin(a) * 0.5 * k];
  });

/** The corners of the fixed-outline shapes, as 0–1 fractions of their
 * width and depth, in drawing order — corner 1 is the first. */
const SHAPE_FRACS: Record<string, Pt[]> = {
  shapeRect: [
    [0, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ],
  shapeTriangle: [
    [0.5, 0],
    [1, 1],
    [0, 1],
  ],
  shapeRightTriangle: [
    [0, 0],
    [1, 1],
    [0, 1],
  ],
  shapeDiamond: [
    [0.5, 0],
    [1, 0.5],
    [0.5, 1],
    [0, 0.5],
  ],
  shapeL: [
    [0, 0],
    [0.45, 0],
    [0.45, 0.55],
    [1, 0.55],
    [1, 1],
    [0, 1],
  ],
  shapeU: [
    [0, 0],
    [0.3, 0],
    [0.3, 0.6],
    [0.7, 0.6],
    [0.7, 0],
    [1, 0],
    [1, 1],
    [0, 1],
  ],
  shapePlus: [
    [0.35, 0],
    [0.65, 0],
    [0.65, 0.35],
    [1, 0.35],
    [1, 0.65],
    [0.65, 0.65],
    [0.65, 1],
    [0.35, 1],
    [0.35, 0.65],
    [0, 0.65],
    [0, 0.35],
    [0.35, 0.35],
  ],
  shapeArrow: [
    [0, 0.32],
    [0.68, 0.32],
    [0.68, 0],
    [1, 0.5],
    [0.68, 1],
    [0.68, 0.68],
    [0, 0.68],
  ],
  shapeFreeform: [
    [0.1, 0.2],
    [0.55, 0],
    [1, 0.35],
    [0.8, 1],
    [0.2, 0.85],
  ],
};

/** A shape's corners as 0–1 fractions (empty for one without corners) —
 * what it's drawn from, and where its corner numbers go. */
export function shapeCornerFractions(template: string, opts: Opts): Pt[] {
  if (template === "shapePolygon") return ring(num(opts, "sides", 6));
  if (template === "shapeStar") {
    const n = num(opts, "points", 5);
    const outer = ring(n);
    const inner = ring(n, 0.45, Math.PI / n);
    return outer.flatMap((p, i): Pt[] => [p, inner[i]!]);
  }
  return SHAPE_FRACS[template] ?? [];
}

/** A free-form outline drawn point by point (FurnitureItem.points, 0–1
 * fractions of its size), with the usual soft corners. */
export function freeformPrims(
  points: [number, number][],
  w: number,
  d: number,
  closed: boolean,
  corners?: number[] | null,
): Prim[] {
  if (points.length < 2) return [];
  const pts = points.map(([fx, fy]): Pt => [fx * w, fy * d]);
  const radii = cornerRadii(
    corners?.length ? { corners: corners.join(",") } : {},
    w,
    d,
    pts.length,
    6,
  );
  return [path(roundedPolyPath(pts, closed, radii))];
}

/** Imported icons by id: their image URL and whether they keep their
 * own colours (set from the catalog's setCustomIcons). */
const CUSTOM_IMAGES = new Map<
  string,
  { href: string; colors: boolean; solidHref: string }
>();

/** The icon with every shape filled in: its footprint, for "Solid" — so
 * the opaque fill covers the drawing's own shapes, not its whole box. */
function filledSvg(svgText: string): string {
  const style =
    "<style>rect,circle,ellipse,polygon,path{fill:#000 !important;fill-opacity:1 !important}</style>";
  return svgText.replace(/<svg(?=[\s>])[^>]*>/i, (open) => open + style);
}

export function setCustomImages(icons: CustomIcon[]): void {
  CUSTOM_IMAGES.clear();
  for (const icon of icons) {
    CUSTOM_IMAGES.set(icon.id, {
      href: svgDataUrl(icon.svg),
      colors: icon.colors === true,
      solidHref: svgDataUrl(filledSvg(icon.svg)),
    });
  }
}

/** An imported icon's solid fill, shaped like the icon's own filled shapes
 * (masked by them), or its box when the icon is gone. */
function solidImage(p: { id: string; w: number; d: number }) {
  const w = max(0.01, p.w);
  const h = max(0.01, p.d);
  const img = CUSTOM_IMAGES.get(p.id);
  if (!img)
    return svg`<rect class="fx-solid" x="0" y="0" width=${w} height=${h} rx=${softRadius(w, h)}></rect>`;
  const id = `fx-solid-${p.id}-${Math.round(w * 10)}x${Math.round(h * 10)}`;
  return svg`<mask id=${id} style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width=${w} height=${h}>
      <image href=${img.solidHref} x="0" y="0" width=${w} height=${h} preserveAspectRatio="xMidYMid meet"></image>
    </mask>
    <rect class="fx-solid" x="0" y="0" width=${w} height=${h} mask="url(#${id})"></rect>`;
}

/** SVG for a drawing's primitives. Strokes keep a constant on-screen width
 * at any zoom; `fillFirst` shades the main body (prims[0]). */
export function renderPrims(
  prims: Prim[],
  fillFirst: boolean,
  solid = false,
): SVGTemplateResult[] {
  const out = prims.map((p, i) =>
    renderPrim(
      p,
      `${p.dash ? "fx dash" : "fx"}${fillFirst && i === 0 ? " body" : ""}`,
    ),
  );
  // Solid: opaque copies of the item's closed shapes underneath — the body
  // and every other closed part (a chair's back, a sofa's arms) — so
  // whatever is drawn below the item (chairs tucked under a table) is
  // hidden.
  const body = prims[0];
  if (solid && body) {
    if (body.t === "image") {
      out.unshift(solidImage(body));
    } else if (body.t === "icon") {
      out.unshift(
        svg`<rect class="fx-solid" x="0" y="0" width=${max(0.01, body.w)} height=${max(0.01, body.d)} rx=${softRadius(body.w, body.d)}></rect>`,
      );
    } else {
      out.unshift(
        ...prims.filter(isClosedPrim).map((p) => renderPrim(p, "fx-solid")),
      );
    }
  }
  return out;
}

/** A primitive that encloses an area, so it can be filled. */
function isClosedPrim(p: Prim): boolean {
  switch (p.t) {
    case "rect":
    case "ellipse":
    case "art":
      return true;
    case "poly":
      return p.closed;
    case "path":
      return /z/i.test(p.d);
    default:
      return false;
  }
}

function renderPrim(p: Prim, cls: string): SVGTemplateResult {
  switch (p.t) {
    case "rect": {
      // Friendlier than square: every box gets soft corners (a pill when
      // thin), whatever radius its template asked for at least.
      const w = max(0.01, p.w);
      const h = max(0.01, p.h);
      const rx = max(p.r ?? 0, Math.min(Math.min(w, h) * 0.22, 6));
      return p.rot
        ? svg`<rect class=${cls} x=${p.x} y=${p.y} width=${w} height=${h} rx=${Math.min(rx, Math.min(w, h) / 2)} transform="rotate(${p.rot} ${p.x + w / 2} ${p.y + h / 2})"></rect>`
        : svg`<rect class=${cls} x=${p.x} y=${p.y} width=${w} height=${h} rx=${Math.min(rx, Math.min(w, h) / 2)}></rect>`;
    }
    case "art": {
      const art = ART[p.name];
      if (!art) return svg``;
      return svg`<svg class=${cls.includes("fx-solid") ? "fx-art fx-art-solid" : "fx-art"} x="0" y="0" width=${max(0.01, p.w)} height=${max(0.01, p.d)} viewBox="0 0 ${art.w} ${art.h}" preserveAspectRatio="none" overflow="visible">${unsafeSVG(art.svg)}</svg>`;
    }
    case "icon": {
      const icon = UI_ICONS[p.name];
      if (!icon) return svg``;
      const s = Math.min(p.w, p.d) / 64;
      return svg`<g class="fx-icon" transform="translate(${(p.w - 64 * s) / 2} ${(p.d - 64 * s) / 2}) scale(${s})">${unsafeSVG(icon.svg)}</g>`;
    }
    case "image": {
      const img = CUSTOM_IMAGES.get(p.id);
      const w = max(0.01, p.w);
      const h = max(0.01, p.d);
      // A deleted icon: just its footprint.
      if (!img)
        return svg`<rect class="fx dash" x="0" y="0" width=${w} height=${h}></rect>`;
      if (img.colors)
        return svg`<image href=${img.href} x="0" y="0" width=${w} height=${h} preserveAspectRatio="xMidYMid meet"></image>`;
      // One colour: the drawing's shapes cut a fill in the item's line
      // colour, so it follows the theme and live state like the rest.
      const id = `fx-mask-${p.id}-${Math.round(w * 10)}x${Math.round(h * 10)}`;
      return svg`<mask id=${id} style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width=${w} height=${h}>
          <image href=${img.href} x="0" y="0" width=${w} height=${h} preserveAspectRatio="xMidYMid meet"></image>
        </mask>
        <rect class="fx-tint" x="0" y="0" width=${w} height=${h} mask="url(#${id})"></rect>`;
    }
    case "ellipse":
      return p.rot
        ? svg`<ellipse class=${cls} cx=${p.cx} cy=${p.cy} rx=${max(0.01, p.rx)} ry=${max(0.01, p.ry)} transform="rotate(${p.rot} ${p.cx} ${p.cy})"></ellipse>`
        : svg`<ellipse class=${cls} cx=${p.cx} cy=${p.cy} rx=${max(0.01, p.rx)} ry=${max(0.01, p.ry)}></ellipse>`;
    case "line":
      return svg`<line class=${cls} x1=${p.x1} y1=${p.y1} x2=${p.x2} y2=${p.y2}></line>`;
    case "poly": {
      const pts = p.points.map(([x, y]) => `${x},${y}`).join(" ");
      return p.closed
        ? svg`<polygon class=${cls} points=${pts}></polygon>`
        : svg`<polyline class=${cls} points=${pts}></polyline>`;
    }
    case "path":
      return svg`<path class=${cls} d=${p.d}></path>`;
  }
}

/** Shared CSS for drawn items — `--fx-stroke-width` / `--fx-color` set per
 * item by whoever renders it. */
export const FURNITURE_STYLES = `
  .fx {
    fill: none;
    stroke: var(--fx-color, currentColor);
    stroke-width: var(--fx-stroke-width, 1.5px);
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  .fx.dash { stroke-dasharray: 4 3; }
  .fx-icon {
    fill: none;
    color: var(--fx-color, currentColor);
    stroke: var(--fx-color, currentColor);
    stroke-width: var(--fx-stroke-width, 1.5px);
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .fx-icon * { vector-effect: non-scaling-stroke; }
  .fx.body { fill: var(--fx-color, currentColor); fill-opacity: 0.16; }
  .fx-tint { fill: var(--fx-color, currentColor); stroke: none; }
  .fx-art * {
    fill: none;
    stroke: var(--fx-color, currentColor);
    stroke-width: var(--fx-stroke-width, 1.5px);
    stroke-linecap: round;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  .fx-art .thin { stroke-width: calc(var(--fx-stroke-width, 1.5px) * 0.55); }
  .fx-art .thick { stroke-width: calc(var(--fx-stroke-width, 1.5px) * 1.7); }
  .fx-art .dash { stroke-dasharray: 4 3; }
  .fx-art .dot { fill: var(--fx-color, currentColor); }
  .fx-art-solid * {
    fill: color-mix(in srgb, var(--fx-color, currentColor) 10%, var(--sc-bg, #fff));
    stroke: none;
  }
  .fx-solid {
    fill: color-mix(in srgb, var(--fx-color, currentColor) 10%, var(--sc-bg, #fff));
    stroke: none;
  }
`;
