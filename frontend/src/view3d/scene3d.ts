/** Turns floor layouts into the 3D view's scene (see view3d-api.ts): walls
 * extruded to the floor's wall height with doors and windows cut out,
 * rooms as tinted floor slabs, furniture as blocks with their 2D drawing
 * on top, and the sun from Home Assistant's location. Part of the main
 * bundle — pure data in, plain numbers out — so the lazily loaded three.js
 * module only has to build meshes. */

import { render, svg } from "lit";
import type {
  WindowGrid,
  GarageStyle,
  DoorStyle,
  CompassSide,
  RoofEnd,
  RoofLightStrip,
  FloorLayout,
  FurnitureItem,
  GroundSetting,
  HomeAssistant,
  Opening,
  RoofPlan,
  Room,
  Scale,
  Wall,
} from "../types";
import {
  eaveCuts,
  outsideSection,
  partSection,
  ROOF_HEEL_M,
  ROOF_OVERHANG_M,
  porchSection,
  sectionFaces,
  sectionHeightAt,
  type RoofSection,
} from "./roof-planes";
import type {
  Box3d,
  EditRef,
  FloorFinish,
  Floor3d,
  Item3d,
  LightBeam,
  Pane3d,
  Pit3d,
  Porch3d,
  Roof3d,
  RoofEdge3d,
  RoofFace3d,
  RoofLights3d,
  Scene3d,
  Slab3d,
  Terrain3d,
  Vec2,
  WallCover,
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
import { gradeAt } from "./ground-grid";
import {
  computeCoverOpenness,
  computeItemStates,
  itemState,
  computeRoomLights,
  mixHex,
  roomFillStyle,
} from "../canvas/live-state";
import {
  catalogItem,
  CUSTOM_COUNTER_KIND,
  isShapeKind,
  type CatalogItem,
} from "../canvas/furniture-catalog";
import {
  cornerRadii,
  drawItem,
  freeformPrims,
  roundedPolyPoints,
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
/** White oak casing (indoors, chosen on the opening). */
const TRIM_OAK = "#d3b98f";
const TRIM_OAK_DARK = "#85745a";
/** Maple: very light, near cream (as the Lato floor). */
const TRIM_MAPLE = "#e6dccb";
const TRIM_MAPLE_DARK = "#8f887d";
/** A bezel round the casing indoors, unless coloured: matte black. */
const TRIM_BEZEL = "#1d1d1e";
/** An outside door's leaf. */
const DOOR = "#f6f4ef";
const DOOR_DARK = "#8f8b84";
/** A door between rooms: stained wood. */
const DOOR_INSIDE = "#6f4527";
const DOOR_INSIDE_DARK = "#4a2e1a";
/** A door between rooms' lever handles: matte black. */
const LEVER_BLACK = "#1b1b1b";
/** A door's hardware (knob, handles, strap hinges): dark bronze. */
const HARDWARE = "#3b3530";
/** Glass in a garage door: the dark garage behind it. */
const GARAGE_GLASS = "#33404a";
/** A modern garage door's aluminium frame. */
const GARAGE_FRAME = "#43484e";
/** Shutters, unpainted: a dark green-black. */
const SHUTTER = "#2f3a33";

/** A colour (#rrggbb) lightened (k > 1) or darkened (k < 1). */
function shadeHex(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v * k)))
      .toString(16)
      .padStart(2, "0");
  return `#${c((n >> 16) & 255)}${c((n >> 8) & 255)}${c(n & 255)}`;
}
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

/** The catalog's outdoor lights and plantings: modelled by
 * outdoor-models.ts, standing on the ground when out in the yard. */
const OUTDOOR_MODELLED = new Set(["outdoor_lighting", "landscape"]);
/** Things that stand on the ground when they're in none of the floor's
 * rooms. */
const GROUNDED_CATEGORIES = new Set([
  "outdoor_lighting",
  "landscape",
  "outdoor",
  // Cars and trailers out on the drive.
  "garage",
]);

/** Vehicles: out in the yard they stand on a drive's paving (a few
 * centimetres up), not in it. */
const VEHICLE =
  /^car_|^trailer_|motorcycle|scooter|riding_mower|golf_cart|atv|boat|truck|van_/;
const PAVING_M = 0.045;

/** Catalog drawings of houseplants, each with its own model. */
const HOUSEPLANT_DRAWS = new Set(["houseplant", "plant", "cactus"]);

/** Items modelled rather than extruded (see Item3d.shape). */
function itemShape(
  kind: string,
  entry: CatalogItem | undefined,
): Item3d["shape"] {
  if (kind === STAIRS_KIND) return "stairs";
  if (entry && OUTDOOR_MODELLED.has(entry.category)) return "block";
  if (/stand|pedestal|basket/.test(kind)) return "block";
  if (/shower(?!_bench|_glass)/.test(kind)) return "shower";
  if (/tree|olive/.test(kind) && entry?.category === "outdoor") return "tree";
  // Houseplants are modelled species by species (outdoor-models.ts).
  if (entry && (HOUSEPLANT_DRAWS.has(entry.draw) || entry.id === "bonsai"))
    return "block";
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
/** How a ground spotlight at (x, z) facing `angle` (Item3d's) tilts from
 * straight up to aim at the first wall ahead of it `SPOT_RISE_M` up, so
 * its wash starts near the ground and climbs the wall: steeper the closer it stands; null with no wall within reach. */
const SPOT_RISE_M = 1.1;
const SPOT_REACH_M = 8;
/** A spotlight within this of the wall it faces washes it as one set a
 * few inches off it does: its light comes from GRAZE_M in front of the
 * wall, so the wash starts just above the fixture and climbs. */
const GRAZE_REACH_M = 1.2;
const GRAZE_M = 0.12;
function spotAim(
  walls: Wall[],
  m: number,
  x: number,
  z: number,
  angle: number,
  rise: number,
): { tilt: number; forward: number } | null {
  const dx = Math.sin(angle);
  const dz = Math.cos(angle);
  let best = SPOT_REACH_M;
  for (const w of walls)
    for (let i = 0; i + 1 < w.points.length; i++) {
      const ax = w.points[i]![0] * m;
      const az = w.points[i]![1] * m;
      const ex = w.points[i + 1]![0] * m - ax;
      const ez = w.points[i + 1]![1] * m - az;
      // Ray (x, z) + t (dx, dz) against the segment a + u e.
      const den = dx * ez - dz * ex;
      if (Math.abs(den) < 1e-9) continue;
      const t = ((ax - x) * ez - (az - z) * ex) / den;
      const u = ((ax - x) * dz - (az - z) * dx) / den;
      if (t > 0.05 && t < best && u >= 0 && u <= 1) best = t;
    }
  if (best >= SPOT_REACH_M) return null;
  const forward = best < GRAZE_REACH_M ? Math.max(0, best - GRAZE_M) : 0;
  const deg = (Math.atan2(best - forward, rise) * 180) / Math.PI;
  return { tilt: Math.max(4, Math.min(70, deg)), forward };
}

/** A catalog item on its own, as the 3D view would model it (lit, if it's
 * a light): for the library's thumbnails. */
export function catalogItem3d(entry: CatalogItem): Item3d {
  const auto = itemHeight(entry.id, entry, DEFAULT_WALL_HEIGHT_M);
  // A long string of lights pictured a couple of metres of it.
  const w =
    (entry.category === "outdoor_lighting" ? Math.min(entry.w, 160) : entry.w) /
    100;
  const d = entry.d / 100;
  const beam = entry.opts["beam"];
  return {
    id: entry.id,
    name: entry.name,
    footprint: [
      [-w / 2, -d / 2],
      [w / 2, -d / 2],
      [w / 2, d / 2],
      [-w / 2, d / 2],
    ],
    width: w,
    depth: d,
    x: 0,
    z: 0,
    angle: 0,
    y0: 0,
    height: auto.height,
    color: "#d9d2c6",
    topImage: null,
    opacity: 1,
    light:
      typeof beam === "string"
        ? {
            color: "#ffd9a0",
            level: 0.8,
            y: auto.height / 2,
            beam: beam as LightBeam,
          }
        : null,
    shape: "block",
    model: {
      kind: entry.id,
      draw: entry.draw,
      opts: entry.opts,
      flip: entry.flip,
      tint: null,
    },
  };
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
/** A stairwell (open space in a house that's no room) is at least this
 * clear of every room, not a sliver between a room's edge and the walls'
 * outline: the spot and 5 cm each way. */
const STAIRWELL_REACH: [number, number][] = [
  [0, 0],
  [0.05, 0],
  [-0.05, 0],
  [0, 0.05],
  [0, -0.05],
];
/** How far a vaulted ceiling stays under the roof's surface: past its
 * fascia's depth. */
const VAULT_CLEAR_M = 0.2;
/** A vaulted ceiling's pitch, as a share of its roof's: a scissor truss's,
 * rising from the walls' tops under a wedge of attic. */
const VAULT_PITCH = 0.5;

/** The roof a vaulted ceiling follows over a spot (world Y): the highest
 * section over it (where two meet in a valley, the one on top), else a
 * dormer's (a bay's alcove past the roof it stands on). */
function vaultRoofAt(
  sections: RoofSection[],
  isDormer: boolean[],
  x: number,
  z: number,
): number | null {
  let high: number | null = null;
  let dormer: number | null = null;
  sections.forEach((s, i) => {
    const h = sectionHeightAt(s, x, z);
    if (h === null) return;
    if (!isDormer[i]) high = high === null ? h : Math.max(high, h);
    else dormer = dormer === null ? h : Math.min(dormer, h);
  });
  return high ?? dormer;
}

/** A vaulted ceiling's height over walls stopping at `level`, under a roof
 * whose surface there is `roof` (null: none, flat): from the walls' tops
 * where the roof sits on them (a rafter's depth up), rising at its share
 * of the roof's pitch, clear of the rafters. */
function vaultUnder(level: number, roof: number | null): number {
  if (roof === null) return level;
  const rise = VAULT_PITCH * (roof - ROOF_HEEL_M - level);
  return Math.max(level, Math.min(level + rise, roof - VAULT_CLEAR_M));
}
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

/** A floor's thickness under its rooms (the glue draws their undersides
 * this far down). */
const FLOOR_SLAB_M = 0.05;

/** Whether an item hangs from the ceiling. */
function ceilingMounted(kind: string): boolean {
  return HEIGHT_RULES.find(([re]) => re.test(kind))?.[2] === "ceiling";
}

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
  // An outdoor light or planting's own height, and how high a wall light
  // hangs.
  const h3d = entry?.opts["h3d"];
  if (typeof h3d === "number") {
    const y3d = entry?.opts["y3d"];
    return { y0: typeof y3d === "number" ? y3d : 0, height: h3d };
  }
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
    /** The highest ceiling (its walls' top, metres above this floor's
     * level) of a lower floor's indoor room over a spot, else null. */
    lowerCeiling: (x: number, z: number) => number | null;
    /** Whether a spot is inside a lower floor's house (its walls' closed
     * outline): open down to it where this floor has no room. */
    lowerHouse: (x: number, z: number) => boolean;
    /** Whether a spot is inside a higher floor's house: a stairwell there
     * is that floor's to vault (it carries on up through it). */
    upperHouse: (x: number, z: number) => boolean;
    /** The corners (x and z, metres) of the rooms of the floors above, so
     * a stairwell's vault runs square to them. */
    upperLines: { xs: number[]; zs: number[] };
    /** Whether a room of a floor above covers a spot (not a staircase
     * drawn up there: that's the stairwell's). */
    upperRoom: (x: number, z: number) => boolean;
    /** The highest planned roof surface at a spot that lies below `y`
     * (metres above this floor's level), else null. */
    roofBelow: (x: number, z: number, y: number) => number | null;
    /** Whether the roof is drawn (else the walls needn't meet it). */
    roofShown: boolean;
    /** The roof's underside a vaulted ceiling follows at a spot (metres
     * above this floor's level): the lowest roof section over it, a
     * dormer's (see dormers) only where nothing else is; else null. */
    vaultAt: (x: number, z: number) => number | null;
    /** The dormers' footprints (x0, z0, x1, z1, metres): a small roof
     * section on a larger one (a bay's gable). Under one the vault
     * carries on up the larger one's slope. */
    dormers: [number, number, number, number][];
    /** Where the roof's sections and their overhangs start and end (x
     * and z, metres): a vaulted ceiling's grid runs through them, so a
     * step from one section's underside to another's falls square. */
    roofLines: { xs: number[]; zs: number[] };
  },
): Floor3d {
  const { layout, wallHeight: H } = input;
  const m = metersPerUnit(layout.scale);
  // A window keeps its size on walls taller (or shorter) than the 2.4 m
  // its defaults are for: the difference is shared above and below it in
  // the proportion of those gaps, so it sits where it looks right.
  const windowSpan = WINDOW_HEAD_M - WINDOW_SILL_M;
  const windowSill =
    WINDOW_SILL_M *
    Math.max(
      0,
      (H - windowSpan) / Math.max(0.01, DEFAULT_WALL_HEIGHT_M - windowSpan),
    );
  const windowHead = windowSill + windowSpan;
  const covers = computeCoverOpenness(layout.openings, hass);
  const walls: Box3d[] = [];
  const panes: Pane3d[] = [];
  /** Each window's and door's face on its wall, its casing included: its
   * ends along the wall's line, its bottom and top, the wall's
   * thickness (a backsplash stops round it). */
  const openingFaces: OpeningFace[] = [];
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
  const ownHouse = houseLoopsOf(layout);
  /** A spot (metres) with no room of its own that's still inside the
   * house, not out under the sky: a room below and the roof well above
   * this storey (a stairwell, the space beside a closet), or inside this
   * floor's own walls. (Beside a lower room standing up past this floor,
   * see the pass after the walls: painted up to its ceiling.) */
  const housed = (x: number, z: number) =>
    sheltered(x, z) ||
    ownHouse.some((loop) => pointInPolygon(x / m, z / m, loop));
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
        else if (!room && housed(x * m, y * m)) indoors[side]++;
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
    const bare = top;
    // Where a floor above has a wall on the same line, that wall carries
    // on from its level: stop there rather than stand beside it, or reach
    // up to it rather than leave a gap below it.
    const upper = upperWallLevel(a, b);
    if (upper !== null && upper <= top + 0.8) top = upper;
    // Under a planned roof whose lowest point along it sits a little
    // above it (a garage a step down from the house, under the house's
    // eave line), it stands up to that point rather than leave a gap:
    // while the roof's drawn (cut away, every wall stops at its height).
    else if (exterior.roofShown) {
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
      // depth above it. Under the roof along most of its length (a roof
      // stopping a little short of its end): raised there, the rest left
      // at its height (see wallRuns).
      if (roof.slice(1, 4).every((r) => r !== null)) {
        const c = roof.map((r) => (r === null ? null : r[0]));
        const [c0, c1, , c3, c4] = c;
        // Carried on out to its ends (under a gable the roof rises along
        // it from each corner).
        const run = 0.25 - inset;
        const end0 =
          c0 != null && c1 != null && run > 0.01
            ? c0 - ((c1 - c0) * inset) / run
            : null;
        const end1 =
          c4 != null && c3 != null && run > 0.01
            ? c4 - ((c3 - c4) * inset) / run
            : null;
        const low =
          Math.min(
            ...[...c, end0, end1].filter((v): v is number => v !== null),
          ) - ROOF_HEEL_M;
        if (low > top + 0.005 && low < top + 0.6) top = low;
      }
    }
    return { base, top, level, outside, bare };
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
    bare = top,
  ): {
    s0: number;
    s1: number;
    top: number;
    out?: 1 | -1;
    bot?: number;
  }[] => {
    const L = distance(a[0], a[1], b[0], b[1]) * m;
    const ux = ((b[0] - a[0]) * m) / L;
    const uz = ((b[1] - a[1]) * m) / L;
    const reach = t / 2 + 0.2;
    const n = Math.max(1, Math.round(L / 0.1));
    const runs: {
      s0: number;
      s1: number;
      top: number;
      out?: 1 | -1;
      bot?: number;
    }[] = [];
    // Which side is out of doors here (a wall indoors along most of its
    // length can run on out past the house's roof).
    const indoorAt = (x: number, z: number) =>
      layout.rooms.some(
        (r) =>
          !r.outdoor &&
          r.points.length >= 3 &&
          pointInPolygon(x / m, z / m, r.points),
      ) || housed(x, z);
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
      // Past the drawn roof's end, no higher than it stands without one.
      if (roof === null && exterior.roofShown) v = Math.min(v, bare);
      v = Math.max(v, base + 0.3);
      // Standing over a lower roof (a bedroom over the garage, nothing
      // under it but that roof): it reaches down into the roof, so no gap
      // shows between them.
      let bot: number | undefined;
      const lows: number[] = [];
      for (const ds of [-L / n / 2, L / n / 2])
        for (const o of [-t / 2 - 0.01, 0, t / 2 + 0.01]) {
          const px = x + ux * ds - uz * o;
          const pz = z + uz * ds + ux * o;
          const r = exterior.roofBelow(px, pz, base);
          if (r !== null) lows.push(r);
        }
      if (lows.length) {
        const low = Math.min(...lows);
        if (low < base - 0.005 && low > base - 1.2) bot = low - 0.03;
      }
      const last = runs[runs.length - 1];
      if (
        last &&
        Math.abs(last.top - v) < 0.001 &&
        last.out === out &&
        last.bot === bot
      )
        last.s1 = ((k + 1) * L) / n;
      else
        runs.push({
          s0: (k * L) / n,
          s1: ((k + 1) * L) / n,
          top: v,
          ...(out ? { out } : {}),
          ...(bot !== undefined ? { bot } : {}),
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
      /** The floor at a spot: a room of this floor's level (a deck
       * outside too), else the floor above's (the flight climbs to it),
       * else this floor's. */
      const levelAt = ([x, z]: Vec2): number => {
        const room = layout.rooms.find(
          (r) => r.points.length >= 3 && pointInPolygon(x / m, z / m, r.points),
        );
        if (room) return room.floor_offset_m ?? 0;
        return floorAbove(x, z) ?? 0;
      };
      let front = levelAt(P(0, d / 2 + 0.3));
      let back = levelAt(P(0, -d / 2 - 0.3));
      // Its foot and rise set by hand (a flight down to a floor below,
      // whose foot lies under this floor's deck): the end whose floor is
      // nearer the top is the top.
      if (f.elevation_cm != null && f.height_cm) {
        const low = f.elevation_cm / 100;
        const high = low + f.height_cm / 100;
        const frontHigh = Math.abs(front - high) <= Math.abs(back - high);
        front = frontHigh ? high : low;
        back = frontHigh ? low : high;
      }
      const top = Math.max(front, back);
      // How far back from its high end the floor up there runs over it:
      // its top step is that floor.
      const high = front > back ? 1 : -1;
      const floorAt = ([x, z]: Vec2): boolean => {
        const room = layout.rooms.find(
          (r) => r.points.length >= 3 && pointInPolygon(x / m, z / m, r.points),
        );
        const y = room ? (room.floor_offset_m ?? 0) : floorAbove(x, z);
        return y !== null && Math.abs(y - top) < 0.05;
      };
      let landing = 0;
      while (landing < d && floorAt(P(0, high * (d / 2 - landing - 0.01))))
        landing += 0.02;
      // Out of doors: no indoor room at either end or under it.
      const indoorAt = ([x, z]: Vec2) =>
        layout.rooms.some(
          (r) =>
            !r.outdoor &&
            r.points.length >= 3 &&
            pointInPolygon(x / m, z / m, r.points),
        );
      const outdoor =
        !indoorAt(P(0, d / 2 + 0.3)) &&
        !indoorAt(P(0, -d / 2 - 0.3)) &&
        !indoorAt(P(0, 0));
      return {
        item: f,
        front,
        back,
        top,
        landing,
        outdoor,
        P,
        d,
        sides: [
          [P(-w / 2, -d / 2), P(-w / 2, d / 2)],
          [P(w / 2, -d / 2), P(w / 2, d / 2)],
        ] as [Vec2, Vec2][],
      };
    });
  /** A flight's side shared with a flight climbing beside it (a split
   * level's up flight beside its down one): the wall between them is a
   * half wall sloped with this flight, a rail's height over its nosings,
   * open above (that flight keeps its own railing); as [z, level] along
   * this side (see Item3d's stairs.sideTops). */
  const STAIR_CAP_M = 0.9;
  const sideTop = (si: number, side: 0 | 1): [number, number][] | null => {
    const st = stairs[si]!;
    const seg = st.sides[side]!;
    const o = stairs.find(
      (o, oi) =>
        oi !== si &&
        o.top > st.top + 0.3 &&
        o.sides.some((os) => alongShare(seg, os, 0.3) >= 0.4),
    );
    if (!o) return null;
    // Its nosing line, back (-d/2) to front, a rail's height up.
    return [-st.d / 2, st.d / 2].map((z): [number, number] => [
      z,
      st.back + ((st.front - st.back) * (z + st.d / 2)) / st.d + STAIR_CAP_M,
    ]);
  };
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
        bare,
      } = wallSpan([ax, ay], [bx, by], t);
      const runs = wallRuns([ax, ay], [bx, by], t, base, fullTop, bare);
      // The rooms either side (left: the box's +Z face), for their wall
      // coverings.
      const sideCover = (dir: 1 | -1): WallCover | null => {
        const reach = (t / 2 + 0.15) / m;
        const len = distance(ax, ay, bx, by);
        const nx = (-(by - ay) / len) * dir;
        const ny = ((bx - ax) / len) * dir;
        const votes = new Map<Room, number>();
        for (const f of [0.25, 0.5, 0.75]) {
          const px = ax + (bx - ax) * f + nx * reach;
          const py = ay + (by - ay) * f + ny * reach;
          const room = layout.rooms.find(
            (r) =>
              !r.outdoor &&
              r.points.length >= 3 &&
              pointInPolygon(px, py, r.points),
          );
          if (room) votes.set(room, (votes.get(room) ?? 0) + 1);
        }
        let room: Room | null = null;
        let best = 0;
        for (const [r, n] of votes) if (n > best) [room, best] = [r, n];
        if (!room || (!room.wall_finish && !room.wall_color)) return null;
        return {
          finish: room.wall_finish ?? "paint",
          color: room.wall_color ?? (dark ? "#8a8580" : "#f4f1ec"),
        };
      };
      const sideCovers: [WallCover | null, WallCover | null] = [
        sideCover(1),
        sideCover(-1),
      ];
      const covered = !!(sideCovers[0] || sideCovers[1]);
      const wallRef: EditRef = { kind: "wall", id: wall.id, seg: i };
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
          ref: wallRef,
          ...(covered && depth === t ? { cover: sideCovers } : {}),
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
          // A post at each open corner: cedar, else the door's paint.
          const postColor = door.opening.paint_color ?? CEDAR;
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
              color: postColor,
            });
          }
        }
      }
      const stoneTop = facesFront && !porched ? exterior.stoneTop : -Infinity;
      /** Solid wall over [s0, s1] from y0 up to `y1` (else the wall's
       * top), cut where the top changes along it; stone below the front's
       * wainscot line. */
      const solid = (s0: number, s1: number, y0f: number, y1?: number) => {
        for (const r of runs) {
          // From the wall's foot, down into a roof under it where there's
          // one.
          const y0 =
            y0f === foot && r.bot !== undefined ? Math.min(y0f, r.bot) : y0f;
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
      // Out from the wall's centre to its outdoor face (box +Z is (-dz,
      // dx)), for the detail on a door, window or garage door.
      const nOut: Vec2 | null = outside ? [-dz * outside, dx * outside] : null;
      /** A box `o` metres out from the wall's centre line. */
      const proud = (b: Box3d, o: number): Box3d =>
        nOut ? { ...b, x: b.x + nOut[0] * o, z: b.z + nOut[1] * o } : b;
      /** A door leaf `depth` thick over [s0, s1] x [y0, y1], solid round
       * its glass lites (each [s0, s1, y0, y1]): banded at the lites'
       * edges, solid between them in each band. */
      const leafAround = (
        s0: number,
        s1: number,
        y0: number,
        y1: number,
        lites: [number, number, number, number][],
        depth: number,
        color: string,
      ) => {
        const ys = [
          ...new Set([y0, y1, ...lites.flatMap((l) => [l[2], l[3]])]),
        ].sort((p, q) => p - q);
        for (let k = 0; k + 1 < ys.length; k++) {
          const ya = ys[k]!;
          const yb = ys[k + 1]!;
          if (yb - ya < 0.002) continue;
          const across = lites
            .filter((l) => l[2] <= ya + 1e-6 && l[3] >= yb - 1e-6)
            .sort((p, q) => p[0] - q[0]);
          let c = s0;
          for (const l of across) {
            if (l[0] > c + 0.002)
              walls.push({ ...box(c, l[0], ya, yb, depth), color });
            c = Math.max(c, l[1]);
          }
          if (s1 > c + 0.002)
            walls.push({ ...box(c, s1, ya, yb, depth), color });
        }
      };
      /** Muntins over a pane [s0, s1] x [y0, y1]: `cols` x `rows` lites,
       * or (prairie) a border of narrow lites round a big one. */
      const muntins = (
        s0: number,
        s1: number,
        y0: number,
        y1: number,
        grid: WindowGrid | "french",
        color: string,
        out = 0,
      ) => {
        const bar = 0.022;
        const d = 0.03;
        const w = s1 - s0;
        const h = y1 - y0;
        const vert = (s: number, a = y0, b = y1) =>
          walls.push({
            ...proud(box(s - bar / 2, s + bar / 2, a, b, d), out),
            color,
          });
        const horiz = (y: number, a = s0, b = s1) =>
          walls.push({
            ...proud(box(a, b, y - bar / 2, y + bar / 2, d), out),
            color,
          });
        if (grid === "prairie") {
          const k = Math.min(0.1, w * 0.18, h * 0.18);
          vert(s0 + k);
          vert(s1 - k);
          horiz(y0 + k);
          horiz(y1 - k);
          return;
        }
        if (grid === "craftsman") {
          // Tall lites across the top part only.
          const cols = Math.max(2, Math.round(w / 0.3));
          for (let c = 1; c < cols; c++) vert(s0 + (w * c) / cols);
          return;
        }
        const cols = grid === "french" ? 2 : Math.max(2, Math.round(w / 0.32));
        const rows = grid === "french" ? 5 : Math.max(2, Math.round(h / 0.36));
        for (let c = 1; c < cols; c++) vert(s0 + (w * c) / cols);
        for (let r = 1; r < rows; r++) horiz(y0 + (h * r) / rows);
      };
      /** An outside door's leaf (or leaves) in its style. */
      const doorLeaf = (
        s0: number,
        s1: number,
        y0: number,
        y1: number,
        style: DoorStyle,
        color: string,
      ) => {
        const D = 0.05;
        const h = y1 - y0;
        const glass = (l: [number, number, number, number]) =>
          panes.push({
            box: box(l[0], l[1], l[2], l[3], 0.02),
            kind: "glass",
            color: "#86a6bd",
            opacity: 0.38,
          });
        const leaves: [number, number][] =
          style === "french"
            ? [
                [s0, (s0 + s1) / 2],
                [(s0 + s1) / 2, s1],
              ]
            : [[s0, s1]];
        leaves.forEach(([a, b], li) => {
          const lw = b - a;
          const st = Math.min(0.12, lw * 0.14);
          const X = (f: number) => a + st + (lw - 2 * st) * f;
          const Y = (f: number) => y0 + h * f;
          const lites: [number, number, number, number][] = [];
          const panels: [number, number, number, number][] = [];
          const twoCols: [number, number][] = [
            [0, 0.45],
            [0.55, 1],
          ];
          switch (style) {
            case "six_panel":
              for (const [c0, c1] of twoCols)
                for (const [r0, r1] of [
                  [0.06, 0.3],
                  [0.36, 0.7],
                  [0.76, 0.93],
                ] as const)
                  panels.push([X(c0), X(c1), Y(r0), Y(r1)]);
              break;
            case "craftsman":
              for (const [c0, c1] of [
                [0, 0.3],
                [0.35, 0.65],
                [0.7, 1],
              ] as const)
                lites.push([X(c0), X(c1), Y(0.72), Y(0.93)]);
              for (const [c0, c1] of twoCols)
                panels.push([X(c0), X(c1), Y(0.07), Y(0.6)]);
              // The dentil shelf under the lites.
              walls.push({
                ...proud(
                  box(a + st * 0.5, b - st * 0.5, Y(0.655), Y(0.68), 0.04),
                  D / 2,
                ),
                color,
              });
              break;
            case "half_lite":
              lites.push([X(0), X(1), Y(0.5), Y(0.93)]);
              for (const [c0, c1] of twoCols)
                panels.push([X(c0), X(c1), Y(0.07), Y(0.42)]);
              break;
            case "full_lite":
            case "french":
              lites.push([X(0), X(1), Y(0.1), Y(0.93)]);
              break;
            default:
              break;
          }
          leafAround(a, b, y0, y1, lites, D, color);
          for (const l of lites) glass(l);
          if (style === "french")
            for (const l of lites)
              muntins(l[0], l[1], l[2], l[3], "french", color);
          // Raised panels: a field standing proud of the leaf in a
          // moulded frame.
          const mould = shadeHex(color, 0.93);
          for (const [p0, p1, q0, q1] of panels) {
            walls.push({
              ...proud(box(p0, p1, q0, q1, 0.012), D / 2),
              color: mould,
            });
            const k = Math.min(0.035, (p1 - p0) * 0.15, (q1 - q0) * 0.15);
            walls.push({
              ...proud(
                box(p0 + k, p1 - k, q0 + k, q1 - k, 0.012),
                D / 2 + 0.008,
              ),
              color,
            });
          }
          // The knob (French doors: at the meeting stiles).
          const latch =
            style === "french"
              ? li === 0
                ? b - st / 2
                : a + st / 2
              : b - st / 2;
          walls.push({
            ...proud(
              box(latch - 0.02, latch + 0.02, y0 + 0.95, y0 + 1.1, 0.03),
              D / 2 + 0.015,
            ),
            color: HARDWARE,
          });
        });
      };
      /** A door between rooms over [s0, s1] x [y0, y1]: a leaf with its
       * panels let in (a mission door's three, one over another; else as
       * the style's), a knob each side by its free edge; hung on the s0
       * jamb (s1 `hingeAtEnd`), its face to the `side` face of the wall
       * (1 the wall's left as it runs, -1 its right), swung `openDeg`
       * open toward that side. */
      const insideDoor = (
        s0: number,
        s1: number,
        y0: number,
        y1: number,
        style: DoorStyle,
        color: string,
        hingeAtEnd: boolean,
        side: 1 | -1,
        openDeg: number,
      ) => {
        const D = 0.035;
        const first = walls.length;
        const firstPane = panes.length;
        const h = y1 - y0;
        const lw = s1 - s0;
        const st = Math.min(0.12, lw * 0.15);
        const X = (f: number) => s0 + st + (lw - 2 * st) * f;
        const Y = (f: number) => y0 + h * f;
        const n: Vec2 = [-dz, dx];
        const off = (b: Box3d, o: number): Box3d => ({
          ...b,
          x: b.x + n[0] * o,
          z: b.z + n[1] * o,
        });
        if (style === "mission") {
          // Three flat panels let into the leaf: a square one across the
          // top, two tall ones side by side under it.
          const top1 = Y(0.93);
          const top0 = Math.max(Y(0.62), top1 - (lw - 2 * st));
          const low1 = top0 - st * 0.9;
          const holes: [number, number, number, number][] = [
            [X(0), X(1), top0, top1],
            [X(0), X(0.46), Y(0.07), low1],
            [X(0.54), X(1), Y(0.07), low1],
          ];
          leafAround(s0, s1, y0, y1, holes, D, color);
          const panel = shadeHex(color, 0.92);
          for (const [p0, p1, q0, q1] of holes)
            walls.push({ ...box(p0, p1, q0, q1, D * 0.4), color: panel });
        } else {
          // Another style: its leaf as an outside door's, drawn the same
          // both ways (its glass and panels on the leaf's faces).
          doorLeaf(s0, s1, y0, y1, style, color);
        }
        // A matte black lever each side by its free edge: its rose on
        // the face, the lever off it pointing back toward the hinges.
        const latch = hingeAtEnd ? s0 + st / 2 : s1 - st / 2;
        const back = hingeAtEnd ? 1 : -1;
        const lever = 0.12;
        for (const o of [-1, 1]) {
          walls.push({
            ...off(
              box(latch - 0.027, latch + 0.027, y0 + 0.93, y0 + 0.984, 0.012),
              o * (D / 2 + 0.006),
            ),
            color: LEVER_BLACK,
          });
          walls.push({
            ...off(
              box(latch - 0.009, latch + 0.009, y0 + 0.948, y0 + 0.966, 0.05),
              o * (D / 2 + 0.025),
            ),
            color: LEVER_BLACK,
          });
          const tip = latch + back * lever;
          walls.push({
            ...off(
              box(
                Math.min(latch, tip),
                Math.max(latch, tip),
                y0 + 0.948,
                y0 + 0.966,
                0.018,
              ),
              o * (D / 2 + 0.055),
            ),
            color: LEVER_BLACK,
          });
        }
        // To the wall's face on its side, then swung open about its hinge
        // there.
        const shift = side * (t / 2 - D / 2 - 0.004);
        const sh = hingeAtEnd ? s1 : s0;
        const [hx, hz] = at(sh);
        const P: Vec2 = [
          hx + n[0] * side * (t / 2),
          hz + n[1] * side * (t / 2),
        ];
        const sgn = hingeAtEnd ? -1 : 1;
        const e1: Vec2 = [dx * sgn, dz * sgn];
        const e2: Vec2 = [n[0] * side, n[1] * side];
        const th = (Math.max(0, Math.min(180, openDeg)) * Math.PI) / 180;
        const [c, s] = [Math.cos(th), Math.sin(th)];
        const swing = (b: Box3d): Box3d => {
          const q: Vec2 = [
            b.x + n[0] * shift - P[0],
            b.z + n[1] * shift - P[1],
          ];
          const a1 = q[0] * e1[0] + q[1] * e1[1];
          const a2 = q[0] * e2[0] + q[1] * e2[1];
          const r1 = a1 * c - a2 * s;
          const r2 = a1 * s + a2 * c;
          // Its length runs along the leaf, turned with it.
          const ux = dx * c + sgn * s * e2[0];
          const uz = dz * c + sgn * s * e2[1];
          return {
            ...b,
            x: P[0] + r1 * e1[0] + r2 * e2[0],
            z: P[1] + r1 * e1[1] + r2 * e2[1],
            angle: Math.atan2(-uz, ux),
          };
        };
        for (let k = first; k < walls.length; k++) walls[k] = swing(walls[k]!);
        for (let k = firstPane; k < panes.length; k++)
          panes[k] = { ...panes[k]!, box: swing(panes[k]!.box) };
      };
      /** A barn door over a doorway between rooms [s0, s1] x [y0, y1]: a
       * leaf of three frosted glass panes one over another, each in its
       * own matte black frame, hung off the `side` face of the wall from a
       * black track over the opening, slid `open` (0 shut, 1 clear of the
       * opening) toward the wall's end (its start, `towardStart`). */
      const barnDoor = (
        s0: number,
        s1: number,
        y0: number,
        y1: number,
        side: 1 | -1,
        open: number,
        towardStart: boolean,
      ) => {
        const n: Vec2 = [-dz, dx];
        const put = (b: Box3d, o: number): Box3d => ({
          ...b,
          x: b.x + n[0] * o,
          z: b.z + n[1] * o,
        });
        const lap = 0.05;
        const w = s1 - s0 + 2 * lap;
        const D = 0.04;
        // Off the wall's face, clear of the casing.
        const o = side * (t / 2 + 0.03 + D / 2);
        const dir = towardStart ? -1 : 1;
        const a = s0 - lap + dir * open * (w - lap);
        const b = a + w;
        const lo = y0 + 0.012;
        const hi = y1 + lap;
        const fr = 0.045;
        const ph = (hi - lo - 4 * fr) / 3;
        const frame = (p0: number, p1: number, q0: number, q1: number) =>
          walls.push({ ...put(box(p0, p1, q0, q1, D), o), color: LEVER_BLACK });
        frame(a, a + fr, lo, hi);
        frame(b - fr, b, lo, hi);
        for (let k = 0; k < 4; k++) {
          const y = lo + k * (ph + fr);
          frame(a + fr, b - fr, y, y + fr);
        }
        for (let k = 0; k < 3; k++) {
          const y = lo + fr + k * (ph + fr);
          panes.push({
            box: put(box(a + fr, b - fr, y, y + ph, 0.012), o),
            kind: "glass",
            color: "#eef2f1",
            opacity: 0.82,
          });
        }
        // A bar pull each side by its leading edge.
        const lead = towardStart ? b - 0.09 : a + 0.09;
        for (const f of [-1, 1])
          walls.push({
            ...put(
              box(lead - 0.012, lead + 0.012, y0 + 0.85, y0 + 1.2, 0.02),
              o + f * (D / 2 + 0.03),
            ),
            color: LEVER_BLACK,
          });
        // The track over the opening (as long as the door's run, inside
        // the wall's ends) and the two straps it hangs from.
        const t0 = Math.max(0, Math.min(s0 - lap, s0 - lap + dir * (w - lap)));
        const t1 = Math.min(L, Math.max(s1 + lap, s1 + lap + dir * (w - lap)));
        walls.push({
          ...put(
            box(t0, t1, hi + 0.04, hi + 0.075, 0.02),
            side * (t / 2 + 0.02),
          ),
          color: LEVER_BLACK,
        });
        for (const x of [a + 0.12, b - 0.12])
          walls.push({
            ...put(
              box(x - 0.02, x + 0.02, hi - 0.06, hi + 0.075, 0.012),
              o - side * (D / 2 - 0.006),
            ),
            color: LEVER_BLACK,
          });
      };
      /** A garage door's sections, panels, glass and hardware: the door
       * stands over [s0, s1] from `bottom` up to `head` (higher sections
       * rolled up out of sight), `D` thick. */
      const garageDetail = (
        s0: number,
        s1: number,
        bottom: number,
        head: number,
        full: number,
        D: number,
        style: GarageStyle,
        color: string,
      ) => {
        const w = s1 - s0;
        const sec = full / 4;
        const groove = shadeHex(color, 0.82);
        const add = (
          a: number,
          b: number,
          y0: number,
          y1: number,
          c: string,
          out: number,
          depth = 0.012,
          kind: "door" | "glass" = "door",
        ) => {
          const top = Math.min(y1, head);
          if (top - y0 < 0.005 || y0 >= head) return;
          panes.push({
            box: proud(box(a, b, y0, top, depth), out),
            kind,
            color: c,
            opacity: kind === "glass" ? 0.88 : 1,
          });
        };
        const face = D / 2;
        for (let k = 0; k < 4; k++) {
          const y0 = bottom + k * sec;
          const y1 = y0 + sec;
          if (y0 >= head) break;
          const top = k === 3;
          // The joint between sections.
          if (k > 0) add(s0, s1, y0 - 0.006, y0 + 0.006, groove, face, 0.006);
          switch (style) {
            case "raised_short":
            case "raised_long":
            case "windows": {
              const n =
                style === "raised_long"
                  ? Math.max(1, Math.round(w / 1.25))
                  : Math.max(2, Math.round(w / 0.55));
              const m0 = 0.07;
              const pw = (w - m0 * (n + 1)) / n;
              for (let j = 0; j < n; j++) {
                const a = s0 + m0 + j * (pw + m0);
                if (style === "windows" && top)
                  add(
                    a,
                    a + pw,
                    y0 + sec * 0.2,
                    y1 - sec * 0.2,
                    GARAGE_GLASS,
                    face,
                    0.008,
                    "glass",
                  );
                else {
                  add(
                    a,
                    a + pw,
                    y0 + sec * 0.16,
                    y1 - sec * 0.16,
                    groove,
                    face,
                    0.01,
                  );
                  add(
                    a + 0.02,
                    a + pw - 0.02,
                    y0 + sec * 0.16 + 0.02,
                    y1 - sec * 0.16 - 0.02,
                    color,
                    face + 0.006,
                    0.01,
                  );
                }
              }
              break;
            }
            case "carriage": {
              // Two "swing doors": boards, a centre split, glass on top.
              const mid = (s0 + s1) / 2;
              for (let s = s0 + 0.14; s < s1 - 0.07; s += 0.14)
                if (Math.abs(s - mid) > 0.05)
                  add(s - 0.004, s + 0.004, y0, y1, groove, face, 0.004);
              add(mid - 0.012, mid + 0.012, y0, y1, groove, face, 0.006);
              if (top)
                for (const [a, b] of [
                  [s0, mid],
                  [mid, s1],
                ] as const) {
                  const lw = (b - a - 0.08 * 3) / 2;
                  for (let j = 0; j < 2; j++) {
                    const x = a + 0.08 + j * (lw + 0.08);
                    add(
                      x,
                      x + lw,
                      y0 + sec * 0.2,
                      y1 - sec * 0.15,
                      GARAGE_GLASS,
                      face,
                      0.008,
                      "glass",
                    );
                  }
                }
              break;
            }
            case "modern": {
              const n = Math.max(3, Math.round(w / 0.8));
              const m0 = 0.05;
              const pw = (w - m0 * (n + 1)) / n;
              for (let j = 0; j < n; j++) {
                const a = s0 + m0 + j * (pw + m0);
                add(
                  a,
                  a + pw,
                  y0 + 0.05,
                  y1 - 0.05,
                  GARAGE_GLASS,
                  face,
                  0.008,
                  "glass",
                );
              }
              break;
            }
            default:
              break;
          }
        }
        if (style === "carriage") {
          // Handles by the split, strap hinges at the sides.
          const mid = (s0 + s1) / 2;
          for (const s of [mid - 0.12, mid + 0.12])
            add(
              s - 0.015,
              s + 0.015,
              bottom + 0.9,
              bottom + 1.15,
              HARDWARE,
              face + 0.01,
              0.02,
            );
          for (const y of [bottom + sec * 0.5, bottom + sec * 2.5])
            for (const [a, b] of [
              [s0 + 0.04, s0 + 0.45],
              [s1 - 0.45, s1 - 0.04],
            ] as const)
              add(a, b, y - 0.025, y + 0.025, HARDWARE, face + 0.01, 0.01);
        }
      };
      /** A pair of louvered shutters flanking a window. */
      const shutterPair = (
        s0: number,
        s1: number,
        y0: number,
        y1: number,
        color: string,
      ) => {
        const sw = Math.min(0.45, Math.max(0.25, (s1 - s0) * 0.4));
        const gap = WINDOW_TRIM_M + 0.02;
        const out = t / 2 + 0.02;
        const slat = shadeHex(color, 1.12);
        for (const [a, b] of [
          [s0 - gap - sw, s0 - gap],
          [s1 + gap, s1 + gap + sw],
        ] as const) {
          if (a < 0 || b > L) continue;
          walls.push({ ...proud(box(a, b, y0, y1, 0.03), out), color });
          for (let y = y0 + 0.07; y < y1 - 0.06; y += 0.065)
            walls.push({
              ...proud(
                box(a + 0.045, b - 0.045, y, y + 0.022, 0.012),
                out + 0.018,
              ),
              color: slat,
            });
        }
      };
      let cursor = -ext0;
      for (const hole of holes) {
        const { opening } = hole;
        if (hole.s0 > cursor) solid(cursor, hole.s0, foot);
        // What's drawn for the opening itself (its casing, leaf, glass and
        // covers) picks as the opening.
        const wallsBefore = walls.length;
        const panesBefore = panes.length;
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
              : windowHead;
        let head =
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
                : Math.min(windowSill, head - off - 0.1)) + off;
        // Its bottom and height set by hand: there, as far as the wall
        // allows, and not moved for the ground or a roof outside.
        const byHand =
          !isDoor &&
          !beside &&
          (opening.sill_m != null || opening.height_m != null);
        if (byHand) {
          const own = opening.height_m ?? head - sill;
          sill =
            Math.max(
              0,
              Math.min(opening.sill_m ?? sill - off, top - off - 0.1),
            ) + off;
          head = Math.min(top, sill + Math.max(0.1, own));
        }
        // A window in an outside wall stays clear of the ground.
        if (!byHand && !isDoor && outside && exterior.groundAt) {
          const [gx, gz] = at(hole.s);
          const clear = exterior.groundAt(gx, gz) - GROUND_DRAWN_M + 0.15;
          if (sill < clear) sill = Math.min(clear, head - 0.3);
        }
        // ...and clear of a lower roof outside it (one sloping up against
        // the wall below): moved up, keeping its size, as far as the wall
        // allows, and only then cut short.
        if (!byHand && !isDoor && nOut && style !== "full") {
          let roofTop = -Infinity;
          for (const f of [0, 0.25, 0.5, 0.75, 1]) {
            const [px, pz] = at(hole.s0 + (hole.s1 - hole.s0) * f);
            const o = t / 2 + 0.05;
            const r = exterior.roofBelow(
              px + nOut[0] * o,
              pz + nOut[1] * o,
              head,
            );
            if (r !== null) roofTop = Math.max(roofTop, r);
          }
          const clear = roofTop + 0.12;
          if (clear > sill) {
            const lift = Math.min(clear - sill, Math.max(0, top - 0.08 - head));
            sill += lift;
            head += lift;
            if (sill < clear) sill = Math.min(clear, head - 0.3);
          }
        }
        // Its casing's widths indoors (on an outside wall, or both sides of
        // a door between rooms), its sides', top's and bottom's: set on it,
        // else as outside; and a bezel round its outer edge.
        const cmOr = (v: number | null | undefined, or: number) =>
          v != null ? Math.max(0, v) / 100 : or;
        const cased = !!outside || (isDoor && !opening.garage);
        const trimSide = cased ? cmOr(opening.trim_width_cm, WINDOW_TRIM_M) : 0;
        const trimTop = cased ? cmOr(opening.trim_top_cm, trimSide) : 0;
        const trimBottom = cased ? cmOr(opening.trim_bottom_cm, trimSide) : 0;
        const bezel = outside ? cmOr(opening.trim_bezel_cm, 0) : 0;
        // A stained casing: the door's own wood (or its paint).
        const stain =
          opening.paint_color ?? (dark ? DOOR_INSIDE_DARK : DOOR_INSIDE);
        openingFaces.push({
          a: at(hole.s0 - trimSide - bezel),
          b: at(hole.s1 + trimSide + bezel),
          y0: isDoor ? sill : sill - trimBottom - bezel,
          y1: head + trimTop + bezel,
          t,
        });
        // Under a door (a step up from a lower room) it stops a hair under
        // the floor it leads onto.
        if (sill > base)
          solid(hole.s0, hole.s1, foot, isDoor ? sill - JOINT_INSET_M : sill);
        if (head < top - 0.005) walls.push(box(hole.s0, hole.s1, head, top));
        // An outside door: a patio door (wide) glazed like a window, any
        // other shut with a door leaf; doors between rooms stand open.
        const outdoorDoor = isDoor && !!outside;
        const doorStyle = opening.door_style;
        const patio =
          outdoorDoor &&
          !opening.garage &&
          (doorStyle ? doorStyle === "sliding" : hole.s1 - hole.s0 > 1.2);
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
          // A sliding door's two panels: white frames round their glass
          // and the stiles where they meet in the middle (the door's own,
          // whatever the trim).
          if (patio) {
            const white = dark ? TRIM_WHITE_DARK : TRIM_WHITE;
            const a = hole.s0 + JOINT_INSET_M;
            const b = hole.s1 - JOINT_INSET_M;
            const y0 = sill + JOINT_INSET_M;
            const y1 = head - JOINT_INSET_M;
            const mid = (a + b) / 2;
            const fr = 0.05;
            const parts: [number, number, number, number][] = [
              [a, a + fr, y0, y1],
              [b - fr, b, y0, y1],
              [a, b, y1 - fr, y1],
              [a, b, y0, y0 + 0.07],
              [mid - 0.045, mid + 0.045, y0, y1],
            ];
            for (const [p0, p1, q0, q1] of parts)
              walls.push({ ...box(p0, p1, q0, q1, 0.07), color: white });
          }
        } else if (outdoorDoor && !opening.garage) {
          doorLeaf(
            hole.s0,
            hole.s1,
            sill,
            head,
            doorStyle ?? "slab",
            opening.paint_color ?? (dark ? DOOR_DARK : DOOR),
          );
        } else if (isDoor && !opening.garage) {
          const style =
            doorStyle ?? (hole.s1 - hole.s0 > 1.3 ? "none" : "mission");
          if (style === "barn")
            barnDoor(
              hole.s0,
              hole.s1,
              sill,
              head,
              opening.door_swing_flip ? -1 : 1,
              Math.min(1, Math.max(0, (opening.door_open_deg ?? 90) / 90)),
              !!opening.door_hinge_flip,
            );
          else if (style !== "none" && style !== "sliding")
            insideDoor(
              hole.s0 + JOINT_INSET_M,
              hole.s1 - JOINT_INSET_M,
              sill,
              head - JOINT_INSET_M,
              style,
              opening.paint_color ?? (dark ? DOOR_INSIDE_DARK : DOOR_INSIDE),
              !!opening.door_hinge_flip,
              opening.door_swing_flip ? -1 : 1,
              opening.door_open_deg ?? 90,
            );
        }
        // A window's rails (how it opens) and grid, in the trim's white.
        if (!isDoor) {
          const trimC = dark ? TRIM_WHITE_DARK : TRIM_WHITE;
          const a = hole.s0 + JOINT_INSET_M;
          const b = hole.s1 - JOINT_INSET_M;
          const y0 = sill + JOINT_INSET_M;
          const y1 = head - JOINT_INSET_M;
          const type = opening.window_type ?? "picture";
          const grid = opening.window_grid ?? "none";
          const rail = 0.05;
          let sashes: [number, number, number, number][] = [[a, b, y0, y1]];
          if (type === "single_hung") {
            const mid = (y0 + y1) / 2;
            walls.push({
              ...box(a, b, mid - rail / 2, mid + rail / 2, 0.06),
              color: trimC,
            });
            sashes = [
              [a, b, mid + rail / 2, y1],
              [a, b, y0, mid - rail / 2],
            ];
          } else if (
            (type === "casement" && b - a > 0.8) ||
            type === "slider"
          ) {
            const mid = (a + b) / 2;
            walls.push({
              ...box(mid - rail / 2, mid + rail / 2, y0, y1, 0.06),
              color: trimC,
            });
            sashes = [
              [a, mid - rail / 2, y0, y1],
              [mid + rail / 2, b, y0, y1],
            ];
          }
          if (grid !== "none")
            for (const [k, sh] of sashes.entries()) {
              // A craftsman grid divides only the top sash (or the top
              // third of a single pane).
              if (grid === "craftsman" && k > 0 && type === "single_hung")
                continue;
              const [p0, p1, q0, q1] = sh;
              const q =
                grid === "craftsman" && type !== "single_hung"
                  ? q1 - (q1 - q0) / 3
                  : q0;
              if (grid === "craftsman" && type !== "single_hung")
                walls.push({
                  ...box(p0, p1, q - 0.011, q + 0.011, 0.03),
                  color: trimC,
                });
              muntins(p0, p1, q, q1, grid, trimC);
            }
          if (opening.shutters && outside)
            shutterPair(
              hole.s0,
              hole.s1,
              sill,
              head,
              opening.paint_color ?? SHUTTER,
            );
        }
        // White casing round a window or door in an outside wall, standing
        // a little proud of the siding so it reads from the street (round a
        // patio door's outside only: nothing down its middle).
        if (outside && (!isDoor || outdoorDoor)) {
          const d = t + 0.04;
          const trim = dark ? TRIM_WHITE_DARK : TRIM_WHITE;
          /** The casing's pieces round the opening, `w` wide up its sides,
           * `top` over it and `bot` under it. */
          const piecesOf = (w: number, top = w, bot = w) => {
            const pieces: [number, number, number, number][] = [
              // Each piece laps a few millimetres into the opening, so its
              // faces never share a plane with the wall's.
              [
                hole.s0 - w,
                hole.s0 + JOINT_INSET_M,
                isDoor ? sill : sill - bot,
                head + top,
              ],
              [
                hole.s1 - JOINT_INSET_M,
                hole.s1 + w,
                isDoor ? sill : sill - bot,
                head + top,
              ],
              [hole.s0, hole.s1, head - JOINT_INSET_M, head + top],
            ];
            if (!isDoor)
              pieces.push([hole.s0, hole.s1, sill - bot, sill + JOINT_INSET_M]);
            return pieces;
          };
          // White oak indoors, other widths or a bezel there: the casing in
          // two, white outside, its own inside (from across the wall's
          // inside face).
          const oak =
            opening.trim_finish === "maple"
              ? dark
                ? TRIM_MAPLE_DARK
                : TRIM_MAPLE
              : opening.trim_finish === "white_oak"
                ? dark
                  ? TRIM_OAK_DARK
                  : TRIM_OAK
                : opening.trim_finish === "stained"
                  ? stain
                  : null;
          const split =
            !!oak ||
            bezel > 0.001 ||
            [trimSide, trimTop, trimBottom].some(
              (w) => Math.abs(w - WINDOW_TRIM_M) > 0.001,
            );
          const ox = -dz * outside;
          const oz = dx * outside;
          // Never past the wall's own ends (a door hard by a corner): the
          // wall beyond belongs to the next one; out from the wall's
          // middle from one depth to the other.
          const lay = (
            pieces: [number, number, number, number][],
            from: number,
            to: number,
            color: string,
          ) => {
            for (const [s0, s1, y0, y1] of pieces) {
              const p0 = Math.max(s0, 0);
              const p1 = Math.min(s1, L);
              if (p1 - p0 <= 0.005 || y1 - y0 <= 0.005) continue;
              const b = box(p0, p1, y0, y1, to - from);
              const mid = (from + to) / 2;
              walls.push({ ...b, x: b.x + ox * mid, z: b.z + oz * mid, color });
            }
          };
          const outer = piecesOf(WINDOW_TRIM_M);
          if (!split) lay(outer, -d / 2, d / 2, trim);
          else {
            lay(outer, -t / 2 + 0.002, d / 2, trim);
            // Inside: its own widths (a side at nothing: just the top and
            // bottom across).
            lay(
              piecesOf(trimSide, trimTop, trimBottom),
              -d / 2,
              -t / 2 + 0.002,
              oak ?? trim,
            );
            // Its bezel: a band round the casing's outer edge, a hair proud.
            if (bezel > 0.001) {
              const bz = opening.trim_bezel_color ?? TRIM_BEZEL;
              const l0 = hole.s0 - trimSide;
              const r1 = hole.s1 + trimSide;
              const lo = isDoor ? sill : sill - trimBottom - bezel;
              const hi = head + trimTop + bezel;
              const band: [number, number, number, number][] = [
                [l0 - bezel, l0, lo, hi],
                [r1, r1 + bezel, lo, hi],
                [l0, r1, head + trimTop, hi],
              ];
              if (!isDoor) band.push([l0, r1, lo, sill - trimBottom]);
              lay(band, -d / 2 - 0.003, -t / 2 + 0.002, bz);
            }
          }
          // In white oak, its jambs lined in it too: from the inside face
          // back to the glass, round a window or a patio door.
          if (oak && (!isDoor || patio)) {
            const j = 0.015;
            const liners: [number, number, number, number][] = [
              [hole.s0, hole.s0 + j, sill, head],
              [hole.s1 - j, hole.s1, sill, head],
              [hole.s0, hole.s1, head - j, head],
            ];
            if (!isDoor) liners.push([hole.s0, hole.s1, sill, sill + j]);
            for (const [s0, s1, y0, y1] of liners) {
              const from = -t / 2 + 0.001;
              const to = -0.012;
              if (to - from < 0.005) continue;
              const b = box(
                Math.max(s0, 0),
                Math.min(s1, L),
                y0,
                y1,
                to - from,
              );
              const mid = (from + to) / 2;
              walls.push({
                ...b,
                x: b.x + ox * mid,
                z: b.z + oz * mid,
                color: oak,
              });
            }
          }
        }
        // A door between rooms: its casing on both faces of the wall, a
        // little proud of each, stained like the door (unless set white or
        // white oak).
        if (!outside && isDoor && !opening.garage) {
          const color =
            opening.trim_finish === "maple"
              ? dark
                ? TRIM_MAPLE_DARK
                : TRIM_MAPLE
              : opening.trim_finish === "white_oak"
                ? dark
                  ? TRIM_OAK_DARK
                  : TRIM_OAK
                : opening.trim_finish === "white"
                  ? dark
                    ? TRIM_WHITE_DARK
                    : TRIM_WHITE
                  : stain;
          const pieces: [number, number, number, number][] = [
            [hole.s0 - trimSide, hole.s0 + JOINT_INSET_M, sill, head + trimTop],
            [hole.s1 - JOINT_INSET_M, hole.s1 + trimSide, sill, head + trimTop],
            [hole.s0, hole.s1, head - JOINT_INSET_M, head + trimTop],
          ];
          for (const [s0, s1, y0, y1] of pieces) {
            const p0 = Math.max(s0, 0);
            const p1 = Math.min(s1, L);
            if (p1 - p0 <= 0.005 || y1 - y0 <= 0.005) continue;
            walls.push({ ...box(p0, p1, y0, y1, t + 0.03), color });
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
          const gStyle = opening.garage_style ?? "flush";
          const gColor =
            garage && gStyle === "modern"
              ? (opening.paint_color ?? GARAGE_FRAME)
              : garage && opening.paint_color
                ? opening.paint_color
                : garage
                  ? dark
                    ? "#90a4ae"
                    : "#cfd8dc"
                  : dark
                    ? "#8d8574"
                    : "#efe6d2";
          const gD = garage ? Math.min(0.06, t) : 0.03;
          panes.push({
            box: box(s0, s1, head - covered * span, head, gD),
            kind: garage ? "door" : "cover",
            color: gColor,
            opacity: garage ? 1 : 0.92,
          });
          if (garage && outside && gStyle !== "flush")
            garageDetail(
              s0,
              s1,
              head - covered * span,
              head,
              span,
              gD,
              gStyle,
              gColor,
            );
        }
        const openingRef: EditRef = { kind: "opening", id: opening.id };
        for (let k = wallsBefore; k < walls.length; k++)
          if (walls[k]!.color) walls[k]!.ref = openingRef;
        for (let k = panesBefore; k < panes.length; k++)
          panes[k]!.box.ref = openingRef;
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
        // Where a flight of stairs meets this edge at the deck's level: a
        // gap in the railing (metres along it from pa).
        const plen = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
        const gaps: [number, number][] = [];
        for (const st of stairs) {
          const ends: [Vec2, Vec2, number][] = [
            [st.sides[0]![0], st.sides[1]![0], st.back],
            [st.sides[0]![1], st.sides[1]![1], st.front],
          ];
          for (const [e0, e1, y] of ends) {
            if (Math.abs(y - level) > 0.05) continue;
            const off = (q: Vec2) =>
              Math.abs((q[0] - pa[0]) * nx + (q[1] - pa[1]) * nz);
            if (off(e0) > 0.4 || off(e1) > 0.4) continue;
            const t = (q: Vec2) => (q[0] - pa[0]) * ux + (q[1] - pa[1]) * uz;
            const t0 = Math.max(0, Math.min(t(e0), t(e1)) - 0.03);
            const t1 = Math.min(plen, Math.max(t(e0), t(e1)) + 0.03);
            if (t1 > t0) gaps.push([t0, t1]);
          }
        }
        const inGap = (t: number) => gaps.some(([g0, g1]) => t > g0 && t < g1);
        /** The railing's runs: the edge less its gaps. */
        const runs: [number, number][] = [];
        let from = 0;
        for (const [g0, g1] of [...gaps].sort((p, q) => p[0] - q[0])) {
          if (g0 > from) runs.push([from, g0]);
          from = Math.max(from, g1);
        }
        if (from < plen) runs.push([from, plen]);
        const at = (t: number): Vec2 => [pa[0] + ux * t, pa[1] + uz * t];
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
          // In a stair's gap, a post at the floor only (no rail on it).
          const gap = open && inGap((plen * i) / n);
          post(x, z, open && !gap ? level + RAIL_TOP_M : level - 0.02);
        }
        if (!open) return;
        // A post each side of a stair's gap, where the railing stops.
        for (const [g0, g1] of gaps)
          for (const t of [g0, g1])
            if (t > 0.05 && t < plen - 0.05) post(...at(t), level + RAIL_TOP_M);
        for (const [r0, r1] of runs) {
          if (r1 - r0 < 0.05) continue;
          walls.push({
            ...along(
              at(r0),
              at(r1),
              level + RAIL_TOP_M - 0.06,
              level + RAIL_TOP_M,
              0.09,
            ),
            color: wood,
          });
          walls.push({
            ...along(at(r0), at(r1), level + 0.08, level + 0.12, 0.05),
            color: rail,
          });
        }
        const count = Math.floor(len / 0.12);
        for (let i = 1; i < count; i++) {
          const f = i / count;
          if (inGap(plen * f)) continue;
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
  // Closets topped by a ledge (see below), their outlines in plan units.
  const ledges: [number, number][][] = [];
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
      // A colour picked for the floor, else the room's fill on the base.
      color:
        room.floor_color ??
        mixHex(
          room.outdoor ? deckBase : floorBase,
          fill.color,
          Math.min(1, fill.opacity * 1.6),
        ),
      finish: room.floor_finish ?? floorFinish(room.name, !!room.outdoor),
      tinted: !!room.floor_color || fill.opacity > 0.05,
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
      if (floorAbove(cx, cz) === null) ledges.push(room.points);
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

  // Under the drawn roof, a room with no floor over it has a ceiling:
  // vaulted, following the roof's underside up from its walls' height (the
  // walls filled up to it), else flat at that height (cut away, it's left
  // open to look into). One that a room above covers only in part is left
  // open.
  const vaults: { id: string; positions: number[] }[] = [];
  // A ledge closet's own walls (all along its outline) stop at the ledge:
  // over them it's open to the vault on either side (no wall filled up to
  // it). A wall running on past it (a room's beside it) still does.
  const ledgeWalls = new Set(
    layout.walls.filter((w) =>
      ledges.some((poly) =>
        w.points.every(([x, y]) =>
          poly.some((a, k) => {
            const b = poly[(k + 1) % poly.length]!;
            return (
              pointToSegmentDistance(x, y, a[0], a[1], b[0], b[1]) * m < 0.1
            );
          }),
        ),
      ),
    ),
  );
  // Open space inside the house that's no room on any floor (a
  // stairwell): vaulted as one with the rooms open to it (see below).
  const houseLoops = houseLoopsOf(layout);
  // A vault's grid: through every corner, no wider than 30 cm.
  const axis = (vals: number[]) => {
    const u = [...new Set(vals.map((v) => Math.round(v * 1000) / 1000))].sort(
      (a, b) => a - b,
    );
    const out: number[] = [];
    u.forEach((v, i) => {
      out.push(v);
      const next = u[i + 1];
      if (next === undefined) return;
      const n = Math.ceil((next - v) / 0.3);
      for (let k = 1; k < n; k++) out.push(v + ((next - v) * k) / n);
    });
    return out;
  };
  /** The vault's height at a spot over a room whose walls stop at `level`
   * (see vaultUnder). */
  const vaultY = (level: number, x: number, z: number) =>
    vaultUnder(level, exterior.vaultAt(x, z));
  const stairwell = (x: number, z: number) =>
    houseLoops.some((loop) => pointInPolygon(x / m, z / m, loop)) &&
    !layout.rooms.some(
      (o) => o.points.length >= 3 && pointInPolygon(x / m, z / m, o.points),
    ) &&
    !exterior.upperRoom(x, z) &&
    !exterior.upperHouse(x, z);
  if (exterior.roofShown)
    for (const room of layout.rooms) {
      if (room.outdoor || room.points.length < 3) continue;
      const xs = room.points.map((p) => p[0]);
      const ys = room.points.map((p) => p[1]);
      const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
      const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
      let covered = false;
      for (let i = 0; i < 8 && !covered; i++)
        for (let j = 0; j < 8 && !covered; j++) {
          const px = x0 + ((x1 - x0) * (i + 0.5)) / 8;
          const py = y0 + ((y1 - y0) * (j + 0.5)) / 8;
          if (
            pointInPolygon(px, py, room.points) &&
            floorAbove(px * m, py * m) !== null
          )
            covered = true;
        }
      if (covered) continue;
      const level = (room.floor_offset_m ?? 0) + H;
      const flatSet = room.ceiling === "flat";
      const pts = room.points.map(([x, y]): Vec2 => [x * m, y * m]);
      const vy = (x: number, z: number) => vaultY(level, x, z);
      // Through the dormers' and the roof's sections' edges too, so a step
      // falls square on them.
      const [bx0, bx1] = [
        Math.min(...pts.map((p) => p[0])),
        Math.max(...pts.map((p) => p[0])),
      ];
      const [bz0, bz1] = [
        Math.min(...pts.map((p) => p[1])),
        Math.max(...pts.map((p) => p[1])),
      ];
      const gx = axis(
        [
          ...pts.map((p) => p[0]),
          ...exterior.dormers.flatMap((d) => [d[0], d[2]]),
          ...exterior.roofLines.xs,
        ].filter((x) => x >= bx0 && x <= bx1),
      );
      const gz = axis(
        [
          ...pts.map((p) => p[1]),
          ...exterior.dormers.flatMap((d) => [d[1], d[3]]),
          ...exterior.roofLines.zs,
        ].filter((z) => z >= bz0 && z <= bz1),
      );
      const inside = (i: number, j: number) =>
        i >= 0 &&
        j >= 0 &&
        i + 1 < gx.length &&
        j + 1 < gz.length &&
        pointInPolygon(
          (gx[i]! + gx[i + 1]!) / 2,
          (gz[j]! + gz[j + 1]!) / 2,
          pts,
        );
      // A cell's own corner (ci, cj: 0 or 1), sampled a hair inside it so
      // a step (to a dormer's flat, or between two sections' undersides)
      // falls on its edge.
      const EDGE_IN = 0.002;
      const corner = (i: number, j: number, ci: 0 | 1, cj: 0 | 1) => {
        const x = gx[i + ci]!;
        const z = gz[j + cj]!;
        const own = vy(
          x + (ci ? -EDGE_IN : EDGE_IN),
          z + (cj ? -EDGE_IN : EDGE_IN),
        );
        // The grid point's own where it's no step (shared with the cells
        // round it, so no seam shows between them).
        const at = vy(x, z);
        return [x, Math.abs(own - at) < 0.01 ? at : own, z];
      };
      let peak = level;
      for (let j = 0; j + 1 < gz.length; j++)
        for (let i = 0; i + 1 < gx.length; i++)
          if (inside(i, j))
            for (const [ci, cj] of [
              [0, 0],
              [1, 0],
              [0, 1],
              [1, 1],
            ] as const)
              peak = Math.max(peak, corner(i, j, ci, cj)[1]!);
      if (!flatSet && peak > level + 0.05) {
        const pos: number[] = [];
        /** A quad between two edges (each from its start to its end),
         * where their heights differ: each half only where its end does
         * (no sliver, whose facing would be anyone's guess). */
        const step = (p: number[], q: number[], r: number[], u: number[]) => {
          if (Math.abs(q[1]! - u[1]!) > 0.002) pos.push(...p, ...q, ...u);
          if (Math.abs(p[1]! - r[1]!) > 0.002) pos.push(...p, ...u, ...r);
        };
        /** How far a triangle's middle is off the vault there. */
        const offBy = (p: number[], q: number[], r: number[]) =>
          Math.abs(
            vy((p[0]! + q[0]! + r[0]!) / 3, (p[2]! + q[2]! + r[2]!) / 3) -
              (p[1]! + q[1]! + r[1]!) / 3,
          );
        /** A quad's two ways to split: along c00-c11, along c10-c01, each
         * as how far its triangles are off the vault. */
        const splits = (
          c00: number[],
          c10: number[],
          c01: number[],
          c11: number[],
        ) => [
          Math.max(offBy(c00, c10, c11), offBy(c00, c11, c01)),
          Math.max(offBy(c00, c10, c01), offBy(c10, c11, c01)),
        ];
        /** A quad's two triangles, split the way nearer the vault, so a
         * valley or a hip crossing it runs along the fold. */
        const quad = (
          c00: number[],
          c10: number[],
          c01: number[],
          c11: number[],
        ) => {
          const [a, b] = splits(c00, c10, c01, c11);
          if (b! < a! - 0.0005)
            pos.push(...c00, ...c10, ...c01, ...c10, ...c11, ...c01);
          else pos.push(...c00, ...c10, ...c11, ...c00, ...c11, ...c01);
        };
        // A cell a fold crosses askew (neither diagonal follows it): drawn
        // finer, so the fold doesn't zigzag.
        const FINE = 6;
        const askew = new Map<string, boolean>();
        const isAskew = (i: number, j: number) => {
          const key = `${i},${j}`;
          let hit = askew.get(key);
          if (hit === undefined) {
            hit = false;
            if (inside(i, j))
              hit =
                Math.min(
                  ...splits(
                    corner(i, j, 0, 0),
                    corner(i, j, 1, 0),
                    corner(i, j, 0, 1),
                    corner(i, j, 1, 1),
                  ),
                ) > 0.004;
            askew.set(key, hit);
          }
          return hit;
        };
        for (let j = 0; j + 1 < gz.length; j++)
          for (let i = 0; i + 1 < gx.length; i++) {
            if (!inside(i, j)) continue;
            const c00 = corner(i, j, 0, 0);
            const c10 = corner(i, j, 1, 0);
            const c01 = corner(i, j, 0, 1);
            const c11 = corner(i, j, 1, 1);
            if (!isAskew(i, j)) quad(c00, c10, c01, c11);
            else {
              const [x0, x1, z0, z1] = [gx[i]!, gx[i + 1]!, gz[j]!, gz[j + 1]!];
              const lerp = (p: number[], q: number[], t: number) =>
                p.map((v, k) => v + (q[k]! - v) * t);
              // On its edge, the neighbour's straight edge where that's
              // drawn plain (no crack between them).
              const plain = (ni: number, nj: number) =>
                inside(ni, nj) && !isAskew(ni, nj);
              const pt = (u: number, v: number): number[] => {
                const [tu, tv] = [u / FINE, v / FINE];
                if ((u === 0 || u === FINE) && (v === 0 || v === FINE))
                  return corner(i, j, u ? 1 : 0, v ? 1 : 0);
                if (u === 0 && plain(i - 1, j)) return lerp(c00, c01, tv);
                if (u === FINE && plain(i + 1, j)) return lerp(c10, c11, tv);
                if (v === 0 && plain(i, j - 1)) return lerp(c00, c10, tu);
                if (v === FINE && plain(i, j + 1)) return lerp(c01, c11, tu);
                const x = x0 + (x1 - x0) * tu;
                const z = z0 + (z1 - z0) * tv;
                return [
                  x,
                  vy(
                    Math.min(x1 - EDGE_IN, Math.max(x0 + EDGE_IN, x)),
                    Math.min(z1 - EDGE_IN, Math.max(z0 + EDGE_IN, z)),
                  ),
                  z,
                ];
              };
              for (let v = 0; v < FINE; v++)
                for (let u = 0; u < FINE; u++)
                  quad(pt(u, v), pt(u + 1, v), pt(u, v + 1), pt(u + 1, v + 1));
            }
            // Up or down to the next cell along, where they part.
            if (inside(i + 1, j))
              step(c10, c11, corner(i + 1, j, 0, 0), corner(i + 1, j, 0, 1));
            if (inside(i, j + 1))
              step(c01, c11, corner(i, j + 1, 0, 0), corner(i, j + 1, 1, 0));
          }
        // The walls filled up to it, round its edge (see openTo).
        const walled = (p: Vec2, q: Vec2) => {
          const mx = (p[0] + q[0]) / 2 / m;
          const mz = (p[1] + q[1]) / 2 / m;
          const dl = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
          // A floor above carrying a wall on, from below this ceiling (a
          // split level's half wall over it): its wall to draw, open over
          // a half wall.
          const ux = (q[0] - p[0]) / dl;
          const uz = (q[1] - p[1]) / dl;
          const [cx, cz] = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
          if (
            upperWalls.some((w) => {
              if (w.y > level + 0.5) return false;
              const wl = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
              if (wl < 0.05) return false;
              const vx = (w.b[0] - w.a[0]) / wl;
              const vz = (w.b[1] - w.a[1]) / wl;
              if (Math.abs(ux * vz - uz * vx) > 0.09) return false;
              const s = (cx - w.a[0]) * vx + (cz - w.a[1]) * vz;
              if (s < -0.02 || s > wl + 0.02) return false;
              return Math.abs((cx - w.a[0]) * vz - (cz - w.a[1]) * vx) < 0.35;
            })
          )
            return false;
          return layout.walls.some(
            (w) =>
              !ledgeWalls.has(w) &&
              w.points.some((wa, k) => {
                const wb = w.points[k + 1];
                if (!wb) return false;
                const wl = distance(wa[0], wa[1], wb[0], wb[1]);
                if (wl === 0) return false;
                const along = Math.abs(
                  ((q[0] - p[0]) * (wb[0] - wa[0]) +
                    (q[1] - p[1]) * (wb[1] - wa[1])) /
                    (dl * wl),
                );
                return (
                  along > 0.9 &&
                  pointToSegmentDistance(mx, mz, wa[0], wa[1], wb[0], wb[1]) *
                    m <
                    (w.thickness_cm ?? 15) / 200 + 0.05
                );
              }),
          );
        };
        /** Where along a → b (0 to 1) a wall on its line ends. */
        const wallEnds = (a: Vec2, b: Vec2) => {
          const l2 = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2;
          if (l2 === 0) return [];
          return layout.walls.flatMap((w) =>
            w.points
              .map(([x, y]): Vec2 => [x * m, y * m])
              .filter(
                ([x, z]) =>
                  pointToSegmentDistance(x, z, a[0], a[1], b[0], b[1]) <
                  (w.thickness_cm ?? 15) / 200 + 0.05,
              )
              .map(
                ([x, z]) =>
                  ((x - a[0]) * (b[0] - a[0]) + (z - a[1]) * (b[1] - a[1])) /
                  l2,
              ),
          );
        };
        pts.forEach((a, k) => {
          const b = pts[(k + 1) % pts.length]!;
          const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const n = Math.max(1, Math.ceil(len / 0.25));
          // Its heights a centimetre in from the edge (on a gable end's
          // line the roof's outline may just miss it).
          let [nx, nz] = [
            (a[1] - b[1]) / (len || 1),
            (b[0] - a[0]) / (len || 1),
          ];
          const mid: Vec2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          if (!pointInPolygon(mid[0] + nx * 0.01, mid[1] + nz * 0.01, pts))
            [nx, nz] = [-nx, -nz];
          // A little past it (hidden behind it from the room), so no
          // chink shows where the two meet.
          const yIn = (p: Vec2) => {
            const y = vy(p[0] + nx * 0.01, p[1] + nz * 0.01);
            return y > level + 0.005 ? y + 0.04 : y;
          };
          // Open (no wall) to another room at its level beyond it, or a
          // stairwell: one space, its vault carrying on over (not to a
          // room a step down, which it closes off over).
          const openTo = ([x, z]: Vec2) =>
            stairwell(x - nx * 0.15, z - nz * 0.15) ||
            layout.rooms.some(
              (o) =>
                o !== room &&
                !o.outdoor &&
                o.points.length >= 3 &&
                Math.abs((o.floor_offset_m ?? 0) - (room.floor_offset_m ?? 0)) <
                  0.05 &&
                pointInPolygon(
                  (x - nx * 0.15) / m,
                  (z - nz * 0.15) / m,
                  o.points,
                ),
            );
          // In pieces no longer than 25 cm, split where it crosses the
          // grid (a step in a vault beside it falls on a joint).
          const cross = (vals: number[], k: 0 | 1) =>
            Math.abs(b[k] - a[k]) < 1e-6
              ? []
              : vals.map((v) => (v - a[k]) / (b[k] - a[k]));
          const ts = [
            ...new Set(
              [
                ...Array.from({ length: n + 1 }, (_, s) => s / n),
                ...cross(gx, 0),
                ...cross(gz, 1),
                ...wallEnds(a, b),
              ]
                .filter((t) => t >= 0 && t <= 1)
                .map((t) => Math.round(t * 1e6) / 1e6),
            ),
          ].sort((p, q) => p - q);
          const along = (t: number): Vec2 => [
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
          ];
          for (let s = 0; s + 1 < ts.length; s++) {
            if (ts[s + 1]! - ts[s]! < 1e-5) continue;
            const p0 = along(ts[s]!);
            const p1 = along(ts[s + 1]!);
            // Its heights sampled a hair inside the piece.
            const hair = Math.min(
              0.002 / (len || 1),
              (ts[s + 1]! - ts[s]!) / 4,
            );
            const q0 = along(ts[s]! + hair);
            const q1 = along(ts[s + 1]! - hair);
            // Open to the next room: only the step up to it from that
            // room's vault, where its own is higher (that room's to fill
            // where it's lower).
            const bare = !walled(p0, p1);
            const open =
              bare && openTo([(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2]);
            // No wall, and another room beyond (a step down to it, or under
            // a floor above): nothing to fill; the space runs on.
            if (bare && !open) {
              const bx = (p0[0] + p1[0]) / 2 - nx * 0.15;
              const bz = (p0[1] + p1[1]) / 2 - nz * 0.15;
              if (
                exterior.upperRoom(bx, bz) ||
                layout.rooms.some(
                  (o) =>
                    o !== room &&
                    !o.outdoor &&
                    o.points.length >= 3 &&
                    pointInPolygon(bx / m, bz / m, o.points),
                )
              )
                continue;
            }
            const yOut = (p: Vec2) =>
              open ? vy(p[0] - nx * 0.01, p[1] - nz * 0.01) : level;
            const [b0, b1] = [yOut(q0), yOut(q1)];
            const [y0, y1] = [yIn(q0), yIn(q1)];
            if (open) {
              const in0 = vy(q0[0] + nx * 0.01, q0[1] + nz * 0.01);
              const in1 = vy(q1[0] + nx * 0.01, q1[1] + nz * 0.01);
              if (in0 < b0 + 0.005 && in1 < b1 + 0.005) continue;
            } else if (Math.max(y0, y1) < level + 0.005) continue;
            const [f0, f1] = [Math.min(b0, y0), Math.min(b1, y1)];
            // A hair inside its own room (another's beside it, on the far
            // side of the same wall, doesn't fight it).
            const [ix, iz] = open ? [0, 0] : [nx * 0.01, nz * 0.01];
            const [a0, a1] = [p0[0] + ix, p0[1] + iz];
            const [c0, c1] = [p1[0] + ix, p1[1] + iz];
            pos.push(a0, f0, a1, c0, f1, c1, c0, y1, c1);
            pos.push(a0, f0, a1, c0, y1, c1, a0, y0, a1);
          }
        });
        vaults.push({ id: `${room.id}:vault`, positions: pos });
        continue;
      }
      // Up to a higher ceiling beyond it: a vaulted room of its own beside
      // it, or a lower floor's house open below (a stairwell).
      const face: number[] = [];
      pts.forEach((a, k) => {
        const b = pts[(k + 1) % pts.length]!;
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (len < 0.01) return;
        let [nx, nz] = [(a[1] - b[1]) / len, (b[0] - a[0]) / len];
        const mid: Vec2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        if (!pointInPolygon(mid[0] + nx * 0.01, mid[1] + nz * 0.01, pts))
          [nx, nz] = [-nx, -nz];
        const beyond = (p: Vec2): number | null => {
          const x = p[0] - nx * 0.15;
          const z = p[1] - nz * 0.15;
          const other = layout.rooms.find(
            (o) =>
              o !== room &&
              !o.outdoor &&
              o.points.length >= 3 &&
              pointInPolygon(x / m, z / m, o.points),
          );
          // (Its height at the edge itself, where it meets this face.)
          if (other) {
            const ol = (other.floor_offset_m ?? 0) + H;
            return other.ceiling === "flat" ? ol : vaultY(ol, p[0], p[1]);
          }
          return exterior.lowerHouse(x, z) ? vaultY(level, p[0], p[1]) : null;
        };
        const at = (t: number): Vec2 => [
          a[0] + (b[0] - a[0]) * t,
          a[1] + (b[1] - a[1]) * t,
        ];
        // What lies beyond (a room, open below, or neither): pieces end
        // where it changes, so none spans two (and slopes across).
        const kind = (t: number) => {
          const [x, z] = at(t);
          const bx = x - nx * 0.15;
          const bz = z - nz * 0.15;
          const other = layout.rooms.find(
            (o) =>
              o !== room &&
              !o.outdoor &&
              o.points.length >= 3 &&
              pointInPolygon(bx / m, bz / m, o.points),
          );
          return other ? other.id : exterior.lowerHouse(bx, bz) ? "open" : "";
        };
        const n = Math.max(1, Math.ceil(len / 0.25));
        const ts: number[] = [0];
        for (let s = 1; s <= n; s++) {
          let [lo, hi] = [ts[ts.length - 1]!, s / n];
          if (kind(lo + 1e-4) !== kind(hi - 1e-4)) {
            const k0 = kind(lo + 1e-4);
            for (let it = 0; it < 20; it++) {
              const midT = (lo + hi) / 2;
              if (kind(midT) === k0) lo = midT;
              else hi = midT;
            }
            ts.push((lo + hi) / 2);
          }
          ts.push(s / n);
        }
        // (Each end sampled a centimetre in: at a corner the spot beyond
        // may fall on a neighbour's edge.)
        const hair = 0.01 / len;
        for (let s = 0; s + 1 < ts.length; s++) {
          const [ta, tb] = [ts[s]!, ts[s + 1]!];
          if (tb - ta < 1e-6) continue;
          const p0 = at(ta);
          const p1 = at(tb);
          const span = Math.min(hair, (tb - ta) / 4);
          const [t0, t1] = [beyond(at(ta + span)), beyond(at(tb - span))];
          if (t0 === null || t1 === null) continue;
          if (Math.max(t0, t1) < level + 0.01) continue;
          const [y0, y1] = [
            Math.max(level, t0) + 0.04,
            Math.max(level, t1) + 0.04,
          ];
          // Down over the ceiling's own edge (its 4 cm slab), a hair out
          // past it, so the two read as one face.
          const lo = level - LID_DROP_M - 0.05;
          const [ox, oz] = [-nx * 0.003, -nz * 0.003];
          const [a0, a1] = [p0[0] + ox, p0[1] + oz];
          const [c0, c1] = [p1[0] + ox, p1[1] + oz];
          face.push(a0, lo, a1, c0, lo, c1, c0, y1, c1);
          face.push(a0, lo, a1, c0, y1, c1, a0, y0, a1);
        }
      });
      if (face.length) vaults.push({ id: `${room.id}:step`, positions: face });
      slabs.push({
        id: `${room.id}:ceiling`,
        name: `${room.name} ceiling`,
        y: (room.floor_offset_m ?? 0) + H - LID_DROP_M,
        points: room.points.map(([x, y]): Vec2 => [x * m, y * m]),
        color: dark ? "#8a8580" : "#f4f1ec",
        finish: "plain",
        tinted: true,
        emissive: null,
        emissiveIntensity: 0,
        outdoor: false,
        lid: true,
      });
    }

  // The stairwell's: over this floor's house where no room on any floor
  // is, at this floor's walls' height, down to them along a wall.
  if (exterior.roofShown && houseLoops.length) {
    const lp = houseLoops.flat().map(([x, y]): Vec2 => [x * m, y * m]);
    const [bx0, bx1] = [
      Math.min(...lp.map((p) => p[0])),
      Math.max(...lp.map((p) => p[0])),
    ];
    const [bz0, bz1] = [
      Math.min(...lp.map((p) => p[1])),
      Math.max(...lp.map((p) => p[1])),
    ];
    const roomPts = layout.rooms.flatMap((r) =>
      r.points.map(([x, y]): Vec2 => [x * m, y * m]),
    );
    const gx = axis(
      [
        ...lp.map((p) => p[0]),
        ...roomPts.map((p) => p[0]),
        ...exterior.upperLines.xs,
        ...exterior.roofLines.xs,
      ].filter((x) => x >= bx0 && x <= bx1),
    );
    const gz = axis(
      [
        ...lp.map((p) => p[1]),
        ...roomPts.map((p) => p[1]),
        ...exterior.upperLines.zs,
        ...exterior.roofLines.zs,
      ].filter((z) => z >= bz0 && z <= bz1),
    );
    // (Not a sliver between a room's edge and the walls' outline.)
    const open = gz
      .slice(0, -1)
      .map((z, j) =>
        gx
          .slice(0, -1)
          .map(
            (x, i) =>
              gx[i + 1]! - x > 0.05 &&
              gz[j + 1]! - z > 0.05 &&
              stairwell((x + gx[i + 1]!) / 2, (z + gz[j + 1]!) / 2),
          ),
      );
    const cell = (i: number, j: number) => !!open[j]?.[i];
    const vy = (x: number, z: number) => vaultY(H, x, z);
    const pos: number[] = [];
    for (let j = 0; j + 1 < gz.length; j++)
      for (let i = 0; i + 1 < gx.length; i++) {
        if (!cell(i, j)) continue;
        const P = (ii: number, jj: number) => [
          gx[ii]!,
          vy(gx[ii]!, gz[jj]!),
          gz[jj]!,
        ];
        // (Split along the diagonal nearer its middle's height, as a
        // room's vault is.)
        const mid = vy((gx[i]! + gx[i + 1]!) / 2, (gz[j]! + gz[j + 1]!) / 2);
        if (
          Math.abs((P(i + 1, j)[1]! + P(i, j + 1)[1]!) / 2 - mid) <
          Math.abs((P(i, j)[1]! + P(i + 1, j + 1)[1]!) / 2 - mid) - 0.001
        ) {
          pos.push(...P(i, j), ...P(i + 1, j), ...P(i, j + 1));
          pos.push(...P(i + 1, j), ...P(i + 1, j + 1), ...P(i, j + 1));
        } else {
          pos.push(...P(i, j), ...P(i + 1, j), ...P(i + 1, j + 1));
          pos.push(...P(i, j), ...P(i + 1, j + 1), ...P(i, j + 1));
        }
        // Down to the walls' height where it meets the house's own wall
        // (beyond it, outside: no room, nothing above).
        const edge = (a: [number, number], b: [number, number], o: Vec2) => {
          const [ox, oz] = o;
          if (
            houseLoops.some((loop) => pointInPolygon(ox / m, oz / m, loop)) ||
            exterior.upperRoom(ox, oz)
          )
            return;
          const A = P(...a);
          const B = P(...b);
          if (Math.max(A[1]!, B[1]!) < H + 0.005) return;
          pos.push(A[0]!, H, A[2]!, B[0]!, H, B[2]!, ...B);
          pos.push(A[0]!, H, A[2]!, ...B, ...A);
        };
        const cx = (gx[i]! + gx[i + 1]!) / 2;
        const cz = (gz[j]! + gz[j + 1]!) / 2;
        if (!cell(i - 1, j)) edge([i, j], [i, j + 1], [gx[i]! - 0.15, cz]);
        if (!cell(i + 1, j))
          edge([i + 1, j], [i + 1, j + 1], [gx[i + 1]! + 0.15, cz]);
        if (!cell(i, j - 1)) edge([i, j], [i + 1, j], [cx, gz[j]! - 0.15]);
        if (!cell(i, j + 1))
          edge([i, j + 1], [i + 1, j + 1], [cx, gz[j + 1]! + 0.15]);
      }
    if (pos.length) vaults.push({ id: "stairwell:vault", positions: pos });
  }

  // Furniture.
  const states = computeItemStates(layout.furniture, hass);
  const items: Item3d[] = [];
  for (const item of layout.furniture) {
    // An open free-form line is a mark on the plan, not a thing in the
    // room: left out.
    if (
      item.points &&
      item.points.length >= 2 &&
      item.closed === false &&
      !item.kind.startsWith("site_")
    )
      continue;
    const entry = catalogItem(item.kind);
    const flip = !!item.mirrored !== !!entry?.flip;
    const prims = itemPrims(item, entry);
    const auto = itemHeight(item.kind, entry, H);
    // A planting grows with its spread: resized, it keeps its shape.
    if (entry?.category === "landscape")
      auto.height *=
        (item.width_cm + item.depth_cm) / Math.max(1, entry.w + entry.d);
    // A height or elevation set by hand wins (a retaining wall's
    // elevation is its foot below the ground: see siteSpec).
    const placed = {
      height: item.height_cm ? item.height_cm / 100 : auto.height,
      y0:
        item.elevation_cm != null &&
        !isRetainingWall(entry) &&
        !isExtrudable(entry)
          ? item.elevation_cm / 100
          : auto.y0,
    };
    // A custom countertop made thicker grows down: its top stays at
    // counter height.
    if (entry?.id === CUSTOM_COUNTER_KIND && item.elevation_cm == null)
      placed.y0 = auto.y0 + auto.height - placed.height;
    // Out in the yard (in none of the floor's rooms), on the ground;
    // else in a room set higher or lower, with it.
    const grounded =
      !!entry &&
      GROUNDED_CATEGORIES.has(entry.category) &&
      !layout.rooms.some(
        (r) => r.points.length >= 3 && pointInPolygon(item.x, item.y, r.points),
      );
    const height = placed.height;
    let y0 =
      placed.y0 +
      (grounded
        ? item.elevation_cm == null && VEHICLE.test(item.kind)
          ? PAVING_M
          : 0
        : offsetAt(item.x, item.y));
    // Hung from the ceiling under a floor that starts below its walls'
    // top (a basement's lights under the main floor): from that floor's
    // underside instead, not up through it.
    if (item.elevation_cm == null && ceilingMounted(item.kind)) {
      const above = floorAbove(item.x * m, item.y * m);
      if (above !== null && y0 + height > above - FLOOR_SLAB_M)
        y0 = Math.max(0, above - FLOOR_SLAB_M - height);
    }
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
    const beam = entry?.opts["beam"];
    // An outdoor fixture may be switched by a plain switch.
    const isLight =
      item.entity_id?.startsWith("light.") === true ||
      (typeof beam === "string" &&
        item.entity_id?.startsWith("switch.") === true);
    const on = !!live && live.active && isLight && showLights;
    const lightY = entry?.opts["lightY"];
    const sourceY =
      typeof lightY === "number"
        ? lightY * (height / Math.max(0.01, auto.height))
        : height / 2;
    // A spotlight on the ground aims up the wall it faces, so its beam
    // lands on it wherever it's set (`aim_m` up it, else about
    // SPOT_RISE_M); its catalog tilt else. A flood on a wall tilts down to
    // reach `aim_m` out across the ground.
    const aim = item.aim_m ?? null;
    const spotWall =
      beam === "spot" && grounded
        ? spotAim(
            layout.walls,
            m,
            item.x * m,
            item.y * m,
            (-item.rotation_deg * Math.PI) / 180,
            aim ?? SPOT_RISE_M,
          )
        : null;
    const aimTilt =
      beam === "spot" && grounded
        ? (spotWall?.tilt ??
          (aim !== null ? (Math.atan2(1.5, aim) * 180) / Math.PI : null))
        : beam === "flood" && aim !== null
          ? (Math.atan2(Math.max(0.3, y0 + sourceY), aim) * 180) / Math.PI
          : null;
    const tilt =
      aimTilt ?? Number(entry?.opts["tilt"] ?? (beam === "flood" ? 35 : 30));
    const spread =
      item.beam_deg ??
      Number(
        entry?.opts["spread"] ??
          (beam === "flood"
            ? 100
            : beam === "down"
              ? 110
              : beam === "updown"
                ? 40
                : 30),
      );
    // A two-light sconce: its down light is a second entity.
    const twin = !!entry?.opts["twin"];
    const live2 =
      twin && item.entity_id_2 && hass
        ? itemState(hass, item.entity_id_2)
        : null;
    const on2 =
      !!live2 &&
      live2.active &&
      showLights &&
      /^(light|switch)\./.test(item.entity_id_2 ?? "");
    // Wearing an uploaded model: a block, the model in its place.
    const shape = item.model_id ? "block" : itemShape(item.kind, entry);
    const si = stairs.findIndex((st) => st.item === item);
    const flight = si >= 0 ? stairs[si]! : null;
    items.push({
      id: item.id,
      ...(layout.rooms.some(
        (r) =>
          !r.outdoor &&
          r.points.length >= 3 &&
          pointInPolygon(item.x, item.y, r.points),
      )
        ? { indoor: true }
        : {}),
      ...(item.model_id ? { glb: item.model_id } : {}),
      ...(item.model_id && (item.lift_cm || item.tire_cm)
        ? {
            glbFit: {
              lift: (item.lift_cm ?? 0) / 100,
              tire: (item.tire_cm ?? 0) / 100,
            },
          }
        : {}),
      name: item.label || entry?.name || item.kind,
      footprint: itemFootprint(item, entry, prims, flip),
      width: item.width_cm / 100,
      depth: item.depth_cm / 100,
      x: item.x * m,
      z: item.y * m,
      angle: (-item.rotation_deg * Math.PI) / 180,
      y0: flight ? Math.min(flight.front, flight.back) : y0,
      height: flight ? Math.abs(flight.front - flight.back) : height,
      ...(entry &&
      !flight &&
      shape === "block" &&
      (!(item.points && item.points.length >= 2) ||
        entry.id === CUSTOM_COUNTER_KIND) &&
      !isShapeKind(entry.id)
        ? {
            model: {
              kind: entry.id,
              draw: entry.draw,
              opts: entry.opts,
              flip,
              tint: own,
              ...(entry.id === CUSTOM_COUNTER_KIND
                ? { outline: drawnOutline(item) }
                : {}),
              ...(item.pot_cm != null ||
              item.pot_shape != null ||
              item.pot_h_cm != null ||
              item.pot_color != null ||
              item.fullness != null ||
              item.leaf_spread_deg != null ||
              item.lean_deg != null ||
              item.foliage_spread != null
                ? {
                    plant: {
                      pot: item.pot_cm != null ? item.pot_cm / 100 : null,
                      shape: item.pot_shape ?? null,
                      full: item.fullness ?? null,
                      potH: item.pot_h_cm != null ? item.pot_h_cm / 100 : null,
                      potColor: item.pot_color ?? null,
                      spread:
                        item.leaf_spread_deg != null
                          ? (item.leaf_spread_deg * Math.PI) / 180
                          : null,
                      lean:
                        item.lean_deg != null
                          ? (item.lean_deg * Math.PI) / 180
                          : null,
                      wide: item.foliage_spread ?? null,
                    },
                  }
                : {}),
              ...(item.drawers_cm != null || item.doors != null
                ? {
                    fronts: {
                      drawers: item.drawers_cm?.map((c) => c / 100) ?? null,
                      doors: item.doors ?? null,
                    },
                  }
                : {}),
              ...(item.handle_side ? { handleSide: item.handle_side } : {}),
              ...(item.handle_style === "edge"
                ? {
                    edgePull: {
                      len: item.handle_cm != null ? item.handle_cm / 100 : null,
                    },
                  }
                : {}),
              ...(item.front_style === "slab" ? { slab: true } : {}),
              ...(item.door_tiers ? { doorTiers: item.door_tiers } : {}),
              ...(item.no_lid ? { noLid: true } : {}),
              ...(entry.id.startsWith("shower_glass_door")
                ? {
                    door: {
                      open: ((item.door_open_deg ?? 0) * Math.PI) / 180,
                      hingeRight: !!item.door_hinge_flip,
                      swingBack: !!item.door_swing_flip,
                    },
                  }
                : {}),
              ...(item.countertop === false ? { noTop: true } : {}),
              ...(item.finish ? { finish: item.finish } : {}),
              ...(item.slat_cm != null || item.slat_gap_cm != null
                ? {
                    slats: {
                      width: item.slat_cm != null ? item.slat_cm / 100 : null,
                      gap:
                        item.slat_gap_cm != null
                          ? item.slat_gap_cm / 100
                          : null,
                    },
                  }
                : {}),
              ...(item.shelves_cm != null ||
              item.columns != null ||
              item.books != null ||
              item.strip_edges != null ||
              item.book_align != null
                ? {
                    cubbies: {
                      rows: item.shelves_cm?.map((c) => c / 100) ?? null,
                      cols: item.columns ?? null,
                      books: item.books ?? null,
                      edges: item.strip_edges ?? null,
                      align: item.book_align ?? null,
                    },
                  }
                : {}),
            },
          }
        : {}),
      ...(entry?.id.startsWith("site_") &&
      item.points &&
      item.points.length >= 2
        ? { site: siteSpec(item, entry, flip, own) }
        : item.points &&
            item.points.length >= 3 &&
            item.closed !== false &&
            height >= 0.7 &&
            height <= 1.2
          ? { counter: true, tint: own }
          : {}),
      ...(flight
        ? {
            stairs: {
              front: flight.front,
              back: flight.back,
              rails: [railed(si, 0), railed(si, 1)] as [boolean, boolean],
              landing: flight.landing,
              outdoor: flight.outdoor,
              sideTops: [sideTop(si, 0), sideTop(si, 1)] as [
                [number, number][] | null,
                [number, number][] | null,
              ],
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
        ? typeof beam === "string"
          ? {
              color: live.color ?? "#ffe2b0",
              level: Math.max(0.15, live.glow),
              y: y0 + sourceY,
              beam: (twin ? "up" : beam) as LightBeam,
              tilt,
              spread,
              ...(spotWall?.forward ? { forward: spotWall.forward } : {}),
            }
          : {
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
      ...(on2 && live2
        ? {
            light2: {
              color: live2.color ?? "#ffe2b0",
              level: Math.max(0.15, live2.glow),
              y: y0 + sourceY,
              beam: "down" as LightBeam,
              tilt,
              spread,
            },
          }
        : {}),
      ...(grounded ? { grounded: true } : {}),
      ...(aimTilt !== null ? { tilt: aimTilt } : {}),
      shape,
    });
  }

  // An undermount sink's opening cut in the stone top it sits under (a
  // shaker cabinet's, a kitchen island's), so its bowl shows through.
  for (const sink of items) {
    const rim = sink.model?.opts["undermount"];
    if (typeof rim !== "number") continue;
    const top = sink.y0 + sink.height;
    const reach = Math.hypot(sink.width, sink.depth) / 2;
    for (const c of items) {
      if (
        c === sink ||
        !c.model ||
        !/^shaker_(base|drawer|sink)|^island_shaker/.test(c.model.kind) ||
        Math.abs(c.y0 + c.height - top) > 0.08
      )
        continue;
      // The sink's centre and turn in the cabinet's frame.
      const dx = sink.x - c.x;
      const dz = sink.z - c.z;
      const cos = Math.cos(c.angle);
      const sin = Math.sin(c.angle);
      let x = dx * cos - dz * sin;
      const z = dx * sin + dz * cos;
      let a = sink.angle - c.angle;
      if (c.model.flip) {
        x = -x;
        a = -a;
      }
      if (
        Math.abs(x) > c.width / 2 + reach ||
        Math.abs(z) > c.depth / 2 + reach
      )
        continue;
      (c.model.cuts ??= []).push({
        x,
        z,
        w: sink.width - (2 * rim) / 100,
        d: sink.depth - (2 * rim) / 100,
        a,
        r: 0.012,
      });
    }
  }

  // An outside wall standing beside a lower floor's room whose ceiling
  // reaches above this floor (a storey over a garage a few steps down,
  // next to an office on the floor below): along that room, up to its
  // ceiling, it's the room's wall, painted, and only above it sided.
  for (let k = walls.length - 1; k >= 0; k--) {
    const b = walls[k]!;
    if (!b.outside || b.color || b.stone) continue;
    const sn = Math.sin(b.angle);
    const cs = Math.cos(b.angle);
    const reach = b.depth / 2 + 0.15;
    const n = Math.max(1, Math.min(200, Math.ceil(b.length / 0.1)));
    const step = b.length / n;
    // The lower room's ceiling beside each stretch (null: none above
    // this wall's foot).
    const raw = Array.from({ length: n }, (_, i) => {
      const f = -b.length / 2 + step * (i + 0.5);
      const px = b.x + cs * f + sn * b.outside! * reach;
      const pz = b.z - sn * f + cs * b.outside! * reach;
      let c = exterior.lowerCeiling(px, pz);
      // No higher than the roof over it (a garage standing out in front,
      // under its own lower roof: the wall above that roof is outdoors).
      const roof = exterior.roofOver(px, pz);
      if (c !== null && roof !== null) c = Math.min(c, roof - ROOF_HEEL_M);
      return c !== null && c > b.y0 + 0.05 ? Math.min(c, b.y1) : null;
    });
    // Under a sloping (vaulted) ceiling, each stretch painted up to the
    // higher of its neighbours', so no sided notch shows below the slope.
    const ceils = raw.map((c, i) =>
      c === null
        ? null
        : Math.max(
            c,
            ...[raw[i - 1], raw[i + 1]].filter((v): v is number => v != null),
          ),
    );
    if (ceils.every((c) => c === null)) continue;
    const { outside: _side, ...inner } = b;
    const slice = (i0: number, i1: number, part: Box3d): Box3d => {
      const mid = -b.length / 2 + step * ((i0 + i1) / 2);
      return {
        ...part,
        x: b.x + cs * mid,
        z: b.z - sn * mid,
        length: step * (i1 - i0),
      };
    };
    const parts: Box3d[] = [];
    let i0 = 0;
    for (let i = 1; i <= n; i++) {
      if (
        i < n &&
        (ceils[i] === null) === (ceils[i0] === null) &&
        Math.abs((ceils[i] ?? 0) - (ceils[i0] ?? 0)) < 0.005
      )
        continue;
      const run = ceils.slice(i0, i).filter((c): c is number => c !== null);
      if (!run.length) parts.push(slice(i0, i, b));
      else {
        const top = Math.min(...run);
        parts.push(slice(i0, i, { ...inner, y1: top }));
        if (b.y1 > top + 0.005) parts.push(slice(i0, i, { ...b, y0: top }));
      }
      i0 = i;
    }
    walls.splice(k, 1, ...parts);
  }

  // Baseboards round each room, along its walls: stained like the doors
  // (or as set), as tall and as proud as their casing unless set; not
  // across a doorway (its casing).
  const baseWalls = layout.walls.flatMap((w) => {
    const t = wallThicknessCm(w) / 100;
    if (t <= RAIL_THICKNESS_M) return [];
    return w.points.slice(1).map((q, k) => {
      const p = w.points[k]!;
      return {
        a: [p[0] * m, p[1] * m] as Vec2,
        b: [q[0] * m, q[1] * m] as Vec2,
        t,
      };
    });
  });
  for (const room of layout.rooms) {
    if (room.outdoor || room.points.length < 3 || room.baseboard === "none")
      continue;
    const bh = (room.baseboard_cm ?? 8) / 100;
    const bt = (room.baseboard_thick_cm ?? 1.5) / 100;
    const color =
      room.baseboard === "white"
        ? dark
          ? TRIM_WHITE_DARK
          : TRIM_WHITE
        : room.baseboard === "paint"
          ? (room.baseboard_color ?? TRIM_WHITE)
          : dark
            ? DOOR_INSIDE_DARK
            : DOOR_INSIDE;
    const level = room.floor_offset_m ?? 0;
    const pts = room.points.map(([x, y]): Vec2 => [x * m, y * m]);
    pts.forEach((a, k) => {
      const b = pts[(k + 1) % pts.length]!;
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 0.05) return;
      const u: Vec2 = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
      let n: Vec2 = [-u[1], u[0]];
      const mid: Vec2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (
        !pointInPolygon(
          (mid[0] + n[0] * 0.05) / m,
          (mid[1] + n[1] * 0.05) / m,
          room.points,
        )
      )
        n = [-n[0], -n[1]];
      // The wall along it at a spot (its thickness), else none.
      const wallAt = (p: Vec2): (typeof baseWalls)[number] | null => {
        for (const w of baseWalls) {
          const wl = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]);
          if (wl < 0.01) continue;
          const vx = (w.b[0] - w.a[0]) / wl;
          const vz = (w.b[1] - w.a[1]) / wl;
          if (Math.abs(u[0] * vz - u[1] * vx) > 0.09) continue;
          const along = (p[0] - w.a[0]) * vx + (p[1] - w.a[1]) * vz;
          const off = Math.abs((p[0] - w.a[0]) * vz - (p[1] - w.a[1]) * vx);
          if (along > -0.005 && along < wl + 0.005 && off < w.t / 2 + 0.05)
            return w;
        }
        return null;
      };
      // A doorway (its casing) or a window down to it, on this wall.
      const openAt = (p: Vec2, t: number) =>
        openingFaces.some((f) => {
          if (f.y0 > level + bh) return false;
          const fl = Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]);
          if (fl < 0.01) return false;
          const vx = (f.b[0] - f.a[0]) / fl;
          const vz = (f.b[1] - f.a[1]) / fl;
          if (Math.abs(u[0] * vz - u[1] * vx) > 0.09) return false;
          const s = (p[0] - f.a[0]) * vx + (p[1] - f.a[1]) * vz;
          const off = Math.abs((p[0] - f.a[0]) * vz - (p[1] - f.a[1]) * vx);
          return s > 0 && s < fl && off < t / 2 + 0.05;
        });
      const step = 0.02;
      const count = Math.max(1, Math.round(len / step));
      const board = (s0: number, s1: number, off: number) => {
        if (s1 - s0 < 0.01) return;
        walls.push({
          x: a[0] + u[0] * ((s0 + s1) / 2) + n[0] * off,
          z: a[1] + u[1] * ((s0 + s1) / 2) + n[1] * off,
          y0: level,
          y1: level + bh,
          length: s1 - s0,
          depth: bt,
          angle: Math.atan2(-u[1], u[0]),
          color,
        });
      };
      // Each sample: a wall there (and which), or not, and whether the
      // board stops (a doorway).
      const samples = Array.from({ length: count + 1 }, (_, i) => {
        const s = (len * i) / count;
        const p: Vec2 = [a[0] + u[0] * s, a[1] + u[1] * s];
        const w = wallAt(p);
        const ok = w !== null && !openAt(p, w.t);
        return { s, w, ok };
      });
      // Where a wall's end falls along this edge.
      const endOf = (w: (typeof baseWalls)[number], hi: boolean) => {
        const sa = (w.a[0] - a[0]) * u[0] + (w.a[1] - a[1]) * u[1];
        const sb = (w.b[0] - a[0]) * u[0] + (w.b[1] - a[1]) * u[1];
        return hi ? Math.max(sa, sb) : Math.min(sa, sb);
      };
      const ret = (sEnd: number, t: number) =>
        // Across the wall's end face, wrapping both sides' boards.
        walls.push({
          x: a[0] + u[0] * sEnd,
          z: a[1] + u[1] * sEnd,
          y0: level,
          y1: level + bh,
          length: t + 2 * bt,
          depth: bt,
          angle: Math.atan2(-n[1], n[0]),
          color,
        });
      /** A run's end where its wall stops (`hi`: its far end): the wall's
       * end, carried round an outside corner (another wall turning away
       * from the room there) to meet that wall's board, else with a return
       * across the end (a free end); where it doesn't end near, as it is. */
      const wallEnd = (
        w: (typeof baseWalls)[number],
        hi: boolean,
        sRun: number,
        t: number,
      ): number => {
        const sEnd = endOf(w, hi);
        if (Math.abs(sEnd - sRun) > 0.08) return sRun + (hi ? 1 : -1) * 0.01;
        const sa = (w.a[0] - a[0]) * u[0] + (w.a[1] - a[1]) * u[1];
        const E = Math.abs(sa - sEnd) < 1e-6 ? w.a : w.b;
        let away = 0;
        let into = false;
        for (const o of baseWalls) {
          if (o === w) continue;
          const ol = Math.hypot(o.b[0] - o.a[0], o.b[1] - o.a[1]);
          if (ol < 0.01) continue;
          const vx = (o.b[0] - o.a[0]) / ol;
          const vz = (o.b[1] - o.a[1]) / ol;
          if (Math.abs(u[0] * vz - u[1] * vx) < 0.5) continue;
          if (
            pointToSegmentDistance(E[0], E[1], o.a[0], o.a[1], o.b[0], o.b[1]) >
            o.t / 2 + t / 2 + 0.02
          )
            continue;
          // Which way it runs from here: its far end.
          const da = Math.hypot(o.a[0] - E[0], o.a[1] - E[1]);
          const db = Math.hypot(o.b[0] - E[0], o.b[1] - E[1]);
          const far = da > db ? o.a : o.b;
          const fl = Math.max(da, db) || 1;
          const dot = ((far[0] - E[0]) * n[0] + (far[1] - E[1]) * n[1]) / fl;
          if (dot > 0.3) into = true;
          else if (dot < -0.3) away = Math.max(away, o.t);
        }
        const out = hi ? 1 : -1;
        if (into) return sEnd;
        if (away > 0) return sEnd + out * (away / 2 + bt);
        ret(sEnd + out * (bt / 2), t);
        return sEnd + out * bt;
      };
      let i0: number | null = null;
      for (let i = 0; i <= count + 1; i++) {
        const sm = samples[i];
        if (sm?.ok) {
          if (i0 === null) i0 = i;
          continue;
        }
        if (i0 === null) continue;
        const first = samples[i0]!;
        const last = samples[i - 1]!;
        const t = Math.max(first.w!.t, last.w!.t);
        let s0 = first.s;
        let s1 = last.s;
        // Each end: where its wall ends (at the room's corner, or short of
        // it), round the corner if another wall turns away from the room
        // there, to the wall turning into it, else a return across the
        // wall's end; cut short at a doorway or what's in front.
        const at0 = i0 === 0 || samples[i0 - 1]!.w === null;
        const at1 = i === count + 1 || sm!.w === null;
        s0 = at0 ? wallEnd(first.w!, false, s0, t) : s0 - step / 2;
        s1 = at1 ? wallEnd(last.w!, true, s1, t) : s1 + step / 2;
        board(s0, s1, t / 2 + bt / 2 - 0.001);
        i0 = null;
      }
    });
  }

  const floor: Floor3d = {
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
    ...(vaults.length ? { vaults } : {}),
    items,
    wallFaces,
    metersPerUnit: m,
  };
  OPENING_FACES.set(floor, openingFaces);
  return floor;
}

/** Each built floor's windows' and doors' faces (see buildFloor), for
 * backsplashes on any floor to stop round. */
const OPENING_FACES = new WeakMap<Floor3d, OpeningFace[]>();

/** A window's or door's face on its wall, its casing included: its ends
 * along the wall's line, its bottom and top (above its floor's level), the
 * wall's thickness. */
interface OpeningFace {
  a: Vec2;
  b: Vec2;
  y0: number;
  y1: number;
  t: number;
}

/** A backsplash (or a slat wall) stops round a window (or door) in the
 * wall behind it, a
 * gap set on it short of its casing: the openings of every floor (one
 * hung down from the floor above still meets the kitchen's window), their
 * heights above this floor's level. */
function stopRoundOpenings(
  items: Item3d[],
  furniture: FurnitureItem[],
  openingFaces: OpeningFace[],
): void {
  for (const sp of items) {
    if (!sp.model || !/^(backsplash_|slat_wall)/.test(sp.model.kind)) continue;
    const pad =
      Math.max(0, furniture.find((f) => f.id === sp.id)?.opening_gap_cm ?? 0) /
      100;
    const cos = Math.cos(sp.angle);
    const sin = Math.sin(sp.angle);
    // Its own across (x) and out (z) directions, and its back's middle.
    const ux = cos;
    const uz = -sin;
    const bx = sp.x - sin * (sp.depth / 2);
    const bz = sp.z - cos * (sp.depth / 2);
    for (const f of openingFaces) {
      const lx = f.b[0] - f.a[0];
      const lz = f.b[1] - f.a[1];
      const len = Math.hypot(lx, lz);
      if (len < 1e-6) continue;
      // Along the same wall: parallel to it, its back on the wall's face.
      if (Math.abs((ux * lz - uz * lx) / len) > 0.1) continue;
      const off = Math.abs(((bx - f.a[0]) * lz - (bz - f.a[1]) * lx) / len);
      if (off > f.t / 2 + sp.depth + 0.15) continue;
      const along = (p: Vec2) => (p[0] - sp.x) * ux + (p[1] - sp.z) * uz;
      let x0 = Math.min(along(f.a), along(f.b)) - pad;
      let x1 = Math.max(along(f.a), along(f.b)) + pad;
      if (sp.model.flip) [x0, x1] = [-x1, -x0];
      const y0 = f.y0 - sp.y0 - pad;
      const y1 = f.y1 - sp.y0 + pad;
      if (x1 <= -sp.width / 2 || x0 >= sp.width / 2) continue;
      if (y1 <= 0 || y0 >= sp.height) continue;
      (sp.model.gaps ??= []).push({ x0, x1, y0, y1 });
    }
  }
}

/** A surface (a bed, a lawn, a drive) that can be built up as a block:
 * its elevation is then its top's height above the ground's own level. */
export function isExtrudable(entry: CatalogItem | undefined): boolean {
  const site = entry?.opts["site"];
  return typeof site === "string" && site !== "dig" && site !== "raise";
}

/** How deep a dug-out area goes, metres (its height; 50 cm unset). */
export function digDepth(item: FurnitureItem, entry: CatalogItem): number {
  return (item.height_cm ?? Number(entry.opts["height"] ?? 50)) / 100;
}

/** A retaining wall: its elevation (negative) is how deep its foot goes. */
export function isRetainingWall(entry: CatalogItem | undefined): boolean {
  return entry?.opts["fence"] === "retaining";
}

/** How far a retaining wall goes below the ground, metres (its elevation,
 * negated; 30 cm unset). */
export function retainingDepth(item: FurnitureItem): number {
  return item.elevation_cm != null && item.elevation_cm < 0
    ? -item.elevation_cm / 100
    : 0.3;
}

/** A drawn item's closed outline with its corners rounded (as its plan
 * drawing), centred in its own frame, metres; its box when not drawn. */
function drawnOutline(item: FurnitureItem): [number, number][] {
  const w = item.width_cm;
  const d = item.depth_cm;
  if (!item.points || item.points.length < 3)
    return [
      [-w / 200, -d / 200],
      [w / 200, -d / 200],
      [w / 200, d / 200],
      [-w / 200, d / 200],
    ];
  const raw = item.points.map(([fx, fy]): [number, number] => [fx * w, fy * d]);
  const radii = cornerRadii(
    item.corners?.length ? { corners: item.corners.join(",") } : {},
    w,
    d,
    raw.length,
    6,
  );
  return roundedPolyPoints(raw, true, radii, 8).map(
    ([x, y]): [number, number] => [x / 100 - w / 200, y / 100 - d / 200],
  );
}

/** A site item's outline in its own frame (metres, corners rounded as
 * the plan draws them) and what it is. */
function siteSpec(
  item: FurnitureItem,
  entry: CatalogItem,
  flip: boolean,
  own: string | null,
): NonNullable<Item3d["site"]> {
  const w = item.width_cm;
  const d = item.depth_cm;
  const surface =
    typeof entry.opts["site"] === "string" ? entry.opts["site"] : undefined;
  const fence =
    typeof entry.opts["fence"] === "string" ? entry.opts["fence"] : undefined;
  const closed = !!surface || item.closed !== false;
  const raw = (item.points ?? []).map(([fx, fy]): [number, number] => [
    fx * w,
    fy * d,
  ]);
  const radii = cornerRadii(
    item.corners?.length ? { corners: item.corners.join(",") } : {},
    w,
    d,
    raw.length,
    6,
  );
  const pts = roundedPolyPoints(raw, closed, radii, 8).map(([x, y]): Vec2 => [
    (flip ? w - x : x) / 100 - w / 200,
    y / 100 - d / 200,
  ]);
  const own_ =
    own && own.toLowerCase() !== String(entry.opts["color"] ?? "").toLowerCase()
      ? own
      : null;
  return {
    ...(surface ? { surface } : {}),
    ...(fence ? { fence } : {}),
    points: pts,
    closed,
    height: item.height_cm
      ? item.height_cm / 100
      : Number(entry.opts["height"] ?? 100) / 100,
    thick: entry.d / 100,
    ...(isRetainingWall(entry) ? { depth: retainingDepth(item) } : {}),
    ...(surface === "dig" || surface === "raise"
      ? { dig: digDepth(item, entry) }
      : {}),
    ...(isExtrudable(entry) && item.elevation_cm != null
      ? { extrude: item.elevation_cm / 100 }
      : {}),
    tint: own_,
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
  // The sections' footprints; a dormer is one less than half the size of
  // a section it overlaps.
  const footprints = sections.map((s, i) => {
    const p = input.roofPlan!.parts[i]!;
    const rect: [number, number, number, number] = [
      Math.min(p.x0, p.x1) * planM,
      Math.min(p.y0, p.y1) * planM,
      Math.max(p.x0, p.x1) * planM,
      Math.max(p.y0, p.y1) * planM,
    ];
    return { s, rect, area: (rect[2] - rect[0]) * (rect[3] - rect[1]) };
  });
  const isDormer = footprints.map((f) =>
    footprints.some(
      (g) =>
        g !== f &&
        g.area > 2 * f.area &&
        f.rect[0] < g.rect[2] &&
        f.rect[2] > g.rect[0] &&
        f.rect[1] < g.rect[3] &&
        f.rect[3] > g.rect[1],
    ),
  );
  // Its eaves' overhang and fascia under it too.
  const reach = ROOF_OVERHANG_M + 0.05;
  const dormers = footprints
    .filter((_, i) => isDormer[i])
    .map((f): [number, number, number, number] => [
      f.rect[0] - reach,
      f.rect[1] - reach,
      f.rect[2] + reach,
      f.rect[3] + reach,
    ]);
  const roofLines = { xs: [] as number[], zs: [] as number[] };
  for (const f of footprints)
    for (const d of [0, -ROOF_OVERHANG_M, ROOF_OVERHANG_M]) {
      roofLines.xs.push(f.rect[0] + d, f.rect[2] + d);
      roofLines.zs.push(f.rect[1] + d, f.rect[3] + d);
    }
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
        lowerHouse: (x, z) =>
          (input.context ?? input.floors).some((g) => {
            if (g.baseY >= f.baseY - 0.3) return false;
            const gm = metersPerUnit(g.layout.scale);
            return houseLoopsOf(g.layout).some((loop) =>
              pointInPolygon(x / gm, z / gm, loop),
            );
          }),
        upperHouse: (x, z) =>
          (input.context ?? input.floors).some((g) => {
            if (g.baseY <= f.baseY + 0.5) return false;
            const gm = metersPerUnit(g.layout.scale);
            return houseLoopsOf(g.layout).some((loop) =>
              pointInPolygon(x / gm, z / gm, loop),
            );
          }),
        upperRoom: (x, z) =>
          (input.context ?? input.floors).some((g) => {
            if (g.baseY <= f.baseY + 0.5) return false;
            const gm = metersPerUnit(g.layout.scale);
            return g.layout.rooms.some(
              (r) =>
                !r.outdoor &&
                r.points.length >= 3 &&
                pointInPolygon(x / gm, z / gm, r.points),
            );
          }),
        upperLines: (() => {
          const out = { xs: [] as number[], zs: [] as number[] };
          for (const g of input.context ?? input.floors) {
            if (g.baseY <= f.baseY + 0.5) continue;
            const gm = metersPerUnit(g.layout.scale);
            for (const r of g.layout.rooms)
              for (const [x, y] of r.points) {
                out.xs.push(x * gm);
                out.zs.push(y * gm);
              }
          }
          return out;
        })(),
        lowerCeiling: (x, z) => {
          let best: number | null = null;
          for (const g of input.context ?? input.floors) {
            if (g.baseY >= f.baseY - 0.3) continue;
            const gm = metersPerUnit(g.layout.scale);
            const room = g.layout.rooms.find(
              (r) =>
                !r.outdoor &&
                r.points.length >= 3 &&
                pointInPolygon(x / gm, z / gm, r.points),
            );
            if (!room) continue;
            let c = g.baseY + g.wallHeight;
            // Vaulted up under the roof there (no storey over it, its
            // ceiling not set flat): as high as that.
            const open =
              room.ceiling !== "flat" &&
              !(input.context ?? input.floors).some((u) => {
                if (u.baseY <= g.baseY + 0.5) return false;
                const um = metersPerUnit(u.layout.scale);
                return houseLoopsOf(u.layout).some((loop) =>
                  pointInPolygon(x / um, z / um, loop),
                );
              });
            if (open && input.roof)
              c = vaultUnder(c, vaultRoofAt(sections, isDormer, x, z));
            c -= f.baseY;
            if (best === null || c > best) best = c;
          }
          return best;
        },
        roofShown: !!input.roof,
        dormers,
        roofLines,
        vaultAt: (x, z) => {
          const h = vaultRoofAt(sections, isDormer, x, z);
          return h === null ? null : h - f.baseY;
        },
        roofBelow: (x, z, y) => {
          let best: number | null = null;
          for (const s of sections) {
            const h = sectionHeightAt(s, x, z);
            if (h === null) continue;
            const r = h - f.baseY;
            if (r < y && (best === null || r > best)) best = r;
          }
          return best;
        },
      },
    ),
  );
  // Backsplashes round the windows and doors of every floor built.
  floors.forEach((f, i) => {
    const faces = floors.flatMap((g) =>
      (OPENING_FACES.get(g) ?? []).map((o) => ({
        ...o,
        y0: o.y0 + g.baseY - f.baseY,
        y1: o.y1 + g.baseY - f.baseY,
      })),
    );
    stopRoundOpenings(f.items, input.floors[i]!.layout.furniture, faces);
  });
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
  const shownRoof = input.roof ? cachedRoof(input, northDeg, floors) : null;
  for (const e of shownRoof?.edges ?? []) e.facing = edgeFacing(e, northDeg);
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
    roof: shownRoof,
    roofLights: roofLights(input, shownRoof),
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
  const edges: RoofEdge3d[] = [];
  // The building's rooms, each with the heights it spans.
  const indoor = floorsAll.flatMap((f) => {
    const fm = metersPerUnit(f.layout.scale);
    return f.layout.rooms
      .filter((r) => !r.outdoor && r.points.length >= 3)
      .map((r) => {
        const y0 = f.baseY + (r.floor_offset_m ?? 0);
        return {
          y0,
          ceiling: y0 + f.wallHeight,
          y1: y0 + f.wallHeight + 0.6,
          flat: r.ceiling === "flat",
          poly: r.points.map(([x, y]): Vec2 => [x * fm, y * fm]),
        };
      });
  });
  // Each part's footprint (no overhang), x0, z0, x1, z1 in metres.
  const rects = plan.parts.map((p): [number, number, number, number] => [
    Math.min(p.x0, p.x1) * m,
    Math.min(p.y0, p.y1) * m,
    Math.max(p.x0, p.x1) * m,
    Math.max(p.y0, p.y1) * m,
  ]);
  // A dormer: a part less than half the size of one it overlaps (as
  // buildScene's).
  const area = (r: [number, number, number, number]) =>
    (r[2] - r[0]) * (r[3] - r[1]);
  const overlaps = (
    r: [number, number, number, number],
    q: [number, number, number, number],
  ) => r[0] < q[2] && r[2] > q[0] && r[1] < q[3] && r[3] > q[1];
  const isDormer = rects.map((r, i) =>
    rects.some((q, j) => j !== i && area(q) > 2 * area(r) && overlaps(r, q)),
  );
  // How high each room's part of the house goes: up to the floor of a
  // room stacked over it (the floor between is the house too), else its
  // ceiling (above that, the roof), vaulted up under the roof where it is
  // (see buildFloor's vaults).
  const vaultTop = (level: number, x: number, z: number) =>
    vaultUnder(level, vaultRoofAt(sections, isDormer, x, z));
  const stacked = indoor.map((r) => {
    const [cx, cz] = r.poly
      .reduce(([sx, sz], [x, z]) => [sx + x, sz + z], [0, 0])
      .map((v) => v / r.poly.length) as Vec2;
    const over = indoor.filter(
      (o) => o.y0 > r.y0 + 1 && insidePoly(o.poly, cx, cz),
    );
    if (over.length || r.flat)
      return {
        ...r,
        top: over.length ? Math.min(...over.map((o) => o.y0)) : r.ceiling,
        topAt: undefined as ((x: number, z: number) => number) | undefined,
        only: undefined as ((x: number, z: number) => boolean) | undefined,
      };
    return {
      ...r,
      top: r.ceiling,
      topAt: (x: number, z: number) => vaultTop(r.ceiling, x, z),
      only: undefined as ((x: number, z: number) => boolean) | undefined,
    };
  });
  // A stairwell (in a floor's house, no room on any floor): vaulted up
  // from that floor's walls' height, as its rooms are.
  const roomAt = (x: number, z: number) =>
    floorsAll.some((f) => {
      const fm = metersPerUnit(f.layout.scale);
      return f.layout.rooms.some(
        (r) => r.points.length >= 3 && pointInPolygon(x / fm, z / fm, r.points),
      );
    });
  const noRoom = (x: number, z: number) =>
    !STAIRWELL_REACH.some(([dx, dz]) => roomAt(x + dx, z + dz));
  for (const f of floorsAll) {
    const fm = metersPerUnit(f.layout.scale);
    const ceiling = f.baseY + f.wallHeight;
    for (const loop of houseLoopsOf(f.layout)) {
      const poly = loop.map(([x, y]): Vec2 => [x * fm, y * fm]);
      // (Away from the outside walls: an eave's end there is the house's
      // edge, not over a stairwell.)
      const inward = (x: number, z: number) =>
        noRoom(x, z) &&
        // (A floor above with house there vaults it.)
        !floorsAll.some(
          (g) =>
            g.baseY > f.baseY + 0.5 &&
            houseLoopsOf(g.layout).some((l) =>
              pointInPolygon(
                x / metersPerUnit(g.layout.scale),
                z / metersPerUnit(g.layout.scale),
                l,
              ),
            ),
        ) &&
        poly.every((p, k) => {
          const q = poly[(k + 1) % poly.length]!;
          return pointToSegmentDistance(x, z, p[0], p[1], q[0], q[1]) > 0.3;
        });
      stacked.push({
        y0: f.baseY,
        ceiling,
        y1: ceiling + 0.6,
        flat: false,
        poly,
        top: ceiling,
        topAt: (x: number, z: number) => vaultTop(ceiling, x, z),
        only: inward,
      });
    }
  }
  // The rooms whose floors are above an eave: a roof there is cut away
  // inside them (it runs on under their floors, hidden).
  const roomsOver = (eave: number) =>
    floorsAll.flatMap((f) => {
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
  /** A gable's siding where another part's roof runs on over it (a
   * wing's roof against a taller part's gable): only what stands above
   * that roof, in strips (under it, it'd stand inside the house). */
  /** A dormer's face less what lies under the roof it stands on, below
   * where a vault under that roof would be (it'd hang into the room):
   * cut by that roof's plane there. */
  const aboveHost = (face: RoofFace3d, si: number): RoofFace3d[] => {
    let pts = face.points;
    const xs = pts.map((p) => p[0]);
    const zs = pts.map((p) => p[2]);
    const box: [number, number, number, number] = [
      Math.min(...xs),
      Math.min(...zs),
      Math.max(...xs),
      Math.max(...zs),
    ];
    sections.forEach((o, oi) => {
      if (oi === si || isDormer[oi] || pts.length < 3) return;
      const r = rects[oi]!;
      if (!overlaps(box, [r[0] - 0.01, r[1] - 0.01, r[2] + 0.01, r[3] + 0.01]))
        return;
      // Its plane under the face's middle (kept inside its footprint).
      const cx = Math.min(
        r[2] - 0.2,
        Math.max(r[0] + 0.2, xs.reduce((a, b) => a + b, 0) / xs.length),
      );
      const cz = Math.min(
        r[3] - 0.2,
        Math.max(r[1] + 0.2, zs.reduce((a, b) => a + b, 0) / zs.length),
      );
      const h0 = sectionHeightAt(o, cx, cz);
      const hx = sectionHeightAt(o, cx + 0.1, cz);
      const hz = sectionHeightAt(o, cx, cz + 0.1);
      if (h0 === null || hx === null || hz === null) return;
      const gx = (hx - h0) / 0.1;
      const gz = (hz - h0) / 0.1;
      const plane = (x: number, z: number) =>
        h0 + gx * (x - cx) + gz * (z - cz);
      // Only where that one plane is its roof under the whole face (not
      // across a ridge or a hip).
      const fits = pts.every((p) => {
        if (p[0] <= r[0] || p[0] >= r[2] || p[2] <= r[1] || p[2] >= r[3])
          return true;
        const h = sectionHeightAt(o, p[0], p[2]);
        return h === null || Math.abs(h - plane(p[0], p[2])) < 0.02;
      });
      if (!fits) return;
      // (What's between its plane and a vault under it stays, hidden,
      // clear of the vault so no edge of it shows on it.)
      const over = (p: [number, number, number]) =>
        p[1] - plane(p[0], p[2]) + VAULT_CLEAR_M - 0.04;
      // Kept above it (Sutherland-Hodgman, its corners in order).
      const out: [number, number, number][] = [];
      pts.forEach((p, k) => {
        const q = pts[(k + 1) % pts.length]!;
        const dp = over(p);
        const dq = over(q);
        if (dp >= 0) out.push(p);
        if (dp >= 0 !== dq >= 0) {
          const t = dp / (dp - dq);
          out.push([
            p[0] + (q[0] - p[0]) * t,
            p[1] + (q[1] - p[1]) * t,
            p[2] + (q[2] - p[2]) * t,
          ]);
        }
      });
      pts = out;
    });
    return pts.length >= 3 ? [{ ...face, points: pts }] : [];
  };
  const unburied = (face: RoofFace3d, si: number): RoofFace3d[] => {
    const pts = face.points;
    const [fx, , fz] = pts[0]!;
    // Across it: to its corner farthest along the ground from the first.
    const [lx, , lz] = pts.reduce((far, p) =>
      Math.hypot(p[0] - fx, p[2] - fz) > Math.hypot(far[0] - fx, far[2] - fz)
        ? p
        : far,
    );
    const run = Math.hypot(lx - fx, lz - fz);
    if (run < 0.01) return [face];
    // Which way a polygon faces, across the ground (its normal's x, z):
    // the strips face as the face does.
    const facingOf = (poly: [number, number, number][]): Vec2 => {
      let nx = 0;
      let nz = 0;
      poly.forEach((p, k) => {
        const q = poly[(k + 1) % poly.length]!;
        nx += (p[1] - q[1]) * (p[2] + q[2]);
        nz += (p[0] - q[0]) * (p[1] + q[1]);
      });
      return [nx, nz];
    };
    const facing = facingOf(pts);
    const [dx, dz] = [(lx - fx) / run, (lz - fz) / run];
    const uv = pts.map(([x, y, z]): Vec2 => [(x - fx) * dx + (z - fz) * dz, y]);
    // The face's span (bottom, top) up its vertical line at u.
    const span = (u: number): [number, number] | null => {
      const ys: number[] = [];
      uv.forEach((a, k) => {
        const b = uv[(k + 1) % uv.length]!;
        if (Math.abs(b[0] - a[0]) < 1e-9) {
          if (Math.abs(u - a[0]) < 1e-6) ys.push(a[1], b[1]);
        } else if ((u - a[0]) * (u - b[0]) <= 0)
          ys.push(a[1] + ((b[1] - a[1]) * (u - a[0])) / (b[0] - a[0]));
      });
      return ys.length ? [Math.min(...ys), Math.max(...ys)] : null;
    };
    // The roof over it there (another part's, inside its footprint).
    const over = (u: number): number => {
      const x = fx + dx * u;
      const z = fz + dz * u;
      let h = -Infinity;
      sections.forEach((o, oi) => {
        const r = rects[oi]!;
        if (oi === si || x <= r[0] + 0.01 || x >= r[2] - 0.01) return;
        if (z <= r[1] + 0.01 || z >= r[3] - 0.01) return;
        const y = sectionHeightAt(o, x, z);
        if (y !== null) h = Math.max(h, y);
      });
      return h;
    };
    const us = [...new Set(uv.map(([u]) => u))].sort((a, b) => a - b);
    const u0 = us[0]!;
    const u1 = us[us.length - 1]!;
    const n = Math.max(1, Math.ceil((u1 - u0) / 0.05));
    const cuts = [
      ...new Set([
        ...us,
        ...Array.from({ length: n }, (_, k) => u0 + ((u1 - u0) * k) / n),
      ]),
    ].sort((a, b) => a - b);
    const lows = cuts.map(over);
    if (
      cuts.every((u, k) => {
        const sp = span(u);
        return !sp || lows[k]! <= sp[0] + 0.005;
      })
    )
      return [face];
    const at = (u: number, y: number): [number, number, number] => [
      fx + dx * u,
      y,
      fz + dz * u,
    ];
    const out: RoofFace3d[] = [];
    for (let k = 0; k + 1 < cuts.length; k++) {
      const [ua, ub] = [cuts[k]!, cuts[k + 1]!];
      const sa = span(ua + 1e-7);
      const sb = span(ub - 1e-7);
      if (!sa || !sb) continue;
      const ya = Math.min(sa[1], Math.max(sa[0], lows[k]!));
      const yb = Math.min(sb[1], Math.max(sb[0], lows[k + 1]!));
      if (sa[1] - ya < 0.002 && sb[1] - yb < 0.002) continue;
      const quad = [at(ua, ya), at(ua, sa[1]), at(ub, sb[1]), at(ub, yb)];
      const [qx, qz] = facingOf(quad);
      out.push({
        points: qx * facing[0] + qz * facing[1] < 0 ? quad.reverse() : quad,
        kind: face.kind,
      });
    }
    return out;
  };
  /** A face less what's inside another part's roof (not a dormer's): its
   * slope running on under the other's past a valley, inside the house
   * (under a vault). */
  const inOthers = (face: RoofFace3d, si: number): RoofFace3d[] => {
    const xs = face.points.map((p) => p[0]);
    const zs = face.points.map((p) => p[2]);
    const box: [number, number, number, number] = [
      Math.min(...xs),
      Math.min(...zs),
      Math.max(...xs),
      Math.max(...zs),
    ];
    let pieces = [face.points as [number, number, number][]];
    sections.forEach((o, oi) => {
      if (oi === si || isDormer[oi] || !overlaps(box, rects[oi]!)) return;
      pieces = pieces.flatMap((p) => outsideSection(p, o));
    });
    return pieces.map((points) => ({ ...face, points }));
  };
  const faces = sections.flatMap((s) => {
    const rooms = roomsOver(Math.min(s.eave0, s.eave1));
    const si = sections.indexOf(s);
    // Its overhang where it runs into another part of the house (a
    // garage's eave against the entry beside it): not there.
    const strips = [
      ...cuts.filter((c) => c.section === si),
      ...indoorStrips(s, stacked).map((strip) => ({
        section: si,
        strip,
        caps: [] as RoofFace3d[],
      })),
    ];
    // Its edges, cut where its fascia is (inside an upper room, along
    // another's gable).
    const own: RoofEdge3d[] = [];
    const part = plan.parts[si];
    const sectionFaceList = sectionFaces(s, own, {
      key: part?.name ? part.name : `#${si}`,
      label: part?.name ?? `Part ${si + 1}`,
    });
    for (const e of own)
      edges.push(
        ...[
          ...rooms,
          ...strips.map((c) => ({ y: -Infinity, poly: c.strip })),
        ].reduce<RoofEdge3d[]>(
          (acc, room) => acc.flatMap((x) => cutEdge(x, room.poly, room.y)),
          [e],
        ),
      );
    return [...sectionFaceList, ...strips.flatMap((c) => c.caps)]
      .flatMap((face) =>
        [
          ...rooms,
          // The overhang strips (not a gable's siding: that's its wall).
          ...(face.kind === "siding" || face.kind === "shake"
            ? []
            : strips.map((c) => ({ y: -Infinity, poly: c.strip }))),
        ].reduce<RoofFace3d[]>(
          (acc, room) => acc.flatMap((f) => cutFace(f, room.poly, room.y)),
          [face],
        ),
      )
      .flatMap((face) =>
        face.kind === "siding" || face.kind === "shake"
          ? unburied(face, si)
          : inOthers(face, si),
      )
      .flatMap((face) => (isDormer[si] ? aboveHost(face, si) : [face]))
      .filter((face) => {
        // No trim left inside a room under its ceiling (an eave's end cap
        // where a gable starts partway over a room): by its middle, so a
        // long fascia with an end tucked in past a corner stays.
        if (face.kind !== "trim") return true;
        const n = face.points.length;
        const mid = face.points
          .reduce((a, p) => [a[0] + p[0], a[1] + p[1], a[2] + p[2]], [0, 0, 0])
          .map((v) => v / n) as [number, number, number];
        return ![mid].some(([x, y, z]) =>
          stacked.some(
            (r) =>
              y > r.y0 + 0.01 &&
              y < (r.topAt ? r.topAt(x, z) : r.top) - 0.01 &&
              insidePoly(r.poly, x, z) &&
              (!r.only || r.only(x, z)),
          ),
        );
      });
  });
  let porchIndex = 0;
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
      if (s) {
        // Cut out of an upper room it runs into (a bedroom over a garage
        // standing forward of the door), as the house's own roofs are.
        const rooms = roomsOver(eave);
        const own: RoofEdge3d[] = [];
        const porchFaces = sectionFaces(s, own, {
          key: `porch:${porchIndex}`,
          label: "Porch",
        });
        for (const e of own)
          edges.push(
            ...rooms.reduce<RoofEdge3d[]>(
              (acc, room) => acc.flatMap((x) => cutEdge(x, room.poly, room.y)),
              [e],
            ),
          );
        faces.push(
          ...porchFaces.flatMap((face) =>
            rooms.reduce<RoofFace3d[]>(
              (acc, room) => acc.flatMap((f) => cutFace(f, room.poly, room.y)),
              [face],
            ),
          ),
        );
      }
      porchIndex++;
    }
  // No light strip inside the house: an eave running on through an upper
  // storey (hidden in its walls) would show through its windows.
  const outside = indoor.reduce<RoofEdge3d[]>(
    (acc, room) =>
      acc.flatMap((e) =>
        Math.max(e.a[1], e.b[1]) < room.y0 || Math.min(e.a[1], e.b[1]) > room.y1
          ? [e]
          : cutEdge(e, room.poly, -Infinity, true),
      ),
    edges,
  );
  return { ...roofColors(input.dark), grid: null, faces, edges: outside };
}

function insidePoly(poly: Vec2[], x: number, z: number): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i]!;
    const [xj, zj] = poly[j]!;
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)
      hit = !hit;
  }
  return hit;
}

/** Where a section's overhang runs into a room of the house (another
 * part of it, at the overhang's height): those stretches of the strip
 * beyond its walls, as convex quads (x, z) to cut its faces by. */
function indoorStrips(
  s: RoofSection,
  rooms: {
    y0: number;
    top: number;
    poly: Vec2[];
    topAt?: ((x: number, z: number) => number) | undefined;
    only?: ((x: number, z: number) => boolean) | undefined;
  }[],
): Vec2[][] {
  const o = s.overhang;
  if (o <= 0.01) return [];
  // The rooms an overhang from `low` (its outer edge) up to `high` runs
  // into: its fascia (hanging below it) under the top of their part of the
  // house, not in the roof space over it (where it closes a valley between
  // two roofs).
  // (Under a vault, its height there.)
  const roomsAt = (
    low: number,
    high: number,
    lowAt: (x: number, z: number) => number = () => low,
  ) =>
    rooms
      .filter(
        (r) => r.y0 < high && (r.topAt || low - VAULT_CLEAR_M < r.top - 0.05),
      )
      .map((r) => ({
        poly: r.poly,
        under: (x: number, z: number) =>
          (!r.only || r.only(x, z)) &&
          (!r.topAt || lowAt(x, z) - VAULT_CLEAR_M < r.topAt(x, z) - 0.05),
      }));
  const drop = ROOF_HEEL_M - s.pitch * o;
  const ridge = Math.max(s.eave0, s.eave1) + (s.pitch * (s.c1 - s.c0)) / 2;
  const world = (a: number, c: number): Vec2 => [
    s.origin[0] + s.along[0] * a + s.across[0] * c,
    s.origin[1] + s.along[1] * a + s.across[1] * c,
  ];
  const inside = (
    [x, z]: Vec2,
    near: { poly: Vec2[]; under: (x: number, z: number) => boolean }[],
  ) =>
    near.some(({ poly, under }) => {
      if (!under(x, z)) return false;
      let hit = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, zi] = poly[i]!;
        const [xj, zj] = poly[j]!;
        if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)
          hit = !hit;
      }
      return hit;
    });
  const reach = (end: RoofEnd) => (end === "open" ? 0 : o);
  const A0 = s.a0 - reach(s.ends[0]);
  const A1 = s.a1 + reach(s.ends[1]);
  const C0 = s.c0 - o;
  const C1 = s.c1 + o;
  /** Runs along [t0, t1] (step 5 cm) where the strip's middle is in a
   * room, as quads through `quad(t0, t1)`. */
  const runs = (
    near: { poly: Vec2[]; under: (x: number, z: number) => boolean }[],
    t0: number,
    t1: number,
    mid: (t: number) => Vec2,
    quad: (u0: number, u1: number) => Vec2[],
  ): Vec2[][] => {
    const out: Vec2[][] = [];
    if (!near.length) return out;
    const step = 0.05;
    let start: number | null = null;
    for (let t = t0; t <= t1 + 1e-9; t += step) {
      const hit = inside(mid(Math.min(t, t1)), near);
      if (hit && start === null) start = t;
      if ((!hit || t + step > t1 + 1e-9) && start !== null) {
        const end = hit ? t1 : t;
        out.push(
          quad(Math.max(t0, start - step / 2), Math.min(t1, end + step / 2)),
        );
        start = null;
      }
    }
    return out;
  };
  const strips: Vec2[][] = [];
  // Eaves: along a, out from c0 (none on a lean-to's wall side) and c1.
  const eaveSides: [number, number, number][] = s.shed
    ? [[s.c1, C1, s.eave1]]
    : [
        [s.c0, C0, s.eave0],
        [s.c1, C1, s.eave1],
      ];
  for (const [wall, edge, eave] of eaveSides) {
    const out = edge + (edge < wall ? -0.05 : 0.05);
    strips.push(
      ...runs(
        roomsAt(eave + drop, eave + ROOF_HEEL_M + 0.2),
        A0,
        A1,
        (a) => world(a, (wall + edge) / 2),
        (u0, u1) => [
          world(u0, wall),
          world(u1, wall),
          world(u1, out),
          world(u0, out),
        ],
      ),
    );
  }
  // Gable or hip ends: across c, out from a0 and a1. Its overhang there
  // rises with the roof (at its wall's line), so judged where it is.
  const endLow = (x: number, z: number) => {
    const rx = x - s.origin[0];
    const rz = z - s.origin[1];
    const a = Math.min(s.a1, Math.max(s.a0, rx * s.along[0] + rz * s.along[1]));
    const c = Math.min(
      s.c1,
      Math.max(s.c0, rx * s.across[0] + rz * s.across[1]),
    );
    const h = sectionHeightAt(s, ...world(a, c));
    return (h ?? Math.min(s.eave0, s.eave1)) + drop;
  };
  ([0, 1] as const).forEach((end) => {
    if (s.ends[end] === "open") return;
    const wall = end === 0 ? s.a0 : s.a1;
    const edge = end === 0 ? A0 : A1;
    const out = edge + (end === 0 ? -0.05 : 0.05);
    strips.push(
      ...runs(
        roomsAt(Math.min(s.eave0, s.eave1) + drop, ridge, endLow),
        s.shed ? s.c0 : C0,
        C1,
        (c) => world((wall + edge) / 2, c),
        (u0, u1) => [
          world(wall, u0),
          world(wall, u1),
          world(out, u1),
          world(out, u0),
        ],
      ),
    );
  });
  return strips;
}

/** A roof edge less its stretch inside a room's outline (x, z) standing
 * above `level`, cut as cutFace cuts the fascia: a concave room as its
 * box. */
function cutEdge(
  e: RoofEdge3d,
  room: Vec2[],
  level: number,
  exact = false,
): RoofEdge3d[] {
  if (Math.max(e.a[1], e.b[1]) <= level + 0.01 || room.length < 3) return [e];
  let area2 = 0;
  room.forEach(([x, z], k) => {
    const [x2, z2] = room[(k + 1) % room.length]!;
    area2 += x * z2 - x2 * z;
  });
  const ring = area2 > 0 ? room : [...room].reverse();
  const convex = ring.every((p, k) => {
    const q = ring[(k + 1) % ring.length]!;
    const r = ring[(k + 2) % ring.length]!;
    return (
      (q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0]) >= -1e-9
    );
  });
  const xs = ring.map((p) => p[0]);
  const zs = ring.map((p) => p[1]);
  const poly: Vec2[] =
    convex || exact
      ? ring
      : [
          [Math.min(...xs), Math.min(...zs)],
          [Math.max(...xs), Math.min(...zs)],
          [Math.max(...xs), Math.max(...zs)],
          [Math.min(...xs), Math.max(...zs)],
        ];
  const [ax, , az] = e.a;
  const dx = e.b[0] - ax;
  const dz = e.b[2] - az;
  const ts = [0, 1];
  poly.forEach(([px, pz], k) => {
    const [qx, qz] = poly[(k + 1) % poly.length]!;
    const ex = qx - px;
    const ez = qz - pz;
    const den = dx * ez - dz * ex;
    if (Math.abs(den) < 1e-12) return;
    const t = ((px - ax) * ez - (pz - az) * ex) / den;
    const u = ((px - ax) * dz - (pz - az) * dx) / den;
    if (t > 0 && t < 1 && u >= 0 && u <= 1) ts.push(t);
  });
  ts.sort((x, y) => x - y);
  const inside = (x: number, z: number) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, zi] = poly[i]!;
      const [xj, zj] = poly[j]!;
      if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi)
        hit = !hit;
    }
    return hit;
  };
  const at = (t: number): [number, number, number] => [
    ax + dx * t,
    e.a[1] + (e.b[1] - e.a[1]) * t,
    az + dz * t,
  ];
  const out: RoofEdge3d[] = [];
  for (let k = 0; k + 1 < ts.length; k++) {
    const t0 = ts[k]!;
    const t1 = ts[k + 1]!;
    if (t1 - t0 < 1e-6) continue;
    const mid = at((t0 + t1) / 2);
    if (inside(mid[0], mid[2])) continue;
    const last = out[out.length - 1];
    if (last && Math.hypot(last.b[0] - at(t0)[0], last.b[2] - at(t0)[2]) < 1e-6)
      last.b = at(t1);
    else out.push({ ...e, a: at(t0), b: at(t1) });
  }
  return out;
}

const SIDE_DEG: Record<CompassSide, number> = { n: 0, e: 90, s: 180, w: 270 };

/** Whether a strip runs along an edge: one facing one of its sides
 * (within 45 degrees), or picked, and not left out. */
export function stripLights(strip: RoofLightStrip, e: RoofEdge3d): boolean {
  if (strip.skip?.includes(e.key)) return false;
  if (strip.edges?.includes(e.key)) return true;
  return !!e.facing && strip.sides.includes(e.facing);
}

/** The colours a strip shows: the pattern of the scene among its own
 * that was activated last (a scene's state is when it last was), else
 * its default pattern (none: its light's colour). */
export function stripPattern(
  strip: RoofLightStrip,
  hass: HomeAssistant | undefined,
): string[] | undefined {
  let best: { at: number; pattern: string[] } | null = null;
  for (const entry of strip.scenes ?? []) {
    const at = Date.parse(hass?.states[entry.scene]?.state ?? "");
    if (!Number.isFinite(at) || !entry.pattern.length) continue;
    if (!best || at > best.at) best = { at, pattern: entry.pattern };
  }
  return best?.pattern ?? strip.pattern;
}

/** The compass side an edge faces (n, e, s, w). */
export function edgeFacing(e: RoofEdge3d, northDeg: number): CompassSide {
  let best: CompassSide = "s";
  let dot = -Infinity;
  for (const side of ["n", "e", "s", "w"] as CompassSide[]) {
    const [vx, vz] = planVector(SIDE_DEG[side], northDeg);
    const d = e.out[0] * vx + e.out[1] * vz;
    if (d > dot) {
      dot = d;
      best = side;
    }
  }
  return best;
}

/** The roof's light strips: an LED every `spacing_in` along each edge it
 * runs along (see stripLights), lit as its light is. */
function roofLights(input: SceneInput, roof: Roof3d | null): RoofLights3d[] {
  const strips = input.roofPlan?.lights ?? [];
  const edges = roof?.edges ?? [];
  if (!strips.length || !edges.length) return [];
  return strips.map((strip) => {
    const step = Math.max(0.01, (strip.spacing_in ?? 2) * 0.0254);
    const points: number[] = [];
    for (const e of edges) {
      if (!stripLights(strip, e)) continue;
      const len = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1], e.b[2] - e.a[2]);
      if (len < step) continue;
      const n = Math.floor(len / step);
      const start = (len - n * step) / 2;
      for (let k = 0; k <= n; k++) {
        const t = (start + k * step) / len;
        points.push(
          e.a[0] + (e.b[0] - e.a[0]) * t,
          e.a[1] + (e.b[1] - e.a[1]) * t,
          e.a[2] + (e.b[2] - e.a[2]) * t,
        );
      }
    }
    const st = strip.entity_id
      ? input.hass?.states[strip.entity_id]
      : undefined;
    const on = st?.state === "on";
    const attrs = (st?.attributes ?? {}) as Record<string, unknown>;
    const rgb = attrs["rgb_color"];
    const color = !on
      ? null
      : Array.isArray(rgb) && rgb.length === 3
        ? `#${(rgb as number[])
            .map((v) =>
              Math.max(0, Math.min(255, Math.round(v)))
                .toString(16)
                .padStart(2, "0"),
            )
            .join("")}`
        : "#ffd27a";
    const brightness = attrs["brightness"];
    return {
      name: strip.entity_id ?? "Roof lights",
      points,
      color,
      level: typeof brightness === "number" ? brightness / 255 : 1,
      ...(() => {
        const pattern = stripPattern(strip, input.hass);
        return pattern?.length ? { pattern } : {};
      })(),
    };
  });
}

/** A roof face less the part of it inside a room's outline (x, z) that
 * stands above `level`: the face in convex pieces, clipped exactly (a
 * vertical face, a gable or a fascia, as much as a sloped one). */
function cutFace(face: RoofFace3d, room: Vec2[], level: number): RoofFace3d[] {
  type P3 = [number, number, number];
  const pts = face.points as P3[];
  if (pts.length < 3 || Math.max(...pts.map((p) => p[1])) <= level + 0.01)
    return [face];
  // Room outline wound counter-clockwise (x, z), so "inside" is left; a
  // concave one cuts as its box.
  let area2 = 0;
  room.forEach(([x, z], k) => {
    const [x2, z2] = room[(k + 1) % room.length]!;
    area2 += x * z2 - x2 * z;
  });
  const ring = area2 > 0 ? room : [...room].reverse();
  const convex = ring.every((p, k) => {
    const q = ring[(k + 1) % ring.length]!;
    const r = ring[(k + 2) % ring.length]!;
    return (
      (q[0] - p[0]) * (r[1] - q[1]) - (q[1] - p[1]) * (r[0] - q[0]) >= -1e-9
    );
  });
  const cut: Vec2[] = convex
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
        ];
      })();
  /** The polygon cut down to where f(x, z) <= 0 (f linear). */
  const clip3 = (poly: P3[], f: (x: number, z: number) => number): P3[] => {
    const out: P3[] = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i]!;
      const q = poly[(i + 1) % poly.length]!;
      const fp = f(p[0], p[2]);
      const fq = f(q[0], q[2]);
      if (fp <= 0) out.push(p);
      if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) {
        const t = fp / (fp - fq);
        out.push([
          p[0] + (q[0] - p[0]) * t,
          p[1] + (q[1] - p[1]) * t,
          p[2] + (q[2] - p[2]) * t,
        ]);
      }
    }
    return out;
  };
  /** Its area in 3D (any orientation). */
  const area3 = (poly: P3[]) => {
    let nx = 0;
    let ny = 0;
    let nz = 0;
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i]!;
      const q = poly[(i + 1) % poly.length]!;
      nx += p[1] * q[2] - p[2] * q[1];
      ny += p[2] * q[0] - p[0] * q[2];
      nz += p[0] * q[1] - p[1] * q[0];
    }
    return Math.hypot(nx, ny, nz) / 2;
  };
  let rest: P3[] = pts;
  const pieces: P3[][] = [];
  for (let k = 0; k < cut.length && rest.length >= 3; k++) {
    const p = cut[k]!;
    const q = cut[(k + 1) % cut.length]!;
    // > 0 outside this edge (to its right, the ring being CCW).
    const side = (x: number, z: number) =>
      -((q[0] - p[0]) * (z - p[1]) - (q[1] - p[1]) * (x - p[0]));
    const outside = clip3(rest, (x, z) => -side(x, z));
    if (outside.length >= 3 && area3(outside) > 1e-5) pieces.push(outside);
    rest = clip3(rest, side);
  }
  // What's left lies inside the room: kept only where it's below the floor.
  if (rest.length >= 3 && area3(rest) > 1e-5) {
    if (Math.max(...rest.map((p) => p[1])) <= level + 0.01) pieces.push(rest);
  }
  return pieces.map((points) => ({ ...face, points }));
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
/** A floor's house: its walls' closed outlines (plan units). */
function houseLoopsOf(layout: FloorLayout): [number, number][][] {
  return layout.walls
    .filter(
      (w) =>
        w.points.length >= 4 &&
        distance(...w.points[0]!, ...w.points[w.points.length - 1]!) < 1,
    )
    .map((w) => w.points);
}

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

/** The band of soil a wall along `line` (world, open) holds on its left
 * as drawn, `blend` deep: the line, then the same line that far out
 * (mitred at its bends), back. */
function soilBand(
  line: Vec2[],
  blend: number,
): { points: Vec2[]; blend: number; band: { line: Vec2[] } } | null {
  const pts = line.filter(
    (p, k) =>
      k === 0 ||
      Math.hypot(p[0] - line[k - 1]![0], p[1] - line[k - 1]![1]) > 1e-4,
  );
  const n = pts.length;
  if (n < 2) return null;
  const segN = pts.slice(1).map((b, k) => {
    const a = pts[k]!;
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l] as Vec2;
  });
  const out = pts.map((p, k) => {
    const nin = segN[Math.max(0, k - 1)]!;
    const nout = segN[Math.min(n - 2, k)]!;
    let mx = nin[0] + nout[0];
    let mz = nin[1] + nout[1];
    const ml = Math.hypot(mx, mz) || 1;
    mx /= ml;
    mz /= ml;
    const reach = blend / Math.max(0.35, mx * nout[0] + mz * nout[1]);
    return [p[0] + mx * reach, p[1] + mz * reach] as Vec2;
  });
  return { points: [...pts, ...out.reverse()], blend, band: { line: pts } };
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
  // The building's footprint, which grading leaves alone.
  const cover = input.floors.flatMap((f) => {
    const m = metersPerUnit(f.layout.scale);
    return f.layout.rooms
      .filter((r) => r.points.length >= 3)
      .map((r) => r.points.map(([x, y]): Vec2 => [x * m, y * m]));
  });
  // Dug-out and raised areas, on any floor's plan (a retaining wall
  // closed round and filled raises its inside to its top): their outlines
  // in the world.
  const pits: Pit3d[] = [];
  const raised: Pit3d[] = [];
  // Every retaining wall's line in the world: a raised area's edge along
  // one stays sharp, the rest blend.
  const walls: [Vec2, Vec2][] = [];
  const worldOf = (f: SceneInput["floors"][number], item: FurnitureItem) => {
    const entry = catalogItem(item.kind)!;
    const m = metersPerUnit(f.layout.scale);
    const flip = !!item.mirrored !== !!entry.flip;
    const spec = siteSpec(item, entry, flip, null);
    const a = (-item.rotation_deg * Math.PI) / 180;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    const points = spec.points.map(([x, z]): Vec2 => [
      item.x * m + x * c + z * s,
      item.y * m - x * s + z * c,
    ]);
    return { points, closed: spec.closed };
  };
  for (const f of input.floors)
    for (const item of f.layout.furniture) {
      const entry = catalogItem(item.kind);
      if (!isRetainingWall(entry) || (item.points?.length ?? 0) < 2) continue;
      const { points, closed } = worldOf(f, item);
      for (let k = 0; k + 1 < points.length + (closed ? 1 : 0); k++)
        walls.push([points[k]!, points[(k + 1) % points.length]!]);
    }
  const alongWall = (a: Vec2, b: Vec2) => {
    let near = 0;
    for (let k = 0; k <= 4; k++) {
      const x = a[0] + ((b[0] - a[0]) * k) / 4;
      const z = a[1] + ((b[1] - a[1]) * k) / 4;
      if (
        walls.some(
          ([p, q]) =>
            pointToSegmentDistance(x, z, p[0], p[1], q[0], q[1]) < 0.4,
        )
      )
        near++;
    }
    return near >= 3;
  };
  for (const f of input.floors) {
    const m = metersPerUnit(f.layout.scale);
    for (const item of f.layout.furniture) {
      const entry = catalogItem(item.kind);
      if (!entry || (item.points?.length ?? 0) < 2) continue;
      // An open retaining wall holding back soil (its slope, stored as
      // aim_m): on its left as drawn.
      if (
        isRetainingWall(entry) &&
        item.closed === false &&
        (item.aim_m ?? 0) > 0
      ) {
        const band = soilBand(worldOf(f, item).points, item.aim_m!);
        const h =
          (item.height_cm ?? Number(entry.opts["height"] ?? 60)) / 100 - 0.04;
        if (band && h > 0) raised.push({ ...band, depth: h, id: item.id });
        continue;
      }
      if ((item.points?.length ?? 0) < 3) continue;
      const site = entry.opts["site"];
      const filled =
        isRetainingWall(entry) && item.fill === true && item.closed !== false;
      if (site !== "dig" && site !== "raise" && !filled) continue;
      const flip = !!item.mirrored !== !!entry.flip;
      const local = siteSpec(item, entry, flip, null).points;
      const a = (-item.rotation_deg * Math.PI) / 180;
      const [c, s] = [Math.cos(a), Math.sin(a)];
      const points = local.map(([x, z]): Vec2 => [
        item.x * m + x * c + z * s,
        item.y * m - x * s + z * c,
      ]);
      if (site === "dig") pits.push({ points, depth: digDepth(item, entry) });
      else if (site === "raise") {
        // Its blend (stored as aim_m): edges not along a retaining wall
        // ease down to the ground round it over that distance.
        const blend = item.aim_m ?? 0;
        raised.push({
          points,
          depth: digDepth(item, entry),
          id: item.id,
          ...(blend > 0
            ? {
                blend,
                hard: points.map((p, k) =>
                  alongWall(p, points[(k + 1) % points.length]!),
                ),
              }
            : {}),
        });
      } else {
        // Soil up to just under the wall's cap.
        const h =
          (item.height_cm ?? Number(entry.opts["height"] ?? 60)) / 100 - 0.04;
        if (h > 0) raised.push({ points, depth: h });
      }
    }
  }
  return {
    uphill: ground.uphill_m,
    downhill: ground.downhill_m,
    dir: [dx, dz],
    range: lo < hi ? [lo, hi] : [0, 0],
    level: GRADE_LEVEL,
    holes,
    ...(ground.grid ? { grid: ground.grid } : {}),
    cover,
    ...(pits.length ? { pits } : {}),
    ...(raised.length ? { raised } : {}),
  };
}

/** The ground's height (world Y) at a spot on the floor plane. */
export function groundHeight(t: Terrain3d, x: number, z: number): number {
  const [lo, hi] = t.range;
  const s = x * t.dir[0] + z * t.dir[1];
  const k = hi > lo ? Math.min(1, Math.max(0, (s - lo) / (hi - lo))) : 0;
  return (
    t.uphill +
    (t.downhill - t.uphill) * gradeFall(k, t.level) +
    gradeAt(t.grid, t.cover, x, z)
  );
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
