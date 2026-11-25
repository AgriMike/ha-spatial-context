/** People in the 3D view (see view3d-api.ts's Person3d): each one a plain
 * figure standing where Bermuda puts them, in their colour, under a disc
 * with their initials (or picture) and their name, which always face the
 * camera and keep a readable size however far out the view is. Walls and
 * the roof hide the figure, but the disc and name still show through them,
 * faintly, so everyone in the house can be found from outside it.
 *
 * Kept apart from the building (not under its root), so a scene rebuild
 * leaves people where they are and an export leaves them out. They glide
 * when they move, and grow out of (and sink back into) the floor when they
 * arrive or leave. */

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Person3d } from "./view3d-api";

/** The figure: how tall (metres). */
const FIGURE_TOP_M = 1.69;
/** The disc's bottom, above the floor. */
const BADGE_Y_M = FIGURE_TOP_M + 0.12;
/** The disc's size in the room, and the range it's kept to on screen
 * (CSS pixels) as the view zooms. */
const DISC_M = 0.42;
const DISC_MIN_PX = 34;
const DISC_MAX_PX = 60;
/** The name's text height on screen (CSS pixels), and the gap between the
 * disc and the name. */
const NAME_PX = 12;
const NAME_GAP_PX = 3;
/** How faint the disc and name are where something stands in front. */
const GHOST_OPACITY = 0.38;
const GLIDE_MS = 1400;
const POP_MS = 380;
/** Canvas pixels per CSS pixel at the largest size shown. */
const SUPER = 2;
const FONT = `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

interface Marker {
  spec: Person3d;
  group: THREE.Group;
  figure: THREE.Group;
  figureMats: THREE.MeshStandardMaterial[];
  disc: Sprite2;
  name: Sprite2;
  /** Where it stands now and where it's gliding (floor frame). */
  at: THREE.Vector3;
  glide: {
    from: THREE.Vector3;
    to: THREE.Vector3;
    start: number;
    /** It turns to face the way it's going, as it sets off. */
    yawFrom: number;
    yawTo: number;
  } | null;
  /** Which way it faces (radians about +Y; 0 faces +Z). */
  yaw: number;
  /** 0 hidden … 1 shown; heading for `popTo`, from `popFrom` at `popStart`. */
  pop: number;
  popFrom: number;
  popTo: number;
  popStart: number;
  /** What its disc was last drawn from. */
  look: string;
}

/** A sprite and its faint copy drawn through whatever's in front. */
interface Sprite2 {
  front: THREE.Sprite;
  ghost: THREE.Sprite;
  texture: THREE.CanvasTexture;
  /** The canvas's size, and the part that's the disc (or the label). */
  w: number;
  h: number;
  /** CSS pixels the canvas covers at SUPER. */
  core: number;
}

export interface PeopleLayer {
  group: THREE.Group;
  set(people: Person3d[]): void;
  /** Moves, sizes and fades the markers for this frame; true while any is
   * still moving (draw another frame). */
  tick(
    camera: THREE.PerspectiveCamera,
    viewHeight: number,
    now: number,
  ): boolean;
  /** The person under the raycaster's ray, if any. */
  pick(raycaster: THREE.Raycaster): Person3d | null;
  count(): number;
  dispose(): void;
}

const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** A plain figure, facing +Z: its legs, and the rest (torso, arms, neck
 * and head), each one piece. */
function figureGeometry(): {
  upper: THREE.BufferGeometry;
  legs: THREE.BufferGeometry;
} {
  const part = (
    g: THREE.BufferGeometry,
    x: number,
    y: number,
    sx = 1,
    sy = 1,
    sz = 1,
    tilt = 0,
  ) => {
    g.scale(sx, sy, sz);
    g.rotateZ(tilt);
    g.translate(x, y, 0);
    return g;
  };
  // Floor to hips.
  const leg = (x: number) =>
    part(new THREE.CapsuleGeometry(0.068, 0.72, 4, 12), x, 0.428);
  // Hips to shoulders: wider than deep.
  const torso = part(
    new THREE.CapsuleGeometry(0.16, 0.42, 6, 16),
    0,
    1.08,
    1.15,
    1,
    0.72,
  );
  // Hanging from the shoulders, hands a little out from the hips.
  const arm = (side: 1 | -1) =>
    part(
      new THREE.CapsuleGeometry(0.043, 0.56, 4, 10),
      side * 0.228,
      1.07,
      1,
      1,
      1,
      side * 0.06,
    );
  const neck = part(new THREE.CylinderGeometry(0.045, 0.05, 0.1, 10), 0, 1.46);
  const head = part(
    new THREE.SphereGeometry(0.11, 18, 12),
    0,
    FIGURE_TOP_M - 0.11 * 1.08,
    1,
    1.08,
    1,
  );
  const upperParts = [torso, arm(1), arm(-1), neck, head];
  const legParts = [leg(0.075), leg(-0.075)];
  const upper = mergeGeometries(upperParts)!;
  const legs = mergeGeometries(legParts)!;
  for (const g of [...upperParts, ...legParts]) g.dispose();
  return { upper, legs };
}

/** A soft round shadow where they stand. */
function shadowTexture(): THREE.CanvasTexture {
  const size = 64;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(0,0,0,0.42)");
  g.addColorStop(0.55, "rgba(0,0,0,0.22)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(cv);
}

function sprite2(
  canvas: HTMLCanvasElement,
  core: number,
  center: [number, number],
): Sprite2 {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.anisotropy = 4;
  const make = (ghost: boolean) => {
    const mat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: !ghost,
      opacity: ghost ? GHOST_OPACITY : 1,
      // Neither lit nor tone mapped: the colours read as on the plan.
      toneMapped: false,
    });
    const s = new THREE.Sprite(mat);
    s.center.set(center[0], center[1]);
    // After the building's glass; the faint copy first.
    s.renderOrder = ghost ? 990 : 991;
    return s;
  };
  return {
    front: make(false),
    ghost: make(true),
    texture,
    w: canvas.width,
    h: canvas.height,
    core,
  };
}

function setSprite2(s: Sprite2, canvas: HTMLCanvasElement, core: number) {
  if (canvas.width !== s.w || canvas.height !== s.h) {
    // A new size: a new texture (three.js keeps a texture's first size).
    s.texture.dispose();
    s.texture = new THREE.CanvasTexture(canvas);
    s.texture.colorSpace = THREE.SRGBColorSpace;
    s.texture.minFilter = THREE.LinearMipmapLinearFilter;
    s.texture.anisotropy = 4;
    for (const x of [s.front, s.ghost]) {
      x.material.map = s.texture;
      x.material.needsUpdate = true;
    }
  } else {
    s.texture.image = canvas;
    s.texture.needsUpdate = true;
  }
  s.w = canvas.width;
  s.h = canvas.height;
  s.core = core;
}

/** The disc: their colour with their initials, or their picture, in a
 * white ring. `core` is the disc's diameter in canvas pixels. */
function drawDisc(
  p: Person3d,
  picture: HTMLImageElement | null,
): { canvas: HTMLCanvasElement; core: number } {
  const d = DISC_MAX_PX * SUPER;
  const pad = 6 * SUPER;
  const size = d + pad * 2;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d")!;
  const c = size / 2;
  const r = d / 2;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 4 * SUPER;
  ctx.shadowOffsetY = 1 * SUPER;
  ctx.beginPath();
  ctx.arc(c, c, r, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
  const inner = r - 3 * SUPER;
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, inner, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = p.color;
  ctx.fillRect(0, 0, size, size);
  if (picture) {
    // Cover the circle, cropped to the middle.
    const s = Math.max(
      (inner * 2) / picture.naturalWidth,
      (inner * 2) / picture.naturalHeight,
    );
    const w = picture.naturalWidth * s;
    const h = picture.naturalHeight * s;
    ctx.drawImage(picture, c - w / 2, c - h / 2, w, h);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const len = [...p.initials].length;
    ctx.font = `600 ${Math.round(inner * (len > 2 ? 0.62 : 0.78))}px ${FONT}`;
    ctx.fillText(p.initials, c, c + inner * 0.05);
  }
  ctx.restore();
  return { canvas: cv, core: d };
}

/** The name, white on a dark rounded label. `core` is the text's height
 * in canvas pixels. */
function drawName(p: Person3d): { canvas: HTMLCanvasElement; core: number } {
  const font = NAME_PX * SUPER;
  const padX = 6 * SUPER;
  const padY = 3 * SUPER;
  const cv = document.createElement("canvas");
  let ctx = cv.getContext("2d")!;
  ctx.font = `600 ${font}px ${FONT}`;
  const text = p.name;
  const tw = Math.ceil(ctx.measureText(text).width);
  cv.width = tw + padX * 2;
  cv.height = font + padY * 2;
  ctx = cv.getContext("2d")!;
  const h = cv.height;
  const w = cv.width;
  const r = h / 2;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.arc(w - r, r, r, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(r, h);
  ctx.arc(r, r, r, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.closePath();
  ctx.fillStyle = "rgba(24,26,30,0.78)";
  ctx.fill();
  ctx.font = `600 ${font}px ${FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cv.width / 2, h / 2 + SUPER * 0.5);
  return { canvas: cv, core: h };
}

export function createPeopleLayer(opts: {
  /** The floor's level now (world Y), null when it isn't shown. */
  floorY(floorId: string): number | null;
  /** Something changed that's drawn: draw a frame. */
  redraw(): void;
  /** Makes a material one the outdoor fixtures' beams don't light (for
   * someone indoors: they'd shine through the walls onto them). */
  indoorOnly(mat: THREE.MeshStandardMaterial): THREE.MeshStandardMaterial;
}): PeopleLayer {
  const group = new THREE.Group();
  group.name = "People";
  const markers = new Map<string, Marker>();
  const figureGeoms = figureGeometry();
  const shadowGeom = new THREE.CircleGeometry(0.34, 32);
  shadowGeom.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTexture(),
    transparent: true,
    depthWrite: false,
    // Over the floor it lies on, never fighting it.
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  /** Pictures, by URL: loading, loaded (null: it failed). */
  const pictures = new Map<string, HTMLImageElement | null | "loading">();

  function pictureFor(url: string | null): HTMLImageElement | null {
    if (!url) return null;
    const got = pictures.get(url);
    if (got === "loading") return null;
    if (got !== undefined) return got;
    pictures.set(url, "loading");
    const img = new Image();
    // A picture from elsewhere is only drawn where it allows it (else it
    // would taint the canvas): their initials instead.
    img.crossOrigin = "anonymous";
    img.onload = () => {
      pictures.set(url, img);
      for (const m of markers.values())
        if (m.spec.picture === url) restyle(m, true);
      opts.redraw();
    };
    img.onerror = () => pictures.set(url, null);
    img.src = url;
    return null;
  }

  function lookOf(p: Person3d): string {
    return `${p.color}|${p.initials}|${p.name}|${p.picture ?? ""}|${p.indoor}`;
  }

  /** The figure's materials: their colour, the legs a shade darker. */
  function figureMaterials(p: Person3d): THREE.MeshStandardMaterial[] {
    const make = (color: THREE.Color) => {
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.55,
        metalness: 0,
      });
      return p.indoor ? opts.indoorOnly(mat) : mat;
    };
    const color = new THREE.Color(p.color);
    return [make(color), make(color.clone().multiplyScalar(0.62))];
  }

  function restyle(m: Marker, force = false): void {
    const look = lookOf(m.spec);
    if (!force && look === m.look) return;
    m.look = look;
    const disc = drawDisc(m.spec, pictureFor(m.spec.picture));
    setSprite2(m.disc, disc.canvas, disc.core);
    const name = drawName(m.spec);
    setSprite2(m.name, name.canvas, name.core);
    for (const mat of m.figureMats) mat.dispose();
    m.figureMats = figureMaterials(m.spec);
    m.figure.children.forEach((mesh, k) => {
      (mesh as THREE.Mesh).material = m.figureMats[k]!;
    });
  }

  function create(p: Person3d, now: number): Marker {
    const mats = figureMaterials(p);
    const figure = new THREE.Group();
    const bodyMesh = new THREE.Mesh(figureGeoms.upper, mats[0]);
    const headMesh = new THREE.Mesh(figureGeoms.legs, mats[1]);
    const shadow = new THREE.Mesh(shadowGeom, shadowMat);
    shadow.position.y = 0.004;
    shadow.renderOrder = 1;
    for (const mesh of [bodyMesh, headMesh]) {
      mesh.receiveShadow = true;
      mesh.userData["personKey"] = p.key;
    }
    figure.add(bodyMesh, headMesh);
    const discDraw = drawDisc(p, pictureFor(p.picture));
    const disc = sprite2(discDraw.canvas, discDraw.core, [0.5, 0]);
    const nameDraw = drawName(p);
    const name = sprite2(nameDraw.canvas, nameDraw.core, [0.5, 1]);
    const g = new THREE.Group();
    g.name = p.name;
    g.add(figure, shadow, disc.ghost, disc.front, name.ghost, name.front);
    for (const s of [disc.front, disc.ghost, name.front, name.ghost]) {
      s.position.y = BADGE_Y_M;
      s.userData["personKey"] = p.key;
    }
    group.add(g);
    const m: Marker = {
      spec: p,
      group: g,
      figure,
      figureMats: mats,
      disc,
      name,
      at: new THREE.Vector3(p.x, p.y, p.z),
      glide: null,
      yaw: p.facing,
      pop: 0,
      popFrom: 0,
      popTo: 1,
      popStart: now,
      look: lookOf(p),
    };
    return m;
  }

  function free(m: Marker): void {
    m.group.removeFromParent();
    for (const mat of m.figureMats) mat.dispose();
    for (const s of [m.disc, m.name]) {
      s.texture.dispose();
      s.front.material.dispose();
      s.ghost.material.dispose();
    }
  }

  function popTo(m: Marker, to: number, now: number): void {
    if (m.popTo === to) return;
    m.popFrom = m.pop;
    m.popTo = to;
    m.popStart = now;
  }

  const camDir = new THREE.Vector3();
  const at = new THREE.Vector3();

  return {
    group,
    set(people) {
      const now = performance.now();
      const seen = new Set<string>();
      for (const p of people) {
        seen.add(p.key);
        let m = markers.get(p.key);
        if (!m) {
          m = create(p, now);
          markers.set(p.key, m);
          continue;
        }
        const moved = m.spec.floorId !== p.floorId;
        const to = new THREE.Vector3(p.x, p.y, p.z);
        m.spec = p;
        restyle(m);
        if (moved) {
          // Another floor: up (or down) there, not through the ceiling.
          m.at.copy(to);
          m.glide = null;
          m.yaw = p.facing;
          m.pop = 0;
          m.popFrom = 0;
          m.popTo = 1;
          m.popStart = now;
        } else if (to.distanceToSquared(m.glide?.to ?? m.at) > 1e-6) {
          const dx = to.x - m.at.x;
          const dz = to.z - m.at.z;
          m.glide = {
            from: m.at.clone(),
            to,
            start: now,
            yawFrom: m.yaw,
            // A step or two: no turning round for it.
            yawTo: Math.hypot(dx, dz) > 0.6 ? Math.atan2(dx, dz) : m.yaw,
          };
        }
        popTo(m, 1, now);
      }
      for (const [key, m] of markers) if (!seen.has(key)) popTo(m, 0, now);
      opts.redraw();
    },
    tick(camera, viewHeight, now) {
      let busy = false;
      // Where the camera is this frame (the controls just moved it).
      camera.updateMatrixWorld();
      camera.getWorldDirection(camDir);
      const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
      const viewWidth = viewHeight * camera.aspect;
      /** Each shown badge on screen (CSS pixels), to keep them apart. */
      const badges: {
        m: Marker;
        x: number;
        y: number;
        size: number;
        wide: number;
        mPerPx: number;
        off: number;
      }[] = [];
      for (const [key, m] of markers) {
        if (m.glide) {
          const t = Math.min(1, (now - m.glide.start) / GLIDE_MS);
          m.at.lerpVectors(m.glide.from, m.glide.to, ease(t));
          // The short way round.
          const { yawFrom, yawTo } = m.glide;
          const turn =
            ((((yawTo - yawFrom + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) %
              (2 * Math.PI)) -
            Math.PI;
          m.yaw = yawFrom + turn * ease(Math.min(1, t / 0.3));
          if (t >= 1) m.glide = null;
          else busy = true;
        }
        if (m.pop !== m.popTo) {
          const t = Math.min(1, (now - m.popStart) / POP_MS);
          m.pop = m.popFrom + (m.popTo - m.popFrom) * ease(t);
          if (t >= 1) m.pop = m.popTo;
          else busy = true;
        }
        if (m.pop === 0 && m.popTo === 0) {
          free(m);
          markers.delete(key);
          continue;
        }
        const floorY = opts.floorY(m.spec.floorId);
        m.group.visible = floorY !== null;
        if (floorY === null) continue;
        m.group.position.set(m.at.x, floorY + m.at.y, m.at.z);
        // Grows out of the floor (and sinks back into it).
        m.figure.scale.set(1, Math.max(0.001, m.pop), 1);
        m.figure.rotation.y = m.yaw;
        // The disc and name: a size in the room, kept readable on screen.
        at.copy(m.group.position);
        at.y += BADGE_Y_M;
        const depth = Math.max(0.05, at.sub(camera.position).dot(camDir));
        const mPerPx = (2 * depth * tanHalf) / Math.max(1, viewHeight);
        const discPx = Math.min(
          DISC_MAX_PX,
          Math.max(DISC_MIN_PX, DISC_M / mPerPx),
        );
        // Metres per canvas pixel.
        const discScale = (discPx / m.disc.core) * mPerPx;
        const lift = (BADGE_Y_M - FIGURE_TOP_M) * m.pop;
        for (const s of [m.disc.front, m.disc.ghost]) {
          s.scale.set(m.disc.w * discScale, m.disc.h * discScale, 1);
          s.position.y = FIGURE_TOP_M * m.pop + lift;
        }
        // The disc's canvas has a margin round it: the name starts at the
        // disc's own bottom edge.
        const margin = ((m.disc.h - m.disc.core) / 2) * discScale;
        const nameScale = mPerPx / SUPER;
        for (const s of [m.name.front, m.name.ghost]) {
          s.scale.set(m.name.w * nameScale, m.name.h * nameScale, 1);
          s.position.y =
            FIGURE_TOP_M * m.pop + lift + margin - NAME_GAP_PX * mPerPx;
        }
        for (const s of [m.disc, m.name])
          for (const x of [s.front, s.ghost]) {
            x.position.x = 0;
            x.position.z = 0;
          }
        at.copy(m.group.position);
        at.y += FIGURE_TOP_M * m.pop + lift;
        at.project(camera);
        if (at.z < 1)
          badges.push({
            m,
            x: ((at.x + 1) / 2) * viewWidth,
            y: ((1 - at.y) / 2) * viewHeight,
            size: discPx,
            wide: Math.max(discPx, (m.name.w / SUPER) * 0.9),
            mPerPx,
            off: 0,
          });
        const fade = m.pop;
        m.disc.front.material.opacity = fade;
        m.name.front.material.opacity = fade;
        m.disc.ghost.material.opacity = GHOST_OPACITY * fade;
        m.name.ghost.material.opacity = GHOST_OPACITY * fade;
      }
      // Badges that would overlap on screen (two people in a room, seen
      // from far out) slide apart sideways; their figures stay put.
      if (badges.length > 1) {
        badges.sort(
          (a, b) => a.x - b.x || (a.m.spec.key < b.m.spec.key ? -1 : 1),
        );
        for (let pass = 0; pass < 6; pass++) {
          for (let i = 0; i < badges.length; i++)
            for (let j = i + 1; j < badges.length; j++) {
              const a = badges[i]!;
              const b = badges[j]!;
              const tall = (a.size + b.size) / 2 + NAME_PX + 8;
              if (Math.abs(a.y - b.y) >= tall) continue;
              const gap = (a.wide + b.wide) / 2 + 6;
              const dx = b.x + b.off - (a.x + a.off);
              if (Math.abs(dx) >= gap) continue;
              const push = (gap - Math.abs(dx)) / 2;
              const dir = dx < 0 ? -1 : 1;
              a.off -= push * dir;
              b.off += push * dir;
            }
        }
        const right = new THREE.Vector3().setFromMatrixColumn(
          camera.matrixWorld,
          0,
        );
        for (const b of badges) {
          if (!b.off) continue;
          const shift = b.off * b.mPerPx;
          for (const s of [b.m.disc, b.m.name])
            for (const x of [s.front, s.ghost]) {
              x.position.x = right.x * shift;
              x.position.y += right.y * shift;
              x.position.z = right.z * shift;
            }
        }
      }
      return busy;
    },
    pick(raycaster) {
      const targets: THREE.Object3D[] = [];
      for (const m of markers.values()) {
        if (!m.group.visible || m.popTo === 0) continue;
        targets.push(m.disc.ghost, m.name.ghost, ...m.figure.children);
      }
      if (!targets.length) return null;
      group.updateMatrixWorld(true);
      const hit = raycaster.intersectObjects(targets, false)[0];
      const key = hit?.object.userData["personKey"] as string | undefined;
      return key ? (markers.get(key)?.spec ?? null) : null;
    },
    count() {
      return markers.size;
    },
    dispose() {
      for (const m of markers.values()) free(m);
      markers.clear();
      figureGeoms.upper.dispose();
      figureGeoms.legs.dispose();
      shadowGeom.dispose();
      shadowMat.map?.dispose();
      shadowMat.dispose();
    },
  };
}
