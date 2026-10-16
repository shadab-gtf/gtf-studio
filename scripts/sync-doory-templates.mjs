import {
  readFile,
  writeFile,
  mkdir,
  copyFile,
  readdir,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const reference = path.join(root, "artifacts/references/doory");
const source = path.join(reference, "backend/data/templates");
const thumbnailDirectory = path.join(root, "public/images/doory-templates");
const photoDirectory = path.join(root, "public/media/templates/photos");
const licenseDirectory = path.join(
  root,
  "public/studio-assets/licenses/doory-templates",
);
const manifest = JSON.parse(
  await readFile(path.join(source, "manifest.json"), "utf8"),
);
const templates = [];
const files = [];
for (const directory of [thumbnailDirectory, photoDirectory, licenseDirectory])
  await mkdir(directory, { recursive: true });

async function record(relative, destination) {
  const filename = path.join(source, relative);
  const bytes = await readFile(filename);
  files.push({
    file: relative.replaceAll("\\", "/"),
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
  if (destination) await copyFile(filename, destination);
  return bytes;
}

for (const entry of manifest.templates) {
  if (!/^[a-z0-9-]+$/.test(entry.slug))
    throw new Error("Invalid reference template slug.");
  const bytes = await record(`${entry.slug}.json`);
  const document = JSON.parse(bytes.toString("utf8"));
  templates.push({ ...entry, document });
  await record(
    `thumbs/${entry.slug}.webp`,
    path.join(thumbnailDirectory, `${entry.slug}.webp`),
  );
}
for (const name of await readdir(path.join(source, "photos"))) {
  if (!/^[a-z0-9-]+\.webp$/.test(name))
    throw new Error("Unexpected reference photo filename.");
  await record(`photos/${name}`, path.join(photoDirectory, name));
}
await writeFile(
  path.join(root, "src/services/mocks/doory-template-data.json"),
  JSON.stringify({ version: 1, templates }) + "\n",
);
for (const name of ["LICENSE", "NOTICE", "THIRD_PARTY.md"])
  await copyFile(path.join(reference, name), path.join(licenseDirectory, name));
await writeFile(
  path.join(licenseDirectory, "provenance.json"),
  JSON.stringify(
    {
      source: "https://github.com/shaongitbd/doory",
      commit: "96de4342093f277912ffd5c2a4137c3ca027b6b1",
      reaEvidence:
        "ev_4f62bac6e6fdd5f86c1ff5d0a0b392a7300a96125b49cf29e336f7560f655486",
      templateLicense: "Attribution Assurance License",
      photoLicense: "CC0-1.0",
      licenseEvidence: "THIRD_PARTY.md:192,203-215; LICENSE; NOTICE",
      note: "NOTICE's final MIT wording conflicts with the specific template entry in THIRD_PARTY.md. Templates retain the repository's Attribution Assurance License and required attribution.",
      templateCount: templates.length,
      pageCount: templates.reduce(
        (sum, entry) => sum + entry.document.pages.length,
        0,
      ),
      files,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Copied ${templates.length} editable templates, ${files.filter((file) => file.file.startsWith("photos/")).length} photos and matching thumbnails with source hashes and notices.`,
);
