import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { studioDocumentSchema } from "@/core/document/studio-schema";
import { createSemiCasualDocument } from "@/services/mocks/reference-templates";
import { bundledFontSource } from "@/services/mocks/bundled-fonts";
import { clampTo, FONT_SIZE } from "@/vendor/doory/editor/toolbar/limits";
import { sanitizeTextPatch } from "@/vendor/doory/editor/engine/objects/textStyle";

describe("reference fashion template", () => {
  it("lets the toolbar edit poster headings without silently shrinking them", () => {
    expect(
      sanitizeTextPatch({ fontSize: clampTo(FONT_SIZE, 440) }).fontSize,
    ).toBe(440);
    expect(clampTo(FONT_SIZE, 10000)).toBe(999);
  });
  it("preserves editable type and photography through document validation", () => {
    const document = studioDocumentSchema.parse(createSemiCasualDocument());
    expect([document.width, document.height]).toEqual([1728, 2428]);
    const objects = document.pages[0].objects;
    expect(objects.filter((object) => object.type === "textbox")).toHaveLength(
      7,
    );
    const photo = objects.find((object) => object.type === "image");
    expect(photo?.locked).not.toBe(true);
    expect(
      existsSync(path.join(process.cwd(), "public", String(photo?.src))),
    ).toBe(true);
  });

  it("resolves its free heading font locally for editor loading and export", () => {
    const source = bundledFontSource({
      id: "italiana",
      family: "Italiana",
      weight: 400,
      style: "normal",
      subset: "latin",
    });
    expect(source).toBe("/fonts/display/italiana-400.woff2");
    expect(existsSync(path.join(process.cwd(), "public", source!))).toBe(true);
  });

  it("does not substitute a Latin-only font file for another script", () => {
    expect(
      bundledFontSource({
        id: "manrope",
        family: "Manrope",
        weight: 800,
        style: "normal",
        subset: "cyrillic",
      }),
    ).toBeUndefined();
  });
});
