/** Indoor light fixtures as 3D models (part of the lazily loaded 3D
 * module, like furniture-models.ts): recessed and canless lights flush in
 * the ceiling, globe pendants hung on their own cords, vanity lights on
 * the wall over a mirror, LED strips in their channels — each glowing in
 * its light's colour while it's on.
 *
 * The item's own frame, as furniture-models.ts has it: x across its
 * width, z from its back (-depth/2, against the wall) to its front, y up
 * from its bottom; a ceiling fixture's top (y = H) is the ceiling. */

import * as THREE from "three";
import { Model, mat } from "./furniture-models";
import { finish, halo, lens, limb } from "./outdoor-models";
import type { Item3d } from "./view3d-api";

type Opts = Record<string, string | number | boolean | undefined>;
type Light = NonNullable<Item3d["light"]>;
const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** A fixture's metal: aged brass, brushed nickel, chrome or matte black. */
const METALS: Record<string, [string, number, number]> = {
  brass: ["#b38b4d", 0.42, 0.75],
  nickel: ["#bdbab3", 0.4, 0.8],
  chrome: ["#dfe2e5", 0.3, 0.9],
  black: ["#1f1f21", 0.55, 0.3],
};
function metal(name: string | undefined, fallback = "black") {
  const [c, r, k] = METALS[name ?? ""] ?? METALS[fallback]!;
  return mat(c, r, k);
}

const str = (o: Opts, k: string): string | undefined =>
  typeof o[k] === "string" ? (o[k] as string) : undefined;
const num = (o: Opts, k: string, d: number): number => {
  const v = o[k];
  return typeof v === "number" ? v : d;
};

// --- a double-sided face (the inside of a can, open shades) ---------------------

const TWO_SIDED = new Map<string, THREE.MeshStandardMaterial>();
function twoSided(
  base: THREE.MeshStandardMaterial,
): THREE.MeshStandardMaterial {
  const key = base.uuid;
  let m = TWO_SIDED.get(key);
  if (!m) {
    m = base.clone();
    m.side = THREE.DoubleSide;
    TWO_SIDED.set(key, m);
  }
  return m;
}

/** A flat disc facing down (-y) at height y, radius r (inside r0). */
function discDown(m: Model, r: number, y: number, mt: THREE.Material, r0 = 0) {
  const g =
    r0 > 0
      ? new THREE.RingGeometry(r0, r, 40, 1)
      : new THREE.CircleGeometry(r, 40);
  g.rotateX(Math.PI / 2);
  g.translate(0, y, 0);
  m.add(g, mt);
}

// --- recessed and canless lights --------------------------------------------------

/** A recessed downlight flush in the ceiling: its white trim ring just
 * under it, the baffle inside a few millimetres up, and the lens in the
 * middle (glowing while it's on); a gimbal's eyeball tilted inside; a
 * canless wafer a thin disc with its lens across most of it. */
function recessed(m: Model, item: Item3d, kind: "can" | "gimbal" | "wafer") {
  const { W, D, H } = m;
  const R = Math.min(W, D) / 2;
  const top = H;
  const trim = mat("#f5f4f0", 0.6);
  const glowing = lens(item, "#f1efe9");
  if (kind === "wafer") {
    // A slim disc, its edge rounded off, the lens across its face.
    m.cyl(R * 0.97, R, 0.01, 0, top - 0.01, 0, trim, 40);
    discDown(m, R * 0.86, top - 0.0105, glowing);
    halo(m, item, 0, top - 0.02, 0, R * 0.6);
    return;
  }
  // All of it under the ceiling (which hides anything above it): the
  // trim's face `lip` under it, the baffle and lens set back up inside.
  const lip = Math.min(0.012, H);
  const recess = lip * 0.65;
  // The trim's face and its edge (open: the recess shows inside it).
  discDown(m, R, top - lip, trim, R * 0.8);
  const edge = new THREE.CylinderGeometry(R, R, lip, 40, 1, true);
  edge.translate(0, top - lip / 2, 0);
  m.add(edge, trim);
  // Inside it: the can's wall, its baffle, the lens.
  const baffle = twoSided(mat(kind === "gimbal" ? "#2b2b2d" : "#e9e7e2", 0.85));
  const wall = new THREE.CylinderGeometry(
    R * 0.8,
    R * 0.8,
    recess,
    40,
    1,
    true,
  );
  wall.translate(0, top - lip + recess / 2, 0);
  m.add(wall, baffle);
  discDown(m, R * 0.8, top - lip + recess, baffle);
  if (kind === "gimbal") {
    // The eyeball, its lens aimed a little off straight down.
    const ball = mat("#f2f1ed", 0.5);
    m.sphere(R * 0.55, 0, top - lip + 0.004, 0, ball, 1, 0.55, 1);
    const g = new THREE.CircleGeometry(R * 0.32, 32);
    g.rotateX(Math.PI / 2);
    g.rotateZ(0.26);
    g.translate(R * 0.06, top - lip - R * 0.26, 0);
    m.add(g, glowing);
  } else discDown(m, R * 0.5, top - lip + recess - 0.0006, glowing);
  halo(m, item, 0, top - lip - 0.01, 0, R * 0.55);
}

// --- globe pendants ----------------------------------------------------------------

/** An alabaster's cloudy veining, wrapped round each globe. */
let veinTexture: THREE.Texture | null = null;
function veins(): THREE.Texture | null {
  if (veinTexture) return veinTexture;
  if (typeof document === "undefined") return null;
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 128;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#f7f4ee";
  ctx.fillRect(0, 0, 256, 128);
  // Seeded, so every globe (and every rebuild) shows the same stone.
  let seed = 7;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  ctx.filter = "blur(6px)";
  for (let i = 0; i < 26; i++) {
    const x = rnd() * 256;
    const y = rnd() * 128;
    const r = 10 + rnd() * 34;
    const tone = 214 + Math.round(rnd() * 22);
    ctx.fillStyle = `rgba(${tone},${tone - 6},${tone - 16},${0.25 + rnd() * 0.3})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.8, r * 0.7, rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.filter = "blur(1.5px)";
  for (let i = 0; i < 9; i++) {
    ctx.strokeStyle = `rgba(196,186,170,${0.25 + rnd() * 0.25})`;
    ctx.lineWidth = 0.8 + rnd() * 1.6;
    ctx.beginPath();
    let x = rnd() * 256;
    let y = rnd() * 128;
    ctx.moveTo(x, y);
    for (let k = 0; k < 4; k++) {
      const nx = x + (rnd() - 0.3) * 90;
      const ny = y + (rnd() - 0.5) * 50;
      ctx.quadraticCurveTo(
        (x + nx) / 2 + (rnd() - 0.5) * 30,
        (y + ny) / 2 + (rnd() - 0.5) * 30,
        nx,
        ny,
      );
      x = nx;
      y = ny;
    }
    ctx.stroke();
  }
  ctx.filter = "none";
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  veinTexture = tex;
  return tex;
}

const ALABASTER = new Map<string, THREE.MeshStandardMaterial>();
/** The globes' stone: white alabaster while off; lit through in the
 * light's colour (its veins showing) while on. */
function alabaster(lit: Light | null): THREE.MeshStandardMaterial {
  const key = lit ? `${lit.color}|${lit.level.toFixed(2)}` : "off";
  let m = ALABASTER.get(key);
  if (!m) {
    const tex = veins();
    m = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.55,
      map: tex,
    });
    if (lit) {
      m.emissive = new THREE.Color(lit.color).lerp(
        new THREE.Color("#ffffff"),
        0.25,
      );
      m.emissiveIntensity = 0.55 + 1.25 * lit.level;
      m.emissiveMap = tex;
    }
    ALABASTER.set(key, m);
  }
  return m;
}

/** Globes hung each on its own cord from a round canopy on the ceiling:
 * a brass cap over each globe's top, the globe under it. */
function globePendant(m: Model, item: Item3d, o: Opts) {
  const { H } = m;
  const globes = item.model?.globes ?? [];
  if (!globes.length) return;
  // The metal catches a little of its globes' glow while they're lit.
  const lit = item.light;
  const [mc, mr, mk] = METALS[str(o, "metal") ?? ""] ?? METALS["brass"]!;
  const brass = lit
    ? mat(mc, mr, mk, { glow: lit.color, glowLevel: 0.08 + 0.12 * lit.level })
    : mat(mc, mr, mk);
  const cord = mat("#8a7454", 0.6, 0.4);
  const stone = alabaster(lit);
  // The ceiling's slope over it (its rise per metre across and front to
  // back): the canopy lies flat against it, the cords hang plumb.
  const [sx, sz] = item.model?.canopySlope ?? [0, 0];
  const ceilAt = (x: number, z: number) => H + sx * x + sz * z;
  // The canopy: round, as wide as the cords' spread.
  const reach = Math.max(...globes.map((g) => Math.hypot(g.x, g.z)));
  const canopyR = Math.max(0.065, reach + 0.045);
  const canopy = new THREE.CylinderGeometry(canopyR, canopyR * 0.96, 0.022, 48);
  canopy.translate(0, -0.011, 0);
  canopy.applyQuaternion(
    new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(-sx, 1, -sz).normalize(),
    ),
  );
  canopy.translate(0, H, 0);
  m.add(canopy, brass);
  for (const g of globes) {
    const R = g.size / 2;
    const fitterTop = H - g.drop;
    // The cord, from the canopy down to the cap's fitter.
    const cordTop = ceilAt(g.x, g.z) - 0.02;
    m.cyl(0.0018, 0.0018, cordTop - fitterTop, g.x, fitterTop, g.z, cord, 6);
    // The fitter, then the cap: a shallow dome over the globe's top.
    const fit = 0.016;
    m.cyl(0.009, 0.011, fit, g.x, fitterTop - fit, g.z, brass, 12);
    const rimR = R * 0.72;
    // (High enough to cover the globe's crown under it.)
    const rise = R * 0.34;
    const rimY = fitterTop - fit - rise;
    const cap = new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, 1.25);
    cap.scale(rimR / Math.sin(1.25), 1, rimR / Math.sin(1.25));
    // Squash it to its rise: the dome's own height is 1 - cos(1.25).
    const own = 1 - Math.cos(1.25);
    cap.translate(0, -Math.cos(1.25), 0);
    cap.scale(1, rise / own, 1);
    cap.translate(g.x, rimY, g.z);
    m.add(cap, twoSided(brass));
    // The globe, its top tucked up under the cap's rim.
    const cy = rimY - Math.sqrt(Math.max(0, R * R - rimR * rimR)) + 0.002;
    const sphere = new THREE.SphereGeometry(R, 36, 24);
    sphere.rotateY(g.x * 13 + g.z * 7);
    sphere.translate(g.x, cy, g.z);
    m.add(sphere, stone);
    halo(m, item, g.x, cy, g.z, R * 1.15);
  }
}

// --- vanity lights -------------------------------------------------------------------

/** A vanity light over a mirror: a backplate on the wall, an arm out to
 * each bulb, and its shade (a globe, an open cylinder, a bell or a cone)
 * opening up or down from its socket cup. */
function vanity(m: Model, item: Item3d, o: Opts) {
  const { W, D, H } = m;
  const n = Math.max(1, Math.min(8, Math.round(num(o, "bulbs", 3))));
  const style = str(o, "shade") ?? "cylinder";
  const up =
    typeof o["shadeUp"] === "boolean"
      ? (o["shadeUp"] as boolean)
      : style === "globe" || style === "cylinder";
  const finishM = metal(str(o, "metal"), "black");
  const back = -D / 2;
  const midY = H * 0.5;
  // The backplate and the bar across.
  m.soft(
    W,
    Math.min(0.06, H * 0.3),
    0.014,
    0,
    midY - 0.03,
    back + 0.007,
    finishM,
    0.004,
  );
  const out = Math.min(D * 0.62, 0.13);
  const pitch = W / n;
  const R = Math.min(style === "globe" ? 0.075 : 0.045, pitch * 0.42, D * 0.45);
  const shadeH = style === "globe" ? R * 2 : style === "cylinder" ? 0.13 : 0.11;
  const glass = twoSided(lens(item, "#f4f2ed"));
  for (let k = 0; k < n; k++) {
    const x = -W / 2 + pitch * (k + 0.5);
    const z = back + out;
    // The arm out from the backplate, then the cup.
    limb(
      m,
      v3(x, midY, back + 0.012),
      v3(x, midY, z),
      0.007,
      0.007,
      finishM,
      10,
    );
    const cupH = 0.03;
    const cupY = up ? midY : midY - cupH;
    m.cyl(0.022, 0.018, cupH, x, cupY, z, finishM, 16);
    const y0 = up ? midY + cupH : midY - cupH - shadeH;
    if (style === "globe") {
      const cy = up ? y0 + R : y0 + shadeH - R;
      const g = new THREE.SphereGeometry(R, 28, 20);
      g.translate(x, cy, z);
      m.add(g, glass);
      halo(m, item, x, cy, z, R * 1.4);
    } else {
      // An open shade: narrow at the cup, wider at its mouth (a bell
      // flares, a cone straight), a cylinder the same all the way.
      const rCup = style === "cylinder" ? R : R * 0.45;
      const rMouth = R;
      const g =
        style === "bell"
          ? new THREE.LatheGeometry(
              Array.from({ length: 9 }, (_, i) => {
                const t = i / 8;
                const r = rCup + (rMouth - rCup) * Math.pow(t, 2.2);
                return new THREE.Vector2(r, up ? t * shadeH : -t * shadeH);
              }),
              28,
            )
          : new THREE.CylinderGeometry(
              up ? rMouth : rCup,
              up ? rCup : rMouth,
              shadeH,
              28,
              1,
              true,
            );
      if (style === "bell") g.translate(x, up ? y0 : y0 + shadeH, z);
      else g.translate(x, y0 + shadeH / 2, z);
      m.add(g, glass);
      // The bulb inside.
      m.sphere(
        Math.min(0.022, rCup * 0.8),
        x,
        up ? y0 + 0.03 : y0 + shadeH - 0.03,
        z,
        lens(item, "#fbfaf6"),
      );
      halo(m, item, x, y0 + shadeH / 2, z, R * 1.5);
    }
  }
}

// --- LED strips --------------------------------------------------------------------

/** An LED strip in its aluminium channel, the frosted diffuser on the
 * side it shines to (up, down, or out to its front or back), glowing
 * while it's on. */
function strip(m: Model, item: Item3d, o: Opts) {
  const { W, D, H } = m;
  const shine = str(o, "shine") ?? "down";
  const alu = mat("#c3c6c9", 0.4, 0.7);
  const glow = lens(item, "#eeede8");
  const t = 0.0015;
  m.box(W, H, D, 0, 0, 0, alu);
  // The diffuser, a hair proud of the face it's set in.
  if (shine === "up") m.box(W - 0.004, t, D * 0.8, 0, H, 0, glow);
  else if (shine === "down") m.box(W - 0.004, t, D * 0.8, 0, -t, 0, glow);
  else {
    const z = shine === "front" ? D / 2 + t / 2 : -D / 2 - t / 2;
    m.box(W - 0.004, H * 0.8, t, 0, H * 0.1, z, glow);
  }
  if (!item.light) return;
  // A soft glow every foot or so along it, just off the diffuser.
  const off = 0.02;
  const [gy, gz] =
    shine === "up"
      ? [H + off, 0]
      : shine === "down"
        ? [-off, 0]
        : [H / 2, shine === "front" ? D / 2 + off : -D / 2 - off];
  const n = Math.max(1, Math.round(W / 0.3));
  for (let k = 0; k < n; k++)
    halo(m, item, -W / 2 + (W / n) * (k + 0.5), gy, gz, 0.06);
}

/** The item as one of these fixtures, or null where it's none. */
export function indoorLightModel(item: Item3d): THREE.Group | null {
  const spec = item.model;
  if (!spec) return null;
  const o = spec.opts as Opts;
  const m = new Model(
    item.width,
    item.depth,
    Math.max(0.005, item.height),
    spec.flip,
  );
  if (spec.draw === "puck" && /recessed/.test(spec.kind))
    recessed(m, item, "can");
  else if (spec.draw === "gimbal") recessed(m, item, "gimbal");
  else if (spec.draw === "wafer") recessed(m, item, "wafer");
  else if (spec.draw === "globeDrops") globePendant(m, item, o);
  else if (spec.draw === "vanityBar") vanity(m, item, o);
  else if (spec.draw === "linearLight") strip(m, item, o);
  else return null;
  const g = finish(m);
  // A fixture casts no shadow of its own (it'd black out its light).
  g.traverse((ob) => (ob.castShadow = false));
  return g;
}
