import { deflateSync, inflateSync, strToU8, strFromU8 } from "fflate";
import { parseDocument, type CreativeDocument } from "@/core/document/schema";

/**
 * Local-first share transport. A design is shared by compressing its document into a URL-safe string that
 * travels in the link itself (`/view#d=...`), so a recipient on any device can open it with no account and
 * no backend. Built-in templates share by id instead (`/view/template/<id>`), which keeps the link tiny.
 */

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1)
    bytes[index] = binary.charCodeAt(index);
  return bytes;
}

/** Compress a document into a URL-safe payload. */
export function encodeDocument(document: CreativeDocument): string {
  const json = JSON.stringify(document);
  return toBase64Url(deflateSync(strToU8(json), { level: 9 }));
}

/** Decode and validate a document from a URL-safe payload. Throws on tampered / malformed input. */
export function decodeDocument(encoded: string): CreativeDocument {
  const json = strFromU8(inflateSync(fromBase64Url(encoded)));
  return parseDocument(JSON.parse(json));
}

/** View-only link for a built-in template. */
export function templateShareUrl(id: string, origin = ""): string {
  return `${origin}/view/template/${encodeURIComponent(id)}`;
}

/** View-only link that carries a full design in the URL fragment. */
export function designShareUrl(document: CreativeDocument, origin = ""): string {
  return `${origin}/view#d=${encodeDocument(document)}`;
}
