import { describe, expect, it, vi } from "vitest";
import {
  createStudioBackup,
  parseStudioBackup,
  restoreStudioBackup,
  type BackupResources,
} from "@/features/studio/backup/portable-backup";
import type { DoryDocument } from "@/vendor/doory/types/document";

const document: DoryDocument = {
  schemaVersion: 1,
  unit: "px",
  width: 100,
  height: 100,
  pages: [
    {
      id: "page",
      background: { type: "solid", color: "#ffffff" },
      objects: [
        { id: "image", type: "image", src: "idb://old", width: 20, height: 20 },
      ],
    },
  ],
};
const resources = (): BackupResources => ({
  readAsset: vi.fn(async () => new Blob(["image"], { type: "image/png" })),
  writeAsset: vi.fn(async () => ({ id: "restored", url: "idb://restored" })),
  removeAsset: vi.fn(async () => undefined),
  listFonts: vi.fn(async () => []),
  readFont: vi.fn(),
  writeFont: vi.fn(),
  removeFont: vi.fn(async () => undefined),
});

describe("portable studio backups", () => {
  it("preserves uploaded font bytes and remaps the restored family", async () => {
    const io = resources();
    const source = structuredClone(document);
    source.pages[0].objects.push({
      id: "text",
      type: "textbox",
      text: "Hello",
      fontFamily: "My font, sans-serif",
      width: 80,
      height: 30,
    });
    io.listFonts = vi.fn<BackupResources["listFonts"]>(async () => [
      {
        id: "upload-font",
        family: "My font",
        weights: [400],
        styles: ["normal"],
        subsets: ["custom"],
        defSubset: "custom",
        category: "uploaded",
        license: "User supplied",
      },
    ]);
    io.readFont = vi.fn(
      async () => new Blob(["wOF2-font-content"], { type: "font/woff2" }),
    );
    io.writeFont = vi.fn(async () => ({
      id: "new-font",
      family: "My font restored",
    }));
    const backup = await createStudioBackup(source, "Fonts", io);
    expect(backup.fonts[0].extension).toBe("woff2");
    const result = await restoreStudioBackup(
      parseStudioBackup(JSON.stringify(backup)),
      io,
      async (value) => value,
    );
    expect(result.pages[0].objects[1].fontFamily).toBe(
      "My font restored, sans-serif",
    );
    expect(source.pages[0].objects[1].fontFamily).toBe("My font, sans-serif");
    expect(io.writeFont).toHaveBeenCalledTimes(1);
  });
  it("restores local references into new assets without changing the source document", async () => {
    const io = resources();
    const backup = await createStudioBackup(document, "My design", io);
    const parsed = parseStudioBackup(JSON.stringify(backup));
    const create = vi.fn(async (value: DoryDocument) => value);
    const result = await restoreStudioBackup(parsed, io, create);
    expect(result.pages[0].objects[0].src).toBe("idb://restored");
    expect(document.pages[0].objects[0].src).toBe("idb://old");
    expect(io.writeAsset).toHaveBeenCalledTimes(1);
  });
  it("removes newly written resources if project creation fails", async () => {
    const io = resources();
    const backup = await createStudioBackup(document, "My design", io);
    await expect(
      restoreStudioBackup(backup, io, async () => {
        throw new Error("Storage is full");
      }),
    ).rejects.toThrow("Storage is full");
    expect(io.removeAsset).toHaveBeenCalledWith("restored");
  });
  it("rejects missing embedded assets and malformed resource encoding before writing", async () => {
    const backup = await createStudioBackup(document, "My design", resources());
    expect(() =>
      parseStudioBackup(JSON.stringify({ ...backup, assets: [] })),
    ).toThrow(/missing/i);
    expect(() =>
      parseStudioBackup(
        JSON.stringify({
          ...backup,
          assets: [{ ...backup.assets[0], data: "data:image/png;base64,!!!" }],
        }),
      ),
    ).toThrow();
  });
  it("refuses remote image dependencies without making a request", async () => {
    const io = resources();
    const remote = structuredClone(document);
    remote.pages[0].objects[0].src = "https://example.test/image.png";
    await expect(
      createStudioBackup(remote, "Remote design", io),
    ).rejects.toThrow(/remote/i);
    expect(io.readAsset).not.toHaveBeenCalled();
  });
});
