import { mkdir, writeFile } from "node:fs/promises";
import { fashionDesigns } from "./fashion";
import { landscapeDesigns, logoDesigns } from "./landscape";
import { printDesigns, brochureDesigns } from "./print";
import { documentDesigns } from "./documents";
import { boardDesigns } from "./boards";
import { CATEGORIES } from "./builder";

const templates = [
  ...fashionDesigns(),
  ...landscapeDesigns(),
  ...logoDesigns(),
  ...printDesigns(),
  ...brochureDesigns(),
  ...documentDesigns(),
  ...boardDesigns(),
];
for (const [category] of CATEGORIES) {
  const count = templates.filter((t) => t.category === category).length;
  if (count !== 5)
    throw new Error(`${category}: expected 5 designs, found ${count}`);
}
templates.sort(
  (a, b) =>
    CATEGORIES.findIndex((c) => c[0] === a.category) -
    CATEGORIES.findIndex((c) => c[0] === b.category),
);
await mkdir("artifacts/reference-collection", { recursive: true });
await writeFile(
  "artifacts/reference-collection/authored.json",
  JSON.stringify({ version: 1, templates }, null, 2),
);
console.log(
  `Authored ${templates.length} designs across ${CATEGORIES.length} categories.`,
);
