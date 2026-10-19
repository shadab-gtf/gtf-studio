import { test, expect } from "@playwright/test";
import { addHeading, waitForEditor } from "./helpers/editor";

test("a view-only share link stores the design and renders it chrome-free on another device", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/dashboard");
  await page
    .getByRole("button", { name: "Create a design", exact: true })
    .click();
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Short link smoke");
  await page
    .getByRole("button", { name: "Create design", exact: true })
    .click();
  await expect(page).toHaveURL(/\/editor\//);
  await waitForEditor(page);
  await addHeading(page, "Short link headline");

  await page.getByTestId("ed-share").click();
  await page.getByRole("menuitem", { name: /Share with people/ }).click();
  await expect(page.getByTestId("share-dialog")).toBeVisible();
  await page.getByTestId("share-create").click();

  const linkInput = page.getByTestId("share-link").locator("input").first();
  await expect(linkInput).toBeVisible({ timeout: 30000 });
  const url = await linkInput.inputValue();
  console.log("SHARE_URL:", url);
  // With the blob store configured, the link must be the short stored form.
  expect(url).toContain("/view/s/");
  expect(url).not.toContain("#d=");

  // Open the short link in a fresh browser (no project in its storage) — only the blob can supply the design.
  const guest = await page.context().browser()!.newContext();
  const viewer = await guest.newPage();
  await viewer.goto(url);
  await expect(viewer.locator("svg image").first()).toBeVisible({ timeout: 30000 });
  expect(await viewer.locator("header").count()).toBe(0);
  await guest.close();

  expect(errors).toEqual([]);
});
