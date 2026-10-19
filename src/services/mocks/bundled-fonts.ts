import type { FontChoice } from "@/services/contracts/font-service";
import editorialFonts from "../../../public/fonts/display/editorial-sources.json";

/** Keep the reference template's editor and export fonts available offline. */
export function bundledFontSource(choice: FontChoice): string | undefined {
  const bundled = editorialFonts.find(
    (font) =>
      font.id === choice.id &&
      font.weight === choice.weight &&
      font.style === choice.style &&
      font.subset === choice.subset,
  );
  if (bundled) return bundled.url;
  if (choice.subset !== "latin" || choice.style !== "normal") return undefined;
  if (choice.id === "italiana" && choice.weight === 400)
    return "/fonts/display/italiana-400.woff2";
  if (choice.id === "manrope" && choice.weight >= 200 && choice.weight <= 800)
    return "/fonts/manrope-latin-wght-normal.woff2";
  return undefined;
}
