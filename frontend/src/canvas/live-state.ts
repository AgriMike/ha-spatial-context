/** Live entity state for the floor plan: which lights a room shows (its own
 * HA area, plus whatever it's linked to — see Room.linked_*), how open each
 * cover hung in a door/window is, and a status colour for device pins.
 * Pure functions of `hass`, shared by the panel and the dashboard card. */

import type {
  FurnitureItem,
  HomeAssistant,
  Opening,
  Pin,
  Room,
} from "../types";
import { SHADE_COLOR } from "./sun";

export interface RoomLight {
  /** Light entities the room follows. */
  entityIds: string[];
  on: number;
  /** 0–1: mean brightness across all of them (an off light counts as 0). */
  level: number;
  /** Mean colour of the lights that are on, #rrggbb. */
  color: string;
  /** Some are unavailable/unknown. */
  unavailable: number;
}

const WARM_WHITE: [number, number, number] = [255, 196, 107]; // 2700 K

/** A light entity that stands for several others — a Hue room or zone,
 * an HA light group — rather than one fixture. Counting it as well as its
 * members would count those lights twice. */
export function isLightGroup(attrs: Record<string, unknown>): boolean {
  if (attrs["is_hue_group"] === true) return true;
  const hueType = attrs["hue_type"];
  if (hueType === "room" || hueType === "zone") return true;
  const members = attrs["entity_id"];
  return Array.isArray(members) && members.length > 0;
}

/** Every light fixture in each area, by the entity's own area or its
 * device's (light groups left out). */
function lightsByArea(hass: HomeAssistant): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const id of Object.keys(hass.states)) {
    if (!id.startsWith("light.")) continue;
    if (isLightGroup(hass.states[id]?.attributes ?? {})) continue;
    const entry = hass.entities?.[id];
    const area =
      entry?.area_id ??
      (entry?.device_id ? hass.devices?.[entry.device_id]?.area_id : null) ??
      null;
    if (!area) continue;
    const list = out.get(area);
    if (list) list.push(id);
    else out.set(area, [id]);
  }
  return out;
}

/** The light entities a room follows: its area's, its linked areas', its
 * own picked lights — and the same for each linked room (one level, so
 * two rooms linked to each other don't loop) — less the ones it
 * excludes. */
export function roomLightEntityIds(
  room: Room,
  rooms: Room[],
  byArea: Map<string, string[]>,
): string[] {
  const ids = new Set<string>();
  const add = (r: Room) => {
    for (const area of [r.area_id, ...(r.linked_area_ids ?? [])]) {
      if (area) for (const id of byArea.get(area) ?? []) ids.add(id);
    }
    for (const id of r.light_entity_ids ?? []) ids.add(id);
  };
  add(room);
  for (const linkedId of room.linked_room_ids ?? []) {
    const linked = rooms.find((r) => r.id === linkedId);
    if (linked && linked.id !== room.id) add(linked);
  }
  for (const id of room.excluded_light_ids ?? []) ids.delete(id);
  return [...ids];
}

function toHex([r, g, b]: [number, number, number]): string {
  const h = (v: number) =>
    Math.round(Math.max(0, Math.min(255, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** White-temperature tints, warm amber through cream to a faint cool
 * white — the same palette as the home-flat dashboard's mh-tile card, so
 * a lamp on the plan matches its tile. HA's own rgb_color for a cool white
 * is near-pure white, which would vanish against a light plan. */
const CT: [number, string][] = [
  [2000, "#FFA24A"],
  [2700, "#FFC46B"],
  [3500, "#FFD38F"],
  [4200, "#FFE2B3"],
  [5000, "#EBEFF6"],
  [5700, "#E2E9F4"],
  [6500, "#D6E0F1"],
];

function fromHex(h: string): [number, number, number] {
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ];
}

function ctColor(kelvin: number): [number, number, number] {
  const first = CT[0]!;
  if (kelvin <= first[0]) return fromHex(first[1]);
  for (let i = 1; i < CT.length; i++) {
    const [k1, c1] = CT[i - 1]!;
    const [k2, c2] = CT[i]!;
    if (kelvin <= k2) {
      const a = fromHex(c1);
      const b = fromHex(c2);
      const t = (kelvin - k1) / (k2 - k1);
      return [0, 1, 2].map((j) => a[j]! + (b[j]! - a[j]!) * t) as [
        number,
        number,
        number,
      ];
    }
  }
  return fromHex(CT[CT.length - 1]![1]);
}

/** A light's colour as the mh-tile card shows it: its white temperature
 * in color_temp mode, else its rgb colour lifted 30% toward white, else
 * a plain warm white. */
function lightColor(attrs: Record<string, unknown>): [number, number, number] {
  const kelvin =
    typeof attrs["color_temp_kelvin"] === "number"
      ? (attrs["color_temp_kelvin"] as number)
      : typeof attrs["color_temp"] === "number"
        ? 1e6 / (attrs["color_temp"] as number)
        : null;
  if (attrs["color_mode"] === "color_temp" && kelvin) return ctColor(kelvin);
  const rgb = attrs["rgb_color"];
  if (
    Array.isArray(rgb) &&
    rgb.length === 3 &&
    rgb.every((v) => typeof v === "number")
  ) {
    const [r, g, b] = rgb as [number, number, number];
    return [r * 0.7 + 255 * 0.3, g * 0.7 + 255 * 0.3, b * 0.7 + 255 * 0.3];
  }
  if (kelvin) return ctColor(kelvin);
  return WARM_WHITE;
}

export function computeRoomLights(
  rooms: Room[],
  hass: HomeAssistant | undefined,
): Map<string, RoomLight> {
  const out = new Map<string, RoomLight>();
  if (!hass) return out;
  const byArea = lightsByArea(hass);
  for (const room of rooms) {
    const entityIds = roomLightEntityIds(room, rooms, byArea);
    if (entityIds.length === 0) continue;
    let on = 0;
    let unavailable = 0;
    let levelSum = 0;
    const colorSum: [number, number, number] = [0, 0, 0];
    for (const id of entityIds) {
      const st = hass.states[id];
      if (!st || st.state === "unavailable" || st.state === "unknown") {
        unavailable++;
        continue;
      }
      if (st.state !== "on") continue;
      on++;
      const brightness = st.attributes["brightness"];
      levelSum += typeof brightness === "number" ? brightness / 255 : 1;
      const c = lightColor(st.attributes);
      colorSum[0] += c[0];
      colorSum[1] += c[1];
      colorSum[2] += c[2];
    }
    out.set(room.id, {
      entityIds,
      on,
      unavailable,
      level: entityIds.length ? levelSum / entityIds.length : 0,
      color: on
        ? toHex([colorSum[0] / on, colorSum[1] / on, colorSum[2] / on])
        : toHex(WARM_WHITE),
    });
  }
  return out;
}

/** How open each cover hung in an opening is: 0 closed … 1 fully open, or
 * null when unavailable. From current_position when the cover reports one,
 * else its tilt, else its open/closed state. */
export function computeCoverOpenness(
  openings: Opening[],
  hass: HomeAssistant | undefined,
): Map<string, number | null> {
  const out = new Map<string, number | null>();
  if (!hass) return out;
  for (const opening of openings) {
    const id = opening.cover_entity_id;
    if (id) out.set(opening.id, coverOpenness(hass, id));
    // A second (right-half) cover is keyed "<opening id>:right".
    const right = opening.cover_right_entity_id;
    if (right) out.set(`${opening.id}:right`, coverOpenness(hass, right));
  }
  return out;
}

export function coverOpenness(
  hass: HomeAssistant,
  entityId: string,
): number | null {
  const st = hass.states[entityId];
  if (!st || st.state === "unavailable" || st.state === "unknown") return null;
  const position = st.attributes["current_position"];
  if (typeof position === "number")
    return Math.max(0, Math.min(1, position / 100));
  const tilt = st.attributes["current_tilt_position"];
  if (typeof tilt === "number") return Math.max(0, Math.min(1, tilt / 100));
  return st.state === "open" || st.state === "opening" ? 1 : 0;
}

/** Which entity speaks for a device's live status, by domain priority. */
const STATUS_DOMAINS = [
  "light",
  "switch",
  "fan",
  "cover",
  "lock",
  "media_player",
  "climate",
  "binary_sensor",
  "vacuum",
];

/** A status colour per pin whose device is doing something worth showing
 * (a light on, a door open, motion detected…) — pins not listed keep their
 * normal colour. */
export function computePinColors(
  pins: Pin[],
  hass: HomeAssistant | undefined,
): Map<string, string> {
  const out = new Map<string, string>();
  if (!hass?.entities) return out;
  const byDevice = new Map<string, string[]>();
  for (const [id, entry] of Object.entries(hass.entities)) {
    const device = entry?.device_id;
    if (!device) continue;
    const list = byDevice.get(device);
    if (list) list.push(id);
    else byDevice.set(device, [id]);
  }
  for (const pin of pins) {
    if (!pin.device_id) continue;
    const primary = statusEntity(byDevice.get(pin.device_id) ?? []);
    if (!primary) continue;
    const st = hass.states[primary];
    if (!st) continue;
    const color = statusColor(
      primary.split(".")[0]!,
      st.state ?? "",
      st.attributes,
    );
    if (color) out.set(pin.id, color);
  }
  return out;
}

function statusEntity(ids: string[]): string | undefined {
  return STATUS_DOMAINS.map((domain) =>
    ids.find((id) => id.startsWith(`${domain}.`)),
  ).find(Boolean);
}

/** The entity a tap on a device should open: its status entity (see
 * STATUS_DOMAINS), else its first entity. */
export function primaryEntityForDevice(
  hass: HomeAssistant,
  deviceId: string,
): string | null {
  const ids = Object.entries(hass.entities ?? {})
    .filter(([, entry]) => entry?.device_id === deviceId)
    .map(([id]) => id);
  return statusEntity(ids) ?? ids[0] ?? null;
}

function statusColor(
  domain: string,
  state: string,
  attrs: Record<string, unknown>,
): string | null {
  if (state === "unavailable") return "#9e9e9e";
  switch (domain) {
    case "light":
      return state === "on" ? toHex(lightColor(attrs)) : null;
    case "switch":
    case "fan":
      return state === "on" ? "#ffb300" : null;
    case "cover":
      return state === "open" || state === "opening" ? "#42a5f5" : null;
    case "lock":
      return state === "unlocked" || state === "open" ? "#ef5350" : null;
    case "media_player":
      return state === "playing" ? "#ab47bc" : null;
    case "climate":
      return state !== "off" ? "#ff7043" : null;
    case "binary_sensor":
      return state === "on" ? "#ef5350" : null;
    case "vacuum":
      return state === "cleaning" ? "#26a69a" : null;
    default:
      return null;
  }
}

/** A stable string for a set of live maps, so callers can skip re-rendering
 * when nothing visible changed. */
/** A linked furniture item's live look (see FurnitureItem.entity_id). */
export interface ItemState {
  /** Colour to draw the item in while active; null leaves its own. */
  color: string | null;
  /** 0–1 glow around it: a light's brightness, a fixed glow for other
   * active things, 0 for none. */
  glow: number;
  active: boolean;
  unavailable: boolean;
  /** The state in words, for its tooltip and label ("on · 70%"). */
  text: string;
}

const ENTITY_GLOW: Record<string, number> = {
  switch: 0.45,
  fan: 0.35,
  input_boolean: 0.35,
  media_player: 0.4,
  climate: 0.4,
};

export function itemState(hass: HomeAssistant, entityId: string): ItemState {
  const st = hass.states[entityId];
  const domain = entityId.split(".")[0] ?? "";
  if (!st || st.state === "unavailable" || st.state === "unknown") {
    return {
      color: null,
      glow: 0,
      active: false,
      unavailable: true,
      text: st?.state ?? "unavailable",
    };
  }
  const state = st.state ?? "";
  const attrs = st.attributes;
  let text = state;
  let color: string | null =
    domain === "input_boolean"
      ? state === "on"
        ? "#ffb300"
        : null
      : statusColor(domain, state, attrs);
  let glow = color ? (ENTITY_GLOW[domain] ?? 0) : 0;
  if (domain === "light" && state === "on") {
    const brightness = attrs["brightness"];
    const level = typeof brightness === "number" ? brightness / 255 : 1;
    glow = Math.max(0.25, level);
    text = `on · ${Math.round(level * 100)}%`;
  } else if (domain === "cover") {
    const open = coverOpenness(hass, entityId);
    if (open !== null && typeof attrs["current_position"] === "number")
      text = `${state} · ${Math.round(open * 100)}%`;
  } else if (domain === "sensor") {
    const unit = attrs["unit_of_measurement"];
    text = typeof unit === "string" ? `${state} ${unit}` : state;
    color = null;
  }
  return { color, glow, active: color !== null, unavailable: false, text };
}

export function computeItemStates(
  items: FurnitureItem[],
  hass: HomeAssistant | undefined,
): Map<string, ItemState> {
  const out = new Map<string, ItemState>();
  if (!hass) return out;
  for (const item of items) {
    if (item.entity_id) out.set(item.id, itemState(hass, item.entity_id));
  }
  return out;
}

/** What a tap on a linked item does by default: toggle what can be
 * toggled, show details for the rest. */
export function isToggleable(entityId: string): boolean {
  return [
    "light",
    "switch",
    "fan",
    "input_boolean",
    "cover",
    "media_player",
  ].includes(entityId.split(".")[0] ?? "");
}

export function liveSignature(
  lights: Map<string, RoomLight>,
  covers: Map<string, number | null>,
  pins: Map<string, string>,
  items: Map<string, ItemState> = new Map(),
): string {
  const parts: string[] = [];
  for (const [id, s] of items)
    parts.push(`${id}:${s.color}:${s.glow.toFixed(2)}:${s.text}`);
  for (const [id, l] of lights)
    parts.push(
      `${id}:${l.on}:${l.level.toFixed(2)}:${l.color}:${l.unavailable}:${l.entityIds.length}`,
    );
  for (const [id, o] of covers)
    parts.push(`${id}:${o === null ? "x" : o.toFixed(2)}`);
  for (const [id, c] of pins) parts.push(`${id}:${c}`);
  return parts.join("|");
}

/** `a` blended toward `b` by `t` (0 = a, 1 = b); #rrggbb in and out. */
export function mixHex(a: string, b: string, t: number): string {
  const parse = (h: string) => {
    const m = /^#?([0-9a-f]{6})$/i.exec(h.trim());
    const n = m ? parseInt(m[1] ?? "0", 16) : 0;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const ca = parse(a);
  const cb = parse(b);
  return `#${ca
    .map((v, i) =>
      Math.round(v + ((cb[i] ?? 0) - v) * t)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** A room's fill right now (floor plan and 3D view alike): its own colour
 * — with live lights, tinted toward theirs and stronger while any is on,
 * darkened while they're all off. */
export function roomFillStyle(
  own: string,
  opacity: number,
  light: RoomLight | undefined,
  dark: boolean,
): { color: string; opacity: number } {
  // Lit: still the room's own colour, tinted toward the lights' colour
  // and stronger with their brightness — near-white lights would
  // otherwise wash the room's colour out entirely.
  if (light && light.on > 0) {
    const level = Math.min(1, light.level);
    return {
      color: mixHex(own, light.color, 0.3),
      opacity: Math.min(0.85, opacity * (1 + 0.6 * level)),
    };
  }
  if (light && light.unavailable < light.entityIds.length) {
    return {
      color: mixHex(own, dark ? "#000000" : SHADE_COLOR, 0.55),
      opacity: Math.max(opacity, dark ? 0.45 : 0.3),
    };
  }
  return { color: own, opacity };
}
