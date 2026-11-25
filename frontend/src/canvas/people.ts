/** People on the plan, from Bermuda BLE Trilateration
 * (https://github.com/agittins/bermuda). Bermuda knows which HA area each
 * tracked Bluetooth device is in (its "Area" sensor), the device's
 * distance to the nearest Bluetooth proxy and that proxy's name — not
 * x/y. So a person is drawn in the room traced for their area, and moved
 * toward the proxy's pin by the reported distance when that proxy is
 * placed in the room.
 *
 * Several devices can belong to one person (a watch and a phone): the
 * person is drawn once, where the device that moved most recently says
 * they are — a phone left on a desk stops changing room, the watch on
 * their wrist doesn't.
 *
 * Pure functions of `hass`, shared by the panel and the dashboard card. */

import type { HomeAssistant, Pin, Room } from "../types";

/** Even-odd point-in-polygon (geometry.ts has one too, but importing it
 * would pull polylabel into the dashboard card's bundle). */
function inside(x: number, y: number, points: [number, number][]): boolean {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i]!;
    const [xj, yj] = points[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      hit = !hit;
    }
  }
  return hit;
}

/** One device Bermuda tracks. */
export interface BermudaDevice {
  /** HA device id (or the Area sensor's entity id when it has none). */
  id: string;
  name: string;
  /** The device's Area sensor (sensor.*_area). */
  areaEntityId: string;
  /** Its Bermuda device_tracker, if enabled. */
  trackerEntityId: string | null;
  /** Null while Bermuda can't see it (away, or out of range). */
  areaId: string | null;
  areaName: string | null;
  /** When it last changed room, ms since epoch. */
  changedAt: number;
  /** Distance to the nearest proxy, metres. */
  distanceM: number | null;
  /** The nearest proxy's device name (without a Bluetooth adapter's MAC
   * suffix). */
  scanner: string | null;
}

/** Who a Bermuda device stands for (Settings → People): a person entity,
 * the device itself, or nobody. Absent = automatic. */
export type PeopleDeviceChoice = "self" | "hidden" | `person.${string}`;

/** A person to draw on one floor's plan. Where exactly is the canvas's
 * call (it knows the room's label position and size, and the zoom). */
export interface PersonOnPlan {
  /** The person entity id, or `bermuda:<device id>` for a device shown as
   * itself. */
  key: string;
  name: string;
  /** Under the marker: a person's first name, a device's own name. */
  shortName: string;
  initials: string;
  color: string;
  /** The person's picture (HA's entity_picture), if they have one. */
  picture: string | null;
  /** What a tap opens: the person entity, else the device's Area sensor. */
  entityId: string;
  roomId: string;
  areaName: string;
  /** The nearest proxy's pin when it's in this room, and how far from it
   * the device is (metres, rounded to a quarter metre). */
  proxy: { x: number; y: number; name: string } | null;
  distanceM: number | null;
  /** The device it's placed by, then the person's other devices. */
  devices: BermudaDevice[];
}

const AWAY_STATES = new Set(["unknown", "unavailable", "", "none"]);

/** Metres per unit HA reports a distance sensor in. */
const TO_METRES: Record<string, number> = {
  m: 1,
  cm: 0.01,
  mm: 0.001,
  km: 1000,
  ft: 0.3048,
  in: 0.0254,
  yd: 0.9144,
  mi: 1609.344,
};

type StateObj = NonNullable<HomeAssistant["states"][string]>;

function isBermuda(hass: HomeAssistant, entityId: string, s: StateObj) {
  const platform = hass.entities?.[entityId]?.platform;
  if (platform) return platform === "bermuda";
  // No registry platform to go by (an old frontend): Bermuda's sensors
  // are the ones carrying the device's current MAC.
  return "current_mac" in s.attributes;
}

/** A device name without the " (AA:BB:CC:DD:EE:FF)" HA adds to a
 * Bluetooth adapter's. */
function bareName(name: string): string {
  return name.replace(/\s*\((?:[0-9a-f]{2}[:-]){5}[0-9a-f]{2}\)\s*$/i, "");
}

function deviceName(hass: HomeAssistant, deviceId: string | null) {
  if (!deviceId) return null;
  const d = hass.devices?.[deviceId];
  return d?.name_by_user || d?.name || null;
}

/** Every device Bermuda tracks, seen or not, sorted by name. */
export function bermudaDevices(hass: HomeAssistant): BermudaDevice[] {
  const area = new Map<string, [string, StateObj, number]>();
  const distance = new Map<string, [string, StateObj][]>();
  const tracker = new Map<string, [string, StateObj]>();
  for (const [id, s] of Object.entries(hass.states)) {
    if (!s) continue;
    const isSensor = id.startsWith("sensor.");
    const isTracker = id.startsWith("device_tracker.");
    if (!isSensor && !isTracker) continue;
    if (!isBermuda(hass, id, s)) continue;
    const a = s.attributes;
    // A device's sensors share its device id — or, without the registry
    // to say so, the MAC Bermuda last saw it at.
    const mac = a["current_mac"];
    const key =
      hass.entities?.[id]?.device_id ??
      (typeof mac === "string" && mac ? `mac:${mac}` : null);
    if (isTracker) {
      if (key) tracker.set(key, [id, s]);
      continue;
    }
    if ("area_id" in a && "floor_id" in a) {
      // The Area and Floor sensors carry the same attributes; the Area
      // sensor's state is the area's name (and its id ends in _area).
      const k = key ?? id;
      const score =
        (s.state === a["area_name"] ? 2 : 0) + (id.endsWith("_area") ? 1 : 0);
      if (score > (area.get(k)?.[2] ?? -1)) area.set(k, [id, s, score]);
    } else if (a["device_class"] === "distance" && key) {
      const list = distance.get(key) ?? [];
      list.push([id, s]);
      distance.set(key, list);
    }
  }
  const out: BermudaDevice[] = [];
  for (const [key, [areaId, s]] of area) {
    const deviceId = hass.entities?.[areaId]?.device_id ?? null;
    const a = s.attributes;
    const dists = distance.get(key) ?? [];
    const trk = tracker.get(key);
    const seen =
      typeof a["area_id"] === "string" &&
      !!a["area_id"] &&
      !AWAY_STATES.has(String(s.state ?? "").toLowerCase());
    // The device's own distance sensor, not a per-proxy "Distance to …"
    // one (disabled by default, but some turn them on).
    const dist =
      dists.find(([id]) => id.endsWith("_distance")) ??
      dists.find(
        ([, d]) => !/ to /i.test(String(d.attributes["friendly_name"] ?? "")),
      );
    let distanceM: number | null = null;
    if (dist) {
      const v = parseFloat(String(dist[1].state));
      const unit = String(dist[1].attributes["unit_of_measurement"] ?? "m");
      if (Number.isFinite(v)) distanceM = v * (TO_METRES[unit] ?? 1);
    }
    const friendly = String(a["friendly_name"] ?? areaId).replace(
      / area$/i,
      "",
    );
    const changed = Date.parse(String(s.last_changed ?? ""));
    out.push({
      id: key,
      name: deviceName(hass, deviceId) ?? friendly,
      areaEntityId: areaId,
      trackerEntityId: trk?.[0] ?? null,
      areaId: seen ? String(a["area_id"]) : null,
      areaName: seen ? String(a["area_name"] ?? s.state) : null,
      changedAt: Number.isFinite(changed) ? changed : 0,
      distanceM,
      scanner:
        typeof trk?.[1].attributes["scanner"] === "string"
          ? bareName(trk[1].attributes["scanner"] as string)
          : null,
    });
  }
  return out.sort((x, y) => x.name.localeCompare(y.name));
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** The person a device belongs to when nobody has said: the person whose
 * device trackers include its Bermuda tracker, else the person whose
 * first name is a word of the device's name ("Mike Watch", "Allie's
 * iPhone" → Mike, Allie). Null = no one. */
export function autoPersonFor(
  device: BermudaDevice,
  hass: HomeAssistant,
): string | null {
  const people = Object.entries(hass.states).filter(([id]) =>
    id.startsWith("person."),
  );
  for (const [id, s] of people) {
    const trackers = s?.attributes["device_trackers"];
    if (
      device.trackerEntityId &&
      Array.isArray(trackers) &&
      trackers.includes(device.trackerEntityId)
    ) {
      return id;
    }
  }
  const words = new Set(
    device.name
      .toLowerCase()
      .replace(/['’]s\b/g, "")
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean),
  );
  for (const [id, s] of people) {
    const name = String(s?.attributes["friendly_name"] ?? "");
    const first = firstName(name).toLowerCase();
    if (first.length >= 2 && words.has(first)) return id;
  }
  return null;
}

/** Who a device is shown as: a person entity id, "self", or "hidden". */
export function shownAs(
  device: BermudaDevice,
  hass: HomeAssistant,
  choices: Record<string, string> | undefined,
): string {
  const choice = choices?.[device.id];
  if (choice === "self" || choice === "hidden") return choice;
  if (choice?.startsWith("person.") && hass.states[choice]) return choice;
  return autoPersonFor(device, hass) ?? "self";
}

/** Colours for people without a picture — dark enough for white initials,
 * picked by the person so each keeps theirs. */
const PALETTE = [
  "#1d6fd1",
  "#c2410c",
  "#7c3aab",
  "#0d7f73",
  "#be185d",
  "#2f855a",
  "#3e63dd",
  "#0e7490",
];

function colorFor(key: string): string {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length]!;
}

function initialsOf(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => /\p{L}|\p{N}/u.test(w));
  const letters = words
    .slice(0, 2)
    .map((w) => [...w.replace(/[^\p{L}\p{N}]/gu, "")][0] ?? "");
  return letters.join("").toUpperCase() || "?";
}

function polygonArea(points: [number, number][]): number {
  let a = 0;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    a += (points[j]![0] + points[i]![0]) * (points[j]![1] - points[i]![1]);
  }
  return Math.abs(a / 2);
}

/** The people to draw on a floor: each one Bermuda places in an area that
 * has a room traced here. Someone whose person entity says they're away
 * isn't drawn, whatever a phone left at home says. */
export function computePeople(
  rooms: Room[],
  pins: Pin[],
  hass: HomeAssistant,
  choices: Record<string, string> | undefined,
): PersonOnPlan[] {
  const groups = new Map<string, BermudaDevice[]>();
  for (const device of bermudaDevices(hass)) {
    const as = shownAs(device, hass, choices);
    if (as === "hidden") continue;
    const key = as === "self" ? `bermuda:${device.id}` : as;
    const list = groups.get(key) ?? [];
    list.push(device);
    groups.set(key, list);
  }
  const out: PersonOnPlan[] = [];
  for (const [key, devices] of groups) {
    const person = key.startsWith("person.") ? hass.states[key] : undefined;
    const state = String(person?.state ?? "").toLowerCase();
    if (person && state && state !== "home" && !AWAY_STATES.has(state)) {
      continue;
    }
    const seen = devices
      .filter((d) => d.areaId)
      .sort(
        (a, b) =>
          b.changedAt - a.changedAt ||
          (a.distanceM ?? Infinity) - (b.distanceM ?? Infinity),
      );
    const best = seen[0];
    if (!best) continue;
    const candidates = rooms.filter(
      (r) => r.area_id === best.areaId && r.points.length >= 3,
    );
    if (candidates.length === 0) continue;
    // The proxy's pin, when it's placed in one of the area's rooms.
    // HA keeps two devices for an ESPHome proxy, "Office Proxy" and its
    // Bluetooth adapter "Office Proxy (AA:BB:…)"; either may be the one
    // placed.
    const proxyIds = new Set<string>();
    if (best.scanner) {
      for (const [id, d] of Object.entries(hass.devices ?? {})) {
        if (bareName(d?.name_by_user || d?.name || "") === best.scanner) {
          proxyIds.add(id);
        }
      }
    }
    let room: Room | undefined;
    let proxy: Pin | undefined;
    for (const r of candidates) {
      proxy = pins.find(
        (p) =>
          !!p.device_id &&
          proxyIds.has(p.device_id) &&
          inside(p.x, p.y, r.points),
      );
      if (proxy) {
        room = r;
        break;
      }
    }
    room ??= candidates.reduce((a, b) =>
      polygonArea(b.points) > polygonArea(a.points) ? b : a,
    );
    const name = person
      ? String(person.attributes["friendly_name"] ?? key)
      : best.name;
    const picture = person?.attributes["entity_picture"];
    out.push({
      key,
      name,
      shortName: person ? firstName(name) : name,
      initials: initialsOf(name),
      color: colorFor(key),
      picture: typeof picture === "string" && picture ? picture : null,
      entityId: person ? key : best.areaEntityId,
      roomId: room.id,
      areaName: best.areaName ?? "",
      proxy:
        proxy && best.distanceM !== null
          ? { x: proxy.x, y: proxy.y, name: best.scanner ?? "" }
          : null,
      // A quarter metre is finer than Bermuda can tell, and redrawing the
      // plan on every centimetre of noise would be wasted work.
      distanceM:
        best.distanceM === null ? null : Math.round(best.distanceM * 4) / 4,
      devices: [best, ...devices.filter((d) => d !== best)],
    });
  }
  return out.sort((a, b) => a.key.localeCompare(b.key));
}

/** What would change how people are drawn — compared before re-rendering. */
export function peopleSignature(people: PersonOnPlan[]): string {
  return people
    .map(
      (p) =>
        `${p.key}@${p.roomId}:${p.proxy ? `${p.proxy.x},${p.proxy.y}` : "-"}:${p.distanceM}:${p.picture ?? ""}:${p.devices
          .map((d) => `${d.id}=${d.areaId}`)
          .join(",")}`,
    )
    .join("|");
}
