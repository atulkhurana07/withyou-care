import { test, expect } from "@playwright/test";
test("compiled Flutter client authenticates and sees the shared approved plan", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/care-app/index.html");
  // Flutter exposes this bootstrap control outside the viewport until semantics are enabled.
  await page
    .getByRole("button", { name: "Enable accessibility" })
    .dispatchEvent("click");
  await page.getByRole("textbox", { name: "Email address" }).click();
  await page.keyboard.type("patient@withyou.test");
  await page.getByRole("textbox", { name: "Password", exact: true }).click();
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.keyboard.type("WithYouDemo2026!", { delay: 30 });
  await page.keyboard.press("Tab");
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("button", { name: "Care updates" })).toBeVisible({
    timeout: 15000,
  });
  await expect(
    page.getByRole("button", { name: "View source report" }).first(),
  ).toBeVisible();
  if (await page.getByRole("button", { name: "Undo", exact: true }).count()) {
    await page
      .getByRole("button", { name: "Undo", exact: true })
      .first()
      .click();
  }
  await page
    .getByRole("button", { name: "Complete", exact: true, disabled: false })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Undo", exact: true }).first(),
  ).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/flutter-today.png" });
  await page.getByRole("button", { name: "Care updates" }).click();
  await expect(page.getByRole("alertdialog")).toContainText("Care updates");
  await page.screenshot({ path: "docs/screenshots/flutter-reminder.png" });
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.getByRole("tab", { name: "Requests", exact: true }).click();
  await expect(
    page.getByRole("group", { name: /^Prescriptions & appointments Upload/ }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/flutter-prescription-requests.png",
  });
});
