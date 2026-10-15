/** A device's icon by what kind of thing it is (from its representative
 * entity's domain and device class) — the default when a device is added
 * from a room's device list — and a handful of alternatives to pick from on
 * its card. All plain Material Design Icons, set as the pin's icon_override,
 * so changing one never touches the device itself. */

import type { PlaceableEntity } from "../types";

const BY_CLASS: Record<string, Record<string, string>> = {
  binary_sensor: {
    motion: "mdi:motion-sensor",
    occupancy: "mdi:motion-sensor",
    presence: "mdi:account-eye",
    door: "mdi:door",
    garage_door: "mdi:garage",
    window: "mdi:window-closed-variant",
    opening: "mdi:door-open",
    moisture: "mdi:water-alert",
    smoke: "mdi:smoke-detector",
    gas: "mdi:gas-cylinder",
    carbon_monoxide: "mdi:molecule-co",
    vibration: "mdi:vibrate",
    sound: "mdi:microphone",
    lock: "mdi:lock",
    plug: "mdi:power-plug",
    battery: "mdi:battery-alert",
  },
  sensor: {
    temperature: "mdi:thermometer",
    humidity: "mdi:water-percent",
    illuminance: "mdi:brightness-5",
    power: "mdi:flash",
    energy: "mdi:lightning-bolt",
    battery: "mdi:battery",
    carbon_dioxide: "mdi:molecule-co2",
    pm25: "mdi:air-filter",
    pressure: "mdi:gauge",
    moisture: "mdi:water",
    signal_strength: "mdi:wifi",
  },
  cover: {
    garage: "mdi:garage",
    gate: "mdi:gate",
    door: "mdi:door",
    window: "mdi:window-shutter",
    blind: "mdi:blinds",
    shade: "mdi:roller-shade",
    curtain: "mdi:curtains",
    shutter: "mdi:window-shutter",
    awning: "mdi:awning-outline",
  },
  media_player: {
    tv: "mdi:television",
    speaker: "mdi:speaker",
    receiver: "mdi:audio-video",
  },
  switch: { outlet: "mdi:power-socket-us" },
};

const BY_DOMAIN: Record<string, string> = {
  light: "mdi:lightbulb",
  switch: "mdi:toggle-switch-variant",
  climate: "mdi:thermostat",
  media_player: "mdi:speaker",
  lock: "mdi:lock",
  cover: "mdi:blinds",
  fan: "mdi:fan",
  vacuum: "mdi:robot-vacuum",
  alarm_control_panel: "mdi:shield-home",
  valve: "mdi:valve",
  humidifier: "mdi:air-humidifier",
  siren: "mdi:alarm-light",
  water_heater: "mdi:water-boiler",
  camera: "mdi:cctv",
  assist_satellite: "mdi:account-voice",
  device_tracker: "mdi:map-marker-radius",
  binary_sensor: "mdi:checkbox-marked-circle-outline",
  sensor: "mdi:gauge",
  button: "mdi:gesture-tap-button",
  update: "mdi:package-up",
};

/** Alternatives offered on a device's card, by domain. */
const ALTERNATIVES: Record<string, string[]> = {
  light: [
    "mdi:lightbulb",
    "mdi:ceiling-light",
    "mdi:lamp",
    "mdi:floor-lamp",
    "mdi:wall-sconce",
    "mdi:led-strip-variant",
    "mdi:light-recessed",
    "mdi:chandelier",
  ],
  switch: [
    "mdi:toggle-switch-variant",
    "mdi:power-socket-us",
    "mdi:light-switch",
    "mdi:power-plug",
    "mdi:fan",
    "mdi:coffee-maker",
  ],
  media_player: [
    "mdi:speaker",
    "mdi:television",
    "mdi:cast",
    "mdi:audio-video",
    "mdi:soundbar",
    "mdi:speaker-wireless",
  ],
  cover: [
    "mdi:blinds",
    "mdi:roller-shade",
    "mdi:curtains",
    "mdi:window-shutter",
    "mdi:garage",
    "mdi:gate",
  ],
  binary_sensor: [
    "mdi:motion-sensor",
    "mdi:door",
    "mdi:window-closed-variant",
    "mdi:water-alert",
    "mdi:smoke-detector",
    "mdi:vibrate",
  ],
  sensor: [
    "mdi:thermometer",
    "mdi:water-percent",
    "mdi:brightness-5",
    "mdi:flash",
    "mdi:gauge",
    "mdi:air-filter",
  ],
  climate: [
    "mdi:thermostat",
    "mdi:air-conditioner",
    "mdi:radiator",
    "mdi:heat-pump",
  ],
  fan: ["mdi:fan", "mdi:ceiling-fan", "mdi:air-purifier"],
};

const GENERIC = [
  "mdi:devices",
  "mdi:chip",
  "mdi:router-wireless",
  "mdi:access-point",
  "mdi:zigbee",
  "mdi:remote",
];

export function deviceTypeIcon(entity: PlaceableEntity | null): string {
  if (!entity) return "mdi:devices";
  const byClass = entity.device_class
    ? BY_CLASS[entity.domain]?.[entity.device_class]
    : undefined;
  return byClass ?? BY_DOMAIN[entity.domain] ?? "mdi:devices";
}

/** Up to eight icons to offer for a device: its type icon first, then its
 * domain's alternatives, then a few generic ones. */
export function deviceIconChoices(entity: PlaceableEntity | null): string[] {
  const first = deviceTypeIcon(entity);
  const list = [
    first,
    ...(entity ? (ALTERNATIVES[entity.domain] ?? []) : []),
    ...GENERIC,
  ];
  return [...new Set(list)].slice(0, 8);
}
