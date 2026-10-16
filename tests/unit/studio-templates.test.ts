import { describe, expect, it } from "vitest";
import { createDooryTemplates } from "@/services/mocks/doory-templates";
import { parseDocument } from "@/core/document/schema";

describe("Doory starter template adapter", () => {
  it("provides the ten real upstream templates as thirteen fully editable pages", () => {
    const templates = createDooryTemplates();
    expect(templates).toHaveLength(10);
    expect(
      templates.reduce(
        (total, template) => total + template.document.studio!.pages.length,
        0,
      ),
    ).toBe(13);
    for (const template of templates) {
      expect(() => parseDocument(template.document)).not.toThrow();
      expect(template.id).toMatch(/^doory-/);
      expect(template.document.studio!.pages[0].objects.length).toBeGreaterThan(
        0,
      );
      expect(template.document.pages[0].elements[0]).toMatchObject({
        type: "image",
        src: expect.stringMatching(/^\/images\/doory-templates\//),
      });
    }
    expect(
      templates.find((template) => template.id === "doory-modern-pitch-deck")!
        .document.studio!.pages,
    ).toHaveLength(3);
  });
  it("returns isolated copies so editing does not mutate the built-in templates", () => {
    const first = createDooryTemplates();
    first[0].document.studio!.pages[0].objects.length = 0;
    expect(
      createDooryTemplates()[0].document.studio!.pages[0].objects.length,
    ).toBeGreaterThan(0);
  });
});
