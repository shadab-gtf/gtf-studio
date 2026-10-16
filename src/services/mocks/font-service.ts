import { openDB, type DBSchema } from "idb";
import { z } from "zod";
import { FONT_DATABASE } from "../repositories/storage-cleanup";
import {
  fontSchema,
  type FontChoice,
  type FontFamily,
  type FontService,
} from "@/services/contracts/font-service";

interface FontsDB extends DBSchema {
  uploads: { key: string; value: { font: FontFamily; bytes: ArrayBuffer } };
  cached: { key: string; value: { choice: FontChoice; bytes: ArrayBuffer } };
}
const referenceFor = (choice: FontChoice) =>
  [choice.id, choice.weight, choice.style, choice.subset].join("|");
export function createFontService(): FontService {
  const loaded = new Map<string, Promise<void>>();
  const database = () => {
    const connection = openDB<FontsDB>(FONT_DATABASE, 1, {
      upgrade(db) {
        db.createObjectStore("uploads");
        db.createObjectStore("cached");
      },
      blocking() { void connection.then(db => db.close()); },
    });
    return connection;
  };
  const read = async <T>(
    operation: (db: Awaited<ReturnType<typeof database>>) => Promise<T>,
  ): Promise<T> => {
    const db = await database();
    try {
      return await operation(db);
    } finally {
      db.close();
    }
  };
  let catalog: Promise<FontFamily[]> | undefined;
  const service: FontService = {
    async catalog(signal) {
      signal?.throwIfAborted();
      catalog ??= fetch("/fonts/catalog.json")
        .then(async (response) => {
          if (!response.ok)
            throw new Error("The font library could not load. Please retry.");
          return z.array(fontSchema).parse(await response.json());
        })
        .catch((error: unknown) => {
          catalog = undefined;
          throw error;
        });
      const result = await catalog;
      signal?.throwIfAborted();
      return result;
    },
    async uploaded() {
      return read(async (db) =>
        (await db.getAll("uploads")).map((record) => record.font),
      );
    },
    async upload(file, requestedFamily) {
      if (
        !/\.(ttf|otf|woff2?)$/i.test(file.name) ||
        file.size > 20 * 1024 * 1024
      )
        throw new Error(
          "Choose a TTF, OTF, WOFF, or WOFF2 font smaller than 20 MB.",
        );
      const bytes = await file.arrayBuffer();
      const header = Array.from(new Uint8Array(bytes.slice(0, 4)))
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
      if (
        !["00010000", "4f54544f", "774f4646", "774f4632", "74727565"].includes(
          header,
        )
      )
        throw new Error("This file does not contain a supported font.");
      const id = `upload-${crypto.randomUUID()}`;
      const cleanedFamily =
        (requestedFamily ?? file.name.replace(/\.[^.]+$/, ""))
          .replace(/[^\p{L}\p{N} _-]/gu, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 90);
      if (requestedFamily !== undefined && (!cleanedFamily || requestedFamily.length > 200))
        throw new Error("Enter a font family name of up to 200 characters using letters, numbers, spaces, hyphens, or underscores.");
      const family = cleanedFamily || "Uploaded font";
      const font: FontFamily = {
        id,
        family,
        weights: [400, 700],
        styles: ["normal", "italic"],
        subsets: ["custom"],
        defSubset: "custom",
        category: "uploaded",
        license: "User supplied",
      };
      const face = await new FontFace(family, bytes).load();
      document.fonts.add(face);
      await read((db) => db.put("uploads", { font, bytes }, id));
      return font;
    },
    async load(choice) {
      const reference = referenceFor(choice);
      let pending = loaded.get(reference);
      if (!pending) {
        pending = (async () => {
          const cached = await read((db) => db.get("cached", reference));
          let bytes = cached?.bytes;
          if (!bytes) {
            if (choice.id.startsWith("upload-")) {
              const upload = await read((db) => db.get("uploads", choice.id));
              if (!upload)
                throw new Error(
                  `Upload ${choice.family} again to use this font on this device.`,
                );
              bytes = upload.bytes;
            } else {
              const font = (await service.catalog()).find(
                (item) => item.id === choice.id,
              );
              if (
                !font ||
                !font.weights.includes(choice.weight) ||
                !font.styles.includes(choice.style) ||
                !font.subsets.includes(choice.subset)
              )
                throw new Error("This font style is unavailable.");
              const source =
                font.provider === "fontlibrary"
                  ? font.files?.find(
                      (file) =>
                        file.weight === choice.weight &&
                        file.style === choice.style,
                    )?.url
                  : `https://cdn.jsdelivr.net/fontsource/fonts/${font.id}@latest/${choice.subset}-${choice.weight}-${choice.style}.woff2`;
              if (!source)
                throw new Error(
                  "This combination of weight and style is unavailable. Choose another weight.",
                );
              const response = await fetch(source, {
                signal: AbortSignal.timeout(20000),
                referrerPolicy: "no-referrer",
                credentials: "omit",
              }).catch(() => {
                throw new Error(
                  "The font could not download. Check your connection and try Apply font again.",
                );
              });
              if (!response.ok)
                throw new Error(
                  "The font could not download. Check your connection and retry.",
                );
              bytes = await response.arrayBuffer();
              if (bytes.byteLength > 20 * 1024 * 1024)
                throw new Error("This font exceeds the 20 MB download limit.");
            }
          }
          const face = await new FontFace(choice.family, bytes, {
            weight: String(choice.weight),
            style: choice.style,
          }).load();
          document.fonts.add(face);
          if (!cached)
            await read((db) => db.put("cached", { choice, bytes }, reference));
        })().catch((error: unknown) => {
          loaded.delete(reference);
          throw error;
        });
        loaded.set(reference, pending);
      }
      await pending;
      return reference;
    },
    async file(choice) {
      const reference = await service.load(choice);
      const record = await read((db) => db.get("cached", reference));
      if (!record) throw new Error("The font file is unavailable.");
      return new Blob([record.bytes]);
    },
    async remove(id) {
      await read(async (db) => {
        await db.delete("uploads", id);
        for (const key of await db.getAllKeys("cached")) {
          if (key.startsWith(`${id}|`)) await db.delete("cached", key);
        }
      });
      for (const key of loaded.keys()) if (key.startsWith(`${id}|`)) loaded.delete(key);
    },
    async restore(reference) {
      const cached = await read((db) => db.get("cached", reference));
      if (cached) {
        await service.load(cached.choice);
        return;
      }
      const [id, weight, style, subset] = reference.split("|");
      const font = id.startsWith("upload-")
        ? (await service.uploaded()).find((item) => item.id === id)
        : (await service.catalog()).find((item) => item.id === id);
      if (!font)
        throw new Error(
          "A font used by this document is unavailable. Upload it again or choose a replacement.",
        );
      await service.load({
        id,
        family: font.family,
        weight: Number(weight),
        style: style === "italic" ? "italic" : "normal",
        subset,
      });
    },
    async clearUploads() {
      await read(async (db) => {
        await db.clear("uploads");
        await db.clear("cached");
      });
      loaded.clear();
    },
  };
  return service;
}
