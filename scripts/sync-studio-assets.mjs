/** Rebuild licensed, static editor catalogs; never starts the reference backend. */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { gunzipSync } from "node:zlib";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.resolve(
  process.env.DOORY_SOURCE ?? path.join(root, "artifacts/references/doory"),
);
const data = path.join(source, "backend/data");
const output = path.join(root, "public/studio-assets");
const notices = path.join(root, "licenses/doory");
const publicNotices = path.join(output, "licenses");
const expectedCommit = "96de4342093f277912ffd5c2a4137c3ca027b6b1";
const sourceCommit = execFileSync("git", ["-C", source, "rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
if (sourceCommit !== expectedCommit)
  throw new Error(
    `Expected Doory ${expectedCommit}; review changed manifests before updating.`,
  );
const hash = (bytes, algorithm = "sha256", encoding = "hex") =>
  createHash(algorithm).update(bytes).digest(encoding);
const readJson = async (file) => JSON.parse(await fs.readFile(file, "utf8"));
async function write(file, bytes) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, bytes);
}
async function json(file, value) {
  await write(file, `${JSON.stringify(value)}\n`);
}
async function download(url, maximum = 40 * 1024 * 1024) {
  if (!url.startsWith("https://")) throw new Error(`HTTPS required: ${url}`);
  const response = await fetch(url, {
    signal: AbortSignal.timeout(120000),
    headers: { "User-Agent": "GTF-Studio-Asset-Sync/1.0" },
  });
  if (!response.ok) throw new Error(`${response.status} downloading ${url}`);
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > maximum) throw new Error(`Download exceeds limit: ${url}`);
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
async function verifiedDownload(urls, expected, target, maximum) {
  const existing = await fs.readFile(target).catch(() => null);
  if (existing && hash(existing) === expected) return existing;
  const failures = [];
  for (const url of urls) {
    try {
      const bytes = await download(url, maximum);
      if (hash(bytes) !== expected) throw new Error("SHA-256 mismatch");
      await write(target, bytes);
      return bytes;
    } catch (error) {
      failures.push(`${url}: ${error.message}`);
    }
  }
  throw new Error(failures.join("\n"));
}

await fs.mkdir(notices, { recursive: true });
for (const name of ["LICENSE", "NOTICE", "THIRD_PARTY.md"]) {
  const content = await fs.readFile(path.join(source, name));
  await write(path.join(notices, name), content);
  await write(path.join(publicNotices, `doory-${name}`), content);
}

// The upstream audio library is committed, independently CC0, and hash pinned.
const audio = await readJson(path.join(data, "audio_library.json"));
let audioBytes = 0;
for (const track of audio.tracks) {
  if (!/^[a-z0-9-]+\/[a-z0-9-]+\.ogg$/.test(track.file))
    throw new Error(`Unsafe audio path ${track.file}`);
  const bytes = await fs.readFile(path.join(data, "audio", track.file));
  if (bytes.length !== track.bytes || hash(bytes) !== track.sha256)
    throw new Error(`Audio checksum mismatch: ${track.id}`);
  audioBytes += bytes.length;
  await write(path.join(root, "public/media/audio", track.file), bytes);
}
await json(path.join(root, "public/media/audio/index.json"), audio);
await json(path.join(notices, "audio-library.json"), audio);
console.log(
  `Verified ${audio.tracks.length} audio files (${audioBytes} bytes).`,
);

const model = (await readJson(path.join(data, "ml_models.json"))).models.find(
  (entry) => entry.id === "u2netp",
);
const modelUrl = `/studio-assets/models/u2netp-${model.sha256.slice(0, 12)}.onnx`;
const modelBytes = await verifiedDownload(
  model.urls,
  model.sha256,
  path.join(root, "public", modelUrl),
  model.bytes,
);
if (modelBytes.length !== model.bytes)
  throw new Error("Model byte count mismatch");
const modelLicenseUrl =
  "https://raw.githubusercontent.com/xuebinqin/U-2-Net/ac7e1c817ecab7c7dff5ce6b1abba61cd213ff29/LICENSE";
const modelLicense = await download(modelLicenseUrl);
await write(path.join(notices, "U2NET-APACHE-2.0.txt"), modelLicense);
await write(path.join(publicNotices, "U2NET-APACHE-2.0.txt"), modelLicense);
await json(path.join(output, "background-removal.json"), {
  features: { background_removal: true },
  assets: {
    background_removal_model: {
      id: model.id,
      name: model.name,
      url: modelUrl,
      bytes: model.bytes,
      sha256: model.sha256,
      input: model.input,
      output: model.output,
    },
  },
  provenance: { sourceCommit, ...model.license, sourceUrls: model.urls },
});
console.log("Verified U2NET small background-removal model.");

const manifest = await readJson(path.join(data, "element_packs.json"));
const packs = [],
  items = [],
  skipped = [];
const packageCache = new Map();
const allHashes = {};

// Parse regular files only; archives are never executed or extracted onto the filesystem.
function readTar(gzip) {
  const tar = gunzipSync(gzip, { maxOutputLength: 256 * 1024 * 1024 });
  const files = new Map();
  let pendingName = null;
  for (let offset = 0; offset + 512 <= tar.length;) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;
    const field = (start, count) =>
      header
        .subarray(start, start + count)
        .toString()
        .replace(/\0.*$/s, "");
    let name = field(0, 100);
    const prefix = field(345, 155);
    if (prefix) name = `${prefix}/${name}`;
    const size = Number.parseInt(field(124, 12).trim(), 8);
    if (
      !Number.isSafeInteger(size) ||
      size < 0 ||
      offset + 512 + size > tar.length
    )
      throw new Error("Invalid package archive");
    const body = tar.subarray(offset + 512, offset + 512 + size);
    const type = field(156, 1);
    if (type === "L") pendingName = body.toString().replace(/\0.*$/s, "");
    else if (type === "0" || type === "") {
      name = pendingName ?? name;
      pendingName = null;
      if (
        !name.startsWith("package/") ||
        name.includes("\\") ||
        name.split("/").includes("..")
      )
        throw new Error("Unsafe package member");
      files.set(name.slice(8), body);
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
  return files;
}
async function npmFiles(pack) {
  const key = `${pack.source.package}@${pack.source.version}`;
  if (!packageCache.has(key)) {
    const info = JSON.parse(
      (
        await download(
          `https://registry.npmjs.org/${pack.source.package}/${pack.source.version}`,
        )
      ).toString(),
    );
    if (info.dist.integrity !== pack.source.integrity)
      throw new Error(`Registry integrity changed: ${key}`);
    const tgz = await download(info.dist.tarball);
    const [algorithm, digest] = pack.source.integrity.split("-");
    if (hash(tgz, algorithm, "base64") !== digest)
      throw new Error(`Package integrity mismatch: ${key}`);
    packageCache.set(key, readTar(tgz));
  }
  return packageCache.get(key);
}
const title = (name) =>
  name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
const glob = (pattern) =>
  new RegExp(
    `^${pattern
      .split("*")
      .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
      .join("[^/]*")}$`,
  );
function prepareSvg(svg, pack) {
  svg = svg
    .replace(/<\?xml[^>]*\?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();
  const externalCssResource = [...svg.matchAll(/url\s*\(([^)]*)\)/gi)].some(
    (match) => !match[1].replace(/["']/g, "").trim().startsWith("#"),
  );
  if (
    !/^<svg[\s>]/i.test(svg) ||
    externalCssResource ||
    /<(?:script|foreignObject|iframe|image|animate\w*|set)\b|\son\w+\s*=|(?:href|src)\s*=\s*["'](?!#)|javascript\s*:|<!DOCTYPE|<!ENTITY|@import/i.test(
      svg,
    )
  )
    throw new Error("Unsupported active/external SVG content");
  const box = /viewBox\s*=\s*["']([^"']+)["']/i
    .exec(svg)?.[1]
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  const width =
    box?.[2] ?? Number(/\bwidth=["']([\d.]+)/i.exec(svg)?.[1] ?? 100);
  const height =
    box?.[3] ?? Number(/\bheight=["']([\d.]+)/i.exec(svg)?.[1] ?? 100);
  if (
    ![width, height].every(
      (number) => Number.isFinite(number) && number > 0 && number <= 100000,
    )
  )
    throw new Error("Invalid SVG geometry");
  if (pack.normalize?.mode === "mono")
    svg = svg.replace(/currentColor/g, "#17212b");
  if (!/\sxmlns=/.test(svg))
    svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  if (/\bxlink:/.test(svg) && !/\sxmlns:xlink=/.test(svg))
    svg = svg.replace(
      "<svg",
      '<svg xmlns:xlink="http://www.w3.org/1999/xlink"',
    );
  const colors = [
    ...new Set(
      (svg.match(/#[0-9a-f]{3,8}\b/gi) ?? []).map((color) =>
        color.toLowerCase(),
      ),
    ),
  ]
    .filter((color) => [4, 7, 9].includes(color.length))
    .slice(0, 32);
  return { svg, width, height, colors };
}
async function addElement(pack, rawName, svg, tags = []) {
  const withoutSuffix = rawName.replace(/\.svg$/i, "").replaceAll("/", "-");
  const name = pack.naming?.strip_suffix
    ? withoutSuffix.replace(new RegExp(`${pack.naming.strip_suffix}$`), "")
    : withoutSuffix;
  if (pack.naming?.skip && new RegExp(pack.naming.skip).test(name)) return;
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(name)) {
    skipped.push(`${pack.id}/${name}: invalid name`);
    return;
  }
  const id = `${pack.id}-${name}`;
  let prepared;
  try {
    prepared = prepareSvg(svg, pack);
  } catch (error) {
    skipped.push(`${id}: ${error.message}`);
    return;
  }
  const url = `/studio-assets/elements/${pack.id}/${name}.svg`;
  await write(path.join(root, "public", url), prepared.svg);
  allHashes[url] = hash(prepared.svg);
  items.push({
    id,
    name: title(name),
    kind: pack.kind,
    style: pack.style ?? "",
    pack: { id: pack.id, slug: pack.id, name: pack.name },
    tags: [...new Set([...name.toLowerCase().split(/[-_]/), ...tags])],
    svg_url: url,
    width: prepared.width,
    height: prepared.height,
    colors: prepared.colors,
    is_recolorable: prepared.colors.length > 0,
  });
}
async function addPack(pack, files) {
  const start = items.length;
  for (const [name, svg, tags] of files)
    await addElement(pack, name, svg, tags);
  if (items.length > start)
    packs.push({
      id: pack.id,
      slug: pack.id,
      name: pack.name,
      kind: pack.kind,
      thumbnail_url: items[start].svg_url,
      element_count: items.length - start,
      license: pack.license.spdx,
      license_url: `/studio-assets/licenses/${pack.id}.txt`,
      attribution:
        pack.attribution ||
        "Original geometric artwork by Doory contributors, CC0-1.0.",
      source_url: pack.homepage ?? "https://github.com/shaongitbd/doory",
    });
  console.log(`${pack.id}: ${items.length - start} elements.`);
}
async function license(pack, text) {
  await write(
    path.join(publicNotices, `${pack.id}.txt`),
    `${pack.attribution ?? ""}\nSource: ${pack.homepage ?? "https://github.com/shaongitbd/doory"}\n\n${text}`,
  );
}

const generated = path.join(root, "artifacts/studio-generated-elements");
for (const generator of ["generate_shapes.py", "generate_graphics.py"])
  execFileSync(
    process.env.PYTHON ?? "python",
    [path.join(data, generator), generated],
    { encoding: "utf8" },
  );
const cc0 = (
  await download(
    "https://creativecommons.org/publicdomain/zero/1.0/legalcode.txt",
  )
).toString();
const shapePacks = [
  ["basic-shapes", "Basic Shapes", "shape"],
  ["lines-dividers", "Lines & Dividers", "line"],
  ["frames-masks", "Frames & Masks", "frame"],
  ["arrows-callouts", "Arrows & Callouts", "shape"],
].map(([id, name, kind]) => ({
  id,
  name,
  kind,
  style: "",
  source: { type: "generated" },
  license: { spdx: "CC0-1.0" },
}));
for (const pack of [...shapePacks, ...manifest.packs]) {
  if (pack.source.type === "generated") {
    const directory = path.join(generated, pack.id);
    const entries = await fs.readdir(directory, { recursive: true });
    const files = [];
    for (const relative of entries
      .filter((file) => file.endsWith(".svg"))
      .sort())
      files.push([
        relative.replaceAll("\\", "/"),
        await fs.readFile(path.join(directory, relative), "utf8"),
        [],
      ]);
    await license(pack, cc0);
    await addPack(pack, files);
  } else if (pack.source.type === "npm") {
    const files = await npmFiles(pack);
    const declaredLicense = files.get(pack.license.file)?.toString() ?? "";
    const matcher = pack.license.match.replace(/^\(\?s\)/, "");
    if (!new RegExp(matcher, "s").test(declaredLicense))
      throw new Error(`Package license check failed: ${pack.id}`);
    const licenseText =
      pack.files.reader === "iconify-json"
        ? (await download(pack.license.url)).toString()
        : declaredLicense;
    await license(pack, licenseText);
    const entries = [];
    if (pack.files.reader === "iconify-json") {
      const icons = JSON.parse(files.get("icons.json").toString());
      for (const [name, icon] of Object.entries(icons.icons))
        entries.push([
          name,
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon.width ?? icons.width ?? 16} ${icon.height ?? icons.height ?? 16}">${icon.body}</svg>`,
          [],
        ]);
    } else {
      const include = pack.files.include.map(glob),
        exclude = (pack.files.exclude ?? []).map(glob);
      for (const [name, value] of files)
        if (
          name.endsWith(".svg") &&
          include.some((test) => test.test(name)) &&
          !exclude.some((test) => test.test(name))
        )
          entries.push([path.posix.basename(name), value.toString(), []]);
    }
    await addPack(pack, entries);
  } else if (pack.source.type === "urls") {
    const rows = await readJson(
      path.join(data, "element_pack_files", pack.source.index),
    );
    const entries = [];
    for (const row of rows) {
      const cached = path.join(
        root,
        "artifacts/studio-asset-downloads",
        pack.id,
        row.name,
      );
      try {
        const bytes = await verifiedDownload(
          [row.url],
          row.sha256,
          cached,
          2 * 1024 * 1024,
        );
        entries.push([row.name, bytes.toString(), row.tags]);
      } catch (error) {
        skipped.push(`${pack.id}/${row.name}: ${error.message}`);
      }
    }
    await license(pack, cc0);
    await addPack(pack, entries);
  }
}

await json(path.join(output, "elements.json"), { schema: 1, packs, items });
await json(path.join(output, "packs.json"), { schema: 1, packs });
for (const pack of packs)
  await json(path.join(output, "catalogs", `${pack.id}.json`), {
    schema: 1,
    items: items.filter((item) => item.pack.id === pack.id),
  });
await json(path.join(output, "provenance.json"), {
  schema: 1,
  sourceCommit,
  audio: { count: audio.tracks.length, bytes: audioBytes, license: "CC0-1.0" },
  model: {
    id: model.id,
    bytes: model.bytes,
    sha256: model.sha256,
    license: model.license,
  },
  elements: { count: items.length, packs: packs.length, hashes: allHashes },
  skipped,
});
await json(path.join(notices, "element-packs-source.json"), manifest);
await write(
  path.join(notices, "ASSETS.md"),
  `# Static editor assets\n\nSource: https://github.com/shaongitbd/doory/tree/${sourceCommit}\n\n${audio.tracks.length} CC0 audio files; ${items.length} SVG elements in ${packs.length} packs. Individual pack notices are served in public/studio-assets/licenses. Model provenance and hashes are in public/studio-assets/provenance.json.\n\nThe application's Doory-derived code remains subject to the Attribution Assurance License in LICENSE, including prominent author attribution at launch. The independently CC0 artwork/audio do not remove that code attribution requirement.\n`,
);
console.log(
  JSON.stringify({
    audio: audio.tracks.length,
    model: model.id,
    elements: items.length,
    packs: packs.length,
    skipped: skipped.length,
  }),
);
