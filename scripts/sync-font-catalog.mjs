import { mkdir, readFile, writeFile } from "node:fs/promises";
const response = await fetch("https://api.fontsource.org/v1/fonts", {
  signal: AbortSignal.timeout(30000),
});
if (!response.ok)
  throw new Error(`Font metadata download failed (${response.status})`);
const data = await response.json();
if (!Array.isArray(data)) throw new Error("Invalid font catalog");
const licenses = new Set([
  "OFL-1.1",
  "Apache-2.0",
  "MIT",
  "UFL-1.0",
  "CC0-1.0",
  "CC-BY-4.0",
  "CC-BY-3.0",
]);
let additional = [];
try {
  additional = JSON.parse(
    await readFile("public/fonts/fontlibrary.json", "utf8"),
  );
} catch {
  /* Initial import can run without the secondary catalog. */
}
const families = [
  ...data.filter((font) => licenses.has(font.license)),
  ...additional,
];
const entries = new Map();
for (const font of families) {
  const key = font.family.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!entries.has(key)) entries.set(key, font);
}
const unique = [...entries.values()].sort((a, b) =>
  a.family.localeCompare(b.family),
);
await mkdir("public/fonts", { recursive: true });
await writeFile("public/fonts/catalog.json", JSON.stringify(unique));
await writeFile(
  "public/fonts/provenance.json",
  JSON.stringify(
    {
      sources: ["https://api.fontsource.org/v1/fonts", "https://fontlibrary.org/en/catalogue"],
      syncedAt: new Date().toISOString(),
      familyCount: unique.length,
      googleFamilies: unique.filter((font) => font.provider !== "fontlibrary").length,
      supplementalFamilies: unique.filter((font) => font.provider === "fontlibrary").length,
      styleCount: unique.reduce(
        (n, font) => n + (font.files?.length ?? font.weights.length * font.styles.length),
        0,
      ),
      googleLicensePolicy: [...licenses],
      supplementalLicensePolicy: [...new Set(additional.map((font) => font.license))],
      targetFamilyCount: 3001,
      note: "Distinct family count, not style count. Additional catalogs require per-family license and duplicate review.",
    },
    null,
    2,
  ),
);
console.log(`${unique.length} distinct licensed font families saved.`);
