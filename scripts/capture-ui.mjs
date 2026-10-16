import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
for (const [name, width, height] of [
  ["desktop", 1440, 1000],
  ["mobile", 390, 844],
]) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (error) => console.log(name, "ERROR", error.message));
  for (const [route, label] of [
    ["/", "landing"],
    ["/dashboard", "dashboard"],
    ["/templates", "templates"],
    ["/editor/welcome-bloom", "editor"],
  ]) {
    await page.goto(`http://localhost:3100${route}`, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    if (label === "dashboard")
      await page.locator(".project-card").first().waitFor();
    if (label === "editor")
      await page
        .locator(".konvajs-content canvas")
        .first()
        .waitFor({ timeout: 30000 });
    await page.screenshot({
      path: `artifacts/${name}-${label}.png`,
      fullPage: true,
    });
    console.log(
      name,
      label,
      await page.evaluate(() => ({
        width: innerWidth,
        scroll: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
      })),
    );
  }
  await page.close();
}
await browser.close();
