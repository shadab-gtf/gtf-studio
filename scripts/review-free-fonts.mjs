import { mkdir, readFile, writeFile } from "node:fs/promises";
const directory = "artifacts/font-review";
await mkdir(directory, { recursive: true });
const existing = JSON.parse(
  await readFile("public/fonts/catalog.json", "utf8"),
);
const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const names = new Set(existing.map((font) => normalize(font.family)));
const families = new Map();
for (let page = 1; page <= 92; page++) {
  const path = `${directory}/page-${page}.html`;
  let html;
  try {
    html = await readFile(path, "utf8");
  } catch {
    const response = await fetch(
      `https://fontlibrary.org/en/catalogue?page=${page}`,
      { signal: AbortSignal.timeout(20000) },
    );
    if (!response.ok) throw new Error(`Catalogue ${response.status}`);
    html = await response.text();
    await writeFile(path, html);
  }
  const matches = [
    ...html.matchAll(
      /class="family-name heading"><a href="(https:\/\/fontlibrary.org\/en\/font\/([^"]+))">([^<]+)<\/a>/g,
    ),
  ];
  let added = 0;
  for (const [, url, id, family] of matches) {
    if (!names.has(normalize(family)) && !families.has(id)) {
      families.set(id, { id, family, source: url });
      added++;
    }
  }
  if (page % 10 === 0)
    console.log(
      `Reviewed ${page} catalogue pages; ${families.size} additional names awaiting license verification.`,
    );
  if (
    !matches.length ||
    (page > 1 && added === 0 && !html.includes('id="next_button"'))
  )
    break;
}
await writeFile(
  `${directory}/candidates.json`,
  JSON.stringify([...families.values()], null, 2),
);
console.log(
  `Found ${families.size} candidates. None have been added to the product without per-family license verification.`,
);
