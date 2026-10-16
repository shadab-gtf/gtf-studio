import { mkdir, readFile, writeFile } from "node:fs/promises";
const directory = "artifacts/font-review";
await mkdir(`${directory}/details`, { recursive: true });
const candidates = JSON.parse(
  await readFile(`${directory}/candidates.json`, "utf8"),
);
const licenses = new Map([
  ["OFL (SIL Open Font License)", "OFL-1.1"],
  ["MIT (X11) License", "MIT"],
  ["Apache 2.0", "Apache-2.0"],
  ["CC-0", "CC0-1.0"],
  ["CC-BY", "CC-BY"],
  ["CC-BY-SA", "CC-BY-SA"],
  ["Public Domain (not a license)", "Public-Domain"],
  ["Bitstream Vera License (and derivative projects)", "Bitstream-Vera"],
  ["GPL with font exception", "GPL-font-exception"],
  ["GUST Font License", "GUST"],
  ["M+ Fonts Project License", "Mplus"],
]);
let cursor = 0;
const reviewed = [];
const rejected = [];
async function cached(url, name) {
  const path = `${directory}/details/${name}`;
  try {
    return await readFile(path, "utf8");
  } catch {
    const response = await fetch(url, { signal: AbortSignal.timeout(25000) });
    if (!response.ok) throw new Error(String(response.status));
    const text = await response.text();
    await writeFile(path, text);
    return text;
  }
}
const clean = (s) =>
  s
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]*>/g, "")
    .trim();
async function worker() {
  while (cursor < candidates.length) {
    const index = cursor++,
      candidate = candidates[index];
    try {
      const html = await cached(candidate.source, `${candidate.id}.html`);
      const rawLicense = html.match(
        /<a property="license" href="([^"]+)">([^<]+)<\/a>/,
      );
      const license = licenses.get(clean(rawLicense?.[2] ?? ""));
      if (!license) {
        rejected.push({
          ...candidate,
          reason: rawLicense?.[2] ?? "No verified license",
        });
        continue;
      }
      const family = clean(
        html.match(/property="name" content="([^"]+)"/)?.[1] ??
          candidate.family,
      );
      if (!/^[\p{L}\p{N} _-]+$/u.test(family)) {
        rejected.push({
          ...candidate,
          reason: "Family name requires additional normalization",
        });
        continue;
      }
      const css = await cached(
        `https://fontlibrary.org/face/${candidate.id}`,
        `${candidate.id}.css`,
      );
      const rules = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(
        (match) => match[1],
      );
      const faces = rules.filter((rule) => {
        const cssFamily = rule.match(/font-family:\s*['"]([^'"]+)/)?.[1];
        return cssFamily?.toLowerCase() === family.toLowerCase();
      });
      const selected = faces.length ? faces : rules.slice(0, 1);
      const files = selected.flatMap((rule) => {
        const path = rule.match(/url\(['"]?([^'"\)]+)['"]?\)/)?.[1];
        if (!path) return [];
        const url = new URL(path, "https://fontlibrary.org").href;
        if (!url.startsWith("https://fontlibrary.org/assets/fonts/")) return [];
        const rawWeight =
          rule.match(/font-weight:\s*([^;]+)/)?.[1]?.trim() ?? "normal";
        const weight = rawWeight === "bold" ? 700 : Number(rawWeight) || 400;
        const style = rule.includes("font-style: italic") ? "italic" : "normal";
        return [{ url, weight, style }];
      });
      if (!files.length) {
        rejected.push({ ...candidate, reason: "No usable font file" });
        continue;
      }
      reviewed.push({
        id: `fl-${candidate.id}`,
        family,
        weights: [...new Set(files.map((f) => f.weight))],
        styles: [...new Set(files.map((f) => f.style))],
        subsets: ["full"],
        defSubset: "full",
        category: clean(
          html.match(/search\?category=[^"]+">([^<]+)</)?.[1] ?? "display",
        ).toLowerCase(),
        license,
        licenseUrl: rawLicense[1],
        source: candidate.source,
        provider: "fontlibrary",
        files,
      });
    } catch (error) {
      rejected.push({ ...candidate, reason: error.message });
    }
    if (index % 100 === 0)
      console.log(
        `Reviewed ${index}/${candidates.length}; accepted ${reviewed.length}.`,
      );
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
await writeFile(
  `${directory}/approved.json`,
  JSON.stringify(reviewed, null, 2),
);
await writeFile(
  `${directory}/rejected.json`,
  JSON.stringify(rejected, null, 2),
);
console.log(`Approved ${reviewed.length}; excluded ${rejected.length}.`);
