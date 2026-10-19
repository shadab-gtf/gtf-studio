import { test, expect } from "@playwright/test";
import {
  addHeading,
  closePanel,
  expectSaved,
  openLayers,
  waitForEditor,
} from "./helpers/editor";

test("create a design from the dashboard, edit it, and reopen it from projects", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/dashboard");
  await page
    .getByRole("button", { name: "Create a design", exact: true })
    .click();
  await page
    .getByLabel("Project name", { exact: true })
    .fill("Browser test design");
  await page
    .getByRole("button", { name: "Create design", exact: true })
    .click();
  await expect(page).toHaveURL(/\/editor\//);
  await waitForEditor(page);
  await addHeading(page, "An idea worth keeping");
  await expect(
    (await openLayers(page)).filter({ hasText: "An idea worth keeping" }),
  ).toBeVisible();
  await closePanel(page, "Layers");
  await expectSaved(page);
  await page.goto("/projects");
  await page.getByRole("link", { name: "Edit Browser test design" }).click();
  await waitForEditor(page);
  await expect(
    (await openLayers(page)).filter({ hasText: "An idea worth keeping" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("browse categories, create a ten-slide deck, and present", async ({
  page,
}) => {
  await page.goto("/templates");
  await page.getByRole("button", { name: "Presentation", exact: true }).click();
  await page.getByRole("button", { name: /Creative Brief/ }).click();
  await expect(page.getByRole("dialog")).toContainText("10 pages");
  await page.getByRole("button", { name: "Make it yours" }).click();
  await waitForEditor(page);
  await expect(page.getByTestId("ed-pages-text")).toContainText("10");
  await page.getByTestId("ed-share").click();
  await page
    .getByRole("menuitem", { name: "Present full screen", exact: true })
    .click();
  const presenter = page.getByRole("dialog", {
    name: "Presentation",
    exact: true,
  });
  await expect(presenter).toBeVisible();
  await presenter
    .getByRole("button", { name: "Next page", exact: true })
    .click();
  await expect(page.getByTestId("present-counter")).toContainText("2 / 10");
  await presenter
    .getByRole("button", { name: "Exit presentation", exact: true })
    .click();
  await expect(presenter).not.toBeVisible();
});
