import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import {
  duplicateDocument,
  parseDocument,
  imageSourceSchema,
} from "@/core/document/schema";
import {
  assetSchema,
  brandKitSchema,
  projectSchema,
  type Asset,
  type BrandKit,
  type Project,
} from "@/types/studio";
import type { StudioServices } from "@/services/contracts/studio-service";
import { ServiceError } from "@/services/errors/service-error";
import { templates } from "./catalog";
import { paginate } from "./project-utils";
import { createFontService } from "./font-service";
import { deleteProjectAuxiliaryData, deleteWorkspaceStorage } from "../repositories/storage-cleanup";

interface StudioDB extends DBSchema {
  projects: { key: string; value: Project };
  revisions: { key: string; value: Project; indexes: { projectId: string } };
  assets: { key: string; value: Asset };
  brandKits: { key: string; value: BrandKit };
  meta: { key: string; value: boolean };
}

export function createLocalServices(
  databaseName = "gtf-studio-v1",
): StudioServices {
  let connection: Promise<IDBPDatabase<StudioDB>> | undefined;
  const database = () => {
    connection ??= openDB<StudioDB>(databaseName, 1, {
      upgrade(db) {
        db.createObjectStore("projects", { keyPath: "id" });
        const revisions = db.createObjectStore("revisions");
        revisions.createIndex("projectId", "id");
        db.createObjectStore("assets", { keyPath: "id" });
        db.createObjectStore("brandKits", { keyPath: "id" });
        db.createObjectStore("meta");
      },
      blocked() {
        connection = undefined;
      },
      blocking() {
        void connection?.then((db) => db.close());
        connection = undefined;
      },
      terminated() {
        connection = undefined;
      },
    })
      .then(async (db) => {
        const transaction = db.transaction(
          ["projects", "meta", "brandKits"],
          "readwrite",
        );
        if (!(await transaction.objectStore("meta").get("seeded"))) {
          for (const [index, template] of templates.slice(0, 3).entries()) {
            const timestamp = new Date(
              Date.UTC(2026, 9, 12 - index, 10),
            ).toISOString();
            await transaction
              .objectStore("projects")
              .put({
                id: `welcome-${template.id}`,
                title: template.title,
                kind: "design",
                status: "active",
                revision: 0,
                createdAt: timestamp,
                updatedAt: timestamp,
                document: duplicateDocument(template.document),
              });
          }
          await transaction
            .objectStore("brandKits")
            .put({
              id: "gtf",
              name: "GTF Studio",
              colors: ["#29afe4", "#e24397", "#17212b", "#ffffff"],
              font: "Manrope",
            });
          await transaction.objectStore("meta").put(true, "seeded");
        }
        await transaction.done;
        return db;
      })
      .catch(() => {
        connection = undefined;
        throw new ServiceError(
          "Browser storage is unavailable. Enable storage for this site and retry.",
          "STORAGE",
        );
      });
    return connection;
  };
  const get = async (id: string, signal?: AbortSignal) => {
    signal?.throwIfAborted();
    const record = await (await database()).get("projects", id);
    signal?.throwIfAborted();
    if (!record)
      throw new ServiceError(
        "This project could not be found on this device.",
        "NOT_FOUND",
      );
    const parsed = projectSchema.safeParse(record);
    if (!parsed.success)
      throw new ServiceError(
        "This document could not be read. Restore a downloaded backup or a previous revision.",
        "VALIDATION",
      );
    return parsed.data;
  };
  const create: StudioServices["projects"]["create"] = async (input) => {
    const now = new Date().toISOString();
    const project = projectSchema.parse({
      ...input,
      title: input.title.trim() || "Untitled design",
      id: crypto.randomUUID(),
      status: "active",
      createdAt: now,
      updatedAt: now,
      revision: 0,
      document: duplicateDocument(parseDocument(input.document)),
    });
    await (await database()).put("projects", project);
    return project;
  };
  return {
    async resetWorkspace() {
      const db = await connection;
      db?.close();
      connection = undefined;
      await deleteWorkspaceStorage(databaseName);
    },
    fonts: createFontService(),
    projects: {
      get,
      create,
      async list(query, signal) {
        signal?.throwIfAborted();
        const records = await (await database()).getAll("projects");
        signal?.throwIfAborted();
        const projects = records.map((record) => projectSchema.parse(record));
        return paginate(projects, query);
      },
      async update(id, input) {
        const transaction = (await database()).transaction(
          "projects",
          "readwrite",
        );
        const existing = await transaction.store.get(id);
        if (!existing)
          throw new ServiceError("Project not found.", "NOT_FOUND");
        const project = projectSchema.parse({
          ...existing,
          ...input,
          updatedAt: new Date().toISOString(),
        });
        await transaction.store.put(project);
        await transaction.done;
        return project;
      },
      async duplicate(id) {
        const original = await get(id);
        return create({
          title: `${original.title.slice(0, 110)} (copy)`,
          kind: original.kind,
          document: original.document,
        });
      },
      async delete(id) {
        const transaction = (await database()).transaction(
          ["projects", "revisions"],
          "readwrite",
        );
        await transaction.objectStore("projects").delete(id);
        for (const key of await transaction
          .objectStore("revisions")
          .index("projectId")
          .getAllKeys(id))
          await transaction.objectStore("revisions").delete(key);
        await transaction.done;
        await deleteProjectAuxiliaryData(id);
      },
    },
    documents: {
      async save(id, document, expectedRevision) {
        const parsed = parseDocument(document);
        try {
          const transaction = (await database()).transaction(
            ["projects", "revisions"],
            "readwrite",
          );
          const existing = await transaction.objectStore("projects").get(id);
          if (!existing)
            throw new ServiceError(
              "The project was deleted. Download a backup to keep this work.",
              "NOT_FOUND",
            );
          if (existing.revision !== expectedRevision)
            throw new ServiceError(
              "A newer version was saved in another tab. Download your backup before reloading.",
              "CONFLICT",
            );
          const next = {
            ...existing,
            document: parsed,
            revision: existing.revision + 1,
            updatedAt: new Date().toISOString(),
          };
          await transaction
            .objectStore("revisions")
            .put(
              existing,
              `${id}:${String(existing.revision).padStart(10, "0")}`,
            );
          const keys = await transaction
            .objectStore("revisions")
            .index("projectId")
            .getAllKeys(id);
          for (const key of keys.slice(0, Math.max(0, keys.length - 8)))
            await transaction.objectStore("revisions").delete(key);
          await transaction.objectStore("projects").put(next);
          await transaction.done;
          return next;
        } catch (error) {
          if (error instanceof ServiceError) throw error;
          throw new ServiceError(
            "Your changes could not be saved. Storage may be full. Download a backup, free some space, and retry.",
            "STORAGE",
          );
        }
      },
      async revisions(id) {
        return (
          await (await database()).getAllFromIndex("revisions", "projectId", id)
        ).sort((a, b) => b.revision - a.revision);
      },
    },
    assets: {
      async list() {
        return (await (await database()).getAll("assets")).map((asset) =>
          assetSchema.parse(asset),
        );
      },
      async save(asset) {
        imageSourceSchema.parse(asset.src);
        await (await database()).put("assets", assetSchema.parse(asset));
      },
      async delete(id) {
        await (await database()).delete("assets", id);
      },
    },
    brandKits: {
      async list() {
        return (await (await database()).getAll("brandKits")).map((kit) =>
          brandKitSchema.parse(kit),
        );
      },
      async save(kit) {
        await (await database()).put("brandKits", brandKitSchema.parse(kit));
      },
      async delete(id) {
        await (await database()).delete("brandKits", id);
      },
    },
  };
}
