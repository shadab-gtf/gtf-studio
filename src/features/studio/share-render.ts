import { renderPageToCanvas, canvasToBlob } from "@/vendor/doory/editor/engine/render";
import type { LoadContext } from "@/vendor/doory/editor/engine/serialization";
import type { DoryDocument } from "@/vendor/doory/types/document";
import { parseDocument, type CreativeDocument } from "@/core/document/schema";

/**
 * Turns the live editor document into a self-contained, view-only snapshot.
 *
 * A design normally lives only in this browser's storage, and its rich studio model needs the full editor engine
 * (and its fonts) to draw. To share it view-only with someone on another device, each page is rasterised to a WebP
 * picture with its fonts and images baked in, and wrapped in the minimal document the lightweight viewer understands.
 * The result carries everything it needs, so the link opens the same on any device with no account, backend or fonts.
 */

/** The longest side a shared page is rendered at. Big enough to look crisp when zoomed, small enough to keep links sendable. */
const MAX_SIDE = 1400;
const WEBP_QUALITY = 0.82;

const asDocumentDimension = (value: number): number =>
  Math.min(8000, Math.max(64, Math.round(value)));
const asElementDimension = (value: number): number =>
  Math.min(16000, Math.max(1, Math.round(value)));

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("The design image could not be prepared for sharing."));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function rasterizeShareDocument(
  document: DoryDocument,
  ctx: LoadContext,
): Promise<CreativeDocument> {
  const width = asDocumentDimension(document.width);
  const height = asDocumentDimension(document.height);
  const pages: CreativeDocument["pages"] = [];
  for (const [index, page] of document.pages.entries()) {
    const size = {
      width: page.width ?? document.width,
      height: page.height ?? document.height,
    };
    const multiplier = Math.min(1, MAX_SIDE / Math.max(size.width, size.height));
    const canvas = await renderPageToCanvas(page, size, ctx, { multiplier });
    let src: string;
    try {
      src = await readAsDataUrl(await canvasToBlob(canvas, "image/webp", WEBP_QUALITY));
    } finally {
      // Release the backing bitmap promptly; a multi-page design would otherwise hold several at once.
      canvas.width = 0;
      canvas.height = 0;
    }
    const elementWidth = asElementDimension(size.width);
    const elementHeight = asElementDimension(size.height);
    pages.push({
      id: page.id,
      name: (page.name || `Page ${index + 1}`).slice(0, 120),
      background: "#ffffff",
      notes: "",
      transition: "none",
      elements: [
        {
          id: `img-${page.id}`.slice(0, 100),
          name: "Design",
          type: "image",
          src,
          alt: "Design",
          // Centre each page image so a design that mixes page sizes stays aligned in the fixed document box.
          x: Math.round((width - elementWidth) / 2),
          y: Math.round((height - elementHeight) / 2),
          width: elementWidth,
          height: elementHeight,
          rotation: 0,
          opacity: 1,
          locked: true,
          hidden: false,
        },
      ],
    });
  }
  return parseDocument({ schemaVersion: 1, width, height, pages });
}
