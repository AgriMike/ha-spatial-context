import type {
  AreaMeta,
  ExportSnapshot,
  FloorLayout,
  FloorMeta,
  HomeAssistant,
  MatterNetworkTopology,
  Opening,
  OpeningType,
  Pin,
  PlaceableEntity,
  ContentBounds,
  PropertyLayout,
  PropertyPlacement,
  Room,
  Settings,
  Wall,
  WifiMesh,
  ZigbeeMesh,
  VersionInfo,
  GroundSetting,
  RoofPlan,
  RoomScan,
  View3dSettings,
  BluetoothAdvertisementEvent,
} from "./types";
import { DEFAULT_WALL_MATERIAL, wallMaterial } from "./canvas/materials";

/** Thin wrapper over the five spatial_context/* WebSocket commands + core's image upload API. */
export class HaClient {
  constructor(private hass: HomeAssistant) {}

  async listFloors(): Promise<FloorMeta[]> {
    const result = await this.hass.connection.sendMessagePromise<{
      floors: FloorMeta[];
    }>({
      type: "spatial_context/list_floors",
    });
    return result.floors;
  }

  async getLayout(floorId: string): Promise<FloorLayout> {
    const layout = await this.hass.connection.sendMessagePromise<FloorLayout>({
      type: "spatial_context/get_layout",
      floor_id: floorId,
    });
    return {
      ...layout,
      furniture: layout.furniture ?? [],
      north_deg: layout.north_deg ?? null,
    };
  }

  async saveLayout(
    floorId: string,
    layout: FloorLayout,
  ): Promise<{ success: boolean }> {
    const send = (l: FloorLayout) =>
      this.hass.connection.sendMessagePromise<{ success: boolean }>({
        type: "spatial_context/save_layout",
        floor_id: floorId,
        background_image_id: l.background_image_id,
        background_opacity: l.background_opacity,
        background_offset_x: l.background_offset_x,
        background_offset_y: l.background_offset_y,
        background_scale: l.background_scale,
        building_id: l.building_id,
        view_box: l.view_box,
        rooms: l.rooms,
        pins: l.pins,
        walls: l.walls,
        openings: l.openings,
        furniture: l.furniture,
        north_deg: l.north_deg,
        scale: l.scale,
      });
    try {
      const result = await send(layout);
      layoutFinishesUnsaved = false;
      return result;
    } catch (err) {
      // A backend from before the 3D editor's finishes (not restarted
      // since updating) refuses those fields: save the rest, and say so.
      const message = (err as { message?: string })?.message ?? "";
      const aboutFinishes =
        /extra keys not allowed/i.test(message) ||
        [...ROOM_FINISH_KEYS, ...ITEM_FINISH_KEYS, ...OPENING_STYLE_KEYS].some(
          (k) => message.includes(k),
        );
      if (!aboutFinishes || !hasFinishes(layout)) throw err;
      const result = await send(withoutFinishes(layout));
      layoutFinishesUnsaved = true;
      return result;
    }
  }

  /** Tags a floor as sharing a building/coordinate-system with another
   * (see Align Floors, panel.ts's _onAlignApply) without a full layout
   * save — the floor being viewed may have other unsaved edits pending
   * that this must not also persist as a side effect. */
  async setBuildingId(
    floorId: string,
    buildingId: string | null,
  ): Promise<{ success: boolean }> {
    return this.hass.connection.sendMessagePromise({
      type: "spatial_context/set_building_id",
      floor_id: floorId,
      building_id: buildingId,
    });
  }

  async getPropertyLayout(): Promise<PropertyLayout> {
    return this.hass.connection.sendMessagePromise<PropertyLayout>({
      type: "spatial_context/get_property_layout",
    });
  }

  async savePropertyLayout(
    layout: PropertyLayout,
  ): Promise<{ success: boolean }> {
    return this.hass.connection.sendMessagePromise({
      type: "spatial_context/save_property_layout",
      background_image_id: layout.background_image_id,
      background_opacity: layout.background_opacity,
      background_offset_x: layout.background_offset_x,
      background_offset_y: layout.background_offset_y,
      background_scale: layout.background_scale,
      view_box: layout.view_box,
      placements: layout.placements,
      pins: layout.pins,
      // Only once the backend has reported the field (it's strict about
      // unknown keys, and an HA not yet restarted onto it would reject the
      // whole save).
      ...(layout.map_background !== undefined
        ? { map_background: layout.map_background }
        : {}),
    });
  }

  async getSettings(): Promise<Settings> {
    return this.hass.connection.sendMessagePromise<Settings>({
      type: "spatial_context/get_settings",
    });
  }

  /** Saves every setting. The backend replace-saves, filling anything
   * left out with its default — so each one has to be sent, every time
   * (sending only the original six silently reset all the rest). */
  async saveSettings(settings: Settings): Promise<{ success: boolean }> {
    const payload: Record<string, unknown> = {
      type: "spatial_context/save_settings",
    };
    for (const key of Object.keys(emptySettings()) as (keyof Settings)[]) {
      const value = settings[key];
      if (value !== undefined) payload[key] = value;
    }
    return this.hass.connection.sendMessagePromise(payload);
  }

  async getVersionInfo(): Promise<VersionInfo> {
    return this.hass.connection.sendMessagePromise<VersionInfo>({
      type: "spatial_context/version",
    });
  }

  async sendDebugLog(entries: Record<string, unknown>[]): Promise<void> {
    await this.hass.connection.sendMessagePromise({
      type: "spatial_context/debug_log",
      entries,
    });
  }

  async getDebugReport(): Promise<Record<string, unknown>> {
    return this.hass.connection.sendMessagePromise<Record<string, unknown>>({
      type: "spatial_context/debug_report",
    });
  }

  async listAreas(): Promise<AreaMeta[]> {
    const result = await this.hass.connection.sendMessagePromise<{
      areas: AreaMeta[];
    }>({
      type: "spatial_context/list_areas",
    });
    return result.areas;
  }

  async listPlaceableEntities(): Promise<PlaceableEntity[]> {
    const result = await this.hass.connection.sendMessagePromise<{
      entities: PlaceableEntity[];
    }>({ type: "spatial_context/list_placeable_entities" });
    return result.entities;
  }

  async exportSnapshot(): Promise<ExportSnapshot> {
    return this.hass.connection.sendMessagePromise<ExportSnapshot>({
      type: "spatial_context/export_snapshot",
    });
  }

  /** `forceRefresh: false` (the default) serves the backend's cache
   * instantly when one exists; only an explicit "Refresh Mesh" click (or
   * no cache existing yet) should pass `true`, since a real scan can take
   * 1-2+ minutes on a large mesh. */
  async getZigbeeMesh(forceRefresh = false): Promise<ZigbeeMesh> {
    return this.hass.connection.sendMessagePromise<ZigbeeMesh>({
      type: "spatial_context/get_zigbee_mesh",
      force_refresh: forceRefresh,
    });
  }

  /** The backend's cached scan, or null — never triggers a scan, so it's
   * safe to call the moment the Zigbee layer is picked. */
  async getCachedZigbeeMesh(): Promise<ZigbeeMesh | null> {
    return this.hass.connection.sendMessagePromise<ZigbeeMesh | null>({
      type: "spatial_context/get_zigbee_mesh",
      cache_only: true,
    });
  }

  /** Best-effort — empty link list if no integration exposes `ap_mac`. */
  async getWifiMesh(): Promise<WifiMesh> {
    return this.hass.connection.sendMessagePromise<WifiMesh>({
      type: "spatial_context/get_wifi_mesh",
    });
  }

  /** HA core's own command (powers Settings → Matter → "Show map"), not
   * anything of ours. Live push, not a one-shot fetch — returns the
   * unsubscribe function, which the caller must invoke on teardown. */
  async subscribeMatterTopology(
    callback: (topology: MatterNetworkTopology) => void,
  ): Promise<() => void> {
    return this.hass.connection.subscribeMessage<MatterNetworkTopology>(
      callback,
      {
        type: "matter/subscribe_network_topology",
      },
    );
  }

  /** HA core's own advertisement stream (what Settings → Bluetooth →
   * Visualization uses) — admin-only on HA's side (#4). */
  async subscribeBluetoothAdvertisements(
    callback: (event: BluetoothAdvertisementEvent) => void,
  ): Promise<() => void> {
    return this.hass.connection.subscribeMessage<BluetoothAdvertisementEvent>(
      callback,
      { type: "bluetooth/subscribe_advertisements" },
    );
  }

  /** Bluetooth address → device candidates (see bluetooth_mesh.py). */
  async getBluetoothDevices(): Promise<{ devices: Record<string, string[]> }> {
    return this.hass.connection.sendMessagePromise({
      type: "spatial_context/get_bluetooth_devices",
    });
  }

  /** A floor's 3D view settings and room scans (see scans.py). */
  async getView3d(floorId: string): Promise<View3dSettings> {
    return this.hass.connection.sendMessagePromise<View3dSettings>({
      type: "spatial_context/get_view3d",
      floor_id: floorId,
    });
  }

  async saveView3d(
    floorId: string,
    settings: View3dSettings,
  ): Promise<View3dSettings> {
    return this.hass.connection.sendMessagePromise<View3dSettings>({
      type: "spatial_context/save_view3d",
      floor_id: floorId,
      wall_height_m: settings.wall_height_m,
      floor_elevation_m: settings.floor_elevation_m,
      scans: settings.scans.map((s) => ({
        id: s.id,
        name: s.name,
        x: s.x,
        y: s.y,
        elevation_m: s.elevation_m,
        rotation_deg: s.rotation_deg,
        scale: s.scale,
        visible: s.visible,
        opacity: s.opacity,
        hide_walls: s.hide_walls,
      })),
    });
  }

  /** Sets the ground around a building on each of its floors (see
   * scans.py's async_save_ground); null = flat. */
  async saveGround(
    floorIds: string[],
    ground: GroundSetting | null,
  ): Promise<void> {
    const send = (g: GroundSetting | null) =>
      this.hass.connection.sendMessagePromise({
        type: "spatial_context/save_ground",
        floor_ids: floorIds,
        ground: g,
      });
    try {
      await send(ground);
      groundGridUnsaved = false;
    } catch (err) {
      // A backend from before grading (not restarted since updating)
      // refuses the grid: save the rest, and say so.
      const message = (err as { message?: string })?.message ?? "";
      if (!ground || !("grid" in ground) || !/extra keys|grid/i.test(message))
        throw err;
      const { grid, ...rest } = ground;
      await send(rest);
      groundGridUnsaved = !!grid;
    }
  }

  /** Sets a building's roof on each of its floors (see scans.py's
   * async_save_roof); null = worked out from the rooms. */
  async saveRoof(floorIds: string[], roof: RoofPlan | null): Promise<void> {
    const send = (r: RoofPlan | null) =>
      this.hass.connection.sendMessagePromise({
        type: "spatial_context/save_roof",
        floor_ids: floorIds,
        roof: r,
      });
    try {
      await send(roof);
      roofLightsUnsaved = false;
    } catch (err) {
      // A backend from before roof lights (not restarted since updating)
      // refuses them: save the parts, and say so.
      const message = (err as { message?: string })?.message ?? "";
      if (!roof?.lights || !/extra keys|lights/i.test(message)) throw err;
      await send({ parts: roof.parts });
      roofLightsUnsaved = roof.lights.length > 0;
    }
  }

  /** Uploads a .glb/.gltf room scan to the integration's own storage
   * (not HA's image store, which only takes pictures). */
  async uploadScan(floorId: string, file: File): Promise<RoomScan> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.hass.fetchWithAuth(
      `/api/spatial_context/scan_upload/${encodeURIComponent(floorId)}`,
      { method: "POST", body: formData },
    );
    if (!response.ok) {
      const detail = await response
        .json()
        .then((d: { message?: string }) => d.message)
        .catch(() => null);
      throw new Error(
        detail ?? `Upload failed: ${response.status} ${response.statusText}`,
      );
    }
    return (await response.json()) as RoomScan;
  }

  async deleteScan(scanId: string): Promise<void> {
    await this.hass.connection.sendMessagePromise({
      type: "spatial_context/delete_scan",
      scan_id: scanId,
    });
  }

  /** Uploads via HA core's built-in image_upload component, returns the new image id. */
  async uploadBackgroundImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await this.hass.fetchWithAuth("/api/image/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error(
        `Image upload failed: ${response.status} ${response.statusText}`,
      );
    }
    const data = (await response.json()) as { id: string };
    return data.id;
  }
}

/** An uploaded item model (see models.py): its id, file name and, when
 * the file carries them, its title, author and licence. */
export interface UploadedModel {
  id: string;
  name: string;
  size: number;
  title?: string;
  author?: string;
  license?: string;
  source?: string;
}

/** Uploads a .glb model for an item to the integration's own storage. */
export async function uploadModel(
  hass: HomeAssistant,
  file: File,
): Promise<UploadedModel> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await hass.fetchWithAuth(
    "/api/spatial_context/model_upload",
    { method: "POST", body: formData },
  );
  if (!response.ok) {
    const detail = await response
      .json()
      .then((d: { message?: string }) => d.message)
      .catch(() => null);
    throw new Error(
      detail ??
        (response.status === 404
          ? "Restart Home Assistant to finish installing model uploads"
          : `Upload failed: ${response.status} ${response.statusText}`),
    );
  }
  return (await response.json()) as UploadedModel;
}

/** An item model's file, as bytes for GLTFLoader. */
export async function fetchModel(
  hass: HomeAssistant,
  modelId: string,
): Promise<ArrayBuffer> {
  const response = await hass.fetchWithAuth(
    `/api/spatial_context/model/${encodeURIComponent(modelId)}`,
  );
  if (!response.ok)
    throw new Error(`Couldn't load the model (${response.status})`);
  return response.arrayBuffer();
}

/** A room scan's file, as bytes for GLTFLoader. */
export async function fetchScan(
  hass: HomeAssistant,
  scanId: string,
): Promise<ArrayBuffer> {
  const response = await hass.fetchWithAuth(
    `/api/spatial_context/scan/${encodeURIComponent(scanId)}`,
  );
  if (!response.ok)
    throw new Error(`Couldn't load the scan (${response.status})`);
  return response.arrayBuffer();
}

export function backgroundImageUrl(imageId: string | null): string | null {
  return imageId ? `/api/image/serve/${imageId}/original` : null;
}

/** A pin/room/wall/etc.'s unique id. `crypto.randomUUID()` is the obvious
 * choice, but the spec restricts it to secure contexts (HTTPS) — plenty of
 * HA installs are reached over plain HTTP on the LAN, where it's simply
 * not a function at all. Confirmed live: this broke wall/room/device
 * creation entirely for real users on plain HTTP (GitHub issues #8 and
 * #9) — every add silently threw inside newId() before the new
 * room/wall/pin ever reached state, so it looked like the drawing just
 * vanished. `crypto.getRandomValues()` has no such secure-context
 * restriction, so build a standard UUID v4 from that instead when native
 * randomUUID() isn't available; a non-crypto Math.random() fallback
 * covers the (effectively never happens) case where crypto itself is
 * entirely absent — these ids only need to be unique within one floor's
 * layout, never security-sensitive. */
/** The 3D editor's finish fields (see types.ts's Room and FurnitureItem):
 * newer than a backend that hasn't been restarted since updating. */
const ROOM_FINISH_KEYS = [
  "floor_finish",
  "floor_color",
  "wall_finish",
  "wall_color",
  "ceiling",
] as const;
const ITEM_FINISH_KEYS = [
  "height_cm",
  "elevation_cm",
  "entity_id_2",
  "beam_deg",
  "aim_m",
  "drawers_cm",
  "doors",
  "handle_side",
  "door_tiers",
  "countertop",
  "finish",
  "shelves_cm",
  "columns",
  "books",
  "strip_edges",
  "book_align",
  "pot_cm",
  "pot_shape",
  "fullness",
  "leaf_spread_deg",
  "opening_gap_cm",
  "model_id",
  "model_name",
  "lift_cm",
  "tire_cm",
] as const;
const OPENING_STYLE_KEYS = [
  "door_style",
  "door_open_deg",
  "door_hinge_flip",
  "door_swing_flip",
  "window_type",
  "window_grid",
  "shutters",
  "garage_style",
  "paint_color",
  "sill_m",
  "height_m",
  "trim_finish",
  "trim_width_cm",
  "trim_top_cm",
  "trim_bottom_cm",
  "trim_bezel_cm",
  "trim_bezel_color",
] as const;

/** The last roof save had to leave the light strips out (restart needed). */
export let roofLightsUnsaved = false;

/** The last ground save had to leave the grading out (restart needed). */
export let groundGridUnsaved = false;

/** The last layout save had to leave the finishes out (restart needed). */
export let layoutFinishesUnsaved = false;

function hasFinishes(layout: FloorLayout): boolean {
  return (
    layout.rooms.some((r) => ROOM_FINISH_KEYS.some((k) => k in r)) ||
    layout.furniture.some((f) => ITEM_FINISH_KEYS.some((k) => k in f)) ||
    layout.openings.some((o) => OPENING_STYLE_KEYS.some((k) => k in o))
  );
}

function withoutFinishes(layout: FloorLayout): FloorLayout {
  return {
    ...layout,
    rooms: layout.rooms.map((r) => {
      const copy = { ...r } as Record<string, unknown>;
      for (const k of ROOM_FINISH_KEYS) delete copy[k];
      return copy as unknown as typeof r;
    }),
    furniture: layout.furniture.map((f) => {
      const copy = { ...f } as Record<string, unknown>;
      for (const k of ITEM_FINISH_KEYS) delete copy[k];
      return copy as unknown as typeof f;
    }),
    openings: layout.openings.map((o) => {
      const copy = { ...o } as Record<string, unknown>;
      for (const k of OPENING_STYLE_KEYS) delete copy[k];
      return copy as unknown as typeof o;
    }),
  };
}

export function newId(prefix: string): string {
  return `${prefix}-${uuidV4()}`;
}

function uuidV4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6]! & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8]! & 0x3f) | 0x80; // variant 10
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function emptyPin(
  deviceId: string | null,
  x: number,
  y: number,
  roomId: string | null,
): Pin {
  return {
    id: newId("pin"),
    device_id: deviceId,
    x,
    y,
    room_id: roomId,
    icon_override: null,
    label_override: null,
    height_m: null,
  };
}

export function newRoom(
  name: string,
  points: [number, number][],
  areaId: string | null,
): Room {
  return { id: newId("room"), name, area_id: areaId, points };
}

export function newWall(
  points: [number, number][],
  material = DEFAULT_WALL_MATERIAL,
): Wall {
  return {
    id: newId("wall"),
    material,
    thickness_cm: wallMaterial(material).defaultThicknessCm,
    points,
  };
}

export function newOpening(
  wallId: string,
  type: OpeningType,
  x: number,
  y: number,
  width: number,
): Opening {
  return { id: newId("opening"), wallId, type, x, y, width };
}

/** New placements are sized to this on their longer side, with the other
 * side derived from `aspectRatio` — the actual on-screen starting size is
 * cosmetic, since the user resizes it into place; what matters is starting
 * proportional to the real building rather than an arbitrary rectangle. */
const NEW_PLACEMENT_LONG_SIDE = 220;

export function newPlacement(
  floorId: string,
  buildingId: string | null,
  x: number,
  y: number,
  aspectRatio: number,
  sourceBounds: ContentBounds | null,
): PropertyPlacement {
  const width =
    aspectRatio >= 1
      ? NEW_PLACEMENT_LONG_SIDE
      : NEW_PLACEMENT_LONG_SIDE * aspectRatio;
  const height =
    aspectRatio >= 1
      ? NEW_PLACEMENT_LONG_SIDE / aspectRatio
      : NEW_PLACEMENT_LONG_SIDE;
  return {
    id: newId("placement"),
    building_id: buildingId,
    floor_id: floorId,
    label_override: null,
    x,
    y,
    width,
    height,
    rotation_deg: 0,
    aspect_ratio: aspectRatio,
    source_bounds: sourceBounds,
  };
}

export function emptySettings(): Settings {
  return {
    unit_system: "metric",
    zigbee_timeout_seconds: 180,
    floor_order: "top_down",
    zigbee_coordinator_device_id: null,
    auto_save: true,
    debug_logging: false,
    weather_entity_id: null,
    show_light_count: true,
    room_border_show: true,
    room_border_color: null,
    room_border_width: 2,
    room_border_opacity: 1,
    room_label_size: 16,
    room_label_color: null,
    room_label_bold: false,
    room_label_halo: true,
    room_label_halo_width: 3,
    room_label_halo_color: null,
    room_fill_under_background: false,
    custom_icons: [],
    show_scale_line: true,
  };
}

export function emptyPropertyLayout(): PropertyLayout {
  return {
    background_image_id: null,
    background_opacity: 0.85,
    background_offset_x: 0,
    background_offset_y: 0,
    background_scale: 1,
    view_box: null,
    placements: [],
    pins: [],
  };
}

export function emptyFloorLayout(): FloorLayout {
  return {
    background_image_id: null,
    background_opacity: 0.5,
    background_offset_x: 0,
    background_offset_y: 0,
    background_scale: 1,
    building_id: null,
    view_box: null,
    rooms: [],
    pins: [],
    walls: [],
    openings: [],
    furniture: [],
    scale: null,
    north_deg: null,
  };
}
