import type { CanvasElement, CreativeDocument } from "@/core/document/schema";
import { studioDocumentSchema } from "@/core/document/studio-schema";
import type { DocObject, DoryDocument } from "@/vendor/doory/types/document";

function object(element: CanvasElement): DocObject {
  const common = { id: element.id, name: element.name, left: element.x, top: element.y, width: element.width, height: element.height, angle: element.rotation, opacity: element.opacity, locked: element.locked, visible: !element.hidden, originX: "left", originY: "top" };
  if (element.type === "text") return { ...common, type: "textbox", text: element.text, fill: element.fill, fontFamily: element.fontFamily, fontSize: element.fontSize, fontWeight: element.fontWeightValue ?? (element.fontWeight === "bold" ? 700 : 400), fontStyle: element.fontStyle ?? "normal", textAlign: element.align, lineHeight: element.lineHeight, splitByGrapheme: false };
  if (element.type === "image") return { ...common, type: "image", src: element.src, flipX: element.flipX, flipY: element.flipY, alt: element.alt };
  if (element.type === "path") return { ...common, type: "polyline", fill: null, stroke: element.fill, strokeWidth: element.strokeWidth, strokeLineCap: "round", strokeLineJoin: "round", points: Array.from({ length: element.points.length / 2 }, (_, i) => ({ x: element.points[i * 2] * element.width / element.viewWidth, y: element.points[i * 2 + 1] * element.height / element.viewHeight })) };
  if (element.shape === "ellipse") return { ...common, type: "ellipse", fill: element.fill, rx: element.width / 2, ry: element.height / 2 };
  if (element.shape === "triangle") return { ...common, type: "triangle", fill: element.fill };
  if (element.shape === "star") return { ...common, type: "polygon", fill: element.fill, points: Array.from({ length: 10 }, (_, i) => { const angle = i * Math.PI / 5 - Math.PI / 2; const radius = i % 2 ? .22 : .5; return { x: element.width * (.5 + Math.cos(angle) * radius), y: element.height * (.5 + Math.sin(angle) * radius) }; }) };
  return { ...common, type: "rect", fill: element.fill, rx: element.cornerRadius, ry: element.cornerRadius };
}

export function toStudioDocument(document: CreativeDocument): DoryDocument {
  if (document.studio) return structuredClone(studioDocumentSchema.parse(document.studio));
  return { schemaVersion: 1, unit: "px", width: document.width, height: document.height, pages: document.pages.map(page => ({ id: page.id, name: page.name, background: { type: "solid", color: page.background }, notes: page.notes, objects: page.elements.map(object) })) };
}

/** The full editable studio model is authoritative; the small projection supplies workspace previews. */
export function withStudioDocument(document: DoryDocument, thumbnail?: string): CreativeDocument {
  const studio = studioDocumentSchema.parse(document);
  return { schemaVersion: 1, width: Math.round(studio.width), height: Math.round(studio.height), studio, pages: studio.pages.map((page, index) => ({ id: page.id, name: page.name || `Page ${index + 1}`, notes: page.notes || "", transition: "none", background: page.background.type === "solid" && /^#[\da-f]{6}$/i.test(page.background.color) ? page.background.color : "#ffffff", elements: index === 0 && thumbnail ? [{ id: `preview-${page.id}`, name: "Design preview", type: "image", src: thumbnail, alt: "Design preview", x: 0, y: 0, width: studio.width, height: studio.height, rotation: 0, opacity: 1, locked: true, hidden: false }] : [] })) };
}

export function blobDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Unable to read the file.")); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
}
