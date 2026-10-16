import { describe, expect, it } from "vitest";
import { canvasPadding, fitZoomForPages } from "@/vendor/doory/editor/engine/zoom";
import { computeStack, DEFAULT_METRICS, slotLeft } from "@/vendor/doory/editor/engine/layout";

describe("studio fit and page layout", () => {
  it.each([390, 768, 1280])("fits square and large pages inside a %ipx viewport", width => {
    for (const page of [{ width: 1080, height: 1080 }, { width: 8192, height: 4096 }]) {
      const viewport = { width, height: 500 };
      const padding = canvasPadding(width);
      const zoom = fitZoomForPages(viewport, page, page.width, "fit-page", padding);
      const layout = computeStack([{ ...page, id: "page" }], zoom, { ...DEFAULT_METRICS, sidePadding: padding });
      const slot = layout.slots[0];
      const left = slotLeft(layout, slot, width);
      expect(layout.contentWidth).toBeLessThanOrEqual(width);
      expect(left).toBeGreaterThanOrEqual(padding - 1);
      expect(left + slot.width).toBeLessThanOrEqual(width - padding + 1);
    }
  });
});
