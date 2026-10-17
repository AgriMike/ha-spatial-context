import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { safeCustomElement } from "../define";
import { sharedStyles, switchStyles } from "../styles";
import { localize } from "../i18n";
import { HaClient, fetchScan } from "../ha-client";
import type {
  FloorLayout,
  FloorMeta,
  HomeAssistant,
  RoomScan,
  View3dSettings,
} from "../types";
import type { Sky } from "../canvas/sun";
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
  ScanPlacement3d,
  ScanPose,
  View3dHandle,
  View3dModule,
} from "../view3d/view3d-api";

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
      .row {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: var(--sc-fs-body);
      }
      .row > span:first-child {
        flex: 1;
      }
      .row input[type="number"] {
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
  @state() private _view3d = new Map<string, View3dSettings>();
  @state() private _otherLayouts = new Map<string, FloorLayout>();
  @state() private _spread = 0;
  /** Hour of today the sun is shown at; null follows the clock. */
  @state() private _hour: number | null = null;
  @state() private _sheetOpen = false;
  @state() private _selectedScanId: string | null = null;
  @state() private _moveMode = false;
  @state() private _snap = true;
  @state() private _uploading = false;
  @state() private _scanStatus = new Map<string, string>();
  @state() private _exporting = false;

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
    // Back after being detached (destroyed in disconnectedCallback).
    this.requestUpdate();
    // The sun moves: re-light every minute while following the clock.
    this._clock = setInterval(() => {
      if (this._hour === null) this._rebuild();
    }, 60_000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
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
    for (const floorId of this._shownFloorIds) {
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
    for (const floorId of this._shownFloorIds) {
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
    const floors = inputs.length > 1 ? stackFloors(inputs) : inputs;
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
      live,
      minute,
      this.dark,
      this.sky?.clouds ?? "",
    ].join("|");
    // Layout objects are replaced on every edit, so identity is enough.
    const layoutsChanged = floors.some(
      (f, i) => this._lastLayouts[i] !== f.layout,
    );
    if (sig !== this._sceneSig || layoutsChanged) {
      this._sceneSig = sig;
      this._lastLayouts = floors.map((f) => f.layout);
      handle.setScene(
        buildScene({
          floors,
          hass: this.hass,
          dark: this.dark,
          date,
          sky: this.sky,
          showLights: true,
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
    handle.setEditScan(
      this.editable && this._sheetOpen && this._moveMode
        ? this._selectedScanId
        : null,
      this._snap,
    );
  };
  private _lastLayouts: FloorLayout[] = [];
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
                  class=${this._sheetOpen ? "active" : ""}
                  title=${localize("view3d.scansHint")}
                  @click=${() => (this._sheetOpen = !this._sheetOpen)}
                >
                  <ha-icon icon="mdi:cube-scan"></ha-icon>
                  ${localize("view3d.scans")}
                </button>`
              : nothing
          }
        </div>
      </div>
      ${this.editable && this._sheetOpen ? this._renderSheet() : nothing}
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
