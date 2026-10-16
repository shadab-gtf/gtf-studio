import { createRequire } from "node:module";
import { mkdir, readFile, copyFile } from "node:fs/promises";
import { build } from "esbuild";
const require = createRequire(import.meta.url);
const nextRequire = createRequire(require.resolve("next/package.json"));
const sharp = nextRequire("sharp");
await mkdir("public/icons", { recursive: true });
await mkdir("public/fonts", { recursive: true });
await mkdir("public/studio-assets/runtime", { recursive: true });
await Promise.all(
  ["ort-wasm-simd-threaded.wasm", "ort-wasm-simd-threaded.mjs"].map((name) =>
    copyFile(`node_modules/onnxruntime-web/dist/${name}`, `public/studio-assets/runtime/${name}`),
  ),
);
await copyFile(
  "node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  "public/fonts/manrope-latin-wght-normal.woff2",
);
await copyFile(
  "node_modules/@fontsource-variable/manrope/LICENSE",
  "public/fonts/manrope-LICENSE.txt",
);
const svg = await readFile("public/icon.svg");
await Promise.all(
  [192, 512].map((size) =>
    sharp(svg).resize(size, size).png().toFile(`public/icons/icon-${size}.png`),
  ),
);
await sharp(svg)
  .resize(360, 360)
  .extend({ top: 76, bottom: 76, left: 76, right: 76, background: "#ffffff" })
  .png()
  .toFile("public/icons/maskable-512.png");
await build({
  entryPoints: ["src/features/pwa/service-worker.ts"],
  outfile: "public/sw.js",
  bundle: true,
  minify: true,
  target: "es2022",
});
