/** Vector floor plans: an SVG used as a floor's background, with its rooms,
 * walls, doors and windows imported as real geometry so they don't have to
 * be traced by hand.
 *
 * Home Assistant's image storage only takes raster images, so the SVG is
 * rasterised to a PNG for the background (rasterizeSvg), and separately
 * parsed for geometry (parseSvgFloorplan) — everything in the SVG's own
 * viewBox coordinates, which map linearly onto the background image and so
 * onto the floor's stored coordinate space (buildSvgLayout).
 *
 * What counts as what comes from each element's id, class and Inkscape
 * layer label, matched by whole word and inherited from the nearest group
 * that has one (see ROLE_WORDS): a `rooms` group's polygons are rooms, a
 * `<line class="wall">` is a wall, `<g id="door_front">` is a door, and a
 * `fixtures` group is skipped. Anything unmatched is background only. */

import type {
  AreaMeta,
  Opening,
  OpeningType,
  Room,
  Scale,
  Wall,
} from "../types";
import { newOpening, newRoom, newWall } from "../ha-client";
import { pointInPolygon } from "./geometry";

type Pt = [number, number];
/** An affine transform [a, b, c, d, e, f]: x' = ax + cy + e, y' = bx + dy + f. */
type Matrix = [number, number, number, number, number, number];

type Role = "room" | "wall" | "door" | "window" | "ignore";

const ROLE_WORDS: Record<string, Role> = {
  room: "room",
  rooms: "room",
  space: "room",
  spaces: "room",
  wall: "wall",
  walls: "wall",
  ext: "wall",
  int: "wall",
  exterior: "wall",
  interior: "wall",
  door: "door",
  doors: "door",
  window: "window",
  windows: "window",
  win: "window",
  fixture: "ignore",
  fixtures: "ignore",
  fx: "ignore",
  furniture: "ignore",
  label: "ignore",
  labels: "ignore",
  dim: "ignore",
  dims: "ignore",
  dimension: "ignore",
  dimensions: "ignore",
  rail: "ignore",
  rails: "ignore",
  railing: "ignore",
  railings: "ignore",
  annotation: "ignore",
  annotations: "ignore",
};

const EXTERIOR_WORDS = new Set(["ext", "exterior", "outer", "outside"]);

/** Elements whose contents are never drawn geometry. */
const SKIPPED_TAGS = new Set([
  "defs",
  "metadata",
  "title",
  "desc",
  "style",
  "script",
  "symbol",
  "clipPath",
  "mask",
  "pattern",
  "marker",
  "linearGradient",
  "radialGradient",
  "filter",
  "foreignObject",
]);

const GROUP_TAGS = new Set(["g", "svg", "a", "switch"]);

const INKSCAPE_NS = "http://www.inkscape.org/namespaces/inkscape";

export interface SvgViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Everything found in the SVG, in its root viewBox coordinates. */
export interface SvgFloorplan {
  viewBox: SvgViewBox;
  /** viewBox units per one unit of the plan's own drawing coordinates —
   * the local coordinate system its rooms/walls were authored in (often
   * feet or metres under a `scale()` transform). The "one drawing unit is
   * how long?" calibration prompt refers to this. */
  drawingUnit: number;
  rooms: { name: string; id: string | null; points: Pt[] }[];
  walls: { points: Pt[]; strokeWidth: number | null; exterior: boolean }[];
  openings: { type: OpeningType; points: Pt[] }[];
}

export function isSvgFile(file: File): boolean {
  return file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
}

// --- parsing ---------------------------------------------------------------

export function parseSvgFloorplan(text: string): SvgFloorplan {
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const parsedRoot = doc.documentElement;
  if (
    parsedRoot.localName !== "svg" ||
    doc.getElementsByTagName("parsererror").length > 0
  ) {
    throw new Error("Not a valid SVG file");
  }
  const viewBox = readViewBox(parsedRoot);

  // Attached to the live document (off-screen, for one synchronous pass)
  // so getComputedStyle sees the SVG's own <style> rules — stroke widths
  // and CSS-hidden layers usually live there, not in attributes.
  let root: Element = parsedRoot;
  let host: HTMLElement | null = null;
  if (typeof document !== "undefined" && document.body) {
    host = document.createElement("div");
    host.style.cssText =
      "position:fixed;left:-100000px;top:0;width:1px;height:1px;overflow:hidden;visibility:hidden;pointer-events:none";
    root = document.importNode(parsedRoot, true);
    host.appendChild(root);
    document.body.appendChild(host);
  }

  const plan: SvgFloorplan = {
    viewBox,
    drawingUnit: 1,
    rooms: [],
    walls: [],
    openings: [],
  };
  const labels: { text: string; at: Pt }[] = [];
  const unitScales: number[] = [];
  try {
    walk(root, IDENTITY, null, false);
  } finally {
    host?.remove();
  }

  // Unnamed rooms fall back to a text label sitting inside them.
  plan.rooms.forEach((room, i) => {
    if (room.name) return;
    const label = labels.find((l) =>
      pointInPolygon(l.at[0], l.at[1], room.points),
    );
    room.name = label?.text ?? `Room ${i + 1}`;
  });
  if (unitScales.length > 0) {
    unitScales.sort((a, b) => a - b);
    plan.drawingUnit = unitScales[Math.floor(unitScales.length / 2)]!;
  }
  return plan;

  function walk(
    parent: Element,
    m: Matrix,
    inherited: Role | null,
    inheritedExterior: boolean,
  ): void {
    for (const el of Array.from(parent.children)) {
      const tag = el.localName;
      if (SKIPPED_TAGS.has(tag) || isHidden(el)) continue;
      const cm = multiply(m, parseTransform(el.getAttribute("transform")));
      const words = elementWords(el);
      const own = roleOf(words);
      const role = own ?? inherited;
      const exterior =
        inheritedExterior || words.some((w) => EXTERIOR_WORDS.has(w));

      if (tag === "text") {
        const content = el.textContent?.replace(/\s+/g, " ").trim();
        if (content) {
          const x = parseFloat(firstListValue(el.getAttribute("x")));
          const y = parseFloat(firstListValue(el.getAttribute("y")));
          labels.push({
            text: content,
            at: apply(cm, [x || 0, y || 0]),
          });
        }
        continue;
      }

      if (GROUP_TAGS.has(tag)) {
        // A group that is itself named as a door/window (a leaf line plus
        // its swing arc, say) is one opening built from all its parts —
        // unless it's a container: named in the plural ("windows"), or
        // holding parts that are named as openings themselves.
        if (
          (own === "door" || own === "window") &&
          !words.some((w) => w === "doors" || w === "windows") &&
          !Array.from(el.children).some((c) => {
            const r = roleOf(elementWords(c));
            return r === "door" || r === "window";
          })
        ) {
          const points = collectPoints(el, cm);
          if (points.length >= 2) plan.openings.push({ type: own, points });
          continue;
        }
        walk(el, cm, role, exterior);
        continue;
      }

      if (!role || role === "ignore") continue;
      const shapes = shapeGeometry(el).map((s) => ({
        closed: s.closed,
        points: s.points.map((p) => apply(cm, p)),
      }));
      if (shapes.length === 0) continue;
      const unit = matrixScale(cm);

      if (role === "room") {
        for (const shape of shapes) {
          if (!shape.closed || shape.points.length < 3) continue;
          plan.rooms.push({
            name: roomName(el),
            id: el.getAttribute("id"),
            points: shape.points,
          });
          unitScales.push(unit);
        }
      } else if (role === "wall") {
        const stroke = strokeWidth(el);
        for (const shape of shapes) {
          const points = shape.closed
            ? [...shape.points, shape.points[0]!]
            : shape.points;
          if (points.length < 2) continue;
          plan.walls.push({
            points,
            strokeWidth: stroke === null ? null : stroke * unit,
            exterior,
          });
          unitScales.push(unit);
        }
      } else {
        const points = shapes.flatMap((s) => s.points);
        if (points.length >= 2) plan.openings.push({ type: role, points });
      }
    }
  }

  function collectPoints(group: Element, m: Matrix): Pt[] {
    const points: Pt[] = [];
    for (const el of Array.from(group.children)) {
      if (SKIPPED_TAGS.has(el.localName) || isHidden(el)) continue;
      const cm = multiply(m, parseTransform(el.getAttribute("transform")));
      if (GROUP_TAGS.has(el.localName)) {
        points.push(...collectPoints(el, cm));
      } else {
        for (const shape of shapeGeometry(el)) {
          points.push(...shape.points.map((p) => apply(cm, p)));
        }
      }
    }
    return points;
  }
}

function readViewBox(root: Element): SvgViewBox {
  const raw = root.getAttribute("viewBox");
  if (raw) {
    const [x, y, w, h] = raw
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (
      [x, y, w, h].every((v) => v !== undefined && Number.isFinite(v)) &&
      w! > 0 &&
      h! > 0
    ) {
      return { x: x!, y: y!, w: w!, h: h! };
    }
  }
  const w = parseFloat(root.getAttribute("width") ?? "");
  const h = parseFloat(root.getAttribute("height") ?? "");
  const percent = /%/.test(
    `${root.getAttribute("width")}${root.getAttribute("height")}`,
  );
  if (!percent && w > 0 && h > 0) return { x: 0, y: 0, w, h };
  throw new Error("The SVG needs a viewBox (or a fixed width and height)");
}

function elementWords(el: Element): string[] {
  const sources = [
    el.getAttribute("id"),
    el.getAttribute("class"),
    el.getAttributeNS(INKSCAPE_NS, "label") ??
      el.getAttribute("inkscape:label"),
    el.getAttribute("data-type"),
  ];
  return sources
    .flatMap((s) => (s ?? "").toLowerCase().split(/[^a-z0-9]+/))
    .filter(Boolean);
}

/** The first role word wins — id before class before label, so
 * `<line id="door_patio" class="win">` is a door drawn in window style. */
function roleOf(words: string[]): Role | null {
  for (const word of words) {
    const role = ROLE_WORDS[word];
    if (role) return role;
  }
  return null;
}

function isHidden(el: Element): boolean {
  if (el.getAttribute("display") === "none") return true;
  if (el.getAttribute("visibility") === "hidden") return true;
  if (/display\s*:\s*none/i.test(el.getAttribute("style") ?? "")) return true;
  if (el.isConnected && typeof getComputedStyle === "function") {
    return getComputedStyle(el).display === "none";
  }
  return false;
}

/** Stroke width in the element's own user units, or null if unknown. */
function strokeWidth(el: Element): number | null {
  if (el.isConnected && typeof getComputedStyle === "function") {
    const value = parseFloat(getComputedStyle(el).strokeWidth);
    if (Number.isFinite(value) && value > 0) return value;
  }
  const inline = /stroke-width\s*:\s*([\d.eE+-]+)/.exec(
    el.getAttribute("style") ?? "",
  )?.[1];
  const value = parseFloat(inline ?? el.getAttribute("stroke-width") ?? "");
  return Number.isFinite(value) && value > 0 ? value : null;
}

const GENERATED_ID =
  /^(path|rect|polygon|polyline|line|g|layer|shape|svg)[-_]?\d+$/i;

/** A room's name from its <title>, Inkscape label, aria-label or id — or
 * "" to fall back to a text label inside it (see parseSvgFloorplan). */
function roomName(el: Element): string {
  const title = Array.from(el.children).find((c) => c.localName === "title");
  const fromTitle = title?.textContent?.trim();
  if (fromTitle) return fromTitle;
  const label =
    el.getAttributeNS(INKSCAPE_NS, "label") ??
    el.getAttribute("inkscape:label") ??
    el.getAttribute("aria-label");
  if (label?.trim()) return label.trim();
  const id = el.getAttribute("id");
  if (id && !GENERATED_ID.test(id)) return humanize(id);
  return "";
}

function humanize(id: string): string {
  return id
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function firstListValue(value: string | null): string {
  return (value ?? "").trim().split(/[\s,]+/)[0] ?? "";
}

// --- shapes ----------------------------------------------------------------

interface Shape {
  points: Pt[];
  closed: boolean;
}

function num(el: Element, name: string): number {
  const value = parseFloat(el.getAttribute(name) ?? "");
  return Number.isFinite(value) ? value : 0;
}

/** An element's outline as polylines in its own user units. Curves keep
 * only their endpoints — floor-plan rooms and walls are straight-sided, and
 * a door's swing arc only needs its two ends to locate the opening. */
function shapeGeometry(el: Element): Shape[] {
  switch (el.localName) {
    case "rect": {
      const x = num(el, "x");
      const y = num(el, "y");
      const w = num(el, "width");
      const h = num(el, "height");
      if (w <= 0 || h <= 0) return [];
      const points: Pt[] = [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ];
      return [{ points, closed: true }];
    }
    case "line":
      return [
        {
          points: [
            [num(el, "x1"), num(el, "y1")],
            [num(el, "x2"), num(el, "y2")],
          ],
          closed: false,
        },
      ];
    case "polygon":
    case "polyline": {
      const points = cleanPoints(parsePointList(el.getAttribute("points")));
      if (points.length < 2) return [];
      return [
        {
          ...closeIfLooped(points),
          ...(el.localName === "polygon" ? { closed: true } : {}),
        },
      ];
    }
    case "path":
      return parsePath(el.getAttribute("d") ?? "");
    default:
      return [];
  }
}

function parsePointList(value: string | null): Pt[] {
  const nums = (value ?? "")
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number);
  const points: Pt[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    if (Number.isFinite(nums[i]) && Number.isFinite(nums[i + 1])) {
      points.push([nums[i]!, nums[i + 1]!]);
    }
  }
  return points;
}

function samePoint(a: Pt, b: Pt): boolean {
  return Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;
}

function cleanPoints(points: Pt[]): Pt[] {
  return points.filter((p, i) => i === 0 || !samePoint(p, points[i - 1]!));
}

/** A polyline that ends where it started is a closed shape. */
function closeIfLooped(points: Pt[]): Shape {
  if (points.length > 2 && samePoint(points[0]!, points[points.length - 1]!)) {
    return { points: points.slice(0, -1), closed: true };
  }
  return { points, closed: false };
}

/** SVG path data → its subpaths' vertices. */
export function parsePath(d: string): Shape[] {
  const shapes: Shape[] = [];
  let i = 0;
  let cmd = "";
  let cur: Pt = [0, 0];
  let start: Pt = [0, 0];
  let points: Pt[] | null = null;

  const skip = () => {
    while (i < d.length && /[\s,]/.test(d[i]!)) i++;
  };
  const number = (): number => {
    skip();
    const match = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(d.slice(i));
    if (!match) return NaN;
    i += match[0].length;
    return Number(match[0]);
  };
  // Arc flags are single digits that may be written with no separator.
  const flag = (): number => {
    skip();
    const c = d[i];
    if (c !== "0" && c !== "1") return NaN;
    i++;
    return Number(c);
  };
  const finish = (closed: boolean) => {
    if (points && points.length > 1) {
      const clean = cleanPoints(points);
      shapes.push(closed ? { points: clean, closed } : closeIfLooped(clean));
    }
    points = null;
  };
  const to = (p: Pt) => {
    if (!points) points = [cur];
    points.push(p);
    cur = p;
  };

  while (i < d.length) {
    skip();
    if (i >= d.length) break;
    if (/[a-zA-Z]/.test(d[i]!)) cmd = d[i++]!;
    else if (!cmd) break;
    const rel = cmd === cmd.toLowerCase();
    const at = (x: number, y: number): Pt =>
      rel ? [cur[0] + x, cur[1] + y] : [x, y];
    const before = i;
    switch (cmd.toUpperCase()) {
      case "M": {
        const x = number();
        const y = number();
        if (Number.isNaN(y)) break;
        finish(false);
        cur = start = at(x, y);
        points = [cur];
        cmd = rel ? "l" : "L"; // further pairs are implicit linetos
        break;
      }
      case "L": {
        const x = number();
        const y = number();
        if (!Number.isNaN(y)) to(at(x, y));
        break;
      }
      case "H": {
        const x = number();
        if (!Number.isNaN(x)) to([rel ? cur[0] + x : x, cur[1]]);
        break;
      }
      case "V": {
        const y = number();
        if (!Number.isNaN(y)) to([cur[0], rel ? cur[1] + y : y]);
        break;
      }
      case "C":
      case "S":
      case "Q":
      case "T": {
        const pairs = { C: 3, S: 2, Q: 2, T: 1 }[cmd.toUpperCase() as "C"];
        let x = NaN;
        let y = NaN;
        for (let k = 0; k < pairs; k++) {
          x = number();
          y = number();
        }
        if (!Number.isNaN(y)) to(at(x, y));
        break;
      }
      case "A": {
        number();
        number();
        number();
        flag();
        flag();
        const x = number();
        const y = number();
        if (!Number.isNaN(y)) to(at(x, y));
        break;
      }
      case "Z":
        finish(true);
        cur = start;
        cmd = "";
        continue;
      default:
        i = d.length;
    }
    if (i === before) break; // malformed data — stop rather than spin
  }
  finish(false);
  return shapes;
}

// --- transforms ------------------------------------------------------------

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];

function multiply(m: Matrix, n: Matrix): Matrix {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

function apply(m: Matrix, [x, y]: Pt): Pt {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

/** How much the transform scales lengths (uniform-scale equivalent). */
function matrixScale(m: Matrix): number {
  return Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])) || 1;
}

export function parseTransform(value: string | null): Matrix {
  let result = IDENTITY;
  const re = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
  for (const match of (value ?? "").matchAll(re)) {
    const args = match[2]!
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    const [a = 0, b, c] = args;
    let t: Matrix = IDENTITY;
    switch (match[1]) {
      case "matrix":
        if (args.length === 6) t = args as Matrix;
        break;
      case "translate":
        t = [1, 0, 0, 1, a, b ?? 0];
        break;
      case "scale":
        t = [a, 0, 0, b ?? a, 0, 0];
        break;
      case "rotate": {
        const r = (a * Math.PI) / 180;
        const cos = Math.cos(r);
        const sin = Math.sin(r);
        const cx = b ?? 0;
        const cy = c ?? 0;
        t = [
          cos,
          sin,
          -sin,
          cos,
          cx - cos * cx + sin * cy,
          cy - sin * cx - cos * cy,
        ];
        break;
      }
      case "skewX":
        t = [1, 0, Math.tan((a * Math.PI) / 180), 1, 0, 0];
        break;
      case "skewY":
        t = [1, Math.tan((a * Math.PI) / 180), 0, 1, 0, 0];
        break;
    }
    result = multiply(result, t);
  }
  return result;
}

// --- into a floor layout ---------------------------------------------------

/** Where the background image sits in the floor's stored coordinates —
 * its top-left corner and full drawn width (BASE_WIDTH × background_scale,
 * offset by background_offset_x/y; see FloorLayout). */
export interface SvgPlacement {
  x: number;
  y: number;
  width: number;
}

export interface SvgImportResult {
  rooms: Room[];
  walls: Wall[];
  openings: Opening[];
  scale: Scale | null;
  /** Doors/windows that didn't lie along any imported wall. */
  skippedOpenings: number;
}

interface WorkWall {
  points: Pt[];
  strokeWidth: number | null;
  mergedInto: WorkWall | null;
}

function resolve(wall: WorkWall): WorkWall {
  while (wall.mergedInto) wall = wall.mergedInto;
  return wall;
}

function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Turns a parsed plan into new rooms/walls/openings for a floor whose
 * background is that plan's rasterised image. Rooms whose name or id
 * matches an HA area get linked to it. `metersPerDrawingUnit` (when the
 * user said how long one drawing unit is) also calibrates the floor and
 * sets wall thicknesses from the SVG's stroke widths. */
export function buildSvgLayout(
  plan: SvgFloorplan,
  placement: SvgPlacement,
  areas: AreaMeta[],
  metersPerDrawingUnit: number | null,
): SvgImportResult {
  const vb = plan.viewBox;
  const k = placement.width / vb.w;
  const toStored = ([x, y]: Pt): Pt => [
    placement.x + (x - vb.x) * k,
    placement.y + (y - vb.y) * k,
  ];
  // How close (in viewBox units) counts as "on the same line".
  const tol = 0.003 * Math.max(vb.w, vb.h);

  // Rooms, linked to an HA area by name or id where one matches.
  const unusedAreas = new Set(areas);
  const rooms = plan.rooms.map((r) => {
    const keys = [r.name, r.id ?? ""].map(normalizeName).filter(Boolean);
    const area = [...unusedAreas].find(
      (a) =>
        keys.includes(normalizeName(a.name)) ||
        (r.id !== null && a.area_id === r.id),
    );
    if (area) unusedAreas.delete(area);
    return newRoom(r.name, r.points.map(toStored), area?.area_id ?? null);
  });

  // Walls, merged across the door/window gaps plans usually leave in them.
  const walls: WorkWall[] = plan.walls.map((w) => ({
    points: w.points.map((p): Pt => [p[0], p[1]]),
    strokeWidth: w.strokeWidth,
    mergedInto: null,
  }));
  const placed: {
    type: OpeningType;
    host: WorkWall;
    center: Pt;
    width: number;
  }[] = [];
  let skippedOpenings = 0;

  for (const opening of plan.openings) {
    const hit = findHostSegment(walls, opening.points, tol);
    if (!hit) {
      skippedOpenings++;
      continue;
    }
    const { origin, dir, span } = hit;
    let host: WorkWall | null = hit.contained ? hit.wall : null;
    const [s0, s1] = span;
    if (!host) {
      // Gap between collinear straight walls: join them (and the gap) into
      // one wall, since an opening sits along a wall rather than in a hole.
      const lineDist = (p: Pt) =>
        Math.abs((p[0] - origin[0]) * dir[1] - (p[1] - origin[1]) * dir[0]);
      const along = (p: Pt) =>
        (p[0] - origin[0]) * dir[0] + (p[1] - origin[1]) * dir[1];
      const touching = walls.filter((w) => {
        if (w.mergedInto || w.points.length !== 2) return false;
        if (!w.points.every((p) => lineDist(p) <= tol)) return false;
        const [t0, t1] = w.points.map(along).sort((a, b) => a - b) as Pt;
        return t0 <= span[1] + tol && t1 >= span[0] - tol;
      });
      if (touching.length === 0) {
        skippedOpenings++;
        continue;
      }
      let lo = s0;
      let hi = s1;
      for (const w of touching) {
        for (const p of w.points) {
          lo = Math.min(lo, along(p));
          hi = Math.max(hi, along(p));
        }
      }
      host = touching[0]!;
      host.points = [
        [origin[0] + dir[0] * lo, origin[1] + dir[1] * lo],
        [origin[0] + dir[0] * hi, origin[1] + dir[1] * hi],
      ];
      for (const w of touching.slice(1)) w.mergedInto = host;
    }
    const mid = (s0 + s1) / 2;
    placed.push({
      type: opening.type,
      host,
      center: [origin[0] + dir[0] * mid, origin[1] + dir[1] * mid],
      width: s1 - s0,
    });
  }

  const finalWalls = new Map<WorkWall, Wall>();
  for (const w of walls) {
    if (w.mergedInto) continue;
    const wall = newWall(w.points.map(toStored));
    if (metersPerDrawingUnit && w.strokeWidth) {
      const cm =
        (w.strokeWidth / plan.drawingUnit) * metersPerDrawingUnit * 100;
      wall.thickness_cm = Math.max(1, Math.round(cm * 10) / 10);
    }
    finalWalls.set(w, wall);
  }
  const openings = placed.map((o) => {
    const [x, y] = toStored(o.center);
    return newOpening(
      finalWalls.get(resolve(o.host))!.id,
      o.type,
      x,
      y,
      o.width * k,
    );
  });

  return {
    rooms,
    walls: [...finalWalls.values()],
    openings,
    scale: metersPerDrawingUnit
      ? calibration(plan, toStored, metersPerDrawingUnit)
      : null,
    skippedOpenings,
  };
}

/** The wall segment an opening lies along: at least two of its points on
 * the segment's line, preferring one that contains the whole span (a
 * window drawn on its wall) over one it only touches (a door drawn in a
 * gap between two walls). */
function findHostSegment(
  walls: WorkWall[],
  points: Pt[],
  tol: number,
): {
  wall: WorkWall;
  origin: Pt;
  dir: Pt;
  span: [number, number];
  contained: boolean;
} | null {
  let best: {
    wall: WorkWall;
    origin: Pt;
    dir: Pt;
    span: [number, number];
    contained: boolean;
    count: number;
  } | null = null;
  const unique = points.filter(
    (p, i) => points.findIndex((q) => samePoint(p, q)) === i,
  );
  for (const wall of walls) {
    if (wall.mergedInto) continue;
    for (let i = 0; i + 1 < wall.points.length; i++) {
      const a = wall.points[i]!;
      const b = wall.points[i + 1]!;
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < tol) continue;
      const dir: Pt = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
      const along: number[] = [];
      for (const p of unique) {
        const dx = p[0] - a[0];
        const dy = p[1] - a[1];
        if (Math.abs(dx * dir[1] - dy * dir[0]) <= tol) {
          along.push(dx * dir[0] + dy * dir[1]);
        }
      }
      if (along.length < 2) continue;
      const s0 = Math.min(...along);
      const s1 = Math.max(...along);
      if (s1 - s0 < tol) continue;
      const contained = s0 >= -tol && s1 <= len + tol;
      const touches = s0 <= len + tol && s1 >= -tol;
      if (!contained && !touches) continue;
      const better =
        !best ||
        (contained && !best.contained) ||
        (contained === best.contained && along.length > best.count);
      if (better) {
        best = {
          wall,
          origin: a,
          dir,
          span: [s0, s1],
          contained,
          count: along.length,
        };
      }
    }
  }
  return best;
}

/** A floor Scale along the top edge of the imported geometry. */
function calibration(
  plan: SvgFloorplan,
  toStored: (p: Pt) => Pt,
  metersPerDrawingUnit: number,
): Scale | null {
  const all = [
    ...plan.rooms.flatMap((r) => r.points),
    ...plan.walls.flatMap((w) => w.points),
  ];
  if (all.length < 2) return null;
  const xs = all.map((p) => p[0]);
  const ys = all.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const horizontal = maxX - minX >= maxY - minY;
  const length = horizontal ? maxX - minX : maxY - minY;
  if (length <= 0) return null;
  const end: Pt = horizontal ? [maxX, minY] : [minX, maxY];
  return {
    points: [toStored([minX, minY]), toStored(end)],
    meters: (length / plan.drawingUnit) * metersPerDrawingUnit,
  };
}

// --- rasterising -----------------------------------------------------------

/** Renders the SVG to a PNG at up to `maxSide` pixels on its long side, for
 * Home Assistant's image storage (which won't take SVG). The PNG covers
 * exactly the viewBox, so viewBox coordinates map straight onto it. */
export async function rasterizeSvg(
  text: string,
  viewBox: SvgViewBox,
  fileName: string,
  maxSide = 4096,
): Promise<File> {
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const root = doc.documentElement;
  const px = maxSide / Math.max(viewBox.w, viewBox.h);
  const width = Math.max(1, Math.round(viewBox.w * px));
  const height = Math.max(1, Math.round(viewBox.h * px));
  // Explicit pixel size (a "100%" root has no intrinsic size as an <img>)
  // and an explicit viewBox, so the drawing fills the PNG exactly.
  root.setAttribute(
    "viewBox",
    `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`,
  );
  root.setAttribute("width", String(width));
  root.setAttribute("height", String(height));
  root.setAttribute("preserveAspectRatio", "none");
  const blob = new Blob([new XMLSerializer().serializeToString(doc)], {
    type: "image/svg+xml",
  });
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not available");
    ctx.drawImage(img, 0, 0, width, height);
    const png = await new Promise<Blob | null>((done) =>
      canvas.toBlob(done, "image/png"),
    );
    if (!png) throw new Error("Couldn't convert the SVG to an image");
    return new File([png], fileName.replace(/\.svg$/i, "") + ".png", {
      type: "image/png",
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
