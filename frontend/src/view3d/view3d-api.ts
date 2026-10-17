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
  /** Glow from the room's lights while on, else null. */
  emissive: string | null;
  emissiveIntensity: number;
  outdoor: boolean;
}

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
  shape: "block" | "plant" | "tree" | "lamp" | "shower";
}

export interface Floor3d {
  floorId: string;
  name: string;
  /** World Y of this floor's level. */
  baseY: number;
  wallHeight: number;
  walls: Box3d[];
  wallColor: string;
  panes: Pane3d[];
  slabs: Slab3d[];
  items: Item3d[];
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
}

/** A hillside: the ground stands at `uphill` (world Y) on the building's
 * high side and falls to `downhill` across its footprint, level beyond
 * it either way. */
export interface Terrain3d {
  uphill: number;
  downhill: number;
  /** Downhill direction on the floor plane (x, z), unit length. */
  dir: Vec2;
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
  /** The scene (without helpers) as a binary glTF. */
  exportGlb(): Promise<Blob>;
  resize(): void;
  destroy(): void;
}

export interface View3dModule {
  createView3d(options: View3dOptions): View3dHandle;
  supportsWebgl(): boolean;
}
