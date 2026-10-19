import { expect, test } from "@playwright/test";

test("enter the studio from the landing page and open a blank design", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /Invalid hook call/.test(message.text())) {
      errors.push(message.text());
    }
  });

  await page.goto("/");
  await page.getByRole("link", { name: "Open studio", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("textbox", { name: "Your name" }).fill("Studio preview");
  await page.getByRole("button", { name: "Enter your studio" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("button", { name: "Create a design", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Start with a fresh canvas" }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Project name" })).toBeEditable();
  expect(errors).toEqual([]);
});
