import { LitElement, html, css, svg, nothing, unsafeCSS } from "lit";
import { property, state } from "lit/decorators.js";
import { safeCustomElement } from "../define";
import {
  customCatalog,
  FURNITURE_CATALOG,
  FURNITURE_CATEGORIES,
  setCustomIcons,
  type CatalogItem,
  type FurnitureCategory,
} from "../canvas/furniture-catalog";
import {
  cleanSvg,
  MAX_CUSTOM_ICONS,
  MAX_SVG_LENGTH,
  newCustomIconId,
  type CustomIcon,
} from "../canvas/custom-icons";
import {
  drawItem,
  FURNITURE_STYLES,
  renderPrims,
} from "../canvas/furniture-draw";
import type { UnitSystem } from "../types";
import { localize } from "../i18n";
import { sharedStyles } from "../styles";

/** The furniture & household item library: pick an item to arm it, then
 * click the plan to place it (see floorplan-canvas.ts's "furniture" mode).
 * Imported SVG icons live under "My icons". Fires "furniture-armed"
 * { kind }, "library-close", and "settings-change" { custom_icons } when
 * icons are imported, removed or switched to their own colours. */
@safeCustomElement("furniture-library-sidebar")
export class FurnitureLibrarySidebar extends LitElement {
  static override styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: var(--sc-picker-width, 300px);
        min-width: 240px;
        border-left: 1px solid var(--sc-divider);
        background: var(--sc-panel-bg);
        height: 100%;
        overflow: hidden;
      }
      @media (max-width: 700px) {
        :host {
          flex: 0 0 45%;
          width: 100%;
          min-width: 0;
          height: auto;
          border-left: none;
          border-top: 1px solid var(--sc-divider);
        }
      }
      .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 8px 0 16px;
      }
      .title {
        font-size: var(--sc-fs-title);
      }
      .close {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        padding: 0;
        border-radius: 50%;
      }
      .search {
        padding: 10px 12px 6px;
      }
      .search-box {
        display: flex;
        align-items: center;
        gap: 8px;
        height: var(--sc-h-control);
        padding: 0 12px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        background: var(--sc-bg);
      }
      .search-box:focus-within {
        border-color: var(--sc-accent);
      }
      .search-box ha-icon {
        --mdc-icon-size: 18px;
        color: var(--sc-fg-secondary);
      }
      .search-box input {
        flex: 1;
        min-width: 0;
        border: none;
        outline: none;
        background: transparent;
        color: var(--sc-fg);
        font: inherit;
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        padding: 0 12px 8px;
      }
      .chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 28px;
        padding: 0 10px;
        border: 1px solid var(--sc-divider);
        border-radius: 14px;
        font-size: var(--sc-fs-small, 12px);
        color: var(--sc-fg-secondary);
      }
      .chip ha-icon {
        --mdc-icon-size: 16px;
      }
      .chip.active {
        border-color: var(--sc-accent);
        color: var(--sc-accent);
        background: color-mix(in srgb, var(--sc-accent) 10%, transparent);
      }
      .head-actions {
        display: flex;
        align-items: center;
        gap: 2px;
      }
      .import-file {
        display: none;
      }
      .notice {
        margin: 0 12px 8px;
        font-size: 12px;
        color: var(--sc-fg-secondary);
      }
      .notice.error {
        color: var(--error-color, #db4437);
      }
      .import-button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        margin: 0 12px 8px;
        height: var(--sc-h-control);
        padding: 0 12px;
        border: 1px dashed var(--sc-divider);
        border-radius: var(--sc-r-control);
        color: var(--sc-fg);
        font: inherit;
        font-size: 13px;
      }
      .import-button:hover {
        border-color: var(--sc-accent);
        color: var(--sc-accent);
      }
      .item-wrap {
        position: relative;
        display: flex;
      }
      .item-wrap .item {
        flex: 1;
        min-width: 0;
      }
      .item-tools {
        position: absolute;
        top: 3px;
        right: 3px;
        display: flex;
        gap: 2px;
      }
      .item-tools button {
        width: 24px;
        height: 24px;
        padding: 0;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--sc-bg) 85%, transparent);
        color: var(--sc-fg-secondary);
        --mdc-icon-size: 15px;
      }
      .item-tools button:hover {
        color: var(--sc-fg);
        background: var(--sc-hover);
      }
      .item-tools button.on {
        color: var(--sc-accent);
      }
      .grid {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(118px, 1fr));
        gap: 6px;
        padding: 0 12px 12px;
        align-content: start;
      }
      .item {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 2px;
        padding: 6px;
        border: 1px solid var(--sc-divider);
        border-radius: var(--sc-r-control);
        text-align: left;
        color: var(--sc-fg);
      }
      .item:hover {
        background: var(--sc-hover);
      }
      .item.armed {
        border-color: var(--sc-accent);
        box-shadow: inset 0 0 0 1px var(--sc-accent);
      }
      .item svg {
        width: 100%;
        height: 64px;
        color: var(--sc-fg);
        --fx-stroke-width: 1px;
      }
      .name {
        font-size: 12px;
        line-height: 1.25;
      }
      .size {
        font-size: 11px;
        color: var(--sc-fg-secondary);
      }
      .count {
        padding: 0 12px 6px;
        font-size: 11px;
        color: var(--sc-fg-secondary);
      }
      .empty {
        grid-column: 1 / -1;
        padding: 24px 0;
        text-align: center;
        color: var(--sc-fg-secondary);
      }
      ${unsafeCSS(FURNITURE_STYLES)}
    `,
  ];

  @property({ attribute: false }) armedKind: string | null = null;
  @property({ attribute: false }) unitSystem: UnitSystem = "metric";
  /** Settings.custom_icons — the imported SVGs. */
  @property({ attribute: false }) customIcons: CustomIcon[] = [];
  @state() private _query = "";
  @state() private _importError: string | null = null;
  @state() private _category: FurnitureCategory | null = null;

  private _fire(name: string, detail?: unknown) {
    this.dispatchEvent(
      new CustomEvent(name, { detail, bubbles: true, composed: true }),
    );
  }

  private _size(item: CatalogItem): string {
    if (this.unitSystem === "imperial") {
      const inch = (cm: number) => Math.round(cm / 2.54);
      return `${inch(item.w)}″ × ${inch(item.d)}″`;
    }
    return `${item.w} × ${item.d} cm`;
  }

  private get _items(): CatalogItem[] {
    const words = this._query.toLowerCase().split(/\s+/).filter(Boolean);
    return [...customCatalog(), ...FURNITURE_CATALOG].filter((item) => {
      if (this._category && item.category !== this._category) return false;
      if (words.length === 0) return true;
      const hay =
        `${item.name} ${localize(`furniture.category.${item.category}`)} ${item.id}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }

  override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("customIcons")) setCustomIcons(this.customIcons);
  }

  private _saveIcons(icons: CustomIcon[]) {
    this._fire("settings-change", { custom_icons: icons });
  }

  /** Each picked file, cleaned and sized (60 cm on its long side, its own
   * aspect ratio), added to "My icons". */
  private async _import(input: HTMLInputElement) {
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (files.length === 0) return;
    const added: CustomIcon[] = [];
    const failed: string[] = [];
    for (const file of files) {
      const text = file.size <= MAX_SVG_LENGTH ? await file.text() : "";
      const cleaned = text ? cleanSvg(text) : null;
      if (!cleaned) {
        failed.push(file.name);
        continue;
      }
      const a = cleaned.aspect;
      const long = 60;
      added.push({
        id: newCustomIconId(),
        name: file.name.replace(/\.svg$/i, "") || "Icon",
        svg: cleaned.svg,
        w: a >= 1 ? long : Math.max(5, Math.round(long * a)),
        d: a >= 1 ? Math.max(5, Math.round(long / a)) : long,
      });
    }
    this._importError = failed.length
      ? localize("furniture.importFailed", { names: failed.join(", ") })
      : null;
    if (added.length) {
      this._saveIcons(
        [...this.customIcons, ...added].slice(0, MAX_CUSTOM_ICONS),
      );
      this._category = "custom";
    }
  }

  private _iconOf(item: CatalogItem): CustomIcon | undefined {
    const id = item.opts["custom"];
    return item.category === "custom"
      ? this.customIcons.find((icon) => icon.id === id)
      : undefined;
  }

  private _renderItem(item: CatalogItem) {
    const button = html`<button
      class="item ${this.armedKind === item.id ? "armed" : ""}"
      title=${item.name}
      @click=${() =>
        this._fire("furniture-armed", {
          kind: this.armedKind === item.id ? null : item.id,
        })}
    >
      ${this._thumb(item)}
      <span class="name">${item.name}</span>
      <span class="size">${this._size(item)}</span>
    </button>`;
    const icon = this._iconOf(item);
    if (!icon) return button;
    return html`<div class="item-wrap">
      ${button}
      <div class="item-tools">
        <button
          class=${icon.colors ? "on" : ""}
          title=${localize("furniture.iconColors")}
          aria-pressed=${icon.colors ? "true" : "false"}
          @click=${() =>
            this._saveIcons(
              this.customIcons.map((i) =>
                i.id === icon.id ? { ...i, colors: !i.colors } : i,
              ),
            )}
        >
          <ha-icon icon="mdi:palette-outline"></ha-icon>
        </button>
        <button
          title=${localize("furniture.deleteIcon")}
          @click=${() => {
            if (
              !window.confirm(
                localize("furniture.deleteIconConfirm", { name: icon.name }),
              )
            )
              return;
            if (this.armedKind === item.id)
              this._fire("furniture-armed", { kind: null });
            this._saveIcons(this.customIcons.filter((i) => i.id !== icon.id));
          }}
        >
          <ha-icon icon="mdi:delete-outline"></ha-icon>
        </button>
      </div>
    </div>`;
  }

  private _thumb(item: CatalogItem) {
    const m = Math.max(item.w, item.d) * 0.1;
    return svg`<svg viewBox="${-m} ${-m} ${item.w + 2 * m} ${item.d + 2 * m}" preserveAspectRatio="xMidYMid meet">
      <g transform=${item.flip ? `translate(${item.w} 0) scale(-1 1)` : ""}>
        ${renderPrims(drawItem(item.draw, item.w, item.d, item.opts), false)}
      </g>
    </svg>`;
  }

  override render() {
    const items = this._items;
    return html`
      <div class="head">
        <span class="title">${localize("furniture.libraryTitle")}</span>
        <span class="head-actions">
          <button
            class="close"
            title=${localize("furniture.importSvg")}
            @click=${() =>
              this.renderRoot
                .querySelector<HTMLInputElement>(".import-file")
                ?.click()}
          >
            <ha-icon icon="mdi:file-upload-outline"></ha-icon>
          </button>
          <button
            class="close"
            title=${localize("furniture.close")}
            @click=${() => this._fire("library-close")}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </span>
        <input
          class="import-file"
          type="file"
          accept=".svg,image/svg+xml"
          multiple
          @change=${(e: Event) =>
            void this._import(e.target as HTMLInputElement)}
        />
      </div>
      <div class="search">
        <label class="search-box">
          <ha-icon icon="mdi:magnify"></ha-icon>
          <input
            type="search"
            placeholder=${localize("furniture.search")}
            .value=${this._query}
            @input=${(e: Event) =>
              (this._query = (e.target as HTMLInputElement).value)}
          />
        </label>
      </div>
      <div class="chips">
        <button
          class="chip ${this._category === null ? "active" : ""}"
          @click=${() => (this._category = null)}
        >
          ${localize("furniture.category.all")}
        </button>
        ${FURNITURE_CATEGORIES.map(
          (c) =>
            html`<button
              class="chip ${this._category === c.id ? "active" : ""}"
              @click=${() =>
                (this._category = this._category === c.id ? null : c.id)}
            >
              <ha-icon icon=${c.icon}></ha-icon>
              ${localize(`furniture.category.${c.id}`)}
            </button>`,
        )}
      </div>
      ${
        this._category === "custom"
          ? html`<button
                class="import-button"
                @click=${() =>
                  this.renderRoot
                    .querySelector<HTMLInputElement>(".import-file")
                    ?.click()}
              >
                <ha-icon icon="mdi:file-upload-outline"></ha-icon>
                ${localize("furniture.importSvg")}
              </button>
              <div class="notice">${localize("furniture.importHint")}</div>`
          : nothing
      }
      ${
        this._importError
          ? html`<div class="notice error">${this._importError}</div>`
          : nothing
      }
      <div class="count">
        ${localize("furniture.count", { count: items.length })}
      </div>
      <div class="grid">
        ${
          items.length === 0
            ? html`<div class="empty">
                ${localize(
                  this._category === "custom" && !this._query
                    ? "furniture.noCustom"
                    : "furniture.none",
                )}
              </div>`
            : items.map((item) => this._renderItem(item))
        }
      </div>
      ${nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "furniture-library-sidebar": FurnitureLibrarySidebar;
  }
}
