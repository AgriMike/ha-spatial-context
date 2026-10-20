import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { counterModel, furnitureModel } from "./furniture-models";
import { siteModel } from "./site-models";
import { gradeAt } from "./ground-grid";
import type {
  Box3d,
  EditHit,
  EditOverlay,
  EditPointer,
  EditRef,
  FloorFinish,
  Floor3d,
  Item3d,
  Roof3d,
  RoofFace3d,
  RoofLights3d,
  RoofGrid3d,
  Scene3d,
  ScanPlacement3d,
  ScanMode,
  ScanPose,
  Terrain3d,
  Vec2,
  View3dHandle,
  View3dModule,
  View3dOptions,
  WallFinishKind,
} from "./view3d-api";

/** Lazily loaded by <floorplan-3d-view> (see views/floorplan-3d-view.ts) —
 * built separately from the panel bundle into
 * www/view3d/spatial-context-3d.mjs, so three.js only downloads when a 3D
 * view is opened.
 *
 * Builds meshes from the plain scene description scene3d.ts computes,
 * renders on demand (only while the camera moves or something changed),
 * loads room scans with GLTFLoader and lets one be dragged into place. */

const SLAB_M = 0.04;
/** Point lights are costly per fragment; the brightest few get one. */
const MAX_POINT_LIGHTS = 8;
/** How close (metres) a dragged scan's edge must come to a wall face to
 * snap onto it, and how far auto-align looks. */
const DRAG_SNAP_M = 0.15;
const AUTO_SNAP_M = 0.6;
/** three.js's physically based lights put out 1/π of their intensity as
 * diffuse light, so ambient-ish light needs this to read as daylight. */
const AMBIENT_SCALE = Math.PI * 0.45;
const SUN_SCALE = 1.1;

function supportsWebgl(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    const ok = !!gl;
    (gl as WebGLRenderingContext | null)
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

const RAD = Math.PI / 180;

function boxGeometry(b: Box3d): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(
    Math.max(0.001, b.length),
    Math.max(0.001, b.y1 - b.y0),
    Math.max(0.001, b.depth),
  );
  g.rotateY(b.angle);
  g.translate(b.x, (b.y0 + b.y1) / 2, b.z);
  return g;
}

/** The wall coverings' atlas: one tile each, in this order (0 is plain
 * paint), and the size (metres) one tile spans on a wall. */
const COVER_TILES: WallFinishKind[] = [
  "paint",
  "tile",
  "brick",
  "wood",
  "wallpaper",
  "stone",
  "shiplap",
];
const COVER_TILE_M: Record<WallFinishKind, number> = {
  paint: 1,
  tile: 0.6,
  brick: 0.6,
  wood: 1.2,
  wallpaper: 0.8,
  stone: 1.2,
  shiplap: 1.2,
};

let coverAtlas: THREE.Texture | null = null;
/** Greyscale patterns (white is the covering's own colour), side by
 * side; tinted by each face's colour. */
function wallCoverAtlas(): THREE.Texture {
  if (coverAtlas) return coverAtlas;
  const T = 256;
  const canvas = document.createElement("canvas");
  canvas.width = T * COVER_TILES.length;
  canvas.height = T;
  const g = canvas.getContext("2d")!;
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const grey = (v: number) => `rgb(${v},${v},${v})`;
  COVER_TILES.forEach((kind, k) => {
    const x0 = k * T;
    g.save();
    g.beginPath();
    g.rect(x0, 0, T, T);
    g.clip();
    g.fillStyle = "#fff";
    g.fillRect(x0, 0, T, T);
    switch (kind) {
      case "tile": {
        g.fillStyle = grey(200);
        for (let i = 0; i <= 4; i++) {
          g.fillRect(x0 + (i * T) / 4 - 1, 0, 3, T);
          g.fillRect(x0, (i * T) / 4 - 1, T, 3);
        }
        break;
      }
      case "brick": {
        g.fillStyle = grey(150);
        g.fillRect(x0, 0, T, T);
        const rows = 8;
        const h = T / rows;
        for (let r = 0; r < rows; r++) {
          const off = r % 2 ? T / 8 : 0;
          for (let c = -1; c < 4; c++) {
            g.fillStyle = grey(225 + Math.floor((rand() - 0.5) * 50));
            g.fillRect(x0 + off + (c * T) / 4 + 2, r * h + 2, T / 4 - 4, h - 4);
          }
        }
        break;
      }
      case "wood": {
        const n = 6;
        for (let c = 0; c < n; c++) {
          g.fillStyle = grey(222 + Math.floor((rand() - 0.5) * 40));
          g.fillRect(x0 + (c * T) / n, 0, T / n, T);
          g.globalAlpha = 0.15;
          for (let s = 0; s < 6; s++) {
            g.fillStyle = grey(140);
            g.fillRect(x0 + (c * T) / n + rand() * (T / n), 0, 1, T);
          }
          g.globalAlpha = 1;
          g.fillStyle = grey(150);
          g.fillRect(x0 + (c * T) / n, 0, 2, T);
        }
        break;
      }
      case "wallpaper": {
        for (let c = 0; c < 8; c++) {
          g.fillStyle = grey(c % 2 ? 236 : 252);
          g.fillRect(x0 + (c * T) / 8, 0, T / 8, T);
        }
        g.fillStyle = grey(222);
        for (let r = 0; r < 8; r++)
          for (let c = 0; c < 8; c++) {
            g.beginPath();
            g.arc(x0 + (c + 0.5) * (T / 8), (r + 0.5) * (T / 8), 3, 0, 7);
            g.fill();
          }
        break;
      }
      case "stone": {
        g.fillStyle = grey(150);
        g.fillRect(x0, 0, T, T);
        const rows = 5;
        const h = T / rows;
        for (let r = 0; r < rows; r++) {
          let x = -rand() * 40;
          while (x < T) {
            const w = 30 + rand() * 50;
            g.fillStyle = grey(200 + Math.floor((rand() - 0.5) * 70));
            g.fillRect(x0 + x + 2, r * h + 2, w - 4, h - 4);
            x += w;
          }
        }
        break;
      }
      case "shiplap": {
        const n = 8;
        for (let r = 0; r < n; r++) {
          g.fillStyle = grey(140);
          g.fillRect(x0, (r * T) / n, T, 2);
        }
        break;
      }
      default:
        break;
    }
    g.restore();
  });
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  // No mipmaps: each tile wraps on its own (see wallMaterial).
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  coverAtlas = tex;
  return tex;
}

/** The walls' material: vertex colours, and each face's covering from the
 * atlas, tiled across it in metres. */
function wallMaterial(): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.92,
    map: wallCoverAtlas(),
  });
  const tiles = COVER_TILES.length.toFixed(1);
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nattribute float cover;\nvarying float vCover;",
      )
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvCover = cover;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying float vCover;")
      .replace(
        "#include <map_fragment>",
        [
          "#ifdef USE_MAP",
          "vec2 cuv = vec2(",
          `  (floor(vCover + 0.5) + clamp(fract(vMapUv.x), 0.004, 0.996)) / ${tiles},`,
          "  clamp(fract(vMapUv.y), 0.004, 0.996));",
          "diffuseColor *= texture2D(map, cuv);",
          "#endif",
        ].join("\n"),
      );
  };
  return mat;
}

/** A wall box coloured per face: its outdoor face (Box3d.outside) sided,
 * the rest painted, or covered (Box3d.cover) where it faces a room that
 * has a covering; with UVs in metres for the covering's pattern. */
function wallGeometry(
  b: Box3d,
  paint: THREE.Color,
  siding: THREE.Color,
  stone: THREE.Color,
): THREE.BufferGeometry {
  const own = b.color ? new THREE.Color(b.color) : null;
  const outdoor = b.stone ? stone : siding;
  const g = boxGeometry(b);
  const pos = g.getAttribute("position");
  const count = pos.count;
  const colors = new Float32Array(count * 3);
  const cover = new Float32Array(count);
  const uv = new Float32Array(count * 2);
  // BoxGeometry's faces come +X, -X, +Y, -Y, +Z, -Z, four corners each.
  const indoor = b.outside === 1 ? 20 : b.outside === -1 ? 16 : -1;
  // The wall's direction on the floor plane (local +X after rotateY).
  const ux = Math.cos(b.angle);
  const uz = -Math.sin(b.angle);
  const covers = b.cover?.map((c) =>
    c
      ? {
          tile: Math.max(0, COVER_TILES.indexOf(c.finish)),
          color: new THREE.Color(c.color),
          size: COVER_TILE_M[c.finish] ?? 1,
        }
      : null,
  );
  for (let v = 0; v < count; v++) {
    const face = Math.floor(v / 4);
    // Its top (and bottom) is the same painted cap on every wall, so
    // tops read as one clean cut where walls meet. An inside wall's ends
    // are painted (a jamb, a wall stopping above a half wall); an outside
    // wall's are sided: where one shows past a corner it's the outside of
    // the house (its door jambs are cased over).
    const cap = face === 2 || face === 3;
    const isOutdoor = !cap && indoor >= 0 && !(v >= indoor && v < indoor + 4);
    const side = face === 4 ? 0 : face === 5 ? 1 : -1;
    const cov = !own && !isOutdoor && side >= 0 ? covers?.[side] : null;
    const c = own ?? (isOutdoor ? outdoor : (cov?.color ?? paint));
    colors[v * 3] = c.r;
    colors[v * 3 + 1] = c.g;
    colors[v * 3 + 2] = c.b;
    cover[v] = cov ? cov.tile : 0;
    const size = cov?.size ?? 1;
    const x = pos.getX(v);
    const y = pos.getY(v);
    const z = pos.getZ(v);
    const along = face < 2 ? x * -uz + z * ux : x * ux + z * uz;
    uv[v * 2] = (cap ? x : along) / size;
    uv[v * 2 + 1] = (cap ? z : y) / size;
  }
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  g.setAttribute("cover", new THREE.BufferAttribute(cover, 1));
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

/** The roof's mesh: its planar faces coloured by kind, and any height grid
 * shingled where it's roof-like and sided where it stands steep (a gable's
 * end above a lower roof), with the gable ends closed down to their
 * eaves. */
function roofGeometry(roof: Roof3d): THREE.BufferGeometry {
  const pos: number[] = [];
  const col: number[] = [];
  const shingle = new THREE.Color(roof.color);
  const siding = new THREE.Color(roof.sidingColor);
  const looks: Record<RoofFace3d["kind"], THREE.Color> = {
    shingle,
    siding,
    shake: new THREE.Color(roof.shakeColor),
    trim: new THREE.Color(roof.trimColor),
  };
  const uv: number[] = [];
  // Planar faces: each a convex polygon, fanned from its first corner.
  // Shingled ones first (the textured group), their courses running
  // level across the slope.
  const ordered = [
    ...roof.faces.filter((f) => f.kind === "shingle"),
    ...roof.faces.filter((f) => f.kind !== "shingle"),
  ];
  let textured = 0;
  for (const face of ordered) {
    const c = looks[face.kind];
    const [p0, ...rest] = face.points;
    let across = new THREE.Vector3();
    let down = new THREE.Vector3();
    if (face.kind === "shingle" && rest.length >= 2) {
      const a = new THREE.Vector3(...p0!);
      const n = new THREE.Vector3(...rest[0]!)
        .sub(a)
        .cross(new THREE.Vector3(...rest[1]!).sub(a))
        .normalize();
      across = new THREE.Vector3(0, 1, 0).cross(n).normalize();
      down = n.clone().cross(across).normalize();
    }
    for (let k = 0; k + 1 < rest.length; k++)
      for (const v of [p0!, rest[k]!, rest[k + 1]!]) {
        pos.push(v[0], v[1], v[2]);
        col.push(c.r, c.g, c.b);
        uv.push(
          (v[0] * across.x + v[2] * across.z) / SHINGLE_TILE_M[0],
          (v[0] * down.x + v[1] * down.y + v[2] * down.z) / SHINGLE_TILE_M[1],
        );
        if (face.kind === "shingle") textured++;
      }
  }
  if (roof.grid) gridRoof(roof.grid, shingle, siding, pos, col);
  while (uv.length < (pos.length / 3) * 2) uv.push(0, 0);
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geom.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  geom.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  geom.addGroup(0, textured, 0);
  geom.addGroup(textured, pos.length / 3 - textured, 1);
  geom.computeVertexNormals();
  return geom;
}

/** One tile of the shingle texture (metres across, down the slope): three
 * tabs wide, four courses deep. */
const SHINGLE_TILE_M: [number, number] = [1.0, 0.56];

/** Asphalt shingles, light on white so they tint the roof's colour: four
 * courses of staggered tabs, each a shade off, a shadow under each
 * course. */
function shingleTexture(): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const g = canvas.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, 256, 256);
  let seed = 7;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let row = 0; row < 4; row++) {
    const y = row * 64;
    const shift = row % 2 ? 42 : 0;
    for (let k = -1; k < 3; k++) {
      const x = k * 85 + shift;
      const v = 218 + Math.round(rand() * 37);
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(x + 2, y, 83, 64);
    }
    // The course's butt edge casts a thin shadow on the one below.
    g.fillStyle = "rgba(0,0,0,0.3)";
    g.fillRect(0, y + 60, 256, 4);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** A roof's height grid as triangles (positions and colours appended). */
function gridRoof(
  grid: RoofGrid3d,
  shingle: THREE.Color,
  siding: THREE.Color,
  pos: number[],
  col: number[],
): void {
  const { x0, z0, step, nx, nz, heights, eaves } = grid;
  const h = (i: number, j: number) => heights[j * nx + i]!;
  const defined = (i: number, j: number) =>
    i >= 0 && j >= 0 && i < nx && j < nz && !Number.isNaN(h(i, j));
  // Cells two grid steps square, fanned from the eight points round them
  // to the one at their centre: the samples between the corners carry a
  // hip or a valley crossing the cell, so folds run true instead of
  // stepping from cell to cell.
  const ring: [number, number][] = [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [2, 1],
    [2, 0],
    [1, 0],
  ];
  // A cell where the roof drops sharply (a higher part's eave or gable
  // over a lower roof) would hang a curtain from the higher part down to
  // the lower one, in front of the wall between them and its windows: it
  // counts as an edge instead, so the higher part is closed only down to
  // its own eave.
  const steep = (i: number, j: number) => {
    let lo = Infinity;
    let hi = -Infinity;
    for (let dj = 0; dj <= 2; dj++)
      for (let di = 0; di <= 2; di++) {
        lo = Math.min(lo, h(i + di, j + dj));
        hi = Math.max(hi, h(i + di, j + dj));
      }
    return hi - lo > 0.4;
  };
  const cell = (i: number, j: number) =>
    i >= 0 &&
    j >= 0 &&
    defined(i + 1, j + 1) &&
    ring.every(([di, dj]) => defined(i + di, j + dj)) &&
    !steep(i, j);
  const tri = (p: THREE.Vector3, q: THREE.Vector3, r: THREE.Vector3) => {
    const n = new THREE.Vector3()
      .subVectors(q, p)
      .cross(new THREE.Vector3().subVectors(r, p))
      .normalize();
    const look = Math.abs(n.y) < 0.4 ? siding : shingle;
    for (const v of [p, q, r]) {
      pos.push(v.x, v.y, v.z);
      col.push(look.r, look.g, look.b);
    }
  };
  const P = (i: number, j: number, y = h(i, j)) =>
    new THREE.Vector3(x0 + i * step, y, z0 + j * step);
  for (let j = 0; j + 2 < nz; j += 2)
    for (let i = 0; i + 2 < nx; i += 2) {
      if (!cell(i, j)) continue;
      const mid = P(i + 1, j + 1);
      const around = ring.map(([di, dj]) => P(i + di, j + dj));
      around.forEach((p, k) => tri(p, around[(k + 1) % 8]!, mid));
    }
  // Gable ends: where the roof stops above its eave, siding down to it.
  const skirt = (i0: number, j0: number, i1: number, j1: number) => {
    const e0 = eaves[j0 * nx + i0]!;
    const e1 = eaves[j1 * nx + i1]!;
    const h0 = h(i0, j0);
    const h1 = h(i1, j1);
    if (!(h0 > e0 + 0.02 || h1 > e1 + 0.02)) return;
    const top0 = P(i0, j0);
    const top1 = P(i1, j1);
    const bot0 = P(i0, j0, Math.min(e0, h0));
    const bot1 = P(i1, j1, Math.min(e1, h1));
    for (const v of [top0, bot0, top1, top1, bot0, bot1]) {
      pos.push(v.x, v.y, v.z);
      col.push(siding.r, siding.g, siding.b);
    }
  };
  for (let j = 0; j < nz; j += 2)
    for (let i = 0; i + 2 < nx; i += 2)
      if (cell(i, j - 2) !== cell(i, j)) {
        skirt(i, j, i + 1, j);
        skirt(i + 1, j, i + 2, j);
      }
  for (let j = 0; j + 2 < nz; j += 2)
    for (let i = 0; i < nx; i += 2)
      if (cell(i - 2, j) !== cell(i, j)) {
        skirt(i, j, i, j + 1);
        skirt(i, j + 1, i, j + 2);
      }
}

/** A shape on the floor plane from (x, z) points — three's shapes live in
 * XY, so z goes in as -y and rotateX(-90°) brings it back. */
function floorShape(points: Vec2[]): THREE.Shape {
  return new THREE.Shape(points.map(([x, z]) => new THREE.Vector2(x, -z)));
}

/** UVs for an extruded item: the caps map the footprint's bounding box
 * onto the whole texture (the 2D drawing), the sides get nothing much. */
function itemUvGenerator(w: number, d: number) {
  return {
    generateTopUV(
      _g: THREE.ExtrudeGeometry,
      v: number[],
      a: number,
      b: number,
      c: number,
    ) {
      return [a, b, c].map(
        (i) =>
          new THREE.Vector2(
            (v[i * 3]! + w / 2) / w,
            (v[i * 3 + 1]! + d / 2) / d,
          ),
      );
    },
    generateSideWallUV() {
      return [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1, 0),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(0, 1),
      ];
    },
  };
}

/** The angle (degrees, 0–90) most of these directions share, modulo 90 —
 * a building's (or a scan's) grid. Weighted 1° histogram, smoothed. */
function dominantAngle(
  samples: { angle: number; weight: number }[],
): number | null {
  const bins = new Float64Array(90);
  let total = 0;
  for (const { angle, weight } of samples) {
    const a = ((angle % 90) + 90) % 90;
    bins[Math.floor(a) % 90]! += weight;
    total += weight;
  }
  if (total <= 0) return null;
  let best = 0;
  let bestScore = -1;
  for (let i = 0; i < 90; i++) {
    const score =
      bins[(i + 89) % 90]! * 0.5 + bins[i]! + bins[(i + 1) % 90]! * 0.5;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  // Refine within the peak bin's neighbourhood by a weighted mean.
  let sum = 0;
  let w = 0;
  for (const { angle, weight } of samples) {
    const a = ((angle % 90) + 90) % 90;
    let diff = a - (best + 0.5);
    if (diff > 45) diff -= 90;
    if (diff < -45) diff += 90;
    if (Math.abs(diff) <= 1.5) {
      sum += diff * weight;
      w += weight;
    }
  }
  return (((best + 0.5 + (w > 0 ? sum / w : 0)) % 90) + 90) % 90;
}

const MODEL_MATERIALS = new Map<string, THREE.MeshStandardMaterial>();

/** A shared material per colour (and glow) for the modelled items. */
function modelMaterial(
  color: string,
  emissive?: string,
  glow = 0,
): THREE.MeshStandardMaterial {
  const key = `${color}|${emissive ?? ""}|${glow.toFixed(2)}`;
  let mat = MODEL_MATERIALS.get(key);
  if (!mat) {
    mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.85,
      flatShading: true,
    });
    if (emissive) {
      mat.emissive = new THREE.Color(emissive);
      mat.emissiveIntensity = glow;
    }
    MODEL_MATERIALS.set(key, mat);
  }
  return mat;
}

/** A low-poly model for a plant, tree or lamp, standing at the origin and
 * filling the item's footprint and height. */
/** A straight flight in the item's frame (y up from its lower end's
 * level): stacked steps with wood treads and painted risers, and a
 * banister (newel posts, spindles, a sloped handrail) on each railed
 * side. */
function stairsModel(
  item: Item3d,
  st: NonNullable<Item3d["stairs"]>,
  add: (
    geom: THREE.BufferGeometry,
    mat: THREE.Material,
    y: number,
  ) => THREE.Mesh,
): void {
  const W = item.width;
  const D = item.depth;
  const rise = Math.abs(st.back - st.front);
  if (rise < 0.05) {
    add(new THREE.BoxGeometry(W, 0.04, D), modelMaterial("#a07a55"), 0.02);
    return;
  }
  // The low end: front (+z) when the front's level is lower.
  const dir = st.front < st.back ? -1 : 1;
  const z0 = (-dir * D) / 2;
  const n = Math.max(1, Math.round(rise / 0.18));
  const h = rise / n;
  const run = D / n;
  const tread = modelMaterial("#a5774f");
  const paint = modelMaterial("#efebe4");
  const white = modelMaterial("#f4f1eb");
  const wood = modelMaterial("#7d5536");
  const box = (
    w: number,
    hh: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material,
  ) => {
    const mesh = add(new THREE.BoxGeometry(w, hh, d), mat, y);
    mesh.position.x = x;
    mesh.position.z = z;
    return mesh;
  };
  for (let k = 1; k <= n; k++) {
    // Step k: solid from its riser to the high end, its tread on top. The
    // top step, where the floor up there runs over it, is that floor: no
    // tread, its solid tucked under the floor's top.
    const zs = z0 + dir * (k - 1) * run;
    const zEnd = z0 + dir * D;
    const len = Math.abs(zEnd - zs);
    const landed = k === n && (st.landing ?? 0) >= run - 0.02;
    const hk = landed ? h - 0.004 : h;
    box(W, hk, len, 0, (k - 1) * h + hk / 2, (zs + zEnd) / 2, paint);
    if (landed) continue;
    // The tread sits on it, its nosing a little proud of the riser.
    box(
      W + 0.02,
      0.035,
      Math.min(len, run) + 0.025,
      0,
      k * h + 0.0155,
      zs + dir * (Math.min(len, run) / 2 - 0.0125),
      tread,
    );
  }
  // A flight down from its floor (its top is the floor's level): a wall
  // along each open side up to the floor, and a level banister on top of
  // it at the floor's level, running the flight's length to the wall.
  if (Math.max(st.front, st.back) <= 0.05) {
    st.rails.forEach((on, i) => {
      const x = (i === 0 ? -1 : 1) * (W / 2 + 0.05);
      // A straight wall down each side from the floor to the flight's
      // foot (between it and a flight beside it, too), its top a hair
      // under the floor so the two never fight.
      box(0.1, rise - 0.004, D, x, (rise - 0.004) / 2, 0, paint);
      if (!on) return;
      const top = rise + 0.95;
      const ends = [-D / 2 + 0.05, D / 2 - 0.05];
      for (const z of ends) box(0.09, 1.0, 0.09, x, rise + 0.5, z, white);
      box(0.07, 0.05, D, x, top - 0.025, 0, wood);
      box(0.05, 0.04, D, x, rise + 0.08, 0, white);
      const count = Math.floor(D / 0.11);
      for (let k = 1; k < count; k++) {
        const z = -D / 2 + (D * k) / count;
        if (Math.abs(z - ends[0]!) < 0.06 || Math.abs(z - ends[1]!) < 0.06)
          continue;
        box(
          0.025,
          top - 0.05 - (rise + 0.1),
          0.025,
          x,
          (top - 0.05 + rise + 0.1) / 2,
          z,
          white,
        );
      }
    });
    return;
  }
  // Banisters: the handrail 0.9 m above the treads' nosing line.
  const railH = 0.9;
  const zLow = z0 + dir * 0.06;
  const zHigh = z0 + dir * (D - 0.06);
  const yLow = h + railH;
  const yHigh = rise + railH;
  const slope = (yHigh - yLow) / Math.abs(zHigh - zLow);
  const railY = (z: number) => yLow + slope * Math.abs(z - zLow);
  st.rails.forEach((on, i) => {
    if (!on) return;
    const x = (i === 0 ? -1 : 1) * (W / 2 - 0.05);
    // Where it runs into a wall it stops in that wall's face (a little
    // into it), with no newel; elsewhere a newel post ends it.
    const [lowCut, highCut] = st.railEnds?.[i] ?? [0, 0];
    const za = lowCut > 0 ? z0 + dir * (lowCut - 0.04) : zLow;
    const zb = highCut > 0 ? z0 + dir * (D - highCut + 0.04) : zHigh;
    if (lowCut <= 0)
      box(0.09, railH + 0.12, 0.09, x, (railH + 0.12) / 2, zLow, white);
    if (highCut <= 0)
      box(0.09, railH + 0.12, 0.09, x, rise + (railH + 0.12) / 2, zHigh, white);
    const ya = railY(za);
    const yb = railY(zb);
    const rail = box(
      0.07,
      0.05,
      Math.hypot(zb - za, yb - ya),
      x,
      (ya + yb) / 2,
      (za + zb) / 2,
      wood,
    );
    rail.rotation.x = -Math.atan2(yb - ya, Math.abs(zb - za)) * dir;
    // Two spindles a step, from the tread up to the handrail.
    for (let k = 1; k <= n; k++)
      for (const f of [0.25, 0.75]) {
        const z = z0 + dir * (k - 1 + f) * run;
        const along = dir * (z - z0);
        if (along < dir * (za - z0) + 0.04 || along > dir * (zb - z0) - 0.04)
          continue;
        if (Math.abs(z - zLow) < 0.08 || Math.abs(z - zHigh) < 0.08) continue;
        const top = railY(z) - 0.03;
        const bottom = k * h;
        box(0.025, top - bottom, 0.025, x, (top + bottom) / 2, z, white);
      }
  });
}

function modelItem(item: Item3d): THREE.Group {
  const g = new THREE.Group();
  const r = Math.max(0.08, Math.min(item.width, item.depth) / 2);
  const h = Math.max(0.2, item.height);
  const add = (
    geom: THREE.BufferGeometry,
    mat: THREE.Material,
    y: number,
    shadow = true,
  ) => {
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.y = y;
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  };
  if (item.shape === "stairs" && item.stairs) {
    stairsModel(item, item.stairs, add);
  } else if (item.shape === "shower") {
    // A shower: its tray, and a glass enclosure you can see into.
    const tray = add(
      new THREE.BoxGeometry(item.width, 0.08, item.depth),
      modelMaterial("#f2f2f0"),
      0.04,
    );
    tray.castShadow = false;
    const glass = new THREE.MeshStandardMaterial({
      color: "#cfe8f3",
      roughness: 0.05,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    add(
      new THREE.BoxGeometry(item.width, h - 0.08, item.depth),
      glass,
      0.08 + (h - 0.08) / 2,
      false,
    );
  } else if (item.shape === "plant") {
    const potH = Math.min(0.35, h * 0.28);
    add(
      new THREE.CylinderGeometry(r * 0.55, r * 0.42, potH, 14),
      modelMaterial("#b5653f"),
      potH / 2,
    );
    const leaf = add(
      new THREE.IcosahedronGeometry(1, 1),
      modelMaterial("#5f8f4e"),
      potH + (h - potH) * 0.55,
    );
    leaf.scale.set(r * 1.05, (h - potH) * 0.5, r * 1.05);
  } else if (item.shape === "tree") {
    add(
      new THREE.CylinderGeometry(r * 0.1, r * 0.14, h * 0.45, 8),
      modelMaterial("#6d4c3a"),
      h * 0.225,
    );
    const crown = add(
      new THREE.IcosahedronGeometry(1, 1),
      modelMaterial("#4f7d43"),
      h * 0.66,
    );
    crown.scale.set(r, h * 0.36, r);
  } else {
    // A lamp: base, pole, shade (glowing while its light is on).
    const shadeH = Math.min(0.32, h * 0.35);
    add(
      new THREE.CylinderGeometry(r * 0.5, r * 0.55, 0.03, 16),
      modelMaterial("#5b5b5b"),
      0.015,
    );
    add(
      new THREE.CylinderGeometry(0.012, 0.012, h - shadeH, 6),
      modelMaterial("#5b5b5b"),
      (h - shadeH) / 2,
    );
    const lit = item.light;
    const shade = add(
      new THREE.CylinderGeometry(r * 0.55, r * 0.85, shadeH, 20, 1, true),
      lit
        ? modelMaterial("#f3ead8", lit.color, 0.5 + 0.8 * lit.level)
        : modelMaterial("#f3ead8"),
      h - shadeH / 2,
      !lit,
    );
    (shade.material as THREE.Material).side = THREE.DoubleSide;
  }
  return g;
}

/** The roof's light strips: a bead per LED, glowing in its light's colour
 * while on (with a soft halo), else dark. */
function buildRoofLights(strips: RoofLights3d[]): THREE.Group {
  const group = new THREE.Group();
  group.name = "Roof lights";
  const dummy = new THREE.Object3D();
  const instanced = (
    geom: THREE.BufferGeometry,
    mat: THREE.Material,
    pts: number[],
  ) => {
    const n = pts.length / 3;
    const mesh = new THREE.InstancedMesh(geom, mat, n);
    for (let k = 0; k < n; k++) {
      dummy.position.set(pts[k * 3]!, pts[k * 3 + 1]!, pts[k * 3 + 2]!);
      dummy.updateMatrix();
      mesh.setMatrixAt(k, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    return mesh;
  };
  for (const strip of strips) {
    if (!strip.points.length) continue;
    if (!strip.color) {
      const beads = instanced(
        new THREE.SphereGeometry(0.009, 8, 6),
        new THREE.MeshStandardMaterial({ color: "#2e2e2e", roughness: 0.35 }),
        strip.points,
      );
      beads.name = `${strip.name} (off)`;
      group.add(beads);
      continue;
    }
    const level = Math.max(0.15, Math.min(1, strip.level));
    const lit = new THREE.Color(strip.color);
    // Each LED's colour: the pattern's in turn, else the light's.
    const colours = (strip.pattern?.length ? strip.pattern : [strip.color]).map(
      (c) => new THREE.Color(c),
    );
    const white = new THREE.Color("#ffffff");
    const beads = instanced(
      new THREE.SphereGeometry(0.01, 8, 6),
      new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false }),
      strip.points,
    );
    beads.name = strip.name;
    const halo = instanced(
      new THREE.SphereGeometry(0.03, 8, 6),
      new THREE.MeshBasicMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: 0.12 + 0.18 * level,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
      strip.points,
    );
    halo.name = `${strip.name} glow`;
    for (let k = 0; k < beads.count; k++) {
      const c = colours[k % colours.length] ?? lit;
      beads.setColorAt(k, c.clone().lerp(white, 0.25 * level));
      halo.setColorAt(k, c);
    }
    if (beads.instanceColor) beads.instanceColor.needsUpdate = true;
    if (halo.instanceColor) halo.instanceColor.needsUpdate = true;
    group.add(beads, halo);
  }
  return group;
}

function insidePolygon(poly: Vec2[], x: number, z: number): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i]!;
    const [xj, zj] = poly[j]!;
    if (zi > z !== zj > z && x < xi + ((z - zi) * (xj - xi)) / (zj - zi))
      inside = !inside;
  }
  return inside;
}

/** Grid lines along one axis: every `step` metres across [lo, hi], then
 * ever wider out to `reach` on both sides. */
function gridLines(lo: number, hi: number, step: number, reach: number) {
  const out: number[] = [];
  for (let v = lo; v < hi; v += step) out.push(v);
  out.push(hi);
  let s = step;
  for (let v = lo; v > lo - reach;) {
    s *= 1.4;
    v -= s;
    out.unshift(v);
  }
  s = step;
  for (let v = hi; v < hi + reach;) {
    s *= 1.4;
    v += s;
    out.push(v);
  }
  return out;
}

/** The drawn ground's height (world Y) at a spot: the terrain's (see
 * terrainGeometry), else the flat ground's. */
function groundAt(t: Terrain3d | null, x: number, z: number): number {
  if (!t) return -0.06;
  const [dx, dz] = t.dir;
  const [lo, hi] = t.range;
  const s = x * dx + z * dz;
  const k = hi > lo ? Math.min(1, Math.max(0, (s - lo) / (hi - lo))) : 0;
  const fall = t.level >= 1 ? 0 : Math.max(0, (k - t.level) / (1 - t.level));
  return (
    t.uphill +
    (t.downhill - t.uphill) * fall -
    0.06 +
    gradeAt(t.grid, t.cover, x, z)
  );
}

/** A hillside under the building (see Terrain3d): level at `uphill`
 * before the building's high face and across its first `level` share,
 * falling linearly across the rest to
 * `downhill` past its low face, with the given rooms cut out. */
function terrainGeometry(t: Terrain3d, box: THREE.Box3): THREE.BufferGeometry {
  // A hair under the stated grade: outdoor slabs sit just below 0.
  const height = (x: number, z: number) => groundAt(t, x, z);
  // Out to the grading's edge too.
  const g = t.grid;
  const margin = 6;
  if (g) {
    box = box.clone();
    box.expandByPoint(new THREE.Vector3(g.x0 - margin, 0, g.z0 - margin));
    box.expandByPoint(
      new THREE.Vector3(
        g.x0 + (g.cols - 1) * g.step + margin,
        0,
        g.z0 + (g.rows - 1) * g.step + margin,
      ),
    );
  }
  // Grid lines along the cut-out rooms' outlines too, so the ground runs
  // right up to them (a cell is cut only when it's inside one).
  const withHoles = (lines: number[], axis: 0 | 1) => {
    const all = [...lines];
    for (const poly of t.holes) for (const p of poly) all.push(p[axis]);
    all.sort((a, b) => a - b);
    return all.filter((v, i) => i === 0 || v - all[i - 1]! > 0.005);
  };
  const xs = withHoles(
    gridLines(box.min.x - margin, box.max.x + margin, 0.2, 250),
    0,
  );
  const zs = withHoles(
    gridLines(box.min.z - margin, box.max.z + margin, 0.2, 250),
    1,
  );
  const nx = xs.length;
  const positions = new Float32Array(nx * zs.length * 3);
  zs.forEach((z, j) =>
    xs.forEach((x, i) => {
      const k = (j * nx + i) * 3;
      positions[k] = x;
      positions[k + 1] = height(x, z);
      positions[k + 2] = z;
    }),
  );
  const inHole = (x: number, z: number) =>
    x >= box.min.x - 0.5 &&
    x <= box.max.x + 0.5 &&
    z >= box.min.z - 0.5 &&
    z <= box.max.z + 0.5 &&
    t.holes.some((poly) => insidePolygon(poly, x, z));
  const index: number[] = [];
  for (let j = 0; j < zs.length - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const x0 = xs[i]!;
      const x1 = xs[i + 1]!;
      const z0 = zs[j]!;
      const z1 = zs[j + 1]!;
      if (inHole((x0 + x1) / 2, (z0 + z1) / 2)) continue;
      const a = j * nx + i;
      const b = a + 1;
      const c = a + nx;
      const d = c + 1;
      index.push(a, c, b, b, c, d);
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setIndex(index);
  geom.computeVertexNormals();
  return geom;
}

function percentile(sorted: Float32Array, p: number): number {
  if (sorted.length === 0) return 0;
  return sorted[
    Math.min(
      sorted.length - 1,
      Math.max(0, Math.round(p * (sorted.length - 1))),
    )
  ]!;
}

/** A wall face in a frame squared to the building: constant u (or v)
 * from..to along the other axis, looking toward +1 or -1. */
interface WallLine {
  at: number;
  from: number;
  to: number;
  facing: number;
}

/** The plan's walls, glass, blinds and garage doors for a floor, merged per
 * look, leaving out boxes `keep` rejects (where a scan stands in). */
function fillWalls(
  walls: THREE.Group,
  spec: Floor3d,
  keep: (b: Box3d) => boolean,
): void {
  for (const child of [...walls.children]) {
    walls.remove(child);
    const mesh = child as THREE.Mesh;
    mesh.geometry?.dispose();
    (mesh.material as THREE.Material)?.dispose();
  }
  const kept = spec.walls.filter(keep);
  if (kept.length) {
    const paint = new THREE.Color(spec.wallColor);
    const siding = new THREE.Color(spec.sidingColor);
    const stone = new THREE.Color(spec.stoneColor);
    const parts = kept.map((b) => wallGeometry(b, paint, siding, stone));
    const merged = mergeGeometries(parts);
    for (const p of parts) p.dispose();
    if (merged) {
      const mesh = new THREE.Mesh(merged, wallMaterial());
      mesh.name = "Walls";
      // Which box each triangle came from (12 a box), for picking.
      mesh.userData["boxes"] = kept;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      walls.add(mesh);
    }
  }
  const byLook = new Map<string, THREE.BufferGeometry[]>();
  const boxesByLook = new Map<string, Box3d[]>();
  for (const pane of spec.panes) {
    if (!keep(pane.box)) continue;
    const key = `${pane.kind}|${pane.color}|${pane.opacity}`;
    const list = byLook.get(key) ?? [];
    list.push(boxGeometry(pane.box));
    byLook.set(key, list);
    boxesByLook.set(key, [...(boxesByLook.get(key) ?? []), pane.box]);
  }
  for (const [key, parts] of byLook) {
    const [kind, color, opacity] = key.split("|") as [string, string, string];
    const merged = mergeGeometries(parts);
    for (const p of parts) p.dispose();
    if (!merged) continue;
    const op = Number(opacity);
    const mesh = new THREE.Mesh(
      merged,
      new THREE.MeshStandardMaterial({
        color,
        roughness: kind === "glass" ? 0.05 : 0.7,
        metalness: kind === "glass" ? 0.1 : 0,
        transparent: op < 1,
        opacity: op,
        depthWrite: op >= 1,
      }),
    );
    mesh.name =
      kind === "glass"
        ? "Windows"
        : kind === "door"
          ? "Garage doors"
          : "Blinds";
    mesh.castShadow = kind !== "glass";
    mesh.receiveShadow = kind !== "glass";
    mesh.userData["boxes"] = boxesByLook.get(key);
    walls.add(mesh);
  }
}

interface FloorEntry {
  spec: Floor3d;
  group: THREE.Group;
  walls: THREE.Group;
  /** What fillWalls last drew: "plan", or the scan placements covering. */
  wallsKey?: string;
  furniture: THREE.Group;
  scans: THREE.Group;
  order: number;
}

/** What a scan mesh is, from its own or an enclosing node's name — Polycam
 * (and RoomPlan-style) exports name them Ceiling_…, Floor_F1_…, stairs…. */
function scanPart(o: THREE.Object3D): "ceiling" | "floor" | "stairs" | "other" {
  for (let n: THREE.Object3D | null = o; n; n = n.parent) {
    const name = n.name ?? "";
    if (/^ceiling/i.test(name)) return "ceiling";
    if (
      /^floor_(?!transition)[a-z]*\d*_/i.test(name) ||
      /^floor_f\d/i.test(name)
    )
      return "floor";
    // A stairs object ("stairs7_F2_0"), not any node whose name merely
    // contains the word (a scan fitted to "upstairs").
    if (/^stairs?\d*_/i.test(name)) return "stairs";
  }
  return "other";
}

interface ScanEntry {
  placement: ScanPlacement3d;
  /** Positioned/rotated/scaled per the placement. */
  group: THREE.Group;
  content: THREE.Object3D | null;
  /** Sampled vertices in the scan's own frame (x, y, z triples). */
  samples: Float32Array | null;
  /** Its walls' grid angle in its own frame (degrees mod 90). */
  angle: number | null;
  materials: {
    material: THREE.Material;
    opacity: number;
    transparent: boolean;
  }[];
}

/** Floor finishes, drawn once each: a tile of the texture and how many
 * metres it spans (a floor's UVs are its plan coordinates in metres). */
const FLOOR_TEXTURES = new Map<FloorFinish, THREE.Texture>();
const FLOOR_TILE_M: Record<FloorFinish, number> = {
  plain: 1,
  wood: 1.6,
  tile: 1.2,
  carpet: 1.5,
  concrete: 3,
  deck: 1.4,
  stone: 2.4,
};

function floorTexture(finish: FloorFinish): THREE.Texture {
  const known = FLOOR_TEXTURES.get(finish);
  if (known) return known;
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d")!;
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const shade = (base: [number, number, number], spread: number) => {
    const k = 1 + (rand() - 0.5) * spread;
    return `rgb(${base.map((c) => Math.round(Math.min(255, c * k))).join(",")})`;
  };
  const noise = (base: [number, number, number], spread: number, n: number) => {
    g.fillStyle = `rgb(${base.join(",")})`;
    g.fillRect(0, 0, size, size);
    for (let i = 0; i < n; i++) {
      g.fillStyle = shade(base, spread);
      g.fillRect(rand() * size, rand() * size, 2, 2);
    }
  };
  const boards = (
    base: [number, number, number],
    rows: number,
    gap: string,
    gapPx: number,
  ) => {
    const h = size / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rand() * size * 0.5;
      while (x < size) {
        const len = size * (0.35 + rand() * 0.5);
        g.fillStyle = shade(base, 0.16);
        g.fillRect(x, r * h, len, h);
        // Grain: a few faint streaks along the board.
        g.globalAlpha = 0.12;
        for (let k = 0; k < 4; k++) {
          g.fillStyle = shade(base, 0.6);
          g.fillRect(x, r * h + rand() * h, len, 1);
        }
        g.globalAlpha = 1;
        g.fillStyle = gap;
        g.fillRect(x, r * h, gapPx, h);
        x += len;
      }
      g.fillStyle = gap;
      g.fillRect(0, r * h, size, gapPx);
    }
  };
  switch (finish) {
    case "wood":
      boards([196, 160, 118], 10, "rgba(70,45,25,0.55)", 2);
      break;
    case "deck":
      boards([150, 112, 80], 10, "rgba(35,25,18,0.9)", 4);
      break;
    case "tile": {
      noise([226, 222, 214], 0.05, 6000);
      g.fillStyle = "rgba(120,115,108,0.6)";
      for (let i = 0; i < 2; i++) {
        g.fillRect(i * (size / 2), 0, 3, size);
        g.fillRect(0, i * (size / 2), size, 3);
      }
      break;
    }
    case "carpet":
      noise([196, 190, 180], 0.12, 40000);
      break;
    case "concrete":
      noise([188, 186, 182], 0.1, 20000);
      break;
    case "stone": {
      // Flagstones: irregular slabs in a running pattern, dark joints.
      noise([176, 170, 160], 0.1, 12000);
      const rows = 3;
      const h = size / rows;
      for (let r = 0; r < rows; r++) {
        let x = -rand() * size * 0.3;
        while (x < size) {
          const w = size * (0.22 + rand() * 0.25);
          g.fillStyle = shade([176, 170, 160], 0.22);
          g.fillRect(x + 3, r * h + 3, w - 6, h - 6);
          x += w;
        }
      }
      break;
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1 / FLOOR_TILE_M[finish], 1 / FLOOR_TILE_M[finish]);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  FLOOR_TEXTURES.set(finish, tex);
  return tex;
}

function createView3d(options: View3dOptions): View3dHandle {
  const { container } = options;
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Rolls off highlights (a lamp-lit floor in full sun) instead of
  // clipping them to white.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.touchAction = "none";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 3000);
  camera.position.set(12, 14, 18);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.12;
  controls.screenSpacePanning = true;
  controls.maxPolarAngle = Math.PI * 0.495;

  /** Everything that's exported: floors, furniture, lights, scans. */
  const root = new THREE.Group();
  root.name = "Building";
  scene.add(root);

  const groundMat = new THREE.MeshStandardMaterial({
    color: "#c9d4c0",
    roughness: 1,
  });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(400, 64), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.06;
  ground.receiveShadow = true;
  scene.add(ground);
  /** The sloping ground of a hillside site, in place of `ground`. */
  let terrain: THREE.Mesh | null = null;
  /** The site's ground, for laying driveways and fences on it. */
  let siteTerrain: Terrain3d | null = null;
  /** What the terrain was last built around. */
  let terrainBox: THREE.Box3 | null = null;
  /** The building's roof, shown while the floors stand together. */
  let roof: THREE.Mesh | null = null;
  /** The roof's light strips (see RoofLights3d). */
  let roofLightGroup: THREE.Group | null = null;
  let roofSpec: Roof3d | null = null;

  const hemi = new THREE.HemisphereLight("#dcecff", "#b9a88f", 1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight("#ffffff", 2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  scene.add(sun, sun.target);

  const textureLoader = new THREE.TextureLoader();
  const textures = new Map<string, THREE.Texture>();
  const floors = new Map<string, FloorEntry>();
  const scans = new Map<string, ScanEntry>();
  let spread = 0;
  /** The scene's dark theme (floor finishes are dimmed to suit). */
  let dark = false;
  let editScanId: string | null = null;
  let scanMode: ScanMode = "plan";
  let editSnap = true;
  let fitted = false;
  let destroyed = false;

  // --- rendering on demand ------------------------------------------------
  let raf = 0;
  let dirty = true;
  const draw = () => {
    raf = 0;
    if (destroyed) return;
    const moved = controls.update();
    if (moved || dirty) {
      dirty = false;
      sizeHandles();
      renderer.render(scene, camera);
    }
    if (moved) schedule();
  };
  const schedule = () => {
    if (!raf && !destroyed) raf = requestAnimationFrame(draw);
  };
  const invalidate = () => {
    dirty = true;
    schedule();
  };
  controls.addEventListener("change", invalidate);

  const resize = () => {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    invalidate();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  function texture(url: string): THREE.Texture {
    let tex = textures.get(url);
    if (!tex) {
      tex = textureLoader.load(url, invalidate);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      textures.set(url, tex);
    }
    return tex;
  }

  function disposeObject(obj: THREE.Object3D, keepTextures = true): void {
    obj.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        for (const m of mats) {
          if (!keepTextures) {
            for (const v of Object.values(m))
              if ((v as THREE.Texture)?.isTexture)
                (v as THREE.Texture).dispose();
          }
          m.dispose();
        }
      }
    });
  }

  // --- the building ---------------------------------------------------------

  function buildItem(item: Item3d, baseY = 0): THREE.Object3D {
    // On the ground: the terrain's height (or the flat ground's), in the
    // item's floor's frame.
    const site = item.site
      ? siteModel(item, (x, z) => groundAt(siteTerrain, x, z) - baseY)
      : null;
    const furniture = site
      ? site
      : item.shape !== "block"
        ? null
        : item.counter
          ? counterModel(item.footprint, item.height, item.tint ?? null)
          : furnitureModel(item);
    if (furniture) {
      furniture.name = item.name;
      furniture.position.set(item.x, item.y0, item.z);
      furniture.rotation.y = item.angle;
      furniture.userData["xz"] = [item.x, item.z];
      furniture.userData["itemId"] = item.id;
      return furniture;
    }
    if (item.shape !== "block") {
      const model = modelItem(item);
      model.name = item.name;
      model.position.set(item.x, item.y0, item.z);
      model.rotation.y = item.angle;
      model.userData["xz"] = [item.x, item.z];
      model.userData["itemId"] = item.id;
      return model;
    }
    const shape = floorShape(item.footprint);
    const geom = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.005, item.height),
      bevelEnabled: false,
      curveSegments: 4,
      UVGenerator: itemUvGenerator(item.width, item.depth),
    });
    geom.rotateX(-Math.PI / 2);
    const transparent = item.opacity < 0.999;
    const top = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.85,
      transparent,
      opacity: item.opacity,
    });
    if (item.topImage) top.map = texture(item.topImage);
    const side = new THREE.MeshStandardMaterial({
      color: item.color,
      roughness: 0.8,
      transparent,
      opacity: item.opacity,
    });
    if (item.light) {
      for (const m of [top, side]) {
        m.emissive = new THREE.Color(item.light.color);
        m.emissiveIntensity = 0.35 + 0.65 * item.light.level;
      }
    }
    const mesh = new THREE.Mesh(geom, [top, side]);
    mesh.name = item.name;
    mesh.position.set(item.x, item.y0, item.z);
    mesh.userData["xz"] = [item.x, item.z];
    mesh.userData["itemId"] = item.id;
    mesh.rotation.y = item.angle;
    mesh.castShadow = item.height > 0.03 && !item.light;
    mesh.receiveShadow = true;
    return mesh;
  }

  function buildFloor(spec: Floor3d, pointLights: Set<string>): FloorEntry {
    const group = new THREE.Group();
    group.name = spec.name;
    group.userData["floorId"] = spec.floorId;
    const walls = new THREE.Group();
    walls.name = "Walls";
    group.add(walls);
    fillWalls(walls, spec, () => true);
    const wallsKey = "plan";
    // Room floors.
    for (const slab of spec.slabs) {
      const geom = new THREE.ExtrudeGeometry(floorShape(slab.points), {
        depth: SLAB_M,
        bevelEnabled: false,
      });
      geom.rotateX(-Math.PI / 2);
      geom.translate(0, slab.y + (slab.outdoor ? -SLAB_M - 0.02 : -SLAB_M), 0);
      // A lid is painted like the walls' tops it lies flush with, so the
      // two read as one surface.
      const mat = new THREE.MeshStandardMaterial({
        color: slab.lid
          ? spec.wallColor
          : slab.tinted
            ? slab.color
            : dark
              ? "#8a8580"
              : "#ffffff",
        roughness: slab.lid ? 0.92 : slab.finish === "tile" ? 0.45 : 0.85,
        map: slab.finish === "plain" ? null : floorTexture(slab.finish),
      });
      if (slab.emissive) {
        mat.emissive = new THREE.Color(slab.emissive);
        mat.emissiveIntensity = slab.emissiveIntensity;
      }
      // Its edge and underside are the outside's where they show (a bay
      // overhanging the floor below), not the floor's finish.
      const edge = new THREE.MeshStandardMaterial({
        color: slab.lid
          ? spec.wallColor
          : slab.outdoor
            ? slab.color
            : spec.sidingColor,
        roughness: slab.lid ? 0.92 : 0.9,
      });
      const mesh = new THREE.Mesh(geom, [mat, edge]);
      mesh.name = slab.name || `Room ${slab.id}`;
      if (!slab.lid) mesh.userData["roomId"] = slab.id;
      mesh.receiveShadow = true;
      group.add(mesh);
      // Facing down: the shape in XY (z as y) turned so +Z looks down.
      const under = new THREE.ShapeGeometry(
        new THREE.Shape(slab.points.map(([x, z]) => new THREE.Vector2(x, z))),
      );
      under.rotateX(Math.PI / 2);
      under.translate(
        0,
        slab.y + (slab.outdoor ? -SLAB_M - 0.02 : -SLAB_M) - 0.01,
        0,
      );
      const underside = new THREE.Mesh(under, edge);
      underside.name = `${mesh.name} underside`;
      group.add(underside);
    }
    const furniture = new THREE.Group();
    furniture.name = "Furniture";
    group.add(furniture);
    // Apart from the furniture, so they keep lighting the scan model.
    const lights = new THREE.Group();
    lights.name = "Lights";
    group.add(lights);
    for (const item of spec.items) {
      furniture.add(buildItem(item, spec.baseY));
      if (item.light && pointLights.has(item.id)) {
        const light = new THREE.PointLight(
          item.light.color,
          1 + 3 * item.light.level,
          0,
          2,
        );
        light.name = `${item.name} light`;
        light.position.set(item.x, item.light.y, item.z);
        lights.add(light);
      }
    }
    const scanGroup = new THREE.Group();
    scanGroup.name = "Scans";
    group.add(scanGroup);
    return {
      spec,
      group,
      walls,
      wallsKey,
      furniture,
      scans: scanGroup,
      order: 0,
    };
  }

  function placeFloors(): void {
    for (const f of floors.values())
      f.group.position.y = f.spec.baseY + spread * f.order;
  }

  /** The visible building's bounds (ignores the ground). */
  function bounds(): THREE.Box3 {
    const box = new THREE.Box3();
    root.updateMatrixWorld(true);
    box.expandByObject(root, false);
    if (box.isEmpty())
      box.set(new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 3, 5));
    return box;
  }

  let sunDir = new THREE.Vector3(0.4, 0.8, 0.3);
  function placeSun(): void {
    const box = bounds();
    const center = box.getCenter(new THREE.Vector3());
    const radius = Math.max(
      4,
      box.getSize(new THREE.Vector3()).length() / 2 + 1,
    );
    sun.position.copy(center).addScaledVector(sunDir, radius * 2);
    sun.target.position.copy(center);
    const cam = sun.shadow.camera;
    cam.left = -radius;
    cam.right = radius;
    cam.top = radius;
    cam.bottom = -radius;
    cam.near = 0.1;
    cam.far = radius * 4;
    cam.updateProjectionMatrix();
    ground.position.x = center.x;
    ground.position.z = center.z;
  }

  function setScene(spec: Scene3d): void {
    dark = spec.dark;
    siteTerrain = spec.terrain;
    // Keep scans: they're re-parented into the rebuilt floors below.
    for (const s of scans.values()) s.group.removeFromParent();
    for (const f of floors.values()) {
      f.group.removeFromParent();
      disposeObject(f.group);
    }
    floors.clear();
    // The brightest linked lights get a real point light.
    const lit = spec.floors
      .flatMap((f) => f.items)
      .filter((i) => i.light)
      .sort((a, b) => b.light!.level - a.light!.level)
      .slice(0, MAX_POINT_LIGHTS);
    const pointLights = new Set(lit.map((i) => i.id));
    const ordered = [...spec.floors].sort((a, b) => a.baseY - b.baseY);
    ordered.forEach((f, i) => {
      const entry = buildFloor(f, pointLights);
      entry.order = i;
      floors.set(f.floorId, entry);
      root.add(entry.group);
    });
    placeFloors();
    for (const s of scans.values()) attachScan(s);
    applyWallHiding();

    // The same roof back (the building didn't change): keep its mesh.
    if (roof && roofSpec !== spec.roof) {
      roof.removeFromParent();
      roof.geometry.dispose();
      for (const m of roof.material as THREE.MeshStandardMaterial[]) {
        m.map?.dispose();
        m.dispose();
      }
      roof = null;
    }
    roofSpec = spec.roof;
    if (roof) roof.visible = spread === 0;
    else if (spec.roof) {
      const shingles = shingleTexture();
      shingles.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy(),
      );
      roof = new THREE.Mesh(roofGeometry(spec.roof), [
        new THREE.MeshStandardMaterial({
          vertexColors: true,
          map: shingles,
          roughness: 0.9,
          side: THREE.DoubleSide,
        }),
        new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.85,
          side: THREE.DoubleSide,
        }),
      ]);
      roof.name = "Roof";
      roof.castShadow = true;
      roof.receiveShadow = true;
      roof.visible = spread === 0;
      root.add(roof);
    }
    if (roofLightGroup) {
      roofLightGroup.removeFromParent();
      roofLightGroup.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        (mesh.material as THREE.Material | undefined)?.dispose();
      });
      roofLightGroup = null;
    }
    if (spec.roofLights?.length) {
      roofLightGroup = buildRoofLights(spec.roofLights);
      roofLightGroup.visible = spread === 0;
      root.add(roofLightGroup);
    }
    applyWallHiding();

    if (terrain) {
      terrain.removeFromParent();
      terrain.geometry.dispose();
      terrain = null;
    }
    ground.visible = !spec.terrain;
    if (spec.terrain) {
      terrainBox = bounds();
      terrain = new THREE.Mesh(
        terrainGeometry(spec.terrain, terrainBox),
        groundMat,
      );
      terrain.name = "Ground";
      terrain.receiveShadow = true;
      scene.add(terrain);
    }

    scene.background = new THREE.Color(spec.background);
    groundMat.color.set(spec.dark ? "#2c3229" : "#c9d4c0");
    hemi.color.set(spec.ambient.sky);
    hemi.groundColor.set(spec.ambient.ground);
    hemi.intensity = spec.ambient.intensity * AMBIENT_SCALE;
    if (spec.sun) {
      sun.visible = true;
      sun.color.set(spec.sun.color);
      sun.intensity = spec.sun.intensity * SUN_SCALE;
      sunDir = new THREE.Vector3(...spec.sun.dir).normalize();
    } else {
      sun.visible = false;
    }
    placeSun();
    if (!fitted) {
      fitted = true;
      view("orbit");
    }
    invalidate();
  }

  // --- camera -------------------------------------------------------------

  function view(kind: "orbit" | "top" | "fit"): void {
    const box = bounds();
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const span = Math.max(size.x, size.z, 4);
    const fov = camera.fov * RAD;
    const dist = (span / 2 / Math.tan(fov / 2)) * (kind === "top" ? 1.1 : 1.25);
    controls.target.copy(center);
    if (kind === "top") {
      // A hair off vertical, from the plan's bottom, so north-up stays up.
      camera.position.set(center.x, center.y + dist, center.z + dist * 0.001);
    } else if (kind === "fit") {
      const dir = camera.position.clone().sub(controls.target).normalize();
      camera.position.copy(center).addScaledVector(dir, dist);
    } else {
      // Three-quarter view from the plan's bottom-left.
      const dir = new THREE.Vector3(-0.55, 0.85, 0.75).normalize();
      camera.position.copy(center).addScaledVector(dir, dist);
    }
    camera.near = Math.max(0.02, dist / 500);
    camera.far = dist * 20 + 500;
    camera.updateProjectionMatrix();
    controls.update();
    invalidate();
  }

  // --- scans ----------------------------------------------------------------

  const loader = new GLTFLoader();

  function applyPlacement(s: ScanEntry): void {
    const p = s.placement;
    s.group.position.set(p.x, p.elevation, p.z);
    s.group.rotation.set(0, -p.rotationDeg * RAD, 0);
    s.group.scale.setScalar(p.scale);
    s.group.visible = p.visible;
    for (const m of s.materials) {
      const op = m.opacity * p.opacity;
      m.material.transparent = m.transparent || op < 0.999;
      m.material.opacity = op;
      m.material.depthWrite = op >= 0.999;
      m.material.needsUpdate = true;
    }
  }

  function attachScan(s: ScanEntry): void {
    const floor = floors.get(s.placement.floorId);
    if (floor) floor.scans.add(s.group);
    else s.group.removeFromParent();
  }

  /** The plan's walls and furniture give way to a floor's shown scan in
   * "scan" mode (or for a scan set to replace the walls); in "plan" mode
   * the scan shows only its stairs. */
  function applyWallHiding(): void {
    for (const [floorId, f] of floors) {
      const shown = [...scans.values()].filter(
        (s) =>
          s.placement.floorId === floorId && s.placement.visible && s.content,
      );
      const scanModel = scanMode === "scan" && shown.length > 0;
      f.walls.visible = !shown.some((s) => s.placement.hideWalls);
      // Likewise furniture: hidden where the scan has a floor of its own
      // (its objects stand in), kept elsewhere.
      const floorsCovered = scanModel ? scanFloorBoxes(shown) : [];
      for (const item of f.furniture.children) {
        const [x, z] = (item.userData["xz"] as [number, number]) ?? [0, 0];
        item.visible = !floorsCovered.some(
          (c) => x >= c.min.x && x <= c.max.x && z >= c.min.z && z <= c.max.z,
        );
      }
      // The scan model replaces the plan's walls only where the scan has
      // walls of its own: parts it never covered (an unscanned garage)
      // keep the plan's.
      const key = scanModel
        ? JSON.stringify(shown.map((s) => s.placement))
        : "plan";
      if (f.wallsKey !== key) {
        f.wallsKey = key;
        const cover = scanModel ? scanWallBoxes(shown) : [];
        const reach = 0.35;
        fillWalls(
          f.walls,
          f.spec,
          (b) =>
            !cover.some(
              (c) =>
                b.x >= c.min.x - reach &&
                b.x <= c.max.x + reach &&
                b.z >= c.min.z - reach &&
                b.z <= c.max.z + reach,
            ),
        );
      }
    }
    for (const s of scans.values()) {
      s.content?.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        const part = mesh.userData["scanPart"] as string;
        // Under the roof the plan's building stands whole: a scan's stairs
        // would only poke out through its walls and roof.
        mesh.visible =
          part !== "ceiling" &&
          part !== "floor" &&
          (scanMode === "scan" ||
            (part === "stairs" &&
              !roof?.visible &&
              !planStairsAt(s.placement.floorId)));
      });
    }
  }

  /** The plan models the stairs on this floor or a floor next to it (a
   * flight up to it, or down into it): a scan's own stairs there would
   * double them. */
  function planStairsAt(floorId: string): boolean {
    const ordered = [...floors.values()].sort((a, b) => a.order - b.order);
    const i = ordered.findIndex((f) => f.spec.floorId === floorId);
    return [i - 1, i, i + 1].some((k) => !!ordered[k]?.spec.hasStairs);
  }

  /** World-space boxes of the shown scans' room floors. */
  function scanFloorBoxes(shown: ScanEntry[]): THREE.Box3[] {
    root.updateMatrixWorld(true);
    const out: THREE.Box3[] = [];
    for (const s of shown)
      s.content?.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh && mesh.userData["scanPart"] === "floor")
          out.push(new THREE.Box3().setFromObject(mesh));
      });
    return out;
  }

  /** World-space boxes of the shown scans' walls, doors and windows. */
  function scanWallBoxes(shown: ScanEntry[]): THREE.Box3[] {
    root.updateMatrixWorld(true);
    const out: THREE.Box3[] = [];
    for (const s of shown) {
      s.content?.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh || mesh.userData["scanPart"] !== "other") return;
        let named: THREE.Object3D | null = mesh;
        while (named && !named.name) named = named.parent;
        if (!/wall|transition|joint|door|window/i.test(named?.name ?? ""))
          return;
        out.push(new THREE.Box3().setFromObject(mesh));
      });
    }
    return out;
  }

  /** Vertices to align with (≤ 40k) and the scan's wall grid angle. */
  function analyse(s: ScanEntry, content: THREE.Object3D): void {
    content.updateMatrixWorld(true);
    const meshes: THREE.Mesh[] = [];
    let vertexCount = 0;
    content.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry?.attributes["position"]) {
        meshes.push(mesh);
        vertexCount += mesh.geometry.attributes["position"].count;
      }
    });
    const stride = Math.max(1, Math.ceil(vertexCount / 40000));
    const out: number[] = [];
    const v = new THREE.Vector3();
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();
    const n = new THREE.Vector3();
    const angles: { angle: number; weight: number }[] = [];
    for (const mesh of meshes) {
      const pos = mesh.geometry.attributes["position"] as THREE.BufferAttribute;
      const m = mesh.matrixWorld;
      for (let i = 0; i < pos.count; i += stride) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m);
        out.push(v.x, v.y, v.z);
      }
      // Wall-facing triangles vote for the grid angle.
      const index = mesh.geometry.index;
      const triCount = index ? index.count / 3 : pos.count / 3;
      const triStride = Math.max(1, Math.ceil(triCount / 60000));
      for (let t = 0; t < triCount; t += triStride) {
        const i0 = index ? index.getX(t * 3) : t * 3;
        const i1 = index ? index.getX(t * 3 + 1) : t * 3 + 1;
        const i2 = index ? index.getX(t * 3 + 2) : t * 3 + 2;
        a.fromBufferAttribute(pos, i0).applyMatrix4(m);
        b.fromBufferAttribute(pos, i1).applyMatrix4(m);
        c.fromBufferAttribute(pos, i2).applyMatrix4(m);
        n.subVectors(c, b).cross(a.clone().sub(b));
        const area = n.length() / 2;
        if (area <= 0) continue;
        n.normalize();
        if (Math.abs(n.y) > 0.3) continue;
        // The wall runs perpendicular to its normal.
        angles.push({ angle: Math.atan2(n.z, n.x) / RAD + 90, weight: area });
      }
    }
    s.samples = new Float32Array(out);
    s.angle = dominantAngle(angles);
  }

  function loadScan(s: ScanEntry): void {
    const id = s.placement.id;
    options.onScanStatus?.(id, "loading");
    options
      .fetchScan(id)
      .then(
        (buf) =>
          new Promise<THREE.Object3D>((resolve, reject) =>
            loader.parse(buf, "", (gltf) => resolve(gltf.scene), reject),
          ),
      )
      .then((content) => {
        if (destroyed || scans.get(id) !== s) {
          disposeObject(content, false);
          return;
        }
        content.name = "Scan";
        content.traverse((o) => {
          const mesh = o as THREE.Mesh;
          if (!mesh.isMesh) return;
          mesh.userData["scanId"] = id;
          mesh.userData["scanPart"] = scanPart(mesh);
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          for (const material of mats) {
            material.side = THREE.DoubleSide;
            // Drawn over the room slabs it lies on, not fighting them.
            material.polygonOffset = true;
            material.polygonOffsetFactor = -2;
            material.polygonOffsetUnits = -2;
            s.materials.push({
              material,
              opacity: material.opacity,
              transparent: material.transparent,
            });
          }
        });
        // In its own frame: before it joins the placed group.
        analyse(s, content);
        s.content = content;
        s.group.add(content);
        applyPlacement(s);
        applyWallHiding();
        placeSun();
        options.onScanStatus?.(id, "ready");
        invalidate();
      })
      .catch((err: unknown) => {
        options.onScanStatus?.(
          id,
          "error",
          (err as { message?: string })?.message ?? String(err),
        );
      });
  }

  function setScans(list: ScanPlacement3d[]): void {
    const ids = new Set(list.map((p) => p.id));
    for (const [id, s] of scans) {
      if (ids.has(id)) continue;
      s.group.removeFromParent();
      disposeObject(s.group, false);
      scans.delete(id);
    }
    for (const placement of list) {
      let s = scans.get(placement.id);
      if (!s) {
        const group = new THREE.Group();
        group.name = `Scan ${placement.id}`;
        s = {
          placement,
          group,
          content: null,
          samples: null,
          angle: null,
          materials: [],
        };
        scans.set(placement.id, s);
        loadScan(s);
      }
      const moved = s.placement.floorId !== placement.floorId;
      s.placement = placement;
      if (moved || !s.group.parent) attachScan(s);
      applyPlacement(s);
    }
    applyWallHiding();
    invalidate();
  }

  /** The plan's wall faces on a scan's floor, in a frame turned so the
   * building's grid is axis-aligned: lines of constant u or v. */
  function wallLines(floor: FloorEntry, frameDeg: number) {
    const cos = Math.cos(-frameDeg * RAD);
    const sin = Math.sin(-frameDeg * RAD);
    const toFrame = ([x, z]: Vec2): Vec2 => [
      x * cos - z * sin,
      x * sin + z * cos,
    ];
    const uLines: WallLine[] = [];
    const vLines: WallLine[] = [];
    for (const face of floor.spec.wallFaces) {
      const [pu, pv] = toFrame(face.a);
      const [qu, qv] = toFrame(face.b);
      const [nu, nv] = toFrame(face.normal);
      const du = qu - pu;
      const dv = qv - pv;
      const len = Math.hypot(du, dv);
      if (len < 0.2) continue;
      if (Math.abs(dv) / len < 0.05)
        vLines.push({
          at: (pv + qv) / 2,
          from: Math.min(pu, qu),
          to: Math.max(pu, qu),
          facing: Math.sign(nv),
        });
      else if (Math.abs(du) / len < 0.05)
        uLines.push({
          at: (pu + qu) / 2,
          from: Math.min(pv, qv),
          to: Math.max(pv, qv),
          facing: Math.sign(nu),
        });
    }
    return { uLines, vLines, toFrame, cos, sin };
  }

  function planGridAngle(floor: FloorEntry): number {
    return (
      dominantAngle(
        floor.spec.wallFaces.map(({ a: [x1, z1], b: [x2, z2] }) => ({
          angle: Math.atan2(z2 - z1, x2 - x1) / RAD,
          weight: Math.hypot(x2 - x1, z2 - z1),
        })),
      ) ?? 0
    );
  }

  /** Where the scan should move to put its outer edges on the nearest
   * wall faces (within `reach`), for a pose. */
  function snapPose(s: ScanEntry, pose: ScanPose, reach: number): ScanPose {
    const floor = floors.get(s.placement.floorId);
    if (!floor || !s.samples || s.samples.length < 9) return pose;
    const grid = planGridAngle(floor);
    const { uLines, vLines, toFrame, cos, sin } = wallLines(floor, grid);
    if (!uLines.length && !vLines.length) return pose;
    const r = pose.rotationDeg * RAD;
    const rc = Math.cos(r);
    const rs = Math.sin(r);
    const k = s.placement.scale;
    const n = s.samples.length / 3;
    const us = new Float32Array(n);
    const vs = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const lx = s.samples[i * 3]! * k;
      const lz = s.samples[i * 3 + 2]! * k;
      const [u, v] = toFrame([
        pose.x + lx * rc - lz * rs,
        pose.z + lx * rs + lz * rc,
      ]);
      us[i] = u;
      vs[i] = v;
    }
    us.sort();
    vs.sort();
    // Robust extents: a stray point outside a window shouldn't count.
    const u0 = percentile(us, 0.01);
    const u1 = percentile(us, 0.99);
    const v0 = percentile(vs, 0.01);
    const v1 = percentile(vs, 0.99);
    // The scan's low edge is a wall surface looking toward +u (into the
    // room), so it can only sit on a face looking the same way; likewise
    // the high edge.
    const best = (
      lines: WallLine[],
      edges: [number, number][],
      lo: number,
      hi: number,
    ) => {
      let shift = 0;
      let dist = reach;
      for (const line of lines) {
        // Only walls that run alongside the scan.
        if (line.to < lo - 0.3 || line.from > hi + 0.3) continue;
        for (const [e, facing] of edges) {
          if (line.facing !== facing) continue;
          const d = line.at - e;
          if (Math.abs(d) < Math.abs(dist)) {
            dist = d;
            shift = d;
          }
        }
      }
      return Math.abs(dist) < reach ? shift : 0;
    };
    const du = best(
      uLines,
      [
        [u0, 1],
        [u1, -1],
      ],
      v0,
      v1,
    );
    const dv = best(
      vLines,
      [
        [v0, 1],
        [v1, -1],
      ],
      u0,
      u1,
    );
    // Back from the frame to world: rotate (du, dv) by +grid.
    return {
      ...pose,
      x: pose.x + du * cos + dv * sin,
      z: pose.z - du * sin + dv * cos,
    };
  }

  function autoAlignScan(id: string): void {
    const s = scans.get(id);
    const floor = s ? floors.get(s.placement.floorId) : undefined;
    if (!s || !floor || !s.samples) return;
    let rotationDeg = s.placement.rotationDeg;
    if (s.angle !== null) {
      const grid = planGridAngle(floor);
      // world angle = local angle + rotation; nearest rotation that lines
      // the scan's grid up with the plan's.
      const base = grid - s.angle;
      const turns = Math.round((rotationDeg - base) / 90);
      rotationDeg = base + turns * 90;
    }
    let pose: ScanPose = { x: s.placement.x, z: s.placement.z, rotationDeg };
    // Twice: the second pass settles the axis the first one moved across.
    pose = snapPose(s, pose, AUTO_SNAP_M);
    pose = snapPose(s, pose, AUTO_SNAP_M);
    pose.elevation = -scanFloorOffset(s) * s.placement.scale;
    s.placement = { ...s.placement, ...pose };
    applyPlacement(s);
    invalidate();
    options.onScanMove?.(id, pose, true);
  }

  /** The lowest few percent of a scan's points: where its floor is. */
  function scanFloorOffset(s: ScanEntry): number {
    if (!s.samples) return 0;
    const n = s.samples.length / 3;
    const ys = new Float32Array(n);
    for (let i = 0; i < n; i++) ys[i] = s.samples[i * 3 + 1]!;
    ys.sort();
    return percentile(ys, 0.02);
  }

  // --- dragging a scan --------------------------------------------------------

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let drag: {
    id: string;
    plane: THREE.Plane;
    offset: THREE.Vector3;
    pointerId: number;
  } | null = null;

  function setPointer(e: PointerEvent): void {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
  }

  const onPointerDown = (e: PointerEvent) => {
    if (!editScanId || e.button !== 0) return;
    const s = scans.get(editScanId);
    if (!s?.content || !s.group.visible) return;
    setPointer(e);
    const hit = raycaster.intersectObject(s.content, true)[0];
    if (!hit) return;
    const y = s.group.getWorldPosition(new THREE.Vector3()).y;
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -y);
    const at = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
    if (!at) return;
    const parent = s.group.parent;
    const local = parent ? parent.worldToLocal(at.clone()) : at.clone();
    drag = {
      id: s.placement.id,
      plane,
      offset: new THREE.Vector3(
        s.placement.x - local.x,
        0,
        s.placement.z - local.z,
      ),
      pointerId: e.pointerId,
    };
    controls.enabled = false;
    renderer.domElement.setPointerCapture(e.pointerId);
    e.stopPropagation();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const s = scans.get(drag.id);
    if (!s) return;
    setPointer(e);
    const at = raycaster.ray.intersectPlane(drag.plane, new THREE.Vector3());
    if (!at) return;
    const local = s.group.parent ? s.group.parent.worldToLocal(at.clone()) : at;
    let pose: ScanPose = {
      x: local.x + drag.offset.x,
      z: local.z + drag.offset.z,
      rotationDeg: s.placement.rotationDeg,
    };
    if (editSnap && !e.shiftKey) pose = snapPose(s, pose, DRAG_SNAP_M);
    s.placement = { ...s.placement, ...pose };
    applyPlacement(s);
    invalidate();
    options.onScanMove?.(drag.id, pose, false);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const s = scans.get(drag.id);
    if (s) {
      options.onScanMove?.(
        drag.id,
        {
          x: s.placement.x,
          z: s.placement.z,
          rotationDeg: s.placement.rotationDeg,
        },
        true,
      );
    }
    drag = null;
    controls.enabled = true;
  };

  const canvas = renderer.domElement;
  // Capture phase: ahead of OrbitControls' own listener.
  canvas.addEventListener("pointerdown", onPointerDown, true);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  // --- editing -----------------------------------------------------------------

  /** The floor being edited (null: not editing). */
  let editFloorId: string | null = null;
  let editOverlay: EditOverlay = {};
  const overlayGroup = new THREE.Group();
  overlayGroup.name = "Edit overlay";
  overlayGroup.renderOrder = 999;
  scene.add(overlayGroup);
  /** The handles' pick spheres, by index. */
  let handleMeshes: THREE.Mesh[] = [];
  /** Every handle's meshes, kept the same size on screen. */
  let handleDots: THREE.Mesh[] = [];

  /** Scales the handles by their distance from the camera, so they stay
   * grabbable however far out the view is. */
  function sizeHandles(): void {
    if (!handleDots.length) return;
    const at = new THREE.Vector3();
    for (const mesh of handleDots) {
      mesh.getWorldPosition(at);
      mesh.scale.setScalar(Math.max(1, camera.position.distanceTo(at) / 12));
      mesh.updateMatrixWorld(true);
    }
  }
  let editDragId: number | null = null;
  let editDown: { x: number; y: number; id: number; moved: boolean } | null =
    null;
  let hoverQueued: PointerEvent | null = null;

  const SELECT_COLOR = "#1e88e5";
  const HOVER_COLOR = "#ffb300";

  function editEntry(): FloorEntry | undefined {
    return editFloorId ? floors.get(editFloorId) : undefined;
  }

  function shownChain(o: THREE.Object3D | null): boolean {
    for (let n = o; n; n = n.parent) {
      if (!n.visible) return false;
      if (n.name === "Scans" || n === overlayGroup) return false;
    }
    return true;
  }

  /** What's under the pointer, in the edit floor's frame. */
  function editHitAt(e: { clientX: number; clientY: number }): EditHit {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const entry = editEntry();
    const floorY = entry ? entry.group.position.y : 0;
    const handleHit = raycaster.intersectObjects(handleMeshes, false)[0];
    const handle = handleHit
      ? handleMeshes.indexOf(handleHit.object as THREE.Mesh)
      : null;
    const groups = [...floors.values()].map((f) => f.group);
    const hits = raycaster
      .intersectObjects(groups, true)
      .filter((h) => shownChain(h.object));
    const h = hits[0];
    let ref: EditRef | null = null;
    let floorId: string | null = null;
    if (h) {
      for (let n: THREE.Object3D | null = h.object; n; n = n.parent) {
        const ud = n.userData;
        if (!ref && typeof ud["itemId"] === "string")
          ref = { kind: "item", id: ud["itemId"] as string };
        if (!ref && typeof ud["roomId"] === "string")
          ref = { kind: "room", id: ud["roomId"] as string };
        if (typeof ud["floorId"] === "string") {
          floorId = ud["floorId"] as string;
          break;
        }
      }
      const boxes = h.object.userData["boxes"] as Box3d[] | undefined;
      if (!ref && boxes && h.faceIndex != null)
        ref = boxes[Math.floor(h.faceIndex / 12)]?.ref ?? null;
    }
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -floorY);
    const at = raycaster.ray.intersectPlane(plane, new THREE.Vector3());
    const n = h?.face?.normal
      ? h.face.normal.clone().transformDirection(h.object.matrixWorld)
      : null;
    return {
      ref,
      point: h ? [h.point.x, h.point.y - floorY, h.point.z] : null,
      normal: n ? [n.x, n.y, n.z] : null,
      floor: at ? [at.x, at.z] : null,
      handle: handle !== null && handle >= 0 ? handle : null,
      floorId,
      ray: {
        o: [
          raycaster.ray.origin.x,
          raycaster.ray.origin.y - floorY,
          raycaster.ray.origin.z,
        ],
        d: [
          raycaster.ray.direction.x,
          raycaster.ray.direction.y,
          raycaster.ray.direction.z,
        ],
      },
    };
  }

  function sendEdit(
    type: EditPointer["type"],
    e: PointerEvent | MouseEvent,
  ): boolean {
    if (!options.onEditPointer) return false;
    const r = options.onEditPointer({
      type,
      hit: editHitAt(e),
      shift: e.shiftKey,
      alt: e.altKey,
      ctrl: e.ctrlKey || e.metaKey,
      button: e.button,
    });
    return r === true;
  }

  const onEditDown = (e: PointerEvent) => {
    if (!editFloorId || e.button !== 0) return;
    editDown = { x: e.clientX, y: e.clientY, id: e.pointerId, moved: false };
    if (sendEdit("down", e)) {
      editDragId = e.pointerId;
      controls.enabled = false;
      renderer.domElement.setPointerCapture(e.pointerId);
      e.stopPropagation();
    }
  };
  const onEditMove = (e: PointerEvent) => {
    if (!editFloorId) return;
    if (
      editDown &&
      e.pointerId === editDown.id &&
      Math.hypot(e.clientX - editDown.x, e.clientY - editDown.y) > 4
    )
      editDown.moved = true;
    if (editDragId === e.pointerId) {
      sendEdit("drag", e);
      return;
    }
    if (e.buttons !== 0) return;
    // Hover at most once a frame.
    const queued = hoverQueued;
    hoverQueued = e;
    if (!queued)
      requestAnimationFrame(() => {
        const last = hoverQueued;
        hoverQueued = null;
        if (last && editFloorId) sendEdit("move", last);
      });
  };
  const onEditUp = (e: PointerEvent) => {
    if (!editFloorId) return;
    const wasDrag = editDragId === e.pointerId;
    if (wasDrag) {
      sendEdit("up", e);
      editDragId = null;
      controls.enabled = true;
    }
    if (editDown && editDown.id === e.pointerId && !editDown.moved)
      sendEdit("click", e);
    editDown = null;
  };
  const onEditDblClick = (e: MouseEvent) => {
    if (!editFloorId) return;
    sendEdit("dblclick", e);
  };

  function clearOverlay(): void {
    for (const child of [...overlayGroup.children]) {
      overlayGroup.remove(child);
      child.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[];
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
    }
    handleMeshes = [];
    handleDots = [];
  }

  /** Box outlines (and a faint fill) over the boxes, in a colour. */
  function outlineBoxes(boxes: Box3d[], color: string, fill: number): void {
    for (const b of boxes) {
      const grown = {
        ...b,
        length: b.length + 0.02,
        depth: b.depth + 0.02,
        y0: b.y0 - 0.01,
        y1: b.y1 + 0.01,
      };
      const g = boxGeometry(grown);
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(g),
        new THREE.LineBasicMaterial({
          color,
          depthTest: false,
          transparent: true,
          opacity: 0.95,
        }),
      );
      edges.renderOrder = 1000;
      overlayGroup.add(edges);
      if (fill > 0) {
        const mesh = new THREE.Mesh(
          g,
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: fill,
            depthWrite: false,
          }),
        );
        mesh.renderOrder = 999;
        overlayGroup.add(mesh);
      } else g.dispose();
    }
  }

  /** The boxes drawn for a plan thing on the edit floor. */
  function refBoxes(entry: FloorEntry, ref: EditRef): Box3d[] {
    if (ref.kind === "wall" || ref.kind === "opening") {
      const match = (b: Box3d) =>
        b.ref?.kind === ref.kind &&
        b.ref.id === ref.id &&
        (ref.seg === undefined || b.ref.seg === ref.seg);
      return [
        ...entry.spec.walls.filter(match),
        ...entry.spec.panes.map((p) => p.box).filter(match),
      ];
    }
    if (ref.kind === "item") {
      const obj = entry.furniture.children.find(
        (c) => c.userData["itemId"] === ref.id,
      );
      if (!obj) return [];
      // Its own (unturned) bounds, turned with it.
      const item = entry.spec.items.find((i) => i.id === ref.id);
      if (!item) return [];
      return [
        {
          x: obj.position.x,
          z: obj.position.z,
          y0: item.y0,
          y1: item.y0 + Math.max(0.05, item.height),
          length: item.width,
          depth: item.depth,
          angle: obj.rotation.y,
        },
      ];
    }
    return [];
  }

  function drawRef(ref: EditRef, color: string, fill: number): void {
    const entry = editEntry();
    if (!entry) return;
    // A site item: its outline traced over the ground.
    const siteItem =
      ref.kind === "item"
        ? entry.spec.items.find((i) => i.id === ref.id && i.site)
        : undefined;
    const siteObj = siteItem
      ? entry.furniture.children.find((c) => c.userData["itemId"] === ref.id)
      : undefined;
    if (siteItem?.site && siteObj) {
      const a = siteObj.rotation.y;
      const ox = siteObj.position.x;
      const oz = siteObj.position.z;
      const corners = siteItem.site.points.map(([lx, lz]): [number, number] => [
        ox + lx * Math.cos(a) + lz * Math.sin(a),
        oz - lx * Math.sin(a) + lz * Math.cos(a),
      ]);
      if (siteItem.site.closed && corners.length > 2) corners.push(corners[0]!);
      // Each edge sampled every 25 cm, so the line rides the ground's
      // rise and fall rather than cutting through it.
      const at = (x: number, z: number) =>
        new THREE.Vector3(
          x,
          groundAt(siteTerrain, x, z) - entry.spec.baseY + 0.08,
          z,
        );
      const pts: THREE.Vector3[] = [];
      corners.forEach(([x, z], k) => {
        const prev = corners[k - 1];
        if (prev) {
          const n = Math.min(400, Math.ceil(Math.hypot(x - prev[0], z - prev[1]) / 0.25));
          for (let s = 1; s < n; s++) {
            const t = s / n;
            pts.push(at(prev[0] + (x - prev[0]) * t, prev[1] + (z - prev[1]) * t));
          }
        }
        pts.push(at(x, z));
      });
      const geom = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({
        color,
        depthTest: false,
        transparent: true,
      });
      const line = new THREE.Line(geom, lineMat);
      line.renderOrder = 1000;
      overlayGroup.add(line);
      return;
    }
    if (ref.kind === "room") {
      const slab = entry.spec.slabs.find((s) => s.id === ref.id);
      if (!slab) return;
      const pts = slab.points.map(
        ([x, z]) => new THREE.Vector3(x, slab.y + 0.02, z),
      );
      const line = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({
          color,
          depthTest: false,
          transparent: true,
        }),
      );
      line.renderOrder = 1000;
      overlayGroup.add(line);
      if (fill > 0) {
        const shape = new THREE.Shape(
          slab.points.map(([x, z]) => new THREE.Vector2(x, z)),
        );
        const g = new THREE.ShapeGeometry(shape);
        g.rotateX(Math.PI / 2);
        g.translate(0, slab.y + 0.015, 0);
        const mesh = new THREE.Mesh(
          g,
          new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: fill,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
        );
        overlayGroup.add(mesh);
      }
      return;
    }
    outlineBoxes(refBoxes(entry, ref), color, fill);
  }

  function applyOverlay(): void {
    clearOverlay();
    const entry = editEntry();
    if (!entry) {
      invalidate();
      return;
    }
    overlayGroup.position.y = entry.group.position.y;
    const o = editOverlay;
    if (o.hover && !(o.select && sameRef(o.hover, o.select)))
      drawRef(o.hover, HOVER_COLOR, 0.12);
    if (o.select) drawRef(o.select, SELECT_COLOR, 0.18);
    if (o.ghost?.length) {
      for (const b of o.ghost) {
        const mesh = new THREE.Mesh(
          boxGeometry(b),
          new THREE.MeshBasicMaterial({
            color: "#43a047",
            transparent: true,
            opacity: 0.45,
            depthWrite: false,
          }),
        );
        mesh.renderOrder = 998;
        overlayGroup.add(mesh);
      }
      outlineBoxes(o.ghost, "#2e7d32", 0);
    }
    for (const guide of o.guides ?? []) {
      if (guide.points.length < 2) continue;
      const l = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
          guide.points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
        ),
        new THREE.LineDashedMaterial({
          color: guide.color,
          dashSize: 0.12,
          gapSize: 0.08,
          depthTest: false,
          transparent: true,
        }),
      );
      l.computeLineDistances();
      l.renderOrder = 1001;
      overlayGroup.add(l);
    }
    for (const path of o.paths ?? []) {
      if (path.points.length < 2) continue;
      const l = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
          path.points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
        ),
        new THREE.LineBasicMaterial({
          color: path.color,
          depthTest: false,
          transparent: true,
          opacity: 0.9,
        }),
      );
      l.renderOrder = 1001;
      overlayGroup.add(l);
    }
    for (const line of o.lines ?? []) {
      if (line.length < 2) continue;
      const l = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(
          line.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
        ),
        new THREE.LineBasicMaterial({
          color: "#e53935",
          depthTest: false,
          transparent: true,
        }),
      );
      l.renderOrder = 1001;
      overlayGroup.add(l);
    }
    (o.handles ?? []).forEach(([x, y, z], k) => {
      const active = o.activeHandle === k;
      const minor = o.minorFrom != null && k >= o.minorFrom;
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(minor ? 0.05 : 0.075, 16, 12),
        new THREE.MeshBasicMaterial({
          color: active ? "#ff7043" : minor ? SELECT_COLOR : "#ffffff",
          depthTest: false,
          transparent: true,
          opacity: minor ? 0.75 : 1,
        }),
      );
      dot.position.set(x, y, z);
      dot.renderOrder = 1002;
      const ring = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 12),
        new THREE.MeshBasicMaterial({
          color: SELECT_COLOR,
          depthTest: false,
          transparent: true,
          opacity: 0.9,
          side: THREE.BackSide,
        }),
      );
      ring.position.set(x, y, z);
      ring.renderOrder = 1001;
      // A larger, unseen sphere to grab it by.
      const pick = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 8, 6),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      pick.position.set(x, y, z);
      overlayGroup.add(ring, dot, pick);
      pick.updateMatrixWorld(true);
      handleMeshes.push(pick);
      handleDots.push(ring, dot, pick);
    });
    overlayGroup.updateMatrixWorld(true);
    sizeHandles();
    invalidate();
  }

  function sameRef(a: EditRef, b: EditRef): boolean {
    return a.kind === b.kind && a.id === b.id;
  }

  const canvasEl = renderer.domElement;
  canvasEl.addEventListener("pointerdown", onEditDown, true);
  canvasEl.addEventListener("pointermove", onEditMove);
  canvasEl.addEventListener("pointerup", onEditUp);
  canvasEl.addEventListener("pointercancel", onEditUp);
  canvasEl.addEventListener("dblclick", onEditDblClick);

  // --- export ---------------------------------------------------------------

  async function exportGlb(): Promise<Blob> {
    const exporter = new GLTFExporter();
    const result = await exporter.parseAsync(root, {
      binary: true,
      onlyVisible: true,
      maxTextureSize: 1024,
    });
    return new Blob([result as ArrayBuffer], { type: "model/gltf-binary" });
  }

  return {
    setScene(spec) {
      setScene(spec);
      applyOverlay();
    },
    setScans,
    setEditFloor(floorId) {
      editFloorId = floorId;
      if (!floorId) {
        editOverlay = {};
        editDragId = null;
        controls.enabled = true;
      }
      canvasEl.style.cursor = floorId ? "default" : "";
      applyOverlay();
    },
    toScreen(x, y, z) {
      const entry = editEntry();
      const v = new THREE.Vector3(x, y + (entry?.group.position.y ?? 0), z);
      v.project(camera);
      if (v.z > 1) return null;
      const el = renderer.domElement;
      return [
        ((v.x + 1) / 2) * el.clientWidth,
        ((1 - v.y) / 2) * el.clientHeight,
      ];
    },
    groundHeight(x, z) {
      const entry = editEntry();
      return groundAt(siteTerrain, x, z) - (entry?.spec.baseY ?? 0);
    },
    previewGrade(grid) {
      if (!siteTerrain || !terrain || !terrainBox) return;
      siteTerrain = { ...siteTerrain, grid };
      const old = terrain.geometry;
      terrain.geometry = terrainGeometry(siteTerrain, terrainBox);
      old.dispose();
      invalidate();
    },
    setEditOverlay(overlay) {
      editOverlay = overlay;
      applyOverlay();
    },
    previewItem(id, x, z, angle) {
      const obj = editEntry()?.furniture.children.find(
        (c) => c.userData["itemId"] === id,
      );
      if (!obj) return;
      obj.position.x = x;
      obj.position.z = z;
      obj.rotation.y = angle;
      applyOverlay();
    },
    setScanMode(mode) {
      if (mode === scanMode) return;
      scanMode = mode;
      applyWallHiding();
      invalidate();
    },
    setEditScan(id, snap) {
      editScanId = id;
      editSnap = snap;
      canvas.style.cursor = id ? "move" : "";
    },
    autoAlignScan,
    setSpread(metres) {
      spread = metres;
      if (roof) roof.visible = spread === 0;
      if (roofLightGroup) roofLightGroup.visible = spread === 0;
      applyWallHiding();
      placeFloors();
      placeSun();
      applyOverlay();
      invalidate();
    },
    view,
    lookAt(eye, target) {
      fitted = true;
      controls.target.set(...target);
      camera.position.set(...eye);
      const dist = camera.position.distanceTo(controls.target);
      camera.near = Math.max(0.02, dist / 500);
      camera.far = dist * 20 + 500;
      camera.updateProjectionMatrix();
      controls.update();
      invalidate();
    },
    exportGlb,
    resize,
    destroy() {
      destroyed = true;
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown, true);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvasEl.removeEventListener("pointerdown", onEditDown, true);
      canvasEl.removeEventListener("pointermove", onEditMove);
      canvasEl.removeEventListener("pointerup", onEditUp);
      canvasEl.removeEventListener("pointercancel", onEditUp);
      canvasEl.removeEventListener("dblclick", onEditDblClick);
      controls.dispose();
      disposeObject(scene, false);
      for (const t of textures.values()) t.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

const glue: View3dModule = { createView3d, supportsWebgl };
export default glue;
export { createView3d, supportsWebgl };
