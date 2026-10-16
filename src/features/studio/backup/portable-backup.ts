import { z } from "zod";
import { studioDocumentSchema } from "@/core/document/studio-schema";
import type { DoryDocument } from "@/vendor/doory/types/document";
import type { FontFamily } from "@/services/contracts/font-service";
import { blobDataUrl } from "../document-bridge";

export const MAX_BACKUP_BYTES = 64 * 1024 * 1024;
export const MAX_RESOURCE_BYTES = 25 * 1024 * 1024;
const MAX_EMBEDDED_BYTES = 40 * 1024 * 1024;
const assetMime =
  /^(image\/(png|jpeg|webp|gif|avif|svg\+xml)|audio\/(ogg|mpeg|wav|x-wav|webm|aac|mp4))$/;
const dataSchema = z
  .string()
  .max(Math.ceil((MAX_RESOURCE_BYTES * 4) / 3) + 100);
const backupSchema = z
  .object({
    format: z.literal("gtf-studio-backup"),
    version: z.literal(1),
    title: z.string().trim().min(1).max(200),
    document: studioDocumentSchema,
    assets: z
      .array(
        z
          .object({
            source: z.string().max(12_000_000),
            name: z.string().max(120),
            data: dataSchema,
          })
          .strict(),
      )
      .max(256),
    fonts: z
      .array(
        z
          .object({
            family: z.string().regex(/^[\p{L}\p{N} _-]{1,90}$/u),
            extension: z.enum(["ttf", "otf", "woff", "woff2"]),
            data: dataSchema,
          })
          .strict(),
      )
      .max(64),
  })
  .strict();

export type StudioBackup = z.infer<typeof backupSchema>;
export interface BackupResources {
  readAsset(source: string): Promise<Blob>;
  writeAsset(blob: Blob, name: string): Promise<{ id: string; url: string }>;
  removeAsset(id: string): Promise<void>;
  listFonts(): Promise<FontFamily[]>;
  readFont(font: FontFamily): Promise<Blob>;
  writeFont(file: File): Promise<{ id: string; family: string }>;
  removeFont(id: string): Promise<void>;
}

function visit(
  value: unknown,
  fn: (record: { [key: string]: unknown }, key: string, text: string) => void,
): void {
  if (!value || typeof value !== "object") return;
  const stack: object[] = [value];
  while (stack.length) {
    const record = stack.pop()! as { [key: string]: unknown };
    for (const [key, child] of Object.entries(record)) {
      if (typeof child === "string") fn(record, key, child);
      else if (child && typeof child === "object") stack.push(child);
    }
  }
}

function assetSources(document: DoryDocument): Set<string> {
  const sources = new Set<string>();
  visit(document, (_record, key, value) => {
    if (
      value &&
      (["src", "source", "docSrc"].includes(key) ||
        (key === "url" &&
          (value.startsWith("idb://") || value.startsWith("blob:"))))
    ) {
      if (!/^(idb:\/\/|\/[^/]|data:image\/)/.test(value))
        throw new Error(
          "This design contains a remote or temporary asset. Upload a local copy before making a portable backup.",
        );
      sources.add(value);
    }
  });
  return sources;
}

const primaryFamily = (value: string) =>
  value
    .split(",")[0]
    .trim()
    .replace(/^['"]|['"]$/g, "");
function usedFamilies(document: DoryDocument): Set<string> {
  const names = new Set<string>();
  visit(document, (_record, key, value) => {
    if (key === "fontFamily") names.add(primaryFamily(value).toLowerCase());
  });
  return names;
}

function readData(data: string): {
  mime: string;
  base64: string;
  size: number;
} {
  const match = /^data:([a-z0-9.+/-]+);base64,([A-Za-z0-9+/]*={0,2})$/.exec(
    data,
  );
  if (!match || !match[2] || match[2].length % 4 !== 0)
    throw new Error("A backup resource has invalid data encoding.");
  const size =
    (match[2].length / 4) * 3 -
    (match[2].endsWith("==") ? 2 : match[2].endsWith("=") ? 1 : 0);
  if (size > MAX_RESOURCE_BYTES)
    throw new Error("A backup resource exceeds the 25 MB limit.");
  return { mime: match[1], base64: match[2], size };
}

function fontExtension(data: string): "ttf" | "otf" | "woff" | "woff2" {
  const header = atob(readData(data).base64.slice(0, 8)).slice(0, 4);
  if (header === "OTTO") return "otf";
  if (header === "wOFF") return "woff";
  if (header === "wOF2") return "woff2";
  if (header === "\x00\x01\x00\x00" || header === "true") return "ttf";
  throw new Error("A backup font is not a supported font file.");
}

function resourceBlob(data: string): Blob {
  const { mime, base64 } = readData(data);
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

function validateBackup(value: unknown): StudioBackup {
  const backup = backupSchema.parse(value);
  const sources = assetSources(backup.document);
  const seen = new Set<string>(),
    fonts = new Set<string>();
  let bytes = 0;
  for (const asset of backup.assets) {
    const resource = readData(asset.data);
    if (!assetMime.test(resource.mime))
      throw new Error("A backup asset has an unsupported media type.");
    if (!sources.has(asset.source) || seen.has(asset.source))
      throw new Error("The backup contains an unused or duplicate asset.");
    seen.add(asset.source);
    bytes += resource.size;
  }
  for (const source of sources)
    if (!seen.has(source))
      throw new Error("A local asset is missing from this backup.");
  const used = usedFamilies(backup.document);
  for (const font of backup.fonts) {
    const key = font.family.toLowerCase();
    if (!used.has(key) || fonts.has(key))
      throw new Error("The backup contains an unused or duplicate font.");
    if (
      fontExtension(font.data) !== font.extension ||
      readData(font.data).size > 20 * 1024 * 1024
    )
      throw new Error("A backup font is invalid or exceeds the 20 MB limit.");
    fonts.add(key);
    bytes += readData(font.data).size;
  }
  if (bytes > MAX_EMBEDDED_BYTES)
    throw new Error("Embedded resources exceed the 40 MB backup limit.");
  return backup;
}

export function parseStudioBackup(text: string): StudioBackup {
  if (
    text.length > MAX_BACKUP_BYTES ||
    new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES
  )
    throw new Error("Choose a GTF backup smaller than 64 MB.");
  try {
    return validateBackup(JSON.parse(text));
  } catch (error) {
    throw new Error(
      error instanceof SyntaxError
        ? "This file is not a valid GTF backup."
        : error instanceof Error
          ? error.message
          : "The backup could not be read.",
    );
  }
}

export async function createStudioBackup(
  document: DoryDocument,
  title: string,
  resources: BackupResources,
): Promise<StudioBackup> {
  const validated = studioDocumentSchema.parse(document);
  const sources = assetSources(validated);
  if (sources.size > 256)
    throw new Error("Portable backups support up to 256 media resources.");
  const assets: StudioBackup["assets"] = [];
  const fonts: StudioBackup["fonts"] = [];
  let total = 0;
  for (const source of sources) {
    const blob = await resources.readAsset(source);
    total += blob.size;
    if (blob.size > MAX_RESOURCE_BYTES || total > MAX_EMBEDDED_BYTES)
      throw new Error("This design exceeds the portable backup media limit.");
    assets.push({
      source,
      name: `Restored asset ${assets.length + 1}`,
      data: await blobDataUrl(blob),
    });
  }
  const families = usedFamilies(validated);
  const uploaded = (await resources.listFonts()).filter((font) =>
    families.has(font.family.toLowerCase()),
  );
  if (uploaded.length > 64)
    throw new Error("Portable backups support up to 64 uploaded fonts.");
  for (const font of uploaded) {
    const blob = await resources.readFont(font);
    total += blob.size;
    if (blob.size > 20 * 1024 * 1024 || total > MAX_EMBEDDED_BYTES)
      throw new Error("This design exceeds the portable backup font limit.");
    const data = await blobDataUrl(
      blob.type ? blob : new Blob([blob], { type: "application/octet-stream" }),
    );
    fonts.push({ family: font.family, extension: fontExtension(data), data });
  }
  const backup = validateBackup({
    format: "gtf-studio-backup",
    version: 1,
    title: title.trim().slice(0, 200) || "GTF design",
    document: validated,
    assets,
    fonts,
  });
  if (new Blob([JSON.stringify(backup)]).size > MAX_BACKUP_BYTES)
    throw new Error("This design exceeds the 64 MB portable backup limit.");
  return backup;
}

export async function restoreStudioBackup<T>(
  input: StudioBackup,
  resources: BackupResources,
  createProject: (document: DoryDocument, title: string) => Promise<T>,
): Promise<T> {
  const backup = validateBackup(input);
  const document = structuredClone(backup.document);
  const assets: string[] = [],
    fonts: string[] = [];
  const replacements = new Map<string, string>(),
    assetIds = new Map<string, string>(),
    families = new Map<string, string>();
  try {
    for (const asset of backup.assets) {
      const saved = await resources.writeAsset(
        resourceBlob(asset.data),
        asset.name,
      );
      assets.push(saved.id);
      replacements.set(asset.source, saved.url);
      if (asset.source.startsWith("idb://"))
        assetIds.set(asset.source.slice(6), saved.id);
    }
    for (const font of backup.fonts) {
      const name = `${font.family.slice(0, 60)} ${crypto.randomUUID().slice(0, 8)}.${font.extension}`;
      const saved = await resources.writeFont(
        new File([resourceBlob(font.data)], name),
      );
      fonts.push(saved.id);
      families.set(font.family.toLowerCase(), saved.family);
    }
    visit(document, (record, key, value) => {
      if (
        ["src", "source", "docSrc", "url"].includes(key) &&
        replacements.has(value)
      )
        record[key] = replacements.get(value)!;
      else if (key === "assetId" && assetIds.has(value))
        record[key] = assetIds.get(value)!;
      else if (key === "fontFamily") {
        const family = families.get(primaryFamily(value).toLowerCase());
        if (family)
          record[key] =
            family +
            (value.includes(",") ? value.slice(value.indexOf(",")) : "");
      }
    });
    return await createProject(
      studioDocumentSchema.parse(document),
      backup.title,
    );
  } catch (error) {
    const cleanup = await Promise.allSettled([
      ...assets.map((id) => resources.removeAsset(id)),
      ...fonts.map((id) => resources.removeFont(id)),
    ]);
    if (cleanup.some((result) => result.status === "rejected"))
      throw new Error(
        "The backup could not be restored and some imported resources could not be removed. Review your uploads before retrying.",
        { cause: error },
      );
    throw error;
  }
}
