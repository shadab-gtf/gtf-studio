import type { EditorAdapter } from "@/vendor/doory/types/adapter";
import type { FontService } from "@/services/contracts/font-service";
import { MAX_RESOURCE_BYTES, type BackupResources } from "./portable-backup";

/** Resolves browser-local assets without following redirects or contacting third-party hosts. */
export async function readLocalBackupAsset(
  source: string,
  resolve: (source: string) => Promise<string>,
): Promise<Blob> {
  const address = source.startsWith("idb://") ? await resolve(source) : source;
  const url = new URL(address, window.location.origin);
  const inline = /^data:image\/(png|jpeg|webp|gif|avif|svg\+xml)[;,]/i.test(
    address,
  );
  const localBlob =
    url.protocol === "blob:" && url.origin === window.location.origin;
  const bundled =
    url.origin === window.location.origin &&
    /^\/(media|studio-assets|images|templates)\//.test(url.pathname);
  if (!inline && !localBlob && !bundled)
    throw new Error(
      "A remote or unsupported asset cannot be included in this local backup. Upload a local copy first.",
    );
  const response = await fetch(url, {
    signal: AbortSignal.timeout(20_000),
    credentials: "same-origin",
    redirect: "error",
    referrerPolicy: "no-referrer",
  });
  if (!response.ok || !response.body)
    throw new Error(
      "A design asset could not be read. Re-upload it before making a backup.",
    );
  if (Number(response.headers.get("content-length")) > MAX_RESOURCE_BYTES) {
    await response.body.cancel();
    throw new Error("A design asset exceeds the 25 MB backup limit.");
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let total = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_RESOURCE_BYTES)
        throw new Error("A design asset exceeds the 25 MB backup limit.");
      chunks.push(new Uint8Array(value));
    }
  } finally {
    await reader.cancel();
  }
  return new Blob(chunks, {
    type:
      response.headers.get("content-type")?.split(";")[0].trim() ||
      "application/octet-stream",
  });
}

export function createBackupResources(
  adapter: EditorAdapter,
  fonts: FontService,
): BackupResources {
  return {
    readAsset: (source) => readLocalBackupAsset(source, adapter.resolveSrc),
    writeAsset: (blob, name) => adapter.uploadAsset(blob, { name }),
    removeAsset: (id) => adapter.services.assets.remove(id),
    listFonts: () => fonts.uploaded(),
    readFont: (font) =>
      fonts.file({
        id: font.id,
        family: font.family,
        weight: font.weights[0] ?? 400,
        style: font.styles[0] ?? "normal",
        subset: font.defSubset,
      }),
    writeFont: (file) => fonts.upload(file),
    removeFont: (id) => fonts.remove(id),
  };
}
