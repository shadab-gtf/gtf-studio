import { z } from "zod";
import {
  assetSchema,
  brandKitSchema,
  projectSchema,
  summarySchema,
} from "@/types/studio";
import type { StudioServices } from "@/services/contracts/studio-service";
import { apiFetch } from "./api-fetch";
import { createFontService } from "../mocks/font-service";

export function createHttpServices(baseUrl: string): StudioServices {
  const request = <T>(path: string, schema: z.ZodType<T>, init?: RequestInit) =>
    apiFetch(baseUrl, path, schema, init);
  const projectPath = (id: string) => `/projects/${encodeURIComponent(id)}`;
  return {
    async resetWorkspace() {
      throw new Error("Workspace reset is available in local mode. Remote data must be managed by its configured service.");
    },
    fonts: createFontService(),
    projects: {
      list(query = {}, signal) {
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(query))
          if (value !== undefined) params.set(key, String(value));
        return request(
          `/projects?${params}`,
          z.object({
            items: z.array(summarySchema),
            nextCursor: z.string().nullable(),
          }),
          { signal },
        );
      },
      get: (id, signal) => request(projectPath(id), projectSchema, { signal }),
      create: (input) =>
        request("/projects", projectSchema, {
          method: "POST",
          body: JSON.stringify(input),
        }),
      update: (id, input) =>
        request(projectPath(id), projectSchema, {
          method: "PATCH",
          body: JSON.stringify(input),
        }),
      duplicate: (id) =>
        request(`${projectPath(id)}/duplicate`, projectSchema, {
          method: "POST",
        }),
      delete: (id) =>
        request(projectPath(id), z.undefined(), { method: "DELETE" }),
    },
    documents: {
      save: (id, document, expectedRevision) =>
        request(`${projectPath(id)}/document`, projectSchema, {
          method: "PUT",
          body: JSON.stringify({ document, expectedRevision }),
        }),
      revisions: (id) =>
        request(`${projectPath(id)}/revisions`, z.array(projectSchema)),
    },
    assets: {
      list: () => request("/assets", z.array(assetSchema)),
      save: (asset) =>
        request(`/assets/${encodeURIComponent(asset.id)}`, z.undefined(), {
          method: "PUT",
          body: JSON.stringify(asset),
        }),
      delete: (id) =>
        request(`/assets/${encodeURIComponent(id)}`, z.undefined(), {
          method: "DELETE",
        }),
    },
    brandKits: {
      list: () => request("/brand-kits", z.array(brandKitSchema)),
      save: (kit) =>
        request(`/brand-kits/${encodeURIComponent(kit.id)}`, z.undefined(), {
          method: "PUT",
          body: JSON.stringify(kit),
        }),
      delete: (id) =>
        request(`/brand-kits/${encodeURIComponent(id)}`, z.undefined(), {
          method: "DELETE",
        }),
    },
  };
}
