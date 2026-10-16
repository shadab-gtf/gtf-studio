import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import {
  addHeading,
  closePanel,
  expectSaved,
  openLayers,
  openStudio,
  waitForEditor,
} from "./helpers/editor";

test("right-click actions duplicate and delete a canvas object", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile",
    "Touch editing is covered by the double-tap workflow.",
  );
  await openStudio(page);
  await expect(await openLayers(page)).toHaveCount(6);
  await closePanel(page, "Layers");
  const artboard = await page.locator("[data-artboard]").first().boundingBox();
  if (!artboard) throw new Error("Artboard is missing.");
  await page.mouse.click(
    artboard.x + artboard.width * 0.25,
    artboard.y + artboard.height * 0.32,
    { button: "right" },
  );
  await page.getByRole("menuitem", { name: /^Duplicate/ }).click();
  await expect(await openLayers(page)).toHaveCount(7);
  await closePanel(page, "Layers");
  await page.keyboard.press("Delete");
  await expect(await openLayers(page)).toHaveCount(6);
  await closePanel(page, "Layers");
  await page.getByTestId("ed-undo").click();
  await expect(await openLayers(page)).toHaveCount(7);
});

test("editable backup downloads and restores as a new project", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Portable backup bytes and restore are verified once.",
  );
  test.setTimeout(120000);
  await openStudio(page);
  await addHeading(page, "Our portable idea");
  await expectSaved(page);
  await page.getByRole("button", { name: "Back up or restore design" }).click();
  const downloading = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download backup", exact: true })
    .click();
  const download = await downloading;
  const file = testInfo.outputPath("portable.gtf-backup.json");
  await download.saveAs(file);
  expect(await download.failure()).toBeNull();
  const backup: {
    format: string;
    document: { pages: { objects: { text?: string }[] }[] };
  } = JSON.parse(await readFile(file, "utf8"));
  expect(backup.format).toBe("gtf-studio-backup");
  expect(
    backup.document.pages[0].objects.some(
      (object) => object.text === "Our portable idea",
    ),
  ).toBe(true);
  const before = page.url();
  const chooser = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "Choose backup", exact: true })
    .click();
  await (await chooser).setFiles(file);
  await expect(page).not.toHaveURL(before);
  await waitForEditor(page);
  await expect(
    (await openLayers(page)).filter({ hasText: "Our portable idea" }),
  ).toBeVisible();
});
