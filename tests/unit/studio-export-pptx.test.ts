// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { unzipSync, strFromU8 } from "fflate";
import {
  createStudioPptx,
  registerStudioExports,
} from "@/features/studio/export/studio-pptx";
import {
  DEFAULT_EXPORT_OPTIONS,
  exportFormats,
} from "@/vendor/doory/editor/engine/export/registry";
import type { DoryDocument } from "@/vendor/doory/types/document";

describe("PowerPoint file generation", () => {
  it("writes editable text, vector shapes, page notes and every selected slide", async () => {
    const document: DoryDocument = {
      schemaVersion: 1,
      unit: "px",
      width: 1920,
      height: 1080,
      pages: [
        {
          id: "one",
          notes: "Presenter notes",
          background: { type: "solid", color: "#ffffff" },
          objects: [
            {
              id: "title",
              type: "textbox",
              text: "Editable title <&>",
              fontFamily: "Manrope",
              fontSize: 80,
              fill: "#123456",
              width: 900,
              height: 100,
              originX: "left",
              originY: "top",
              left: 100,
              top: 150,
            },
            {
              id: "shape",
              type: "triangle",
              fill: "#bc2173",
              width: 300,
              height: 200,
              left: 200,
              top: 500,
              originX: "left",
              originY: "top",
            },
          ],
        },
        {
          id: "two",
          background: { type: "solid", color: "#123456" },
          objects: [],
        },
      ],
    };
    const progress = vi.fn();
    const [result] = await createStudioPptx({
      document,
      pages: document.pages.map((page, index) => ({ page, index })),
      title: "Test deck",
      engine: {
        loadContext: {
          resolveSrc: async (value) => value,
          ensureFonts: async () => undefined,
        },
      },
      options: DEFAULT_EXPORT_OPTIONS,
      signal: new AbortController().signal,
      onProgress: progress,
    });
    const archive = unzipSync(new Uint8Array(await result.blob.arrayBuffer()));
    const slide = strFromU8(archive["ppt/slides/slide1.xml"]);
    expect(slide).toContain("Editable title &lt;&amp;&gt;");
    expect(slide).toContain('prst="triangle"');
    expect(slide).toContain('typeface="Manrope"');
    expect(archive["ppt/slides/slide2.xml"]).toBeDefined();
    expect(strFromU8(archive["ppt/notesSlides/notesSlide1.xml"])).toContain(
      "Presenter notes",
    );
    expect(result.filename).toBe("Test-deck.pptx");
    expect(progress).toHaveBeenLastCalledWith(1);
  });
  it("adds the format without removing existing registered formats", () => {
    const existing = exportFormats.list().map((format) => format.id);
    const cleanup = registerStudioExports();
    expect(exportFormats.get("pptx")?.extension).toBe("pptx");
    for (const id of existing) expect(exportFormats.has(id)).toBe(true);
    cleanup();
  });
});
