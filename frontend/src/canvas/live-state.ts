/** Live entity state for the floor plan: which lights a room shows (its own
 * HA area, plus whatever it's linked to — see Room.linked_*), how open each
 * cover hung in a door/window is, and a status colour for device pins.
 * Pure functions of `hass`, shared by the panel and the dashboard card. */

import type { HomeAssistant, Opening, Pin, Room } from "../types";

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

const WARM_WHITE: [number, number, number] = [255, 205, 120];

/** Every light entity in each area, by the entity's own area or its
 * device's. */
function lightsByArea(hass: HomeAssistant): Map<string, string[]> {
  const out = new Map<string, string[]>();
  for (const id of Object.keys(hass.states)) {
    if (!id.startsWith("light.")) continue;
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
 * two rooms linked to each other don't loop). */
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
  return [...ids];
}

function toHex([r, g, b]: [number, number, number]): string {
  const h = (v: number) =>
    Math.round(Math.max(0, Math.min(255, v)))
      .toString(16)
      .padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function lightColor(attrs: Record<string, unknown>): [number, number, number] {
  const rgb = attrs["rgb_color"];
  if (Array.isArray(rgb) && rgb.length === 3 && rgb.every((v) => typeof v === "number")) {
    return rgb as [number, number, number];
  }
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
    if (!id) continue;
    out.set(opening.id, coverOpenness(hass, id));
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
  if (typeof position === "number") return Math.max(0, Math.min(1, position / 100));
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
    const ids = byDevice.get(pin.device_id) ?? [];
    const primary = STATUS_DOMAINS.map((domain) =>
      ids.find((id) => id.startsWith(`${domain}.`)),
    ).find(Boolean);
    if (!primary) continue;
    const st = hass.states[primary];
    if (!st) continue;
    const color = statusColor(primary.split(".")[0]!, st.state ?? "", st.attributes);
    if (color) out.set(pin.id, color);
  }
  return out;
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
export function liveSignature(
  lights: Map<string, RoomLight>,
  covers: Map<string, number | null>,
  pins: Map<string, string>,
): string {
  const parts: string[] = [];
  for (const [id, l] of lights) parts.push(`${id}:${l.on}:${l.level.toFixed(2)}:${l.color}:${l.unavailable}:${l.entityIds.length}`);
  for (const [id, o] of covers) parts.push(`${id}:${o === null ? "x" : o.toFixed(2)}`);
  for (const [id, c] of pins) parts.push(`${id}:${c}`);
  return parts.join("|");
}
