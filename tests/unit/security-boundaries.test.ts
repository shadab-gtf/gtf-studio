import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { Gradient, Group, Path, Rect, Shadow } from "fabric";
import { openDB } from "idb";
import { createLocalServices } from "@/services/mocks/local-services";
import { createDocument } from "@/core/document/schema";
import { studioDocumentSchema } from "@/core/document/studio-schema";
import { toStudioDocument } from "@/features/studio/document-bridge";
import { getMockCatalog } from "@/services/mocks/catalog";
import { createStudioEditorAdapter } from "@/services/repositories/studio-editor-adapter";
import { assertImageDimensions } from "@/features/assets/image-limits";
import { createFontService } from "@/services/mocks/font-service";
import { serializeObject } from "@/vendor/doory/editor/engine/serialization";

beforeEach(() => { vi.stubGlobal("indexedDB", new IDBFactory()); localStorage.clear(); });
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("untrusted studio documents", () => {
  it("accepts real Fabric serialization including layout, gradients, shadows and clip paths", () => {
    const rectangle = new Rect({ width: 200, height: 100, fill: new Gradient({ type: "linear", coords: { x1: 0, y1: 0, x2: 200, y2: 0 }, colorStops: [{ offset: 0, color: "#29afe4" }, { offset: 1, color: "#e24397" }] }), shadow: new Shadow({ color: "#000000", blur: 8, offsetX: 4, offsetY: 2 }), clipPath: new Rect({ width: 80, height: 80, inverted: false }) });
    const group = new Group([rectangle, new Path("M 0 0 L 100 0 L 100 100 Z")]);
    const document = toStudioDocument(createDocument());
    document.pages[0].objects = [serializeObject(group)];
    expect(studioDocumentSchema.parse(document)).toEqual(document);
  });

  it("rejects a gradient with no stops before it can replace a saved document", () => {
    const document = toStudioDocument(createDocument());
    expect(studioDocumentSchema.safeParse({ ...document, pages: [{ ...document.pages[0], background: { type: "gradient" } }] }).success).toBe(false);
  });

  it("rejects malformed nested text while preserving a valid grouped design", () => {
    const document = toStudioDocument(createDocument());
    const group = { id: "group", type: "group", objects: [{ id: "text", type: "textbox", text: "A real design", fontSize: 28, fontFamily: "Manrope", fill: "#17212b" }] };
    const valid = { ...document, pages: [{ ...document.pages[0], objects: [group] }] };
    expect(studioDocumentSchema.safeParse(valid).success).toBe(true);
    group.objects[0].fontSize = -10;
    expect(studioDocumentSchema.safeParse(valid).success).toBe(false);
  });

  it("preserves every bundled template and advanced engine properties", async () => {
    for (const template of (await getMockCatalog()).templates) {
      const document = toStudioDocument(template.document);
      expect(studioDocumentSchema.safeParse(document).success, template.title).toBe(true);
    }
    const document = toStudioDocument(createDocument());
    document.pages[0].background = { type: "gradient", kind: "linear", angle: 45, stops: [{ offset: 0, color: "#29afe4" }, { offset: 1, color: "#e24397" }] };
    document.pages[0].objects = [{ id: "group", type: "group", objects: [
      { id: "text", type: "itext", text: "مرحبا · Welcome", fontFamily: "Manrope", fontSize: 32, styles: [{ start: 0, end: 2, style: { fill: "#17212b" } }], effects: { shadow: { color: "rgba(0,0,0,0.2)", blur: 8, offsetX: 2, offsetY: 2 } }, animation: { enter: { preset: "fade", durationMs: 500, delayMs: 0, easing: "ease-out" } }, curveAmount: 20 },
      { id: "image", type: "image", src: "idb://photo", filters: [{ type: "brightness", value: .1 }], slot: { cx: 100, cy: 100, width: 80, height: 80, angle: 0, mask: "circle" }, customMetadata: { label: "retained" } },
      { id: "path", type: "path", path: [["M", 0, 0], ["C", 0, 20, 20, 20, 20, 0], ["Z"]] },
      { id: "qr", type: "image", qr: { text: "https://example.com", fg: "#000000", bg: "#ffffff" } },
    ] }];
    expect(studioDocumentSchema.parse(document)).toEqual(document);
  });

  it.each([
    { type: "image", src: "javascript:alert(1)" },
    { type: "image", src: "/\\evil.example/a.png" },
    { type: "rect", width: -1 },
    { type: "path", path: [["M", "M"]] },
    { type: "textbox", text: "hi", styles: [{ start: 0, end: 1, style: { fontSize: -20 } }] },
    { type: "rect", effects: { shadow: { color: "#000", blur: "invalid" } } },
    { type: "rect", render: "overrides a Fabric method" },
    { type: "Brightness", brightness: 1 },
  ])("rejects unsafe or malformed object fields: %j", object => {
    const document = toStudioDocument(createDocument());
    document.pages[0].objects = [{ id: "bad", ...object }];
    expect(studioDocumentSchema.safeParse(document).success).toBe(false);
  });
});

describe("private document deletion", () => {
  it("deleting a basic project does not prevent the advanced database from initializing later", async () => {
    const services = createLocalServices(crypto.randomUUID());
    const first = await services.projects.create({ title: "Basic", kind: "design", document: createDocument() });
    await services.projects.delete(first.id);
    const second = await services.projects.create({ title: "Advanced", kind: "design", document: createDocument() });
    const editor = createStudioEditorAdapter(second, await getMockCatalog(), services);
    await expect(editor.adapter.services.comments!.create({ body: "Works after deletion" })).resolves.toMatchObject({ body: "Works after deletion" });
    editor.dispose();
  });

  it("removes advanced comments and full versions of only the deleted project", async () => {
    const services = createLocalServices(crypto.randomUUID());
    const project = await services.projects.create({ title: "Private", kind: "design", document: createDocument() });
    const db = await openDB("gtf-studio-editor-v1", 1, { upgrade(database) {
      database.createObjectStore("comments", { keyPath: "comment.id" }).createIndex("projectId", "projectId");
      database.createObjectStore("versions", { keyPath: "summary.id" }).createIndex("projectId", "projectId");
    } });
    await db.put("comments", { projectId: project.id, comment: { id: "private-comment", body: "Private note" } });
    await db.put("versions", { projectId: project.id, summary: { id: "private-version" }, document: project.document });
    await db.put("versions", { projectId: "other-project", summary: { id: "other-version" }, document: project.document });
    await services.projects.delete(project.id);
    expect(await db.get("comments", "private-comment")).toBeUndefined();
    expect(await db.get("versions", "private-version")).toBeUndefined();
    expect(await db.get("versions", "other-version")).toBeDefined();
    db.close();
  });

  it("deletes all private stores on reset, closes active adapters, and preserves unrelated data", async () => {
    const primary = crypto.randomUUID();
    const services = createLocalServices(primary);
    const project = await services.projects.create({ title: "Private", kind: "design", document: createDocument() });
    const editor = createStudioEditorAdapter(project, await getMockCatalog(), services);
    await editor.adapter.services.comments!.create({ body: "Private comment" });
    await editor.adapter.services.versions!.create("Private full snapshot");
    const advanced = await openDB("gtf-studio-editor-v1");
    await advanced.put("assets", { meta: { id: "private-image" }, blob: new Blob(["private bytes"]) });
    await advanced.put("brand", { id: "private-kit", name: "Private client" });
    advanced.close();
    for (const name of ["gtf-studio-fonts-v1", "doory-audio", "unrelated-db"]) {
      const db = await openDB(name, 1, { upgrade(db) { db.createObjectStore("private"); } });
      await db.put("private", "personal data", "record"); db.close();
    }
    const deleteCache = vi.fn(async () => true);
    vi.stubGlobal("caches", { keys: async () => ["doory-audio-v1", "unrelated-cache"], delete: deleteCache });
    localStorage.setItem("gtf-profile", "personal profile");
    localStorage.setItem("doory.editor.prefs.v1", "private preference");
    localStorage.setItem("unrelated-key", "keep");
    await services.resetWorkspace();
    expect((await indexedDB.databases()).map(db => db.name)).toEqual(["unrelated-db"]);
    expect(localStorage.getItem("gtf-profile")).toBeNull();
    expect(localStorage.getItem("doory.editor.prefs.v1")).toBeNull();
    expect(localStorage.getItem("unrelated-key")).toBe("keep");
    expect(deleteCache).toHaveBeenCalledExactlyOnceWith("doory-audio-v1");
    await expect(editor.adapter.services.comments!.create({ body: "Stale write" })).rejects.toThrow("closed");
  });

  it("refuses stale comment and version writes after project deletion", async () => {
    const services = createLocalServices(crypto.randomUUID());
    const project = await services.projects.create({ title: "Private", kind: "design", document: createDocument() });
    const editor = createStudioEditorAdapter(project, await getMockCatalog(), services);
    await editor.adapter.services.comments!.create({ body: "Private comment" });
    await services.projects.delete(project.id);
    await expect(editor.adapter.services.comments!.create({ body: "Stale" })).rejects.toThrow("could not be found");
    await expect(editor.adapter.services.versions!.create("Stale")).rejects.toThrow("could not be found");
    const db = await openDB("gtf-studio-editor-v1");
    expect(await db.count("comments")).toBe(0);
    expect(await db.count("versions")).toBe(0);
    db.close(); editor.dispose();
  });
});

describe("decoded image limits", () => {
  it.each([[0, 10], [NaN, 10], [Infinity, 10], [7000, 7000], [20_000, 1]])("rejects unsupported dimensions %s × %s", (width, height) => {
    expect(() => assertImageDimensions(width, height)).toThrow();
  });
  it("rejects a large decoded upload before storing it and releases its object URL", async () => {
    vi.stubGlobal("Image", class { naturalWidth = 7000; naturalHeight = 7000; onload?: () => void; set src(_value: string) { queueMicrotask(() => this.onload?.()); } });
    const revoke = vi.fn();
    vi.stubGlobal("URL", class extends URL { static createObjectURL() { return "blob:rejected-image"; } static revokeObjectURL = revoke; });
    const services = createLocalServices(crypto.randomUUID());
    const project = await services.projects.create({ title: "Private", kind: "design", document: createDocument() });
    const editor = createStudioEditorAdapter(project, await getMockCatalog(), services);
    await expect(editor.adapter.uploadAsset!(new File(["small compressed file"], "image.png", { type: "image/png" }))).rejects.toThrow("40 megapixels");
    expect(revoke).toHaveBeenCalledExactlyOnceWith("blob:rejected-image");
    const db = await openDB("gtf-studio-editor-v1");
    expect(await db.count("assets")).toBe(0);
    db.close(); editor.dispose();
  });
});

describe("custom uploaded font families", () => {
  it("sanitizes a custom family and persists separate uploads with unique ids", async () => {
    vi.stubGlobal("FontFace", class { async load() { return this; } });
    Object.defineProperty(document, "fonts", { configurable: true, value: { add: vi.fn() } });
    const file = new File([new Uint8Array([0, 1, 0, 0])], "filename.ttf");
    Object.defineProperty(file, "arrayBuffer", { value: async () => new Uint8Array([0, 1, 0, 0]).buffer });
    const service = createFontService();
    const first = await service.upload(file, 'Client "Brand"');
    const second = await service.upload(file, 'Client "Brand"');
    expect(first.family).toBe("Client Brand");
    expect(first.id).not.toBe(second.id);
    expect(await service.uploaded()).toEqual(expect.arrayContaining([first, second]));
    await expect(service.upload(file, " ")).rejects.toThrow("family name");
  });
});
