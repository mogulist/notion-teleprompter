import { test, expect } from "@playwright/test";

test("미인증 시 /controller에서 Notion과 연결하기 버튼만 보인다", async ({
  page,
}) => {
  await page.goto("/controller");
  await expect(
    page.getByRole("link", { name: "Notion과 연결하기" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "컨트롤러" })).toBeVisible();
});

test.skip(
  !process.env.NOTION_CLIENT_ID,
  "Notion과 연결하기 클릭 시 Notion OAuth 페이지로 이동한다",
  async ({ page }) => {
    await page.goto("/controller");
    const connectButton = page.getByRole("link", {
      name: "Notion과 연결하기",
    });
    await expect(connectButton).toBeVisible();
    await connectButton.click();
    await expect(page).toHaveURL(/api\.notion\.com\/v1\/oauth\/authorize/);
  }
);

test("인증 시 Database ID 입력 → 목록 불러오기 → 항목 클릭 → 상세 영역에 내용이 표시된다", async ({
  page,
  context,
}) => {
  await context.addCookies([
    {
      name: "notion_access_token",
      value: "e2e-dummy-token",
      domain: "localhost",
      path: "/",
    },
  ]);

  await page.route("**/api/notion/databases/*/query", (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: [
            {
              id: "page-e2e-1",
              properties: {
                title: {
                  title: [{ plain_text: "E2E 테스트 페이지" }],
                },
              },
            },
          ],
          next_cursor: null,
          has_more: false,
        }),
      });
    } else {
      route.continue();
    }
  });

  await page.route("**/api/notion/blocks/*", (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          results: [
            {
              type: "paragraph",
              id: "block-e2e-1",
              paragraph: {
                rich_text: [{ plain_text: "E2E 상세 내용" }],
              },
            },
          ],
        }),
      });
    } else {
      route.continue();
    }
  });

  await page.goto("/controller");
  await expect(page.getByRole("heading", { name: "컨트롤러" })).toBeVisible();
  await expect(
    page.getByPlaceholder("Notion Database ID")
  ).toBeVisible();

  await page.getByPlaceholder("Notion Database ID").fill("test-db-id");
  await page.getByRole("button", { name: "목록 불러오기" }).click();

  await expect(
    page.getByRole("button", { name: "E2E 테스트 페이지" })
  ).toBeVisible();

  await page.getByRole("button", { name: "E2E 테스트 페이지" }).click();

  await expect(
    page.getByText("E2E 상세 내용", { exact: true })
  ).toBeVisible();
});
