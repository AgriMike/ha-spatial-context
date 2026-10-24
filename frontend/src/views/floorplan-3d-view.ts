import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { safeCustomElement } from "../define";
import { sharedStyles, switchStyles } from "../styles";
import { localize } from "../i18n";
import {
  HaClient,
  fetchScan,
  groundGridUnsaved,
  layoutFinishesUnsaved,
  roofLightsUnsaved,
} from "../ha-client";
import type {
  FloorFinishKind,
  FloorLayout,
  FloorMeta,
  FurnitureItem,
  GroundGrid,
  GroundSetting,
  HomeAssistant,
  Opening,
  OpeningType,
  DoorStyle,
  GarageStyle,
  WindowGrid,
  WindowType,
  CompassSide,
  RoofLightStrip,
  RoofPart,
  RoofPlan,
  Room,
  RoomScan,
  View3dSettings,
  Wall,
  WallFinishKind,
} from "../types";
import {
  FURNITURE_CATALOG,
  catalogItem,
  isOutlineKind,
  type CatalogItem,
  type FurnitureCategory,
} from "../canvas/furniture-catalog";
import { pointInPolygon } from "../canvas/geometry";
import "./search-select";
import type { SearchOption } from "./search-select";
import {
  WALL_MATERIALS,
  materialLabel,
  wallThicknessCm,
} from "../canvas/materials";
import {
  DOOR_WIDTH_CM,
  NEW_WALL_CM,
  WINDOW_WIDTH_CM,
  addItem,
  addOpening,
  addOutlineItem,
  addWall,
  deleteItem,
  deleteOpening,
  deleteWall,
  duplicateItem,
  fitOutline,
  insertCorner,
  moveCorners,
  moveSegment,
  offsetFrom,
  outlinePoints,
  patchItem,
  patchOpening,
  patchRoom,
  patchWall,
  smartSnap,
  snapOffset,
  snapPoint,
  spotOnWall,
  type LayoutPatch,
  type Pt,
  type SnapGuide,
  type SnapWall,
} from "./editor3d";
import "./furniture-library-sidebar";
import {
  brushGrid,
  gridIsLevel,
  gridOffset,
  growGrid,
  nearestNode,
  type GradeMode,
} from "../view3d/ground-grid";
import { COMPASS_POINTS, type Sky } from "../canvas/sun";
import {
  computeCoverOpenness,
  computeItemStates,
  computeRoomLights,
  liveSignature,
} from "../canvas/live-state";
import {
  DEFAULT_WALL_HEIGHT_M,
  buildScene,
  catalogItem3d,
  stripLights,
  stripPattern,
  metersPerUnit,
  stackFloors,
  type FloorInput,
} from "../view3d/scene3d";
import type {
  Box3d,
  RoofEdge3d,
  EditPointer,
  EditRef,
  ScanMode,
  ScanPlacement3d,
  ScanPose,
  View3dHandle,
  View3dModule,
} from "../view3d/view3d-api";

/** The 3D editor's tools. */
type EditTool =
  | "select"
  | "wall"
  | "door"
  | "window"
  | "object"
  | "outdoor"
  | "yard"
  | "grade";

/** The site's kinds the yard tool draws: surfaces, then lines. */
const SITE_KINDS = FURNITURE_CATALOG.filter((c) => c.category === "site");

/** The outdoor tool's library: lights for outside, and plantings. */
const OUTDOOR_CATEGORIES: FurnitureCategory[] = [
  "outdoor_lighting",
  "landscape",
];

function isOutdoorKind(kind: string): boolean {
  const c = catalogItem(kind)?.category;
  return c === "outdoor_lighting" || c === "landscape";
}

/** Entity domains an item can stand for, in picker order. */
const LINK_DOMAINS = [
  "light",
  "switch",
  "fan",
  "cover",
  "media_player",
  "climate",
  "lock",
  "vacuum",
  "input_boolean",
  "binary_sensor",
  "sensor",
];

/** A wall segment's face a light hangs on (metres, edit-floor frame):
 * from (ax, az) along (ux, uz) for `len`, its outward normal (nx, nz) and
 * how far the face stands off the wall's centre line. */
interface WallFace {
  wallId: string;
  ax: number;
  az: number;
  ux: number;
  uz: number;
  nx: number;
  nz: number;
  len: number;
  off: number;
}

/** Snapping a wall light along its face: how near (m) it catches a centre
 * or a mirrored spot, and a level. */
const FACE_SNAP_M = 0.15;
const LEVEL_SNAP_M = 0.08;
/** The guides' colours: the face, centred, level. */
const FACE_COLOR = "#29b6f6";
const CENTRE_COLOR = "#43a047";
const LEVEL_COLOR = "#ab47bc";

/** How far (m) a spotlight placed on the ground looks for a wall to aim
 * at. */
const AIM_REACH_M = 8;

/** A length (metres) in feet and inches, to the nearest inch. */
function feetInches(meters: number): string {
  const inches = Math.round(meters / 0.0254);
  return `${Math.floor(inches / 12)}' ${inches % 12}"`;
}

/** A site kind laid as a surface (closed), not along a line. */
function isSurfaceKind(kind: string): boolean {
  return typeof catalogItem(kind)?.opts["site"] === "string";
}

/** A drag under way in the 3D editor (plan units). */
type EditDrag =
  | { kind: "item"; id: string; offset: Pt; at: Pt }
  | {
      kind: "wallItem";
      id: string;
      /** The face it slides on, its height and depth (m). */
      face: WallFace;
      h: number;
      d: number;
      /** Where it's dragged to: plan point, elevation (cm), turn. */
      at: Pt;
      elev: number;
      rot: number;
      moved: boolean;
    }
  | { kind: "seg"; wallId: string; seg: number; start: Pt; d: number }
  | { kind: "corner"; wallId: string; index: number; from: Pt; to: Pt }
  | { kind: "opening"; id: string; wallId: string; at: Pt }
  | {
      kind: "outline";
      id: string;
      index: number;
      pts: Pt[];
      moved: boolean;
      /** A corner added (from an edge's middle dot): the corners' curves
       * with one for it. */
      corners?: number[] | null;
    }
  | {
      kind: "grade";
      grid: GroundGrid;
      /** Where the last dab went (metres), and the raise to level to. */
      last: [number, number];
      level: number;
    }
  | {
      kind: "gradePoint";
      grid: GroundGrid;
      i: number;
      j: number;
      /** The ground there without the point's own raise. */
      base: number;
    };

/** Where the lazily loaded three.js module is served (see rollup's
 * view3dModule and frontend.py's static path). */
const MODULE_URL = `/spatial_context/view3d/spatial-context-3d.mjs?v=${__BUILD_ID__}`;

let modulePromise: Promise<View3dModule> | null = null;

function loadModule(url: string): Promise<View3dModule> {
  if (!modulePromise) {
    modulePromise = (
      import(/* @vite-ignore */ url) as Promise<{ default: View3dModule }>
    )
      .then((m) => m.default)
      .catch((err: unknown) => {
        modulePromise = null;
        throw err;
      });
  }
  return modulePromise;
}

const SCAN_MODE_KEY = "spatial-context-3d-scan-mode";

function readScanMode(): ScanMode {
  try {
    return localStorage.getItem(SCAN_MODE_KEY) === "scan" ? "scan" : "plan";
  } catch {
    return "plan";
  }
}

const ROOF_KEY = "spatial-context-3d-roof";

/** Whether the building view wears its roof — a per-browser choice, on
 * unless turned off. */
function readRoof(): boolean {
  try {
    return localStorage.getItem(ROOF_KEY) !== "off";
  } catch {
    return true;
  }
}

function emptyView3d(): View3dSettings {
  return { wall_height_m: null, floor_elevation_m: null, scans: [] };
}

type HomeConfig = HomeAssistant["config"];

/** Wall-clock fields of `date` at the home: its time zone when HA reports
 * one, else local solar time from its longitude. */
function homeClock(
  date: Date,
  config: HomeConfig,
): { y: number; mo: number; d: number; h: number; mi: number } {
  const tz = config?.time_zone;
  if (tz) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23",
      }).formatToParts(date);
      const get = (type: string) =>
        Number(parts.find((p) => p.type === type)?.value ?? 0);
      return {
        y: get("year"),
        mo: get("month"),
        d: get("day"),
        h: get("hour"),
        mi: get("minute"),
      };
    } catch {
      /* unknown zone: fall through */
    }
  }
  const solar = new Date(
    date.getTime() + ((config?.longitude ?? 0) / 15) * 3_600_000,
  );
  return {
    y: solar.getUTCFullYear(),
    mo: solar.getUTCMonth() + 1,
    d: solar.getUTCDate(),
    h: solar.getUTCHours(),
    mi: solar.getUTCMinutes(),
  };
}

function homeHour(date: Date, config: HomeConfig): number {
  const c = homeClock(date, config);
  return c.h + c.mi / 60;
}

/** Today at `hour` o'clock at the home, as an instant. */
function homeDate(hour: number, config: HomeConfig): Date {
  const today = homeClock(new Date(), config);
  const wanted = Date.UTC(
    today.y,
    today.mo - 1,
    today.d,
    Math.floor(hour),
    Math.round((hour % 1) * 60),
  );
  // The zone's offset at that moment: what the home's clock reads then,
  // read as if it were UTC, less the instant itself.
  const c = homeClock(new Date(wanted), config);
  const offset = Date.UTC(c.y, c.mo - 1, c.d, c.h, c.mi) - wanted;
  return new Date(wanted - offset);
}

function fileSize(bytes: number): string {
  return bytes < 1048576
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1048576).toFixed(1)} MB`;
}

/** A floor's traced extent's centre, stored units. */
function planCentre(layout: FloorLayout): [number, number] {
  const pts = [
    ...layout.rooms.flatMap((r) => r.points),
    ...layout.walls.flatMap((w) => w.points),
  ];
  if (!pts.length) return [0, 0];
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2,
  ];
}

/** The 3D view of a floor (or its whole building, stacked as a
 * "dollhouse"): walls, openings, room floors, furniture, live lights and
 * the sun, plus phone room scans laid over the plan. Used by the panel
 * (editable: scans can be imported and aligned) and by the dashboard card
 * (read-only). three.js loads only once one of these is shown. */
@safeCustomElement("floorplan-3d-view")
export class Floorplan3dView extends LitElement {
  static override styles = [
    sharedStyles,
    switchStyles,
    css`
      :host {
        position: relative;
        display: block;
        overflow: hidden;
        background: var(--sc-bg);
      }
      .stage {
        position: absolute;
        inset: 0;
      }
      .measure {
        position: absolute;
        transform: translate(-50%, calc(-100% - 10px));
        pointer-events: none;
        background: rgba(33, 33, 33, 0.85);
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 6px;
        white-space: nowrap;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .measure span {
        font-size: 11px;
        font-weight: 400;
        opacity: 0.8;
      }
      .toolbar {
        position: absolute;
        top: 8px;
        left: 8px;
        right: 8px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
        pointer-events: none;
      }
      .toolbar > * {
        pointer-events: auto;
      }
      .group {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 2px;
        background: color-mix(in srgb, var(--sc-panel-bg) 92%, transparent);
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      }
      .group button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 10px;
        white-space: nowrap;
      }
      .group button.icon {
        width: 36px;
        padding: 0;
        justify-content: center;
      }
      .group ha-icon {
        --mdc-icon-size: 20px;
      }
      .group label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0 8px;
        font-size: var(--sc-fs-small);
        color: var(--sc-fg-secondary);
        white-space: nowrap;
      }
      input[type="range"] {
        width: 110px;
        accent-color: var(--sc-accent);
      }
      .spacer {
        flex: 1;
      }
      .sheet {
        position: absolute;
        top: 56px;
        right: 8px;
        bottom: 8px;
        width: min(340px, calc(100% - 16px));
        overflow-y: auto;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .sheet h3 {
        margin: 0;
        font-size: var(--sc-fs-title);
        font-weight: 500;
      }
      .sheet .hint {
        font-size: var(--sc-fs-small);
        color: var(--sc-fg-secondary);
        line-height: 1.4;
      }
      .sheet textarea.roof-parts {
        box-sizing: border-box;
        width: 100%;
        min-height: 120px;
        resize: vertical;
        font-family: var(--code-font-family, monospace);
        font-size: var(--sc-fs-small);
        white-space: pre;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--sc-fs-body);
      }
      .row > span:first-child {
        flex: 1;
      }
      .row input[type="number"],
      .row select {
        width: 84px;
        height: var(--sc-h-field);
        padding: 0 8px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-bg);
        color: var(--sc-fg);
        font: inherit;
      }
      .row input[type="range"] {
        flex: 1;
        width: auto;
      }
      .scan {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 4px 4px 4px 10px;
        border-radius: 8px;
        cursor: pointer;
      }
      .scan.selected {
        background: color-mix(in srgb, var(--sc-accent) 14%, transparent);
      }
      .scan .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .scan .meta {
        font-size: var(--sc-fs-caption);
        color: var(--sc-fg-secondary);
      }
      .scan button,
      .nudge button {
        padding: 6px;
        display: inline-flex;
      }
      .scan ha-icon,
      .nudge ha-icon {
        --mdc-icon-size: 20px;
      }
      .nudge {
        display: grid;
        grid-template-columns: repeat(3, 36px);
        gap: 2px;
        justify-content: center;
      }
      .buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .buttons button {
        border: 1px solid var(--sc-divider);
      }
      .divider {
        border-top: 1px solid var(--sc-divider);
      }
      .sides {
        display: flex;
        gap: 4px;
      }
      .pattern {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 4px 0;
      }
      .pattern input {
        width: 28px;
        height: 24px;
        padding: 0;
        border: none;
      }
      details.edges summary {
        cursor: pointer;
        padding: 2px 0;
      }
      details.edges .row {
        justify-content: flex-start;
        gap: 6px;
      }
      .sides button {
        min-width: 32px;
        border: 1px solid var(--sc-divider);
      }
      .sides button.active {
        background: color-mix(in srgb, var(--sc-accent) 18%, transparent);
        border-color: var(--sc-accent);
      }
      .editor .tools {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 4px;
      }
      .editor .tools button {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 6px 2px;
        font-size: var(--sc-fs-caption);
        border: 1px solid var(--sc-divider);
      }
      .editor .tools button.active {
        background: color-mix(in srgb, var(--sc-accent) 18%, transparent);
        border-color: var(--sc-accent);
      }
      .editor .tools ha-icon,
      .editor .buttons ha-icon {
        --mdc-icon-size: 20px;
      }
      .editor .buttons {
        align-items: center;
      }
      .editor .row input[type="text"] {
        flex: 1;
        min-width: 0;
        height: var(--sc-h-field);
        padding: 0 8px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-bg);
        color: var(--sc-fg);
        font: inherit;
      }
      .editor .row select {
        width: 150px;
      }
      .editor .row input[type="color"] {
        width: 48px;
        height: 32px;
        padding: 0;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: none;
      }
      .editor .row button.icon {
        padding: 4px;
        display: inline-flex;
      }
      .editor .unit {
        width: 22px;
        font-size: var(--sc-fs-small);
        color: var(--sc-fg-secondary);
      }
      .editor .row.beam {
        flex-wrap: wrap;
      }
      .editor .row.beam .range {
        flex: 1 1 140px;
        display: flex;
        align-items: center;
        gap: 4px;
        min-width: 0;
      }
      .editor .row.beam small {
        font-size: 10px;
        color: var(--sc-fg-secondary);
      }
      .editor .row.beam .unit {
        width: auto;
        min-width: 34px;
        text-align: right;
      }
      .editor button.danger {
        color: var(--sc-danger);
      }
      .editor furniture-library-sidebar {
        position: static;
        width: auto;
        max-height: 60vh;
        min-height: 320px;
        flex: 1;
      }
      .notice {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        max-width: 80%;
        text-align: center;
        color: var(--sc-fg-secondary);
      }
      .error {
        color: var(--sc-danger);
      }
      @media (max-width: 600px) {
        .group label.time {
          display: none;
        }
        .sheet {
          top: auto;
          height: 55%;
        }
      }
    `,
  ];

  @property({ attribute: false }) hass?: HomeAssistant;
  @property({ attribute: false }) floorId: string | null = null;
  /** The floor being shown — with any unsaved edits, in the panel. */
  @property({ attribute: false }) layout: FloorLayout | null = null;
  @property({ attribute: false }) floors: FloorMeta[] = [];
  @property({ attribute: false }) sky: Sky | null = null;
  @property({ type: Boolean }) dark = false;
  /** Panel: scans can be imported, aligned and saved. */
  @property({ type: Boolean }) editable = false;
  /** Panel: shows a button that fires `close-3d`. */
  @property({ type: Boolean }) closable = false;
  @property({ type: Boolean }) dollhouse = false;
  @property({ attribute: false }) moduleUrl = MODULE_URL;

  @state() private _status: "idle" | "starting" | "ready" | "error" = "idle";
  @state() private _error: string | null = null;
  /** The roof parts being edited, as text (null = showing the saved). */
  @state() private _roofDraft: string | null = null;
  @state() private _view3d = new Map<string, View3dSettings>();
  @state() private _otherLayouts = new Map<string, FloorLayout>();
  @state() private _spread = 0;
  /** Hour of today the sun is shown at; null follows the clock. */
  @state() private _hour: number | null = null;
  @state() private _sheetOpen = false;
  /** The roof lights panel. */
  @state() private _lightsOpen = false;
  @state() private _selectedScanId: string | null = null;
  @state() private _moveMode = false;
  @state() private _snap = true;
  /** Plan or scan model where a floor has a scan (see View3dHandle's
   * setScanMode) — a per-browser choice. */
  @state() private _scanMode: ScanMode = readScanMode();
  @state() private _roof = readRoof();
  @state() private _uploading = false;
  @state() private _scanStatus = new Map<string, string>();
  @state() private _exporting = false;
  /** The 3D editor: on, its tool, what's selected and hovered. */
  @state() private _editing = false;
  @state() private _tool: EditTool = "select";
  @state() private _sel: EditRef | null = null;
  @state() private _hover: EditRef | null = null;
  @state() private _armedKind: string | null = null;
  /** The outdoor library's pictures, rendered in 3D (by catalog id). */
  @state() private _thumbs: Record<string, string> = {};
  private _thumbsAsked = false;
  private _module: View3dModule | null = null;
  private _armedRot = 0;
  /** The yard tool's kind, and a free-form outline's picked corner. */
  @state() private _yardKind = "site_sidewalk";
  @state() private _outlineCorner: number | null = null;
  /** Another floor's thing clicked in the dollhouse: selected once the
   * panel has switched to that floor. */
  private _pendingSel: EditRef | null = null;
  /** The grading tool: how it shapes, its brush (metres across the
   * middle, metres a dab) and grid spacing, the picked point. */
  @state() private _gradeMode: GradeMode | "point" = "raise";
  /** The roof's edges as last built (see RoofEdge3d). */
  @state() private _roofEdges: RoofEdge3d[] = [];
  /** The brush's full-strength radius, and how far past it (metres) a
   * dab eases off into the ground round it. */
  @state() private _gradeRadius = 1.5;
  @state() private _gradeFeather = 2;
  @state() private _gradeStrength = 0.1;
  @state() private _gradeStep = 1;
  @state() private _gradeNode: { i: number; j: number } | null = null;
  private _gradeCursor: [number, number] | null = null;
  /** The length of the edge being drawn (and the whole line so far),
   * shown beside it. */
  @state() private _measure: {
    x: number;
    y: number;
    seg: string;
    total: string | null;
  } | null = null;
  /** A wall being drawn, its corners so far (plan units). */
  private _draft: Pt[] = [];
  private _ghost: Box3d[] = [];
  private _lines: [number, number, number][][] = [];
  private _guides: SnapGuide[] = [];
  /** A wall light's guides, in the edit floor's frame (metres): dashed
   * lines (level, centred), and the face it's on outlined. */
  private _g3d: { points: [number, number, number][]; color: string }[] = [];
  private _facePaths: { points: [number, number, number][]; color: string }[] =
    [];
  private _drag: EditDrag | null = null;
  /** Each floor's level (metres, world), from the last rebuild. */
  private _floorBases = new Map<string, number>();
  private _snapCache: { key: unknown[]; walls: SnapWall[] } | null = null;

  @query(".stage") private _stage!: HTMLElement;
  @query("input[type=file]") private _fileInput!: HTMLInputElement;

  private _handle: View3dHandle | null = null;
  private _sceneSig = "";
  private _scanSig = "";
  private _clock: ReturnType<typeof setInterval> | null = null;
  private _saveTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private _loadingView3d = new Set<string>();

  private get _client(): HaClient | null {
    return this.hass ? new HaClient(this.hass) : null;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this._onEditKey, true);
    // Back after being detached (destroyed in disconnectedCallback).
    this.requestUpdate();
    // The sun moves: re-light every minute while following the clock.
    this._clock = setInterval(() => {
      if (this._hour === null) this._rebuild();
    }, 60_000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this._onEditKey, true);
    if (this._clock) clearInterval(this._clock);
    for (const [floorId, timer] of this._saveTimers) {
      clearTimeout(timer);
      void this._saveNow(floorId);
    }
    this._saveTimers.clear();
    this._handle?.destroy();
    this._handle = null;
    this._sceneSig = "";
    this._scanSig = "";
    this._status = "idle";
  }

  override willUpdate(changed: PropertyValues): void {
    if (changed.has("dollhouse") || changed.has("floorId")) {
      this._otherLayouts = new Map();
    }
    if (changed.has("floorId") && changed.get("floorId") !== undefined) {
      this._sel = null;
      this._hover = null;
      this._drag = null;
      this._draft = [];
      this._ghost = [];
      this._lines = [];
      this._guides = [];
      this._outlineCorner = null;
      this._snapCache = null;
    }
    // Another floor's thing clicked: selected once its floor's layout is
    // here (the panel loads it after switching).
    if (
      changed.has("layout") &&
      this._pendingSel &&
      this._refExists(this._pendingSel)
    ) {
      this._sel = this._pendingSel;
      this._pendingSel = null;
    }
    this._ensureData();
  }

  override updated(): void {
    if (this._status === "idle") void this._start();
    this._rebuild();
  }

  private async _start(): Promise<void> {
    if (this._handle || !this._stage) return;
    this._status = "starting";
    try {
      const mod = await loadModule(this.moduleUrl);
      if (!mod.supportsWebgl()) throw new Error(localize("view3d.noWebgl"));
      this._module = mod;
      if (!this.isConnected || this._handle) return;
      this._handle = mod.createView3d({
        container: this._stage,
        fetchScan: (id) =>
          this.hass
            ? fetchScan(this.hass, id)
            : Promise.reject(new Error("offline")),
        onScanMove: this._onScanMove,
        onEditPointer: (e) => this._onEditPointer(e),
        onScanStatus: (id, status, message) => {
          const next = new Map(this._scanStatus);
          if (status === "ready") next.delete(id);
          else
            next.set(
              id,
              status === "loading"
                ? localize("view3d.scanLoading")
                : (message ?? "error"),
            );
          this._scanStatus = next;
        },
      });
      this._sceneSig = "";
      this._scanSig = "";
      this._spreadShown = -1;
      this._status = "ready";
      this._rebuild();
    } catch (err) {
      this._status = "error";
      this._error = (err as { message?: string })?.message ?? String(err);
    }
  }

  /** The floors to show: just this one, or its building stacked. */
  private get _shownFloorIds(): string[] {
    if (!this.floorId) return [];
    if (!this.dollhouse) return [this.floorId];
    const own = this.floors.find((f) => f.floor_id === this.floorId);
    const building = own?.building_id;
    if (!building) return [this.floorId];
    return this.floors
      .filter(
        (f) =>
          f.floor_id === this.floorId ||
          (f.building_id === building && f.has_layout),
      )
      .map((f) => f.floor_id);
  }

  /** The shown floors and the rest of their building (with layouts). */
  private get _contextFloorIds(): string[] {
    const shown = this._shownFloorIds;
    const own = this.floors.find((f) => f.floor_id === this.floorId);
    const building = own?.building_id;
    if (!building) return shown;
    const rest = this.floors
      .filter(
        (f) =>
          f.building_id === building &&
          f.has_layout &&
          !shown.includes(f.floor_id),
      )
      .map((f) => f.floor_id);
    return [...shown, ...rest];
  }

  /** Some shown floor has a visible scan. */
  private get _hasScans(): boolean {
    return this._shownFloorIds.some((id) =>
      this._view3d.get(id)?.scans.some((s) => s.visible),
    );
  }

  /** The floors of this floor's building (just this one when it isn't
   * aligned to any) — the ground is shared by all of them. */
  private get _buildingFloorIds(): string[] {
    if (!this.floorId) return [];
    const own = this.floors.find((f) => f.floor_id === this.floorId);
    if (!own?.building_id) return [this.floorId];
    return this.floors
      .filter((f) => f.building_id === own.building_id)
      .map((f) => f.floor_id);
  }

  /** The ground around the building: this floor's setting, else any
   * shown floor's (they're saved together). */
  private get _ground(): GroundSetting | null {
    const own = this.floorId ? this._view3d.get(this.floorId)?.ground : null;
    if (own) return own;
    for (const id of this._shownFloorIds) {
      const g = this._view3d.get(id)?.ground;
      if (g) return g;
    }
    return null;
  }

  /** Changes one part of the ground, or clears it (null), on every floor
   * of the building. A first change starts from a level site at this
   * floor's own height. */
  private _setGround(patch: Partial<GroundSetting> | null): void {
    const base: GroundSetting = this._ground ?? {
      uphill_m: 0,
      downhill_m: 0,
      downhill_deg: 0,
    };
    const next = patch === null ? null : { ...base, ...patch };
    const ids = this._buildingFloorIds;
    const map = new Map(this._view3d);
    for (const id of ids) {
      const v = map.get(id);
      if (v) map.set(id, { ...v, ground: next });
    }
    this._view3d = map;
    if (!this.editable) return;
    void this._client
      ?.saveGround(ids, next)
      // It may have had to leave the grading out: say so.
      .then(() => this.requestUpdate())
      .catch((err: unknown) => {
        this._error = localize("view3d.saveFailed", {
          error: (err as { message?: string })?.message ?? String(err),
        });
      });
  }

  /** The building's roof parts: this floor's, else any shown floor's
   * (they're saved together); null = worked out from the rooms. */
  private get _roofPlan(): RoofPlan | null {
    const own = this.floorId ? this._view3d.get(this.floorId)?.roof : null;
    if (own) return own;
    for (const id of this._shownFloorIds) {
      const r = this._view3d.get(id)?.roof;
      if (r) return r;
    }
    return null;
  }

  /** Sets (or clears) the roof on every floor of the building. */
  private _setRoof(plan: RoofPlan | null): void {
    const ids = this._buildingFloorIds;
    const map = new Map(this._view3d);
    for (const id of ids) {
      const v = map.get(id);
      if (v) map.set(id, { ...v, roof: plan });
    }
    this._view3d = map;
    if (!this.editable) return;
    void this._client
      ?.saveRoof(ids, plan)
      // It may have had to leave the light strips out: say so.
      .then(() => this.requestUpdate())
      .catch((err: unknown) => {
        this._error = localize("view3d.saveFailed", {
          error: (err as { message?: string })?.message ?? String(err),
        });
      });
  }

  private get _canDollhouse(): boolean {
    const own = this.floors.find((f) => f.floor_id === this.floorId);
    return (
      !!own?.building_id &&
      this.floors.some(
        (f) => f.floor_id !== this.floorId && f.building_id === own.building_id,
      )
    );
  }

  /** Fetches what the shown floors need: their 3D settings and (for the
   * other floors of a dollhouse) their layouts. */
  private _ensureData(): void {
    const client = this._client;
    if (!client) return;
    for (const floorId of this._contextFloorIds) {
      if (!this._view3d.has(floorId) && !this._loadingView3d.has(floorId)) {
        this._loadingView3d.add(floorId);
        client
          .getView3d(floorId)
          .catch(() => emptyView3d())
          .then((v) => {
            this._loadingView3d.delete(floorId);
            this._view3d = new Map(this._view3d).set(floorId, v);
          });
      }
      if (floorId !== this.floorId && !this._otherLayouts.has(floorId)) {
        this._otherLayouts = new Map(this._otherLayouts).set(
          floorId,
          // A placeholder until it arrives, so it's only fetched once.
          null as unknown as FloorLayout,
        );
        void client
          .getLayout(floorId)
          .then((layout) => {
            this._otherLayouts = new Map(this._otherLayouts).set(
              floorId,
              layout,
            );
          })
          .catch(() => {});
      }
    }
  }

  private _layoutOf(floorId: string): FloorLayout | null {
    return floorId === this.floorId
      ? this.layout
      : (this._otherLayouts.get(floorId) ?? null);
  }

  private _wallHeight(floorId: string): number {
    return this._view3d.get(floorId)?.wall_height_m ?? DEFAULT_WALL_HEIGHT_M;
  }

  /** The moment the sun is shown at: now, or the slider's hour of today
   * at the home (its own time zone, not the browser's). */
  private get _date(): Date {
    if (this._hour === null) return new Date();
    return homeDate(this._hour, this.hass?.config);
  }

  /** Rebuilds the scene when anything it shows changed (live state
   * included), and re-places the scans. */
  private _rebuild = (): void => {
    const handle = this._handle;
    if (!handle) return;
    const inputs: (FloorInput & {
      level: number | null;
      elevation: number | null;
    })[] = [];
    for (const floorId of this._contextFloorIds) {
      const layout = this._layoutOf(floorId);
      if (!layout) continue;
      const meta = this.floors.find((f) => f.floor_id === floorId);
      inputs.push({
        floorId,
        name: meta?.name ?? floorId,
        layout,
        wallHeight: this._wallHeight(floorId),
        baseY: 0,
        level: meta?.level ?? null,
        elevation: this._view3d.get(floorId)?.floor_elevation_m ?? null,
      });
    }
    if (!inputs.length) return;
    // Even a floor shown alone stands at its height above the ground, so
    // a main floor above a walk-out isn't drawn sitting on the grass.
    // The building's other floors stack the shown ones and say what's
    // above them (a staircase climbs to it), drawn or not.
    const context = stackFloors(inputs);
    this._floorBases = new Map(context.map((f) => [f.floorId, f.baseY]));
    const shownIds = this._shownFloorIds;
    const floors = context.filter((f) => shownIds.includes(f.floorId));
    if (!floors.length) return;
    const ground = this._ground;
    const date = this._date;
    const live = floors
      .map((f) =>
        liveSignature(
          computeRoomLights(f.layout.rooms, this.hass),
          computeCoverOpenness(f.layout.openings, this.hass),
          new Map(),
          computeItemStates(f.layout.furniture, this.hass),
        ),
      )
      .join("#");
    const minute = Math.floor(date.getTime() / 60_000);
    const sig = [
      floors.map((f) => `${f.floorId}:${f.wallHeight}:${f.baseY}`).join(","),
      context.map((f) => f.floorId).join(","),
      live,
      minute,
      this.dark,
      this.sky?.clouds ?? "",
      JSON.stringify(ground),
      this._roofShown,
      JSON.stringify(this._roofPlan),
      (this._roofPlan?.lights ?? [])
        .map((l) => {
          const st = l.entity_id ? this.hass?.states[l.entity_id] : undefined;
          const scenes = (l.scenes ?? [])
            .map((x) => this.hass?.states[x.scene]?.state ?? "")
            .join("/");
          return st
            ? `${st.state}:${JSON.stringify(st.attributes["rgb_color"] ?? "")}:${st.attributes["brightness"] ?? ""}:${scenes}`
            : scenes;
        })
        .join(","),
    ].join("|");
    // Layout objects are replaced on every edit, so identity is enough.
    const layoutsChanged =
      this._lastLayouts.length !== context.length ||
      context.some((f, i) => this._lastLayouts[i] !== f.layout);
    // Not mid-drag (the sun's minute, a light switched): what's dragged is
    // only previewed, and a rebuild would put it back. Done on release.
    const changed = sig !== this._sceneSig || layoutsChanged;
    if (changed && this._drag) this._rebuildHeld = true;
    if (changed && !this._drag) {
      this._rebuildHeld = false;
      this._sceneSig = sig;
      this._lastLayouts = context.map((f) => f.layout);
      const scene = buildScene({
        floors,
        context,
        hass: this.hass,
        dark: this.dark,
        date,
        sky: this.sky,
        showLights: true,
        ground,
        roof: this._roofShown,
        roofPlan: this._roofPlan,
      });
      handle.setScene(scene);
      // The roof's edges, for picking which a light strip runs along.
      const edges = scene.roof?.edges;
      if (edges && edges !== this._roofEdges) this._roofEdges = edges;
      this._scanSig = "";
    }
    const placements: ScanPlacement3d[] = [];
    for (const f of floors) {
      const m = metersPerUnit(f.layout.scale);
      const [cx, cy] = planCentre(f.layout);
      for (const scan of this._view3d.get(f.floorId)?.scans ?? []) {
        placements.push({
          id: scan.id,
          floorId: f.floorId,
          x: (scan.x ?? cx) * m,
          z: (scan.y ?? cy) * m,
          elevation: scan.elevation_m,
          rotationDeg: scan.rotation_deg,
          scale: scan.scale,
          visible: scan.visible,
          opacity: scan.opacity,
          hideWalls: scan.hide_walls,
        });
      }
    }
    const scanSig = JSON.stringify(placements);
    if (scanSig !== this._scanSig) {
      this._scanSig = scanSig;
      handle.setScans(placements);
    }
    const spread = floors.length > 1 ? this._spread : 0;
    if (spread !== this._spreadShown) {
      this._spreadShown = spread;
      handle.setSpread(spread);
    }
    handle.setScanMode(this._scanMode);
    handle.setEditFloor(this._editing ? this.floorId : null);
    // What was selected may be gone (undone, deleted on the plan).
    if (this._sel && this.layout && !this._refExists(this._sel))
      this._sel = null;
    if (this._editing) this._pushOverlay();
    handle.setEditScan(
      this.editable && this._sheetOpen && this._moveMode
        ? this._selectedScanId
        : null,
      this._snap,
    );
  };
  private _lastLayouts: FloorLayout[] = [];
  /** A rebuild waits for the drag to end. */
  private _rebuildHeld = false;

  /** The roof goes on the whole building, never a single floor; it's off
   * while editing (the rooms are what's edited). */
  private get _roofShown(): boolean {
    return (
      !this._editing &&
      this.dollhouse &&
      this._roof &&
      this._shownFloorIds.length > 1
    );
  }

  private _refExists(ref: EditRef): boolean {
    const l = this.layout;
    if (!l) return false;
    const list =
      ref.kind === "wall"
        ? l.walls
        : ref.kind === "opening"
          ? l.openings
          : ref.kind === "item"
            ? l.furniture
            : l.rooms;
    return (list as { id: string }[]).some((x) => x.id === ref.id);
  }
  private _spreadShown = -1;

  // --- scans ------------------------------------------------------------------

  private get _scans(): RoomScan[] {
    return (this.floorId && this._view3d.get(this.floorId)?.scans) || [];
  }

  private get _selectedScan(): RoomScan | null {
    return this._scans.find((s) => s.id === this._selectedScanId) ?? null;
  }

  /** Applies a change to this floor's 3D settings, and saves it — at once
   * when `save` is "now", after a pause while a slider is still moving. */
  private _patchView3d(
    patch: (v: View3dSettings) => View3dSettings,
    save: "now" | "soon" | false = "soon",
  ): void {
    const floorId = this.floorId;
    if (!floorId) return;
    const next = patch(this._view3d.get(floorId) ?? emptyView3d());
    this._view3d = new Map(this._view3d).set(floorId, next);
    if (!save || !this.editable) return;
    clearTimeout(this._saveTimers.get(floorId));
    this._saveTimers.set(
      floorId,
      setTimeout(
        () => {
          this._saveTimers.delete(floorId);
          void this._saveNow(floorId);
        },
        save === "now" ? 0 : 700,
      ),
    );
  }

  private async _saveNow(floorId: string): Promise<void> {
    const settings = this._view3d.get(floorId);
    const client = this._client;
    if (!settings || !client) return;
    try {
      await client.saveView3d(floorId, settings);
    } catch (err) {
      this._error = localize("view3d.saveFailed", {
        error: (err as { message?: string })?.message ?? String(err),
      });
    }
  }

  private _patchScan(
    id: string,
    patch: Partial<RoomScan>,
    save: "now" | "soon" | false = "soon",
  ): void {
    this._patchView3d(
      (v) => ({
        ...v,
        scans: v.scans.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      }),
      save,
    );
  }

  /** The 3D module moved a scan (dragged, snapped or auto-aligned). */
  private _onScanMove = (id: string, pose: ScanPose, final: boolean) => {
    const layout = this.layout;
    if (!layout) return;
    const m = metersPerUnit(layout.scale);
    this._patchScan(
      id,
      {
        x: pose.x / m,
        y: pose.z / m,
        rotation_deg: Math.round(pose.rotationDeg * 100) / 100,
        ...(pose.elevation !== undefined
          ? { elevation_m: Math.round(pose.elevation * 1000) / 1000 }
          : {}),
      },
      final ? "now" : false,
    );
  };

  /** The scan's position, filled in from where it's drawn (plan centre)
   * the first time it's nudged. */
  private _scanXY(scan: RoomScan): [number, number] {
    if (scan.x !== null && scan.y !== null) return [scan.x, scan.y];
    return this.layout ? planCentre(this.layout) : [0, 0];
  }

  private _nudge(dxCm: number, dyCm: number): void {
    const scan = this._selectedScan;
    if (!scan || !this.layout) return;
    const perCm = 1 / (metersPerUnit(this.layout.scale) * 100);
    const [x, y] = this._scanXY(scan);
    this._patchScan(scan.id, { x: x + dxCm * perCm, y: y + dyCm * perCm });
  }

  private _rotate(deltaDeg: number): void {
    const scan = this._selectedScan;
    if (!scan) return;
    let r = scan.rotation_deg + deltaDeg;
    r = ((((r + 180) % 360) + 360) % 360) - 180;
    const [x, y] = this._scanXY(scan);
    this._patchScan(scan.id, { rotation_deg: r, x, y });
  }

  private _onPickFile = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    const client = this._client;
    const floorId = this.floorId;
    if (!file || !client || !floorId) return;
    this._uploading = true;
    this._error = null;
    try {
      const scan = await client.uploadScan(floorId, file);
      this._patchView3d((v) => ({ ...v, scans: [...v.scans, scan] }), false);
      this._selectedScanId = scan.id;
    } catch (err) {
      this._error = (err as { message?: string })?.message ?? String(err);
    } finally {
      this._uploading = false;
    }
  };

  private async _deleteScan(scan: RoomScan): Promise<void> {
    if (!confirm(localize("view3d.deleteConfirm", { name: scan.name }))) return;
    try {
      await this._client?.deleteScan(scan.id);
      this._patchView3d(
        (v) => ({ ...v, scans: v.scans.filter((s) => s.id !== scan.id) }),
        false,
      );
      if (this._selectedScanId === scan.id) this._selectedScanId = null;
    } catch (err) {
      this._error = (err as { message?: string })?.message ?? String(err);
    }
  }

  private async _export(): Promise<void> {
    if (!this._handle) return;
    this._exporting = true;
    try {
      const blob = await this._handle.exportGlb();
      const name =
        this.floors.find((f) => f.floor_id === this.floorId)?.name ??
        "floor-plan";
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${name.replace(/[^\w-]+/g, "-").toLowerCase()}${this.dollhouse ? "-building" : ""}.glb`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
    } catch (err) {
      this._error = (err as { message?: string })?.message ?? String(err);
    } finally {
      this._exporting = false;
    }
  }

  private _fire(name: string) {
    this.dispatchEvent(
      new CustomEvent(name, { bubbles: true, composed: true }),
    );
  }

  // --- editor -------------------------------------------------------------------

  /** Units per centimetre on this floor's plan. */
  private get _perCm(): number {
    return this.layout ? 1 / (metersPerUnit(this.layout.scale) * 100) : 1;
  }

  private _toggleEditing(): void {
    this._editing = !this._editing;
    this._tool = "select";
    this._measure = null;
    this._sel = null;
    this._hover = null;
    this._draft = [];
    this._ghost = [];
    this._lines = [];
    this._drag = null;
    if (this._editing) {
      this._sheetOpen = false;
      this._lightsOpen = false;
    }
    this._sceneSig = "";
  }

  private _setTool(tool: EditTool): void {
    this._tool = tool;
    this._draft = [];
    this._ghost = [];
    this._lines = [];
    this._guides = [];
    this._gradeCursor = null;
    this._gradeNode = null;
    this._measure = null;
    this._g3d = [];
    this._facePaths = [];
    if (tool !== "object" && tool !== "outdoor") this._armedKind = null;
    if (tool === "outdoor") void this._loadThumbs();
    this._pushOverlay();
  }

  /** Renders the outdoor library's pictures in 3D, once. */
  private async _loadThumbs(): Promise<void> {
    const mod = this._module;
    if (this._thumbsAsked || !mod?.thumbnails) return;
    this._thumbsAsked = true;
    const entries = FURNITURE_CATALOG.filter((c) =>
      OUTDOOR_CATEGORIES.includes(c.category),
    );
    try {
      this._thumbs = await mod.thumbnails(entries.map(catalogItem3d), 160);
    } catch {
      this._thumbsAsked = false;
    }
  }

  /** Sends a change to the panel: one undo step, saved like a plan edit. */
  private _edit(patch: LayoutPatch): void {
    if (!Object.keys(patch).length) return;
    this.dispatchEvent(
      new CustomEvent("layout-edit", {
        detail: { patch },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _wallOf(id: string | undefined): Wall | undefined {
    return this.layout?.walls.find((w) => w.id === id);
  }

  /** A box (edit-floor frame) standing on a plan segment. */
  private _segBox(
    a: Pt,
    b: Pt,
    thickCm: number,
    y0: number,
    y1: number,
  ): Box3d {
    const m = metersPerUnit(this.layout?.scale ?? null);
    const dx = (b[0] - a[0]) * m;
    const dz = (b[1] - a[1]) * m;
    return {
      x: ((a[0] + b[0]) / 2) * m,
      z: ((a[1] + b[1]) / 2) * m,
      y0,
      y1,
      length: Math.max(0.01, Math.hypot(dx, dz)),
      depth: thickCm / 100,
      angle: Math.atan2(-dz, dx),
    };
  }

  /** What the overlay shows: the selection, the hover, a selected wall's
   * corners, and the previews. */
  private _pushOverlay(): void {
    const handle = this._handle;
    if (!handle || !this._editing || !this.floorId) return;
    const m = metersPerUnit(this.layout?.scale ?? null);
    const H = this._wallHeight(this.floorId);
    let handles: [number, number, number][] = [];
    const wall =
      this._sel?.kind === "wall" ? this._wallOf(this._sel.id) : undefined;
    if (wall)
      handles = this._cornerPoints(wall).map((p) => [
        p[0] * m,
        H + 0.05,
        p[1] * m,
      ]);
    // A free-form outline's corners (a driveway's, a fence's), on the
    // ground for the site's.
    const item = this._tool === "select" ? this._outlineItem() : undefined;
    let activeHandle: number | null =
      this._drag?.kind === "corner" ? this._drag.index : null;
    let minorFrom: number | null = null;
    const paths: { points: [number, number, number][]; color: string }[] = [];
    if (item) {
      const drag = this._drag?.kind === "outline" ? this._drag : null;
      const pts = drag ? drag.pts : outlinePoints(item, this._perCm);
      const yAt = (q: Pt) =>
        this._onGround(item)
          ? handle.groundHeight(q[0] * m, q[1] * m) + 0.08
          : (item.elevation_cm ?? 0) / 100 + 0.05;
      handles = pts.map((q) => [q[0] * m, yAt(q), q[1] * m]);
      activeHandle = drag ? drag.index : this._outlineCorner;
      // Each edge's middle: drag (or click) it for a new corner there.
      if (!drag && !item.locked) {
        minorFrom = handles.length;
        for (const [a, b] of this._outlineEdges(item, pts)) {
          const q: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
          handles.push([q[0] * m, yAt(q), q[1] * m]);
        }
      }
      if (drag) {
        const ring = this._closedOutline(item) ? [...pts, pts[0]!] : pts;
        paths.push({
          points: this._drape(ring, yAt),
          color: "#ff7043",
        });
      }
    }
    // The yard tool's outline so far.
    if (this._tool === "yard" && this._draft.length) {
      const yAt = (q: Pt) => handle.groundHeight(q[0] * m, q[1] * m) + 0.08;
      const cursor = this._gradeCursor;
      const pts = cursor
        ? [...this._draft, [cursor[0] / m, cursor[1] / m] as Pt]
        : this._draft;
      paths.push({ points: this._drape(pts, yAt), color: "#ff7043" });
      handles = this._draft.map((q) => [q[0] * m, yAt(q), q[1] * m]);
    }
    // The grading brush, and the grid's points round it.
    if (this._tool === "grade" && this._gradeCursor) {
      const [cx, cz] = this._gradeCursor;
      const gy = (x: number, z: number) => handle.groundHeight(x, z) + 0.04;
      const grid = this._gradeGrid();
      const step = grid?.step ?? this._gradeStep;
      if (this._gradeMode === "point") {
        const reach = 2.5 * step;
        const x0 = (grid?.x0 ?? 0) % step;
        const z0 = (grid?.z0 ?? 0) % step;
        const nodes: [number, number, number][] = [];
        for (
          let x = Math.ceil((cx - reach - x0) / step) * step + x0;
          x <= cx + reach;
          x += step
        )
          for (
            let z = Math.ceil((cz - reach - z0) / step) * step + z0;
            z <= cz + reach;
            z += step
          )
            nodes.push([x, gy(x, z) + 0.04, z]);
        handles = nodes;
        const node = this._gradeNode;
        if (grid && node) {
          const nx = grid.x0 + node.i * step;
          const nz = grid.z0 + node.j * step;
          handles = [...handles, [nx, gy(nx, nz) + 0.04, nz]];
          activeHandle = handles.length - 1;
        }
      } else {
        const r = this._gradeRadius + this._gradeFeather;
        const circle = (radius: number) => {
          const ring: [number, number, number][] = [];
          for (let k = 0; k <= 48; k++) {
            const a = (k / 48) * Math.PI * 2;
            const x = cx + Math.cos(a) * radius;
            const z = cz + Math.sin(a) * radius;
            ring.push([x, gy(x, z), z]);
          }
          return ring;
        };
        // Full strength inside; the feathered edge out to the outer ring.
        paths.push({ points: circle(this._gradeRadius), color: "#ff7043" });
        if (this._gradeFeather > 0)
          paths.push({ points: circle(r), color: "#ffb74d" });
        // The grid's lines within the brush, draped over the ground.
        const x0 = (grid?.x0 ?? 0) % step;
        const z0 = (grid?.z0 ?? 0) % step;
        for (
          let x = Math.ceil((cx - r - x0) / step) * step + x0;
          x <= cx + r;
          x += step
        ) {
          const half = Math.sqrt(Math.max(0, r * r - (x - cx) ** 2));
          const line: [number, number, number][] = [];
          for (let z = cz - half; z <= cz + half + 1e-6; z += 0.2)
            line.push([x, gy(x, z), z]);
          if (line.length > 1) paths.push({ points: line, color: "#ffffff" });
        }
        for (
          let z = Math.ceil((cz - r - z0) / step) * step + z0;
          z <= cz + r;
          z += step
        ) {
          const half = Math.sqrt(Math.max(0, r * r - (z - cz) ** 2));
          const line: [number, number, number][] = [];
          for (let x = cx - half; x <= cx + half + 1e-6; x += 0.2)
            line.push([x, gy(x, z), z]);
          if (line.length > 1) paths.push({ points: line, color: "#ffffff" });
        }
      }
    }
    // Guides at the top of this floor's walls, and down (or up) to the
    // floor they came from: orange for this floor, magenta for another.
    const top = H + 0.04;
    const guides: { points: [number, number, number][]; color: string }[] = [];
    for (const g of this._guides) {
      const color = g.own ? "#fb8c00" : "#d81b60";
      const at = (q: Pt, y: number): [number, number, number] => [
        q[0] * m,
        y,
        q[1] * m,
      ];
      // A yard guide lies on the ground: teal, with a marker where it
      // meets.
      if (
        g.yard ||
        g.kind === "extend" ||
        g.kind === "square" ||
        g.kind === "parallel"
      ) {
        const onGround = !!g.yard || this._tool === "yard";
        const gy = (q: Pt) =>
          onGround ? handle.groundHeight(q[0] * m, q[1] * m) + 0.1 : top;
        const c = g.yard ? "#00acc1" : color;
        const lineOf = (a: Pt, b: Pt) => {
          const n = Math.max(
            1,
            Math.ceil((Math.hypot(b[0] - a[0], b[1] - a[1]) * m) / 0.5),
          );
          const pts: [number, number, number][] = [];
          for (let k = 0; k <= n; k++) {
            const q: Pt = [
              a[0] + ((b[0] - a[0]) * k) / n,
              a[1] + ((b[1] - a[1]) * k) / n,
            ];
            pts.push(at(q, gy(q)));
          }
          return pts;
        };
        const mark = (q: Pt, r: number) => {
          const rr = r / m;
          guides.push({
            points: [
              [q[0] + rr, q[1]],
              [q[0], q[1] + rr],
              [q[0] - rr, q[1]],
              [q[0], q[1] - rr],
              [q[0] + rr, q[1]],
            ].map((p) => at(p as Pt, gy(p as Pt))),
            color: c,
          });
        };
        if (g.kind === "corner") mark(g.a, 0.22);
        else if (g.kind === "wall") {
          guides.push({ points: lineOf(g.a, g.b), color: c });
          if (g.at) mark(g.at, 0.15);
        } else if (g.kind === "extend") {
          guides.push({ points: lineOf(g.a, g.b), color: c });
          mark(g.b, 0.12);
        } else if (g.kind === "square" || g.kind === "parallel") {
          guides.push({ points: lineOf(g.a, g.b), color: c });
          if (g.at) mark(g.at, g.kind === "square" ? 0.18 : 0.1);
        } else if (g.kind === "align") {
          guides.push({ points: lineOf(g.a, g.b), color: c });
        }
        continue;
      }
      const other = g.own ? null : g.level + 0.04;
      if (g.kind === "wall") {
        guides.push({ points: [at(g.a, top), at(g.b, top)], color });
        if (other !== null)
          guides.push({ points: [at(g.a, other), at(g.b, other)], color });
      } else {
        if (g.kind === "align")
          guides.push({ points: [at(g.a, top), at(g.b, top)], color });
        if (other !== null)
          guides.push({ points: [at(g.a, other), at(g.a, top)], color });
      }
    }
    handle.setEditOverlay({
      select: this._sel,
      hover: this._hover,
      handles,
      activeHandle,
      minorFrom,
      lines: this._lines,
      ghost: this._ghost,
      guides: [...guides, ...this._g3d],
      paths: [...paths, ...this._facePaths],
    });
  }

  /** The selected item, if it's drawn corner by corner (a site outline,
   * a free-form shape). */
  private _outlineItem(): FurnitureItem | undefined {
    const sel = this._sel;
    if (sel?.kind !== "item") return undefined;
    const item = this.layout?.furniture.find((f) => f.id === sel.id);
    return item && isOutlineKind(item.kind) && (item.points?.length ?? 0) >= 2
      ? item
      : undefined;
  }

  /** A site item: laid on the ground, not the floor. */
  private _onGround(item: FurnitureItem): boolean {
    return (
      item.kind.startsWith("site_") ||
      (isOutdoorKind(item.kind) && !this._roomAt([item.x, item.y]))
    );
  }

  /** The room of this floor's plan a point (plan units) is in. */
  private _roomAt(p: Pt): Room | undefined {
    return this.layout?.rooms.find(
      (r) => r.points.length >= 3 && pointInPolygon(p[0], p[1], r.points),
    );
  }

  /** The face of this floor's walls a point (metres, edit-floor frame)
   * stands against: the nearest within reach, facing `normal` (when
   * given) or whichever way the point lies. */
  private _faceAt(
    x: number,
    z: number,
    normal: [number, number] | null,
  ): WallFace | null {
    const layout = this.layout;
    if (!layout) return null;
    const m = metersPerUnit(layout.scale);
    let best: WallFace | null = null;
    let bestD = 0.35;
    for (const wall of layout.walls) {
      const off = wallThicknessCm(wall) / 200;
      for (let i = 0; i + 1 < wall.points.length; i++) {
        const ax = wall.points[i]![0] * m;
        const az = wall.points[i]![1] * m;
        const bx = wall.points[i + 1]![0] * m;
        const bz = wall.points[i + 1]![1] * m;
        const len = Math.hypot(bx - ax, bz - az);
        if (len < 0.2) continue;
        const ux = (bx - ax) / len;
        const uz = (bz - az) / len;
        if (normal && Math.abs(normal[0] * ux + normal[1] * uz) > 0.5) continue;
        const t = (x - ax) * ux + (z - az) * uz;
        if (t < -0.05 || t > len + 0.05) continue;
        let nx = -uz;
        let nz = ux;
        let side = (x - ax) * nx + (z - az) * nz;
        const flip = normal ? normal[0] * nx + normal[1] * nz < 0 : side < 0;
        if (flip) {
          nx = -nx;
          nz = -nz;
          side = -side;
        }
        const dist = Math.abs(side - off);
        if (side < -0.05 || dist >= bestD) continue;
        bestD = dist;
        best = { wallId: wall.id, ax, az, ux, uz, nx, nz, len, off };
      }
    }
    return best;
  }

  /** The other wall lights on this floor: where each hangs (metres, edit
   * floor's frame: its middle). */
  private _wallLights(except: string | null): {
    id: string;
    x: number;
    z: number;
    y: number;
  }[] {
    const layout = this.layout;
    const handle = this._handle;
    if (!layout || !handle) return [];
    const m = metersPerUnit(layout.scale);
    return layout.furniture.flatMap((f) => {
      if (f.id === except) return [];
      const entry = catalogItem(f.kind);
      if (entry?.opts["mount"] !== "wall") return [];
      const h = (f.height_cm ?? Number(entry.opts["h3d"] ?? 0.3) * 100) / 100;
      const elev =
        (f.elevation_cm ?? Number(entry.opts["y3d"] ?? 1.8) * 100) / 100;
      const room = this._roomAt([f.x, f.y]);
      const base = room
        ? (room.floor_offset_m ?? 0)
        : handle.groundHeight(f.x * m, f.y * m);
      return [{ id: f.id, x: f.x * m, z: f.y * m, y: base + elev + h / 2 }];
    });
  }

  /** A wall light at `t` along its face and `y` high (its middle, metres):
   * snapped to the face's centre, a gap's centre (between the wall's ends
   * and its doors and windows), an opening's centre, the spot mirroring
   * another light across a door or window, and level with the other wall
   * lights — with the guides that explain it, and the face outlined.
   * `free` (Shift) only outlines the face. */
  private _wallSnap(
    face: WallFace,
    t: number,
    y: number,
    except: string | null,
    free: boolean,
  ): { t: number; y: number } {
    const layout = this.layout;
    const handle = this._handle;
    const m = metersPerUnit(layout?.scale ?? null);
    const H = this.floorId ? this._wallHeight(this.floorId) : 2.4;
    const out = face.off + 0.02;
    const P = (tt: number, yy: number): [number, number, number] => [
      face.ax + face.ux * tt + face.nx * out,
      yy,
      face.az + face.uz * tt + face.nz * out,
    ];
    const mid = P(face.len / 2, 0);
    const base = Math.min(0, handle?.groundHeight(mid[0], mid[2]) ?? 0);
    this._facePaths = [
      {
        points: [
          P(0, base),
          P(face.len, base),
          P(face.len, H),
          P(0, H),
          P(0, base),
        ],
        color: FACE_COLOR,
      },
    ];
    this._g3d = [];
    t = Math.max(0, Math.min(face.len, t));
    if (free) return { t, y };
    // The doors and windows in this face, as spans along it.
    const spans = (layout?.openings ?? [])
      .filter((o) => o.wallId === face.wallId)
      .map((o) => {
        const c = (o.x * m - face.ax) * face.ux + (o.y * m - face.az) * face.uz;
        const across = Math.abs(
          (o.x * m - face.ax) * face.nx + (o.y * m - face.az) * face.nz,
        );
        const half = (o.width * m) / 2;
        return { c, lo: c - half, hi: c + half, across };
      })
      .filter((o) => o.across < 0.5 && o.hi > 0 && o.lo < face.len)
      .sort((a, b) => a.lo - b.lo);
    // Spots to centre on, each with the spans showing why.
    const spots: { t: number; marks: [number, number][] }[] = [
      { t: face.len / 2, marks: [[0, face.len]] },
    ];
    let start = 0;
    for (const o of [...spans, { c: face.len, lo: face.len, hi: face.len }]) {
      if (o.lo - start > 0.3)
        spots.push({ t: (start + o.lo) / 2, marks: [[start, o.lo]] });
      start = Math.max(start, o.hi);
    }
    for (const o of spans) spots.push({ t: o.c, marks: [[o.lo, o.hi]] });
    // Mirroring another light on this face across a door or window.
    const others = this._wallLights(except);
    for (const l of others) {
      const across = (l.x - face.ax) * face.nx + (l.z - face.az) * face.nz;
      if (across < -0.05 || across > face.off + 0.4) continue;
      const lt = (l.x - face.ax) * face.ux + (l.z - face.az) * face.uz;
      for (const o of spans) {
        if (lt <= o.lo)
          spots.push({
            t: o.hi + (o.lo - lt),
            marks: [
              [lt, o.lo],
              [o.hi, o.hi + (o.lo - lt)],
            ],
          });
        else if (lt >= o.hi)
          spots.push({
            t: o.lo - (lt - o.hi),
            marks: [
              [o.lo - (lt - o.hi), o.lo],
              [o.hi, lt],
            ],
          });
      }
    }
    let best: (typeof spots)[number] | null = null;
    for (const sp of spots)
      if (
        sp.t >= 0 &&
        sp.t <= face.len &&
        Math.abs(sp.t - t) < FACE_SNAP_M &&
        (!best || Math.abs(sp.t - t) < Math.abs(best.t - t))
      )
        best = sp;
    // Level with another wall light (the nearest one at that height).
    let level: (typeof others)[number] | null = null;
    for (const l of others)
      if (
        Math.abs(l.y - y) < LEVEL_SNAP_M &&
        (!level || Math.abs(l.y - y) < Math.abs(level.y - y))
      )
        level = l;
    if (best) {
      t = best.t;
      this._g3d.push({ points: [P(t, base), P(t, H)], color: CENTRE_COLOR });
    }
    if (level) {
      y = level.y;
      this._g3d.push({
        points: [[level.x, y, level.z], P(t, y)],
        color: LEVEL_COLOR,
      });
    } else y = Math.round(y * 20) / 20;
    // The spans it's centred in (or mirrored across), with end ticks.
    if (best)
      for (const [lo, hi] of best.marks) {
        const yy = y - 0.25;
        this._g3d.push({ points: [P(lo, yy), P(hi, yy)], color: CENTRE_COLOR });
        for (const e of [lo, hi])
          this._g3d.push({
            points: [P(e, yy - 0.08), P(e, yy + 0.08)],
            color: CENTRE_COLOR,
          });
      }
    return { t, y };
  }

  /** Where an outdoor light or planting goes under the pointer: a wall
   * light on the wall face it's over, turned out from it and hung where
   * the pointer is; anything else on the ground, a spotlight turned to
   * face the nearest wall. Plan units; elevation (cm) for a wall light. */
  private _outdoorSpot(
    e: EditPointer,
    entry: CatalogItem,
    m: number,
    grid: number,
  ): { at: Pt; rot: number; elevation: number | null; ghost: Box3d } | null {
    const handle = this._handle;
    const h = Math.max(0.05, Number(entry.opts["h3d"] ?? 0.5));
    const w = entry.w / 100;
    const d = entry.d / 100;
    const n = e.hit.normal;
    const p = e.hit.point;
    if (
      entry.opts["mount"] === "wall" &&
      // A wall's face, or a door or window in it (a light beside a door).
      (e.hit.ref?.kind === "wall" || e.hit.ref?.kind === "opening") &&
      p &&
      n &&
      Math.abs(n[1]) < 0.5 &&
      (!e.hit.floorId || e.hit.floorId === this.floorId)
    ) {
      const len = Math.hypot(n[0], n[2]) || 1;
      let nx = n[0] / len;
      let nz = n[2] / len;
      let px = p[0];
      let pz = p[2];
      let py = p[1];
      // On the face it's over, snapped level with the other wall lights
      // and centred (Shift: free).
      const face = this._faceAt(px, pz, [nx, nz]);
      if (face) {
        const snap = this._wallSnap(
          face,
          (px - face.ax) * face.ux + (pz - face.az) * face.uz,
          py,
          null,
          grid === 0,
        );
        nx = face.nx;
        nz = face.nz;
        px = face.ax + face.ux * snap.t + nx * face.off;
        pz = face.az + face.uz * snap.t + nz * face.off;
        py = snap.y;
      } else {
        this._g3d = [];
        this._facePaths = [];
      }
      const cx = px + (nx * d) / 2;
      const cz = pz + (nz * d) / 2;
      const a = Math.atan2(nx, nz);
      const at: Pt = [cx / m, cz / m];
      const room = this._roomAt(at);
      const base = room
        ? (room.floor_offset_m ?? 0)
        : (handle?.groundHeight(cx, cz) ?? 0);
      let elev = py - h / 2 - base;
      if (grid > 0 && !face) elev = Math.round(elev * 20) / 20;
      return {
        at,
        rot: ((((-a * 180) / Math.PI) % 360) + 360) % 360,
        elevation: Math.round(elev * 100),
        ghost: {
          x: cx,
          z: cz,
          y0: base + elev,
          y1: base + elev + h,
          length: w,
          depth: d,
          angle: a,
        },
      };
    }
    const g = this._groundAt(e);
    if (!g) return null;
    let at: Pt = [g[0] / m, g[2] / m];
    if (grid > 0)
      at = [Math.round(at[0] / grid) * grid, Math.round(at[1] / grid) * grid];
    let rot = this._armedRot;
    // A spotlight looks at the nearest wall (its front, local +z, toward
    // it).
    if (entry.opts["beam"] === "spot") {
      let best: Pt | null = null;
      let bestD = AIM_REACH_M / m;
      for (const wl of this._snapWalls()) {
        if (!wl.own) continue;
        const dx = wl.b[0] - wl.a[0];
        const dy = wl.b[1] - wl.a[1];
        const l2 = dx * dx + dy * dy;
        if (l2 <= 0) continue;
        const t = Math.max(
          0,
          Math.min(1, ((at[0] - wl.a[0]) * dx + (at[1] - wl.a[1]) * dy) / l2),
        );
        const q: Pt = [wl.a[0] + dx * t, wl.a[1] + dy * t];
        const dist = Math.hypot(q[0] - at[0], q[1] - at[1]);
        if (dist < bestD && dist > 1e-6) {
          bestD = dist;
          best = q;
        }
      }
      if (best) {
        const a = Math.atan2(best[0] - at[0], best[1] - at[1]);
        rot = Math.round(((((-a * 180) / Math.PI) % 360) + 360) % 360);
      }
    }
    const y3d = Number(entry.opts["y3d"] ?? 0);
    const room = this._roomAt(at);
    const base = room ? (room.floor_offset_m ?? 0) : g[1];
    return {
      at,
      rot,
      elevation: null,
      ghost: {
        x: at[0] * m,
        z: at[1] * m,
        y0: base + y3d,
        y1: base + y3d + h,
        length: w,
        depth: d,
        angle: (-rot * Math.PI) / 180,
      },
    };
  }

  /** The entities an item can stand for, the linkable domains in turn;
   * for a Hue fixture, the lights of its own model first. */
  private _linkOptions(item: FurnitureItem): SearchOption[] {
    const hass = this.hass;
    if (!hass) return [];
    const entry = catalogItem(item.kind);
    const hue =
      typeof entry?.opts["hue"] === "string"
        ? entry.opts["hue"].toLowerCase()
        : null;
    const suggested: SearchOption[] = [];
    const rest: SearchOption[] = [];
    const ids = Object.keys(hass.states).sort();
    for (const domain of LINK_DOMAINS)
      for (const id of ids) {
        if (!id.startsWith(`${domain}.`)) continue;
        const st = hass.states[id];
        const name = String(st?.attributes["friendly_name"] ?? id);
        const opt: SearchOption = {
          value: id,
          label: name,
          group: domain,
          secondary: id,
        };
        if (hue && domain === "light") {
          const dev = hass.entities?.[id]?.device_id;
          const model = dev ? hass.devices?.[dev]?.model : null;
          if (
            (typeof model === "string" && model.toLowerCase().includes(hue)) ||
            name.toLowerCase().includes(hue)
          ) {
            suggested.push({ ...opt, group: localize("edit3d.suggested") });
            continue;
          }
        }
        rest.push(opt);
      }
    return [...suggested, ...rest];
  }

  private _closedOutline(item: FurnitureItem): boolean {
    return isSurfaceKind(item.kind) || item.closed !== false;
  }

  /** Plan points as a line over the ground (or a level), each edge
   * sampled so it follows the ground's rise and fall. */
  private _drape(
    pts: Pt[],
    yAt: (q: Pt) => number,
  ): [number, number, number][] {
    const m = metersPerUnit(this.layout?.scale ?? null);
    const out: [number, number, number][] = [];
    pts.forEach((q, k) => {
      const prev = pts[k - 1];
      if (prev) {
        const len = Math.hypot(q[0] - prev[0], q[1] - prev[1]) * m;
        const n = Math.min(400, Math.ceil(len / 0.25));
        for (let s = 1; s < n; s++) {
          const t = s / n;
          const r: Pt = [
            prev[0] + (q[0] - prev[0]) * t,
            prev[1] + (q[1] - prev[1]) * t,
          ];
          out.push([r[0] * m, yAt(r), r[1] * m]);
        }
      }
      out.push([q[0] * m, yAt(q), q[1] * m]);
    });
    return out;
  }

  /** Where the pointer's ray meets the ground (edit-floor frame, metres),
   * past anything standing on it. */
  private _groundAt(e: EditPointer): [number, number, number] | null {
    const handle = this._handle;
    if (!handle) return null;
    const { o, d } = e.hit.ray;
    const above = (t: number) =>
      o[1] + d[1] * t - handle.groundHeight(o[0] + d[0] * t, o[2] + d[2] * t);
    let t0 = 0;
    if (above(0) <= 0) return null;
    // March out, then halve the step that crossed it.
    for (let t = 0.5; t < 600; t *= 1.08) {
      if (above(t) <= 0) {
        let lo = t0;
        let hi = t;
        for (let k = 0; k < 24; k++) {
          const mid = (lo + hi) / 2;
          if (above(mid) > 0) lo = mid;
          else hi = mid;
        }
        const x = o[0] + d[0] * hi;
        const z = o[2] + d[2] * hi;
        return [x, handle.groundHeight(x, z), z];
      }
      t0 = t;
    }
    return null;
  }

  /** The site's grading grid, as saved (or shown). */
  private _gradeGrid(): GroundGrid | null {
    if (this._drag?.kind === "grade" || this._drag?.kind === "gradePoint")
      return this._drag.grid;
    return this._ground?.grid ?? null;
  }

  /** Saves the grading (none when it's all level). */
  private _saveGrade(grid: GroundGrid | null): void {
    this._setGround({ grid: grid && !gridIsLevel(grid) ? grid : null });
  }

  /** The grid re-laid at a new spacing, the ground shaped as it was. */
  private _respaceGrade(step: number): void {
    this._gradeStep = step;
    const old = this._ground?.grid;
    if (!old || old.step === step) return;
    const x1 = old.x0 + (old.cols - 1) * old.step;
    const z1 = old.z0 + (old.rows - 1) * old.step;
    const next = growGrid(null, old.x0, old.z0, x1, z1, step);
    next.h = next.h.map((_, k) => {
      const x = next.x0 + (k % next.cols) * step;
      const z = next.z0 + Math.floor(k / next.cols) * step;
      return Math.round(gridOffset(old, x, z) * 1000) / 1000;
    });
    this._gradeNode = null;
    this._saveGrade(next);
  }

  /** Shows the length of the edge from `a` to `b` (plan units) beside
   * its middle, `y` metres up (edit-floor frame), with the whole line's
   * when there's more than that edge; feet and inches. */
  private _showMeasure(pts: Pt[], yAt: (q: Pt) => number): void {
    const a = pts[pts.length - 2];
    const b = pts[pts.length - 1];
    const handle = this._handle;
    if (!a || !b || !handle) {
      this._measure = null;
      return;
    }
    const m = metersPerUnit(this.layout?.scale ?? null);
    const len = (p: Pt, q: Pt) => Math.hypot(q[0] - p[0], q[1] - p[1]) * m;
    const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const at = handle.toScreen(mid[0] * m, yAt(mid), mid[1] * m);
    if (!at) {
      this._measure = null;
      return;
    }
    let total = 0;
    for (let k = 1; k < pts.length; k++) total += len(pts[k - 1]!, pts[k]!);
    this._measure = {
      x: at[0],
      y: at[1],
      seg: feetInches(len(a, b)),
      total: pts.length > 2 ? feetInches(total) : null,
    };
  }

  /** The yard tool's outline finished: a new site item through it. */
  private _finishYard(closedByClick: boolean): void {
    const layout = this.layout;
    const pts = this._draft.filter(
      (q, k, all) =>
        k === 0 ||
        Math.hypot(q[0] - all[k - 1]![0], q[1] - all[k - 1]![1]) > 1e-6,
    );
    this._draft = [];
    this._gradeCursor = null;
    this._guides = [];
    this._measure = null;
    const surface = isSurfaceKind(this._yardKind);
    const closed = surface || (closedByClick && pts.length >= 3);
    if (layout && pts.length >= (surface ? 3 : 2)) {
      const added = addOutlineItem(
        layout,
        this._yardKind,
        pts,
        closed,
        this._perCm,
      );
      if (added) {
        this._edit(added.patch);
        this._sel = { kind: "item", id: added.id };
        // Picked again once the layout with it arrives, if it's not yet.
        this._pendingSel = this._sel;
        this._outlineCorner = null;
        this._tool = "select";
      }
    }
    this._pushOverlay();
  }

  /** The building's walls to snap to: this floor's and every other
   * floor's (in this floor's plan units, with their levels relative to
   * it). */
  /** The yard's pieces as lines to snap to (paths, beds, fences, hedges:
   * their outlines), but `except`; and the edges drawn so far of one being
   * drawn (`draft`). Plan units. */
  private _yardLines(except: string | null, draft: Pt[] = []): SnapWall[] {
    const layout = this.layout;
    if (!layout) return [];
    const out: SnapWall[] = [];
    const line = (a: Pt, b: Pt) =>
      out.push({ own: true, a, b, level: 0, yard: true });
    for (const item of layout.furniture) {
      if (item.id === except || !item.kind.startsWith("site_")) continue;
      const pts = outlinePoints(item, this._perCm);
      if (pts.length < 2) continue;
      for (let i = 0; i + 1 < pts.length; i++) line(pts[i]!, pts[i + 1]!);
      if (this._closedOutline(item) && pts.length > 2)
        line(pts[pts.length - 1]!, pts[0]!);
    }
    for (let i = 0; i + 2 < draft.length; i++) line(draft[i]!, draft[i + 1]!);
    return out;
  }

  private _snapWalls(): SnapWall[] {
    const layout = this.layout;
    const own = this.floorId;
    if (!layout || !own) return [];
    const ids = this._contextFloorIds;
    const layouts = ids.map((id) => this._layoutOf(id));
    const key = [
      layout,
      ...layouts,
      ...ids.map((id) => this._floorBases.get(id)),
    ];
    const cached = this._snapCache;
    if (
      cached &&
      cached.key.length === key.length &&
      cached.key.every((k, i) => k === key[i])
    )
      return cached.walls;
    const m = metersPerUnit(layout.scale);
    const base = this._floorBases.get(own) ?? 0;
    const walls: SnapWall[] = [];
    ids.forEach((id, i) => {
      const l = layouts[i];
      if (!l) return;
      const k = metersPerUnit(l.scale) / m;
      const level = (this._floorBases.get(id) ?? base) - base;
      for (const w of l.walls) {
        if (wallThicknessCm(w) <= 6) continue;
        for (let j = 0; j + 1 < w.points.length; j++) {
          const a = w.points[j]!;
          const b = w.points[j + 1]!;
          walls.push({
            own: id === own,
            a: [a[0] * k, a[1] * k],
            b: [b[0] * k, b[1] * k],
            level,
          });
        }
      }
    });
    this._snapCache = { key, walls };
    return walls;
  }

  /** A wall's corners, without a closed outline's repeated last point. */
  private _cornerPoints(wall: Wall): Pt[] {
    const pts = wall.points as Pt[];
    const closed =
      pts.length > 2 &&
      Math.abs(pts[0]![0] - pts[pts.length - 1]![0]) < 1e-6 &&
      Math.abs(pts[0]![1] - pts[pts.length - 1]![1]) < 1e-6;
    return closed ? pts.slice(0, -1) : pts;
  }

  private _onEditPointer = (e: EditPointer): boolean => {
    const layout = this.layout;
    if (!layout || !this._editing) return false;
    const m = metersPerUnit(layout.scale);
    const toPlan = (p: [number, number] | null): Pt | null =>
      p ? [p[0] / m, p[1] / m] : null;
    // On a room's own floor where the pointer is over one (a sunken
    // garage sits below the floor's level), else on the floor's level.
    const floorPt =
      e.hit.ref?.kind === "room" && e.hit.point
        ? ([e.hit.point[0] / m, e.hit.point[2] / m] as Pt)
        : toPlan(e.hit.floor);
    const grid = e.shift ? 0 : 5 * this._perCm;
    const reach = 15 * this._perCm;
    const H = this.floorId ? this._wallHeight(this.floorId) : 2.4;
    const tool = this._tool;

    // --- another floor's thing, in the dollhouse: go and edit it there ---
    // (Not through a handle's dot: that's grabbed, whatever's behind it.)
    if (
      tool === "select" &&
      !this._drag &&
      e.hit.handle === null &&
      e.hit.floorId &&
      e.hit.floorId !== this.floorId
    ) {
      if (e.type === "move" && this._hover) {
        this._hover = null;
        this._pushOverlay();
      } else if (e.type === "click" && e.hit.ref) {
        this._pendingSel = e.hit.ref;
        this.dispatchEvent(
          new CustomEvent("select-floor", {
            detail: { floorId: e.hit.floorId },
            bubbles: true,
            composed: true,
          }),
        );
      }
      return false;
    }

    // --- drawing a driveway, path, bed or fence on the ground ---
    if (tool === "yard") {
      const g = this._groundAt(e);
      if (!g) return false;
      const raw: Pt = [g[0] / m, g[2] / m];
      const last = this._draft[this._draft.length - 1];
      const snapped = e.shift
        ? { p: raw, guides: [] }
        : smartSnap(
            raw,
            [...this._snapWalls(), ...this._yardLines(null, this._draft)],
            {
              // On the ground, from a way off: a wider catch.
              reach: reach * 2,
              grid,
              from: last ?? null,
              angle: !e.alt,
            },
          );
      const p = snapped.p;
      this._guides = snapped.guides;
      this._gradeCursor = [p[0] * m, p[1] * m];
      if (e.type === "click") {
        // Back on the first corner (its dot, or near it as seen from
        // here, before snapping) closes the outline.
        const first = this._draft[0];
        const { o } = e.hit.ray;
        const near = Math.max(
          reach * 2,
          (0.025 * Math.hypot(g[0] - o[0], g[1] - o[1], g[2] - o[2])) / m,
        );
        if (
          first &&
          this._draft.length >= 3 &&
          (e.hit.handle === 0 ||
            Math.hypot(raw[0] - first[0], raw[1] - first[1]) < near)
        ) {
          this._finishYard(true);
          return false;
        }
        if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 1e-6)
          this._draft = [...this._draft, p];
      } else if (e.type === "dblclick") {
        this._finishYard(false);
        return false;
      }
      this._showMeasure([...this._draft, p], (q) =>
        this._handle ? this._handle.groundHeight(q[0] * m, q[1] * m) : 0,
      );
      this._pushOverlay();
      return false;
    }

    // --- shaping the ground ---
    if (tool === "grade") {
      const g = this._groundAt(e);
      const drag = this._drag;
      if (e.type === "up" && drag) {
        this._drag = null;
        if (drag.kind === "grade" || drag.kind === "gradePoint")
          this._saveGrade(drag.grid);
        this._pushOverlay();
        return false;
      }
      if (drag?.kind === "gradePoint" && e.type === "drag") {
        // Up or down the point's own upright, where the pointer passes.
        const { o, d } = e.hit.ray;
        const nx = drag.grid.x0 + drag.i * drag.grid.step;
        const nz = drag.grid.z0 + drag.j * drag.grid.step;
        const hh = d[0] * d[0] + d[2] * d[2];
        if (hh < 1e-6) return false;
        const t = ((nx - o[0]) * d[0] + (nz - o[2]) * d[2]) / hh;
        let v = o[1] + d[1] * t - drag.base;
        v = e.shift ? v : Math.round(v * 20) / 20;
        v = Math.max(-10, Math.min(10, v));
        const h = drag.grid.h.slice();
        h[drag.j * drag.grid.cols + drag.i] = Math.round(v * 1000) / 1000;
        drag.grid = { ...drag.grid, h };
        this._handle?.previewGrade(drag.grid);
        this._pushOverlay();
        return false;
      }
      if (!g) return false;
      this._gradeCursor = [g[0], g[2]];
      if (e.type === "move") {
        this._pushOverlay();
        return false;
      }
      const r = this._gradeRadius;
      const feather = this._gradeFeather;
      // As far as a dab reaches, its feathered edge included.
      const outer = r + feather;
      if (e.type === "down") {
        if (!this._ground) this._setGround({});
        const saved = this._ground?.grid ?? null;
        const step = saved?.step ?? this._gradeStep;
        const reachOut = this._gradeMode === "point" ? step : outer + step;
        const grown = growGrid(
          saved,
          g[0] - reachOut,
          g[2] - reachOut,
          g[0] + reachOut,
          g[2] + reachOut,
          step,
        );
        if (this._gradeMode === "point") {
          const node = nearestNode(grown, g[0], g[2]);
          if (!node) return false;
          this._gradeNode = node;
          const nx = grown.x0 + node.i * step;
          const nz = grown.z0 + node.j * step;
          // The ground there less the point's own raise (as shown).
          const ground = this._handle?.groundHeight(nx, nz) ?? 0;
          this._drag = {
            kind: "gradePoint",
            grid: grown,
            i: node.i,
            j: node.j,
            base: ground - gridOffset(saved, nx, nz),
          };
          this._pushOverlay();
          return true;
        }
        const level = gridOffset(grown, g[0], g[2]);
        const dabbed = brushGrid(
          grown,
          g[0],
          g[2],
          r,
          this._gradeStrength,
          this._gradeMode,
          level,
          feather,
        );
        this._drag = { kind: "grade", grid: dabbed, last: [g[0], g[2]], level };
        this._handle?.previewGrade(dabbed);
        this._pushOverlay();
        return true;
      }
      if (e.type === "drag" && drag?.kind === "grade") {
        // A dab every quarter of the brush along the stroke.
        if (Math.hypot(g[0] - drag.last[0], g[2] - drag.last[1]) < outer / 4) {
          this._pushOverlay();
          return false;
        }
        const step = drag.grid.step;
        const grown = growGrid(
          drag.grid,
          g[0] - outer - step,
          g[2] - outer - step,
          g[0] + outer + step,
          g[2] + outer + step,
          step,
        );
        drag.grid = brushGrid(
          grown,
          g[0],
          g[2],
          r,
          this._gradeStrength,
          this._gradeMode === "point" ? "raise" : this._gradeMode,
          drag.level,
          feather,
        );
        drag.last = [g[0], g[2]];
        this._handle?.previewGrade(drag.grid);
        this._pushOverlay();
      }
      return false;
    }
    // --- drawing a wall ---
    if (tool === "wall") {
      if (!floorPt) return false;
      const last = this._draft[this._draft.length - 1];
      // Shift places it freely; else it snaps to every floor's walls.
      const snapped = e.shift
        ? { p: floorPt, guides: [] }
        : smartSnap(floorPt, this._snapWalls(), {
            reach,
            grid,
            from: last ?? null,
            angle: !e.alt,
          });
      const p = snapped.p;
      this._guides = snapped.guides;
      if (e.type === "move" || e.type === "click") {
        if (e.type === "click") {
          const first = this._draft[0];
          if (
            first &&
            this._draft.length >= 3 &&
            Math.hypot(p[0] - first[0], p[1] - first[1]) < reach
          ) {
            this._finishWall([...this._draft, first]);
            return false;
          }
          if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 1e-6)
            this._draft = [...this._draft, p];
        }
        const pts = [...this._draft, p];
        this._ghost = pts
          .slice(1)
          .map((b, k) => this._segBox(pts[k]!, b, NEW_WALL_CM, 0, H));
        this._lines = [pts.map((q) => [q[0] * m, H + 0.02, q[1] * m])];
        this._showMeasure(pts, () => H + 0.02);
        this._pushOverlay();
      } else if (e.type === "dblclick") {
        this._finishWall(this._draft);
      }
      return false;
    }

    // --- placing a door or window ---
    if (tool === "door" || tool === "window") {
      const wall =
        e.hit.ref?.kind === "wall" ? this._wallOf(e.hit.ref.id) : undefined;
      const at = e.hit.point
        ? ([e.hit.point[0] / m, e.hit.point[2] / m] as Pt)
        : floorPt;
      const widthCm = tool === "door" ? DOOR_WIDTH_CM : WINDOW_WIDTH_CM;
      const width = widthCm * this._perCm;
      const spot = wall && at ? spotOnWall(wall, at, width / 2) : null;
      if (e.type === "move") {
        if (wall && spot) {
          const a = wall.points[spot.seg] as Pt;
          const b = wall.points[spot.seg + 1] as Pt;
          const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
          const ux = (b[0] - a[0]) / len;
          const uy = (b[1] - a[1]) / len;
          const half = width / 2;
          const p0: Pt = [spot.at[0] - ux * half, spot.at[1] - uy * half];
          const p1: Pt = [spot.at[0] + ux * half, spot.at[1] + uy * half];
          this._ghost = [
            this._segBox(
              p0,
              p1,
              wallThicknessCm(wall) + 4,
              tool === "door" ? 0 : 0.9,
              2.1,
            ),
          ];
        } else this._ghost = [];
        this._pushOverlay();
      } else if (e.type === "click" && wall && spot) {
        const { patch, id } = addOpening(layout, wall, spot.at, tool, width);
        this._edit(patch);
        this._sel = { kind: "opening", id };
        this._ghost = [];
        if (!e.shift) this._tool = "select";
        this._pushOverlay();
      }
      return false;
    }

    // --- placing an outdoor light or a planting ---
    if (
      tool === "outdoor" ||
      (tool === "object" && this._armedKind && isOutdoorKind(this._armedKind))
    ) {
      const entry = this._armedKind ? catalogItem(this._armedKind) : undefined;
      if (!entry) return false;
      const spot = this._outdoorSpot(e, entry, m, grid);
      if (e.type === "move") {
        this._ghost = spot ? [spot.ghost] : [];
        this._pushOverlay();
      } else if (e.type === "click" && spot) {
        const added = addItem(layout, entry.id, spot.at, spot.rot);
        if (added) {
          const furniture = (added.patch.furniture ?? []).map((f) =>
            f.id === added.id && spot.elevation !== null
              ? { ...f, elevation_cm: spot.elevation }
              : f,
          );
          this._edit({ furniture });
          this._sel = { kind: "item", id: added.id };
        }
        if (!e.shift) {
          this._tool = "select";
          this._armedKind = null;
          this._ghost = [];
        }
        this._pushOverlay();
      }
      return false;
    }

    // --- placing an object ---
    if (tool === "object") {
      const entry = this._armedKind ? catalogItem(this._armedKind) : undefined;
      if (!entry || !floorPt) return false;
      const p = snapPoint({ ...layout, walls: [] }, floorPt, grid, 0);
      if (e.type === "move") {
        const a = (-this._armedRot * Math.PI) / 180;
        this._ghost = [
          {
            x: p[0] * m,
            z: p[1] * m,
            y0: 0,
            y1: 0.8,
            length: entry.w / 100,
            depth: entry.d / 100,
            angle: a,
          },
        ];
        this._pushOverlay();
      } else if (e.type === "click") {
        const added = addItem(layout, entry.id, p, this._armedRot);
        if (added) {
          this._edit(added.patch);
          this._sel = { kind: "item", id: added.id };
        }
        if (!e.shift) {
          this._tool = "select";
          this._armedKind = null;
          this._ghost = [];
        }
        this._pushOverlay();
      }
      return false;
    }

    // --- selecting and dragging ---
    const sel = this._sel;
    if (e.type === "move") {
      const hover = e.hit.ref;
      if (JSON.stringify(hover) !== JSON.stringify(this._hover)) {
        this._hover = hover;
        this._pushOverlay();
      }
      return false;
    }
    if (e.type === "down") {
      const outline = this._outlineItem();
      if (e.hit.handle !== null && outline && !outline.locked) {
        const pts = outlinePoints(outline, this._perCm);
        // An edge's middle dot: a new corner there, dragged from there.
        const edge = e.hit.handle - pts.length;
        if (edge >= 0 && edge < this._outlineEdges(outline, pts).length) {
          const a = pts[edge]!;
          const b = pts[(edge + 1) % pts.length]!;
          const index = edge + 1;
          const next = [
            ...pts.slice(0, index),
            [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as Pt,
            ...pts.slice(index),
          ];
          const corners = outline.corners?.length
            ? [
                ...outline.corners.slice(0, index),
                outline.corners[edge] ?? 0,
                ...outline.corners.slice(index),
              ]
            : null;
          this._outlineCorner = index;
          this._drag = {
            kind: "outline",
            id: outline.id,
            index,
            pts: next,
            moved: true,
            corners,
          };
          this._pushOverlay();
          return true;
        }
        if (pts[e.hit.handle]) {
          this._outlineCorner = e.hit.handle;
          this._drag = {
            kind: "outline",
            id: outline.id,
            index: e.hit.handle,
            pts,
            moved: false,
          };
          this._pushOverlay();
          return true;
        }
      }
      if (e.hit.handle !== null && sel?.kind === "wall") {
        const wall = this._wallOf(sel.id);
        const corner = wall
          ? this._cornerPoints(wall)[e.hit.handle]
          : undefined;
        if (wall && corner) {
          this._drag = {
            kind: "corner",
            wallId: wall.id,
            index: e.hit.handle,
            from: corner,
            to: corner,
          };
          this._pushOverlay();
          return true;
        }
      }
      const ref = e.hit.ref;
      if (
        !ref ||
        !sel ||
        ref.kind !== sel.kind ||
        ref.id !== sel.id ||
        !floorPt
      )
        return false;
      if (ref.kind === "item") {
        const item = layout.furniture.find((f) => f.id === ref.id);
        if (!item || item.locked) return false;
        // A wall light slides over the face it hangs on.
        const wallEntry = catalogItem(item.kind);
        if (wallEntry?.opts["mount"] === "wall") {
          const a = (-item.rotation_deg * Math.PI) / 180;
          const face = this._faceAt(item.x * m, item.y * m, [
            Math.sin(a),
            Math.cos(a),
          ]);
          if (face) {
            this._drag = {
              kind: "wallItem",
              id: item.id,
              face,
              h:
                (item.height_cm ?? Number(wallEntry.opts["h3d"] ?? 0.3) * 100) /
                100,
              d: item.depth_cm / 100,
              at: [item.x, item.y],
              elev:
                item.elevation_cm ?? Number(wallEntry.opts["y3d"] ?? 1.8) * 100,
              rot: item.rotation_deg,
              moved: false,
            };
            return true;
          }
        }
        // A site item slides over the ground.
        const g = this._onGround(item) ? this._groundAt(e) : null;
        const from: Pt = g ? [g[0] / m, g[2] / m] : floorPt;
        this._drag = {
          kind: "item",
          id: item.id,
          offset: [item.x - from[0], item.y - from[1]],
          at: [item.x, item.y],
        };
        return true;
      }
      if (ref.kind === "wall" && ref.seg !== undefined) {
        this._drag = {
          kind: "seg",
          wallId: ref.id,
          seg: ref.seg,
          start: floorPt,
          d: 0,
        };
        return true;
      }
      if (ref.kind === "opening") {
        const o = layout.openings.find((x) => x.id === ref.id);
        if (!o) return false;
        this._drag = {
          kind: "opening",
          id: o.id,
          wallId: o.wallId,
          at: [o.x, o.y],
        };
        return true;
      }
      return false;
    }
    if (e.type === "drag" && this._drag?.kind === "wallItem") {
      const drag = this._drag;
      const f = drag.face;
      // Where the pointer's ray meets the face's plane.
      const { o, d } = e.hit.ray;
      const fx = f.ax + f.nx * f.off;
      const fz = f.az + f.nz * f.off;
      const den = d[0] * f.nx + d[2] * f.nz;
      if (Math.abs(den) < 1e-4) return false;
      const s = ((fx - o[0]) * f.nx + (fz - o[2]) * f.nz) / den;
      if (s <= 0) return false;
      const px = o[0] + d[0] * s;
      const py = o[1] + d[1] * s;
      const pz = o[2] + d[2] * s;
      const snap = this._wallSnap(
        f,
        (px - f.ax) * f.ux + (pz - f.az) * f.uz,
        py,
        drag.id,
        e.shift,
      );
      const cx = f.ax + f.ux * snap.t + f.nx * (f.off + drag.d / 2);
      const cz = f.az + f.uz * snap.t + f.nz * (f.off + drag.d / 2);
      const at: Pt = [cx / m, cz / m];
      const room = this._roomAt(at);
      const base = room
        ? (room.floor_offset_m ?? 0)
        : (this._handle?.groundHeight(cx, cz) ?? 0);
      const y0 = snap.y - drag.h / 2;
      const angle = Math.atan2(f.nx, f.nz);
      drag.at = at;
      drag.elev = Math.round((y0 - base) * 100);
      drag.rot = ((((-angle * 180) / Math.PI) % 360) + 360) % 360;
      drag.moved = true;
      this._handle?.previewItem(drag.id, cx, cz, angle, y0);
      this._pushOverlay();
      return false;
    }
    if (e.type === "drag" && this._drag?.kind === "outline") {
      const drag = this._drag;
      const item = layout.furniture.find((f) => f.id === drag.id);
      if (!item) return false;
      const g = this._onGround(item) ? this._groundAt(e) : null;
      const raw: Pt | null = g ? [g[0] / m, g[2] / m] : floorPt;
      if (!raw) return false;
      // Against the house and the other yard pieces, square to the corner
      // before it.
      const prev =
        drag.pts.length > 1
          ? (drag.pts[(drag.index - 1 + drag.pts.length) % drag.pts.length] ??
            null)
          : null;
      const snapped = e.shift
        ? { p: raw, guides: [] }
        : smartSnap(
            raw,
            this._onGround(item)
              ? [...this._snapWalls(), ...this._yardLines(item.id)]
              : this._snapWalls(),
            { reach: reach * 2, grid, angle: !e.alt && !!prev, from: prev },
          );
      this._guides = snapped.guides;
      drag.pts = drag.pts.map((q, k) => (k === drag.index ? snapped.p : q));
      drag.moved = true;
      this._pushOverlay();
      return false;
    }
    if (e.type === "drag" && this._drag && floorPt) {
      const drag = this._drag;
      if (drag.kind === "item") {
        const item = layout.furniture.find((f) => f.id === drag.id);
        if (!item) return false;
        const g = this._onGround(item) ? this._groundAt(e) : null;
        const at: Pt = g ? [g[0] / m, g[2] / m] : floorPt;
        const raw: Pt = [at[0] + drag.offset[0], at[1] + drag.offset[1]];
        drag.at =
          grid > 0
            ? [
                Math.round(raw[0] / grid) * grid,
                Math.round(raw[1] / grid) * grid,
              ]
            : raw;
        this._handle?.previewItem(
          item.id,
          drag.at[0] * m,
          drag.at[1] * m,
          (-item.rotation_deg * Math.PI) / 180,
        );
      } else if (drag.kind === "seg") {
        const wall = this._wallOf(drag.wallId);
        const a = wall?.points[drag.seg] as Pt | undefined;
        const b = wall?.points[drag.seg + 1] as Pt | undefined;
        if (!wall || !a || !b) return false;
        let d = offsetFrom(a, b, floorPt) - offsetFrom(a, b, drag.start);
        const step = e.shift ? 0 : 1 * this._perCm;
        if (step > 0) d = Math.round(d / step) * step;
        // Onto a parallel wall's line: this floor's, or one above or below.
        this._guides = [];
        if (!e.shift) {
          const snapped = snapOffset(a, b, d, this._snapWalls(), reach);
          d = snapped.d;
          if (snapped.guide) this._guides = [snapped.guide];
        }
        drag.d = d;
        this._ghostFor(
          moveSegment(layout, wall.id, drag.seg, d, 1.5 * this._perCm),
          H,
        );
      } else if (drag.kind === "corner") {
        const snapped = e.shift
          ? { p: floorPt, guides: [] }
          : smartSnap(floorPt, this._snapWalls(), {
              reach,
              grid,
              angle: false,
              except: drag.from,
            });
        const p = snapped.p;
        this._guides = snapped.guides;
        drag.to = p;
        this._ghostFor(
          moveCorners(layout, [{ from: drag.from, to: p }], 1.5 * this._perCm),
          H,
        );
      } else if (drag.kind === "opening") {
        const o = layout.openings.find((x) => x.id === drag.id);
        const hitWall =
          e.hit.ref?.kind === "wall" ? this._wallOf(e.hit.ref.id) : undefined;
        const wall = hitWall ?? this._wallOf(drag.wallId);
        if (!o || !wall) return false;
        const spot = spotOnWall(wall, floorPt, o.width / 2);
        if (!spot) return false;
        drag.at = spot.at;
        drag.wallId = wall.id;
        const a = wall.points[spot.seg] as Pt;
        const b = wall.points[spot.seg + 1] as Pt;
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const ux = (b[0] - a[0]) / len;
        const uy = (b[1] - a[1]) / len;
        const half = o.width / 2;
        this._ghost = [
          this._segBox(
            [spot.at[0] - ux * half, spot.at[1] - uy * half],
            [spot.at[0] + ux * half, spot.at[1] + uy * half],
            wallThicknessCm(wall) + 4,
            o.type === "door" ? 0 : 0.9,
            2.1,
          ),
        ];
        this._pushOverlay();
      }
      return false;
    }
    if (e.type === "up" && this._drag) {
      const drag = this._drag;
      this._drag = null;
      this._ghost = [];
      this._guides = [];
      if (drag.kind === "outline") {
        const item = layout.furniture.find((f) => f.id === drag.id);
        if (item && drag.moved)
          this._edit(
            patchItem(layout, item.id, {
              ...fitOutline(item, drag.pts, this._perCm),
              ...(drag.corners ? { corners: drag.corners } : {}),
            }),
          );
      } else if (drag.kind === "wallItem") {
        if (drag.moved)
          this._edit(
            patchItem(layout, drag.id, {
              x: drag.at[0],
              y: drag.at[1],
              elevation_cm: drag.elev,
              rotation_deg: drag.rot,
            }),
          );
        this._g3d = [];
        this._facePaths = [];
      } else if (drag.kind === "item") {
        const item = layout.furniture.find((f) => f.id === drag.id);
        if (item && (item.x !== drag.at[0] || item.y !== drag.at[1]))
          this._edit(
            patchItem(layout, drag.id, { x: drag.at[0], y: drag.at[1] }),
          );
      } else if (drag.kind === "seg" && Math.abs(drag.d) > 1e-9) {
        const wall = this._wallOf(drag.wallId);
        const a = wall?.points[drag.seg] as Pt | undefined;
        const b = wall?.points[drag.seg + 1] as Pt | undefined;
        this._edit(
          moveSegment(layout, drag.wallId, drag.seg, drag.d, 1.5 * this._perCm),
        );
        if (a && b) this._roofFollow(a, b, drag.d);
      } else if (
        drag.kind === "corner" &&
        (drag.to[0] !== drag.from[0] || drag.to[1] !== drag.from[1])
      ) {
        this._edit(
          moveCorners(
            layout,
            [{ from: drag.from, to: drag.to }],
            1.5 * this._perCm,
          ),
        );
      } else if (drag.kind === "opening") {
        this._edit(
          patchOpening(layout, drag.id, {
            x: drag.at[0],
            y: drag.at[1],
            wallId: drag.wallId,
          }),
        );
      }
      this._pushOverlay();
      // Once the edit (if any) has reached the layout.
      if (this._rebuildHeld) setTimeout(() => this._rebuild(), 0);
      return false;
    }
    if (e.type === "click") {
      // A corner's dot: that corner picked (its curve, Delete).
      const picked = this._outlineItem();
      if (e.hit.handle !== null && picked) {
        // A corner's own dot (an edge's was picked when it was pressed).
        if (e.hit.handle < (picked.points?.length ?? 0))
          this._outlineCorner = e.hit.handle;
        this._pushOverlay();
        return false;
      }
      this._pendingSel = null;
      if (JSON.stringify(e.hit.ref) !== JSON.stringify(this._sel))
        this._outlineCorner = null;
      this._sel = e.hit.ref;
      this._hover = null;
      this._pushOverlay();
      return false;
    }
    if (e.type === "dblclick") {
      // A new corner on an outline's nearest edge.
      const item = this._outlineItem();
      if (item && e.hit.ref?.kind === "item" && e.hit.ref.id === item.id) {
        const g = this._onGround(item) ? this._groundAt(e) : null;
        const at: Pt | null = g ? [g[0] / m, g[2] / m] : floorPt;
        if (at) this._insertOutlineCorner(item, at);
        return false;
      }
    }
    if (e.type === "dblclick" && e.hit.ref?.kind === "wall" && e.hit.point) {
      // A new corner where the wall was double-clicked.
      const wall = this._wallOf(e.hit.ref.id);
      const seg = e.hit.ref.seg;
      if (wall && seg !== undefined) {
        const spot = spotOnWall(
          wall,
          [e.hit.point[0] / m, e.hit.point[2] / m],
          0,
        );
        if (spot) this._edit(insertCorner(layout, wall.id, spot.seg, spot.at));
      }
    }
    return false;
  };

  /** An outline's edges (corner to corner, round to the first when it's
   * closed). */
  private _outlineEdges(item: FurnitureItem, pts: Pt[]): [Pt, Pt][] {
    const n = pts.length;
    const count = this._closedOutline(item) ? n : n - 1;
    return Array.from({ length: Math.max(0, count) }, (_, k): [Pt, Pt] => [
      pts[k]!,
      pts[(k + 1) % n]!,
    ]);
  }

  /** A corner added to an outline on its edge nearest a spot. */
  private _insertOutlineCorner(item: FurnitureItem, at: Pt): void {
    const layout = this.layout;
    if (!layout) return;
    const pts = outlinePoints(item, this._perCm);
    const closed = this._closedOutline(item);
    let best = -1;
    let bestD = Infinity;
    let bestP: Pt = at;
    const n = pts.length;
    for (let k = 0; k < (closed ? n : n - 1); k++) {
      const a = pts[k]!;
      const b = pts[(k + 1) % n]!;
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const len2 = dx * dx + dy * dy || 1;
      const t = Math.max(
        0,
        Math.min(1, ((at[0] - a[0]) * dx + (at[1] - a[1]) * dy) / len2),
      );
      const q: Pt = [a[0] + dx * t, a[1] + dy * t];
      const dd = Math.hypot(at[0] - q[0], at[1] - q[1]);
      if (dd < bestD) {
        bestD = dd;
        best = k;
        bestP = q;
      }
    }
    if (best < 0) return;
    const next = [...pts.slice(0, best + 1), bestP, ...pts.slice(best + 1)];
    const corners = item.corners?.length
      ? [
          ...item.corners.slice(0, best + 1),
          item.corners[best] ?? 0,
          ...item.corners.slice(best + 1),
        ]
      : item.corners;
    this._edit(
      patchItem(layout, item.id, {
        ...fitOutline(item, next, this._perCm),
        ...(corners ? { corners } : {}),
      }),
    );
    this._outlineCorner = best + 1;
  }

  /** An outline's corner taken out (the item, if too few would be left). */
  private _deleteOutlineCorner(item: FurnitureItem, index: number): void {
    const layout = this.layout;
    if (!layout) return;
    const pts = outlinePoints(item, this._perCm);
    if (pts.length - 1 < (this._closedOutline(item) ? 3 : 2)) {
      this._deleteSelection();
      return;
    }
    const next = pts.filter((_, k) => k !== index);
    const corners = item.corners?.length
      ? item.corners.filter((_, k) => k !== index)
      : item.corners;
    this._edit(
      patchItem(layout, item.id, {
        ...fitOutline(item, next, this._perCm),
        ...(corners ? { corners } : {}),
      }),
    );
    this._outlineCorner = null;
  }

  /** The roof's parts follow a wall moved square to itself (plan units,
   * `d` along its left-hand normal): an edge of a part lying on its line
   * and overlapping it moves with it, so the roof still meets the wall. */
  private _roofFollow(a: Pt, b: Pt, d: number): void {
    const plan = this._roofPlan;
    const layout = this.layout;
    if (!plan?.parts.length || !layout) return;
    // The parts are in the building's lowest floor's plan units.
    const ids = this._buildingFloorIds;
    const lowestId = [...ids].sort(
      (x, y) => (this._floorBases.get(x) ?? 0) - (this._floorBases.get(y) ?? 0),
    )[0];
    const lowest = lowestId ? this._layoutOf(lowestId) : null;
    const k =
      metersPerUnit(layout.scale) /
      metersPerUnit(lowest?.scale ?? layout.scale);
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (len <= 0) return;
    const nx = (-(b[1] - a[1]) / len) * d * k;
    const ny = ((b[0] - a[0]) / len) * d * k;
    const tol = 3 * this._perCm * k;
    const horizontal = Math.abs(a[1] - b[1]) * k <= tol;
    const vertical = Math.abs(a[0] - b[0]) * k <= tol;
    if (!horizontal && !vertical) return;
    const line = horizontal ? ((a[1] + b[1]) / 2) * k : ((a[0] + b[0]) / 2) * k;
    const lo = (horizontal ? Math.min(a[0], b[0]) : Math.min(a[1], b[1])) * k;
    const hi = (horizontal ? Math.max(a[0], b[0]) : Math.max(a[1], b[1])) * k;
    let changed = false;
    const parts = plan.parts.map((part) => {
      const [s0, s1] = horizontal ? [part.x0, part.x1] : [part.y0, part.y1];
      const overlaps =
        Math.min(hi, Math.max(s0, s1)) - Math.max(lo, Math.min(s0, s1)) > tol;
      if (!overlaps) return part;
      const next = { ...part };
      if (horizontal) {
        if (Math.abs(part.y0 - line) <= tol) next.y0 = part.y0 + ny;
        if (Math.abs(part.y1 - line) <= tol) next.y1 = part.y1 + ny;
      } else {
        if (Math.abs(part.x0 - line) <= tol) next.x0 = part.x0 + nx;
        if (Math.abs(part.x1 - line) <= tol) next.x1 = part.x1 + nx;
      }
      if (
        next.x0 !== part.x0 ||
        next.x1 !== part.x1 ||
        next.y0 !== part.y0 ||
        next.y1 !== part.y1
      )
        changed = true;
      return next;
    });
    if (changed) this._setRoof({ ...plan, parts });
  }

  /** Previews the walls a change would move, as boxes. */
  private _ghostFor(patch: LayoutPatch, H: number): void {
    const layout = this.layout;
    if (!layout || !patch.walls) return;
    const ghost: Box3d[] = [];
    patch.walls.forEach((w, k) => {
      const old = layout.walls[k];
      if (old && old.points === w.points) return;
      if (old && JSON.stringify(old.points) === JSON.stringify(w.points))
        return;
      const t = wallThicknessCm(w);
      for (let i = 0; i + 1 < w.points.length; i++)
        ghost.push(
          this._segBox(w.points[i] as Pt, w.points[i + 1] as Pt, t, 0, H),
        );
    });
    this._ghost = ghost;
    this._pushOverlay();
  }

  private _finishWall(points: Pt[]): void {
    const layout = this.layout;
    const pts = points.filter(
      (p, k) =>
        k === 0 ||
        Math.hypot(p[0] - points[k - 1]![0], p[1] - points[k - 1]![1]) > 1e-6,
    );
    this._draft = [];
    this._ghost = [];
    this._lines = [];
    this._guides = [];
    this._measure = null;
    if (layout && pts.length >= 2) {
      const { patch, id } = addWall(layout, pts);
      this._edit(patch);
      this._sel = { kind: "wall", id, seg: 0 };
      this._tool = "select";
    }
    this._pushOverlay();
  }

  private _deleteSelection(): void {
    const layout = this.layout;
    const sel = this._sel;
    if (!layout || !sel) return;
    if (sel.kind === "item") this._edit(deleteItem(layout, sel.id));
    else if (sel.kind === "wall") this._edit(deleteWall(layout, sel.id));
    else if (sel.kind === "opening") this._edit(deleteOpening(layout, sel.id));
    else return;
    this._sel = null;
    this._pushOverlay();
  }

  private _onEditKey = (e: KeyboardEvent): void => {
    if (!this._editing) return;
    const path = e.composedPath();
    const target = path[0] as HTMLElement | undefined;
    if (
      target &&
      (target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA")
    )
      return;
    const layout = this.layout;
    const key = e.key;
    const mod = e.ctrlKey || e.metaKey;
    const take = () => {
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    if (key === "Escape") {
      take();
      if (this._drag) {
        this._drag = null;
        this._ghost = [];
        this._sceneSig = "";
        this._rebuild();
      } else if (this._draft.length) this._setTool(this._tool);
      else if (this._tool !== "select") this._setTool("select");
      else {
        this._sel = null;
        this._pushOverlay();
      }
      return;
    }
    if (key === "Enter" && this._tool === "wall") {
      take();
      this._finishWall(this._draft);
      return;
    }
    if (key === "Enter" && this._tool === "yard") {
      take();
      this._finishYard(false);
      return;
    }
    if (
      (key === "Delete" || key === "Backspace") &&
      (this._tool === "wall" || this._tool === "yard") &&
      this._draft.length
    ) {
      take();
      this._draft = this._draft.slice(0, -1);
      this._pushOverlay();
      return;
    }
    if ((key === "Delete" || key === "Backspace") && this._sel) {
      take();
      const outline = this._outlineItem();
      if (outline && this._outlineCorner !== null) {
        this._deleteOutlineCorner(outline, this._outlineCorner);
        return;
      }
      this._deleteSelection();
      return;
    }
    if (!mod && key.toLowerCase() === "r" && layout) {
      const step = e.shiftKey ? 15 : 90;
      if (this._tool === "object" || this._tool === "outdoor") {
        take();
        this._armedRot = (this._armedRot + step) % 360;
        return;
      }
      if (this._sel?.kind === "item") {
        const item = layout.furniture.find((f) => f.id === this._sel!.id);
        if (item) {
          take();
          this._edit(
            patchItem(layout, item.id, {
              rotation_deg: (item.rotation_deg + step) % 360,
            }),
          );
        }
      }
      return;
    }
    if (
      mod &&
      key.toLowerCase() === "d" &&
      layout &&
      this._sel?.kind === "item"
    ) {
      take();
      const copy = duplicateItem(layout, this._sel.id, 20 * this._perCm);
      if (copy) {
        this._edit(copy.patch);
        this._sel = { kind: "item", id: copy.id };
        this._pushOverlay();
      }
    }
  };

  // --- editor panel -------------------------------------------------------------

  private _num(
    label: string,
    value: number | null,
    onChange: (v: number | null) => void,
    opts: {
      unit?: string;
      step?: number;
      min?: number;
      max?: number;
      placeholder?: string;
    } = {},
  ) {
    return html`<label class="row">
      <span>${label}</span>
      <input
        type="number"
        step=${opts.step ?? 1}
        min=${opts.min ?? nothing}
        max=${opts.max ?? nothing}
        placeholder=${opts.placeholder ?? ""}
        .value=${value === null ? "" : String(Math.round(value * 10) / 10)}
        @change=${(e: Event) => {
          const raw = (e.target as HTMLInputElement).value.trim();
          const v = raw === "" ? null : Number(raw);
          if (v === null || Number.isFinite(v)) onChange(v);
        }}
      />
      <span class="unit">${opts.unit ?? ""}</span>
    </label>`;
  }

  private _color(
    label: string,
    value: string | null | undefined,
    onChange: (v: string | null) => void,
  ) {
    return html`<div class="row">
      <span>${label}</span>
      <input
        type="color"
        .value=${value ?? "#ffffff"}
        @change=${(e: Event) => onChange((e.target as HTMLInputElement).value)}
      />
      <button
        class="icon"
        title=${localize("edit3d.auto")}
        ?disabled=${!value}
        @click=${() => onChange(null)}
      >
        <ha-icon icon="mdi:backup-restore"></ha-icon>
      </button>
    </div>`;
  }

  /** An opening's look in 3D: a door's style, a window's type, grid and
   * shutters, a garage door's style, and the paint on them. */
  private _renderOpeningLook(
    o: Opening,
    set: (patch: Partial<Opening>) => void,
  ) {
    const L = (k: string) => localize(`edit3d.${k}`);
    if (o.type === "door" && o.garage)
      return html`${this._select<GarageStyle>(
        L("garageStyle"),
        o.garage_style ?? "flush",
        [
          ["flush", L("garageFlush")],
          ["raised_short", L("garageRaisedShort")],
          ["raised_long", L("garageRaisedLong")],
          ["carriage", L("garageCarriage")],
          ["windows", L("garageWindows")],
          ["modern", L("garageModern")],
        ],
        (v) => v && set({ garage_style: v }),
      )}
      ${this._color(L("paint"), o.paint_color, (v) => set({ paint_color: v }))}`;
    if (o.type === "door")
      return html`${this._select<DoorStyle>(
        L("doorStyle"),
        o.door_style ?? "slab",
        [
          ["slab", L("doorSlab")],
          ["six_panel", L("doorSixPanel")],
          ["craftsman", L("doorCraftsman")],
          ["half_lite", L("doorHalfLite")],
          ["full_lite", L("doorFullLite")],
          ["french", L("doorFrench")],
          ["sliding", L("doorSliding")],
        ],
        (v) => v && set({ door_style: v }),
      )}
      ${this._color(L("paint"), o.paint_color, (v) => set({ paint_color: v }))}`;
    return html`${this._select<WindowType>(
        L("windowType"),
        o.window_type ?? "picture",
        [
          ["picture", L("windowPicture")],
          ["single_hung", L("windowSingleHung")],
          ["casement", L("windowCasement")],
          ["slider", L("windowSlider")],
        ],
        (v) => v && set({ window_type: v }),
      )}
      ${this._select<WindowGrid>(
        L("windowGrid"),
        o.window_grid ?? "none",
        [
          ["none", L("gridNone")],
          ["colonial", L("gridColonial")],
          ["prairie", L("gridPrairie")],
          ["craftsman", L("gridCraftsman")],
        ],
        (v) => v && set({ window_grid: v }),
      )}
      <label class="row">
        <span>${L("shutters")}</span>
        <input
          type="checkbox"
          .checked=${!!o.shutters}
          @change=${(e: Event) => set({ shutters: (e.target as HTMLInputElement).checked })}
        />
      </label>
      ${
        o.shutters
          ? this._color(L("shutterPaint"), o.paint_color, (v) =>
              set({ paint_color: v }),
            )
          : nothing
      }`;
  }

  private _select<T extends string>(
    label: string,
    value: T | null | undefined,
    options: [T | "", string][],
    onChange: (v: T | null) => void,
  ) {
    return html`<label class="row">
      <span>${label}</span>
      <select
        @change=${(e: Event) => {
          const v = (e.target as HTMLSelectElement).value;
          onChange(v === "" ? null : (v as T));
        }}
      >
        ${options.map(
          ([v, text]) =>
            html`<option value=${v} ?selected=${(value ?? "") === v}>
              ${text}
            </option>`,
        )}
      </select>
    </label>`;
  }

  private _renderEditor() {
    const layout = this.layout;
    if (!layout) return nothing;
    const tools: [EditTool, string, string][] = [
      ["select", "mdi:cursor-default-outline", localize("edit3d.select")],
      ["wall", "mdi:wall", localize("edit3d.wall")],
      ["door", "mdi:door", localize("edit3d.door")],
      ["window", "mdi:window-closed-variant", localize("edit3d.window")],
      ["object", "mdi:sofa-outline", localize("edit3d.object")],
      ["outdoor", "mdi:outdoor-lamp", localize("edit3d.outdoor")],
      ["yard", "mdi:road-variant", localize("edit3d.yard")],
      ["grade", "mdi:terrain", localize("edit3d.grade")],
    ];
    const hint: Record<EditTool, string> = {
      select: localize("edit3d.selectHint"),
      wall: localize("edit3d.wallHint"),
      door: localize("edit3d.openingHint"),
      window: localize("edit3d.openingHint"),
      object: localize("edit3d.objectHint"),
      outdoor: localize("edit3d.outdoorHint"),
      yard: localize("edit3d.yardHint"),
      grade: localize(
        this._gradeMode === "point"
          ? "edit3d.gradePointHint"
          : "edit3d.gradeHint",
      ),
    };
    return html`<div class="sheet floating-panel editor">
      <div class="tools">
        ${tools.map(
          ([tool, icon, label]) =>
            html`<button
              class=${this._tool === tool ? "active" : ""}
              title=${label}
              @click=${() => this._setTool(tool)}
            >
              <ha-icon icon=${icon}></ha-icon><span>${label}</span>
            </button>`,
        )}
      </div>
      <div class="buttons">
        <button
          title=${localize("edit3d.undo")}
          @click=${() => this._fire("layout-undo")}
        >
          <ha-icon icon="mdi:undo"></ha-icon>
        </button>
        <button
          title=${localize("edit3d.redo")}
          @click=${() => this._fire("layout-redo")}
        >
          <ha-icon icon="mdi:redo"></ha-icon>
        </button>
        <span class="spacer"></span>
        <button class="primary" @click=${() => this._toggleEditing()}>
          ${localize("edit3d.done")}
        </button>
      </div>
      <span class="hint">${hint[this._tool]}</span>
      ${
        layoutFinishesUnsaved
          ? html`<span class="hint error"
              >${localize("edit3d.restartNeeded")}</span
            >`
          : nothing
      }
      ${
        this._tool === "object" || this._tool === "outdoor"
          ? html`<furniture-library-sidebar
              class="library"
              .categories=${this._tool === "outdoor" ? OUTDOOR_CATEGORIES : null}
              .thumbs=${this._tool === "outdoor" ? this._thumbs : null}
              .armedKind=${this._armedKind}
              @furniture-armed=${(e: CustomEvent<{ kind: string | null }>) => {
                this._armedKind = e.detail.kind;
                if (!e.detail.kind) this._setTool("select");
              }}
              @library-close=${() => this._setTool("select")}
            ></furniture-library-sidebar>`
          : this._tool === "select"
            ? this._renderSelection(layout)
            : this._tool === "yard"
              ? this._renderYard()
              : this._tool === "grade"
                ? this._renderGrade()
                : nothing
      }
    </div>`;
  }

  /** The site's kinds, as options (surfaces, or lines). */
  private _siteOptions(surface: boolean | null): [string, string][] {
    return SITE_KINDS.filter(
      (c) => surface === null || isSurfaceKind(c.id) === surface,
    ).map((c) => [c.id, c.name]);
  }

  private _renderYard() {
    return html`${this._select(
        localize("edit3d.siteKind"),
        this._yardKind,
        this._siteOptions(null),
        (v) => {
          if (v) this._yardKind = v;
        },
      )}
      <span class="hint"
        >${isSurfaceKind(this._yardKind) ? localize("edit3d.yardSurfaceHint") : localize("edit3d.yardLineHint")}</span
      >`;
  }

  private _renderGrade() {
    const grid = this._ground?.grid ?? null;
    const node = this._gradeNode;
    const nodeH =
      grid && node ? (grid.h[node.j * grid.cols + node.i] ?? 0) : null;
    const modes: [GradeMode | "point", string, string][] = [
      ["raise", "mdi:arrow-up-bold", localize("edit3d.gradeRaise")],
      ["lower", "mdi:arrow-down-bold", localize("edit3d.gradeLower")],
      ["flatten", "mdi:minus", localize("edit3d.gradeFlatten")],
      ["smooth", "mdi:wave", localize("edit3d.gradeSmooth")],
      ["point", "mdi:dots-grid", localize("edit3d.gradePoint")],
    ];
    return html`<div class="tools">
        ${modes.map(
          ([mode, icon, label]) =>
            html`<button
              class=${this._gradeMode === mode ? "active" : ""}
              title=${label}
              @click=${() => {
                this._gradeMode = mode;
                this._gradeNode = null;
                this._pushOverlay();
              }}
            >
              <ha-icon icon=${icon}></ha-icon><span>${label}</span>
            </button>`,
        )}
      </div>
      ${
        this._gradeMode === "point"
          ? node && grid
            ? this._num(
                localize("edit3d.pointRaise"),
                (nodeH ?? 0) * 100,
                (v) => {
                  const h = grid.h.slice();
                  h[node.j * grid.cols + node.i] = (v ?? 0) / 100;
                  this._saveGrade({ ...grid, h });
                },
                { unit: "cm", step: 5 },
              )
            : nothing
          : html`<label class="row">
                <span>${localize("edit3d.brushSize")}</span>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  .value=${String(this._gradeRadius)}
                  @input=${(e: Event) => {
                    this._gradeRadius = Number(
                      (e.target as HTMLInputElement).value,
                    );
                    this._pushOverlay();
                  }}
                />
                <span class="unit">${this._gradeRadius} m</span>
              </label>
              <label class="row" title=${localize("edit3d.brushFeatherHint")}>
                <span>${localize("edit3d.brushFeather")}</span>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  .value=${String(this._gradeFeather)}
                  @input=${(e: Event) => {
                    this._gradeFeather = Number(
                      (e.target as HTMLInputElement).value,
                    );
                    this._pushOverlay();
                  }}
                />
                <span class="unit">${this._gradeFeather} m</span>
              </label>
              <label class="row">
                <span>${localize("edit3d.brushStrength")}</span>
                <input
                  type="range"
                  min="0.02"
                  max="0.5"
                  step="0.01"
                  .value=${String(this._gradeStrength)}
                  @input=${(e: Event) => {
                    this._gradeStrength = Number(
                      (e.target as HTMLInputElement).value,
                    );
                  }}
                />
                <span class="unit"
                  >${Math.round(this._gradeStrength * 100)} cm</span
                >
              </label>`
      }
      ${this._select(
        localize("edit3d.gridSpacing"),
        String(grid?.step ?? this._gradeStep),
        [
          ["0.5", "0.5 m"],
          ["1", "1 m"],
          ["2", "2 m"],
          ["3", "3 m"],
        ],
        (v) => v && this._respaceGrade(Number(v)),
      )}
      ${
        groundGridUnsaved
          ? html`<span class="hint error"
              >${localize("edit3d.gradeRestartNeeded")}</span
            >`
          : nothing
      }
      <div class="buttons">
        <button
          class="danger"
          ?disabled=${!grid}
          @click=${() => {
            if (window.confirm(localize("edit3d.resetGradeConfirm"))) {
              this._gradeNode = null;
              this._saveGrade(null);
            }
          }}
        >
          ${localize("edit3d.resetGrade")}
        </button>
      </div>`;
  }

  /** A site item's panel: its kind, colour, curves and corners. */
  private _renderSiteItem(layout: FloorLayout, item: FurnitureItem) {
    const entry = catalogItem(item.kind);
    const set = (patch: Partial<FurnitureItem>) =>
      this._edit(patchItem(layout, item.id, patch));
    const surface = isSurfaceKind(item.kind);
    const n = item.points?.length ?? 0;
    const corners = item.corners ?? [];
    const all = corners.length
      ? Math.round(corners.reduce((a, b) => a + b, 0) / corners.length)
      : 0;
    const k = this._outlineCorner;
    const curve = (v: number, at: number | null) => {
      const next = Array.from({ length: n }, (_, i) =>
        at === null || i === at ? v : (corners[i] ?? 0),
      );
      set({ corners: next });
    };
    const slider = (
      label: string,
      value: number,
      onChange: (v: number) => void,
    ) =>
      html`<label class="row">
        <span>${label}</span>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          .value=${String(value)}
          @change=${(e: Event) =>
            onChange(Number((e.target as HTMLInputElement).value))}
        />
        <span class="unit">${value}%</span>
      </label>`;
    const height = item.height_cm ?? Number(entry?.opts["height"] ?? 0);
    return html`<h3>${item.label || entry?.name || item.kind}</h3>
      ${this._select(
        localize("edit3d.siteKind"),
        item.kind,
        this._siteOptions(surface),
        (v) => {
          const next = v ? catalogItem(v) : undefined;
          if (!next) return;
          set({
            kind: next.id,
            ...(typeof next.opts["color"] === "string"
              ? { color: next.opts["color"] }
              : {}),
          });
        },
      )}
      ${this._color(localize("edit3d.color"), item.color, (v) => set({ color: v }))}
      ${
        !surface
          ? html`${this._num(localize("edit3d.height"), height, (v) => set({ height_cm: v && v > 0 ? v : null }), { unit: "cm", min: 1 })}
              <label class="row">
                <span>${localize("edit3d.closedLine")}</span>
                <input
                  type="checkbox"
                  .checked=${item.closed !== false}
                  ?disabled=${n < 3}
                  @change=${(e: Event) => set({ closed: (e.target as HTMLInputElement).checked })}
                />
              </label>`
          : nothing
      }
      ${slider(localize("edit3d.curveAll"), all, (v) => curve(v, null))}
      ${
        k !== null && k < n
          ? slider(
              localize("edit3d.curveCorner", { n: String(k + 1) }),
              Math.round(corners[k] ?? 0),
              (v) => curve(v, k),
            )
          : nothing
      }
      <span class="hint">${localize("edit3d.outlineHint")}</span>
      <div class="buttons">
        ${
          k !== null
            ? html`<button @click=${() => this._deleteOutlineCorner(item, k)}>
                ${localize("edit3d.deleteCorner")}
              </button>`
            : nothing
        }
        <button
          @click=${() => {
            const copy = duplicateItem(layout, item.id, 50 * this._perCm);
            if (copy) {
              this._edit(copy.patch);
              this._sel = { kind: "item", id: copy.id };
            }
          }}
        >
          ${localize("edit3d.duplicate")}
        </button>
        <button class="danger" @click=${() => this._deleteSelection()}>
          ${localize("edit3d.delete")}
        </button>
      </div>`;
  }

  /** The entity an item stands for (a light it shows lit, a switch), and
   * its state now. */
  private _renderLink(
    item: FurnitureItem,
    set: (patch: Partial<FurnitureItem>) => void,
    field: "entity_id" | "entity_id_2" = "entity_id",
    label = localize("edit3d.entity"),
  ) {
    const id = item[field] ?? null;
    const st = id ? this.hass?.states[id] : undefined;
    const state = st?.state;
    const level =
      state === "on" && typeof st?.attributes["brightness"] === "number"
        ? ` · ${Math.round(((st.attributes["brightness"] as number) / 255) * 100)}%`
        : "";
    return html`<label class="row link">
        <span>${label}</span>
        <search-select
          .options=${this._linkOptions(item)}
          .value=${id}
          .noneLabel=${localize("furniture.noEntity")}
          placeholder=${localize("furniture.searchEntity")}
          @value-changed=${(e: CustomEvent<{ value: string | null }>) =>
            set({ [field]: e.detail.value })}
        ></search-select>
      </label>
      ${
        id
          ? html`<span class="hint"
              >${state ?? localize("edit3d.unavailable")}${level}</span
            >`
          : nothing
      }`;
  }

  /** An outdoor light's beam: how wide (spot to flood) and where it lands
   * (up the wall a ground spot faces, out from the wall a flood is on);
   * and a two-light sconce's down light. */
  private _renderBeam(
    item: FurnitureItem,
    entry: CatalogItem | undefined,
    set: (patch: Partial<FurnitureItem>) => void,
  ) {
    const beam = entry?.opts["beam"];
    if (typeof beam !== "string" || beam === "glow" || beam === "omni")
      return nothing;
    const own = Number(
      entry?.opts["spread"] ??
        (beam === "flood"
          ? 100
          : beam === "down"
            ? 110
            : beam === "updown"
              ? 40
              : 30),
    );
    const spread = Math.round(item.beam_deg ?? own);
    const spot = beam === "spot" && this._onGround(item);
    const flood = beam === "flood";
    const aim = item.aim_m ?? null;
    const slider = (
      label: string,
      value: number,
      min: number,
      max: number,
      step: number,
      ends: [string, string],
      text: string,
      onChange: (v: number) => void,
    ) =>
      html`<label class="row beam">
        <span>${label}</span>
        <span class="range">
          <small>${ends[0]}</small>
          <input
            type="range"
            min=${min}
            max=${max}
            step=${step}
            .value=${String(value)}
            @change=${(e: Event) =>
              onChange(Number((e.target as HTMLInputElement).value))}
          />
          <small>${ends[1]}</small>
        </span>
        <span class="unit">${text}</span>
      </label>`;
    return html`${
      entry?.opts["twin"]
        ? this._renderLink(
            item,
            set,
            "entity_id_2",
            localize("edit3d.downLight"),
          )
        : nothing
    }
    ${slider(
      localize("edit3d.beam"),
      spread,
      8,
      140,
      2,
      [localize("edit3d.beamSpot"), localize("edit3d.beamFlood")],
      `${spread}°`,
      (v) => set({ beam_deg: v === Math.round(own) ? null : v }),
    )}
    ${
      spot || flood
        ? html`${slider(
            localize(spot ? "edit3d.landsUp" : "edit3d.landsOut"),
            aim ?? (spot ? 1.1 : 4),
            spot ? 0.2 : 0.5,
            spot ? 8 : 15,
            0.1,
            [
              localize(spot ? "edit3d.low" : "edit3d.near"),
              localize(spot ? "edit3d.high" : "edit3d.far"),
            ],
            aim === null ? localize("edit3d.auto") : `${aim.toFixed(1)} m`,
            (v) => set({ aim_m: v }),
          )}
          ${
            aim !== null
              ? html`<div class="buttons">
                  <button @click=${() => set({ aim_m: null })}>
                    ${localize("edit3d.autoAim")}
                  </button>
                </div>`
              : nothing
          }`
        : nothing
    }`;
  }

  private _renderSelection(layout: FloorLayout) {
    const sel = this._sel;
    if (!sel)
      return html`<span class="hint"
        >${localize("edit3d.nothingSelected")}</span
      >`;
    const cm = (units: number) => units / this._perCm;
    const units = (cmv: number) => cmv * this._perCm;
    if (sel.kind === "item") {
      const item = layout.furniture.find((f) => f.id === sel.id);
      if (!item) return nothing;
      if (item.kind.startsWith("site_") && (item.points?.length ?? 0) >= 2)
        return this._renderSiteItem(layout, item);
      const entry = catalogItem(item.kind);
      const set = (patch: Partial<FurnitureItem>) =>
        this._edit(patchItem(layout, item.id, patch));
      return html`<h3>${item.label || entry?.name || item.kind}</h3>
        <label class="row">
          <span>${localize("edit3d.name")}</span>
          <input
            type="text"
            .value=${item.label ?? ""}
            placeholder=${entry?.name ?? ""}
            @change=${(e: Event) => set({ label: (e.target as HTMLInputElement).value.trim() || null })}
          />
        </label>
        ${this._renderLink(
          item,
          set,
          "entity_id",
          entry?.opts["twin"] ? localize("edit3d.upLight") : undefined,
        )}
        ${this._renderBeam(item, entry, set)}
        ${this._num(localize("edit3d.width"), item.width_cm, (v) => v && v > 0 && set({ width_cm: v }), { unit: "cm", min: 1 })}
        ${this._num(localize("edit3d.depth"), item.depth_cm, (v) => v && v > 0 && set({ depth_cm: v }), { unit: "cm", min: 1 })}
        ${this._num(localize("edit3d.height"), item.height_cm ?? null, (v) => set({ height_cm: v && v > 0 ? v : null }), { unit: "cm", placeholder: localize("edit3d.auto") })}
        ${this._num(localize("edit3d.elevation"), item.elevation_cm ?? null, (v) => set({ elevation_cm: v }), { unit: "cm", placeholder: localize("edit3d.auto") })}
        ${this._num(localize("edit3d.rotation"), item.rotation_deg, (v) => v !== null && set({ rotation_deg: ((v % 360) + 360) % 360 }), { unit: "°" })}
        ${this._color(localize("edit3d.color"), item.color, (v) => set({ color: v }))}
        <label class="row">
          <span>${localize("edit3d.mirrored")}</span>
          <input
            type="checkbox"
            .checked=${!!item.mirrored}
            @change=${(e: Event) => set({ mirrored: (e.target as HTMLInputElement).checked })}
          />
        </label>
        <div class="buttons">
          <button
            @click=${() => set({ rotation_deg: (item.rotation_deg + 270) % 360 })}
          >
            <ha-icon icon="mdi:rotate-left"></ha-icon>
          </button>
          <button
            @click=${() => set({ rotation_deg: (item.rotation_deg + 90) % 360 })}
          >
            <ha-icon icon="mdi:rotate-right"></ha-icon>
          </button>
          <button
            @click=${() => {
              const copy = duplicateItem(layout, item.id, 20 * this._perCm);
              if (copy) {
                this._edit(copy.patch);
                this._sel = { kind: "item", id: copy.id };
              }
            }}
          >
            ${localize("edit3d.duplicate")}
          </button>
          <button class="danger" @click=${() => this._deleteSelection()}>
            ${localize("edit3d.delete")}
          </button>
        </div>`;
    }
    if (sel.kind === "wall") {
      const wall = this._wallOf(sel.id);
      if (!wall) return nothing;
      const seg = Math.min(sel.seg ?? 0, wall.points.length - 2);
      const a = wall.points[seg] as Pt;
      const b = wall.points[seg + 1] as Pt;
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const half = wall.material === "half_wall";
      return html`<h3>${localize("edit3d.wall")}</h3>
        ${this._num(localize("edit3d.thickness"), wallThicknessCm(wall), (v) => v && v > 0 && this._edit(patchWall(layout, wall.id, { thickness_cm: v })), { unit: "cm", min: 1, step: 0.5 })}
        ${this._num(
          localize("edit3d.length"),
          cm(len),
          (v) => {
            if (!v || v <= 0 || len <= 0) return;
            const k = units(v) / len;
            const to: Pt = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
            this._edit(
              moveCorners(layout, [{ from: b, to }], 1.5 * this._perCm),
            );
          },
          { unit: "cm", min: 1 },
        )}
        ${this._select(
          localize("edit3d.material"),
          wall.material,
          [
            ...WALL_MATERIALS.map((mat): [string, string] => [
              mat.id,
              materialLabel(mat),
            ]),
            ["half_wall", localize("edit3d.halfWall")],
          ],
          (v) => v && this._edit(patchWall(layout, wall.id, { material: v })),
        )}
        <span class="hint"
          >${half ? localize("edit3d.halfWallHint") : localize("edit3d.wallDragHint")}</span
        >
        <div class="buttons">
          <button
            @click=${() => this._edit(insertCorner(layout, wall.id, seg, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]))}
          >
            ${localize("edit3d.addCorner")}
          </button>
          <button class="danger" @click=${() => this._deleteSelection()}>
            ${localize("edit3d.delete")}
          </button>
        </div>`;
    }
    if (sel.kind === "opening") {
      const o = layout.openings.find((x) => x.id === sel.id);
      if (!o) return nothing;
      const set = (patch: Partial<Opening>) =>
        this._edit(patchOpening(layout, o.id, patch));
      return html`<h3>
          ${o.type === "door" ? localize("edit3d.door") : localize("edit3d.window")}
        </h3>
        ${this._select<OpeningType>(
          localize("edit3d.type"),
          o.type,
          [
            ["door", localize("edit3d.door")],
            ["window", localize("edit3d.window")],
          ],
          (v) => v && set({ type: v }),
        )}
        ${this._num(localize("edit3d.width"), cm(o.width), (v) => v && v > 0 && set({ width: units(v) }), { unit: "cm", min: 10 })}
        ${
          o.type === "window"
            ? this._select<"standard" | "transom" | "full">(
                localize("edit3d.windowStyle"),
                o.window_style ?? "standard",
                [
                  ["standard", localize("edit3d.styleStandard")],
                  ["transom", localize("edit3d.styleTransom")],
                  ["full", localize("edit3d.styleFull")],
                ],
                (v) => set({ window_style: v ?? "standard" }),
              )
            : html`<label class="row">
                <span>${localize("edit3d.garageDoor")}</span>
                <input
                  type="checkbox"
                  .checked=${!!o.garage}
                  @change=${(e: Event) => set({ garage: (e.target as HTMLInputElement).checked })}
                />
              </label>`
        }
        ${this._renderOpeningLook(o, set)}
        <span class="hint">${localize("edit3d.openingDragHint")}</span>
        <div class="buttons">
          <button class="danger" @click=${() => this._deleteSelection()}>
            ${localize("edit3d.delete")}
          </button>
        </div>`;
    }
    const room = layout.rooms.find((r) => r.id === sel.id);
    if (!room) return nothing;
    const set = (patch: Partial<Room>) =>
      this._edit(patchRoom(layout, room.id, patch));
    return html`<h3>${room.name}</h3>
      <label class="row">
        <span>${localize("edit3d.name")}</span>
        <input
          type="text"
          .value=${room.name}
          @change=${(e: Event) => {
            const v = (e.target as HTMLInputElement).value.trim();
            if (v) set({ name: v });
          }}
        />
      </label>
      <div class="divider"></div>
      ${this._select<FloorFinishKind>(
        localize("edit3d.floorFinish"),
        room.floor_finish ?? null,
        [
          ["", localize("edit3d.auto")],
          ["wood", localize("edit3d.finishWood")],
          ["tile", localize("edit3d.finishTile")],
          ["carpet", localize("edit3d.finishCarpet")],
          ["stone", localize("edit3d.finishStone")],
          ["concrete", localize("edit3d.finishConcrete")],
          ["plain", localize("edit3d.finishPlain")],
        ],
        (v) => set({ floor_finish: v }),
      )}
      ${this._color(localize("edit3d.floorColor"), room.floor_color, (v) => set({ floor_color: v }))}
      <div class="divider"></div>
      ${this._select<WallFinishKind>(
        localize("edit3d.wallFinish"),
        room.wall_finish ?? null,
        [
          ["", localize("edit3d.finishPaint")],
          ["wallpaper", localize("edit3d.finishWallpaper")],
          ["tile", localize("edit3d.finishTile")],
          ["brick", localize("edit3d.finishBrick")],
          ["stone", localize("edit3d.finishStone")],
          ["wood", localize("edit3d.finishWoodPanel")],
          ["shiplap", localize("edit3d.finishShiplap")],
        ],
        (v) => set({ wall_finish: v }),
      )}
      ${this._color(localize("edit3d.wallColor"), room.wall_color, (v) => set({ wall_color: v }))}
      <div class="divider"></div>
      ${this._num(localize("edit3d.floorLevel"), (room.floor_offset_m ?? 0) * 100, (v) => set({ floor_offset_m: v ? v / 100 : null }), { unit: "cm", step: 1 })}
      <span class="hint">${localize("edit3d.roomHint")}</span>`;
  }

  // --- rendering ----------------------------------------------------------------

  override render() {
    const hourLabel =
      this._hour === null
        ? localize("view3d.now")
        : `${String(Math.floor(this._hour)).padStart(2, "0")}:${String(
            Math.round((this._hour % 1) * 60),
          ).padStart(2, "0")}`;
    return html`
      <div class="stage"></div>
      ${
        this._measure && this._editing
          ? html`<div
              class="measure"
              style="left:${this._measure.x}px;top:${this._measure.y}px"
            >
              ${this._measure.seg}${
                this._measure.total
                  ? html`<span
                      >${localize("edit3d.totalLength", { length: this._measure.total })}</span
                    >`
                  : nothing
              }
            </div>`
          : nothing
      }
      ${
        this._status === "error"
          ? html`<div class="notice error">${this._error}</div>`
          : this._status !== "ready"
            ? html`<div class="notice">${localize("view3d.loading")}</div>`
            : nothing
      }
      <div class="toolbar">
        ${
          this.closable
            ? html`<div class="group">
                <button
                  title=${localize("view3d.close")}
                  @click=${() => this._fire("close-3d")}
                >
                  <ha-icon icon="mdi:floor-plan"></ha-icon>
                  2D
                </button>
              </div>`
            : nothing
        }
        <div class="group">
          <button
            class="icon"
            title=${localize("view3d.orbitView")}
            @click=${() => this._handle?.view("orbit")}
          >
            <ha-icon icon="mdi:rotate-3d-variant"></ha-icon>
          </button>
          <button
            class="icon"
            title=${localize("view3d.topView")}
            @click=${() => this._handle?.view("top")}
          >
            <ha-icon icon="mdi:arrow-collapse-down"></ha-icon>
          </button>
          ${
            this._hasScans
              ? html`<button
                  class=${this._scanMode === "scan" ? "active" : ""}
                  title=${localize("view3d.scanModeHint")}
                  @click=${() => {
                    this._scanMode =
                      this._scanMode === "scan" ? "plan" : "scan";
                    try {
                      localStorage.setItem(SCAN_MODE_KEY, this._scanMode);
                    } catch {
                      /* private window: just this session */
                    }
                  }}
                >
                  <ha-icon icon="mdi:cube-scan"></ha-icon>
                  ${localize("view3d.scanMode")}
                </button>`
              : nothing
          }
          ${
            this._canDollhouse
              ? html`<button
                  class=${this.dollhouse ? "active" : ""}
                  title=${localize("view3d.dollhouseHint")}
                  @click=${() => {
                    this.dollhouse = !this.dollhouse;
                    this._sceneSig = "";
                  }}
                >
                  <ha-icon icon="mdi:home-floor-3"></ha-icon>
                  ${localize("view3d.dollhouse")}
                </button>`
              : nothing
          }
          ${
            this.dollhouse && this._shownFloorIds.length > 1
              ? html`<button
                  class=${this._roof ? "active" : ""}
                  title=${localize("view3d.roofHint")}
                  @click=${() => {
                    this._roof = !this._roof;
                    try {
                      localStorage.setItem(ROOF_KEY, this._roof ? "on" : "off");
                    } catch {
                      /* private window: just this session */
                    }
                  }}
                >
                  <ha-icon icon="mdi:home-roof"></ha-icon>
                  ${localize("view3d.roof")}
                </button>`
              : nothing
          }
          ${
            this.dollhouse && this._shownFloorIds.length > 1
              ? html`<label title=${localize("view3d.spread")}>
                  <ha-icon icon="mdi:arrow-expand-vertical"></ha-icon>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    step="0.1"
                    .value=${String(this._spread)}
                    @input=${(e: Event) => {
                      this._spread = Number(
                        (e.target as HTMLInputElement).value,
                      );
                    }}
                  />
                </label>`
              : nothing
          }
        </div>
        <div class="group">
          <label class="time" title=${localize("view3d.sunTime")}>
            <ha-icon icon="mdi:weather-sunny"></ha-icon>
            <input
              type="range"
              min="0"
              max="24"
              step="0.25"
              .value=${String(this._hour ?? homeHour(new Date(), this.hass?.config))}
              @input=${(e: Event) => {
                this._hour = Number((e.target as HTMLInputElement).value);
              }}
            />
            <span>${hourLabel}</span>
          </label>
          ${
            this._hour !== null
              ? html`<button
                  class="icon"
                  title=${localize("view3d.now")}
                  @click=${() => (this._hour = null)}
                >
                  <ha-icon icon="mdi:clock-outline"></ha-icon>
                </button>`
              : nothing
          }
        </div>
        <span class="spacer"></span>
        <div class="group">
          <button
            title=${localize("view3d.exportHint")}
            ?disabled=${!this._handle || this._exporting}
            @click=${() => void this._export()}
          >
            <ha-icon icon="mdi:download"></ha-icon>
            ${this._exporting ? localize("view3d.exporting") : "glTF"}
          </button>
          ${
            this.editable
              ? html`<button
                  class=${this._editing ? "active" : ""}
                  title=${localize("edit3d.editHint")}
                  @click=${() => this._toggleEditing()}
                >
                  <ha-icon icon="mdi:pencil-ruler"></ha-icon>
                  ${localize("edit3d.edit")}
                </button>`
              : nothing
          }
          ${
            this.editable
              ? html`<button
                  class=${this._sheetOpen ? "active" : ""}
                  title=${localize("view3d.scansHint")}
                  @click=${() => {
                    if (this._editing) this._toggleEditing();
                    this._lightsOpen = false;
                    this._sheetOpen = !this._sheetOpen;
                  }}
                >
                  <ha-icon icon="mdi:cube-scan"></ha-icon>
                  ${localize("view3d.scans")}
                </button>`
              : nothing
          }
          ${
            this.editable
              ? html`<button
                  class=${this._lightsOpen ? "active" : ""}
                  title=${localize("view3d.roofLightsHint")}
                  @click=${() => {
                    if (this._editing) this._toggleEditing();
                    this._sheetOpen = false;
                    this._lightsOpen = !this._lightsOpen;
                  }}
                >
                  <ha-icon icon="mdi:string-lights"></ha-icon>
                  ${localize("view3d.roofLights")}
                </button>`
              : nothing
          }
        </div>
      </div>
      ${this.editable && this._sheetOpen && !this._editing ? this._renderSheet() : nothing}
      ${
        this.editable && this._lightsOpen && !this._editing
          ? html`<div class="sheet floating-panel">
              <h3>${localize("view3d.roofLights")}</h3>
              ${
                this._roofPlan
                  ? this._renderRoofLights(this._roofPlan)
                  : html`<span class="hint"
                      >${localize("view3d.roofLightsNeedParts")}</span
                    >`
              }
            </div>`
          : nothing
      }
      ${this.editable && this._editing ? this._renderEditor() : nothing}
      <input
        type="file"
        accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
        hidden
        @change=${this._onPickFile}
      />
    `;
  }

  private _renderSheet() {
    const scans = this._scans;
    const sel = this._selectedScan;
    const wallHeight = this.floorId ? this._wallHeight(this.floorId) : 2.4;
    const elevation = this.floorId
      ? (this._view3d.get(this.floorId)?.floor_elevation_m ?? null)
      : null;
    return html`<div class="sheet floating-panel">
      <h3>${localize("view3d.scans")}</h3>
      <div class="row">
        <span>${localize("view3d.wallHeight")}</span>
        <input
          type="number"
          min="1.8"
          max="6"
          step="0.05"
          .value=${String(wallHeight)}
          @change=${(e: Event) => {
            const v = Number((e.target as HTMLInputElement).value);
            if (v >= 1 && v <= 10)
              this._patchView3d((s) => ({ ...s, wall_height_m: v }), "now");
          }}
        />
        <span>m</span>
      </div>
      <div class="row" title=${localize("view3d.floorElevationHint")}>
        <span>${localize("view3d.floorElevation")}</span>
        <input
          type="number"
          min="-10"
          max="50"
          step="0.01"
          placeholder=${localize("view3d.floorElevationAuto")}
          .value=${elevation === null ? "" : String(elevation)}
          @change=${(e: Event) => {
            const input = e.target as HTMLInputElement;
            const raw = input.value.trim();
            const v = raw === "" ? null : Number(raw);
            if (v === null || (Number.isFinite(v) && v >= -50 && v <= 100))
              this._patchView3d((s) => ({ ...s, floor_elevation_m: v }), "now");
            else input.value = elevation === null ? "" : String(elevation);
          }}
        />
        <span>m</span>
      </div>
      ${this._renderGround()} ${this._renderRoof()}
      <div class="divider"></div>
      <span class="hint">${localize("view3d.scansIntro")}</span>
      <div class="buttons">
        <button
          class="primary"
          ?disabled=${this._uploading}
          @click=${() => this._fileInput.click()}
        >
          ${this._uploading ? localize("view3d.uploading") : localize("view3d.importScan")}
        </button>
      </div>
      ${this._error ? html`<span class="hint error">${this._error}</span>` : nothing}
      ${scans.map(
        (scan) =>
          html`<div
            class="scan ${scan.id === this._selectedScanId ? "selected" : ""}"
            @click=${() => (this._selectedScanId = scan.id === this._selectedScanId ? null : scan.id)}
          >
            <div class="name">
              ${scan.name}
              <div class="meta">
                ${this._scanStatus.get(scan.id) ?? fileSize(scan.size_bytes)}
              </div>
            </div>
            <button
              title=${scan.visible ? localize("view3d.hide") : localize("view3d.show")}
              @click=${(e: Event) => {
                e.stopPropagation();
                this._patchScan(scan.id, { visible: !scan.visible }, "now");
              }}
            >
              <ha-icon
                icon=${scan.visible ? "mdi:eye" : "mdi:eye-off"}
              ></ha-icon>
            </button>
            <button
              class="danger"
              title=${localize("view3d.delete")}
              @click=${(e: Event) => {
                e.stopPropagation();
                void this._deleteScan(scan);
              }}
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </button>
          </div>`,
      )}
      ${sel ? this._renderScanControls(sel) : nothing}
    </div>`;
  }

  /** The ground around the building: grade on its high and low sides and
   * which way it falls (a walk-out on a hill). Shared by the building's
   * floors; empty = flat. */
  private _renderGround() {
    const g = this._ground;
    const metres = (key: "uphill_m" | "downhill_m", label: string) =>
      html`<div class="row">
        <span>${label}</span>
        <input
          type="number"
          min="-50"
          max="100"
          step="0.01"
          placeholder="0"
          .value=${g ? String(g[key]) : ""}
          @change=${(e: Event) => {
            const input = e.target as HTMLInputElement;
            const v = Number(input.value.trim() || "0");
            if (Number.isFinite(v) && v >= -50 && v <= 100)
              this._setGround({ [key]: v });
            else input.value = g ? String(g[key]) : "";
          }}
        />
        <span>m</span>
      </div>`;
    return html`
      <div class="divider"></div>
      <div class="row" title=${localize("view3d.groundHint")}>
        <span>${localize("view3d.ground")}</span>
        ${
          g
            ? html`<button @click=${() => this._setGround(null)}>
                ${localize("view3d.groundFlat")}
              </button>`
            : html`<span class="hint"
                >${localize("view3d.groundFlatNow")}</span
              >`
        }
      </div>
      ${metres("uphill_m", localize("view3d.groundUphill"))}
      ${metres("downhill_m", localize("view3d.groundDownhill"))}
      <div class="row">
        <span>${localize("view3d.groundToward")}</span>
        <select
          @change=${(e: Event) =>
            this._setGround({
              downhill_deg: Number((e.target as HTMLSelectElement).value),
            })}
        >
          ${COMPASS_POINTS.filter((_, i) => i % 2 === 0).map(
            (p) =>
              html`<option
                value=${p.deg}
                ?selected=${(g?.downhill_deg ?? 0) === p.deg}
              >
                ${p.name}
              </option>`,
          )}
        </select>
      </div>
      <span class="hint">${localize("view3d.groundHint")}</span>
    `;
  }

  /** The roof's explicit parts, edited as text: one JSON object per line,
   * each a rectangle of the plan with its ridge direction, eave height,
   * pitch and ends. Shared by the building's floors; none = worked out
   * from the rooms. */
  private _renderRoof() {
    const plan = this._roofPlan;
    const text =
      this._roofDraft ??
      (plan ? plan.parts.map((p) => JSON.stringify(p)).join(",\n") : "");
    const apply = () => {
      const raw = text.trim();
      if (!raw) {
        this._roofDraft = null;
        this._setRoof(null);
        return;
      }
      const parts = parseRoofParts(raw);
      if (!parts) {
        this._error = localize("view3d.roofInvalid");
        return;
      }
      this._roofDraft = null;
      this._setRoof({ ...(plan ?? {}), parts });
    };
    return html`
      <div class="divider"></div>
      <div class="row" title=${localize("view3d.roofPartsHint")}>
        <span>${localize("view3d.roofParts")}</span>
        ${
          plan
            ? html`<button
                ?disabled=${!this.editable}
                @click=${() => {
                  this._roofDraft = null;
                  this._setRoof(null);
                }}
              >
                ${localize("view3d.roofAuto")}
              </button>`
            : html`<span class="hint">${localize("view3d.roofAutoNow")}</span>`
        }
      </div>
      <textarea
        class="roof-parts"
        rows="6"
        spellcheck="false"
        ?readonly=${!this.editable}
        .value=${text}
        @input=${(e: Event) =>
          (this._roofDraft = (e.target as HTMLTextAreaElement).value)}
      ></textarea>
      ${
        this.editable && this._roofDraft !== null
          ? html`<div class="buttons">
              <button class="primary" @click=${apply}>
                ${localize("view3d.roofApply")}
              </button>
              <button @click=${() => (this._roofDraft = null)}>
                ${localize("view3d.roofRevert")}
              </button>
            </div>`
          : nothing
      }
      <span class="hint">${localize("view3d.roofPartsHint")}</span>
    `;
  }

  /** A strip's colour pattern: LED colours in turn, repeating; none =
   * its light's colour. */
  private _renderStripPattern(
    strip: RoofLightStrip,
    patch: (p: Partial<RoofLightStrip>) => void,
  ) {
    const pattern = strip.pattern ?? [];
    const scenes = strip.scenes ?? [];
    const setScenes = (next: { scene: string; pattern: string[] }[]) =>
      patch({ scenes: next });
    const states = this.hass?.states ?? {};
    // Scenes, the ones likely to drive this light first: a Hue scene of
    // the room it's in, or a scene that sets it.
    const reg = this.hass as
      | (HomeAssistant & { areas?: Record<string, { name?: string }> })
      | undefined;
    const areaId = strip.entity_id
      ? reg?.entities?.[strip.entity_id]?.area_id
      : undefined;
    const areaName = (areaId && reg?.areas?.[areaId]?.name) || "";
    const likely = (id: string) => {
      const attrs = states[id]?.attributes ?? {};
      const members = attrs["entity_id"];
      return (
        (Array.isArray(members) && members.includes(strip.entity_id)) ||
        (!!areaName &&
          String(attrs["group_name"] ?? "").toLowerCase() ===
            areaName.toLowerCase())
      );
    };
    const all = Object.keys(states)
      .filter((id) => id.startsWith("scene."))
      .map((id): [string, string, boolean] => [
        id,
        String(states[id]?.attributes["friendly_name"] ?? id),
        likely(id),
      ])
      .sort((a, b) => Number(b[2]) - Number(a[2]) || a[1].localeCompare(b[1]));
    const active = stripPattern(strip, this.hass);
    const activeScene = scenes.find((x) => x.pattern === active)?.scene;
    return html`${this._patternEditor(
        pattern,
        (next) => patch({ pattern: next }),
        pattern.length
          ? localize("view3d.roofLightsPattern", { n: String(pattern.length) })
          : localize("view3d.roofLightsPatternNone"),
      )}
      <details class="edges">
        <summary>
          ${localize("view3d.roofLightsScenes", { n: String(scenes.length) })}
        </summary>
        ${scenes.map(
          (entry, i) => html`
            <label class="row">
              <span
                >${localize("view3d.roofLightsScene")}${
                  entry.scene === activeScene
                    ? html` <b
                        >(${localize("view3d.roofLightsSceneActive")})</b
                      >`
                    : nothing
                }</span
              >
              <select
                ?disabled=${!this.editable}
                @change=${(e: Event) =>
                  setScenes(
                    scenes.map((x, k) =>
                      k === i
                        ? { ...x, scene: (e.target as HTMLSelectElement).value }
                        : x,
                    ),
                  )}
              >
                ${all.map(
                  ([id, name, near]) =>
                    html`<option value=${id} ?selected=${entry.scene === id}>
                      ${near ? "★ " : ""}${name}
                    </option>`,
                )}
              </select>
            </label>
            ${this._patternEditor(
              entry.pattern,
              (next) =>
                setScenes(
                  scenes.map((x, k) => (k === i ? { ...x, pattern: next } : x)),
                ),
              localize("view3d.roofLightsPattern", {
                n: String(entry.pattern.length),
              }),
              true,
            )}
            <div class="buttons">
              <button
                class="danger"
                ?disabled=${!this.editable}
                @click=${() => setScenes(scenes.filter((_, k) => k !== i))}
              >
                ${localize("view3d.roofLightsSceneRemove")}
              </button>
            </div>
          `,
        )}
        <div class="buttons">
          <button
            ?disabled=${!this.editable || !all.length}
            @click=${() =>
              setScenes([
                ...scenes,
                {
                  scene:
                    all.find(
                      ([id]) => !scenes.some((x) => x.scene === id),
                    )?.[0] ?? all[0]![0],
                  pattern: [...(pattern.length ? pattern : ["#ff9321"])],
                },
              ])}
          >
            ${localize("view3d.roofLightsSceneAdd")}
          </button>
        </div>
        <span class="hint">${localize("view3d.roofLightsScenesHint")}</span>
      </details>`;
  }

  /** LED colours in turn: a swatch each, more or fewer. */
  private _patternEditor(
    pattern: string[],
    set: (next: string[]) => void,
    summary: string,
    open = false,
  ) {
    return html`<details class="edges" ?open=${open}>
      <summary>${summary}</summary>
      <div class="pattern">
        ${pattern.map(
          (c, k) =>
            html`<input
              type="color"
              title=${String(k + 1)}
              ?disabled=${!this.editable}
              .value=${c}
              @change=${(e: Event) =>
                set(
                  pattern.map((x, j) =>
                    j === k ? (e.target as HTMLInputElement).value : x,
                  ),
                )}
            />`,
        )}
      </div>
      <div class="buttons">
        <button
          ?disabled=${!this.editable || pattern.length >= 64}
          @click=${() => set([...pattern, pattern[pattern.length - 1] ?? "#ff9321"])}
        >
          ${localize("view3d.roofLightsPatternAdd")}
        </button>
        <button
          ?disabled=${!this.editable || !pattern.length}
          @click=${() => set(pattern.slice(0, -1))}
        >
          ${localize("view3d.roofLightsPatternRemove")}
        </button>
      </div>
      <span class="hint">${localize("view3d.roofLightsPatternHint")}</span>
    </details>`;
  }

  /** A strip's edges, each ticked where it runs: unticking one it runs
   * along by its sides leaves it out; ticking another adds it. */
  private _renderStripEdges(
    strip: RoofLightStrip,
    patch: (p: Partial<RoofLightStrip>) => void,
  ) {
    const byKey = new Map<string, RoofEdge3d & { length: number }>();
    for (const e of this._roofEdges) {
      const len = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1], e.b[2] - e.a[2]);
      const seen = byKey.get(e.key);
      if (seen) seen.length += len;
      else byKey.set(e.key, { ...e, length: len });
    }
    const edges = [...byKey.values()].filter((e) => e.length > 0.15);
    if (!edges.length) return nothing;
    const facing: Record<string, string> = {
      n: localize("view3d.facingN"),
      e: localize("view3d.facingE"),
      s: localize("view3d.facingS"),
      w: localize("view3d.facingW"),
    };
    const lit = edges.filter((e) => stripLights(strip, e)).length;
    const toggle = (e: RoofEdge3d, on: boolean) => {
      const bySide = !!e.facing && strip.sides.includes(e.facing);
      const add = new Set(strip.edges ?? []);
      const skip = new Set(strip.skip ?? []);
      add.delete(e.key);
      skip.delete(e.key);
      if (on && !bySide) add.add(e.key);
      if (!on && bySide) skip.add(e.key);
      patch({ edges: [...add], skip: [...skip] });
    };
    return html`<details class="edges">
      <summary>
        ${localize("view3d.roofLightsEdges", {
          lit: String(lit),
          all: String(edges.length),
        })}
      </summary>
      ${edges
        .sort(
          (a, b) =>
            (a.facing ?? "").localeCompare(b.facing ?? "") ||
            a.label.localeCompare(b.label),
        )
        .map(
          (e) =>
            html`<label class="row">
              <input
                type="checkbox"
                ?disabled=${!this.editable}
                .checked=${stripLights(strip, e)}
                @change=${(ev: Event) =>
                  toggle(e, (ev.target as HTMLInputElement).checked)}
              />
              <span
                >${e.label} · ${facing[e.facing ?? "s"]}
                ${e.rake ? localize("view3d.edgeRake") : localize("view3d.edgeEave")}</span
              >
              <span class="unit">${Math.round(e.length / 0.3048)} ft</span>
            </label>`,
        )}
    </details>`;
  }

  /** Light strips along the roof's edges: each a light and the sides
   * whose edges it runs along, its LEDs so many inches apart. */
  private _renderRoofLights(plan: RoofPlan) {
    const strips = plan.lights ?? [];
    const set = (next: RoofLightStrip[]) =>
      this._setRoof({ ...plan, lights: next });
    const patch = (i: number, p: Partial<RoofLightStrip>) =>
      set(strips.map((s, k) => (k === i ? { ...s, ...p } : s)));
    const states = this.hass?.states ?? {};
    const lights = Object.keys(states)
      .filter((id) => id.startsWith("light."))
      .map((id): [string, string] => [
        id,
        String(states[id]?.attributes["friendly_name"] ?? id),
      ])
      .sort((a, b) => a[1].localeCompare(b[1]));
    const sides: [CompassSide, string][] = [
      ["n", "N"],
      ["e", "E"],
      ["s", "S"],
      ["w", "W"],
    ];
    return html`
      <div class="divider"></div>
      <div class="row">
        <span>${localize("view3d.roofLights")}</span>
        <button
          ?disabled=${!this.editable}
          @click=${() =>
            set([...strips, { entity_id: null, sides: ["s"], spacing_in: 2 }])}
        >
          ${localize("view3d.roofLightsAdd")}
        </button>
      </div>
      ${strips.map(
        (strip, i) => html`
          <label class="row">
            <span>${localize("view3d.roofLightsLight")}</span>
            <select
              ?disabled=${!this.editable}
              @change=${(e: Event) =>
                patch(i, {
                  entity_id: (e.target as HTMLSelectElement).value || null,
                })}
            >
              <option value="" ?selected=${!strip.entity_id}>—</option>
              ${lights.map(
                ([id, name]) =>
                  html`<option value=${id} ?selected=${strip.entity_id === id}>
                    ${name}
                  </option>`,
              )}
            </select>
          </label>
          <div class="row">
            <span>${localize("view3d.roofLightsSides")}</span>
            <span class="sides">
              ${sides.map(
                ([side, label]) =>
                  html`<button
                    class=${strip.sides.includes(side) ? "active" : ""}
                    ?disabled=${!this.editable}
                    @click=${() =>
                      patch(i, {
                        sides: strip.sides.includes(side)
                          ? strip.sides.filter((x) => x !== side)
                          : [...strip.sides, side],
                      })}
                  >
                    ${label}
                  </button>`,
              )}
            </span>
          </div>
          <label class="row">
            <span>${localize("view3d.roofLightsSpacing")}</span>
            <input
              type="number"
              min="0.5"
              max="48"
              step="0.5"
              ?disabled=${!this.editable}
              .value=${String(strip.spacing_in ?? 2)}
              @change=${(e: Event) => {
                const v = Number((e.target as HTMLInputElement).value);
                if (v >= 0.5 && v <= 48) patch(i, { spacing_in: v });
              }}
            />
            <span class="unit">in</span>
          </label>
          ${this._renderStripEdges(strip, (p) => patch(i, p))}
          ${this._renderStripPattern(strip, (p) => patch(i, p))}
          <div class="buttons">
            <button
              class="danger"
              ?disabled=${!this.editable}
              @click=${() => set(strips.filter((_, k) => k !== i))}
            >
              ${localize("view3d.roofLightsRemove")}
            </button>
          </div>
        `,
      )}
      ${
        roofLightsUnsaved
          ? html`<span class="hint error"
              >${localize("view3d.roofLightsRestart")}</span
            >`
          : nothing
      }
      <span class="hint">${localize("view3d.roofLightsHint")}</span>
    `;
  }

  private _renderScanControls(scan: RoomScan) {
    const num = (e: Event) => Number((e.target as HTMLInputElement).value);
    return html`
      <div class="divider"></div>
      <span class="hint">${localize("view3d.alignHint")}</span>
      <div class="buttons">
        <button
          class=${this._moveMode ? "active" : ""}
          @click=${() => (this._moveMode = !this._moveMode)}
        >
          ${localize("view3d.drag")}
        </button>
        <button
          @click=${() => this._handle?.autoAlignScan(scan.id)}
          title=${localize("view3d.autoAlignHint")}
        >
          ${localize("view3d.autoAlign")}
        </button>
        <button @click=${() => this._handle?.view("top")}>
          ${localize("view3d.topView")}
        </button>
      </div>
      <label class="row">
        <span>${localize("view3d.snap")}</span>
        <input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${this._snap}
          @change=${(e: Event) => (this._snap = (e.target as HTMLInputElement).checked)}
        />
      </label>
      <div class="row">
        <span>${localize("view3d.move")}</span>
        <div class="nudge">
          <span></span>
          <button title="↑ 5 cm" @click=${() => this._nudge(0, -5)}>
            <ha-icon icon="mdi:arrow-up"></ha-icon>
          </button>
          <span></span>
          <button title="← 5 cm" @click=${() => this._nudge(-5, 0)}>
            <ha-icon icon="mdi:arrow-left"></ha-icon>
          </button>
          <span></span>
          <button title="→ 5 cm" @click=${() => this._nudge(5, 0)}>
            <ha-icon icon="mdi:arrow-right"></ha-icon>
          </button>
          <span></span>
          <button title="↓ 5 cm" @click=${() => this._nudge(0, 5)}>
            <ha-icon icon="mdi:arrow-down"></ha-icon>
          </button>
          <span></span>
        </div>
      </div>
      <div class="row">
        <span>${localize("view3d.rotation")}</span>
        <input
          type="number"
          step="0.5"
          .value=${String(Math.round(scan.rotation_deg * 10) / 10)}
          @change=${(e: Event) => this._rotate(num(e) - scan.rotation_deg)}
        />
        <span>°</span>
      </div>
      <div class="buttons">
        <button @click=${() => this._rotate(-90)}>−90°</button>
        <button @click=${() => this._rotate(-1)}>−1°</button>
        <button @click=${() => this._rotate(1)}>+1°</button>
        <button @click=${() => this._rotate(90)}>+90°</button>
      </div>
      <div class="row">
        <span>${localize("view3d.scale")}</span>
        <input
          type="number"
          min="0.01"
          step="0.005"
          .value=${String(scan.scale)}
          @change=${(e: Event) => {
            const v = num(e);
            if (v > 0) this._patchScan(scan.id, { scale: v });
          }}
        />
      </div>
      <div class="row">
        <span>${localize("view3d.elevation")}</span>
        <input
          type="number"
          step="1"
          .value=${String(Math.round(scan.elevation_m * 100))}
          @change=${(e: Event) => this._patchScan(scan.id, { elevation_m: num(e) / 100 })}
        />
        <span>cm</span>
      </div>
      <div class="row">
        <span>${localize("view3d.opacity")}</span>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.05"
          .value=${String(scan.opacity)}
          @input=${(e: Event) => this._patchScan(scan.id, { opacity: num(e) })}
        />
      </div>
      <label class="row">
        <span>${localize("view3d.replaceWalls")}</span>
        <input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${scan.hide_walls}
          @change=${(e: Event) =>
            this._patchScan(
              scan.id,
              { hide_walls: (e.target as HTMLInputElement).checked },
              "now",
            )}
        />
      </label>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "floorplan-3d-view": Floorplan3dView;
  }
}

/** Roof parts from the editor's text (a JSON list, or objects separated
 * by commas), or null when any part isn't one. */
function parseRoofParts(raw: string): RoofPart[] | null {
  let value: unknown;
  try {
    value = JSON.parse(raw.startsWith("[") ? raw : `[${raw}]`);
  } catch {
    return null;
  }
  if (!Array.isArray(value)) return null;
  const num = (v: unknown) => typeof v === "number" && Number.isFinite(v);
  const end = (v: unknown) => v === "gable" || v === "hip" || v === "open";
  const pair = (v: unknown, each: (x: unknown) => boolean) =>
    Array.isArray(v) && v.length === 2 && v.every(each);
  const ok = value.every((p: unknown) => {
    if (!p || typeof p !== "object") return false;
    const r = p as Record<string, unknown>;
    return (
      ["x0", "y0", "x1", "y1", "pitch"].every((k) => num(r[k])) &&
      (r["hip_pitch"] === undefined || num(r["hip_pitch"])) &&
      (r["ridge"] === "x" || r["ridge"] === "y") &&
      (num(r["eave"]) || pair(r["eave"], num)) &&
      (r["ends"] === undefined || pair(r["ends"], end)) &&
      (r["overhang"] === undefined || num(r["overhang"])) &&
      (r["base"] === undefined || num(r["base"])) &&
      (r["gable"] === undefined ||
        r["gable"] === "siding" ||
        r["gable"] === "shake")
    );
  });
  return ok ? (value as RoofPart[]) : null;
}
