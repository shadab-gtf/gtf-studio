import { z } from "zod";
import {
  documentSchema,
  pageSchema,
  type CreativeDocument,
} from "@/core/document/schema";

export const projectSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(120),
  kind: z.enum(["design", "presentation"]),
  status: z.enum(["active", "archived", "trashed"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  revision: z.number().int().nonnegative(),
  document: documentSchema,
});
export type Project = z.infer<typeof projectSchema>;
export const summarySchema = projectSchema
  .omit({ document: true })
  .extend({
    width: z.number(),
    height: z.number(),
    preview: pageSchema,
    pageCount: z.number(),
  });
export type ProjectSummary = z.infer<typeof summarySchema>;
export interface CreateProjectInput {
  title: string;
  kind: Project["kind"];
  document: CreativeDocument;
}
export interface ProjectQuery {
  search?: string;
  kind?: Project["kind"];
  status?: Project["status"];
  cursor?: string;
  limit?: number;
}
export interface PaginatedResult<T> {
  items: T[];
  nextCursor: string | null;
}
export interface Template {
  id: string;
  title: string;
  category:
    | "Social"
    | "Presentation"
    | "Poster"
    | "Story"
    | "Banner"
    | "Logo"
    | "Resume"
    | "Invitation"
    | "Flyer"
    | "Business card"
    | "Portrait post"
    | "Video thumbnail"
    | "Landscape video"
    | "Document"
    | "Letter"
    | "Book cover"
    | "Whiteboard"
    | "Brainstorm"
    | "Profile picture"
    | "Brochure"
    | "Invoice";
  collection?: "reference";
  formatId?: string;
  sizeLabel?: string;
  description: string;
  document: CreativeDocument;
}
export interface Format {
  id: string;
  title: string;
  description: string;
  width: number;
  height: number;
  kind: Project["kind"];
  color: string;
  printDpi?: number;
}
export interface StudioCatalog {
  templates: Template[];
  formats: Format[];
}
export const assetSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  src: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
  createdAt: z.string().datetime(),
});
export type Asset = z.infer<typeof assetSchema>;
export const brandKitSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  colors: z
    .array(z.string().regex(/^#[\da-f]{6}$/i))
    .min(1)
    .max(12),
  font: z.enum(["Manrope", "Georgia", "Arial"]),
});
export type BrandKit = z.infer<typeof brandKitSchema>;
