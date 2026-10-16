import { expect, test, type Page } from "@playwright/test";
import { closePanel, expectSaved, openLayers, openStudio } from "./helpers/editor";

/** Read only this isolated test context's project, without reaching into the editor instance. */
async function savedImage(page: Page) {
  return page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("gtf-studio-v1");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const project = await new Promise<{ document: { studio?: { pages: { objects: { type: string; name?: string; src?: string; assetId?: string }[] }[] } } }>((resolve, reject) => {
        const request = db.transaction("projects").objectStore("projects").get("welcome-bloom");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return project.document.studio?.pages[0].objects.find(object => object.type === "image" && object.name === "resume-portrait.webp") ?? null;
    } finally { db.close(); }
  });
}

test("local background removal creates transparent pixels, supports undo/redo, and survives reload", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Run actual model inference once in desktop Chromium.");
  test.setTimeout(150000);
  const errors: string[] = [];
  const modelRequests: string[] = [];
  let workers = 0;
  page.on("pageerror", error => errors.push(error.message));
  page.on("worker", () => { workers++; });
  page.on("request", request => { if (/\/studio-assets\/(models|runtime)\//.test(request.url())) modelRequests.push(request.url()); });
  await openStudio(page);
  await page.getByTestId("ed-add-entry-image").click();
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /Click to upload/ }).click();
  await (await chooser).setFiles("public/media/templates/photos/resume-portrait.webp");
  await page.getByTestId("uploaded-thumb").filter({ hasText: "resume-portrait.webp" }).click();
  await closePanel(page, "Images");
  await expectSaved(page);
  const original = await savedImage(page);
  expect(original?.src).toMatch(/^idb:\/\//);

  await page.getByTestId("ed-remove-bg").click();
  const dialog = page.getByRole("dialog", { name: "Remove Background", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog).not.toBeVisible({ timeout: 90000 });
  await expectSaved(page);
  await expect.poll(async () => (await savedImage(page))?.src).not.toBe(original?.src);
  const cutout = await savedImage(page);
  expect(cutout?.assetId).toBeTruthy();
  expect(workers).toBeGreaterThan(0);
  expect(modelRequests.some(url => url.endsWith(".onnx"))).toBe(true);
  expect(modelRequests.some(url => url.endsWith(".wasm"))).toBe(true);
  for (const url of modelRequests) expect(new URL(url).origin).toBe(new URL(page.url()).origin);

  const pixels = await page.evaluate(async id => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("gtf-studio-editor-v1");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    let blob: Blob;
    try {
      blob = await new Promise<Blob>((resolve, reject) => {
        const request = db.transaction("assets").objectStore("assets").get(id!);
        request.onsuccess = () => resolve(request.result.blob);
        request.onerror = () => reject(request.error);
      });
    } finally { db.close(); }
    const bitmap = await createImageBitmap(blob);
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d")!;
    context.drawImage(bitmap, 0, 0);
    const data = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
    let transparent = 0, opaque = 0;
    for (let index = 3; index < data.length; index += 4) { if (data[index] < 20) transparent++; if (data[index] > 235) opaque++; }
    bitmap.close();
    return { type: blob.type, transparent, opaque, count: data.length / 4 };
  }, cutout?.assetId);
  expect(pixels.type).toBe("image/png");
  expect(pixels.transparent / pixels.count).toBeGreaterThan(.1);
  expect(pixels.opaque / pixels.count).toBeGreaterThan(.05);
  await page.screenshot({ path: testInfo.outputPath("portrait-background-removed.png") });

  await page.getByTestId("ed-undo").click();
  await expect.poll(async () => (await savedImage(page))?.src).toBe(original?.src);
  await page.getByTestId("ed-redo").click();
  await expect.poll(async () => (await savedImage(page))?.src).toBe(cutout?.src);
  await page.reload();
  await (await openLayers(page)).filter({ hasText: "resume-portrait.webp" }).click();
  await closePanel(page, "Layers");
  await expect(page.getByTestId("ed-remove-bg")).toBeVisible();
  expect((await savedImage(page))?.src).toBe(cutout?.src);
  expect(errors).toEqual([]);
});
