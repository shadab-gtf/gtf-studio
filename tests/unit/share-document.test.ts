import { afterEach, describe, expect, it, vi } from "vitest";
import {
  MAX_SERVER_SHARE_BYTES,
  uploadSharedDocument,
} from "@/lib/share/share-document";

vi.mock("@vercel/blob/client", () => ({
  upload: vi.fn().mockResolvedValue({}),
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("uploadSharedDocument", () => {
  it("returns null only when the share store is not configured", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ configured: false }), { status: 501 }),
        ),
    );

    await expect(uploadSharedDocument("encoded-document")).resolves.toBeNull();
  });

  it("returns the short id when the server stores the document", async () => {
    const id = "0123456789abcdef0123456789abcdef";
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ id }), { status: 200 }),
        ),
    );

    await expect(uploadSharedDocument("encoded-document")).resolves.toBe(id);
  });

  it("throws instead of silently falling back when an upload fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            error: "This design is too large to share with a short link.",
          }),
          { status: 413 },
        ),
      ),
    );

    await expect(uploadSharedDocument("encoded-document")).rejects.toThrow(
      "This design is too large to share with a short link.",
    );
  });

  it("throws when the share request cannot reach the server", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error")),
    );

    await expect(uploadSharedDocument("encoded-document")).rejects.toThrow(
      "Network error",
    );
  });

  it("uploads oversized snapshots directly to Blob instead of encoding them into the URL", async () => {
    const id = "0123456789abcdef0123456789abcdef";
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "01234567-89ab-cdef-0123-456789abcdef",
    );
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ configured: true }), { status: 200 }),
        ),
    );
    const blobClient = await import("@vercel/blob/client");
    const upload = vi.mocked(blobClient.upload);

    await expect(
      uploadSharedDocument("x".repeat(MAX_SERVER_SHARE_BYTES + 1)),
    ).resolves.toBe(id);

    expect(upload).toHaveBeenCalledWith(
      `shares/${id}.txt`,
      expect.any(String),
      expect.objectContaining({
        access: "private",
        handleUploadUrl: "/api/share/upload",
        multipart: true,
      }),
    );
  });

  it("keeps the offline fallback when no Blob store is configured for large snapshots", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ configured: false }), { status: 200 }),
        ),
    );

    await expect(
      uploadSharedDocument("x".repeat(MAX_SERVER_SHARE_BYTES + 1)),
    ).resolves.toBeNull();
  });
});
