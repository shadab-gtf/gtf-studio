import { z } from "zod";

export const fontSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  family: z.string(),
  weights: z.array(z.number()),
  styles: z.array(z.enum(["normal", "italic"])),
  subsets: z.array(z.string()),
  defSubset: z.string(),
  category: z.string(),
  license: z.string(),
  licenseUrl: z.string().url().optional(),
  source: z.string().url().optional(),
  author: z.string().optional(),
  provider: z.literal("fontlibrary").optional(),
  files: z
    .array(
      z.object({
        url: z
          .string()
          .url()
          .refine((value) =>
            value.startsWith("https://fontlibrary.org/assets/fonts/"),
          ),
        weight: z.number(),
        style: z.enum(["normal", "italic"]),
      }),
    )
    .optional(),
});
export type FontFamily = z.infer<typeof fontSchema>;
export interface FontChoice {
  id: string;
  family: string;
  weight: number;
  style: "normal" | "italic";
  subset: string;
}
export interface FontService {
  catalog(signal?: AbortSignal): Promise<FontFamily[]>;
  uploaded(): Promise<FontFamily[]>;
  upload(file: File, family?: string): Promise<FontFamily>;
  load(choice: FontChoice): Promise<string>;
  file(choice: FontChoice): Promise<Blob>;
  remove(id: string): Promise<void>;
  restore(reference: string): Promise<void>;
  clearUploads(): Promise<void>;
}
