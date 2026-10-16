import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

import {
  addHeading,
  closePanel,
  expectSaved,
  openLayers,
  openStudio,
} from "./helpers/editor";

test("double click or double tap edits canvas text, supports undo, and persists after reload", async ({
  page,
}, testInfo) => {
  await openStudio(page);
  await expect(await openLayers(page)).toHaveCount(6);
  await closePanel(page, "Layers");
  const textarea = page.locator('textarea[data-fabric="textarea"]');
  async function editHeading() {
    const box = await page.locator("[data-artboard]").first().boundingBox();
    if (!box) throw new Error("The artboard is missing.");
    const x = box.x + box.width * 0.25;
    const y = box.y + box.height * 0.32;
    if (testInfo.project.name === "mobile") {
      await page.touchscreen.tap(x, y);
      await page.touchscreen.tap(x, y);
    } else {
      await page.mouse.dblclick(x, y);
    }
    await expect(textarea).toBeAttached();
  }
  await editHeading();
  const original = await textarea.inputValue();
  expect(original).toContain("Ideas in");
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("Direct canvas edit");
  await page.keyboard.press("Escape");
  await page.getByTestId("ed-undo").click();
  await editHeading();
  await expect(textarea).toHaveValue(original);
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("Saved canvas edit");
  await page.keyboard.press("Escape");
  await expectSaved(page);
  await page.reload();
  await expect(await openLayers(page)).toHaveCount(6);
  await closePanel(page, "Layers");
  await editHeading();
  await expect(textarea).toHaveValue("Saved canvas edit");
});

test("expanded canvas adds text, shapes and images, groups layers, and restores local edits", async ({
  page,
}, testInfo) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openStudio(page);
  const initial = await (await openLayers(page)).count();
  expect(initial).toBe(6);
  await page.getByRole("button", { name: "Close Layers", exact: true }).click();

  await addHeading(page, "A GTF idea worth keeping");
  await expect(await openLayers(page)).toHaveCount(initial + 1);
  await expect(
    page.getByRole("treeitem").filter({ hasText: "A GTF idea worth keeping" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close Layers", exact: true }).click();

  await page.getByTestId("ed-add-entry-shapes").click();
  await page.getByTestId("shape-rect").click();
  await closePanel(page, "Shapes");
  await expect(await openLayers(page)).toHaveCount(initial + 2);
  await page.getByRole("button", { name: "Close Layers", exact: true }).click();
  await page.getByTestId("ed-undo").click();
  await expect(await openLayers(page)).toHaveCount(initial + 1);
  await page.getByRole("button", { name: "Close Layers", exact: true }).click();
  await page.getByTestId("ed-redo").click();

  await page.getByTestId("ed-add-entry-image").click();
  const choosing = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /Click to upload/ }).click();
  await (await choosing).setFiles("public/icons/icon-192.png");
  await page
    .getByTestId("uploaded-thumb")
    .filter({ hasText: "icon-192.png" })
    .click();
  await closePanel(page, "Images");
  await expect(await openLayers(page)).toHaveCount(initial + 3);

  if (testInfo.project.name !== "mobile") {
    const rows = page.getByRole("treeitem");
    await rows.nth(0).click();
    await rows.nth(1).click({ modifiers: ["Shift"] });
    await page.keyboard.press("ControlOrMeta+g");
    await expect(rows).toHaveCount(initial + 2);
    await expect(
      page.getByRole("button", { name: "Expand group", exact: true }),
    ).toBeVisible();
  }
  const finalCount = await page.getByRole("treeitem").count();
  await page.getByRole("button", { name: "Close Layers", exact: true }).click();
  await expectSaved(page);
  await page.reload();
  await expect(page.locator("canvas.upper-canvas").first()).toBeVisible();
  await expect(await openLayers(page)).toHaveCount(finalCount);
  await expect(
    page.getByRole("treeitem").filter({ hasText: "A GTF idea worth keeping" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("expanded editor uploads and applies a local font", async ({ page }) => {
  test.setTimeout(120000);
  await openStudio(page);
  await addHeading(page, "Our own typeface");
  await (
    await openLayers(page)
  )
    .filter({ hasText: "Our own typeface" })
    .click();
  await page.getByRole("button", { name: "Close Layers", exact: true }).click();
  await page.getByTestId("ed-font").click();
  await page.getByTestId("font-search").fill("The Alarm");
  await page.getByRole("option", { name: "The Alarm", exact: true }).click();
  await expect(page.getByTestId("ed-font")).toContainText("The Alarm");
  await page.getByTestId("ed-font").click();
  await page.getByTestId("font-upload-row").click();
  await page
    .getByTestId("font-file-input")
    .setInputFiles("public/fonts/manrope-latin-wght-normal.woff2");
  await page.getByTestId("font-upload-submit").click();
  await expect(page.getByTestId("font-upload-success")).toBeVisible({
    timeout: 30000,
  });
  await page.getByTestId("font-upload-use").click();
  await expect(page.getByTestId("ed-font")).toContainText("manrope");
  await expectSaved(page);
  await page.reload();
  await expect(page.locator("canvas.upper-canvas").first()).toBeVisible();
  await (
    await openLayers(page)
  )
    .filter({ hasText: "Our own typeface" })
    .click();
  await page.getByRole("button", { name: "Close Layers", exact: true }).click();
  await expect(page.getByTestId("ed-font")).toContainText("manrope");
});

test("pointer selection shows relevant text, shape and image tools; animations affect only the selection", async ({ page }, testInfo) => {
  test.setTimeout(120000);
  await openStudio(page);
  await expect(await openLayers(page)).toHaveCount(6);
  await closePanel(page, "Layers");
  async function selectAt(xRatio: number, yRatio: number) {
    const box = await page.locator("[data-artboard]").first().boundingBox();
    if (!box) throw new Error("The artboard is missing.");
    if (testInfo.project.name === "mobile") await page.touchscreen.tap(box.x + box.width * xRatio, box.y + box.height * yRatio);
    else await page.mouse.click(box.x + box.width * xRatio, box.y + box.height * yRatio);
  }
  await selectAt(.25, .32);
  await expect(page.getByTestId("ed-context-strip")).toHaveAttribute("data-kind", "text");
  await expect(page.getByTestId("ed-font")).toBeVisible();
  await page.getByTestId("ed-add-entry-animate").click();
  await expect(page.getByTestId("animate-selected")).toContainText("1");
  await page.getByTestId("animate-enter-fade").click();
  await expect(page.getByTestId("animate-enter-fade")).toHaveAttribute("aria-pressed", "true");
  await closePanel(page, "Animate");
  await selectAt(.82, .18);
  await expect(page.getByTestId("ed-context-strip")).toHaveAttribute("data-kind", "shape");
  await expect(page.getByTestId("ed-fill")).toBeVisible();
  await page.getByTestId("ed-add-entry-animate").click();
  await expect(page.getByTestId("animate-enter-fade")).toHaveAttribute("aria-pressed", "false");
  await closePanel(page, "Animate");

  await page.getByTestId("ed-add-entry-image").click();
  const choosing = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: /Click to upload/ }).click();
  await (await choosing).setFiles("public/icons/icon-192.png");
  await page.getByTestId("uploaded-thumb").filter({ hasText: "icon-192.png" }).click();
  await closePanel(page, "Images");
  await selectAt(.1, .7);
  await expect(page.getByTestId("ed-context-strip")).toHaveAttribute("data-kind", "page");
  await selectAt(.5, .5);
  await expect(page.getByTestId("ed-context-strip")).toHaveAttribute("data-kind", "image");
  for (const id of ["ed-crop", "ed-replace-image", "ed-adjust", "ed-frame"]) await expect(page.getByTestId(id)).toBeVisible();
  await expectSaved(page);
});

test("expanded downloads produce actual PNG, SVG, PDF and PowerPoint files", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Download payloads are verified once in Chromium.",
  );
  test.setTimeout(120000);
  await openStudio(page);
  for (const format of ["PNG", "SVG", "PDF"]) {
    await page.getByTestId("ed-share").click();
    const downloaded = page.waitForEvent("download", { timeout: 45000 });
    await page
      .getByRole("menuitem", { name: new RegExp(`^${format}`) })
      .click();
    const download = await downloaded;
    const target = testInfo.outputPath(`expanded.${format.toLowerCase()}`);
    await download.saveAs(target);
    expect(await download.failure()).toBeNull();
    const bytes = await readFile(target);
    expect(bytes.length).toBeGreaterThan(200);
    if (format === "PNG") expect(bytes.subarray(1, 4).toString()).toBe("PNG");
    if (format === "SVG") expect(bytes.toString()).toContain("<svg");
    if (format === "PDF") expect(bytes.subarray(0, 4).toString()).toBe("%PDF");
  }
  await page.getByTestId("ed-share").click();
  await page.getByRole("menuitem", { name: "More options…", exact: true }).click();
  await page.getByRole("radio", { name: /PowerPoint/ }).click();
  const downloading = page.waitForEvent("download", { timeout: 45000 });
  await page.getByRole("dialog").getByRole("button", { name: "Download", exact: true }).click();
  const download = await downloading;
  const target = testInfo.outputPath("expanded.pptx");
  await download.saveAs(target);
  expect(await download.failure()).toBeNull();
  expect((await readFile(target)).subarray(0, 2).toString()).toBe("PK");
});

test("expanded template browser adds a deck and presents its pages", async ({
  page,
}) => {
  test.setTimeout(120000);
  await openStudio(page);
  await page.getByTestId("ed-add-entry-templates").click();
  await page.getByTestId("template-search").fill("Electric presentation");
  await page
    .getByRole("button", {
      name: "Use template Electric presentation",
      exact: true,
    })
    .click();
  await page
    .getByRole("menuitem", { name: "Add all 10 pages", exact: true })
    .click();
  await expect(page.getByTestId("ed-pages-text")).toContainText("11");
  const closeTemplates = page.getByRole("button", {
    name: "Close Templates",
    exact: true,
  });
  if (await closeTemplates.isVisible()) await closeTemplates.click();
  await expectSaved(page);
  await page.getByTestId("ed-share").click();
  await page
    .getByRole("menuitem", { name: "Present full screen", exact: true })
    .click();
  const presenter = page.getByRole("dialog", {
    name: "Presentation",
    exact: true,
  });
  await expect(presenter).toBeVisible();
  await expect(page.getByTestId("present-counter")).toContainText("/ 11");
  await presenter
    .getByRole("button", { name: "Next page", exact: true })
    .click();
  await expect(page.getByTestId("present-counter")).toContainText("3 / 11");
  await presenter
    .getByRole("button", { name: "Exit presentation", exact: true })
    .click();
  await expect(presenter).not.toBeVisible();
  await page.reload();
  await expect(page.getByTestId("ed-pages-text")).toContainText("11");
});

test("expanded mobile and dark chrome retains readable, usable controls", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await openStudio(page);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.getByTestId("ed-topbar-title")).toBeVisible();
  await expectSaved(page);
  await page.screenshot({ path: testInfo.outputPath("expanded-dark.png") });
  const geometry = await page.getByTestId("ed-topbar").evaluate((el) => ({
    right: el.getBoundingClientRect().right,
    viewport: innerWidth,
    color: getComputedStyle(el).backgroundColor,
  }));
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewport);
  expect(geometry.color).toBe("rgb(23, 29, 38)");
  if (testInfo.project.name === "mobile") {
    for (const id of ["ed-undo", "ed-redo", "ed-share", "ed-add-entry-text"]) {
      const box = await page.getByTestId(id).boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  }
  await page.getByTestId("ed-add-entry-shapes").click();
  await expect(page.getByTestId("shape-rect")).toBeVisible();
  await page.getByRole("button", { name: "Close Shapes", exact: true }).click();
});
