import { describe, expect, it } from "vitest";
import {
  createDocument,
  duplicateDocument,
  parseDocument,
} from "@/core/document/schema";
import { templates, getMockCatalog } from "@/services/mocks/catalog";
import { serializeSvg } from "@/features/export/export-document";

describe("document contracts", () => {
  it("validates every original template and provides five per category", async () => {
    const catalog = await getMockCatalog();
    const counts = new Map<string, number>();
    for (const template of catalog.templates) {
      expect(() => parseDocument(template.document)).not.toThrow();
      counts.set(template.category, (counts.get(template.category) ?? 0) + 1);
    }
    expect([...counts.keys()].sort()).toEqual([
      "Banner",
      "Business card",
      "Flyer",
      "Invitation",
      "Logo",
      "Portrait post",
      "Poster",
      "Presentation",
      "Resume",
      "Social",
      "Story",
      "Video thumbnail",
    ]);
    for (const count of counts.values())
      expect(count).toBeGreaterThanOrEqual(5);
    expect(
      catalog.templates.filter(
        (t) => t.category === "Presentation" && t.document.pages.length === 10,
      ),
    ).toHaveLength(5);
  });
  it("rejects duplicate IDs, unsupported schema versions, unsafe images and nonfinite geometry", () => {
    const document = structuredClone(templates[0].document);
    document.pages[0].elements.push(document.pages[0].elements[0]);
    expect(() => parseDocument(document)).toThrow();
    expect(() =>
      parseDocument({ ...createDocument(), schemaVersion: 2 }),
    ).toThrow();
    expect(() =>
      parseDocument({ ...createDocument(), width: Infinity }),
    ).toThrow();
    const base = templates[0].document.pages[0].elements[0];
    expect(() =>
      parseDocument({
        ...createDocument(),
        pages: [
          {
            ...createDocument().pages[0],
            elements: [
              { ...base, type: "image", src: "javascript:alert(1)", alt: "" },
            ],
          },
        ],
      }),
    ).toThrow();
  });
  it("duplicates IDs and preserves group relationships without mutating the original", () => {
    const source = structuredClone(templates[0].document);
    source.pages[0].elements[0].groupId = "group";
    source.pages[0].elements[1].groupId = "group";
    const copied = duplicateDocument(source);
    expect(copied.pages[0].id).not.toBe(source.pages[0].id);
    expect(copied.pages[0].elements[0].groupId).toBe(
      copied.pages[0].elements[1].groupId,
    );
    expect(copied.pages[0].elements[0].groupId).not.toBe("group");
    expect(source.pages[0].elements[0].groupId).toBe("group");
  });
  it("escapes user text in exported SVG", () => {
    const doc = structuredClone(templates[0].document);
    const text = doc.pages[0].elements.find(
      (element) => element.type === "text",
    )!;
    if (text.type === "text") text.text = '<script>alert("x")</script>&';
    const svg = serializeSvg(doc, doc.pages[0]);
    expect(svg).not.toContain("<script>");
    expect(svg).toContain("&lt;script&gt;");
  });
});
