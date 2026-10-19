import { z } from "zod";
import { studioDocumentSchema } from "@/core/document/studio-schema";
import { withStudioDocument } from "@/features/studio/document-bridge";
import type { Format, Template } from "@/types/studio";
import source from "./editorial-template-data.json";

const entrySchema = z.object({
  id: z.string().regex(/^editorial-[a-z0-9-]+$/),
  title: z.string(),
  category: z.enum([
    "Presentation",
    "Portrait post",
    "Poster",
    "Logo",
    "Landscape video",
    "Document",
    "Letter",
    "Flyer",
    "Book cover",
    "Invitation",
    "Whiteboard",
    "Brainstorm",
    "Profile picture",
    "Story",
    "Brochure",
    "Invoice",
    "Video thumbnail",
  ]),
  formatId: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sizeLabel: z.string(),
  collection: z.literal("reference"),
  document: studioDocumentSchema,
});
const collectionSchema = z.object({
  version: z.literal(1),
  templates: z.array(entrySchema).length(85),
});
const entries = collectionSchema.parse(source).templates;

/** The raster image is only a gallery thumbnail; the native document retains all editable layers. */
export function createEditorialTemplates(): Template[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    category: entry.category,
    collection: entry.collection,
    formatId: entry.formatId,
    sizeLabel: entry.sizeLabel,
    description: `${entry.sizeLabel}. Editable typography, photography and shapes. Reference-inspired layout with bundled free assets.`,
    document: withStudioDocument(
      entry.document,
      `/images/editorial-templates/${entry.id}.webp`,
    ),
  }));
}

export function editorialFormats(existing: readonly Format[]): Format[] {
  const known = new Set(existing.map((format) => format.id));
  const added: Format[] = [];
  for (const entry of entries) {
    if (known.has(entry.formatId)) continue;
    known.add(entry.formatId);
    added.push({
      id: entry.formatId,
      title: entry.category,
      description: entry.sizeLabel,
      width: entry.width,
      height: entry.height,
      ...(entry.document.meta?.printDpi
        ? { printDpi: entry.document.meta.printDpi }
        : {}),
      kind: entry.category === "Presentation" ? "presentation" : "design",
      color: "blue",
    });
  }
  return added;
}
