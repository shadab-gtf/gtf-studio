import { z } from "zod";
import { studioDocumentSchema } from "./studio-schema";

const color = z.string().regex(/^#[\da-f]{6}$/i, "Use a six-digit hex color");
const bounded = z.number().finite().min(-20000).max(20000);
const base = {
  id: z.string().min(1).max(100),
  name: z.string().max(120),
  x: bounded,
  y: bounded,
  width: z.number().finite().min(1).max(16000),
  height: z.number().finite().min(1).max(16000),
  rotation: z.number().finite().min(-3600).max(3600),
  opacity: z.number().min(0).max(1),
  locked: z.boolean(),
  hidden: z.boolean(),
  groupId: z.string().max(100).optional(),
};

export const imageSourceSchema = z
  .string()
  .max(12_000_000)
  .refine(
    (source) =>
      /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(source) ||
      /^\/images\/[a-zA-Z0-9._/-]+$/.test(source),
    "Only local PNG, JPEG, WebP and GIF images are supported",
  );

export const elementSchema = z.discriminatedUnion("type", [
  z.object({
    ...base,
    type: z.literal("text"),
    text: z.string().max(10000),
    fill: color,
    fontSize: z.number().min(6).max(1000),
    fontFamily: z
      .string()
      .min(1)
      .max(150)
      .regex(/^[\p{L}\p{N} _-]+$/u),
    fontWeight: z.enum(["normal", "bold"]),
    fontRef: z.string().max(180).optional(),
    fontStyle: z.enum(["normal", "italic"]).optional(),
    fontWeightValue: z.number().int().min(100).max(900).optional(),
    align: z.enum(["left", "center", "right"]),
    lineHeight: z.number().min(0.8).max(3),
  }),
  z.object({
    ...base,
    type: z.literal("shape"),
    shape: z.enum(["rectangle", "ellipse", "triangle", "star"]),
    fill: color,
    cornerRadius: z.number().min(0).max(2000),
  }),
  z.object({
    ...base,
    type: z.literal("image"),
    src: imageSourceSchema,
    alt: z.string().max(300),
    flipX: z.boolean().optional(),
    flipY: z.boolean().optional(),
  }),
  z.object({
    ...base,
    type: z.literal("path"),
    points: z
      .array(bounded)
      .min(4)
      .max(20000)
      .refine((points) => points.length % 2 === 0),
    fill: color,
    strokeWidth: z.number().min(1).max(200),
    viewWidth: z.number().min(1).max(16000),
    viewHeight: z.number().min(1).max(16000),
  }),
]);

export const pageSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(120),
  background: color,
  notes: z.string().max(10000),
  transition: z.enum(["none", "fade", "slide"]),
  elements: z.array(elementSchema).max(1000),
});

export const documentSchema = z
  .object({
    schemaVersion: z.literal(1),
    width: z.number().int().min(64).max(8000),
    height: z.number().int().min(64).max(8000),
    pages: z.array(pageSchema).min(1).max(100),
    studio: studioDocumentSchema.optional(),
  })
  .superRefine((document, context) => {
    const ids = document.pages.flatMap((page) => [
      page.id,
      ...page.elements.map((element) => element.id),
    ]);
    if (new Set(ids).size !== ids.length)
      context.addIssue({
        code: "custom",
        message: "Pages and elements must have unique identifiers",
      });
  });

export type CreativeDocument = z.infer<typeof documentSchema>;
export type DocumentPage = z.infer<typeof pageSchema>;
export type CanvasElement = z.infer<typeof elementSchema>;
export type TextElement = Extract<CanvasElement, { type: "text" }>;
export type ShapeElement = Extract<CanvasElement, { type: "shape" }>;
export type ImageElement = Extract<CanvasElement, { type: "image" }>;

export function createDocument(width = 1080, height = 1080): CreativeDocument {
  return {
    schemaVersion: 1,
    width,
    height,
    pages: [
      {
        id: crypto.randomUUID(),
        name: "Page 1",
        background: "#ffffff",
        notes: "",
        transition: "none",
        elements: [],
      },
    ],
  };
}

export function parseDocument(value: unknown): CreativeDocument {
  return documentSchema.parse(value);
}

export function duplicateDocument(
  document: CreativeDocument,
): CreativeDocument {
  const groups = new Map<string, string>();
  return {
    ...document,
    pages: document.pages.map((page) => ({
      ...page,
      id: crypto.randomUUID(),
      elements: page.elements.map((element) => {
        if (element.groupId && !groups.has(element.groupId))
          groups.set(element.groupId, crypto.randomUUID());
        return {
          ...element,
          id: crypto.randomUUID(),
          groupId: element.groupId ? groups.get(element.groupId) : undefined,
        };
      }),
    })),
  };
}
