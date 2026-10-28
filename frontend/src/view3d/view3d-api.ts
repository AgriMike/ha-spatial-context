/** What the panel hands the lazily loaded 3D module (view3d-glue.ts, built
 * separately into www/view3d/) and what it gets back. Types only — the
 * panel never imports the module statically, so three.js stays out of the
 * main bundle.
 *
 * Everything here is already in world space: metres, Y up, with the plan's
 * x running along +X and its y (down the screen) along +Z, so a plan seen
 * from above reads the same way round. The panel (scene3d.ts) does all the
 * plan-units → metres work; the module only builds meshes. */

import type { GroundGrid } from "../types";

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
  /** What it's part of on the plan, for picking in the editor. */
  ref?: EditRef;
  /** The covering of its painted long faces facing into a room: local +Z
   * then -Z (null: plain paint in the floor's wall colour). */
  cover?: [WallCover | null, WallCover | null];
}

/** A wall's covering on one face: its kind and colour. */
export interface WallCover {
  finish: WallFinishKind;
  color: string;
}

export type WallFinishKind =
  "paint" | "tile" | "brick" | "wood" | "wallpaper" | "stone" | "shiplap";

/** A thing on a floor's plan the editor can pick: a wall (and its
 * segment), an opening, a furniture item, a room. */
export interface EditRef {
  kind: "wall" | "opening" | "item" | "room";
  id: string;
  seg?: number;
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
  /** A lid over a room (a closet's top, a ledge): painted all round, like
   * the walls' tops it lies flush with. */
  lid?: boolean;
}

export type FloorFinish =
  "wood" | "lato" | "tile" | "carpet" | "concrete" | "stone" | "deck" | "plain";

export type LightBeam =
  "spot" | "flood" | "updown" | "up" | "down" | "omni" | "glow";

export interface Item3d {
  id: string;
  name: string;
  /** An uploaded model it wears instead of its own (its id: see
   * View3dOptions.fetchModel). */
  glb?: string;
  /** It stands in a room (not out in the yard): the outdoor fixtures'
   * beams never reach it. */
  indoor?: boolean;
  /** A vehicle model's lift and its tyres' growth across, metres. */
  glbFit?: { lift: number; tire: number };
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
   * `y` (metres above the floor's level, or above the ground for a
   * grounded item). An outdoor fixture's `beam` is how it throws its
   * light: a "spot" tilted `tilt`° from straight up toward the item's
   * front with a `spread`° cone, a "flood" out and down from a wall, "up"
   * and "down" ("updown"), "down", "omni" all round, or "glow" (its lens
   * only). */
  light: {
    color: string;
    level: number;
    y: number;
    beam?: LightBeam;
    tilt?: number;
    spread?: number;
    /** How far in front of the fixture (toward its front) its light
     * comes from: a ground spot near a wall washes it from close by. */
    forward?: number;
  } | null;
  /** Stands on the ground (out in the yard, in none of the floor's rooms):
   * `y0` and the light's `y` are above the ground there, not the floor's
   * level. */
  grounded?: boolean;
  /** A two-light up & down sconce's down light, while it's on (`light` is
   * then its up light). */
  light2?: Item3d["light"];
  /** A ground spotlight's tilt (degrees from straight up), aimed at the
   * wall it faces (its model's head and its beam both). */
  tilt?: number;
  /** Drawn as an extruded block with its 2D drawing on top ("block"), or
   * modelled: a potted plant, a tree, a lamp. */
  shape: "block" | "plant" | "tree" | "lamp" | "shower" | "stairs";
  /** A staircase: the floor levels (metres above the floor's level) at its
   * front (local +z) and back ends, and whether its left (local -x) and
   * right sides get a railing. `railEnds` (per side, metres from its low
   * and high ends) is where a railing runs into a wall: it stops there,
   * no newel post. `landing` is how far (metres) the floor at its top
   * runs back over it from its high end. */
  /** A catalog item drawn as a 3D model (see furniture-models.ts): its
   * catalog id, drawing kind and options, whether it's mirrored, and the
   * colour picked for it (null: the model's own). */
  model?: {
    kind: string;
    draw: string;
    opts: Record<string, string | number | boolean | undefined>;
    flip: boolean;
    tint: string | null;
    /** A cabinet's face set by hand: its drawers' heights from the top
     * (metres) and the doors below them (null: the catalog's). */
    fronts?: { drawers: number[] | null; doors: number | null };
    /** Which side a cabinet's door pulls are set on (absent: by each
     * door's free edge). */
    handleSide?: "left" | "right";
    /** A cabinet's doors in one tier or two (a top half, a bottom), and
     * its stone top left off (absent: its own). */
    doorTiers?: number;
    noTop?: boolean;
    /** A wood finish worn instead of a plain colour. */
    finish?: "white_oak";
    /** An open bookshelf's cubbies set by hand: their heights from the
     * top down (metres, the last row filling the rest), how many across,
     * and per cubby (row by row from the top left) how full of books it
     * is (0-1) and its edges with a light strip ("t", "b", "l", "r");
     * null: its own. */
    cubbies?: {
      rows: number[] | null;
      cols: number | null;
      books: number[] | null;
      edges: string[] | null;
    };
    /** A houseplant's pot set by hand (diameter, metres; its shape) and
     * how full it grows (1 as drawn); null: the species' own. */
    plant?: {
      pot: number | null;
      shape: string | null;
      full: number | null;
      /** How wide its leaves fan round its front, radians. */
      spread?: number | null;
    };
    /** Undermount sinks' openings cut in its stone top, in its own frame
     * (before any flip): centre, size, turn and corner radius, metres. */
    cuts?: {
      x: number;
      z: number;
      w: number;
      d: number;
      a: number;
      r: number;
    }[];
    /** Windows (and doors) a panel on the wall stops round, in its own
     * frame (before any flip): across from x0 to x1, up from its mount
     * from y0 to y1, metres. */
    gaps?: { x0: number; x1: number; y0: number; y1: number }[];
  };
  /** A site feature (see site-models.ts): a surface laid on the ground
   * (concrete, asphalt, pavers, lawn, a planting bed…) or a fence, wall
   * or hedge along a line; its outline in the item's frame (curves
   * sampled), whether it's closed, its height (metres) and the colour
   * picked for it (null: its own). */
  site?: {
    surface?: string;
    fence?: string;
    points: Vec2[];
    closed: boolean;
    height: number;
    /** How thick a hedge or wall stands (metres). */
    thick: number;
    /** How far a retaining wall goes below the ground (metres). */
    depth?: number;
    /** A dug-out area's depth (metres; its `surface` is "dig"), or a
     * raised area's height (its `surface` is "raise"). */
    dig?: number;
    /** A surface built up as a block (a bed in a dug-out area): its top
     * this far above the ground's own level (metres), its sides down to
     * whatever it stands on. */
    extrude?: number;
    tint: string | null;
  };
  /** A free-form outline tall enough to be a counter: drawn as one. */
  counter?: boolean;
  /** The colour picked for the item (null: its model's own). */
  tint?: string | null;
  stairs?: {
    front: number;
    back: number;
    rails: [boolean, boolean];
    landing?: number;
    railEnds?: [[number, number], [number, number]];
    /** Out of doors (deck stairs): open treads on stringers. */
    outdoor?: boolean;
  };
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
  /** Vaulted ceilings under the roof: each a triangle list (x, y, z,
   * metres in this floor's frame), painted like the walls. */
  vaults?: { id: string; positions: number[] }[];
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
  /** Light strips along the roof's edges (shown with it). */
  roofLights?: RoofLights3d[];
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
  /** Its outer edges (eaves and gable rakes) along the fascia's face,
   * each with the way it faces out (unit, floor plane): where light
   * strips go. */
  edges?: RoofEdge3d[];
}

export interface RoofEdge3d {
  a: [number, number, number];
  b: [number, number, number];
  out: Vec2;
  /** Which edge it is, kept as the roof changes: its part ("name" or
   * "#index", "porch:n") and side ("c0", "c1", "a0", "a1"). */
  key: string;
  /** The part's name, and whether it's a gable's rake (else an eave). */
  label: string;
  rake: boolean;
  /** The compass side it faces ("n", "e", "s", "w"). */
  facing?: "n" | "e" | "s" | "w";
}

/** A light strip's LEDs along the roof's edges: their centres (world,
 * x y z in turn), its colour while on (null: off) and brightness (0-1). */
export interface RoofLights3d {
  name: string;
  points: number[];
  color: string | null;
  level: number;
  /** While on: each LED's colour in turn, repeating (else all `color`). */
  pattern?: string[];
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
  /** How much of that extent, from the high side, stays level at `uphill`
   * (a yard level with the street) before the grade falls. */
  level: number;
  /** The footprints of floors that reach below the ground, cut out of it
   * so their rooms show. */
  holes: Vec2[][];
  /** Grading over the site (see ground-grid.ts), and the building's
   * footprint it leaves alone (the house stands on its foundation). */
  grid?: GroundGrid | null;
  cover?: Vec2[][];
  /** Dug-out areas (see pits.ts): the ground lowered straight down. */
  pits?: Pit3d[];
  /** Raised areas: the ground lifted straight up `depth` inside them
   * (a raised area, or a retaining wall filled to its top). */
  raised?: Pit3d[];
}

/** A dug-out area: its outline (x, z, metres, world) and how deep. */
export interface Pit3d {
  points: Vec2[];
  depth: number;
  /** A raised area: how far (metres) its edges ease down to the ground
   * round it, but for those marked `hard` (edge k runs from point k to
   * the next; along a retaining wall). */
  blend?: number;
  hard?: boolean[];
  /** The item it's from. */
  id?: string;
  /** Soil a retaining wall holds back on one side: `points` is the band
   * it covers (the wall's line and the same line `blend` out on that
   * side); inside it the ground rises to `depth` at the wall and rolls
   * back down to nothing across the band (see pits.ts bandRaise). */
  band?: { line: Vec2[] };
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
  /** An item's uploaded model's GLB bytes. */
  fetchModel?(id: string): Promise<ArrayBuffer>;
  /** A scan was dragged (or snapped) to a new pose. `final` is true when
   * the drag ends — the moment to save. */
  onScanMove?(id: string, pose: ScanPose, final: boolean): void;
  /** Editing (see View3dHandle's setEditFloor): the pointer went down,
   * moved, came up, clicked or double-clicked over the scene. Returning
   * true from a "down" starts a drag: the camera stays put and the moves
   * that follow come as "drag" until the "up". */
  onEditPointer?(e: EditPointer): boolean | void;
  /** A scan finished loading (or failed). */
  onScanStatus?(
    id: string,
    status: "loading" | "ready" | "error",
    message?: string,
  ): void;
}

/** What's under the pointer while editing. Points are in the edit
 * floor's own frame: x, z on its plan (metres), y above its level. */
export interface EditHit {
  /** The thing hit on the edit floor (null: nothing of its own, or another
   * floor's). */
  ref: EditRef | null;
  point: [number, number, number] | null;
  /** The hit face's normal (world). */
  normal: [number, number, number] | null;
  /** Where the pointer meets the edit floor's level. */
  floor: [number, number] | null;
  /** A handle (setEditOverlay's) under the pointer: its index. */
  handle: number | null;
  /** The floor the thing hit belongs to (another floor's in the
   * dollhouse: `ref` is that floor's), else null. */
  floorId: string | null;
  /** The pointer's ray (edit-floor frame): to meet the ground or any
   * level with. */
  ray: { o: [number, number, number]; d: [number, number, number] };
}

export interface EditPointer {
  type: "down" | "move" | "drag" | "up" | "click" | "dblclick";
  hit: EditHit;
  shift: boolean;
  alt: boolean;
  ctrl: boolean;
  button: number;
}

/** What the editor draws over the scene, on the edit floor. */
export interface EditOverlay {
  select?: EditRef | null;
  hover?: EditRef | null;
  /** Grab handles (edit-floor frame); `activeHandle` drawn picked. */
  handles?: [number, number, number][];
  activeHandle?: number | null;
  /** Handles from this index on are drawn smaller and fainter (an
   * outline's edge middles, to add a corner by). */
  minorFrom?: number | null;
  /** Guide lines (polylines, edit-floor frame). */
  lines?: [number, number, number][][];
  /** Polylines in their own colours (edit-floor frame). */
  paths?: { points: [number, number, number][]; color: string }[];
  /** Snapping guides (edit-floor frame): drawn dashed in their colour. */
  guides?: { points: [number, number, number][]; color: string }[];
  /** Boxes to preview (a wall being drawn, a door about to be placed). */
  ghost?: Box3d[];
}

export interface View3dHandle {
  /** Turns editing on for a floor (null: off): pointer events go to
   * onEditPointer and the overlay is drawn on it. */
  setEditFloor(floorId: string | null): void;
  setEditOverlay(overlay: EditOverlay): void;
  /** Where a point (edit-floor frame, metres) shows on the view, CSS
   * pixels from its top left; null when it's behind the camera. */
  toScreen(x: number, y: number, z: number): [number, number] | null;
  /** The ground's height (edit-floor frame, metres) at a spot. */
  groundHeight(x: number, z: number): number;
  /** Shows the ground graded by a grid while it's being shaped, before
   * it's saved (the rest of the scene follows on the next setScene).
   * With `near` (min x, min z, max x, max z, metres), only that stretch
   * changed: its heights are moved in place where they can be. */
  previewGrade(
    grid: GroundGrid | null,
    near?: [number, number, number, number],
  ): void;
  /** Shows a furniture item at a new spot and turn while it's dragged
   * (edit-floor frame, metres; angle as Item3d's), before it's saved. */
  previewItem(
    id: string,
    x: number,
    z: number,
    angle: number,
    y?: number,
  ): void;
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
  /** Each item drawn alone as a picture (a PNG data URL, `size` pixels
   * square), by its id: the library's thumbnails. */
  thumbnails?(items: Item3d[], size: number): Promise<Record<string, string>>;
}
