// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { readLocalBackupAsset } from "@/features/studio/backup/backup-resources";
import { MAX_RESOURCE_BYTES } from "@/features/studio/backup/portable-backup";

afterEach(() => vi.unstubAllGlobals());
const origin = () => vi.stubGlobal("window", { location: { origin: "https://studio.test" } });

describe("backup media boundary", () => {
  it("does not fetch external URLs or application endpoints", async () => {
    origin();
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    for (const source of ["https://external.test/photo.png", "/api/account", "//external.test/photo.png"]) {
      await expect(readLocalBackupAsset(source, async value => value)).rejects.toThrow(/remote or unsupported/i);
    }
    expect(request).not.toHaveBeenCalled();
  });
  it("includes local media bytes and forbids redirect following", async () => {
    origin();
    const request = vi.fn(async () => new Response(new Uint8Array([1, 2, 3]), { headers: { "Content-Type": "image/png" } }));
    vi.stubGlobal("fetch", request);
    const result = await readLocalBackupAsset("idb://local", async () => "blob:https://studio.test/local");
    expect(new Uint8Array(await result.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
    expect(result.type).toBe("image/png");
    expect(request).toHaveBeenCalledWith(new URL("blob:https://studio.test/local"), expect.objectContaining({ redirect: "error", referrerPolicy: "no-referrer" }));
  });
  it("rejects an oversized response before reading its body", async () => {
    origin();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(new Uint8Array([1]), { headers: { "Content-Length": String(MAX_RESOURCE_BYTES + 1) } })));
    await expect(readLocalBackupAsset("/images/test.png", async value => value)).rejects.toThrow(/25 MB/);
  });
});
