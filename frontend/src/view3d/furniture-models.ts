/** Furniture as 3D models (part of the lazily loaded 3D module, like
 * view3d-glue.ts): a sofa with its arms, back and cushions, a bed made up
 * with pillows and a duvet, chairs and tables on legs, cabinets with their
 * doors, drawers and handles, kitchen and bathroom fittings, appliances,
 * a car — each built to the item's real size from its catalog drawing
 * kind and options, instead of a block with the plan's drawing on top.
 *
 * The item's own frame: x across its width, z from its back (-depth/2,
 * against the wall, as the plan's drawings have it) to its front, y up
 * from its floor. Parts are merged into a mesh per material. */

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { Item3d } from "./view3d-api";

type Opts = Record<string, string | number | boolean | undefined>;

const MATS = new Map<string, THREE.MeshStandardMaterial>();
export function mat(
  color: string,
  rough = 0.85,
  metal = 0,
  extra?: { glow?: string; glowLevel?: number; opacity?: number },
): THREE.MeshStandardMaterial {
  const key = `${color}|${rough}|${metal}|${extra?.glow ?? ""}|${extra?.glowLevel ?? 0}|${extra?.opacity ?? 1}`;
  let m = MATS.get(key);
  if (!m) {
    // No reflections to show, so metals stay mostly diffuse (a fully
    // metallic surface with nothing to reflect renders black).
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: Math.max(rough, 0.35),
      metalness: metal * 0.3,
    });
    if (extra?.glow) {
      m.emissive = new THREE.Color(extra.glow);
      m.emissiveIntensity = extra.glowLevel ?? 1;
    }
    if (extra?.opacity !== undefined && extra.opacity < 1) {
      m.transparent = true;
      m.opacity = extra.opacity;
      m.depthWrite = false;
    }
    MATS.set(key, m);
  }
  return m;
}

/** The palette. */
export const C = {
  fabric: "#8d9096",
  cushion: "#9da0a6",
  linen: "#efebe3",
  duvet: "#c8d0d8",
  pillow: "#f7f5ef",
  woodDark: "#5e412d",
  wood: "#9a7350",
  woodLight: "#c7a57d",
  paint: "#f1eee8",
  black: "#262626",
  charcoal: "#3a3a3c",
  steel: "#c5c8cc",
  chrome: "#dfe2e5",
  porcelain: "#f8f8f6",
  stone: "#e4e1db",
  glass: "#a9c7d6",
  screen: "#101418",
  rubber: "#1b1b1b",
};

/** Collects parts, then merges them by material into one group. */
export class Model {
  private parts = new Map<THREE.Material, THREE.BufferGeometry[]>();
  constructor(
    readonly W: number,
    readonly D: number,
    readonly H: number,
    readonly flip: boolean,
  ) {}

  add(geom: THREE.BufferGeometry, m: THREE.Material): void {
    const g = geom.index ? geom.toNonIndexed() : geom;
    if (g !== geom) geom.dispose();
    // Vertex colours stay for a material drawn with them (foliage).
    const keepColor = !!(m as THREE.MeshStandardMaterial).vertexColors;
    for (const name of Object.keys(g.attributes))
      if (
        name !== "position" &&
        name !== "normal" &&
        name !== "uv" &&
        !(keepColor && name === "color")
      )
        g.deleteAttribute(name);
    if (!g.getAttribute("uv")) {
      const n = g.getAttribute("position").count;
      g.setAttribute(
        "uv",
        new THREE.BufferAttribute(new Float32Array(n * 2), 2),
      );
    }
    if (this.flip) {
      g.scale(-1, 1, 1);
      // Mirroring turns faces inside out: put the winding back.
      const pos = g.getAttribute("position") as THREE.BufferAttribute;
      const nor = g.getAttribute("normal") as THREE.BufferAttribute;
      const uv = g.getAttribute("uv") as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i += 3)
        for (const a of [pos, nor, uv]) {
          for (let c = 0; c < a.itemSize; c++) {
            const t = a.getComponent(i + 1, c);
            a.setComponent(i + 1, c, a.getComponent(i + 2, c));
            a.setComponent(i + 2, c, t);
          }
        }
    }
    const list = this.parts.get(m) ?? [];
    list.push(g);
    this.parts.set(m, list);
  }

  /** A box: width, height, depth; centred at x, z, standing on y. */
  box(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    m: THREE.Material,
    rx = 0,
  ): void {
    if (w <= 0 || h <= 0 || d <= 0) return;
    const g = new THREE.BoxGeometry(w, h, d);
    if (rx) g.rotateX(rx);
    g.translate(x, y + h / 2, z);
    this.add(g, m);
  }

  /** A soft box (a cushion, an upholstered body). */
  soft(
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    m: THREE.Material,
    r = 0.03,
    rx = 0,
  ): void {
    if (w <= 0 || h <= 0 || d <= 0) return;
    const rr = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
    const g = new RoundedBoxGeometry(w, h, d, 2, Math.max(0.001, rr));
    if (rx) g.rotateX(rx);
    g.translate(x, y + h / 2, z);
    this.add(g, m);
  }

  /** A cylinder standing on y (or lying along x / z). */
  cyl(
    rTop: number,
    rBot: number,
    h: number,
    x: number,
    y: number,
    z: number,
    m: THREE.Material,
    seg = 16,
    axis: "y" | "x" | "z" = "y",
  ): void {
    if (h <= 0) return;
    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg);
    if (axis === "y") g.translate(x, y + h / 2, z);
    else {
      if (axis === "x") g.rotateZ(Math.PI / 2);
      else g.rotateX(Math.PI / 2);
      g.translate(x, y, z);
    }
    this.add(g, m);
  }

  /** An elliptic cylinder (a toilet bowl, a round table top). */
  oval(
    rx: number,
    rz: number,
    h: number,
    x: number,
    y: number,
    z: number,
    m: THREE.Material,
    rxTop = rx,
    rzTop = rz,
  ): void {
    const g = new THREE.CylinderGeometry(1, 1, h, 28);
    const pos = g.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < pos.count; i++) {
      const top = pos.getY(i) > 0;
      pos.setX(i, pos.getX(i) * (top ? rxTop : rx));
      pos.setZ(i, pos.getZ(i) * (top ? rzTop : rz));
    }
    g.computeVertexNormals();
    g.translate(x, y + h / 2, z);
    this.add(g, m);
  }

  sphere(
    r: number,
    x: number,
    y: number,
    z: number,
    m: THREE.Material,
    sx = 1,
    sy = 1,
    sz = 1,
  ): void {
    const g = new THREE.SphereGeometry(r, 16, 12);
    g.scale(sx, sy, sz);
    g.translate(x, y, z);
    this.add(g, m);
  }

  /** Four legs under a rectangle (inset from its edges). */
  legs(
    w: number,
    d: number,
    h: number,
    inset: number,
    size: number,
    m: THREE.Material,
    round = false,
    z0 = 0,
  ): void {
    for (const sx of [-1, 1])
      for (const sz of [-1, 1]) {
        const x = sx * (w / 2 - inset - size / 2);
        const z = z0 + sz * (d / 2 - inset - size / 2);
        if (round) this.cyl(size / 2, size / 2.6, h, x, 0, z, m, 10);
        else this.box(size, h, size, x, 0, z, m);
      }
  }

  /** A short bar handle on a front face (vertical or across). */
  handle(x: number, y: number, z: number, vertical: boolean, len = 0.12): void {
    const m = mat(C.chrome, 0.3, 0.8);
    if (vertical) this.box(0.012, len, 0.02, x, y - len / 2, z + 0.01, m);
    else this.box(len, 0.012, 0.02, x, y, z + 0.01, m);
  }

  group(): THREE.Group {
    const g = new THREE.Group();
    for (const [m, list] of this.parts) {
      const merged = mergeGeometries(list);
      for (const p of list) p.dispose();
      if (!merged) continue;
      const mesh = new THREE.Mesh(merged, m);
      // A glow's halo neither casts nor takes shadows.
      const halo = !!m.userData["halo"];
      mesh.castShadow = !halo;
      mesh.receiveShadow = !halo;
      g.add(mesh);
    }
    return g;
  }
}

const num = (o: Opts, k: string, d: number): number => {
  const v = o[k];
  return typeof v === "number"
    ? v
    : typeof v === "string" && v !== "" && !isNaN(+v)
      ? +v
      : d;
};
const flag = (o: Opts, k: string): boolean => !!o[k];

type Builder = (m: Model, o: Opts, tint: string | null, item: Item3d) => void;

// --- seating ------------------------------------------------------------------

const sofa: Builder = (m, o, tint) => {
  const { W, D, H } = m;
  const fab = mat(tint ?? C.fabric, 0.95);
  const cush = mat(tint ? shade(tint, 1.08) : C.cushion, 0.95);
  const seats = Math.max(1, num(o, "seats", W > 1.6 ? 3 : W > 1.1 ? 2 : 1));
  const arm = flag(o, "noArms") ? 0 : Math.min(0.2, W * 0.14);
  const legH = 0.07;
  const seatY = Math.min(0.44, H * 0.52);
  const back = Math.min(0.24, D * 0.26);
  m.legs(W, D, legH, 0.05, 0.045, mat(C.woodDark), true);
  // The base, the arms and the back frame.
  m.soft(W, seatY - 0.12 - legH, D, 0, legH, 0, fab, 0.03);
  if (arm > 0)
    for (const s of [-1, 1])
      m.soft(
        arm,
        Math.min(H - 0.15, 0.64) - legH,
        D,
        s * (W / 2 - arm / 2),
        legH,
        0,
        fab,
        0.05,
      );
  m.soft(
    W - 2 * arm + 0.02,
    H - legH,
    back,
    0,
    legH,
    -D / 2 + back / 2,
    fab,
    0.05,
  );
  // Seat cushions, and back cushions leaning on the frame.
  const inner = W - 2 * arm;
  const cw = inner / seats;
  const seatD = D - back - 0.03;
  for (let k = 0; k < seats; k++) {
    const x = -inner / 2 + cw * (k + 0.5);
    m.soft(
      cw - 0.012,
      0.13,
      seatD,
      x,
      seatY - 0.12,
      -D / 2 + back + seatD / 2 + 0.01,
      cush,
      0.04,
    );
    m.soft(
      cw - 0.02,
      Math.max(0.2, H - seatY - 0.06),
      0.16,
      x,
      seatY,
      -D / 2 + back + 0.06,
      cush,
      0.05,
      -0.14,
    );
  }
};

const sectional: Builder = (m, o, tint) => {
  const { W, D, H } = m;
  const fab = mat(tint ?? C.fabric, 0.95);
  const cush = mat(tint ? shade(tint, 1.08) : C.cushion, 0.95);
  const sd = Math.min(D, num(o, "seatDepth", 95) / 100);
  const cw = Math.min(W, num(o, "chaise", 95) / 100);
  const legH = 0.07;
  const seatY = 0.44;
  const back = 0.22;
  const arm = 0.18;
  // Main run along the back, the chaise down the left.
  m.soft(W, seatY - 0.12 - legH, sd, 0, legH, -D / 2 + sd / 2, fab);
  m.soft(
    cw,
    seatY - 0.12 - legH,
    D - sd + 0.02,
    -W / 2 + cw / 2,
    legH,
    -D / 2 + sd + (D - sd) / 2 - 0.01,
    fab,
  );
  m.soft(W, H - legH, back, 0, legH, -D / 2 + back / 2, fab, 0.05);
  m.soft(
    back,
    H - legH,
    D - back,
    -W / 2 + back / 2,
    legH,
    -D / 2 + back + (D - back) / 2,
    fab,
    0.05,
  );
  m.soft(
    arm,
    0.64 - legH,
    sd,
    W / 2 - arm / 2,
    legH,
    -D / 2 + sd / 2,
    fab,
    0.05,
  );
  const seats = Math.max(1, num(o, "seats", 3));
  const runW = W - cw - arm;
  for (let k = 0; k < seats; k++) {
    const x = -W / 2 + cw + (runW / seats) * (k + 0.5);
    m.soft(
      runW / seats - 0.012,
      0.13,
      sd - back - 0.02,
      x,
      seatY - 0.12,
      -D / 2 + back + (sd - back) / 2,
      cush,
    );
    m.soft(
      runW / seats - 0.02,
      H - seatY - 0.06,
      0.16,
      x,
      seatY,
      -D / 2 + back + 0.06,
      cush,
      0.05,
      -0.14,
    );
  }
  m.soft(
    cw - back - 0.02,
    0.13,
    D - back - 0.02,
    -W / 2 + back + (cw - back) / 2,
    seatY - 0.12,
    -D / 2 + back + (D - back) / 2,
    cush,
  );
  m.legs(W, sd, legH, 0.05, 0.045, mat(C.woodDark), true, -D / 2 + sd / 2);
};

const upholsteredChair: Builder = (m, o, tint, item) =>
  sofa(m, { ...o, seats: 1 }, tint, item);

const chair: Builder = (m, o, tint, item) => {
  if (
    /armchair|accent|club|wingback|glider|recliner|slipper|lounge/.test(
      item.model?.kind ?? "",
    )
  )
    return upholsteredChair(m, o, tint, item);
  const { W, D, H } = m;
  const wood = mat(C.wood, 0.7);
  const seat = mat(tint ?? C.woodLight, 0.8);
  const seatY = Math.min(0.46, H * 0.52);
  const leg = 0.035;
  m.legs(W, D, seatY - 0.03, 0.02, leg, wood);
  m.soft(W, 0.04, D, 0, seatY - 0.04, 0, seat, 0.012);
  // Back: two posts, a top rail and slats.
  const top = Math.max(seatY + 0.3, H);
  for (const s of [-1, 1])
    m.box(
      leg,
      top - seatY,
      leg,
      s * (W / 2 - 0.02 - leg / 2),
      seatY,
      -D / 2 + 0.02 + leg / 2,
      wood,
    );
  m.box(W - 0.04, 0.08, 0.025, 0, top - 0.1, -D / 2 + 0.035, wood);
  for (let k = 1; k <= 3; k++)
    m.box(
      0.025,
      top - seatY - 0.12,
      0.018,
      -W / 2 + (W * k) / 4,
      seatY,
      -D / 2 + 0.035,
      wood,
    );
  if (flag(o, "arms"))
    for (const s of [-1, 1])
      m.box(
        0.04,
        0.03,
        D * 0.85,
        s * (W / 2 - 0.02),
        seatY + 0.2,
        -D * 0.05,
        wood,
      );
};

const deskChair: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  const dark = mat(C.charcoal, 0.6, 0.2);
  const fab = mat(tint ?? "#3d4148", 0.9);
  const r = Math.min(W, D) / 2;
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2;
    const g = new THREE.BoxGeometry(r * 0.95, 0.03, 0.04);
    g.translate(r * 0.47, 0.06, 0);
    g.rotateY(a);
    m.add(g, dark);
    m.sphere(
      0.025,
      Math.cos(a) * r * 0.92,
      0.025,
      -Math.sin(a) * r * 0.92,
      mat(C.rubber),
    );
  }
  m.cyl(0.025, 0.025, 0.36, 0, 0.07, 0, mat(C.chrome, 0.3, 0.8));
  m.soft(W * 0.9, 0.08, D * 0.8, 0, 0.43, 0.02, fab, 0.03);
  m.soft(
    W * 0.8,
    Math.max(0.35, H - 0.6),
    0.07,
    0,
    0.58,
    -D / 2 + 0.1,
    fab,
    0.03,
    -0.1,
  );
  for (const s of [-1, 1])
    m.box(0.04, 0.03, D * 0.45, s * (W / 2 - 0.04), 0.66, 0, dark);
};

const stool: Builder = (m, o, tint) => {
  const { W, D, H } = m;
  const metal = mat(C.charcoal, 0.5, 0.4);
  m.legs(W * 0.8, D * 0.8, H - 0.04, 0, 0.025, metal, true);
  m.oval(W / 2, D / 2, 0.05, 0, H - 0.05, 0, mat(tint ?? C.wood, 0.7));
  m.box(W * 0.7, 0.02, 0.02, 0, H * 0.35, D * 0.36, metal);
  if (flag(o, "back"))
    m.box(W * 0.8, 0.25, 0.03, 0, H, -D / 2 + 0.03, mat(tint ?? C.wood, 0.7));
};

const bench: Builder = (m, o, tint) => {
  const { W, D, H } = m;
  const wood = mat(C.wood, 0.7);
  const seatY = Math.min(H, 0.46);
  m.legs(W, D, seatY - 0.05, 0.04, 0.05, wood);
  if (tint) m.soft(W, 0.07, D, 0, seatY - 0.07, 0, mat(tint, 0.95), 0.025);
  else m.box(W, 0.05, D, 0, seatY - 0.05, 0, wood);
  if (flag(o, "back")) m.box(W, 0.4, 0.04, 0, seatY, -D / 2 + 0.03, wood, -0.1);
};

const ottoman: Builder = (m, o, tint, item) => {
  const { W, D, H } = m;
  const fab = mat(tint ?? C.fabric, 0.95);
  if (/round|pouf/.test(item.model?.kind ?? "") || item.model?.draw === "pouf")
    m.oval(W / 2, D / 2, H, 0, 0, 0, fab, (W / 2) * 0.95, (D / 2) * 0.95);
  else {
    m.legs(W, D, 0.06, 0.04, 0.04, mat(C.woodDark), true);
    m.soft(W, H - 0.06, D, 0, 0.06, 0, fab, 0.05);
  }
};

// --- beds -----------------------------------------------------------------------

const bed: Builder = (m, o, tint, item) => {
  const { W, D } = m;
  const frame = /frame/.test(item.model?.kind ?? "");
  const wood = mat(frame ? C.wood : C.fabric, 0.85);
  const head = frame ? mat(C.wood, 0.75) : mat(tint ?? C.fabric, 0.95);
  // A plinth, the frame, the mattress.
  m.box(W - 0.1, 0.1, D - 0.1, 0, 0, 0, mat(C.black));
  m.soft(W, 0.22, D - 0.06, 0, 0.1, 0.03, wood, frame ? 0.01 : 0.03);
  m.soft(W - 0.06, 0.24, D - 0.14, 0, 0.32, 0.05, mat(C.linen, 0.95), 0.05);
  // Headboard against the wall.
  m.soft(W + 0.04, 1.05, 0.08, 0, 0, -D / 2 + 0.04, head, frame ? 0.01 : 0.03);
  // Duvet over the lower two-thirds, folded back at its top.
  const duv = mat(tint && frame ? tint : C.duvet, 0.95);
  const dl = (D - 0.14) * 0.7;
  m.soft(W + 0.02, 0.07, dl, 0, 0.53, D / 2 - dl / 2 - 0.02, duv, 0.035);
  m.soft(
    W + 0.02,
    0.05,
    0.22,
    0,
    0.58,
    D / 2 - dl - 0.06,
    mat(C.pillow, 0.95),
    0.025,
  );
  for (const s of [-1, 1])
    m.soft(
      0.03,
      0.3,
      dl,
      s * (W / 2 + 0.005),
      0.28,
      D / 2 - dl / 2 - 0.02,
      duv,
      0.012,
    );
  // Pillows at the head.
  const n = Math.max(1, num(o, "pillows", W >= 1.2 ? 2 : 1));
  const pw = Math.min(0.72, (W - 0.12) / n - 0.04);
  for (let k = 0; k < n; k++) {
    const x = -((n - 1) * (pw + 0.04)) / 2 + k * (pw + 0.04);
    m.soft(
      pw,
      0.13,
      0.4,
      x,
      0.56,
      -D / 2 + 0.3,
      mat(C.pillow, 0.95),
      0.06,
      -0.25,
    );
  }
};

// --- tables and desks -------------------------------------------------------

const table: Builder = (m, o, tint, item) => {
  const { W, D, H } = m;
  const kind = item.model?.kind ?? "";
  const top = mat(
    tint ?? (flag(o, "glass") ? C.glass : C.wood),
    flag(o, "glass") ? 0.1 : 0.6,
    0,
    flag(o, "glass") ? { opacity: 0.5 } : undefined,
  );
  const legM = mat(C.woodDark, 0.7);
  const round = item.model?.draw === "roundTable" || /round|oval/.test(kind);
  const t = 0.04;
  // Chairs drawn with it (a dining set): a chair at each place.
  const places = [
    ["top", num(o, "top", 0)],
    ["bottom", num(o, "bottom", 0)],
    ["left", num(o, "left", 0)],
    ["right", num(o, "right", 0)],
  ] as const;
  const hasChairs = places.some(([, n]) => n > 0);
  const tw = hasChairs
    ? W - (num(o, "left", 0) || num(o, "right", 0) ? 0.9 : 0)
    : W;
  const td = hasChairs
    ? D - (num(o, "top", 0) || num(o, "bottom", 0) ? 0.9 : 0)
    : D;
  const tableH = hasChairs ? 0.75 : H;
  if (round) {
    m.oval(tw / 2, td / 2, t, 0, tableH - t, 0, top);
    m.cyl(0.05, 0.06, tableH - t, 0, 0, 0, legM, 12);
    m.oval(
      Math.min(tw, td) * 0.22,
      Math.min(tw, td) * 0.22,
      0.03,
      0,
      0,
      0,
      legM,
    );
  } else {
    m.box(tw, t, td, 0, tableH - t, 0, top);
    m.legs(tw, td, tableH - t, 0.05, 0.06, legM);
    if (tableH < 0.6 && !flag(o, "glass"))
      m.box(tw - 0.12, 0.02, td - 0.12, 0, 0.12, 0, legM);
  }
  if (!hasChairs) return;
  for (const [side, n] of places) {
    for (let k = 0; k < n; k++) {
      const along = side === "top" || side === "bottom" ? tw : td;
      const f = (k + 0.5) / n;
      const p = -along / 2 + along * f;
      const gap = 0.12;
      const [x, z, a] =
        side === "top"
          ? [p, -td / 2 - gap, 0]
          : side === "bottom"
            ? [p, td / 2 + gap, Math.PI]
            : side === "left"
              ? [-tw / 2 - gap, p, -Math.PI / 2]
              : [tw / 2 + gap, p, Math.PI / 2];
      addChairAt(m, x, z, a, tint);
    }
  }
};

/** A dining chair at a spot, facing the table (turned by `a`). */
function addChairAt(
  m: Model,
  x: number,
  z: number,
  a: number,
  tint: string | null,
): void {
  const sub = new Model(0.44, 0.48, 0.9, false);
  chair(sub, {}, tint, { model: { kind: "dining_chair" } } as Item3d);
  // Re-home its parts: turned to face the table, at the spot.
  const parts = (
    sub as unknown as { parts: Map<THREE.Material, THREE.BufferGeometry[]> }
  ).parts;
  for (const [mt, list] of parts)
    for (const g of list) {
      g.rotateY(a + Math.PI);
      g.translate(x, 0, z);
      m.add(g, mt);
    }
}

const desk: Builder = (m, o, tint) => {
  const { W, D, H } = m;
  const top = mat(tint ?? C.woodLight, 0.6);
  const frame = mat(C.charcoal, 0.5, 0.3);
  const h = Math.min(H, 0.76);
  m.box(W, 0.03, D, 0, h - 0.03, 0, top);
  for (const s of [-1, 1]) {
    m.box(0.04, h - 0.03, 0.04, s * (W / 2 - 0.05), 0, -D / 2 + 0.06, frame);
    m.box(0.04, h - 0.03, 0.04, s * (W / 2 - 0.05), 0, D / 2 - 0.06, frame);
    m.box(0.04, 0.04, D - 0.12, s * (W / 2 - 0.05), 0.04, 0, frame);
  }
  if (flag(o, "drawers") || W > 1.1) {
    const pw = Math.min(0.42, W * 0.3);
    m.box(
      pw,
      h - 0.06,
      D - 0.08,
      W / 2 - pw / 2 - 0.08,
      0,
      0,
      mat(C.paint, 0.8),
    );
    for (let k = 0; k < 3; k++)
      m.handle(
        W / 2 - pw / 2 - 0.08,
        h - 0.12 - (k * (h - 0.06)) / 3,
        D / 2 - 0.04,
        false,
        0.1,
      );
  }
  if (flag(o, "monitor")) {
    m.box(0.6, 0.36, 0.03, 0, h + 0.12, -D / 2 + 0.15, mat(C.screen, 0.2));
    m.box(0.05, 0.12, 0.05, 0, h, -D / 2 + 0.15, frame);
  }
};

const counterTop = (
  m: Model,
  w: number,
  d: number,
  h: number,
  z: number,
  top: THREE.Material,
) => m.box(w + 0.02, 0.04, d + 0.03, 0, h - 0.04, z + 0.015, top);

// --- storage ----------------------------------------------------------------

/** A carcass with doors, drawers or both on its front. */
function casework(
  m: Model,
  opts: {
    w: number;
    h: number;
    d: number;
    y?: number;
    z?: number;
    body: THREE.Material;
    front: THREE.Material;
    doors?: number;
    drawers?: number;
    drawerCols?: number;
    plinth?: number;
    glass?: boolean;
  },
): void {
  const { w, h, d, body, front } = opts;
  const y = opts.y ?? 0;
  const z = opts.z ?? 0;
  const plinth = opts.plinth ?? 0.08;
  m.box(w - 0.04, plinth, d - 0.06, 0, y, z - 0.02, mat(C.charcoal, 0.8));
  m.box(w, h - plinth, d - 0.02, 0, y + plinth, z - 0.01, body);
  const fz = z + d / 2 - 0.01;
  const gap = 0.004;
  const fh = h - plinth;
  const drawers = opts.drawers ?? 0;
  const dh = drawers ? Math.min(fh, drawers * 0.2) : 0;
  const cols = opts.drawerCols ?? 1;
  // Drawers on top, doors below.
  for (let c = 0; c < cols; c++)
    for (let k = 0; k < drawers; k++) {
      const cw = w / cols;
      const x = -w / 2 + cw * (c + 0.5);
      const rowH = dh / drawers;
      const top = y + h - k * rowH;
      m.box(cw - gap * 2, rowH - gap * 2, 0.02, x, top - rowH + gap, fz, front);
      m.handle(x, top - rowH / 2, fz + 0.01, false, Math.min(0.14, cw * 0.4));
    }
  const doors = opts.doors ?? 0;
  if (doors > 0 && fh - dh > 0.05) {
    const dw = w / doors;
    const doorH = fh - dh;
    for (let k = 0; k < doors; k++) {
      const x = -w / 2 + dw * (k + 0.5);
      if (opts.glass) {
        const fr = front;
        m.box(dw - gap * 2, 0.05, 0.02, x, y + plinth + gap, fz, fr);
        m.box(
          dw - gap * 2,
          0.05,
          0.02,
          x,
          y + plinth + doorH - 0.05 - gap,
          fz,
          fr,
        );
        for (const s of [-1, 1])
          m.box(
            0.05,
            doorH - gap * 2,
            0.02,
            x + s * (dw / 2 - 0.025 - gap),
            y + plinth + gap,
            fz,
            fr,
          );
        m.box(
          dw - 0.1,
          doorH - 0.1,
          0.006,
          x,
          y + plinth + 0.05,
          fz,
          mat(C.glass, 0.1, 0, { opacity: 0.45 }),
        );
      } else
        m.box(
          dw - gap * 2,
          doorH - gap * 2,
          0.02,
          x,
          y + plinth + gap,
          fz,
          front,
        );
      // Handles where the doors meet (or at the free edge of one).
      const hx =
        doors === 1
          ? x + dw / 2 - 0.05
          : k % 2 === 0
            ? x + dw / 2 - 0.05
            : x - dw / 2 + 0.05;
      const hy =
        y +
        plinth +
        Math.min(doorH - 0.08, doorH > 1.2 ? 1.0 - y : doorH - 0.1);
      m.handle(hx, hy, fz + 0.01, true, doorH > 1.2 ? 0.3 : 0.12);
    }
  }
}

const cabinet: Builder = (m, o, tint, item) => {
  const { W, D, H } = m;
  const kind = item.model?.kind ?? "";
  const paint = /garage|tool|metal/.test(kind)
    ? mat(tint ?? "#6d7378", 0.55, 0.3)
    : /bar|entertain|media|buffet|sideboard|credenza|display|curio|china/.test(
          kind,
        )
      ? mat(tint ?? C.woodDark, 0.6)
      : mat(tint ?? C.paint, 0.75);
  const doors = Math.max(1, num(o, "doors", Math.max(1, Math.round(W / 0.5))));
  casework(m, {
    w: W,
    h: H,
    d: D,
    body: paint,
    front: paint,
    doors,
    drawers: /base_cabinet|kitchen/.test(kind) ? 1 : 0,
    glass: /display|curio|china/.test(kind),
    plinth: H > 1.5 ? 0.06 : 0.08,
  });
  if (/base_cabinet/.test(kind))
    counterTop(m, W, D, H + 0.04, 0, mat(C.stone, 0.4));
  // Bottles on a bar cabinet; a crown on tall ones.
  if (H > 1.6) m.box(W + 0.03, 0.04, D + 0.02, 0, H, 0, paint);
};

const drawers: Builder = (m, o, tint) => {
  const { W, D, H } = m;
  const body = mat(tint ?? C.wood, 0.65);
  const rows = Math.max(2, Math.round((H - 0.08) / 0.2));
  const cols = Math.max(1, num(o, "cols", Math.max(1, Math.round(W / 0.6))));
  m.legs(W, D, 0.08, 0.03, 0.04, mat(C.woodDark));
  m.box(W, H - 0.08, D - 0.02, 0, 0.08, -0.01, body);
  const gap = 0.004;
  const rowH = (H - 0.1) / rows;
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++) {
      const cw = W / cols;
      const x = -W / 2 + cw * (c + 0.5);
      const y = 0.09 + r * rowH;
      m.box(
        cw - gap * 2 - 0.02,
        rowH - gap * 2,
        0.02,
        x,
        y + gap,
        D / 2 - 0.01,
        mat(tint ? shade(tint, 1.06) : C.woodLight, 0.6),
      );
      m.handle(x, y + rowH / 2, D / 2, false, Math.min(0.12, cw * 0.35));
    }
};

const wardrobe: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  const body = mat(tint ?? C.paint, 0.75);
  const doors = Math.max(2, Math.round(W / 0.5));
  casework(m, {
    w: W,
    h: H - 0.04,
    d: D,
    body,
    front: body,
    doors,
    plinth: 0.06,
  });
  m.box(W + 0.03, 0.04, D + 0.02, 0, H - 0.04, 0, body);
};

const shelf: Builder = (m, o, tint, item) => {
  const { W, D, H } = m;
  const kind = item.model?.kind ?? "";
  const metal = /garage|shelving|metal|utility|wire/.test(kind);
  const frame = metal
    ? mat("#4a4f55", 0.5, 0.5)
    : mat(tint ?? (/office/.test(kind) ? C.woodDark : C.paint), 0.7);
  const t = metal ? 0.03 : 0.02;
  const levels = Math.max(2, Math.round(H / (metal ? 0.45 : 0.35)));
  if (metal) {
    for (const sx of [-1, 1])
      for (const sz of [-1, 1])
        m.box(
          0.035,
          H,
          0.035,
          sx * (W / 2 - 0.018),
          0,
          sz * (D / 2 - 0.018),
          frame,
        );
  } else {
    for (const s of [-1, 1]) m.box(t, H, D, s * (W / 2 - t / 2), 0, 0, frame);
    m.box(W, H, 0.008, 0, 0, -D / 2 + 0.004, frame);
  }
  let seed = Math.round(W * 1000 + H * 37);
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let k = 0; k <= levels; k++) {
    const y = Math.min(H - t, 0.08 + ((H - 0.12) * k) / levels);
    m.box(
      W - (metal ? 0 : 2 * t),
      t,
      D - 0.01,
      0,
      y,
      0,
      metal ? mat("#8a8f95", 0.6, 0.3) : frame,
    );
    if (k === levels) break;
    const space = (H - 0.12) / levels - t - 0.02;
    if (metal) {
      // Storage bins.
      const bins = Math.max(1, Math.floor(W / 0.45));
      for (let b = 0; b < bins; b++) {
        if (rand() < 0.45) continue;
        const bw = W / bins - 0.1;
        const bh = Math.min(space - 0.04, 0.22 + rand() * 0.06);
        m.box(
          bw,
          bh,
          D - 0.16,
          -W / 2 + (W / bins) * (b + 0.5),
          y + t,
          0,
          mat(
            ["#3d5a80", "#2f2f2f", "#6b8f71", "#c9a227"][
              Math.floor(rand() * 4)
            ]!,
            0.7,
          ),
        );
      }
    } else {
      // Books.
      let x = -W / 2 + t + 0.02;
      while (x < W / 2 - t - 0.05) {
        const bw = 0.02 + rand() * 0.03;
        if (rand() < 0.12) {
          x += 0.08;
          continue;
        }
        const bh = Math.min(space, 0.18 + rand() * 0.1);
        m.box(
          bw,
          bh,
          D * 0.75,
          x + bw / 2,
          y + t,
          D * 0.05,
          mat(
            [
              "#7b2d26",
              "#2e4a62",
              "#3f5f3a",
              "#c9b38a",
              "#5a4a6b",
              "#d9d4c7",
              "#1f1f1f",
            ][Math.floor(rand() * 7)]!,
            0.8,
          ),
        );
        x += bw + 0.002;
      }
    }
  }
};

const chest: Builder = (m, _o, tint, item) => {
  const { W, D, H } = m;
  const body = mat(tint ?? C.wood, 0.7);
  m.box(W, H - 0.03, D, 0, 0, 0, body);
  m.box(
    W + 0.02,
    0.03,
    D + 0.02,
    0,
    H - 0.03,
    0,
    mat(tint ? shade(tint, 0.9) : C.woodDark, 0.7),
  );
  if (/bench/.test(item.model?.kind ?? ""))
    m.soft(W - 0.02, 0.06, D - 0.02, 0, H, 0, mat(C.fabric, 0.95), 0.025);
};

const tvStand: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  const body = mat(tint ?? C.woodDark, 0.6);
  m.legs(W, D, 0.1, 0.05, 0.04, mat(C.black));
  casework(m, {
    w: W,
    h: Math.max(0.4, H - 0.1),
    d: D,
    y: 0.1,
    body,
    front: mat(tint ? shade(tint, 1.1) : C.wood, 0.6),
    doors: Math.max(2, Math.round(W / 0.5)),
    plinth: 0.01,
  });
};

// --- kitchen ----------------------------------------------------------------

const fridge: Builder = (m, o, tint, item) => {
  const { W, D, H } = m;
  const steel = mat(tint ?? C.steel, 0.35, 0.6);
  const kind = item.model?.kind ?? "";
  m.box(W, H, D - 0.03, 0, 0, -0.015, steel);
  const fz = D / 2 - 0.02;
  const gap = 0.006;
  if (/french|side_by_side/.test(kind) || num(o, "doors", 1) >= 2) {
    const split = /side_by_side/.test(kind) ? 0 : H * 0.35;
    for (const s of [-1, 1]) {
      m.box(
        W / 2 - gap,
        H - split - gap * 2,
        0.03,
        (s * W) / 4,
        split + gap,
        fz,
        steel,
      );
      m.handle(
        -s * 0.03,
        H - 0.15,
        fz + 0.02,
        true,
        Math.min(0.9, H - split - 0.3),
      );
    }
    if (split) {
      m.box(W - gap * 2, split - gap * 2, 0.03, 0, gap, fz, steel);
      m.handle(0, split - 0.08, fz + 0.02, false, W * 0.6);
    }
  } else {
    const split = /bottom/.test(kind) ? H * 0.32 : H * 0.7;
    m.box(W - gap * 2, split - gap * 2, 0.03, 0, gap, fz, steel);
    m.box(W - gap * 2, H - split - gap * 2, 0.03, 0, split + gap, fz, steel);
    m.handle(
      W / 2 - 0.06,
      split - 0.05,
      fz + 0.02,
      true,
      Math.min(0.6, split - 0.2),
    );
    m.handle(
      W / 2 - 0.06,
      H - 0.06,
      fz + 0.02,
      true,
      Math.min(0.5, H - split - 0.2),
    );
  }
};

const range: Builder = (m, o, tint) => {
  const { W, D } = m;
  const steel = mat(tint ?? C.steel, 0.35, 0.6);
  const h = 0.9;
  m.box(W, h - 0.03, D - 0.02, 0, 0, 0, steel);
  m.box(W, 0.03, D - 0.02, 0, h - 0.03, 0, mat(C.black, 0.15));
  const n = num(o, "burners", 4);
  const cols = n > 4 ? 3 : 2;
  const rows = 2;
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++)
      m.cyl(
        0.08,
        0.08,
        0.008,
        -W / 2 + (W / cols) * (c + 0.5),
        h,
        -D / 2 + (D / rows) * (r + 0.5),
        mat("#4a4a4a", 0.4, 0.4),
        20,
      );
  m.box(W * 0.8, 0.4, 0.02, 0, 0.15, D / 2 - 0.01, mat(C.screen, 0.1));
  m.handle(0, 0.62, D / 2, false, W * 0.75);
  for (let k = 0; k < 5; k++)
    m.cyl(
      0.018,
      0.018,
      0.025,
      -W * 0.35 + (W * 0.7 * k) / 4,
      0.76,
      D / 2,
      mat(C.black, 0.4),
      12,
      "z",
    );
  if (!flag(o, "noBack")) m.box(W, 0.12, 0.04, 0, h, -D / 2 + 0.02, steel);
};

const hood: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  const steel = mat(tint ?? C.steel, 0.35, 0.6);
  // The canopy (y from the item's mount) and a chimney up to the ceiling.
  const g = new THREE.CylinderGeometry(0.5, 1, 1, 4, 1);
  g.rotateY(Math.PI / 4);
  g.scale(W / Math.SQRT2, Math.min(H, 0.3), D / Math.SQRT2);
  g.translate(0, Math.min(H, 0.3) / 2, 0);
  m.add(g, steel);
  m.box(
    W * 0.35,
    1.2,
    D * 0.45,
    0,
    Math.min(H, 0.3),
    -D / 2 + D * 0.225,
    steel,
  );
};

const sink: Builder = (m, o, tint, item) => {
  const { W, D } = m;
  const h = 0.9;
  const kind = item.model?.kind ?? "";
  if (/laundry|utility/.test(kind)) {
    const tub = mat(tint ?? C.porcelain, 0.4);
    m.legs(W, D, h - 0.35, 0.03, 0.04, mat(C.steel, 0.4, 0.5));
    basin(m, W, D, 0.35, h - 0.35, 0, tub);
    faucet(m, 0, h, -D / 2 + 0.05);
    return;
  }
  const body = mat(tint ?? C.paint, 0.75);
  casework(m, { w: W, h: h - 0.04, d: D, body, front: body, doors: 2 });
  counterTop(m, W, D, h, 0, mat(C.stone, 0.4));
  const n = num(o, "basins", 1);
  for (let k = 0; k < n; k++) {
    const bw = (W - 0.15) / n - 0.04;
    m.box(
      bw,
      0.006,
      D - 0.25,
      -W / 2 + 0.075 + ((W - 0.15) / n) * (k + 0.5),
      h,
      0.04,
      mat("#9aa0a6", 0.25, 0.6),
    );
  }
  faucet(m, 0, h, -D / 2 + 0.07);
};

/** A hollow basin (a tub, a sink) standing at y. */
function basin(
  m: Model,
  w: number,
  d: number,
  h: number,
  y: number,
  z: number,
  mt: THREE.Material,
  wall = 0.04,
): void {
  m.box(w, 0.03, d, 0, y, z, mt);
  for (const s of [-1, 1]) {
    m.box(wall, h, d, s * (w / 2 - wall / 2), y, z, mt);
    m.box(w - 2 * wall, h, wall, 0, y, z + s * (d / 2 - wall / 2), mt);
  }
  m.box(w - 2 * wall, 0.005, d - 2 * wall, 0, y + 0.03, z, mat("#d9dde0", 0.3));
}

function faucet(m: Model, x: number, y: number, z: number): void {
  const chrome = mat(C.chrome, 0.2, 0.9);
  m.cyl(0.02, 0.025, 0.22, x, y, z, chrome, 12);
  m.cyl(0.012, 0.012, 0.14, x, y + 0.21, z + 0.07, chrome, 10, "z");
}

const counter: Builder = (m, _o, tint) => {
  const { W, D } = m;
  const body = mat(tint ?? C.paint, 0.75);
  casework(m, {
    w: W,
    h: 0.86,
    d: D,
    body,
    front: body,
    doors: Math.max(1, Math.round(W / 0.5)),
    drawers: 1,
  });
  counterTop(m, W, D, 0.9, 0, mat(C.stone, 0.4));
};

const island: Builder = (m, o, tint) => {
  const { W, D } = m;
  const body = mat(tint ?? "#4c5a67", 0.7);
  const seats = num(o, "seats", 0);
  const bd = seats ? D - 0.3 : D;
  casework(m, {
    w: W,
    h: 0.86,
    d: bd,
    z: -(D - bd) / 2,
    body,
    front: body,
    doors: Math.max(2, Math.round(W / 0.5)),
    drawers: 1,
  });
  m.box(W + 0.04, 0.04, D + 0.02, 0, 0.86, 0, mat(C.stone, 0.4));
  if (flag(o, "sink")) faucet(m, 0, 0.9, -D / 2 + 0.1);
};

const dishwasher: Builder = (m, _o, tint) => {
  const { W, D } = m;
  const steel = mat(tint ?? C.steel, 0.35, 0.6);
  m.box(W, 0.86, D, 0, 0, 0, steel);
  m.handle(0, 0.76, D / 2, false, W * 0.75);
};

const appliance: Builder = (m, _o, tint, item) => {
  const { W, D, H } = m;
  const steel = mat(tint ?? C.steel, 0.35, 0.6);
  m.box(W, H, D, 0, 0, 0, steel);
  const kind = item.model?.kind ?? "";
  const ovens = /double/.test(kind) ? 2 : 1;
  for (let k = 0; k < ovens; k++) {
    const oh = H / ovens;
    m.box(
      W * 0.78,
      oh * 0.55,
      0.01,
      0,
      k * oh + oh * 0.18,
      D / 2,
      mat(C.screen, 0.1),
    );
    m.handle(0, k * oh + oh * 0.82, D / 2 + 0.01, false, W * 0.7);
  }
};

// --- bathroom ------------------------------------------------------------------

const toilet: Builder = (m, o, tint) => {
  const { W, D } = m;
  const p = mat(tint ?? C.porcelain, 0.25);
  const tankD = Math.min(0.2, D * 0.27);
  if (!flag(o, "wallHung"))
    m.soft(W * 0.95, 0.38, tankD, 0, 0.42, -D / 2 + tankD / 2, p, 0.02);
  else
    m.box(W * 0.7, 0.25, 0.04, 0, 0.9, -D / 2 + 0.02, mat(C.chrome, 0.3, 0.6));
  const bowlD = D - tankD + 0.02;
  const bz = -D / 2 + tankD + bowlD / 2 - 0.02;
  if (!flag(o, "wallHung"))
    m.oval(
      W * 0.22,
      bowlD * 0.28,
      0.3,
      0,
      0,
      bz - 0.03,
      p,
      W * 0.32,
      bowlD * 0.36,
    );
  m.oval(W * 0.5, bowlD * 0.5, 0.1, 0, 0.3, bz, p, W * 0.48, bowlD * 0.48);
  m.oval(W * 0.48, bowlD * 0.48, 0.03, 0, 0.4, bz, mat(C.porcelain, 0.3));
};

const bathtub: Builder = (m, o, tint) => {
  const { W, D } = m;
  const p = mat(tint ?? C.porcelain, 0.25);
  if (flag(o, "free") || flag(o, "claw")) {
    m.oval(W / 2, D / 2, 0.55, 0, 0.08, 0, p, (W / 2) * 1.02, (D / 2) * 1.02);
    m.oval(W / 2 - 0.06, D / 2 - 0.06, 0.005, 0, 0.6, 0, mat("#d9dde0", 0.3));
    if (flag(o, "claw"))
      m.legs(W * 0.8, D * 0.7, 0.08, 0, 0.05, mat(C.chrome, 0.3, 0.8), true);
  } else {
    basin(m, W, D, 0.55, 0, 0, p, 0.08);
  }
  faucet(m, 0, 0.55, -D / 2 + 0.05);
};

const vanity: Builder = (m, o, tint) => {
  const { W, D } = m;
  const body = mat(tint ?? C.paint, 0.75);
  const h = 0.86;
  const w = W;
  casework(m, {
    w,
    h: h - 0.03,
    d: D,
    body,
    front: body,
    doors: Math.max(2, Math.round(W / 0.45)),
    drawers: W > 1.0 ? 1 : 0,
    drawerCols: Math.max(1, Math.round(W / 0.6)),
  });
  m.box(W + 0.02, 0.03, D + 0.02, 0, h - 0.03, 0.01, mat(C.stone, 0.35));
  const n = Math.max(1, num(o, "basins", W >= 1.1 ? 2 : 1));
  for (let k = 0; k < n; k++) {
    const x = -W / 2 + (W / n) * (k + 0.5);
    if (flag(o, "rect"))
      m.box(
        Math.min(0.5, W / n - 0.15),
        0.006,
        D - 0.2,
        x,
        h,
        0.04,
        mat("#d9dde0", 0.3),
      );
    else
      m.oval(
        Math.min(0.22, W / n / 2 - 0.08),
        (D - 0.2) / 2,
        0.006,
        x,
        h,
        0.04,
        mat("#d9dde0", 0.3),
      );
    faucet(m, x, h, -D / 2 + 0.06);
  }
};

const washer: Builder = (m, o, tint) => {
  const { W, D } = m;
  const white = mat(tint ?? "#f4f4f2", 0.4);
  const h = 0.86;
  m.soft(W, h, D, 0, 0, 0, white, 0.02);
  m.box(W, 0.1, 0.03, 0, h - 0.1, -D / 2 + 0.015, mat("#dcdcdc", 0.5));
  if (flag(o, "top")) {
    m.box(W * 0.8, 0.01, D * 0.6, 0, h, 0.04, mat("#e6e6e6", 0.4));
  } else {
    m.cyl(
      0.2,
      0.2,
      0.02,
      0,
      0.45,
      D / 2 + 0.005,
      mat(C.chrome, 0.3, 0.7),
      28,
      "z",
    );
    m.cyl(
      0.16,
      0.16,
      0.025,
      0,
      0.45,
      D / 2 + 0.01,
      mat(flag(o, "dryer") ? "#2b2b2b" : "#304a5e", 0.1, 0, { opacity: 0.85 }),
      28,
      "z",
    );
    m.box(W * 0.3, 0.06, 0.01, -W * 0.25, h - 0.1, D / 2, mat(C.black, 0.3));
  }
};

// --- equipment and machines ------------------------------------------------------

const treadmill: Builder = (m, _o, tint) => {
  const { W, D } = m;
  const frame = mat(tint ?? C.charcoal, 0.5, 0.3);
  m.box(W, 0.18, D, 0, 0, 0, frame);
  m.box(W * 0.62, 0.012, D * 0.86, 0, 0.18, 0.04, mat(C.rubber, 0.9));
  for (const s of [-1, 1])
    m.box(
      0.05,
      1.2,
      0.06,
      s * (W / 2 - 0.04),
      0.18,
      -D / 2 + 0.12,
      frame,
      -0.12,
    );
  m.box(W * 0.9, 0.3, 0.12, 0, 1.25, -D / 2 + 0.2, frame, -0.5);
  for (const s of [-1, 1])
    m.box(0.04, 0.04, 0.4, s * (W / 2 - 0.04), 1.05, -D / 2 + 0.38, frame);
};

const workbench: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  const wood = mat(tint ?? C.woodLight, 0.7);
  const h = Math.min(H, 0.9);
  m.box(W, 0.06, D, 0, h - 0.06, 0, wood);
  m.legs(W, D, h - 0.06, 0.04, 0.07, mat(C.wood, 0.7));
  m.box(W - 0.1, 0.03, D - 0.1, 0, 0.18, 0, wood);
  m.box(W, 0.9, 0.02, 0, h, -D / 2 + 0.01, mat("#c9b18a", 0.8));
};

const tank: Builder = (m, _o, tint, item) => {
  const { W, D, H } = m;
  const kind = item.model?.kind ?? "";
  const blue = mat(tint ?? "#2f5f8a", 0.5);
  if (/softener/.test(kind)) {
    m.cyl(
      D * 0.4,
      D * 0.4,
      Math.min(H, 1.2),
      -W / 2 + D * 0.45,
      0,
      0,
      blue,
      20,
    );
    m.box(
      W - D * 0.9,
      Math.min(H, 0.9) * 0.8,
      D * 0.9,
      W / 2 - (W - D * 0.9) / 2 - 0.02,
      0,
      0,
      mat("#e9e9e6", 0.5),
    );
    m.cyl(
      0.07,
      0.07,
      0.12,
      -W / 2 + D * 0.45,
      Math.min(H, 1.2),
      0,
      mat(C.black, 0.5),
      12,
    );
  } else {
    const n = Math.max(1, Math.round(W / Math.max(0.2, D)));
    for (let k = 0; k < n; k++)
      m.cyl(
        Math.min(D, W / n) * 0.42,
        Math.min(D, W / n) * 0.42,
        Math.min(H, 1.3),
        -W / 2 + (W / n) * (k + 0.5),
        0,
        0,
        blue,
        20,
      );
  }
};

const waterHeater: Builder = (m, _o, tint) => {
  const { W, H } = m;
  const r = W / 2;
  m.cyl(r, r, H - 0.05, 0, 0, 0, mat(tint ?? "#ececea", 0.45), 28);
  m.cyl(r * 0.96, r, 0.05, 0, H - 0.05, 0, mat("#cfcfcd", 0.45), 28);
  for (const s of [-1, 1])
    m.cyl(0.015, 0.015, 0.3, s * r * 0.4, H, 0, mat("#b87333", 0.3, 0.8), 8);
};

const furnace: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  const steel = mat(tint ?? "#c9c6bf", 0.5, 0.2);
  m.box(W, H, D, 0, 0, 0, steel);
  for (let k = 0; k < 2; k++)
    m.box(
      W - 0.04,
      H / 2 - 0.03,
      0.01,
      0,
      0.02 + k * (H / 2),
      D / 2,
      mat("#d6d3cc", 0.5, 0.2),
    );
  m.box(W * 0.8, 0.5, D * 0.8, 0, H, 0, mat("#9e9b95", 0.5, 0.4));
};

const car: Builder = (m, _o, tint) => {
  const { W, D } = m;
  const paint = mat(tint ?? "#8d969e", 0.3, 0.6);
  const glass = mat("#33475a", 0.05, 0.4);
  const trim = mat(C.black, 0.6);
  const wheel = mat(C.rubber, 0.9);
  const hub = mat(C.chrome, 0.3, 0.8);
  const len = D;
  const wr = 0.34;
  // Lower body and sills (front at +z).
  m.soft(W, 0.5, len, 0, 0.22, 0, paint, 0.08);
  m.box(W + 0.01, 0.14, len - 0.1, 0, 0.18, 0, trim);
  // The glasshouse, set back from the bonnet, and its roof.
  const cl = len * 0.48;
  const cz = -len * 0.05;
  m.soft(W * 0.84, 0.46, cl, 0, 0.7, cz, glass, 0.08);
  m.soft(W * 0.86, 0.05, cl * 0.82, 0, 1.15, cz - 0.05, paint, 0.02);
  for (const s of [-1, 1])
    m.box(0.04, 0.46, 0.08, s * W * 0.42, 0.7, cz + cl / 2 - 0.12, paint);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const z = sz * len * 0.31;
      m.cyl(wr, wr, 0.23, sx * (W / 2 - 0.11), wr, z, wheel, 24, "x");
      m.cyl(wr * 0.6, wr * 0.6, 0.24, sx * (W / 2 - 0.11), wr, z, hub, 18, "x");
    }
  const lamp = mat("#f5f3e8", 0.2, 0, { glow: "#ffffff", glowLevel: 0.15 });
  for (const s of [-1, 1]) {
    m.box(0.26, 0.07, 0.03, s * W * 0.32, 0.6, len / 2 - 0.01, lamp);
    m.box(
      0.26,
      0.07,
      0.03,
      s * W * 0.32,
      0.62,
      -len / 2 + 0.01,
      mat("#9b1c1c", 0.3),
    );
  }
  m.box(W * 0.4, 0.12, 0.02, 0, 0.36, len / 2, trim);
};

/** A tapered box (wider at the top), standing on y. */
function taper(
  m: Model,
  wBot: number,
  dBot: number,
  wTop: number,
  dTop: number,
  h: number,
  x: number,
  y: number,
  z: number,
  material: THREE.Material,
): void {
  const g = new THREE.CylinderGeometry(Math.SQRT1_2, Math.SQRT1_2, h, 4, 1);
  g.rotateY(Math.PI / 4);
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const top = pos.getY(i) > 0;
    pos.setX(i, pos.getX(i) * (top ? wTop : wBot));
    pos.setZ(i, pos.getZ(i) * (top ? dTop : dBot));
  }
  g.computeVertexNormals();
  g.translate(x, y + h / 2, z);
  m.add(g, material);
}

/** A rolling cart for rubbish or recycling (front at +z): a tapered body,
 * a flip lid hinged at the back (`lid`, its colour), the handle and two
 * wheels at the back. */
const wheelieBin: Builder = (m, o, tint) => {
  const { W, D, H } = m;
  const body = mat(tint ?? "#30353a", 0.7);
  const lid = mat(typeof o["lid"] === "string" ? o["lid"] : "#2a2e32", 0.6);
  const rubber = mat(C.rubber, 0.9);
  const wr = Math.min(0.15, H * 0.14);
  const lidH = 0.045;
  const top = H - lidH;
  // The body, its back a little in from the wheels.
  taper(m, W * 0.8, D * 0.72, W * 0.94, D * 0.9, top, 0, 0.03, 0.02, body);
  // A rim under the lid, and the lid itself, a touch proud all round.
  m.box(W * 0.96, 0.03, D * 0.92, 0, top - 0.03, 0.02, body);
  m.soft(W, lidH, D * 0.96, 0, top, 0.01, lid, 0.015);
  m.box(W * 0.3, 0.025, 0.04, 0, top + 0.005, D * 0.49, lid);
  // Handle bar across the back, on two lugs.
  const hz = -D / 2 + 0.03;
  m.cyl(0.018, 0.018, W * 0.86, 0, top - 0.06, hz, body, 10, "x");
  for (const s of [-1, 1])
    m.box(0.04, 0.12, 0.06, s * W * 0.4, top - 0.14, hz + 0.03, body);
  // Wheels and axle at the back; a foot at the front.
  const wz = -D / 2 + wr * 0.9;
  for (const s of [-1, 1]) {
    m.cyl(wr, wr, 0.06, s * (W / 2 - 0.04), wr, wz, rubber, 18, "x");
    m.cyl(
      wr * 0.45,
      wr * 0.45,
      0.065,
      s * (W / 2 - 0.04),
      wr,
      wz,
      body,
      12,
      "x",
    );
  }
  m.cyl(0.012, 0.012, W - 0.1, 0, wr, wz, mat(C.steel, 0.4, 0.7), 8, "x");
  m.box(W * 0.6, 0.04, 0.06, 0, 0, D * 0.36, body);
};

/** A gate (front at +z): one leaf, or two meeting in the middle
 * (`leaves`), standing a little off the ground. `style` "hog" is a wood
 * frame with a Z brace over welded wire; "wood" is close boards on rails. */
const gate: Builder = (m, o, tint) => {
  const { W, D, H } = m;
  const wood = mat(tint ?? "#8b5a3c", 0.85);
  const iron = mat(C.black, 0.5, 0.5);
  const wire = mat("#b4b9bd", 0.45, 0.7);
  const two = Number(o["leaves"] ?? 1) >= 2;
  const hog = o["style"] !== "wood";
  const n = two ? 2 : 1;
  const lw = W / n - 0.02;
  const y0 = 0.05;
  const h = H - y0;
  const t = Math.min(0.045, D);
  for (let k = 0; k < n; k++) {
    const cx = -W / 2 + (W / n) * (k + 0.5);
    // Its hinge side: the outer end.
    const hs = n === 2 ? (k === 0 ? -1 : 1) : -1;
    if (hog) {
      for (const s of [-1, 1])
        m.box(0.09, h, t, cx + s * (lw / 2 - 0.045), y0, 0, wood);
      for (const y of [y0, y0 + h - 0.09]) m.box(lw, 0.09, t, cx, y, 0, wood);
      m.box(lw, 0.09, t, cx, y0 + h / 2 - 0.045, 0, wood);
      for (let x = -lw / 2 + 0.1; x < lw / 2 - 0.05; x += 0.1)
        m.box(0.006, h - 0.18, 0.006, cx + x, y0 + 0.09, -t / 2, wire);
      for (let y = y0 + 0.15; y < y0 + h - 0.1; y += 0.15)
        m.box(lw - 0.1, 0.006, 0.006, cx, y, -t / 2, wire);
    } else {
      const boards = Math.max(3, Math.round(lw / 0.14));
      for (let b = 0; b < boards; b++)
        m.box(
          lw / boards - 0.008,
          h,
          0.02,
          cx - lw / 2 + (lw / boards) * (b + 0.5),
          y0,
          0.012,
          wood,
        );
      for (const y of [y0 + 0.15, y0 + h - 0.25])
        m.box(lw - 0.04, 0.09, 0.035, cx, y, -0.018, wood);
    }
    // The Z brace across the back, rising from the hinge side's foot.
    const run = lw - 0.18;
    const rise = h * (hog ? 0.5 : 1) - 0.25;
    const len = Math.hypot(run, rise);
    const brace = new THREE.BoxGeometry(len, 0.08, hog ? t * 0.8 : 0.03);
    brace.rotateZ(Math.atan2(rise, run) * -hs);
    brace.translate(
      cx,
      y0 + (hog ? 0.09 + rise / 2 : 0.2 + rise / 2),
      hog ? 0 : -0.035,
    );
    m.add(brace, wood);
    // Hinges on the hinge side, a latch on the other.
    for (const y of [y0 + 0.2, y0 + h - 0.25])
      m.box(0.2, 0.03, t + 0.01, cx + hs * (lw / 2 - 0.1), y, 0, iron);
    if (n === 1 || k === 0)
      m.box(
        0.05,
        0.08,
        t + 0.03,
        cx - hs * (lw / 2 - 0.03),
        y0 + h * 0.6,
        0,
        iron,
      );
  }
};

/** A car hauler trailer (front at +z): a planked deck between fenders on
 * steel rails, tandem axles, an A-frame tongue out to the hitch with its
 * jack, and lights at the corners. */
const carHauler: Builder = (m, _o, tint) => {
  const { W, D } = m;
  const steel = mat(tint ?? "#2b2d30", 0.5, 0.6);
  const wood = mat("#8a6a46", 0.85);
  const rubber = mat(C.rubber, 0.9);
  const hub = mat(C.chrome, 0.3, 0.8);
  const tongue = Math.min(1.3, D * 0.18);
  const len = D - tongue;
  const zc = -D / 2 + len / 2;
  const fw = 0.24;
  const deckW = W - 2 * fw;
  const deckY = 0.5;
  // Side rails and cross members under the deck, then the planks.
  for (const s of [-1, 1])
    m.box(0.08, 0.15, len, s * (deckW / 2 - 0.04), deckY - 0.15, zc, steel);
  for (let k = 0; k <= 8; k++)
    m.box(
      deckW,
      0.08,
      0.06,
      0,
      deckY - 0.12,
      -D / 2 + 0.05 + (k * (len - 0.1)) / 8,
      steel,
    );
  m.box(deckW, 0.04, len, 0, deckY, zc, wood);
  // Wheels, two a side, under fenders level with the deck.
  const wr = 0.36;
  const az = zc - len * 0.08;
  for (const s of [-1, 1]) {
    const x = s * (W / 2 - fw / 2);
    for (const dz of [-0.45, 0.45]) {
      m.cyl(wr, wr, 0.2, x, wr, az + dz, rubber, 24, "x");
      m.cyl(wr * 0.55, wr * 0.55, 0.21, x, wr, az + dz, hub, 16, "x");
    }
    m.cyl(0.03, 0.03, 0.9, s * (deckW / 2 - 0.1), wr, az, steel, 8, "z");
    m.box(fw + 0.02, 0.03, 2.0, x, wr * 2 + 0.06, az, steel);
    for (const dz of [-1, 1])
      m.box(fw + 0.02, 0.3, 0.03, x, wr * 2 - 0.24, az + dz * 1.0, steel);
  }
  // The tongue: an A-frame from the deck's front corners to the hitch.
  const front = -D / 2 + len;
  const hitchZ = D / 2 - 0.08;
  for (const s of [-1, 1]) {
    const x0 = s * (deckW / 2 - 0.04);
    const dx = -x0;
    const dz = hitchZ - front;
    const l = Math.hypot(dx, dz);
    const g = new THREE.BoxGeometry(0.08, 0.1, l);
    g.rotateY(Math.atan2(dx, dz));
    g.translate(x0 + dx / 2, deckY - 0.12, front + dz / 2);
    m.add(g, steel);
  }
  m.box(0.14, 0.08, 0.2, 0, deckY - 0.1, hitchZ, steel);
  m.sphere(0.04, 0, deckY - 0.1, hitchZ + 0.06, mat(C.chrome, 0.3, 0.8));
  // The jack, on the tongue's side, its foot on the ground.
  m.cyl(
    0.035,
    0.035,
    deckY + 0.25,
    0.18,
    0.04,
    front + tongue * 0.45,
    steel,
    10,
  );
  m.cyl(0.08, 0.08, 0.04, 0.18, 0, front + tongue * 0.45, steel, 12);
  // Lights: red at the back corners, amber markers at the front.
  const red = mat("#9b1c1c", 0.3, 0, { glow: "#ff2a2a", glowLevel: 0.1 });
  const amber = mat("#d98a1c", 0.3, 0, { glow: "#ffb030", glowLevel: 0.1 });
  for (const s of [-1, 1]) {
    m.box(
      0.14,
      0.08,
      0.04,
      s * (deckW / 2 - 0.1),
      deckY - 0.1,
      -D / 2 - 0.02,
      red,
    );
    m.box(
      0.04,
      0.05,
      0.06,
      s * (deckW / 2 + 0.01),
      deckY - 0.08,
      front - 0.1,
      amber,
    );
  }
};

const tv: Builder = (m, _o, _tint, item) => {
  const { W, H } = m;
  const h = Math.min(H, W * 0.58);
  const y = item.y0 > 0.5 ? 0 : 0.5;
  m.box(W, h, 0.04, 0, y, 0, mat(C.black, 0.4));
  m.box(
    W - 0.02,
    h - 0.02,
    0.005,
    0,
    y + 0.01,
    0.021,
    mat(C.screen, 0.08, 0.2),
  );
};

const mirror: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  m.box(W, H, Math.min(D, 0.04), 0, 0, 0, mat(tint ?? C.woodDark, 0.6), -0.08);
  m.box(
    W - 0.06,
    H - 0.06,
    0.005,
    0,
    0.03,
    0.022,
    mat("#dfe8ee", 0.02, 0.9),
    -0.08,
  );
};

const laptop: Builder = (m) => {
  const { W, D } = m;
  const al = mat("#b9bcc0", 0.35, 0.6);
  m.box(W, 0.015, D * 0.55, 0, 0, D * 0.2, al);
  m.box(W, D * 0.5, 0.008, 0, 0.015, -D * 0.08, al, -0.25);
  m.box(
    W - 0.02,
    D * 0.44,
    0.002,
    0,
    0.03,
    -D * 0.07,
    mat(C.screen, 0.1),
    -0.25,
  );
};

const puck: Builder = (m, _o, tint, item) => {
  const { W, D, H } = m;
  const lit = item.light;
  m.oval(
    W / 2,
    D / 2,
    Math.max(0.03, Math.min(H, 0.1)),
    0,
    0,
    0,
    lit
      ? mat("#fffaf0", 0.5, 0, { glow: lit.color, glowLevel: 0.6 + lit.level })
      : mat(tint ?? "#f4f4f2", 0.5),
    (W / 2) * 0.85,
    (D / 2) * 0.85,
  );
};

const petCot: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  const frame = mat(C.charcoal, 0.5, 0.4);
  const h = Math.min(H, 0.2);
  m.legs(W, D, h, 0.02, 0.03, frame, true);
  m.box(W - 0.04, 0.02, D - 0.04, 0, h - 0.02, 0, mat(tint ?? "#5b6b5a", 0.9));
};

const weightBench: Builder = (m, _o, tint) => {
  const { W, D } = m;
  const frame = mat(C.charcoal, 0.5, 0.4);
  const pad = mat(tint ?? C.rubber, 0.8);
  const bw = Math.min(0.3, W * 0.3);
  m.legs(bw, D * 0.8, 0.42, 0, 0.05, frame, false, D * 0.08);
  m.soft(bw, 0.07, D * 0.85, 0, 0.42, D * 0.07, pad, 0.02);
  for (const s of [-1, 1])
    m.box(0.06, 1.2, 0.06, s * (W / 2 - 0.05), 0, -D / 2 + 0.15, frame);
  m.cyl(
    0.015,
    0.015,
    W + 0.3,
    0,
    1.15,
    -D / 2 + 0.2,
    mat(C.chrome, 0.3, 0.8),
    10,
    "x",
  );
  for (const s of [-1, 1])
    m.cyl(
      0.22,
      0.22,
      0.05,
      s * (W / 2 + 0.08),
      1.15,
      -D / 2 + 0.2,
      mat(C.black, 0.6),
      20,
      "x",
    );
};

const floatingShelf: Builder = (m, _o, tint, item) => {
  const { W, D } = m;
  const y = item.y0 > 0.3 ? 0 : 1.4;
  m.box(W, 0.04, D, 0, y, 0, mat(tint ?? C.wood, 0.65));
};

/** A darker or lighter version of a hex colour. */
function shade(hex: string, k: number): string {
  const c = new THREE.Color(hex);
  c.multiplyScalar(k);
  return `#${c.getHexString()}`;
}

/** By drawing kind; some by catalog id where the drawing is generic. */
const BY_DRAW: Record<string, Builder> = {
  sofa,
  sectional,
  chair,
  deskChair,
  stool,
  bench,
  ottoman,
  pouf: ottoman,
  bed,
  table,
  roundTable: table,
  console: table,
  desk,
  cabinet,
  drawers,
  wardrobe,
  shelf,
  chest,
  tvStand,
  fridge,
  range,
  hood,
  sink,
  counter,
  island,
  dishwasher,
  appliance,
  toilet,
  bathtub,
  vanity,
  washer,
  treadmill,
  workbench,
  tank,
  waterHeater,
  furnace,
  car,
  mirror,
  laptop,
  puck,
  petCot,
  weightBench,
  floatingShelf,
  bezellessSink: sink,
};

const BY_KIND: [RegExp, Builder][] = [
  [/^trailer_/, carHauler],
  [/^gate_(hog|wood)_/, gate],
  [/wheelie_bin|^garbage_bin$|^garbage_cart|^recycling_cart/, wheelieBin],
  [/^tv_|_tv$|^tv\d/, tv],
  [/^car_/, car],
  [/desk_chair|office_chair|task_chair|gaming_chair/, deskChair],
  [/water_heater/, waterHeater],
];

/** A counter run drawn as a free-form outline (x, z in the item's frame):
 * cabinets to the outline with a toe kick, and a stone top a little
 * proud of it. */
export function counterModel(
  footprint: [number, number][],
  height: number,
  tint: string | null,
): THREE.Group {
  const g = new THREE.Group();
  const shape = (pts: [number, number][], grow: number) => {
    // Grown (or shrunk) about the outline's centre.
    const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
    const cz = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    return new THREE.Shape(
      pts.map(([x, z]) => {
        const dx = x - cx;
        const dz = z - cz;
        const len = Math.hypot(dx, dz) || 1;
        return new THREE.Vector2(
          x + (dx / len) * grow,
          -(z + (dz / len) * grow),
        );
      }),
    );
  };
  const slab = (
    pts: [number, number][],
    grow: number,
    y0: number,
    h: number,
    m: THREE.Material,
  ) => {
    const geom = new THREE.ExtrudeGeometry(shape(pts, grow), {
      depth: h,
      bevelEnabled: false,
    });
    geom.rotateX(-Math.PI / 2);
    geom.translate(0, y0, 0);
    const mesh = new THREE.Mesh(geom, m);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    g.add(mesh);
  };
  slab(footprint, -0.05, 0, 0.1, mat(C.charcoal, 0.8));
  slab(
    footprint,
    0,
    0.1,
    Math.max(0.1, height - 0.14),
    mat(tint ?? C.paint, 0.75),
  );
  slab(footprint, 0.015, height - 0.04, 0.04, mat(C.stone, 0.35));
  return g;
}

/** The item as a 3D model, or null where there's none for its kind (it
 * stays a block with its drawing on top). */
export function furnitureModel(item: Item3d): THREE.Group | null {
  const spec = item.model;
  if (!spec) return null;
  const builder =
    BY_KIND.find(([re]) => re.test(spec.kind))?.[1] ?? BY_DRAW[spec.draw];
  if (!builder) return null;
  const m = new Model(
    item.width,
    item.depth,
    Math.max(0.05, item.height),
    spec.flip,
  );
  builder(m, spec.opts as Opts, spec.tint, item);
  return m.group();
}
