import type { CustomIcon } from "./canvas/custom-icons";

/** Types mirroring custom_components/spatial_context/storage.py's schema. */

/** Stands in for a floor_id wherever something is placed on the Property
 * tab instead of a floor — matches storage.py's PROPERTY_LOCATION_ID. */
export const PROPERTY_LOCATION_ID = "__property__";

export interface Room {
  id: string;
  name: string;
  area_id: string | null;
  points: [number, number][];
  /** Per-room overlay styling (see floorplan-canvas.ts's .room-poly) —
   * each room's own look, not an app-wide preference. Undefined/null on
   * any field falls back to today's baked-in default (see
   * floorplan-canvas.ts's DEFAULT_ROOM_* constants). */
  fill_color?: string | null;
  fill_opacity?: number | null;
  border_opacity?: number | null;
  visible?: boolean;
  /** Where the room's name label sits, when dragged there by hand (#33).
   * Null/undefined = automatic (see geometry.ts's roomLabelPoint). */
  label_position?: [number, number] | null;
  /** The name label's look: hidden when show_label is false; size as a
   * multiple of the plan's label size; rotation in degrees; its own colour
   * (null = the plan's label colour). */
  show_label?: boolean;
  label_size?: number;
  label_rotation?: number;
  label_color?: string | null;
  /** What this room's live light shading follows, besides its own
   * `area_id`: other HA areas (an open-plan space spanning two), other
   * rooms on this floor (whose lights it shows too), and specific light
   * entities. See canvas/live-state.ts. */
  linked_area_ids?: string[];
  linked_room_ids?: string[];
  light_entity_ids?: string[];
  /** Lights this room ignores though its area or links include them (an
   * indicator strip, say). */
  excluded_light_ids?: string[];
  /** An outdoor space drawn on the plan (a deck, a patio): it counts as
   * outside, so daylight through a door or window onto it only falls on
   * the indoor side. */
  outdoor?: boolean;
}

export interface Pin {
  id: string;
  /** The pin's whole identity — a device only physically exists in one
   * place, so this is what "already placed" checks and mesh-link
   * resolution key off. There is deliberately no entity_id here: a human
   * placing a device should never need to know or choose which of its HA
   * entities represents it — canvas/device-display.ts derives an icon and
   * a display name from this purely automatically (entities are AI-agent
   * plumbing, not something a person interacts with). Null only for a pin
   * whose original entity no longer resolves to any device (deleted
   * integration, orphaned registry entry) — never guessed at (see
   * registry_snapshot.py's async_migrate_pin_device_ids). */
  device_id: string | null;
  x: number;
  y: number;
  room_id: string | null;
  icon_override: string | null;
  label_override: string | null;
  /** Mounting height in metres above floor level, e.g. for judging a
   * mmWave sensor's detection cone. Null when not specified. */
  height_m: number | null;
}

export interface Wall {
  id: string;
  /** Material catalog id — see canvas/materials.ts. */
  material: string;
  /** Real wall thickness in centimetres — scales the material's per-cm RF
   * attenuation rate, and (once the floor is calibrated) the wall's drawn
   * line width. Optional only because a wall saved before this field
   * existed won't have one; use canvas/materials.ts's wallThicknessCm(wall)
   * rather than reading this raw, which falls back to the material's own
   * default thickness. */
  thickness_cm?: number;
  points: [number, number][];
}

/** A two-point calibration segment: `points` spans a known real-world
 * distance (`meters`), letting the whole floor's stored units be converted
 * to real-world metres. */
export interface Scale {
  points: [[number, number], [number, number]];
  meters: number;
}

export type UnitSystem = "metric" | "imperial";

/** App-wide preferences, shared across every viewer of the panel (see
 * ha-client.ts's getSettings/saveSettings and storage.py's `settings` key)
 * — not per-browser, the same shared-storage model as floors/property.
 * Storage everywhere else stays real metric SI regardless of this value;
 * it only governs what units a prompt/input displays and accepts. */
export interface Settings {
  unit_system: UnitSystem;
  /** Zigbee `raw` networkmap timeout, seconds (see zigbee_mesh.py) —
   * user-configurable since only the user knows their own mesh size. */
  zigbee_timeout_seconds: number;
  /** Floor tab display order (#30) — display only, `level` is untouched. */
  floor_order: FloorOrder;
  /** HA device to draw the Zigbee coordinator at, when the radio is its
   * own device separate from the Zigbee2MQTT Bridge (#27). Null = the
   * Bridge device. */
  zigbee_coordinator_device_id: string | null;
  /** Save layout edits automatically a few seconds after each change
   * (#32). The manual Save button works either way. */
  auto_save: boolean;
  /** Send panel events to the backend's debug log file (see debug.py). */
  debug_logging: boolean;
  /** Weather entity whose cloud cover dims sunlight through windows: null
   * picks one automatically, "none" ignores the weather. Absent from a
   * backend older than this field — treat as null. */
  weather_entity_id?: string | null;
  /** Show "x of y lights on" under each room's name on the plan (the
   * room's tooltip shows it either way). Absent = true. */
  show_light_count?: boolean;
  /** Room outlines, for every room (absent = on, each room's own colour,
   * width 2, fully opaque); each room's border_opacity applies on top. */
  room_border_show?: boolean;
  room_border_color?: string | null;
  room_border_width?: number;
  room_border_opacity?: number;
  /** Room name labels on the plan: size (plan units, absent = 16), colour
   * (null = the theme's text colour) and bold. */
  room_label_size?: number;
  room_label_color?: string | null;
  room_label_bold?: boolean;
  /** The halo behind room names (absent = on, 3 units, the canvas
   * background colour). */
  room_label_halo?: boolean;
  room_label_halo_width?: number;
  room_label_halo_color?: string | null;
  /** Draw room fills beneath the background image (absent = above). */
  room_fill_under_background?: boolean;
  /** SVG icons imported into the furniture library (custom-icons.ts). */
  custom_icons?: CustomIcon[];
  /** The dashed Set Scale reference line on the plan (absent = shown). */
  show_scale_line?: boolean;
}

/** What the backend reports for the version handshake (see debug.py). */
export interface VersionInfo {
  /** The version HA loaded at startup — the backend actually running. */
  loaded_version: string | null;
  /** The version installed on disk now. */
  installed_version: string | null;
  /** Build id of the panel bundle installed on disk. */
  panel_build_id: string | null;
}

export type FloorOrder = "top_down" | "ground_up";

export type OpeningType = "door" | "window";

/** A door or window along a wall. `x`/`y` is the opening's centre point;
 * `width` is measured along the wall's own local direction there. */
export interface Opening {
  id: string;
  wallId: string;
  type: OpeningType;
  x: number;
  y: number;
  width: number;
  /** A cover (blind, shade, garage door…) hung in this opening — its live
   * position shades the floor behind it. */
  cover_entity_id?: string | null;
  /** A second cover on the same opening — then `cover_entity_id` is its
   * left half and this the right, as seen from inside looking out. */
  cover_right_entity_id?: string | null;
  /** A garage door: drawn as an overhead door that rolls up into the
   * garage with its cover's position. */
  garage?: boolean;
  /** Fine-tuning for the daylight drawn through this opening (see
   * floorplan-canvas.ts's _renderDaylight). Every field is optional. */
  daylight?: OpeningDaylight;
}

export interface OpeningDaylight {
  /** false hides this opening's daylight altogether. */
  enabled?: boolean;
  /** Brightness multiplier, 0–2 (1 = as computed). */
  strength?: number;
  /** How far the light reaches into the room, multiplier 0.25–3. */
  reach?: number;
  /** Height of the window's top above the floor, metres — sets how long
   * the sun's beam is (default 2.1). */
  head_m?: number;
  /** Outdoor shade blocking the direct sun (trees, a porch roof), 0–1. */
  shade?: number;
}

/** A piece of furniture or household item: a catalog drawing (see
 * canvas/furniture-catalog.ts) placed at its real-world size. `x`/`y` is
 * its centre in stored units; size stays in centimetres, so recalibrating
 * the floor keeps it the right size. */
export interface FurnitureItem {
  id: string;
  /** Catalog item id — which drawing, and its default name. */
  kind: string;
  x: number;
  y: number;
  rotation_deg: number;
  width_cm: number;
  depth_cm: number;
  /** Line thickness in screen pixels (constant at any zoom). */
  stroke_width: number;
  /** Line colour; null follows the theme. */
  color?: string | null;
  /** Shade the item's footprint in its line colour. */
  fill?: boolean;
  /** Not see-through: its body hides whatever is drawn beneath it. */
  solid?: boolean;
  /** Display name; null uses the catalog name. */
  label?: string | null;
  show_label?: boolean;
  mirrored?: boolean;
  /** Can't be dragged, rotated or resized on the canvas. */
  locked?: boolean;
  /** 0.1–1; how see-through the item is drawn (1 when unset). */
  opacity?: number;
  /** An HA entity this item stands for (a lamp's light, a TV's media
   * player…) — its live state is drawn on the item (see live-state.ts's
   * computeItemStates), and a dashboard tap toggles it. */
  entity_id?: string | null;
  /** A free-form shape's outline: 0–1 fractions of width/depth, so it
   * scales with the item. */
  points?: [number, number][];
  /** Whether that outline is closed (clicked back to its first corner). */
  closed?: boolean;
  /** A drawn shape's corner rounding, one 0–100 % per corner (0 square);
   * absent or null = the usual soft corners. */
  corners?: number[] | null;
}

/** A phone room scan (glTF/GLB) laid over a floor in the 3D view — see
 * scans.py. The file itself is fetched separately (HaClient.fetchScan);
 * this is just its metadata and placement. */
export interface RoomScan {
  id: string;
  name: string;
  ext: "glb" | "gltf";
  size_bytes: number;
  uploaded_at: number;
  /** Where the scan's origin sits on the plan, stored units; null until
   * first placed (the 3D view then centres it on the plan). */
  x: number | null;
  y: number | null;
  /** Metres above the floor's level. */
  elevation_m: number;
  /** Degrees clockwise as seen from above. */
  rotation_deg: number;
  scale: number;
  visible: boolean;
  opacity: number;
  /** Hide the floor's extruded walls while this scan shows. */
  hide_walls: boolean;
}

/** A floor's 3D view settings (see scans.py), kept apart from its layout. */
export interface View3dSettings {
  /** Null = the default (2.4 m). */
  wall_height_m: number | null;
  scans: RoomScan[];
}

/** The canvas's visible region in its own stored coordinate space — what
 * `fitToScreen()`/pan/zoom actually manipulate. Persisted per floor (and
 * once for the Property tab) so a chosen viewing angle survives switching
 * away and back, captured at Save time from whatever the canvas is
 * currently showing (see panel.ts's `_save`/`_saveProperty`). */
export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FloorLayout {
  background_image_id: string | null;
  background_opacity: number;
  /** Where/how big the background image is drawn within this floor's own
   * stored coordinate space — (0, 0, 1) is "full BASE_WIDTH from the
   * origin", the historical fixed behavior every floor still has unless
   * Align Floors (see panel.ts's _onAlignApply) has rescaled it to line up
   * with another floor. */
  background_offset_x: number;
  background_offset_y: number;
  background_scale: number;
  /** Which "building" this floor belongs to — null until Align Floors
   * links it to another floor. Two floors sharing a non-null building_id
   * share one coordinate system (e.g. Top Floor + Bottom Floor of the
   * same house); a genuinely separate structure (a detached Garage, say)
   * stays null. Used to decide whether switching floors should keep the
   * current pan/zoom (same building) or fit fresh (different building) —
   * see panel.ts's _selectFloor. */
  building_id: string | null;
  /** Saved pan/zoom — restored whenever this floor is opened, in
   * preference to the same-building/fit-fresh fallback above. Null on a
   * floor whose view was never explicitly saved. */
  view_box: ViewBox | null;
  rooms: Room[];
  pins: Pin[];
  walls: Wall[];
  openings: Opening[];
  /** Always present (HaClient.getLayout fills it in for a backend older
   * than this field). */
  furniture: FurnitureItem[];
  scale: Scale | null;
  /** Compass bearing the top of the plan faces (0 = north is up, 90 =
   * east is up), or null when not set. With HA's home location this lets
   * daylight through each window follow the real sun. */
  north_deg: number | null;
}

/** A floor's traced footprint extent (rooms + walls only), in that floor's
 * own stored coordinate space. Two floors sharing a building_id already
 * share one coordinate system (Align Floors), so their bounds can be
 * unioned directly — see panel.ts's `_buildings`. */
export interface ContentBounds {
  min_x: number;
  min_y: number;
  max_x: number;
  max_y: number;
}

export interface FloorMeta {
  floor_id: string;
  name: string;
  level: number | null;
  icon: string | null;
  has_layout: boolean;
  /** Non-null when this floor has been linked to another via Align Floors
   * (see FloorLayout.building_id) — floors sharing a building_id collapse
   * to one placement on the Property tab. Null means this floor is its own
   * building (e.g. a detached Garage never aligned to anything). */
  building_id: string | null;
  content_bounds: ContentBounds | null;
  /** Metres per stored unit from this floor's Scale calibration, null when
   * uncalibrated. Absent from a backend older than v0.13 (until HA is
   * restarted onto it) — treat as null. */
  meters_per_unit?: number | null;
}

/** One building's labeled, rotatable footprint on the Property tab's
 * site photo. `floor_id` is the representative/anchor floor used for
 * navigation ("go to floor") and as the name/icon fallback; `building_id`
 * mirrors that floor's own FloorLayout.building_id (null for a standalone
 * floor acting as its own building). `x`/`y` is the rectangle's *center*,
 * `rotation_deg` is applied about that center. */
export interface PropertyPlacement {
  id: string;
  building_id: string | null;
  floor_id: string;
  label_override: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation_deg: number;
  /** width/height's locked ratio, captured from the building's traced
   * footprint at placement time — resize preserves this instead of
   * letting the rectangle be freely squashed/stretched. */
  aspect_ratio: number;
  /** The building's traced floor-plan footprint this rectangle was fitted
   * to — the box it maps onto (see canvas/property-mapping.ts). Captured at
   * placement time and kept, so drawing more rooms later doesn't stretch
   * the mapping. Null when nothing had been traced yet. */
  source_bounds: ContentBounds | null;
}

/** Live street map behind the Property canvas (#6) — see
 * map/map-camera.ts for how the anchor maps canvas units to the map. */
export interface MapBackground {
  lat: number;
  lon: number;
  zoom: number;
  opacity: number;
  /** Degrees clockwise the map is turned about the anchor; absent = 0. */
  rotation_deg?: number;
  /** Street map (HA's map_tiles proxy) or aerial imagery (Esri World
   * Imagery, loaded directly by the browser); absent = street. */
  style?: MapStyleKind;
}

export type MapStyleKind = "street" | "aerial";

export interface PropertyLayout {
  background_image_id: string | null;
  background_opacity: number;
  background_offset_x: number;
  background_offset_y: number;
  background_scale: number;
  /** Saved pan/zoom, restored whenever the Property tab is opened. */
  view_box: ViewBox | null;
  placements: PropertyPlacement[];
  /** Outdoor devices (garden lights, say), positioned on the site photo —
   * a device lives in one place only, across floors and here. `room_id`
   * and `height_m` are unused outdoors. */
  pins: Pin[];
  /** Null/absent = no map; absent on layouts saved before it existed. */
  map_background?: MapBackground | null;
}

export interface AreaMeta {
  area_id: string;
  name: string;
  floor_id: string | null;
  icon: string | null;
}

export interface PlaceableEntity {
  entity_id: string;
  name: string;
  domain: string;
  device_class: string | null;
  area_id: string | null;
  area_name: string | null;
  device_id: string | null;
  device_name: string | null;
  /** "diagnostic" | "config" | null — see entity-picker-sidebar's device grouping. */
  entity_category: string | null;
  /** Integration slug (e.g. "unifiprotect") that set up this entity — used
   * to fetch its brand icon from brands.home-assistant.io, the same public
   * CDN the HA frontend itself uses for every integration logo. */
  integration_domain: string | null;
  integration_name: string | null;
  /** Which floor (if any) this entity is *currently* placed on, house-wide
   * — an entity only physically exists in one place, so the picker uses
   * this to block placing an already-placed device onto a *different*
   * floor (see entity-picker-sidebar.ts). Null means not placed anywhere
   * yet; compare against the currently-open floor_id, since a device
   * already placed on *this* floor should stay placeable (re-armable) here,
   * just not on any other floor. */
  placed_floor_id: string | null;
  placed_floor_name: string | null;
}

export interface ExportSnapshot {
  exported_at: string;
  floors: {
    floor_id: string;
    name: string;
    /** Metres per stored coordinate unit, or null if this floor was never calibrated. */
    meters_per_unit: number | null;
    rooms: {
      id: string | null;
      name: string;
      devices: {
        device_id: string | null;
        /** Null when device_id has no resolvable placeable entity
         * (deleted/disabled since placement) — see export.py. */
        entity_id: string | null;
        name: string;
        domain: string | null;
        device_class: string | null;
        area_name: string | null;
        x: number;
        y: number;
        x_m: number | null;
        y_m: number | null;
        height_m: number | null;
      }[];
    }[];
    walls: {
      material: string;
      material_label: string;
      attenuation_db: number | null;
      points: [number, number][];
      points_m: [number, number][] | null;
      openings: {
        type: OpeningType;
        x: number;
        y: number;
        width: number;
        x_m: number | null;
        y_m: number | null;
        width_m: number | null;
      }[];
    }[];
  }[];
}

export type CanvasMode =
  | "select"
  | "pan"
  | "trace"
  | "wall"
  | "opening"
  | "scale"
  | "place"
  | "align"
  | "furniture";

/** How a new trace point (or a dragged vertex) snaps (#36): "all" onto
 * any nearby wall or room edge, "same" only onto shapes of the kind being
 * drawn (walls onto walls, rooms onto rooms), "off" not at all — the same
 * as holding Shift. A per-browser preference, see panel.ts. */
export type SnapMode = "all" | "same" | "off";

export type NetworkType = "zigbee" | "wifi" | "matter" | "bluetooth";

/** One BLE device's latest advertisement as HA core's
 * `bluetooth/subscribe_advertisements` reports it (#4) — trimmed to what
 * the Bluetooth layer uses. Addresses are MACs, uppercase. */
export interface BluetoothAdvertisement {
  address: string;
  /** The scanner (adapter or proxy) that heard it. */
  source: string;
  rssi: number | null;
  name: string | null;
}

/** `bluetooth/subscribe_advertisements` event payload. */
export interface BluetoothAdvertisementEvent {
  add?: BluetoothAdvertisement[];
  remove?: { address: string }[];
}

/** Live Zigbee2MQTT topology — never persisted, fetched fresh on each
 * "Refresh Mesh" click. Global/floor-agnostic like PlaceableEntity/AreaMeta;
 * the panel cross-references against the current floor's placed pins. */
export interface MeshNode {
  ieee: string;
  friendly_name: string;
  device_id: string | null;
  /** Z2M's node type — "Coordinator" | "Router" | "EndDevice". */
  type: string | null;
}

/** One per device pair — every neighbor-table pair, unreduced (see
 * zigbee_mesh.py's `_merge_links`); the panel picks what to draw. */
export interface MeshLink {
  source_ieee: string;
  target_ieee: string;
  /** The weaker of the two sides' readings after correcting each for its
   * reporter's scale (LQI isn't comparable across chipsets — see
   * zigbee_mesh.py's `_reporter_scales`). Drives both selection and color. */
  lqi: number;
  /** Each side's own raw measurement, strongest first — one entry when
   * only one side's table was read (e.g. a sleepy end device). */
  lqi_readings: number[];
  /** Parent/child (a real route), as opposed to a sibling merely in range. */
  parent_child: boolean;
  source_device_id: string | null;
  target_device_id: string | null;
}

export interface ZigbeeMesh {
  nodes: MeshNode[];
  links: MeshLink[];
  /** Epoch seconds this result was actually fetched at — may be well
   * before "now" when served from the backend's cache (see
   * zigbee_mesh.py), including a scan pre-warmed by the
   * refresh_zigbee_mesh service. Null only if the backend somehow omits
   * it (shouldn't happen — defensive only). */
  fetched_at: number | null;
}

/** Wi-Fi client→AP links, read from entity states (see wifi_mesh.py) —
 * best-effort, only populated for integrations that expose `ap_mac`.
 * `rssi_dbm` is null unless the same device also happens to expose a
 * standard `signal_strength` sensor. */
export interface WifiMesh {
  links: {
    source_device_id: string;
    target_device_id: string;
    rssi_dbm: number | null;
  }[];
}

/** Live Matter/Thread topology — this is HA core's own already-shipped
 * `matter/subscribe_network_topology` WS command (the same one powering
 * Settings → Matter → "Show map"), subscribed to directly; no backend
 * code of ours is involved. */
export interface MatterMeshNode {
  id: string;
  kind: "matter" | "border_router";
  network_type: string;
  node_id: number | null;
  role: string;
  available: boolean | null;
  ext_address: string;
  network_name: string;
  vendor_name: string | null;
  model_name: string | null;
  ha_device_id: string | null;
}

export interface MatterMeshConnection {
  source: string;
  target: string;
  network: string;
  strength: "strong" | "medium" | "weak";
  path_cost: number;
}

export interface MatterNetworkTopology {
  nodes: MatterMeshNode[];
  connections: MatterMeshConnection[];
}

/** What every network type's raw data gets normalized into before
 * rendering — see mesh-colors.ts's LinkQuality. `detail` is an optional
 * tooltip string ("LQI 119", "RSSI -74dBm"), absent for Wi-Fi. */
export interface ResolvedMeshLink {
  fromPin: Pin;
  toPin: Pin;
  quality: "strong" | "medium" | "weak" | "unknown";
  detail?: string;
}

/** One end of a mesh link drawn on the Property tab, in site-photo
 * coordinates: an outdoor pin, or an indoor device mapped through its
 * building's placement (see canvas/property-mapping.ts). */
export interface PropertyMeshEnd {
  deviceId: string;
  x: number;
  y: number;
  label: string;
  /** Set for an indoor device — the floor it's on, for "go to floor". */
  floorId: string | null;
}

/** A mesh link on the Property tab — at least one end is outdoors. */
export interface PropertyMeshLink {
  key: string;
  from: PropertyMeshEnd;
  to: PropertyMeshEnd;
  quality: "strong" | "medium" | "weak" | "unknown";
  detail?: string;
}

/** A mesh link where exactly one end is placed on the *currently viewed*
 * floor — the other end is real (placed on some other floor), just not
 * drawable as a normal ResolvedMeshLink since its pin isn't on screen.
 * `x`/`y` is where the stub marker renders in this floor's own coordinate
 * space: the other pin's real position when both floors share a
 * building_id (Align Floors — same coordinate system), or a projected
 * point at the edge of this floor's traced content, in the true bearing
 * toward the other building's Property-tab placement, when they don't
 * (see panel.ts's `_meshStubsForCurrentFloor`). */
export interface ResolvedMeshStub {
  fromPin: Pin;
  x: number;
  y: number;
  targetDeviceId: string;
  targetFloorId: string;
  targetFloorName: string;
  targetLabel: string;
  quality: "strong" | "medium" | "weak" | "unknown";
  detail?: string;
}

/** The slice of `hass` this panel actually touches. */
export interface HomeAssistant {
  connection: {
    sendMessagePromise<T>(message: Record<string, unknown>): Promise<T>;
    subscribeMessage<T>(
      callback: (result: T) => void,
      message: Record<string, unknown>,
    ): Promise<() => void>;
  };
  fetchWithAuth(path: string, init?: RequestInit): Promise<Response>;
  config?: {
    latitude?: number;
    longitude?: number;
    components?: string[];
    /** IANA zone of the home, e.g. "Australia/Sydney". */
    time_zone?: string;
  };
  themes?: { darkMode?: boolean };
  states: Record<
    string,
    { state?: string; attributes: Record<string, unknown> } | undefined
  >;
  /** Entity/device registry display entries, as the HA frontend keeps
   * them — used to find which lights are in which area. */
  entities?: Record<
    string,
    { area_id?: string | null; device_id?: string | null } | undefined
  >;
  devices?: Record<string, { area_id?: string | null } | undefined>;
  callService?: (
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: Record<string, unknown>,
  ) => Promise<unknown>;
  /** For i18n (see i18n.ts's setLanguage) — the real HA-supplied object
   * always carries at least one of these; both optional here since this
   * is a hand-narrowed local type, not runtime-enforced. */
  locale?: { language: string };
  language?: string;
}

/** A placed building's traced geometry (floor-plan units), for the Property
 * canvas's ghost outline — see property-canvas.ts's `_renderGhost`. */
export interface PlacementGhost {
  rooms: [number, number][][];
  walls: [number, number][][];
}
