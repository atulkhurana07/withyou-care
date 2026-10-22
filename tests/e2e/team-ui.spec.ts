import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("administrator team controls and invited account screens are accessible", async ({
  page,
  browser,
}) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill("admin@withyou.test");
  await page.getByLabel("Password", { exact: true }).fill("WithYouDemo2026!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/portal/);
  await page.goto("/portal/team");
  await page.getByLabel("Staff name").fill("Invited Doctor");
  await page
    .getByLabel("Staff email")
    .fill(`ui-doctor-${Date.now()}@withyou.test`);
  await page.getByRole("button", { name: "Invite team member" }).click();
  await expect(
    page.getByRole("link", { name: "Open invitation" }),
  ).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({
    path: "docs/screenshots/team-access.png",
    fullPage: true,
  });
  const link = await page
    .getByRole("link", { name: "Open invitation" })
    .getAttribute("href");
  const context = await browser.newContext();
  const invited = await context.newPage();
  await invited.goto(link!);
  expect(
    (
      await new AxeBuilder({ page: invited })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await invited.screenshot({
    path: "docs/screenshots/invited-account.png",
    fullPage: true,
  });
  await context.close();
});
