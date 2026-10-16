import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createLocalServices } from "@/services/mocks/local-services";
import { createDocument } from "@/core/document/schema";
import { apiFetch } from "@/services/http/api-fetch";
afterEach(() => vi.unstubAllGlobals());
describe("local data persistence", () => {
  it("persists documents, detects concurrent saves, retains revisions, and isolates databases", async () => {
    const name = crypto.randomUUID();
    const first = createLocalServices(name);
    const project = await first.projects.create({
      title: "A real draft",
      kind: "design",
      document: createDocument(),
    });
    const second = createLocalServices(name);
    expect((await second.projects.get(project.id)).title).toBe("A real draft");
    const changed = { ...project.document, width: 1200 };
    const saved = await first.documents.save(project.id, changed, 0);
    expect(saved.revision).toBe(1);
    expect((await second.projects.get(project.id)).document.width).toBe(1200);
    await expect(
      second.documents.save(project.id, project.document, 0),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    expect(
      (await first.documents.revisions(project.id))[0].document.width,
    ).toBe(1080);
    const isolated = createLocalServices(crypto.randomUUID());
    await expect(isolated.projects.get(project.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
  it("honors pagination, cancellation, trash/restore, duplicate and permanent deletion", async () => {
    const service = createLocalServices(crypto.randomUUID());
    const one = await service.projects.create({
      title: "Unique title",
      kind: "design",
      document: createDocument(),
    });
    const copy = await service.projects.duplicate(one.id);
    expect(copy.document.pages[0].id).not.toBe(one.document.pages[0].id);
    const page = await service.projects.list({ search: "Unique", limit: 1 });
    expect(page.items).toHaveLength(1);
    expect(page.nextCursor).not.toBeNull();
    expect(
      (
        await service.projects.list({
          search: "Unique",
          limit: 1,
          cursor: page.nextCursor!,
        })
      ).items,
    ).toHaveLength(1);
    await service.projects.update(one.id, { status: "trashed" });
    expect(
      (await service.projects.list({ status: "trashed" })).items.map(
        (p) => p.id,
      ),
    ).toContain(one.id);
    await service.projects.update(one.id, { status: "active" });
    const controller = new AbortController();
    controller.abort();
    await expect(
      service.projects.list({}, controller.signal),
    ).rejects.toThrow();
    await service.projects.delete(one.id);
    await expect(service.projects.get(one.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
describe("HTTP boundary", () => {
  it("validates payloads and 204 responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(JSON.stringify({ title: 3 })))
        .mockResolvedValueOnce(new Response(null, { status: 204 }))
        .mockResolvedValueOnce(new Response("not json")),
    );
    await expect(
      apiFetch(
        "https://example.test",
        "/projects",
        z.object({ title: z.string() }),
      ),
    ).rejects.toMatchObject({ code: "VALIDATION" });
    await expect(
      apiFetch("https://example.test", "/projects/1", z.undefined(), {
        method: "DELETE",
      }),
    ).resolves.toBeUndefined();
    await expect(
      apiFetch("https://example.test", "/projects", z.unknown()),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });
  it("maps conflicts and network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 409 }))
        .mockRejectedValueOnce(new TypeError("Failed to fetch")),
    );
    await expect(
      apiFetch("https://example.test", "/projects", z.unknown()),
    ).rejects.toMatchObject({ code: "CONFLICT" });
    await expect(
      apiFetch("https://example.test", "/projects", z.unknown()),
    ).rejects.toMatchObject({ code: "NETWORK" });
  });
});
