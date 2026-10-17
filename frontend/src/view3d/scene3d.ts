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
  Scale,
} from "../types";
import type {
  Box3d,
  Floor3d,
  Item3d,
  Pane3d,
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
  if (/stand|pedestal|basket/.test(kind)) return "block";
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
  hass: HomeAssistant | undefined;
  dark: boolean;
  date: Date;
  sky: Sky | null;
  showLights: boolean;
  /** The ground around the building, null for flat. */
  ground: GroundSetting | null;
}

function buildFloor(
  input: FloorInput,
  hass: HomeAssistant | undefined,
  dark: boolean,
  showLights: boolean,
  nightGlow: number,
  floorAbove: (x: number, z: number) => number | null,
  upperWalls: { a: Vec2; b: Vec2; y: number }[],
): Floor3d {
  const { layout, wallHeight: H } = input;
  const m = metersPerUnit(layout.scale);
  const covers = computeCoverOpenness(layout.openings, hass);
  const walls: Box3d[] = [];
  const panes: Pane3d[] = [];
  const wallFaces: Floor3d["wallFaces"] = [];
  const offsetRooms = layout.rooms.filter(
    (r) => (r.floor_offset_m ?? 0) !== 0 && r.points.length >= 3,
  );
  /** The rooms either side of a wall, a little way out from it along its
   * length: their floor offsets (Room.floor_offset_m, 0 when level with
   * the floor) and the height of whatever floor above covers each spot
   * (null where nothing does). */
  const wallSides = (a: Vec2, b: Vec2, t: number) => {
    const len = distance(a[0], a[1], b[0], b[1]);
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    const reach = (t / 2 + 0.2) / m;
    const offsets = new Set<number>();
    const above: (number | null)[] = [];
    for (const f of [0.2, 0.5, 0.8]) {
      for (const side of [1, -1]) {
        const x = a[0] + (b[0] - a[0]) * f + nx * reach * side;
        const y = a[1] + (b[1] - a[1]) * f + ny * reach * side;
        const room = layout.rooms.find(
          (r) => r.points.length >= 3 && pointInPolygon(x, y, r.points),
        );
        if (room) offsets.add(room.floor_offset_m ?? 0);
        above.push(floorAbove(x * m, y * m));
      }
    }
    return { offsets: [...offsets], above };
  };
  /** A wall's vertical span (metres from the floor's level) and the level
   * its doors and windows sit at. It reaches from the lowest room beside
   * it to a storey above the highest; a split level's garage walls run
   * from the landing. It stops at a floor above that covers it, and
   * reaches up to meet one just above it rather than leave a gap. */
  const wallSpan = (a: Vec2, b: Vec2, t: number) => {
    const { offsets, above } = wallSides(a, b, t);
    const base = offsets.length ? Math.min(...offsets) : 0;
    let top = (offsets.length ? Math.max(...offsets) : 0) + H;
    // Doors and windows: at the room's level when it's the only one, else
    // at the higher (steps go down into the lower room).
    const level = offsets.length ? Math.max(...offsets) : 0;
    const covered = above.filter((u): u is number => u !== null);
    if (covered.length === above.length && covered.length) {
      top = Math.min(top, Math.max(...covered));
    } else if (covered.length) {
      const near = Math.min(...covered);
      if (near > top && near <= top + 0.8) top = near;
    }
    // Where a floor above has a wall on the same line, that wall carries
    // on from its level: stop there rather than stand beside it.
    top = Math.min(top, upperWallTop(a, b, top));
    return { base, top: Math.max(top, base + 0.3), level };
  };
  /** The level of the lowest wall of a floor above that runs along this
   * one (parallel, within 35 cm, over most of its length), else `top`. */
  const upperWallTop = (a: Vec2, b: Vec2, top: number): number => {
    const ax = a[0] * m;
    const az = a[1] * m;
    const L = distance(a[0], a[1], b[0], b[1]) * m;
    if (L < 0.05) return top;
    const ux = (b[0] * m - ax) / L;
    const uz = (b[1] * m - az) / L;
    let best = top;
    for (const w of upperWalls) {
      if (w.y >= best) continue;
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
      if (overlap > 0.5 * L) best = w.y;
    }
    return best;
  };
  const offsetAt = (x: number, y: number): number =>
    offsetRooms.find((r) => pointInPolygon(x, y, r.points))?.floor_offset_m ??
    0;

  for (const wall of layout.walls) {
    const pts = wall.points;
    if (pts.length < 2) continue;
    const t = wallThicknessCm(wall) / 100;
    // A stub (a door jamb, a closet return) stands alone as an odd slab:
    // left out.
    let run = 0;
    for (let i = 0; i < pts.length - 1; i++)
      run += distance(pts[i]![0], pts[i]![1], pts[i + 1]![0], pts[i + 1]![1]);
    if (run * m < STUB_M) continue;
    // A thin one is a stair rail or balustrade: waist high.
    const rail = t <= RAIL_THICKNESS_M;
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

    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i]!;
      const [bx, by] = pts[i + 1]!;
      const L = distance(ax, ay, bx, by) * m;
      if (L < 0.005) continue;
      const dx = ((bx - ax) * m) / L;
      const dz = ((by - ay) * m) / L;
      const angle = Math.atan2(-dz, dx);
      const at = (s: number): Vec2 => [ax * m + dx * s, ay * m + dz * s];
      const { base, top, level: off } = wallSpan([ax, ay], [bx, by], t);
      // Overlap the next/previous segment at joints so corners close.
      const ext0 = i > 0 || closed ? t / 2 : 0;
      const ext1 = i < pts.length - 2 || closed ? t / 2 : 0;
      const box = (
        s0: number,
        s1: number,
        y0: number,
        y1: number,
        depth = t,
      ): Box3d => {
        const [x, z] = at((s0 + s1) / 2);
        return { x, z, y0, y1, length: s1 - s0, depth, angle };
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
      if (rail) {
        walls.push(box(-ext0, L + ext1, base, base + RAIL_HEIGHT_M));
        continue;
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
        if (hole.s0 > cursor) walls.push(box(cursor, hole.s0, base, top));
        const isDoor = opening.type === "door";
        // A window's kind sets its glass: a transom is a ~45 cm strip just
        // under the ceiling, floor-to-ceiling runs the full wall height.
        const style = isDoor ? undefined : opening.window_style;
        const defaultHead =
          style === "transom" ? H - 0.15 : style === "full" ? H : WINDOW_HEAD_M;
        const head =
          Math.min(
            top - off,
            isDoor ? DOOR_HEAD_M : (opening.daylight?.head_m ?? defaultHead),
          ) + off;
        const sill =
          (isDoor
            ? 0
            : style === "transom"
              ? Math.max(0, head - off - 0.45)
              : style === "full"
                ? 0
                : Math.min(WINDOW_SILL_M, head - off - 0.1)) + off;
        if (sill > base) walls.push(box(hole.s0, hole.s1, base, sill));
        if (head < top - 0.005) walls.push(box(hole.s0, hole.s1, head, top));
        if (!isDoor)
          panes.push({
            box: box(hole.s0, hole.s1, sill, head, 0.02),
            kind: "glass",
            color: "#a7d3ef",
            opacity: 0.22,
          });
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
      if (L + ext1 > cursor) walls.push(box(cursor, L + ext1, base, top));
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
    const fill = roomFillStyle(
      room.fill_color ?? DEFAULT_ROOM_FILL_COLOR,
      room.fill_opacity ?? DEFAULT_ROOM_FILL_OPACITY,
      light,
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
      emissive: lit ? light.color : null,
      // A lit room's glow shows at night; daylight drowns it out.
      emissiveIntensity: lit
        ? (0.06 + 0.18 * Math.min(1, light.level)) * nightGlow
        : 0,
      outdoor: !!room.outdoor,
    });
  }

  // Furniture.
  const states = computeItemStates(layout.furniture, hass);
  const items: Item3d[] = [];
  for (const item of layout.furniture) {
    const entry = catalogItem(item.kind);
    const flip = !!item.mirrored !== !!entry?.flip;
    const prims = itemPrims(item, entry);
    const placed =
      item.points && item.points.length >= 2 && item.closed === false
        ? { y0: 0, height: 0.01 }
        : itemHeight(item.kind, entry, H);
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
    items.push({
      id: item.id,
      name: item.label || entry?.name || item.kind,
      footprint: itemFootprint(item, entry, prims, flip),
      width: item.width_cm / 100,
      depth: item.depth_cm / 100,
      x: item.x * m,
      z: item.y * m,
      angle: (-item.rotation_deg * Math.PI) / 180,
      y0,
      height,
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
    wallColor: dark ? "#8a8580" : "#f4f1ec",
    panes,
    slabs,
    items,
    wallFaces,
    metersPerUnit: m,
  };
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
  const floors = input.floors.map((f) =>
    buildFloor(
      f,
      hass,
      dark,
      input.showLights,
      1 - 0.75 * day,
      floorAboveOf(f, input.floors),
      upperWallsOf(f, input.floors),
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
    terrain: input.ground ? terrain(input, input.ground, northDeg) : null,
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

/** For one floor: the walls of floors above it, as segments on the floor
 * plane (metres) with their level relative to it. */
function upperWallsOf(
  floor: FloorInput,
  floors: FloorInput[],
): { a: Vec2; b: Vec2; y: number }[] {
  return floors
    .filter((f) => f.baseY > floor.baseY + 0.5)
    .flatMap((f) => {
      const m = metersPerUnit(f.layout.scale);
      return f.layout.walls.flatMap((w) =>
        w.points.slice(1).map((p, i) => ({
          a: [w.points[i]![0] * m, w.points[i]![1] * m] as Vec2,
          b: [p[0] * m, p[1] * m] as Vec2,
          y: f.baseY - floor.baseY,
        })),
      );
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
        }));
    });
  return (x, z) => {
    let best: number | null = null;
    for (const r of rooms)
      if ((best === null || r.y < best) && pointInPolygon(x, z, r.points))
        best = r.y;
    return best;
  };
}

/** The hillside the building stands on: grade on its high and low sides,
 * falling toward a compass bearing. Rooms whose floor sits below the high
 * side's grade are cut out of the ground, so a walk-out basement still
 * shows inside. */
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
          !r.outdoor &&
          r.points.length >= 3 &&
          f.baseY + (r.floor_offset_m ?? 0) < top - 0.01,
      )
      .map((r) => r.points.map(([x, y]): Vec2 => [x * m, y * m]));
  });
  return {
    uphill: ground.uphill_m,
    downhill: ground.downhill_m,
    dir: [dx, dz],
    holes,
  };
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
