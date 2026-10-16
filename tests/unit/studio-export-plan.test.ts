import { describe, expect, it } from "vitest";
import { planPptxLayers } from "@/features/studio/export/pptx-plan";
import type { DocObject } from "@/vendor/doory/types/document";

const rect: DocObject = {
  id: "r",
  type: "rect",
  left: 40,
  top: 60,
  width: 200,
  height: 100,
  originX: "left",
  originY: "top",
  fill: "#123456",
  strokeWidth: 0,
};

describe("advanced PowerPoint export", () => {
  it("keeps editable text and shapes with raster runs in their original stacking order", () => {
    const result = planPptxLayers([
      rect,
      { id: "image", type: "image", src: "idb://image" },
      { id: "group", type: "group", objects: [] },
      {
        ...rect,
        id: "text",
        type: "textbox",
        text: "Editable title",
        fontSize: 32,
        fontFamily: "Manrope",
      },
    ]);
    expect(result.map((layer) => layer.kind)).toEqual([
      "shape",
      "raster",
      "text",
    ]);
    expect(result[1]).toMatchObject({
      objects: [{ id: "image" }, { id: "group" }],
    });
    expect(result[2]).toMatchObject({ text: "Editable title", fontSize: 32 });
  });
  it("converts Fabric center origins and rotated origins without shifting the slide content", () => {
    expect(
      planPptxLayers([
        { ...rect, originX: "center", originY: "center", angle: 0 },
      ])[0],
    ).toMatchObject({ box: { x: -60, y: 10, width: 200, height: 100 } });
    expect(planPptxLayers([{ ...rect, angle: 90 }])[0]).toMatchObject({
      box: { x: -110, y: 110, width: 200, height: 100, rotation: 90 },
    });
  });
  it("rasterizes effects, rich text and skew rather than silently discarding them", () => {
    const result = planPptxLayers([
      { ...rect, effects: { shadow: { blur: 10 } } },
      {
        ...rect,
        type: "textbox",
        text: "Styled",
        styles: { 0: { 0: { fill: "red" } } },
      },
      { ...rect, skewX: 10 },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      kind: "raster",
      objects: [{ id: "r" }, { id: "r" }, { id: "r" }],
    });
  });
  it("omits hidden objects and placeholder aids", () => {
    expect(
      planPptxLayers([
        { ...rect, visible: false },
        { ...rect, isPlaceholder: true },
      ]),
    ).toEqual([]);
  });
});
