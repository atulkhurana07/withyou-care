import { test, expect } from "@playwright/test";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { auth, db, cloudFirebase } from "../../apps/website/src/lib/firebase";
const headers = { origin: "http://127.0.0.1:3000" };
test("a clearer prescription replaces only its own clarification request and retains history", async ({
  request,
}) => {
  expect(cloudFirebase).toBe(false);
  const patientEmail = `replacement-${crypto.randomUUID()}@withyou.test`;
  const user = await auth.createUser({
    email: patientEmail,
    password: "WithYouDemo2026!",
  });
  await db
    .collection("members")
    .doc(user.uid)
    .set({ tenantId: "demo-clinic", role: "patient", patientId: user.uid });
  await db
    .collection("organizations")
    .doc("demo-clinic")
    .collection("patients")
    .doc(user.uid)
    .set({
      name: "Synthetic replacement patient",
      accountUid: user.uid,
      doctorId: "demo-doctor",
      activityRevision: 0,
    });
  async function login(email: string) {
    expect(
      (
        await request.post("/api/session", {
          headers,
          data: { email, password: "WithYouDemo2026!" },
        })
      ).status(),
    ).toBe(200);
  }
  async function upload(suffix: string, replacementId?: string) {
    const pdf = await PDFDocument.create();
    pdf.addPage().drawText(`FICTIONAL ${suffix} ${Date.now()}`, { size: 12 });
    const result = await request.post("/api/intake/upload", {
      headers,
      multipart: {
        file: {
          name: "fictional.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from(await pdf.save()),
        },
        consent: "true",
        belongsToMe: "true",
        ...(replacementId ? { replacementId } : {}),
      },
    });
    expect(result.status(), await result.text()).toBe(200);
    return (await result.json()).id;
  }
  await login(patientEmail);
  const originalId = await upload("unclear");
  await login("doctor@withyou.test");
  expect(
    (
      await request.post(`/api/intake/${originalId}/review`, {
        headers,
        data: {
          revision: 1,
          summary: "Please provide a clearer source page.",
          outcome: "request_reupload",
          identityChecked: true,
          sourceChecked: true,
        },
      })
    ).status(),
  ).toBe(200);
  await login(patientEmail);
  const replacementId = await upload("clear replacement", originalId);
  const items = (await (await request.get("/api/intake/list")).json()).items;
  expect(items.find((item: any) => item.id === originalId).state).toBe(
    "replaced",
  );
  expect(
    items.find((item: any) => item.id === originalId).replacementRequestId,
  ).toBe(replacementId);
  expect(
    items.find((item: any) => item.id === replacementId).replacesRequestId,
  ).toBe(originalId);
  expect(items.find((item: any) => item.id === replacementId).state).toBe(
    "awaiting_review",
  );
});
test("patient upload, clinician clarification, recipient confirmation and allocated appointment stay connected", async ({
  request,
  page,
}) => {
  // Each run has its own upload quota and appointment records.
  const patientId = `intake-test-${Date.now()}`;
  const patientEmail = `${patientId}@withyou.test`;
  await auth.createUser({
    uid: patientId,
    email: patientEmail,
    password: "WithYouDemo2026!",
  });
  await db
    .collection("members")
    .doc(patientId)
    .set({ tenantId: "demo-clinic", role: "patient", patientId });
  await db
    .collection("organizations")
    .doc("demo-clinic")
    .collection("patients")
    .doc(patientId)
    .set({
      id: patientId,
      tenantId: "demo-clinic",
      name: "Synthetic APK Verification Patient",
      age: 40,
      phone: "",
      language: "English",
      doctorId: "demo-doctor",
      accountUid: patientId,
      state: "waiting",
    });
  async function login(email: string) {
    if (email === "patient@withyou.test") email = patientEmail;
    const r = await request.post("/api/session", {
      headers,
      data: { email, password: "WithYouDemo2026!" },
    });
    expect(r.status()).toBe(200);
  }
  async function post(path: string, data: unknown, status = 200) {
    const r = await request.post(`/api/intake/${path}`, { headers, data });
    expect(r.status(), await r.text()).toBe(status);
    return r.json();
  }
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  pdf
    .addPage()
    .drawText(`FICTIONAL PRESCRIPTION - ${Date.now()} - Kamla Devi`, {
      font,
      size: 14,
    });
  const buffer = Buffer.from(await pdf.save());
  await login("patient@withyou.test");
  const uploaded = await request.post("/api/intake/upload", {
    headers,
    multipart: {
      file: { name: "synthetic.pdf", mimeType: "application/pdf", buffer },
      consent: "true",
      belongsToMe: "true",
    },
  });
  expect(uploaded.status(), await uploaded.text()).toBe(200);
  const id = (await uploaded.json()).id;
  const duplicate = await request.post("/api/intake/upload", {
    headers,
    multipart: {
      file: { name: "same.pdf", mimeType: "application/pdf", buffer },
      consent: "true",
      belongsToMe: "true",
    },
  });
  expect((await duplicate.json()).duplicate).toBe(true);
  await post(
    `${id}/book`,
    {
      revision: 1,
      preferredAt: new Date(Date.now() + 86400000).toISOString(),
      reason: "",
      contactConfirmed: true,
    },
    409,
  );
  await post(
    `${id}/review`,
    {
      revision: 1,
      summary: "Fake approval",
      outcome: "ask_patient",
      identityChecked: true,
      sourceChecked: true,
    },
    403,
  );
  await login("reception@withyou.test");
  expect((await request.get(`/api/intake/${id}/file`)).status()).toBe(403);
  await login("doctor@withyou.test");
  expect((await request.get(`/api/intake/${id}/file`)).status()).toBe(200);
  await post(`${id}/read`, { revision: 1 }, 503);
  await post(`${id}/review`, {
    revision: 1,
    summary:
      "One instruction is unclear. Please confirm the wording with your clinic.",
    outcome: "ask_patient",
    identityChecked: true,
    sourceChecked: true,
  });
  await login("patient@withyou.test");
  await post(`${id}/patient-response`, {
    revision: 2,
    correct: false,
    comment: "The date is not readable.",
  });
  await login("doctor@withyou.test");
  await post(`${id}/review`, {
    revision: 3,
    summary:
      "Original checked with patient. No treatment changes are authorized by this reading.",
    outcome: "ask_patient",
    identityChecked: true,
    sourceChecked: true,
  });
  await post(
    `${id}/review`,
    {
      revision: 3,
      summary: "Stale change",
      outcome: "ask_patient",
      identityChecked: true,
      sourceChecked: true,
    },
    409,
  );
  await login("patient@withyou.test");
  await post(`${id}/patient-response`, {
    revision: 4,
    correct: true,
    comment: "",
  });
  const when = new Date(
    Math.ceil((Date.now() + 86400000) / 1800000) * 1800000,
  ).toISOString();
  await post(`${id}/book`, {
    revision: 5,
    preferredAt: when,
    reason: "Follow-up",
    contactConfirmed: true,
  });
  await post(
    `${id}/confirm`,
    { revision: 6, scheduledAt: when, location: "Test clinic" },
    403,
  );
  await login("reception@withyou.test");
  const receptionList = await (await request.get("/api/intake/list")).json();
  const metadata = receptionList.items.find((item: any) => item.id === id);
  expect(metadata.reviewSummary).toBeUndefined();
  await post(`${id}/confirm`, {
    revision: 6,
    scheduledAt: when,
    location: "Synthetic clinic, room 1",
  });
  await login("patient@withyou.test");
  let item = (await (await request.get("/api/intake/list")).json()).items.find(
    (item: any) => item.id === id,
  );
  expect(item.state).toBe("confirmed");
  expect(item.deliveryStatus).toBe("available_in_app");
  expect(item.objectPath).toBeUndefined();
  const secondPdf = await PDFDocument.create();
  secondPdf
    .addPage()
    .drawText(`FICTIONAL SECOND DOCUMENT ${Date.now()}`, { size: 12 });
  const secondUpload = await request.post("/api/intake/upload", {
    headers,
    multipart: {
      file: {
        name: "second.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from(await secondPdf.save()),
      },
      consent: "true",
      belongsToMe: "true",
    },
  });
  expect(secondUpload.status()).toBe(200);
  const secondId = (await secondUpload.json()).id;
  await login("doctor@withyou.test");
  await post(`${secondId}/review`, {
    revision: 1,
    summary: "Fictional source checked.",
    outcome: "ask_patient",
    identityChecked: true,
    sourceChecked: true,
  });
  await login("patient@withyou.test");
  await post(`${secondId}/patient-response`, {
    revision: 2,
    correct: true,
    comment: "",
  });
  await post(`${secondId}/book`, {
    revision: 3,
    preferredAt: when,
    reason: "",
    contactConfirmed: true,
  });
  await login("reception@withyou.test");
  await post(
    `${secondId}/confirm`,
    { revision: 4, scheduledAt: when, location: "Synthetic room" },
    409,
  );
  await login("patient@withyou.test");
  await post(`${secondId}/cancel`, { revision: 4 });
  await post(`${id}/cancel`, { revision: 7 });
  item = (await (await request.get("/api/intake/list")).json()).items.find(
    (item: any) => item.id === id,
  );
  expect(item.state).toBe("cancelled");
  // The staff UI exposes the actual queue and source download.
  await page.goto("/sign-in");
  await page.getByLabel("Email address").fill("doctor@withyou.test");
  await page.getByLabel("Password", { exact: true }).fill("WithYouDemo2026!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForURL(/portal/);
  await page.goto("/portal/requests");
  await expect(
    page.getByRole("heading", {
      name: "Prescription requests & appointments",
      exact: true,
      level: 2,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Download original prescription" }).first(),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/prescription-review-queue.png",
    fullPage: true,
  });
});
