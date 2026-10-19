import type {
  DocObject,
  DoryDocument,
} from "../../src/vendor/doory/types/document";

export interface DesignSpec {
  id: string;
  title: string;
  category: string;
  formatId: string;
  width: number;
  height: number;
  sizeLabel: string;
}
export interface Artwork extends DesignSpec {
  document: DoryDocument;
}
export type Font =
  | "Manrope"
  | "Anton"
  | "Bebas Neue"
  | "Six Caps"
  | "League Gothic"
  | "League Spartan"
  | "Italiana"
  | "Bodoni Moda"
  | "Cormorant Garamond"
  | "DM Serif Display"
  | "Montserrat"
  | "Great Vibes"
  | "Allura"
  | "Caveat"
  | "Playfair Display"
  | "Archivo Black"
  | "Space Grotesk";
export interface TextStyle {
  weight?: number;
  align?: "left" | "center" | "right";
  tracking?: number;
  italic?: boolean;
  angle?: number;
  lineHeight?: number;
  opacity?: number;
}

/** Author in a 1000-unit-wide coordinate space; serialize at the real export dimensions. */
export class Artboard {
  readonly objects: DocObject[] = [];
  readonly scale: number;
  readonly h: number;
  constructor(
    readonly spec: DesignSpec,
    readonly background = "#ffffff",
  ) {
    this.scale = spec.width / 1000;
    this.h = spec.height / this.scale;
  }
  private add(type: string, values: Omit<DocObject, "id" | "type">): DocObject {
    const object: DocObject = {
      id: `${this.spec.id}-${this.objects.length + 1}`,
      type,
      originX: "left",
      originY: "top",
      visible: true,
      ...values,
    };
    this.objects.push(object);
    return object;
  }
  text(
    text: string,
    x: number,
    y: number,
    width: number,
    size: number,
    family: Font = "Manrope",
    fill = "#161616",
    style: TextStyle = {},
  ) {
    return this.add("textbox", {
      name: text.split("\n")[0],
      text,
      left: x * this.scale,
      top: y * this.scale,
      width: width * this.scale,
      fontSize: size * this.scale,
      fontFamily: family,
      fontWeight: style.weight ?? 400,
      fontStyle: style.italic ? "italic" : "normal",
      textAlign: style.align ?? "left",
      charSpacing: style.tracking ?? 0,
      lineHeight: style.lineHeight ?? 1.08,
      angle: style.angle ?? 0,
      opacity: style.opacity ?? 1,
      fill,
      splitByGrapheme: false,
    });
  }
  rect(
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    radius = 0,
    stroke?: string,
  ) {
    return this.add("rect", {
      left: x * this.scale,
      top: y * this.scale,
      width: w * this.scale,
      height: h * this.scale,
      fill,
      rx: radius * this.scale,
      ry: radius * this.scale,
      stroke,
      strokeWidth: stroke ? this.scale : 0,
    });
  }
  ellipse(
    x: number,
    y: number,
    w: number,
    h: number,
    fill: string,
    stroke?: string,
    sw = 1,
  ) {
    return this.add("ellipse", {
      left: x * this.scale,
      top: y * this.scale,
      width: w * this.scale,
      height: h * this.scale,
      rx: (w * this.scale) / 2,
      ry: (h * this.scale) / 2,
      fill,
      stroke,
      strokeWidth: stroke ? sw * this.scale : 0,
    });
  }
  line(x: number, y: number, x2: number, y2: number, color: string, width = 1) {
    const left = Math.min(x, x2),
      top = Math.min(y, y2);
    return this.add("line", {
      left: left * this.scale,
      top: top * this.scale,
      x1: (x - left) * this.scale,
      y1: (y - top) * this.scale,
      x2: (x2 - left) * this.scale,
      y2: (y2 - top) * this.scale,
      stroke: color,
      strokeWidth: width * this.scale,
    });
  }
  photo(
    name: string,
    x: number,
    y: number,
    w: number,
    h: number,
    options: {
      focusX?: number;
      focusY?: number;
      circle?: boolean;
      gray?: boolean;
    } = {},
  ) {
    return this.add("image", {
      name: `Photo — ${name}`,
      src: `/media/templates/editorial/${name}.webp`,
      docSrc: `/media/templates/editorial/${name}.webp`,
      left: x * this.scale,
      top: y * this.scale,
      width: w * this.scale,
      height: h * this.scale,
      authoringPhoto: true,
      focusX: options.focusX ?? 0.5,
      focusY: options.focusY ?? 0.5,
      maskShape: options.circle ? "circle" : undefined,
      filterSpecs: options.gray ? [{ type: "grayscale", value: 1 }] : undefined,
    });
  }
  polygon(points: number[][], fill: string, stroke?: string) {
    const minX = Math.min(...points.map((p) => p[0])),
      minY = Math.min(...points.map((p) => p[1]));
    return this.add("polygon", {
      left: minX * this.scale,
      top: minY * this.scale,
      points: points.map(([x, y]) => ({
        x: (x - minX) * this.scale,
        y: (y - minY) * this.scale,
      })),
      fill,
      stroke,
      strokeWidth: stroke ? this.scale : 0,
    });
  }
  star(x: number, y: number, r: number, fill: string, points = 8, inner = 0.4) {
    return this.polygon(
      Array.from({ length: points * 2 }, (_, i) => {
        const a = (i * Math.PI) / points - Math.PI / 2;
        const d = i % 2 ? r * inner : r;
        return [x + r + Math.cos(a) * d, y + r + Math.sin(a) * d];
      }),
      fill,
    );
  }
  footer(left = "WWW.REALLYGREATSITE.COM", right = "2026", color = "#222222") {
    this.text(left, 48, this.h - 51, 650, 12, "Manrope", color, {
      tracking: 80,
    });
    this.text(right, 770, this.h - 51, 180, 12, "Manrope", color, {
      align: "right",
    });
  }
  document(): DoryDocument {
    return {
      schemaVersion: 1,
      unit: "px",
      width: this.spec.width,
      height: this.spec.height,
      meta: {
        presetId: this.spec.formatId,
        ...(this.spec.sizeLabel.includes("300 dpi") ? { printDpi: 300 } : {}),
      },
      pages: [
        {
          id: `${this.spec.id}-page`,
          name: this.spec.title,
          background: { type: "solid", color: this.background },
          objects: this.objects,
          durationSec: 6,
        },
      ],
    };
  }
  finish(): Artwork {
    return { ...this.spec, document: this.document() };
  }
}

export const CATEGORIES = [
  ["Presentation", "presentation", 1920, 1080, "16:9 · 1920 × 1080 px"],
  ["Portrait post", "social-portrait", 1080, 1350, "4:5 · 1080 × 1350 px"],
  ["Poster", "poster", 3508, 4961, "A3 · 297 × 420 mm · 300 dpi"],
  ["Logo", "logo", 500, 500, "Square · 500 × 500 px"],
  [
    "Landscape video",
    "landscape-video",
    1920,
    1080,
    "Full HD · 1920 × 1080 px",
  ],
  ["Document", "a4", 2480, 3508, "A4 · 210 × 297 mm · 300 dpi"],
  ["Letter", "letter", 2550, 3300, "US Letter · 8.5 × 11 in · 300 dpi"],
  ["Flyer", "flyer-us", 2550, 3300, "US Letter · 8.5 × 11 in · 300 dpi"],
  ["Book cover", "book-cover", 1800, 2700, "6 × 9 in · front cover · 300 dpi"],
  ["Invitation", "invitation", 1500, 2100, "5 × 7 in · 300 dpi"],
  ["Whiteboard", "whiteboard", 1920, 1080, "16:9 board · 1920 × 1080 px"],
  ["Brainstorm", "brainstorm", 1920, 1080, "16:9 board · 1920 × 1080 px"],
  ["Profile picture", "profile-picture", 1080, 1080, "Square · 1080 × 1080 px"],
  ["Story", "story", 1080, 1920, "9:16 · 1080 × 1920 px"],
  ["Brochure", "brochure", 3300, 2550, "Trifold · 11 × 8.5 in · 300 dpi"],
  ["Invoice", "invoice", 2480, 3508, "A4 · 210 × 297 mm · 300 dpi"],
  ["Video thumbnail", "youtube", 1280, 720, "16:9 · 1280 × 720 px"],
] as const;
export function board(
  category: (typeof CATEGORIES)[number][0],
  slug: string,
  title: string,
  bg?: string,
): Artboard {
  const entry = CATEGORIES.find((item) => item[0] === category)!;
  return new Artboard(
    {
      id: `editorial-${slug}`,
      title,
      category,
      formatId: entry[1],
      width: entry[2],
      height: entry[3],
      sizeLabel: entry[4],
    },
    bg,
  );
}
export function paragraph(
  b: Artboard,
  text: string,
  x: number,
  y: number,
  w: number,
  size = 20,
  color = "#333333",
) {
  b.text(text, x, y, w, size, "Manrope", color, { lineHeight: 1.5 });
}
