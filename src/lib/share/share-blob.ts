import { put, head } from "@vercel/blob";
import { decodeDocument } from "./share-document";
import type { CreativeDocument } from "@/core/document/schema";

/**
 * Server-side store for view-only share snapshots (Vercel Blob).
 *
 * The store is configured with **private** access, so blobs are never publicly
 * reachable by URL alone. On write we use `access: "private"` and on read we
 * resolve the canonical blob URL via `head()` (token-authenticated) and then
 * fetch the content server-side — the token never reaches the browser.
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
export async function storeShareDocument(encoded: string): Promise<string | null> {
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
 * Flow:
 *   1. `head()` resolves the private blob's canonical download URL with the token.
 *   2. A server-side `fetch()` with `Authorization` downloads the content.
 *   3. The decoded document is validated before being returned.
 */
export async function loadShareDocument(id: string): Promise<CreativeDocument | null> {
  const blobToken = token();
  if (!blobToken || !SHARE_ID.test(id)) return null;

  // head() confirms the blob exists and returns its metadata (including the URL).
  let blobMeta: Awaited<ReturnType<typeof head>>;
  try {
    blobMeta = await head(pathOf(id), { token: blobToken });
  } catch {
    // Blob not found or store unreachable.
    return null;
  }

  // Private blobs require the token in the Authorization header to be fetched.
  let text: string;
  try {
    const res = await fetch(blobMeta.url, {
      headers: { Authorization: `Bearer ${blobToken}` },
      // Opt out of Next.js fetch cache — share content must always be fresh.
      cache: "no-store",
    });
    if (!res.ok) return null;
    text = await res.text();
  } catch {
    return null;
  }

  try {
    return decodeDocument(text);
  } catch {
    return null;
  }
}
