import { test, expect } from "@playwright/test";

test.use({
  baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
});

test("compact expiry advances checkout and invalid details remain blocked", async ({
  page,
}) => {
  const activations: unknown[] = [];
  await page.route("**/api/public/config", (route) =>
    route.fulfill({ json: { checkoutAvailable: true } }),
  );
  await page.route("**/api/workspace", (route) =>
    route.fulfill({
      json: {
        member: { role: "admin" },
        organization: {
          name: "Expiry Test Hospital",
          plan: "Hospital",
          state: "pending_checkout",
        },
      },
    }),
  );
  await page.route("**/api/checkout/activate", (route) => {
    activations.push(route.request().postDataJSON());
    return route.fulfill({ json: { success: true } });
  });
  await page.goto("/start");
  await page.getByLabel("Cardholder name").fill("Atul");
  await page.getByLabel("Card number").fill("4111111111111111");
  await page.getByLabel("Security code").fill("123");
  const expiry = page.getByLabel("Expiry", { exact: true });
  const activate = page.getByRole("button", {
    name: "Activate subscription",
    exact: true,
  });

  for (const invalid of ["1329", "0100", "112"]) {
    await expiry.fill(invalid);
    await activate.click();
    await expect(page.locator("main [role=alert]")).toContainText(
      "valid expiry",
    );
    expect(activations).toHaveLength(0);
  }

  const futureYear = String((new Date().getFullYear() + 3) % 100).padStart(
    2,
    "0",
  );
  await expiry.fill(`11/${futureYear}`);
  await expect(expiry).toHaveValue(`11/${futureYear}`);
  await expiry.fill("");
  await expiry.pressSequentially(`11${futureYear}`);
  await expect(expiry).toHaveValue(`11/${futureYear}`);
  await page.getByLabel("Security code").fill("12");
  await activate.click();
  await expect(page.locator("main [role=alert]")).toContainText(
    "three-digit security code",
  );
  expect(activations).toHaveLength(0);

  await page.getByLabel("Security code").fill("123");
  await activate.click();
  await expect(
    page.getByRole("heading", { name: "Your subscription is active." }),
  ).toBeVisible();
  expect(activations).toHaveLength(1);
  expect(Object.keys(activations[0] as object).sort()).toEqual([
    "idempotencyKey",
    "paymentToken",
  ]);
  await page.getByRole("button", { name: "Set up workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Make yourself at home." }),
  ).toBeVisible();
});
