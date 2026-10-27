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

/** Article's walnut, and the dark bronze of its steel legs. */
const WALNUT = "#5b3624";
const BRONZE = "#3f3a35";

/** Article's Nera king bed (back at -z): a walnut platform on slim steel
 * legs, set on a headboard panel wider than it (three chevron panels),
 * a floating nightstand with a drawer each side. */
const neraBed: Builder = (m, o, tint) => {
  const { W, D, H } = m;
  const wood = mat(tint ?? WALNUT, 0.55);
  const grain = mat(shade(tint ?? WALNUT, 0.78), 0.6);
  const steel = mat(BRONZE, 0.45, 0.7);
  const fw = Math.min(W, num(o, "frame", 200) / 100);
  const panelT = 0.04;
  const back = -D / 2;
  const face = back + panelT + 0.002;
  // The headboard panel, the seams between its chevron panels, and a
  // hint of the chevron: two strokes meeting down each panel's middle.
  m.box(W, H - 0.1, panelT, 0, 0.1, back + panelT / 2, wood);
  for (const f of [-1, 1])
    m.box(0.006, H - 0.12, 0.004, (f * W) / 6, 0.11, face, grain);
  for (const f of [-1, 0, 1])
    for (const s of [-1, 1]) {
      const g = new THREE.BoxGeometry(0.006, (H - 0.14) * 0.6, 0.004);
      g.rotateZ(s * 0.6);
      g.translate((f * W) / 3 + s * 0.13, (H + 0.1) / 2, face);
      m.add(g, grain);
    }
  // The platform: rails 15 cm deep, clear of the floor, on slim legs.
  const clear = 0.2;
  const railH = 0.15;
  const len = D - panelT;
  const zc = back + panelT + len / 2;
  m.box(fw, railH, len, 0, clear, zc, wood);
  for (const s of [-1, 1])
    for (const z of [D / 2 - 0.12, back + 0.4])
      m.cyl(0.016, 0.014, clear, s * (fw / 2 - 0.12), 0, z, steel, 10);
  // The mattress sitting down in it, pillows, a duvet folded back.
  const mw = fw - 0.06;
  const ml = len - 0.06;
  const top = clear + railH + 0.15;
  m.soft(mw, 0.25, ml, 0, top - 0.25, zc, mat(C.porcelain, 0.95), 0.05);
  const dl = ml * 0.68;
  m.soft(
    mw + 0.02,
    0.06,
    dl,
    0,
    top - 0.03,
    zc + ml / 2 - dl / 2,
    mat("#e6e2da", 0.95),
    0.03,
  );
  for (const k of [-1, 1])
    m.soft(
      mw / 2 - 0.08,
      0.13,
      0.4,
      (k * mw) / 4,
      top - 0.02,
      back + panelT + 0.3,
      mat(C.pillow, 0.95),
      0.06,
      -0.25,
    );
  // The nightstands: floating boxes on the panel, a drawer's finger pull.
  const nw = Math.min(0.42, (W - fw) / 2 - 0.05);
  if (nw > 0.15)
    for (const s of [-1, 1]) {
      const x = s * (fw / 2 + 0.03 + nw / 2);
      const nd = 0.36;
      const nz = back + panelT + nd / 2;
      m.box(nw, 0.13, nd, x, 0.213, nz, wood);
      m.box(
        nw * 0.86,
        0.008,
        0.006,
        x,
        0.31,
        nz + nd / 2 + 0.002,
        mat(C.black, 0.6),
      );
    }
};

/** Article's Nera 63" low media unit (back at -z): a walnut case on slim
 * dark legs, two drawers with bar pulls on one side, an open bay with a
 * shelf on the other. */
const neraMedia: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  const wood = mat(tint ?? WALNUT, 0.55);
  const inner = mat(shade(tint ?? WALNUT, 0.82), 0.65);
  const dark = mat("#221d1a", 0.5, 0.4);
  const legH = Math.min(0.13, H * 0.26);
  const t = 0.02;
  const h = H - legH;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      m.cyl(
        0.016,
        0.011,
        legH,
        sx * (W / 2 - 0.09),
        0,
        sz * (D / 2 - 0.06),
        dark,
        10,
      );
  // The case: top, bottom, ends, back, and the divider at the drawers.
  m.box(W, t, D, 0, H - t, 0, wood);
  m.box(W, t, D, 0, legH, 0, wood);
  for (const s of [-1, 1]) m.box(t, h, D, s * (W / 2 - t / 2), legH, 0, wood);
  m.box(W - 2 * t, h - 2 * t, 0.01, 0, legH + t, -D / 2 + 0.005, inner);
  const dw = W * 0.47;
  const xd = -W / 2 + dw / 2;
  m.box(t, h - 2 * t, D, -W / 2 + dw, legH + t, 0, wood);
  // The drawers' fronts, flush, a pull near the top of each.
  const fh = (h - 2 * t - 0.006) / 2;
  for (let k = 0; k < 2; k++) {
    const fy = legH + t + k * (fh + 0.006);
    m.box(dw - t - 0.006, fh, 0.02, xd + t / 2, fy, D / 2 - 0.01, wood);
    m.box(dw * 0.4, 0.012, 0.02, xd, fy + fh - 0.035, D / 2 + 0.01, dark);
  }
  // The open bay's shelf.
  const bw = W - dw - t;
  m.box(
    bw - t,
    t * 0.8,
    D - 0.03,
    W / 2 - t - bw / 2 + t / 2,
    legH + h / 2,
    0.01,
    wood,
  );
};

/** Article's Ceni base (back at -z): a walnut plinth rail round the
 * body, shaped feet at its corners. */
const ceniBase = (m: Model, W: number, D: number, wood: THREE.Material) => {
  const foot = 0.13;
  for (const z of [-1, 1])
    m.box(W - 0.04, 0.05, 0.03, 0, foot - 0.05, z * (D / 2 - 0.035), wood);
  for (const s of [-1, 1]) {
    m.box(0.03, 0.05, D - 0.07, s * (W / 2 - 0.035), foot - 0.05, 0, wood);
    for (const z of [-1, 1]) {
      m.box(0.05, foot, 0.1, s * (W / 2 - 0.045), 0, z * (D / 2 - 0.07), wood);
      m.box(
        0.09,
        0.05,
        0.05,
        s * (W / 2 - 0.065),
        foot - 0.05,
        z * (D / 2 - 0.045),
        wood,
      );
    }
  }
};

/** Article's Ceni sofa and lounge chair (back at -z): track arms, a seat
 * and back cushion a place on its walnut base. Its fabric (`fabric`;
 * the sofa's quarry gray unset) unless coloured. */
const ceniSofa: Builder = (m, o, tint) => {
  const { W, D, H } = m;
  const cloth = tint ?? (typeof o["fabric"] === "string" ? o["fabric"] : null);
  const fab = mat(cloth ?? "#8b877f", 0.95);
  const cush = mat(cloth ? shade(cloth, 1.05) : "#928e86", 0.95);
  ceniBase(m, W, D, mat(WALNUT, 0.55));
  const base = 0.13;
  const arm = Math.min(0.17, Math.max(0.14, W * 0.09));
  const armTop = Math.min(0.61, H - 0.12);
  const seatTop = Math.min(0.42, H * 0.53);
  const backD = 0.2;
  // The body under the seat, the arms, the back frame.
  m.soft(W - 0.02, seatTop - 0.11 - base, D - 0.02, 0, base, 0, fab, 0.02);
  for (const s of [-1, 1])
    m.soft(arm, armTop - base, D, s * (W / 2 - arm / 2), base, 0, fab, 0.025);
  m.soft(
    W - 2 * arm + 0.02,
    H - 0.08 - base,
    backD,
    0,
    base,
    -D / 2 + backD / 2,
    fab,
    0.025,
  );
  // Seat cushions; back cushions leaning back on the frame.
  const seats = Math.max(1, num(o, "seats", 3));
  const inner = W - 2 * arm;
  const cw = inner / seats;
  const sd = D - backD - 0.02;
  for (let k = 0; k < seats; k++) {
    const x = -inner / 2 + cw * (k + 0.5);
    m.soft(
      cw - 0.01,
      0.13,
      sd,
      x,
      seatTop - 0.12,
      D / 2 - sd / 2 - 0.01,
      cush,
      0.04,
    );
    m.soft(
      cw - 0.015,
      H - seatTop - 0.01,
      0.15,
      x,
      seatTop - 0.01,
      -D / 2 + backD + 0.05,
      cush,
      0.05,
      -0.12,
    );
  }
};

/** Its ottoman: an upholstered block on the same base. */
const ceniOttoman: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  ceniBase(m, W, D, mat(WALNUT, 0.55));
  m.soft(
    W - 0.02,
    H - 0.13,
    D - 0.02,
    0,
    0.13,
    0,
    mat(tint ?? "#8b877f", 0.95),
    0.04,
  );
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

/** White oak shaker cabinets' wood. */
const WHITE_OAK = "#d3b98f";

/** A shaker front (a door or a drawer) `w` × `h` standing on `y`, its
 * face at `z`: a frame of stiles and rails round a recessed panel; a
 * short drawer's a plain slab. */
function shakerFront(
  m: Model,
  x: number,
  y: number,
  w: number,
  h: number,
  z: number,
  wood: THREE.Material,
  panel: THREE.Material,
): void {
  const t = 0.019;
  if (h < 0.13) {
    m.box(w, h, t, x, y, z - t / 2, wood);
    return;
  }
  const s = Math.min(0.065, w * 0.2, h * 0.25);
  m.box(w - 2 * s, h - 2 * s, 0.01, x, y + s, z - t + 0.005, panel);
  for (const sx of [-1, 1])
    m.box(s, h, t, x + sx * (w / 2 - s / 2), y, z - t / 2, wood);
  m.box(w - 2 * s, s, t, x, y, z - t / 2, wood);
  m.box(w - 2 * s, s, t, x, y + h - s, z - t / 2, wood);
}

/** A matte black bar pull on a front at `z`, centred at (x, y). */
function barPull(
  m: Model,
  x: number,
  y: number,
  z: number,
  vertical: boolean,
  len: number,
): void {
  const black = mat("#1f1f1f", 0.5, 0.6);
  const b = 0.011;
  if (vertical) {
    m.box(b, len, b, x, y - len / 2, z + 0.032, black);
    for (const s of [-1, 1])
      m.box(
        0.009,
        0.009,
        0.03,
        x,
        y + s * (len / 2 - 0.012) - 0.0045,
        z + 0.015,
        black,
      );
  } else {
    m.box(len, b, b, x, y - b / 2, z + 0.032, black);
    for (const s of [-1, 1])
      m.box(
        0.009,
        0.009,
        0.03,
        x + s * (len / 2 - 0.012),
        y - 0.0045,
        z + 0.015,
        black,
      );
  }
}

/** A white oak range hood to match the shaker cabinets (front at +z): a
 * box clad front and sides in horizontal planks, dark reveals between
 * them, its liner and lights underneath. */
function plankHood(m: Model, oak: string): void {
  const { W, D, H } = m;
  const wood = mat(oak, 0.6);
  const reveal = mat(shade(oak, 0.5), 0.85);
  const t = 0.012;
  // The core shows only in the reveals.
  m.box(W - 2 * t, H, D - t, 0, 0, -t / 2, reveal);
  const n = Math.max(3, Math.round(H / 0.11));
  const ph = H / n;
  for (let i = 0; i < n; i++) {
    const y = i * ph + 0.003;
    m.box(W, ph - 0.006, t, 0, y, D / 2 - t / 2, wood);
    for (const s of [-1, 1])
      m.box(t, ph - 0.006, D - t, s * (W / 2 - t / 2), y, -t / 2, wood);
  }
  // The liner and two lights underneath.
  m.box(
    W - 2 * t - 0.01,
    0.004,
    D - t - 0.01,
    0,
    0.004,
    -t / 2,
    mat("#3a3b3d", 0.5, 0.5),
  );
  for (const s of [-1, 1])
    m.cyl(
      0.025,
      0.025,
      0.004,
      (s * W) / 4,
      0,
      0,
      mat("#f4f1e6", 0.3, 0, { glow: "#fff6dd", glowLevel: 0.3 }),
      16,
    );
}

/** White oak shaker cabinets (front at +z): a base cabinet, drawer base
 * or sink base on a toe kick under a quartz top, a wall cabinet, a tall
 * pantry, and a plank range hood to go with them. Its face, from the top
 * down: drawers at the heights set on the item (`fronts`; the last one
 * taking up the rest when there are no doors), then its doors across the
 * rest — else its type's own. */
const shaker: Builder = (m, o, tint, item) => {
  const { W, D, H } = m;
  const type = typeof o["shaker"] === "string" ? o["shaker"] : "base";
  const oak = tint ?? WHITE_OAK;
  if (type === "hood") {
    plankHood(m, oak);
    return;
  }
  const wood = mat(oak, 0.6);
  const panel = mat(shade(oak, 0.93), 0.65);
  const counter = type === "base" || type === "drawers" || type === "sink";
  const kick = type === "wall" ? 0 : 0.1;
  const top = counter ? 0.03 : 0;
  const t = 0.019;
  const face = D / 2;
  const cuts = item.model?.cuts;
  // The box, its recessed toe kick, the top.
  carcass(m, W, H - kick - top, D - t, 0, kick, -t / 2, wood, !!cuts);
  if (kick)
    m.box(
      W - 0.006,
      kick,
      D - t - 0.075,
      0,
      0,
      -(t + 0.075) / 2,
      mat(shade(oak, 0.45), 0.8),
    );
  if (top)
    cutTop(
      m,
      W + 0.004,
      top,
      D + 0.025,
      0,
      H - top,
      0.0125,
      quartzMaterial(),
      cuts,
    );
  const gap = 0.003;
  const y0 = kick + gap;
  const faceH = H - kick - top - 2 * gap;
  const across = W > 0.61 ? 2 : 1;
  const preset: Record<string, [number[], number]> = {
    base: [[0.15], across],
    drawers: [[0.15, 0.25, 0.35], 0],
    sink: [[0.15], across],
    wall: [[], across],
    tall: [[], across],
  };
  const [ownDrawers, ownDoors] = preset[type] ?? preset["base"]!;
  const fronts = item.model?.fronts;
  const list = (fronts?.drawers ?? ownDrawers).map((h) => Math.max(0.05, h));
  let doors = Math.max(0, Math.min(4, Math.round(fronts?.doors ?? ownDoors)));
  if (!list.length && !doors) doors = 1;
  const sum = (a: number[]) => a.reduce((s, h) => s + h, 0);
  if (doors > 0) {
    // Room left for the doors: the drawers shrink to fit if they must.
    const room = faceH - 0.15;
    const k = sum(list) > room ? Math.max(0, room) / sum(list) : 1;
    for (let i = 0; i < list.length; i++) list[i] = list[i]! * k;
  } else if (list.length) {
    // No doors: the last drawer takes up the rest (or they all shrink).
    const rest = faceH - sum(list.slice(0, -1));
    if (rest >= 0.06) list[list.length - 1] = rest;
    else {
      const k = faceH / sum(list);
      for (let i = 0; i < list.length; i++) list[i] = list[i]! * k;
    }
  }
  const pullLen = (w: number) => (w > 0.8 ? 0.305 : w > 0.45 ? 0.192 : 0.128);
  let y = y0 + faceH;
  for (const h of list) {
    shakerFront(m, 0, y - h + gap / 2, W - gap, h - gap, face, wood, panel);
    barPull(m, 0, y - Math.min(h / 2, 0.075), face, false, pullLen(W));
    y -= h;
  }
  const doorH = y - y0;
  if (doors > 0 && doorH > 0.05) {
    // A tall pantry's doors in two tiers: tall ones below, a short pair
    // above (a third of the way, lined up with the wall cabinets).
    const tiers =
      type === "tall" && doorH > 1.6 ? [doorH * 0.66, doorH * 0.34] : [doorH];
    let ty = y0;
    tiers.forEach((th, tier) => {
      const dw = W / doors;
      const len = th > 0.6 ? 0.192 : 0.128;
      for (let k = 0; k < doors; k++) {
        const x = -W / 2 + dw * (k + 0.5);
        shakerFront(m, x, ty + gap / 2, dw - gap, th - gap, face, wood, panel);
        // The pull by the door's free edge: the pair's middle, else its
        // right; high on a base, low on a wall cabinet.
        const edge = doors === 1 ? 1 : k % 2 === 0 ? 1 : -1;
        const py =
          type === "wall" || (type === "tall" && tier === 1)
            ? ty + 0.07 + len / 2
            : type === "tall"
              ? ty + Math.min(th - 0.07 - len / 2, 1.05)
              : ty + th - 0.07 - len / 2;
        barPull(m, x + edge * (dw / 2 - 0.045), py, face, true, len);
      }
      ty += th;
    });
  }
};

/** A cabinet's box; hollow at the top (its sides, back and front up to
 * its top, solid below) where a sink's bowl hangs down into it. */
function carcass(
  m: Model,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  mt: THREE.Material,
  hollow: boolean,
): void {
  if (!hollow) {
    m.box(w, h, d, x, y, z, mt);
    return;
  }
  const t = 0.019;
  const low = Math.max(0, h - 0.32);
  m.box(w, low, d, x, y, z, mt);
  for (const s of [-1, 1]) {
    m.box(t, h - low, d, x + s * (w / 2 - t / 2), y + low, z, mt);
    m.box(w - 2 * t, h - low, t, x, y + low, z + s * (d / 2 - t / 2), mt);
  }
}

/** A stone top (w across, t thick, d deep, centred at x, z, standing on
 * y) with undermount sinks' openings in it (`cuts`, in the model's frame):
 * one wholly inside it a hole with its rounded corners; one running off
 * its edge (a sink across two cabinets) taken out square. */
function cutTop(
  m: Model,
  w: number,
  t: number,
  d: number,
  x: number,
  y: number,
  z: number,
  mt: THREE.Material,
  cuts: NonNullable<Item3d["model"]>["cuts"],
): void {
  const x0 = x - w / 2;
  const x1 = x + w / 2;
  const z0 = z - d / 2;
  const z1 = z + d / 2;
  // Each opening's outline (its corners rounded) and its bounds.
  const holes = (cuts ?? []).map((c) => {
    const pts: [number, number][] = [];
    const r = Math.min(c.r, c.w / 2, c.d / 2);
    const corners: [number, number, number][] = [
      [c.w / 2 - r, c.d / 2 - r, 0],
      [-c.w / 2 + r, c.d / 2 - r, Math.PI / 2],
      [-c.w / 2 + r, -c.d / 2 + r, Math.PI],
      [c.w / 2 - r, -c.d / 2 + r, (3 * Math.PI) / 2],
    ];
    const cos = Math.cos(c.a);
    const sin = Math.sin(c.a);
    for (const [cx, cz, a0] of corners)
      for (let k = 0; k <= 4; k++) {
        const a = a0 + (k / 4) * (Math.PI / 2);
        const px = cx + r * Math.cos(a);
        const pz = cz + r * Math.sin(a);
        pts.push([c.x + px * cos + pz * sin, c.z - px * sin + pz * cos]);
      }
    const xs = pts.map((p) => p[0]);
    const zs = pts.map((p) => p[1]);
    return {
      pts,
      bx0: Math.min(...xs),
      bx1: Math.max(...xs),
      bz0: Math.min(...zs),
      bz1: Math.max(...zs),
    };
  });
  const mine = holes.filter(
    (h) => h.bx0 < x1 && h.bx1 > x0 && h.bz0 < z1 && h.bz1 > z0,
  );
  // Each piece's texture laid at its real size (see planarUv).
  const slab = (sw: number, sd: number, sx: number, sz: number) => {
    if (sw <= 0 || sd <= 0) return;
    const g = new THREE.BoxGeometry(sw, t, sd);
    g.translate(sx, y + t / 2, sz);
    planarUv(g, QUARTZ_TILE_M);
    m.add(g, mt);
  };
  if (!mine.length) {
    slab(w, d, x, z);
    return;
  }
  const e = 0.005;
  const crossing = mine.find(
    (h) => h.bx0 < x0 + e || h.bx1 > x1 - e || h.bz0 < z0 + e || h.bz1 > z1 - e,
  );
  if (crossing) {
    // Round it, square: the top in up to four pieces.
    const hx0 = Math.max(x0, crossing.bx0);
    const hx1 = Math.min(x1, crossing.bx1);
    const hz0 = Math.max(z0, crossing.bz0);
    const hz1 = Math.min(z1, crossing.bz1);
    slab(w, hz0 - z0, x, (z0 + hz0) / 2);
    slab(w, z1 - hz1, x, (hz1 + z1) / 2);
    slab(hx0 - x0, hz1 - hz0, (x0 + hx0) / 2, (hz0 + hz1) / 2);
    slab(x1 - hx1, hz1 - hz0, (hx1 + x1) / 2, (hz0 + hz1) / 2);
    return;
  }
  // Shape coordinates (x, -z): extruded up, then stood on y. Its outline
  // anticlockwise, so three winds the holes against it (their walls
  // facing in, not culled).
  const shape = new THREE.Shape([
    new THREE.Vector2(x0, -z1),
    new THREE.Vector2(x1, -z1),
    new THREE.Vector2(x1, -z0),
    new THREE.Vector2(x0, -z0),
  ]);
  for (const h of mine)
    shape.holes.push(
      new THREE.Path(h.pts.map(([px, pz]) => new THREE.Vector2(px, -pz))),
    );
  const g = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, 0);
  g.computeVertexNormals();
  planarUv(g, QUARTZ_TILE_M);
  m.add(g, mt);
}

/** A geometry's UVs laid flat at real size, `tile` metres to a repeat:
 * across its top from x and z, up its sides from along them and y. */
function planarUv(g: THREE.BufferGeometry, tile: number): void {
  const pos = g.getAttribute("position");
  const nor = g.getAttribute("normal");
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    const nx = Math.abs(nor.getX(i));
    const ny = Math.abs(nor.getY(i));
    const nz = Math.abs(nor.getZ(i));
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const [u, v] = ny >= nx && ny >= nz ? [x, z] : nz >= nx ? [x, y] : [z, y];
    uv[i * 2] = u / tile;
    uv[i * 2 + 1] = v / tile;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
}

/** Silestone Blanco Maple quartz: a warm white, densely flecked with
 * small chips (a few millimetres) of white, pale grey and sand, a few
 * darker grains among them; one seamless repeat `QUARTZ_TILE_M` across. */
const QUARTZ_TILE_M = 0.4;
let quartzMat: THREE.MeshStandardMaterial | null = null;
function quartzMaterial(): THREE.MeshStandardMaterial {
  if (quartzMat) return quartzMat;
  const N = 1024;
  const cv = document.createElement("canvas");
  cv.width = N;
  cv.height = N;
  const ctx = cv.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#efede8";
    ctx.fillRect(0, 0, N, N);
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    // px per millimetre.
    const mm = N / (QUARTZ_TILE_M * 1000);
    const chip = (cx: number, cy: number, r: number, color: string) => {
      const n = 5 + Math.floor(rnd() * 3);
      const pts: [number, number][] = [];
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + rnd() * 0.6;
        const rr = r * (0.55 + 0.6 * rnd());
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      ctx.fillStyle = color;
      // Drawn again across each edge it runs over, so the repeat is
      // seamless.
      for (const ox of [-N, 0, N])
        for (const oy of [-N, 0, N]) {
          if (
            cx + ox < -r ||
            cx + ox > N + r ||
            cy + oy < -r ||
            cy + oy > N + r
          )
            continue;
          ctx.beginPath();
          pts.forEach(([px, py], k) =>
            k ? ctx.lineTo(px + ox, py + oy) : ctx.moveTo(px + ox, py + oy),
          );
          ctx.closePath();
          ctx.fill();
        }
    };
    const pick = (list: [string, number][]) => {
      let r = rnd();
      for (const [c, w] of list) if ((r -= w) <= 0) return c;
      return list[0]![0];
    };
    // Fine grains, then the chips over them.
    for (let i = 0; i < 16000; i++)
      chip(
        rnd() * N,
        rnd() * N,
        (0.3 + rnd() * 0.5) * mm,
        pick([
          ["#e4e1da", 0.45],
          ["#f8f7f3", 0.35],
          ["#d6d2ca", 0.15],
          ["#bdb8ae", 0.05],
        ]),
      );
    for (let i = 0; i < 7500; i++)
      chip(
        rnd() * N,
        rnd() * N,
        (0.6 + rnd() * rnd() * 2.2) * mm,
        pick([
          ["#f9f8f5", 0.34],
          ["#e3e0da", 0.32],
          ["#d6d2ca", 0.17],
          ["#e8e2d6", 0.14],
          ["#bab5ab", 0.03],
        ]),
      );
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  quartzMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 });
  return quartzMat;
}

/** Delta's Everest workstation sink, undermount (its rim at the stone
 * top's underside, the top `H`): one deep granite-composite bowl (black
 * unless tinted), its WorkFlow ledges a little way down its front and back
 * walls, its drain to the back right, and the roll-up drying mat resting
 * across the ledges at its left end. Its opening (the top's cut) is its
 * size less a rim all round (see scene3d). */
const everestSink: Builder = (m, o, tint) => {
  const { W, D, H } = m;
  const comp = mat(tint ?? "#2e2e31", 0.5, 0.15);
  const rim = num(o, "undermount", 2.5) / 100;
  const iw = W - 2 * rim;
  const id = D - 2 * rim;
  const wall = 0.014;
  const ledge = 0.016;
  const top = H - 0.03;
  const ly = top - 0.025;
  const bottom = top - 0.254;
  const ld = id - 2 * ledge;
  // The bowl below the ledges, the ledges, and the walls above them.
  m.box(iw + 2 * wall, wall, ld + 2 * wall, 0, bottom - wall, 0, comp);
  for (const s of [-1, 1]) {
    m.box(
      wall,
      top - bottom + wall,
      id + 2 * wall,
      s * (iw / 2 + wall / 2),
      bottom - wall,
      0,
      comp,
    );
    m.box(iw, ly - bottom, wall, 0, bottom, s * (ld / 2 + wall / 2), comp);
    m.box(iw, wall, ledge, 0, ly - wall, s * (ld / 2 + ledge / 2), comp);
    m.box(iw + 2 * wall, top - ly, wall, 0, ly, s * (id / 2 + wall / 2), comp);
  }
  // Its drain: a black basket strainer to the back right.
  const dx = iw * 0.2;
  const dz = -ld * 0.12;
  m.cyl(0.056, 0.056, 0.003, dx, bottom, dz, mat("#1b1b1c", 0.4, 0.3), 28);
  m.cyl(0.036, 0.036, 0.004, dx, bottom, dz, mat("#0e0e0f", 0.6), 24);
  // The roll mat: coated bars across the ledges at the left end.
  const bar = mat("#1f1f21", 0.65);
  const n = 12;
  const pitch = 0.026;
  for (let k = 0; k < n; k++)
    m.box(0.015, 0.008, id - 0.006, -iw / 2 + 0.014 + k * pitch, ly, 0, bar);
};

/** Delta's Nicoli pull-down kitchen faucet (matte black unless tinted;
 * its spout reaching to the front, +z): a round body on a small base,
 * its lever on the right, a tall arched spout over to the spray head
 * hanging down from its end. */
const nicoliFaucet: Builder = (m, _o, tint) => {
  const { D, H } = m;
  const black = mat(tint ?? "#1d1d1e", 0.45, 0.35);
  const zb = -D / 2 + 0.03;
  const reach = Math.max(0.12, D - 0.06);
  const top = Math.max(0.3, H);
  m.cyl(0.03, 0.03, 0.006, 0, 0, zb, black, 28);
  m.cyl(0.025, 0.025, 0.2, 0, 0.006, zb, black, 28);
  m.cyl(0.015, 0.025, 0.014, 0, 0.206, zb, black, 28);
  // The spout: straight up, round over, its end pointing down.
  const r = reach / 2;
  const turn = top - r;
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 6; k++)
    pts.push(new THREE.Vector3(0, 0.215 + ((turn - 0.215) * k) / 6, zb));
  for (let k = 1; k <= 16; k++) {
    const a = Math.PI - (k / 16) * Math.PI;
    pts.push(
      new THREE.Vector3(0, turn + r * Math.sin(a), zb + r + r * Math.cos(a)),
    );
  }
  pts.push(new THREE.Vector3(0, turn - 0.01, zb + reach));
  m.add(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.0115, 14),
    black,
  );
  // The spray head, docked at the spout's end.
  m.cyl(0.0165, 0.0165, 0.1, 0, turn - 0.11, zb + reach, black, 20);
  m.cyl(
    0.0172,
    0.0172,
    0.004,
    0,
    turn - 0.045,
    zb + reach,
    mat("#2c2c2e", 0.35, 0.4),
    20,
  );
  // The lever on the right: a hub, its handle up and a little back.
  m.cyl(0.015, 0.015, 0.022, 0.034, 0.11, zb, black, 16, "x");
  const lever = new THREE.CylinderGeometry(0.0055, 0.0065, 0.08, 10);
  lever.rotateX(-0.25);
  lever.translate(0.04, 0.11 + 0.042, zb - 0.01);
  m.add(lever, black);
};

/** A workstation sink's wire drying rack, resting across its ledges (its
 * underside at the item's mount): a rod frame, wires across between its
 * front and back. */
const sinkRack: Builder = (m, _o, tint) => {
  const { W, D } = m;
  const steel = mat(tint ?? "#2a2a2c", 0.5, 0.4);
  const r = 0.004;
  for (const s of [-1, 1]) {
    m.cyl(r, r, D, s * (W / 2 - r), r, 0, steel, 8, "z");
    m.cyl(r, r, W, 0, r, s * (D / 2 - r), steel, 8, "x");
  }
  const n = Math.max(2, Math.floor(W / 0.02));
  for (let k = 1; k < n; k++)
    m.cyl(
      0.0018,
      0.0018,
      D - 0.01,
      -W / 2 + (W * k) / n,
      r * 1.6,
      0,
      steel,
      6,
      "z",
    );
};

/** A tile backsplash's texture: small hexagons (5 cm across the flats)
 * in shades of grey, dark grout between, one repeat `HEX_TILE` metres
 * across and up (see backsplash). */
const HEX_TILE: [number, number] = [6 * 0.052, 6 * 0.045];
let hexTexture: THREE.Texture | null = null;
function hexTileTexture(): THREE.Texture {
  if (hexTexture) return hexTexture;
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = Math.round((512 * HEX_TILE[1]) / HEX_TILE[0]);
  const ctx = cv.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#3b3b3c";
    ctx.fillRect(0, 0, cv.width, cv.height);
    // Pointy-top hexagons: 6 across, 6 rows (alternate rows offset).
    const dx = cv.width / 6;
    const dy = cv.height / 6;
    const r = dx / Math.sqrt(3) - 2.2;
    // Each tile's grey, only just varied; the tiles cut off at an edge
    // the same as their other halves across it, so the repeat is seamless.
    let seed = 7;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const greys = Array.from({ length: 36 }, () => Math.round(164 + 4 * rnd()));
    for (let row = -1; row <= 6; row++)
      for (let col = -1; col <= 6; col++) {
        const cx = col * dx + (row % 2 ? dx / 2 : 0) + dx / 2;
        const cy = row * dy + dy / 2;
        const g = greys[((row + 6) % 6) * 6 + ((col + 6) % 6)]!;
        ctx.fillStyle = `rgb(${g},${g + 2},${g + 4})`;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = Math.PI / 6 + (k * Math.PI) / 3;
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          if (k) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
  }
  hexTexture = new THREE.CanvasTexture(cv);
  hexTexture.colorSpace = THREE.SRGBColorSpace;
  hexTexture.wrapS = THREE.RepeatWrapping;
  hexTexture.wrapT = THREE.RepeatWrapping;
  hexTexture.anisotropy = 4;
  return hexTexture;
}

const TILE_MATS = new Map<string, THREE.MeshStandardMaterial>();
/** The tile, tinted (white: as drawn). */
function tileMaterial(tint: string): THREE.MeshStandardMaterial {
  let m = TILE_MATS.get(tint);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      map: hexTileTexture(),
      color: tint,
      roughness: 0.35,
    });
    TILE_MATS.set(tint, m);
  }
  return m;
}

/** A panel `w` across (centred) and `h` up less the gaps in it: the
 * pieces left, each [x0, x1, y0, y1]. */
function panelPieces(
  w: number,
  h: number,
  gaps: { x0: number; x1: number; y0: number; y1: number }[] | undefined,
): [number, number, number, number][] {
  const xs = [-w / 2, w / 2];
  for (const g of gaps ?? [])
    for (const x of [g.x0, g.x1]) if (x > -w / 2 && x < w / 2) xs.push(x);
  xs.sort((a, b) => a - b);
  const out: [number, number, number, number][] = [];
  for (let i = 0; i + 1 < xs.length; i++) {
    const xa = xs[i]!;
    const xb = xs[i + 1]!;
    if (xb - xa < 0.002) continue;
    const xm = (xa + xb) / 2;
    const cut = (gaps ?? [])
      .filter((g) => g.x0 < xm && g.x1 > xm)
      .map((g): [number, number] => [Math.max(0, g.y0), Math.min(h, g.y1)])
      .filter(([a, b]) => b > a)
      .sort((p, q) => p[0] - q[0]);
    let y = 0;
    for (const [a, b] of cut) {
      if (a - y > 0.002) out.push([xa, xb, y, a]);
      y = Math.max(y, b);
    }
    if (h - y > 0.002) out.push([xa, xb, y, h]);
  }
  return out;
}

/** A tile backsplash (its back at -z, against the wall): a thin slab,
 * its face tiled in small grey hexagons with dark grout at their real
 * size however big it's drawn, stopping round any window or door in the
 * wall behind it (see scene3d); a colour tints the tiles. */
const backsplash: Builder = (m, _o, tint, item) => {
  const { W, D, H } = m;
  const t = Math.min(D, 0.012);
  const grout = mat("#3b3b3c", 0.8);
  const tile = tileMaterial(tint ?? "#ffffff");
  for (const [x0, x1, y0, y1] of panelPieces(W, H, item.model?.gaps)) {
    const w = x1 - x0;
    const h = y1 - y0;
    m.box(w, h, t, (x0 + x1) / 2, y0, -D / 2 + t / 2, grout);
    // Its tiles laid from the panel's corner, so the pieces line up.
    const g = new THREE.PlaneGeometry(w, h);
    const uv = g.getAttribute("uv") as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++)
      uv.setXY(
        i,
        (x0 + W / 2 + uv.getX(i) * w) / HEX_TILE[0],
        (y0 + uv.getY(i) * h) / HEX_TILE[1],
      );
    g.translate((x0 + x1) / 2, y0 + h / 2, -D / 2 + t + 0.0005);
    m.add(g, tile);
  }
};

/** A model drawing into another turned half round (its back is the
 * other's front): a kitchen island's cabinets face its working side. */
class Turned extends Model {
  constructor(private readonly into: Model) {
    super(into.W, into.D, into.H, false);
  }
  override add(g: THREE.BufferGeometry, material: THREE.Material): void {
    g.rotateY(Math.PI);
    this.into.add(g, material);
  }
}

/** A kitchen island (its working side at -z, seating at +z): a painted
 * base of shaker cabinets on its working side under a quartz top that
 * overhangs the seating side on square posts. At its far (+x) end, a
 * cabinet with a full-width drawer over a full-width door, then a wider
 * three-drawer cabinet, then cabinets with a drawer over doors. */
const kitchenIsland: Builder = (m, _o, tint, item) => {
  const { W, D, H } = m;
  const paint = mat(tint ?? "#4b5148", 0.7);
  const panel = mat(shade(tint ?? "#4b5148", 0.9), 0.75);
  const top = 0.04;
  const overhang = 0.02;
  const kick = 0.1;
  const cd = Math.min(0.61, D - 0.3);
  const L = W - 2 * overhang;
  const zc = -D / 2 + overhang + cd / 2;
  const cuts = item.model?.cuts;
  cutTop(m, W, top, D, 0, H - top, 0, quartzMaterial(), cuts);
  // The cabinets' box, its recessed kick on the working side.
  carcass(m, L, H - top - kick, cd, 0, kick, zc, paint, !!cuts);
  m.box(
    L - 0.01,
    kick,
    cd - 0.075,
    0,
    0,
    zc + 0.0375,
    mat(shade(tint ?? "#4b5148", 0.5), 0.8),
  );
  // The seating side: posts at its corners, aprons under the top.
  const post = 0.09;
  const pz = D / 2 - overhang - post / 2;
  const px = W / 2 - overhang - post / 2;
  for (const s of [-1, 1]) m.box(post, H - top, post, s * px, 0, pz, paint);
  const ap = 0.1;
  const z0 = zc + cd / 2;
  m.box(2 * px, ap, 0.03, 0, H - top - ap, pz, paint);
  for (const s of [-1, 1])
    m.box(0.03, ap, pz - z0, s * px, H - top - ap, (pz + z0) / 2, paint);
  // The fronts, on the working side (drawn turned, the far end first).
  const f = new Turned(m);
  const face = D / 2 - overhang;
  const gap = 0.003;
  const y0 = kick + gap;
  const faceH = H - top - kick - 2 * gap;
  const run: [number, number[], number][] = [];
  const rest = L - 1.5;
  run.push([0.6, [0.15], 1], [0.9, [0.15, 0.25, faceH - 0.4], 0]);
  if (rest >= 0.3) {
    const n = rest > 1.0 ? 2 : 1;
    for (let k = 0; k < n; k++) {
      const w = rest / n;
      run.push([w, [0.15], w > 0.6 ? 2 : 1]);
    }
  }
  // Turned, its far (+x) end is at -x.
  let x = -L / 2;
  for (const [w, drawers, doors] of run) {
    if (x + w > L / 2 + 1e-6) break;
    let y = y0 + faceH;
    for (const h of drawers) {
      shakerFront(
        f,
        x + w / 2,
        y - h + gap / 2,
        w - gap,
        h - gap,
        face,
        paint,
        panel,
      );
      barPull(
        f,
        x + w / 2,
        y - Math.min(h / 2, 0.075),
        face,
        false,
        w > 0.8 ? 0.305 : 0.192,
      );
      y -= h;
    }
    const dh = y - y0;
    if (doors > 0 && dh > 0.1) {
      const dw = w / doors;
      for (let k = 0; k < doors; k++) {
        const cx = x + dw * (k + 0.5);
        shakerFront(
          f,
          cx,
          y0 + gap / 2,
          dw - gap,
          dh - gap,
          face,
          paint,
          panel,
        );
        const edge = doors === 1 ? 1 : k % 2 === 0 ? 1 : -1;
        barPull(
          f,
          cx + edge * (dw / 2 - 0.045),
          y0 + dh - 0.07 - 0.064,
          face,
          true,
          0.128,
        );
      }
    }
    x += w;
  }
};

/** A rod between two points (a stool's frame). */
function rod(
  m: Model,
  a: THREE.Vector3,
  b: THREE.Vector3,
  r: number,
  material: THREE.Material,
): void {
  const dir = b.clone().sub(a);
  const len = dir.length();
  if (len < 1e-5) return;
  const g = new THREE.CylinderGeometry(r, r, len, 8);
  g.translate(0, len / 2, 0);
  g.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.normalize(),
    ),
  );
  g.translate(a.x, a.y, a.z);
  m.add(g, material);
}

const LEATHER = new Map<string, THREE.MeshStandardMaterial>();
/** Leather (both faces of a shell show). */
function leather(color: string): THREE.MeshStandardMaterial {
  let m = LEATHER.get(color);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.55,
      side: THREE.DoubleSide,
    });
    LEATHER.set(color, m);
  }
  return m;
}

/** A counter stool (back at -z): a brown leather bucket seat, its back
 * curving round and down to the sides, on a thin black metal frame with
 * a footrest and floor runners. */
const bucketStool: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  const hide = leather(tint ?? "#8b5a3b");
  const black = mat("#1d1d1f", 0.45, 0.6);
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const seatY = Math.min(0.66, H * 0.76);
  const sx = W / 2 - 0.06;
  const sz = D / 2 - 0.06;
  const fx = W / 2 - 0.03;
  const fz = D / 2 - 0.03;
  // Legs, splayed a little, runners along the floor, the footrest.
  const foot = 0.24;
  for (const a of [-1, 1]) {
    for (const b of [-1, 1])
      rod(
        m,
        v(a * sx, seatY - 0.04, b * sz),
        v(a * fx, 0.01, b * fz),
        0.008,
        black,
      );
    rod(m, v(a * fx, 0.01, -fz), v(a * fx, 0.01, fz), 0.007, black);
  }
  const at = (a: number, b: number) => {
    const t = (seatY - 0.04 - foot) / (seatY - 0.05);
    return v(a * (sx + (fx - sx) * t), foot, b * (sz + (fz - sz) * t));
  };
  rod(m, at(-1, 1), at(1, 1), 0.008, black);
  for (const a of [-1, 1]) rod(m, at(a, -1), at(a, 1), 0.007, black);
  m.box(2 * sx, 0.015, 2 * sz, 0, seatY - 0.05, 0, black);
  // The seat cushion, and its bucket back.
  m.soft(W - 0.04, 0.07, D - 0.06, 0, seatY - 0.04, 0.01, hide, 0.03);
  const r = Math.min(W, D) / 2 - 0.02;
  const backH = H - seatY;
  const g = new THREE.CylinderGeometry(
    r,
    r * 0.96,
    backH,
    24,
    4,
    true,
    Math.PI - 1.75,
    3.5,
  );
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const off = Math.abs(Math.atan2(x, -z));
    const t = (pos.getY(i) + backH / 2) / backH;
    pos.setY(i, -backH / 2 + t * backH * (0.45 + 0.55 * Math.cos(off * 0.6)));
  }
  g.computeVertexNormals();
  g.translate(0, seatY + backH / 2 - 0.01, 0.02);
  m.add(g, hide);
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

/** A pro-style round bar handle on two standoffs, along y (from `y0` up
 * `len`) or across x (centred), its face plane at `z`. */
function tubeHandle(
  m: Model,
  x: number,
  y0: number,
  z: number,
  len: number,
  steel: THREE.Material,
  across = false,
): void {
  const r = 0.011;
  const out = 0.045;
  if (across) {
    m.cyl(r, r, len, x, y0, z + out, steel, 14, "x");
    for (const s of [-1, 1])
      m.cyl(
        0.008,
        0.009,
        out,
        x + s * (len / 2 - 0.03),
        y0,
        z + out / 2,
        steel,
        10,
        "z",
      );
  } else {
    m.cyl(r, r, len, x, y0, z + out, steel, 14);
    for (const s of [0.04, len - 0.04])
      m.cyl(0.008, 0.009, out, x, y0 + s, z + out / 2, steel, 10, "z");
  }
}

/** Beko's 36" four-door French-door fridge (front at +z): brushed steel,
 * a pair of doors over a pair of lower freezer doors, round bar handles
 * by the middle, a dark toe grille on levelling feet. */
const bekoFridge: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  const steel = mat(tint ?? "#c9cccf", 0.32, 0.7);
  const bright = mat("#e3e6e8", 0.2, 0.9);
  const dark = mat("#2a2b2d", 0.6);
  const feet = 0.04;
  const kick = 0.06;
  m.box(W - 0.01, H - feet, D - 0.05, 0, feet, -0.025, steel);
  m.box(W - 0.04, kick, 0.02, 0, feet, D / 2 - 0.05, dark);
  for (const s of [-1, 1])
    m.cyl(0.018, 0.018, feet, s * (W / 2 - 0.05), 0, D / 2 - 0.08, dark, 10);
  const fz = D / 2 - 0.025;
  const gap = 0.006;
  const base = feet + kick;
  const split = base + (H - base) * 0.4;
  for (const s of [-1, 1]) {
    const x = (s * W) / 4;
    // Lower and upper doors, a hinge cap at the top outer corner.
    m.box(W / 2 - gap, split - base - gap, 0.04, x, base, fz, steel);
    m.box(W / 2 - gap, H - split - gap, 0.04, x, split + gap / 2, fz, steel);
    m.box(0.05, 0.012, 0.04, s * (W / 2 - 0.04), H - 0.012, fz, bright);
    // Handles by the middle.
    const hx = s * 0.045;
    tubeHandle(m, hx, split + 0.07, fz + 0.02, (H - split) * 0.7, bright);
    tubeHandle(m, hx, base + 0.08, fz + 0.02, (split - base) * 0.62, bright);
  }
  // The badge.
  m.box(0.07, 0.015, 0.003, W / 2 - 0.1, H - 0.08, fz + 0.021, dark);
};

/** Beko's 30" pro-style gas range (front at +z): stainless body on
 * legs, four sealed burners under continuous cast-iron grates, six knobs
 * on the control band, a big oven window, a bar handle. */
const bekoRange: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  const steel = mat(tint ?? "#c9cccf", 0.32, 0.7);
  const bright = mat("#e3e6e8", 0.2, 0.9);
  const black = mat("#1c1c1e", 0.5);
  const glass = mat("#1e2226", 0.08, 0.3);
  const legs = 0.07;
  const top = H - 0.03;
  // Legs, the body, a recessed kick between the front legs.
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      m.cyl(
        0.02,
        0.018,
        legs,
        sx * (W / 2 - 0.04),
        0,
        sz * (D / 2 - 0.06),
        black,
        12,
      );
  m.box(W, top - legs, D - 0.04, 0, legs, -0.02, steel);
  const fz = D / 2 - 0.02;
  // The cooktop: black enamel, burners, two cast-iron grates.
  m.box(W - 0.02, 0.012, D - 0.06, 0, top, -0.02, black);
  const grate = mat("#232325", 0.75, 0.2);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      const x = (sx * W) / 4;
      const z = -0.02 + (sz * (D - 0.06)) / 4;
      m.cyl(0.05, 0.055, 0.02, x, top, z, mat("#3a3a3c", 0.4, 0.5), 20);
      m.cyl(0.035, 0.035, 0.012, x, top + 0.02, z, black, 18);
    }
  const gy = top + 0.035;
  for (const sx of [-1, 1]) {
    const gx = (sx * W) / 4;
    const gw = W / 2 - 0.02;
    const gd = D - 0.08;
    // The grate's frame and its fingers.
    for (const sz of [-1, 1])
      m.box(gw, 0.015, 0.012, gx, gy, -0.02 + sz * (gd / 2 - 0.006), grate);
    for (const s of [-1, 1])
      m.box(0.012, 0.015, gd, gx + s * (gw / 2 - 0.006), gy, -0.02, grate);
    m.box(gw, 0.015, 0.012, gx, gy, -0.02, grate);
    m.box(0.012, 0.015, gd, gx, gy, -0.02, grate);
    for (const t of [-0.3, 0.3]) {
      m.box(gw, 0.012, 0.01, gx, gy, -0.02 + t * gd, grate);
      m.box(0.01, 0.012, gd, gx + t * gw, gy, -0.02, grate);
    }
  }
  // A low back guard.
  m.box(W, 0.07, 0.03, 0, top, -D / 2 + 0.015, steel);
  // The control band and its knobs.
  const band = top - 0.13;
  m.box(W, 0.12, 0.02, 0, band, fz, steel);
  const ky = band + 0.06;
  const knobs = [-0.3, -0.21, -0.07, 0.02, 0.16, 0.25].map(
    (k) => k * (W / 0.76),
  );
  for (const kx of knobs) {
    m.cyl(0.024, 0.026, 0.03, kx, ky, fz + 0.025, bright, 18, "z");
    m.cyl(0.006, 0.006, 0.006, kx, ky + 0.012, fz + 0.042, black, 6, "z");
  }
  m.cyl(
    0.006,
    0.006,
    0.004,
    -W / 2 + 0.05,
    ky,
    fz + 0.012,
    mat("#ff7a2a", 0.4, 0, { glow: "#ff7a2a", glowLevel: 0.2 }),
    10,
    "z",
  );
  // The oven door: steel round a big dark window, the handle above.
  const dy = legs + 0.05;
  const dh = band - 0.012 - dy;
  m.box(W - 0.01, dh, 0.03, 0, dy, fz, steel);
  m.box(W * 0.78, dh * 0.5, 0.004, 0, dy + dh * 0.2, fz + 0.016, glass);
  tubeHandle(m, 0, dy + dh - 0.06, fz + 0.015, W * 0.82, bright, true);
  m.box(0.05, 0.012, 0.003, 0, dy + 0.06, fz + 0.016, black);
  // The kick under the door, between the legs.
  m.box(W - 0.06, 0.05, 0.02, 0, legs, fz - 0.04, black);
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

/** A propane tank on its side (along the width): a white cylinder with
 * rounded ends on two saddle feet, the dome cover over its valves on top. */
const propaneTank: Builder = (m, _o, tint) => {
  const { W, D, H } = m;
  const white = mat(tint ?? "#ecebe6", 0.35, 0.3);
  const steel = mat(C.charcoal, 0.6, 0.5);
  const r = Math.min(D / 2, (H - 0.16) / 2);
  const cy = H - 0.16 - r + 0.16;
  const body = Math.max(0.1, W - 2 * r);
  m.cyl(r, r, body, 0, cy, 0, white, 32, "x");
  for (const s of [-1, 1])
    m.sphere(r, (s * body) / 2, cy, 0, white, 0.55, 1, 1);
  // Saddle feet under it, a quarter in from each end.
  for (const s of [-1, 1]) {
    const x = (s * body) / 3;
    m.box(0.12, cy - r * 0.6, D * 0.7, x, 0, 0, steel);
    m.box(0.3, 0.03, D * 0.8, x, 0, 0, steel);
  }
  // The dome cover on top, middle.
  m.cyl(r * 0.36, r * 0.4, 0.14, 0, cy + r - 0.04, 0, white, 24);
  m.sphere(r * 0.36, 0, cy + r + 0.1, 0, white, 1, 0.35, 1);
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

/** A value along a car's length from keyframes ([t, value], t 0 at its
 * tail … 1 at its nose), straight between them. */
function keyed(keys: [number, number][], t: number): number {
  if (t <= keys[0]![0]) return keys[0]![1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i]!;
    if (t <= t1) {
      const [t0, v0] = keys[i - 1]!;
      return v0 + ((v1 - v0) * (t - t0)) / Math.max(1e-6, t1 - t0);
    }
  }
  return keys[keys.length - 1]![1];
}

/** One cross-section of a lofted car part at `z`: from `y0` (its foot,
 * half-width `hw0`) to `y1` (its top, half-width `hw1`), its top corners
 * rounded `r`, its foot's `rb`. */
interface CarSection {
  z: number;
  y0: number;
  y1: number;
  hw0: number;
  hw1: number;
  r: number;
  rb: number;
}

/** A car part lofted through its sections (tail to nose): a smooth skin
 * round each rounded section, capped flat at both ends. */
function loft(
  m: Model,
  sections: CarSection[],
  material: THREE.Material,
): void {
  const arc = 5;
  const ring = (s: CarSection): [number, number][] => {
    const h = Math.max(0.002, s.y1 - s.y0);
    const r = Math.min(s.r, h * 0.48, s.hw1 * 0.9);
    const rb = Math.min(s.rb, h * 0.3, s.hw0 * 0.9);
    const pts: [number, number][] = [];
    const corner = (cx: number, cy: number, rr: number, a0: number) => {
      for (let k = 0; k < arc; k++) {
        const a = a0 + ((Math.PI / 2) * k) / (arc - 1);
        pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
      }
    };
    corner(s.hw0 - rb, s.y0 + rb, rb, -Math.PI / 2);
    corner(s.hw1 - r, s.y1 - r, r, 0);
    corner(-s.hw1 + r, s.y1 - r, r, Math.PI / 2);
    corner(-s.hw0 + rb, s.y0 + rb, rb, Math.PI);
    return pts;
  };
  const rings = sections.map(ring);
  const n = rings[0]!.length;
  const pos: number[] = [];
  for (let k = 0; k < sections.length; k++)
    for (const [x, y] of rings[k]!) pos.push(x, y, sections[k]!.z);
  const idx: number[] = [];
  for (let k = 0; k + 1 < sections.length; k++)
    for (let i = 0; i < n; i++) {
      const a = k * n + i;
      const a1 = k * n + ((i + 1) % n);
      const b = (k + 1) * n + i;
      const b1 = (k + 1) * n + ((i + 1) % n);
      idx.push(a, a1, b, a1, b1, b);
    }
  const skin = new THREE.BufferGeometry();
  skin.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  skin.setIndex(idx);
  skin.computeVertexNormals();
  m.add(skin, material);
  // The ends: flat caps, the tail's facing back, the nose's forward.
  for (const [k, sign] of [
    [0, -1],
    [sections.length - 1, 1],
  ] as const) {
    const s = sections[k]!;
    const pts = rings[k]!;
    const cx = 0;
    const cy = (s.y0 + s.y1) / 2;
    const cap: number[] = [];
    for (let i = 0; i < n; i++) {
      const [x0, y0] = pts[i]!;
      const [x1, y1] = pts[(i + 1) % n]!;
      if (sign > 0) cap.push(cx, cy, s.z, x0, y0, s.z, x1, y1, s.z);
      else cap.push(cx, cy, s.z, x1, y1, s.z, x0, y0, s.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(cap, 3));
    g.computeVertexNormals();
    m.add(g, material);
  }
}

/** A skin lying on a car's glasshouse sides (a pillar), over t0…t1
 * along it and from `f0` to `f1` of the way up its side (0 the belt, 1
 * where the roof's curve begins), a hair proud of the glass. */
function houseSkin(
  m: Model,
  house: (t: number) => CarSection,
  t0: number,
  t1: number,
  f0: number,
  f1: number,
  material: THREE.Material,
): void {
  const nT = 8;
  const nF = 3;
  const at = (t: number, f: number, side: number): [number, number, number] => {
    const c = house(t);
    const h = Math.max(0.002, c.y1 - c.y0);
    const r = Math.min(c.r, h * 0.48, c.hw1 * 0.9);
    const rb = Math.min(c.rb, h * 0.3, c.hw0 * 0.9);
    const x = c.hw0 + (c.hw1 - c.hw0) * f + 0.006;
    const y = c.y0 + rb + (c.y1 - r - c.y0 - rb) * f;
    return [side * x, y, c.z];
  };
  for (const side of [-1, 1]) {
    const pos: number[] = [];
    for (let i = 0; i < nT; i++)
      for (let j = 0; j < nF; j++) {
        const ta = t0 + ((t1 - t0) * i) / nT;
        const tb = t0 + ((t1 - t0) * (i + 1)) / nT;
        const fa = f0 + ((f1 - f0) * j) / nF;
        const fb = f0 + ((f1 - f0) * (j + 1)) / nF;
        const p00 = at(ta, fa, side);
        const p01 = at(ta, fb, side);
        const p10 = at(tb, fa, side);
        const p11 = at(tb, fb, side);
        const quad =
          side > 0
            ? [p00, p01, p10, p01, p11, p10]
            : [p00, p10, p01, p01, p10, p11];
        for (const q of quad) pos.push(...q);
      }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    m.add(g, material);
  }
}

/** A car's shape, its tail at t 0 and nose at t 1 (each value keyed
 * along it): its body from its sills or bumpers (`bottom`) to its belt
 * and bonnet (`top`), its glasshouse from the belt to the roof (`roof`,
 * over `glass` t0…t1), their half-widths as fractions of `half`, and
 * its wheels. */
interface CarSpec {
  half: number;
  /** Its real length (metres): the axles keep their places on it at
   * whatever length it's drawn. */
  length: number;
  bottom: [number, number][];
  top: [number, number][];
  width: [number, number][];
  glass: [number, number];
  roof: [number, number][];
  /** The glasshouse's half-width at the belt and the roof (of `half`). */
  belt: number;
  crown: number;
  /** The painted roof panel over t0…t1. */
  panel: [number, number];
  wheelR: number;
  /** The axles' distance back from the nose, metres. */
  front: number;
  base: number;
}

/** Builds a car from its spec (front at +z): the lofted body, glass and
 * roof, wheels in arches; returns where things are for its details. */
function carShape(
  m: Model,
  spec: CarSpec,
  paint: THREE.Material,
  glass: THREE.Material,
  rim: THREE.Material,
  wheel: { spokes?: number; twin?: boolean } = {},
) {
  const L = m.D;
  const zOf = (t: number) => -L / 2 + t * L;
  const ts: number[] = [0, 0.005, 0.015, 0.03];
  for (let k = 1; k < 30; k++) ts.push(0.03 + (0.94 * k) / 30);
  ts.push(0.97, 0.985, 0.995, 1);
  const body = ts.map((t) => ({
    z: zOf(t),
    y0: keyed(spec.bottom, t),
    y1: keyed(spec.top, t),
    hw0: spec.half * keyed(spec.width, t) * 0.96,
    hw1: spec.half * keyed(spec.width, t) * 0.97,
    r: 0.14,
    rb: 0.06,
  }));
  loft(m, body, paint);
  const [g0, g1] = spec.glass;
  const gts: number[] = [];
  for (let k = 0; k <= 28; k++) gts.push(g0 + ((g1 - g0) * k) / 28);
  const halfAt = (t: number) => spec.half * keyed(spec.width, t);
  const house = (t: number): CarSection => ({
    z: zOf(t),
    y0: keyed(spec.top, t) - 0.02,
    y1: keyed(spec.roof, t),
    hw0: halfAt(t) * spec.belt,
    hw1: halfAt(t) * spec.crown,
    r: 0.1,
    rb: 0.005,
  });
  loft(m, gts.map(house), glass);
  // The roof panel, a skin over the glass's top.
  const [p0, p1] = spec.panel;
  const pts: number[] = [];
  for (let k = 0; k <= 16; k++) pts.push(p0 + ((p1 - p0) * k) / 16);
  loft(
    m,
    pts.map((t) => {
      const s = house(t);
      return {
        z: s.z,
        y0: s.y1 - 0.05,
        y1: s.y1 + 0.012,
        hw0: s.hw1 + 0.004,
        hw1: s.hw1 - 0.02,
        r: 0.06,
        rb: 0.004,
      };
    }),
    paint,
  );
  // Wheels, each in a dark arch.
  const r = spec.wheelR;
  const k = L / spec.length;
  const zf = L / 2 - spec.front * k;
  const zr = zf - spec.base * k;
  const dark = mat("#141414", 0.9);
  for (const z of [zf, zr]) {
    const t = (z + L / 2) / L;
    const hw = halfAt(t) * 0.96;
    for (const s of [-1, 1]) {
      m.cyl(r + 0.06, r + 0.06, 0.02, s * (hw + 0.002), r, z, dark, 28, "x");
      carWheel(m, s * (hw - 0.12), z, r, rim, wheel.spokes, wheel.twin);
    }
  }
  return {
    zOf,
    halfAt,
    house,
    skin: (
      t0: number,
      t1: number,
      f0: number,
      f1: number,
      material: THREE.Material,
    ) => houseSkin(m, house, t0, t1, f0, f1, material),
    top: (t: number) => keyed(spec.top, t),
    roof: (t: number) => keyed(spec.roof, t),
  };
}

/** A wheel at (x, z): tyre, an alloy of `spokes` spokes (paired when
 * `twin`), the hub. */
function carWheel(
  m: Model,
  x: number,
  z: number,
  r: number,
  rim: THREE.Material,
  spokes = 5,
  twin = false,
): void {
  const tyre = mat(C.rubber, 0.9);
  const side = Math.sign(x) || 1;
  const face = x + side * 0.128;
  m.cyl(r, r, 0.26, x, r, z, tyre, 32, "x");
  m.cyl(r * 0.74, r * 0.74, 0.262, x, r, z, mat("#262626", 0.6), 28, "x");
  m.cyl(r * 0.17, r * 0.17, 0.27, x, r, z, rim, 14, "x");
  const n = twin ? spokes * 2 : spokes;
  for (let k = 0; k < n; k++) {
    const a = twin
      ? (Math.floor(k / 2) * 2 * Math.PI) / spokes + (k % 2 ? 0.09 : -0.09)
      : (k * 2 * Math.PI) / spokes;
    const g = new THREE.BoxGeometry(0.025, r * 0.6, twin ? 0.03 : 0.05);
    g.translate(0, r * 0.15 + r * 0.3, 0);
    g.rotateX(a);
    g.translate(face, r, z);
    m.add(g, rim);
  }
  const lip = new THREE.TorusGeometry(r * 0.73, 0.012, 6, 32);
  lip.rotateY(Math.PI / 2);
  lip.translate(face, r, z);
  m.add(lip, rim);
}

/** A Land Rover Discovery (5th generation; front at +z), to its real
 * shape: a high flat bonnet and blunt nose, a steeply raked screen and a
 * long flat roof ending in a spoiler, the belt rising toward the tail, a
 * black B-pillar, a thick body-coloured C-pillar and the rear quarter
 * window kicked up above the belt, slim wrap-round lights, a vent in the
 * front wing, black sills, the number plate offset on the tailgate over
 * a silver skid plate, big multi-spoke alloys. Red unless coloured. */
const discovery: Builder = (m, _o, tint) => {
  const { W } = m;
  const paint = mat(tint ?? "#a01c22", 0.25, 0.55);
  const glass = mat("#121a22", 0.05, 0.45);
  const black = mat("#131313", 0.45);
  const trim = mat("#2a2a2c", 0.5, 0.3);
  const silver = mat("#b4b8bc", 0.3, 0.7);
  const rim = mat("#b8bcc0", 0.25, 0.85);
  const half = Math.min(W / 2 - 0.08, 1.035);
  const c = carShape(
    m,
    {
      half,
      length: 4.956,
      bottom: [
        [0, 0.56],
        [0.02, 0.49],
        [0.06, 0.44],
        [0.2, 0.43],
        [0.8, 0.43],
        [0.94, 0.41],
        [0.985, 0.4],
        [1, 0.46],
      ],
      top: [
        [0, 1.1],
        [0.012, 1.19],
        [0.05, 1.22],
        [0.25, 1.17],
        [0.5, 1.13],
        [0.72, 1.11],
        [0.8, 1.1],
        [0.95, 1.085],
        [0.985, 1.06],
        [1, 1.0],
      ],
      width: [
        [0, 0.86],
        [0.012, 0.94],
        [0.05, 0.99],
        [0.1, 1],
        [0.92, 1],
        [0.97, 0.97],
        [0.99, 0.93],
        [1, 0.88],
      ],
      glass: [0.012, 0.73],
      roof: [
        [0.012, 1.22],
        [0.02, 1.62],
        [0.034, 1.84],
        [0.06, 1.885],
        [0.44, 1.89],
        [0.47, 1.87],
        [0.54, 1.86],
        [0.6, 1.66],
        [0.73, 1.11],
      ],
      belt: 0.94,
      crown: 0.82,
      panel: [0.03, 0.545],
      wheelR: 0.4,
      front: 0.86,
      base: 2.923,
    },
    paint,
    glass,
    rim,
    { spokes: 10, twin: true },
  );
  const { zOf, house, skin } = c;
  // The pillars: black B, a thick body-coloured C, the quarter window's
  // foot kicked up above the belt, the body-coloured tail of it.
  skin(0.44, 0.475, 0, 1, black);
  skin(0.232, 0.272, 0, 1, paint);
  skin(0.05, 0.232, 0, 0.16, paint);
  skin(0.012, 0.05, 0, 1, paint);
  // The windscreen's black pillars, the roof's spoiler and its dark
  // glass panels.
  for (const s of [-1, 1]) {
    const a = house(0.728);
    const b = house(0.548);
    rod(
      m,
      new THREE.Vector3(s * (a.hw0 + 0.006), a.y0 + 0.02, a.z),
      new THREE.Vector3(s * (b.hw1 + 0.006), b.y1 - 0.07, b.z),
      0.028,
      black,
    );
  }
  const roof = house(0.25);
  m.box(
    roof.hw1 * 2 - 0.08,
    0.03,
    zOf(0.045) - zOf(-0.006),
    0,
    roof.y1 - 0.01,
    (zOf(0.045) + zOf(-0.006)) / 2,
    paint,
  );
  for (const [t0, t1] of [
    [0.09, 0.27],
    [0.3, 0.52],
  ] as const) {
    const h = house((t0 + t1) / 2);
    m.box(
      h.hw1 * 2 - 0.22,
      0.006,
      zOf(t1) - zOf(t0),
      0,
      h.y1 + 0.009,
      (zOf(t0) + zOf(t1)) / 2,
      glass,
    );
  }
  // The flanks: mirrors, the wing vent, door handles, black sills.
  const fender = (t: number) => c.halfAt(t) * 0.97;
  for (const s of [-1, 1]) {
    m.soft(
      0.07,
      0.13,
      0.24,
      s * (half + 0.04),
      c.top(0.69) - 0.01,
      zOf(0.69),
      paint,
      0.035,
    );
    m.box(
      0.02,
      0.035,
      0.24,
      s * (fender(0.82) + 0.002),
      0.98,
      zOf(0.82),
      black,
    );
    m.box(
      0.022,
      0.008,
      0.24,
      s * (fender(0.82) + 0.003),
      1.0,
      zOf(0.82),
      silver,
    );
    for (const t of [0.6, 0.36])
      m.box(0.02, 0.022, 0.16, s * (fender(t) + 0.004), 1.04, zOf(t), paint);
    m.box(
      0.035,
      0.12,
      zOf(0.66) - zOf(0.3),
      s * (fender(0.5) - 0.005),
      0.42,
      (zOf(0.66) + zOf(0.3)) / 2,
      black,
    );
    // Tail lights wrapping round onto the flanks.
    m.box(
      0.02,
      0.05,
      zOf(0.05) - zOf(0.004),
      s * (fender(0.03) + 0.003),
      1.1,
      (zOf(0.05) + zOf(0.004)) / 2,
      mat("#9e1218", 0.3, 0, { glow: "#ff2020", glowLevel: 0.1 }),
    );
    // Headlights wrapping round onto the wings.
    m.box(
      0.02,
      0.05,
      zOf(0.998) - zOf(0.955),
      s * (fender(0.975) + 0.002),
      0.98,
      (zOf(0.998) + zOf(0.955)) / 2,
      mat("#e9eef2", 0.15, 0.3, { glow: "#ffffff", glowLevel: 0.12 }),
    );
  }
  // The nose: slim headlights at its top corners, the black mesh grille
  // between them, the bumper's side intakes and a silver skid plate.
  const nose = m.D / 2 + 0.006;
  const nw = c.halfAt(1) * 0.92;
  const lamp = mat("#e9eef2", 0.15, 0.3, { glow: "#ffffff", glowLevel: 0.12 });
  const drl = mat("#ffffff", 0.2, 0, { glow: "#ffffff", glowLevel: 0.5 });
  for (const s of [-1, 1]) {
    m.box(nw * 0.34, 0.06, 0.012, s * nw * 0.6, 0.92, nose, lamp);
    m.box(nw * 0.32, 0.01, 0.014, s * nw * 0.6, 0.925, nose, drl);
    m.box(nw * 0.12, 0.2, 0.012, s * nw * 0.78, 0.55, nose, black);
  }
  m.box(nw * 0.84, 0.15, 0.012, 0, 0.8, nose, black);
  for (let k = 0; k < 4; k++)
    m.box(nw * 0.82, 0.008, 0.014, 0, 0.82 + k * 0.032, nose + 0.001, trim);
  m.box(nw * 1.6, 0.14, 0.012, 0, 0.6, nose, paint);
  m.box(nw * 1.0, 0.06, 0.012, 0, 0.47, nose, silver);
  // The tail: slim lights across its corners, the name, the plate
  // offset to one side, the black bumper and silver skid plate.
  const tail = -m.D / 2 - 0.006;
  const tw = c.halfAt(0) * 0.92;
  const red = mat("#9e1218", 0.3, 0, { glow: "#ff2020", glowLevel: 0.1 });
  for (const s of [-1, 1])
    m.box(tw * 0.34, 0.05, 0.012, s * tw * 0.8, 1.06, tail, red);
  m.box(tw * 0.55, 0.018, 0.012, 0, 1.0, tail, mat("#d9dcdf", 0.3, 0.6));
  m.box(0.52, 0.11, 0.012, -tw * 0.35, 0.86, tail, mat("#eeeeea", 0.4));
  m.box(tw * 1.9, 0.12, 0.012, 0, 0.66, tail, black);
  m.box(tw * 1.3, 0.08, 0.012, 0, 0.58, tail, silver);
};

/** A Mercedes-Benz GLC (front at +z): a sleek SUV, its roof sloping down
 * to a raked rear window under a spoiler, a long bonnet, a big grille
 * with the star in it between slim headlights, chrome round the side
 * windows, slim tail lights. Silver unless coloured. */
const glc: Builder = (m, _o, tint) => {
  const { W } = m;
  const paint = mat(tint ?? "#b9bdc1", 0.22, 0.75);
  const glass = mat("#121a22", 0.06, 0.4);
  const black = mat("#141414", 0.4);
  const chrome = mat(C.chrome, 0.15, 0.95);
  const rim = mat("#c8ccd0", 0.25, 0.85);
  const half = Math.min(W / 2 - 0.08, 0.945);
  const c = carShape(
    m,
    {
      half,
      length: 4.716,
      bottom: [
        [0, 0.47],
        [0.04, 0.39],
        [0.2, 0.37],
        [0.8, 0.37],
        [0.96, 0.35],
        [1, 0.44],
      ],
      top: [
        [0, 0.97],
        [0.012, 1.05],
        [0.06, 1.08],
        [0.3, 1.05],
        [0.72, 1.0],
        [0.8, 0.98],
        [0.95, 0.9],
        [0.985, 0.86],
        [1, 0.8],
      ],
      width: [
        [0, 0.84],
        [0.012, 0.93],
        [0.05, 0.99],
        [0.1, 1],
        [0.88, 1],
        [0.96, 0.95],
        [0.99, 0.88],
        [1, 0.82],
      ],
      glass: [0.02, 0.745],
      roof: [
        [0.02, 1.1],
        [0.035, 1.3],
        [0.07, 1.47],
        [0.12, 1.56],
        [0.2, 1.61],
        [0.42, 1.645],
        [0.52, 1.63],
        [0.56, 1.6],
        [0.65, 1.36],
        [0.745, 1.02],
      ],
      belt: 0.91,
      crown: 0.72,
      panel: [0.1, 0.555],
      wheelR: 0.365,
      front: 0.86,
      base: 2.888,
    },
    paint,
    glass,
    rim,
    { spokes: 5, twin: true },
  );
  const { zOf, house, skin } = c;
  skin(0.43, 0.46, 0, 1, black);
  skin(0.215, 0.24, 0, 1, black);
  skin(0.03, 0.13, 0, 1, paint);
  // A small spoiler over the rear window.
  const lip = house(0.2);
  m.box(
    lip.hw1 * 2 - 0.1,
    0.025,
    zOf(0.07) - zOf(0.015),
    0,
    keyed(
      [
        [0.015, 1.3],
        [0.07, 1.47],
      ],
      0.05,
    ) + 0.02,
    (zOf(0.07) + zOf(0.015)) / 2,
    black,
  );
  for (const s of [-1, 1]) {
    // Chrome along the belt and round the side windows' top.
    const along: THREE.Vector3[] = [];
    for (let t = 0.13; t <= 0.56; t += 0.043) {
      const h = house(t);
      along.push(new THREE.Vector3(s * (h.hw1 + 0.012), h.y1 - 0.03, h.z));
    }
    for (let i = 0; i + 1 < along.length; i++)
      rod(m, along[i]!, along[i + 1]!, 0.008, chrome);
    const b0 = house(0.13);
    const b1 = house(0.725);
    rod(
      m,
      new THREE.Vector3(s * (b0.hw0 + 0.008), b0.y0 + 0.03, b0.z),
      new THREE.Vector3(s * (b1.hw0 + 0.008), b1.y0 + 0.03, b1.z),
      0.008,
      chrome,
    );
    // Roof rails, mirrors.
    const rail = house(0.35);
    m.box(
      0.025,
      0.03,
      zOf(0.56) - zOf(0.18),
      s * (rail.hw1 - 0.05),
      rail.y1 + 0.005,
      (zOf(0.56) + zOf(0.18)) / 2,
      chrome,
    );
    m.soft(0.06, 0.12, 0.2, s * (half + 0.03), 1.0, zOf(0.72), paint, 0.03);
  }
  // The nose: a big grille with the star in it, slim headlights at its
  // upper corners, intakes in the bumper below.
  const nose = m.D / 2 + 0.006;
  const nw = half * 0.82;
  m.box(nw * 0.95, 0.26, 0.012, 0, 0.47, nose, black);
  for (const s of [-1, 1])
    m.box(0.018, 0.26, 0.014, s * nw * 0.475, 0.47, nose + 0.001, chrome);
  m.box(nw * 0.95, 0.018, 0.014, 0, 0.73, nose + 0.001, chrome);
  m.box(nw * 0.9, 0.01, 0.014, 0, 0.6, nose + 0.001, chrome);
  m.cyl(0.075, 0.075, 0.012, 0, 0.6, nose + 0.008, chrome, 28, "z");
  for (let k = 0; k < 3; k++) {
    const g = new THREE.BoxGeometry(0.012, 0.07, 0.006);
    g.translate(0, 0.035, 0);
    g.rotateZ((k * 2 * Math.PI) / 3);
    g.translate(0, 0.6, nose + 0.016);
    m.add(g, black);
  }
  const lamp = mat("#e9eef2", 0.15, 0.3, { glow: "#ffffff", glowLevel: 0.12 });
  for (const s of [-1, 1]) {
    m.box(nw * 0.3, 0.055, 0.012, s * nw * 0.62, 0.72, nose, lamp);
    m.box(nw * 0.22, 0.09, 0.012, s * nw * 0.78, 0.47, nose, black);
  }
  // The tail: slim lights round its corners, chrome between, the plate,
  // the diffuser.
  const tail = -m.D / 2 - 0.006;
  const tw = half * 0.84;
  const red = mat("#9e1218", 0.3, 0, { glow: "#ff2020", glowLevel: 0.1 });
  for (const s of [-1, 1])
    m.box(tw * 0.42, 0.06, 0.012, s * tw * 0.66, 0.88, tail, red);
  m.box(tw * 1.0, 0.012, 0.012, 0, 0.8, tail, chrome);
  m.box(0.52, 0.11, 0.012, 0, 0.66, tail, mat("#eeeeea", 0.4));
  m.box(tw * 1.9, 0.11, 0.012, 0, 0.5, tail, black);
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
  [/^propane_tank/, propaneTank],
  [/^gate_(hog|wood)_/, gate],
  [/wheelie_bin|^garbage_bin$|^garbage_cart|^recycling_cart/, wheelieBin],
  [/^tv_|_tv$|^tv\d/, tv],
  [/^island_shaker/, kitchenIsland],
  [/^backsplash_/, backsplash],
  [/^sink_delta_everest/, everestSink],
  [/^faucet_delta_nicoli/, nicoliFaucet],
  [/^sink_rack_/, sinkRack],
  [/^stool_leather_bucket/, bucketStool],
  [/^shaker_/, shaker],
  [/^fridge_beko/, bekoFridge],
  [/^range_beko/, bekoRange],
  [/^bed_nera/, neraBed],
  [/^media_nera/, neraMedia],
  [/^sofa_ceni|^chair_ceni/, ceniSofa],
  [/^ottoman_ceni/, ceniOttoman],
  [/^car_land_rover_discovery/, discovery],
  [/^car_mercedes_glc/, glc],
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
