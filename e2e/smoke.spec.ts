import { test, expect } from "@playwright/test";

test("앱이 띄워지고 홈 페이지를 로드한다", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Create Next App/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
