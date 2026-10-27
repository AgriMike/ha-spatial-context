/** Outdoor lights and plantings as 3D models (part of the lazily loaded 3D
 * module, beside furniture-models.ts): Philips Hue's outdoor fixtures and
 * the common sconces, spots, floods and path lights, each with its lens
 * glowing in its light's colour while on; and trees, shrubs, grasses,
 * yuccas, flowers and boulders, and houseplants in their pots, grown from a seed of the item's id so each
 * one is a little different and stays the same from one draw to the next.
 *
 * The item's frame is furniture-models.ts's: x across its width, z from
 * its back (-depth/2, against the wall for a wall light) to its front, y
 * up from its base (the ground, for things standing in the yard). */

import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { Model, mat } from "./furniture-models";
import type { Item3d } from "./view3d-api";

type Opts = Record<string, string | number | boolean | undefined>;
type V3 = THREE.Vector3;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const num = (o: Opts, k: string, d: number): number => {
  const v = o[k];
  return typeof v === "number" ? v : d;
};
const str = (o: Opts, k: string, d: string): string => {
  const v = o[k];
  return typeof v === "string" && v ? v : d;
};

/** A random stream seeded by a string (mulberry32 over its hash). */
function seeded(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A colour made lighter or darker (k > 1 lighter). */
function tone(hex: string, k: number): string {
  const c = new THREE.Color(hex);
  if (k >= 1) c.lerp(new THREE.Color("#ffffff"), Math.min(1, k - 1));
  else c.multiplyScalar(k);
  return `#${c.getHexString()}`;
}

// --- materials ----------------------------------------------------------------

/** Foliage, bark-free plant parts and rock: coloured vertex by vertex
 * (lighter on top, darker beneath and inside, flecked), so a canopy reads
 * as a mass of leaves rather than painted blobs; blades, fronds and
 * petals (`SHEET`) show from both sides. */
const FOLIAGE = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.9,
});
const SHEET = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.85,
  side: THREE.DoubleSide,
});

/** A light's lens or diffuser: frosted while off, glowing in the light's
 * colour while on. */
function lens(
  item: Item3d,
  off = "#e9e6df",
  lit = item.light,
): THREE.MeshStandardMaterial {
  if (!lit) return mat(off, 0.3);
  const c = new THREE.Color(lit.color).lerp(new THREE.Color("#ffffff"), 0.45);
  return mat(`#${c.getHexString()}`, 0.4, 0, {
    glow: lit.color,
    glowLevel: 0.9 + 1.8 * lit.level,
  });
}

/** Glows waiting to be added to a model as it's grouped (see halo). */
const GLOWS = new WeakMap<
  Model,
  { x: number; y: number; z: number; r: number; lit: Light }[]
>();
type Light = NonNullable<Item3d["light"]>;

let glowTexture: THREE.Texture | null = null;
const SPRITES = new Map<string, THREE.SpriteMaterial>();
/** A soft round glow: white at the middle, fading to nothing at its rim. */
function glowMap(): THREE.Texture {
  if (glowTexture) return glowTexture;
  const cv = document.createElement("canvas");
  cv.width = 64;
  cv.height = 64;
  const ctx = cv.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.55)");
    g.addColorStop(0.6, "rgba(255,255,255,0.14)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  glowTexture = new THREE.CanvasTexture(cv);
  glowTexture.colorSpace = THREE.SRGBColorSpace;
  return glowTexture;
}

/** A soft glow round a lit lens, `r` across from its middle: a sprite
 * facing the camera, added to the model when it's grouped. */
function halo(
  m: Model,
  item: Item3d,
  x: number,
  y: number,
  z: number,
  r: number,
  lit = item.light,
): void {
  if (!lit) return;
  const list = GLOWS.get(m) ?? [];
  list.push({ x, y, z, r, lit });
  GLOWS.set(m, list);
}

/** The model grouped, with its glows. */
function finish(m: Model): THREE.Group {
  const g = m.group();
  const glows = GLOWS.get(m);
  if (!glows) return g;
  for (const h of glows) {
    // Shared by colour and brightness (sprites' materials outlive their
    // models: the scene's clean-up only frees meshes').
    const lit = h.lit;
    const key = `${lit.color}|${lit.level.toFixed(2)}`;
    let material = SPRITES.get(key);
    if (!material) {
      material = new THREE.SpriteMaterial({
        map: glowMap(),
        color: lit.color,
        transparent: true,
        opacity: 0.35 + 0.5 * lit.level,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      });
      SPRITES.set(key, material);
    }
    const sprite = new THREE.Sprite(material);
    sprite.position.set(m.flip ? -h.x : h.x, h.y, h.z);
    sprite.scale.setScalar(h.r * 2.6);
    sprite.renderOrder = 2;
    g.add(sprite);
  }
  return g;
}

const METAL = {
  black: "#1d1e20",
  anthracite: "#2f3133",
  bronze: "#3b3129",
  steel: "#b8bcbf",
  white: "#eeeeea",
};

// --- geometry helpers -----------------------------------------------------------

/** A cylinder (or cone, r1 at `to`) from one point to another. */
function limb(
  m: Model,
  from: V3,
  to: V3,
  r0: number,
  r1: number,
  material: THREE.Material,
  seg = 8,
  open = false,
): void {
  const dir = to.clone().sub(from);
  const len = dir.length();
  if (len <= 1e-5) return;
  const g = new THREE.CylinderGeometry(r1, r0, len, seg, 1, open);
  g.translate(0, len / 2, 0);
  g.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(v3(0, 1, 0), dir.normalize()),
  );
  g.translate(from.x, from.y, from.z);
  m.add(g, material);
}

/** Smooth value noise in 3D (sums of sines), about -1..1. */
function wobble(x: number, y: number, z: number, s: number): number {
  return (
    0.5 *
      Math.sin(3.1 * x + s) *
      Math.sin(2.7 * y + 1.3 * s) *
      Math.sin(3.3 * z + 0.7 * s) +
    0.3 *
      Math.sin(7.3 * x + 2.1 * s) *
      Math.sin(6.1 * z + s) *
      Math.cos(5.3 * y) +
    0.2 *
      Math.sin(13.7 * x + s) *
      Math.sin(11.9 * y + 0.4 * s) *
      Math.sin(12.3 * z)
  );
}

/** A lumpy blob (a clump of leaves, a boulder): an icosphere pushed in and
 * out by a smooth noise, scaled and placed, smooth-shaded, and coloured
 * lighter toward its top (`light`) and darker beneath, with a fleck of
 * variation leaf by leaf. */
function clump(
  m: Model,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  color: string,
  rand: () => number,
  rough = 0.22,
  detail = 2,
  opts: { light?: number; fleck?: number; flat?: boolean } = {},
): void {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g);
  const pos = g.getAttribute("position") as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const base = new THREE.Color(color);
  const c = new THREE.Color();
  const s = rand() * 20;
  const light = opts.light ?? 0.5;
  const fleck = opts.fleck ?? 0.16;
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i);
    const py = pos.getY(i);
    const pz = pos.getZ(i);
    const k = 1 + rough * wobble(px, py, pz, s);
    pos.setXYZ(i, px * k * sx + x, py * k * sy + y, pz * k * sz + z);
    const lit = 1 - light + light * ((py + 1) / 2) * 1.25;
    const f = 1 + fleck * (Math.sin(px * 37 + s) * Math.sin(pz * 41 + py * 29));
    c.copy(base).multiplyScalar(Math.max(0.2, lit * f));
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  if (opts.flat) g = g.toNonIndexed();
  g.computeVertexNormals();
  m.add(g, FOLIAGE);
}

/** A flat, tapering strip along a path of points (a grass blade, a yucca
 * leaf, a frond's stem): its width at each point across `side`, shaded
 * from darker at its base to its colour (or `tip`'s) at its end. */
function strip(
  m: Model,
  pts: V3[],
  widths: number[],
  side: V3,
  color: string,
  tip?: string,
): void {
  const pos: number[] = [];
  const col: number[] = [];
  const c0 = new THREE.Color(color).multiplyScalar(0.62);
  const c1 = new THREE.Color(tip ?? color).multiplyScalar(1.05);
  const at = (t: number) => c0.clone().lerp(c1, t);
  const n = pts.length - 1;
  for (let i = 0; i < n; i++) {
    const a = pts[i]!;
    const b = pts[i + 1]!;
    const wa = widths[i]! / 2;
    const wb = widths[i + 1]! / 2;
    const a0 = a.clone().addScaledVector(side, -wa);
    const a1 = a.clone().addScaledVector(side, wa);
    const b0 = b.clone().addScaledVector(side, -wb);
    const b1 = b.clone().addScaledVector(side, wb);
    const ca = at(i / n);
    const cb = at((i + 1) / n);
    for (const [p, cc] of [
      [a0, ca],
      [a1, ca],
      [b1, cb],
      [a0, ca],
      [b1, cb],
      [b0, cb],
    ] as const) {
      pos.push(p.x, p.y, p.z);
      col.push(cc.r, cc.g, cc.b);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  m.add(g, SHEET);
}

/** A blade arching out from `base` toward azimuth `az`: `lean` (0
 * upright, 1 flopping over) of its length `len`. */
function blade(
  m: Model,
  base: V3,
  az: number,
  len: number,
  lean: number,
  width: number,
  color: string,
  segs = 4,
  tip?: string,
): V3 {
  const out = v3(Math.cos(az), 0, Math.sin(az));
  const pts: V3[] = [];
  const widths: number[] = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const bend = lean * t * t;
    pts.push(
      base
        .clone()
        .addScaledVector(out, len * Math.sin(bend * 1.2) * 0.9 + len * 0.08 * t)
        .add(v3(0, len * t * Math.cos(bend * 1.2), 0)),
    );
    widths.push(width * (1 - t * 0.92));
  }
  strip(m, pts, widths, v3(-out.z, 0, out.x), color, tip);
  return pts[pts.length - 1]!;
}

// --- leaf cards -----------------------------------------------------------------

/** Sprays of leaves drawn on small cards (a texture made here, on a
 * canvas: broad leaves, fine leaves, needles, a willow's hanging strands)
 * scattered over a canopy's clumps, so its edge breaks up into leaves
 * the way a real one does. */
type CardKind = "leaf" | "fine" | "needle" | "willow";

const CARD_MATS = new Map<CardKind, THREE.MeshStandardMaterial>();

function cardTexture(kind: CardKind): THREE.Texture {
  const size = 256;
  const cv = document.createElement("canvas");
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext("2d");
  if (!ctx) return new THREE.Texture();
  const rand = seeded(kind);
  const grey = (g: number) => {
    const v = Math.round(Math.max(0, Math.min(255, g)));
    return `rgb(${v},${v},${v})`;
  };
  const leafAt = (
    x: number,
    y: number,
    len: number,
    wid: number,
    ang: number,
    g: number,
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(wid, len * 0.45, 0, len);
    ctx.quadraticCurveTo(-wid, len * 0.45, 0, 0);
    ctx.fillStyle = grey(g);
    ctx.fill();
    ctx.restore();
  };
  const c = size / 2;
  if (kind === "leaf" || kind === "fine") {
    // Twigs out from the middle, then leaves over them, densest in the
    // middle.
    ctx.strokeStyle = "rgb(95,85,75)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + rand();
      ctx.beginPath();
      ctx.moveTo(c, c);
      ctx.lineTo(c + Math.cos(a) * c * 0.8, c + Math.sin(a) * c * 0.8);
      ctx.stroke();
    }
    const n = kind === "leaf" ? 380 : 900;
    for (let i = 0; i < n; i++) {
      const r = c * 0.94 * Math.pow(rand(), 0.4);
      const a = rand() * Math.PI * 2;
      const len = kind === "leaf" ? 22 + 14 * rand() : 12 + 8 * rand();
      leafAt(
        c + Math.cos(a) * r,
        c + Math.sin(a) * r,
        len,
        len * (kind === "leaf" ? 0.32 : 0.36),
        rand() * Math.PI * 2,
        140 + 115 * rand(),
      );
    }
  } else if (kind === "needle") {
    for (let t = 0; t < 11; t++) {
      const a = (t / 11) * Math.PI * 2 + rand() * 0.3;
      const len = c * (0.65 + 0.3 * rand());
      for (let k = 0; k < 40; k++) {
        const d = (k / 40) * len;
        const x = c + Math.cos(a) * d;
        const y = c + Math.sin(a) * d;
        for (const s of [-1, 1]) {
          const na = a + s * (0.7 + 0.3 * rand());
          const nl = 10 + 8 * rand() * (1 - k / 30);
          ctx.strokeStyle = grey(130 + 120 * rand());
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(na) * nl, y + Math.sin(na) * nl);
          ctx.stroke();
        }
      }
    }
  } else {
    // Willow: strands hanging the card's height, slender leaves along
    // them.
    for (let s = 0; s < 12; s++) {
      const x0 = 12 + (s / 11) * (size - 24) + (rand() - 0.5) * 10;
      ctx.strokeStyle = "rgb(110,105,80)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      ctx.quadraticCurveTo(
        x0 + (rand() - 0.5) * 20,
        size / 2,
        x0 + (rand() - 0.5) * 14,
        size,
      );
      ctx.stroke();
      for (let k = 0; k < 30; k++) {
        const y = (k / 30) * size + rand() * 6;
        leafAt(
          x0 + (rand() - 0.5) * 6,
          y,
          14 + 8 * rand(),
          3,
          (rand() - 0.5) * 1.1,
          150 + 100 * rand(),
        );
      }
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function cardMaterial(kind: CardKind): THREE.MeshStandardMaterial {
  let m = CARD_MATS.get(kind);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      map: cardTexture(kind),
      alphaTest: 0.35,
      alphaToCoverage: true,
      side: THREE.DoubleSide,
      vertexColors: true,
      roughness: 0.85,
    });
    CARD_MATS.set(kind, m);
  }
  return m;
}

/** Leaf cards over an ellipsoid round `c` (radii rx, ry, rz): each turned
 * roughly outward, lit as the canopy's surface there (lighter on top),
 * in shades of `color`. `hang` stands them upright round its rim, tall
 * as `size` (a willow's falls). */
function cards(
  m: Model,
  c: V3,
  rx: number,
  ry: number,
  rz: number,
  color: string,
  rand: () => number,
  count: number,
  size: number,
  kind: CardKind,
  opts: { up?: number; hang?: boolean; width?: number } = {},
): void {
  const mtl = cardMaterial(kind);
  const base = new THREE.Color(color);
  const col = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const az = rand() * Math.PI * 2;
    const el = Math.asin(
      Math.max(-1, Math.min(1, -1 + 2 * rand() + (opts.up ?? 0.3))),
    );
    const dir = v3(
      Math.cos(az) * Math.cos(el),
      Math.sin(el),
      Math.sin(az) * Math.cos(el),
    );
    const k = 0.88 + 0.26 * rand();
    const p = v3(
      c.x + dir.x * rx * k,
      c.y + dir.y * ry * k,
      c.z + dir.z * rz * k,
    );
    const s = size * (0.75 + 0.5 * rand());
    let g: THREE.BufferGeometry;
    if (opts.hang) {
      const w = (opts.width ?? size * 0.4) * (0.7 + 0.6 * rand());
      g = new THREE.PlaneGeometry(w, s);
      g.translate(0, -s / 2, 0);
      const out = v3(dir.x, 0, dir.z).normalize();
      g.applyQuaternion(
        new THREE.Quaternion().setFromUnitVectors(v3(0, 0, 1), out),
      );
      g.rotateY(0);
    } else {
      g = new THREE.PlaneGeometry(s, s);
      g.rotateZ(rand() * Math.PI * 2);
      const n = dir
        .clone()
        .add(v3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(1.1))
        .normalize();
      g.applyQuaternion(
        new THREE.Quaternion().setFromUnitVectors(v3(0, 0, 1), n),
      );
    }
    g.translate(p.x, p.y, p.z);
    // Lit as the canopy is there, not as the card faces: soft, rounded.
    const nor = g.getAttribute("normal") as THREE.BufferAttribute;
    const cols = new Float32Array(nor.count * 3);
    const shade = (0.6 + 0.48 * ((dir.y + 1) / 2)) * (0.88 + 0.24 * rand());
    col.copy(base).multiplyScalar(shade);
    for (let v = 0; v < nor.count; v++) {
      nor.setXYZ(v, dir.x, dir.y, dir.z);
      cols[v * 3] = col.r;
      cols[v * 3 + 1] = col.g;
      cols[v * 3 + 2] = col.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    m.add(g, mtl);
  }
}

/** A clump of foliage: a darker core, so nothing shows through, under a
 * shell of leaf cards. */
function foliage(
  m: Model,
  x: number,
  y: number,
  z: number,
  sx: number,
  sy: number,
  sz: number,
  color: string,
  rand: () => number,
  kind: CardKind = "leaf",
  density = 1,
  core: string = color,
): void {
  // Needle tufts are airy: only a small dark heart inside.
  const k = kind === "needle" ? 0.38 : 0.6;
  clump(m, x, y, z, sx * k, sy * k, sz * k, tone(core, 0.45), rand, 0.2, 1, {
    light: 0.45,
  });
  const area = sx * sz + sy * (sx + sz);
  const size = Math.max(0.2, Math.min(1.1, Math.min(sx, sy, sz) * 1.15));
  const count = Math.round(
    Math.max(10, Math.min(64, (area / (size * size)) * 4.5 * density)),
  );
  cards(m, v3(x, y, z), sx, sy, sz, color, rand, count, size, kind);
}

// --- lights -------------------------------------------------------------------

/** A Hue Lily (or any spike spotlight): a stake, a knuckle and a round head
 * tilted `tilt` degrees from straight up toward its front. */
function spot(m: Model, item: Item3d, o: Opts, body: string): void {
  const H = m.H;
  const tilt = ((item.tilt ?? num(o, "tilt", 30)) * Math.PI) / 180;
  const r = Math.min(0.05, Math.max(0.03, m.W * 0.36));
  const metal = mat(body, 0.45, 0.6);
  const knuckle = v3(0, Math.max(0.06, H * 0.4), 0);
  limb(m, v3(0, 0, 0), knuckle, 0.012, 0.012, metal, 8);
  m.sphere(0.022, knuckle.x, knuckle.y, knuckle.z, metal);
  const axis = v3(0, Math.cos(tilt), Math.sin(tilt));
  const back = knuckle.clone().addScaledVector(axis, 0.02);
  const front = knuckle.clone().addScaledVector(axis, Math.max(0.1, H * 0.48));
  limb(m, back, front, r * 0.85, r, metal, 20);
  // A glare shroud beyond the lens, and the lens itself.
  const lip = front.clone().addScaledVector(axis, 0.012);
  limb(
    m,
    front.clone().addScaledVector(axis, -0.004),
    lip,
    r * 0.96,
    r * 0.96,
    metal,
    20,
    true,
  );
  limb(
    m,
    front.clone().addScaledVector(axis, -0.006),
    front.clone().addScaledVector(axis, -0.001),
    r * 0.8,
    r * 0.8,
    lens(item),
    20,
  );
  halo(m, item, front.x, front.y, front.z, r * 1.4);
}

/** A slim pedestal (Hue Impress, Nyro): a dark post with a frosted light
 * panel down its front's upper part (or a band all round its top). */
function pedestal(m: Model, item: Item3d, band: boolean): void {
  const { W, D, H } = m;
  const body = mat(METAL.anthracite, 0.5, 0.5);
  m.soft(W, H, D, 0, 0, 0, body, 0.01);
  if (band) {
    const y = H - Math.min(0.12, H * 0.25);
    m.soft(
      W * 1.01,
      Math.min(0.08, H * 0.18),
      D * 1.01,
      0,
      y,
      0,
      lens(item),
      0.008,
    );
    halo(m, item, 0, y + 0.04, 0, Math.max(W, D) * 0.7);
  } else {
    const ph = Math.min(0.32, H * 0.45);
    m.box(W * 0.78, ph, 0.012, 0, H - ph - 0.04, D / 2, lens(item));
    halo(m, item, 0, H - ph / 2 - 0.04, D / 2 + 0.02, W * 0.6);
  }
}

/** A round pathway light (Hue Calla, a bollard): a post with a glowing band
 * under its cap. */
function bollard(m: Model, item: Item3d, body: string, metal: number): void {
  const { W, D, H } = m;
  const r = Math.min(W, D) / 2;
  const post = mat(body, 0.35, metal);
  const band = Math.min(0.1, H * 0.3);
  m.cyl(r * 0.92, r * 0.98, H - band - 0.02, 0, 0, 0, post, 24);
  m.cyl(r * 0.86, r * 0.86, band, 0, H - band - 0.02, 0, lens(item), 24);
  m.cyl(r, r * 0.92, 0.025, 0, H - 0.025, 0, post, 24);
  halo(m, item, 0, H - band / 2 - 0.02, 0, r * 1.6);
}

/** A lantern (on a wall bracket, a post or the ground): a frame of corner
 * posts round frosted or clear glass, a roof and a base; `filament` shows
 * a glowing filament bulb through clear glass. */
function lantern(
  m: Model,
  item: Item3d,
  opts: {
    w: number;
    h: number;
    y: number;
    z: number;
    sides: number;
    taper: number;
    clear: boolean;
    body: string;
  },
): void {
  const { w, h, y, z, sides, taper, clear, body } = opts;
  const metal = mat(body, 0.5, 0.5);
  const rot = sides === 4 ? Math.PI / 4 : 0;
  const rb = (w / 2) * (sides === 4 ? Math.SQRT2 : 1);
  const glassH = h * 0.66;
  const baseH = h * 0.1;
  // Base, glass, roof.
  const shape = (
    rTop: number,
    rBot: number,
    hh: number,
    yy: number,
    mm: THREE.Material,
  ) => {
    const g = new THREE.CylinderGeometry(rTop, rBot, hh, sides);
    g.rotateY(rot);
    g.translate(0, yy + hh / 2, z);
    m.add(g, mm);
  };
  shape(rb * 0.9, rb * 0.8, baseH, y, metal);
  const glass = clear ? mat("#dfe8ea", 0.08, 0, { opacity: 0.35 }) : lens(item);
  shape(rb * (1 + taper) * 0.92, rb * 0.92, glassH, y + baseH, glass);
  // Corner posts.
  for (let k = 0; k < sides; k++) {
    const a = rot + (k / sides) * Math.PI * 2;
    const p0 = v3(
      Math.sin(a) * rb * 0.93,
      y + baseH,
      z + Math.cos(a) * rb * 0.93,
    );
    const p1 = v3(
      Math.sin(a) * rb * (1 + taper) * 0.93,
      y + baseH + glassH,
      z + Math.cos(a) * rb * (1 + taper) * 0.93,
    );
    limb(m, p0, p1, 0.006, 0.006, metal, 5);
  }
  const roofY = y + baseH + glassH;
  shape(rb * 0.25, rb * (1 + taper) * 1.12, h - baseH - glassH, roofY, metal);
  m.sphere(Math.max(0.012, w * 0.07), 0, y + h + 0.01, z, metal);
  if (clear) {
    // A filament bulb inside.
    const bulbY = y + baseH + glassH * 0.45;
    const lit = !!item.light;
    m.sphere(
      Math.min(0.035, w * 0.18),
      0,
      bulbY,
      z,
      lit ? lens(item) : mat("#e6dccb", 0.1, 0, { opacity: 0.6 }),
      1,
      1.3,
      1,
    );
    if (lit) halo(m, item, 0, bulbY, z, w * 0.55);
  } else halo(m, item, 0, y + baseH + glassH / 2, z, w * 0.75);
}

/** A wall bracket: a back plate on the wall and an arm out to `z`. */
function bracket(m: Model, body: string, y: number, z: number, h = 0.12): void {
  const metal = mat(body, 0.5, 0.5);
  const back = -m.D / 2;
  m.soft(
    Math.min(0.1, m.W * 0.6),
    h,
    0.015,
    0,
    y - h / 2,
    back + 0.0075,
    metal,
    0.005,
  );
  limb(m, v3(0, y, back + 0.01), v3(0, y, z), 0.01, 0.01, metal, 8);
}

/** A wall light lit through slots at its top and bottom (up & down). */
function upDown(m: Model, item: Item3d, round: boolean, tri = false): void {
  const { W, D, H } = m;
  const body = mat(METAL.anthracite, 0.5, 0.5);
  const z = -D / 2 + D * 0.55;
  if (round || tri) {
    const g = new THREE.CylinderGeometry(D * 0.48, D * 0.48, H, tri ? 3 : 24);
    if (tri) g.rotateY(Math.PI);
    g.translate(0, H / 2, z);
    m.add(g, body);
  } else m.soft(W, H, D * 0.9, 0, 0, z, body, 0.01);
  // Up and down: one light both ways, or a two-light sconce's own each.
  const twin = item.model?.opts["twin"] === true;
  const upLit = item.light;
  const downLit = twin ? item.light2 : item.light;
  const up = lens(item, undefined, upLit);
  const down = lens(item, undefined, downLit);
  const r = round || tri ? D * 0.4 : 0;
  if (r) {
    m.cyl(r, r, 0.006, 0, H - 0.004, z, up, 20);
    m.cyl(r, r, 0.006, 0, -0.002, z, down, 20);
  } else {
    m.box(W * 0.8, 0.006, D * 0.6, 0, H - 0.004, z, up);
    m.box(W * 0.8, 0.006, D * 0.6, 0, -0.002, z, down);
  }
  // A plate on the wall behind.
  m.box(W * 0.9, H * 0.85, 0.01, 0, H * 0.075, -D / 2 + 0.005, body);
  halo(m, item, 0, H + 0.02, z, Math.max(W, D) * 0.55, upLit);
  halo(m, item, 0, -0.02, z, Math.max(W, D) * 0.55, downLit);
}

/** A flat wall light glowing below (Hue Turaco, Daylo) or all over its
 * front (Nyro). */
function wallPanel(m: Model, item: Item3d, kind: "down" | "front"): void {
  const { W, D, H } = m;
  const body = mat(METAL.anthracite, 0.5, 0.5);
  if (kind === "front") {
    const g = new THREE.CylinderGeometry(W / 2, W / 2, D * 0.8, 32);
    g.rotateX(Math.PI / 2);
    g.translate(0, H / 2, -D / 2 + D * 0.4);
    m.add(g, body);
    const ring = new THREE.TorusGeometry(W * 0.36, 0.012, 8, 32);
    ring.translate(0, H / 2, -D / 2 + D * 0.8 + 0.004);
    m.add(ring, lens(item));
    halo(m, item, 0, H / 2, D / 2, W * 0.5);
    return;
  }
  m.soft(W, H, D, 0, 0, 0, body, 0.012);
  m.box(W * 0.86, 0.006, D * 0.78, 0, -0.003, 0.004, lens(item));
  halo(m, item, 0, -0.03, 0.01, W * 0.5);
}

/** A floodlight on a wall: a bracket and one or two heads tilted down
 * toward the yard, lit across their faces; round for Hue Welcome. */
function flood(m: Model, item: Item3d, o: Opts, round: boolean): void {
  const { W, D, H } = m;
  const heads = Math.max(1, num(o, "heads", 1));
  const body = mat(round ? METAL.black : METAL.anthracite, 0.5, 0.5);
  const back = -D / 2;
  m.soft(
    Math.min(0.12, W * 0.5),
    0.08,
    0.02,
    0,
    H / 2 - 0.04,
    back + 0.01,
    body,
    0.006,
  );
  // Aimed down to where it's set to reach (Item3d.tilt), 35° else.
  const tilt = ((item.tilt ?? 35) * Math.PI) / 180;
  const hw = (W / heads) * 0.86;
  for (let k = 0; k < heads; k++) {
    const x = heads === 1 ? 0 : (k - (heads - 1) / 2) * (W / heads);
    const c = v3(x, H / 2, back + D * 0.55);
    limb(m, v3(x * 0.4, H / 2, back + 0.02), c, 0.01, 0.01, body, 6);
    const head = new THREE.Group();
    const hm = new Model(hw, D * 0.4, H, false);
    if (round) {
      hm.cyl(hw / 2, hw / 2, D * 0.4, 0, -hw * 0.31, 0, body, 24, "z");
      hm.cyl(
        hw * 0.42,
        hw * 0.42,
        0.006,
        0,
        -hw * 0.31,
        D * 0.2 + 0.003,
        lens(item),
        24,
        "z",
      );
    } else {
      hm.soft(hw, hw * 0.62, D * 0.35, 0, -hw * 0.31, 0, body, 0.01);
      hm.box(
        hw * 0.86,
        hw * 0.48,
        0.006,
        0,
        -hw * 0.24,
        D * 0.175 + 0.003,
        lens(item),
      );
      // Cooling fins behind.
      for (let f = -2; f <= 2; f++)
        hm.box(
          0.004,
          hw * 0.5,
          D * 0.08,
          f * hw * 0.18,
          -hw * 0.25,
          -D * 0.2,
          body,
        );
    }
    head.add(hm.group());
    head.position.copy(c);
    head.rotation.x = tilt;
    head.updateMatrixWorld(true);
    head.traverse((ob) => {
      const mesh = ob as THREE.Mesh;
      if (!mesh.isMesh) return;
      const g = mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
      m.add(g, mesh.material as THREE.Material);
      mesh.geometry.dispose();
    });
    halo(m, item, x, H / 2 - 0.02, back + D * 0.75, hw * 0.6);
  }
  if (o["sensor"])
    m.sphere(0.03, 0, H / 2 - 0.08, back + D * 0.35, mat(METAL.white, 0.3));
}

/** A gooseneck barn light: a curved arm out from the wall and a wide shade
 * over its bulb. */
function barn(m: Model, item: Item3d): void {
  const { W, D, H } = m;
  const body = mat("#2a2d2f", 0.45, 0.5);
  const back = -D / 2;
  m.cyl(0.06, 0.06, 0.02, 0, H * 0.75, back + 0.01, body, 20, "z");
  const pts: V3[] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    pts.push(
      v3(
        0,
        H * 0.75 + Math.sin(t * Math.PI * 0.5) * H * 0.2,
        back + 0.02 + (D * 0.55 - 0.02) * Math.sin(t * Math.PI * 0.5) ** 0.6,
      ),
    );
  }
  for (let i = 0; i + 1 < pts.length; i++)
    limb(m, pts[i]!, pts[i + 1]!, 0.012, 0.012, body, 6);
  const top = pts[pts.length - 1]!;
  const r = Math.min(W, D) * 0.45;
  limb(
    m,
    v3(0, top.y, top.z),
    v3(0, top.y - 0.05, top.z),
    0.015,
    0.02,
    body,
    10,
  );
  const shade = new THREE.CylinderGeometry(0.03, r, r * 0.45, 28, 1, true);
  shade.translate(0, top.y - 0.05 - (r * 0.45) / 2, top.z);
  const sm = mat("#2a2d2f", 0.45, 0.5);
  sm.side = THREE.DoubleSide;
  m.add(shade, sm);
  m.sphere(0.035, 0, top.y - 0.07 - r * 0.2, top.z, lens(item));
  halo(m, item, 0, top.y - r * 0.4, top.z, r * 0.9);
}

/** A mushroom path light: a stake and one or two hats over a glowing
 * lamp. */
function pathLight(m: Model, item: Item3d, o: Opts): void {
  const { W, H } = m;
  const tiers = Math.max(1, num(o, "tiers", 1));
  const body = mat(METAL.bronze, 0.45, 0.5);
  m.cyl(0.016, 0.02, H - 0.08, 0, 0, 0, body, 10);
  const r = W / 2;
  for (let t = 0; t < tiers; t++) {
    const y = H - 0.03 - t * 0.09;
    const rr = r * (1 - t * 0.25);
    m.cyl(0.02, rr, 0.035, 0, y, 0, body, 24);
  }
  m.cyl(0.028, 0.028, 0.07, 0, H - 0.1, 0, lens(item), 16);
  halo(m, item, 0, H - 0.08, 0, r * 0.9);
}

/** Bulbs on a wire sagging across the item's width, `y` up from its
 * base: Festavia's globes, café lights. */
function stringLights(m: Model, item: Item3d, globe: boolean): void {
  const { W } = m;
  const wire = mat("#1b1b1b", 0.6);
  const sag = Math.min(0.5, W * 0.05);
  const at = (t: number) => v3(-W / 2 + W * t, -sag * 4 * t * (1 - t), 0);
  const n = Math.max(2, Math.round(W / (globe ? 0.25 : 0.4)));
  let prev = at(0);
  for (let i = 1; i <= 24; i++) {
    const p = at(i / 24);
    limb(m, prev, p, 0.003, 0.003, wire, 4);
    prev = p;
  }
  const bulb = item.light
    ? lens(item)
    : mat("#ece6d8", 0.15, 0, { opacity: 0.85 });
  for (let i = 0; i <= n; i++) {
    const p = at(i / n);
    m.cyl(0.006, 0.006, 0.03, p.x, p.y - 0.03, 0, wire, 6);
    m.sphere(
      globe ? 0.022 : 0.03,
      p.x,
      p.y - 0.05,
      0,
      bulb,
      1,
      globe ? 1 : 1.3,
      1,
    );
    if (item.light && i % 2 === 0) halo(m, item, p.x, p.y - 0.05, 0, 0.06);
  }
}

function lightModel(m: Model, item: Item3d, kind: string, o: Opts): boolean {
  const { W, D, H } = m;
  const back = -D / 2;
  switch (kind) {
    case "hue_lily_spot":
    case "hue_lily_xl":
      spot(m, item, o, METAL.black);
      return true;
    case "spike_spotlight":
      spot(m, item, o, METAL.bronze);
      return true;
    case "hue_impress_pedestal":
    case "hue_impress_pedestal_low":
      pedestal(m, item, false);
      return true;
    case "hue_nyro_pedestal":
    case "hue_turaco_pedestal":
      pedestal(m, item, true);
      return true;
    case "hue_impress_wall": {
      const body = mat(METAL.anthracite, 0.5, 0.5);
      m.soft(W, H, D, 0, 0, 0, body, 0.01);
      m.box(W * 0.8, H * 0.5, 0.01, 0, H * 0.25, D / 2, lens(item));
      m.box(W * 0.7, 0.006, D * 0.6, 0, H - 0.003, 0, lens(item));
      m.box(W * 0.7, 0.006, D * 0.6, 0, -0.003, 0, lens(item));
      halo(m, item, 0, H / 2, D / 2 + 0.02, W * 0.6);
      return true;
    }
    case "hue_calla":
      bollard(m, item, METAL.steel, 0.8);
      return true;
    case "bollard_light":
      bollard(m, item, METAL.bronze, 0.4);
      return true;
    case "hue_econic_wall":
      bracket(m, METAL.black, H * 0.7, back + D * 0.35);
      lantern(m, item, {
        w: W * 0.82,
        h: H,
        y: 0,
        z: back + D * 0.55,
        sides: 4,
        taper: 0,
        clear: false,
        body: METAL.black,
      });
      return true;
    case "hue_lucca_wall":
      bracket(m, METAL.black, H * 0.82, back + D * 0.4);
      lantern(m, item, {
        w: W * 0.8,
        h: H * 0.86,
        y: 0,
        z: back + D * 0.58,
        sides: 4,
        taper: 0.18,
        clear: false,
        body: METAL.black,
      });
      return true;
    case "hue_inara_wall":
      bracket(m, METAL.black, H * 0.78, back + D * 0.4);
      lantern(m, item, {
        w: W * 0.8,
        h: H * 0.9,
        y: 0,
        z: back + D * 0.58,
        sides: 4,
        taper: 0.1,
        clear: true,
        body: METAL.black,
      });
      return true;
    case "coach_lantern":
    case "lantern_outdoor":
      bracket(m, METAL.black, H * 0.75, back + D * 0.4, 0.16);
      lantern(m, item, {
        w: W * 0.82,
        h: H,
        y: 0,
        z: back + D * 0.58,
        sides: 6,
        taper: 0.12,
        clear: true,
        body: METAL.black,
      });
      return true;
    case "hue_econic_pedestal":
    case "hue_lucca_post":
    case "hue_inara_post": {
      const metal = mat(METAL.black, 0.5, 0.5);
      const postH = H * 0.32;
      m.cyl(W * 0.36, W * 0.4, 0.02, 0, 0, 0, metal, 20);
      m.cyl(W * 0.12, W * 0.14, postH, 0, 0, 0, metal, 12);
      lantern(m, item, {
        w: W * 0.82,
        h: H - postH,
        y: postH,
        z: 0,
        sides: 4,
        taper: kind === "hue_lucca_post" ? 0.18 : 0.06,
        clear: kind === "hue_inara_post",
        body: METAL.black,
      });
      return true;
    }
    case "lamp_post": {
      const metal = mat(METAL.black, 0.45, 0.5);
      m.cyl(W * 0.28, W * 0.34, 0.18, 0, 0, 0, metal, 16);
      m.cyl(0.04, 0.05, H - 0.62, 0, 0.18, 0, metal, 12);
      m.cyl(0.07, 0.05, 0.06, 0, H - 0.46, 0, metal, 12);
      lantern(m, item, {
        w: W * 0.7,
        h: 0.44,
        y: H - 0.44,
        z: 0,
        sides: 6,
        taper: 0.22,
        clear: true,
        body: METAL.black,
      });
      return true;
    }
    case "hue_econic_updown":
    case "cylinder_updown":
    case "cylinder_updown_twin":
    case "hue_appear_wall":
      upDown(m, item, kind !== "hue_appear_wall");
      return true;
    case "hue_resonate_wall":
      upDown(m, item, false, true);
      return true;
    case "box_sconce":
      upDown(m, item, false);
      return true;
    case "hue_nyro_wall":
      wallPanel(m, item, "front");
      return true;
    case "hue_turaco_wall":
    case "hue_daylo_wall":
      wallPanel(m, item, "down");
      return true;
    case "hue_discover_flood":
    case "flood_light":
    case "flood_light_twin":
    case "motion_flood":
      flood(m, item, o, false);
      return true;
    case "hue_welcome_flood":
      flood(m, item, o, true);
      return true;
    case "barn_light":
      barn(m, item);
      return true;
    case "path_light":
    case "path_light_tiered":
      pathLight(m, item, o);
      return true;
    case "post_cap_light": {
      const wood = mat("#8a6c52", 0.85);
      const capH = 0.1;
      m.box(W, H - capH, D, 0, 0, 0, wood);
      const metal = mat(METAL.black, 0.5, 0.5);
      m.box(W * 1.15, 0.02, D * 1.15, 0, H - capH, 0, metal);
      m.box(W * 0.9, 0.05, D * 0.9, 0, H - capH + 0.02, 0, lens(item));
      const roof = new THREE.ConeGeometry(W * 0.85, 0.035, 4);
      roof.rotateY(Math.PI / 4);
      roof.translate(0, H - 0.017, 0);
      m.add(roof, metal);
      halo(m, item, 0, H - capH + 0.04, 0, W * 0.9);
      return true;
    }
    case "well_light": {
      const r = Math.min(W, D) / 2;
      m.cyl(r, r, 0.03, 0, -0.01, 0, mat(METAL.steel, 0.35, 0.8), 28);
      m.cyl(r * 0.72, r * 0.72, 0.006, 0, 0.018, 0, lens(item), 28);
      halo(m, item, 0, 0.03, 0, r * 0.9);
      return true;
    }
    case "hue_amarant": {
      const metal = mat(METAL.black, 0.5, 0.5);
      for (const x of [-W * 0.35, W * 0.35])
        m.box(0.012, 0.08, 0.012, x, 0, -0.01, metal);
      const g = new Model(W, D, H, false);
      g.soft(W, 0.06, D, 0, -0.03, 0, metal, 0.01);
      g.box(W * 0.92, 0.006, D * 0.6, 0, 0.03, 0.005, lens(item));
      const grp = g.group();
      grp.position.set(0, 0.09, 0);
      grp.rotation.x = -(70 * Math.PI) / 180;
      grp.updateMatrixWorld(true);
      grp.traverse((ob) => {
        const mesh = ob as THREE.Mesh;
        if (!mesh.isMesh) return;
        m.add(
          mesh.geometry.clone().applyMatrix4(mesh.matrixWorld),
          mesh.material as THREE.Material,
        );
        mesh.geometry.dispose();
      });
      halo(m, item, 0, 0.1, 0.03, W * 0.35);
      return true;
    }
    case "hue_outdoor_lightstrip": {
      m.box(W, Math.max(0.008, H), D, 0, 0, 0, mat("#d8d6d0", 0.6));
      m.box(W, 0.004, D * 0.6, 0, Math.max(0.008, H), 0, lens(item));
      if (item.light)
        for (let x = -W / 2 + 0.3; x < W / 2; x += 0.6)
          halo(m, item, x, 0.015, 0, 0.05);
      return true;
    }
    case "hue_festavia_globes":
      stringLights(m, item, true);
      return true;
    case "cafe_lights":
      stringLights(m, item, false);
      return true;
  }
  return false;
}

// --- plants -------------------------------------------------------------------

/** Where an ellipsoid's surface is in a direction: for scattering clumps
 * over a canopy (`upward` favours its top). */
function onCanopy(
  rand: () => number,
  rx: number,
  ry: number,
  rz: number,
  upward = 0.25,
): V3 {
  const az = rand() * Math.PI * 2;
  const el = Math.asin(Math.max(-1, Math.min(1, -1 + 2 * rand() + upward)));
  const k = 0.6 + 0.32 * rand();
  return v3(
    Math.cos(az) * Math.cos(el) * rx * k,
    Math.sin(el) * ry * k,
    Math.sin(az) * Math.cos(el) * rz * k,
  );
}

const BARK = "#5f4636";

/** One of a colour's few shades, at random. */
const shades = (hex: string, rand: () => number) =>
  tone(hex, [0.82, 0.92, 1, 1.08][Math.floor(rand() * 4)]!);

/** A broadleaf tree: a trunk forking into limbs under a canopy of leafy
 * clumps (`wide` spreads it like an oak; `bloom` covers it in flower). */
function deciduous(
  m: Model,
  rand: () => number,
  green: string,
  opts: { wide?: boolean; bloom?: string | null; stems?: number },
): void {
  const { W, D, H } = m;
  const rx = W / 2;
  const rz = D / 2;
  const R = Math.min(rx, rz);
  const trunkH = H * (opts.wide ? 0.3 : 0.36);
  const tr = Math.max(0.035, Math.min(0.3, R * 0.07));
  const bark = mat(BARK, 0.95);
  const stems = Math.max(1, opts.stems ?? 1);
  const crownY = trunkH + (H - trunkH) * 0.5;
  const cry = (H - trunkH) / 2;
  const tops: V3[] = [];
  limb(
    m,
    v3(0, -0.05, 0),
    v3(0, Math.min(0.3, trunkH * 0.15), 0),
    tr * 1.6,
    tr,
    bark,
    10,
  );
  for (let s = 0; s < stems; s++) {
    const a = (s / stems) * Math.PI * 2 + rand();
    const lean = stems > 1 ? R * 0.2 : R * 0.06 * (rand() - 0.5);
    const top = v3(Math.cos(a) * lean, trunkH, Math.sin(a) * lean);
    const r0 = stems > 1 ? tr * 0.72 : tr;
    limb(m, v3(0, 0, 0), top, r0, r0 * 0.78, bark, 10);
    tops.push(top);
  }
  // Limbs out into the crown, forking once.
  const limbs = 5 + Math.floor(rand() * 3);
  for (let i = 0; i < limbs; i++) {
    const from = tops[i % tops.length]!;
    const a = (i / limbs) * Math.PI * 2 + rand() * 0.6;
    const mid = v3(
      Math.cos(a) * rx * 0.32,
      crownY - cry * 0.2 + cry * 0.3 * rand(),
      Math.sin(a) * rz * 0.32,
    );
    limb(m, from, mid, tr * 0.55, tr * 0.32, bark, 7);
    for (const da of [-0.4, 0.45]) {
      const to = v3(
        Math.cos(a + da) * rx * (0.55 + 0.15 * rand()),
        crownY + cry * (0.15 + 0.4 * rand()),
        Math.sin(a + da) * rz * (0.55 + 0.15 * rand()),
      );
      limb(m, mid, to, tr * 0.3, tr * 0.1, bark, 5);
    }
  }
  // The canopy: a dark core, then leafy clumps over it.
  const color = () =>
    opts.bloom && rand() < 0.78
      ? shades(opts.bloom, rand)
      : shades(green, rand);
  const kind: CardKind = opts.bloom ? "fine" : "leaf";
  clump(
    m,
    0,
    crownY,
    0,
    rx * 0.52,
    cry * 0.56,
    rz * 0.52,
    tone(green, 0.42),
    rand,
    0.25,
    2,
    { light: 0.4 },
  );
  const n = Math.round(16 + R * 3.5);
  for (let i = 0; i < n; i++) {
    const p = onCanopy(rand, rx * 0.95, cry * 0.95, rz * 0.95, 0.35);
    const s = R * (0.26 + 0.14 * rand());
    foliage(
      m,
      p.x,
      crownY + p.y,
      p.z,
      s,
      s * (opts.wide ? 0.72 : 0.85),
      s,
      color(),
      rand,
      kind,
      1,
      green,
    );
  }
}

/** A Japanese maple: low, spreading stems under layered, flattened tiers
 * of fine foliage. */
function japanese(m: Model, rand: () => number, green: string): void {
  const { W, D, H } = m;
  const rx = W / 2;
  const rz = D / 2;
  const bark = mat("#4a3a33", 0.9);
  const stems = 4;
  for (let s = 0; s < stems; s++) {
    const a = (s / stems) * Math.PI * 2 + rand() * 0.8;
    const mid = v3(Math.cos(a) * rx * 0.3, H * 0.35, Math.sin(a) * rz * 0.3);
    const end = v3(Math.cos(a) * rx * 0.62, H * 0.62, Math.sin(a) * rz * 0.62);
    limb(m, v3(0, 0, 0), mid, 0.05, 0.035, bark, 7);
    limb(m, mid, end, 0.035, 0.015, bark, 6);
  }
  for (let t = 0; t < 3; t++) {
    const y = H * (0.45 + t * 0.2);
    const k = 1 - t * 0.24;
    const n = 7 - t * 2;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand();
      const d = 0.3 + 0.4 * rand();
      const s = Math.min(rx, rz) * 0.36 * k;
      foliage(
        m,
        Math.cos(a) * rx * d * k,
        y,
        Math.sin(a) * rz * d * k,
        s * 1.25,
        s * 0.55,
        s * 1.25,
        shades(green, rand),
        rand,
        "fine",
        1.2,
      );
    }
  }
}

/** A quaking aspen: slender white trunks rising nearly to the top, with
 * a narrow oval crown of small leaves over their upper part. */
function aspen(m: Model, rand: () => number, green: string): void {
  const { W, D, H } = m;
  const rx = W / 2;
  const rz = D / 2;
  const R = Math.min(rx, rz);
  const white = mat("#e8e4da", 0.8);
  const dark = mat("#2b2724", 0.9);
  const tops: V3[] = [];
  for (let s = 0; s < 2; s++) {
    const a = s * Math.PI + rand() * 0.8;
    const foot = v3(Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12);
    const top = v3(Math.cos(a) * rx * 0.12, H * 0.93, Math.sin(a) * rz * 0.12);
    const r = 0.09 + 0.03 * rand();
    limb(m, foot, top, r, r * 0.3, white, 12);
    tops.push(top);
    for (let k = 0; k < 16; k++) {
      const t = 0.05 + 0.85 * rand();
      const p = foot.clone().lerp(top, t);
      const ang = rand() * Math.PI * 2;
      const rr = r * (1 - 0.6 * t) + 0.002;
      m.box(
        0.03 + 0.03 * rand(),
        0.008,
        0.004,
        p.x + Math.cos(ang) * rr,
        p.y,
        p.z + Math.sin(ang) * rr,
        dark,
      );
    }
  }
  // The crown: clumps round an oval over the upper three-fifths, each on
  // a short limb from the nearer trunk.
  const n = 30;
  for (let i = 0; i < n; i++) {
    const f = rand();
    const y = H * (0.38 + 0.58 * f);
    const spread = Math.sin(Math.PI * (0.12 + 0.82 * f)) * (0.7 + 0.3 * rand());
    const ang = rand() * Math.PI * 2;
    const x = Math.cos(ang) * rx * spread * 0.8;
    const z = Math.sin(ang) * rz * spread * 0.8;
    const trunk = tops[i % tops.length]!;
    const k = y / trunk.y;
    if (i % 2 === 0)
      limb(
        m,
        v3(trunk.x * k, y - 0.4, trunk.z * k),
        v3(x, y, z),
        0.035,
        0.012,
        white,
        4,
      );
    const sz = R * (0.3 + 0.12 * rand());
    foliage(
      m,
      x,
      y,
      z,
      sz,
      sz * 1.15,
      sz,
      shades(green, rand),
      rand,
      "fine",
      0.8,
    );
  }
}

/** A birch clump: three pale stems with dark marks, an airy crown on
 * each. */
function birch(m: Model, rand: () => number, green: string): void {
  const { W, D, H } = m;
  const rx = W / 2;
  const rz = D / 2;
  const white = mat("#e6e2d8", 0.8);
  const dark = mat("#2b2724", 0.9);
  for (let s = 0; s < 3; s++) {
    const a = (s / 3) * Math.PI * 2 + rand() * 0.5;
    const foot = v3(Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08);
    const top = v3(Math.cos(a) * rx * 0.3, H * 0.66, Math.sin(a) * rz * 0.3);
    const r = 0.06 + 0.03 * rand();
    limb(m, foot, top, r, r * 0.5, white, 10);
    // Dark lenticels and knots up the bark.
    for (let k = 0; k < 12; k++) {
      const t = 0.06 + 0.88 * rand();
      const p = foot.clone().lerp(top, t);
      const ang = rand() * Math.PI * 2;
      const rr = r * (1 - 0.5 * t) + 0.002;
      m.box(
        0.03 + 0.03 * rand(),
        0.007,
        0.004,
        p.x + Math.cos(ang) * rr,
        p.y,
        p.z + Math.sin(ang) * rr,
        dark,
      );
    }
    for (let i = 0; i < 7; i++) {
      const q = onCanopy(rand, rx * 0.5, H * 0.22, rz * 0.5, 0.15);
      const sz = Math.min(rx, rz) * (0.2 + 0.1 * rand());
      foliage(
        m,
        top.x + q.x,
        top.y + H * 0.1 + q.y,
        top.z + q.z,
        sz,
        sz * 0.95,
        sz,
        shades(green, rand),
        rand,
        "fine",
        0.8,
      );
    }
  }
}

/** A weeping willow: a stout trunk, a dome, and long curtains of fine
 * leaves hanging nearly to the ground all round. */
function weeping(m: Model, rand: () => number, green: string): void {
  const { W, D, H } = m;
  const rx = W / 2;
  const rz = D / 2;
  const R = Math.min(rx, rz);
  const bark = mat("#4e3f33", 0.95);
  const trunkH = H * 0.42;
  limb(
    m,
    v3(0, -0.05, 0),
    v3(0.1, trunkH, 0.05),
    R * 0.09,
    R * 0.065,
    bark,
    10,
  );
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + rand();
    limb(
      m,
      v3(0.1, trunkH, 0.05),
      v3(Math.cos(a) * rx * 0.45, H * 0.8, Math.sin(a) * rz * 0.45),
      R * 0.045,
      R * 0.015,
      bark,
      6,
    );
  }
  foliage(
    m,
    0,
    H * 0.8,
    0,
    rx * 0.62,
    H * 0.16,
    rz * 0.62,
    green,
    rand,
    "fine",
    1.4,
  );
  // The falls: rings of hanging cards from the crown out to its rim,
  // longest at the rim, so the curtain reaches nearly to the ground.
  for (const [d, top, count] of [
    [0.55, 0.92, 26],
    [0.78, 0.86, 40],
    [0.97, 0.78, 60],
  ] as const) {
    const len = H * top * (0.55 + 0.25 * d);
    cards(
      m,
      v3(0, H * top, 0),
      rx * d,
      0.01,
      rz * d,
      shades(green, rand),
      rand,
      Math.round(count * Math.max(1, R / 3)),
      len,
      "willow",
      {
        hang: true,
        up: 1,
        width: R * 0.35,
      },
    );
  }
}

/** A spruce or fir: drooping tiers of boughs tapering to a point, their
 * edges feathered with needle sprays. */
function conifer(
  m: Model,
  rand: () => number,
  green: string,
  opts: { droop?: boolean; dense?: boolean } = {},
): void {
  const { W, D, H } = m;
  const rx = W / 2;
  const rz = D / 2;
  m.cyl(0.05, 0.1, H * 0.2, 0, -0.03, 0, mat(BARK, 0.95), 8);
  // A dense dwarf has more, tighter tiers; a Norway spruce's branchlets
  // hang from its tiers' edges.
  const tiers = opts.dense ? 16 : 12;
  const y0 = H * 0.06;
  const base = new THREE.Color(green);
  for (let t = 0; t < tiers; t++) {
    const f = t / tiers;
    const k = Math.pow(1 - f, 1.05);
    const th = ((H - y0) / tiers) * 2.1;
    const y = y0 + (H - y0) * f * 0.94;
    let g: THREE.BufferGeometry = new THREE.ConeGeometry(1, 1, 18, 3);
    g.deleteAttribute("normal");
    g.deleteAttribute("uv");
    g = mergeVertices(g);
    const pos = g.getAttribute("position") as THREE.BufferAttribute;
    const col = new Float32Array(pos.count * 3);
    const s = rand() * 9;
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const px = pos.getX(i);
      const py = pos.getY(i);
      const pz = pos.getZ(i);
      const rim = Math.max(0, -py * 2);
      const a = Math.atan2(pz, px);
      const jag = 1 + (opts.dense ? 0.02 : 0.05) * Math.sin(a * 7 + s) * rim;
      const sag = opts.droop ? 0.3 : 0.1;
      pos.setXYZ(
        i,
        px * jag * rx * k * 0.92,
        (py + 0.5) * th + y - rim * sag * th * (1.2 + Math.sin(a * 3 + s)),
        pz * jag * rz * k * 0.92,
      );
      c.copy(base).multiplyScalar(0.32 + 0.36 * (py + 0.5));
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    m.add(g, FOLIAGE);
    // Needle sprays round the tier's edge, drooping a little.
    const n = Math.round(22 + 60 * k);
    cards(
      m,
      v3(0, y + th * 0.18, 0),
      rx * k * 0.95,
      th * 0.4,
      rz * k * 0.95,
      shades(green, rand),
      rand,
      n,
      Math.max(0.3, th * 1.05),
      "needle",
      { up: opts.droop ? -0.45 : -0.1 },
    );
  }
}

/** A pine: a tall bare trunk and an open, irregular crown of needle tufts
 * from `crown` of its height up (lower for a full, young-looking pine);
 * `flat` spreads it into an umbrella on top (a stone pine); `soft` gives
 * it bigger, looser tufts (a white pine's long needles); `bark` its
 * trunk's colour. */
function pine(
  m: Model,
  rand: () => number,
  green: string,
  opts: { crown?: number; flat?: boolean; soft?: boolean; bark?: string } = {},
): void {
  const { W, D, H } = m;
  const rx = W / 2;
  const rz = D / 2;
  const R = Math.min(rx, rz);
  const bark = mat(opts.bark ?? "#6b4430", 0.95);
  const crown = Math.max(0.1, Math.min(0.8, opts.crown ?? 0.42));
  limb(
    m,
    v3(0, -0.05, 0),
    v3(0.05, H * 0.97, -0.03),
    R * 0.08,
    R * 0.025,
    bark,
    9,
  );
  const whorls = crown < 0.3 ? 11 : 8;
  for (let w = 0; w < whorls; w++) {
    const f = w / (whorls - 1);
    const y = H * (crown + (0.94 - crown) * f);
    // An umbrella keeps its reach to the top and rounds over; a spire
    // narrows up.
    const reach = opts.flat
      ? (0.55 + 0.45 * Math.sin(Math.PI * (0.25 + 0.6 * f))) * 0.95
      : (1 - f * 0.75) * 0.85;
    const n = 4 + (w % 2) + (opts.flat ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand() + w * 0.7;
      const rise = opts.flat ? H * (0.06 + 0.04 * (1 - f)) : H * 0.03;
      const end = v3(
        Math.cos(a) * rx * reach,
        y + rise,
        Math.sin(a) * rz * reach,
      );
      const from = v3(0.05 * (y / H), y, -0.03 * (y / H));
      limb(m, from, end, R * 0.028, R * 0.01, bark, 5);
      const s =
        R *
        (0.24 + 0.1 * rand()) *
        (opts.flat ? 1.15 : 1 - f * 0.35) *
        (opts.soft ? 1.25 : 1);
      foliage(
        m,
        end.x,
        end.y + s * 0.15,
        end.z,
        s * 1.2,
        s * (opts.flat ? 0.45 : opts.soft ? 0.75 : 0.6),
        s * 1.2,
        shades(green, rand),
        rand,
        "needle",
        2,
      );
    }
  }
  foliage(
    m,
    0.05,
    H * 0.96,
    -0.03,
    R * 0.16,
    R * 0.26,
    R * 0.16,
    green,
    rand,
    "needle",
  );
}

/** A mugo pine: a low, many-stemmed mound of upturned needle tufts. */
function mugo(m: Model, rand: () => number, green: string): void {
  const { W, D, H } = m;
  const rx = W / 2;
  const rz = D / 2;
  const R = Math.min(rx, rz);
  const bark = mat("#5a4030", 0.95);
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.6;
    const d = 0.45 + 0.3 * rand();
    const end = v3(
      Math.cos(a) * rx * d,
      H * (0.38 + 0.2 * rand()),
      Math.sin(a) * rz * d,
    );
    limb(m, v3(0, -0.02, 0), end, R * 0.06, R * 0.03, bark, 4);
    const s = R * (0.5 + 0.12 * rand());
    foliage(
      m,
      end.x,
      end.y,
      end.z,
      s,
      s * 0.75,
      s,
      shades(green, rand),
      rand,
      "needle",
      2,
    );
  }
  foliage(
    m,
    0,
    H * 0.55,
    0,
    R * 0.72,
    H * 0.42,
    R * 0.72,
    green,
    rand,
    "needle",
    2,
  );
}

/** An arborvitae (or, as a `cone`, a dwarf Alberta spruce): a dense
 * column widest low and rounding to a point (a cone: tapering straight
 * from a broad base), clothed to the ground in overlapping tufts of
 * foliage (lit on top, shaded beneath) over a dark core, so it reads as a
 * sheared evergreen rather than a smooth spindle. */
function column(
  m: Model,
  rand: () => number,
  green: string,
  opts: { cone?: boolean } = {},
): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  // Its radius up its height.
  const radius = (f: number) =>
    opts.cone
      ? R * Math.pow(1 - f, 0.95) * (f < 0.08 ? 0.85 + 2 * f : 1)
      : R * (f < 0.2 ? 0.88 + 0.6 * f : Math.pow((1 - f) / 0.8, 0.7));
  const core = tone(green, 0.4);
  for (let i = 0; i < 6; i++) {
    const f = (i + 0.5) / 6;
    const r = radius(Math.min(0.92, f)) * 0.82;
    clump(m, 0, H * f * 0.96, 0, r, H * 0.11, r, core, rand, 0.1, 1, {
      light: 0.3,
    });
  }
  // Finer tufts on a spruce.
  const tuft = opts.cone
    ? Math.max(0.09, Math.min(0.16, R * 0.3))
    : Math.max(0.14, Math.min(0.26, R * 0.36));
  const rows = Math.max(6, Math.round(H / (tuft * 0.95)));
  for (let j = 0; j < rows; j++) {
    const f = (j + 0.4) / rows;
    const r = radius(f);
    const y = H * f * 0.97;
    const n = Math.max(3, Math.round((2 * Math.PI * r) / (tuft * 0.95)));
    for (let k = 0; k < n; k++) {
      const a = ((k + (j % 2) * 0.5) / n) * Math.PI * 2 + rand() * 0.25;
      const s = tuft * (0.85 + 0.35 * rand()) * (r < tuft ? 0.8 : 1);
      clump(
        m,
        Math.cos(a) * r * 0.8,
        y + (rand() - 0.5) * tuft * 0.4,
        Math.sin(a) * r * 0.8,
        s,
        s * 1.1,
        s,
        tone(green, 0.82 + 0.2 * rand()),
        rand,
        0.32,
        1,
        { light: 0.55, fleck: 0.3 },
      );
    }
  }
  // The tip.
  clump(
    m,
    0,
    H * 0.97,
    0,
    tuft * 0.6,
    tuft * 0.9,
    tuft * 0.6,
    green,
    rand,
    0.25,
    1,
    { light: 0.6 },
  );
}

/** A palm: a ringed, gently curving trunk and a crown of arching fronds,
 * each a stem with leaflets along both sides. */
function palm(m: Model, rand: () => number, green: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const bark = mat("#7c6650", 0.95);
  const ring = mat("#64503e", 0.95);
  const lean = v3((rand() - 0.5) * R * 0.5, 0, (rand() - 0.5) * R * 0.5);
  const trunkH = H * 0.78;
  const at = (t: number) => v3(lean.x * t * t, trunkH * t, lean.z * t * t);
  for (let i = 0; i < 14; i++) {
    const a = at(i / 14);
    const b = at((i + 1) / 14);
    const r0 = 0.17 - 0.05 * (i / 14);
    limb(m, a, b, r0, r0 * 0.96, bark, 12);
    limb(m, b.clone().add(v3(0, -0.04, 0)), b, r0 * 1.07, r0 * 1.03, ring, 12);
  }
  const top = at(1);
  m.sphere(0.2, top.x, top.y + 0.05, top.z, mat("#5c5a32", 0.95), 1, 0.8, 1);
  const fronds = 14;
  for (let f = 0; f < fronds; f++) {
    const az = (f / fronds) * Math.PI * 2 + rand() * 0.3;
    const len = R * (0.85 + 0.25 * rand());
    const up = 0.2 + 0.55 * rand();
    const out = v3(Math.cos(az), 0, Math.sin(az));
    const side = v3(-out.z, 0, out.x);
    const pts: V3[] = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push(
        top
          .clone()
          .addScaledVector(out, len * t)
          .add(
            v3(0, len * (up * Math.sin(t * Math.PI * 0.6) - 0.55 * t * t), 0),
          ),
      );
    }
    const color = shades(green, rand);
    strip(
      m,
      pts,
      pts.map((_, i) => 0.035 * (1 - i / 13)),
      side,
      tone(color, 0.8),
      color,
    );
    // Leaflets, drooping off both sides.
    for (let i = 1; i < 12; i++) {
      const p = pts[i]!;
      const ll = len * 0.3 * Math.sin((i / 12) * Math.PI) + 0.05;
      for (const sgn of [-1, 1]) {
        const tip = p
          .clone()
          .addScaledVector(side, sgn * ll * 0.8)
          .addScaledVector(out, ll * 0.35)
          .add(v3(0, -ll * 0.5, 0));
        const mid = p
          .clone()
          .lerp(tip, 0.5)
          .add(v3(0, ll * 0.1, 0));
        strip(
          m,
          [p, mid, tip],
          [0.05, 0.035, 0.002],
          out,
          tone(color, 0.85),
          color,
        );
      }
    }
  }
}

/** A rounded shrub of leafy clumps over the footprint; `low` spreads it
 * into a juniper's mats; `bloom` sets flowers over it. */
function mound(
  m: Model,
  rand: () => number,
  green: string,
  opts: { low?: boolean; bloom?: string | null; big?: boolean } = {},
): void {
  const { W, D, H } = m;
  const rx = W / 2;
  const rz = D / 2;
  if (opts.low) {
    const n = Math.round(8 + rx * rz * 6);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * 0.72;
      const s = Math.min(rx, rz) * (0.3 + 0.14 * rand());
      foliage(
        m,
        Math.cos(a) * rx * d,
        H * (0.32 + 0.3 * (1 - d)),
        Math.sin(a) * rz * d,
        s * 1.3,
        H * 0.36,
        s * 1.3,
        shades(green, rand),
        rand,
        "needle",
        1.3,
      );
    }
    return;
  }
  clump(
    m,
    0,
    H * 0.48,
    0,
    rx * 0.72,
    H * 0.44,
    rz * 0.72,
    tone(green, 0.45),
    rand,
    0.22,
    2,
    { light: 0.4 },
  );
  const n = 7;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.6;
    const s = Math.min(rx, rz) * (0.38 + 0.12 * rand());
    foliage(
      m,
      Math.cos(a) * rx * 0.48,
      H * (0.42 + 0.16 * rand()),
      Math.sin(a) * rz * 0.48,
      s,
      Math.min(s, H * 0.42),
      s,
      shades(green, rand),
      rand,
      "fine",
      1.6,
    );
  }
  foliage(
    m,
    0,
    H * 0.74,
    0,
    rx * 0.46,
    H * 0.28,
    rz * 0.46,
    shades(green, rand),
    rand,
    "fine",
    1.6,
  );
  if (opts.bloom) {
    const heads = opts.big ? 24 : 50;
    for (let i = 0; i < heads; i++) {
      const p = onCanopy(rand, rx * 1.08, H * 0.56, rz * 1.08, 0.6);
      const s = opts.big ? 0.06 + 0.04 * rand() : 0.022 + 0.012 * rand();
      clump(
        m,
        p.x,
        H * 0.5 + p.y,
        p.z,
        s,
        s * 0.85,
        s,
        shades(opts.bloom, rand),
        rand,
        0.35,
        opts.big ? 2 : 1,
        { light: 0.3, fleck: 0.3 },
      );
    }
  }
}

/** A clipped hedge along its width: a soft block of leaves, its faces
 * feathered with leaf sprays. */
function hedge(m: Model, rand: () => number, green: string): void {
  const { W, D, H } = m;
  const n = Math.max(2, Math.round(W / 0.7));
  const size = Math.max(0.2, Math.min(0.4, D * 0.45));
  const per = Math.round(((W / n) * H * 2 + (W / n) * D + D * H) * 30);
  for (let i = 0; i < n; i++) {
    const x = -W / 2 + (W * (i + 0.5)) / n;
    clump(
      m,
      x,
      H * 0.47,
      0,
      (W / n) * 0.82,
      H * 0.45,
      D * 0.42,
      tone(green, 0.45),
      rand,
      0.06,
      2,
      { light: 0.45 },
    );
    cards(
      m,
      v3(x, H * 0.5, 0),
      (W / n) * 0.66,
      H * 0.5,
      D * 0.5,
      shades(green, rand),
      rand,
      per,
      size,
      "fine",
      { up: 0.2 },
    );
  }
}

/** Ornamental grass: a fountain of arching blades, with plumes (feathery
 * heads) arching out over it; `reed` stands upright with tall stalks. */
function grass(
  m: Model,
  rand: () => number,
  green: string,
  opts: {
    plume?: string | null;
    reed?: boolean;
    tall?: boolean;
    /** Hair-fine blades (a feather grass), more of them. */
    fine?: boolean;
    /** Plumes in a soft haze over the whole clump (a muhly). */
    cloud?: boolean;
    /** Blades banded with straw (a zebra grass). */
    banded?: boolean;
    /** Plumes held up in a fan over the clump (a miscanthus). */
    fan?: boolean;
  },
): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const n = Math.round(
    Math.min(opts.fine ? 360 : 260, (70 + R * 280) * (opts.fine ? 1.5 : 1)),
  );
  const bladeH = opts.plume || opts.reed ? H * 0.7 : H;
  const straw = tone(green, 1.35);
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * R * 0.28;
    const base = v3(Math.cos(a) * d, 0, Math.sin(a) * d);
    const lean = opts.reed
      ? 0.12 + 0.25 * rand()
      : 0.4 + 0.9 * rand() * ((d / (R * 0.28)) * 0.5 + 0.5);
    blade(
      m,
      base,
      a + (rand() - 0.5) * 0.5,
      bladeH * (0.65 + 0.4 * rand()),
      lean,
      Math.max(0.004, R * (opts.fine ? 0.014 : 0.035)),
      shades(green, rand),
      4,
      rand() < (opts.banded ? 0.5 : 0.2) ? straw : undefined,
    );
  }
  if (!opts.plume) return;
  // A haze (a muhly) or a fine grass's heads: hair-thin strands, green at
  // the base and taking the plume's colour out to their tips.
  if (opts.cloud || opts.fine) {
    const wisps = opts.cloud ? 240 : 110;
    for (let i = 0; i < wisps; i++) {
      const a = rand() * Math.PI * 2;
      const d = Math.sqrt(rand()) * R * 0.25;
      const base = v3(Math.cos(a) * d, 0, Math.sin(a) * d);
      blade(
        m,
        base,
        a + (rand() - 0.5) * 0.6,
        H * (opts.cloud ? 0.75 + 0.3 * rand() : 0.85 + 0.2 * rand()),
        (opts.cloud ? 0.5 : 0.7) + 0.7 * rand(),
        opts.cloud ? 0.006 : 0.004,
        tone(opts.plume, opts.cloud ? 0.8 : 0.9),
        4,
        shades(opts.plume, rand),
      );
    }
    return;
  }
  const stalks = opts.fan ? 30 : opts.tall ? 24 : opts.reed ? 34 : 28;
  for (let i = 0; i < stalks; i++) {
    const a = rand() * Math.PI * 2;
    const base = v3(
      Math.cos(a) * R * 0.1 * rand(),
      0,
      Math.sin(a) * R * 0.1 * rand(),
    );
    const lean = opts.reed
      ? 0.06 + 0.1 * rand()
      : opts.fan
        ? 0.12 + 0.3 * rand()
        : 0.35 + 0.5 * rand();
    const len = H * (0.82 + 0.18 * rand());
    const tip = blade(m, base, a, len, lean, 0.006, straw, 3);
    const dir = tip.clone().sub(base).normalize();
    const ph = opts.tall ? 0.5 : opts.fan ? 0.3 : opts.reed ? 0.26 : 0.16;
    const pr = opts.tall ? 0.05 : opts.fan ? 0.018 : opts.reed ? 0.016 : 0.022;
    const c = tip.clone().addScaledVector(dir, -ph * 0.35);
    const g0 = new THREE.Group();
    const pm = new Model(1, 1, 1, false);
    clump(pm, 0, 0, 0, pr, ph / 2, pr, shades(opts.plume, rand), rand, 0.5, 1, {
      light: 0.35,
      fleck: 0.3,
      flat: true,
    });
    g0.add(pm.group());
    g0.position.copy(c);
    g0.quaternion.setFromUnitVectors(v3(0, 1, 0), dir);
    g0.updateMatrixWorld(true);
    g0.traverse((ob) => {
      const mesh = ob as THREE.Mesh;
      if (!mesh.isMesh) return;
      m.add(mesh.geometry.clone().applyMatrix4(mesh.matrixWorld), FOLIAGE);
      mesh.geometry.dispose();
    });
  }
}

/** A yucca (or agave): a rosette of stiff sword leaves, upright in the
 * middle and spreading to the ground at the edge; a yucca's flower spike
 * of cream bells rises out of it. */
function rosette(
  m: Model,
  rand: () => number,
  green: string,
  opts: { agave?: boolean; stalk?: boolean; stripe?: string | null },
): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const n = opts.agave ? 28 : 80;
  const leafH = opts.stalk ? H * 0.6 : H;
  const core = opts.agave ? 0.05 : 0.12;
  const deg = Math.PI / 180;
  for (let i = 0; i < n; i++) {
    const az = i * 2.39996 + rand() * 0.3;
    const inner = i / n;
    // Outer leaves lie low, inner ones stand up.
    const el =
      ((opts.agave ? 15 : 6) +
        (1 - inner) * (opts.agave ? 55 : 78) +
        rand() * 10) *
      deg;
    const len =
      Math.min(
        R / Math.max(0.25, Math.cos(el)),
        leafH / Math.max(0.3, Math.sin(el)),
      ) *
      (0.85 + 0.15 * rand());
    const out = v3(Math.cos(az), 0, Math.sin(az));
    const dir = out
      .clone()
      .multiplyScalar(Math.cos(el))
      .add(v3(0, Math.sin(el), 0));
    const base = v3(0, core, 0);
    const pts: V3[] = [];
    const segs = 4;
    for (let k = 0; k <= segs; k++) {
      const t = k / segs;
      const droop = opts.agave ? -0.02 * t : -0.14 * t * t * (1 - Math.sin(el));
      pts.push(
        base
          .clone()
          .addScaledVector(dir, len * t)
          .add(v3(0, droop * len, 0)),
      );
    }
    const wBase = opts.agave
      ? Math.min(0.16, R * 0.22)
      : Math.min(0.05, R * 0.065);
    const side = v3(-out.z, 0, out.x);
    // A shallow V along the midrib, so the leaf has some body.
    const keel = (p: V3, k: number, s: number) =>
      p
        .clone()
        .addScaledVector(side, s * wBase * 0.5 * (1 - (k / segs) * 0.95))
        .add(v3(0, -Math.abs(s) * wBase * 0.18, 0));
    const color = shades(green, rand);
    if (opts.stripe) {
      // Variegated (a Color Guard): a broad stripe down the middle of
      // each leaf, its margins green.
      const gold = shades(opts.stripe, rand);
      for (const [s, c] of [
        [-0.75, color],
        [-0.25, gold],
        [0.25, gold],
        [0.75, color],
      ] as const)
        strip(
          m,
          pts.map((p, k) => keel(p, k, s)),
          pts.map((_, k) => wBase * 0.25 * (1 - (k / segs) * 0.95)),
          side,
          c,
          tone(c, 1.12),
        );
    } else {
      strip(
        m,
        pts.map((p, k) => keel(p, k, -0.5)),
        pts.map((_, k) => wBase * 0.5 * (1 - (k / segs) * 0.95)),
        side,
        color,
        tone(color, 1.12),
      );
      strip(
        m,
        pts.map((p, k) => keel(p, k, 0.5)),
        pts.map((_, k) => wBase * 0.5 * (1 - (k / segs) * 0.95)),
        side,
        color,
        tone(color, 1.12),
      );
    }
    // A dark spine at an agave's tip.
    if (opts.agave) {
      const tip = pts[segs]!;
      limb(
        m,
        tip,
        tip.clone().addScaledVector(dir, 0.04),
        0.006,
        0.001,
        mat("#3a2a20", 0.8),
        5,
      );
    }
  }
  // A short trunk of old leaves under a yucca.
  if (!opts.agave)
    m.cyl(0.07, 0.09, core + 0.02, 0, 0, 0, mat("#8b7a5c", 0.95), 8);
  if (opts.stalk) {
    const stem = mat("#7a7a4a", 0.9);
    const top = v3(0.03, H, -0.02);
    limb(m, v3(0, core, 0), top, 0.018, 0.01, stem, 6);
    for (let k = 0; k < 34; k++) {
      const t = 0.6 + 0.38 * (k / 34);
      const a = k * 2.4;
      const p = v3(0, core, 0).lerp(top, t);
      const r = 0.08 * (1 - (t - 0.6) * 1.8);
      clump(
        m,
        p.x + Math.cos(a) * r,
        p.y,
        p.z + Math.sin(a) * r,
        0.022,
        0.028,
        0.022,
        k % 2 ? "#f3eedb" : "#e6dcc0",
        rand,
        0.2,
        1,
        { light: 0.3 },
      );
    }
  }
}

/** A hosta: broad, arching leaves on stems in a dome. */
function hosta(m: Model, rand: () => number, green: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const n = 24;
  for (let i = 0; i < n; i++) {
    const az = i * 2.39996;
    const inner = i / n;
    const out = v3(Math.cos(az), 0, Math.sin(az));
    const reach = R * (0.32 + 0.45 * inner);
    const c = out
      .clone()
      .multiplyScalar(reach)
      .add(v3(0, H * (0.85 - 0.45 * inner), 0));
    // The leaf: an oval cupped along its midrib, tipped down at its end.
    const L = R * 0.55;
    const Wd = L * 0.62;
    const side = v3(-out.z, 0, out.x);
    const segs = 6;
    const ring = (t: number, s: number) =>
      c
        .clone()
        .addScaledVector(out, (t - 0.35) * L)
        .addScaledVector(
          side,
          s * Wd * Math.sin(Math.PI * Math.min(1, t * 1.05)),
        )
        .add(v3(0, -0.35 * L * t * t + 0.1 * L * Math.abs(s), 0));
    const color = shades(green, rand);
    for (const sgn of [-1, 1]) {
      const pts: V3[] = [];
      const ws: number[] = [];
      for (let k = 0; k <= segs; k++) {
        const t = k / segs;
        pts.push(ring(t, sgn * 0.25));
        ws.push(Wd * 0.5 * Math.sin(Math.PI * Math.min(1, t * 1.05)) + 0.002);
      }
      strip(m, pts, ws, side, color, tone(color, 1.15));
    }
    limb(
      m,
      v3(0, 0, 0),
      ring(0, 0),
      0.006,
      0.005,
      mat(tone(green, 0.8), 0.9),
      4,
    );
  }
}

/** Daylilies: arching strap leaves and stems of trumpet flowers. */
function daylily(
  m: Model,
  rand: () => number,
  green: string,
  bloom: string,
): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  for (let i = 0; i < 50; i++) {
    const a = rand() * Math.PI * 2;
    blade(
      m,
      v3(Math.cos(a) * R * 0.08, 0, Math.sin(a) * R * 0.08),
      a,
      H * (0.5 + 0.25 * rand()),
      0.9 + 0.6 * rand(),
      0.022,
      shades(green, rand),
    );
  }
  for (let s = 0; s < 8; s++) {
    const a = rand() * Math.PI * 2;
    const tip = blade(
      m,
      v3(0, 0, 0),
      a,
      H * (0.85 + 0.15 * rand()),
      0.15,
      0.008,
      green,
      3,
    );
    for (let f = 0; f < 2; f++) {
      const fa = a + f * 2.5;
      const c = tip
        .clone()
        .add(v3(Math.cos(fa) * 0.05, -0.03 * f, Math.sin(fa) * 0.05));
      const out = v3(Math.cos(fa), 0.7, Math.sin(fa)).normalize();
      // Six petals flaring from the throat.
      for (let p = 0; p < 6; p++) {
        const pa = (p / 6) * Math.PI * 2;
        const across = new THREE.Vector3(Math.cos(pa), 0, Math.sin(pa))
          .cross(out)
          .normalize();
        const tipP = c
          .clone()
          .addScaledVector(out, 0.05)
          .addScaledVector(across, 0.035);
        strip(
          m,
          [c, c.clone().lerp(tipP, 0.5), tipP],
          [0.006, 0.03, 0.004],
          across.clone().cross(out).normalize(),
          tone(bloom, 0.9),
          bloom,
        );
      }
      clump(m, c.x, c.y, c.z, 0.01, 0.01, 0.01, "#d9b13a", rand, 0.1, 0);
    }
  }
}

/** Lavender: a grey-green mound of fine stems with purple spikes. */
function lavender(m: Model, rand: () => number, bloom: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const green = "#8a9c7c";
  for (let i = 0; i < 120; i++) {
    const a = rand() * Math.PI * 2;
    blade(
      m,
      v3(Math.cos(a) * R * 0.2 * rand(), 0, Math.sin(a) * R * 0.2 * rand()),
      a,
      H * (0.45 + 0.15 * rand()),
      0.5 + 0.5 * rand(),
      0.008,
      shades(green, rand),
      3,
    );
  }
  for (let i = 0; i < 64; i++) {
    const a = rand() * Math.PI * 2;
    const tip = blade(
      m,
      v3(Math.cos(a) * R * 0.1, 0, Math.sin(a) * R * 0.1),
      a,
      H * (0.85 + 0.15 * rand()),
      0.25 + 0.35 * rand(),
      0.004,
      green,
      3,
    );
    clump(
      m,
      tip.x,
      tip.y - 0.03,
      tip.z,
      0.013,
      0.04,
      0.013,
      shades(bloom, rand),
      rand,
      0.25,
      1,
      { light: 0.35 },
    );
  }
}

/** A mixed flower bed: little mounds of leaves under blooms of several
 * colours, over the footprint's oval. */
function flowers(m: Model, rand: () => number): void {
  const { W, D, H } = m;
  const palette = [
    "#e5463b",
    "#f2c230",
    "#9a5ec8",
    "#f7f2ee",
    "#ef7fb0",
    "#f08a24",
    "#5f7fe0",
  ];
  const n = Math.round(18 + W * D * 34);
  const stem = mat("#4a7631", 0.9);
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2;
    const d = Math.sqrt(rand()) * 0.92;
    const x = Math.cos(a) * (W / 2) * d;
    const z = Math.sin(a) * (D / 2) * d;
    const s = 0.06 + 0.04 * rand();
    cards(
      m,
      v3(x, s * 0.6, z),
      s,
      s * 0.6,
      s,
      shades("#558a39", rand),
      rand,
      5,
      s * 1.4,
      "fine",
      { up: 0.6 },
    );
    const color = palette[Math.floor(rand() * palette.length)]!;
    const blooms = 1 + Math.floor(rand() * 3);
    for (let b = 0; b < blooms; b++) {
      const bx = x + (rand() - 0.5) * 0.08;
      const bz = z + (rand() - 0.5) * 0.08;
      const by = H * (0.55 + 0.45 * rand());
      limb(m, v3(x, 0, z), v3(bx, by, bz), 0.004, 0.003, stem, 4);
      clump(m, bx, by, bz, 0.032, 0.014, 0.032, color, rand, 0.3, 1, {
        light: 0.3,
        fleck: 0.2,
      });
    }
  }
}

/** A fern: fronds arching out from the crown, each a stem of tapering
 * leaflets. */
function fern(m: Model, rand: () => number, green: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  for (let f = 0; f < 18; f++) {
    const az = f * 2.39996 + rand() * 0.2;
    const out = v3(Math.cos(az), 0, Math.sin(az));
    const side = v3(-out.z, 0, out.x);
    const len = R * (0.9 + 0.2 * rand());
    const up = 0.6 + 0.6 * rand();
    const pts: V3[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      pts.push(
        out
          .clone()
          .multiplyScalar(len * t)
          .add(
            v3(0, H * (up * Math.sin(t * Math.PI * 0.7)) - H * 0.3 * t * t, 0),
          ),
      );
    }
    const color = shades(green, rand);
    strip(
      m,
      pts,
      pts.map((_, i) => 0.01 * (1 - i / 11)),
      side,
      color,
    );
    for (let i = 1; i < 10; i++) {
      const p = pts[i]!;
      const ll = len * 0.17 * Math.sin((i / 10) * Math.PI);
      for (const sgn of [-1, 1])
        strip(
          m,
          [
            p,
            p
              .clone()
              .addScaledVector(side, sgn * ll)
              .addScaledVector(out, ll * 0.4)
              .add(v3(0, -ll * 0.15, 0)),
          ],
          [0.03, 0.003],
          out,
          color,
          tone(color, 1.1),
        );
    }
  }
}

/** A boulder (or a few), sitting a little into the ground. */
function boulders(m: Model, rand: () => number, several: boolean): void {
  const { W, D, H } = m;
  const greys = ["#8f8b83", "#7f7a72", "#9d988e"];
  const stones = several
    ? [
        { x: -W * 0.18, z: -D * 0.05, s: 0.55 },
        { x: W * 0.22, z: D * 0.12, s: 0.4 },
        { x: W * 0.02, z: D * 0.3, s: 0.28 },
      ]
    : [{ x: 0, z: 0, s: 1 }];
  stones.forEach((st, i) => {
    const sx = (W / 2) * st.s * (several ? 0.9 : 1);
    const sz = (D / 2) * st.s * (several ? 0.9 : 1);
    const sy = H * (several ? 0.5 + 0.5 * st.s : 1);
    clump(
      m,
      st.x,
      sy * 0.5,
      st.z,
      sx,
      sy * 0.72,
      sz,
      greys[i % 3]!,
      rand,
      0.32,
      1,
      { light: 0.35, fleck: 0.1, flat: true },
    );
  });
}

function plantModel(m: Model, item: Item3d, o: Opts): boolean {
  if (houseplant(m, item, o)) return true;
  const rand = seeded(item.id);
  const form = str(o, "form", "");
  const tint = item.model?.tint ?? null;
  const green =
    tint ?? str(o, "leaf", form === "conifer" ? "#3f6136" : "#4d7a36");
  const bloom = typeof o["bloom"] === "string" ? o["bloom"] : null;
  switch (form) {
    case "deciduous":
      deciduous(m, rand, green, { wide: !!o["wide"] });
      return true;
    case "flowering":
      deciduous(m, rand, "#5c8a3c", { bloom: tint ?? bloom, stems: 2 });
      return true;
    case "japanese":
      japanese(m, rand, green);
      return true;
    case "aspen":
      aspen(m, rand, green);
      return true;
    case "birch":
      birch(m, rand, green);
      return true;
    case "weeping":
      weeping(m, rand, green);
      return true;
    case "conifer":
      // A dense one (a dwarf Alberta spruce) is a solid, tufted cone.
      if (o["dense"]) column(m, rand, green, { cone: true });
      else conifer(m, rand, green, { droop: !!o["droop"] });
      return true;
    case "pine":
      pine(m, rand, green, {
        ...(typeof o["crown"] === "number" ? { crown: o["crown"] } : {}),
        ...(typeof o["bark"] === "string" ? { bark: o["bark"] } : {}),
        flat: !!o["flat"],
        soft: !!o["soft"],
      });
      return true;
    case "mugo":
      mugo(m, rand, green);
      return true;
    case "column":
      column(m, rand, green);
      return true;
    case "palm":
      palm(m, rand, green);
      return true;
    case "mound":
      mound(m, rand, green);
      return true;
    case "flowerShrub":
      mound(m, rand, "#4b7a35", { bloom: tint ?? bloom, big: !!o["big"] });
      return true;
    case "spreader":
      mound(m, rand, green, { low: true });
      return true;
    case "hedge":
      hedge(m, rand, green);
      return true;
    case "grass":
      grass(m, rand, tint ?? str(o, "leaf", "#728f45"), {
        plume: typeof o["plume"] === "string" ? o["plume"] : null,
        tall: !!o["tall"],
        fine: !!o["fine"],
        cloud: !!o["cloud"],
        banded: !!o["banded"],
        fan: !!o["fan"],
      });
      return true;
    case "reed":
      grass(m, rand, green, {
        plume: typeof o["plume"] === "string" ? o["plume"] : "#cdb98a",
        reed: true,
        fine: !!o["fine"],
      });
      return true;
    case "yucca":
      rosette(m, rand, green, {
        stalk: !!o["stalk"],
        stripe: typeof o["stripe"] === "string" ? o["stripe"] : null,
      });
      return true;
    case "agave":
      rosette(m, rand, green, { agave: true });
      return true;
    case "hosta":
      hosta(m, rand, green);
      return true;
    case "daylily":
      daylily(m, rand, "#4f7d36", tint ?? bloom ?? "#ef8a22");
      return true;
    case "lavender":
      lavender(m, rand, tint ?? bloom ?? "#8a6bc4");
      return true;
    case "flowers":
      flowers(m, rand);
      return true;
    case "fern":
      fern(m, rand, green);
      return true;
    case "boulder":
      boulders(m, rand, false);
      return true;
    case "boulders":
      boulders(m, rand, true);
      return true;
  }
  return false;
}

// --- houseplants ----------------------------------------------------------------

/** Houseplants in their pots, each its own species: broad, split, heart,
 * strap and round leaves on stalks and vines, fronds, canes, rosettes. A
 * colour set on one paints its pot. */

const POT = {
  terracotta: "#b5653f",
  white: "#ebe8e1",
  charcoal: "#3a3a3c",
  basket: "#b8945f",
  sage: "#a3ad98",
};

/** The plant being built: its pot's size (diameter, metres) and shape
 * set on the item (null: the species' own), how full it is (1 as drawn),
 * and the radius its pot came out at. */
const PLANT: {
  pot: number | null;
  shape: string | null;
  full: number;
  r: number;
} = { pot: null, shape: null, full: 1, r: 0 };

/** A count of leaves, fronds or branches, scaled by the plant's fullness. */
const more = (n: number) => Math.max(1, Math.round(n * PLANT.full));

/** A pot standing at (x, y, z): tapered (or straight, a low bowl, a
 * square planter), its lip, the soil; the soil's height. A basket is
 * woven in bands. Its size and shape set on the item win. */
function pot(
  m: Model,
  r: number,
  h: number,
  color: string,
  opts: { x?: number; y?: number; z?: number; basket?: boolean } = {},
): number {
  const { x = 0, y = 0, z = 0 } = opts;
  if (PLANT.pot) {
    const k = PLANT.pot / 2 / r;
    r = PLANT.pot / 2;
    h = Math.min(h * k, m.H * 0.6);
  }
  const shape = PLANT.shape ?? "taper";
  if (shape === "bowl") h = Math.min(h, r * 0.8);
  PLANT.r = r;
  const body = mat(color, opts.basket ? 0.95 : 0.55);
  if (shape === "square") {
    m.box(r * 1.8, h * 0.92, r * 1.8, x, y, z, body);
    m.box(r * 1.9, h * 0.08, r * 1.9, x, y + h * 0.92, z, body);
  } else {
    const foot = shape === "cylinder" ? 1 : shape === "bowl" ? 0.55 : 0.8;
    m.cyl(r, r * foot, h * 0.9, x, y, z, body, 28);
    m.cyl(r * 1.05, r * 1.02, h * 0.12, x, y + h * 0.88, z, body, 28);
  }
  if (opts.basket && shape !== "square")
    for (let k = 1; k < 4; k++) {
      const rr = r * (0.8 + (0.2 * k) / 4) + 0.003;
      m.cyl(
        rr,
        rr,
        0.012,
        x,
        y + (h * 0.9 * k) / 4,
        z,
        mat(tone(color, 0.72), 0.95),
        28,
      );
    }
  const soil = y + h * 0.93;
  if (shape === "square")
    m.box(r * 1.7, 0.012, r * 1.7, x, soil - 0.012, z, mat("#3a2a1f", 0.95));
  else
    m.cyl(
      r * 0.96,
      r * 0.96,
      0.012,
      x,
      soil - 0.012,
      z,
      mat("#3a2a1f", 0.95),
      24,
    );
  return soil;
}

/** A model drawing into another, raised by `dy` (a plant grown on its
 * pot's soil by an outdoor builder). */
class Lifted extends Model {
  constructor(
    private readonly into: Model,
    private readonly dy: number,
    h: number,
  ) {
    super(into.W, into.D, Math.max(0.02, h), false);
  }
  override add(g: THREE.BufferGeometry, material: THREE.Material): void {
    g.translate(0, this.dy, 0);
    this.into.add(g, material);
  }
}

/** A unit direction at azimuth `az` and `el` (radians) above level. */
const aim = (az: number, el: number): V3 =>
  v3(Math.cos(az) * Math.cos(el), Math.sin(el), Math.sin(az) * Math.cos(el));
const DEG = Math.PI / 180;

type LeafShape =
  "oval" | "round" | "heart" | "lance" | "strap" | "fiddle" | "split";

/** A leaf's half-width along its length (0 at its stalk, 1 at its tip). */
const LEAF_WIDTH: Record<LeafShape, (t: number) => number> = {
  oval: (t) => Math.pow(Math.sin(Math.PI * t), 0.75),
  round: (t) => Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2)),
  heart: (t) => Math.pow(Math.sin(Math.PI * (0.2 + 0.8 * t)), 0.65),
  lance: (t) => Math.min(1, t * 5) * Math.pow(1 - t, 0.9),
  strap: (t) => Math.min(1, t * 8) * Math.min(1, (1 - t) * 4),
  fiddle: (t) => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.65)), 0.7),
  split: (t) => Math.pow(Math.sin(Math.PI * (0.12 + 0.88 * t)), 0.6),
};

/** A leaf from `base` along `dir`: `len` long, `wid` across at its widest,
 * cupped along its midrib (`fold`) and arching down to its tip (`droop`,
 * of its length). Darker at its stalk, its midrib lighter, its rim
 * `edge`'s colour (variegation); a monstera's (`split`) cut into fingers. */
function leaf(
  m: Model,
  base: V3,
  dir: V3,
  len: number,
  wid: number,
  color: string,
  opts: {
    shape?: LeafShape;
    fold?: number;
    droop?: number;
    tip?: string;
    edge?: string;
  } = {},
): void {
  const shape = opts.shape ?? "oval";
  const width = LEAF_WIDTH[shape];
  const fold = opts.fold ?? 0.15;
  const droop = opts.droop ?? 0.2;
  const d = dir.clone().normalize();
  const flat = v3(-d.z, 0, d.x);
  const side = flat.lengthSq() > 1e-6 ? flat.normalize() : v3(1, 0, 0);
  const up = side.clone().cross(d).normalize();
  if (up.y < 0) up.negate();
  const segs = shape === "split" ? 12 : 8;
  const across = [0, 0.45, 1];
  const c0 = new THREE.Color(color).multiplyScalar(0.7);
  const c1 = new THREE.Color(opts.tip ?? color);
  const rim = opts.edge ? new THREE.Color(opts.edge) : null;
  const point = (t: number, u: number, s: number) => {
    const w = (width(t) * wid) / 2;
    return base
      .clone()
      .addScaledVector(d, len * t)
      .add(v3(0, -droop * len * t * t, 0))
      .addScaledVector(side, s * u * w)
      .addScaledVector(up, fold * u * u * w);
  };
  const colour = (t: number, u: number) => {
    const c = c0.clone().lerp(c1, Math.min(1, t * 1.3));
    if (u === 0) c.multiplyScalar(1.12);
    if (rim && u === 1) c.lerp(rim, 0.75);
    return c;
  };
  const pos: number[] = [];
  const col: number[] = [];
  for (const s of [-1, 1])
    for (let i = 0; i < segs; i++) {
      const ta = i / segs;
      const tb = (i + 1) / segs;
      for (let j = 0; j + 1 < across.length; j++) {
        // A monstera's splits: its outer half cut into fingers.
        if (
          shape === "split" &&
          j === 1 &&
          i % 3 === 1 &&
          ta > 0.1 &&
          tb < 0.95
        )
          continue;
        const ua = across[j]!;
        const ub = across[j + 1]!;
        for (const [t, u] of [
          [ta, ua],
          [ta, ub],
          [tb, ub],
          [ta, ua],
          [tb, ub],
          [tb, ua],
        ] as const) {
          const p = point(t, u, s);
          const c = colour(t, u);
          pos.push(p.x, p.y, p.z);
          col.push(c.r, c.g, c.b);
        }
      }
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  m.add(g, SHEET);
}

/** A stalk or vine through points, as short cylinders. */
function stalk(m: Model, pts: V3[], r: number, color: string): void {
  const material = mat(color, 0.85);
  for (let i = 0; i + 1 < pts.length; i++)
    limb(m, pts[i]!, pts[i + 1]!, r, r * 0.9, material, 5);
}

/** Points along a stalk from `base` toward `dir`, `len` long, bending
 * down by `sag` (of its length) toward its end. */
function arc(base: V3, dir: V3, len: number, sag: number, n = 5): V3[] {
  const pts: V3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts.push(
      base
        .clone()
        .addScaledVector(dir, len * t)
        .add(v3(0, -sag * len * t * t, 0)),
    );
  }
  return pts;
}

/** A snake plant: stiff sword leaves standing straight up, banded dark
 * green with a yellow rim. */
function snakePlant(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.62, Math.min(0.24, H * 0.3), potColor);
  for (let i = 0, n = more(9); i < n; i++) {
    const az = i * 2.39996 + rand() * 0.4;
    // Spread across its pot (a big one set on it holds a wide clump).
    const r = Math.max(R * 0.3, PLANT.r * 0.7) * Math.sqrt(rand());
    leaf(
      m,
      v3(Math.cos(az) * r, top, Math.sin(az) * r),
      aim(az, (76 + rand() * 12) * DEG),
      (H - top) * (0.55 + 0.45 * rand()),
      0.06 + 0.025 * rand(),
      shades("#35593a", rand),
      { shape: "strap", fold: 0.35, droop: 0.02, edge: "#c8bf62" },
    );
  }
}

/** A ZZ plant: arching stems set with pairs of glossy oval leaflets. */
function zzPlant(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.5, Math.min(0.24, H * 0.32), potColor);
  const green = "#2d5224";
  for (let i = 0, n = more(9); i < n; i++) {
    const az = i * 2.39996 + rand() * 0.4;
    const len = (H - top) * (0.7 + 0.35 * rand());
    const dir = aim(az, (62 + rand() * 20) * DEG);
    const pts = arc(v3(0, top, 0), dir, len, 0.15);
    stalk(m, pts, 0.006, "#4a6a2e");
    const out = v3(Math.cos(az), 0, Math.sin(az));
    for (let k = 2; k <= 5; k++) {
      const p = pts[k]!;
      for (const s of [-1, 1])
        leaf(
          m,
          p,
          aim(az + s * 1.1, 15 * DEG).addScaledVector(out, 0.3),
          0.075,
          0.035,
          shades(green, rand),
          { fold: 0.12, droop: 0.15, tip: tone(green, 1.12) },
        );
    }
    leaf(m, pts[5]!, dir, 0.07, 0.034, green, { droop: 0.2 });
  }
}

/** A peace lily: glossy lance-oval leaves arching from long stalks, and
 * white spathes on stems standing above them. */
function peaceLily(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.5, Math.min(0.22, H * 0.32), potColor);
  const h = H - top;
  for (let i = 0, n = more(13); i < n; i++) {
    const az = i * 2.39996 + rand() * 0.3;
    const end = v3(0, top, 0).addScaledVector(
      aim(az, (58 + rand() * 18) * DEG),
      h * (0.35 + 0.15 * rand()),
    );
    stalk(m, [v3(0, top, 0), end], 0.004, "#3f6a2e");
    leaf(
      m,
      end,
      aim(az, (25 + rand() * 25) * DEG),
      h * 0.48,
      h * 0.17,
      shades("#2b5527", rand),
      {
        droop: 0.4,
        fold: 0.2,
        tip: "#3d6b33",
      },
    );
  }
  for (let i = 0, n = more(3); i < n; i++) {
    const az = rand() * Math.PI * 2;
    const head = v3(
      Math.cos(az) * R * 0.15,
      top + h * (0.85 + 0.12 * rand()),
      Math.sin(az) * R * 0.15,
    );
    stalk(m, [v3(0, top, 0), head], 0.003, "#4a7a35");
    leaf(
      m,
      head.clone().add(v3(0, -0.02, 0)),
      aim(az + Math.PI, 80 * DEG),
      0.11,
      0.06,
      "#f6f5ef",
      {
        fold: 0.55,
        droop: -0.15,
        tip: "#ffffff",
      },
    );
    limb(
      m,
      head,
      head.clone().add(v3(0, 0.05, 0)),
      0.006,
      0.004,
      mat("#efe6c4", 0.8),
      6,
    );
  }
}

/** Pothos or heartleaf philodendron: a mound of heart-shaped leaves, and
 * vines trailing over the rim to the floor (from a hanging pot when
 * `hanging`). */
function trailing(
  m: Model,
  rand: () => number,
  potColor: string,
  opts: { green: string; tip?: string; vines: number; hanging?: boolean },
): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const potH = Math.min(0.18, H * 0.3);
  const r0 = R * 0.45;
  const y0 = opts.hanging ? H - potH - 0.02 : 0;
  const top = pot(m, r0, potH, potColor, { y: y0 });
  const r = PLANT.r;
  if (opts.hanging) {
    const hook = v3(0, H + 0.45, 0);
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI * 2) / 3;
      limb(
        m,
        v3(Math.cos(a) * r, top, Math.sin(a) * r),
        hook,
        0.002,
        0.002,
        mat("#d9d2c1", 0.9),
        4,
      );
    }
  }
  const leafOf = (p: V3, dir: V3, size: number) =>
    leaf(m, p, dir, size, size * 0.85, shades(opts.green, rand), {
      shape: "heart",
      fold: 0.2,
      droop: 0.25,
      ...(opts.tip ? { tip: opts.tip } : {}),
    });
  // The mound over the soil.
  for (let i = 0, n = more(16); i < n; i++) {
    const az = i * 2.39996 + rand() * 0.4;
    const p = v3(
      Math.cos(az) * r * 0.6 * rand(),
      top + 0.02 + 0.06 * rand(),
      Math.sin(az) * r * 0.6 * rand(),
    );
    stalk(m, [v3(p.x * 0.5, top, p.z * 0.5), p], 0.002, "#5b7f3a");
    leafOf(p, aim(az, (20 + rand() * 30) * DEG), 0.07 + 0.03 * rand());
  }
  // The vines: over the rim and down, a leaf every few inches.
  for (let v = 0; v < more(opts.vines); v++) {
    const az = v * 2.39996 + rand() * 0.5;
    const out = v3(Math.cos(az), 0, Math.sin(az));
    const drop = Math.max(0.05, (top - 0.02) * (0.5 + 0.5 * rand()));
    const pts: V3[] = [
      v3(0, top, 0).addScaledVector(out, r * 0.7),
      v3(0, top + 0.02, 0).addScaledVector(out, r * 1.08),
    ];
    const steps = Math.max(2, Math.round(drop / 0.06));
    for (let k = 1; k <= steps; k++)
      pts.push(
        v3(0, top - (drop * k) / steps, 0)
          .addScaledVector(
            out,
            r * 1.15 + 0.03 * Math.sin(k * 1.3 + v) + 0.04 * (k / steps),
          )
          .add(
            v3(-out.z, 0, out.x).multiplyScalar(
              0.02 * Math.sin(k * 0.9 + v * 2),
            ),
          ),
      );
    stalk(m, pts, 0.0025, "#5b7f3a");
    for (let k = 2; k < pts.length; k++)
      leafOf(
        pts[k]!,
        aim(az + (k % 2 ? 0.7 : -0.7), (-35 + rand() * 30) * DEG),
        0.055 + 0.02 * rand(),
      );
  }
}

/** A monstera climbing a moss pole: tiers of big split leaves up it (a
 * tier for every 28 cm or so of its height: taller, more of them; its
 * fullness, more leaves a tier), each on a stalk out from the pole, its
 * blade hanging out and down and turned to face the plant's front, so
 * turning the plant aims them all. Bigger leaves higher up. */
function monstera(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.38, Math.min(0.32, H * 0.28), potColor);
  const h = H - top;
  const poleTop = top + h * 0.9;
  limb(
    m,
    v3(0, top - 0.05, -0.02),
    v3(0, poleTop, -0.02),
    0.035,
    0.03,
    mat("#6b5a3e", 0.95),
    8,
  );
  const tiers = Math.max(1, Math.round(h / 0.28));
  const scale = Math.min(1.3, Math.max(0.7, R / 0.4));
  for (let t = 0; t < tiers; t++) {
    const f = (t + 0.5) / tiers;
    const y = top + h * 0.1 + (poleTop - top - h * 0.1) * f;
    const n = more(t === tiers - 1 ? 2 : 3);
    for (let k = 0; k < n; k++) {
      // Spread across the front half, alternate tiers offset.
      const az =
        (0.12 + 0.76 * ((k + 0.5) / n)) * Math.PI +
        (t % 2 ? 0.15 : -0.15) +
        (rand() - 0.5) * 0.2;
      const base = v3(0, y, 0.015);
      const reach = (0.1 + 0.1 * rand() + 0.05 * f) * scale;
      const end = base
        .clone()
        .addScaledVector(aim(az, (15 + rand() * 20) * DEG), reach);
      stalk(m, [base, end], 0.007, "#3d6a2e");
      const len = (0.2 + 0.14 * f) * scale * (0.85 + 0.3 * rand());
      // Hanging out and down, its face to the front.
      const dir = v3(
        Math.cos(az) * 0.35,
        -0.55 - 0.2 * rand(),
        Math.sin(az) * 0.3 + 0.35,
      ).normalize();
      leaf(m, end, dir, len, len * 0.95, shades("#2b5926", rand), {
        shape: "split",
        droop: 0.12,
        fold: 0.06,
        tip: "#336a2c",
      });
    }
  }
}

/** A tree in a pot (a fiddle-leaf fig, a rubber plant): a trunk or two,
 * big leaves spiralling up its top part on short stalks. */
function pottedTree(
  m: Model,
  rand: () => number,
  potColor: string,
  opts: {
    green: string;
    shape: LeafShape;
    len: number;
    wid: number;
    stems: number;
    basket?: boolean;
    sheath?: string;
  },
): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.45, Math.min(0.4, H * 0.25), potColor, {
    ...(opts.basket ? { basket: true } : {}),
  });
  const h = H - top;
  const scale = Math.min(1.3, Math.max(0.6, H / 1.5));
  for (let s = 0; s < opts.stems; s++) {
    const lean = v3(
      (rand() - 0.5) * 0.12,
      1,
      (rand() - 0.5) * 0.12,
    ).normalize();
    const tall = h * (s === 0 ? 0.88 : 0.65 + 0.15 * rand());
    const pts: V3[] = [];
    for (let k = 0; k <= 4; k++)
      pts.push(
        v3((s - (opts.stems - 1) / 2) * 0.03, top, 0)
          .addScaledVector(lean, (tall * k) / 4)
          .add(
            v3(0.015 * Math.sin(k * 1.7 + s), 0, 0.015 * Math.cos(k * 1.3 + s)),
          ),
      );
    stalk(m, pts, 0.014, "#6b5a45");
    const n = more(Math.round(18 + 10 * (tall / h)));
    for (let i = 0; i < n; i++) {
      const t = 0.22 + 0.78 * (i / n);
      const k = Math.min(3, Math.floor(t * 4));
      const p = pts[k]!.clone().lerp(pts[k + 1]!, t * 4 - k);
      const az = i * 2.39996 + s + rand() * 0.3;
      const base = p.clone().addScaledVector(aim(az, 0), 0.03);
      const len = opts.len * scale * (0.75 + 0.35 * rand()) * (1 - 0.25 * t);
      leaf(
        m,
        base,
        aim(az, (-5 + rand() * 40) * DEG),
        len,
        len * opts.wid,
        shades(opts.green, rand),
        {
          shape: opts.shape,
          droop: 0.15,
          fold: 0.2,
          tip: tone(opts.green, 1.12),
        },
      );
    }
    if (opts.sheath)
      limb(
        m,
        pts[4]!,
        pts[4]!.clone().add(v3(0, 0.06, 0)),
        0.008,
        0.002,
        mat(opts.sheath, 0.6),
        6,
      );
  }
}

/** A palm frond from `base`: its stalk rising then arching out toward
 * `az`, narrow leaflets in pairs along it. */
function frond(
  m: Model,
  rand: () => number,
  base: V3,
  az: number,
  len: number,
  rise: number,
  color: string,
  leaflet: number,
): void {
  const out = v3(Math.cos(az), 0, Math.sin(az));
  const side = v3(-out.z, 0, out.x);
  const pts: V3[] = [];
  for (let i = 0; i <= 10; i++) {
    const t = i / 10;
    pts.push(
      base
        .clone()
        .addScaledVector(out, len * t * 0.85)
        .add(v3(0, rise * Math.sin(t * Math.PI * 0.55) - len * 0.3 * t * t, 0)),
    );
  }
  strip(
    m,
    pts,
    pts.map((_, i) => 0.009 * (1 - i / 11)),
    side,
    tone(color, 0.85),
  );
  for (let i = 2; i < 10; i++) {
    const p = pts[i]!;
    const ll = leaflet * Math.sin((i / 10) * Math.PI) * (0.85 + 0.3 * rand());
    for (const s of [-1, 1]) {
      const dir = side
        .clone()
        .multiplyScalar(s)
        .addScaledVector(out, 0.55)
        .add(v3(0, -0.35, 0))
        .normalize();
      strip(
        m,
        [
          p,
          p
            .clone()
            .addScaledVector(dir, ll * 0.5)
            .add(v3(0, 0.01, 0)),
          p.clone().addScaledVector(dir, ll),
        ],
        [0.02, 0.016, 0.002],
        out,
        color,
      );
    }
  }
}

/** An areca or parlor palm: clumped canes, arching feathery fronds. */
function pottedPalm(
  m: Model,
  rand: () => number,
  potColor: string,
  basket: boolean,
): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.42, Math.min(0.35, H * 0.25), potColor, { basket });
  const h = H - top;
  const n = more(Math.round(9 + 4 * Math.min(1, h)));
  for (let i = 0; i < n; i++) {
    const az = i * 2.39996 + rand() * 0.4;
    const r = R * 0.15 * rand();
    const cane = v3(Math.cos(az) * r, top, Math.sin(az) * r);
    const up = cane
      .clone()
      .add(
        v3(Math.cos(az) * 0.03, h * (0.2 + 0.35 * rand()), Math.sin(az) * 0.03),
      );
    stalk(m, [cane, up], 0.008, "#7c8d4a");
    frond(
      m,
      rand,
      up,
      az,
      R * (0.8 + 0.3 * rand()),
      (H - up.y) * 0.75,
      shades("#4f7f34", rand),
      R * 0.4,
    );
  }
}

/** A bird of paradise: big paddle leaves held high on upright stalks. */
function birdOfParadise(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.38, Math.min(0.4, H * 0.25), potColor, {
    basket: true,
  });
  const h = H - top;
  for (let i = 0, n = more(9); i < n; i++) {
    const az = i * 2.39996 + rand() * 0.3;
    const end = v3(
      Math.cos(az) * R * 0.15,
      top + h * (0.4 + 0.25 * rand()),
      Math.sin(az) * R * 0.15,
    );
    stalk(m, [v3(0, top, 0), end], 0.009, "#57744a");
    const len = h * 0.42;
    leaf(
      m,
      end,
      aim(az, (55 + rand() * 22) * DEG),
      len,
      len * 0.38,
      shades("#41693a", rand),
      {
        droop: 0.18,
        fold: 0.18,
        tip: "#4c7742",
      },
    );
  }
}

/** A dracaena: bare canes of different heights, each topped with a
 * fountain of long arching strap leaves. */
function dracaena(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.45, Math.min(0.32, H * 0.25), potColor);
  const h = H - top;
  const heights = [0.55, 0.75, 0.95];
  heights.forEach((f, c) => {
    const a = c * 2.1;
    const base = v3(Math.cos(a) * R * 0.15, top, Math.sin(a) * R * 0.15);
    const head = base
      .clone()
      .add(v3(0.02 * Math.cos(a), h * f - 0.12, 0.02 * Math.sin(a)));
    stalk(m, [base, head], 0.016, "#8b7355");
    for (let i = 0, n = more(18); i < n; i++) {
      const az = i * 2.39996 + c + rand() * 0.3;
      leaf(
        m,
        head,
        aim(az, (-10 + rand() * 70) * DEG),
        0.3 * Math.min(1.2, H / 1.3),
        0.04,
        shades("#3f6f2e", rand),
        {
          shape: "lance",
          droop: 0.45,
          fold: 0.2,
          tip: "#6f9a3e",
          edge: "#b4c06a",
        },
      );
    }
  });
}

/** A spider plant: a fountain of arching striped blades, and runners
 * hanging with baby plants. */
function spiderPlant(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.45, Math.min(0.2, H * 0.45), potColor);
  const blades = (at: V3, n: number, len: number) => {
    for (let i = 0; i < n; i++) {
      const az = i * 2.39996 + rand() * 0.4;
      leaf(
        m,
        at,
        aim(az, (25 + rand() * 50) * DEG),
        len * (0.8 + 0.4 * rand()),
        0.03,
        "#dfe6c0",
        {
          shape: "strap",
          droop: 0.65,
          fold: 0.15,
          edge: "#4f8034",
        },
      );
    }
  };
  blades(v3(0, top, 0), more(30), Math.max(0.25, R * 1.1));
  for (let k = 0; k < 3; k++) {
    const az = k * 2.1 + rand();
    const out = v3(Math.cos(az), 0, Math.sin(az));
    const end = v3(0, Math.max(0.04, top - 0.15), 0).addScaledVector(
      out,
      R * 1.05,
    );
    const mid = v3(0, top + 0.06, 0).addScaledVector(out, R * 0.7);
    stalk(m, [v3(0, top, 0), mid, end], 0.002, "#c9c79a");
    blades(end, 7, 0.08);
  }
}

/** An aloe: a rosette of thick, tapering grey-green leaves standing up
 * and out, flecked pale. */
function aloe(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.6, Math.min(0.14, H * 0.35), potColor);
  for (let i = 0, n = more(13); i < n; i++) {
    const inner = i / n;
    const az = i * 2.39996 + rand() * 0.2;
    leaf(
      m,
      v3(0, top + 0.01, 0),
      aim(az, (30 + 45 * inner + rand() * 10) * DEG),
      (H - top) * (0.95 - 0.3 * inner),
      0.045,
      shades("#7c9c6c", rand),
      { shape: "lance", fold: 0.55, droop: 0.12, tip: "#9bb58a" },
    );
  }
}

/** A rosette of thick pointed leaves (an echeveria): low outside, rising
 * to the middle, blushing at their tips. */
function echeveria(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.6, Math.min(0.08, H * 0.5), potColor);
  const n = more(22);
  for (let i = 0; i < n; i++) {
    const inner = i / n;
    const az = i * 2.39996;
    const len = R * (0.85 - 0.5 * inner);
    leaf(
      m,
      v3(0, top + 0.004 + 0.02 * inner, 0),
      aim(az, (8 + 62 * inner) * DEG),
      len,
      len * 0.6,
      "#8db29b",
      {
        fold: 0.35,
        droop: 0,
        tip: "#a3c4b0",
        edge: "#d79aa3",
      },
    );
  }
}

/** A pilea: round leaves held flat on thin stalks off a short stem. */
function pilea(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.55, Math.min(0.14, H * 0.4), potColor);
  const h = H - top;
  const stem = [v3(0, top, 0), v3(0.005, top + h * 0.45, 0)];
  stalk(m, stem, 0.006, "#6c7d45");
  for (let i = 0, n = more(15); i < n; i++) {
    const az = i * 2.39996 + rand() * 0.3;
    const p = stem[0]!.clone().lerp(stem[1]!, 0.3 + 0.7 * (i / n));
    const reach = Math.min(R * 0.8, 0.1 + 0.06 * rand());
    const end = p
      .clone()
      .addScaledVector(aim(az, (20 + rand() * 40) * DEG), reach);
    stalk(m, [p, end], 0.0015, "#7a8f4a");
    const size = Math.min(R * 0.5, 0.06 + 0.03 * rand());
    const d = aim(az, (5 + rand() * 20) * DEG);
    leaf(
      m,
      end.clone().addScaledVector(d, -size / 2),
      d,
      size,
      size,
      shades("#5e8f3a", rand),
      {
        shape: "round",
        droop: 0,
        fold: 0.08,
      },
    );
  }
}

/** A calathea: upright oval leaves on stalks, dark rims, pale feathering
 * toward their tips. */
function calathea(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.48, Math.min(0.2, H * 0.32), potColor);
  const h = H - top;
  for (let i = 0, n = more(13); i < n; i++) {
    const az = i * 2.39996 + rand() * 0.3;
    const end = v3(
      Math.cos(az) * R * 0.15,
      top + h * (0.25 + 0.3 * rand()),
      Math.sin(az) * R * 0.15,
    );
    stalk(m, [v3(0, top, 0), end], 0.003, "#59724a");
    const len = h * 0.42;
    leaf(m, end, aim(az, (45 + rand() * 25) * DEG), len, len * 0.5, "#3e6a3d", {
      droop: 0.12,
      fold: 0.15,
      tip: "#8fae78",
      edge: "#25432a",
    });
  }
}

/** A phalaenopsis orchid: broad leaves lying low, a staked spike arching
 * over with white flowers. */
function orchid(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.5, Math.min(0.13, H * 0.25), potColor);
  for (let i = 0, n = more(4); i < n; i++) {
    const az = i * Math.PI * 0.55 + rand() * 0.3;
    leaf(
      m,
      v3(0, top + 0.01, 0),
      aim(az, 12 * DEG),
      Math.min(0.17, R * 0.9),
      0.07,
      shades("#3f6a35", rand),
      {
        droop: 0.3,
        fold: 0.25,
      },
    );
  }
  const az = rand() * Math.PI * 2;
  const out = v3(Math.cos(az), 0, Math.sin(az));
  const stake = v3(0, top + (H - top) * 0.62, 0);
  stalk(m, [v3(0, top, 0), stake], 0.0025, "#56703b");
  const spike = [stake];
  for (let k = 1; k <= 5; k++)
    spike.push(
      stake
        .clone()
        .addScaledVector(out, 0.045 * k)
        .add(v3(0, 0.06 * Math.sin(k * 0.6) - 0.012 * k * k * 0.5, 0)),
    );
  stalk(m, spike, 0.002, "#56703b");
  const side = v3(-out.z, 0, out.x);
  for (let k = 1; k <= 5; k++) {
    const c = spike[k]!.clone().addScaledVector(out, 0.012);
    const size = 0.055 - 0.004 * k;
    for (let p = 0; p < 5; p++) {
      const a = (p * Math.PI * 2) / 5 + 0.3;
      const dir = v3(0, Math.cos(a), 0).addScaledVector(side, Math.sin(a));
      leaf(m, c, dir, size, size * 0.85, "#f7f1f4", {
        fold: 0.1,
        droop: 0,
        tip: "#ffffff",
      });
    }
    m.sphere(
      size * 0.18,
      c.x + out.x * 0.006,
      c.y,
      c.z + out.z * 0.006,
      mat("#c24f8a", 0.6),
    );
  }
}

/** A jade plant: thick branching stems, clusters of fleshy oval leaves. */
function jade(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.6, Math.min(0.14, H * 0.32), potColor);
  const h = H - top;
  const trunk = v3(0, top + h * 0.35, 0);
  stalk(m, [v3(0, top, 0), trunk], 0.012, "#6d6a3e");
  for (let b = 0; b < more(5); b++) {
    const az = b * 2.39996 + rand() * 0.4;
    const tip = trunk
      .clone()
      .addScaledVector(
        aim(az, (30 + rand() * 40) * DEG),
        h * (0.35 + 0.25 * rand()),
      );
    stalk(m, [trunk, tip], 0.008, "#6f7a3f");
    for (let k = 0; k < more(9); k++) {
      const a = rand() * Math.PI * 2;
      const r = 0.012 + 0.03 * rand();
      clump(
        m,
        tip.x + Math.cos(a) * r,
        tip.y - 0.01 + 0.03 * rand(),
        tip.z + Math.sin(a) * r,
        0.02,
        0.008,
        0.014,
        "#4e7d3c",
        rand,
        0.05,
        1,
        { light: 0.3 },
      );
    }
  }
}

/** An indoor olive: a slim grey trunk under a loose silvery crown. */
function olive(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.42, Math.min(0.4, H * 0.22), potColor, {
    basket: true,
  });
  const h = H - top;
  const crown = v3(0.02, top + h * 0.68, -0.01);
  stalk(
    m,
    [v3(0, top, 0), v3(-0.015, top + h * 0.35, 0.01), crown],
    0.018,
    "#7a7466",
  );
  foliage(
    m,
    crown.x,
    crown.y,
    crown.z,
    R * 0.7,
    h * 0.26,
    R * 0.7,
    "#7f906a",
    rand,
    "fine",
    1.2,
  );
  for (let k = 0; k < 3; k++) {
    const a = k * 2.1 + rand();
    foliage(
      m,
      crown.x + Math.cos(a) * R * 0.45,
      crown.y + h * (0.08 + 0.1 * rand()),
      crown.z + Math.sin(a) * R * 0.45,
      R * 0.35,
      h * 0.14,
      R * 0.35,
      "#8a9b74",
      rand,
      "fine",
      1,
    );
  }
}

/** Herb pots in a row: basil, rosemary, parsley. */
function herbs(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const r = Math.min(W / 6, D / 2) * 0.85;
  const potH = Math.min(0.13, H * 0.45);
  [-1, 0, 1].forEach((k) => {
    const x = (k * W) / 3;
    const top = pot(m, r, potH, potColor, { x });
    const h = H - top;
    if (k === -1)
      for (let i = 0, n = more(14); i < n; i++) {
        const az = i * 2.39996;
        const p = v3(
          x + Math.cos(az) * r * 0.3,
          top + h * (0.2 + 0.6 * rand()),
          Math.sin(az) * r * 0.3,
        );
        leaf(m, p, aim(az, 20 * DEG), 0.045, 0.03, shades("#4f9a3a", rand), {
          fold: 0.3,
          droop: 0.2,
        });
      }
    else if (k === 0)
      for (let i = 0, n = more(16); i < n; i++)
        blade(
          m,
          v3(x + (rand() - 0.5) * r, top, (rand() - 0.5) * r),
          rand() * Math.PI * 2,
          h * (0.7 + 0.3 * rand()),
          0.15,
          0.006,
          "#5b7a5a",
        );
    else
      foliage(
        m,
        x,
        top + h * 0.5,
        0,
        r * 1.1,
        h * 0.45,
        r * 1.1,
        "#3f7f2e",
        rand,
        "fine",
        0.8,
      );
  });
}

/** A columnar cactus with a couple of arms. */
function cactus(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.6, Math.min(0.14, H * 0.25), potColor);
  const h = H - top;
  const body = mat("#4b7c46", 0.8);
  const r = Math.min(R * 0.35, h * 0.14);
  m.cyl(r * 0.95, r, h - r, 0, top, 0, body, 12);
  m.sphere(r * 0.95, 0, top + h - r, 0, body, 1, 0.8, 1);
  for (const s of [-1, 1]) {
    const y = top + h * (0.35 + 0.15 * rand());
    const ar = r * 0.62;
    const reach = r * 1.9;
    limb(m, v3(0, y, 0), v3(s * reach, y + ar * 0.4, 0), ar, ar, body, 10);
    const up = h * (0.22 + 0.1 * rand());
    m.cyl(ar * 0.95, ar, up, s * reach, y, 0, body, 10);
    m.sphere(ar * 0.95, s * reach, y + up, 0, body, 1, 0.8, 1);
  }
}

/** A bonsai: a shallow tray, a twisting trunk, flat pads of foliage. */
function bonsai(m: Model, rand: () => number, potColor: string): void {
  const { W, D, H } = m;
  m.box(W * 0.85, 0.05, D * 0.7, 0, 0, 0, mat(potColor, 0.55));
  m.box(W * 0.8, 0.008, D * 0.62, 0, 0.045, 0, mat("#3a2a1f", 0.95));
  const pts = [v3(0, 0.05, 0)];
  for (let k = 1; k <= 4; k++)
    pts.push(
      v3(
        0.06 * Math.sin(k * 1.4),
        0.05 + (H * 0.55 * k) / 4,
        0.03 * Math.cos(k * 1.1),
      ),
    );
  stalk(m, pts, 0.018, "#5d4a3a");
  for (let b = 0; b < more(4); b++) {
    const p = pts[1 + Math.min(3, b)]!;
    const az = b * 2.2 + rand();
    const end = p.clone().addScaledVector(aim(az, 15 * DEG), W * 0.3);
    stalk(m, [p, end], 0.007, "#5d4a3a");
    clump(
      m,
      end.x,
      end.y + 0.02,
      end.z,
      W * 0.16,
      H * 0.07,
      D * 0.22,
      "#3d6230",
      rand,
      0.2,
      2,
      { light: 0.6 },
    );
  }
  const crown = pts[4]!;
  clump(
    m,
    crown.x,
    crown.y + 0.03,
    crown.z,
    W * 0.2,
    H * 0.09,
    D * 0.25,
    "#3d6230",
    rand,
    0.2,
    2,
    { light: 0.6 },
  );
}

/** A bushy leafy plant (the catalog's plain "plant"): oval leaves on
 * stalks, low and spreading when small, taller and variegated when not. */
function leafy(
  m: Model,
  rand: () => number,
  potColor: string,
  small: boolean,
): void {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = pot(m, R * 0.5, Math.min(0.22, H * 0.35), potColor);
  const h = H - top;
  const n = more(small ? 16 : 14);
  for (let i = 0; i < n; i++) {
    const az = i * 2.39996 + rand() * 0.3;
    const end = v3(
      Math.cos(az) * R * 0.12,
      top + h * (small ? 0.1 + 0.2 * rand() : 0.25 + 0.3 * rand()),
      Math.sin(az) * R * 0.12,
    );
    stalk(m, [v3(0, top, 0), end], 0.003, "#4f7a3a");
    const len = small ? Math.min(R * 0.6, 0.09) : h * 0.45;
    leaf(
      m,
      end,
      aim(az, ((small ? 15 : 35) + rand() * 30) * DEG),
      len,
      len * (small ? 0.7 : 0.42),
      shades(small ? "#2f6a2c" : "#4a7a3e", rand),
      {
        droop: 0.25,
        fold: 0.2,
        ...(small ? {} : { tip: "#a8c08a" }),
      },
    );
  }
}

/** The item as a houseplant in its pot (its catalog drawing a houseplant,
 * a plain plant, a cactus or a bonsai), else false. */
function houseplant(m: Model, item: Item3d, o: Opts): boolean {
  const spec = item.model;
  if (!spec) return false;
  const kind =
    spec.draw === "houseplant"
      ? str(o, "kind", "")
      : spec.draw === "cactus"
        ? "cactus"
        : spec.kind === "bonsai"
          ? "bonsai"
          : spec.draw === "plant"
            ? /hanging/.test(spec.kind)
              ? "pothosHanging"
              : /large|office/.test(spec.kind)
                ? "dracaena"
                : /small/.test(spec.kind)
                  ? "leafySmall"
                  : "leafy"
            : "";
  if (!kind) return false;
  const rand = seeded(item.id);
  const own = spec.tint ?? null;
  const p = (d: string) => own ?? d;
  PLANT.pot = spec.plant?.pot ?? null;
  PLANT.shape = spec.plant?.shape ?? null;
  PLANT.full = Math.max(0.25, Math.min(3, spec.plant?.full ?? 1));
  switch (kind) {
    case "snake":
      snakePlant(m, rand, p(POT.charcoal));
      return true;
    case "zz":
      zzPlant(m, rand, p(POT.white));
      return true;
    case "peace":
      peaceLily(m, rand, p(POT.white));
      return true;
    case "pothos":
      trailing(m, rand, p(POT.white), {
        green: "#4f7f34",
        tip: "#a9b65a",
        vines: 6,
      });
      return true;
    case "pothosHanging":
      trailing(m, rand, p(POT.white), {
        green: "#4f7f34",
        tip: "#a9b65a",
        vines: 8,
        hanging: true,
      });
      return true;
    case "philodendron":
      trailing(m, rand, p(POT.terracotta), { green: "#3c6e2c", vines: 4 });
      return true;
    case "monstera":
      monstera(m, rand, p(POT.charcoal));
      return true;
    case "fiddle":
      pottedTree(m, rand, p(POT.basket), {
        green: "#3a6a2c",
        shape: "fiddle",
        len: 0.34,
        wid: 0.66,
        stems: 1,
        basket: !own,
      });
      return true;
    case "rubber":
      pottedTree(m, rand, p(POT.charcoal), {
        green: "#26372a",
        shape: "oval",
        len: 0.27,
        wid: 0.5,
        stems: 2,
        sheath: "#8a3b3b",
      });
      return true;
    case "palm":
      pottedPalm(m, rand, p(POT.basket), !own);
      return true;
    case "bird":
      birdOfParadise(m, rand, p(POT.basket));
      return true;
    case "dracaena":
      dracaena(m, rand, p(POT.white));
      return true;
    case "spider":
      spiderPlant(m, rand, p(POT.white));
      return true;
    case "aloe":
      aloe(m, rand, p(POT.terracotta));
      return true;
    case "succulent":
      echeveria(m, rand, p(POT.terracotta));
      return true;
    case "pilea":
      pilea(m, rand, p(POT.white));
      return true;
    case "calathea":
      calathea(m, rand, p(POT.sage));
      return true;
    case "orchid":
      orchid(m, rand, p(POT.white));
      return true;
    case "jade":
      jade(m, rand, p(POT.terracotta));
      return true;
    case "olive":
      olive(m, rand, p(POT.basket));
      return true;
    case "herbs":
      herbs(m, rand, p(POT.terracotta));
      return true;
    case "fern": {
      const top = pot(
        m,
        Math.min(m.W, m.D) * 0.25,
        Math.min(0.24, m.H * 0.4),
        p(POT.white),
      );
      fern(new Lifted(m, top, m.H - top), rand, "#4f7f34");
      return true;
    }
    case "cactus":
      cactus(m, rand, p(POT.terracotta));
      return true;
    case "bonsai":
      bonsai(m, rand, p("#3b3330"));
      return true;
    case "leafySmall":
      leafy(m, rand, p(POT.terracotta), true);
      return true;
    case "leafy":
      leafy(m, rand, p(POT.white), false);
      return true;
  }
  return false;
}

/** The item as an outdoor light or a planting, or null when it's neither
 * (furniture-models.ts draws it). */
export function outdoorModel(item: Item3d): THREE.Group | null {
  const spec = item.model;
  if (!spec) return null;
  const o = spec.opts as Opts;
  const m = new Model(
    item.width,
    item.depth,
    Math.max(0.02, item.height),
    spec.flip,
  );
  if (lightModel(m, item, spec.kind, o)) {
    // A fixture is small and sits in its own beam: it casts no shadow
    // (else it would black out its own light).
    const g = finish(m);
    g.traverse((ob) => (ob.castShadow = false));
    return g;
  }
  return plantModel(m, item, o) ? finish(m) : null;
}
