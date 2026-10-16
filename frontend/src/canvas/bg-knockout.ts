/** Room colours under an SVG background (Settings → Plan → Room colour
 * under the background): plan drawings usually outline their counters,
 * appliances and fixtures without filling them, so colour drawn beneath
 * would show straight through. This copy of the drawing fills each small
 * closed outline with white, so the colour stays on the floor and the
 * items sit on top of it. */

/** Shapes bigger than this share of the drawing are rooms or outer
 * walls, left alone. */
const MAX_ITEM_SHARE = 0.04;

const SHAPES = "rect,circle,ellipse,polygon,path";

/** A blob: URL of the knocked-out drawing, or null when the background
 * isn't an SVG (a photo can't be told apart from its items). */
export async function knockoutSvgUrl(url: string): Promise<string | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const text = await res.text();
  const type = res.headers.get("content-type") ?? "";
  if (!type.includes("svg") && !/^\s*(<\?xml|<svg|<!--)/i.test(text)) {
    return null;
  }
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const root = doc.documentElement;
  if (
    !root ||
    root.nodeName.toLowerCase() !== "svg" ||
    doc.getElementsByTagName("parsererror").length > 0
  ) {
    return null;
  }
  // Lay a copy out off-screen, in its own shadow root so the drawing's
  // stylesheet can't touch the page, to read each shape's real fill and
  // size.
  const host = document.createElement("div");
  host.style.cssText =
    "position:fixed;left:-20000px;top:0;width:1000px;height:1000px;opacity:0;pointer-events:none;";
  const shadow = host.attachShadow({ mode: "open" });
  const live = document.importNode(root, true) as unknown as SVGSVGElement;
  live.setAttribute("width", "1000");
  live.setAttribute("height", "1000");
  shadow.appendChild(live);
  document.body.appendChild(host);
  try {
    const whole = live.getBoundingClientRect();
    const total = whole.width * whole.height;
    if (!(total > 0)) return null;
    const source = Array.from(root.querySelectorAll(SHAPES));
    const laidOut = Array.from(live.querySelectorAll(SHAPES));
    laidOut.forEach((el, i) => {
      const target = source[i];
      if (!target) return;
      const cs = getComputedStyle(el);
      if (cs.fill !== "none" || cs.display === "none") return;
      if (cs.stroke === "none") return;
      // Only closed outlines: an open path (a door swing) stays open.
      if (
        el.tagName.toLowerCase() === "path" &&
        !/z/i.test(el.getAttribute("d") ?? "")
      ) {
        return;
      }
      const box = el.getBoundingClientRect();
      const area = box.width * box.height;
      if (!(area > 0) || area / total > MAX_ITEM_SHARE) return;
      const style = target.getAttribute("style");
      target.setAttribute(
        "style",
        `${style ? `${style.replace(/;?\s*$/, "")};` : ""}fill:#ffffff`,
      );
    });
  } finally {
    host.remove();
  }
  const out = new XMLSerializer().serializeToString(root);
  return URL.createObjectURL(new Blob([out], { type: "image/svg+xml" }));
}
