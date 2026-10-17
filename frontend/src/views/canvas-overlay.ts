import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import "./search-select";
import { property, state } from "lit/decorators.js";
import { safeCustomElement } from "../define";
import type {
  AreaMeta,
  CanvasMode,
  FloorMeta,
  FurnitureItem,
  Opening,
  PlaceableEntity,
  Pin,
  ResolvedMeshLink,
  ResolvedMeshStub,
  Room,
  SnapMode,
  UnitSystem,
  Wall,
} from "../types";
import {
  DEFAULT_ROOM_BORDER_OPACITY,
  DEFAULT_ROOM_FILL_COLOR,
  DEFAULT_ROOM_FILL_OPACITY,
} from "../canvas/floorplan-canvas";
import {
  WALL_MATERIALS,
  materialLabel,
  wallThicknessCm,
} from "../canvas/materials";
import { pinDisplayLabel } from "../canvas/device-display";
import { qualityColor } from "../canvas/mesh-colors";
import "./row-actions";
import {
  actionRow,
  deleteButton,
  fieldRow,
  infoCardStyles,
  networkGroup,
  renderCard,
  selectWrap,
} from "./info-card";
import { HA_COLORS, resolveColorHex } from "./color-palette";
import { meshLegendStyles, renderMeshLegend } from "./mesh-legend";
import {
  canvasUnitsToDisplayAs,
  defaultSmallSubUnit,
  displayToCanvasUnitsAs,
  formatLarge,
  formatSmallAs,
  parseSmallAs,
  smallSubUnitsFor,
  type SmallSubUnit,
} from "../units";
import {
  selectStyles,
  sharedStyles,
  sliderStyles,
  switchStyles,
  toolRowStyles,
} from "../styles";
import { localize } from "../i18n";
import { catalogItem, isShapeKind } from "../canvas/furniture-catalog";
import { defaultCornerPct, shapeCornerCount } from "../canvas/furniture-draw";
import {
  isToggleable,
  type ItemState,
  type RoomLight,
} from "../canvas/live-state";

/** Entity domains a furniture item can stand for, in picker order. */
const LINKABLE_DOMAINS = [
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

/** A device in a room's HA area, for the room card's checklist. */
export interface AreaDevice {
  deviceId: string;
  name: string;
  icon: string;
  /** Placed on this floor, on another floor/the property, or nowhere. */
  placed: "here" | "elsewhere" | "none";
  /** Where, when placed elsewhere. */
  where: string | null;
}

/** An entity offered in a picker: id plus display name. */
export interface EntityOption {
  entity_id: string;
  name: string;
}

/** Everything that floats over the canvas, Innerspace-style, instead of
 * pushing it down: the drawing-mode toolbar (top-left), the scale readout
 * (top-right), and the selection/context panel (bottom-left, only present
 * when something's selected). One host spanning the canvas area so each
 * piece can be positioned independently within it. */
@safeCustomElement("canvas-overlay")
export class CanvasOverlay extends LitElement {
  static override styles = [
    sharedStyles,
    selectStyles,
    infoCardStyles,
    sliderStyles,
    switchStyles,
    toolRowStyles,
    meshLegendStyles,
    css`
      :host {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .mode-toolbar {
        pointer-events: auto;
      }
      .mode-toolbar button {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        border-radius: 10px;
      }
      /* A thin divider between tool groups: view, draw, place/align. */
      .tool-divider {
        align-self: stretch;
        width: 1px;
        margin: 6px 4px;
        background: var(--sc-divider);
      }
      .mode-toolbar ha-icon {
        --mdc-icon-size: 20px;
      }
      /* Tonal active state, like HA's selected chips and tabs: the primary
       * colour at low strength behind a primary icon. */
      .mode-toolbar button.active {
        background: color-mix(in srgb, var(--sc-accent) 22%, transparent);
        color: var(--sc-accent);
      }
      .mode-toolbar button.active ha-icon {
        color: var(--sc-accent);
      }
      .hint-bar {
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        align-items: center;
        gap: 8px;
        pointer-events: auto;
      }
      .snap-select {
        padding: 4px;
      }
      .hint {
        font-size: var(--sc-fs-small);
        color: var(--sc-fg-secondary);
      }
      .color-field {
        display: flex;
        align-items: center;
        gap: 8px;
        height: var(--sc-h-field);
        padding: 0 8px 0 10px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-panel-bg);
        font-size: var(--sc-fs-body);
      }
      .swatch {
        flex: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid color-mix(in srgb, var(--sc-fg) 25%, transparent);
      }
      .custom-swatch {
        background: conic-gradient(red, yellow, lime, aqua, blue, magenta, red);
      }
      .color-list {
        max-height: 260px;
        overflow-y: auto;
        margin: 0 8px 4px;
        border: 1px solid var(--sc-divider);
        border-radius: 16px;
        background: var(--sc-panel-bg);
      }
      .color-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        min-height: 44px;
        padding: 6px 14px;
        border-radius: 0;
        font-size: var(--sc-fs-row);
        text-align: left;
        justify-content: flex-start;
        cursor: pointer;
      }
      .color-item:hover {
        background: var(--sc-hover);
      }
      .color-item.selected {
        color: var(--sc-accent);
      }
      .color-item .grow {
        flex: 1;
        min-width: 0;
      }
      .color-item ha-icon {
        --mdc-icon-size: 20px;
        color: var(--sc-accent);
      }
      .color-item .room-fill-color {
        width: 36px;
        height: 24px;
      }
      .small-unit-select {
        width: auto;
      }
      .room-fill-color {
        -webkit-appearance: none;
        appearance: none;
        width: 44px;
        height: 32px;
        padding: 0;
        border: 1px solid var(--sc-divider);
        border-radius: 10px;
        background: none;
        cursor: pointer;
        overflow: hidden;
      }
      .room-fill-color::-webkit-color-swatch-wrapper {
        padding: 0;
      }
      .room-fill-color::-webkit-color-swatch {
        border: none;
      }
      .room-fill-color::-moz-color-swatch {
        border: none;
      }
      .room-opacity {
        width: 140px;
      }
      .device-row {
        cursor: pointer;
      }
      .device-row.disabled {
        opacity: 0.55;
        cursor: default;
      }
      .device-row .device-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .device-row input {
        width: 18px;
        height: 18px;
        accent-color: var(--sc-accent);
      }
      .icon-choices {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 0 12px 8px 44px;
      }
      .icon-choice {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        padding: 0;
        border: 1px solid var(--sc-divider);
        border-radius: 10px;
        color: var(--sc-fg);
      }
      .icon-choice.active {
        border-color: var(--sc-accent);
        color: var(--sc-accent);
        background: color-mix(in srgb, var(--sc-accent) 10%, transparent);
      }
      .icon-choice ha-icon {
        --mdc-icon-size: 20px;
      }
      /* The same width as the row's other dropdowns, so the label keeps
       * its room. */
      search-select.link-search {
        flex: 0 1 180px;
        width: 180px;
        min-width: 120px;
      }
      .link-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 2px 12px 6px 44px;
      }
      .link-chip {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        max-width: 100%;
        height: 26px;
        padding: 0 4px 0 10px;
        border: 1px solid var(--sc-divider);
        border-radius: 13px;
        font-size: 12px;
      }
      .link-chip span {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .link-chip button {
        display: grid;
        place-items: center;
        width: 20px;
        height: 20px;
        padding: 0;
        border-radius: 50%;
        color: var(--sc-fg-secondary);
      }
      .link-chip ha-icon {
        --mdc-icon-size: 14px;
      }
      .light-buttons {
        display: flex;
        gap: 6px;
      }
      .light-buttons button {
        height: 30px;
        padding: 0 10px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
      }
      .furniture-size {
        width: 64px;
      }
      .stroke-range {
        width: 120px;
      }
      .icon-buttons {
        display: flex;
        gap: 2px;
      }
      .icon-buttons button {
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        padding: 0;
        border-radius: 50%;
      }
      .color-reset {
        height: 28px;
        padding: 0 8px;
        font-size: 12px;
        color: var(--sc-fg-secondary);
      }
    `,
  ];

  @property({ attribute: false }) mode: CanvasMode = "select";
  @property({ attribute: false }) armedOpeningType: "door" | "window" | null =
    null;
  @property({ type: Boolean }) hasPendingTrace = false;
  @property({ type: Boolean }) hasPendingWall = false;
  /** What placing in furniture mode does: drop an item, drag out a
   * shape, or click corners of a free-form shape. */
  @property({ attribute: false }) furnitureHint:
    "place" | "shape" | "freeform" = "place";
  /** Corners clicked so far on the free-form shape being drawn. */
  @property({ type: Number }) freeformPoints = 0;
  @property({ attribute: false }) snapMode: SnapMode = "all";
  @property({ type: Number }) pendingScaleCount = 0;

  @property({ attribute: false }) selectedRoom: Room | null = null;
  @property({ type: Boolean }) editingRoom = false;
  @property({ attribute: false }) areas: AreaMeta[] = [];
  @property({ attribute: false }) selectedPin: Pin | null = null;
  @property({ attribute: false }) selectedWall: Wall | null = null;
  @property({ type: Boolean }) editingWall = false;
  @property({ attribute: false }) unitSystem: UnitSystem = "metric";
  /** Canvas units per real metre, from the current floor's Scale
   * calibration — null when uncalibrated. Only needed for opening width
   * (see displayToCanvasUnitsAs), since thickness_cm/height_m are already
   * absolute real values. */
  @property({ type: Number }) unitsPerMeter: number | null = null;
  @property({ attribute: false }) pinStack: Pin[] | null = null;
  @property({ attribute: false }) entityLookup: Map<string, PlaceableEntity> =
    new Map();
  @property({ attribute: false }) selectedOpening: Opening | null = null;
  @property({ attribute: false }) selectedFurniture: FurnitureItem | null =
    null;
  @property({ type: Boolean }) furnitureLibraryOpen = false;
  /** Every room on the floor (for linking one room's lights to another). */
  @property({ attribute: false }) rooms: Room[] = [];
  /** All HA areas, on any floor (for linking a room's lights to them). */
  @property({ attribute: false }) allAreas: AreaMeta[] = [];
  @property({ attribute: false }) lightEntities: EntityOption[] = [];
  @property({ attribute: false }) coverEntities: EntityOption[] = [];
  @property({ attribute: false }) selectedRoomLight: RoomLight | null = null;
  @property({ attribute: false }) selectedCoverOpenness: number | null = null;
  @property({ attribute: false }) selectedCoverOpennessRight: number | null =
    null;
  @property({ type: Boolean }) floorCalibrated = false;
  /** Entities a furniture item can be linked to (see LINKABLE_DOMAINS). */
  @property({ attribute: false }) linkableEntities: EntityOption[] = [];
  @property({ attribute: false }) selectedItemState: ItemState | null = null;
  /** Devices in the selected room's HA area, for its device checklist. */
  @property({ attribute: false }) areaDevices: AreaDevice[] = [];
  /** Icons to offer for the selected device pin (type icon first). */
  @property({ attribute: false }) pinIconChoices: string[] = [];
  /** Show the weak → strong key along the bottom (a network layer is on). */
  @state() private _colorOpen = false;
  @property({ type: Boolean }) dirty = false;
  @property({ type: Boolean }) saving = false;
  @property({ type: Boolean }) canUndo = false;
  @property({ type: Boolean }) canRedo = false;
  @property({ type: Boolean }) meshLegend = false;
  /** The links drawn on this floor, and the active network layer's name
   * (null when none is on) — the device card lists the selected device's. */
  @property({ attribute: false }) meshLinks: ResolvedMeshLink[] = [];
  @property({ attribute: false }) meshStubs: ResolvedMeshStub[] = [];
  @property({ attribute: false }) networkLabel: string | null = null;
  @property({ attribute: false }) selectedMeshLink: ResolvedMeshLink | null =
    null;
  @property({ attribute: false }) selectedMeshStub: ResolvedMeshStub | null =
    null;

  @property({ attribute: false }) otherFloors: FloorMeta[] = [];
  @property({ attribute: false }) alignTargetFloorId: string | null = null;
  @property({ type: Boolean }) alignTargetHasBackground = true;

  /** Which of the system's two sub-units (cm/m, or in/ft) the wall
   * thickness / opening width inputs currently display in — null means
   * "use the system default" (defaultSmallSubUnit). Reset to null
   * whenever a *different* wall/opening gets selected (see willUpdate)
   * so a fresh selection always starts from the default, but switching
   * units on the currently-selected one sticks until you select something
   * else. */
  @state() private _wallThicknessUnit: SmallSubUnit | null = null;
  @state() private _openingWidthUnit: SmallSubUnit | null = null;
  @state() private _furnitureSizeUnit: SmallSubUnit | null = null;
  /** The opening whose "two covers" switch was just turned on, before a
   * right-hand cover has been picked. */
  @state() private _splitCoverFor: string | null = null;

  override willUpdate(changed: PropertyValues<this>) {
    if (
      changed.has("selectedRoom") &&
      changed.get("selectedRoom")?.id !== this.selectedRoom?.id
    ) {
      this._colorOpen = false;
    }
    if (
      changed.has("selectedWall") &&
      changed.get("selectedWall")?.id !== this.selectedWall?.id
    ) {
      this._wallThicknessUnit = null;
    }
    if (
      changed.has("selectedOpening") &&
      changed.get("selectedOpening")?.id !== this.selectedOpening?.id
    ) {
      this._openingWidthUnit = null;
    }
    if (
      changed.has("selectedFurniture") &&
      changed.get("selectedFurniture")?.id !== this.selectedFurniture?.id
    ) {
      this._furnitureSizeUnit = null;
    }
  }

  private _fire(name: string, detail?: unknown) {
    this.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true, composed: true }),
    );
  }

  /** cm/m or in/ft picker for a "small" quantity input (wall thickness,
   * opening width) — the value itself round-trips through units.ts's
   * formatSmallAs/parseSmallAs, this only ever changes which sub-unit is
   * displayed, never the underlying stored value. */
  private _unitSelect(
    current: SmallSubUnit,
    onSelect: (unit: SmallSubUnit) => void,
  ) {
    return html`
      <select
        class="small-unit-select"
        @change=${(e: Event) =>
          onSelect((e.target as HTMLSelectElement).value as SmallSubUnit)}
      >
        ${smallSubUnitsFor(this.unitSystem).map(
          (unit) =>
            html`<option value=${unit} ?selected=${unit === current}>
              ${unit}
            </option>`,
        )}
      </select>
    `;
  }

  /** Cosmetic number-input bounds per sub-unit — the underlying value is
   * validated for finite/>0 in the @change handlers regardless, these
   * just keep the spinner/step sane for each unit's typical range. */
  private _thicknessInputAttrs(unit: SmallSubUnit): {
    min: string;
    max: string;
    step: string;
  } {
    switch (unit) {
      case "cm":
        return { min: "1", max: "100", step: "0.5" };
      case "m":
        return { min: "0.01", max: "1", step: "0.01" };
      case "in":
        return { min: "0.5", max: "40", step: "0.1" };
      case "ft":
        return { min: "0.02", max: "1.5", step: "0.01" };
    }
  }

  private _modeButton(mode: CanvasMode, icon: string, label: string) {
    return html`<button
      class=${this.mode === mode ? "active" : ""}
      title=${label}
      @click=${() => this._fire("mode-change", { mode })}
    >
      <ha-icon icon=${icon}></ha-icon>
    </button>`;
  }

  private _openingModeButton(
    openingType: "door" | "window",
    icon: string,
    label: string,
  ) {
    const active =
      this.mode === "opening" && this.armedOpeningType === openingType;
    return html`<button
      class=${active ? "active" : ""}
      title=${label}
      @click=${() => this._fire("add-opening-click", { openingType })}
    >
      <ha-icon icon=${icon}></ha-icon>
    </button>`;
  }

  private _renderModeToolbar() {
    return html`
      <div class="mode-toolbar">
        ${this._modeButton("select", "mdi:cursor-default-click", localize("canvas.mode.select"))}
        ${this._modeButton("pan", "mdi:hand-back-right-outline", localize("canvas.mode.pan"))}
        <span class="tool-divider"></span>
        ${this._modeButton("trace", "mdi:vector-square", localize("canvas.mode.trace"))}
        ${this._modeButton("wall", "mdi:wall", localize("canvas.mode.wall"))}
        ${this._openingModeButton("door", "mdi:door", localize("canvas.mode.door"))}
        ${this._openingModeButton("window", "mdi:window-closed-variant", localize("canvas.mode.window"))}
        ${this._modeButton("scale", "mdi:ruler", localize("canvas.mode.scale"))}
        <span class="tool-divider"></span>
        ${this._modeButton("place", "mdi:map-marker-plus", localize("canvas.mode.place"))}
        <button
          class=${this.furnitureLibraryOpen ? "active" : ""}
          title=${localize("canvas.mode.furniture")}
          @click=${() => this._fire("furniture-library-click")}
        >
          <ha-icon icon="mdi:sofa-single-outline"></ha-icon>
        </button>
        ${this._modeButton("align", "mdi:compare", localize("canvas.mode.align"))}
      </div>
    `;
  }

  /** Snap picker shown while tracing a room or wall (#36). Shift still
   * frees a single point whatever this is set to. */
  private _renderSnapSelect() {
    return html`<select
      class="snap-select"
      title=${localize("canvas.snap.tooltip")}
      @change=${(e: Event) =>
        this._fire("snap-mode-change", {
          snapMode: (e.target as HTMLSelectElement).value as SnapMode,
        })}
    >
      <option value="all" ?selected=${this.snapMode === "all"}>
        ${localize("canvas.snap.all")}
      </option>
      <option value="same" ?selected=${this.snapMode === "same"}>
        ${this.mode === "wall" ? localize("canvas.snap.walls") : localize("canvas.snap.rooms")}
      </option>
      <option value="off" ?selected=${this.snapMode === "off"}>
        ${localize("canvas.snap.off")}
      </option>
    </select>`;
  }

  private _renderHintBar() {
    if (this.mode === "trace") {
      return html`<div class="hint-bar floating-panel">
        <span class="hint"
          >${
            this.hasPendingTrace
              ? localize("canvas.hint.closeRoom")
              : localize("canvas.hint.addPoints")
          }</span
        >
        ${this._renderSnapSelect()}
        ${
          this.hasPendingTrace
            ? html`<button @click=${() => this._fire("cancel-pending-click")}>
                ${localize("canvas.button.cancel")}
              </button>`
            : nothing
        }
      </div>`;
    }
    if (this.mode === "wall") {
      return html`<div class="hint-bar floating-panel">
        <span class="hint"
          >${
            this.hasPendingWall
              ? localize("canvas.hint.addWallPointsFinish")
              : localize("canvas.hint.addWallPoints")
          }</span
        >
        ${this._renderSnapSelect()}
        ${
          this.hasPendingWall
            ? html`<button
                class="primary"
                @click=${() => this._fire("finish-wall-click")}
              >
                ${localize("canvas.button.finishWall")}
              </button>`
            : nothing
        }
        ${
          this.hasPendingWall
            ? html`<button @click=${() => this._fire("cancel-pending-click")}>
                ${localize("canvas.button.cancel")}
              </button>`
            : nothing
        }
      </div>`;
    }
    if (this.mode === "scale") {
      return html`<div class="hint-bar floating-panel">
        <span class="hint"
          >${
            this.pendingScaleCount === 0
              ? localize("canvas.hint.scaleFirst")
              : localize("canvas.hint.scaleSecond")
          }</span
        >
        ${
          this.pendingScaleCount > 0
            ? html`<button @click=${() => this._fire("cancel-pending-click")}>
                ${localize("canvas.button.cancel")}
              </button>`
            : nothing
        }
      </div>`;
    }
    if (this.mode === "opening") {
      return html`<div class="hint-bar floating-panel">
        <span class="hint"
          >${localize("canvas.hint.placeOpening", {
            type: localize(
              `canvas.openingType.${this.armedOpeningType ?? "opening"}`,
            ),
          })}</span
        >
      </div>`;
    }
    if (this.mode === "align") {
      return this._renderAlignBar();
    }
    if (this.mode === "furniture" && this.furnitureHint === "freeform") {
      return html`<div class="hint-bar floating-panel">
        <span class="hint">${localize("canvas.hint.freeform")}</span>
        ${this._renderSnapSelect()}
        ${
          this.freeformPoints >= 2
            ? html`<button
                class="primary"
                @click=${() => this._fire("finish-shape-click")}
              >
                ${localize("canvas.button.finishShape")}
              </button>`
            : nothing
        }
        ${
          this.freeformPoints > 0
            ? html`<button @click=${() => this._fire("cancel-pending-click")}>
                ${localize("canvas.button.cancel")}
              </button>`
            : nothing
        }
        <button @click=${() => this._fire("furniture-done-click")}>
          ${localize("canvas.button.done")}
        </button>
      </div>`;
    }
    if (this.mode === "furniture") {
      return html`<div class="hint-bar floating-panel">
        <span class="hint"
          >${localize(
            this.furnitureHint === "shape"
              ? "canvas.hint.drawShape"
              : "canvas.hint.placeFurniture",
          )}</span
        >
        <button @click=${() => this._fire("furniture-rotate-armed-click")}>
          <ha-icon icon="mdi:rotate-right-variant"></ha-icon>
        </button>
        <button @click=${() => this._fire("furniture-done-click")}>
          ${localize("canvas.button.done")}
        </button>
      </div>`;
    }
    return nothing;
  }

  private _coverStateText(opening: Opening): string {
    const pct = (o: number | null) =>
      o === null
        ? localize("canvas.opening.coverUnavailable")
        : localize("canvas.opening.coverOpen", { pct: Math.round(o * 100) });
    if (!opening.cover_right_entity_id) return pct(this.selectedCoverOpenness);
    return `${localize("canvas.opening.left")} ${pct(this.selectedCoverOpenness)} · ${localize("canvas.opening.right")} ${pct(this.selectedCoverOpennessRight)}`;
  }

  /** One cover, or a left and a right cover (as seen from inside looking
   * out) on a wide door or window, with a swap if they're the wrong way
   * round. */
  private _renderCoverPickers(opening: Opening) {
    const two =
      opening.cover_right_entity_id !== undefined &&
      opening.cover_right_entity_id !== null
        ? true
        : this._splitCoverFor === opening.id;
    const picker = (
      icon: string,
      label: string,
      value: string | null | undefined,
      side: "left" | "right",
    ) =>
      this._fieldRow(
        icon,
        label,
        this._selectWrap(
          html`<select
            @change=${(e: Event) =>
              this._fire("opening-cover-change", {
                entityId: (e.target as HTMLSelectElement).value || null,
                side,
              })}
          >
            <option value="" ?selected=${!value}>
              ${localize("canvas.opening.noCover")}
            </option>
            ${this.coverEntities.map(
              (c) =>
                html`<option
                  value=${c.entity_id}
                  ?selected=${c.entity_id === value}
                >
                  ${c.name}
                </option>`,
            )}
          </select>`,
        ),
      );
    return html`
      ${picker(
        "mdi:blinds",
        two
          ? localize("canvas.opening.coverLeft")
          : localize("canvas.opening.cover"),
        opening.cover_entity_id,
        "left",
      )}
      ${two ? picker("mdi:blinds", localize("canvas.opening.coverRight"), opening.cover_right_entity_id, "right") : nothing}
      ${this._fieldRow(
        "mdi:garage",
        localize("canvas.opening.garage"),
        html`<input
          type="checkbox"
          class="switch"
          role="switch"
          title=${localize("canvas.opening.garageHint")}
          .checked=${!!opening.garage}
          @change=${(e: Event) =>
            this._fire("opening-garage-change", {
              garage: (e.target as HTMLInputElement).checked,
            })}
        />`,
      )}
      ${this._fieldRow(
        "mdi:arrow-split-vertical",
        localize("canvas.opening.twoCovers"),
        html`<input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${two}
          @change=${(e: Event) => {
            const on = (e.target as HTMLInputElement).checked;
            this._splitCoverFor = on ? opening.id : null;
            if (!on)
              this._fire("opening-cover-change", {
                entityId: null,
                side: "right",
              });
            this.requestUpdate();
          }}
        />`,
      )}
      ${
        two && (opening.cover_entity_id || opening.cover_right_entity_id)
          ? this._actionRow(
              "mdi:swap-horizontal",
              localize("canvas.opening.swapCovers"),
              () => this._fire("opening-cover-swap"),
            )
          : nothing
      }
    `;
  }

  /** The opening's daylight fine-tuning: on/off, strength, reach, window
   * top height and outdoor shade. */
  private _renderOpeningDaylight(opening: Opening) {
    const t = opening.daylight ?? {};
    const change = (patch: Partial<NonNullable<Opening["daylight"]>>) =>
      this._fire("opening-daylight-change", { patch });
    const imperial = this.unitSystem === "imperial";
    const head = t.head_m ?? 2.1;
    const slider = (
      icon: string,
      label: string,
      value: number,
      min: number,
      max: number,
      step: number,
      onInput: (v: number) => void,
    ) =>
      this._fieldRow(
        icon,
        label,
        html`<input
          type="range"
          class="stroke-range"
          min=${min}
          max=${max}
          step=${step}
          style="--pct:${((value - min) / (max - min)) * 100}%"
          .value=${String(value)}
          @input=${(e: Event) =>
            onInput(Number((e.target as HTMLInputElement).value))}
        />`,
      );
    const enabled = t.enabled !== false;
    return html`
      <div class="info-group-title">${localize("canvas.daylight.title")}</div>
      ${this._fieldRow(
        "mdi:white-balance-sunny",
        localize("canvas.daylight.show"),
        html`<input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${enabled}
          @change=${(e: Event) =>
            change({ enabled: (e.target as HTMLInputElement).checked })}
        />`,
      )}
      ${
        enabled
          ? html`
              ${slider(
                "mdi:brightness-6",
                localize("canvas.daylight.strength", {
                  pct: Math.round((t.strength ?? 1) * 100),
                }),
                t.strength ?? 1,
                0,
                2,
                0.05,
                (strength) => change({ strength }),
              )}
              ${slider(
                "mdi:arrow-expand-vertical",
                localize("canvas.daylight.reach", {
                  pct: Math.round((t.reach ?? 1) * 100),
                }),
                t.reach ?? 1,
                0.25,
                3,
                0.05,
                (reach) => change({ reach }),
              )}
              ${this._fieldRow(
                "mdi:window-maximize",
                localize("canvas.daylight.head", {
                  unit: imperial ? "ft" : "m",
                }),
                html`<input
                  type="number"
                  class="furniture-size"
                  min=${imperial ? 1 : 0.3}
                  max=${imperial ? 30 : 10}
                  step=${imperial ? 0.5 : 0.1}
                  .value=${String(
                    Math.round((imperial ? head / 0.3048 : head) * 10) / 10,
                  )}
                  @change=${(e: Event) => {
                    const v = Number((e.target as HTMLInputElement).value);
                    if (!Number.isFinite(v) || v <= 0) return;
                    change({ head_m: imperial ? v * 0.3048 : v });
                  }}
                />`,
              )}
              ${slider(
                "mdi:tree-outline",
                localize("canvas.daylight.shade", {
                  pct: Math.round((t.shade ?? 0) * 100),
                }),
                t.shade ?? 0,
                0,
                1,
                0.05,
                (shade) => change({ shade }),
              )}
              ${
                opening.daylight
                  ? this._actionRow(
                      "mdi:restore",
                      localize("canvas.daylight.reset"),
                      () =>
                        this._fire("opening-daylight-change", {
                          reset: true,
                        }),
                    )
                  : nothing
              }
            `
          : nothing
      }
    `;
  }

  /** The room's name label: shown or not, size, rotation, colour and
   * position (it's dragged on the plan). */
  private _renderRoomLabel(room: Room) {
    const change = (patch: Partial<Room>) =>
      this._fire("room-label-change", { patch });
    const shown = room.show_label !== false;
    const size = room.label_size ?? 1;
    const rot = room.label_rotation ?? 0;
    return html`<div class="info-group">
      <div class="info-group-title">${localize("canvas.label.title")}</div>
      ${this._fieldRow(
        "mdi:format-text",
        localize("canvas.label.show"),
        html`<input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${shown}
          @change=${(e: Event) =>
            change({ show_label: (e.target as HTMLInputElement).checked })}
        />`,
      )}
      ${
        shown
          ? html`
              ${this._fieldRow(
                "mdi:format-size",
                localize("canvas.label.size", { pct: Math.round(size * 100) }),
                html`<input
                  type="range"
                  class="stroke-range"
                  min="0.4"
                  max="3"
                  step="0.05"
                  style="--pct:${((size - 0.4) / 2.6) * 100}%"
                  .value=${String(size)}
                  @input=${(e: Event) =>
                    change({
                      label_size: Number((e.target as HTMLInputElement).value),
                    })}
                />`,
              )}
              ${this._fieldRow(
                "mdi:format-rotate-90",
                localize("canvas.label.rotation"),
                html`<span class="inline-pair">
                  <input
                    type="number"
                    class="furniture-size"
                    step="5"
                    .value=${String(rot)}
                    @change=${(e: Event) => {
                      const v = Number((e.target as HTMLInputElement).value);
                      if (Number.isFinite(v))
                        change({ label_rotation: ((v + 540) % 360) - 180 });
                    }}
                  />
                  <span class="icon-buttons">
                    <button
                      title=${localize("furniture.rotateLeft")}
                      @click=${() =>
                        change({
                          label_rotation: ((rot - 90 + 540) % 360) - 180,
                        })}
                    >
                      <ha-icon icon="mdi:rotate-left"></ha-icon>
                    </button>
                    <button
                      title=${localize("furniture.rotateRight")}
                      @click=${() =>
                        change({
                          label_rotation: ((rot + 90 + 540) % 360) - 180,
                        })}
                    >
                      <ha-icon icon="mdi:rotate-right"></ha-icon>
                    </button>
                  </span>
                </span>`,
              )}
              ${this._fieldRow(
                "mdi:palette",
                localize("canvas.label.colour"),
                html`<span class="inline-pair">
                  ${
                    room.label_color
                      ? html`<button
                          class="color-reset"
                          @click=${() => change({ label_color: null })}
                        >
                          ${localize("canvas.card.colourDefault")}
                        </button>`
                      : nothing
                  }
                  <input
                    type="color"
                    class="room-fill-color"
                    .value=${room.label_color ?? "#2f343a"}
                    @input=${(e: Event) =>
                      change({
                        label_color: (e.target as HTMLInputElement).value,
                      })}
                  />
                </span>`,
              )}
              <div class="info-row">
                <span class="grow info-sub"
                  >${localize("canvas.label.dragHint")}</span
                >
              </div>
              ${
                room.label_position
                  ? this._actionRow(
                      "mdi:format-text-variant-outline",
                      localize("canvas.room.resetLabel"),
                      () => this._fire("room-label-reset-click"),
                    )
                  : nothing
              }
            `
          : nothing
      }
    </div>`;
  }

  /** The devices in the room's HA area: tick one to place it in the room
   * (with an icon for its type), untick to take it off the plan. */
  private _renderAreaDevices(room: Room) {
    if (!room.area_id) return nothing;
    const devices = this.areaDevices;
    const area = this.allAreas.find((a) => a.area_id === room.area_id);
    const unplaced = devices.filter((d) => d.placed === "none").length;
    return html`<div class="info-group">
      <div class="info-group-title">
        ${localize("canvas.areaDevices.title", {
          area: area?.name ?? room.area_id,
        })}
      </div>
      ${
        devices.length === 0
          ? html`<div class="info-row">
              <span class="grow info-sub"
                >${localize("canvas.areaDevices.none")}</span
              >
            </div>`
          : devices.map(
              (d) =>
                html`<label
                  class="info-row device-row ${d.placed === "elsewhere" ? "disabled" : ""}"
                  title=${
                    d.placed === "elsewhere"
                      ? localize("canvas.areaDevices.elsewhere", {
                          where: d.where ?? "",
                        })
                      : d.name
                  }
                >
                  <ha-icon icon=${d.icon}></ha-icon>
                  <span class="grow device-name"
                    >${d.name}${
                      d.placed === "elsewhere"
                        ? html`<span class="info-sub"> · ${d.where}</span>`
                        : nothing
                    }</span
                  >
                  <input
                    type="checkbox"
                    .checked=${d.placed === "here"}
                    ?disabled=${d.placed === "elsewhere"}
                    @change=${(e: Event) =>
                      this._fire("room-device-toggle", {
                        deviceId: d.deviceId,
                        on: (e.target as HTMLInputElement).checked,
                      })}
                  />
                </label>`,
            )
      }
      ${
        unplaced > 1
          ? this._actionRow(
              "mdi:checkbox-multiple-marked-outline",
              localize("canvas.areaDevices.addAll", { count: unplaced }),
              () => this._fire("room-devices-add-all"),
            )
          : nothing
      }
    </div>`;
  }

  /** A list of linked things as removable chips, plus a dropdown adding
   * another. */
  private _renderLinks(
    icon: string,
    label: string,
    linked: { id: string; label: string }[],
    options: { id: string; label: string }[],
    onChange: (ids: string[]) => void,
  ) {
    const ids = linked.map((l) => l.id);
    const remaining = options
      .filter((o) => !ids.includes(o.id))
      .map((o) => ({
        value: o.id,
        label: o.label,
        ...(o.label !== o.id ? { secondary: o.id } : {}),
      }));
    return html`
      ${this._fieldRow(
        icon,
        label,
        html`<search-select
          class="link-search"
          addMode
          placeholder=${localize("canvas.links.add")}
          .options=${remaining}
          @value-changed=${(e: CustomEvent<{ value: string | null }>) => {
            if (e.detail.value) onChange([...ids, e.detail.value]);
          }}
        ></search-select>`,
      )}
      ${
        linked.length
          ? html`<div class="link-chips">
              ${linked.map(
                (l) =>
                  html`<span class="link-chip"
                    ><span>${l.label}</span
                    ><button
                      title=${localize("canvas.links.remove")}
                      @click=${() => onChange(ids.filter((id) => id !== l.id))}
                    >
                      <ha-icon icon="mdi:close"></ha-icon></button
                  ></span>`,
              )}
            </div>`
          : nothing
      }
    `;
  }

  /** The selected room's lights: live status, on/off, and what it follows
   * besides its own area. */
  private _renderRoomLights(room: Room) {
    const light = this.selectedRoomLight;
    const areaName = (id: string) =>
      this.allAreas.find((a) => a.area_id === id)?.name ?? id;
    const lightName = (id: string) =>
      this.lightEntities.find((l) => l.entity_id === id)?.name ?? id;
    const roomName = (id: string) =>
      this.rooms.find((r) => r.id === id)?.name ?? id;
    return html`<div class="info-group">
      <div class="info-group-title">${localize("canvas.lights.title")}</div>
      ${this._fieldRow(
        light && light.on > 0 ? "mdi:lightbulb-on" : "mdi:lightbulb-outline",
        light
          ? localize("canvas.lights.count", {
              on: light.on,
              total: light.entityIds.length,
            })
          : localize("canvas.lights.none"),
        light
          ? html`<span class="light-buttons">
              <button
                @click=${() => this._fire("room-lights-command", { on: true })}
              >
                ${localize("canvas.lights.on")}
              </button>
              <button
                @click=${() => this._fire("room-lights-command", { on: false })}
              >
                ${localize("canvas.lights.off")}
              </button>
            </span>`
          : nothing,
      )}
      ${this._renderLinks(
        "mdi:link-variant",
        localize("canvas.links.areas"),
        (room.linked_area_ids ?? []).map((id) => ({
          id,
          label: areaName(id),
        })),
        this.allAreas
          .filter((a) => a.area_id !== room.area_id)
          .map((a) => ({ id: a.area_id, label: a.name })),
        (ids) => this._fire("room-links-change", { linked_area_ids: ids }),
      )}
      ${this._renderLinks(
        "mdi:vector-link",
        localize("canvas.links.rooms"),
        (room.linked_room_ids ?? []).map((id) => ({
          id,
          label: roomName(id),
        })),
        this.rooms
          .filter((r) => r.id !== room.id)
          .map((r) => ({ id: r.id, label: r.name })),
        (ids) => this._fire("room-links-change", { linked_room_ids: ids }),
      )}
      ${this._renderLinks(
        "mdi:lightbulb-multiple-outline",
        localize("canvas.links.lights"),
        (room.light_entity_ids ?? []).map((id) => ({
          id,
          label: lightName(id),
        })),
        this.lightEntities.map((l) => ({ id: l.entity_id, label: l.name })),
        (ids) => this._fire("room-links-change", { light_entity_ids: ids }),
      )}
      ${
        light || (room.excluded_light_ids ?? []).length
          ? this._renderLinks(
              "mdi:lightbulb-off-outline",
              localize("canvas.links.exclude"),
              (room.excluded_light_ids ?? []).map((id) => ({
                id,
                label: lightName(id),
              })),
              (light?.entityIds ?? []).map((id) => ({
                id,
                label: lightName(id),
              })),
              (ids) =>
                this._fire("room-links-change", { excluded_light_ids: ids }),
            )
          : nothing
      }
    </div>`;
  }

  /** The entity an item stands for: picker, live state and a toggle. */
  private _renderItemEntity(item: FurnitureItem) {
    const live = this.selectedItemState;
    const byDomain = LINKABLE_DOMAINS.map((domain) => ({
      domain,
      entities: this.linkableEntities.filter((e) =>
        e.entity_id.startsWith(`${domain}.`),
      ),
    })).filter((g) => g.entities.length > 0);
    return html`<div class="info-group">
      <div class="info-group-title">${localize("furniture.entityTitle")}</div>
      ${this._fieldRow(
        "mdi:link-variant",
        localize("furniture.entity"),
        html`<search-select
          class="link-search"
          .options=${byDomain.flatMap((g) =>
            g.entities.map((e) => ({
              value: e.entity_id,
              label: e.name,
              group: g.domain,
              secondary: e.entity_id,
            })),
          )}
          .value=${item.entity_id ?? null}
          .noneLabel=${localize("furniture.noEntity")}
          placeholder=${localize("furniture.searchEntity")}
          @value-changed=${(e: CustomEvent<{ value: string | null }>) =>
            this._fire("furniture-change", {
              patch: { entity_id: e.detail.value },
            })}
        ></search-select>`,
      )}
      ${
        item.entity_id && live
          ? this._fieldRow(
              live.active ? "mdi:lightbulb-on" : "mdi:circle-outline",
              live.text,
              isToggleable(item.entity_id)
                ? html`<span class="light-buttons"
                    ><button
                      @click=${() => this._fire("furniture-entity-toggle")}
                    >
                      ${localize("furniture.toggle")}
                    </button></span
                  >`
                : nothing,
            )
          : nothing
      }
    </div>`;
  }

  /** A drawn shape's corner rounding: all at once, then each corner (up
   * to eight; the rest follow "All corners"), 0 % square to 100 % as
   * round as the shorter side allows. */
  private _renderCorners(item: FurnitureItem) {
    const entry = catalogItem(item.kind);
    if (!entry || !isShapeKind(item.kind)) return nothing;
    const count = shapeCornerCount(entry.draw, entry.opts, item.points);
    if (count === 0) return nothing;
    const fallback = defaultCornerPct(item.width_cm, item.depth_cm);
    const values = Array.from(
      { length: count },
      (_, i) => item.corners?.[i] ?? fallback,
    );
    const all = values.every((v) => v === values[0]) ? values[0]! : null;
    const change = (corners: number[] | null) =>
      this._fire("furniture-change", { patch: { corners } });
    const names =
      entry.draw === "shapeRect" && !item.points
        ? ["topLeft", "topRight", "bottomRight", "bottomLeft"]
        : null;
    const slider = (value: number, onInput: (v: number) => void) =>
      html`<input
        type="range"
        class="stroke-range"
        min="0"
        max="100"
        step="1"
        style="--pct:${value}%"
        .value=${String(value)}
        @input=${(e: Event) =>
          onInput(Number((e.target as HTMLInputElement).value))}
      />`;
    return html`<div class="info-group">
      <div class="info-group-title">${localize("furniture.corners")}</div>
      ${this._fieldRow(
        "mdi:rounded-corner",
        all === null
          ? localize("furniture.allCornersMixed")
          : localize("furniture.allCorners", { pct: all }),
        slider(all ?? fallback, (v) => change(Array(count).fill(v))),
      )}
      ${
        count <= 8
          ? values.map((v, i) =>
              this._fieldRow(
                "mdi:vector-square",
                names
                  ? localize(`furniture.corner.${names[i]}`, { pct: v })
                  : localize("furniture.cornerN", { n: i + 1, pct: v }),
                slider(v, (next) =>
                  change(values.map((old, j) => (j === i ? next : old))),
                ),
              ),
            )
          : nothing
      }
      ${
        item.corners
          ? this._actionRow(
              "mdi:restore",
              localize("furniture.resetCorners"),
              () => change(null),
            )
          : nothing
      }
    </div>`;
  }

  private _renderFurnitureCard(item: FurnitureItem) {
    const entry = catalogItem(item.kind);
    const unit =
      this._furnitureSizeUnit ?? defaultSmallSubUnit(this.unitSystem);
    const change = (patch: Partial<FurnitureItem>) =>
      this._fire("furniture-change", { patch });
    const sizeInput = (key: "width_cm" | "depth_cm") =>
      html`<input
        type="number"
        class="furniture-size"
        min="0"
        step=${unit === "cm" || unit === "in" ? "1" : "0.01"}
        .value=${formatSmallAs(item[key], unit)}
        @change=${(e: Event) => {
          const cm = parseSmallAs((e.target as HTMLInputElement).value, unit);
          if (cm !== null && Number.isFinite(cm) && cm >= 1) {
            change({ [key]: Math.round(cm * 10) / 10 });
          }
        }}
      />`;
    const toggle = (
      icon: string,
      label: string,
      key: "fill" | "solid" | "show_label" | "mirrored" | "locked",
    ) =>
      this._fieldRow(
        icon,
        label,
        html`<input
          type="checkbox"
          class="switch"
          role="switch"
          .checked=${!!item[key]}
          @change=${(e: Event) =>
            change({ [key]: (e.target as HTMLInputElement).checked })}
        />`,
      );
    return this._card({
      title: item.label || entry?.name || item.kind,
      subtitle: entry
        ? localize(`furniture.category.${entry.category}`)
        : localize("canvas.card.furniture"),
      onClose: this._clearSelection,
      body: html`
        <div class="info-group">
          ${this._fieldRow(
            "mdi:pencil",
            localize("canvas.card.name"),
            html`<input
              type="text"
              class="text-field"
              placeholder=${entry?.name ?? ""}
              .value=${item.label ?? ""}
              @change=${(e: Event) =>
                change({
                  label: (e.target as HTMLInputElement).value.trim() || null,
                })}
            />`,
          )}
          ${toggle("mdi:format-text", localize("furniture.showLabel"), "show_label")}
          ${this._fieldRow(
            "mdi:arrow-expand-horizontal",
            localize("furniture.width", { unit }),
            html`<span class="inline-pair"
              >${sizeInput("width_cm")}${this._unitSelect(
                unit,
                (u) => (this._furnitureSizeUnit = u),
              )}</span
            >`,
          )}
          ${this._fieldRow(
            "mdi:arrow-expand-vertical",
            localize("furniture.depth", { unit }),
            sizeInput("depth_cm"),
          )}
          ${
            this.floorCalibrated
              ? nothing
              : html`<div class="info-row">
                  <span class="grow info-sub"
                    >${localize("furniture.calibrate")}</span
                  >
                </div>`
          }
          ${this._fieldRow(
            "mdi:rotate-right",
            localize("furniture.rotation"),
            html`<span class="inline-pair">
              <input
                type="number"
                class="furniture-size"
                step="1"
                .value=${String(Math.round(item.rotation_deg * 10) / 10)}
                @change=${(e: Event) => {
                  const deg = Number((e.target as HTMLInputElement).value);
                  if (Number.isFinite(deg))
                    change({ rotation_deg: ((deg % 360) + 360) % 360 });
                }}
              />
              <span class="icon-buttons">
                <button
                  title=${localize("furniture.rotateLeft")}
                  @click=${() =>
                    change({
                      rotation_deg: (item.rotation_deg + 270) % 360,
                    })}
                >
                  <ha-icon icon="mdi:rotate-left"></ha-icon>
                </button>
                <button
                  title=${localize("furniture.rotateRight")}
                  @click=${() =>
                    change({ rotation_deg: (item.rotation_deg + 90) % 360 })}
                >
                  <ha-icon icon="mdi:rotate-right"></ha-icon>
                </button>
              </span>
            </span>`,
          )}
        </div>
        <div class="info-group">
          <div class="info-group-title">${localize("canvas.card.style")}</div>
          ${this._fieldRow(
            "mdi:opacity",
            localize("furniture.opacity", {
              pct: Math.round((item.opacity ?? 1) * 100),
            }),
            html`<input
              type="range"
              class="stroke-range"
              min="0.1"
              max="1"
              step="0.05"
              style="--pct:${(((item.opacity ?? 1) - 0.1) / 0.9) * 100}%"
              .value=${String(item.opacity ?? 1)}
              @input=${(e: Event) =>
                change({
                  opacity: Number((e.target as HTMLInputElement).value),
                })}
            />`,
          )}
          ${this._fieldRow(
            "mdi:format-line-weight",
            localize("furniture.lineThickness", {
              px: item.stroke_width.toFixed(1),
            }),
            html`<input
              type="range"
              class="stroke-range"
              min="0.5"
              max="6"
              step="0.25"
              style="--pct:${((item.stroke_width - 0.5) / 5.5) * 100}%"
              .value=${String(item.stroke_width)}
              @input=${(e: Event) =>
                change({
                  stroke_width: Number((e.target as HTMLInputElement).value),
                })}
            />`,
          )}
          ${this._fieldRow(
            "mdi:palette",
            localize("canvas.card.colour"),
            html`<span class="inline-pair">
              ${
                item.color
                  ? html`<button
                      class="color-reset"
                      @click=${() => change({ color: null })}
                    >
                      ${localize("canvas.card.colourDefault")}
                    </button>`
                  : nothing
              }
              <input
                type="color"
                class="room-fill-color"
                .value=${item.color ?? "#607d8b"}
                @input=${(e: Event) =>
                  change({ color: (e.target as HTMLInputElement).value })}
              />
            </span>`,
          )}
          ${toggle("mdi:format-color-fill", localize("furniture.fill"), "fill")}
          ${toggle("mdi:layers-outline", localize("furniture.solid"), "solid")}
          ${toggle("mdi:flip-horizontal", localize("furniture.mirror"), "mirrored")}
          ${toggle("mdi:lock-outline", localize("furniture.lock"), "locked")}
        </div>
        ${this._renderCorners(item)} ${this._renderItemEntity(item)}
        <div class="info-group">
          ${this._actionRow(
            "mdi:content-copy",
            localize("furniture.duplicate"),
            () => this._fire("furniture-duplicate-click"),
          )}
          ${this._actionRow(
            "mdi:arrange-bring-to-front",
            localize("furniture.toFront"),
            () => this._fire("furniture-order-click", { front: true }),
          )}
          ${this._actionRow(
            "mdi:arrange-bring-forward",
            localize("furniture.forward"),
            () =>
              this._fire("furniture-order-click", { front: true, step: true }),
          )}
          ${this._actionRow(
            "mdi:arrange-send-backward",
            localize("furniture.backward"),
            () =>
              this._fire("furniture-order-click", { front: false, step: true }),
          )}
          ${this._actionRow(
            "mdi:arrange-send-to-back",
            localize("furniture.toBack"),
            () => this._fire("furniture-order-click", { front: false }),
          )}
        </div>
      `,
      footer: this._deleteButton(
        localize("furniture.delete"),
        "furniture-delete-click",
      ),
    });
  }

  private _renderAlignBar() {
    if (!this.alignTargetFloorId) {
      return html`<div class="hint-bar floating-panel">
        <span class="hint">${localize("canvas.hint.alignAgainst")}</span>
        <select
          @change=${(e: Event) =>
            this._fire("align-target-change", {
              floorId: (e.target as HTMLSelectElement).value,
            })}
        >
          <option value="" selected>${localize("canvas.align.choose")}</option>
          ${this.otherFloors.map(
            (f) => html`<option value=${f.floor_id}>${f.name}</option>`,
          )}
        </select>
        <button @click=${() => this._fire("align-cancel-click")}>
          ${localize("canvas.button.cancel")}
        </button>
      </div>`;
    }
    if (!this.alignTargetHasBackground) {
      return html`<div class="hint-bar floating-panel">
        <span class="hint">${localize("canvas.hint.noBackground")}</span>
        <button
          @click=${() => this._fire("align-target-change", { floorId: null })}
        >
          ${localize("canvas.button.chooseAnother")}
        </button>
        <button @click=${() => this._fire("align-cancel-click")}>
          ${localize("canvas.button.cancel")}
        </button>
      </div>`;
    }
    return html`<div class="hint-bar floating-panel">
      <span class="hint">${localize("canvas.hint.alignDrag")}</span>
      <button
        title=${localize("canvas.align.shrink")}
        @click=${() => this._fire("align-scale-click", { factor: 0.995 })}
      >
        −
      </button>
      <button
        title=${localize("canvas.align.grow")}
        @click=${() => this._fire("align-scale-click", { factor: 1.0050251 })}
      >
        +
      </button>
      <button class="primary" @click=${() => this._fire("align-apply-click")}>
        ${localize("canvas.button.apply")}
      </button>
      <button @click=${() => this._fire("align-cancel-click")}>
        ${localize("canvas.button.cancel")}
      </button>
    </div>`;
  }

  /** Every HA area to link a room to: this floor's first, then each other
   * floor's, then areas on no floor. A linked area the list doesn't have
   * (deleted, or never in this list) still shows, so the dropdown never
   * claims "Custom" for a room that's linked. */
  private _renderAreaSelect(room: Room) {
    const here = this.areas.filter((a) => a.floor_id !== null);
    const hereIds = new Set(here.map((a) => a.area_id));
    const noFloor = this.allAreas.filter((a) => a.floor_id === null);
    const otherFloors = this.otherFloors
      .map((f) => ({
        floor: f,
        areas: this.allAreas.filter(
          (a) => a.floor_id === f.floor_id && !hereIds.has(a.area_id),
        ),
      }))
      .filter((g) => g.areas.length > 0);
    const known = room.area_id
      ? this.allAreas.some((a) => a.area_id === room.area_id)
      : true;
    return html`<select
      @change=${(e: Event) =>
        this._fire("room-area-change", {
          areaId: (e.target as HTMLSelectElement).value,
        })}
    >
      <option value="" ?selected=${!room.area_id}>
        ${localize("canvas.room.custom")}
      </option>
      ${
        !known
          ? html`<option value=${room.area_id} selected>
              ${localize("canvas.room.unknownArea", { id: room.area_id ?? "" })}
            </option>`
          : nothing
      }
      ${
        here.length
          ? html`<optgroup label=${localize("canvas.room.thisFloor")}>
              ${this._areaOptions(here, room.area_id)}
            </optgroup>`
          : nothing
      }
      ${otherFloors.map(
        (g) =>
          html`<optgroup label=${g.floor.name}>
            ${this._areaOptions(g.areas, room.area_id)}
          </optgroup>`,
      )}
      ${
        noFloor.length
          ? html`<optgroup label=${localize("canvas.room.outdoor")}>
              ${this._areaOptions(noFloor, room.area_id)}
            </optgroup>`
          : nothing
      }
    </select>`;
  }

  private _areaOptions(areas: AreaMeta[], selectedAreaId: string | null) {
    return areas.map(
      (a) =>
        html`<option
          value=${a.area_id}
          ?selected=${a.area_id === selectedAreaId}
        >
          ${a.name}
        </option>`,
    );
  }

  @state() private _cardCollapsed = false;
  private _card = (opts: Parameters<typeof renderCard>[0]) =>
    renderCard({
      ...opts,
      collapsed: this._cardCollapsed,
      onToggle: () => (this._cardCollapsed = !this._cardCollapsed),
    });
  private _actionRow = actionRow;
  private _fieldRow = fieldRow;
  private _selectWrap = selectWrap;
  private _deleteButton(label: string, event: string) {
    return deleteButton(label, () => this._fire(event));
  }

  private _clearSelection = () => this._fire("selection-clear");

  /** Colour choice from HA's standard palette (see color-palette.ts), as a
   * dropdown that expands inline; "Custom" keeps the native picker for any
   * other colour. Stores the resolved #rrggbb. */
  private _renderColourPicker(room: Room) {
    const palette = HA_COLORS.map((c) => ({
      ...c,
      label: localize(`colors.${c.key.replace(/-/g, "_")}`),
      hex: resolveColorHex(this, c),
    }));
    const current = (room.fill_color ?? "").toLowerCase();
    const match = palette.find((c) => c.hex.toLowerCase() === current);
    const swatchHex = room.fill_color ?? DEFAULT_ROOM_FILL_COLOR;
    const name = !room.fill_color
      ? localize("canvas.card.colourDefault")
      : (match?.label ?? localize("canvas.card.colourCustom"));
    const pick = (color: string) => {
      this._colorOpen = false;
      this._fire("room-fill-color-change", { color });
    };
    return html`
      <div class="info-row">
        <ha-icon icon="mdi:palette"></ha-icon>
        <span class="grow">${localize("canvas.card.colour")}</span>
        <button
          class="color-field"
          aria-expanded=${this._colorOpen ? "true" : "false"}
          @click=${() => (this._colorOpen = !this._colorOpen)}
        >
          <span class="swatch" style="background:${swatchHex}"></span>
          <span class="color-name">${name}</span>
          <ha-icon
            icon=${this._colorOpen ? "mdi:menu-up" : "mdi:menu-down"}
          ></ha-icon>
        </button>
      </div>
      ${
        this._colorOpen
          ? html`<div class="color-list">
              ${palette.map(
                (c) =>
                  html`<button
                    class="color-item ${c.hex.toLowerCase() === current ? "selected" : ""}"
                    @click=${() => pick(c.hex)}
                  >
                    <span class="swatch" style="background:${c.hex}"></span>
                    <span class="grow">${c.label}</span>
                    ${
                      c.hex.toLowerCase() === current
                        ? html`<ha-icon icon="mdi:check"></ha-icon>`
                        : nothing
                    }
                  </button>`,
              )}
              <label class="color-item custom">
                <span class="swatch custom-swatch"></span>
                <span class="grow"
                  >${localize("canvas.card.colourCustom")}</span
                >
                <input
                  type="color"
                  class="room-fill-color"
                  .value=${swatchHex}
                  @input=${(e: Event) =>
                    this._fire("room-fill-color-change", {
                      color: (e.target as HTMLInputElement).value,
                    })}
                />
              </label>
            </div>`
          : nothing
      }
    `;
  }

  /** The selected device's connections in the active network layer. Null
   * with no layer on. */
  private _renderDeviceNetwork(pin: Pin) {
    if (!this.networkLabel) return nothing;
    return networkGroup(this.networkLabel, [
      ...this.meshLinks
        .filter((l) => l.fromPin.id === pin.id || l.toPin.id === pin.id)
        .map((l) => ({
          name: this._pinLabel(l.fromPin.id === pin.id ? l.toPin : l.fromPin),
          where: "",
          quality: l.quality,
          detail: l.detail ?? l.quality,
        })),
      ...this.meshStubs
        .filter((st) => st.fromPin.id === pin.id)
        .map((st) => ({
          name: st.targetLabel,
          where: st.targetFloorName,
          quality: st.quality,
          detail: st.detail ?? st.quality,
        })),
    ]);
  }

  private _renderSelectionPanel() {
    if (this.selectedRoom) {
      const room = this.selectedRoom;
      const visible = room.visible !== false;
      const area = this.areas.find((a) => a.area_id === room.area_id);
      return this._card({
        title: room.name,
        subtitle: area ? area.name : localize("canvas.card.room"),
        onClose: this._clearSelection,
        body: html`
          <div class="info-group">
            ${this._fieldRow(
              "mdi:floor-plan",
              localize("canvas.card.area"),
              this._selectWrap(this._renderAreaSelect(room)),
            )}
            ${this._fieldRow(
              "mdi:pencil",
              localize("canvas.card.name"),
              html`<input
                type="text"
                class="text-field"
                .value=${room.name}
                @change=${(e: Event) => {
                  const input = e.target as HTMLInputElement;
                  const name = input.value.trim();
                  if (name) this._fire("room-name-change", { name });
                  else input.value = room.name;
                }}
              />`,
            )}
            ${this._actionRow(
              "mdi:vector-polygon",
              this.editingRoom
                ? localize("canvas.room.doneEditing")
                : localize("canvas.room.editVertices"),
              () => this._fire("room-edit-vertices-click"),
              this.editingRoom,
            )}
            ${this._fieldRow(
              "mdi:home-export-outline",
              localize("canvas.room.outdoorSpace"),
              html`<input
                type="checkbox"
                class="switch"
                role="switch"
                title=${localize("canvas.room.outdoorHint")}
                .checked=${!!room.outdoor}
                @change=${(e: Event) =>
                  this._fire("room-outdoor-change", {
                    outdoor: (e.target as HTMLInputElement).checked,
                  })}
              />`,
            )}
            ${this._fieldRow(
              "mdi:eye",
              localize("canvas.card.visible"),
              html`<input
                type="checkbox"
                class="switch"
                role="switch"
                .checked=${visible}
                @change=${() => this._fire("room-visible-toggle")}
              />`,
            )}
          </div>
          ${this._renderRoomLabel(room)} ${this._renderAreaDevices(room)}
          ${this._renderRoomLights(room)}
          <div class="info-group">
            <div class="info-group-title">${localize("canvas.card.style")}</div>
            ${this._renderColourPicker(room)}
            ${this._fieldRow(
              "mdi:opacity",
              localize("canvas.room.fillOpacity", {
                pct: Math.round(
                  (room.fill_opacity ?? DEFAULT_ROOM_FILL_OPACITY) * 100,
                ),
              }),
              html`<input
                type="range"
                class="room-opacity"
                min="0"
                max="1"
                step="0.02"
                style="--pct:${(room.fill_opacity ?? DEFAULT_ROOM_FILL_OPACITY) * 100}%"
                .value=${String(room.fill_opacity ?? DEFAULT_ROOM_FILL_OPACITY)}
                @input=${(e: Event) =>
                  this._fire("room-fill-opacity-change", {
                    opacity: Number((e.target as HTMLInputElement).value),
                  })}
              />`,
            )}
            ${this._fieldRow(
              "mdi:square-outline",
              localize("canvas.room.borderOpacity", {
                pct: Math.round(
                  (room.border_opacity ?? DEFAULT_ROOM_BORDER_OPACITY) * 100,
                ),
              }),
              html`<input
                type="range"
                class="room-opacity"
                min="0"
                max="1"
                step="0.02"
                style="--pct:${(room.border_opacity ?? DEFAULT_ROOM_BORDER_OPACITY) * 100}%"
                .value=${String(room.border_opacity ?? DEFAULT_ROOM_BORDER_OPACITY)}
                @input=${(e: Event) =>
                  this._fire("room-border-opacity-change", {
                    opacity: Number((e.target as HTMLInputElement).value),
                  })}
              />`,
            )}
          </div>
        `,
        footer: this._deleteButton(
          localize("canvas.room.delete"),
          "room-delete-click",
        ),
      });
    }
    if (this.selectedPin) {
      const pin = this.selectedPin;
      return this._card({
        title: this._pinLabel(pin),
        subtitle: localize("canvas.card.device"),
        onClose: this._clearSelection,
        body: html`<div class="info-group">
            ${this._fieldRow(
              "mdi:tag-text",
              localize("canvas.card.label"),
              html`<input
                type="text"
                class="text-field"
                placeholder=${pinDisplayLabel(pin.device_id, this.entityLookup.values())}
                .value=${pin.label_override ?? ""}
                @change=${(e: Event) =>
                  this._fire("pin-label-change", {
                    label: (e.target as HTMLInputElement).value,
                  })}
              />`,
            )}
            <div class="info-row">
              <ha-icon icon="mdi:shape"></ha-icon>
              <span class="grow">${localize("canvas.pin.icon")}</span>
            </div>
            <div class="icon-choices">
              ${this.pinIconChoices.map(
                (icon) =>
                  html`<button
                    class="icon-choice ${pin.icon_override === icon ? "active" : ""}"
                    title=${icon.replace("mdi:", "")}
                    @click=${() => this._fire("pin-icon-quick", { icon })}
                  >
                    <ha-icon icon=${icon}></ha-icon>
                  </button>`,
              )}
              <button
                class="icon-choice more"
                title=${localize("canvas.pin.moreIcons")}
                @click=${() => this._fire("pin-set-icon-click")}
              >
                <ha-icon icon="mdi:dots-horizontal"></ha-icon>
              </button>
            </div>
            ${
              pin.icon_override
                ? this._actionRow(
                    "mdi:restore",
                    localize("canvas.pin.defaultIcon"),
                    () => this._fire("pin-icon-quick", { icon: null }),
                  )
                : nothing
            }
            ${this._fieldRow(
              "mdi:human-male-height",
              localize("canvas.card.height", {
                unit: this.unitSystem === "imperial" ? "ft" : "m",
              }),
              html`<input
                type="text"
                inputmode="decimal"
                class="text-field short"
                placeholder=${this.unitSystem === "imperial" ? "6" : "1.8"}
                .value=${pin.height_m === null ? "" : formatLarge(pin.height_m, this.unitSystem)}
                @change=${(e: Event) =>
                  this._fire("pin-height-change", {
                    value: (e.target as HTMLInputElement).value,
                  })}
              />`,
            )}
          </div>
          ${this._renderDeviceNetwork(pin)}`,
        footer: this._deleteButton(
          localize("canvas.pin.delete"),
          "pin-delete-click",
        ),
      });
    }
    if (this.selectedWall) {
      const wall = this.selectedWall;
      const wallUnit =
        this._wallThicknessUnit ?? defaultSmallSubUnit(this.unitSystem);
      const wallAttrs = this._thicknessInputAttrs(wallUnit);
      return this._card({
        title: localize("canvas.card.wall"),
        subtitle: (() => {
          const m = WALL_MATERIALS.find((x) => x.id === wall.material);
          return m ? materialLabel(m) : undefined;
        })(),
        onClose: this._clearSelection,
        body: html`<div class="info-group">
          ${this._fieldRow(
            "mdi:wall",
            localize("canvas.wall.material"),
            this._selectWrap(
              html`<select
                @change=${(e: Event) =>
                  this._fire("wall-material-change", {
                    material: (e.target as HTMLSelectElement).value,
                  })}
              >
                ${WALL_MATERIALS.map(
                  (m) =>
                    html`<option
                      value=${m.id}
                      ?selected=${m.id === wall.material}
                    >
                      ${materialLabel(m)}
                    </option>`,
                )}
              </select>`,
            ),
          )}
          ${this._fieldRow(
            "mdi:arrow-expand-horizontal",
            localize("canvas.wall.thickness", { unit: wallUnit }),
            html`<span class="inline-pair"
              ><input
                type="number"
                class="wall-thickness"
                min=${wallAttrs.min}
                max=${wallAttrs.max}
                step=${wallAttrs.step}
                .value=${formatSmallAs(wallThicknessCm(wall), wallUnit)}
                @change=${(e: Event) => {
                  const cm = parseSmallAs(
                    (e.target as HTMLInputElement).value,
                    wallUnit,
                  );
                  if (cm === null || !Number.isFinite(cm) || cm <= 0) return;
                  this._fire("wall-thickness-change", { thicknessCm: cm });
                }}
              />${this._unitSelect(
                wallUnit,
                (unit) => (this._wallThicknessUnit = unit),
              )}</span
            >`,
          )}
          ${this._actionRow(
            "mdi:vector-polygon",
            this.editingWall
              ? localize("canvas.room.doneEditing")
              : localize("canvas.room.editVertices"),
            () => this._fire("wall-edit-vertices-click"),
            this.editingWall,
          )}
        </div>`,
        footer: this._deleteButton(
          localize("canvas.wall.delete"),
          "wall-delete-click",
        ),
      });
    }
    if (this.selectedOpening) {
      const opening = this.selectedOpening;
      const openingUnit =
        this._openingWidthUnit ?? defaultSmallSubUnit(this.unitSystem);
      const openingAttrs = this._thicknessInputAttrs(openingUnit);
      const unitsPerMeter = this.unitsPerMeter;
      return this._card({
        title: localize(`canvas.openingLabel.${opening.type}`),
        subtitle: localize("canvas.card.wallOpening"),
        onClose: this._clearSelection,
        body: html`<div class="info-group">
          ${this._fieldRow(
            "mdi:arrow-expand-horizontal",
            localize("canvas.opening.width", {
              unit:
                unitsPerMeter !== null
                  ? openingUnit
                  : localize("canvas.opening.storedUnits"),
            }),
            html`<span class="inline-pair"
              ><input
                type="number"
                class="wall-thickness"
                min=${unitsPerMeter !== null ? openingAttrs.min : "1"}
                step=${unitsPerMeter !== null ? openingAttrs.step : "1"}
                .value=${
                  unitsPerMeter !== null
                    ? canvasUnitsToDisplayAs(
                        opening.width,
                        unitsPerMeter,
                        openingUnit,
                      )
                    : String(opening.width)
                }
                @change=${(e: Event) => {
                  const raw = (e.target as HTMLInputElement).value;
                  const width =
                    unitsPerMeter !== null
                      ? displayToCanvasUnitsAs(raw, unitsPerMeter, openingUnit)
                      : Number(raw);
                  if (width === null || !Number.isFinite(width) || width <= 0)
                    return;
                  this._fire("opening-width-change", { width });
                }}
              />${
                unitsPerMeter !== null
                  ? this._unitSelect(
                      openingUnit,
                      (unit) => (this._openingWidthUnit = unit),
                    )
                  : nothing
              }</span
            >`,
          )}
          ${
            unitsPerMeter === null
              ? html`<div class="info-row">
                  <span class="grow info-sub"
                    >${localize("canvas.opening.calibrate")}</span
                  >
                </div>`
              : nothing
          }
          ${this._renderCoverPickers(opening)}
          ${this._renderOpeningDaylight(opening)}
          ${
            opening.cover_entity_id || opening.cover_right_entity_id
              ? this._fieldRow(
                  "mdi:weather-sunny",
                  localize("canvas.opening.coverState"),
                  html`<span>${this._coverStateText(opening)}</span>`,
                )
              : nothing
          }
        </div>`,
        footer: this._deleteButton(
          localize("canvas.opening.delete"),
          "opening-delete-click",
        ),
      });
    }
    if (this.selectedFurniture) {
      return this._renderFurnitureCard(this.selectedFurniture);
    }
    if (this.selectedMeshLink) {
      const link = this.selectedMeshLink;
      return this._card({
        title: `${this._pinLabel(link.fromPin)} → ${this._pinLabel(link.toPin)}`,
        subtitle: localize("canvas.card.link"),
        onClose: this._clearSelection,
        body: html`<div class="info-group">
          ${this._fieldRow(
            "mdi:signal",
            localize("canvas.card.quality"),
            html`<span style="color:${qualityColor(link.quality)}"
              >${link.detail ?? link.quality}</span
            >`,
          )}
        </div>`,
      });
    }
    if (this.selectedMeshStub) {
      const stub = this.selectedMeshStub;
      return this._card({
        title: `${this._pinLabel(stub.fromPin)} → ${stub.targetLabel}`,
        subtitle: stub.targetFloorName,
        onClose: this._clearSelection,
        body: html`<div class="info-group">
          ${this._fieldRow(
            "mdi:signal",
            localize("canvas.card.quality"),
            html`<span style="color:${qualityColor(stub.quality)}"
              >${stub.detail ?? stub.quality}</span
            >`,
          )}
          ${this._actionRow(
            "mdi:arrow-right-circle",
            localize("canvas.meshStub.goToFloor"),
            () => this._fire("mesh-stub-goto-floor-click"),
          )}
        </div>`,
      });
    }
    return nothing;
  }

  private _pinLabel(pin: Pin): string {
    if (pin.label_override) return pin.label_override;
    return pinDisplayLabel(pin.device_id, this.entityLookup.values());
  }

  private _renderPinStack() {
    if (!this.pinStack) return nothing;
    const stack = this.pinStack;
    return this._card({
      title: localize("canvas.pin.stackTitle", { count: stack.length }),
      onClose: () => this._fire("pin-stack-dismiss"),
      body: html`<div class="info-group">
        ${stack.map(
          (pin) => html`
            <div class="info-row stack-row">
              <button
                class="stack-choose"
                @click=${() => this._fire("pin-stack-choose", { pinId: pin.id })}
              >
                ${this._pinLabel(pin)}
              </button>
              <button
                class="stack-remove"
                title=${localize("canvas.pin.removeFromSpot")}
                @click=${() =>
                  this._fire("pin-stack-remove-click", { pinId: pin.id })}
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </button>
            </div>
          `,
        )}
      </div>`,
    });
  }

  override render() {
    return html`
      <div class="tool-row">
        ${this._renderModeToolbar()} ${this._renderHintBar()}
        <slot name="row-end"></slot>
        <row-actions
          .dirty=${this.dirty}
          .saving=${this.saving}
          .canUndo=${this.canUndo}
          .canRedo=${this.canRedo}
        ></row-actions>
      </div>
      ${this.meshLegend ? renderMeshLegend() : nothing}
      ${this.pinStack ? this._renderPinStack() : this._renderSelectionPanel()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "canvas-overlay": CanvasOverlay;
  }
}
