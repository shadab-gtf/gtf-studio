import { readFile, writeFile } from "node:fs/promises";
const google = JSON.parse(
  await readFile("public/fonts/catalog.json", "utf8"),
).filter((font) => font.provider !== "fontlibrary");
const additional = JSON.parse(
  await readFile("artifacts/font-review/approved.json", "utf8"),
);
for (const font of additional) {
  const html = await readFile(
    `artifacts/font-review/details/${font.id.slice(3)}.html`,
    "utf8",
  );
  font.author = (
    html.match(/<dt>Designer<\/dt>\s*<dd>([\s\S]*?)<\/dd>/)?.[1] ??
    html.match(/<dt>Author<\/dt>\s*<dd>([\s\S]*?)<\/dd>/)?.[1] ??
    "See original family page"
  )
    .replace(/<[^>]+>/g, "")
    .trim();
  if (font.category === "monospaced") font.category = "monospace";
}
const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const unique = new Map();
for (const font of [...google, ...additional])
  if (!unique.has(normalize(font.family)))
    unique.set(normalize(font.family), font);
const result = [...unique.values()].sort((a, b) =>
  a.family.localeCompare(b.family),
);
await writeFile("public/fonts/fontlibrary.json", JSON.stringify(additional));
await writeFile("public/fonts/catalog.json", JSON.stringify(result));
await writeFile(
  "public/fonts/provenance.json",
  JSON.stringify(
    {
      sources: [
        "https://api.fontsource.org/v1/fonts",
        "https://fontlibrary.org/en/catalogue",
      ],
      syncedAt: new Date().toISOString(),
      familyCount: result.length,
      styleCount: result.reduce(
        (n, font) =>
          n + (font.files?.length ?? font.weights.length * font.styles.length),
        0,
      ),
      deduplication:
        "Case-insensitive alphanumeric family names. First source retained.",
      review:
        "Each additional entry retains its family page, license URL, and exact font file URL. Unknown, freeware-only and licenses without reviewed embedding terms were excluded. CC BY and CC BY-SA entries retain attribution and license links.",
    },
    null,
    2,
  ),
);
console.log(`Saved ${result.length} distinct font families.`);
