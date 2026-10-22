import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { db } from "../../apps/website/src/lib/firebase";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
test("own organization registration, checkout validation, durable activation and resume", async ({
  page,
}) => {
  const email = `owner-${Date.now()}@withyou.test`;
  await page.goto("/start");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Organization name", { exact: true })
    .fill("Integration Care Clinic");
  await page.getByLabel("Official email").fill(email);
  await page.getByLabel("Administrator’s full name").fill("Integration Owner");
  await page.getByLabel("Contact phone").fill("+919876543210");
  await page.getByLabel("Organization address").fill("Test street, Bengaluru");
  await page.getByLabel("Create your password").fill("IntegrationPass2026!");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create account & continue" }).click();
  await expect(
    page.getByRole("heading", { name: "Activate your subscription." }),
  ).toBeVisible();
  const mailbox = "apps/website/.local-mail";
  const previews = await Promise.all(
    (await readdir(mailbox)).map(async (filename) =>
      JSON.parse(await readFile(join(mailbox, filename), "utf8")),
    ),
  );
  expect(
    previews.some(
      (message) =>
        message.to === email && message.status === "preview_available",
    ),
  ).toBeTruthy();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Activate your subscription." }),
  ).toBeVisible();
  await expect(
    page.getByText("Integration Care Clinic", { exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({
    path: "docs/screenshots/subscription-card-mobile.png",
    fullPage: true,
  });
  await page.getByLabel("Cardholder name").fill("Integration Owner");
  await page.getByLabel("Card number").fill("4242424242424242");
  await page.getByLabel("Expiry", { exact: true }).fill("12/35");
  await page.getByLabel("Security code").fill("123");
  await page
    .getByRole("button", { name: "Activate subscription", exact: true })
    .click();
  await expect(page.locator("main [role=alert]")).toContainText(
    "designated development card",
  );
  await page.getByLabel("Card number").fill("4111111111111111");
  const activation = page.waitForRequest((r) =>
    r.url().endsWith("/api/checkout/activate"),
  );
  await page
    .getByRole("button", { name: "Activate subscription", exact: true })
    .click();
  expect(Object.keys((await activation).postDataJSON()).sort()).toEqual([
    "idempotencyKey",
    "paymentToken",
  ]);
  await expect(
    page.getByRole("heading", { name: "Your subscription is active." }),
  ).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({
    path: "docs/screenshots/subscription-active.png",
    fullPage: true,
  });
  const org = (
    await db.collection("organizations").where("email", "==", email).get()
  ).docs[0];
  expect(org.data().state).toBe("active");
  const sub = (
    await org.ref.collection("subscriptions").doc("current").get()
  ).data()!;
  expect(sub.chargedAmount).toBe(0);
  expect(sub.chargeStatus).toBe("not_charged");
  const rawCard = await page.request.post("/api/checkout/activate", {
    data: {
      paymentToken: "visa-success",
      idempotencyKey: crypto.randomUUID(),
      cardNumber: "4111111111111111",
    },
    headers: { origin: "http://127.0.0.1:3000" },
  });
  expect(rawCard.status()).toBe(400);
  const replay = await page.request.post("/api/checkout/activate", {
    data: { paymentToken: "visa-success", idempotencyKey: crypto.randomUUID() },
    headers: { origin: "http://127.0.0.1:3000" },
  });
  expect(replay.status()).toBe(200);
  expect(
    (await org.ref.collection("subscriptions").doc("current").get()).data()!
      .startedAt,
  ).toBe(sub.startedAt);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Make yourself at home." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Finish setup" }).click();
  await expect(page).toHaveURL(/\/portal$/);
  await expect(
    page.getByRole("heading", { name: "Your organization, connected." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Manage team access" }).click();
  await expect(page.getByLabel("Staff name")).toBeVisible();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Finish setup" }),
  ).toBeVisible();
});
