import { expect, type Page } from "@playwright/test";

export const canvasText = (page: Page) =>
  page.locator('textarea[data-fabric="textarea"]');

export async function waitForEditor(page: Page) {
  await expect(
    page.getByRole("application", { name: "Design editor" }),
  ).toBeVisible({ timeout: 30000 });
  await expect(page.locator("canvas.upper-canvas").first()).toBeVisible();
}

export async function openStudio(page: Page) {
  await page.goto("/editor/welcome-bloom", { waitUntil: "domcontentloaded" });
  await waitForEditor(page);
  await expect(page.getByTestId("ed-topbar-title")).toHaveValue(
    "In full bloom",
  );
}

export async function closePanel(page: Page, name: string) {
  const button = page.getByRole("button", {
    name: `Close ${name}`,
    exact: true,
  });
  if (await button.isVisible()) await button.click();
}

export async function openLayers(page: Page) {
  const trigger = page.getByTestId("ed-add-entry-layers");
  if ((await trigger.getAttribute("aria-pressed")) !== "true")
    await trigger.click();
  await expect(
    page.getByRole("tree", { name: "Layers of this page" }),
  ).toBeVisible();
  return page.getByRole("treeitem");
}

export async function addHeading(page: Page, text: string) {
  await page.getByTestId("ed-add-entry-text").click();
  await page.getByTestId("text-preset-heading").click();
  await expect(canvasText(page)).toBeAttached();
  await page.keyboard.insertText(text);
  await page.keyboard.press("Escape");
  await closePanel(page, "Text");
}

export async function expectSaved(page: Page) {
  await expect(page.getByTestId("ed-topbar").getByRole("status")).toContainText(
    "Saved on this device",
    { timeout: 20000 },
  );
}
