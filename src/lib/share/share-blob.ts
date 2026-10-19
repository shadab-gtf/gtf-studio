import { get, put } from "@vercel/blob";
import { decodeDocument } from "./share-document";
import type { CreativeDocument } from "@/core/document/schema";

/**
 * Server-side store for view-only share snapshots (Vercel Blob).
 *
 * The store is configured with **private** access, so blobs are never publicly
 * reachable by URL alone. Reads use the SDK's authenticated `get()` method, so
 * the token never reaches the browser.
 *
 * When no blob store is configured (no `BLOB_READ_WRITE_TOKEN`), both helpers
 * no-op and the caller falls back to the in-URL link.
 */

const token = (): string | undefined => process.env.BLOB_READ_WRITE_TOKEN;

export function isShareStoreConfigured(): boolean {
  return !!token();
}

const SHARE_ID = /^[a-f0-9]{32}$/;
const pathOf = (id: string): string => `shares/${id}.txt`;

/** Stores an already-encoded design and returns its id, or `null` when the store is unavailable. */
export async function storeShareDocument(
  encoded: string,
): Promise<string | null> {
  const blobToken = token();
  if (!blobToken) return null;

  const id = crypto.randomUUID().replace(/-/g, "");
  await put(pathOf(id), encoded, {
    access: "private",
    addRandomSuffix: false,
    contentType: "text/plain; charset=utf-8",
    token: blobToken,
  });
  return id;
}

/**
 * Loads and validates a stored design server-side using the write token.
 * Returns `null` when the id is missing, malformed, or the store is unavailable.
 *
 * The SDK authenticates the private blob read and returns its content as a stream.
 */
export async function loadShareDocument(
  id: string,
): Promise<CreativeDocument | null> {
  const blobToken = token();
  if (!blobToken || !SHARE_ID.test(id)) return null;

  let text: string;
  try {
    const blob = await get(pathOf(id), {
      access: "private",
      token: blobToken,
      useCache: false,
    });
    if (!blob || blob.statusCode !== 200) return null;
    text = await new Response(blob.stream).text();
  } catch {
    // Blob not found or store unreachable.
    return null;
  }

  try {
    return decodeDocument(text);
  } catch {
    return null;
  }
}
