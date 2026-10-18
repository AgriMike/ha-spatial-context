/** What the panel hands the lazily loaded 3D module (view3d-glue.ts, built
 * separately into www/view3d/) and what it gets back. Types only — the
 * panel never imports the module statically, so three.js stays out of the
 * main bundle.
 *
 * Everything here is already in world space: metres, Y up, with the plan's
 * x running along +X and its y (down the screen) along +Z, so a plan seen
 * from above reads the same way round. The panel (scene3d.ts) does all the
 * plan-units → metres work; the module only builds meshes. */

export type Vec2 = [number, number];

/** A box standing on the floor: a wall piece, a lintel, a window pane. */
export interface Box3d {
  /** Centre on the floor plane. */
  x: number;
  z: number;
  /** Bottom and top, metres above the floor's level. */
  y0: number;
  y1: number;
  /** Along its direction, and across it. */
  length: number;
  depth: number;
  /** Radians about +Y (three.js's rotation.y). */
  angle: number;
  /** Which long face looks outdoors (and is sided): 1 the box's local +Z
   * face, -1 its local -Z face; absent where rooms lie on both sides. */
  outside?: 1 | -1;
  /** The outdoor face is stone rather than siding (a wainscot). */
  stone?: boolean;
  /** One colour all over instead: a porch post, a stoop. */
  color?: string;
}

/** A porch roof against an outside wall: `corners` along the wall's
 * outdoor face (a, b), then out from b and from a; a lean-to falling from
 * the wall to its eave at the front. */
export interface Porch3d {
  corners: [Vec2, Vec2, Vec2, Vec2];
  /** Metres above the floor's level. */
  eave: number;
  /** Whether a wall meets its a side and its b side (no post there; the
   * roof runs on into that wall's). */
  abutted?: [boolean, boolean];
}

export interface Pane3d {
  box: Box3d;
  kind: "glass" | "cover" | "door";
  color: string;
  opacity: number;
}

export interface Slab3d {
  id: string;
  name: string;
  /** Metres above (or below) the floor's level — a split level's landing. */
  y: number;
  /** Outline on the floor plane (x, z). */
  points: Vec2[];
  color: string;
  /** The floor's finish, drawn as a texture tinted by `color` when the
   * room has a fill of its own (`tinted`). */
  finish: FloorFinish;
  tinted: boolean;
  /** Glow from the room's lights while on, else null. */
  emissive: string | null;
  emissiveIntensity: number;
  outdoor: boolean;
  /** A lid over a room (a closet's top, a ledge): painted all round. */
  lid?: boolean;
}

export type FloorFinish =
  "wood" | "tile" | "carpet" | "concrete" | "deck" | "plain";

export interface Item3d {
  id: string;
  name: string;
  /** Footprint in the item's own frame, metres, centred on (0, 0) —
   * x across, z front to back. */
  footprint: Vec2[];
  width: number;
  depth: number;
  x: number;
  z: number;
  angle: number;
  /** Bottom and height, metres. Hung lights start near the ceiling. */
  y0: number;
  height: number;
  color: string;
  /** The 2D drawing as an SVG data URL, laid on the top face. */
  topImage: string | null;
  opacity: number;
  /** A linked light that's on: glows, and lights the room from height
   * `y` (metres above the floor's level). */
  light: { color: string; level: number; y: number } | null;
  /** Drawn as an extruded block with its 2D drawing on top ("block"), or
   * modelled: a potted plant, a tree, a lamp. */
  shape: "block" | "plant" | "tree" | "lamp" | "shower" | "stairs";
  /** A staircase: the floor levels (metres above the floor's level) at its
   * front (local +z) and back ends, and whether its left (local -x) and
   * right sides get a railing. */
  stairs?: { front: number; back: number; rails: [boolean, boolean] };
}

export interface Floor3d {
  floorId: string;
  name: string;
  /** World Y of this floor's level. */
  baseY: number;
  wallHeight: number;
  walls: Box3d[];
  wallColor: string;
  /** Outdoor faces of the outside walls, and their stone wainscot. */
  sidingColor: string;
  stoneColor: string;
  /** Porch roofs over the front doors (drawn with the building's roof). */
  porches: Porch3d[];
  panes: Pane3d[];
  slabs: Slab3d[];
  items: Item3d[];
  /** The plan has staircases of its own (a scan's are then left out). */
  hasStairs: boolean;
  /** Wall faces (each wall segment's two long sides) and the way each
   * looks, for snapping scans — a scan only sees the faces toward it. */
  wallFaces: { a: Vec2; b: Vec2; normal: Vec2 }[];
  /** Metres per stored plan unit on this floor. */
  metersPerUnit: number;
}

export interface Scene3d {
  floors: Floor3d[];
  /** Direction toward the sun (unit vector), null at night. */
  sun: {
    dir: [number, number, number];
    color: string;
    intensity: number;
  } | null;
  ambient: { sky: string; ground: string; intensity: number };
  background: string;
  dark: boolean;
  /** Ground sloping across the site, else null (flat, under the lowest
   * floor). */
  terrain: Terrain3d | null;
  /** The building's roof, null when not shown. */
  roof: Roof3d | null;
}

/** A roof: planar faces (from explicit parts), else a height grid worked
 * out from the rooms. */
export interface Roof3d {
  grid: RoofGrid3d | null;
  faces: RoofFace3d[];
  color: string;
  sidingColor: string;
  /** Fascia and soffits. */
  trimColor: string;
  /** Shake-sided gable ends. */
  shakeColor: string;
}

/** One flat, convex piece of roof in world space, its corners in order. */
export interface RoofFace3d {
  points: [number, number, number][];
  kind: "shingle" | "siding" | "shake" | "trim";
}

/** A roof as heights over a square grid on the floor plane: point (i, j)
 * is at (x0 + i * step, z0 + j * step), row-major (j * nx + i). NaN where
 * there's no roof. Drawn in cells two steps square, each fanned from its
 * centre point. */
export interface RoofGrid3d {
  x0: number;
  z0: number;
  step: number;
  nx: number;
  nz: number;
  /** World Y of the roof surface. */
  heights: Float32Array;
  /** World Y of the eave the surface rises from at each point: a gable
   * end is closed with siding from the surface down to it. */
  eaves: Float32Array;
}

/** A hillside: the ground stands at `uphill` (world Y) on the building's
 * high side and falls to `downhill` across its footprint, level beyond
 * it either way. */
export interface Terrain3d {
  uphill: number;
  downhill: number;
  /** Downhill direction on the floor plane (x, z), unit length. */
  dir: Vec2;
  /** The building's extent along `dir` (x * dir[0] + z * dir[1]): the
   * grade falls from uphill to downhill between the two. */
  range: [number, number];
  /** The footprints of floors that reach below the ground, cut out of it
   * so their rooms show. */
  holes: Vec2[][];
}

/** One scan placed on a floor, in world terms. */
export interface ScanPlacement3d {
  id: string;
  floorId: string;
  /** Where the scan's origin sits (x, z), metres. */
  x: number;
  z: number;
  /** Metres above the floor's level. */
  elevation: number;
  /** Degrees clockwise as seen from above (as on the plan). */
  rotationDeg: number;
  scale: number;
  visible: boolean;
  opacity: number;
  hideWalls: boolean;
}

export type ScanMode = "plan" | "scan";

export interface ScanPose {
  x: number;
  z: number;
  rotationDeg: number;
  /** Set by auto-align: lifts or drops the scan so its floor sits on the
   * floor's level. */
  elevation?: number;
}

export interface View3dOptions {
  container: HTMLElement;
  /** A scan's glTF/GLB bytes. */
  fetchScan(id: string): Promise<ArrayBuffer>;
  /** A scan was dragged (or snapped) to a new pose. `final` is true when
   * the drag ends — the moment to save. */
  onScanMove?(id: string, pose: ScanPose, final: boolean): void;
  /** A scan finished loading (or failed). */
  onScanStatus?(
    id: string,
    status: "loading" | "ready" | "error",
    message?: string,
  ): void;
}

export interface View3dHandle {
  setScene(scene: Scene3d): void;
  /** Adds, updates and removes scans to match the list. */
  setScans(scans: ScanPlacement3d[]): void;
  /** The scan to drag on the floor (null for none — the camera only). */
  setEditScan(id: string | null, snap: boolean): void;
  /** Which model shows where a floor has a visible scan: "plan" draws the
   * plan, adding only the scan's stairs (the plan has none); "scan" draws
   * the scan's walls, doors, windows and objects in place of the plan's
   * walls and furniture (the plan's floors and lights stay). Scans'
   * ceilings and floors never show. */
  setScanMode(mode: ScanMode): void;
  /** Turns a scan to line its walls up with the plan's, pushes it onto
   * the nearest wall faces and sets its floor on the floor's level;
   * reports the pose through onScanMove. */
  autoAlignScan(id: string): void;
  /** Spreads stacked floors apart vertically (metres added per storey). */
  setSpread(metres: number): void;
  view(kind: "orbit" | "top" | "fit"): void;
  /** Puts the camera at `eye` looking at `target` (world metres). */
  lookAt(eye: [number, number, number], target: [number, number, number]): void;
  /** The scene (without helpers) as a binary glTF. */
  exportGlb(): Promise<Blob>;
  resize(): void;
  destroy(): void;
}

export interface View3dModule {
  createView3d(options: View3dOptions): View3dHandle;
  supportsWebgl(): boolean;
}
