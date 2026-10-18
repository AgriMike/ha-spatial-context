/** Turns floor layouts into the 3D view's scene (see view3d-api.ts): walls
 * extruded to the floor's wall height with doors and windows cut out,
 * rooms as tinted floor slabs, furniture as blocks with their 2D drawing
 * on top, and the sun from Home Assistant's location. Part of the main
 * bundle — pure data in, plain numbers out — so the lazily loaded three.js
 * module only has to build meshes. */

import { render, svg } from "lit";
import type {
  FloorLayout,
  FurnitureItem,
  GroundSetting,
  HomeAssistant,
  Opening,
  RoofPlan,
  Scale,
} from "../types";
import {
  eaveCuts,
  partSection,
  ROOF_HEEL_M,
  porchSection,
  sectionFaces,
  sectionHeightAt,
} from "./roof-planes";
import type {
  Box3d,
  FloorFinish,
  Floor3d,
  Item3d,
  Pane3d,
  Porch3d,
  Roof3d,
  RoofFace3d,
  Scene3d,
  Slab3d,
  Terrain3d,
  Vec2,
} from "./view3d-api";
import {
  BASE_WIDTH,
  DEFAULT_ROOM_FILL_COLOR,
  DEFAULT_ROOM_FILL_OPACITY,
} from "../canvas/floorplan-canvas";
import {
  distance,
  nearestPointOnPolyline,
  pointInPolygon,
  pointToSegmentDistance,
} from "../canvas/geometry";
import { wallThicknessCm } from "../canvas/materials";
import {
  computeCoverOpenness,
  computeItemStates,
  computeRoomLights,
  mixHex,
  roomFillStyle,
} from "../canvas/live-state";
import {
  catalogItem,
  isShapeKind,
  type CatalogItem,
} from "../canvas/furniture-catalog";
import {
  drawItem,
  freeformPrims,
  FURNITURE_STYLES,
  renderPrims,
  shapeCornerFractions,
  softRadius,
  type Prim,
} from "../canvas/furniture-draw";
import {
  cloudySunColor,
  daylight,
  planVector,
  sunPosition,
  type Sky,
} from "../canvas/sun";

export const DEFAULT_WALL_HEIGHT_M = 2.4;
/** Outside walls and the roof. */
const SIDING = "#9aa1a8";
const SIDING_DARK = "#4d535a";
const SHINGLE = "#565b63";
const SHINGLE_DARK = "#2d3036";
/** Fascia and soffits; shakes on a gable end. */
const TRIM = "#433d38";
const TRIM_DARK = "#1f1d1b";
const SHAKE = "#6c7178";
const SHAKE_DARK = "#3c4046";
/** Roof: rise per metre of run, eave overhang, and the grid it's
 * sampled on. */
const ROOF_PITCH = 0.55;
const EAVE_M = 0.35;
const ROOF_STEP_M = 0.05;
/** Gaps between a floor's rooms narrower than this are roofed over. */
const ROOF_GAP_M = 0.4;
/** A front door's porch: how far out it reaches, its roof's eave above
 * the threshold, pitch and overhang, and its post. */
const PORCH_DEPTH_M = 1.4;
const PORCH_EAVE_M = 2.45;
const PORCH_PITCH = 0.45;
const PORCH_OVERHANG_M = 0.2;
const POST_M = 0.15;
/** Window casing: its width, and colour. */
const WINDOW_TRIM_M = 0.08;
const TRIM_WHITE = "#f3f1ec";
const TRIM_WHITE_DARK = "#9a968f";
/** An outside door's leaf. */
const DOOR = "#f6f4ef";
const DOOR_DARK = "#8f8b84";
const CEDAR = "#a8693a";
const CONCRETE = "#cbc8c1";
/** A raised deck: its posts (and their spacing), wood, and the railing's
 * height. */
const DECK_POST_M = 0.14;
const DECK_POST_SPAN_M = 2.2;
const DECK_WOOD = "#8a6c52";
const DECK_WOOD_DARK = "#4f4033";
const RAIL_TOP_M = 0.95;
/** A foundation wall showing above grade. */
const FOUNDATION = "#a9a59d";
/** The front's stone wainscot: its top above the high side's grade. */
const STONE_M = 1.1;
const STONE = "#aaa49a";
const STONE_DARK = "#5a5650";
/** Wings up to this wide end in gables; wider blocks are hipped (a gable
 * that wide would tower). */
const GABLE_MAX_M = 10;
/** Walls this thin (or thinner) are railings, drawn this high; walls
 * shorter than STUB_M in all are left out. */
const RAIL_THICKNESS_M = 0.06;
const RAIL_HEIGHT_M = 0.95;
const STUB_M = 0.3;

/** Items modelled rather than extruded (see Item3d.shape). */
function itemShape(
  kind: string,
  entry: CatalogItem | undefined,
): Item3d["shape"] {
  if (kind === STAIRS_KIND) return "stairs";
  if (/stand|pedestal|basket/.test(kind)) return "block";
  if (/shower(?!_bench)/.test(kind)) return "shower";
  if (/tree|olive/.test(kind) && entry?.category === "outdoor") return "tree";
  if (
    /plant|monstera|fiddle|palm|cactus|bonsai|fern|succulent|orchid|pothos|calathea|_zz|rubber|dracaena|jade|pilea|aloe|herb|shrub|hedge|houseplant|bird_of_paradise|philodendron|spider|tree|olive/.test(
      kind,
    )
  )
    return "plant";
  if (
    /floor_lamp|torchiere|tripod_floor|corner_floor|piano_lamp|floor_uplight|table_lamp|desk_lamp|smart_bulb_lamp|mushroom_lamp|salt_lamp|lava_lamp/.test(
      kind,
    )
  )
    return "lamp";
  return "block";
}
/** The staircase item (see furniture-catalog.ts). */
const STAIRS_KIND = "stairs_straight";
/** How far wall joints stop short of an outer face, and window pieces lap
 * into their opening: enough that no two faces share a plane. */
const JOINT_INSET_M = 0.003;
const JOINT_PROUD_M = 0.002;
/** Gaps this narrow between an upper floor's rooms still count as floor. */
const ABOVE_SLIVER_M = 0.06;
/** A ledge's lid over a closet: how far its top sits below the walls'
 * tops, so it reads as one surface with them without fighting them. */
const LID_DROP_M = 0.001;
/** The half wall material (see materials.ts) and its height. */
const HALF_WALL_MATERIAL = "half_wall";
const HALF_WALL_M = 1.0;
/** A floor's depth at an open edge (a header under a half wall there). */
const FLOOR_EDGE_M = 0.25;
/** A banister: its newel posts, spindles (and their spacing), handrail,
 * and colours. */
const NEWEL_M = 0.09;
const SPINDLE_M = 0.025;
const SPINDLE_GAP_M = 0.11;
const HANDRAIL_W_M = 0.07;
const HANDRAIL_H_M = 0.05;
const BANISTER_WHITE = "#f1eee8";
const HANDRAIL_WOOD = "#8b5e3c";

/** The share of a sloping site's depth, from its high side, that stays
 * level with the street before the grade falls toward the low side. */
const GRADE_LEVEL = 0.45;
/** The terrain is drawn this far under the stated grade (see glue). */
const GROUND_DRAWN_M = 0.06;
/** A window this close to a door is its sidelight. */
const SIDELIGHT_GAP_M = 0.35;
/** Door head, window sill and default window head heights, metres. */
const DOOR_HEAD_M = 2.1;
const WINDOW_SILL_M = 0.9;
const WINDOW_HEAD_M = 2.1;
/** The gap between storeys in the dollhouse (floor structure). */
export const STOREY_GAP_M = 0.3;

/** Stored plan units per real centimetre — the same rule as
 * floorplan-canvas.ts's unitsPerCm (a stand-in until calibrated). */
export function unitsPerCm(scale: Scale | null): number {
  if (scale && scale.meters > 0) {
    const [[x1, y1], [x2, y2]] = scale.points;
    const d = distance(x1, y1, x2, y2);
    if (d > 0) return d / scale.meters / 100;
  }
  return BASE_WIDTH / 2000;
}

export function metersPerUnit(scale: Scale | null): number {
  return 1 / (unitsPerCm(scale) * 100);
}

// --- furniture heights --------------------------------------------------------

type Mount = "floor" | "ceiling" | { y0: number };

/** [matches the item id, height in metres, how it's mounted] — first match
 * wins. Rough real-world sizes; a scene only needs to read right. */
const HEIGHT_RULES: [RegExp, number, Mount?][] = [
  [/^shape_|^icon_/, 0.01],
  [/mattress_floor/, 0.2],
  [/sleeping_bag|floor_cushion|meditation_cushion/, 0.12],
  [/rug|_mat$|^mat_|doormat|runner|play_mat|vr_play_area|bath_mat/, 0.01],
  // Hung from the ceiling.
  [/chandelier|pendant|globe_cluster/, 0.5, "ceiling"],
  [/ceiling_fan/, 0.35, "ceiling"],
  [
    /ceiling_light|flush_mount|recessed|wafer|led_panel|troffer|track_|spot_bar|shop_light|skylight_light|exhaust_fan|smoke_detector|co_detector|closet_puck|hex_light|triangle_light|^projector$|overhead_storage|garage_door_opener/,
    0.08,
    "ceiling",
  ],
  [/cove_light/, 0.05, { y0: -0.12 }],
  // On the wall.
  [/^wall_cabinet|over_toilet_storage|medicine_cabinet/, 0.7, { y0: 1.45 }],
  [/range_hood|microwave_otr/, 0.45, { y0: 1.55 }],
  [
    /tv_wall|wall_mirror|wall_art|tapestry|photo_wall|whiteboard|corkboard|wall_clock|pegboard|projection_screen|mirror_entry|tv_backlight/,
    0.9,
    { y0: 1.0 },
  ],
  [
    /sconce|wall_up_down|picture_light|vanity_light|wall_washer|reading_light_bed/,
    0.25,
    { y0: 1.7 },
  ],
  [
    /wall_hooks|towel_bar|towel_rail|key_cabinet|alarm_panel|thermostat|video_doorbell|electrical_|mini_split|security_camera|camera_dome|access_point|motion_sensor|presence_sensor|exit_sign/,
    0.3,
    { y0: 1.6 },
  ],
  [/window_ac/, 0.4, { y0: 1.0 }],
  [/under_cabinet_light/, 0.03, { y0: 1.4 }],
  [/string_lights|cafe_lights/, 0.03, { y0: 2.2 }],
  // Tall.
  [/shower_bench/, 0.45],
  [
    /fridge(?!_mini)|freezer_upright|pantry|tall_cabinet|wardrobe|armoire|closet_rod|linen_tower|linen_cabinet|bookcase(?!_small)|grandfather_clock|shelving|garage_cabinet|broom_cabinet|server_rack_full|mudroom_locker|hall_tree|coat_closet|china_cabinet|hutch|display_cabinet|curio|wall_oven|entertainment_center|gun_safe|utility_shelf|storage_shelf|pantry_shelves|linen_closet|shower|steam_|sauna|jewelry_armoire|full_length_mirror|floor_mirror|room_divider|coat_rack|coat_stand|cat_tree_large|water_heater|furnace|boiler|air_handler|heat_pump_water|smith_machine|power_rack|squat_stand|cable_machine|home_gym|arcade_cabinet|refrigerator/,
    2.0,
  ],
  [/bunk_bed|loft_bed/, 1.7],
  [/car_|motorcycle|scooter_motor|riding_mower/, 1.4],
  [/shed|greenhouse|playhouse|gazebo|pergola/, 2.4],
  [/umbrella_\d|umbrella_cantilever/, 2.3],
  [/tree_large/, 5],
  [/tree_small/, 2.5],
  [/^tree$|olive_tree/, 3.5],
  [
    /plant_large|fiddle|palm|monstera|bird_of_paradise|plant_rubber|dracaena|office_plant/,
    1.5,
  ],
  [/hedge/, 1.4],
  [/shrub|bush/, 1.0],
  [
    /floor_lamp|torchiere|tripod_floor|corner_floor|piano_lamp|floor_uplight/,
    1.6,
  ],
  [
    /table_lamp|desk_lamp|smart_bulb_lamp|salt_lamp|lava_lamp|mushroom_lamp|night_light/,
    0.45,
    { y0: 0.55 },
  ],
  // Counter height.
  [
    /fridge_mini|wine_fridge|beverage_center|dishwasher|trash_compactor|base_cabinet|drawer_base|corner_base|lazy_susan|countertop|sink|range|cooktop|induction|island|peninsula|vanity(?!_table|_stool)|washer|dryer|laundry_|outdoor_kitchen|kitchen_cart|butcher_block|workbench|buffet|sideboard|credenza|bar_cabinet|home_bar|freezer_chest|breakfast_bar|potting_bench|tool_chest|rolling_tool|grill|smoker|pizza_oven/,
    0.9,
  ],
  [/crib|bassinet|changing_/, 0.95],
  [/dog_bed|cat_bed|dog_cot|pet_cave|litter|pet_bowls|pet_feeder/, 0.25],
  [/bed|futon|daybed|murphy/, 0.55],
  [
    /sofa|sectional|loveseat|chaise|armchair|recliner|couch|glider|egg_chair|papasan|porch_swing|banquette/,
    0.85,
  ],
  [/bar_stool|drafting_stool/, 0.75],
  [/counter_stool/, 0.65],
  [
    /ottoman|pouf|beanbag|piano_bench|bench|vanity_stool|step_stool|kids_chair/,
    0.45,
  ],
  [/chair|stool/, 0.9],
  [/coffee_table|nesting/, 0.45],
  [/side_table|nightstand|end_table/, 0.55],
  [/high_top|pub_table/, 1.05],
  [/kids_table|kids_desk|train_table/, 0.5],
  [
    /table|desk|conference|meeting|picnic|ping_pong|poker|craft|sewing|drafting|massage/,
    0.75,
  ],
  [/tall_chest/, 1.3],
  [/lingerie_chest/, 1.2],
  [/dresser|chest|file_cabinet|drawers/, 0.85],
  [/toilet|bidet/, 0.75],
  [/urinal/, 1.1],
  [/hot_tub/, 0.9],
  [/bathtub|tub_|_tub/, 0.55],
  [/^pool_(rect|small|round)/, 0.02],
  [/trampoline/, 0.9],
  [/tv_stand|media_console|soundbar|av_receiver/, 0.5],
  [/^tv_/, 0.7, { y0: 0.5 }],
  [/^monitor_/, 0.4, { y0: 0.75 }],
  [
    /laptop|printer(?!_large|_3d)|toaster|coffee_maker|espresso|stand_mixer|kettle|blender|air_fryer|pressure_cooker|rice_cooker|bread_maker|food_processor|^microwave$|smart_speaker|smart_display|smart_hub|router|modem|mesh_node|network_switch|nas|game_console|turntable|kitchen_scale|knife_block|spice_rack|dish_rack/,
    0.3,
    { y0: 0.9 },
  ],
  [/upright_piano/, 1.25],
  [/piano/, 1.0],
  [/fireplace/, 1.1],
  [/wood_stove/, 0.9],
  [/radiator/, 0.6],
  [/baseboard/, 0.2],
  [/treadmill|elliptical|stair_climber/, 1.4],
  [/bicycle|bike/, 1.0],
];

const CATEGORY_HEIGHT: Record<string, number> = {
  living: 0.75,
  bedroom: 0.8,
  kitchen: 0.9,
  dining: 0.75,
  bathroom: 0.85,
  office: 0.75,
  laundry: 0.9,
  electronics: 0.5,
  lighting: 0.4,
  kids: 0.6,
  entry: 1.0,
  outdoor: 0.8,
  garage: 1.0,
  fitness: 1.0,
  pets: 0.4,
  decor: 0.6,
  icons: 0.01,
  shapes: 0.01,
  custom: 0.5,
};

/** An item's bottom and height above the floor, metres. */
export function itemHeight(
  kind: string,
  entry: CatalogItem | undefined,
  wallHeight: number,
): { y0: number; height: number } {
  for (const [re, height, mount] of HEIGHT_RULES) {
    if (!re.test(kind)) continue;
    if (mount === "ceiling") return { y0: wallHeight - height, height };
    if (mount && typeof mount === "object")
      return {
        y0:
          mount.y0 < 0
            ? wallHeight + mount.y0
            : Math.min(mount.y0, wallHeight - height),
        height,
      };
    return { y0: 0, height: Math.min(height, wallHeight) };
  }
  return { y0: 0, height: CATEGORY_HEIGHT[entry?.category ?? ""] ?? 0.6 };
}

// --- furniture footprint and top drawing -------------------------------------

function itemPrims(
  item: FurnitureItem,
  entry: CatalogItem | undefined,
): Prim[] {
  return item.points && item.points.length >= 2
    ? freeformPrims(
        item.points,
        item.width_cm,
        item.depth_cm,
        item.closed !== false,
        item.corners,
      )
    : drawItem(
        entry?.draw ?? "box",
        item.width_cm,
        item.depth_cm,
        item.corners?.length
          ? { ...entry?.opts, corners: item.corners.join(",") }
          : (entry?.opts ?? {}),
      );
}

function ellipsePoints(rx: number, rz: number, n = 32): Vec2[] {
  return Array.from({ length: n }, (_, i): Vec2 => {
    const a = (i / n) * Math.PI * 2;
    return [Math.cos(a) * rx, Math.sin(a) * rz];
  });
}

function roundedRectPoints(w: number, d: number, r: number): Vec2[] {
  const hw = w / 2;
  const hd = d / 2;
  r = Math.min(r, hw, hd);
  if (r <= 0.001)
    return [
      [-hw, -hd],
      [hw, -hd],
      [hw, hd],
      [-hw, hd],
    ];
  const out: Vec2[] = [];
  const corners: [number, number, number][] = [
    [hw - r, -hd + r, -Math.PI / 2],
    [hw - r, hd - r, 0],
    [-hw + r, hd - r, Math.PI / 2],
    [-hw + r, -hd + r, Math.PI],
  ];
  for (const [cx, cz, start] of corners) {
    for (let i = 0; i <= 4; i++) {
      const a = start + (i / 4) * (Math.PI / 2);
      out.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
    }
  }
  return out;
}

/** An item's outline in its own frame, metres, centred — what's extruded. */
function itemFootprint(
  item: FurnitureItem,
  entry: CatalogItem | undefined,
  prims: Prim[],
  flip: boolean,
): Vec2[] {
  const w = item.width_cm / 100;
  const d = item.depth_cm / 100;
  const fromFractions = (fr: [number, number][]): Vec2[] =>
    fr.map(([fx, fz]): Vec2 => [
      (flip ? 1 - fx : fx) * w - w / 2,
      fz * d - d / 2,
    ]);
  if (item.points && item.points.length >= 3 && item.closed !== false)
    return fromFractions(item.points);
  if (entry && isShapeKind(entry.id)) {
    const fr = shapeCornerFractions(entry.draw, entry.opts);
    if (fr.length >= 3) return fromFractions(fr);
  }
  const body = prims[0];
  if (
    body?.t === "ellipse" &&
    Math.abs(body.rx * 2 - item.width_cm) < item.width_cm * 0.1 &&
    Math.abs(body.ry * 2 - item.depth_cm) < item.depth_cm * 0.1
  )
    return ellipsePoints(w / 2, d / 2);
  return roundedRectPoints(
    w,
    d,
    softRadius(item.width_cm, item.depth_cm) / 100,
  );
}

const topImageCache = new Map<string, string>();

/** The item's 2D drawing as an SVG data URL sized for a texture: opaque
 * `base` behind lines in `line`. */
function topImage(
  item: FurnitureItem,
  prims: Prim[],
  flip: boolean,
  line: string,
  base: string,
  active: boolean,
): string {
  const w = Math.max(1, item.width_cm);
  const d = Math.max(1, item.depth_cm);
  const key = JSON.stringify([
    item.kind,
    w,
    d,
    flip,
    line,
    base,
    active,
    item.fill,
    item.points,
    item.corners,
  ]);
  const cached = topImageCache.get(key);
  if (cached) return cached;
  // Up to 512 px on the long side, at most 4 px per cm.
  const ppc = Math.min(4, 512 / Math.max(w, d));
  const pw = Math.max(8, Math.round(w * ppc));
  const ph = Math.max(8, Math.round(d * ppc));
  // Thick enough to survive the texture being shrunk on screen.
  const stroke = Math.max(2.5, Math.min(6, ppc * 1.4));
  const host = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  render(
    svg`<style>${FURNITURE_STYLES}</style>
      <rect x="0" y="0" width=${w} height=${d} fill=${base}></rect>
      <g transform=${flip ? `translate(${w} 0) scale(-1 1)` : ""}>${renderPrims(prims, !!item.fill || active)}</g>`,
    host,
  );
  host.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  host.setAttribute("width", String(pw));
  host.setAttribute("height", String(ph));
  host.setAttribute("viewBox", `0 0 ${w} ${d}`);
  host.setAttribute("preserveAspectRatio", "none");
  host.setAttribute(
    "style",
    `--fx-color:${line};--fx-stroke-width:${stroke}px;--sc-bg:${base};color:${line}`,
  );
  const xml = new XMLSerializer().serializeToString(host);
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  if (topImageCache.size > 400) topImageCache.clear();
  topImageCache.set(key, url);
  return url;
}

// --- walls -----------------------------------------------------------------

interface OpeningOnSegment {
  opening: Opening;
  /** Centre along the segment, and half its width, metres. */
  s: number;
  half: number;
}

/** Wall height covered by a cover hung in an opening, from the top down:
 * 0 open … 1 closed. Unknown state shows it open. */
function coveredFraction(openness: number | null | undefined): number {
  return openness === null || openness === undefined ? 0 : 1 - openness;
}

export interface FloorInput {
  floorId: string;
  name: string;
  layout: FloorLayout;
  wallHeight: number;
  baseY: number;
}

export interface SceneInput {
  floors: FloorInput[];
  /** The whole building's floors, stacked, of which `floors` are the ones
   * drawn: what stands above a drawn floor comes from these. */
  context?: FloorInput[];
  hass: HomeAssistant | undefined;
  dark: boolean;
  date: Date;
  sky: Sky | null;
  showLights: boolean;
  /** The ground around the building, null for flat. */
  ground: GroundSetting | null;
  /** Put a roof on the building. */
  roof?: boolean;
  /** The roof's explicit parts; without them it's worked out from the
   * rooms. */
  roofPlan?: RoofPlan | null;
}

function buildFloor(
  input: FloorInput,
  hass: HomeAssistant | undefined,
  dark: boolean,
  showLights: boolean,
  nightGlow: number,
  floorAbove: (x: number, z: number) => number | null,
  upperWalls: UpperWall[],
  /** Which way the street is (unit, floor plane), and the stone
   * wainscot's top above this floor's level. */
  exterior: {
    front: Vec2;
    stoneTop: number;
    /** The ground's height (metres above this floor's level) at a spot on
     * the floor plane, null on a flat site. */
    groundAt: ((x: number, z: number) => number) | null;
    /** Whether a lower floor has a room within `reach` metres of a spot on
     * the floor plane (the wall there stands on it). */
    lowerRoomNear: (x: number, z: number, reach: number) => boolean;
    /** The planned roof's height (metres above this floor's level) over a
     * spot, null where it has none (or there's no planned roof). */
    roofOver: (x: number, z: number) => number | null;
    /** What stands on the floors below, on this floor's plane. */
    below: Below;
  },
): Floor3d {
  const { layout, wallHeight: H } = input;
  const m = metersPerUnit(layout.scale);
  const covers = computeCoverOpenness(layout.openings, hass);
  const walls: Box3d[] = [];
  const panes: Pane3d[] = [];
  const porches: Porch3d[] = [];
  const wallFaces: Floor3d["wallFaces"] = [];
  const offsetRooms = layout.rooms.filter(
    (r) => (r.floor_offset_m ?? 0) !== 0 && r.points.length >= 3,
  );
  /** The floor offsets (Room.floor_offset_m, 0 when level with the floor)
   * of the rooms either side of a wall, a little way out from it along its
   * length, and which side is outdoors (1 toward the segment's left-hand
   * normal, -1 the other) when only one side has indoor rooms. */
  const sheltered = (x: number, z: number) => {
    const roof = exterior.roofOver(x, z);
    return (
      roof !== null && roof > H + 0.3 && exterior.lowerRoomNear(x, z, 0.01)
    );
  };
  const wallSides = (a: Vec2, b: Vec2, t: number) => {
    const len = distance(a[0], a[1], b[0], b[1]);
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const reach = (t / 2 + 0.2) / m;
    const offsets = new Set<number>();
    const indoors = { 1: 0, [-1]: 0 } as Record<1 | -1, number>;
    for (const f of [0.2, 0.5, 0.8]) {
      for (const side of [1, -1] as const) {
        const x = a[0] + (b[0] - a[0]) * f + nx * reach * side;
        const y = a[1] + (b[1] - a[1]) * f + ny * reach * side;
        const room = layout.rooms.find(
          (r) => r.points.length >= 3 && pointInPolygon(x, y, r.points),
        );
        if (room) offsets.add(room.floor_offset_m ?? 0);
        if (room && !room.outdoor) indoors[side]++;
        // No room of its own here, but a room below and the roof well
        // above this storey: inside the house (a stairwell, the space
        // beside a closet), not out under the sky.
        else if (!room && sheltered(x * m, y * m)) indoors[side]++;
      }
    }
    const outside: 1 | -1 | undefined =
      indoors[1] && !indoors[-1]
        ? -1
        : indoors[-1] && !indoors[1]
          ? 1
          : undefined;
    return { offsets: [...offsets], outside };
  };
  /** A wall's vertical span (metres from the floor's level) before any
   * floor above trims it, and the level its doors and windows sit at. It
   * reaches from the lowest room beside it to a storey above the highest;
   * a split level's garage walls run from the landing. */
  const wallSpan = (a: Vec2, b: Vec2, t: number) => {
    const { offsets, outside } = wallSides(a, b, t);
    const base = offsets.length ? Math.min(...offsets) : 0;
    let top = (offsets.length ? Math.max(...offsets) : 0) + H;
    // Doors and windows: at the room's level when it's the only one, else
    // at the higher (steps go down into the lower room).
    const level = offsets.length ? Math.max(...offsets) : 0;
    // Where a floor above has a wall on the same line, that wall carries
    // on from its level: stop there rather than stand beside it, or reach
    // up to it rather than leave a gap below it.
    const upper = upperWallLevel(a, b);
    if (upper !== null && upper <= top + 0.8) top = upper;
    // Under a planned roof whose lowest point along it sits a little
    // above it (a garage a step down from the house, under the house's
    // eave line), it stands up to that point rather than leave a gap.
    else {
      const L = distance(a[0], a[1], b[0], b[1]) * m;
      const ux = ((b[0] - a[0]) * m) / L;
      const uz = ((b[1] - a[1]) * m) / L;
      // Just inside its ends (a corner lies on the roof's outline).
      const inset = Math.min(L / 2, t) / L;
      const roof = [inset, 0.25, 0.5, 0.75, 1 - inset].map((f) =>
        roofAcross(
          (a[0] + (b[0] - a[0]) * f) * m,
          (a[1] + (b[1] - a[1]) * f) * m,
          ux,
          uz,
          t,
        ),
      );
      // Up to its eave: the roof crosses a wall's centre line a rafter's
      // depth above it.
      if (roof.every((r) => r !== null)) {
        const c = roof.map((r) => r![0]);
        // Carried on out to its ends (under a gable the roof rises along
        // it from each corner).
        const run = 0.25 - inset;
        const end0 =
          run > 0.01 ? c[0]! - ((c[1]! - c[0]!) * inset) / run : c[0]!;
        const end1 =
          run > 0.01 ? c[4]! - ((c[3]! - c[4]!) * inset) / run : c[4]!;
        const low = Math.min(...c, end0, end1) - ROOF_HEEL_M;
        if (low > top + 0.005 && low < top + 0.6) top = low;
      }
    }
    return { base, top, level, outside };
  };
  /** The planned roof's surface over a wall at a spot: at its centre
   * line and at the lower of its two faces (a roof falls across a wall's
   * thickness), else null. */
  const roofAcross = (
    x: number,
    z: number,
    ux: number,
    uz: number,
    t: number,
  ): [number, number] | null => {
    // The roof's outline runs along the walls' centre lines (an outside
    // face is past it): sample across the wall and a little either side,
    // and carry the roof's plane over both faces.
    const all: [number, number][] = [];
    for (const o of [-t, -t / 2, 0, t / 2, t]) {
      const r = exterior.roofOver(x - uz * o, z + ux * o);
      if (r !== null) all.push([o, r]);
    }
    // Only the roof over it (the higher one where it stands on the edge
    // between two): a sample that jumps to another (a lower roof just past
    // an upper one's edge) is left out.
    const near = all.filter((p) => Math.abs(p[0]) <= t / 2 + 1e-9);
    const ref = (near.length ? near : all).reduce<[number, number] | null>(
      (best, p) => (!best || p[1] > best[1] ? p : best),
      null,
    );
    const pts = all.filter(
      (p) =>
        !ref || Math.abs(p[1] - ref[1]) <= Math.abs(p[0] - ref[0]) * 1.2 + 0.02,
    );
    if (pts.length < 2) return pts.length ? [pts[0]![1], pts[0]![1]] : null;
    const n = pts.length;
    const mo = pts.reduce((acc, p) => acc + p[0], 0) / n;
    const mr = pts.reduce((acc, p) => acc + p[1], 0) / n;
    const den = pts.reduce((acc, p) => acc + (p[0] - mo) ** 2, 0);
    const k =
      den > 0
        ? pts.reduce((acc, p) => acc + (p[0] - mo) * (p[1] - mr), 0) / den
        : 0;
    return [
      mr - k * mo,
      Math.min(mr + k * (t / 2 - mo), mr + k * (-t / 2 - mo)),
    ];
  };

  /** A wall's top along its length (s in metres from `a`), in runs: it
   * stops under a floor above that covers either side of it, and reaches
   * up to meet one just above it rather than leave a gap. A wall only
   * partly under an upper floor is trimmed only there, so it never stands
   * up through that floor. */
  const wallRuns = (
    a: Vec2,
    b: Vec2,
    t: number,
    base: number,
    top: number,
  ): { s0: number; s1: number; top: number; out?: 1 | -1 }[] => {
    const L = distance(a[0], a[1], b[0], b[1]) * m;
    const ux = ((b[0] - a[0]) * m) / L;
    const uz = ((b[1] - a[1]) * m) / L;
    const reach = t / 2 + 0.2;
    const n = Math.max(1, Math.round(L / 0.1));
    const runs: { s0: number; s1: number; top: number; out?: 1 | -1 }[] = [];
    // Which side is out of doors here (a wall indoors along most of its
    // length can run on out past the house's roof).
    const indoorAt = (x: number, z: number) =>
      layout.rooms.some(
        (r) =>
          !r.outdoor &&
          r.points.length >= 3 &&
          pointInPolygon(x / m, z / m, r.points),
      ) || sheltered(x, z);
    for (let k = 0; k < n; k++) {
      const s = ((k + 0.5) * L) / n;
      const x = a[0] * m + ux * s;
      const z = a[1] * m + uz * s;
      const left = indoorAt(x - uz * reach, z + ux * reach);
      const right = indoorAt(x + uz * reach, z - ux * reach);
      const out: 1 | -1 | undefined =
        left && !right ? -1 : right && !left ? 1 : undefined;
      const covered = [
        floorAbove(x - uz * reach, z + ux * reach),
        floorAbove(x + uz * reach, z - ux * reach),
      ].filter((u): u is number => u !== null);
      let v = top;
      /** A wall of a floor above, standing at level `y`, stands on it here
       * (not where that wall has a doorway). */
      const carriesAt = (y: number) =>
        upperWalls.some((w) => {
          if (Math.abs(w.y - y) >= 0.05) return false;
          if (
            pointToSegmentDistance(x, z, w.a[0], w.a[1], w.b[0], w.b[1]) >=
            Math.max(t, w.t) / 2 + 0.01
          )
            return false;
          const wl = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
          const along =
            wl > 0
              ? ((x - w.a[0]) * (w.b[0] - w.a[0]) +
                  (z - w.a[1]) * (w.b[1] - w.a[1])) /
                wl
              : 0;
          return !w.doors.some(([d0, d1]) => along > d0 && along < d1);
        });
      if (covered.length) {
        const c = Math.min(...covered);
        // Under the floor's slab it stops a hair below its top, so its cap
        // never fights the floor there; where a wall of that floor stands
        // on it, it meets that wall's foot.
        if (c <= top + 0.8) v = carriesAt(c) ? c : c - JOINT_INSET_M;
      }
      // Never up through the roof over it, unless it carries a wall above
      // (then it meets that wall's foot, the roof dying into it).
      const roof = roofAcross(x, z, ux, uz, t);
      if (roof !== null && v > roof[1] && !carriesAt(v)) v = roof[1];
      v = Math.max(v, base + 0.3);
      const last = runs[runs.length - 1];
      if (last && Math.abs(last.top - v) < 0.001 && last.out === out)
        last.s1 = ((k + 1) * L) / n;
      else
        runs.push({
          s0: (k * L) / n,
          s1: ((k + 1) * L) / n,
          top: v,
          ...(out ? { out } : {}),
        });
    }
    // The joint overlaps past either end belong to the end runs.
    runs[0]!.s0 = -Infinity;
    runs[runs.length - 1]!.s1 = Infinity;
    return runs;
  };
  /** The level of the lowest wall of a floor above that runs along this
   * one (parallel, within 35 cm, over most of its length), else null. */
  const upperWallLevel = (a: Vec2, b: Vec2): number | null => {
    const ax = a[0] * m;
    const az = a[1] * m;
    const L = distance(a[0], a[1], b[0], b[1]) * m;
    if (L < 0.05) return null;
    const ux = (b[0] * m - ax) / L;
    const uz = (b[1] * m - az) / L;
    let best: number | null = null;
    for (const w of upperWalls) {
      if (best !== null && w.y >= best) continue;
      const wl = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
      if (wl < 0.05) continue;
      const vx = (w.b[0] - w.a[0]) / wl;
      const vz = (w.b[1] - w.a[1]) / wl;
      if (Math.abs(ux * vz - uz * vx) > 0.09) continue;
      const mx = (w.a[0] + w.b[0]) / 2 - ax;
      const mz = (w.a[1] + w.b[1]) / 2 - az;
      if (Math.abs(mx * uz - mz * ux) > 0.35) continue;
      const s1 = (w.a[0] - ax) * ux + (w.a[1] - az) * uz;
      const s2 = (w.b[0] - ax) * ux + (w.b[1] - az) * uz;
      const overlap =
        Math.min(L, Math.max(s1, s2)) - Math.max(0, Math.min(s1, s2));
      // Along nearly all of it: a wall only partly under the floor above
      // is trimmed (or raised) run by run in wallRuns instead.
      if (overlap > 0.9 * L) best = w.y;
    }
    return best;
  };
  const offsetAt = (x: number, y: number): number =>
    offsetRooms.find((r) => pointInPolygon(x, y, r.points))?.floor_offset_m ??
    0;

  // Staircases: each one's two long sides (metres, back to front) and
  // the floor level at either end.
  const stairs = layout.furniture
    .filter((f) => f.kind === STAIRS_KIND)
    .map((f) => {
      const a = (-f.rotation_deg * Math.PI) / 180;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      const w = f.width_cm / 100;
      const d = f.depth_cm / 100;
      // The item's frame: local (lx, lz) → world, as three's rotation.y.
      const P = (lx: number, lz: number): Vec2 => [
        f.x * m + lx * c + lz * sn,
        f.y * m - lx * sn + lz * c,
      ];
      /** The floor at a spot: a room of this floor's level, else the floor
       * above's (the flight climbs to it), else this floor's. */
      const levelAt = ([x, z]: Vec2): number => {
        const room = layout.rooms.find(
          (r) =>
            !r.outdoor &&
            r.points.length >= 3 &&
            pointInPolygon(x / m, z / m, r.points),
        );
        if (room) return room.floor_offset_m ?? 0;
        return floorAbove(x, z) ?? 0;
      };
      const front = levelAt(P(0, d / 2 + 0.3));
      const back = levelAt(P(0, -d / 2 - 0.3));
      const top = Math.max(front, back);
      // How far back from its high end the floor up there runs over it:
      // its top step is that floor.
      const high = front > back ? 1 : -1;
      const floorAt = ([x, z]: Vec2): boolean => {
        const room = layout.rooms.find(
          (r) =>
            !r.outdoor &&
            r.points.length >= 3 &&
            pointInPolygon(x / m, z / m, r.points),
        );
        const y = room ? (room.floor_offset_m ?? 0) : floorAbove(x, z);
        return y !== null && Math.abs(y - top) < 0.05;
      };
      let landing = 0;
      while (landing < d && floorAt(P(0, high * (d / 2 - landing - 0.01))))
        landing += 0.02;
      return {
        item: f,
        front,
        back,
        top,
        landing,
        sides: [
          [P(-w / 2, -d / 2), P(-w / 2, d / 2)],
          [P(w / 2, -d / 2), P(w / 2, d / 2)],
        ] as [Vec2, Vec2][],
      };
    });
  /** How much of segment [a, b] (metres) runs within `reach` of [p, q]. */
  const alongShare = (
    [a, b]: [Vec2, Vec2],
    [p, q]: [Vec2, Vec2],
    reach: number,
  ) => {
    let near = 0;
    for (let k = 0; k <= 4; k++) {
      const x = a[0] + ((b[0] - a[0]) * k) / 4;
      const z = a[1] + ((b[1] - a[1]) * k) / 4;
      if (pointToSegmentDistance(x, z, p[0], p[1], q[0], q[1]) < reach) near++;
    }
    return near / 5;
  };
  const wallSegs = layout.walls.flatMap((w) =>
    w.points.slice(1).map((q, k): [[Vec2, Vec2], number] => {
      const p = w.points[k]!;
      return [
        [
          [p[0] * m, p[1] * m],
          [q[0] * m, q[1] * m],
        ],
        wallThicknessCm(w) / 100,
      ];
    }),
  );
  /** Whether a staircase's side gets a railing: not where a wall runs
   * along it, and where two flights share a side only on the higher. */
  const railed = (si: number, side: 0 | 1): boolean => {
    const st = stairs[si]!;
    const seg = st.sides[side]!;
    if (
      wallSegs.some(
        ([w, t]) =>
          t > RAIL_THICKNESS_M && alongShare(seg, w, t / 2 + 0.12) >= 0.6,
      )
    )
      return false;
    // A wall of the floor above standing over it (a closet beside the
    // flight, open below): the flight's side is closed by that.
    if (
      upperWalls.some(
        (w) => w.y <= st.top + 0.3 && alongShare(seg, [w.a, w.b], 0.2) >= 0.6,
      )
    )
      return false;
    return !stairs.some(
      (o, oi) =>
        oi !== si &&
        o.sides.some((os) => alongShare(seg, os, 0.15) >= 0.6) &&
        (o.top > st.top || (o.top === st.top && oi < si)),
    );
  };
  /** Where a staircase side's railing runs into a wall (this floor's, or
   * one standing on a floor above, like the landing's half wall carrying
   * on from it): metres from its low and high ends at which it stops,
   * 0 where it ends free. */
  const railEnds = (si: number, side: 0 | 1): [number, number] => {
    const st = stairs[si]!;
    const f = st.item;
    const d = f.depth_cm / 100;
    const [back, front] = st.sides[side]!;
    // The railing's line, 5 cm in from the side (as drawn), low end first.
    const cx = f.x * m;
    const cz = f.y * m;
    const inset = (p: Vec2): Vec2 => {
      const mx = (back[0] + front[0]) / 2;
      const mz = (back[1] + front[1]) / 2;
      const k = Math.hypot(mx - cx, mz - cz);
      return k < 1e-6
        ? p
        : [p[0] - ((mx - cx) / k) * 0.05, p[1] - ((mz - cz) / k) * 0.05];
    };
    const low = st.front < st.back ? front : back;
    const high = low === front ? back : front;
    const p0 = inset(low);
    const p1 = inset(high);
    const rx = (p1[0] - p0[0]) / d;
    const rz = (p1[1] - p0[1]) / d;
    const bottom = Math.min(st.front, st.back);
    const rise = Math.abs(st.front - st.back);
    // The handrail's height (above this floor's level) along it.
    const railAt = (u: number) => bottom + rise * (u / d) + 0.9;
    /** The stretch of the railing's line inside a wall's footprint. */
    const inside = (a: Vec2, b: Vec2, t: number): [number, number] | null => {
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L < 0.01) return null;
      const vx = (b[0] - a[0]) / L;
      const vz = (b[1] - a[1]) / L;
      let lo = 0;
      let hi = d;
      for (const [o, du, min, max] of [
        [(p0[0] - a[0]) * vx + (p0[1] - a[1]) * vz, rx * vx + rz * vz, 0, L],
        [
          -(p0[0] - a[0]) * vz + (p0[1] - a[1]) * vx,
          -rx * vz + rz * vx,
          -t / 2 - 0.01,
          t / 2 + 0.01,
        ],
      ] as const) {
        if (Math.abs(du) < 1e-9) {
          if (o < min || o > max) return null;
          continue;
        }
        const ua = (min - o) / du;
        const ub = (max - o) / du;
        lo = Math.max(lo, Math.min(ua, ub));
        hi = Math.min(hi, Math.max(ua, ub));
      }
      return hi > lo ? [lo, hi] : null;
    };
    let lowCut = 0;
    let highCut = 0;
    const meet = (a: Vec2, b: Vec2, t: number, y0: number, y1: number) => {
      const span = inside(a, b, t);
      if (!span) return;
      const [u0, u1] = span;
      if (u1 >= d - 0.1 && railAt(u0) > y0 && railAt(u0) < y1)
        highCut = Math.max(highCut, d - u0);
      if (u0 <= 0.1 && railAt(u1) > y0 && railAt(u1) < y1)
        lowCut = Math.max(lowCut, u1);
    };
    for (const o of segsM)
      if (o.t > RAIL_THICKNESS_M) meet(o.a, o.b, o.t, -Infinity, Infinity);
    for (const w of upperWalls)
      if (w.t > RAIL_THICKNESS_M) meet(w.a, w.b, w.t, w.y, w.y + w.h);
    // A railing nearly all inside walls is no railing: left as drawn.
    return lowCut + highCut > d - 0.3 ? [0, 0] : [lowCut, highCut];
  };
  /** A thin rail along a staircase's side: the staircase's own railing
   * stands in for it. */
  const alongStairs = (a: Vec2, b: Vec2) =>
    stairs.some((st) =>
      st.sides.some((sd) => alongShare([a, b], sd, 0.2) >= 0.4),
    );

  // Every wall segment (metres), for joining free wall ends to the walls
  // they meet.
  const segsM = layout.walls.flatMap((w) =>
    w.points.slice(1).map((q, k) => {
      const p = w.points[k]!;
      return {
        id: w.id,
        a: [p[0] * m, p[1] * m] as Vec2,
        b: [q[0] * m, q[1] * m] as Vec2,
        t: wallThicknessCm(w) / 100,
      };
    }),
  );
  /** How far a wall's free end (at `end`, pointing along `dir`) runs on
   * to close against a wall it meets: past that wall's far face at an L
   * corner (the lower id a hair proud, the other a hair short), into its
   * middle at a T, across a small gap to it; 0 for a truly free end (a
   * door jamb). */
  const freeEndExt = (id: string, end: Vec2, dir: Vec2): number => {
    let ext = 0;
    for (const o of segsM) {
      if (o.t <= RAIL_THICKNESS_M) continue;
      const ux = o.b[0] - o.a[0];
      const uz = o.b[1] - o.a[1];
      const len2 = ux * ux + uz * uz;
      if (len2 < 1e-6) continue;
      const k = Math.max(
        0,
        Math.min(1, ((end[0] - o.a[0]) * ux + (end[1] - o.a[1]) * uz) / len2),
      );
      const qx = o.a[0] + ux * k - end[0];
      const qz = o.a[1] + uz * k - end[1];
      const d = Math.hypot(qx, qz);
      if (d > 0.15) continue;
      // Straight ahead (or right here), not off to the side.
      const ahead = qx * dir[0] + qz * dir[1];
      const side = Math.abs(qx * dir[1] - qz * dir[0]);
      if (ahead < -0.01 || side > 0.02) continue;
      // Not along the same line (a wall continuing straight on).
      const cross = Math.abs(ux * dir[1] - uz * dir[0]) / Math.sqrt(len2);
      if (cross < 0.5) continue;
      if (o.id === id && d < 0.005) continue;
      const atEnd =
        Math.min(
          Math.hypot(o.a[0] - end[0], o.a[1] - end[1]),
          Math.hypot(o.b[0] - end[0], o.b[1] - end[1]),
        ) < 0.02;
      const e = atEnd
        ? o.t / 2 + (id < o.id ? JOINT_PROUD_M : -JOINT_INSET_M)
        : d + o.t / 2 - JOINT_INSET_M;
      ext = Math.max(ext, Math.min(0.3, e));
    }
    return ext;
  };
  for (const wall of layout.walls) {
    const pts = wall.points;
    if (pts.length < 2) continue;
    const t = wallThicknessCm(wall) / 100;
    // A stub (a door jamb, a closet return) stands alone as an odd slab:
    // left out. One joining two walls at its ends (the short jog where a
    // wall steps over) closes the step between them: kept.
    let run = 0;
    for (let i = 0; i < pts.length - 1; i++)
      run += distance(pts[i]![0], pts[i]![1], pts[i + 1]![0], pts[i + 1]![1]);
    const joined = (p: Vec2) =>
      segsM.some(
        (o) =>
          o.id !== wall.id &&
          o.t > RAIL_THICKNESS_M &&
          pointToSegmentDistance(
            p[0] * m,
            p[1] * m,
            o.a[0],
            o.a[1],
            o.b[0],
            o.b[1],
          ) < 0.02,
      );
    if (run * m < STUB_M && !(joined(pts[0]!) && joined(pts[pts.length - 1]!)))
      continue;
    // A thin one is a stair rail or balustrade: waist high.
    const rail = t <= RAIL_THICKNESS_M;
    // A half wall (a landing's guard) stops about a metre up, capped.
    const half = wall.material === HALF_WALL_MATERIAL;
    const closed =
      pts.length > 2 &&
      distance(
        pts[0]![0],
        pts[0]![1],
        pts[pts.length - 1]![0],
        pts[pts.length - 1]![1],
      ) < 1e-6;
    // Openings on each segment.
    const bySeg = new Map<number, OpeningOnSegment[]>();
    for (const opening of layout.openings) {
      if (opening.wallId !== wall.id) continue;
      const { segmentIndex } = nearestPointOnPolyline(
        pts,
        opening.x,
        opening.y,
      );
      const a = pts[segmentIndex]!;
      const b = pts[segmentIndex + 1];
      if (!b) continue;
      const len = distance(a[0], a[1], b[0], b[1]);
      if (len <= 0) continue;
      const along =
        ((opening.x - a[0]) * (b[0] - a[0]) +
          (opening.y - a[1]) * (b[1] - a[1])) /
        len;
      const list = bySeg.get(segmentIndex) ?? [];
      list.push({ opening, s: along * m, half: (opening.width * m) / 2 });
      bySeg.set(segmentIndex, list);
    }

    // A line drawn out and back over itself would be drawn twice.
    const drawn: [number, number, number, number][] = [];
    const onDrawn = (x: number, y: number) =>
      drawn.some(
        ([x1, y1, x2, y2]) =>
          pointToSegmentDistance(x, y, x1, y1, x2, y2) * m < 0.02,
      );
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i]!;
      const [bx, by] = pts[i + 1]!;
      const L = distance(ax, ay, bx, by) * m;
      if (L < 0.005) continue;
      if (
        onDrawn(ax, ay) &&
        onDrawn(bx, by) &&
        onDrawn((ax + bx) / 2, (ay + by) / 2)
      )
        continue;
      drawn.push([ax, ay, bx, by]);
      const dx = ((bx - ax) * m) / L;
      const dz = ((by - ay) * m) / L;
      const angle = Math.atan2(-dz, dx);
      const at = (s: number): Vec2 => [ax * m + dx * s, ay * m + dz * s];
      const {
        base,
        top: fullTop,
        level: off,
        outside,
      } = wallSpan([ax, ay], [bx, by], t);
      const runs = wallRuns([ax, ay], [bx, by], t, base, fullTop);
      /** The lowest top over [s0, s1]. */
      const topOver = (s0: number, s1: number) =>
        Math.min(
          ...runs.filter((r) => r.s1 > s0 && r.s0 < s1).map((r) => r.top),
        );
      // Overlap the next/previous segment at joints so corners close.
      // Overlap the next/previous segment at joints so corners close —
      // a hair short of its outer face, so the two boxes' faces never lie
      // in one plane (they'd flicker in stripes).
      // Overlap the next/previous segment at joints so corners close: a
      // segment's end runs a hair past the other's outer face and the next
      // one's start stops a hair short, so their faces never share a plane
      // (they'd flicker) and no notch is left at the outer corner. A free
      // end meeting another wall (an L or a T, or falling just short of
      // one) reaches into it the same way.
      const ext0 =
        i > 0 || closed
          ? Math.max(0, t / 2 - JOINT_INSET_M)
          : freeEndExt(wall.id, [ax * m, ay * m], [-dx, -dz]);
      const ext1 =
        i < pts.length - 2 || closed
          ? t / 2 + JOINT_PROUD_M
          : freeEndExt(wall.id, [bx * m, by * m], [dx, dz]);
      const box = (
        s0: number,
        s1: number,
        y0: number,
        y1: number,
        depth = t,
        side: 1 | -1 | undefined = outside,
      ): Box3d => {
        const [x, z] = at((s0 + s1) / 2);
        return {
          x,
          z,
          y0,
          y1,
          length: s1 - s0,
          // An inside wall a hair thinner than drawn, so where it carries
          // straight on from an outside wall their faces never share a
          // plane (the sided and the painted would fight).
          depth: depth === t && !side ? t - 2 * JOINT_INSET_M : depth,
          angle,
          ...(side && depth === t ? { outside: side } : {}),
        };
      };
      // The front: a door gets a porch, the rest a stone wainscot.
      const outward: Vec2 | null = outside
        ? [-dz * outside, dx * outside]
        : null;
      const facesFront =
        !!outward &&
        outward[0] * exterior.front[0] + outward[1] * exterior.front[1] > 0.7;
      let porched = false;
      const door = facesFront
        ? (bySeg.get(i) ?? []).find(
            (o) => o.opening.type === "door" && !o.opening.garage,
          )
        : undefined;
      if (door && outward && !rail) {
        const out = (p: Vec2, d: number): Vec2 => [
          p[0] + outward[0] * d,
          p[1] + outward[1] * d,
        ];
        const stepOut = out(at(door.s), t / 2 + 0.6);
        const ontoDeck = layout.rooms.some(
          (r) =>
            r.outdoor &&
            r.points.length >= 3 &&
            pointInPolygon(stepOut[0] / m, stepOut[1] / m, r.points),
        );
        if (!ontoDeck) {
          porched = true;
          // A short wall's porch spans it; a long one's, the door and a
          // little either side.
          const s0 = L <= 3.5 ? 0 : Math.max(0, door.s - door.half - 0.9);
          const s1 = L <= 3.5 ? L : Math.min(L, door.s + door.half + 0.9);
          const wa = out(at(s0), t / 2);
          const wb = out(at(s1), t / 2);
          const ob = out(wb, PORCH_DEPTH_M);
          const oa = out(wa, PORCH_DEPTH_M);
          // Which of its sides a wall meets (a garage standing forward of
          // the door): no post there, and its roof runs on into that wall's.
          const abuts = ([corner, wallEnd]: [Vec2, Vec2]) => {
            const side: Vec2 = [
              (corner[0] + wallEnd[0]) / 2,
              (corner[1] + wallEnd[1]) / 2,
            ];
            return layout.walls.some((w) =>
              w.points.some((p, k) => {
                const q = w.points[k + 1];
                return (
                  !!q &&
                  pointToSegmentDistance(
                    side[0] / m,
                    side[1] / m,
                    p[0],
                    p[1],
                    q[0],
                    q[1],
                  ) *
                    m <
                    0.25
                );
              }),
            );
          };
          const abutted: [boolean, boolean] = [
            abuts([oa, wa]),
            abuts([ob, wb]),
          ];
          porches.push({
            corners: [wa, wb, ob, oa],
            eave: off + PORCH_EAVE_M,
            abutted,
          });
          const mid = out(at((s0 + s1) / 2), t / 2 + PORCH_DEPTH_M / 2);
          // A raised slab: level with the door when the ground is about a
          // step below it (one step up from the ground, as from a garage a
          // step down), else a step below the door.
          const grade = exterior.groundAt?.(mid[0], mid[1]);
          const ground =
            grade === undefined ? undefined : grade - GROUND_DRAWN_M;
          const pad =
            ground !== undefined && off - ground > 0.05 && off - ground < 0.25
              ? off - 0.01
              : off - 0.12;
          walls.push({
            x: mid[0],
            z: mid[1],
            y0: Math.min(pad, off - 0.12) - 0.38,
            y1: pad,
            length: s1 - s0,
            depth: PORCH_DEPTH_M,
            angle,
            color: CONCRETE,
          });
          // A post at each open corner.
          for (const [corner, along, side] of [
            [oa, 1, 0],
            [ob, -1, 1],
          ] as const) {
            if (abutted[side]) continue;
            const inset = POST_M / 2 + 0.05;
            walls.push({
              x: corner[0] + dx * along * inset - outward[0] * inset,
              z: corner[1] + dz * along * inset - outward[1] * inset,
              y0: pad,
              y1: off + PORCH_EAVE_M,
              length: POST_M,
              depth: POST_M,
              angle,
              color: CEDAR,
            });
          }
        }
      }
      const stoneTop = facesFront && !porched ? exterior.stoneTop : -Infinity;
      /** Solid wall over [s0, s1] from y0 up to `y1` (else the wall's
       * top), cut where the top changes along it; stone below the front's
       * wainscot line. */
      const solid = (s0: number, s1: number, y0: number, y1?: number) => {
        for (const r of runs) {
          const p0 = Math.max(s0, r.s0);
          const p1 = Math.min(s1, r.s1);
          const hi = Math.min(y1 ?? r.top, r.top);
          if (p1 - p0 <= 0.001 || hi - y0 <= 0.005) continue;
          const cut = Math.max(y0, Math.min(hi, stoneTop));
          // Out of doors where this stretch is, else as the wall is.
          const side = outside ?? r.out;
          if (cut - y0 > 0.005)
            walls.push({ ...box(p0, p1, y0, cut, t, side), stone: true });
          if (hi - cut > 0.005) walls.push(box(p0, p1, cut, hi, t, side));
        }
      };
      const nx = -dz * (t / 2);
      const nz = dx * (t / 2);
      const a0 = at(-ext0);
      const a1 = at(L + ext1);
      wallFaces.push({
        a: [a0[0] + nx, a0[1] + nz],
        b: [a1[0] + nx, a1[1] + nz],
        normal: [-dz, dx],
      });
      wallFaces.push({
        a: [a0[0] - nx, a0[1] - nz],
        b: [a1[0] - nx, a1[1] - nz],
        normal: [dz, -dx],
      });
      if (half) {
        const top = base + HALF_WALL_M;
        walls.push(box(-ext0, L + ext1, base, top));
        // Standing at the floor's open edge (over a stairwell), it gets a
        // header down through the floor's depth, so it doesn't stand on a
        // bare slab edge; not where a wall below carries it or a flight
        // comes up under it.
        const reach = t / 2 + 0.12;
        const hasRoom = (x: number, z: number) =>
          layout.rooms.some(
            (r) =>
              !r.outdoor &&
              r.points.length >= 3 &&
              pointInPolygon(x / m, z / m, r.points),
          );
        const open = (sv: number) => {
          const [x, z] = at(sv);
          // Which side is floor: judged a little in from the ends, so a
          // corner (the floor carrying on round it) doesn't count.
          const [sx, sz] = at(Math.min(Math.max(sv, t), L - t));
          const sides = [
            hasRoom(sx - dz * reach, sz + dx * reach),
            hasRoom(sx + dz * reach, sz - dx * reach),
          ];
          if (sides[0] === sides[1]) return false;
          if (
            exterior.below.walls.some(
              (w) =>
                pointToSegmentDistance(x, z, w.a[0], w.a[1], w.b[0], w.b[1]) <
                (w.t + t) / 2,
            )
          )
            return false;
          return !exterior.below.flights.some((poly) =>
            pointInPolygon(x, z, poly),
          );
        };
        const step = 0.05;
        let from: number | null = null;
        for (let sv = -ext0; sv <= L + ext1 + 1e-9; sv += step) {
          const end = Math.min(sv + step, L + ext1);
          const on = open(Math.min((sv + end) / 2, L + ext1));
          if (on && from === null) from = sv;
          if ((!on || end >= L + ext1) && from !== null) {
            const to = on ? end : sv;
            if (to - from > 0.2)
              walls.push(box(from, to, base - FLOOR_EDGE_M, base));
            from = null;
          }
          if (end >= L + ext1) break;
        }
        walls.push({
          ...box(-ext0, L + ext1, top, top + 0.04, t + 0.04),
          color: dark ? TRIM_WHITE_DARK : BANISTER_WHITE,
        });
        continue;
      }
      if (rail) {
        if (alongStairs(at(0), at(L))) continue;
        // A banister: newel posts at its ends, spindles between, and a
        // handrail on top.
        const top = base + RAIL_HEIGHT_M;
        const white = dark ? TRIM_WHITE_DARK : BANISTER_WHITE;
        for (const s of [0, L])
          walls.push({
            ...box(s - NEWEL_M / 2, s + NEWEL_M / 2, base, top + 0.06, NEWEL_M),
            color: white,
          });
        walls.push({
          ...box(0, L, top - HANDRAIL_H_M, top, HANDRAIL_W_M),
          color: HANDRAIL_WOOD,
        });
        walls.push({
          ...box(0, L, base + 0.06, base + 0.1, 0.05),
          color: white,
        });
        const count = Math.floor(L / SPINDLE_GAP_M);
        for (let k = 1; k < count; k++) {
          const sk = (L * k) / count;
          walls.push({
            ...box(
              sk - SPINDLE_M / 2,
              sk + SPINDLE_M / 2,
              base + 0.1,
              top - HANDRAIL_H_M,
              SPINDLE_M,
            ),
            color: white,
          });
        }
        continue;
      }
      // An outside wall standing above a falling grade (a garage on a
      // slope) carries on down to the ground as its foundation: stone
      // along the front, concrete elsewhere.
      // A wall over a lower floor stands on that floor's walls, and one
      // overhanging it a little (a bay) is cantilevered.
      // Its top stops a hair under the floor (no fighting the floor where a
      // door leaves it bare), and the wall comes down to meet it.
      let foot = base;
      const [mx, mz] = at(L / 2);
      if (
        outside &&
        exterior.groundAt &&
        !exterior.lowerRoomNear(mx, mz, t / 2 + 0.6)
      ) {
        const [x0, z0] = at(-ext0);
        const [x1, z1] = at(L + ext1);
        const ground =
          Math.min(exterior.groundAt(x0, z0), exterior.groundAt(x1, z1)) - 0.1;
        if (base - ground > 0.02) {
          foot = base - JOINT_INSET_M;
          walls.push({
            ...box(-ext0, L + ext1, ground, foot),
            ...(facesFront ? { stone: true } : { color: FOUNDATION }),
          });
        }
      }

      const holes = (bySeg.get(i) ?? [])
        .map((o) => ({
          ...o,
          s0: Math.max(0, o.s - o.half),
          s1: Math.min(L, o.s + o.half),
        }))
        .filter((o) => o.s1 - o.s0 > 0.01)
        .sort((p, q) => p.s0 - q.s0);
      let cursor = -ext0;
      for (const hole of holes) {
        const { opening } = hole;
        if (hole.s0 > cursor) solid(cursor, hole.s0, foot);
        const top = topOver(hole.s0, hole.s1);
        const isDoor = opening.type === "door";
        // A window's kind sets its glass: a transom is a ~45 cm strip just
        // under the ceiling, floor-to-ceiling runs the full wall height.
        const style = isDoor ? undefined : opening.window_style;
        // A window right beside a door is its sidelight: no taller than it.
        const beside = isDoor
          ? undefined
          : holes.find(
              (h) =>
                h.opening.type === "door" &&
                Math.max(h.s0 - hole.s1, hole.s0 - h.s1) < SIDELIGHT_GAP_M,
            );
        const defaultHead = beside
          ? DOOR_HEAD_M
          : style === "transom"
            ? H - 0.15
            : style === "full"
              ? H
              : WINDOW_HEAD_M;
        const head =
          Math.min(
            top - off,
            isDoor || beside
              ? DOOR_HEAD_M
              : (opening.daylight?.head_m ?? defaultHead),
          ) + off;
        let sill =
          (isDoor
            ? 0
            : style === "transom"
              ? Math.max(0, head - off - 0.45)
              : style === "full"
                ? 0
                : Math.min(WINDOW_SILL_M, head - off - 0.1)) + off;
        // A window in an outside wall stays clear of the ground.
        if (!isDoor && outside && exterior.groundAt) {
          const [gx, gz] = at(hole.s);
          const clear = exterior.groundAt(gx, gz) - GROUND_DRAWN_M + 0.15;
          if (sill < clear) sill = Math.min(clear, head - 0.3);
        }
        // Under a door (a step up from a lower room) it stops a hair under
        // the floor it leads onto.
        if (sill > base)
          solid(hole.s0, hole.s1, foot, isDoor ? sill - JOINT_INSET_M : sill);
        if (head < top - 0.005) walls.push(box(hole.s0, hole.s1, head, top));
        // An outside door: a patio door (wide) glazed like a window, any
        // other shut with a door leaf; doors between rooms stand open.
        const outdoorDoor = isDoor && !!outside;
        const patio = outdoorDoor && !opening.garage && hole.s1 - hole.s0 > 1.2;
        if (!isDoor || patio) {
          panes.push({
            box: box(
              hole.s0 + JOINT_INSET_M,
              hole.s1 - JOINT_INSET_M,
              sill + JOINT_INSET_M,
              head - JOINT_INSET_M,
              0.02,
            ),
            kind: "glass",
            color: "#86a6bd",
            opacity: 0.38,
          });
        } else if (outdoorDoor && !opening.garage) {
          walls.push({
            ...box(hole.s0, hole.s1, sill, head, 0.05),
            color: dark ? DOOR_DARK : DOOR,
          });
        }
        // White casing round a window or door in an outside wall, standing
        // a little proud of the siding so it reads from the street; a
        // patio door's frame splits it in two.
        if (outside && (!isDoor || outdoorDoor)) {
          const w = WINDOW_TRIM_M;
          const d = t + 0.04;
          const trim = dark ? TRIM_WHITE_DARK : TRIM_WHITE;
          const pieces: [number, number, number, number][] = [
            // Each piece laps a few millimetres into the opening, so its
            // faces never share a plane with the wall's.
            [
              hole.s0 - w,
              hole.s0 + JOINT_INSET_M,
              isDoor ? sill : sill - w,
              head + w,
            ],
            [
              hole.s1 - JOINT_INSET_M,
              hole.s1 + w,
              isDoor ? sill : sill - w,
              head + w,
            ],
            [hole.s0, hole.s1, head - JOINT_INSET_M, head + w],
          ];
          if (!isDoor)
            pieces.push([hole.s0, hole.s1, sill - w, sill + JOINT_INSET_M]);
          if (patio) {
            const mid = (hole.s0 + hole.s1) / 2;
            pieces.push([mid - w / 2, mid + w / 2, sill, head]);
          }
          // Never past the wall's own ends (a door hard by a corner): the
          // wall beyond belongs to the next one.
          for (const [s0, s1, y0, y1] of pieces) {
            const p0 = Math.max(s0, 0);
            const p1 = Math.min(s1, L);
            if (p1 - p0 > 0.005)
              walls.push({ ...box(p0, p1, y0, y1, d), color: trim });
          }
        }
        // Covers: blinds over a window, an overhead garage door. Each
        // drops from the head by how closed it is; two covers split the
        // opening in halves.
        const span = head - sill;
        const halves: [number, number, string | null | undefined, string][] =
          opening.cover_right_entity_id
            ? [
                [
                  hole.s0,
                  (hole.s0 + hole.s1) / 2,
                  opening.cover_entity_id,
                  opening.id,
                ],
                [
                  (hole.s0 + hole.s1) / 2,
                  hole.s1,
                  opening.cover_right_entity_id,
                  `${opening.id}:right`,
                ],
              ]
            : [[hole.s0, hole.s1, opening.cover_entity_id, opening.id]];
        for (const [s0, s1, entityId, key] of halves) {
          const garage = !!opening.garage;
          if (!entityId && !garage) continue;
          // A garage door without a cover shows closed.
          const covered = entityId ? coveredFraction(covers.get(key)) : 1;
          if (covered <= 0.01) continue;
          panes.push({
            box: box(
              s0,
              s1,
              head - covered * span,
              head,
              garage ? Math.min(0.06, t) : 0.03,
            ),
            kind: garage ? "door" : "cover",
            color: garage
              ? dark
                ? "#90a4ae"
                : "#cfd8dc"
              : dark
                ? "#8d8574"
                : "#efe6d2",
            opacity: garage ? 1 : 0.92,
          });
        }
        cursor = hole.s1;
      }
      if (L + ext1 > cursor) solid(cursor, L + ext1, foot);
    }
  }

  // A deck standing above the ground: posts down to it, a rim board round
  // its edge and a railing along the sides no wall meets.
  if (exterior.groundAt) {
    const groundAt = exterior.groundAt;
    const along = (a: Vec2, b: Vec2, y0: number, y1: number, depth: number) => {
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      return {
        x: (a[0] + b[0]) / 2,
        z: (a[1] + b[1]) / 2,
        y0,
        y1,
        length: len,
        depth,
        angle: Math.atan2(-(b[1] - a[1]), b[0] - a[0]),
      };
    };
    const nearWall = (x: number, y: number) =>
      layout.walls.some((w) =>
        w.points.some((p, k) => {
          const q = w.points[k + 1];
          return (
            !!q &&
            pointToSegmentDistance(x, y, p[0], p[1], q[0], q[1]) * m <
              wallThicknessCm(w) / 200 + 0.15
          );
        }),
      );
    for (const room of layout.rooms) {
      if (!room.outdoor || room.points.length < 3) continue;
      const level = room.floor_offset_m ?? 0;
      const pts = room.points.map(([x, y]): Vec2 => [x * m, y * m]);
      const lowest = Math.min(...pts.map(([x, z]) => groundAt(x, z)));
      if (level - lowest < 0.5) continue;
      const wood = dark ? DECK_WOOD_DARK : DECK_WOOD;
      const rail = dark ? TRIM_DARK : TRIM;
      // Which way is inside: the polygon's winding.
      let area2 = 0;
      pts.forEach(([x, z], k) => {
        const [x2, z2] = pts[(k + 1) % pts.length]!;
        area2 += x * z2 - x2 * z;
      });
      const inward = area2 > 0 ? 1 : -1;
      const post = (x: number, z: number, top: number) =>
        walls.push({
          x,
          z,
          y0: groundAt(x, z) - 0.1,
          y1: top,
          length: DECK_POST_M,
          depth: DECK_POST_M,
          angle: 0,
          color: wood,
        });
      pts.forEach((a, k) => {
        const b = pts[(k + 1) % pts.length]!;
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len < 0.05) return;
        const ux = (b[0] - a[0]) / len;
        const uz = (b[1] - a[1]) / len;
        // Inward normal, and the edge pulled in to the posts' line.
        const nx = -uz * inward;
        const nz = ux * inward;
        const inset = DECK_POST_M / 2;
        const pa: Vec2 = [a[0] + nx * inset, a[1] + nz * inset];
        const pb: Vec2 = [b[0] + nx * inset, b[1] + nz * inset];
        const mid = [(a[0] + b[0]) / 2 / m, (a[1] + b[1]) / 2 / m] as const;
        const open = !nearWall(mid[0], mid[1]);
        // Rim board under the deck's edge.
        walls.push({
          ...along(a, b, level - 0.3, level - 0.02, 0.05),
          color: wood,
        });
        const n = Math.max(1, Math.ceil(len / DECK_POST_SPAN_M));
        for (let i = 0; i <= n; i++) {
          if (i === n && n > 0 && open) continue; // the next edge's first
          const x = pa[0] + (pb[0] - pa[0]) * (i / n);
          const z = pa[1] + (pb[1] - pa[1]) * (i / n);
          // Under a wall side only the corners need posts.
          if (!open && i > 0 && i < n) continue;
          post(x, z, open ? level + RAIL_TOP_M : level - 0.02);
        }
        if (!open) return;
        walls.push({
          ...along(pa, pb, level + RAIL_TOP_M - 0.06, level + RAIL_TOP_M, 0.09),
          color: wood,
        });
        walls.push({
          ...along(pa, pb, level + 0.08, level + 0.12, 0.05),
          color: rail,
        });
        const count = Math.floor(len / 0.12);
        for (let i = 1; i < count; i++) {
          const f = i / count;
          walls.push({
            x: pa[0] + (pb[0] - pa[0]) * f,
            z: pa[1] + (pb[1] - pa[1]) * f,
            y0: level + 0.12,
            y1: level + RAIL_TOP_M - 0.06,
            length: 0.025,
            depth: 0.025,
            angle: Math.atan2(-uz, ux),
            color: rail,
          });
        }
      });
    }
  }

  // Room slabs, tinted like the plan's room fills.
  const lights = computeRoomLights(layout.rooms, hass);
  const floorBase = dark ? "#3b3936" : "#ece7df";
  const deckBase = dark ? "#5d4a3a" : "#b8916b";
  const slabs: Slab3d[] = [];
  for (const room of layout.rooms) {
    if (room.visible === false || room.points.length < 3) continue;
    const light = showLights ? lights.get(room.id) : undefined;
    // The floor wears the room's own fill; lights only make it glow (a
    // room with its lights off isn't shaded dark, as on the plan).
    const fill = roomFillStyle(
      room.fill_color ?? DEFAULT_ROOM_FILL_COLOR,
      room.fill_opacity ?? DEFAULT_ROOM_FILL_OPACITY,
      light && light.on > 0 ? light : undefined,
      dark,
    );
    const lit = !!light && light.on > 0;
    slabs.push({
      id: room.id,
      name: room.name,
      y: room.floor_offset_m ?? 0,
      points: room.points.map(([x, y]): Vec2 => [x * m, y * m]),
      color: mixHex(
        room.outdoor ? deckBase : floorBase,
        fill.color,
        Math.min(1, fill.opacity * 1.6),
      ),
      finish: floorFinish(room.name, !!room.outdoor),
      tinted: fill.opacity > 0.05,
      emissive: lit ? light.color : null,
      // A lit room's glow shows at night; daylight drowns it out.
      emissiveIntensity: lit
        ? (0.06 + 0.18 * Math.min(1, light.level)) * nightGlow
        : 0,
      outdoor: !!room.outdoor,
    });
    // A closet beside a stairwell, nothing over it: its top is a ledge
    // seen from the stairs, so it gets a lid at its walls' height.
    if (
      !room.outdoor &&
      /closet|pantry|storage/i.test(room.name) &&
      stairs.some((st) =>
        st.sides.some(([a, b]) =>
          room.points.some(
            ([x, y]) =>
              pointToSegmentDistance(x * m, y * m, a[0], a[1], b[0], b[1]) <
              0.6,
          ),
        ),
      )
    ) {
      const pts = room.points.map(([x, y]): Vec2 => [x * m, y * m]);
      const cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      const cz = pts.reduce((s, p) => s + p[1], 0) / pts.length;
      if (floorAbove(cx, cz) === null)
        slabs.push({
          id: `${room.id}:ledge`,
          name: `${room.name} ledge`,
          y: (room.floor_offset_m ?? 0) + H - LID_DROP_M,
          points: pts,
          color: dark ? "#8a8580" : "#f4f1ec",
          finish: "plain",
          tinted: true,
          emissive: null,
          emissiveIntensity: 0,
          outdoor: false,
          lid: true,
        });
    }
  }

  // Furniture.
  const states = computeItemStates(layout.furniture, hass);
  const items: Item3d[] = [];
  for (const item of layout.furniture) {
    // An open free-form line is a mark on the plan, not a thing in the
    // room: left out.
    if (item.points && item.points.length >= 2 && item.closed === false)
      continue;
    const entry = catalogItem(item.kind);
    const flip = !!item.mirrored !== !!entry?.flip;
    const prims = itemPrims(item, entry);
    const placed = itemHeight(item.kind, entry, H);
    // In a room set higher or lower, with it.
    const height = placed.height;
    const y0 = placed.y0 + offsetAt(item.x, item.y);
    const live = states.get(item.id);
    const own = item.color ?? null;
    const line = live?.color ?? own ?? (dark ? "#e0e0e0" : "#4a4a4a");
    const base = mixHex(
      dark ? "#4a4744" : "#f6f3ee",
      own ?? line,
      own ? 0.18 : 0,
    );
    const side = mixHex(
      dark ? "#5a5550" : "#d9d2c6",
      own ?? line,
      own ? 0.35 : 0.08,
    );
    const isLight = item.entity_id?.startsWith("light.") === true;
    const on = !!live && live.active && isLight && showLights;
    const shape = itemShape(item.kind, entry);
    const si = stairs.findIndex((st) => st.item === item);
    const flight = si >= 0 ? stairs[si]! : null;
    items.push({
      id: item.id,
      name: item.label || entry?.name || item.kind,
      footprint: itemFootprint(item, entry, prims, flip),
      width: item.width_cm / 100,
      depth: item.depth_cm / 100,
      x: item.x * m,
      z: item.y * m,
      angle: (-item.rotation_deg * Math.PI) / 180,
      y0: flight ? Math.min(flight.front, flight.back) : y0,
      height: flight ? Math.abs(flight.front - flight.back) : height,
      ...(flight
        ? {
            stairs: {
              front: flight.front,
              back: flight.back,
              rails: [railed(si, 0), railed(si, 1)] as [boolean, boolean],
              landing: flight.landing,
              railEnds: [railEnds(si, 0), railEnds(si, 1)] as [
                [number, number],
                [number, number],
              ],
            },
          }
        : {}),
      color: side,
      topImage: topImage(item, prims, flip, line, base, !!live?.active),
      opacity: (item.opacity ?? 1) * (live?.unavailable ? 0.6 : 1),
      light: on
        ? {
            color: live.color ?? "#ffd54f",
            level: Math.max(0.15, live.glow),
            y:
              shape === "lamp"
                ? y0 + height - 0.15
                : y0 > H * 0.5
                  ? y0 - 0.05
                  : y0 + height + 0.05,
          }
        : null,
      shape,
    });
  }

  return {
    floorId: input.floorId,
    name: input.name,
    baseY: input.baseY,
    wallHeight: H,
    walls,
    hasStairs: stairs.length > 0,
    wallColor: dark ? "#8a8580" : "#f4f1ec",
    sidingColor: dark ? SIDING_DARK : SIDING,
    stoneColor: dark ? STONE_DARK : STONE,
    porches,
    panes,
    slabs,
    items,
    wallFaces,
    metersPerUnit: m,
  };
}

/** A floor finish to suit a room, by its name: tile where it gets wet or
 * walked in from outside, carpet in bedrooms, concrete in a garage or an
 * unfinished space, wood elsewhere; decks are boards. */
function floorFinish(name: string, outdoor: boolean): FloorFinish {
  if (outdoor) return "deck";
  const n = name.toLowerCase();
  if (/garage|crawl|mech|furnace|utility|storage|unfinished|gym/.test(n))
    return "concrete";
  if (/bath|laundry|entry|foyer|mud|powder|shower|toilet|dog|wc/.test(n))
    return "tile";
  if (/bed|guest|nursery|kid|room$/.test(n)) return "carpet";
  return "wood";
}

export function buildScene(input: SceneInput): Scene3d {
  const { hass, dark } = input;
  // The sun: from HA's home location when known, else a pleasant
  // afternoon so the scene still has shape. The plan's compass (north_deg,
  // from whichever floor has it set) turns it; unset means north is up.
  const northDeg =
    input.floors.find((f) => f.layout.north_deg != null)?.layout.north_deg ?? 0;
  const lat = hass?.config?.latitude;
  const lon = hass?.config?.longitude;
  const pos =
    typeof lat === "number" && typeof lon === "number"
      ? sunPosition(input.date, lat, lon)
      : { azimuth: 200, elevation: 40 };
  const clouds = input.sky?.clouds ?? 0;
  const day = daylight(pos.elevation);
  // The street: the hillside's high side, else the plan's bottom.
  const front: Vec2 = input.ground
    ? (() => {
        const [dx, dz] = planVector(input.ground.downhill_deg, northDeg);
        return [-dx, -dz] as Vec2;
      })()
    : [0, 1];
  const grade = input.ground?.uphill_m ?? 0;
  const site = input.ground ? terrain(input, input.ground, northDeg) : null;
  // The planned roof's sections, to tell walls under it from walls out in
  // the open.
  const planM = metersPerUnit(
    [...(input.context ?? input.floors)].sort((a, b) => a.baseY - b.baseY)[0]
      ?.layout.scale ?? null,
  );
  const sections = (input.roofPlan?.parts ?? []).map((p) =>
    partSection(p, planM),
  );
  const roofOver = (x: number, z: number): number | null => {
    let best: number | null = null;
    for (const s of sections) {
      const h = sectionHeightAt(s, x, z);
      if (h !== null && (best === null || h > best)) best = h;
    }
    return best;
  };
  const floors = input.floors.map((f) =>
    buildFloor(
      f,
      hass,
      dark,
      input.showLights,
      1 - 0.75 * day,
      floorAboveOf(f, input.context ?? input.floors),
      upperWallsOf(f, input.context ?? input.floors),
      {
        front,
        stoneTop: grade + STONE_M - f.baseY,
        groundAt: site
          ? (x: number, z: number) => groundHeight(site, x, z) - f.baseY
          : null,
        roofOver: (x, z) => {
          const h = roofOver(x, z);
          return h === null ? null : h - f.baseY;
        },
        lowerRoomNear: (x, z, reach) =>
          (input.context ?? input.floors).some((g) => {
            if (g.baseY >= f.baseY - 0.3) return false;
            const m = metersPerUnit(g.layout.scale);
            const px = x / m;
            const py = z / m;
            return g.layout.rooms.some(
              (r) =>
                !r.outdoor &&
                r.points.length >= 3 &&
                (pointInPolygon(px, py, r.points) ||
                  r.points.some((a, k) => {
                    const b = r.points[(k + 1) % r.points.length]!;
                    return (
                      pointToSegmentDistance(px, py, a[0], a[1], b[0], b[1]) *
                        m <
                      reach
                    );
                  })),
            );
          }),
        below: belowOf(f, input.context ?? input.floors),
      },
    ),
  );
  let sun: Scene3d["sun"] = null;
  if (pos.elevation > 0) {
    const [px, py] = planVector(pos.azimuth, northDeg);
    const el = (pos.elevation * Math.PI) / 180;
    sun = {
      dir: [px * Math.cos(el), Math.sin(el), py * Math.cos(el)],
      color: cloudySunColor(pos.elevation, clouds),
      intensity: 2.6 * day * (1 - 0.65 * clouds),
    };
  }
  return {
    floors,
    sun,
    ambient: {
      // Night keeps a dim blue moonlight, enough to read the rooms by.
      sky: day > 0 ? (clouds > 0.5 ? "#dde3e8" : "#dcecff") : "#8c9eff",
      ground: day > 0 ? "#b9a88f" : "#2a2a35",
      intensity: 0.55 + 0.7 * day,
    },
    terrain: site,
    roof: input.roof ? cachedRoof(input, northDeg, floors) : null,
    background: dark
      ? day > 0
        ? "#1f2a33"
        : "#0e1118"
      : day > 0
        ? "#e9f1f7"
        : "#2b3140",
    dark,
  };
}

/** Grows (or, inverted, shrinks) a mask by `r` grid steps in every
 * direction, square-wise. */
function growMask(
  mask: Uint8Array,
  nx: number,
  nz: number,
  r: number,
): Uint8Array {
  const rows = new Uint8Array(mask.length);
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      let on = 0;
      for (let d = -r; d <= r && !on; d++) {
        const x = i + d;
        if (x >= 0 && x < nx) on = mask[j * nx + x]!;
      }
      rows[j * nx + i] = on;
    }
  const out = new Uint8Array(mask.length);
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      let on = 0;
      for (let d = -r; d <= r && !on; d++) {
        const y = j + d;
        if (y >= 0 && y < nz) on = rows[y * nx + i]!;
      }
      out[j * nx + i] = on;
    }
  return out;
}

/** A floor's roof eaves with its gaps filled from their neighbours: the
 * spots its rooms don't cover that the outside can't reach (a stairwell),
 * and slivers narrower than ROOF_GAP_M between rooms (a wall's thickness,
 * a closet left undrawn). */
function fillRoofGaps(eave: Float32Array, nx: number, nz: number): void {
  const N = eave.length;
  const solid = new Uint8Array(N);
  for (let k = 0; k < N; k++) solid[k] = eave[k]! > -Infinity ? 1 : 0;
  const r = Math.max(1, Math.round(ROOF_GAP_M / 2 / ROOF_STEP_M));
  const grown = growMask(solid, nx, nz, r);
  const notGrown = new Uint8Array(N);
  for (let k = 0; k < N; k++) notGrown[k] = grown[k] ? 0 : 1;
  const closed = growMask(notGrown, nx, nz, r);
  // closed[k] set: outside the closed outline.
  const open = new Uint8Array(N);
  const queue: number[] = [];
  const reach = (k: number) => {
    if (!open[k] && closed[k]) {
      open[k] = 1;
      queue.push(k);
    }
  };
  for (let i = 0; i < nx; i++) {
    reach(i);
    reach((nz - 1) * nx + i);
  }
  for (let j = 0; j < nz; j++) {
    reach(j * nx);
    reach(j * nx + nx - 1);
  }
  while (queue.length) {
    const k = queue.pop()!;
    const i = k % nx;
    if (i > 0) reach(k - 1);
    if (i < nx - 1) reach(k + 1);
    if (k >= nx) reach(k - nx);
    if (k < N - nx) reach(k + nx);
  }
  for (let pass = 0, changed = true; changed && pass < 400; pass++) {
    changed = false;
    for (let k = 0; k < N; k++) {
      if (open[k] || eave[k] !== -Infinity) continue;
      const i = k % nx;
      const best = Math.max(
        i > 0 ? eave[k - 1]! : -Infinity,
        i < nx - 1 ? eave[k + 1]! : -Infinity,
        k >= nx ? eave[k - nx]! : -Infinity,
        k < N - nx ? eave[k + nx]! : -Infinity,
      );
      if (best > -Infinity) {
        eave[k] = best;
        changed = true;
      }
    }
  }
}

/** A rectangle of grid steps along the ridge (l) and across it (k),
 * inclusive; s0..s1 is the stretch along the ridge it was found with. */
interface RoofRect {
  l0: number;
  l1: number;
  k0: number;
  k1: number;
  s0: number;
  s1: number;
}

/** Steps (chessboard) from each grid point where `from` holds to the
 * nearest where it doesn't; 0 where it doesn't. */
function chessboard(
  nx: number,
  nz: number,
  from: (k: number) => boolean,
): Float32Array {
  const d = new Float32Array(nx * nz);
  for (let k = 0; k < d.length; k++) d[k] = from(k) ? 1e9 : 0;
  for (let j = 0; j < nz; j++)
    for (let i = 0; i < nx; i++) {
      const k = j * nx + i;
      if (!d[k]) continue;
      let v = d[k]!;
      if (i > 0) v = Math.min(v, d[k - 1]! + 1);
      if (j > 0) {
        v = Math.min(v, d[k - nx]! + 1);
        if (i > 0) v = Math.min(v, d[k - nx - 1]! + 1);
        if (i < nx - 1) v = Math.min(v, d[k - nx + 1]! + 1);
      }
      d[k] = v;
    }
  for (let j = nz - 1; j >= 0; j--)
    for (let i = nx - 1; i >= 0; i--) {
      const k = j * nx + i;
      if (!d[k]) continue;
      let v = d[k]!;
      if (i < nx - 1) v = Math.min(v, d[k + 1]! + 1);
      if (j < nz - 1) {
        v = Math.min(v, d[k + nx]! + 1);
        if (i < nx - 1) v = Math.min(v, d[k + nx + 1]! + 1);
        if (i > 0) v = Math.min(v, d[k + nx - 1]! + 1);
      }
      d[k] = v;
    }
  return d;
}

/** A level's part of the building as a few big rectangles: each the
 * largest part still uncovered, then stretched along the ridge as far as
 * the part goes. Slivers under `minCells` are left out. */
function roofRects(
  inside: (l: number, k: number) => boolean,
  lines: number,
  len: number,
  minCells: number,
): RoofRect[] {
  const covered = new Uint8Array(lines * len);
  const rects: RoofRect[] = [];
  const hist = new Int32Array(len + 1);
  const stack: number[] = [];
  for (let n = 0; n < 200; n++) {
    // The largest rectangle of uncovered cells: the largest under each
    // line's histogram of uncovered runs.
    hist.fill(0);
    let best = { area: 0, l0: 0, l1: 0, k0: 0, k1: 0 };
    for (let l = 0; l < lines; l++) {
      for (let k = 0; k < len; k++)
        hist[k] = inside(l, k) && !covered[l * len + k] ? hist[k]! + 1 : 0;
      stack.length = 0;
      for (let k = 0; k <= len; k++) {
        while (stack.length && hist[stack[stack.length - 1]!]! >= hist[k]!) {
          const height = hist[stack.pop()!]!;
          const left = stack.length ? stack[stack.length - 1]! + 1 : 0;
          const area = height * (k - left);
          if (area > best.area)
            best = { area, l0: l - height + 1, l1: l, k0: left, k1: k - 1 };
        }
        stack.push(k);
      }
    }
    if (best.area < minCells) break;
    const { k0, k1 } = best;
    let { l0, l1 } = best;
    const whole = (l: number) => {
      for (let k = k0; k <= k1; k++) if (!inside(l, k)) return false;
      return true;
    };
    while (l0 > 0 && whole(l0 - 1)) l0--;
    while (l1 < lines - 1 && whole(l1 + 1)) l1++;
    for (let l = l0; l <= l1; l++)
      for (let k = k0; k <= k1; k++) covered[l * len + k] = 1;
    rects.push({ l0, l1, k0, k1, s0: best.l0, s1: best.l1 });
  }
  return rects;
}

/** The last roof built and what it was built from: the scene rebuilds
 * every minute for the sun, the roof only when the building changes (the
 * same object back, so the 3D view keeps its mesh). */
let lastRoof: {
  layouts: FloorLayout[];
  key: string;
  roof: Roof3d | null;
} | null = null;

function cachedRoof(
  input: SceneInput,
  northDeg: number,
  built: Floor3d[],
): Roof3d | null {
  const layouts = input.floors.map((f) => f.layout);
  const key = JSON.stringify([
    input.floors.map((f) => [f.floorId, f.baseY, f.wallHeight]),
    input.ground,
    input.dark,
    northDeg,
    built.map((f) => f.porches),
    input.roofPlan ?? null,
  ]);
  if (
    lastRoof &&
    lastRoof.key === key &&
    lastRoof.layouts.length === layouts.length &&
    lastRoof.layouts.every((l, i) => l === layouts[i])
  )
    return lastRoof.roof;
  const roof = input.roofPlan?.parts.length
    ? plannedRoof(input, input.roofPlan, built)
    : buildRoof(input, northDeg, built);
  lastRoof = { layouts, key, roof };
  return roof;
}

/** A roof over the whole building, from its rooms alone. Every spot is
 * roofed from the eave of the highest room under it (that room's floor
 * level plus its storey). Each eave level's roof is a hip over the part of
 * the building at least that high, rising at ROOF_PITCH from that part's
 * outside edges, so a garage's roof runs up into the house's and an upper
 * storey's stands out of both; eaves overhang all round. A narrow wing
 * standing out toward the street (across a hillside, else up the plan)
 * ends in a gable instead, its ridge running back until it meets the hip.
 * Spots inside the building that no room covers (a stairwell, a gap at a
 * wall) take their neighbours' eave. */
function buildRoof(
  input: SceneInput,
  northDeg: number,
  built: Floor3d[],
): Roof3d | null {
  const porches = built.flatMap((f) =>
    f.porches.map((p) => ({ corners: p.corners, eave: f.baseY + p.eave })),
  );
  const rooms = input.floors.flatMap((f) => {
    const m = metersPerUnit(f.layout.scale);
    return f.layout.rooms
      .filter((r) => !r.outdoor && r.points.length >= 3)
      .map((r) => {
        const points = r.points.map(([x, y]): Vec2 => [x * m, y * m]);
        const xs = points.map((p) => p[0]);
        const zs = points.map((p) => p[1]);
        return {
          floorId: f.floorId,
          eave: f.baseY + (r.floor_offset_m ?? 0) + f.wallHeight,
          points,
          box: [
            Math.min(...xs),
            Math.min(...zs),
            Math.max(...xs),
            Math.max(...zs),
          ] as const,
        };
      });
  });
  if (!rooms.length) return null;
  const step = ROOF_STEP_M;
  const pad = EAVE_M + 2 * step;
  const porchXs = porches.flatMap((p) => p.corners.map((c) => c[0]));
  const porchZs = porches.flatMap((p) => p.corners.map((c) => c[1]));
  const minX = Math.min(...rooms.map((r) => r.box[0]), ...porchXs) - pad;
  const minZ = Math.min(...rooms.map((r) => r.box[1]), ...porchZs) - pad;
  const maxX = Math.max(...rooms.map((r) => r.box[2]), ...porchXs) + pad;
  const maxZ = Math.max(...rooms.map((r) => r.box[3]), ...porchZs) + pad;
  const nx = Math.ceil((maxX - minX) / step) + 1;
  const nz = Math.ceil((maxZ - minZ) / step) + 1;
  // A plan drawn at a silly scale: no roof rather than a frozen tab.
  if (nx * nz > 600_000) return null;
  const N = nx * nz;
  // The eave over each grid point: the highest floor's, each floor's gaps
  // filled first so a stairwell doesn't let the roof sink to the floor
  // below.
  const eave = new Float32Array(N).fill(-Infinity);
  /** Per eave level, where its rooms are (under a higher storey or not). */
  const roomsAt = new Map<number, Uint8Array>();
  for (const f of input.floors) {
    const own = new Float32Array(N).fill(-Infinity);
    for (const r of rooms) {
      if (r.floorId !== f.floorId) continue;
      const i0 = Math.max(0, Math.floor((r.box[0] - minX) / step));
      const i1 = Math.min(nx - 1, Math.ceil((r.box[2] - minX) / step));
      const j0 = Math.max(0, Math.floor((r.box[1] - minZ) / step));
      const j1 = Math.min(nz - 1, Math.ceil((r.box[3] - minZ) / step));
      for (let j = j0; j <= j1; j++)
        for (let i = i0; i <= i1; i++) {
          const k = j * nx + i;
          if (own[k]! >= r.eave) continue;
          if (pointInPolygon(minX + i * step, minZ + j * step, r.points))
            own[k] = r.eave;
        }
    }
    fillRoofGaps(own, nx, nz);
    for (let k = 0; k < N; k++) {
      if (own[k]! > eave[k]!) eave[k] = own[k]!;
      if (own[k]! > -Infinity) {
        const key = Math.round(own[k]! * 100) / 100;
        let mask = roomsAt.get(key);
        if (!mask) roomsAt.set(key, (mask = new Uint8Array(N)));
        mask[k] = 1;
      }
    }
  }

  // Ridges toward the street: lines run across it, and each eave level's
  // roof rises from both ends of each of its runs along a line.
  let ridgeAlongX = false;
  // Which way along a ridge the street is: +1 toward higher l.
  let ahead = 1;
  if (input.ground) {
    const [dx, dz] = planVector(input.ground.downhill_deg, northDeg);
    ridgeAlongX = Math.abs(dx) > Math.abs(dz);
    ahead = (ridgeAlongX ? dx : dz) > 0 ? -1 : 1;
  }
  const lines = ridgeAlongX ? nx : nz;
  const len = ridgeAlongX ? nz : nx;
  const at = (line: number, k: number) =>
    ridgeAlongX ? k * nx + line : line * nx + k;
  const heights = new Float32Array(N).fill(NaN);
  const eaves = new Float32Array(N).fill(NaN);
  const raise = (k: number, h: number, e: number) => {
    if (!(heights[k]! >= h)) {
      heights[k] = h;
      eaves[k] = e;
    }
  };
  const levels = new Set<number>();
  for (const e of eave)
    if (e > -Infinity) levels.add(Math.round(e * 100) / 100);
  const over = Math.round(EAVE_M / step);
  // Lowest first: a higher part's roof rises into a lower one that
  // already stands above its eave instead of sloping down to it.
  for (const level of [...levels].sort((a, b) => a - b)) {
    // This level's part, with slivers of a lower part between its rooms
    // (a recess a few centimetres wide) closed over, so they don't split
    // its roof.
    const raw = new Uint8Array(N);
    for (let k = 0; k < N; k++) raw[k] = eave[k]! >= level - 0.005 ? 1 : 0;
    const gap = Math.max(1, Math.round(ROOF_GAP_M / 2 / step));
    const grownPart = growMask(raw, nx, nz, gap);
    for (let k = 0; k < N; k++) grownPart[k] = grownPart[k] ? 0 : 1;
    const beyond = growMask(grownPart, nx, nz, gap);
    // ...and where a lower roof already stands above this eave, its roof
    // carries on into that one (a storey's front face running up to the
    // main ridge) rather than sloping down to it.
    const part = (k: number) =>
      !!raw[k] || !beyond[k] || heights[k]! >= level + 0.01;
    const inside = (l: number, k: number) => part(at(l, k));
    // A hip over all of this level's part, rising from its outside edges
    // only (so it never sinks where another part carries on), its eaves
    // overhanging all round.
    const dIn = chessboard(nx, nz, part);
    // Eaves overhang this level's own rooms only, not the lower roof it
    // runs on into.
    const dOut = chessboard(nx, nz, (k) => !raw[k] && !!beyond[k]);
    for (let k = 0; k < N; k++) {
      if (dIn[k]! > 0)
        raise(k, level + ROOF_PITCH * (dIn[k]! - 0.5) * step, level);
      else if (dOut[k]! <= over)
        raise(k, level - ROOF_PITCH * (dOut[k]! - 0.5) * step, level);
    }
    // A narrow wing standing out toward the street (a garage, a bay, the
    // storey over a garage) ends in a gable instead: its ridge runs back
    // until it meets the hip.
    // Wings are found among this level's own rooms, whole (a garage under
    // part of an upper storey still counts), apart from a higher storey
    // beside them.
    const mask = roomsAt.get(level);
    const own = (l: number, k: number) => !!mask?.[at(l, k)];
    const off = (l: number, k: number, ofLevel: boolean) =>
      l < 0 ||
      l >= lines ||
      k < 0 ||
      k >= len ||
      !(ofLevel ? own(l, k) : inside(l, k));
    const share = (cells: [number, number][], ofLevel = false) =>
      cells.filter(([l, k]) => off(l, k, ofLevel)).length /
      Math.max(1, cells.length);
    const near = Math.round(1 / step);
    for (const r of roofRects(own, lines, len, Math.round((0.4 / step) ** 2))) {
      const width = (r.k1 - r.k0 + 1) * step;
      if (width > GABLE_MAX_M) continue;
      const front = ahead > 0 ? r.s1 : r.s0;
      const ks = Array.from({ length: r.k1 - r.k0 + 1 }, (_, n) => r.k0 + n);
      if (share(ks.map((k): [number, number] => [front + ahead, k])) < 0.75)
        continue;
      // Its sides open over the first metre (or all of a shallow bay).
      const ls = Array.from(
        { length: Math.min(near, r.s1 - r.s0 + 1) },
        (_, n) => front - ahead * n,
      );
      if (
        share(
          ls.map((l): [number, number] => [l, r.k0 - 1]),
          true,
        ) < 0.75 ||
        share(
          ls.map((l): [number, number] => [l, r.k1 + 1]),
          true,
        ) < 0.75
      )
        continue;
      // A small gable stands steeper than the main roof, as a bay's does.
      const pitch = Math.min(0.9, ROOF_PITCH * Math.max(1, 4 / width));
      const ridge = level + (pitch * width) / 2;
      const mid = Math.round((r.k0 + r.k1) / 2);
      const back = ahead > 0 ? r.l0 : r.l1;
      for (let l = front; l !== back - ahead; l -= ahead) {
        if (
          l !== front &&
          level + ROOF_PITCH * (dIn[at(l, mid)]! - 0.5) * step >= ridge
        )
          break;
        for (
          let q = Math.max(0, r.k0 - over);
          q <= Math.min(len - 1, r.k1 + over);
          q++
        ) {
          if ((q < r.k0 || q > r.k1) && inside(l, q)) continue;
          const across = Math.min(q - (r.k0 - 0.5), r.k1 + 0.5 - q) * step;
          raise(at(l, q), level + pitch * across, level);
        }
      }
    }
  }
  // Porch roofs: lean-tos from the wall down to the eave at the front.
  for (const p of porches) {
    const [wa, wb, , oa] = p.corners;
    const width = Math.hypot(wb[0] - wa[0], wb[1] - wa[1]);
    const depth = Math.hypot(oa[0] - wa[0], oa[1] - wa[1]);
    if (width < 0.1 || depth < 0.1) continue;
    const ux = (wb[0] - wa[0]) / width;
    const uz = (wb[1] - wa[1]) / width;
    const ox = (oa[0] - wa[0]) / depth;
    const oz = (oa[1] - wa[1]) / depth;
    const xs = p.corners.map((c) => c[0]);
    const zs = p.corners.map((c) => c[1]);
    const reach = PORCH_OVERHANG_M + step;
    const i0 = Math.max(0, Math.floor((Math.min(...xs) - reach - minX) / step));
    const i1 = Math.min(
      nx - 1,
      Math.ceil((Math.max(...xs) + reach - minX) / step),
    );
    const j0 = Math.max(0, Math.floor((Math.min(...zs) - reach - minZ) / step));
    const j1 = Math.min(
      nz - 1,
      Math.ceil((Math.max(...zs) + reach - minZ) / step),
    );
    for (let j = j0; j <= j1; j++)
      for (let i = i0; i <= i1; i++) {
        const rx = minX + i * step - wa[0];
        const rz = minZ + j * step - wa[1];
        const along = rx * ux + rz * uz;
        const out = rx * ox + rz * oz;
        // Behind the wall's face is the house.
        if (out < 0) continue;
        // A lean-to, falling from the wall straight down to the front.
        const o = PORCH_OVERHANG_M;
        const free = depth - out;
        if (free < -o || along < -o || along > width + o) continue;
        raise(j * nx + i, p.eave + PORCH_PITCH * free, p.eave);
      }
  }
  // Gable ends reach 10 cm further along the ridge, over the wall.
  let grown = heights;
  let grownEaves = eaves;
  for (let pass = 0; pass < Math.round(0.1 / step); pass++) {
    const nextH = grown.slice();
    const nextE = grownEaves.slice();
    for (let line = 0; line < lines; line++)
      for (let k = 0; k < len; k++) {
        const here = at(line, k);
        if (!Number.isNaN(grown[here]!)) continue;
        for (const nb of [line - 1, line + 1]) {
          if (nb < 0 || nb >= lines) continue;
          const there = at(nb, k);
          if (Number.isNaN(grown[there]!)) continue;
          if (!(nextH[here]! >= grown[there]!)) {
            nextH[here] = grown[there]!;
            nextE[here] = grownEaves[there]!;
          }
        }
      }
    grown = nextH;
    grownEaves = nextE;
  }
  return {
    ...roofColors(input.dark),
    grid: {
      x0: minX,
      z0: minZ,
      step,
      nx,
      nz,
      heights: grown,
      eaves: grownEaves,
    },
    faces: [],
  };
}

function roofColors(
  dark: boolean,
): Pick<Roof3d, "color" | "sidingColor" | "trimColor" | "shakeColor"> {
  return {
    color: dark ? SHINGLE_DARK : SHINGLE,
    sidingColor: dark ? SIDING_DARK : SIDING,
    trimColor: dark ? TRIM_DARK : TRIM,
    shakeColor: dark ? SHAKE_DARK : SHAKE,
  };
}

/** The roof from the building's explicit parts (RoofPlan), each meshed as
 * real planes; the porches' hipped roofs go on with it. Heights are world
 * Y; plan units are the lowest floor's. */
function plannedRoof(
  input: SceneInput,
  plan: RoofPlan,
  built: Floor3d[],
): Roof3d {
  const lowest = [...input.floors].sort((a, b) => a.baseY - b.baseY)[0];
  const m = metersPerUnit(lowest?.layout.scale ?? null);
  const sections = plan.parts.map((part) => partSection(part, m));
  // A roof never stands inside a storey above its eave (a garage roof
  // running on under the bedroom over the garage): cut out of those rooms
  // where it rises above their floor.
  const floorsAll = input.context ?? input.floors;
  const cuts = eaveCuts(sections);
  const faces = sections.flatMap((s) => {
    const eave = Math.min(s.eave0, s.eave1);
    const rooms = floorsAll.flatMap((f) => {
      const fm = metersPerUnit(f.layout.scale);
      return f.layout.rooms
        .filter(
          (r) =>
            !r.outdoor &&
            r.points.length >= 3 &&
            f.baseY + (r.floor_offset_m ?? 0) > eave + 0.05,
        )
        .map((r) => ({
          y: f.baseY + (r.floor_offset_m ?? 0),
          poly: r.points.map(([x, y]): Vec2 => [x * fm, y * fm]),
        }));
    });
    const si = sections.indexOf(s);
    const strips = cuts.filter((c) => c.section === si);
    return [...sectionFaces(s), ...strips.flatMap((c) => c.caps)].flatMap(
      (face) =>
        [
          ...rooms,
          ...strips.map((c) => ({ y: -Infinity, poly: c.strip })),
        ].reduce<RoofFace3d[]>(
          (acc, room) => acc.flatMap((f) => cutFace(f, room.poly, room.y)),
          [face],
        ),
    );
  });
  for (const f of built)
    for (const p of f.porches) {
      // A side running into a roof's eave (a garage beside the door): the
      // porch takes that roof's eave, pitch and overhang, so the two slopes
      // meet in a valley at the corner and their edges in one point.
      const [wa, wb, ob, oa] = p.corners;
      const own = f.baseY + p.eave;
      const meets = sections
        .filter((s) =>
          (
            [
              [wa, oa, 0],
              [wb, ob, 1],
            ] as const
          ).some(([w, o, side]) => {
            if (!p.abutted?.[side]) return false;
            const local = ([x, z]: Vec2) => {
              const rx = x - s.origin[0];
              const rz = z - s.origin[1];
              return [
                rx * s.along[0] + rz * s.along[1],
                rx * s.across[0] + rz * s.across[1],
              ] as const;
            };
            const [a1, c1] = local(w);
            const [a2, c2] = local(o);
            const onEave = (c: number) =>
              Math.abs(c - s.c0) < 0.15 || Math.abs(c - s.c1) < 0.15;
            return (
              onEave(c1) &&
              onEave(c2) &&
              Math.min(a1, a2) > s.a0 - 1 &&
              Math.max(a1, a2) < s.a1 + 1
            );
          }),
        )
        // The one at its own height (not an upper storey's roof above).
        .sort(
          (x, y) =>
            Math.abs(Math.min(x.eave0, x.eave1) - own) -
            Math.abs(Math.min(y.eave0, y.eave1) - own),
        )
        .find((s) => Math.abs(Math.min(s.eave0, s.eave1) - own) < 0.6);
      const eave = meets ? Math.min(meets.eave0, meets.eave1) : own;
      const s = porchSection(
        p.corners,
        eave,
        meets ? meets.pitch : PORCH_PITCH,
        // Its overhang too, so the two eaves' edges meet at the corner.
        meets ? meets.overhang : PORCH_OVERHANG_M,
        p.abutted,
      );
      if (s) faces.push(...sectionFaces(s));
    }
  return { ...roofColors(input.dark), grid: null, faces };
}

/** A roof face less the part of it inside a room's outline (x, z) that
 * stands above `level`: the face in convex pieces. A vertical face (a
 * fascia, a gable) inside the outline and above the level goes whole. */
function cutFace(face: RoofFace3d, room: Vec2[], level: number): RoofFace3d[] {
  const pts = face.points;
  if (pts.length < 3 || Math.max(...pts.map((p) => p[1])) <= level + 0.01)
    return [face];
  const [a, b, c] = pts;
  const ux = b![0] - a![0];
  const uy = b![1] - a![1];
  const uz = b![2] - a![2];
  const vx = c![0] - a![0];
  const vy = c![1] - a![1];
  const vz = c![2] - a![2];
  const nx = uy * vz - uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy - uy * vx;
  const len = Math.hypot(nx, ny, nz);
  if (len < 1e-9) return [face];
  if (Math.abs(ny) / len < 0.05) {
    const cx = pts.reduce((acc, p) => acc + p[0], 0) / pts.length;
    const cz = pts.reduce((acc, p) => acc + p[2], 0) / pts.length;
    return pointInPolygon(cx, cz, room) ? [] : [face];
  }
  // The face's height over a spot, from its plane.
  const yAt = (x: number, z: number) =>
    a![1] - (nx * (x - a![0]) + nz * (z - a![2])) / ny;
  // Room outline wound counter-clockwise (x, z), so "inside" is left.
  let area2 = 0;
  room.forEach(([x, z], k) => {
    const [x2, z2] = room[(k + 1) % room.length]!;
    area2 += x * z2 - x2 * z;
  });
  const ring = area2 > 0 ? room : [...room].reverse();
  // Only a convex room cuts cleanly by half-planes; others: its box.
  const convex = ring.every((p, k) => {
    const q = ring[(k + 1) % ring.length]!;
    const r = ring[(k + 2) % ring.length]!;
    return (
      (q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0]) >= -1e-9
    );
  });
  const cut = convex
    ? ring
    : (() => {
        const xs = ring.map((p) => p[0]);
        const zs = ring.map((p) => p[1]);
        const [x0, x1, z0, z1] = [
          Math.min(...xs),
          Math.max(...xs),
          Math.min(...zs),
          Math.max(...zs),
        ];
        return [
          [x0, z0],
          [x1, z0],
          [x1, z1],
          [x0, z1],
        ] as Vec2[];
      })();
  const clipXZ = (poly: Vec2[], f: (x: number, z: number) => number) => {
    const out: Vec2[] = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i]!;
      const q = poly[(i + 1) % poly.length]!;
      const fp = f(p[0], p[1]);
      const fq = f(q[0], q[1]);
      if (fp <= 0) out.push(p);
      if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) {
        const t = fp / (fp - fq);
        out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
      }
    }
    return out;
  };
  const polyArea = (poly: Vec2[]) =>
    Math.abs(
      poly.reduce((acc, p, k) => {
        const q = poly[(k + 1) % poly.length]!;
        return acc + p[0] * q[1] - q[0] * p[1];
      }, 0),
    ) / 2;
  let rest: Vec2[] = pts.map((p) => [p[0], p[2]]);
  const pieces: Vec2[][] = [];
  for (let k = 0; k < cut.length && rest.length >= 3; k++) {
    const p = cut[k]!;
    const q = cut[(k + 1) % cut.length]!;
    // > 0 outside this edge (to its right, the ring being CCW).
    const side = (x: number, z: number) =>
      -((q[0] - p[0]) * (z - p[1]) - (q[1] - p[1]) * (x - p[0]));
    const outside = clipXZ(rest, (x, z) => -side(x, z));
    if (outside.length >= 3 && polyArea(outside) > 1e-5) pieces.push(outside);
    rest = clipXZ(rest, side);
  }
  // What's left lies inside the room: kept only where it's below the floor.
  if (rest.length >= 3 && polyArea(rest) > 1e-5) {
    const high = Math.max(...rest.map(([x, z]) => yAt(x, z)));
    if (high <= level + 0.01) pieces.push(rest);
  }
  return pieces.map((poly) => ({
    ...face,
    points: poly.map(([x, z]): [number, number, number] => [x, yAt(x, z), z]),
  }));
}

/** What stands on the floors below one, on its floor plane (metres): their
 * walls (segment and thickness) and their flights' footprints. */
interface Below {
  walls: { a: Vec2; b: Vec2; t: number }[];
  flights: Vec2[][];
}

function belowOf(floor: FloorInput, floors: FloorInput[]): Below {
  // Only floors whose walls reach up to this one's level.
  const lower = floors.filter(
    (f) =>
      f.baseY < floor.baseY - 0.3 &&
      f.baseY + f.wallHeight >= floor.baseY - 0.3,
  );
  return {
    walls: lower.flatMap((f) => {
      const m = metersPerUnit(f.layout.scale);
      return f.layout.walls
        .filter((w) => wallThicknessCm(w) / 100 > RAIL_THICKNESS_M)
        .flatMap((w) =>
          w.points.slice(1).map((p, i) => ({
            a: [w.points[i]![0] * m, w.points[i]![1] * m] as Vec2,
            b: [p[0] * m, p[1] * m] as Vec2,
            t: wallThicknessCm(w) / 100,
          })),
        );
    }),
    flights: lower.flatMap((f) => {
      const m = metersPerUnit(f.layout.scale);
      return f.layout.furniture
        .filter((it) => it.kind === STAIRS_KIND)
        .map((it) => {
          const a = (-it.rotation_deg * Math.PI) / 180;
          const c = Math.cos(a);
          const sn = Math.sin(a);
          const w = it.width_cm / 200;
          const d = it.depth_cm / 200;
          const P = (lx: number, lz: number): Vec2 => [
            it.x * m + lx * c + lz * sn,
            it.y * m - lx * sn + lz * c,
          ];
          return [P(-w, -d), P(w, -d), P(w, d), P(-w, d)];
        });
    }),
  };
}

/** A wall of a floor above, on this floor's plane (metres): its segment,
 * the level it stands on, its thickness and height, and its doorways
 * (metres along it from `a`), where it doesn't reach down to its floor. */
interface UpperWall {
  a: Vec2;
  b: Vec2;
  y: number;
  t: number;
  h: number;
  doors: [number, number][];
}

/** For one floor: the walls of floors above it, as segments on the floor
 * plane (metres) with their level relative to it. */
function upperWallsOf(floor: FloorInput, floors: FloorInput[]): UpperWall[] {
  return floors
    .filter((f) => f.baseY > floor.baseY + 0.5)
    .flatMap((f) => {
      const m = metersPerUnit(f.layout.scale);
      return f.layout.walls.flatMap((w) => {
        const t = wallThicknessCm(w) / 100;
        const h =
          w.material === HALF_WALL_MATERIAL
            ? HALF_WALL_M + 0.04
            : t <= RAIL_THICKNESS_M
              ? RAIL_HEIGHT_M
              : f.wallHeight;
        const doors = f.layout.openings
          .filter((o) => o.wallId === w.id && o.type === "door")
          .map((o) => ({
            o,
            k: nearestPointOnPolyline(w.points, o.x, o.y).segmentIndex,
          }));
        return w.points.slice(1).map((p, i) => {
          const q = w.points[i]!;
          const len = distance(q[0], q[1], p[0], p[1]);
          return {
            a: [q[0] * m, q[1] * m] as Vec2,
            b: [p[0] * m, p[1] * m] as Vec2,
            y: f.baseY - floor.baseY,
            t,
            h,
            doors: doors
              .filter((d) => d.k === i && len > 0)
              .map(({ o }): [number, number] => {
                const s =
                  (((o.x - q[0]) * (p[0] - q[0]) +
                    (o.y - q[1]) * (p[1] - q[1])) /
                    len) *
                  m;
                return [s - (o.width * m) / 2, s + (o.width * m) / 2];
              }),
          };
        });
      });
    });
}

/** For one floor: the height (metres above its level) of the lowest floor
 * above that has a room over a point on the floor plane, else null. */
function floorAboveOf(
  floor: FloorInput,
  floors: FloorInput[],
): (x: number, z: number) => number | null {
  const rooms = floors
    .filter((f) => f.baseY > floor.baseY + 0.5)
    .flatMap((f) => {
      const m = metersPerUnit(f.layout.scale);
      return f.layout.rooms
        .filter((r) => !r.outdoor && r.points.length >= 3)
        .map((r) => ({
          y: f.baseY + (r.floor_offset_m ?? 0) - floor.baseY,
          points: r.points.map(([x, y]): [number, number] => [x * m, y * m]),
        }))
        .concat(
          // A staircase up there (a stairwell no room covers) is that
          // floor down to its lower end's level: walls under it stop there.
          f.layout.furniture
            .filter((it) => it.kind === STAIRS_KIND)
            .map((it) => {
              const a = (-it.rotation_deg * Math.PI) / 180;
              const c = Math.cos(a);
              const sn = Math.sin(a);
              const w = it.width_cm / 200;
              const d = it.depth_cm / 200;
              const P = (lx: number, lz: number): [number, number] => [
                it.x * m + lx * c + lz * sn,
                it.y * m - lx * sn + lz * c,
              ];
              const levelBeyond = (lz: number) => {
                const [x, z] = P(0, lz);
                return (
                  f.layout.rooms.find(
                    (r) =>
                      !r.outdoor &&
                      r.points.length >= 3 &&
                      pointInPolygon(x / m, z / m, r.points),
                  )?.floor_offset_m ?? 0
                );
              };
              const low = Math.min(levelBeyond(d + 0.3), levelBeyond(-d - 0.3));
              return {
                y: f.baseY + low - floor.baseY,
                points: [P(-w, -d), P(w, -d), P(w, d), P(-w, d)],
              };
            }),
        );
    });
  return (x, z) => {
    let best: number | null = null;
    for (const r of rooms)
      if ((best === null || r.y < best) && pointInPolygon(x, z, r.points))
        best = r.y;
    if (best !== null) return best;
    // In a sliver between two rooms' outlines (a few centimetres where
    // they don't quite meet): the nearest room's.
    let near = ABOVE_SLIVER_M;
    for (const r of rooms)
      r.points.forEach((a, k) => {
        const b = r.points[(k + 1) % r.points.length]!;
        const d = pointToSegmentDistance(x, z, a[0], a[1], b[0], b[1]);
        if (d < near || (d === near && best !== null && r.y < best)) {
          near = d;
          best = r.y;
        }
      });
    return best;
  };
}

/** The hillside the building stands on: grade on its high and low sides,
 * falling toward a compass bearing. Rooms whose floor sits below the high
 * side's grade are cut out of the ground, so a walk-out basement still
 * shows inside; so are patios at that level (dug out to the walk-out). */
function terrain(
  input: SceneInput,
  ground: GroundSetting,
  northDeg: number,
): Terrain3d {
  const [dx, dz] = planVector(ground.downhill_deg, northDeg);
  const top = Math.max(ground.uphill_m, ground.downhill_m);
  const holes = input.floors.flatMap((f) => {
    const m = metersPerUnit(f.layout.scale);
    return f.layout.rooms
      .filter(
        (r) =>
          r.points.length >= 3 &&
          f.baseY + (r.floor_offset_m ?? 0) < top - 0.01,
      )
      .map((r) => r.points.map(([x, y]): Vec2 => [x * m, y * m]));
  });
  // How far along the downhill direction the building reaches: the grade
  // falls from uphill to downhill across it.
  let lo = Infinity;
  let hi = -Infinity;
  for (const f of input.floors) {
    const m = metersPerUnit(f.layout.scale);
    for (const r of f.layout.rooms)
      for (const [x, y] of r.points) {
        const s = x * m * dx + y * m * dz;
        lo = Math.min(lo, s);
        hi = Math.max(hi, s);
      }
  }
  return {
    uphill: ground.uphill_m,
    downhill: ground.downhill_m,
    dir: [dx, dz],
    range: lo < hi ? [lo, hi] : [0, 0],
    level: GRADE_LEVEL,
    holes,
  };
}

/** The ground's height (world Y) at a spot on the floor plane. */
export function groundHeight(t: Terrain3d, x: number, z: number): number {
  const [lo, hi] = t.range;
  const s = x * t.dir[0] + z * t.dir[1];
  const k = hi > lo ? Math.min(1, Math.max(0, (s - lo) / (hi - lo))) : 0;
  return t.uphill + (t.downhill - t.uphill) * gradeFall(k, t.level);
}

/** How far the grade has fallen (0 at the high side, 1 at the low) a
 * fraction `k` of the way across the building, level for the first
 * `level` of it. */
export function gradeFall(k: number, level: number): number {
  return level >= 1 ? 0 : Math.max(0, (k - level) / (1 - level));
}

/** Each floor of a building stacked by level (lowest first), with its
 * vertical position.
 *
 * Without explicit elevations, floors sit a full storey apart: the lowest
 * floor at or above ground level at 0, basements below it. A floor with an
 * `elevation` (metres above the building's ground level, where the ground
 * plane is — split levels) sits exactly there; floors without one keep
 * their storey spacing from the nearest floor that has one (below it, else
 * above it). */
export function stackFloors<
  T extends {
    level: number | null;
    wallHeight: number;
    elevation?: number | null;
  },
>(floors: T[]): (T & { baseY: number })[] {
  const sorted = [...floors].sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
  // Each floor's position with every floor a full storey apart.
  let y = 0;
  const stacked = sorted.map((f) => {
    const out = { ...f, baseY: y };
    y += f.wallHeight + STOREY_GAP_M;
    return out;
  });
  const fixed = stacked.filter((f) => f.elevation != null);
  const first = fixed[0];
  if (!first) {
    const ground = stacked.find((f) => (f.level ?? 0) >= 0)?.baseY ?? 0;
    for (const f of stacked) f.baseY -= ground;
    return stacked;
  }
  // Shift each floor by its anchor's offset from automatic stacking.
  const shift = new Map<T, number>();
  let anchor = first;
  for (const f of stacked) {
    if (f.elevation != null) anchor = f;
    shift.set(f, (anchor.elevation ?? 0) - anchor.baseY);
  }
  for (const f of stacked) f.baseY += shift.get(f) ?? 0;
  return stacked;
}
