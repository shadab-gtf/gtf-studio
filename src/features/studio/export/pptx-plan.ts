import type { DocObject } from "@/vendor/doory/types/document";

export interface PptxBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface Paint {
  color: string;
  opacity: number;
}
interface NativeLayer {
  box: PptxBox;
  opacity: number;
  name: string;
}
export interface PptxTextLayer extends NativeLayer {
  kind: "text";
  text: string;
  fontFace: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  align: "left" | "center" | "right";
  lineHeight: number;
  fill: Paint;
}
export interface PptxShapeLayer extends NativeLayer {
  kind: "shape";
  shape: "rect" | "ellipse" | "triangle";
  fill: Paint;
  stroke: Paint;
  strokeWidth: number;
}
export type PptxLayer =
  PptxTextLayer | PptxShapeLayer | { kind: "raster"; objects: DocObject[] };

const number = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
const nonempty = (value: unknown) =>
  value !== null && typeof value === "object" && Object.keys(value).length > 0;

function paint(value: unknown, fallback: string): Paint | null {
  const color = value === undefined ? fallback : value;
  if (color === null || color === "" || color === "transparent")
    return { color: "000000", opacity: 0 };
  if (typeof color !== "string") return null;
  if (/^#[\da-f]{6}$/i.test(color))
    return { color: color.slice(1), opacity: 1 };
  if (/^#[\da-f]{8}$/i.test(color))
    return {
      color: color.slice(1, 7),
      opacity: parseInt(color.slice(7), 16) / 255,
    };
  if (/^#[\da-f]{3}$/i.test(color))
    return {
      color: color
        .slice(1)
        .split("")
        .map((c) => c + c)
        .join(""),
      opacity: 1,
    };
  return null;
}

function origin(value: unknown): number {
  if (typeof value === "number") return value;
  if (value === "left" || value === "top") return 0;
  if (value === "right" || value === "bottom") return 1;
  return 0.5;
}

function boxOf(object: DocObject): PptxBox | null {
  const width = number(object.width, 0),
    height = number(object.height, 0);
  const sx = number(object.scaleX, 1),
    sy = number(object.scaleY, 1);
  if (width <= 0 || height <= 0 || sx <= 0 || sy <= 0) return null;
  const rotation = ((number(object.angle, 0) % 360) + 360) % 360;
  const angle = (rotation * Math.PI) / 180;
  const stroke = number(object.strokeWidth, 1);
  const dx = (0.5 - origin(object.originX)) * (width + stroke) * sx;
  const dy = (0.5 - origin(object.originY)) * (height + stroke) * sy;
  return {
    x:
      number(object.left, 0) +
      dx * Math.cos(angle) -
      dy * Math.sin(angle) -
      (width * sx) / 2,
    y:
      number(object.top, 0) +
      dx * Math.sin(angle) +
      dy * Math.cos(angle) -
      (height * sy) / 2,
    width: width * sx,
    height: height * sy,
    rotation,
  };
}

function nativeLayer(object: DocObject): PptxLayer | null {
  if (
    nonempty(object.effects) ||
    object.shadow ||
    object.clipPath ||
    object.mask ||
    object.maskShape ||
    object.flipX ||
    object.flipY ||
    number(object.skewX, 0) ||
    number(object.skewY, 0)
  )
    return null;
  const box = boxOf(object);
  const fill = paint(object.fill, "#000000"),
    stroke = paint(object.stroke, "transparent");
  if (!box || !fill || !stroke) return null;
  const common = {
    box,
    opacity: Math.max(0, Math.min(1, number(object.opacity, 1))),
    name: object.name ?? object.id,
  };
  const type = object.type.toLowerCase();
  if (["text", "itext", "textbox"].includes(type)) {
    if (
      typeof object.text !== "string" ||
      nonempty(object.styles) ||
      number(object.curveAmount, 0) ||
      number(object.charSpacing, 0) ||
      object.path ||
      object.textBackgroundColor ||
      object.backgroundColor ||
      object.overline === true ||
      object.direction === "rtl" ||
      (stroke.opacity && number(object.strokeWidth, 1))
    )
      return null;
    if (number(object.scaleX, 1) !== number(object.scaleY, 1)) return null;
    if (
      object.textAlign &&
      !["left", "center", "right"].includes(String(object.textAlign))
    )
      return null;
    return {
      ...common,
      kind: "text",
      text: object.text,
      fontFace:
        typeof object.fontFamily === "string"
          ? object.fontFamily.split(",")[0].replace(/^['"]|['"]$/g, "")
          : "Arial",
      fontSize: number(object.fontSize, 40) * number(object.scaleY, 1),
      bold: object.fontWeight === "bold" || Number(object.fontWeight) >= 600,
      italic: object.fontStyle === "italic",
      underline: object.underline === true,
      strike: object.linethrough === true,
      align:
        object.textAlign === "center" || object.textAlign === "right"
          ? object.textAlign
          : "left",
      lineHeight: number(object.lineHeight, 1.16),
      fill,
    };
  }
  if (!["rect", "ellipse", "circle", "triangle"].includes(type)) return null;
  if (type === "rect" && (number(object.rx, 0) || number(object.ry, 0)))
    return null;
  if (
    object.strokeDashArray ||
    (object.strokeUniform &&
      stroke.opacity > 0 &&
      (number(object.scaleX, 1) !== 1 || number(object.scaleY, 1) !== 1))
  )
    return null;
  return {
    ...common,
    kind: "shape",
    shape:
      type === "circle" || type === "ellipse"
        ? "ellipse"
        : type === "triangle"
          ? "triangle"
          : "rect",
    fill,
    stroke,
    strokeWidth: number(object.strokeWidth, 1) * number(object.scaleX, 1),
  };
}

/** Consecutive complex objects share a transparent bitmap so their stacking order is preserved. */
export function planPptxLayers(objects: readonly DocObject[]): PptxLayer[] {
  const visible = objects.filter(
    (o) =>
      o.visible !== false && !(o.isPlaceholder === true && o.type !== "image"),
  );
  if (
    visible.some(
      (o) =>
        o.globalCompositeOperation &&
        o.globalCompositeOperation !== "source-over",
    )
  )
    return [{ kind: "raster", objects: visible }];
  const layers: PptxLayer[] = [];
  for (const object of visible) {
    const native = nativeLayer(object);
    if (native) layers.push(native);
    else {
      const last = layers.at(-1);
      if (last?.kind === "raster") last.objects.push(object);
      else layers.push({ kind: "raster", objects: [object] });
    }
  }
  return layers;
}
