import { LitElement, html, css, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { safeCustomElement } from "../define";
import { localize } from "../i18n";

export interface SearchOption {
  value: string;
  label: string;
  /** Shown as a heading over its options (an entity's domain, say). */
  group?: string;
  /** A second, dimmer line (an entity id). */
  secondary?: string;
}

/** Most rows drawn at once; typing narrows the rest. */
const MAX_ROWS = 80;

/** A dropdown you can type into: focus it and type to filter the options
 * by name, id or group, then click one or pick it with the arrow keys and
 * Enter. Fires "value-changed" { value } (null for `noneLabel`). With
 * `addMode` it's an "Add…" picker: it never shows a current value. */
@safeCustomElement("search-select")
export class SearchSelect extends LitElement {
  static override styles = css`
    :host {
      display: block;
      position: relative;
      min-width: 0;
    }
    input {
      box-sizing: border-box;
      width: 100%;
      height: var(--sc-h-control, 36px);
      padding: 0 30px 0 10px;
      border: 1px solid var(--sc-divider, #ccc);
      border-radius: var(--sc-r-control, 10px);
      background: var(--sc-bg, #fff);
      color: var(--sc-fg, inherit);
      font: inherit;
      font-size: 13px;
      outline: none;
      text-overflow: ellipsis;
    }
    input:focus {
      border-color: var(--sc-accent, #03a9f4);
    }
    input::placeholder {
      color: var(--sc-fg, inherit);
      opacity: 0.85;
    }
    .chevron {
      position: absolute;
      right: 10px;
      top: calc(var(--sc-h-control, 36px) / 2 - 3px);
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid var(--sc-fg-secondary, #666);
      pointer-events: none;
    }
    .list {
      margin-top: 4px;
      max-height: 240px;
      overflow-y: auto;
      border: 1px solid var(--sc-divider, #ccc);
      border-radius: var(--sc-r-control, 10px);
      background: var(--sc-bg, #fff);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    }
    .group {
      padding: 6px 10px 2px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--sc-fg-secondary, #666);
    }
    .row {
      display: block;
      width: 100%;
      padding: 6px 10px;
      border: none;
      background: none;
      text-align: left;
      font: inherit;
      font-size: 13px;
      color: var(--sc-fg, inherit);
      cursor: pointer;
    }
    .row.active,
    .row:hover {
      background: var(--sc-hover, rgba(0, 0, 0, 0.06));
    }
    .row.selected {
      color: var(--sc-accent, #03a9f4);
      font-weight: 600;
    }
    .secondary {
      display: block;
      font-size: 11px;
      font-weight: 400;
      color: var(--sc-fg-secondary, #666);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .empty,
    .more {
      padding: 8px 10px;
      font-size: 12px;
      color: var(--sc-fg-secondary, #666);
    }
  `;

  @property({ attribute: false }) options: SearchOption[] = [];
  @property({ attribute: false }) value: string | null = null;
  @property() placeholder = "";
  /** A first choice that clears the value ("No entity"). */
  @property({ attribute: false }) noneLabel: string | null = null;
  @property({ type: Boolean }) addMode = false;
  @property() emptyText = "";
  @state() private _open = false;
  @state() private _query = "";
  @state() private _active = 0;

  private get _matches(): SearchOption[] {
    const words = this._query.toLowerCase().split(/\s+/).filter(Boolean);
    if (words.length === 0) return this.options;
    return this.options.filter((o) => {
      const hay =
        `${o.label} ${o.value} ${o.group ?? ""} ${o.secondary ?? ""}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }

  /** What the closed box shows. */
  private get _display(): string {
    if (this.addMode || !this.value) return "";
    return (
      this.options.find((o) => o.value === this.value)?.label ?? this.value
    );
  }

  private _pick(value: string | null) {
    this._open = false;
    this._query = "";
    this.renderRoot.querySelector("input")?.blur();
    this.dispatchEvent(
      new CustomEvent("value-changed", {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _rows(): (SearchOption | null)[] {
    const rows: (SearchOption | null)[] = this._matches.slice(0, MAX_ROWS);
    // The "none" choice only while not searching.
    if (this.noneLabel !== null && !this._query) rows.unshift(null);
    return rows;
  }

  private _onKey(e: KeyboardEvent) {
    const rows = this._rows();
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      this._open = true;
      const step = e.key === "ArrowDown" ? 1 : -1;
      this._active = Math.max(
        0,
        Math.min(rows.length - 1, this._active + step),
      );
      void this.updateComplete.then(() =>
        this.renderRoot
          .querySelector(".row.active")
          ?.scrollIntoView({ block: "nearest" }),
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const row = rows[this._active];
      if (row !== undefined) this._pick(row ? row.value : null);
    } else if (e.key === "Escape") {
      e.stopPropagation();
      this._open = false;
      this._query = "";
      (e.target as HTMLInputElement).blur();
    }
  }

  override render() {
    const rows = this._open ? this._rows() : [];
    const total = this._open ? this._matches.length : 0;
    let lastGroup: string | undefined;
    return html`
      <input
        type="text"
        autocomplete="off"
        spellcheck="false"
        .value=${this._open ? this._query : this._display}
        placeholder=${
          this._open
            ? this._display || this.placeholder
            : this.placeholder || (this.noneLabel ?? "")
        }
        @focus=${() => {
          this._open = true;
          this._query = "";
          this._active = 0;
        }}
        @blur=${() => {
          this._open = false;
          this._query = "";
        }}
        @input=${(e: Event) => {
          this._query = (e.target as HTMLInputElement).value;
          this._active = 0;
        }}
        @keydown=${this._onKey}
      />
      <span class="chevron"></span>
      ${
        this._open
          ? html`<div
              class="list"
              @mousedown=${(e: Event) => e.preventDefault()}
            >
              ${
                rows.length === 0
                  ? html`<div class="empty">
                      ${this.emptyText || localize("canvas.search.none")}
                    </div>`
                  : rows.map((o, i) => {
                      const heading =
                        o && o.group && o.group !== lastGroup
                          ? html`<div class="group">${o.group}</div>`
                          : nothing;
                      if (o) lastGroup = o.group;
                      return html`${heading}<button
                          class="row ${i === this._active ? "active" : ""} ${
                            o && o.value === this.value && !this.addMode
                              ? "selected"
                              : ""
                          }"
                          @click=${() => this._pick(o ? o.value : null)}
                        >
                          ${o ? o.label : this.noneLabel}
                          ${
                            o?.secondary
                              ? html`<span class="secondary"
                                  >${o.secondary}</span
                                >`
                              : nothing
                          }
                        </button>`;
                    })
              }
              ${
                total > MAX_ROWS
                  ? html`<div class="more">
                      ${localize("canvas.search.more", {
                        count: total - MAX_ROWS,
                      })}
                    </div>`
                  : nothing
              }
            </div>`
          : nothing
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "search-select": SearchSelect;
  }
}
