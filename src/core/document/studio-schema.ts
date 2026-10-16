import { z } from "zod";
import type { DocObject, DoryDocument } from "@/vendor/doory/types/document";

export const MAX_STUDIO_OBJECTS = 1000;
export const MAX_STUDIO_JSON_LENGTH = 20 * 1024 * 1024;
const dimension = z.number().finite().positive().max(8000);
const coordinate = z.number().finite().min(-1_000_000).max(1_000_000);
const size = z.number().finite().min(0).max(40_000);
const unit = z.number().finite().min(0).max(1);
const id = z.string().min(1).max(100);
const color = z.string().max(100).refine(value => /^(#[\da-f]{3,8}|[a-z]+|(?:rgb|hsl)a?\([\d\s.,%+/-]+\))$/i.test(value));

export function isStudioSource(value: string): boolean {
  if (!value || /[\u0000-\u0020\\]/.test(value)) return false;
  if (/^idb:\/\/[a-z\d._-]+$/i.test(value)) return true;
  if (/^data:image\/(png|jpeg|webp|gif|avif|svg\+xml)[;,]/i.test(value)) return true;
  if (/^\/[^/]/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}

const source = z.string().max(12_000_000).refine(isStudioSource);
const stops = z.array(z.object({ offset: unit, color })).min(2).max(32);
const mask = z.union([z.enum(["circle", "rounded", "triangle", "diamond", "hexagon", "star", "heart", "blob", "arch", "cross"]), z.object({ path: z.string().min(1).max(200_000) })]);
const shadow = z.object({ color, blur: z.number().finite().min(0).max(1000), offsetX: coordinate, offsetY: coordinate }).passthrough();
const filter = z.object({ type: z.enum(["brightness", "contrast", "saturation", "hue", "blur", "vignette", "grayscale", "sepia"]), value: z.number().finite().min(-1).max(1) });
const direction = z.enum(["left", "right", "up", "down", "in", "out"]);
const easing = z.enum(["linear", "ease-in", "ease-out", "ease-in-out", "spring", "bounce"]);
const animation = z.object({
  preset: z.string().max(100), durationMs: z.number().finite().min(100).max(10_000), delayMs: z.number().finite().min(0).max(60_000), easing,
  direction: direction.optional(), by: z.enum(["object", "line", "word", "letter"]).optional(), loop: z.boolean().optional(), intensity: unit.optional(),
});
const paint = z.union([color, z.null(), z.object({
  type: z.enum(["linear", "radial"]), colorStops: stops,
  coords: z.object({ x1: coordinate, y1: coordinate, x2: coordinate, y2: coordinate, r1: size.optional(), r2: size.optional() }),
  gradientUnits: z.enum(["pixels", "percentage"]).optional(), gradientTransform: z.array(coordinate).length(6).nullable().optional(),
  offsetX: coordinate.optional(), offsetY: coordinate.optional(),
}).passthrough()]);
const textStyle = z.object({
  fontSize: z.number().finite().positive().max(2000).optional(), fontFamily: z.string().max(200).optional(),
  fontWeight: z.union([z.number().finite().min(1).max(1000), z.string().max(30)]).optional(),
  fill: paint.optional(), stroke: paint.optional(), strokeWidth: size.optional(), deltaY: coordinate.optional(),
  textBackgroundColor: z.union([color, z.literal("")]).optional(),
}).passthrough();
const styles = z.union([
  z.array(z.object({ start: z.number().int().min(0).max(20_000), end: z.number().int().min(0).max(20_000), style: textStyle })).max(20_000),
  z.record(z.string(), z.record(z.string(), textStyle)),
]);
const commandLengths: Record<string, number> = { m: 3, l: 3, h: 2, v: 2, c: 7, s: 5, q: 5, t: 3, a: 8, z: 1 };
const path = z.union([z.string().min(1).max(200_000), z.array(z.array(z.union([coordinate, z.string().regex(/^[MmLlHhVvCcSsQqTtAaZz]$/)])).min(1).max(8).refine(segment => typeof segment[0] === "string" && segment.length === commandLengths[segment[0].toLowerCase()] && segment.slice(1).every(value => typeof value === "number"))).max(10_000)]);
const objectTypes = new Set(["text", "itext", "textbox", "rect", "ellipse", "circle", "triangle", "polygon", "polyline", "path", "image", "group", "activeselection", "doryline", "line", "object"]);
const objectSchema = textStyle.extend({
  id: id.optional(), type: z.string().min(1).max(60).refine(value => objectTypes.has(value.toLowerCase().replace(/-/g, ""))), name: z.string().max(500).optional(),
  left: coordinate.optional(), top: coordinate.optional(), width: size.optional(), height: size.optional(),
  scaleX: z.number().finite().min(-1000).max(1000).optional(), scaleY: z.number().finite().min(-1000).max(1000).optional(),
  angle: coordinate.optional(), skewX: coordinate.optional(), skewY: coordinate.optional(), opacity: unit.optional(),
  rx: size.optional(), ry: size.optional(), radius: size.optional(), cropX: size.optional(), cropY: size.optional(),
  text: z.string().max(20_000).optional(), caseSource: z.string().max(20_000).optional(), styles: styles.optional(),
  lineHeight: z.number().finite().positive().max(10).optional(), charSpacing: z.number().finite().min(-10_000).max(10_000).optional(),
  fontStyle: z.enum(["normal", "italic", "oblique"]).optional(), textAlign: z.enum(["left", "right", "center", "justify", "justify-left", "justify-right", "justify-center"]).optional(),
  direction: z.enum(["ltr", "rtl"]).optional(), textDir: z.enum(["ltr", "rtl", "auto"]).optional(),
  textCase: z.enum(["none", "upper", "lower", "title", "sentence"]).optional(), listStyle: z.enum(["none", "bullet", "number"]).optional(),
  originX: z.union([z.enum(["left", "center", "right"]), unit]).optional(), originY: z.union([z.enum(["top", "center", "bottom"]), unit]).optional(),
  strokeDashArray: z.array(size).max(100).nullable().optional(), strokeDashOffset: coordinate.optional(), strokeMiterLimit: size.optional(),
  strokeLineCap: z.enum(["butt", "round", "square"]).optional(), strokeLineJoin: z.enum(["miter", "bevel", "round"]).optional(),
  flipX: z.boolean().optional(), flipY: z.boolean().optional(), underline: z.boolean().optional(), overline: z.boolean().optional(), linethrough: z.boolean().optional(), splitByGrapheme: z.boolean().optional(),
  x1: coordinate.optional(), x2: coordinate.optional(), y1: coordinate.optional(), y2: coordinate.optional(),
  arrowStart: z.enum(["none", "triangle", "open", "circle", "diamond"]).optional(), arrowEnd: z.enum(["none", "triangle", "open", "circle", "diamond"]).optional(),
  src: source.optional(), docSrc: source.optional(), path: path.optional(),
  points: z.array(z.object({ x: coordinate, y: coordinate })).max(10_000).optional(),
  objects: z.array(z.unknown()).max(MAX_STUDIO_OBJECTS).optional(), shadow: shadow.nullable().optional(),
  effects: z.object({ shadow: shadow.optional(), outline: z.object({ color, width: size }).optional(), glow: z.object({ color, blur: size }).optional(), background: z.object({ color }).optional() }).optional(),
  filters: z.array(filter).max(8).optional(), filterSpecs: z.array(filter).max(8).optional(),
  qr: z.object({ text: z.string().max(1000), fg: color, bg: color }).optional(), maskShape: mask.optional(), maskRadius: size.optional(),
  slot: z.object({ cx: coordinate, cy: coordinate, width: size.positive(), height: size.positive(), angle: coordinate, mask: mask.optional(), radius: size.optional(), src: source.optional() }).optional(),
  animation: z.object({ enter: animation.optional(), exit: animation.optional(), emphasis: animation.optional() }).optional(),
  curveAmount: z.number().finite().min(-360).max(360).optional(), sides: z.number().int().min(3).max(100).optional(), starPoints: z.number().int().min(3).max(100).optional(), innerRatio: unit.optional(),
  colorMap: z.record(z.string().max(100), color).optional(), locked: z.boolean().optional(), visible: z.boolean().optional(), isPlaceholder: z.boolean().optional(),
  origFill: color.optional(), origStroke: color.optional(), assetId: id.optional(), elementId: z.string().max(200).optional(), shapeId: z.string().max(100).optional(),
  shapeKind: z.enum(["rect", "ellipse", "triangle", "polygon", "star", "path"]).optional(),
  backgroundColor: z.union([color, z.literal("")]).optional(), fillRule: z.enum(["nonzero", "evenodd"]).optional(), paintFirst: z.enum(["fill", "stroke"]).optional(),
  strokeUniform: z.boolean().optional(), inverted: z.boolean().optional(), absolutePositioned: z.boolean().optional(),
  layoutManager: z.object({ type: z.literal("layoutManager"), strategy: z.enum(["fit-content", "fixed", "clip-path"]) }).optional(),
  link: z.object({ url: z.string().max(2048).refine(value => { try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password && !/[\u0000-\u0020\\]/.test(value); } catch { return false; } }) }).optional(),
}).passthrough();
const background = z.discriminatedUnion("type", [
  z.object({ type: z.literal("solid"), color }),
  z.object({ type: z.literal("gradient"), kind: z.enum(["linear", "radial"]), angle: coordinate.optional(), stops }),
  z.object({ type: z.literal("image"), src: source, fit: z.enum(["cover", "contain", "tile"]), opacity: unit.optional(), offsetX: coordinate.optional(), offsetY: coordinate.optional(), scale: z.number().finite().positive().max(1000).optional() }),
]);
const time = z.number().finite().min(0).max(86_400_000);
const audioTrack = z.object({
  id, kind: z.enum(["music", "voiceover", "sfx", "upload"]), name: z.string().max(200), src: source,
  scope: z.discriminatedUnion("type", [z.object({ type: z.literal("design") }), z.object({ type: z.literal("page"), pageId: id })]),
  startMs: time, durationMs: time.optional(), trimStartMs: time, trimEndMs: time, volume: unit,
  fadeInMs: time.max(60_000), fadeOutMs: time.max(60_000), loop: z.boolean(), muted: z.boolean(), duckUnderVoiceover: z.boolean().optional(),
}).refine(track => track.trimEndMs >= track.trimStartMs);
const envelope = z.object({
  schemaVersion: z.literal(1), width: dimension, height: dimension, unit: z.enum(["px", "mm", "in"]),
  pages: z.array(z.object({
    id, name: z.string().max(500).optional(), width: dimension.optional(), height: dimension.optional(), background,
    objects: z.array(z.unknown()).max(MAX_STUDIO_OBJECTS), notes: z.string().max(20_000).optional(), durationSec: z.number().finite().min(0).max(3600).optional(),
    guides: z.array(z.object({ orientation: z.enum(["horizontal", "vertical"]), pos: coordinate })).max(1000).optional(),
    transition: z.object({ preset: z.string().max(100), durationMs: z.number().finite().min(200).max(3000), direction: direction.optional(), easing }).optional(),
  }).passthrough()).min(1).max(100), audioTracks: z.array(audioTrack).max(32).optional(),
}).passthrough();
const forbiddenKeys = new Set(["__proto__", "constructor", "prototype", "toObject", "toSVG", "toJSON", "render", "set", "get", "dispose", "canvas", "setCoords", "getBoundingRect", "getCenterPoint", "getObjectScaling", "getScaledWidth", "getScaledHeight", "transform", "calcTransformMatrix", "drawObject", "isType", "containsPoint"]);

/** Bound work before Zod/Fabric walk input, including unknown extension fields. */
function safeGraph(value: unknown): boolean {
  const stack = [{ value, depth: 0 }];
  let nodes = 0, strings = 0;
  while (stack.length) {
    const item = stack.pop()!;
    if (++nodes > 200_000 || item.depth > 40) return false;
    if (typeof item.value === "number" && !Number.isFinite(item.value)) return false;
    if (typeof item.value === "string") {
      strings += item.value.length;
      if (item.value.length > 12_000_000 || strings > MAX_STUDIO_JSON_LENGTH) return false;
    } else if (item.value && typeof item.value === "object") {
      const entries = Object.entries(item.value);
      if (entries.length + stack.length + nodes > 200_000) return false;
      for (const [key, child] of entries) {
        if (forbiddenKeys.has(key) || key.startsWith("_")) return false;
        if (["src", "docSrc"].includes(key) && typeof child === "string" && !isStudioSource(child)) return false;
        stack.push({ value: child, depth: item.depth + 1 });
      }
    } else if (!["undefined", "number", "boolean", "object"].includes(typeof item.value)) return false;
  }
  return true;
}

function validObjects(value: unknown, ids = new Set<string>()): value is DocObject[] {
  if (!Array.isArray(value) || value.length > MAX_STUDIO_OBJECTS) return false;
  const stack = value.map(object => ({ object: object as unknown, depth: 0, clip: false }));
  let count = 0;
  while (stack.length) {
    const { object, depth, clip } = stack.pop()!;
    if (++count > MAX_STUDIO_OBJECTS || depth > 16) return false;
    const parsed = objectSchema.safeParse(object);
    if (!parsed.success) return false;
    const node = parsed.data, type = node.type.toLowerCase().replace(/-/g, "");
    if (!clip) { if (!node.id || ids.has(node.id)) return false; ids.add(node.id); }
    if (["text", "itext", "textbox"].includes(type) && typeof node.text !== "string") return false;
    if (["group", "activeselection"].includes(type) && !node.objects) return false;
    if (["polygon", "polyline"].includes(type) && !node.points) return false;
    if (type === "path" && !node.path) return false;
    if (type === "image" && !node.src && !node.docSrc && !node.qr && !node.isPlaceholder) return false;
    for (const child of node.objects ?? []) stack.push({ object: child, depth: depth + 1, clip });
    if (node.clipPath != null) stack.push({ object: node.clipPath, depth: depth + 1, clip: true });
  }
  return true;
}

/** Counts nested objects and clip paths on an already validated document. */
export function countStudioObjects(objects: readonly DocObject[]): number {
  const stack: unknown[] = [...objects];
  let count = 0;
  while (stack.length) {
    if (++count > MAX_STUDIO_OBJECTS) return count;
    const node = stack.pop() as DocObject;
    if (Array.isArray(node.objects)) stack.push(...node.objects);
    if (node.clipPath) stack.push(node.clipPath);
  }
  return count;
}

export function assertStudioObjectCapacity(existing: number, added: number): void {
  if (existing + added > MAX_STUDIO_OBJECTS) throw new Error(`A page supports up to ${MAX_STUDIO_OBJECTS} objects, including grouped objects. Remove some objects before pasting.`);
}

export const studioObjectsSchema = z.custom<DocObject[]>(value => safeGraph(value) && validObjects(value), "The pasted objects are malformed or exceed the supported limits.");

/** Validate known fields without stripping properties needed for an editable Fabric round trip. */
export const studioDocumentSchema = z.custom<DoryDocument>(value => {
  if (!safeGraph(value)) return false;
  const parsed = envelope.safeParse(value);
  if (!parsed.success) return false;
  const objectIds = new Set<string>(), pageIds = new Set<string>();
  let total = 0;
  for (const page of parsed.data.pages) {
    if (pageIds.has(page.id) || !validObjects(page.objects, objectIds)) return false;
    pageIds.add(page.id);
    total += countStudioObjects(page.objects as DocObject[]);
    if (total > 10_000) return false;
  }
  return true;
}, "This studio document is malformed or exceeds the supported limits.");
