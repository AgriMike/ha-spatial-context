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

export type Pt = [number, number];

export type Prim =
  | {
      t: "rect";
      x: number;
      y: number;
      w: number;
      h: number;
      r?: number | undefined;
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
  | { t: "path"; d: string; dash?: boolean | undefined };

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
  return [
    poly([at(-h, -h), at(h, -h), at(h, h), at(-h, h)]),
    poly([at(-h, -h + 1), at(-h, h - 1), at(-h - 6, h - 3), at(-h - 6, -h + 3)]),
  ];
}

function crossX(x: number, y: number, w: number, h: number): Prim[] {
  return [line(x, y, x + w, y + h), line(x + w, y, x, y + h)];
}

/** A burner/hob ring. */
function burner(cx: number, cy: number, r: number): Prim[] {
  return [circ(cx, cy, r), circ(cx, cy, r * 0.45)];
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
    if (inner > 0) out.push(ell(w / 2, d / 2, (w / 2) * inner, (d / 2) * inner));
    if (flag(o, "cross"))
      out.push(line(w / 2, 0, w / 2, d), line(0, d / 2, w, d / 2));
    return out;
  },

  // Storage
  cabinet: (w, d, o) => {
    const doors = num(o, "doors", max(1, Math.round(w / 50)));
    const out = [rect(0, 0, w, d, 0, flag(o, "dash")), line(0, d - 3, w, d - 3)];
    for (const x of dividers(0, w, doors - 1)) out.push(line(x, d - 3, x, d));
    if (flag(o, "x")) out.push(...crossX(0, 0, w, d - 3));
    return out;
  },
  drawers: (w, d, o) => {
    const cols = num(o, "cols", max(1, Math.round(w / 60)));
    const out = [rect(0, 0, w, d), line(0, d - 3, w, d - 3)];
    for (const x of dividers(0, w, cols - 1)) out.push(line(x, d - 3, x, d));
    for (const x of centres(0, w, cols))
      out.push(line(x - min(8, w / cols / 4), d - 6, x + min(8, w / cols / 4), d - 6));
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
    if (flag(o, "bunk")) out.push(...crossX(0, 0, w, d).map((p) => ({ ...p, dash: true })));
    if (flag(o, "trundle")) out.push(rect(4, d * 0.15, w - 8, d * 0.8, 0, true));
    return out;
  },
  crib: (w, d) => {
    const out = [rect(0, 0, w, d, 2), rect(4, 4, w - 8, d - 8, 2)];
    for (let x = 8; x < w - 4; x += 8) out.push(line(x, 0, x, 4), line(x, d - 4, x, d));
    return out;
  },
  bassinet: (w, d) => [ell(w / 2, d / 2, w / 2, d / 2), ell(w / 2, d / 2, w / 2 - 5, d / 2 - 5), line(w * 0.2, d * 0.2, w * 0.8, d * 0.2)],

  // Seating
  sofa: (w, d, o) => {
    const seats = num(o, "seats", 3);
    const back = min(24, d * 0.26);
    const arm = flag(o, "noArms") ? 0 : min(18, w * 0.14);
    const out = [rect(0, 0, w, d, 6), line(arm, back, w - arm, back)];
    if (arm > 0) out.push(line(arm, back, arm, d), line(w - arm, back, w - arm, d));
    for (const x of dividers(arm, w - arm, seats - 1)) out.push(line(x, back, x, d - 4));
    if (flag(o, "recliner")) out.push(rect(arm + 4, d, w - 2 * arm - 8, 30, 3, true));
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
    for (const x of dividers(cw, w - 18, seats - 1)) out.push(line(x, back, x, sd - 4));
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
      ? [ell(w / 2, d / 2, w / 2, d / 2), ell(w / 2, d / 2, w / 2 - 6, d / 2 - 6)]
      : [rect(0, 0, w, d, 8), rect(6, 6, w - 12, d - 12, 5)],
  pouf: (w, d) => [
    ell(w / 2, d / 2, w / 2, d / 2),
    ...[0, 1, 2, 3].map((i) =>
      line(w / 2, d / 2, w / 2 + (w / 2) * Math.cos((i * Math.PI) / 2 + 0.4), d / 2 + (d / 2) * Math.sin((i * Math.PI) / 2 + 0.4)),
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
    if (flag(o, "arms")) out.push(line(5, back, 5, d - 4), line(w - 5, back, w - 5, d - 4));
    if (flag(o, "rocker"))
      out.push(path(`M-2,${back} Q-6,${d / 2} -2,${d + 6}`), path(`M${w + 2},${back} Q${w + 6},${d / 2} ${w + 2},${d + 6}`));
    return out;
  },
  officeChair: (w, d) => {
    const cx = w / 2;
    const cy = d * 0.55;
    const r = min(w, d) * 0.3;
    const out = [circ(cx, cy, r), path(`M${cx - r},${cy - r * 0.6} Q${cx},${cy - r * 1.6} ${cx + r},${cy - r * 0.6}`)];
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5 + Math.PI / 5;
      const ex = cx + Math.cos(a) * min(w, d) * 0.47;
      const ey = cy + Math.sin(a) * min(w, d) * 0.45;
      out.push(line(cx, cy, ex, ey), circ(ex, ey, 2.5));
    }
    return out;
  },
  stool: (w, d) => [ell(w / 2, d / 2, w / 2, d / 2), ell(w / 2, d / 2, w * 0.3, d * 0.3)],
  bench: (w, d, o) => {
    const out = [rect(0, 0, w, d, 2)];
    for (const y of dividers(0, d, num(o, "slats", 3))) out.push(line(2, y, w - 2, y));
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
      out.push(...chairAt(cx + Math.cos(a) * r, cy + Math.sin(a) * r, a + Math.PI, 40));
    }
    return out;
  },
  desk: (w, d, o) => {
    const dd = num(o, "desk", d);
    const out: Prim[] = [rect(0, 0, w, dd, 2)];
    if (flag(o, "monitor")) out.push(rect(w / 2 - 28, 6, 56, 3), line(w / 2, 9, w / 2, 16));
    if (flag(o, "drawers")) out.push(rect(w - 45, 2, 42, dd - 4), line(w - 45, dd * 0.5, w - 3, dd * 0.5));
    if (dd < d) out.push(...chairAt(w / 2, dd + (d - dd) / 2, -Math.PI / 2, min(48, d - dd)));
    return out;
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
    if (flag(o, "chair")) out.push(...chairAt(dd + 30, dd + 32, -Math.PI * 0.75, 46));
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
  pedestalTable: (w, d) => [circ(w / 2, d / 2, min(w, d) / 2), circ(w / 2, d / 2, min(w, d) * 0.12, true)],
  console: (w, d) => [rect(0, 0, w, d, 2), line(4, d / 2, w - 4, d / 2, true)],
  tvStand: (w, d) => {
    const out = [rect(0, 0, w, d, 2), line(0, d - 3, w, d - 3)];
    for (const x of dividers(0, w, max(1, Math.round(w / 50)) - 1)) out.push(line(x, d - 3, x, d));
    return out;
  },
  island: (w, d, o) => {
    const seats = num(o, "seats", 0);
    const id = seats > 0 ? d - 45 : d;
    const out: Prim[] = [rect(0, 0, w, id, 2), line(0, 3, w, 3)];
    if (seats > 0) {
      out.push(line(0, id - 25, w, id - 25, true));
      for (const x of centres(0, w, seats)) out.push(circ(x, id + 20, 17), circ(x, id + 20, 9));
    }
    if (flag(o, "sink")) out.push(rect(w / 2 - 35, 8, 70, 40, 4));
    if (flag(o, "hob")) for (const [x, y] of [[w * 0.3, 18], [w * 0.3, 40], [w * 0.42, 18], [w * 0.42, 40]] as Pt[]) out.push(circ(x, y, 7));
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
    for (let i = 0; i < basins; i++) {
      const x = 8 + i * (bw + 6);
      out.push(rect(x, 12, bw, d - 22, 5), circ(x + bw / 2, 12 + (d - 22) * 0.6, 2.5));
    }
    out.push(line(w / 2, 3, w / 2, 10), circ(w / 2, 4, 2));
    if (flag(o, "apron")) out.push(line(0, d - 4, w, d - 4));
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
        out.push(...burner(x, y, min((w - 8) / cols, (d - top - 6) / rows) * 0.34));
      }
    if (flag(o, "griddle")) out.push(rect(w * 0.38, top + 4, w * 0.24, d - top - 14, 2));
    return out;
  },
  fridge: (w, d, o) => {
    const doors = num(o, "doors", 1);
    const out = [rect(0, 0, w, d, 1), line(0, d - 5, w, d - 5)];
    if (doors >= 2) out.push(line(w / 2, d - 5, w / 2, d));
    if (doors >= 2) out.push(line(w / 2 - 4, d - 9, w / 2 - 4, d - 5), line(w / 2 + 4, d - 9, w / 2 + 4, d - 5));
    else out.push(line(w - 6, d - 9, w - 6, d - 5));
    if (flag(o, "x")) out.push(...crossX(0, 0, w, d - 5));
    return out;
  },
  dishwasher: (w, d) => [rect(0, 0, w, d), line(0, d - 3, w, d - 3), ...crossX(0, 0, w, d - 3)],
  appliance: (w, d, o) => {
    const out = [rect(0, 0, w, d, num(o, "r", 2))];
    if (flag(o, "window")) out.push(rect(w * 0.08, d * 0.25, w * 0.6, d * 0.6, 2), line(w * 0.78, d * 0.3, w * 0.78, d * 0.8));
    if (flag(o, "slots")) out.push(rect(w * 0.2, d * 0.2, w * 0.25, d * 0.6, 1), rect(w * 0.55, d * 0.2, w * 0.25, d * 0.6, 1));
    if (flag(o, "jug")) out.push(circ(w * 0.55, d * 0.55, min(w, d) * 0.3), line(w * 0.15, d * 0.55, w * 0.27, d * 0.55));
    if (flag(o, "bowl")) out.push(circ(w * 0.45, d * 0.6, min(w, d) * 0.3), rect(w * 0.7, 0, w * 0.3, d * 0.9, 3));
    if (flag(o, "dial")) out.push(circ(w * 0.5, d * 0.5, min(w, d) * 0.25));
    return out;
  },
  hood: (w, d) => [rect(0, 0, w, d, 0, true), poly([[w * 0.35, 0], [w * 0.65, 0], [w * 0.8, d], [w * 0.2, d]], true, true)],
  trash: (w, d, o) =>
    flag(o, "round")
      ? [ell(w / 2, d / 2, w / 2, d / 2), ell(w / 2, d / 2, w / 2 - 3, d / 2 - 3), line(w * 0.3, d * 0.2, w * 0.7, d * 0.2)]
      : [rect(0, 0, w, d, 3), line(0, d * 0.2, w, d * 0.2), line(w * 0.35, d * 0.6, w * 0.65, d * 0.6)],
  cart: (w, d) => [rect(0, 0, w, d, 2), rect(4, 4, w - 8, d - 8, 1), circ(4, 4, 2.5), circ(w - 4, 4, 2.5), circ(4, d - 4, 2.5), circ(w - 4, d - 4, 2.5)],

  // Bathroom
  toilet: (w, d, o) => {
    const tank = flag(o, "wallHung") ? d * 0.12 : d * 0.3;
    return [
      rect(w * 0.08, 0, w * 0.84, tank, 3),
      ell(w / 2, tank + (d - tank) / 2, w * 0.42, (d - tank) / 2),
      ell(w / 2, tank + (d - tank) * 0.52, w * 0.28, (d - tank) * 0.36),
    ];
  },
  bidet: (w, d) => [rect(w * 0.15, 0, w * 0.7, d * 0.15, 2), ell(w / 2, d * 0.15 + d * 0.425, w * 0.45, d * 0.425), ell(w / 2, d * 0.55, w * 0.25, d * 0.25), circ(w / 2, d * 0.2, 2)],
  urinal: (w, d) => [path(`M0,0 L${w},0 L${w},${d * 0.3} Q${w},${d} ${w / 2},${d} Q0,${d} 0,${d * 0.3} Z`), ell(w / 2, d * 0.45, w * 0.28, d * 0.3)],
  vanity: (w, d, o) => {
    const basins = num(o, "basins", 1);
    const out = [rect(0, 0, w, d), line(0, d - 3, w, d - 3)];
    for (const x of centres(0, w, basins)) out.push(ell(x, d * 0.5, min(22, w / basins / 2 - 5), d * 0.28), circ(x, d * 0.18, 2));
    return out;
  },
  pedestalSink: (w, d) => [path(`M0,0 L${w},0 L${w},${d * 0.3} Q${w},${d} ${w / 2},${d} Q0,${d} 0,${d * 0.3} Z`), ell(w / 2, d * 0.45, w * 0.32, d * 0.28), circ(w / 2, d * 0.12, 2)],
  bathtub: (w, d, o) => {
    const out = [rect(0, 0, w, d, flag(o, "free") ? d / 2 : 2)];
    out.push(rect(8, 8, w - 16, d - 16, min(d / 2 - 8, 26)));
    out.push(circ(flag(o, "free") ? w / 2 : 20, d / 2, 3));
    if (flag(o, "claw")) for (const [x, y] of [[d / 2, 2], [w - d / 2, 2], [d / 2, d - 2], [w - d / 2, d - 2]] as Pt[]) out.push(circ(x, y, 3));
    if (flag(o, "jets")) for (const x of [w * 0.3, w * 0.5, w * 0.7]) out.push(circ(x, 12, 2), circ(x, d - 12, 2));
    return out;
  },
  cornerTub: (w, d) => [
    path(`M0,0 L${w},0 L${w},${d * 0.35} A${w * 0.65},${d * 0.65} 0 0 1 ${w * 0.35},${d} L0,${d} Z`),
    path(`M8,8 L${w - 8},8 L${w - 8},${d * 0.35} A${w * 0.6},${d * 0.6} 0 0 1 ${w * 0.35},${d - 8} L8,${d - 8} Z`),
    circ(w * 0.3, d * 0.3, 3),
  ],
  shower: (w, d, o) => {
    const out = [rect(0, 0, w, d), ...crossX(0, 0, w, d), circ(w / 2, d / 2, 3)];
    if (flag(o, "walkIn")) out.push(line(w, d * 0.4, w, d, true));
    return out;
  },
  neoAngleShower: (w, d) => [
    poly([[0, 0], [w, 0], [w, d * 0.6], [w * 0.6, d], [0, d]]),
    line(0, 0, w * 0.8, d * 0.8),
    circ(w * 0.45, d * 0.45, 3),
  ],
  hotTub: (w, d) => [rect(0, 0, w, d, 20), rect(14, 14, w - 28, d - 28, 14), ...[0, 1, 2, 3].map((i) => circ(i % 2 ? w - 22 : 22, i < 2 ? 22 : d - 22, 4))],
  towelRail: (w, d) => [rect(0, 0, w, d, 1), ...dividers(0, w, 4).map((x) => line(x, 0, x, d))],

  // Laundry & utility
  washer: (w, d, o) => {
    const out = [rect(0, 0, w, d, 2), line(0, 10, w, 10), circ(w / 2, (d + 10) / 2, min(w, d - 10) * 0.33)];
    if (flag(o, "dryer")) out.push(circ(w / 2, (d + 10) / 2, min(w, d - 10) * 0.22, true));
    if (flag(o, "stack")) out.push(...crossX(0, 10, w, d - 10).map((p) => ({ ...p, dash: true })));
    if (flag(o, "top")) out.push(rect(w * 0.15, 14, w * 0.7, d - 20, 3));
    return out;
  },
  waterHeater: (w, d, o) =>
    flag(o, "tankless")
      ? [rect(0, 0, w, d, 2), rect(w * 0.2, d * 0.25, w * 0.6, d * 0.5, 2), line(w * 0.3, d, w * 0.3, d + 0.01)]
      : [circ(w / 2, d / 2, min(w, d) / 2), circ(w / 2, d / 2, min(w, d) * 0.35), rect(w * 0.42, -2, w * 0.16, 6), line(w / 2, d / 2, w * 0.85, d * 0.15)],
  furnace: (w, d) => [rect(0, 0, w, d), ...dividers(0, w, 3).map((x) => line(x, 4, x, d - 4)), line(0, d - 4, w, d - 4)],
  condenser: (w, d) => {
    const r = min(w, d) * 0.4;
    const out = [rect(0, 0, w, d, 2), circ(w / 2, d / 2, r), circ(w / 2, d / 2, r * 0.18)];
    for (let i = 0; i < 4; i++) out.push(ell(w / 2 + Math.cos(i * Math.PI / 2 + 0.4) * r * 0.55, d / 2 + Math.sin(i * Math.PI / 2 + 0.4) * r * 0.55, r * 0.35, r * 0.15, (i * 90 + 23)));
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
    const out = [rect(0, 0, w, body), poly([[w * 0.2, body * 0.25], [w * 0.8, body * 0.25], [w * 0.9, body], [w * 0.1, body]])];
    if (hearth) out.push(rect(-0.01, body, w, hearth, 0, true));
    return out;
  },
  stove: (w, d) => [circ(w / 2, d / 2, min(w, d) / 2), rect(w * 0.3, d * 0.55, w * 0.4, d * 0.3, 2), circ(w / 2, d * 0.15, min(w, d) * 0.08)],
  electricalPanel: (w, d) => {
    const out = [rect(0, 0, w, d), rect(3, 1, w - 6, d - 2)];
    for (const x of dividers(3, w - 3, max(2, Math.round(w / 6)))) out.push(line(x, 1, x, d - 1));
    return out;
  },
  tank: (w, d, o) => {
    const n = num(o, "tanks", 1);
    const out: Prim[] = [rect(0, 0, w, d, 0, true)];
    for (const x of centres(0, w, n)) out.push(circ(x, d / 2, min(w / n, d) * 0.45));
    if (flag(o, "brine")) out.push(rect(w * 0.55, d * 0.1, w * 0.4, d * 0.8, 3));
    return out;
  },
  ladder: (w, d) => {
    const out = [line(0, 0, 0, d), line(w, 0, w, d)];
    for (let y = 25; y < d; y += 28) out.push(line(0, y, w, y));
    out.unshift(rect(0, 0, w, d, 0, true));
    return out;
  },
  ironingBoard: (w, d) => [path(`M0,${d * 0.1} L${w * 0.75},${d * 0.1} Q${w},${d * 0.5} ${w * 0.75},${d * 0.9} L0,${d * 0.9} Z`), line(w * 0.1, d / 2, w * 0.6, d / 2, true)],
  rack: (w, d, o) => {
    const out = [rect(0, 0, w, d, 1)];
    for (const y of dividers(0, d, num(o, "rails", 4))) out.push(line(0, y, w, y));
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
  soundbar: (w, d) => [rect(0, 0, w, d, d / 2), ...centres(4, w - 4, max(3, Math.round(w / 12))).map((x) => circ(x, d / 2, 1))],
  device: (w, d, o) => {
    const out = [rect(0, 0, w, d, num(o, "r", 2))];
    for (const x of centres(0, w, num(o, "antennas", 0))) out.push(line(x, 0, x, -min(12, d)));
    const leds = num(o, "leds", 0);
    for (const x of centres(w * 0.2, w * 0.8, leds)) out.push(circ(x, d - 2.5, 0.8));
    if (flag(o, "screen")) out.push(rect(w * 0.1, d * 0.15, w * 0.8, d * 0.6, 1));
    if (flag(o, "lens")) out.push(circ(w / 2, d * 0.7, min(w, d) * 0.22));
    if (flag(o, "button")) out.push(circ(w / 2, d * 0.65, min(w, d) * 0.25));
    if (flag(o, "fan")) out.push(circ(w / 2, d / 2, min(w, d) * 0.3));
    if (flag(o, "rackUnits")) for (const y of dividers(0, d, max(2, Math.round(d / 8)))) out.push(line(2, y, w - 2, y));
    if (flag(o, "x")) out.push(...crossX(0, 0, w, d));
    return out;
  },
  puck: (w, d, o) => {
    const out = [ell(w / 2, d / 2, w / 2, d / 2), ell(w / 2, d / 2, w * 0.3, d * 0.3)];
    if (flag(o, "dot")) out.push(circ(w / 2, d / 2, min(w, d) * 0.06));
    if (flag(o, "dash")) out[0] = ell(w / 2, d / 2, w / 2, d / 2, undefined, true);
    return out;
  },
  laptop: (w, d) => [rect(0, d * 0.1, w, d * 0.9, 2), rect(0, 0, w, d * 0.1, 1), rect(w * 0.1, d * 0.22, w * 0.8, d * 0.4, 1), rect(w * 0.35, d * 0.7, w * 0.3, d * 0.2, 1)],
  monitor: (w, d) => [rect(0, 0, w, min(4, d), 1), rect(w * 0.38, min(4, d), w * 0.24, d - min(4, d), 2), line(w / 2, min(4, d), w / 2, d * 0.5)],
  printer: (w, d) => [rect(0, d * 0.15, w, d * 0.85, 3), rect(w * 0.2, 0, w * 0.6, d * 0.15, 1), line(w * 0.2, d * 0.8, w * 0.8, d * 0.8)],
  projector: (w, d) => [rect(0, 0, w, d, 3), circ(w * 0.7, d - 4, min(w, d) * 0.15), line(w * 0.15, d * 0.3, w * 0.45, d * 0.3)],
  ceilingFan: (w, d, o) => {
    const blades = num(o, "blades", 4);
    const r = min(w, d) / 2;
    const out: Prim[] = [circ(w / 2, d / 2, r * 0.14)];
    for (let i = 0; i < blades; i++) {
      const a = (i / blades) * 360;
      const rad = (a * Math.PI) / 180;
      out.push(ell(w / 2 + Math.cos(rad) * r * 0.57, d / 2 + Math.sin(rad) * r * 0.57, r * 0.43, r * 0.11, a));
    }
    out.push(circ(w / 2, d / 2, r, true));
    return out;
  },
  floorFan: (w, d) => [circ(w / 2, d * 0.45, min(w, d) * 0.45), circ(w / 2, d * 0.45, min(w, d) * 0.1), ...[0, 120, 240].map((a) => ell(w / 2 + Math.cos((a * Math.PI) / 180) * min(w, d) * 0.24, d * 0.45 + Math.sin((a * Math.PI) / 180) * min(w, d) * 0.24, min(w, d) * 0.18, min(w, d) * 0.08, a)), rect(w * 0.3, d * 0.85, w * 0.4, d * 0.15, 2)],
  grille: (w, d, o) => {
    const out = [rect(0, 0, w, d, num(o, "r", 3))];
    for (const y of dividers(0, d, num(o, "lines", 4))) out.push(line(w * 0.12, y, w * 0.88, y));
    return out;
  },

  // Lighting
  lamp: (w, d) => [circ(w / 2, d / 2, min(w, d) / 2), line(w / 2 - min(w, d) * 0.35, d / 2 - min(w, d) * 0.35, w / 2 + min(w, d) * 0.35, d / 2 + min(w, d) * 0.35), line(w / 2 + min(w, d) * 0.35, d / 2 - min(w, d) * 0.35, w / 2 - min(w, d) * 0.35, d / 2 + min(w, d) * 0.35)],
  arcLamp: (w, d) => [circ(w * 0.15, d * 0.8, min(w, d) * 0.15), path(`M${w * 0.15},${d * 0.8} Q${w * 0.2},0 ${w * 0.8},${d * 0.2}`), circ(w * 0.8, d * 0.3, min(w, d) * 0.18)],
  ceilingLight: (w, d) => {
    const r = min(w, d) / 2;
    const out: Prim[] = [circ(w / 2, d / 2, r * 0.55)];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      out.push(line(w / 2 + Math.cos(a) * r * 0.7, d / 2 + Math.sin(a) * r * 0.7, w / 2 + Math.cos(a) * r, d / 2 + Math.sin(a) * r));
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
  trackLight: (w, d) => [rect(0, d / 2 - 1.5, w, 3, 1), ...centres(0, w, max(2, Math.round(w / 30))).map((x) => circ(x, d / 2, min(5, d / 2)))],
  sconce: (w, d) => [rect(0, 0, w, d * 0.3), path(`M0,${d * 0.3} Q${w / 2},${d * 1.4} ${w},${d * 0.3}`)],

  // Plants & decor
  plant: (w, d, o) => {
    const n = num(o, "leaves", 7);
    const r = min(w, d) / 2;
    const out: Prim[] = [circ(w / 2, d / 2, r * 0.3)];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * 360;
      const rad = (a * Math.PI) / 180;
      out.push(ell(w / 2 + Math.cos(rad) * r * 0.62, d / 2 + Math.sin(rad) * r * 0.62, r * 0.38, r * 0.16, a));
    }
    return out;
  },
  tree: (w, d, o) => [path(scallopPath(w / 2, d / 2, min(w, d) / 2 - 2, num(o, "lobes", 9))), circ(w / 2, d / 2, min(w, d) * 0.05)],
  cactus: (w, d) => [circ(w / 2, d / 2, min(w, d) / 2), circ(w / 2, d / 2, min(w, d) * 0.25), ...[0, 1, 2, 3, 4, 5].map((i) => line(w / 2, d / 2, w / 2 + Math.cos(i) * min(w, d) * 0.45, d / 2 + Math.sin(i) * min(w, d) * 0.45))],
  mirror: (w, d) => {
    const out = [rect(0, 0, w, d, 1)];
    for (let x = 4; x < w; x += 8) out.push(line(x, d, x + d, 0));
    return out;
  },
  divider: (w, d, o) => {
    const panels = num(o, "panels", 3);
    const pts: Pt[] = [];
    for (let i = 0; i <= panels; i++) pts.push([(w * i) / panels, i % 2 ? d : 0]);
    return [rect(0, 0, w, d, 0, true), poly(pts, false)];
  },
  clock: (w, d) => [rect(0, 0, w, d, 2), circ(w / 2, d * 0.55, min(w, d) * 0.3), line(w / 2, d * 0.55, w / 2, d * 0.35)],
  globe: (w, d) => [circ(w / 2, d / 2, min(w, d) / 2), ell(w / 2, d / 2, min(w, d) * 0.2, min(w, d) / 2), line(0, d / 2, w, d / 2)],
  rug: (w, d, o) => {
    if (flag(o, "round"))
      return [ell(w / 2, d / 2, w / 2, d / 2), ell(w / 2, d / 2, w / 2 - 8, d / 2 - 8, undefined, true)];
    const out = [rect(0, 0, w, d), rect(8, 8, w - 16, d - 16, 0, true)];
    for (let y = 4; y < d; y += 6) out.push(line(-4, y, 0, y), line(w, y, w + 4, y));
    return out;
  },

  // Outdoor & garden
  grill: (w, d, o) => {
    const bx = flag(o, "noShelves") ? 0 : w * 0.22;
    const out = [rect(bx, 0, w - 2 * bx, d, 6)];
    for (const x of dividers(bx, w - bx, 5)) out.push(line(x, 6, x, d - 6));
    if (bx) out.push(rect(0, d * 0.1, bx, d * 0.8, 1), rect(w - bx, d * 0.1, bx, d * 0.8, 1));
    return out;
  },
  kamado: (w, d) => [circ(w / 2, d / 2, min(w, d) / 2), circ(w / 2, d / 2, min(w, d) * 0.38), ...dividers(w * 0.15, w * 0.85, 4).map((x) => line(x, d * 0.2, x, d * 0.8))],
  firePit: (w, d, o) =>
    flag(o, "square")
      ? [rect(0, 0, w, d, 3), rect(w * 0.18, d * 0.18, w * 0.64, d * 0.64, 2), rect(w * 0.3, d * 0.3, w * 0.4, d * 0.4, 1, true)]
      : [circ(w / 2, d / 2, min(w, d) / 2), circ(w / 2, d / 2, min(w, d) * 0.34), circ(w / 2, d / 2, min(w, d) * 0.2, true)],
  umbrella: (w, d) => {
    const r = min(w, d) / 2;
    const out: Prim[] = [circ(w / 2, d / 2, r, true), circ(w / 2, d / 2, 3)];
    for (let i = 0; i < 8; i++) out.push(line(w / 2, d / 2, w / 2 + Math.cos((i * Math.PI) / 4) * r, d / 2 + Math.sin((i * Math.PI) / 4) * r));
    return out;
  },
  cantileverUmbrella: (w, d) => [circ(w * 0.58, d / 2, min(w * 0.42, d / 2), true), rect(0, d / 2 - 15, 30, 30, 2), line(15, d / 2, w * 0.58, d / 2)],
  hammock: (w, d) => [ell(w / 2, d / 2, w * 0.35, d * 0.4), line(0, d / 2, w * 0.15, d / 2), line(w * 0.85, d / 2, w, d / 2), rect(0, 0, w, d, 0, true)],
  swingSet: (w, d, o) => {
    const seats = num(o, "seats", 2);
    const out: Prim[] = [rect(0, 0, w, d, 0, true), line(0, d / 2, w, d / 2), line(0, 0, 10, d / 2), line(0, d, 10, d / 2), line(w, 0, w - 10, d / 2), line(w, d, w - 10, d / 2)];
    for (const x of centres(20, w - 20, seats)) out.push(rect(x - 22, d / 2 - 8, 44, 16, 3));
    return out;
  },
  trampoline: (w, d) => [circ(w / 2, d / 2, min(w, d) / 2), circ(w / 2, d / 2, min(w, d) * 0.42), circ(w / 2, d / 2, min(w, d) / 2 - 2, true)],
  pool: (w, d, o) => {
    if (flag(o, "round")) return [circ(w / 2, d / 2, min(w, d) / 2), circ(w / 2, d / 2, min(w, d) / 2 - 15)];
    const out = [rect(0, 0, w, d, 20), rect(15, 15, w - 30, d - 30, 12)];
    for (let i = 1; i <= 3; i++) out.push(line(15 + i * 30, 15, 15 + i * 30, 15 + d * 0.3));
    return out;
  },
  shed: (w, d) => [rect(0, 0, w, d), line(0, d / 2, w, d / 2), line(w * 0.35, d, w * 0.65, d - 0.01), rect(w * 0.35, d - 4, w * 0.3, 4)],
  greenhouse: (w, d) => {
    const out = [rect(0, 0, w, d), line(0, d / 2, w, d / 2)];
    for (const x of dividers(0, w, max(2, Math.round(w / 60)))) out.push(line(x, 0, x, d, true));
    return out;
  },
  raisedBed: (w, d) => {
    const out = [rect(0, 0, w, d), rect(6, 6, w - 12, d - 12)];
    for (const x of centres(6, w - 6, max(2, Math.round(w / 35))))
      for (const y of centres(6, d - 6, max(1, Math.round(d / 35)))) out.push(circ(x, y, 5));
    return out;
  },
  planter: (w, d, o) => {
    const body = flag(o, "round") ? ell(w / 2, d / 2, w / 2, d / 2) : rect(0, 0, w, d, 3);
    return [body, ...T["plant"]!(w * 0.8, d * 0.8, { leaves: 6 }).map((p) => offset(p, w * 0.1, d * 0.1))];
  },
  compost: (w, d) => [rect(0, 0, w, d, 2), ...dividers(0, w, 3).map((x) => line(x, 0, x, d)), line(0, d * 0.15, w, d * 0.15)],
  picnicTable: (w, d) => [rect(0, d * 0.28, w, d * 0.44, 2), rect(0, 0, w, d * 0.2, 1), rect(0, d * 0.8, w, d * 0.2, 1), line(w * 0.15, d * 0.28, w * 0.15, d * 0.72, true), line(w * 0.85, d * 0.28, w * 0.85, d * 0.72, true)],
  mower: (w, d, o) =>
    flag(o, "riding")
      ? [rect(0, 0, w, d, 15), rect(w * 0.3, d * 0.45, w * 0.4, d * 0.25, 5), circ(w / 2, d * 0.25, min(w, d) * 0.12), rect(-6, d * 0.6, 6, d * 0.3), rect(w, d * 0.6, 6, d * 0.3)]
      : [rect(0, d * 0.35, w, d * 0.65, 6), circ(w / 2, d * 0.67, min(w, d * 0.65) * 0.4), line(w * 0.2, d * 0.35, w * 0.3, 0), line(w * 0.8, d * 0.35, w * 0.7, 0), line(w * 0.3, 0, w * 0.7, 0)],
  wheelbarrow: (w, d) => [poly([[w * 0.1, d * 0.2], [w * 0.9, d * 0.2], [w * 0.75, d * 0.75], [w * 0.25, d * 0.75]]), rect(w * 0.45, d * 0.78, w * 0.1, d * 0.22, 2), line(w * 0.2, d * 0.2, w * 0.15, 0), line(w * 0.8, d * 0.2, w * 0.85, 0)],
  coop: (w, d) => [rect(0, 0, w * 0.45, d), line(0, d / 2, w * 0.45, d / 2), rect(w * 0.45, 0, w * 0.55, d, 0, true), ...dividers(w * 0.45, w, 4).map((x) => line(x, 0, x, d, true))],

  // Vehicles & garage
  car: (w, d) => [
    rect(w * 0.06, 0, w * 0.88, d, min(w, d) * 0.22),
    path(`M${w * 0.12},${d * 0.3} Q${w / 2},${d * 0.22} ${w * 0.88},${d * 0.3}`),
    path(`M${w * 0.14},${d * 0.82} Q${w / 2},${d * 0.88} ${w * 0.86},${d * 0.82}`),
    line(w * 0.12, d * 0.3, w * 0.14, d * 0.82),
    line(w * 0.88, d * 0.3, w * 0.86, d * 0.82),
    rect(0, d * 0.3, w * 0.06, d * 0.05, 1),
    rect(w * 0.94, d * 0.3, w * 0.06, d * 0.05, 1),
  ],
  motorcycle: (w, d) => [ell(w / 2, d / 2, w * 0.18, d / 2), line(0, d * 0.22, w, d * 0.22), rect(w * 0.4, d * 0.45, w * 0.2, d * 0.22, 3)],
  bicycle: (w, d) => [rect(w * 0.45, 0, w * 0.1, d * 0.3, 1), rect(w * 0.45, d * 0.7, w * 0.1, d * 0.3, 1), line(w / 2, d * 0.3, w / 2, d * 0.7), line(0, d * 0.12, w, d * 0.12), rect(w * 0.42, d * 0.62, w * 0.16, d * 0.06, 2)],
  scooter: (w, d) => [rect(w * 0.3, d * 0.1, w * 0.4, d * 0.8, 3), line(0, d * 0.05, w, d * 0.05)],
  boat: (w, d) => [path(`M0,${d / 2} Q${w * 0.25},0 ${w},${d * 0.35} L${w},${d * 0.65} Q${w * 0.25},${d} 0,${d / 2} Z`), ell(w * 0.5, d / 2, w * 0.12, d * 0.2)],
  workbench: (w, d, o) => {
    const out = [rect(0, 0, w, d), line(0, d - 4, w, d - 4), rect(w - 22, d - 10, 18, 14, 1)];
    if (flag(o, "pegboard")) out.push(line(0, -6, w, -6, true));
    return out;
  },
  tableSaw: (w, d) => [rect(0, 0, w, d, 1), rect(w / 2 - 1, d * 0.3, 2, d * 0.3), line(w * 0.7, 0, w * 0.7, d), rect(-w * 0.25, 0, w * 0.25, d, 0, true)],
  miterSaw: (w, d) => [rect(0, 0, w, d, 2), circ(w / 2, d * 0.45, min(w, d) * 0.3), line(0, d * 0.75, w, d * 0.75)],
  drillPress: (w, d) => [rect(0, 0, w, d, 2), circ(w / 2, d * 0.6, min(w, d) * 0.25), rect(w * 0.3, 0, w * 0.4, d * 0.3, 2)],
  compressor: (w, d) => [ell(w / 2, d * 0.6, w / 2, d * 0.4), rect(w * 0.25, 0, w * 0.5, d * 0.3, 2), circ(w * 0.2, d * 0.15, min(w, d) * 0.1)],
  generator: (w, d) => [rect(0, 0, w, d, 3), rect(4, 4, w - 8, d - 8, 2), circ(w * 0.3, d / 2, min(w, d) * 0.22), line(w * 0.6, d * 0.3, w * 0.9, d * 0.3)],

  // Fitness & hobby
  treadmill: (w, d) => [rect(0, 0, w, d, 4), rect(w * 0.15, d * 0.18, w * 0.7, d * 0.78, 2), rect(0, 0, w, d * 0.12, 2)],
  elliptical: (w, d) => [rect(0, 0, w, d, w / 2), ell(w * 0.3, d * 0.55, w * 0.12, d * 0.18), ell(w * 0.7, d * 0.55, w * 0.12, d * 0.18), rect(w * 0.2, 0, w * 0.6, d * 0.12, 2)],
  exerciseBike: (w, d) => [ell(w / 2, d / 2, w * 0.3, d / 2), rect(w * 0.35, d * 0.55, w * 0.3, d * 0.15, 3), line(0, d * 0.12, w, d * 0.12)],
  rower: (w, d) => [rect(w * 0.35, 0, w * 0.3, d, 3), rect(w * 0.25, d * 0.55, w * 0.5, d * 0.12, 3), rect(0, 0, w, d * 0.15, 4), line(w * 0.1, d * 0.2, w * 0.9, d * 0.2)],
  powerRack: (w, d) => [rect(0, 0, w, d), ...([[0, 0], [w - 8, 0], [0, d - 8], [w - 8, d - 8]] as Pt[]).map(([x, y]) => rect(x, y, 8, 8)), line(-10, d / 2, w + 10, d / 2), rect(-14, d / 2 - 12, 4, 24), rect(w + 10, d / 2 - 12, 4, 24)],
  weightBench: (w, d) => [rect(w * 0.3, 0, w * 0.4, d, 4), line(0, d * 0.18, w, d * 0.18), rect(0, d * 0.18 - 10, 5, 20), rect(w - 5, d * 0.18 - 10, 5, 20)],
  dumbbellRack: (w, d) => {
    const out = [rect(0, 0, w, d, 2)];
    for (const x of centres(0, w, max(3, Math.round(w / 18)))) out.push(circ(x, d * 0.3, 4), circ(x, d * 0.7, 4), line(x, d * 0.3, x, d * 0.7));
    return out;
  },
  poolTable: (w, d) => [rect(0, 0, w, d, 4), rect(10, 10, w - 20, d - 20), ...([[10, 10], [w / 2, 8], [w - 10, 10], [10, d - 10], [w / 2, d - 8], [w - 10, d - 10]] as Pt[]).map(([x, y]) => circ(x, y, 4))],
  pingPong: (w, d) => [rect(0, 0, w, d), line(w / 2, -6, w / 2, d + 6), line(0, d / 2, w, d / 2)],
  foosball: (w, d) => {
    const out = [rect(0, d * 0.15, w, d * 0.7, 2)];
    for (const x of dividers(0, w, 8)) out.push(line(x, 0, x, d), rect(x - 2, d * 0.45, 4, d * 0.1));
    return out;
  },
  airHockey: (w, d) => [rect(0, 0, w, d, 8), line(w / 2, 0, w / 2, d), circ(w / 2, d / 2, min(w, d) * 0.15), rect(0, d * 0.35, 3, d * 0.3), rect(w - 3, d * 0.35, 3, d * 0.3)],
  arcade: (w, d) => [rect(0, 0, w, d, 2), rect(w * 0.1, d * 0.1, w * 0.8, d * 0.45, 2), line(0, d * 0.7, w, d * 0.7), circ(w * 0.3, d * 0.82, 3), circ(w * 0.6, d * 0.82, 2), circ(w * 0.72, d * 0.82, 2)],
  piano: (w, d, o) => {
    if (flag(o, "grand")) {
      return [
        path(`M0,0 L${w * 0.45},0 C${w * 0.75},0 ${w * 0.65},${d * 0.45} ${w},${d * 0.65} L${w},${d} L0,${d} Z`),
        rect(0, d * 0.82, w, d * 0.18),
        ...dividers(0, w, Math.round(w / 3.5)).map((x) => line(x, d * 0.82, x, d)),
      ];
    }
    const kd = min(16, d * 0.3);
    const out = [rect(0, 0, w, d), rect(w * 0.04, d - kd, w * 0.92, kd)];
    for (const x of dividers(w * 0.04, w * 0.96, Math.round(w / 3.5))) out.push(line(x, d - kd, x, d));
    return out;
  },
  drumKit: (w, d) => [ell(w / 2, d * 0.55, w * 0.18, d * 0.2), circ(w * 0.33, d * 0.25, min(w, d) * 0.1), circ(w * 0.62, d * 0.22, min(w, d) * 0.1), circ(w * 0.78, d * 0.6, min(w, d) * 0.14), circ(w * 0.12, d * 0.3, min(w, d) * 0.16, true), circ(w * 0.88, d * 0.2, min(w, d) * 0.16, true), circ(w * 0.18, d * 0.68, min(w, d) * 0.11), circ(w / 2, d * 0.92, min(w, d) * 0.07)],
  guitar: (w, d) => [circ(w / 2, d * 0.78, min(w, d * 0.45) * 0.5), circ(w / 2, d * 0.52, min(w, d * 0.35) * 0.38), rect(w * 0.45, 0, w * 0.1, d * 0.45), circ(w / 2, d * 0.7, 3)],
  easel: (w, d) => [line(w * 0.1, d, w / 2, 0), line(w * 0.9, d, w / 2, 0), line(w / 2, 0, w / 2, d * 0.6), rect(w * 0.15, d * 0.2, w * 0.7, 3)],
  mat: (w, d) => [rect(0, 0, w, d, 3), path(`M${w - 10},0 Q${w},${d / 2} ${w - 10},${d}`)],
  bag: (w, d) => [circ(w / 2, d / 2, min(w, d) / 2), circ(w / 2, d / 2, min(w, d) * 0.3)],

  // Pets & kids
  petBed: (w, d) => [ell(w / 2, d / 2, w / 2, d / 2), ell(w / 2, d * 0.55, w * 0.36, d * 0.33)],
  catTree: (w, d) => [rect(0, 0, w, d, 2), circ(w * 0.35, d * 0.35, min(w, d) * 0.28, true), circ(w * 0.68, d * 0.65, min(w, d) * 0.25, true), circ(w * 0.35, d * 0.35, 4), circ(w * 0.68, d * 0.65, 4)],
  crate: (w, d) => {
    const out = [rect(0, 0, w, d, 2)];
    for (const x of dividers(0, w, Math.round(w / 8))) out.push(line(x, 0, x, d));
    out.push(rect(w * 0.3, d - 3, w * 0.4, 3));
    return out;
  },
  bowls: (w, d) => [rect(0, 0, w, d, d / 2), circ(w * 0.28, d / 2, d * 0.35), circ(w * 0.72, d / 2, d * 0.35)],
  aquarium: (w, d) => [rect(0, 0, w, d, 1), rect(3, 3, w - 6, d - 6, 0, true), path(`M5,${d / 2} Q${w * 0.25},${d * 0.3} ${w / 2},${d / 2} T${w - 5},${d / 2}`)],
  cage: (w, d, o) => {
    if (flag(o, "round")) return [circ(w / 2, d / 2, min(w, d) / 2), ...[0, 1, 2, 3, 4, 5].map((i) => line(w / 2, d / 2, w / 2 + Math.cos((i * Math.PI) / 3) * min(w, d) / 2, d / 2 + Math.sin((i * Math.PI) / 3) * min(w, d) / 2))];
    const out = [rect(0, 0, w, d, 2)];
    for (const x of dividers(0, w, Math.round(w / 6))) out.push(line(x, 0, x, d));
    return out;
  },
  playpen: (w, d) => {
    const out = [rect(0, 0, w, d, 3), rect(5, 5, w - 10, d - 10, 2, true)];
    for (let x = 10; x < w - 5; x += 10) out.push(line(x, 0, x, 5), line(x, d - 5, x, d));
    return out;
  },
  changingTable: (w, d) => [rect(0, 0, w, d), rect(w * 0.08, d * 0.12, w * 0.84, d * 0.76, 8), line(w * 0.3, d * 0.12, w * 0.3, d * 0.88)],
  highChair: (w, d) => [rect(w * 0.15, d * 0.25, w * 0.7, d * 0.6, 4), path(`M${w * 0.1},${d * 0.25} Q${w / 2},${-d * 0.05} ${w * 0.9},${d * 0.25}`), ...([[0, d], [w, d], [0, 0], [w, 0]] as Pt[]).map(([x, y]) => circ(x, y, 2))],
  teepee: (w, d) => {
    const pts: Pt[] = Array.from({ length: 6 }, (_, i) => [w / 2 + Math.cos((i * Math.PI) / 3) * w / 2, d / 2 + Math.sin((i * Math.PI) / 3) * d / 2]);
    return [poly(pts), ...pts.map(([x, y]) => line(w / 2, d / 2, x, y))];
  },
  ballPit: (w, d, o) => {
    const out = [flag(o, "round") ? ell(w / 2, d / 2, w / 2, d / 2) : rect(0, 0, w, d, 6)];
    for (const x of centres(w * 0.15, w * 0.85, 5)) for (const y of centres(d * 0.15, d * 0.85, 4)) out.push(circ(x + ((y * 7) % 5), y, 3.5));
    return out;
  },
  stroller: (w, d) => [rect(w * 0.1, d * 0.12, w * 0.8, d * 0.65, 8), line(0, d * 0.02, w, d * 0.02), ...([[w * 0.05, d * 0.8], [w * 0.95, d * 0.8], [w * 0.05, d * 0.12], [w * 0.95, d * 0.12]] as Pt[]).map(([x, y]) => rect(x - 2, y, 4, 12, 1))],
  dollhouse: (w, d) => [rect(0, 0, w, d), line(0, d * 0.3, w, d * 0.3), line(w / 2, d * 0.3, w / 2, d), line(0, d * 0.65, w, d * 0.65)],
  playKitchen: (w, d) => [rect(0, 0, w, d), circ(w * 0.2, d * 0.45, 6), circ(w * 0.38, d * 0.45, 6), rect(w * 0.55, d * 0.2, w * 0.35, d * 0.55, 4)],
  toyBox: (w, d) => [rect(0, 0, w, d, 3), line(0, d * 0.2, w, d * 0.2), circ(w / 2, d * 0.6, min(w, d) * 0.12)],
};

function offset(p: Prim, dx: number, dy: number): Prim {
  switch (p.t) {
    case "rect":
      return { ...p, x: p.x + dx, y: p.y + dy };
    case "ellipse":
      return { ...p, cx: p.cx + dx, cy: p.cy + dy };
    case "line":
      return { ...p, x1: p.x1 + dx, y1: p.y1 + dy, x2: p.x2 + dx, y2: p.y2 + dy };
    case "poly":
      return { ...p, points: p.points.map(([x, y]): Pt => [x + dx, y + dy]) };
    case "path":
      return p; // only used for leaf ellipses (see planter)
  }
}

export const TEMPLATE_NAMES = Object.keys(T);

export function hasTemplate(name: string): boolean {
  return name in T;
}

/** The drawing for one item at its real size. Unknown templates fall back
 * to a crossed box so a bad catalog entry is visible, not invisible. */
export function drawItem(template: string, w: number, d: number, opts: Opts = {}): Prim[] {
  const fn = T[template] ?? T["box"]!;
  return fn(w, d, template in T ? opts : { x: true });
}

/** SVG for a drawing's primitives. Strokes keep a constant on-screen width
 * at any zoom; `fillFirst` shades the main body (prims[0]). */
export function renderPrims(
  prims: Prim[],
  fillFirst: boolean,
): SVGTemplateResult[] {
  return prims.map((p, i) => {
    const cls = `${p.dash ? "fx dash" : "fx"}${fillFirst && i === 0 ? " body" : ""}`;
    switch (p.t) {
      case "rect":
        return svg`<rect class=${cls} x=${p.x} y=${p.y} width=${max(0.01, p.w)} height=${max(0.01, p.h)} rx=${p.r ?? 0}></rect>`;
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
  });
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
  .fx.body { fill: var(--fx-color, currentColor); fill-opacity: 0.16; }
`;
