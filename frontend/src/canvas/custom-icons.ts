/** Icons the user imports as SVG files: placeable like any library item
 * (kind `custom_<id>`, see furniture-catalog.ts), kept in the global
 * settings (Settings.custom_icons) so every floor and the dashboard card
 * share them. */

export interface CustomIcon {
  id: string;
  name: string;
  /** The SVG markup, cleaned on import (see cleanSvg). */
  svg: string;
  /** Default size when placed, centimetres. */
  w: number;
  d: number;
  /** Draw in the file's own colours; otherwise its shapes take the item's
   * line colour (theme, live state) like the built-in drawings. */
  colors?: boolean;
}

/** Largest SVG accepted, characters. */
export const MAX_SVG_LENGTH = 300_000;
/** Most icons kept. */
export const MAX_CUSTOM_ICONS = 200;

/** `text` as a cleaned, standalone SVG and its aspect ratio, or null when
 * it isn't one. Scripts, event handlers, embedded HTML and links to other
 * files are dropped — the icon is drawn as an image, which never runs or
 * fetches them anyway, but stored copies stay tidy. */
export function cleanSvg(text: string): { svg: string; aspect: number } | null {
  if (text.length > MAX_SVG_LENGTH) return null;
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const root = doc.documentElement;
  if (
    !root ||
    root.nodeName.toLowerCase() !== "svg" ||
    doc.getElementsByTagName("parsererror").length > 0
  ) {
    return null;
  }
  for (const tag of ["script", "foreignObject", "iframe", "object", "embed"]) {
    for (const el of Array.from(doc.getElementsByTagName(tag))) el.remove();
  }
  for (const el of Array.from(doc.getElementsByTagName("*"))) {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(attr.name);
      else if (
        (name === "href" || name === "xlink:href") &&
        !value.startsWith("#") &&
        !value.startsWith("data:image/")
      ) {
        el.removeAttribute(attr.name);
      }
    }
  }
  // Size: the viewBox, else width/height, else square.
  const vb = (root.getAttribute("viewBox") ?? "")
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => Number.isFinite(n));
  let w =
    vb.length === 4
      ? (vb[2] ?? 0)
      : parseFloat(root.getAttribute("width") ?? "");
  let h =
    vb.length === 4
      ? (vb[3] ?? 0)
      : parseFloat(root.getAttribute("height") ?? "");
  if (!(w > 0) || !(h > 0)) {
    w = 1;
    h = 1;
  }
  // A viewBox lets the image scale to whatever size it's drawn at.
  if (vb.length !== 4) root.setAttribute("viewBox", `0 0 ${w} ${h}`);
  root.setAttribute("preserveAspectRatio", "xMidYMid meet");
  if (!root.getAttribute("xmlns")) {
    root.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  return {
    svg: new XMLSerializer().serializeToString(root),
    aspect: w / h,
  };
}

/** A data: URL for drawing an icon's SVG as an image. */
export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function newCustomIconId(): string {
  return Math.random().toString(36).slice(2, 10);
}
