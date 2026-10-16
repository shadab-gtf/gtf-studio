import { describe, expect, it } from "vitest";
import { z } from "zod";
import catalog from "../../public/fonts/catalog.json";
import { fontSchema } from "@/services/contracts/font-service";
describe("font inventory", () => {
  it("contains more than 3000 distinct families with license metadata", () => {
    const fonts = z.array(fontSchema).parse(catalog);
    const names = new Set(
      fonts.map((font) => font.family.toLowerCase().replace(/[^a-z0-9]/g, "")),
    );
    expect(names.size).toBeGreaterThan(3000);
    expect(names.size).toBe(fonts.length);
    for (const font of fonts) {
      expect(font.license).toBeTruthy();
      if (font.provider === "fontlibrary") {
        expect(font.source).toContain("fontlibrary.org");
        expect(font.licenseUrl).toBeTruthy();
        expect(font.files?.length).toBeGreaterThan(0);
      }
    }
  });
});
