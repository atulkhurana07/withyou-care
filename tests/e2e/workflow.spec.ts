import { demoStart, demoEnd } from "./dates";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function login(page: any, role: string) {
  await page.goto("/sign-in");
  const emails: Record<string, string> = {
    Doctor: "doctor@withyou.test",
    Receptionist: "reception@withyou.test",
    Administrator: "admin@withyou.test",
    Patient: "patient@withyou.test",
  };
  await page.getByLabel("Email address", { exact: true }).fill(emails[role]);
  await page.getByLabel("Password", { exact: true }).fill("WithYouDemo2026!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(role === "Patient" ? /\/care/ : /\/portal/, {
    timeout: 15000,
  });
}
test("marketing is responsive and accessible, previews and navigation work", async ({
  page,
}) => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "doctor’s desk",
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBeTruthy();
  }
  await page.getByRole("tab", { name: "Patients", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toContainText("Your day");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.evaluate(() => {
    (document.activeElement as HTMLElement)?.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: "docs/screenshots/marketing-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation")).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/marketing-mobile.png",
    fullPage: true,
  });
});
test("clinician review, publication, PDF, invitation, patient completion and role restrictions", async ({
  browser,
}) => {
  const doctor = await browser.newContext();
  const dp = await doctor.newPage();
  await login(dp, "Doctor");
  await dp.goto("/portal/reports/new");
  await dp.getByLabel("Assigned patient").selectOption("kamla-devi");
  await dp.getByLabel("Medicine name").fill("Synthetic medicine");
  await dp.getByLabel("Strength", { exact: true }).fill("demo strength");
  await dp.getByLabel("Prescribed dose & unit").fill("demo unit");
  await dp.getByLabel("Route", { exact: true }).fill("documented route");
  await dp.getByLabel("Frequency", { exact: true }).fill("twice daily");
  await dp
    .getByLabel("Approved reminder times", { exact: false })
    .fill("08:00, 20:00");
  await dp.getByLabel("Start date", { exact: true }).fill(demoStart);
  await dp.getByLabel("End date", { exact: true }).fill(demoEnd);
  await dp.getByRole("button", { name: "Save report & review tasks" }).click();
  await expect(
    dp.getByRole("button", { name: "Approve & publish" }),
  ).toBeDisabled();
  const reportId = new URL(dp.url()).pathname.split("/").pop()!;
  await dp.getByRole("button", { name: "Verify", exact: true }).click();
  await expect(
    dp.getByRole("button", { name: "Approve & publish" }),
  ).toBeEnabled();
  await dp.getByRole("button", { name: "Approve & publish" }).click();
  await expect(
    dp.getByText("Published instructions are locked.", { exact: false }),
  ).toBeVisible();
  const pdf = await dp.request.get(`/api/reports/${reportId}/pdf`);
  expect(pdf.status()).toBe(200);
  expect((await pdf.body()).subarray(0, 4).toString()).toBe("%PDF");
  await dp.screenshot({
    path: "docs/screenshots/review-desktop.png",
    fullPage: true,
  });
  const reception = await browser.newContext();
  const rp = await reception.newPage();
  await login(rp, "Receptionist");
  const forbidden = await rp.request.post(`/api/reports/${reportId}/publish`, {
    data: {},
    headers: { origin: "http://127.0.0.1:3000" },
  });
  expect(forbidden.status()).toBe(403);
  await rp.goto("/portal/patients/kamla-devi");
  await rp.getByRole("button", { name: "Create invitation preview" }).click();
  await expect(rp.getByText("Email preview available")).toBeVisible();
  const link = await rp.locator(".source-text").innerText();
  const patient = await browser.newContext();
  const pp = await patient.newPage();
  await login(pp, "Patient");
  await pp.goto(link);
  await pp.getByRole("button", { name: "Already have an account? Sign in" }).click();
  await pp.getByLabel("Invited email").fill("patient@withyou.test");
  await pp.getByLabel("Password", {exact:true}).fill("WithYouDemo2026!");
  await pp.getByRole("button", {name:"Sign in & accept invitation"}).click();
  await expect(pp).toHaveURL(/\/care/);
  await expect(pp.getByText("Synthetic medicine").first()).toBeVisible();
  await pp
    .getByRole("button", { name: "Complete", exact: true })
    .first()
    .click();
  await expect(
    pp.getByText("completed", { exact: true }).first(),
  ).toBeVisible();
  await pp.reload();
  await expect(
    pp.getByText("completed", { exact: true }).first(),
  ).toBeVisible();
  const unauthorized = await pp.request.post("/api/patients", {
    data: {},
    headers: { origin: "http://127.0.0.1:3000" },
  });
  expect(unauthorized.status()).toBe(403);
  await pp.getByRole("button", { name: "Preview a private reminder" }).click();
  await expect(pp.getByRole("status")).toContainText("Open the app");
  const axe = await new AxeBuilder({ page: pp })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(axe.violations).toEqual([]);
  await pp.screenshot({
    path: "docs/screenshots/patient-care.png",
    fullPage: true,
  });
  await doctor.close();
  await reception.close();
  await patient.close();
});
