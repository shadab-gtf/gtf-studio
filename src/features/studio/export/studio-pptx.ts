import type PptxGenJS from "pptxgenjs";
import type { DocPage } from "@/vendor/doory/types/document";
import { pageSize } from "@/vendor/doory/editor/engine/docOps";
import { renderPageToCanvas } from "@/vendor/doory/editor/engine/render";
import {
  registerExportFormat,
  sanitizeFilename,
  type ExportContext,
  type ExportFile,
} from "@/vendor/doory/editor/engine/export/registry";
import {
  planPptxLayers,
  type PptxShapeLayer,
  type PptxTextLayer,
} from "./pptx-plan";

type PptxContext = Omit<ExportContext, "engine"> & {
  engine: Pick<ExportContext["engine"], "loadContext">;
};

function nativeOptions(
  layer: PptxShapeLayer | PptxTextLayer,
  pixelsPerInch: number,
  offset: { x: number; y: number },
) {
  const { box } = layer;
  return {
    x: offset.x + box.x / pixelsPerInch,
    y: offset.y + box.y / pixelsPerInch,
    w: box.width / pixelsPerInch,
    h: box.height / pixelsPerInch,
    rotate: box.rotation,
    objectName: layer.name,
  };
}

function addNative(
  slide: PptxGenJS.Slide,
  layer: PptxShapeLayer | PptxTextLayer,
  pixelsPerInch: number,
  offset: { x: number; y: number },
) {
  const options = nativeOptions(layer, pixelsPerInch, offset);
  if (layer.kind === "text") {
    slide.addText(layer.text, {
      ...options,
      fontFace: layer.fontFace,
      fontSize: (layer.fontSize * 72) / pixelsPerInch,
      bold: layer.bold,
      italic: layer.italic,
      underline: layer.underline ? { style: "sng" } : undefined,
      strike: layer.strike,
      color: layer.fill.color,
      transparency: (1 - layer.opacity * layer.fill.opacity) * 100,
      align: layer.align,
      valign: "top",
      margin: 0,
      paraSpaceAfter: 0,
      lineSpacingMultiple: layer.lineHeight,
      breakLine: false,
    });
  } else {
    slide.addShape(layer.shape, {
      ...options,
      fill: {
        color: layer.fill.color,
        transparency: (1 - layer.opacity * layer.fill.opacity) * 100,
      },
      line: {
        color: layer.stroke.color,
        transparency: (1 - layer.opacity * layer.stroke.opacity) * 100,
        width: (layer.strokeWidth * 72) / pixelsPerInch,
      },
    });
  }
}

async function rasterLayer(
  ctx: PptxContext,
  slide: PptxGenJS.Slide,
  page: DocPage,
  size: { width: number; height: number },
  pixelsPerInch: number,
  offset: { x: number; y: number },
  transparent: boolean,
) {
  ctx.signal.throwIfAborted();
  const multiplier = Math.min(
    2,
    8192 / Math.max(size.width, size.height),
    Math.sqrt(16_000_000 / (size.width * size.height)),
  );
  const canvas = await renderPageToCanvas(page, size, ctx.engine.loadContext, {
    multiplier,
    transparent,
  });
  try {
    ctx.signal.throwIfAborted();
    slide.addImage({
      data: canvas.toDataURL("image/png"),
      x: offset.x,
      y: offset.y,
      w: size.width / pixelsPerInch,
      h: size.height / pixelsPerInch,
    });
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}

export async function createStudioPptx(
  ctx: PptxContext,
): Promise<ExportFile[]> {
  const { default: Presentation } = await import("pptxgenjs");
  ctx.signal.throwIfAborted();
  const pptx = new Presentation();
  const basePpi = Math.max(ctx.document.width, ctx.document.height) / 13.333;
  const width = ctx.document.width / basePpi,
    height = ctx.document.height / basePpi;
  pptx.defineLayout({ name: "GTF_STUDIO", width, height });
  pptx.layout = "GTF_STUDIO";
  pptx.author = "GTF Studio";
  pptx.title = ctx.title;
  pptx.subject =
    "Editable text and shapes; complex artwork is rendered as images.";
  for (const [index, { page }] of ctx.pages.entries()) {
    ctx.signal.throwIfAborted();
    const slide = pptx.addSlide();
    const size = pageSize(ctx.document, page);
    const ppi = Math.max(size.width / width, size.height / height);
    const offset = {
      x: (width - size.width / ppi) / 2,
      y: (height - size.height / ppi) / 2,
    };
    slide.background = { color: "FFFFFF" };
    if (page.notes) slide.addNotes(page.notes);
    if (
      page.background.type === "solid" &&
      /^#[\da-f]{6}$/i.test(page.background.color)
    ) {
      slide.addShape("rect", {
        x: offset.x,
        y: offset.y,
        w: size.width / ppi,
        h: size.height / ppi,
        fill: { color: page.background.color.slice(1) },
        line: { transparency: 100 },
      });
    } else
      await rasterLayer(
        ctx,
        slide,
        { ...page, objects: [] },
        size,
        ppi,
        offset,
        false,
      );
    for (const layer of planPptxLayers(page.objects)) {
      ctx.signal.throwIfAborted();
      if (layer.kind === "raster") {
        const blended = layer.objects.some(
          (object) =>
            object.globalCompositeOperation &&
            object.globalCompositeOperation !== "source-over",
        );
        await rasterLayer(
          ctx,
          slide,
          {
            ...page,
            background: blended
              ? page.background
              : { type: "solid", color: "transparent" },
            objects: layer.objects,
          },
          size,
          ppi,
          offset,
          !blended,
        );
      } else addNative(slide, layer, ppi, offset);
    }
    ctx.onProgress((index + 1) / ctx.pages.length);
  }
  const output = await pptx.write({ outputType: "blob", compression: true });
  ctx.signal.throwIfAborted();
  if (!(output instanceof Blob))
    throw new Error("PowerPoint export returned an unsupported file.");
  return [
    {
      blob: output,
      filename: `${sanitizeFilename(ctx.title) || "GTF-design"}.pptx`,
    },
  ];
}

export function registerStudioExports(): () => void {
  return registerExportFormat({
    id: "pptx",
    label: "PowerPoint",
    extension: "pptx",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    description:
      "Editable plain text and basic shapes. Other artwork becomes images. Fonts must be installed in your presentation viewer; audio and animation are not included.",
    order: 45,
    controls: {},
    run: createStudioPptx,
  });
}
