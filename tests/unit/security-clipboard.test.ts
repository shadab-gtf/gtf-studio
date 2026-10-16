import { beforeEach, describe, expect, it, vi } from "vitest";
import { Rect } from "fabric";
import { decodeClipboard, encodeClipboard } from "@/vendor/doory/editor/engine/clipboardFormat";
import { InsertApi } from "@/vendor/doory/editor/engine/api/insert";
import { deserializeObjects } from "@/vendor/doory/editor/engine/serialization";
import type { EditorEngine } from "@/vendor/doory/editor/engine/editor";
import type { DocObject } from "@/vendor/doory/types/document";

vi.mock("@/vendor/doory/editor/engine/serialization", () => ({ deserializeObjects: vi.fn() }));
beforeEach(() => { vi.clearAllMocks(); });

const shape = (id: string): DocObject => ({ id, type: "rect", width: 100, height: 100, fill: "#29afe4" });
const page = { width: 1080, height: 1080 };

describe("structured clipboard input", () => {
  it("round-trips valid clipboard objects and leaves ordinary text alone", () => {
    const objects = [shape("a")];
    expect(decodeClipboard(encodeClipboard(objects, page))?.objects).toEqual(objects);
    expect(decodeClipboard("Regular text to paste")).toBeNull();
  });

  it("rejects excessive nested counts, depth, invalid dimensions and oversized text", () => {
    const group: DocObject = { id: "group", type: "group", objects: Array.from({ length: 1000 }, (_, index) => shape(String(index))) };
    expect(() => decodeClipboard(encodeClipboard([group], page))).toThrow("limits");
    let nested = shape("leaf");
    for (let index = 0; index < 25; index++) nested = { id: `g-${index}`, type: "group", objects: [nested] };
    expect(() => decodeClipboard(encodeClipboard([nested], page))).toThrow("limits");
    expect(() => decodeClipboard(encodeClipboard([shape("a")], { width: -1, height: 1080 }))).toThrow("malformed");
    expect(() => decodeClipboard("x".repeat(20 * 1024 * 1024 + 1))).toThrow("20 MB");
  });

  it("rejects the entire selection instead of silently discarding invalid objects", () => {
    const payload = JSON.stringify({ kind: "doory-clipboard/v1", page, objects: [shape("good"), { type: "textbox", text: "missing stable id" }] });
    expect(() => decodeClipboard(payload)).toThrow("malformed");
  });
});

function testEngine(existing: DocObject[] = [], live: Rect[] = []) {
  const add = vi.fn();
  const configure = vi.fn();
  const engine = {
    readOnly: false,
    state: { activePageId: "page", doc: { pages: [{ id: "page", objects: existing }] } },
    whenView: vi.fn(async () => ({ configure, canvas: { getObjects: () => live, add, requestRenderAll: vi.fn() }, selectObjects: vi.fn() })),
    commit: vi.fn(), announce: vi.fn(), loadContext: {},
  };
  return { engine: engine as unknown as EditorEngine, add, configure };
}

describe("paste mutation boundary", () => {
  it("blocks invalid trees and destination overflow before Fabric deserializes anything", async () => {
    const { engine, add } = testEngine(Array.from({ length: 999 }, (_, index) => shape(`existing-${index}`)));
    const insert = new InsertApi(engine);
    await expect(insert.objects([{ id: "bad", type: "textbox", text: "bad", fontSize: -1 }], "Paste")).rejects.toThrow("malformed");
    await expect(insert.objects([{ id: "g", type: "group", objects: [shape("child")] }], "Paste")).rejects.toThrow("1000 objects");
    expect(deserializeObjects).not.toHaveBeenCalled();
    expect(add).not.toHaveBeenCalled();
  });

  it("rechecks the destination after asynchronous loading and leaves the canvas unchanged", async () => {
    const live = Array.from({ length: 1000 }, () => new Rect({ width: 10, height: 10 }));
    const { engine, add, configure } = testEngine([], live);
    vi.mocked(deserializeObjects).mockResolvedValueOnce([new Rect({ width: 100, height: 100 })]);
    await expect(new InsertApi(engine).objects([shape("a")], "Paste")).rejects.toThrow("1000 objects");
    expect(deserializeObjects).toHaveBeenCalledOnce();
    expect(configure).not.toHaveBeenCalled();
    expect(add).not.toHaveBeenCalled();
    expect(engine.commit).not.toHaveBeenCalled();
  });

  it("commits a valid paste exactly once", async () => {
    const { engine, add } = testEngine();
    vi.mocked(deserializeObjects).mockResolvedValueOnce([new Rect({ width: 100, height: 100 })]);
    await new InsertApi(engine).objects([shape("a")], "Paste");
    expect(add).toHaveBeenCalledOnce();
    expect(engine.commit).toHaveBeenCalledExactlyOnceWith("page", { label: "Paste" });
  });
});
