import { demoStart, demoEnd } from "./dates";
import { test, expect } from "@playwright/test";
import { auth, db } from "../../apps/website/src/lib/firebase";
const origin = "http://127.0.0.1:3000";
async function signIn(request: any, email: string) {
  const response = await request.post("/api/session", {
    data: { email, password: "WithYouDemo2026!" },
    headers: { origin },
  });
  expect(response.status()).toBe(200);
}
test("registration, duplicate review, tenant isolation, approval gates, immutable reports and replay prevention", async ({
  request,
}) => {
  await signIn(request, "reception@withyou.test");
  const patient = {
    name: `Synthetic Patient ${Date.now()}`,
    age: 40,
    phone: "",
    language: "English",
    invitationOptIn: false,
  };
  const registration = await request.post("/api/patients", {
    data: patient,
    headers: { origin },
  });
  expect(registration.status()).toBe(200);
  const p = await registration.json();
  expect(p.encounterId).toBeTruthy();
  const duplicate = await request.post("/api/patients", {
    data: patient,
    headers: { origin },
  });
  expect(duplicate.status()).toBe(409);
  const invitation = await request.post("/api/invitations", {
    data: { patientId: p.id },
    headers: { origin },
  });
  expect(invitation.status()).toBe(409);
  const uid = "isolation-doctor";
  try {
    await auth.createUser({
      uid,
      email: "isolated@withyou.test",
      password: "WithYouDemo2026!",
    });
  } catch {}
  await db
    .collection("members")
    .doc(uid)
    .set({ tenantId: "isolation-clinic", role: "doctor" });
  await db.collection("organizations").doc("isolation-clinic").set({
    id: "isolation-clinic",
    name: "Synthetic Isolation Clinic",
    state: "trial_active",
  });
  await signIn(request, "isolated@withyou.test");
  const foreign = await request.post("/api/reports", {
    data: {
      patientId: "kamla-devi",
      notes: "",
      medicine: {
        name: "Synthetic medicine",
        strength: "demo",
        dose: "demo",
        route: "documented",
        frequency: "twice daily",
        times: "08:00, 20:00",
        start: demoStart,
        end: demoEnd,
        food: "",
      },
      followUp: "",
      followUpDate: "",
      followUpTime: "",
    },
    headers: { origin },
  });
  expect(foreign.status()).toBe(404);
  await signIn(request, "doctor@withyou.test");
  const invalid = await request.post("/api/reports", {
    data: {
      patientId: "kamla-devi",
      notes: "",
      medicine: {
        name: "Synthetic medicine",
        strength: "demo",
        dose: "demo",
        route: "documented",
        frequency: "BD",
        times: "",
        start: demoStart,
        end: demoEnd,
        food: "",
      },
      followUp: "",
      followUpDate: "",
      followUpTime: "",
    },
    headers: { origin },
  });
  expect(invalid.status()).toBe(200);
  const r = await invalid.json();
  expect(r.candidates[0].status).toBe("needs_clarification");
  expect(
    (
      await request.post(`/api/reports/${r.id}/review`, {
        data: { id: r.candidates[0].id, action: "verified" },
        headers: { origin },
      })
    ).status(),
  ).toBe(400);
  expect(
    (
      await request.post(`/api/reports/${r.id}/publish`, {
        data: {},
        headers: { origin },
      })
    ).status(),
  ).toBe(409);
  const medicine = {
    name: "Synthetic medicine",
    strength: "demo",
    dose: "demo",
    route: "documented",
    frequency: "twice daily",
    times: "08:00, 20:00",
    start: demoStart,
    end: demoEnd,
    food: "",
  };
  expect(
    (
      await request.post(`/api/reports/${r.id}/review`, {
        data: { id: r.candidates[0].id, action: "edit", medicine },
        headers: { origin },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.post(`/api/reports/${r.id}/review`, {
        data: { id: r.candidates[0].id, action: "verified" },
        headers: { origin },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.post(`/api/reports/${r.id}/publish`, {
        data: {},
        headers: { origin },
      })
    ).status(),
  ).toBe(200);
  expect(
    (
      await request.post(`/api/reports/${r.id}/review`, {
        data: { id: r.candidates[0].id, action: "rejected" },
        headers: { origin },
      })
    ).status(),
  ).toBe(409);
  expect(
    (
      await request.post(`/api/reports/${r.id}/publish`, {
        data: {},
        headers: { origin },
      })
    ).status(),
  ).toBe(409);
  const currentTasks = (
    await db
      .collection("organizations")
      .doc("demo-clinic")
      .collection("tasks")
      .where("reportId", "==", r.id)
      .get()
  ).docs;
  expect(currentTasks.length).toBe(6);
  expect(new Set(currentTasks.map((t) => t.data().start)).size).toBe(3);
  await signIn(request, "reception@withyou.test");
  const inv = await request.post("/api/invitations", {
    data: { patientId: "kamla-devi" },
    headers: { origin },
  });
  expect(inv.status()).toBe(200);
  const i = await inv.json();
  await signIn(request, "patient@withyou.test");
  const claim = () =>
    request.post("/api/claim", {
      data: { token: i.token, tenantId: i.tenantId },
      headers: { origin },
    });
  expect((await claim()).status()).toBe(200);
  expect((await claim()).status()).toBe(409);
  await request.post("/api/sign-out", { data: {}, headers: { origin } });
  expect((await request.get(`/api/reports/${r.id}/pdf`)).status()).toBe(401);
});
