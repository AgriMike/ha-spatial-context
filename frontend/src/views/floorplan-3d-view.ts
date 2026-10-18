import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { safeCustomElement } from "../define";
import { sharedStyles, switchStyles } from "../styles";
import { localize } from "../i18n";
import { HaClient, fetchScan, layoutFinishesUnsaved } from "../ha-client";
import type {
  FloorFinishKind,
  FloorLayout,
  FloorMeta,
  FurnitureItem,
  GroundSetting,
  HomeAssistant,
  Opening,
  OpeningType,
  RoofPart,
  RoofPlan,
  Room,
  RoomScan,
  View3dSettings,
  Wall,
  WallFinishKind,
} from "../types";
import { catalogItem } from "../canvas/furniture-catalog";
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
  addWall,
  deleteItem,
  deleteOpening,
  deleteWall,
  duplicateItem,
  insertCorner,
  moveCorners,
  moveSegment,
  offsetFrom,
  patchItem,
  patchOpening,
  patchRoom,
  patchWall,
  snapAngle,
  snapPoint,
  spotOnWall,
  type LayoutPatch,
  type Pt,
} from "./editor3d";
import "./furniture-library-sidebar";
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
  metersPerUnit,
  stackFloors,
  type FloorInput,
} from "../view3d/scene3d";
import type {
  Box3d,
  EditPointer,
  EditRef,
  ScanMode,
  ScanPlacement3d,
  ScanPose,
  View3dHandle,
  View3dModule,
} from "../view3d/view3d-api";

/** The 3D editor's tools. */
type EditTool = "select" | "wall" | "door" | "window" | "object";

/** A drag under way in the 3D editor (plan units). */
type EditDrag =
  | { kind: "item"; id: string; offset: Pt; at: Pt }
  | { kind: "seg"; wallId: string; seg: number; start: Pt; d: number }
  | { kind: "corner"; wallId: string; index: number; from: Pt; to: Pt }
  | { kind: "opening"; id: string; wallId: string; at: Pt };

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
  private _armedRot = 0;
  /** A wall being drawn, its corners so far (plan units). */
  private _draft: Pt[] = [];
  private _ghost: Box3d[] = [];
  private _lines: [number, number, number][][] = [];
  private _drag: EditDrag | null = null;

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
    void this._client?.saveGround(ids, next).catch((err: unknown) => {
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
    void this._client?.saveRoof(ids, plan).catch((err: unknown) => {
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
    ].join("|");
    // Layout objects are replaced on every edit, so identity is enough.
    const layoutsChanged =
      this._lastLayouts.length !== context.length ||
      context.some((f, i) => this._lastLayouts[i] !== f.layout);
    if (sig !== this._sceneSig || layoutsChanged) {
      this._sceneSig = sig;
      this._lastLayouts = context.map((f) => f.layout);
      handle.setScene(
        buildScene({
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
        }),
      );
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
    this._sel = null;
    this._hover = null;
    this._draft = [];
    this._ghost = [];
    this._lines = [];
    this._drag = null;
    if (this._editing) this._sheetOpen = false;
    this._sceneSig = "";
  }

  private _setTool(tool: EditTool): void {
    this._tool = tool;
    this._draft = [];
    this._ghost = [];
    this._lines = [];
    if (tool !== "object") this._armedKind = null;
    this._pushOverlay();
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
    handle.setEditOverlay({
      select: this._sel,
      hover: this._hover,
      handles,
      activeHandle: this._drag?.kind === "corner" ? this._drag.index : null,
      lines: this._lines,
      ghost: this._ghost,
    });
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

    // --- drawing a wall ---
    if (tool === "wall") {
      if (!floorPt) return false;
      let p = snapPoint(layout, floorPt, grid, reach);
      const last = this._draft[this._draft.length - 1];
      if (last && !e.alt) p = snapAngle(last, p);
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
        this._drag = {
          kind: "item",
          id: item.id,
          offset: [item.x - floorPt[0], item.y - floorPt[1]],
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
    if (e.type === "drag" && this._drag && floorPt) {
      const drag = this._drag;
      if (drag.kind === "item") {
        const item = layout.furniture.find((f) => f.id === drag.id);
        if (!item) return false;
        const raw: Pt = [
          floorPt[0] + drag.offset[0],
          floorPt[1] + drag.offset[1],
        ];
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
        drag.d = d;
        this._ghostFor(
          moveSegment(layout, wall.id, drag.seg, d, 1.5 * this._perCm),
          H,
        );
      } else if (drag.kind === "corner") {
        const p = snapPoint(layout, floorPt, grid, reach, {
          wallId: drag.wallId,
          index: drag.index,
        });
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
      if (drag.kind === "item") {
        const item = layout.furniture.find((f) => f.id === drag.id);
        if (item && (item.x !== drag.at[0] || item.y !== drag.at[1]))
          this._edit(
            patchItem(layout, drag.id, { x: drag.at[0], y: drag.at[1] }),
          );
      } else if (drag.kind === "seg" && Math.abs(drag.d) > 1e-9) {
        this._edit(
          moveSegment(layout, drag.wallId, drag.seg, drag.d, 1.5 * this._perCm),
        );
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
      return false;
    }
    if (e.type === "click") {
      this._sel = e.hit.ref;
      this._hover = null;
      this._pushOverlay();
      return false;
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
      } else if (this._draft.length) this._setTool("wall");
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
    if ((key === "Delete" || key === "Backspace") && this._sel) {
      take();
      if (this._tool === "wall" && this._draft.length) {
        this._draft = this._draft.slice(0, -1);
        return;
      }
      this._deleteSelection();
      return;
    }
    if (!mod && key.toLowerCase() === "r" && layout) {
      const step = e.shiftKey ? 15 : 90;
      if (this._tool === "object") {
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
    ];
    const hint: Record<EditTool, string> = {
      select: localize("edit3d.selectHint"),
      wall: localize("edit3d.wallHint"),
      door: localize("edit3d.openingHint"),
      window: localize("edit3d.openingHint"),
      object: localize("edit3d.objectHint"),
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
        this._tool === "object"
          ? html`<furniture-library-sidebar
              class="library"
              .armedKind=${this._armedKind}
              @furniture-armed=${(e: CustomEvent<{ kind: string | null }>) => {
                this._armedKind = e.detail.kind;
                if (!e.detail.kind) this._setTool("select");
              }}
              @library-close=${() => this._setTool("select")}
            ></furniture-library-sidebar>`
          : this._tool === "select"
            ? this._renderSelection(layout)
            : nothing
      }
    </div>`;
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
                    this._sheetOpen = !this._sheetOpen;
                  }}
                >
                  <ha-icon icon="mdi:cube-scan"></ha-icon>
                  ${localize("view3d.scans")}
                </button>`
              : nothing
          }
        </div>
      </div>
      ${this.editable && this._sheetOpen && !this._editing ? this._renderSheet() : nothing}
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
      this._setRoof({ parts });
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
