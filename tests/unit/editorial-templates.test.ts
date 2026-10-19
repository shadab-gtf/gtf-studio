import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  createEditorialTemplates,
  editorialFormats,
} from "@/services/mocks/editorial-templates";
import { bundledFontSource } from "@/services/mocks/bundled-fonts";
import { toStudioDocument } from "@/features/studio/document-bridge";
import { studioDocumentSchema } from "@/core/document/studio-schema";
import {
  documentPrintDpi,
  printGeometry,
} from "@/vendor/doory/editor/engine/export/printGeometry";

const templates = createEditorialTemplates();
const local = (src: string) =>
  existsSync(path.join(process.cwd(), "public", src));
describe("reference template collection", () => {
  it("contains exactly five distinct editable designs for each of the 17 categories", () => {
    const categories = new Set(templates.map((t) => t.category));
    expect(categories.size).toBe(17);
    expect(templates).toHaveLength(85);
    expect(new Set(templates.map((t) => t.id)).size).toBe(85);
    for (const category of categories)
      expect(templates.filter((t) => t.category === category)).toHaveLength(5);
    for (const template of templates) {
      const document = toStudioDocument(template.document);
      expect(
        studioDocumentSchema.safeParse(document).success,
        template.id,
      ).toBe(true);
      expect(document.pages[0].objects.length, template.id).toBeGreaterThan(1);
      if (template.category !== "Profile picture")
        expect(
          document.pages[0].objects.some((o) => o.type === "textbox"),
          template.id,
        ).toBe(true);
      expect(
        document.pages[0].objects.every((o) => o.locked !== true),
        template.id,
      ).toBe(true);
      expect(local(`/images/editorial-templates/${template.id}.webp`)).toBe(
        true,
      );
    }
  });
  it("loads every referenced photo and font from a bundled local asset", () => {
    for (const template of templates)
      for (const object of toStudioDocument(template.document).pages[0]
        .objects) {
        if (object.type === "image")
          expect(
            local(String(object.src)),
            `${template.id}: ${String(object.src)}`,
          ).toBe(true);
        if (object.type === "textbox") {
          const family = String(object.fontFamily);
          const src = bundledFontSource({
            id: family.toLowerCase().replaceAll(" ", "-"),
            family,
            weight: Number(object.fontWeight),
            style: object.fontStyle === "italic" ? "italic" : "normal",
            subset: "latin",
          });
          expect(
            src,
            `${template.id}: ${family} ${String(object.fontWeight)}`,
          ).toBeDefined();
          expect(local(src!)).toBe(true);
        }
      }
  });
  it("keeps native print pixels and the intended physical page size", () => {
    const poster = templates.find((t) => t.category === "Poster")!;
    const doc = toStudioDocument(poster.document);
    expect([doc.width, doc.height]).toEqual([3508, 4961]);
    expect(documentPrintDpi(doc)).toBe(300);
    expect((doc.width / documentPrintDpi(doc)) * 25.4).toBeCloseTo(297, 0);
    const sheet = printGeometry({ width: 2550, height: 3300 }, 3, true, 300);
    expect((sheet.bleed / 300) * 25.4).toBeCloseTo(3, 8);
    expect((sheet.slug / 300) * 25.4).toBeCloseTo(6, 8);
    expect((sheet.sheetWidth / 300) * 25.4).toBeCloseTo(215.9 + 18, 8);
    expect(documentPrintDpi({})).toBe(96);
    expect(documentPrintDpi({ meta: { printDpi: Number.NaN } })).toBe(96);
  });
  it("offers a matching blank size for every new format without duplicating existing formats", () => {
    const formats = editorialFormats([]);
    expect(formats).toHaveLength(17);
    expect(editorialFormats(formats)).toEqual([]);
    for (const template of templates) {
      const format = formats.find((f) => f.id === template.formatId)!;
      expect([format.width, format.height]).toEqual([
        template.document.width,
        template.document.height,
      ]);
      expect(format.printDpi).toBe(
        toStudioDocument(template.document).meta?.printDpi,
      );
    }
  });
  it("includes entrance motion and bundled audio on all five landscape video designs", () => {
    for (const template of templates.filter(
      (t) => t.category === "Landscape video",
    )) {
      const doc = toStudioDocument(template.document);
      expect(doc.pages[0].objects.every((o) => !!o.animation)).toBe(true);
      expect(doc.audioTracks).toHaveLength(1);
      expect(local(doc.audioTracks![0].src)).toBe(true);
    }
  });
});
