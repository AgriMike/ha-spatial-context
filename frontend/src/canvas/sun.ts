/** Where the sun is, and what its light looks like, for daylight through
 * windows (see floorplan-canvas.ts's _renderDaylight). Computed from Home
 * Assistant's home location and the time; plan directions come from the
 * floor's compass setting (FloorLayout.north_deg). */

const RAD = Math.PI / 180;

export interface SunPosition {
  /** Compass bearing of the sun, degrees clockwise from north. */
  azimuth: number;
  /** Degrees above the horizon (negative at night). */
  elevation: number;
}

/** Low-precision solar position (good to a fraction of a degree, plenty
 * for light on a floor plan). */
export function sunPosition(date: Date, lat: number, lon: number): SunPosition {
  const d = date.getTime() / 86400000 - 10957.5; // days since J2000.0
  const g = (357.529 + 0.98560028 * d) * RAD; // mean anomaly
  const q = 280.459 + 0.98564736 * d; // mean longitude
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  const e = (23.439 - 0.00000036 * d) * RAD; // obliquity
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const gmst = (((18.697374558 + 24.06570982441908 * d) % 24) + 24) % 24;
  const ha = (gmst * 15 + lon) * RAD - ra; // hour angle
  const phi = lat * RAD;
  const elevation = Math.asin(
    Math.sin(phi) * Math.sin(dec) +
      Math.cos(phi) * Math.cos(dec) * Math.cos(ha),
  );
  const azimuth = Math.atan2(
    -Math.sin(ha),
    Math.tan(dec) * Math.cos(phi) - Math.sin(phi) * Math.cos(ha),
  );
  return {
    azimuth: (azimuth / RAD + 360) % 360,
    elevation: elevation / RAD,
  };
}

function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa
    .map((v, i) =>
      Math.round(v + (pb[i]! - v) * Math.max(0, Math.min(1, t)))
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

/** Sunlight colour by height: deep orange at sunrise/sunset, golden low in
 * the sky, near-white at midday. */
export function sunColor(elevation: number): string {
  if (elevation < 4) return mix("#ff7043", "#ff9e40", elevation / 4);
  if (elevation < 12) return mix("#ff9e40", "#ffd180", (elevation - 4) / 8);
  if (elevation < 30) return mix("#ffd180", "#fff3c4", (elevation - 12) / 18);
  return mix("#fff3c4", "#fffbec", (elevation - 30) / 30);
}

/** 0 at night … 1 in full daylight, easing through twilight. */
export function daylight(elevation: number): number {
  return Math.max(0, Math.min(1, (elevation + 4) / 14));
}

const POINTS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
];

/** The 16 compass points with their bearings. */
export const COMPASS_POINTS = POINTS.map((name, i) => ({
  name,
  deg: i * 22.5,
}));

export function compassName(bearing: number): string {
  const i = Math.round((((bearing % 360) + 360) % 360) / 22.5) % 16;
  return POINTS[i]!;
}

/** The compass bearing of a direction on the plan (x right, y down), for a
 * plan whose top faces `northDeg`. */
export function planBearing(dx: number, dy: number, northDeg: number): number {
  return (((Math.atan2(dx, -dy) / RAD + northDeg) % 360) + 360) % 360;
}

/** A unit plan direction (x right, y down) for a compass bearing. */
export function planVector(
  bearing: number,
  northDeg: number,
): [number, number] {
  const a = (bearing - northDeg) * RAD;
  return [Math.sin(a), -Math.cos(a)];
}

/** Cloud cover per HA weather condition, when the entity doesn't report a
 * cloud_coverage percentage. */
const CONDITION_CLOUDS: Record<string, number> = {
  sunny: 0,
  "clear-night": 0,
  windy: 0.2,
  partlycloudy: 0.5,
  "windy-variant": 0.6,
  exceptional: 0.5,
  cloudy: 0.9,
  rainy: 0.9,
  snowy: 0.9,
  lightning: 0.9,
  fog: 0.95,
  hail: 0.95,
  "snowy-rainy": 0.95,
  "lightning-rainy": 0.95,
  pouring: 1,
};

const WET = new Set([
  "rainy",
  "pouring",
  "snowy",
  "snowy-rainy",
  "hail",
  "fog",
  "lightning-rainy",
]);

export interface Sky {
  /** 0 clear … 1 overcast. */
  clouds: number;
  /** The weather entity's condition, e.g. "partlycloudy". */
  condition: string;
}

/** How cloudy it is, from a weather entity: its cloud_coverage when it has
 * one (raised for rain, snow and fog, which block the sun whatever the
 * reported coverage), else its condition. `setting` is the configured
 * entity: null picks one (weather.home / weather.forecast_home, else the
 * first), "none" ignores the weather. Null when there's nothing to go on. */
export function skyFromWeather(
  states: Record<
    string,
    { state?: string; attributes: Record<string, unknown> } | undefined
  >,
  setting: string | null | undefined,
): Sky | null {
  if (setting === "none") return null;
  let id = setting ?? null;
  if (!id) {
    const all = Object.keys(states)
      .filter((e) => e.startsWith("weather."))
      .sort();
    id =
      all.find((e) => e === "weather.home") ??
      all.find((e) => e === "weather.forecast_home") ??
      all[0] ??
      null;
  }
  const st = id ? states[id] : undefined;
  if (!st || !st.state || st.state === "unavailable" || st.state === "unknown")
    return null;
  const condition = st.state;
  const coverage = st.attributes["cloud_coverage"];
  let clouds =
    typeof coverage === "number"
      ? coverage / 100
      : (CONDITION_CLOUDS[condition] ?? 0);
  if (WET.has(condition)) clouds = Math.max(clouds, 0.9);
  return { clouds: Math.max(0, Math.min(1, clouds)), condition };
}

/** Grey-white of light from an overcast sky. */
export function skyColor(clouds: number): string {
  return mix("#fffbe6", "#e6ebef", clouds);
}

/** Sunlight, washed toward grey as clouds thicken. */
export function cloudySunColor(elevation: number, clouds: number): string {
  return mix(sunColor(elevation), "#eef1f3", clouds * 0.7);
}
