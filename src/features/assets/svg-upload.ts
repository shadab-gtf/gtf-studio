/** Keep uploaded vectors self-contained before previewing or parsing them into canvas objects. */
export const MAX_SVG_UPLOAD_BYTES = 2 * 1024 * 1024;

export class SvgUploadError extends Error {
  constructor(message: string) { super(message); this.name = "SvgUploadError"; }
}

export function isSvgUpload(file: Blob, name?: string): boolean {
  return file.type === "image/svg+xml" || (!file.type && /\.svg$/i.test(name ?? (file instanceof File ? file.name : "")));
}

export function validateSvgMarkup(source: string): string {
  if (new TextEncoder().encode(source).length > MAX_SVG_UPLOAD_BYTES) throw new SvgUploadError("Choose an SVG smaller than 2 MB.");
  const doc = new DOMParser().parseFromString(source, "image/svg+xml");
  const root = doc.documentElement;
  if (doc.querySelector("parsererror") || root.localName !== "svg" || root.namespaceURI !== "http://www.w3.org/2000/svg") {
    throw new SvgUploadError("This file is not a valid SVG. Export it as SVG and try again.");
  }
  if (doc.doctype) throw new SvgUploadError("Export this SVG without a document type declaration.");
  // Authoring metadata is not artwork and can contain non-SVG XML namespaces.
  root.querySelectorAll("metadata").forEach(node => node.remove());
  const nodes = [root, ...root.querySelectorAll("*")];
  if (nodes.length > 2000) throw new SvgUploadError("This SVG is too complex. Simplify it to fewer than 2,000 elements.");
  const forbidden = new Set(["script", "foreignObject", "animate", "animateMotion", "animateTransform", "set", "discard"]);
  const checkCss = (value: string): void => {
    // Escaped CSS and imports could conceal external resources from the URL check.
    if (/@import|@font-face|\\|expression\s*\(/i.test(value)) throw new SvgUploadError("Use an SVG with embedded artwork and no external styles.");
    for (const match of value.matchAll(/url\s*\(\s*(['"]?)(.*?)\1\s*\)/gi)) {
      if (!/^#[\w:.-]+$/.test(match[2].trim())) throw new SvgUploadError("Embed linked images in your SVG before uploading it.");
    }
  };
  const ids = new Map(nodes.filter(node => node.id).map(node => [node.id, node]));
  for (const node of nodes) {
    if (node.namespaceURI !== root.namespaceURI || forbidden.has(node.localName)) throw new SvgUploadError("Upload a static SVG without scripts, animation or embedded HTML.");
    let depth = 0;
    for (let parent = node.parentElement; parent; parent = parent.parentElement) depth++;
    if (depth > 32) throw new SvgUploadError("This SVG has too many nested groups. Simplify it before uploading.");
    for (const attr of [...node.attributes]) {
      if (/^on/i.test(attr.localName) || attr.name === "xml:base") throw new SvgUploadError("Upload an SVG without interactive scripts or external links.");
      if (attr.localName === "href") {
        const value = attr.value.trim();
        const embeddedImage = node.localName === "image" && /^data:image\/(png|jpeg|webp|gif|avif);base64,[a-z\d+/=\s]+$/i.test(value);
        if (!/^#[\w:.-]+$/.test(value) && !embeddedImage) throw new SvgUploadError("Embed linked images in your SVG before uploading it.");
      }
      if (["style", "fill", "stroke", "filter", "clip-path", "mask", "cursor"].includes(attr.localName)) checkCss(attr.value);
    }
    if (node.localName === "style") checkCss(node.textContent ?? "");
    if (node.localName === "use") {
      const target = ids.get((node.getAttribute("href") ?? node.getAttribute("xlink:href") ?? "").slice(1));
      // Nested use trees can expand exponentially even in a tiny file.
      if (target && (target.localName === "use" || target.contains(node) || target.querySelector("use"))) throw new SvgUploadError("Expand repeated SVG symbols to paths before uploading.");
    }
  }
  return new XMLSerializer().serializeToString(root);
}

export async function prepareSvgUpload(file: Blob): Promise<Blob> {
  if (file.size > MAX_SVG_UPLOAD_BYTES) throw new SvgUploadError("Choose an SVG smaller than 2 MB.");
  return new Blob([validateSvgMarkup(await file.text())], { type: "image/svg+xml" });
}
