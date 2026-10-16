import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const root = JSON.parse(await readFile("package.json", "utf8"));
const dependencies = [];
for (const [scope, packages] of Object.entries({
  runtime: root.dependencies,
  development: root.devDependencies,
})) {
  for (const name of Object.keys(packages)) {
    const installed = JSON.parse(
      await readFile(join("node_modules", name, "package.json"), "utf8"),
    );
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(name)}`,
      { signal: AbortSignal.timeout(20000) },
    );
    if (!response.ok)
      throw new Error(`Cannot review registry metadata for ${name}`);
    const metadata = await response.json();
    dependencies.push({
      name,
      scope,
      version: installed.version,
      license: installed.license ?? "REVIEW REQUIRED",
      repository:
        typeof installed.repository === "object"
          ? installed.repository.url
          : installed.repository,
      releaseDate: metadata.time?.[installed.version] ?? null,
      latestVersion: metadata["dist-tags"]?.latest,
      deprecated: metadata.versions?.[installed.version]?.deprecated ?? null,
    });
  }
}
await mkdir("docs", { recursive: true });
await writeFile(
  "docs/dependency-licenses.json",
  JSON.stringify(
    {
      reviewedAt: new Date().toISOString(),
      source: "Installed package manifests and the public npm registry",
      dependencies,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Recorded license and maintenance metadata for ${dependencies.length} direct dependencies.`,
);
if (dependencies.some((dependency) => dependency.license === "REVIEW REQUIRED"))
  process.exitCode = 1;
