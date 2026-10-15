/** `custom:spatial-context-card` — a floor plan on a dashboard, live: rooms
 * lit by their lights, daylight/shade behind covered windows, furniture,
 * and device pins tinted by state. Tap a room to toggle its lights, a
 * device or cover to open its more-info dialog.
 *
 * Deliberately tiny and dependency-free: it loads the panel bundle (which
 * defines <floorplan-canvas>, read-only here) instead of bundling a second
 * copy of every element. Registered on every dashboard by frontend.py. */

import type {
  FloorLayout,
  FloorMeta,
  HomeAssistant,
  PlaceableEntity,
} from "./types";
import {
  computeCoverOpenness,
  computeItemStates,
  computePinColors,
  computeRoomLights,
  coverOpenness,
  isToggleable,
  liveSignature,
  primaryEntityForDevice,
  type RoomLight,
} from "./canvas/live-state";

const PANEL_BUNDLE_URL = `/spatial_context_panel.js?v=${__BUILD_ID__}`;

type TapAction = "toggle" | "more-info" | "none";

export interface SpatialContextCardConfig {
  type: string;
  floor_id?: string;
  title?: string;
  /** Plan height in px (default 400). */
  height?: number;
  show_furniture?: boolean;
  show_lights?: boolean;
  show_covers?: boolean;
  show_devices?: boolean;
  show_background?: boolean;
  /** Zoom and overlay buttons on the plan. */
  show_controls?: boolean;
  room_tap_action?: TapAction;
  cover_tap_action?: TapAction;
  device_tap_action?: "more-info" | "none";
  /** A furniture item linked to an entity (a lamp, say). */
  item_tap_action?: TapAction;
}

/** The canvas element's surface the card drives (see floorplan-canvas.ts). */
interface CanvasElement extends HTMLElement {
  [key: string]: unknown;
}

let panelBundle: Promise<void> | null = null;

/** Loads the panel bundle once, for its <floorplan-canvas>. */
function loadCanvas(): Promise<void> {
  if (customElements.get("floorplan-canvas")) return Promise.resolve();
  if (!panelBundle) {
    panelBundle = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = PANEL_BUNDLE_URL;
      script.onload = () => resolve();
      script.onerror = () => {
        panelBundle = null;
        reject(new Error("Couldn't load the Spatial Context panel bundle"));
      };
      document.head.appendChild(script);
    }).then(() =>
      customElements.whenDefined("floorplan-canvas").then(() => {}),
    );
  }
  return panelBundle;
}

async function listFloors(hass: HomeAssistant): Promise<FloorMeta[]> {
  const result = await hass.connection.sendMessagePromise<{
    floors: FloorMeta[];
  }>({ type: "spatial_context/list_floors" });
  return result.floors;
}

class SpatialContextCard extends HTMLElement {
  private _config: SpatialContextCardConfig = { type: "" };
  private _hass?: HomeAssistant;
  private _layout: FloorLayout | null = null;
  private _floorName = "";
  private _entities = new Map<string, PlaceableEntity>();
  private _canvas: CanvasElement | null = null;
  private _root: ShadowRoot;
  private _loadedFor: string | null = null;
  private _liveSig = "";
  private _roomLights = new Map<string, RoomLight>();
  private _error: string | null = null;
  private _overlays = { furniture: true, lights: true, covers: true };

  constructor() {
    super();
    this._root = this.attachShadow({ mode: "open" });
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("spatial-context-card-editor");
  }

  static async getStubConfig(
    hass: HomeAssistant,
  ): Promise<SpatialContextCardConfig> {
    const floors = await listFloors(hass).catch(() => []);
    const floor = floors.find((f) => f.has_layout) ?? floors[0];
    return {
      type: "custom:spatial-context-card",
      ...(floor ? { floor_id: floor.floor_id } : {}),
    };
  }

  setConfig(config: SpatialContextCardConfig): void {
    if (!config) throw new Error("Invalid configuration");
    this._config = config;
    this._overlays = {
      furniture: config.show_furniture !== false,
      lights: config.show_lights !== false,
      covers: config.show_covers !== false,
    };
    this._loadedFor = null;
    this._render();
    void this._load();
  }

  set hass(hass: HomeAssistant) {
    const first = !this._hass;
    this._hass = hass;
    const setLanguage = (window as unknown as Record<string, unknown>)[
      "__spatialContextSetLanguage"
    ] as ((h: HomeAssistant) => void) | undefined;
    setLanguage?.(hass);
    if (first) void this._load();
    this._applyLive();
    if (this._canvas) this._canvas["dark"] = hass.themes?.darkMode ?? false;
  }

  getCardSize(): number {
    return Math.max(3, Math.round((this._config.height ?? 400) / 50));
  }

  getGridOptions() {
    return { columns: 12, rows: 6, min_columns: 6, min_rows: 3 };
  }

  connectedCallback(): void {
    document.addEventListener("visibilitychange", this._onVisible);
    // Back on a dashboard after editing the plan: pick up the changes.
    this._loadedFor = null;
    void this._load();
  }

  disconnectedCallback(): void {
    document.removeEventListener("visibilitychange", this._onVisible);
  }

  private _onVisible = () => {
    if (document.visibilityState === "visible") {
      this._loadedFor = null;
      void this._load();
    }
  };

  private async _load(): Promise<void> {
    const hass = this._hass;
    if (!hass || !this.isConnected) return;
    try {
      let floorId = this._config.floor_id;
      const floors = await listFloors(hass);
      if (!floorId)
        floorId = (floors.find((f) => f.has_layout) ?? floors[0])?.floor_id;
      if (!floorId) throw new Error("No floors set up in Home Assistant yet");
      const key = floorId;
      if (this._loadedFor === key) return;
      this._loadedFor = key;
      this._floorName =
        floors.find((f) => f.floor_id === floorId)?.name ?? floorId;
      const [layout, entities] = await Promise.all([
        hass.connection.sendMessagePromise<FloorLayout>({
          type: "spatial_context/get_layout",
          floor_id: floorId,
        }),
        hass.connection
          .sendMessagePromise<{ entities: PlaceableEntity[] }>({
            type: "spatial_context/list_placeable_entities",
          })
          .then((r) => r.entities)
          .catch(() => [] as PlaceableEntity[]),
        loadCanvas(),
      ]);
      this._layout = { ...layout, furniture: layout.furniture ?? [] };
      this._entities = new Map(entities.map((e) => [e.entity_id, e]));
      this._error = null;
    } catch (err) {
      this._error = (err as Error).message;
      this._loadedFor = null;
    }
    this._render();
  }

  private _render(): void {
    const height = this._config.height ?? 400;
    const title = this._config.title ?? this._floorName;
    if (!this._root.firstChild) {
      this._root.innerHTML = `
        <style>
          ha-card { overflow: hidden; }
          .head { padding: 12px 16px 0; font-size: 1.1rem; }
          .plan { position: relative; }
          .msg { padding: 16px; color: var(--secondary-text-color); }
          floorplan-canvas { display: block; width: 100%; height: 100%; }
        </style>
        <ha-card><div class="head"></div><div class="plan"></div><div class="msg"></div></ha-card>`;
    }
    const head = this._root.querySelector<HTMLElement>(".head")!;
    const plan = this._root.querySelector<HTMLElement>(".plan")!;
    const msg = this._root.querySelector<HTMLElement>(".msg")!;
    head.textContent = title;
    head.style.display = title ? "" : "none";
    plan.style.height = `${height}px`;
    msg.textContent =
      this._error ?? (this._layout ? "" : "Loading floor plan…");
    msg.style.display = msg.textContent ? "" : "none";
    plan.style.display = this._layout ? "" : "none";
    if (!this._layout || !customElements.get("floorplan-canvas")) return;

    if (!this._canvas) {
      this._canvas = document.createElement(
        "floorplan-canvas",
      ) as unknown as CanvasElement;
      this._canvas.addEventListener("plan-tap", this._onTap as EventListener);
      this._canvas.addEventListener(
        "overlay-toggle",
        this._onOverlayToggle as EventListener,
      );
      plan.appendChild(this._canvas);
    }
    const c = this._canvas;
    const l = this._layout;
    const cfg = this._config;
    c["readOnly"] = true;
    c["mode"] = "select";
    c["dark"] = this._hass?.themes?.darkMode ?? false;
    c["rooms"] = l.rooms;
    c["walls"] = l.walls;
    c["openings"] = l.openings;
    c["furniture"] = l.furniture;
    c["pins"] = cfg.show_devices === false ? [] : l.pins;
    c["scale"] = l.scale;
    c["entityLookup"] = this._entities;
    c["backgroundImageUrl"] =
      cfg.show_background === false || !l.background_image_id
        ? null
        : `/api/image/serve/${l.background_image_id}/original`;
    c["backgroundOpacity"] = l.background_opacity;
    c["backgroundOffsetX"] = l.background_offset_x;
    c["backgroundOffsetY"] = l.background_offset_y;
    c["backgroundScale"] = l.background_scale;
    c["initialViewBox"] = l.view_box;
    c["overlayButtons"] = cfg.show_controls !== false;
    c["showFurniture"] = this._overlays.furniture;
    c["showLights"] = this._overlays.lights;
    c["showCovers"] = this._overlays.covers;
    c["northDeg"] = l.north_deg ?? null;
    const conf = this._hass?.config;
    c["location"] =
      typeof conf?.latitude === "number" && typeof conf.longitude === "number"
        ? { latitude: conf.latitude, longitude: conf.longitude }
        : null;
    this._liveSig = "";
    this._applyLive();
  }

  /** Pushes live light/cover/pin state to the canvas when it changed. */
  private _applyLive(): void {
    const hass = this._hass;
    const c = this._canvas;
    const l = this._layout;
    if (!hass || !c || !l) return;
    const lights = computeRoomLights(l.rooms, hass);
    const covers = computeCoverOpenness(l.openings, hass);
    const pins = computePinColors(l.pins, hass);
    const items = computeItemStates(l.furniture, hass);
    const sig = liveSignature(lights, covers, pins, items);
    if (sig === this._liveSig) return;
    this._liveSig = sig;
    this._roomLights = lights;
    c["roomLights"] = lights;
    c["coverOpenness"] = covers;
    c["pinColors"] = pins;
    c["itemStates"] = items;
  }

  private _onOverlayToggle = (
    e: CustomEvent<{ key: "furniture" | "lights" | "covers" }>,
  ) => {
    this._overlays[e.detail.key] = !this._overlays[e.detail.key];
    this._render();
  };

  private _moreInfo(entityId: string): void {
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _onTap = (e: CustomEvent<{ kind: string; id: string }>) => {
    const hass = this._hass;
    const l = this._layout;
    if (!hass || !l) return;
    const cfg = this._config;
    if (e.detail.kind === "room") {
      const action = cfg.room_tap_action ?? "toggle";
      const light = this._roomLights.get(e.detail.id);
      if (!light || action === "none") return;
      if (action === "more-info") {
        if (light.entityIds[0]) this._moreInfo(light.entityIds[0]);
        return;
      }
      void hass.callService?.(
        "light",
        light.on > 0 ? "turn_off" : "turn_on",
        {},
        { entity_id: light.entityIds },
      );
    } else if (e.detail.kind === "opening") {
      const opening = l.openings.find((o) => o.id === e.detail.id);
      const cover = opening?.cover_entity_id;
      const action = cfg.cover_tap_action ?? "more-info";
      if (!cover || action === "none") return;
      if (action === "toggle") {
        const open = coverOpenness(hass, cover);
        void hass.callService?.(
          "cover",
          open !== null && open > 0 ? "close_cover" : "open_cover",
          {},
          { entity_id: cover },
        );
      } else {
        this._moreInfo(cover);
      }
    } else if (e.detail.kind === "furniture") {
      const entity = l.furniture.find((f) => f.id === e.detail.id)?.entity_id;
      const action = cfg.item_tap_action ?? "toggle";
      if (!entity || action === "none") return;
      if (action === "toggle" && isToggleable(entity)) {
        void hass.callService?.(
          "homeassistant",
          "toggle",
          {},
          {
            entity_id: entity,
          },
        );
      } else {
        this._moreInfo(entity);
      }
    } else if (e.detail.kind === "pin") {
      if ((cfg.device_tap_action ?? "more-info") === "none") return;
      const pin = l.pins.find((p) => p.id === e.detail.id);
      const entity = pin?.device_id
        ? primaryEntityForDevice(hass, pin.device_id)
        : null;
      if (entity) this._moreInfo(entity);
    }
  };
}

/** The card's visual editor: floor, title, height, what to show, and what
 * a tap on a room or cover does. */
class SpatialContextCardEditor extends HTMLElement {
  private _config: SpatialContextCardConfig = { type: "" };
  private _hass?: HomeAssistant;
  private _floors: FloorMeta[] = [];

  setConfig(config: SpatialContextCardConfig): void {
    this._config = config;
    this._render();
  }

  set hass(hass: HomeAssistant) {
    const first = !this._hass;
    this._hass = hass;
    if (first) {
      void listFloors(hass)
        .then((floors) => {
          this._floors = floors;
          this._render();
        })
        .catch(() => {});
    }
  }

  private _set(patch: Partial<SpatialContextCardConfig>): void {
    this._config = { ...this._config, ...patch };
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === "") {
        delete (this._config as unknown as Record<string, unknown>)[key];
      }
    }
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _render(): void {
    const c = this._config;
    const toggles: [keyof SpatialContextCardConfig, string][] = [
      ["show_lights", "Live lights"],
      ["show_covers", "Cover shading"],
      ["show_furniture", "Furniture"],
      ["show_devices", "Devices"],
      ["show_background", "Background image"],
      ["show_controls", "Zoom & overlay buttons"],
    ];
    const option = (
      value: string,
      label: string,
      current: string | undefined,
    ) =>
      `<option value="${value}" ${current === value ? "selected" : ""}>${label}</option>`;
    this.innerHTML = `
      <style>
        .row { display: flex; align-items: center; gap: 12px; margin: 8px 0; }
        .row label { flex: 1; }
        select, input[type=text], input[type=number] { flex: 1; padding: 6px; }
      </style>
      <div class="row"><label>Floor</label><select data-key="floor_id">
        ${option("", "First floor with a plan", c.floor_id)}
        ${this._floors.map((f) => option(f.floor_id, f.name, c.floor_id)).join("")}
      </select></div>
      <div class="row"><label>Title</label><input type="text" data-key="title" value="${c.title ?? ""}" placeholder="Floor name"></div>
      <div class="row"><label>Height (px)</label><input type="number" data-key="height" min="150" step="10" value="${c.height ?? 400}"></div>
      ${toggles
        .map(
          ([key, label]) =>
            `<div class="row"><label>${label}</label><input type="checkbox" data-bool="${key}" ${c[key] === false ? "" : "checked"}></div>`,
        )
        .join("")}
      <div class="row"><label>Tap a room</label><select data-key="room_tap_action">
        ${option("toggle", "Toggle its lights", c.room_tap_action ?? "toggle")}
        ${option("more-info", "Open a light's details", c.room_tap_action)}
        ${option("none", "Nothing", c.room_tap_action)}
      </select></div>
      <div class="row"><label>Tap a linked item (lamp, TV…)</label><select data-key="item_tap_action">
        ${option("toggle", "Toggle it", c.item_tap_action ?? "toggle")}
        ${option("more-info", "Open its details", c.item_tap_action)}
        ${option("none", "Nothing", c.item_tap_action)}
      </select></div>
      <div class="row"><label>Tap a covered window/door</label><select data-key="cover_tap_action">
        ${option("more-info", "Open the cover's details", c.cover_tap_action ?? "more-info")}
        ${option("toggle", "Open / close it", c.cover_tap_action)}
        ${option("none", "Nothing", c.cover_tap_action)}
      </select></div>`;
    this.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      "[data-key]",
    ).forEach((el) =>
      el.addEventListener("change", () => {
        const key = el.dataset["key"] as keyof SpatialContextCardConfig;
        const raw = el.value;
        this._set({
          [key]:
            key === "height"
              ? raw
                ? Number(raw)
                : undefined
              : raw || undefined,
        });
      }),
    );
    this.querySelectorAll<HTMLInputElement>("[data-bool]").forEach((el) =>
      el.addEventListener("change", () => {
        const key = el.dataset["bool"] as keyof SpatialContextCardConfig;
        this._set({ [key]: el.checked ? undefined : false });
      }),
    );
  }
}

if (!customElements.get("spatial-context-card")) {
  customElements.define("spatial-context-card", SpatialContextCard);
}
if (!customElements.get("spatial-context-card-editor")) {
  customElements.define(
    "spatial-context-card-editor",
    SpatialContextCardEditor,
  );
}

const cards = ((
  window as unknown as { customCards?: unknown[] }
).customCards ??= []);
if (
  !cards.some((c) => (c as { type?: string }).type === "spatial-context-card")
) {
  cards.push({
    type: "spatial-context-card",
    name: "Spatial Context floor plan",
    description:
      "A live floor plan: rooms lit by their lights, cover shading, furniture and devices.",
    preview: false,
    documentationURL: "https://github.com/Greminn/ha-spatial-context",
  });
}
